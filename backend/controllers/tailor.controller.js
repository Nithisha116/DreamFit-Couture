// import Tailor from "../models/Tailor.js";
// import Work from "../models/Work.js";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";

// // ===== CREATE TAILOR =====
// // ===== CREATE TAILOR =====
// export const createTailor = async (req, res) => {
//   try {
//     console.log("📝 Creating tailor with data:", {
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
//     const existingPhone = await Tailor.findOne({ phone });
//     if (existingPhone) {
//       return res.status(400).json({ message: "Tailor with this phone number already exists" });
//     }

//     // Check if email already exists (if provided)
//     if (email) {
//       const existingEmail = await Tailor.findOne({ email });
//       if (existingEmail) {
//         return res.status(400).json({ message: "Tailor with this email already exists" });
//       }
//     }

//     // Generate tailorId manually (since pre-save hook might not be running)
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await Tailor.countDocuments();
//     const sequence = String(count + 1).padStart(4, '0');
//     const tailorId = `TLR${year}${month}${sequence}`;

//     // Create tailor with ALL fields
//     const tailor = new Tailor({
//       tailorId, // Set manually to ensure it's there
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

//     console.log("💾 Saving tailor with ID:", tailorId);
    
//     // Save to database
//     await tailor.save();
    
//     console.log("✅ Tailor created with ID:", tailor.tailorId);

//     // Create user account with the SAME password
//     let user = null;
//     try {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt); // Use the provided password

//       user = await User.create({
//         name,
//         email: email || `${phone}@tailor.dreamfit.com`,
//         phone,
//         role: "TAILOR",
//         password: hashedPassword,
//         tailorId: tailor._id,
//         isActive: true
//       });
//       console.log("✅ User account created for tailor");
//     } catch (userError) {
//       console.log("⚠️ User account creation failed:", userError.message);
//       // Don't fail the whole request if user creation fails
//     }

//     // Return success response (excluding password)
//     const tailorResponse = tailor.toObject();
//     delete tailorResponse.password;
    
//     res.status(201).json({
//       message: "Tailor created successfully",
//       tailor: tailorResponse,
//       user: user ? {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       } : null
//     });
//   } catch (error) {
//     console.error("❌ Create tailor error:", error);
    
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
// // ===== GET ALL TAILORS =====
// export const getAllTailors = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     // Search by name, phone, email, tailorId
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { tailorId: { $regex: search, $options: 'i' } }
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

//     const tailors = await Tailor.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // Get work statistics for each tailor
//     for (let tailor of tailors) {
//       const workStats = await Work.aggregate([
//         { $match: { assignedTo: tailor._id, isActive: true } },
//         { $group: {
//           _id: null,
//           total: { $sum: 1 },
//           completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
//           pending: { $sum: { $cond: [{ $in: ["$status", ["pending", "accepted"]] }, 1, 0] } },
//           inProgress: { $sum: { $cond: [{ $in: ["$status", ["cutting", "stitching", "iron"]] }, 1, 0] } }
//         }}
//       ]);

//       if (workStats.length > 0) {
//         tailor.workStats = workStats[0];
//       } else {
//         tailor.workStats = { total: 0, completed: 0, pending: 0, inProgress: 0 };
//       }
//     }

//     res.json(tailors);
//   } catch (error) {
//     console.error("Get all tailors error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET TAILOR BY ID =====
// export const getTailorById = async (req, res) => {
//   try {
//     const tailor = await Tailor.findById(req.params.id)
//       .populate('createdBy', 'name')
//       .populate({
//         path: 'performance.feedback.from',
//         select: 'name'
//       });

//     if (!tailor) {
//       return res.status(404).json({ message: "Tailor not found" });
//     }

//     // Get all works assigned to this tailor
//     const works = await Work.find({ 
//       assignedTo: tailor._id,
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
//       tailor,
//       works,
//       workStats
//     });
//   } catch (error) {
//     console.error("Get tailor error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE TAILOR =====
// export const updateTailor = async (req, res) => {
//   try {
//     const tailor = await Tailor.findById(req.params.id);

//     if (!tailor) {
//       return res.status(404).json({ message: "Tailor not found" });
//     }

//     // Check permissions
//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isTailorSelf = req.user.tailorId?.toString() === tailor._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isTailorSelf) {
//       return res.status(403).json({ message: "Not authorized to update this tailor" });
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
//         tailor[field] = req.body[field];
//       }
//     });

//     await tailor.save();

//     // Update corresponding user account if needed
//     if (isAdmin || isStoreKeeper) {
//       await User.findOneAndUpdate(
//         { tailorId: tailor._id },
//         { 
//           name: tailor.name,
//           email: tailor.email,
//           phone: tailor.phone,
//           isActive: tailor.isActive
//         }
//       );
//     }

//     res.json({
//       message: "Tailor updated successfully",
//       tailor
//     });
//   } catch (error) {
//     console.error("Update tailor error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE LEAVE STATUS =====
// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatus = async (req, res) => {
//   try {
//     const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
//     const tailor = await Tailor.findById(req.params.id);

//     if (!tailor) {
//       return res.status(404).json({ message: "Tailor not found" });
//     }

//     // Check permissions
//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
//     const isTailorSelf = req.user.tailorId?.toString() === tailor._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isTailorSelf) {
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

//     tailor.leaveStatus = leaveStatus;
//     tailor.isAvailable = leaveStatus === 'present';
    
