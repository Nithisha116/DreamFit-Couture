import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Counter from "../models/Counter.js";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import Customer from "../models/Customer.js";
import * as invoiceRepository from "../repositories/invoice.repository.js";
import billingEmitter from "./billingEmitter.js";
import { calculateInvoiceTotals, calculateProfit } from "../utils/billingCalculator.js";
import { toPaise, toRupees } from "../utils/precision.js";
import { canTransitionInvoiceStatus } from "../utils/statusMachine.js";

/**
 * Generates an atomic sequential invoice number: INV-YYYY-XXXX
 * @returns {string} invoiceNumber
 */
export const generateInvoiceNumber = async () => {
  const currentYear = new Date().getFullYear();
  const counterName = `invoice-${currentYear}`;
  
  const counter = await Counter.findOneAndUpdate(
    { name: counterName },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  
  const seqStr = String(counter.sequence).padStart(4, "0");
  return `INV-${currentYear}-${seqStr}`;
};

/**
 * Creates an Invoice under transactional safety, syncs parent Order totals, and emits async side-effects
 */
export const createInvoiceService = async (orderId, invoiceData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Check if invoice already exists for this order
    const existingInvoice = await invoiceRepository.findByOrderId(orderId, session);
    if (existingInvoice) {
      throw new Error(`An active invoice (${existingInvoice.invoiceNumber}) already exists for this Order.`);
    }

    // 2. Fetch order
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error("Order reference not found.");

    // 3. Compute totals using high-precision Paise calculator
    const totals = calculateInvoiceTotals({
      items: invoiceData.items,
      discountType: invoiceData.discountType,
      discountValue: invoiceData.discountValue,
      taxPercentage: invoiceData.taxPercentage
    });

    // 4. Extract advance payments already registered against order
    const totalPaidRupees = order.paymentSummary?.totalPaid || 0;
    const grandTotalRupees = totals.grandTotal;
    
    const paidPaise = toPaise(totalPaidRupees);
    const grandTotalPaise = toPaise(grandTotalRupees);
    const duePaise = Math.max(0, grandTotalPaise - paidPaise);

    // 5. Generate collision-free sequential number
    const invoiceNumber = await generateInvoiceNumber();

    // 6. Compute margin analytics
    const estProfit = calculateProfit({
      grandTotal: totals.grandTotal,
      outsourcingCost: invoiceData.outsourcingCost || 0,
      materialCost: invoiceData.materialCost || 0
    });

    // 7. Create Invoice
    const invoice = new Invoice({
      invoiceNumber,
      order: orderId,
      customer: order.customer,
      items: invoiceData.items,
      summary: {
        ...totals,
        paidAmount: totalPaidRupees,
        dueAmount: toRupees(duePaise)
      },
      profitMargin: {
        outsourcingCost: invoiceData.outsourcingCost || 0,
        materialCost: invoiceData.materialCost || 0,
        laborCost: invoiceData.laborCost || 0,
        estimatedProfit: estProfit
      },
      status: "issued",
      paymentStatus: duePaise === 0 ? "paid" : paidPaise > 0 ? "partial" : "pending",
      dueDate: invoiceData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      generatedBy: userId
    });

    await invoiceRepository.save(invoice, session);

    // 8. Sync financials back to Order to keep speed snapshots alive
    order.balanceAmount = invoice.summary.dueAmount;
    order.paymentSummary.paymentStatus = invoice.paymentStatus;
    // Lock order stitching charges to finalize invoicing
    order.priceSummary.totalMin = grandTotalRupees;
    order.priceSummary.totalMax = grandTotalRupees;
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 9. Asynchronously emit events for audit logs & material movement tracking
    billingEmitter.emit("AUDIT_LOG", {
      action: "CREATE_INVOICE",
      user: userId,
      entityType: "Invoice",
      entityId: invoice._id,
      description: `Invoice ${invoiceNumber} created for Order ${order.orderId || order._id} with Grand Total: ₹${grandTotalRupees}`,
      newData: invoice.toJSON()
    });

    billingEmitter.emit("INVENTORY_REDUCE", {
      items: invoice.items,
      invoiceId: invoice._id
    });

    return invoice;
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Registers an installment or settlement payment against an invoice, syncs Ledger & Order financials in a transaction
 */
export const collectInvoicePaymentService = async (invoiceId, paymentData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const invoice = await invoiceRepository.findById(invoiceId, session);
    if (!invoice) throw new Error("Invoice not found.");
    if (invoice.status === "cancelled") throw new Error("Cannot collect payments against a cancelled invoice.");

    const amountPaise = toPaise(paymentData.amount);
    const duePaise = toPaise(invoice.summary.dueAmount);
    
    if (amountPaise <= 0) throw new Error("Payment amount must be greater than zero.");
    if (amountPaise > duePaise) {
      throw new Error(`Overpayment blocked. Outstanding invoice balance is ₹${invoice.summary.dueAmount}, but received ₹${paymentData.amount}.`);
    }

    const order = await Order.findById(invoice.order).session(session);
    if (!order) throw new Error("Order reference not found.");

    // 1. Create separate Payment entry
    const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
    const payment = new Payment({
      order: invoice.order,
      customer: invoice.customer,
      amount: paymentData.amount,
      type: amountPaise === duePaise ? "final-settlement" : "final-settlement", // using system mapped types
      method: paymentData.method || "upi",
      referenceNumber: paymentData.referenceNumber || "",
      paymentDate: paymentData.paymentDate || new Date(),
      paymentTime: paymentData.paymentTime || timeStr,
      receivedBy: userId,
      notes: paymentData.notes || `Invoice Payment - ${invoice.invoiceNumber}`
    });
    await payment.save({ session });

    // 2. Create Ledger income transaction
    const customer = await Customer.findById(invoice.customer).session(session);
    const customerDetails = customer
      ? {
          name: customer.name || "Unknown",
          phone: customer.phone,
          id: customer.customerId || customer._id
        }
      : null;

    const ledgerTx = new Transaction({
      type: "income",
      category: "full-payment",
      amount: paymentData.amount,
      paymentMethod: paymentData.method || "upi",
      accountType: paymentData.method === "cash" ? "hand-cash" : "bank",
      customer: invoice.customer,
      customerDetails,
      order: invoice.order,
      description: `Payment against Invoice ${invoice.invoiceNumber} - Method: ${paymentData.method}`,
      transactionDate: paymentData.paymentDate || new Date(),
      referenceNumber: paymentData.referenceNumber || "",
      createdBy: userId,
      status: "completed",
      metadata: {
        paymentId: payment._id,
        invoiceId: invoice._id,
        paymentMethod: paymentData.method
      }
    });
    await ledgerTx.save({ session });

    // 3. Update Invoice Financial Summary using precise math
    const nextPaidPaise = toPaise(invoice.summary.paidAmount) + amountPaise;
    const nextDuePaise = Math.max(0, toPaise(invoice.summary.grandTotal) - nextPaidPaise);

    invoice.summary.paidAmount = toRupees(nextPaidPaise);
    invoice.summary.dueAmount = toRupees(nextDuePaise);
    
    if (nextDuePaise === 0) {
      invoice.paymentStatus = "paid";
    } else {
      invoice.paymentStatus = "partial";
    }
    await invoiceRepository.save(invoice, session);

    // 4. Sync totals back to Order financials
    order.balanceAmount = invoice.summary.dueAmount;
    order.paymentSummary.totalPaid = toRupees(toPaise(order.paymentSummary.totalPaid) + amountPaise);
    order.paymentSummary.paymentStatus = invoice.paymentStatus;
    
    // Automatically update order status to ready for delivery if it is confirmed or in progress and fully paid,
    // but typically keep it separated to maintain physical workflow transitions.
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 5. Emit async audit logger
    billingEmitter.emit("AUDIT_LOG", {
      action: "COLLECT_PAYMENT",
      user: userId,
      entityType: "Invoice",
      entityId: invoice._id,
      description: `Collected payment of ₹${paymentData.amount} via ${paymentData.method} for Invoice ${invoice.invoiceNumber}`,
      newData: invoice.toJSON()
    });

    return invoice;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Cancels an issued invoice, unlocks order financials, and writes to audit logs
 */
export const cancelInvoiceService = async (invoiceId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoice = await invoiceRepository.findById(invoiceId, session);
    if (!invoice) throw new Error("Invoice not found.");

    if (!canTransitionInvoiceStatus(invoice.status, "cancelled")) {
      throw new Error(`Transition from status '${invoice.status}' to 'cancelled' is unauthorized.`);
    }

    const previousData = invoice.toJSON();

    // 1. Perform cancellation updates
    invoice.status = "cancelled";
    invoice.summary.dueAmount = 0; // Cancel outstanding dues
    await invoiceRepository.save(invoice, session);

    // 2. Unlink financials on Order
    const order = await Order.findById(invoice.order).session(session);
    if (order) {
      order.balanceAmount = 0;
      order.paymentSummary.paymentStatus = "pending";
      await order.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // 3. Emit audit logs
    billingEmitter.emit("AUDIT_LOG", {
      action: "CANCEL_INVOICE",
      user: userId,
      entityType: "Invoice",
      entityId: invoice._id,
      description: `Invoice ${invoice.invoiceNumber} was cancelled by User ID ${userId}`,
      previousData,
      newData: invoice.toJSON()
    });

    return invoice;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Dynamic KPI Aggregate Report Service
 */
export const getBillingStatsService = async () => {
  const invoices = await Invoice.find({ isDeleted: false });
  const transactions = await Transaction.find({ type: "income", status: "completed" });
  
  let totalRevenuePaise = 0;
  let totalDuePaise = 0;
  
  invoices.forEach(inv => {
    if (inv.status !== "cancelled") {
      totalRevenuePaise += toPaise(inv.summary.grandTotal);
      totalDuePaise += toPaise(inv.summary.dueAmount);
    }
  });

  const dailyCollectionPaise = transactions
    .filter(tx => {
      const txDate = new Date(tx.transactionDate).toDateString();
      const today = new Date().toDateString();
      return txDate === today;
    })
    .reduce((sum, tx) => sum + toPaise(tx.amount), 0);

  const paymentMethods = { cash: 0, upi: 0, "bank-transfer": 0, card: 0 };
  transactions.forEach(tx => {
    if (paymentMethods[tx.paymentMethod] !== undefined) {
      paymentMethods[tx.paymentMethod] += toPaise(tx.amount);
    }
  });

  return {
    totalRevenue: toRupees(totalRevenuePaise),
    totalDue: toRupees(totalDuePaise),
    todayCollection: toRupees(dailyCollectionPaise),
    paymentMethods: {
      cash: toRupees(paymentMethods.cash),
      upi: toRupees(paymentMethods.upi),
      bankTransfer: toRupees(paymentMethods["bank-transfer"]),
      card: toRupees(paymentMethods.card)
    }
  };
};
