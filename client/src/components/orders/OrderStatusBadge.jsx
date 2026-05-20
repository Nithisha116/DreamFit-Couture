import React from 'react';
import {
  Clock, CheckCircle, Scissors, Shirt, Star, Package,
  Truck, XCircle, AlertTriangle, Zap
} from 'lucide-react';

export const ORDER_STATUS_CONFIG = {
  draft:               { label: 'Draft',           icon: Clock,         color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db', text: '#374151' },
  confirmed:           { label: 'Confirmed',        icon: CheckCircle,   color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  'in-progress':       { label: 'In Progress',      icon: Scissors,      color: '#d97706', bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  cutting:             { label: 'Cutting',           icon: Scissors,      color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', text: '#5b21b6' },
  stitching:           { label: 'Stitching',         icon: Shirt,         color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', text: '#0e7490' },
  trial:               { label: 'Trial',             icon: Star,          color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8', text: '#9d174d' },
  finishing:           { label: 'Finishing',         icon: Package,       color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46' },
  'ready-to-delivery': { label: 'Ready',             icon: Package,       color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', text: '#5b21b6' },
  delivered:           { label: 'Delivered',         icon: Truck,         color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46' },
  cancelled:           { label: 'Cancelled',         icon: XCircle,       color: '#dc2626', bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
};

export const PAYMENT_STATUS_CONFIG = {
  pending:   { label: 'Pending',   bg: '#fef2f2', border: '#fecaca', text: '#991b1b', dot: '#ef4444' },
  partial:   { label: 'Partial',   bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', dot: '#f97316' },
  paid:      { label: 'Paid',      bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', dot: '#10b981' },
  overpaid:  { label: 'Overpaid',  bg: '#f5f3ff', border: '#ddd6fe', text: '#5b21b6', dot: '#7c3aed' },
  refunded:  { label: 'Refunded',  bg: '#f0f9ff', border: '#bae6fd', text: '#0c4a6e', dot: '#0ea5e9' },
};

export function OrderStatusBadge({ status, size = 'md' }) {
  const cfg = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  const iconSize = size === 'sm' ? 10 : 12;
  const px = size === 'sm' ? '6px 10px' : '5px 12px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: px, borderRadius: 20, fontSize, fontWeight: 600,
      background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap'
    }}>
      <Icon size={iconSize} color={cfg.color} />
      {cfg.label}
    </span>
  );
}

export function PaymentStatusBadge({ status, paymentCount, size = 'md' }) {
  const cfg = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.pending;
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20, fontSize, fontWeight: 600,
      background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap'
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
      {paymentCount > 0 && (
        <span style={{ opacity: 0.65, fontWeight: 400, fontSize: '10px' }}>
          · {paymentCount}
        </span>
      )}
    </span>
  );
}

export function DeliveryBadge({ deliveryDate }) {
  if (!deliveryDate) return <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deliveryDate);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));

  const fmt = due.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  if (diff < 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 12, color: '#6b7280' }}>{fmt}</span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        fontSize: 10, fontWeight: 700, color: '#dc2626',
        background: '#fef2f2', padding: '2px 7px', borderRadius: 10, border: '1px solid #fecaca'
      }}>
        <AlertTriangle size={9} /> Overdue
      </span>
    </div>
  );
  if (diff === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 12, color: '#6b7280' }}>{fmt}</span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        fontSize: 10, fontWeight: 700, color: '#dc2626',
        background: '#fef2f2', padding: '2px 7px', borderRadius: 10, border: '1px solid #fecaca'
      }}>
        <AlertTriangle size={9} /> Today
      </span>
    </div>
  );
  if (diff <= 3) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 12, color: '#6b7280' }}>{fmt}</span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        fontSize: 10, fontWeight: 700, color: '#92400e',
        background: '#fffbeb', padding: '2px 7px', borderRadius: 10, border: '1px solid #fde68a'
      }}>
        <Zap size={9} /> {diff}d left
      </span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{fmt}</span>
      <span style={{ fontSize: 11, color: '#6b7280' }}>{diff} days</span>
    </div>
  );
}