//     if (leaveFrom) tailor.leaveFrom = leaveFrom;
//     if (leaveTo) tailor.leaveTo = leaveTo;
//     if (leaveReason) tailor.leaveReason = leaveReason;

//     await tailor.save();

//     res.json({
//       message: `Leave status updated to ${leaveStatus}`,
//       tailor
//     });
//   } catch (error) {
//     console.error("Update leave status error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE TAILOR (soft delete) =====
// export const deleteTailor = async (req, res) => {
//   try {
//     const tailor = await Tailor.findById(req.params.id);

//     if (!tailor) {
//       return res.status(404).json({ message: "Tailor not found" });
//     }

//     // Check if tailor has active works
//     const activeWorks = await Work.countDocuments({
//       assignedTo: tailor._id,
//       status: { $nin: ['completed', 'cancelled'] }
//     });

//     if (activeWorks > 0) {
//       return res.status(400).json({ 
//         message: `Cannot delete tailor with ${activeWorks} active works. Complete or reassign works first.` 
//       });
//     }

//     tailor.isActive = false;
//     await tailor.save();

//     // Also deactivate user account
//     await User.findOneAndUpdate(
//       { tailorId: tailor._id },
//       { isActive: false }
//     );

//     res.json({ message: "Tailor deleted successfully" });
//   } catch (error) {
//     console.error("Delete tailor error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET TAILOR STATISTICS =====
// export const getTailorStats = async (req, res) => {
//   try {
//     const stats = await Tailor.aggregate([
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
//         avgWorkPerTailor: { $avg: "$count" },
//         maxWork: { $max: "$count" },
//         minWork: { $min: "$count" },
//         totalAssigned: { $sum: "$count" }
//       }}
//     ]);

//     res.json({
//       tailorStats: stats[0] || { total: 0, available: 0, onLeave: 0, present: 0, halfDay: 0, holiday: 0 },
//       workDistribution: workDistribution[0] || { avgWorkPerTailor: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
//     });
//   } catch (error) {
//     console.error("Get tailor stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // controllers/tailor.controller.js
// import Tailor from "../models/Tailor.js";
// import Work from "../models/Work.js";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";

// // ===== CREATE TAILOR =====
// export const createTailor = async (req, res) => {
//   try {
//     console.log("📝 Creating tailor with data:", {
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
//     const existingPhone = await Tailor.findOne({ phone });
//     if (existingPhone) {
//       return res.status(400).json({ message: "Tailor with this phone number already exists" });
//     }

//     // Check if email already exists (if provided)
//     if (email) {
//       const existingEmail = await Tailor.findOne({ email });
//       if (existingEmail) {
//         return res.status(400).json({ message: "Tailor with this email already exists" });
//       }
//     }

//     // Generate tailorId
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await Tailor.countDocuments();
//     const sequence = String(count + 1).padStart(4, '0');
//     const tailorId = `TLR${year}${month}${sequence}`;

//     // Create tailor with ALL fields
//     const tailor = new Tailor({
//       tailorId,
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

//     console.log("💾 Saving tailor with ID:", tailorId);
//     await tailor.save();
//     console.log("✅ Tailor created with ID:", tailor.tailorId);

//     // Create user account
//     let user = null;
//     try {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       user = await User.create({
//         name,
//         email: email || `${phone}@tailor.dreamfit.com`,
//         phone,
//         role: "TAILOR",
//         password: hashedPassword,
//         tailorId: tailor._id,
//         isActive: true
//       });
//       console.log("✅ User account created for tailor");
//     } catch (userError) {
//       console.log("⚠️ User account creation failed:", userError.message);
//     }

//     const tailorResponse = tailor.toObject();
//     delete tailorResponse.password;
    
//     res.status(201).json({
//       message: "Tailor created successfully",
//       tailor: tailorResponse,
//       user: user ? {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       } : null
//     });
//   } catch (error) {
//     console.error("❌ Create tailor error:", error);
    
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

// // ===== GET ALL TAILORS =====
// export const getAllTailors = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { tailorId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (status && status !== 'all') {
//       query.leaveStatus = status;
//     }

//     if (availability && availability !== 'all') {
//       query.isAvailable = availability === 'available';
//     }

//     const tailors = await Tailor.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // ✅ FIXED: Use correct field name 'tailor' not 'assignedTo'
//     for (let tailor of tailors) {
//       const works = await Work.find({ 
//         tailor: tailor._id,  // ✅ CORRECT: using 'tailor' field
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

//       tailor.workStats = workStats;
//     }

//     res.json(tailors);
//   } catch (error) {
//     console.error("Get all tailors error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET TAILOR BY ID =====
// export const getTailorById = async (req, res) => {
//   try {
//     const tailor = await Tailor.findById(req.params.id)
//       .populate('createdBy', 'name')
//       .populate({
//         path: 'performance.feedback.from',
//         select: 'name'
//       });

//     if (!tailor) {
//       return res.status(404).json({ message: "Tailor not found" });
//     }

//     // ✅ FIXED: Get all works assigned to this tailor using 'tailor' field
//     const works = await Work.find({ 
//       tailor: tailor._id,  // ✅ CORRECT: using 'tailor' field
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

//     // Update tailor's workStats in database
//     tailor.workStats = workStats;
//     await tailor.save();

//     res.json({
//       tailor,
//       works,
//       workStats
//     });
//   } catch (error) {
//     console.error("Get tailor error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE TAILOR =====
// export const updateTailor = async (req, res) => {
//   try {
//     const tailor = await Tailor.findById(req.params.id);

