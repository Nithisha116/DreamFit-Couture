// // controllers/order.controller.js
// import Order from "../models/Order.js";
// import Garment from "../models/Garment.js";
// import Work from "../models/Work.js";
// import Customer from "../models/Customer.js";
// import Payment from "../models/Payment.js";
// import Transaction from "../models/Transaction.js";
// import CuttingMaster from "../models/CuttingMaster.js";
// import Tailor from "../models/Tailor.js";
// import StoreKeeper from "../models/StoreKeeper.js";
// import { createNotification } from "./notification.controller.js";
// import r2Service from "../services/r2.service.js";
// import crypto from "crypto";
// import multer from "multer";

// // Configure multer for memory storage
// export const upload = multer({ 
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });

// // ============================================
// // ✅ HELPER: EXTRACT FILES FROM REQUEST
// // ============================================
// const extractGarmentFiles = (req) => {
//   console.log("\n📎 EXTRACTING FILES FROM REQUEST");
  
//   const fileGroups = {};
  
//   if (!req.files || req.files.length === 0) {
//     console.log("⚠️ No files found in request");
//     return fileGroups;
//   }

//   // 🔥 FIX: Group files by garment index from fieldname
//   req.files.forEach(file => {
//     // Expected fieldname format: garments[0].referenceImages
//     const match = file.fieldname.match(/garments\[(\d+)\]\.(\w+)/);
//     if (match) {
//       const index = parseInt(match[1]);
//       const type = match[2]; // referenceImages, customerImages, customerClothImages
      
//       if (!fileGroups[index]) {
//         fileGroups[index] = {
//           referenceImages: [],
//           customerImages: [],
//           customerClothImages: []
//         };
//       }
      
//       fileGroups[index][type].push(file);
//       console.log(`📸 File for garment ${index}: ${type} - ${file.originalname}`);
//     } else {
//       // 🔥 FIX: Handle simple fieldnames (fallback)
//       console.log(`⚠️ Unmatched fieldname format: ${file.fieldname}`);
//     }
//   });
  
//   console.log(`✅ Grouped files for ${Object.keys(fileGroups).length} garments`);
//   return fileGroups;
// };

// // ============================================
// // ✅ HELPER: CREATE INCOME FROM PAYMENT
// // ============================================
// const createIncomeFromPayment = async (payment, order, creatorId) => {
//   try {
//     console.log(`💰 Creating income from payment: ₹${payment.amount}`);
    
//     const accountType = payment.method === 'cash' ? 'hand-cash' : 'bank';
    
//     let category = 'customer-advance';
//     if (payment.type === 'full') {
//       category = 'full-payment';
//     } else if (payment.type === 'advance' && order.paymentSummary?.paymentStatus === 'paid') {
//       category = 'full-payment';
//     } else if (payment.type === 'extra') {
//       category = 'fabric-sale';
//     }
    
//     const customer = await Customer.findById(order.customer);
    
//     const incomeTransaction = await Transaction.create({
//       type: 'income',
//       category: category,
//       amount: payment.amount,
//       paymentMethod: payment.method,
//       accountType: accountType,
//       customer: order.customer,
//       customerDetails: customer ? {
//         name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
//         phone: customer.phone,
//         id: customer.customerId || customer._id
//       } : null,
//       order: order._id,
//       description: `Payment for Order #${order.orderId} - ${payment.notes || payment.type || 'advance'}`,
//       transactionDate: payment.paymentDate || new Date(),
//       referenceNumber: payment.referenceNumber || '',
//       createdBy: creatorId,
//       status: 'completed'
//     });
    
//     console.log(`✅ Income created: ₹${payment.amount} (${category}) - ${accountType}`);
//     return incomeTransaction;
//   } catch (error) {
//     console.error("❌ Error creating income:", error);
//     return null;
//   }
// };

// // ============================================
// // ✅ HELPER: UPDATE ORDER PAYMENT SUMMARY
// // ============================================
// const updateOrderPaymentSummary = async (orderId) => {
//   console.log(`\n💰 Updating payment summary for order: ${orderId}`);
  
//   try {
//     const order = await Order.findById(orderId);
//     if (!order) return;

//     const payments = await Payment.find({ 
//       order: orderId, 
//       isDeleted: false,
//       type: { $in: ['advance', 'full', 'partial', 'extra'] }
//     });

//     const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
//     const lastPayment = payments.sort((a, b) => 
//       new Date(b.paymentDate) - new Date(a.paymentDate)
//     )[0];

//     let paymentStatus = 'pending';
//     const totalAmount = order.priceSummary?.totalMax || 0;
    
//     if (totalPaid >= totalAmount) {
//       paymentStatus = totalPaid > totalAmount ? 'overpaid' : 'paid';
//     } else if (totalPaid > 0) {
//       paymentStatus = 'partial';
//     }

//     order.paymentSummary = {
//       totalPaid,
//       lastPaymentDate: lastPayment?.paymentDate,
//       lastPaymentAmount: lastPayment?.amount,
//       paymentCount: payments.length,
//       paymentStatus
//     };
    
//     order.balanceAmount = totalAmount - totalPaid;
    
//     await order.save();
//     console.log(`✅ Payment summary updated: Paid: ₹${totalPaid}, Status: ${paymentStatus}`);
    
//     return { success: true, totalPaid, paymentStatus };
//   } catch (error) {
//     console.error("❌ Error updating payment summary:", error);
//     return { success: false, error: error.message };
//   }
// };

// // ============================================
// // ✅ HELPER: CREATE WORKS FROM EXISTING GARMENTS (FIXED WITH NOTIFICATION DEBUG)
// // ============================================
// const createWorksFromGarments = async (orderId, garmentIds, creatorId) => {
//   console.log("\n🚀 ===== CREATE WORKS FROM GARMENTS =====");
//   console.log(`📦 Order ID: ${orderId}`);
//   console.log(`👕 Garment IDs:`, garmentIds);
//   console.log(`👤 Creator ID: ${creatorId}`);
  
//   try {
//     if (!garmentIds || garmentIds.length === 0) {
//       console.log("⚠️ No garment IDs provided, skipping work creation");
//       return { success: true, works: [] };
//     }
    
//     // Check if works already exist for these garments
//     console.log("🔍 Checking for existing works...");
//     const existingWorks = await Work.find({ 
//       garment: { $in: garmentIds },
//       isActive: true 
//     });
    
//     if (existingWorks.length > 0) {
//       console.log(`⚠️ Works already exist for ${existingWorks.length} garments, skipping creation`);
//       return { success: true, works: existingWorks };
//     }
    
//     // Get the garment documents to access their data
//     console.log("📦 Fetching garment documents...");
//     const garmentDocs = await Garment.find({ _id: { $in: garmentIds } }).lean();
//     console.log(`📦 Found ${garmentDocs.length} garments in database`);
    
//     const createdWorks = [];

//     // 🔥 FIX: Sequential work creation to prevent duplicates
//     for (const garment of garmentDocs) {
//       const workId = `WRK-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
//       // Add small delay to ensure unique timestamps
//       await new Promise(resolve => setTimeout(resolve, 10));
      
//       console.log(`📝 Creating work for garment: ${garment.name || garment._id}`);
//       const work = await Work.create({
//         workId,
//         order: orderId,
//         garment: garment._id,
//         createdBy: creatorId,
//         status: "pending",
//         cuttingMaster: null,
//         estimatedDelivery: garment.estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000)
//       });
      
//       createdWorks.push(work);
      
//       // Update garment with work ID
//       await Garment.findByIdAndUpdate(garment._id, { workId: work._id });
//       console.log(`✅ Created work: ${work._id} (${work.workId})`);
//     }
    
//     console.log(`✅ Created ${createdWorks.length} works sequentially`);
    
//     // 🔥🔥🔥 FIX: Send notifications to ALL cutting masters with debug
//     if (createdWorks.length > 0) {
//       console.log("\n🔔 ATTEMPTING TO SEND NOTIFICATIONS TO CUTTING MASTERS...");
      
//       console.log("✂️ Querying for active cutting masters...");
//       const cuttingMasters = await CuttingMaster.find({ isActive: true }).lean();
//       console.log(`✂️ Found ${cuttingMasters.length} active cutting masters`);
      
//       if (cuttingMasters.length > 0) {
//         console.log("📋 Cutting masters list:");
//         cuttingMasters.forEach((master, idx) => {
//           console.log(`  ${idx + 1}. ID: ${master._id}, Name: ${master.name || 'No name'}, Active: ${master.isActive}`);
//         });
        
//         console.log("\n📨 Sending notifications to each cutting master...");
        
//         for (const master of cuttingMasters) {
//           try {
//             console.log(`\n📨 Sending to master: ${master.name || master._id} (ID: ${master._id})`);
            
//             const notificationData = {
//               type: 'work-available',
//               recipient: master._id,
//               title: '🔔 New Work Available',
//               message: `${createdWorks.length} new work(s) are waiting for your acceptance`,
//               reference: {
//                 orderId: orderId,
//                 workCount: createdWorks.length,
//                 workIds: createdWorks.map(w => w._id)
//               },
//               priority: 'high',
//               recipientModel: 'CuttingMaster'
//             };
            
//             console.log("📦 Notification data:", JSON.stringify(notificationData, null, 2));
            
//             const notification = await createNotification(notificationData);
            
//             if (notification) {
//               console.log(`✅ Notification sent successfully! ID: ${notification._id}`);
//             } else {
//               console.log(`⚠️ Notification returned null/undefined`);
//             }
//           } catch (notifyError) {
//             console.error(`❌ Failed to send notification to ${master._id}:`, notifyError.message);
//             console.error("Full error:", notifyError);
//           }
//         }
//       } else {
//         console.log("⚠️ NO ACTIVE CUTTING MASTERS FOUND!");
        
//         // Check if there are ANY cutting masters
//         console.log("🔍 Checking for ANY cutting masters (including inactive)...");
//         const allMasters = await CuttingMaster.find({}).lean();
//         console.log(`📊 Total cutting masters in DB: ${allMasters.length}`);
        
//         if (allMasters.length > 0) {
//           allMasters.forEach((m, i) => {
//             console.log(`  Master ${i+1}: ${m.name || 'No name'} - Active: ${m.isActive}, ID: ${m._id}`);
//           });
//         } else {
//           console.log("❌ NO CUTTING MASTERS FOUND AT ALL in database!");
//         }
//       }
//     }
    
//     return { success: true, works: createdWorks };
//   } catch (error) {
//     console.error("\n❌ ERROR CREATING WORKS:", error);
//     console.error("Error stack:", error.stack);
//     return { success: false, error: error.message };
//   }
// };

// // ============================================
// // ✅ 1. GET ORDER STATS
// // ============================================
// export const getOrderStats = async (req, res) => {
//   console.log("\n📊 ===== GET ORDER STATS =====");
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const startOfWeek = new Date(today);
//     startOfWeek.setDate(today.getDate() - today.getDay());

//     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

//     const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
//       Order.countDocuments({ createdAt: { $gte: today }, isActive: true }),
//       Order.countDocuments({ createdAt: { $gte: startOfWeek }, isActive: true }),
//       Order.countDocuments({ createdAt: { $gte: startOfMonth }, isActive: true }),
//       Order.countDocuments({ isActive: true })
//     ]);

//     const statusStats = await Order.aggregate([
//       { $match: { isActive: true } },
//       { $group: { _id: "$status", count: { $sum: 1 } } }
//     ]);

//     const paymentStats = await Order.aggregate([
//       { $match: { isActive: true } },
//       { $group: { 
//         _id: "$paymentSummary.paymentStatus",
//         count: { $sum: 1 },
//         totalAmount: { $sum: "$priceSummary.totalMax" },
//         totalPaid: { $sum: "$paymentSummary.totalPaid" }
//       }}
//     ]);

//     res.status(200).json({
//       success: true,
//       stats: {
//         today: todayCount,
//         thisWeek: weekCount,
//         thisMonth: monthCount,
//         total: totalCount,
//         statusBreakdown: statusStats,
//         paymentBreakdown: paymentStats
//       }
//     });
//   } catch (error) {
//     console.error("❌ Stats Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 2. CREATE ORDER (WITH IMAGES & R2 UPLOAD)
// // ============================================
// export const createOrder = async (req, res) => {
//   console.log("\n🆕 ===== CREATE ORDER =====");
//   console.log("📦 Request body type:", typeof req.body);
//   console.log("📎 Files received:", req.files ? req.files.length : 0);
  
//   try {
//     // 🔥 FIX 1: Parse FormData
//     let orderData = { ...req.body };
    
//     // Parse garments if it's a string (from FormData)
//     if (typeof orderData.garments === 'string') {
//       try {
//         orderData.garments = JSON.parse(orderData.garments);
//         console.log("✅ Parsed garments from string");
//       } catch (e) {
//         console.log("Garments is already parsed");
//       }
//     }

//     // Parse payments if it's a string
//     if (typeof orderData.payments === 'string') {
//       try {
//         orderData.payments = JSON.parse(orderData.payments);
//       } catch (e) {}
//     }
    
//     // Parse advancePayment if it's a string
//     if (typeof orderData.advancePayment === 'string') {
//       try {
//         orderData.advancePayment = JSON.parse(orderData.advancePayment);
//       } catch (e) {}
//     }

//     const {
//       customer,
//       deliveryDate,
//       garments,
//       specialNotes,
//       advancePayment,
//       priceSummary,
//       status,
//       orderDate,
//       payments = [],
//       requestId
//     } = orderData;

//     const creatorId = req.user?._id || req.user?.id;
//     if (!creatorId) {
//       return res.status(401).json({ success: false, message: "Authentication failed" });
//     }

//     if (!customer || !deliveryDate) {
//       return res.status(400).json({ success: false, message: "Customer and Delivery Date are required" });
//     }

//     // 🔥🔥🔥 CHANGE 1: SUPER STRONG DUPLICATE PREVENTION
//     // Check for duplicate request using requestId
//     if (requestId) {
//       console.log(`🔍 Checking for duplicate request: ${requestId}`);
//       const existingOrder = await Order.findOne({ 'metadata.requestId': requestId });
//       if (existingOrder) {
//         console.log(`⚠️ DUPLICATE DETECTED! Request ${requestId} already processed`);
//         return res.status(200).json({ 
//           success: true, 
//           message: "Order already exists",
//           order: existingOrder,
//           duplicate: true
//         });
//       }
//     }

//     // Also check for recent orders with same customer (within last 3 seconds)
//     const threeSecondsAgo = new Date(Date.now() - 3000);
//     const recentDuplicate = await Order.findOne({
//       customer: customer,
//       'priceSummary.totalMax': priceSummary?.totalMax,
//       createdAt: { $gte: threeSecondsAgo }
//     });

//     if (recentDuplicate) {
//       console.log(`⚠️ RECENT DUPLICATE DETECTED! Similar order created in last 3 seconds`);
//       return res.status(200).json({ 
//         success: true, 
//         message: "Order already exists (recent duplicate)",
//         order: recentDuplicate,
//         duplicate: true
//       });
//     }

//     // Generate UNIQUE orderId
//     const date = new Date();
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
    
//     // Generate random 3-character string (A-Z, 0-9)
//     const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
//     // Get last 4 digits of timestamp
//     const timePart = Date.now().toString().slice(-4);
    
//     const orderId = `${day}${month}${year}-${randomStr}${timePart}`;

//     // Calculate totals
//     let totalMin = priceSummary?.totalMin || 0;
//     let totalMax = priceSummary?.totalMax || 0;
    
//     if (garments && garments.length > 0) {
//       garments.forEach((g) => {
//         if (g.priceRange) {
//           totalMin += Number(g.priceRange.min) || 0;
//           totalMax += Number(g.priceRange.max) || 0;
//         }
//       });
//     }

//     // Combine payments
//     let allPayments = [...payments];
//     if (advancePayment?.amount > 0 && !allPayments.some(p => p.type === 'advance')) {
//       allPayments.push({
//         amount: Number(advancePayment.amount),
//         type: 'advance',
//         method: advancePayment.method || 'cash',
//         paymentDate: advancePayment.date || new Date(),
//         notes: 'Initial advance payment'
//       });
//     }

//     const totalInitialPaid = allPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

//     // Create order
//     const order = await Order.create({
//       orderId,
//       customer,
//       deliveryDate,
//       garments: [],
//       specialNotes,
//       advancePayment: {
//         amount: advancePayment?.amount || 0,
//         method: advancePayment?.method || "cash",
//         date: advancePayment?.date || new Date(),
//       },
//       priceSummary: { totalMin, totalMax },
//       paymentSummary: {
//         totalPaid: totalInitialPaid,
//         lastPaymentDate: allPayments.length > 0 ? new Date() : null,
//         lastPaymentAmount: allPayments.length > 0 ? allPayments[allPayments.length - 1].amount : 0,
//         paymentCount: allPayments.length,
//         paymentStatus: totalInitialPaid >= totalMax ? 'paid' : (totalInitialPaid > 0 ? 'partial' : 'pending')
//       },
//       balanceAmount: totalMax - totalInitialPaid,
//       createdBy: creatorId,
//       status: status || "draft",
//       orderDate: orderDate || new Date(),
//       metadata: {
//         requestId: requestId || null,
//         createdAt: new Date()
//       }
//     });

//     console.log(`✅ Order created with ID: ${order._id}`);

//     // Extract files grouped by garment
//     const fileGroups = extractGarmentFiles(req);

//     // Create payments
//     const createdPayments = [];
//     if (allPayments.length > 0) {
//       const existingPayments = await Payment.find({ order: order._id });
      
//       if (existingPayments.length === 0) {
//         for (const paymentData of allPayments) {
          
//           let safeAmount = 0;
          
//           if (paymentData.amount === undefined || paymentData.amount === null) {
//             safeAmount = 0;
//           } else {
//             const numAmount = Number(paymentData.amount);
//             const floatAmount = parseFloat(paymentData.amount);
            
//             if (!isNaN(numAmount) && numAmount > 0) {
//               safeAmount = numAmount;
//             } else if (!isNaN(floatAmount) && floatAmount > 0) {
//               safeAmount = floatAmount;
//             } else {
//               safeAmount = 0;
//             }
//           }
          
//           const now = new Date();
//           const hours = String(now.getHours()).padStart(2, '0');
//           const minutes = String(now.getMinutes()).padStart(2, '0');
//           const seconds = String(now.getSeconds()).padStart(2, '0');
//           const paymentTime = `${hours}:${minutes}:${seconds}`;
          
//           await new Promise(resolve => setTimeout(resolve, 10));
          
//           const payment = await Payment.create({
//             order: order._id,
//             customer: order.customer,
//             amount: safeAmount,
//             type: paymentData.type || 'advance',
//             method: paymentData.method || 'cash',
//             referenceNumber: paymentData.referenceNumber || '',
//             paymentDate: paymentData.paymentDate || new Date(),
//             paymentTime: paymentTime,
//             notes: paymentData.notes || '',
//             receivedBy: creatorId,
//             metadata: {
//               requestId: requestId
//             }
//           });
          
//           await createIncomeFromPayment(payment, order, creatorId);
//           createdPayments.push(payment);
//         }
//       }
//     }

//     // Create garments
//     const createdGarmentIds = [];
//     if (garments && garments.length > 0) {
//       const existingGarments = await Garment.find({ order: order._id });
      
//       if (existingGarments.length === 0) {
//         for (let i = 0; i < garments.length; i++) {
//           const g = garments[i];
          
//           if (i > 0) {
//             await new Promise(resolve => setTimeout(resolve, 50));
//           }

//           // Upload images
//           const uploadedImages = {
//             referenceImages: [],
//             customerImages: [],
//             customerClothImages: []
//           };

//           if (fileGroups[i]?.referenceImages?.length > 0) {
//             const results = await r2Service.uploadMultiple(
//               fileGroups[i].referenceImages, 
//               `orders/${order._id}/garment_${i}/reference`
//             );
//             uploadedImages.referenceImages = results;
//           }

//           if (fileGroups[i]?.customerImages?.length > 0) {
//             const results = await r2Service.uploadMultiple(
//               fileGroups[i].customerImages, 
//               `orders/${order._id}/garment_${i}/customer`
//             );
//             uploadedImages.customerImages = results;
//           }

//           if (fileGroups[i]?.customerClothImages?.length > 0) {
//             const results = await r2Service.uploadMultiple(
//               fileGroups[i].customerClothImages, 
//               `orders/${order._id}/garment_${i}/cloth`
//             );
//             uploadedImages.customerClothImages = results;
//           }

//           // Prepare garment data
//           const garmentData = {
//             name: g.name,
//             garmentType: g.garmentType || g.item || g.itemName || g.name,
//             category: g.category,
//             item: g.item,
//             categoryName: g.categoryName,
//             itemName: g.itemName,
//             measurements: g.measurements || [],
//             measurementTemplate: g.measurementTemplate && g.measurementTemplate !== '' 
//               ? g.measurementTemplate 
//               : null,
//             measurementSource: g.measurementSource || 'customer',
//             additionalInfo: g.additionalInfo || '',
//             estimatedDelivery: g.estimatedDelivery || deliveryDate,
//             priority: g.priority || 'normal',
//             priceRange: {
//               min: Number(g.priceRange?.min) || 0,
//               max: Number(g.priceRange?.max) || 0
//             },
//             fabricSource: g.fabricSource || 'customer',
//             fabricPrice: g.fabricPrice || '0',
//             referenceImages: uploadedImages.referenceImages,
//             customerImages: uploadedImages.customerImages,
//             customerClothImages: uploadedImages.customerClothImages,
//             order: order._id,
//             createdBy: creatorId,
//             status: 'pending',
//             metadata: {
//               requestId: requestId,
//               sequence: i + 1
//             }
//           };

//           // Remove undefined fields
//           Object.keys(garmentData).forEach(key => 
//             garmentData[key] === undefined && delete garmentData[key]
//           );
          
//           const garment = await Garment.create(garmentData);
//           createdGarmentIds.push(garment._id);
//         }
        
//         // Update the order with garment IDs
//         order.garments = createdGarmentIds;
//         order.status = "confirmed";
//         await order.save();
        
//         // Create works (using FIXED function)
//         if (createdGarmentIds.length > 0) {
//           await createWorksFromGarments(order._id, createdGarmentIds, creatorId);
//         }
//       }
//     }

//     await order.populate('customer', 'name phone customerId');

//     console.log(`\n🎉 Order completed successfully!`);
//     console.log(`📦 Order ID: ${order._id}`);
//     console.log(`📦 Order Number: ${order.orderId}`);
//     console.log(`👕 Garments created: ${createdGarmentIds.length}`);
//     console.log(`💰 Payments created: ${createdPayments.length}`);

//     res.status(201).json({ 
//       success: true, 
//       message: "Order created successfully",
//       order 
//     });
//   } catch (error) {
//     console.error("\n❌ CREATE ORDER ERROR:", error);
    
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ success: false, message: "Validation failed", errors });
//     }
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       const value = error.keyValue[field];
      
//       // Special handling for orderId duplicates
//       if (field === 'orderId') {
//         console.log(`⚠️ Duplicate orderId: ${value}, retrying with new ID...`);
        
//         const date = new Date();
//         const day = String(date.getDate()).padStart(2, '0');
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const year = date.getFullYear();
        
//         const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
//         const timePart = Date.now().toString().slice(-5);
        
//         const newOrderId = `${day}${month}${year}-${randomStr}${timePart}`;
        
//         req.body.orderId = newOrderId;
//         return createOrder(req, res);
//       }
      
//       return res.status(400).json({ 
//         success: false, 
//         message: `Duplicate ${field}: ${value}. Please try again.`
//       });
//     }
    
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 3. GET ALL ORDERS
// // ============================================
// export const getAllOrders = async (req, res) => {
//   console.log("\n📋 ===== GET ALL ORDERS =====");
  
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       status,
//       paymentStatus,
//       timeFilter = "all",
//       startDate,
//       endDate,
//     } = req.query;

