// backend/controllers/cuttingMaster.controller.js

import CuttingMaster from "../models/CuttingMaster.js";
import Work from "../models/Work.js";
import Order from "../models/Order.js";
import Tailor from "../models/Tailor.js";
import bcrypt from "bcryptjs";

// ============================================
// 📋 CUTTING MASTER CRUD OPERATIONS
// ============================================

/**
 * CREATE CUTTING MASTER (Admin only)
 * POST /api/cutting-masters
 */
export const createCuttingMaster = async (req, res) => {
  try {
    console.log("📝 Creating cutting master with data:", req.body);
    
    const { name, phone, email, password, address, specialization, experience, basicSalary } = req.body;

    // Validate required fields
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!phone) return res.status(400).json({ message: "Phone number is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    // Check duplicates
    const existingPhone = await CuttingMaster.findOne({ phone });
    if (existingPhone) return res.status(400).json({ message: "Phone number already exists" });

    const existingEmail = await CuttingMaster.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });

    // Create cutting master
    const cuttingMaster = await CuttingMaster.create({
      name,
      phone,
      email,
      password,
      address: address || {},
      specialization: specialization || [],
      experience: experience || 0,
      basicSalary: basicSalary || 0,
      createdBy: req.user?._id,
      joiningDate: new Date()
    });

    console.log("✅ Cutting Master created with ID:", cuttingMaster.cuttingMasterId);

    // Don't send password back
    const response = cuttingMaster.toObject();
    delete response.password;

    res.status(201).json({
      message: "Cutting Master created successfully",
      cuttingMaster: response
    });
  } catch (error) {
    console.error("❌ Create error:", error);
    handleError(error, res);
  }
};

/**
 * GET ALL CUTTING MASTERS (Admin/Store Keeper)
 * GET /api/cutting-masters
 */
// export const getAllCuttingMasters = async (req, res) => {
//   try {
//     console.log("📋 Fetching all cutting masters with query:", req.query);
    
//     const { search, availability } = req.query;
//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { cuttingMasterId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (availability && availability !== 'all') {
//       query.isAvailable = availability === 'available';
//     }

//     const cuttingMasters = await CuttingMaster.find(query)
//       .populate('createdBy', 'name')
//       .select('-password')
//       .sort({ createdAt: -1 });

//     // Get work statistics for each cutting master
//     for (let cm of cuttingMasters) {
//       const workStats = await Work.aggregate([
//         { $match: { cuttingMaster: cm._id, isActive: true } },
//         { $group: {
//           _id: null,
//           total: { $sum: 1 },
//           completed: { $sum: { $cond: [{ $eq: ["$status", "ready-to-deliver"] }, 1, 0] } },
//           pending: { $sum: { $cond: [{ $in: ["$status", ["pending", "accepted"]] }, 1, 0] } },
//           inProgress: { $sum: { $cond: [{ $in: ["$status", ["cutting-started", "cutting-completed", "sewing-started", "sewing-completed", "ironing"]] }, 1, 0] } }
//         }}
//       ]);

//       cm = cm.toObject();
//       cm.workStats = workStats[0] || { total: 0, completed: 0, pending: 0, inProgress: 0 };
//     }

//     res.json(cuttingMasters);
//   } catch (error) {
//     console.error("❌ Get all error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
/**
 * GET ALL CUTTING MASTERS (Admin/Store Keeper)
 * GET /api/cutting-masters
 * Optimized for High Performance
 */
