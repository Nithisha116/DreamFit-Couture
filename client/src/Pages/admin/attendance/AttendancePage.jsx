import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, List, Calendar as CalendarIcon, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";

import AttendanceTable from "../../../components/attendance/AttendanceTable";
import AttendanceModal from "../../../components/attendance/AttendanceModal";
import AttendanceStats from "../../../components/attendance/AttendanceStats";
import AttendanceCalendar from "../../../components/attendance/AttendanceCalendar";
import {
  fetchAttendance,
  fetchAttendanceStats,
  fetchAttendanceEmployees,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  reset,
} from "../../../features/attendance/attendanceSlice";

const STATUS_OPTIONS = ["all", "Present", "Absent", "Leave", "Half Day", "Late"];

export default function AttendancePage() {
  const dispatch = useDispatch();
  const { records, stats, employeeList, pagination, isLoading, isStatsLoading, isError, isSuccess, message } =
    useSelector((state) => state.attendance);

  const [viewMode, setViewMode] = useState("list"); // 'list' | 'calendar'
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Data
  const loadData = useCallback(() => {
    // Fetch stats and employee list independently of filters
    dispatch(fetchAttendanceStats(dateFilter));
    dispatch(fetchAttendanceEmployees());

    if (viewMode === "list") {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== "all") params.status = statusFilter;
      if (departmentFilter !== "all") params.department = departmentFilter;
      if (dateFilter) params.date = dateFilter;

      dispatch(fetchAttendance(params));
    } else {
      // Calendar view needs the whole month's data, limit increased
      const params = {
        page: 1,
        limit: 500, // Large enough to grab the month's data for calendar
        month: currentMonth.getMonth() + 1,
        year: currentMonth.getFullYear(),
      };
      if (departmentFilter !== "all") params.department = departmentFilter;
      dispatch(fetchAttendance(params));
    }
  }, [dispatch, viewMode, pagination.page, pagination.limit, debouncedSearch, statusFilter, departmentFilter, dateFilter, currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle errors
  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    dispatch(fetchAttendance({ ...buildParams(), page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    dispatch(fetchAttendance({ ...buildParams(), page: 1, limit: newLimit }));
  };

  const buildParams = () => {
    const params = { limit: pagination.limit };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== "all") params.status = statusFilter;
    if (departmentFilter !== "all") params.department = departmentFilter;
    if (dateFilter) params.date = dateFilter;
    return params;
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      try {
        await dispatch(deleteAttendance(id)).unwrap();
        toast.success("Attendance record deleted");
        loadData();
      } catch (err) {
        toast.error(err || "Failed to delete record");
      }
    }
  };

  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // If it's a ghost record, it won't have an _id, so we create a new one
      if (editingRecord && editingRecord._id) {
        await dispatch(updateAttendance({ id: editingRecord._id, data: formData })).unwrap();
        toast.success("Attendance updated successfully");
      } else {
        await dispatch(createAttendance(formData)).unwrap();
        toast.success("Attendance logged successfully");
      }
      setModalOpen(false);
      setEditingRecord(null);
      loadData();
    } catch (err) {
      toast.error(err || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract unique departments for filter (simple implementation)
  const departments = ["Tailoring", "Cutting", "Store", "Sales", "Admin", "General"];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Attendance Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track employee daily attendance.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === "list" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List size={16} /> List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === "calendar" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <CalendarIcon size={16} /> Calendar
            </button>
          </div>

          <button
            onClick={() => {
              setEditingRecord(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Attendance</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <AttendanceStats stats={stats} />

      {/* Main Content Area */}
      {viewMode === "list" ? (
        <div className="space-y-4">
          {/* Filters Row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Date Filter */}
              <div className="relative">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-4 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all w-full sm:w-[150px]"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all w-full sm:w-[140px]"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s === "all" ? "All Status" : s}</option>
                ))}
              </select>

              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all w-full sm:w-[150px]"
              >
                <option value="all">All Depts</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              
              {/* Clear Date Button */}
              {dateFilter && (
                <button 
                  onClick={() => setDateFilter("")}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium px-2"
                >
                  Clear Date
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee..."
                className="w-full lg:w-[220px] pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all placeholder:text-slate-400"
              />
              <button className="absolute right-1 top-1 bottom-1 px-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg flex items-center justify-center hover:from-purple-700 hover:to-indigo-700 transition-all">
                <Search size={16} />
              </button>
            </div>
          </div>

          <AttendanceTable
            data={records}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      ) : (
        <AttendanceCalendar 
          data={records} 
          currentDate={currentMonth} 
          onMonthChange={handleMonthChange} 
        />
      )}

      {/* Modal */}
      <AttendanceModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleModalSubmit}
        editData={editingRecord}
        isSubmitting={isSubmitting}
        employeeList={employeeList}
      />
    </div>
  );
}
