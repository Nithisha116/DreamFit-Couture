import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  IndianRupee,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Scissors,
  HardHat,
  Store,
  UserCog,
  TrendingUp,
  Wallet,
  Landmark,
  Smartphone,
  CreditCard,
  Plus,
  FileText,
  Wand2,
  Palette,
  Wrench,
} from 'lucide-react';
import { fetchSalaryHistory, fetchActiveEmployees } from '../../../features/salary/salarySlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const formatCurrency = (n) =>
  `₹${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

const ROLE_ICONS = {
  TAILOR: <Scissors size={18} />,
  CUTTING_MASTER: <HardHat size={18} />,
  STORE_KEEPER: <Store size={18} />,
  AARI_WORKER: <Wand2 size={18} />,
  EMBROIDERY_WORKER: <Palette size={18} />,
  HELPER: <Wrench size={18} />,
  ADMIN: <UserCog size={18} />,
};

const ROLE_COLORS = {
  TAILOR: 'blue',
  CUTTING_MASTER: 'orange',
  STORE_KEEPER: 'emerald',
  AARI_WORKER: 'pink',
  EMBROIDERY_WORKER: 'rose',
  HELPER: 'amber',
  ADMIN: 'purple',
};

const STATUS_CONFIG = {
  paid:    { label: 'Paid',    bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  partial: { label: 'Partial', bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
  unpaid:  { label: 'Unpaid',  bg: 'bg-red-100',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500'     },
};

const METHOD_INFO = {
  cash:          { label: 'Cash',          icon: <Wallet size={13} />,      color: 'text-orange-600' },
  upi:           { label: 'UPI',           icon: <Smartphone size={13} />,  color: 'text-purple-600' },
  'bank-transfer':{ label: 'Bank Transfer', icon: <Landmark size={13} />,    color: 'text-blue-600'   },
  card:          { label: 'Card',          icon: <CreditCard size={13} />,  color: 'text-green-600'  },
};

const getInitials = (name) =>
  name ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : '??';

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SalaryHistoryPage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { salaryHistory, historyLoading, activeEmployees } = useSelector((s) => s.salary);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Fetch history ────────────────────────────────────────────────────────
  useEffect(() => {
    if (employeeId) {
      dispatch(fetchSalaryHistory({ employeeId, year: selectedYear }));
    }
  }, [dispatch, employeeId, selectedYear]);

  // ── Fetch employees list to get meta ─────────────────────────────────────
  useEffect(() => {
    if (activeEmployees.length === 0) dispatch(fetchActiveEmployees());
  }, [dispatch, activeEmployees.length]);

  const employee = activeEmployees.find((e) => e.employeeId === employeeId);
  const color = ROLE_COLORS[employee?.role] || 'slate';

  // ── Filter by status ─────────────────────────────────────────────────────
  const filtered = salaryHistory.filter((r) =>
    statusFilter === 'all' || r.paymentStatus === statusFilter
  );

  // ── KPI aggregates ────────────────────────────────────────────────────────
  const totalEarned   = salaryHistory.reduce((a, r) => a + (r.totalSalary  || 0), 0);
  const totalPaid     = salaryHistory.reduce((a, r) => a + (r.paidAmount   || 0), 0);
  const totalOutstand = salaryHistory.reduce((a, r) => a + (r.remainingAmount || 0), 0);
  const monthsCount   = salaryHistory.length;

  const years = [2024, 2025, 2026, 2027];

  // ── Progress pct ─────────────────────────────────────────────────────────
  const progressPct = (paid, total) =>
    total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900">Salary History</h1>
              <p className="text-xs text-slate-500">{employeeId}</p>
            </div>
          </div>

          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Employee Card ──────────────────────────────────────────────── */}
        {employee && (
          <div className={`bg-gradient-to-r from-${color}-600 to-${color}-700 rounded-2xl p-5 text-white shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-black`}>
                {getInitials(employee.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black truncate">{employee.name}</h2>
                <p className="text-sm text-white/80">{employee.department}</p>
                <p className="text-xs text-white/60 font-mono mt-0.5">{employee.employeeId}</p>
              </div>
              <div className={`flex items-center gap-1.5 text-white/80`}>
                {ROLE_ICONS[employee.role]}
                <span className="text-sm font-semibold">{employee.role?.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Basic salary strip */}
            {employee.basicSalary > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-sm text-white/80">
                <IndianRupee size={14} />
                <span>Basic Salary: <strong className="text-white">{formatCurrency(employee.basicSalary)} / month</strong></span>
              </div>
            )}
          </div>
        )}

        {/* ── KPI Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Earned',    value: formatCurrency(totalEarned),   icon: <TrendingUp size={18} />, color: 'slate'   },
            { label: 'Total Paid',      value: formatCurrency(totalPaid),     icon: <CheckCircle size={18} />,color: 'emerald' },
            { label: 'Outstanding',     value: formatCurrency(totalOutstand), icon: <Clock size={18} />,      color: 'red'     },
            { label: 'Months Recorded', value: `${monthsCount} months`,       icon: <Calendar size={18} />,   color: 'blue'    },
          ].map((k, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className={`w-9 h-9 rounded-xl bg-${k.color}-50 text-${k.color}-600 flex items-center justify-center mb-2`}>
                {k.icon}
              </div>
              <p className={`text-lg font-black text-${k.color}-700`}>{k.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* ── Year-to-date progress bar ─────────────────────────────────── */}
        {totalEarned > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-bold text-slate-700">{selectedYear} — Payment Progress</p>
              <p className="text-sm font-black text-emerald-600">{progressPct(totalPaid, totalEarned)}% Paid</p>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                style={{ width: `${progressPct(totalPaid, totalEarned)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1.5">
              <span>Paid: {formatCurrency(totalPaid)}</span>
              <span>Total: {formatCurrency(totalEarned)}</span>
            </div>
          </div>
        )}

        {/* ── Status Filter ─────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'paid', 'partial', 'unpaid'].map((s) => {
            const cfg = STATUS_CONFIG[s] || { label: 'All', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  isActive
                    ? `${s === 'all' ? 'bg-blue-600 text-white border-blue-600' : `${cfg.bg} ${cfg.text} ${cfg.border}`} shadow-sm`
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {s === 'all' ? 'All Months' : cfg.label}
                {s !== 'all' && (
                  <span className="ml-1 opacity-60">
                    ({salaryHistory.filter((r) => r.paymentStatus === s).length})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Month Accordion ───────────────────────────────────────────── */}
        {historyLoading ? (
          <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
            <RefreshCw size={32} className="animate-spin" />
            <p className="text-sm font-medium">Loading salary history...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
            <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-600">No records found</p>
            <p className="text-sm text-slate-400 mt-1">
              {statusFilter !== 'all'
                ? `No ${statusFilter} salaries in ${selectedYear}`
                : `No salary records for ${selectedYear}. Generate salary from Payroll Hub first.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((record) => {
              const isOpen = expandedMonth === record._id;
              const cfg = STATUS_CONFIG[record.paymentStatus] || STATUS_CONFIG.unpaid;
              const pct = progressPct(record.paidAmount, record.totalSalary);

              return (
                <div
                  key={record._id}
                  className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 overflow-hidden ${
                    isOpen ? 'border-blue-200 shadow-md' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {/* ── Month Header ───────────────────────── */}
                  <button
                    className="w-full flex items-center gap-4 p-4 sm:p-5 text-left"
                    onClick={() => setExpandedMonth(isOpen ? null : record._id)}
                  >
                    {/* Month badge */}
                    <div className={`w-12 h-12 rounded-xl bg-${color}-50 text-${color}-700 flex flex-col items-center justify-center flex-shrink-0`}>
                      <span className="text-[10px] font-bold uppercase">{MONTHS[record.month - 1]?.slice(0, 3)}</span>
                      <span className="text-xs font-black">{record.year}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-slate-900">{MONTHS[record.month - 1]} {record.year}</p>
                        {record.isLocked && <Lock size={12} className="text-slate-400" />}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-400' : 'bg-red-300'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">{pct}%</span>
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-black text-slate-900">{formatCurrency(record.totalSalary)}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Paid: <span className="text-emerald-600 font-bold">{formatCurrency(record.paidAmount)}</span>
                      </p>
                      {record.remainingAmount > 0 && (
                        <p className="text-[10px] text-red-500 font-bold">
                          Due: {formatCurrency(record.remainingAmount)}
                        </p>
                      )}
                    </div>

                    <div className="text-slate-400 flex-shrink-0">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {/* ── Expanded Details ───────────────────── */}
                  {isOpen && (
                    <div className="border-t border-slate-100 px-4 sm:px-5 pb-5 pt-4 space-y-4">

                      {/* 3 col stat row */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Basic',   value: formatCurrency(record.basicSalary),  color: 'slate'   },
                          { label: 'Gross',   value: formatCurrency(record.grossSalary),  color: 'blue'    },
                          { label: 'Net Pay', value: formatCurrency(record.netSalary),    color: 'emerald' },
                        ].map((s, i) => (
                          <div key={i} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
                            <p className={`text-sm font-black text-${s.color}-700 mt-0.5`}>{s.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Attendance strip */}
                      {record.attendance && (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {[
                            { label: 'Present',  value: record.attendance.present,   color: 'emerald' },
                            { label: 'Absent',   value: record.attendance.absent,    color: 'red'     },
                            { label: 'Leave',    value: record.attendance.leave,     color: 'blue'    },
                            { label: 'Half Day', value: record.attendance.halfDay,   color: 'amber'   },
                            { label: 'Work Hrs', value: record.attendance.workHours, color: 'slate'   },
                            { label: 'Overtime', value: record.attendance.overtime,  color: 'violet'  },
                          ].map((a, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
                              <p className={`text-sm font-black text-${a.color}-600`}>{a.value ?? 0}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{a.label}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Payment history */}
                      {record.paymentHistory?.length > 0 ? (
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <IndianRupee size={12} />
                            Payment Transactions ({record.paymentHistory.length})
                          </p>
                          <div className="space-y-2">
                            {record.paymentHistory.map((p, idx) => {
                              const mInfo = METHOD_INFO[p.paymentMethod] || { label: p.paymentMethod, icon: null, color: 'text-slate-600' };
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                                >
                                  <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm ${mInfo.color}`}>
                                    {mInfo.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800">{p.transactionType}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                      <span>{mInfo.label}</span>
                                      {p.refNumber && (
                                        <span className="font-mono text-blue-500">{p.refNumber}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-black text-emerald-700">{formatCurrency(p.amount)}</p>
                                    <p className="text-[10px] text-slate-400">
                                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100 text-red-600 text-sm">
                          <AlertCircle size={16} />
                          <span className="font-semibold">No payments recorded yet for this month</span>
                        </div>
                      )}

                      {/* Pay remaining CTA */}
                      {record.remainingAmount > 0 && (
                        <button
                          onClick={() => navigate('/admin/banking/expense', { state: { openPaySalary: true, employeeId, month: record.month, year: record.year } })}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-sm hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Plus size={16} />
                          Pay Remaining {formatCurrency(record.remainingAmount)}
                        </button>
                      )}

                      {/* View Slip */}
                      <button
                        onClick={() => navigate(`/admin/salary-slip/${employeeId}/${record.month}/${record.year}`)}
                        className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                      >
                        <FileText size={16} />
                        View Salary Slip
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom padding */}
        <div className="h-10" />
      </div>
    </div>
  );
}
