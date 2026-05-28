import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import {
  CheckCircle,
  ScanLine,
  Ruler,
  ClipboardList,
  AlertCircle,
  User,
  Loader2,
} from "lucide-react";
import {
  advanceStageByTrackingId,
  getActiveStageKey,
  parseQrPayload,
} from "../../workflow/workflowEngine";
import {
  WORKFLOW_CHANGED_EVENT,
  getStageLabelFromDef,
} from "../../workflow/workflowConstants";
import { findWorkflowJob } from "../../workflow/workflowStorage";
import useWorkflowJobs from "../../hooks/useWorkflowJobs";
import WorkflowStageTimeline from "../../components/workflow/WorkflowStageTimeline";
import showToast from "../../utils/toast";

/** Normalize raw measurements from various data shapes into [{label, value, unit}] */
function normalizeMeasurements(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((m) => ({
        label: m.label || m.name || m.field || "",
        value: m.value !== undefined && m.value !== null && m.value !== "" ? m.value : null,
        unit: m.unit || "",
      }))
      .filter((m) => m.label && m.value !== null);
  }
  if (typeof raw === "object") {
    return Object.entries(raw)
      .map(([k, v]) => ({
        label: k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim(),
        value: v,
        unit: "",
      }))
      .filter((m) => m.value !== null && m.value !== undefined && m.value !== "");
  }
  return [];
}

