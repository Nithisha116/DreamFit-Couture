import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    unique: true,
  },
  salutation: {
    type: String,
    enum: ["Mr.", "Mrs.", "Ms.", "Dr."],
    default: "Mr."
  },
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    trim: true
  },
  whatsappNumber: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  addressLine1: {
    type: String,
    required: [true, "Address is required"],
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  // ✅ NEW: Reference to measurement templates
  measurementTemplates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomerMeasurementTemplate"
  }],
  
  // ✅ NEW: Blacklist Feature
  isBlacklisted: {
    type: Boolean,
    default: false
  },
  blacklistReason: {
    type: String,
    trim: true
  },
  blacklistNotes: {
    type: String,
    trim: true
  },
  blacklistedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  blacklistedAt: {
    type: Date
  },
  blacklistHistory: [{
    action: {
      type: String,
      enum: ["BLACKLISTED", "UNBLACKLISTED"]
    },
    reason: String,
    notes: String,
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    adminName: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Computed fields (Stored in DB for fast searching)
  name: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  // ✅ Customer Overview Logic: Stats for dashboard
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ MODERN ASYNC PRE-SAVE
customerSchema.pre("save", async function() {
  try {
    console.log("🔧 Processing customer data for:", this.firstName);
    
    // 1. Generate customerId
    if (!this.customerId) {
      const year = new Date().getFullYear();
      
      // Find the customer with the highest customerId for the current year
      const lastCustomer = await mongoose.model("Customer").findOne({
        customerId: new RegExp(`^CUST-${year}-`)
      }).sort({ customerId: -1 });

      let nextSequence = 1;
      if (lastCustomer && lastCustomer.customerId) {
        const parts = lastCustomer.customerId.split('-');
        if (parts.length === 3) {
          nextSequence = parseInt(parts[2], 10) + 1;
        }
      }

      const sequential = String(nextSequence).padStart(5, "0");
      this.customerId = `CUST-${year}-${sequential}`;
      console.log(`✅ ID Created: ${this.customerId}`);
    }

    // 2. Compute full name
    this.name = `${this.salutation || ''} ${this.firstName || ''} ${this.lastName || ''}`.trim();
    
    // 3. Compute full address
    const addressParts = [
      this.addressLine1,
      this.addressLine2,
      this.city,
      this.state,
      this.pincode
    ].filter(Boolean);
    this.address = addressParts.join(', ');

  } catch (error) {
    console.error("❌ Pre-save logic failed:", error);
    throw error;
  }
});

// Virtual for formatted Name
customerSchema.virtual('fullName').get(function() {
  return `${this.salutation || ''} ${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Indexes for performance
customerSchema.index({ name: 1 });


const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;