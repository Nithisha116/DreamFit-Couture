// import jwt from "jsonwebtoken";

// export const protect = async (req, res, next) => {
//   let token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "Not authorized, no token" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Token failed" });
//   }
// };

// export const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: `Role ${req.user.role} is not authorized` });
//     }
//     next();
//   };
// };


// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import CuttingMaster from "../models/CuttingMaster.js";
import StoreKeeper from "../models/StoreKeeper.js";
import Tailor from "../models/Tailor.js";
import { attachAuditLogging } from "./auditMiddleware.js";

// Helper to find user based on role and ID
const findUserByRole = async (id, role) => {
  console.log(`🔍 Finding user with role: ${role}, ID: ${id}`);
  
  switch(role) {
    case 'CUTTING_MASTER':
      return await CuttingMaster.findById(id).select('-password').lean();
    case 'STORE_KEEPER':
      return await StoreKeeper.findById(id).select('-password').lean();
    case 'TAILOR':
      return await Tailor.findById(id).select('-password').lean();
    default:
      return await User.findById(id).select('-password').lean();
  }
};

export const protect = async (req, res, next) => {
  console.log("\n🔐 ===== AUTH MIDDLEWARE =====");
  
  try {
    // Get token from header
    let token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ 
        success: false,
        message: "Not authorized, no token" 
      });
    }

    console.log("✅ Token found:", token.substring(0, 20) + "...");

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified. Decoded:", {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name
    });

    // ✅ IMPORTANT: Get full user details from database
    const user = await findUserByRole(decoded.id, decoded.role);
    
    if (!user) {
      console.log("❌ User not found in database");
      return res.status(401).json({ 
        success: false,
        message: "Not authorized - user not found" 
      });
    }

    console.log("✅ User found in database:", {
      id: user._id,
      name: user.name,
      role: decoded.role
    });

    // ✅ Attach both decoded token and full user to req.user
    req.user = {
      ...decoded,        // Token data (id, role, name, iat, exp)
      ...user,           // Database data (email, phone, etc.)
      _id: user._id,     // Ensure _id is available
      id: user._id       // Also keep id for compatibility
    };

    console.log("✅ Final req.user:", {
      _id: req.user._id,
      id: req.user.id,
      role: req.user.role,
      name: req.user.name
    });

    // Admin action audit trail — no-op for non-ADMIN roles and GET requests.
    // See middleware/auditMiddleware.js for what this actually records.
    attachAuditLogging(req, res);

    next();
    
  } catch (error) {
    console.error("❌ Auth error:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token" 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expired" 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: "Token failed" 
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log(`🔐 Authorize middleware - Required roles: ${roles}`);
    console.log(`🔐 User role: ${req.user?.role}`);
    
    if (!req.user) {
      console.log("❌ No user in request");
      return res.status(401).json({ 
        success: false,
        message: "Not authenticated" 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`❌ Role ${req.user.role} not authorized`);
      return res.status(403).json({ 
        success: false,
        message: `Role ${req.user.role} is not authorized` 
      });
    }
    
    console.log("✅ Authorization granted");
    next();
  };
};

// Restricts access to the Internal Admin account (or any future account
// explicitly flagged isInternalAdmin) — used for the Activity Log endpoint.
// Deliberately checks the isInternalAdmin flag rather than email/role alone,
// so the client's own ADMIN account (isInternalAdmin: false) is denied even
// though it shares the same role.
export const requireInternalAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN' || !req.user?.isInternalAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied'
    });
  }
  next();
};

// Optional: Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ 
      success: false,
      message: 'Admin access required' 
    });
  }
  next();
};

// Optional: Middleware to check if user is store keeper
export const isStoreKeeper = (req, res, next) => {
  if (req.user?.role !== 'STORE_KEEPER' && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ 
      success: false,
      message: 'Store keeper access required' 
    });
  }
  next();
};

// Optional: Middleware to check if user is cutting master
export const isCuttingMaster = (req, res, next) => {
  if (req.user?.role !== 'CUTTING_MASTER' && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ 
      success: false,
      message: 'Cutting master access required' 
    });
  }
  next();
};