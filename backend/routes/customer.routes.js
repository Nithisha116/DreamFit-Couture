// // backend/routes/customer.routes.js
// import express from "express";
// import { 
//   // Search functions
//   getCustomerByPhone,
//   getCustomerByCustomerId,
  
//   // Create function
//   createCustomer,
  
//   // List functions
//   getAllCustomers,
//   getCustomersWithPaymentSummary,
  
//   // Single customer function
//   getCustomerById,
  
//   // Update/Delete functions
//   updateCustomer,
//   deleteCustomer,
  
//   // Payment/Order specific functions
//   getCustomerPayments,
//   getCustomerOrders,
//   getCustomerPaymentStats,
//   getCustomerPaymentTrends,
  
//   // Statistics function
//   getCustomerStats,
  
//   // ✅ NEW: Measurement template functions
//   saveMeasurementTemplate,
//   getCustomerTemplates,
//   getTemplateById,
//   updateTemplate,
//   deleteTemplate,
//   useTemplate
  
// } from "../controllers/customer.controller.js";
// import { protect, authorize } from "../middleware/auth.middleware.js";

// console.log("📁 customer.routes.js is loading...");
// console.log("   ✅ All functions imported successfully");

// const router = express.Router();

// // All routes are protected
// router.use(protect);

// // ==================== SEARCH ROUTES ====================

// // 🔍 Search by Phone Number
// router.get("/search/phone/:phone", authorize("ADMIN", "STORE_KEEPER"), getCustomerByPhone);

// // 🔍 Search by Customer ID (CUST-2024-00001 format)
// router.get("/search/id/:customerId", authorize("ADMIN", "STORE_KEEPER"), getCustomerByCustomerId);

// // ==================== LIST ROUTES ====================

// // 📋 Get all customers (basic info)
// router.get("/all", authorize("ADMIN", "STORE_KEEPER"), getAllCustomers);

// // 📋 Get all customers with payment summary
// router.get("/with-payments", authorize("ADMIN", "STORE_KEEPER"), getCustomersWithPaymentSummary);

// // 📊 Get customer statistics (Admin only)
// router.get("/stats", authorize("ADMIN"), getCustomerStats);

// // ==================== CUSTOMER PAYMENT/ORDER ROUTES ====================

// // 💰 Get all payments for a customer
// router.get("/:id/payments", authorize("ADMIN", "STORE_KEEPER"), getCustomerPayments);

// // 📦 Get all orders for a customer
// router.get("/:id/orders", authorize("ADMIN", "STORE_KEEPER"), getCustomerOrders);

// // 📊 Get payment statistics for a customer
// router.get("/:id/payment-stats", authorize("ADMIN", "STORE_KEEPER"), getCustomerPaymentStats);

// // 📈 Get payment trends for a customer
// router.get("/:id/payment-trends", authorize("ADMIN"), getCustomerPaymentTrends);

// // ==================== MEASUREMENT TEMPLATE ROUTES ====================

// // 📏 Save measurement template from garment
// router.post("/:customerId/templates", authorize("ADMIN", "STORE_KEEPER"), saveMeasurementTemplate);

// // 📋 Get all templates for a customer
// router.get("/:customerId/templates", authorize("ADMIN", "STORE_KEEPER"), getCustomerTemplates);

// // 🔍 Get single template by ID
// router.get("/templates/:templateId", authorize("ADMIN", "STORE_KEEPER"), getTemplateById);

// // ✏️ Update template
// router.put("/templates/:templateId", authorize("ADMIN", "STORE_KEEPER"), updateTemplate);

// // ❌ Delete template
// router.delete("/templates/:templateId", authorize("ADMIN", "STORE_KEEPER"), deleteTemplate);

// // 📊 Use template (increment usage count)
// router.post("/templates/:templateId/use", authorize("ADMIN", "STORE_KEEPER"), useTemplate);

// // ==================== SINGLE CUSTOMER ROUTES ====================

// // 👤 Get customer by MongoDB ID (with payments and orders)
// router.get("/:id", authorize("ADMIN", "STORE_KEEPER"), getCustomerById);

// // 🆕 Create new customer
// router.post("/create", authorize("ADMIN", "STORE_KEEPER"), createCustomer);

// // ✏️ Update customer
// router.put("/:id", authorize("ADMIN", "STORE_KEEPER"), updateCustomer);

// // ❌ Delete customer (Admin only)
// router.delete("/:id", authorize("ADMIN"), deleteCustomer);

