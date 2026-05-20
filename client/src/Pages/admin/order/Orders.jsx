import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ChevronLeft, ChevronRight, X, SlidersHorizontal, LayoutList, Columns } from "lucide-react";
import {
  fetchOrders,
  deleteExistingOrder,
  updateOrderStatusThunk,
  clearOrderError,
} from "../../../features/order/orderSlice";
import showToast from "../../../utils/toast";
import OrdersKPI from "../../../components/orders/OrdersKPI";
import OrderFilterTabs from "../../../components/orders/OrderFilterTabs";
import OrdersTable from "../../../components/orders/OrdersTable";

// ─── helpers ────────────────────────────────────────────────────────────────
const isOverdue = (order) => {
  if (!order.deliveryDate) return false;
  if (['delivered', 'cancelled'].includes(order.status)) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(order.deliveryDate); due.setHours(0, 0, 0, 0);
  return due < today;
};

// ─── Skeleton loader ─────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
      {[160, 110, 80, 120, 110, 100, 90].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div style={{ height: 14, width: w, background: '#f3f4f6', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ pagination, currentPage, onPageChange }) {
  const { pages = 1, total = 0, limit = 10 } = pagination || {};
  if (pages <= 1) return null;
  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  const PBtn = ({ children, onClick, active, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{
      minWidth: 32, height: 32, padding: '0 8px', borderRadius: 7,
      border: active ? 'none' : '1px solid #e5e7eb',
      background: active ? '#2563eb' : disabled ? '#f9fafb' : '#fff',
      color: active ? '#fff' : disabled ? '#d1d5db' : '#374151',
      fontSize: 13, fontWeight: active ? 700 : 500, cursor: disabled ? 'not-allowed' : 'pointer',
    }}>{children}</button>
  );

  const pageNums = [];
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(pages, currentPage + 2); i++) pageNums.push(i);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 8 }}>
      <span style={{ fontSize: 13, color: '#6b7280' }}>Showing <b>{start}–{end}</b> of <b>{total}</b> orders</span>
      <div style={{ display: 'flex', gap: 4 }}>
        <PBtn onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={14} /></PBtn>
        {currentPage > 3 && <><PBtn onClick={() => onPageChange(1)}>1</PBtn><span style={{ padding: '0 4px', color: '#9ca3af' }}>…</span></>}
        {pageNums.map(n => <PBtn key={n} active={n === currentPage} onClick={() => onPageChange(n)}>{n}</PBtn>)}
        {currentPage < pages - 2 && <><span style={{ padding: '0 4px', color: '#9ca3af' }}>…</span><PBtn onClick={() => onPageChange(pages)}>{pages}</PBtn></>}
        <PBtn onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === pages}><ChevronRight size={14} /></PBtn>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { orders, pagination, loading, error } = useSelector((state) => {
    const s = state.orders || state.order || {};
    return {
      orders:     s.orders     || s.items || [],
      pagination: s.pagination || { page: 1, pages: 1, total: 0, limit: 10 },
      loading:    s.loading    || false,
      error:      s.error      || null,
    };
  });

  const { user } = useSelector(s => ({ user: s.auth?.user }));
  const isAdmin     = user?.role === 'ADMIN';
  const isStoreKeeper = user?.role === 'STORE_KEEPER';
  const canEdit     = isAdmin || isStoreKeeper;

  const basePath = useMemo(() => {
    if (isAdmin) return '/admin';
    if (isStoreKeeper) return '/storekeeper';
    return '/cuttingmaster';
  }, [isAdmin, isStoreKeeper]);

  // ── state ──
  const [searchTerm, setSearchTerm]         = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab]           = useState('all');
  const [payFilter, setPayFilter]           = useState('all');
  const [timeFilter, setTimeFilter]         = useState('all');
  const [currentPage, setCurrentPage]       = useState(1);
  const [deleteLoading, setDeleteLoading]   = useState({});
  const [showFilters, setShowFilters]       = useState(false);

  // ── debounce search ──
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── fetch ──
  useEffect(() => {
    const statusParam = (activeTab === 'all' || activeTab === '__overdue') ? '' : activeTab;
    dispatch(fetchOrders({
      page: currentPage,
      limit: pagination?.limit || 10,
      search: debouncedSearch,
      status: statusParam,
      paymentStatus: payFilter !== 'all' ? payFilter : '',
      timeFilter,
    }));
  }, [dispatch, currentPage, debouncedSearch, activeTab, payFilter, timeFilter]);

  useEffect(() => () => dispatch(clearOrderError()), [dispatch]);

  // ── filter for __overdue tab (client-side) ──
  const displayedOrders = useMemo(() => {
    if (activeTab === '__overdue') return (orders || []).filter(isOverdue);
    return orders || [];
  }, [orders, activeTab]);

  // ── handlers ──
  const onView   = useCallback((id) => navigate(`${basePath}/orders/${id}`), [navigate, basePath]);
  const onEdit   = useCallback((id) => { if (canEdit) navigate(`${basePath}/orders/edit/${id}`); }, [canEdit, navigate, basePath]);

  const onDelete = useCallback(async (id, orderId) => {
    if (!canEdit) return showToast.error("No permission");
    if (!window.confirm(`Delete order ${orderId}?`)) return;
    setDeleteLoading(p => ({ ...p, [id]: true }));
    try {
      await dispatch(deleteExistingOrder(id)).unwrap();
      showToast.success("Order deleted");
    } catch (e) {
      showToast.error(e?.message || "Delete failed");
    } finally {
      setDeleteLoading(p => ({ ...p, [id]: false }));
    }
  }, [canEdit, dispatch]);

  const onMarkReady = useCallback(async (id, orderId) => {
    if (!canEdit) return;
    if (!window.confirm(`Mark ${orderId} as Ready to Delivery?`)) return;
    try {
      await dispatch(updateOrderStatusThunk({ id, status: 'ready-to-delivery' })).unwrap();
      showToast.success("Marked as Ready");
    } catch (e) { showToast.error(e?.message || "Failed"); }
  }, [canEdit, dispatch]);

  const onMarkDelivered = useCallback(async (id, orderId) => {
    if (!canEdit) return;
    if (!window.confirm(`Mark ${orderId} as Delivered?`)) return;
    try {
      await dispatch(updateOrderStatusThunk({ id, status: 'delivered' })).unwrap();
      showToast.success("Marked as Delivered");
    } catch (e) { showToast.error(e?.message || "Failed"); }
  }, [canEdit, dispatch]);

  const clearFilters = () => {
    setSearchTerm(''); setPayFilter('all'); setTimeFilter('all');
    setActiveTab('all'); setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || payFilter !== 'all' || timeFilter !== 'all' || activeTab !== 'all';

  // ── error state ──
  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Failed to load orders</div>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>{error}</p>
        <button onClick={clearFilters} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111827' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.5} }`}</style>

      {/* ── Header toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>Orders Management</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>
            {pagination?.total || 0} total orders · production workflow tracker
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search orders or customer…"
              style={{
                paddingLeft: 34, paddingRight: searchTerm ? 32 : 14, paddingTop: 8, paddingBottom: 8,
                border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, outline: 'none',
                width: 240, background: '#fff', color: '#111827',
              }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button onClick={() => setShowFilters(p => !p)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            border: `1px solid ${showFilters ? '#2563eb' : '#e5e7eb'}`, borderRadius: 9,
            background: showFilters ? '#eff6ff' : '#fff', color: showFilters ? '#2563eb' : '#4b5563',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            <SlidersHorizontal size={14} /> Filters
            {hasActiveFilters && <span style={{ width: 7, height: 7, background: '#2563eb', borderRadius: '50%' }} />}
          </button>

          {canEdit && (
            <button onClick={() => navigate(`${basePath}/orders/new`)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff',
              border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
            }}>
              <Plus size={15} /> New Order
            </button>
          )}
        </div>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 5 }}>Payment Status</label>
            <select value={payFilter} onChange={e => { setPayFilter(e.target.value); setCurrentPage(1); }}
              style={{ padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, background: '#fff', color: '#374151' }}>
              {['all','pending','partial','paid','overpaid'].map(v => (
                <option key={v} value={v}>{v === 'all' ? 'All Payments' : v.charAt(0).toUpperCase()+v.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 5 }}>Time Period</label>
            <select value={timeFilter} onChange={e => { setTimeFilter(e.target.value); setCurrentPage(1); }}
              style={{ padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, background: '#fff', color: '#374151' }}>
              {[['all','All Time'],['week','This Week'],['month','This Month'],['3m','Last 3 Months'],['6m','Last 6 Months'],['1y','Last Year']].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} style={{ padding: '7px 14px', border: '1px solid #fecaca', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Clear All
            </button>
          )}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <OrdersKPI orders={orders} />

      {/* ── Workflow Filter Tabs ── */}
      <OrderFilterTabs orders={orders} activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setCurrentPage(1); }} />

      {/* ── Table card ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
          </table>
        ) : (
          <OrdersTable
            orders={displayedOrders}
            canEdit={canEdit}
            isAdmin={isAdmin}
            deleteLoading={deleteLoading}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onMarkReady={onMarkReady}
            onMarkDelivered={onMarkDelivered}
          />
        )}
        <Pagination pagination={pagination} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}