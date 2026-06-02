// import EmbroideryWorker from "../models/EmbroideryWorker.js";
// import Work from "../models/Work.js";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";

// // ===== CREATE EMBROIDERY_WORKER =====
// // ===== CREATE EMBROIDERY_WORKER =====
// export const createEmbroideryWorker = async (req, res) => {
//   try {
//     console.log("📝 Creating embroideryWorker with data:", {
//       ...req.body,
//       password: req.body.password ? '[PRESENT]' : '[MISSING]'
//     });
    
//     // ✅ FIX: Add password to destructuring
//     const { name, phone, email, password, address, specialization, experience } = req.body;

//     // Validate required fields
//     if (!name) {
//       return res.status(400).json({ message: "Name is required" });
//     }
//     if (!phone) {
//       return res.status(400).json({ message: "Phone number is required" });
//     }
    
//     // ✅ FIX: Validate password
//     if (!password) {
//       return res.status(400).json({ message: "Password is required" });
//     }

//     // Check if phone already exists
//     const existingPhone = await EmbroideryWorker.findOne({ phone });
//     if (existingPhone) {
//       return res.status(400).json({ message: "EmbroideryWorker with this phone number already exists" });
//     }

//     // Check if email already exists (if provided)
//     if (email) {
//       const existingEmail = await EmbroideryWorker.findOne({ email });
//       if (existingEmail) {
//         return res.status(400).json({ message: "EmbroideryWorker with this email already exists" });
//       }
//     }

//     // Generate embroideryWorkerId manually (since pre-save hook might not be running)
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await EmbroideryWorker.countDocuments();
//     const sequence = String(count + 1).padStart(4, '0');
//     const embroideryWorkerId = `AAR${year}${month}${sequence}`;

//     // Create embroideryWorker with ALL fields
//     const embroideryWorker = new EmbroideryWorker({
//       embroideryWorkerId, // Set manually to ensure it's there
//       name,
//       phone,
//       email: email || undefined,
//       password, // Use the password from request body
//       address: address || {},
//       specialization: specialization || [],
//       experience: experience || 0,
//       createdBy: req.user?._id,
//       joiningDate: new Date(),
//       // Initialize other required fields
//       isActive: true,
//       isAvailable: true,
//       leaveStatus: "present",
//       workStats: {
//         totalAssigned: 0,
//         completed: 0,
//         pending: 0,
//         inProgress: 0
//       },
//       performance: {
//         rating: 0,
//         feedback: []
//       }
//     });

//     console.log("💾 Saving embroideryWorker with ID:", embroideryWorkerId);
    
//     // Save to database
//     await embroideryWorker.save();
    
//     console.log("✅ EmbroideryWorker created with ID:", embroideryWorker.embroideryWorkerId);

//     // Create user account with the SAME password
//     let user = null;
//     try {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt); // Use the provided password

//       user = await User.create({
//         name,
//         email: email || `${phone}@embroideryWorker.dreamfit.com`,
//         phone,
//         role: "EMBROIDERY_WORKER",
//         password: hashedPassword,
//         embroideryWorkerId: embroideryWorker._id,
//         isActive: true
//       });
//       console.log("✅ User account created for embroideryWorker");
//     } catch (userError) {
//       console.log("⚠️ User account creation failed:", userError.message);
//       // Don't fail the whole request if user creation fails
//     }

//     // Return success response (excluding password)
//     const embroideryWorkerResponse = embroideryWorker.toObject();
//     delete embroideryWorkerResponse.password;
    
//     res.status(201).json({
//       message: "EmbroideryWorker created successfully",
//       embroideryWorker: embroideryWorkerResponse,
//       user: user ? {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       } : null
//     });
//   } catch (error) {
//     console.error("❌ Create embroideryWorker error:", error);
    
