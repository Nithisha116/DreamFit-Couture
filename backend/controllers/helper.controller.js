// import Helper from "../models/Helper.js";
// import Work from "../models/Work.js";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";

// // ===== CREATE HELPER =====
// // ===== CREATE HELPER =====
// export const createHelper = async (req, res) => {
//   try {
//     console.log("📝 Creating helper with data:", {
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
//     const existingPhone = await Helper.findOne({ phone });
//     if (existingPhone) {
//       return res.status(400).json({ message: "Helper with this phone number already exists" });
//     }

//     // Check if email already exists (if provided)
//     if (email) {
//       const existingEmail = await Helper.findOne({ email });
//       if (existingEmail) {
//         return res.status(400).json({ message: "Helper with this email already exists" });
//       }
//     }

//     // Generate helperId manually (since pre-save hook might not be running)
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await Helper.countDocuments();
//     const sequence = String(count + 1).padStart(4, '0');
//     const helperId = `AAR${year}${month}${sequence}`;

//     // Create helper with ALL fields
//     const helper = new Helper({
//       helperId, // Set manually to ensure it's there
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

//     console.log("💾 Saving helper with ID:", helperId);
    
//     // Save to database
//     await helper.save();
    
//     console.log("✅ Helper created with ID:", helper.helperId);

//     // Create user account with the SAME password
//     let user = null;
//     try {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt); // Use the provided password

//       user = await User.create({
//         name,
//         email: email || `${phone}@helper.dreamfit.com`,
//         phone,
//         role: "HELPER",
//         password: hashedPassword,
//         helperId: helper._id,
//         isActive: true
//       });
//       console.log("✅ User account created for helper");
//     } catch (userError) {
//       console.log("⚠️ User account creation failed:", userError.message);
//       // Don't fail the whole request if user creation fails
//     }

//     // Return success response (excluding password)
//     const helperResponse = helper.toObject();
//     delete helperResponse.password;
    
//     res.status(201).json({
//       message: "Helper created successfully",
//       helper: helperResponse,
//       user: user ? {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       } : null
//     });
//   } catch (error) {
//     console.error("❌ Create helper error:", error);
    
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
// // ===== GET ALL HELPERS =====
// export const getAllHelpers = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     // Search by name, phone, email, helperId
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { helperId: { $regex: search, $options: 'i' } }
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

//     const helpers = await Helper.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // Get work statistics for each helper
//     for (let helper of helpers) {
//       const workStats = await Work.aggregate([
//         { $match: { assignedTo: helper._id, isActive: true } },
//         { $group: {
//           _id: null,
//           total: { $sum: 1 },
//           completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
//           pending: { $sum: { $cond: [{ $in: ["$status", ["pending", "accepted"]] }, 1, 0] } },
//           inProgress: { $sum: { $cond: [{ $in: ["$status", ["cutting", "stitching", "iron"]] }, 1, 0] } }
//         }}
//       ]);

//       if (workStats.length > 0) {
//         helper.workStats = workStats[0];
//       } else {
//         helper.workStats = { total: 0, completed: 0, pending: 0, inProgress: 0 };
//       }
//     }

//     res.json(helpers);
//   } catch (error) {
//     console.error("Get all helpers error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET HELPER BY ID =====
// export const getHelperById = async (req, res) => {
//   try {
//     const helper = await Helper.findById(req.params.id)
//       .populate('createdBy', 'name')
//       .populate({
//         path: 'performance.feedback.from',
//         select: 'name'
//       });

//     if (!helper) {
//       return res.status(404).json({ message: "Helper not found" });
//     }

//     // Get all works assigned to this helper
//     const works = await Work.find({ 
//       assignedTo: helper._id,
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
//       helper,
//       works,
//       workStats
//     });
//   } catch (error) {
//     console.error("Get helper error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE HELPER =====
// export const updateHelper = async (req, res) => {
//   try {
//     const helper = await Helper.findById(req.params.id);

//     if (!helper) {
//       return res.status(404).json({ message: "Helper not found" });
//     }

//     // Check permissions
//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isHelperSelf = req.user.helperId?.toString() === helper._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isHelperSelf) {
//       return res.status(403).json({ message: "Not authorized to update this helper" });
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
//         helper[field] = req.body[field];
//       }
//     });

//     await helper.save();

//     // Update corresponding user account if needed
//     if (isAdmin || isStoreKeeper) {
//       await User.findOneAndUpdate(
//         { helperId: helper._id },
//         { 
//           name: helper.name,
//           email: helper.email,
//           phone: helper.phone,
//           isActive: helper.isActive
//         }
//       );
//     }

//     res.json({
//       message: "Helper updated successfully",
//       helper
//     });
//   } catch (error) {
//     console.error("Update helper error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE LEAVE STATUS =====
// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatus = async (req, res) => {
//   try {
//     const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
//     const helper = await Helper.findById(req.params.id);