export const getAllCuttingMasters = async (req, res) => {
  try {
    console.log("🚀 Running High-Performance Aggregation for Cutting Master List...");
    
    const { search, availability, isActive } = req.query;
    let matchQuery = {};
    if (isActive === 'false') {
      matchQuery.isActive = false;
    } else if (isActive === 'all') {
      // Don't filter by isActive
    } else {
      matchQuery.isActive = true; // Default behavior
    }

    // Search Logic
    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { cuttingMasterId: { $regex: search, $options: 'i' } }
      ];
    }

    // Availability Filter
    if (availability && availability !== 'all') {
      matchQuery.isAvailable = availability === 'available';
    }

    // 🔥 SINGLE AGGREGATION PIPELINE - No more loops!
    const cuttingMasters = await CuttingMaster.aggregate([
      { $match: matchQuery },
      { $sort: { createdAt: -1 } },
      
      // 1. Join with Works collection via assignments array
      {
        $lookup: {
          from: "works", 
          localField: "_id",
          foreignField: "assignments.workerId",
          as: "workDetails"
        }
      },

      // 2. Calculate stats dynamically
      {
        $addFields: {
          // Flatten all assignments for this cutting master
          myAssignments: {
            $filter: {
              input: {
                $reduce: {
                  input: "$workDetails",
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
            total: { $size: "$myAssignments" },
            completed: { 
              $size: { 
                $filter: { 
                  input: "$myAssignments", 
                  as: "a", 
                  cond: { $eq: ["$$a.status", "completed"] } 
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
            },
            inProgress: { 
              $size: { 
                $filter: { 
                  input: "$myAssignments", 
                  as: "a", 
                  cond: { $eq: ["$$a.status", "active"] } 
                } 
              } 
            }
          }
        }
      },

      // 3. Remove unwanted data Matrum Hide Password
      {
        $project: {
          password: 0,
          workDetails: 0,
          myAssignments: 0
        }
      }
    ]);

    console.log(`✅ Success: Fetched ${cuttingMasters.length} Cutting Masters with stats.`);
    res.status(200).json(cuttingMasters);

  } catch (error) {
    console.error("❌ Aggregation Error:", error);
    res.status(500).json({ message: error.message });
  }
};



/**
 * GET CUTTING MASTER BY ID
 * GET /api/cutting-masters/:id
 */
export const getCuttingMasterById = async (req, res) => {
  try {
    console.log(`🔍 Fetching cutting master by ID: ${req.params.id}`);
    
    const cuttingMaster = await CuttingMaster.findById(req.params.id)
      .populate('createdBy', 'name')
      .select('-password');

    if (!cuttingMaster) {
      return res.status(404).json({ message: "Cutting Master not found" });
    }

    // Get works assigned
    const works = await Work.find({ 
      "assignments.workerId": cuttingMaster._id,
      isActive: true 
    })
      .populate({
        path: 'order',
        populate: { path: 'customer', select: 'name phone' }
      })
      .populate('garment', 'name garmentId')
      .populate('tailor', 'name employeeId')
      .sort({ createdAt: -1 });

    // Flatten assignments for this cutting master
    const allMyAssignments = works.reduce((acc, w) => {
      const mine = w.assignments?.filter(a => a.workerId?.toString() === cuttingMaster._id.toString()) || [];
      return [...acc, ...mine];
    }, []);

    const workStats = {
      total: allMyAssignments.length,
      completed: allMyAssignments.filter(a => a.status === 'completed').length,
      inProgress: allMyAssignments.filter(a => a.status === 'active').length,
      pending: allMyAssignments.filter(a => a.status === 'pending').length
    };

    res.json({
      cuttingMaster,
      works,
      workStats
    });
  } catch (error) {
    console.error("❌ Get by ID error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE CUTTING MASTER
 * PUT /api/cutting-masters/:id
 */
export const updateCuttingMaster = async (req, res) => {
  try {
    console.log(`📝 Updating cutting master: ${req.params.id}`, req.body);
    
    const cuttingMaster = await CuttingMaster.findById(req.params.id);

    if (!cuttingMaster) {
      return res.status(404).json({ message: "Cutting Master not found" });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isStoreKeeper = req.user.role === 'STORE_KEEPER';

    if (!isAdmin && !isStoreKeeper) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Fields that can be updated
    const updatableFields = ['name', 'phone', 'email', 'address', 'specialization', 'experience', 'basicSalary', 'isActive', 'isAvailable'];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        cuttingMaster[field] = req.body[field];
      }
    });

    await cuttingMaster.save();

    const response = cuttingMaster.toObject();
    delete response.password;

    res.json({
      message: "Cutting Master updated successfully",
      cuttingMaster: response
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE CUTTING MASTER (soft delete)
 * DELETE /api/cutting-masters/:id
 */
export const deleteCuttingMaster = async (req, res) => {
  try {
    console.log(`🗑️ Deleting cutting master: ${req.params.id}`);
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Only admin can delete" });
    }

    const cuttingMaster = await CuttingMaster.findById(req.params.id);
    if (!cuttingMaster) {
      return res.status(404).json({ message: "Cutting Master not found" });
    }

    // Check active works
    const activeWorks = await Work.countDocuments({
      cuttingMaster: cuttingMaster._id,
      status: { $nin: ['ready-to-deliver', 'cancelled'] }
    });

    if (activeWorks > 0) {
      return res.status(400).json({ 
        message: `Cannot delete with ${activeWorks} active works` 
      });
    }

    await CuttingMaster.findByIdAndDelete(cuttingMaster._id);

    await User.findOneAndDelete({ cuttingMasterId: cuttingMaster._id });

    res.json({ message: "Cutting Master deleted successfully" });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET CUTTING MASTER STATS
 * GET /api/cutting-masters/stats
 */
export const getCuttingMasterStats = async (req, res) => {
  try {
    console.log("📊 Fetching cutting master stats");
    
    const stats = await CuttingMaster.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        available: { $sum: { $cond: [{ $eq: ["$isAvailable", true] }, 1, 0] } }
      }}
    ]);

    res.json({
      cuttingMasterStats: stats[0] || { total: 0, available: 0 }
    });
  } catch (error) {
    console.error("❌ Stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// 📊 CUTTING MASTER DASHBOARD APIs
// ============================================

/**
 * 📊 1. DASHBOARD KPI STATS
 * GET /api/cutting-masters/dashboard/stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    console.log("📊 ===== DASHBOARD STATS API CALLED =====");
    
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all works for this cutting master
    const works = await Work.find({ 
      cuttingMaster: userId, 
      isActive: true 
    });

    // Calculate stats
    const totalWork = works.length;
    const completedWork = works.filter(w => w.status === 'ready-to-deliver').length;
    const inProgressWork = works.filter(w => 
      ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(w.status)
    ).length;
    
    // Calculate overdue works (estimated delivery passed and not completed)
    const overdueWork = works.filter(w => 
      w.estimatedDelivery && 
      new Date(w.estimatedDelivery) < today && 
      w.status !== 'ready-to-deliver'
    ).length;

    const stats = {
      totalWork,
      completedWork,
      inProgressWork,
      overdueWork,
      pendingWork: works.filter(w => w.status === 'pending' || w.status === 'accepted').length
    };

    console.log("✅ Stats calculated:", stats);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Dashboard Stats Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * 📈 2. WORK STATUS BREAKDOWN
 * GET /api/cutting-masters/dashboard/work-status
 */
export const getWorkStatusBreakdown = async (req, res) => {
  try {
    console.log("📈 ===== WORK STATUS BREAKDOWN API CALLED =====");

    const userId = req.user._id;

    // Define all possible statuses with display names
    const statusConfig = [
      { status: 'pending', name: 'Pending', color: '#FBBF24' },
      { status: 'accepted', name: 'Accepted', color: '#60A5FA' },
      { status: 'cutting-started', name: 'Cutting Started', color: '#8B5CF6' },
      { status: 'cutting-completed', name: 'Cutting Completed', color: '#6366F1' },
      { status: 'sewing-started', name: 'Sewing Started', color: '#EC4899' },
      { status: 'sewing-completed', name: 'Sewing Completed', color: '#14B8A6' },
      { status: 'ironing', name: 'Ironing', color: '#F97316' },
      { status: 'ready-to-deliver', name: 'Ready to Deliver', color: '#22C55E' }
    ];

    // Get counts for each status
    const breakdown = await Promise.all(
      statusConfig.map(async (item) => {
        const count = await Work.countDocuments({
          cuttingMaster: userId,
          status: item.status,
          isActive: true
        });

        return {
          name: item.name,
          value: count,
          status: item.status,
          color: item.color
        };
      })
    );

    // Filter out zero values
    const filteredBreakdown = breakdown.filter(item => item.value > 0);

    console.log("✅ Status breakdown fetched:", filteredBreakdown);

    res.status(200).json({
      success: true,
      data: filteredBreakdown
    });
  } catch (error) {
    console.error('❌ Work Status Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * 👥 3. TAILOR PERFORMANCE
 * GET /api/cutting-masters/dashboard/tailor-performance
 */
export const getTailorPerformance = async (req, res) => {
  try {
    console.log("👥 ===== TAILOR PERFORMANCE API CALLED =====");

    // Get all active tailors
    const tailors = await Tailor.find({ isActive: true })
      .select('name employeeId phone specialization')
      .lean();

    console.log(`🔍 Found ${tailors.length} active tailors`);

    // ✅ Get ALL active works with assignments in a single query (efficient)
    const allWorks = await Work.find({ 
      isActive: true,
      "assignments.workerId": { $ne: null }
    })
      .select('assignments')
      .lean();

    // ✅ Build per-tailor stats from Work.assignments SSOT
    const statsMap = {};
    allWorks.forEach(work => {
      (work.assignments || []).forEach(asgn => {
        if (!asgn.workerId) return;
        const tId = asgn.workerId.toString();
        if (!statsMap[tId]) {
          statsMap[tId] = { assigned: 0, completed: 0, inProgress: 0, pending: 0 };
        }
        statsMap[tId].assigned++;
        if (asgn.status === 'completed') {
          statsMap[tId].completed++;
        } else if (asgn.status === 'active') {
          statsMap[tId].inProgress++;
        } else {
          statsMap[tId].pending++;
        }
      });
    });

    // Build performance data for each tailor
    const performanceData = tailors.map(tailor => {
      const stats = statsMap[tailor._id.toString()] || { assigned: 0, completed: 0, inProgress: 0, pending: 0 };
      const efficiency = stats.assigned > 0 ? Math.round((stats.completed / stats.assigned) * 100) : 0;

      return {
        _id: tailor._id,
        name: tailor.name,
        employeeId: tailor.employeeId,
        phone: tailor.phone,
        specialization: tailor.specialization || [],
        assigned: stats.assigned,
        completed: stats.completed,
        pending: stats.pending,
        inProgress: stats.inProgress,
        efficiency,
        rating: efficiency >= 80 ? 5 : efficiency >= 60 ? 4 : efficiency >= 40 ? 3 : efficiency >= 20 ? 2 : 1
      };
    });

    // Sort by completed work (highest first)
    performanceData.sort((a, b) => b.completed - a.completed);

    console.log("✅ Tailor performance calculated (Work SSOT)");

    res.status(200).json({
      success: true,
      data: {
        tailors: performanceData,
        count: performanceData.length
      }
    });
  } catch (error) {
    console.error('❌ Tailor Performance Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * 🟢 4. AVAILABLE TAILORS
 * GET /api/cutting-masters/dashboard/available-tailors
 */
export const getAvailableTailors = async (req, res) => {
  try {
    console.log("🟢 ===== AVAILABLE TAILORS API CALLED =====");

    // Get all active tailors
    const total = await Tailor.countDocuments({ isActive: true });
    
    // Get available tailors (isAvailable true and not on leave)
    const available = await Tailor.countDocuments({
      isActive: true,
      isAvailable: true,
      $or: [
        { leaveStatus: 'present' },
        { leaveStatus: { $exists: false } }
      ]
    });

    const onLeave = await Tailor.countDocuments({
      isActive: true,
      $or: [
        { isAvailable: false },
        { leaveStatus: { $in: ['leave', 'absent'] } }
      ]
    });

    // Get list of available tailors with current workload
    const availableTailorsList = await Tailor.find({
      isActive: true,
      isAvailable: true,
      $or: [
        { leaveStatus: 'present' },
        { leaveStatus: { $exists: false } }
      ]
    })
    .select('name employeeId phone specialization')
    .lean();

    // Add current work count for each tailor
    const tailorsWithWorkload = await Promise.all(
      availableTailorsList.map(async (tailor) => {
        const currentWork = await Work.countDocuments({
          tailor: tailor._id,
          status: { $in: ['sewing-started', 'ironing'] },
          isActive: true
        });

        const pendingWork = await Work.countDocuments({
          tailor: tailor._id,
          status: { $in: ['pending', 'accepted', 'cutting-started', 'cutting-completed'] },
          isActive: true
        });

        return {
          ...tailor,
          currentWork,
          pendingWork,
          totalWork: currentWork + pendingWork,
          canTakeMore: currentWork < 3 // Max 3 simultaneous works
        };
      })
    );

    console.log("✅ Available tailors fetched:", {
      total,
      available,
      onLeave,
      availableList: tailorsWithWorkload.length
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total,
          available,
          onLeave,
          availabilityRate: total > 0 ? Math.round((available / total) * 100) : 0
        },
        availableTailors: tailorsWithWorkload,
        count: tailorsWithWorkload.length
      }
    });
  } catch (error) {
    console.error('❌ Available Tailors Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};




// /**
//  * 📋 5. WORK QUEUE - CHANGED TO USE DELIVERY DATE
//  */
// export const getWorkQueue = async (req, res) => {
//   try {
//     console.log("📋 ===== WORK QUEUE API CALLED =====");
    
//     const userId = req.user._id;
//     const { status, search, date, page = 1, limit = 20 } = req.query;

//     // Build query
//     let query = { 
//       cuttingMaster: userId, 
//       isActive: true 
//     };

//     // 🔴 CHANGED: Use estimatedDelivery instead of createdAt
//     if (date) {
//       const startDate = new Date(date);
//       startDate.setHours(0, 0, 0, 0);
//       const endDate = new Date(date);
//       endDate.setHours(23, 59, 59, 999);
      
//       query.estimatedDelivery = { $gte: startDate, $lte: endDate }; // 👈 Changed from createdAt
//     }

//     // Status filter
//     if (status && status !== 'all') {
//       query.status = status;
//     }

//     // Search filter
//     if (search && search.length > 0) {
//       const orders = await Order.find({
//         $or: [
//           { orderId: { $regex: search, $options: 'i' } },
//           { 'customer.name': { $regex: search, $options: 'i' } }
//         ]
//       }).select('_id');
      
//       if (orders.length > 0) {
//         query.order = { $in: orders.map(o => o._id) };
//       } else {
//         query.workId = { $regex: search, $options: 'i' };
//       }
//     }

//     console.log("🔍 Query:", JSON.stringify(query));

//     const total = await Work.countDocuments(query);

//     const works = await Work.find(query)
//       .populate({
//         path: 'order',
//         populate: { 
//           path: 'customer', 
//           select: 'name phone' 
//         }
//       })
//       .populate('garment', 'name garmentId type')
//       .populate('tailor', 'name employeeId')
//       .sort({ 
//         priority: -1,
//         estimatedDelivery: 1, // 👈 Sort by delivery date
//         createdAt: -1 
//       })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     const formattedWorks = works.map(work => ({
//       _id: work._id,
//       workId: work.workId,
//       status: work.status,
//       priority: work.priority || 'normal',
//       estimatedDelivery: work.estimatedDelivery, // 👈 This is the delivery date
//       createdAt: work.createdAt,
//       garment: work.garment ? {
//         _id: work.garment._id,
//         name: work.garment.name,
//         garmentId: work.garment.garmentId,
//         type: work.garment.type
//       } : null,
//       customer: work.order?.customer ? {
//         name: work.order.customer.name,
//         phone: work.order.customer.phone
//       } : { name: 'Unknown' },
//       order: work.order ? {
//         _id: work.order._id,
//         orderId: work.order.orderId
//       } : null,
//       tailor: work.tailor ? {
//         _id: work.tailor._id,
//         name: work.tailor.name,
//         employeeId: work.tailor.employeeId
//       } : null
//     }));

//     const counts = {
//       pending: await Work.countDocuments({ ...query, status: 'pending' }),
//       accepted: await Work.countDocuments({ ...query, status: 'accepted' }),
//       'cutting-started': await Work.countDocuments({ ...query, status: 'cutting-started' }),
//       'cutting-completed': await Work.countDocuments({ ...query, status: 'cutting-completed' }),
//       'sewing-started': await Work.countDocuments({ ...query, status: 'sewing-started' }),
//       'sewing-completed': await Work.countDocuments({ ...query, status: 'sewing-completed' }),
//       ironing: await Work.countDocuments({ ...query, status: 'ironing' }),
//       'ready-to-deliver': await Work.countDocuments({ ...query, status: 'ready-to-deliver' }),
//       total
//     };

//     console.log(`✅ Found ${formattedWorks.length} works due on ${date || 'any date'}`);

//     res.status(200).json({
//       success: true,
//       data: {
//         works: formattedWorks,
//         total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalPages: Math.ceil(total / limit),
//         counts
//       }
//     });
//   } catch (error) {
//     console.error('❌ Work Queue Error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };



/**
 * 📋 5. WORK QUEUE - FIXED to include garment priority
 */
export const getWorkQueue = async (req, res) => {
  try {
    console.log("📋 ===== WORK QUEUE API CALLED =====");
    
    const userId = req.user._id;
    const { status, search, date, page = 1, limit = 20 } = req.query;

    // Build query
    let query = { 
      cuttingMaster: userId, 
      isActive: true 
    };

    // Use estimatedDelivery for date filter
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.estimatedDelivery = { $gte: startDate, $lte: endDate };
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search filter
    if (search && search.length > 0) {
      const orders = await Order.find({
        $or: [
          { orderId: { $regex: search, $options: 'i' } },
          { 'customer.name': { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      if (orders.length > 0) {
        query.order = { $in: orders.map(o => o._id) };
      } else {
        query.workId = { $regex: search, $options: 'i' };
      }
    }

    console.log("🔍 Query:", JSON.stringify(query));

    const total = await Work.countDocuments(query);

    const works = await Work.find(query)
      .populate({
        path: 'order',
        populate: { 
          path: 'customer', 
          select: 'name phone' 
        }
      })
      // 🔴 FIXED: Added 'priority' to the garment population
      .populate('garment', 'name garmentId type priority')  // ✅ Added priority here!
      .populate('tailor', 'name employeeId')
      .sort({ 
        priority: -1,
        estimatedDelivery: 1,
        createdAt: -1 
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const formattedWorks = works.map(work => ({
      _id: work._id,
      workId: work.workId,
      status: work.status,
      priority: work.priority || 'normal',
      estimatedDelivery: work.estimatedDelivery,
      createdAt: work.createdAt,
      garment: work.garment ? {
        _id: work.garment._id,
        name: work.garment.name,
        garmentId: work.garment.garmentId,
        type: work.garment.type,
        priority: work.garment.priority  // ✅ This will now be included!
      } : null,
      customer: work.order?.customer ? {
        name: work.order.customer.name,
        phone: work.order.customer.phone
      } : { name: 'Unknown' },
      order: work.order ? {
        _id: work.order._id,
        orderId: work.order.orderId
      } : null,
      tailor: work.tailor ? {
        _id: work.tailor._id,
        name: work.tailor.name,
        employeeId: work.tailor.employeeId
      } : null
    }));

    const counts = {
      pending: await Work.countDocuments({ ...query, status: 'pending' }),
      accepted: await Work.countDocuments({ ...query, status: 'accepted' }),
      'cutting-started': await Work.countDocuments({ ...query, status: 'cutting-started' }),
      'cutting-completed': await Work.countDocuments({ ...query, status: 'cutting-completed' }),
      'sewing-started': await Work.countDocuments({ ...query, status: 'sewing-started' }),
      'sewing-completed': await Work.countDocuments({ ...query, status: 'sewing-completed' }),
      ironing: await Work.countDocuments({ ...query, status: 'ironing' }),
      'ready-to-deliver': await Work.countDocuments({ ...query, status: 'ready-to-deliver' }),
      total
    };

    console.log(`✅ Found ${formattedWorks.length} works due on ${date || 'any date'}`);

    res.status(200).json({
      success: true,
      data: {
        works: formattedWorks,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        counts
      }
    });
  } catch (error) {
    console.error('❌ Work Queue Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * 📅 6. MONTHLY SCHEDULE - ALREADY CORRECT (using estimatedDelivery)
 */
export const getMonthlySchedule = async (req, res) => {
  try {
    console.log("📅 ===== MONTHLY SCHEDULE API CALLED =====");
    
    const userId = req.user._id;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month are required"
      });
    }

    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    console.log(`📅 Fetching delivery schedule for ${year}-${month}`);

    // ✅ CORRECT: Using estimatedDelivery
    const works = await Work.find({
      cuttingMaster: userId,
      isActive: true,
      estimatedDelivery: { $gte: startDate, $lte: endDate } // 👈 Only deliveries in this month
    })
    .populate({
      path: 'order',
      populate: { path: 'customer', select: 'name' }
    })
    .populate('garment', 'name')
    .select('estimatedDelivery status workId order garment');

    console.log(`📊 Found ${works.length} works with deliveries in this month`);

    const schedule = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    works.forEach(work => {
      if (!work.estimatedDelivery) return;
      
      const deliveryDate = work.estimatedDelivery.toISOString().split('T')[0];
      
      if (!schedule[deliveryDate]) {
        schedule[deliveryDate] = {
          hasWork: false,
          hasOverdue: false,
          workCount: 0,
          completedCount: 0,
          pendingCount: 0,
          works: []
        };
      }
      
      schedule[deliveryDate].hasWork = true;
      schedule[deliveryDate].workCount++;
      
      if (work.status === 'ready-to-deliver') {
        schedule[deliveryDate].completedCount++;
      } else {
        schedule[deliveryDate].pendingCount++;
      }
      
      if (work.estimatedDelivery < today && work.status !== 'ready-to-deliver') {
        schedule[deliveryDate].hasOverdue = true;
      }
      
      schedule[deliveryDate].works.push({
        workId: work.workId,
        customerName: work.order?.customer?.name || 'Unknown',
        garmentName: work.garment?.name || 'Unknown',
        status: work.status,
        completed: work.status === 'ready-to-deliver'
      });
    });

    console.log(`✅ Schedule generated for ${Object.keys(schedule).length} days with deliveries`);

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('❌ Monthly Schedule Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// /**
//  * 📅 7. WORKS BY DATE - CHANGED TO USE DELIVERY DATE
//  */
// export const getWorksByDate = async (req, res) => {
//   try {
//     console.log("📅 ===== WORKS BY DATE API CALLED =====");
    
//     const userId = req.user._id;
//     const { date } = req.query;

//     if (!date) {
//       return res.status(400).json({
//         success: false,
//         message: "Date is required"
//       });
//     }

//     const startDate = new Date(date);
//     startDate.setHours(0, 0, 0, 0);
//     const endDate = new Date(date);
//     endDate.setHours(23, 59, 59, 999);

//     // 🔴 CHANGED: Use estimatedDelivery instead of createdAt
//     const works = await Work.find({
//       cuttingMaster: userId,
//       isActive: true,
//       estimatedDelivery: { $gte: startDate, $lte: endDate } // 👈 Changed from createdAt
//     })
//     .populate({
//       path: 'order',
//       populate: { path: 'customer', select: 'name phone' }
//     })
//     .populate('garment', 'name garmentId type')
//     .populate('tailor', 'name employeeId')
//     .sort({ createdAt: -1 });

//     const completed = works.filter(w => w.status === 'ready-to-deliver').length;
//     const pending = works.filter(w => w.status !== 'ready-to-deliver').length;
    
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const overdue = works.filter(w => 
//       w.estimatedDelivery < today && w.status !== 'ready-to-deliver'
//     ).length;

//     const formattedWorks = works.map(work => ({
//       _id: work._id,
//       workId: work.workId,
//       status: work.status,
//       priority: work.priority || 'normal',
//       estimatedDelivery: work.estimatedDelivery,
//       garment: work.garment ? {
//         name: work.garment.name,
//         garmentId: work.garment.garmentId
//       } : { name: 'Unknown' },
//       customer: work.order?.customer ? {
//         name: work.order.customer.name,
//         phone: work.order.customer.phone
//       } : { name: 'Unknown' },
//       tailor: work.tailor ? {
//         name: work.tailor.name
//       } : null,
//       isOverdue: work.estimatedDelivery < today && work.status !== 'ready-to-deliver',
//       isCompleted: work.status === 'ready-to-deliver'
//     }));

//     console.log(`✅ Found ${works.length} deliveries on ${date}`);

//     res.status(200).json({
//       success: true,
//       data: {
//         date,
//         total: works.length,
//         completed,
//         pending,
//         overdue,
//         works: formattedWorks
//       }
//     });
//   } catch (error) {
//     console.error('❌ Works By Date Error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

/**
 * 📅 7. WORKS BY DATE - FIXED to include garment priority
 */
export const getWorksByDate = async (req, res) => {
  try {
    console.log("📅 ===== WORKS BY DATE API CALLED =====");
    
    const userId = req.user._id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required"
      });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const works = await Work.find({
      cuttingMaster: userId,
      isActive: true,
      estimatedDelivery: { $gte: startDate, $lte: endDate }
    })
    .populate({
      path: 'order',
      populate: { path: 'customer', select: 'name phone' }
    })
    // 🔴 FIXED: Added 'priority' to the garment population
    .populate('garment', 'name garmentId type priority')  // ✅ Added priority here!
    .populate('tailor', 'name employeeId')
    .sort({ createdAt: -1 });

    const completed = works.filter(w => w.status === 'ready-to-deliver').length;
    const pending = works.filter(w => w.status !== 'ready-to-deliver').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = works.filter(w => 
      w.estimatedDelivery < today && w.status !== 'ready-to-deliver'
    ).length;

    const formattedWorks = works.map(work => ({
      _id: work._id,
      workId: work.workId,
      status: work.status,
      priority: work.priority || 'normal',
      estimatedDelivery: work.estimatedDelivery,
      garment: work.garment ? {
        name: work.garment.name,
        garmentId: work.garment.garmentId,
        priority: work.garment.priority  // ✅ This will now be included!
      } : { name: 'Unknown' },
      customer: work.order?.customer ? {
        name: work.order.customer.name,
        phone: work.order.customer.phone
      } : { name: 'Unknown' },
      tailor: work.tailor ? {
        name: work.tailor.name
      } : null,
      isOverdue: work.estimatedDelivery < today && work.status !== 'ready-to-deliver',
      isCompleted: work.status === 'ready-to-deliver'
    }));

    console.log(`✅ Found ${works.length} deliveries on ${date}`);

    res.status(200).json({
      success: true,
      data: {
        date,
        total: works.length,
        completed,
        pending,
        overdue,
        works: formattedWorks
      }
    });
  } catch (error) {
    console.error('❌ Works By Date Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * 📊 8. TODAY'S SUMMARY - ALREADY CORRECT (using estimatedDelivery)
 */
export const getTodaySummary = async (req, res) => {
  try {
    console.log("📊 ===== TODAY SUMMARY API CALLED =====");
    
    const userId = req.user._id;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // ✅ CORRECT: Using estimatedDelivery for due today
    const dueToday = await Work.countDocuments({
      cuttingMaster: userId,
      isActive: true,
      estimatedDelivery: { $gte: today, $lt: tomorrow }, // 👈 Works due today
      status: { $ne: 'ready-to-deliver' }
    });

    const highPriority = await Work.countDocuments({
      cuttingMaster: userId,
      isActive: true,
      priority: 'high',
      status: { $ne: 'ready-to-deliver' }
    });

    const completedToday = await Work.countDocuments({
      cuttingMaster: userId,
      isActive: true,
      status: 'ready-to-deliver',
      updatedAt: { $gte: today, $lt: tomorrow }
    });

    console.log("✅ Today's summary:", { dueToday, highPriority, completedToday });

    res.status(200).json({
      success: true,
      data: {
        dueToday,
        highPriority,
        completedToday
      }
    });
  } catch (error) {
    console.error('❌ Today Summary Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// /**
//  * 📋 5. WORK QUEUE
//  * GET /api/cutting-masters/dashboard/work-queue
//  */
// export const getWorkQueue = async (req, res) => {
//   try {
//     console.log("📋 ===== WORK QUEUE API CALLED =====");
    
//     const userId = req.user._id;
//     const { status, search, date, page = 1, limit = 20 } = req.query;

//     // Build query
//     let query = { 
//       cuttingMaster: userId, 
//       isActive: true 
//     };

//     // Date filter
//     if (date) {
//       const startDate = new Date(date);
//       startDate.setHours(0, 0, 0, 0);
//       const endDate = new Date(date);
//       endDate.setHours(23, 59, 59, 999);
      
//       query.createdAt = { $gte: startDate, $lte: endDate };
//     }

//     // Status filter
//     if (status && status !== 'all') {
//       query.status = status;
//     }

//     // Search filter
//     if (search && search.length > 0) {
//       // Find orders matching search
//       const orders = await Order.find({
//         $or: [
//           { orderId: { $regex: search, $options: 'i' } },
//           { 'customer.name': { $regex: search, $options: 'i' } }
//         ]
//       }).select('_id');
      
//       if (orders.length > 0) {
//         query.order = { $in: orders.map(o => o._id) };
//       } else {
//         // If no orders found, try searching by workId
//         query.workId = { $regex: search, $options: 'i' };
//       }
//     }

//     console.log("🔍 Query:", JSON.stringify(query));

//     // Get total count for pagination
//     const total = await Work.countDocuments(query);

//     // Get works with pagination
//     const works = await Work.find(query)
//       .populate({
//         path: 'order',
//         populate: { 
//           path: 'customer', 
//           select: 'name phone' 
//         }
//       })
//       .populate('garment', 'name garmentId type')
//       .populate('tailor', 'name employeeId')
//       .sort({ 
//         priority: -1, // High priority first
//         estimatedDelivery: 1, // Sooner delivery first
//         createdAt: -1 
//       })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     // Format works for frontend
//     const formattedWorks = works.map(work => ({
//       _id: work._id,
//       workId: work.workId,
//       status: work.status,
//       priority: work.priority || 'normal',
//       estimatedDelivery: work.estimatedDelivery,
//       createdAt: work.createdAt,
//       garment: work.garment ? {
//         _id: work.garment._id,
//         name: work.garment.name,
//         garmentId: work.garment.garmentId,
//         type: work.garment.type
//       } : null,
//       customer: work.order?.customer ? {
//         name: work.order.customer.name,
//         phone: work.order.customer.phone
//       } : { name: 'Unknown' },
//       order: work.order ? {
//         _id: work.order._id,
//         orderId: work.order.orderId
//       } : null,
//       tailor: work.tailor ? {
//         _id: work.tailor._id,
//         name: work.tailor.name,
//         employeeId: work.tailor.employeeId
//       } : null
//     }));

//     // Calculate counts by status
//     const counts = {
//       pending: await Work.countDocuments({ ...query, status: 'pending' }),
//       accepted: await Work.countDocuments({ ...query, status: 'accepted' }),
//       'cutting-started': await Work.countDocuments({ ...query, status: 'cutting-started' }),
//       'cutting-completed': await Work.countDocuments({ ...query, status: 'cutting-completed' }),
//       'sewing-started': await Work.countDocuments({ ...query, status: 'sewing-started' }),
//       'sewing-completed': await Work.countDocuments({ ...query, status: 'sewing-completed' }),
//       ironing: await Work.countDocuments({ ...query, status: 'ironing' }),
//       'ready-to-deliver': await Work.countDocuments({ ...query, status: 'ready-to-deliver' }),
//       total
//     };

//     console.log(`✅ Found ${formattedWorks.length} works in queue`);

//     res.status(200).json({
//       success: true,
//       data: {
//         works: formattedWorks,
//         total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalPages: Math.ceil(total / limit),
//         counts
//       }
//     });
//   } catch (error) {
//     console.error('❌ Work Queue Error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // /**
// //  * 📅 6. MONTHLY SCHEDULE (For Calendar)
// //  * GET /api/cutting-masters/dashboard/schedule
// //  */
// // export const getMonthlySchedule = async (req, res) => {
// //   try {
// //     console.log("📅 ===== MONTHLY SCHEDULE API CALLED =====");
    
// //     const userId = req.user._id;
// //     const { year, month } = req.query;

// //     if (!year || !month) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Year and month are required"
// //       });
// //     }

// //     // Create date range for the month
// //     const startDate = new Date(year, month - 1, 1);
// //     const endDate = new Date(year, month, 0, 23, 59, 59, 999);

// //     console.log(`📅 Fetching schedule for ${year}-${month}`);

// //     // Get all works for this month
// //     const works = await Work.find({
// //       cuttingMaster: userId,
// //       isActive: true,
// //       $or: [
// //         { createdAt: { $gte: startDate, $lte: endDate } },
// //         { estimatedDelivery: { $gte: startDate, $lte: endDate } }
// //       ]
// //     }).select('createdAt estimatedDelivery status');

// //     // Group by date
// //     const schedule = {};
    
// //     works.forEach(work => {
// //       // Add to created date
// //       if (work.createdAt) {
// //         const createdDate = work.createdAt.toISOString().split('T')[0];
// //         if (!schedule[createdDate]) {
// //           schedule[createdDate] = { hasWork: false, hasOverdue: false, workCount: 0 };
// //         }
// //         schedule[createdDate].hasWork = true;
// //         schedule[createdDate].workCount++;
// //       }

// //       // Check for overdue on estimated delivery
// //       if (work.estimatedDelivery && work.status !== 'ready-to-deliver') {
// //         const deliveryDate = work.estimatedDelivery.toISOString().split('T')[0];
// //         if (work.estimatedDelivery < new Date()) {
// //           if (!schedule[deliveryDate]) {
// //             schedule[deliveryDate] = { hasWork: false, hasOverdue: false, workCount: 0 };
// //           }
// //           schedule[deliveryDate].hasOverdue = true;
// //         }
// //       }
// //     });

// //     console.log(`✅ Schedule generated for ${Object.keys(schedule).length} days`);

// //     res.status(200).json({
// //       success: true,
// //       data: schedule
// //     });
// //   } catch (error) {
// //     console.error('❌ Monthly Schedule Error:', error);
// //     res.status(500).json({ 
// //       success: false, 
// //       message: error.message 
// //     });
// //   }
// // };

// // /**
// //  * 📅 7. WORKS BY DATE
// //  * GET /api/cutting-masters/dashboard/works-by-date
// //  */
// // export const getWorksByDate = async (req, res) => {
// //   try {
// //     console.log("📅 ===== WORKS BY DATE API CALLED =====");
    
// //     const userId = req.user._id;
// //     const { date } = req.query;

// //     if (!date) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Date is required"
// //       });
// //     }

// //     // Create date range
// //     const startDate = new Date(date);
// //     startDate.setHours(0, 0, 0, 0);
// //     const endDate = new Date(date);
// //     endDate.setHours(23, 59, 59, 999);

// //     // Get works for this date
// //     const works = await Work.find({
// //       cuttingMaster: userId,
// //       isActive: true,
// //       createdAt: { $gte: startDate, $lte: endDate }
// //     });

// //     const completed = works.filter(w => w.status === 'ready-to-deliver').length;
// //     const pending = works.filter(w => w.status !== 'ready-to-deliver').length;

// //     res.status(200).json({
// //       success: true,
// //       data: {
// //         total: works.length,
// //         completed,
// //         pending,
// //         works: works.map(w => ({
// //           _id: w._id,
// //           workId: w.workId,
// //           status: w.status
// //         }))
// //       }
// //     });
// //   } catch (error) {
// //     console.error('❌ Works By Date Error:', error);
// //     res.status(500).json({ 
// //       success: false, 
// //       message: error.message 
// //     });
// //   }
// // };
// /**
//  * 📅 6. MONTHLY SCHEDULE (For Calendar) - UPDATED with delivery dates
//  * GET /api/cutting-masters/dashboard/schedule
//  */
// export const getMonthlySchedule = async (req, res) => {
//   try {
//     console.log("📅 ===== MONTHLY SCHEDULE API CALLED =====");
    
//     const userId = req.user._id;
//     const { year, month } = req.query;

//     if (!year || !month) {
//       return res.status(400).json({
//         success: false,
//         message: "Year and month are required"
//       });
//     }

//     // Create date range for the month
//     const startDate = new Date(year, month - 1, 1);
//     startDate.setHours(0, 0, 0, 0);
    
//     const endDate = new Date(year, month, 0, 23, 59, 59, 999);

//     console.log(`📅 Fetching delivery schedule for ${year}-${month}`);

//     // Get all works for this cutting master with delivery dates in this month
//     const works = await Work.find({
//       cuttingMaster: userId,
//       isActive: true,
//       estimatedDelivery: { $gte: startDate, $lte: endDate } // Only deliveries in this month
//     })
//     .populate({
//       path: 'order',
//       populate: { path: 'customer', select: 'name' }
//     })
//     .populate('garment', 'name')
//     .select('estimatedDelivery status workId order garment');

//     console.log(`📊 Found ${works.length} works with deliveries in this month`);

//     // Group by delivery date
//     const schedule = {};
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     works.forEach(work => {
//       if (!work.estimatedDelivery) return;
      
//       const deliveryDate = work.estimatedDelivery.toISOString().split('T')[0];
      
//       if (!schedule[deliveryDate]) {
//         schedule[deliveryDate] = {
//           hasWork: false,
//           hasOverdue: false,
//           workCount: 0,
//           completedCount: 0,
//           pendingCount: 0,
//           works: [] // Optional: store work details for tooltips
//         };
//       }
      
//       // Update counts
//       schedule[deliveryDate].hasWork = true;
//       schedule[deliveryDate].workCount++;
      
//       // Check if completed
//       if (work.status === 'ready-to-deliver') {
//         schedule[deliveryDate].completedCount++;
//       } else {
//         schedule[deliveryDate].pendingCount++;
//       }
      
//       // Check if overdue (delivery date passed and not completed)
//       if (work.estimatedDelivery < today && work.status !== 'ready-to-deliver') {
//         schedule[deliveryDate].hasOverdue = true;
//       }
      
//       // Optional: Store work details for tooltips
//       schedule[deliveryDate].works.push({
//         workId: work.workId,
//         customerName: work.order?.customer?.name || 'Unknown',
//         garmentName: work.garment?.name || 'Unknown',
//         status: work.status,
//         completed: work.status === 'ready-to-deliver'
//       });
//     });

//     console.log(`✅ Schedule generated for ${Object.keys(schedule).length} days with deliveries`);

//     res.status(200).json({
//       success: true,
//       data: schedule
//     });
//   } catch (error) {
//     console.error('❌ Monthly Schedule Error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// /**
//  * 📅 7. WORKS BY DATE - UPDATED to show delivery date details
//  * GET /api/cutting-masters/dashboard/works-by-date
//  */
// export const getWorksByDate = async (req, res) => {
//   try {
//     console.log("📅 ===== WORKS BY DATE API CALLED =====");
    
//     const userId = req.user._id;
//     const { date } = req.query;

//     if (!date) {
//       return res.status(400).json({
//         success: false,
//         message: "Date is required"
//       });
//     }

//     // Create date range for the selected date
//     const startDate = new Date(date);
//     startDate.setHours(0, 0, 0, 0);
//     const endDate = new Date(date);
//     endDate.setHours(23, 59, 59, 999);

//     // Get works with delivery on this date
//     const works = await Work.find({
//       cuttingMaster: userId,
//       isActive: true,
//       estimatedDelivery: { $gte: startDate, $lte: endDate } // Deliveries on this date
//     })
//     .populate({
//       path: 'order',
//       populate: { path: 'customer', select: 'name phone' }
//     })
//     .populate('garment', 'name garmentId type')
//     .populate('tailor', 'name employeeId')
//     .sort({ createdAt: -1 });

//     // Calculate counts
//     const completed = works.filter(w => w.status === 'ready-to-deliver').length;
//     const pending = works.filter(w => w.status !== 'ready-to-deliver').length;
    
//     // Check if any are overdue
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const overdue = works.filter(w => 
//       w.estimatedDelivery < today && w.status !== 'ready-to-deliver'
//     ).length;

//     // Format works for display
//     const formattedWorks = works.map(work => ({
//       _id: work._id,
//       workId: work.workId,
//       status: work.status,
//       priority: work.priority || 'normal',
//       estimatedDelivery: work.estimatedDelivery,
//       garment: work.garment ? {
//         name: work.garment.name,
//         garmentId: work.garment.garmentId
//       } : { name: 'Unknown' },
//       customer: work.order?.customer ? {
//         name: work.order.customer.name,
//         phone: work.order.customer.phone
//       } : { name: 'Unknown' },
//       tailor: work.tailor ? {
//         name: work.tailor.name
//       } : null,
//       isOverdue: work.estimatedDelivery < today && work.status !== 'ready-to-deliver',
//       isCompleted: work.status === 'ready-to-deliver'
//     }));

//     console.log(`✅ Found ${works.length} deliveries on ${date}`);

//     res.status(200).json({
//       success: true,
//       data: {
//         date,
//         total: works.length,
//         completed,
//         pending,
//         overdue,
//         works: formattedWorks
//       }
//     });
//   } catch (error) {
//     console.error('❌ Works By Date Error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// /**
//  * 📊 8. TODAY'S SUMMARY
//  * GET /api/cutting-masters/dashboard/today-summary
//  */
// export const getTodaySummary = async (req, res) => {
//   try {
//     console.log("📊 ===== TODAY SUMMARY API CALLED =====");
    
//     const userId = req.user._id;
    
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // Get works due today
//     const dueToday = await Work.countDocuments({
//       cuttingMaster: userId,
//       isActive: true,
//       estimatedDelivery: { $gte: today, $lt: tomorrow },
//       status: { $ne: 'ready-to-deliver' }
//     });

//     // Get high priority works
//     const highPriority = await Work.countDocuments({
//       cuttingMaster: userId,
//       isActive: true,
//       priority: 'high',
//       status: { $ne: 'ready-to-deliver' }
//     });

//     // Get completed today
//     const completedToday = await Work.countDocuments({
//       cuttingMaster: userId,
//       isActive: true,
//       status: 'ready-to-deliver',
//       updatedAt: { $gte: today, $lt: tomorrow }
//     });

//     console.log("✅ Today's summary:", { dueToday, highPriority, completedToday });

//     res.status(200).json({
//       success: true,
//       data: {
//         dueToday,
//         highPriority,
//         completedToday
//       }
//     });
//   } catch (error) {
//     console.error('❌ Today Summary Error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// /**
//  * 🔴 9. HIGH PRIORITY WORKS
//  * GET /api/cutting-masters/dashboard/high-priority
//  */
// export const getHighPriorityWorks = async (req, res) => {
//   try {
//     console.log("🔴 ===== HIGH PRIORITY WORKS API CALLED =====");
    
//     const userId = req.user._id;

//     const highPriorityWorks = await Work.find({
//       cuttingMaster: userId,
//       isActive: true,
//       priority: 'high',
//       status: { $ne: 'ready-to-deliver' }
//     })
//     .populate({
//       path: 'order',
//       populate: { path: 'customer', select: 'name phone' }
//     })
//     .populate('garment', 'name garmentId')
//     .populate('tailor', 'name')
//     .sort({ estimatedDelivery: 1 })
//     .limit(20);

//     const formattedWorks = highPriorityWorks.map(work => ({
//       _id: work._id,
//       workId: work.workId,
//       status: work.status,
//       priority: work.priority,
//       estimatedDelivery: work.estimatedDelivery,
//       garment: work.garment ? {
//         name: work.garment.name,
//         garmentId: work.garment.garmentId
//       } : { name: 'Unknown' },
//       customer: work.order?.customer ? {
//         name: work.order.customer.name,
//         phone: work.order.customer.phone
//       } : { name: 'Unknown' },
//       tailor: work.tailor ? {
//         name: work.tailor.name
//       } : null
//     }));

//     console.log(`✅ Found ${formattedWorks.length} high priority works`);

//     res.status(200).json({
//       success: true,
//       data: {
//         works: formattedWorks,
//         count: formattedWorks.length
//       }
//     });
//   } catch (error) {
//     console.error('❌ High Priority Error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

/**
 * 🔴 9. HIGH PRIORITY WORKS - FIXED to use garment priority
 */
export const getHighPriorityWorks = async (req, res) => {
  try {
    console.log("🔴 ===== HIGH PRIORITY WORKS API CALLED =====");
    
    const userId = req.user._id;

    // 🔴 FIXED: Now checking garment.priority instead of work.priority
    const highPriorityWorks = await Work.find({
      cuttingMaster: userId,
      isActive: true,
      status: { $ne: 'ready-to-deliver' }
    })
    .populate({
      path: 'order',
      populate: { path: 'customer', select: 'name phone' }
    })
    // ✅ Need garment priority to filter properly
    .populate('garment', 'name garmentId priority')
    .populate('tailor', 'name')
    .sort({ estimatedDelivery: 1 })
    .limit(20);

    // Filter by garment priority in memory (since MongoDB can't filter by populated field easily)
    const filteredWorks = highPriorityWorks.filter(work => 
      work.garment?.priority === 'high'
    );

    const formattedWorks = filteredWorks.map(work => ({
      _id: work._id,
      workId: work.workId,
      status: work.status,
      priority: work.garment?.priority || 'normal',  // ✅ Use garment priority
      estimatedDelivery: work.estimatedDelivery,
      garment: work.garment ? {
        name: work.garment.name,
        garmentId: work.garment.garmentId,
        priority: work.garment.priority
      } : { name: 'Unknown' },
      customer: work.order?.customer ? {
        name: work.order.customer.name,
        phone: work.order.customer.phone
      } : { name: 'Unknown' },
      tailor: work.tailor ? {
        name: work.tailor.name
      } : null
    }));

    console.log(`✅ Found ${formattedWorks.length} high priority works`);

    res.status(200).json({
      success: true,
      data: {
        works: formattedWorks,
        count: formattedWorks.length
      }
    });
  } catch (error) {
    console.error('❌ High Priority Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};



/**
 * ⚠️ 10. OVERDUE WORKS - ALREADY CORRECT (using estimatedDelivery)
 */
export const getOverdueWorks = async (req, res) => {
  try {
    console.log("⚠️ ===== OVERDUE WORKS API CALLED =====");
    
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ CORRECT: Using estimatedDelivery < today
    const overdueWorks = await Work.find({
      cuttingMaster: userId,
      isActive: true,
      estimatedDelivery: { $lt: today }, // 👈 Delivery date passed
      status: { $ne: 'ready-to-deliver' } // 👈 Not delivered yet
    })
    .populate({
      path: 'order',
      populate: { path: 'customer', select: 'name phone' }
    })
    .populate('garment', 'name garmentId')
    .populate('tailor', 'name')
    .sort({ estimatedDelivery: 1 });

    // Calculate overdue days
    const formattedWorks = overdueWorks.map(work => {
      const deliveryDate = new Date(work.estimatedDelivery);
      const diffTime = Math.abs(today - deliveryDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        _id: work._id,
        workId: work.workId,
        status: work.status,
        priority: work.priority || 'normal',
        estimatedDelivery: work.estimatedDelivery,
        overdueBy: diffDays,
        garment: work.garment ? {
          name: work.garment.name,
          garmentId: work.garment.garmentId
        } : { name: 'Unknown' },
        customer: work.order?.customer ? {
          name: work.order.customer.name,
          phone: work.order.customer.phone
        } : { name: 'Unknown' },
        tailor: work.tailor ? {
          name: work.tailor.name
        } : null
      };
    });

    console.log(`✅ Found ${formattedWorks.length} overdue works`);

    res.status(200).json({
      success: true,
      data: {
        works: formattedWorks,
        count: formattedWorks.length
      }
    });
  } catch (error) {
    console.error('❌ Overdue Works Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// /**
//  * ⚠️ 10. OVERDUE WORKS
//  * GET /api/cutting-masters/dashboard/overdue-works
//  */
// export const getOverdueWorks = async (req, res) => {
//   try {
//     console.log("⚠️ ===== OVERDUE WORKS API CALLED =====");
    
//     const userId = req.user._id;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const overdueWorks = await Work.find({
//       cuttingMaster: userId,
//       isActive: true,
//       estimatedDelivery: { $lt: today },
//       status: { $ne: 'ready-to-deliver' }
//     })
//     .populate({
//       path: 'order',
//       populate: { path: 'customer', select: 'name phone' }
//     })
//     .populate('garment', 'name garmentId')
//     .populate('tailor', 'name')
//     .sort({ estimatedDelivery: 1 });

//     // Calculate overdue days
//     const formattedWorks = overdueWorks.map(work => {
//       const deliveryDate = new Date(work.estimatedDelivery);
//       const diffTime = Math.abs(today - deliveryDate);
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//       return {
//         _id: work._id,
//         workId: work.workId,
//         status: work.status,
//         priority: work.priority || 'normal',
//         estimatedDelivery: work.estimatedDelivery,
//         overdueBy: diffDays,
//         garment: work.garment ? {
//           name: work.garment.name,
//           garmentId: work.garment.garmentId
//         } : { name: 'Unknown' },
//         customer: work.order?.customer ? {
//           name: work.order.customer.name,
//           phone: work.order.customer.phone
//         } : { name: 'Unknown' },
//         tailor: work.tailor ? {
//           name: work.tailor.name
//         } : null
//       };
//     });

//     console.log(`✅ Found ${formattedWorks.length} overdue works`);

//     res.status(200).json({
//       success: true,
//       data: {
//         works: formattedWorks,
//         count: formattedWorks.length
//       }
//     });
//   } catch (error) {
//     console.error('❌ Overdue Works Error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

/**
 * ✅ 11. UPDATE WORK STATUS
 * PUT /api/cutting-masters/dashboard/update-status/:workId
 */
export const updateWorkStatus = async (req, res) => {
  try {
    console.log("✅ ===== UPDATE WORK STATUS API CALLED =====");
    
    const { workId } = req.params;
    const { status, notes } = req.body;
    const cuttingMasterId = req.user._id;

    // Valid status transitions for cutting master
    const validStatuses = ['accepted', 'cutting-started', 'cutting-completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status transition'
      });
    }

    const work = await Work.findOne({ 
      _id: workId, 
      cuttingMaster: cuttingMasterId,
      isActive: true 
    });

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    // Update status with timestamps
    work.status = status;
    
    // Set appropriate timestamp
    if (status === 'accepted' && !work.acceptedAt) {
      work.acceptedAt = new Date();
    } else if (status === 'cutting-started' && !work.cuttingStartedAt) {
      work.cuttingStartedAt = new Date();
    } else if (status === 'cutting-completed' && !work.cuttingCompletedAt) {
      work.cuttingCompletedAt = new Date();
    }

    // Add notes if provided
    if (notes) {
      work.cuttingNotes = notes;
    }

    await work.save();

    console.log(`✅ Work ${workId} status updated to ${status}`);

    res.json({
      success: true,
      message: 'Work status updated successfully',
      data: work
    });
  } catch (error) {
    console.error('❌ Update Status Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * 🚀 12. COMPLETE DASHBOARD SUMMARY
 * GET /api/cutting-masters/dashboard/summary
 */
export const getDashboardSummary = async (req, res) => {
  try {
    console.log("🚀 ===== COMPLETE DASHBOARD SUMMARY API CALLED =====");
    
    const userId = req.user._id;

    // Fetch all dashboard data in parallel
    const [
      stats,
      statusBreakdown,
      tailorPerformance,
      availableTailors,
      workQueue,
      todaySummary,
      highPriority,
      overdueWorks
    ] = await Promise.all([
      // Stats
      (async () => {
        const works = await Work.find({ cuttingMaster: userId, isActive: true });
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return {
          totalWork: works.length,
          completedWork: works.filter(w => w.status === 'ready-to-deliver').length,
          inProgressWork: works.filter(w => 
            ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(w.status)
          ).length,
          overdueWork: works.filter(w => 
            w.estimatedDelivery && 
            new Date(w.estimatedDelivery) < today && 
            w.status !== 'ready-to-deliver'
          ).length
        };
      })(),

      // Status Breakdown
      (async () => {
        const statuses = ['pending', 'accepted', 'cutting-started', 'cutting-completed', 
                         'sewing-started', 'sewing-completed', 'ironing', 'ready-to-deliver'];
        
        const breakdown = await Promise.all(
          statuses.map(async (status) => {
            const count = await Work.countDocuments({ cuttingMaster: userId, status, isActive: true });
            return {
              name: status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              value: count,
              status
            };
          })
        );

        return breakdown.filter(item => item.value > 0);
      })(),

      // Tailor Performance (✅ Work SSOT)
      (async () => {
        const tailors = await Tailor.find({ isActive: true }).select('name employeeId').lean();
        
        // Single query for all works with assignments
        const allWorks = await Work.find({ 
          isActive: true, 
          "assignments.workerId": { $ne: null } 
        }).select('assignments').lean();
        
        // Build stats map from assignments
        const statsMap = {};
        allWorks.forEach(work => {
          (work.assignments || []).forEach(asgn => {
            if (!asgn.workerId) return;
            const tId = asgn.workerId.toString();
            if (!statsMap[tId]) statsMap[tId] = { assigned: 0, completed: 0, inProgress: 0 };
            statsMap[tId].assigned++;
            if (asgn.status === 'completed') statsMap[tId].completed++;
            else if (asgn.status === 'active') statsMap[tId].inProgress++;
          });
        });
        
        const performance = tailors.map(tailor => {
          const stats = statsMap[tailor._id.toString()] || { assigned: 0, completed: 0, inProgress: 0 };
          return {
            _id: tailor._id,
            name: tailor.name,
            employeeId: tailor.employeeId,
            assigned: stats.assigned,
            completed: stats.completed,
            inProgress: stats.inProgress,
            pending: stats.assigned - stats.completed - stats.inProgress,
            efficiency: stats.assigned > 0 ? Math.round((stats.completed / stats.assigned) * 100) : 0
          };
        });

        return {
          tailors: performance.sort((a, b) => b.completed - a.completed),
          count: performance.length
        };
      })(),

      // Available Tailors
      (async () => {
        const total = await Tailor.countDocuments({ isActive: true });
        const available = await Tailor.countDocuments({
          isActive: true,
          isAvailable: true,
          $or: [{ leaveStatus: 'present' }, { leaveStatus: { $exists: false } }]
        });

        return {
          summary: { total, available, onLeave: total - available },
          count: available
        };
      })(),

      // Work Queue (first 10)
      (async () => {
        const works = await Work.find({ 
          cuttingMaster: userId, 
          isActive: true,
          status: { $in: ['pending', 'accepted', 'cutting-started'] }
        })
        .populate({
          path: 'order',
          populate: { path: 'customer', select: 'name' }
        })
        .populate('garment', 'name')
        .sort({ priority: -1, estimatedDelivery: 1 })
        .limit(10);

        return {
          works: works.map(w => ({
            _id: w._id,
            workId: w.workId,
            customer: w.order?.customer?.name || 'Unknown',
            dress: w.garment?.name || 'Unknown',
            status: w.status,
            priority: w.priority || 'normal',
            estimatedDelivery: w.estimatedDelivery
          })),
          count: works.length
        };
      })(),

      // Today Summary
      (async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [dueToday, highPriority, completedToday] = await Promise.all([
          Work.countDocuments({
            cuttingMaster: userId,
            estimatedDelivery: { $gte: today, $lt: tomorrow },
            status: { $ne: 'ready-to-deliver' }
          }),
          Work.countDocuments({
            cuttingMaster: userId,
            priority: 'high',
            status: { $ne: 'ready-to-deliver' }
          }),
          Work.countDocuments({
            cuttingMaster: userId,
            status: 'ready-to-deliver',
            updatedAt: { $gte: today, $lt: tomorrow }
          })
        ]);

        return { dueToday, highPriority, completedToday };
      })(),

      // High Priority
      (async () => {
        const works = await Work.find({
          cuttingMaster: userId,
          priority: 'high',
          status: { $ne: 'ready-to-deliver' }
        })
        .populate({
          path: 'order',
          populate: { path: 'customer', select: 'name' }
        })
        .populate('garment', 'name')
        .sort({ estimatedDelivery: 1 })
        .limit(10);

        return {
          works: works.map(w => ({
            _id: w._id,
            workId: w.workId,
            customer: w.order?.customer?.name || 'Unknown',
            dress: w.garment?.name || 'Unknown',
            estimatedDelivery: w.estimatedDelivery
          })),
          count: works.length
        };
      })(),

      // Overdue Works
      (async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const works = await Work.find({
          cuttingMaster: userId,
          estimatedDelivery: { $lt: today },
          status: { $ne: 'ready-to-deliver' }
        })
        .populate({
          path: 'order',
          populate: { path: 'customer', select: 'name' }
        })
        .populate('garment', 'name')
        .sort({ estimatedDelivery: 1 })
        .limit(10);

        return {
          works: works.map(w => ({
            _id: w._id,
            workId: w.workId,
            customer: w.order?.customer?.name || 'Unknown',
            dress: w.garment?.name || 'Unknown',
            estimatedDelivery: w.estimatedDelivery,
            overdueBy: Math.ceil(Math.abs(new Date() - new Date(w.estimatedDelivery)) / (1000 * 60 * 60 * 24))
          })),
          count: works.length
        };
      })()
    ]);

    console.log("🚀 Complete dashboard summary generated");

    res.json({
      success: true,
      data: {
        stats,
        statusBreakdown,
        tailorPerformance,
        availableTailors,
        workQueue,
        todaySummary,
        highPriority,
        overdueWorks
      }
    });
  } catch (error) {
    console.error('❌ Dashboard Summary Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 🛠️ HELPER FUNCTIONS
// ============================================

const handleError = (error, res) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map(e => e.message);
    return res.status(400).json({ message: "Validation failed", errors });
  }
  res.status(500).json({ message: error.message });
};