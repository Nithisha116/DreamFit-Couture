// client/src/Pages/admin/ActivityLogPage.jsx
//
// Internal-only Activity Log — visible and accessible ONLY to accounts with
// isInternalAdmin: true. The client's own Admin account (same ADMIN role,
// isInternalAdmin: false) never sees this page; the backend independently
// enforces this with a 403 on the /api/audit-logs endpoint regardless of
// what the frontend does, so this client-side check is a UX nicety, not the
// real security boundary.
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import {
  ShieldCheck, Search, RefreshCw, ChevronLeft, ChevronRight,
  Filter, X, Clock, Globe, Monitor,
} from "lucide-react";
import API from "../../app/axios";
import showToast from "../../utils/toast";

const PAGE_SIZE = 25;

export default function ActivityLogPage() {
  const { user } = useSelector((state) => state.auth) || {};

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterEntityType, setFilterEntityType] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filterOptions, setFilterOptions] = useState({ actions: [], entityTypes: [], roles: [] });

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    API.get("/audit-logs/filters")
      .then((res) => setFilterOptions(res.data))
      .catch(() => {}); // non-critical — dropdowns just stay empty
  }, []);

  const fetchLogs = useCallback((page = 1) => {
    setLoading(true);
    const params = { page, limit: PAGE_SIZE };
    if (debouncedSearch) params.search = debouncedSearch;
    if (filterAction) params.action = filterAction;
    if (filterEntityType) params.entityType = filterEntityType;
    if (filterRole) params.userRole = filterRole;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    API.get("/audit-logs", { params })
      .then((res) => {
        setLogs(res.data.logs || []);
        setPagination(res.data.pagination || { page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
      })
      .catch((err) => {
        showToast.error(err.response?.data?.message || "Failed to load activity log");
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, filterAction, filterEntityType, filterRole, startDate, endDate]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  // Client-side gate — the actual boundary is the backend's 403.
  if (!user?.isInternalAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const clearFilters = () => {
    setSearchTerm(""); setFilterAction(""); setFilterEntityType(""); setFilterRole("");
    setStartDate(""); setEndDate("");
  };
  const hasActiveFilters = searchTerm || filterAction || filterEntityType || filterRole || startDate || endDate;

  const formatTimestamp = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Activity Log</h1>
              <p className="text-slate-500 text-sm font-medium">Internal-only audit trail — {pagination.total} total entries</p>
            </div>
          </div>
          <button
            onClick={() => fetchLogs(pagination.page)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by action, entity, description, user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border ${showFilters ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-slate-200 text-slate-600"}`}
            >
              <Filter size={16} /> Filters
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-rose-600 hover:bg-rose-50">
                <X size={16} /> Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
              <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                <option value="">All Actions</option>
                {filterOptions.actions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={filterEntityType} onChange={(e) => setFilterEntityType(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                <option value="">All Entity Types</option>
                {filterOptions.entityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                <option value="">All Roles</option>
                {filterOptions.roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700" />
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">User Agent</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="py-4 px-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400 font-semibold">
                      No activity found for the current filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <React.Fragment key={log._id}>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5"><Clock size={13} className="text-slate-300" />{formatTimestamp(log.createdAt)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{log.userName || "Unknown"}</div>
                          <div className="text-xs text-slate-400">{log.userEmail || "-"}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100">
                            {log.userRole || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700">{log.action}</td>
                        <td className="py-3 px-4">
                          <div className="text-slate-700 font-semibold">{log.entityType}</div>
                          <div className="text-xs text-slate-400 font-mono">{log.entityId}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          <div className="flex items-center gap-1.5"><Globe size={13} className="text-slate-300" />{log.ipAddress || "-"}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-[160px] truncate" title={log.userAgent}>
                          <div className="flex items-center gap-1.5"><Monitor size={13} className="text-slate-300 shrink-0" /><span className="truncate">{log.userAgent || "-"}</span></div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setExpandedId(expandedId === log._id ? null : log._id)}
                            className="text-indigo-600 hover:text-indigo-700 font-bold text-xs"
                          >
                            {expandedId === log._id ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>
                      {expandedId === log._id && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={8} className="py-3 px-4">
                            <div className="text-xs text-slate-600 space-y-1">
                              <p><span className="font-bold text-slate-700">Description:</span> {log.description}</p>
                              {log.previousData && (
                                <pre className="bg-white border border-slate-200 rounded-lg p-2 overflow-x-auto text-[11px]">{JSON.stringify(log.previousData, null, 2)}</pre>
                              )}
                              {log.newData && (
                                <pre className="bg-white border border-slate-200 rounded-lg p-2 overflow-x-auto text-[11px]">{JSON.stringify(log.newData, null, 2)}</pre>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total} entries)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchLogs(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => fetchLogs(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
