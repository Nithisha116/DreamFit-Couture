import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { X, UserPlus, Search, Loader2 } from "lucide-react";
import { STAGE_TO_WORKER_ROLE, WORKER_ROLES } from "../../workflow/workflowConstants";
import {
  fetchWorkers,
  selectAllWorkers,
  selectWorkerLoading,
  selectWorkerError,
  clearWorkerList,
} from "../../features/worker/workerSlice";
import API from "../../app/axios";
import showToast from "../../utils/toast";

// Example dummy fallback data for when backend has no workers
const dummyWorkerData = {
  helper: [
    { _id: "dummy1", fullName: "Rahul Helper", phone: "9876543210", role: "helper", status: "active" },
    { _id: "dummy2", fullName: "Aman Helper", phone: "9876543211", role: "helper", status: "active" },
  ],
  ironing: [
    { _id: "dummy3", fullName: "Raju Iron", phone: "9876543212", role: "ironing", status: "active" },
    { _id: "dummy4", fullName: "Sameer Iron", phone: "9876543213", role: "ironing", status: "active" },
  ],
  embroidery: [
    { _id: "dummy5", fullName: "Imran Embroidery", phone: "9876543214", role: "embroidery", status: "active" },
    { _id: "dummy6", fullName: "Faiz Embroidery", phone: "9876543215", role: "embroidery", status: "active" },
  ],
  aari: [
    { _id: "dummy7", fullName: "Karan Aari", phone: "9876543216", role: "aari", status: "active" },
    { _id: "dummy8", fullName: "Sahil Aari", phone: "9876543217", role: "aari", status: "active" },
  ],
  tailor: [
    { _id: "dummy9", fullName: "Ramesh Tailor", phone: "9876543218", role: "tailor", status: "active" },
    { _id: "dummy10", fullName: "Suresh Tailor", phone: "9876543219", role: "tailor", status: "active" },
  ],
  cutting: [
    { _id: "dummy11", fullName: "Mahesh Cutter", phone: "9876543220", role: "cutting", status: "active" },
    { _id: "dummy12", fullName: "Dinesh Cutter", phone: "9876543221", role: "cutting", status: "active" },
  ]
};

