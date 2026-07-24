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
      userEmail: req.user?.email || req.user?.phone || "",
      userName: req.user?.name || "",
      userRole: req.user?.role || "",
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

/**
 * General-purpose audit log entry, for actions other than soft-deletion
 * (e.g. LOGIN). Distinct accounts (such as an Internal Admin account used
 * alongside the client's own Admin account) are naturally distinguishable
 * afterwards since every entry records the specific `user` who performed it.
 */
export const logAction = async (req, { action, entityType, entityId, description, previousData, newData, actorId, actorEmail, actorName, actorRole }) => {
  try {
    // actorId/actorEmail/actorName/actorRole let callers record who performed
    // the action when req.user isn't set yet — e.g. login, where the acting
    // identity IS the entity being authenticated, not an already-authenticated
    // request.
    const userId = actorId || req.user?._id || req.user?.id;
    const userEmail = actorEmail || req.user?.email || req.user?.phone || "";
    const userName = actorName || req.user?.name || "";
    const userRole = actorRole || req.user?.role || "";
    if (!userId || !entityId) return;

    await AuditLog.create({
      action,
      user: userId,
      userEmail,
      userName,
      userRole,
      entityType,
      entityId,
      description,
      previousData,
      newData,
      ipAddress: req.ip || "",
      userAgent: req.get ? req.get("user-agent") : ""
    });
    console.log(`📝 [Audit] Logged ${action} on ${entityType} (ID: ${entityId}) by User ${userId}`);
  } catch (error) {
    console.error(`❌ Audit logger error for action ${action}:`, error.message);
  }
};
