/**
 * Order → workflow registration.
 * MongoDB (Work + Order) is the SSOT — client loads jobs via GET /api/workflow/jobs.
 */

/** @deprecated No local registration; fetch workflow jobs from API after order create. */
export function registerWorkflowJobsFromOrder() {
  return [];
}
