import { format } from "date-fns";
import { AlertTriangle, Calendar, Eye, Package, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export default function UnassignedTaskCards({ jobs, onAssign, basePath = "/admin" }) {
  if (!jobs.length) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 py-14 text-center">
        <Package className="h-10 w-10 text-amber-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">No unassigned tasks</p>
        <p className="text-xs text-slate-500 mt-1">New orders will appear here for worker assignment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const dueLabel = job.dueDate
          ? format(new Date(job.dueDate), "dd MMM yyyy")
          : "No due date";
        const overdue =
          job.dueDate &&
          new Date(job.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

        return (
          <div
            key={job.workflowTrackingId}
            className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-orange-50/50 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg">
                    {job.orderId || job.workCode}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Unassigned
                  </span>
                  {job.priority === "high" && (
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Priority
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 truncate">{job.garmentName}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{job.customerName}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                    Due {dueLabel}
                    {overdue && <span className="text-red-600 font-bold ml-1">Overdue</span>}
                  </span>
                  <span className="rounded-lg bg-white/80 px-2 py-0.5 font-semibold text-violet-800 ring-1 ring-violet-100">
                    Stage: {job.currentStageLabel}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  to={`${basePath}/tasks/job/${job.workflowTrackingId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-violet-200 bg-white px-4 py-2.5 text-sm font-bold text-violet-700 hover:bg-violet-50"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => onAssign(job)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-95"
                >
                  <UserPlus className="h-4 w-4" />
                  Assign
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
