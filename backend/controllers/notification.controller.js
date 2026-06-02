// // controllers/notification.controller.js
// import mongoose from 'mongoose';  // ✅ ADD THIS!
// import Notification from '../models/Notification.js';
// import User from '../models/User.js';
// import CuttingMaster from '../models/CuttingMaster.js';
// import StoreKeeper from '../models/StoreKeeper.js';
// import Tailor from '../models/Tailor.js';

// // Helper function to determine recipient model based on role
// const getRecipientModel = (role) => {
//   switch(role) {
//     case 'CUTTING_MASTER': return 'CuttingMaster';
//     case 'STORE_KEEPER': return 'StoreKeeper';
//     case 'TAILOR': return 'Tailor';
//     default: return 'User';
//   }
// };

// // Helper function to find users by role
// const findUsersByRole = async (role) => {
//   console.log(`🔍 Finding users with role: ${role}`);
  
//   switch(role) {
//     case 'CUTTING_MASTER':
//       return await CuttingMaster.find({ isActive: true }).lean();
//     case 'STORE_KEEPER':
//       return await StoreKeeper.find({ isActive: true }).lean();
//     case 'TAILOR':
//       return await Tailor.find({ isActive: true }).lean();
//     default:
//       return await User.find({ role }).lean();
//   }
// };

// // Helper function to safely convert to ObjectId
// const toObjectId = (id) => {
//   if (!id) return null;
//   if (id instanceof mongoose.Types.ObjectId) return id;
//   if (mongoose.Types.ObjectId.isValid(id)) {
//     return new mongoose.Types.ObjectId(id);
//   }
//   return null;
// };

// // @desc    Create notification (internal function) - UPDATED with ObjectId conversion
// export const createNotification = async ({
//   type,
//   recipient,
//   title,
//   message,
//   reference,
//   priority = 'normal',
//   recipientModel = 'User'
// }) => {
//   console.log('\n🔔 ===== CREATE NOTIFICATION STARTED =====');
//   console.log('📌 Type:', type);
//   console.log('👤 Recipient:', recipient);
//   console.log('📝 Title:', title);
//   console.log('💬 Message:', message);
//   console.log('🔗 Reference:', JSON.stringify(reference));
//   console.log('⚡ Priority:', priority);
//   console.log('📋 Recipient Model:', recipientModel);
  
//   try {
//     // ✅ Convert recipient to ObjectId if it's a string
//     const recipientId = toObjectId(recipient);
    
//     if (!recipientId) {
//       throw new Error(`Invalid recipient ID: ${recipient}`);
//     }
    
//     console.log('✅ Converted recipient to ObjectId:', recipientId);

//     // If recipient is null, send to all users of a specific role
//     if (!recipient) {
//       console.log('🔍 No specific recipient, finding all users by role...');
      
//       // Determine role based on notification type
//       let targetRole = 'CUTTING_MASTER';
//       if (type.includes('delivery') || type.includes('order')) {
//         targetRole = 'STORE_KEEPER';
//       } else if (type.includes('tailor')) {
//         targetRole = 'TAILOR';
//       }
      
//       const users = await findUsersByRole(targetRole);
      
//       console.log(`✅ Found ${users.length} users with role ${targetRole}:`);
//       users.forEach((user, index) => {
//         console.log(`   ${index + 1}. ${user.name} (ID: ${user._id})`);
//       });
      
//       if (users.length === 0) {
//         console.log(`⚠️ No ${targetRole} found - notifications not sent`);
//         return [];
//       }
      
//       // Determine recipient model for these users
//       const bulkRecipientModel = getRecipientModel(targetRole);
      
//       const notifications = users.map(user => ({
//         type,
//         recipient: toObjectId(user._id),  // ✅ Convert each recipient
//         recipientModel: bulkRecipientModel,
//         title,
//         message,
//         reference,
//         priority,
//         isRead: false,
//         createdAt: new Date()
//       }));
      
//       console.log(`📝 Creating ${notifications.length} notifications...`);
//       const result = await Notification.insertMany(notifications);
//       console.log(`✅ Successfully created ${result.length} notifications`);
//       console.log('🔔 ===== CREATE NOTIFICATION COMPLETED =====\n');
//       return result;
//     }

//     // Send to specific recipient
//     console.log(`📝 Creating notification for specific recipient: ${recipientId}`);
//     console.log(`📋 Using recipient model: ${recipientModel}`);
    
//     // Check if recipient exists in the specified model
//     let recipientExists = null;
//     let Model = null;
    
//     switch(recipientModel) {
//       case 'CuttingMaster':
//         Model = CuttingMaster;
//         break;
//       case 'StoreKeeper':
//         Model = StoreKeeper;
//         break;
//       case 'Tailor':
//         Model = Tailor;
//         break;
//       default:
//         Model = User;
//     }
    
//     recipientExists = await Model.findById(recipientId).lean();
    
//     if (!recipientExists) {
//       console.log(`⚠️ Recipient not found in ${recipientModel} collection: ${recipientId}`);
//       // Still create notification - maybe they exist in another collection
//     } else {
//       console.log(`✅ Recipient found in ${recipientModel}: ${recipientExists.name}`);
//     }
    
//     // ✅ Create notification with ObjectId recipient
//     const notification = await Notification.create({
//       type,
//       recipient: recipientId,  // ✅ This is now ObjectId
//       recipientModel,
//       title,
//       message,
//       reference,
//       priority,
//       isRead: false,
//       createdAt: new Date()
//     });

//     console.log(`✅ Notification created successfully!`);
//     console.log(`   ID: ${notification._id}`);
//     console.log(`   Type: ${notification.type}`);
//     console.log(`   Recipient: ${notification.recipient}`);
//     console.log(`   Model: ${notification.recipientModel}`);
//     console.log(`   Recipient Type: ${typeof notification.recipient}`);  // Should be object
//     console.log('🔔 ===== CREATE NOTIFICATION COMPLETED =====\n');
//     return notification;
    
//   } catch (error) {
//     console.error('\n❌ ===== CREATE NOTIFICATION ERROR =====');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     if (error.code) console.error('Error code:', error.code);
//     console.error('❌ ===== ERROR END =====\n');
//     throw error;
//   }
// };

// // @desc    Get user notifications - UPDATED with better query
// // @route   GET /api/notifications
// // @access  Private
// export const getNotifications = async (req, res) => {
//   console.log('\n🔍 ===== GET NOTIFICATIONS STARTED =====');
//   console.log('👤 User ID:', req.user?._id || req.user?.id);
//   console.log('👤 User Role:', req.user?.role);
//   console.log('👤 User Name:', req.user?.name);
  
//   try {
//     const { page = 1, limit = 20, unreadOnly = false } = req.query;
//     console.log('📄 Query params:', { page, limit, unreadOnly });

//     // ✅ Get user ID as both string and ObjectId for safety
//     const userId = req.user._id;
//     const userIdStr = userId.toString();
    
//     console.log('🔍 User ID (ObjectId):', userId);
//     console.log('🔍 User ID (String):', userIdStr);

//     // ✅ Determine recipient model based on user role
//     const recipientModel = getRecipientModel(req.user?.role);
    
//     // ✅ Build filter with multiple possibilities
//     const filter = {
//       $or: [
//         { recipient: userId },        // ObjectId
//         { recipient: userIdStr }       // String (for legacy data)
//       ],
//       recipientModel
//     };
    
//     if (unreadOnly === 'true') filter.isRead = false;

//     console.log('🔍 Filter:', JSON.stringify(filter, null, 2));

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     console.log(`📊 Pagination: Skip ${skip}, Limit ${limit}`);

//     // Get total counts - using $or for safety
//     const totalInDB = await Notification.countDocuments({
//       $or: [
//         { recipient: userId },
//         { recipient: userIdStr }
//       ]
//     });
//     console.log(`📊 Total notifications in DB for user: ${totalInDB}`);

//     const unreadInDB = await Notification.countDocuments({ 
//       $or: [
//         { recipient: userId },
//         { recipient: userIdStr }
//       ],
//       isRead: false 
//     });
//     console.log(`📊 Unread notifications in DB: ${unreadInDB}`);

//     // Get notifications with filter
//     const notifications = await Notification.find(filter)
//       .populate('reference.orderId', 'orderId')
//       .populate('reference.workId', 'workId')
//       .populate('reference.garmentId', 'name garmentId')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     console.log(`✅ Found ${notifications.length} notifications for this page`);
    
