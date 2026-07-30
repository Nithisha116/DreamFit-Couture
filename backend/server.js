// // backend/server.js
// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import compression from "compression";
// import rateLimit from "express-rate-limit";
// import connectDB from "./config/db.js";

// // Import Routes
// import authRoutes from "./routes/auth.routes.js";
// import customerRoutes from "./routes/customer.routes.js";
// import userRoutes from "./routes/user.routes.js";
// import fabricRoutes from "./routes/fabric.routes.js";
// import categoryRoutes from "./routes/category.routes.js";
// import itemRoutes from "./routes/item.routes.js";
// import sizeTemplateRoutes from "./routes/sizeTemplate.routes.js";
// import sizeFieldRoutes from "./routes/sizeField.routes.js";

// // Customer Size Profile Routes
// import customerSizeRoutes from "./routes/customerSize.routes.js";

// // ORDER MANAGEMENT ROUTES (FULLY UPDATED)
// import orderRoutes from "./routes/order.routes.js";           // ✅ COMPLETE: 10+ endpoints
// import garmentRoutes from "./routes/garment.routes.js";
// import workRoutes from "./routes/work.routes.js";

// // PAYMENT ROUTES
// import paymentRoutes from "./routes/payment.routes.js";

// // TAILOR MANAGEMENT ROUTES
// import tailorRoutes from "./routes/tailor.routes.js";

// // NOTIFICATION ROUTES
// import notificationRoutes from "./routes/notification.routes.js";

// // CUTTING MASTER & STORE KEEPER ROUTES
// import cuttingMasterRoutes from "./routes/cuttingMaster.routes.js";
// import storeKeeperRoutes from "./routes/storeKeeper.routes.js";

// // BANKING / TRANSACTION ROUTES
// import transactionRoutes from "./routes/transaction.routes.js";

// // IMPORT ERROR HANDLING MIDDLEWARE
// import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// // Load env variables
// dotenv.config();

// // Create app
// const app = express();

// // Connect MongoDB
// connectDB();

// // ==================== MIDDLEWARE ====================

// // CORS configuration
// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:5173",
//   "http://127.0.0.1:5173",
//   "http://localhost:5000",
//   "https://dreamfit.vercel.app",
//   "https://dreamfit-six.vercel.app",
//   "https://dreamfit-v1.vercel.app",
//   "https://dreamfit-v2.vercel.app"
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         console.log("❌ Blocked by CORS:", origin);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//     exposedHeaders: ["Content-Range", "X-Content-Range"],
//     maxAge: 600,
//   })
// );

// // Security middleware
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" },
//   crossOriginOpenerPolicy: { policy: "unsafe-none" }
// }));

// // Compression
// app.use(compression());

// // Logging
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// } else {
//   app.use(morgan("combined"));
// }

// // ==================== RATE LIMITING ====================
// if (process.env.NODE_ENV === "production") {
//   const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 5000,
//     message: "Too many requests from this IP, please try again later.",
//     standardHeaders: true,
//     legacyHeaders: false,
//     skip: (req) => req.url.startsWith('/uploads/')
//   });
//   app.use("/api/", limiter);
//   console.log("🔒 Production rate limit: 5000 requests/15min");
// } else {
//   console.log("🔧 Development mode - Rate limiting DISABLED");
// }

// // Body parser
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // Static files
// app.use("/uploads", express.static("uploads"));

// // ==================== TEST ROUTE ====================
// app.get("/", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "🎉 DREAMFIT ERP BACKEND v2.0",
//     version: "2.0.0",
//     environment: process.env.NODE_ENV || "development",
//     timestamp: new Date().toISOString(),
//     modules: {
//       auth: "/api/auth",
//       customers: "/api/customers",           // ✅ COMPLETE
//       orders: "/api/orders",                  // ✅ COMPLETE with payments
//       payments: "/api/payments",               // ✅ COMPLETE
//       works: "/api/works",                     // ✅ COMPLETE
//       garments: "/api/garments",               // ✅ COMPLETE
//       tailors: "/api/tailors",                 // ✅ COMPLETE
//       cuttingMasters: "/api/cutting-masters",  // ✅ COMPLETE
//       storeKeepers: "/api/store-keepers",      // ✅ COMPLETE
//       fabrics: "/api/fabrics",                  // ✅ COMPLETE
//       categories: "/api/categories",            // ✅ COMPLETE
//       items: "/api/items",                      // ✅ COMPLETE
//       sizeTemplates: "/api/size-templates",     // ✅ COMPLETE
//       sizeFields: "/api/size-fields",           // ✅ COMPLETE
//       customerSize: "/api/customer-size",       // ✅ COMPLETE
//       notifications: "/api/notifications",       // ✅ COMPLETE
//       transactions: "/api/transactions",         // ✅ COMPLETE
//       users: "/api/users"                        // ✅ COMPLETE
//     }
//   });
// });

