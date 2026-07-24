// backend/middleware/auditMiddleware.js
//
// Records every mutating (POST/PUT/PATCH/DELETE) request made by an
// authenticated ADMIN-role user as an AuditLog entry — action, entity
// affected, who did it (user id + email snapshot), when, and from what
// IP/user-agent. This is what lets the client's own Admin account and the
// Internal Admin account (or any future admin account) be told apart in
// the audit trail, without editing every individual controller.
//
// Hooked into the existing `protect` auth middleware (see
// auth.middleware.js) right after req.user is populated, so it runs once
// per authenticated request with zero per-route wiring. GET requests,
// non-admin roles, and unauthenticated requests are all no-ops.
import { logAction } from "../utils/auditLogger.js";

const METHOD_ACTION = { POST: "CREATE", PUT: "UPDATE", PATCH: "UPDATE", DELETE: "DELETE" };

// Route mount path -> readable entity label. Falls back to a title-cased
// version of the path segment for anything not listed here, so a new route
// still gets logged (just with a less polished label) instead of being
// silently skipped — see the note on AuditLog.entityType for why there's no
// enum to keep in sync with this.
const ENTITY_TYPE_BY_SEGMENT = {
  orders: "Order",
  invoices: "Invoice",
  payments: "Payment",
  customers: "Customer",
  garments: "Garment",
  works: "Work",
  tailors: "Tailor",
  "cutting-masters": "CuttingMaster",
  "store-keepers": "StoreKeeper",
  "aari-workers": "AariWorker",
  "embroidery-workers": "EmbroideryWorker",
  helpers: "Helper",
  users: "User",
  salary: "Salary",
  transactions: "Transaction",
  appointments: "Appointment",
  outsourcing: "Outsourcing",
  "outsourcing-vendors": "OutsourcingVendor",
  sourcing: "Sourcing",
  inventory: "InventoryMovement",
  attendance: "Attendance",
  leaves: "Leave",
  fabrics: "Fabric",
  categories: "Category",
  items: "Item",
  "size-templates": "SizeTemplate",
  "size-fields": "SizeField",
  "customer-size": "CustomerSizeProfile",
  notifications: "Notification",
  workers: "Worker",
  workflow: "Work",
};

// Fields that must never be written into an audit log, even redacted-shaped
// (i.e. we replace the value, not just skip logging it).
const SENSITIVE_KEYS = new Set([
  "password", "newpassword", "oldpassword", "confirmpassword",
  "token", "refreshtoken", "accesstoken", "secret", "otp",
]);

const isObjectIdLike = (s) => typeof s === "string" && /^[0-9a-fA-F]{24}$/.test(s);

const titleCase = (s) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\s+/g, "");

const entityTypeFromBaseUrl = (baseUrl = "") => {
  const segment = baseUrl.replace(/^\/api\//, "").split("/")[0];
  if (!segment) return "Unknown";
  return ENTITY_TYPE_BY_SEGMENT[segment] || titleCase(segment);
};

// Prefers a specific action verb from the URL when one exists (e.g. POST
// /works/:id/accept -> "ACCEPT", PATCH /orders/:id/status -> "STATUS"),
// since those are exactly the "approve/reject/status change" actions this
// is meant to capture distinctly rather than lumping under generic UPDATE.
const deriveActionVerb = (req) => {
  const segments = req.path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (last && !isObjectIdLike(last)) {
    return last.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase();
  }
  return METHOD_ACTION[req.method];
};

// Best-effort: prefer the URL's :id param (present for update/delete/status
// routes); for creates, sniff the common response body shapes used across
// this codebase ({ data }, { order }, { tailor }, ...).
const extractEntityId = (req, body) => {
  if (isObjectIdLike(req.params?.id)) return req.params.id;
  if (!body || typeof body !== "object") return null;

  const candidates = [
    body.data, body.order, body.invoice, body.payment, body.customer, body.garment,
    body.work, body.tailor, body.cuttingMaster, body.storeKeeper, body.aariWorker,
    body.embroideryWorker, body.helper, body.user, body.appointment, body.notification,
    body.transaction, body.item, body.category, body.fabric, body,
  ];
  for (const candidate of candidates) {
    if (candidate?._id) return candidate._id;
  }
  return null;
};

const redactSensitive = (value) => {
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (!value || typeof value !== "object") return value;
  const clone = {};
  for (const [key, val] of Object.entries(value)) {
    clone[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? "[REDACTED]" : val;
  }
  return clone;
};

/**
 * Call once per request, right after req.user is set (see protect() in
 * auth.middleware.js). Wraps res.json so that, once a mutating request from
 * an ADMIN-role user succeeds (2xx), an AuditLog entry is fired off after
 * the response has already been sent — this can never delay or fail the
 * actual request, even if audit logging itself errors.
 */
export const attachAuditLogging = (req, res) => {
  if (!METHOD_ACTION[req.method]) return; // GET / HEAD / OPTIONS — read-only, nothing to log
  if (req.user?.role !== "ADMIN") return; // scoped to admin accountability, per the current requirement

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const result = originalJson(body);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      const entityType = entityTypeFromBaseUrl(req.baseUrl);
      const entityId = extractEntityId(req, body);

      if (entityId) {
        const actionVerb = deriveActionVerb(req);
        logAction(req, {
          action: `${actionVerb}_${entityType.toUpperCase()}`,
          entityType,
          entityId,
          description: `${req.user?.name || "Admin"} (${req.user?.email || req.user?.phone || "unknown"}) — ${req.method} ${req.originalUrl}`,
          newData: req.method !== "DELETE" ? redactSensitive(req.body) : undefined,
        }).catch(() => {});
      }
    }

    return result;
  };
};
