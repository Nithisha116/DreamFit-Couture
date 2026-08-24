/**
 * Client-side WhatsApp sharing (opens wa.me — user sends manually).
 * Designed so this module can later be swapped for Twilio/API without UI changes.
 */

/** Resolve customer phone to wa.me digits (e.g. 918586737494). */
export function resolveCustomerPhone(customer) {
  if (!customer || typeof customer !== "object") return null;

  const raw =
    customer.whatsappNumber ||
    customer.whatsapp ||
    customer.whatsappNo ||
    customer.whatsapp_number ||
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
function getPublicAppBase() {
  const envBase = import.meta.env.VITE_PUBLIC_APP_URL;
  return (
    (typeof envBase === "string" && envBase.trim()) ||
    (typeof window !== "undefined" ? window.location.origin : "")
  ).replace(/\/$/, "");
}

/**
 * DF-004: both public URLs are keyed by Order.publicToken (an unguessable
 * crypto.randomUUID()), never by the sequential, human-readable orderId — the
 * order ID stays visible in the message body, but must not double as the access
 * credential for the link itself.
 *
 * Existing orders (created before this field existed) intentionally have no
 * publicToken and no backfill is run automatically — see DF-004 remediation plan.
 * For those, these helpers return null and the caller (buildOrderWhatsAppMessage)
 * simply omits that link from the share message rather than sending a dead one.
 */
export function getPublicInvoiceUrl(order) {
  const publicToken = order?.publicToken;
  if (!publicToken) return null;

  const base = getPublicAppBase();
  if (!base) return null;

  const path = `/invoice/view/${encodeURIComponent(String(publicToken).trim())}`;
  return `${base}${path}`;
}

export function getPublicOrderCardUrl(order) {
  const publicToken = order?.publicToken;
  if (!publicToken) return null;

  const base = getPublicAppBase();
  if (!base) return null;

  const path = `/order-card/view/${encodeURIComponent(String(publicToken).trim())}`;
  return `${base}${path}`;
}

/**
 * Build a professional order summary message from live order data.
 * @param {{ order, customer, totalPaid, statusLabel, deliveryDate, invoiceUrl?, orderCardUrl? }} params
 */
export function buildOrderWhatsAppMessage({
  order,
  customer,
  totalPaid,
  statusLabel,
  deliveryDate,
  invoiceUrl,
  orderCardUrl,
}) {
  const orderId = order?.orderId || "N/A";
  const customerName = customer?.name || "Customer";
  const displayPhone =
    customer?.whatsappNumber ||
    customer?.whatsapp ||
    customer?.whatsappNo ||
    customer?.whatsapp_number ||
    customer?.phone ||
    customer?.mobile ||
    customer?.phoneNumber ||
    "N/A";

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

  if (orderCardUrl) {
    lines.push("", "Order Card:", orderCardUrl);
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
