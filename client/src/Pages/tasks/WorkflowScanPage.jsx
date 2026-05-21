import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle, ScanLine } from "lucide-react";
import { advanceStageByTrackingId, parseQrPayload } from "../../workflow/workflowEngine";
import { getWorkflowJobByTrackingId } from "../../workflow/workflowStorage";
import WorkflowStageTimeline from "../../components/workflow/WorkflowStageTimeline";
import showToast from "../../utils/toast";

export default function WorkflowScanPage() {
  const { trackingId: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const basePath = user?.role === "STORE_KEEPER" ? "/storekeeper" : "/admin";

  const wfParam = searchParams.get("wf") || paramId;
  const [result, setResult] = useState(null);
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (!wfParam) return;
    const id = wfParam.startsWith("{") ? parseQrPayload(wfParam)?.wf : wfParam;
    if (!id) return;

    const existing = getWorkflowJobByTrackingId(id);
    setJob(existing);

    const res = advanceStageByTrackingId(id, "qr");
    setResult(res);
    if (res.ok) {
      setJob(res.job);
      showToast.success(
        res.nextKey
          ? `${res.activeKey} done → ${res.nextKey} active`
          : "All stages complete — packed / ready",
      );
    } else {
      showToast.error(res.error || "Scan failed");
    }
  }, [wfParam]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-violet-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
          {result?.ok ? (
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          ) : (
            <ScanLine className="h-8 w-8 text-violet-600" />
          )}
        </div>
        <h1 className="text-lg font-black text-slate-900">
          {result?.ok ? "Stage updated" : "Workflow scan"}
        </h1>
        {result?.ok && job && (
          <>
            <p className="text-sm text-slate-600 mt-2">
              {job.garmentName} · {job.orderId}
            </p>
            <p className="text-xs font-semibold text-violet-700 mt-1">
              Now at: {job.currentStageLabel}
            </p>
            <div className="mt-4 text-left">
              <WorkflowStageTimeline job={job} />
            </div>
          </>
        )}
        {result && !result.ok && (
          <p className="text-sm text-red-600 mt-2">{result.error}</p>
        )}
        <div className="flex flex-col gap-2 mt-6">
          {job && (
            <Link
              to={`${basePath}/tasks/job/${job.workflowTrackingId}`}
              className="rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white"
            >
              View job card
            </Link>
          )}
          <button
            type="button"
            onClick={() => navigate(`${basePath}/tasks`)}
            className="rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600"
          >
            Back to tasks
          </button>
        </div>
      </div>
    </div>
  );
}
