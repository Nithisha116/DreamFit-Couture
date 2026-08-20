// backend/controllers/user.controller.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import StoreKeeper from "../models/StoreKeeper.js";
import CuttingMaster from "../models/CuttingMaster.js";
import Tailor from "../models/Tailor.js";
import AariWorker from "../models/AariWorker.js";
import EmbroideryWorker from "../models/EmbroideryWorker.js";
import Helper from "../models/Helper.js";
import { logDeletion } from "../utils/auditLogger.js";
// protect() caches the authenticated identity for 30s. These mutations must
// take effect immediately rather than waiting out the TTL.
import { invalidateUserCache } from "../middleware/auth.middleware.js";

// ========== PROFILE ROUTES (Any logged in user) ==========

// 👤 Get Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user.id;

    // Check if email already exists (if changing email)
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name, 
        email, 
        phone 
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔐 Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========== ADMIN ONLY ROUTES ==========

// 📋 Get All Staff (Store Keepers and Cutting Masters)
export const getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ 
      role: { $in: ["STORE_KEEPER", "CUTTING_MASTER", "STAFF"] },
      isActive: true
    })
    .select("-password")
    .sort({ createdAt: -1 });
    
    res.status(200).json(staff);
  } catch (error) {
    console.error("Get all staff error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🆕 Create New User (Staff)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, basicSalary } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Validate role
    if (!["STORE_KEEPER", "CUTTING_MASTER", "STAFF"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || "",
      basicSalary: basicSalary || 0,
      isActive: true
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update User (Staff)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, basicSalary } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email already exists for another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, role, phone, basicSalary },
      { new: true, runValidators: true }
    ).select("-password");

    // Role or details may have changed — drop any cached identity for this id.
    invalidateUserCache(id);

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete User (Soft Delete / Deactivate)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting own account
    if (id === req.user.id || id === req.user?._id?.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findOne({ _id: id, isActive: true });
    if (!user) {
      return res.status(404).json({ message: "User not found or already deactivated" });
    }

    // Write deletion audit log
    await logDeletion(req, "DELETE_USER", "User", user, user);

    user.isActive = false;
    await user.save();

    // Deactivate linked worker profile to preserve historical trace
    if (user.role === "STORE_KEEPER" && user.storeKeeperId) {
      await StoreKeeper.findByIdAndUpdate(user.storeKeeperId, { isActive: false });
    } else if (user.role === "CUTTING_MASTER" && user.cuttingMasterId) {
      await CuttingMaster.findByIdAndUpdate(user.cuttingMasterId, { isActive: false });
    } else if (user.role === "TAILOR" && user.tailorId) {
      await Tailor.findByIdAndUpdate(user.tailorId, { isActive: false });
    } else if (user.role === "AARI_WORKER" && user.aariWorkerId) {
      await AariWorker.findByIdAndUpdate(user.aariWorkerId, { isActive: false });
    } else if (user.role === "EMBROIDERY_WORKER" && user.embroideryWorkerId) {
      await EmbroideryWorker.findByIdAndUpdate(user.embroideryWorkerId, { isActive: false });
    } else if (user.role === "HELPER" && user.helperId) {
      await Helper.findByIdAndUpdate(user.helperId, { isActive: false });
    }

    // Deactivation must revoke access now, not up to 30s later. The linked
    // staff record carries its own _id, so clear that key as well.
    invalidateUserCache(user._id);
    const linkedId = user.storeKeeperId || user.cuttingMasterId || user.tailorId
      || user.aariWorkerId || user.embroideryWorkerId || user.helperId;
    if (linkedId) invalidateUserCache(linkedId);

    res.status(200).json({ 
      message: "User deactivated successfully",
      deactivatedUser: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔄 Toggle User Status (Activate/Deactivate)
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deactivating own account
    if (id === req.user.id) {
      return res.status(400).json({ message: "Cannot change your own status" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle status
    user.isActive = !user.isActive;
    await user.save();

    // Activation/deactivation takes effect on the very next request.
    invalidateUserCache(user._id);

    res.status(200).json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Get Single User by ID (Admin only)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: error.message });
  }
};