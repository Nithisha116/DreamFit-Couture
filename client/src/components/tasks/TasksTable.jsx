import { Check, ChevronDown, ClipboardList } from "lucide-react";
import { formatHours, workloadByEmployee } from "./taskUtils";
import { DEFAULT_CAPACITY_HOURS } from "./taskConstants";

function StatusBadge({ status, completed }) {
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide">
        <Check className="w-3 h-3" />
        Completed
      </span>
    );
  }
  const map = {
    UNASSIGNED: "bg-slate-100 text-slate-700 border-slate-200",
    ASSIGNED: "bg-sky-50 text-sky-800 border-sky-200",
    IN_PROGRESS: "bg-violet-50 text-violet-800 border-violet-200",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${map[status] || map.UNASSIGNED}`}
    >
      {status?.replace("_", " ")}
    </span>
  );
}

export default function TasksTable({
  rows,
  departmentKey,
  departmentEmployees,
  allTasks,
  onAssignChange,
  onMarkComplete,
  completingIds,
  justCompletedIds,
  view,
}) {
  const loads = workloadByEmployee(departmentKey, allTasks);

  if (rows.length === 0) {
    return (
      <div className="flex-1 min-h-[320px] rounded-3xl border border-dashed border-slate-200 bg-white/60 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <ClipboardList className="w-7 h-7 text-blue-600" />
        </div>
        <p className="font-bold text-slate-800">
          {view === "today" ? "All clear in this department" : "No matches"}
        </p>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          {view === "today"
            ? "Add a task or switch department to see assignments."
            : "Adjust filters or pick another department."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 rounded-3xl bg-white border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-slate-500">
                Task
              </th>
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-slate-500 whitespace-nowrap">
                Assigned
              </th>
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-slate-500 hidden md:table-cell">
                Previous
              </th>
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-slate-500">
                Est.
              </th>
              <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-slate-500 hidden lg:table-cell">
                Load
              </th>
              {view === "today" && (
                <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-slate-500 text-right">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((task) => {
              const empHours = task.assignedTo
                ? loads[task.assignedTo]?.hours ?? 0
                : 0;
              const loadPct = task.assignedTo
                ? Math.min(
                    100,
                    (empHours / DEFAULT_CAPACITY_HOURS) * 100,
                  )
                : 0;
              const isAnimating =
                completingIds.has(task.id) || justCompletedIds.has(task.id);

              return (
                <tr
                  key={task.id}
                  className={`group transition-colors duration-300 hover:bg-blue-50/40 ${isAnimating ? "bg-emerald-50/50" : ""}`}
                >
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors">
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.customerName} · {task.outfitType}
                    </p>
                    {justCompletedIds.has(task.id) && (
                      <p className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1">
                        <span aria-hidden>✅</span> Task completed
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge
                      status={task.status}
                      completed={task.completed || justCompletedIds.has(task.id)}
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="relative">
                      <select
                        disabled={
                          task.completed ||
                          justCompletedIds.has(task.id) ||
                          completingIds.has(task.id)
                        }
                        value={task.assignedTo}
                        onChange={(e) =>
                          onAssignChange(task.id, e.target.value)
                        }
                        className="appearance-none w-full max-w-[160px] pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-sm capitalize font-medium focus:ring-2 focus:ring-blue-500/30 outline-none disabled:opacity-50"
                      >
                        <option value="">Select employee</option>
                        {departmentEmployees.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600 text-xs hidden md:table-cell max-w-[140px]">
                    {task.previousTaskStatus}
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-xs text-slate-700 whitespace-nowrap">
                    {formatHours(Number(task.estimatedHours) || 0)}
                  </td>
                  <td className="px-4 py-3 align-top hidden lg:table-cell">
                    {task.assignedTo ? (
                      <div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden w-24">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${loadPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block capitalize">
                          {task.assignedTo}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  {view === "today" && (
                    <td className="px-4 py-3 align-top text-right">
                      <button
                        type="button"
                        disabled={
                          task.completed ||
                          justCompletedIds.has(task.id) ||
                          completingIds.has(task.id)
                        }
                        onClick={() => onMarkComplete(task.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold px-3 py-2 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark done
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