//     let query = { isActive: true };

//     if (search) {
//       const customerIds = await Customer.find({
//         $or: [
//           { name: { $regex: search, $options: 'i' } },
//           { phone: { $regex: search, $options: 'i' } }
//         ]
//       }).distinct('_id');
      
//       query.$or = [
//         { orderId: { $regex: search, $options: 'i' } },
//         { customer: { $in: customerIds } }
//       ];
//     }

//     if (status && status !== "all") {
//       query.status = status;
//     }

//     if (paymentStatus && paymentStatus !== "all") {
//       query['paymentSummary.paymentStatus'] = paymentStatus;
//     }

//     const now = new Date();
//     if (timeFilter !== "all") {
//       let filterDate = new Date();
//       if (timeFilter === "week") filterDate.setDate(now.getDate() - 7);
//       else if (timeFilter === "month") filterDate.setMonth(now.getMonth() - 1);
//       else if (timeFilter === "3m") filterDate.setMonth(now.getMonth() - 3);
      
//       query.createdAt = { $gte: filterDate };
//     }

//     if (startDate && endDate) {
//       query.createdAt = { 
//         $gte: new Date(startDate), 
//         $lte: new Date(endDate) 
//       };
//     }

//     const total = await Order.countDocuments(query);

//     const orders = await Order.find(query)
//       .populate('customer', 'name phone customerId')
//       .populate("garments")
//       .populate("createdBy", "name")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     res.json({ 
//       success: true, 
//       orders, 
//       pagination: { 
//         page: parseInt(page), 
//         limit: parseInt(limit), 
//         total, 
//         pages: Math.ceil(total / limit) 
//       } 
//     });
//   } catch (error) {
//     console.error("❌ Get all orders error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 4. GET ORDER BY ID
// // ============================================
// export const getOrderById = async (req, res) => {
//   console.log(`\n🔍 ===== GET ORDER BY ID: ${req.params.id} =====`);
  
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate('customer', 'name phone customerId email address addressLine1 addressLine2 city state pincode')
//       .populate({
//         path: "garments",
//         populate: [
//           { path: "category", select: "name" },
//           { path: "item", select: "name" },
//           { path: "workId" }
//         ]
//       })
//       .populate("createdBy", "name");

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     const payments = await Payment.find({ 
//       order: order._id,
//       isDeleted: false 
//     })
//     .populate('receivedBy', 'name')
//     .sort('-paymentDate -paymentTime');

//     const works = await Work.find({ order: order._id, isActive: true })
//       .populate('garment', 'name item category')
//       .populate('cuttingMaster', 'name');

//     res.json({ 
//       success: true, 
//       order,
//       payments,
//       works
//     });
//   } catch (error) {
//     console.error("❌ Get order error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 5. UPDATE ORDER
// // ============================================
// export const updateOrder = async (req, res) => {
//   console.log(`\n📝 ===== UPDATE ORDER: ${req.params.id} =====`);
  
//   try {
//     const { id } = req.params;
//     const {
//       deliveryDate,
//       specialNotes,
//       advancePayment,
//       priceSummary,
//       status,
//       newGarments
//     } = req.body;

//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     if (deliveryDate) order.deliveryDate = deliveryDate;
//     if (specialNotes !== undefined) order.specialNotes = specialNotes;
    
//     if (advancePayment) {
//       order.advancePayment = {
//         amount: advancePayment.amount !== undefined ? advancePayment.amount : order.advancePayment.amount,
//         method: advancePayment.method || order.advancePayment.method,
//         date: advancePayment.date || order.advancePayment.date || new Date()
//       };
//     }
    
//     if (priceSummary) {
//       order.priceSummary = {
//         totalMin: priceSummary.totalMin !== undefined ? priceSummary.totalMin : order.priceSummary.totalMin,
//         totalMax: priceSummary.totalMax !== undefined ? priceSummary.totalMax : order.priceSummary.totalMax
//       };
//     }
    
//     if (status) order.status = status;

//     if (newGarments && newGarments.length > 0) {
//       order.garments = [...order.garments, ...newGarments];
      
//       const creatorId = req.user?._id || req.user?.id;
//       await createWorksFromGarments(order._id, newGarments, creatorId);
//     }

//     await order.save();
    
//     await updateOrderPaymentSummary(order._id);
    
//     res.json({ success: true, message: "Order updated successfully", order });
//   } catch (error) {
//     console.error("❌ Update error:", error);
    
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ success: false, message: "Validation failed", errors });
//     }
    
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 6. UPDATE ORDER STATUS
// // ============================================
// export const updateOrderStatus = async (req, res) => {
//   console.log(`\n🔄 ===== UPDATE ORDER STATUS: ${req.params.id} =====`);
  
//   try {
//     const { status } = req.body;
//     const { id } = req.params;
//     const userId = req.user?._id || req.user?.id;
    
//     const validStatuses = ["draft", "confirmed", "in-progress", "ready-to-delivery", "delivered", "cancelled"];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
//       });
//     }
    
//     const order = await Order.findById(id)
//       .populate('customer', 'name phone')
//       .populate('garments');
      
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }
    
//     const validTransitions = {
//       'draft': ['confirmed', 'cancelled'],
//       'confirmed': ['in-progress', 'cancelled'],
//       'in-progress': ['ready-to-delivery', 'cancelled'],
//       'ready-to-delivery': ['delivered', 'cancelled'],
//       'delivered': [],
//       'cancelled': []
//     };
    
//     if (!validTransitions[order.status]?.includes(status)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: `Cannot transition from ${order.status} to ${status}` 
//       });
//     }
    
//     const oldStatus = order.status;
//     order.status = status;
//     await order.save();
    
//     console.log(`✅ Status updated: ${oldStatus} → ${status}`);

//     // Notifications based on status
//     if (status === 'ready-to-delivery') {
//       const storeKeepers = await StoreKeeper.find({ isActive: true }).lean();
//       storeKeepers.forEach(keeper => {
//         createNotification({
//           type: 'delivery-ready',
//           recipient: keeper._id,
//           title: '📦 Order Ready for Delivery',
//           message: `Order #${order.orderId} for ${order.customer?.name || 'Customer'} is ready for delivery`,
//           reference: { orderId: order._id, orderNumber: order.orderId },
//           priority: 'high'
//         }).catch(() => {});
//       });
//     }
//     else if (status === 'delivered') {
//       await updateOrderPaymentSummary(order._id);
      
//       const storeKeepers = await StoreKeeper.find({ isActive: true }).lean();
//       storeKeepers.forEach(keeper => {
//         createNotification({
//           type: 'order-delivered',
//           recipient: keeper._id,
//           title: '✅ Order Delivered',
//           message: `Order #${order.orderId} has been delivered`,
//           reference: { orderId: order._id },
//           priority: 'medium'
//         }).catch(() => {});
//       });
//     }
//     else if (status === 'cancelled') {
//       await Work.updateMany(
//         { order: order._id, status: { $ne: 'completed' } },
//         { status: 'cancelled', isActive: false }
//       );
//     }

//     // Update related works
//     try {
//       if (status === 'in-progress') {
//         await Work.updateMany(
//           { order: order._id, status: 'pending' },
//           { status: 'in-progress' }
//         );
//       }
//       else if (status === 'delivered') {
//         await Work.updateMany(
//           { order: order._id, status: { $ne: 'completed' } },
//           { status: 'completed' }
//         );
//       }
//     } catch (workErr) {
//       console.log("Work update error:", workErr.message);
//     }
    
//     const updatedOrder = await Order.findById(id)
//       .populate('customer', 'name phone customerId')
//       .populate('garments');
    
//     res.json({ 
//       success: true, 
//       message: `Order status updated from ${oldStatus} to ${status}`,
//       order: updatedOrder 
//     });
    
//   } catch (error) {
//     console.error("❌ Update status error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 7. DELETE ORDER (SOFT DELETE)
// // ============================================
// export const deleteOrder = async (req, res) => {
//   console.log(`\n🗑️ ===== DELETE ORDER: ${req.params.id} =====`);
  
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     await Garment.updateMany({ _id: { $in: order.garments } }, { isActive: false });
//     await Work.updateMany({ order: order._id }, { isActive: false });
//     await Payment.updateMany({ order: order._id }, { isDeleted: true });
//     await Transaction.updateMany({ order: order._id }, { status: 'cancelled' });

//     order.isActive = false;
//     await order.save();

//     res.json({ success: true, message: "Order deleted successfully" });
//   } catch (error) {
//     console.error("❌ Delete error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 8. ADD PAYMENT TO ORDER (WITH AUTO-INCOME)
// // ============================================
// export const addPaymentToOrder = async (req, res) => {
//   console.log(`\n💰 ===== ADD PAYMENT TO ORDER: ${req.params.id} =====`);
  
//   try {
//     const { id } = req.params;
//     const paymentData = req.body;
    
//     const order = await Order.findById(id).populate('customer');
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }
    
//     const creatorId = req.user?._id || req.user?.id;
    
//     // Format time as HH:MM:SS
//     const now = new Date();
//     const hours = String(now.getHours()).padStart(2, '0');
//     const minutes = String(now.getMinutes()).padStart(2, '0');
//     const seconds = String(now.getSeconds()).padStart(2, '0');
//     const paymentTime = `${hours}:${minutes}:${seconds}`;
    
//     const payment = await Payment.create({
//       order: order._id,
//       customer: order.customer,
//       amount: paymentData.amount,
//       type: paymentData.type || 'advance',
//       method: paymentData.method || 'cash',
//       referenceNumber: paymentData.referenceNumber || '',
//       paymentDate: paymentData.paymentDate || new Date(),
//       paymentTime: paymentTime,
//       notes: paymentData.notes || '',
//       receivedBy: creatorId
//     });
    
//     await createIncomeFromPayment(payment, order, creatorId);
//     await updateOrderPaymentSummary(order._id);
    
//     res.status(201).json({ success: true, message: "Payment added and income created", payment });
//   } catch (error) {
//     console.error("❌ Add payment error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 9. GET ORDER PAYMENTS
// // ============================================
// export const getOrderPayments = async (req, res) => {
//   console.log(`\n💰 ===== GET ORDER PAYMENTS: ${req.params.id} =====`);
  
//   try {
//     const payments = await Payment.find({ 
//       order: req.params.id,
//       isDeleted: false 
//     })
//     .populate('receivedBy', 'name')
//     .sort('-paymentDate -paymentTime');
    
//     res.json({ success: true, payments });
//   } catch (error) {
//     console.error("❌ Get payments error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 10. GET DASHBOARD DATA
// // ============================================
// export const getDashboardData = async (req, res) => {
//   console.log("\n📊 ===== GET DASHBOARD DATA =====");
  
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const todayOrders = await Order.find({
//       createdAt: { $gte: today },
//       isActive: true
//     }).populate('customer', 'name');

//     const pendingDeliveries = await Order.find({
//       deliveryDate: { $lt: new Date() },
//       status: { $nin: ['delivered', 'cancelled'] },
//       isActive: true
//     }).populate('customer', 'name phone');

//     const readyForDelivery = await Order.find({
//       status: 'ready-to-delivery',
//       isActive: true
//     }).populate('customer', 'name phone');

//     const recentOrders = await Order.find({ isActive: true })
//       .populate('customer', 'name')
//       .sort({ createdAt: -1 })
//       .limit(10);

//     const todayPayments = await Payment.find({
//       paymentDate: { $gte: today },
//       isDeleted: false
//     });

//     const todayCollection = todayPayments.reduce((sum, p) => sum + p.amount, 0);

//     const todayIncome = await Transaction.find({
//       transactionDate: { $gte: today },
//       type: 'income',
//       status: 'completed'
//     });

//     const totalIncomeToday = todayIncome.reduce((sum, t) => sum + t.amount, 0);

//     res.json({
//       success: true,
//       dashboard: {
//         todayOrders: { count: todayOrders.length, orders: todayOrders },
//         pendingDeliveries: { count: pendingDeliveries.length, orders: pendingDeliveries },
//         readyForDelivery: { count: readyForDelivery.length, orders: readyForDelivery },
//         recentOrders,
//         todayCollection,
//         totalIncomeToday,
//         incomeBreakdown: {
//           handCash: todayIncome.filter(t => t.accountType === 'hand-cash').reduce((sum, t) => sum + t.amount, 0),
//           bank: todayIncome.filter(t => t.accountType === 'bank').reduce((sum, t) => sum + t.amount, 0)
//         }
//       }
//     });
//   } catch (error) {
//     console.error("❌ Dashboard error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 11. GET ORDERS BY CUSTOMER
// // ============================================
// export const getOrdersByCustomer = async (req, res) => {
//   try {
//     const { customerId } = req.params;
    
//     console.log(`🔍 Fetching orders for customer: ${customerId}`);
    
//     const orders = await Order.find({ 
//       customer: customerId,
//       isActive: true 
//     })
//     .populate('customer', 'name phone email customerId')
//     .populate('garments')
//     .sort('-createdAt');
    
//     console.log(`✅ Found ${orders.length} orders for customer ${customerId}`);
    
//     res.status(200).json({
//       success: true,
//       count: orders.length,
//       orders: orders
//     });
    
//   } catch (error) {
//     console.error(`❌ Error fetching orders for customer ${req.params.customerId}:`, error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // ============================================
// // ✅ 12. GET READY TO DELIVERY ORDERS
// // ============================================
// export const getReadyToDeliveryOrders = async (req, res) => {
//   console.log("\n📦 ===== GET READY TO DELIVERY ORDERS =====");
  
//   try {
//     const orders = await Order.find({ 
//       status: 'ready-to-delivery',
//       isActive: true 
//     })
//     .populate('customer', 'name phone')
//     .populate('garments')
//     .sort({ updatedAt: -1 });
    
//     res.json({
//       success: true,
//       count: orders.length,
//       orders
//     });
//   } catch (error) {
//     console.error("❌ Get ready to delivery error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 13. GET INCOME BY ORDER ID
// // ============================================
// export const getIncomeByOrder = async (req, res) => {
//   console.log(`\n💰 ===== GET INCOME FOR ORDER: ${req.params.id} =====`);
  
//   try {
//     const incomes = await Transaction.find({
//       order: req.params.id,
//       type: 'income',
//       status: 'completed'
//     })
//     .populate('customer', 'name phone')
//     .sort('-transactionDate');
    
//     const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    
//     res.json({
//       success: true,
//       count: incomes.length,
//       totalIncome,
//       incomes
//     });
//   } catch (error) {
//     console.error("❌ Get income error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 14. GET ORDER STATS FOR DASHBOARD
// // ============================================
// export const getOrderStatsForDashboard = async (req, res) => {
//   try {
//     const { startDate, endDate, period } = req.query;
    
//     console.log('\n🔴🔴🔴 ===== GET ORDER STATS FOR DASHBOARD ===== 🔴🔴🔴');
//     console.log('📥 Received query params:', { startDate, endDate, period });
    
//     // Build date filter
//     let dateFilter = { isActive: true };
    
//     if (period === 'today') {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
      
//       dateFilter.orderDate = {
//         $gte: today,
//         $lt: tomorrow
//       };
//     } 
//     else if (period === 'week') {
//       const today = new Date();
//       const startOfWeek = new Date(today);
//       startOfWeek.setDate(today.getDate() - today.getDay());
//       startOfWeek.setHours(0, 0, 0, 0);
      
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(startOfWeek.getDate() + 7);
      
//       dateFilter.orderDate = {
//         $gte: startOfWeek,
//         $lt: endOfWeek
//       };
//     }
//     else if (period === 'month') {
//       const now = new Date();
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//       endOfMonth.setHours(23, 59, 59, 999);
      
//       dateFilter.orderDate = {
//         $gte: startOfMonth,
//         $lte: endOfMonth
//       };
//     }
//     else if (startDate && endDate) {
//       dateFilter.orderDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate + 'T23:59:59.999Z')
//       };
//     }

//     const totalOrdersInRange = await Order.countDocuments(dateFilter);

//     const pendingOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'confirmed'
//     });
    
//     const cuttingOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'in-progress'
//     });
    
//     const readyOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'ready-to-delivery'
//     });
    
//     const deliveredOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'delivered'
//     });

//     const cancelledOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'cancelled'
//     });

//     const draftOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'draft'
//     });

//     const stats = {
//       total: totalOrdersInRange,
//       pending: pendingOrders,
//       cutting: cuttingOrders,
//       stitching: cuttingOrders,
//       ready: readyOrders,
//       delivered: deliveredOrders,
//       cancelled: cancelledOrders,
//       draft: draftOrders,
//       confirmed: pendingOrders,
//       'in-progress': cuttingOrders,
//       'ready-to-delivery': readyOrders
//     };

//     console.log('📊 FINAL STATS:', stats);

//     res.status(200).json({
//       success: true,
//       data: stats
//     });

//   } catch (error) {
//     console.error('❌ ERROR in getOrderStatsForDashboard:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ 15. GET RECENT ORDERS (WITH DATE FILTERS)
// // ============================================
// export const getRecentOrders = async (req, res) => {
//   try {
//     const { limit = 10, startDate, endDate, period } = req.query;
    
//     console.log('📋 Getting recent orders with filter:', { startDate, endDate, period, limit });

//     let dateFilter = { isActive: true };
    
//     if (startDate && endDate) {
//       dateFilter.orderDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate + 'T23:59:59.999Z')
//       };
//     } else {
//       const thirtyDaysAgo = new Date();
//       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//       dateFilter.orderDate = { $gte: thirtyDaysAgo };
//     }

//     const orders = await Order.find(dateFilter)
//       .populate('customer', 'name phone')
//       .populate('garments', 'name type quantity')
//       .sort({ orderDate: -1 })
//       .limit(parseInt(limit));

//     const formattedOrders = orders.map(order => ({
//       _id: order._id,
//       orderId: order.orderId,
//       orderDate: order.orderDate,
//       customer: order.customer ? {
//         _id: order.customer._id,
//         name: order.customer.name,
//         phone: order.customer.phone
//       } : null,
//       garments: order.garments?.map(g => ({
//         name: g.name,
//         type: g.type,
//         quantity: g.quantity
//       })) || [],
//       deliveryDate: order.deliveryDate,
//       status: order.status,
//       totalAmount: order.priceSummary?.totalMax || 0,
//       paidAmount: order.paymentSummary?.totalPaid || 0,
//       balanceAmount: order.balanceAmount || 0,
//       paymentStatus: order.paymentSummary?.paymentStatus || 'pending'
//     }));

//     console.log(`✅ Found ${formattedOrders.length} recent orders`);

//     res.json({
//       success: true,
//       orders: formattedOrders,
//       count: formattedOrders.length,
//       filter: { startDate, endDate, period }
//     });

//   } catch (error) {
//     console.error("❌ Recent orders error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 16. GET FILTERED ORDERS
// // ============================================
// export const getFilteredOrders = async (req, res) => {
//   try {
//     const { 
//       startDate, 
//       endDate, 
//       period,
//       status,
//       page = 1,
//       limit = 20
//     } = req.query;

//     console.log('🔍 Getting filtered orders:', { startDate, endDate, period, status });

//     let filter = { isActive: true };
    
//     if (startDate && endDate) {
//       filter.orderDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate + 'T23:59:59.999Z')
//       };
//     }
    
//     if (status && status !== 'all') {
//       filter.status = status;
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);
    
//     const orders = await Order.find(filter)
//       .populate('customer', 'name phone')
//       .populate('garments', 'name type quantity price')
//       .sort({ orderDate: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const totalCount = await Order.countDocuments(filter);

//     const summary = await Order.aggregate([
//       { $match: filter },
//       {
//         $group: {
//           _id: null,
//           totalOrders: { $sum: 1 },
//           totalRevenue: { $sum: '$priceSummary.totalMax' },
//           totalPaid: { $sum: '$paymentSummary.totalPaid' },
//           pendingAmount: { $sum: '$balanceAmount' },
//           avgOrderValue: { $avg: '$priceSummary.totalMax' }
//         }
//       }
//     ]);

//     const formattedOrders = orders.map(order => ({
//       _id: order._id,
//       orderId: order.orderId,
//       orderDate: order.orderDate,
//       customer: order.customer,
//       garments: order.garments,
//       garmentCount: order.garments?.length || 0,
//       deliveryDate: order.deliveryDate,
//       status: order.status,
//       totalAmount: order.priceSummary?.totalMax || 0,
//       paidAmount: order.paymentSummary?.totalPaid || 0,
//       balanceAmount: order.balanceAmount || 0,
//       paymentStatus: order.paymentSummary?.paymentStatus || 'pending'
//     }));

//     res.json({
//       success: true,
//       orders: formattedOrders,
//       summary: summary[0] || {
//         totalOrders: 0,
//         totalRevenue: 0,
//         totalPaid: 0,
//         pendingAmount: 0,
//         avgOrderValue: 0
//       },
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(totalCount / parseInt(limit)),
//         totalCount,
//         limit: parseInt(limit)
//       },
//       filter: { startDate, endDate, period, status }
//     });

//   } catch (error) {
//     console.error("❌ Filtered orders error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ SIMPLE: Get dates that have orders (just for green dots)
// // ============================================
// export const getOrderDates = async (req, res) => {
//   console.log("\n🟢 ===== GET ORDER DATES =====");
  
//   try {
//     const { month, year } = req.query;
    
//     if (!month || !year) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Month and year are required" 
//       });
//     }

//     const monthNum = parseInt(month);
//     const yearNum = parseInt(year);

//     // Calculate date range
//     const startDate = new Date(yearNum, monthNum, 1);
//     const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59);

//     // Just get unique dates that have orders
//     const orderDates = await Order.aggregate([
//       {
//         $match: {
//           deliveryDate: { 
//             $gte: startDate, 
//             $lte: endDate 
//           },
//           status: { $ne: 'cancelled' },
//           isActive: true
//         }
//       },
//       {
//         $group: {
//           _id: {
//             $dateToString: { format: "%Y-%m-%d", date: "$deliveryDate" }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id"
//         }
//       },
//       { $sort: { date: 1 } }
//     ]);

//     // Return just array of dates
//     const dates = orderDates.map(item => item.date);

//     console.log(`✅ Found ${dates.length} dates with orders`);
    
//     res.json({
//       success: true,
//       dates: dates,
//       month: monthNum,
//       year: yearNum
//     });

//   } catch (error) {
//     console.error("❌ Error in getOrderDates:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };





















// // controllers/order.controller.js
// import Order from "../models/Order.js";
// import Garment from "../models/Garment.js";
// import Work from "../models/Work.js";
// import Customer from "../models/Customer.js";
// import Payment from "../models/Payment.js";
// import Transaction from "../models/Transaction.js";
// import CuttingMaster from "../models/CuttingMaster.js";
// import Tailor from "../models/Tailor.js";
// import StoreKeeper from "../models/StoreKeeper.js";
// import { createNotification } from "./notification.controller.js";
// import r2Service from "../services/r2.service.js";
// import crypto from "crypto";
// import multer from "multer";

// // Configure multer for memory storage
// export const upload = multer({ 
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });

// // ============================================
// // ✅ HELPER: EXTRACT FILES FROM REQUEST
// // ============================================
// const extractGarmentFiles = (req) => {
//   console.log("\n📎 EXTRACTING FILES FROM REQUEST");
  
//   const fileGroups = {};
  
//   if (!req.files || req.files.length === 0) {
//     console.log("⚠️ No files found in request");
//     return fileGroups;
//   }

//   // 🔥 FIX: Group files by garment index from fieldname
//   req.files.forEach(file => {
//     // Expected fieldname format: garments[0].referenceImages
//     const match = file.fieldname.match(/garments\[(\d+)\]\.(\w+)/);
//     if (match) {
//       const index = parseInt(match[1]);
//       const type = match[2]; // referenceImages, customerImages, customerClothImages
      
//       if (!fileGroups[index]) {
//         fileGroups[index] = {
//           referenceImages: [],
//           customerImages: [],
//           customerClothImages: []
//         };
//       }
      