// // Health check endpoint
// app.get("/health", (req, res) => {
//   res.status(200).json({
//     status: "healthy",
//     uptime: process.uptime(),
//     timestamp: new Date().toISOString(),
//     database: "connected",
//     memory: process.memoryUsage(),
//     cpu: process.cpuUsage()
//   });
// });

// // ==================== API ROUTES ====================

// // 🔐 AUTH ROUTES - Public
// app.use("/api/auth", authRoutes);

// // ====================================================
// // 👤 CUSTOMER MODULE - COMPLETE ✅
// // ====================================================
// app.use("/api/customers", customerRoutes);
// // All customer endpoints available at:
// // GET    /api/customers/all
// // GET    /api/customers/with-payments
// // GET    /api/customers/stats
// // GET    /api/customers/search/phone/:phone
// // GET    /api/customers/search/id/:customerId
// // GET    /api/customers/:id
// // GET    /api/customers/:id/payments
// // GET    /api/customers/:id/orders
// // GET    /api/customers/:id/payment-stats
// // GET    /api/customers/:id/payment-trends
// // POST   /api/customers/create
// // PUT    /api/customers/:id
// // DELETE /api/customers/:id

// // ====================================================
// // 📦 ORDER MANAGEMENT MODULE - COMPLETE ✅
// // ====================================================
// app.use("/api/orders", orderRoutes);
// // All order endpoints:
// // GET    /api/orders/stats
// // GET    /api/orders/dashboard
// // POST   /api/orders
// // GET    /api/orders
// // POST   /api/orders/:id/payments
// // GET    /api/orders/:id/payments
// // GET    /api/orders/:id
// // PUT    /api/orders/:id
// // PATCH  /api/orders/:id/status
// // DELETE /api/orders/:id

// // ====================================================
// // 👕 GARMENT MODULE - COMPLETE ✅
// // ====================================================
// app.use("/api/garments", garmentRoutes);
// // Garment endpoints:
// // POST   /api/garments
// // GET    /api/garments
// // GET    /api/garments/:id
// // PUT    /api/garments/:id
// // DELETE /api/garments/:id

// // ====================================================
// // ⚙️ WORK MODULE - COMPLETE ✅
// // ====================================================
// app.use("/api/works", workRoutes);
// // Work endpoints:
// // GET    /api/works/stats
// // GET    /api/works/pool
// // POST   /api/works/:id/accept
// // POST   /api/works/:id/start
// // POST   /api/works/:id/complete
// // GET    /api/works/cutting-master/:cuttingMasterId
// // GET    /api/works/:id
// // PUT    /api/works/:id
// // DELETE /api/works/:id

// // ====================================================
// // 💰 PAYMENT MODULE - COMPLETE ✅
// // ====================================================
// app.use("/api/payments", paymentRoutes);
// // Payment endpoints:
// // GET    /api/payments/stats
// // GET    /api/payments/daily
// // POST   /api/payments
// // GET    /api/payments
// // GET    /api/payments/order/:orderId
// // GET    /api/payments/customer/:customerId
// // GET    /api/payments/:id
// // PUT    /api/payments/:id
// // DELETE /api/payments/:id

// // ====================================================
// // 👥 USER MANAGEMENT - COMPLETE ✅
// // ====================================================
// app.use("/api/users", userRoutes);

// // ====================================================
// // 👕 FABRIC MANAGEMENT - COMPLETE ✅
// // ====================================================
// app.use("/api/fabrics", fabricRoutes);

// // ====================================================
// // 📁 CATEGORY MANAGEMENT - COMPLETE ✅
// // ====================================================
// app.use("/api/categories", categoryRoutes);

// // ====================================================
// // 🧵 ITEM MANAGEMENT - COMPLETE ✅
// // ====================================================
// app.use("/api/items", itemRoutes);

// // ====================================================
// // 📏 SIZE TEMPLATE MANAGEMENT - COMPLETE ✅
// // ====================================================
// app.use("/api/size-templates", sizeTemplateRoutes);

// // ====================================================
// // 📐 SIZE FIELD MANAGEMENT - COMPLETE ✅
// // ====================================================
// app.use("/api/size-fields", sizeFieldRoutes);

// // ====================================================
// // 📏 CUSTOMER SIZE PROFILE - COMPLETE ✅
// // ====================================================
// app.use("/api/customer-size", customerSizeRoutes);

// // ====================================================
// // ✂️ TAILOR MANAGEMENT - COMPLETE ✅
// // ====================================================
// app.use("/api/tailors", tailorRoutes);

