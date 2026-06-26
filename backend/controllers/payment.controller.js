// controllers/payment.controller.js — Production Payment Workflow
import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';
import Garment from '../models/Garment.js';
import { buildOrderPricingSummary } from '../utils/pricingEngine.js';
import { assertOrderNotLocked } from '../utils/orderLock.js';

// ============================================
// 🔧 HELPER — Map payment type to income category
// ============================================
const mapPaymentTypeToCategory = (type) => {
  const categoryMap = {
    'advance': 'customer-advance',
    'full': 'full-payment',
    'final-settlement': 'full-payment',
  };
  return categoryMap[type] || 'customer-advance';
};

// ============================================
// 🔧 HELPER — Create income transaction from payment
// ============================================
const createIncomeFromPayment = async (payment, order, userId, session = null) => {
  try {
    const accountType = payment.method === 'cash' ? 'hand-cash' : 'bank';
    const category = mapPaymentTypeToCategory(payment.type);

    const customer = await Customer.findById(payment.customer).session(session);
    const customerDetails = customer
      ? {
        name:
          customer.name ||
          `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
          'Unknown',
        phone: customer.phone,
        id: customer.customerId || customer._id,
      }
      : null;

    // Guard: skip if transaction already recorded for this payment
    const existing = await Transaction.findOne({ 'metadata.paymentId': payment._id }).session(session);
    if (existing) return existing;

    // Secondary duplicate guard (same order + category + amount + method)
    if (payment.order) {
      const dup = await Transaction.findOne({
        order: payment.order,
        type: 'income',
        category,
        amount: payment.amount,
        paymentMethod: payment.method,
        status: 'completed',
      }).session(session);
      if (dup) return dup;
    }

    const transaction = await Transaction.create([{
      type: 'income',
      category,
      amount: payment.amount,
      paymentMethod: payment.method,
      accountType,
      customer: payment.customer,
      customerDetails,
      order: payment.order,
      description: `Payment for Order - ${payment.type} - ₹${payment.amount}${payment.notes ? ` - ${payment.notes}` : ''}`,
      transactionDate: payment.paymentDate || new Date(),
      referenceNumber: payment.referenceNumber || '',
      createdBy: userId,
      status: 'completed',
      metadata: {
        paymentId: payment._id,
        paymentType: payment.type,
        paymentMethod: payment.method,
      },
    }], { session });

    return transaction[0];
  } catch (error) {
    console.error('❌ Failed to create income transaction:', error.message);
    return null;
  }
};

// ============================================
// 🔧 HELPER — Update income transaction from payment
// ============================================
const updateIncomeFromPayment = async (payment, userId, session = null) => {
  try {
    const accountType = payment.method === 'cash' ? 'hand-cash' : 'bank';
    const category = mapPaymentTypeToCategory(payment.type);

    const transaction = await Transaction.findOneAndUpdate(
      { 'metadata.paymentId': payment._id },
      {
        amount: payment.amount,
        category,
        paymentMethod: payment.method,
        accountType,
        referenceNumber: payment.referenceNumber || '',
        description: `Payment for Order - ${payment.type} - ₹${payment.amount}${payment.notes ? ` - ${payment.notes}` : ''}`,
        transactionDate: payment.paymentDate || new Date(),
        updatedBy: userId,
        'metadata.paymentType': payment.type,
        'metadata.paymentMethod': payment.method,
      },
      { new: true, session }
    );

    if (!transaction) {
      const order = await Order.findById(payment.order).session(session);
      await createIncomeFromPayment(payment, order, userId, session);
    }

    return transaction;
  } catch (error) {
    console.error('❌ Failed to update income transaction:', error.message);
    return null;
  }
};

// ============================================
// 🔧 HELPER — Soft-delete income transaction
// ============================================
const deleteIncomeFromPayment = async (paymentId, session = null) => {
  try {
    return await Transaction.findOneAndUpdate(
      { 'metadata.paymentId': paymentId },
      { status: 'cancelled', isDeleted: true },
      { new: true, session }
    );
  } catch (error) {
    console.error('❌ Failed to delete income transaction:', error.message);
    return null;
  }
};

// ============================================
// 🔄 HELPER — Recalculate and persist order payment summary
// ============================================
async function updateOrderPaymentSummary(orderId, session = null) {
  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) return;

    // Dynamically calculate and self-heal the priceSummary from the actual garments in database
    const garments = await Garment.find({ order: orderId, isActive: true }).session(session);
    const payments = await Payment.find({
      order: orderId,
      isDeleted: false,
      type: { $in: ['advance', 'full', 'final-settlement'] },
    }).session(session);

    const summary = buildOrderPricingSummary(garments, payments);

    order.minPrice = summary.totalMin;
    order.maxPrice = summary.totalMax;
    order.priceSummary = { totalMin: summary.totalMin, totalMax: summary.totalMax };

    // Auto-finalize: Only lock to a single "Final Bill Amount" when this is a
    // fixed-price order (min === max). For range-based orders, we intentionally
    // keep finalizedAmount = 0 so the UI stays in "range view" even after full
    // payment. The payment status (paid/partial/pending) is carried by
    // summary.paymentStatus instead.
    const isRangeBased = summary.totalMin !== summary.totalMax;
    let finalizedAmount = 0;
    if (!isRangeBased && summary.totalMin > 0 && summary.totalPaid >= summary.totalMin) {
      finalizedAmount = summary.totalPaid;
    }

    order.finalizedAmount = finalizedAmount;
    order.balanceMin = summary.balanceDueMin;
    order.balanceMax = summary.balanceDueMax;
    order.balanceAmount = summary.balanceDueMax;
    order.dueAmount = summary.balanceDueMax;

    const sorted = [...payments].sort(
      (a, b) => new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0)
    );
    const lastPayment = sorted[0];

    const paymentSummary = {
      totalPaid: summary.totalPaid,
      lastPaymentDate: lastPayment?.paymentDate,
      lastPaymentAmount: lastPayment?.amount,
      paymentCount: payments.length,
      paymentStatus: summary.paymentStatus
    };

    await Order.findByIdAndUpdate(orderId, {
      minPrice: order.minPrice,
      maxPrice: order.maxPrice,
      finalizedAmount,
      dueAmount: order.dueAmount,
      priceSummary: order.priceSummary,
      paymentSummary,
      balanceAmount: order.balanceAmount,
      balanceMin: order.balanceMin,
      balanceMax: order.balanceMax
    }, { session });

    console.log(
      `✅ Order payment summary updated — paid: ₹${summary.totalPaid}, balance: ₹${order.dueAmount}, status: ${summary.paymentStatus}`
    );

    try {
      const { syncOrderInvoice } = await import('../services/invoice.service.js');
      await syncOrderInvoice(orderId);
    } catch (syncErr) {
      console.error('⚠️ Failed to sync order invoice during updateOrderPaymentSummary:', syncErr.message);
    }
  } catch (error) {
    console.error('❌ Error updating order payment summary:', error);
    throw error;
  }
}

// ============================================
// 💰 CREATE PAYMENT
// ============================================
export const createPayment = async (req, res) => {
  try {
    const {
      order: orderId,
      amount,
      type,
      method,
      referenceNumber,
      paymentDate,
      paymentTime,
      notes,
      pricingVersion
    } = req.body;

    // 🔒 Lock Guard
    await assertOrderNotLocked(orderId);

    const session = await mongoose.startSession();
    session.startTransaction();

    // ── Validate required fields ─────────────────────────────────────────────
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    // ── Fetch order ──────────────────────────────────────────────────────────
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // 🔄 Optimistic Concurrency Check
    if (pricingVersion !== undefined && order.pricingVersion !== undefined && order.pricingVersion !== pricingVersion) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        error: "CONFLICT",
        message: "This order has been modified by another session. Please reload before editing.",
        serverVersion: order.pricingVersion
      });
    }

    // ── Calculate totals ─────────────────────────────────────────────────────
    const existingPayments = await Payment.find({
      order: orderId,
      isDeleted: false,
      type: { $in: ['advance', 'full', 'final-settlement'] },
    }).session(session);

    const alreadyPaid = existingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Get minimum and maximum constraints
    const totalMin = order.minPrice || order.priceSummary?.totalMin || 0;
    const totalMax = order.maxPrice || order.priceSummary?.totalMax || order.totalAmount || 0;
    let finalizedAmount = order.finalizedAmount || 0;
    
    // SELF-HEALING before calculating remaining
    if (totalMin > 0 && alreadyPaid >= totalMin) {
      finalizedAmount = alreadyPaid;
    } else if (finalizedAmount === totalMax && alreadyPaid < totalMax && totalMin !== totalMax) {
      finalizedAmount = 0;
    }

    let remainingMax = 0;
    let remainingMin = 0;

    if (finalizedAmount > 0) {
      remainingMin = Math.max(0, finalizedAmount - alreadyPaid);
      remainingMax = remainingMin;
    } else {
      remainingMin = Math.max(0, totalMin - alreadyPaid);
      remainingMax = Math.max(0, totalMax - alreadyPaid);
    }

    console.log(
      `💰 Range: ₹${totalMin}-₹${totalMax} | Paid: ₹${alreadyPaid} | Remaining: ₹${remainingMin}-₹${remainingMax}`
    );

    // ── Block if already fully paid ──────────────────────────────────────────
    if (remainingMax <= 0 || (totalMin > 0 && alreadyPaid >= totalMin)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Payment already completed. This order is finalized and has no outstanding balance.',
      });
    }

    // ── Resolve payment amount and type ─────────────────────────────────────
    // IMPORTANT: Always honour the user's entered amount. Never silently replace
    // it with a calculated value (remainingMin etc.) — that caused ₹1000 to save
    // as ₹996.  We validate against the max boundary and reject if it is
    // exceeded, but we never substitute a different amount.
    const paymentAmount = Number(amount);
    let resolvedType = type || 'advance';

    if (!paymentAmount || paymentAmount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    // Dynamic Type Resolution (Trust backend calculated constraints, not just frontend payload)
    if (paymentAmount >= remainingMin && paymentAmount <= remainingMax && paymentAmount > 0) {
      resolvedType = 'full';
    } else if (paymentAmount < remainingMin) {
      resolvedType = 'advance';
    }

    // When prior advances exist and user selects "full", treat it as a final-settlement
    if (resolvedType === 'full' && alreadyPaid > 0) {
      resolvedType = 'final-settlement';
    }

    // Clamp to absolute remaining balance (max boundary) — never allow overpayment
    if (paymentAmount > remainingMax && remainingMax > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Amount exceeds maximum possible remaining balance of ₹${remainingMax}. Please enter ₹${remainingMax} or less.`,
      });
    }

    const userId = req.user?.id || req.user?._id;

    // ── Create the payment ───────────────────────────────────────────────────
    const paymentArr = await Payment.create([{
      order: orderId,
      customer: order.customer,
      amount: paymentAmount,
      type: resolvedType,
      method: method || 'cash',
      referenceNumber: referenceNumber || '',
      paymentDate: paymentDate || new Date(),
      paymentTime:
        paymentTime ||
        new Date().toLocaleTimeString('en-US', { hour12: false }),
      notes: notes || '',
      receivedBy: userId,
    }], { session });

    const payment = paymentArr[0];

    console.log(
      `✅ Payment created: ${payment._id} | type: ${resolvedType} | amount: ₹${paymentAmount}`
    );

    // ── Side effects ─────────────────────────────────────────────────────────
    await createIncomeFromPayment(payment, order, userId, session);
    
    // Increment version
    order.pricingVersion = (order.pricingVersion || 0) + 1;
    await order.save({ session });
    
    await updateOrderPaymentSummary(orderId, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment added successfully',
    });
  } catch (error) {
    console.error('❌ Error creating payment:', error.message);
    if (mongoose.connection.readyState === 1 && typeof session !== "undefined") {
      await session.abortTransaction();
      session.endSession();
    }
    return res.status(400).json({ success: false, error: error.message });
  }
};

