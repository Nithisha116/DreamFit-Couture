// // controllers/garment.controller.js
// import Garment from "../models/Garment.js";
// import Work from "../models/Work.js";
// // import User from "../models/User.js"; // ❌ REMOVE THIS - Not needed
// import CuttingMaster from "../models/CuttingMaster.js"; // ✅ ADD THIS
// import Order from "../models/Order.js";
// import r2Service from "../services/r2.service.js";
// import mongoose from "mongoose";
// import { createNotification } from './notification.controller.js'; // ✅ ADD THIS

// // ===== CREATE GARMENT =====
// export const createGarment = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const {
//       name,
//       category,
//       item,
//       measurementTemplate,
//       measurementSource,
//       measurements,
//       additionalInfo,
//       estimatedDelivery,
//       priority,
//       priceRange,
//       createdBy,
//     } = req.body;

//     console.log("📝 Creating garment with data:", {
//       orderId,
//       name,
//       category,
//       item,
//       createdBy: createdBy || req.body.createdBy || req.user?.id,
//     });

//     // ✅ CRITICAL: Log what files are received
//     console.log("📸 Files received:", {
//       referenceImages: req.files?.referenceImages?.length || 0,
//       customerImages: req.files?.customerImages?.length || 0,
//       customerClothImages: req.files?.customerClothImages?.length || 0,
//     });

//     // Initialize image arrays
//     let referenceImages = [];
//     let customerImages = [];
//     let customerClothImages = [];

//     // ✅ Upload reference images to R2
//     if (req.files?.referenceImages && req.files.referenceImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.referenceImages.length} reference images`);
//       for (const file of req.files.referenceImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           referenceImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // ✅ Upload customer digital images to R2
//     if (req.files?.customerImages && req.files.customerImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.customerImages.length} customer images`);
//       for (const file of req.files.customerImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer'
//         );
//         if (upload.success) {
//           customerImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // ✅ Upload customer cloth images to R2
//     if (req.files?.customerClothImages && req.files.customerClothImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.customerClothImages.length} cloth images`);
//       for (const file of req.files.customerClothImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/cloth'
//         );
//         if (upload.success) {
//           customerClothImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // Parse measurements if provided as string
//     let parsedMeasurements = measurements;
//     if (typeof measurements === 'string') {
//       try {
//         parsedMeasurements = JSON.parse(measurements);
//       } catch (e) {
//         console.error("Error parsing measurements:", e);
//       }
//     }

//     // Parse priceRange if provided as string
//     let parsedPriceRange = priceRange;
//     if (typeof priceRange === 'string') {
//       try {
//         parsedPriceRange = JSON.parse(priceRange);
//       } catch (e) {
//         console.error("Error parsing priceRange:", e);
//       }
//     }

//     // Get the user ID - try multiple sources
//     const userId = createdBy || req.body.createdBy || req.user?.id || req.user?._id;
    
//     if (!userId) {
//       return res.status(400).json({ 
//         message: "createdBy is required for garment creation" 
//       });
//     }

//     console.log("👤 Using userId for garment:", userId);

//     // ✅ Create garment with all image arrays
//     const garment = new Garment({
//       order: orderId,
//       name,
//       category,
//       item,
//       measurementTemplate: measurementTemplate || null,
//       measurementSource: measurementSource || "template",
//       measurements: parsedMeasurements || [],
//       referenceImages,      // ✅ This will be saved to database
//       customerImages,       // ✅ This will be saved to database
//       customerClothImages,  // ✅ This will be saved to database
//       additionalInfo,
//       estimatedDelivery,
//       priority: priority || "normal",
//       priceRange: parsedPriceRange || { min: 0, max: 0 },
//     });

//     console.log("💾 Saving garment with images:", {
//       referenceImages: referenceImages.length,
//       customerImages: customerImages.length,
//       customerClothImages: customerClothImages.length,
//     });

//     await garment.save();
    
//     console.log("✅ Garment created with ID:", garment._id);
//     console.log("📸 Images saved in database:", {
//       reference: garment.referenceImages.length,
//       customer: garment.customerImages.length,
//       cloth: garment.customerClothImages.length,
//     });

//     // ===== SMART ASSIGNMENT LOGIC =====
//     console.log("🔍 Searching for cutting masters in CuttingMaster model...");
//     const cuttingMasters = await CuttingMaster.find({ isActive: true });
//     console.log(`✅ Found ${cuttingMasters.length} cutting masters`);

//     // Generate work ID
//     const date = new Date();
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     const workCount = await Work.countDocuments();
//     const sequential = String(workCount + 1).padStart(4, '0');
//     const garmentPrefix = garment.name?.substring(0, 4).toUpperCase() || 'WRK';
//     const workId = `${garmentPrefix}-${day}${month}${year}-${sequential}`;

//     // Base work data
//     const workData = {
//       workId,
//       order: orderId,
//       garment: garment._id,
//       status: "pending",
//       createdBy: userId,
//       estimatedDelivery: estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000)
//     };

//     if (cuttingMasters.length === 0) {
//       // Case 1: No cutting masters
//       console.log("⚠️ No cutting masters found - creating work without assignment");
      
//       const work = await Work.create(workData);
//       console.log(`✅ Work created without assignment. ID: ${work._id}`);
      
//       garment.workId = work._id;
//       await garment.save();
      
//     } else if (cuttingMasters.length === 1) {
//       // Case 2: Single cutting master - AUTO-ASSIGN
//       console.log(`✅ Single cutting master found - AUTO-ASSIGNING to ${cuttingMasters[0].name}`);
      
//       workData.cuttingMaster = cuttingMasters[0]._id;
//       const work = await Work.create(workData);
//       console.log(`✅ Work created and AUTO-ASSIGNED! ID: ${work._id}`);
//       console.log(`✂️ Assigned to: ${cuttingMasters[0].name}`);
      
//       garment.workId = work._id;
//       await garment.save();
      
//       // Notify the assigned cutting master
//       await createNotification({
//         type: 'work-assigned',
//         recipient: cuttingMasters[0]._id,
//         title: 'New Work Auto-Assigned',
//         message: `New work for ${garment.name} has been assigned to you`,
//         reference: {
//           orderId: orderId,
//           workId: work._id,
//           garmentId: garment._id
//         },
//         priority: 'high'
//       });
      
//     } else {
//       // Case 3: Multiple cutting masters - create WITHOUT assignment (manual later)
//       console.log(`✅ Multiple cutting masters found (${cuttingMasters.length}) - creating work for manual assignment`);
      
//       const work = await Work.create(workData);
//       console.log(`✅ Work created without assignment. ID: ${work._id}`);
//       console.log(`👉 Work needs manual assignment to a cutting master`);
      
//       garment.workId = work._id;
//       await garment.save();
      
//       // Notify ALL cutting masters about work needing assignment
//       for (const master of cuttingMasters) {
//         await createNotification({
//           type: 'work-pending-assignment',
//           recipient: master._id,
//           title: 'New Work - Needs Assignment',
//           message: `New work for ${garment.name} needs a cutting master`,
//           reference: {
//             orderId: orderId,
//             workId: work._id,
//             garmentId: garment._id
//           },
//           priority: 'high'
//         });
//       }
//     }

//     // Add garment to order
//     await Order.findByIdAndUpdate(orderId, {
//       $push: { garments: garment._id }
//     });
//     console.log("✅ Garment added to order");

//     await garment.populate([
//       { path: "category", select: "name" },
//       { path: "item", select: "name" },
//       { path: "measurementTemplate", select: "name" },
//       { path: "workId" },
//     ]);

//     console.log("✅ Garment fully created and populated");

//     res.status(201).json({
//       message: "Garment created successfully",
//       garment
//     });
//   } catch (error) {
//     console.error("❌ Create garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET GARMENTS BY ORDER =====
// export const getGarmentsByOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     const garments = await Garment.find({ 
//       order: orderId,
//       isActive: true 
//     })
//       .populate("category", "name")
//       .populate("item", "name")
//       .populate("measurementTemplate", "name")
//       .populate("workId")
//       .sort({ createdAt: -1 });

//     console.log(`📦 Found ${garments.length} garments for order ${orderId}`);
//     garments.forEach(g => {
//       console.log(`🎨 Garment ${g.garmentId}:`, {
//         referenceImages: g.referenceImages?.length || 0,
//         customerImages: g.customerImages?.length || 0,
//         customerClothImages: g.customerClothImages?.length || 0
//       });
//     });

//     res.json(garments);
//   } catch (error) {
//     console.error("Get garments by order error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET GARMENT BY ID =====
// export const getGarmentById = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id)
//       .populate("category", "name")
//       .populate("item", "name")
//       .populate("measurementTemplate", "name")
//       .populate("workId")
//       .populate({
//         path: "order",
//         select: "orderId customer",
//         populate: { path: "customer", select: "name phone customerId" }
//       });

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     res.json(garment);
//   } catch (error) {
//     console.error("Get garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE GARMENT =====
// export const updateGarment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("📝 Updating garment:", id);
//     console.log("📦 Request body:", req.body);
//     console.log("📸 Request files:", req.files);

