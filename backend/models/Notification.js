// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'work-assigned', 
      'work-accepted', 
      'work-status-update', 
      'order-confirmed',
      'tailor-assigned',
      'work-available',      // For cutting masters
      'delivery-ready',       // For store keepers
      'order-delivered',      // For store keepers
      'order-cancelled',      // For everyone
      'birthday'              // For staff (automated)
    ],
    required: [true, 'Notification type is required']
  },
  
  // ✅ Dynamic ref with validation
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: [true, 'Recipient is required'],
    refPath: 'recipientModel',  // Dynamically picks the collection
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid recipient ID format'
    }
  },
  
  // ✅ Tells which collection to use for ref
  recipientModel: {
    type: String,
    required: [true, 'Recipient model is required'],
    enum: {
      values: ['User', 'CuttingMaster', 'StoreKeeper', 'Tailor', 'AariWorker', 'EmbroideryWorker', 'Helper'],
      message: '{VALUE} is not a valid recipient model'
    },
    default: 'User'
  },
  
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  
  reference: {
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Order',
      validate: {
        validator: function(v) {
          return !v || mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid order ID format'
      }
    },
    workId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Work',
      validate: {
        validator: function(v) {
          return !v || mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid work ID format'
      }
    },
    garmentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Garment',
      validate: {
        validator: function(v) {
          return !v || mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid garment ID format'
      }
    },
    workCount: { 
      type: Number,
      min: [0, 'Work count cannot be negative'],
      default: 0
    },
    workIds: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Work' 
    }]
  },
  
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  priority: {
    type: String,
    enum: {
      values: ['low', 'normal', 'high'],
      message: '{VALUE} is not a valid priority'
    },
    default: 'normal'
  }
  
}, {
  timestamps: true,  // ✅ Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// ✅ INDEXES for better performance
// ============================================
notificationSchema.index({ recipient: 1, recipientModel: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ 'reference.orderId': 1 });
notificationSchema.index({ 'reference.workId': 1 });

// ============================================
// ✅ VIRTUAL for time ago
// ============================================
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
});

// ============================================
// ✅ INSTANCE METHODS
// ============================================

// Mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  return this.save();
};

// ============================================
// ✅ STATIC METHODS
// ============================================

// Get unread count for a user
notificationSchema.statics.getUnreadCount = async function(recipientId, recipientModel = 'User') {
  return this.countDocuments({ 
    recipient: recipientId,
    recipientModel,
    isRead: false 
  });
};

// Mark all as read for a user
notificationSchema.statics.markAllAsRead = async function(recipientId, recipientModel = 'User') {
  return this.updateMany(
    { recipient: recipientId, recipientModel, isRead: false },
    { isRead: true }
  );
};

// Get notifications for a user with pagination
notificationSchema.statics.getForUser = async function(
  recipientId, 
  recipientModel = 'User', 
  page = 1, 
  limit = 20,
  unreadOnly = false
) {
  const query = { recipient: recipientId, recipientModel };
  if (unreadOnly) query.isRead = false;
  
  const skip = (page - 1) * limit;
  
  const [notifications, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// ============================================
// ✅ MIDDLEWARE - FIXED (No 'next' parameter)
// ============================================

// Pre-save middleware - ✅ REMOVED 'next' parameter
notificationSchema.pre('save', function() {
  console.log("🔧 Notification pre-save hook");
  
  // If recipient is a string, convert to ObjectId
  if (typeof this.recipient === 'string' && mongoose.Types.ObjectId.isValid(this.recipient)) {
    console.log(`🔄 Converting recipient from string to ObjectId: ${this.recipient}`);
    this.recipient = new mongoose.Types.ObjectId(this.recipient);
  }
  
  // No need to call next() - Mongoose handles it automatically
});

// Pre-update middleware - ✅ REMOVED 'next' parameter
notificationSchema.pre('findOneAndUpdate', function() {
  console.log("🔧 Notification pre-update hook");
  
  const update = this.getUpdate();
  
  // Convert recipient to ObjectId if it's a string
  if (update && update.recipient && typeof update.recipient === 'string' && 
      mongoose.Types.ObjectId.isValid(update.recipient)) {
    console.log(`🔄 Converting recipient in update to ObjectId: ${update.recipient}`);
    update.recipient = new mongoose.Types.ObjectId(update.recipient);
  }
  
  // Check if we're updating via findByIdAndUpdate
  if (update && update.$set && update.$set.recipient && 
      typeof update.$set.recipient === 'string' && 
      mongoose.Types.ObjectId.isValid(update.$set.recipient)) {
    console.log(`🔄 Converting $set.recipient to ObjectId: ${update.$set.recipient}`);
    update.$set.recipient = new mongoose.Types.ObjectId(update.$set.recipient);
  }
  
  // No need to call next()
});

// Pre-validate middleware (optional - if you need it)
notificationSchema.pre('validate', function() {
  console.log("🔧 Notification pre-validate hook");
  
  // Validate that recipient is valid ObjectId
  if (this.recipient && !mongoose.Types.ObjectId.isValid(this.recipient)) {
    throw new Error('Invalid recipient ID format');
  }
  
  // No need to call next()
});

// ============================================
// ✅ POST MIDDLEWARE (optional)
// ============================================

// After save
notificationSchema.post('save', function(doc) {
  console.log(`✅ Notification saved: ${doc._id}`);
});

// After find
notificationSchema.post('find', function(docs) {
  console.log(`🔍 Found ${docs.length} notifications`);
});

// ============================================
// ✅ EXPORT
// ============================================
const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;