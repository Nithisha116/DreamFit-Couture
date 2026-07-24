// backend/controllers/auditLog.controller.js
//
// Read-only listing for the Internal Activity Log. Access is enforced by
// requireInternalAdmin (see routes/auditLog.routes.js) — this controller
// assumes that's already been checked.
import AuditLog from "../models/AuditLog.js";

// @desc    List audit log entries with pagination, search, and filters
// @route   GET /api/audit-logs
// @access  Private (Internal Admin only)
export const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search,
      action,
      entityType,
      userEmail,
      userRole,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (userRole) query.userRole = userRole;
    if (userEmail) query.userEmail = { $regex: userEmail, $options: "i" };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    if (search) {
      const regex = { $regex: search, $options: "i" };
      query.$or = [
        { action: regex },
        { entityType: regex },
        { description: regex },
        { userEmail: regex },
        { userName: regex },
      ];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 25, 1), 200);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching audit logs:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
  }
};

// @desc    Distinct filter option values (actions/entity types/roles seen so far)
// @route   GET /api/audit-logs/filters
// @access  Private (Internal Admin only)
export const getAuditLogFilterOptions = async (req, res) => {
  try {
    const [actions, entityTypes, roles] = await Promise.all([
      AuditLog.distinct("action"),
      AuditLog.distinct("entityType"),
      AuditLog.distinct("userRole"),
    ]);
    res.json({
      success: true,
      actions: actions.filter(Boolean).sort(),
      entityTypes: entityTypes.filter(Boolean).sort(),
      roles: roles.filter(Boolean).sort(),
    });
  } catch (error) {
    console.error("❌ Error fetching audit log filter options:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch filter options" });
  }
};
