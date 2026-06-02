// import express from "express";
// import {
//   createEmbroideryWorker,
//   getAllEmbroideryWorkers,
//   getEmbroideryWorkerById,
//   updateEmbroideryWorker,
//   deleteEmbroideryWorker,
//   updateLeaveStatus,
//   getEmbroideryWorkerStats
// } from "../controllers/embroideryWorker.controller.js";
// import { protect, authorize } from "../middleware/auth.middleware.js";

// const router = express.Router();

// // Debug middleware
// router.use((req, res, next) => {
//   console.log(`📡 EmbroideryWorker Route: ${req.method} ${req.originalUrl}`);
//   next();
// });

// // All routes require authentication
// router.use(protect);

// /**
//  * @route   POST /api/embroideryWorkers
//  * @desc    Create new embroideryWorker
//  * @access  Admin, Store Keeper
//  */
// router.post("/", authorize("ADMIN", "STORE_KEEPER"), createEmbroideryWorker);

// /**
//  * @route   GET /api/embroideryWorkers/stats
//  * @desc    Get embroideryWorker statistics
//  * @access  Admin, Store Keeper, Cutting Master
//  */
// router.get("/stats", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getEmbroideryWorkerStats);

// /**
//  * @route   GET /api/embroideryWorkers
//  * @desc    Get all embroideryWorkers
//  * @access  Admin, Store Keeper, Cutting Master
//  */
// router.get("/", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAllEmbroideryWorkers);

// /**
//  * @route   GET /api/embroideryWorkers/:id
//  * @desc    Get embroideryWorker by ID
//  * @access  Admin, Store Keeper, Cutting Master, EmbroideryWorker (self)
//  */
// router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), getEmbroideryWorkerById);

// /**
//  * @route   PUT /api/embroideryWorkers/:id
//  * @desc    Update embroideryWorker
//  * @access  Admin, Store Keeper, EmbroideryWorker (self - limited fields)
//  */
// router.put("/:id", authorize("ADMIN", "STORE_KEEPER", "TAILOR"), updateEmbroideryWorker);

// /**
//  * @route   PATCH /api/embroideryWorkers/:id/leave
//  * @desc    Update leave status
//  * @access  Admin, Store Keeper, Cutting Master, EmbroideryWorker (self)
//  */
// router.patch("/:id/leave", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), updateLeaveStatus);

// /**
//  * @route   DELETE /api/embroideryWorkers/:id
//  * @desc    Delete embroideryWorker
//  * @access  Admin
//  */
// router.delete("/:id", authorize("ADMIN"), deleteEmbroideryWorker);

// export default router;






import express from "express";
import {
  createEmbroideryWorker,
  getAllEmbroideryWorkers,
  getEmbroideryWorkerById,
  updateEmbroideryWorker,
  deleteEmbroideryWorker,
  updateLeaveStatus,
  getEmbroideryWorkerStats,
  // ✅ NEW: Import dashboard functions
  getTopEmbroideryWorkers,
  getEmbroideryWorkerPerformance,
  fixAllEmbroideryWorkerStats
} from "../controllers/embroideryWorker.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`📡 EmbroideryWorker Route: ${req.method} ${req.originalUrl}`);
  next();
});

// All routes require authentication
router.use(protect);

// ============================================
// ✅ DASHBOARD ROUTES (NEW)
// ============================================

/**
 * @route   GET /api/embroideryWorkers/stats
 * @desc    Get embroideryWorker statistics for dashboard cards
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/stats", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getEmbroideryWorkerStats);

/**
 * @route   GET /api/embroideryWorkers/top
 * @desc    Get top performing embroideryWorkers for dashboard
 * @query   ?limit=5&period=month
 * @access  Admin, Store Keeper
 */
router.get("/top", authorize("ADMIN", "STORE_KEEPER"), getTopEmbroideryWorkers);

/**
 * @route   GET /api/embroideryWorkers/performance
 * @desc    Get embroideryWorker performance data for dashboard
 * @query   ?period=month&embroideryWorkerId=...
 * @access  Admin, Store Keeper
 */
router.get("/performance", authorize("ADMIN", "STORE_KEEPER"), getEmbroideryWorkerPerformance);

// ============================================
// ✅ ADMIN UTILITY ROUTES
// ============================================

/**
 * @route   POST /api/embroideryWorkers/fix-stats
 * @desc    Fix all embroideryWorker stats (admin only)
 * @access  Admin
 */
router.post("/fix-stats", authorize("ADMIN"), fixAllEmbroideryWorkerStats);

// ============================================
// ✅ MAIN TAILOR ROUTES
// ============================================

/**
 * @route   POST /api/embroideryWorkers
 * @desc    Create new embroideryWorker
 * @access  Admin, Store Keeper
 */
router.post("/", authorize("ADMIN", "STORE_KEEPER"), createEmbroideryWorker);

/**
 * @route   GET /api/embroideryWorkers
 * @desc    Get all embroideryWorkers (with filters)
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAllEmbroideryWorkers);

// ============================================
// ✅ DYNAMIC ROUTES (with :id)
// ============================================

/**
 * @route   GET /api/embroideryWorkers/:id
 * @desc    Get embroideryWorker by ID
 * @access  Admin, Store Keeper, Cutting Master, EmbroideryWorker (self)
 */
router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), getEmbroideryWorkerById);

/**
 * @route   PUT /api/embroideryWorkers/:id
 * @desc    Update embroideryWorker
 * @access  Admin, Store Keeper, EmbroideryWorker (self - limited fields)
 */
router.put("/:id", authorize("ADMIN", "STORE_KEEPER", "TAILOR"), updateEmbroideryWorker);

/**
 * @route   PATCH /api/embroideryWorkers/:id/leave
 * @desc    Update leave status
 * @access  Admin, Store Keeper, Cutting Master, EmbroideryWorker (self)
 */
router.patch("/:id/leave", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER", "TAILOR"), updateLeaveStatus);

/**
 * @route   DELETE /api/embroideryWorkers/:id
 * @desc    Delete embroideryWorker (soft delete)
 * @access  Admin
 */
router.delete("/:id", authorize("ADMIN"), deleteEmbroideryWorker);

export default router;