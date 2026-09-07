import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Circle,
  GitBranch,
  Minus,
  User,
  Layers,
} from "lucide-react";
import { getStageShortLabel } from "../../workflow/workflowConstants";

/**
 * Order-level & Per-garment production pipeline component.
 *
 * All stage keys, task statuses, assignments, and work items are supplied by
 * the backend `buildOrderPipeline` helper on `pipeline`.
 */

const TONE = {
  COMPLETED: {
    node: "border-emerald-400 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30",
    text: "text-emerald-700",
    connector: "bg-gradient-to-r from-emerald-400 to-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    label: "Completed",
  },
  IN_PROGRESS: {
    node: "border-violet-400 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/50 ring-4 ring-violet-400/25",
    text: "text-violet-700",
    connector: "bg-slate-200",
    chip: "bg-violet-50 text-violet-700 ring-violet-200/80",
    label: "In progress",
  },
  DELAYED: {
    node: "border-red-400 bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/40 ring-4 ring-red-400/25",
    text: "text-red-700",
    connector: "bg-slate-200",
    chip: "bg-red-50 text-red-700 ring-red-200/80",
    label: "Delayed",
  },
  NOT_STARTED: {
    node: "border-slate-200 bg-slate-50 text-slate-400",
    text: "text-slate-400",
    connector: "bg-slate-200",
    chip: "bg-slate-50 text-slate-500 ring-slate-200/80",
    label: "Not started",
  },
  NOT_APPLICABLE: {
    node: "border-dashed border-slate-200 bg-white text-slate-300",
    text: "text-slate-300",
    connector: "bg-slate-100",
    chip: "bg-slate-50 text-slate-400 ring-slate-200/60",
    label: "Not applicable",
  },
};

const toneOf = (status) => TONE[status] || TONE.NOT_STARTED;

const fmt = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : format(d, "dd MMM");
};

/** Top order-level overview stage node */
function OverviewStageNode({ stage, isLast, isCurrent, isSelected, onSelect }) {
  const tone = toneOf(stage.status);
  const isCompleted = stage.status === "COMPLETED";
  const isDelayed = stage.status === "DELAYED";
  const isNA = stage.status === "NOT_APPLICABLE";

  return (
    <div className="flex items-center flex-1 min-w-0">
      <button
        type="button"
        onClick={() => onSelect(isSelected ? null : stage.key)}
        aria-pressed={isSelected}
        title={`${stage.label} — ${tone.label} (click to toggle filter)`}
        className={[
          "flex flex-col items-center flex-1 min-w-[56px] sm:min-w-[76px] rounded-lg px-1 py-1 transition-colors",
          "hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
          isSelected ? "bg-violet-50/80 ring-1 ring-violet-300" : "",
        ].join(" ")}
      >
        <span
          className={[
            "relative z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 text-[10px] sm:text-xs font-bold transition-all duration-300",
            tone.node,
            isCurrent ? "animate-pulse" : "",
          ].join(" ")}
        >
          {isCompleted ? (
            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />
          ) : isDelayed ? (
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
          ) : isNA ? (
            <Minus className="h-3.5 w-3.5" strokeWidth={3} />
          ) : (
            getStageShortLabel(stage.key)
          )}
        </span>

        <span
          className={[
            "mt-1.5 max-w-[76px] truncate text-center text-[9px] sm:text-[10px] font-semibold leading-tight",
            tone.text,
          ].join(" ")}
        >
          {stage.label}
        </span>

        {stage.taskCount > 0 && (
          <span className="mt-0.5 text-[9px] font-bold text-slate-400">
            {stage.completedTaskCount}/{stage.taskCount}
          </span>
        )}
      </button>

      {!isLast && (
        <div
          className={["mx-0.5 h-0.5 flex-1 min-w-[8px] rounded-full transition-colors", tone.connector].join(" ")}
          aria-hidden
        />
      )}
    </div>
  );
}

