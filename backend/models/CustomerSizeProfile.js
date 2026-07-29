// backend/models/CustomerSizeProfile.js
import mongoose from "mongoose";

const customerSizeProfileSchema = new mongoose.Schema({
  // 1. Customer Reference (Required)
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer", // Your existing Customer model
    required: [true, "Customer is required"],
    index: true
  },

  // 2. Profile Name (Optional - auto generated if not given)
  profileName: {
    type: String,
    trim: true,
    default: function() {
      return `${this.garmentType || 'Size'} Profile - ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
    }
  },

  // 3. Template Reference (Optional - if using templates)
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SizeTemplate"
  },

  // 4. Garment Type (shirt, pant, kurta, etc)
  garmentType: {
    type: String,
    default: "general"
  },

  // 5. Main Measurements Array (Flexible - can store any fields)
  measurements: [{
    fieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SizeField"
    },
    fieldName: {
      type: String,
      required: true
    },
    fieldDisplayName: String,
    value: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      default: "cm",
      enum: ["cm", "inch"]
    }
  }],

  // 6. Quick Access Object (Easy to use in orders)
  measurements_object: {
    type: Map,
    of: String,
    default: {}
  },

  // 7. Version Control
  version: {
    type: Number,
    default: 1
  },

  // 8. Change History (Track all updates)
  measurementHistory: [{
    version: Number,
    measurements: [{
      fieldName: String,
      value: String,
      unit: String
    }],
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    changeReason: {
      type: String,
      enum: ["initial", "update", "correction", "weight_change", "style_change"],
      default: "initial"
    },
    notes: String
  }],

  // 9. Usage Tracking
  lastUsed: Date,
  usageCount: {
    type: Number,
    default: 0
  },

  // 10. Orders using this profile
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  }],

  // 11. Status
  isActive: {
    type: Boolean,
    default: true
  },

  // 12. Additional Info
  notes: String,
  tags: [String]

}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ========== INDEXES (For Faster Queries) ==========
customerSizeProfileSchema.index({ customer: 1, isActive: 1 });
customerSizeProfileSchema.index({ customer: 1, garmentType: 1 });
customerSizeProfileSchema.index({ lastUsed: -1 });
customerSizeProfileSchema.index({ usageCount: -1 });

// ========== VIRTUALS (Calculated Fields) ==========

// Profile age in months
customerSizeProfileSchema.virtual('ageInMonths').get(function() {
  const months = (new Date() - this.updatedAt) / (1000 * 60 * 60 * 24 * 30);
  return Math.round(months * 10) / 10;
});

// Last update info
customerSizeProfileSchema.virtual('lastUpdate').get(function() {
  return this.measurementHistory[this.measurementHistory.length - 1];
});

// Check if measurements are old (>3 months)
customerSizeProfileSchema.virtual('isOld').get(function() {
  const months = this.ageInMonths;
  return months > 3;
});

// ========== METHODS (Functions) ==========

// Update measurements with history tracking
customerSizeProfileSchema.methods.updateMeasurements = async function(
  newMeasurements,
  userId,
  reason = 'update',
  notes = ''
) {
  // Save current measurements to history
  this.measurementHistory.push({
    version: this.version,
    measurements: this.measurements.map(m => ({
      fieldName: m.fieldName,
      value: m.value,
      unit: m.unit
    })),
    changedAt: new Date(),
    changedBy: userId,
    changeReason: reason,
    notes: notes
  });

  // Update measurements
  this.measurements = newMeasurements;
  
  // Update measurements_object
  const obj = {};
  newMeasurements.forEach(m => {
    obj[m.fieldName] = m.value;
  });
  this.measurements_object = obj;
  
  // Increment version
  this.version += 1;
  
  return this.save();
};

// Mark profile as used
customerSizeProfileSchema.methods.markAsUsed = async function() {
  this.lastUsed = new Date();
  this.usageCount += 1;
  return this.save();
};

// ========== STATICS (Model-level functions) ==========

// Find all profiles for a customer
customerSizeProfileSchema.statics.findByCustomer = function(customerId) {
  return this.find({ 
    customer: customerId, 
    isActive: true 
  })
  .populate('template', 'name')
  .sort({ lastUsed: -1, updatedAt: -1 });
};

// Find recently used profiles
customerSizeProfileSchema.statics.findRecent = function(limit = 10) {
  return this.find({ isActive: true })
    .populate('customer', 'name phone')
    .sort({ lastUsed: -1 })
    .limit(limit);
};

// Find profiles that need update (older than 3 months)
customerSizeProfileSchema.statics.findOldProfiles = function() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  return this.find({
    updatedAt: { $lt: threeMonthsAgo },
    isActive: true
  }).populate('customer', 'name phone');
};

// ========== MIDDLEWARE ==========

// Pre-save: Update measurements_object
customerSizeProfileSchema.pre('save', async function() {
  if (this.measurements && this.measurements.length > 0) {
    const obj = {};
    this.measurements.forEach(m => {
      obj[m.fieldName] = m.value;
    });
    this.measurements_object = obj;
  }
});

// Pre-save: Set default profile name if not provided
customerSizeProfileSchema.pre('save', async function() {
  if (!this.profileName) {
    this.profileName = `${this.garmentType} Profile - ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
  }
});

const CustomerSizeProfile = mongoose.model("CustomerSizeProfile", customerSizeProfileSchema);
export default CustomerSizeProfile;