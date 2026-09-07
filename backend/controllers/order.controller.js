// controllers/order.controller.js
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Garment from "../models/Garment.js";
import Work from "../models/Work.js";
import Invoice from "../models/Invoice.js";
import { logDeletion } from "../utils/auditLogger.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";
import Transaction from "../models/Transaction.js";
import CuttingMaster from "../models/CuttingMaster.js";
import Tailor from "../models/Tailor.js";
import StoreKeeper from "../models/StoreKeeper.js";
import { createNotification } from "./notification.controller.js";
import r2Service from "../services/r2.service.js";
import crypto from "crypto";
import multer from "multer";
import { buildOrderPricingSummary } from "../utils/pricingEngine.js";
import { calculateRangeTotals } from "../utils/rangeUtils.js";
import { assertOrderNotLocked } from "../utils/orderLock.js";
import {
  parseWorkflowStagesInput,
  resolveWorkflowForGarment,
  garmentsHaveWorkflow,
} from "../utils/workflowStages.util.js";
import { computeDraftProgress, computeDraftDisplayName } from "../utils/draftProgress.util.js";
import { isWorkAssigned, checkOrderAssignment } from "../utils/orderAssignment.js";
import { buildOrderPipeline } from "../utils/orderPipeline.util.js";

const enrichOrdersWithAssignedStatus = async (orders) => {
  if (!orders || orders.length === 0) return [];
  const orderIds = orders.map(o => o._id);
  // isWorkAssigned() only inspects .status and .assignments[].workerId, so the
  // rest of the Work document (the largest average document in the database at
  // ~2.7 KB) never needs to leave MongoDB. Batched $in, as before — not N+1.
  const works = await Work.find(
    { order: { $in: orderIds } },
    { order: 1, status: 1, 'assignments.workerId': 1 }
  ).lean();
  
  const worksByOrder = {};
  works.forEach(w => {
    const oid = w.order.toString();
    if (!worksByOrder[oid]) worksByOrder[oid] = [];
    worksByOrder[oid].push(w);
  });

  return orders.map(order => {
    const orderObj = order.toObject ? order.toObject() : order;
    const orderWorks = worksByOrder[orderObj._id.toString()] || [];
    orderObj.isAssigned = orderWorks.some(isWorkAssigned);
    return orderObj;
  });
};

const enrichSingleOrder = async (order) => {
  if (!order) return null;
  const orderObj = order.toObject ? order.toObject() : order;
  orderObj.isAssigned = await checkOrderAssignment(orderObj._id);
  return orderObj;
};

// Configure multer for memory storage
export const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ============================================
// ✅ HELPER: EXTRACT FILES FROM REQUEST
// ============================================
const extractGarmentFiles = (req) => {
  console.log("\n📎 EXTRACTING FILES FROM REQUEST");
  
  const fileGroups = {};
  
  if (!req.files || req.files.length === 0) {
    console.log("⚠️ No files found in request");
    return fileGroups;
  }

  req.files.forEach(file => {
    const match = file.fieldname.match(/garments\[(\d+)\]\.(\w+)/);
    if (match) {
      const index = parseInt(match[1]);
      const type = match[2];
      
      if (!fileGroups[index]) {
        fileGroups[index] = {
          referenceImages: [],
          customerImages: [],
          customerClothImages: []
        };
      }
      
      fileGroups[index][type].push(file);
      console.log(`📸 File for garment ${index}: ${type} - ${file.originalname}`);
    } else {
      console.log(`⚠️ Unmatched fieldname format: ${file.fieldname}`);
    }
  });
  
  console.log(`✅ Grouped files for ${Object.keys(fileGroups).length} garments`);
  return fileGroups;
};

// ============================================
// ✅ HELPER: CREATE INCOME FROM PAYMENT
// ============================================
const createIncomeFromPayment = async (payment, order, creatorId) => {
  try {
    console.log(`💰 Creating income from payment: ₹${payment.amount}`);
    
    const accountType = payment.method === 'cash' ? 'hand-cash' : 'bank';
    
    let category = 'customer-advance';
    if (payment.type === 'full') {
      category = 'full-payment';
    } else if (payment.type === 'advance' && order.paymentSummary?.paymentStatus === 'paid') {
      category = 'full-payment';
    } else if (payment.type === 'extra') {
      category = 'fabric-sale';
    }
    
    const customer = await Customer.findById(order.customer);
    
    const incomeTransaction = await Transaction.create({
      type: 'income',
      category: category,
      amount: payment.amount,
      paymentMethod: payment.method,
      accountType: accountType,
      customer: order.customer,
      customerDetails: customer ? {
        name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        phone: customer.phone,
        id: customer.customerId || customer._id
      } : null,
      order: order._id,
      description: `Payment for Order #${order.orderId} - ${payment.notes || payment.type || 'advance'}`,
      transactionDate: payment.paymentDate || new Date(),
      referenceNumber: payment.referenceNumber || '',
      createdBy: creatorId,
      status: 'completed',
      metadata: {
        paymentId: payment._id,
        paymentType: payment.type,
        paymentMethod: payment.method,
      },
    });

    console.log(`✅ Income created: ₹${payment.amount} (${category}) - ${accountType}`);
    return incomeTransaction;
  } catch (error) {
    console.error("❌ Error creating income:", error);
    return null;
  }
};