//     if (notifications.length > 0) {
//       console.log('📋 Sample first notification:', {
//         id: notifications[0]._id,
//         type: notifications[0].type,
//         title: notifications[0].title,
//         read: notifications[0].isRead,
//         model: notifications[0].recipientModel,
//         recipient: notifications[0].recipient,
//         recipientType: typeof notifications[0].recipient,
//         createdAt: notifications[0].createdAt
//       });
//     }

//     const total = await Notification.countDocuments(filter);
//     const unreadCount = await Notification.countDocuments({
//       ...filter,
//       isRead: false
//     });

//     console.log(`📊 Final counts - Total: ${total}, Unread: ${unreadCount}`);
//     console.log('🔍 ===== GET NOTIFICATIONS COMPLETED =====\n');
    
//     res.json({
//       success: true,
//       data: {
//         notifications,
//         unreadCount,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('\n❌ ===== GET NOTIFICATIONS ERROR =====');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     console.error('❌ ===== ERROR END =====\n');
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch notifications',
//       error: error.message
//     });
//   }
// };

// // @desc    Get notification by ID - UPDATED with authorization check
// // @route   GET /api/notifications/:id
// // @access  Private
// export const getNotificationById = async (req, res) => {
//   console.log('\n🔍 ===== GET NOTIFICATION BY ID STARTED =====');
//   console.log('🔖 Notification ID:', req.params.id);
//   console.log('👤 User ID:', req.user?._id || req.user?.id);
  
//   try {
//     const notification = await Notification.findById(req.params.id)
//       .populate('reference.orderId', 'orderId')
//       .populate('reference.workId', 'workId')
//       .populate('reference.garmentId', 'name garmentId');

//     if (!notification) {
//       console.log('❌ Notification not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     console.log('✅ Notification found:', {
//       id: notification._id,
//       type: notification.type,
//       recipient: notification.recipient,
//       recipientModel: notification.recipientModel,
//       title: notification.title
//     });

//     // Check if notification belongs to user (compare as strings)
//     if (notification.recipient.toString() !== req.user._id.toString()) {
//       console.log('❌ Unauthorized access - notification belongs to different user');
//       console.log(`   Notification recipient: ${notification.recipient}`);
//       console.log(`   Current user: ${req.user._id}`);
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to view this notification'
//       });
//     }

//     console.log('🔍 ===== GET NOTIFICATION BY ID COMPLETED =====\n');
    
//     res.json({
//       success: true,
//       data: notification
//     });

//   } catch (error) {
//     console.error('\n❌ ===== GET NOTIFICATION BY ID ERROR =====');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     console.error('❌ ===== ERROR END =====\n');
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch notification',
//       error: error.message
//     });
//   }
// };

// // @desc    Get unread count - UPDATED with recipientModel
// // @route   GET /api/notifications/unread-count
// // @access  Private
// export const getUnreadCount = async (req, res) => {
//   console.log('\n🔢 ===== GET UNREAD COUNT STARTED =====');
//   console.log('👤 User ID:', req.user?._id || req.user?.id);
//   console.log('👤 User Role:', req.user?.role);
  
//   try {
//     const userId = req.user._id;
//     const userIdStr = userId.toString();
//     const recipientModel = getRecipientModel(req.user?.role);
    
//     const count = await Notification.countDocuments({
//       $or: [
//         { recipient: userId },
//         { recipient: userIdStr }
//       ],
//       recipientModel,
//       isRead: false
//     });

//     console.log(`✅ Unread count: ${count}`);
//     console.log('🔢 ===== GET UNREAD COUNT COMPLETED =====\n');

//     res.json({
//       success: true,
//       data: { unreadCount: count }
//     });

//   } catch (error) {
//     console.error('\n❌ ===== GET UNREAD COUNT ERROR =====');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     console.error('❌ ===== ERROR END =====\n');
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get unread count',
//       error: error.message
//     });
//   }
// };

// // @desc    Mark notification as read - UPDATED with recipientModel
// // @route   PATCH /api/notifications/:id/read
// // @access  Private
// export const markAsRead = async (req, res) => {
//   console.log('\n✅ ===== MARK NOTIFICATION AS READ STARTED =====');
//   console.log('🔖 Notification ID:', req.params.id);
//   console.log('👤 User ID:', req.user?._id || req.user?.id);
  
//   try {
//     const notification = await Notification.findById(req.params.id);

//     if (!notification) {
//       console.log('❌ Notification not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     console.log('📋 Notification found:', {
//       id: notification._id,
//       type: notification.type,
//       recipient: notification.recipient,
//       recipientModel: notification.recipientModel,
//       currentReadStatus: notification.isRead
//     });

//     // Check if notification belongs to user (compare as strings)
//     if (notification.recipient.toString() !== req.user._id.toString()) {
//       console.log('❌ Unauthorized access - notification belongs to different user');
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized'
//       });
//     }

//     notification.isRead = true;
//     await notification.save();

//     console.log('✅ Notification marked as read successfully');
//     console.log('✅ ===== MARK AS READ COMPLETED =====\n');

//     res.json({
//       success: true,
//       message: 'Notification marked as read'
//     });

//   } catch (error) {
//     console.error('\n❌ ===== MARK AS READ ERROR =====');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     console.error('❌ ===== ERROR END =====\n');
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to mark as read',
//       error: error.message
//     });
//   }
// };

// // @desc    Mark all notifications as read - UPDATED with recipientModel
// // @route   PATCH /api/notifications/mark-all-read
// // @access  Private
// export const markAllAsRead = async (req, res) => {
//   console.log('\n✅ ===== MARK ALL NOTIFICATIONS AS READ STARTED =====');
//   console.log('👤 User ID:', req.user?._id || req.user?.id);
//   console.log('👤 User Role:', req.user?.role);
  
//   try {
//     const userId = req.user._id;
//     const userIdStr = userId.toString();
//     const recipientModel = getRecipientModel(req.user?.role);
    
//     // First check how many unread exist
//     const unreadCount = await Notification.countDocuments({
//       $or: [
//         { recipient: userId },
//         { recipient: userIdStr }
//       ],
//       recipientModel,
//       isRead: false
//     });
    
//     console.log(`📊 Found ${unreadCount} unread notifications`);

//     const result = await Notification.updateMany(
//       { 
//         $or: [
//           { recipient: userId },
//           { recipient: userIdStr }
//         ],
//         recipientModel,
//         isRead: false 
//       },
//       { isRead: true }
//     );

//     console.log(`✅ Marked ${result.modifiedCount} notifications as read`);
//     console.log('✅ ===== MARK ALL AS READ COMPLETED =====\n');

//     res.json({
//       success: true,
//       message: 'All notifications marked as read'
//     });

//   } catch (error) {
//     console.error('\n❌ ===== MARK ALL AS READ ERROR =====');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     console.error('❌ ===== ERROR END =====\n');
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to mark all as read',
//       error: error.message
//     });
//   }
// };

// // @desc    Delete notification - UPDATED with authorization check
// // @route   DELETE /api/notifications/:id
// // @access  Private
// export const deleteNotification = async (req, res) => {
//   console.log('\n🗑️ ===== DELETE NOTIFICATION STARTED =====');
//   console.log('🔖 Notification ID:', req.params.id);
//   console.log('👤 User ID:', req.user?._id || req.user?.id);
  
//   try {
//     const notification = await Notification.findById(req.params.id);

//     if (!notification) {
//       console.log('❌ Notification not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     console.log('📋 Notification to delete:', {
//       id: notification._id,
//       type: notification.type,
//       recipient: notification.recipient,
//       recipientModel: notification.recipientModel
//     });

//     // Check if notification belongs to user (compare as strings)
//     if (notification.recipient.toString() !== req.user._id.toString()) {
//       console.log('❌ Unauthorized access - notification belongs to different user');
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized'
//       });
//     }

//     await notification.deleteOne();

//     console.log('✅ Notification deleted successfully');
//     console.log('🗑️ ===== DELETE NOTIFICATION COMPLETED =====\n');

//     res.json({
//       success: true,
//       message: 'Notification deleted successfully'
//     });

//   } catch (error) {
//     console.error('\n❌ ===== DELETE NOTIFICATION ERROR =====');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     console.error('❌ ===== ERROR END =====\n');
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete notification',
//       error: error.message
//     });
//   }
// };

// // @desc    Send bulk notifications to role
// // @route   POST /api/notifications/bulk
// // @access  Private (Admin only)
// export const sendBulkNotification = async (req, res) => {
//   console.log('\n📢 ===== SEND BULK NOTIFICATION STARTED =====');
  
