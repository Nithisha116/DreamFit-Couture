import { DEFAULT_CAPACITY_HOURS } from "./taskConstants";
import { workloadByEmployee, availabilityLabel, formatHours } from "./taskUtils";

export default function WorkloadPanel({ departmentKey, employees, tasks }) {
  const loads = workloadByEmployee(departmentKey, tasks);

  return (
    <aside className="w-full xl:w-80 shrink-0">
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] p-5 sm:p-6 sticky top-4">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">
          Employee workload
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Live hours from today&apos;s open tasks in this department.
        </p>
        <div className="space-y-5">
          {employees.map((name) => {
            const hours = loads[name]?.hours ?? 0;
            const active = loads[name]?.activeCount ?? 0;
            const pct = Math.min(
              100,
              (hours / DEFAULT_CAPACITY_HOURS) * 100,
            );
            const { label, tone } = availabilityLabel(hours);
            const toneCls =
              tone === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                : tone === "warning"
                  ? "bg-amber-50 text-amber-900 border-amber-100"
                  : "bg-rose-50 text-rose-800 border-rose-100";

            return (
              <div
                key={name}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-slate-800 capitalize">{name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {active} active task{active !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${toneCls}`}
                  >
                    {label}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>{formatHours(hours)}</span>
                  <span>of {DEFAULT_CAPACITY_HOURS}h day</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#1E6BFF] to-indigo-500 transition-all duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
