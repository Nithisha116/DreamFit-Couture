import { X } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DEPARTMENT_TABS,
  OUTFIT_TYPES,
  TASK_STATUSES,
  EMPLOYEES_BY_DEPARTMENT,
} from "./taskConstants";

const emptyForm = () => ({
  customerName: "",
  outfitType: OUTFIT_TYPES[0],
  departmentKey: "embroidery",
  title: "",
  description: "",
  priority: "medium",
  estimatedHours: 2,
  assignedTo: "",
  deadline: new Date().toISOString().slice(0, 10),
  status: "UNASSIGNED",
  notes: "",
});

export default function AddTaskDrawer({ open, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) setForm(emptyForm());
  }, [open]);

  const employees = EMPLOYEES_BY_DEPARTMENT[form.departmentKey] || [];

  useEffect(() => {
    if (form.assignedTo && !employees.includes(form.assignedTo)) {
      setForm((f) => ({ ...f, assignedTo: "" }));
    }
  }, [form.departmentKey, employees, form.assignedTo]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.customerName.trim()) return;
    onSave({
      ...form,
      estimatedHours: Number(form.estimatedHours) || 0,
      status: form.assignedTo ? "ASSIGNED" : "UNASSIGNED",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-[slideIn_0.35s_ease-out]">
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0.6; }
            to { transform: translateX(0); opacity: 1; }
          }
          .input-df {
            width: 100%;
            border-radius: 0.75rem;
            border: 1px solid rgb(226 232 240);
            padding: 0.6rem 0.75rem;
            font-size: 0.875rem;
            outline: none;
            transition: box-shadow 0.2s, border-color 0.2s;
          }
          .input-df:focus {
            border-color: rgb(96 165 250);
            box-shadow: 0 0 0 3px rgba(30, 107, 255, 0.15);
          }
        `}</style>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900">New task</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Capture everything your floor needs in one pass.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={submit}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <Field label="Customer name">
              <input
                required
                value={form.customerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerName: e.target.value }))
                }
                className="input-df"
                placeholder="e.g. Mrs. Amika"
              />
            </Field>
            <Field label="Outfit type">
              <select
                value={form.outfitType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, outfitType: e.target.value }))
                }
                className="input-df"
              >
                {OUTFIT_TYPES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Department">
              <select
                value={form.departmentKey}
                onChange={(e) =>
                  setForm((f) => ({ ...f, departmentKey: e.target.value }))
                }
                className="input-df"
              >
                {DEPARTMENT_TABS.map(({ tab, key }) => (
                  <option key={key} value={key}>
                    {tab}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Task title">
              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="input-df"
                placeholder="Short, actionable title"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                className="input-df resize-none"
                placeholder="Materials, measurements, edge cases…"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Priority">
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priority: e.target.value }))
                  }
                  className="input-df"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>
              <Field label="Est. hours">
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={form.estimatedHours}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, estimatedHours: e.target.value }))
                  }
                  className="input-df"
                />
              </Field>
            </div>
            <Field label="Assign employee">
              <select
                value={form.assignedTo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assignedTo: e.target.value }))
                }
                className="input-df"
              >
                <option value="">Unassigned</option>
                {employees.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Deadline">
              <input
                type="date"
                value={form.deadline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deadline: e.target.value }))
                }
                className="input-df"
              />
            </Field>
            <Field label="Status (reference)">
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                className="input-df"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
                className="input-df resize-none"
                placeholder="Internal notes"
              />
            </Field>
          </div>
          <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[#1E6BFF] text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20"
            >
              Create task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
