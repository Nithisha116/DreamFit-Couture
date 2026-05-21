import { format } from "date-fns";
import { Eye, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import WorkflowStageTimeline from "./WorkflowStageTimeline";

export default function AssignedTaskCards({ jobs, basePath }) {
  if (!jobs.length) {
    return (
      <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/30 py-14 text-center">
        <p className="text-sm font-semibold text-slate-700">No assigned tasks</p>
        <p className="text-xs text-slate-500 mt-1">Assign workers from the Unassigned tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const activeKey = job.currentStageKey;
        const assignee = job.stages?.[activeKey]?.assignedTo;
        const dueLabel = job.dueDate
          ? format(new Date(job.dueDate), "dd MMM yyyy")
          : "—";

        return (
          <div
            key={job.workflowTrackingId}
            className="rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50/50 via-white to-slate-50/80 p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 mb-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-violet-700">
                    {job.orderId || job.workCode}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    Assigned
                  </span>
                  {job.priority === "high" && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Priority
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900">{job.garmentName}</h3>
                <p className="text-xs text-slate-600">
                  {job.customerName}
                  {assignee?.name && (
                    <>
                      {" "}
                      · <span className="font-medium text-slate-800">{assignee.name}</span>
                      <span className="text-slate-400"> ({assignee.role})</span>
                    </>
                  )}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Due {dueLabel}</p>
              </div>
              <Link
                to={`${basePath}/tasks/job/${job.workflowTrackingId}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-violet-200 bg-white px-4 py-2 text-sm font-bold text-violet-700 hover:bg-violet-50 shrink-0"
              >
                <Eye className="h-4 w-4" />
                View
              </Link>
            </div>
            <WorkflowStageTimeline job={job} />
          </div>
        );
      })}
    </div>
  );
}