//     const garment = await Garment.findById(id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Parse JSON fields from FormData
//     let {
//       name,
//       category,
//       item,
//       measurementTemplate,
//       measurementSource,
//       measurements,
//       additionalInfo,
//       estimatedDelivery,
//       priority,
//       priceRange,
//       status,
//       existingReferenceImages,
//       existingCustomerImages,
//       existingClothImages
//     } = req.body;

//     // Parse JSON strings if they came from FormData
//     if (measurements && typeof measurements === 'string') {
//       try {
//         measurements = JSON.parse(measurements);
//       } catch (e) {
//         console.error("Error parsing measurements:", e);
//       }
//     }

//     if (priceRange && typeof priceRange === 'string') {
//       try {
//         priceRange = JSON.parse(priceRange);
//       } catch (e) {
//         console.error("Error parsing priceRange:", e);
//       }
//     }

//     // Parse existing image keys
//     let keepReferenceKeys = [];
//     let keepCustomerKeys = [];
//     let keepClothKeys = [];

//     if (existingReferenceImages && typeof existingReferenceImages === 'string') {
//       try {
//         keepReferenceKeys = JSON.parse(existingReferenceImages);
//       } catch (e) {
//         console.error("Error parsing existingReferenceImages:", e);
//       }
//     }

//     if (existingCustomerImages && typeof existingCustomerImages === 'string') {
//       try {
//         keepCustomerKeys = JSON.parse(existingCustomerImages);
//       } catch (e) {
//         console.error("Error parsing existingCustomerImages:", e);
//       }
//     }

//     if (existingClothImages && typeof existingClothImages === 'string') {
//       try {
//         keepClothKeys = JSON.parse(existingClothImages);
//       } catch (e) {
//         console.error("Error parsing existingClothImages:", e);
//       }
//     }

//     // Update basic fields
//     if (name) garment.name = name;
//     if (category) garment.category = category;
//     if (item) garment.item = item;
//     if (measurementTemplate) garment.measurementTemplate = measurementTemplate;
//     if (measurementSource) garment.measurementSource = measurementSource;
//     if (measurements) garment.measurements = measurements;
//     if (additionalInfo !== undefined) garment.additionalInfo = additionalInfo;
//     if (estimatedDelivery) garment.estimatedDelivery = estimatedDelivery;
//     if (priority) garment.priority = priority;
//     if (priceRange) garment.priceRange = priceRange;
//     if (status) garment.status = status;

//     // Handle images - keep only those not deleted
//     if (keepReferenceKeys.length > 0) {
//       garment.referenceImages = garment.referenceImages.filter(img => 
//         keepReferenceKeys.includes(img.key)
//       );
//     } else {
//       garment.referenceImages = []; // Remove all if none to keep
//     }

//     if (keepCustomerKeys.length > 0) {
//       garment.customerImages = garment.customerImages.filter(img => 
//         keepCustomerKeys.includes(img.key)
//       );
//     } else {
//       garment.customerImages = [];
//     }

//     if (keepClothKeys.length > 0) {
//       garment.customerClothImages = garment.customerClothImages.filter(img => 
//         keepClothKeys.includes(img.key)
//       );
//     } else {
//       garment.customerClothImages = [];
//     }

//     // Upload new reference images
//     if (req.files?.referenceImages) {
//       for (const file of req.files.referenceImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           garment.referenceImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     // Upload new customer images
//     if (req.files?.customerImages) {
//       for (const file of req.files.customerImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer'
//         );
//         if (upload.success) {
//           garment.customerImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     // Upload new cloth images
//     if (req.files?.customerClothImages) {
//       for (const file of req.files.customerClothImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/cloth'
//         );
//         if (upload.success) {
//           garment.customerClothImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     await garment.save();
//     console.log("✅ Garment updated successfully");

//     res.json({
//       message: "Garment updated successfully",
//       garment
//     });

//   } catch (error) {
//     console.error("❌ Update garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE GARMENT =====
// export const deleteGarment = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Delete images from R2
//     for (const img of garment.referenceImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }
//     for (const img of garment.customerImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }
//     for (const img of garment.customerClothImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }

//     // Delete associated work
//     if (garment.workId) {
//       await Work.findByIdAndUpdate(garment.workId, { isActive: false });
//     }

//     // Remove garment from order
//     await Order.findByIdAndUpdate(garment.order, {
//       $pull: { garments: garment._id }
//     });

//     garment.isActive = false;
//     await garment.save();

//     res.json({ message: "Garment deleted successfully" });
//   } catch (error) {
//     console.error("Delete garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE GARMENT IMAGES =====
// export const updateGarmentImages = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     let referenceImages = [...garment.referenceImages];
//     let customerImages = [...garment.customerImages];
//     let customerClothImages = [...(garment.customerClothImages || [])];

//     // Upload new reference images
//     if (req.files?.referenceImages) {
//       for (const file of req.files.referenceImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           referenceImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     // Upload new customer digital images
//     if (req.files?.customerImages) {
//       for (const file of req.files.customerImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer-digital'
//         );
//         if (upload.success) {
//           customerImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     // Upload new customer cloth images
//     if (req.files?.customerClothImages) {
//       for (const file of req.files.customerClothImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer-cloth'
//         );
//         if (upload.success) {
//           customerClothImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     garment.referenceImages = referenceImages;
//     garment.customerImages = customerImages;
//     garment.customerClothImages = customerClothImages;
//     await garment.save();

//     res.json({
//       message: "Garment images updated successfully",
//       garment
//     });
//   } catch (error) {
//     console.error("Update garment images error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE GARMENT IMAGE =====
// export const deleteGarmentImage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { imageKey, imageType } = req.body;

//     const garment = await Garment.findById(id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Delete from R2
//     await r2Service.deleteFile(imageKey);

//     // Remove from appropriate array
//     if (imageType === 'reference') {
//       garment.referenceImages = garment.referenceImages.filter(
//         img => img.key !== imageKey
//       );
//     } else if (imageType === 'customer') {
//       garment.customerImages = garment.customerImages.filter(
//         img => img.key !== imageKey
//       );
//     } else if (imageType === 'customerCloth') {
//       garment.customerClothImages = garment.customerClothImages.filter(
//         img => img.key !== imageKey
//       );
//     }

//     await garment.save();

//     res.json({ message: "Image deleted successfully" });
//   } catch (error) {
//     console.error("Delete garment image error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };




// // controllers/garment.controller.js
// import Garment from "../models/Garment.js";
// import Work from "../models/Work.js";
// import CuttingMaster from "../models/CuttingMaster.js";
// import Order from "../models/Order.js";
// import r2Service from "../services/r2.service.js";
// import mongoose from "mongoose";
// import { createNotification } from './notification.controller.js';

// // ===== CREATE GARMENT =====
// export const createGarment = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const {
//       name,
//       category,
//       item,
//       measurementTemplate,
//       measurementSource,
//       measurements,
//       additionalInfo,
//       estimatedDelivery,
//       priority,
//       priceRange,
//       createdBy,
//     } = req.body;

//     console.log("📝 Creating garment with data:", {
//       orderId,
//       name,
//       category,
//       item,
//       createdBy: createdBy || req.body.createdBy || req.user?.id,
//     });

//     // ✅ CRITICAL: Log what files are received
//     console.log("📸 Files received:", {
//       referenceImages: req.files?.referenceImages?.length || 0,
//       customerImages: req.files?.customerImages?.length || 0,
//       customerClothImages: req.files?.customerClothImages?.length || 0,
//     });

//     // Initialize image arrays
//     let referenceImages = [];
//     let customerImages = [];
//     let customerClothImages = [];

//     // ✅ Upload reference images to R2
//     if (req.files?.referenceImages && req.files.referenceImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.referenceImages.length} reference images`);
//       for (const file of req.files.referenceImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           referenceImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // ✅ Upload customer digital images to R2
//     if (req.files?.customerImages && req.files.customerImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.customerImages.length} customer images`);
//       for (const file of req.files.customerImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer'
//         );
//         if (upload.success) {
//           customerImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // ✅ Upload customer cloth images to R2
//     if (req.files?.customerClothImages && req.files.customerClothImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.customerClothImages.length} cloth images`);
//       for (const file of req.files.customerClothImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/cloth'
//         );
//         if (upload.success) {
//           customerClothImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // Parse measurements if provided as string
//     let parsedMeasurements = measurements;
//     if (typeof measurements === 'string') {
//       try {
//         parsedMeasurements = JSON.parse(measurements);
//       } catch (e) {
//         console.error("Error parsing measurements:", e);
//       }
//     }

