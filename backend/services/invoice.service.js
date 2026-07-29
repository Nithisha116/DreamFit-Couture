import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Counter from "../models/Counter.js";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import Customer from "../models/Customer.js";
import Garment from "../models/Garment.js";
import AuditLog from "../models/AuditLog.js";
import * as invoiceRepository from "../repositories/invoice.repository.js";
import billingEmitter from "./billingEmitter.js";
import { calculateInvoiceTotals, calculateProfit } from "../utils/billingCalculator.js";
import { toPaise, toRupees } from "../utils/precision.js";
import { canTransitionInvoiceStatus } from "../utils/statusMachine.js";
import { getGarmentBreakdown, buildOrderPricingSummary } from "../utils/pricingEngine.js";

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
    const grandTotalRupees = totals.grandTotalMax || totals.grandTotal;
    
    const paidPaise = toPaise(totalPaidRupees);
    const grandTotalMinPaise = toPaise(totals.grandTotalMin);
    const grandTotalMaxPaise = toPaise(totals.grandTotalMax);
    const isFullyPaid = paidPaise >= grandTotalMinPaise;

    const dueMinPaise = isFullyPaid ? 0 : Math.max(0, grandTotalMinPaise - paidPaise);
    const dueMaxPaise = isFullyPaid ? 0 : Math.max(0, grandTotalMaxPaise - paidPaise);
    const duePaise = dueMaxPaise;

    // 5. Generate collision-free sequential number
    const invoiceNumber = await generateInvoiceNumber();

    // 6. Compute margin analytics
    const estProfit = calculateProfit({
      grandTotal: totals.grandTotalMax || totals.grandTotal,
      outsourcingCost: invoiceData.outsourcingCost || 0,
      materialCost: invoiceData.materialCost || 0
    });

    // Fetch garments and payments for the immutable financial snapshot
    const garments = await Garment.find({ order: orderId, isActive: true }).session(session);
    const payments = await Payment.find({ order: orderId, isDeleted: false }).session(session);
    const orderPricingSummary = buildOrderPricingSummary(garments, payments);

    const snapshot = {
      garments: garments.map(g => ({ ...getGarmentBreakdown(g), name: g.name, garmentId: g.garmentId })),
      payments: payments.map(p => ({ amount: p.amount, method: p.method, paymentDate: p.paymentDate })),
      orderTotals: { totalMin: orderPricingSummary.totalMin, totalMax: orderPricingSummary.totalMax },
      invoiceTotals: {
        subtotal: totals.subtotal,
        discount: totals.discountAmount,
        tax: totals.taxAmount,
        grandTotalMin: totals.grandTotalMin,
        grandTotalMax: totals.grandTotalMax
      },
      snapshotAt: new Date()
    };

    // 7. Create Invoice
    const invoice = new Invoice({
      invoiceNumber,
      order: orderId,
      customer: order.customer,
      items: invoiceData.items,
      summary: {
        ...totals,
        paidAmount: totalPaidRupees,
        dueAmount: toRupees(duePaise),
        dueAmountMin: toRupees(dueMinPaise),
        dueAmountMax: toRupees(dueMaxPaise)
      },
      profitMargin: {
        outsourcingCost: invoiceData.outsourcingCost || 0,
        materialCost: invoiceData.materialCost || 0,
        laborCost: invoiceData.laborCost || 0,
        estimatedProfit: estProfit
      },
      status: "issued",
      paymentStatus: isFullyPaid ? "paid" : paidPaise > 0 ? "partial" : "pending",
      dueDate: invoiceData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      generatedBy: userId,
      financialSnapshot: snapshot,
      orderFinalizedAt: new Date()
    });

    await invoiceRepository.save(invoice, session);

    // 8. Sync financials back to Order to keep speed snapshots alive
    order.balanceAmount = invoice.summary.dueAmountMax;
    order.balanceMin = invoice.summary.dueAmountMin;
    order.balanceMax = invoice.summary.dueAmountMax;
    order.paymentSummary.paymentStatus = invoice.paymentStatus;
    // Set order price range to the invoice grand total range
    order.minPrice = totals.grandTotalMin;
    order.maxPrice = totals.grandTotalMax;
    order.priceSummary.totalMin = totals.grandTotalMin;
    order.priceSummary.totalMax = totals.grandTotalMax;

    // Lock Order
    order.pricingLocked = true;
    order.lockedAt = new Date();
    order.lockedBy = userId;
    order.lockReason = "FINAL_BILL_GENERATED";
    order.pricingVersion = (order.pricingVersion || 0) + 1;

    await order.save({ session });

    // Write audit log inside the transaction
    await AuditLog.create([{
      action: "FINAL_BILL_GENERATED",
      user: userId,
      entityType: "Invoice",
      entityId: invoice._id,
      description: `Final bill ${invoice.invoiceNumber} generated. Order locked.`,
      newData: { invoiceNumber: invoice.invoiceNumber, grandTotal: totals.grandTotalMax }
    }], { session });

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
    // Explicit IST — without it this defaults to the server process's own
    // OS timezone (UTC on most hosts), not India time.
    const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
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
    const nextPaidRupees = toRupees(toPaise(invoice.summary.paidAmount) + amountPaise);
    const nextPaidPaise = toPaise(nextPaidRupees);
    
    const grandTotalMin = invoice.summary.grandTotalMin !== undefined ? invoice.summary.grandTotalMin : invoice.summary.grandTotal;
    const grandTotalMax = invoice.summary.grandTotalMax !== undefined ? invoice.summary.grandTotalMax : invoice.summary.grandTotal;
    const grandTotalMinPaise = toPaise(grandTotalMin);
    const grandTotalMaxPaise = toPaise(grandTotalMax);
    
    const isFullyPaid = nextPaidPaise >= grandTotalMinPaise;
    const nextDueMinPaise = isFullyPaid ? 0 : Math.max(0, grandTotalMinPaise - nextPaidPaise);
    const nextDueMaxPaise = isFullyPaid ? 0 : Math.max(0, grandTotalMaxPaise - nextPaidPaise);

    invoice.summary.paidAmount = nextPaidRupees;
    invoice.summary.dueAmount = toRupees(nextDueMaxPaise);
    invoice.summary.dueAmountMin = toRupees(nextDueMinPaise);
    invoice.summary.dueAmountMax = toRupees(nextDueMaxPaise);
    
    if (isFullyPaid) {
      invoice.paymentStatus = "paid";
    } else {
      invoice.paymentStatus = "partial";
    }
    await invoiceRepository.save(invoice, session);

    // 4. Sync totals back to Order financials
    order.balanceAmount = invoice.summary.dueAmount;
    order.balanceMin = invoice.summary.dueAmountMin || 0;
    order.balanceMax = invoice.summary.dueAmountMax || 0;
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

    // 2. Unlink financials on Order and unlock
    const order = await Order.findById(invoice.order).session(session);
    if (order) {
      order.balanceAmount = 0;
      order.paymentSummary.paymentStatus = "pending";

      order.pricingLocked = false;
      order.lockedAt = null;
      order.lockedBy = null;
      order.lockReason = null;
      order.pricingVersion = (order.pricingVersion || 0) + 1;

      await order.save({ session });

      // Write AuditLog inside transaction
      await AuditLog.create([{
        action: "ORDER_UNLOCKED",
        user: userId,
        entityType: "Order",
        entityId: order._id,
        description: `Order ${order.orderId || order._id} unlocked after invoice ${invoice.invoiceNumber} cancellation.`
      }], { session });
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

/**
 * Automatically synchronizes an Order's financial states to its linked Invoice.
 * Creates a new Invoice if it doesn't exist, otherwise updates the existing Invoice.
 * Guaranteed 100% backward-compatible.
 */
export const syncOrderInvoice = async (orderId, session = null) => {
  try {
    console.log(`🔄 Syncing Invoices for Order ID: ${orderId}`);
    
    // 1. Fetch Order with populated customer reference
    const order = await Order.findById(orderId).populate("customer").session(session);
    if (!order) {
      console.warn(`⚠️ Order ${orderId} not found, skipping sync.`);
      return null;
    }

    // 2. Fetch all garments to populate item names in Invoice
    const garments = await mongoose.model("Garment")
      .find({ order: orderId, isActive: true })
      .session(session);

    const invoiceItems = [];
    garments.forEach(g => {
      const fabric = Number(g.fabricPrice || 0);
      const additional = Number(g.additionalCharges || 0);
      
      let minVal, maxVal;

      if (g.finalGarmentMinAmount !== undefined && g.finalGarmentMinAmount !== null) {
        minVal = Number(g.finalGarmentMinAmount);
      } else {
        const finalized = Number(g.finalizedAmount !== undefined && g.finalizedAmount !== null ? g.finalizedAmount : g.finalizedPrice);
        const tailoringMin = finalized > 0 ? finalized : Number(g.minPrice || g.priceRange?.min || 0);
        minVal = tailoringMin + fabric + additional;
      }

      if (g.finalGarmentMaxAmount !== undefined && g.finalGarmentMaxAmount !== null) {
        maxVal = Number(g.finalGarmentMaxAmount);
      } else {
        const finalized = Number(g.finalizedAmount !== undefined && g.finalizedAmount !== null ? g.finalizedAmount : g.finalizedPrice);
        const tailoringMax = finalized > 0 ? finalized : Number(g.maxPrice || g.priceRange?.max || 0);
        maxVal = tailoringMax + fabric + additional;
      }
      
      // Primary garment item
      invoiceItems.push({
        name: g.itemName || g.name || "Custom Garment",
        category: g.categoryName || "Stitching",
        qty: 1,
        price: maxVal,
        total: maxVal,
        minPrice: minVal,
        maxPrice: maxVal
      });

      // Sub-garments
      if (g.subGarments && Array.isArray(g.subGarments)) {
        g.subGarments.forEach(sub => {
          const subFabric = Number(sub.fabricPrice || 0);
          const subAdditional = Number(sub.additionalCharges || 0);
          
          let sMin, sMax;

          if (sub.finalGarmentMinAmount !== undefined && sub.finalGarmentMinAmount !== null) {
            sMin = Number(sub.finalGarmentMinAmount);
          } else {
            const finalized = Number(sub.finalizedAmount !== undefined && sub.finalizedAmount !== null ? sub.finalizedAmount : sub.finalizedPrice);
            const tailoringMin = finalized > 0 ? finalized : Number(sub.minPrice || sub.priceRange?.min || 0);
            sMin = tailoringMin + subFabric + subAdditional;
          }

          if (sub.finalGarmentMaxAmount !== undefined && sub.finalGarmentMaxAmount !== null) {
            sMax = Number(sub.finalGarmentMaxAmount);
          } else {
            const finalized = Number(sub.finalizedAmount !== undefined && sub.finalizedAmount !== null ? sub.finalizedAmount : sub.finalizedPrice);
            const tailoringMax = finalized > 0 ? finalized : Number(sub.maxPrice || sub.priceRange?.max || 0);
            sMax = tailoringMax + subFabric + subAdditional;
          }

          invoiceItems.push({
            name: sub.itemName || sub.name || "Sub-Garment",
            category: sub.categoryName || "Stitching",
            qty: 1,
            price: sMax,
            total: sMax,
            minPrice: sMin,
            maxPrice: sMax
          });
        });
      }
    });

    if (invoiceItems.length === 0) {
      const minVal = order.minPrice || order.priceSummary?.totalMin || 0;
      const maxVal = order.maxPrice || order.priceSummary?.totalMax || 0;
      invoiceItems.push({
        name: "Custom Tailoring Services",
        category: "General",
        qty: 1,
        price: maxVal,
        total: maxVal,
        minPrice: minVal,
        maxPrice: maxVal
      });
    }

    // 3. Extract customer billing details
    const customerName = order.customer?.name || "Walk-in Customer";
    const phone = order.customer?.phone || "";

    // 4. Calculate dynamic range-based pricing totals
    let totalMin = 0;
    let totalMax = 0;
    
    if (garments && garments.length > 0) {
      garments.forEach(g => {
        const fabric = Number(g.fabricPrice || 0);
        const additional = Number(g.additionalCharges || 0);

        let minVal, maxVal;
        if (g.finalGarmentMinAmount !== undefined && g.finalGarmentMinAmount !== null) {
          minVal = Number(g.finalGarmentMinAmount);
        } else {
          const finalized = Number(g.finalizedAmount !== undefined && g.finalizedAmount !== null ? g.finalizedAmount : g.finalizedPrice);
          const tailoringMin = finalized > 0 ? finalized : Number(g.minPrice || g.priceRange?.min || 0);
          minVal = tailoringMin + fabric + additional;
        }

        if (g.finalGarmentMaxAmount !== undefined && g.finalGarmentMaxAmount !== null) {
          maxVal = Number(g.finalGarmentMaxAmount);
        } else {
          const finalized = Number(g.finalizedAmount !== undefined && g.finalizedAmount !== null ? g.finalizedAmount : g.finalizedPrice);
          const tailoringMax = finalized > 0 ? finalized : Number(g.maxPrice || g.priceRange?.max || 0);
          maxVal = tailoringMax + fabric + additional;
        }

        totalMin += minVal;
        totalMax += maxVal;

        if (g.subGarments && Array.isArray(g.subGarments)) {
          g.subGarments.forEach(sub => {
            const subFabric = Number(sub.fabricPrice || 0);
            const subAdditional = Number(sub.additionalCharges || 0);

            let sMin, sMax;
            if (sub.finalGarmentMinAmount !== undefined && sub.finalGarmentMinAmount !== null) {
              sMin = Number(sub.finalGarmentMinAmount);
            } else {
              const finalized = Number(sub.finalizedAmount !== undefined && sub.finalizedAmount !== null ? sub.finalizedAmount : sub.finalizedPrice);
              const tailoringMin = finalized > 0 ? finalized : Number(sub.minPrice || sub.priceRange?.min || 0);
              sMin = tailoringMin + subFabric + subAdditional;
            }

            if (sub.finalGarmentMaxAmount !== undefined && sub.finalGarmentMaxAmount !== null) {
              sMax = Number(sub.finalGarmentMaxAmount);
            } else {
              const finalized = Number(sub.finalizedAmount !== undefined && sub.finalizedAmount !== null ? sub.finalizedAmount : sub.finalizedPrice);
              const tailoringMax = finalized > 0 ? finalized : Number(sub.maxPrice || sub.priceRange?.max || 0);
              sMax = tailoringMax + subFabric + subAdditional;
            }

            totalMin += sMin;
            totalMax += sMax;
          });
        }
      });
    } else {
      totalMin = order.minPrice || order.priceSummary?.totalMin || 0;
      totalMax = order.maxPrice || order.priceSummary?.totalMax || 0;
    }

    const paidAmount = order.paymentSummary?.totalPaid || 0;
    const balanceMin = Math.max(0, totalMin - paidAmount);
    const balanceMax = Math.max(0, totalMax - paidAmount);

    // Map payment status casing
    let paymentStatus = "Pending";
    if (balanceMax === 0 && paidAmount > 0) {
      paymentStatus = "Paid";
    } else if (paidAmount > 0) {
      paymentStatus = "Partial";
    }

    // Resolve Invoice Type
    let invoiceType = "Final";
    if (paidAmount > 0 && balanceMax > 0) {
      invoiceType = "Advance";
    } else if (paidAmount > 0 && balanceMax === 0) {
      invoiceType = "Final";
    }

    // 5. Look for any active Invoice linked to this order
    let invoice = await Invoice.findOne({ order: orderId, isDeleted: false }).session(session);

    if (invoice) {
      // ✅ UPDATE EXISTING INVOICE
      console.log(`📝 Found existing invoice ${invoice.invoiceNumber}. Updating...`);
      invoice.customerName = customerName;
      invoice.phone = phone;
      invoice.totalAmount = totalMax;
      invoice.paidAmount = paidAmount;
      invoice.balanceAmount = balanceMax;
      invoice.paymentStatus = paymentStatus;
      invoice.invoiceType = invoiceType;
      invoice.items = invoiceItems;
      
      invoice.summary = {
        subtotal: totalMax,
        discountType: "none",
        discountValue: 0,
        discountAmount: 0,
        taxPercentage: 0,
        taxAmount: 0,
        grandTotal: totalMax,
        paidAmount: paidAmount,
        dueAmount: balanceMax,
        subtotalMin: totalMin,
        subtotalMax: totalMax,
        grandTotalMin: totalMin,
        grandTotalMax: totalMax,
        dueAmountMin: balanceMin,
        dueAmountMax: balanceMax
      };
      
      if (order.specialNotes) {
        invoice.notes = order.specialNotes;
      }
      
      await invoice.save({ session });
      console.log(`✅ Invoice ${invoice.invoiceNumber} successfully updated.`);
    } else {
      // ✅ CREATE NEW INVOICE
      const invoiceNumber = await generateInvoiceNumber();
      console.log(`🆕 Creating new invoice ${invoiceNumber}...`);

      invoice = await Invoice.create([{
        invoiceId: invoiceNumber,
        invoiceNumber,
        orderId: order.orderId,
        orderRef: orderId,
        order: orderId,
        customer: order.customer?._id,
        customerName,
        phone,
        invoiceType,
        totalAmount: totalMax,
        paidAmount,
        balanceAmount: balanceMax,
        paymentStatus,
        items: invoiceItems,
        summary: {
          subtotal: totalMax,
          discountType: "none",
          discountValue: 0,
          discountAmount: 0,
          taxPercentage: 0,
          taxAmount: 0,
          grandTotal: totalMax,
          paidAmount: paidAmount,
          dueAmount: balanceMax,
          subtotalMin: totalMin,
          subtotalMax: totalMax,
          grandTotalMin: totalMin,
          grandTotalMax: totalMax,
          dueAmountMin: balanceMin,
          dueAmountMax: balanceMax
        },
        notes: order.specialNotes || "Auto-generated invoice",
        generatedBy: order.createdBy || orderId
      }], { session });

      invoice = invoice[0];
      console.log(`✅ Invoice ${invoice.invoiceNumber} successfully created.`);
    }

    return invoice;
  } catch (error) {
    console.error("❌ Error inside syncOrderInvoice service helper:", error.message);
    throw error;
  }
};
