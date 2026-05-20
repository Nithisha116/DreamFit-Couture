import React, { useState, useEffect } from "react";
import { X, Calendar, User, FileText, Info } from "lucide-react";
import toast from "react-hot-toast";

const LEAVE_TYPES = ["Sick", "Casual", "Paid", "Emergency", "Half Day"];

export default function LeaveModal({ isOpen, onClose, onSubmit, isSubmitting, employeeList }) {
  const [form, setForm] = useState({
    employeeName: "",
    employeeId: "",
    department: "",
    leaveType: "Casual",
    startDate: "",
    endDate: "",
    reason: "",
    attachment: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm({
        employeeName: "",
        employeeId: "",
        department: "",
        leaveType: "Casual",
        startDate: "",
        endDate: "",
        reason: "",
        attachment: null,
      });
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!form.employeeId) newErrors.employeeId = "Employee is required";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!form.endDate) newErrors.endDate = "End date is required";
    if (new Date(form.endDate) < new Date(form.startDate)) newErrors.endDate = "End date cannot be before start date";
    if (!form.reason) newErrors.reason = "Reason is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Auto-fill logic from employeeList
    if (name === "employeeName" && employeeList) {
      const selected = employeeList.find(emp => emp.employeeName === value);
      if (selected) {
        setForm(prev => ({
          ...prev,
          employeeId: selected.employeeId,
          department: selected.department || "General"
        }));
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-violet-600 to-indigo-600 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Apply for Leave</h2>
            <p className="text-indigo-100 text-xs mt-1">Submit a new leave request for approval.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Employee Selection */}
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User size={14} className="text-indigo-500" />
                Employee Name
              </label>
              <div className="relative">
                <input
                  list="employee-suggestions"
                  name="employeeName"
                  value={form.employeeName}
                  onChange={handleChange}
                  placeholder="Type or select employee..."
                  className={`w-full px-4 py-3 rounded-xl border ${errors.employeeId ? 'border-red-300' : 'border-slate-200'} bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-sm`}
                />
                <datalist id="employee-suggestions">
                  {employeeList?.map((emp, i) => (
                    <option key={i} value={emp.employeeName}>{emp.employeeId} • {emp.department}</option>
                  ))}
                </datalist>
                {errors.employeeId && <p className="text-xs text-red-500 mt-1">{errors.employeeId}</p>}
              </div>
            </div>

            {/* Leave Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Info size={14} className="text-indigo-500" />
                Leave Type
              </label>
              <select
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-sm"
              >
                {LEAVE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Department (Read only) */}
            <div className="space-y-2 opacity-70">
              <label className="text-sm font-semibold text-slate-700">Department</label>
              <input
                type="text"
                value={form.department || "No Department"}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-sm cursor-not-allowed"
              />
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Calendar size={14} className="text-indigo-500" />
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${errors.startDate ? 'border-red-300' : 'border-slate-200'} bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Calendar size={14} className="text-indigo-500" />
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${errors.endDate ? 'border-red-300' : 'border-slate-200'} bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm`}
              />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>

            {/* Reason */}
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText size={14} className="text-indigo-500" />
                Reason
              </label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Reason for leave..."
                rows="3"
                className={`w-full px-4 py-3 rounded-xl border ${errors.reason ? 'border-red-300' : 'border-slate-200'} bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-sm resize-none`}
              ></textarea>
              {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
