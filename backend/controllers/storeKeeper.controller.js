// backend/controllers/storeKeeper.controller.js
import StoreKeeper from "../models/StoreKeeper.js";
import Order from "../models/Order.js";
import bcrypt from "bcryptjs";

// ===== CREATE STORE KEEPER (Admin only) =====
export const createStoreKeeper = async (req, res) => {
  try {
    console.log("📝 Creating store keeper with data:", req.body);
    
    const { name, phone, email, password, address, department, experience, basicSalary } = req.body;

    // Validate required fields
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!phone) return res.status(400).json({ message: "Phone number is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    // Check duplicates
    const existingPhone = await StoreKeeper.findOne({ phone });
    if (existingPhone) return res.status(400).json({ message: "Phone number already exists" });

    const existingEmail = await StoreKeeper.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });

    // Create store keeper
    const storeKeeper = await StoreKeeper.create({
      name,
      phone,
      email,
      password,
      address: address || {},
      department: department || "both",
      experience: experience || 0,
      basicSalary: basicSalary || 0,
      createdBy: req.user?._id,
      joiningDate: new Date()
    });

    console.log("✅ Store Keeper created with ID:", storeKeeper.storeKeeperId);

    // Don't send password back
    const response = storeKeeper.toObject();
    delete response.password;

    res.status(201).json({
      message: "Store Keeper created successfully",
      storeKeeper: response
    });
  } catch (error) {
    console.error("❌ Create error:", error);
    handleError(error, res);
  }
};

// ===== GET ALL STORE KEEPERS (Admin only) =====
// export const getAllStoreKeepers = async (req, res) => {
//   try {
//     const { search, department } = req.query;
//     let query = { isActive: true };

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { storeKeeperId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (department && department !== 'all') {
//       query.department = department;
//     }

//     const storeKeepers = await StoreKeeper.find(query)
//       .populate('createdBy', 'name')
//       .select('-password')
//       .sort({ createdAt: -1 });

//     // Get order statistics for each store keeper
//     for (let sk of storeKeepers) {
//       const orderStats = await Order.aggregate([
//         { $match: { createdBy: sk._id, isActive: true } },
//         { $group: {
//           _id: null,
//           total: { $sum: 1 },
//           completed: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
//           pending: { $sum: { $cond: [{ $in: ["$status", ["draft", "confirmed"]] }, 1, 0] } },
//           inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } }
//         }}
//       ]);

//       sk.stats = orderStats[0] || { total: 0, completed: 0, pending: 0, inProgress: 0 };
//     }

//     res.json(storeKeepers);
//   } catch (error) {
//     console.error("❌ Get all error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };


export const getAllStoreKeepers = async (req, res) => {
  try {
    const { search, department } = req.query;
    let matchQuery = { isActive: true };

    // 1. Filter Logic
    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { storeKeeperId: { $regex: search, $options: 'i' } }
      ];
    }

    if (department && department !== 'all') {
      matchQuery.department = department;
    }

    // 🚀 HIGH PERFORMANCE AGGREGATION
    const storeKeepers = await StoreKeeper.aggregate([
      { $match: matchQuery },
      { $sort: { createdAt: -1 } },

      // 🔥 Step 1: Join with Orders (Orey nerathula stats edukka)
      {
        $lookup: {
          from: "orders", // Order collection name check pannunga (usually 'orders')
          localField: "_id",
          foreignField: "createdBy",
          as: "orderData"
        }
      },

      // 📊 Step 2: Backend-laye counts calculate panrom
      {
        $addFields: {
          stats: {
            total: { 
              $size: { $filter: { input: "$orderData", as: "o", cond: { $eq: ["$$o.isActive", true] } } } 
            },
            completed: { 
              $size: { $filter: { input: "$orderData", as: "o", cond: { $eq: ["$$o.status", "delivered"] } } } 
            },
            pending: { 
              $size: { $filter: { input: "$orderData", as: "o", cond: { $in: ["$$o.status", ["draft", "confirmed"]] } } } 
            },
            inProgress: { 
              $size: { $filter: { input: "$orderData", as: "o", cond: { $eq: ["$$o.status", "in-progress"] } } } 
            }
          }
        }
      },

      // 🧹 Step 3: unwanted weight items-ah remove panrom (Password and huge orders array)
      {
        $project: {
          password: 0,
          orderData: 0
        }
      }
    ]);

    // Optional: createdBy-ah frontend-ku thevana populate manual-ah pannanum aggregate-la
    // But list page-ku idhuve romba fast-ah irukkum.

    res.status(200).json(storeKeepers);

  } catch (error) {
    console.error("❌ High-Perf StoreKeeper Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== GET STORE KEEPER BY ID =====
export const getStoreKeeperById = async (req, res) => {
  try {
    const storeKeeper = await StoreKeeper.findById(req.params.id)
      .populate('createdBy', 'name')
      .select('-password');

    if (!storeKeeper) {
      return res.status(404).json({ message: "Store Keeper not found" });
    }

    // Get orders created by this store keeper
    const orders = await Order.find({ 
      createdBy: storeKeeper._id,
      isActive: true 
    })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(20);

    const orderStats = {
      total: orders.length,
      completed: orders.filter(o => o.status === 'delivered').length,
      pending: orders.filter(o => ['draft', 'confirmed'].includes(o.status)).length,
      inProgress: orders.filter(o => o.status === 'in-progress').length
    };

    res.json({
      storeKeeper,
      orders,
      orderStats
    });
  } catch (error) {
    console.error("❌ Get by ID error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE STORE KEEPER =====
export const updateStoreKeeper = async (req, res) => {
  try {
    const storeKeeper = await StoreKeeper.findById(req.params.id);

    if (!storeKeeper) {
      return res.status(404).json({ message: "Store Keeper not found" });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Only admin can update" });
    }

    // Fields that can be updated
    const updatableFields = ['name', 'phone', 'email', 'address', 'department', 'experience', 'basicSalary', 'isActive'];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        storeKeeper[field] = req.body[field];
      }
    });

    await storeKeeper.save();

    const response = storeKeeper.toObject();
    delete response.password;

    res.json({
      message: "Store Keeper updated successfully",
      storeKeeper: response
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== DELETE STORE KEEPER (soft delete) =====
export const deleteStoreKeeper = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Only admin can delete" });
    }

    const storeKeeper = await StoreKeeper.findById(req.params.id);
    if (!storeKeeper) {
      return res.status(404).json({ message: "Store Keeper not found" });
    }

    // Check if they have active orders
    const activeOrders = await Order.countDocuments({
      createdBy: storeKeeper._id,
      status: { $nin: ['delivered', 'cancelled'] }
    });

    if (activeOrders > 0) {
      return res.status(400).json({ 
        message: `Cannot delete with ${activeOrders} active orders` 
      });
    }

    storeKeeper.isActive = false;
    await storeKeeper.save();

    res.json({ message: "Store Keeper deleted successfully" });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===== GET STORE KEEPER STATS =====
export const getStoreKeeperStats = async (req, res) => {
  try {
    const stats = await StoreKeeper.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: "$department",
        count: { $sum: 1 }
      }}
    ]);

    const total = await StoreKeeper.countDocuments({ isActive: true });

    res.json({
      total,
      departmentStats: stats
    });
  } catch (error) {
    console.error("❌ Stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function
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