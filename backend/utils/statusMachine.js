/**
 * Strict status transition rules for Invoices
 */
const INVOICE_TRANSITIONS = {
  draft: ["issued", "cancelled"],
  issued: ["cancelled"],
  cancelled: [] // Terminal state
};

/**
 * Strict status transition rules for Orders
 */
const ORDER_TRANSITIONS = {
  draft: ["confirmed", "cancelled"],
  confirmed: ["in-progress", "cancelled"],
  "in-progress": ["ready-to-delivery", "cancelled"],
  "ready-to-delivery": ["delivered", "cancelled"],
  delivered: [],
  cancelled: []
};

/**
 * Validates whether an Invoice can transition from its current status to next status
 * @param {string} oldStatus - Current status
 * @param {string} nextStatus - Desired target status
 * @returns {boolean}
 */
export const canTransitionInvoiceStatus = (oldStatus, nextStatus) => {
  if (oldStatus === nextStatus) return true;
  const allowed = INVOICE_TRANSITIONS[oldStatus] || [];
  return allowed.includes(nextStatus);
};

/**
 * Validates whether an Order can transition from its current status to next status
 * @param {string} oldStatus - Current status
 * @param {string} nextStatus - Desired target status
 * @returns {boolean}
 */
export const canTransitionOrderStatus = (oldStatus, nextStatus) => {
  if (oldStatus === nextStatus) return true;
  const allowed = ORDER_TRANSITIONS[oldStatus] || [];
  return allowed.includes(nextStatus);
};