//     if (!helper) {
//       return res.status(404).json({ message: "Helper not found" });
//     }

//     // Check permissions
//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
//     const isHelperSelf = req.user.helperId?.toString() === helper._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isHelperSelf) {
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

//     helper.leaveStatus = leaveStatus;
//     helper.isAvailable = leaveStatus === 'present';
    
//     if (leaveFrom) helper.leaveFrom = leaveFrom;
//     if (leaveTo) helper.leaveTo = leaveTo;
//     if (leaveReason) helper.leaveReason = leaveReason;

//     await helper.save();

//     res.json({
//       message: `Leave status updated to ${leaveStatus}`,
//       helper
//     });
//   } catch (error) {
//     console.error("Update leave status error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE HELPER (soft delete) =====
// export const deleteHelper = async (req, res) => {
//   try {
//     const helper = await Helper.findById(req.params.id);

//     if (!helper) {
//       return res.status(404).json({ message: "Helper not found" });
//     }

//     // Check if helper has active works
//     const activeWorks = await Work.countDocuments({
//       assignedTo: helper._id,
//       status: { $nin: ['completed', 'cancelled'] }
//     });

//     if (activeWorks > 0) {
//       return res.status(400).json({ 
//         message: `Cannot delete helper with ${activeWorks} active works. Complete or reassign works first.` 
//       });
//     }

//     helper.isActive = false;
//     await helper.save();

//     // Also deactivate user account
//     await User.findOneAndUpdate(
//       { helperId: helper._id },
//       { isActive: false }
//     );

//     res.json({ message: "Helper deleted successfully" });
//   } catch (error) {
//     console.error("Delete helper error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET HELPER STATISTICS =====
// export const getHelperStats = async (req, res) => {
//   try {
//     const stats = await Helper.aggregate([
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
//         avgWorkPerHelper: { $avg: "$count" },
//         maxWork: { $max: "$count" },
//         minWork: { $min: "$count" },
//         totalAssigned: { $sum: "$count" }
//       }}
//     ]);

//     res.json({
//       helperStats: stats[0] || { total: 0, available: 0, onLeave: 0, present: 0, halfDay: 0, holiday: 0 },
//       workDistribution: workDistribution[0] || { avgWorkPerHelper: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
//     });
//   } catch (error) {
//     console.error("Get helper stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // controllers/helper.controller.js
// import Helper from "../models/Helper.js";
// import Work from "../models/Work.js";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";

// // ===== CREATE HELPER =====
// export const createHelper = async (req, res) => {
//   try {
//     console.log("📝 Creating helper with data:", {
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
//     const existingPhone = await Helper.findOne({ phone });
//     if (existingPhone) {
//       return res.status(400).json({ message: "Helper with this phone number already exists" });
//     }

//     // Check if email already exists (if provided)
//     if (email) {
//       const existingEmail = await Helper.findOne({ email });
//       if (existingEmail) {
//         return res.status(400).json({ message: "Helper with this email already exists" });
//       }
//     }

//     // Generate helperId
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await Helper.countDocuments();
//     const sequence = String(count + 1).padStart(4, '0');
//     const helperId = `AAR${year}${month}${sequence}`;

//     // Create helper with ALL fields
//     const helper = new Helper({
//       helperId,
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

//     console.log("💾 Saving helper with ID:", helperId);
//     await helper.save();
//     console.log("✅ Helper created with ID:", helper.helperId);

//     // Create user account
//     let user = null;
//     try {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       user = await User.create({
//         name,
//         email: email || `${phone}@helper.dreamfit.com`,
//         phone,
//         role: "HELPER",
//         password: hashedPassword,
//         helperId: helper._id,
//         isActive: true
//       });
//       console.log("✅ User account created for helper");
//     } catch (userError) {
//       console.log("⚠️ User account creation failed:", userError.message);
//     }

//     const helperResponse = helper.toObject();
//     delete helperResponse.password;
    
//     res.status(201).json({
//       message: "Helper created successfully",
//       helper: helperResponse,
//       user: user ? {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       } : null
//     });
//   } catch (error) {
//     console.error("❌ Create helper error:", error);
    
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

// // ===== GET ALL HELPERS =====
// export const getAllHelpers = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { helperId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (status && status !== 'all') {
//       query.leaveStatus = status;
//     }

//     if (availability && availability !== 'all') {
//       query.isAvailable = availability === 'available';
//     }

//     const helpers = await Helper.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // ✅ FIXED: Use correct field name 'helper' not 'assignedTo'
//     for (let helper of helpers) {
//       const works = await Work.find({ 
//         helper: helper._id,  // ✅ CORRECT: using 'helper' field
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

//       helper.workStats = workStats;
//     }