//     // Parse priceRange if provided as string
//     let parsedPriceRange = priceRange;
//     if (typeof priceRange === 'string') {
//       try {
//         parsedPriceRange = JSON.parse(priceRange);
//       } catch (e) {
//         console.error("Error parsing priceRange:", e);
//       }
//     }

//     // Get the user ID - try multiple sources
//     const userId = createdBy || req.body.createdBy || req.user?.id || req.user?._id;
    
//     if (!userId) {
//       return res.status(400).json({ 
//         message: "createdBy is required for garment creation" 
//       });
//     }

//     console.log("👤 Using userId for garment:", userId);

//     // ✅ Create garment with all image arrays
//     const garment = new Garment({
//       order: orderId,
//       name,
//       category,
//       item,
//       measurementTemplate: measurementTemplate || null,
//       measurementSource: measurementSource || "template",
//       measurements: parsedMeasurements || [],
//       referenceImages,      // ✅ This will be saved to database
//       customerImages,       // ✅ This will be saved to database
//       customerClothImages,  // ✅ This will be saved to database
//       additionalInfo,
//       estimatedDelivery,
//       priority: priority || "normal",
//       priceRange: parsedPriceRange || { min: 0, max: 0 },
//     });

//     console.log("💾 Saving garment with images:", {
//       referenceImages: referenceImages.length,
//       customerImages: customerImages.length,
//       customerClothImages: customerClothImages.length,
//     });

//     await garment.save();
    
//     console.log("✅ Garment created with ID:", garment._id);
//     console.log("📸 Images saved in database:", {
//       reference: garment.referenceImages.length,
//       customer: garment.customerImages.length,
//       cloth: garment.customerClothImages.length,
//     });

//     // ===== SMART ASSIGNMENT LOGIC =====
//     console.log("🔍 Searching for cutting masters in CuttingMaster model...");
//     const cuttingMasters = await CuttingMaster.find({ isActive: true });
//     console.log(`✅ Found ${cuttingMasters.length} cutting masters`);

//     // Generate work ID
//     const date = new Date();
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     const workCount = await Work.countDocuments();
//     const sequential = String(workCount + 1).padStart(4, '0');
//     const garmentPrefix = garment.name?.substring(0, 4).toUpperCase() || 'WRK';
//     const workId = `${garmentPrefix}-${day}${month}${year}-${sequential}`;

//     // Base work data
//     const workData = {
//       workId,
//       order: orderId,
//       garment: garment._id,
//       status: "pending",
//       createdBy: userId,
//       estimatedDelivery: estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000)
//     };

//     if (cuttingMasters.length === 0) {
//       // Case 1: No cutting masters
//       console.log("⚠️ No cutting masters found - creating work without assignment");
      
//       const work = await Work.create(workData);
//       console.log(`✅ Work created without assignment. ID: ${work._id}`);
      
//       garment.workId = work._id;
//       await garment.save();
      
//     } else if (cuttingMasters.length === 1) {
//       // Case 2: Single cutting master - AUTO-ASSIGN
//       console.log(`✅ Single cutting master found - AUTO-ASSIGNING to ${cuttingMasters[0].name}`);
      
//       workData.cuttingMaster = cuttingMasters[0]._id;
//       const work = await Work.create(workData);
//       console.log(`✅ Work created and AUTO-ASSIGNED! ID: ${work._id}`);
//       console.log(`✂️ Assigned to: ${cuttingMasters[0].name}`);
      
//       garment.workId = work._id;
//       await garment.save();
      
//       // ✅ FIXED: Notify the assigned cutting master with correct recipientModel
//       console.log(`🔔 Creating notification for cutting master: ${cuttingMasters[0].name}`);
//       console.log(`   Recipient ID: ${cuttingMasters[0]._id}`);
//       console.log(`   Recipient Model: CuttingMaster`);
      
//       await createNotification({
//         type: 'work-assigned',
//         recipient: cuttingMasters[0]._id,
//         recipientModel: 'CuttingMaster',  // ✅ CRITICAL: Set correct model!
//         title: 'New Work Auto-Assigned',
//         message: `New work for ${garment.name} has been assigned to you`,
//         reference: {
//           orderId: orderId,
//           workId: work._id,
//           garmentId: garment._id
//         },
//         priority: 'high'
//       });
      
//     } else {
//       // Case 3: Multiple cutting masters - create WITHOUT assignment (manual later)
//       console.log(`✅ Multiple cutting masters found (${cuttingMasters.length}) - creating work for manual assignment`);
      
//       const work = await Work.create(workData);
//       console.log(`✅ Work created without assignment. ID: ${work._id}`);
//       console.log(`👉 Work needs manual assignment to a cutting master`);
      
//       garment.workId = work._id;
//       await garment.save();
      
//       // Notify ALL cutting masters about work needing assignment
//       for (const master of cuttingMasters) {
//         console.log(`🔔 Notifying cutting master: ${master.name}`);
        
//         await createNotification({
//           type: 'work-pending-assignment',
//           recipient: master._id,
//           recipientModel: 'CuttingMaster',  // ✅ CRITICAL: Set correct model!
//           title: 'New Work - Needs Assignment',
//           message: `New work for ${garment.name} needs a cutting master`,
//           reference: {
//             orderId: orderId,
//             workId: work._id,
//             garmentId: garment._id
//           },
//           priority: 'high'
//         });
//       }
//     }

//     // Add garment to order
//     await Order.findByIdAndUpdate(orderId, {
//       $push: { garments: garment._id }
//     });
//     console.log("✅ Garment added to order");

//     await garment.populate([
//       { path: "category", select: "name" },
//       { path: "item", select: "name" },
//       { path: "measurementTemplate", select: "name" },
//       { path: "workId" },
//     ]);

//     console.log("✅ Garment fully created and populated");

//     res.status(201).json({
//       message: "Garment created successfully",
//       garment
//     });
//   } catch (error) {
//     console.error("❌ Create garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET GARMENTS BY ORDER =====
// export const getGarmentsByOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     const garments = await Garment.find({ 
//       order: orderId,
//       isActive: true 
//     })
//       .populate("category", "name")
//       .populate("item", "name")
//       .populate("measurementTemplate", "name")
//       .populate("workId")
//       .sort({ createdAt: -1 });

//     console.log(`📦 Found ${garments.length} garments for order ${orderId}`);
//     garments.forEach(g => {
//       console.log(`🎨 Garment ${g.garmentId}:`, {
//         referenceImages: g.referenceImages?.length || 0,
//         customerImages: g.customerImages?.length || 0,
//         customerClothImages: g.customerClothImages?.length || 0
//       });
//     });

//     res.json(garments);
//   } catch (error) {
//     console.error("Get garments by order error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET GARMENT BY ID =====
// export const getGarmentById = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id)
//       .populate("category", "name")
//       .populate("item", "name")
//       .populate("measurementTemplate", "name")
//       .populate("workId")
//       .populate({
//         path: "order",
//         select: "orderId customer",
//         populate: { path: "customer", select: "name phone customerId" }
//       });

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     res.json(garment);
//   } catch (error) {
//     console.error("Get garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE GARMENT =====
// export const updateGarment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("📝 Updating garment:", id);
//     console.log("📦 Request body:", req.body);
//     console.log("📸 Request files:", req.files);

//     const garment = await Garment.findById(id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Parse JSON fields from FormData
//     let {
//       name,
//       category,
//       item,
//       measurementTemplate,
//       measurementSource,
//       measurements,
//       additionalInfo,
//       estimatedDelivery,
//       priority,
//       priceRange,
//       status,
//       existingReferenceImages,
//       existingCustomerImages,
//       existingClothImages
//     } = req.body;

//     // Parse JSON strings if they came from FormData
//     if (measurements && typeof measurements === 'string') {
//       try {
//         measurements = JSON.parse(measurements);
//       } catch (e) {
//         console.error("Error parsing measurements:", e);
//       }
//     }

//     if (priceRange && typeof priceRange === 'string') {
//       try {
//         priceRange = JSON.parse(priceRange);
//       } catch (e) {
//         console.error("Error parsing priceRange:", e);
//       }
//     }

//     // Parse existing image keys
//     let keepReferenceKeys = [];
//     let keepCustomerKeys = [];
//     let keepClothKeys = [];

//     if (existingReferenceImages && typeof existingReferenceImages === 'string') {
//       try {
//         keepReferenceKeys = JSON.parse(existingReferenceImages);
//       } catch (e) {
//         console.error("Error parsing existingReferenceImages:", e);
//       }
//     }

//     if (existingCustomerImages && typeof existingCustomerImages === 'string') {
//       try {
//         keepCustomerKeys = JSON.parse(existingCustomerImages);
//       } catch (e) {
//         console.error("Error parsing existingCustomerImages:", e);
//       }
//     }

//     if (existingClothImages && typeof existingClothImages === 'string') {
//       try {
//         keepClothKeys = JSON.parse(existingClothImages);
//       } catch (e) {
//         console.error("Error parsing existingClothImages:", e);
//       }
//     }

