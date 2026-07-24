import React from 'react';
import { FileEdit, Trash2, Copy, Play } from 'lucide-react';

const TH = ({ children }) => (
  <th style={{
    textAlign: 'left', padding: '11px 16px', fontSize: 11, fontWeight: 700,
    color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em',
    borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap',
  }}>{children}</th>
);

const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

function ProgressBar({ percent = 0 }) {
  const pct = Math.max(0, Math.min(100, percent));
  const color = pct >= 80 ? '#16a34a' : pct >= 40 ? '#d97706' : '#9ca3af';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
      <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.3s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#4b5563', minWidth: 32 }}>{pct}%</span>
    </div>
  );
}

export default function DraftOrdersTable({ drafts, deleteLoading, onResume, onDelete, onDuplicate, onClearSearch, hasActiveFilters }) {
  if (!drafts?.length) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 40px', color: '#4b5563', background: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: '#f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
          color: '#9ca3af', border: '1px dashed #d1d5db',
        }}>
          <FileEdit size={30} style={{ opacity: 0.6 }} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>No draft orders</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px 0', maxWidth: 360, lineHeight: 1.5 }}>
          In-progress orders you start creating are saved here automatically, so nothing is lost if you navigate away.
        </p>
        {hasActiveFilters && onClearSearch && (
          <button onClick={onClearSearch} style={{
            padding: '9px 18px', borderRadius: 8, background: '#2563eb', color: '#fff',
            fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
          }}>
            Clear Search
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <TH>Customer</TH>
            <TH>Last Edited</TH>
            <TH>Progress</TH>
            <TH>Actions</TH>
          </tr>
        </thead>
        <tbody>
          {drafts.map((draft) => {
            const isDeleting = !!deleteLoading?.[draft._id];
            const displayName = draft.customer?.name || draft.draftMeta?.customerDisplayName || 'Untitled Draft';
            return (
              <tr key={draft._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#111827' }}>
                  {displayName}
                  {draft.customer?.customerId && (
                    <div style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>{draft.customer.customerId}</div>
                  )}
                </td>
                <td style={{ padding: '13px 16px', fontSize: 13, color: '#4b5563' }}>{timeAgo(draft.updatedAt)}</td>
                <td style={{ padding: '13px 16px' }}>
                  <ProgressBar percent={draft.draftMeta?.progressPercent || 0} />
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => onResume(draft._id)}
                      title="Resume"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                        background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 7,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <Play size={13} /> Resume
                    </button>
                    <button
                      onClick={() => onDuplicate(draft._id)}
                      title="Duplicate draft"
                      style={{
                        width: 30, height: 30, borderRadius: 7, border: '1px solid #e5e7eb',
                        background: '#fff', color: '#6b7280', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(draft._id, displayName)}
                      disabled={isDeleting}
                      title="Delete draft"
                      style={{
                        width: 30, height: 30, borderRadius: 7, border: '1px solid #fecaca',
                        background: '#fff', color: '#dc2626', cursor: isDeleting ? 'not-allowed' : 'pointer',
                        opacity: isDeleting ? 0.5 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