//     res.json(helpers);
//   } catch (error) {
//     console.error("Get all helpers error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET HELPER BY ID =====
// export const getHelperById = async (req, res) => {
//   try {
//     const helper = await Helper.findById(req.params.id)
//       .populate('createdBy', 'name')
//       .populate({
//         path: 'performance.feedback.from',
//         select: 'name'
//       });

//     if (!helper) {
//       return res.status(404).json({ message: "Helper not found" });
//     }

//     // ✅ FIXED: Get all works assigned to this helper using 'helper' field
//     const works = await Work.find({ 
//       helper: helper._id,  // ✅ CORRECT: using 'helper' field
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

//     // Update helper's workStats in database
//     helper.workStats = workStats;
//     await helper.save();

//     res.json({
//       helper,
//       works,
//       workStats
//     });
//   } catch (error) {
//     console.error("Get helper error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE HELPER =====
// export const updateHelper = async (req, res) => {
//   try {
//     const helper = await Helper.findById(req.params.id);

//     if (!helper) {
//       return res.status(404).json({ message: "Helper not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isHelperSelf = req.user.helperId?.toString() === helper._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isHelperSelf) {
//       return res.status(403).json({ message: "Not authorized to update this helper" });
//     }

//     const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience'];
    
//     if (isAdmin || isStoreKeeper) {
//       updatableFields.push('isAvailable', 'leaveStatus', 'leaveFrom', 'leaveTo', 'leaveReason');
//     }

//     updatableFields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         helper[field] = req.body[field];
//       }
//     });

//     await helper.save();

//     if (isAdmin || isStoreKeeper) {
//       await User.findOneAndUpdate(
//         { helperId: helper._id },
//         { 
//           name: helper.name,
//           email: helper.email,
//           phone: helper.phone,
//           isActive: helper.isActive
//         }
//       );
//     }

//     res.json({
//       message: "Helper updated successfully",
//       helper
//     });
//   } catch (error) {
//     console.error("Update helper error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatus = async (req, res) => {
//   try {
//     const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
//     const helper = await Helper.findById(req.params.id);

//     if (!helper) {
//       return res.status(404).json({ message: "Helper not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
//     const isHelperSelf = req.user.helperId?.toString() === helper._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isHelperSelf) {
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

//     helper.leaveStatus = leaveStatus;
//     helper.isAvailable = leaveStatus === 'present';
    
//     if (leaveFrom) helper.leaveFrom = leaveFrom;
//     if (leaveTo) helper.leaveTo = leaveTo;
//     if (leaveReason) helper.leaveReason = leaveReason;

//     await helper.save();

//     res.json({
//       message: `Leave status updated to ${leaveStatus}`,
//       helper
//     });
//   } catch (error) {
//     console.error("Update leave status error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE HELPER (soft delete) =====
// export const deleteHelper = async (req, res) => {
//   try {
//     const helper = await Helper.findById(req.params.id);

//     if (!helper) {
//       return res.status(404).json({ message: "Helper not found" });
//     }

//     // ✅ FIXED: Check if helper has active works using 'helper' field
//     const activeWorks = await Work.countDocuments({
//       helper: helper._id,  // ✅ CORRECT: using 'helper' field
//       status: { $nin: ['ready-to-deliver', 'cancelled'] }
//     });

//     if (activeWorks > 0) {
//       return res.status(400).json({ 
//         message: `Cannot delete helper with ${activeWorks} active works. Complete or reassign works first.` 
//       });
//     }

//     helper.isActive = false;
//     await helper.save();

//     await User.findOneAndUpdate(
//       { helperId: helper._id },
//       { isActive: false }
//     );

//     res.json({ message: "Helper deleted successfully" });
//   } catch (error) {
//     console.error("Delete helper error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET HELPER STATISTICS =====
// export const getHelperStats = async (req, res) => {
//   try {
//     const stats = await Helper.aggregate([
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

//     // ✅ FIXED: Get work distribution using 'helper' field
//     const workDistribution = await Work.aggregate([
//       { $match: { isActive: true, helper: { $ne: null } } },  // ✅ CORRECT: using 'helper' field
//       { $group: {
//         _id: "$helper",
//         count: { $sum: 1 }
//       }},
//       { $group: {
//         _id: null,
//         avgWorkPerHelper: { $avg: "$count" },
//         maxWork: { $max: "$count" },
//         minWork: { $min: "$count" },
//         totalAssigned: { $sum: "$count" }
//       }}
//     ]);

//     res.json({
//       helperStats: stats[0] || { total: 0, available: 0, onLeave: 0, present: 0, halfDay: 0, holiday: 0 },
//       workDistribution: workDistribution[0] || { avgWorkPerHelper: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
//     });
//   } catch (error) {
//     console.error("Get helper stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };




