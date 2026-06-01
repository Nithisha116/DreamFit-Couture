import React from "react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import {
  PackageCheck,
  ArrowRight,
  Clock,
  AlertTriangle,
  IndianRupee
} from "lucide-react";

// Urgency helper tailored for delivery items
function getDeliveryUrgency(order) {
  if (['delivered', 'cancelled'].includes(order.status)) return null;
  const today = new Date(); 
  today.setHours(0, 0, 0, 0);
  const due = order.deliveryDate ? new Date(order.deliveryDate) : null;
  
  if (!due) return null;
  due.setHours(0, 0, 0, 0);
  
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  
  if (diff < 0) return { type: 'overdue', label: `${Math.abs(diff)}d Overdue`, color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' };
  if (diff === 0) return { type: 'today', label: 'Due Today', color: '#d97706', bg: '#fffbeb', border: '#fcd34d' };
  if (diff === 1) return { type: 'tomorrow', label: 'Due Tomorrow', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  if (diff <= 3) return { type: 'rush', label: `In ${diff} days`, color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' };
  
  return { type: 'normal', label: `In ${diff} days`, color: '#16a34a', bg: '#f0fdf4', border: '#86efac' };
}

// Payment helper
function getPaymentStatus(order) {
  const status = order.paymentSummary?.paymentStatus || 'pending';
  const paid = order.paymentSummary?.totalPaid || 0;
  const total = order.finalizedAmount > 0 ? order.finalizedAmount : (order.priceSummary?.totalMax || 0);
  
  if (status === 'paid' || status === 'fully_paid') {
    return { label: 'Paid', color: '#15803d', bg: '#dcfce3', border: '#bbf7d0' };
  } else if (status === 'partial') {
    return { label: `Partial (₹${paid})`, color: '#b45309', bg: '#fef3c7', border: '#fde68a' };
  } else {
    return { label: 'Pending Payment', color: '#b91c1c', bg: '#fee2e2', border: '#fecaca' };
  }
}

function ReadyCard({ order, basePath }) {
  const navigate = useNavigate();
  const targetUrl = `${basePath}/orders/${order._id}`;
  
  const customer = order.customer || {};
  const garments = order.garments || [];
  
  const deliveryLabel = order.deliveryDate
    ? format(new Date(order.deliveryDate), "dd MMM yyyy")
    : "—";
    
  const urgency = getDeliveryUrgency(order);
  const payment = getPaymentStatus(order);
  
  // Format garment names for display
  const productNames = garments.length > 0 
    ? garments.map(g => g.name || g.item?.name || 'Garment').join(', ')
    : 'Unknown Garment';

  return (
    <div 
      onClick={() => navigate(targetUrl)}
      className="group cursor-pointer rounded-xl border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50/80 p-4 shadow-sm transition-all duration-300 hover:border-emerald-100 hover:shadow-md"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          {/* Top Row: Order ID & Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={targetUrl}
              className="font-mono text-xs font-bold text-emerald-700 hover:text-emerald-900 sm:text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              #{order.orderId || 'Unknown'}
            </Link>
            
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
              <PackageCheck className="h-3 w-3" />
              Ready to Deliver
            </span>
            
            {urgency && (
              <span 
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1"
                style={{ backgroundColor: urgency.bg, color: urgency.color, borderColor: urgency.border }}
              >
                {urgency.type === 'overdue' ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {urgency.label}
              </span>
            )}
          </div>

          {/* Middle Row: Product & Customer info */}
          <div>
            <h3 className="truncate text-sm font-bold text-slate-800 sm:text-base" title={productNames}>
              {productNames}
            </h3>
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{customer.name || 'Unknown Customer'}</span>
              {customer.customerId && <span className="ml-1 text-slate-400">({customer.customerId})</span>}
              <span className="mx-1.5 text-slate-300">·</span>
              <span>Due: {deliveryLabel}</span>
            </p>
          </div>

          {/* Bottom Row: Garments count & Payment Status */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
            <span className="rounded-lg bg-slate-50 px-2 py-1 font-semibold text-slate-600 ring-1 ring-slate-200">
              {garments.length} {garments.length === 1 ? 'Garment' : 'Garments'}
            </span>
            
            <span 
              className="rounded-lg px-2 py-1 font-semibold ring-1 flex items-center gap-1"
              style={{ backgroundColor: payment.bg, color: payment.color, borderColor: payment.border }}
            >
              <IndianRupee className="h-3 w-3" />
              {payment.label}
            </span>
          </div>
        </div>

        {/* Action Button (Visible on Hover/Large screens) */}
        <Link
          to={targetUrl}
          onClick={(e) => e.stopPropagation()}
          className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100 lg:inline-flex"
        >
          View Order <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function ReadyToDeliverSection({
  orders = [],
  loading = false,
  basePath = "/admin"
}) {
  // Sort orders: overdue first, then by delivery date closest to today
  const sortedOrders = [...orders].sort((a, b) => {
    if (!a.deliveryDate) return 1;
    if (!b.deliveryDate) return -1;
    return new Date(a.deliveryDate) - new Date(b.deliveryDate);
  });
  
  const overdueCount = sortedOrders.filter(o => {
    const urgency = getDeliveryUrgency(o);
    return urgency && urgency.type === 'overdue';
  }).length;

  return (
    <div className="mb-6 lg:mb-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-800 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm">
                <PackageCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight text-white sm:text-lg">
                  Ready to Deliver
                </h2>
                <p className="mt-0.5 text-xs text-emerald-100/90 sm:text-sm">
                  Orders completed and waiting for customer pickup
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
                {orders.length} ready
              </span>
              {overdueCount > 0 && (
                <span className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white shadow-sm">
                  {overdueCount} overdue
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 lg:p-6 bg-slate-50/30">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-12">
               <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-600"></div>
               <p className="mt-3 text-sm font-medium text-slate-500">Loading ready orders...</p>
             </div>
          ) : sortedOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 transition-colors">
              {sortedOrders.map((order) => (
                <ReadyCard key={order._id} order={order} basePath={basePath} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-200/60 bg-emerald-50/30 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/50 mb-4">
                <PackageCheck className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-base font-bold text-slate-700">No Orders Ready to Deliver</p>
              <p className="mt-1.5 max-w-sm text-sm text-slate-500">
                When orders finish production and are marked "Ready to Deliver", they will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
