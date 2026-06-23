/**
 * Delivery pipeline — reads WorkflowJob SSOT; falls back to Work when no job exists.
 */

import {
  PIPELINE_STAGE_DEFS,
  extractOrderedStageKeys,
  getStageLabelFromDef,
  getStageShortLabel,
} from "../workflow/workflowConstants";
import { normalizeWorkflowStages } from "../workflow/workflowStageUtils";
import { getActiveStageKey } from "../workflow/workflowEngine";
import { getWorkflowJobByWorkMongoId } from "../workflow/workflowStorage";
import { store } from "../app/store";
import { selectWorkflowJobs } from "../features/work/workSlice";

export { PIPELINE_STAGE_DEFS };

/** Active tasks derived from MongoDB workflow jobs (no localStorage). */
export function loadBoutiqueTasks() {
  try {
    return selectWorkflowJobs(store.getState()) || [];
  } catch {
    return [];
  }
}

/** Pipeline row from WorkflowJob (SSOT) */
export function buildPipelineViewModelFromJob(job) {
  const stageKeys = extractOrderedStageKeys(job); 
  const stages = stageKeys.map((key) => ({
    key,
    label: getStageLabelFromDef(key, job.workflowStages),
    shortLabel: getStageShortLabel(key, job.workflowStages),
    state: job.stages?.[key]?.state || "pending",
  }));

  const deliveryDate = job.dueDate || null;
  const overdue =
    deliveryDate &&
    job.lifecycleStatus !== "completed" &&
    new Date(deliveryDate) < new Date(new Date().setHours(0, 0, 0, 0));

  let delayDays = 0;
  if (overdue && deliveryDate) {
    const ms = new Date().setHours(0, 0, 0, 0) - new Date(deliveryDate).setHours(0, 0, 0, 0);
    delayDays = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  const activeKey = getActiveStageKey(job);
  return {
    workId: job.workMongoId || job.id,
    workflowTrackingId: job.workflowTrackingId,
    workCode: job.workCode || "—",
    orderId: job.orderId || "—",
    customerName: job.customerName || "Customer",
    productName: job.garmentName || "Garment",
    deliveryDate,
    workStatus: job.workStatus,
    currentStageLabel: job.currentStageLabel || getStageLabelFromDef(activeKey, job.workflowStages),
    stages,
    priority: job.priority || "normal",
    isHighPriority: job.priority === "high",
    overdue,
    delayDays,
    assignments: job.assignments || [],
  };
}

/** @deprecated Legacy fallback — prefer buildPipelineViewModelFromJob */
function collectWorkSearchText(work) {
  const g = work?.garment;
  const parts = [
    work?.workId,
    work?.order?.orderId,
    work?.order?.customer?.name,
    typeof g === "object" ? g?.name : work?.garmentName,
    typeof g === "object" ? g?.garmentId : work?.garmentId,
    typeof g === "object" ? g?.categoryName : "",
    typeof g === "object" ? g?.category?.name : "",
    typeof g === "object" ? g?.itemName : "",
    typeof g === "object" ? g?.item?.name : "",
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
}

const EMBROIDERY_RE = /\b(embroidery|zardozi|zari|magam|kundan|bead|sequin|thread\s*work)\b/i;
const AARI_RE = /\b(aari|aari\s*work|magam\s*work)\b/i;

function taskMatchesWork(task, work) {
  const orderRef = work?.order?.orderId || work?.order?._id || "";
  const orderNorm = String(orderRef).replace(/^#/, "").toLowerCase();
  const taskOrder = String(task.orderId || "").replace(/^#/, "").toLowerCase();
  const customer = (work?.order?.customer?.name || "").toLowerCase();
  const garmentName = (typeof work?.garment === "object" ? work.garment?.name : work?.garmentName || "").toLowerCase();

  if (taskOrder && orderNorm && (taskOrder.includes(orderNorm) || orderNorm.includes(taskOrder))) {
    return true;
  }
  if (customer && task.customerName && task.customerName.toLowerCase() === customer) {
    if (!garmentName || !task.title) return true;
    if (task.title.toLowerCase().includes(garmentName) || garmentName.includes(task.title.toLowerCase())) {
      return true;
    }
  }
  return false;
}
/*
function resolvePipelineStageKeys(work, boutiqueTasks = loadBoutiqueTasks()) {
  const hay = collectWorkSearchText(work);
  const related = boutiqueTasks.filter((t) => taskMatchesWork(t, work));
  const needsEmbroidery =
    related.some((t) => t.departmentKey === "embroidery") || EMBROIDERY_RE.test(hay);
  const needsAari = related.some((t) => t.departmentKey === "aari") || AARI_RE.test(hay);
  const keys = ["cutting"];
  if (needsEmbroidery) keys.push("embroidery");
  if (needsAari) keys.push("aari");
  keys.push("stitching", "ironing", "packed");
  return keys;
}

function legacyBuildFromWork(work, boutiqueTasks) {
  const related = boutiqueTasks.filter((t) => taskMatchesWork(t, work));
  const stageKeys = resolvePipelineStageKeys(work, boutiqueTasks);
  const status = work.status || "pending";

  let activeIdx = stageKeys.findIndex((k) => !isStageDone(k));
  if (status === "ready-to-deliver") activeIdx = stageKeys.length - 1;
  if (activeIdx < 0) activeIdx = 0;

  const stages = stageKeys.map((key, idx) => {
    let state = "pending";
    if (status === "ready-to-deliver") state = "completed";
    else if (idx < activeIdx) state = "completed";
    else if (idx === activeIdx) state = "active";
    return {
      key,
      label: getStageLabelFromDef(key, work.workflowStages),
      shortLabel: getStageShortLabel(key, work.workflowStages),
      state
    };
  });

  const garment = work?.garment;
  const deliveryDate = work?.estimatedDelivery || work?.order?.deliveryDate || null;
  const priority = (typeof garment === "object" ? garment?.priority : work?.priority) || "normal";
  const overdue =
    deliveryDate &&
    status !== "ready-to-deliver" &&
    new Date(deliveryDate) < new Date(new Date().setHours(0, 0, 0, 0));

  let delayDays = 0;
  if (overdue && deliveryDate) {
    const ms = new Date().setHours(0, 0, 0, 0) - new Date(deliveryDate).setHours(0, 0, 0, 0);
    delayDays = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  return {
    workId: work._id,
    workflowTrackingId: null,
    workCode: work.workId,
    orderId: work?.order?.orderId || work?.workId || "—",
    customerName: work?.order?.customer?.name || "Customer",
    productName: (typeof garment === "object" ? garment?.name : work?.garmentName) || "Garment",
    deliveryDate,
    workStatus: status,
    currentStageLabel: getStageLabelFromDef(stageKeys[activeIdx], work.workflowStages) || "In progress",
    stages,
    priority,
    isHighPriority: priority === "high",
    overdue,
    delayDays,
  };
}
*/
/** Prefer workflow job; fallback to legacy work inference */
export function buildPipelineViewModel(work, boutiqueTasks = loadBoutiqueTasks()) {
  const job = work?._id ? getWorkflowJobByWorkMongoId(work._id) : null;
  if (job) return buildPipelineViewModelFromJob(job);

return buildPipelineViewModelFromJob({
  workflowStages: work.order?.workflowStages || work.workflowStages || [],
  stageKeys: work.order?.stageKeys || work.stageKeys || [],
  stages: work.stages || {},
  currentStageLabel: work.currentStage,
  garmentName: work.garmentName,
  orderId: work.order?.orderId,
  customerName: work.order?.customer?.name,
  priority: "normal",
});
}

export function filterJobsForPipeline(jobs, daysAhead = 5) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + daysAhead);

  return (jobs || []).filter((job) => {
    if (job.lifecycleStatus === "completed") return true;
    const due = job.dueDate;
    if (!due) return true;
    const d = new Date(due);
    d.setHours(0, 0, 0, 0);
    return d <= end;
  });
}

export function filterWorksForPipeline(works, daysAhead = 5) {
  return works;
}

export function sortJobsForPipeline(jobs) {
  const priorityWeight = { high: 0, normal: 1, low: 2 };
  return [...jobs].sort((a, b) => {
    const aPri = priorityWeight[a.priority] ?? 1;
    const bPri = priorityWeight[b.priority] ?? 1;
    if (aPri !== bPri) return aPri - bPri;
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return dateA - dateB;
  });
}

export function sortWorksForPipeline(works) {
  const priorityWeight = { high: 0, normal: 1, low: 2 };
  return [...works].sort((a, b) => {
    const aPri = priorityWeight[a.garment?.priority] ?? 1;
    const bPri = priorityWeight[b.garment?.priority] ?? 1;
    if (aPri !== bPri) return aPri - bPri;
    const dateA = a.estimatedDelivery ? new Date(a.estimatedDelivery).getTime() : Infinity;
    const dateB = b.estimatedDelivery ? new Date(b.estimatedDelivery).getTime() : Infinity;
    return dateA - dateB;
  });
}
