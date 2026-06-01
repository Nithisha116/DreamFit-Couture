import { WORKFLOW_CHANGED_EVENT } from "./workflowConstants";
import { sanitizeWorkflowJob } from "./workflowSanitize";
import { store } from "../app/store";
import { selectWorkflowJobs } from "../features/work/workSlice";

function normRef(ref) {
  return String(ref || "")
    .trim()
    .toLowerCase();
}

/** In-memory workflow jobs come from Redux (populated by GET /api/workflow/jobs). */
export function loadWorkflowJobs() {
  try {
    const raw = selectWorkflowJobs(store.getState()) || [];
    return raw.map((j) => sanitizeWorkflowJob(j)).filter(Boolean);
  } catch {
    return [];
  }
}

/** @deprecated No-op — MongoDB is SSOT; use fetchWorkflowJobs() instead. */
export function saveWorkflowJobs(jobs) {
  emitWorkflowChanged();
  return (jobs || []).map((j) => sanitizeWorkflowJob(j)).filter(Boolean);
}

export function emitWorkflowChanged() {
  window.dispatchEvent(new CustomEvent(WORKFLOW_CHANGED_EVENT));
}

function searchJobs(jobs, needle) {
  return (
    jobs.find((j) => {
      const candidates = [
        j.workflowTrackingId,
        j.workCode,
        j.orderId,
        j.id,
        j.workMongoId,
      ]
        .filter((v) => v != null && String(v).trim() !== "")
        .map((v) => normRef(v));

      return candidates.includes(needle);
    }) || null
  );
}

/** Resolve job by tracking id, work code, order id, or internal id */
export function findWorkflowJob(ref) {
  const needle = normRef(ref);
  if (!needle) return null;
  return searchJobs(loadWorkflowJobs(), needle);
}

export function getWorkflowJobByTrackingId(trackingId) {
  return findWorkflowJob(trackingId);
}

export function getWorkflowJobByWorkMongoId(workMongoId) {
  if (!workMongoId) return null;
  const id = String(workMongoId);
  return loadWorkflowJobs().find((j) => j.workMongoId === id) || null;
}

/** @deprecated No-op — persist via API (assign-worker / scan). */
export function upsertWorkflowJob(job) {
  emitWorkflowChanged();
  return sanitizeWorkflowJob(job);
}

/** @deprecated No-op — persist via API. */
export function updateWorkflowJob(trackingId, updater) {
  const existing = findWorkflowJob(trackingId);
  if (!existing) return null;
  const merged =
    typeof updater === "function" ? updater(existing) : { ...existing, ...updater };
  emitWorkflowChanged();
  return sanitizeWorkflowJob(merged);
}
