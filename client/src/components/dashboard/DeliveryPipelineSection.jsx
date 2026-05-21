import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Package,
  Sparkles,
  Truck,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import useWorkflowJobs from "../../hooks/useWorkflowJobs";
import {
  buildPipelineViewModelFromJob,
  filterJobsForPipeline,
  sortJobsForPipeline,
} from "../../utils/deliveryPipelineUtils";

function StageNode({ stage, isLast }) {
  const { state, label, shortLabel } = stage;
  const isCompleted = state === "completed";
  const isActive = state === "active";

  return (
    <div className="flex items-center flex-1 min-w-0">
      <div className="flex flex-col items-center flex-1 min-w-[52px] sm:min-w-[72px]">
        <div
          className={[
            "relative z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 text-[10px] sm:text-xs font-bold transition-all duration-300",
            isCompleted
              ? "border-emerald-400 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30"
              : isActive
                ? "border-violet-400 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/50 ring-4 ring-violet-400/25 animate-pulse"
                : "border-slate-200 bg-slate-50 text-slate-400",
          ].join(" ")}
        >
          {isCompleted ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} /> : shortLabel}
        </div>
        <span
          className={[
            "mt-1.5 max-w-[72px] truncate text-center text-[9px] sm:text-[10px] font-semibold leading-tight",
            isCompleted ? "text-emerald-700" : isActive ? "text-violet-700" : "text-slate-400",
          ].join(" ")}
          title={label}
        >
          {label}
        </span>
      </div>
      {!isLast && (
        <div
          className={[
            "mx-0.5 h-0.5 flex-1 min-w-[8px] rounded-full transition-colors",
            isCompleted ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-slate-200",
          ].join(" ")}
          aria-hidden
        />
      )}
    </div>
  );
}

function PipelineRow({ model, basePath }) {
  const deliveryLabel = model.deliveryDate
    ? format(new Date(model.deliveryDate), "dd MMM yyyy")
    : "—";

  return (
    <div className="group rounded-xl border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50/80 p-4 shadow-sm transition-all duration-300 hover:border-violet-100 hover:shadow-md">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={
                model.workflowTrackingId
                  ? `${basePath}/tasks/job/${model.workflowTrackingId}`
                  : `${basePath}/works/${model.workId}`
              }
              className="font-mono text-xs font-bold text-violet-700 hover:text-violet-900 sm:text-sm"
            >
              {model.orderId}
            </Link>
            {model.isHighPriority && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200/80">
                <Sparkles className="h-3 w-3" />
                Priority
              </span>
            )}
            {model.overdue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 ring-1 ring-red-200/80">
                <AlertTriangle className="h-3 w-3" />
                {model.delayDays}d delayed
              </span>
            )}
          </div>

          <div>
            <h3 className="truncate text-sm font-bold text-slate-800 sm:text-base">{model.productName}</h3>
            <p className="text-xs text-slate-500">
              <span className="font-medium text-slate-600">{model.customerName}</span>
              <span className="mx-1.5 text-slate-300">·</span>
              <span>Due {deliveryLabel}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
            <span className="rounded-lg bg-violet-50 px-2 py-1 font-semibold text-violet-800 ring-1 ring-violet-100">
              {model.currentStageLabel}
            </span>
            <span className="text-slate-400">#{model.workCode}</span>
          </div>
        </div>

        <Link
          to={
            model.workflowTrackingId
              ? `${basePath}/tasks/job/${model.workflowTrackingId}`
              : `${basePath}/works/${model.workId}`
          }
          className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-violet-600 opacity-0 transition-opacity group-hover:opacity-100 lg:inline-flex"
        >
          View job <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex min-w-[320px] items-start px-0.5 sm:min-w-0">
          {model.stages.map((stage, i) => (
            <StageNode key={stage.key} stage={stage} isLast={i === model.stages.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DeliveryPipelineSection({
  works = [],
  basePath = "/admin",
  maxItems = 8,
  daysAhead = 5,
}) {
  const { jobs, version } = useWorkflowJobs(works);

  const pipelineItems = useMemo(() => {
    const openJobs = jobs.filter((j) => j.lifecycleStatus !== "completed");
    const filtered = filterJobsForPipeline(openJobs.length ? openJobs : jobs, daysAhead);
    const sorted = sortJobsForPipeline(filtered);
    return sorted.slice(0, maxItems).map((job) => buildPipelineViewModelFromJob(job));
  }, [jobs, version, maxItems, daysAhead]);

  const overdueCount = pipelineItems.filter((p) => p.overdue).length;

  return (
    <div className="mb-6 lg:mb-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-950 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight text-white sm:text-lg">
                  Delivery Pipeline
                </h2>
                <p className="mt-0.5 text-xs text-indigo-200/90 sm:text-sm">
                  Live workflow — next {daysAhead} days &amp; overdue orders
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
                {pipelineItems.length} active
              </span>
              {overdueCount > 0 && (
                <span className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white shadow-sm">
                  {overdueCount} overdue
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4 sm:p-5 lg:p-6">
          {pipelineItems.length > 0 ? (
            pipelineItems.map((model) => (
              <PipelineRow key={model.workId} model={model} basePath={basePath} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
              <Package className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No orders in the delivery window</p>
              <p className="mt-1 max-w-sm text-xs text-slate-400">
                Works due in the next {daysAhead} days will appear here with their production stages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