//   try {
//     const { role, type, title, message, reference, priority = 'normal' } = req.body;
    
//     console.log('📌 Target Role:', role);
//     console.log('📌 Type:', type);
//     console.log('📝 Title:', title);
    
//     const users = await findUsersByRole(role);
//     const recipientModel = getRecipientModel(role);
    
//     if (users.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No users found with role: ${role}`
//       });
//     }
    
//     const notifications = users.map(user => ({
//       type,
//       recipient: toObjectId(user._id),  // ✅ Convert each recipient
//       recipientModel,
//       title,
//       message,
//       reference: reference || {},
//       priority,
//       isRead: false,
//       createdAt: new Date()
//     }));
    
//     const result = await Notification.insertMany(notifications);
    
//     console.log(`✅ Sent ${result.length} notifications to ${role}`);
//     console.log('📢 ===== SEND BULK NOTIFICATION COMPLETED =====\n');
    
//     res.json({
//       success: true,
//       message: `Sent ${result.length} notifications`,
//       count: result.length
//     });
    
//   } catch (error) {
//     console.error('\n❌ ===== BULK NOTIFICATION ERROR =====');
//     console.error('Error:', error.message);
//     console.error('❌ ===== ERROR END =====\n');
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send bulk notifications',
//       error: error.message
//     });
//   }
// };








// // controllers/notification.controller.js
// import mongoose from 'mongoose';
// import Notification from '../models/Notification.js';
// import User from '../models/User.js';
// import CuttingMaster from '../models/CuttingMaster.js';
// import StoreKeeper from '../models/StoreKeeper.js';
// import Tailor from '../models/Tailor.js';

// // Helper function to determine recipient model based on role
// const getRecipientModel = (role) => {
//   switch(role) {
//     case 'CUTTING_MASTER': return 'CuttingMaster';
//     case 'STORE_KEEPER': return 'StoreKeeper';
//     case 'TAILOR': return 'Tailor';
//     default: return 'User';
//   }
// };

// // Helper function to find users by role
// const findUsersByRole = async (role) => {
//   console.log(`🔍 Finding users with role: ${role}`);
  
//   switch(role) {
//     case 'CUTTING_MASTER':
//       return await CuttingMaster.find({ isActive: true }).lean();
//     case 'STORE_KEEPER':
//       return await StoreKeeper.find({ isActive: true }).lean();
//     case 'TAILOR':
//       return await Tailor.find({ isActive: true }).lean();
//     default:
//       return await User.find({ role }).lean();
//   }
// };

// // ✅ NEW: Find both Admin and Store Keeper users
// const findAdminAndStoreKeepers = async () => {
//   console.log('🔍 Finding Admin and Store Keeper users');
  
//   // Find Admin users from User collection
//   const admins = await User.find({ role: 'ADMIN' }).lean();
  
//   // Find Store Keepers from StoreKeeper collection
//   const storeKeepers = await StoreKeeper.find({ isActive: true }).lean();
  
//   // Combine both arrays
//   const allUsers = [...admins, ...storeKeepers];
  
//   console.log(`✅ Found ${admins.length} Admins and ${storeKeepers.length} Store Keepers`);
//   console.log(`✅ Total: ${allUsers.length} users`);
  
//   return allUsers;
// };

// // Helper function to safely convert to ObjectId
// const toObjectId = (id) => {
//   if (!id) return null;
//   if (id instanceof mongoose.Types.ObjectId) return id;
//   if (mongoose.Types.ObjectId.isValid(id)) {
//     return new mongoose.Types.ObjectId(id);
//   }
//   return null;
// };

// // @desc    Create notification (internal function) - UPDATED with Admin+StoreKeeper sharing
// export const createNotification = async ({
//   type,
//   recipient,
//   title,
//   message,
//   reference,
//   priority = 'normal',
//   recipientModel = 'User'
// }) => {
//   console.log('\n🔔 ===== CREATE NOTIFICATION STARTED =====');
//   console.log('📌 Type:', type);
//   console.log('👤 Recipient:', recipient);
//   console.log('📝 Title:', title);
//   console.log('💬 Message:', message);
//   console.log('🔗 Reference:', JSON.stringify(reference));
//   console.log('⚡ Priority:', priority);
//   console.log('📋 Recipient Model:', recipientModel);
  
//   try {
//     // ✅ CASE 1: Send to specific recipient
//     if (recipient) {
//       const recipientId = toObjectId(recipient);
      
//       if (!recipientId) {
//         throw new Error(`Invalid recipient ID: ${recipient}`);
//       }
      
//       console.log('✅ Converted recipient to ObjectId:', recipientId);

//       // Check if recipient exists in the specified model
//       let recipientExists = null;
//       let Model = null;
      
//       switch(recipientModel) {
//         case 'CuttingMaster':
//           Model = CuttingMaster;
//           break;
//         case 'StoreKeeper':
//           Model = StoreKeeper;
//           break;
//         case 'Tailor':
//           Model = Tailor;
//           break;
//         default:
//           Model = User;
//       }
      
//       recipientExists = await Model.findById(recipientId).lean();
      
//       if (!recipientExists) {
//         console.log(`⚠️ Recipient not found in ${recipientModel} collection: ${recipientId}`);
//         // Still create notification - maybe they exist in another collection
//       } else {
//         console.log(`✅ Recipient found in ${recipientModel}: ${recipientExists.name}`);
//       }
      
//       // ✅ Create single notification
//       const notification = await Notification.create({
//         type,
//         recipient: recipientId,
//         recipientModel,
//         title,
//         message,
//         reference,
//         priority,
//         isRead: false,
//         createdAt: new Date()
//       });

//       console.log(`✅ Notification created successfully!`);
//       console.log(`   ID: ${notification._id}`);
//       console.log('🔔 ===== CREATE NOTIFICATION COMPLETED =====\n');
//       return notification;
//     }
    
//     // ✅ CASE 2: No specific recipient - determine target roles based on notification type
//     console.log('🔍 No specific recipient, finding target users based on notification type...');
    
//     // Determine target roles based on notification type
//     let targetUsers = [];
    
//     // 🔥 FIX: Admin and Store Keeper share all notifications
//     if (type.includes('admin') || type.includes('store') || 
//         type.includes('order') || type.includes('delivery') ||
//         type.includes('work') || type.includes('cutting') ||
//         type.includes('tailor') || type.includes('inventory')) {
      
//       // Send to BOTH Admin AND Store Keeper
//       console.log('📢 This notification should go to Admin AND Store Keeper');
//       targetUsers = await findAdminAndStoreKeepers();
      
//     } else if (type.includes('cutting')) {
//       // Cutting related - go to Cutting Masters
//       console.log('✂️ Cutting notification - sending to Cutting Masters');
//       targetUsers = await findUsersByRole('CUTTING_MASTER');
      
//     } else if (type.includes('tailor')) {
//       // Tailor related
//       console.log('👔 Tailor notification - sending to Tailors');
//       targetUsers = await findUsersByRole('TAILOR');
      
//     } else {
//       // Default - send to Admin and Store Keeper
//       console.log('📢 Default notification - sending to Admin and Store Keeper');
//       targetUsers = await findAdminAndStoreKeepers();
//     }
    
//     console.log(`✅ Found ${targetUsers.length} target users`);
    
//     if (targetUsers.length === 0) {
//       console.log('⚠️ No target users found - notifications not sent');
//       return [];
//     }
    
//     // Determine recipient model for each user
//     const notifications = targetUsers.map(user => {
//       // Determine recipient model based on user type
//       let userRecipientModel = 'User';
//       if (user.role === 'STORE_KEEPER' || user.collectionName === 'storekeepers') {
//         userRecipientModel = 'StoreKeeper';
//       } else if (user.role === 'CUTTING_MASTER') {
//         userRecipientModel = 'CuttingMaster';
//       } else if (user.role === 'TAILOR') {
//         userRecipientModel = 'Tailor';
//       }
      
//       return {
//         type,
//         recipient: toObjectId(user._id),
//         recipientModel: userRecipientModel,
//         title,
//         message,
//         reference,
//         priority,
//         isRead: false,
//         createdAt: new Date()
//       };
//     });
    
//     console.log(`📝 Creating ${notifications.length} notifications...`);
//     const result = await Notification.insertMany(notifications);
//     console.log(`✅ Successfully created ${result.length} notifications`);
//     console.log('🔔 ===== CREATE NOTIFICATION COMPLETED =====\n');
//     return result;
    
