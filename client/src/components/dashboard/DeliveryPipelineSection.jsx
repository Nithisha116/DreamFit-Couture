import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Package,
  Sparkles,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useOrdersPipeline from "../../hooks/useOrdersPipeline";
import { buildOrderPipelineViewModel } from "../../utils/deliveryPipelineUtils";

function StageNode({ stage, isLast }) {
  const { state, label, shortLabel } = stage;
  const isCompleted = state === "completed";
  const isActive = state === "active";
  const isDelayed = state === "delayed";

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
                : isDelayed
                  ? "border-red-300 bg-red-50 text-red-500"
                  : "border-slate-200 bg-slate-50 text-slate-400",
          ].join(" ")}
        >
          {isCompleted ? (
            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />
          ) : isDelayed ? (
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
          ) : (
            shortLabel
          )}
        </div>
        <span
          className={[
            "mt-1.5 max-w-[72px] truncate text-center text-[9px] sm:text-[10px] font-semibold leading-tight",
            isCompleted ? "text-emerald-700" : isActive ? "text-violet-700" : isDelayed ? "text-red-600" : "text-slate-400",
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
  const navigate = useNavigate();
  const targetUrl = `${basePath}/orders/${model.orderMongoId}`;

  const deliveryLabel = model.deliveryDate
    ? format(new Date(model.deliveryDate), "dd MMM yyyy")
    : "—";

  // Already deduped-by-worker and capped to MAX_VISIBLE_ASSIGNEES upstream
  // (buildOrderPipelineViewModel) — no further filtering needed here.
  const visibleAssignments = model.assignments || [];

  return (
    <div
      onClick={() => navigate(targetUrl)}
      className="group cursor-pointer rounded-xl border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50/80 p-4 shadow-sm transition-all duration-300 hover:border-violet-100 hover:shadow-md"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={targetUrl}
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
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-slate-500">
                <span className="font-medium text-slate-600">{model.customerName}</span>
                <span className="mx-1.5 text-slate-300">·</span>
                <span>Due {deliveryLabel}</span>
              </p>

              {/* Assigned Worker Info — deduped by worker, capped upstream */}
              {visibleAssignments.length > 0 && (
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  {visibleAssignments.map((asgn, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                         👤 {asgn.workerName}
                      </span>
                      {asgn.assignedAt && (
                        <span className="text-[9px] text-slate-400">
                          {format(new Date(asgn.assignedAt), 'dd MMM')}
                        </span>
                      )}
                    </div>
                  ))}
                  {model.assignmentsOverflowCount > 0 && (
                    <span className="text-[9px] font-semibold text-slate-400">
                      +{model.assignmentsOverflowCount} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
            <span className="rounded-lg bg-violet-50 px-2 py-1 font-semibold text-violet-800 ring-1 ring-violet-100">
              {model.currentStageLabel}
            </span>
            <span className="text-slate-400">
              {model.garmentCount} garment{model.garmentCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <Link
          to={targetUrl}
          className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-violet-600 opacity-0 transition-opacity group-hover:opacity-100 lg:inline-flex"
        >
          View job <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
  basePath = "/admin",
}) {
  const { orders } = useOrdersPipeline();
  // null = combined default view (today's existing mixed presentation);
  // "upcoming" / "overdue" = the order clicked one of the header badges.
  const [activeTab, setActiveTab] = useState(null);

  const { allItems, upcomingItems, overdueItems } = useMemo(() => {
    const mapped = orders.map((order) => buildOrderPipelineViewModel(order));
    return {
      allItems: mapped,
      upcomingItems: mapped.filter((m) => m.category === "upcoming"),
      overdueItems: mapped.filter((m) => m.category === "overdue"),
    };
  }, [orders]);

  const pipelineItems =
    activeTab === "upcoming" ? upcomingItems :
    activeTab === "overdue" ? overdueItems :
    allItems;

  const handleTabClick = (tab) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  const emptyState =
    activeTab === "overdue"
      ? {
          title: "No overdue orders",
          subtitle: "Orders past their due date will appear here.",
        }
      : activeTab === "upcoming"
        ? {
            title: "No orders due soon",
            subtitle: "Orders due within the next 3 days will appear here.",
          }
        : {
            title: "No orders in the delivery window",
            subtitle: "Orders due soon or overdue will appear here with their production stages.",
          };

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

              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleTabClick("upcoming")}
                aria-pressed={activeTab === "upcoming"}
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition-colors",
                  activeTab === "upcoming"
                    ? "bg-white text-indigo-900 ring-white"
                    : "bg-white/10 text-white ring-white/15 hover:bg-white/20",
                ].join(" ")}
              >
                {upcomingItems.length} upcoming
              </button>
              {overdueItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleTabClick("overdue")}
                  aria-pressed={activeTab === "overdue"}
                  className={[
                    "rounded-full px-3 py-1 text-xs font-bold shadow-sm transition-colors",
                    activeTab === "overdue"
                      ? "bg-white text-red-700 ring-1 ring-white"
                      : "bg-red-500/90 text-white hover:bg-red-500",
                  ].join(" ")}
                >
                  {overdueItems.length} overdue
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 lg:p-6">
          {pipelineItems.length > 0 ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 transition-colors">
              {pipelineItems.map((model) => (
                <PipelineRow key={model.orderMongoId} model={model} basePath={basePath} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
              <Package className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">{emptyState.title}</p>
              <p className="mt-1 max-w-sm text-xs text-slate-400">{emptyState.subtitle}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
