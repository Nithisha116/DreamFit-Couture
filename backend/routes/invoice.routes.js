import express from "express";
import {
  createInvoice,
  collectPayment,
  cancelInvoice,
  getInvoiceById,
  getInvoiceByOrderId,
  getAllInvoices,
  getBillingStats,
  deleteInvoice
} from "../controllers/invoice.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔒 All routes in this module are protected by the auth session check
router.use(protect);

/**
 * @route   GET /api/invoices/stats
 * @desc    Get dashboard metrics & trends
 * @access  Admin, Store Keeper
 */
router.get("/stats", authorize("ADMIN", "STORE_KEEPER"), getBillingStats);

/**
 * @route   POST /api/invoices/create/:orderId
 * @desc    Issue a new invoice for a completed order
 * @access  Admin, Store Keeper
 */
router.post("/create/:orderId", authorize("ADMIN", "STORE_KEEPER"), createInvoice);

/**
 * @route   GET /api/invoices/order/:orderId
 * @desc    Fetch invoice linked to specific Order
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/order/:orderId", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getInvoiceByOrderId);

/**
 * @route   GET /api/invoices/:id
 * @desc    Fetch single invoice details
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getInvoiceById);

/**
 * @route   POST /api/invoices/:id/payments
 * @desc    Capture installment or final settlement payments against invoice balance
 * @access  Admin, Store Keeper
 */
router.post("/:id/payments", authorize("ADMIN", "STORE_KEEPER"), collectPayment);

/**
 * @route   POST /api/invoices/:id/cancel
 * @desc    Cancel an issued invoice, unlinking financials
 * @access  Admin ONLY
 */
router.post("/:id/cancel", authorize("ADMIN"), cancelInvoice);

/**
 * @route   GET /api/invoices
 * @desc    List all active non-deleted invoices
 * @access  Admin, Store Keeper
 */
router.get("/", authorize("ADMIN", "STORE_KEEPER"), getAllInvoices);

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Soft-delete an invoice document
 * @access  Admin ONLY
 */
router.delete("/:id", authorize("ADMIN"), deleteInvoice);

export default router;
