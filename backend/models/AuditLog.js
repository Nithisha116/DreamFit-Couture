import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true,
    index: true 
  }, // e.g. "CREATE_INVOICE", "CANCEL_INVOICE", "LOCK_BYPASS", "COLLECT_PAYMENT"
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  // Snapshot of the acting account's email at the time of the action, so the
  // audit trail stays readable/attributable even if that account is later
  // renamed, deactivated, or deleted.
  userEmail: {
    type: String
  },
  // Snapshot of the acting account's display name/role at the time of the
  // action — same rationale as userEmail (readable/attributable without a
  // live join, and resilient to the account changing later).
  userName: {
    type: String
  },
  userRole: {
    type: String
  },
  entityType: {
    type: String,
    required: true,
    // Intentionally not enum-restricted: this is populated automatically
    // for any admin-mutated resource (see middleware/auditMiddleware.js), so
    // a fixed whitelist would silently drop audit entries for any route not
    // added to the list. Existing values remain valid; this only loosens
    // the constraint going forward.
    index: true
  },
  entityId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    index: true
  },
  description: { 
    type: String, 
    required: true 
  },
  reason: {
    type: String
  },
  previousData: {
    type: mongoose.Schema.Types.Mixed
  },
  newData: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Compound indexes for rapid developer lookup
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