// // controllers/helper.controller.js
// import Helper from "../models/Helper.js";
// import Work from "../models/Work.js";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";

// // ===== CREATE HELPER =====
// export const createHelper = async (req, res) => {
//   try {
//     console.log("📝 Creating helper with data:", {
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
//     const existingPhone = await Helper.findOne({ phone });
//     if (existingPhone) {
//       return res.status(400).json({ message: "Helper with this phone number already exists" });
//     }

//     // Check if email already exists (if provided)
//     if (email) {
//       const existingEmail = await Helper.findOne({ email });
//       if (existingEmail) {
//         return res.status(400).json({ message: "Helper with this email already exists" });
//       }
//     }

//     // Generate helperId
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await Helper.countDocuments();
//     const sequence = String(count + 1).padStart(4, '0');
//     const helperId = `AAR${year}${month}${sequence}`;

//     // Create helper with ALL fields
//     const helper = new Helper({
//       helperId,
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

//     console.log("💾 Saving helper with ID:", helperId);
//     await helper.save();
//     console.log("✅ Helper created with ID:", helper.helperId);

//     // Create user account
//     let user = null;
//     try {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       user = await User.create({
//         name,
//         email: email || `${phone}@helper.dreamfit.com`,
//         phone,
//         role: "HELPER",
//         password: hashedPassword,
//         helperId: helper._id,
//         isActive: true
//       });
//       console.log("✅ User account created for helper");
//     } catch (userError) {
//       console.log("⚠️ User account creation failed:", userError.message);
//     }

//     const helperResponse = helper.toObject();
//     delete helperResponse.password;
    
//     res.status(201).json({
//       message: "Helper created successfully",
//       helper: helperResponse,
//       user: user ? {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       } : null
//     });
//   } catch (error) {
//     console.error("❌ Create helper error:", error);
    
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

// // ===== GET ALL HELPERS =====
// export const getAllHelpers = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { helperId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (status && status !== 'all') {
//       query.leaveStatus = status;
//     }

//     if (availability && availability !== 'all') {
//       query.isAvailable = availability === 'available';
//     }

//     const helpers = await Helper.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // ✅ Calculate workStats from actual works for each helper
//     for (let helper of helpers) {
//       const works = await Work.find({ 
//         helper: helper._id,
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

//       // Update the helper object in memory (don't save to DB for performance)
//       helper.workStats = workStats;
//     }

//     res.json(helpers);
//   } catch (error) {
//     console.error("Get all helpers error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET HELPER BY ID =====
// export const getHelperById = async (req, res) => {
//   try {
//     const helper = await Helper.findById(req.params.id)
//       .populate('createdBy', 'name')
//       .populate({
//         path: 'performance.feedback.from',
//         select: 'name'
//       });

//     if (!helper) {
//       return res.status(404).json({ message: "Helper not found" });
//     }

//     // ✅ Get all works assigned to this helper
//     const works = await Work.find({ 
//       helper: helper._id,
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

//     console.log('📊 Recalculated workStats for helper:', {
//       helperId: helper.helperId,
//       name: helper.name,
//       totalWorks: works.length,
//       workStats,
//       worksBreakdown: works.map(w => ({
//         workId: w.workId,
//         status: w.status
//       }))
//     });

//     // ✅ Update the helper's workStats in database
//     helper.workStats = workStats;
//     await helper.save();

//     res.json({
//       helper,
//       works,
//       workStats
//     });
//   } catch (error) {
//     console.error("Get helper error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE HELPER =====
// export const updateHelper = async (req, res) => {
//   try {
//     const helper = await Helper.findById(req.params.id);

//     if (!helper) {
//       return res.status(404).json({ message: "Helper not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isHelperSelf = req.user.helperId?.toString() === helper._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isHelperSelf) {
//       return res.status(403).json({ message: "Not authorized to update this helper" });
//     }

//     const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience'];
    
//     if (isAdmin || isStoreKeeper) {
//       updatableFields.push('isAvailable', 'leaveStatus', 'leaveFrom', 'leaveTo', 'leaveReason');
//     }

//     updatableFields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         helper[field] = req.body[field];
//       }
//     });

//     await helper.save();

//     if (isAdmin || isStoreKeeper) {
//       await User.findOneAndUpdate(
//         { helperId: helper._id },
//         { 
//           name: helper.name,
//           email: helper.email,
//           phone: helper.phone,
//           isActive: helper.isActive
//         }
//       );
//     }

//     res.json({
//       message: "Helper updated successfully",
//       helper
//     });
//   } catch (error) {
//     console.error("Update helper error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== UPDATE LEAVE STATUS =====
// export const updateLeaveStatus = async (req, res) => {
//   try {
//     const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
//     const helper = await Helper.findById(req.params.id);