//   } catch (error) {
//     console.error('\n❌ ===== CREATE NOTIFICATION ERROR =====');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     if (error.code) console.error('Error code:', error.code);
//     console.error('❌ ===== ERROR END =====\n');
//     throw error;
//   }
// };

// // @desc    Get user notifications
// // @route   GET /api/notifications
// // @access  Private
// export const getNotifications = async (req, res) => {
//   console.log('\n🔍 ===== GET NOTIFICATIONS STARTED =====');
//   console.log('👤 User ID:', req.user?._id || req.user?.id);
//   console.log('👤 User Role:', req.user?.role);
//   console.log('👤 User Name:', req.user?.name);
  
//   try {
//     const { page = 1, limit = 20, unreadOnly = false } = req.query;
//     console.log('📄 Query params:', { page, limit, unreadOnly });

//     const userId = req.user._id;
//     const userIdStr = userId.toString();
    
//     console.log('🔍 User ID (ObjectId):', userId);
//     console.log('🔍 User ID (String):', userIdStr);

//     const recipientModel = getRecipientModel(req.user?.role);
    
//     const filter = {
//       $or: [
//         { recipient: userId },
//         { recipient: userIdStr }
//       ],
//       recipientModel
//     };
    
//     if (unreadOnly === 'true') filter.isRead = false;

//     console.log('🔍 Filter:', JSON.stringify(filter, null, 2));

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     console.log(`📊 Pagination: Skip ${skip}, Limit ${limit}`);

//     const notifications = await Notification.find(filter)
//       .populate('reference.orderId', 'orderId')
//       .populate('reference.workId', 'workId')
//       .populate('reference.garmentId', 'name garmentId')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     console.log(`✅ Found ${notifications.length} notifications for this page`);

//     const total = await Notification.countDocuments(filter);
//     const unreadCount = await Notification.countDocuments({
//       ...filter,
//       isRead: false
//     });

//     console.log(`📊 Final counts - Total: ${total}, Unread: ${unreadCount}`);
//     console.log('🔍 ===== GET NOTIFICATIONS COMPLETED =====\n');
    
//     res.json({
//       success: true,
//       data: {
//         notifications,
//         unreadCount,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('\n❌ ===== GET NOTIFICATIONS ERROR =====');
//     console.error('Error message:', error.message);
//     console.error('❌ ===== ERROR END =====\n');
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch notifications',
//       error: error.message
//     });
//   }
// };

// // @desc    Get notification by ID
// // @route   GET /api/notifications/:id
// // @access  Private
// export const getNotificationById = async (req, res) => {
//   console.log('\n🔍 ===== GET NOTIFICATION BY ID STARTED =====');
//   console.log('🔖 Notification ID:', req.params.id);
  
//   try {
//     const notification = await Notification.findById(req.params.id)
//       .populate('reference.orderId', 'orderId')
//       .populate('reference.workId', 'workId')
//       .populate('reference.garmentId', 'name garmentId');

//     if (!notification) {
//       console.log('❌ Notification not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     if (notification.recipient.toString() !== req.user._id.toString()) {
//       console.log('❌ Unauthorized access');
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to view this notification'
//       });
//     }

//     res.json({
//       success: true,
//       data: notification
//     });

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch notification',
//       error: error.message
//     });
//   }
// };

// // @desc    Get unread count
// // @route   GET /api/notifications/unread-count
// // @access  Private
// export const getUnreadCount = async (req, res) => {
//   console.log('\n🔢 ===== GET UNREAD COUNT STARTED =====');
//   console.log('👤 User ID:', req.user?._id || req.user?.id);
  
//   try {
//     const userId = req.user._id;
//     const userIdStr = userId.toString();
//     const recipientModel = getRecipientModel(req.user?.role);
    
//     const count = await Notification.countDocuments({
//       $or: [
//         { recipient: userId },
//         { recipient: userIdStr }
//       ],
//       recipientModel,
//       isRead: false
//     });

//     console.log(`✅ Unread count: ${count}`);
//     console.log('🔢 ===== GET UNREAD COUNT COMPLETED =====\n');

//     res.json({
//       success: true,
//       data: { unreadCount: count }
//     });

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get unread count',
//       error: error.message
//     });
//   }
// };

// // @desc    Mark notification as read
// // @route   PATCH /api/notifications/:id/read
// // @access  Private
// export const markAsRead = async (req, res) => {
//   console.log('\n✅ ===== MARK NOTIFICATION AS READ STARTED =====');
//   console.log('🔖 Notification ID:', req.params.id);
  
//   try {
//     const notification = await Notification.findById(req.params.id);

//     if (!notification) {
//       console.log('❌ Notification not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     if (notification.recipient.toString() !== req.user._id.toString()) {
//       console.log('❌ Unauthorized access');
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized'
//       });
//     }

//     notification.isRead = true;
//     await notification.save();

//     console.log('✅ Notification marked as read');
//     console.log('✅ ===== MARK AS READ COMPLETED =====\n');

//     res.json({
//       success: true,
//       message: 'Notification marked as read'
//     });

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to mark as read',
//       error: error.message
//     });
//   }
// };

// // @desc    Mark all notifications as read
// // @route   PATCH /api/notifications/mark-all-read
// // @access  Private
// export const markAllAsRead = async (req, res) => {
//   console.log('\n✅ ===== MARK ALL NOTIFICATIONS AS READ STARTED =====');
//   console.log('👤 User ID:', req.user?._id || req.user?.id);
  
//   try {
//     const userId = req.user._id;
//     const userIdStr = userId.toString();
//     const recipientModel = getRecipientModel(req.user?.role);
    
//     const result = await Notification.updateMany(
//       { 
//         $or: [
//           { recipient: userId },
//           { recipient: userIdStr }
//         ],
//         recipientModel,
//         isRead: false 
//       },
//       { isRead: true }
//     );

//     console.log(`✅ Marked ${result.modifiedCount} notifications as read`);
//     console.log('✅ ===== MARK ALL AS READ COMPLETED =====\n');

//     res.json({
//       success: true,
//       message: 'All notifications marked as read'
//     });

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to mark all as read',
//       error: error.message
//     });
//   }
// };

// // @desc    Delete notification
// // @route   DELETE /api/notifications/:id
// // @access  Private
// export const deleteNotification = async (req, res) => {
//   console.log('\n🗑️ ===== DELETE NOTIFICATION STARTED =====');
//   console.log('🔖 Notification ID:', req.params.id);
  
//   try {
//     const notification = await Notification.findById(req.params.id);

//     if (!notification) {
//       console.log('❌ Notification not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     if (notification.recipient.toString() !== req.user._id.toString()) {
//       console.log('❌ Unauthorized access');
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized'
//       });
//     }

//     await notification.deleteOne();

//     console.log('✅ Notification deleted');
//     console.log('🗑️ ===== DELETE NOTIFICATION COMPLETED =====\n');

//     res.json({
//       success: true,
//       message: 'Notification deleted successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete notification',
//       error: error.message
//     });
//   }
// };

// // @desc    Send bulk notifications to role
// // @route   POST /api/notifications/bulk
// // @access  Private (Admin only)
// export const sendBulkNotification = async (req, res) => {
//   console.log('\n📢 ===== SEND BULK NOTIFICATION STARTED =====');
  
//   try {
//     const { role, type, title, message, reference, priority = 'normal' } = req.body;
    
//     console.log('📌 Target Role:', role);
//     console.log('📌 Type:', type);
//     console.log('📝 Title:', title);
    
//     let targetUsers = [];
    
//     // 🔥 FIX: If target is ADMIN or STORE_KEEPER, send to both
//     if (role === 'ADMIN' || role === 'STORE_KEEPER' || role === 'ADMIN_STORE') {
//       targetUsers = await findAdminAndStoreKeepers();
//     } else {
//       targetUsers = await findUsersByRole(role);
//     }
    
//     const recipientModel = role === 'STORE_KEEPER' ? 'StoreKeeper' : 
//                            role === 'CUTTING_MASTER' ? 'CuttingMaster' : 
//                            role === 'TAILOR' ? 'Tailor' : 'User';
    
//     if (targetUsers.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No users found with role: ${role}`
//       });
//     }
    
//     const notifications = targetUsers.map(user => ({
//       type,
//       recipient: toObjectId(user._id),
//       recipientModel,
//       title,
//       message,
//       reference: reference || {},
//       priority,
//       isRead: false,
//       createdAt: new Date()
//     }));
    
//     const result = await Notification.insertMany(notifications);
    
//     console.log(`✅ Sent ${result.length} notifications to ${role}`);
//     console.log('📢 ===== SEND BULK NOTIFICATION COMPLETED =====\n');
    