//       fileGroups[index][type].push(file);
//       console.log(`📸 File for garment ${index}: ${type} - ${file.originalname}`);
//     } else {
//       // 🔥 FIX: Handle simple fieldnames (fallback)
//       console.log(`⚠️ Unmatched fieldname format: ${file.fieldname}`);
//     }
//   });
  
//   console.log(`✅ Grouped files for ${Object.keys(fileGroups).length} garments`);
//   return fileGroups;
// };

// // ============================================
// // ✅ HELPER: CREATE INCOME FROM PAYMENT
// // ============================================
// const createIncomeFromPayment = async (payment, order, creatorId) => {
//   try {
//     console.log(`💰 Creating income from payment: ₹${payment.amount}`);
    
//     const accountType = payment.method === 'cash' ? 'hand-cash' : 'bank';
    
//     let category = 'customer-advance';
//     if (payment.type === 'full') {
//       category = 'full-payment';
//     } else if (payment.type === 'advance' && order.paymentSummary?.paymentStatus === 'paid') {
//       category = 'full-payment';
//     } else if (payment.type === 'extra') {
//       category = 'fabric-sale';
//     }
    
//     const customer = await Customer.findById(order.customer);
    
//     const incomeTransaction = await Transaction.create({
//       type: 'income',
//       category: category,
//       amount: payment.amount,
//       paymentMethod: payment.method,
//       accountType: accountType,
//       customer: order.customer,
//       customerDetails: customer ? {
//         name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
//         phone: customer.phone,
//         id: customer.customerId || customer._id
//       } : null,
//       order: order._id,
//       description: `Payment for Order #${order.orderId} - ${payment.notes || payment.type || 'advance'}`,
//       transactionDate: payment.paymentDate || new Date(),
//       referenceNumber: payment.referenceNumber || '',
//       createdBy: creatorId,
//       status: 'completed'
//     });
    
//     console.log(`✅ Income created: ₹${payment.amount} (${category}) - ${accountType}`);
//     return incomeTransaction;
//   } catch (error) {
//     console.error("❌ Error creating income:", error);
//     return null;
//   }
// };

// // ============================================
// // ✅ HELPER: UPDATE ORDER PAYMENT SUMMARY
// // ============================================
// const updateOrderPaymentSummary = async (orderId) => {
//   console.log(`\n💰 Updating payment summary for order: ${orderId}`);
  
//   try {
//     const order = await Order.findById(orderId);
//     if (!order) return;

//     const payments = await Payment.find({ 
//       order: orderId, 
//       isDeleted: false,
//       type: { $in: ['advance', 'full', 'partial', 'extra'] }
//     });

//     const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
//     const lastPayment = payments.sort((a, b) => 
//       new Date(b.paymentDate) - new Date(a.paymentDate)
//     )[0];

//     let paymentStatus = 'pending';
//     const totalAmount = order.priceSummary?.totalMax || 0;
    
//     if (totalPaid >= totalAmount) {
//       paymentStatus = totalPaid > totalAmount ? 'overpaid' : 'paid';
//     } else if (totalPaid > 0) {
//       paymentStatus = 'partial';
//     }

//     order.paymentSummary = {
//       totalPaid,
//       lastPaymentDate: lastPayment?.paymentDate,
//       lastPaymentAmount: lastPayment?.amount,
//       paymentCount: payments.length,
//       paymentStatus
//     };
    
//     order.balanceAmount = totalAmount - totalPaid;
    
//     await order.save();
//     console.log(`✅ Payment summary updated: Paid: ₹${totalPaid}, Status: ${paymentStatus}`);
    
//     return { success: true, totalPaid, paymentStatus };
//   } catch (error) {
//     console.error("❌ Error updating payment summary:", error);
//     return { success: false, error: error.message };
//   }
// };

// // ============================================
// // ✅ HELPER: CREATE WORKS FROM EXISTING GARMENTS (FIXED WITH NOTIFICATION DEBUG)
// // ============================================
// const createWorksFromGarments = async (orderId, garmentIds, creatorId) => {
//   console.log("\n🚀 ===== CREATE WORKS FROM GARMENTS =====");
//   console.log(`📦 Order ID: ${orderId}`);
//   console.log(`👕 Garment IDs:`, garmentIds);
//   console.log(`👤 Creator ID: ${creatorId}`);
  
//   try {
//     if (!garmentIds || garmentIds.length === 0) {
//       console.log("⚠️ No garment IDs provided, skipping work creation");
//       return { success: true, works: [] };
//     }
    
//     // Check if works already exist for these garments
//     console.log("🔍 Checking for existing works...");
//     const existingWorks = await Work.find({ 
//       garment: { $in: garmentIds },
//       isActive: true 
//     });
    
//     if (existingWorks.length > 0) {
//       console.log(`⚠️ Works already exist for ${existingWorks.length} garments, skipping creation`);
//       return { success: true, works: existingWorks };
//     }
    
//     // Get the garment documents to access their data
//     console.log("📦 Fetching garment documents...");
//     const garmentDocs = await Garment.find({ _id: { $in: garmentIds } }).lean();
//     console.log(`📦 Found ${garmentDocs.length} garments in database`);
    
//     const createdWorks = [];

//     // 🔥 FIX: Sequential work creation to prevent duplicates
//     for (const garment of garmentDocs) {
//       const workId = `WRK-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
//       // Add small delay to ensure unique timestamps
//       await new Promise(resolve => setTimeout(resolve, 10));
      
//       console.log(`📝 Creating work for garment: ${garment.name || garment._id}`);
//       const work = await Work.create({
//         workId,
//         order: orderId,
//         garment: garment._id,
//         createdBy: creatorId,
//         status: "pending",
//         cuttingMaster: null,
//         estimatedDelivery: garment.estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000)
//       });
      
//       createdWorks.push(work);
      
//       // Update garment with work ID
//       await Garment.findByIdAndUpdate(garment._id, { workId: work._id });
//       console.log(`✅ Created work: ${work._id} (${work.workId})`);
//     }
    
//     console.log(`✅ Created ${createdWorks.length} works sequentially`);
    
//     // 🔥🔥🔥 FIX: Send notifications to ALL cutting masters with debug
//     if (createdWorks.length > 0) {
//       console.log("\n🔔 ATTEMPTING TO SEND NOTIFICATIONS TO CUTTING MASTERS...");
      
//       console.log("✂️ Querying for active cutting masters...");
//       const cuttingMasters = await CuttingMaster.find({ isActive: true }).lean();
//       console.log(`✂️ Found ${cuttingMasters.length} active cutting masters`);
      
//       if (cuttingMasters.length > 0) {
//         console.log("📋 Cutting masters list:");
//         cuttingMasters.forEach((master, idx) => {
//           console.log(`  ${idx + 1}. ID: ${master._id}, Name: ${master.name || 'No name'}, Active: ${master.isActive}`);
//         });
        
//         console.log("\n📨 Sending notifications to each cutting master...");
        
//         for (const master of cuttingMasters) {
//           try {
//             console.log(`\n📨 Sending to master: ${master.name || master._id} (ID: ${master._id})`);
            
//             const notificationData = {
//               type: 'work-available',
//               recipient: master._id,
//               title: '🔔 New Work Available',
//               message: `${createdWorks.length} new work(s) are waiting for your acceptance`,
//               reference: {
//                 orderId: orderId,
//                 workCount: createdWorks.length,
//                 workIds: createdWorks.map(w => w._id)
//               },
//               priority: 'high',
//               recipientModel: 'CuttingMaster'
//             };
            
//             console.log("📦 Notification data:", JSON.stringify(notificationData, null, 2));
            
//             const notification = await createNotification(notificationData);
            
//             if (notification) {
//               console.log(`✅ Notification sent successfully! ID: ${notification._id}`);
//             } else {
//               console.log(`⚠️ Notification returned null/undefined`);
//             }
//           } catch (notifyError) {
//             console.error(`❌ Failed to send notification to ${master._id}:`, notifyError.message);
//             console.error("Full error:", notifyError);
//           }
//         }
//       } else {
//         console.log("⚠️ NO ACTIVE CUTTING MASTERS FOUND!");
        
//         // Check if there are ANY cutting masters
//         console.log("🔍 Checking for ANY cutting masters (including inactive)...");
//         const allMasters = await CuttingMaster.find({}).lean();
//         console.log(`📊 Total cutting masters in DB: ${allMasters.length}`);
        
//         if (allMasters.length > 0) {
//           allMasters.forEach((m, i) => {
//             console.log(`  Master ${i+1}: ${m.name || 'No name'} - Active: ${m.isActive}, ID: ${m._id}`);
//           });
//         } else {
//           console.log("❌ NO CUTTING MASTERS FOUND AT ALL in database!");
//         }
//       }
//     }
    
//     return { success: true, works: createdWorks };
//   } catch (error) {
//     console.error("\n❌ ERROR CREATING WORKS:", error);
//     console.error("Error stack:", error.stack);
//     return { success: false, error: error.message };
//   }
// };

// // ============================================
// // ✅ 1. GET ORDER STATS
// // ============================================
// export const getOrderStats = async (req, res) => {
//   console.log("\n📊 ===== GET ORDER STATS =====");
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const startOfWeek = new Date(today);
//     startOfWeek.setDate(today.getDate() - today.getDay());

//     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

//     const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
//       Order.countDocuments({ createdAt: { $gte: today }, isActive: true }),
//       Order.countDocuments({ createdAt: { $gte: startOfWeek }, isActive: true }),
//       Order.countDocuments({ createdAt: { $gte: startOfMonth }, isActive: true }),
//       Order.countDocuments({ isActive: true })
//     ]);

//     const statusStats = await Order.aggregate([
//       { $match: { isActive: true } },
//       { $group: { _id: "$status", count: { $sum: 1 } } }
//     ]);

//     const paymentStats = await Order.aggregate([
//       { $match: { isActive: true } },
//       { $group: { 
//         _id: "$paymentSummary.paymentStatus",
//         count: { $sum: 1 },
//         totalAmount: { $sum: "$priceSummary.totalMax" },
//         totalPaid: { $sum: "$paymentSummary.totalPaid" }
//       }}
//     ]);

//     res.status(200).json({
//       success: true,
//       stats: {
//         today: todayCount,
//         thisWeek: weekCount,
//         thisMonth: monthCount,
//         total: totalCount,
//         statusBreakdown: statusStats,
//         paymentBreakdown: paymentStats
//       }
//     });
//   } catch (error) {
//     console.error("❌ Stats Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 2. CREATE ORDER (WITH IMAGES & R2 UPLOAD & WHATSAPP)
// // ============================================
// export const createOrder = async (req, res) => {
//   console.log("\n🆕 ===== CREATE ORDER =====");
//   console.log("📦 Request body type:", typeof req.body);
//   console.log("📎 Files received:", req.files ? req.files.length : 0);
  
//   try {
//     // 🔥 FIX 1: Parse FormData
//     let orderData = { ...req.body };
    
//     // Parse garments if it's a string (from FormData)
//     if (typeof orderData.garments === 'string') {
//       try {
//         orderData.garments = JSON.parse(orderData.garments);
//         console.log("✅ Parsed garments from string");
//       } catch (e) {
//         console.log("Garments is already parsed");
//       }
//     }

//     // Parse payments if it's a string
//     if (typeof orderData.payments === 'string') {
//       try {
//         orderData.payments = JSON.parse(orderData.payments);
//       } catch (e) {}
//     }
    
//     // Parse advancePayment if it's a string
//     if (typeof orderData.advancePayment === 'string') {
//       try {
//         orderData.advancePayment = JSON.parse(orderData.advancePayment);
//       } catch (e) {}
//     }

//     const {
//       customer,
//       deliveryDate,
//       garments,
//       specialNotes,
//       advancePayment,
//       priceSummary,
//       status,
//       orderDate,
//       payments = [],
//       requestId
//     } = orderData;

//     const creatorId = req.user?._id || req.user?.id;
//     if (!creatorId) {
//       return res.status(401).json({ success: false, message: "Authentication failed" });
//     }

//     if (!customer || !deliveryDate) {
//       return res.status(400).json({ success: false, message: "Customer and Delivery Date are required" });
//     }

//     // 🔥🔥🔥 CHANGE 1: SUPER STRONG DUPLICATE PREVENTION
//     // Check for duplicate request using requestId
//     if (requestId) {
//       console.log(`🔍 Checking for duplicate request: ${requestId}`);
//       const existingOrder = await Order.findOne({ 'metadata.requestId': requestId });
//       if (existingOrder) {
//         console.log(`⚠️ DUPLICATE DETECTED! Request ${requestId} already processed`);
//         return res.status(200).json({ 
//           success: true, 
//           message: "Order already exists",
//           order: existingOrder,
//           duplicate: true
//         });
//       }
//     }

//     // Also check for recent orders with same customer (within last 3 seconds)
//     const threeSecondsAgo = new Date(Date.now() - 3000);
//     const recentDuplicate = await Order.findOne({
//       customer: customer,
//       'priceSummary.totalMax': priceSummary?.totalMax,
//       createdAt: { $gte: threeSecondsAgo }
//     });

//     if (recentDuplicate) {
//       console.log(`⚠️ RECENT DUPLICATE DETECTED! Similar order created in last 3 seconds`);
//       return res.status(200).json({ 
//         success: true, 
//         message: "Order already exists (recent duplicate)",
//         order: recentDuplicate,
//         duplicate: true
//       });
//     }

//     // Generate UNIQUE orderId
//     const date = new Date();
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
    
//     // Generate random 3-character string (A-Z, 0-9)
//     const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
//     // Get last 4 digits of timestamp
//     const timePart = Date.now().toString().slice(-4);
    
//     const orderId = `${day}${month}${year}-${randomStr}${timePart}`;

//     // Calculate totals
//     let totalMin = priceSummary?.totalMin || 0;
//     let totalMax = priceSummary?.totalMax || 0;
    
//     if (garments && garments.length > 0) {
//       garments.forEach((g) => {
//         if (g.priceRange) {
//           totalMin += Number(g.priceRange.min) || 0;
//           totalMax += Number(g.priceRange.max) || 0;
//         }
//       });
//     }

//     // Combine payments
//     let allPayments = [...payments];
//     if (advancePayment?.amount > 0 && !allPayments.some(p => p.type === 'advance')) {
//       allPayments.push({
//         amount: Number(advancePayment.amount),
//         type: 'advance',
//         method: advancePayment.method || 'cash',
//         paymentDate: advancePayment.date || new Date(),
//         notes: 'Initial advance payment'
//       });
//     }

//     const totalInitialPaid = allPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

//     // Create order
//     const order = await Order.create({
//       orderId,
//       customer,
//       deliveryDate,
//       garments: [],
//       specialNotes,
//       advancePayment: {
//         amount: advancePayment?.amount || 0,
//         method: advancePayment?.method || "cash",
//         date: advancePayment?.date || new Date(),
//       },
//       priceSummary: { totalMin, totalMax },
//       paymentSummary: {
//         totalPaid: totalInitialPaid,
//         lastPaymentDate: allPayments.length > 0 ? new Date() : null,
//         lastPaymentAmount: allPayments.length > 0 ? allPayments[allPayments.length - 1].amount : 0,
//         paymentCount: allPayments.length,
//         paymentStatus: totalInitialPaid >= totalMax ? 'paid' : (totalInitialPaid > 0 ? 'partial' : 'pending')
//       },
//       balanceAmount: totalMax - totalInitialPaid,
//       createdBy: creatorId,
//       status: status || "draft",
//       orderDate: orderDate || new Date(),
//       metadata: {
//         requestId: requestId || null,
//         createdAt: new Date()
//       }
//     });

//     console.log(`✅ Order created with ID: ${order._id}`);

//     // Extract files grouped by garment
//     const fileGroups = extractGarmentFiles(req);

//     // Create payments
//     const createdPayments = [];
//     if (allPayments.length > 0) {
//       const existingPayments = await Payment.find({ order: order._id });
      
//       if (existingPayments.length === 0) {
//         for (const paymentData of allPayments) {
          
//           let safeAmount = 0;
          
//           if (paymentData.amount === undefined || paymentData.amount === null) {
//             safeAmount = 0;
//           } else {
//             const numAmount = Number(paymentData.amount);
//             const floatAmount = parseFloat(paymentData.amount);
            
//             if (!isNaN(numAmount) && numAmount > 0) {
//               safeAmount = numAmount;
//             } else if (!isNaN(floatAmount) && floatAmount > 0) {
//               safeAmount = floatAmount;
//             } else {
//               safeAmount = 0;
//             }
//           }
          
//           const now = new Date();
//           const hours = String(now.getHours()).padStart(2, '0');
//           const minutes = String(now.getMinutes()).padStart(2, '0');
//           const seconds = String(now.getSeconds()).padStart(2, '0');
//           const paymentTime = `${hours}:${minutes}:${seconds}`;
          
//           await new Promise(resolve => setTimeout(resolve, 10));
          
//           const payment = await Payment.create({
//             order: order._id,
//             customer: order.customer,
//             amount: safeAmount,
//             type: paymentData.type || 'advance',
//             method: paymentData.method || 'cash',
//             referenceNumber: paymentData.referenceNumber || '',
//             paymentDate: paymentData.paymentDate || new Date(),
//             paymentTime: paymentTime,
//             notes: paymentData.notes || '',
//             receivedBy: creatorId,
//             metadata: {
//               requestId: requestId
//             }
//           });
          
//           await createIncomeFromPayment(payment, order, creatorId);
//           createdPayments.push(payment);
//         }
//       }
//     }

//     // Create garments
//     const createdGarmentIds = [];
//     if (garments && garments.length > 0) {
//       const existingGarments = await Garment.find({ order: order._id });
      
//       if (existingGarments.length === 0) {
//         for (let i = 0; i < garments.length; i++) {
//           const g = garments[i];
          
//           if (i > 0) {
//             await new Promise(resolve => setTimeout(resolve, 50));
//           }

//           // Upload images
//           const uploadedImages = {
//             referenceImages: [],
//             customerImages: [],
//             customerClothImages: []
//           };

//           if (fileGroups[i]?.referenceImages?.length > 0) {
//             const results = await r2Service.uploadMultiple(
//               fileGroups[i].referenceImages, 
//               `orders/${order._id}/garment_${i}/reference`
//             );
//             uploadedImages.referenceImages = results;
//           }

//           if (fileGroups[i]?.customerImages?.length > 0) {
//             const results = await r2Service.uploadMultiple(
//               fileGroups[i].customerImages, 
//               `orders/${order._id}/garment_${i}/customer`
//             );
//             uploadedImages.customerImages = results;
//           }

//           if (fileGroups[i]?.customerClothImages?.length > 0) {
//             const results = await r2Service.uploadMultiple(
//               fileGroups[i].customerClothImages, 
//               `orders/${order._id}/garment_${i}/cloth`
//             );
//             uploadedImages.customerClothImages = results;
//           }

//           // Prepare garment data
//           const garmentData = {
//             name: g.name,
//             garmentType: g.garmentType || g.item || g.itemName || g.name,
//             category: g.category,
//             item: g.item,
//             categoryName: g.categoryName,
//             itemName: g.itemName,
//             measurements: g.measurements || [],
//             measurementTemplate: g.measurementTemplate && g.measurementTemplate !== '' 
//               ? g.measurementTemplate 
//               : null,
//             measurementSource: g.measurementSource || 'customer',
//             additionalInfo: g.additionalInfo || '',
//             estimatedDelivery: g.estimatedDelivery || deliveryDate,
//             priority: g.priority || 'normal',
//             priceRange: {
//               min: Number(g.priceRange?.min) || 0,
//               max: Number(g.priceRange?.max) || 0
//             },
//             fabricSource: g.fabricSource || 'customer',
//             fabricPrice: g.fabricPrice || '0',
//             referenceImages: uploadedImages.referenceImages,
//             customerImages: uploadedImages.customerImages,
//             customerClothImages: uploadedImages.customerClothImages,
//             order: order._id,
//             createdBy: creatorId,
//             status: 'pending',
//             metadata: {
//               requestId: requestId,
//               sequence: i + 1
//             }
//           };

//           // Remove undefined fields
//           Object.keys(garmentData).forEach(key => 
//             garmentData[key] === undefined && delete garmentData[key]
//           );
          
//           const garment = await Garment.create(garmentData);
//           createdGarmentIds.push(garment._id);
//         }
        
//         // Update the order with garment IDs
//         order.garments = createdGarmentIds;
//         order.status = "confirmed";
//         await order.save();
        
//         // Create works (using FIXED function)
//         if (createdGarmentIds.length > 0) {
//           await createWorksFromGarments(order._id, createdGarmentIds, creatorId);
//         }
//       }
//     }

//     await order.populate('customer', 'name phone customerId');

//     console.log(`\n🎉 Order completed successfully!`);
//     console.log(`📦 Order ID: ${order._id}`);
//     console.log(`📦 Order Number: ${order.orderId}`);
//     console.log(`👕 Garments created: ${createdGarmentIds.length}`);
//     console.log(`💰 Payments created: ${createdPayments.length}`);

//     // 🔥🔥🔥 ADD WHATSAPP INTEGRATION HERE
//     console.log("\n📱 SENDING WHATSAPP ORDER CONFIRMATION...");
//     try {
//       // Dynamic import to avoid circular dependency
//       const { sendOrderConfirmation } = await import('./whatsapp.controller.js');
      
//       // Don't await - non-blocking
//       sendOrderConfirmation(order._id)
//         .then(result => {
//           if (result) {
//             console.log(`✅ WhatsApp order confirmation sent successfully`);
//           }
//         })
//         .catch(err => {
//           console.log('⚠️ WhatsApp confirmation failed (non-critical):', err.message);
//         });
      
//       console.log('📨 Order confirmation WhatsApp queued');
//     } catch (waErr) {
//       console.log('⚠️ Could not send WhatsApp confirmation:', waErr.message);
//       // Don't fail order creation
//     }

//     res.status(201).json({ 
//       success: true, 
//       message: "Order created successfully",
//       order 
//     });
//   } catch (error) {
//     console.error("\n❌ CREATE ORDER ERROR:", error);
    
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ success: false, message: "Validation failed", errors });
//     }
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       const value = error.keyValue[field];
      
//       // Special handling for orderId duplicates
//       if (field === 'orderId') {
//         console.log(`⚠️ Duplicate orderId: ${value}, retrying with new ID...`);
        
//         const date = new Date();
//         const day = String(date.getDate()).padStart(2, '0');
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const year = date.getFullYear();
        
//         const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
//         const timePart = Date.now().toString().slice(-5);
        
//         const newOrderId = `${day}${month}${year}-${randomStr}${timePart}`;
        
//         req.body.orderId = newOrderId;
//         return createOrder(req, res);
//       }
      
//       return res.status(400).json({ 
//         success: false, 
//         message: `Duplicate ${field}: ${value}. Please try again.`
//       });
//     }
    
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 3. GET ALL ORDERS
// // ============================================
// export const getAllOrders = async (req, res) => {
//   console.log("\n📋 ===== GET ALL ORDERS =====");
  
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       status,
//       paymentStatus,
//       timeFilter = "all",
//       startDate,
//       endDate,
//     } = req.query;

//     let query = { isActive: true };

//     if (search) {
//       const customerIds = await Customer.find({
//         $or: [
//           { name: { $regex: search, $options: 'i' } },
//           { phone: { $regex: search, $options: 'i' } }
//         ]
//       }).distinct('_id');
      
//       query.$or = [
//         { orderId: { $regex: search, $options: 'i' } },
//         { customer: { $in: customerIds } }
//       ];
//     }

//     if (status && status !== "all") {
//       query.status = status;
//     }

//     if (paymentStatus && paymentStatus !== "all") {
//       query['paymentSummary.paymentStatus'] = paymentStatus;
//     }

