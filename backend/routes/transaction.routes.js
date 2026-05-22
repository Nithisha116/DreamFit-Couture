// // routes/transaction.routes.js
// const express = require('express');
// const router = express.Router();
// const { protect, authorize } = require('../middleware/auth.middleware');
// const {
//   createTransaction,
//   getTransactions,
//   getTransactionSummary,
//   deleteTransaction
// } = require('../controllers/transaction.controller');

// // All routes require authentication
// router.use(protect);

// // Summary route
// router.get('/summary', getTransactionSummary);

// // Main routes
// router.route('/')
//   .get(authorize('ADMIN', 'STORE_KEEPER'), getTransactions)
//   .post(authorize('ADMIN', 'STORE_KEEPER'), createTransaction);

// router.delete('/:id', authorize('ADMIN'), deleteTransaction);

// module.exports = router;



// // routes/transaction.routes.js - CORRECTED VERSION
// const express = require('express');
// const router = express.Router();
// const { protect, authorize } = require('../middleware/auth.middleware');
// const {
//   createTransaction,
//   getTransactions,
//   getTransactionSummary,
//   deleteTransaction,
//   // 👇 NEW: Add all these imports
//   getTransactionById,
//   getTransactionsByOrder,
//   getTransactionsByCustomer,
//   updateTransaction,
//   getTransactionStats,
//   bulkDeleteTransactions,
//   exportTransactions,
//   getTransactionsByDateRange,
//   getDashboardData
// } = require('../controllers/transaction.controller');

// // All routes require authentication
// router.use(protect);

// // ============================================
// // ✅ PUBLIC ROUTES (All authenticated users)
// // ============================================

// // Dashboard data
// router.get('/dashboard', getDashboardData);

// // Summary route - for dashboard
// router.get('/summary', getTransactionSummary);

// // Stats route - for analytics
// router.get('/stats', authorize('ADMIN'), getTransactionStats);

// // ============================================
// // ✅ ORDER-SPECIFIC ROUTES
// // ============================================

// // Get transactions by order ID
// router.get('/order/:orderId', getTransactionsByOrder);

// // ============================================
// // ✅ CUSTOMER-SPECIFIC ROUTES
// // ============================================

// // Get transactions by customer ID
// router.get('/customer/:customerId', getTransactionsByCustomer);

// // ============================================
// // ✅ DATE RANGE ROUTES
// // ============================================

// // Get transactions by date range
// router.get('/range/:start/:end', authorize('ADMIN', 'STORE_KEEPER'), getTransactionsByDateRange);

// // ============================================
// // ✅ EXPORT ROUTES
// // ============================================

// // Export transactions to Excel/CSV
// router.get('/export/all', authorize('ADMIN', 'STORE_KEEPER'), exportTransactions);

// // ============================================
// // ✅ MAIN TRANSACTION ROUTES
// // ============================================

// // Get all transactions with filters & Create new transaction
// router.route('/')
//   .get(authorize('ADMIN', 'STORE_KEEPER'), getTransactions)
//   .post(authorize('ADMIN', 'STORE_KEEPER'), createTransaction);

// // ============================================
// // ✅ SINGLE TRANSACTION ROUTES
// // ============================================

// // Get single transaction, Update, Delete
// router.route('/:id')
//   .get(authorize('ADMIN', 'STORE_KEEPER'), getTransactionById)
//   .put(authorize('ADMIN'), updateTransaction)
//   .delete(authorize('ADMIN'), deleteTransaction);

// // ============================================
// // ✅ BULK OPERATIONS (Admin only)
// // ============================================

// // Bulk delete transactions
// router.delete('/bulk/delete', authorize('ADMIN'), bulkDeleteTransactions);

// module.exports = router;
















