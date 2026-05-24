import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
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
 * Fetches all invoices linked to a specific Order (supports array lists for multi-invoice orders)
 */
export const getInvoiceByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find all active invoices linked to this order, sorted newest first
    const invoices = await Invoice.find({
      $or: [
        { order: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
        { orderId: orderId }
      ],
      isDeleted: false
    })
    .populate("customer")
    .populate("generatedBy", "name email role")
    .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    console.error("❌ Controller Error in getInvoiceByOrderId:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Lists all non-deleted invoices with advanced query filters and string search indexing
 */
export const getAllInvoices = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status && req.query.status !== "all") {
      filters.status = req.query.status;
    }
    if (req.query.paymentStatus && req.query.paymentStatus !== "all") {
      const pStatus = req.query.paymentStatus.toLowerCase();
      filters.paymentStatus = { $regex: new RegExp(`^${pStatus}$`, "i") };
    }
    if (req.query.customer) {
      filters.customer = req.query.customer;
    }

    const { search } = req.query;
    if (search) {
      filters.$or = [
        { invoiceId: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
        { orderId: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

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

/**
 * Creates a new manual invoice for an order
 */
export const createManualInvoice = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { orderId, invoiceType, totalAmount, paidAmount, notes } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required." });
    }

    const Order = mongoose.model("Order");
    const order = await Order.findOne({
      $or: [
        { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
        { orderId }
      ]
    }).populate("customer");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const invoiceNumber = await invoiceService.generateInvoiceNumber();
    const balanceAmount = Math.max(0, (totalAmount || 0) - (paidAmount || 0));

    const invoice = await Invoice.create({
      invoiceId: invoiceNumber,
      invoiceNumber,
      orderId: order.orderId,
      orderRef: order._id,
      order: order._id,
      customer: order.customer?._id,
      customerName: order.customer?.name || "Walk-in Customer",
      phone: order.customer?.phone || "",
      invoiceType: invoiceType || "Final",
      totalAmount: totalAmount || 0,
      paidAmount: paidAmount || 0,
      balanceAmount,
      paymentStatus: balanceAmount === 0 ? "Paid" : (paidAmount > 0 ? "Partial" : "Pending"),
      notes: notes || "",
      generatedBy: userId
    });

    return res.status(201).json({
      success: true,
      data: invoice,
      message: "Invoice created successfully."
    });
  } catch (error) {
    console.error("❌ Controller Error in createManualInvoice:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Updates an invoice by ID
 */
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedUpdates = ["invoiceType", "totalAmount", "paidAmount", "notes", "paymentStatus"];
    
    const invoice = await Invoice.findOne({ _id: id, isDeleted: false });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        invoice[field] = req.body[field];
      }
    });

    if (req.body.totalAmount !== undefined || req.body.paidAmount !== undefined) {
      invoice.balanceAmount = Math.max(0, invoice.totalAmount - invoice.paidAmount);
      invoice.paymentStatus = invoice.balanceAmount === 0 ? "Paid" : (invoice.paidAmount > 0 ? "Partial" : "Pending");
    }

    await invoice.save();
    return res.status(200).json({
      success: true,
      data: invoice,
      message: "Invoice updated successfully."
    });
  } catch (error) {
    console.error("❌ Controller Error in updateInvoice:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};
