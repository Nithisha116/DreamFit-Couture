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

  let discountPaise = 0;
  if (discountType === "flat") {
    discountPaise = toPaise(discountValue);
  } else if (discountType === "percentage") {
    discountPaise = Math.round((subtotalPaise * (Number(discountValue) || 0)) / 100);
  }

  // Discounted subtotal cannot be negative
  const discountedSubtotalPaise = Math.max(0, subtotalPaise - discountPaise);
  
  const taxPaise = Math.round((discountedSubtotalPaise * (Number(taxPercentage) || 0)) / 100);
  const grandTotalPaise = discountedSubtotalPaise + taxPaise;

  return {
    subtotal: toRupees(subtotalPaise),
    discountAmount: toRupees(discountPaise),
    taxAmount: toRupees(taxPaise),
    grandTotal: toRupees(grandTotalPaise)
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
