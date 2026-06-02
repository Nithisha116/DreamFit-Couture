import React from 'react';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function StageActionModal({
  isOpen,
  mode = 'confirm', // 'confirm' | 'success'
  onClose,
  onConfirm,
  isUpdating,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {mode === 'confirm' && (
          <div className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Stage Completion</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to mark this stage as completed? This action will move the workflow to the next stage and update all connected modules.
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirm}
                disabled={isUpdating}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Yes, Complete Stage'
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isUpdating}
                className="w-full py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {mode === 'success' && (
          <div className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Stage Completed</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              The stage has been completed successfully and the workflow has been updated.
            </p>
            
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
