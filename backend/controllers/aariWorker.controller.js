// import AariWorker from "../models/AariWorker.js";
// import Work from "../models/Work.js";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";

// // ===== CREATE AARI_WORKER =====
// // ===== CREATE AARI_WORKER =====
// export const createAariWorker = async (req, res) => {
//   try {
//     console.log("📝 Creating aariWorker with data:", {
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
//     const existingPhone = await AariWorker.findOne({ phone });
//     if (existingPhone) {
//       return res.status(400).json({ message: "AariWorker with this phone number already exists" });
//     }

//     // Check if email already exists (if provided)
//     if (email) {
//       const existingEmail = await AariWorker.findOne({ email });
//       if (existingEmail) {
//         return res.status(400).json({ message: "AariWorker with this email already exists" });
//       }
//     }

//     // Generate aariWorkerId manually (since pre-save hook might not be running)
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await AariWorker.countDocuments();
//     const sequence = String(count + 1).padStart(4, '0');
//     const aariWorkerId = `AAR${year}${month}${sequence}`;

//     // Create aariWorker with ALL fields
//     const aariWorker = new AariWorker({
//       aariWorkerId, // Set manually to ensure it's there
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

//     console.log("💾 Saving aariWorker with ID:", aariWorkerId);
    
//     // Save to database
//     await aariWorker.save();
    
//     console.log("✅ AariWorker created with ID:", aariWorker.aariWorkerId);

//     // Create user account with the SAME password
//     let user = null;
//     try {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt); // Use the provided password

//       user = await User.create({
//         name,
//         email: email || `${phone}@aariWorker.dreamfit.com`,
//         phone,
//         role: "AARI_WORKER",
//         password: hashedPassword,
//         aariWorkerId: aariWorker._id,
//         isActive: true
//       });
//       console.log("✅ User account created for aariWorker");
//     } catch (userError) {
//       console.log("⚠️ User account creation failed:", userError.message);
//       // Don't fail the whole request if user creation fails
//     }

//     // Return success response (excluding password)
//     const aariWorkerResponse = aariWorker.toObject();
//     delete aariWorkerResponse.password;
    
//     res.status(201).json({
//       message: "AariWorker created successfully",
//       aariWorker: aariWorkerResponse,
//       user: user ? {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       } : null
//     });
//   } catch (error) {
//     console.error("❌ Create aariWorker error:", error);
    
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
// // ===== GET ALL AARI_WORKERS =====
// export const getAllAariWorkers = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     // Search by name, phone, email, aariWorkerId
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { aariWorkerId: { $regex: search, $options: 'i' } }
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

//     const aariWorkers = await AariWorker.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // Get work statistics for each aariWorker
//     for (let aariWorker of aariWorkers) {
//       const workStats = await Work.aggregate([
//         { $match: { assignedTo: aariWorker._id, isActive: true } },
//         { $group: {
//           _id: null,
//           total: { $sum: 1 },
//           completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
//           pending: { $sum: { $cond: [{ $in: ["$status", ["pending", "accepted"]] }, 1, 0] } },
//           inProgress: { $sum: { $cond: [{ $in: ["$status", ["cutting", "stitching", "iron"]] }, 1, 0] } }
//         }}
//       ]);

//       if (workStats.length > 0) {
//         aariWorker.workStats = workStats[0];
//       } else {
//         aariWorker.workStats = { total: 0, completed: 0, pending: 0, inProgress: 0 };
//       }
//     }

//     res.json(aariWorkers);
//   } catch (error) {
//     console.error("Get all aariWorkers error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET AARI_WORKER BY ID =====
// export const getAariWorkerById = async (req, res) => {
//   try {
//     const aariWorker = await AariWorker.findById(req.params.id)
//       .populate('createdBy', 'name')
//       .populate({
//         path: 'performance.feedback.from',
//         select: 'name'
//       });

//     if (!aariWorker) {
//       return res.status(404).json({ message: "AariWorker not found" });
//     }

//     // Get all works assigned to this aariWorker
//     const works = await Work.find({ 
//       assignedTo: aariWorker._id,
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
//       aariWorker,
//       works,
//       workStats
//     });
//   } catch (error) {
//     console.error("Get aariWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE AARI_WORKER =====
// export const updateAariWorker = async (req, res) => {
//   try {
//     const aariWorker = await AariWorker.findById(req.params.id);

//     if (!aariWorker) {
//       return res.status(404).json({ message: "AariWorker not found" });
//     }

//     // Check permissions
//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isAariWorkerSelf = req.user.aariWorkerId?.toString() === aariWorker._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isAariWorkerSelf) {
//       return res.status(403).json({ message: "Not authorized to update this aariWorker" });
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
//         aariWorker[field] = req.body[field];
//       }
//     });

//     await aariWorker.save();

//     // Update corresponding user account if needed
//     if (isAdmin || isStoreKeeper) {
//       await User.findOneAndUpdate(
//         { aariWorkerId: aariWorker._id },
//         { 
//           name: aariWorker.name,
//           email: aariWorker.email,
//           phone: aariWorker.phone,
//           isActive: aariWorker.isActive
//         }
//       );
//     }

//     res.json({
//       message: "AariWorker updated successfully",
//       aariWorker
//     });
//   } catch (error) {
//     console.error("Update aariWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE LEAVE STATUS =====
// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatus = async (req, res) => {
//   try {
//     const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
//     const aariWorker = await AariWorker.findById(req.params.id);

//     if (!aariWorker) {
//       return res.status(404).json({ message: "AariWorker not found" });
//     }

