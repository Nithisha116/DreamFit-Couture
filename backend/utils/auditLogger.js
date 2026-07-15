import AuditLog from "../models/AuditLog.js";

export const logDeletion = async (req, action, entityType, entity, previousData) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      console.warn(`⚠️ Warning: Deletion log attempted without authenticated user context for ${entityType} ID: ${entity._id}`);
      return;
    }

    const docObj = previousData && typeof previousData.toObject === 'function' 
      ? previousData.toObject() 
      : previousData || {};

    await AuditLog.create({
      action,
      user: userId,
      entityType,
      entityId: entity._id,
      description: `Soft-deleted ${entityType} document (ID: ${entity._id})`,
      previousData: docObj,
      ipAddress: req.ip || "",
      userAgent: req.get ? req.get("user-agent") : ""
    });
    console.log(`📝 [Audit] Logged deletion of ${entityType} (ID: ${entity._id}) by User ${userId}`);
  } catch (error) {
    console.error(`❌ Audit logger error for ${entityType} deletion:`, error.message);
  }
};
