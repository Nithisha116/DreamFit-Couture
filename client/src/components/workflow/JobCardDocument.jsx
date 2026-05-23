import { useMemo, useRef } from "react";
import { format } from "date-fns";
import WorkflowStageTimeline from "./WorkflowStageTimeline";
import { PIPELINE_STAGE_DEFS, getStageLabelFromDef } from "../../workflow/workflowConstants";

/* ── Print-safe CSS injected once ─────────────────────────────── */
const PRINT_STYLES = `
@media print {
  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  #job-card-print { padding: 12mm !important; max-width: 100% !important; font-size: 11px !important; }
  #job-card-print * { break-inside: avoid; }
  .jc-section { page-break-inside: avoid; break-inside: avoid; margin-bottom: 10px !important; }
  .jc-header { page-break-after: avoid; }
  .jc-measurement-grid { page-break-inside: avoid; }
  .jc-notes { page-break-inside: avoid; }
  .jc-images { page-break-inside: avoid; }
  .jc-images img { max-height: 70px !important; width: 70px !important; }
  .jc-qr img { width: 110px !important; height: 110px !important; }
  .jc-footer { page-break-before: avoid; }
}
`;

function imageUrl(img) {
  if (!img) return null;
  const backendUrl = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://dreamfitcouture-1.onrender.com";

  if (typeof img === "string") {
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads")) return `${backendUrl}${img}`;
    return `${backendUrl}/uploads/${img}`;
  }

  const path = img.url || img.path || null;
  if (path) {
    if (path.startsWith("http")) return path;
    if (path.startsWith("/uploads")) return `${backendUrl}${path}`;
    return `${backendUrl}/uploads/${path}`;
  }
  return null;
}

/** Normalise raw measurements into [{label, value, unit}] */
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