//     if (!tailor) {
//       return res.status(404).json({ message: "Tailor not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isTailorSelf = req.user.tailorId?.toString() === tailor._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isTailorSelf) {
//       return res.status(403).json({ message: "Not authorized to update this tailor" });
//     }

//     const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience'];
    
//     if (isAdmin || isStoreKeeper) {
//       updatableFields.push('isAvailable', 'leaveStatus', 'leaveFrom', 'leaveTo', 'leaveReason');
//     }

//     updatableFields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         tailor[field] = req.body[field];
//       }
//     });

//     await tailor.save();

//     if (isAdmin || isStoreKeeper) {
//       await User.findOneAndUpdate(
//         { tailorId: tailor._id },
//         { 
//           name: tailor.name,
//           email: tailor.email,
//           phone: tailor.phone,
//           isActive: tailor.isActive
//         }
//       );
//     }

//     res.json({
//       message: "Tailor updated successfully",
//       tailor
//     });
//   } catch (error) {
//     console.error("Update tailor error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatus = async (req, res) => {
//   try {
//     const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
//     const tailor = await Tailor.findById(req.params.id);

//     if (!tailor) {
//       return res.status(404).json({ message: "Tailor not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
//     const isTailorSelf = req.user.tailorId?.toString() === tailor._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isTailorSelf) {
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

//     tailor.leaveStatus = leaveStatus;
//     tailor.isAvailable = leaveStatus === 'present';
    
//     if (leaveFrom) tailor.leaveFrom = leaveFrom;
//     if (leaveTo) tailor.leaveTo = leaveTo;
//     if (leaveReason) tailor.leaveReason = leaveReason;

//     await tailor.save();

//     res.json({
//       message: `Leave status updated to ${leaveStatus}`,
//       tailor
//     });
//   } catch (error) {
//     console.error("Update leave status error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE TAILOR (soft delete) =====
// export const deleteTailor = async (req, res) => {
//   try {
//     const tailor = await Tailor.findById(req.params.id);

//     if (!tailor) {
//       return res.status(404).json({ message: "Tailor not found" });
//     }

//     // ✅ FIXED: Check if tailor has active works using 'tailor' field
//     const activeWorks = await Work.countDocuments({
//       tailor: tailor._id,  // ✅ CORRECT: using 'tailor' field
//       status: { $nin: ['ready-to-deliver', 'cancelled'] }
//     });

//     if (activeWorks > 0) {
//       return res.status(400).json({ 
//         message: `Cannot delete tailor with ${activeWorks} active works. Complete or reassign works first.` 
//       });
//     }

//     tailor.isActive = false;
//     await tailor.save();

//     await User.findOneAndUpdate(
//       { tailorId: tailor._id },
//       { isActive: false }
//     );

//     res.json({ message: "Tailor deleted successfully" });
//   } catch (error) {
//     console.error("Delete tailor error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET TAILOR STATISTICS =====
// export const getTailorStats = async (req, res) => {
//   try {
//     const stats = await Tailor.aggregate([
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

//     // ✅ FIXED: Get work distribution using 'tailor' field
//     const workDistribution = await Work.aggregate([
//       { $match: { isActive: true, tailor: { $ne: null } } },  // ✅ CORRECT: using 'tailor' field
//       { $group: {
//         _id: "$tailor",
//         count: { $sum: 1 }
//       }},
//       { $group: {
//         _id: null,
//         avgWorkPerTailor: { $avg: "$count" },
//         maxWork: { $max: "$count" },
//         minWork: { $min: "$count" },
//         totalAssigned: { $sum: "$count" }
//       }}
//     ]);

//     res.json({
//       tailorStats: stats[0] || { total: 0, available: 0, onLeave: 0, present: 0, halfDay: 0, holiday: 0 },
//       workDistribution: workDistribution[0] || { avgWorkPerTailor: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
//     });
//   } catch (error) {
//     console.error("Get tailor stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };




// // controllers/tailor.controller.js
// import Tailor from "../models/Tailor.js";
// import Work from "../models/Work.js";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";

// // ===== CREATE TAILOR =====
// export const createTailor = async (req, res) => {
//   try {
//     console.log("📝 Creating tailor with data:", {
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
//     const existingPhone = await Tailor.findOne({ phone });
//     if (existingPhone) {
//       return res.status(400).json({ message: "Tailor with this phone number already exists" });
//     }

//     // Check if email already exists (if provided)
//     if (email) {
//       const existingEmail = await Tailor.findOne({ email });
//       if (existingEmail) {
//         return res.status(400).json({ message: "Tailor with this email already exists" });
//       }
//     }

//     // Generate tailorId
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await Tailor.countDocuments();
//     const sequence = String(count + 1).padStart(4, '0');
//     const tailorId = `TLR${year}${month}${sequence}`;

//     // Create tailor with ALL fields
//     const tailor = new Tailor({
//       tailorId,
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

//     console.log("💾 Saving tailor with ID:", tailorId);
//     await tailor.save();
//     console.log("✅ Tailor created with ID:", tailor.tailorId);

//     // Create user account
//     let user = null;
//     try {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       user = await User.create({
//         name,
//         email: email || `${phone}@tailor.dreamfit.com`,
//         phone,
//         role: "TAILOR",
//         password: hashedPassword,
//         tailorId: tailor._id,
//         isActive: true
//       });
//       console.log("✅ User account created for tailor");
//     } catch (userError) {
//       console.log("⚠️ User account creation failed:", userError.message);
//     }

