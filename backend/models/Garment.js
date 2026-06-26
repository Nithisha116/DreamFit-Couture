// import mongoose from "mongoose";

// const measurementSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   value: { type: Number },
//   unit: { type: String, default: "inches" },
// }, { _id: false });

// const imageSchema = new mongoose.Schema({
//   url: { type: String, required: true },
//   key: { type: String }, // R2 key for deletion
// }, { _id: false });

// const garmentSchema = new mongoose.Schema({
//   // ✅ Unique Garment ID (Format: GRMYYYYMMDD001)
//   garmentId: {
//     type: String,
//     unique: true,
//   },
//   order: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Order",
//     required: [true, "Order reference is required"],
//   },
//   name: {
//     type: String,
//     required: [true, "Garment name is required"],
//     trim: true
//   },
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Category",
//     required: [true, "Category is required"],
//   },
//   item: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Item",
//     required: [true, "Item is required"],
//   },
//   measurementTemplate: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "SizeTemplate",
//   },
//   measurementSource: {
//     type: String,
//     enum: ["customer", "manual", "template"],
//     default: "template",
//   },
//   measurements: [measurementSchema],
  
//   // ✅ 3-Type Image Logic for Cutting Master
//   referenceImages: [imageSchema],      // Studio/Designer references
//   customerImages: [imageSchema],       // WhatsApp/Email digital images
//   customerClothImages: [imageSchema],  // Photos of physical cloth (CRITICAL for Cutting Master)
  
//   additionalInfo: {
//     type: String,
//     default: "",
//   },
//   estimatedDelivery: {
//     type: Date,
//     required: [true, "Delivery date is required"],
//   },
//   priority: {
//     type: String,
//     enum: ["high", "normal", "low"],
//     default: "normal",
//     index: true
//   },
//   priceRange: {
//     min: { type: Number, required: true, default: 0 },
//     max: { type: Number, required: true, default: 0 },
//   },
//   // ✅ Sync with Cutting Master logic
//   status: {
//     type: String,
//     enum: ["pending", "accepted", "cutting", "stitching", "ironing", "ready_to_deliver"],
//     default: "pending",
//     index: true
//   },
//   workId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Work",
//   },
//   isActive: {
//     type: Boolean,
//     default: true,
//   },
// }, { 
//   timestamps: true,
//   // ✅ Prevents "garmentId is required" error before it's generated
//   validateBeforeSave: false 
// });

// // ✅ MODERN ASYNC PRE-SAVE (No 'next' parameter)
// garmentSchema.pre('save', async function() {
//   try {
//     // 1. Generate Garment ID if not exists
//     if (!this.garmentId) {
//       console.log("📝 Generating new Garment ID...");
//       const date = new Date();
//       const day = String(date.getDate()).padStart(2, '0');
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const year = date.getFullYear();
      
//       const count = await mongoose.model("Garment").countDocuments();
//       const sequence = String(count + 1).padStart(3, '0');
      
//       this.garmentId = `GRM${year}${month}${day}${sequence}`;
//       console.log(`🆔 Generated Garment ID: ${this.garmentId}`);
//     }

//     // 2. Manual Validation
//     await this.validate();
    
//   } catch (error) {
//     console.error("❌ Error in Garment pre-save hook:", error);
//     throw error;
//   }
// });

// // ✅ Indexes for Work Page Performance
// garmentSchema.index({ garmentId: 1 });
// garmentSchema.index({ order: 1 });
// garmentSchema.index({ status: 1 });

// const Garment = mongoose.model("Garment", garmentSchema);
// export default Garment;

import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String },
  unit: { type: String, default: "inches" },
}, { _id: false });

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  key: { type: String }, 
}, { _id: false });

