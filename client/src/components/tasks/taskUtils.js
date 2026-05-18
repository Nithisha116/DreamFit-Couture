import {
  DEFAULT_CAPACITY_HOURS,
  EMPLOYEES_BY_DEPARTMENT,
} from "./taskConstants";

export function formatHours(h) {
  if (h == null || Number.isNaN(h)) return "0:00";
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}:${String(mins).padStart(2, "0")}`;
}

/** Active (not completed) assigned hours per employee within a department */
export function workloadByEmployee(departmentKey, tasks) {
  const names = EMPLOYEES_BY_DEPARTMENT[departmentKey] || [];
  const map = Object.fromEntries(names.map((n) => [n, { hours: 0, activeCount: 0 }]));
  tasks.forEach((t) => {
    if (t.completed || t.departmentKey !== departmentKey) return;
    if (!t.assignedTo) return;
    if (!map[t.assignedTo]) return;
    map[t.assignedTo].hours += Number(t.estimatedHours) || 0;
    map[t.assignedTo].activeCount += 1;
  });
  return map;
}

export function availabilityLabel(hours, capacity = DEFAULT_CAPACITY_HOURS) {
  const ratio = hours / capacity;
  if (ratio < 0.7) return { label: "Available", tone: "success" };
  if (ratio <= 1) return { label: "Partially available", tone: "warning" };
  return { label: "Overloaded", tone: "danger" };
}

/** Normalize order id for partial matching (#2026051215 → 2026051215) */
export function normalizeOrderId(value) {
  return String(value || "")
    .replace(/^#/, "")
    .replace(/\s/g, "")
    .toLowerCase();
}

/** Completed-task search: existing fields + full/partial order id */
export function matchesCompletedTaskSearch(task, rawQuery) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;

  const baseHay = `${task.title} ${task.customerName} ${task.outfitType}`.toLowerCase();
  if (baseHay.includes(q)) return true;

  const orderNorm = normalizeOrderId(task.orderId);
  const qOrder = normalizeOrderId(q);
  if (orderNorm && qOrder && orderNorm.includes(qOrder)) return true;

  return false;
}

export function suggestAlternate(departmentKey, overloadedName, tasks) {
  const peers = (EMPLOYEES_BY_DEPARTMENT[departmentKey] || []).filter(
    (n) => n !== overloadedName,
  );
  if (peers.length === 0) return null;
  const loads = workloadByEmployee(departmentKey, tasks);
  let best = peers[0];
  let bestH = loads[best]?.hours ?? 999;
  peers.forEach((p) => {
    const h = loads[p]?.hours ?? 0;
    if (h < bestH) {
      best = p;
      bestH = h;
    }
  });
  const cap = (loads[best]?.hours || 0) >= DEFAULT_CAPACITY_HOURS ? null : best;
  return cap;
}
