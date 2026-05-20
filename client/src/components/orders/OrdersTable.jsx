import React, { useState, useRef, useEffect, memo } from 'react';
import { Eye, Edit, Trash2, MoreVertical, CheckCircle, Truck, MessageCircle, AlertTriangle, Clock } from 'lucide-react';
import { OrderStatusBadge, PaymentStatusBadge, DeliveryBadge } from './OrderStatusBadge';
import OrderProductImage from './OrderProductImage';

const fmt = (n) => n ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n) : '₹0';

// ─── Urgency helpers ──────────────────────────────────────────────────────────

function getDeliveryUrgency(order) {
  if (['delivered', 'cancelled'].includes(order.status)) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = order.deliveryDate ? new Date(order.deliveryDate) : null;
  if (!due) return null;
  due.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { type: 'overdue',   label: 'Overdue',      color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' };
  if (diff === 0) return { type: 'today',    label: 'Due Today',    color: '#d97706', bg: '#fffbeb', border: '#fcd34d' };
  if (diff === 1) return { type: 'tomorrow', label: 'Due Tomorrow', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  if (diff <= 3)  return { type: 'rush',     label: 'Rush',         color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' };
  return null;
}

// ─── PaymentProgressBar ───────────────────────────────────────────────────────

const PaymentProgressBar = memo(({ order }) => {
  const paid    = order.paymentSummary?.totalPaid || 0;
  const total   = order.priceSummary?.totalMax || 0;
  const pct     = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const status  = order.paymentSummary?.paymentStatus || 'pending';

  const barColor = status === 'paid' ? '#16a34a' : status === 'partial' ? '#d97706' : '#e5e7eb';

  return (
    <div style={{ width: '100%', maxWidth: 100 }}>
      <div style={{
        height: 4, background: '#f3f4f6', borderRadius: 99,
        overflow: 'hidden', marginTop: 4,
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: barColor,
          borderRadius: 99,
          transition: 'width 0.4s ease',
        }} />
      </div>
      {total > 0 && (
        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>
          {fmt(paid)} / {fmt(total)}
        </div>
      )}
    </div>
  );
});
PaymentProgressBar.displayName = 'PaymentProgressBar';

// ─── ActionMenu ───────────────────────────────────────────────────────────────

function ActionMenu({ order, canEdit, isAdmin, onView, onEdit, onDelete, onMarkDelivered, onMarkReady }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const Item = ({ icon: Icon, label, onClick, danger }) => (
    <button onClick={() => { onClick(); setOpen(false); }} style={{
      display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 14px',
      background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
      color: danger ? '#dc2626' : '#374151', textAlign: 'left',
      borderRadius: 6, transition: 'background 0.12s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? '#fef2f2' : '#f9fafb'}
    onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <Icon size={14} color={danger ? '#dc2626' : '#6b7280'} />
      {label}
    </button>
  );

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(p => !p)} style={{
        width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
        background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#6b7280', transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6b7280'; }}
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 36, zIndex: 200, background: '#fff',
          border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          minWidth: 180, padding: '4px',
        }}>
          <Item icon={Eye} label="View Details" onClick={() => onView(order._id)} />
          {canEdit && <Item icon={Edit} label="Edit Order" onClick={() => onEdit(order._id)} />}
          {canEdit && order.status === 'in-progress' && (
            <Item icon={CheckCircle} label="Mark Ready" onClick={() => onMarkReady(order._id, order.orderId)} />
          )}
          {canEdit && order.status === 'ready-to-delivery' && (
            <Item icon={Truck} label="Mark Delivered" onClick={() => onMarkDelivered(order._id, order.orderId)} />
          )}
          {order.customer?.phone && (
            <Item icon={MessageCircle} label="WhatsApp" onClick={() => window.open(`https://wa.me/91${order.customer.phone}`, '_blank')} />
          )}
          {isAdmin && <div style={{ borderTop: '1px solid #f3f4f6', margin: '4px 0' }} />}
          {isAdmin && <Item icon={Trash2} label="Delete" onClick={() => onDelete(order._id, order.orderId)} danger />}
        </div>
      )}
    </div>
  );
}

// ─── OrderRow ─────────────────────────────────────────────────────────────────

const OrderRow = memo(function OrderRow({ order, canEdit, isAdmin, isDeleting, onView, onEdit, onDelete, onMarkReady, onMarkDelivered }) {
  const customer = order.customer || {};
  const garments = order.garments || [];
  const payStatus = order.paymentSummary?.paymentStatus || 'pending';
  const payCount  = order.paymentSummary?.paymentCount || 0;
  const urgency   = getDeliveryUrgency(order);

  const rowBg     = urgency?.type === 'overdue'  ? '#fff8f8'
                  : urgency?.type === 'today'    ? '#fffbeb'
                  : urgency?.type === 'tomorrow' ? '#fffff5'
                  : '#fff';

  const leftBorder = urgency ? `3px solid ${urgency.border}` : '3px solid transparent';

  return (
    <tr
      style={{
        background: rowBg,
        borderBottom: '1px solid #f3f4f6',
        borderLeft: leftBorder,
        opacity: isDeleting ? 0.5 : 1,
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (!urgency) e.currentTarget.style.background = '#fafafa'; }}
      onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}
    >
      {/* Customer */}
      <td style={{ padding: '10px 14px', minWidth: 150 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 13,
          }}>
            {(customer.name || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>{customer.name || 'Unknown'}</div>
            <div style={{ fontSize: 10, color: '#9ca3af' }}>{customer.customerId || ''}</div>
          </div>
        </div>
      </td>

      {/* Product Image — NEW */}
      <td style={{ padding: '10px 14px', minWidth: 160 }}>
        <OrderProductImage garments={garments} orderId={order.orderId} size={52} />
      </td>

      {/* Order ID */}
      <td style={{ padding: '10px 14px' }}>
        <button onClick={() => onView(order._id)} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontSize: 13, fontWeight: 700, color: '#2563eb', fontFamily: 'monospace',
          textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'text-decoration 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.textDecorationColor = '#2563eb'}
        onMouseLeave={e => e.currentTarget.style.textDecorationColor = 'transparent'}
        >
          {order.orderId || '—'}
        </button>

        {/* Urgency indicator under order ID */}
        {urgency && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 3,
            background: urgency.bg, color: urgency.color, borderRadius: 20,
            padding: '2px 7px', fontSize: 10, fontWeight: 700, border: `1px solid ${urgency.border}`,
          }}>
            {urgency.type === 'overdue' ? <AlertTriangle size={9} /> : <Clock size={9} />}
            {urgency.label}
          </div>
        )}
      </td>

      {/* Garments count */}
      <td style={{ padding: '10px 14px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: '#eff6ff', color: '#1d4ed8', borderRadius: 20,
          padding: '3px 10px', fontSize: 12, fontWeight: 600,
        }}>
          {garments.length} item{garments.length !== 1 ? 's' : ''}
        </span>
      </td>

      {/* Payment */}
      <td style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PaymentStatusBadge status={payStatus} paymentCount={payCount} />
          <PaymentProgressBar order={order} />
        </div>
      </td>

      {/* Status */}
      <td style={{ padding: '10px 14px' }}>
        <OrderStatusBadge status={order.status} />
      </td>

      {/* Delivery */}
      <td style={{ padding: '10px 14px' }}>
        <DeliveryBadge deliveryDate={order.deliveryDate} />
      </td>

      {/* Actions */}
      <td style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => onView(order._id)} title="View"
            style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
          ><Eye size={14} /></button>

          {canEdit && (
            <button onClick={() => onEdit(order._id)} title="Edit"
              style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fffbeb'; e.currentTarget.style.color = '#d97706'; e.currentTarget.style.borderColor = '#fde68a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
            ><Edit size={14} /></button>
          )}

          <ActionMenu
            order={order} canEdit={canEdit} isAdmin={isAdmin}
            onView={onView} onEdit={onEdit} onDelete={onDelete}
            onMarkReady={onMarkReady} onMarkDelivered={onMarkDelivered}
          />
        </div>
      </td>
    </tr>
  );
});

// ─── Table Header ─────────────────────────────────────────────────────────────

const TH = ({ children, style }) => (
  <th style={{
    padding: '10px 14px', textAlign: 'left', fontSize: 11,
    fontWeight: 700, color: '#6b7280', textTransform: 'uppercase',
    letterSpacing: '0.06em', background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap', ...style
  }}>{children}</th>
);

// ─── OrdersTable (main export) ────────────────────────────────────────────────

export default function OrdersTable({ orders, canEdit, isAdmin, deleteLoading, onView, onEdit, onDelete, onMarkReady, onMarkDelivered }) {
  if (!orders?.length) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#6b7280' }}>No orders found</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters or create a new order</div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <TH>Customer</TH>
            <TH>Product</TH>
            <TH>Order ID</TH>
            <TH>Garments</TH>
            <TH>Payment</TH>
            <TH>Status</TH>
            <TH>Delivery</TH>
            <TH>Actions</TH>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <OrderRow
              key={order._id}
              order={order}
              canEdit={canEdit}
              isAdmin={isAdmin}
              isDeleting={!!deleteLoading[order._id]}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkReady={onMarkReady}
              onMarkDelivered={onMarkDelivered}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
