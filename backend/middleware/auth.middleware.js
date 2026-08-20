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

// ---------------------------------------------------------------------------
// Short-lived identity cache.
//
// protect() previously hit the database on EVERY authenticated request to
// re-load the same user. Measured at ~105 ms per request against the remote
// Atlas cluster, and paid again for every parallel call a page fires.
//
// The JWT is already cryptographically verified before we reach here, so the
// only thing this lookup adds is "does this account still exist and is it
// still current". A short TTL keeps that guarantee within a few seconds while
// removing the round trip from the overwhelming majority of requests.
//
// Deliberately in-process: this app runs as a single Node process, so a Map
// gets the full benefit with no new infrastructure. If it is ever scaled out,
// this still behaves correctly — each process just keeps its own copy.
// ---------------------------------------------------------------------------
const USER_CACHE_TTL_MS = 30 * 1000;
const MAX_CACHE_ENTRIES = 5000;
const userCache = new Map();

const cacheKey = (id, role) => `${role || "USER"}:${id}`;

// Call after any mutation to a user/staff record so the change is picked up
// immediately instead of waiting out the TTL.
export const invalidateUserCache = (id, role) => {
  if (!id) return;
  if (role) {
    userCache.delete(cacheKey(id, role));
  } else {
    for (const k of userCache.keys()) {
      if (k.endsWith(`:${id}`)) userCache.delete(k);
    }
  }
};

export const clearUserCache = () => userCache.clear();

const loadUserByRole = async (id, role) => {
  switch (role) {
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

// Helper to find user based on role and ID (cached, see note above)
const findUserByRole = async (id, role) => {
  const key = cacheKey(id, role);
  const hit = userCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.user;

  const user = await loadUserByRole(id, role);

  // Negative lookups are cached briefly too, so a token belonging to a deleted
  // account does not re-query on every retry.
  if (userCache.size >= MAX_CACHE_ENTRIES) userCache.clear();
  userCache.set(key, { user, expires: Date.now() + USER_CACHE_TTL_MS });

  return user;
};

export const protect = async (req, res, next) => {
  
  try {
    // Get token from header
    let token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Not authorized, no token" 
      });
    }


    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ IMPORTANT: Get full user details from database
    const user = await findUserByRole(decoded.id, decoded.role);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Not authorized - user not found" 
      });
    }

    // ✅ Attach both decoded token and full user to req.user
    req.user = {
      ...decoded,        // Token data (id, role, name, iat, exp)
      ...user,           // Database data (email, phone, etc.)
      _id: user._id,     // Ensure _id is available
      id: user._id       // Also keep id for compatibility
    };

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
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "Not authenticated" 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Role ${req.user.role} is not authorized` 
      });
    }
    
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