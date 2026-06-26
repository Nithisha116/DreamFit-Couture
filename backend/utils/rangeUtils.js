import { buildOrderPricingSummary } from "./pricingEngine.js";

export const calculateRangeTotals = (garments = [], paid = 0) => {
  // Wrap paid in a mock payment array
  const summary = buildOrderPricingSummary(garments, [{ amount: paid }]);
  return {
    totalMin: summary.totalMin,
    totalMax: summary.totalMax,
    balanceMin: summary.balanceDueMin,
    balanceMax: summary.balanceDueMax,
    paymentStatus: summary.paymentStatus
  };
};

export const formatPriceRange = (min, max) => {
  if (min === max) return `₹${min.toLocaleString("en-IN")}`;
  return `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString("en-IN")}`;
};
