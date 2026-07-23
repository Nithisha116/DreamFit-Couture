// backend/routes/auditLog.routes.js
import express from "express";
import { getAuditLogs, getAuditLogFilterOptions } from "../controllers/auditLog.controller.js";
import { protect, requireInternalAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication AND the isInternalAdmin flag — the
// client's own ADMIN account gets a 403 "Access Denied" here even though it
// shares the ADMIN role.
router.use(protect);
router.use(requireInternalAdmin);

/**
 * @route   GET /api/audit-logs
 * @desc    List audit log entries (pagination, search, filters)
 * @access  Internal Admin only
 */
router.get("/", getAuditLogs);

/**
 * @route   GET /api/audit-logs/filters
 * @desc    Distinct action/entityType/role values for building filter dropdowns
 * @access  Internal Admin only
 */
router.get("/filters", getAuditLogFilterOptions);

export default router;
