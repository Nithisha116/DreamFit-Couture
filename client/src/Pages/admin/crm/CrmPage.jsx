import { useMemo, useState } from "react";
import {
  Search,
  Download,
  Upload,
  UserPlus,
  X,
  Award,
  Sparkles,
} from "lucide-react";
import { CRM_CUSTOMERS_RAW } from "./crmDummyData";
import {
  classifyCustomer,
  loyaltyMeta,
  dummyPurchaseHistory,
  aggregateStats,
} from "./crmLogic";

export default function CrmPage() {
  const [customers, setCustomers] = useState(CRM_CUSTOMERS_RAW);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState(null);

  const enriched = useMemo(
    () =>
      customers.map((c) => ({
        ...c,
        category: classifyCustomer(c),
        loyalty: loyaltyMeta(c.loyaltyPoints || 0),
      })),
    [customers],
  );

  const stats = useMemo(() => aggregateStats(customers), [customers]);

  const filtered = enriched.filter((c) => {
    const hay = `${c.name} ${c.phone} ${c.id}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (cat !== "all" && c.category !== cat) return false;
    return true;
  });

  const exportCsv = () => {
    const headers = [
      "Customer ID",
      "Name",
      "Phone",
      "Address",
      "Referral",
      "Last purchase",
      "Orders",
      "Points",
      "Category",
    ];
    const lines = filtered.map((c) =>
      [
        c.id,
        c.name,
        c.phone,
        c.address,
        c.referral,
        c.lastPurchase,
        c.orderCount,
        c.loyaltyPoints,
        c.category,
      ]
        .map((x) => `"${String(x).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dreamfit-crm-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Boutique CRM
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          CRM
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Segments update automatically from orders, visits, and spend — loyalty
          stays visible on every profile.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Kpi label="Total customers" value={stats.total} />
        <Kpi label="Active" value={stats.active} />
        <Kpi label="New" value={stats.new} />
        <Kpi label="Inactive" value={stats.inactive} />
        <Kpi label="High value + VIP" value={stats.highValue} />
      </div>

      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, phone, or ID…"
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload
              <input type="file" accept=".csv" className="hidden" />
            </label>
            <button
              type="button"
              onClick={() =>
                setCustomers((cs) => [
                  {
                    id: `CUST-2026-${String(400 + cs.length).padStart(5, "0")}`,
                    name: "New client",
                    phone: "+91 —",
                    address: "",
                    referral: "Walk-in",
                    lastPurchase: new Date().toISOString().slice(0, 10),
                    firstPurchase: new Date().toISOString().slice(0, 10),
                    orderCount: 0,
                    totalSpend: 0,
                    visitCount: 1,
                    loyaltyPoints: 0,
                  },
                  ...cs,
                ])
              }
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1E6BFF] text-white px-4 py-2 text-sm font-bold shadow-md hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4" />
              Add customer
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            "all",
            "New",
            "Regular",
            "VIP",
            "Inactive",
            "High value",
          ].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c === "all" ? "all" : c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                (c === "all" && cat === "all") || c === cat
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
              }`}
            >
              {c === "all" ? "All categories" : c}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-500 tracking-wider">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 hidden md:table-cell">Address</th>
                <th className="px-4 py-3">Referral</th>
                <th className="px-4 py-3">Last purchase</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-blue-700">
                    {c.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    <div>{c.phone}</div>
                    <div className="text-xs text-slate-500">{c.name}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate hidden md:table-cell">
                    {c.address || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                    {c.referral}
                  </td>
                  <td className="px-4 py-3 text-xs">{c.lastPurchase}</td>
                  <td className="px-4 py-3">{c.orderCount}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-violet-50 text-violet-800 px-2 py-0.5 text-xs font-bold">
                      <Award className="w-3 h-3" />
                      {c.loyaltyPoints}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <CategoryPill label={c.category} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[90] flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close"
            onClick={() => setSelected(null)}
          />
          <aside className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto p-6">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-slate-900 pr-10">
              {selected.name}
            </h2>
            <p className="text-xs font-mono text-blue-600 mt-1">{selected.id}</p>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-500">
                  Loyalty
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {selected.loyalty.badge}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {selected.loyaltyPoints} pts
              </p>
              {selected.loyalty.discountPct > 0 ? (
                <p className="text-sm text-emerald-700 font-bold mt-1">
                  Eligible for {selected.loyalty.discountPct}% couture discount
                  on next qualifying purchase.
                </p>
              ) : selected.loyalty.nextTier ? (
                <p className="text-xs text-slate-600 mt-2">
                  Earn {selected.loyalty.nextTier.minPoints - selected.loyaltyPoints}{" "}
                  more points to unlock {selected.loyalty.nextTier.discountPct}%
                  ({selected.loyalty.nextTier.label}).
                </p>
              ) : null}
              <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-600 transition-all"
                  style={{
                    width: `${selected.loyalty.progressToNext}%`,
                  }}
                />
              </div>
            </div>

            <h3 className="text-sm font-black uppercase text-slate-500 mt-6 mb-2">
              Sample purchase history
            </h3>
            <ul className="space-y-2 text-sm">
              {dummyPurchaseHistory(selected.id).map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between rounded-xl border border-slate-100 px-3 py-2"
                >
                  <span className="text-slate-600">{p.date}</span>
                  <span className="font-bold text-slate-900">
                    ₹{p.amount.toLocaleString("en-IN")}
                  </span>
                  <span className="text-violet-600 text-xs font-bold">
                    +{p.pointsEarned} pts
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-col justify-between min-h-[100px] hover:border-blue-200/80 transition-colors">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function CategoryPill({ label }) {
  const map = {
    New: "bg-sky-50 text-sky-800 border-sky-100",
    Regular: "bg-emerald-50 text-emerald-900 border-emerald-100",
    VIP: "bg-amber-50 text-amber-900 border-amber-200",
    Inactive: "bg-slate-100 text-slate-600 border-slate-200",
    "High value": "bg-violet-50 text-violet-900 border-violet-100",
  };
  return (
    <span
      className={`inline-block text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${map[label] || map.Regular}`}
    >
      {label}
    </span>
  );
}