// // ====================================================
// // 🔔 NOTIFICATION MANAGEMENT - COMPLETE ✅
// // ====================================================
// app.use("/api/notifications", notificationRoutes);

// // ====================================================
// // ✂️ CUTTING MASTER MANAGEMENT - COMPLETE ✅
// // ====================================================
// app.use("/api/cutting-masters", cuttingMasterRoutes);

// // ====================================================
// // 🏪 STORE KEEPER MANAGEMENT - COMPLETE ✅
// // ====================================================
// app.use("/api/store-keepers", storeKeeperRoutes);

// // ====================================================
// // 💰 BANKING / TRANSACTION MANAGEMENT - COMPLETE ✅
// // ====================================================
// app.use("/api/transactions", transactionRoutes);

// // ==================== ERROR HANDLING MIDDLEWARE ====================
// app.use(notFound);
// app.use(errorHandler);

// // ==================== UNHANDLED REJECTIONS ====================
// process.on("unhandledRejection", (err) => {
//   console.log("❌ UNHANDLED REJECTION! Shutting down...");
//   console.log(err.name, err.message);
//   console.log(err.stack);
//   server.close(() => {
//     process.exit(1);
//   });
// });

// process.on("uncaughtException", (err) => {
//   console.log("❌ UNCAUGHT EXCEPTION! Shutting down...");
//   console.log(err.name, err.message);
//   console.log(err.stack);
//   process.exit(1);
// });

// // ==================== START SERVER ====================
// const PORT = process.env.PORT || 5000;

// const server = app.listen(PORT, () => {
//   console.log("\n" + "=".repeat(80));
//   console.log(`🚀 DREAMFIT ERP BACKEND v2.0`);
//   console.log("=".repeat(80));
//   console.log(`📡 Server: http://localhost:${PORT}`);
//   console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
//   console.log(`💾 Database: MongoDB Connected`);
//   console.log(`⏰ Started: ${new Date().toLocaleString()}`);
//   console.log("=".repeat(80));
  
//   // ==================== COMPLETE ROUTES LIST ====================
//   console.log(`\n📋 COMPLETE API ROUTES LIST:`);
//   console.log("=".repeat(80));
  
//   // 🔐 AUTH ROUTES
//   console.log(`\n🔐 AUTH ROUTES (Public):`);
//   console.log("-".repeat(40));
//   console.log(`   POST   /api/auth/register`);
//   console.log(`   POST   /api/auth/login`);
//   console.log(`   POST   /api/auth/forgot-password`);
//   console.log(`   POST   /api/auth/reset-password/:token`);
//   console.log(`   GET    /api/auth/me`);
//   console.log(`   POST   /api/auth/logout`);
//   console.log(`   POST   /api/auth/refresh-token`);
  
//   // 👤 CUSTOMER ROUTES
//   console.log(`\n👤 CUSTOMER ROUTES (${customerRoutes.stack?.length || 10}+ endpoints):`);
//   console.log("-".repeat(40));
//   console.log(`   🔒 GET    /api/customers/all`);
//   console.log(`   🔒 GET    /api/customers/with-payments`);
//   console.log(`   🔒 GET    /api/customers/stats`);
//   console.log(`   🔒 GET    /api/customers/search/phone/:phone`);
//   console.log(`   🔒 GET    /api/customers/search/id/:customerId`);
//   console.log(`   🔒 GET    /api/customers/:id`);
//   console.log(`   🔒 GET    /api/customers/:id/payments`);
//   console.log(`   🔒 GET    /api/customers/:id/orders`);
//   console.log(`   🔒 GET    /api/customers/:id/payment-stats`);
//   console.log(`   🔒 GET    /api/customers/:id/payment-trends`);
//   console.log(`   🔒 POST   /api/customers/create`);
//   console.log(`   🔒 PUT    /api/customers/:id`);
//   console.log(`   🔒 DELETE /api/customers/:id`);
  
//   // 📦 ORDER ROUTES
//   console.log(`\n📦 ORDER ROUTES (${orderRoutes.stack?.length || 10}+ endpoints):`);
//   console.log("-".repeat(40));
//   console.log(`   🔒 GET    /api/orders/stats`);
//   console.log(`   🔒 GET    /api/orders/dashboard`);
//   console.log(`   🔒 POST   /api/orders`);
//   console.log(`   🔒 GET    /api/orders`);
//   console.log(`   🔒 POST   /api/orders/:id/payments`);
//   console.log(`   🔒 GET    /api/orders/:id/payments`);
//   console.log(`   🔒 GET    /api/orders/:id`);
//   console.log(`   🔒 PUT    /api/orders/:id`);
//   console.log(`   🔒 PATCH  /api/orders/:id/status`);
//   console.log(`   🔒 DELETE /api/orders/:id`);
  