//     // Handle duplicate key error
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({ 
//         message: `${field} already exists. Please use a different value.` 
//       });
//     }
    
//     // Handle validation error
//     if (error.name === "ValidationError") {
//       const errors = Object.values(error.errors).map(e => e.message);
//       console.error("Validation errors:", errors);
//       return res.status(400).json({ 
//         message: "Validation failed", 
//         errors 
//       });
//     }
    
//     res.status(500).json({ message: error.message });
//   }
// };
// // ===== GET ALL EMBROIDERY_WORKERS =====
// export const getAllEmbroideryWorkers = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     // Search by name, phone, email, embroideryWorkerId
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { embroideryWorkerId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Filter by leave status
//     if (status && status !== 'all') {
//       query.leaveStatus = status;
//     }

//     // Filter by availability
//     if (availability && availability !== 'all') {
//       query.isAvailable = availability === 'available';
//     }

//     const embroideryWorkers = await EmbroideryWorker.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // Get work statistics for each embroideryWorker
//     for (let embroideryWorker of embroideryWorkers) {
//       const workStats = await Work.aggregate([
//         { $match: { assignedTo: embroideryWorker._id, isActive: true } },
//         { $group: {
//           _id: null,
//           total: { $sum: 1 },
//           completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
//           pending: { $sum: { $cond: [{ $in: ["$status", ["pending", "accepted"]] }, 1, 0] } },
//           inProgress: { $sum: { $cond: [{ $in: ["$status", ["cutting", "stitching", "iron"]] }, 1, 0] } }
//         }}
//       ]);

//       if (workStats.length > 0) {
//         embroideryWorker.workStats = workStats[0];
//       } else {
//         embroideryWorker.workStats = { total: 0, completed: 0, pending: 0, inProgress: 0 };
//       }
//     }

//     res.json(embroideryWorkers);
//   } catch (error) {
//     console.error("Get all embroideryWorkers error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET EMBROIDERY_WORKER BY ID =====
// export const getEmbroideryWorkerById = async (req, res) => {
//   try {
//     const embroideryWorker = await EmbroideryWorker.findById(req.params.id)
//       .populate('createdBy', 'name')
//       .populate({
//         path: 'performance.feedback.from',
//         select: 'name'
//       });

//     if (!embroideryWorker) {
//       return res.status(404).json({ message: "EmbroideryWorker not found" });
//     }

//     // Get all works assigned to this embroideryWorker
//     const works = await Work.find({ 
//       assignedTo: embroideryWorker._id,
//       isActive: true 
//     })
//       .populate('order', 'orderId deliveryDate')
//       .populate('garment', 'name garmentId')
//       .sort({ createdAt: -1 });

//     // Calculate work statistics
//     const workStats = {
//       total: works.length,
//       completed: works.filter(w => w.status === 'completed').length,
//       pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
//       inProgress: works.filter(w => ['cutting', 'stitching', 'iron'].includes(w.status)).length
//     };

//     res.json({
//       embroideryWorker,
//       works,
//       workStats
//     });
//   } catch (error) {
//     console.error("Get embroideryWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE EMBROIDERY_WORKER =====
// export const updateEmbroideryWorker = async (req, res) => {
//   try {
//     const embroideryWorker = await EmbroideryWorker.findById(req.params.id);

//     if (!embroideryWorker) {
//       return res.status(404).json({ message: "EmbroideryWorker not found" });
//     }

//     // Check permissions
//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isEmbroideryWorkerSelf = req.user.embroideryWorkerId?.toString() === embroideryWorker._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isEmbroideryWorkerSelf) {
//       return res.status(403).json({ message: "Not authorized to update this embroideryWorker" });
//     }

//     // Fields that can be updated
//     const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience'];
    
//     // Only admin/store keeper can update these
//     if (isAdmin || isStoreKeeper) {
//       updatableFields.push('isAvailable', 'leaveStatus', 'leaveFrom', 'leaveTo', 'leaveReason');
//     }

//     // Update only allowed fields
//     updatableFields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         embroideryWorker[field] = req.body[field];
//       }
//     });

//     await embroideryWorker.save();

//     // Update corresponding user account if needed
//     if (isAdmin || isStoreKeeper) {
//       await User.findOneAndUpdate(
//         { embroideryWorkerId: embroideryWorker._id },
//         { 
//           name: embroideryWorker.name,
//           email: embroideryWorker.email,
//           phone: embroideryWorker.phone,
//           isActive: embroideryWorker.isActive
//         }
//       );
//     }

//     res.json({
//       message: "EmbroideryWorker updated successfully",
//       embroideryWorker
//     });
//   } catch (error) {
//     console.error("Update embroideryWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE LEAVE STATUS =====
// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatus = async (req, res) => {
//   try {
//     const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
//     const embroideryWorker = await EmbroideryWorker.findById(req.params.id);

//     if (!embroideryWorker) {
//       return res.status(404).json({ message: "EmbroideryWorker not found" });
//     }

//     // Check permissions
//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
//     const isEmbroideryWorkerSelf = req.user.embroideryWorkerId?.toString() === embroideryWorker._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isEmbroideryWorkerSelf) {
//       return res.status(403).json({ message: "Not authorized to update leave status" });
//     }

//     // ✅ Add validation here too (double-check)
//     if (leaveFrom && leaveTo) {
//       const fromDate = new Date(leaveFrom);
//       const toDate = new Date(leaveTo);
      
//       if (toDate < fromDate) {
//         return res.status(400).json({ 
//           message: "Leave to date cannot be before from date" 
//         });
//       }
//     }

//     embroideryWorker.leaveStatus = leaveStatus;
//     embroideryWorker.isAvailable = leaveStatus === 'present';
    
//     if (leaveFrom) embroideryWorker.leaveFrom = leaveFrom;
//     if (leaveTo) embroideryWorker.leaveTo = leaveTo;
//     if (leaveReason) embroideryWorker.leaveReason = leaveReason;

//     await embroideryWorker.save();

//     res.json({
//       message: `Leave status updated to ${leaveStatus}`,
//       embroideryWorker
//     });
//   } catch (error) {
//     console.error("Update leave status error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE EMBROIDERY_WORKER (soft delete) =====
// export const deleteEmbroideryWorker = async (req, res) => {
//   try {
//     const embroideryWorker = await EmbroideryWorker.findById(req.params.id);

//     if (!embroideryWorker) {
//       return res.status(404).json({ message: "EmbroideryWorker not found" });
//     }

//     // Check if embroideryWorker has active works
//     const activeWorks = await Work.countDocuments({
//       assignedTo: embroideryWorker._id,
//       status: { $nin: ['completed', 'cancelled'] }
//     });

//     if (activeWorks > 0) {
//       return res.status(400).json({ 
//         message: `Cannot delete embroideryWorker with ${activeWorks} active works. Complete or reassign works first.` 
//       });
//     }

//     embroideryWorker.isActive = false;
//     await embroideryWorker.save();

//     // Also deactivate user account
//     await User.findOneAndUpdate(
//       { embroideryWorkerId: embroideryWorker._id },
//       { isActive: false }
//     );

//     res.json({ message: "EmbroideryWorker deleted successfully" });
//   } catch (error) {
//     console.error("Delete embroideryWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET EMBROIDERY_WORKER STATISTICS =====
// export const getEmbroideryWorkerStats = async (req, res) => {
//   try {
//     const stats = await EmbroideryWorker.aggregate([
//       { $match: { isActive: true } },
//       { $group: {
//         _id: null,
//         total: { $sum: 1 },
//         available: { $sum: { $cond: [{ $eq: ["$isAvailable", true] }, 1, 0] } },
//         onLeave: { $sum: { $cond: [{ $eq: ["$leaveStatus", "leave"] }, 1, 0] } },
//         present: { $sum: { $cond: [{ $eq: ["$leaveStatus", "present"] }, 1, 0] } },
//         halfDay: { $sum: { $cond: [{ $eq: ["$leaveStatus", "half-day"] }, 1, 0] } },
//         holiday: { $sum: { $cond: [{ $eq: ["$leaveStatus", "holiday"] }, 1, 0] } }
//       }}
//     ]);

//     // Get work distribution
//     const workDistribution = await Work.aggregate([
//       { $match: { isActive: true, assignedTo: { $ne: null } } },
//       { $group: {
//         _id: "$assignedTo",
//         count: { $sum: 1 }
//       }},
//       { $group: {
//         _id: null,
//         avgWorkPerEmbroideryWorker: { $avg: "$count" },
//         maxWork: { $max: "$count" },
//         minWork: { $min: "$count" },
//         totalAssigned: { $sum: "$count" }
//       }}
//     ]);

//     res.json({
//       embroideryWorkerStats: stats[0] || { total: 0, available: 0, onLeave: 0, present: 0, halfDay: 0, holiday: 0 },
//       workDistribution: workDistribution[0] || { avgWorkPerEmbroideryWorker: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
//     });
//   } catch (error) {
//     console.error("Get embroideryWorker stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // controllers/embroideryWorker.controller.js
// import EmbroideryWorker from "../models/EmbroideryWorker.js";
// import Work from "../models/Work.js";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";

// // ===== CREATE EMBROIDERY_WORKER =====
// export const createEmbroideryWorker = async (req, res) => {
//   try {
//     console.log("📝 Creating embroideryWorker with data:", {
//       ...req.body,
//       password: req.body.password ? '[PRESENT]' : '[MISSING]'
//     });
    
//     const { name, phone, email, password, address, specialization, experience } = req.body;

//     // Validate required fields
//     if (!name) {
//       return res.status(400).json({ message: "Name is required" });
//     }
//     if (!phone) {
//       return res.status(400).json({ message: "Phone number is required" });
//     }
//     if (!password) {
//       return res.status(400).json({ message: "Password is required" });
//     }

//     // Check if phone already exists
//     const existingPhone = await EmbroideryWorker.findOne({ phone });
//     if (existingPhone) {
//       return res.status(400).json({ message: "EmbroideryWorker with this phone number already exists" });
//     }

//     // Check if email already exists (if provided)
//     if (email) {
//       const existingEmail = await EmbroideryWorker.findOne({ email });
//       if (existingEmail) {
//         return res.status(400).json({ message: "EmbroideryWorker with this email already exists" });
//       }
//     }

//     // Generate embroideryWorkerId
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await EmbroideryWorker.countDocuments();
//     const sequence = String(count + 1).padStart(4, '0');
//     const embroideryWorkerId = `AAR${year}${month}${sequence}`;

//     // Create embroideryWorker with ALL fields
//     const embroideryWorker = new EmbroideryWorker({
//       embroideryWorkerId,
//       name,
//       phone,
//       email: email || undefined,
//       password,
//       address: address || {},
//       specialization: specialization || [],
//       experience: experience || 0,
//       createdBy: req.user?._id,
//       joiningDate: new Date(),
//       isActive: true,
//       isAvailable: true,
//       leaveStatus: "present",
//       workStats: {
//         totalAssigned: 0,
//         completed: 0,
//         pending: 0,
//         inProgress: 0
//       },
//       performance: {
//         rating: 0,
//         feedback: []
//       }
//     });

//     console.log("💾 Saving embroideryWorker with ID:", embroideryWorkerId);
//     await embroideryWorker.save();
//     console.log("✅ EmbroideryWorker created with ID:", embroideryWorker.embroideryWorkerId);

//     // Create user account
//     let user = null;
//     try {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       user = await User.create({
//         name,
//         email: email || `${phone}@embroideryWorker.dreamfit.com`,
//         phone,
//         role: "EMBROIDERY_WORKER",
//         password: hashedPassword,
//         embroideryWorkerId: embroideryWorker._id,
//         isActive: true
//       });
//       console.log("✅ User account created for embroideryWorker");
//     } catch (userError) {
//       console.log("⚠️ User account creation failed:", userError.message);
//     }

//     const embroideryWorkerResponse = embroideryWorker.toObject();
//     delete embroideryWorkerResponse.password;
    
//     res.status(201).json({
//       message: "EmbroideryWorker created successfully",
//       embroideryWorker: embroideryWorkerResponse,
//       user: user ? {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       } : null
//     });
//   } catch (error) {
//     console.error("❌ Create embroideryWorker error:", error);
    
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({ 
//         message: `${field} already exists. Please use a different value.` 
//       });
//     }
    
//     if (error.name === "ValidationError") {
//       const errors = Object.values(error.errors).map(e => e.message);
//       console.error("Validation errors:", errors);
//       return res.status(400).json({ 
//         message: "Validation failed", 
//         errors 
//       });
//     }
    
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET ALL EMBROIDERY_WORKERS =====
// export const getAllEmbroideryWorkers = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { embroideryWorkerId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (status && status !== 'all') {
//       query.leaveStatus = status;
//     }

//     if (availability && availability !== 'all') {
//       query.isAvailable = availability === 'available';
//     }

//     const embroideryWorkers = await EmbroideryWorker.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // ✅ FIXED: Use correct field name 'embroideryWorker' not 'assignedTo'
//     for (let embroideryWorker of embroideryWorkers) {
//       const works = await Work.find({ 
//         embroideryWorker: embroideryWorker._id,  // ✅ CORRECT: using 'embroideryWorker' field
//         isActive: true 
//       });

//       const workStats = {
//         totalAssigned: works.length,
//         completed: works.filter(w => w.status === 'ready-to-deliver').length,
//         pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
//         inProgress: works.filter(w => 
//           ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//           .includes(w.status)
//         ).length
//       };

//       embroideryWorker.workStats = workStats;
//     }

//     res.json(embroideryWorkers);
//   } catch (error) {
//     console.error("Get all embroideryWorkers error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET EMBROIDERY_WORKER BY ID =====
// export const getEmbroideryWorkerById = async (req, res) => {
//   try {
//     const embroideryWorker = await EmbroideryWorker.findById(req.params.id)
//       .populate('createdBy', 'name')
//       .populate({
//         path: 'performance.feedback.from',
//         select: 'name'
//       });

//     if (!embroideryWorker) {
//       return res.status(404).json({ message: "EmbroideryWorker not found" });
//     }

//     // ✅ FIXED: Get all works assigned to this embroideryWorker using 'embroideryWorker' field
//     const works = await Work.find({ 
//       embroideryWorker: embroideryWorker._id,  // ✅ CORRECT: using 'embroideryWorker' field
//       isActive: true 
//     })
//       .populate({
//         path: 'order',
//         select: 'orderId customer deliveryDate',
//         populate: {
//           path: 'customer',
//           select: 'name'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId measurements priceRange'
//       })
//       .populate('cuttingMaster', 'name')
//       .sort({ createdAt: -1 });

//     // ✅ FIXED: Calculate work statistics correctly
//     const workStats = {
//       totalAssigned: works.length,
//       completed: works.filter(w => w.status === 'ready-to-deliver').length,
//       pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
//       inProgress: works.filter(w => 
//         ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//         .includes(w.status)
//       ).length
//     };

//     // Update embroideryWorker's workStats in database
//     embroideryWorker.workStats = workStats;
//     await embroideryWorker.save();

//     res.json({
//       embroideryWorker,
//       works,
//       workStats
//     });
//   } catch (error) {
//     console.error("Get embroideryWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE EMBROIDERY_WORKER =====
// export const updateEmbroideryWorker = async (req, res) => {
//   try {
//     const embroideryWorker = await EmbroideryWorker.findById(req.params.id);

//     if (!embroideryWorker) {
//       return res.status(404).json({ message: "EmbroideryWorker not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isEmbroideryWorkerSelf = req.user.embroideryWorkerId?.toString() === embroideryWorker._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isEmbroideryWorkerSelf) {
//       return res.status(403).json({ message: "Not authorized to update this embroideryWorker" });
//     }

//     const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience'];
    
//     if (isAdmin || isStoreKeeper) {
//       updatableFields.push('isAvailable', 'leaveStatus', 'leaveFrom', 'leaveTo', 'leaveReason');
//     }

//     updatableFields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         embroideryWorker[field] = req.body[field];
//       }
//     });

//     await embroideryWorker.save();

//     if (isAdmin || isStoreKeeper) {
//       await User.findOneAndUpdate(
//         { embroideryWorkerId: embroideryWorker._id },
//         { 
//           name: embroideryWorker.name,
//           email: embroideryWorker.email,
//           phone: embroideryWorker.phone,
//           isActive: embroideryWorker.isActive
//         }
//       );
//     }

//     res.json({
//       message: "EmbroideryWorker updated successfully",
//       embroideryWorker
//     });
//   } catch (error) {
//     console.error("Update embroideryWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatus = async (req, res) => {
//   try {
//     const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
//     const embroideryWorker = await EmbroideryWorker.findById(req.params.id);

//     if (!embroideryWorker) {
//       return res.status(404).json({ message: "EmbroideryWorker not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
//     const isEmbroideryWorkerSelf = req.user.embroideryWorkerId?.toString() === embroideryWorker._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isEmbroideryWorkerSelf) {
//       return res.status(403).json({ message: "Not authorized to update leave status" });
//     }

//     if (leaveFrom && leaveTo) {
//       const fromDate = new Date(leaveFrom);
//       const toDate = new Date(leaveTo);
      
//       if (toDate < fromDate) {
//         return res.status(400).json({ 
//           message: "Leave to date cannot be before from date" 
//         });
//       }
//     }

//     embroideryWorker.leaveStatus = leaveStatus;
//     embroideryWorker.isAvailable = leaveStatus === 'present';
    
//     if (leaveFrom) embroideryWorker.leaveFrom = leaveFrom;
//     if (leaveTo) embroideryWorker.leaveTo = leaveTo;
//     if (leaveReason) embroideryWorker.leaveReason = leaveReason;

//     await embroideryWorker.save();

//     res.json({
//       message: `Leave status updated to ${leaveStatus}`,
//       embroideryWorker
//     });
//   } catch (error) {
//     console.error("Update leave status error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE EMBROIDERY_WORKER (soft delete) =====
// export const deleteEmbroideryWorker = async (req, res) => {
//   try {
//     const embroideryWorker = await EmbroideryWorker.findById(req.params.id);

//     if (!embroideryWorker) {
//       return res.status(404).json({ message: "EmbroideryWorker not found" });
//     }

//     // ✅ FIXED: Check if embroideryWorker has active works using 'embroideryWorker' field
//     const activeWorks = await Work.countDocuments({
//       embroideryWorker: embroideryWorker._id,  // ✅ CORRECT: using 'embroideryWorker' field
//       status: { $nin: ['ready-to-deliver', 'cancelled'] }
//     });

//     if (activeWorks > 0) {
//       return res.status(400).json({ 
//         message: `Cannot delete embroideryWorker with ${activeWorks} active works. Complete or reassign works first.` 
//       });
//     }

//     embroideryWorker.isActive = false;
//     await embroideryWorker.save();

//     await User.findOneAndUpdate(
//       { embroideryWorkerId: embroideryWorker._id },
//       { isActive: false }
//     );

//     res.json({ message: "EmbroideryWorker deleted successfully" });
//   } catch (error) {
//     console.error("Delete embroideryWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET EMBROIDERY_WORKER STATISTICS =====
// export const getEmbroideryWorkerStats = async (req, res) => {
//   try {
//     const stats = await EmbroideryWorker.aggregate([
//       { $match: { isActive: true } },
//       { $group: {
//         _id: null,
//         total: { $sum: 1 },
//         available: { $sum: { $cond: [{ $eq: ["$isAvailable", true] }, 1, 0] } },
//         onLeave: { $sum: { $cond: [{ $eq: ["$leaveStatus", "leave"] }, 1, 0] } },
//         present: { $sum: { $cond: [{ $eq: ["$leaveStatus", "present"] }, 1, 0] } },
//         halfDay: { $sum: { $cond: [{ $eq: ["$leaveStatus", "half-day"] }, 1, 0] } },
//         holiday: { $sum: { $cond: [{ $eq: ["$leaveStatus", "holiday"] }, 1, 0] } }
//       }}
//     ]);

//     // ✅ FIXED: Get work distribution using 'embroideryWorker' field
//     const workDistribution = await Work.aggregate([
//       { $match: { isActive: true, embroideryWorker: { $ne: null } } },  // ✅ CORRECT: using 'embroideryWorker' field
//       { $group: {
//         _id: "$embroideryWorker",
//         count: { $sum: 1 }
//       }},
//       { $group: {
//         _id: null,
//         avgWorkPerEmbroideryWorker: { $avg: "$count" },
//         maxWork: { $max: "$count" },
//         minWork: { $min: "$count" },
//         totalAssigned: { $sum: "$count" }
//       }}
//     ]);

//     res.json({
//       embroideryWorkerStats: stats[0] || { total: 0, available: 0, onLeave: 0, present: 0, halfDay: 0, holiday: 0 },
//       workDistribution: workDistribution[0] || { avgWorkPerEmbroideryWorker: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
//     });
//   } catch (error) {
//     console.error("Get embroideryWorker stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };




// // controllers/embroideryWorker.controller.js
// import EmbroideryWorker from "../models/EmbroideryWorker.js";
// import Work from "../models/Work.js";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";

// // ===== CREATE EMBROIDERY_WORKER =====
// export const createEmbroideryWorker = async (req, res) => {
//   try {
//     console.log("📝 Creating embroideryWorker with data:", {
//       ...req.body,
//       password: req.body.password ? '[PRESENT]' : '[MISSING]'
//     });
    
//     const { name, phone, email, password, address, specialization, experience } = req.body;

//     // Validate required fields
//     if (!name) {
//       return res.status(400).json({ message: "Name is required" });
//     }
//     if (!phone) {
//       return res.status(400).json({ message: "Phone number is required" });
//     }
//     if (!password) {
//       return res.status(400).json({ message: "Password is required" });
//     }

//     // Check if phone already exists
//     const existingPhone = await EmbroideryWorker.findOne({ phone });
//     if (existingPhone) {
//       return res.status(400).json({ message: "EmbroideryWorker with this phone number already exists" });
//     }

//     // Check if email already exists (if provided)
//     if (email) {
//       const existingEmail = await EmbroideryWorker.findOne({ email });
//       if (existingEmail) {
//         return res.status(400).json({ message: "EmbroideryWorker with this email already exists" });
//       }
//     }

//     // Generate embroideryWorkerId
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await EmbroideryWorker.countDocuments();
//     const sequence = String(count + 1).padStart(4, '0');
//     const embroideryWorkerId = `AAR${year}${month}${sequence}`;

//     // Create embroideryWorker with ALL fields
//     const embroideryWorker = new EmbroideryWorker({
//       embroideryWorkerId,
//       name,
//       phone,
//       email: email || undefined,
//       password,
//       address: address || {},
//       specialization: specialization || [],
//       experience: experience || 0,
//       createdBy: req.user?._id,
//       joiningDate: new Date(),
//       isActive: true,
//       isAvailable: true,
//       leaveStatus: "present",
//       workStats: {
//         totalAssigned: 0,
//         completed: 0,
//         pending: 0,
//         inProgress: 0
//       },
//       performance: {
//         rating: 0,
//         feedback: []
//       }
//     });

//     console.log("💾 Saving embroideryWorker with ID:", embroideryWorkerId);
//     await embroideryWorker.save();
//     console.log("✅ EmbroideryWorker created with ID:", embroideryWorker.embroideryWorkerId);

//     // Create user account
//     let user = null;
//     try {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       user = await User.create({
//         name,
//         email: email || `${phone}@embroideryWorker.dreamfit.com`,
//         phone,
//         role: "EMBROIDERY_WORKER",
//         password: hashedPassword,
//         embroideryWorkerId: embroideryWorker._id,
//         isActive: true
//       });
//       console.log("✅ User account created for embroideryWorker");
//     } catch (userError) {
//       console.log("⚠️ User account creation failed:", userError.message);
//     }

//     const embroideryWorkerResponse = embroideryWorker.toObject();
//     delete embroideryWorkerResponse.password;
    
//     res.status(201).json({
//       message: "EmbroideryWorker created successfully",
//       embroideryWorker: embroideryWorkerResponse,
//       user: user ? {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       } : null
//     });
//   } catch (error) {
//     console.error("❌ Create embroideryWorker error:", error);
    
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({ 
//         message: `${field} already exists. Please use a different value.` 
//       });
//     }
    
//     if (error.name === "ValidationError") {
//       const errors = Object.values(error.errors).map(e => e.message);
//       console.error("Validation errors:", errors);
//       return res.status(400).json({ 
//         message: "Validation failed", 
//         errors 
//       });
//     }
    
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET ALL EMBROIDERY_WORKERS =====
// export const getAllEmbroideryWorkers = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { embroideryWorkerId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (status && status !== 'all') {
//       query.leaveStatus = status;
//     }

//     if (availability && availability !== 'all') {
//       query.isAvailable = availability === 'available';
//     }

//     const embroideryWorkers = await EmbroideryWorker.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // ✅ Calculate workStats from actual works for each embroideryWorker
//     for (let embroideryWorker of embroideryWorkers) {
//       const works = await Work.find({ 
//         embroideryWorker: embroideryWorker._id,
//         isActive: true 
//       });

//       const workStats = {
//         totalAssigned: works.length,
//         completed: works.filter(w => w.status === 'ready-to-deliver').length,
//         pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
//         inProgress: works.filter(w => 
//           ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//           .includes(w.status)
//         ).length
//       };

//       // Update the embroideryWorker object in memory (don't save to DB for performance)
//       embroideryWorker.workStats = workStats;
//     }

//     res.json(embroideryWorkers);
//   } catch (error) {
//     console.error("Get all embroideryWorkers error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET EMBROIDERY_WORKER BY ID =====
// export const getEmbroideryWorkerById = async (req, res) => {
//   try {
//     const embroideryWorker = await EmbroideryWorker.findById(req.params.id)
//       .populate('createdBy', 'name')
//       .populate({
//         path: 'performance.feedback.from',
//         select: 'name'
//       });

//     if (!embroideryWorker) {
//       return res.status(404).json({ message: "EmbroideryWorker not found" });
//     }

//     // ✅ Get all works assigned to this embroideryWorker
//     const works = await Work.find({ 
//       embroideryWorker: embroideryWorker._id,
//       isActive: true 
//     })
//       .populate({
//         path: 'order',
//         select: 'orderId customer deliveryDate',
//         populate: {
//           path: 'customer',
//           select: 'name'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId measurements priceRange'
//       })
//       .populate('cuttingMaster', 'name')
//       .sort({ createdAt: -1 });

//     // ✅ Calculate work statistics from actual works
//     const workStats = {
//       totalAssigned: works.length,
//       completed: works.filter(w => w.status === 'ready-to-deliver').length,
//       pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
//       inProgress: works.filter(w => 
//         ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//         .includes(w.status)
//       ).length
//     };

//     console.log('📊 Recalculated workStats for embroideryWorker:', {
//       embroideryWorkerId: embroideryWorker.embroideryWorkerId,
//       name: embroideryWorker.name,
//       totalWorks: works.length,
//       workStats,
//       worksBreakdown: works.map(w => ({
//         workId: w.workId,
//         status: w.status
//       }))
//     });

//     // ✅ Update the embroideryWorker's workStats in database
//     embroideryWorker.workStats = workStats;
//     await embroideryWorker.save();

//     res.json({
//       embroideryWorker,
//       works,
//       workStats
//     });
//   } catch (error) {
//     console.error("Get embroideryWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE EMBROIDERY_WORKER =====
// export const updateEmbroideryWorker = async (req, res) => {
//   try {
//     const embroideryWorker = await EmbroideryWorker.findById(req.params.id);

//     if (!embroideryWorker) {
//       return res.status(404).json({ message: "EmbroideryWorker not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isEmbroideryWorkerSelf = req.user.embroideryWorkerId?.toString() === embroideryWorker._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isEmbroideryWorkerSelf) {
//       return res.status(403).json({ message: "Not authorized to update this embroideryWorker" });
//     }

//     const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience'];
    
//     if (isAdmin || isStoreKeeper) {
//       updatableFields.push('isAvailable', 'leaveStatus', 'leaveFrom', 'leaveTo', 'leaveReason');
//     }

//     updatableFields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         embroideryWorker[field] = req.body[field];
//       }
//     });

//     await embroideryWorker.save();

//     if (isAdmin || isStoreKeeper) {
//       await User.findOneAndUpdate(
//         { embroideryWorkerId: embroideryWorker._id },
//         { 
//           name: embroideryWorker.name,
//           email: embroideryWorker.email,
//           phone: embroideryWorker.phone,
//           isActive: embroideryWorker.isActive
//         }
//       );
//     }

//     res.json({
//       message: "EmbroideryWorker updated successfully",
//       embroideryWorker
//     });
//   } catch (error) {
//     console.error("Update embroideryWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatus = async (req, res) => {
//   try {
//     const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
//     const embroideryWorker = await EmbroideryWorker.findById(req.params.id);

//     if (!embroideryWorker) {
//       return res.status(404).json({ message: "EmbroideryWorker not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
//     const isEmbroideryWorkerSelf = req.user.embroideryWorkerId?.toString() === embroideryWorker._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isEmbroideryWorkerSelf) {
//       return res.status(403).json({ message: "Not authorized to update leave status" });
//     }

//     if (leaveFrom && leaveTo) {
//       const fromDate = new Date(leaveFrom);
//       const toDate = new Date(leaveTo);
      
//       if (toDate < fromDate) {
//         return res.status(400).json({ 
//           message: "Leave to date cannot be before from date" 
//         });
//       }
//     }

//     embroideryWorker.leaveStatus = leaveStatus;
//     embroideryWorker.isAvailable = leaveStatus === 'present';
    
//     if (leaveFrom) embroideryWorker.leaveFrom = leaveFrom;
//     if (leaveTo) embroideryWorker.leaveTo = leaveTo;
//     if (leaveReason) embroideryWorker.leaveReason = leaveReason;

//     await embroideryWorker.save();

//     res.json({
//       message: `Leave status updated to ${leaveStatus}`,
//       embroideryWorker
//     });
//   } catch (error) {
//     console.error("Update leave status error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE EMBROIDERY_WORKER (soft delete) =====
// export const deleteEmbroideryWorker = async (req, res) => {
//   try {
//     const embroideryWorker = await EmbroideryWorker.findById(req.params.id);

//     if (!embroideryWorker) {
//       return res.status(404).json({ message: "EmbroideryWorker not found" });
//     }

//     // ✅ Check if embroideryWorker has active works
//     const activeWorks = await Work.countDocuments({
//       embroideryWorker: embroideryWorker._id,
//       status: { $nin: ['ready-to-deliver', 'cancelled'] }
//     });

//     if (activeWorks > 0) {
//       return res.status(400).json({ 
//         message: `Cannot delete embroideryWorker with ${activeWorks} active works. Complete or reassign works first.` 
//       });
//     }

//     embroideryWorker.isActive = false;
//     await embroideryWorker.save();

//     await User.findOneAndUpdate(
//       { embroideryWorkerId: embroideryWorker._id },
//       { isActive: false }
//     );

//     res.json({ message: "EmbroideryWorker deleted successfully" });
//   } catch (error) {
//     console.error("Delete embroideryWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET EMBROIDERY_WORKER STATISTICS =====
// export const getEmbroideryWorkerStats = async (req, res) => {
//   try {
//     const stats = await EmbroideryWorker.aggregate([
//       { $match: { isActive: true } },
//       { $group: {
//         _id: null,
//         total: { $sum: 1 },
//         available: { $sum: { $cond: [{ $eq: ["$isAvailable", true] }, 1, 0] } },
//         onLeave: { $sum: { $cond: [{ $eq: ["$leaveStatus", "leave"] }, 1, 0] } },
//         present: { $sum: { $cond: [{ $eq: ["$leaveStatus", "present"] }, 1, 0] } },
//         halfDay: { $sum: { $cond: [{ $eq: ["$leaveStatus", "half-day"] }, 1, 0] } },
//         holiday: { $sum: { $cond: [{ $eq: ["$leaveStatus", "holiday"] }, 1, 0] } }
//       }}
//     ]);

//     // ✅ Get work distribution using actual works
//     const workDistribution = await Work.aggregate([
//       { $match: { isActive: true, embroideryWorker: { $ne: null } } },
//       { $group: {
//         _id: "$embroideryWorker",
//         count: { $sum: 1 }
//       }},
//       { $group: {
//         _id: null,
//         avgWorkPerEmbroideryWorker: { $avg: "$count" },
//         maxWork: { $max: "$count" },
//         minWork: { $min: "$count" },
//         totalAssigned: { $sum: "$count" }
//       }}
//     ]);

//     res.json({
//       embroideryWorkerStats: stats[0] || { total: 0, available: 0, onLeave: 0, present: 0, halfDay: 0, holiday: 0 },
//       workDistribution: workDistribution[0] || { avgWorkPerEmbroideryWorker: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
//     });
//   } catch (error) {
//     console.error("Get embroideryWorker stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== TEMPORARY: FIX ALL EMBROIDERY_WORKER STATS =====
// export const fixAllEmbroideryWorkerStats = async (req, res) => {
//   try {
//     const embroideryWorkers = await EmbroideryWorker.find({ isActive: true });
//     let updated = 0;
//     let fixed = [];

//     for (let embroideryWorker of embroideryWorkers) {
//       const works = await Work.find({ 
//         embroideryWorker: embroideryWorker._id,
//         isActive: true 
//       });

//       const workStats = {
//         totalAssigned: works.length,
//         completed: works.filter(w => w.status === 'ready-to-deliver').length,
//         pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
//         inProgress: works.filter(w => 
//           ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//           .includes(w.status)
//         ).length
//       };

//       // Only update if stats are different
//       if (JSON.stringify(embroideryWorker.workStats) !== JSON.stringify(workStats)) {
//         embroideryWorker.workStats = workStats;
//         await embroideryWorker.save();
//         updated++;
//         fixed.push({
//           name: embroideryWorker.name,
//           embroideryWorkerId: embroideryWorker.embroideryWorkerId,
//           oldStats: embroideryWorker.workStats,
//           newStats: workStats
//         });
//       }
//     }

//     res.json({
//       message: `Fixed stats for ${updated} embroideryWorkers`,
//       updated,
//       fixed
//     });
//   } catch (error) {
//     console.error("Fix stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };




// // Add to controllers/embroideryWorker.controller.js after getEmbroideryWorkerStats

// // ============================================
// // ✅ GET TOP PERFORMING EMBROIDERY_WORKERS (NEW)
// // ============================================
// export const getTopEmbroideryWorkers = async (req, res) => {
//   try {
//     const { limit = 5 } = req.query;

//     // Get all active embroideryWorkers
//     const embroideryWorkers = await EmbroideryWorker.find({ isActive: true })
//       .select('name embroideryWorkerId specialization experience workStats isAvailable leaveStatus')
//       .lean();

//     // Get all works with status for completion calculation
//     const works = await Work.find({ 
//       isActive: true,
//       embroideryWorker: { $ne: null }
//     })
//       .select('embroideryWorker status')
//       .lean();

//     // Calculate completed orders per embroideryWorker
//     const completedCounts = {};
//     works.forEach(work => {
//       if (work.embroideryWorker && work.status === 'ready-to-delivery') {
//         const embroideryWorkerId = work.embroideryWorker.toString();
//         completedCounts[embroideryWorkerId] = (completedCounts[embroideryWorkerId] || 0) + 1;
//       }
//     });

//     // Calculate average completion time (mock for now - implement based on your data)
//     // You can add createdAt and completedAt fields to works for accurate calculation

//     // Enhance embroideryWorkers with calculated data
//     const enhancedEmbroideryWorkers = embroideryWorkers.map(embroideryWorker => ({
//       _id: embroideryWorker._id,
//       name: embroideryWorker.name,
//       embroideryWorkerId: embroideryWorker.embroideryWorkerId,
//       specialization: embroideryWorker.specialization || 'General',
//       experience: embroideryWorker.experience || 0,
//       completedOrders: completedCounts[embroideryWorker._id.toString()] || 0,
//       totalAssigned: embroideryWorker.workStats?.totalAssigned || 0,
//       isAvailable: embroideryWorker.isAvailable,
//       leaveStatus: embroideryWorker.leaveStatus
//     }));

//     // Sort by completed orders and take top performers
//     const topEmbroideryWorkers = enhancedEmbroideryWorkers
//       .sort((a, b) => b.completedOrders - a.completedOrders)
//       .slice(0, parseInt(limit));

//     // Calculate average completion time (placeholder)
//     const avgCompletionTime = "4.5 days"; // You can calculate this from actual data

//     res.json({
//       success: true,
//       topEmbroideryWorkers,
//       summary: {
//         averageCompletionTime: avgCompletionTime,
//         totalActiveEmbroideryWorkers: embroideryWorkers.length,
//         totalCompletedOrders: Object.values(completedCounts).reduce((a, b) => a + b, 0)
//       }
//     });

//   } catch (error) {
//     console.error("❌ Get top embroideryWorkers error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ GET EMBROIDERY_WORKER PERFORMANCE REPORT (NEW)
// // ============================================
// export const getEmbroideryWorkerPerformance = async (req, res) => {
//   try {
//     const { period = 'month' } = req.query;

//     let startDate = new Date();
//     const endDate = new Date();
    
//     if (period === 'month') {
//       startDate.setMonth(startDate.getMonth() - 1);
//     } else if (period === 'quarter') {
//       startDate.setMonth(startDate.getMonth() - 3);
//     } else if (period === 'year') {
//       startDate.setFullYear(startDate.getFullYear() - 1);
//     }

//     // Get works completed in the period
//     const completedWorks = await Work.find({
//       status: 'ready-to-delivery',
//       updatedAt: { $gte: startDate, $lte: endDate },
//       embroideryWorker: { $ne: null }
//     })
//       .populate('embroideryWorker', 'name embroideryWorkerId')
//       .lean();

//     // Group by embroideryWorker
//     const performance = {};
//     completedWorks.forEach(work => {
//       if (work.embroideryWorker) {
//         const embroideryWorkerId = work.embroideryWorker._id.toString();
//         if (!performance[embroideryWorkerId]) {
//           performance[embroideryWorkerId] = {
//             embroideryWorker: work.embroideryWorker,
//             completedCount: 0,
//             works: []
//           };
//         }
//         performance[embroideryWorkerId].completedCount++;
//         performance[embroideryWorkerId].works.push({
//           workId: work.workId,
//           completedAt: work.updatedAt
//         });
//       }
//     });

//     const performanceArray = Object.values(performance)
//       .sort((a, b) => b.completedCount - a.completedCount);

//     res.json({
//       success: true,
//       period,
//       dateRange: { start: startDate, end: endDate },
//       performance: performanceArray
//     });

//   } catch (error) {
//     console.error("❌ Get embroideryWorker performance error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// controllers/embroideryWorker.controller.js
import EmbroideryWorker from "../models/EmbroideryWorker.js";
import Work from "../models/Work.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ===== CREATE EMBROIDERY_WORKER =====
export const createEmbroideryWorker = async (req, res) => {
  try {
    console.log("📝 Creating embroideryWorker with data:", {
      ...req.body,
      password: req.body.password ? '[PRESENT]' : '[MISSING]'
    });
    
    const { name, phone, email, password, address, specialization, experience, basicSalary } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Check if phone already exists
    const existingPhone = await EmbroideryWorker.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "EmbroideryWorker with this phone number already exists" });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await EmbroideryWorker.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "EmbroideryWorker with this email already exists" });
      }
    }

    // Generate embroideryWorkerId
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await EmbroideryWorker.countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    const embroideryWorkerId = `AAR${year}${month}${sequence}`;

    // Create embroideryWorker with ALL fields
    const embroideryWorker = new EmbroideryWorker({
      embroideryWorkerId,
      name,
      phone,
      email: email || undefined,
      password,
      address: address || {},
      specialization: specialization || [],
      experience: experience || 0,
      basicSalary: basicSalary || 0,
      createdBy: req.user?._id,
      joiningDate: new Date(),
      isActive: true,
      isAvailable: true,
      leaveStatus: "present",
      workStats: {
        totalAssigned: 0,
        completed: 0,
        pending: 0,
        inProgress: 0
      },
      performance: {
        rating: 0,
        feedback: []
      }
    });

    console.log("💾 Saving embroideryWorker with ID:", embroideryWorkerId);
    await embroideryWorker.save();
    console.log("✅ EmbroideryWorker created with ID:", embroideryWorker.embroideryWorkerId);

    // Create user account
    let user = null;
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        name,
        email: email || `${phone}@embroideryWorker.dreamfit.com`,
        phone,
        role: "EMBROIDERY_WORKER",
        password: hashedPassword,
        embroideryWorkerId: embroideryWorker._id,
        isActive: true
      });
      console.log("✅ User account created for embroideryWorker");
    } catch (userError) {
      console.log("⚠️ User account creation failed:", userError.message);
    }

    const embroideryWorkerResponse = embroideryWorker.toObject();
    delete embroideryWorkerResponse.password;
    
    res.status(201).json({
      message: "EmbroideryWorker created successfully",
      embroideryWorker: embroideryWorkerResponse,
      user: user ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      } : null
    });
  } catch (error) {
    console.error("❌ Create embroideryWorker error:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists. Please use a different value.` 
      });
    }
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      console.error("Validation errors:", errors);
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// // ===== GET ALL EMBROIDERY_WORKERS =====
// export const getAllEmbroideryWorkers = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { embroideryWorkerId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (status && status !== 'all') {
//       query.leaveStatus = status;
//     }

