/**
 * Centralized payment calculations utility helper for Dreamfit Couture.
 * Resolves total amount, total paid, remaining balance, payment status, and modes from all payments.
 */

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
      payments: []
    };
  }

  // 1. Calculate order total amount range
  let totalAmountMin = 0;
  let totalAmountMax = 0;
  
  if (Array.isArray(garments) && garments.length > 0) {
    const activeGarments = garments.filter(g => g && g.isActive !== false);
    totalAmountMin = activeGarments.reduce((sum, g) => sum + (Number(g.minPrice || g.priceRange?.min) || 0), 0);
    totalAmountMax = activeGarments.reduce((sum, g) => sum + (Number(g.maxPrice || g.priceRange?.max) || 0), 0);
  } else if (order.minPrice !== undefined && order.minPrice !== null && order.minPrice !== 0) {
    totalAmountMin = Number(order.minPrice) || 0;
    totalAmountMax = Number(order.maxPrice) || 0;
  } else if (order.priceSummary?.totalMin !== undefined) {
    totalAmountMin = Number(order.priceSummary.totalMin) || 0;
    totalAmountMax = Number(order.priceSummary.totalMax) || 0;
  } else if (order.finalizedAmount !== undefined && order.finalizedAmount !== null && order.finalizedAmount !== "") {
    totalAmountMin = Number(order.finalizedAmount) || 0;
    totalAmountMax = Number(order.finalizedAmount) || 0;
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

  // 4. Compute balances
  let balanceDueMin = 0;
  let balanceDueMax = 0;
  let isFullyPaid = false;

  if (totalAmountMin > 0) {
    if (totalPaid >= totalAmountMin) {
      balanceDueMin = 0;
      balanceDueMax = 0;
      isFullyPaid = true;
    } else {
      balanceDueMin = Math.max(0, totalAmountMin - totalPaid);
      balanceDueMax = Math.max(0, totalAmountMax - totalPaid);
      isFullyPaid = false;
    }
  } else if (totalAmountMax > 0) {
    if (totalPaid >= totalAmountMax) {
      balanceDueMin = 0;
      balanceDueMax = 0;
      isFullyPaid = true;
    } else {
      balanceDueMin = 0;
      balanceDueMax = Math.max(0, totalAmountMax - totalPaid);
      isFullyPaid = false;
    }
  } else {
    balanceDueMin = 0;
    balanceDueMax = 0;
    isFullyPaid = true;
  }

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
    totalAmount: totalAmountMax, // Legacy fallback
    totalAmountMin,
    totalAmountMax,
    totalPaid,
    balanceDue: balanceDueMax, // Legacy fallback
    balanceDueMin,
    balanceDueMax,
    isFullyPaid,
    paymentModes,
    payments: activePayments
  };
}