//     const now = new Date();
//     if (timeFilter !== "all") {
//       let filterDate = new Date();
//       if (timeFilter === "week") filterDate.setDate(now.getDate() - 7);
//       else if (timeFilter === "month") filterDate.setMonth(now.getMonth() - 1);
//       else if (timeFilter === "3m") filterDate.setMonth(now.getMonth() - 3);
      
//       query.createdAt = { $gte: filterDate };
//     }

//     if (startDate && endDate) {
//       query.createdAt = { 
//         $gte: new Date(startDate), 
//         $lte: new Date(endDate) 
//       };
//     }

//     const total = await Order.countDocuments(query);

//     const orders = await Order.find(query)
//       .populate('customer', 'name phone customerId')
//       .populate("garments")
//       .populate("createdBy", "name")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     res.json({ 
//       success: true, 
//       orders, 
//       pagination: { 
//         page: parseInt(page), 
//         limit: parseInt(limit), 
//         total, 
//         pages: Math.ceil(total / limit) 
//       } 
//     });
//   } catch (error) {
//     console.error("❌ Get all orders error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 4. GET ORDER BY ID
// // ============================================
// export const getOrderById = async (req, res) => {
//   console.log(`\n🔍 ===== GET ORDER BY ID: ${req.params.id} =====`);
  
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate('customer', 'name phone customerId email address addressLine1 addressLine2 city state pincode')
//       .populate({
//         path: "garments",
//         populate: [
//           { path: "category", select: "name" },
//           { path: "item", select: "name" },
//           { path: "workId" }
//         ]
//       })
//       .populate("createdBy", "name");

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     const payments = await Payment.find({ 
//       order: order._id,
//       isDeleted: false 
//     })
//     .populate('receivedBy', 'name')
//     .sort('-paymentDate -paymentTime');

//     const works = await Work.find({ order: order._id, isActive: true })
//       .populate('garment', 'name item category')
//       .populate('cuttingMaster', 'name');

//     res.json({ 
//       success: true, 
//       order,
//       payments,
//       works
//     });
//   } catch (error) {
//     console.error("❌ Get order error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 5. UPDATE ORDER
// // ============================================
// export const updateOrder = async (req, res) => {
//   console.log(`\n📝 ===== UPDATE ORDER: ${req.params.id} =====`);
  
//   try {
//     const { id } = req.params;
//     const {
//       deliveryDate,
//       specialNotes,
//       advancePayment,
//       priceSummary,
//       status,
//       newGarments
//     } = req.body;

//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     if (deliveryDate) order.deliveryDate = deliveryDate;
//     if (specialNotes !== undefined) order.specialNotes = specialNotes;
    
//     if (advancePayment) {
//       order.advancePayment = {
//         amount: advancePayment.amount !== undefined ? advancePayment.amount : order.advancePayment.amount,
//         method: advancePayment.method || order.advancePayment.method,
//         date: advancePayment.date || order.advancePayment.date || new Date()
//       };
//     }
    
//     if (priceSummary) {
//       order.priceSummary = {
//         totalMin: priceSummary.totalMin !== undefined ? priceSummary.totalMin : order.priceSummary.totalMin,
//         totalMax: priceSummary.totalMax !== undefined ? priceSummary.totalMax : order.priceSummary.totalMax
//       };
//     }
    
//     if (status) order.status = status;

//     if (newGarments && newGarments.length > 0) {
//       order.garments = [...order.garments, ...newGarments];
      
//       const creatorId = req.user?._id || req.user?.id;
//       await createWorksFromGarments(order._id, newGarments, creatorId);
//     }

//     await order.save();
    
//     await updateOrderPaymentSummary(order._id);
    
//     res.json({ success: true, message: "Order updated successfully", order });
//   } catch (error) {
//     console.error("❌ Update error:", error);
    
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ success: false, message: "Validation failed", errors });
//     }
    
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 6. UPDATE ORDER STATUS
// // ============================================
// export const updateOrderStatus = async (req, res) => {
//   console.log(`\n🔄 ===== UPDATE ORDER STATUS: ${req.params.id} =====`);
  
//   try {
//     const { status } = req.body;
//     const { id } = req.params;
//     const userId = req.user?._id || req.user?.id;
    
//     const validStatuses = ["draft", "confirmed", "in-progress", "ready-to-delivery", "delivered", "cancelled"];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
//       });
//     }
    
//     const order = await Order.findById(id)
//       .populate('customer', 'name phone')
//       .populate('garments');
      
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }
    
//     const validTransitions = {
//       'draft': ['confirmed', 'cancelled'],
//       'confirmed': ['in-progress', 'cancelled'],
//       'in-progress': ['ready-to-delivery', 'cancelled'],
//       'ready-to-delivery': ['delivered', 'cancelled'],
//       'delivered': [],
//       'cancelled': []
//     };
    
//     if (!validTransitions[order.status]?.includes(status)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: `Cannot transition from ${order.status} to ${status}` 
//       });
//     }
    
//     const oldStatus = order.status;
//     order.status = status;
//     await order.save();
    
//     console.log(`✅ Status updated: ${oldStatus} → ${status}`);

//     // 🔥 WhatsApp for ready-to-delivery (already handled in work controller)
//     // But we'll also handle if manually updated
//     if (status === 'ready-to-delivery' && oldStatus !== 'ready-to-delivery') {
//       try {
//         const { sendReadyToDeliver } = await import('./whatsapp.controller.js');
//         sendReadyToDeliver(order._id)
//           .catch(err => console.log('⚠️ Ready WhatsApp failed:', err.message));
//       } catch (waErr) {
//         console.log('⚠️ WhatsApp import error:', waErr.message);
//       }
//     }

//     // Notifications based on status
//     if (status === 'ready-to-delivery') {
//       const storeKeepers = await StoreKeeper.find({ isActive: true }).lean();
//       storeKeepers.forEach(keeper => {
//         createNotification({
//           type: 'delivery-ready',
//           recipient: keeper._id,
//           title: '📦 Order Ready for Delivery',
//           message: `Order #${order.orderId} for ${order.customer?.name || 'Customer'} is ready for delivery`,
//           reference: { orderId: order._id, orderNumber: order.orderId },
//           priority: 'high'
//         }).catch(() => {});
//       });
//     }
//     else if (status === 'delivered') {
//       await updateOrderPaymentSummary(order._id);
      
//       const storeKeepers = await StoreKeeper.find({ isActive: true }).lean();
//       storeKeepers.forEach(keeper => {
//         createNotification({
//           type: 'order-delivered',
//           recipient: keeper._id,
//           title: '✅ Order Delivered',
//           message: `Order #${order.orderId} has been delivered`,
//           reference: { orderId: order._id },
//           priority: 'medium'
//         }).catch(() => {});
//       });
//     }
//     else if (status === 'cancelled') {
//       await Work.updateMany(
//         { order: order._id, status: { $ne: 'completed' } },
//         { status: 'cancelled', isActive: false }
//       );
//     }

//     // Update related works
//     try {
//       if (status === 'in-progress') {
//         await Work.updateMany(
//           { order: order._id, status: 'pending' },
//           { status: 'in-progress' }
//         );
//       }
//       else if (status === 'delivered') {
//         await Work.updateMany(
//           { order: order._id, status: { $ne: 'completed' } },
//           { status: 'completed' }
//         );
//       }
//     } catch (workErr) {
//       console.log("Work update error:", workErr.message);
//     }
    
//     const updatedOrder = await Order.findById(id)
//       .populate('customer', 'name phone customerId')
//       .populate('garments');
    
//     res.json({ 
//       success: true, 
//       message: `Order status updated from ${oldStatus} to ${status}`,
//       order: updatedOrder 
//     });
    
//   } catch (error) {
//     console.error("❌ Update status error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 7. DELETE ORDER (SOFT DELETE)
// // ============================================
// export const deleteOrder = async (req, res) => {
//   console.log(`\n🗑️ ===== DELETE ORDER: ${req.params.id} =====`);
  
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     await Garment.updateMany({ _id: { $in: order.garments } }, { isActive: false });
//     await Work.updateMany({ order: order._id }, { isActive: false });
//     await Payment.updateMany({ order: order._id }, { isDeleted: true });
//     await Transaction.updateMany({ order: order._id }, { status: 'cancelled' });

//     order.isActive = false;
//     await order.save();

//     res.json({ success: true, message: "Order deleted successfully" });
//   } catch (error) {
//     console.error("❌ Delete error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 8. ADD PAYMENT TO ORDER (WITH AUTO-INCOME)
// // ============================================
// // export const addPaymentToOrder = async (req, res) => {
// //   console.log(`\n💰 ===== ADD PAYMENT TO ORDER: ${req.params.id} =====`);
  
// //   try {
// //     const { id } = req.params;
// //     const paymentData = req.body;
    
// //     const order = await Order.findById(id).populate('customer');
// //     if (!order) {
// //       return res.status(404).json({ success: false, message: "Order not found" });
// //     }
    
// //     const creatorId = req.user?._id || req.user?.id;
    
// //     // Format time as HH:MM:SS
// //     const now = new Date();
// //     const hours = String(now.getHours()).padStart(2, '0');
// //     const minutes = String(now.getMinutes()).padStart(2, '0');
// //     const seconds = String(now.getSeconds()).padStart(2, '0');
// //     const paymentTime = `${hours}:${minutes}:${seconds}`;
    
// //     const payment = await Payment.create({
// //       order: order._id,
// //       customer: order.customer,
// //       amount: paymentData.amount,
// //       type: paymentData.type || 'advance',
// //       method: paymentData.method || 'cash',
// //       referenceNumber: paymentData.referenceNumber || '',
// //       paymentDate: paymentData.paymentDate || new Date(),
// //       paymentTime: paymentTime,
// //       notes: paymentData.notes || '',
// //       receivedBy: creatorId
// //     });
    
// //     await createIncomeFromPayment(payment, order, creatorId);
// //     await updateOrderPaymentSummary(order._id);

// //     // 🔥 Send WhatsApp for payment received
// //     try {
// //       const { sendPaymentReceived } = await import('./whatsapp.controller.js');
// //       sendPaymentReceived(order._id, payment)
// //         .catch(err => console.log('⚠️ Payment WhatsApp failed:', err.message));
// //     } catch (waErr) {
// //       console.log('⚠️ WhatsApp import error:', waErr.message);
// //     }
    
// //     res.status(201).json({ success: true, message: "Payment added and income created", payment });
// //   } catch (error) {
// //     console.error("❌ Add payment error:", error);
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };


// export const addPaymentToOrder = async (req, res) => {
//   console.log(`\n💰 ===== ADD PAYMENT TO ORDER: ${req.params.id} =====`);
//   console.log("⏰ Timestamp:", new Date().toISOString());
  
//   try {
//     const { id } = req.params;
//     const paymentData = req.body;
    
//     console.log("\n📦 ===== PAYMENT DATA RECEIVED =====");
//     console.log("📦 Payment data received:", JSON.stringify(paymentData, null, 2));
//     console.log("📦 Payment amount:", paymentData.amount);
//     console.log("📦 Payment type:", paymentData.type);
//     console.log("📦 Payment method:", paymentData.method);
    
//     console.log("\n🔍 ===== FETCHING ORDER =====");
//     console.log("🔍 Order ID:", id);
//     const order = await Order.findById(id).populate('customer');
    
//     if (!order) {
//       console.log("❌ Order not found!");
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }
    
//     console.log("\n✅ ===== ORDER FOUND =====");
//     console.log("✅ Order ID:", order._id);
//     console.log("✅ Order Number:", order.orderId);
//     console.log("✅ Order Status:", order.status);
//     console.log("✅ Order Created At:", order.createdAt);
    
//     console.log("\n👤 ===== CUSTOMER DETAILS =====");
//     console.log("👤 Customer ID:", order.customer?._id);
//     console.log("👤 Customer Name:", order.customer?.name);
//     console.log("👤 Customer Phone:", order.customer?.phone);
//     console.log("👤 Customer WhatsApp:", order.customer?.whatsappNumber);
//     console.log("👤 Has Phone:", !!(order.customer?.phone || order.customer?.whatsappNumber));
    
//     const creatorId = req.user?._id || req.user?.id;
//     console.log("\n👤 Creator ID:", creatorId);
    
//     // Format time
//     const now = new Date();
//     const hours = String(now.getHours()).padStart(2, '0');
//     const minutes = String(now.getMinutes()).padStart(2, '0');
//     const seconds = String(now.getSeconds()).padStart(2, '0');
//     const paymentTime = `${hours}:${minutes}:${seconds}`;
    
//     console.log("\n⏰ ===== CREATING PAYMENT =====");
//     console.log("⏰ Current time:", paymentTime);
//     console.log("⏰ Payment date:", paymentData.paymentDate || new Date());
    
//     const payment = await Payment.create({
//       order: order._id,
//       customer: order.customer,
//       amount: paymentData.amount,
//       type: paymentData.type || 'advance',
//       method: paymentData.method || 'cash',
//       referenceNumber: paymentData.referenceNumber || '',
//       paymentDate: paymentData.paymentDate || new Date(),
//       paymentTime: paymentTime,
//       notes: paymentData.notes || '',
//       receivedBy: creatorId
//     });
    
//     console.log("\n✅ ===== PAYMENT CREATED =====");
//     console.log("✅ Payment ID:", payment._id);
//     console.log("✅ Payment Amount:", payment.amount);
//     console.log("✅ Payment Type:", payment.type);
//     console.log("✅ Payment Method:", payment.method);
//     console.log("✅ Payment Date:", payment.paymentDate);
//     console.log("✅ Payment Time:", payment.paymentTime);
    
//     console.log("\n💰 ===== CREATING INCOME FROM PAYMENT =====");
//     try {
//       await createIncomeFromPayment(payment, order, creatorId);
//       console.log("✅ Income created successfully");
//     } catch (incomeErr) {
//       console.log("⚠️ Income creation error:", incomeErr.message);
//       // Continue even if income fails
//     }
    
//     console.log("\n📊 ===== UPDATING PAYMENT SUMMARY =====");
//     try {
//       await updateOrderPaymentSummary(order._id);
//       console.log("✅ Payment summary updated");
//     } catch (summaryErr) {
//       console.log("⚠️ Payment summary error:", summaryErr.message);
//     }
    
//     // 🔥🔥🔥 CHECK PAYMENT COUNT
//     console.log("\n🔢 ===== CHECKING PAYMENT COUNT =====");
//     const paymentCount = await Payment.countDocuments({ 
//       order: order._id,
//       isDeleted: false 
//     });
//     console.log("💰 Total payments for this order:", paymentCount);
//     console.log("💰 Is this the first payment?", paymentCount === 1 ? "YES" : "NO");
    
//     // 🔥🔥🔥 WHATSAPP INTEGRATION
//     console.log("\n📱 ===== WHATSAPP INTEGRATION START =====");
    
//     // Check if customer has phone
//     const customerPhone = order.customer?.phone || order.customer?.whatsappNumber;
//     console.log("📱 Customer phone available:", customerPhone ? "YES" : "NO");
    
//     if (!customerPhone) {
//       console.log("⚠️ Customer has no phone number - skipping WhatsApp");
//     } else {
//       console.log("📱 Customer phone:", customerPhone);
      
//       // Check if this is NOT the first payment
//       if (paymentCount === 1) {
//         console.log("ℹ️ This is the first payment - skipping WhatsApp (already in order confirmation)");
//       } else {
//         console.log("📱 This is subsequent payment #", paymentCount, "- sending WhatsApp");
        
//         try {
//           console.log("📥 Attempting to import whatsapp.controller.js...");
//           const whatsappModule = await import('./whatsapp.controller.js');
//           console.log("✅ WhatsApp module imported successfully");
//           console.log("📋 Available functions:", Object.keys(whatsappModule));
          
//           const { sendPaymentReceived } = whatsappModule;
          
//           if (typeof sendPaymentReceived === 'function') {
//             console.log("✅ sendPaymentReceived function found!");
//             console.log("📨 Preparing to call sendPaymentReceived with:");
//             console.log("   - Order ID:", order._id);
//             console.log("   - Payment ID:", payment._id);
//             console.log("   - Amount:", payment.amount);
//             console.log("   - Type:", payment.type);
            
//             // Call the function (non-blocking)
//             sendPaymentReceived(order._id, payment)
//               .then(result => {
//                 console.log("✅ WhatsApp sendPaymentReceived resolved successfully");
//                 console.log("📱 Result:", result);
//               })
//               .catch(err => {
//                 console.log("⚠️ WhatsApp sendPaymentReceived rejected");
//                 console.log("❌ Error message:", err.message);
//                 console.log("📚 Error stack:", err.stack);
//               });
            
//             console.log('📨 Payment confirmation WhatsApp queued successfully');
//           } else {
//             console.log("❌ sendPaymentReceived is NOT a function!");
//             console.log("📋 Type:", typeof sendPaymentReceived);
//           }
//         } catch (waErr) {
//           console.log('❌ WhatsApp import error');
//           console.log("❌ Error message:", waErr.message);
//           console.log("📚 Error stack:", waErr.stack);
          
//           // Check if file exists
//           console.log("🔍 Checking if whatsapp.controller.js exists...");
//           try {
//             const fs = require('fs');
//             const fileExists = fs.existsSync('./controllers/whatsapp.controller.js');
//             console.log("📁 File exists:", fileExists ? "YES" : "NO");
//           } catch (fsErr) {
//             console.log("⚠️ Could not check file system");
//           }
//         }
//       }
//     }
    
//     console.log("\n📱 ===== WHATSAPP INTEGRATION END =====");
//     console.log("\n✅✅✅ ===== PAYMENT CREATION COMPLETED SUCCESSFULLY ===== ✅✅✅");
//     console.log("⏰ Completion time:", new Date().toISOString());
    
//     res.status(201).json({ 
//       success: true, 
//       message: "Payment added and income created", 
//       payment,
//       debug: {
//         paymentCount,
//         hasPhone: !!customerPhone,
//         whatsappSent: customerPhone && paymentCount > 1
//       }
//     });
    
//   } catch (error) {
//     console.error("\n❌❌❌ ===== ADD PAYMENT ERROR ===== ❌❌❌");
//     console.error("❌ Error name:", error.name);
//     console.error("❌ Error message:", error.message);
//     console.error("❌ Error stack:", error.stack);
//     if (error.code) console.error("❌ Error code:", error.code);
//     console.error("❌❌❌ ===== ERROR END ===== ❌❌❌\n");
    
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// // ============================================
// // ✅ 9. GET ORDER PAYMENTS
// // ============================================
// export const getOrderPayments = async (req, res) => {
//   console.log(`\n💰 ===== GET ORDER PAYMENTS: ${req.params.id} =====`);
  
//   try {
//     const payments = await Payment.find({ 
//       order: req.params.id,
//       isDeleted: false 
//     })
//     .populate('receivedBy', 'name')
//     .sort('-paymentDate -paymentTime');
    
