import React, { useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Loader2, ArrowRight, X } from 'lucide-react';

/**
 * StageActionModal — Confirmation / success dialog for workflow stage actions.
 *
 * Props:
 *   isOpen       – boolean
 *   mode         – 'confirm' | 'success'
 *   onClose      – () => void
 *   onConfirm    – () => void  (confirm mode only)
 *   isUpdating   – boolean      (disable buttons + show spinner)
 *   stageContext  – optional contextual data for richer UI:
 *     {
 *       jobName:           string,      // e.g. "Surya - Alterations"
 *       workCode:          string,      // e.g. "14082026-6888.06"
 *       currentStageLabel: string,      // e.g. "Stitching"
 *       nextStageLabel:    string|null, // e.g. "Delivered" or null (last stage)
 *     }
 */
export default function StageActionModal({
  isOpen,
  mode = 'confirm',
  onClose,
  onConfirm,
  isUpdating,
  stageContext,
}) {
  // ── Escape key ────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && isOpen && !isUpdating) {
        onClose();
      }
    },
    [isOpen, isUpdating, onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Lock body scroll ──────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const stageName = stageContext?.currentStageLabel || 'this';
  const nextStage = stageContext?.nextStageLabel || null;

  // ── Backdrop click ────────────────────────────────────
  const handleBackdropClick = () => {
    if (!isUpdating) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={
        mode === 'confirm'
          ? `Confirm completing ${stageName} stage`
          : 'Stage completed'
      }
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
        style={{ animation: 'stageModalFadeIn 0.2s ease-out' }}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'stageModalSlideIn 0.22s ease-out' }}
      >

        {mode === 'confirm' && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-0">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    Complete {stageName} stage?
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                    This will move the job to the next stage.
                  </p>
                </div>
              </div>
              {!isUpdating && (
                <button
                  onClick={onClose}
                  className="p-1.5 -mt-1 -mr-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Context info block */}
            {stageContext && (
              <div className="mx-6 mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3.5 space-y-2">
                {stageContext.jobName && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Job</span>
                    <span className="text-slate-800 font-semibold truncate ml-3 max-w-[200px]">{stageContext.jobName}</span>
                  </div>
                )}
                {stageContext.workCode && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Work ID</span>
                    <span className="text-slate-700 font-mono text-xs">{stageContext.workCode}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Current stage</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 text-violet-700 px-2.5 py-0.5 text-xs font-bold">
                    {stageName}
                  </span>
                </div>
                {nextStage && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Next stage</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                      <ArrowRight className="w-3 h-3 text-emerald-500" />
                      {nextStage}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="px-6 pt-5 pb-6 flex flex-col gap-2.5">
              <button
                onClick={onConfirm}
                disabled={isUpdating}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-violet-200"
                aria-busy={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing stage…
                  </>
                ) : (
                  'Complete stage'
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isUpdating}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Cancel
              </button>
            </div>
          </>
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

      {/* Animations */}
      <style>{`
        @keyframes stageModalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes stageModalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