const garmentSchema = new mongoose.Schema({
  garmentId: {
    type: String,
    unique: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: [true, "Order reference is required"],
  },
  name: {
    type: String,
    required: [true, "Garment name is required"],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Category is required"],
  },
  categoryName: {
    type: String,
    trim: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: [true, "Item is required"],
  },
  itemName: {
    type: String,
    trim: true,
  },
  measurementTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SizeTemplate",
  },
  measurementSource: {
    type: String,
    enum: ["customer", "manual", "template"],
    default: "template",
  },
  measurements: [measurementSchema],
  referenceImages: [imageSchema],      
  customerImages: [imageSchema],       
  customerClothImages: [imageSchema],  
  fabricSource: {
    type: String,
    enum: ["customer", "shop"],
    default: "customer"
  },
  fabricPrice: {
    type: Number,
    default: 0
  },
  fabricMeters: {
    type: String,
    default: ""
  },
  fabricNotes: {
    type: String,
    default: ""
  },
  fabricSufficiency: {
    type: String,
    enum: ["Sufficient", "Additional Fabric Required", "To Be Verified"],
    default: "To Be Verified"
  },
  additionalInfo: {
    type: String,
    default: "",
  },
  estimatedDelivery: {
    type: Date,
    required: [true, "Delivery date is required"],
  },
  priority: {
    type: String,
    enum: ["high", "normal", "low"],
    default: "normal",
    index: true
  },
  priceRange: {
    min: { type: Number, required: true, default: 0 },
    max: { type: Number, required: true, default: 0 },
  },
  finalizedPrice: {
    type: Number,
    default: null,
  },
  minPrice: {
    type: Number,
    default: 0,
  },
  maxPrice: {
    type: Number,
    default: 0,
  },
  finalizedAmount: {
    type: Number,
    default: null,
  },
  additionalCharges: {
    type: Number,
    default: 0,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  discountType: {
    type: String,
    enum: ["flat", "percentage", "none"],
    default: "none",
  },
  priceBreakdown: {
    tailoringPriceMin: { type: Number, default: 0 },
    tailoringPriceMax: { type: Number, default: 0 },
    fabricPrice: { type: Number, default: 0 },
    additionalCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountType: { type: String, default: "none" },
    quantity: { type: Number, default: 1 },
    garmentTotalMin: { type: Number, default: 0 },
    garmentTotalMax: { type: Number, default: 0 },
    calculatedAt: { type: Date },
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "cutting", "stitching", "ironing", "ready_to_deliver"],
    default: "pending",
    index: true
  },
  selectedFabric: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fabric",
    default: null
  },
  workId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Work",
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  /** Per-garment production pipeline (new orders). Legacy orders use order.workflowStages. */
  stageKeys: {
    type: [String],
    default: [],
  },
  workflowStages: {
    type: [
      {
        key: String,
        label: String,
        order: Number,
      },
    ],
    default: [],
  },
}, { 
  timestamps: true,
  validateBeforeSave: true 
});

// ✅ Sync legacy and new price fields before validation with strict checks
garmentSchema.pre('validate', function(next) {
  // Sync priceRange with minPrice/maxPrice in a clean way
  if (this.priceRange) {
    if (this.priceRange.min !== undefined) this.minPrice = Number(this.priceRange.min);
    if (this.priceRange.max !== undefined) this.maxPrice = Number(this.priceRange.max);
  } else if (this.minPrice !== undefined || this.maxPrice !== undefined) {
    this.priceRange = {
      min: this.minPrice || 0,
      max: this.maxPrice || 0
    };
  }

  // Strict range-based validation
  if (this.minPrice > this.maxPrice) {
    const err = new Error("Invalid price range: Minimum price cannot exceed maximum price.");
    if (typeof next === 'function') return next(err);
    throw err;
  }

  if (typeof next === 'function') {
    next();
  }
});

// ✅ FIXED PRE-SAVE: Removed 'next' to avoid "next is not a function" error
garmentSchema.pre('save', async function() {
  // If not new or ID already exists, just return
  if (!this.isNew || this.garmentId) return;

  try {
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      attempts++;
      
      const date = new Date();
      const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
      
      // Using high precision for uniqueness
      const timestamp = Date.now().toString().slice(-4);
      const random = Math.floor(1000 + Math.random() * 9000); 
      
      const candidateId = `GRM${dateStr}-${timestamp}-${random}`;

      // 🔍 Check collision in DB
      const existing = await mongoose.model("Garment").findOne({ garmentId: candidateId });
      if (!existing) {
        this.garmentId = candidateId;
        isUnique = true;
      }
    }

    if (!isUnique) {
      throw new Error("Failed to generate unique ID after 10 attempts");
    }

  } catch (error) {
    console.error("❌ Garment ID Generation Error:", error);
    throw error; // This will stop the save and return error to controller
  }
});

// Indexes for performance
garmentSchema.index({ order: 1 });

const Garment = mongoose.model("Garment", garmentSchema);
export default Garment;