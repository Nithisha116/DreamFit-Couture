import React, { useState, useEffect, useRef } from 'react';
import { XCircle, X, AlertTriangle } from 'lucide-react';

const CANCEL_REASONS = [
  'Customer requested cancellation',
  'Payment issue',
  'Material unavailable',
  'Duplicate order',
  'Order placed by mistake',
];

export default function CancelOrderModal({ isOpen, orderId, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setCustomReason('');
      setError('');
    }
  }, [isOpen]);

  // Focus custom input when "Other" is selected
  useEffect(() => {
    if (reason === '__custom' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [reason]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const finalReason = reason === '__custom' ? customReason.trim() : reason;
    if (!finalReason) {
      setError('Please select or enter a cancellation reason.');
      return;
    }
    setError('');
    onConfirm(finalReason);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          animation: 'cancelModalIn 0.22s ease-out',
        }}
      >
        <style>{`
          @keyframes cancelModalIn {
            from { opacity:0; transform: scale(0.95) translateY(8px); }
            to   { opacity:1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: '1px solid #fee2e2',
          background: '#fef2f2', borderRadius: '16px 16px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: '#fecaca',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={20} color="#dc2626" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#991b1b' }}>Cancel Order</div>
              <div style={{ fontSize: 12, color: '#b91c1c' }}>{orderId || ''}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca',
              background: '#fff', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#dc2626',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px' }}>
          <p style={{ fontSize: 13, color: '#4b5563', marginTop: 0, marginBottom: 16, lineHeight: 1.5 }}>
            This will mark the order as <strong style={{ color: '#dc2626' }}>cancelled</strong>.
            Existing payment records will be preserved. Please provide a reason for the cancellation.
          </p>

          {/* Pre-defined reasons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            {CANCEL_REASONS.map((r) => (
              <label
                key={r}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${reason === r ? '#2563eb' : '#e5e7eb'}`,
                  background: reason === r ? '#eff6ff' : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio" name="cancelReason" value={r}
                  checked={reason === r}
                  onChange={() => { setReason(r); setError(''); }}
                  style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                />
                <span style={{ fontSize: 13, fontWeight: reason === r ? 600 : 400, color: '#111827' }}>{r}</span>
              </label>
            ))}

            {/* Custom / Other */}
            <label
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${reason === '__custom' ? '#2563eb' : '#e5e7eb'}`,
                background: reason === '__custom' ? '#eff6ff' : '#fff',
                transition: 'all 0.15s',
              }}
            >
              <input
                type="radio" name="cancelReason" value="__custom"
                checked={reason === '__custom'}
                onChange={() => { setReason('__custom'); setError(''); }}
                style={{ accentColor: '#2563eb', width: 16, height: 16, marginTop: 2 }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: reason === '__custom' ? 600 : 400, color: '#111827' }}>Other reason</span>
                {reason === '__custom' && (
                  <textarea
                    ref={inputRef}
                    value={customReason}
                    onChange={(e) => { setCustomReason(e.target.value); setError(''); }}
                    placeholder="Describe the reason…"
                    rows={2}
                    style={{
                      display: 'block', width: '100%', marginTop: 8, padding: '8px 12px',
                      border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13,
                      resize: 'vertical', fontFamily: 'inherit', outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                )}
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600,
              padding: '8px 12px', borderRadius: 8, marginTop: 4,
            }}>
              <XCircle size={14} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '14px 22px', borderTop: '1px solid #f3f4f6',
          background: '#fafafa', borderRadius: '0 0 16px 16px',
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '9px 18px', borderRadius: 9, border: '1px solid #d1d5db',
              background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Keep Order
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '9px 22px', borderRadius: 9, border: 'none',
              background: loading ? '#fca5a5' : '#dc2626', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#b91c1c'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#dc2626'; }}
          >
            {loading && (
              <div style={{
                width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite',
              }} />
            )}
            {loading ? 'Cancelling…' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
}
