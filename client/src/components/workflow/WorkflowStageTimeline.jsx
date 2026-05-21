import { Check } from "lucide-react";
import { PIPELINE_STAGE_DEFS } from "../../workflow/workflowConstants";

export default function WorkflowStageTimeline({ job, compact = false }) {
  const keys = job?.stageKeys || [];

  return (
    <div className={`flex items-start ${compact ? "gap-0" : "gap-1"} overflow-x-auto pb-1`}>
      {keys.map((key, i) => {
        const stage = job.stages?.[key];
        const def = PIPELINE_STAGE_DEFS[key];
        const isCompleted = stage?.state === "completed";
        const isActive = stage?.state === "active";
        const isLast = i === keys.length - 1;

        return (
          <div key={key} className="flex items-center flex-1 min-w-[56px]">
            <div className="flex flex-col items-center flex-1">
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all",
                  isCompleted
                    ? "border-emerald-400 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm"
                    : isActive
                      ? "border-violet-400 bg-gradient-to-br from-violet-600 to-indigo-600 text-white ring-4 ring-violet-400/20 animate-pulse"
                      : "border-slate-200 bg-slate-50 text-slate-400",
                ].join(" ")}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : def?.shortLabel}
              </div>
              {!compact && (
                <span
                  className={[
                    "mt-1 max-w-[72px] truncate text-center text-[9px] font-semibold",
                    isCompleted ? "text-emerald-700" : isActive ? "text-violet-700" : "text-slate-400",
                  ].join(" ")}
                >
                  {def?.label}
                </span>
              )}
            </div>
            {!isLast && (
              <div
                className={[
                  "mx-0.5 h-0.5 flex-1 min-w-[6px] rounded-full",
                  isCompleted ? "bg-emerald-400" : "bg-slate-200",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
