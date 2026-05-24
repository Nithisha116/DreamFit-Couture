import mongoose from 'mongoose';

const workflowStageSchema = new mongoose.Schema({
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
  assignedTo: String,
}, { _id: false });

const workSchema = new mongoose.Schema({
  // Note: Removed index: true from here to prevent duplicate index warnings
  workId: { 
    type: String, 
    unique: true 
  },
  
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  
  garment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Garment', 
    required: true 
  },
  
  assignments: [{
    stage: { type: String, required: true },
    role: { type: String, required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    workerName: { type: String },
    assignedAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    completedAt: { type: Date },
    status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
    notes: String
  }],
  
  qrCode: String,
  currentStage: {
    type: String,
    enum: [
      "new",
      "cutting",
      "stitching",
      "trial",
      "packing",
      "delivered",
    ],
    default: "new",
  },
  overallStatus: String,
  workflowStages: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({
      cutting: { completed: false, completedAt: null, assignedTo: null },
      stitching: { completed: false, completedAt: null, assignedTo: null },
      trial: { completed: false, completedAt: null, assignedTo: null },
      packing: { completed: false, completedAt: null, assignedTo: null }
    })
  },

  scanLogs: [{
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scannerName: String,
    role: String,
    stage: String,
    scannedAt: { type: Date, default: Date.now },
    action: String
  }],
  
  history: [{
    action: { type: String, required: true },
    details: { type: String },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  
  status: {
    type: String,
    default: 'pending'
  },
  
  estimatedDelivery: Date,
  
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  acceptedAt: Date,
  cuttingStartedAt: Date,
  cuttingCompletedAt: Date,
  sewingStartedAt: Date,
  sewingCompletedAt: Date,
  ironingAt: Date,
  readyAt: Date,
  
  cuttingNotes: String,
  tailorNotes: String,
  
  measurementPdf: String,
  
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  strictPopulate: false
});

// ✅ CORRECTED PRE-SAVE HOOK
// In modern Mongoose, if you use an async function, do NOT use 'next'
workSchema.pre('save', async function() {
  // Generate workId if not provided
  if (!this.workId) {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
    this.workId = `WRK-${day}${month}${year}-${random}`;
  }
  
  // Set timestamps for status changes
  if (this.isModified('status')) {
    const statusFields = {
      'accepted': 'acceptedAt',
      'cutting-started': 'cuttingStartedAt',
      'cutting-completed': 'cuttingCompletedAt',
      'sewing-started': 'sewingStartedAt',
      'sewing-completed': 'sewingCompletedAt',
      'ironing': 'ironingAt',
      'ready-to-deliver': 'readyAt'
    };
    
    if (statusFields[this.status]) {
      this[statusFields[this.status]] = new Date();
    }
  }
  
  // No need to call next() in an async pre-hook
});

// ✅ CENTRALIZED INDEXES (Fixes "Duplicate schema index" warning)
// Ensure no fields inside the schema have 'index: true' or 'unique: true' if defined here
workSchema.index({ workId: 1 }, { unique: true });
workSchema.index({ order: 1 });
workSchema.index({ garment: 1 });
workSchema.index({ 'assignments.workerId': 1 });
workSchema.index({ status: 1 });

export default mongoose.model('Work', workSchema);