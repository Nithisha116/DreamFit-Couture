import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import ImageUploader from "./ImageUploader";

const STATUS_OPTIONS = ["Given", "In Progress", "Completed", "Pending"];

export default function OutsourcingModal({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
  employees = [],
  isSubmitting = false,
}) {
  const [form, setForm] = useState({
    orderNumber: "",
    productName: "",
    employeeName: "",
    givenDate: "",
    expectedDate: "",
    status: "Given",
    referenceImage: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setForm({
        orderNumber: editData.orderNumber || "",
        productName: editData.productName || "",
        employeeName: editData.employeeName || "",
        givenDate: editData.givenDate
          ? new Date(editData.givenDate).toISOString().split("T")[0]
          : "",
        expectedDate: editData.expectedDate
          ? new Date(editData.expectedDate).toISOString().split("T")[0]
          : "",
        status: editData.status || "Given",
        referenceImage: editData.referenceImage || "",
        notes: editData.notes || "",
      });
    } else {
      setForm({
        orderNumber: "",
        productName: "",
        employeeName: "",
        givenDate: "",
        expectedDate: "",
        status: "Given",
        referenceImage: "",
        notes: "",
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!form.productName?.trim()) newErrors.productName = "Product name is required";
    if (!form.employeeName?.trim()) newErrors.employeeName = "Employee is required";
    if (!form.givenDate) newErrors.givenDate = "Given date is required";
    if (!form.expectedDate) newErrors.expectedDate = "Expected date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit && onSubmit(form);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[680px] mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {editData ? "Edit Outsourcing Employee" : "Add Outsourcing Employee"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
          {/* Row 1: Order Number + Product Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Order Number
              </label>
              <input
                type="number"
                value={form.orderNumber}
                onChange={(e) => handleChange("orderNumber", e.target.value)}
                placeholder="e.g. 1001"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <span className="text-red-500 mr-0.5">*</span>
                Product Name
              </label>
              <input
                type="text"
                value={form.productName}
                onChange={(e) => handleChange("productName", e.target.value)}
                placeholder="e.g. Bridal Lehenga"
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all ${
                  errors.productName ? "border-red-300" : "border-slate-200"
                }`}
              />
              {errors.productName && (
                <p className="text-xs text-red-500 mt-1">{errors.productName}</p>
              )}
            </div>
          </div>

          {/* Row 2: Employee + Given Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Outsourcing Employee */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <span className="text-red-500 mr-0.5">*</span>
                Outsourcing Employee
              </label>
              {employees.length > 0 ? (
                <select
                  value={form.employeeName}
                  onChange={(e) => handleChange("employeeName", e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all ${
                    errors.employeeName ? "border-red-300" : "border-slate-200"
                  }`}
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp} value={emp}>
                      {emp}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={form.employeeName}
                  onChange={(e) => handleChange("employeeName", e.target.value)}
                  placeholder="Enter employee name"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all ${
                    errors.employeeName ? "border-red-300" : "border-slate-200"
                  }`}
                />
              )}
              {errors.employeeName && (
                <p className="text-xs text-red-500 mt-1">{errors.employeeName}</p>
              )}
            </div>

            {/* Given Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <span className="text-red-500 mr-0.5">*</span>
                Given Date
              </label>
              <input
                type="date"
                value={form.givenDate}
                onChange={(e) => handleChange("givenDate", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all ${
                  errors.givenDate ? "border-red-300" : "border-slate-200"
                }`}
              />
              {errors.givenDate && (
                <p className="text-xs text-red-500 mt-1">{errors.givenDate}</p>
              )}
            </div>
          </div>

          {/* Row 3: Expected Date + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Expected Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <span className="text-red-500 mr-0.5">*</span>
                Expected Date
              </label>
              <input
                type="date"
                value={form.expectedDate}
                onChange={(e) => handleChange("expectedDate", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all ${
                  errors.expectedDate ? "border-red-300" : "border-slate-200"
                }`}
              />
              {errors.expectedDate && (
                <p className="text-xs text-red-500 mt-1">{errors.expectedDate}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reference Image */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Reference Image
            </label>
            <ImageUploader
              value={form.referenceImage}
              onChange={(val) => handleChange("referenceImage", val)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              placeholder="Add notes..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all resize-y"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
