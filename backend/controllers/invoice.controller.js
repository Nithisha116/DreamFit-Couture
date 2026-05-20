import * as invoiceService from "../services/invoice.service.js";
import * as invoiceRepository from "../repositories/invoice.repository.js";
import { validateCreateInvoiceInput } from "../validators/invoice.validator.js";

/**
 * Creates a new Invoice for an order
 */
export const createInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. User context missing." });
    }

    // Run boundary input validation
    const { isValid, errors } = validateCreateInvoiceInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors, message: "Validation validation failed." });
    }

    const invoice = await invoiceService.createInvoiceService(orderId, req.body, userId);
    return res.status(201).json({
      success: true,
      data: invoice,
      message: "Invoice issued successfully."
    });
  } catch (error) {
    console.error("❌ Controller Error in createInvoice:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Collects a payment (cash, upi, card) against an outstanding invoice balance
 */
export const collectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. User context missing." });
    }

    const { amount, method } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "A valid positive payment amount is required." });
    }
    if (!method || !["cash", "upi", "bank-transfer", "card"].includes(method)) {
      return res.status(400).json({ success: false, message: "A valid payment method is required." });
    }

    const invoice = await invoiceService.collectInvoicePaymentService(id, req.body, userId);
    return res.status(200).json({
      success: true,
      data: invoice,
      message: "Payment successfully captured and ledger logged."
    });
  } catch (error) {
    console.error("❌ Controller Error in collectPayment:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Cancels an issued invoice
 */
export const cancelInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. User context missing." });
    }

    const invoice = await invoiceService.cancelInvoiceService(id, userId);
    return res.status(200).json({
      success: true,
      data: invoice,
      message: "Invoice successfully cancelled and order financials unlinked."
    });
  } catch (error) {
    console.error("❌ Controller Error in cancelInvoice:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Fetches single invoice details
 */
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }
    return res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    console.error("❌ Controller Error in getInvoiceById:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Fetches invoice details by Order ID
 */
export const getInvoiceByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const invoice = await invoiceRepository.findByOrderId(orderId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "No invoice found for this order." });
    }
    return res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    console.error("❌ Controller Error in getInvoiceByOrderId:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Lists all non-deleted invoices with advanced query filters
 */
export const getAllInvoices = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus;
    if (req.query.customer) filters.customer = req.query.customer;

    const invoices = await invoiceRepository.findAll(filters);
    return res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    console.error("❌ Controller Error in getAllInvoices:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Fetches dashboard financial statistics
 */
export const getBillingStats = async (req, res) => {
  try {
    const stats = await invoiceService.getBillingStatsService();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("❌ Controller Error in getBillingStats:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Soft deletes an invoice
 */
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. User context missing." });
    }

    const invoice = await invoiceRepository.softDelete(id, userId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found or already deleted." });
    }
    return res.status(200).json({ success: true, message: "Invoice successfully soft-deleted." });
  } catch (error) {
    console.error("❌ Controller Error in deleteInvoice:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};