// ============================================
// ✅ HELPER: UPDATE ORDER PAYMENT SUMMARY
// ============================================
// session is optional and defaults to null, so the existing callers that pass
// nothing behave exactly as before. It is supplied by the cancellation flow so
// the recompute commits inside the same transaction as the payment reversal.
export const updateOrderPaymentSummary = async (orderId, session = null) => {
  console.log(`\n💰 Updating payment summary for order: ${orderId}`);

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) return;

    const payments = await Payment.find({
      order: orderId,
      isDeleted: false,
      type: { $in: ['advance', 'full', 'final-settlement'] }
    }).session(session);

    const garments = await Garment.find({ order: orderId, isActive: true }).session(session);
    
    const summary = buildOrderPricingSummary(garments, payments);
    
    order.minPrice = summary.totalMin;
    order.maxPrice = summary.totalMax;
    order.priceSummary = { totalMin: summary.totalMin, totalMax: summary.totalMax };
    
    order.balanceMin = summary.balanceDueMin;
    order.balanceMax = summary.balanceDueMax;
    // Legacy support
    order.balanceAmount = summary.balanceDueMax;
    order.dueAmount = summary.balanceDueMax;

    // Auto-finalize
    if (summary.totalMin > 0 && summary.totalPaid >= summary.totalMin) {
      order.finalizedAmount = summary.totalPaid;
    } else {
      order.finalizedAmount = 0;
    }

    const lastPayment = payments.sort((a, b) => 
      new Date(b.paymentDate) - new Date(a.paymentDate)
    )[0];

    order.paymentSummary = {
      totalPaid: summary.totalPaid,
      lastPaymentDate: lastPayment?.paymentDate,
      lastPaymentAmount: lastPayment?.amount,
      paymentCount: payments.length,
      paymentStatus: summary.paymentStatus
    };
    
    await order.save({ session });
    console.log(`✅ Payment summary updated: Paid: ₹${summary.totalPaid}, Status: ${summary.paymentStatus}`);

    return { success: true, totalPaid: summary.totalPaid, paymentStatus: summary.paymentStatus };
  } catch (error) {
    console.error("❌ Error updating payment summary:", error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ✅ HELPER: CREATE WORKS FROM EXISTING GARMENTS (UPDATED WITH DYNAMIC COPIED WORKFLOW)
// ============================================
const createWorksFromGarments = async (orderId, garmentIds, creatorId, session = null) => {
  console.log("\n🚀 ===== CREATE WORKS FROM GARMENTS =====");
  console.log(`📦 Order ID: ${orderId}`);
  console.log(`👕 Garment IDs:`, garmentIds);
  console.log(`👤 Creator ID: ${creatorId}`);
  
  try {
    if (!garmentIds || garmentIds.length === 0) {
      console.log("⚠️ No garment IDs provided, skipping work creation");
      return { success: true, works: [] };
    }
    
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      console.log("❌ Order not found!");
      return { success: false, error: 'Order not found' };
    }
    
    console.log(`📋 Order found: ${order.orderId}`);
    
    console.log("🔍 Checking for existing works...");
    const existingWorks = await Work.find({ 
      garment: { $in: garmentIds },
      isActive: true 
    }).session(session);
    
    if (existingWorks.length > 0) {
      console.log(`⚠️ Works already exist for ${existingWorks.length} garments, skipping creation`);
      return { success: true, works: existingWorks };
    }
    
    console.log("📦 Fetching garment documents...");
    const garmentDocs = await Garment.find({ _id: { $in: garmentIds } }).session(session).lean();
    console.log(`📦 Found ${garmentDocs.length} garments in database`);
    
    const createdWorks = [];

    for (const garment of garmentDocs) {
      const workCount = await Work.countDocuments({ order: orderId, isActive: true }).session(session);
      const sequence = workCount + 1;
      const seqStr = sequence < 100 ? String(sequence).padStart(2, "0") : String(sequence);
      const workId = `${order.orderId}.${seqStr}`;
      
      console.log(`🧵 Generated Work ID: ${workId} (Sequence: ${sequence} for order ${order.orderId})`);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      console.log(`📝 Creating work for garment: ${garment.name || garment._id}`);

      const garmentWorkflow = resolveWorkflowForGarment(garment, order);
      const stageKeys = garmentWorkflow.stageKeys;
      const workflowStages = garmentWorkflow.workflowStages;
      const activeStage = stageKeys[0] || order.currentStage || "cutting";

      const [work] = await Work.create([{
        workId,
        order: orderId,
        garment: garment._id,
        createdBy: creatorId,
        status: "pending",
        cuttingMaster: null,
        currentStage: activeStage,
        workflowStages,
        stageKeys,
        estimatedDelivery: garment.estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000)
      }], { session });
      
      createdWorks.push(work);
      
      await Garment.findByIdAndUpdate(garment._id, { workId: work._id }, { session });
      console.log(`✅ Created work: ${work._id} (${work.workId})`);
    }
    
    console.log(`✅ Created ${createdWorks.length} works sequentially`);
    
    if (createdWorks.length > 0) {
      console.log("\n🔔 ATTEMPTING TO SEND NOTIFICATIONS TO CUTTING MASTERS...");
      const cuttingMasters = await CuttingMaster.find({ isActive: true }).lean();
      console.log(`✂️ Found ${cuttingMasters.length} active cutting masters`);
      
      if (cuttingMasters.length > 0) {
        for (const master of cuttingMasters) {
          try {
            const notificationData = {
              type: 'work-available',
              recipient: master._id,
              title: '🔔 New Work Available',
              message: `${createdWorks.length} new work(s) are waiting for your acceptance`,
              reference: {
                orderId: orderId,
                workCount: createdWorks.length,
                workIds: createdWorks.map(w => w._id)
              },
              priority: 'high',
              recipientModel: 'CuttingMaster'
            };
            
            await createNotification(notificationData);
            console.log(`✅ Notification sent to master: ${master.name || master._id}`);
          } catch (notifyError) {
            console.error(`❌ Failed to send notification to ${master._id}:`, notifyError.message);
          }
        }
      } else {
        console.log("⚠️ NO ACTIVE CUTTING MASTERS FOUND!");
      }
    }
    
    return { success: true, works: createdWorks };
  } catch (error) {
    console.error("\n❌ ERROR CREATING WORKS:", error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ✅ HELPER: GENERATE ORDER ID (YYYYMMDD + AUTO-GROW SEQUENCE)
// ============================================
const generateOrderId = async () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const datePart = `${yyyy}${mm}${dd}`;

  try {
    const latestOrder = await Order.findOne(
      { orderId: { $regex: `^${datePart}` } },
      { orderId: 1 },
      { sort: { orderId: -1 } }
    );

    let sequence = 1;
    if (latestOrder && latestOrder.orderId) {
      const existingSeq = latestOrder.orderId.replace(datePart, '').replace('-', '');
      const parsed = parseInt(existingSeq, 10);
      if (!isNaN(parsed)) {
        sequence = parsed + 1;
      }
    }

    const seqStr = sequence < 100 ? String(sequence).padStart(2, "0") : String(sequence);
    const orderId = `${datePart}${seqStr}`;
    
    console.log(`📋 Generated Order ID: ${orderId} (Sequence: ${sequence})`);
    return orderId;
  } catch (error) {
    const fallbackId = `${datePart}-${Date.now().toString(36)}`;
    console.log(`📋 Fallback Order ID: ${fallbackId}`);
    return fallbackId;
  }
};

// ============================================
// ✅ 1. GET ORDER STATS
// ============================================
export const getOrderStats = async (req, res) => {
  console.log("\n📊 ===== GET ORDER STATS =====");
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayCount, weekCount, monthCount, totalCount, overdueCount, paymentPendingCount, cuttingCount, stitchingCount, trialCount, finishingCount] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today }, isActive: true }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek }, isActive: true }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth }, isActive: true }),
      Order.countDocuments({ isActive: true }),
      Order.countDocuments({ deliveryDate: { $lt: today }, status: { $nin: ['delivered', 'cancelled'] }, isActive: true }),
      Order.countDocuments({ 'paymentSummary.paymentStatus': 'pending', isActive: true }),
      Order.countDocuments({ $or: [{ status: 'cutting' }, { currentStage: 'cutting', status: { $nin: ['cancelled', 'delivered'] } }], isActive: true }),
      Order.countDocuments({ $or: [{ status: 'stitching' }, { currentStage: 'stitching', status: { $nin: ['cancelled', 'delivered'] } }], isActive: true }),
      Order.countDocuments({ $or: [{ status: 'trial' }, { currentStage: 'trial', status: { $nin: ['cancelled', 'delivered'] } }], isActive: true }),
      Order.countDocuments({ $or: [{ status: 'finishing' }, { currentStage: 'finishing', status: { $nin: ['cancelled', 'delivered'] } }], isActive: true })
    ]);

    const statusStats = await Order.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const paymentStats = await Order.aggregate([
      { $match: { isActive: true } },
      { $group: { 
        _id: "$paymentSummary.paymentStatus",
        count: { $sum: 1 },
        totalAmount: { $sum: { $ifNull: ["$finalizedAmount", "$priceSummary.totalMax"] } },
        totalPaid: { $sum: "$paymentSummary.totalPaid" }
      }}
    ]);
    
    // Calculate total revenue across all payment statuses
    const revenue = paymentStats.reduce((sum, stat) => sum + stat.totalPaid, 0);
    
    // Map status breakdown to flat object
    const statusCounts = {};
    let inProgressCount = 0;
    
    statusStats.forEach(stat => {
      const status = stat._id ? stat._id.toLowerCase() : 'unknown';
      statusCounts[status] = stat.count;
      
      // In Production logic: active production stages
      if (['in-progress', 'progress', 'cutting', 'stitching', 'trial', 'finishing'].includes(status)) {
        inProgressCount += stat.count;
      }
    });

    const draftsCount = await Order.countDocuments({ isDraftOrder: true });

    res.status(200).json({
      success: true,
      stats: {
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        total: totalCount,

        // Exact flat fields for OrdersKPI.jsx (handle synonyms)
        pending: paymentPendingCount,
        inProgress: inProgressCount,
        ready: (statusCounts['ready-to-delivery'] || 0) + (statusCounts['ready-to-deliver'] || 0) + (statusCounts['ready'] || 0),
        overdue: overdueCount,
        revenue: revenue,

        // Exact flat fields for OrderFilterTabs.jsx
        ...statusCounts,
        cutting: cuttingCount,
        stitching: stitchingCount,
        trial: trialCount,
        finishing: finishingCount,
        __drafts: draftsCount,
        draftsCount,

        // Legacy fallback
        statusBreakdown: statusStats,
        paymentBreakdown: paymentStats
      }
    });
  } catch (error) {
    console.error("❌ Stats Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 2. CREATE ORDER (WITH DYNAMIC CUSTOM WORKFLOW PROPAGATION)
// ============================================
export const createOrder = async (req, res) => {
  console.log("\n🆕 ===== CREATE ORDER =====");
  
  try {
    let orderData = { ...req.body };
    
    if (typeof orderData.garments === 'string') {
      try { orderData.garments = JSON.parse(orderData.garments); } catch (e) {}
    }
    if (typeof orderData.payments === 'string') {
      try { orderData.payments = JSON.parse(orderData.payments); } catch (e) {}
    }
    if (typeof orderData.advancePayment === 'string') {
      try { orderData.advancePayment = JSON.parse(orderData.advancePayment); } catch (e) {}
    }
    if (typeof orderData.workflowStages === 'string') {
      try { orderData.workflowStages = JSON.parse(orderData.workflowStages); } catch (e) {}
    }

    const {
      customer,
      deliveryDate,
      garments,
      specialNotes,
      priceSummary,
      status,
      orderDate,
      payments = [],
      requestId,
      workflowStages: rawWorkflowStages,
    } = orderData;

    let incomingStages = Array.isArray(rawWorkflowStages) ? rawWorkflowStages : [];

    let processedStages = incomingStages
      .map((stage, index) => {
        if (typeof stage === "string") {
          const cleanKey = stage.trim().toLowerCase().replace(/\s+/g, "_");
          const cleanLabel = stage.trim().replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          return { key: cleanKey, label: cleanLabel, order: index + 1 };
        }
        if (stage && typeof stage === "object") {
          const rawKey = stage.key || stage.name || stage.label || stage.stageName || stage.title;
          if (!rawKey) return null;
          const cleanKey = String(rawKey).trim().toLowerCase().replace(/\s+/g, "_");
          return {
            key: cleanKey,
            label: stage.label || cleanKey.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            order: stage.order || index + 1,
          };
        }
        return null;
      })
      .filter(Boolean);

    const perGarmentWorkflow = garmentsHaveWorkflow(garments);

    if (processedStages.length === 0 && !perGarmentWorkflow) {
      const defaultKeys = ["cutting", "stitching", "ironing", "packed"];
      processedStages = defaultKeys.map((k, i) => ({
        key: k,
        label: k.charAt(0).toUpperCase() + k.slice(1),
        order: i + 1,
      }));
    }

    const stageKeys = processedStages.map((s) => s.key);
    const activeStage = stageKeys[0] || "new";
    const workflowStagesObj = {};

    stageKeys.forEach((key) => {
      workflowStagesObj[key] = {
        completed: false,
        completedAt: null,
        assignedTo: null,
      };
    });

    const creatorId = req.user?._id || req.user?.id;
    if (!creatorId) {
      return res.status(401).json({ success: false, message: "Authentication failed" });
    }

    if (!customer || !deliveryDate) {
      return res.status(400).json({ success: false, message: "Customer and Delivery Date are required" });
    }

    if (requestId) {
      const existingOrder = await Order.findOne({ 'metadata.requestId': requestId });
      if (existingOrder) {
        return res.status(200).json({ 
          success: true, 
          message: "Order already exists",
          order: existingOrder,
          duplicate: true
        });
      }
    }

    const orderId = await generateOrderId();

    let totalMin = 0;
    let totalMax = 0;
    
    if (garments && garments.length > 0) {
      garments.forEach((g) => {
        if (g.finalGarmentMinAmount !== undefined && g.finalGarmentMinAmount !== null) {
          totalMin += Number(g.finalGarmentMinAmount);
        } else {
          const finalized = Number(g.finalizedAmount !== undefined && g.finalizedAmount !== null ? g.finalizedAmount : g.finalizedPrice);
          const tailoringMin = finalized > 0 ? finalized : Number(g.minPrice || g.priceRange?.min || 0);
          const fabric = Number(g.fabricPrice || 0);
          const additional = Number(g.additionalCharges || 0);
          totalMin += tailoringMin + fabric + additional;
        }

        if (g.finalGarmentMaxAmount !== undefined && g.finalGarmentMaxAmount !== null) {
          totalMax += Number(g.finalGarmentMaxAmount);
        } else {
          const finalized = Number(g.finalizedAmount !== undefined && g.finalizedAmount !== null ? g.finalizedAmount : g.finalizedPrice);
          const tailoringMax = finalized > 0 ? finalized : Number(g.maxPrice || g.priceRange?.max || 0);
          const fabric = Number(g.fabricPrice || 0);
          const additional = Number(g.additionalCharges || 0);
          totalMax += tailoringMax + fabric + additional;
        }
      });
    } else if (priceSummary) {
      totalMin = Number(priceSummary.totalMin) || 0;
      totalMax = Number(priceSummary.totalMax) || 0;
    }

    const allPayments = [...payments];
    const totalInitialPaid = allPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // ── Pre-transaction ───────────────────────────────────────────────
    // The Order _id is generated here rather than by the insert, so image
    // uploads can use the final key path (orders/<id>/...) while still
    // running OUTSIDE the transaction. R2 writes cannot be rolled back and
    // are slow, so keeping them out bounds how long the transaction holds
    // locks. If the transaction later aborts the uploaded objects are
    // orphaned in R2 - a storage cost, never a data-integrity problem.
    const orderObjectId = new mongoose.Types.ObjectId();
    const fileGroups = extractGarmentFiles(req);

    const uploadedByIndex = [];
    if (garments && garments.length > 0) {
      for (let i = 0; i < garments.length; i++) {
        const up = { referenceImages: [], customerImages: [], customerClothImages: [] };
        if (fileGroups[i]?.referenceImages?.length > 0) {
          up.referenceImages = await r2Service.uploadMultiple(fileGroups[i].referenceImages, `orders/${orderObjectId}/garment_${i}/reference`);
        }
        if (fileGroups[i]?.customerImages?.length > 0) {
          up.customerImages = await r2Service.uploadMultiple(fileGroups[i].customerImages, `orders/${orderObjectId}/garment_${i}/customer`);
        }
        if (fileGroups[i]?.customerClothImages?.length > 0) {
          up.customerClothImages = await r2Service.uploadMultiple(fileGroups[i].customerClothImages, `orders/${orderObjectId}/garment_${i}/cloth`);
        }
        uploadedByIndex.push(up);
      }
    }

    // ── Transaction ───────────────────────────────────────────────────
    // Order + Payments + Garments + Works now commit together or not at
    // all. Previously these were four independent writes, so a failure
    // partway left a committed order carrying payments but no garments.
    const createdPayments = [];
    const createdGarmentIds = [];
    let order;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Reset per attempt: withTransaction may retry this callback.
        createdPayments.length = 0;
        createdGarmentIds.length = 0;

        const [createdOrder] = await Order.create([{
      _id: orderObjectId,
      orderId,
      customer,
      deliveryDate,
      currentStage: perGarmentWorkflow ? "new" : activeStage,
      workflowStages: perGarmentWorkflow ? {} : workflowStagesObj,
      stageKeys: perGarmentWorkflow ? [] : stageKeys,
      specialNotes,
      advancePayment: {
        amount: allPayments.find(p => p.type === 'advance')?.amount || 0,
        method: allPayments.find(p => p.type === 'advance')?.method || allPayments[0]?.method || 'cash',
        date: new Date(),
      },
      minPrice: totalMin,
      maxPrice: totalMax,
      finalizedAmount: 0,
      dueAmount: totalInitialPaid >= totalMin ? 0 : Math.max(0, totalMax - totalInitialPaid),
      balanceMin: totalInitialPaid >= totalMin ? 0 : Math.max(0, totalMin - totalInitialPaid),
      balanceMax: totalInitialPaid >= totalMin ? 0 : Math.max(0, totalMax - totalInitialPaid),
      priceSummary: { totalMin, totalMax },
      paymentSummary: {
        totalPaid: totalInitialPaid,
        lastPaymentDate: allPayments.length > 0 ? new Date() : null,
        lastPaymentAmount: allPayments.length > 0 ? allPayments[allPayments.length - 1].amount : 0,
        paymentCount: allPayments.length,
        paymentStatus: totalInitialPaid >= totalMin ? 'paid' : (totalInitialPaid > 0 ? 'partial' : 'pending')
      },
      balanceAmount: totalInitialPaid >= totalMin ? 0 : Math.max(0, totalMax - totalInitialPaid),
      createdBy: creatorId,
      status: status || "draft",
      orderDate: orderDate || new Date(),
      metadata: {
        requestId: requestId || null,
        createdAt: new Date()
      }
    }], { session });
        order = createdOrder;

    if (allPayments.length > 0) {
      const existingPayments = await Payment.find({ order: order._id }).session(session);
      if (existingPayments.length === 0) {
        let runningPaid = 0;
        for (const paymentData of allPayments) {
          let safeAmount = Number(paymentData.amount) || 0;
          runningPaid += safeAmount;
          
          const now = new Date();
          const paymentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
          
          await new Promise(resolve => setTimeout(resolve, 10));
          
          const [payment] = await Payment.create([{
            order: order._id,
            customer: order.customer,
            amount: safeAmount,
            type: paymentData.type || 'advance',
            method: paymentData.method || 'cash',
            referenceNumber: paymentData.referenceNumber || '',
            paymentDate: paymentData.paymentDate || new Date(),
            paymentTime: paymentTime,
            notes: paymentData.notes || '',
            receivedBy: creatorId,
            balanceMinAfterPayment: runningPaid >= totalMin ? 0 : Math.max(0, totalMin - runningPaid),
            balanceMaxAfterPayment: runningPaid >= totalMin ? 0 : Math.max(0, totalMax - runningPaid),
            metadata: { requestId: requestId }
          }], { session });
          
          await createIncomeFromPayment(payment, order, creatorId, session);
          createdPayments.push(payment);
        }
      }
    }

    if (garments && garments.length > 0) {
      const existingGarments = await Garment.find({ order: order._id }).session(session);
      if (existingGarments.length === 0) {
        for (let i = 0; i < garments.length; i++) {
          const g = garments[i];
          if (i > 0) await new Promise(resolve => setTimeout(resolve, 50));

          // Already uploaded before the transaction opened.
          const uploadedImages = uploadedByIndex[i]
            || { referenceImages: [], customerImages: [], customerClothImages: [] };

          const garmentWorkflow = parseWorkflowStagesInput(
            g.stageKeys?.length ? g.stageKeys : g.workflowStages,
          );

          const garmentData = {
            name: g.name,
            garmentType: g.garmentType || g.item || g.itemName || g.name,
            category: g.category,
            item: g.item,
            categoryName: g.categoryName,
            itemName: g.itemName,
            measurements: g.measurements || [],
            measurementTemplate: g.measurementTemplate && g.measurementTemplate !== '' ? g.measurementTemplate : null,
            measurementSource: g.measurementSource || 'customer',
            additionalInfo: g.additionalInfo || '',
            estimatedDelivery: g.estimatedDelivery || deliveryDate,
            priority: g.priority || 'normal',
            priceRange: { min: Number(g.priceRange?.min) || 0, max: Number(g.priceRange?.max) || 0 },
            finalizedPrice: Number(g.finalizedAmount || g.finalizedPrice) || 0,
            finalizedAmount: Number(g.finalizedAmount || g.finalizedPrice) || 0,
            minPrice: Number(g.minPrice || g.priceRange?.min) || 0,
            maxPrice: Number(g.maxPrice || g.priceRange?.max) || 0,
            fabricSource: g.fabricSource || 'customer',
            fabricPrice: g.fabricPrice || '0',
            fabricMeters: g.fabricMeters || '',
            fabricNotes: g.fabricNotes || '',
            fabricSufficiency: g.fabricSufficiency || 'To Be Verified',
            selectedFabric: g.selectedFabric && g.selectedFabric !== '' ? g.selectedFabric : null,
            referenceImages: uploadedImages.referenceImages,
            customerImages: uploadedImages.customerImages,
            customerClothImages: uploadedImages.customerClothImages,
            stageKeys: garmentWorkflow.stageKeys,
            workflowStages: garmentWorkflow.workflowStages,
            order: order._id,
            createdBy: creatorId,
            status: 'pending',
            metadata: { requestId: requestId, sequence: i + 1 }
          };

          const [garment] = await Garment.create([garmentData], { session });
          createdGarmentIds.push(garment._id);
        }
        
        order.garments = createdGarmentIds;
        // Automatically move to in-progress since job cards/works are generated
        order.status = "in-progress";
        await order.save({ session });
        
        if (createdGarmentIds.length > 0) {
          await createWorksFromGarments(order._id, createdGarmentIds, creatorId, session);
        }
      }
    }
      });
    } finally {
      await session.endSession();
    }

    // Post-commit. Deliberately outside the transaction: WhatsApp is an
    // external call, and syncOrderInvoice opens a transaction of its own
    // (invoice.service.js), which cannot be nested inside this one.
    await order.populate('customer', 'name phone customerId');

    try {
      const { sendOrderConfirmation } = await import('./whatsapp.controller.js');
      sendOrderConfirmation(order._id).catch(() => {});
    } catch (waErr) {}

    try {
      const { syncOrderInvoice } = await import('../services/invoice.service.js');
      await syncOrderInvoice(order._id);
    } catch (syncErr) {}

    res.status(201).json({ success: true, message: "Order created successfully", order });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    
    // Lost the race on the requestId unique index: a concurrent submit with
    // the same requestId committed first. The pre-flight check above cannot
    // catch this - both requests pass the find before either writes - so the
    // index is what actually enforces it, and this returns the order that won
    // rather than surfacing a database error to the user.
    if (error.code === 11000 && error.keyPattern?.['metadata.requestId']) {
      const winner = await Order.findOne({ 'metadata.requestId': req.body?.requestId });
      if (winner) {
        return res.status(200).json({
          success: true,
          message: "Order already exists",
          order: winner,
          duplicate: true
        });
      }
    }

    if ((error.code === 11000 && error.keyPattern?.orderId) || (error.message && error.message.includes('Order ID already exists'))) {
      req._orderRetryCount = (req._orderRetryCount || 0) + 1;
      if (req._orderRetryCount <= 5) return createOrder(req, res);
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 3. GET ALL ORDERS
// ============================================
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, paymentStatus, timeFilter = "all", startDate, endDate } = req.query;
    let query = { isActive: true };

    if (search) {
      // Independent lookups — run concurrently rather than back to back.
      const [customerIds, garmentIds] = await Promise.all([
        Customer.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { customerId: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        }).distinct('_id'),
        Garment.find({ name: { $regex: search, $options: 'i' } }).distinct('_id')
      ]);

      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customer: { $in: customerIds } },
        { garments: { $in: garmentIds } },
        { status: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== "all") {
      if (status === 'draft') {
        query.status = { $in: ['draft', 'pending'] };
      } else if (status === 'in-progress') {
        query.status = { $in: ['in-progress', 'progress', 'cutting', 'stitching', 'trial', 'finishing'] };
      } else if (status === 'ready-to-delivery') {
        query.status = { $in: ['ready-to-delivery', 'ready-to-deliver', 'ready'] };
      } else if (status === '__overdue') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query.deliveryDate = { $lt: today };
        query.status = { $nin: ['delivered', 'cancelled'] };
      } else if (['cutting', 'stitching', 'trial', 'finishing'].includes(status)) {
        // Safe mapping to capture current stage even if explicit status hasn't synced
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { status: status },
            { currentStage: status }
          ]
        });
      } else {
        query.status = status;
      }
    }
    if (paymentStatus && paymentStatus !== "all") query['paymentSummary.paymentStatus'] = paymentStatus;

    if (timeFilter !== "all") {
      let filterDate = new Date();
      if (timeFilter === "week") filterDate.setDate(filterDate.getDate() - 7);
      else if (timeFilter === "month") filterDate.setMonth(filterDate.getMonth() - 1);
      else if (timeFilter === "3m") filterDate.setMonth(filterDate.getMonth() - 3);
      query.createdAt = { $gte: filterDate };
    }

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // The count and the page fetch are independent — one wave, not two.
    //
    // populate("garments") previously pulled entire garment documents
    // (measurements, pricing, workflow stages and all). The orders table only
    // renders the garment count, name, itemName and the first available image,
    // so only those fields are fetched. The Order document itself is NOT
    // projected: other consumers read fields such as order.metadata, and
    // narrowing the parent document is a separate, riskier change.
    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .populate('customer', 'name phone customerId')
        .populate('garments', 'name itemName referenceImages customerImages customerClothImages')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
    ]);

    const enrichedOrders = await enrichOrdersWithAssignedStatus(orders);
    res.json({ success: true, orders: enrichedOrders, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 4. GET ORDER BY ID
// ============================================
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone whatsappNumber customerId email address addressLine1 addressLine2 city state pincode')
      .populate({
        path: "garments",
        populate: [
          { path: "category", select: "name" },
          { path: "item", select: "name" },
          { path: "workId" },
          { path: "selectedFabric" }
        ]
      })
      .populate("createdBy", "name");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const payments = await Payment.find({ order: order._id, isDeleted: false })
      .populate('receivedBy', 'name')
      .sort('-paymentDate -paymentTime');

    // Single query for every Work on this order (Work.order is indexed) — the
    // production pipeline below is computed from exactly these records, so no
    // per-garment, per-work or per-stage query is ever issued.
    // .select() lists only the fields buildOrderPipeline() and the Order Detail
    // UI read; it drops scanLogs[]/history[], which grow unboundedly and were
    // previously serialized into every Order Detail response.
    const works = await Work.find({ order: order._id, isActive: true })
      .select('workId order garment status currentStage overallStatus stageKeys workflowStages workflowProgress assignments estimatedDelivery isActive')
      .populate('garment', 'name item category stageKeys workflowStages')
      .lean();

    // Calculated projection, not persisted state. Kept top-level alongside
    // works/payments rather than folded into the Order document.
    const pipeline = buildOrderPipeline(order, works);

    const enrichedOrder = await enrichSingleOrder(order);
    res.json({ success: true, order: enrichedOrder, payments, works, pipeline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 5. UPDATE ORDER (SAFE DYNAMIC COMPONENT MERGE)
// ============================================
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryDate, specialNotes, advancePayment, priceSummary, status, newGarments, currentStage, workflowStages, pricingVersion } = req.body;

    // 🔒 Lock Guard
    await assertOrderNotLocked(id);

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // 🔄 Optimistic Concurrency Check
    if (pricingVersion !== undefined && order.pricingVersion !== undefined && order.pricingVersion !== pricingVersion) {
      return res.status(409).json({
        success: false,
        error: "CONFLICT",
        message: "This order has been modified by another session. Please reload before editing.",
        serverVersion: order.pricingVersion
      });
    }

    if (deliveryDate) order.deliveryDate = deliveryDate;
    if (specialNotes !== undefined) order.specialNotes = specialNotes;
    if (currentStage) order.currentStage = currentStage;
    
    // FIX: Dynamic structural update. No hardcoded Whitelist chains!
    if (workflowStages && typeof workflowStages === 'object') {
      if (!order.workflowStages) order.workflowStages = {};
      
      // Sync whatever dynamic keys came directly from the payload structure safely
      Object.keys(workflowStages).forEach(key => {
        const currentStageVal = order.workflowStages[key];
        const currentStageObj = currentStageVal && typeof currentStageVal === 'object'
          ? (typeof currentStageVal.toObject === 'function' ? currentStageVal.toObject() : currentStageVal)
          : {};
        
        order.workflowStages[key] = {
          ...currentStageObj,
          ...workflowStages[key]
        };
      });
      order.markModified('workflowStages');
    }

    if (advancePayment) {
      order.advancePayment = {
        amount: advancePayment.amount !== undefined ? advancePayment.amount : order.advancePayment.amount,
        method: advancePayment.method || order.advancePayment.method,
        date: advancePayment.date || order.advancePayment.date || new Date()
      };
    }
    if (priceSummary) {
      order.priceSummary = {
        totalMin: priceSummary.totalMin !== undefined ? priceSummary.totalMin : order.priceSummary.totalMin,
        totalMax: priceSummary.totalMax !== undefined ? priceSummary.totalMax : order.priceSummary.totalMax
      };
    }
    if (status) order.status = status;

    if (newGarments && newGarments.length > 0) {
      order.garments = [...order.garments, ...newGarments];
      const creatorId = req.user?._id || req.user?.id;
      await createWorksFromGarments(order._id, newGarments, creatorId);
    }

    // Increment version on update
    order.pricingVersion = (order.pricingVersion || 0) + 1;

    await order.save();
    await updateOrderPaymentSummary(order._id);

    try {
      const { syncOrderInvoice } = await import('../services/invoice.service.js');
      await syncOrderInvoice(order._id);
    } catch (syncErr) {}

    const enrichedOrder = await enrichSingleOrder(order);
    res.json({ success: true, message: "Order updated successfully", order: enrichedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 6. UPDATE ORDER STATUS
// ============================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, pricingVersion, cancelReason } = req.body;
    const { id } = req.params;

    const validStatuses = ["draft", "confirmed", "in-progress", "cutting", "stitching", "trial", "finishing", "ready-to-delivery", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status.` });
    }
    
    const order = await Order.findById(id).populate('customer').populate('garments');
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // 🚫 Reject status changes on terminal orders
    if (order.status === 'cancelled' || order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: `Cannot change status of a ${order.status} order.`
      });
    }

    // 🚫 Require a cancellation reason when cancelling
    if (status === 'cancelled') {
      if (!cancelReason || !cancelReason.trim()) {
        return res.status(400).json({
          success: false,
          message: "Cancellation reason is required."
        });
      }
    }

    // 🔄 Optimistic Concurrency Check
    if (pricingVersion !== undefined && order.pricingVersion !== undefined && order.pricingVersion !== pricingVersion) {
      return res.status(409).json({
        success: false,
        error: "CONFLICT",
        message: "This order has been modified by another session. Please reload before editing.",
        serverVersion: order.pricingVersion
      });
    }
    
    const balance = Number(order.balanceAmount) || 0;
    if (status === 'delivered' && balance > 0 && req.body.bypassDeliveryLock !== true) {
      return res.status(400).json({ deliveryLocked: true, message: `Delivery Blocked: Outstanding balance.` });
    }
    
    const oldStatus = order.status;
    order.status = status;

    // Save cancellation reason if provided
    if (status === 'cancelled' && cancelReason) {
      order.cancelReason = cancelReason.trim();
    }
    
    // Fallback safe closure for final milestones
    if (status === 'delivered') {
      order.currentStage = 'delivered';
    } else if (status === 'ready-to-deliver') {
      order.currentStage = order.stageKeys?.[order.stageKeys.length - 2] || 'packing';
    }
    
    order.pricingVersion = (order.pricingVersion || 0) + 1;
    await order.save();

    if (status === 'ready-to-deliver' && oldStatus !== 'ready-to-deliver') {
      try {
        const { sendReadyToDeliver } = await import('./whatsapp.controller.js');
        sendReadyToDeliver(order._id).catch(() => {});
      } catch (waErr) {}
    }

    if (status === 'cancelled') {
      // Whether the order ever reached a real worker decides the financial
      // outcome. assignments[] is the source of truth — not work.status (no
      // enum, 20 distinct values in practice) and not assignments.length,
      // because the QR scan path fabricates a placeholder entry with
      // role:'qr-scanner' and no workerId when a stage has no assignment.
      // One query covers every work on the order, so a single assigned work
      // makes the whole order "assigned".
      const cancelSession = await mongoose.startSession();
      try {
        await cancelSession.withTransaction(async () => {
          // $elemMatch, NOT {'assignments.workerId': {$ne: null}}. On an EMPTY
          // assignments array that shorthand is vacuously true — there is no
          // element equal to null, so $ne matches — which would misread every
          // unassigned work as assigned (254 of 687 works in this database).
          // $elemMatch demands an actual element carrying a real workerId.
          const hasRealWorker = await Work.exists({
            order: order._id,
            assignments: { $elemMatch: { workerId: { $exists: true, $ne: null } } }
          }).session(cancelSession);

          // Only stop active work; preserve completed and delivered work records
          await Work.updateMany(
            { order: order._id, status: { $nin: ['ready-to-deliver', 'delivered'] } },
            { status: 'cancelled', isActive: false },
            { session: cancelSession }
          );
          // Cancel only pending transactions — do NOT touch completed transactions (financial history)
          await Transaction.updateMany(
            { order: order._id, status: 'pending' },
            { status: 'cancelled' },
            { session: cancelSession }
          );

          if (hasRealWorker) {
            // Work was already assigned: payments stay exactly as they are.
            // NOTE: Payments are NOT deleted or modified. They are permanent
            // financial records.
            return;
          }

          // Cancelled before any worker was assigned. The money never bought
          // any work, so it is removed from the ACTIVE financial state only.
          // Nothing is refunded and nothing is destroyed: the payment rows,
          // their amounts and dates, the ledger rows, the garments and the
          // order's own minPrice/maxPrice/priceSummary all survive untouched.
          const activePayments = await Payment.find(
            { order: order._id, isDeleted: false },
            { _id: 1 }
          ).session(cancelSession);

          if (activePayments.length > 0) {
            const paymentIds = activePayments.map((p) => p._id);

            // Soft delete, mirroring deletePayment. updateOrderPaymentSummary
            // filters isDeleted:false, so this is what drops them from totals.
            await Payment.updateMany(
              { _id: { $in: paymentIds } },
              { isDeleted: true },
              { session: cancelSession }
            );

            // Revenue reads Transaction (type income, status completed), not
            // Payment, so the ledger rows for exactly these payments must be
            // cancelled too or the amount keeps showing up in revenue.
            // Matched via metadata.paymentId, the link createIncomeFromPayment
            // writes, so no unrelated ledger row can be caught.
            await Transaction.updateMany(
              { 'metadata.paymentId': { $in: paymentIds }, status: 'completed' },
              { status: 'cancelled' },
              { session: cancelSession }
            );
          }

          // Recompute from the surviving (now zero) active payments.
          await updateOrderPaymentSummary(order._id, cancelSession);

          // buildOrderPricingSummary is not status-aware: with no payments it
          // returns balanceDue = full order value, which would leave a
          // cancelled order still demanding money. Clear the active balance
          // explicitly. minPrice/maxPrice/priceSummary are deliberately left
          // alone so the order still records what it was worth.
          await Order.updateOne(
            { _id: order._id },
            { $set: { balanceAmount: 0, dueAmount: 0, balanceMin: 0, balanceMax: 0 } },
            { session: cancelSession }
          );
        });
      } finally {
        await cancelSession.endSession();
      }
    } else if (['in-progress', 'cutting', 'stitching', 'trial', 'finishing'].includes(status)) {
      const targetStage = status === 'in-progress' ? (order.stageKeys?.[0] || 'cutting') : status;

      await Work.updateMany(
        {
          order: order._id,
          status: { $nin: ['cancelled', 'ready-to-deliver', 'delivered'] }
        },
        {
          status: targetStage,
          currentStage: targetStage
        }
      );
    } else if (status === 'ready-to-deliver' || status === 'ready-to-delivery') {
      await Work.updateMany(
        {
          order: order._id,
          status: { $nin: ['cancelled', 'delivered'] }
        },
        {
          status: 'ready-to-deliver',
          currentStage: 'packed'
        }
      );
    } else if (status === 'delivered') {
      await Work.updateMany(
  {
    order: order._id,
    status: { $ne: 'ready-to-deliver' }
  },
  {
    status: 'ready-to-deliver'
  }
);
    }
    
    const updatedOrder = await Order.findById(id).populate('customer', 'name phone customerId').populate('garments');
    try {
      const { syncOrderInvoice } = await import('../services/invoice.service.js');
      await syncOrderInvoice(updatedOrder._id);
    } catch (syncErr) {}

    const enrichedOrder = await enrichSingleOrder(updatedOrder);
    res.json({ success: true, message: `Order status updated`, order: enrichedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 7. DELETE ORDER (SOFT DELETE)
// ============================================
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // 1. Reject deletion of delivered orders (permanent sales/financial record)
    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be deleted."
      });
    }

    // 2. Check ALL historical Work records (not filtered by isActive)
    //    Once an order has been assigned to production it can never be permanently deleted.
    const assigned = await checkOrderAssignment(order._id);
    if (assigned) {
      return res.status(400).json({
        success: false,
        message: "This order has been assigned to production or a worker. It cannot be deleted. Cancel it instead."
      });
    }

    // 3. Check for active invoice
    const invoice = await Invoice.findOne({ order: order._id, isDeleted: { $ne: true } });
    if (invoice) {
      return res.status(409).json({
        success: false,
        message: "This order has an active invoice and cannot be deleted. Cancel or void it instead."
      });
    }

    // 4. Write deletion audit log
    await logDeletion(req, "DELETE_ORDER", "Order", order, order);

    // 5. Soft-delete garments and unassigned Work records only — do NOT touch payments or transactions
    await Garment.updateMany({ _id: { $in: order.garments } }, { isActive: false });
    await Work.updateMany({ order: order._id }, { isActive: false });

    await Order.findByIdAndUpdate(
      order._id,
      { isActive: false },
      { runValidators: false }
    );
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 8. ADD PAYMENT TO ORDER
// ============================================
export const addPaymentToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    const order = await Order.findById(id).populate('customer');
    
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // A cancelled order must not take further payments. Beyond being wrong on
    // its own terms, accepting one here would call updateOrderPaymentSummary
    // and recompute a live balance over the zeroed financial state that
    // cancellation produced. Checked before any Payment or Transaction is
    // written so a rejected attempt leaves nothing behind.
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: "Cannot add a payment to a cancelled order."
      });
    }

    const creatorId = req.user?._id || req.user?.id;

    const existingPayments = await Payment.find({ order: order._id, isDeleted: false });
    const totalPaidBefore = existingPayments.reduce((sum, p) => sum + p.amount, 0);
    const newTotalPaid = totalPaidBefore + Number(paymentData.amount);
    
    const garments = await Garment.find({ order: order._id, isActive: true });
    const { totalMin, totalMax } = calculateRangeTotals(garments, newTotalPaid);
    
    const balanceMinAfterPayment = newTotalPaid >= totalMin ? 0 : Math.max(0, totalMin - newTotalPaid);
    const balanceMaxAfterPayment = newTotalPaid >= totalMin ? 0 : Math.max(0, totalMax - newTotalPaid);

    const now = new Date();
    const paymentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const payment = await Payment.create({
      order: order._id,
      customer: order.customer,
      amount: paymentData.amount,
      type: paymentData.type || 'advance',
      method: paymentData.method || 'cash',
      referenceNumber: paymentData.referenceNumber || '',
      paymentDate: paymentData.paymentDate || new Date(),
      paymentTime: paymentTime,
      notes: paymentData.notes || '',
      receivedBy: creatorId,
      balanceMinAfterPayment,
      balanceMaxAfterPayment
    });
    
    await createIncomeFromPayment(payment, order, creatorId);
    await updateOrderPaymentSummary(order._id);
    
    res.status(201).json({ success: true, message: "Payment added successfully", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 9. GET ORDER PAYMENTS
// ============================================
export const getOrderPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ order: req.params.id, isDeleted: false })
      .populate('receivedBy', 'name')
      .sort('-paymentDate -paymentTime');
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 10. GET DASHBOARD DATA
// ============================================
export const getDashboardData = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ------------------------------------------------------------------
    // These six reads are mutually independent, so they run concurrently
    // instead of as six sequential awaits.
    //
    // The payment and transaction reads previously loaded every matching
    // document purely to sum them in JavaScript — neither array appears in
    // the response, only the derived totals. They are now $group
    // aggregations that return the totals themselves, so the documents never
    // cross the wire.
    //
    // NOTE: the 'ready-to-deliver' status value below is preserved exactly as
    // it was. It does not match the schema enum ('ready-to-delivery') and so
    // returns nothing — see the accompanying report. Changing it here would
    // alter the response, which is out of scope for a performance change.
    // ------------------------------------------------------------------
    const [
      todayOrders,
      pendingDeliveries,
      readyForDelivery,
      recentOrders,
      paymentAgg,
      incomeAgg
    ] = await Promise.all([
      Order.find({ createdAt: { $gte: today }, isActive: true }).populate('customer', 'name'),
      Order.find({ deliveryDate: { $lt: new Date() }, status: { $nin: ['delivered', 'cancelled'] }, isActive: true }).populate('customer', 'name phone'),
      Order.find({ status: 'ready-to-deliver', isActive: true }).populate('customer', 'name phone'),
      Order.find({ isActive: true }).populate('customer', 'name').sort({ createdAt: -1 }).limit(10),
      Payment.aggregate([
        { $match: { paymentDate: { $gte: today }, isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { transactionDate: { $gte: today }, type: 'income', status: 'completed' } },
        { $group: { _id: '$accountType', total: { $sum: '$amount' } } }
      ])
    ]);

    const todayCollection = paymentAgg[0]?.total || 0;

    // Summing every bucket reproduces the previous "sum of all matching
    // transactions" exactly, including any accountType beyond the two named.
    const incomeByAccount = incomeAgg.reduce((acc, row) => {
      acc[row._id] = row.total;
      return acc;
    }, {});
    const totalIncomeToday = incomeAgg.reduce((sum, row) => sum + row.total, 0);

    res.json({
      success: true,
      dashboard: {
        todayOrders: { count: todayOrders.length, orders: todayOrders },
        pendingDeliveries: { count: pendingDeliveries.length, orders: pendingDeliveries },
        readyForDelivery: { count: readyForDelivery.length, orders: readyForDelivery },
        recentOrders,
        todayCollection,
        totalIncomeToday,
        incomeBreakdown: {
          handCash: incomeByAccount['hand-cash'] || 0,
          bank: incomeByAccount['bank'] || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 11. GET ORDERS BY CUSTOMER
// ============================================
export const getOrdersByCustomer = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.params.customerId, isActive: true })
      .populate('customer', 'name phone email customerId')
      .populate('garments')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// ✅ 12. GET READY TO DELIVERY ORDERS
// ============================================
export const getReadyToDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'ready-to-deliver', isActive: true }).populate('customer', 'name phone').populate('garments').sort({ updatedAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 13. GET INCOME BY ORDER ID
// ============================================
export const getIncomeByOrder = async (req, res) => {
  try {
    const incomes = await Transaction.find({ order: req.params.id, type: 'income', status: 'completed' }).populate('customer', 'name phone').sort('-transactionDate');
    res.json({ success: true, count: incomes.length, totalIncome: incomes.reduce((sum, t) => sum + t.amount, 0), incomes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 14. GET ORDER STATS FOR DASHBOARD
// ============================================
export const getOrderStatsForDashboard = async (req, res) => {
  try {
    const { search = "", paymentStatus, timeFilter = "all", startDate, endDate } = req.query;
    let query = { isActive: true };

    if (search) {
      const customerIds = await Customer.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { customerId: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).distinct('_id');
      const garmentIds = await Garment.find({ name: { $regex: search, $options: 'i' } }).distinct('_id');
      query.$or = [{ orderId: { $regex: search, $options: 'i' } }, { customer: { $in: customerIds } }, { garments: { $in: garmentIds } }, { status: { $regex: search, $options: 'i' } }];
    }

    if (paymentStatus && paymentStatus !== "all") query['paymentSummary.paymentStatus'] = paymentStatus;

    const now = new Date();
    if (timeFilter !== "all") {
      let filterDate = new Date();
      if (timeFilter === "week") filterDate.setDate(now.getDate() - 7);
      else if (timeFilter === "month") filterDate.setMonth(now.getMonth() - 1);
      else if (timeFilter === "3m") filterDate.setMonth(now.getMonth() - 3);
      query.createdAt = { $gte: filterDate };
    }

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, draftOrders, confirmedOrders, inProgressOrders, readyOrders, deliveredOrders, cancelledOrders, overdueOrders, revenueResult] = await Promise.all([
      Order.countDocuments(query),
      Order.countDocuments({ ...query, status: 'draft' }),
      Order.countDocuments({ ...query, status: 'confirmed' }),
      Order.countDocuments({ ...query, status: { $in: ['in-progress', 'progress', 'cutting', 'stitching', 'trial', 'finishing'] } }),
      Order.countDocuments({ ...query, status: { $in: ['ready-to-delivery', 'ready-to-deliver', 'ready'] } }),
      Order.countDocuments({ ...query, status: 'delivered' }),
      Order.countDocuments({ ...query, status: 'cancelled' }),
      Order.countDocuments({ ...query, deliveryDate: { $lt: today }, status: { $nin: ['delivered', 'cancelled'] } }),
      Order.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum: "$paymentSummary.totalPaid" } } }])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders, draftOrders, confirmedOrders, inProgressOrders, readyOrders, deliveredOrders, cancelledOrders, overdueOrders,
        revenue: revenueResult[0]?.total || 0,
        totalRevenue: revenueResult[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 15. GET RECENT ORDERS
// ============================================
export const getRecentOrders = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate, period } = req.query;
    let dateFilter = { isActive: true };
    
    if (startDate && endDate) {
      dateFilter.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate + 'T23:59:59.999Z') };
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter.orderDate = { $gte: thirtyDaysAgo };
    }

    const orders = await Order.find(dateFilter).populate('customer', 'name phone').populate('garments', 'name type quantity').sort({ orderDate: -1 }).limit(parseInt(limit));
    const enrichedOrders = await enrichOrdersWithAssignedStatus(orders);
    res.json({ success: true, orders: enrichedOrders, count: enrichedOrders.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 16. GET FILTERED ORDERS
// ============================================
export const getFilteredOrders = async (req, res) => {
  try {
    const { startDate, endDate, status, page = 1, limit = 20 } = req.query;
    let filter = { isActive: true };
    if (startDate && endDate) filter.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate + 'T23:59:59.999Z') };
    if (status && status !== 'all') filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(filter).populate('customer', 'name phone').populate('garments').sort({ orderDate: -1 }).skip(skip).limit(parseInt(limit));
    const totalCount = await Order.countDocuments(filter);
    const enrichedOrders = await enrichOrdersWithAssignedStatus(orders);

    res.json({ success: true, orders: enrichedOrders, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(totalCount / parseInt(limit)), totalCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 17. GET ORDER DATES (for green dots)
// ============================================
export const getOrderDates = async (req, res) => {
  try {
    const { month, year, type = 'order' } = req.query;
    if (!month || !year) return res.status(400).json({ success: false, message: "Required parameter missing" });

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    const dateField = type === 'order' ? 'orderDate' : 'deliveryDate';

    const orderDates = await Order.aggregate([
      { $match: { [dateField]: { $gte: startDate, $lte: endDate }, status: { $ne: 'cancelled' }, isActive: true } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } }, count: { $sum: 1 } } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
      { $sort: { date: 1 } }
    ]);

    res.json({ success: true, dates: orderDates.map(item => item.date), details: orderDates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 18. GET DELIVERY DATES FOR CALENDAR
// ============================================
export const getDeliveryDatesForCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ success: false, message: "Params missing" });
    const deliveryData = await Order.getDeliveryCalendar(parseInt(month) - 1, parseInt(year));
    res.json({ success: true, allDates: deliveryData.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 19. GET SIMPLE DELIVERY DATES
// ============================================
export const getSimpleDeliveryDates = async (req, res) => {
  try {
    const { month, year } = req.query;
    const counts = await Order.getDeliveryCountsByDay(parseInt(month) - 1, parseInt(year));
    const formattedDates = counts.map(item => ({
      _id: `${year}-${String(month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`,
      count: item.count
    }));
    res.json({ success: true, allDates: formattedDates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// 📝 DRAFT ORDERS — new, self-contained additions.
// None of the functions above this banner are modified by the Draft Orders
// feature. Drafts are Order documents with isDraftOrder:true + isActive:false
// (isActive:false already excludes them from every query above, since every
// one of those already filters isActive:true).
// ============================================

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

const draftNotEditableResponse = (res) =>
  res.status(409).json({
    success: false,
    code: "DRAFT_ALREADY_CONVERTED",
    message:
      "This draft has already been converted into an order and can no longer be edited as a draft. Please edit the created order instead.",
  });

// Maps the client-facing category name to the garment image field name it will
// eventually live under, and to the short R2 folder segment used elsewhere in
// this file (orders/{orderId}/garment_{i}/reference|customer|cloth).
const DRAFT_IMAGE_CATEGORIES = {
  referenceImages: "reference",
  customerImages: "customer",
  customerClothImages: "cloth",
};

// Only accept plain {url,key} refs as "already persisted" — never trust a raw
// File-shaped or malformed entry making it into draftData's Mixed blob.
const isPersistedImageRef = (img) =>
  Boolean(img) && typeof img === "object" && typeof img.url === "string" && typeof img.key === "string";

// ============================================
// ✅ DRAFT IMAGE OWNERSHIP GUARD
// Hard invariant enforced at every point draft image data is persisted: a
// draft may only ever store image keys that live under its own
// drafts/{thisDraftId}/ prefix. Any persisted-looking image ref that doesn't
// match gets stripped (never silently kept/shared) and logged loudly, so
// however such a foreign reference ends up in a payload — a client bug, a
// stale request, anything — it can never be written into this draft's
// document and corrupt another draft's or order's image ownership.
// ============================================
const belongsToDraft = (key, draftId) =>
  typeof key === "string" && key.startsWith(`drafts/${draftId}/`);

const enforceDraftImageOwnership = (draftData, draftId) => {
  if (!draftData || !Array.isArray(draftData.garments)) return draftData;

  draftData.garments.forEach((g, gi) => {
    Object.keys(DRAFT_IMAGE_CATEGORIES).forEach((field) => {
      if (!Array.isArray(g?.[field])) return;
      const before = g[field];
      const after = before.filter((img) => {
        if (!isPersistedImageRef(img)) return true; // not a persisted ref — nothing to check ownership of
        return belongsToDraft(img.key, draftId);
      });
      if (after.length !== before.length) {
        const stripped = before.filter((img) => isPersistedImageRef(img) && !belongsToDraft(img.key, draftId));
        console.warn(
          `⚠️ [DRAFT IMAGE OWNERSHIP GUARD] Stripped ${stripped.length} foreign-owned image(s) from draft ${draftId} garments[${gi}].${field}:`,
          stripped.map((img) => img.key)
        );
      }
      g[field] = after;
    });
  });

  return draftData;
};

// ============================================
// ✅ 20. UPLOAD DRAFT GARMENT IMAGES
// Persists images to R2 as soon as they're attached during draft creation/
// editing, instead of only at final "Create Order" — this is what makes
// images survive an autosave + Resume cycle. The draft's draftData JSON blob
// itself is NOT touched here; the frontend merges the returned {url,key}
// refs into its local state and includes them in its next autosave PUT.
// ============================================
export const uploadDraftImages = async (req, res) => {
  try {
    const draft = await Order.findById(req.params.id);
    if (!draft) {
      return res.status(404).json({ success: false, message: "Draft not found. It may have been deleted." });
    }
    if (!draft.isDraftOrder) {
      return draftNotEditableResponse(res);
    }

    const { category, garmentIndex } = req.body;
    const folder = DRAFT_IMAGE_CATEGORIES[category];
    if (!folder) {
      return res.status(400).json({ success: false, message: "Invalid image category" });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images provided" });
    }

    const safeIndex = Number.isFinite(Number(garmentIndex)) ? Number(garmentIndex) : 0;
    const uploaded = await r2Service.uploadMultiple(
      req.files,
      `drafts/${draft._id}/garment_${safeIndex}/${folder}`
    );
    const images = uploaded.map((img) => ({ ...img, uploadedAt: new Date().toISOString() }));

    res.status(201).json({ success: true, images });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid draft ID" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 21. CREATE DRAFT
// ============================================
export const createDraft = async (req, res) => {
  try {
    const creatorId = req.user?._id || req.user?.id;
    if (!creatorId) {
      return res.status(401).json({ success: false, message: "Authentication failed" });
    }

    const draftData = req.body?.draftData || {};

    const hasMeaningfulData = Boolean(
      draftData.customer ||
      draftData.deliveryDate ||
      (Array.isArray(draftData.garments) && draftData.garments.length > 0) ||
      String(draftData.specialNotes || "").trim()
    );

    if (!hasMeaningfulData) {
      return res.status(400).json({ success: false, message: "Draft requires at least some order details" });
    }

    const newId = new mongoose.Types.ObjectId();
    enforceDraftImageOwnership(draftData, newId.toString());

    const progressPercent = computeDraftProgress(draftData);
    const customerDisplayName = computeDraftDisplayName(draftData);

    const draft = await Order.create({
      _id: newId,
      isDraftOrder: true,
      isActive: false,
      status: "draft",
      customer: OBJECT_ID_RE.test(draftData.customer) ? draftData.customer : undefined,
      deliveryDate: draftData.deliveryDate || undefined,
      specialNotes: draftData.specialNotes || "",
      draftData,
      draftMeta: { progressPercent, customerDisplayName, lastEditedBy: creatorId },
      createdBy: creatorId,
    });

    res.status(201).json({ success: true, draft });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 21. UPDATE DRAFT (AUTOSAVE — last write wins, no locking/version check)
// ============================================
export const updateDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const draft = await Order.findById(id);

    if (!draft) {
      return res.status(404).json({ success: false, message: "Draft not found. It may have been deleted." });
    }
    if (!draft.isDraftOrder) {
      return draftNotEditableResponse(res);
    }

    const creatorId = req.user?._id || req.user?.id;
    const draftData = req.body?.draftData || {};
    enforceDraftImageOwnership(draftData, id);

    draft.draftData = draftData;
    draft.markModified("draftData");

    if (OBJECT_ID_RE.test(draftData.customer)) draft.customer = draftData.customer;
    if (draftData.deliveryDate) draft.deliveryDate = draftData.deliveryDate;
    if (draftData.specialNotes !== undefined) draft.specialNotes = draftData.specialNotes;

    draft.draftMeta = {
      progressPercent: computeDraftProgress(draftData),
      customerDisplayName: computeDraftDisplayName(draftData),
      lastEditedBy: creatorId,
    };

    await draft.save();

    res.status(200).json({ success: true, draft });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid draft ID" });
    }
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 22. LIST DRAFTS
// ============================================
export const listDrafts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    let query = { isDraftOrder: true };

    if (search) {
      const customerIds = await Customer.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { customerId: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      }).distinct("_id");

      query.$or = [
        { customer: { $in: customerIds } },
        { "draftMeta.customerDisplayName": { $regex: search, $options: "i" } },
      ];
    }

    const total = await Order.countDocuments(query);
    const drafts = await Order.find(query)
      .populate("customer", "name phone customerId")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      drafts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 23. GET DRAFT BY ID (for Resume)
// ============================================
export const getDraftById = async (req, res) => {
  try {
    const draft = await Order.findById(req.params.id).populate("customer", "name phone customerId");

    if (!draft) {
      return res.status(404).json({ success: false, message: "Draft not found. It may have been deleted." });
    }
    if (!draft.isDraftOrder) {
      return draftNotEditableResponse(res);
    }

    res.json({ success: true, draft });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid draft ID" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 24. DELETE DRAFT (hard delete — a pure draft has no garments/payments/work/invoice to
// clean up, EXCEPT any images it uploaded to R2 during editing, which we remove below.
// Safe to hard-delete those: duplicateDraft always gives a duplicate independent R2 copies,
// so a draft's images are never referenced by any other draft or by a converted order.)
// ============================================
export const deleteDraft = async (req, res) => {
  try {
    const draft = await Order.findById(req.params.id);

    if (!draft) {
      return res.status(404).json({ success: false, message: "Draft not found. It may have already been deleted." });
    }
    if (!draft.isDraftOrder) {
      return draftNotEditableResponse(res);
    }

    const garments = Array.isArray(draft.draftData?.garments) ? draft.draftData.garments : [];
    const keys = garments.flatMap((g) =>
      Object.keys(DRAFT_IMAGE_CATEGORIES).flatMap((field) =>
        (Array.isArray(g?.[field]) ? g[field] : []).filter(isPersistedImageRef).map((img) => img.key)
      )
    );
    await Promise.all(keys.map((key) => r2Service.deleteFile(key).catch(() => {})));

    await Order.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Draft deleted" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid draft ID" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 25. DUPLICATE DRAFT
// Images are copied to brand-new R2 objects (not just cloned URL/key JSON) so the
// duplicate owns them independently — deleting/editing either draft's images can
// never affect the other.
// ============================================
export const duplicateDraft = async (req, res) => {
  try {
    const creatorId = req.user?._id || req.user?.id;
    if (!creatorId) {
      return res.status(401).json({ success: false, message: "Authentication failed" });
    }

    const source = await Order.findById(req.params.id);
    if (!source) {
      return res.status(404).json({ success: false, message: "Draft not found" });
    }
    if (!source.isDraftOrder) {
      return draftNotEditableResponse(res);
    }

    const draftData = JSON.parse(JSON.stringify(source.draftData || {}));
    const newId = new mongoose.Types.ObjectId();

    if (Array.isArray(draftData.garments)) {
      for (let i = 0; i < draftData.garments.length; i++) {
        const g = draftData.garments[i];
        for (const [field, folder] of Object.entries(DRAFT_IMAGE_CATEGORIES)) {
          const imgs = Array.isArray(g?.[field]) ? g[field] : [];
          const copies = [];
          for (const img of imgs) {
            if (!isPersistedImageRef(img)) continue;
            const result = await r2Service.copyFile(img.key, `drafts/${newId}/garment_${i}/${folder}`);
            // Skip images that fail to copy rather than let the duplicate share
            // the original's key — independence is the safety property that matters here.
            if (result.success) {
              copies.push({ ...img, url: result.url, key: result.key });
            }
          }
          g[field] = copies;
        }
      }
    }

    // Belt-and-suspenders: even though every image above was just freshly
    // copied under drafts/{newId}/, re-verify ownership before saving —
    // guarantees the duplicate can never persist a foreign-owned key even if
    // some other bug slipped one past the copy loop above.
    enforceDraftImageOwnership(draftData, newId.toString());

    const duplicate = await Order.create({
      _id: newId,
      isDraftOrder: true,
      isActive: false,
      status: "draft",
      customer: OBJECT_ID_RE.test(draftData.customer) ? draftData.customer : undefined,
      deliveryDate: draftData.deliveryDate || undefined,
      specialNotes: draftData.specialNotes || "",
      draftData,
      draftMeta: {
        progressPercent: computeDraftProgress(draftData),
        customerDisplayName: computeDraftDisplayName(draftData),
        lastEditedBy: creatorId,
      },
      createdBy: creatorId,
    });

    res.status(201).json({ success: true, draft: duplicate });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid draft ID" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 26. CONVERT DRAFT INTO A REAL ORDER
// Mirrors createOrder's finalize logic (same standalone helpers: createWorksFromGarments,
// r2Service, createIncomeFromPayment, invoice/whatsapp sync) but updates the EXISTING
// draft document in place instead of inserting a new one, so the order keeps the same _id
// and no duplicate/leftover draft row is ever created. createOrder itself is untouched.
// ============================================
export const convertDraft = async (req, res) => {
  try {
    // Atomic pre-flight: flip isDraftOrder true->false as a single conditional
    // write BEFORE doing any of the heavy lifting below. If two convert requests
    // race, only one can match this filter — the loser gets 409 immediately
    // instead of both proceeding to create duplicate Garment/Payment records.
    // {new:false} returns the document as it looked right before the flip, so we
    // still have the full draftData snapshot to build the order from.
    const draft = await Order.findOneAndUpdate(
      { _id: req.params.id, isDraftOrder: true },
      { $set: { isDraftOrder: false } },
      { new: false }
    );
    if (!draft) {
      const exists = await Order.exists({ _id: req.params.id });
      if (!exists) {
        return res.status(404).json({ success: false, message: "Draft not found. It may have been deleted." });
      }
      return draftNotEditableResponse(res);
    }

    let orderData = { ...req.body };

    if (typeof orderData.garments === "string") {
      try { orderData.garments = JSON.parse(orderData.garments); } catch (e) {}
    }
    if (typeof orderData.payments === "string") {
      try { orderData.payments = JSON.parse(orderData.payments); } catch (e) {}
    }
    if (typeof orderData.advancePayment === "string") {
      try { orderData.advancePayment = JSON.parse(orderData.advancePayment); } catch (e) {}
    }
    if (typeof orderData.workflowStages === "string") {
      try { orderData.workflowStages = JSON.parse(orderData.workflowStages); } catch (e) {}
    }

    const {
      customer,
      deliveryDate,
      garments,
      specialNotes,
      priceSummary,
      status,
      orderDate,
      payments = [],
      workflowStages: rawWorkflowStages,
    } = orderData;

    const creatorId = req.user?._id || req.user?.id;
    if (!creatorId) {
      return res.status(401).json({ success: false, message: "Authentication failed" });
    }

    if (!customer || !deliveryDate) {
      return res.status(400).json({ success: false, message: "Customer and Delivery Date are required" });
    }

    let incomingStages = Array.isArray(rawWorkflowStages) ? rawWorkflowStages : [];

    let processedStages = incomingStages
      .map((stage, index) => {
        if (typeof stage === "string") {
          const cleanKey = stage.trim().toLowerCase().replace(/\s+/g, "_");
          const cleanLabel = stage.trim().replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          return { key: cleanKey, label: cleanLabel, order: index + 1 };
        }
        if (stage && typeof stage === "object") {
          const rawKey = stage.key || stage.name || stage.label || stage.stageName || stage.title;
          if (!rawKey) return null;
          const cleanKey = String(rawKey).trim().toLowerCase().replace(/\s+/g, "_");
          return {
            key: cleanKey,
            label: stage.label || cleanKey.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            order: stage.order || index + 1,
          };
        }
        return null;
      })
      .filter(Boolean);

    const perGarmentWorkflow = garmentsHaveWorkflow(garments);

    if (processedStages.length === 0 && !perGarmentWorkflow) {
      const defaultKeys = ["cutting", "stitching", "ironing", "packed"];
      processedStages = defaultKeys.map((k, i) => ({
        key: k,
        label: k.charAt(0).toUpperCase() + k.slice(1),
        order: i + 1,
      }));
    }

    const stageKeys = processedStages.map((s) => s.key);
    const activeStage = stageKeys[0] || "new";
    const workflowStagesObj = {};
    stageKeys.forEach((key) => {
      workflowStagesObj[key] = { completed: false, completedAt: null, assignedTo: null };
    });

    let totalMin = 0;
    let totalMax = 0;

    if (garments && garments.length > 0) {
      garments.forEach((g) => {
        if (g.finalGarmentMinAmount !== undefined && g.finalGarmentMinAmount !== null) {
          totalMin += Number(g.finalGarmentMinAmount);
        } else {
          const finalized = Number(g.finalizedAmount !== undefined && g.finalizedAmount !== null ? g.finalizedAmount : g.finalizedPrice);
          const tailoringMin = finalized > 0 ? finalized : Number(g.minPrice || g.priceRange?.min || 0);
          const fabric = Number(g.fabricPrice || 0);
          const additional = Number(g.additionalCharges || 0);
          totalMin += tailoringMin + fabric + additional;
        }

        if (g.finalGarmentMaxAmount !== undefined && g.finalGarmentMaxAmount !== null) {
          totalMax += Number(g.finalGarmentMaxAmount);
        } else {
          const finalized = Number(g.finalizedAmount !== undefined && g.finalizedAmount !== null ? g.finalizedAmount : g.finalizedPrice);
          const tailoringMax = finalized > 0 ? finalized : Number(g.maxPrice || g.priceRange?.max || 0);
          const fabric = Number(g.fabricPrice || 0);
          const additional = Number(g.additionalCharges || 0);
          totalMax += tailoringMax + fabric + additional;
        }
      });
    } else if (priceSummary) {
      totalMin = Number(priceSummary.totalMin) || 0;
      totalMax = Number(priceSummary.totalMax) || 0;
    }

    const allPayments = [...payments];
    const totalInitialPaid = allPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    draft.customer = customer;
    draft.deliveryDate = deliveryDate;
    draft.currentStage = perGarmentWorkflow ? "new" : activeStage;
    draft.workflowStages = perGarmentWorkflow ? {} : workflowStagesObj;
    draft.stageKeys = perGarmentWorkflow ? [] : stageKeys;
    draft.specialNotes = specialNotes;
    draft.advancePayment = {
      amount: allPayments.find((p) => p.type === "advance")?.amount || 0,
      method: allPayments.find((p) => p.type === "advance")?.method || allPayments[0]?.method || "cash",
      date: new Date(),
    };
    draft.minPrice = totalMin;
    draft.maxPrice = totalMax;
    draft.finalizedAmount = 0;
    draft.dueAmount = totalInitialPaid >= totalMin ? 0 : Math.max(0, totalMax - totalInitialPaid);
    draft.balanceMin = totalInitialPaid >= totalMin ? 0 : Math.max(0, totalMin - totalInitialPaid);
    draft.balanceMax = totalInitialPaid >= totalMin ? 0 : Math.max(0, totalMax - totalInitialPaid);
    draft.priceSummary = { totalMin, totalMax };
    draft.paymentSummary = {
      totalPaid: totalInitialPaid,
      lastPaymentDate: allPayments.length > 0 ? new Date() : null,
      lastPaymentAmount: allPayments.length > 0 ? allPayments[allPayments.length - 1].amount : 0,
      paymentCount: allPayments.length,
      paymentStatus: totalInitialPaid >= totalMin ? "paid" : (totalInitialPaid > 0 ? "partial" : "pending"),
    };
    draft.balanceAmount = totalInitialPaid >= totalMin ? 0 : Math.max(0, totalMax - totalInitialPaid);
    draft.status = status || "confirmed";
    draft.orderDate = orderDate || draft.orderDate || new Date();
    draft.isDraftOrder = false;
    draft.isActive = true;
    // draftData is deliberately NOT cleared here. It is the only snapshot
    // that can rebuild this order, and payments, uploads, garments and
    // works all still have to run below. It is cleared once they succeed.

    await draft.save();
    const order = draft;

    const fileGroups = extractGarmentFiles(req);

    if (allPayments.length > 0) {
      let runningPaid = 0;
      for (const paymentData of allPayments) {
        let safeAmount = Number(paymentData.amount) || 0;
        runningPaid += safeAmount;

        const now = new Date();
        const paymentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

        await new Promise((resolve) => setTimeout(resolve, 10));

        const payment = await Payment.create({
          order: order._id,
          customer: order.customer,
          amount: safeAmount,
          type: paymentData.type || "advance",
          method: paymentData.method || "cash",
          referenceNumber: paymentData.referenceNumber || "",
          paymentDate: paymentData.paymentDate || new Date(),
          paymentTime,
          notes: paymentData.notes || "",
          receivedBy: creatorId,
          balanceMinAfterPayment: runningPaid >= totalMin ? 0 : Math.max(0, totalMin - runningPaid),
          balanceMaxAfterPayment: runningPaid >= totalMin ? 0 : Math.max(0, totalMax - runningPaid),
        });

        await createIncomeFromPayment(payment, order, creatorId);
      }
    }

    const createdGarmentIds = [];
    if (garments && garments.length > 0) {
      for (let i = 0; i < garments.length; i++) {
        const g = garments[i];
        if (i > 0) await new Promise((resolve) => setTimeout(resolve, 50));

        // Start from any images already persisted to R2 during the draft phase
        // (uploaded via POST /drafts/:id/images) — these arrive here as plain
        // {url,key} JSON, not files, so they were never in req.files/fileGroups.
        // Without this, images uploaded while the draft was being edited would be
        // silently discarded at conversion instead of carried onto the real Garment.
        // Ownership-checked against THIS draft's own id (req.params.id, unchanged
        // by the isDraftOrder flip above) — a foreign-owned key can never be
        // carried onto the resulting Garment either.
        const ownedRef = (img) => isPersistedImageRef(img) && belongsToDraft(img.key, req.params.id);
        const uploadedImages = {
          referenceImages: (Array.isArray(g.referenceImages) ? g.referenceImages : []).filter(ownedRef),
          customerImages: (Array.isArray(g.customerImages) ? g.customerImages : []).filter(ownedRef),
          customerClothImages: (Array.isArray(g.customerClothImages) ? g.customerClothImages : []).filter(ownedRef),
        };

        if (fileGroups[i]?.referenceImages?.length > 0) {
          const fresh = await r2Service.uploadMultiple(fileGroups[i].referenceImages, `orders/${order._id}/garment_${i}/reference`);
          uploadedImages.referenceImages = uploadedImages.referenceImages.concat(fresh);
        }
        if (fileGroups[i]?.customerImages?.length > 0) {
          const fresh = await r2Service.uploadMultiple(fileGroups[i].customerImages, `orders/${order._id}/garment_${i}/customer`);
          uploadedImages.customerImages = uploadedImages.customerImages.concat(fresh);
        }
        if (fileGroups[i]?.customerClothImages?.length > 0) {
          const fresh = await r2Service.uploadMultiple(fileGroups[i].customerClothImages, `orders/${order._id}/garment_${i}/cloth`);
          uploadedImages.customerClothImages = uploadedImages.customerClothImages.concat(fresh);
        }

        const garmentWorkflow = parseWorkflowStagesInput(
          g.stageKeys?.length ? g.stageKeys : g.workflowStages,
        );

        const garmentData = {
          name: g.name,
          garmentType: g.garmentType || g.item || g.itemName || g.name,
          category: g.category,
          item: g.item,
          categoryName: g.categoryName,
          itemName: g.itemName,
          measurements: g.measurements || [],
          measurementTemplate: g.measurementTemplate && g.measurementTemplate !== "" ? g.measurementTemplate : null,
          measurementSource: g.measurementSource || "customer",
          additionalInfo: g.additionalInfo || "",
          estimatedDelivery: g.estimatedDelivery || deliveryDate,
          priority: g.priority || "normal",
          priceRange: { min: Number(g.priceRange?.min) || 0, max: Number(g.priceRange?.max) || 0 },
          finalizedPrice: Number(g.finalizedAmount || g.finalizedPrice) || 0,
          finalizedAmount: Number(g.finalizedAmount || g.finalizedPrice) || 0,
          minPrice: Number(g.minPrice || g.priceRange?.min) || 0,
          maxPrice: Number(g.maxPrice || g.priceRange?.max) || 0,
          fabricSource: g.fabricSource || "customer",
          fabricPrice: g.fabricPrice || "0",
          fabricMeters: g.fabricMeters || "",
          fabricNotes: g.fabricNotes || "",
          fabricSufficiency: g.fabricSufficiency || "To Be Verified",
          selectedFabric: g.selectedFabric && g.selectedFabric !== "" ? g.selectedFabric : null,
          referenceImages: uploadedImages.referenceImages,
          customerImages: uploadedImages.customerImages,
          customerClothImages: uploadedImages.customerClothImages,
          stageKeys: garmentWorkflow.stageKeys,
          workflowStages: garmentWorkflow.workflowStages,
          order: order._id,
          createdBy: creatorId,
          status: "pending",
        };

        const garment = await Garment.create(garmentData);
        createdGarmentIds.push(garment._id);
      }

      order.garments = createdGarmentIds;
      order.status = "in-progress";
      await order.save();

      if (createdGarmentIds.length > 0) {
        await createWorksFromGarments(order._id, createdGarmentIds, creatorId);
      }
    }

    // Conversion is complete. Only now is the draft snapshot safe to drop.
    order.draftData = undefined;
    await order.save();

    await order.populate("customer", "name phone customerId");

    try {
      const { sendOrderConfirmation } = await import("./whatsapp.controller.js");
      sendOrderConfirmation(order._id).catch(() => {});
    } catch (waErr) {}

    try {
      const { syncOrderInvoice } = await import("../services/invoice.service.js");
      await syncOrderInvoice(order._id);
    } catch (syncErr) {}

    res.status(201).json({ success: true, message: "Order created successfully", order });
  } catch (error) {
    // The isDraftOrder claim was committed before any of this ran, so an
    // abort here would otherwise strand the record: not a draft any more,
    // not a finished order either. Hand it back so it reappears in the
    // drafts list with draftData still intact. Best effort - failing to
    // restore must not mask the original error.
    try {
      if (req.params?.id) {
        await Order.updateOne({ _id: req.params.id }, { $set: { isDraftOrder: true } });
      }
    } catch (restoreErr) {
      console.error("Draft claim restore failed:", restoreErr.message);
    }

    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid draft ID" });
    }
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};