//     // Check permissions
//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
//     const isAariWorkerSelf = req.user.aariWorkerId?.toString() === aariWorker._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isAariWorkerSelf) {
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

//     aariWorker.leaveStatus = leaveStatus;
//     aariWorker.isAvailable = leaveStatus === 'present';
    
//     if (leaveFrom) aariWorker.leaveFrom = leaveFrom;
//     if (leaveTo) aariWorker.leaveTo = leaveTo;
//     if (leaveReason) aariWorker.leaveReason = leaveReason;

//     await aariWorker.save();

//     res.json({
//       message: `Leave status updated to ${leaveStatus}`,
//       aariWorker
//     });
//   } catch (error) {
//     console.error("Update leave status error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE AARI_WORKER (soft delete) =====
// export const deleteAariWorker = async (req, res) => {
//   try {
//     const aariWorker = await AariWorker.findById(req.params.id);

//     if (!aariWorker) {
//       return res.status(404).json({ message: "AariWorker not found" });
//     }

//     // Check if aariWorker has active works
//     const activeWorks = await Work.countDocuments({
//       assignedTo: aariWorker._id,
//       status: { $nin: ['completed', 'cancelled'] }
//     });

//     if (activeWorks > 0) {
//       return res.status(400).json({ 
//         message: `Cannot delete aariWorker with ${activeWorks} active works. Complete or reassign works first.` 
//       });
//     }

//     aariWorker.isActive = false;
//     await aariWorker.save();

//     // Also deactivate user account
//     await User.findOneAndUpdate(
//       { aariWorkerId: aariWorker._id },
//       { isActive: false }
//     );

//     res.json({ message: "AariWorker deleted successfully" });
//   } catch (error) {
//     console.error("Delete aariWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET AARI_WORKER STATISTICS =====
// export const getAariWorkerStats = async (req, res) => {
//   try {
//     const stats = await AariWorker.aggregate([
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
//         avgWorkPerAariWorker: { $avg: "$count" },
//         maxWork: { $max: "$count" },
//         minWork: { $min: "$count" },
//         totalAssigned: { $sum: "$count" }
//       }}
//     ]);

//     res.json({
//       aariWorkerStats: stats[0] || { total: 0, available: 0, onLeave: 0, present: 0, halfDay: 0, holiday: 0 },
//       workDistribution: workDistribution[0] || { avgWorkPerAariWorker: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
//     });
//   } catch (error) {
//     console.error("Get aariWorker stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // controllers/aariWorker.controller.js
// import AariWorker from "../models/AariWorker.js";
// import Work from "../models/Work.js";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";

// // ===== CREATE AARI_WORKER =====
// export const createAariWorker = async (req, res) => {
//   try {
//     console.log("📝 Creating aariWorker with data:", {
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
//     const existingPhone = await AariWorker.findOne({ phone });
//     if (existingPhone) {
//       return res.status(400).json({ message: "AariWorker with this phone number already exists" });
//     }

//     // Check if email already exists (if provided)
//     if (email) {
//       const existingEmail = await AariWorker.findOne({ email });
//       if (existingEmail) {
//         return res.status(400).json({ message: "AariWorker with this email already exists" });
//       }
//     }

//     // Generate aariWorkerId
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await AariWorker.countDocuments();
//     const sequence = String(count + 1).padStart(4, '0');
//     const aariWorkerId = `AAR${year}${month}${sequence}`;

//     // Create aariWorker with ALL fields
//     const aariWorker = new AariWorker({
//       aariWorkerId,
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

//     console.log("💾 Saving aariWorker with ID:", aariWorkerId);
//     await aariWorker.save();
//     console.log("✅ AariWorker created with ID:", aariWorker.aariWorkerId);

//     // Create user account
//     let user = null;
//     try {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       user = await User.create({
//         name,
//         email: email || `${phone}@aariWorker.dreamfit.com`,
//         phone,
//         role: "AARI_WORKER",
//         password: hashedPassword,
//         aariWorkerId: aariWorker._id,
//         isActive: true
//       });
//       console.log("✅ User account created for aariWorker");
//     } catch (userError) {
//       console.log("⚠️ User account creation failed:", userError.message);
//     }

//     const aariWorkerResponse = aariWorker.toObject();
//     delete aariWorkerResponse.password;
    
//     res.status(201).json({
//       message: "AariWorker created successfully",
//       aariWorker: aariWorkerResponse,
//       user: user ? {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       } : null
//     });
//   } catch (error) {
//     console.error("❌ Create aariWorker error:", error);
    
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

// // ===== GET ALL AARI_WORKERS =====
// export const getAllAariWorkers = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { aariWorkerId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (status && status !== 'all') {
//       query.leaveStatus = status;
//     }

//     if (availability && availability !== 'all') {
//       query.isAvailable = availability === 'available';
//     }

//     const aariWorkers = await AariWorker.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // ✅ FIXED: Use correct field name 'aariWorker' not 'assignedTo'
//     for (let aariWorker of aariWorkers) {
//       const works = await Work.find({ 
//         aariWorker: aariWorker._id,  // ✅ CORRECT: using 'aariWorker' field
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

//       aariWorker.workStats = workStats;
//     }

//     res.json(aariWorkers);
//   } catch (error) {
//     console.error("Get all aariWorkers error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET AARI_WORKER BY ID =====
// export const getAariWorkerById = async (req, res) => {
//   try {
//     const aariWorker = await AariWorker.findById(req.params.id)
//       .populate('createdBy', 'name')
//       .populate({
//         path: 'performance.feedback.from',
//         select: 'name'
//       });

