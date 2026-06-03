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
 * Public invoice page URL for WhatsApp (business order ID, not Mongo _id).
 * Override base with VITE_PUBLIC_APP_URL in production (e.g. Vercel domain).
 */
export function getPublicInvoiceUrl(order) {
  const businessOrderId = order?.orderId;
  if (!businessOrderId) return null;

  const envBase = import.meta.env.VITE_PUBLIC_APP_URL;
  const base =
    (typeof envBase === "string" && envBase.trim()) ||
    (typeof window !== "undefined" ? window.location.origin : "");

  if (!base) return null;

  const path = `/invoice/view/${encodeURIComponent(String(businessOrderId).trim())}`;
  return `${base.replace(/\/$/, "")}${path}`;
}

/**
 * Build a professional order summary message from live order data.
 * @param {{ order, customer, totalPaid, statusLabel, deliveryDate, invoiceUrl? }} params
 */
export function buildOrderWhatsAppMessage({
  order,
  customer,
  totalPaid,
  statusLabel,
  deliveryDate,
  invoiceUrl,
}) {
  const orderId = order?.orderId || "N/A";
  const customerName = customer?.name || "Customer";
  const displayPhone =
    customer?.phone || customer?.mobile || customer?.phoneNumber || "N/A";

  const lines = [
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
  ];

  if (invoiceUrl) {
    lines.push("", "Invoice:", invoiceUrl);
  }

  lines.push("", "Thank you for choosing DreamFit Couture.");

  return lines.join("\n");
}

export function buildWhatsAppUrl(phoneDigits, message) {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

/** Open WhatsApp in a new tab with pre-filled message. */
export function openWhatsAppShare({ phoneDigits, message }) {
  const url = buildWhatsAppUrl(phoneDigits, message);
  window.open(url, "_blank", "noopener,noreferrer");
}
