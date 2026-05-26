/**
 * Centralized Range Calculation Utilities for Frontend UI Components.
 */

export const calculateRangeTotals = (garments = [], paid = 0) => {
  const activeGarments = garments.filter(g => g && g.isActive !== false);

  const totalMin = activeGarments.reduce(
    (sum, g) => sum + (Number(g.priceRange?.min ?? g.minPrice) || 0),
    0
  );

  const totalMax = activeGarments.reduce(
    (sum, g) => sum + (Number(g.priceRange?.max ?? g.maxPrice) || 0),
    0
  );

  if (paid >= totalMin) {
    return {
      totalMin,
      totalMax,
      balanceMin: 0,
      balanceMax: 0,
      paymentStatus: "paid",
    };
  }

  return {
    totalMin,
    totalMax,
    balanceMin: Math.max(0, totalMin - paid),
    balanceMax: Math.max(0, totalMax - paid),
    paymentStatus: paid > 0 ? "partial" : "pending",
  };
};

export const formatPriceRange = (min, max) => {
  const safeMin = Number(min || 0);
  const safeMax = Number(max || 0);
  if (safeMin === safeMax) return `₹${safeMin.toLocaleString("en-IN")}`;
  return `₹${safeMin.toLocaleString("en-IN")} - ₹${safeMax.toLocaleString("en-IN")}`;
};