//     if (!helper) {
//       return res.status(404).json({ message: "Helper not found" });
//     }

//     const isAdmin = req.user.role === 'ADMIN';
//     const isStoreKeeper = req.user.role === 'STORE_KEEPER';
//     const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
//     const isHelperSelf = req.user.helperId?.toString() === helper._id.toString();

//     if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isHelperSelf) {
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

//     helper.leaveStatus = leaveStatus;
//     helper.isAvailable = leaveStatus === 'present';
    
//     if (leaveFrom) helper.leaveFrom = leaveFrom;
//     if (leaveTo) helper.leaveTo = leaveTo;
//     if (leaveReason) helper.leaveReason = leaveReason;

//     await helper.save();

//     res.json({
//       message: `Leave status updated to ${leaveStatus}`,
//       helper
//     });
//   } catch (error) {
//     console.error("Update leave status error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== DELETE HELPER (soft delete) =====
// export const deleteHelper = async (req, res) => {
//   try {
//     const helper = await Helper.findById(req.params.id);

//     if (!helper) {
//       return res.status(404).json({ message: "Helper not found" });
//     }

//     // ✅ Check if helper has active works
//     const activeWorks = await Work.countDocuments({
//       helper: helper._id,
//       status: { $nin: ['ready-to-deliver', 'cancelled'] }
//     });

//     if (activeWorks > 0) {
//       return res.status(400).json({ 
//         message: `Cannot delete helper with ${activeWorks} active works. Complete or reassign works first.` 
//       });
//     }

//     helper.isActive = false;
//     await helper.save();

//     await User.findOneAndUpdate(
//       { helperId: helper._id },
//       { isActive: false }
//     );

//     res.json({ message: "Helper deleted successfully" });
//   } catch (error) {
//     console.error("Delete helper error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== GET HELPER STATISTICS =====
// export const getHelperStats = async (req, res) => {
//   try {
//     const stats = await Helper.aggregate([
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
//       { $match: { isActive: true, helper: { $ne: null } } },
//       { $group: {
//         _id: "$helper",
//         count: { $sum: 1 }
//       }},
//       { $group: {
//         _id: null,
//         avgWorkPerHelper: { $avg: "$count" },
//         maxWork: { $max: "$count" },
//         minWork: { $min: "$count" },
//         totalAssigned: { $sum: "$count" }
//       }}
//     ]);

//     res.json({
//       helperStats: stats[0] || { total: 0, available: 0, onLeave: 0, present: 0, halfDay: 0, holiday: 0 },
//       workDistribution: workDistribution[0] || { avgWorkPerHelper: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
//     });
//   } catch (error) {
//     console.error("Get helper stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ===== TEMPORARY: FIX ALL HELPER STATS =====
// export const fixAllHelperStats = async (req, res) => {
//   try {
//     const helpers = await Helper.find({ isActive: true });
//     let updated = 0;
//     let fixed = [];

//     for (let helper of helpers) {
//       const works = await Work.find({ 
//         helper: helper._id,
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
//       if (JSON.stringify(helper.workStats) !== JSON.stringify(workStats)) {
//         helper.workStats = workStats;
//         await helper.save();
//         updated++;
//         fixed.push({
//           name: helper.name,
//           helperId: helper.helperId,
//           oldStats: helper.workStats,
//           newStats: workStats
//         });
//       }
//     }

//     res.json({
//       message: `Fixed stats for ${updated} helpers`,
//       updated,
//       fixed
//     });
//   } catch (error) {
//     console.error("Fix stats error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };




// // Add to controllers/helper.controller.js after getHelperStats

// // ============================================
// // ✅ GET TOP PERFORMING HELPERS (NEW)
// // ============================================
// export const getTopHelpers = async (req, res) => {
//   try {
//     const { limit = 5 } = req.query;

//     // Get all active helpers
//     const helpers = await Helper.find({ isActive: true })
//       .select('name helperId specialization experience workStats isAvailable leaveStatus')
//       .lean();

//     // Get all works with status for completion calculation
//     const works = await Work.find({ 
//       isActive: true,
//       helper: { $ne: null }
//     })
//       .select('helper status')
//       .lean();

//     // Calculate completed orders per helper
//     const completedCounts = {};
//     works.forEach(work => {
//       if (work.helper && work.status === 'ready-to-delivery') {
//         const helperId = work.helper.toString();
//         completedCounts[helperId] = (completedCounts[helperId] || 0) + 1;
//       }
//     });

//     // Calculate average completion time (mock for now - implement based on your data)
//     // You can add createdAt and completedAt fields to works for accurate calculation