//     res.json({
//       success: true,
//       message: `Sent ${result.length} notifications`,
//       count: result.length
//     });
    
//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send bulk notifications',
//       error: error.message
//     });
//   }
// };










// // controllers/notification.controller.js
// import mongoose from 'mongoose';
// import Notification from '../models/Notification.js';
// import User from '../models/User.js';
// import CuttingMaster from '../models/CuttingMaster.js';
// import StoreKeeper from '../models/StoreKeeper.js';
// import Tailor from '../models/Tailor.js';

// // Helper function to determine recipient model based on role
// const getRecipientModel = (role) => {
//   switch(role) {
//     case 'CUTTING_MASTER': return 'CuttingMaster';
//     case 'STORE_KEEPER': return 'StoreKeeper';
//     case 'TAILOR': return 'Tailor';
//     default: return 'User';
//   }
// };

// // Helper function to find users by role
// const findUsersByRole = async (role) => {
//   console.log(`🔍 Finding users with role: ${role}`);
  
//   switch(role) {
//     case 'CUTTING_MASTER':
//       return await CuttingMaster.find({ isActive: true }).lean();
//     case 'STORE_KEEPER':
//       return await StoreKeeper.find({ isActive: true }).lean();
//     case 'TAILOR':
//       return await Tailor.find({ isActive: true }).lean();
//     default:
//       return await User.find({ role }).lean();
//   }
// };

// // ✅ FIXED: Find both Admin and Store Keeper users
// const findAdminAndStoreKeepers = async () => {
//   console.log('🔍 Finding Admin and Store Keeper users');
  
//   // Find Admin users from User collection
//   const admins = await User.find({ role: 'ADMIN' }).lean();
  
//   // Find Store Keepers from StoreKeeper collection
//   const storeKeepers = await StoreKeeper.find({ isActive: true }).lean();
  
//   // Also check User collection for Store Keepers (if they are stored there)
//   const storeKeepersInUser = await User.find({ role: 'STORE_KEEPER' }).lean();
  
//   // Combine all arrays and remove duplicates
//   const allUsers = [...admins, ...storeKeepers, ...storeKeepersInUser];
  
//   // Remove duplicates based on _id
//   const uniqueUsers = allUsers.filter((user, index, self) => 
//     index === self.findIndex((u) => u._id.toString() === user._id.toString())
//   );
  
//   console.log(`✅ Found ${admins.length} Admins`);
//   console.log(`✅ Found ${storeKeepers.length} Store Keepers (from StoreKeeper collection)`);
//   console.log(`✅ Found ${storeKeepersInUser.length} Store Keepers (from User collection)`);
//   console.log(`✅ Total unique: ${uniqueUsers.length} users`);
  
//   return uniqueUsers;
// };

// // Helper function to safely convert to ObjectId
// const toObjectId = (id) => {
//   if (!id) return null;
//   if (id instanceof mongoose.Types.ObjectId) return id;
//   if (mongoose.Types.ObjectId.isValid(id)) {
//     return new mongoose.Types.ObjectId(id);
//   }
//   return null;
// };

// // @desc    Create notification (internal function) - UPDATED with Admin+StoreKeeper sharing
// export const createNotification = async ({
//   type,
//   recipient,
//   title,
//   message,
//   reference,
//   priority = 'normal',
//   recipientModel = 'User'
// }) => {
//   console.log('\n🔔 ===== CREATE NOTIFICATION STARTED =====');
//   console.log('📌 Type:', type);
//   console.log('👤 Recipient:', recipient);
//   console.log('📝 Title:', title);
//   console.log('💬 Message:', message);
//   console.log('🔗 Reference:', JSON.stringify(reference));
//   console.log('⚡ Priority:', priority);
//   console.log('📋 Recipient Model:', recipientModel);
  
//   try {
//     // ✅ CASE 1: Send to specific recipient
//     if (recipient) {
//       const recipientId = toObjectId(recipient);
      
//       if (!recipientId) {
//         throw new Error(`Invalid recipient ID: ${recipient}`);
//       }
      
//       console.log('✅ Converted recipient to ObjectId:', recipientId);

//       // Check if recipient exists in the specified model
//       let recipientExists = null;
//       let Model = null;
      
//       switch(recipientModel) {
//         case 'CuttingMaster':
//           Model = CuttingMaster;
//           break;
//         case 'StoreKeeper':
//           Model = StoreKeeper;
//           break;
//         case 'Tailor':
//           Model = Tailor;
//           break;
//         default:
//           Model = User;
//       }
      
//       recipientExists = await Model.findById(recipientId).lean();
      
//       if (!recipientExists) {
//         console.log(`⚠️ Recipient not found in ${recipientModel} collection: ${recipientId}`);
//         // Still create notification - maybe they exist in another collection
//       } else {
//         console.log(`✅ Recipient found in ${recipientModel}: ${recipientExists.name || recipientExists.email}`);
//       }
      
//       // ✅ Create single notification
//       const notification = await Notification.create({
//         type,
//         recipient: recipientId,
//         recipientModel,
//         title,
//         message,
//         reference,
//         priority,
//         isRead: false,
//         createdAt: new Date()
//       });

//       console.log(`✅ Notification created successfully!`);
//       console.log(`   ID: ${notification._id}`);
//       console.log('🔔 ===== CREATE NOTIFICATION COMPLETED =====\n');
//       return notification;
//     }
    
//     // ✅ CASE 2: No specific recipient - determine target roles based on notification type
//     console.log('🔍 No specific recipient, finding target users based on notification type...');
    
//     // Determine target roles based on notification type
//     let targetUsers = [];
    
//     // 🔥 FIXED: Admin and Store Keeper share ALL notifications
//     // Remove the type filtering - send ALL notifications to both roles
//     console.log('📢 Sending notification to BOTH Admin AND Store Keeper');
//     targetUsers = await findAdminAndStoreKeepers();
    
//     console.log(`✅ Found ${targetUsers.length} target users (Admins + Store Keepers)`);
    
//     if (targetUsers.length === 0) {
//       console.log('⚠️ No target users found - notifications not sent');
//       return [];
//     }
    
//     // Determine recipient model for each user
//     const notifications = targetUsers.map(user => {
//       // Determine recipient model based on user type
//       let userRecipientModel = 'User';
      
//       if (user.role === 'STORE_KEEPER' || user.collectionName === 'storekeepers') {
//         userRecipientModel = 'StoreKeeper';
//       } else if (user.role === 'CUTTING_MASTER') {
//         userRecipientModel = 'CuttingMaster';
//       } else if (user.role === 'TAILOR') {
//         userRecipientModel = 'Tailor';
//       } else if (user.role === 'ADMIN') {
//         userRecipientModel = 'User'; // Admin is in User collection
//       }
      
//       return {
//         type,
//         recipient: toObjectId(user._id),
//         recipientModel: userRecipientModel,
//         title,
//         message,
//         reference,
//         priority,
//         isRead: false,
//         createdAt: new Date()
//       };
//     });
    
//     console.log(`📝 Creating ${notifications.length} notifications...`);
//     const result = await Notification.insertMany(notifications);
//     console.log(`✅ Successfully created ${result.length} notifications`);
//     console.log('🔔 ===== CREATE NOTIFICATION COMPLETED =====\n');
//     return result;
    
//   } catch (error) {
//     console.error('\n❌ ===== CREATE NOTIFICATION ERROR =====');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     if (error.code) console.error('Error code:', error.code);
//     console.error('❌ ===== ERROR END =====\n');
//     throw error;
//   }
// };

// // @desc    Get user notifications
// // @route   GET /api/notifications
// // @access  Private
// export const getNotifications = async (req, res) => {
//   console.log('\n🔍 ===== GET NOTIFICATIONS STARTED =====');
//   console.log('👤 User ID:', req.user?._id || req.user?.id);
//   console.log('👤 User Role:', req.user?.role);
//   console.log('👤 User Name:', req.user?.name);
  
//   try {
//     const { page = 1, limit = 20, unreadOnly = false } = req.query;
//     console.log('📄 Query params:', { page, limit, unreadOnly });

//     const userId = req.user._id;
//     const userIdStr = userId.toString();
    
//     console.log('🔍 User ID (ObjectId):', userId);
//     console.log('🔍 User ID (String):', userIdStr);

//     const recipientModel = getRecipientModel(req.user?.role);
    
//     const filter = {
//       $or: [
//         { recipient: userId },
//         { recipient: userIdStr }
//       ],
//       recipientModel
//     };
    
