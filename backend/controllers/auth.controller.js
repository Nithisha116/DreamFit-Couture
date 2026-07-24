// // backend/controllers/auth.controller.js
// import User from "../models/User.js";
// import CuttingMaster from "../models/CuttingMaster.js";
// import StoreKeeper from "../models/StoreKeeper.js";
// import Tailor from "../models/Tailor.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password, phone } = req.body;

//     // 1️⃣ Validate input - either email or phone required
//     if (!email && !phone) {
//       return res.status(400).json({
//         message: "Email or phone number is required",
//       });
//     }

//     if (!password) {
//       return res.status(400).json({
//         message: "Password is required",
//       });
//     }

//     console.log(`🔍 Login attempt: ${email || phone}`);

//     // 2️⃣ Try to find user in different models
//     let user = null;
//     let userType = null;
//     let userId = null;

//     // Check in User model (Admin)
//     const adminUser = await User.findOne({ 
//       $or: [
//         { email: email },
//         { phone: phone }
//       ]
//     }).select('+password');

//     if (adminUser) {
//       user = adminUser;
//       userType = "ADMIN";
//       userId = adminUser._id;
//       console.log("✅ Admin found");
//     }

//     // Check in CuttingMaster model
//     if (!user) {
//       const cuttingMaster = await CuttingMaster.findOne({
//         $or: [
//           { email: email },
//           { phone: phone }
//         ]
//       }).select('+password');
      
//       if (cuttingMaster) {
//         user = cuttingMaster;
//         userType = "CUTTING_MASTER";
//         userId = cuttingMaster._id;
//         console.log("✅ Cutting Master found");
//       }
//     }

//     // Check in StoreKeeper model
//     if (!user) {
//       const storeKeeper = await StoreKeeper.findOne({
//         $or: [
//           { email: email },
//           { phone: phone }
//         ]
//       }).select('+password');
      
//       if (storeKeeper) {
//         user = storeKeeper;
//         userType = "STORE_KEEPER";
//         userId = storeKeeper._id;
//         console.log("✅ Store Keeper found");
//       }
//     }

//     // Check in Tailor model
//     if (!user) {
//       const tailor = await Tailor.findOne({
//         $or: [
//           { email: email },
//           { phone: phone }
//         ]
//       }).select('+password');
      
//       if (tailor) {
//         user = tailor;
//         userType = "TAILOR";
//         userId = tailor._id;
//         console.log("✅ Tailor found");
//       }
//     }

//     // 3️⃣ If no user found
//     if (!user) {
//       return res.status(401).json({ 
//         message: "Invalid credentials - user not found" 
//       });
//     }

//     // 4️⃣ Check if user is active
//     if (user.isActive === false) {
//       return res.status(403).json({ 
//         message: "Account is disabled. Please contact admin." 
//       });
//     }

//     // 5️⃣ Verify password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ 
//         message: "Invalid password" 
//       });
//     }

//     // 6️⃣ Update last login
//     user.lastLogin = new Date();
//     await user.save();

//     // 7️⃣ Generate JWT token
//     const token = jwt.sign(
//       {
//         id: userId,
//         role: userType,
//         name: user.name,
//         userType: userType.toLowerCase(), // For frontend routing
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // 8️⃣ Determine redirect path based on role
//     let redirectPath = "/";
//     switch(userType) {
//       case "ADMIN":
//         redirectPath = "/admin/dashboard";
//         break;
//       case "STORE_KEEPER":
//         redirectPath = "/storekeeper/dashboard";
//         break;
//       case "CUTTING_MASTER":
//         redirectPath = "/cuttingmaster/dashboard";
//         break;
//       case "TAILOR":
//         redirectPath = "/tailor/dashboard";
//         break;
//     }

//     // 9️⃣ Remove password from response
//     const userResponse = {
//       id: userId,
//       name: user.name,
//       email: user.email,
//       phone: user.phone,
//       role: userType,
//       ...(userType === "TAILOR" && { 
//         tailorId: user.tailorId,
//         isAvailable: user.isAvailable 
//       }),
//       ...(userType === "CUTTING_MASTER" && { 
//         cuttingMasterId: user.cuttingMasterId 
//       }),
//       ...(userType === "STORE_KEEPER" && { 
//         storeKeeperId: user.storeKeeperId,
//         department: user.department 
//       }),
//     };

//     // 🔟 Send response
//     res.status(200).json({
//       message: "Login successful",
//       user: userResponse,
//       token,
//       redirectPath,
//     });

//   } catch (error) {
//     console.error("❌ Login error:", error);
//     res.status(500).json({ 
//       message: "Login failed. Please try again.",
//       error: error.message 
//     });
//   }
// };