//     res.json({ success: true, payments });
//   } catch (error) {
//     console.error("❌ Get payments error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 10. GET DASHBOARD DATA
// // ============================================
// export const getDashboardData = async (req, res) => {
//   console.log("\n📊 ===== GET DASHBOARD DATA =====");
  
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const todayOrders = await Order.find({
//       createdAt: { $gte: today },
//       isActive: true
//     }).populate('customer', 'name');

//     const pendingDeliveries = await Order.find({
//       deliveryDate: { $lt: new Date() },
//       status: { $nin: ['delivered', 'cancelled'] },
//       isActive: true
//     }).populate('customer', 'name phone');

//     const readyForDelivery = await Order.find({
//       status: 'ready-to-delivery',
//       isActive: true
//     }).populate('customer', 'name phone');

//     const recentOrders = await Order.find({ isActive: true })
//       .populate('customer', 'name')
//       .sort({ createdAt: -1 })
//       .limit(10);

//     const todayPayments = await Payment.find({
//       paymentDate: { $gte: today },
//       isDeleted: false
//     });

//     const todayCollection = todayPayments.reduce((sum, p) => sum + p.amount, 0);

//     const todayIncome = await Transaction.find({
//       transactionDate: { $gte: today },
//       type: 'income',
//       status: 'completed'
//     });

//     const totalIncomeToday = todayIncome.reduce((sum, t) => sum + t.amount, 0);

//     res.json({
//       success: true,
//       dashboard: {
//         todayOrders: { count: todayOrders.length, orders: todayOrders },
//         pendingDeliveries: { count: pendingDeliveries.length, orders: pendingDeliveries },
//         readyForDelivery: { count: readyForDelivery.length, orders: readyForDelivery },
//         recentOrders,
//         todayCollection,
//         totalIncomeToday,
//         incomeBreakdown: {
//           handCash: todayIncome.filter(t => t.accountType === 'hand-cash').reduce((sum, t) => sum + t.amount, 0),
//           bank: todayIncome.filter(t => t.accountType === 'bank').reduce((sum, t) => sum + t.amount, 0)
//         }
//       }
//     });
//   } catch (error) {
//     console.error("❌ Dashboard error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 11. GET ORDERS BY CUSTOMER
// // ============================================
// export const getOrdersByCustomer = async (req, res) => {
//   try {
//     const { customerId } = req.params;
    
//     console.log(`🔍 Fetching orders for customer: ${customerId}`);
    
//     const orders = await Order.find({ 
//       customer: customerId,
//       isActive: true 
//     })
//     .populate('customer', 'name phone email customerId')
//     .populate('garments')
//     .sort('-createdAt');
    
//     console.log(`✅ Found ${orders.length} orders for customer ${customerId}`);
    
//     res.status(200).json({
//       success: true,
//       count: orders.length,
//       orders: orders
//     });
    
//   } catch (error) {
//     console.error(`❌ Error fetching orders for customer ${req.params.customerId}:`, error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // ============================================
// // ✅ 12. GET READY TO DELIVERY ORDERS
// // ============================================
// export const getReadyToDeliveryOrders = async (req, res) => {
//   console.log("\n📦 ===== GET READY TO DELIVERY ORDERS =====");
  
//   try {
//     const orders = await Order.find({ 
//       status: 'ready-to-delivery',
//       isActive: true 
//     })
//     .populate('customer', 'name phone')
//     .populate('garments')
//     .sort({ updatedAt: -1 });
    
//     res.json({
//       success: true,
//       count: orders.length,
//       orders
//     });
//   } catch (error) {
//     console.error("❌ Get ready to delivery error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 13. GET INCOME BY ORDER ID
// // ============================================
// export const getIncomeByOrder = async (req, res) => {
//   console.log(`\n💰 ===== GET INCOME FOR ORDER: ${req.params.id} =====`);
  
//   try {
//     const incomes = await Transaction.find({
//       order: req.params.id,
//       type: 'income',
//       status: 'completed'
//     })
//     .populate('customer', 'name phone')
//     .sort('-transactionDate');
    
//     const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    
//     res.json({
//       success: true,
//       count: incomes.length,
//       totalIncome,
//       incomes
//     });
//   } catch (error) {
//     console.error("❌ Get income error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 14. GET ORDER STATS FOR DASHBOARD
// // ============================================
// export const getOrderStatsForDashboard = async (req, res) => {
//   try {
//     const { startDate, endDate, period } = req.query;
    
//     console.log('\n🔴🔴🔴 ===== GET ORDER STATS FOR DASHBOARD ===== 🔴🔴🔴');
//     console.log('📥 Received query params:', { startDate, endDate, period });
    
//     // Build date filter
//     let dateFilter = { isActive: true };
    
//     if (period === 'today') {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
      
//       dateFilter.orderDate = {
//         $gte: today,
//         $lt: tomorrow
//       };
//     } 
//     else if (period === 'week') {
//       const today = new Date();
//       const startOfWeek = new Date(today);
//       startOfWeek.setDate(today.getDate() - today.getDay());
//       startOfWeek.setHours(0, 0, 0, 0);
      
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(startOfWeek.getDate() + 7);
      
//       dateFilter.orderDate = {
//         $gte: startOfWeek,
//         $lt: endOfWeek
//       };
//     }
//     else if (period === 'month') {
//       const now = new Date();
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//       endOfMonth.setHours(23, 59, 59, 999);
      
//       dateFilter.orderDate = {
//         $gte: startOfMonth,
//         $lte: endOfMonth
//       };
//     }
//     else if (startDate && endDate) {
//       dateFilter.orderDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate + 'T23:59:59.999Z')
//       };
//     }

//     const totalOrdersInRange = await Order.countDocuments(dateFilter);

//     const pendingOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'confirmed'
//     });
    
//     const cuttingOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'in-progress'
//     });
    
//     const readyOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'ready-to-delivery'
//     });
    
//     const deliveredOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'delivered'
//     });

//     const cancelledOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'cancelled'
//     });

//     const draftOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'draft'
//     });

//     const stats = {
//       total: totalOrdersInRange,
//       pending: pendingOrders,
//       cutting: cuttingOrders,
//       stitching: cuttingOrders,
//       ready: readyOrders,
//       delivered: deliveredOrders,
//       cancelled: cancelledOrders,
//       draft: draftOrders,
//       confirmed: pendingOrders,
//       'in-progress': cuttingOrders,
//       'ready-to-delivery': readyOrders
//     };

//     console.log('📊 FINAL STATS:', stats);

//     res.status(200).json({
//       success: true,
//       data: stats
//     });

//   } catch (error) {
//     console.error('❌ ERROR in getOrderStatsForDashboard:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ 15. GET RECENT ORDERS (WITH DATE FILTERS)
// // ============================================
// export const getRecentOrders = async (req, res) => {
//   try {
//     const { limit = 10, startDate, endDate, period } = req.query;
    
//     console.log('📋 Getting recent orders with filter:', { startDate, endDate, period, limit });

//     let dateFilter = { isActive: true };
    
//     if (startDate && endDate) {
//       dateFilter.orderDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate + 'T23:59:59.999Z')
//       };
//     } else {
//       const thirtyDaysAgo = new Date();
//       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//       dateFilter.orderDate = { $gte: thirtyDaysAgo };
//     }

//     const orders = await Order.find(dateFilter)
//       .populate('customer', 'name phone')
//       .populate('garments', 'name type quantity')
//       .sort({ orderDate: -1 })
//       .limit(parseInt(limit));

//     const formattedOrders = orders.map(order => ({
//       _id: order._id,
//       orderId: order.orderId,
//       orderDate: order.orderDate,
//       customer: order.customer ? {
//         _id: order.customer._id,
//         name: order.customer.name,
//         phone: order.customer.phone
//       } : null,
//       garments: order.garments?.map(g => ({
//         name: g.name,
//         type: g.type,
//         quantity: g.quantity
//       })) || [],
//       deliveryDate: order.deliveryDate,
//       status: order.status,
//       totalAmount: order.priceSummary?.totalMax || 0,
//       paidAmount: order.paymentSummary?.totalPaid || 0,
//       balanceAmount: order.balanceAmount || 0,
//       paymentStatus: order.paymentSummary?.paymentStatus || 'pending'
//     }));

//     console.log(`✅ Found ${formattedOrders.length} recent orders`);

//     res.json({
//       success: true,
//       orders: formattedOrders,
//       count: formattedOrders.length,
//       filter: { startDate, endDate, period }
//     });

//   } catch (error) {
//     console.error("❌ Recent orders error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 16. GET FILTERED ORDERS
// // ============================================
// export const getFilteredOrders = async (req, res) => {
//   try {
//     const { 
//       startDate, 
//       endDate, 
//       period,
//       status,
//       page = 1,
//       limit = 20
//     } = req.query;

//     console.log('🔍 Getting filtered orders:', { startDate, endDate, period, status });

//     let filter = { isActive: true };
    
//     if (startDate && endDate) {
//       filter.orderDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate + 'T23:59:59.999Z')
//       };
//     }
    
//     if (status && status !== 'all') {
//       filter.status = status;
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);
    
//     const orders = await Order.find(filter)
//       .populate('customer', 'name phone')
//       .populate('garments', 'name type quantity price')
//       .sort({ orderDate: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const totalCount = await Order.countDocuments(filter);

//     const summary = await Order.aggregate([
//       { $match: filter },
//       {
//         $group: {
//           _id: null,
//           totalOrders: { $sum: 1 },
//           totalRevenue: { $sum: '$priceSummary.totalMax' },
//           totalPaid: { $sum: '$paymentSummary.totalPaid' },
//           pendingAmount: { $sum: '$balanceAmount' },
//           avgOrderValue: { $avg: '$priceSummary.totalMax' }
//         }
//       }
//     ]);

//     const formattedOrders = orders.map(order => ({
//       _id: order._id,
//       orderId: order.orderId,
//       orderDate: order.orderDate,
//       customer: order.customer,
//       garments: order.garments,
//       garmentCount: order.garments?.length || 0,
//       deliveryDate: order.deliveryDate,
//       status: order.status,
//       totalAmount: order.priceSummary?.totalMax || 0,
//       paidAmount: order.paymentSummary?.totalPaid || 0,
//       balanceAmount: order.balanceAmount || 0,
//       paymentStatus: order.paymentSummary?.paymentStatus || 'pending'
//     }));

//     res.json({
//       success: true,
//       orders: formattedOrders,
//       summary: summary[0] || {
//         totalOrders: 0,
//         totalRevenue: 0,
//         totalPaid: 0,
//         pendingAmount: 0,
//         avgOrderValue: 0
//       },
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(totalCount / parseInt(limit)),
//         totalCount,
//         limit: parseInt(limit)
//       },
//       filter: { startDate, endDate, period, status }
//     });

//   } catch (error) {
//     console.error("❌ Filtered orders error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ SIMPLE: Get dates that have orders (just for green dots)
// // ============================================
// // export const getOrderDates = async (req, res) => {
// //   console.log("\n🟢 ===== GET ORDER DATES =====");
  
// //   try {
// //     const { month, year } = req.query;
    
// //     if (!month || !year) {
// //       return res.status(400).json({ 
// //         success: false, 
// //         message: "Month and year are required" 
// //       });
// //     }

// //     const monthNum = parseInt(month);
// //     const yearNum = parseInt(year);

// //     // Calculate date range
// //     const startDate = new Date(yearNum, monthNum, 1);
// //     const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59);

// //     // Just get unique dates that have orders
// //     const orderDates = await Order.aggregate([
// //       {
// //         $match: {
// //           deliveryDate: { 
// //             $gte: startDate, 
// //             $lte: endDate 
// //           },
// //           status: { $ne: 'cancelled' },
// //           isActive: true
// //         }
// //       },
// //       {
// //         $group: {
// //           _id: {
// //             $dateToString: { format: "%Y-%m-%d", date: "$deliveryDate" }
// //           }
// //         }
// //       },
// //       {
// //         $project: {
// //           _id: 0,
// //           date: "$_id"
// //         }
// //       },
// //       { $sort: { date: 1 } }
// //     ]);

// //     // Return just array of dates
// //     const dates = orderDates.map(item => item.date);

// //     console.log(`✅ Found ${dates.length} dates with orders`);
    
// //     res.json({
// //       success: true,
// //       dates: dates,
// //       month: monthNum,
// //       year: yearNum
// //     });

// //   } catch (error) {
// //     console.error("❌ Error in getOrderDates:", error);
// //     res.status(500).json({ 
// //       success: false, 
// //       message: error.message 
// //     });
// //   }
// // };


// // ============================================
// // ✅ FIXED: Get dates that have orders (for green dots in calendar)
// // ============================================
// export const getOrderDates = async (req, res) => {
//   console.log("\n🟢 ===== GET ORDER DATES =====");
//   console.log("Query params:", req.query);
  
//   try {
//     const { month, year, type = 'order' } = req.query; // 'order' or 'delivery'
    
//     if (!month || !year) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Month and year are required" 
//       });
//     }

//     const monthNum = parseInt(month);
//     const yearNum = parseInt(year);

//     // Calculate date range - FIX: month is 0-index in JavaScript Date
//     const startDate = new Date(yearNum, monthNum - 1, 1);
//     const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

//     console.log(`📅 Date range: ${startDate} to ${endDate}`);
//     console.log(`📅 Type: ${type} (looking at ${type === 'order' ? 'orderDate' : 'deliveryDate'})`);

//     // Choose which date field to use
//     const dateField = type === 'order' ? 'orderDate' : 'deliveryDate';

//     // Get unique dates that have orders
//     const orderDates = await Order.aggregate([
//       {
//         $match: {
//           [dateField]: { 
//             $gte: startDate, 
//             $lte: endDate 
//           },
//           status: { $ne: 'cancelled' },
//           isActive: true
//         }
//       },
//       {
//         $group: {
//           _id: {
//             $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` }
//           },
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id",
//           count: 1
//         }
//       },
//       { $sort: { date: 1 } }
//     ]);

//     // Return just array of dates
//     const dates = orderDates.map(item => item.date);

//     console.log(`✅ Found ${dates.length} dates with ${type} dates`);
//     console.log(`📅 Dates:`, dates);

//     res.json({
//       success: true,
//       dates: dates,
//       details: orderDates, // Optional: include counts for tooltips
//       month: monthNum,
//       year: yearNum,
//       type: type
//     });

//   } catch (error) {
//     console.error("❌ Error in getOrderDates:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };





// // orderController.js

// // ============================================
// // 📅 GET DELIVERY DATES FOR CALENDAR
// // ============================================
// export const getDeliveryDatesForCalendar = async (req, res) => {
//   console.log("\n🟢 ===== GET DELIVERY DATES FOR CALENDAR =====");
  
//   try {
//     const { month, year } = req.query;

//     if (!month || !year) {
//       return res.status(400).json({
//         success: false,
//         message: "Month and year are required"
//       });
//     }

//     const monthNum = parseInt(month) - 1; // JavaScript months 0-11
//     const yearNum = parseInt(year);

//     const startDate = new Date(yearNum, monthNum, 1);
//     const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59);

//     console.log(`📅 Month: ${month}, Year: ${year}`);
//     console.log(`📅 Date range: ${startDate} to ${endDate}`);

//     // 🔥 Use Order model's static method
//     const deliveryData = await Order.getDeliveryCalendar(monthNum, yearNum);

//     console.log(`✅ Found ${Object.keys(deliveryData.data || {}).length} days with deliveries`);

//     res.json({
//       success: true,
//       allDates: deliveryData.data,  // Returns { "2026-03-05": { count: 4, ... } }
//       month: parseInt(month),
//       year: yearNum
//     });

//   } catch (error) {
//     console.error("❌ Error in getDeliveryDatesForCalendar:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // ============================================
// // 📅 SIMPLE VERSION - Just dates with counts
// // ============================================
// export const getSimpleDeliveryDates = async (req, res) => {
//   console.log("\n🟢 ===== GET SIMPLE DELIVERY DATES =====");
  
//   try {
//     const { month, year } = req.query;

//     if (!month || !year) {
//       return res.status(400).json({
//         success: false,
//         message: "Month and year are required"
//       });
//     }

//     const monthNum = parseInt(month) - 1;
//     const yearNum = parseInt(year);

//     // 🔥 Use Order model's static method
//     const counts = await Order.getDeliveryCountsByDay(monthNum, yearNum);

//     // Format for frontend: { _id: "2026-03-05", count: 4 }
//     const formattedDates = counts.map(item => ({
//       _id: `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`,
//       count: item.count
//     }));

//     console.log(`✅ Found ${formattedDates.length} dates with deliveries`);

//     res.json({
//       success: true,
//       allDates: formattedDates
//     });

//   } catch (error) {
//     console.error("❌ Error in getSimpleDeliveryDates:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
















// // controllers/order.controller.js
// import Order from "../models/Order.js";
// import Garment from "../models/Garment.js";
// import Work from "../models/Work.js";
// import Customer from "../models/Customer.js";
// import Payment from "../models/Payment.js";
// import Transaction from "../models/Transaction.js";
// import CuttingMaster from "../models/CuttingMaster.js";
// import Tailor from "../models/Tailor.js";
// import StoreKeeper from "../models/StoreKeeper.js";
// import { createNotification } from "./notification.controller.js";
// import r2Service from "../services/r2.service.js";
// import crypto from "crypto";
// import multer from "multer";

// // Configure multer for memory storage
// export const upload = multer({ 
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });

// // ============================================
// // ✅ HELPER: EXTRACT FILES FROM REQUEST
// // ============================================
// const extractGarmentFiles = (req) => {
//   console.log("\n📎 EXTRACTING FILES FROM REQUEST");
  
//   const fileGroups = {};
  
//   if (!req.files || req.files.length === 0) {
//     console.log("⚠️ No files found in request");
//     return fileGroups;
//   }

//   req.files.forEach(file => {
//     const match = file.fieldname.match(/garments\[(\d+)\]\.(\w+)/);
//     if (match) {
//       const index = parseInt(match[1]);
//       const type = match[2];
      
//       if (!fileGroups[index]) {
//         fileGroups[index] = {
//           referenceImages: [],
//           customerImages: [],
//           customerClothImages: []
//         };
//       }
      
//       fileGroups[index][type].push(file);
//       console.log(`📸 File for garment ${index}: ${type} - ${file.originalname}`);
//     } else {
//       console.log(`⚠️ Unmatched fieldname format: ${file.fieldname}`);
//     }
//   });
  
//   console.log(`✅ Grouped files for ${Object.keys(fileGroups).length} garments`);
//   return fileGroups;
// };

// // ============================================
// // ✅ HELPER: CREATE INCOME FROM PAYMENT
// // ============================================
// const createIncomeFromPayment = async (payment, order, creatorId) => {
//   try {
//     console.log(`💰 Creating income from payment: ₹${payment.amount}`);
    
//     const accountType = payment.method === 'cash' ? 'hand-cash' : 'bank';
    
//     let category = 'customer-advance';
//     if (payment.type === 'full') {
//       category = 'full-payment';
//     } else if (payment.type === 'advance' && order.paymentSummary?.paymentStatus === 'paid') {
//       category = 'full-payment';
//     } else if (payment.type === 'extra') {
//       category = 'fabric-sale';
//     }
    
//     const customer = await Customer.findById(order.customer);
    
//     const incomeTransaction = await Transaction.create({
//       type: 'income',
//       category: category,
//       amount: payment.amount,
//       paymentMethod: payment.method,
//       accountType: accountType,
//       customer: order.customer,
//       customerDetails: customer ? {
//         name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
//         phone: customer.phone,
//         id: customer.customerId || customer._id
//       } : null,
//       order: order._id,
//       description: `Payment for Order #${order.orderId} - ${payment.notes || payment.type || 'advance'}`,
//       transactionDate: payment.paymentDate || new Date(),
//       referenceNumber: payment.referenceNumber || '',
//       createdBy: creatorId,
//       status: 'completed'
//     });
    
//     console.log(`✅ Income created: ₹${payment.amount} (${category}) - ${accountType}`);
//     return incomeTransaction;
//   } catch (error) {
//     console.error("❌ Error creating income:", error);
//     return null;
//   }
// };

// // ============================================
// // ✅ HELPER: UPDATE ORDER PAYMENT SUMMARY
// // ============================================
// const updateOrderPaymentSummary = async (orderId) => {
//   console.log(`\n💰 Updating payment summary for order: ${orderId}`);
  
//   try {
//     const order = await Order.findById(orderId);
//     if (!order) return;

//     const payments = await Payment.find({ 
//       order: orderId, 
//       isDeleted: false,
//       type: { $in: ['advance', 'full', 'partial', 'extra'] }
//     });

//     const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
//     const lastPayment = payments.sort((a, b) => 
//       new Date(b.paymentDate) - new Date(a.paymentDate)
//     )[0];

//     let paymentStatus = 'pending';
//     const totalAmount = order.priceSummary?.totalMax || 0;
    
//     if (totalPaid >= totalAmount) {
//       paymentStatus = totalPaid > totalAmount ? 'overpaid' : 'paid';
//     } else if (totalPaid > 0) {
//       paymentStatus = 'partial';
//     }

//     order.paymentSummary = {
//       totalPaid,
//       lastPaymentDate: lastPayment?.paymentDate,
//       lastPaymentAmount: lastPayment?.amount,
//       paymentCount: payments.length,
//       paymentStatus
//     };
    
//     order.balanceAmount = totalAmount - totalPaid;
    
//     await order.save();
//     console.log(`✅ Payment summary updated: Paid: ₹${totalPaid}, Status: ${paymentStatus}`);
    
//     return { success: true, totalPaid, paymentStatus };
//   } catch (error) {
//     console.error("❌ Error updating payment summary:", error);
//     return { success: false, error: error.message };
//   }
// };

// // ============================================
// // ✅ HELPER: CREATE WORKS FROM EXISTING GARMENTS
// // ============================================
// const createWorksFromGarments = async (orderId, garmentIds, creatorId) => {
//   console.log("\n🚀 ===== CREATE WORKS FROM GARMENTS =====");
//   console.log(`📦 Order ID: ${orderId}`);
//   console.log(`👕 Garment IDs:`, garmentIds);
//   console.log(`👤 Creator ID: ${creatorId}`);
  
//   try {
//     if (!garmentIds || garmentIds.length === 0) {
//       console.log("⚠️ No garment IDs provided, skipping work creation");
//       return { success: true, works: [] };
//     }
    
//     console.log("🔍 Checking for existing works...");
//     const existingWorks = await Work.find({ 
//       garment: { $in: garmentIds },
//       isActive: true 
//     });
    
//     if (existingWorks.length > 0) {
//       console.log(`⚠️ Works already exist for ${existingWorks.length} garments, skipping creation`);
//       return { success: true, works: existingWorks };
//     }
    
//     console.log("📦 Fetching garment documents...");
//     const garmentDocs = await Garment.find({ _id: { $in: garmentIds } }).lean();
//     console.log(`📦 Found ${garmentDocs.length} garments in database`);
    
//     const createdWorks = [];

//     for (const garment of garmentDocs) {
//       const workId = `WRK-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
//       await new Promise(resolve => setTimeout(resolve, 10));
      
//       console.log(`📝 Creating work for garment: ${garment.name || garment._id}`);
//       const work = await Work.create({
//         workId,
//         order: orderId,
//         garment: garment._id,
//         createdBy: creatorId,
//         status: "pending",
//         cuttingMaster: null,
//         estimatedDelivery: garment.estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000)
//       });
      
//       createdWorks.push(work);
//       await Garment.findByIdAndUpdate(garment._id, { workId: work._id });
//       console.log(`✅ Created work: ${work._id} (${work.workId})`);
//     }
    
//     console.log(`✅ Created ${createdWorks.length} works sequentially`);
    
//     if (createdWorks.length > 0) {
//       console.log("\n🔔 ATTEMPTING TO SEND NOTIFICATIONS TO CUTTING MASTERS...");
//       const cuttingMasters = await CuttingMaster.find({ isActive: true }).lean();
//       console.log(`✂️ Found ${cuttingMasters.length} active cutting masters`);
      
//       if (cuttingMasters.length > 0) {
//         for (const master of cuttingMasters) {
//           try {
//             const notificationData = {
//               type: 'work-available',
//               recipient: master._id,
//               title: '🔔 New Work Available',
//               message: `${createdWorks.length} new work(s) are waiting for your acceptance`,
//               reference: {
//                 orderId: orderId,
//                 workCount: createdWorks.length,
//                 workIds: createdWorks.map(w => w._id)
//               },
//               priority: 'high',
//               recipientModel: 'CuttingMaster'
//             };
            
//             await createNotification(notificationData);
//             console.log(`✅ Notification sent to master: ${master.name || master._id}`);
//           } catch (notifyError) {
//             console.error(`❌ Failed to send notification to ${master._id}:`, notifyError.message);
//           }
//         }
//       } else {
//         console.log("⚠️ NO ACTIVE CUTTING MASTERS FOUND!");
//       }
//     }
    
//     return { success: true, works: createdWorks };
//   } catch (error) {
//     console.error("\n❌ ERROR CREATING WORKS:", error);
//     return { success: false, error: error.message };
//   }
// };

// // ============================================
// // ✅ HELPER: GENERATE ORDER ID (YYYYMMDD + AUTO-GROW SEQUENCE)
// // ============================================
// const generateOrderId = async () => {
//   const today = new Date();
//   const yyyy = today.getFullYear();
//   const mm = String(today.getMonth() + 1).padStart(2, "0");
//   const dd = String(today.getDate()).padStart(2, "0");
//   const datePart = `${yyyy}${mm}${dd}`;

//   // Count orders created today
//   const startOfDay = new Date(yyyy, today.getMonth(), today.getDate());
//   const endOfDay = new Date(yyyy, today.getMonth(), today.getDate() + 1);

//   const count = await Order.countDocuments({
//     createdAt: { $gte: startOfDay, $lt: endOfDay },
//     isActive: true
//   });

//   const sequence = count + 1;
  
//   // Dynamic padding - minimum 2 digits, auto grow
//   const seqStr = sequence < 100 ? String(sequence).padStart(2, "0") : String(sequence);
  
//   const orderId = `${datePart}${seqStr}`;
//   console.log(`📋 Generated Order ID: ${orderId} (Sequence: ${sequence})`);
  
//   return orderId;
// };

// // ============================================
// // ✅ 1. GET ORDER STATS
// // ============================================
// export const getOrderStats = async (req, res) => {
//   console.log("\n📊 ===== GET ORDER STATS =====");
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const startOfWeek = new Date(today);
//     startOfWeek.setDate(today.getDate() - today.getDay());

//     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

//     const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
//       Order.countDocuments({ createdAt: { $gte: today }, isActive: true }),
//       Order.countDocuments({ createdAt: { $gte: startOfWeek }, isActive: true }),
//       Order.countDocuments({ createdAt: { $gte: startOfMonth }, isActive: true }),
//       Order.countDocuments({ isActive: true })
//     ]);

//     const statusStats = await Order.aggregate([
//       { $match: { isActive: true } },
//       { $group: { _id: "$status", count: { $sum: 1 } } }
//     ]);

//     const paymentStats = await Order.aggregate([
//       { $match: { isActive: true } },
//       { $group: { 
//         _id: "$paymentSummary.paymentStatus",
//         count: { $sum: 1 },
//         totalAmount: { $sum: "$priceSummary.totalMax" },
//         totalPaid: { $sum: "$paymentSummary.totalPaid" }
//       }}
//     ]);

//     res.status(200).json({
//       success: true,
//       stats: {
//         today: todayCount,
//         thisWeek: weekCount,
//         thisMonth: monthCount,
//         total: totalCount,
//         statusBreakdown: statusStats,
//         paymentBreakdown: paymentStats
//       }
//     });
//   } catch (error) {
//     console.error("❌ Stats Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 2. CREATE ORDER (WITH NEW ORDER ID FORMAT)
// // ============================================
// export const createOrder = async (req, res) => {
//   console.log("\n🆕 ===== CREATE ORDER =====");
//   console.log("📦 Request body type:", typeof req.body);
//   console.log("📎 Files received:", req.files ? req.files.length : 0);
  
//   try {
//     let orderData = { ...req.body };
    
//     if (typeof orderData.garments === 'string') {
//       try {
//         orderData.garments = JSON.parse(orderData.garments);
//         console.log("✅ Parsed garments from string");
//       } catch (e) {}
//     }

//     if (typeof orderData.payments === 'string') {
//       try {
//         orderData.payments = JSON.parse(orderData.payments);
//       } catch (e) {}
//     }
    
//     if (typeof orderData.advancePayment === 'string') {
//       try {
//         orderData.advancePayment = JSON.parse(orderData.advancePayment);
//       } catch (e) {}
//     }

//     const {
//       customer,
//       deliveryDate,
//       garments,
//       specialNotes,
//       advancePayment,
//       priceSummary,
//       status,
//       orderDate,
//       payments = [],
//       requestId
//     } = orderData;

//     const creatorId = req.user?._id || req.user?.id;
//     if (!creatorId) {
//       return res.status(401).json({ success: false, message: "Authentication failed" });
//     }