//     if (unreadOnly === 'true') filter.isRead = false;

//     console.log('🔍 Filter:', JSON.stringify(filter, null, 2));

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     console.log(`📊 Pagination: Skip ${skip}, Limit ${limit}`);

//     const notifications = await Notification.find(filter)
//       .populate('reference.orderId', 'orderId')
//       .populate('reference.workId', 'workId')
//       .populate('reference.garmentId', 'name garmentId')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     console.log(`✅ Found ${notifications.length} notifications for this page`);

//     const total = await Notification.countDocuments(filter);
//     const unreadCount = await Notification.countDocuments({
//       ...filter,
//       isRead: false
//     });

//     console.log(`📊 Final counts - Total: ${total}, Unread: ${unreadCount}`);
//     console.log('🔍 ===== GET NOTIFICATIONS COMPLETED =====\n');
    
//     res.json({
//       success: true,
//       data: {
//         notifications,
//         unreadCount,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('\n❌ ===== GET NOTIFICATIONS ERROR =====');
//     console.error('Error message:', error.message);
//     console.error('❌ ===== ERROR END =====\n');
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch notifications',
//       error: error.message
//     });
//   }
// };

// // @desc    Get notification by ID
// // @route   GET /api/notifications/:id
// // @access  Private
// export const getNotificationById = async (req, res) => {
//   console.log('\n🔍 ===== GET NOTIFICATION BY ID STARTED =====');
//   console.log('🔖 Notification ID:', req.params.id);
  
//   try {
//     const notification = await Notification.findById(req.params.id)
//       .populate('reference.orderId', 'orderId')
//       .populate('reference.workId', 'workId')
//       .populate('reference.garmentId', 'name garmentId');

//     if (!notification) {
//       console.log('❌ Notification not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     if (notification.recipient.toString() !== req.user._id.toString()) {
//       console.log('❌ Unauthorized access');
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to view this notification'
//       });
//     }

//     res.json({
//       success: true,
//       data: notification
//     });

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch notification',
//       error: error.message
//     });
//   }
// };

// // @desc    Get unread count
// // @route   GET /api/notifications/unread-count
// // @access  Private
// export const getUnreadCount = async (req, res) => {
//   console.log('\n🔢 ===== GET UNREAD COUNT STARTED =====');
//   console.log('👤 User ID:', req.user?._id || req.user?.id);
  
//   try {
//     const userId = req.user._id;
//     const userIdStr = userId.toString();
//     const recipientModel = getRecipientModel(req.user?.role);
    
//     const count = await Notification.countDocuments({
//       $or: [
//         { recipient: userId },
//         { recipient: userIdStr }
//       ],
//       recipientModel,
//       isRead: false
//     });

//     console.log(`✅ Unread count: ${count}`);
//     console.log('🔢 ===== GET UNREAD COUNT COMPLETED =====\n');

//     res.json({
//       success: true,
//       data: { unreadCount: count }
//     });

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get unread count',
//       error: error.message
//     });
//   }
// };

// // @desc    Mark notification as read
// // @route   PATCH /api/notifications/:id/read
// // @access  Private
// export const markAsRead = async (req, res) => {
//   console.log('\n✅ ===== MARK NOTIFICATION AS READ STARTED =====');
//   console.log('🔖 Notification ID:', req.params.id);
  
//   try {
//     const notification = await Notification.findById(req.params.id);

//     if (!notification) {
//       console.log('❌ Notification not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     if (notification.recipient.toString() !== req.user._id.toString()) {
//       console.log('❌ Unauthorized access');
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized'
//       });
//     }

//     notification.isRead = true;
//     await notification.save();

//     console.log('✅ Notification marked as read');
//     console.log('✅ ===== MARK AS READ COMPLETED =====\n');

//     res.json({
//       success: true,
//       message: 'Notification marked as read'
//     });

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to mark as read',
//       error: error.message
//     });
//   }
// };

// // @desc    Mark all notifications as read
// // @route   PATCH /api/notifications/mark-all-read
// // @access  Private
// export const markAllAsRead = async (req, res) => {
//   console.log('\n✅ ===== MARK ALL NOTIFICATIONS AS READ STARTED =====');
//   console.log('👤 User ID:', req.user?._id || req.user?.id);
  
//   try {
//     const userId = req.user._id;
//     const userIdStr = userId.toString();
//     const recipientModel = getRecipientModel(req.user?.role);
    
//     const result = await Notification.updateMany(
//       { 
//         $or: [
//           { recipient: userId },
//           { recipient: userIdStr }
//         ],
//         recipientModel,
//         isRead: false 
//       },
//       { isRead: true }
//     );

//     console.log(`✅ Marked ${result.modifiedCount} notifications as read`);
//     console.log('✅ ===== MARK ALL AS READ COMPLETED =====\n');

//     res.json({
//       success: true,
//       message: 'All notifications marked as read'
//     });

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to mark all as read',
//       error: error.message
//     });
//   }
// };

// // @desc    Delete notification
// // @route   DELETE /api/notifications/:id
// // @access  Private
// export const deleteNotification = async (req, res) => {
//   console.log('\n🗑️ ===== DELETE NOTIFICATION STARTED =====');
//   console.log('🔖 Notification ID:', req.params.id);
  
//   try {
//     const notification = await Notification.findById(req.params.id);

//     if (!notification) {
//       console.log('❌ Notification not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Notification not found'
//       });
//     }

//     if (notification.recipient.toString() !== req.user._id.toString()) {
//       console.log('❌ Unauthorized access');
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized'
//       });
//     }

//     await notification.deleteOne();

//     console.log('✅ Notification deleted');
//     console.log('🗑️ ===== DELETE NOTIFICATION COMPLETED =====\n');

//     res.json({
//       success: true,
//       message: 'Notification deleted successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete notification',
//       error: error.message
//     });
//   }
// };

// // @desc    Send bulk notifications to role
// // @route   POST /api/notifications/bulk
// // @access  Private (Admin only)
// export const sendBulkNotification = async (req, res) => {
//   console.log('\n📢 ===== SEND BULK NOTIFICATION STARTED =====');
  
//   try {
//     const { role, type, title, message, reference, priority = 'normal' } = req.body;
    
//     console.log('📌 Target Role:', role);
//     console.log('📌 Type:', type);
//     console.log('📝 Title:', title);
    
//     let targetUsers = [];
    
//     // 🔥 FIXED: If target is ADMIN or STORE_KEEPER, send to both
//     if (role === 'ADMIN' || role === 'STORE_KEEPER' || role === 'ADMIN_STORE') {
//       targetUsers = await findAdminAndStoreKeepers();
//     } else {
//       targetUsers = await findUsersByRole(role);
//     }
    
//     if (targetUsers.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No users found with role: ${role}`
//       });
//     }
    
//     const notifications = targetUsers.map(user => {
//       // Determine recipient model
//       let userRecipientModel = 'User';
      
//       if (user.role === 'STORE_KEEPER' || user.collectionName === 'storekeepers') {
//         userRecipientModel = 'StoreKeeper';
//       } else if (user.role === 'CUTTING_MASTER') {
//         userRecipientModel = 'CuttingMaster';
//       } else if (user.role === 'TAILOR') {
//         userRecipientModel = 'Tailor';
//       }
      
//       return {
//         type,
//         recipient: toObjectId(user._id),
//         recipientModel: userRecipientModel,
//         title,
//         message,
//         reference: reference || {},
//         priority,
//         isRead: false,
//         createdAt: new Date()
//       };
//     });
    
//     const result = await Notification.insertMany(notifications);
    
//     console.log(`✅ Sent ${result.length} notifications`);
//     console.log('📢 ===== SEND BULK NOTIFICATION COMPLETED =====\n');
    
//     res.json({
//       success: true,
//       message: `Sent ${result.length} notifications`,
//       count: result.length
//     });
    
//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send bulk notifications',
//       error: error.message
//     });
//   }
// };









// controllers/notification.controller.js
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import CuttingMaster from '../models/CuttingMaster.js';
import StoreKeeper from '../models/StoreKeeper.js';
import Tailor from '../models/Tailor.js';
import { getIO } from '../utils/socket.js';

// Helper function to determine recipient model based on role
const getRecipientModel = (role) => {
  switch(role) {
    case 'CUTTING_MASTER': return 'CuttingMaster';
    case 'STORE_KEEPER': return 'StoreKeeper';
    case 'TAILOR': return 'Tailor';
    default: return 'User';
  }
};