// // routes/transaction.routes.js - UPDATED VERSION
// const express = require('express');
// const router = express.Router();
// const { protect, authorize } = require('../middleware/auth.middleware');
// const {
//   createTransaction,
//   getTransactions,
//   getTransactionSummary,
//   deleteTransaction,
//   // 👇 NEW: Add all these imports
//   getTransactionById,
//   getTransactionsByOrder,
//   getTransactionsByCustomer,
//   updateTransaction,
//   getTransactionStats,
//   bulkDeleteTransactions,
//   exportTransactions,
//   getTransactionsByDateRange,
//   getDashboardData,
//   // ✅ NEW: Add daily revenue stats
//   getDailyRevenueStats
// } = require('../controllers/transaction.controller');

// // All routes require authentication
// router.use(protect);

// // ============================================
// // ✅ PUBLIC ROUTES (All authenticated users)
// // ============================================

// // Dashboard data
// router.get('/dashboard', getDashboardData);

// // Summary route - for dashboard
// router.get('/summary', getTransactionSummary);

// // Stats route - for analytics
// router.get('/stats', authorize('ADMIN'), getTransactionStats);

// // ✅ NEW: Daily revenue stats for charts
// router.get('/daily-stats', authorize('ADMIN', 'STORE_KEEPER'), getDailyRevenueStats);

// // ============================================
// // ✅ ORDER-SPECIFIC ROUTES
// // ============================================

// // Get transactions by order ID
// router.get('/order/:orderId', getTransactionsByOrder);

// // ============================================
// // ✅ CUSTOMER-SPECIFIC ROUTES
// // ============================================

// // Get transactions by customer ID
// router.get('/customer/:customerId', getTransactionsByCustomer);

// // ============================================
// // ✅ DATE RANGE ROUTES
// // ============================================

// // Get transactions by date range
// router.get('/range/:start/:end', authorize('ADMIN', 'STORE_KEEPER'), getTransactionsByDateRange);

// // ============================================
// // ✅ EXPORT ROUTES
// // ============================================

// // Export transactions to Excel/CSV
// router.get('/export/all', authorize('ADMIN', 'STORE_KEEPER'), exportTransactions);

// // ============================================
// // ✅ MAIN TRANSACTION ROUTES
// // ============================================

// // Get all transactions with filters & Create new transaction
// router.route('/')
//   .get(authorize('ADMIN', 'STORE_KEEPER'), getTransactions)
//   .post(authorize('ADMIN', 'STORE_KEEPER'), createTransaction);

// // ============================================
// // ✅ SINGLE TRANSACTION ROUTES
// // ============================================

// // Get single transaction, Update, Delete
// router.route('/:id')
//   .get(authorize('ADMIN', 'STORE_KEEPER'), getTransactionById)
//   .put(authorize('ADMIN'), updateTransaction)
//   .delete(authorize('ADMIN'), deleteTransaction);

// // ============================================
// // ✅ BULK OPERATIONS (Admin only)
// // ============================================

// // Bulk delete transactions
// router.delete('/bulk/delete', authorize('ADMIN'), bulkDeleteTransactions);

// module.exports = router;








// // routes/transaction.routes.js - COMPLETE RE-ORDERED VERSION
// const express = require('express');
// const router = express.Router();
// const { protect, authorize } = require('../middleware/auth.middleware');
// const {
//   createTransaction,
//   getTransactions,
//   getTransactionSummary,
//   deleteTransaction,
//   getTransactionById,
//   getTransactionsByOrder,
//   getTransactionsByCustomer,
//   updateTransaction,
//   getTransactionStats,
//   bulkDeleteTransactions,
//   exportTransactions,
//   getTransactionsByDateRange,
//   getDashboardData,
//   getDailyRevenueStats
// } = require('../controllers/transaction.controller');

// // All routes require authentication
// router.use(protect);

// // ============================================
// // ✅ 1. DASHBOARD & ANALYTICS (Unique Static Paths First)
// // ============================================
// router.get('/dashboard/main', getDashboardData);
// router.get('/dashboard/today', getTransactionSummary); // 👈 Mapping to today summary
// router.get('/dashboard/daily-stats', authorize('ADMIN', 'STORE_KEEPER'), getDailyRevenueStats);
// router.get('/summary', getTransactionSummary);
// router.get('/stats', authorize('ADMIN'), getTransactionStats);

