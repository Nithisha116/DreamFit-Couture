// import express from "express";
// import {
//   createAariWorker,
//   getAllAariWorkers,
//   getAariWorkerById,
//   updateAariWorker,
//   deleteAariWorker,
//   updateLeaveStatus,
//   getAariWorkerStats
// } from "../controllers/aariWorker.controller.js";
// import { protect, authorize } from "../middleware/auth.middleware.js";

// const router = express.Router();

// // Debug middleware
// router.use((req, res, next) => {
//   console.log(`📡 AariWorker Route: ${req.method} ${req.originalUrl}`);
//   next();
// });

// // All routes require authentication
// router.use(protect);

// /**
//  * @route   POST /api/aariWorkers
//  * @desc    Create new aariWorker
//  * @access  Admin, Store Keeper
//  */
// router.post("/", authorize("ADMIN", "STORE_KEEPER"), createAariWorker);

// /**
//  * @route   GET /api/aariWorkers/stats
//  * @desc    Get aariWorker statistics
//  * @access  Admin, Store Keeper, Cutting Master
//  */
// router.get("/stats", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAariWorkerStats);

// /**
//  * @route   GET /api/aariWorkers
//  * @desc    Get all aariWorkers
//  * @access  Admin, Store Keeper, Cutting Master
//  */
// router.get("/", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAllAariWorkers);

// /**
//  * @route   GET /api/aariWorkers/:id
//  * @desc    Get aariWorker by ID
//  * @access  Admin, Store Keeper, Cutting Master, AariWorker (self)
//  */
// router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), getAariWorkerById);

// /**
//  * @route   PUT /api/aariWorkers/:id
//  * @desc    Update aariWorker
//  * @access  Admin, Store Keeper, AariWorker (self - limited fields)
//  */
// router.put("/:id", authorize("ADMIN", "STORE_KEEPER", "TAILOR"), updateAariWorker);

// /**
//  * @route   PATCH /api/aariWorkers/:id/leave
//  * @desc    Update leave status
//  * @access  Admin, Store Keeper, Cutting Master, AariWorker (self)
//  */
// router.patch("/:id/leave", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), updateLeaveStatus);

// /**
//  * @route   DELETE /api/aariWorkers/:id
//  * @desc    Delete aariWorker
//  * @access  Admin
//  */
// router.delete("/:id", authorize("ADMIN"), deleteAariWorker);

// export default router;






import express from "express";
import {
  createAariWorker,
  getAllAariWorkers,
  getAariWorkerById,
  updateAariWorker,
  deleteAariWorker,
  updateLeaveStatus,
  getAariWorkerStats,
  // ✅ NEW: Import dashboard functions
  getTopAariWorkers,
  getAariWorkerPerformance,
  fixAllAariWorkerStats
} from "../controllers/aariWorker.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`📡 AariWorker Route: ${req.method} ${req.originalUrl}`);
  next();
});

// All routes require authentication
router.use(protect);

// ============================================
// ✅ DASHBOARD ROUTES (NEW)
// ============================================

/**
 * @route   GET /api/aariWorkers/stats
 * @desc    Get aariWorker statistics for dashboard cards
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/stats", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAariWorkerStats);

/**
 * @route   GET /api/aariWorkers/top
 * @desc    Get top performing aariWorkers for dashboard
 * @query   ?limit=5&period=month
 * @access  Admin, Store Keeper
 */
router.get("/top", authorize("ADMIN", "STORE_KEEPER"), getTopAariWorkers);

/**
 * @route   GET /api/aariWorkers/performance
 * @desc    Get aariWorker performance data for dashboard
 * @query   ?period=month&aariWorkerId=...
 * @access  Admin, Store Keeper
 */
router.get("/performance", authorize("ADMIN", "STORE_KEEPER"), getAariWorkerPerformance);

// ============================================
// ✅ ADMIN UTILITY ROUTES
// ============================================

/**
 * @route   POST /api/aariWorkers/fix-stats
 * @desc    Fix all aariWorker stats (admin only)
 * @access  Admin
 */
router.post("/fix-stats", authorize("ADMIN"), fixAllAariWorkerStats);

// ============================================
// ✅ MAIN TAILOR ROUTES
// ============================================

/**
 * @route   POST /api/aariWorkers
 * @desc    Create new aariWorker
 * @access  Admin, Store Keeper
 */
router.post("/", authorize("ADMIN", "STORE_KEEPER"), createAariWorker);

/**
 * @route   GET /api/aariWorkers
 * @desc    Get all aariWorkers (with filters)
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAllAariWorkers);

// ============================================
// ✅ DYNAMIC ROUTES (with :id)
// ============================================

/**
 * @route   GET /api/aariWorkers/:id
 * @desc    Get aariWorker by ID
 * @access  Admin, Store Keeper, Cutting Master, AariWorker (self)
 */
router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), getAariWorkerById);

/**
 * @route   PUT /api/aariWorkers/:id
 * @desc    Update aariWorker
 * @access  Admin, Store Keeper, AariWorker (self - limited fields)
 */
router.put("/:id", authorize("ADMIN", "STORE_KEEPER", "TAILOR"), updateAariWorker);

/**
 * @route   PATCH /api/aariWorkers/:id/leave
 * @desc    Update leave status
 * @access  Admin, Store Keeper, Cutting Master, AariWorker (self)
 */
router.patch("/:id/leave", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), updateLeaveStatus);

/**
 * @route   DELETE /api/aariWorkers/:id
 * @desc    Delete aariWorker (soft delete)
 * @access  Admin
 */
router.delete("/:id", authorize("ADMIN"), deleteAariWorker);

export default router;