// ============================================
// 📋 GET ORDER PAYMENTS
// ============================================
export const getOrderPayments = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const payments = await Payment.find({ order: orderId, isDeleted: false })
      .populate('receivedBy', 'name email')
      .sort('-paymentDate -paymentTime');

    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// ============================================
// 🔍 GET SINGLE PAYMENT
// ============================================
export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findOne({ _id: id, isDeleted: false })
      .populate('order')
      .populate('customer', 'firstName lastName phone')
      .populate('receivedBy', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error('❌ Error fetching payment:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// ============================================
// ✏️ UPDATE PAYMENT
// ============================================
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findOne({ _id: id, isDeleted: false });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // If amount is being changed, validate against remaining balance
    if (req.body.amount !== undefined) {
      const newAmount = Number(req.body.amount);
      if (!newAmount || newAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Valid amount is required' });
      }

      // Calculate remaining balance excluding this payment
      const otherPayments = await Payment.find({
        order: payment.order,
        isDeleted: false,
        _id: { $ne: payment._id },
        type: { $in: ['advance', 'full', 'final-settlement'] },
      });
      const otherPaid = otherPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const order = await Order.findById(payment.order);
      
      const totalMax = order?.maxPrice || order?.priceSummary?.totalMax || order?.totalAmount || 0;
      const totalMin = order?.minPrice || order?.priceSummary?.totalMin || 0;
      let finalizedAmount = order?.finalizedAmount || 0;
      
      // SELF-HEALING before calculating remaining
      if (totalMin > 0 && otherPaid >= totalMin) {
        finalizedAmount = otherPaid;
      } else if (finalizedAmount === totalMax && otherPaid < totalMax && totalMin !== totalMax) {
        finalizedAmount = 0;
      }

      const absoluteMaxAllowed = finalizedAmount > 0 ? finalizedAmount : totalMax;
      const maxAllowed = Math.max(0, absoluteMaxAllowed - otherPaid);

      if (newAmount > maxAllowed && maxAllowed > 0) {
        return res.status(400).json({
          success: false,
          message: `Amount exceeds maximum remaining balance of ₹${maxAllowed}.`,
        });
      }
    }

    const allowedUpdates = [
      'amount', 'method', 'referenceNumber', 'notes',
      'type', 'paymentDate', 'paymentTime',
    ];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) payment[field] = req.body[field];
    });

    const userId = req.user?.id || req.user?._id;
    payment.updatedBy = userId;
    await payment.save();

    await updateIncomeFromPayment(payment, userId);
    await updateOrderPaymentSummary(payment.order);

    return res.status(200).json({
      success: true,
      data: payment,
      message: 'Payment updated successfully',
    });
  } catch (error) {
    console.error('❌ Error updating payment:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// ============================================
// 🗑️ DELETE PAYMENT (Soft Delete)
// ============================================
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findOne({ _id: id, isDeleted: false });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.isDeleted = true;
    payment.deletedAt = new Date();
    payment.deletedBy = req.user?.id || req.user?._id;
    await payment.save();

    await deleteIncomeFromPayment(payment._id);
    await updateOrderPaymentSummary(payment.order);

    return res.status(200).json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting payment:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// ============================================
// 📊 GET PAYMENT STATISTICS
// ============================================
export const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const match = { isDeleted: false };

    if (startDate || endDate) {
      match.paymentDate = {};
      if (startDate) match.paymentDate.$gte = new Date(startDate);
      if (endDate) match.paymentDate.$lte = new Date(endDate);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayPayments, byMethod, byType, totalStats] = await Promise.all([
      Payment.aggregate([
        { $match: { ...match, paymentDate: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: match },
        { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: match },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            averageAmount: { $avg: '$amount' },
            totalCount: { $sum: 1 },
            maxAmount: { $max: '$amount' },
            minAmount: { $min: '$amount' },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        today: todayPayments[0] || { total: 0, count: 0 },
        byMethod,
        byType,
        summary: totalStats[0] || { totalAmount: 0, totalCount: 0, averageAmount: 0 },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching payment stats:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
};