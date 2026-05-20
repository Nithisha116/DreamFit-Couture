// // backend/models/User.js
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     // Personal Information
//     name: {
//       type: String,
//       required: [true, "Name is required"],
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: 6,
//     },

//     // ✅ CHANGED: Only ADMIN role allowed now
//     role: {
//       type: String,
//       enum: ["ADMIN"], // Only ADMIN role
//       default: "ADMIN",
//       required: true,
//     },

//     phone: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     // Account Status
//     isActive: {
//       type: Boolean,
//       default: true,
//     },

//     // Profile Fields
//     profileImage: {
//       type: String,
//       default: null,
//     },

//     address: {
//       street: { type: String, default: "" },
//       city: { type: String, default: "" },
//       state: { type: String, default: "" },
//       pincode: { type: String, default: "" },
//     },

//     // Metadata
//     lastLogin: {
//       type: Date,
//       default: null,
//     },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },

//     notes: {
//       type: String,
//       default: "",
//     },
//   },
//   { 
//     timestamps: true
//   }
// );

// const User = mongoose.model("User", userSchema);

// export default User;



// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Personal Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // ✅ ADD THIS - for faster email lookups
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["ADMIN"],
      default: "ADMIN",
      required: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      index: true, // ✅ ADD THIS - for faster phone lookups
      sparse: true, // Allows multiple null/empty values without unique constraint issues
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
      index: true, // ✅ OPTIONAL - useful for filtering active users
    },

    // Profile Fields
    profileImage: {
      type: String,
      default: null,
    },

    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },

    // Metadata
    lastLogin: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },
    basicSalary: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { 
    timestamps: true
  }
);

// ✅ ADD COMPOUND INDEX for combined email/phone searches (optional but beneficial)
userSchema.index({ email: 1, phone: 1 });

const User = mongoose.model("User", userSchema);

export default User;