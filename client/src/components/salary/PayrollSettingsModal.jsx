import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchPayrollConfig, 
  updatePayrollConfig 
} from "../../features/salary/salarySlice";
import { X, Save, Settings, Clock, Calendar, DollarSign, Percent, AlertCircle } from "lucide-react";
import showToast from "../../utils/toast";

export default function PayrollSettingsModal({ onClose }) {
  const dispatch = useDispatch();
  const { config, loading } = useSelector((state) => state.salary);
  
  const [formData, setFormData] = useState({
    workingDaysPerMonth: 26,
    overtimeRatePerHour: 100,
    latePenaltyAmount: 50,
    taxPercentage: 0,
    minimumOvertimeThreshold: 0.5,
    maxOvertimePerDay: 4,
    weeklyOffs: ["Sunday"]
  });

  useEffect(() => {
    dispatch(fetchPayrollConfig());
  }, [dispatch]);

  useEffect(() => {
    if (config) {
      setFormData({
        workingDaysPerMonth: config.workingDaysPerMonth || 26,
        overtimeRatePerHour: config.overtimeRatePerHour || 100,
        latePenaltyAmount: config.latePenaltyAmount || 50,
        taxPercentage: config.taxPercentage || 0,
        minimumOvertimeThreshold: config.minimumOvertimeThreshold || 0.5,
        maxOvertimePerDay: config.maxOvertimePerDay || 4,
        weeklyOffs: config.weeklyOffs || ["Sunday"]
      });
    }
  }, [config]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updatePayrollConfig(formData)).then((res) => {
      if (!res.error) {
        showToast.success("Payroll configuration updated! ⚙️");
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="text-blue-600" size={20} />
              PAYROLL CONFIGURATION
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Global salary & policy rules</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8">
          <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4">
            <AlertCircle className="text-blue-600 mt-1" size={20} />
            <p className="text-sm text-blue-700 font-medium leading-relaxed">
              These settings apply globally to all employees. Changes will affect future salary generations and any unlocked payroll records for the current period.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Working Days */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} className="text-blue-500" /> Standard Working Days
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={formData.workingDaysPerMonth}
                  onChange={(e) => setFormData({...formData, workingDaysPerMonth: Number(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="e.g. 26"
                  required
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Days / Month</span>
              </div>
            </div>

            {/* OT Rate */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} className="text-orange-500" /> Overtime Rate
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={formData.overtimeRatePerHour}
                  onChange={(e) => setFormData({...formData, overtimeRatePerHour: Number(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="e.g. 150"
                  required
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">₹ / Hour</span>
              </div>
            </div>

            {/* Late Penalty */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={14} className="text-red-500" /> Late Arrival Penalty
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={formData.latePenaltyAmount}
                  onChange={(e) => setFormData({...formData, latePenaltyAmount: Number(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="e.g. 50"
                  required
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">₹ / Event</span>
              </div>
            </div>

            {/* Tax TDS */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Percent size={14} className="text-indigo-500" /> Tax Deduction (TDS)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={formData.taxPercentage}
                  onChange={(e) => setFormData({...formData, taxPercentage: Number(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="e.g. 5"
                  required
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">% of Gross</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-3xl py-5 font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <Save size={20} />
              Save Global Policies
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
