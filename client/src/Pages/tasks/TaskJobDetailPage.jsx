import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Download, Printer, QrCode, ScanLine } from "lucide-react";
import JobCardDocument from "../../components/workflow/JobCardDocument";
import { exportJobCardToPdf } from "../../components/workflow/JobCardPDFExport";
import WorkflowStageTimeline from "../../components/workflow/WorkflowStageTimeline";
import StageActionModal from "../../components/common/StageActionModal";
import useWorkflowJobs from "../../hooks/useWorkflowJobs";
import { advanceStageByTrackingId, getActiveStageKey } from "../../workflow/workflowEngine";
import { extractOrderedStageKeys, getStageLabelFromDef } from "../../workflow/workflowConstants";
import { findWorkflowJob } from "../../workflow/workflowStorage";
import { fetchWorkById } from "../../features/work/workSlice";
import showToast from "../../utils/toast";



export default function TaskJobDetailPage() {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentWork, loading } = useSelector((state) => state.work);
  const basePath = user?.role === "STORE_KEEPER" ? "/storekeeper" : "/admin";

  const location = useLocation();

  const { jobs, refresh } = useWorkflowJobs();
  const job = useMemo(() => {
    return (
      findWorkflowJob(trackingId) ||
      jobs.find(
        (j) =>
          j.workflowTrackingId === trackingId ||
          j.workCode === trackingId ||
          j.orderId === trackingId,
      ) ||
      null
    );
  }, [jobs, trackingId]);

  useEffect(() => {
    if (job?.workMongoId) {
      dispatch(fetchWorkById(job.workMongoId));
    }
  }, [job?.workMongoId, dispatch]);

  const workRecord = job?.workMongoId && currentWork?._id === job.workMongoId ? currentWork : null;

  // Wait for the DOM to render the JobCardDocument before capturing
  useEffect(() => {
    if (!job || !workRecord) return;
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    if (action) {
      // Clear the query string so it doesn't run again on refresh
      navigate(location.pathname, { replace: true });
      
      // Delay slightly to ensure fonts/images in DOM are loaded
      setTimeout(() => {
        if (action === "print") handlePrint();
        if (action === "pdf") handlePdf();
      }, 500);
    }
  }, [job, workRecord, location.search, navigate]);

  const handlePrint = () => {
    const el = document.getElementById("job-card-print");
    if (!el) return;

    // Remove any existing print iframe
    const oldFrame = document.getElementById("print-iframe");
    if (oldFrame) oldFrame.remove();

    // Create a new iframe
    const iframe = document.createElement("iframe");
    iframe.id = "print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;

    // Copy stylesheets from main page to print iframe
    let stylesHtml = "";
    for (const sheet of document.styleSheets) {
      try {
        if (sheet.href) {
          stylesHtml += `<link rel="stylesheet" href="${sheet.href}">`;
        } else {
          const rules = Array.from(sheet.cssRules).map(rule => rule.cssText).join("\n");
          stylesHtml += `<style>${rules}</style>`;
        }
      } catch (e) {
        // Ignore CORS issues with external stylesheets
      }
    }

    doc.write(`
      <html>
        <head>
          <title>Job Card ${job?.orderId || ""}</title>
          ${stylesHtml}
          <style>
            body {
              font-family: system-ui, sans-serif;
              margin: 0;
              padding: 16px;
              background-color: white !important;
              color: black !important;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${el.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Wait for images (like QR code) and styles to load in the iframe
    iframe.contentWindow.focus();

    const images = doc.getElementsByTagName("img");
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    Promise.all(imagePromises).then(() => {
      setTimeout(() => {
        iframe.contentWindow.print();
      }, 300);
    });
  };

  const handlePdf = async () => {
    if (!job) return;
    const loadingToastId = showToast.loading("Preparing PDF...");
    try {
      await exportJobCardToPdf(job);
      showToast.dismiss(loadingToastId);
      showToast.success("PDF downloaded");
    } catch (err) {
      console.error("PDF export error:", err);
      showToast.dismiss(loadingToastId);
      showToast.error("PDF export failed");
    }
  };

  // ── Confirmation modal state ──────────────────────────
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const advancingRef = useRef(false); // guard against duplicate requests

  const handleOpenConfirm = useCallback(() => {
    if (advancingRef.current) return; // already in-flight
    setShowConfirmModal(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    if (isAdvancing) return; // don't close while request is in-flight
    setShowConfirmModal(false);
  }, [isAdvancing]);

  const handleConfirmAdvance = useCallback(async () => {
    if (advancingRef.current) return; // prevent duplicate
    advancingRef.current = true;
    setIsAdvancing(true);

    try {
      const res = await advanceStageByTrackingId(trackingId, "manual");
      if (res.ok) {
        setShowConfirmModal(false);
        await refresh();
        const completedLabel = stageContext?.currentStageLabel || "Stage";
        showToast.success(
          res.nextKey
            ? `${completedLabel} stage completed successfully`
            : "Workflow completed — packed / ready",
        );
      } else {
        showToast.error(res.error || "Unable to complete the stage. Please try again.");
      }
    } catch {
      showToast.error("Unable to complete the stage. Please try again.");
    } finally {
      setIsAdvancing(false);
      advancingRef.current = false;
    }
  }, [trackingId, refresh]);

  // ── Derive stage context for the modal ────────────────
  const stageContext = useMemo(() => {
    if (!job) return null;
    const keys = extractOrderedStageKeys(job);
    const activeKey = getActiveStageKey(job);
    const activeIdx = keys.indexOf(activeKey);
    const nextKey = activeIdx >= 0 && activeIdx < keys.length - 1 ? keys[activeIdx + 1] : null;
    return {
      jobName: job.garmentName || "Job",
      workCode: job.workCode || job.workflowTrackingId || "",
      currentStageLabel: activeKey
        ? getStageLabelFromDef(activeKey, job.workflowStages)
        : "Current",
      nextStageLabel: nextKey
        ? getStageLabelFromDef(nextKey, job.workflowStages)
        : null,
    };
  }, [job]);

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
                onClick={handleOpenConfirm}
                disabled={isAdvancing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500 px-3 py-2 text-xs font-bold text-white hover:bg-violet-400 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
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

        {/* Stage completion confirmation modal */}
        <StageActionModal
          isOpen={showConfirmModal}
          mode="confirm"
          onClose={handleCloseConfirm}
          onConfirm={handleConfirmAdvance}
          isUpdating={isAdvancing}
          stageContext={stageContext}
        />
      </div>
    </div>
  );
}