// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },

  // Payment type: advance = partial upfront, full = direct full payment, final-settlement = remaining after advance
  type: {
    type: String,
    enum: ['advance', 'full', 'final-settlement'],
    default: 'advance',
    index: true
  },

  method: {
    type: String,
    enum: ['cash', 'upi', 'bank-transfer', 'card'],
    required: true
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentTime: {
    type: String,
    required: true
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  // ✅ STORE FIELD REMOVED - No Store model exists
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ✅ Add compound indexes for better query performance
paymentSchema.index({ order: 1, paymentDate: -1 });
paymentSchema.index({ customer: 1, paymentDate: -1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ type: 1, paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);