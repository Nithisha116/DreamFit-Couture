import { Check, Circle } from "lucide-react";
import {
  getStageLabelFromDef,
  getStageShortLabel,
  normalizeWorkflowStages,
} from "../../workflow/workflowConstants";

export default function WorkflowStageTimeline({
  job,
  compact = false,
  variant = "horizontal",
}) {
  const keys = normalizeWorkflowStages(job?.workflowStages || job?.stageKeys);

  if (!keys.length) {
    return (
      <p className="text-xs text-slate-400 text-center py-2">No workflow stages configured</p>
    );
  }

  if (variant === "vertical") {
    return (
      <ul className="space-y-2 text-left" aria-label="Production workflow">
        {keys.map((key) => {
          const stage = job.stages?.[key];
          const label = getStageLabelFromDef(key, job?.workflowStages);
          const isCompleted = stage?.state === "completed";
          const isActive = stage?.state === "active";

          return (
            <li
              key={key}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all",
                isCompleted
                  ? "border-emerald-200 bg-emerald-50/80"
                  : isActive
                    ? "border-violet-300 bg-violet-50 ring-2 ring-violet-200/60"
                    : "border-slate-100 bg-slate-50/50",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                  isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isActive
                      ? "border-violet-500 bg-violet-600 text-white animate-pulse"
                      : "border-slate-200 bg-white text-slate-300",
                ].join(" ")}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : isActive ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={[
                    "text-sm font-bold truncate",
                    isCompleted
                      ? "text-emerald-800"
                      : isActive
                        ? "text-violet-900"
                        : "text-slate-400",
                  ].join(" ")}
                >
                  {label}
                </p>
                {isActive && (
                  <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wide">
                    Current stage
                  </p>
                )}
                {isCompleted && stage?.completedAt && (
                  <p className="text-[10px] text-emerald-600/80">
                    Completed
                  </p>
                )}
              </div>
              <span className="text-lg shrink-0" aria-hidden>
                {isCompleted ? "✓" : isActive ? "●" : "○"}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className={`flex items-start ${compact ? "gap-0" : "gap-1"} overflow-x-auto pb-1`}>
      {keys.map((key, i) => {
        const stage = job.stages?.[key];
        const label = getStageLabelFromDef(key, job?.workflowStages);
        const shortLabel = getStageShortLabel(key, job?.workflowStages);
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
                {isCompleted ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : shortLabel}
              </div>
              {!compact && (
                <span
                  className={[
                    "mt-1 max-w-[72px] truncate text-center text-[9px] font-semibold",
                    isCompleted ? "text-emerald-700" : isActive ? "text-violet-700" : "text-slate-400",
                  ].join(" ")}
                >
                  {label}
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