//     // Update basic fields
//     if (name) garment.name = name;
//     if (category) garment.category = category;
//     if (item) garment.item = item;
//     if (measurementTemplate) garment.measurementTemplate = measurementTemplate;
//     if (measurementSource) garment.measurementSource = measurementSource;
//     if (measurements) garment.measurements = measurements;
//     if (additionalInfo !== undefined) garment.additionalInfo = additionalInfo;
//     if (estimatedDelivery) garment.estimatedDelivery = estimatedDelivery;
//     if (priority) garment.priority = priority;
//     if (priceRange) garment.priceRange = priceRange;
//     if (status) garment.status = status;

//     // Handle images - keep only those not deleted
//     if (keepReferenceKeys.length > 0) {
//       garment.referenceImages = garment.referenceImages.filter(img => 
//         keepReferenceKeys.includes(img.key)
//       );
//     } else {
//       garment.referenceImages = []; // Remove all if none to keep
//     }

//     if (keepCustomerKeys.length > 0) {
//       garment.customerImages = garment.customerImages.filter(img => 
//         keepCustomerKeys.includes(img.key)
//       );
//     } else {
//       garment.customerImages = [];
//     }

//     if (keepClothKeys.length > 0) {
//       garment.customerClothImages = garment.customerClothImages.filter(img => 
//         keepClothKeys.includes(img.key)
//       );
//     } else {
//       garment.customerClothImages = [];
//     }

//     // Upload new reference images
//     if (req.files?.referenceImages) {
//       for (const file of req.files.referenceImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           garment.referenceImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     // Upload new customer images
//     if (req.files?.customerImages) {
//       for (const file of req.files.customerImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer'
//         );
//         if (upload.success) {
//           garment.customerImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     // Upload new cloth images
//     if (req.files?.customerClothImages) {
//       for (const file of req.files.customerClothImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/cloth'
//         );
//         if (upload.success) {
//           garment.customerClothImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     await garment.save();
//     console.log("✅ Garment updated successfully");

//     res.json({
//       message: "Garment updated successfully",
//       garment
//     });

//   } catch (error) {
//     console.error("❌ Update garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE GARMENT =====
// export const deleteGarment = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Delete images from R2
//     for (const img of garment.referenceImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }
//     for (const img of garment.customerImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }
//     for (const img of garment.customerClothImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }

//     // Delete associated work
//     if (garment.workId) {
//       await Work.findByIdAndUpdate(garment.workId, { isActive: false });
//     }

//     // Remove garment from order
//     await Order.findByIdAndUpdate(garment.order, {
//       $pull: { garments: garment._id }
//     });

//     garment.isActive = false;
//     await garment.save();

//     res.json({ message: "Garment deleted successfully" });
//   } catch (error) {
//     console.error("Delete garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE GARMENT IMAGES =====
// export const updateGarmentImages = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     let referenceImages = [...garment.referenceImages];
//     let customerImages = [...garment.customerImages];
//     let customerClothImages = [...(garment.customerClothImages || [])];

//     // Upload new reference images
//     if (req.files?.referenceImages) {
//       for (const file of req.files.referenceImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           referenceImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     // Upload new customer digital images
//     if (req.files?.customerImages) {
//       for (const file of req.files.customerImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer-digital'
//         );
//         if (upload.success) {
//           customerImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     // Upload new customer cloth images
//     if (req.files?.customerClothImages) {
//       for (const file of req.files.customerClothImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer-cloth'
//         );
//         if (upload.success) {
//           customerClothImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     garment.referenceImages = referenceImages;
//     garment.customerImages = customerImages;
//     garment.customerClothImages = customerClothImages;
//     await garment.save();

//     res.json({
//       message: "Garment images updated successfully",
//       garment
//     });
//   } catch (error) {
//     console.error("Update garment images error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE GARMENT IMAGE =====
// export const deleteGarmentImage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { imageKey, imageType } = req.body;

//     const garment = await Garment.findById(id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Delete from R2
//     await r2Service.deleteFile(imageKey);

//     // Remove from appropriate array
//     if (imageType === 'reference') {
//       garment.referenceImages = garment.referenceImages.filter(
//         img => img.key !== imageKey
//       );
//     } else if (imageType === 'customer') {
//       garment.customerImages = garment.customerImages.filter(
//         img => img.key !== imageKey
//       );
//     } else if (imageType === 'customerCloth') {
//       garment.customerClothImages = garment.customerClothImages.filter(
//         img => img.key !== imageKey
//       );
//     }

//     await garment.save();

//     res.json({ message: "Image deleted successfully" });
//   } catch (error) {
//     console.error("Delete garment image error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };


// // controllers/garment.controller.js
// import Garment from "../models/Garment.js";
// import Work from "../models/Work.js";
// import CuttingMaster from "../models/CuttingMaster.js";
// import Order from "../models/Order.js";
// import r2Service from "../services/r2.service.js";
// import mongoose from "mongoose";
// import { createNotification } from './notification.controller.js';

// // ===== CREATE GARMENT =====
// export const createGarment = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const {
//       name,
//       category,
//       item,
//       measurementTemplate,
//       measurementSource,
//       measurements,
//       additionalInfo,
//       estimatedDelivery,
//       priority,
//       priceRange,
//       createdBy,
//     } = req.body;

//     console.log("📝 Creating garment with data:", {
//       orderId,
//       name,
//       category,
//       item,
//       createdBy: createdBy || req.body.createdBy || req.user?.id,
//     });

//     // ✅ CRITICAL: Log what files are received
//     console.log("📸 Files received:", {
//       referenceImages: req.files?.referenceImages?.length || 0,
//       customerImages: req.files?.customerImages?.length || 0,
//       customerClothImages: req.files?.customerClothImages?.length || 0,
//     });

//     // Initialize image arrays
//     let referenceImages = [];
//     let customerImages = [];
//     let customerClothImages = [];

//     // ✅ Upload reference images to R2
//     if (req.files?.referenceImages && req.files.referenceImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.referenceImages.length} reference images`);
//       for (const file of req.files.referenceImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           referenceImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // ✅ Upload customer digital images to R2
//     if (req.files?.customerImages && req.files.customerImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.customerImages.length} customer images`);
//       for (const file of req.files.customerImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer'
//         );
//         if (upload.success) {
//           customerImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // ✅ Upload customer cloth images to R2
//     if (req.files?.customerClothImages && req.files.customerClothImages.length > 0) {
//       console.log(`📸 Uploading ${req.files.customerClothImages.length} cloth images`);
//       for (const file of req.files.customerClothImages) {
//         console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/cloth'
//         );
//         if (upload.success) {
//           customerClothImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//           console.log(`   ✅ Uploaded: ${upload.url}`);
//         } else {
//           console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
//         }
//       }
//     }

//     // Parse measurements if provided as string
//     let parsedMeasurements = measurements;
//     if (typeof measurements === 'string') {
//       try {
//         parsedMeasurements = JSON.parse(measurements);
//       } catch (e) {
//         console.error("Error parsing measurements:", e);
//       }
//     }

//     // Parse priceRange if provided as string
//     let parsedPriceRange = priceRange;
//     if (typeof priceRange === 'string') {
//       try {
//         parsedPriceRange = JSON.parse(priceRange);
//       } catch (e) {
//         console.error("Error parsing priceRange:", e);
//       }
//     }

//     // Get the user ID - try multiple sources
//     const userId = createdBy || req.body.createdBy || req.user?.id || req.user?._id;
    
//     if (!userId) {
//       return res.status(400).json({ 
//         message: "createdBy is required for garment creation" 
//       });
//     }

//     console.log("👤 Using userId for garment:", userId);

//     // ✅ Create garment with all image arrays
//     const garment = new Garment({
//       order: orderId,
//       name,
//       category,
//       item,
//       measurementTemplate: measurementTemplate || null,
//       measurementSource: measurementSource || "template",
//       measurements: parsedMeasurements || [],
//       referenceImages,      // ✅ This will be saved to database
//       customerImages,       // ✅ This will be saved to database
//       customerClothImages,  // ✅ This will be saved to database
//       additionalInfo,
//       estimatedDelivery,
//       priority: priority || "normal",
//       priceRange: parsedPriceRange || { min: 0, max: 0 },
//     });

//     console.log("💾 Saving garment with images:", {
//       referenceImages: referenceImages.length,
//       customerImages: customerImages.length,
//       customerClothImages: customerClothImages.length,
//     });

//     await garment.save();
    
//     console.log("✅ Garment created with ID:", garment._id);
//     console.log("📸 Images saved in database:", {
//       reference: garment.referenceImages.length,
//       customer: garment.customerImages.length,
//       cloth: garment.customerClothImages.length,
//     });

