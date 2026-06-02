import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { Plus, Pencil, Trash2, Download, Sparkles, Check, X } from "lucide-react";
import API from "../../../app/axios";
import showToast from "../../../utils/toast";

const SOURCING_STATUSES = [
  "To Start",
  "In Progress",
  "Ordered",
  "Delivered",
  "Delayed",
];

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

function emptyDraft() {
  return {
    clientLabel: "",
    productName: "",
    sourcingType: "Fabrics",
    quantity: 0,
    totalAmount: 0,
    status: "To Start",
    priority: "Medium",
    supplier: "",
    deliveryDate: "",
  };
}

export default function SourcingPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productFilter, setProductFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const response = await API.get("/sourcing", {
        params: {
          search: productFilter || undefined,
          status: statusFilter || undefined,
        },
      });
      setRows(response.data?.data || []);
    } catch (error) {
      showToast.error(error.response?.data?.message || "Failed to load sourcing records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [productFilter, statusFilter]);

  const filtered = useMemo(() => rows, [rows]);

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
    doc.text("DreamFit Couture - Sourcing report", 14, 16);
    doc.setFontSize(10);
    let y = 28;
    filtered.forEach((r, i) => {
      if (y > 190) {
        doc.addPage();
        y = 16;
      }
      doc.text(
        `${i + 1}. ${r.clientLabel} | ${r.productName} | ${r.sourcingType} | Qty ${r.quantity} | Rs.${r.totalAmount} | ${r.status} | ${r.priority} | ${r.supplier} | Due ${formatDateValue(r.deliveryDate) || "-"}`,
        14,
        y,
      );
      y += 8;
    });
    doc.save("dreamfit-sourcing.pdf");
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this sourcing row?")) return;
    try {
      await API.delete(`/sourcing/${id}`);
      setRows((rs) => rs.filter((r) => r._id !== id));
      if (editingId === id) {
        setEditingId(null);
        setDraft(null);
      }
      showToast.success("Sourcing record removed");
    } catch (error) {
      showToast.error(error.response?.data?.message || "Failed to remove sourcing record");
    }
  };

  const startEdit = (row) => {
    setEditingId(row._id);
    setDraft({ ...row, deliveryDate: formatDateValue(row.deliveryDate) });
  };

  const startCreate = () => {
    setEditingId("__new__");
    setDraft(emptyDraft());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = async () => {
    if (!draft) return;
    if (!draft.productName?.trim()) {
      showToast.error("Product name is required");
      return;
    }

    try {
      if (editingId === "__new__") {
        const response = await API.post("/sourcing", draft);
        setRows((rs) => [response.data.data, ...rs]);
        showToast.success("Sourcing record added");
      } else {
        const response = await API.put(`/sourcing/${editingId}`, draft);
        setRows((rs) =>
          rs.map((r) => (r._id === editingId ? response.data.data : r)),
        );
        showToast.success("Sourcing record updated");
      }
      setEditingId(null);
      setDraft(null);
    } catch (error) {
      showToast.error(error.response?.data?.message || "Failed to save sourcing record");
    }
  };

  const updateStatus = async (row, status) => {
    try {
      const response = await API.put(`/sourcing/${row._id}`, { status });
      setRows((rs) => rs.map((r) => (r._id === row._id ? response.data.data : r)));
    } catch (error) {
      showToast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const visibleRows = editingId === "__new__" && draft
    ? [{ ...draft, _id: "__new__" }, ...filtered]
    : filtered;

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
            onClick={startCreate}
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
                  key={r._id}
                  className="rounded-2xl border border-slate-100 p-4 hover:border-blue-200/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {r.productName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {r.clientLabel} - Due {formatDateValue(r.deliveryDate)}
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
          placeholder="Filter by product..."
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
            {loading && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-slate-500 font-semibold">
                  Loading sourcing records...
                </td>
              </tr>
            )}
            {!loading && visibleRows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-slate-500 font-semibold">
                  No sourcing records found.
                </td>
              </tr>
            )}
            {visibleRows.map((r) => (
              <SourcingRow
                key={r._id}
                row={r}
                draft={draft}
                editing={editingId === r._id}
                setDraft={setDraft}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                startEdit={startEdit}
                remove={remove}
                updateStatus={updateStatus}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SourcingRow({
  row,
  draft,
  editing,
  setDraft,
  saveEdit,
  cancelEdit,
  startEdit,
  remove,
  updateStatus,
}) {
  const r = editing ? draft : row;

  return (
    <tr
      className={`hover:bg-blue-50/30 transition-colors ${
        urgencyFor(row) === "Urgent"
          ? "border-l-4 border-rose-500"
          : urgencyFor(row) === "Due Soon"
            ? "border-l-4 border-amber-400"
            : urgencyFor(row) === "Delayed"
              ? "border-l-4 border-slate-400"
              : ""
      }`}
    >
      <EditableCell editing={editing} value={r.clientLabel || ""} field="clientLabel" setDraft={setDraft} />
      <EditableCell editing={editing} value={r.productName || ""} field="productName" setDraft={setDraft} />
      <td className="px-4 py-3 text-slate-600">
        {editing ? (
          <select
            value={r.sourcingType || "Fabrics"}
            onChange={(e) => setDraft((d) => ({ ...d, sourcingType: e.target.value }))}
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
        {editing ? (
          <input
            type="number"
            min="0"
            value={r.quantity ?? 0}
            onChange={(e) => setDraft((d) => ({ ...d, quantity: Number(e.target.value) }))}
            className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
        ) : (
          r.quantity
        )}
      </td>
      <td className="px-4 py-3 font-mono text-xs">
        {editing ? (
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Rs.</span>
            <input
              type="number"
              min="0"
              value={r.totalAmount ?? 0}
              onChange={(e) => setDraft((d) => ({ ...d, totalAmount: Number(e.target.value) }))}
              className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-sans"
            />
          </div>
        ) : (
          `Rs.${Number(r.totalAmount || 0).toLocaleString("en-IN")}`
        )}
      </td>
      <td className="px-4 py-3">
        <select
          value={r.status || "To Start"}
          onChange={(e) =>
            editing
              ? setDraft((d) => ({ ...d, status: e.target.value }))
              : updateStatus(row, e.target.value)
          }
          className="rounded-lg border border-slate-200 text-xs font-bold py-1.5 px-2 bg-white"
        >
          {SOURCING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {urgencyFor(row) && (
          <div className="mt-2">
            <UrgencyBadge value={urgencyFor(row)} />
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <select
            value={r.priority || "Medium"}
            onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value }))}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold bg-white"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        ) : (
          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${priorityClass(r.priority)}`}>
            {r.priority}
          </span>
        )}
      </td>
      <EditableCell editing={editing} value={r.supplier || ""} field="supplier" setDraft={setDraft} muted />
      <td className="px-4 py-3">
        {editing ? (
          <input
            type="date"
            value={formatDateValue(r.deliveryDate)}
            onChange={(e) => setDraft((d) => ({ ...d, deliveryDate: e.target.value }))}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
        ) : (
          <span className="text-xs text-slate-600 font-medium">
            {formatDateValue(r.deliveryDate) || "-"}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {editing ? (
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
            onClick={() => startEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
        {row._id !== "__new__" && (
          <button
            type="button"
            onClick={() => remove(row._id)}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg inline-flex"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  );
}

function EditableCell({ editing, value, field, setDraft, muted = false }) {
  return (
    <td className={`px-4 py-3 ${muted ? "text-slate-600 max-w-[140px] truncate" : "font-medium text-slate-800"}`}>
      {editing ? (
        <input
          value={value}
          onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
        />
      ) : (
        value
      )}
    </td>
  );
}

function formatDateValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function priorityClass(priority) {
  if (priority === "High") return "bg-rose-50 text-rose-800 border-rose-100";
  if (priority === "Low") return "bg-slate-50 text-slate-600 border-slate-200";
  return "bg-amber-50 text-amber-900 border-amber-100";
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
