/**
 * Centralized Range Calculation Utilities for Frontend UI Components.
 */

export const calculateRangeTotals = (garments = [], paid = 0) => {
  const activeGarments = garments.filter(g => g && g.isActive !== false);

  const totalMin = activeGarments.reduce(
    (sum, g) => {
      if (g.finalGarmentMinAmount !== undefined && g.finalGarmentMinAmount !== null) {
        return sum + Number(g.finalGarmentMinAmount);
      }
      const finalized = Number(g.finalizedAmount !== undefined && g.finalizedAmount !== null ? g.finalizedAmount : g.finalizedPrice);
      const tailoringMin = finalized > 0 ? finalized : Number(g.minPrice || g.priceRange?.min || 0);
      const fabric = Number(g.fabricPrice || 0);
      const additional = Number(g.additionalCharges || 0);
      return sum + tailoringMin + fabric + additional;
    },
    0
  );

  const totalMax = activeGarments.reduce(
    (sum, g) => {
      if (g.finalGarmentMaxAmount !== undefined && g.finalGarmentMaxAmount !== null) {
        return sum + Number(g.finalGarmentMaxAmount);
      }
      const finalized = Number(g.finalizedAmount !== undefined && g.finalizedAmount !== null ? g.finalizedAmount : g.finalizedPrice);
      const tailoringMax = finalized > 0 ? finalized : Number(g.maxPrice || g.priceRange?.max || 0);
      const fabric = Number(g.fabricPrice || 0);
      const additional = Number(g.additionalCharges || 0);
      return sum + tailoringMax + fabric + additional;
    },
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