// Helper function to find users by role
const findUsersByRole = async (role) => {
  console.log(`🔍 Finding users with role: ${role}`);
  
  switch(role) {
    case 'CUTTING_MASTER':
      return await CuttingMaster.find({ isActive: true }).lean();
    case 'STORE_KEEPER':
      return await StoreKeeper.find({ isActive: true }).lean();
    case 'TAILOR':
      return await Tailor.find({ isActive: true }).lean();
    default:
      return await User.find({ role }).lean();
  }
};

// ✅ FIXED: Find both Admin and Store Keeper users
const findAdminAndStoreKeepers = async () => {
  console.log('🔍 Finding Admin and Store Keeper users');
  
  const users = [];
  
  // Find Admin users from User collection
  const admins = await User.find({ role: 'ADMIN' }).lean();
  admins.forEach(admin => {
    users.push({
      ...admin,
      _id: admin._id,
      recipientModel: 'User',
      role: 'ADMIN'
    });
  });
  
  // Find Store Keepers from StoreKeeper collection
  const storeKeepers = await StoreKeeper.find({ isActive: true }).lean();
  storeKeepers.forEach(keeper => {
    users.push({
      ...keeper,
      _id: keeper._id,
      recipientModel: 'StoreKeeper',
      role: 'STORE_KEEPER'
    });
  });
  
  // Also check User collection for Store Keepers (if they are stored there)
  const storeKeepersInUser = await User.find({ role: 'STORE_KEEPER' }).lean();
  storeKeepersInUser.forEach(keeper => {
    // Check if already added from StoreKeeper collection
    const exists = users.some(u => u._id.toString() === keeper._id.toString());
    if (!exists) {
      users.push({
        ...keeper,
        _id: keeper._id,
        recipientModel: 'User', // If in User collection, use User model
        role: 'STORE_KEEPER'
      });
    }
  });
  
  console.log(`✅ Found ${admins.length} Admins (Model: User)`);
  console.log(`✅ Found ${storeKeepers.length} Store Keepers (Model: StoreKeeper)`);
  console.log(`✅ Found ${storeKeepersInUser.length} Store Keepers in User collection`);
  console.log(`✅ Total unique users: ${users.length}`);
  
  return users;
};

// Helper function to safely convert to ObjectId
const toObjectId = (id) => {
  if (!id) return null;
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
};