//     if (!customer || !deliveryDate) {
//       return res.status(400).json({ success: false, message: "Customer and Delivery Date are required" });
//     }

//     // 🔥 DUPLICATE PREVENTION
//     if (requestId) {
//       console.log(`🔍 Checking for duplicate request: ${requestId}`);
//       const existingOrder = await Order.findOne({ 'metadata.requestId': requestId });
//       if (existingOrder) {
//         console.log(`⚠️ DUPLICATE DETECTED! Request ${requestId} already processed`);
//         return res.status(200).json({ 
//           success: true, 
//           message: "Order already exists",
//           order: existingOrder,
//           duplicate: true
//         });
//       }
//     }

//     const threeSecondsAgo = new Date(Date.now() - 3000);
//     const recentDuplicate = await Order.findOne({
//       customer: customer,
//       'priceSummary.totalMax': priceSummary?.totalMax,
//       createdAt: { $gte: threeSecondsAgo }
//     });

//     if (recentDuplicate) {
//       console.log(`⚠️ RECENT DUPLICATE DETECTED!`);
//       return res.status(200).json({ 
//         success: true, 
//         message: "Order already exists (recent duplicate)",
//         order: recentDuplicate,
//         duplicate: true
//       });
//     }

//     // 🔥🔥🔥 NEW ORDER ID GENERATION (YYYYMMDD + AUTO-GROW SEQUENCE) 🔥🔥🔥
//     const orderId = await generateOrderId();

//     // Calculate totals
//     let totalMin = priceSummary?.totalMin || 0;
//     let totalMax = priceSummary?.totalMax || 0;
    
//     if (garments && garments.length > 0) {
//       garments.forEach((g) => {
//         if (g.priceRange) {
//           totalMin += Number(g.priceRange.min) || 0;
//           totalMax += Number(g.priceRange.max) || 0;
//         }
//       });
//     }

//     // Combine payments
//     let allPayments = [...payments];
//     if (advancePayment?.amount > 0 && !allPayments.some(p => p.type === 'advance')) {
//       allPayments.push({
//         amount: Number(advancePayment.amount),
//         type: 'advance',
//         method: advancePayment.method || 'cash',
//         paymentDate: advancePayment.date || new Date(),
//         notes: 'Initial advance payment'
//       });
//     }

//     const totalInitialPaid = allPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

//     // Create order
//     const order = await Order.create({
//       orderId,
//       customer,
//       deliveryDate,
//       garments: [],
//       specialNotes,
//       advancePayment: {
//         amount: advancePayment?.amount || 0,
//         method: advancePayment?.method || "cash",
//         date: advancePayment?.date || new Date(),
//       },
//       priceSummary: { totalMin, totalMax },
//       paymentSummary: {
//         totalPaid: totalInitialPaid,
//         lastPaymentDate: allPayments.length > 0 ? new Date() : null,
//         lastPaymentAmount: allPayments.length > 0 ? allPayments[allPayments.length - 1].amount : 0,
//         paymentCount: allPayments.length,
//         paymentStatus: totalInitialPaid >= totalMax ? 'paid' : (totalInitialPaid > 0 ? 'partial' : 'pending')
//       },
//       balanceAmount: totalMax - totalInitialPaid,
//       createdBy: creatorId,
//       status: status || "draft",
//       orderDate: orderDate || new Date(),
//       metadata: {
//         requestId: requestId || null,
//         createdAt: new Date()
//       }
//     });

//     console.log(`✅ Order created with ID: ${order._id}`);
//     console.log(`✅ Order Number: ${order.orderId}`);

//     const fileGroups = extractGarmentFiles(req);

//     // Create payments
//     const createdPayments = [];
//     if (allPayments.length > 0) {
//       const existingPayments = await Payment.find({ order: order._id });
      
//       if (existingPayments.length === 0) {
//         for (const paymentData of allPayments) {
//           let safeAmount = 0;
          
//           if (paymentData.amount === undefined || paymentData.amount === null) {
//             safeAmount = 0;
//           } else {
//             const numAmount = Number(paymentData.amount);
//             const floatAmount = parseFloat(paymentData.amount);
            
//             if (!isNaN(numAmount) && numAmount > 0) {
//               safeAmount = numAmount;
//             } else if (!isNaN(floatAmount) && floatAmount > 0) {
//               safeAmount = floatAmount;
//             } else {
//               safeAmount = 0;
//             }
//           }
          
//           const now = new Date();
//           const hours = String(now.getHours()).padStart(2, '0');
//           const minutes = String(now.getMinutes()).padStart(2, '0');
//           const seconds = String(now.getSeconds()).padStart(2, '0');
//           const paymentTime = `${hours}:${minutes}:${seconds}`;
          
//           await new Promise(resolve => setTimeout(resolve, 10));
          
//           const payment = await Payment.create({
//             order: order._id,
//             customer: order.customer,
//             amount: safeAmount,
//             type: paymentData.type || 'advance',
//             method: paymentData.method || 'cash',
//             referenceNumber: paymentData.referenceNumber || '',
//             paymentDate: paymentData.paymentDate || new Date(),
//             paymentTime: paymentTime,
//             notes: paymentData.notes || '',
//             receivedBy: creatorId,
//             metadata: {
//               requestId: requestId
//             }
//           });
          
//           await createIncomeFromPayment(payment, order, creatorId);
//           createdPayments.push(payment);
//         }
//       }
//     }

//     // Create garments
//     const createdGarmentIds = [];
//     if (garments && garments.length > 0) {
//       const existingGarments = await Garment.find({ order: order._id });
      
//       if (existingGarments.length === 0) {
//         for (let i = 0; i < garments.length; i++) {
//           const g = garments[i];
          
//           if (i > 0) {
//             await new Promise(resolve => setTimeout(resolve, 50));
//           }

//           const uploadedImages = {
//             referenceImages: [],
//             customerImages: [],
//             customerClothImages: []
//           };

//           if (fileGroups[i]?.referenceImages?.length > 0) {
//             const results = await r2Service.uploadMultiple(
//               fileGroups[i].referenceImages, 
//               `orders/${order._id}/garment_${i}/reference`
//             );
//             uploadedImages.referenceImages = results;
//           }

//           if (fileGroups[i]?.customerImages?.length > 0) {
//             const results = await r2Service.uploadMultiple(
//               fileGroups[i].customerImages, 
//               `orders/${order._id}/garment_${i}/customer`
//             );
//             uploadedImages.customerImages = results;
//           }

//           if (fileGroups[i]?.customerClothImages?.length > 0) {
//             const results = await r2Service.uploadMultiple(
//               fileGroups[i].customerClothImages, 
//               `orders/${order._id}/garment_${i}/cloth`
//             );
//             uploadedImages.customerClothImages = results;
//           }

//           const garmentData = {
//             name: g.name,
//             garmentType: g.garmentType || g.item || g.itemName || g.name,
//             category: g.category,
//             item: g.item,
//             categoryName: g.categoryName,
//             itemName: g.itemName,
//             measurements: g.measurements || [],
//             measurementTemplate: g.measurementTemplate && g.measurementTemplate !== '' 
//               ? g.measurementTemplate 
//               : null,
//             measurementSource: g.measurementSource || 'customer',
//             additionalInfo: g.additionalInfo || '',
//             estimatedDelivery: g.estimatedDelivery || deliveryDate,
//             priority: g.priority || 'normal',
//             priceRange: {
//               min: Number(g.priceRange?.min) || 0,
//               max: Number(g.priceRange?.max) || 0
//             },
//             fabricSource: g.fabricSource || 'customer',
//             fabricPrice: g.fabricPrice || '0',
//             referenceImages: uploadedImages.referenceImages,
//             customerImages: uploadedImages.customerImages,
//             customerClothImages: uploadedImages.customerClothImages,
//             order: order._id,
//             createdBy: creatorId,
//             status: 'pending',
//             metadata: {
//               requestId: requestId,
//               sequence: i + 1
//             }
//           };

//           Object.keys(garmentData).forEach(key => 
//             garmentData[key] === undefined && delete garmentData[key]
//           );
          
//           const garment = await Garment.create(garmentData);
//           createdGarmentIds.push(garment._id);
//         }
        
//         order.garments = createdGarmentIds;
//         order.status = "confirmed";
//         await order.save();
        
//         if (createdGarmentIds.length > 0) {
//           await createWorksFromGarments(order._id, createdGarmentIds, creatorId);
//         }
//       }
//     }

//     await order.populate('customer', 'name phone customerId');

//     console.log(`\n🎉 Order completed successfully!`);
//     console.log(`📦 Order ID: ${order._id}`);
//     console.log(`📦 Order Number: ${order.orderId}`);
//     console.log(`👕 Garments created: ${createdGarmentIds.length}`);
//     console.log(`💰 Payments created: ${createdPayments.length}`);

//     // 🔥 WHATSAPP INTEGRATION
//     console.log("\n📱 SENDING WHATSAPP ORDER CONFIRMATION...");
//     try {
//       const { sendOrderConfirmation } = await import('./whatsapp.controller.js');
//       sendOrderConfirmation(order._id)
//         .then(result => {
//           if (result) console.log(`✅ WhatsApp order confirmation sent successfully`);
//         })
//         .catch(err => console.log('⚠️ WhatsApp confirmation failed:', err.message));
//     } catch (waErr) {
//       console.log('⚠️ Could not send WhatsApp confirmation:', waErr.message);
//     }

//     res.status(201).json({ 
//       success: true, 
//       message: "Order created successfully",
//       order 
//     });
//   } catch (error) {
//     console.error("\n❌ CREATE ORDER ERROR:", error);
    
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ success: false, message: "Validation failed", errors });
//     }
    
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       if (field === 'orderId') {
//         console.log(`⚠️ Duplicate orderId, retrying...`);
//         return createOrder(req, res);
//       }
//       return res.status(400).json({ 
//         success: false, 
//         message: `Duplicate ${field}. Please try again.`
//       });
//     }
    
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 3. GET ALL ORDERS
// // ============================================
// export const getAllOrders = async (req, res) => {
//   console.log("\n📋 ===== GET ALL ORDERS =====");
  
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       status,
//       paymentStatus,
//       timeFilter = "all",
//       startDate,
//       endDate,
//     } = req.query;

//     let query = { isActive: true };

//     if (search) {
//       const customerIds = await Customer.find({
//         $or: [
//           { name: { $regex: search, $options: 'i' } },
//           { phone: { $regex: search, $options: 'i' } }
//         ]
//       }).distinct('_id');
      
//       query.$or = [
//         { orderId: { $regex: search, $options: 'i' } },
//         { customer: { $in: customerIds } }
//       ];
//     }

//     if (status && status !== "all") {
//       query.status = status;
//     }

//     if (paymentStatus && paymentStatus !== "all") {
//       query['paymentSummary.paymentStatus'] = paymentStatus;
//     }

//     const now = new Date();
//     if (timeFilter !== "all") {
//       let filterDate = new Date();
//       if (timeFilter === "week") filterDate.setDate(now.getDate() - 7);
//       else if (timeFilter === "month") filterDate.setMonth(now.getMonth() - 1);
//       else if (timeFilter === "3m") filterDate.setMonth(now.getMonth() - 3);
      
//       query.createdAt = { $gte: filterDate };
//     }

//     if (startDate && endDate) {
//       query.createdAt = { 
//         $gte: new Date(startDate), 
//         $lte: new Date(endDate) 
//       };
//     }

//     const total = await Order.countDocuments(query);

//     const orders = await Order.find(query)
//       .populate('customer', 'name phone customerId')
//       .populate("garments")
//       .populate("createdBy", "name")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     res.json({ 
//       success: true, 
//       orders, 
//       pagination: { 
//         page: parseInt(page), 
//         limit: parseInt(limit), 
//         total, 
//         pages: Math.ceil(total / limit) 
//       } 
//     });
//   } catch (error) {
//     console.error("❌ Get all orders error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 4. GET ORDER BY ID
// // ============================================
// export const getOrderById = async (req, res) => {
//   console.log(`\n🔍 ===== GET ORDER BY ID: ${req.params.id} =====`);
  
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate('customer', 'name phone customerId email address addressLine1 addressLine2 city state pincode')
//       .populate({
//         path: "garments",
//         populate: [
//           { path: "category", select: "name" },
//           { path: "item", select: "name" },
//           { path: "workId" }
//         ]
//       })
//       .populate("createdBy", "name");

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     const payments = await Payment.find({ 
//       order: order._id,
//       isDeleted: false 
//     })
//     .populate('receivedBy', 'name')
//     .sort('-paymentDate -paymentTime');

//     const works = await Work.find({ order: order._id, isActive: true })
//       .populate('garment', 'name item category')
//       .populate('cuttingMaster', 'name');

//     res.json({ 
//       success: true, 
//       order,
//       payments,
//       works
//     });
//   } catch (error) {
//     console.error("❌ Get order error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 5. UPDATE ORDER
// // ============================================
// export const updateOrder = async (req, res) => {
//   console.log(`\n📝 ===== UPDATE ORDER: ${req.params.id} =====`);
  
//   try {
//     const { id } = req.params;
//     const {
//       deliveryDate,
//       specialNotes,
//       advancePayment,
//       priceSummary,
//       status,
//       newGarments
//     } = req.body;

//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     if (deliveryDate) order.deliveryDate = deliveryDate;
//     if (specialNotes !== undefined) order.specialNotes = specialNotes;
    
//     if (advancePayment) {
//       order.advancePayment = {
//         amount: advancePayment.amount !== undefined ? advancePayment.amount : order.advancePayment.amount,
//         method: advancePayment.method || order.advancePayment.method,
//         date: advancePayment.date || order.advancePayment.date || new Date()
//       };
//     }
    
//     if (priceSummary) {
//       order.priceSummary = {
//         totalMin: priceSummary.totalMin !== undefined ? priceSummary.totalMin : order.priceSummary.totalMin,
//         totalMax: priceSummary.totalMax !== undefined ? priceSummary.totalMax : order.priceSummary.totalMax
//       };
//     }
    
//     if (status) order.status = status;

//     if (newGarments && newGarments.length > 0) {
//       order.garments = [...order.garments, ...newGarments];
      
//       const creatorId = req.user?._id || req.user?.id;
//       await createWorksFromGarments(order._id, newGarments, creatorId);
//     }

//     await order.save();
//     await updateOrderPaymentSummary(order._id);
    
//     res.json({ success: true, message: "Order updated successfully", order });
//   } catch (error) {
//     console.error("❌ Update error:", error);
    
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ success: false, message: "Validation failed", errors });
//     }
    
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 6. UPDATE ORDER STATUS
// // ============================================
// export const updateOrderStatus = async (req, res) => {
//   console.log(`\n🔄 ===== UPDATE ORDER STATUS: ${req.params.id} =====`);
  
//   try {
//     const { status } = req.body;
//     const { id } = req.params;
    
//     const validStatuses = ["draft", "confirmed", "in-progress", "ready-to-delivery", "delivered", "cancelled"];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
//       });
//     }
    
//     const order = await Order.findById(id)
//       .populate('customer', 'name phone')
//       .populate('garments');
      
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }
    
//     const validTransitions = {
//       'draft': ['confirmed', 'cancelled'],
//       'confirmed': ['in-progress', 'cancelled'],
//       'in-progress': ['ready-to-delivery', 'cancelled'],
//       'ready-to-delivery': ['delivered', 'cancelled'],
//       'delivered': [],
//       'cancelled': []
//     };
    
//     if (!validTransitions[order.status]?.includes(status)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: `Cannot transition from ${order.status} to ${status}` 
//       });
//     }
    
//     const oldStatus = order.status;
//     order.status = status;
//     await order.save();
    
//     console.log(`✅ Status updated: ${oldStatus} → ${status}`);

//     if (status === 'ready-to-delivery' && oldStatus !== 'ready-to-delivery') {
//       try {
//         const { sendReadyToDeliver } = await import('./whatsapp.controller.js');
//         sendReadyToDeliver(order._id)
//           .catch(err => console.log('⚠️ Ready WhatsApp failed:', err.message));
//       } catch (waErr) {
//         console.log('⚠️ WhatsApp import error:', waErr.message);
//       }
//     }

//     if (status === 'ready-to-delivery') {
//       const storeKeepers = await StoreKeeper.find({ isActive: true }).lean();
//       storeKeepers.forEach(keeper => {
//         createNotification({
//           type: 'delivery-ready',
//           recipient: keeper._id,
//           title: '📦 Order Ready for Delivery',
//           message: `Order #${order.orderId} for ${order.customer?.name || 'Customer'} is ready for delivery`,
//           reference: { orderId: order._id, orderNumber: order.orderId },
//           priority: 'high'
//         }).catch(() => {});
//       });
//     }
//     else if (status === 'delivered') {
//       await updateOrderPaymentSummary(order._id);
      
//       const storeKeepers = await StoreKeeper.find({ isActive: true }).lean();
//       storeKeepers.forEach(keeper => {
//         createNotification({
//           type: 'order-delivered',
//           recipient: keeper._id,
//           title: '✅ Order Delivered',
//           message: `Order #${order.orderId} has been delivered`,
//           reference: { orderId: order._id },
//           priority: 'medium'
//         }).catch(() => {});
//       });
//     }
//     else if (status === 'cancelled') {
//       await Work.updateMany(
//         { order: order._id, status: { $ne: 'completed' } },
//         { status: 'cancelled', isActive: false }
//       );
//     }

//     try {
//       if (status === 'in-progress') {
//         await Work.updateMany(
//           { order: order._id, status: 'pending' },
//           { status: 'in-progress' }
//         );
//       }
//       else if (status === 'delivered') {
//         await Work.updateMany(
//           { order: order._id, status: { $ne: 'completed' } },
//           { status: 'completed' }
//         );
//       }
//     } catch (workErr) {
//       console.log("Work update error:", workErr.message);
//     }
    
//     const updatedOrder = await Order.findById(id)
//       .populate('customer', 'name phone customerId')
//       .populate('garments');
    
//     res.json({ 
//       success: true, 
//       message: `Order status updated from ${oldStatus} to ${status}`,
//       order: updatedOrder 
//     });
    
//   } catch (error) {
//     console.error("❌ Update status error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 7. DELETE ORDER (SOFT DELETE)
// // ============================================
// export const deleteOrder = async (req, res) => {
//   console.log(`\n🗑️ ===== DELETE ORDER: ${req.params.id} =====`);
  
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     await Garment.updateMany({ _id: { $in: order.garments } }, { isActive: false });
//     await Work.updateMany({ order: order._id }, { isActive: false });
//     await Payment.updateMany({ order: order._id }, { isDeleted: true });
//     await Transaction.updateMany({ order: order._id }, { status: 'cancelled' });

//     order.isActive = false;
//     await order.save();

//     res.json({ success: true, message: "Order deleted successfully" });
//   } catch (error) {
//     console.error("❌ Delete error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 8. ADD PAYMENT TO ORDER
// // ============================================
// export const addPaymentToOrder = async (req, res) => {
//   console.log(`\n💰 ===== ADD PAYMENT TO ORDER: ${req.params.id} =====`);
//   console.log("⏰ Timestamp:", new Date().toISOString());
  
//   try {
//     const { id } = req.params;
//     const paymentData = req.body;
    
//     console.log("\n📦 ===== PAYMENT DATA RECEIVED =====");
//     console.log("📦 Payment amount:", paymentData.amount);
//     console.log("📦 Payment type:", paymentData.type);
//     console.log("📦 Payment method:", paymentData.method);
    
//     console.log("\n🔍 ===== FETCHING ORDER =====");
//     const order = await Order.findById(id).populate('customer');
    
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }
    
//     console.log("\n✅ ===== ORDER FOUND =====");
//     console.log("✅ Order Number:", order.orderId);
    
//     const creatorId = req.user?._id || req.user?.id;
    
//     const now = new Date();
//     const hours = String(now.getHours()).padStart(2, '0');
//     const minutes = String(now.getMinutes()).padStart(2, '0');
//     const seconds = String(now.getSeconds()).padStart(2, '0');
//     const paymentTime = `${hours}:${minutes}:${seconds}`;
    
//     const payment = await Payment.create({
//       order: order._id,
//       customer: order.customer,
//       amount: paymentData.amount,
//       type: paymentData.type || 'advance',
//       method: paymentData.method || 'cash',
//       referenceNumber: paymentData.referenceNumber || '',
//       paymentDate: paymentData.paymentDate || new Date(),
//       paymentTime: paymentTime,
//       notes: paymentData.notes || '',
//       receivedBy: creatorId
//     });
    
//     console.log("\n✅ ===== PAYMENT CREATED =====");
//     console.log("✅ Payment Amount:", payment.amount);
    
//     try {
//       await createIncomeFromPayment(payment, order, creatorId);
//       console.log("✅ Income created successfully");
//     } catch (incomeErr) {
//       console.log("⚠️ Income creation error:", incomeErr.message);
//     }
    
//     try {
//       await updateOrderPaymentSummary(order._id);
//       console.log("✅ Payment summary updated");
//     } catch (summaryErr) {
//       console.log("⚠️ Payment summary error:", summaryErr.message);
//     }
    
//     const paymentCount = await Payment.countDocuments({ 
//       order: order._id,
//       isDeleted: false 
//     });
    
//     const customerPhone = order.customer?.phone || order.customer?.whatsappNumber;
    
//     if (customerPhone && paymentCount > 1) {
//       try {
//         const { sendPaymentReceived } = await import('./whatsapp.controller.js');
//         sendPaymentReceived(order._id, payment)
//           .catch(err => console.log('⚠️ Payment WhatsApp failed:', err.message));
//         console.log('📨 Payment confirmation WhatsApp queued');
//       } catch (waErr) {
//         console.log('⚠️ WhatsApp import error:', waErr.message);
//       }
//     }
    
//     res.status(201).json({ 
//       success: true, 
//       message: "Payment added and income created", 
//       payment,
//       debug: {
//         paymentCount,
//         hasPhone: !!customerPhone
//       }
//     });
    
//   } catch (error) {
//     console.error("\n❌❌❌ ===== ADD PAYMENT ERROR ===== ❌❌❌");
//     console.error("❌ Error message:", error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 9. GET ORDER PAYMENTS
// // ============================================
// export const getOrderPayments = async (req, res) => {
//   console.log(`\n💰 ===== GET ORDER PAYMENTS: ${req.params.id} =====`);
  
//   try {
//     const payments = await Payment.find({ 
//       order: req.params.id,
//       isDeleted: false 
//     })
//     .populate('receivedBy', 'name')
//     .sort('-paymentDate -paymentTime');
    
