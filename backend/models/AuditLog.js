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
  entityType: { 
    type: String, 
    required: true, 
    enum: ["Invoice", "Order", "Payment"],
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
  previousData: { 
    type: mongoose.Schema.Types.Mixed 
  },
  newData: { 
    type: mongoose.Schema.Types.Mixed 
  }
}, { 
  timestamps: true 
});

// Compound indexes for rapid developer lookup
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