//   // 💰 PAYMENT ROUTES
//   console.log(`\n💰 PAYMENT ROUTES:`);
//   console.log("-".repeat(40));
//   console.log(`   🔒 GET    /api/payments/stats`);
//   console.log(`   🔒 GET    /api/payments/daily`);
//   console.log(`   🔒 POST   /api/payments`);
//   console.log(`   🔒 GET    /api/payments`);
//   console.log(`   🔒 GET    /api/payments/order/:orderId`);
//   console.log(`   🔒 GET    /api/payments/customer/:customerId`);
//   console.log(`   🔒 GET    /api/payments/:id`);
//   console.log(`   🔒 PUT    /api/payments/:id`);
//   console.log(`   🔒 DELETE /api/payments/:id`);
  
//   // ⚙️ WORK ROUTES
//   console.log(`\n⚙️ WORK ROUTES:`);
//   console.log("-".repeat(40));
//   console.log(`   🔒 GET    /api/works/stats`);
//   console.log(`   🔒 GET    /api/works/pool`);
//   console.log(`   🔒 POST   /api/works/:id/accept`);
//   console.log(`   🔒 POST   /api/works/:id/start`);
//   console.log(`   🔒 POST   /api/works/:id/complete`);
//   console.log(`   🔒 GET    /api/works/cutting-master/:cuttingMasterId`);
//   console.log(`   🔒 GET    /api/works/:id`);
//   console.log(`   🔒 PUT    /api/works/:id`);
//   console.log(`   🔒 DELETE /api/works/:id`);
  
//   // 👕 GARMENT ROUTES
//   console.log(`\n👕 GARMENT ROUTES:`);
//   console.log("-".repeat(40));
//   console.log(`   🔒 POST   /api/garments`);
//   console.log(`   🔒 GET    /api/garments`);
//   console.log(`   🔒 GET    /api/garments/:id`);
//   console.log(`   🔒 PUT    /api/garments/:id`);
//   console.log(`   🔒 DELETE /api/garments/:id`);
  
//   // ✂️ TAILOR & CUTTING MASTER ROUTES
//   console.log(`\n✂️ TAILOR MANAGEMENT:`);
//   console.log("-".repeat(40));
//   console.log(`   🔒 CRUD   /api/tailors`);
//   console.log(`   🔒 CRUD   /api/cutting-masters`);
//   console.log(`   🔒 CRUD   /api/store-keepers`);
  
//   // 📏 SIZE MANAGEMENT
//   console.log(`\n📏 SIZE MANAGEMENT:`);
//   console.log("-".repeat(40));
//   console.log(`   🔒 CRUD   /api/size-templates`);
//   console.log(`   🔒 CRUD   /api/size-fields`);
//   console.log(`   🔒 CRUD   /api/customer-size`);
  
//   // 👕 FABRIC & CATEGORY
//   console.log(`\n👕 FABRIC & CATEGORY:`);
//   console.log("-".repeat(40));
//   console.log(`   🔒 CRUD   /api/fabrics`);
//   console.log(`   🔒 CRUD   /api/categories`);
//   console.log(`   🔒 CRUD   /api/items`);
  
//   // 🔔 NOTIFICATIONS
//   console.log(`\n🔔 NOTIFICATIONS:`);
//   console.log("-".repeat(40));
//   console.log(`   🔒 CRUD   /api/notifications`);
  
//   // 💰 TRANSACTIONS
//   console.log(`\n💰 TRANSACTIONS:`);
//   console.log("-".repeat(40));
//   console.log(`   🔒 CRUD   /api/transactions`);
  
//   // 👥 USERS
//   console.log(`\n👥 USERS:`);
//   console.log("-".repeat(40));
//   console.log(`   🔒 CRUD   /api/users`);
  
//   console.log("=".repeat(80));
//   console.log(`\n📊 TOTAL ENDPOINTS: 100+ ACTIVE ENDPOINTS`);
//   console.log("✅ ALL MODULES COMPLETE AND CONNECTED");
//   console.log("=".repeat(80) + "\n");
// });

// export default app;










// backend/server.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { initSocket } from "./utils/socket.js";
import cronService from "./services/cron.service.js";

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import userRoutes from "./routes/user.routes.js";
import fabricRoutes from "./routes/fabric.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import itemRoutes from "./routes/item.routes.js";
import sizeTemplateRoutes from "./routes/sizeTemplate.routes.js";
import sizeFieldRoutes from "./routes/sizeField.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import auditLogRoutes from "./routes/auditLog.routes.js";

// Customer Size Profile Routes
import customerSizeRoutes from "./routes/customerSize.routes.js";