//     const tailorResponse = tailor.toObject();
//     delete tailorResponse.password;
    
//     res.status(201).json({
//       message: "Tailor created successfully",
//       tailor: tailorResponse,
//       user: user ? {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       } : null
//     });
//   } catch (error) {
//     console.error("❌ Create tailor error:", error);
    
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

// // ===== GET ALL TAILORS =====
// export const getAllTailors = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { tailorId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (status && status !== 'all') {
//       query.leaveStatus = status;
//     }

//     if (availability && availability !== 'all') {
//       query.isAvailable = availability === 'available';
//     }

//     const tailors = await Tailor.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // ✅ Calculate workStats from actual works for each tailor
//     for (let tailor of tailors) {
//       const works = await Work.find({ 
//         tailor: tailor._id,
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

//       // Update the tailor object in memory (don't save to DB for performance)
//       tailor.workStats = workStats;
//     }

//     res.json(tailors);
//   } catch (error) {
//     console.error("Get all tailors error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET TAILOR BY ID =====
// export const getTailorById = async (req, res) => {
//   try {
//     const tailor = await Tailor.findById(req.params.id)
//       .populate('createdBy', 'name')
//       .populate({
//         path: 'performance.feedback.from',
//         select: 'name'
//       });

//     if (!tailor) {
//       return res.status(404).json({ message: "Tailor not found" });
//     }

//     // ✅ Get all works assigned to this tailor
//     const works = await Work.find({ 
//       tailor: tailor._id,
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

//     console.log('📊 Recalculated workStats for tailor:', {
//       tailorId: tailor.tailorId,
//       name: tailor.name,
//       totalWorks: works.length,
//       workStats,
//       worksBreakdown: works.map(w => ({
//         workId: w.workId,
//         status: w.status
//       }))
//     });

//     // ✅ Update the tailor's workStats in database
//     tailor.workStats = workStats;
//     await tailor.save();

//     res.json({
//       tailor,
//       works,
//       workStats
//     });
//   } catch (error) {
//     console.error("Get tailor error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE TAILOR =====
// export const updateTailor = async (req, res) => {
//   try {
//     const tailor = await Tailor.findById(req.params.id);

//     if (!tailor) {
//       return res.status(404).json({ message: "Tailor not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isTailorSelf = req.user.tailorId?.toString() === tailor._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isTailorSelf) {
//       return res.status(403).json({ message: "Not authorized to update this tailor" });
//     }

//     const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience'];
    
//     if (isAdmin || isStoreKeeper) {
//       updatableFields.push('isAvailable', 'leaveStatus', 'leaveFrom', 'leaveTo', 'leaveReason');
//     }

//     updatableFields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         tailor[field] = req.body[field];
//       }
//     });

//     await tailor.save();

//     if (isAdmin || isStoreKeeper) {
//       await User.findOneAndUpdate(
//         { tailorId: tailor._id },
//         { 
//           name: tailor.name,
//           email: tailor.email,
//           phone: tailor.phone,
//           isActive: tailor.isActive
//         }
//       );
//     }

//     res.json({
//       message: "Tailor updated successfully",
//       tailor
//     });
//   } catch (error) {
//     console.error("Update tailor error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatus = async (req, res) => {
//   try {
//     const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
//     const tailor = await Tailor.findById(req.params.id);

//     if (!tailor) {
//       return res.status(404).json({ message: "Tailor not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
//     const isTailorSelf = req.user.tailorId?.toString() === tailor._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isTailorSelf) {
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

//     tailor.leaveStatus = leaveStatus;
//     tailor.isAvailable = leaveStatus === 'present';
    
//     if (leaveFrom) tailor.leaveFrom = leaveFrom;
//     if (leaveTo) tailor.leaveTo = leaveTo;
//     if (leaveReason) tailor.leaveReason = leaveReason;

//     await tailor.save();

//     res.json({
//       message: `Leave status updated to ${leaveStatus}`,
//       tailor
//     });
//   } catch (error) {
//     console.error("Update leave status error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE TAILOR (soft delete) =====
// export const deleteTailor = async (req, res) => {
//   try {
//     const tailor = await Tailor.findById(req.params.id);

//     if (!tailor) {
//       return res.status(404).json({ message: "Tailor not found" });
//     }

//     // ✅ Check if tailor has active works
//     const activeWorks = await Work.countDocuments({
//       tailor: tailor._id,
//       status: { $nin: ['ready-to-deliver', 'cancelled'] }
//     });

//     if (activeWorks > 0) {
//       return res.status(400).json({ 
//         message: `Cannot delete tailor with ${activeWorks} active works. Complete or reassign works first.` 
//       });
//     }

//     tailor.isActive = false;
//     await tailor.save();

//     await User.findOneAndUpdate(
//       { tailorId: tailor._id },
//       { isActive: false }
//     );

//     res.json({ message: "Tailor deleted successfully" });
//   } catch (error) {
//     console.error("Delete tailor error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET TAILOR STATISTICS =====
// export const getTailorStats = async (req, res) => {
//   try {
//     const stats = await Tailor.aggregate([
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
//       { $match: { isActive: true, tailor: { $ne: null } } },
//       { $group: {
//         _id: "$tailor",
//         count: { $sum: 1 }
//       }},
//       { $group: {
//         _id: null,
//         avgWorkPerTailor: { $avg: "$count" },
//         maxWork: { $max: "$count" },
//         minWork: { $min: "$count" },
//         totalAssigned: { $sum: "$count" }
//       }}
//     ]);

