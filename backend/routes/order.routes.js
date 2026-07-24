// import express from "express";
// import {
//   createOrder,
//   getAllOrders,
//   getOrderById,
//   updateOrder,
//   updateOrderStatus,
//   deleteOrder,
//   getOrderStats,
//   // ✅ New: Get orders by customer
//   getOrdersByCustomer,
//   // ✅ Payment-related functions
//   addPaymentToOrder,
//   getOrderPayments,
//   // ✅ Dashboard function
//   getDashboardData
// } from "../controllers/order.controller.js";
// import { protect, authorize } from "../middleware/auth.middleware.js";

// const router = express.Router();

// // Debug middleware to track API hits
// router.use((req, res, next) => {
//   console.log(`📡 Order Route: ${req.method} ${req.originalUrl}`);
//   console.log(`   User Role: ${req.user?.role || 'Not authenticated'}`);
//   next();
// });

// // ============================================
// // 🔒 ALL ROUTES ARE PROTECTED
// // ============================================
// router.use(protect);

// // ============================================
// // 📊 STATS & DASHBOARD
// // ============================================

// /**
//  * @route   GET /api/orders/stats
//  * @desc    Get order statistics
//  * @access  Admin, Store Keeper, Cutting Master (VIEW)
//  */
// router.get("/stats", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getOrderStats);

// /**
//  * @route   GET /api/orders/dashboard
//  * @desc    Get dashboard data (today's orders, pending deliveries, collection)
//  * @access  Admin, Store Keeper
//  */
// router.get("/dashboard", authorize("ADMIN", "STORE_KEEPER"), getDashboardData);

// // ============================================
// // 📋 MAIN ORDER ROUTES
// // ============================================

// /**
//  * @route   POST /api/orders
//  * @desc    Create new order (with optional payments)
//  * @access  Admin, Store Keeper ONLY
//  */
// router.post("/", authorize("ADMIN", "STORE_KEEPER"), createOrder);

// /**
//  * @route   GET /api/orders
//  * @desc    Get all orders with filters
//  * @access  Admin, Store Keeper, Cutting Master (VIEW)
//  */
// router.get("/", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAllOrders);

// // ============================================
// // 👤 CUSTOMER-SPECIFIC ORDER ROUTES
// // ============================================

// /**
//  * @route   GET /api/orders/customer/:customerId
//  * @desc    Get all orders for a specific customer
//  * @access  Admin, Store Keeper, Cutting Master (VIEW)
//  */
// router.get("/customer/:customerId", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getOrdersByCustomer);

// // ============================================
// // 💰 PAYMENT ROUTES (Specific to order)
// // ============================================

// /**
//  * @route   POST /api/orders/:id/payments
//  * @desc    Add payment to existing order
//  * @access  Admin, Store Keeper ONLY
//  */
// router.post("/:id/payments", authorize("ADMIN", "STORE_KEEPER"), addPaymentToOrder);

// /**
//  * @route   GET /api/orders/:id/payments
//  * @desc    Get all payments for an order
//  * @access  Admin, Store Keeper, Cutting Master (VIEW ONLY)
//  */
// router.get("/:id/payments", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getOrderPayments);

// // ============================================
// // 🔍 SINGLE ORDER OPERATIONS
// // ============================================

// /**
//  * @route   GET /api/orders/:id
//  * @desc    Get specific order details (includes payments & works)
//  * @access  Admin, Store Keeper, Cutting Master (VIEW)
//  */
// router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getOrderById);

// /**
//  * @route   PUT /api/orders/:id
//  * @desc    Update order details (delivery date, notes, add garments)
//  * @access  Admin, Store Keeper ONLY
//  */
// router.put("/:id", authorize("ADMIN", "STORE_KEEPER"), updateOrder);

// /**
//  * @route   PATCH /api/orders/:id/status
//  * @desc    Update order status only
//  * @access  Admin, Store Keeper ONLY
//  */
// router.patch("/:id/status", authorize("ADMIN", "STORE_KEEPER"), updateOrderStatus);

// /**
//  * @route   DELETE /api/orders/:id
//  * @desc    Delete order (soft delete)
//  * @access  Admin ONLY
//  */
// router.delete("/:id", authorize("ADMIN"), deleteOrder);

// export default router;







// // routes/order.routes.js
// import express from "express";
// import {
//   // Order CRUD operations
//   createOrder,
//   getAllOrders,
//   getOrderById,
//   updateOrder,
//   updateOrderStatus,
//   deleteOrder,
//   getOrderDates,
  
//   // Customer & Payment related
//   getOrdersByCustomer,
//   addPaymentToOrder,
//   getOrderPayments,

  
//   // ===== ONLY THESE TWO FOR ADMIN DASHBOARD =====
//   getOrderStatsForDashboard,  // For pie chart & KPI cards (GET /api/orders/stats)
//   getRecentOrders      ,      // For recent orders table (GET /api/orders/recent)
  
