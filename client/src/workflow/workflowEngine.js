import {
  PIPELINE_STAGE_DEFS,
  STAGE_TO_WORKER_ROLE,
  resolveStageKeysForJob,
  getStageLabelFromDef,
} from "./workflowConstants";
import {
  emitWorkflowChanged,
  findWorkflowJob,
  getWorkflowJobByTrackingId,
  getWorkflowJobByWorkMongoId,
  loadWorkflowJobs,
  saveWorkflowJobs,
  upsertWorkflowJob,
} from "./workflowStorage";
import { sanitizeWorkflowJob } from "./workflowSanitize";
import {
  applyWorkStatusToStages,
  extractAssigneesFromWork,
  workStatusForCompletedStages,
} from "./workflowWorkSync";

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `wf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyStage() {
  return { state: "pending", assignedTo: null, completedAt: null, completedBy: null };
}

function initStages(stageKeys) {
  const stages = {};
  (stageKeys || [])
    .filter((k) => k != null && String(k).trim() !== "")
    .forEach((k) => {
      stages[k] = emptyStage();
    });
  return stages;
}

export function getActiveStageKey(job) {
  const keys = (job?.stageKeys || []).filter(
    (k) => k != null && String(k).trim() !== "",
  );
  if (!keys.length) return null;
  const active = keys.find((k) => job.stages?.[k]?.state === "active");
  if (active) return active;
  const pending = keys.find((k) => job.stages?.[k]?.state === "pending");
  return pending || keys[keys.length - 1];
}

export function deriveAssignmentStatus(job) {
  const activeKey = getActiveStageKey(job);
  const assignee = job.stages?.[activeKey]?.assignedTo;
  return assignee?.name ? "assigned" : "unassigned";
}

export function deriveLifecycleStatus(job) {
  const keys = (job.stageKeys || []).filter(
    (k) => k != null && String(k).trim() !== "",
  );
  if (!keys.length) return "open";
  const allDone = keys.every((k) => job.stages?.[k]?.state === "completed");
  return allDone ? "completed" : "open";
}

export function recomputeJobMeta(job) {
  const base = sanitizeWorkflowJob(job) || job;
  const activeKey = getActiveStageKey(base);
  return {
    ...base,
    assignmentStatus: deriveAssignmentStatus(base),
    lifecycleStatus: deriveLifecycleStatus(base),
    currentStageKey: activeKey,
    currentStageLabel: activeKey
      ? getStageLabelFromDef(activeKey, base?.workflowStages)
      : "In progress",
  };
}

function workToJobFields(work) {
  const order = work?.order;
  const garment = work?.garment;
  const garmentObj = typeof garment === "object" ? garment : null;
  return {
    workMongoId: work._id,
    workCode: work.workId,
    orderId: order?.orderId || "",
    orderMongoId: order?._id || order,
    customerName: order?.customer?.name || "Customer",
    garmentName: (garmentObj?.name ?? work?.garmentName) || "Garment",
    garmentId: garmentObj?.garmentId || "",
    categoryName: garmentObj?.categoryName || garmentObj?.category?.name || "",
    itemName: garmentObj?.itemName || garmentObj?.item?.name || "",
    priority: garmentObj?.priority || work?.priority || "normal",
    dueDate: work?.estimatedDelivery || order?.deliveryDate || null,
    workStatus: work?.status || "pending",
    workflowStages: order?.workflowStages || work?.workflowStages || null,
    garment,
    // ── Measurements ──────────────────────────────
    measurements: garmentObj?.measurements || [],
    measurementSource: garmentObj?.measurementSource || "template",
    measurementTemplate: garmentObj?.measurementTemplate || null,
    measurementTemplateName:
      typeof garmentObj?.measurementTemplate === "object"
        ? garmentObj.measurementTemplate?.name
        : null,
    // ── Notes / Instructions ──────────────────────
    additionalInfo: garmentObj?.additionalInfo || "",
    cuttingNotes: work?.cuttingNotes || "",
    tailorNotes: work?.tailorNotes || "",
  };
}

function pruneStagesObject(stages, stageKeys) {
  const next = {};
  (stageKeys || [])
    .filter((k) => k != null && String(k).trim() !== "")
    .forEach((k) => {
      next[k] = stages?.[k] || emptyStage();
    });
  return next;
}

function withWorkflowStages(job, stageKeys) {
  return {
    ...job,
    workflowStages: stageKeys,
    stageKeys,
    stages: pruneStagesObject(job.stages, stageKeys),
  };
}

/** Create or refresh WorkflowJob from API Work record */
export function createJobFromWork(work, boutiqueTasks = [], source = "work-sync", existingJob = null) {
  const fields = workToJobFields(work);
  const stageKeys = resolveStageKeysForJob(
    { ...existingJob, ...fields },
    boutiqueTasks,
  );
  let stages = existingJob?.stages ? { ...existingJob.stages } : initStages(stageKeys);
  stageKeys.forEach((k) => {
    if (!stages[k]) stages[k] = emptyStage();
  });

  const preserveProgress =
    existingJob &&
    existingJob.workMongoId === fields.workMongoId &&
    Object.values(existingJob.stages || {}).some((s) => s.state === "completed" || s.completedAt);

  if (!preserveProgress) {
    stages = applyWorkStatusToStages(stageKeys, initStages(stageKeys), work.status || "pending");
  }

  const assignees = extractAssigneesFromWork(work);
  Object.entries(assignees).forEach(([stageKey, assignedTo]) => {
    if (stages[stageKey] && !stages[stageKey].assignedTo) {
      stages[stageKey] = { ...stages[stageKey], assignedTo };
    }
  });

  if (!preserveProgress && stageKeys[0] && !Object.values(stages).some((s) => s.state === "active")) {
    const firstPending = stageKeys.find((k) => stages[k]?.state !== "completed") || stageKeys[0];
    stages[firstPending] = { ...stages[firstPending], state: "active" };
  }

  const job = recomputeJobMeta(
    withWorkflowStages(
      {
        id: existingJob?.id || newId(),
        workflowTrackingId:
          existingJob?.workflowTrackingId ||
          (fields.workCode ? String(fields.workCode) : null) ||
          newId(),
        ...fields,
        stages,
        source: existingJob?.source || source,
        createdAt: existingJob?.createdAt || Date.now(),
        updatedAt: Date.now(),
      },
      stageKeys,
    ),
  );

  return job;
}

/** Upsert work into store and return job */
export function upsertJobFromWork(work, boutiqueTasks = [], existingJob = null) {
  const job = createJobFromWork(work, boutiqueTasks, "work-sync", existingJob);
  upsertWorkflowJob(job);
  return job;
}

function findJobForWork(existing, work) {
  const fields = workToJobFields(work);
  return (
    existing.find((j) => j.workMongoId && j.workMongoId === work._id) ||
    existing.find((j) => j.workCode && fields.workCode && j.workCode === fields.workCode) ||
    existing.find(
      (j) =>
        j.orderMongoId &&
        fields.orderMongoId &&
        j.orderMongoId === fields.orderMongoId &&
        j.workCode === fields.workCode,
    ) ||
    null
  );
}

/** Merge API works into workflow store — real ERP works only */
export function syncWorksToWorkflowJobs(works = [], boutiqueTasks = []) {
  const existing = loadWorkflowJobs();
  const realWorks = (works || []).filter((w) => w?._id);
  const byWorkId = new Map();

  for (const work of realWorks) {
    const prev = findJobForWork(existing, work);
    const job = upsertJobFromWork(work, boutiqueTasks, prev);
    byWorkId.set(work._id, job);
  }

  const orderOnly = existing.filter((j) => {
    if (j.workMongoId) return false;
    if (!j.orderMongoId) return false;
    return !realWorks.some((w) => {
      const f = workToJobFields(w);
      return (
        (j.workCode && f.workCode && j.workCode === f.workCode) ||
        (j.orderMongoId === f.orderMongoId && j.orderId === f.orderId)
      );
    });
  });

  const merged = [...byWorkId.values(), ...orderOnly];
  saveWorkflowJobs(merged);
  emitWorkflowChanged();
  return merged;
}

/** Create job when order completes (no work yet) */
export function createJobFromOrderPayload(
  {
    orderId,
    orderMongoId,
    customerName,
    garmentName,
    garmentId,
    categoryName,
    itemName,
    priority,
    dueDate,
    workMongoId,
    workCode,
    workflowStages,
    // ── Measurements & Notes ──
    measurements,
    measurementSource,
    measurementTemplate,
    measurementTemplateName,
    additionalInfo,
    cuttingNotes,
    tailorNotes,
  },
  existingJob = null,
) {
  const fields = {
    orderId,
    orderMongoId,
    customerName,
    garmentName,
    garmentId,
    categoryName,
    itemName,
    priority: priority || "normal",
    dueDate,
    workMongoId: workMongoId || null,
    workCode: workCode || null,
    workStatus: "pending",
    workflowStages: workflowStages || existingJob?.workflowStages,
    // ── Measurements ──
    measurements: measurements || [],
    measurementSource: measurementSource || "template",
    measurementTemplate: measurementTemplate || null,
    measurementTemplateName: measurementTemplateName || null,
    // ── Notes ──
    additionalInfo: additionalInfo || "",
    cuttingNotes: cuttingNotes || "",
    tailorNotes: tailorNotes || "",
  };
  const stageKeys = resolveStageKeysForJob({ ...existingJob, ...fields });
  let stages = existingJob?.stages ? { ...existingJob.stages } : initStages(stageKeys);
  stageKeys.forEach((k) => {
    if (!stages[k]) stages[k] = emptyStage();
  });

  if (!existingJob) {
    stages = applyWorkStatusToStages(stageKeys, initStages(stageKeys), "pending");
    if (stageKeys[0]) stages[stageKeys[0]].state = "active";
  }

  const job = recomputeJobMeta(
    withWorkflowStages(
      {
        id: existingJob?.id || newId(),
        workflowTrackingId:
          existingJob?.workflowTrackingId ||
          (fields.workCode ? String(fields.workCode) : null) ||
          newId(),
        ...fields,
        stages,
        source: existingJob?.source || "order",
        createdAt: existingJob?.createdAt || Date.now(),
        updatedAt: Date.now(),
      },
      stageKeys,
    ),
  );
  upsertWorkflowJob(job);
  return job;
}

/** QR / floor: complete active stage and activate next */
export function advanceStageByTrackingId(trackingId, completedBy = "qr") {
  const job = findWorkflowJob(trackingId);
  if (!job) return { ok: false, error: "Job not found" };

  const keys = (job.stageKeys || []).filter((k) => k != null && k !== "");
  const activeKey = getActiveStageKey(job);
  const activeIdx = keys.indexOf(activeKey);
  if (activeIdx < 0) return { ok: false, error: "No active stage" };

  const stages = { ...job.stages };
  stages[activeKey] = {
    ...stages[activeKey],
    state: "completed",
    completedAt: Date.now(),
    completedBy,
  };

  const nextKey = keys[activeIdx + 1];
  if (nextKey) {
    stages[nextKey] = { ...stages[nextKey], state: "active" };
  }

  const updated = recomputeJobMeta({ ...job, stages });

upsertWorkflowJob(updated);

emitWorkflowChanged();

  const completedKeys = keys.filter((k) => stages[k]?.state === "completed");
  const suggestedWorkStatus = workStatusForCompletedStages(keys, completedKeys);

  return { ok: true, job: updated, suggestedWorkStatus, activeKey, nextKey };
}

export function assignWorkerToActiveStage(trackingId, assignee) {
  const job = findWorkflowJob(trackingId);
  if (!job) return null;
  const activeKey = getActiveStageKey(job);
  if (!activeKey) return null;
  const stages = { ...job.stages };
  stages[activeKey] = {
    ...stages[activeKey],
    assignedTo: {
      role: assignee.role || STAGE_TO_WORKER_ROLE[activeKey] || "helper",
      name: assignee.name,
      workerId: assignee.workerId || null,
    },
  };
  const updated = recomputeJobMeta({ ...job, stages });
  upsertWorkflowJob(updated);
  return updated;
}

export function buildQrPayload(job) {
  return JSON.stringify({
    v: 1,
    wf: job.workflowTrackingId,
    order: job.orderId,
    work: job.workCode,
  });
}

export function parseQrPayload(raw) {
  try {
    if (raw.startsWith("{")) return JSON.parse(raw);
    const params = new URLSearchParams(raw.includes("?") ? raw.split("?")[1] : raw);
    const wf = params.get("wf");
    if (wf) return { v: 1, wf };
  } catch {
    /* ignore */
  }
  return null;
}

export function getJobForWork(work) {
  if (!work?._id) return null;
  return getWorkflowJobByWorkMongoId(work._id);
}
