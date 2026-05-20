import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Save, User, Calendar, CreditCard,
  Package, Plus, Trash2, Image as ImageIcon, Phone,
  Wallet, Banknote, Smartphone, Landmark, Clock, X,
  Receipt, Truck, Check, Menu, IndianRupee,
} from "lucide-react";

import {
  fetchOrderById,
  updateExistingOrder,
  updateOrderStatusThunk,
  clearCurrentOrder,
} from "../../../features/order/orderSlice";

import {
  fetchGarmentsByOrder,
  deleteGarment,
} from "../../../features/garment/garmentSlice";

import {
  fetchOrderPayments,
  createPayment,
  updatePayment,
  deletePayment,
  clearPayments,
} from "../../../features/payment/paymentSlice.js";

import { fetchAllCustomers } from "../../../features/customer/customerSlice";

import GarmentForm from "../garment/GarmentForm";
import AddPaymentModal from "../../../components/AddPaymentModal";
import showToast from "../../../utils/toast";
import "./CalendarStyles.css";

// ─── Payment method icon ─────────────────────────────────────────────────────
const PaymentMethodIcon = ({ method }) => {
  switch (method) {
    case "cash": return <Banknote size={14} className="text-green-600" />;
    case "upi": return <Smartphone size={14} className="text-blue-600" />;
    case "bank-transfer": return <Landmark size={14} className="text-purple-600" />;
    case "card": return <CreditCard size={14} className="text-orange-600" />;
    default: return <Wallet size={14} className="text-slate-600" />;
  }
};

// ─── Payment status badge ────────────────────────────────────────────────────
const PaymentStatusBadge = ({ status }) => {
  const map = {
    paid: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", icon: "✅", label: "Payment Completed" },
    partial: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", icon: "⏳", label: "Partial Payment" },
    pending: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", icon: "❌", label: "Payment Pending" },
  };
  const s = map[status] || map.pending;
  return (
    <div className={`p-3 rounded-xl flex items-center gap-2 font-bold text-sm border ${s.bg} ${s.text} ${s.border}`}>
      <span className="text-lg">{s.icon}</span>
      {s.label}
    </div>
  );
};