//     // ===== OPEN POOL ASSIGNMENT LOGIC =====
//     console.log("🔍 Searching for cutting masters in CuttingMaster model...");
//     const cuttingMasters = await CuttingMaster.find({ isActive: true });
//     console.log(`✅ Found ${cuttingMasters.length} cutting masters`);

//     // Generate work ID
//     const date = new Date();
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     const workCount = await Work.countDocuments();
//     const sequential = String(workCount + 1).padStart(4, '0');
//     const garmentPrefix = garment.name?.substring(0, 4).toUpperCase() || 'WRK';
//     const workId = `${garmentPrefix}-${day}${month}${year}-${sequential}`;

//     // Base work data - OPEN POOL: cuttingMaster is null
//     const workData = {
//       workId,
//       order: orderId,
//       garment: garment._id,
//       status: "pending",
//       cuttingMaster: null, // ⭐ OPEN POOL - Not assigned to anyone
//       createdBy: userId,
//       estimatedDelivery: estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000)
//     };

//     // Create work (always without assignment for OPEN POOL)
//     const work = await Work.create(workData);
//     console.log(`✅ Work created (OPEN POOL). ID: ${work._id}`);
//     console.log(`👉 Available for any cutting master to accept`);
    
//     garment.workId = work._id;
//     await garment.save();

//     // 🔔 Notify ALL cutting masters about available work
//     if (cuttingMasters.length > 0) {
//       console.log(`📢 Notifying ${cuttingMasters.length} cutting masters about available work...`);
      
//       for (const master of cuttingMasters) {
//         try {
//           await createNotification({
//             type: 'work-available', // ⭐ Changed from 'work-assigned' to 'work-available'
//             recipient: master._id,
//             recipientModel: 'CuttingMaster',
//             title: '🔔 New Work Available',
//             message: `New work for ${garment.name} is available for acceptance`,
//             reference: {
//               orderId: orderId,
//               workId: work._id,
//               garmentId: garment._id
//             },
//             priority: 'high'
//           });
//           console.log(`   ✅ Notification sent to ${master.name}`);
//         } catch (notifError) {
//           console.error(`   ❌ Failed to notify ${master.name}:`, notifError.message);
//         }
//       }
//       console.log(`✅ Notifications sent to ${cuttingMasters.length} cutting masters`);
//     } else {
//       console.log("⚠️ No cutting masters found - work created but no notifications sent");
//     }

//     // Add garment to order
//     await Order.findByIdAndUpdate(orderId, {
//       $push: { garments: garment._id }
//     });
//     console.log("✅ Garment added to order");

//     await garment.populate([
//       { path: "category", select: "name" },
//       { path: "item", select: "name" },
//       { path: "measurementTemplate", select: "name" },
//       { path: "workId" },
//     ]);

//     console.log("✅ Garment fully created and populated");

//     res.status(201).json({
//       message: "Garment created successfully",
//       garment
//     });
//   } catch (error) {
//     console.error("❌ Create garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET GARMENTS BY ORDER =====
// export const getGarmentsByOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     const garments = await Garment.find({ 
//       order: orderId,
//       isActive: true 
//     })
//       .populate("category", "name")
//       .populate("item", "name")
//       .populate("measurementTemplate", "name")
//       .populate("workId")
//       .sort({ createdAt: -1 });

//     console.log(`📦 Found ${garments.length} garments for order ${orderId}`);
//     garments.forEach(g => {
//       console.log(`🎨 Garment ${g.garmentId}:`, {
//         referenceImages: g.referenceImages?.length || 0,
//         customerImages: g.customerImages?.length || 0,
//         customerClothImages: g.customerClothImages?.length || 0
//       });
//     });

//     res.json(garments);
//   } catch (error) {
//     console.error("Get garments by order error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET GARMENT BY ID =====
// export const getGarmentById = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id)
//       .populate("category", "name")
//       .populate("item", "name")
//       .populate("measurementTemplate", "name")
//       .populate("workId")
//       .populate({
//         path: "order",
//         select: "orderId customer",
//         populate: { path: "customer", select: "name phone customerId" }
//       });

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     res.json(garment);
//   } catch (error) {
//     console.error("Get garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE GARMENT =====
// export const updateGarment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("📝 Updating garment:", id);
//     console.log("📦 Request body:", req.body);
//     console.log("📸 Request files:", req.files);

//     const garment = await Garment.findById(id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Parse JSON fields from FormData
//     let {
//       name,
//       category,
//       item,
//       measurementTemplate,
//       measurementSource,
//       measurements,
//       additionalInfo,
//       estimatedDelivery,
//       priority,
//       priceRange,
//       status,
//       existingReferenceImages,
//       existingCustomerImages,
//       existingClothImages
//     } = req.body;

//     // Parse JSON strings if they came from FormData
//     if (measurements && typeof measurements === 'string') {
//       try {
//         measurements = JSON.parse(measurements);
//       } catch (e) {
//         console.error("Error parsing measurements:", e);
//       }
//     }

//     if (priceRange && typeof priceRange === 'string') {
//       try {
//         priceRange = JSON.parse(priceRange);
//       } catch (e) {
//         console.error("Error parsing priceRange:", e);
//       }
//     }

//     // Parse existing image keys
//     let keepReferenceKeys = [];
//     let keepCustomerKeys = [];
//     let keepClothKeys = [];

//     if (existingReferenceImages && typeof existingReferenceImages === 'string') {
//       try {
//         keepReferenceKeys = JSON.parse(existingReferenceImages);
//       } catch (e) {
//         console.error("Error parsing existingReferenceImages:", e);
//       }
//     }

//     if (existingCustomerImages && typeof existingCustomerImages === 'string') {
//       try {
//         keepCustomerKeys = JSON.parse(existingCustomerImages);
//       } catch (e) {
//         console.error("Error parsing existingCustomerImages:", e);
//       }
//     }

//     if (existingClothImages && typeof existingClothImages === 'string') {
//       try {
//         keepClothKeys = JSON.parse(existingClothImages);
//       } catch (e) {
//         console.error("Error parsing existingClothImages:", e);
//       }
//     }

//     // Update basic fields
//     if (name) garment.name = name;
//     if (category) garment.category = category;
//     if (item) garment.item = item;
//     if (measurementTemplate) garment.measurementTemplate = measurementTemplate;
//     if (measurementSource) garment.measurementSource = measurementSource;
//     if (measurements) garment.measurements = measurements;
//     if (additionalInfo !== undefined) garment.additionalInfo = additionalInfo;
//     if (estimatedDelivery) garment.estimatedDelivery = estimatedDelivery;
//     if (priority) garment.priority = priority;
//     if (priceRange) garment.priceRange = priceRange;
//     if (status) garment.status = status;

//     // Handle images - keep only those not deleted
//     if (keepReferenceKeys.length > 0) {
//       garment.referenceImages = garment.referenceImages.filter(img => 
//         keepReferenceKeys.includes(img.key)
//       );
//     } else {
//       garment.referenceImages = []; // Remove all if none to keep
//     }

//     if (keepCustomerKeys.length > 0) {
//       garment.customerImages = garment.customerImages.filter(img => 
//         keepCustomerKeys.includes(img.key)
//       );
//     } else {
//       garment.customerImages = [];
//     }

//     if (keepClothKeys.length > 0) {
//       garment.customerClothImages = garment.customerClothImages.filter(img => 
//         keepClothKeys.includes(img.key)
//       );
//     } else {
//       garment.customerClothImages = [];
//     }

//     // Upload new reference images
//     if (req.files?.referenceImages) {
//       for (const file of req.files.referenceImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           garment.referenceImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     // Upload new customer images
//     if (req.files?.customerImages) {
//       for (const file of req.files.customerImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer'
//         );
//         if (upload.success) {
//           garment.customerImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     // Upload new cloth images
//     if (req.files?.customerClothImages) {
//       for (const file of req.files.customerClothImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/cloth'
//         );
//         if (upload.success) {
//           garment.customerClothImages.push({ 
//             url: upload.url, 
//             key: upload.key,
//             uploadedAt: new Date()
//           });
//         }
//       }
//     }

//     await garment.save();
//     console.log("✅ Garment updated successfully");

//     res.json({
//       message: "Garment updated successfully",
//       garment
//     });

//   } catch (error) {
//     console.error("❌ Update garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE GARMENT =====
// export const deleteGarment = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Delete images from R2
//     for (const img of garment.referenceImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }
//     for (const img of garment.customerImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }
//     for (const img of garment.customerClothImages) {
//       if (img.key) await r2Service.deleteFile(img.key);
//     }

//     // Delete associated work
//     if (garment.workId) {
//       await Work.findByIdAndUpdate(garment.workId, { isActive: false });
//     }

//     // Remove garment from order
//     await Order.findByIdAndUpdate(garment.order, {
//       $pull: { garments: garment._id }
//     });

//     garment.isActive = false;
//     await garment.save();