// // ============================================
// // ✅ 2. SPECIALIZED & BULK (Before /:id)
// // ============================================
// router.get('/export/all', authorize('ADMIN', 'STORE_KEEPER'), exportTransactions);
// router.delete('/bulk/delete', authorize('ADMIN'), bulkDeleteTransactions);
// router.get('/order/:orderId', getTransactionsByOrder);
// router.get('/customer/:customerId', getTransactionsByCustomer);
// router.get('/range/:start/:end', authorize('ADMIN', 'STORE_KEEPER'), getTransactionsByDateRange);

// // ============================================
// // ✅ 3. MAIN BASE ROUTES
// // ============================================
// router.route('/')
//   .get(authorize('ADMIN', 'STORE_KEEPER'), getTransactions)
//   .post(authorize('ADMIN', 'STORE_KEEPER'), createTransaction);

// // ============================================
// // ✅ 4. DYNAMIC ID ROUTES (MUST BE VERY LAST)
// // ============================================
// router.route('/:id')
//   .get(authorize('ADMIN', 'STORE_KEEPER'), getTransactionById)
//   .put(authorize('ADMIN'), updateTransaction)
//   .delete(authorize('ADMIN'), deleteTransaction);

// module.exports = router;











// routes/transaction.routes.js - ADD THE MISSING /today ROUTE

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createTransaction,
  getTransactions,
  getTransactionSummary,
  deleteTransaction,
  getTransactionById,
  getTransactionsByOrder,
  getTransactionsByCustomer,
  updateTransaction,
  getTransactionStats,
  bulkDeleteTransactions,
  exportTransactions,
  getTransactionsByDateRange,
  getDashboardData,
  getDailyRevenueStats,
  getTodayTransactions  // ✅ ADD THIS IMPORT
} = require('../controllers/transaction.controller');

// All routes require authentication
router.use(protect);

// ============================================
// ✅ 1. DASHBOARD & ANALYTICS (Unique Static Paths First)
// ============================================
router.get('/dashboard/main', getDashboardData);
router.get('/dashboard/today', getTransactionSummary);
router.get('/dashboard/daily-stats', authorize('ADMIN', 'STORE_KEEPER'), getDailyRevenueStats);
router.get('/daily-stats', authorize('ADMIN', 'STORE_KEEPER'), getDailyRevenueStats);
router.get('/summary', getTransactionSummary);
router.get('/stats', authorize('ADMIN'), getTransactionStats);

// ✅ ADD THIS - TODAY'S TRANSACTIONS ROUTE
router.get('/summary/today', authorize('ADMIN', 'STORE_KEEPER'), getTodayTransactions);

// ============================================
// ✅ 2. SPECIALIZED & BULK (Before /:id)
// ============================================
router.get('/export/all', authorize('ADMIN', 'STORE_KEEPER'), exportTransactions);
router.delete('/bulk/delete', authorize('ADMIN'), bulkDeleteTransactions);
router.get('/order/:orderId', getTransactionsByOrder);
router.get('/customer/:customerId', getTransactionsByCustomer);
router.get('/range/:start/:end', authorize('ADMIN', 'STORE_KEEPER'), getTransactionsByDateRange);

// ============================================
// ✅ 3. MAIN BASE ROUTES
// ============================================
router.route('/')
  .get(authorize('ADMIN', 'STORE_KEEPER'), getTransactions)
  .post(authorize('ADMIN', 'STORE_KEEPER'), createTransaction);

// ============================================
// ✅ 4. DYNAMIC ID ROUTES (MUST BE VERY LAST)
// ============================================
router.route('/:id')
  .get(authorize('ADMIN', 'STORE_KEEPER'), getTransactionById)
  .put(authorize('ADMIN'), updateTransaction)
  .delete(authorize('ADMIN'), deleteTransaction);

module.exports = router;