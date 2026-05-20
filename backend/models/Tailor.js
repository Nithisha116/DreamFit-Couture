// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const addressSchema = new mongoose.Schema({
//   street: String,
//   city: String,
//   state: String,
//   pincode: String
// }, { _id: false });

// const feedbackSchema = new mongoose.Schema({
//   date: { type: Date, default: Date.now },
//   comment: String,
//   rating: { type: Number, min: 0, max: 5 },
//   from: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
// }, { _id: false });

// const performanceSchema = new mongoose.Schema({
//   rating: { type: Number, min: 0, max: 5, default: 0 },
//   feedback: [feedbackSchema]
// }, { _id: false });

// const workStatsSchema = new mongoose.Schema({
//   totalAssigned: { type: Number, default: 0 },
//   completed: { type: Number, default: 0 },
//   pending: { type: Number, default: 0 },
//   inProgress: { type: Number, default: 0 }
// }, { _id: false });

// const tailorSchema = new mongoose.Schema({
//   tailorId: {
//     type: String,
//     unique: true,
//     required: true 
//   },
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
//     unique: true,
//     sparse: true,
//     lowercase: true,
//     trim: true,
//     index: true
//   },
//   password: {
//     type: String,
//     required: true,
//     select: false 
//   },
//   address: addressSchema,
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
//   isActive: {
//     type: Boolean,
//     default: true,
//     index: true
//           return value >= this.leaveFrom;
//         }
//         return true;
//       },
//       message: "Leave 'To' date cannot be before 'From' date."
//     }
//   },
//   leaveReason: String,
//   workStats: {
//     type: workStatsSchema,
//     default: () => ({})
//   },
//   performance: {
//     type: performanceSchema,
//     default: () => ({})
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     index: true
//   }
// }, { 
//   timestamps: true,
//   // ✅ IMPORTANT: This allows us to generate the ID before validation kicks in
//   validateBeforeSave: false 
// });

// // ✅ FIXED: Modern Async Pre-save (NO 'next' parameter)
// tailorSchema.pre('save', async function() {
//   try {
//     console.log("🔧 Pre-save hook triggered");

//     // 1. Generate tailorId if not exists
//     if (!this.tailorId) {
//       console.log("📝 Generating new tailorId...");
//       const date = new Date();
//       const year = date.getFullYear().toString().slice(-2);
//       const month = String(date.getMonth() + 1).padStart(2, '0');
      
//       const count = await mongoose.model("Tailor").countDocuments();
//       const sequence = String(count + 1).padStart(4, '0');
      
//       this.tailorId = `TLR${year}${month}${sequence}`;
//       console.log(`✅ Generated tailorId: ${this.tailorId}`);
//     }

//     // 2. Hash password if modified
//     if (this.isModified('password') && this.password) {
//       console.log("🔐 Hashing password...");
//       const salt = await bcrypt.genSalt(10);
//       this.password = await bcrypt.hash(this.password, salt);
//       console.log("✅ Password hashed successfully");
//     }

//     // 3. Manually trigger validation since validateBeforeSave is false
//     await this.validate();
    
//   } catch (error) {
//     console.error("❌ Error in pre-save hook:", error);
//     throw error; // Mongoose treats a thrown error in async hook as next(error)
//   }
// });

// // ✅ Method to compare password
// tailorSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // ✅ Virtual for full address
// tailorSchema.virtual('fullAddress').get(function() {
//   if (!this.address) return '';
//   const { street, city, state, pincode } = this.address;
//   return [street, city, state, pincode].filter(Boolean).join(', ');
// });

// tailorSchema.set('toJSON', { virtuals: true });
// tailorSchema.set('toObject', { virtuals: true });

// const Tailor = mongoose.model("Tailor", tailorSchema);
// export default Tailor;























import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  pincode: String
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  comment: String,
  rating: { type: Number, min: 0, max: 5 },
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { _id: false });

const performanceSchema = new mongoose.Schema({
  rating: { type: Number, min: 0, max: 5, default: 0 },
  feedback: [feedbackSchema]
}, { _id: false });

const workStatsSchema = new mongoose.Schema({
  totalAssigned: { type: Number, default: 0 },
  completed: { type: Number, default: 0 },
  pending: { type: Number, default: 0 },
  inProgress: { type: Number, default: 0 }
}, { _id: false });

const tailorSchema = new mongoose.Schema({
  tailorId: {
    type: String,
    unique: true,
    required: true 
  },
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
    index: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    select: false 
  },
  address: addressSchema,
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
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  leaveStatus: {
    type: String,
    enum: ["present", "leave", "half-day", "holiday"],
    default: "present",
    index: true
  },
  leaveBalance: {
    casual: { type: Number, default: 12 },
    sick: { type: Number, default: 10 },
    paid: { type: Number, default: 15 }
  },
  leaveFrom: Date,
  leaveTo: {
    type: Date,
    validate: {
      validator: function(value) {
        if (this.leaveFrom && value) {
          return value >= this.leaveFrom;
        }
        return true;
      },
      message: "Leave 'To' date cannot be before 'From' date."
    }
  },
  leaveReason: String,
  workStats: {
    type: workStatsSchema,
    default: () => ({})
  },
  performance: {
    type: performanceSchema,
    default: () => ({})
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  }
}, { 
  timestamps: true,
  validateBeforeSave: false 
});

// Pre-save hook
tailorSchema.pre('save', async function() {
  try {
    console.log("🔧 Pre-save hook triggered");

    // 1. Generate tailorId if not exists
    if (!this.tailorId) {
      console.log("📝 Generating new tailorId...");
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      const count = await mongoose.model("Tailor").countDocuments();
      const sequence = String(count + 1).padStart(4, '0');
      
      this.tailorId = `TLR${year}${month}${sequence}`;
      console.log(`✅ Generated tailorId: ${this.tailorId}`);
    }

    // 2. Hash password if modified
    if (this.isModified('password') && this.password) {
      console.log("🔐 Hashing password...");
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      console.log("✅ Password hashed successfully");
    }

    // 3. Manually trigger validation since validateBeforeSave is false
    await this.validate();
    
  } catch (error) {
    console.error("❌ Error in pre-save hook:", error);
    throw error;
  }
});

// Method to compare password
tailorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full address
tailorSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, pincode } = this.address;
  return [street, city, state, pincode].filter(Boolean).join(', ');
});

// ✅ ADD THIS - Compound index for faster login searches
tailorSchema.index({ email: 1, phone: 1 });

tailorSchema.set('toJSON', { virtuals: true });
tailorSchema.set('toObject', { virtuals: true });

const Tailor = mongoose.model("Tailor", tailorSchema);
export default Tailor;