// console.log("   ✅ Routes added successfully:");
// console.log("      🔍 GET  /search/phone/:phone");
// console.log("      🔍 GET  /search/id/:customerId");
// console.log("      📋 GET  /all");
// console.log("      📋 GET  /with-payments");
// console.log("      📊 GET  /stats");
// console.log("      💰 GET  /:id/payments");
// console.log("      📦 GET  /:id/orders");
// console.log("      📊 GET  /:id/payment-stats");
// console.log("      📈 GET  /:id/payment-trends");
// console.log("      📏 POST /:customerId/templates   ✅ NEW");
// console.log("      📋 GET  /:customerId/templates    ✅ NEW");
// console.log("      🔍 GET  /templates/:templateId    ✅ NEW");
// console.log("      ✏️ PUT  /templates/:templateId    ✅ NEW");
// console.log("      ❌ DEL  /templates/:templateId    ✅ NEW");
// console.log("      📊 POST /templates/:templateId/use ✅ NEW");
// console.log("      👤 GET  /:id");
// console.log("      🆕 POST /create");
// console.log("      ✏️ PUT  /:id");
// console.log("      ❌ DEL  /:id");

// export default router;







import express from "express";
import multer from "multer";
import { 
  // Search functions
  getCustomerByPhone,
  getCustomerByCustomerId,
  
  // Create function
  createCustomer,
  
  // List functions
  getAllCustomers,
  getCustomersWithPaymentSummary,
  
  // Single customer function
  getCustomerById,
  
  // Update/Delete functions
  updateCustomer,
  deleteCustomer,
  
  // Payment/Order specific functions
  getCustomerPayments,
  getCustomerOrders,
  getCustomerPaymentStats,
  getCustomerPaymentTrends,
  
  // Statistics function
  getCustomerStats,
  
  // ✅ Measurement template functions
  saveMeasurementTemplate,
  getCustomerTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  useTemplate,

  // 🚀 Excel Import/Export functions
  importCustomers,
  exportCustomers,
  
  // 🔄 Recalculate totals function
  recalculateCustomerTotals

} from "../controllers/customer.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { getCrmData } from "../controllers/customer.controller.js";

console.log("📁 customer.routes.js is loading...");

const router = express.Router();

// --- Multer Configuration for Excel Import ---
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All routes are protected
router.use(protect);

// ==================== EXCEL IMPORT/EXPORT ROUTES ====================

// 📤 Export all customers to Excel
router.get("/export", authorize("ADMIN", "STORE_KEEPER"), exportCustomers);
router.get("/crm", protect, getCrmData);

// 📥 Import customers from Excel
router.post("/import", authorize("ADMIN", "STORE_KEEPER"), upload.single("file"), importCustomers);

// 🔄 Recalculate all customer totals (fix order counts)
router.post("/recalculate-totals", authorize("ADMIN"), recalculateCustomerTotals);


// ==================== SEARCH ROUTES ====================

router.get("/search/phone/:phone", authorize("ADMIN", "STORE_KEEPER"), getCustomerByPhone);
router.get("/search/id/:customerId", authorize("ADMIN", "STORE_KEEPER"), getCustomerByCustomerId);


// ==================== LIST ROUTES ====================

router.get("/all", authorize("ADMIN", "STORE_KEEPER"), getAllCustomers);
router.get("/with-payments", authorize("ADMIN", "STORE_KEEPER"), getCustomersWithPaymentSummary);
router.get("/stats", authorize("ADMIN"), getCustomerStats);


// ==================== CUSTOMER PAYMENT/ORDER ROUTES ====================

router.get("/:id/payments", authorize("ADMIN", "STORE_KEEPER"), getCustomerPayments);
router.get("/:id/orders", authorize("ADMIN", "STORE_KEEPER"), getCustomerOrders);
router.get("/:id/payment-stats", authorize("ADMIN", "STORE_KEEPER"), getCustomerPaymentStats);
router.get("/:id/payment-trends", authorize("ADMIN"), getCustomerPaymentTrends);


// ==================== MEASUREMENT TEMPLATE ROUTES ====================

router.post("/:customerId/templates", authorize("ADMIN", "STORE_KEEPER"), saveMeasurementTemplate);
router.get("/:customerId/templates", authorize("ADMIN", "STORE_KEEPER"), getCustomerTemplates);
router.get("/templates/:templateId", authorize("ADMIN", "STORE_KEEPER"), getTemplateById);
router.put("/templates/:templateId", authorize("ADMIN", "STORE_KEEPER"), updateTemplate);
router.delete("/templates/:templateId", authorize("ADMIN", "STORE_KEEPER"), deleteTemplate);
router.post("/templates/:templateId/use", authorize("ADMIN", "STORE_KEEPER"), useTemplate);


// ==================== SINGLE CUSTOMER ROUTES ====================

router.get("/:id", authorize("ADMIN", "STORE_KEEPER"), getCustomerById);
router.post("/create", authorize("ADMIN", "STORE_KEEPER"), createCustomer);
router.put("/:id", authorize("ADMIN", "STORE_KEEPER"), updateCustomer);
router.delete("/:id", authorize("ADMIN"), deleteCustomer);

console.log("   ✅ Routes added successfully:");
console.log("      📤 GET  /export            ✅ EXCEL");
console.log("      📥 POST /import            ✅ EXCEL");
console.log("      🔄 POST /recalculate-totals ✅ FIX ORDER COUNTS");
console.log("      📏 POST /templates/...     ✅ TEMPLATES");

export default router;