import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Search, Plus, Calendar, Filter, 
  CheckCircle2, XCircle, Clock, AlertCircle, Trash2,
  CalendarDays, User, ChevronLeft, ChevronRight, FileText
} from "lucide-react";
import toast from "react-hot-toast";

import { fetchLeaves, createLeaveRequest, updateLeaveStatus, reset } from "../../../features/leave/leaveSlice";
import { fetchAttendanceEmployees } from "../../../features/attendance/attendanceSlice";
import LeaveModal from "../../../components/leave/LeaveModal";
import LeaveStatusBadge from "../../../components/leave/LeaveStatusBadge";

const STATUS_OPTIONS = ["all", "Pending", "Approved", "Rejected", "Cancelled"];
const DEPARTMENTS = ["all", "Tailoring", "Cutting", "Store", "Sales", "Admin"];

export default function LeavePage() {
  const dispatch = useDispatch();
  const { leaves, pagination, isLoading, isError, message } = useSelector((state) => state.leave);
  const { employeeList } = useSelector((state) => state.attendance);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadData = useCallback(() => {
    const params = {
      page: pagination.currentPage,
      limit: 10,
    };
    if (statusFilter !== "all") params.status = statusFilter;
    if (deptFilter !== "all") params.department = deptFilter;
    if (debouncedSearch) params.search = debouncedSearch;

    dispatch(fetchLeaves(params));
    dispatch(fetchAttendanceEmployees());
  }, [dispatch, pagination.currentPage, statusFilter, deptFilter, debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const handleCreateLeave = async (formData) => {
    setIsSubmitting(true);
    try {
      await dispatch(createLeaveRequest(formData)).unwrap();
      toast.success("Leave request submitted successfully");
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status, currentStatus) => {
    const confirmMsg = status === "Approved" 
      ? "Are you sure you want to approve this leave? This will automatically update attendance records."
      : status === "Cancelled" 
        ? "Are you sure you want to cancel this leave? Attendance records will be rolled back."
        : `Are you sure you want to set this leave to ${status}?`;

    if (window.confirm(confirmMsg)) {
      try {
        await dispatch(updateLeaveStatus({ id, status })).unwrap();
        toast.success(`Leave request ${status.toLowerCase()}`);
        loadData();
      } catch (err) {
        toast.error(err || "Failed to update status");
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    dispatch(fetchLeaves({ page: newPage, limit: 10, status: statusFilter, department: deptFilter, search: debouncedSearch }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Leave Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage employee leave requests and attendance synchronization.</p>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Plus size={18} />
          Apply for Leave
        </button>
      </div>

      {/* Summary Cards (Quick Glance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Pending Requests", value: leaves.filter(l => l.status === "Pending").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Approved (Current)", value: leaves.filter(l => l.status === "Approved").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Rejected", value: leaves.filter(l => l.status === "Rejected").length, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Total This Month", value: pagination.totalRecords, icon: CalendarDays, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow duration-300">
            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-0.5">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-auto">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all w-full sm:w-[160px] appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
            </select>
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-6 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all w-full sm:w-[160px] appearance-none cursor-pointer"
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'all' ? 'All Depts' : d}</option>)}
            </select>
          </div>
        </div>

        <div className="relative w-full lg:w-[320px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee or reason..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Type & Duration</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Reason</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                      Loading records...
                    </div>
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <FileText size={64} className="text-slate-300" />
                      <p className="text-xl font-bold text-slate-400">No Leave Requests Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id} className="group hover:bg-slate-50/50 transition-colors duration-200">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{leave.employeeName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{leave.employeeId} • {leave.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-700">{leave.leaveType}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Calendar size={12} />
                          <span>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-black text-slate-500">{leave.totalDays}D</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-500 max-w-[240px] truncate leading-relaxed" title={leave.reason}>
                        {leave.reason}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <LeaveStatusBadge status={leave.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {leave.status === "Pending" ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(leave._id, "Approved")}
                              className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(leave._id, "Rejected")}
                              className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        ) : leave.status === "Approved" ? (
                          <button
                            onClick={() => handleUpdateStatus(leave._id, "Cancelled")}
                            className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <AlertCircle size={14} /> Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300 italic font-medium px-4">No actions available</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Showing <span className="text-slate-800">{leaves.length}</span> of <span className="text-slate-800">{pagination.totalRecords}</span> requests
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 py-1 bg-white border border-slate-100 rounded-lg text-sm font-bold text-slate-700 shadow-sm">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <LeaveModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSubmit={handleCreateLeave}
        isSubmitting={isSubmitting}
        employeeList={employeeList}
      />
    </div>
  );
}
