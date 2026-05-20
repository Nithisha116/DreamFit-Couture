import { Pencil, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function OutsourcingTable({
  data = [],
  isLoading,
  pagination,
  onPageChange,
  onLimitChange,
  onEdit,
}) {
  const columns = [
    "Order Number",
    "Product",
    "Employee",
    "Given Date",
    "Expected Date",
    "Notes",
    "Status",
    "Actions",
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-left py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {columns.map((col, j) => (
                    <td key={j} className="py-4 px-5">
                      <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-20"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-left py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Inbox size={48} strokeWidth={1.2} className="mb-3 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">No outsourcing records found</p>
          <p className="text-xs text-slate-400 mt-1">Records will appear here once created</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-left py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr
                key={item._id || idx}
                className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors duration-150 cursor-default"
              >
                <td className="py-4 px-5 font-medium text-slate-700">
                  {item.orderNumber ?? 0}
                </td>
                <td className="py-4 px-5 text-slate-600 max-w-[180px] truncate">
                  {item.productName || "-"}
                </td>
                <td className="py-4 px-5 text-slate-600">
                  {item.employeeName || "-"}
                </td>
                <td className="py-4 px-5 text-slate-500 whitespace-nowrap">
                  {formatDate(item.givenDate)}
                </td>
                <td className="py-4 px-5 text-slate-500 whitespace-nowrap">
                  {formatDate(item.expectedDate)}
                </td>
                <td className="py-4 px-5 text-slate-500 max-w-[200px] truncate">
                  {item.notes || "-"}
                </td>
                <td className="py-4 px-5">
                  <StatusBadge status={item.status} />
                </td>
                <td className="py-4 px-5">
                  <button
                    onClick={() => onEdit && onEdit(item)}
                    className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all duration-150"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-4 px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
        <span>
          Total {pagination?.total || 0} items
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange && onPageChange(pagination.page - 1)}
            disabled={pagination?.page <= 1}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="w-8 h-8 flex items-center justify-center rounded-lg border border-violet-300 text-violet-700 font-bold bg-violet-50">
            {pagination?.page || 1}
          </span>
          <button
            onClick={() => onPageChange && onPageChange(pagination.page + 1)}
            disabled={pagination?.page >= pagination?.totalPages}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        <select
          value={pagination?.limit || 5}
          onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
          className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 cursor-pointer"
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>
    </div>
  );
}