//     if (!aariWorker) {
//       return res.status(404).json({ message: "AariWorker not found" });
//     }

//     // ✅ FIXED: Get all works assigned to this aariWorker using 'aariWorker' field
//     const works = await Work.find({ 
//       aariWorker: aariWorker._id,  // ✅ CORRECT: using 'aariWorker' field
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

//     // Update aariWorker's workStats in database
//     aariWorker.workStats = workStats;
//     await aariWorker.save();

//     res.json({
//       aariWorker,
//       works,
//       workStats
//     });
//   } catch (error) {
//     console.error("Get aariWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE AARI_WORKER =====
// export const updateAariWorker = async (req, res) => {
//   try {
//     const aariWorker = await AariWorker.findById(req.params.id);

//     if (!aariWorker) {
//       return res.status(404).json({ message: "AariWorker not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isAariWorkerSelf = req.user.aariWorkerId?.toString() === aariWorker._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isAariWorkerSelf) {
//       return res.status(403).json({ message: "Not authorized to update this aariWorker" });
//     }

//     const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience'];
    
//     if (isAdmin || isStoreKeeper) {
//       updatableFields.push('isAvailable', 'leaveStatus', 'leaveFrom', 'leaveTo', 'leaveReason');
//     }

//     updatableFields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         aariWorker[field] = req.body[field];
//       }
//     });

//     await aariWorker.save();

//     if (isAdmin || isStoreKeeper) {
//       await User.findOneAndUpdate(
//         { aariWorkerId: aariWorker._id },
//         { 
//           name: aariWorker.name,
//           email: aariWorker.email,
//           phone: aariWorker.phone,
//           isActive: aariWorker.isActive
//         }
//       );
//     }

//     res.json({
//       message: "AariWorker updated successfully",
//       aariWorker
//     });
//   } catch (error) {
//     console.error("Update aariWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatus = async (req, res) => {
//   try {
//     const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
//     const aariWorker = await AariWorker.findById(req.params.id);

//     if (!aariWorker) {
//       return res.status(404).json({ message: "AariWorker not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
//     const isAariWorkerSelf = req.user.aariWorkerId?.toString() === aariWorker._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isAariWorkerSelf) {
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

//     aariWorker.leaveStatus = leaveStatus;
//     aariWorker.isAvailable = leaveStatus === 'present';
    
//     if (leaveFrom) aariWorker.leaveFrom = leaveFrom;
//     if (leaveTo) aariWorker.leaveTo = leaveTo;
//     if (leaveReason) aariWorker.leaveReason = leaveReason;

//     await aariWorker.save();

//     res.json({
//       message: `Leave status updated to ${leaveStatus}`,
//       aariWorker
//     });
//   } catch (error) {
//     console.error("Update leave status error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE AARI_WORKER (soft delete) =====
// export const deleteAariWorker = async (req, res) => {
//   try {
//     const aariWorker = await AariWorker.findById(req.params.id);

//     if (!aariWorker) {
//       return res.status(404).json({ message: "AariWorker not found" });
//     }

//     // ✅ FIXED: Check if aariWorker has active works using 'aariWorker' field
//     const activeWorks = await Work.countDocuments({
//       aariWorker: aariWorker._id,  // ✅ CORRECT: using 'aariWorker' field
//       status: { $nin: ['ready-to-deliver', 'cancelled'] }
//     });

//     if (activeWorks > 0) {
//       return res.status(400).json({ 
//         message: `Cannot delete aariWorker with ${activeWorks} active works. Complete or reassign works first.` 
//       });
//     }

//     aariWorker.isActive = false;
//     await aariWorker.save();

//     await User.findOneAndUpdate(
//       { aariWorkerId: aariWorker._id },
//       { isActive: false }
//     );

//     res.json({ message: "AariWorker deleted successfully" });
//   } catch (error) {
//     console.error("Delete aariWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET AARI_WORKER STATISTICS =====
// export const getAariWorkerStats = async (req, res) => {
//   try {
//     const stats = await AariWorker.aggregate([
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

//     // ✅ FIXED: Get work distribution using 'aariWorker' field
//     const workDistribution = await Work.aggregate([
//       { $match: { isActive: true, aariWorker: { $ne: null } } },  // ✅ CORRECT: using 'aariWorker' field
//       { $group: {
//         _id: "$aariWorker",
//         count: { $sum: 1 }
//       }},
//       { $group: {
//         _id: null,
//         avgWorkPerAariWorker: { $avg: "$count" },
//         maxWork: { $max: "$count" },
//         minWork: { $min: "$count" },
//         totalAssigned: { $sum: "$count" }
//       }}
//     ]);

//     res.json({
//       aariWorkerStats: stats[0] || { total: 0, available: 0, onLeave: 0, present: 0, halfDay: 0, holiday: 0 },
//       workDistribution: workDistribution[0] || { avgWorkPerAariWorker: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
//     });
//   } catch (error) {
//     console.error("Get aariWorker stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };




// // controllers/aariWorker.controller.js
// import AariWorker from "../models/AariWorker.js";
// import Work from "../models/Work.js";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";

// // ===== CREATE AARI_WORKER =====
// export const createAariWorker = async (req, res) => {
//   try {
//     console.log("📝 Creating aariWorker with data:", {
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
//     const existingPhone = await AariWorker.findOne({ phone });
//     if (existingPhone) {
//       return res.status(400).json({ message: "AariWorker with this phone number already exists" });
//     }

