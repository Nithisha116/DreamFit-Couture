import { store } from "../../../app/store";
import { selectWorkflowJobs } from "../../../features/work/workSlice";
import { STAGE_TO_DEPARTMENT } from "../../../workflow/workflowConstants";

/**
 * Load active production workload from MongoDB-backed workflow jobs (Redux cache).
 * Replaces legacy dreamfit_boutique_tasks_v1 localStorage.
 */
export function loadTasksFromStorage() {
  try {
    const jobs = selectWorkflowJobs(store.getState()) || [];
    return jobs
      .filter((j) => j.lifecycleStatus !== "completed")
      .map((job) => {
        const activeKey =
          job.currentStageKey ||
          job.stageKeys?.find((k) => job.stages?.[k]?.state === "active");
        const assignee = activeKey ? job.stages?.[activeKey]?.assignedTo : null;
        const stage = activeKey ? job.stages?.[activeKey] : null;
        const estimatedHours =
          Number(stage?.estimatedHours) ||
          Number(job.estimatedHours) ||
          Number(job.totalEstimatedHours) ||
          0;

        return {
          orderId: job.orderId,
          customerName: job.customerName,
          title: job.garmentName,
          departmentKey: STAGE_TO_DEPARTMENT[activeKey] || activeKey || "sewing",
          assignedTo: assignee?.name || null,
          estimatedHours,
          completed: job.lifecycleStatus === "completed",
        };
      });
  } catch {
    return [];
  }
}