/** Individual Garment Pipeline Card */
function GarmentCard({ garment, basePath }) {
  const { workCode, garmentName, stages } = garment;

  // Identify active stage using backend workflow status conventions:
  // Explicit IN_PROGRESS or DELAYED stage task, or first non-COMPLETED stage.
  const activeStage =
    stages.find((s) => s.status === "IN_PROGRESS" || s.status === "DELAYED") ||
    stages.find((s) => s.status !== "COMPLETED") ||
    null;

  const isAllCompleted =
    stages.length > 0 && stages.every((s) => s.status === "COMPLETED");

  const currentStageLabel = isAllCompleted
    ? "Completed"
    : activeStage
    ? activeStage.label
    : "No active stage";

  const activeWorker =
    activeStage?.assignedTo || stages.find((s) => s.assignedTo)?.assignedTo || null;

  const targetUrl = workCode ? `${basePath}/tasks/job/${workCode}` : null;

  const cardContent = (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 transition-all duration-200 shadow-sm hover:border-violet-300 hover:shadow-md">
      {/* Garment Header & Work Code Badge */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-violet-700 transition-colors">
            {garmentName}
          </h3>
          {workCode ? (
            <span className="inline-block mt-1 font-mono text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md ring-1 ring-violet-200/60">
              #{workCode}
            </span>
          ) : (
            <span className="inline-block mt-1 text-xs text-slate-400 italic">
              Production job not created
            </span>
          )}
        </div>

        <span
          className={[
            "rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ring-1",
            isAllCompleted
              ? TONE.COMPLETED.chip
              : activeStage?.status === "DELAYED"
              ? TONE.DELAYED.chip
              : activeStage
              ? TONE.IN_PROGRESS.chip
              : TONE.NOT_STARTED.chip,
          ].join(" ")}
        >
          {isAllCompleted
            ? "Completed"
            : activeStage?.status === "DELAYED"
            ? "Delayed"
            : activeStage
            ? "Active"
            : "Pending"}
        </span>
      </div>

      {/* Mini Stage Rail */}
      <div className="my-3 py-2.5 border-y border-slate-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center min-w-max gap-1 px-0.5">
          {stages.map((st, idx) => {
            const isLast = idx === stages.length - 1;
            const isCompleted = st.status === "COMPLETED";
            const isActive =
              !isCompleted &&
              (st === activeStage ||
                st.status === "IN_PROGRESS" ||
                st.status === "DELAYED");
            const isDelayed = st.status === "DELAYED";

            return (
              <div key={st.key} className="flex items-center gap-1">
                <div
                  className={[
                    "flex items-center gap-1.5 rounded-lg px-2 py-1 border transition-colors",
                    isCompleted
                      ? "bg-emerald-50/60 border-emerald-100"
                      : isActive
                      ? "bg-violet-50/80 border-violet-200 ring-1 ring-violet-200/50"
                      : "bg-slate-50 border-slate-100",
                  ].join(" ")}
                  title={`${st.label}: ${toneOf(st.status).label}`}
                >
                  <span
                    className={[
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition-all",
                      isCompleted
                        ? "bg-emerald-500 text-white shadow-xs"
                        : isDelayed
                        ? "bg-red-500 text-white animate-pulse"
                        : isActive
                        ? "bg-violet-600 text-white animate-pulse shadow-sm shadow-violet-500/50"
                        : "bg-slate-200 text-slate-500",
                    ].join(" ")}
                  >
                    {isCompleted ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : isDelayed ? (
                      <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />
                    ) : isActive ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    ) : (
                      <Circle className="h-2 w-2 text-slate-400" />
                    )}
                  </span>
                  <span
                    className={[
                      "text-xs font-semibold whitespace-nowrap",
                      isCompleted
                        ? "text-emerald-800"
                        : isActive
                        ? "text-violet-900 font-bold"
                        : "text-slate-500",
                    ].join(" ")}
                  >
                    {st.label}
                  </span>
                </div>

                {!isLast && (
                  <div className="h-0.5 w-3 rounded-full bg-slate-200 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info: Active Stage, Assignment & Navigation Affordance */}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
          <div>
            <span className="font-semibold text-slate-400 text-[11px]">Active: </span>
            <span className="font-bold text-slate-800">{currentStageLabel}</span>
          </div>

          {activeWorker && (
            <div className="flex items-center gap-1 text-slate-500">
              <User size={12} className="text-slate-400" />
              <span>
                Assigned: <strong className="text-slate-700">{activeWorker.name}</strong>
              </span>
            </div>
          )}
        </div>

        {targetUrl ? (
          <span className="inline-flex items-center gap-1 font-bold text-xs text-violet-600 group-hover:text-violet-700 group-hover:translate-x-1 transition-all">
            View Job
            <ArrowRight size={14} />
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400 italic">
            No Link
          </span>
        )}
      </div>
    </div>
  );

  if (targetUrl) {
    return (
      <Link
        to={targetUrl}
        className="block no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export default function OrderProductionPipeline({ pipeline, basePath = "/admin" }) {
  const stages = pipeline?.stages || [];
  const [selectedKey, setSelectedKey] = useState(null);

  // Group stage tasks into individual per-garment pipelines
  const garments = useMemo(() => {
    if (!stages || !Array.isArray(stages)) return [];

    const map = new Map();

    for (const stage of stages) {
      if (!Array.isArray(stage.tasks)) continue;
      for (const task of stage.tasks) {
        // Unique key per work item ensures work items are never merged
        const key = task.workCode ? `code:${task.workCode}` : `id:${task.workId}`;
        if (!map.has(key)) {
          map.set(key, {
            workCode: task.workCode || null,
            workId: task.workId || null,
            garmentName: task.garmentName || "Garment",
            stages: [],
          });
        }
        const garment = map.get(key);
        garment.stages.push({
          key: stage.key,
          label: stage.label,
          status: task.status,
          assignedTo: task.assignedTo || null,
          completedAt: task.completedAt || null,
          completedBy: task.completedBy || null,
          dueDate: task.dueDate || null,
          overdue: task.overdue || false,
        });
      }
    }

    return Array.from(map.values());
  }, [stages]);

  if (!stages.length) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
          <GitBranch size={18} className="text-blue-600" />
          Production Pipeline
        </h2>
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center">
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            No production work has been created for this order yet.
          </p>
        </div>
      </div>
    );
  }

  const currentStage = pipeline?.currentStage || null;
  const overdueCount = stages.filter((s) => s.overdue).length;

  // Filter garments if a stage was selected on the order overview rail
  const filteredGarments = selectedKey
    ? garments.filter((g) => g.stages.some((st) => st.key === selectedKey))
    : garments;

  const selectedStageLabel = selectedKey
    ? stages.find((s) => s.key === selectedKey)?.label
    : null;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
            <GitBranch size={18} className="text-blue-600" />
            Production Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Per-garment progress tracking & job detail links
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pipeline?.currentStageLabel ? (
            <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-violet-800 ring-1 ring-violet-100">
              Order Stage: {pipeline.currentStageLabel}
            </span>
          ) : (
            <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-slate-500 ring-1 ring-slate-200">
              No active stage
            </span>
          )}
          {overdueCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-red-700 ring-1 ring-red-200/80">
              <AlertTriangle className="h-3 w-3" />
              {overdueCount} delayed
            </span>
          )}
        </div>
      </div>

      {/* Order-Level Overview Rail */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
            Order Stage Overview
          </span>
          {selectedKey && (
            <button
              type="button"
              onClick={() => setSelectedKey(null)}
              className="text-xs font-bold text-violet-600 hover:text-violet-800"
            >
              Reset filter
            </button>
          )}
        </div>
        <div className="overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex min-w-[520px] items-start px-0.5 sm:min-w-0">
            {stages.map((stage, i) => (
              <OverviewStageNode
                key={stage.key}
                stage={stage}
                isLast={i === stages.length - 1}
                isCurrent={stage.key === currentStage}
                isSelected={stage.key === selectedKey}
                onSelect={setSelectedKey}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Per-Garment Pipelines List */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
            <Layers size={14} className="text-violet-600" />
            Garment Production Work ({filteredGarments.length})
            {selectedStageLabel && (
              <span className="normal-case font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
                Filtering by: {selectedStageLabel}
              </span>
            )}
          </h3>
        </div>

        {filteredGarments.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {filteredGarments.map((garment) => (
              <GarmentCard
                key={garment.workCode ? `code:${garment.workCode}` : `id:${garment.workId}`}
                garment={garment}
                basePath={basePath}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center">
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              No garments found for this selection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