function parseNotes(text) {
  if (!text || typeof text !== "string") return [];
  return text
    .split(/[\n•\-;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function resolveTrackingId(wfParam) {
  if (!wfParam) return null;
  if (wfParam.startsWith("{")) return parseQrPayload(wfParam)?.wf || null;
  return wfParam;
}

export default function WorkflowScanPage() {
  const { trackingId: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const basePath = user?.role === "STORE_KEEPER" ? "/storekeeper" : "/admin";

  const wfParam = searchParams.get("wf") || paramId;
  const trackingId = useMemo(() => resolveTrackingId(wfParam), [wfParam]);

  const { jobs: workflowJobs, refresh: refreshWorkflowJobs, version } = useWorkflowJobs();
  const [job, setJob] = useState(null);
  const [loadState, setLoadState] = useState("loading");
  const [completing, setCompleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const retriedLoadRef = useRef(false);

  const reloadJob = useCallback(() => {
    if (!trackingId) {
      setLoadState("missing");
      return;
    }
    const found =
      findWorkflowJob(trackingId) ||
      workflowJobs.find(
        (j) =>
          j.workflowTrackingId === trackingId ||
          j.workCode === trackingId ||
          j.orderId === trackingId,
      ) ||
      null;
    if (found) {
      setJob(found);
      setLoadState("ready");
    } else {
      setJob(null);
      setLoadState("not_found");
    }
  }, [trackingId, workflowJobs]);

  useEffect(() => {
    setJustCompleted(false);
    reloadJob();
  }, [reloadJob, version]);

  useEffect(() => {
    if (trackingId && loadState === "not_found" && !retriedLoadRef.current) {
      retriedLoadRef.current = true;
      refreshWorkflowJobs();
    }
  }, [trackingId, loadState, refreshWorkflowJobs]);

  useEffect(() => {
    const onChange = () => reloadJob();
    window.addEventListener(WORKFLOW_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(WORKFLOW_CHANGED_EVENT, onChange);
  }, [reloadJob]);

  const activeKey = job ? getActiveStageKey(job) : null;
  const assignee = activeKey ? job?.stages?.[activeKey]?.assignedTo : null;
  const isWorkflowComplete = job?.lifecycleStatus === "completed";

  const finishButtonLabel = useMemo(() => {
    if (!job || !activeKey || isWorkflowComplete) return null;
    const label = getStageLabelFromDef(activeKey, job.workflowStages);
    return `${label} Finished`;
  }, [job, activeKey, isWorkflowComplete]);

  const completedHistory = useMemo(() => {
    if (!job) return [];
    const keys = (job.stageKeys || []).filter((k) => k != null && k !== "");
    return keys
      .filter((k) => job.stages?.[k]?.state === "completed" && job.stages[k].completedAt)
      .map((k) => ({
        key: k,
        label: getStageLabelFromDef(k, job.workflowStages),
        at: job.stages[k].completedAt,
      }));
  }, [job]);

  const measurements = useMemo(
    () => normalizeMeasurements(job?.measurements),
    [job?.measurements],
  );

  const allNotes = useMemo(
    () => [
      ...parseNotes(job?.additionalInfo),
      ...parseNotes(job?.cuttingNotes),
      ...parseNotes(job?.tailorNotes),
    ],
    [job?.additionalInfo, job?.cuttingNotes, job?.tailorNotes],
  );

  const handleCompleteStage = () => {
    if (!trackingId || completing || isWorkflowComplete) return;
    setCompleting(true);
    const actualTrackingId =
  job?.workflowTrackingId || trackingId;

const res = advanceStageByTrackingId(actualTrackingId, "manual");
    setCompleting(false);

    if (res.ok) {
      setJob(res.job);
      setJustCompleted(true);
      refreshWorkflowJobs();
      if (res.nextKey) {
        const nextLabel = getStageLabelFromDef(res.nextKey, res.job.workflowStages);
        showToast.success(`${getStageLabelFromDef(res.activeKey, res.job.workflowStages)} completed — ${nextLabel} is now active`);
      } else {
        showToast.success("All stages completed — ready for delivery");
      }
    } else {
      showToast.error(res.error || "Could not complete stage");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-violet-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-5 sm:p-6 text-center my-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
          {loadState === "ready" ? (
            <ScanLine className="h-8 w-8 text-violet-600" />
          ) : loadState === "not_found" ? (
            <AlertCircle className="h-8 w-8 text-red-500" />
          ) : (
            <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
          )}
        </div>

        <h1 className="text-lg font-black text-slate-900">
          {loadState === "loading"
            ? "Loading workflow…"
            : loadState === "not_found"
              ? "Job not found"
              : justCompleted
                ? "Stage completed"
                : "Production workflow"}
        </h1>

        {loadState === "ready" && job && (
          <div className="mt-3 text-slate-700">
            <h2 className="text-base font-bold text-slate-900 leading-tight">{job.garmentName}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Order {job.orderId}
              {job.workCode ? ` · ${job.workCode}` : ""}
            </p>
            {job.customerName && (
              <p className="text-xs text-slate-600 mt-1">{job.customerName}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {!isWorkflowComplete && activeKey && (
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold">
                  Active: {getStageLabelFromDef(activeKey, job.workflowStages)}
                </span>
              )}
              {isWorkflowComplete && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Workflow complete
                </span>
              )}
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-left flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Assigned to
                </p>
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {assignee?.name
                    ? `${assignee.name}${assignee.role ? ` (${assignee.role})` : ""}`
                    : "Unassigned"}
                </p>
              </div>
            </div>

            <div className="mt-4 text-left border-t border-slate-100 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Workflow timeline
              </p>
              <WorkflowStageTimeline job={job} variant="vertical" />
            </div>

            {completedHistory.length > 0 && (
              <div className="mt-4 text-left border-t border-slate-100 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Completion history
                </p>
                <ul className="space-y-1 text-xs text-slate-600">
                  {completedHistory.map((h) => (
                    <li key={h.key} className="flex justify-between gap-2">
                      <span className="font-medium text-emerald-700">✓ {h.label}</span>
                      <span className="text-slate-400 shrink-0">
                        {format(new Date(h.at), "dd MMM HH:mm")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {measurements.length > 0 && (
              <div className="mt-5 text-left border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Ruler className="h-4 w-4 text-violet-600" />
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Garment measurements
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {measurements.map((m, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1.5 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-500 capitalize truncate max-w-[70%]">{m.label}</span>
                      <span className="font-bold text-slate-900 shrink-0">
                        {m.value}
                        <span className="text-[10px] font-normal text-slate-400 ml-0.5">
                          {m.unit || "in"}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {allNotes.length > 0 && (
              <div className="mt-5 text-left border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <ClipboardList className="h-4 w-4 text-amber-600" />
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Special instructions
                  </p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 space-y-1.5 max-h-48 overflow-y-auto">
                  {allNotes.map((note, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-1.5 text-xs text-amber-900 leading-snug text-left"
                    >
                      <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full bg-amber-200 text-[8px] font-black text-amber-700 flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {job.priority === "high" && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-100 p-2.5 flex items-center gap-2 text-left">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span className="text-[10px] font-bold text-red-700 leading-tight">
                  High priority order. Please expedite!
                </span>
              </div>
            )}
          </div>
        )}

        {loadState === "not_found" && (
          <p className="mt-3 text-sm text-slate-500">
            This QR code does not match a workflow job on this device. Open Tasks after creating
            an order, or scan from the same browser session.
          </p>
        )}

        <div className="flex flex-col gap-2 mt-6">
          {finishButtonLabel && (
            <button
              type="button"
              onClick={handleCompleteStage}
              disabled={completing}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 py-3.5 text-base font-black text-white transition-all shadow-lg shadow-violet-300/40 disabled:opacity-60"
            >
              {completing ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating…
                </span>
              ) : (
                finishButtonLabel
              )}
            </button>
          )}

          {job && (
            <Link
              to={`${basePath}/tasks/job/${job.workflowTrackingId}`}
              className="rounded-xl bg-violet-600 hover:bg-violet-700 py-2.5 text-sm font-bold text-white transition-all shadow-md shadow-violet-200"
            >
              View Full Job Card
            </Link>
          )}
          <button
            type="button"
            onClick={() => navigate(`${basePath}/tasks`)}
            className="rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
