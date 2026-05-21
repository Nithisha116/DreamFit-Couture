import { STAGE_TO_DEPARTMENT } from "./workflowConstants";
import { getActiveStageKey } from "./workflowEngine";

export function filterUnassignedJobs(jobs) {
  return jobs.filter(
    (j) => j.lifecycleStatus === "open" && j.assignmentStatus === "unassigned",
  );
}

export function filterAssignedJobs(jobs) {
  return jobs.filter(
    (j) => j.lifecycleStatus === "open" && j.assignmentStatus === "assigned",
  );
}

export function filterCompletedJobs(jobs) {
  return jobs.filter((j) => j.lifecycleStatus === "completed");
}

export function filterJobsByDepartment(jobs, departmentKey) {
  if (!departmentKey || departmentKey === "all") return jobs;
  return jobs.filter((j) => STAGE_TO_DEPARTMENT[getActiveStageKey(j)] === departmentKey);
}

export function sortJobsForDisplay(jobs) {
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