//     // Check if email already exists (if provided)
//     if (email) {
//       const existingEmail = await AariWorker.findOne({ email });
//       if (existingEmail) {
//         return res.status(400).json({ message: "AariWorker with this email already exists" });
//       }
//     }

//     // Generate aariWorkerId
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await AariWorker.countDocuments();
//     const sequence = String(count + 1).padStart(4, '0');
//     const aariWorkerId = `AAR${year}${month}${sequence}`;

//     // Create aariWorker with ALL fields
//     const aariWorker = new AariWorker({
//       aariWorkerId,
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

//     console.log("💾 Saving aariWorker with ID:", aariWorkerId);
//     await aariWorker.save();
//     console.log("✅ AariWorker created with ID:", aariWorker.aariWorkerId);

//     // Create user account
//     let user = null;
//     try {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       user = await User.create({
//         name,
//         email: email || `${phone}@aariWorker.dreamfit.com`,
//         phone,
//         role: "AARI_WORKER",
//         password: hashedPassword,
//         aariWorkerId: aariWorker._id,
//         isActive: true
//       });
//       console.log("✅ User account created for aariWorker");
//     } catch (userError) {
//       console.log("⚠️ User account creation failed:", userError.message);
//     }

//     const aariWorkerResponse = aariWorker.toObject();
//     delete aariWorkerResponse.password;
    
//     res.status(201).json({
//       message: "AariWorker created successfully",
//       aariWorker: aariWorkerResponse,
//       user: user ? {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       } : null
//     });
//   } catch (error) {
//     console.error("❌ Create aariWorker error:", error);
    
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

// // ===== GET ALL AARI_WORKERS =====
// export const getAllAariWorkers = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { aariWorkerId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (status && status !== 'all') {
//       query.leaveStatus = status;
//     }

//     if (availability && availability !== 'all') {
//       query.isAvailable = availability === 'available';
//     }

//     const aariWorkers = await AariWorker.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // ✅ Calculate workStats from actual works for each aariWorker
//     for (let aariWorker of aariWorkers) {
//       const works = await Work.find({ 
//         aariWorker: aariWorker._id,
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

//       // Update the aariWorker object in memory (don't save to DB for performance)
//       aariWorker.workStats = workStats;
//     }

//     res.json(aariWorkers);
//   } catch (error) {
//     console.error("Get all aariWorkers error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET AARI_WORKER BY ID =====
// export const getAariWorkerById = async (req, res) => {
//   try {
//     const aariWorker = await AariWorker.findById(req.params.id)
//       .populate('createdBy', 'name')
//       .populate({
//         path: 'performance.feedback.from',
//         select: 'name'
//       });

//     if (!aariWorker) {
//       return res.status(404).json({ message: "AariWorker not found" });
//     }

//     // ✅ Get all works assigned to this aariWorker
//     const works = await Work.find({ 
//       aariWorker: aariWorker._id,
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

//     console.log('📊 Recalculated workStats for aariWorker:', {
//       aariWorkerId: aariWorker.aariWorkerId,
//       name: aariWorker.name,
//       totalWorks: works.length,
//       workStats,
//       worksBreakdown: works.map(w => ({
//         workId: w.workId,
//         status: w.status
//       }))
//     });

//     // ✅ Update the aariWorker's workStats in database
//     aariWorker.workStats = workStats;
//     await aariWorker.save();

//     res.json({
//       aariWorker,
//       works,
//       workStats
//     });
//   } catch (error) {
//     console.error("Get aariWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE AARI_WORKER =====
// export const updateAariWorker = async (req, res) => {
//   try {
//     const aariWorker = await AariWorker.findById(req.params.id);

//     if (!aariWorker) {
//       return res.status(404).json({ message: "AariWorker not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isAariWorkerSelf = req.user.aariWorkerId?.toString() === aariWorker._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isAariWorkerSelf) {
//       return res.status(403).json({ message: "Not authorized to update this aariWorker" });
//     }

//     const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience'];
    
//     if (isAdmin || isStoreKeeper) {
//       updatableFields.push('isAvailable', 'leaveStatus', 'leaveFrom', 'leaveTo', 'leaveReason');
//     }

//     updatableFields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         aariWorker[field] = req.body[field];
//       }
//     });

//     await aariWorker.save();

//     if (isAdmin || isStoreKeeper) {
//       await User.findOneAndUpdate(
//         { aariWorkerId: aariWorker._id },
//         { 
//           name: aariWorker.name,
//           email: aariWorker.email,
//           phone: aariWorker.phone,
//           isActive: aariWorker.isActive
//         }
//       );
//     }

//     res.json({
//       message: "AariWorker updated successfully",
//       aariWorker
//     });
//   } catch (error) {
//     console.error("Update aariWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatus = async (req, res) => {
//   try {
//     const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
//     const aariWorker = await AariWorker.findById(req.params.id);

//     if (!aariWorker) {
//       return res.status(404).json({ message: "AariWorker not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
//     const isAariWorkerSelf = req.user.aariWorkerId?.toString() === aariWorker._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isAariWorkerSelf) {
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

//     aariWorker.leaveStatus = leaveStatus;
//     aariWorker.isAvailable = leaveStatus === 'present';
    
//     if (leaveFrom) aariWorker.leaveFrom = leaveFrom;
//     if (leaveTo) aariWorker.leaveTo = leaveTo;
//     if (leaveReason) aariWorker.leaveReason = leaveReason;