// @desc    Create notification (internal function) - UPDATED with Admin+StoreKeeper sharing
export const createNotification = async ({
  type,
  recipient,
  title,
  message,
  reference,
  priority = 'normal',
  recipientModel = 'User'
}) => {
  console.log('\n🔔 ===== CREATE NOTIFICATION STARTED =====');
  console.log('📌 Type:', type);
  console.log('👤 Recipient:', recipient);
  console.log('📝 Title:', title);
  console.log('💬 Message:', message);
  console.log('🔗 Reference:', JSON.stringify(reference));
  console.log('⚡ Priority:', priority);
  console.log('📋 Recipient Model:', recipientModel);
  
  try {
    // ✅ CASE 1: Send to specific recipient
    if (recipient) {
      const recipientId = toObjectId(recipient);
      
      if (!recipientId) {
        throw new Error(`Invalid recipient ID: ${recipient}`);
      }
      
      console.log('✅ Converted recipient to ObjectId:', recipientId);

      // Check if recipient exists in the specified model
      let recipientExists = null;
      let Model = null;
      
      switch(recipientModel) {
        case 'CuttingMaster':
          Model = CuttingMaster;
          break;
        case 'StoreKeeper':
          Model = StoreKeeper;
          break;
        case 'Tailor':
          Model = Tailor;
          break;
        default:
          Model = User;
      }
      
      recipientExists = await Model.findById(recipientId).lean();
      
      if (!recipientExists) {
        console.log(`⚠️ Recipient not found in ${recipientModel} collection: ${recipientId}`);
        // Still create notification - maybe they exist in another collection
      } else {
        console.log(`✅ Recipient found in ${recipientModel}: ${recipientExists.name || recipientExists.email}`);
      }
      
      // ✅ Create single notification
      const notification = await Notification.create({
        type,
        recipient: recipientId,
        recipientModel,
        title,
        message,
        reference,
        priority,
        isRead: false,
        createdAt: new Date()
      });

      console.log(`✅ Notification created successfully!`);
      console.log(`   ID: ${notification._id}`);
      console.log('🔔 ===== CREATE NOTIFICATION COMPLETED =====\n');
      
      try {
        const io = getIO();
        io.emit('notification:new', notification);
      } catch (err) {
        console.error("Socket emission failed:", err.message);
      }
      
      return notification;
    }
    
    // ✅ CASE 2: No specific recipient - send to Admin AND Store Keeper
    console.log('🔍 Sending notification to BOTH Admin and Store Keeper');
    
    const targetUsers = await findAdminAndStoreKeepers();
    
    console.log(`✅ Found ${targetUsers.length} target users`);
    
    if (targetUsers.length === 0) {
      console.log('⚠️ No target users found - notifications not sent');
      return [];
    }
    
    // Create notifications for each user with correct recipientModel
    const notifications = targetUsers.map(user => ({
      type,
      recipient: toObjectId(user._id),
      recipientModel: user.recipientModel || 'User',
      title,
      message,
      reference,
      priority,
      isRead: false,
      createdAt: new Date()
    }));
    
    console.log(`📝 Creating ${notifications.length} notifications...`);
    const result = await Notification.insertMany(notifications);
    console.log(`✅ Successfully created ${result.length} notifications`);
    
    // Verify store keeper notifications
    const storeKeeperNotifications = result.filter(n => n.recipientModel === 'StoreKeeper');
    console.log(`   👤 Admin notifications: ${result.length - storeKeeperNotifications.length}`);
    console.log(`   👤 Store Keeper notifications: ${storeKeeperNotifications.length}`);
    console.log('🔔 ===== CREATE NOTIFICATION COMPLETED =====\n');
    
    try {
      const io = getIO();
      result.forEach(n => io.emit('notification:new', n));
    } catch (err) {
      console.error("Socket emission failed:", err.message);
    }
    
    return result;
    
  } catch (error) {
    console.error('\n❌ ===== CREATE NOTIFICATION ERROR =====');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.code) console.error('Error code:', error.code);
    console.error('❌ ===== ERROR END =====\n');
    throw error;
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  console.log('\n🔍 ===== GET NOTIFICATIONS STARTED =====');
  console.log('👤 User ID:', req.user?._id || req.user?.id);
  console.log('👤 User Role:', req.user?.role);
  console.log('👤 User Name:', req.user?.name);
  
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    console.log('📄 Query params:', { page, limit, unreadOnly });

    const userId = req.user._id;
    const userIdStr = userId.toString();
    
    console.log('🔍 User ID (ObjectId):', userId);
    console.log('🔍 User ID (String):', userIdStr);

    // 🔥 FIX: Remove recipientModel filter - use only userId match
    // This ensures notifications work regardless of which collection user is in
    const baseFilter = {
      $or: [
        { recipient: userId },
        { recipient: userIdStr }
      ]
    };
    
    const filter = { ...baseFilter };

    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    console.log('🔍 Filter:', JSON.stringify(filter, null, 2));

    const skip = (parseInt(page) - 1) * parseInt(limit);
    console.log(`📊 Pagination: Skip ${skip}, Limit ${limit}`);

    const notifications = await Notification.find(filter)
      .populate('reference.orderId', 'orderId')
      .populate('reference.workId', 'workId')
      .populate('reference.garmentId', 'name garmentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`✅ Found ${notifications.length} notifications for this page`);

    const total = await Notification.countDocuments(filter);
    const globalTotal = await Notification.countDocuments(baseFilter);
    const unreadCount = await Notification.countDocuments({
      ...baseFilter,
      isRead: false
    });

    console.log(`📊 Final counts - Total: ${total}, Global Total: ${globalTotal}, Unread: ${unreadCount}`);
    console.log('🔍 ===== GET NOTIFICATIONS COMPLETED =====\n');
    
    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        globalTotal,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('\n❌ ===== GET NOTIFICATIONS ERROR =====');
    console.error('Error message:', error.message);
    console.error('❌ ===== ERROR END =====\n');
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
export const getNotificationById = async (req, res) => {
  console.log('\n🔍 ===== GET NOTIFICATION BY ID STARTED =====');
  console.log('🔖 Notification ID:', req.params.id);
  
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('reference.orderId', 'orderId')
      .populate('reference.workId', 'workId')
      .populate('reference.garmentId', 'name garmentId');

    if (!notification) {
      console.log('❌ Notification not found');
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      console.log('❌ Unauthorized access');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this notification'
      });
    }

    res.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification',
      error: error.message
    });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  console.log('\n🔢 ===== GET UNREAD COUNT STARTED =====');
  console.log('👤 User ID:', req.user?._id || req.user?.id);
  
  try {
    const userId = req.user._id;
    const userIdStr = userId.toString();
    
    // 🔥 FIX: Remove recipientModel filter
    const count = await Notification.countDocuments({
      $or: [
        { recipient: userId },
        { recipient: userIdStr }
      ],
      isRead: false
    });

    console.log(`✅ Unread count: ${count}`);
    console.log('🔢 ===== GET UNREAD COUNT COMPLETED =====\n');

    res.json({
      success: true,
      data: { unreadCount: count }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  console.log('\n✅ ===== MARK NOTIFICATION AS READ STARTED =====');
  console.log('🔖 Notification ID:', req.params.id);
  
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      console.log('❌ Notification not found');
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      console.log('❌ Unauthorized access');
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    notification.isRead = true;
    await notification.save();

    console.log('✅ Notification marked as read');
    console.log('✅ ===== MARK AS READ COMPLETED =====\n');

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as read',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = async (req, res) => {
  console.log('\n✅ ===== MARK ALL NOTIFICATIONS AS READ STARTED =====');
  console.log('👤 User ID:', req.user?._id || req.user?.id);
  
  try {
    const userId = req.user._id;
    const userIdStr = userId.toString();
    
    // 🔥 FIX: Remove recipientModel filter
    const result = await Notification.updateMany(
      { 
        $or: [
          { recipient: userId },
          { recipient: userIdStr }
        ],
        isRead: false 
      },
      { isRead: true }
    );

    console.log(`✅ Marked ${result.modifiedCount} notifications as read`);
    console.log('✅ ===== MARK ALL AS READ COMPLETED =====\n');

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all as read',
      error: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  console.log('\n🗑️ ===== DELETE NOTIFICATION STARTED =====');
  console.log('🔖 Notification ID:', req.params.id);
  
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      console.log('❌ Notification not found');
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      console.log('❌ Unauthorized access');
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await notification.deleteOne();

    console.log('✅ Notification deleted');
    console.log('🗑️ ===== DELETE NOTIFICATION COMPLETED =====\n');

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// @desc    Send bulk notifications to role
// @route   POST /api/notifications/bulk
// @access  Private (Admin only)
export const sendBulkNotification = async (req, res) => {
  console.log('\n📢 ===== SEND BULK NOTIFICATION STARTED =====');
  
  try {
    const { role, type, title, message, reference, priority = 'normal' } = req.body;
    
    console.log('📌 Target Role:', role);
    console.log('📌 Type:', type);
    console.log('📝 Title:', title);
    
    let targetUsers = [];
    
    // 🔥 FIXED: If target is ADMIN or STORE_KEEPER, send to both
    if (role === 'ADMIN' || role === 'STORE_KEEPER' || role === 'ADMIN_STORE') {
      targetUsers = await findAdminAndStoreKeepers();
    } else {
      targetUsers = await findUsersByRole(role);
    }
    
    if (targetUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No users found with role: ${role}`
      });
    }
    
    const notifications = targetUsers.map(user => {
      // Determine recipient model
      let userRecipientModel = 'User';
      
      if (user.role === 'STORE_KEEPER' || user.collectionName === 'storekeepers') {
        userRecipientModel = 'StoreKeeper';
      } else if (user.role === 'CUTTING_MASTER') {
        userRecipientModel = 'CuttingMaster';
      } else if (user.role === 'TAILOR') {
        userRecipientModel = 'Tailor';
      } else if (user.role === 'ADMIN') {
        userRecipientModel = 'User';
      }
      
      return {
        type,
        recipient: toObjectId(user._id),
        recipientModel: userRecipientModel,
        title,
        message,
        reference: reference || {},
        priority,
        isRead: false,
        createdAt: new Date()
      };
    });
    
    const result = await Notification.insertMany(notifications);
    
    console.log(`✅ Sent ${result.length} notifications`);
    console.log('📢 ===== SEND BULK NOTIFICATION COMPLETED =====\n');
    
    res.json({
      success: true,
      message: `Sent ${result.length} notifications`,
      count: result.length
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk notifications',
      error: error.message
    });
  }
};

// @desc    DEBUG: Check store keeper notifications
// @route   GET /api/notifications/debug/storekeeper/:storeKeeperId
// @access  Private (Admin only)
export const debugStoreKeeperNotifications = async (req, res) => {
  try {
    const { storeKeeperId } = req.params;
    
    console.log('\n🔍 ===== DEBUG: CHECK STORE KEEPER NOTIFICATIONS =====');
    console.log('Store Keeper ID:', storeKeeperId);
    
    // 1. Check if Store Keeper exists in both collections
    const storeKeeperInOwnCollection = await StoreKeeper.findById(storeKeeperId).lean();
    const storeKeeperInUserCollection = await User.findOne({ 
      $or: [
        { _id: storeKeeperId },
        { email: storeKeeperInOwnCollection?.email }
      ]
    }).lean();
    
    console.log('\n📋 Store Keeper in StoreKeeper collection:', storeKeeperInOwnCollection ? '✅ YES' : '❌ NO');
    console.log('📋 Store Keeper in User collection:', storeKeeperInUserCollection ? '✅ YES' : '❌ NO');
    
    // 2. Check notifications in database for this store keeper (without recipientModel filter)
    const notificationsInDb = await Notification.find({
      $or: [
        { recipient: storeKeeperId },
        { recipient: storeKeeperInUserCollection?._id }
      ]
    }).sort({ createdAt: -1 }).limit(50);
    
    console.log(`\n📋 Total notifications in DB for this store keeper: ${notificationsInDb.length}`);
    
    // 3. Check recent notifications created for any store keeper
    const recentNotifications = await Notification.find({
      recipientModel: 'StoreKeeper'
    }).sort({ createdAt: -1 }).limit(20);
    
    console.log(`\n📋 Recent notifications for ANY store keeper: ${recentNotifications.length}`);
    
    res.json({
      success: true,
      debug: {
        storeKeeperExists: {
          inOwnCollection: !!storeKeeperInOwnCollection,
          inUserCollection: !!storeKeeperInUserCollection,
          details: storeKeeperInOwnCollection || storeKeeperInUserCollection
        },
        notificationsForThisStoreKeeper: {
          count: notificationsInDb.length,
          notifications: notificationsInDb
        },
        recentStoreKeeperNotifications: {
          count: recentNotifications.length,
          notifications: recentNotifications
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    TEST: Send test notification to store keeper
// @route   POST /api/notifications/test/storekeeper
// @access  Private (Admin only)
export const testStoreKeeperNotification = async (req, res) => {
  console.log('\n🧪 ===== TEST STORE KEEPER NOTIFICATION =====');
  
  try {
    const { storeKeeperId } = req.body;
    
    let targetStoreKeepers = [];
    
    if (storeKeeperId) {
      // Test specific store keeper
      const storeKeeper = await StoreKeeper.findById(storeKeeperId).lean();
      if (storeKeeper) {
        targetStoreKeepers = [{
          ...storeKeeper,
          recipientModel: 'StoreKeeper'
        }];
      }
    } else {
      // Test all store keepers
      const storeKeepers = await StoreKeeper.find({ isActive: true }).lean();
      targetStoreKeepers = storeKeepers.map(k => ({
        ...k,
        recipientModel: 'StoreKeeper'
      }));
    }
    
    if (targetStoreKeepers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No store keepers found'
      });
    }
    
    console.log(`📋 Found ${targetStoreKeepers.length} store keepers`);
    
    // Create test notifications
    const notifications = targetStoreKeepers.map(keeper => ({
      type: 'test',
      recipient: keeper._id,
      recipientModel: 'StoreKeeper',
      title: '🧪 Test Notification',
      message: `This is a test notification for Store Keeper: ${keeper.name || keeper.email}`,
      reference: {},
      priority: 'normal',
      isRead: false,
      createdAt: new Date()
    }));
    
    const result = await Notification.insertMany(notifications);
    
    console.log(`✅ Created ${result.length} test notifications`);
    
    res.json({
      success: true,
      message: `Created ${result.length} test notifications`,
      data: {
        count: result.length,
        storeKeepers: targetStoreKeepers.map(k => ({
          id: k._id,
          name: k.name,
          email: k.email
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Test error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
};