import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

const SPECIALIZATIONS = ["Stitching", "Embroidery", "Alteration", "Finishing", "Other"];

export default function VendorModal({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
  isSubmitting = false,
}) {
  const [form, setForm] = useState({
    vendorName: "",
    mobileNumber: "",
    email: "",
    workSpecialization: "Stitching",
    address: "",
    status: "Active",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setForm({
        vendorName: editData.vendorName || "",
        mobileNumber: editData.mobileNumber || "",
        email: editData.email || "",
        workSpecialization: editData.workSpecialization || "Stitching",
        address: editData.address || "",
        status: editData.status || "Active",
      });
    } else {
      setForm({
        vendorName: "",
        mobileNumber: "",
        email: "",
        workSpecialization: "Stitching",
        address: "",
        status: "Active",
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!form.vendorName?.trim()) newErrors.vendorName = "Vendor name is required";
    if (!form.mobileNumber?.trim()) newErrors.mobileNumber = "Mobile number is required";
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {editData ? "Edit Vendor" : "Add Vendor"}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"><span className="text-red-500 mr-0.5">*</span>Vendor Name</label>
            <input type="text" value={form.vendorName} onChange={(e) => handleChange("vendorName", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-300 transition-all" />
            {errors.vendorName && <p className="text-xs text-red-500 mt-1">{errors.vendorName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"><span className="text-red-500 mr-0.5">*</span>Mobile Number</label>
            <input type="text" value={form.mobileNumber} onChange={(e) => handleChange("mobileNumber", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-300 transition-all" />
            {errors.mobileNumber && <p className="text-xs text-red-500 mt-1">{errors.mobileNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-300 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Work Specialization</label>
            <select value={form.workSpecialization} onChange={(e) => handleChange("workSpecialization", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-300 transition-all">
              {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
            <textarea value={form.address} onChange={(e) => handleChange("address", e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-300 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => handleChange("status", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-300 transition-all">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-700 transition-all flex items-center gap-2">
              {isSubmitting && <Loader2 size={15} className="animate-spin" />} Submit
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