//     await aariWorker.save();

//     res.json({
//       message: `Leave status updated to ${leaveStatus}`,
//       aariWorker
//     });
//   } catch (error) {
//     console.error("Update leave status error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE AARI_WORKER (soft delete) =====
// export const deleteAariWorker = async (req, res) => {
//   try {
//     const aariWorker = await AariWorker.findById(req.params.id);

//     if (!aariWorker) {
//       return res.status(404).json({ message: "AariWorker not found" });
//     }

//     // ✅ Check if aariWorker has active works
//     const activeWorks = await Work.countDocuments({
//       aariWorker: aariWorker._id,
//       status: { $nin: ['ready-to-deliver', 'cancelled'] }
//     });

//     if (activeWorks > 0) {
//       return res.status(400).json({ 
//         message: `Cannot delete aariWorker with ${activeWorks} active works. Complete or reassign works first.` 
//       });
//     }

//     aariWorker.isActive = false;
//     await aariWorker.save();

//     await User.findOneAndUpdate(
//       { aariWorkerId: aariWorker._id },
//       { isActive: false }
//     );

//     res.json({ message: "AariWorker deleted successfully" });
//   } catch (error) {
//     console.error("Delete aariWorker error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET AARI_WORKER STATISTICS =====
// export const getAariWorkerStats = async (req, res) => {
//   try {
//     const stats = await AariWorker.aggregate([
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
//       { $match: { isActive: true, aariWorker: { $ne: null } } },
//       { $group: {
//         _id: "$aariWorker",
//         count: { $sum: 1 }
//       }},
//       { $group: {
//         _id: null,
//         avgWorkPerAariWorker: { $avg: "$count" },
//         maxWork: { $max: "$count" },
//         minWork: { $min: "$count" },
//         totalAssigned: { $sum: "$count" }
//       }}
//     ]);

//     res.json({
//       aariWorkerStats: stats[0] || { total: 0, available: 0, onLeave: 0, present: 0, halfDay: 0, holiday: 0 },
//       workDistribution: workDistribution[0] || { avgWorkPerAariWorker: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
//     });
//   } catch (error) {
//     console.error("Get aariWorker stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== TEMPORARY: FIX ALL AARI_WORKER STATS =====
// export const fixAllAariWorkerStats = async (req, res) => {
//   try {
//     const aariWorkers = await AariWorker.find({ isActive: true });
//     let updated = 0;
//     let fixed = [];

//     for (let aariWorker of aariWorkers) {
//       const works = await Work.find({ 
//         aariWorker: aariWorker._id,
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
//       if (JSON.stringify(aariWorker.workStats) !== JSON.stringify(workStats)) {
//         aariWorker.workStats = workStats;
//         await aariWorker.save();
//         updated++;
//         fixed.push({
//           name: aariWorker.name,
//           aariWorkerId: aariWorker.aariWorkerId,
//           oldStats: aariWorker.workStats,
//           newStats: workStats
//         });
//       }
//     }

//     res.json({
//       message: `Fixed stats for ${updated} aariWorkers`,
//       updated,
//       fixed
//     });
//   } catch (error) {
//     console.error("Fix stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };




// // Add to controllers/aariWorker.controller.js after getAariWorkerStats

// // ============================================
// // ✅ GET TOP PERFORMING AARI_WORKERS (NEW)
// // ============================================
// export const getTopAariWorkers = async (req, res) => {
//   try {
//     const { limit = 5 } = req.query;

//     // Get all active aariWorkers
//     const aariWorkers = await AariWorker.find({ isActive: true })
//       .select('name aariWorkerId specialization experience workStats isAvailable leaveStatus')
//       .lean();

//     // Get all works with status for completion calculation
//     const works = await Work.find({ 
//       isActive: true,
//       aariWorker: { $ne: null }
//     })
//       .select('aariWorker status')
//       .lean();

//     // Calculate completed orders per aariWorker
//     const completedCounts = {};
//     works.forEach(work => {
//       if (work.aariWorker && work.status === 'ready-to-delivery') {
//         const aariWorkerId = work.aariWorker.toString();
//         completedCounts[aariWorkerId] = (completedCounts[aariWorkerId] || 0) + 1;
//       }
//     });

//     // Calculate average completion time (mock for now - implement based on your data)
//     // You can add createdAt and completedAt fields to works for accurate calculation

//     // Enhance aariWorkers with calculated data
//     const enhancedAariWorkers = aariWorkers.map(aariWorker => ({
//       _id: aariWorker._id,
//       name: aariWorker.name,
//       aariWorkerId: aariWorker.aariWorkerId,
//       specialization: aariWorker.specialization || 'General',
//       experience: aariWorker.experience || 0,
//       completedOrders: completedCounts[aariWorker._id.toString()] || 0,
//       totalAssigned: aariWorker.workStats?.totalAssigned || 0,
//       isAvailable: aariWorker.isAvailable,
//       leaveStatus: aariWorker.leaveStatus
//     }));

//     // Sort by completed orders and take top performers
//     const topAariWorkers = enhancedAariWorkers
//       .sort((a, b) => b.completedOrders - a.completedOrders)
//       .slice(0, parseInt(limit));

//     // Calculate average completion time (placeholder)
//     const avgCompletionTime = "4.5 days"; // You can calculate this from actual data

//     res.json({
//       success: true,
//       topAariWorkers,
//       summary: {
//         averageCompletionTime: avgCompletionTime,
//         totalActiveAariWorkers: aariWorkers.length,
//         totalCompletedOrders: Object.values(completedCounts).reduce((a, b) => a + b, 0)
//       }
//     });