//     res.json({ success: true, payments });
//   } catch (error) {
//     console.error("❌ Get payments error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 10. GET DASHBOARD DATA
// // ============================================
// export const getDashboardData = async (req, res) => {
//   console.log("\n📊 ===== GET DASHBOARD DATA =====");
  
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const todayOrders = await Order.find({
//       createdAt: { $gte: today },
//       isActive: true
//     }).populate('customer', 'name');

//     const pendingDeliveries = await Order.find({
//       deliveryDate: { $lt: new Date() },
//       status: { $nin: ['delivered', 'cancelled'] },
//       isActive: true
//     }).populate('customer', 'name phone');

//     const readyForDelivery = await Order.find({
//       status: 'ready-to-delivery',
//       isActive: true
//     }).populate('customer', 'name phone');

//     const recentOrders = await Order.find({ isActive: true })
//       .populate('customer', 'name')
//       .sort({ createdAt: -1 })
//       .limit(10);

//     const todayPayments = await Payment.find({
//       paymentDate: { $gte: today },
//       isDeleted: false
//     });

//     const todayCollection = todayPayments.reduce((sum, p) => sum + p.amount, 0);

//     const todayIncome = await Transaction.find({
//       transactionDate: { $gte: today },
//       type: 'income',
//       status: 'completed'
//     });

//     const totalIncomeToday = todayIncome.reduce((sum, t) => sum + t.amount, 0);

//     res.json({
//       success: true,
//       dashboard: {
//         todayOrders: { count: todayOrders.length, orders: todayOrders },
//         pendingDeliveries: { count: pendingDeliveries.length, orders: pendingDeliveries },
//         readyForDelivery: { count: readyForDelivery.length, orders: readyForDelivery },
//         recentOrders,
//         todayCollection,
//         totalIncomeToday,
//         incomeBreakdown: {
//           handCash: todayIncome.filter(t => t.accountType === 'hand-cash').reduce((sum, t) => sum + t.amount, 0),
//           bank: todayIncome.filter(t => t.accountType === 'bank').reduce((sum, t) => sum + t.amount, 0)
//         }
//       }
//     });
//   } catch (error) {
//     console.error("❌ Dashboard error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 11. GET ORDERS BY CUSTOMER
// // ============================================
// export const getOrdersByCustomer = async (req, res) => {
//   try {
//     const { customerId } = req.params;
    
//     console.log(`🔍 Fetching orders for customer: ${customerId}`);
    
//     const orders = await Order.find({ 
//       customer: customerId,
//       isActive: true 
//     })
//     .populate('customer', 'name phone email customerId')
//     .populate('garments')
//     .sort('-createdAt');
    
//     res.status(200).json({
//       success: true,
//       count: orders.length,
//       orders: orders
//     });
    
//   } catch (error) {
//     console.error(`❌ Error fetching orders for customer:`, error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // ============================================
// // ✅ 12. GET READY TO DELIVERY ORDERS
// // ============================================
// export const getReadyToDeliveryOrders = async (req, res) => {
//   console.log("\n📦 ===== GET READY TO DELIVERY ORDERS =====");
  
//   try {
//     const orders = await Order.find({ 
//       status: 'ready-to-delivery',
//       isActive: true 
//     })
//     .populate('customer', 'name phone')
//     .populate('garments')
//     .sort({ updatedAt: -1 });
    
//     res.json({
//       success: true,
//       count: orders.length,
//       orders
//     });
//   } catch (error) {
//     console.error("❌ Get ready to delivery error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 13. GET INCOME BY ORDER ID
// // ============================================
// export const getIncomeByOrder = async (req, res) => {
//   console.log(`\n💰 ===== GET INCOME FOR ORDER: ${req.params.id} =====`);
  
//   try {
//     const incomes = await Transaction.find({
//       order: req.params.id,
//       type: 'income',
//       status: 'completed'
//     })
//     .populate('customer', 'name phone')
//     .sort('-transactionDate');
    
//     const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    
//     res.json({
//       success: true,
//       count: incomes.length,
//       totalIncome,
//       incomes
//     });
//   } catch (error) {
//     console.error("❌ Get income error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 14. GET ORDER STATS FOR DASHBOARD
// // ============================================
// export const getOrderStatsForDashboard = async (req, res) => {
//   try {
//     const { startDate, endDate, period } = req.query;
    
//     let dateFilter = { isActive: true };
    
//     if (period === 'today') {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
      
//       dateFilter.orderDate = {
//         $gte: today,
//         $lt: tomorrow
//       };
//     } 
//     else if (period === 'week') {
//       const today = new Date();
//       const startOfWeek = new Date(today);
//       startOfWeek.setDate(today.getDate() - today.getDay());
//       startOfWeek.setHours(0, 0, 0, 0);
      
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(startOfWeek.getDate() + 7);
      
//       dateFilter.orderDate = {
//         $gte: startOfWeek,
//         $lt: endOfWeek
//       };
//     }
//     else if (period === 'month') {
//       const now = new Date();
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//       endOfMonth.setHours(23, 59, 59, 999);
      
//       dateFilter.orderDate = {
//         $gte: startOfMonth,
//         $lte: endOfMonth
//       };
//     }
//     else if (startDate && endDate) {
//       dateFilter.orderDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate + 'T23:59:59.999Z')
//       };
//     }

//     const totalOrdersInRange = await Order.countDocuments(dateFilter);

//     const pendingOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'confirmed'
//     });
    
//     const cuttingOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'in-progress'
//     });
    
//     const readyOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'ready-to-delivery'
//     });
    
//     const deliveredOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'delivered'
//     });

//     const cancelledOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'cancelled'
//     });

//     const draftOrders = await Order.countDocuments({ 
//       ...dateFilter,
//       status: 'draft'
//     });

//     const stats = {
//       total: totalOrdersInRange,
//       pending: pendingOrders,
//       cutting: cuttingOrders,
//       stitching: cuttingOrders,
//       ready: readyOrders,
//       delivered: deliveredOrders,
//       cancelled: cancelledOrders,
//       draft: draftOrders,
//       confirmed: pendingOrders,
//       'in-progress': cuttingOrders,
//       'ready-to-delivery': readyOrders
//     };

//     res.status(200).json({
//       success: true,
//       data: stats
//     });

//   } catch (error) {
//     console.error('❌ ERROR in getOrderStatsForDashboard:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ 15. GET RECENT ORDERS
// // ============================================
// export const getRecentOrders = async (req, res) => {
//   try {
//     const { limit = 10, startDate, endDate, period } = req.query;
    
//     let dateFilter = { isActive: true };
    
//     if (startDate && endDate) {
//       dateFilter.orderDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate + 'T23:59:59.999Z')
//       };
//     } else {
//       const thirtyDaysAgo = new Date();
//       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//       dateFilter.orderDate = { $gte: thirtyDaysAgo };
//     }

//     const orders = await Order.find(dateFilter)
//       .populate('customer', 'name phone')
//       .populate('garments', 'name type quantity')
//       .sort({ orderDate: -1 })
//       .limit(parseInt(limit));

//     const formattedOrders = orders.map(order => ({
//       _id: order._id,
//       orderId: order.orderId,
//       orderDate: order.orderDate,
//       customer: order.customer ? {
//         _id: order.customer._id,
//         name: order.customer.name,
//         phone: order.customer.phone
//       } : null,
//       garments: order.garments?.map(g => ({
//         name: g.name,
//         type: g.type,
//         quantity: g.quantity
//       })) || [],
//       deliveryDate: order.deliveryDate,
//       status: order.status,
//       totalAmount: order.priceSummary?.totalMax || 0,
//       paidAmount: order.paymentSummary?.totalPaid || 0,
//       balanceAmount: order.balanceAmount || 0,
//       paymentStatus: order.paymentSummary?.paymentStatus || 'pending'
//     }));

//     res.json({
//       success: true,
//       orders: formattedOrders,
//       count: formattedOrders.length,
//       filter: { startDate, endDate, period }
//     });

//   } catch (error) {
//     console.error("❌ Recent orders error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 16. GET FILTERED ORDERS
// // ============================================
// export const getFilteredOrders = async (req, res) => {
//   try {
//     const { 
//       startDate, 
//       endDate, 
//       period,
//       status,
//       page = 1,
//       limit = 20
//     } = req.query;

//     let filter = { isActive: true };
    
//     if (startDate && endDate) {
//       filter.orderDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate + 'T23:59:59.999Z')
//       };
//     }
    
//     if (status && status !== 'all') {
//       filter.status = status;
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);
    
//     const orders = await Order.find(filter)
//       .populate('customer', 'name phone')
//       .populate('garments', 'name type quantity price')
//       .sort({ orderDate: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const totalCount = await Order.countDocuments(filter);

//     const summary = await Order.aggregate([
//       { $match: filter },
//       {
//         $group: {
//           _id: null,
//           totalOrders: { $sum: 1 },
//           totalRevenue: { $sum: '$priceSummary.totalMax' },
//           totalPaid: { $sum: '$paymentSummary.totalPaid' },
//           pendingAmount: { $sum: '$balanceAmount' },
//           avgOrderValue: { $avg: '$priceSummary.totalMax' }
//         }
//       }
//     ]);

//     const formattedOrders = orders.map(order => ({
//       _id: order._id,
//       orderId: order.orderId,
//       orderDate: order.orderDate,
//       customer: order.customer,
//       garments: order.garments,
//       garmentCount: order.garments?.length || 0,
//       deliveryDate: order.deliveryDate,
//       status: order.status,
//       totalAmount: order.priceSummary?.totalMax || 0,
//       paidAmount: order.paymentSummary?.totalPaid || 0,
//       balanceAmount: order.balanceAmount || 0,
//       paymentStatus: order.paymentSummary?.paymentStatus || 'pending'
//     }));

//     res.json({
//       success: true,
//       orders: formattedOrders,
//       summary: summary[0] || {
//         totalOrders: 0,
//         totalRevenue: 0,
//         totalPaid: 0,
//         pendingAmount: 0,
//         avgOrderValue: 0
//       },
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(totalCount / parseInt(limit)),
//         totalCount,
//         limit: parseInt(limit)
//       },
//       filter: { startDate, endDate, period, status }
//     });

//   } catch (error) {
//     console.error("❌ Filtered orders error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ============================================
// // ✅ 17. GET ORDER DATES (for green dots)
// // ============================================
// export const getOrderDates = async (req, res) => {
//   console.log("\n🟢 ===== GET ORDER DATES =====");
//   console.log("Query params:", req.query);
  
//   try {
//     const { month, year, type = 'order' } = req.query;
    
//     if (!month || !year) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Month and year are required" 
//       });
//     }

//     const monthNum = parseInt(month);
//     const yearNum = parseInt(year);

//     const startDate = new Date(yearNum, monthNum - 1, 1);
//     const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

//     const dateField = type === 'order' ? 'orderDate' : 'deliveryDate';

//     const orderDates = await Order.aggregate([
//       {
//         $match: {
//           [dateField]: { 
//             $gte: startDate, 
//             $lte: endDate 
//           },
//           status: { $ne: 'cancelled' },
//           isActive: true
//         }
//       },
//       {
//         $group: {
//           _id: {
//             $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` }
//           },
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id",
//           count: 1
//         }
//       },
//       { $sort: { date: 1 } }
//     ]);

//     const dates = orderDates.map(item => item.date);

//     res.json({
//       success: true,
//       dates: dates,
//       details: orderDates,
//       month: monthNum,
//       year: yearNum,
//       type: type
//     });

//   } catch (error) {
//     console.error("❌ Error in getOrderDates:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ 18. GET DELIVERY DATES FOR CALENDAR
// // ============================================
// export const getDeliveryDatesForCalendar = async (req, res) => {
//   console.log("\n🟢 ===== GET DELIVERY DATES FOR CALENDAR =====");
  
//   try {
//     const { month, year } = req.query;

//     if (!month || !year) {
//       return res.status(400).json({
//         success: false,
//         message: "Month and year are required"
//       });
//     }

//     const monthNum = parseInt(month) - 1;
//     const yearNum = parseInt(year);

//     const deliveryData = await Order.getDeliveryCalendar(monthNum, yearNum);

//     res.json({
//       success: true,
//       allDates: deliveryData.data,
//       month: parseInt(month),
//       year: yearNum
//     });

//   } catch (error) {
//     console.error("❌ Error in getDeliveryDatesForCalendar:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // ============================================
// // ✅ 19. GET SIMPLE DELIVERY DATES (with counts)
// // ============================================
// export const getSimpleDeliveryDates = async (req, res) => {
//   console.log("\n🟢 ===== GET SIMPLE DELIVERY DATES =====");
  
//   try {
//     const { month, year } = req.query;

//     if (!month || !year) {
//       return res.status(400).json({
//         success: false,
//         message: "Month and year are required"
//       });
//     }

//     const monthNum = parseInt(month) - 1;
//     const yearNum = parseInt(year);

//     const counts = await Order.getDeliveryCountsByDay(monthNum, yearNum);

//     const formattedDates = counts.map(item => ({
//       _id: `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`,
//       count: item.count
//     }));

//     res.json({
//       success: true,
//       allDates: formattedDates
//     });

//   } catch (error) {
//     console.error("❌ Error in getSimpleDeliveryDates:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };







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

    // Dynamically calculate and self-heal the priceSummary from the actual garments in database
    const garments = await Garment.find({ order: orderId, isActive: true });
    if (garments && garments.length > 0) {
      let totalMin = 0;
      let totalMax = 0;
      let totalFinalized = 0;
      for (const g of garments) {
        const minVal = g.minPrice !== undefined && g.minPrice !== null ? g.minPrice : (g.priceRange?.min || 0);
        const maxVal = g.maxPrice !== undefined && g.maxPrice !== null ? g.maxPrice : (g.priceRange?.max || 0);
        const finalVal = g.finalizedAmount !== undefined && g.finalizedAmount !== null
          ? g.finalizedAmount
          : (g.finalizedPrice !== undefined && g.finalizedPrice !== null
            ? g.finalizedPrice
            : maxVal);

        totalMin += minVal;
        totalMax += maxVal;
        totalFinalized += finalVal;
      }
      order.minPrice = totalMin;
      order.maxPrice = totalMax;
      order.finalizedAmount = totalFinalized;
      // We set totalMax in priceSummary to totalFinalized so legacy/reference areas also pick up finalized price!
      order.priceSummary = { totalMin, totalMax: totalFinalized };
    }

    const payments = await Payment.find({ 
      order: orderId, 
      isDeleted: false,
      type: { $in: ['advance', 'full', 'final-settlement'] }
    });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const lastPayment = payments.sort((a, b) => 
      new Date(b.paymentDate) - new Date(a.paymentDate)
    )[0];

    let paymentStatus = 'pending';
    const totalAmount = order.finalizedAmount || order.priceSummary?.totalMax || 0;
    
    if (totalPaid >= totalAmount) {
      paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'partial';
    }

    order.paymentSummary = {
      totalPaid,
      lastPaymentDate: lastPayment?.paymentDate,
      lastPaymentAmount: lastPayment?.amount,
      paymentCount: payments.length,
      paymentStatus
    };
    
    order.balanceAmount = Math.max(0, totalAmount - totalPaid);
    order.dueAmount = Math.max(0, totalAmount - totalPaid);
    
    await order.save();
    console.log(`✅ Payment summary updated: Paid: ₹${totalPaid}, Status: ${paymentStatus}`);
    
    return { success: true, totalPaid, paymentStatus };
  } catch (error) {
    console.error("❌ Error updating payment summary:", error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ✅ HELPER: CREATE WORKS FROM EXISTING GARMENTS (UPDATED WITH NEW WORK ID FORMAT)
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
    
    // 🔥 CRITICAL: Get order to get orderId number for work ID format
    const order = await Order.findById(orderId);
    if (!order) {
      console.log("❌ Order not found!");
      return { success: false, error: 'Order not found' };
    }
    
    console.log(`📋 Order found: ${order.orderId}`);
    
    // Check if works already exist for these garments
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

    // 🔥 FIX: Sequential work creation with NEW WORK ID format (OrderID.sequence)
    for (const garment of garmentDocs) {
      // 🔥🔥🔥 NEW WORK ID: OrderID.sequence (e.g., 2026032101.01) 🔥🔥🔥
      // Count existing works for this order
      const workCount = await Work.countDocuments({ order: orderId, isActive: true });
      const sequence = workCount + 1;
      const seqStr = sequence < 100 ? String(sequence).padStart(2, "0") : String(sequence);
      const workId = `${order.orderId}.${seqStr}`;
      
      console.log(`🧵 Generated Work ID: ${workId} (Sequence: ${sequence} for order ${order.orderId})`);
      
      // Add small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      console.log(`📝 Creating work for garment: ${garment.name || garment._id}`);
      const work = await Work.create({
        workId,
        order: orderId,
        garment: garment._id,
        createdBy: creatorId,
        status: "pending",
        cuttingMaster: null,
        estimatedDelivery: garment.estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000)
      });
      
      createdWorks.push(work);
      
      // Update garment with work ID
      await Garment.findByIdAndUpdate(garment._id, { workId: work._id });
      console.log(`✅ Created work: ${work._id} (${work.workId})`);
    }
    
    console.log(`✅ Created ${createdWorks.length} works sequentially`);
    
    // 🔥 Send notifications to cutting masters
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
    console.error("Error stack:", error.stack);
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
    // 🔥 BULLETPROOF: Find the highest existing orderId for today
    // This handles ALL edge cases: deleted orders, inactive orders, etc.
    const latestOrder = await Order.findOne(
      { orderId: { $regex: `^${datePart}` } },
      { orderId: 1 },
      { sort: { orderId: -1 } }
    );

    let sequence = 1;
    if (latestOrder && latestOrder.orderId) {
      // Extract the sequence number from the existing orderId
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
    // Fallback: use timestamp + random to guarantee uniqueness
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

    const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today }, isActive: true }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek }, isActive: true }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth }, isActive: true }),
      Order.countDocuments({ isActive: true })
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

    res.status(200).json({
      success: true,
      stats: {
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        total: totalCount,
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
// ✅ 2. CREATE ORDER (WITH NEW ORDER ID FORMAT)
// ============================================
export const createOrder = async (req, res) => {
  console.log("\n🆕 ===== CREATE ORDER =====");
  console.log("📦 Request body type:", typeof req.body);
  console.log("📎 Files received:", req.files ? req.files.length : 0);
  
  try {
    let orderData = { ...req.body };
    
    if (typeof orderData.garments === 'string') {
      try {
        orderData.garments = JSON.parse(orderData.garments);
        console.log("✅ Parsed garments from string");
      } catch (e) {}
    }

    if (typeof orderData.payments === 'string') {
      try {
        orderData.payments = JSON.parse(orderData.payments);
      } catch (e) {}
    }
    
    if (typeof orderData.advancePayment === 'string') {
      try {
        orderData.advancePayment = JSON.parse(orderData.advancePayment);
      } catch (e) {}
    }

    const {
      customer,
      deliveryDate,
      garments,
      specialNotes,
      advancePayment,
      priceSummary,
      status,
      orderDate,
      payments = [],
      requestId
    } = orderData;

    const creatorId = req.user?._id || req.user?.id;
    if (!creatorId) {
      return res.status(401).json({ success: false, message: "Authentication failed" });
    }

    if (!customer || !deliveryDate) {
      return res.status(400).json({ success: false, message: "Customer and Delivery Date are required" });
    }

    // 🔥 DUPLICATE PREVENTION
    if (requestId) {
      console.log(`🔍 Checking for duplicate request: ${requestId}`);
      const existingOrder = await Order.findOne({ 'metadata.requestId': requestId });
      if (existingOrder) {
        console.log(`⚠️ DUPLICATE DETECTED! Request ${requestId} already processed`);
        return res.status(200).json({ 
          success: true, 
          message: "Order already exists",
          order: existingOrder,
          duplicate: true
        });
      }
    }

    const threeSecondsAgo = new Date(Date.now() - 3000);
    const recentDuplicate = await Order.findOne({
      customer: customer,
      'priceSummary.totalMax': priceSummary?.totalMax,
      createdAt: { $gte: threeSecondsAgo }
    });

    if (recentDuplicate) {
      console.log(`⚠️ RECENT DUPLICATE DETECTED!`);
      return res.status(200).json({ 
        success: true, 
        message: "Order already exists (recent duplicate)",
        order: recentDuplicate,
        duplicate: true
      });
    }

    // 🔥🔥🔥 NEW ORDER ID GENERATION (YYYYMMDD + AUTO-GROW SEQUENCE) 🔥🔥🔥
    const orderId = await generateOrderId();

    // Calculate totals
    let totalMin = 0;
    let totalMax = 0;
    let totalFinalized = 0;
    
    if (garments && garments.length > 0) {
      garments.forEach((g) => {
        const minVal = Number(g.minPrice || g.priceRange?.min) || 0;
        const maxVal = Number(g.maxPrice || g.priceRange?.max) || 0;
        const finalVal = g.finalizedAmount !== undefined && g.finalizedAmount !== null && g.finalizedAmount !== ""
          ? Number(g.finalizedAmount)
          : (g.finalizedPrice !== undefined && g.finalizedPrice !== null && g.finalizedPrice !== ""
            ? Number(g.finalizedPrice)
            : maxVal);

        totalMin += minVal;
        totalMax += maxVal;
        totalFinalized += finalVal;
      });
    } else if (priceSummary) {
      totalMin = Number(priceSummary.totalMin) || 0;
      totalMax = Number(priceSummary.totalMax) || 0;
      totalFinalized = Number(priceSummary.totalMax) || 0;
    }

    // ── Use ONLY the payments[] array — do NOT auto-push from advancePayment ──
    // This is the SINGLE SOURCE of payment data. The old logic that pushed
    // advancePayment into allPayments caused duplicate entries.
    const allPayments = [...payments];

    const totalInitialPaid = allPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Create order (payments are stored in the separate Payment collection)
    const order = await Order.create({
      orderId,
      customer,
      deliveryDate,
      garments: [],
      specialNotes,
      advancePayment: {
        amount: allPayments.find(p => p.type === 'advance')?.amount || 0,
        method: allPayments.find(p => p.type === 'advance')?.method || allPayments[0]?.method || 'cash',
        date: new Date(),
      },
      minPrice: totalMin,
      maxPrice: totalMax,
      finalizedAmount: totalFinalized,
      dueAmount: Math.max(0, totalFinalized - totalInitialPaid),
      priceSummary: { totalMin, totalMax: totalFinalized },
      paymentSummary: {
        totalPaid: totalInitialPaid,
        lastPaymentDate: allPayments.length > 0 ? new Date() : null,
        lastPaymentAmount: allPayments.length > 0 ? allPayments[allPayments.length - 1].amount : 0,
        paymentCount: allPayments.length,
        paymentStatus: totalInitialPaid >= totalFinalized ? 'paid' : (totalInitialPaid > 0 ? 'partial' : 'pending')
      },
      balanceAmount: Math.max(0, totalFinalized - totalInitialPaid),
      createdBy: creatorId,
      status: status || "draft",
      orderDate: orderDate || new Date(),
      metadata: {
        requestId: requestId || null,
        createdAt: new Date()
      }
    });

    console.log(`✅ Order created with ID: ${order._id}`);
    console.log(`✅ Order Number: ${order.orderId}`);

    const fileGroups = extractGarmentFiles(req);

    // Create payments
    const createdPayments = [];
    if (allPayments.length > 0) {
      const existingPayments = await Payment.find({ order: order._id });
      
      if (existingPayments.length === 0) {
        for (const paymentData of allPayments) {
          let safeAmount = 0;
          
          if (paymentData.amount === undefined || paymentData.amount === null) {
            safeAmount = 0;
          } else {
            const numAmount = Number(paymentData.amount);
            const floatAmount = parseFloat(paymentData.amount);
            
            if (!isNaN(numAmount) && numAmount > 0) {
              safeAmount = numAmount;
            } else if (!isNaN(floatAmount) && floatAmount > 0) {
              safeAmount = floatAmount;
            } else {
              safeAmount = 0;
            }
          }
          
          const now = new Date();
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const seconds = String(now.getSeconds()).padStart(2, '0');
          const paymentTime = `${hours}:${minutes}:${seconds}`;
          
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
            metadata: {
              requestId: requestId
            }
          });
          
          await createIncomeFromPayment(payment, order, creatorId);
          createdPayments.push(payment);
        }
      }
    }

    // Create garments
    const createdGarmentIds = [];
    if (garments && garments.length > 0) {
      const existingGarments = await Garment.find({ order: order._id });
      
      if (existingGarments.length === 0) {
        for (let i = 0; i < garments.length; i++) {
          const g = garments[i];
          
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          const uploadedImages = {
            referenceImages: [],
            customerImages: [],
            customerClothImages: []
          };

          if (fileGroups[i]?.referenceImages?.length > 0) {
            const results = await r2Service.uploadMultiple(
              fileGroups[i].referenceImages, 
              `orders/${order._id}/garment_${i}/reference`
            );
            uploadedImages.referenceImages = results;
          }

          if (fileGroups[i]?.customerImages?.length > 0) {
            const results = await r2Service.uploadMultiple(
              fileGroups[i].customerImages, 
              `orders/${order._id}/garment_${i}/customer`
            );
            uploadedImages.customerImages = results;
          }

          if (fileGroups[i]?.customerClothImages?.length > 0) {
            const results = await r2Service.uploadMultiple(
              fileGroups[i].customerClothImages, 
              `orders/${order._id}/garment_${i}/cloth`
            );
            uploadedImages.customerClothImages = results;
          }

          const garmentData = {
            name: g.name,
            garmentType: g.garmentType || g.item || g.itemName || g.name,
            category: g.category,
            item: g.item,
            categoryName: g.categoryName,
            itemName: g.itemName,
            measurements: g.measurements || [],
            measurementTemplate: g.measurementTemplate && g.measurementTemplate !== '' 
              ? g.measurementTemplate 
              : null,
            measurementSource: g.measurementSource || 'customer',
            additionalInfo: g.additionalInfo || '',
            estimatedDelivery: g.estimatedDelivery || deliveryDate,
            priority: g.priority || 'normal',
            priceRange: {
              min: Number(g.priceRange?.min) || 0,
              max: Number(g.priceRange?.max) || 0
            },
            finalizedPrice: g.finalizedAmount !== undefined && g.finalizedAmount !== null && g.finalizedAmount !== ""
              ? Number(g.finalizedAmount)
              : (g.finalizedPrice !== undefined && g.finalizedPrice !== null && g.finalizedPrice !== ""
                ? Number(g.finalizedPrice)
                : (Number(g.priceRange?.max) || 0)),
            finalizedAmount: g.finalizedAmount !== undefined && g.finalizedAmount !== null && g.finalizedAmount !== ""
              ? Number(g.finalizedAmount)
              : (g.finalizedPrice !== undefined && g.finalizedPrice !== null && g.finalizedPrice !== ""
                ? Number(g.finalizedPrice)
                : (Number(g.priceRange?.max) || 0)),
            minPrice: g.minPrice !== undefined && g.minPrice !== null && g.minPrice !== ""
              ? Number(g.minPrice)
              : (Number(g.priceRange?.min) || 0),
            maxPrice: g.maxPrice !== undefined && g.maxPrice !== null && g.maxPrice !== ""
              ? Number(g.maxPrice)
              : (Number(g.priceRange?.max) || 0),
            fabricSource: g.fabricSource || 'customer',
            fabricPrice: g.fabricPrice || '0',
            referenceImages: uploadedImages.referenceImages,
            customerImages: uploadedImages.customerImages,
            customerClothImages: uploadedImages.customerClothImages,
            order: order._id,
            createdBy: creatorId,
            status: 'pending',
            metadata: {
              requestId: requestId,
              sequence: i + 1
            }
          };

          Object.keys(garmentData).forEach(key => 
            garmentData[key] === undefined && delete garmentData[key]
          );
          
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

    console.log(`\n🎉 Order completed successfully!`);
    console.log(`📦 Order ID: ${order._id}`);
    console.log(`📦 Order Number: ${order.orderId}`);
    console.log(`👕 Garments created: ${createdGarmentIds.length}`);
    console.log(`💰 Payments created: ${createdPayments.length}`);

    // 🔥 WHATSAPP INTEGRATION
    console.log("\n📱 SENDING WHATSAPP ORDER CONFIRMATION...");
    try {
      const { sendOrderConfirmation } = await import('./whatsapp.controller.js');
      sendOrderConfirmation(order._id)
        .then(result => {
          if (result) console.log(`✅ WhatsApp order confirmation sent successfully`);
        })
        .catch(err => console.log('⚠️ WhatsApp confirmation failed:', err.message));
    } catch (waErr) {
      console.log('⚠️ Could not send WhatsApp confirmation:', waErr.message);
    }

    res.status(201).json({ 
      success: true, 
      message: "Order created successfully",
      order 
    });
  } catch (error) {
    console.error("\n❌ CREATE ORDER ERROR:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    
    // 🔥 FIX: Detect duplicate orderId from either error code OR error message
    const isDuplicateOrderId = (error.code === 11000 && error.keyPattern?.orderId) ||
      (error.message && error.message.includes('Order ID already exists'));
    
    if (isDuplicateOrderId) {
      // Track retry count to prevent infinite recursion
      req._orderRetryCount = (req._orderRetryCount || 0) + 1;
      console.log(`⚠️ Duplicate orderId, retry attempt ${req._orderRetryCount}/5...`);
      
      if (req._orderRetryCount <= 5) {
        return createOrder(req, res);
      }
      
      return res.status(500).json({ 
        success: false, 
        message: "Failed to generate unique Order ID after multiple attempts. Please try again."
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'unknown';
      return res.status(400).json({ 
        success: false, 
        message: `Duplicate ${field}. Please try again.`
      });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 3. GET ALL ORDERS
// ============================================
export const getAllOrders = async (req, res) => {
  console.log("\n📋 ===== GET ALL ORDERS =====");
  
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      paymentStatus,
      timeFilter = "all",
      startDate,
      endDate,
    } = req.query;

    let query = { isActive: true };

    if (search) {
      const customerIds = await Customer.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).distinct('_id');
      
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customer: { $in: customerIds } }
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (paymentStatus && paymentStatus !== "all") {
      query['paymentSummary.paymentStatus'] = paymentStatus;
    }

    const now = new Date();
    if (timeFilter !== "all") {
      let filterDate = new Date();
      if (timeFilter === "week") filterDate.setDate(now.getDate() - 7);
      else if (timeFilter === "month") filterDate.setMonth(now.getMonth() - 1);
      else if (timeFilter === "3m") filterDate.setMonth(now.getMonth() - 3);
      
      query.createdAt = { $gte: filterDate };
    }

    if (startDate && endDate) {
      query.createdAt = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('customer', 'name phone customerId')
      .populate("garments")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ 
      success: true, 
      orders, 
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total, 
        pages: Math.ceil(total / limit) 
      } 
    });
  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 4. GET ORDER BY ID
// ============================================
export const getOrderById = async (req, res) => {
  console.log(`\n🔍 ===== GET ORDER BY ID: ${req.params.id} =====`);
  
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

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const payments = await Payment.find({ 
      order: order._id,
      isDeleted: false 
    })
    .populate('receivedBy', 'name')
    .sort('-paymentDate -paymentTime');

    const works = await Work.find({ order: order._id, isActive: true })
      .populate('garment', 'name item category')
      .populate('cuttingMaster', 'name');

    res.json({ 
      success: true, 
      order,
      payments,
      works
    });
  } catch (error) {
    console.error("❌ Get order error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 5. UPDATE ORDER
// ============================================
export const updateOrder = async (req, res) => {
  console.log(`\n📝 ===== UPDATE ORDER: ${req.params.id} =====`);
  
  try {
    const { id } = req.params;
    const {
      deliveryDate,
      specialNotes,
      advancePayment,
      priceSummary,
      status,
      newGarments
    } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (deliveryDate) order.deliveryDate = deliveryDate;
    if (specialNotes !== undefined) order.specialNotes = specialNotes;
    
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
    
    res.json({ success: true, message: "Order updated successfully", order });
  } catch (error) {
    console.error("❌ Update error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 6. UPDATE ORDER STATUS
// ============================================
export const updateOrderStatus = async (req, res) => {
  console.log(`\n🔄 ===== UPDATE ORDER STATUS: ${req.params.id} =====`);
  
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    const validStatuses = ["draft", "confirmed", "in-progress", "ready-to-delivery", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    const order = await Order.findById(id)
      .populate('customer', 'name phone')
      .populate('garments');
      
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    const validTransitions = {
      'draft': ['confirmed', 'cancelled'],
      'confirmed': ['in-progress', 'cancelled'],
      'in-progress': ['ready-to-delivery', 'cancelled'],
      'ready-to-delivery': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };
    
    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot transition from ${order.status} to ${status}` 
      });
    }

    // 🔒 Delivery Lock: Prevent delivery if there is a due balance amount
    if (status === 'delivered') {
      const balance = Number(order.balanceAmount) || 0;
      const isBypassed = req.body.bypassDeliveryLock === true;
      
      if (balance > 0 && !isBypassed) {
        return res.status(400).json({
          success: false,
          deliveryLocked: true,
          message: `Delivery Blocked: Order #${order.orderId} has an outstanding balance of ₹${balance}. Please settle the remaining amount or request an admin override.`
        });
      }
      
      if (balance > 0 && isBypassed) {
        // Record bypass override inside Audit Logs
        const userId = req.user?.id || req.user?._id;
        try {
          const { default: billingEmitter } = await import('../services/billingEmitter.js');
          billingEmitter.emit("AUDIT_LOG", {
            action: "LOCK_BYPASS",
            user: userId,
            entityType: "Order",
            entityId: order._id,
            description: `Delivery lock manually bypassed by user for Order #${order.orderId} with outstanding balance: ₹${balance}`
          });
        } catch (auditErr) {
          console.error("⚠️ Failed to emit LOCK_BYPASS audit log:", auditErr.message);
        }
      }
    }
    
    const oldStatus = order.status;
    order.status = status;
    await order.save();
    
    console.log(`✅ Status updated: ${oldStatus} → ${status}`);

    if (status === 'ready-to-delivery' && oldStatus !== 'ready-to-delivery') {
      try {
        const { sendReadyToDeliver } = await import('./whatsapp.controller.js');
        sendReadyToDeliver(order._id)
          .catch(err => console.log('⚠️ Ready WhatsApp failed:', err.message));
      } catch (waErr) {
        console.log('⚠️ WhatsApp import error:', waErr.message);
      }
    }

    if (status === 'ready-to-delivery') {
      const storeKeepers = await StoreKeeper.find({ isActive: true }).lean();
      storeKeepers.forEach(keeper => {
        createNotification({
          type: 'delivery-ready',
          recipient: keeper._id,
          title: '📦 Order Ready for Delivery',
          message: `Order #${order.orderId} for ${order.customer?.name || 'Customer'} is ready for delivery`,
          reference: { orderId: order._id, orderNumber: order.orderId },
          priority: 'high'
        }).catch(() => {});
      });
    }
    else if (status === 'delivered') {
      await updateOrderPaymentSummary(order._id);
      
      const storeKeepers = await StoreKeeper.find({ isActive: true }).lean();
      storeKeepers.forEach(keeper => {
        createNotification({
          type: 'order-delivered',
          recipient: keeper._id,
          title: '✅ Order Delivered',
          message: `Order #${order.orderId} has been delivered`,
          reference: { orderId: order._id },
          priority: 'medium'
        }).catch(() => {});
      });
    }
    else if (status === 'cancelled') {
      await Work.updateMany(
        { order: order._id, status: { $ne: 'completed' } },
        { status: 'cancelled', isActive: false }
      );
    }

    try {
      if (status === 'in-progress') {
        await Work.updateMany(
          { order: order._id, status: 'pending' },
          { status: 'in-progress' }
        );
      }
      else if (status === 'delivered') {
        await Work.updateMany(
          { order: order._id, status: { $ne: 'completed' } },
          { status: 'completed' }
        );
      }
    } catch (workErr) {
      console.log("Work update error:", workErr.message);
    }
    
    const updatedOrder = await Order.findById(id)
      .populate('customer', 'name phone customerId')
      .populate('garments');
    
    res.json({ 
      success: true, 
      message: `Order status updated from ${oldStatus} to ${status}`,
      order: updatedOrder 
    });
    
  } catch (error) {
    console.error("❌ Update status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 7. DELETE ORDER (SOFT DELETE)
// ============================================
export const deleteOrder = async (req, res) => {
  console.log(`\n🗑️ ===== DELETE ORDER: ${req.params.id} =====`);
  
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    await Garment.updateMany({ _id: { $in: order.garments } }, { isActive: false });
    await Work.updateMany({ order: order._id }, { isActive: false });
    await Payment.updateMany({ order: order._id }, { isDeleted: true });
    await Transaction.updateMany({ order: order._id }, { status: 'cancelled' });

    order.isActive = false;
    await order.save();

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 8. ADD PAYMENT TO ORDER
// ============================================
export const addPaymentToOrder = async (req, res) => {
  console.log(`\n💰 ===== ADD PAYMENT TO ORDER: ${req.params.id} =====`);
  console.log("⏰ Timestamp:", new Date().toISOString());
  
  try {
    const { id } = req.params;
    const paymentData = req.body;
    
    console.log("\n📦 ===== PAYMENT DATA RECEIVED =====");
    console.log("📦 Payment amount:", paymentData.amount);
    console.log("📦 Payment type:", paymentData.type);
    console.log("📦 Payment method:", paymentData.method);
    
    console.log("\n🔍 ===== FETCHING ORDER =====");
    const order = await Order.findById(id).populate('customer');
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    console.log("\n✅ ===== ORDER FOUND =====");
    console.log("✅ Order Number:", order.orderId);
    
    const creatorId = req.user?._id || req.user?.id;
    
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const paymentTime = `${hours}:${minutes}:${seconds}`;
    
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
      receivedBy: creatorId
    });
    
    console.log("\n✅ ===== PAYMENT CREATED =====");
    console.log("✅ Payment Amount:", payment.amount);
    
    try {
      await createIncomeFromPayment(payment, order, creatorId);
      console.log("✅ Income created successfully");
    } catch (incomeErr) {
      console.log("⚠️ Income creation error:", incomeErr.message);
    }
    
    try {
      await updateOrderPaymentSummary(order._id);
      console.log("✅ Payment summary updated");
    } catch (summaryErr) {
      console.log("⚠️ Payment summary error:", summaryErr.message);
    }
    
    const paymentCount = await Payment.countDocuments({ 
      order: order._id,
      isDeleted: false 
    });
    
    const customerPhone = order.customer?.phone || order.customer?.whatsappNumber;
    
    if (customerPhone && paymentCount > 1) {
      try {
        const { sendPaymentReceived } = await import('./whatsapp.controller.js');
        sendPaymentReceived(order._id, payment)
          .catch(err => console.log('⚠️ Payment WhatsApp failed:', err.message));
        console.log('📨 Payment confirmation WhatsApp queued');
      } catch (waErr) {
        console.log('⚠️ WhatsApp import error:', waErr.message);
      }
    }
    
    res.status(201).json({ 
      success: true, 
      message: "Payment added and income created", 
      payment,
      debug: {
        paymentCount,
        hasPhone: !!customerPhone
      }
    });
    
  } catch (error) {
    console.error("\n❌❌❌ ===== ADD PAYMENT ERROR ===== ❌❌❌");
    console.error("❌ Error message:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 9. GET ORDER PAYMENTS
// ============================================
export const getOrderPayments = async (req, res) => {
  console.log(`\n💰 ===== GET ORDER PAYMENTS: ${req.params.id} =====`);
  
  try {
    const payments = await Payment.find({ 
      order: req.params.id,
      isDeleted: false 
    })
    .populate('receivedBy', 'name')
    .sort('-paymentDate -paymentTime');
    
    res.json({ success: true, payments });
  } catch (error) {
    console.error("❌ Get payments error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 10. GET DASHBOARD DATA
// ============================================
export const getDashboardData = async (req, res) => {
  console.log("\n📊 ===== GET DASHBOARD DATA =====");
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.find({
      createdAt: { $gte: today },
      isActive: true
    }).populate('customer', 'name');

    const pendingDeliveries = await Order.find({
      deliveryDate: { $lt: new Date() },
      status: { $nin: ['delivered', 'cancelled'] },
      isActive: true
    }).populate('customer', 'name phone');

    const readyForDelivery = await Order.find({
      status: 'ready-to-delivery',
      isActive: true
    }).populate('customer', 'name phone');

    const recentOrders = await Order.find({ isActive: true })
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const todayPayments = await Payment.find({
      paymentDate: { $gte: today },
      isDeleted: false
    });

    const todayCollection = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    const todayIncome = await Transaction.find({
      transactionDate: { $gte: today },
      type: 'income',
      status: 'completed'
    });

    const totalIncomeToday = todayIncome.reduce((sum, t) => sum + t.amount, 0);

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
          handCash: todayIncome.filter(t => t.accountType === 'hand-cash').reduce((sum, t) => sum + t.amount, 0),
          bank: todayIncome.filter(t => t.accountType === 'bank').reduce((sum, t) => sum + t.amount, 0)
        }
      }
    });
  } catch (error) {
    console.error("❌ Dashboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 11. GET ORDERS BY CUSTOMER
// ============================================
export const getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    console.log(`🔍 Fetching orders for customer: ${customerId}`);
    
    const orders = await Order.find({ 
      customer: customerId,
      isActive: true 
    })
    .populate('customer', 'name phone email customerId')
    .populate('garments')
    .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders
    });
    
  } catch (error) {
    console.error(`❌ Error fetching orders for customer:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// ✅ 12. GET READY TO DELIVERY ORDERS
// ============================================
export const getReadyToDeliveryOrders = async (req, res) => {
  console.log("\n📦 ===== GET READY TO DELIVERY ORDERS =====");
  
  try {
    const orders = await Order.find({ 
      status: 'ready-to-delivery',
      isActive: true 
    })
    .populate('customer', 'name phone')
    .populate('garments')
    .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("❌ Get ready to delivery error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 13. GET INCOME BY ORDER ID
// ============================================
export const getIncomeByOrder = async (req, res) => {
  console.log(`\n💰 ===== GET INCOME FOR ORDER: ${req.params.id} =====`);
  
  try {
    const incomes = await Transaction.find({
      order: req.params.id,
      type: 'income',
      status: 'completed'
    })
    .populate('customer', 'name phone')
    .sort('-transactionDate');
    
    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    
    res.json({
      success: true,
      count: incomes.length,
      totalIncome,
      incomes
    });
  } catch (error) {
    console.error("❌ Get income error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 14. GET ORDER STATS FOR DASHBOARD
// ============================================
export const getOrderStatsForDashboard = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    let dateFilter = { isActive: true };
    
    if (period === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      dateFilter.orderDate = {
        $gte: today,
        $lt: tomorrow
      };
    } 
    else if (period === 'week') {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      dateFilter.orderDate = {
        $gte: startOfWeek,
        $lt: endOfWeek
      };
    }
    else if (period === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      dateFilter.orderDate = {
        $gte: startOfMonth,
        $lte: endOfMonth
      };
    }
    else if (startDate && endDate) {
      dateFilter.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    const totalOrdersInRange = await Order.countDocuments(dateFilter);

    const pendingOrders = await Order.countDocuments({ 
      ...dateFilter,
      status: 'confirmed'
    });
    
    const cuttingOrders = await Order.countDocuments({ 
      ...dateFilter,
      status: 'in-progress'
    });
    
    const readyOrders = await Order.countDocuments({ 
      ...dateFilter,
      status: 'ready-to-delivery'
    });
    
    const deliveredOrders = await Order.countDocuments({ 
      ...dateFilter,
      status: 'delivered'
    });

    const cancelledOrders = await Order.countDocuments({ 
      ...dateFilter,
      status: 'cancelled'
    });

    const draftOrders = await Order.countDocuments({ 
      ...dateFilter,
      status: 'draft'
    });

    const stats = {
      total: totalOrdersInRange,
      pending: pendingOrders,
      cutting: cuttingOrders,
      stitching: cuttingOrders,
      ready: readyOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
      draft: draftOrders,
      confirmed: pendingOrders,
      'in-progress': cuttingOrders,
      'ready-to-delivery': readyOrders
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ ERROR in getOrderStatsForDashboard:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
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
      dateFilter.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter.orderDate = { $gte: thirtyDaysAgo };
    }

    const orders = await Order.find(dateFilter)
      .populate('customer', 'name phone')
      .populate('garments', 'name type quantity')
      .sort({ orderDate: -1 })
      .limit(parseInt(limit));

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderId: order.orderId,
      orderDate: order.orderDate,
      customer: order.customer ? {
        _id: order.customer._id,
        name: order.customer.name,
        phone: order.customer.phone
      } : null,
      garments: order.garments?.map(g => ({
        name: g.name,
        type: g.type,
        quantity: g.quantity
      })) || [],
      deliveryDate: order.deliveryDate,
      status: order.status,
      totalAmount: order.priceSummary?.totalMax || 0,
      paidAmount: order.paymentSummary?.totalPaid || 0,
      balanceAmount: order.balanceAmount || 0,
      paymentStatus: order.paymentSummary?.paymentStatus || 'pending'
    }));

    res.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length,
      filter: { startDate, endDate, period }
    });

  } catch (error) {
    console.error("❌ Recent orders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 16. GET FILTERED ORDERS
// ============================================
export const getFilteredOrders = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      period,
      status,
      page = 1,
      limit = 20
    } = req.query;

    let filter = { isActive: true };
    
    if (startDate && endDate) {
      filter.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(filter)
      .populate('customer', 'name phone')
      .populate('garments', 'name type quantity price')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Order.countDocuments(filter);

    const summary = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $ifNull: ["$finalizedAmount", "$priceSummary.totalMax"] } },
          totalPaid: { $sum: '$paymentSummary.totalPaid' },
          pendingAmount: { $sum: '$balanceAmount' },
          avgOrderValue: { $avg: { $ifNull: ["$finalizedAmount", "$priceSummary.totalMax"] } }
        }
      }
    ]);

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderId: order.orderId,
      orderDate: order.orderDate,
      customer: order.customer,
      garments: order.garments,
      garmentCount: order.garments?.length || 0,
      deliveryDate: order.deliveryDate,
      status: order.status,
      totalAmount: order.priceSummary?.totalMax || 0,
      paidAmount: order.paymentSummary?.totalPaid || 0,
      balanceAmount: order.balanceAmount || 0,
      paymentStatus: order.paymentSummary?.paymentStatus || 'pending'
    }));

    res.json({
      success: true,
      orders: formattedOrders,
      summary: summary[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        totalPaid: 0,
        pendingAmount: 0,
        avgOrderValue: 0
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      },
      filter: { startDate, endDate, period, status }
    });

  } catch (error) {
    console.error("❌ Filtered orders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ✅ 17. GET ORDER DATES (for green dots)
// ============================================
export const getOrderDates = async (req, res) => {
  console.log("\n🟢 ===== GET ORDER DATES =====");
  console.log("Query params:", req.query);
  
  try {
    const { month, year, type = 'order' } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ 
        success: false, 
        message: "Month and year are required" 
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    const dateField = type === 'order' ? 'orderDate' : 'deliveryDate';

    const orderDates = await Order.aggregate([
      {
        $match: {
          [dateField]: { 
            $gte: startDate, 
            $lte: endDate 
          },
          status: { $ne: 'cancelled' },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    const dates = orderDates.map(item => item.date);

    res.json({
      success: true,
      dates: dates,
      details: orderDates,
      month: monthNum,
      year: yearNum,
      type: type
    });

  } catch (error) {
    console.error("❌ Error in getOrderDates:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// ✅ 18. GET DELIVERY DATES FOR CALENDAR
// ============================================
export const getDeliveryDatesForCalendar = async (req, res) => {
  console.log("\n🟢 ===== GET DELIVERY DATES FOR CALENDAR =====");
  
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required"
      });
    }

    const monthNum = parseInt(month) - 1;
    const yearNum = parseInt(year);

    const deliveryData = await Order.getDeliveryCalendar(monthNum, yearNum);

    res.json({
      success: true,
      allDates: deliveryData.data,
      month: parseInt(month),
      year: yearNum
    });

  } catch (error) {
    console.error("❌ Error in getDeliveryDatesForCalendar:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// ✅ 19. GET SIMPLE DELIVERY DATES (with counts)
// ============================================
export const getSimpleDeliveryDates = async (req, res) => {
  console.log("\n🟢 ===== GET SIMPLE DELIVERY DATES =====");
  
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required"
      });
    }

    const monthNum = parseInt(month) - 1;
    const yearNum = parseInt(year);

    const counts = await Order.getDeliveryCountsByDay(monthNum, yearNum);

    const formattedDates = counts.map(item => ({
      _id: `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`,
      count: item.count
    }));

    res.json({
      success: true,
      allDates: formattedDates
    });

  } catch (error) {
    console.error("❌ Error in getSimpleDeliveryDates:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};