//     if (availability && availability !== 'all') {
//       query.isAvailable = availability === 'available';
//     }

//     const embroideryWorkers = await EmbroideryWorker.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // ✅ Calculate workStats from actual works for each embroideryWorker
//     for (let embroideryWorker of embroideryWorkers) {
//       const works = await Work.find({ 
//         embroideryWorker: embroideryWorker._id,
//         isActive: true 
//       });

//       const workStats = {
//         totalAssigned: works.length,
//         completed: works.filter(w => w.status === 'ready-to-deliver').length,
//         pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
//         inProgress: works.filter(w => 
//           ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//           .includes(w.status)
//         ).length
//       };

//       // Update the embroideryWorker object in memory (don't save to DB for performance)
//       embroideryWorker.workStats = workStats;
//     }

//     res.json(embroideryWorkers);
//   } catch (error) {
//     console.error("Get all embroideryWorkers error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
export const getAllEmbroideryWorkers = async (req, res) => {
  try {
    const { search, status, availability } = req.query;
    let matchQuery = { isActive: true };

    // 1. Search Logic
    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { embroideryWorkerId: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Filter Logic
    if (status && status !== 'all') {
      matchQuery.leaveStatus = status;
    }

    if (availability && availability !== 'all') {
      matchQuery.isAvailable = availability === 'available';
    }

    // 🚀 HIGH-PERFORMANCE AGGREGATION PIPELINE
    const embroideryWorkers = await EmbroideryWorker.aggregate([
      { $match: matchQuery },
      { $sort: { createdAt: -1 } },
      
      // 🔥 Join with Work collection (Single Call)
      {
        $lookup: {
          from: "works", // Unga Work collection name check pannikonga
          localField: "_id",
          foreignField: "embroideryWorker",
          as: "allWorks"
        }
      },

      // 📊 Calculate stats in Backend itself
      {
        $addFields: {
          workStats: {
            totalAssigned: { 
              $size: { $filter: { input: "$allWorks", as: "w", cond: { $eq: ["$$w.isActive", true] } } } 
            },
            completed: { 
              $size: { $filter: { input: "$allWorks", as: "w", cond: { $eq: ["$$w.status", "ready-to-deliver"] } } } 
            },
            pending: { 
              $size: { $filter: { input: "$allWorks", as: "w", cond: { $in: ["$$w.status", ["pending", "accepted"]] } } } 
            },
            inProgress: { 
              $size: { $filter: { input: "$allWorks", as: "w", cond: { 
                $in: ["$$w.status", ["cutting-started", "cutting-completed", "sewing-started", "sewing-completed", "ironing"]] 
              } } } 
            }
          }
        }
      },

      // 🧹 Clean up: remove the heavy works array, only keep stats
      { $project: { allWorks: 0 } }
    ]);

    res.status(200).json(embroideryWorkers);

  } catch (error) {
    console.error("❌ High-Perf EmbroideryWorker Fetch Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ===== GET EMBROIDERY_WORKER BY ID =====
export const getEmbroideryWorkerById = async (req, res) => {
  try {
    const embroideryWorker = await EmbroideryWorker.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate({
        path: 'performance.feedback.from',
        select: 'name'
      });

    if (!embroideryWorker) {
      return res.status(404).json({ message: "EmbroideryWorker not found" });
    }

    // ✅ Get all works assigned to this embroideryWorker
    const works = await Work.find({ 
      embroideryWorker: embroideryWorker._id,
      isActive: true 
    })
      .populate({
        path: 'order',
        select: 'orderId customer deliveryDate',
        populate: {
          path: 'customer',
          select: 'name'
        }
      })
      .populate({
        path: 'garment',
        select: 'name garmentId measurements priceRange'
      })
      .populate('cuttingMaster', 'name')
      .sort({ createdAt: -1 });

    // ✅ Calculate work statistics from actual works
    const workStats = {
      totalAssigned: works.length,
      completed: works.filter(w => w.status === 'ready-to-deliver').length,
      pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
      inProgress: works.filter(w => 
        ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
        .includes(w.status)
      ).length
    };

    console.log('📊 Recalculated workStats for embroideryWorker:', {
      embroideryWorkerId: embroideryWorker.embroideryWorkerId,
      name: embroideryWorker.name,
      totalWorks: works.length,
      workStats,
      worksBreakdown: works.map(w => ({
        workId: w.workId,
        status: w.status
      }))
    });

    // ✅ Update the embroideryWorker's workStats in database
    embroideryWorker.workStats = workStats;
    await embroideryWorker.save();

    res.json({
      embroideryWorker,
      works,
      workStats
    });
  } catch (error) {
    console.error("Get embroideryWorker error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE EMBROIDERY_WORKER =====
export const updateEmbroideryWorker = async (req, res) => {
  try {
    const embroideryWorker = await EmbroideryWorker.findById(req.params.id);

    if (!embroideryWorker) {
      return res.status(404).json({ message: "EmbroideryWorker not found" });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isStoreKeeper = req.user.role === 'STORE_KEEPER';
    const isEmbroideryWorkerSelf = req.user.embroideryWorkerId?.toString() === embroideryWorker._id.toString();

    if (!isAdmin && !isStoreKeeper && !isEmbroideryWorkerSelf) {
      return res.status(403).json({ message: "Not authorized to update this embroideryWorker" });
    }

    const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience', 'basicSalary'];
    
    if (isAdmin || isStoreKeeper) {
      updatableFields.push('isAvailable', 'leaveStatus', 'leaveFrom', 'leaveTo', 'leaveReason');
    }

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        embroideryWorker[field] = req.body[field];
      }
    });

    await embroideryWorker.save();

    if (isAdmin || isStoreKeeper) {
      await User.findOneAndUpdate(
        { embroideryWorkerId: embroideryWorker._id },
        { 
          name: embroideryWorker.name,
          email: embroideryWorker.email,
          phone: embroideryWorker.phone,
          isActive: embroideryWorker.isActive
        }
      );
    }

    res.json({
      message: "EmbroideryWorker updated successfully",
      embroideryWorker
    });
  } catch (error) {
    console.error("Update embroideryWorker error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE LEAVE STATUS =====
export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
    const embroideryWorker = await EmbroideryWorker.findById(req.params.id);

    if (!embroideryWorker) {
      return res.status(404).json({ message: "EmbroideryWorker not found" });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isStoreKeeper = req.user.role === 'STORE_KEEPER';
    const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
    const isEmbroideryWorkerSelf = req.user.embroideryWorkerId?.toString() === embroideryWorker._id.toString();

    if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isEmbroideryWorkerSelf) {
      return res.status(403).json({ message: "Not authorized to update leave status" });
    }

    if (leaveFrom && leaveTo) {
      const fromDate = new Date(leaveFrom);
      const toDate = new Date(leaveTo);
      
      if (toDate < fromDate) {
        return res.status(400).json({ 
          message: "Leave to date cannot be before from date" 
        });
      }
    }

    embroideryWorker.leaveStatus = leaveStatus;
    embroideryWorker.isAvailable = leaveStatus === 'present';
    
    if (leaveFrom) embroideryWorker.leaveFrom = leaveFrom;
    if (leaveTo) embroideryWorker.leaveTo = leaveTo;
    if (leaveReason) embroideryWorker.leaveReason = leaveReason;

    await embroideryWorker.save();

    res.json({
      message: `Leave status updated to ${leaveStatus}`,
      embroideryWorker
    });
  } catch (error) {
    console.error("Update leave status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== DELETE EMBROIDERY_WORKER (soft delete) =====
export const deleteEmbroideryWorker = async (req, res) => {
  try {
    const embroideryWorker = await EmbroideryWorker.findById(req.params.id);

    if (!embroideryWorker) {
      return res.status(404).json({ message: "EmbroideryWorker not found" });
    }

    // ✅ Check if embroideryWorker has active works
    const activeWorks = await Work.countDocuments({
      embroideryWorker: embroideryWorker._id,
      status: { $nin: ['ready-to-deliver', 'cancelled'] }
    });

    if (activeWorks > 0) {
      return res.status(400).json({ 
        message: `Cannot delete embroideryWorker with ${activeWorks} active works. Complete or reassign works first.` 
      });
    }

    embroideryWorker.isActive = false;
    await embroideryWorker.save();

    await User.findOneAndUpdate(
      { embroideryWorkerId: embroideryWorker._id },
      { isActive: false }
    );

    res.json({ message: "EmbroideryWorker deleted successfully" });
  } catch (error) {
    console.error("Delete embroideryWorker error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== ✅ SINGLE getEmbroideryWorkerStats FUNCTION (Dashboard Compatible) =====
export const getEmbroideryWorkerStats = async (req, res) => {
  try {
    console.log('📊 Getting embroideryWorker stats for dashboard');
    
    const stats = await EmbroideryWorker.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$isAvailable", true] },
                  { $eq: ["$leaveStatus", "present"] }
                ]},
                1, 0
              ]
            }
          },
          busy: {
            $sum: {
              $cond: [
                { $eq: ["$isAvailable", false] },
                1, 0
              ]
            }
          },
          onLeave: {
            $sum: {
              $cond: [
                { $eq: ["$leaveStatus", "leave"] },
                1, 0
              ]
            }
          },
          present: {
            $sum: {
              $cond: [
                { $eq: ["$leaveStatus", "present"] },
                1, 0
              ]
            }
          },
          halfDay: {
            $sum: {
              $cond: [
                { $eq: ["$leaveStatus", "half-day"] },
                1, 0
              ]
            }
          },
          holiday: {
            $sum: {
              $cond: [
                { $eq: ["$leaveStatus", "holiday"] },
                1, 0
              ]
            }
          }
        }
      }
    ]);

    // ✅ Get work distribution using actual works
    const workDistribution = await Work.aggregate([
      { $match: { isActive: true, embroideryWorker: { $ne: null } } },
      { $group: {
        _id: "$embroideryWorker",
        count: { $sum: 1 }
      }},
      { $group: {
        _id: null,
        avgWorkPerEmbroideryWorker: { $avg: "$count" },
        maxWork: { $max: "$count" },
        minWork: { $min: "$count" },
        totalAssigned: { $sum: "$count" }
      }}
    ]);

    const result = stats[0] || {
      total: 0,
      active: 0,
      busy: 0,
      onLeave: 0,
      present: 0,
      halfDay: 0,
      holiday: 0
    };

    console.log('✅ EmbroideryWorker stats:', result);

    res.json({
      embroideryWorkerStats: result,
      workDistribution: workDistribution[0] || { avgWorkPerEmbroideryWorker: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
    });

  } catch (error) {
    console.error('❌ Get embroideryWorker stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// ✅ GET TOP PERFORMING EMBROIDERY_WORKERS (For Dashboard)
// ============================================
export const getTopEmbroideryWorkers = async (req, res) => {
  try {
    const { limit = 5, period = 'month' } = req.query;
    
    console.log(`🏆 Getting top ${limit} embroideryWorkers for period: ${period}`);

    // Calculate date range based on period
    let startDate = new Date();
    const endDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'quarter') {
      startDate.setMonth(startDate.getMonth() - 3);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Get all active embroideryWorkers
    const embroideryWorkers = await EmbroideryWorker.find({ isActive: true })
      .select('name embroideryWorkerId specialization experience workStats isAvailable leaveStatus')
      .lean();

    // Get works completed in the period
    const completedWorks = await Work.find({
      status: 'ready-to-deliver',
      updatedAt: { $gte: startDate, $lte: endDate },
      embroideryWorker: { $ne: null }
    })
      .select('embroideryWorker')
      .lean();

    // Count completed works per embroideryWorker
    const completedCounts = {};
    completedWorks.forEach(work => {
      if (work.embroideryWorker) {
        const embroideryWorkerId = work.embroideryWorker.toString();
        completedCounts[embroideryWorkerId] = (completedCounts[embroideryWorkerId] || 0) + 1;
      }
    });

    // Enhance embroideryWorkers with calculated data
    const enhancedEmbroideryWorkers = embroideryWorkers.map(embroideryWorker => ({
      _id: embroideryWorker._id,
      name: embroideryWorker.name,
      embroideryWorkerId: embroideryWorker.embroideryWorkerId,
      specialization: Array.isArray(embroideryWorker.specialization) ? embroideryWorker.specialization[0] : embroideryWorker.specialization || 'General',
      experience: embroideryWorker.experience || 0,
      completedOrders: completedCounts[embroideryWorker._id.toString()] || 0,
      totalAssigned: embroideryWorker.workStats?.totalAssigned || 0,
      isAvailable: embroideryWorker.isAvailable,
      leaveStatus: embroideryWorker.leaveStatus,
      // Calculate efficiency (completed / total assigned)
      efficiency: embroideryWorker.workStats?.totalAssigned > 0 
        ? Math.round((embroideryWorker.workStats.completed / embroideryWorker.workStats.totalAssigned) * 100) 
        : 0
    }));

    // Sort by completed orders and take top performers
    const topEmbroideryWorkers = enhancedEmbroideryWorkers
      .sort((a, b) => b.completedOrders - a.completedOrders)
      .slice(0, parseInt(limit));

    console.log(`✅ Top ${topEmbroideryWorkers.length} embroideryWorkers prepared`);

    res.json({
      success: true,
      topEmbroideryWorkers,
      summary: {
        averageCompletionTime: "4.5 days",
        totalActiveEmbroideryWorkers: embroideryWorkers.length,
        totalCompletedOrders: Object.values(completedCounts).reduce((a, b) => a + b, 0),
        period,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });

  } catch (error) {
    console.error('❌ Get top embroideryWorkers error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// ✅ GET EMBROIDERY_WORKER PERFORMANCE REPORT (For Dashboard)
// ============================================
export const getEmbroideryWorkerPerformance = async (req, res) => {
  try {
    const { period = 'month', embroideryWorkerId } = req.query;

    console.log('📈 Getting embroideryWorker performance for period:', period);

    // Calculate date range
    let startDate = new Date();
    const endDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'quarter') {
      startDate.setMonth(startDate.getMonth() - 3);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Build query
    const query = {
      status: 'ready-to-deliver',
      updatedAt: { $gte: startDate, $lte: endDate },
      embroideryWorker: { $ne: null }
    };

    // If specific embroideryWorker requested
    if (embroideryWorkerId) {
      query.embroideryWorker = embroideryWorkerId;
    }

    // Get completed works with details
    const works = await Work.find(query)
      .populate('embroideryWorker', 'name embroideryWorkerId')
      .populate({
        path: 'order',
        select: 'orderId customer',
        populate: {
          path: 'customer',
          select: 'name'
        }
      })
      .populate('garment', 'name')
      .sort({ updatedAt: -1 })
      .lean();

    // Group by embroideryWorker if not specified
    let performance = [];
    
    if (embroideryWorkerId) {
      // Single embroideryWorker performance
      const embroideryWorker = works[0]?.embroideryWorker;
      performance = [{
        embroideryWorker,
        works: works.map(w => ({
          workId: w.workId,
          orderId: w.order?.orderId,
          customer: w.order?.customer?.name,
          garment: w.garment?.name,
          completedAt: w.updatedAt
        })),
        totalCompleted: works.length
      }];
    } else {
      // Group by embroideryWorker
      const embroideryWorkerMap = new Map();
      
      works.forEach(work => {
        if (work.embroideryWorker) {
          const embroideryWorkerId = work.embroideryWorker._id.toString();
          if (!embroideryWorkerMap.has(embroideryWorkerId)) {
            embroideryWorkerMap.set(embroideryWorkerId, {
              embroideryWorker: work.embroideryWorker,
              works: [],
              totalCompleted: 0
            });
          }
          const entry = embroideryWorkerMap.get(embroideryWorkerId);
          entry.works.push({
            workId: w.workId,
            orderId: w.order?.orderId,
            customer: w.order?.customer?.name,
            garment: w.garment?.name,
            completedAt: w.updatedAt
          });
          entry.totalCompleted++;
        }
      });

      performance = Array.from(embroideryWorkerMap.values())
        .sort((a, b) => b.totalCompleted - a.totalCompleted);
    }

    // Calculate summary statistics
    const totalCompleted = works.length;
    const activeEmbroideryWorkers = performance.length;
    const avgPerEmbroideryWorker = activeEmbroideryWorkers > 0 ? Math.round(totalCompleted / activeEmbroideryWorkers) : 0;

    const summary = {
      totalCompleted,
      activeEmbroideryWorkers,
      avgPerEmbroideryWorker,
      period,
      dateRange: {
        start: startDate,
        end: endDate
      }
    };

    console.log('✅ Performance data prepared:', summary);

    res.json({
      success: true,
      period,
      dateRange: { start: startDate, end: endDate },
      performance,
      summary
    });

  } catch (error) {
    console.error('❌ Get embroideryWorker performance error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== TEMPORARY: FIX ALL EMBROIDERY_WORKER STATS =====
export const fixAllEmbroideryWorkerStats = async (req, res) => {
  try {
    const embroideryWorkers = await EmbroideryWorker.find({ isActive: true });
    let updated = 0;
    let fixed = [];

    for (let embroideryWorker of embroideryWorkers) {
      const works = await Work.find({ 
        embroideryWorker: embroideryWorker._id,
        isActive: true 
      });

      const workStats = {
        totalAssigned: works.length,
        completed: works.filter(w => w.status === 'ready-to-deliver').length,
        pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
        inProgress: works.filter(w => 
          ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
          .includes(w.status)
        ).length
      };

      // Only update if stats are different
      if (JSON.stringify(embroideryWorker.workStats) !== JSON.stringify(workStats)) {
        embroideryWorker.workStats = workStats;
        await embroideryWorker.save();
        updated++;
        fixed.push({
          name: embroideryWorker.name,
          embroideryWorkerId: embroideryWorker.embroideryWorkerId,
          oldStats: embroideryWorker.workStats,
          newStats: workStats
        });
      }
    }

    res.json({
      message: `Fixed stats for ${updated} embroideryWorkers`,
      updated,
      fixed
    });
  } catch (error) {
    console.error("Fix stats error:", error);
    res.status(500).json({ message: error.message });
  }
};