//   } catch (error) {
//     console.error("❌ Get top aariWorkers error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ GET AARI_WORKER PERFORMANCE REPORT (NEW)
// // ============================================
// export const getAariWorkerPerformance = async (req, res) => {
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
//       aariWorker: { $ne: null }
//     })
//       .populate('aariWorker', 'name aariWorkerId')
//       .lean();

//     // Group by aariWorker
//     const performance = {};
//     completedWorks.forEach(work => {
//       if (work.aariWorker) {
//         const aariWorkerId = work.aariWorker._id.toString();
//         if (!performance[aariWorkerId]) {
//           performance[aariWorkerId] = {
//             aariWorker: work.aariWorker,
//             completedCount: 0,
//             works: []
//           };
//         }
//         performance[aariWorkerId].completedCount++;
//         performance[aariWorkerId].works.push({
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
//     console.error("❌ Get aariWorker performance error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// controllers/aariWorker.controller.js
import AariWorker from "../models/AariWorker.js";
import Work from "../models/Work.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ===== CREATE AARI_WORKER =====
export const createAariWorker = async (req, res) => {
  try {
    console.log("📝 Creating aariWorker with data:", {
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
    const existingPhone = await AariWorker.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "AariWorker with this phone number already exists" });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await AariWorker.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "AariWorker with this email already exists" });
      }
    }

    // Generate aariWorkerId
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await AariWorker.countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    const aariWorkerId = `AAR${year}${month}${sequence}`;

    // Create aariWorker with ALL fields
    const aariWorker = new AariWorker({
      aariWorkerId,
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

    console.log("💾 Saving aariWorker with ID:", aariWorkerId);
    await aariWorker.save();
    console.log("✅ AariWorker created with ID:", aariWorker.aariWorkerId);

    // Create user account
    let user = null;
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        name,
        email: email || `${phone}@aariWorker.dreamfit.com`,
        phone,
        role: "AARI_WORKER",
        password: hashedPassword,
        aariWorkerId: aariWorker._id,
        isActive: true
      });
      console.log("✅ User account created for aariWorker");
    } catch (userError) {
      console.log("⚠️ User account creation failed:", userError.message);
    }

    const aariWorkerResponse = aariWorker.toObject();
    delete aariWorkerResponse.password;
    
    res.status(201).json({
      message: "AariWorker created successfully",
      aariWorker: aariWorkerResponse,
      user: user ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      } : null
    });
  } catch (error) {
    console.error("❌ Create aariWorker error:", error);
    
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

// // ===== GET ALL AARI_WORKERS =====
// export const getAllAariWorkers = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { aariWorkerId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (status && status !== 'all') {
//       query.leaveStatus = status;
//     }

//     if (availability && availability !== 'all') {
//       query.isAvailable = availability === 'available';
//     }

//     const aariWorkers = await AariWorker.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // ✅ Calculate workStats from actual works for each aariWorker
//     for (let aariWorker of aariWorkers) {
//       const works = await Work.find({ 
//         aariWorker: aariWorker._id,
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

//       // Update the aariWorker object in memory (don't save to DB for performance)
//       aariWorker.workStats = workStats;
//     }

//     res.json(aariWorkers);
//   } catch (error) {
//     console.error("Get all aariWorkers error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
export const getAllAariWorkers = async (req, res) => {
  try {
    const { search, status, availability, isActive } = req.query;
    let matchQuery = {};
    if (isActive === 'false') {
      matchQuery.isActive = false;
    } else if (isActive === 'all') {
      // Don't filter by isActive
    } else {
      matchQuery.isActive = true; // Default behavior
    }

    // 1. Search Logic
    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { aariWorkerId: { $regex: search, $options: 'i' } }
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
    const aariWorkers = await AariWorker.aggregate([
      { $match: matchQuery },
      { $sort: { createdAt: -1 } },
      
      // 🔥 Join with Work collection via assignments array
      {
        $lookup: {
          from: "works",
          localField: "_id",
          foreignField: "assignments.workerId",
          as: "allWorks"
        }
      },

      // 📊 Calculate stats dynamically
      {
        $addFields: {
          // Flatten all assignments for this aariWorker
          myAssignments: {
            $filter: {
              input: {
                $reduce: {
                  input: "$allWorks",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this.assignments"] }
                }
              },
              as: "asgn",
              cond: { $eq: ["$$asgn.workerId", "$_id"] }
            }
          }
        }
      },
      {
        $addFields: {
          workStats: {
            totalAssigned: { $size: "$myAssignments" },
            completed: {
              $size: {
                $filter: {
                  input: "$myAssignments",
                  as: "a",
                  cond: { $eq: ["$$a.status", "completed"] }
                }
              }
            },
            inProgress: {
              $size: {
                $filter: {
                  input: "$myAssignments",
                  as: "a",
                  cond: { $eq: ["$$a.status", "active"] }
                }
              }
            },
            pending: {
              $size: {
                $filter: {
                  input: "$myAssignments",
                  as: "a",
                  cond: { $eq: ["$$a.status", "pending"] }
                }
              }
            }
          }
        }
      },
      // 🧹 Clean up
      { $project: { allWorks: 0, myAssignments: 0 } }
    ]);

    res.status(200).json(aariWorkers);

  } catch (error) {
    console.error("❌ High-Perf AariWorker Fetch Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ===== GET AARI_WORKER BY ID =====
export const getAariWorkerById = async (req, res) => {
  try {
    const aariWorker = await AariWorker.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate({
        path: 'performance.feedback.from',
        select: 'name'
      });

    if (!aariWorker) {
      return res.status(404).json({ message: "AariWorker not found" });
    }

    // ✅ Get all works assigned to this aariWorker
    const works = await Work.find({ 
      "assignments.workerId": aariWorker._id,
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

    // ✅ Flatten all assignments for this aariWorker from all fetched works
    const allMyAssignments = works.reduce((acc, w) => {
      const mine = w.assignments?.filter(a => a.workerId?.toString() === aariWorker._id.toString()) || [];
      return [...acc, ...mine];
    }, []);

    // ✅ Calculate work statistics from actual assignments
    const workStats = {
      totalAssigned: allMyAssignments.length,
      completed: allMyAssignments.filter(a => a.status === 'completed').length,
      inProgress: allMyAssignments.filter(a => a.status === 'active').length,
      pending: allMyAssignments.filter(a => a.status === 'pending').length
    };

    console.log('📊 Recalculated workStats for aariWorker:', {
      aariWorkerId: aariWorker.aariWorkerId,
      name: aariWorker.name,
      totalWorks: works.length,
      workStats,
      worksBreakdown: works.map(w => ({
        workId: w.workId,
        status: w.status
      }))
    });

    // ✅ Update the aariWorker's workStats in database
    aariWorker.workStats = workStats;
    await aariWorker.save();

    res.json({
      aariWorker,
      works,
      workStats
    });
  } catch (error) {
    console.error("Get aariWorker error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE AARI_WORKER =====
export const updateAariWorker = async (req, res) => {
  try {
    const aariWorker = await AariWorker.findById(req.params.id);

    if (!aariWorker) {
      return res.status(404).json({ message: "AariWorker not found" });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isStoreKeeper = req.user.role === 'STORE_KEEPER';
    const isAariWorkerSelf = req.user.aariWorkerId?.toString() === aariWorker._id.toString();

    if (!isAdmin && !isStoreKeeper && !isAariWorkerSelf) {
      return res.status(403).json({ message: "Not authorized to update this aariWorker" });
    }

    const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience', 'basicSalary'];
    
    if (isAdmin || isStoreKeeper) {
      updatableFields.push('isAvailable', 'leaveStatus', 'leaveFrom', 'leaveTo', 'leaveReason');
    }

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        aariWorker[field] = req.body[field];
      }
    });

    await aariWorker.save();

    if (isAdmin || isStoreKeeper) {
      await User.findOneAndUpdate(
        { aariWorkerId: aariWorker._id },
        { 
          name: aariWorker.name,
          email: aariWorker.email,
          phone: aariWorker.phone,
          isActive: aariWorker.isActive
        }
      );
    }

    res.json({
      message: "AariWorker updated successfully",
      aariWorker
    });
  } catch (error) {
    console.error("Update aariWorker error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE LEAVE STATUS =====
export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
    const aariWorker = await AariWorker.findById(req.params.id);

    if (!aariWorker) {
      return res.status(404).json({ message: "AariWorker not found" });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isStoreKeeper = req.user.role === 'STORE_KEEPER';
    const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
    const isAariWorkerSelf = req.user.aariWorkerId?.toString() === aariWorker._id.toString();

    if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isAariWorkerSelf) {
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

    aariWorker.leaveStatus = leaveStatus;
    aariWorker.isAvailable = leaveStatus === 'present';
    
    if (leaveFrom) aariWorker.leaveFrom = leaveFrom;
    if (leaveTo) aariWorker.leaveTo = leaveTo;
    if (leaveReason) aariWorker.leaveReason = leaveReason;

    await aariWorker.save();

    res.json({
      message: `Leave status updated to ${leaveStatus}`,
      aariWorker
    });
  } catch (error) {
    console.error("Update leave status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== DELETE AARI_WORKER (soft delete) =====
export const deleteAariWorker = async (req, res) => {
  try {
    const aariWorker = await AariWorker.findById(req.params.id);

    if (!aariWorker) {
      return res.status(404).json({ message: "AariWorker not found" });
    }

    // ✅ Check if aariWorker has active works
    const activeWorks = await Work.countDocuments({
      aariWorker: aariWorker._id,
      status: { $nin: ['ready-to-deliver', 'cancelled'] }
    });

    if (activeWorks > 0) {
      return res.status(400).json({ 
        message: `Cannot delete aariWorker with ${activeWorks} active works. Complete or reassign works first.` 
      });
    }

    await AariWorker.findByIdAndDelete(aariWorker._id);

    await User.findOneAndDelete(
      { aariWorkerId: aariWorker._id }
    );

    res.json({ message: "AariWorker deleted successfully" });
  } catch (error) {
    console.error("Delete aariWorker error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== ✅ SINGLE getAariWorkerStats FUNCTION (Dashboard Compatible) =====
export const getAariWorkerStats = async (req, res) => {
  try {
    console.log('📊 Getting aariWorker stats for dashboard');
    
    const stats = await AariWorker.aggregate([
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
      { $match: { isActive: true, aariWorker: { $ne: null } } },
      { $group: {
        _id: "$aariWorker",
        count: { $sum: 1 }
      }},
      { $group: {
        _id: null,
        avgWorkPerAariWorker: { $avg: "$count" },
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

    console.log('✅ AariWorker stats:', result);

    res.json({
      aariWorkerStats: result,
      workDistribution: workDistribution[0] || { avgWorkPerAariWorker: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
    });

  } catch (error) {
    console.error('❌ Get aariWorker stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// ✅ GET TOP PERFORMING AARI_WORKERS (For Dashboard)
// ============================================
export const getTopAariWorkers = async (req, res) => {
  try {
    const { limit = 5, period = 'month' } = req.query;
    
    console.log(`🏆 Getting top ${limit} aariWorkers for period: ${period}`);

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

    // Get all active aariWorkers
    const aariWorkers = await AariWorker.find({ isActive: true })
      .select('name aariWorkerId specialization experience workStats isAvailable leaveStatus')
      .lean();

    // Get works completed in the period
    const completedWorks = await Work.find({
      status: 'ready-to-deliver',
      updatedAt: { $gte: startDate, $lte: endDate },
      aariWorker: { $ne: null }
    })
      .select('aariWorker')
      .lean();

    // Count completed works per aariWorker
    const completedCounts = {};
    completedWorks.forEach(work => {
      if (work.aariWorker) {
        const aariWorkerId = work.aariWorker.toString();
        completedCounts[aariWorkerId] = (completedCounts[aariWorkerId] || 0) + 1;
      }
    });

    // Enhance aariWorkers with calculated data
    const enhancedAariWorkers = aariWorkers.map(aariWorker => ({
      _id: aariWorker._id,
      name: aariWorker.name,
      aariWorkerId: aariWorker.aariWorkerId,
      specialization: Array.isArray(aariWorker.specialization) ? aariWorker.specialization[0] : aariWorker.specialization || 'General',
      experience: aariWorker.experience || 0,
      completedOrders: completedCounts[aariWorker._id.toString()] || 0,
      totalAssigned: aariWorker.workStats?.totalAssigned || 0,
      isAvailable: aariWorker.isAvailable,
      leaveStatus: aariWorker.leaveStatus,
      // Calculate efficiency (completed / total assigned)
      efficiency: aariWorker.workStats?.totalAssigned > 0 
        ? Math.round((aariWorker.workStats.completed / aariWorker.workStats.totalAssigned) * 100) 
        : 0
    }));

    // Sort by completed orders and take top performers
    const topAariWorkers = enhancedAariWorkers
      .sort((a, b) => b.completedOrders - a.completedOrders)
      .slice(0, parseInt(limit));

    console.log(`✅ Top ${topAariWorkers.length} aariWorkers prepared`);

    res.json({
      success: true,
      topAariWorkers,
      summary: {
        averageCompletionTime: "4.5 days",
        totalActiveAariWorkers: aariWorkers.length,
        totalCompletedOrders: Object.values(completedCounts).reduce((a, b) => a + b, 0),
        period,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });

  } catch (error) {
    console.error('❌ Get top aariWorkers error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// ✅ GET AARI_WORKER PERFORMANCE REPORT (For Dashboard)
// ============================================
export const getAariWorkerPerformance = async (req, res) => {
  try {
    const { period = 'month', aariWorkerId } = req.query;

    console.log('📈 Getting aariWorker performance for period:', period);

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
      aariWorker: { $ne: null }
    };

    // If specific aariWorker requested
    if (aariWorkerId) {
      query.aariWorker = aariWorkerId;
    }

    // Get completed works with details
    const works = await Work.find(query)
      .populate('aariWorker', 'name aariWorkerId')
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

    // Group by aariWorker if not specified
    let performance = [];
    
    if (aariWorkerId) {
      // Single aariWorker performance
      const aariWorker = works[0]?.aariWorker;
      performance = [{
        aariWorker,
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
      // Group by aariWorker
      const aariWorkerMap = new Map();
      
      works.forEach(work => {
        if (work.aariWorker) {
          const aariWorkerId = work.aariWorker._id.toString();
          if (!aariWorkerMap.has(aariWorkerId)) {
            aariWorkerMap.set(aariWorkerId, {
              aariWorker: work.aariWorker,
              works: [],
              totalCompleted: 0
            });
          }
          const entry = aariWorkerMap.get(aariWorkerId);
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

      performance = Array.from(aariWorkerMap.values())
        .sort((a, b) => b.totalCompleted - a.totalCompleted);
    }

    // Calculate summary statistics
    const totalCompleted = works.length;
    const activeAariWorkers = performance.length;
    const avgPerAariWorker = activeAariWorkers > 0 ? Math.round(totalCompleted / activeAariWorkers) : 0;

    const summary = {
      totalCompleted,
      activeAariWorkers,
      avgPerAariWorker,
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
    console.error('❌ Get aariWorker performance error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== TEMPORARY: FIX ALL AARI_WORKER STATS =====
export const fixAllAariWorkerStats = async (req, res) => {
  try {
    const aariWorkers = await AariWorker.find({ isActive: true });
    let updated = 0;
    let fixed = [];

    for (let aariWorker of aariWorkers) {
      const works = await Work.find({ 
        aariWorker: aariWorker._id,
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
      if (JSON.stringify(aariWorker.workStats) !== JSON.stringify(workStats)) {
        aariWorker.workStats = workStats;
        await aariWorker.save();
        updated++;
        fixed.push({
          name: aariWorker.name,
          aariWorkerId: aariWorker.aariWorkerId,
          oldStats: aariWorker.workStats,
          newStats: workStats
        });
      }
    }

    res.json({
      message: `Fixed stats for ${updated} aariWorkers`,
      updated,
      fixed
    });
  } catch (error) {
    console.error("Fix stats error:", error);
    res.status(500).json({ message: error.message });
  }
};