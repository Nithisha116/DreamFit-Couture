import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { X, UserPlus, Scissors } from "lucide-react";
import { STAGE_TO_WORKER_ROLE, WORKER_ROLES } from "../../workflow/workflowConstants";
import { assignWorkerToActiveStage } from "../../workflow/workflowEngine";
import { fetchAllTailors, selectAllTailors } from "../../features/tailor/tailorSlice";

const FLOOR_WORKERS = {
  cutting: ["vinum", "hema", "ramya"],
  tailor: ["anushka", "taniya", "kamali"],
  embroidery: ["rakesh", "ram", "santhosh"],
  aari: ["aishu", "isha"],
  ironing: ["priyanka", "fathima"],
  helper: ["myna", "reena"],
};

export default function AssignWorkerModal({ job, open, onClose, onAssigned }) {
  const dispatch = useDispatch();
  const tailors = useSelector(selectAllTailors) || [];
  const [selectedTailorId, setSelectedTailorId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) dispatch(fetchAllTailors({ limit: 100, status: "active" }));
  }, [open, dispatch]);

  useEffect(() => {
    if (!open) {
      setSelectedTailorId("");
      setName("");
      setRole("");
      setSearch("");
    }
  }, [open]);

  const activeKey = job?.currentStageKey || job?.stageKeys?.[0];
  const defaultRole = STAGE_TO_WORKER_ROLE[activeKey] || "helper";
  const roleId = role || defaultRole;
  const useTailorPicker = roleId === "tailor";
  const floorSuggestions = FLOOR_WORKERS[roleId] || FLOOR_WORKERS.helper;

  const filteredTailors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tailors.filter((t) => {
      const label = `${t.name || ""} ${t.tailorId || ""}`.toLowerCase();
      return !q || label.includes(q);
    });
  }, [tailors, search]);

  if (!open || !job) return null;

  const handleAssign = () => {
    let workerName = name.trim();
    let workerId = null;

    if (useTailorPicker && selectedTailorId) {
      const t = tailors.find((x) => x._id === selectedTailorId);
      if (t) {
        workerName = t.name;
        workerId = t._id;
      }
    }

    if (!workerName) return;

    const updated = assignWorkerToActiveStage(job.workflowTrackingId, {
      role: roleId,
      name: workerName,
      workerId,
    });
    onAssigned?.(updated);
    onClose();
  };

  const dueLabel = job.dueDate ? format(new Date(job.dueDate), "dd MMM yyyy") : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-5 py-4 flex items-start justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assign worker
            </h3>
            <p className="text-xs text-indigo-100 mt-1">
              {job.workCode || job.orderId} · {job.garmentName}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
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

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Role</label>
            <select
              value={roleId}
              onChange={(e) => {
                setRole(e.target.value);
                setSelectedTailorId("");
                setName("");
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/30 outline-none"
            >
              {WORKER_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {useTailorPicker ? (
            <>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tailors…"
                className="w-full rounded-xl border border-violet-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/30 outline-none"
              />
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredTailors.map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => setSelectedTailorId(t._id)}
                    className={`w-full text-left rounded-xl border p-3 flex items-center gap-3 transition-colors ${
                      selectedTailorId === t._id
                        ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200"
                        : "border-slate-200 hover:border-violet-200"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
                      <Scissors className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate">{t.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{t.tailorId || t._id}</p>
                    </div>
                  </button>
                ))}
                {!filteredTailors.length && (
                  <p className="text-xs text-slate-500 text-center py-4">No tailors found</p>
                )}
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Worker name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Select or type name…"
                list="worker-suggestions"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/30 outline-none"
              />
              <datalist id="worker-suggestions">
                {floorSuggestions.map((w) => (
                  <option key={w} value={w} />
                ))}
              </datalist>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={useTailorPicker ? !selectedTailorId : !name.trim()}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
