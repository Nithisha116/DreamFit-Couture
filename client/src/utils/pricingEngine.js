// PREVIEW ONLY — Backend is authoritative. Keep in sync with backend/utils/pricingEngine.js

// Plain JS replicas of scaling functions to avoid module import issues on frontend
const toPaise = (rupees) => {
  if (rupees === null || rupees === undefined || isNaN(rupees)) return 0;
  return Math.round(Number(rupees) * 100);
};

const toRupees = (paise) => {
  if (paise === null || paise === undefined || isNaN(paise)) return 0;
  return Math.round(paise) / 100;
};

/**
 * Compute discount amount for a garment price in Paise.
 */
export function computeGarmentDiscount(pricePaise, discountType, discountVal) {
  if (discountType === "flat") {
    return toPaise(discountVal);
  } else if (discountType === "percentage") {
    const pct = Number(discountVal) || 0;
    return Math.round((pricePaise * pct) / 100);
  }
  return 0;
}

/**
 * Compute canonical min/max total for one garment.
 */
export function getGarmentBreakdown(g) {
  if (!g) {
    return {
      tailoringPriceMin: 0,
      tailoringPriceMax: 0,
      fabricPrice: 0,
      additionalCharges: 0,
      discount: 0,
      discountType: "none",
      discountValue: 0,
      quantity: 1,
      garmentTotalMin: 0,
      garmentTotalMax: 0,
      calculatedAt: new Date()
    };
  }

  const qty = Number(g.quantity) || 1;
  const qtyPaise = toPaise(qty);
  const tailMin = toPaise(g.minPrice !== undefined && g.minPrice !== null ? g.minPrice : (g.priceRange?.min || 0));
  const tailMax = toPaise(g.maxPrice !== undefined && g.maxPrice !== null ? g.maxPrice : (g.priceRange?.max || tailMin));
  const fabric = toPaise(g.fabricPrice || 0);
  const additional = toPaise(g.additionalCharges || 0);

  // Math: tailoring price per piece * qty + fabric price per piece * qty + flat additional charges
  const rawMin = Math.round((tailMin * qtyPaise) / 100) + Math.round((fabric * qtyPaise) / 100) + additional;
  const rawMax = Math.round((tailMax * qtyPaise) / 100) + Math.round((fabric * qtyPaise) / 100) + additional;

  const discAmtMin = computeGarmentDiscount(rawMin, g.discountType, g.discount);
  const discAmtMax = computeGarmentDiscount(rawMax, g.discountType, g.discount);

  return {
    tailoringPriceMin: toRupees(tailMin),
    tailoringPriceMax: toRupees(tailMax),
    fabricPrice: toRupees(fabric),
    additionalCharges: toRupees(additional),
    discount: toRupees(discAmtMax),
    discountType: g.discountType || "none",
    discountValue: Number(g.discount) || 0,
    quantity: qty,
    garmentTotalMin: toRupees(Math.max(0, rawMin - discAmtMin)),
    garmentTotalMax: toRupees(Math.max(0, rawMax - discAmtMax)),
    calculatedAt: new Date()
  };
}

/**
 * Aggregate garment totals into order-level range.
 */
export function calculateOrderTotal(garments = []) {
  const active = garments.filter(g => g && g.isActive !== false);
  const totalMinPaise = active.reduce((sum, g) => sum + toPaise(getGarmentBreakdown(g).garmentTotalMin), 0);
  const totalMaxPaise = active.reduce((sum, g) => sum + toPaise(getGarmentBreakdown(g).garmentTotalMax), 0);
  return {
    totalMin: toRupees(totalMinPaise),
    totalMax: toRupees(totalMaxPaise)
  };
}

/**
 * Compute payment state from live totals.
 */
export function calculatePaymentState(totalMin, totalMax, totalPaid) {
  const minP = toPaise(totalMin);
  const maxP = toPaise(totalMax);
  const paidP = toPaise(totalPaid);

  const balanceDueMin = Math.max(0, minP - paidP);
  const balanceDueMax = Math.max(0, maxP - paidP);

  return {
    totalPaid: toRupees(paidP),
    balanceDueMin: toRupees(balanceDueMin),
    balanceDueMax: toRupees(balanceDueMax),
    isFullyPaid: paidP >= minP && minP > 0,
    paymentStatus: paidP >= minP && minP > 0 ? "paid" : paidP > 0 ? "partial" : "pending"
  };
}

/**
 * Master summary builder — used by all controllers.
 */
export function buildOrderPricingSummary(garments, payments = []) {
  const { totalMin, totalMax } = calculateOrderTotal(garments);
  const totalPaid = payments.filter(p => !p.isDeleted).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const paymentState = calculatePaymentState(totalMin, totalMax, totalPaid);
  return { totalMin, totalMax, ...paymentState };
}
