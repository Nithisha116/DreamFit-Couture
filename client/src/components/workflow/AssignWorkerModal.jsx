import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { X, UserPlus, Search, Loader2 } from "lucide-react";
import {
  STAGE_TO_WORKER_ROLE,
  WORKER_ROLES,
  extractOrderedStageKeys,
  getStageLabelFromDef,
} from "../../workflow/workflowConstants";
import API from "../../app/axios";
import showToast from "../../utils/toast";

export default function AssignWorkerModal({ job, open, onClose, onAssigned }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingRoles, setLoadingRoles] = useState({});
  const [roleWorkers, setRoleWorkers] = useState({});
  const [assignmentsByStage, setAssignmentsByStage] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const stageKeys = useMemo(() => {
    return extractOrderedStageKeys(job);
  }, [job?.workflowStages, job?.stageKeys]);

  const jobId = job?.workMongoId || job?._id;

  const stageRole = useMemo(() => {
    const m = {};
    stageKeys.forEach((k) => {
      m[k] = STAGE_TO_WORKER_ROLE[k] || "helper";
    });
    return m;
  }, [stageKeys]);

  const requiredRoles = useMemo(() => {
    return Array.from(new Set(stageKeys.map((k) => stageRole[k]).filter(Boolean)));
  }, [stageKeys, stageRole]);

  useEffect(() => {
    if (!open || !job) return;

    const next = {};
    stageKeys.forEach((k) => {
      const a = job.stages?.[k]?.assignedTo;
      if (a?.workerId || a?.name) {
        next[k] = {
          _id: a.workerId || null,
          fullName: a.name || "",
          role: a.role || stageRole[k],
          status: "active",
        };
      }
    });
    setAssignmentsByStage(next);
  }, [open, job, stageKeys, stageRole]);

  useEffect(() => {
    if (!open || !job) return;
    let cancelled = false;

    async function loadRole(role) {
      setLoadingRoles((s) => ({ ...s, [role]: true }));
      try {
        const query = new URLSearchParams();
        query.append("role", role);
        query.append("status", "active");
        if (searchQuery.trim()) query.append("search", searchQuery.trim());
        const res = await API.get(`/workers?${query.toString()}`);
        const list = res?.data?.workers || res?.data?.data || [];
        if (!cancelled) {
          setRoleWorkers((s) => ({ ...s, [role]: Array.isArray(list) ? list : [] }));
        }
      } catch (e) {
        if (!cancelled) {
          setRoleWorkers((s) => ({ ...s, [role]: [] }));
        }
      } finally {
        if (!cancelled) setLoadingRoles((s) => ({ ...s, [role]: false }));
      }
    }

    requiredRoles.forEach((r) => loadRole(r));

    return () => {
      cancelled = true;
    };
  }, [open, job, requiredRoles, searchQuery]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setLoadingRoles({});
      setRoleWorkers({});
      setAssignmentsByStage({});
      setSaving(false);
      setSaveError(null);
    }
  }, [open]);

  const handleWorkerSelect = (stageKey, workerId) => {
    const role = stageRole[stageKey] || "helper";
    const list = roleWorkers[role] || [];
    const w = list.find((x) => x._id === workerId) || null;
    setAssignmentsByStage((s) => ({
      ...s,
      [stageKey]: w
        ? { ...w, fullName: w.fullName || w.name || w.full_name || "" }
        : null,
    }));
  };

  const handleSaveAll = async () => {
    if (!jobId) {
      showToast.error("Work record missing — cannot save assignments");
      return;
    }
    setSaving(true);
    setSaveError(null);

    try {
      for (const key of stageKeys) {
        const role = stageRole[key] || "helper";
        const selected = assignmentsByStage[key];
        if (!selected?._id) continue;

        await API.post(`/workflow/works/${jobId}/assign-worker`, {
          stage: key,
          role,
          workerId: selected._id,
          workerName: selected.fullName || selected.name,
        });
      }

      showToast.success("Workers assigned across workflow stages");
      onAssigned?.({ ...job });
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to assign workers";
      setSaveError(msg);
      showToast.error(msg);
    } finally {
      setSaving(false);
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

          {/* Search Input (filters worker lists) */}
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

          {/* Stage → Worker dropdowns */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
              Workflow stage assignments
            </label>

            {!stageKeys.length ? (
              <div className="text-center py-10 rounded-xl bg-slate-50 border border-dashed border-slate-200 p-4">
                <p className="text-sm font-bold text-slate-500">No workflow stages</p>
                <p className="text-xs text-slate-400 mt-1">This job has no configured stages.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stageKeys.map((key) => {
                  const roleId = stageRole[key] || "helper";
                  const list = roleWorkers[roleId] || [];
                  const busy = Boolean(loadingRoles[roleId]);
                  const selected = assignmentsByStage[key];
                  const state = job.stages?.[key]?.state || "pending";

                  const stateCls =
                    state === "completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : state === "active"
                        ? "bg-violet-50 text-violet-700 border-violet-200"
                        : "bg-slate-50 text-slate-500 border-slate-200";

                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-800 truncate">
                            {getStageLabelFromDef(key, job.workflowStages)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono uppercase">
                            {WORKER_ROLES.find((r) => r.id === roleId)?.label || roleId}
                          </p>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full border ${stateCls}`}>
                          {state}
                        </span>
                      </div>

                      <div className="relative">
                        <select
                          value={selected?._id || ""}
                          onChange={(e) => handleWorkerSelect(key, e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/30 outline-none transition-all cursor-pointer bg-white"
                        >
                          <option value="">
                            {busy ? "Loading workers..." : "Select worker"}
                          </option>
                          {list.map((w) => (
                            <option key={w._id} value={w._id}>
                              {w.fullName || w.name}
                            </option>
                          ))}
                        </select>
                        {busy && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-violet-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
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
              onClick={handleSaveAll}
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? "Saving..." : "Assign"}
            </button>
          </div>

          {saveError && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-left">
              <p className="text-xs font-bold text-red-700">Assignment failed</p>
              <p className="text-xs text-red-600 mt-1">{saveError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
