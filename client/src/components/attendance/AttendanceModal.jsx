import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

const SHIFT_OPTIONS = ["Morning", "Evening", "Full Day", "Custom"];
const STATUS_OPTIONS = ["Present", "Absent", "Leave", "Half Day", "Late"];

export default function AttendanceModal({ isOpen, onClose, onSubmit, editData, isSubmitting, employeeList = [] }) {
  const [form, setForm] = useState({
    employeeName: "",
    employeeId: "",
    department: "",
    shift: "Full Day",
    status: "Present",
    attendanceDate: new Date().toISOString().split("T")[0],
    checkInTime: "",
    checkOutTime: "",
    overtimeHours: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setForm({
        employeeName: editData.employeeName || "",
        employeeId: editData.employeeId || "",
        department: editData.department || "",
        shift: editData.shift || "Full Day",
        status: editData.status === "Not Marked" ? "Present" : (editData.status || "Present"),
        attendanceDate: editData.attendanceDate ? new Date(editData.attendanceDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        checkInTime: editData.checkInTime || "",
        checkOutTime: editData.checkOutTime || "",
        overtimeHours: editData.overtimeHours || "",
        notes: editData.notes || "",
      });
    } else {
      setForm({
        employeeName: "",
        employeeId: "",
        department: "",
        shift: "Full Day",
        status: "Present",
        attendanceDate: new Date().toISOString().split("T")[0],
        checkInTime: "",
        checkOutTime: "",
        overtimeHours: "",
        notes: "",
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => {
      const newForm = { ...prev, [field]: value };
      
      // Auto-fill logic if they select a known employee name from the datalist
      if (field === "employeeName" && employeeList && employeeList.length > 0) {
        const foundEmp = employeeList.find(emp => emp.employeeName === value);
        if (foundEmp) {
          newForm.employeeId = foundEmp.employeeId;
          if (foundEmp.department) newForm.department = foundEmp.department;
        }
      }
      
      return newForm;
    });
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.employeeName.trim()) newErrors.employeeName = "Employee Name is required";
    if (!form.employeeId.trim()) newErrors.employeeId = "Employee ID is required";
    if (!form.attendanceDate) newErrors.attendanceDate = "Date is required";
    if (!form.status) newErrors.status = "Status is required";

    // Convert overtime to number if provided
    if (form.overtimeHours && isNaN(Number(form.overtimeHours))) {
      newErrors.overtimeHours = "Must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const dataToSubmit = {
        ...form,
        overtimeHours: form.overtimeHours ? Number(form.overtimeHours) : 0,
      };
      onSubmit(dataToSubmit);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {editData ? "Edit Attendance" : "Add Attendance"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {editData ? "Update existing attendance record" : "Log attendance for an employee"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="overflow-y-auto custom-scrollbar">
          <form id="attendance-form" onSubmit={handleSubmit} className="p-7 space-y-5">
            {/* Row 1: Employee Name | Employee ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <span className="text-red-500 mr-0.5">*</span>Employee Name
                </label>
                <input
                  type="text"
                  list="employee-names"
                  value={form.employeeName}
                  onChange={(e) => handleChange("employeeName", e.target.value)}
                  placeholder="e.g. John Doe"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all ${
                    errors.employeeName ? "border-red-300" : "border-slate-200"
                  }`}
                  autoComplete="off"
                />
                <datalist id="employee-names">
                  {employeeList && employeeList.map((emp, idx) => (
                    <option key={`${emp.employeeId}-${idx}`} value={emp.employeeName}>
                      {emp.employeeId} {emp.department ? `(${emp.department})` : ""}
                    </option>
                  ))}
                </datalist>
                {errors.employeeName && <p className="text-xs text-red-500 mt-1">{errors.employeeName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <span className="text-red-500 mr-0.5">*</span>Employee ID
                </label>
                <input
                  type="text"
                  value={form.employeeId}
                  onChange={(e) => handleChange("employeeId", e.target.value)}
                  placeholder="e.g. EMP-001"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all ${
                    errors.employeeId ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.employeeId && <p className="text-xs text-red-500 mt-1">{errors.employeeId}</p>}
              </div>
            </div>

            {/* Row 2: Department | Shift */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  placeholder="e.g. Tailoring"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Shift
                </label>
                <select
                  value={form.shift}
                  onChange={(e) => handleChange("shift", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all"
                >
                  {SHIFT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Status | Attendance Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <span className="text-red-500 mr-0.5">*</span>Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <span className="text-red-500 mr-0.5">*</span>Attendance Date
                </label>
                <input
                  type="date"
                  value={form.attendanceDate}
                  onChange={(e) => handleChange("attendanceDate", e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all ${
                    errors.attendanceDate ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.attendanceDate && <p className="text-xs text-red-500 mt-1">{errors.attendanceDate}</p>}
              </div>
            </div>

            {/* Row 4: Check In | Check Out */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Check In Time
                </label>
                <input
                  type="time"
                  value={form.checkInTime}
                  onChange={(e) => handleChange("checkInTime", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Check Out Time
                </label>
                <input
                  type="time"
                  value={form.checkOutTime}
                  onChange={(e) => handleChange("checkOutTime", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all"
                />
              </div>
            </div>

            {/* Row 5: Overtime | Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Overtime (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.overtimeHours}
                  onChange={(e) => handleChange("overtimeHours", e.target.value)}
                  placeholder="e.g. 2.5"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all ${
                    errors.overtimeHours ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.overtimeHours && <p className="text-xs text-red-500 mt-1">{errors.overtimeHours}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Any remarks..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="attendance-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {editData ? "Update Record" : "Save Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}