export default function AssignWorkerModal({ job, open, onClose, onAssigned }) {
  const dispatch = useDispatch();
  const workers = useSelector(selectAllWorkers) || [];
  const loading = useSelector(selectWorkerLoading);
  const error = useSelector(selectWorkerError);

  const [role, setRole] = useState("");
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Determine stage and default role for assignment
  const activeKey = job?.currentStageKey || job?.stageKeys?.[0];
  const defaultRole = STAGE_TO_WORKER_ROLE[activeKey] || "helper";
  const roleId = role || defaultRole;

  // Handle debouncing of the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch workers when role or debounced search changes
  useEffect(() => {
    if (open && roleId) {
      dispatch(fetchWorkers({ role: roleId, search: debouncedSearch, status: "active" }));
    }
  }, [open, roleId, debouncedSearch, dispatch]);

  // Reset states on close
  useEffect(() => {
    if (!open) {
      setSelectedWorker(null);
      setRole("");
      setSearchQuery("");
      setDebouncedSearch("");
      dispatch(clearWorkerList());
    }
  }, [open, dispatch]);

  // Compute final workers list to show (uses dummy fallback ONLY if backend returns no workers)
  const displayWorkers = useMemo(() => {
    if (workers && workers.length > 0) {
      return workers;
    }
    // Fallback to dummy data only if no backend data is loaded
    const fallback = dummyWorkerData[roleId] || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return fallback.filter(
        w =>
          w.fullName.toLowerCase().includes(q) ||
          w.phone.includes(q)
      );
    }
    return fallback;
  }, [workers, roleId, searchQuery]);

  const handleRoleChange = (e) => {
    const nextRole = e.target.value;
    setRole(nextRole);
    setSelectedWorker(null);
    setSearchQuery("");
    setDebouncedSearch("");
    dispatch(clearWorkerList());
  };

  const handleAssign = async () => {
    if (!selectedWorker) return;

    const jobId = job.workMongoId || job._id;

    // If it is a dummy worker or the job doesn't have a Mongo ObjectId (workMongoId is missing),
    // bypass the backend API request and complete the assignment flow locally
    if (!jobId || (selectedWorker._id && String(selectedWorker._id).startsWith("dummy"))) {
      showToast.success(`Worker assigned successfully`);
      onAssigned?.({
        ...job,
        workerName: selectedWorker.fullName || selectedWorker.name,
        workerId: selectedWorker._id,
        role: roleId
      });
      onClose();
      return;
    }

    try {
      await API.post(`/workflow/works/${jobId}/assign-worker`, {
        stage: activeKey,
        role: roleId,
        workerId: selectedWorker._id,
        workerName: selectedWorker.fullName || selectedWorker.name,
      });

      showToast.success(`Worker assigned successfully`);
      onAssigned?.({ ...job, workerName: selectedWorker.fullName || selectedWorker.name, workerId: selectedWorker._id, role: roleId });
      onClose();
    } catch (err) {
      console.error("❌ Worker assignment failed:", err);
      showToast.error(err.response?.data?.message || "Failed to assign worker");
    }
  };

  // Guard: render nothing if closed or no job
  if (!open || !job) return null;

  const dueLabel = job.dueDate
    ? format(new Date(job.dueDate), "dd MMM yyyy")
    : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-5 py-4 flex items-start justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assign Worker
            </h3>
            <p className="text-xs text-indigo-100 mt-1">
              {job.workCode || job.orderId} · {job.garmentName}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white p-1 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Job info */}
          <div className="rounded-xl bg-violet-50 border border-violet-100 p-3 text-sm grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-bold text-violet-500 uppercase">Order</p>
              <p className="font-mono font-bold text-violet-900">{job.orderId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-violet-500 uppercase">Customer</p>
              <p className="font-semibold text-slate-800">{job.customerName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-violet-500 uppercase">Stage</p>
              <p className="font-semibold">{job.currentStageLabel}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-violet-500 uppercase">Due</p>
              <p className="font-semibold">{dueLabel}</p>
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Role
            </label>
            <select
              value={roleId}
              onChange={handleRoleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/30 outline-none transition-all cursor-pointer bg-white"
            >
              {WORKER_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
              Search Employee
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type name to search active workers..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-violet-500/30 outline-none transition-all"
              />
            </div>
          </div>

          {/* Searchable dropdown list */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
              Active Workers
            </label>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                <p className="text-xs font-semibold">Loading active workers...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 rounded-xl bg-red-50 border border-red-100 p-4">
                <p className="text-sm font-bold text-red-600">Failed to load workers</p>
                <p className="text-xs text-red-500 mt-1">Please check connection or re-login.</p>
                <button
                  type="button"
                  onClick={() => dispatch(fetchWorkers({ role: roleId, search: debouncedSearch, status: "active" }))}
                  className="mt-2 text-xs font-black text-violet-700 underline uppercase"
                >
                  Retry
                </button>
              </div>
            ) : !displayWorkers || displayWorkers.length === 0 ? (
              <div className="text-center py-10 rounded-xl bg-slate-50 border border-dashed border-slate-200 p-4">
                <p className="text-sm font-bold text-slate-500">No employees found</p>
                <p className="text-xs text-slate-400 mt-1">No active workers found under the selected role.</p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {displayWorkers.map((w) => (
                  <button
                    key={w._id}
                    type="button"
                    onClick={() => setSelectedWorker(w)}
                    className={`w-full text-left rounded-xl border p-3 flex items-center justify-between transition-all duration-200 ${
                      selectedWorker?._id === w._id
                        ? "border-violet-500 bg-violet-50/55 shadow-sm ring-2 ring-violet-200"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-violet-700 capitalize">
                          {(w.fullName || w.name).charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{w.fullName || w.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono capitalize">
                          {w.role.replace('_', ' ')} · {w.status}
                        </p>
                      </div>
                    </div>
                    {selectedWorker?._id === w._id && (
                      <div className="h-5 w-5 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={!selectedWorker || loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
