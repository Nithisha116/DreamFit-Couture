import { toPaise, toRupees } from "./precision.js";

/**
 * Calculates high-precision totals for invoices using Paise arithmetic
 * @param {Array} items - List of items [{ price, qty }]
 * @param {string} discountType - "flat", "percentage", or "none"
 * @param {number} discountValue - Amount or percentage value of discount
 * @param {number} taxPercentage - GST/tax percentage (e.g. 5, 12, 18)
 * @returns {Object} { subtotal, discountAmount, taxAmount, grandTotal } in Rupees
 */
export const calculateInvoiceTotals = ({ items = [], discountType = "none", discountValue = 0, taxPercentage = 0 }) => {
  const subtotalPaise = items.reduce((sum, item) => {
    const pricePaise = toPaise(item.price);
    const qty = Number(item.qty) || 1;
    return sum + (pricePaise * qty);
  }, 0);

  const subtotalMinPaise = items.reduce((sum, item) => {
    const pricePaise = toPaise(item.minPrice !== undefined ? item.minPrice : item.price);
    const qty = Number(item.qty) || 1;
    return sum + (pricePaise * qty);
  }, 0);

  const subtotalMaxPaise = items.reduce((sum, item) => {
    const pricePaise = toPaise(item.maxPrice !== undefined ? item.maxPrice : item.price);
    const qty = Number(item.qty) || 1;
    return sum + (pricePaise * qty);
  }, 0);

  let discountPaise = 0;
  let discountMinPaise = 0;
  let discountMaxPaise = 0;
  
  if (discountType === "flat") {
    discountPaise = toPaise(discountValue);
    discountMinPaise = toPaise(discountValue);
    discountMaxPaise = toPaise(discountValue);
  } else if (discountType === "percentage") {
    const pct = Number(discountValue) || 0;
    discountPaise = Math.round((subtotalPaise * pct) / 100);
    discountMinPaise = Math.round((subtotalMinPaise * pct) / 100);
    discountMaxPaise = Math.round((subtotalMaxPaise * pct) / 100);
  }

  // Discounted subtotal cannot be negative
  const discountedSubtotalPaise = Math.max(0, subtotalPaise - discountPaise);
  const discountedSubtotalMinPaise = Math.max(0, subtotalMinPaise - discountMinPaise);
  const discountedSubtotalMaxPaise = Math.max(0, subtotalMaxPaise - discountMaxPaise);
  
  const taxPct = Number(taxPercentage) || 0;
  const taxPaise = Math.round((discountedSubtotalPaise * taxPct) / 100);
  const taxMinPaise = Math.round((discountedSubtotalMinPaise * taxPct) / 100);
  const taxMaxPaise = Math.round((discountedSubtotalMaxPaise * taxPct) / 100);
  
  const grandTotalPaise = discountedSubtotalPaise + taxPaise;
  const grandTotalMinPaise = discountedSubtotalMinPaise + taxMinPaise;
  const grandTotalMaxPaise = discountedSubtotalMaxPaise + taxMaxPaise;

  return {
    subtotal: toRupees(subtotalPaise),
    discountAmount: toRupees(discountPaise),
    taxAmount: toRupees(taxPaise),
    grandTotal: toRupees(grandTotalPaise),
    subtotalMin: toRupees(subtotalMinPaise),
    subtotalMax: toRupees(subtotalMaxPaise),
    grandTotalMin: toRupees(grandTotalMinPaise),
    grandTotalMax: toRupees(grandTotalMaxPaise)
  };
};

/**
 * Computes net profit from invoice grand total minus vendor and material expenses
 * @param {number} grandTotal - Invoice grand total
 * @param {number} outsourcingCost - Tailoring vendor cost
 * @param {number} materialCost - Consumed fabrics/accessories cost
 * @returns {number} estimatedProfit in Rupees
 */
export const calculateProfit = ({ grandTotal = 0, outsourcingCost = 0, materialCost = 0 }) => {
  const grandTotalPaise = toPaise(grandTotal);
  const expensesPaise = toPaise(outsourcingCost) + toPaise(materialCost);
  return toRupees(Math.max(0, grandTotalPaise - expensesPaise));
};
