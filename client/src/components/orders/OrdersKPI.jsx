import React, { useMemo } from 'react';
import { ShoppingBag, Clock, Scissors, Package, AlertTriangle, IndianRupee } from 'lucide-react';

function KPICard({ icon: Icon, label, value, color, bg, border, sub }) {
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${border}`,
      borderRadius: 14,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      flex: '1 1 150px',
      minWidth: 0,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: color, fontWeight: 600, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function OrdersKPI({ orders }) {
  const stats = useMemo(() => {
    if (!orders?.length) return { total: 0, pending: 0, inProgress: 0, ready: 0, overdue: 0, revenue: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let revenue = 0;

    const counts = orders.reduce((acc, o) => {
      const status = o.status || 'draft';
      if (status === 'draft' || status === 'confirmed') acc.pending++;
      if (['in-progress', 'cutting', 'stitching', 'trial', 'finishing'].includes(status)) acc.inProgress++;
      if (status === 'ready-to-delivery') acc.ready++;

      if (o.deliveryDate) {
        const due = new Date(o.deliveryDate);
        due.setHours(0, 0, 0, 0);
        if (due < today && !['delivered', 'cancelled'].includes(status)) acc.overdue++;
      }

      // sum revenue from paid orders
      const paid = o.paymentSummary?.totalPaid || 0;
      revenue += paid;

      return acc;
    }, { pending: 0, inProgress: 0, ready: 0, overdue: 0 });

    return { total: orders.length, revenue, ...counts };
  }, [orders]);

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
      <KPICard icon={ShoppingBag} label="Total Orders"    value={stats.total}               color="#2563eb" bg="#eff6ff" border="#dbeafe" />
      <KPICard icon={Clock}       label="Pending"          value={stats.pending}             color="#d97706" bg="#fffbeb" border="#fde68a" />
      <KPICard icon={Scissors}    label="In Production"    value={stats.inProgress}          color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" />
      <KPICard icon={Package}     label="Ready to Deliver" value={stats.ready}               color="#059669" bg="#ecfdf5" border="#a7f3d0" />
      <KPICard icon={AlertTriangle} label="Overdue"        value={stats.overdue}             color="#dc2626" bg="#fef2f2" border="#fecaca"
        sub={stats.overdue > 0 ? 'Needs attention' : undefined} />
      <KPICard icon={IndianRupee} label="Revenue Collected" value={fmt(stats.revenue)}       color="#0891b2" bg="#ecfeff" border="#a5f3fc" />
    </div>
  );
}
