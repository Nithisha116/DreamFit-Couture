// controllers/order.controller.js
import Order from "../models/Order.js";
import Garment from "../models/Garment.js";
import Work from "../models/Work.js";
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
import { calculateRangeTotals } from "../utils/rangeUtils.js";

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
      status: 'completed'
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
export const updateOrderPaymentSummary = async (orderId) => {
  console.log(`\n💰 Updating payment summary for order: ${orderId}`);
  
  try {
    const order = await Order.findById(orderId);
    if (!order) return;

    const payments = await Payment.find({ 
      order: orderId, 
      isDeleted: false,
      type: { $in: ['advance', 'full', 'final-settlement'] }
    });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const lastPayment = payments.sort((a, b) => 
      new Date(b.paymentDate) - new Date(a.paymentDate)
    )[0];

    // Dynamically calculate and self-heal the priceSummary from the actual garments in database
    const garments = await Garment.find({ order: orderId, isActive: true });
    
    const { totalMin, totalMax, balanceMin, balanceMax } = calculateRangeTotals(garments, totalPaid);
    
    order.minPrice = totalMin;
    order.maxPrice = totalMax;
    order.priceSummary = { totalMin, totalMax };
    
    order.balanceMin = balanceMin;
    order.balanceMax = balanceMax;
    // Legacy support
    order.balanceAmount = balanceMax;
    order.dueAmount = balanceMax;

    let paymentStatus = 'pending';
    if (totalPaid >= totalMin) {
      paymentStatus = 'paid';
      order.finalizedAmount = totalPaid; // AUTO-FINALIZE
    } else {
      if (totalPaid > 0) paymentStatus = 'partial';
      order.finalizedAmount = 0; // RANGE-BASED
    }

    order.paymentSummary = {
      totalPaid,
      lastPaymentDate: lastPayment?.paymentDate,
      lastPaymentAmount: lastPayment?.amount,
      paymentCount: payments.length,
      paymentStatus
    };
    
    await order.save();
    console.log(`✅ Payment summary updated: Paid: ₹${totalPaid}, Status: ${paymentStatus}`);
    
    return { success: true, totalPaid, paymentStatus };
  } catch (error) {
    console.error("❌ Error updating payment summary:", error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ✅ HELPER: CREATE WORKS FROM EXISTING GARMENTS (UPDATED WITH DYNAMIC COPIED WORKFLOW)
// ============================================
const createWorksFromGarments = async (orderId, garmentIds, creatorId) => {
  console.log("\n🚀 ===== CREATE WORKS FROM GARMENTS =====");
  console.log(`📦 Order ID: ${orderId}`);
  console.log(`👕 Garment IDs:`, garmentIds);
  console.log(`👤 Creator ID: ${creatorId}`);
  
  try {
    if (!garmentIds || garmentIds.length === 0) {
      console.log("⚠️ No garment IDs provided, skipping work creation");
      return { success: true, works: [] };
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      console.log("❌ Order not found!");
      return { success: false, error: 'Order not found' };
    }
    
    console.log(`📋 Order found: ${order.orderId}`);
    
    console.log("🔍 Checking for existing works...");
    const existingWorks = await Work.find({ 
      garment: { $in: garmentIds },
      isActive: true 
    });
    
    if (existingWorks.length > 0) {
      console.log(`⚠️ Works already exist for ${existingWorks.length} garments, skipping creation`);
      return { success: true, works: existingWorks };
    }
    
    console.log("📦 Fetching garment documents...");
    const garmentDocs = await Garment.find({ _id: { $in: garmentIds } }).lean();
    console.log(`📦 Found ${garmentDocs.length} garments in database`);
    
    const createdWorks = [];

    for (const garment of garmentDocs) {
      const workCount = await Work.countDocuments({ order: orderId, isActive: true });
      const sequence = workCount + 1;
      const seqStr = sequence < 100 ? String(sequence).padStart(2, "0") : String(sequence);
      const workId = `${order.orderId}.${seqStr}`;
      
      console.log(`🧵 Generated Work ID: ${workId} (Sequence: ${sequence} for order ${order.orderId})`);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      console.log(`📝 Creating work for garment: ${garment.name || garment._id}`);
      const work = await Work.create({
        workId,
        order: orderId,
        garment: garment._id,
        createdBy: creatorId,
        status: "pending",
        cuttingMaster: null,
        currentStage: order.currentStage || "cutting",
        // Dynamic propagation fix: Direct structural replication
        workflowStages: order.workflowStages,
        stageKeys: order.stageKeys,
        estimatedDelivery: garment.estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000)
      });
      
      createdWorks.push(work);
      
      await Garment.findByIdAndUpdate(garment._id, { workId: work._id });
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

    const [todayCount, weekCount, monthCount, totalCount, overdueCount, paymentPendingCount] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today }, isActive: true }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek }, isActive: true }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth }, isActive: true }),
      Order.countDocuments({ isActive: true }),
      Order.countDocuments({ deliveryDate: { $lt: today }, status: { $nin: ['delivered', 'cancelled'] }, isActive: true }),
      Order.countDocuments({ 'paymentSummary.paymentStatus': 'pending', isActive: true })
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

    if (processedStages.length === 0) {
      const defaultKeys = ["cutting", "stitching", "ironing", "packed"];
      processedStages = defaultKeys.map((k, i) => ({
        key: k,
        label: k.charAt(0).toUpperCase() + k.slice(1),
        order: i + 1,
      }));
    }

    const stageKeys = processedStages.map((s) => s.key);
    const activeStage = stageKeys[0] || "cutting";
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
        totalMin += Number(g.minPrice || g.priceRange?.min) || 0;
        totalMax += Number(g.maxPrice || g.priceRange?.max) || 0;
      });
    } else if (priceSummary) {
      totalMin = Number(priceSummary.totalMin) || 0;
      totalMax = Number(priceSummary.totalMax) || 0;
    }

    const allPayments = [...payments];
    const totalInitialPaid = allPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const order = await Order.create({
      orderId,
      customer,
      deliveryDate,
      currentStage: activeStage,
      // Fix: Both fields explicitly populated from our parsed execution pipeline
      workflowStages: workflowStagesObj,
      stageKeys: stageKeys,
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
    });

    const fileGroups = extractGarmentFiles(req);
    const createdPayments = [];

    if (allPayments.length > 0) {
      const existingPayments = await Payment.find({ order: order._id });
      if (existingPayments.length === 0) {
        let runningPaid = 0;
        for (const paymentData of allPayments) {
          let safeAmount = Number(paymentData.amount) || 0;
          runningPaid += safeAmount;
          
          const now = new Date();
          const paymentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
          
          await new Promise(resolve => setTimeout(resolve, 10));
          
          const payment = await Payment.create({
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
          });
          
          await createIncomeFromPayment(payment, order, creatorId);
          createdPayments.push(payment);
        }
      }
    }

    const createdGarmentIds = [];
    if (garments && garments.length > 0) {
      const existingGarments = await Garment.find({ order: order._id });
      if (existingGarments.length === 0) {
        for (let i = 0; i < garments.length; i++) {
          const g = garments[i];
          if (i > 0) await new Promise(resolve => setTimeout(resolve, 50));

          const uploadedImages = { referenceImages: [], customerImages: [], customerClothImages: [] };

          if (fileGroups[i]?.referenceImages?.length > 0) {
            uploadedImages.referenceImages = await r2Service.uploadMultiple(fileGroups[i].referenceImages, `orders/${order._id}/garment_${i}/reference`);
          }
          if (fileGroups[i]?.customerImages?.length > 0) {
            uploadedImages.customerImages = await r2Service.uploadMultiple(fileGroups[i].customerImages, `orders/${order._id}/garment_${i}/customer`);
          }
          if (fileGroups[i]?.customerClothImages?.length > 0) {
            uploadedImages.customerClothImages = await r2Service.uploadMultiple(fileGroups[i].customerClothImages, `orders/${order._id}/garment_${i}/cloth`);
          }

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
            referenceImages: uploadedImages.referenceImages,
            customerImages: uploadedImages.customerImages,
            customerClothImages: uploadedImages.customerClothImages,
            order: order._id,
            createdBy: creatorId,
            status: 'pending',
            metadata: { requestId: requestId, sequence: i + 1 }
          };

          const garment = await Garment.create(garmentData);
          createdGarmentIds.push(garment._id);
        }
        
        order.garments = createdGarmentIds;
        order.status = "confirmed";
        await order.save();
        
        if (createdGarmentIds.length > 0) {
          await createWorksFromGarments(order._id, createdGarmentIds, creatorId);
        }
      }
    }

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
      const customerIds = await Customer.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { customerId: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).distinct('_id');
      
      const garmentIds = await Garment.find({ name: { $regex: search, $options: 'i' } }).distinct('_id');

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

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name phone customerId')
      .populate("garments")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, orders, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
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
      .populate('customer', 'name phone customerId email address addressLine1 addressLine2 city state pincode')
      .populate({
        path: "garments",
        populate: [
          { path: "category", select: "name" },
          { path: "item", select: "name" },
          { path: "workId" }
        ]
      })
      .populate("createdBy", "name");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const payments = await Payment.find({ order: order._id, isDeleted: false })
      .populate('receivedBy', 'name')
      .sort('-paymentDate -paymentTime');

    const works = await Work.find({ order: order._id, isActive: true }).populate('garment', 'name item category');

    res.json({ success: true, order, payments, works });
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
    const { deliveryDate, specialNotes, advancePayment, priceSummary, status, newGarments, currentStage, workflowStages } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

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

    await order.save();
    await updateOrderPaymentSummary(order._id);

    try {
      const { syncOrderInvoice } = await import('../services/invoice.service.js');
      await syncOrderInvoice(order._id);
    } catch (syncErr) {}
    
    res.json({ success: true, message: "Order updated successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 6. UPDATE ORDER STATUS
// ============================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    const validStatuses = ["draft", "confirmed", "in-progress", "ready-to-delivery", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status.` });
    }
    
    const order = await Order.findById(id).populate('customer').populate('garments');
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    
    const balance = Number(order.balanceAmount) || 0;
    if (status === 'delivered' && balance > 0 && req.body.bypassDeliveryLock !== true) {
      return res.status(400).json({ deliveryLocked: true, message: `Delivery Blocked: Outstanding balance.` });
    }
    
    const oldStatus = order.status;
    order.status = status;
    
    // Fallback safe closure for final milestones
    if (status === 'delivered') {
      order.currentStage = 'delivered';
    } else if (status === 'ready-to-deliver') {
      order.currentStage = order.stageKeys?.[order.stageKeys.length - 2] || 'packing';
    }
    
    await order.save();

    if (status === 'ready-to-deliver' && oldStatus !== 'ready-to-deliver') {
      try {
        const { sendReadyToDeliver } = await import('./whatsapp.controller.js');
        sendReadyToDeliver(order._id).catch(() => {});
      } catch (waErr) {}
    }

    if (status === 'cancelled') {
      await Work.updateMany({ order: order._id, status: { $ne: 'ready-to-deliver' } }, { status: 'cancelled', isActive: false });
    } else if (status === 'in-progress') {
  const firstStage = order.stageKeys?.[0] || 'cutting';

  await Work.updateMany(
    {
      order: order._id,
      status: 'pending'
    },
    {
      status: firstStage,
      currentStage: firstStage
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
    
    res.json({ success: true, message: `Order status updated`, order: updatedOrder });
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

    await Garment.updateMany({ _id: { $in: order.garments } }, { isActive: false });
    await Work.updateMany({ order: order._id }, { isActive: false });
    await Payment.updateMany({ order: order._id }, { isDeleted: true });
    await Transaction.updateMany({ order: order._id }, { status: 'cancelled' });

    order.isActive = false;
    await order.save();
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
    const creatorId = req.user?._id || req.user?.id;
    
    const existingPayments = await Payment.find({ order: order._id, isDeleted: false });
    const totalPaidBefore = existingPayments.reduce((sum, p) => sum + p.amount, 0);
    const newTotalPaid = totalPaidBefore + Number(paymentData.amount);
    
    const garments = await Garment.find({ order: order._id, isActive: true });
    const totalMin = garments.reduce((sum, g) => sum + (Number(g.minPrice || g.priceRange?.min) || 0), 0);
    const totalMax = garments.reduce((sum, g) => sum + (Number(g.maxPrice || g.priceRange?.max) || 0), 0);
    
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

    const todayOrders = await Order.find({ createdAt: { $gte: today }, isActive: true }).populate('customer', 'name');
    const pendingDeliveries = await Order.find({ deliveryDate: { $lt: new Date() }, status: { $nin: ['delivered', 'cancelled'] }, isActive: true }).populate('customer', 'name phone');
    const readyForDelivery = await Order.find({ status: 'ready-to-deliver', isActive: true }).populate('customer', 'name phone');
    const recentOrders = await Order.find({ isActive: true }).populate('customer', 'name').sort({ createdAt: -1 }).limit(10);
    const todayPayments = await Payment.find({ paymentDate: { $gte: today }, isDeleted: false });
    const todayCollection = todayPayments.reduce((sum, p) => sum + p.amount, 0);
    const todayIncome = await Transaction.find({ transactionDate: { $gte: today }, type: 'income', status: 'completed' });

    res.json({
      success: true,
      dashboard: {
        todayOrders: { count: todayOrders.length, orders: todayOrders },
        pendingDeliveries: { count: pendingDeliveries.length, orders: pendingDeliveries },
        readyForDelivery: { count: readyForDelivery.length, orders: readyForDelivery },
        recentOrders,
        todayCollection,
        totalIncomeToday: todayIncome.reduce((sum, t) => sum + t.amount, 0),
        incomeBreakdown: {
          handCash: todayIncome.filter(t => t.accountType === 'hand-cash').reduce((sum, t) => sum + t.amount, 0),
          bank: todayIncome.filter(t => t.accountType === 'bank').reduce((sum, t) => sum + t.amount, 0)
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
      Order.countDocuments({ ...query, status: 'in-progress' }),
      Order.countDocuments({ ...query, status: 'ready-to-deliver' }),
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
    res.json({ success: true, orders, count: orders.length });
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

    res.json({ success: true, orders, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(totalCount / parseInt(limit)), totalCount } });
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