export default function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Redux selectors ────────────────────────────────────────────────────────
  const { currentOrder, loading } = useSelector((state) => ({
    currentOrder: state.order?.currentOrder || null,
    loading: state.order?.loading || false,
  }));

  const garments = useSelector(
    (state) => state.garment?.garments || state.garments?.garments || []
  );

  const payments = useSelector(
    (state) => state.payment?.payments || state.payments?.payments || []
  );

  const paymentsLoading = useSelector(
    (state) => state.payment?.loading || state.payments?.loading || false
  );

  const customers = useSelector(
    (state) => state.customer?.customers || state.customers?.customers || []
  );

  const { user } = useSelector((state) => state.auth);

  // ── Local state ────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    customer: "",
    deliveryDate: "",
    specialNotes: "",
    advancePayment: { amount: 0, method: "cash" },
    status: "draft",
  });

  const [showGarmentModal, setShowGarmentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [editingGarment, setEditingGarment] = useState(null);
  const [expandedGarment, setExpandedGarment] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataLoadTimeout, setDataLoadTimeout] = useState(false);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const canEdit = isAdmin || isStoreKeeper;

  const basePath =
    user?.role === "ADMIN" ? "/admin"
      : user?.role === "STORE_KEEPER" ? "/storekeeper"
        : "/cuttingmaster";

  // ── Fetch data on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => { if (loading) setDataLoadTimeout(true); }, 8000);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setFetchAttempts((p) => p + 1);
        await dispatch(fetchOrderById(id)).unwrap();
        await dispatch(fetchGarmentsByOrder(id)).unwrap();
        await dispatch(fetchOrderPayments(id)).unwrap();
        await dispatch(fetchAllCustomers()).unwrap();
      } catch (error) {
        showToast.error(error?.message || "Failed to load order details");
      }
    };

    fetchData();

    return () => {
      dispatch(clearCurrentOrder());
      dispatch(clearPayments());
    };
  }, [dispatch, id]);

  // ── Derive customer name from customers list ───────────────────────────────
  useEffect(() => {
    if (!currentOrder?.customer || !customers?.length) return;

    const customerId = currentOrder.customer._id || currentOrder.customer;
    const found = customers.find((c) => c._id === customerId);
    if (!found) return;

    let name = "";
    if (found.firstName || found.lastName) {
      name = `${found.firstName || ""} ${found.lastName || ""}`.trim();
    } else if (found.name) {
      name = found.name;
    }
    if (found.salutation && name) name = `${found.salutation} ${name}`;
    setCustomerName(name || "Customer");
  }, [currentOrder, customers]);

  // ── Populate form from order ───────────────────────────────────────────────
  useEffect(() => {
    if (!currentOrder) return;
    setFormData({
      customer: currentOrder.customer?._id || "",
      deliveryDate: currentOrder.deliveryDate?.split("T")[0] || "",
      specialNotes: currentOrder.specialNotes || "",
      advancePayment: currentOrder.advancePayment || { amount: 0, method: "cash" },
      status: currentOrder.status || "draft",
    });
  }, [currentOrder]);

  // ── Payment calculations ───────────────────────────────────────────────────
  const estimatedRange = garments?.reduce(
    (acc, g) => {
      return {
        min: acc.min + (g.priceRange?.min || 0),
        max: acc.max + (g.priceRange?.max || 0),
      };
    },
    { min: 0, max: 0 }
  ) || { min: 0, max: 0 };

  const finalizedAmount = garments?.reduce(
    (sum, g) => {
      const val = g.finalizedPrice !== undefined && g.finalizedPrice !== null ? g.finalizedPrice : (g.priceRange?.max || 0);
      return sum + Number(val);
    },
    0
  ) || 0;

  const totalAmount = finalizedAmount;

  const paymentStats = {
    totalPaid: payments?.reduce((s, p) => s + (p.amount || 0), 0) || 0,
    totalPayments: payments?.length || 0,
    advanceTotal: payments?.filter((p) => p.type === "advance").reduce((s, p) => s + (p.amount || 0), 0) || 0,
    fullTotal: payments?.filter((p) => p.type === "full").reduce((s, p) => s + (p.amount || 0), 0) || 0,
    finalSettlementTotal: payments?.filter((p) => p.type === "final-settlement").reduce((s, p) => s + (p.amount || 0), 0) || 0,
    byMethod: {
      cash: payments?.filter((p) => p.method === "cash").reduce((s, p) => s + (p.amount || 0), 0) || 0,
      upi: payments?.filter((p) => p.method === "upi").reduce((s, p) => s + (p.amount || 0), 0) || 0,
      "bank-transfer": payments?.filter((p) => p.method === "bank-transfer").reduce((s, p) => s + (p.amount || 0), 0) || 0,
      card: payments?.filter((p) => p.method === "card").reduce((s, p) => s + (p.amount || 0), 0) || 0,
    },
  };

  // Balance can NEVER be negative
  const balanceAmount = Math.max(0, totalAmount - paymentStats.totalPaid);
  const isFullyPaid = balanceAmount === 0 && paymentStats.totalPaid > 0;

  const paymentStatus =
    isFullyPaid ? "paid"
      : paymentStats.totalPaid > 0 ? "partial"
        : "pending";

  const garmentDeliveryRange =
    garments?.length > 0
      ? {
        min: new Date(Math.min(...garments.map((g) => new Date(g.estimatedDelivery || formData.deliveryDate)))),
        max: new Date(Math.max(...garments.map((g) => new Date(g.estimatedDelivery || formData.deliveryDate)))),
      }
      : null;

  // ── Formatters ─────────────────────────────────────────────────────────────
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "Not set";

  const formatCurrency = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n || 0);

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    return `${d}${timeStr ? " at " + timeStr : ""}`;
  };

  // ── Garment handlers ───────────────────────────────────────────────────────
  const handleAddGarment = () => { setEditingGarment(null); setShowGarmentModal(true); };

  const handleEditGarment = (g) => { setEditingGarment(g); setShowGarmentModal(true); };

  const handleDeleteGarment = async (garmentId) => {
    if (!window.confirm("Remove this garment?")) return;
    try {
      await dispatch(deleteGarment(garmentId)).unwrap();
      showToast.success("Garment removed");
      dispatch(fetchGarmentsByOrder(id));
    } catch {
      showToast.error("Failed to remove garment");
    }
  };

  const handleSaveGarment = () => {
    setShowGarmentModal(false);
    dispatch(fetchGarmentsByOrder(id));
    showToast.success("Garment updated");
  };

  // ── Payment handlers ───────────────────────────────────────────────────────
  const handleAddPayment = () => {
    // Guard: don't open modal if order is fully paid
    if (isFullyPaid) {
      showToast.info("This order is fully paid. No outstanding balance.");
      return;
    }
    setEditingPayment(null);
    setShowPaymentModal(true);
  };

  const handleEditPayment = (payment) => { setEditingPayment(payment); setShowPaymentModal(true); };

  const handleSavePayment = async (paymentData) => {
    try {
      if (editingPayment) {
        await dispatch(
          updatePayment({
            id: editingPayment._id,
            data: {
              amount: Number(paymentData.amount),
              type: paymentData.type || "advance",
              method: paymentData.method || "cash",
              referenceNumber: paymentData.referenceNumber || "",
              paymentDate: paymentData.paymentDate || paymentData.date || new Date().toISOString().split("T")[0],
              paymentTime: paymentData.paymentTime || paymentData.time || new Date().toLocaleTimeString("en-US", { hour12: false }),
              notes: paymentData.notes || "",
            },
          })
        ).unwrap();
        showToast.success("Payment updated successfully");
      } else {
        await dispatch(
          createPayment({
            order: id,
            customer: currentOrder?.customer?._id,
            amount: Number(paymentData.amount),
            type: paymentData.type || "advance",
            method: paymentData.method || "cash",
            referenceNumber: paymentData.referenceNumber || "",
            paymentDate: paymentData.paymentDate || paymentData.date || new Date().toISOString().split("T")[0],
            paymentTime: paymentData.paymentTime || paymentData.time || new Date().toLocaleTimeString("en-US", { hour12: false }),
            notes: paymentData.notes || "",
          })
        ).unwrap();
        showToast.success("Payment added successfully");
      }

      setShowPaymentModal(false);
      setEditingPayment(null);
      dispatch(fetchOrderPayments(id));
      dispatch(fetchOrderById(id));
    } catch (error) {
      showToast.error(error.message || "Failed to save payment");
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!canEdit) { showToast.error("No permission to delete payments"); return; }
    if (!window.confirm("Delete this payment?")) return;
    try {
      await dispatch(deletePayment(paymentId)).unwrap();
      showToast.success("Payment deleted successfully");
      dispatch(fetchOrderPayments(id));
      dispatch(fetchOrderById(id));
    } catch {
      showToast.error("Failed to delete payment");
    }
  };

  // ── Status handlers ────────────────────────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    if (!canEdit) { showToast.error("No permission to update status"); return; }
    try {
      await dispatch(updateOrderStatusThunk({ id, status: newStatus })).unwrap();
      const messages = {
        "ready-to-delivery": "Order marked as ready for delivery",
        delivered: "Order marked as delivered",
        cancelled: "Order cancelled",
        "in-progress": "Order status updated to in progress",
        confirmed: "Order confirmed",
        draft: "Order moved to draft",
      };
      showToast.success(messages[newStatus] || `Status updated to ${newStatus}`);
      setFormData((p) => ({ ...p, status: newStatus }));
      dispatch(fetchOrderById(id));
    } catch {
      showToast.error("Failed to update status");
    }
  };

  const handleMarkReadyToDelivery = () => {
    if (formData.status === "in-progress") handleStatusChange("ready-to-delivery");
    else showToast.error("Order must be in progress to mark as ready for delivery");
  };

  const handleMarkDelivered = () => {
    if (formData.status === "ready-to-delivery") handleStatusChange("delivered");
    else showToast.error("Order must be ready for delivery first");
  };

  // ── Form submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.customer) { showToast.error("Please select a customer"); setIsSubmitting(false); return; }
    if (!formData.deliveryDate) { showToast.error("Please select delivery date"); setIsSubmitting(false); return; }

    try {
      await dispatch(
        updateExistingOrder({
          id,
          data: {
            deliveryDate: formData.deliveryDate,
            specialNotes: formData.specialNotes,
            advancePayment: { amount: Number(formData.advancePayment.amount) || 0, method: formData.advancePayment.method },
            status: formData.status,
            priceSummary: { totalMin: finalizedAmount, totalMax: finalizedAmount },
            balanceAmount,
          },
        })
      ).unwrap();

      showToast.success("Order updated successfully");
      navigate(`${basePath}/orders/${id}`);
    } catch (error) {
      showToast.error(error.message || "Failed to update order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Permission guard ───────────────────────────────────────────────────────
  if (!canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
          <p className="text-slate-500 mt-2">You don't have permission to edit orders</p>
          <button
            onClick={() => navigate(`${basePath}/orders/${id}`)}
            className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-bold text-sm"
          >Go Back</button>
        </div>
      </div>
    );
  }

  if (loading && !dataLoadTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-slate-600">Loading order details...</p>
          <p className="text-sm text-slate-400 mt-2">Attempt {fetchAttempts}</p>
        </div>
      </div>
    );
  }

  if (dataLoadTimeout && !currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Taking too long to load</h2>
          <p className="text-slate-400 mb-4">Attempts: {fetchAttempts}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-bold text-sm">Retry</button>
            <button onClick={() => navigate(`${basePath}/orders`)} className="bg-slate-200 text-slate-700 px-6 py-2.5 rounded-lg hover:bg-slate-300 font-bold text-sm">Back to Orders</button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Order Not Found</h2>
          <button onClick={() => navigate(`${basePath}/orders`)} className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-bold text-sm">Back to Orders</button>
        </div>
      </div>
    );
  }

  const minimalCustomer = currentOrder?.customer;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(`${basePath}/orders/${id}`)} className="flex items-center gap-1 text-slate-600">
            <ArrowLeft size={18} />
            <span className="font-bold text-sm">Back</span>
          </button>
          <h1 className="text-base font-black text-slate-800 truncate max-w-[150px]">Edit Order</h1>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-slate-100 rounded-xl">
            <Menu size={18} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40">
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Quick Actions</p>
              <button onClick={() => { handleAddGarment(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold text-sm">
                <Plus size={16} /> Add Garment
              </button>
              {/* Only show Add Payment button if NOT fully paid */}
              {!isFullyPaid && (
                <button onClick={() => { handleAddPayment(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-bold text-sm">
                  <Wallet size={16} /> Add Payment
                </button>
              )}
              {formData.status === "in-progress" && (
                <button onClick={() => { handleMarkReadyToDelivery(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-bold text-sm">
                  <Truck size={16} /> Mark Ready for Delivery
                </button>
              )}
              {formData.status === "ready-to-delivery" && (
                <button onClick={() => { handleMarkDelivered(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-bold text-sm">
                  <Check size={16} /> Mark Delivered
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <AddPaymentModal
        isOpen={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); setEditingPayment(null); }}
        onSave={handleSavePayment}
        orderTotalMin={finalizedAmount}
        orderTotalMax={finalizedAmount}
        remainingAmount={balanceAmount}
        alreadyPaid={paymentStats.totalPaid}
        orderId={id}
        customerId={currentOrder?.customer?._id}
        initialData={editingPayment}
        title={editingPayment ? "Edit Payment" : isFullyPaid ? "Order Fully Paid" : "Add Payment"}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center gap-4 mb-6">
          <button onClick={() => navigate(`${basePath}/orders/${id}`)} className="p-2 hover:bg-slate-100 rounded-xl">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Edit Order</h1>
            <p className="text-slate-500">Order ID: {currentOrder?.orderId}</p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-blue-600" />
              <span className="font-bold text-sm text-slate-700">Current Status:</span>
              <select
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
              >
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="ready-to-delivery">Ready to Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              {formData.status === "in-progress" && (
                <button type="button" onClick={handleMarkReadyToDelivery} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm">
                  <Truck size={14} /> Mark Ready
                </button>
              )}
              {formData.status === "ready-to-delivery" && (
                <button type="button" onClick={handleMarkDelivered} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm">
                  <Check size={14} /> Mark Delivered
                </button>
              )}
              <div className="text-sm text-slate-400">
                Updated: {currentOrder?.updatedAt ? new Date(currentOrder.updatedAt).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-600" /> Customer Details
              </h2>
              {minimalCustomer ? (
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Customer Name</p>
                        <h3 className="text-xl font-bold text-slate-800">{customerName || "Customer"}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={14} className="text-blue-500" />
                        <p className="text-sm font-medium">{minimalCustomer.phone || "No phone"}</p>
                      </div>
                    </div>
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 self-start">
                      <span>🆔</span>
                      <span>{minimalCustomer.customerId || "N/A"}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 text-center border-t border-blue-200 pt-3">
                    Customer cannot be changed after order creation
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-8 text-center">
                  <User size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500">No customer information available</p>
                </div>
              )}
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" /> Delivery Information
              </h2>
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  Expected Delivery Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Special Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <Package size={18} className="text-blue-600" /> Order Details
              </h2>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">Special Notes</label>
              <textarea
                value={formData.specialNotes}
                onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                rows="3"
                placeholder="Any special instructions..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* Garments */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Package size={18} className="text-blue-600" /> Garments ({garments?.length || 0})
                </h2>
                <button type="button" onClick={handleAddGarment} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                  <Plus size={14} /> Add Garment
                </button>
              </div>

              {garments?.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <Package size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500">No garments in this order</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {garments.map((garment) => (
                    <div key={garment._id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-black text-slate-800 truncate">{garment.name}</h3>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{garment.garmentId}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${garment.priority === "urgent" ? "bg-red-100 text-red-600"
                                : garment.priority === "high" ? "bg-orange-100 text-orange-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}>{garment.priority}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                            <div>
                              <p className="text-xs text-slate-400">Price</p>
                              <p className="font-bold text-blue-600 text-xs">₹{garment.priceRange?.min} - ₹{garment.priceRange?.max}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Delivery</p>
                              <p className="font-medium text-purple-600 text-xs">{formatDate(garment.estimatedDelivery)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Status</p>
                              <p className="capitalize font-medium text-xs">{garment.status}</p>
                            </div>
                          </div>

                          {(garment.referenceImages?.length > 0 || garment.customerImages?.length > 0) && (
                            <div className="mt-2 border-t border-slate-200 pt-2">
                              <button type="button" onClick={() => setExpandedGarment(expandedGarment === garment._id ? null : garment._id)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                                <ImageIcon size={14} />
                                {expandedGarment === garment._id ? "Hide Images" : "Show Images"}
                              </button>
                              {expandedGarment === garment._id && (
                                <div className="mt-2 space-y-2">
                                  {garment.referenceImages?.length > 0 && (
                                    <div>
                                      <p className="text-xs font-bold text-slate-500 mb-1">Reference Images</p>
                                      <div className="grid grid-cols-3 gap-2">
                                        {garment.referenceImages.map((img, idx) => (
                                          <img key={idx} src={img.url || img} alt={`Ref ${idx + 1}`} className="w-full h-20 object-cover rounded-lg border border-slate-200"
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Not+Found"; }} />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {garment.customerImages?.length > 0 && (
                                    <div>
                                      <p className="text-xs font-bold text-slate-500 mb-1">Customer Images</p>
                                      <div className="grid grid-cols-3 gap-2">
                                        {garment.customerImages.map((img, idx) => (
                                          <img key={idx} src={img.url || img} alt={`Customer ${idx + 1}`} className="w-full h-20 object-cover rounded-lg border border-slate-200"
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Not+Found"; }} />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 self-end sm:self-center">
                          <button type="button" onClick={() => handleEditGarment(garment)} className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-xs font-medium">Edit</button>
                          <button type="button" onClick={() => handleDeleteGarment(garment._id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN — Payment Summary ─────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
              <h2 className="text-lg font-black text-slate-800 mb-4">Payment Summary</h2>

              <div className="space-y-4">
                {/* Total Amount */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                  <p className="text-[10px] text-blue-600 font-black uppercase mb-0.5">Finalized Billing Amount</p>
                  <p className="text-2xl font-black text-blue-700">
                    ₹{finalizedAmount.toLocaleString('en-IN')}
                  </p>
                  {estimatedRange.min > 0 && estimatedRange.max > 0 && (
                    <div className="mt-2 pt-2 border-t border-blue-200/50 flex justify-between text-[9px] text-slate-500 font-bold">
                      <span>ESTIMATED RANGE:</span>
                      <span>₹{estimatedRange.min.toLocaleString('en-IN')} – ₹{estimatedRange.max.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Payment Status Badge */}
                <PaymentStatusBadge status={paymentStatus} />

                {/* Stats cards */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-50 p-3 rounded-xl">
                    <p className="text-xs text-green-600 font-bold">Total Paid</p>
                    <p className="text-lg font-black text-green-700">{formatCurrency(paymentStats.totalPaid)}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-xl">
                    <p className="text-xs text-purple-600 font-bold">Payments</p>
                    <p className="text-lg font-black text-purple-700">{paymentStats.totalPayments}</p>
                  </div>
                </div>

                {/* Payment breakdown — only show categories that have value */}
                {paymentStats.totalPayments > 0 && (
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-xs font-black uppercase text-slate-500 mb-2">Payment Breakdown</p>
                    <div className="space-y-1.5">
                      {paymentStats.advanceTotal > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Advance</span>
                          <span className="font-bold text-blue-600">{formatCurrency(paymentStats.advanceTotal)}</span>
                        </div>
                      )}
                      {paymentStats.fullTotal > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Full Payment</span>
                          <span className="font-bold text-green-600">{formatCurrency(paymentStats.fullTotal)}</span>
                        </div>
                      )}
                      {paymentStats.finalSettlementTotal > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Final Settlement</span>
                          <span className="font-bold text-green-600">{formatCurrency(paymentStats.finalSettlementTotal)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {payments?.length === 0 && (
                  <div className="bg-slate-50 p-4 rounded-xl text-center text-slate-400 text-sm">
                    No payments recorded yet
                  </div>
                )}

                {/* Garment delivery range */}
                {garmentDeliveryRange && (
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-xs text-purple-600 font-black uppercase mb-1">Garment Delivery Range</p>
                    <p className="text-sm font-bold text-purple-700">
                      {formatDate(garmentDeliveryRange.min)} – {formatDate(garmentDeliveryRange.max)}
                    </p>
                    <p className="text-xs text-purple-500 mt-1">Order delivery: {formatDate(formData.deliveryDate)}</p>
                  </div>
                )}

                {/* ── Balance / Fully Paid — MUTUALLY EXCLUSIVE ───────────── */}
                {isFullyPaid ? (
                  /* Fully paid banner */
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                    <p className="text-green-700 font-black text-base">✅ Fully Paid</p>
                    <p className="text-xs text-green-600 mt-1">No outstanding balance</p>
                  </div>
                ) : (
                  /* Balance due — only shown when NOT fully paid */
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <p className="text-xs text-orange-600 font-black uppercase mb-1">Balance Due</p>
                    <p className="text-xl font-black text-orange-700">{formatCurrency(balanceAmount)}</p>
                    <p className="text-xs text-orange-500 mt-1">Pending payment</p>
                  </div>
                )}

                {/* ── Add Payment Button — hidden when fully paid ─────────── */}
                {canEdit && !isFullyPaid && (
                  <button
                    type="button"
                    onClick={handleAddPayment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Wallet size={18} />
                    Add Payment
                  </button>
                )}

                {/* Payment History Toggle */}
                {payments?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-bold flex items-center justify-center gap-2 text-sm"
                  >
                    <Receipt size={14} />
                    {showPaymentHistory ? "Hide" : "Show"} Payment History ({payments.length})
                  </button>
                )}

                {/* Payment History List */}
                {showPaymentHistory && payments?.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-3 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {payments.map((payment, index) => (
                        <div key={payment._id || index} className="bg-white p-3 rounded-lg border border-slate-200">
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="font-bold text-green-600 text-sm">{formatCurrency(payment.amount)}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${payment.type === "full" ? "bg-green-100 text-green-700"
                                    : payment.type === "final-settlement" ? "bg-emerald-100 text-emerald-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}>
                                  {payment.type === "final-settlement" ? "Final"
                                    : payment.type === "full" ? "Full"
                                      : "Advance"}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                <PaymentMethodIcon method={payment.method} />
                                <span className="text-slate-600 capitalize">{payment.method}</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-400 truncate">{formatDateTime(payment.paymentDate, payment.paymentTime)}</span>
                              </div>
                              {payment.referenceNumber && (
                                <p className="text-xs text-purple-600 font-mono mt-1 truncate">Ref: {payment.referenceNumber}</p>
                              )}
                              {payment.notes && (
                                <p className="text-xs text-slate-400 mt-1 italic truncate">{payment.notes}</p>
                              )}
                            </div>
                            {canEdit && (
                              <div className="flex gap-1">
                                <button type="button" onClick={() => handleEditPayment(payment)} className="text-blue-500 hover:text-blue-700 text-xs font-bold px-2 py-1">Edit</button>
                                <button type="button" onClick={() => handleDeletePayment(payment._id)} className="text-red-500 hover:text-red-700 p-1"><X size={12} /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 mt-6 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span className="text-sm">Updating...</span></>
                  ) : (
                    <><Save size={16} /><span>Update Order</span></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`${basePath}/orders/${id}`)}
                  className="w-full px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Garment Form Modal */}
      {showGarmentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <GarmentForm
            onClose={() => setShowGarmentModal(false)}
            onSave={handleSaveGarment}
            editingGarment={editingGarment}
            customerId={formData.customer}
          />
        </div>
      )}
    </div>
  );
}
