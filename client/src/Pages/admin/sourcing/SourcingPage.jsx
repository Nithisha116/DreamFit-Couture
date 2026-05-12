import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { Plus, Pencil, Trash2, Download, Sparkles, Check, X } from "lucide-react";
import { INITIAL_SOURCING, SOURCING_STATUSES } from "./sourcingSeed";

function uid() {
  return `src-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - new Date(now.toISOString().slice(0, 10)).getTime();
  return Math.round(diff / 86400000);
}

function urgencyFor(row) {
  if (row.status === "Delivered") return null;
  const du = daysUntil(row.deliveryDate);
  if (du == null) return null;
  if (du < 0) return "Delayed";
  if (du <= 2) return "Urgent";
  if (du <= 5) return "Due Soon";
  return null;
}

export default function SourcingPage() {
  const [rows, setRows] = useState(INITIAL_SOURCING);
  const [productFilter, setProductFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (
        productFilter &&
        !r.productName.toLowerCase().includes(productFilter.toLowerCase())
      )
        return false;
      return true;
    });
  }, [rows, productFilter, statusFilter]);

  const dueSoon = useMemo(() => {
    const active = rows.filter((r) => r.status !== "Delivered");
    const tagged = active
      .map((r) => ({ ...r, urgency: urgencyFor(r) }))
      .filter((r) => r.urgency);
    const counts = tagged.reduce(
      (acc, r) => {
        acc[r.urgency] = (acc[r.urgency] || 0) + 1;
        return acc;
      },
      { "Due Soon": 0, Urgent: 0, Delayed: 0 },
    );
    const top = tagged
      .sort((a, b) => (daysUntil(a.deliveryDate) ?? 999) - (daysUntil(b.deliveryDate) ?? 999))
      .slice(0, 4);
    return { counts, top };
  }, [rows]);

  const downloadPdf = () => {
    const doc = new jsPDF("l", "mm", "a4");
    doc.setFontSize(14);
    doc.text("DreamFit Couture — Sourcing report", 14, 16);
    doc.setFontSize(10);
    let y = 28;
    filtered.forEach((r, i) => {
      if (y > 190) {
        doc.addPage();
        y = 16;
      }
      doc.text(
        `${i + 1}. ${r.clientLabel} | ${r.productName} | ${r.sourcingType} | Qty ${r.quantity} | ₹${r.totalAmount} | ${r.status} | ${r.priority} | ${r.supplier} | Due ${r.deliveryDate || "-"}`,
        14,
        y,
      );
      y += 8;
    });
    doc.save("dreamfit-sourcing.pdf");
  };

  const remove = (id) => {
    if (window.confirm("Remove this sourcing row?")) {
      setRows((rs) => rs.filter((r) => r.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setDraft(null);
      }
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setDraft({ ...row });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = () => {
    if (!draft) return;
    setRows((rs) => rs.map((r) => (r.id === editingId ? { ...draft } : r)));
    setEditingId(null);
    setDraft(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Procurement
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Sourcing
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Track fabrics, trims, and atelier supplies per client order.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setRows((rs) => {
                const id = uid();
                const next = [
                  {
                    id,
                    clientLabel: "New — client",
                    productName: "New item",
                    sourcingType: "Fabrics",
                    quantity: 1,
                    totalAmount: 0,
                    status: "To Start",
                    priority: "Medium",
                    supplier: "—",
                    deliveryDate: new Date(Date.now() + 86400000 * 7)
                      .toISOString()
                      .slice(0, 10),
                  },
                  ...rs,
                ];
                // Ensure immediate edit works for freshly added row
                setTimeout(() => {
                  const row = next.find((x) => x.id === id);
                  if (row) startEdit(row);
                }, 0);
                return next;
              })
            }
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1E6BFF] text-white font-bold px-4 py-2.5 text-sm shadow-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add sourcing
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 font-bold px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Due soon alert (lightweight) */}
      {(dueSoon.counts["Due Soon"] > 0 ||
        dueSoon.counts.Urgent > 0 ||
        dueSoon.counts.Delayed > 0) && (
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-black text-slate-900">Sourcing due soon</h3>
              <p className="text-sm text-slate-500 mt-1">
                Items nearing delivery date and not yet delivered.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill tone="amber" label={`Due Soon ${dueSoon.counts["Due Soon"] || 0}`} />
              <Pill tone="rose" label={`Urgent ${dueSoon.counts.Urgent || 0}`} />
              <Pill tone="slate" label={`Delayed ${dueSoon.counts.Delayed || 0}`} />
            </div>
          </div>
          {dueSoon.top.length > 0 && (
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {dueSoon.top.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-100 p-4 hover:border-blue-200/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {r.productName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {r.clientLabel} · Due {r.deliveryDate}
                      </p>
                    </div>
                    <UrgencyBadge value={r.urgency} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm">
        <input
          placeholder="Filter by product…"
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="flex-1 min-w-[160px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
        >
          <option value="">All statuses</option>
          {SOURCING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[900px]">
          <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-500">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <tr
                key={r.id}
                className={`hover:bg-blue-50/30 transition-colors ${
                  urgencyFor(r) === "Urgent"
                    ? "border-l-4 border-rose-500"
                    : urgencyFor(r) === "Due Soon"
                      ? "border-l-4 border-amber-400"
                      : urgencyFor(r) === "Delayed"
                        ? "border-l-4 border-slate-400"
                        : ""
                }`}
              >
                <td className="px-4 py-3 font-medium text-slate-800">
                  {editingId === r.id ? (
                    <input
                      value={draft?.clientLabel || ""}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, clientLabel: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                    />
                  ) : (
                    r.clientLabel
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === r.id ? (
                    <input
                      value={draft?.productName || ""}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, productName: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                    />
                  ) : (
                    r.productName
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {editingId === r.id ? (
                    <select
                      value={draft?.sourcingType || "Fabrics"}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, sourcingType: e.target.value }))
                      }
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm bg-white"
                    >
                      <option>Fabrics</option>
                      <option>Trims</option>
                      <option>Accessories</option>
                      <option>Embroidery</option>
                    </select>
                  ) : (
                    r.sourcingType
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === r.id ? (
                    <input
                      type="number"
                      min="0"
                      value={draft?.quantity ?? 0}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, quantity: Number(e.target.value) }))
                      }
                      className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                    />
                  ) : (
                    r.quantity
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {editingId === r.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={draft?.totalAmount ?? 0}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            totalAmount: Number(e.target.value),
                          }))
                        }
                        className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-sans"
                      />
                    </div>
                  ) : (
                    `₹${Number(r.totalAmount).toLocaleString("en-IN")}`
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    onChange={(e) =>
                      setRows((rs) =>
                        rs.map((x) =>
                          x.id === r.id ? { ...x, status: e.target.value } : x,
                        ),
                      )
                    }
                    className="rounded-lg border border-slate-200 text-xs font-bold py-1.5 px-2 bg-white"
                  >
                    {SOURCING_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {urgencyFor(r) && (
                    <div className="mt-2">
                      <UrgencyBadge value={urgencyFor(r)} />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === r.id ? (
                    <select
                      value={draft?.priority || "Medium"}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, priority: e.target.value }))
                      }
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold bg-white"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  ) : (
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${
                        r.priority === "High"
                          ? "bg-rose-50 text-rose-800 border-rose-100"
                          : r.priority === "Low"
                            ? "bg-slate-50 text-slate-600 border-slate-200"
                            : "bg-amber-50 text-amber-900 border-amber-100"
                      }`}
                    >
                      {r.priority}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">
                  {editingId === r.id ? (
                    <input
                      value={draft?.supplier || ""}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, supplier: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                    />
                  ) : (
                    r.supplier
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === r.id ? (
                    <input
                      type="date"
                      value={draft?.deliveryDate || ""}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, deliveryDate: e.target.value }))
                      }
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                    />
                  ) : (
                    <span className="text-xs text-slate-600 font-medium">
                      {r.deliveryDate || "—"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editingId === r.id ? (
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg inline-flex"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg inline-flex"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(r)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg inline-flex"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Pill({ tone, label }) {
  const cls =
    tone === "rose"
      ? "bg-rose-50 text-rose-800 border-rose-100"
      : tone === "amber"
        ? "bg-amber-50 text-amber-900 border-amber-100"
        : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${cls}`}>
      {label}
    </span>
  );
}

function UrgencyBadge({ value }) {
  if (!value) return null;
  const cls =
    value === "Urgent"
      ? "bg-rose-50 text-rose-800 border-rose-100"
      : value === "Due Soon"
        ? "bg-amber-50 text-amber-900 border-amber-100"
        : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${cls}`}>
      {value}
    </span>
  );
}
