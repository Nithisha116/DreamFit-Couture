// import express from "express";
// import {
//   createHelper,
//   getAllHelpers,
//   getHelperById,
//   updateHelper,
//   deleteHelper,
//   updateLeaveStatus,
//   getHelperStats
// } from "../controllers/helper.controller.js";
// import { protect, authorize } from "../middleware/auth.middleware.js";

// const router = express.Router();

// // Debug middleware
// router.use((req, res, next) => {
//   console.log(`📡 Helper Route: ${req.method} ${req.originalUrl}`);
//   next();
// });

// // All routes require authentication
// router.use(protect);

// /**
//  * @route   POST /api/helpers
//  * @desc    Create new helper
//  * @access  Admin, Store Keeper
//  */
// router.post("/", authorize("ADMIN", "STORE_KEEPER"), createHelper);

// /**
//  * @route   GET /api/helpers/stats
//  * @desc    Get helper statistics
//  * @access  Admin, Store Keeper, Cutting Master
//  */
// router.get("/stats", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getHelperStats);

// /**
//  * @route   GET /api/helpers
//  * @desc    Get all helpers
//  * @access  Admin, Store Keeper, Cutting Master
//  */
// router.get("/", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAllHelpers);

// /**
//  * @route   GET /api/helpers/:id
//  * @desc    Get helper by ID
//  * @access  Admin, Store Keeper, Cutting Master, Helper (self)
//  */
// router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), getHelperById);

// /**
//  * @route   PUT /api/helpers/:id
//  * @desc    Update helper
//  * @access  Admin, Store Keeper, Helper (self - limited fields)
//  */
// router.put("/:id", authorize("ADMIN", "STORE_KEEPER", "TAILOR"), updateHelper);

// /**
//  * @route   PATCH /api/helpers/:id/leave
//  * @desc    Update leave status
//  * @access  Admin, Store Keeper, Cutting Master, Helper (self)
//  */
// router.patch("/:id/leave", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), updateLeaveStatus);

// /**
//  * @route   DELETE /api/helpers/:id
//  * @desc    Delete helper
//  * @access  Admin
//  */
// router.delete("/:id", authorize("ADMIN"), deleteHelper);

// export default router;






import express from "express";
import {
  createHelper,
  getAllHelpers,
  getHelperById,
  updateHelper,
  deleteHelper,
  updateLeaveStatus,
  getHelperStats,
  // ✅ NEW: Import dashboard functions
  getTopHelpers,
  getHelperPerformance,
  fixAllHelperStats
} from "../controllers/helper.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`📡 Helper Route: ${req.method} ${req.originalUrl}`);
  next();
});

// All routes require authentication
router.use(protect);

// ============================================
// ✅ DASHBOARD ROUTES (NEW)
// ============================================

/**
 * @route   GET /api/helpers/stats
 * @desc    Get helper statistics for dashboard cards
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/stats", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getHelperStats);

/**
 * @route   GET /api/helpers/top
 * @desc    Get top performing helpers for dashboard
 * @query   ?limit=5&period=month
 * @access  Admin, Store Keeper
 */
router.get("/top", authorize("ADMIN", "STORE_KEEPER"), getTopHelpers);

/**
 * @route   GET /api/helpers/performance
 * @desc    Get helper performance data for dashboard
 * @query   ?period=month&helperId=...
 * @access  Admin, Store Keeper
 */
router.get("/performance", authorize("ADMIN", "STORE_KEEPER"), getHelperPerformance);

// ============================================
// ✅ ADMIN UTILITY ROUTES
// ============================================

/**
 * @route   POST /api/helpers/fix-stats
 * @desc    Fix all helper stats (admin only)
 * @access  Admin
 */
router.post("/fix-stats", authorize("ADMIN"), fixAllHelperStats);

// ============================================
// ✅ MAIN TAILOR ROUTES
// ============================================

/**
 * @route   POST /api/helpers
 * @desc    Create new helper
 * @access  Admin, Store Keeper
 */
router.post("/", authorize("ADMIN", "STORE_KEEPER"), createHelper);

/**
 * @route   GET /api/helpers
 * @desc    Get all helpers (with filters)
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAllHelpers);

// ============================================
// ✅ DYNAMIC ROUTES (with :id)
// ============================================

/**
 * @route   GET /api/helpers/:id
 * @desc    Get helper by ID
 * @access  Admin, Store Keeper, Cutting Master, Helper (self)
 */
router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), getHelperById);

/**
 * @route   PUT /api/helpers/:id
 * @desc    Update helper
 * @access  Admin, Store Keeper, Helper (self - limited fields)
 */
router.put("/:id", authorize("ADMIN", "STORE_KEEPER", "TAILOR"), updateHelper);

/**
 * @route   PATCH /api/helpers/:id/leave
 * @desc    Update leave status
 * @access  Admin, Store Keeper, Cutting Master, Helper (self)
 */
router.patch("/:id/leave", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), updateLeaveStatus);

/**
 * @route   DELETE /api/helpers/:id
 * @desc    Delete helper (soft delete)
 * @access  Admin
 */
router.delete("/:id", authorize("ADMIN"), deleteHelper);

export default router;