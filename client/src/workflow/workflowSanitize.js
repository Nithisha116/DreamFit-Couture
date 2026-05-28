import {
  DEFAULT_WORKFLOW_STAGES,
  extractOrderedStageKeys,
  getStageLabelFromDef,
  resolveStageKeysForJob,
} from "./workflowConstants";

function emptyStage() {
  return { state: "pending", assignedTo: null, completedAt: null, completedBy: null };
}

function normalizeAssignee(raw) {
  if (!raw || typeof raw !== "object") return null;
  const name = raw.name != null ? String(raw.name).trim() : "";
  if (!name && !raw.workerId) return null;
  return {
    role: raw.role || null,
    name: name || "Worker",
    workerId: raw.workerId || null,
  };
}

function deriveMeta(keys, stages, workflowStagesForLabels) {
  const activeKey =
    keys.find((k) => stages[k]?.state === "active") ||
    keys.find((k) => stages[k]?.state === "pending") ||
    keys[keys.length - 1] ||
    null;

  const assignee = activeKey ? stages[activeKey]?.assignedTo : null;
  const allDone = keys.length > 0 && keys.every((k) => stages[k]?.state === "completed");

  return {
    assignmentStatus: assignee?.name ? "assigned" : "unassigned",
    lifecycleStatus: allDone ? "completed" : "open",
    currentStageKey: activeKey,
    currentStageLabel: activeKey
      ? getStageLabelFromDef(activeKey, workflowStagesForLabels)
      : "In progress",
  };
}

/** Repair a single workflow job — safe for render, save, and QR lookup */
export function sanitizeWorkflowJob(job) {
  if (!job || typeof job !== "object") return null;

  let keys = extractOrderedStageKeys(job);

  if (!keys.length) {
    keys = resolveStageKeysForJob(job);
  }

  if (!keys.length) {
    keys = [...DEFAULT_WORKFLOW_STAGES];
  }

  const stages = {};
  keys.forEach((k) => {
    const prev = job.stages?.[k];
    const state = ["completed", "active", "pending"].includes(prev?.state)
      ? prev.state
      : "pending";
    stages[k] = {
      state,
      assignedTo: normalizeAssignee(prev?.assignedTo),
      completedAt: prev?.completedAt ?? null,
      completedBy: prev?.completedBy ?? null,
    };
  });

  const hasActive = keys.some((k) => stages[k].state === "active");
  const allCompleted = keys.every((k) => stages[k].state === "completed");
  if (!hasActive && !allCompleted) {
    const target = keys.find((k) => stages[k].state !== "completed") || keys[0];
    if (target) {
      stages[target] = { ...stages[target], state: "active" };
    }
  }

  const workflowStages = keys.map((key, index) => ({
    key,
    label: getStageLabelFromDef(key, job.workflowStages || keys),
    order: index + 1,
  }));

  const workCode = job.workCode != null ? String(job.workCode).trim() : "";
  const trackingId =
    String(job.workflowTrackingId || "").trim() ||
    workCode ||
    String(job.id || "").trim() ||
    (job.workMongoId ? `wm-${job.workMongoId}` : "") ||
    `wf-${Date.now()}`;

  return {
    ...job,
    workflowTrackingId: trackingId,
    workCode: workCode || job.workCode || null,
    workflowStages,
    stageKeys: keys,
    stages,
    ...deriveMeta(keys, stages, workflowStages),
    updatedAt: job.updatedAt || Date.now(),
    createdAt: job.createdAt || Date.now(),
  };
}

/** Collapse duplicate jobs — prefer newest by workMongoId / workCode */
export function dedupeWorkflowJobs(jobs) {
  const map = new Map();

  for (const raw of jobs || []) {
    const j = sanitizeWorkflowJob(raw);
    if (!j) continue;

    const dedupeKey = j.workMongoId
      ? `wm:${j.workMongoId}`
      : j.workCode
        ? `wc:${j.workCode}`
        : `wt:${j.workflowTrackingId}`;

    const prev = map.get(dedupeKey);
    if (!prev || (j.updatedAt || 0) >= (prev.updatedAt || 0)) {
      map.set(dedupeKey, j);
    }
  }

  return Array.from(map.values());
}
