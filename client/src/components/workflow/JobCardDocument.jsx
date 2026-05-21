import { useMemo, useRef } from "react";
import { format } from "date-fns";
import WorkflowStageTimeline from "./WorkflowStageTimeline";
import { PIPELINE_STAGE_DEFS } from "../../workflow/workflowConstants";

function imageUrl(img) {
  if (!img) return null;
  if (typeof img === "string") return img.startsWith("http") ? img : `/uploads/${img}`;
  return img.url || img.path || null;
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
  const activeKey = job.currentStageKey;
  const assignee = job.stages?.[activeKey]?.assignedTo;

  const garment = work?.garment || job.garment;
  const measurements = work?.measurements || garment?.measurements || [];
  const refImages = [
    ...(garment?.referenceImages || []),
    ...(work?.garment?.referenceImages || []),
  ];
  const custImages = [
    ...(garment?.customerImages || []),
    ...(garment?.customerClothImages || []),
  ];
  const allImages = [...refImages, ...custImages].map(imageUrl).filter(Boolean);

  const stageHistory = (job.stageKeys || [])
    .map((key) => {
      const s = job.stages?.[key];
      if (!s?.completedAt && s?.state !== "active") return null;
      return {
        key,
        label: PIPELINE_STAGE_DEFS[key]?.label || key,
        state: s.state,
        at: s.completedAt,
        by: s.completedBy,
        assignee: s.assignedTo?.name,
      };
    })
    .filter(Boolean);

  return (
    <div id="job-card-print" className="bg-white text-slate-900 p-8 max-w-2xl mx-auto print:p-6">
      <div className="border-b-2 border-violet-900 pb-4 mb-6 flex justify-between items-start gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-violet-700">
            DreamFit Couture — Job Card
          </p>
          <h1 className="text-2xl font-black text-slate-900 mt-1">{job.garmentName}</h1>
          <p className="text-sm text-slate-600 mt-1">
            Order <span className="font-mono font-bold">{job.orderId}</span>
            {job.workCode && (
              <>
                {" "}
                · Work <span className="font-mono">{job.workCode}</span>
              </>
            )}
          </p>
          <p className="text-xs text-violet-700 font-bold mt-2">
            Active stage: {job.currentStageLabel}
          </p>
        </div>
        {showQr && qrUrl && (
          <div ref={qrRef} className="text-center shrink-0">
            <img
              src={qrUrl}
              alt="Workflow QR"
              className="w-[140px] h-[140px] rounded-lg border border-slate-200"
            />
            <p className="text-[9px] text-slate-500 mt-1 max-w-[140px]">Scan to advance workflow</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase">Customer</p>
          <p className="font-semibold">{job.customerName}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase">Due date</p>
          <p className="font-semibold">{dueLabel}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase">Category</p>
          <p>{job.categoryName || garment?.categoryName || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase">Item</p>
          <p>{job.itemName || garment?.itemName || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase">Priority</p>
          <p className="capitalize font-semibold">{job.priority || "normal"}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase">Assigned</p>
          <p>{assignee?.name ? `${assignee.name} (${assignee.role})` : "Unassigned"}</p>
        </div>
      </div>

      {measurements.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Measurements</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {measurements.map((m, i) => (
              <div
                key={m.field || m.name || i}
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {m.label || m.field || m.name}
                </p>
                <p className="font-semibold text-slate-800">
                  {m.value}
                  {m.unit ? ` ${m.unit}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {allImages.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Reference images</p>
          <div className="flex flex-wrap gap-2">
            {allImages.slice(0, 6).map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="h-20 w-20 object-cover rounded-lg border border-slate-200"
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <p className="text-xs font-bold text-slate-400 uppercase mb-3">Workflow pipeline</p>
        <WorkflowStageTimeline job={job} />
      </div>

      {stageHistory.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Stage history</p>
          <ul className="space-y-1 text-sm">
            {stageHistory.map((h) => (
              <li key={h.key} className="flex flex-wrap gap-2 text-slate-700">
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

      <div className="text-[10px] text-slate-400 border-t pt-3 font-mono break-all">
        Tracking: {job.workflowTrackingId}
      </div>
    </div>
  );
}