// } from "../controllers/order.controller.js";
// import { protect, authorize } from "../middleware/auth.middleware.js";

// const router = express.Router();

// // Debug middleware
// router.use((req, res, next) => {
//   console.log(`📡 Order Route: ${req.method} ${req.originalUrl}`);
//   console.log(`   Query params:`, req.query);
//   next();
// });

// // ============================================
// // 🔒 ALL ROUTES ARE PROTECTED
// // ============================================
// router.use(protect);

// // ============================================
// // 📊 ADMIN DASHBOARD ROUTES (What your frontend needs)
// // ============================================

// /**
//  * @route   GET /api/orders/stats
//  * @desc    Get order statistics with date filters (for pie chart and KPI cards)
//  * @query   ?period=today|week|month&startDate=...&endDate=...
//  * @access  Admin, Store Keeper, Cutting Master
//  * 
//  * Your frontend calls: fetchOrderStats(params)
//  * Example: /api/orders/stats?period=month
//  */
// router.get("/stats", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getOrderStatsForDashboard);

// /**
//  * @route   GET /api/orders/recent
//  * @desc    Get recent orders with date filters (for recent orders table)
//  * @query   ?period=today|week|month&startDate=...&endDate=...&limit=10
//  * @access  Admin, Store Keeper, Cutting Master
//  * 
//  * Your frontend calls: fetchRecentOrders({ ...params, limit: 10 })
//  * Example: /api/orders/recent?period=month&limit=10
//  */
// router.get("/recent", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getRecentOrders);

// // ============================================
// // 📋 OTHER ORDER ROUTES (Keep for other pages)
// // ============================================

// /**
//  * @route   POST /api/orders
//  * @desc    Create new order
//  * @access  Admin, Store Keeper ONLY
//  */
// router.post("/", authorize("ADMIN", "STORE_KEEPER"), createOrder);

// /**
//  * @route   GET /api/orders
//  * @desc    Get all orders (for orders list page)
//  * @access  Admin, Store Keeper, Cutting Master
//  */
// router.get("/", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAllOrders);

// /**
//  * @route   GET /api/orders/customer/:customerId
//  * @desc    Get orders by customer
//  * @access  Admin, Store Keeper, Cutting Master
//  */
// router.get("/customer/:customerId", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getOrdersByCustomer);


// // ============================================
// // ✅ DELIVERY CALENDAR ROUTES
// // ============================================
// // ✅ SIMPLE: Get dates that have orders (for green dots)
// router.get('/order-dates', protect, getOrderDates);

// /**
//  * @route   POST /api/orders/:id/payments
//  * @desc    Add payment
//  * @access  Admin, Store Keeper ONLY
//  */
// router.post("/:id/payments", authorize("ADMIN", "STORE_KEEPER"), addPaymentToOrder);

// /**
//  * @route   GET /api/orders/:id/payments
//  * @desc    Get order payments
//  * @access  Admin, Store Keeper, Cutting Master
//  */
// router.get("/:id/payments", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getOrderPayments);

// /**
//  * @route   GET /api/orders/:id
//  * @desc    Get order by ID
//  * @access  Admin, Store Keeper, Cutting Master
//  */
// router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getOrderById);

// /**
//  * @route   PUT /api/orders/:id
//  * @desc    Update order
//  * @access  Admin, Store Keeper ONLY
//  */
// router.put("/:id", authorize("ADMIN", "STORE_KEEPER"), updateOrder);

// /**
//  * @route   PATCH /api/orders/:id/status
//  * @desc    Update order status
//  * @access  Admin, Store Keeper ONLY
//  */
// router.patch("/:id/status", authorize("ADMIN", "STORE_KEEPER"), updateOrderStatus);

// /**
//  * @route   DELETE /api/orders/:id
//  * @desc    Delete order
//  * @access  Admin ONLY
//  */
// router.delete("/:id", authorize("ADMIN"), deleteOrder);








// export default router;








// routes/order.routes.js
import express from "express";
import multer from "multer";
import {
  // Order CRUD operations
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderDates,
    getDeliveryDatesForCalendar,
  getSimpleDeliveryDates,
  // Customer & Payment related
  getOrdersByCustomer,
  addPaymentToOrder,
  getOrderPayments,

  
  // ===== ONLY THESE TWO FOR ADMIN DASHBOARD =====
  getOrderStats,  // For pie chart & KPI cards (GET /api/orders/stats)
  getRecentOrders      ,      // For recent orders table (GET /api/orders/recent)
  getDashboardData, // Add dashboard data

  // Draft Orders
  createDraft,
  updateDraft,
  listDrafts,
  getDraftById,
  deleteDraft,
  duplicateDraft,
  convertDraft,

} from "../controllers/order.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

// 🔥 FIX: Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`📡 Order Route: ${req.method} ${req.originalUrl}`);
  console.log(`   Query params:`, req.query);
  next();
});

