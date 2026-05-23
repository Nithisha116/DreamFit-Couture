/**
 * Centralized payment calculations utility helper for Dreamfit Couture.
 * Resolves total amount, total paid, remaining balance, payment status, and modes from all payments.
 */

export function calculatePaymentSummary(order, garments = [], payments = []) {
  if (!order) {
    return {
      totalAmount: 0,
      totalPaid: 0,
      balanceDue: 0,
      isFullyPaid: false,
      paymentModes: "N/A",
      payments: []
    };
  }

  // 1. Calculate order total amount
  let totalAmount = 0;
  if (order.finalizedAmount !== undefined && order.finalizedAmount !== null && order.finalizedAmount !== "") {
    totalAmount = Number(order.finalizedAmount) || 0;
  } else if (Array.isArray(garments) && garments.length > 0) {
    totalAmount = garments.reduce((sum, g) => {
      const qty = g.quantity || g.qty || g.Quantity || 1;
      const finalized = g.finalizedPrice !== undefined && g.finalizedPrice !== null && g.finalizedPrice !== ""
        ? Number(g.finalizedPrice)
        : (g.priceRange?.max || 0);
      return sum + finalized * qty;
    }, 0);
  } else if (order.priceSummary?.totalMax) {
    totalAmount = Number(order.priceSummary.totalMax) || 0;
  } else if (order.minPrice !== undefined && order.minPrice !== null) {
    totalAmount = Number(order.minPrice) || 0;
  }

  // 2. Aggregate payments list
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

  // Filter out any deleted payment entries
  const activePayments = list.filter(p => p && !p.isDeleted);

  // 3. Compute total paid
  let totalPaid = activePayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  if (totalPaid === 0 && order.paymentSummary?.totalPaid) {
    totalPaid = Number(order.paymentSummary.totalPaid) || 0;
  }

  // 4. Compute balance
  const balanceDue = Math.max(0, totalAmount - totalPaid);

  // 5. Check fully paid
  const isFullyPaid = totalAmount > 0 && totalPaid >= totalAmount;

  // 6. Extract unique payment modes
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
    totalAmount,
    totalPaid,
    balanceDue,
    isFullyPaid,
    paymentModes,
    payments: activePayments
  };
}