//     res.json({
//       tailorStats: stats[0] || { total: 0, available: 0, onLeave: 0, present: 0, halfDay: 0, holiday: 0 },
//       workDistribution: workDistribution[0] || { avgWorkPerTailor: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
//     });
//   } catch (error) {
//     console.error("Get tailor stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== TEMPORARY: FIX ALL TAILOR STATS =====
// export const fixAllTailorStats = async (req, res) => {
//   try {
//     const tailors = await Tailor.find({ isActive: true });
//     let updated = 0;
//     let fixed = [];

//     for (let tailor of tailors) {
//       const works = await Work.find({ 
//         tailor: tailor._id,
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
//       if (JSON.stringify(tailor.workStats) !== JSON.stringify(workStats)) {
//         tailor.workStats = workStats;
//         await tailor.save();
//         updated++;
//         fixed.push({
//           name: tailor.name,
//           tailorId: tailor.tailorId,
//           oldStats: tailor.workStats,
//           newStats: workStats
//         });
//       }
//     }

//     res.json({
//       message: `Fixed stats for ${updated} tailors`,
//       updated,
//       fixed
//     });
//   } catch (error) {
//     console.error("Fix stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };




// // Add to controllers/tailor.controller.js after getTailorStats

// // ============================================
// // ✅ GET TOP PERFORMING TAILORS (NEW)
// // ============================================
// export const getTopTailors = async (req, res) => {
//   try {
//     const { limit = 5 } = req.query;

//     // Get all active tailors
//     const tailors = await Tailor.find({ isActive: true })
//       .select('name tailorId specialization experience workStats isAvailable leaveStatus')
//       .lean();

//     // Get all works with status for completion calculation
//     const works = await Work.find({ 
//       isActive: true,
//       tailor: { $ne: null }
//     })
//       .select('tailor status')
//       .lean();

//     // Calculate completed orders per tailor
//     const completedCounts = {};
//     works.forEach(work => {
//       if (work.tailor && work.status === 'ready-to-delivery') {
//         const tailorId = work.tailor.toString();
//         completedCounts[tailorId] = (completedCounts[tailorId] || 0) + 1;
//       }
//     });

//     // Calculate average completion time (mock for now - implement based on your data)
//     // You can add createdAt and completedAt fields to works for accurate calculation

//     // Enhance tailors with calculated data
//     const enhancedTailors = tailors.map(tailor => ({
//       _id: tailor._id,
//       name: tailor.name,
//       tailorId: tailor.tailorId,
//       specialization: tailor.specialization || 'General',
//       experience: tailor.experience || 0,
//       completedOrders: completedCounts[tailor._id.toString()] || 0,
//       totalAssigned: tailor.workStats?.totalAssigned || 0,
//       isAvailable: tailor.isAvailable,
//       leaveStatus: tailor.leaveStatus
//     }));

//     // Sort by completed orders and take top performers
//     const topTailors = enhancedTailors
//       .sort((a, b) => b.completedOrders - a.completedOrders)
//       .slice(0, parseInt(limit));

//     // Calculate average completion time (placeholder)
//     const avgCompletionTime = "4.5 days"; // You can calculate this from actual data

//     res.json({
//       success: true,
//       topTailors,
//       summary: {
//         averageCompletionTime: avgCompletionTime,
//         totalActiveTailors: tailors.length,
//         totalCompletedOrders: Object.values(completedCounts).reduce((a, b) => a + b, 0)
//       }
//     });

//   } catch (error) {
//     console.error("❌ Get top tailors error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ GET TAILOR PERFORMANCE REPORT (NEW)
// // ============================================
// export const getTailorPerformance = async (req, res) => {
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
//       tailor: { $ne: null }
//     })
//       .populate('tailor', 'name tailorId')
//       .lean();

//     // Group by tailor
//     const performance = {};
//     completedWorks.forEach(work => {
//       if (work.tailor) {
//         const tailorId = work.tailor._id.toString();
//         if (!performance[tailorId]) {
//           performance[tailorId] = {
//             tailor: work.tailor,
//             completedCount: 0,
//             works: []
//           };
//         }
//         performance[tailorId].completedCount++;
//         performance[tailorId].works.push({
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
//     console.error("❌ Get tailor performance error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// controllers/tailor.controller.js
import Tailor from "../models/Tailor.js";
import Work from "../models/Work.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import CuttingMaster from "../models/CuttingMaster.js";
import StoreKeeper from "../models/StoreKeeper.js";
import AariWorker from "../models/AariWorker.js";
import EmbroideryWorker from "../models/EmbroideryWorker.js";
import Helper from "../models/Helper.js";

