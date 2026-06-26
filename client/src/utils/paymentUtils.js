/**
 * Centralized payment calculations utility helper for Dreamfit Couture.
 * Resolves total amount, total paid, remaining balance, payment status, and modes from all payments.
 */

import { buildOrderPricingSummary } from "./pricingEngine";

export function calculatePaymentSummary(order, garments = [], payments = []) {
  if (!order) {
    return {
      totalAmount: 0,
      totalAmountMin: 0,
      totalAmountMax: 0,
      totalPaid: 0,
      balanceDue: 0,
      balanceDueMin: 0,
      balanceDueMax: 0,
      isFullyPaid: false,
      paymentModes: "N/A",
      payments: [],
      status: "pending"
    };
  }

  let list = [];
  if (Array.isArray(payments) && payments.length > 0) {
    list = payments;
  } else if (Array.isArray(order.payments) && order.payments.length > 0) {
    list = order.payments;
  } else if (order.advancePayment?.amount) {
    list = [{
      _id: "adv-payment",
      amount: Number(order.advancePayment.amount) || 0,
      method: order.advancePayment.method || "cash",
      type: "advance",
      paymentDate: order.advancePayment.date || order.createdAt || new Date()
    }];
  }

  const activePayments = list.filter(p => p && !p.isDeleted);
  
  // Use canonical pricing engine
  const summary = buildOrderPricingSummary(garments, activePayments);

  const uniqueModes = Array.from(new Set(
    activePayments
      .map(p => String(p.method || "").trim().toLowerCase())
      .filter(Boolean)
  ));

  const formatMode = (m) => {
    if (m === "upi") return "UPI";
    if (m === "cash") return "Cash";
    if (m === "card") return "Card";
    if (m === "bank-transfer") return "Bank Transfer";
    return m.charAt(0).toUpperCase() + m.slice(1);
  };

  const paymentModes = uniqueModes.length > 0
    ? uniqueModes.map(formatMode).join(", ")
    : formatMode(order.advancePayment?.method || "cash");

  return {
    totalAmount: summary.totalMax, 
    totalAmountMin: summary.totalMin,
    totalAmountMax: summary.totalMax,
    finalizedAmount: order.finalizedAmount || 0,
    totalPaid: summary.totalPaid,
    balanceDue: summary.balanceDueMax,
    balanceDueMin: summary.balanceDueMin,
    balanceDueMax: summary.balanceDueMax,
    isFullyPaid: summary.isFullyPaid,
    status: summary.paymentStatus,
    paymentModes,
    payments: activePayments
  };
}
