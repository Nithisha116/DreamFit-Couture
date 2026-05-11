import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { Plus, Pencil, Trash2, Download, Sparkles } from "lucide-react";
import { INITIAL_SOURCING, SOURCING_STATUSES } from "./sourcingSeed";

export default function SourcingPage() {
  const [rows, setRows] = useState(INITIAL_SOURCING);
  const [productFilter, setProductFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
        `${i + 1}. ${r.clientLabel} | ${r.productName} | ${r.sourcingType} | Qty ${r.quantity} | ₹${r.totalAmount} | ${r.status} | ${r.priority} | ${r.supplier}`,
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
    }
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
              setRows((rs) => [
                {
                  id: `src-${Date.now()}`,
                  clientLabel: "New — client",
                  productName: "New item",
                  sourcingType: "Fabrics",
                  quantity: 1,
                  totalAmount: 0,
                  status: "To Start",
                  priority: "Medium",
                  supplier: "—",
                },
                ...rs,
              ])
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
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">
                  {r.clientLabel}
                </td>
                <td className="px-4 py-3">{r.productName}</td>
                <td className="px-4 py-3 text-slate-600">{r.sourcingType}</td>
                <td className="px-4 py-3">{r.quantity}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  ₹{Number(r.totalAmount).toLocaleString("en-IN")}
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
                </td>
                <td className="px-4 py-3">
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
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">
                  {r.supplier}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex"
                    title="Edit inline — use status & supplier fields"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
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