// ===== CREATE TAILOR =====
export const createTailor = async (req, res) => {
  try {
    console.log("📝 Creating tailor with data:", {
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
    const existingPhone = await Tailor.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Tailor with this phone number already exists" });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await Tailor.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Tailor with this email already exists" });
      }
    }

    // Generate tailorId
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await Tailor.countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    const tailorId = `TLR${year}${month}${sequence}`;

    // Create tailor with ALL fields
    const tailor = new Tailor({
      tailorId,
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

    console.log("💾 Saving tailor with ID:", tailorId);
    await tailor.save();
    console.log("✅ Tailor created with ID:", tailor.tailorId);

    // Create user account
    let user = null;
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        name,
        email: email || `${phone}@tailor.dreamfit.com`,
        phone,
        role: "TAILOR",
        password: hashedPassword,
        tailorId: tailor._id,
        isActive: true
      });
      console.log("✅ User account created for tailor");
    } catch (userError) {
      console.log("⚠️ User account creation failed:", userError.message);
    }

    const tailorResponse = tailor.toObject();
    delete tailorResponse.password;
    
    res.status(201).json({
      message: "Tailor created successfully",
      tailor: tailorResponse,
      user: user ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      } : null
    });
  } catch (error) {
    console.error("❌ Create tailor error:", error);
    
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

// // ===== GET ALL TAILORS =====
// export const getAllTailors = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { tailorId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (status && status !== 'all') {
//       query.leaveStatus = status;
//     }

//     if (availability && availability !== 'all') {
//       query.isAvailable = availability === 'available';
//     }

//     const tailors = await Tailor.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // ✅ Calculate workStats from actual works for each tailor
//     for (let tailor of tailors) {
//       const works = await Work.find({ 
//         tailor: tailor._id,
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

//       // Update the tailor object in memory (don't save to DB for performance)
//       tailor.workStats = workStats;
//     }

//     res.json(tailors);
//   } catch (error) {
//     console.error("Get all tailors error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
export const getAllTailors = async (req, res) => {
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
        { tailorId: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Filter Logic
    if (status && status !== 'all') {
      matchQuery.leaveStatus = status;
    }

    if (availability && availability !== 'all') {
      matchQuery.isAvailable = availability === 'available';
    }

    // 🚀 HIGH-PERFORMANCE AGGREGATION PIPELINE (Requirement 1 & 5)
    // Deriving all stats directly from Work stage history SSOT
    const tailors = await Tailor.aggregate([
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

      // 📊 Calculate stats dynamically (Requirement: Job Card SSOT)
      {
        $addFields: {
          // Flatten all assignments for this worker
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
          // Done = Count all workflow stages completed by the worker
          totalCompleted: {
            $size: {
              $filter: {
                input: "$myAssignments",
                as: "a",
                cond: { $eq: ["$$a.status", "completed"] }
              }
            }
          },
          // Assigned = Count all active workflow stages currently assigned to the worker (Not yet completed)
          // Pending = Same as Assigned (per user requirement)
          totalAssigned: {
            $size: {
              $filter: {
                input: "$myAssignments",
                as: "a",
                cond: { $ne: ["$$a.status", "completed"] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          totalPending: "$totalAssigned",
          tailorName: "$name",
          tailorId: "$tailorId"
        }
      },

      // 🧹 Clean up
      { $project: { allWorks: 0, myAssignments: 0 } }
    ]);

    res.status(200).json(tailors);

  } catch (error) {
    console.error("❌ High-Perf Tailor Fetch Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ===== GET TAILOR BY ID =====
export const getTailorById = async (req, res) => {
  try {
    let tailor = await Tailor.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate({
        path: 'performance.feedback.from',
        select: 'name'
      });

    if (!tailor) {
      // Fallback search in other collections
      tailor = await CuttingMaster.findById(req.params.id).populate('createdBy', 'name') ||
               await StoreKeeper.findById(req.params.id).populate('createdBy', 'name') ||
               await AariWorker.findById(req.params.id).populate('createdBy', 'name') ||
               await EmbroideryWorker.findById(req.params.id).populate('createdBy', 'name') ||
               await Helper.findById(req.params.id).populate('createdBy', 'name');
      
      if (tailor) {
        tailor = tailor.toObject ? tailor.toObject() : tailor;
        tailor.tailorId = tailor.tailorId || 
                          tailor.cuttingMasterId || 
                          tailor.storeKeeperId || 
                          tailor.aariWorkerId || 
                          tailor.embroideryWorkerId || 
                          tailor.helperId || 
                          'N/A';
      }
    }

    if (!tailor) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    // ✅ Derive all history and stats from Work SSOT
    const works = await Work.find({ 
      "assignments.workerId": tailor._id
    })
      .populate({
        path: 'order',
        select: 'orderId customer deliveryDate status',
        populate: {
          path: 'customer',
          select: 'name'
        }
      })
      .populate({
        path: 'garment',
        select: 'name garmentId'
      })
      .sort({ createdAt: -1 });

    // ✅ Flatten all assignments for this worker from all fetched works
    const allMyAssignments = works.reduce((acc, w) => {
      const mine = w.assignments?.filter(a => a.workerId?.toString() === tailor._id.toString()) || [];
      return [...acc, ...mine];
    }, []);

    // ✅ Stats derived purely from Work.assignments SSOT
    const stats = {
      totalAssigned: allMyAssignments.length,
      completed: allMyAssignments.filter(a => a.status === 'completed').length,
      inProgress: allMyAssignments.filter(a => a.status === 'active').length,
      pending: allMyAssignments.filter(a => a.status === 'pending').length
    };

    res.json({
      tailor,
      works,
      stats,
      workStats: stats
    });
  } catch (error) {
    console.error("Get tailor error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE TAILOR =====
export const updateTailor = async (req, res) => {
  try {
    const tailor = await Tailor.findById(req.params.id);

    if (!tailor) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isStoreKeeper = req.user.role === 'STORE_KEEPER';
    const isTailorSelf = req.user.tailorId?.toString() === tailor._id.toString();

    if (!isAdmin && !isStoreKeeper && !isTailorSelf) {
      return res.status(403).json({ message: "Not authorized to update this tailor" });
    }

    const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience', 'basicSalary'];
    
    if (isAdmin || isStoreKeeper) {
      updatableFields.push('isAvailable', 'leaveStatus', 'leaveFrom', 'leaveTo', 'leaveReason');
    }

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        tailor[field] = req.body[field];
      }
    });

    await tailor.save();

    if (isAdmin || isStoreKeeper) {
      await User.findOneAndUpdate(
        { tailorId: tailor._id },
        { 
          name: tailor.name,
          email: tailor.email,
          phone: tailor.phone,
          isActive: tailor.isActive
        }
      );
    }

    res.json({
      message: "Tailor updated successfully",
      tailor
    });
  } catch (error) {
    console.error("Update tailor error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE LEAVE STATUS =====
export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
    const tailor = await Tailor.findById(req.params.id);

    if (!tailor) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isStoreKeeper = req.user.role === 'STORE_KEEPER';
    const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
    const isTailorSelf = req.user.tailorId?.toString() === tailor._id.toString();

    if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isTailorSelf) {
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

    tailor.leaveStatus = leaveStatus;
    tailor.isAvailable = leaveStatus === 'present';
    
    if (leaveFrom) tailor.leaveFrom = leaveFrom;
    if (leaveTo) tailor.leaveTo = leaveTo;
    if (leaveReason) tailor.leaveReason = leaveReason;

    await tailor.save();

    res.json({
      message: `Leave status updated to ${leaveStatus}`,
      tailor
    });
  } catch (error) {
    console.error("Update leave status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== DELETE TAILOR (soft delete) =====
export const deleteTailor = async (req, res) => {
  try {
    const tailor = await Tailor.findById(req.params.id);

    if (!tailor) {
      return res.status(404).json({ message: "Tailor not found" });
    }

    // ✅ Check if tailor has active works
    const activeWorks = await Work.countDocuments({
      tailor: tailor._id,
      status: { $nin: ['ready-to-deliver', 'cancelled'] }
    });

    if (activeWorks > 0) {
      return res.status(400).json({ 
        message: `Cannot delete tailor with ${activeWorks} active works. Complete or reassign works first.` 
      });
    }

    tailor.isActive = false;
    await tailor.save();

    await User.findOneAndUpdate(
      { tailorId: tailor._id },
      { isActive: false }
    );

    res.json({ message: "Tailor deleted successfully" });
  } catch (error) {
    console.error("Delete tailor error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== ✅ SINGLE getTailorStats FUNCTION (Dashboard Compatible) =====
export const getTailorStats = async (req, res) => {
  try {
    console.log('📊 Getting tailor stats for dashboard');
    
    const stats = await Tailor.aggregate([
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

    // ✅ Get work distribution using assignments array
    const workDistribution = await Work.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$assignments" },
      { $match: { "assignments.workerId": { $ne: null } } },
      { $group: {
        _id: "$assignments.workerId",
        count: { $sum: 1 }
      }},
      { $group: {
        _id: null,
        avgWorkPerTailor: { $avg: "$count" },
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

    console.log('✅ Tailor stats:', result);

    res.json({
      tailorStats: result,
      workDistribution: workDistribution[0] || { avgWorkPerTailor: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
    });

  } catch (error) {
    console.error('❌ Get tailor stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// ✅ GET TOP PERFORMING TAILORS (For Dashboard)
// ============================================
export const getTopTailors = async (req, res) => {
  try {
    const { limit = 5, period = 'month' } = req.query;
    
    console.log(`🏆 Getting top ${limit} tailors for period: ${period}`);

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

    // Get all active tailors
    const tailors = await Tailor.find({ isActive: true })
      .select('name tailorId specialization experience isAvailable leaveStatus')
      .lean();

    // ✅ Get ALL works with assignments for these tailors (no reliance on stored workStats)
    const allWorks = await Work.find({
      isActive: true,
      "assignments.workerId": { $ne: null }
    })
      .select('assignments updatedAt')
      .lean();

    // ✅ Build per-tailor stats purely from Work.assignments
    const tailorStatsMap = {};
    allWorks.forEach(work => {
      (work.assignments || []).forEach(asgn => {
        if (!asgn.workerId) return;
        const tId = asgn.workerId.toString();
        if (!tailorStatsMap[tId]) {
          tailorStatsMap[tId] = { totalAssigned: 0, completed: 0, completedInPeriod: 0 };
        }
        tailorStatsMap[tId].totalAssigned++;
        if (asgn.status === 'completed') {
          tailorStatsMap[tId].completed++;
          // Check if completed within the period
          const completedAt = asgn.completedAt ? new Date(asgn.completedAt) : null;
          if (completedAt && completedAt >= startDate && completedAt <= endDate) {
            tailorStatsMap[tId].completedInPeriod++;
          }
        }
      });
    });

    // Enhance tailors with dynamically calculated data
    const enhancedTailors = tailors.map(tailor => {
      const stats = tailorStatsMap[tailor._id.toString()] || { totalAssigned: 0, completed: 0, completedInPeriod: 0 };
      return {
        _id: tailor._id,
        name: tailor.name,
        tailorId: tailor.tailorId,
        specialization: Array.isArray(tailor.specialization) ? tailor.specialization[0] : tailor.specialization || 'General',
        experience: tailor.experience || 0,
        completedOrders: stats.completedInPeriod,
        totalAssigned: stats.totalAssigned,
        isAvailable: tailor.isAvailable,
        leaveStatus: tailor.leaveStatus,
        efficiency: stats.totalAssigned > 0 
          ? Math.round((stats.completed / stats.totalAssigned) * 100) 
          : 0
      };
    });

    // Sort by completed orders and take top performers
    const topTailors = enhancedTailors
      .sort((a, b) => b.completedOrders - a.completedOrders)
      .slice(0, parseInt(limit));

    const totalCompletedInPeriod = Object.values(tailorStatsMap).reduce((sum, s) => sum + s.completedInPeriod, 0);

    console.log(`✅ Top ${topTailors.length} tailors prepared (dynamic from Work SSOT)`);

    res.json({
      success: true,
      topTailors,
      summary: {
        averageCompletionTime: "4.5 days",
        totalActiveTailors: tailors.length,
        totalCompletedOrders: totalCompletedInPeriod,
        period,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });

  } catch (error) {
    console.error('❌ Get top tailors error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// ✅ GET TAILOR PERFORMANCE REPORT (For Dashboard)
// ============================================
export const getTailorPerformance = async (req, res) => {
  try {
    const { period = 'month', tailorId } = req.query;

    console.log('📈 Getting tailor performance (Work SSOT) for period:', period);

    // ✅ Get ALL workers from all collections so we have name/ID mapping
    const [tailors, cuttingMasters, storeKeepers, aariWorkers, embroideryWorkers, helpers] = await Promise.all([
      Tailor.find().select('name tailorId').lean(),
      CuttingMaster.find().select('name cuttingMasterId').lean(),
      StoreKeeper.find().select('name storeKeeperId').lean(),
      AariWorker.find().select('name aariWorkerId').lean(),
      EmbroideryWorker.find().select('name embroideryWorkerId').lean(),
      Helper.find().select('name helperId').lean()
    ]);

    const tailorLookup = {};
    tailors.forEach(t => { tailorLookup[t._id.toString()] = { name: t.name, tailorId: t.tailorId }; });
    cuttingMasters.forEach(t => { tailorLookup[t._id.toString()] = { name: t.name, tailorId: t.cuttingMasterId }; });
    storeKeepers.forEach(t => { tailorLookup[t._id.toString()] = { name: t.name, tailorId: t.storeKeeperId }; });
    aariWorkers.forEach(t => { tailorLookup[t._id.toString()] = { name: t.name, tailorId: t.aariWorkerId }; });
    embroideryWorkers.forEach(t => { tailorLookup[t._id.toString()] = { name: t.name, tailorId: t.embroideryWorkerId }; });
    helpers.forEach(t => { tailorLookup[t._id.toString()] = { name: t.name, tailorId: t.helperId }; });

    // ✅ Query ALL active works that have any worker assignment
    const workQuery = {
      isActive: true,
      "assignments.workerId": { $ne: null }
    };

    // If specific tailor requested, narrow down
    if (tailorId) {
      workQuery["assignments.workerId"] = tailorId;
    }

    const works = await Work.find(workQuery)
      .select('assignments workId')
      .lean();

    // ✅ Aggregate per-worker stats purely from Work.assignments
    const workerMap = new Map();

    works.forEach(work => {
      (work.assignments || []).forEach(asgn => {
        if (!asgn.workerId) return;
        const wId = asgn.workerId.toString();

        if (!workerMap.has(wId)) {
          const info = tailorLookup[wId] || {};
          workerMap.set(wId, {
            _id: wId,
            tailorName: info.name || asgn.workerName || 'Unknown',
            tailorId: info.tailorId || 'N/A',
            totalAssigned: 0,
            totalCompleted: 0,
            totalPending: 0
          });
        }

        const entry = workerMap.get(wId);
        entry.totalAssigned++;
        if (asgn.status === 'completed') {
          entry.totalCompleted++;
        } else if (asgn.status === 'active') {
          // active assignment - does not increment pending
        } else {
          entry.totalPending++;
        }
      });
    });

    // Build performance array sorted by totalAssigned descending
    const performance = Array.from(workerMap.values())
      .sort((a, b) => b.totalAssigned - a.totalAssigned);

    // Summary statistics
    const totalCompleted = performance.reduce((s, p) => s + p.totalCompleted, 0);
    const totalAssigned = performance.reduce((s, p) => s + p.totalAssigned, 0);
    const activeTailors = performance.length;
    const avgPerTailor = activeTailors > 0 ? Math.round((totalAssigned + totalCompleted) / activeTailors) : 0;

    const summary = {
      totalCompleted,
      totalAssigned,
      activeTailors,
      avgPerTailor,
      period
    };

    console.log('✅ Performance data prepared (Work SSOT):', summary);

    res.json({
      success: true,
      period,
      performance,
      summary
    });

  } catch (error) {
    console.error('❌ Get tailor performance error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== DEPRECATED: Stats are now derived dynamically from Work SSOT =====
export const fixAllTailorStats = async (req, res) => {
  // No-op: Worker stats are now computed dynamically from Work.assignments.
  // This endpoint is kept for backward compatibility but does not mutate any records.
  res.json({
    message: 'Stats are now derived dynamically from Work assignments. No database updates needed.',
    updated: 0,
    fixed: []
  });
};