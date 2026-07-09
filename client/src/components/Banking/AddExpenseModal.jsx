// components/Banking/AddExpenseModal.jsx - Extended with Salary Payment Workflow
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  X, IndianRupee, Calendar, Wallet, Landmark,
  Zap, Car, ShoppingBag, Home, Wrench, Briefcase, Plus,
  RefreshCw, Users, Search, ChevronLeft, CheckCircle,
  AlertTriangle, Lock, Scissors, HardHat, Store, UserCog,
  CreditCard, Smartphone, AlertCircle
} from 'lucide-react';
import { createNewTransaction } from '../../features/transaction/transactionSlice';
import {
  fetchActiveEmployees,
  fetchPayrollSummary,
  paySalaryThunk,
  clearSalaryState,
  clearPayrollSummary,
} from '../../features/salary/salarySlice';
import showToast from '../../utils/toast';

// ─── Constants ────────────────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  { value: 'salary', label: 'Employee Salary', icon: <Briefcase size={24} />, color: 'blue', isSalary: true },
  { value: 'electricity', label: 'Electricity Bill', icon: <Zap size={24} />, color: 'yellow' },
  { value: 'travel', label: 'Travel', icon: <Car size={24} />, color: 'green' },
  { value: 'material-purchase', label: 'Material Purchase', icon: <ShoppingBag size={24} />, color: 'purple' },
  { value: 'rent', label: 'Rent', icon: <Home size={24} />, color: 'indigo' },
  { value: 'maintenance', label: 'Maintenance', icon: <Wrench size={24} />, color: 'orange' },
  { value: 'other-expense', label: 'Other Expense', icon: <Plus size={24} />, color: 'gray' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: '💵', accountType: 'hand-cash', color: 'orange' },
  { value: 'upi', label: 'UPI', icon: '📱', accountType: 'bank', color: 'purple' },
  { value: 'bank-transfer', label: 'Bank Transfer', icon: '🏦', accountType: 'bank', color: 'blue' },
  { value: 'card', label: 'Card', icon: '💳', accountType: 'bank', color: 'green' },
];

