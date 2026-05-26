import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  qty: { 
    type: Number, 
    default: 1,
    min: 1 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  total: { 
    type: Number, 
    required: true,
    min: 0 
  },
  minPrice: {
    type: Number,
    default: 0
  },
  maxPrice: {
    type: Number,
    default: 0
  }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  invoiceNumber: { 
    type: String, 
    unique: true, 
    required: true, 
    index: true 
  },
  orderId: {
    type: String,
    required: true,
    index: true
  },
  orderRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    index: true
  },
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Order", 
    required: true, 
    index: true 
  },
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Customer", 
    required: true, 
    index: true 
  },
  customerName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  invoiceType: {
    type: String,
    enum: ["Advance", "Partial", "Final"],
    default: "Final",
    index: true
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  balanceAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Partial", "Paid", "Pending", "Partial", "Paid", "pending", "partial", "paid", "refunded"],
    default: "Pending",
    index: true
  },
  notes: {
    type: String,
    default: ""
  },
  
  items: [invoiceItemSchema],
  
  summary: {
    subtotal: { type: Number, default: 0, min: 0 },
    discountType: { type: String, enum: ["flat", "percentage", "none"], default: "none" },
    discountValue: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxPercentage: { type: Number, default: 0, min: 0, max: 100 },
    taxAmount: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, default: 0, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, default: 0, min: 0 },
    subtotalMin: { type: Number, default: 0 },
    subtotalMax: { type: Number, default: 0 },
    grandTotalMin: { type: Number, default: 0 },
    grandTotalMax: { type: Number, default: 0 },
    dueAmountMin: { type: Number, default: 0 },
    dueAmountMax: { type: Number, default: 0 }
  },
  
  profitMargin: {
    outsourcingCost: { type: Number, default: 0, min: 0 },
    materialCost: { type: Number, default: 0, min: 0 },
    laborCost: { type: Number, default: 0, min: 0 },
    estimatedProfit: { type: Number, default: 0 }
  },
  
  status: { 
    type: String, 
    enum: ["draft", "issued", "cancelled"], 
    default: "draft",
    index: true 
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "partial", "paid", "refunded"],
    default: "pending",
    index: true
  },
  
  dueDate: { 
    type: Date 
  },
  generatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true 
  },
  
  // Soft Delete Fields
  isDeleted: { 
    type: Boolean, 
    default: false, 
    index: true 
  },
  deletedAt: { 
    type: Date 
  },
  deletedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }
}, { 
  timestamps: true 
});

// Compound indexes for rapid developer lookup
invoiceSchema.index({ customer: 1, createdAt: -1 });
invoiceSchema.index({ order: 1, isDeleted: 1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
