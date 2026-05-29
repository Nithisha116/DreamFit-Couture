import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { X, Plus, Trash2, Save } from "lucide-react";
import { createCustomerProfile, updateCustomerProfile } from "../../features/customerSize/customerSizeSlice";
import showToast from "../../utils/toast";

const GARMENT_TYPES = [
  { id: "shirt", label: "Shirt", defaults: ["Chest", "Shoulder", "Sleeve Length", "Shirt Length", "Neck"] },
  { id: "trouser", label: "Trouser/Pant", defaults: ["Waist", "Hip", "Inseam", "Outseam", "Thigh", "Bottom/Hem"] },
  { id: "kurta", label: "Kurta", defaults: ["Chest", "Shoulder", "Sleeve Length", "Kurta Length", "Neck", "Hip"] },
  { id: "blouse", label: "Blouse", defaults: ["Bust", "Under Bust", "Shoulder", "Sleeve Length", "Arm Hole", "Front Neck Depth", "Back Neck Depth"] },
  { id: "saree", label: "Saree Fall/Pico", defaults: ["Saree Length"] },
  { id: "general", label: "General", defaults: ["Chest", "Waist", "Hip", "Length"] }
];

export default function CustomerSizeModal({ isOpen, onClose, profileToEdit, customerId }) {
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    profileName: "",
    garmentType: "general",
    notes: ""
  });

  const [measurements, setMeasurements] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (profileToEdit) {
        setFormData({
          profileName: profileToEdit.profileName || "",
          garmentType: profileToEdit.garmentType || "general",
          notes: profileToEdit.notes || ""
        });
        setMeasurements(
          (profileToEdit.measurements || []).map(m => ({
            fieldName: m.fieldDisplayName || m.fieldName,
            value: m.value,
            unit: m.unit || "inch",
            id: Math.random().toString(36).substr(2, 9)
          }))
        );
      } else {
        // Defaults for new profile
        handleGarmentTypeChange("shirt");
        setFormData(prev => ({ ...prev, notes: "", profileName: "" }));
      }
    }
  }, [isOpen, profileToEdit]);

  const handleGarmentTypeChange = (type) => {
    const garment = GARMENT_TYPES.find(g => g.id === type) || GARMENT_TYPES[5];
    setFormData(prev => ({ 
      ...prev, 
      garmentType: type,
      profileName: prev.profileName || `${garment.label} Profile`
    }));
    
    // Only pre-fill defaults if not editing
    if (!profileToEdit) {
      setMeasurements(
        garment.defaults.map(field => ({
          fieldName: field,
          value: "",
          unit: "inch",
          id: Math.random().toString(36).substr(2, 9)
        }))
      );
    }
  };

  const handleAddField = () => {
    setMeasurements([
      ...measurements,
      { fieldName: "", value: "", unit: "inch", id: Math.random().toString(36).substr(2, 9) }
    ]);
  };

  const handleRemoveField = (idToRemove) => {
    setMeasurements(measurements.filter(m => m.id !== idToRemove));
  };

  const handleFieldChange = (id, field, value) => {
    setMeasurements(measurements.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.profileName.trim()) {
      return showToast.error("Profile Name is required");
    }
    
    const validMeasurements = measurements.filter(m => m.fieldName.trim() !== "" && m.value !== "");
    if (validMeasurements.length === 0) {
      return showToast.error("Please add at least one measurement with a value");
    }

    setIsSubmitting(true);
    
    const payload = {
      customerId,
      profileName: formData.profileName,
      garmentType: formData.garmentType,
      notes: formData.notes,
      measurements: validMeasurements.map(m => ({
        fieldName: m.fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        fieldDisplayName: m.fieldName,
        value: parseFloat(m.value),
        unit: m.unit
      }))
    };

    try {
      if (profileToEdit) {
        await dispatch(updateCustomerProfile({
          id: profileToEdit._id,
          measurements: payload.measurements,
          notes: payload.notes
        })).unwrap();
        showToast.success("Profile updated successfully");
      } else {
        await dispatch(createCustomerProfile(payload)).unwrap();
        showToast.success("Profile created successfully");
      }
      onClose();
    } catch (error) {
      showToast.error(error || "Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            {profileToEdit ? "Edit Measurement Profile" : "New Measurement Profile"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="size-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Garment Type</label>
                <select
                  disabled={!!profileToEdit} // Can't change type when editing
                  value={formData.garmentType}
                  onChange={(e) => handleGarmentTypeChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium text-slate-700 disabled:opacity-50"
                >
                  {GARMENT_TYPES.map(g => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Profile Name</label>
                <input
                  type="text"
                  value={formData.profileName}
                  onChange={(e) => setFormData({...formData, profileName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium text-slate-700"
                  placeholder="e.g. Summer Shirt Size"
                />
              </div>
            </div>

            {/* Measurements Grid */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-700 text-sm uppercase">Measurements</h3>
                <button 
                  type="button" 
                  onClick={handleAddField}
                  className="text-xs font-bold text-purple-600 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Add Custom Field
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {measurements.map((m, index) => (
                  <div key={m.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 relative group">
                    <button 
                      type="button"
                      onClick={() => handleRemoveField(m.id)}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                    >
                      <X size={12} />
                    </button>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Part / Field Name</label>
                      <input
                        type="text"
                        value={m.fieldName}
                        onChange={(e) => handleFieldChange(m.id, 'fieldName', e.target.value)}
                        placeholder="e.g. Chest"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Value</label>
                        <input
                          type="number"
                          step="0.25"
                          value={m.value}
                          onChange={(e) => handleFieldChange(m.id, 'value', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div className="w-16">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Unit</label>
                        <select
                          value={m.unit}
                          onChange={(e) => handleFieldChange(m.id, 'unit', e.target.value)}
                          className="w-full px-1 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none focus:border-purple-400"
                        >
                          <option value="inch">in</option>
                          <option value="cm">cm</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Tailoring Notes / Adjustments</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium text-slate-700 min-h-[80px]"
                placeholder="e.g. Prefers a tighter fit around the waist, slope shoulders"
              />
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="size-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save size={18} />
            )}
            {profileToEdit ? "Update Profile" : "Save Profile"}
          </button>
        </div>
        
      </div>
    </div>
  );
}
