import { useState } from "react";
import { Calendar, Plus, Trash2, Sparkles, AlertTriangle } from "lucide-react";
import {
  DEPARTMENT_TABS,
  EMPLOYEES_BY_DEPARTMENT,
  DEFAULT_CAPACITY_HOURS,
} from "../../../components/tasks/taskConstants";
import { workloadByEmployee } from "../../../components/tasks/taskUtils";
import { loadTasksFromStorage } from "./availabilityUtils";

const emptyRow = () => ({
  id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  departmentKey: "embroidery",
  estimatedHours: 2,
  otHours: 0,
  priority: 2,
  splittable: false,
});

export default function CheckAvailabilityPage() {
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [rows, setRows] = useState([emptyRow()]);
  const [result, setResult] = useState(null);

  const runCheck = () => {
    const existingTasks = loadTasksFromStorage();
    const baseLoads = {};
    Object.keys(EMPLOYEES_BY_DEPARTMENT).forEach((dk) => {
      const w = workloadByEmployee(dk, existingTasks);
      Object.keys(w).forEach((name) => {
        baseLoads[name] = (baseLoads[name] || 0) + w[name].hours;
      });
    });

    const tentative = { ...baseLoads };
    const assignments = [];
    const sorted = [...rows].sort((a, b) => (b.priority || 0) - (a.priority || 0));

    sorted.forEach((row) => {
      const dept = row.departmentKey;
      const names = EMPLOYEES_BY_DEPARTMENT[dept] || [];
      if (!names.length) return;
      const hours =
        (Number(row.estimatedHours) || 0) + (Number(row.otHours) || 0);

      const pickLowest = () =>
        [...names].sort(
          (a, b) => (tentative[a] || 0) - (tentative[b] || 0),
        )[0];

      if (row.splittable && names.length >= 2 && hours > 0) {
        const a = pickLowest();
        const rest = names.filter((n) => n !== a);
        const b = [...rest].sort(
          (x, y) => (tentative[x] || 0) - (tentative[y] || 0),
        )[0];
        const h1 = hours / 2;
        const h2 = hours - h1;
        tentative[a] = (tentative[a] || 0) + h1;
        tentative[b] = (tentative[b] || 0) + h2;
        assignments.push({
          rowId: row.id,
          departmentKey: dept,
          hours,
          split: true,
          assignees: [
            { name: a, hours: h1 },
            { name: b, hours: h2 },
          ],
        });
      } else {
        const pick = pickLowest();
        tentative[pick] = (tentative[pick] || 0) + hours;
        assignments.push({
          rowId: row.id,
          departmentKey: dept,
          hours,
          split: false,
          assignees: [{ name: pick, hours }],
        });
      }
    });

    const perPerson = {};
    namesFlat().forEach((n) => {
      perPerson[n] = tentative[n] || 0;
    });

    const recommendations = [];
    namesFlat().forEach((name) => {
      const h = perPerson[name] || 0;
      const ratio = h / DEFAULT_CAPACITY_HOURS;
      if (ratio > 1) {
        const dk = departmentForName(name);
        if (dk) {
          const peers = (EMPLOYEES_BY_DEPARTMENT[dk] || []).filter(
            (n) => n !== name,
          );
          const alt = [...peers].sort(
            (a, b) => (perPerson[a] || 0) - (perPerson[b] || 0),
          )[0];
          if (alt) {
            recommendations.push(
              `${capitalize(name)} is overloaded. Suggested employee: ${capitalize(alt)}`,
            );
          }
        }
      }
    });

    const maxRatio = Math.max(
      0,
      ...namesFlat().map((n) => (perPerson[n] || 0) / DEFAULT_CAPACITY_HOURS),
    );
    let overall = "available";
    if (maxRatio > 1) overall = "overloaded";
    else if (maxRatio >= 0.7) overall = "partial";

    setResult({
      deliveryDate,
      perPerson,
      assignments,
      recommendations: [...new Set(recommendations)].slice(0, 6),
      overall,
      maxRatio,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Capacity
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Check availability
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Model new work against today&apos;s task load. Logic is heuristic —
          no AI required.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm p-5 sm:p-8 space-y-6">
        <label className="block">
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wide">
            Delivery date
          </span>
          <div className="relative mt-1.5">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
            />
          </div>
        </label>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Proposed tasks</h2>
            <button
              type="button"
              onClick={() => setRows((r) => [...r, emptyRow()])}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-900"
            >
              <Plus className="w-4 h-4" />
              Add task
            </button>
          </div>

          {rows.map((row, idx) => (
            <div
              key={row.id}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
            >
              <span className="text-xs font-black text-slate-400 uppercase lg:col-span-6 -mb-1">
                Task {idx + 1}
              </span>
              <label className="text-xs font-bold text-slate-500">
                Type / dept
                <select
                  value={row.departmentKey}
                  onChange={(e) =>
                    setRows((rs) =>
                      rs.map((x) =>
                        x.id === row.id
                          ? { ...x, departmentKey: e.target.value }
                          : x,
                      ),
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 py-2 px-2 text-sm"
                >
                  {DEPARTMENT_TABS.map(({ tab, key }) => (
                    <option key={key} value={key}>
                      {tab}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold text-slate-500">
                Est. hours
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={row.estimatedHours}
                  onChange={(e) =>
                    setRows((rs) =>
                      rs.map((x) =>
                        x.id === row.id
                          ? { ...x, estimatedHours: e.target.value }
                          : x,
                      ),
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 py-2 px-2 text-sm"
                />
              </label>
              <label className="text-xs font-bold text-slate-500">
                OT hours
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={row.otHours}
                  onChange={(e) =>
                    setRows((rs) =>
                      rs.map((x) =>
                        x.id === row.id ? { ...x, otHours: e.target.value } : x,
                      ),
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 py-2 px-2 text-sm"
                />
              </label>
              <label className="text-xs font-bold text-slate-500">
                Priority (1–3)
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={row.priority}
                  onChange={(e) =>
                    setRows((rs) =>
                      rs.map((x) =>
                        x.id === row.id
                          ? { ...x, priority: Number(e.target.value) }
                          : x,
                      ),
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 py-2 px-2 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 pb-2">
                <input
                  type="checkbox"
                  checked={row.splittable}
                  onChange={(e) =>
                    setRows((rs) =>
                      rs.map((x) =>
                        x.id === row.id
                          ? { ...x, splittable: e.target.checked }
                          : x,
                      ),
                    )
                  }
                  className="rounded border-slate-300"
                />
                Splittable
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={rows.length < 2}
                  onClick={() =>
                    setRows((rs) => rs.filter((x) => x.id !== row.id))
                  }
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={runCheck}
            className="rounded-2xl bg-[#1E6BFF] text-white font-bold px-8 py-3 shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all"
          >
            Check availability
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 w-10 h-10 rounded-2xl flex items-center justify-center ${
                result.overall === "overloaded"
                  ? "bg-rose-100 text-rose-700"
                  : result.overall === "partial"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900">Result</h3>
              <p className="text-sm text-slate-600 mt-1">
                Overall:{" "}
                <strong className="capitalize">{result.overall}</strong>{" "}
                (peak load {(result.maxRatio * 100).toFixed(0)}% of an{" "}
                {DEFAULT_CAPACITY_HOURS}h reference day).
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Delivery date (reference): {result.deliveryDate}
              </p>
            </div>
          </div>

          {result.recommendations.length > 0 && (
            <ul className="space-y-2 text-sm text-slate-700">
              {result.recommendations.map((r) => (
                <li
                  key={r}
                  className="flex gap-2 items-start rounded-xl bg-slate-50 px-3 py-2 border border-slate-100"
                >
                  <span className="text-blue-600 font-bold">→</span>
                  {r}
                </li>
              ))}
            </ul>
          )}

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {Object.entries(result.perPerson)
              .filter(([, h]) => h > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([name, h]) => {
                const ratio = h / DEFAULT_CAPACITY_HOURS;
                const label =
                  ratio > 1
                    ? "Overloaded"
                    : ratio >= 0.7
                      ? "Partially available"
                      : "Available";
                return (
                  <div
                    key={name}
                    className="rounded-xl border border-slate-100 p-3 flex justify-between items-center"
                  >
                    <span className="font-bold capitalize">{name}</span>
                    <span className="text-xs text-slate-500">
                      {h.toFixed(1)}h · {label}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

function namesFlat() {
  const s = new Set();
  Object.values(EMPLOYEES_BY_DEPARTMENT).forEach((arr) =>
    arr.forEach((n) => s.add(n)),
  );
  return [...s];
}

function departmentForName(name) {
  for (const [dk, arr] of Object.entries(EMPLOYEES_BY_DEPARTMENT)) {
    if (arr.includes(name)) return dk;
  }
  return null;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