//     // Enhance helpers with calculated data
//     const enhancedHelpers = helpers.map(helper => ({
//       _id: helper._id,
//       name: helper.name,
//       helperId: helper.helperId,
//       specialization: helper.specialization || 'General',
//       experience: helper.experience || 0,
//       completedOrders: completedCounts[helper._id.toString()] || 0,
//       totalAssigned: helper.workStats?.totalAssigned || 0,
//       isAvailable: helper.isAvailable,
//       leaveStatus: helper.leaveStatus
//     }));

//     // Sort by completed orders and take top performers
//     const topHelpers = enhancedHelpers
//       .sort((a, b) => b.completedOrders - a.completedOrders)
//       .slice(0, parseInt(limit));

//     // Calculate average completion time (placeholder)
//     const avgCompletionTime = "4.5 days"; // You can calculate this from actual data

//     res.json({
//       success: true,
//       topHelpers,
//       summary: {
//         averageCompletionTime: avgCompletionTime,
//         totalActiveHelpers: helpers.length,
//         totalCompletedOrders: Object.values(completedCounts).reduce((a, b) => a + b, 0)
//       }
//     });

//   } catch (error) {
//     console.error("❌ Get top helpers error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ GET HELPER PERFORMANCE REPORT (NEW)
// // ============================================
// export const getHelperPerformance = async (req, res) => {
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
//       helper: { $ne: null }
//     })
//       .populate('helper', 'name helperId')
//       .lean();

//     // Group by helper
//     const performance = {};
//     completedWorks.forEach(work => {
//       if (work.helper) {
//         const helperId = work.helper._id.toString();
//         if (!performance[helperId]) {
//           performance[helperId] = {
//             helper: work.helper,
//             completedCount: 0,
//             works: []
//           };
//         }
//         performance[helperId].completedCount++;
//         performance[helperId].works.push({
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
//     console.error("❌ Get helper performance error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// controllers/helper.controller.js
import Helper from "../models/Helper.js";
import Work from "../models/Work.js";
import User from "../models/User.js";
import { logDeletion } from "../utils/auditLogger.js";
import { hasActiveWorkAssignment } from "../utils/workerAssignment.js";
import bcrypt from "bcryptjs";

// ===== CREATE HELPER =====
export const createHelper = async (req, res) => {
  try {
    console.log("📝 Creating helper with data:", {
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
    const existingPhone = await Helper.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Helper with this phone number already exists" });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await Helper.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Helper with this email already exists" });
      }
    }

    // Generate helperId
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await Helper.countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    const helperId = `AAR${year}${month}${sequence}`;

    // Create helper with ALL fields
    const helper = new Helper({
      helperId,
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

    console.log("💾 Saving helper with ID:", helperId);
    await helper.save();
    console.log("✅ Helper created with ID:", helper.helperId);

    // Create user account
    let user = null;
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        name,
        email: email || `${phone}@helper.dreamfit.com`,
        phone,
        role: "HELPER",
        password: hashedPassword,
        helperId: helper._id,
        isActive: true
      });
      console.log("✅ User account created for helper");
    } catch (userError) {
      console.log("⚠️ User account creation failed:", userError.message);
    }

    const helperResponse = helper.toObject();
    delete helperResponse.password;
    
    res.status(201).json({
      message: "Helper created successfully",
      helper: helperResponse,
      user: user ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      } : null
    });
  } catch (error) {
    console.error("❌ Create helper error:", error);
    
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

// // ===== GET ALL HELPERS =====
// export const getAllHelpers = async (req, res) => {
//   try {
//     const { search, status, availability } = req.query;
//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { helperId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (status && status !== 'all') {
//       query.leaveStatus = status;
//     }

//     if (availability && availability !== 'all') {
//       query.isAvailable = availability === 'available';
//     }

//     const helpers = await Helper.find(query)
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 });

//     // ✅ Calculate workStats from actual works for each helper
//     for (let helper of helpers) {
//       const works = await Work.find({ 
//         helper: helper._id,
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

//       // Update the helper object in memory (don't save to DB for performance)
//       helper.workStats = workStats;
//     }