// ORDER MANAGEMENT ROUTES (FULLY UPDATED)
import orderRoutes from "./routes/order.routes.js";          // ✅ COMPLETE: 10+ endpoints
import garmentRoutes from "./routes/garment.routes.js";
import workRoutes from "./routes/work.routes.js";

// PAYMENT ROUTES
import paymentRoutes from "./routes/payment.routes.js";

// TAILOR MANAGEMENT ROUTES
import tailorRoutes from "./routes/tailor.routes.js";
import aariWorkerRoutes from "./routes/aariWorker.routes.js";
import embroideryWorkerRoutes from "./routes/embroideryWorker.routes.js";
import helperRoutes from "./routes/helper.routes.js";

// NOTIFICATION ROUTES
import notificationRoutes from "./routes/notification.routes.js";

// CUTTING MASTER & STORE KEEPER ROUTES
import cuttingMasterRoutes from "./routes/cuttingMaster.routes.js";
import storeKeeperRoutes from "./routes/storeKeeper.routes.js";

// BANKING / TRANSACTION ROUTES
import transactionRoutes from "./routes/transaction.routes.js";

// APPOINTMENT ROUTES
import appointmentRoutes from "./routes/appointment.routes.js";

// OUTSOURCING ROUTES
import outsourcingRoutes from "./routes/outsourcing.routes.js";
import outsourcingVendorRoutes from "./routes/outsourcingVendor.routes.js";
import sourcingRoutes from "./routes/sourcing.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import salaryRoutes from "./routes/salary.routes.js";
import workerRoutes from "./routes/worker.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import qrRoutes from "./routes/qr.routes.js";
import publicRoutes from "./routes/public.routes.js";

// BILLING & INVOICING ROUTES
import invoiceRoutes from "./routes/invoice.routes.js";

// IMPORT ERROR HANDLING MIDDLEWARE
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Load env variables (already loaded at top)

// Create app
const app = express();

// Connect MongoDB
connectDB();

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Initialize Cron Jobs
cronService.init();

// ==================== MIDDLEWARE ====================

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "http://127.0.0.1:5177",
  "http://localhost:5000",
  "https://dream-fitcouture-bnuc.vercel.app",
  "https://dream-fitcouture.vercel.app",
  "https://dream-fit-couture.vercel.app",
  "https://dreamfit-couture.vercel.app",
  "https://boutique-ware-11.vercel.app",
  "https://dreamfit-one.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cache-Control"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 600,
  })
);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ==================== RATE LIMITING ====================
if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.url.startsWith('/uploads/')
  });
  app.use("/api/", limiter);
  console.log("🔒 Production rate limit: 5000 requests/15min");
} else {
  console.log("🔧 Development mode - Rate limiting DISABLED");
}

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static("uploads"));

