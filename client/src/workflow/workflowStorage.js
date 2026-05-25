import { WORKFLOW_CHANGED_EVENT, WORKFLOW_LS_KEY } from "./workflowConstants";
import { dedupeWorkflowJobs, sanitizeWorkflowJob } from "./workflowSanitize";

function normRef(ref) {
  return String(ref || "")
    .trim()
    .toLowerCase();
}

export function loadWorkflowJobs() {
  try {
    const raw = localStorage.getItem(WORKFLOW_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return dedupeWorkflowJobs(parsed);
  } catch {
    return [];
  }
}

export function saveWorkflowJobs(jobs) {
  const clean = dedupeWorkflowJobs(jobs);
  localStorage.setItem(WORKFLOW_LS_KEY, JSON.stringify(clean));
  emitWorkflowChanged();
  return clean;
}

export function emitWorkflowChanged() {
  window.dispatchEvent(new CustomEvent(WORKFLOW_CHANGED_EVENT));
}

/** Resolve job by tracking id, work code, order id, or internal id */
export function findWorkflowJob(ref) {
  const needle = normRef(ref);
  if (!needle) return null;

  const jobs = loadWorkflowJobs();

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

export function getWorkflowJobByTrackingId(trackingId) {
  return findWorkflowJob(trackingId);
}

export function getWorkflowJobByWorkMongoId(workMongoId) {
  if (!workMongoId) return null;
  const id = String(workMongoId);
  return loadWorkflowJobs().find((j) => j.workMongoId === id) || null;
}

function findJobIndex(jobs, job) {
  return jobs.findIndex(
    (j) =>
      (job.workflowTrackingId &&
        j.workflowTrackingId === job.workflowTrackingId) ||
      (job.workMongoId && j.workMongoId && j.workMongoId === job.workMongoId) ||
      (job.workCode && j.workCode && j.workCode === job.workCode),
  );
}

export function upsertWorkflowJob(job) {
  const incoming = sanitizeWorkflowJob(job);
  if (!incoming) return null;

  const jobs = loadWorkflowJobs();
  const idx = findJobIndex(jobs, incoming);
  const next = [...jobs];

  let saved;
  if (idx >= 0) {
    const prev = jobs[idx];
    saved = sanitizeWorkflowJob({
      ...prev,
      ...incoming,
      workflowTrackingId:
        prev.workflowTrackingId || incoming.workflowTrackingId,
      id: prev.id || incoming.id,
      createdAt: prev.createdAt || incoming.createdAt,
      updatedAt: Date.now(),
    });
    next[idx] = saved;
  } else {
    saved = { ...incoming, updatedAt: Date.now() };
    next.unshift(saved);
  }

  saveWorkflowJobs(next);
  return saved;
}

export function updateWorkflowJob(trackingId, updater) {
  const jobs = loadWorkflowJobs();
  const existing = findWorkflowJob(trackingId);
  if (!existing) return null;

  const idx = findJobIndex(jobs, existing);
  if (idx < 0) return null;

  const merged =
    typeof updater === "function" ? updater(jobs[idx]) : { ...jobs[idx], ...updater };

  const next = [...jobs];
  next[idx] = sanitizeWorkflowJob({ ...merged, updatedAt: Date.now() });
  saveWorkflowJobs(next);
  return next[idx];
}
