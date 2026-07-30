const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : `${import.meta.env.VITE_API_URL}/api`;

/**
 * Fetch invoice data for public view (no auth).
 * @param {string} orderId Business order ID e.g. 2026052815
 */
export async function fetchPublicInvoice(orderId) {
  const id = encodeURIComponent(String(orderId || "").trim());
  if (!id) throw new Error("Order ID is required");

  const res = await fetch(`${API_URL}/public/invoice/${id}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Invoice not found");
  }
  return data;
}