//     res.json(helpers);
//   } catch (error) {
//     console.error("Get all helpers error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
export const getAllHelpers = async (req, res) => {
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
        { helperId: { $regex: search, $options: 'i' } }
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
    const helpers = await Helper.aggregate([
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
          // Flatten all assignments for this helper
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

    res.status(200).json(helpers);

  } catch (error) {
    console.error("❌ High-Perf Helper Fetch Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ===== GET HELPER BY ID =====
export const getHelperById = async (req, res) => {
  try {
    const helper = await Helper.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate({
        path: 'performance.feedback.from',
        select: 'name'
      });

    if (!helper) {
      return res.status(404).json({ message: "Helper not found" });
    }

    // ✅ Get all works assigned to this helper
    const works = await Work.find({ 
      "assignments.workerId": helper._id,
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

    // ✅ Flatten all assignments for this helper from all fetched works
    const allMyAssignments = works.reduce((acc, w) => {
      const mine = w.assignments?.filter(a => a.workerId?.toString() === helper._id.toString()) || [];
      return [...acc, ...mine];
    }, []);

    // ✅ Calculate work statistics from actual assignments
    const workStats = {
      totalAssigned: allMyAssignments.length,
      completed: allMyAssignments.filter(a => a.status === 'completed').length,
      inProgress: allMyAssignments.filter(a => a.status === 'active').length,
      pending: allMyAssignments.filter(a => a.status === 'pending').length
    };

    console.log('📊 Recalculated workStats for helper:', {
      helperId: helper.helperId,
      name: helper.name,
      totalWorks: works.length,
      workStats,
      worksBreakdown: works.map(w => ({
        workId: w.workId,
        status: w.status
      }))
    });

    // ✅ Update the helper's workStats in database
    helper.workStats = workStats;
    await helper.save();

    res.json({
      helper,
      works,
      workStats
    });
  } catch (error) {
    console.error("Get helper error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE HELPER =====
export const updateHelper = async (req, res) => {
  try {
    const helper = await Helper.findById(req.params.id);

    if (!helper) {
      return res.status(404).json({ message: "Helper not found" });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isStoreKeeper = req.user.role === 'STORE_KEEPER';
    const isHelperSelf = req.user.helperId?.toString() === helper._id.toString();

    if (!isAdmin && !isStoreKeeper && !isHelperSelf) {
      return res.status(403).json({ message: "Not authorized to update this helper" });
    }

    const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience', 'basicSalary'];
    
    if (isAdmin || isStoreKeeper) {
      updatableFields.push('isActive', 'isAvailable', 'leaveStatus', 'leaveFrom', 'leaveTo', 'leaveReason');
    }

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        helper[field] = req.body[field];
      }
    });

    await helper.save();

    if (isAdmin || isStoreKeeper) {
      await User.findOneAndUpdate(
        { helperId: helper._id },
        { 
          name: helper.name,
          email: helper.email,
          phone: helper.phone,
          isActive: helper.isActive
        }
      );
    }

    res.json({
      message: "Helper updated successfully",
      helper
    });
  } catch (error) {
    console.error("Update helper error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE LEAVE STATUS =====
export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveStatus, leaveFrom, leaveTo, leaveReason } = req.body;
    const helper = await Helper.findById(req.params.id);

    if (!helper) {
      return res.status(404).json({ message: "Helper not found" });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isStoreKeeper = req.user.role === 'STORE_KEEPER';
    const isCuttingMaster = req.user.role === 'CUTTING_MASTER';
    const isHelperSelf = req.user.helperId?.toString() === helper._id.toString();

    if (!isAdmin && !isStoreKeeper && !isCuttingMaster && !isHelperSelf) {
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

    helper.leaveStatus = leaveStatus;
    helper.isAvailable = leaveStatus === 'present';
    
    if (leaveFrom) helper.leaveFrom = leaveFrom;
    if (leaveTo) helper.leaveTo = leaveTo;
    if (leaveReason) helper.leaveReason = leaveReason;

    await helper.save();

    res.json({
      message: `Leave status updated to ${leaveStatus}`,
      helper
    });
  } catch (error) {
    console.error("Update leave status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== DELETE HELPER (soft delete) =====
export const deleteHelper = async (req, res) => {
  try {
    const helper = await Helper.findOne({ _id: req.params.id, isActive: true });

    if (!helper) {
      return res.status(404).json({ message: "Helper not found or already deactivated" });
    }

    // ✅ Check if helper has active work assignments
    if (await hasActiveWorkAssignment(helper._id)) {
      return res.status(400).json({
        message: "Cannot delete helper with active work assignments. Complete or reassign work first."
      });
    }

    // Write deletion audit log
    await logDeletion(req, "DELETE_USER", "Helper", helper, helper);

    helper.isActive = false;
    await helper.save();

    // Soft delete associated User document
    await User.findOneAndUpdate(
      { helperId: helper._id },
      { isActive: false }
    );

    res.json({ message: "Helper deactivated successfully" });
  } catch (error) {
    console.error("Delete helper error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== ✅ SINGLE getHelperStats FUNCTION (Dashboard Compatible) =====
export const getHelperStats = async (req, res) => {
  try {
    console.log('📊 Getting helper stats for dashboard');
    
    const stats = await Helper.aggregate([
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
      { $match: { isActive: true, helper: { $ne: null } } },
      { $group: {
        _id: "$helper",
        count: { $sum: 1 }
      }},
      { $group: {
        _id: null,
        avgWorkPerHelper: { $avg: "$count" },
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

    console.log('✅ Helper stats:', result);

    res.json({
      helperStats: result,
      workDistribution: workDistribution[0] || { avgWorkPerHelper: 0, maxWork: 0, minWork: 0, totalAssigned: 0 }
    });

  } catch (error) {
    console.error('❌ Get helper stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// ✅ GET TOP PERFORMING HELPERS (For Dashboard)
// ============================================
export const getTopHelpers = async (req, res) => {
  try {
    const { limit = 5, period = 'month' } = req.query;
    
    console.log(`🏆 Getting top ${limit} helpers for period: ${period}`);

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

    // Get all active helpers
    const helpers = await Helper.find({ isActive: true })
      .select('name helperId specialization experience workStats isAvailable leaveStatus')
      .lean();

    // Get works completed in the period
    const completedWorks = await Work.find({
      status: 'ready-to-deliver',
      updatedAt: { $gte: startDate, $lte: endDate },
      helper: { $ne: null }
    })
      .select('helper')
      .lean();

    // Count completed works per helper
    const completedCounts = {};
    completedWorks.forEach(work => {
      if (work.helper) {
        const helperId = work.helper.toString();
        completedCounts[helperId] = (completedCounts[helperId] || 0) + 1;
      }
    });

    // Enhance helpers with calculated data
    const enhancedHelpers = helpers.map(helper => ({
      _id: helper._id,
      name: helper.name,
      helperId: helper.helperId,
      specialization: Array.isArray(helper.specialization) ? helper.specialization[0] : helper.specialization || 'General',
      experience: helper.experience || 0,
      completedOrders: completedCounts[helper._id.toString()] || 0,
      totalAssigned: helper.workStats?.totalAssigned || 0,
      isAvailable: helper.isAvailable,
      leaveStatus: helper.leaveStatus,
      // Calculate efficiency (completed / total assigned)
      efficiency: helper.workStats?.totalAssigned > 0 
        ? Math.round((helper.workStats.completed / helper.workStats.totalAssigned) * 100) 
        : 0
    }));

    // Sort by completed orders and take top performers
    const topHelpers = enhancedHelpers
      .sort((a, b) => b.completedOrders - a.completedOrders)
      .slice(0, parseInt(limit));

    console.log(`✅ Top ${topHelpers.length} helpers prepared`);

    res.json({
      success: true,
      topHelpers,
      summary: {
        averageCompletionTime: "4.5 days",
        totalActiveHelpers: helpers.length,
        totalCompletedOrders: Object.values(completedCounts).reduce((a, b) => a + b, 0),
        period,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });

  } catch (error) {
    console.error('❌ Get top helpers error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// ✅ GET HELPER PERFORMANCE REPORT (For Dashboard)
// ============================================
export const getHelperPerformance = async (req, res) => {
  try {
    const { period = 'month', helperId } = req.query;

    console.log('📈 Getting helper performance for period:', period);

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
      helper: { $ne: null }
    };

    // If specific helper requested
    if (helperId) {
      query.helper = helperId;
    }

    // Get completed works with details
    const works = await Work.find(query)
      .populate('helper', 'name helperId')
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

    // Group by helper if not specified
    let performance = [];
    
    if (helperId) {
      // Single helper performance
      const helper = works[0]?.helper;
      performance = [{
        helper,
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
      // Group by helper
      const helperMap = new Map();
      
      works.forEach(work => {
        if (work.helper) {
          const helperId = work.helper._id.toString();
          if (!helperMap.has(helperId)) {
            helperMap.set(helperId, {
              helper: work.helper,
              works: [],
              totalCompleted: 0
            });
          }
          const entry = helperMap.get(helperId);
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

      performance = Array.from(helperMap.values())
        .sort((a, b) => b.totalCompleted - a.totalCompleted);
    }

    // Calculate summary statistics
    const totalCompleted = works.length;
    const activeHelpers = performance.length;
    const avgPerHelper = activeHelpers > 0 ? Math.round(totalCompleted / activeHelpers) : 0;

    const summary = {
      totalCompleted,
      activeHelpers,
      avgPerHelper,
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
    console.error('❌ Get helper performance error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ===== TEMPORARY: FIX ALL HELPER STATS =====
export const fixAllHelperStats = async (req, res) => {
  try {
    const helpers = await Helper.find({ isActive: true });
    let updated = 0;
    let fixed = [];

    for (let helper of helpers) {
      const works = await Work.find({ 
        helper: helper._id,
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
      if (JSON.stringify(helper.workStats) !== JSON.stringify(workStats)) {
        helper.workStats = workStats;
        await helper.save();
        updated++;
        fixed.push({
          name: helper.name,
          helperId: helper.helperId,
          oldStats: helper.workStats,
          newStats: workStats
        });
      }
    }

    res.json({
      message: `Fixed stats for ${updated} helpers`,
      updated,
      fixed
    });
  } catch (error) {
    console.error("Fix stats error:", error);
    res.status(500).json({ message: error.message });
  }
};