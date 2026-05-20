// // backend/models/StoreKeeper.js
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const addressSchema = new mongoose.Schema({
//   street: String,
//   city: String,
//   state: String,
//   pincode: String
// }, { _id: false });

// const inventoryStatsSchema = new mongoose.Schema({
//   totalOrders: { type: Number, default: 0 },
//   processedOrders: { type: Number, default: 0 },
//   pendingOrders: { type: Number, default: 0 }
// }, { _id: false });

// // ✅ Generate storeKeeperId function
// async function generateStoreKeeperId() {
//   const date = new Date();
//   const year = date.getFullYear().toString().slice(-2);
//   const month = String(date.getMonth() + 1).padStart(2, '0');
  
//   const count = await mongoose.model("StoreKeeper").countDocuments();
//   const sequence = String(count + 1).padStart(4, '0');
  
//   return `SK${year}${month}${sequence}`; // SK24020001
// }

// const storeKeeperSchema = new mongoose.Schema({
//   // ✅ ID Fields
//   storeKeeperId: {
//     type: String,
//     unique: true,
//     required: true 
//   },
  
//   // ✅ Personal Information
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//     index: true
//   },
//   phone: {
//     type: String,
//     required: true,
//     trim: true,
//     index: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//     index: true
//   },
  
//   // ✅ Authentication
//   password: {
//     type: String,
//     required: true,
//     select: false
//   },
  
//   // ✅ Address
//   address: addressSchema,
  
//   // ✅ Professional Info
//   department: {
//     type: String,
//     enum: ["inventory", "sales", "both"],
//     default: "both"
//   },
//   experience: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 50
//   },
//   joiningDate: {
//     type: Date,
//     default: Date.now
//   },
  
//   // ✅ Status Management
//   isActive: {
//     type: Boolean,
//     default: true,
//     index: true
//   },
  
//   // ✅ Work Statistics
//   stats: {
//     type: inventoryStatsSchema,
//     default: () => ({})
//   },
  
//   // ✅ Relationships
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     index: true
//   }
// }, { 
//   timestamps: true,
//   validateBeforeSave: false
// });

// // ✅ Pre-save hook
// storeKeeperSchema.pre('save', async function() {
//   try {
//     console.log("🔧 StoreKeeper pre-save hook triggered");
    
//     if (!this.storeKeeperId) {
//       console.log("📝 Generating new storeKeeperId...");
//       this.storeKeeperId = await generateStoreKeeperId();
//       console.log(`✅ Generated storeKeeperId: ${this.storeKeeperId}`);
//     }

//     if (this.isModified('password') && this.password) {
//       const salt = await bcrypt.genSalt(10);
//       this.password = await bcrypt.hash(this.password, salt);
//       console.log("🔐 Password hashed");
//     }

//     await this.validate();
    
//   } catch (error) {
//     console.error("❌ Error in pre-save hook:", error);
//     throw error;
//   }
// });

// // ✅ Password comparison method
// storeKeeperSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // ✅ Indexes
// storeKeeperSchema.index({ createdAt: -1 });
// storeKeeperSchema.index({ department: 1 });

// const StoreKeeper = mongoose.model("StoreKeeper", storeKeeperSchema);
// console.log("✅ StoreKeeper model registered");

// export default StoreKeeper;























// backend/models/StoreKeeper.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  pincode: String
}, { _id: false });

const inventoryStatsSchema = new mongoose.Schema({
  totalOrders: { type: Number, default: 0 },
  processedOrders: { type: Number, default: 0 },
  pendingOrders: { type: Number, default: 0 }
}, { _id: false });

// ✅ Generate storeKeeperId function
async function generateStoreKeeperId() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const count = await mongoose.model("StoreKeeper").countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  
  return `SK${year}${month}${sequence}`; // SK24020001
}

const storeKeeperSchema = new mongoose.Schema({
  // ✅ ID Fields
  storeKeeperId: {
    type: String,
    unique: true,
    required: true 
  },
  
  // ✅ Personal Information
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    index: true  // ✅ Index for phone lookups
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true  // ✅ Index for email lookups
  },
  
  // ✅ Authentication
  password: {
    type: String,
    required: true,
    select: false
  },
  
  // ✅ Address
  address: addressSchema,
  
  // ✅ Professional Info
  department: {
    type: String,
    enum: ["inventory", "sales", "both"],
    default: "both"
  },
  experience: {
    type: Number,
    default: 0,
    min: 0,
    max: 50
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  basicSalary: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // ✅ Status Management
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  leaveBalance: {
    casual: { type: Number, default: 12 },
    sick: { type: Number, default: 10 },
    paid: { type: Number, default: 15 }
  },
  
  // ✅ Work Statistics
  stats: {
    type: inventoryStatsSchema,
    default: () => ({})
  },
  
  // ✅ Relationships
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },
  
  // ✅ Last login tracking (important for login optimization)
  lastLogin: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true,
  validateBeforeSave: false
});

// ✅ Pre-save hook
storeKeeperSchema.pre('save', async function() {
  try {
    console.log("🔧 StoreKeeper pre-save hook triggered");
    
    if (!this.storeKeeperId) {
      console.log("📝 Generating new storeKeeperId...");
      this.storeKeeperId = await generateStoreKeeperId();
      console.log(`✅ Generated storeKeeperId: ${this.storeKeeperId}`);
    }

    if (this.isModified('password') && this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      console.log("🔐 Password hashed");
    }

    await this.validate();
    
  } catch (error) {
    console.error("❌ Error in pre-save hook:", error);
    throw error;
  }
});

// ✅ Password comparison method
storeKeeperSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ COMPOUND INDEX FOR FASTER LOGIN SEARCHES
// This allows MongoDB to efficiently handle queries that search by email OR phone
storeKeeperSchema.index({ email: 1, phone: 1 });

// ✅ Additional indexes for better performance
storeKeeperSchema.index({ createdAt: -1 });
storeKeeperSchema.index({ department: 1 });
storeKeeperSchema.index({ isActive: 1, department: 1 }); // Compound index for common queries

const StoreKeeper = mongoose.model("StoreKeeper", storeKeeperSchema);
console.log("✅ StoreKeeper model registered");

export default StoreKeeper;