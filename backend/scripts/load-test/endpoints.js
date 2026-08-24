/**
 * Endpoint catalogue for the load test.
 *
 * Every entry below was taken from the real route files in ../../routes and
 * verified to return 200 before being included. Nothing here is invented.
 *
 * SAFETY: read-only GETs only. No POST/PUT/PATCH/DELETE, because MONGO_URI
 * points at a shared MongoDB Atlas cluster holding real data.
 */

export const ENDPOINTS = {
  // ---- Test A: lightweight, no database work -----------------------------
  health: {
    name: "health",
    category: "A-lightweight",
    path: "/health",
    auth: false,
    desc: "Static JSON from server.js. No DB, no auth, no populate.",
  },

  spa: {
    name: "spa",
    category: "A-lightweight",
    path: "/ping",
    auth: false,
    desc:
      "Falls through the SPA catch-all and sends client/dist/index.html " +
      "from disk. Measures static file serving, not JSON.",
  },

  // ---- Test C: authentication overhead -----------------------------------
  authReject: {
    name: "auth-reject",
    category: "C-auth",
    path: "/api/categories",
    auth: false, // deliberately unauthenticated -> 401
    expectStatus: 401,
    desc: "protect() rejects with no token. Isolates middleware cost before DB.",
  },

  // ---- Test B: database reads (small -> large) ---------------------------
  categories: {
    name: "categories",
    category: "B-db-read",
    path: "/api/categories",
    auth: true,
    desc: "Small collection scan (~1.3 KB).",
  },

  fabrics: {
    name: "fabrics",
    category: "B-db-read",
    path: "/api/fabrics",
    auth: true,
    desc: "Small collection scan (~3 KB).",
  },

  items: {
    name: "items",
    category: "B-db-read",
    path: "/api/items",
    auth: true,
    desc: "Medium payload (~41 KB).",
  },

  ordersStats: {
    name: "orders-stats",
    category: "B-db-read",
    path: "/api/orders/stats",
    auth: true,
    desc: "Aggregation pipeline, tiny payload (~640 B). CPU/DB bound, not bandwidth.",
  },

  ordersDashboard: {
    name: "orders-dashboard",
    category: "B-db-read",
    path: "/api/orders/dashboard",
    auth: true,
    desc: "Dashboard aggregate (~30 KB). Most representative 'real page load'.",
  },

  customersAll: {
    name: "customers-all",
    category: "B-db-heavy",
    path: "/api/customers/all",
    auth: true,
    desc: "Heaviest verified read (~368 KB). Worst-case single request.",
  },
};

/**
 * Test E — realistic read-only user flow, in the order a real session hits it.
 * Deliberately excludes login (POST) so nothing mutates and no bcrypt storm
 * is created against the shared cluster.
 */
export const REALISTIC_FLOW = [
  "/api/orders/dashboard",
  "/api/orders",
  "/api/customers/stats",
  "/api/categories",
];

export const getEndpoint = (key) => {
  const ep = ENDPOINTS[key];
  if (!ep) {
    throw new Error(
      `Unknown endpoint "${key}". Known: ${Object.keys(ENDPOINTS).join(", ")}`
    );
  }
  return ep;
};
