import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle, ScanLine, Ruler, ClipboardList, AlertCircle } from "lucide-react";
import { parseQrPayload } from "../../workflow/workflowEngine";
import { getWorkflowJobByTrackingId } from "../../workflow/workflowStorage";
import WorkflowStageTimeline from "../../components/workflow/WorkflowStageTimeline";
import showToast from "../../utils/toast";

import API from "../../app/axios";

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

/** Split additional notes/instructions into bullet lines */
function parseNotes(text) {
  if (!text || typeof text !== "string") return [];
  return text
    .split(/[\n•\-;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function WorkflowScanPage() {
  const { trackingId: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const basePath = user?.role === "STORE_KEEPER" ? "/storekeeper" : "/admin";

  const wfParam = searchParams.get("wf") || paramId;
  const [result, setResult] = useState(null);
  const [job, setJob] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!wfParam) return;
    const id = wfParam.startsWith("{") ? parseQrPayload(wfParam)?.wf : wfParam;
    if (!id) return;

    // Show initial data if available from local storage or previous navigation state
    const existing = getWorkflowJobByTrackingId(id);
    if (existing) setJob(existing);

    const scanQr = async () => {
      setScanning(true);
      try {
        const response = await API.post(`/workflow/works/${id}/scan`);
        const { data, message } = response.data;
        
        setResult({ ok: true, message });
        
        // Use updated work data from backend
        // Since getWorkflowJobByTrackingId uses local cache, we map the backend payload
        const updatedJob = {
          ...(existing || {}),
          ...data,
          garmentName: data.garment?.name || existing?.garmentName || "Garment",
          orderId: data.order?.orderId || existing?.orderId || "",
          priority: data.garment?.priority || existing?.priority || "normal",
          // Map stage details
          currentStageLabel: data.currentStage ? data.currentStage.charAt(0).toUpperCase() + data.currentStage.slice(1) : (existing?.currentStageLabel || "Updated"),
          // Map measurements & notes
          measurements: data.garment?.measurements || existing?.measurements || [],
          measurementSource: data.garment?.measurementSource || existing?.measurementSource || "template",
          measurementTemplateName: data.garment?.measurementTemplate?.name || existing?.measurementTemplateName || null,
          additionalInfo: data.garment?.additionalInfo || existing?.additionalInfo || "",
          cuttingNotes: data.cuttingNotes || existing?.cuttingNotes || "",
          tailorNotes: data.tailorNotes || existing?.tailorNotes || "",
        };
        
        setJob(updatedJob);
        showToast.success(message);
      } catch (err) {
        console.error("Scan Error:", err);
        const errMsg = err.response?.data?.message || err.message || "Scan failed";
        setResult({ ok: false, error: errMsg });
        showToast.error(errMsg);
      } finally {
        setScanning(false);
      }
    };

    scanQr();
  }, [wfParam]);

  // Normalize measurements & notes for render
  const measurements = useMemo(() => {
    return normalizeMeasurements(job?.measurements);
  }, [job?.measurements]);

  const allNotes = useMemo(() => {
    return [
      ...parseNotes(job?.additionalInfo),
      ...parseNotes(job?.cuttingNotes),
      ...parseNotes(job?.tailorNotes),
    ];
  }, [job?.additionalInfo, job?.cuttingNotes, job?.tailorNotes]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-violet-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-5 sm:p-6 text-center my-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
          {result?.ok ? (
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          ) : (
            <ScanLine className="h-8 w-8 text-violet-600 animate-pulse" />
          )}
        </div>
        
        <h1 className="text-lg font-black text-slate-900">
          {scanning ? "Processing Scan..." : result?.ok ? "Stage Updated Successfully" : "Workflow Scan"}
        </h1>

        {result?.ok && job && (
          <div className="mt-3 text-slate-700">
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {job.garmentName}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Order {job.orderId}
            </p>
            
            <p className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold mt-2">
              Current: {job.currentStageLabel}
            </p>

            <div className="mt-4 text-left border-t border-slate-100 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Stage Timeline</p>
              <WorkflowStageTimeline job={job} compact />
            </div>

            {/* ── Measurements Section ── */}
            {measurements.length > 0 && (
              <div className="mt-5 text-left border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Ruler className="h-4 w-4 text-violet-600" />
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Garment Measurements</p>
                  {job.measurementTemplateName && (
                    <span className="ml-auto text-[9px] font-extrabold bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded uppercase">
                      {job.measurementTemplateName}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {measurements.map((m, i) => (
                    <div key={i} className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 capitalize truncate max-w-[70%]">{m.label}</span>
                      <span className="font-bold text-slate-900 shrink-0">
                        {m.value}
                        <span className="text-[10px] font-normal text-slate-400 ml-0.5">{m.unit || "in"}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Special Instructions Section ── */}
            {allNotes.length > 0 && (
              <div className="mt-5 text-left border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <ClipboardList className="h-4 w-4 text-amber-600" />
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Special Instructions</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 space-y-1.5 max-h-48 overflow-y-auto">
                  {allNotes.map((note, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-amber-900 leading-snug">
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
                <span className="text-[10px] font-bold text-red-700 leading-tight">High priority order. Please expedite!</span>
              </div>
            )}
          </div>
        )}

        {result && !result.ok && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-left flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-800">Scan Failed</h3>
              <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{result.error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-6">
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