/** Split notes text into bullet lines */
function parseNotes(text) {
  if (!text || typeof text !== "string") return [];
  return text
    .split(/[\n•\-;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function JobCardDocument({ job, work = null, showQr = true }) {
  const qrRef = useRef(null);

  const qrUrl = useMemo(() => {
    if (!job || !showQr) return "";
    const base = window.location.pathname.startsWith("/storekeeper")
      ? "/storekeeper"
      : "/admin";
    const scanUrl = `${window.location.origin}${base}/tasks/scan?wf=${job.workflowTrackingId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(scanUrl)}`;
  }, [job, showQr]);

  if (!job) return null;

  const dueLabel = job.dueDate ? format(new Date(job.dueDate), "dd MMM yyyy") : "—";
  const garment = work?.garment || job.garment;

  // ── Measurements ──
  const rawMeasurements = work?.measurements || garment?.measurements || job.measurements || [];
  const measurements = normalizeMeasurements(rawMeasurements);

  const templateName =
    work?.measurementTemplate?.name ||
    garment?.measurementTemplate?.name ||
    job.measurementTemplateName ||
    null;

  const measurementSource =
    work?.measurementSource || garment?.measurementSource || job.measurementSource || null;

  // ── Special Notes ──
  const additionalInfo = garment?.additionalInfo || work?.garment?.additionalInfo || job.additionalInfo || "";
  const cuttingNotes = work?.cuttingNotes || job.cuttingNotes || "";
  const tailorNotes = work?.tailorNotes || job.tailorNotes || "";
  const allNotes = [...parseNotes(additionalInfo), ...parseNotes(cuttingNotes), ...parseNotes(tailorNotes)];

  // ── Images ──
  const refImages = [...(garment?.referenceImages || []), ...(work?.garment?.referenceImages || [])];
  const custImages = [...(garment?.customerImages || []), ...(garment?.customerClothImages || [])];
  const allImages = [...refImages, ...custImages].map(imageUrl).filter(Boolean);

  // ── Stage History ──
  const stageHistory = (job.stageKeys || [])
    .map((key) => {
      const s = job.stages?.[key];
      if (!s?.completedAt && s?.state !== "active") return null;
      return {
        key,
        label: getStageLabelFromDef(key, job?.workflowStages),
        state: s.state,
        at: s.completedAt,
        by: s.completedBy,
        assignee: s.assignedTo?.name,
      };
    })
    .filter(Boolean);

  return (
    <>
      {/* Inject print-safe CSS */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

      <div id="job-card-print" className="bg-white text-slate-900 p-8 max-w-2xl mx-auto">
        {/* ── 1. Header + QR ── */}
        <div className="jc-header jc-section border-b-2 border-violet-900 pb-4 mb-5 flex justify-between items-start gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700">
              DreamFit Couture — Job Card
            </p>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{job.garmentName}</h1>
            <p className="text-sm text-slate-600 mt-1">
              Order <span className="font-mono font-bold">{job.orderId}</span>
              {job.workCode && (
                <> · Work <span className="font-mono">{job.workCode}</span></>
              )}
            </p>
            <p className="text-xs text-violet-700 font-bold mt-2">
              Active stage: {job.currentStageLabel}
            </p>
          </div>
          {showQr && qrUrl && (
            <div ref={qrRef} className="jc-qr text-center shrink-0">
              <img
                src={qrUrl}
                crossOrigin="anonymous"
                alt="Workflow QR"
                className="w-[120px] h-[120px] rounded-lg border border-slate-200"
              />
              <p className="text-[9px] text-slate-500 mt-1 max-w-[120px]">Scan to advance</p>
            </div>
          )}
        </div>

        {/* ── 2. Order Details Grid ── */}
        <div className="jc-section grid grid-cols-3 gap-3 text-sm mb-5">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Customer</p>
            <p className="font-semibold truncate">{job.customerName}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Due Date</p>
            <p className="font-semibold">{dueLabel}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Priority</p>
            <p className="capitalize font-semibold">{job.priority || "normal"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Category</p>
            <p className="truncate">{job.categoryName || garment?.categoryName || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Item</p>
            <p className="truncate">{job.itemName || garment?.itemName || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
            <p className="capitalize font-semibold text-violet-700">{job.workStatus || "pending"}</p>
          </div>
        </div>

        {/* ── 3. Worker Responsibilities ── */}
        <div className="jc-section mb-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 border-b border-slate-100 pb-1.5">
            Worker Responsibilities
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {job.stageKeys?.map((key) => {
              const s = job.stages?.[key];
              const workerName = s?.assignedTo?.name || "Unassigned";
              const workerRole = s?.assignedTo?.role || "Pending";
              const label = getStageLabelFromDef(key, job?.workflowStages);
              return (
                <div key={key} className="rounded-lg bg-slate-50 border border-slate-100 p-2.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="font-semibold text-slate-800 mt-0.5 truncate text-xs">{workerName}</p>
                  <p className="text-[9px] text-slate-500 capitalize">{workerRole}</p>
                  {s?.state === "completed" && (
                    <span className="inline-block mt-0.5 text-[8px] font-bold bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded uppercase">Done</span>
                  )}
                  {s?.state === "active" && (
                    <span className="inline-block mt-0.5 text-[8px] font-bold bg-violet-100 text-violet-700 px-1 py-0.5 rounded uppercase">Active</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. Measurements — GRID CARDS ONLY ── */}
        {measurements.length > 0 && (
          <div className="jc-section jc-measurement-grid mb-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                📐 Measurements
              </p>
              <div className="flex items-center gap-1.5">
                {templateName && (
                  <span className="text-[8px] font-bold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full uppercase">
                    {templateName}
                  </span>
                )}
                {measurementSource && (
                  <span className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full capitalize">
                    {measurementSource}
                  </span>
                )}
              </div>
            </div>

            {/* Single premium grid — no duplicate table */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {measurements.map((m, i) => (
                <div
                  key={`m-${m.label}-${i}`}
                  className="rounded-lg border border-violet-100 bg-violet-50 px-2 py-2 text-center"
                >
                  <p className="text-[8px] font-bold text-violet-400 uppercase truncate leading-tight">{m.label}</p>
                  <p className="font-black text-violet-900 text-sm leading-tight mt-0.5">
                    {m.value}
                    <span className="text-[8px] font-normal text-violet-400 ml-0.5">{m.unit || "in"}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 5. Special Instructions ── */}
        {allNotes.length > 0 && (
          <div className="jc-section jc-notes mb-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 border-b border-slate-100 pb-1.5 tracking-wider">
              📋 Special Instructions
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <ul className="space-y-1.5">
                {allNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-amber-900">
                    <span className="mt-0.5 shrink-0 h-3.5 w-3.5 rounded-full bg-amber-200 flex items-center justify-center text-[8px] font-black text-amber-700">
                      {i + 1}
                    </span>
                    <span className="leading-snug">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
            {job.priority === "high" && (
              <div className="mt-1.5 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5 flex items-center gap-2">
                <span className="text-[8px] font-black bg-red-600 text-white px-1 py-0.5 rounded uppercase">URGENT</span>
                <p className="text-[10px] font-semibold text-red-700">High-priority — complete ASAP</p>
              </div>
            )}
          </div>
        )}

        {/* Fallback for raw additionalInfo */}
        {allNotes.length === 0 && additionalInfo && (
          <div className="jc-section jc-notes mb-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 border-b border-slate-100 pb-1.5">
              📋 Special Instructions
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-xs text-amber-900 leading-relaxed">{additionalInfo}</p>
            </div>
          </div>
        )}

        {/* ── 6. Reference Images ── */}
        {allImages.length > 0 && (
          <div className="jc-section jc-images mb-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Reference Images</p>
            <div className="flex flex-wrap gap-2">
              {allImages.slice(0, 6).map((src, i) => (
                <img
                  key={i}
                  src={src}
                  crossOrigin="anonymous"
                  alt=""
                  className="h-16 w-16 object-cover rounded-lg border border-slate-200"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── 7. Workflow Pipeline ── */}
        <div className="jc-section mb-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Workflow Pipeline</p>
          <WorkflowStageTimeline job={job} />
        </div>

        {/* ── 8. Stage History ── */}
        {stageHistory.length > 0 && (
          <div className="jc-section mb-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Stage History</p>
            <ul className="space-y-1 text-xs">
              {stageHistory.map((h) => (
                <li key={h.key} className="flex flex-wrap gap-1.5 text-slate-700">
                  <span className="font-semibold">{h.label}</span>
                  <span className="text-slate-500 capitalize">{h.state}</span>
                  {h.at && (
                    <span className="text-slate-400">
                      {format(new Date(h.at), "dd MMM yyyy HH:mm")}
                    </span>
                  )}
                  {h.assignee && <span className="text-violet-700">· {h.assignee}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="jc-footer text-[9px] text-slate-400 border-t pt-2 font-mono break-all">
          Tracking: {job.workflowTrackingId}
        </div>
      </div>
    </>
  );
}
