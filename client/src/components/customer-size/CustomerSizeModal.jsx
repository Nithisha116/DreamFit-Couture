import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Plus, Trash2, Save } from "lucide-react";
import { createCustomerProfile, updateCustomerProfile } from "../../features/customerSize/customerSizeSlice";
import { fetchAllTemplates } from "../../features/sizeTemplate/sizeTemplateSlice";
import { fetchAllSizeFields } from "../../features/sizeField/sizeFieldSlice";
import showToast from "../../utils/toast";

export default function CustomerSizeModal({ isOpen, onClose, profileToEdit, customerId }) {
  const dispatch = useDispatch();
  
  const { templates } = useSelector((state) => state.sizeTemplate);
  const { fields } = useSelector((state) => state.sizeField);

  const [formData, setFormData] = useState({
    profileName: "",
    garmentType: "",
    notes: ""
  });

  const [measurements, setMeasurements] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch initial data
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllTemplates({}));
      dispatch(fetchAllSizeFields());
    }
  }, [isOpen, dispatch]);

  // Initialize form when modal opens or templates load
  useEffect(() => {
    if (isOpen) {
      if (profileToEdit) {
        setFormData({
          profileName: profileToEdit.profileName || "",
          garmentType: profileToEdit.garmentType || "",
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
      } else if (templates && templates.length > 0 && !formData.garmentType) {
        // Defaults for new profile
        const firstTemplate = templates[0];
        handleGarmentTypeChange(firstTemplate._id, firstTemplate.name);
      }
    } else {
      // Clear form when closed
      if (!profileToEdit) {
         setFormData({ profileName: "", garmentType: "", notes: "" });
         setMeasurements([]);
      }
    }
  }, [isOpen, profileToEdit, templates]);

  const handleGarmentTypeChange = (templateId, templateName) => {
    const template = templates?.find(t => t._id === templateId);
    setFormData(prev => ({ 
      ...prev, 
      garmentType: templateId,
      profileName: prev.profileName || `${templateName || template?.name || 'New'} Profile`
    }));
    
    // Only pre-fill defaults if not editing
    if (!profileToEdit && template) {
      setMeasurements(
        (template.sizeFields || []).map(field => ({
          fieldName: field.displayName || field.name,
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
    if (!formData.garmentType) {
      return showToast.error("Garment Type is required");
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
        value: String(m.value),
        unit: m.unit
      }))
    };

    try {
      if (profileToEdit) {
        await dispatch(updateCustomerProfile({
          id: profileToEdit._id,
          profileName: payload.profileName,
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
                  onChange={(e) => {
                      const t = templates?.find(temp => temp._id === e.target.value);
                      handleGarmentTypeChange(e.target.value, t?.name);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium text-slate-700 disabled:opacity-50"
                >
                  <option value="" disabled>Select Garment Type</option>
                  {templates?.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
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
                  className="text-xs font-bold text-blue-600 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Add Measurement
                </button>
              </div>

              {/* Table Header like labels */}
              {measurements.length > 0 && (
                <div className="grid grid-cols-12 gap-2 sm:gap-3 mb-2 px-1">
                   <div className="col-span-5 text-[10px] font-bold text-slate-500 uppercase">Measurement Name</div>
                   <div className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">Value</div>
                   <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase">Unit</div>
                   <div className="col-span-1 text-center text-[10px] font-bold text-slate-500 uppercase">Action</div>
                </div>
              )}

              <div className="space-y-3">
                {measurements.map((m) => {
                  const getDisabledStatus = (fieldName) => {
                    return measurements.some(otherM => otherM.id !== m.id && otherM.fieldName === fieldName);
                  };

                  return (
                    <div key={m.id} className="grid grid-cols-12 gap-2 sm:gap-3 items-center group">
                      
                      {/* Measurement Name */}
                      <div className="col-span-5">
                        <select
                          value={m.fieldName}
                          onChange={(e) => handleFieldChange(m.id, 'fieldName', e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                          <option value="" disabled>Select Measurement</option>
                          {fields?.map(f => (
                            <option 
                              key={f._id} 
                              value={f.displayName}
                              disabled={getDisabledStatus(f.displayName)}
                            >
                              {f.displayName}
                            </option>
                          ))}
                          {/* Ensure legacy or custom names still show correctly if missing from fields */}
                          {!fields?.find(f => f.displayName === m.fieldName) && m.fieldName && (
                            <option value={m.fieldName}>{m.fieldName}</option>
                          )}
                        </select>
                      </div>
                      
                      {/* Value */}
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={m.value}
                          onChange={(e) => handleFieldChange(m.id, 'value', e.target.value)}
                          placeholder="Value"
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      
                      {/* Unit */}
                      <div className="col-span-2">
                        <select
                          value={m.unit}
                          onChange={(e) => handleFieldChange(m.id, 'unit', e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                          <option value="inch">inches</option>
                          <option value="cm">cm</option>
                        </select>
                      </div>

                      {/* Delete Button */}
                      <div className="col-span-1 flex justify-center">
                        <button 
                          type="button"
                          onClick={() => handleRemoveField(m.id)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          title="Delete Measurement"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                    </div>
                  );
                })}
                
                {measurements.length === 0 && (
                  <div className="text-center py-6 text-sm text-slate-500">
                    No measurements added. Click "Add Measurement" to start.
                  </div>
                )}
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