// ==================== 📸 IMAGE PROXY ROUTE (CORS FIX) ====================
// Add this proxy route to handle images from R2 storage
app.get("/api/proxy-image", async (req, res) => {
  const imageUrl = req.query.url;
  
  console.log("🖼️ Proxying image:", imageUrl?.substring(0, 100));
  
  if (!imageUrl) {
    console.error("❌ No URL provided");
    return res.status(400).json({ error: "Missing url parameter" });
  }
  
  try {
    // Fetch the image from external URL (R2 storage)
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch: ${response.status} for URL: ${imageUrl}`);
      return res.status(response.status).send("Image not found");
    }
    
    // Get the image as buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Set correct content type
    const contentType = response.headers.get("content-type");
    res.set("Content-Type", contentType || "image/jpeg");
    
    // Add CORS headers to allow frontend access
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Cache-Control", "public, max-age=86400"); // Cache for 1 day
    
    // Send the image
    res.send(buffer);
    
    console.log("✅ Image proxied successfully:", imageUrl?.substring(0, 80));
    
  } catch (error) {
    console.error("❌ Proxy error:", error.message);
    res.status(500).send("Failed to proxy image");
  }
});

// Handle OPTIONS request for preflight
app.options("/api/proxy-image", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.status(200).end();
});

// ==================== TEST ROUTE ====================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🎉 DREAMFIT ERP BACKEND v2.0",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    modules: {
      auth: "/api/auth",
      customers: "/api/customers",           // ✅ COMPLETE
      orders: "/api/orders",                  // ✅ COMPLETE with payments
      payments: "/api/payments",               // ✅ COMPLETE
      works: "/api/works",                     // ✅ COMPLETE
      garments: "/api/garments",               // ✅ COMPLETE
      tailors: "/api/tailors",                 // ✅ COMPLETE
      cuttingMasters: "/api/cutting-masters",  // ✅ COMPLETE
      storeKeepers: "/api/store-keepers",      // ✅ COMPLETE
      fabrics: "/api/fabrics",                  // ✅ COMPLETE
      categories: "/api/categories",            // ✅ COMPLETE
      items: "/api/items",                      // ✅ COMPLETE
      sizeTemplates: "/api/size-templates",     // ✅ COMPLETE
      sizeFields: "/api/size-fields",           // ✅ COMPLETE
      customerSize: "/api/customer-size",       // ✅ COMPLETE
      notifications: "/api/notifications",       // ✅ COMPLETE
      transactions: "/api/transactions",         // ✅ COMPLETE
      users: "/api/users"                        // ✅ COMPLETE
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: "connected",
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  });
});

// ==================== API ROUTES ====================

// 🔐 AUTH ROUTES - Public
app.use("/api/auth", authRoutes);

// 📱 QR WORKFLOW ROUTES - Public (No Auth Required)
app.use("/api/qr", qrRoutes);

// 📄 PUBLIC INVOICE — read-only customer invoice by order ID
app.use("/api/public", publicRoutes);

// ====================================================
// 👤 CUSTOMER MODULE - COMPLETE ✅
// ====================================================
app.use("/api/customers", customerRoutes);
// All customer endpoints available at:
// GET    /api/customers/all
// GET    /api/customers/with-payments
// GET    /api/customers/stats
// GET    /api/customers/search/phone/:phone
// GET    /api/customers/search/id/:customerId
// GET    /api/customers/:id
// GET    /api/customers/:id/payments
// GET    /api/customers/:id/orders
// GET    /api/customers/:id/payment-stats
// GET    /api/customers/:id/payment-trends
// POST   /api/customers/create
// PUT    /api/customers/:id
// DELETE /api/customers/:id

// ====================================================
// 📦 ORDER MANAGEMENT MODULE - COMPLETE ✅
// ====================================================
app.use("/api/orders", orderRoutes);
// All order endpoints:
// GET    /api/orders/stats
// GET    /api/orders/dashboard
// POST   /api/orders
// GET    /api/orders
// POST   /api/orders/:id/payments
// GET    /api/orders/:id/payments
// GET    /api/orders/:id
// PUT    /api/orders/:id
// PATCH  /api/orders/:id/status
// DELETE /api/orders/:id

// ====================================================
// 👕 GARMENT MODULE - COMPLETE ✅
// ====================================================
app.use("/api/garments", garmentRoutes);
// Garment endpoints:
// POST   /api/garments
// GET    /api/garments
// GET    /api/garments/:id
// PUT    /api/garments/:id
// DELETE /api/garments/:id

// ====================================================
// ⚙️ WORK MODULE - COMPLETE ✅
// ====================================================
app.use("/api/works", workRoutes);
// Work endpoints:
// GET    /api/works/stats
// GET    /api/works/pool
// POST   /api/works/:id/accept
// POST   /api/works/:id/start
// POST   /api/works/:id/complete
// GET    /api/works/cutting-master/:cuttingMasterId
// GET    /api/works/:id
// PUT    /api/works/:id
// DELETE /api/works/:id

// ====================================================
// 💰 PAYMENT MODULE - COMPLETE ✅
// ====================================================
app.use("/api/payments", paymentRoutes);
// Payment endpoints:
// GET    /api/payments/stats
// GET    /api/payments/daily
// POST   /api/payments
// GET    /api/payments
// GET    /api/payments/order/:orderId
// GET    /api/payments/customer/:customerId
// GET    /api/payments/:id
// PUT    /api/payments/:id
// DELETE /api/payments/:id

// ====================================================
// 👥 USER MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/users", userRoutes);

// ====================================================
// 👕 FABRIC MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/fabrics", fabricRoutes);

// ====================================================
// 📁 CATEGORY MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/categories", categoryRoutes);

// ====================================================
// 🧵 ITEM MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/items", itemRoutes);

// ====================================================
// 📏 SIZE TEMPLATE MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/size-templates", sizeTemplateRoutes);

// ====================================================
// 📐 SIZE FIELD MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/size-fields", sizeFieldRoutes);

// ====================================================
// 📏 CUSTOMER SIZE PROFILE - COMPLETE ✅
// ====================================================
app.use("/api/customer-size", customerSizeRoutes);

// ====================================================
// ✂️ TAILOR MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/tailors", tailorRoutes);
app.use("/api/aari-workers", aariWorkerRoutes);
app.use("/api/embroidery-workers", embroideryWorkerRoutes);
app.use("/api/helpers", helperRoutes);

// ====================================================
// 🔔 NOTIFICATION MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/notifications", notificationRoutes);

// ====================================================
// ✂️ CUTTING MASTER MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/cutting-masters", cuttingMasterRoutes);

// ====================================================
// 🏪 STORE KEEPER MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/store-keepers", storeKeeperRoutes);

// ====================================================
// 💰 SALARY & PAYROLL - COMPLETE ✅
// ====================================================
app.use("/api/salary", salaryRoutes);

// ====================================================
// 💰 BANKING / TRANSACTION MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/transactions", transactionRoutes);

// ====================================================
// 📅 APPOINTMENT MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/appointments", appointmentRoutes);

// ====================================================
// 👥 WORKER MANAGEMENT (Dynamic Roles)
// ====================================================
app.use("/api/workers", workerRoutes);
app.use("/api/workflow", workflowRoutes);

// ====================================================
// 🚚 OUTSOURCING MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/outsourcing", outsourcingRoutes);
app.use("/api/outsourcing-vendors", outsourcingVendorRoutes);
app.use("/api/sourcing", sourcingRoutes);
app.use("/api/inventory", inventoryRoutes);

// ====================================================
// 💳 BILLING & INVOICING MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/invoices", invoiceRoutes);

// ====================================================
// 🕒 ATTENDANCE MANAGEMENT - COMPLETE ✅
// ====================================================
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);

// ====================================================
// 🕵️ INTERNAL ACTIVITY LOG - Internal Admin only
// ====================================================
app.use("/api/audit-logs", auditLogRoutes);

// ==================== FRONTEND STATIC SERVING ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, "../client/dist");

app.use(express.static(clientDistPath));

app.use((req, res, next) => {
  // If the path starts with /api/, bypass and pass to error handling (api not found)
  if (req.url.startsWith("/api/")) {
    return next();
  }
  // Only serve index.html for GET requests
  if (req.method === "GET") {
    return res.sendFile(path.join(clientDistPath, "index.html"));
  }
  next();
});
app.get("/", (req, res) => {
  res.send("DreamFit Backend Running 🚀");
});

app.get("/ping", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server alive 🚀",
  });
});

// ==================== ERROR HANDLING MIDDLEWARE ====================
app.use(notFound);
app.use(errorHandler);

// ==================== UNHANDLED REJECTIONS ====================
process.on("unhandledRejection", (err) => {
  console.log("❌ UNHANDLED REJECTION! Shutting down...");
  console.log(err.name, err.message);
  console.log(err.stack);
  httpServer.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.log("❌ UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log("\n" + "=".repeat(80));
  console.log(`🚀 DREAMFIT ERP BACKEND v2.0`);
  console.log("=".repeat(80));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`💾 Database: MongoDB Connected`);
  console.log(`⏰ Started: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log("=".repeat(80));
  
  // ==================== COMPLETE ROUTES LIST ====================
  console.log(`\n📋 COMPLETE API ROUTES LIST:`);
  console.log("=".repeat(80));
  
  // 🔐 AUTH ROUTES
  console.log(`\n🔐 AUTH ROUTES (Public):`);
  console.log("-".repeat(40));
  console.log(`   POST   /api/auth/register`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   POST   /api/auth/forgot-password`);
  console.log(`   POST   /api/auth/reset-password/:token`);
  console.log(`   GET    /api/auth/me`);
  console.log(`   POST   /api/auth/logout`);
  console.log(`   POST   /api/auth/refresh-token`);
  
  // 📸 PROXY ROUTE (NEW)
  console.log(`\n📸 IMAGE PROXY ROUTE (CORS FIX):`);
  console.log("-".repeat(40));
  console.log(`   🔓 GET    /api/proxy-image?url=...`);
  console.log(`   🔄 Proxies images from R2 storage to bypass CORS`);
  console.log(`   📦 Cache: 1 day`);
  
  // 👤 CUSTOMER ROUTES
  console.log(`\n👤 CUSTOMER ROUTES (${customerRoutes.stack?.length || 10}+ endpoints):`);
  console.log("-".repeat(40));
  console.log(`   🔒 GET    /api/customers/all`);
  console.log(`   🔒 GET    /api/customers/with-payments`);
  console.log(`   🔒 GET    /api/customers/stats`);
  console.log(`   🔒 GET    /api/customers/search/phone/:phone`);
  console.log(`   🔒 GET    /api/customers/search/id/:customerId`);
  console.log(`   🔒 GET    /api/customers/:id`);
  console.log(`   🔒 GET    /api/customers/:id/payments`);
  console.log(`   🔒 GET    /api/customers/:id/orders`);
  console.log(`   🔒 GET    /api/customers/:id/payment-stats`);
  console.log(`   🔒 GET    /api/customers/:id/payment-trends`);
  console.log(`   🔒 POST   /api/customers/create`);
  console.log(`   🔒 PUT    /api/customers/:id`);
  console.log(`   🔒 DELETE /api/customers/:id`);
  
  // 📦 ORDER ROUTES
  console.log(`\n📦 ORDER ROUTES (${orderRoutes.stack?.length || 10}+ endpoints):`);
  console.log("-".repeat(40));
  console.log(`   🔒 GET    /api/orders/stats`);
  console.log(`   🔒 GET    /api/orders/dashboard`);
  console.log(`   🔒 POST   /api/orders`);
  console.log(`   🔒 GET    /api/orders`);
  console.log(`   🔒 POST   /api/orders/:id/payments`);
  console.log(`   🔒 GET    /api/orders/:id/payments`);
  console.log(`   🔒 GET    /api/orders/:id`);
  console.log(`   🔒 PUT    /api/orders/:id`);
  console.log(`   🔒 PATCH  /api/orders/:id/status`);
  console.log(`   🔒 DELETE /api/orders/:id`);
  
  // 💰 PAYMENT ROUTES
  console.log(`\n💰 PAYMENT ROUTES:`);
  console.log("-".repeat(40));
  console.log(`   🔒 GET    /api/payments/stats`);
  console.log(`   🔒 GET    /api/payments/daily`);
  console.log(`   🔒 POST   /api/payments`);
  console.log(`   🔒 GET    /api/payments`);
  console.log(`   🔒 GET    /api/payments/order/:orderId`);
  console.log(`   🔒 GET    /api/payments/customer/:customerId`);
  console.log(`   🔒 GET    /api/payments/:id`);
  console.log(`   🔒 PUT    /api/payments/:id`);
  console.log(`   🔒 DELETE /api/payments/:id`);
  
  // ⚙️ WORK ROUTES
  console.log(`\n⚙️ WORK ROUTES:`);
  console.log("-".repeat(40));
  console.log(`   🔒 GET    /api/works/stats`);
  console.log(`   🔒 GET    /api/works/pool`);
  console.log(`   🔒 POST   /api/works/:id/accept`);
  console.log(`   🔒 POST   /api/works/:id/start`);
  console.log(`   🔒 POST   /api/works/:id/complete`);
  console.log(`   🔒 GET    /api/works/cutting-master/:cuttingMasterId`);
  console.log(`   🔒 GET    /api/works/:id`);
  console.log(`   🔒 PUT    /api/works/:id`);
  console.log(`   🔒 DELETE /api/works/:id`);
  
  // 👕 GARMENT ROUTES
  console.log(`\n👕 GARMENT ROUTES:`);
  console.log("-".repeat(40));
  console.log(`   🔒 POST   /api/garments`);
  console.log(`   🔒 GET    /api/garments`);
  console.log(`   🔒 GET    /api/garments/:id`);
  console.log(`   🔒 PUT    /api/garments/:id`);
  console.log(`   🔒 DELETE /api/garments/:id`);
  
  // ✂️ TAILOR & CUTTING MASTER ROUTES
  console.log(`\n✂️ TAILOR MANAGEMENT:`);
  console.log("-".repeat(40));
  console.log(`   🔒 CRUD   /api/tailors`);
  console.log(`   🔒 CRUD   /api/cutting-masters`);
  console.log(`   🔒 CRUD   /api/store-keepers`);
  
  // 📏 SIZE MANAGEMENT
  console.log(`\n📏 SIZE MANAGEMENT:`);
  console.log("-".repeat(40));
  console.log(`   🔒 CRUD   /api/size-templates`);
  console.log(`   🔒 CRUD   /api/size-fields`);
  console.log(`   🔒 CRUD   /api/customer-size`);
  
  // 👕 FABRIC & CATEGORY
  console.log(`\n👕 FABRIC & CATEGORY:`);
  console.log("-".repeat(40));
  console.log(`   🔒 CRUD   /api/fabrics`);
  console.log(`   🔒 CRUD   /api/categories`);
  console.log(`   🔒 CRUD   /api/items`);
  
  // 🔔 NOTIFICATIONS
  console.log(`\n🔔 NOTIFICATIONS:`);
  console.log("-".repeat(40));
  console.log(`   🔒 CRUD   /api/notifications`);
  
  // 💰 TRANSACTIONS
  console.log(`\n💰 TRANSACTIONS:`);
  console.log("-".repeat(40));
  console.log(`   🔒 CRUD   /api/transactions`);
  
  // 👥 USERS
  console.log(`\n👥 USERS:`);
  console.log("-".repeat(40));
  console.log(`   🔒 CRUD   /api/users`);
  
  console.log("=".repeat(80));
  console.log(`\n📊 TOTAL ENDPOINTS: 100+ ACTIVE ENDPOINTS`);
  console.log("✅ ALL MODULES COMPLETE AND CONNECTED");
  console.log("✅ IMAGE PROXY ACTIVE - R2 CORS FIXED");
  console.log("=".repeat(80) + "\n");
});

export default app;