// ============================================
// 🔒 ALL ROUTES ARE PROTECTED
// ============================================
router.use(protect);

// ============================================
// 📊 ADMIN DASHBOARD ROUTES
// ============================================

/**
 * @route   GET /api/orders/stats
 * @desc    Get order statistics with date filters
 * @query   ?period=today|week|month&startDate=...&endDate=...
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/stats", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getOrderStats);

/**
 * @route   GET /api/orders/recent
 * @desc    Get recent orders with date filters
 * @query   ?period=today|week|month&startDate=...&endDate=...&limit=10
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/recent", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getRecentOrders);

/**
 * @route   GET /api/orders/dashboard
 * @desc    Get dashboard data
 * @access  Admin, Store Keeper
 */
router.get("/dashboard", authorize("ADMIN", "STORE_KEEPER"), getDashboardData);

// ============================================
// 📋 ORDER CRUD ROUTES (WITH IMAGE UPLOAD)
// ============================================

/**
 * @route   POST /api/orders
 * @desc    Create new order with images
 * @access  Admin, Store Keeper ONLY
 * 
 * 🔥 FIX: Added upload.array('images') to handle multiple file uploads
 * The frontend sends files with fieldname 'images' or 'garments[0].referenceImages' etc.
 */
router.post(
  "/", 
  authorize("ADMIN", "STORE_KEEPER"),
  upload.any(), // 🔥 CRITICAL: This handles any file fields in the request
  (req, res, next) => {
    console.log("📸 Files received in route:", req.files?.length || 0);
    if (req.files && req.files.length > 0) {
      console.log("First file example:", {
        fieldname: req.files[0].fieldname,
        originalname: req.files[0].originalname,
        mimetype: req.files[0].mimetype,
        size: req.files[0].size
      });
    }
    next();
  },
  createOrder
);

/**
 * @route   GET /api/orders
 * @desc    Get all orders (for orders list page)
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getAllOrders);

/**
 * @route   GET /api/orders/customer/:customerId
 * @desc    Get orders by customer
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/customer/:customerId", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getOrdersByCustomer);

// ============================================
// ✅ DELIVERY CALENDAR ROUTES
// ============================================



// ============================================
// ✅ SPECIFIC ROUTES FIRST (before :id)
// ============================================

// 📅 Get delivery dates for calendar
router.get('/delivery-dates', getSimpleDeliveryDates);  // 🔥 For frontend calendar

// Or use the detailed version
router.get('/delivery-calendar', getDeliveryDatesForCalendar);


/**
 * @route   GET /api/orders/order-dates
 * @desc    Get dates that have orders (for green dots)
 * @query   ?month=2&year=2026
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get('/order-dates', protect, getOrderDates);

// ============================================
// 💰 PAYMENT ROUTES
// ============================================

/**
 * @route   POST /api/orders/:id/payments
 * @desc    Add payment
 * @access  Admin, Store Keeper ONLY
 */
router.post("/:id/payments", authorize("ADMIN", "STORE_KEEPER"), addPaymentToOrder);

/**
 * @route   GET /api/orders/:id/payments
 * @desc    Get order payments
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/:id/payments", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getOrderPayments);

// ============================================
// 📝 DRAFT ORDER ROUTES
// 🔥 MUST be registered before the generic "/:id" routes below — Express
// matches path segments in registration order, and a 1-segment "/drafts"
// route would otherwise be swallowed by "/:id" (id === "drafts").
// ============================================
router.get("/drafts", authorize("ADMIN", "STORE_KEEPER"), listDrafts);
router.post("/drafts", authorize("ADMIN", "STORE_KEEPER"), createDraft);
router.get("/drafts/:id", authorize("ADMIN", "STORE_KEEPER"), getDraftById);
router.put("/drafts/:id", authorize("ADMIN", "STORE_KEEPER"), updateDraft);
router.delete("/drafts/:id", authorize("ADMIN", "STORE_KEEPER"), deleteDraft);
router.post("/drafts/:id/duplicate", authorize("ADMIN", "STORE_KEEPER"), duplicateDraft);
router.post("/drafts/:id/convert", authorize("ADMIN", "STORE_KEEPER"), upload.any(), convertDraft);

// ============================================
// 🔍 SINGLE ORDER ROUTES
// ============================================

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getOrderById);

/**
 * @route   PUT /api/orders/:id
 * @desc    Update order (without images for now)
 * @access  Admin, Store Keeper ONLY
 */
router.put("/:id", authorize("ADMIN", "STORE_KEEPER"), updateOrder);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status
 * @access  Admin, Store Keeper ONLY
 */
router.patch("/:id/status", authorize("ADMIN", "STORE_KEEPER"), updateOrderStatus);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete order
 * @access  Admin ONLY
 */
router.delete("/:id", authorize("ADMIN"), deleteOrder);

export default router;