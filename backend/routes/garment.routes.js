// import express from "express";
// import multer from "multer";
// import {
//   createGarment,
//   getGarmentById,
//   getGarmentsByOrder,
//   updateGarment,
//   deleteGarment,
//   updateGarmentImages,
//   deleteGarmentImage,
  
// } from "../controllers/garment.controller.js";
// import { protect, authorize } from "../middleware/auth.middleware.js";

// const router = express.Router();

// // ✅ Multer Memory Storage (Required for R2/S3 upload buffer)
// const upload = multer({ 
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });

// // Debug middleware
// router.use((req, res, next) => {
//   console.log(`📡 Garment Route: ${req.method} ${req.originalUrl}`);
//   next();
// });

// // All routes require authentication
// router.use(protect);

// /**
//  * @route   POST /api/garments/order/:orderId
//  * @desc    Create garment with 3-type image support
//  * @access  Admin, Store Keeper
//  */
// router.post(
//   "/order/:orderId",
//   authorize("ADMIN", "STORE_KEEPER"),
//   upload.fields([
//     { name: "referenceImages", maxCount: 5 },      // Studio refs
//     { name: "customerImages", maxCount: 5 },       // Digital refs
//     { name: "customerClothImages", maxCount: 5 },  // Physical cloth photos
//   ]),
//   createGarment
// );

// /**
//  * @route   GET /api/garments/order/:orderId
//  * @desc    Get all garments for an order (Cutting Master needs this)
//  */
// router.get("/order/:orderId", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getGarmentsByOrder);

// /**
//  * @route   GET /api/garments/:id
//  * @desc    Get detailed garment info including measurements
//  */
// router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getGarmentById);

// /**
//  * @route   PUT /api/garments/:id
//  * @desc    Update text data (name, priority, price)
//  */
// router.put("/:id", authorize("ADMIN", "STORE_KEEPER"), updateGarment);

// /**
//  * @route   PATCH /api/garments/:id/images
//  * @desc    Add new images to existing garment
//  */
// router.patch(
//   "/:id/images",
//   authorize("ADMIN", "STORE_KEEPER"),
//   upload.fields([
//     { name: "referenceImages", maxCount: 5 },
//     { name: "customerImages", maxCount: 5 },
//     { name: "customerClothImages", maxCount: 5 },
//   ]),
//   updateGarmentImages
// );

// /**
//  * @route   DELETE /api/garments/:id/images
//  * @desc    Delete specific image from R2 and DB
//  */
// router.delete("/:id/images", authorize("ADMIN", "STORE_KEEPER"), deleteGarmentImage);

// /**
//  * @route   DELETE /api/garments/:id
//  * @desc    Soft delete garment
//  * @access  Admin (Restricted to Admin for safety)
//  */
// router.delete("/:id", authorize("ADMIN"), deleteGarment);

// export default router;
import express from "express";
import multer from "multer";
import {
  createGarment,
  getGarmentById,
  getGarmentsByOrder,
  updateGarment,
  deleteGarment,
  updateGarmentImages,
  deleteGarmentImage,
  getCustomerOrderDates,
   getDeliveryDates,
} from "../controllers/garment.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ Multer Memory Storage (Required for R2/S3 upload buffer)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Debug middleware
router.use((req, res, next) => {
  console.log(`📡 Garment Route: ${req.method} ${req.originalUrl}`);
  next();
});

// All routes require authentication
router.use(protect);

// ============================================
// 🟢 NEW: Customer Order Dates Route (for garment calendar)
// ============================================

/**
 * @route   GET /api/garments/customer/:customerId/order-dates
 * @desc    Get dates where customer has orders (for calendar green dots)
 * @access  Admin, Store Keeper, Cutting Master
 * 
 * 📝 Example: /api/garments/customer/67c9d8f4b3a2c1d5e6f7g8h9/order-dates?month=2&year=2026
 */
router.get(
  "/customer/:customerId/order-dates",
  authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"),
  getCustomerOrderDates
);






// 📅 Get all delivery dates for calendar
router.get('/delivery-dates', getDeliveryDates);

// ============================================
// 📦 Existing Garment Routes
// ============================================

/**
 * @route   POST /api/garments/order/:orderId
 * @desc    Create garment with 3-type image support
 * @access  Admin, Store Keeper
 */
router.post(
  "/order/:orderId",
  authorize("ADMIN", "STORE_KEEPER"),
  upload.fields([
    { name: "referenceImages", maxCount: 5 },      // Studio refs
    { name: "customerImages", maxCount: 5 },       // Digital refs
    { name: "customerClothImages", maxCount: 5 },  // Physical cloth photos
  ]),
  createGarment
);

/**
 * @route   GET /api/garments/order/:orderId
 * @desc    Get all garments for an order (Cutting Master needs this)
 */
router.get(
  "/order/:orderId", 
  authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), 
  getGarmentsByOrder
);

/**
 * @route   GET /api/garments/:id
 * @desc    Get detailed garment info including measurements
 */
router.get(
  "/:id", 
  authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), 
  getGarmentById
);

/**
 * @route   PUT /api/garments/:id
 * @desc    Update text data and images for garment
 */
router.put(
  "/:id", 
  authorize("ADMIN", "STORE_KEEPER"),
  upload.fields([
    { name: "referenceImages", maxCount: 5 },
    { name: "customerImages", maxCount: 5 },
    { name: "customerClothImages", maxCount: 5 },
  ]),
  updateGarment
);

/**
 * @route   PATCH /api/garments/:id/images
 * @desc    Add new images to existing garment
 */
router.patch(
  "/:id/images",
  authorize("ADMIN", "STORE_KEEPER"),
  upload.fields([
    { name: "referenceImages", maxCount: 5 },
    { name: "customerImages", maxCount: 5 },
    { name: "customerClothImages", maxCount: 5 },
  ]),
  updateGarmentImages
);

/**
 * @route   DELETE /api/garments/:id/images
 * @desc    Delete specific image from R2 and DB
 */
router.delete(
  "/:id/images", 
  authorize("ADMIN", "STORE_KEEPER"), 
  deleteGarmentImage
);

/**
 * @route   DELETE /api/garments/:id
 * @desc    Soft delete garment
 * @access  Admin (Restricted to Admin for safety)
 */
router.delete(
  "/:id", 
  authorize("ADMIN"), 
  deleteGarment
);

export default router;