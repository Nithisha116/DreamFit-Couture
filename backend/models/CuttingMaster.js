// // backend/models/CuttingMaster.js
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const addressSchema = new mongoose.Schema({
//   street: String,
//   city: String,
//   state: String,
//   pincode: String
// }, { _id: false });

// const workStatsSchema = new mongoose.Schema({
//   totalAssigned: { type: Number, default: 0 },
//   completed: { type: Number, default: 0 },
//   pending: { type: Number, default: 0 },
//   inProgress: { type: Number, default: 0 }
// }, { _id: false });

// // ✅ Generate cuttingMasterId function
// async function generateCuttingMasterId() {
//   const date = new Date();
//   const year = date.getFullYear().toString().slice(-2);
//   const month = String(date.getMonth() + 1).padStart(2, '0');
  
//   const count = await mongoose.model("CuttingMaster").countDocuments();
//   const sequence = String(count + 1).padStart(4, '0');
  
//   return `CM${year}${month}${sequence}`; // CM24020001
// }

// const cuttingMasterSchema = new mongoose.Schema({
//   // ✅ ID Fields
//   cuttingMasterId: {
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
//   specialization: [String],
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
//   isAvailable: {
//     type: Boolean,
//     default: true,
//     index: true
//   },
  
//   // ✅ Work Statistics
//   workStats: {
//     type: workStatsSchema,
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
// cuttingMasterSchema.pre('save', async function() {
//   try {
//     console.log("🔧 CuttingMaster pre-save hook triggered");
    
//     if (!this.cuttingMasterId) {
//       console.log("📝 Generating new cuttingMasterId...");
//       this.cuttingMasterId = await generateCuttingMasterId();
//       console.log(`✅ Generated cuttingMasterId: ${this.cuttingMasterId}`);
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
// cuttingMasterSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // ✅ Indexes
// cuttingMasterSchema.index({ createdAt: -1 });
// cuttingMasterSchema.index({ "workStats.totalAssigned": -1 });

// const CuttingMaster = mongoose.model("CuttingMaster", cuttingMasterSchema);
// console.log("✅ CuttingMaster model registered");

// export default CuttingMaster;












// backend/models/CuttingMaster.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  pincode: String
}, { _id: false });

const workStatsSchema = new mongoose.Schema({
  totalAssigned: { type: Number, default: 0 },
  completed: { type: Number, default: 0 },
  pending: { type: Number, default: 0 },
  inProgress: { type: Number, default: 0 }
}, { _id: false });

// ✅ Generate cuttingMasterId function
async function generateCuttingMasterId() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const count = await mongoose.model("CuttingMaster").countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  
  return `CM${year}${month}${sequence}`; // CM24020001
}

const cuttingMasterSchema = new mongoose.Schema({
  // ✅ ID Fields
  cuttingMasterId: {
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
  specialization: [String],
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
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // ✅ Work Statistics
  workStats: {
    type: workStatsSchema,
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
cuttingMasterSchema.pre('save', async function() {
  try {
    console.log("🔧 CuttingMaster pre-save hook triggered");
    
    if (!this.cuttingMasterId) {
      console.log("📝 Generating new cuttingMasterId...");
      this.cuttingMasterId = await generateCuttingMasterId();
      console.log(`✅ Generated cuttingMasterId: ${this.cuttingMasterId}`);
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
cuttingMasterSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ COMPOUND INDEX FOR FASTER LOGIN SEARCHES
// This allows MongoDB to efficiently handle queries that search by email OR phone
cuttingMasterSchema.index({ email: 1, phone: 1 });

// ✅ Additional indexes for better performance
cuttingMasterSchema.index({ createdAt: -1 });
cuttingMasterSchema.index({ "workStats.totalAssigned": -1 });
cuttingMasterSchema.index({ isActive: 1, isAvailable: 1 }); // Compound index for filtering

const CuttingMaster = mongoose.model("CuttingMaster", cuttingMasterSchema);
console.log("✅ CuttingMaster model registered");

export default CuttingMaster;