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

export function sortJobsForDisplay(jobs) {
  return [...jobs].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA; // Descending order (newest first)
  });
}