const SALARY_TYPES = [
  'Payroll Salary', 'Advance Salary', 'Bonus', 'Overtime', 'Incentive', 'Deduction Adjustment',
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ROLE_ICONS = {
  TAILOR: <Scissors size={16} />,
  CUTTING_MASTER: <HardHat size={16} />,
  STORE_KEEPER: <Store size={16} />,
  ADMIN: <UserCog size={16} />,
};

const ROLE_COLORS = {
  TAILOR: 'blue',
  CUTTING_MASTER: 'orange',
  STORE_KEEPER: 'emerald',
  ADMIN: 'purple',
};

const METHOD_DOT_COLORS = {
  cash: 'bg-orange-500',
  upi: 'bg-purple-500',
  'bank-transfer': 'bg-blue-500',
  card: 'bg-green-500',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (n) =>
  `₹${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

const getInitials = (name) =>
  name ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : '??';

const getCurrentYearMonth = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AddExpenseModal({ onClose, accountType = null, onSuccess, prefilledState = null }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: txnLoading } = useSelector((s) => s.transaction);
  const {
    activeEmployees, employeesLoading,
    payrollSummary, summaryLoading,
    payLoading, paySuccess, lastTransaction, error: salaryError,
  } = useSelector((s) => s.salary);
  const { user } = useSelector((s) => s.auth);

  // ── Flow state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [isSalaryFlow, setIsSalaryFlow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Apply prefilledState (from "Pay Remaining" on SalaryHistoryPage) ─────────
  useEffect(() => {
    if (prefilledState?.openPaySalary && activeEmployees.length > 0) {
      const emp = activeEmployees.find((e) => e.employeeId === prefilledState.employeeId);
      if (emp) {
        setIsSalaryFlow(true);
        setSelectedEmployee(emp);
        setSalaryMonth(prefilledState.month || getCurrentYearMonth().month);
        setSalaryYear(prefilledState.year || getCurrentYearMonth().year);
        setFormData((prev) => ({ ...prev, category: 'salary' }));
        setStep(3); // Jump straight to payroll summary
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledState, activeEmployees]);

  // Normal expense form
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    customCategory: '',
    amount: '',
    paymentMethod: accountType === 'hand-cash' ? 'cash' : 'upi',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
  });

  // Salary flow state
  const [salaryType, setSalaryType] = useState('Payroll Salary');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [empSearch, setEmpSearch] = useState('');
  const [salaryMonth, setSalaryMonth] = useState(getCurrentYearMonth().month);
  const [salaryYear, setSalaryYear] = useState(getCurrentYearMonth().year);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('upi');
  const [payNotes, setPayNotes] = useState('');
  const [salaryStepError, setSalaryStepError] = useState('');

  // ── Fetch employees when salary flow starts ─────────────────────────────────
  useEffect(() => {
    if (isSalaryFlow && activeEmployees.length === 0) {
      dispatch(fetchActiveEmployees());
    }
  }, [isSalaryFlow, dispatch, activeEmployees.length]);

  // ── Fetch payroll summary when employee + month + year all set ──────────────
  useEffect(() => {
    if (isSalaryFlow && selectedEmployee && salaryMonth && salaryYear && step === 3) {
      dispatch(clearPayrollSummary());
      dispatch(fetchPayrollSummary({
        employeeId: selectedEmployee.employeeId,
        month: salaryMonth,
        year: salaryYear,
      }));
    }
  }, [isSalaryFlow, selectedEmployee, salaryMonth, salaryYear, step, dispatch]);

  // ── Auto-fill amount with remaining ────────────────────────────────────────
  useEffect(() => {
    if (payrollSummary && step === 4 && !payAmount) {
      setPayAmount(String(payrollSummary.remainingAmount || ''));
    }
  }, [payrollSummary, step]);

  // ── Handle pay success ──────────────────────────────────────────────────────
  useEffect(() => {
    if (paySuccess && lastTransaction) {
      setStep(5);
    }
  }, [paySuccess, lastTransaction]);

  // ── Handle salary error ─────────────────────────────────────────────────────
  useEffect(() => {
    if (salaryError && step === 4) {
      setSalaryStepError(salaryError);
    }
  }, [salaryError, step]);

  const filteredEmployees = activeEmployees.filter((e) =>
    !empSearch ||
    e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(empSearch.toLowerCase()) ||
    e.department.toLowerCase().includes(empSearch.toLowerCase())
  );

  const totalSteps = isSalaryFlow ? 5 : 3;
  const progressStep = step;

  // ── Category click handler ──────────────────────────────────────────────────
  const handleCategoryClick = (cat) => {
    if (cat.isSalary) {
      setIsSalaryFlow(true);
      setFormData({ ...formData, category: cat.value });
      setStep(2);
    } else {
      setIsSalaryFlow(false);
      setFormData({ ...formData, category: cat.value });
      setStep(2);
    }
  };

  // ── Normal expense submit ───────────────────────────────────────────────────
  const handleNormalSubmit = async (e) => {
    e.preventDefault();
    if (loading || isSubmitting) return;
    if (formData.category === 'other-expense' && !formData.customCategory?.trim()) {
      showToast.error('Please enter a name for the expense category');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showToast.error('Please enter a valid amount');
      return;
    }
    setIsSubmitting(true);
    try {
      const now = new Date();
      const selectedDate = new Date(formData.transactionDate);
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      await dispatch(createNewTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
        transactionDate: selectedDate.toISOString(),
        customCategory: formData.category === 'other-expense' ? formData.customCategory : undefined,
      })).unwrap();
      showToast.success('Expense added successfully!');
      if (onSuccess) onSuccess();
      else onClose();
    } catch (err) {
      showToast.error(err || 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Salary: proceed from step 2 (employee + month selection) ───────────────
  const handleSalaryStep2Next = () => {
    if (!selectedEmployee) { showToast.error('Please select an employee'); return; }
    setStep(3);
  };

  // ── Salary: proceed from step 3 (payroll summary) ──────────────────────────
  const handleSalaryStep3Next = () => {
    if (!payrollSummary) { showToast.error('Payroll data not loaded'); return; }
    if (payrollSummary.isLocked && payrollSummary.remainingAmount <= 0) {
      showToast.error('This payroll is fully paid and locked'); return;
    }
    setPayAmount(String(payrollSummary.remainingAmount || ''));
    setSalaryStepError('');
    setStep(4);
  };

  // ── Salary: submit payment ──────────────────────────────────────────────────
  const handleSalaryPay = async () => {
    const amount = parseFloat(payAmount);
    if (!amount || amount < 1) { setSalaryStepError('Amount must be at least ₹1'); return; }
    if (payrollSummary && Math.round(amount * 100) > Math.round((payrollSummary.remainingAmount || 0) * 100)) {
      setSalaryStepError(`Amount exceeds remaining salary of ${formatCurrency(payrollSummary.remainingAmount)}`);
      return;
    }
    setSalaryStepError('');
    dispatch(clearSalaryState());
    dispatch(paySalaryThunk({
      employeeId: selectedEmployee.employeeId,
      employeeName: selectedEmployee.name,
      department: selectedEmployee.department,
      payrollId: payrollSummary.payrollId,
      transactionType: salaryType,
      amount,
      paymentMethod: payMethod,
      month: salaryMonth,
      year: salaryYear,
      notes: payNotes,
    }));
  };

  const loading = txnLoading || isSubmitting;

  // ─── Progress bar ─────────────────────────────────────────────────────────
  const renderProgress = () => (
    <div className="flex gap-1.5 mt-4">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-1 rounded-full transition-all duration-300 ${
            i + 1 <= progressStep ? 'bg-white' : 'bg-white/30'
          }`}
        />
      ))}
    </div>
  );

  // ─── Step Label ───────────────────────────────────────────────────────────
  const stepLabels = isSalaryFlow
    ? ['Category', 'Employee & Month', 'Payroll Summary', 'Payment', 'Done']
    : ['Category', 'Amount & Method', 'Details'];

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="p-6 bg-gradient-to-r from-red-600 to-red-700 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">
                {isSalaryFlow && step === 5 ? '✅ Payment Successful' : 'Add Expense'}
              </h2>
              <p className="text-sm text-white/80 mt-0.5">
                {isSalaryFlow
                  ? stepLabels[step - 1]
                  : 'Record money spent'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-all" disabled={payLoading}>
              <X size={20} className="text-white" />
            </button>
          </div>
          {renderProgress()}
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ════════════════════════════════════════════════════════════
              STEP 1 — Category Selection (shared for both flows)
          ════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Select Expense Category</h3>
              <div className="grid grid-cols-2 gap-3">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.value}
                    onClick={() => handleCategoryClick(cat)}
                    className={`p-4 rounded-xl border-2 border-slate-200 hover:border-${cat.color}-400 hover:bg-${cat.color}-50 transition-all text-left group`}
                  >
                    <div className={`text-${cat.color}-600 mb-2`}>{cat.icon}</div>
                    <span className="font-semibold text-slate-700">{cat.label}</span>
                    {cat.isSalary && (
                      <span className="block text-[10px] text-blue-500 font-medium mt-0.5">Salary workflow →</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              SALARY FLOW — Step 2: Employee + Salary Type + Month
          ════════════════════════════════════════════════════════════ */}
          {isSalaryFlow && step === 2 && (
            <div className="space-y-5">
              {/* Salary Type chips */}
              <div>
                <h3 className="font-bold text-slate-800 mb-3">Salary Type</h3>
                <div className="flex flex-wrap gap-2">
                  {SALARY_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSalaryType(t)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                        salaryType === t
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month + Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Month</label>
                  <select
                    value={salaryMonth}
                    onChange={(e) => { setSalaryMonth(Number(e.target.value)); setSelectedEmployee(null); }}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Year</label>
                  <select
                    value={salaryYear}
                    onChange={(e) => { setSalaryYear(Number(e.target.value)); setSelectedEmployee(null); }}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Employee Search */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2">Select Employee</h3>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    placeholder="Search by name, ID or department..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {employeesLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
                    <RefreshCw size={18} className="animate-spin" />
                    <span className="text-sm">Loading employees...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {filteredEmployees.length === 0 ? (
                      <p className="text-center text-slate-400 text-sm py-6">No employees found</p>
                    ) : (
                      filteredEmployees.map((emp) => {
                        const color = ROLE_COLORS[emp.role] || 'slate';
                        const isSelected = selectedEmployee?.employeeId === emp.employeeId;
                        return (
                          <button
                            key={emp.employeeId}
                            type="button"
                            onClick={() => setSelectedEmployee(emp)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? `border-${color}-500 bg-${color}-50`
                                : 'border-slate-100 hover:border-slate-200 bg-white'
                            }`}
                          >
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center text-${color}-700 font-black text-sm flex-shrink-0`}>
                              {getInitials(emp.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 text-sm truncate">{emp.name}</p>
                              <p className="text-xs text-slate-500">{emp.employeeId} · {emp.department}</p>
                            </div>
                            <div className={`flex items-center gap-1 text-${color}-600 flex-shrink-0`}>
                              {ROLE_ICONS[emp.role]}
                            </div>
                            {isSelected && <CheckCircle size={16} className={`text-${color}-600 flex-shrink-0`} />}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              SALARY FLOW — Step 3: Payroll Summary
          ════════════════════════════════════════════════════════════ */}
          {isSalaryFlow && step === 3 && (
            <div className="space-y-4">
              {/* Employee header */}
              {selectedEmployee && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className={`w-12 h-12 rounded-xl bg-${ROLE_COLORS[selectedEmployee.role] || 'slate'}-100 flex items-center justify-center text-${ROLE_COLORS[selectedEmployee.role] || 'slate'}-700 font-black text-sm`}>
                    {getInitials(selectedEmployee.name)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{selectedEmployee.name}</p>
                    <p className="text-xs text-slate-500">{selectedEmployee.department} · {selectedEmployee.employeeId}</p>
                    <p className="text-xs font-semibold text-blue-600">{MONTHS[salaryMonth - 1]} {salaryYear}</p>
                  </div>
                </div>
              )}

              {summaryLoading ? (
                <div className="flex flex-col items-center py-10 gap-3 text-slate-400">
                  <RefreshCw size={28} className="animate-spin" />
                  <p className="text-sm font-medium">Loading payroll summary...</p>
                </div>
              ) : payrollSummary ? (
                <>
                  {/* Lock banners */}
                  {payrollSummary.isLocked && payrollSummary.remainingAmount <= 0 && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      <Lock size={16} />
                      <span className="font-semibold">This payroll is fully paid and locked. No further payments can be made.</span>
                    </div>
                  )}
                  {payrollSummary.isLocked && payrollSummary.remainingAmount > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                      <Lock size={16} />
                      <span className="font-semibold">Payroll is locked but payment is still due. You can still pay.</span>
                    </div>
                  )}

                  {/* 4 stat cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Total Salary', value: formatCurrency(payrollSummary.totalSalary), color: 'slate' },
                      { label: 'Paid', value: formatCurrency(payrollSummary.paidAmount), color: 'emerald' },
                      { label: 'Remaining', value: formatCurrency(payrollSummary.remainingAmount), color: payrollSummary.remainingAmount > 0 ? 'red' : 'emerald' },
                      {
                        label: 'Status',
                        value: payrollSummary.paymentStatus?.toUpperCase() || 'UNPAID',
                        color: payrollSummary.paymentStatus === 'paid' ? 'emerald' : payrollSummary.paymentStatus === 'partial' ? 'amber' : 'red',
                        isBadge: true,
                      },
                    ].map((s, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                        {s.isBadge ? (
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-black bg-${s.color}-100 text-${s.color}-700`}>{s.value}</span>
                        ) : (
                          <p className={`text-lg font-black text-${s.color}-700`}>{s.value}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Attendance strip */}
                  {payrollSummary.attendance && (
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      {[
                        { label: 'Present', value: payrollSummary.attendance.present, color: 'emerald' },
                        { label: 'Absent', value: payrollSummary.attendance.absent, color: 'red' },
                        { label: 'Leave', value: payrollSummary.attendance.leave, color: 'blue' },
                        { label: 'Half Day', value: payrollSummary.attendance.halfDay, color: 'amber' },
                        { label: 'Work Hrs', value: payrollSummary.attendance.workHours, color: 'slate' },
                        { label: 'Overtime', value: payrollSummary.attendance.overtime, color: 'violet' },
                      ].map((a, i) => (
                        <div key={i} className="text-center">
                          <p className={`text-base font-black text-${a.color}-600`}>{a.value ?? 0}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{a.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payment history */}
                  {payrollSummary.paymentHistory?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Previous Payments</p>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {payrollSummary.paymentHistory.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${METHOD_DOT_COLORS[p.paymentMethod] || 'bg-slate-400'}`} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{p.transactionType}</span>
                            <span className="text-[10px] text-slate-400 ml-auto">{new Date(p.paidAt).toLocaleDateString('en-IN')}</span>
                            <span className="text-sm font-black text-emerald-700">{formatCurrency(p.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center py-10 gap-3 text-slate-400">
                  <AlertCircle size={32} />
                  <p className="text-sm font-medium text-center">No payroll record found for this period.<br />Generate salary first from the Payroll Hub.</p>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              SALARY FLOW — Step 4: Enter Payment
          ════════════════════════════════════════════════════════════ */}
          {isSalaryFlow && step === 4 && payrollSummary && (
            <div className="space-y-5">
              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Amount (₹) <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-slate-400 font-normal">Max: {formatCurrency(payrollSummary.remainingAmount)}</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => { setPayAmount(e.target.value); setSalaryStepError(''); }}
                    placeholder="0"
                    min="1"
                    max={payrollSummary.remainingAmount}
                    step="1"
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-2xl font-black outline-none transition-all ${
                      salaryStepError ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-500'
                    }`}
                    autoFocus
                  />
                </div>
                {/* Quick-fill buttons */}
                <div className="flex gap-2 mt-2">
                  {[5000, 10000].map((q) => (
                    payrollSummary.remainingAmount >= q && (
                      <button
                        key={q}
                        type="button"
                        onClick={() => { setPayAmount(String(q)); setSalaryStepError(''); }}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-xs font-bold transition-all border border-slate-200"
                      >
                        {formatCurrency(q)}
                      </button>
                    )
                  ))}
                  {payrollSummary.remainingAmount > 0 && (
                    <button
                      type="button"
                      onClick={() => { setPayAmount(String(payrollSummary.remainingAmount)); setSalaryStepError(''); }}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all border border-emerald-200"
                    >
                      Full: {formatCurrency(payrollSummary.remainingAmount)}
                    </button>
                  )}
                </div>
                {salaryStepError && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-xs font-semibold">
                    <AlertTriangle size={14} />
                    {salaryStepError}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setPayMethod(m.value)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        payMethod === m.value
                          ? `border-${m.color}-500 bg-${m.color}-50`
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl block mb-0.5">{m.icon}</span>
                      <span className="font-semibold text-sm">{m.label}</span>
                      <span className={`text-xs block ${m.accountType === 'hand-cash' ? 'text-orange-600' : 'text-blue-600'}`}>
                        {m.accountType === 'hand-cash' ? 'Hand Cash' : 'Bank'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  rows={2}
                  placeholder="Add payment notes..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Summary preview */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm">
                <p className="font-bold text-blue-900 mb-1">Payment Summary</p>
                <div className="flex justify-between text-blue-700">
                  <span>Employee:</span>
                  <span className="font-semibold">{selectedEmployee?.name}</span>
                </div>
                <div className="flex justify-between text-blue-700">
                  <span>Period:</span>
                  <span className="font-semibold">{MONTHS[salaryMonth - 1]} {salaryYear}</span>
                </div>
                <div className="flex justify-between text-blue-700">
                  <span>Type:</span>
                  <span className="font-semibold">{salaryType}</span>
                </div>
                <div className="flex justify-between text-blue-900 font-black text-base mt-1 pt-1 border-t border-blue-200">
                  <span>Amount:</span>
                  <span className="text-emerald-700">{formatCurrency(parseFloat(payAmount) || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              SALARY FLOW — Step 5: Success
          ════════════════════════════════════════════════════════════ */}
          {isSalaryFlow && step === 5 && lastTransaction && (
            <div className="flex flex-col items-center py-6 text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle size={40} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Payment Successful!</h3>
                <p className="text-slate-500 text-sm mt-1">Salary has been paid and ledger updated.</p>
              </div>

              {/* Ref number */}
              <div className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="font-mono font-bold text-blue-700 text-xs">{lastTransaction.refNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-black text-emerald-700">{formatCurrency(lastTransaction.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Type:</span>
                  <span className="font-semibold text-slate-700">{lastTransaction.transactionType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Employee:</span>
                  <span className="font-semibold text-slate-700">{selectedEmployee?.name}</span>
                </div>
                {payrollSummary && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">Updated Payroll Status</p>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                        Paid: {formatCurrency(payrollSummary.paidAmount)}
                      </span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">
                        Remaining: {formatCurrency(payrollSummary.remainingAmount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  type="button"
                  onClick={() => {
                    dispatch(clearSalaryState());
                    dispatch(clearPayrollSummary());
                    setStep(1);
                    setIsSalaryFlow(false);
                    setSelectedEmployee(null);
                    setPayAmount('');
                    setPayNotes('');
                  }}
                  className="py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  + Add Another Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (selectedEmployee) navigate(`/admin/salary/${selectedEmployee.employeeId}`);
                  }}
                  className="py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                >
                  View Salary History ↗
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              NORMAL FLOW — Step 2: Amount & Payment Method
          ════════════════════════════════════════════════════════════ */}
          {!isSalaryFlow && step === 2 && (
            <form onSubmit={handleNormalSubmit} id="normalExpenseForm" className="space-y-6">
              <h3 className="font-bold text-slate-800">Enter Amount & Payment Method</h3>

              {/* Custom category name input — only shown for "Other Expense" */}
              {formData.category === 'other-expense' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expense Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    placeholder="E.g. Office Supplies, Packaging, etc."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    autoFocus
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input
                    type="number" value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00" min="0" step="0.01"
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-2xl font-bold"
                    autoFocus={formData.category !== 'other-expense'} required disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button type="button" key={method.value}
                      onClick={() => setFormData({ ...formData, paymentMethod: method.value })}
                      disabled={loading}
                      className={`p-4 rounded-xl border-2 transition-all ${formData.paymentMethod === method.value ? `border-${method.color}-500 bg-${method.color}-50` : 'border-slate-200 hover:border-red-200'}`}
                    >
                      <span className="text-2xl block mb-1">{method.icon}</span>
                      <span className="font-medium">{method.label}</span>
                      <span className={`text-xs block mt-1 ${method.accountType === 'hand-cash' ? 'text-orange-600' : 'text-blue-600'}`}>
                        {method.accountType === 'hand-cash' ? 'Hand Cash' : 'Bank'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                {formData.paymentMethod === 'cash' ? <Wallet size={18} className="text-orange-600" /> : <Landmark size={18} className="text-blue-600" />}
                <span className="text-sm text-slate-600">
                  Deducted from: <strong className="text-blue-600">{formData.paymentMethod === 'cash' ? 'Hand Cash' : 'Bank Account'}</strong>
                </span>
              </div>
            </form>
          )}

          {/* ════════════════════════════════════════════════════════════
              NORMAL FLOW — Step 3: Additional Details
          ════════════════════════════════════════════════════════════ */}
          {!isSalaryFlow && step === 3 && (
            <form onSubmit={handleNormalSubmit} id="normalExpenseForm" className="space-y-5">
              <h3 className="font-bold text-slate-800">Additional Details</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Transaction Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="date" value={formData.transactionDate}
                    onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    disabled={loading}
                  />
                </div>
              </div>
              {formData.paymentMethod !== 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reference Number</label>
                  <input
                    type="text" value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    placeholder="UPI ID / Transaction ID"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    disabled={loading}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description / Notes</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3} placeholder="Add any details..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  disabled={loading}
                />
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <h4 className="font-medium text-red-800 mb-2">Summary</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-700">Category:</span>
                    <span className="font-medium">{EXPENSE_CATEGORIES.find((c) => c.value === formData.category)?.label || formData.customCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Amount:</span>
                    <span className="font-bold text-red-600">₹{parseFloat(formData.amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Account:</span>
                    <span className={`font-medium ${formData.paymentMethod === 'cash' ? 'text-orange-600' : 'text-blue-600'}`}>
                      {formData.paymentMethod === 'cash' ? 'Hand Cash' : 'Bank Account'}
                    </span>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* ── Footer navigation ──────────────────────────────────────── */}
        {step !== 5 && (
          <div className="flex-shrink-0 px-6 pb-6 pt-2 flex gap-3 border-t border-slate-100">
            {/* Back button */}
            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  if (isSalaryFlow && step === 2) { setStep(1); setIsSalaryFlow(false); }
                  else setStep(step - 1);
                }}
                disabled={payLoading || loading}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ChevronLeft size={18} /> Back
              </button>
            )}

            {/* Primary action */}
            {isSalaryFlow ? (
              <>
                {step === 2 && (
                  <button type="button" onClick={handleSalaryStep2Next}
                    disabled={!selectedEmployee}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    View Payroll Summary →
                  </button>
                )}
                {step === 3 && (
                  <button type="button" onClick={handleSalaryStep3Next}
                    disabled={!payrollSummary || summaryLoading || (payrollSummary?.isLocked && payrollSummary?.remainingAmount <= 0)}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    Enter Payment →
                  </button>
                )}
                {step === 4 && (
                  <button type="button" onClick={handleSalaryPay}
                    disabled={payLoading || !payAmount || parseFloat(payAmount) < 1}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {payLoading ? (
                      <><RefreshCw size={18} className="animate-spin" /> Processing...</>
                    ) : (
                      <>✓ Pay {payAmount ? formatCurrency(parseFloat(payAmount)) : ''}</>
                    )}
                  </button>
                )}
              </>
            ) : (
              <>
                {step === 2 && (
                  <button type="button" onClick={() => setStep(3)}
                    disabled={!formData.amount || loading}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    Continue
                  </button>
                )}
                {step === 3 && (
                  <button type="submit" form="normalExpenseForm"
                    disabled={loading}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <><RefreshCw size={18} className="animate-spin" /> Adding...</> : 'Add Expense'}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}