//     res.json({ message: "Garment deleted successfully" });
//   } catch (error) {
//     console.error("Delete garment error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE GARMENT IMAGES =====
// export const updateGarmentImages = async (req, res) => {
//   try {
//     const garment = await Garment.findById(req.params.id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     let referenceImages = [...garment.referenceImages];
//     let customerImages = [...garment.customerImages];
//     let customerClothImages = [...(garment.customerClothImages || [])];

//     // Upload new reference images
//     if (req.files?.referenceImages) {
//       for (const file of req.files.referenceImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/reference'
//         );
//         if (upload.success) {
//           referenceImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     // Upload new customer digital images
//     if (req.files?.customerImages) {
//       for (const file of req.files.customerImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer-digital'
//         );
//         if (upload.success) {
//           customerImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     // Upload new customer cloth images
//     if (req.files?.customerClothImages) {
//       for (const file of req.files.customerClothImages) {
//         const upload = await r2Service.uploadFile(
//           file, 
//           file.originalname, 
//           'garments/customer-cloth'
//         );
//         if (upload.success) {
//           customerClothImages.push({ url: upload.url, key: upload.key });
//         }
//       }
//     }

//     garment.referenceImages = referenceImages;
//     garment.customerImages = customerImages;
//     garment.customerClothImages = customerClothImages;
//     await garment.save();

//     res.json({
//       message: "Garment images updated successfully",
//       garment
//     });
//   } catch (error) {
//     console.error("Update garment images error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE GARMENT IMAGE =====
// export const deleteGarmentImage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { imageKey, imageType } = req.body;

//     const garment = await Garment.findById(id);

//     if (!garment) {
//       return res.status(404).json({ message: "Garment not found" });
//     }

//     // Delete from R2
//     await r2Service.deleteFile(imageKey);

//     // Remove from appropriate array
//     if (imageType === 'reference') {
//       garment.referenceImages = garment.referenceImages.filter(
//         img => img.key !== imageKey
//       );
//     } else if (imageType === 'customer') {
//       garment.customerImages = garment.customerImages.filter(
//         img => img.key !== imageKey
//       );
//     } else if (imageType === 'customerCloth') {
//       garment.customerClothImages = garment.customerClothImages.filter(
//         img => img.key !== imageKey
//       );
//     }

//     await garment.save();

//     res.json({ message: "Image deleted successfully" });
//   } catch (error) {
//     console.error("Delete garment image error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };



// // ============================================
// // 🟢 Get customer's order dates for garment calendar
// // ============================================
// export const getCustomerOrderDates = async (req, res) => {
//   console.log("\n🟢 ===== GET CUSTOMER ORDER DATES =====");
  
//   try {
//     const { customerId } = req.params;
//     const { month, year } = req.query;
    
//     // Validate inputs
//     if (!customerId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Customer ID is required" 
//       });
//     }

//     if (!month || !year) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Month and year are required" 
//       });
//     }

//     const monthNum = parseInt(month);
//     const yearNum = parseInt(year);

//     // Calculate date range for the month
//     const startDate = new Date(yearNum, monthNum, 1);
//     const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59);

//     console.log(`📅 Customer: ${customerId}, Range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

//     // Import Order model at the top if not already imported
//     // Make sure you have: import Order from "../models/Order.js";

//     // Get unique delivery dates where this customer has orders
//     const orderDates = await Order.aggregate([
//       {
//         $match: {
//           customer: new mongoose.Types.ObjectId(customerId),
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

//     // Extract just the dates array
//     const dates = orderDates.map(item => item.date);

//     console.log(`✅ Found ${dates.length} dates for customer ${customerId}`);
//     console.log(`📅 Dates:`, dates);
    
//     res.status(200).json({
//       success: true,
//       dates: dates,
//       customerId,
//       month: monthNum,
//       year: yearNum
//     });

//   } catch (error) {
//     console.error("❌ Error in getCustomerOrderDates:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };










// controllers/garment.controller.js
import Customer from "../models/Customer.js";
import Garment from "../models/Garment.js";
import Work from "../models/Work.js";
import CuttingMaster from "../models/CuttingMaster.js";
import Order from "../models/Order.js";
import r2Service from "../services/r2.service.js";
import mongoose from "mongoose";
import { createNotification } from './notification.controller.js';
import { updateOrderPaymentSummary } from "./order.controller.js";

