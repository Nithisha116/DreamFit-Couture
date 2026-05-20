import { Edit, Trash2, Clock, Calendar as CalendarIcon, User, PlusCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function AttendanceTable({
  data,
  isLoading,
  pagination,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
}) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <CalendarIcon className="text-blue-500" size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">No Attendance Records</h3>
        <p className="text-slate-500 text-sm">No attendance records found for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Shift</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Time (In/Out)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Overtime</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((record, idx) => (
              <tr 
                key={record._id || `ghost-${idx}`} 
                className={`transition-colors group ${record.isGhost ? "bg-slate-50/30 italic" : "hover:bg-slate-50/50"}`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${record.isGhost ? "bg-slate-100 text-slate-400" : "bg-indigo-50 text-indigo-600"}`}>
                      <User size={16} />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${record.isGhost ? "text-slate-500" : "text-slate-800"}`}>
                        {record.employeeName}
                        {record.isGhost && <span className="ml-2 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-normal uppercase tracking-wider italic">To Mark</span>}
                      </p>
                      <p className="text-xs text-slate-500">{record.employeeId} • {record.department || "No Dept"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-700 text-sm">
                    {new Date(record.attendanceDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{record.shift}</p>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={record.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Clock size={12} className="text-emerald-500" />
                      In: <span className="font-medium text-slate-800">{record.checkInTime || "--:--"}</span>
                    </span>
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Clock size={12} className="text-rose-500" />
                      Out: <span className="font-medium text-slate-800">{record.checkOutTime || "--:--"}</span>
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${record.overtimeHours > 0 ? "text-amber-600" : "text-slate-400"}`}>
                    {record.overtimeHours > 0 ? `${record.overtimeHours} hrs` : "-"}
                  </span>
                </td>
                <td className="px-6 py-4 max-w-[200px] truncate text-sm text-slate-600">
                  {record.notes || "-"}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`flex items-center justify-end gap-2 transition-opacity ${record.isGhost ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    <button
                      onClick={() => onEdit(record)}
                      className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        record.isGhost 
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 pr-3" 
                          : "text-blue-600 hover:bg-blue-50"
                      }`}
                      title={record.isGhost ? "Mark Attendance" : "Edit"}
                    >
                      {record.isGhost ? (
                        <>
                          <PlusCircle size={18} />
                          <span className="text-xs font-bold">Mark Now</span>
                        </>
                      ) : (
                        <Edit size={16} />
                      )}
                    </button>
                    {!record.isGhost && (
                      <button
                        onClick={() => onDelete(record._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Show</span>
          <select
            value={pagination.limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2 py-1 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600 font-medium px-2">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
