import mongoose from "mongoose";

const customerMeasurementTemplateSchema = new mongoose.Schema({
  // Which customer owns this template
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: [true, "Customer is required"],
    index: true
  },
  
  // Template name (e.g., "Father Shirt Size", "Brother Kurta")
  name: {
    type: String,
    required: [true, "Template name is required"],
    trim: true
  },
  
  // The actual measurements stored as key-value pairs
  measurements: {
    type: Map,
    of: String,
    required: [true, "Measurements are required"]
  },
  
  // Optional reference to the garment that created this template
  garmentReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Garment"
  },
  
  // Optional notes about this template
  notes: {
    type: String,
    trim: true
  },
  
  // How many times this template has been used
  usageCount: {
    type: Number,
    default: 1
  },
  
  // When it was last used
  lastUsed: {
    type: Date,
    default: Date.now
  }
  
}, { 
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Compound index for faster queries
customerMeasurementTemplateSchema.index({ customer: 1, name: 1 }, { unique: true });

const CustomerMeasurementTemplate = mongoose.models.CustomerMeasurementTemplate || 
  mongoose.model("CustomerMeasurementTemplate", customerMeasurementTemplateSchema);

export default CustomerMeasurementTemplate;