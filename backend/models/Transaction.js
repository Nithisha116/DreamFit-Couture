// // models/Transaction.js - Alternative approach
// import mongoose from 'mongoose';

// const transactionSchema = new mongoose.Schema({
//   // Core fields
//   type: { 
//     type: String, 
//     enum: ['income', 'expense'], 
//     required: true 
//   },
  
//   // Category based on type
//   category: { 
//     type: String, 
//     required: true,
//     enum: [
//       'customer-advance', 'full-payment', 'fabric-sale', 'project-payment', 
//       'salary', 'electricity', 'travel', 'material-purchase', 'rent', 'maintenance'
//     ]
//   },
  
//   // For "other" categories - this will store custom value
//   isOtherCategory: {
//     type: Boolean,
//     default: false
//   },
  
//   customCategory: String,
  
//   amount: { 
//     type: Number, 
//     required: true,
//     min: 0 
//   },
  
//   // Payment method
//   paymentMethod: { 
//     type: String, 
//     enum: ['cash', 'upi', 'bank-transfer', 'card'], 
//     required: true 
//   },
  
//   // Account type (auto-set based on payment method)
//   accountType: { 
//     type: String, 
//     enum: ['hand-cash', 'bank'], 
//     required: true 
//   },
  
//   // Customer reference (for income)
//   customer: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Customer' 
//   },
  
//   // Customer details for quick reference
//   customerDetails: {
//     name: String,
//     phone: String,
//     id: String
//   },
  
//   // Order reference (optional)
//   order: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Order' 
//   },
  
//   // Description/Notes
//   description: String,
  
//   // Transaction date
//   transactionDate: { 
//     type: Date, 
//     default: Date.now,
//     required: true 
//   },
  
//   // Who created this transaction
//   createdBy: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User' 
//   },
  
//   // Reference number for bank/upi/card
//   referenceNumber: String,
  
//   // Status
//   status: {
//     type: String,
//     enum: ['completed', 'pending', 'cancelled'],
//     default: 'completed'
//   }
// }, { 
//   timestamps: true 
// });

// // Virtual field for display category
// transactionSchema.virtual('displayCategory').get(function() {
//   if (this.isOtherCategory && this.customCategory) {
//     return this.customCategory;
//   }
//   return this.category;
// });

// transactionSchema.set('toJSON', { virtuals: true });
// transactionSchema.set('toObject', { virtuals: true });

// // Indexes
// transactionSchema.index({ transactionDate: -1 });
// transactionSchema.index({ type: 1, transactionDate: -1 });
// transactionSchema.index({ accountType: 1 });
// transactionSchema.index({ customer: 1 });
// transactionSchema.index({ order: 1 });

// export default mongoose.model('Transaction', transactionSchema);






// models/Transaction.js - UPDATED FIXED VERSION
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  // Core fields
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true 
  },
  
  // Category based on type
  category: { 
    type: String, 
    required: true,
    // ✅ UPDATED: Include all payment types for income
    enum: [
      // Income categories
      'customer-advance', 'full-payment', 'project-payment', 'other-income',
      // Expense categories
      'salary', 'electricity', 'travel', 'material-purchase', 'rent', 
      'maintenance', 'other-expense'
    ]
  },
  
  // For "other" categories - this will store custom value
  isOtherCategory: {
    type: Boolean,
    default: false
  },
  
  customCategory: String,
  
  amount: { 
    type: Number, 
    required: true,
    min: 0 
  },
  
  // Payment method
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'upi', 'bank-transfer', 'card'], 
    required: true 
  },
  
  // Account type (auto-set based on payment method)
  accountType: { 
    type: String, 
    enum: ['hand-cash', 'bank'], 
    required: true 
  },
  
  // Customer reference (for income)
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer' 
  },
  
  // Customer details for quick reference
  customerDetails: {
    name: String,
    phone: String,
    id: String
  },
  
  // Order reference (optional)
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  },
  
  // Description/Notes
  description: String,
  
  // Transaction date
  transactionDate: { 
    type: Date, 
    default: Date.now,
    required: true 
  },
  
  // Who created this transaction
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Reference number for bank/upi/card
  referenceNumber: String,
  
  // Status
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled'],
    default: 'completed'
  }
}, { 
  timestamps: true 
});

// Virtual field for display category
transactionSchema.virtual('displayCategory').get(function() {
  if (this.isOtherCategory && this.customCategory) {
    return this.customCategory;
  }
  return this.category;
});

transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

// Indexes
transactionSchema.index({ transactionDate: -1 });
transactionSchema.index({ type: 1, transactionDate: -1 });
transactionSchema.index({ accountType: 1 });
transactionSchema.index({ customer: 1 });
transactionSchema.index({ order: 1 });

export default mongoose.model('Transaction', transactionSchema);