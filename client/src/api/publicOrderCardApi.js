const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : `${import.meta.env.VITE_API_URL}/api`;

/**
 * Fetch order card data for public view (no auth).
 * @param {string} orderId Business order ID e.g. 2026061101
 */
export async function fetchPublicOrderCard(orderId) {
  const id = encodeURIComponent(String(orderId || "").trim());
  if (!id) throw new Error("Order ID is required");

  const res = await fetch(`${API_URL}/public/order-card/${id}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Order card not found");
  }
  return data;
}
