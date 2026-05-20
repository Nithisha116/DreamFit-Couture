import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchSalaryReports, 
  generateSalaries, 
  lockSalary,
  recalculateSalary,
  clearSalaryState 
} from "../../../features/salary/salarySlice";
import { 
  Wallet, Calendar, Filter, Download, 
  Lock, Unlock, RefreshCw, Search,
  ChevronRight, FileText, CheckCircle, 
  AlertCircle, Users, TrendingUp, DollarSign, Settings
} from "lucide-react";
import showToast from "../../../utils/toast";
import SalarySlipModal from "../../../components/salary/SalarySlipModal";
import PayrollSettingsModal from "../../../components/salary/PayrollSettingsModal";

export default function SalaryManagement() {
  const dispatch = useDispatch();
  const { reports, loading, error, success } = useSelector((state) => state.salary);
  
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    department: "all"
  });

  const [selectedSalary, setSelectedSalary] = useState(null);
  const [showSlip, setShowSlip] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    dispatch(fetchSalaryReports(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (success) {
      showToast.success("Salaries generated successfully! 💰");
      dispatch(clearSalaryState());
      dispatch(fetchSalaryReports(filters));
    }
    if (error) {
      showToast.error(error);
      dispatch(clearSalaryState());
    }
  }, [success, error, dispatch, filters]);

  const handleGenerate = () => {
    dispatch(generateSalaries({ month: filters.month, year: filters.year }));
  };

  const handleLock = (id) => {
    if (window.confirm("Are you sure you want to lock this salary record? This cannot be undone.")) {
      dispatch(lockSalary(id));
    }
  };
  
  const handleRecalculate = (id) => {
    dispatch(recalculateSalary(id))
      .unwrap()
      .then(() => showToast.success("Salary recalculated with latest data! 🔄"))
      .catch((err) => showToast.error(err));
  };

  const handleViewSlip = (salary) => {
    setSelectedSalary(salary);
    setShowSlip(true);
  };

  const stats = {
    totalPayout: reports.reduce((acc, curr) => acc + curr.netSalary, 0),
    totalEmployees: reports.length,
    lockedCount: reports.filter(r => r.isLocked).length,
    pendingCount: reports.length - reports.filter(r => r.isLocked).length
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Wallet size={20} />
              </div>
              PAYROLL HUB
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Manage monthly attendance analytics and salary disbursements</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              GENERATE {months[filters.month-1].toUpperCase()} SALARY
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-3 bg-white text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              title="Payroll Settings"
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={handleGenerate}
              className="p-3 bg-white text-blue-600 border border-slate-200 rounded-2xl hover:bg-blue-50 transition-all shadow-sm active:scale-95"
              title="Sync All Data"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ===== STATS GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Payout", value: `₹${stats.totalPayout.toLocaleString()}`, icon: DollarSign, color: "blue" },
            { label: "Headcount", value: stats.totalEmployees, icon: Users, color: "indigo" },
            { label: "Finalized", value: stats.lockedCount, icon: Lock, color: "emerald" },
            { label: "Pending", value: stats.pendingCount, icon: Unlock, color: "orange" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-50 rounded-2xl flex items-center justify-center text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>

        {/* ===== FILTERS & SEARCH ===== */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 mb-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <Calendar size={18} className="text-slate-400" />
            <select 
              value={filters.month} 
              onChange={(e) => setFilters({...filters, month: Number(e.target.value)})}
              className="bg-transparent font-bold text-sm text-slate-700 outline-none"
            >
              {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <TrendingUp size={18} className="text-slate-400" />
            <select 
              value={filters.year} 
              onChange={(e) => setFilters({...filters, year: Number(e.target.value)})}
              className="bg-transparent font-bold text-sm text-slate-700 outline-none"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={filters.department} 
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              className="bg-transparent font-bold text-sm text-slate-700 outline-none"
            >
              <option value="all">All Departments</option>
              <option value="Tailor">Tailors</option>
              <option value="Cutting Master">Cutting Masters</option>
              <option value="Store Keeper">Store Keepers</option>
            </select>
          </div>

          <button 
            onClick={() => dispatch(fetchSalaryReports(filters))}
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            Apply Filters
          </button>
        </div>

        {/* ===== SALARY TABLE ===== */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic Pay</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">OT Pay</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deductions</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Salary</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reports.length > 0 ? reports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                          {report.employeeName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none">{report.employeeName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tight">{report.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-700">{report.payableDays} Days</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Payable</span>
                        </div>
                        <div className="h-6 w-px bg-slate-100 mx-2"></div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-orange-600">{report.overtimeHours} Hrs</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">OT</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">₹{report.basicSalary.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-emerald-600">+₹{report.components.overtimePay.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-red-500">-₹{(
                        Object.values(report.components.deductions).reduce((a, b) => a + b, 0)
                      ).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-base font-black text-slate-900">₹{report.netSalary.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {report.isLocked ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-tighter">
                            <Lock size={12} /> LOCKED
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full border border-orange-100 text-[10px] font-black uppercase tracking-tighter">
                            <Unlock size={12} /> PENDING
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewSlip(report)}
                          className="p-2 bg-white text-slate-600 border border-slate-100 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                          title="View Pay Slip"
                        >
                          <FileText size={16} />
                        </button>
                        {!report.isLocked && (
                          <button 
                            onClick={() => handleLock(report._id)}
                            className="p-2 bg-white text-emerald-600 border border-slate-100 rounded-lg hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-sm"
                            title="Finalize & Lock"
                          >
                            <Lock size={16} />
                          </button>
                        )}
                        {!report.isLocked && (
                          <button 
                            onClick={() => handleRecalculate(report._id)}
                            className="p-2 bg-white text-blue-600 border border-slate-100 rounded-lg hover:bg-blue-50 hover:border-blue-100 transition-all shadow-sm"
                            title="Sync Latest Data"
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                          <AlertCircle size={32} />
                        </div>
                        <p className="text-slate-400 font-bold">No salary records found for this period</p>
                        <button 
                          onClick={handleGenerate}
                          className="text-blue-600 font-black text-sm uppercase tracking-widest hover:underline"
                        >
                          Generate Now
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showSlip && (
        <SalarySlipModal 
          salary={selectedSalary} 
          onClose={() => setShowSlip(false)} 
        />
      )}

      {showSettings && (
        <PayrollSettingsModal 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  );
}
