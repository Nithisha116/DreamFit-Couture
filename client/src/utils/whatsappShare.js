/**
 * Client-side WhatsApp sharing (opens wa.me — user sends manually).
 * Designed so this module can later be swapped for Twilio/API without UI changes.
 */

/** Resolve customer phone to wa.me digits (e.g. 918586737494). */
export function resolveCustomerPhone(customer) {
  if (!customer || typeof customer !== "object") return null;

  const raw =
    customer.phone ||
    customer.mobile ||
    customer.phoneNumber ||
    customer.contactNumber ||
    "";

  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length >= 10) return digits;

  return null;
}

export function formatWhatsAppDeliveryDate(dateString) {
  if (!dateString) return "Not specified";
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Not specified";
  }
}

export function formatWhatsAppAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

/**
 * Build a professional order summary message from live order data.
 * @param {{ order, customer, totalPaid, statusLabel, deliveryDate }} params
 */
export function buildOrderWhatsAppMessage({
  order,
  customer,
  totalPaid,
  statusLabel,
  deliveryDate,
}) {
  const orderId = order?.orderId || "N/A";
  const customerName = customer?.name || "Customer";
  const displayPhone =
    customer?.phone || customer?.mobile || customer?.phoneNumber || "N/A";

  return [
    "DreamFit Couture",
    "",
    `Order ID: ${orderId}`,
    `Customer: ${customerName}`,
    `Phone: ${displayPhone}`,
    "",
    `Amount Paid: ${formatWhatsAppAmount(totalPaid)}`,
    "",
    `Delivery Date: ${formatWhatsAppDeliveryDate(deliveryDate)}`,
    "",
    `Status: ${statusLabel || "Unknown"}`,
    "",
    "Thank you for choosing DreamFit Couture.",
  ].join("\n");
}

export function buildWhatsAppUrl(phoneDigits, message) {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

/** Open WhatsApp in a new tab with pre-filled message. */
export function openWhatsAppShare({ phoneDigits, message }) {
  const url = buildWhatsAppUrl(phoneDigits, message);
  window.open(url, "_blank", "noopener,noreferrer");
}
