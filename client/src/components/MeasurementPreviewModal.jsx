import React from "react";
import { X, Eye, Scissors, Ruler } from "lucide-react";

export default function MeasurementPreviewModal({ 
  isOpen, 
  onClose, 
  measurements, 
  templateName = "Measurement Preview" 
}) {
  if (!isOpen || !measurements) return null;

  const getMeasurementValue = (value) => {
    if (value === undefined || value === null) return "";
    return String(value).trim();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="flex items-center gap-2">
            <Ruler size={20} className="text-white" />
            <h3 className="text-lg font-black text-white">{templateName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Body - Only Measurements */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <p className="text-sm text-purple-600 font-medium flex items-center gap-2">
              <Scissors size={16} />
              Measurement Values
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(measurements).map(([key, value]) => {
                const displayValue = getMeasurementValue(value);
                if (displayValue === "") return null;
                
                return (
                  <div 
                    key={key} 
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-purple-300 transition-all"
                  >
                    <p className="text-xs text-slate-500 capitalize mb-1">{key}</p>
                    <p className="text-xl font-bold text-purple-700">
                      {displayValue} <span className="text-xs font-normal text-slate-400">inches</span>
                    </p>
                  </div>
                );
              })}
            </div>

            {Object.entries(measurements).filter(([_, v]) => getMeasurementValue(v) !== "").length === 0 && (
              <p className="text-center text-slate-400 py-8">No measurements found</p>
            )}
          </div>
        </div>

        {/* Footer - Close Button Only */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}