// controllers/payment.controller.js — Production Payment Workflow
import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';
import Garment from '../models/Garment.js';

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
const createIncomeFromPayment = async (payment, order, userId) => {
  try {
    const accountType = payment.method === 'cash' ? 'hand-cash' : 'bank';
    const category = mapPaymentTypeToCategory(payment.type);

    const customer = await Customer.findById(payment.customer);
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
    const existing = await Transaction.findOne({ 'metadata.paymentId': payment._id });
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
      });
      if (dup) return dup;
    }

    const transaction = await Transaction.create({
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
    });

    return transaction;
  } catch (error) {
    console.error('❌ Failed to create income transaction:', error.message);
    return null;
  }
};

// ============================================
// 🔧 HELPER — Update income transaction from payment
// ============================================
const updateIncomeFromPayment = async (payment, userId) => {
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
      { new: true }
    );

    if (!transaction) {
      const order = await Order.findById(payment.order);
      await createIncomeFromPayment(payment, order, userId);
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
const deleteIncomeFromPayment = async (paymentId) => {
  try {
    return await Transaction.findOneAndUpdate(
      { 'metadata.paymentId': paymentId },
      { status: 'cancelled', isDeleted: true },
      { new: true }
    );
  } catch (error) {
    console.error('❌ Failed to delete income transaction:', error.message);
    return null;
  }
};

// ============================================
// 🔄 HELPER — Recalculate and persist order payment summary
// ============================================
async function updateOrderPaymentSummary(orderId) {
  try {
    const order = await Order.findById(orderId);
    if (!order) return;

    // Dynamically calculate and self-heal the priceSummary from the actual garments in database
    const garments = await Garment.find({ order: orderId, isActive: true });
    let totalMin = 0;
    let totalMax = 0;
    let totalFinalized = 0;
    if (garments && garments.length > 0) {
      for (const g of garments) {
        const fabric = Number(g.fabricPrice || 0);
        const additional = Number(g.additionalCharges || 0);
        
        let minVal, maxVal, finalVal;

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

        if (g.finalGarmentAmount !== undefined && g.finalGarmentAmount !== null) {
          finalVal = Number(g.finalGarmentAmount);
        } else {
          const rawFinalized = g.finalizedAmount !== undefined && g.finalizedAmount !== null
            ? g.finalizedAmount
            : (g.finalizedPrice !== undefined && g.finalizedPrice !== null
              ? g.finalizedPrice
              : 0);
          finalVal = rawFinalized > 0 ? rawFinalized + fabric + additional : 0;
        }

        totalMin += minVal;
        totalMax += maxVal;
        totalFinalized += finalVal;
      }
      order.minPrice = totalMin;
      order.maxPrice = totalMax;
      order.finalizedAmount = totalFinalized;
      order.priceSummary = { totalMin, totalMax };
    }

    const payments = await Payment.find({
      order: orderId,
      isDeleted: false,
      type: { $in: ['advance', 'full', 'final-settlement'] },
    });

    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const sorted = [...payments].sort(
      (a, b) => new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0)
    );
    const lastPayment = sorted[0];

    // ============================================
    // NEW BUSINESS LOGIC: DYNAMIC FINALIZATION
    // ============================================
    let finalizedAmount = order.finalizedAmount || 0;
    
    // Auto-finalize if paid amount reaches or exceeds minimum
    if (totalMin > 0 && totalPaid >= totalMin) {
      finalizedAmount = totalPaid;
    } else if (totalPaid < totalMin) {
      // Forcefully un-finalize if it drops below the minimum bound (e.g. adding new garments)
      finalizedAmount = 0;
    }

    let balanceMin = 0;
    let balanceMax = 0;
    let balanceAmount = 0; // Legacy fallback

    if (finalizedAmount > 0) {
      // ORDER IS FINALIZED
      balanceAmount = Math.max(0, finalizedAmount - totalPaid);
      balanceMin = balanceAmount;
      balanceMax = balanceAmount;
    } else {
      // ORDER IS NOT FINALIZED -> REMAINS A RANGE
      balanceMin = Math.max(0, totalMin - totalPaid);
      balanceMax = Math.max(0, totalMax - totalPaid);
      balanceAmount = balanceMax; // For backward compatibility if needed elsewhere
    }

    let paymentStatus = 'pending';
    if (finalizedAmount > 0 && balanceAmount === 0 && totalPaid > 0) {
      paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'partial';
    }

    await Order.findByIdAndUpdate(orderId, {
      minPrice: order.minPrice,
      maxPrice: order.maxPrice,
      finalizedAmount,
      dueAmount: balanceAmount,
      priceSummary: order.priceSummary,
      paymentSummary: {
        totalPaid,
        lastPaymentDate: lastPayment?.paymentDate,
        lastPaymentAmount: lastPayment?.amount,
        paymentCount: payments.length,
        paymentStatus,
      },
      balanceAmount,
      balanceMin,
      balanceMax
    });

    console.log(
      `✅ Order payment summary updated — paid: ₹${totalPaid}, balance: ₹${balanceAmount}, status: ${paymentStatus}`
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
    } = req.body;

    // ── Validate required fields ─────────────────────────────────────────────
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    // ── Fetch order ──────────────────────────────────────────────────────────
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // ── Calculate totals ─────────────────────────────────────────────────────
    const existingPayments = await Payment.find({
      order: orderId,
      isDeleted: false,
      type: { $in: ['advance', 'full', 'final-settlement'] },
    });

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
      return res.status(400).json({
        success: false,
        message: 'Payment already completed. This order is finalized and has no outstanding balance.',
      });
    }

    // ── Resolve payment amount and type ─────────────────────────────────────
    let paymentAmount;
    let resolvedType = type || 'advance';

    if (resolvedType === 'full') {
      if (alreadyPaid > 0) {
        // Advance already exists → settle what remains to hit the minimum
        paymentAmount = remainingMin;
        resolvedType = 'final-settlement';
      } else {
        // No prior payments → direct full payment (settle everything at minimum)
        paymentAmount = remainingMin > 0 ? remainingMin : Number(amount);
      }
    } else {
      // advance / final-settlement entered manually
      paymentAmount = Number(amount);

      if (!paymentAmount || paymentAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Valid amount is required' });
      }

      // Clamp to absolute remaining balance (max boundary) — never allow overpayment past the highest possible price
      if (paymentAmount > remainingMax && remainingMax > 0) {
        return res.status(400).json({
          success: false,
          message: `Amount exceeds maximum possible remaining balance of ₹${remainingMax}. Please enter ₹${remainingMax} or less.`,
        });
      }
    }

    const userId = req.user?.id || req.user?._id;

    // ── Create the payment ───────────────────────────────────────────────────
    const payment = await Payment.create({
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
    });

    console.log(
      `✅ Payment created: ${payment._id} | type: ${resolvedType} | amount: ₹${paymentAmount}`
    );

    // ── Side effects ─────────────────────────────────────────────────────────
    await createIncomeFromPayment(payment, order, userId);
    await updateOrderPaymentSummary(orderId);

    return res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment added successfully',
    });
  } catch (error) {
    console.error('❌ Error creating payment:', error.message);
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