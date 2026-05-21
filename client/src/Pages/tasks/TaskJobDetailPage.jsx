import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Download, Printer, QrCode, ScanLine } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import JobCardDocument from "../../components/workflow/JobCardDocument";
import WorkflowStageTimeline from "../../components/workflow/WorkflowStageTimeline";
import useWorkflowJobs from "../../hooks/useWorkflowJobs";
import { getWorkflowJobByTrackingId } from "../../workflow/workflowStorage";
import { advanceStageByTrackingId } from "../../workflow/workflowEngine";
import { fetchWorkById } from "../../features/work/workSlice";
import showToast from "../../utils/toast";

export default function TaskJobDetailPage() {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentWork, loading } = useSelector((state) => state.work);
  const basePath = user?.role === "STORE_KEEPER" ? "/storekeeper" : "/admin";

  const { jobs, refresh, version } = useWorkflowJobs([]);
  const job = useMemo(() => {
    return (
      jobs.find((j) => j.workflowTrackingId === trackingId) ||
      getWorkflowJobByTrackingId(trackingId)
    );
  }, [jobs, trackingId, version]);

  useEffect(() => {
    if (job?.workMongoId) {
      dispatch(fetchWorkById(job.workMongoId));
    }
  }, [job?.workMongoId, dispatch]);

  const workRecord = job?.workMongoId && currentWork?._id === job.workMongoId ? currentWork : null;

  const handlePrint = () => {
    const el = document.getElementById("job-card-print");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<html><head><title>Job Card ${job?.orderId}</title><style>body{font-family:system-ui,sans-serif;margin:0;padding:16px;}</style></head><body>${el.outerHTML}</body></html>`,
    );
    w.document.close();
    w.print();
  };

  const handlePdf = async () => {
    const el = document.getElementById("job-card-print");
    if (!el || !job) return;
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const imgW = pageW - margin * 2;
      const imgH = (canvas.height * imgW) / canvas.width;
      let y = margin;
      let remaining = imgH;
      let srcY = 0;
      const sliceH = ((pageH - margin * 2) * canvas.width) / imgW;

      while (remaining > 0) {
        if (y > margin) pdf.addPage();
        const pageSlice = Math.min(remaining, pageH - margin * 2);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = (pageSlice * canvas.width) / imgW;
        const ctx = sliceCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          srcY,
          canvas.width,
          sliceCanvas.height,
          0,
          0,
          canvas.width,
          sliceCanvas.height,
        );
        pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", margin, margin, imgW, pageSlice);
        srcY += sliceCanvas.height;
        remaining -= pageSlice;
        y = margin;
      }

      pdf.save(`job-card-${job.orderId || job.workflowTrackingId}.pdf`);
      showToast.success("PDF downloaded");
    } catch {
      showToast.error("PDF export failed");
    }
  };

  const handleAdvance = () => {
    const res = advanceStageByTrackingId(trackingId, "manual");
    if (res.ok) {
      showToast.success(
        res.nextKey
          ? `Stage completed — ${res.nextKey} is now active`
          : "Workflow completed — packed / ready",
      );
      refresh();
    } else {
      showToast.error(res.error || "Could not advance");
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-600 font-semibold">Job not found</p>
          <Link to={`${basePath}/tasks`} className="text-violet-600 text-sm font-bold mt-2 inline-block">
            Back to tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/90">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <button
          type="button"
          onClick={() => navigate(`${basePath}/tasks`)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tasks
        </button>

        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-950 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-indigo-200 uppercase tracking-wide font-bold">Production job card</p>
              <h1 className="text-xl font-black text-white">{job.garmentName}</h1>
              <p className="text-sm text-indigo-100 font-mono">{job.orderId}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white ring-1 ring-white/20 hover:bg-white/20"
              >
                <Printer className="h-4 w-4" /> Print
              </button>
              <button
                type="button"
                onClick={handlePdf}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/90 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600"
              >
                <Download className="h-4 w-4" /> PDF
              </button>
              <button
                type="button"
                onClick={handleAdvance}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500 px-3 py-2 text-xs font-bold text-white hover:bg-violet-400"
              >
                <ScanLine className="h-4 w-4" /> Complete stage
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            <WorkflowStageTimeline job={job} />
            {loading && job.workMongoId && (
              <p className="text-xs text-slate-500">Loading measurements & images…</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-700">
            <QrCode className="h-4 w-4 text-violet-600" />
            Printable job card (single QR for lifecycle)
          </div>
          <JobCardDocument job={job} work={workRecord} />
        </div>
      </div>
    </div>
  );
}