// backend/controllers/auth.controller.js
import User from "../models/User.js";
import CuttingMaster from "../models/CuttingMaster.js";
import StoreKeeper from "../models/StoreKeeper.js";
import Tailor from "../models/Tailor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logAction } from "../utils/auditLogger.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    // 1️⃣ Validate input - either email or phone required
    if (!email && !phone) {
      return res.status(400).json({
        message: "Email or phone number is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    console.log(`🔍 Login attempt: ${email || phone}`);

    // 2️⃣ 🚀 OPTIMIZED: Search ALL tables in parallel
    const searchCriteria = { $or: [] };
    if (email) searchCriteria.$or.push({ email });
    if (phone) searchCriteria.$or.push({ phone });

    const [admin, cutting, store, tailor] = await Promise.all([
      User.findOne(searchCriteria).select('+password').lean(),
      CuttingMaster.findOne(searchCriteria).select('+password').lean(),
      StoreKeeper.findOne(searchCriteria).select('+password').lean(),
      Tailor.findOne(searchCriteria).select('+password').lean(),
    ]);

    // Identify who was found
    let user = null;
    let userType = null;
    let userId = null;

    let Model = null;

    if (admin) {
      user = admin;
      const allowedRoles = [
        "ADMIN",
        "TAILOR",
        "HELPER",
        "STORE_KEEPER",
        "CUTTING_MASTER",
        "AARI_WORKER",
        "EMBROIDERY_WORKER",
        "STAFF",
        "MANAGER"
      ];
      if (!allowedRoles.includes(admin.role)) {
        return res.status(403).json({ message: "Invalid user role" });
      }
      userType = admin.role;
      userId = admin._id;
      Model = User;
      console.log(`✅ User found with role: ${admin.role}`);
    } else if (cutting) {
      user = cutting;
      userType = "CUTTING_MASTER";
      userId = cutting._id;
      Model = CuttingMaster;
      console.log("✅ Cutting Master found");
    } else if (store) {
      user = store;
      userType = "STORE_KEEPER";
      userId = store._id;
      Model = StoreKeeper;
      console.log("✅ Store Keeper found");
    } else if (tailor) {
      user = tailor;
      userType = "TAILOR";
      userId = tailor._id;
      Model = Tailor;
      console.log("✅ Tailor found");
    }

    // 3️⃣ If no user found
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid credentials - user not found" 
      });
    }

    // 4️⃣ Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({ 
        message: "Account is disabled. Please contact admin." 
      });
    }

    // 5️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: "Invalid password" 
      });
    }

    // 6️⃣ 🚀 OPTIMIZED: Update last login in background (don't await)
    
    // Update in background without blocking response
    Model.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: false }
    ).catch(err => console.error("LastLogin update failed:", err.message));

    // Audit trail — records which specific account logged in (fire-and-forget,
    // mirrors the lastLogin update above; never blocks or fails the login).
    const loginEntityType = { CUTTING_MASTER: "CuttingMaster", STORE_KEEPER: "StoreKeeper", TAILOR: "Tailor" }[userType] || "User";
    logAction(req, {
      action: "LOGIN",
      entityType: loginEntityType,
      entityId: userId,
      description: `${userType} login: ${user.name || "Unknown"} (${user.email || user.phone || "no contact"})`,
      actorId: userId,
      actorEmail: user.email || user.phone || "",
      actorName: user.name || "",
      actorRole: userType
    }).catch(() => {});

    // 7️⃣ Generate JWT token
    const token = jwt.sign(
      {
        id: userId,
        role: userType,
        name: user.name,
        userType: userType.toLowerCase(), // For frontend routing
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 8️⃣ Determine redirect path based on role
    let redirectPath = "/";
    switch(userType) {
      case "ADMIN":
        redirectPath = "/admin/dashboard";
        break;
      case "STORE_KEEPER":
        redirectPath = "/storekeeper/dashboard";
        break;
      case "CUTTING_MASTER":
        redirectPath = "/cuttingmaster/dashboard";
        break;
      case "TAILOR":
        redirectPath = "/tailor/dashboard";
        break;
    }

    // 9️⃣ Remove password from response
    const userResponse = {
      id: userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: userType,
      ...(userType === "ADMIN" && { isInternalAdmin: !!user.isInternalAdmin }),
      ...(userType === "TAILOR" && {
        tailorId: user.tailorId,
        isAvailable: user.isAvailable 
      }),
      ...(userType === "CUTTING_MASTER" && { 
        cuttingMasterId: user.cuttingMasterId 
      }),
      ...(userType === "STORE_KEEPER" && { 
        storeKeeperId: user.storeKeeperId,
        department: user.department 
      }),
    };

    // 🔟 Send response (INSTANT!)
    res.status(200).json({
      message: "Login successful",
      user: userResponse,
      token,
      redirectPath,
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ 
      message: "Login failed. Please try again.",
      error: error.message 
    });
  }
};