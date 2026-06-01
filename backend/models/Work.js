import mongoose from 'mongoose';
import crypto from 'crypto';

const workSchema = new mongoose.Schema({
  workId: {
    type: String,
    unique: true,
  },

  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },

  garment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Garment',
    required: true,
  },

  assignments: [{
    stage:       { type: String, required: true },
    role:        { type: String, required: true },
    workerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    workerName:  { type: String },
    assignedAt:  { type: Date, default: Date.now },
    startedAt:   { type: Date },
    completedAt: { type: Date },
    status:      { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
    notes:       String,
  }],

  qrCode: String,

  /**
   * ✅ currentStage stores the KEY of the currently active pipeline stage.
   * It is the canonical "cursor" that getWorkflowJobs() and processQrScan()
   * use to determine which stage is active.
   *
   * IMPORTANT: No enum restriction — custom stages like "trial", "mirror_work",
   * "aari", "embroidery" must all be valid values here.
   */
  currentStage: {
    type: String,
    default: 'new',
  },

  overallStatus: {
    type: String,
    default: 'pending',
  },

  /**
   * ✅ workflowStages: ordered array of {key, label, order} — defines the
   * pipeline for this specific work item.  Populated from order.stageKeys /
   * order.workflowStages at work-creation time.
   */
  workflowStages: {
    type: [
      {
        key:   String,
        label: String,
        order: Number,
      },
    ],
    default: [],
  },

  /**
   * ✅ stageKeys: flat ordered array of stage key strings — convenience copy
   * of workflowStages[].key for fast lookups without sorting.
   */
  stageKeys: {
    type: [String],
    default: [],
  },

  /**
   * ✅ workflowProgress: persists per-stage completion timestamps.
   * Keyed by stage key, value is { completed, completedAt, assignedTo }.
   * This is updated atomically by processQrScan() so getWorkflowJobs()
   * can overlay completedAt on the returned stages map.
   */
  workflowProgress: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  scanLogs: [{
    scannedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scannerName: String,
    role:        String,
    stage:       String,
    scannedAt:   { type: Date, default: Date.now },
    action:      String,
  }],

  history: [{
    action:    { type: String, required: true },
    details:   { type: String },
    actorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String },
    timestamp: { type: Date, default: Date.now },
  }],

  status: {
    type: String,
    default: 'pending',
  },

  estimatedDelivery: Date,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Legacy status timestamps
  acceptedAt:         Date,
  cuttingStartedAt:   Date,
  cuttingCompletedAt: Date,
  sewingStartedAt:    Date,
  sewingCompletedAt:  Date,
  ironingAt:          Date,
  readyAt:            Date,

  cuttingNotes: String,
  tailorNotes:  String,
  measurementPdf: String,

  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  strictPopulate: false,
});

// Pre-save: generate workId
workSchema.pre('save', async function () {
  if (!this.workId) {
    const date   = new Date();
    const day    = String(date.getDate()).padStart(2, '0');
    const month  = String(date.getMonth() + 1).padStart(2, '0');
    const year   = date.getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
    this.workId  = `WRK-${day}${month}${year}-${random}`;
  }

  if (!this.qrCode) {
    this.qrCode = crypto.randomUUID();
  }

  if (this.isModified('status')) {
    const statusFields = {
      'accepted':           'acceptedAt',
      'cutting-started':    'cuttingStartedAt',
      'cutting-completed':  'cuttingCompletedAt',
      'sewing-started':     'sewingStartedAt',
      'sewing-completed':   'sewingCompletedAt',
      'ironing':            'ironingAt',
      'ready-to-deliver':   'readyAt',
    };
    if (statusFields[this.status]) {
      this[statusFields[this.status]] = new Date();
    }
  }
});

workSchema.index({ workId:                  1 }, { unique: true });
workSchema.index({ order:                   1 });
workSchema.index({ garment:                 1 });
workSchema.index({ 'assignments.workerId':  1 });
workSchema.index({ status:                  1 });

export default mongoose.model('Work', workSchema);