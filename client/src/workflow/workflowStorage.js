import { WORKFLOW_CHANGED_EVENT, WORKFLOW_LS_KEY } from "./workflowConstants";

export function loadWorkflowJobs() {
  try {
    const raw = localStorage.getItem(WORKFLOW_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWorkflowJobs(jobs) {
  localStorage.setItem(WORKFLOW_LS_KEY, JSON.stringify(jobs));
  emitWorkflowChanged();
}

export function emitWorkflowChanged() {
  window.dispatchEvent(new CustomEvent(WORKFLOW_CHANGED_EVENT));
}

export function getWorkflowJobByTrackingId(trackingId) {
  const jobs = loadWorkflowJobs();

  return (
    jobs.find(
      (j) =>
        j.workflowTrackingId === trackingId ||
        j.workCode === trackingId
    ) || null
  );
}

export function getWorkflowJobByWorkMongoId(workMongoId) {
  if (!workMongoId) return null;
  return loadWorkflowJobs().find((j) => j.workMongoId === workMongoId) || null;
}

export function upsertWorkflowJob(job) {
  const jobs = loadWorkflowJobs();
  const idx = jobs.findIndex(
    (j) =>
      j.workflowTrackingId === job.workflowTrackingId ||
      (job.workMongoId && j.workMongoId === job.workMongoId),
  );
  const next = [...jobs];
  if (idx >= 0) next[idx] = { ...next[idx], ...job, updatedAt: Date.now() };
  else next.unshift({ ...job, updatedAt: Date.now() });
  saveWorkflowJobs(next);
  return job;
}

export function updateWorkflowJob(trackingId, updater) {
  const jobs = loadWorkflowJobs();
  const idx = jobs.findIndex((j) => j.workflowTrackingId === trackingId);
  if (idx < 0) return null;
  const updated =
    typeof updater === "function" ? updater(jobs[idx]) : { ...jobs[idx], ...updater };
  const next = [...jobs];
  next[idx] = { ...updated, updatedAt: Date.now() };
  saveWorkflowJobs(next);
  return next[idx];
}