// ===== CREATE GARMENT =====
export const createGarment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // 🔥 FIX 1: Validate order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const {
      name,
      category,
      item,
      measurementTemplate,
      measurementSource,
      measurements,
      additionalInfo,
      estimatedDelivery,
      priority,
      priceRange,
      finalizedPrice,
      createdBy,
    } = req.body;

    console.log("📝 Creating garment with data:", {
      orderId,
      name,
      category,
      item,
      createdBy: createdBy || req.body.createdBy || req.user?.id,
    });

    // ✅ CRITICAL: Log what files are received
    console.log("📸 Files received:", {
      referenceImages: req.files?.referenceImages?.length || 0,
      customerImages: req.files?.customerImages?.length || 0,
      customerClothImages: req.files?.customerClothImages?.length || 0,
    });

    // Initialize image arrays
    let referenceImages = [];
    let customerImages = [];
    let customerClothImages = [];

    // ✅ Upload reference images to R2
    if (req.files?.referenceImages && req.files.referenceImages.length > 0) {
      console.log(`📸 Uploading ${req.files.referenceImages.length} reference images`);
      for (const file of req.files.referenceImages) {
        console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/reference'
        );
        if (upload.success) {
          referenceImages.push({ 
            url: upload.url, 
            key: upload.key,
            uploadedAt: new Date()
          });
          console.log(`   ✅ Uploaded: ${upload.url}`);
        } else {
          console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
        }
      }
    }

    // ✅ Upload customer digital images to R2
    if (req.files?.customerImages && req.files.customerImages.length > 0) {
      console.log(`📸 Uploading ${req.files.customerImages.length} customer images`);
      for (const file of req.files.customerImages) {
        console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/customer'
        );
        if (upload.success) {
          customerImages.push({ 
            url: upload.url, 
            key: upload.key,
            uploadedAt: new Date()
          });
          console.log(`   ✅ Uploaded: ${upload.url}`);
        } else {
          console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
        }
      }
    }

    // ✅ Upload customer cloth images to R2
    if (req.files?.customerClothImages && req.files.customerClothImages.length > 0) {
      console.log(`📸 Uploading ${req.files.customerClothImages.length} cloth images`);
      for (const file of req.files.customerClothImages) {
        console.log(`   Processing: ${file.originalname} (${file.size} bytes)`);
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/cloth'
        );
        if (upload.success) {
          customerClothImages.push({ 
            url: upload.url, 
            key: upload.key,
            uploadedAt: new Date()
          });
          console.log(`   ✅ Uploaded: ${upload.url}`);
        } else {
          console.error(`   ❌ Failed to upload: ${file.originalname}`, upload.error);
        }
      }
    }

    // Parse measurements if provided as string
    let parsedMeasurements = measurements;
    if (typeof measurements === 'string') {
      try {
        parsedMeasurements = JSON.parse(measurements);
      } catch (e) {
        console.error("Error parsing measurements:", e);
      }
    }

    // Parse priceRange if provided as string
    let parsedPriceRange = priceRange;
    if (typeof priceRange === 'string') {
      try {
        parsedPriceRange = JSON.parse(priceRange);
      } catch (e) {
        console.error("Error parsing priceRange:", e);
      }
    }

    // Get the user ID - try multiple sources
    const userId = createdBy || req.body.createdBy || req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(400).json({ 
        message: "createdBy is required for garment creation" 
      });
    }

    console.log("👤 Using userId for garment:", userId);

    // 🔥 FIX 2: Check if garment already exists (prevent duplicates)
    const existingGarment = await Garment.findOne({ 
      order: orderId,
      name: name,
      category: category,
      item: item
    });

    if (existingGarment) {
      console.log("⚠️ Garment already exists, returning existing");
      return res.status(200).json({
        message: "Garment already exists",
        garment: existingGarment
      });
    }

    // ✅ Create garment with all image arrays
    const garment = new Garment({
      order: orderId,
      name,
      category,
      item,
      measurementTemplate: measurementTemplate || null,
      measurementSource: measurementSource || "template",
      measurements: parsedMeasurements || [],
      referenceImages,      // ✅ This will be saved to database
      customerImages,       // ✅ This will be saved to database
      customerClothImages,  // ✅ This will be saved to database
      additionalInfo,
      estimatedDelivery,
      priority: priority || "normal",
      priceRange: parsedPriceRange || { min: 0, max: 0 },
      finalizedPrice: finalizedPrice !== undefined && finalizedPrice !== null && finalizedPrice !== "" ? Number(finalizedPrice) : (parsedPriceRange?.max ? Number(parsedPriceRange.max) : (parsedPriceRange?.min ? Number(parsedPriceRange.min) : 0)),
    });

    console.log("💾 Saving garment with images:", {
      referenceImages: referenceImages.length,
      customerImages: customerImages.length,
      customerClothImages: customerClothImages.length,
    });

    await garment.save();
    
    console.log("✅ Garment created with ID:", garment._id);
    console.log("📸 Images saved in database:", {
      reference: garment.referenceImages.length,
      customer: garment.customerImages.length,
      cloth: garment.customerClothImages.length,
    });

    // 🔥 FIX 3: Add garment to order
    await Order.findByIdAndUpdate(orderId, {
      $push: { garments: garment._id }
    });
    console.log("✅ Garment added to order");

    // ===== WORK CREATION =====
    console.log("🔍 Searching for cutting masters...");
    const cuttingMasters = await CuttingMaster.find({ isActive: true });
    console.log(`✅ Found ${cuttingMasters.length} cutting masters`);

    // Generate work ID
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const workCount = await Work.countDocuments();
    const sequential = String(workCount + 1).padStart(4, '0');
    const garmentPrefix = garment.name?.substring(0, 4).toUpperCase() || 'WRK';
    const workId = `${garmentPrefix}-${day}${month}${year}-${sequential}`;

    // Create work (OPEN POOL)
    const workData = {
      workId,
      order: orderId,
      garment: garment._id,
      status: "pending",
      cuttingMaster: null,
      createdBy: userId,
      estimatedDelivery: estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000)
    };

    const work = await Work.create(workData);
    console.log(`✅ Work created (OPEN POOL). ID: ${work._id}`);
    
    garment.workId = work._id;
    await garment.save();

    // 🔔 Notify cutting masters
    if (cuttingMasters.length > 0) {
      console.log(`📢 Notifying ${cuttingMasters.length} cutting masters...`);
      
      for (const master of cuttingMasters) {
        try {
          await createNotification({
            type: 'work-available',
            recipient: master._id,
            recipientModel: 'CuttingMaster',
            title: '🔔 New Work Available',
            message: `New work for ${garment.name} is available for acceptance`,
            reference: {
              orderId: orderId,
              workId: work._id,
              garmentId: garment._id
            },
            priority: 'high'
          });
          console.log(`   ✅ Notification sent to ${master.name}`);
        } catch (notifError) {
          console.error(`   ❌ Failed to notify ${master.name}:`, notifError.message);
        }
      }
    }

    await garment.populate([
      { path: "category", select: "name" },
      { path: "item", select: "name" },
      { path: "measurementTemplate", select: "name" },
      { path: "workId" },
    ]);

    console.log("✅ Garment fully created and populated");

    // Recalculate order payment summary to include new garment prices
    await updateOrderPaymentSummary(orderId);

    res.status(201).json({
      message: "Garment created successfully",
      garment
    });
  } catch (error) {
    console.error("❌ Create garment error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET GARMENTS BY ORDER =====
export const getGarmentsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const garments = await Garment.find({ 
      order: orderId,
      isActive: true 
    })
      .populate("category", "name")
      .populate("item", "name")
      .populate("measurementTemplate", "name")
      .populate("workId")
      .sort({ createdAt: -1 });

    console.log(`📦 Found ${garments.length} garments for order ${orderId}`);
    garments.forEach(g => {
      console.log(`🎨 Garment ${g.garmentId}:`, {
        referenceImages: g.referenceImages?.length || 0,
        customerImages: g.customerImages?.length || 0,
        customerClothImages: g.customerClothImages?.length || 0
      });
    });

    res.json(garments);
  } catch (error) {
    console.error("Get garments by order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET GARMENT BY ID =====
export const getGarmentById = async (req, res) => {
  try {
    const garment = await Garment.findById(req.params.id)
      .populate("category", "name")
      .populate("item", "name")
      .populate("measurementTemplate", "name")
      .populate("workId")
      .populate({
        path: "order",
        select: "orderId customer",
        populate: { path: "customer", select: "name phone customerId" }
      });

    if (!garment) {
      return res.status(404).json({ message: "Garment not found" });
    }

    res.json(garment);
  } catch (error) {
    console.error("Get garment error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE GARMENT =====
export const updateGarment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📝 Updating garment:", id);
    console.log("📦 Request body:", req.body);
    console.log("📸 Request files:", req.files);

    const garment = await Garment.findById(id);

    if (!garment) {
      return res.status(404).json({ message: "Garment not found" });
    }

    // Parse JSON fields from FormData
    let {
      name,
      category,
      item,
      measurementTemplate,
      measurementSource,
      measurements,
      additionalInfo,
      estimatedDelivery,
      priority,
      priceRange,
      finalizedPrice,
      minPrice,
      maxPrice,
      finalizedAmount,
      status,
      existingReferenceImages,
      existingCustomerImages,
      existingClothImages
    } = req.body;

    // Parse JSON strings if they came from FormData
    if (measurements && typeof measurements === 'string') {
      try {
        measurements = JSON.parse(measurements);
      } catch (e) {
        console.error("Error parsing measurements:", e);
      }
    }

    if (priceRange && typeof priceRange === 'string') {
      try {
        priceRange = JSON.parse(priceRange);
      } catch (e) {
        console.error("Error parsing priceRange:", e);
      }
    }

    // Parse existing image keys
    let keepReferenceKeys = [];
    let keepCustomerKeys = [];
    let keepClothKeys = [];

    if (existingReferenceImages && typeof existingReferenceImages === 'string') {
      try {
        keepReferenceKeys = JSON.parse(existingReferenceImages);
      } catch (e) {
        console.error("Error parsing existingReferenceImages:", e);
      }
    }

    if (existingCustomerImages && typeof existingCustomerImages === 'string') {
      try {
        keepCustomerKeys = JSON.parse(existingCustomerImages);
      } catch (e) {
        console.error("Error parsing existingCustomerImages:", e);
      }
    }

    if (existingClothImages && typeof existingClothImages === 'string') {
      try {
        keepClothKeys = JSON.parse(existingClothImages);
      } catch (e) {
        console.error("Error parsing existingClothImages:", e);
      }
    }

    // Update basic fields
    if (name) garment.name = name;
    if (category) garment.category = category;
    if (item) garment.item = item;
    if (measurementTemplate) garment.measurementTemplate = measurementTemplate;
    if (measurementSource) garment.measurementSource = measurementSource;
    if (measurements) garment.measurements = measurements;
    if (additionalInfo !== undefined) garment.additionalInfo = additionalInfo;
    if (estimatedDelivery) garment.estimatedDelivery = estimatedDelivery;
    if (priority) garment.priority = priority;
    if (priceRange) garment.priceRange = priceRange;
    if (minPrice !== undefined) garment.minPrice = (minPrice === "" || minPrice === null || minPrice === "null") ? 0 : Number(minPrice);
    if (maxPrice !== undefined) garment.maxPrice = (maxPrice === "" || maxPrice === null || maxPrice === "null") ? 0 : Number(maxPrice);
    
    const incomingFinalized = finalizedAmount !== undefined ? finalizedAmount : finalizedPrice;
    if (incomingFinalized !== undefined) {
      const finalVal = (incomingFinalized === "" || incomingFinalized === null || incomingFinalized === "null")
        ? (priceRange?.max || garment.priceRange?.max || priceRange?.min || garment.priceRange?.min || 0)
        : Number(incomingFinalized);
      garment.finalizedPrice = finalVal;
      garment.finalizedAmount = finalVal;
    }
    if (status) garment.status = status;

    // Handle images - keep only those not deleted
    if (keepReferenceKeys.length > 0) {
      garment.referenceImages = garment.referenceImages.filter(img => 
        keepReferenceKeys.includes(img.key)
      );
    } else {
      garment.referenceImages = []; // Remove all if none to keep
    }

    if (keepCustomerKeys.length > 0) {
      garment.customerImages = garment.customerImages.filter(img => 
        keepCustomerKeys.includes(img.key)
      );
    } else {
      garment.customerImages = [];
    }

    if (keepClothKeys.length > 0) {
      garment.customerClothImages = garment.customerClothImages.filter(img => 
        keepClothKeys.includes(img.key)
      );
    } else {
      garment.customerClothImages = [];
    }

    // Upload new reference images
    if (req.files?.referenceImages) {
      for (const file of req.files.referenceImages) {
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/reference'
        );
        if (upload.success) {
          garment.referenceImages.push({ 
            url: upload.url, 
            key: upload.key,
            uploadedAt: new Date()
          });
        }
      }
    }

    // Upload new customer images
    if (req.files?.customerImages) {
      for (const file of req.files.customerImages) {
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/customer'
        );
        if (upload.success) {
          garment.customerImages.push({ 
            url: upload.url, 
            key: upload.key,
            uploadedAt: new Date()
          });
        }
      }
    }

    // Upload new cloth images
    if (req.files?.customerClothImages) {
      for (const file of req.files.customerClothImages) {
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/cloth'
        );
        if (upload.success) {
          garment.customerClothImages.push({ 
            url: upload.url, 
            key: upload.key,
            uploadedAt: new Date()
          });
        }
      }
    }

    await garment.save();
    console.log("✅ Garment updated successfully");
    console.log("📸 Images after update:", {
      reference: garment.referenceImages.length,
      customer: garment.customerImages.length,
      cloth: garment.customerClothImages.length,
    });

    // Recalculate order payment summary to include new garment prices
    await updateOrderPaymentSummary(garment.order);

    res.json({
      message: "Garment updated successfully",
      garment
    });

  } catch (error) {
    console.error("❌ Update garment error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== DELETE GARMENT =====
export const deleteGarment = async (req, res) => {
  try {
    const garment = await Garment.findById(req.params.id);

    if (!garment) {
      return res.status(404).json({ message: "Garment not found" });
    }

    // Delete images from R2
    console.log("🗑️ Deleting images from R2...");
    for (const img of garment.referenceImages) {
      if (img.key) await r2Service.deleteFile(img.key);
    }
    for (const img of garment.customerImages) {
      if (img.key) await r2Service.deleteFile(img.key);
    }
    for (const img of garment.customerClothImages) {
      if (img.key) await r2Service.deleteFile(img.key);
    }

    // Delete associated work
    if (garment.workId) {
      await Work.findByIdAndUpdate(garment.workId, { isActive: false });
    }

    // Remove garment from order
    await Order.findByIdAndUpdate(garment.order, {
      $pull: { garments: garment._id }
    });

    garment.isActive = false;
    await garment.save();

    // Recalculate order payment summary to include new garment prices
    await updateOrderPaymentSummary(garment.order);

    res.json({ message: "Garment deleted successfully" });
  } catch (error) {
    console.error("Delete garment error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE GARMENT IMAGES =====
export const updateGarmentImages = async (req, res) => {
  try {
    const garment = await Garment.findById(req.params.id);

    if (!garment) {
      return res.status(404).json({ message: "Garment not found" });
    }

    let referenceImages = [...garment.referenceImages];
    let customerImages = [...garment.customerImages];
    let customerClothImages = [...(garment.customerClothImages || [])];

    // Upload new reference images
    if (req.files?.referenceImages) {
      for (const file of req.files.referenceImages) {
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/reference'
        );
        if (upload.success) {
          referenceImages.push({ url: upload.url, key: upload.key });
        }
      }
    }

    // Upload new customer digital images
    if (req.files?.customerImages) {
      for (const file of req.files.customerImages) {
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/customer-digital'
        );
        if (upload.success) {
          customerImages.push({ url: upload.url, key: upload.key });
        }
      }
    }

    // Upload new customer cloth images
    if (req.files?.customerClothImages) {
      for (const file of req.files.customerClothImages) {
        const upload = await r2Service.uploadFile(
          file, 
          file.originalname, 
          'garments/customer-cloth'
        );
        if (upload.success) {
          customerClothImages.push({ url: upload.url, key: upload.key });
        }
      }
    }

    garment.referenceImages = referenceImages;
    garment.customerImages = customerImages;
    garment.customerClothImages = customerClothImages;
    await garment.save();

    res.json({
      message: "Garment images updated successfully",
      garment
    });
  } catch (error) {
    console.error("Update garment images error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== DELETE GARMENT IMAGE =====
export const deleteGarmentImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageKey, imageType } = req.body;

    const garment = await Garment.findById(id);

    if (!garment) {
      return res.status(404).json({ message: "Garment not found" });
    }

    // Delete from R2
    await r2Service.deleteFile(imageKey);

    // Remove from appropriate array
    if (imageType === 'reference') {
      garment.referenceImages = garment.referenceImages.filter(
        img => img.key !== imageKey
      );
    } else if (imageType === 'customer') {
      garment.customerImages = garment.customerImages.filter(
        img => img.key !== imageKey
      );
    } else if (imageType === 'customerCloth') {
      garment.customerClothImages = garment.customerClothImages.filter(
        img => img.key !== imageKey
      );
    }

    await garment.save();

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete garment image error:", error);
    res.status(500).json({ message: error.message });
  }
};






// ============================================
// 🔴 FIXED: Get delivery dates for customer orders
// ============================================
// export const getCustomerOrderDates = async (req, res) => {
//   console.log("\n🔴 ===== GET DELIVERY DATES =====");
  
//   try {
//     const { customerId } = req.params;
//     const { month, year } = req.query;
    
//     const monthNum = parseInt(month);
//     const yearNum = parseInt(year);

//     // Date range for the month
//     const startDate = new Date(yearNum, monthNum - 1, 1);
//     const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

//     console.log(`📅 Customer: ${customerId}, Range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

//     // Find customer
//     let customerQuery = {};
//     const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(customerId);
    
//     if (isValidObjectId) {
//       customerQuery = { _id: customerId };
//     } else {
//       customerQuery = { customerId: customerId };
//     }
    
//     const customer = await Customer.findOne(customerQuery);
    
//     if (!customer) {
//       return res.status(404).json({ success: false, message: "Customer not found" });
//     }

//     // 🔴 FIXED: Use deliveryDate instead of orderDate
//     const orders = await Order.find({
//       customer: customer._id,
//       deliveryDate: {  // ✅ Changed to deliveryDate
//         $gte: startDate, 
//         $lte: endDate 
//       },
//       status: { $ne: 'cancelled' },
//       isActive: true
//     }).select('deliveryDate');  // ✅ Changed to deliveryDate

//     // Format delivery dates
//     const dates = orders.map(order => {
//       const d = new Date(order.deliveryDate);  // ✅ Changed to deliveryDate
//       return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
//     });

//     // Remove duplicates
//     const uniqueDates = [...new Set(dates)];

//     console.log(`✅ Found ${uniqueDates.length} delivery dates:`, uniqueDates);
    
//     res.json({
//       success: true,
//       dates: uniqueDates,
//       customerId: customer._id,
//       month: monthNum,
//       year: yearNum
//     });

//   } catch (error) {
//     console.error("❌ Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// ============================================
// Get delivery dates for customer orders
// ============================================
// export const getCustomerOrderDates = async (req, res) => {
//   console.log("\n📅 ===== GET CUSTOMER DELIVERY DATES =====");

//   try {
//     const { customerId } = req.params;
//     const { month, year } = req.query;

//     if (!customerId || !month || !year) {
//       return res.status(400).json({
//         success: false,
//         message: "customerId, month and year are required",
//       });
//     }

//     const monthNum = parseInt(month);
//     const yearNum = parseInt(year);

//     // Start & end of month
//     const startDate = new Date(yearNum, monthNum - 1, 1);
//     const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

//     console.log(
//       `📅 Customer: ${customerId}, Range: ${startDate.toISOString()} → ${endDate.toISOString()}`
//     );

//     // 🔥 Aggregation query
//     const result = await Garment.aggregate([
//       {
//         $match: {
//           estimatedDelivery: {
//             $gte: startDate,
//             $lte: endDate,
//           },
//           isActive: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "orders",
//           localField: "order",
//           foreignField: "_id",
//           as: "order",
//         },
//       },
//       { $unwind: "$order" },
//       {
//         $match: {
//           "order.customer": new mongoose.Types.ObjectId(customerId),
//         },
//       },
//       {
//         $group: {
//           _id: {
//             $dateToString: {
//               format: "%Y-%m-%d",
//               date: "$estimatedDelivery",
//             },
//           },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     const dates = result.map((d) => d._id);

//     console.log(`✅ Found ${dates.length} delivery dates`, dates);

//     res.json({
//       success: true,
//       dates,
//       customerId,
//       month: monthNum,
//       year: yearNum,
//       count: dates.length,
//     });

//   } catch (error) {
//     console.error("❌ Error fetching delivery dates:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };




export const getCustomerOrderDates = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "month and year are required",
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);
    endDate.setHours(23, 59, 59, 999);

    // 🔥 ONLY ALL DELIVERY DATES (all customers)
    const allDatesResult = await Garment.aggregate([
      {
        $match: {
          estimatedDelivery: {
            $exists: true,
            $ne: null,
            $gte: startDate,
            $lte: endDate,
          },
          isActive: true,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$estimatedDelivery",
              timezone: "Asia/Kolkata",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      allDates: allDatesResult, // 🔥 All busy dates with counts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};








// ============================================
// 📅 Get all delivery dates for calendar
// ============================================
export const getDeliveryDates = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required"
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);
    endDate.setHours(23, 59, 59, 999);

    // Get all delivery dates with counts
    const allDatesResult = await Garment.aggregate([
      {
        $match: {
          estimatedDelivery: {
            $exists: true,
            $ne: null,
            $gte: startDate,
            $lte: endDate,
          },
          isActive: true,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$estimatedDelivery",
              timezone: "Asia/Kolkata",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      allDates: allDatesResult,
    });

  } catch (error) {
    console.error('Error in getDeliveryDates:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};