// //above is corte code below is testing 

// // controllers/work.controller.js
// import Work from '../models/Work.js';
// import Order from '../models/Order.js';
// import Garment from '../models/Garment.js';
// import CuttingMaster from '../models/CuttingMaster.js';
// import Tailor from '../models/Tailor.js';
// import Notification from '../models/Notification.js';
// import { createNotification } from './notification.controller.js';

// // @desc    Create work for each garment in an order
// // @route   POST /api/works/create-from-order/:orderId
// // @access  Private (Store Keeper, Admin)
// export const createWorksFromOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     // Get order with garments
//     const order = await Order.findById(orderId)
//       .populate('garments');
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     const works = [];
    
//     // Create work for each garment
//     for (const garment of order.garments) {
//       // Generate measurement PDF (you can implement PDF generation later)
//       const measurementPdf = await generateMeasurementPdf(garment);
      
//       // ✅ OPEN POOL MODEL: Create with null cuttingMaster
//       const work = await Work.create({
//         order: orderId,
//         garment: garment._id,
//         estimatedDelivery: garment.estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000),
//         createdBy: req.user._id,
//         measurementPdf,
//         status: 'pending',           // Waiting for acceptance
//         cuttingMaster: null,          // ⭐ NOT assigned to anyone
//         workId: generateWorkId(garment.name) // Add work ID generation
//       });
      
//       works.push(work);
//     }

//     // ✅ Notify ALL cutting masters about available works
//     const cuttingMasters = await CuttingMaster.find({ isActive: true });
    
//     for (const master of cuttingMasters) {
//       try {
//         await createNotification({
//           type: 'work-available',        // Changed from 'work-assigned'
//           recipient: master._id,
//           title: '🔔 New Work Available in Pool',
//           message: `${works.length} new work(s) are waiting for your acceptance. Click to view and accept.`,
//           reference: {
//             orderId: order._id,
//             workCount: works.length,
//             workIds: works.map(w => w._id)
//           },
//           priority: 'high'
//         });
//       } catch (notifError) {
//         console.error(`❌ Failed to notify cutting master ${master._id}:`, notifError.message);
//       }
//     }

//     res.status(201).json({
//       success: true,
//       message: `Created ${works.length} works (open for acceptance)`,
//       data: works
//     });

//   } catch (error) {
//     console.error('Create works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create works',
//       error: error.message
//     });
//   }
// };

// // @desc    Get all works (with filters)
// // @route   GET /api/works
// // @access  Private
// export const getWorks = async (req, res) => {
//   try {
//     const {
//       status,
//       cuttingMaster,
//       tailor,
//       orderId,
//       startDate,
//       endDate,
//       page = 1,
//       limit = 20
//     } = req.query;

//     const filter = { isActive: true };

//     if (status) filter.status = status;
//     if (cuttingMaster) filter.cuttingMaster = cuttingMaster;
//     if (tailor) filter.tailor = tailor;
//     if (orderId) filter.order = orderId;

//     // Date range filter
//     if (startDate || endDate) {
//       filter.workDate = {};
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         filter.workDate.$gte = start;
//       }
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         filter.workDate.$lte = end;
//       }
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const works = await Work.find(filter)
//       .populate('order', 'orderId customer deliveryDate')
//       .populate('garment', 'name garmentId measurements')
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name employeeId')
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Work.countDocuments(filter);

//     res.json({
//       success: true,
//       data: {
//         works,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };

// // @desc    Get work by ID
// // @route   GET /api/works/:id
// // @access  Private
// export const getWorkById = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id)
//       .populate('order', 'orderId customer orderDate deliveryDate')
//       .populate('garment')
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name employeeId phone')
//       .populate('createdBy', 'name');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: work
//     });

//   } catch (error) {
//     console.error('Get work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch work',
//       error: error.message
//     });
//   }
// };

// // ===== OPEN POOL: GET WORKS FOR CUTTING MASTER DASHBOARD =====
// // @desc    Get works for cutting master (shows both accepted and available)
// // @route   GET /api/works/my-works
// // @access  Private (Cutting Master only)
// // export const getWorksByCuttingMaster = async (req, res) => {
// //   try {
// //     const userId = req.user?._id || req.user?.id;

// //     console.log('📋 Getting works for cutting master:', {
// //       userId,
// //       role: req.user?.role
// //     });

// //     if (!userId) {
// //       return res.status(401).json({
// //         success: false,
// //         message: 'User ID not found'
// //       });
// //     }

// //     // ✅ OPEN POOL FILTER: Show both:
// //     // 1. Works already accepted by this master
// //     // 2. All pending works (open for acceptance by anyone)
// //     const filter = {
// //       $or: [
// //         { cuttingMaster: userId },                    // Already accepted by this master
// //         { cuttingMaster: null, status: 'pending' }    // ⭐ Open for everyone to accept
// //       ],
// //       isActive: true
// //     };

// //     console.log('🔍 Filter:', JSON.stringify(filter));

// //     const works = await Work.find(filter)
// //       .populate({
// //         path: 'order',
// //         select: 'orderId customer deliveryDate',
// //         populate: {
// //           path: 'customer',
// //           select: 'name phone'
// //         }
// //       })
// //       .populate({
// //         path: 'garment',
// //         select: 'name garmentId measurements priceRange'
// //       })
// //       .populate('tailor', 'name')
// //       .sort({ createdAt: -1 });

// //     console.log(`✅ Found ${works.length} works`);

// //     // ✅ Add flags to help frontend know status
// //     const worksWithAcceptanceInfo = works.map(work => {
// //       const workObj = work.toObject();
// //       workObj.isAcceptedByMe = work.cuttingMaster?.toString() === userId?.toString();
// //       workObj.isAvailable = !work.cuttingMaster && work.status === 'pending';
// //       workObj.canAccept = !work.cuttingMaster && work.status === 'pending';
// //       return workObj;
// //     });

// //     res.json({
// //       success: true,
// //       data: {
// //         works: worksWithAcceptanceInfo,
// //         total: works.length
// //       }
// //     });

// //   } catch (error) {
// //     console.error('❌ Get cutting master works error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to fetch works',
// //       error: error.message
// //     });
// //   }
// // };



// // ===== OPEN POOL: GET WORKS FOR CUTTING MASTER DASHBOARD =====
// // @desc    Get works for cutting master (shows both accepted and available)
// // @route   GET /api/works/my-works
// // @access  Private (Cutting Master only)
// export const getWorksByCuttingMaster = async (req, res) => {
//   try {
//     const userId = req.user?._id || req.user?.id;

//     console.log('📋 Getting works for cutting master:', {
//       userId,
//       role: req.user?.role
//     });

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     // ✅ OPEN POOL FILTER: Show both:
//     // 1. Works already accepted by this master
//     // 2. All pending works (open for acceptance by anyone)
//     const filter = {
//       $or: [
//         { cuttingMaster: userId },                    // Already accepted by this master
//         { cuttingMaster: null, status: 'pending' }    // ⭐ Open for everyone to accept
//       ],
//       isActive: true
//     };

//     console.log('🔍 Filter:', JSON.stringify(filter));

//     const works = await Work.find(filter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer deliveryDate',
//         populate: {
//           path: 'customer',
//           select: 'name phone'
//         }
//       })
//       .populate({
//         path: 'garment',
//         // 🔥 FIX: Add priority field here!
//         select: 'name garmentId measurements priceRange priority estimatedDelivery additionalInfo'
//       })
//       .populate('tailor', 'name')
//       .sort({ createdAt: -1 });

//     console.log(`✅ Found ${works.length} works`);

//     // ✅ Add flags to help frontend know status
//     const worksWithAcceptanceInfo = works.map(work => {
//       const workObj = work.toObject();
//       workObj.isAcceptedByMe = work.cuttingMaster?.toString() === userId?.toString();
//       workObj.isAvailable = !work.cuttingMaster && work.status === 'pending';
//       workObj.canAccept = !work.cuttingMaster && work.status === 'pending';
      
//       // 🔥 Log garment priority for debugging
//       console.log(`Work ${work.workId}: Garment priority = ${work.garment?.priority || 'not found'}`);
      
//       return workObj;
//     });

//     res.json({
//       success: true,
//       data: {
//         works: worksWithAcceptanceInfo,
//         total: works.length
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get cutting master works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };

// // ===== OPEN POOL: ACCEPT WORK (FIRST COME FIRST SERVE) =====
// // @desc    Accept work (Cutting Master)
// // @route   PATCH /api/works/:id/accept
// // @access  Private (Cutting Master only)
// export const acceptWork = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // ✅ Check if already accepted by someone else
//     if (work.cuttingMaster) {
//       return res.status(400).json({
//         success: false,
//         message: 'This work was already accepted by another cutting master'
//       });
//     }

//     // ✅ Check if work is pending
//     if (work.status !== 'pending') {
//       return res.status(400).json({
//         success: false,
//         message: `This work is not available for acceptance (status: ${work.status})`
//       });
//     }

//     // ✅ Assign work to this cutting master (FIRST COME FIRST SERVE)
//     work.status = 'accepted';
//     work.cuttingMaster = req.user._id;
//     work.acceptedAt = new Date();
//     await work.save();

//     console.log(`✅ Work ${work._id} accepted by cutting master ${req.user._id}`);

//     // ✅ Update order status if all works are accepted
//     const pendingWorks = await Work.countDocuments({
//       order: work.order._id,
//       status: 'pending'
//     });

//     if (pendingWorks === 0) {
//       await Order.findByIdAndUpdate(work.order._id, {
//         status: 'confirmed'
//       });
//       console.log(`✅ Order ${work.order._id} all works accepted, status updated to confirmed`);
//     }

//     // ✅ Notify store keeper
//     if (work.order && work.order.createdBy) {
//       await createNotification({
//         type: 'work-accepted',
//         recipient: work.order.createdBy,
//         recipientModel: 'User', // ✅ Added recipientModel
//         title: '✅ Work Accepted',
//         message: `Cutting master accepted work for ${work.garment.name}`,
//         reference: {
//           orderId: work.order._id,
//           workId: work._id,
//           garmentId: work.garment._id
//         },
//         priority: 'high'
//       });
//     }

//     // ✅ Send confirmation to the cutting master - FIXED
//     await createNotification({
//       type: 'work-accepted', // 🔥 FIXED: Changed from 'work-accepted-confirmation' to 'work-accepted'
//       recipient: req.user._id,
//       recipientModel: 'CuttingMaster', // ✅ Added recipientModel
//       title: '✅ You Accepted a Work',
//       message: `You have successfully accepted work for ${work.garment.name}`,
//       reference: {
//         orderId: work.order._id,
//         workId: work._id
//       },
//       priority: 'normal' // 🔥 FIXED: Changed from 'medium' to 'normal'
//     });

//     res.json({
//       success: true,
//       message: 'Work accepted successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('Accept work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to accept work',
//       error: error.message
//     });
//   }
// };

// // ✅ FIXED: Assign tailor to work - Now updates tailor stats correctly
// // @desc    Assign tailor to work (Cutting Master)
// // @route   PATCH /api/works/:id/assign-tailor
// // @access  Private (Cutting Master only)
// export const assignTailor = async (req, res) => {
//   try {
//     const { tailorId } = req.body;
//     const work = await Work.findById(req.params.id)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // ✅ Check if cutting master exists before comparing
//     if (!work.cuttingMaster) {
//       // If no cutting master, assign the current user as cutting master
//       work.cuttingMaster = req.user._id;
//       work.status = 'accepted';
//       console.log(`✅ Auto-assigned cutting master ${req.user._id} to work ${work._id}`);
//     } else if (work.cuttingMaster.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to assign tailor for this work'
//       });
//     }

//     // ✅ If work already has a tailor assigned, remove all their stats for this work
//     if (work.tailor && work.tailor.toString() !== tailorId) {
//       const previousTailorId = work.tailor;
      
//       // Determine which stat to decrement based on current work status
//       const decrementUpdate = { 'workStats.totalAssigned': -1 };
      
//       if (work.status === 'pending' || work.status === 'accepted') {
//         decrementUpdate['workStats.pending'] = -1;
//       } else if (['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(work.status)) {
//         decrementUpdate['workStats.inProgress'] = -1;
//       } else if (work.status === 'ready-to-deliver') {
//         decrementUpdate['workStats.completed'] = -1;
//       }
      
//       await Tailor.findByIdAndUpdate(previousTailorId, {
//         $inc: decrementUpdate
//       });
//       console.log(`✅ Removed stats from previous tailor ${previousTailorId}:`, decrementUpdate);
//     }

//     // ✅ Update work with new tailor
//     work.tailor = tailorId;
//     await work.save();

//     // ✅ Determine which stat to increment based on current work status
//     const incrementUpdate = { 'workStats.totalAssigned': 1 };
    
//     if (work.status === 'pending' || work.status === 'accepted') {
//       incrementUpdate['workStats.pending'] = 1;
//     } else if (['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(work.status)) {
//       incrementUpdate['workStats.inProgress'] = 1;
//     } else if (work.status === 'ready-to-deliver') {
//       incrementUpdate['workStats.completed'] = 1;
//     }

//     // ✅ Update new tailor's workStats
//     await Tailor.findByIdAndUpdate(tailorId, {
//       $inc: incrementUpdate
//     });
//     console.log(`✅ Added stats to new tailor ${tailorId}:`, incrementUpdate);

//     // ✅ Notify the assigned tailor - FIXED
//     try {
//       await createNotification({
//         type: 'work-assigned', // ✅ Matches schema enum
//         recipient: tailorId,
//         recipientModel: 'Tailor', // 🔥 FIXED: Added recipientModel
//         title: '📋 New Work Assigned',
//         message: `You have been assigned to work on ${work.garment.name}`,
//         reference: {
//           orderId: work.order._id,
//           workId: work._id,
//           garmentId: work.garment._id
//         },
//         priority: 'high'
//       });
//       console.log(`✅ Notification sent to tailor ${tailorId}`);
//     } catch (notifError) {
//       console.error('❌ Failed to send notification:', notifError);
//       // Don't fail the whole request if notification fails
//     }

//     res.json({
//       success: true,
//       message: 'Tailor assigned successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('❌ Assign tailor error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to assign tailor',
//       error: error.message
//     });
//   }
// };

// // ✅ FIXED: Update work status - Now updates tailor stats correctly
// // @desc    Update work status (Cutting Master)
// // @route   PATCH /api/works/:id/status
// // @access  Private (Cutting Master only)
// export const updateWorkStatus = async (req, res) => {
//   console.log('\n🔄 ===== UPDATE WORK STATUS CALLED =====');
//   console.log('Request params:', req.params);
//   console.log('Request body:', req.body);
//   console.log('User:', req.user?._id || req.user?.id);
  
//   try {
//     const { status, notes } = req.body;
//     const workId = req.params.id;

//     console.log('1️⃣ Finding work with ID:', workId);
//     const work = await Work.findById(workId)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       console.log('❌ Work not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     console.log('2️⃣ Work found:', {
//       id: work._id,
//       currentStatus: work.status,
//       newStatus: status,
//       cuttingMaster: work.cuttingMaster,
//       tailor: work.tailor,
//       hasGarment: !!work.garment,
//       hasOrder: !!work.order
//     });

//     // Store previous status for comparison
//     const previousStatus = work.status;

//     // ✅ Check if cutting master exists before comparing
//     console.log('3️⃣ Checking authorization...');
//     if (work.cuttingMaster) {
//       console.log('   Cutting master exists:', work.cuttingMaster.toString());
//       console.log('   Current user:', req.user._id.toString());
      
//       if (work.cuttingMaster.toString() !== req.user._id.toString()) {
//         console.log('❌ Unauthorized - cutting master mismatch');
//         return res.status(403).json({
//           success: false,
//           message: 'Not authorized to update this work'
//         });
//       }
//       console.log('✅ Authorization passed');
//     } else {
//       console.log('⚠️ No cutting master assigned, auto-assigning current user');
//       work.cuttingMaster = req.user._id;
//     }

//     // Validate status
//     console.log('4️⃣ Validating status:', status);
//     const validStatuses = [
//       'pending', 'accepted', 'cutting-started', 'cutting-completed',
//       'sewing-started', 'sewing-completed', 'ironing', 'ready-to-deliver'
//     ];

//     if (!validStatuses.includes(status)) {
//       console.log('❌ Invalid status:', status);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status value'
//       });
//     }
//     console.log('✅ Status valid');

//     // Update status and set corresponding timestamp
//     console.log('5️⃣ Updating work data...');
//     const statusUpdates = {
//       'cutting-started': { cuttingStartedAt: new Date() },
//       'cutting-completed': { cuttingCompletedAt: new Date() },
//       'sewing-started': { sewingStartedAt: new Date() },
//       'sewing-completed': { sewingCompletedAt: new Date() },
//       'ironing': { ironingAt: new Date() },
//       'ready-to-deliver': { readyAt: new Date() }
//     };

//     // Update work
//     work.status = status;
    
//     // Add timestamp if applicable
//     if (statusUpdates[status]) {
//       Object.assign(work, statusUpdates[status]);
//       console.log(`   Set timestamp for ${status}`);
//     }
    
//     // Add notes if provided
//     if (notes) {
//       if (status.includes('cutting')) {
//         work.cuttingNotes = notes;
//         console.log('   Added cutting notes');
//       } else {
//         work.tailorNotes = notes;
//         console.log('   Added tailor notes');
//       }
//     }

//     console.log('6️⃣ Saving work...');
//     await work.save();
//     console.log('✅ Work saved successfully');

//     // ✅ FIXED: UPDATE TAILOR STATS BASED ON STATUS CHANGE
//     if (work.tailor) {
//       console.log('7️⃣ Updating tailor stats...');
      
//       // CORRECTED status to workStats mapping
//       const statusToCategory = {
//         'pending': 'pending',
//         'accepted': 'pending',
//         'cutting-started': 'inProgress',
//         'cutting-completed': 'inProgress',
//         'sewing-started': 'inProgress',
//         'sewing-completed': 'inProgress',
//         'ironing': 'inProgress',
//         'ready-to-deliver': 'completed'
//       };

//       const previousCategory = statusToCategory[previousStatus];
//       const newCategory = statusToCategory[status];

//       console.log('   Previous status:', previousStatus, '-> Category:', previousCategory);
//       console.log('   New status:', status, '-> Category:', newCategory);

//       const tailorUpdate = {};

//       // Only update if the category actually changed
//       if (previousCategory !== newCategory) {
//         // Decrement previous category
//         if (previousCategory) {
//           tailorUpdate[`workStats.${previousCategory}`] = -1;
//           console.log(`   Decrement ${previousCategory} by 1`);
//         }
        
//         // Increment new category
//         if (newCategory) {
//           tailorUpdate[`workStats.${newCategory}`] = 1;
//           console.log(`   Increment ${newCategory} by 1`);
//         }
//       } else {
//         console.log('   Same category, no stats update needed');
//       }

//       // Apply updates if there are any
//       if (Object.keys(tailorUpdate).length > 0) {
//         await Tailor.findByIdAndUpdate(work.tailor, {
//           $inc: tailorUpdate
//         });
//         console.log('✅ Updated tailor stats:', tailorUpdate);
//       } else {
//         console.log('⚠️ No tailor stats to update');
//       }
//     }

//     // Try to send notification - FIXED
//     console.log('8️⃣ Sending notification...');
//     try {
//       if (work.order && work.order.createdBy) {
//         await createNotification({
//           type: 'work-status-update',
//           recipient: work.order.createdBy,
//           recipientModel: 'User', // ✅ Added recipientModel
//           title: '🔄 Work Status Updated',
//           message: `${work.garment?.name || 'Garment'} is now ${status.replace(/-/g, ' ')}`,
//           reference: {
//             orderId: work.order._id,
//             workId: work._id,
//             garmentId: work.garment?._id
//           },
//           priority: 'normal' // 🔥 FIXED: Added priority field
//         });
//         console.log('✅ Notification sent');
//       } else {
//         console.log('⚠️ Cannot send notification - missing order or createdBy');
//       }
//     } catch (notifError) {
//       console.log('⚠️ Notification failed:', notifError.message);
//       // Don't fail the request if notification fails
//     }

//     console.log('9️⃣ Sending success response');
//     console.log('🔄 ===== UPDATE WORK STATUS COMPLETED =====\n');
    
//     res.json({
//       success: true,
//       message: 'Work status updated successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('\n❌ ===== UPDATE WORK STATUS ERROR =====');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     if (error.code) console.error('Error code:', error.code);
//     console.error('❌ ===== ERROR END =====\n');
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update work status',
//       error: error.message
//     });
//   }
// };

// // @desc    Delete work (Admin only)
// // @route   DELETE /api/works/:id
// // @access  Private (Admin only)
// export const deleteWork = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id);

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // Only admin can delete
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({
//         success: false,
//         message: 'Only admin can delete works'
//       });
//     }

//     // ✅ If work had a tailor assigned, remove all their stats
//     if (work.tailor) {
//       const decrementUpdate = { 'workStats.totalAssigned': -1 };
      
//       if (work.status === 'pending' || work.status === 'accepted') {
//         decrementUpdate['workStats.pending'] = -1;
//       } else if (['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(work.status)) {
//         decrementUpdate['workStats.inProgress'] = -1;
//       } else if (work.status === 'ready-to-deliver') {
//         decrementUpdate['workStats.completed'] = -1;
//       }
      
//       await Tailor.findByIdAndUpdate(work.tailor, {
//         $inc: decrementUpdate
//       });
//       console.log(`✅ Removed stats from tailor ${work.tailor}:`, decrementUpdate);
//     }

//     await work.deleteOne();

//     res.json({
//       success: true,
//       message: 'Work deleted successfully'
//     });

//   } catch (error) {
//     console.error('Delete work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete work',
//       error: error.message
//     });
//   }
// };

// // @desc    Get work statistics
// // @route   GET /api/works/stats
// // @access  Private (Admin, Store Keeper)
// export const getWorkStats = async (req, res) => {
//   try {
//     console.log('📊 Fetching work statistics...');
    
//     // Aggregate work statistics by status
//     const stats = await Work.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalWorks: { $sum: 1 },
//           pendingWorks: {
//             $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
//           },
//           acceptedWorks: {
//             $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
//           },
//           cuttingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-started'] }, 1, 0] }
//           },
//           cuttingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-completed'] }, 1, 0] }
//           },
//           sewingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-started'] }, 1, 0] }
//           },
//           sewingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-completed'] }, 1, 0] }
//           },
//           ironing: {
//             $sum: { $cond: [{ $eq: ['$status', 'ironing'] }, 1, 0] }
//           },
//           readyToDeliver: {
//             $sum: { $cond: [{ $eq: ['$status', 'ready-to-deliver'] }, 1, 0] }
//           }
//         }
//       }
//     ]);

//     // Get today's works
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const todayWorks = await Work.countDocuments({
//       createdAt: { $gte: today }
//     });

//     // Get overdue works (estimated delivery passed and not ready)
//     const overdueWorks = await Work.countDocuments({
//       estimatedDelivery: { $lt: new Date() },
//       status: { $ne: 'ready-to-deliver' }
//     });

//     const result = stats[0] || {
//       totalWorks: 0,
//       pendingWorks: 0,
//       acceptedWorks: 0,
//       cuttingStarted: 0,
//       cuttingCompleted: 0,
//       sewingStarted: 0,
//       sewingCompleted: 0,
//       ironing: 0,
//       readyToDeliver: 0
//     };

//     res.json({
//       success: true,
//       data: {
//         ...result,
//         todayWorks,
//         overdueWorks
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get work stats error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch work statistics',
//       error: error.message 
//     });
//   }
// };

// // @desc    Get works by tailor
// // @route   GET /api/works/tailor-works
// // @access  Private (Tailor only)
// export const getWorksByTailor = async (req, res) => {
//   try {
//     const tailorId = req.user?._id || req.user?.id;
    
//     if (!tailorId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     const { status, page = 1, limit = 20 } = req.query;

//     const filter = { 
//       tailor: tailorId,
//       isActive: true 
//     };
    
//     if (status && status !== 'all' && status !== '') {
//       filter.status = status;
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const works = await Work.find(filter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer',
//         populate: {
//           path: 'customer',
//           select: 'name'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId measurements'
//       })
//       .populate('cuttingMaster', 'name')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Work.countDocuments(filter);

//     res.json({
//       success: true,
//       data: {
//         works,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get tailor works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };

// // @desc    Assign cutting master to work (Admin/Store Keeper)
// // @route   PATCH /api/works/:id/assign-cutting-master
// // @access  Private (Admin, Store Keeper)
// export const assignCuttingMaster = async (req, res) => {
//   console.log('\n✂️ ===== ASSIGN CUTTING MASTER CALLED =====');
//   console.log('Work ID:', req.params.id);
//   console.log('Request body:', req.body);
  
//   try {
//     const { cuttingMasterId } = req.body;
//     const workId = req.params.id;

//     if (!cuttingMasterId) {
//       return res.status(400).json({
//         success: false,
//         message: 'cuttingMasterId is required'
//       });
//     }

//     const work = await Work.findById(workId);
//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // If work is pending, assign directly
//     work.cuttingMaster = cuttingMasterId;
//     if (work.status === 'pending') {
//       work.status = 'accepted';
//       work.acceptedAt = new Date();
//     }
//     await work.save();

//     console.log(`✅ Cutting master ${cuttingMasterId} assigned to work ${workId}`);

//     // ✅ Notify the assigned master - FIXED
//     await createNotification({
//       type: 'work-assigned',
//       recipient: cuttingMasterId,
//       recipientModel: 'CuttingMaster', // 🔥 FIXED: Added recipientModel
//       title: '📋 Work Assigned to You',
//       message: `Work ${work.workId} has been assigned to you`,
//       reference: { workId: work._id },
//       priority: 'high' // ✅ Added priority
//     });

//     res.json({ 
//       success: true, 
//       message: 'Cutting master assigned', 
//       data: work 
//     });
//   } catch (error) {
//     console.error('❌ Assign cutting master error:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };

// // ===== PERMANENT FIX: RECALCULATE AND UPDATE TAILOR STATS =====
// // @desc    Recalculate and update stats for a specific tailor
// // @route   POST /api/works/recalculate-tailor-stats/:tailorId
// // @access  Private (Admin, Store Keeper)
// export const recalculateTailorStats = async (req, res) => {
//   try {
//     const { tailorId } = req.params;
    
//     console.log('🔄 Recalculating stats for tailor:', tailorId);
    
//     // Get all works for this tailor
//     const works = await Work.find({ 
//       tailor: tailorId,
//       isActive: true 
//     });

//     console.log('📋 Works found:', works.length);
    
//     // Calculate correct stats based on actual work statuses
//     const workStats = {
//       totalAssigned: works.length,
//       completed: works.filter(w => w.status === 'ready-to-deliver').length,
//       pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
//       inProgress: works.filter(w => 
//         ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//         .includes(w.status)
//       ).length
//     };

//     console.log('📊 Calculated stats:', workStats);

//     // Update tailor in database
//     const updatedTailor = await Tailor.findByIdAndUpdate(
//       tailorId,
//       { $set: { workStats } },
//       { new: true }
//     );

//     if (!updatedTailor) {
//       return res.status(404).json({
//         success: false,
//         message: 'Tailor not found'
//       });
//     }

//     console.log('✅ Tailor stats updated successfully');

//     res.json({
//       success: true,
//       message: 'Tailor stats recalculated successfully',
//       data: {
//         tailorId: updatedTailor._id,
//         name: updatedTailor.name,
//         workStats: updatedTailor.workStats,
//         worksBreakdown: works.map(w => ({
//           workId: w.workId,
//           status: w.status
//         }))
//       }
//     });

//   } catch (error) {
//     console.error('❌ Error recalculating stats:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to recalculate tailor stats',
//       error: error.message
//     });
//   }
// };

// // @desc    Recalculate and update stats for ALL tailors
// // @route   POST /api/works/recalculate-all-tailor-stats
// // @access  Private (Admin only)
// export const recalculateAllTailorStats = async (req, res) => {
//   try {
//     const tailors = await Tailor.find({ isActive: true });
//     let updated = 0;
//     let results = [];

//     for (const tailor of tailors) {
//       const works = await Work.find({ 
//         tailor: tailor._id,
//         isActive: true 
//       });

//       const workStats = {
//         totalAssigned: works.length,
//         completed: works.filter(w => w.status === 'ready-to-deliver').length,
//         pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
//         inProgress: works.filter(w => 
//           ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//           .includes(w.status)
//         ).length
//       };

//       // Only update if stats are different
//       if (JSON.stringify(tailor.workStats) !== JSON.stringify(workStats)) {
//         tailor.workStats = workStats;
//         await tailor.save();
//         updated++;
//         results.push({
//           name: tailor.name,
//           tailorId: tailor.tailorId,
//           oldStats: tailor.workStats,
//           newStats: workStats
//         });
//       }
//     }

//     res.json({
//       success: true,
//       message: `Recalculated stats for ${updated} tailors`,
//       data: {
//         updated,
//         details: results
//       }
//     });

//   } catch (error) {
//     console.error('❌ Error recalculating all stats:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to recalculate all tailor stats',
//       error: error.message
//     });
//   }
// };

// // ===== HELPER FUNCTIONS =====

// // Helper function to generate work ID
// const generateWorkId = (garmentName) => {
//   const date = new Date();
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = date.getFullYear();
//   const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
//   const prefix = garmentName?.substring(0, 3).toUpperCase() || 'WRK';
//   return `${prefix}-${day}${month}${year}-${random}`;
// };

// // Helper function to generate measurement PDF (NOT exported)
// const generateMeasurementPdf = async (garment) => {
//   // TODO: Implement PDF generation
//   // For now, return a placeholder URL
//   return `https://storage.example.com/measurements/${garment.garmentId}.pdf`;
// };


// // ============================================
// // ✅ DASHBOARD: GET WORK STATS WITH DATE FILTERS
// // ============================================
// // @desc    Get work statistics for dashboard (with date filters)
// // @route   GET /api/works/stats/dashboard
// // @access  Private (Admin, Store Keeper)
// export const getDashboardWorkStats = async (req, res) => {
//   try {
//     const { period, startDate, endDate } = req.query;
    
//     console.log('📊 Getting work stats for dashboard with:', { period, startDate, endDate });
    
//     // Build date filter
//     let dateFilter = {};
//     const now = new Date();
    
//     if (period === 'today') {
//       const today = new Date(now.setHours(0, 0, 0, 0));
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
      
//       dateFilter = {
//         createdAt: {
//           $gte: today,
//           $lt: tomorrow
//         }
//       };
//     } else if (period === 'week') {
//       const startOfWeek = new Date(now);
//       startOfWeek.setDate(now.getDate() - now.getDay());
//       startOfWeek.setHours(0, 0, 0, 0);
      
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(startOfWeek.getDate() + 7);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfWeek,
//           $lt: endOfWeek
//         }
//       };
//     } else if (period === 'month') {
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//       endOfMonth.setHours(23, 59, 59, 999);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfMonth,
//           $lte: endOfMonth
//         }
//       };
//     } else if (startDate && endDate) {
//       dateFilter = {
//         createdAt: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate + 'T23:59:59.999Z')
//         }
//       };
//     }
    
//     console.log('📅 Work date filter:', dateFilter);
    
//     // Aggregate work statistics by status
//     const stats = await Work.aggregate([
//       { $match: dateFilter },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: 1 },
//           pending: {
//             $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
//           },
//           accepted: {
//             $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
//           },
//           cuttingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-started'] }, 1, 0] }
//           },
//           cuttingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-completed'] }, 1, 0] }
//           },
//           sewingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-started'] }, 1, 0] }
//           },
//           sewingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-completed'] }, 1, 0] }
//           },
//           ironing: {
//             $sum: { $cond: [{ $eq: ['$status', 'ironing'] }, 1, 0] }
//           },
//           readyToDeliver: {
//             $sum: { $cond: [{ $eq: ['$status', 'ready-to-deliver'] }, 1, 0] }
//           },
//           cancelled: {
//             $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
//           }
//         }
//       }
//     ]);

//     // Get today's works (separate from filter)
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const todayWorks = await Work.countDocuments({
//       createdAt: { $gte: today }
//     });

//     // Get overdue works (estimated delivery passed and not ready)
//     const overdueWorks = await Work.countDocuments({
//       estimatedDelivery: { $lt: new Date() },
//       status: { $ne: 'ready-to-deliver' },
//       ...dateFilter // Apply date filter to estimated delivery
//     });

//     const result = stats[0] || {
//       total: 0,
//       pending: 0,
//       accepted: 0,
//       cuttingStarted: 0,
//       cuttingCompleted: 0,
//       sewingStarted: 0,
//       sewingCompleted: 0,
//       ironing: 0,
//       readyToDeliver: 0,
//       cancelled: 0
//     };

//     // Combine similar statuses for easier frontend use
//     const workStats = {
//       total: result.total,
//       pending: result.pending + result.accepted, // Pending includes accepted
//       inProgress: result.cuttingStarted + result.cuttingCompleted + 
//                   result.sewingStarted + result.sewingCompleted + result.ironing,
//       completed: result.readyToDeliver,
//       cancelled: result.cancelled,
//       todayWorks,
//       overdueWorks,
//       // Detailed breakdown (optional)
//       details: {
//         pending: result.pending,
//         accepted: result.accepted,
//         cuttingStarted: result.cuttingStarted,
//         cuttingCompleted: result.cuttingCompleted,
//         sewingStarted: result.sewingStarted,
//         sewingCompleted: result.sewingCompleted,
//         ironing: result.ironing,
//         readyToDeliver: result.readyToDeliver
//       },
//       filter: {
//         period,
//         startDate: dateFilter.createdAt?.$gte,
//         endDate: dateFilter.createdAt?.$lte
//       }
//     };

//     console.log('✅ Work stats for dashboard:', workStats);

//     res.json({
//       success: true,
//       data: workStats
//     });

//   } catch (error) {
//     console.error('❌ Get dashboard work stats error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch work statistics',
//       error: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ DASHBOARD: GET RECENT WORKS
// // ============================================
// // @desc    Get recent works for dashboard
// // @route   GET /api/works/recent
// // @access  Private (Admin, Store Keeper)
// // export const getRecentWorks = async (req, res) => {
// //   try {
// //     const { limit = 5, period, startDate, endDate } = req.query;
    
// //     console.log('📋 Getting recent works with:', { limit, period, startDate, endDate });
    
// //     // Build date filter
// //     let dateFilter = {};
// //     const now = new Date();
    
// //     if (period === 'today') {
// //       const today = new Date(now.setHours(0, 0, 0, 0));
// //       const tomorrow = new Date(today);
// //       tomorrow.setDate(tomorrow.getDate() + 1);
      
// //       dateFilter = {
// //         createdAt: {
// //           $gte: today,
// //           $lt: tomorrow
// //         }
// //       };
// //     } else if (period === 'week') {
// //       const startOfWeek = new Date(now);
// //       startOfWeek.setDate(now.getDate() - now.getDay());
// //       startOfWeek.setHours(0, 0, 0, 0);
      
// //       const endOfWeek = new Date(startOfWeek);
// //       endOfWeek.setDate(startOfWeek.getDate() + 7);
      
// //       dateFilter = {
// //         createdAt: {
// //           $gte: startOfWeek,
// //           $lt: endOfWeek
// //         }
// //       };
// //     } else if (period === 'month') {
// //       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
// //       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
// //       endOfMonth.setHours(23, 59, 59, 999);
      
// //       dateFilter = {
// //         createdAt: {
// //           $gte: startOfMonth,
// //           $lte: endOfMonth
// //         }
// //       };
// //     } else if (startDate && endDate) {
// //       dateFilter = {
// //         createdAt: {
// //           $gte: new Date(startDate),
// //           $lte: new Date(endDate + 'T23:59:59.999Z')
// //         }
// //       };
// //     }
    
// //     const recentWorks = await Work.find(dateFilter)
// //       .populate({
// //         path: 'order',
// //         select: 'orderId customer',
// //         populate: {
// //           path: 'customer',
// //           select: 'name phone'
// //         }
// //       })
// //       .populate({
// //         path: 'garment',
// //         select: 'name garmentId'
// //       })
// //       .populate('cuttingMaster', 'name')
// //       .populate('tailor', 'name')
// //       .sort({ createdAt: -1 })
// //       .limit(parseInt(limit));

// //     // Format for dashboard display
// //     const formattedWorks = recentWorks.map(work => ({
// //       _id: work._id,
// //       workId: work.workId,
// //       status: work.status,
// //       garment: work.garment ? {
// //         name: work.garment.name,
// //         id: work.garment.garmentId
// //       } : null,
// //       order: work.order ? {
// //         orderId: work.order.orderId,
// //         customer: work.order.customer
// //       } : null,
// //       cuttingMaster: work.cuttingMaster?.name,
// //       tailor: work.tailor?.name,
// //       createdAt: work.createdAt,
// //       estimatedDelivery: work.estimatedDelivery
// //     }));

// //     console.log(`✅ Found ${formattedWorks.length} recent works`);

// //     res.json({
// //       success: true,
// //       data: {
// //         works: formattedWorks,
// //         count: formattedWorks.length,
// //         filter: { period, startDate, endDate }
// //       }
// //     });

// //   } catch (error) {
// //     console.error('❌ Get recent works error:', error);
// //     res.status(500).json({ 
// //       success: false, 
// //       message: 'Failed to fetch recent works',
// //       error: error.message 
// //     });
// //   }
// // };


// // ============================================
// // ✅ FIXED: GET RECENT WORKS WITH PRIORITY
// // ============================================
// export const getRecentWorks = async (req, res) => {
//   try {
//     const { limit = 5, period, startDate, endDate } = req.query;
    
//     console.log('📋 Getting recent works with:', { limit, period, startDate, endDate });
    
//     // Build date filter
//     let dateFilter = {};
//     const now = new Date();
    
//     if (period === 'today') {
//       const today = new Date(now.setHours(0, 0, 0, 0));
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
      
//       dateFilter = {
//         createdAt: {
//           $gte: today,
//           $lt: tomorrow
//         }
//       };
//     } else if (period === 'week') {
//       const startOfWeek = new Date(now);
//       startOfWeek.setDate(now.getDate() - now.getDay());
//       startOfWeek.setHours(0, 0, 0, 0);
      
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(startOfWeek.getDate() + 7);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfWeek,
//           $lt: endOfWeek
//         }
//       };
//     } else if (period === 'month') {
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//       endOfMonth.setHours(23, 59, 59, 999);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfMonth,
//           $lte: endOfMonth
//         }
//       };
//     } else if (startDate && endDate) {
//       dateFilter = {
//         createdAt: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate + 'T23:59:59.999Z')
//         }
//       };
//     }
    
//     const recentWorks = await Work.find(dateFilter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer',
//         populate: {
//           path: 'customer',
//           select: 'name phone'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId priority'  // ✅ FIXED: Added 'priority'
//       })
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name')
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit));

//     // Format for dashboard display with priority
//     const formattedWorks = recentWorks.map(work => ({
//       _id: work._id,
//       workId: work.workId,
//       status: work.status,
//       garment: work.garment ? {
//         name: work.garment.name,
//         id: work.garment.garmentId,
//         priority: work.garment.priority  // ✅ Added priority
//       } : null,
//       order: work.order ? {
//         orderId: work.order.orderId,
//         customer: work.order.customer
//       } : null,
//       cuttingMaster: work.cuttingMaster?.name,
//       tailor: work.tailor?.name,
//       createdAt: work.createdAt,
//       estimatedDelivery: work.estimatedDelivery
//     }));

//     console.log(`✅ Found ${formattedWorks.length} recent works`);

//     res.json({
//       success: true,
//       data: {
//         works: formattedWorks,
//         count: formattedWorks.length,
//         filter: { period, startDate, endDate }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get recent works error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch recent works',
//       error: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ DASHBOARD: GET WORK STATUS BREAKDOWN
// // ============================================
// // @desc    Get work status breakdown for pie chart
// // @route   GET /api/works/status-breakdown
// // @access  Private (Admin, Store Keeper)
// export const getWorkStatusBreakdown = async (req, res) => {
//   try {
//     const { period, startDate, endDate } = req.query;
    
//     // Build date filter (same as above)
//     let dateFilter = {};
//     const now = new Date();
    
//     if (period === 'today') {
//       const today = new Date(now.setHours(0, 0, 0, 0));
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
      
//       dateFilter = {
//         createdAt: {
//           $gte: today,
//           $lt: tomorrow
//         }
//       };
//     } else if (period === 'week') {
//       const startOfWeek = new Date(now);
//       startOfWeek.setDate(now.getDate() - now.getDay());
//       startOfWeek.setHours(0, 0, 0, 0);
      
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(startOfWeek.getDate() + 7);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfWeek,
//           $lt: endOfWeek
//         }
//       };
//     } else if (period === 'month') {
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//       endOfMonth.setHours(23, 59, 59, 999);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfMonth,
//           $lte: endOfMonth
//         }
//       };
//     } else if (startDate && endDate) {
//       dateFilter = {
//         createdAt: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate + 'T23:59:59.999Z')
//         }
//       };
//     }
    
//     // Group by status
//     const breakdown = await Work.aggregate([
//       { $match: dateFilter },
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // Status colors for frontend
//     const statusColors = {
//       'pending': '#f59e0b',
//       'accepted': '#f59e0b',
//       'cutting-started': '#3b82f6',
//       'cutting-completed': '#3b82f6',
//       'sewing-started': '#3b82f6',
//       'sewing-completed': '#3b82f6',
//       'ironing': '#3b82f6',
//       'ready-to-deliver': '#10b981',
//       'cancelled': '#ef4444'
//     };

//     // Map status to display names
//     const statusNames = {
//       'pending': 'Pending',
//       'accepted': 'Accepted',
//       'cutting-started': 'Cutting Started',
//       'cutting-completed': 'Cutting Done',
//       'sewing-started': 'Sewing Started',
//       'sewing-completed': 'Sewing Done',
//       'ironing': 'Ironing',
//       'ready-to-deliver': 'Ready',
//       'cancelled': 'Cancelled'
//     };

//     // For pie chart, we want to combine similar statuses
//     const pieData = [
//       { name: 'Pending', value: 0, color: '#f59e0b' },
//       { name: 'In Progress', value: 0, color: '#3b82f6' },
//       { name: 'Ready', value: 0, color: '#10b981' },
//       { name: 'Cancelled', value: 0, color: '#ef4444' }
//     ];

//     breakdown.forEach(item => {
//       if (['pending', 'accepted'].includes(item._id)) {
//         pieData[0].value += item.count; // Pending
//       } else if (['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(item._id)) {
//         pieData[1].value += item.count; // In Progress
//       } else if (item._id === 'ready-to-deliver') {
//         pieData[2].value = item.count; // Ready
//       } else if (item._id === 'cancelled') {
//         pieData[3].value = item.count; // Cancelled
//       }
//     });

//     res.json({
//       success: true,
//       data: {
//         breakdown: breakdown.map(item => ({
//           status: item._id,
//           name: statusNames[item._id] || item._id,
//           count: item.count,
//           color: statusColors[item._id] || '#94a3b8'
//         })),
//         pieData: pieData.filter(item => item.value > 0),
//         total: breakdown.reduce((sum, item) => sum + item.count, 0)
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get work status breakdown error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch work status breakdown',
//       error: error.message 
//     });
//   }
// };




// // ============================================
// // ✅ CALENDAR WORK DATA
// // ============================================
// // @desc    Get work data for calendar view
// // @route   GET /api/works/calendar
// // @access  Private
// export const getCalendarWorkData = async (req, res) => {
//   try {
//     const { startDate, endDate, cuttingMasterId, tailorId } = req.query;
    
//     console.log('📅 Getting calendar work data:', { startDate, endDate, cuttingMasterId, tailorId });
    
//     // Build filter
//     const filter = { isActive: true };
    
//     // Date range filter (if provided)
//     if (startDate || endDate) {
//       filter.$or = [
//         { createdAt: {} },
//         { estimatedDelivery: {} }
//       ];
      
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         filter.$or[0].createdAt.$gte = start;
//         filter.$or[1].estimatedDelivery.$gte = start;
//       }
      
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         filter.$or[0].createdAt.$lte = end;
//         filter.$or[1].estimatedDelivery.$lte = end;
//       }
//     }
    
//     // Filter by cutting master
//     if (cuttingMasterId) {
//       filter.cuttingMaster = cuttingMasterId;
//     }
    
//     // Filter by tailor
//     if (tailorId) {
//       filter.tailor = tailorId;
//     }
    
//     // Get works for calendar
//     const works = await Work.find(filter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer',
//         populate: {
//           path: 'customer',
//           select: 'name'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId'
//       })
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name')
//       .select('workId status createdAt estimatedDelivery cuttingMaster tailor order garment');
    
//     // Format for calendar (FullCalendar or similar)
//     const calendarEvents = works.map(work => {
//       // Determine color based on status
//       let color = '#3788d8'; // default blue
//       if (work.status === 'ready-to-deliver') color = '#10b981'; // green
//       if (work.status === 'pending') color = '#f59e0b'; // orange
//       if (work.status === 'cancelled') color = '#ef4444'; // red
      
//       return {
//         id: work._id,
//         title: `${work.workId} - ${work.garment?.name || 'Garment'}`,
//         start: work.estimatedDelivery || work.createdAt,
//         allDay: true,
//         backgroundColor: color,
//         borderColor: color,
//         extendedProps: {
//           workId: work.workId,
//           status: work.status,
//           orderId: work.order?.orderId,
//           customer: work.order?.customer?.name,
//           garment: work.garment?.name,
//           cuttingMaster: work.cuttingMaster?.name,
//           tailor: work.tailor?.name,
//           createdAt: work.createdAt
//         }
//       };
//     });
    
//     res.json({
//       success: true,
//       data: {
//         events: calendarEvents,
//         total: calendarEvents.length
//       }
//     });
    
//   } catch (error) {
//     console.error('❌ Get calendar work data error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch calendar data',
//       error: error.message
//     });
//   }
// };

// // ============================================
// // ✅ CUTTING MASTER DASHBOARD STATS
// // ============================================
// // @desc    Get cutting master dashboard statistics
// // @route   GET /api/works/cutting-master-stats
// // @access  Private (Cutting Master only)
// export const getCuttingMasterDashboardStats = async (req, res) => {
//   try {
//     const cuttingMasterId = req.user?._id || req.user?.id;
    
//     console.log('📊 Getting cutting master dashboard stats for:', cuttingMasterId);

//     if (!cuttingMasterId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     // Get all works for this cutting master
//     const works = await Work.find({
//       cuttingMaster: cuttingMasterId,
//       isActive: true
//     });

//     // Calculate statistics
//     const stats = {
//       totalWorks: works.length,
//       pendingWorks: works.filter(w => w.status === 'pending').length,
//       acceptedWorks: works.filter(w => w.status === 'accepted').length,
//       cuttingStarted: works.filter(w => w.status === 'cutting-started').length,
//       cuttingCompleted: works.filter(w => w.status === 'cutting-completed').length,
//       sewingStarted: works.filter(w => w.status === 'sewing-started').length,
//       sewingCompleted: works.filter(w => w.status === 'sewing-completed').length,
//       ironing: works.filter(w => w.status === 'ironing').length,
//       readyToDeliver: works.filter(w => w.status === 'ready-to-deliver').length,
//       completed: works.filter(w => w.status === 'ready-to-deliver').length,
//       inProgress: works.filter(w => 
//         ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//         .includes(w.status)
//       ).length
//     };

//     // Get available works in the pool (pending and not assigned to anyone)
//     const availableWorks = await Work.countDocuments({
//       cuttingMaster: null,
//       status: 'pending',
//       isActive: true
//     });

//     // Get today's works
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const todayWorks = works.filter(w => 
//       new Date(w.createdAt) >= today
//     ).length;

//     // Get overdue works
//     const overdueWorks = works.filter(w => 
//       w.estimatedDelivery && 
//       new Date(w.estimatedDelivery) < new Date() && 
//       w.status !== 'ready-to-deliver'
//     ).length;

//     res.json({
//       success: true,
//       data: {
//         ...stats,
//         availableWorks,
//         todayWorks,
//         overdueWorks,
//         recentActivities: works.slice(0, 5).map(w => ({
//           _id: w._id,
//           workId: w.workId,
//           status: w.status,
//           updatedAt: w.updatedAt
//         }))
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get cutting master dashboard stats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch cutting master statistics',
//       error: error.message
//     });
//   }
// };

// // ============================================
// // ✅ TAILOR PERFORMANCE FOR CUTTING MASTER
// // ============================================
// // @desc    Get tailor performance metrics for cutting master dashboard
// // @route   GET /api/works/tailor-performance
// // @access  Private (Cutting Master, Admin)
// export const getTailorPerformanceForMaster = async (req, res) => {
//   try {
//     const { limit = 10, search, sortBy = 'workStats.completed' } = req.query;
    
//     console.log('📊 Getting tailor performance data with:', { limit, search, sortBy });

//     // Build filter for tailors
//     const filter = { isActive: true };
    
//     // Add search if provided
//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { tailorId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Get tailors with their work stats
//     const tailors = await Tailor.find(filter)
//       .select('name tailorId phone specialization workStats currentLoad isAvailable')
//       .sort({ [sortBy]: -1 })
//       .limit(parseInt(limit));

//     // Get currently assigned works for each tailor to calculate current load
//     const tailorPerformance = await Promise.all(tailors.map(async (tailor) => {
//       // Get works currently assigned to this tailor
//       const assignedWorks = await Work.find({
//         tailor: tailor._id,
//         status: { $nin: ['ready-to-deliver', 'cancelled'] },
//         isActive: true
//       }).populate({
//         path: 'garment',
//         select: 'name priority'
//       });

//       // Calculate efficiency score (completed vs total assigned)
//       const efficiency = tailor.workStats.totalAssigned > 0 
//         ? Math.round((tailor.workStats.completed / tailor.workStats.totalAssigned) * 100) 
//         : 0;

//       // Determine availability status
//       let availability = 'available';
//       if (tailor.currentLoad >= 5) {
//         availability = 'busy';
//       } else if (tailor.currentLoad >= 3) {
//         availability = 'moderate';
//       }

//       return {
//         _id: tailor._id,
//         name: tailor.name,
//         tailorId: tailor.tailorId,
//         phone: tailor.phone,
//         specialization: tailor.specialization || 'General',
//         stats: {
//           totalAssigned: tailor.workStats.totalAssigned || 0,
//           completed: tailor.workStats.completed || 0,
//           pending: tailor.workStats.pending || 0,
//           inProgress: tailor.workStats.inProgress || 0,
//           efficiency: `${efficiency}%`
//         },
//         currentLoad: {
//           count: assignedWorks.length,
//           status: availability,
//           maxLoad: 5 // Configurable max load
//         },
//         isAvailable: tailor.isAvailable,
//         currentWorks: assignedWorks.slice(0, 3).map(w => ({
//           workId: w.workId,
//           garment: w.garment?.name,
//           priority: w.garment?.priority || 'normal',
//           status: w.status
//         }))
//       };
//     }));

//     // Get summary statistics
//     const summary = {
//       totalTailors: tailors.length,
//       availableTailors: tailorPerformance.filter(t => t.isAvailable && t.currentLoad.count < 5).length,
//       busyTailors: tailorPerformance.filter(t => !t.isAvailable || t.currentLoad.count >= 5).length,
//       totalActiveWorks: tailorPerformance.reduce((sum, t) => sum + t.currentLoad.count, 0),
//       averageEfficiency: Math.round(
//         tailorPerformance.reduce((sum, t) => {
//           const eff = parseInt(t.stats.efficiency) || 0;
//           return sum + eff;
//         }, 0) / (tailorPerformance.length || 1)
//       )
//     };

//     res.json({
//       success: true,
//       data: {
//         tailors: tailorPerformance,
//         summary,
//         filters: {
//           search,
//           sortBy,
//           limit: parseInt(limit)
//         }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get tailor performance error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch tailor performance data',
//       error: error.message
//     });
//   }
// };

// // ============================================
// // ✅ TODAY'S SUMMARY FOR MASTER
// // ============================================
// // @desc    Get today's summary for cutting master dashboard
// // @route   GET /api/works/today-summary
// // @access  Private (Cutting Master only)
// export const getTodaySummaryForMaster = async (req, res) => {
//   try {
//     const cuttingMasterId = req.user?._id || req.user?.id;
    
//     console.log('📅 Getting today\'s summary for master:', cuttingMasterId);

//     if (!cuttingMasterId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     // Set date range for today
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // Get works created today for this master
//     const todayWorks = await Work.find({
//       cuttingMaster: cuttingMasterId,
//       createdAt: {
//         $gte: today,
//         $lt: tomorrow
//       },
//       isActive: true
//     }).populate({
//       path: 'garment',
//       select: 'name'
//     });

//     // Get works due today
//     const dueToday = await Work.find({
//       cuttingMaster: cuttingMasterId,
//       estimatedDelivery: {
//         $gte: today,
//         $lt: tomorrow
//       },
//       status: { $ne: 'ready-to-deliver' },
//       isActive: true
//     }).populate({
//       path: 'garment',
//       select: 'name'
//     });

//     // Get recent status updates today
//     const recentUpdates = await Work.find({
//       cuttingMaster: cuttingMasterId,
//       updatedAt: {
//         $gte: today,
//         $lt: tomorrow
//       },
//       isActive: true
//     })
//     .sort({ updatedAt: -1 })
//     .limit(5)
//     .populate({
//       path: 'garment',
//       select: 'name'
//     });

//     // Get priority breakdown
//     const priorityBreakdown = await Work.aggregate([
//       {
//         $match: {
//           cuttingMaster: cuttingMasterId,
//           isActive: true
//         }
//       },
//       {
//         $lookup: {
//           from: 'garments',
//           localField: 'garment',
//           foreignField: '_id',
//           as: 'garmentInfo'
//         }
//       },
//       {
//         $unwind: {
//           path: '$garmentInfo',
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $group: {
//           _id: '$garmentInfo.priority',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // Format priority data
//     const priorities = {
//       high: 0,
//       medium: 0,
//       low: 0,
//       normal: 0
//     };
    
//     priorityBreakdown.forEach(item => {
//       const priority = item._id || 'normal';
//       priorities[priority] = item.count;
//     });

//     // Calculate completion rate for today
//     const completedToday = await Work.countDocuments({
//       cuttingMaster: cuttingMasterId,
//       status: 'ready-to-deliver',
//       updatedAt: {
//         $gte: today,
//         $lt: tomorrow
//       },
//       isActive: true
//     });

//     const totalActive = await Work.countDocuments({
//       cuttingMaster: cuttingMasterId,
//       status: { $nin: ['ready-to-deliver', 'cancelled'] },
//       isActive: true
//     });

//     res.json({
//       success: true,
//       data: {
//         date: today,
//         summary: {
//           newWorks: todayWorks.length,
//           dueToday: dueToday.length,
//           completedToday,
//           totalActive,
//           completionRate: totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0
//         },
//         priorities,
//         recentActivity: recentUpdates.map(w => ({
//           _id: w._id,
//           workId: w.workId,
//           garment: w.garment?.name,
//           status: w.status,
//           updatedAt: w.updatedAt,
//           timeAgo: getTimeAgo(w.updatedAt)
//         })),
//         upcomingDeadlines: dueToday.slice(0, 3).map(w => ({
//           _id: w._id,
//           workId: w.workId,
//           garment: w.garment?.name,
//           estimatedDelivery: w.estimatedDelivery
//         }))
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get today\'s summary error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch today\'s summary',
//       error: error.message
//     });
//   }
// };

// // Helper function for time ago
// const getTimeAgo = (date) => {
//   const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
//   let interval = seconds / 31536000;
//   if (interval > 1) return Math.floor(interval) + ' years ago';
  
//   interval = seconds / 2592000;
//   if (interval > 1) return Math.floor(interval) + ' months ago';
  
//   interval = seconds / 86400;
//   if (interval > 1) return Math.floor(interval) + ' days ago';
  
//   interval = seconds / 3600;
//   if (interval > 1) return Math.floor(interval) + ' hours ago';
  
//   interval = seconds / 60;
//   if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
//   return Math.floor(seconds) + ' seconds ago';
// };





// // controllers/work.controller.js
// import Work from '../models/Work.js';
// import Order from '../models/Order.js';
// import Garment from '../models/Garment.js';
// import CuttingMaster from '../models/CuttingMaster.js';
// import Tailor from '../models/Tailor.js';
// import Notification from '../models/Notification.js';
// import { createNotification } from './notification.controller.js';

// // @desc    Create work for each garment in an order
// // @route   POST /api/works/create-from-order/:orderId
// // @access  Private (Store Keeper, Admin)
// export const createWorksFromOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     // Get order with garments
//     const order = await Order.findById(orderId)
//       .populate('garments');
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     const works = [];
    
//     // Create work for each garment
//     for (const garment of order.garments) {
//       // Generate measurement PDF (you can implement PDF generation later)
//       const measurementPdf = await generateMeasurementPdf(garment);
      
//       // ✅ OPEN POOL MODEL: Create with null cuttingMaster
//       const work = await Work.create({
//         order: orderId,
//         garment: garment._id,
//         estimatedDelivery: garment.estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000),
//         createdBy: req.user._id,
//         measurementPdf,
//         status: 'pending',           // Waiting for acceptance
//         cuttingMaster: null,          // ⭐ NOT assigned to anyone
//         workId: generateWorkId(garment.name) // Add work ID generation
//       });
      
//       works.push(work);
//     }

//     // ✅ Notify ALL cutting masters about available works
//     const cuttingMasters = await CuttingMaster.find({ isActive: true });
    
//     for (const master of cuttingMasters) {
//       try {
//         await createNotification({
//           type: 'work-available',        // Changed from 'work-assigned'
//           recipient: master._id,
//           title: '🔔 New Work Available in Pool',
//           message: `${works.length} new work(s) are waiting for your acceptance. Click to view and accept.`,
//           reference: {
//             orderId: order._id,
//             workCount: works.length,
//             workIds: works.map(w => w._id)
//           },
//           priority: 'high'
//         });
//       } catch (notifError) {
//         console.error(`❌ Failed to notify cutting master ${master._id}:`, notifError.message);
//       }
//     }

//     res.status(201).json({
//       success: true,
//       message: `Created ${works.length} works (open for acceptance)`,
//       data: works
//     });

//   } catch (error) {
//     console.error('Create works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create works',
//       error: error.message
//     });
//   }
// };

// // @desc    Get all works (with filters)
// // @route   GET /api/works
// // @access  Private
// export const getWorks = async (req, res) => {
//   try {
//     const {
//       status,
//       cuttingMaster,
//       tailor,
//       orderId,
//       startDate,
//       endDate,
//       page = 1,
//       limit = 20
//     } = req.query;

//     const filter = { isActive: true };

//     if (status) filter.status = status;
//     if (cuttingMaster) filter.cuttingMaster = cuttingMaster;
//     if (tailor) filter.tailor = tailor;
//     if (orderId) filter.order = orderId;

//     // Date range filter
//     if (startDate || endDate) {
//       filter.workDate = {};
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         filter.workDate.$gte = start;
//       }
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         filter.workDate.$lte = end;
//       }
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const works = await Work.find(filter)
//       .populate('order', 'orderId customer deliveryDate')
//       .populate('garment', 'name garmentId measurements')
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name employeeId')
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Work.countDocuments(filter);

//     res.json({
//       success: true,
//       data: {
//         works,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };

// // @desc    Get work by ID
// // @route   GET /api/works/:id
// // @access  Private
// export const getWorkById = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id)
//       .populate('order', 'orderId customer orderDate deliveryDate')
//       .populate('garment')
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name employeeId phone')
//       .populate('createdBy', 'name');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: work
//     });

//   } catch (error) {
//     console.error('Get work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch work',
//       error: error.message
//     });
//   }
// };

// // ===== OPEN POOL: GET WORKS FOR CUTTING MASTER DASHBOARD =====
// // @desc    Get works for cutting master (shows both accepted and available)
// // @route   GET /api/works/my-works
// // @access  Private (Cutting Master only)
// export const getWorksByCuttingMaster = async (req, res) => {
//   try {
//     const userId = req.user?._id || req.user?.id;

//     console.log('📋 Getting works for cutting master:', {
//       userId,
//       role: req.user?.role
//     });

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     // ✅ OPEN POOL FILTER: Show both:
//     // 1. Works already accepted by this master
//     // 2. All pending works (open for acceptance by anyone)
//     const filter = {
//       $or: [
//         { cuttingMaster: userId },                    // Already accepted by this master
//         { cuttingMaster: null, status: 'pending' }    // ⭐ Open for everyone to accept
//       ],
//       isActive: true
//     };

//     console.log('🔍 Filter:', JSON.stringify(filter));

//     const works = await Work.find(filter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer deliveryDate',
//         populate: {
//           path: 'customer',
//           select: 'name phone'
//         }
//       })
//       .populate({
//         path: 'garment',
//         // 🔥 FIX: Add priority field here!
//         select: 'name garmentId measurements priceRange priority estimatedDelivery additionalInfo'
//       })
//       .populate('tailor', 'name')
//       .sort({ createdAt: -1 });

//     console.log(`✅ Found ${works.length} works`);

//     // ✅ Add flags to help frontend know status
//     const worksWithAcceptanceInfo = works.map(work => {
//       const workObj = work.toObject();
//       workObj.isAcceptedByMe = work.cuttingMaster?.toString() === userId?.toString();
//       workObj.isAvailable = !work.cuttingMaster && work.status === 'pending';
//       workObj.canAccept = !work.cuttingMaster && work.status === 'pending';
      
//       // 🔥 Log garment priority for debugging
//       console.log(`Work ${work.workId}: Garment priority = ${work.garment?.priority || 'not found'}`);
      
//       return workObj;
//     });

//     res.json({
//       success: true,
//       data: {
//         works: worksWithAcceptanceInfo,
//         total: works.length
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get cutting master works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };

// // ===== OPEN POOL: ACCEPT WORK (FIRST COME FIRST SERVE) =====
// // @desc    Accept work (Cutting Master)
// // @route   PATCH /api/works/:id/accept
// // @access  Private (Cutting Master only)
// export const acceptWork = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // ✅ Check if already accepted by someone else
//     if (work.cuttingMaster) {
//       return res.status(400).json({
//         success: false,
//         message: 'This work was already accepted by another cutting master'
//       });
//     }

//     // ✅ Check if work is pending
//     if (work.status !== 'pending') {
//       return res.status(400).json({
//         success: false,
//         message: `This work is not available for acceptance (status: ${work.status})`
//       });
//     }

//     // ✅ Assign work to this cutting master (FIRST COME FIRST SERVE)
//     work.status = 'accepted';
//     work.cuttingMaster = req.user._id;
//     work.acceptedAt = new Date();
//     await work.save();

//     console.log(`✅ Work ${work._id} accepted by cutting master ${req.user._id}`);

//     // ✅ Update order status if all works are accepted
//     const pendingWorks = await Work.countDocuments({
//       order: work.order._id,
//       status: 'pending'
//     });

//     if (pendingWorks === 0) {
//       await Order.findByIdAndUpdate(work.order._id, {
//         status: 'confirmed'
//       });
//       console.log(`✅ Order ${work.order._id} all works accepted, status updated to confirmed`);
//     }

//     // ✅ Notify store keeper
//     if (work.order && work.order.createdBy) {
//       await createNotification({
//         type: 'work-accepted',
//         recipient: work.order.createdBy,
//         recipientModel: 'User', // ✅ Added recipientModel
//         title: '✅ Work Accepted',
//         message: `Cutting master accepted work for ${work.garment.name}`,
//         reference: {
//           orderId: work.order._id,
//           workId: work._id,
//           garmentId: work.garment._id
//         },
//         priority: 'high'
//       });
//     }

//     // ✅ Send confirmation to the cutting master - FIXED
//     await createNotification({
//       type: 'work-accepted', // 🔥 FIXED: Changed from 'work-accepted-confirmation' to 'work-accepted'
//       recipient: req.user._id,
//       recipientModel: 'CuttingMaster', // ✅ Added recipientModel
//       title: '✅ You Accepted a Work',
//       message: `You have successfully accepted work for ${work.garment.name}`,
//       reference: {
//         orderId: work.order._id,
//         workId: work._id
//       },
//       priority: 'normal' // 🔥 FIXED: Changed from 'medium' to 'normal'
//     });

//     res.json({
//       success: true,
//       message: 'Work accepted successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('Accept work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to accept work',
//       error: error.message
//     });
//   }
// };

// // ✅ FIXED: Assign tailor to work - Now updates tailor stats correctly
// // @desc    Assign tailor to work (Cutting Master)
// // @route   PATCH /api/works/:id/assign-tailor
// // @access  Private (Cutting Master only)
// export const assignTailor = async (req, res) => {
//   try {
//     const { tailorId } = req.body;
//     const work = await Work.findById(req.params.id)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // ✅ Check if cutting master exists before comparing
//     if (!work.cuttingMaster) {
//       // If no cutting master, assign the current user as cutting master
//       work.cuttingMaster = req.user._id;
//       work.status = 'accepted';
//       console.log(`✅ Auto-assigned cutting master ${req.user._id} to work ${work._id}`);
//     } else if (work.cuttingMaster.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to assign tailor for this work'
//       });
//     }

//     // ✅ If work already has a tailor assigned, remove all their stats for this work
//     if (work.tailor && work.tailor.toString() !== tailorId) {
//       const previousTailorId = work.tailor;
      
//       // Determine which stat to decrement based on current work status
//       const decrementUpdate = { 'workStats.totalAssigned': -1 };
      
//       if (work.status === 'pending' || work.status === 'accepted') {
//         decrementUpdate['workStats.pending'] = -1;
//       } else if (['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(work.status)) {
//         decrementUpdate['workStats.inProgress'] = -1;
//       } else if (work.status === 'ready-to-deliver') {
//         decrementUpdate['workStats.completed'] = -1;
//       }
      
//       await Tailor.findByIdAndUpdate(previousTailorId, {
//         $inc: decrementUpdate
//       });
//       console.log(`✅ Removed stats from previous tailor ${previousTailorId}:`, decrementUpdate);
//     }

//     // ✅ Update work with new tailor
//     work.tailor = tailorId;
//     await work.save();

//     // ✅ Determine which stat to increment based on current work status
//     const incrementUpdate = { 'workStats.totalAssigned': 1 };
    
//     if (work.status === 'pending' || work.status === 'accepted') {
//       incrementUpdate['workStats.pending'] = 1;
//     } else if (['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(work.status)) {
//       incrementUpdate['workStats.inProgress'] = 1;
//     } else if (work.status === 'ready-to-deliver') {
//       incrementUpdate['workStats.completed'] = 1;
//     }

//     // ✅ Update new tailor's workStats
//     await Tailor.findByIdAndUpdate(tailorId, {
//       $inc: incrementUpdate
//     });
//     console.log(`✅ Added stats to new tailor ${tailorId}:`, incrementUpdate);

//     // ✅ Notify the assigned tailor - FIXED
//     try {
//       await createNotification({
//         type: 'work-assigned', // ✅ Matches schema enum
//         recipient: tailorId,
//         recipientModel: 'Tailor', // 🔥 FIXED: Added recipientModel
//         title: '📋 New Work Assigned',
//         message: `You have been assigned to work on ${work.garment.name}`,
//         reference: {
//           orderId: work.order._id,
//           workId: work._id,
//           garmentId: work.garment._id
//         },
//         priority: 'high'
//       });
//       console.log(`✅ Notification sent to tailor ${tailorId}`);
//     } catch (notifError) {
//       console.error('❌ Failed to send notification:', notifError);
//       // Don't fail the whole request if notification fails
//     }

//     res.json({
//       success: true,
//       message: 'Tailor assigned successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('❌ Assign tailor error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to assign tailor',
//       error: error.message
//     });
//   }
// };

// // ✅ FIXED: Update work status - Now updates order status automatically
// // @desc    Update work status (Cutting Master)
// // @route   PATCH /api/works/:id/status
// // @access  Private (Cutting Master only)
// export const updateWorkStatus = async (req, res) => {
//   console.log('\n🔄 ===== UPDATE WORK STATUS CALLED =====');
//   console.log('Request params:', req.params);
//   console.log('Request body:', req.body);
//   console.log('User:', req.user?._id || req.user?.id);
  
//   try {
//     const { status, notes } = req.body;
//     const workId = req.params.id;

//     console.log('1️⃣ Finding work with ID:', workId);
//     const work = await Work.findById(workId)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       console.log('❌ Work not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     console.log('2️⃣ Work found:', {
//       id: work._id,
//       currentStatus: work.status,
//       newStatus: status,
//       cuttingMaster: work.cuttingMaster,
//       tailor: work.tailor,
//       hasGarment: !!work.garment,
//       hasOrder: !!work.order
//     });

//     // Store previous status for comparison
//     const previousStatus = work.status;

//     // ✅ Check if cutting master exists before comparing
//     console.log('3️⃣ Checking authorization...');
//     if (work.cuttingMaster) {
//       console.log('   Cutting master exists:', work.cuttingMaster.toString());
//       console.log('   Current user:', req.user._id.toString());
      
//       if (work.cuttingMaster.toString() !== req.user._id.toString()) {
//         console.log('❌ Unauthorized - cutting master mismatch');
//         return res.status(403).json({
//           success: false,
//           message: 'Not authorized to update this work'
//         });
//       }
//       console.log('✅ Authorization passed');
//     } else {
//       console.log('⚠️ No cutting master assigned, auto-assigning current user');
//       work.cuttingMaster = req.user._id;
//     }

//     // Validate status
//     console.log('4️⃣ Validating status:', status);
//     const validStatuses = [
//       'pending', 'accepted', 'cutting-started', 'cutting-completed',
//       'sewing-started', 'sewing-completed', 'ironing', 'ready-to-deliver'
//     ];

//     if (!validStatuses.includes(status)) {
//       console.log('❌ Invalid status:', status);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status value'
//       });
//     }
//     console.log('✅ Status valid');

//     // Update status and set corresponding timestamp
//     console.log('5️⃣ Updating work data...');
//     const statusUpdates = {
//       'cutting-started': { cuttingStartedAt: new Date() },
//       'cutting-completed': { cuttingCompletedAt: new Date() },
//       'sewing-started': { sewingStartedAt: new Date() },
//       'sewing-completed': { sewingCompletedAt: new Date() },
//       'ironing': { ironingAt: new Date() },
//       'ready-to-deliver': { readyAt: new Date() }
//     };

//     // Update work
//     work.status = status;
    
//     // Add timestamp if applicable
//     if (statusUpdates[status]) {
//       Object.assign(work, statusUpdates[status]);
//       console.log(`   Set timestamp for ${status}`);
//     }
    
//     // Add notes if provided
//     if (notes) {
//       if (status.includes('cutting')) {
//         work.cuttingNotes = notes;
//         console.log('   Added cutting notes');
//       } else {
//         work.tailorNotes = notes;
//         console.log('   Added tailor notes');
//       }
//     }

//     console.log('6️⃣ Saving work...');
//     await work.save();
//     console.log('✅ Work saved successfully');

//     // ✅ FIXED: UPDATE TAILOR STATS BASED ON STATUS CHANGE
//     if (work.tailor) {
//       console.log('7️⃣ Updating tailor stats...');
      
//       // CORRECTED status to workStats mapping
//       const statusToCategory = {
//         'pending': 'pending',
//         'accepted': 'pending',
//         'cutting-started': 'inProgress',
//         'cutting-completed': 'inProgress',
//         'sewing-started': 'inProgress',
//         'sewing-completed': 'inProgress',
//         'ironing': 'inProgress',
//         'ready-to-deliver': 'completed'
//       };

//       const previousCategory = statusToCategory[previousStatus];
//       const newCategory = statusToCategory[status];

//       console.log('   Previous status:', previousStatus, '-> Category:', previousCategory);
//       console.log('   New status:', status, '-> Category:', newCategory);

//       const tailorUpdate = {};

//       // Only update if the category actually changed
//       if (previousCategory !== newCategory) {
//         // Decrement previous category
//         if (previousCategory) {
//           tailorUpdate[`workStats.${previousCategory}`] = -1;
//           console.log(`   Decrement ${previousCategory} by 1`);
//         }
        
//         // Increment new category
//         if (newCategory) {
//           tailorUpdate[`workStats.${newCategory}`] = 1;
//           console.log(`   Increment ${newCategory} by 1`);
//         }
//       } else {
//         console.log('   Same category, no stats update needed');
//       }

//       // Apply updates if there are any
//       if (Object.keys(tailorUpdate).length > 0) {
//         await Tailor.findByIdAndUpdate(work.tailor, {
//           $inc: tailorUpdate
//         });
//         console.log('✅ Updated tailor stats:', tailorUpdate);
//       } else {
//         console.log('⚠️ No tailor stats to update');
//       }
//     }

//     // Try to send notification
//     console.log('8️⃣ Sending notification...');
//     try {
//       if (work.order && work.order.createdBy) {
//         await createNotification({
//           type: 'work-status-update',
//           recipient: work.order.createdBy,
//           recipientModel: 'User',
//           title: '🔄 Work Status Updated',
//           message: `${work.garment?.name || 'Garment'} is now ${status.replace(/-/g, ' ')}`,
//           reference: {
//             orderId: work.order._id,
//             workId: work._id,
//             garmentId: work.garment?._id
//           },
//           priority: 'normal'
//         });
//         console.log('✅ Notification sent');
//       } else {
//         console.log('⚠️ Cannot send notification - missing order or createdBy');
//       }
//     } catch (notifError) {
//       console.log('⚠️ Notification failed:', notifError.message);
//       // Don't fail the request if notification fails
//     }

//     // ✅ AUTO-UPDATE ORDER STATUS BASED ON ALL WORKS
//     console.log('9️⃣ Checking order status for auto-update...');
//     if (work.order) {
//       try {
//         // Get all works for this order
//         const orderWorks = await Work.find({ 
//           order: work.order._id,
//           isActive: true 
//         });
        
//         console.log(`📊 Found ${orderWorks.length} works for order ${work.order._id}`);
        
//         // Check if ALL works are ready
//         const allWorksReady = orderWorks.every(w => w.status === 'ready-to-deliver');
        
//         // Check if ANY work is in progress
//         const anyWorkInProgress = orderWorks.some(w => 
//           ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(w.status)
//         );
        
//         // Determine new order status
//         let newOrderStatus = work.order.status;
//         let statusChanged = false;
        
//         if (allWorksReady) {
//           newOrderStatus = 'ready-to-delivery';
//           console.log('✅ ALL works ready! Order status should be: ready-to-delivery');
//           statusChanged = true;
          
//           // ✅ Send WhatsApp notification for ready order
//           try {
//             // Dynamic import to avoid circular dependency
//             import('./whatsapp.controller.js').then(({ sendReadyToDeliver }) => {
//               sendReadyToDeliver(work.order._id)
//                 .catch(err => console.log('⚠️ Ready WhatsApp failed:', err.message));
//             }).catch(importErr => {
//               console.log('⚠️ Could not import whatsapp controller:', importErr.message);
//             });
//           } catch (waErr) {
//             console.log('⚠️ WhatsApp notification error:', waErr.message);
//           }
          
//         } else if (anyWorkInProgress) {
//           newOrderStatus = 'in-progress';
//           console.log('📊 Some works in progress -> order status should be: in-progress');
//           statusChanged = true;
//         } else if (orderWorks.length > 0) {
//           // All works are either pending or accepted
//           newOrderStatus = 'confirmed';
//           console.log('📊 All works pending/accepted -> order status should be: confirmed');
//           statusChanged = true;
//         }
        
//         // Update order status if changed
//         if (statusChanged && work.order.status !== newOrderStatus) {
//           const oldStatus = work.order.status;
//           work.order.status = newOrderStatus;
//           await work.order.save();
//           console.log(`✅ Order status updated from ${oldStatus} to ${newOrderStatus}`);
//         } else {
//           console.log(`ℹ️ Order status unchanged (current: ${work.order.status})`);
//         }
        
//       } catch (orderError) {
//         console.error('❌ Error updating order status:', orderError.message);
//         // Don't fail the main request
//       }
//     }

//     console.log('🔟 Sending success response');
//     console.log('🔄 ===== UPDATE WORK STATUS COMPLETED =====\n');
    
//     res.json({
//       success: true,
//       message: 'Work status updated successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('\n❌ ===== UPDATE WORK STATUS ERROR =====');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     if (error.code) console.error('Error code:', error.code);
//     console.error('❌ ===== ERROR END =====\n');
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update work status',
//       error: error.message
//     });
//   }
// };

// // @desc    Delete work (Admin only)
// // @route   DELETE /api/works/:id
// // @access  Private (Admin only)
// export const deleteWork = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id);

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // Only admin can delete
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({
//         success: false,
//         message: 'Only admin can delete works'
//       });
//     }

//     // ✅ If work had a tailor assigned, remove all their stats
//     if (work.tailor) {
//       const decrementUpdate = { 'workStats.totalAssigned': -1 };
      
//       if (work.status === 'pending' || work.status === 'accepted') {
//         decrementUpdate['workStats.pending'] = -1;
//       } else if (['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(work.status)) {
//         decrementUpdate['workStats.inProgress'] = -1;
//       } else if (work.status === 'ready-to-deliver') {
//         decrementUpdate['workStats.completed'] = -1;
//       }
      
//       await Tailor.findByIdAndUpdate(work.tailor, {
//         $inc: decrementUpdate
//       });
//       console.log(`✅ Removed stats from tailor ${work.tailor}:`, decrementUpdate);
//     }

//     await work.deleteOne();

//     res.json({
//       success: true,
//       message: 'Work deleted successfully'
//     });

//   } catch (error) {
//     console.error('Delete work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete work',
//       error: error.message
//     });
//   }
// };

// // @desc    Get work statistics
// // @route   GET /api/works/stats
// // @access  Private (Admin, Store Keeper)
// export const getWorkStats = async (req, res) => {
//   try {
//     console.log('📊 Fetching work statistics...');
    
//     // Aggregate work statistics by status
//     const stats = await Work.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalWorks: { $sum: 1 },
//           pendingWorks: {
//             $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
//           },
//           acceptedWorks: {
//             $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
//           },
//           cuttingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-started'] }, 1, 0] }
//           },
//           cuttingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-completed'] }, 1, 0] }
//           },
//           sewingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-started'] }, 1, 0] }
//           },
//           sewingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-completed'] }, 1, 0] }
//           },
//           ironing: {
//             $sum: { $cond: [{ $eq: ['$status', 'ironing'] }, 1, 0] }
//           },
//           readyToDeliver: {
//             $sum: { $cond: [{ $eq: ['$status', 'ready-to-deliver'] }, 1, 0] }
//           }
//         }
//       }
//     ]);

//     // Get today's works
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const todayWorks = await Work.countDocuments({
//       createdAt: { $gte: today }
//     });

//     // Get overdue works (estimated delivery passed and not ready)
//     const overdueWorks = await Work.countDocuments({
//       estimatedDelivery: { $lt: new Date() },
//       status: { $ne: 'ready-to-deliver' }
//     });

//     const result = stats[0] || {
//       totalWorks: 0,
//       pendingWorks: 0,
//       acceptedWorks: 0,
//       cuttingStarted: 0,
//       cuttingCompleted: 0,
//       sewingStarted: 0,
//       sewingCompleted: 0,
//       ironing: 0,
//       readyToDeliver: 0
//     };

//     res.json({
//       success: true,
//       data: {
//         ...result,
//         todayWorks,
//         overdueWorks
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get work stats error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch work statistics',
//       error: error.message 
//     });
//   }
// };

// // @desc    Get works by tailor
// // @route   GET /api/works/tailor-works
// // @access  Private (Tailor only)
// export const getWorksByTailor = async (req, res) => {
//   try {
//     const tailorId = req.user?._id || req.user?.id;
    
//     if (!tailorId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     const { status, page = 1, limit = 20 } = req.query;

//     const filter = { 
//       tailor: tailorId,
//       isActive: true 
//     };
    
//     if (status && status !== 'all' && status !== '') {
//       filter.status = status;
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const works = await Work.find(filter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer',
//         populate: {
//           path: 'customer',
//           select: 'name'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId measurements'
//       })
//       .populate('cuttingMaster', 'name')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Work.countDocuments(filter);

//     res.json({
//       success: true,
//       data: {
//         works,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get tailor works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };

// // @desc    Assign cutting master to work (Admin/Store Keeper)
// // @route   PATCH /api/works/:id/assign-cutting-master
// // @access  Private (Admin, Store Keeper)
// export const assignCuttingMaster = async (req, res) => {
//   console.log('\n✂️ ===== ASSIGN CUTTING MASTER CALLED =====');
//   console.log('Work ID:', req.params.id);
//   console.log('Request body:', req.body);
  
//   try {
//     const { cuttingMasterId } = req.body;
//     const workId = req.params.id;

//     if (!cuttingMasterId) {
//       return res.status(400).json({
//         success: false,
//         message: 'cuttingMasterId is required'
//       });
//     }

//     const work = await Work.findById(workId);
//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // If work is pending, assign directly
//     work.cuttingMaster = cuttingMasterId;
//     if (work.status === 'pending') {
//       work.status = 'accepted';
//       work.acceptedAt = new Date();
//     }
//     await work.save();

//     console.log(`✅ Cutting master ${cuttingMasterId} assigned to work ${workId}`);

//     // ✅ Notify the assigned master - FIXED
//     await createNotification({
//       type: 'work-assigned',
//       recipient: cuttingMasterId,
//       recipientModel: 'CuttingMaster', // 🔥 FIXED: Added recipientModel
//       title: '📋 Work Assigned to You',
//       message: `Work ${work.workId} has been assigned to you`,
//       reference: { workId: work._id },
//       priority: 'high' // ✅ Added priority
//     });

//     res.json({ 
//       success: true, 
//       message: 'Cutting master assigned', 
//       data: work 
//     });
//   } catch (error) {
//     console.error('❌ Assign cutting master error:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };

// // ===== PERMANENT FIX: RECALCULATE AND UPDATE TAILOR STATS =====
// // @desc    Recalculate and update stats for a specific tailor
// // @route   POST /api/works/recalculate-tailor-stats/:tailorId
// // @access  Private (Admin, Store Keeper)
// export const recalculateTailorStats = async (req, res) => {
//   try {
//     const { tailorId } = req.params;
    
//     console.log('🔄 Recalculating stats for tailor:', tailorId);
    
//     // Get all works for this tailor
//     const works = await Work.find({ 
//       tailor: tailorId,
//       isActive: true 
//     });

//     console.log('📋 Works found:', works.length);
    
//     // Calculate correct stats based on actual work statuses
//     const workStats = {
//       totalAssigned: works.length,
//       completed: works.filter(w => w.status === 'ready-to-deliver').length,
//       pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
//       inProgress: works.filter(w => 
//         ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//         .includes(w.status)
//       ).length
//     };

//     console.log('📊 Calculated stats:', workStats);

//     // Update tailor in database
//     const updatedTailor = await Tailor.findByIdAndUpdate(
//       tailorId,
//       { $set: { workStats } },
//       { new: true }
//     );

//     if (!updatedTailor) {
//       return res.status(404).json({
//         success: false,
//         message: 'Tailor not found'
//       });
//     }

//     console.log('✅ Tailor stats updated successfully');

//     res.json({
//       success: true,
//       message: 'Tailor stats recalculated successfully',
//       data: {
//         tailorId: updatedTailor._id,
//         name: updatedTailor.name,
//         workStats: updatedTailor.workStats,
//         worksBreakdown: works.map(w => ({
//           workId: w.workId,
//           status: w.status
//         }))
//       }
//     });

//   } catch (error) {
//     console.error('❌ Error recalculating stats:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to recalculate tailor stats',
//       error: error.message
//     });
//   }
// };

// // @desc    Recalculate and update stats for ALL tailors
// // @route   POST /api/works/recalculate-all-tailor-stats
// // @access  Private (Admin only)
// export const recalculateAllTailorStats = async (req, res) => {
//   try {
//     const tailors = await Tailor.find({ isActive: true });
//     let updated = 0;
//     let results = [];

//     for (const tailor of tailors) {
//       const works = await Work.find({ 
//         tailor: tailor._id,
//         isActive: true 
//       });

//       const workStats = {
//         totalAssigned: works.length,
//         completed: works.filter(w => w.status === 'ready-to-deliver').length,
//         pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
//         inProgress: works.filter(w => 
//           ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//           .includes(w.status)
//         ).length
//       };

//       // Only update if stats are different
//       if (JSON.stringify(tailor.workStats) !== JSON.stringify(workStats)) {
//         tailor.workStats = workStats;
//         await tailor.save();
//         updated++;
//         results.push({
//           name: tailor.name,
//           tailorId: tailor.tailorId,
//           oldStats: tailor.workStats,
//           newStats: workStats
//         });
//       }
//     }

//     res.json({
//       success: true,
//       message: `Recalculated stats for ${updated} tailors`,
//       data: {
//         updated,
//         details: results
//       }
//     });

//   } catch (error) {
//     console.error('❌ Error recalculating all stats:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to recalculate all tailor stats',
//       error: error.message
//     });
//   }
// };

// // ===== HELPER FUNCTIONS =====

// // Helper function to generate work ID
// const generateWorkId = (garmentName) => {
//   const date = new Date();
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = date.getFullYear();
//   const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
//   const prefix = garmentName?.substring(0, 3).toUpperCase() || 'WRK';
//   return `${prefix}-${day}${month}${year}-${random}`;
// };

// // Helper function to generate measurement PDF (NOT exported)
// const generateMeasurementPdf = async (garment) => {
//   // TODO: Implement PDF generation
//   // For now, return a placeholder URL
//   return `https://storage.example.com/measurements/${garment.garmentId}.pdf`;
// };

// // ============================================
// // ✅ DASHBOARD: GET WORK STATS WITH DATE FILTERS
// // ============================================
// // @desc    Get work statistics for dashboard (with date filters)
// // @route   GET /api/works/stats/dashboard
// // @access  Private (Admin, Store Keeper)
// export const getDashboardWorkStats = async (req, res) => {
//   try {
//     const { period, startDate, endDate } = req.query;
    
//     console.log('📊 Getting work stats for dashboard with:', { period, startDate, endDate });
    
//     // Build date filter
//     let dateFilter = {};
//     const now = new Date();
    
//     if (period === 'today') {
//       const today = new Date(now.setHours(0, 0, 0, 0));
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
      
//       dateFilter = {
//         createdAt: {
//           $gte: today,
//           $lt: tomorrow
//         }
//       };
//     } else if (period === 'week') {
//       const startOfWeek = new Date(now);
//       startOfWeek.setDate(now.getDate() - now.getDay());
//       startOfWeek.setHours(0, 0, 0, 0);
      
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(startOfWeek.getDate() + 7);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfWeek,
//           $lt: endOfWeek
//         }
//       };
//     } else if (period === 'month') {
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//       endOfMonth.setHours(23, 59, 59, 999);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfMonth,
//           $lte: endOfMonth
//         }
//       };
//     } else if (startDate && endDate) {
//       dateFilter = {
//         createdAt: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate + 'T23:59:59.999Z')
//         }
//       };
//     }
    
//     console.log('📅 Work date filter:', dateFilter);
    
//     // Aggregate work statistics by status
//     const stats = await Work.aggregate([
//       { $match: dateFilter },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: 1 },
//           pending: {
//             $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
//           },
//           accepted: {
//             $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
//           },
//           cuttingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-started'] }, 1, 0] }
//           },
//           cuttingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-completed'] }, 1, 0] }
//           },
//           sewingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-started'] }, 1, 0] }
//           },
//           sewingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-completed'] }, 1, 0] }
//           },
//           ironing: {
//             $sum: { $cond: [{ $eq: ['$status', 'ironing'] }, 1, 0] }
//           },
//           readyToDeliver: {
//             $sum: { $cond: [{ $eq: ['$status', 'ready-to-deliver'] }, 1, 0] }
//           },
//           cancelled: {
//             $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
//           }
//         }
//       }
//     ]);

//     // Get today's works (separate from filter)
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const todayWorks = await Work.countDocuments({
//       createdAt: { $gte: today }
//     });

//     // Get overdue works (estimated delivery passed and not ready)
//     const overdueWorks = await Work.countDocuments({
//       estimatedDelivery: { $lt: new Date() },
//       status: { $ne: 'ready-to-deliver' },
//       ...dateFilter // Apply date filter to estimated delivery
//     });

//     const result = stats[0] || {
//       total: 0,
//       pending: 0,
//       accepted: 0,
//       cuttingStarted: 0,
//       cuttingCompleted: 0,
//       sewingStarted: 0,
//       sewingCompleted: 0,
//       ironing: 0,
//       readyToDeliver: 0,
//       cancelled: 0
//     };

//     // Combine similar statuses for easier frontend use
//     const workStats = {
//       total: result.total,
//       pending: result.pending + result.accepted, // Pending includes accepted
//       inProgress: result.cuttingStarted + result.cuttingCompleted + 
//                   result.sewingStarted + result.sewingCompleted + result.ironing,
//       completed: result.readyToDeliver,
//       cancelled: result.cancelled,
//       todayWorks,
//       overdueWorks,
//       // Detailed breakdown (optional)
//       details: {
//         pending: result.pending,
//         accepted: result.accepted,
//         cuttingStarted: result.cuttingStarted,
//         cuttingCompleted: result.cuttingCompleted,
//         sewingStarted: result.sewingStarted,
//         sewingCompleted: result.sewingCompleted,
//         ironing: result.ironing,
//         readyToDeliver: result.readyToDeliver
//       },
//       filter: {
//         period,
//         startDate: dateFilter.createdAt?.$gte,
//         endDate: dateFilter.createdAt?.$lte
//       }
//     };

//     console.log('✅ Work stats for dashboard:', workStats);

//     res.json({
//       success: true,
//       data: workStats
//     });

//   } catch (error) {
//     console.error('❌ Get dashboard work stats error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch work statistics',
//       error: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ DASHBOARD: GET RECENT WORKS WITH PRIORITY
// // ============================================
// // @desc    Get recent works for dashboard
// // @route   GET /api/works/recent
// // @access  Private (Admin, Store Keeper)
// export const getRecentWorks = async (req, res) => {
//   try {
//     const { limit = 5, period, startDate, endDate } = req.query;
    
//     console.log('📋 Getting recent works with:', { limit, period, startDate, endDate });
    
//     // Build date filter
//     let dateFilter = {};
//     const now = new Date();
    
//     if (period === 'today') {
//       const today = new Date(now.setHours(0, 0, 0, 0));
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
      
//       dateFilter = {
//         createdAt: {
//           $gte: today,
//           $lt: tomorrow
//         }
//       };
//     } else if (period === 'week') {
//       const startOfWeek = new Date(now);
//       startOfWeek.setDate(now.getDate() - now.getDay());
//       startOfWeek.setHours(0, 0, 0, 0);
      
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(startOfWeek.getDate() + 7);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfWeek,
//           $lt: endOfWeek
//         }
//       };
//     } else if (period === 'month') {
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//       endOfMonth.setHours(23, 59, 59, 999);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfMonth,
//           $lte: endOfMonth
//         }
//       };
//     } else if (startDate && endDate) {
//       dateFilter = {
//         createdAt: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate + 'T23:59:59.999Z')
//         }
//       };
//     }
    
//     const recentWorks = await Work.find(dateFilter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer',
//         populate: {
//           path: 'customer',
//           select: 'name phone'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId priority'  // ✅ Added 'priority'
//       })
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name')
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit));

//     // Format for dashboard display with priority
//     const formattedWorks = recentWorks.map(work => ({
//       _id: work._id,
//       workId: work.workId,
//       status: work.status,
//       garment: work.garment ? {
//         name: work.garment.name,
//         id: work.garment.garmentId,
//         priority: work.garment.priority  // ✅ Added priority
//       } : null,
//       order: work.order ? {
//         orderId: work.order.orderId,
//         customer: work.order.customer
//       } : null,
//       cuttingMaster: work.cuttingMaster?.name,
//       tailor: work.tailor?.name,
//       createdAt: work.createdAt,
//       estimatedDelivery: work.estimatedDelivery
//     }));

//     console.log(`✅ Found ${formattedWorks.length} recent works`);

//     res.json({
//       success: true,
//       data: {
//         works: formattedWorks,
//         count: formattedWorks.length,
//         filter: { period, startDate, endDate }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get recent works error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch recent works',
//       error: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ DASHBOARD: GET WORK STATUS BREAKDOWN
// // ============================================
// // @desc    Get work status breakdown for pie chart
// // @route   GET /api/works/status-breakdown
// // @access  Private (Admin, Store Keeper)
// export const getWorkStatusBreakdown = async (req, res) => {
//   try {
//     const { period, startDate, endDate } = req.query;
    
//     // Build date filter (same as above)
//     let dateFilter = {};
//     const now = new Date();
    
//     if (period === 'today') {
//       const today = new Date(now.setHours(0, 0, 0, 0));
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
      
//       dateFilter = {
//         createdAt: {
//           $gte: today,
//           $lt: tomorrow
//         }
//       };
//     } else if (period === 'week') {
//       const startOfWeek = new Date(now);
//       startOfWeek.setDate(now.getDate() - now.getDay());
//       startOfWeek.setHours(0, 0, 0, 0);
      
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(startOfWeek.getDate() + 7);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfWeek,
//           $lt: endOfWeek
//         }
//       };
//     } else if (period === 'month') {
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//       endOfMonth.setHours(23, 59, 59, 999);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfMonth,
//           $lte: endOfMonth
//         }
//       };
//     } else if (startDate && endDate) {
//       dateFilter = {
//         createdAt: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate + 'T23:59:59.999Z')
//         }
//       };
//     }
    
//     // Group by status
//     const breakdown = await Work.aggregate([
//       { $match: dateFilter },
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // Status colors for frontend
//     const statusColors = {
//       'pending': '#f59e0b',
//       'accepted': '#f59e0b',
//       'cutting-started': '#3b82f6',
//       'cutting-completed': '#3b82f6',
//       'sewing-started': '#3b82f6',
//       'sewing-completed': '#3b82f6',
//       'ironing': '#3b82f6',
//       'ready-to-deliver': '#10b981',
//       'cancelled': '#ef4444'
//     };

//     // Map status to display names
//     const statusNames = {
//       'pending': 'Pending',
//       'accepted': 'Accepted',
//       'cutting-started': 'Cutting Started',
//       'cutting-completed': 'Cutting Done',
//       'sewing-started': 'Sewing Started',
//       'sewing-completed': 'Sewing Done',
//       'ironing': 'Ironing',
//       'ready-to-deliver': 'Ready',
//       'cancelled': 'Cancelled'
//     };

//     // For pie chart, we want to combine similar statuses
//     const pieData = [
//       { name: 'Pending', value: 0, color: '#f59e0b' },
//       { name: 'In Progress', value: 0, color: '#3b82f6' },
//       { name: 'Ready', value: 0, color: '#10b981' },
//       { name: 'Cancelled', value: 0, color: '#ef4444' }
//     ];

//     breakdown.forEach(item => {
//       if (['pending', 'accepted'].includes(item._id)) {
//         pieData[0].value += item.count; // Pending
//       } else if (['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(item._id)) {
//         pieData[1].value += item.count; // In Progress
//       } else if (item._id === 'ready-to-deliver') {
//         pieData[2].value = item.count; // Ready
//       } else if (item._id === 'cancelled') {
//         pieData[3].value = item.count; // Cancelled
//       }
//     });

//     res.json({
//       success: true,
//       data: {
//         breakdown: breakdown.map(item => ({
//           status: item._id,
//           name: statusNames[item._id] || item._id,
//           count: item.count,
//           color: statusColors[item._id] || '#94a3b8'
//         })),
//         pieData: pieData.filter(item => item.value > 0),
//         total: breakdown.reduce((sum, item) => sum + item.count, 0)
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get work status breakdown error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch work status breakdown',
//       error: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ CALENDAR WORK DATA
// // ============================================
// // @desc    Get work data for calendar view
// // @route   GET /api/works/calendar
// // @access  Private
// export const getCalendarWorkData = async (req, res) => {
//   try {
//     const { startDate, endDate, cuttingMasterId, tailorId } = req.query;
    
//     console.log('📅 Getting calendar work data:', { startDate, endDate, cuttingMasterId, tailorId });
    
//     // Build filter
//     const filter = { isActive: true };
    
//     // Date range filter (if provided)
//     if (startDate || endDate) {
//       filter.$or = [
//         { createdAt: {} },
//         { estimatedDelivery: {} }
//       ];
      
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         filter.$or[0].createdAt.$gte = start;
//         filter.$or[1].estimatedDelivery.$gte = start;
//       }
      
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         filter.$or[0].createdAt.$lte = end;
//         filter.$or[1].estimatedDelivery.$lte = end;
//       }
//     }
    
//     // Filter by cutting master
//     if (cuttingMasterId) {
//       filter.cuttingMaster = cuttingMasterId;
//     }
    
//     // Filter by tailor
//     if (tailorId) {
//       filter.tailor = tailorId;
//     }
    
//     // Get works for calendar
//     const works = await Work.find(filter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer',
//         populate: {
//           path: 'customer',
//           select: 'name'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId'
//       })
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name')
//       .select('workId status createdAt estimatedDelivery cuttingMaster tailor order garment');
    
//     // Format for calendar (FullCalendar or similar)
//     const calendarEvents = works.map(work => {
//       // Determine color based on status
//       let color = '#3788d8'; // default blue
//       if (work.status === 'ready-to-deliver') color = '#10b981'; // green
//       if (work.status === 'pending') color = '#f59e0b'; // orange
//       if (work.status === 'cancelled') color = '#ef4444'; // red
      
//       return {
//         id: work._id,
//         title: `${work.workId} - ${work.garment?.name || 'Garment'}`,
//         start: work.estimatedDelivery || work.createdAt,
//         allDay: true,
//         backgroundColor: color,
//         borderColor: color,
//         extendedProps: {
//           workId: work.workId,
//           status: work.status,
//           orderId: work.order?.orderId,
//           customer: work.order?.customer?.name,
//           garment: work.garment?.name,
//           cuttingMaster: work.cuttingMaster?.name,
//           tailor: work.tailor?.name,
//           createdAt: work.createdAt
//         }
//       };
//     });
    
//     res.json({
//       success: true,
//       data: {
//         events: calendarEvents,
//         total: calendarEvents.length
//       }
//     });
    
//   } catch (error) {
//     console.error('❌ Get calendar work data error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch calendar data',
//       error: error.message
//     });
//   }
// };

// // ============================================
// // ✅ CUTTING MASTER DASHBOARD STATS
// // ============================================
// // @desc    Get cutting master dashboard statistics
// // @route   GET /api/works/cutting-master-stats
// // @access  Private (Cutting Master only)
// export const getCuttingMasterDashboardStats = async (req, res) => {
//   try {
//     const cuttingMasterId = req.user?._id || req.user?.id;
    
//     console.log('📊 Getting cutting master dashboard stats for:', cuttingMasterId);

//     if (!cuttingMasterId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     // Get all works for this cutting master
//     const works = await Work.find({
//       cuttingMaster: cuttingMasterId,
//       isActive: true
//     });

//     // Calculate statistics
//     const stats = {
//       totalWorks: works.length,
//       pendingWorks: works.filter(w => w.status === 'pending').length,
//       acceptedWorks: works.filter(w => w.status === 'accepted').length,
//       cuttingStarted: works.filter(w => w.status === 'cutting-started').length,
//       cuttingCompleted: works.filter(w => w.status === 'cutting-completed').length,
//       sewingStarted: works.filter(w => w.status === 'sewing-started').length,
//       sewingCompleted: works.filter(w => w.status === 'sewing-completed').length,
//       ironing: works.filter(w => w.status === 'ironing').length,
//       readyToDeliver: works.filter(w => w.status === 'ready-to-deliver').length,
//       completed: works.filter(w => w.status === 'ready-to-deliver').length,
//       inProgress: works.filter(w => 
//         ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//         .includes(w.status)
//       ).length
//     };

//     // Get available works in the pool (pending and not assigned to anyone)
//     const availableWorks = await Work.countDocuments({
//       cuttingMaster: null,
//       status: 'pending',
//       isActive: true
//     });

//     // Get today's works
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const todayWorks = works.filter(w => 
//       new Date(w.createdAt) >= today
//     ).length;

//     // Get overdue works
//     const overdueWorks = works.filter(w => 
//       w.estimatedDelivery && 
//       new Date(w.estimatedDelivery) < new Date() && 
//       w.status !== 'ready-to-deliver'
//     ).length;

//     res.json({
//       success: true,
//       data: {
//         ...stats,
//         availableWorks,
//         todayWorks,
//         overdueWorks,
//         recentActivities: works.slice(0, 5).map(w => ({
//           _id: w._id,
//           workId: w.workId,
//           status: w.status,
//           updatedAt: w.updatedAt
//         }))
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get cutting master dashboard stats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch cutting master statistics',
//       error: error.message
//     });
//   }
// };

// // ============================================
// // ✅ TAILOR PERFORMANCE FOR CUTTING MASTER
// // ============================================
// // @desc    Get tailor performance metrics for cutting master dashboard
// // @route   GET /api/works/tailor-performance
// // @access  Private (Cutting Master, Admin)
// export const getTailorPerformanceForMaster = async (req, res) => {
//   try {
//     const { limit = 10, search, sortBy = 'workStats.completed' } = req.query;
    
//     console.log('📊 Getting tailor performance data with:', { limit, search, sortBy });

//     // Build filter for tailors
//     const filter = { isActive: true };
    
//     // Add search if provided
//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { tailorId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Get tailors with their work stats
//     const tailors = await Tailor.find(filter)
//       .select('name tailorId phone specialization workStats currentLoad isAvailable')
//       .sort({ [sortBy]: -1 })
//       .limit(parseInt(limit));

//     // Get currently assigned works for each tailor to calculate current load
//     const tailorPerformance = await Promise.all(tailors.map(async (tailor) => {
//       // Get works currently assigned to this tailor
//       const assignedWorks = await Work.find({
//         tailor: tailor._id,
//         status: { $nin: ['ready-to-deliver', 'cancelled'] },
//         isActive: true
//       }).populate({
//         path: 'garment',
//         select: 'name priority'
//       });

//       // Calculate efficiency score (completed vs total assigned)
//       const efficiency = tailor.workStats.totalAssigned > 0 
//         ? Math.round((tailor.workStats.completed / tailor.workStats.totalAssigned) * 100) 
//         : 0;

//       // Determine availability status
//       let availability = 'available';
//       if (tailor.currentLoad >= 5) {
//         availability = 'busy';
//       } else if (tailor.currentLoad >= 3) {
//         availability = 'moderate';
//       }

//       return {
//         _id: tailor._id,
//         name: tailor.name,
//         tailorId: tailor.tailorId,
//         phone: tailor.phone,
//         specialization: tailor.specialization || 'General',
//         stats: {
//           totalAssigned: tailor.workStats.totalAssigned || 0,
//           completed: tailor.workStats.completed || 0,
//           pending: tailor.workStats.pending || 0,
//           inProgress: tailor.workStats.inProgress || 0,
//           efficiency: `${efficiency}%`
//         },
//         currentLoad: {
//           count: assignedWorks.length,
//           status: availability,
//           maxLoad: 5 // Configurable max load
//         },
//         isAvailable: tailor.isAvailable,
//         currentWorks: assignedWorks.slice(0, 3).map(w => ({
//           workId: w.workId,
//           garment: w.garment?.name,
//           priority: w.garment?.priority || 'normal',
//           status: w.status
//         }))
//       };
//     }));

//     // Get summary statistics
//     const summary = {
//       totalTailors: tailors.length,
//       availableTailors: tailorPerformance.filter(t => t.isAvailable && t.currentLoad.count < 5).length,
//       busyTailors: tailorPerformance.filter(t => !t.isAvailable || t.currentLoad.count >= 5).length,
//       totalActiveWorks: tailorPerformance.reduce((sum, t) => sum + t.currentLoad.count, 0),
//       averageEfficiency: Math.round(
//         tailorPerformance.reduce((sum, t) => {
//           const eff = parseInt(t.stats.efficiency) || 0;
//           return sum + eff;
//         }, 0) / (tailorPerformance.length || 1)
//       )
//     };

//     res.json({
//       success: true,
//       data: {
//         tailors: tailorPerformance,
//         summary,
//         filters: {
//           search,
//           sortBy,
//           limit: parseInt(limit)
//         }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get tailor performance error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch tailor performance data',
//       error: error.message
//     });
//   }
// };

// // ============================================
// // ✅ TODAY'S SUMMARY FOR MASTER
// // ============================================
// // @desc    Get today's summary for cutting master dashboard
// // @route   GET /api/works/today-summary
// // @access  Private (Cutting Master only)
// export const getTodaySummaryForMaster = async (req, res) => {
//   try {
//     const cuttingMasterId = req.user?._id || req.user?.id;
    
//     console.log('📅 Getting today\'s summary for master:', cuttingMasterId);

//     if (!cuttingMasterId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     // Set date range for today
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // Get works created today for this master
//     const todayWorks = await Work.find({
//       cuttingMaster: cuttingMasterId,
//       createdAt: {
//         $gte: today,
//         $lt: tomorrow
//       },
//       isActive: true
//     }).populate({
//       path: 'garment',
//       select: 'name'
//     });

//     // Get works due today
//     const dueToday = await Work.find({
//       cuttingMaster: cuttingMasterId,
//       estimatedDelivery: {
//         $gte: today,
//         $lt: tomorrow
//       },
//       status: { $ne: 'ready-to-deliver' },
//       isActive: true
//     }).populate({
//       path: 'garment',
//       select: 'name'
//     });

//     // Get recent status updates today
//     const recentUpdates = await Work.find({
//       cuttingMaster: cuttingMasterId,
//       updatedAt: {
//         $gte: today,
//         $lt: tomorrow
//       },
//       isActive: true
//     })
//     .sort({ updatedAt: -1 })
//     .limit(5)
//     .populate({
//       path: 'garment',
//       select: 'name'
//     });

//     // Get priority breakdown
//     const priorityBreakdown = await Work.aggregate([
//       {
//         $match: {
//           cuttingMaster: cuttingMasterId,
//           isActive: true
//         }
//       },
//       {
//         $lookup: {
//           from: 'garments',
//           localField: 'garment',
//           foreignField: '_id',
//           as: 'garmentInfo'
//         }
//       },
//       {
//         $unwind: {
//           path: '$garmentInfo',
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $group: {
//           _id: '$garmentInfo.priority',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // Format priority data
//     const priorities = {
//       high: 0,
//       medium: 0,
//       low: 0,
//       normal: 0
//     };
    
//     priorityBreakdown.forEach(item => {
//       const priority = item._id || 'normal';
//       priorities[priority] = item.count;
//     });

//     // Calculate completion rate for today
//     const completedToday = await Work.countDocuments({
//       cuttingMaster: cuttingMasterId,
//       status: 'ready-to-deliver',
//       updatedAt: {
//         $gte: today,
//         $lt: tomorrow
//       },
//       isActive: true
//     });

//     const totalActive = await Work.countDocuments({
//       cuttingMaster: cuttingMasterId,
//       status: { $nin: ['ready-to-deliver', 'cancelled'] },
//       isActive: true
//     });

//     res.json({
//       success: true,
//       data: {
//         date: today,
//         summary: {
//           newWorks: todayWorks.length,
//           dueToday: dueToday.length,
//           completedToday,
//           totalActive,
//           completionRate: totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0
//         },
//         priorities,
//         recentActivity: recentUpdates.map(w => ({
//           _id: w._id,
//           workId: w.workId,
//           garment: w.garment?.name,
//           status: w.status,
//           updatedAt: w.updatedAt,
//           timeAgo: getTimeAgo(w.updatedAt)
//         })),
//         upcomingDeadlines: dueToday.slice(0, 3).map(w => ({
//           _id: w._id,
//           workId: w.workId,
//           garment: w.garment?.name,
//           estimatedDelivery: w.estimatedDelivery
//         }))
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get today\'s summary error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch today\'s summary',
//       error: error.message
//     });
//   }
// };

// // Helper function for time ago
// const getTimeAgo = (date) => {
//   const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
//   let interval = seconds / 31536000;
//   if (interval > 1) return Math.floor(interval) + ' years ago';
  
//   interval = seconds / 2592000;
//   if (interval > 1) return Math.floor(interval) + ' months ago';
  
//   interval = seconds / 86400;
//   if (interval > 1) return Math.floor(interval) + ' days ago';
  
//   interval = seconds / 3600;
//   if (interval > 1) return Math.floor(interval) + ' hours ago';
  
//   interval = seconds / 60;
//   if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
//   return Math.floor(seconds) + ' seconds ago';
// };









// // controllers/work.controller.js
// import Work from '../models/Work.js';
// import Order from '../models/Order.js';
// import Garment from '../models/Garment.js';
// import CuttingMaster from '../models/CuttingMaster.js';
// import Tailor from '../models/Tailor.js';
// import Notification from '../models/Notification.js';
// import { createNotification } from './notification.controller.js';

// // @desc    Create work for each garment in an order
// // @route   POST /api/works/create-from-order/:orderId
// // @access  Private (Store Keeper, Admin)
// export const createWorksFromOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     // Get order with garments
//     const order = await Order.findById(orderId)
//       .populate('garments');
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     const works = [];
    
//     // Create work for each garment
//     for (const garment of order.garments) {
//       // Generate measurement PDF (you can implement PDF generation later)
//       const measurementPdf = await generateMeasurementPdf(garment);
      
//       // ✅ OPEN POOL MODEL: Create with null cuttingMaster
//       const work = await Work.create({
//         order: orderId,
//         garment: garment._id,
//         estimatedDelivery: garment.estimatedDelivery || new Date(Date.now() + 7*24*60*60*1000),
//         createdBy: req.user._id,
//         measurementPdf,
//         status: 'pending',           // Waiting for acceptance
//         cuttingMaster: null,          // ⭐ NOT assigned to anyone
//         workId: generateWorkId(garment.name) // Add work ID generation
//       });
      
//       works.push(work);
//     }

//     // ✅ Notify ALL cutting masters about available works
//     const cuttingMasters = await CuttingMaster.find({ isActive: true });
    
//     for (const master of cuttingMasters) {
//       try {
//         await createNotification({
//           type: 'work-available',
//           recipient: master._id,
//           recipientModel: 'CuttingMaster', // ✅ ADDED recipientModel
//           title: '🔔 New Work Available in Pool',
//           message: `${works.length} new work(s) are waiting for your acceptance. Click to view and accept.`,
//           reference: {
//             orderId: order._id,
//             workCount: works.length,
//             workIds: works.map(w => w._id)
//           },
//           priority: 'high'
//         });
//       } catch (notifError) {
//         console.error(`❌ Failed to notify cutting master ${master._id}:`, notifError.message);
//       }
//     }

//     // ✅ FIXED: Notify Admin and Store Keeper about new works (BROADCAST)
//     try {
//       await createNotification({
//         type: 'order-created',
//         // ❌ NO recipient - this will trigger broadcast to Admin + Store Keeper
//         title: '📦 New Order & Works Created',
//         message: `New order ${order.orderId} created with ${works.length} works.`,
//         reference: { 
//           orderId: order._id,
//           workCount: works.length 
//         },
//         priority: 'normal'
//       });
//       console.log('✅ Broadcast notification sent to Admin and Store Keepers');
//     } catch (notifError) {
//       console.log('⚠️ Broadcast notification failed:', notifError.message);
//     }

//     res.status(201).json({
//       success: true,
//       message: `Created ${works.length} works (open for acceptance)`,
//       data: works
//     });

//   } catch (error) {
//     console.error('Create works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create works',
//       error: error.message
//     });
//   }
// };

// // @desc    Get all works (with filters)
// // @route   GET /api/works
// // @access  Private
// export const getWorks = async (req, res) => {
//   try {
//     const {
//       status,
//       cuttingMaster,
//       tailor,
//       orderId,
//       startDate,
//       endDate,
//       page = 1,
//       limit = 20
//     } = req.query;

//     const filter = { isActive: true };

//     if (status) filter.status = status;
//     if (cuttingMaster) filter.cuttingMaster = cuttingMaster;
//     if (tailor) filter.tailor = tailor;
//     if (orderId) filter.order = orderId;

//     // Date range filter
//     if (startDate || endDate) {
//       filter.workDate = {};
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         filter.workDate.$gte = start;
//       }
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         filter.workDate.$lte = end;
//       }
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const works = await Work.find(filter)
//       .populate('order', 'orderId customer deliveryDate')
//       .populate('garment', 'name garmentId measurements')
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name employeeId')
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Work.countDocuments(filter);

//     res.json({
//       success: true,
//       data: {
//         works,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };

// // @desc    Get work by ID
// // @route   GET /api/works/:id
// // @access  Private
// export const getWorkById = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id)
//       .populate('order', 'orderId customer orderDate deliveryDate')
//       .populate('garment')
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name employeeId phone')
//       .populate('createdBy', 'name');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: work
//     });

//   } catch (error) {
//     console.error('Get work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch work',
//       error: error.message
//     });
//   }
// };

// // ===== OPEN POOL: GET WORKS FOR CUTTING MASTER DASHBOARD =====
// // @desc    Get works for cutting master (shows both accepted and available)
// // @route   GET /api/works/my-works
// // @access  Private (Cutting Master only)
// export const getWorksByCuttingMaster = async (req, res) => {
//   try {
//     const userId = req.user?._id || req.user?.id;

//     console.log('📋 Getting works for cutting master:', {
//       userId,
//       role: req.user?.role
//     });

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     // ✅ OPEN POOL FILTER: Show both:
//     // 1. Works already accepted by this master
//     // 2. All pending works (open for acceptance by anyone)
//     const filter = {
//       $or: [
//         { cuttingMaster: userId },                    // Already accepted by this master
//         { cuttingMaster: null, status: 'pending' }    // ⭐ Open for everyone to accept
//       ],
//       isActive: true
//     };

//     console.log('🔍 Filter:', JSON.stringify(filter));

//     const works = await Work.find(filter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer deliveryDate',
//         populate: {
//           path: 'customer',
//           select: 'name phone'
//         }
//       })
//       .populate({
//         path: 'garment',
//         // 🔥 FIX: Add priority field here!
//         select: 'name garmentId measurements priceRange priority estimatedDelivery additionalInfo'
//       })
//       .populate('tailor', 'name')
//       .sort({ createdAt: -1 });

//     console.log(`✅ Found ${works.length} works`);

//     // ✅ Add flags to help frontend know status
//     const worksWithAcceptanceInfo = works.map(work => {
//       const workObj = work.toObject();
//       workObj.isAcceptedByMe = work.cuttingMaster?.toString() === userId?.toString();
//       workObj.isAvailable = !work.cuttingMaster && work.status === 'pending';
//       workObj.canAccept = !work.cuttingMaster && work.status === 'pending';
      
//       // 🔥 Log garment priority for debugging
//       console.log(`Work ${work.workId}: Garment priority = ${work.garment?.priority || 'not found'}`);
      
//       return workObj;
//     });

//     res.json({
//       success: true,
//       data: {
//         works: worksWithAcceptanceInfo,
//         total: works.length
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get cutting master works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };

// // ===== OPEN POOL: ACCEPT WORK (FIRST COME FIRST SERVE) =====
// // @desc    Accept work (Cutting Master)
// // @route   PATCH /api/works/:id/accept
// // @access  Private (Cutting Master only)
// export const acceptWork = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // ✅ Check if already accepted by someone else
//     if (work.cuttingMaster) {
//       return res.status(400).json({
//         success: false,
//         message: 'This work was already accepted by another cutting master'
//       });
//     }

//     // ✅ Check if work is pending
//     if (work.status !== 'pending') {
//       return res.status(400).json({
//         success: false,
//         message: `This work is not available for acceptance (status: ${work.status})`
//       });
//     }

//     // ✅ Assign work to this cutting master (FIRST COME FIRST SERVE)
//     work.status = 'accepted';
//     work.cuttingMaster = req.user._id;
//     work.acceptedAt = new Date();
//     await work.save();

//     console.log(`✅ Work ${work._id} accepted by cutting master ${req.user._id}`);

//     // ✅ Update order status if all works are accepted
//     const pendingWorks = await Work.countDocuments({
//       order: work.order._id,
//       status: 'pending'
//     });

//     if (pendingWorks === 0) {
//       await Order.findByIdAndUpdate(work.order._id, {
//         status: 'confirmed'
//       });
//       console.log(`✅ Order ${work.order._id} all works accepted, status updated to confirmed`);
//     }

//     // ✅ FIXED: Notify Admin and Store Keeper about work acceptance (BROADCAST)
//     try {
//       await createNotification({
//         type: 'work-accepted',
//         // ❌ NO recipient - broadcast to Admin + Store Keeper
//         title: '✅ Work Accepted',
//         message: `Cutting master accepted work for ${work.garment.name}`,
//         reference: {
//           orderId: work.order._id,
//           workId: work._id,
//           garmentId: work.garment._id
//         },
//         priority: 'high'
//       });
//       console.log('✅ Broadcast notification sent to Admin and Store Keepers');
//     } catch (notifError) {
//       console.log('⚠️ Broadcast notification failed:', notifError.message);
//     }

//     // ✅ Send confirmation to the cutting master
//     await createNotification({
//       type: 'work-accepted',
//       recipient: req.user._id,
//       recipientModel: 'CuttingMaster', // ✅ Added recipientModel
//       title: '✅ You Accepted a Work',
//       message: `You have successfully accepted work for ${work.garment.name}`,
//       reference: {
//         orderId: work.order._id,
//         workId: work._id
//       },
//       priority: 'normal'
//     });

//     res.json({
//       success: true,
//       message: 'Work accepted successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('Accept work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to accept work',
//       error: error.message
//     });
//   }
// };

// // ✅ FIXED: Assign tailor to work - Now updates tailor stats correctly
// // @desc    Assign tailor to work (Cutting Master)
// // @route   PATCH /api/works/:id/assign-tailor
// // @access  Private (Cutting Master only)
// export const assignTailor = async (req, res) => {
//   try {
//     const { tailorId } = req.body;
//     const work = await Work.findById(req.params.id)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // ✅ Check if cutting master exists before comparing
//     if (!work.cuttingMaster) {
//       // If no cutting master, assign the current user as cutting master
//       work.cuttingMaster = req.user._id;
//       work.status = 'accepted';
//       console.log(`✅ Auto-assigned cutting master ${req.user._id} to work ${work._id}`);
//     } else if (work.cuttingMaster.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to assign tailor for this work'
//       });
//     }

//     // ✅ If work already has a tailor assigned, remove all their stats for this work
//     if (work.tailor && work.tailor.toString() !== tailorId) {
//       const previousTailorId = work.tailor;
      
//       // Determine which stat to decrement based on current work status
//       const decrementUpdate = { 'workStats.totalAssigned': -1 };
      
//       if (work.status === 'pending' || work.status === 'accepted') {
//         decrementUpdate['workStats.pending'] = -1;
//       } else if (['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(work.status)) {
//         decrementUpdate['workStats.inProgress'] = -1;
//       } else if (work.status === 'ready-to-deliver') {
//         decrementUpdate['workStats.completed'] = -1;
//       }
      
//       await Tailor.findByIdAndUpdate(previousTailorId, {
//         $inc: decrementUpdate
//       });
//       console.log(`✅ Removed stats from previous tailor ${previousTailorId}:`, decrementUpdate);
//     }

//     // ✅ Update work with new tailor
//     work.tailor = tailorId;
//     await work.save();

//     // ✅ Determine which stat to increment based on current work status
//     const incrementUpdate = { 'workStats.totalAssigned': 1 };
    
//     if (work.status === 'pending' || work.status === 'accepted') {
//       incrementUpdate['workStats.pending'] = 1;
//     } else if (['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(work.status)) {
//       incrementUpdate['workStats.inProgress'] = 1;
//     } else if (work.status === 'ready-to-deliver') {
//       incrementUpdate['workStats.completed'] = 1;
//     }

//     // ✅ Update new tailor's workStats
//     await Tailor.findByIdAndUpdate(tailorId, {
//       $inc: incrementUpdate
//     });
//     console.log(`✅ Added stats to new tailor ${tailorId}:`, incrementUpdate);

//     // ✅ Notify the assigned tailor
//     try {
//       await createNotification({
//         type: 'work-assigned',
//         recipient: tailorId,
//         recipientModel: 'Tailor', // ✅ Added recipientModel
//         title: '📋 New Work Assigned',
//         message: `You have been assigned to work on ${work.garment.name}`,
//         reference: {
//           orderId: work.order._id,
//           workId: work._id,
//           garmentId: work.garment._id
//         },
//         priority: 'high'
//       });
//       console.log(`✅ Notification sent to tailor ${tailorId}`);
//     } catch (notifError) {
//       console.error('❌ Failed to send notification:', notifError);
//       // Don't fail the whole request if notification fails
//     }

//     // ✅ FIXED: Notify Admin and Store Keeper about tailor assignment (BROADCAST)
//     try {
//       await createNotification({
//         type: 'work-assigned',
//         // ❌ NO recipient - broadcast to Admin + Store Keeper
//         title: '👔 Tailor Assigned',
//         message: `Tailor assigned to work on ${work.garment.name}`,
//         reference: {
//           orderId: work.order._id,
//           workId: work._id,
//           garmentId: work.garment._id,
//           tailorId: tailorId
//         },
//         priority: 'normal'
//       });
//       console.log('✅ Broadcast notification sent to Admin and Store Keepers');
//     } catch (notifError) {
//       console.log('⚠️ Broadcast notification failed:', notifError.message);
//     }

//     res.json({
//       success: true,
//       message: 'Tailor assigned successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('❌ Assign tailor error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to assign tailor',
//       error: error.message
//     });
//   }
// };

// // ✅ FIXED: Update work status - Now updates order status automatically
// // @desc    Update work status (Cutting Master)
// // @route   PATCH /api/works/:id/status
// // @access  Private (Cutting Master only)
// export const updateWorkStatus = async (req, res) => {
//   console.log('\n🔄 ===== UPDATE WORK STATUS CALLED =====');
//   console.log('Request params:', req.params);
//   console.log('Request body:', req.body);
//   console.log('User:', req.user?._id || req.user?.id);
  
//   try {
//     const { status, notes } = req.body;
//     const workId = req.params.id;

//     console.log('1️⃣ Finding work with ID:', workId);
//     const work = await Work.findById(workId)
//       .populate('order')
//       .populate('garment');

//     if (!work) {
//       console.log('❌ Work not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     console.log('2️⃣ Work found:', {
//       id: work._id,
//       currentStatus: work.status,
//       newStatus: status,
//       cuttingMaster: work.cuttingMaster,
//       tailor: work.tailor,
//       hasGarment: !!work.garment,
//       hasOrder: !!work.order
//     });

//     // Store previous status for comparison
//     const previousStatus = work.status;

//     // ✅ Check if cutting master exists before comparing
//     console.log('3️⃣ Checking authorization...');
//     if (work.cuttingMaster) {
//       console.log('   Cutting master exists:', work.cuttingMaster.toString());
//       console.log('   Current user:', req.user._id.toString());
      
//       if (work.cuttingMaster.toString() !== req.user._id.toString()) {
//         console.log('❌ Unauthorized - cutting master mismatch');
//         return res.status(403).json({
//           success: false,
//           message: 'Not authorized to update this work'
//         });
//       }
//       console.log('✅ Authorization passed');
//     } else {
//       console.log('⚠️ No cutting master assigned, auto-assigning current user');
//       work.cuttingMaster = req.user._id;
//     }

//     // Validate status
//     console.log('4️⃣ Validating status:', status);
//     const validStatuses = [
//       'pending', 'accepted', 'cutting-started', 'cutting-completed',
//       'sewing-started', 'sewing-completed', 'ironing', 'ready-to-deliver'
//     ];

//     if (!validStatuses.includes(status)) {
//       console.log('❌ Invalid status:', status);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status value'
//       });
//     }
//     console.log('✅ Status valid');

//     // Update status and set corresponding timestamp
//     console.log('5️⃣ Updating work data...');
//     const statusUpdates = {
//       'cutting-started': { cuttingStartedAt: new Date() },
//       'cutting-completed': { cuttingCompletedAt: new Date() },
//       'sewing-started': { sewingStartedAt: new Date() },
//       'sewing-completed': { sewingCompletedAt: new Date() },
//       'ironing': { ironingAt: new Date() },
//       'ready-to-deliver': { readyAt: new Date() }
//     };

//     // Update work
//     work.status = status;
    
//     // Add timestamp if applicable
//     if (statusUpdates[status]) {
//       Object.assign(work, statusUpdates[status]);
//       console.log(`   Set timestamp for ${status}`);
//     }
    
//     // Add notes if provided
//     if (notes) {
//       if (status.includes('cutting')) {
//         work.cuttingNotes = notes;
//         console.log('   Added cutting notes');
//       } else {
//         work.tailorNotes = notes;
//         console.log('   Added tailor notes');
//       }
//     }

//     console.log('6️⃣ Saving work...');
//     await work.save();
//     console.log('✅ Work saved successfully');

//     // ✅ FIXED: UPDATE TAILOR STATS BASED ON STATUS CHANGE
//     if (work.tailor) {
//       console.log('7️⃣ Updating tailor stats...');
      
//       // CORRECTED status to workStats mapping
//       const statusToCategory = {
//         'pending': 'pending',
//         'accepted': 'pending',
//         'cutting-started': 'inProgress',
//         'cutting-completed': 'inProgress',
//         'sewing-started': 'inProgress',
//         'sewing-completed': 'inProgress',
//         'ironing': 'inProgress',
//         'ready-to-deliver': 'completed'
//       };

//       const previousCategory = statusToCategory[previousStatus];
//       const newCategory = statusToCategory[status];

//       console.log('   Previous status:', previousStatus, '-> Category:', previousCategory);
//       console.log('   New status:', status, '-> Category:', newCategory);

//       const tailorUpdate = {};

//       // Only update if the category actually changed
//       if (previousCategory !== newCategory) {
//         // Decrement previous category
//         if (previousCategory) {
//           tailorUpdate[`workStats.${previousCategory}`] = -1;
//           console.log(`   Decrement ${previousCategory} by 1`);
//         }
        
//         // Increment new category
//         if (newCategory) {
//           tailorUpdate[`workStats.${newCategory}`] = 1;
//           console.log(`   Increment ${newCategory} by 1`);
//         }
//       } else {
//         console.log('   Same category, no stats update needed');
//       }

//       // Apply updates if there are any
//       if (Object.keys(tailorUpdate).length > 0) {
//         await Tailor.findByIdAndUpdate(work.tailor, {
//           $inc: tailorUpdate
//         });
//         console.log('✅ Updated tailor stats:', tailorUpdate);
//       } else {
//         console.log('⚠️ No tailor stats to update');
//       }
//     }

//     // ✅ FIXED: Send notification to Admin and Store Keeper (BROADCAST)
//     try {
//       await createNotification({
//         type: 'work-status-update',
//         // ❌ NO recipient - broadcast to Admin + Store Keeper
//         title: '🔄 Work Status Updated',
//         message: `${work.garment?.name || 'Garment'} is now ${status.replace(/-/g, ' ')}`,
//         reference: {
//           orderId: work.order?._id,
//           workId: work._id,
//           garmentId: work.garment?._id
//         },
//         priority: 'normal'
//       });
//       console.log('✅ Broadcast notification sent to Admin and Store Keepers');
//     } catch (notifError) {
//       console.log('⚠️ Broadcast notification failed:', notifError.message);
//     }

//     // ✅ Send notification to assigned tailor if status is relevant
//     if (work.tailor) {
//       try {
//         await createNotification({
//           type: 'work-status-update',
//           recipient: work.tailor,
//           recipientModel: 'Tailor',
//           title: '🔄 Your Work Status Updated',
//           message: `Your work on ${work.garment?.name || 'Garment'} is now ${status.replace(/-/g, ' ')}`,
//           reference: {
//             orderId: work.order?._id,
//             workId: work._id,
//             garmentId: work.garment?._id
//           },
//           priority: 'normal'
//         });
//         console.log('✅ Notification sent to tailor');
//       } catch (notifError) {
//         console.log('⚠️ Tailor notification failed:', notifError.message);
//       }
//     }

//     // ✅ AUTO-UPDATE ORDER STATUS BASED ON ALL WORKS
//     console.log('9️⃣ Checking order status for auto-update...');
//     if (work.order) {
//       try {
//         // Get all works for this order
//         const orderWorks = await Work.find({ 
//           order: work.order._id,
//           isActive: true 
//         });
        
//         console.log(`📊 Found ${orderWorks.length} works for order ${work.order._id}`);
        
//         // Check if ALL works are ready
//         const allWorksReady = orderWorks.every(w => w.status === 'ready-to-deliver');
        
//         // Check if ANY work is in progress
//         const anyWorkInProgress = orderWorks.some(w => 
//           ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(w.status)
//         );
        
//         // Determine new order status
//         let newOrderStatus = work.order.status;
//         let statusChanged = false;
        
//         if (allWorksReady) {
//           newOrderStatus = 'ready-to-delivery';
//           console.log('✅ ALL works ready! Order status should be: ready-to-delivery');
//           statusChanged = true;
          
//           // ✅ Send WhatsApp notification for ready order
//           try {
//             // Dynamic import to avoid circular dependency
//             import('./whatsapp.controller.js').then(({ sendReadyToDeliver }) => {
//               sendReadyToDeliver(work.order._id)
//                 .catch(err => console.log('⚠️ Ready WhatsApp failed:', err.message));
//             }).catch(importErr => {
//               console.log('⚠️ Could not import whatsapp controller:', importErr.message);
//             });
//           } catch (waErr) {
//             console.log('⚠️ WhatsApp notification error:', waErr.message);
//           }
          
//         } else if (anyWorkInProgress) {
//           newOrderStatus = 'in-progress';
//           console.log('📊 Some works in progress -> order status should be: in-progress');
//           statusChanged = true;
//         } else if (orderWorks.length > 0) {
//           // All works are either pending or accepted
//           newOrderStatus = 'confirmed';
//           console.log('📊 All works pending/accepted -> order status should be: confirmed');
//           statusChanged = true;
//         }
        
//         // Update order status if changed
//         if (statusChanged && work.order.status !== newOrderStatus) {
//           const oldStatus = work.order.status;
//           work.order.status = newOrderStatus;
//           await work.order.save();
//           console.log(`✅ Order status updated from ${oldStatus} to ${newOrderStatus}`);
          
//           // ✅ FIXED: Notify Admin and Store Keeper about order status change
//           try {
//             await createNotification({
//               type: 'order-status-update',
//               // ❌ NO recipient - broadcast to Admin + Store Keeper
//               title: '📦 Order Status Updated',
//               message: `Order ${work.order.orderId} is now ${newOrderStatus}`,
//               reference: {
//                 orderId: work.order._id
//               },
//               priority: 'normal'
//             });
//           } catch (notifError) {
//             console.log('⚠️ Order status notification failed:', notifError.message);
//           }
//         } else {
//           console.log(`ℹ️ Order status unchanged (current: ${work.order.status})`);
//         }
        
//       } catch (orderError) {
//         console.error('❌ Error updating order status:', orderError.message);
//         // Don't fail the main request
//       }
//     }

//     console.log('🔟 Sending success response');
//     console.log('🔄 ===== UPDATE WORK STATUS COMPLETED =====\n');
    
//     res.json({
//       success: true,
//       message: 'Work status updated successfully',
//       data: work
//     });

//   } catch (error) {
//     console.error('\n❌ ===== UPDATE WORK STATUS ERROR =====');
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     if (error.code) console.error('Error code:', error.code);
//     console.error('❌ ===== ERROR END =====\n');
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update work status',
//       error: error.message
//     });
//   }
// };

// // @desc    Delete work (Admin only)
// // @route   DELETE /api/works/:id
// // @access  Private (Admin only)
// export const deleteWork = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id);

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // Only admin can delete
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({
//         success: false,
//         message: 'Only admin can delete works'
//       });
//     }

//     // ✅ If work had a tailor assigned, remove all their stats
//     if (work.tailor) {
//       const decrementUpdate = { 'workStats.totalAssigned': -1 };
      
//       if (work.status === 'pending' || work.status === 'accepted') {
//         decrementUpdate['workStats.pending'] = -1;
//       } else if (['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(work.status)) {
//         decrementUpdate['workStats.inProgress'] = -1;
//       } else if (work.status === 'ready-to-deliver') {
//         decrementUpdate['workStats.completed'] = -1;
//       }
      
//       await Tailor.findByIdAndUpdate(work.tailor, {
//         $inc: decrementUpdate
//       });
//       console.log(`✅ Removed stats from tailor ${work.tailor}:`, decrementUpdate);
//     }

//     // ✅ FIXED: Notify Admin and Store Keeper about work deletion
//     try {
//       await createNotification({
//         type: 'work-deleted',
//         // ❌ NO recipient - broadcast to Admin + Store Keeper
//         title: '🗑️ Work Deleted',
//         message: `Work ${work.workId} has been deleted`,
//         reference: {
//           workId: work._id,
//           orderId: work.order
//         },
//         priority: 'high'
//       });
//     } catch (notifError) {
//       console.log('⚠️ Deletion notification failed:', notifError.message);
//     }

//     await work.deleteOne();

//     res.json({
//       success: true,
//       message: 'Work deleted successfully'
//     });

//   } catch (error) {
//     console.error('Delete work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete work',
//       error: error.message
//     });
//   }
// };

// // @desc    Get work statistics
// // @route   GET /api/works/stats
// // @access  Private (Admin, Store Keeper)
// export const getWorkStats = async (req, res) => {
//   try {
//     console.log('📊 Fetching work statistics...');
    
//     // Aggregate work statistics by status
//     const stats = await Work.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalWorks: { $sum: 1 },
//           pendingWorks: {
//             $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
//           },
//           acceptedWorks: {
//             $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
//           },
//           cuttingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-started'] }, 1, 0] }
//           },
//           cuttingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-completed'] }, 1, 0] }
//           },
//           sewingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-started'] }, 1, 0] }
//           },
//           sewingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-completed'] }, 1, 0] }
//           },
//           ironing: {
//             $sum: { $cond: [{ $eq: ['$status', 'ironing'] }, 1, 0] }
//           },
//           readyToDeliver: {
//             $sum: { $cond: [{ $eq: ['$status', 'ready-to-deliver'] }, 1, 0] }
//           }
//         }
//       }
//     ]);

//     // Get today's works
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const todayWorks = await Work.countDocuments({
//       createdAt: { $gte: today }
//     });

//     // Get overdue works (estimated delivery passed and not ready)
//     const overdueWorks = await Work.countDocuments({
//       estimatedDelivery: { $lt: new Date() },
//       status: { $ne: 'ready-to-deliver' }
//     });

//     const result = stats[0] || {
//       totalWorks: 0,
//       pendingWorks: 0,
//       acceptedWorks: 0,
//       cuttingStarted: 0,
//       cuttingCompleted: 0,
//       sewingStarted: 0,
//       sewingCompleted: 0,
//       ironing: 0,
//       readyToDeliver: 0
//     };

//     res.json({
//       success: true,
//       data: {
//         ...result,
//         todayWorks,
//         overdueWorks
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get work stats error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch work statistics',
//       error: error.message 
//     });
//   }
// };

// // @desc    Get works by tailor
// // @route   GET /api/works/tailor-works
// // @access  Private (Tailor only)
// export const getWorksByTailor = async (req, res) => {
//   try {
//     const tailorId = req.user?._id || req.user?.id;
    
//     if (!tailorId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     const { status, page = 1, limit = 20 } = req.query;

//     const filter = { 
//       tailor: tailorId,
//       isActive: true 
//     };
    
//     if (status && status !== 'all' && status !== '') {
//       filter.status = status;
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const works = await Work.find(filter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer',
//         populate: {
//           path: 'customer',
//           select: 'name'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId measurements'
//       })
//       .populate('cuttingMaster', 'name')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Work.countDocuments(filter);

//     res.json({
//       success: true,
//       data: {
//         works,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get tailor works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };

// // @desc    Assign cutting master to work (Admin/Store Keeper)
// // @route   PATCH /api/works/:id/assign-cutting-master
// // @access  Private (Admin, Store Keeper)
// export const assignCuttingMaster = async (req, res) => {
//   console.log('\n✂️ ===== ASSIGN CUTTING MASTER CALLED =====');
//   console.log('Work ID:', req.params.id);
//   console.log('Request body:', req.body);
  
//   try {
//     const { cuttingMasterId } = req.body;
//     const workId = req.params.id;

//     if (!cuttingMasterId) {
//       return res.status(400).json({
//         success: false,
//         message: 'cuttingMasterId is required'
//       });
//     }

//     const work = await Work.findById(workId);
//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     // If work is pending, assign directly
//     work.cuttingMaster = cuttingMasterId;
//     if (work.status === 'pending') {
//       work.status = 'accepted';
//       work.acceptedAt = new Date();
//     }
//     await work.save();

//     console.log(`✅ Cutting master ${cuttingMasterId} assigned to work ${workId}`);

//     // ✅ Notify the assigned master
//     await createNotification({
//       type: 'work-assigned',
//       recipient: cuttingMasterId,
//       recipientModel: 'CuttingMaster',
//       title: '📋 Work Assigned to You',
//       message: `Work ${work.workId} has been assigned to you`,
//       reference: { workId: work._id },
//       priority: 'high'
//     });

//     res.json({ 
//       success: true, 
//       message: 'Cutting master assigned', 
//       data: work 
//     });
//   } catch (error) {
//     console.error('❌ Assign cutting master error:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };

// // ===== PERMANENT FIX: RECALCULATE AND UPDATE TAILOR STATS =====
// // @desc    Recalculate and update stats for a specific tailor
// // @route   POST /api/works/recalculate-tailor-stats/:tailorId
// // @access  Private (Admin, Store Keeper)
// export const recalculateTailorStats = async (req, res) => {
//   try {
//     const { tailorId } = req.params;
    
//     console.log('🔄 Recalculating stats for tailor:', tailorId);
    
//     // Get all works for this tailor
//     const works = await Work.find({ 
//       tailor: tailorId,
//       isActive: true 
//     });

//     console.log('📋 Works found:', works.length);
    
//     // Calculate correct stats based on actual work statuses
//     const workStats = {
//       totalAssigned: works.length,
//       completed: works.filter(w => w.status === 'ready-to-deliver').length,
//       pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
//       inProgress: works.filter(w => 
//         ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//         .includes(w.status)
//       ).length
//     };

//     console.log('📊 Calculated stats:', workStats);

//     // Update tailor in database
//     const updatedTailor = await Tailor.findByIdAndUpdate(
//       tailorId,
//       { $set: { workStats } },
//       { new: true }
//     );

//     if (!updatedTailor) {
//       return res.status(404).json({
//         success: false,
//         message: 'Tailor not found'
//       });
//     }

//     console.log('✅ Tailor stats updated successfully');

//     res.json({
//       success: true,
//       message: 'Tailor stats recalculated successfully',
//       data: {
//         tailorId: updatedTailor._id,
//         name: updatedTailor.name,
//         workStats: updatedTailor.workStats,
//         worksBreakdown: works.map(w => ({
//           workId: w.workId,
//           status: w.status
//         }))
//       }
//     });

//   } catch (error) {
//     console.error('❌ Error recalculating stats:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to recalculate tailor stats',
//       error: error.message
//     });
//   }
// };

// // @desc    Recalculate and update stats for ALL tailors
// // @route   POST /api/works/recalculate-all-tailor-stats
// // @access  Private (Admin only)
// export const recalculateAllTailorStats = async (req, res) => {
//   try {
//     const tailors = await Tailor.find({ isActive: true });
//     let updated = 0;
//     let results = [];

//     for (const tailor of tailors) {
//       const works = await Work.find({ 
//         tailor: tailor._id,
//         isActive: true 
//       });

//       const workStats = {
//         totalAssigned: works.length,
//         completed: works.filter(w => w.status === 'ready-to-deliver').length,
//         pending: works.filter(w => ['pending', 'accepted'].includes(w.status)).length,
//         inProgress: works.filter(w => 
//           ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//           .includes(w.status)
//         ).length
//       };

//       // Only update if stats are different
//       if (JSON.stringify(tailor.workStats) !== JSON.stringify(workStats)) {
//         tailor.workStats = workStats;
//         await tailor.save();
//         updated++;
//         results.push({
//           name: tailor.name,
//           tailorId: tailor.tailorId,
//           oldStats: tailor.workStats,
//           newStats: workStats
//         });
//       }
//     }

//     res.json({
//       success: true,
//       message: `Recalculated stats for ${updated} tailors`,
//       data: {
//         updated,
//         details: results
//       }
//     });

//   } catch (error) {
//     console.error('❌ Error recalculating all stats:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to recalculate all tailor stats',
//       error: error.message
//     });
//   }
// };

// // ===== HELPER FUNCTIONS =====

// // Helper function to generate work ID
// const generateWorkId = (garmentName) => {
//   const date = new Date();
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = date.getFullYear();
//   const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
//   const prefix = garmentName?.substring(0, 3).toUpperCase() || 'WRK';
//   return `${prefix}-${day}${month}${year}-${random}`;
// };

// // Helper function to generate measurement PDF (NOT exported)
// const generateMeasurementPdf = async (garment) => {
//   // TODO: Implement PDF generation
//   // For now, return a placeholder URL
//   return `https://storage.example.com/measurements/${garment.garmentId}.pdf`;
// };

// // ============================================
// // ✅ DASHBOARD: GET WORK STATS WITH DATE FILTERS
// // ============================================
// // @desc    Get work statistics for dashboard (with date filters)
// // @route   GET /api/works/stats/dashboard
// // @access  Private (Admin, Store Keeper)
// export const getDashboardWorkStats = async (req, res) => {
//   try {
//     const { period, startDate, endDate } = req.query;
    
//     console.log('📊 Getting work stats for dashboard with:', { period, startDate, endDate });
    
//     // Build date filter
//     let dateFilter = {};
//     const now = new Date();
    
//     if (period === 'today') {
//       const today = new Date(now.setHours(0, 0, 0, 0));
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
      
//       dateFilter = {
//         createdAt: {
//           $gte: today,
//           $lt: tomorrow
//         }
//       };
//     } else if (period === 'week') {
//       const startOfWeek = new Date(now);
//       startOfWeek.setDate(now.getDate() - now.getDay());
//       startOfWeek.setHours(0, 0, 0, 0);
      
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(startOfWeek.getDate() + 7);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfWeek,
//           $lt: endOfWeek
//         }
//       };
//     } else if (period === 'month') {
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//       endOfMonth.setHours(23, 59, 59, 999);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfMonth,
//           $lte: endOfMonth
//         }
//       };
//     } else if (startDate && endDate) {
//       dateFilter = {
//         createdAt: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate + 'T23:59:59.999Z')
//         }
//       };
//     }
    
//     console.log('📅 Work date filter:', dateFilter);
    
//     // Aggregate work statistics by status
//     const stats = await Work.aggregate([
//       { $match: dateFilter },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: 1 },
//           pending: {
//             $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
//           },
//           accepted: {
//             $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
//           },
//           cuttingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-started'] }, 1, 0] }
//           },
//           cuttingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'cutting-completed'] }, 1, 0] }
//           },
//           sewingStarted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-started'] }, 1, 0] }
//           },
//           sewingCompleted: {
//             $sum: { $cond: [{ $eq: ['$status', 'sewing-completed'] }, 1, 0] }
//           },
//           ironing: {
//             $sum: { $cond: [{ $eq: ['$status', 'ironing'] }, 1, 0] }
//           },
//           readyToDeliver: {
//             $sum: { $cond: [{ $eq: ['$status', 'ready-to-deliver'] }, 1, 0] }
//           },
//           cancelled: {
//             $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
//           }
//         }
//       }
//     ]);

//     // Get today's works (separate from filter)
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const todayWorks = await Work.countDocuments({
//       createdAt: { $gte: today }
//     });

//     // Get overdue works (estimated delivery passed and not ready)
//     const overdueWorks = await Work.countDocuments({
//       estimatedDelivery: { $lt: new Date() },
//       status: { $ne: 'ready-to-deliver' },
//       ...dateFilter // Apply date filter to estimated delivery
//     });

//     const result = stats[0] || {
//       total: 0,
//       pending: 0,
//       accepted: 0,
//       cuttingStarted: 0,
//       cuttingCompleted: 0,
//       sewingStarted: 0,
//       sewingCompleted: 0,
//       ironing: 0,
//       readyToDeliver: 0,
//       cancelled: 0
//     };

//     // Combine similar statuses for easier frontend use
//     const workStats = {
//       total: result.total,
//       pending: result.pending + result.accepted, // Pending includes accepted
//       inProgress: result.cuttingStarted + result.cuttingCompleted + 
//                   result.sewingStarted + result.sewingCompleted + result.ironing,
//       completed: result.readyToDeliver,
//       cancelled: result.cancelled,
//       todayWorks,
//       overdueWorks,
//       // Detailed breakdown (optional)
//       details: {
//         pending: result.pending,
//         accepted: result.accepted,
//         cuttingStarted: result.cuttingStarted,
//         cuttingCompleted: result.cuttingCompleted,
//         sewingStarted: result.sewingStarted,
//         sewingCompleted: result.sewingCompleted,
//         ironing: result.ironing,
//         readyToDeliver: result.readyToDeliver
//       },
//       filter: {
//         period,
//         startDate: dateFilter.createdAt?.$gte,
//         endDate: dateFilter.createdAt?.$lte
//       }
//     };

//     console.log('✅ Work stats for dashboard:', workStats);

//     res.json({
//       success: true,
//       data: workStats
//     });

//   } catch (error) {
//     console.error('❌ Get dashboard work stats error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch work statistics',
//       error: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ DASHBOARD: GET RECENT WORKS WITH PRIORITY
// // ============================================
// // @desc    Get recent works for dashboard
// // @route   GET /api/works/recent
// // @access  Private (Admin, Store Keeper)
// export const getRecentWorks = async (req, res) => {
//   try {
//     const { limit = 5, period, startDate, endDate } = req.query;
    
//     console.log('📋 Getting recent works with:', { limit, period, startDate, endDate });
    
//     // Build date filter
//     let dateFilter = {};
//     const now = new Date();
    
//     if (period === 'today') {
//       const today = new Date(now.setHours(0, 0, 0, 0));
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
      
//       dateFilter = {
//         createdAt: {
//           $gte: today,
//           $lt: tomorrow
//         }
//       };
//     } else if (period === 'week') {
//       const startOfWeek = new Date(now);
//       startOfWeek.setDate(now.getDate() - now.getDay());
//       startOfWeek.setHours(0, 0, 0, 0);
      
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(startOfWeek.getDate() + 7);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfWeek,
//           $lt: endOfWeek
//         }
//       };
//     } else if (period === 'month') {
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//       endOfMonth.setHours(23, 59, 59, 999);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfMonth,
//           $lte: endOfMonth
//         }
//       };
//     } else if (startDate && endDate) {
//       dateFilter = {
//         createdAt: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate + 'T23:59:59.999Z')
//         }
//       };
//     }
    
//     const recentWorks = await Work.find(dateFilter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer',
//         populate: {
//           path: 'customer',
//           select: 'name phone'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId priority'  // ✅ Added 'priority'
//       })
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name')
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit));

//     // Format for dashboard display with priority
//     const formattedWorks = recentWorks.map(work => ({
//       _id: work._id,
//       workId: work.workId,
//       status: work.status,
//       garment: work.garment ? {
//         name: work.garment.name,
//         id: work.garment.garmentId,
//         priority: work.garment.priority  // ✅ Added priority
//       } : null,
//       order: work.order ? {
//         orderId: work.order.orderId,
//         customer: work.order.customer
//       } : null,
//       cuttingMaster: work.cuttingMaster?.name,
//       tailor: work.tailor?.name,
//       createdAt: work.createdAt,
//       estimatedDelivery: work.estimatedDelivery
//     }));

//     console.log(`✅ Found ${formattedWorks.length} recent works`);

//     res.json({
//       success: true,
//       data: {
//         works: formattedWorks,
//         count: formattedWorks.length,
//         filter: { period, startDate, endDate }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get recent works error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch recent works',
//       error: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ DASHBOARD: GET WORK STATUS BREAKDOWN
// // ============================================
// // @desc    Get work status breakdown for pie chart
// // @route   GET /api/works/status-breakdown
// // @access  Private (Admin, Store Keeper)
// export const getWorkStatusBreakdown = async (req, res) => {
//   try {
//     const { period, startDate, endDate } = req.query;
    
//     // Build date filter (same as above)
//     let dateFilter = {};
//     const now = new Date();
    
//     if (period === 'today') {
//       const today = new Date(now.setHours(0, 0, 0, 0));
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
      
//       dateFilter = {
//         createdAt: {
//           $gte: today,
//           $lt: tomorrow
//         }
//       };
//     } else if (period === 'week') {
//       const startOfWeek = new Date(now);
//       startOfWeek.setDate(now.getDate() - now.getDay());
//       startOfWeek.setHours(0, 0, 0, 0);
      
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(startOfWeek.getDate() + 7);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfWeek,
//           $lt: endOfWeek
//         }
//       };
//     } else if (period === 'month') {
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//       endOfMonth.setHours(23, 59, 59, 999);
      
//       dateFilter = {
//         createdAt: {
//           $gte: startOfMonth,
//           $lte: endOfMonth
//         }
//       };
//     } else if (startDate && endDate) {
//       dateFilter = {
//         createdAt: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate + 'T23:59:59.999Z')
//         }
//       };
//     }
    
//     // Group by status
//     const breakdown = await Work.aggregate([
//       { $match: dateFilter },
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // Status colors for frontend
//     const statusColors = {
//       'pending': '#f59e0b',
//       'accepted': '#f59e0b',
//       'cutting-started': '#3b82f6',
//       'cutting-completed': '#3b82f6',
//       'sewing-started': '#3b82f6',
//       'sewing-completed': '#3b82f6',
//       'ironing': '#3b82f6',
//       'ready-to-deliver': '#10b981',
//       'cancelled': '#ef4444'
//     };

//     // Map status to display names
//     const statusNames = {
//       'pending': 'Pending',
//       'accepted': 'Accepted',
//       'cutting-started': 'Cutting Started',
//       'cutting-completed': 'Cutting Done',
//       'sewing-started': 'Sewing Started',
//       'sewing-completed': 'Sewing Done',
//       'ironing': 'Ironing',
//       'ready-to-deliver': 'Ready',
//       'cancelled': 'Cancelled'
//     };

//     // For pie chart, we want to combine similar statuses
//     const pieData = [
//       { name: 'Pending', value: 0, color: '#f59e0b' },
//       { name: 'In Progress', value: 0, color: '#3b82f6' },
//       { name: 'Ready', value: 0, color: '#10b981' },
//       { name: 'Cancelled', value: 0, color: '#ef4444' }
//     ];

//     breakdown.forEach(item => {
//       if (['pending', 'accepted'].includes(item._id)) {
//         pieData[0].value += item.count; // Pending
//       } else if (['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing'].includes(item._id)) {
//         pieData[1].value += item.count; // In Progress
//       } else if (item._id === 'ready-to-deliver') {
//         pieData[2].value = item.count; // Ready
//       } else if (item._id === 'cancelled') {
//         pieData[3].value = item.count; // Cancelled
//       }
//     });

//     res.json({
//       success: true,
//       data: {
//         breakdown: breakdown.map(item => ({
//           status: item._id,
//           name: statusNames[item._id] || item._id,
//           count: item.count,
//           color: statusColors[item._id] || '#94a3b8'
//         })),
//         pieData: pieData.filter(item => item.value > 0),
//         total: breakdown.reduce((sum, item) => sum + item.count, 0)
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get work status breakdown error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch work status breakdown',
//       error: error.message 
//     });
//   }
// };

// // ============================================
// // ✅ CALENDAR WORK DATA
// // ============================================
// // @desc    Get work data for calendar view
// // @route   GET /api/works/calendar
// // @access  Private
// export const getCalendarWorkData = async (req, res) => {
//   try {
//     const { startDate, endDate, cuttingMasterId, tailorId } = req.query;
    
//     console.log('📅 Getting calendar work data:', { startDate, endDate, cuttingMasterId, tailorId });
    
//     // Build filter
//     const filter = { isActive: true };
    
//     // Date range filter (if provided)
//     if (startDate || endDate) {
//       filter.$or = [
//         { createdAt: {} },
//         { estimatedDelivery: {} }
//       ];
      
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         filter.$or[0].createdAt.$gte = start;
//         filter.$or[1].estimatedDelivery.$gte = start;
//       }
      
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         filter.$or[0].createdAt.$lte = end;
//         filter.$or[1].estimatedDelivery.$lte = end;
//       }
//     }
    
//     // Filter by cutting master
//     if (cuttingMasterId) {
//       filter.cuttingMaster = cuttingMasterId;
//     }
    
//     // Filter by tailor
//     if (tailorId) {
//       filter.tailor = tailorId;
//     }
    
//     // Get works for calendar
//     const works = await Work.find(filter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer',
//         populate: {
//           path: 'customer',
//           select: 'name'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId'
//       })
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name')
//       .select('workId status createdAt estimatedDelivery cuttingMaster tailor order garment');
    
//     // Format for calendar (FullCalendar or similar)
//     const calendarEvents = works.map(work => {
//       // Determine color based on status
//       let color = '#3788d8'; // default blue
//       if (work.status === 'ready-to-deliver') color = '#10b981'; // green
//       if (work.status === 'pending') color = '#f59e0b'; // orange
//       if (work.status === 'cancelled') color = '#ef4444'; // red
      
//       return {
//         id: work._id,
//         title: `${work.workId} - ${work.garment?.name || 'Garment'}`,
//         start: work.estimatedDelivery || work.createdAt,
//         allDay: true,
//         backgroundColor: color,
//         borderColor: color,
//         extendedProps: {
//           workId: work.workId,
//           status: work.status,
//           orderId: work.order?.orderId,
//           customer: work.order?.customer?.name,
//           garment: work.garment?.name,
//           cuttingMaster: work.cuttingMaster?.name,
//           tailor: work.tailor?.name,
//           createdAt: work.createdAt
//         }
//       };
//     });
    
//     res.json({
//       success: true,
//       data: {
//         events: calendarEvents,
//         total: calendarEvents.length
//       }
//     });
    
//   } catch (error) {
//     console.error('❌ Get calendar work data error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch calendar data',
//       error: error.message
//     });
//   }
// };

// // ============================================
// // ✅ CUTTING MASTER DASHBOARD STATS
// // ============================================
// // @desc    Get cutting master dashboard statistics
// // @route   GET /api/works/cutting-master-stats
// // @access  Private (Cutting Master only)
// export const getCuttingMasterDashboardStats = async (req, res) => {
//   try {
//     const cuttingMasterId = req.user?._id || req.user?.id;
    
//     console.log('📊 Getting cutting master dashboard stats for:', cuttingMasterId);

//     if (!cuttingMasterId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     // Get all works for this cutting master
//     const works = await Work.find({
//       cuttingMaster: cuttingMasterId,
//       isActive: true
//     });

//     // Calculate statistics
//     const stats = {
//       totalWorks: works.length,
//       pendingWorks: works.filter(w => w.status === 'pending').length,
//       acceptedWorks: works.filter(w => w.status === 'accepted').length,
//       cuttingStarted: works.filter(w => w.status === 'cutting-started').length,
//       cuttingCompleted: works.filter(w => w.status === 'cutting-completed').length,
//       sewingStarted: works.filter(w => w.status === 'sewing-started').length,
//       sewingCompleted: works.filter(w => w.status === 'sewing-completed').length,
//       ironing: works.filter(w => w.status === 'ironing').length,
//       readyToDeliver: works.filter(w => w.status === 'ready-to-deliver').length,
//       completed: works.filter(w => w.status === 'ready-to-deliver').length,
//       inProgress: works.filter(w => 
//         ['cutting-started', 'cutting-completed', 'sewing-started', 'sewing-completed', 'ironing']
//         .includes(w.status)
//       ).length
//     };

//     // Get available works in the pool (pending and not assigned to anyone)
//     const availableWorks = await Work.countDocuments({
//       cuttingMaster: null,
//       status: 'pending',
//       isActive: true
//     });

//     // Get today's works
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const todayWorks = works.filter(w => 
//       new Date(w.createdAt) >= today
//     ).length;

//     // Get overdue works
//     const overdueWorks = works.filter(w => 
//       w.estimatedDelivery && 
//       new Date(w.estimatedDelivery) < new Date() && 
//       w.status !== 'ready-to-deliver'
//     ).length;

//     res.json({
//       success: true,
//       data: {
//         ...stats,
//         availableWorks,
//         todayWorks,
//         overdueWorks,
//         recentActivities: works.slice(0, 5).map(w => ({
//           _id: w._id,
//           workId: w.workId,
//           status: w.status,
//           updatedAt: w.updatedAt
//         }))
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get cutting master dashboard stats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch cutting master statistics',
//       error: error.message
//     });
//   }
// };

// // ============================================
// // ✅ TAILOR PERFORMANCE FOR CUTTING MASTER
// // ============================================
// // @desc    Get tailor performance metrics for cutting master dashboard
// // @route   GET /api/works/tailor-performance
// // @access  Private (Cutting Master, Admin)
// export const getTailorPerformanceForMaster = async (req, res) => {
//   try {
//     const { limit = 10, search, sortBy = 'workStats.completed' } = req.query;
    
//     console.log('📊 Getting tailor performance data with:', { limit, search, sortBy });

//     // Build filter for tailors
//     const filter = { isActive: true };
    
//     // Add search if provided
//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { tailorId: { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Get tailors with their work stats
//     const tailors = await Tailor.find(filter)
//       .select('name tailorId phone specialization workStats currentLoad isAvailable')
//       .sort({ [sortBy]: -1 })
//       .limit(parseInt(limit));

//     // Get currently assigned works for each tailor to calculate current load
//     const tailorPerformance = await Promise.all(tailors.map(async (tailor) => {
//       // Get works currently assigned to this tailor
//       const assignedWorks = await Work.find({
//         tailor: tailor._id,
//         status: { $nin: ['ready-to-deliver', 'cancelled'] },
//         isActive: true
//       }).populate({
//         path: 'garment',
//         select: 'name priority'
//       });

//       // Calculate efficiency score (completed vs total assigned)
//       const efficiency = tailor.workStats.totalAssigned > 0 
//         ? Math.round((tailor.workStats.completed / tailor.workStats.totalAssigned) * 100) 
//         : 0;

//       // Determine availability status
//       let availability = 'available';
//       if (tailor.currentLoad >= 5) {
//         availability = 'busy';
//       } else if (tailor.currentLoad >= 3) {
//         availability = 'moderate';
//       }

//       return {
//         _id: tailor._id,
//         name: tailor.name,
//         tailorId: tailor.tailorId,
//         phone: tailor.phone,
//         specialization: tailor.specialization || 'General',
//         stats: {
//           totalAssigned: tailor.workStats.totalAssigned || 0,
//           completed: tailor.workStats.completed || 0,
//           pending: tailor.workStats.pending || 0,
//           inProgress: tailor.workStats.inProgress || 0,
//           efficiency: `${efficiency}%`
//         },
//         currentLoad: {
//           count: assignedWorks.length,
//           status: availability,
//           maxLoad: 5 // Configurable max load
//         },
//         isAvailable: tailor.isAvailable,
//         currentWorks: assignedWorks.slice(0, 3).map(w => ({
//           workId: w.workId,
//           garment: w.garment?.name,
//           priority: w.garment?.priority || 'normal',
//           status: w.status
//         }))
//       };
//     }));

//     // Get summary statistics
//     const summary = {
//       totalTailors: tailors.length,
//       availableTailors: tailorPerformance.filter(t => t.isAvailable && t.currentLoad.count < 5).length,
//       busyTailors: tailorPerformance.filter(t => !t.isAvailable || t.currentLoad.count >= 5).length,
//       totalActiveWorks: tailorPerformance.reduce((sum, t) => sum + t.currentLoad.count, 0),
//       averageEfficiency: Math.round(
//         tailorPerformance.reduce((sum, t) => {
//           const eff = parseInt(t.stats.efficiency) || 0;
//           return sum + eff;
//         }, 0) / (tailorPerformance.length || 1)
//       )
//     };

//     res.json({
//       success: true,
//       data: {
//         tailors: tailorPerformance,
//         summary,
//         filters: {
//           search,
//           sortBy,
//           limit: parseInt(limit)
//         }
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get tailor performance error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch tailor performance data',
//       error: error.message
//     });
//   }
// };

// // ============================================
// // ✅ TODAY'S SUMMARY FOR MASTER
// // ============================================
// // @desc    Get today's summary for cutting master dashboard
// // @route   GET /api/works/today-summary
// // @access  Private (Cutting Master only)
// export const getTodaySummaryForMaster = async (req, res) => {
//   try {
//     const cuttingMasterId = req.user?._id || req.user?.id;
    
//     console.log('📅 Getting today\'s summary for master:', cuttingMasterId);

//     if (!cuttingMasterId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     // Set date range for today
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // Get works created today for this master
//     const todayWorks = await Work.find({
//       cuttingMaster: cuttingMasterId,
//       createdAt: {
//         $gte: today,
//         $lt: tomorrow
//       },
//       isActive: true
//     }).populate({
//       path: 'garment',
//       select: 'name'
//     });

//     // Get works due today
//     const dueToday = await Work.find({
//       cuttingMaster: cuttingMasterId,
//       estimatedDelivery: {
//         $gte: today,
//         $lt: tomorrow
//       },
//       status: { $ne: 'ready-to-deliver' },
//       isActive: true
//     }).populate({
//       path: 'garment',
//       select: 'name'
//     });

//     // Get recent status updates today
//     const recentUpdates = await Work.find({
//       cuttingMaster: cuttingMasterId,
//       updatedAt: {
//         $gte: today,
//         $lt: tomorrow
//       },
//       isActive: true
//     })
//     .sort({ updatedAt: -1 })
//     .limit(5)
//     .populate({
//       path: 'garment',
//       select: 'name'
//     });

//     // Get priority breakdown
//     const priorityBreakdown = await Work.aggregate([
//       {
//         $match: {
//           cuttingMaster: cuttingMasterId,
//           isActive: true
//         }
//       },
//       {
//         $lookup: {
//           from: 'garments',
//           localField: 'garment',
//           foreignField: '_id',
//           as: 'garmentInfo'
//         }
//       },
//       {
//         $unwind: {
//           path: '$garmentInfo',
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $group: {
//           _id: '$garmentInfo.priority',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // Format priority data
//     const priorities = {
//       high: 0,
//       medium: 0,
//       low: 0,
//       normal: 0
//     };
    
//     priorityBreakdown.forEach(item => {
//       const priority = item._id || 'normal';
//       priorities[priority] = item.count;
//     });

//     // Calculate completion rate for today
//     const completedToday = await Work.countDocuments({
//       cuttingMaster: cuttingMasterId,
//       status: 'ready-to-deliver',
//       updatedAt: {
//         $gte: today,
//         $lt: tomorrow
//       },
//       isActive: true
//     });

//     const totalActive = await Work.countDocuments({
//       cuttingMaster: cuttingMasterId,
//       status: { $nin: ['ready-to-deliver', 'cancelled'] },
//       isActive: true
//     });

//     res.json({
//       success: true,
//       data: {
//         date: today,
//         summary: {
//           newWorks: todayWorks.length,
//           dueToday: dueToday.length,
//           completedToday,
//           totalActive,
//           completionRate: totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0
//         },
//         priorities,
//         recentActivity: recentUpdates.map(w => ({
//           _id: w._id,
//           workId: w.workId,
//           garment: w.garment?.name,
//           status: w.status,
//           updatedAt: w.updatedAt,
//           timeAgo: getTimeAgo(w.updatedAt)
//         })),
//         upcomingDeadlines: dueToday.slice(0, 3).map(w => ({
//           _id: w._id,
//           workId: w.workId,
//           garment: w.garment?.name,
//           estimatedDelivery: w.estimatedDelivery
//         }))
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get today\'s summary error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch today\'s summary',
//       error: error.message
//     });
//   }
// };

// // Helper function for time ago
// const getTimeAgo = (date) => {
//   const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
//   let interval = seconds / 31536000;
//   if (interval > 1) return Math.floor(interval) + ' years ago';
  
//   interval = seconds / 2592000;
//   if (interval > 1) return Math.floor(interval) + ' months ago';
  
//   interval = seconds / 86400;
//   if (interval > 1) return Math.floor(interval) + ' days ago';
  
//   interval = seconds / 3600;
//   if (interval > 1) return Math.floor(interval) + ' hours ago';
  
//   interval = seconds / 60;
//   if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
//   return Math.floor(seconds) + ' seconds ago';
// };











// controllers/work.controller.js
import Work from '../models/Work.js';
import Order from '../models/Order.js';
import Garment from '../models/Garment.js';
import CuttingMaster from '../models/CuttingMaster.js';
import Tailor from '../models/Tailor.js';
import Notification from '../models/Notification.js';
import { createNotification } from './notification.controller.js';

// ============================================
// ✅ HELPER: GENERATE WORK ID (OrderID.sequence)
// ============================================
const generateWorkId = async (orderId, orderIdNumber) => {
  // Count works for this specific order
  const workCount = await Work.countDocuments({
    order: orderId,
    isActive: true
  });

  const sequence = workCount + 1;
  
  // Dynamic padding - minimum 2 digits, auto grow
  const seqStr = sequence < 100 ? String(sequence).padStart(2, "0") : String(sequence);
  
  const workId = `${orderIdNumber}.${seqStr}`;
  console.log(`🧵 Generated Work ID: ${workId} (Sequence: ${sequence} for order ${orderIdNumber})`);
  
  return workId;
};

// Helper function for time ago
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
};

// @desc    Create work for each garment in an order
// @route   POST /api/works/create-from-order/:orderId
// @access  Private (Store Keeper, Admin)
export const createWorksFromOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get order with garments
    const order = await Order.findById(orderId)
      .populate('garments');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const works = [];
    
    // Create work for each garment
    for (const garment of order.garments) {
      // Generate measurement PDF (you can implement PDF generation later)
      const measurementPdf = await generateMeasurementPdf(garment);
      
      // 🔥 NEW: Generate Work ID using Order ID + sequence
      const workId = await generateWorkId(order._id, order.orderId);
      
      // ✅ OPEN POOL MODEL: Create with null cuttingMaster

const dynamicStageKeys =
  order.stageKeys?.length
    ? order.stageKeys
    : (order.workflowStages || []).map((s) => s.key);

const activeStage = dynamicStageKeys[0] || 'cutting';

const stageKeys =
  (Array.isArray(order.stageKeys) && order.stageKeys.length
    ? order.stageKeys
    : Array.isArray(order.workflowStages)
      ? order.workflowStages.map((s) => s.key).filter(Boolean)
      : []) || [];

const workflowStages = stageKeys.map((key, index) => {
  const label =
    String(key).charAt(0).toUpperCase() + String(key).slice(1).replace(/_/g, " ");
  return { key, label, order: index + 1 };
});

const work = await Work.create({
  order: orderId,
  garment: garment._id,

  estimatedDelivery:
    garment.estimatedDelivery ||
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

  createdBy: req.user._id,
  measurementPdf,

  status: 'pending',
  cuttingMaster: null,

  workId: generateWorkId(garment.name),

  // ✅ CUSTOM WORKFLOW SAVE
  workflowStages,
  stageKeys,

  // ✅ FIRST STAGE
  currentStage:
    stageKeys?.length > 0
      ? stageKeys[0]
      : "cutting",
});
// ✅ VERY IMPORTANT
works.push(work);
    }
    // ✅ Notify ALL cutting masters about available works
    const cuttingMasters = await CuttingMaster.find({ isActive: true });
    
    for (const master of cuttingMasters) {
      try {
        await createNotification({
          type: 'work-available',
          recipient: master._id,
          recipientModel: 'CuttingMaster',
          title: '🔔 New Work Available in Pool',
          message: `${works.length} new work(s) are waiting for your acceptance. Click to view and accept.`,
          reference: {
            orderId: order._id,
            workCount: works.length,
            workIds: works.map(w => w._id)
          },
          priority: 'high'
        });
      } catch (notifError) {
        console.error(`❌ Failed to notify cutting master ${master._id}:`, notifError.message);
      }
    }

    // ✅ FIXED: Notify Admin and Store Keeper about new works (BROADCAST)
    try {
      await createNotification({
        type: 'order-created',
        // ❌ NO recipient - this will trigger broadcast to Admin + Store Keeper
        title: '📦 New Order & Works Created',
        message: `New order ${order.orderId} created with ${works.length} works.`,
        reference: { 
          orderId: order._id,
          workCount: works.length 
        },
        priority: 'normal'
      });
      console.log('✅ Broadcast notification sent to Admin and Store Keepers');
    } catch (notifError) {
      console.log('⚠️ Broadcast notification failed:', notifError.message);
    }

    res.status(201).json({
      success: true,
      message: `Created ${works.length} works (open for acceptance)`,
      data: works
    });

  } catch (error) {
    console.error('Create works error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create works',
      error: error.message
    });
  }
};

// @desc    Get all works (with filters)
// @route   GET /api/works
// @access  Private
// export const getWorks = async (req, res) => {
//   try {
//     const {
//       status,
//       cuttingMaster,
//       tailor,
//       orderId,
//       startDate,
//       endDate,
//       page = 1,
//       limit = 20
//     } = req.query;

//     const filter = { isActive: true };

//     if (status) filter.status = status;
//     if (cuttingMaster) filter.cuttingMaster = cuttingMaster;
//     if (tailor) filter.tailor = tailor;
//     if (orderId) filter.order = orderId;

//     // Date range filter
//     if (startDate || endDate) {
//       filter.workDate = {};
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         filter.workDate.$gte = start;
//       }
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         filter.workDate.$lte = end;
//       }
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const works = await Work.find(filter)
//       .populate('order', 'orderId customer deliveryDate')
//       .populate('garment', 'name garmentId measurements')
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name employeeId')
//       .populate('createdBy', 'name')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Work.countDocuments(filter);

//     res.json({
//       success: true,
//       data: {
//         works,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };
// @desc    Get all works (with filters)
// @route   GET /api/works
// @access  Private
export const getWorks = async (req, res) => {
  try {
    const {
      status,
      cuttingMaster,
      tailor,
      orderId,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const filter = { isActive: true };

    if (status) filter.status = status;
    if (cuttingMaster) filter.cuttingMaster = cuttingMaster;
    if (tailor) filter.tailor = tailor;
    if (orderId) filter.order = orderId;

    // Date range filter
    if (startDate || endDate) {
      filter.workDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.workDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.workDate.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const works = await Work.find(filter)
      .populate({
        path: 'order',
        select: 'orderId customer deliveryDate workflowStages stageKeys',
        populate: {
          path: 'customer',
          select: 'name'
        }
      })
      .populate({
        path: 'garment',
        populate: [
          {
            path: 'category',    // ✅ Populate category
            select: 'name'
          },
          {
            path: 'item',        // ✅ Populate item
            select: 'name'
          }
        ]
      })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Work.countDocuments(filter);

    // ✅ Format the response with category and item names
    const formattedWorks = works.map(work => {
      const workObj = work.toObject();
      if (workObj.garment) {
        workObj.garment.categoryName = workObj.garment.category?.name || 'N/A';
        workObj.garment.itemName = workObj.garment.item?.name || 'N/A';
      }
      return workObj;
    });

    res.json({
      success: true,
      data: {
        works: formattedWorks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get works error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch works',
      error: error.message
    });
  }
};





// @desc    Get work by ID
// @route   GET /api/works/:id
// @access  Private
// export const getWorkById = async (req, res) => {
//   try {
//     const work = await Work.findById(req.params.id)
//       .populate('order', 'orderId customer orderDate deliveryDate')
//       .populate('garment')
//       .populate('cuttingMaster', 'name')
//       .populate('tailor', 'name employeeId phone')
//       .populate('createdBy', 'name');

//     if (!work) {
//       return res.status(404).json({
//         success: false,
//         message: 'Work not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: work
//     });

//   } catch (error) {
//     console.error('Get work error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch work',
//       error: error.message
//     });
//   }
// };

// @desc    Get work by ID
// @route   GET /api/works/:id
// @access  Private
export const getWorkById = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id)
      .populate({
        path: 'order',
        select: 'orderId customer orderDate deliveryDate',
        populate: {
          path: 'customer',
          select: 'name phone email addressLine1 addressLine2 city state pincode'
        }
      })
      .populate({
        path: 'garment',
        populate: [
          {
            path: 'category',        // ✅ Populate category
            select: 'name categoryName'
          },
          {
            path: 'item',            // ✅ Populate item
            select: 'name itemName priceRange'
          },
          {
            path: 'selectedFabric'   // ✅ Populate fabric
          }
        ]
      })
      .populate('createdBy', 'name');

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    // ✅ Add helper to get category name
    const workObj = work.toObject();
    if (workObj.garment) {
      // Get category name
      if (workObj.garment.category) {
        workObj.garment.categoryName = workObj.garment.category.name || workObj.garment.category.categoryName;
      }
      // Get item name
      if (workObj.garment.item) {
        workObj.garment.itemName = workObj.garment.item.name || workObj.garment.item.itemName;
      }
    }

    res.json({
      success: true,
      data: workObj
    });

  } catch (error) {
    console.error('Get work error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch work',
      error: error.message
    });
  }
};




// ===== OPEN POOL: GET WORKS FOR CUTTING MASTER DASHBOARD =====
// @desc    Get works for cutting master (shows both accepted and available)
// @route   GET /api/works/my-works
// @access  Private (Cutting Master only)
// export const getWorksByCuttingMaster = async (req, res) => {
//   try {
//     const userId = req.user?._id || req.user?.id;

//     console.log('📋 Getting works for cutting master:', {
//       userId,
//       role: req.user?.role
//     });

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: 'User ID not found'
//       });
//     }

//     // ✅ OPEN POOL FILTER: Show both:
//     // 1. Works already accepted by this master
//     // 2. All pending works (open for acceptance by anyone)
//     const filter = {
//       $or: [
//         { cuttingMaster: userId },                    // Already accepted by this master
//         { cuttingMaster: null, status: 'pending' }    // ⭐ Open for everyone to accept
//       ],
//       isActive: true
//     };

//     console.log('🔍 Filter:', JSON.stringify(filter));

//     const works = await Work.find(filter)
//       .populate({
//         path: 'order',
//         select: 'orderId customer deliveryDate',
//         populate: {
//           path: 'customer',
//           select: 'name phone'
//         }
//       })
//       .populate({
//         path: 'garment',
//         select: 'name garmentId measurements priceRange priority estimatedDelivery additionalInfo'
//       })
//       .populate('tailor', 'name')
//       .sort({ createdAt: -1 });

//     console.log(`✅ Found ${works.length} works`);

//     // ✅ Add flags to help frontend know status
//     const worksWithAcceptanceInfo = works.map(work => {
//       const workObj = work.toObject();
//       workObj.isAcceptedByMe = work.cuttingMaster?.toString() === userId?.toString();
//       workObj.isAvailable = !work.cuttingMaster && work.status === 'pending';
//       workObj.canAccept = !work.cuttingMaster && work.status === 'pending';
      
//       // 🔥 Log garment priority for debugging
//       console.log(`Work ${work.workId}: Garment priority = ${work.garment?.priority || 'not found'}`);
      
//       return workObj;
//     });

//     res.json({
//       success: true,
//       data: {
//         works: worksWithAcceptanceInfo,
//         total: works.length
//       }
//     });

//   } catch (error) {
//     console.error('❌ Get cutting master works error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch works',
//       error: error.message
//     });
//   }
// };
// @desc    Get works for cutting master
// @route   GET /api/works/my-works
// @access  Private (Cutting Master only)
export const getWorksByCuttingMaster = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    console.log('📋 Getting works for cutting master:', {
      userId,
      role: req.user?.role
    });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found'
      });
    }

    // ✅ OPEN POOL FILTER
    const filter = {
      $or: [
        { cuttingMaster: userId },
        { cuttingMaster: null, status: 'pending' }
      ],
      isActive: true
    };

    const works = await Work.find(filter)
      .populate({
        path: 'order',
        select: 'orderId customer deliveryDate workflowStages stageKeys',
        populate: {
          path: 'customer',
          select: 'name',
        }
      })
      .populate({
        path: 'garment',
        populate: [
          {
            path: 'category',    // ✅ Populate category
            select: 'name categoryName'
          },
          {
            path: 'item',        // ✅ Populate item
            select: 'name itemName'
          }
        ]
      })
      .sort({ createdAt: -1 });

    // ✅ Format the response
    const worksWithAcceptanceInfo = works.map(work => {
      const workObj = work.toObject();
      if (workObj.garment) {
        workObj.garment.categoryName = workObj.garment.category?.name || 
                                        workObj.garment.category?.categoryName || 
                                        'N/A';
        workObj.garment.itemName = workObj.garment.item?.name || 
                                   workObj.garment.item?.itemName || 
                                   'N/A';
      }
      workObj.isAcceptedByMe = work.cuttingMaster?.toString() === userId?.toString();
      workObj.isAvailable = !work.cuttingMaster && work.status === 'pending';
      workObj.canAccept = !work.cuttingMaster && work.status === 'pending';
      return workObj;
    });

    res.json({
      success: true,
      data: {
        works: worksWithAcceptanceInfo,
        total: works.length
      }
    });

  } catch (error) {
    console.error('❌ Get cutting master works error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch works',
      error: error.message
    });
  }
};

// ===== OPEN POOL: ACCEPT WORK (FIRST COME FIRST SERVE) =====
// @desc    Accept work (Cutting Master)
// @route   PATCH /api/works/:id/accept
// @access  Private (Cutting Master only)
export const acceptWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id)
      .populate('order')
      .populate('garment');

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    // ✅ Check if already accepted by someone else
    if (work.cuttingMaster) {
      return res.status(400).json({
        success: false,
        message: 'This work was already accepted by another cutting master'
      });
    }

    // ✅ Check if work is pending
    if (work.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This work is not available for acceptance (status: ${work.status})`
      });
    }

    // ✅ Assign work to this cutting master (FIRST COME FIRST SERVE)
    work.status = 'accepted';
    work.cuttingMaster = req.user._id;
    work.acceptedAt = new Date();
    await work.save();

    console.log(`✅ Work ${work._id} accepted by cutting master ${req.user._id}`);

    // ✅ Update order status if all works are accepted
    const pendingWorks = await Work.countDocuments({
      order: work.order._id,
      status: 'pending'
    });

    if (pendingWorks === 0) {
      await Order.findByIdAndUpdate(work.order._id, {
        status: 'confirmed'
      });
      console.log(`✅ Order ${work.order._id} all works accepted, status updated to confirmed`);
    }

    // ✅ FIXED: Notify Admin and Store Keeper about work acceptance (BROADCAST)
    try {
      await createNotification({
        type: 'work-accepted',
        // ❌ NO recipient - broadcast to Admin + Store Keeper
        title: '✅ Work Accepted',
        message: `Cutting master accepted work for ${work.garment.name}`,
        reference: {
          orderId: work.order._id,
          workId: work._id,
          garmentId: work.garment._id
        },
        priority: 'high'
      });
      console.log('✅ Broadcast notification sent to Admin and Store Keepers');
    } catch (notifError) {
      console.log('⚠️ Broadcast notification failed:', notifError.message);
    }

    // ✅ Send confirmation to the cutting master
    await createNotification({
      type: 'work-accepted',
      recipient: req.user._id,
      recipientModel: 'CuttingMaster',
      title: '✅ You Accepted a Work',
      message: `You have successfully accepted work for ${work.garment.name}`,
      reference: {
        orderId: work.order._id,
        workId: work._id
      },
      priority: 'normal'
    });

    res.json({
      success: true,
      message: 'Work accepted successfully',
      data: work
    });

  } catch (error) {
    console.error('Accept work error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept work',
      error: error.message
    });
  }
};

// ✅ FIXED: Assign tailor to work - Now updates tailor stats correctly
// @desc    Assign tailor to work (Cutting Master)
// @route   PATCH /api/works/:id/assign-tailor
// @access  Private (Cutting Master only)
export const assignTailor = async (req, res) => {
  try {
    const { tailorId } = req.body;
    const work = await Work.findById(req.params.id)
      .populate('order')
      .populate('garment');

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    // ✅ Check if cutting master exists before comparing
    if (!work.cuttingMaster) {
      // If no cutting master, assign the current user as cutting master
      work.cuttingMaster = req.user._id;
      work.status = 'accepted';
      console.log(`✅ Auto-assigned cutting master ${req.user._id} to work ${work._id}`);
    } else if (work.cuttingMaster.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign tailor for this work'
      });
    }

    // ✅ If work already has a tailor assigned, remove all their stats for this work
    if (work.tailor && work.tailor.toString() !== tailorId) {
      const previousTailorId = work.tailor;
      
      // Determine which stat to decrement based on current work status
      const decrementUpdate = { 'workStats.totalAssigned': -1 };
      
      if (work.status === 'pending' || work.status === 'accepted') {
        decrementUpdate['workStats.pending'] = -1;
      } else if (work.status === 'ready-to-deliver' || work.status === 'cancelled') {
        decrementUpdate['workStats.completed'] = -1;
      } else {
        decrementUpdate['workStats.inProgress'] = -1;
      }
      
      await Tailor.findByIdAndUpdate(previousTailorId, {
        $inc: decrementUpdate
      });
      console.log(`✅ Removed stats from previous tailor ${previousTailorId}:`, decrementUpdate);
    }

    // ✅ Update work with new tailor
    work.tailor = tailorId;
    await work.save();

    // ✅ Determine which stat to increment based on current work status
    const incrementUpdate = { 'workStats.totalAssigned': 1 };
    
    if (work.status === 'pending' || work.status === 'accepted') {
      incrementUpdate['workStats.pending'] = 1;
    } else if (work.status === 'ready-to-deliver' || work.status === 'cancelled') {
      incrementUpdate['workStats.completed'] = 1;
    } else {
      incrementUpdate['workStats.inProgress'] = 1;
    }

    // ✅ Update new tailor's workStats
    await Tailor.findByIdAndUpdate(tailorId, {
      $inc: incrementUpdate
    });
    console.log(`✅ Added stats to new tailor ${tailorId}:`, incrementUpdate);

    // ✅ Notify the assigned tailor
    try {
      await createNotification({
        type: 'work-assigned',
        recipient: tailorId,
        recipientModel: 'Tailor',
        title: '📋 New Work Assigned',
        message: `You have been assigned to work on ${work.garment.name}`,
        reference: {
          orderId: work.order._id,
          workId: work._id,
          garmentId: work.garment._id
        },
        priority: 'high'
      });
      console.log(`✅ Notification sent to tailor ${tailorId}`);
    } catch (notifError) {
      console.error('❌ Failed to send notification:', notifError);
      // Don't fail the whole request if notification fails
    }

    // ✅ FIXED: Notify Admin and Store Keeper about tailor assignment (BROADCAST)
    try {
      await createNotification({
        type: 'work-assigned',
        // ❌ NO recipient - broadcast to Admin + Store Keeper
        title: '👔 Tailor Assigned',
        message: `Tailor assigned to work on ${work.garment.name}`,
        reference: {
          orderId: work.order._id,
          workId: work._id,
          garmentId: work.garment._id,
          tailorId: tailorId
        },
        priority: 'normal'
      });
      console.log('✅ Broadcast notification sent to Admin and Store Keepers');
    } catch (notifError) {
      console.log('⚠️ Broadcast notification failed:', notifError.message);
    }

    res.json({
      success: true,
      message: 'Tailor assigned successfully',
      data: work
    });

  } catch (error) {
    console.error('❌ Assign tailor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign tailor',
      error: error.message
    });
  }
};

// ✅ FIXED: Update work status - Now updates order status automatically
// @desc    Update work status (Cutting Master)
// @route   PATCH /api/works/:id/status
// @access  Private (Cutting Master only)
export const updateWorkStatus = async (req, res) => {
  console.log('\n🔄 ===== UPDATE WORK STATUS CALLED =====');
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  console.log('User:', req.user?._id || req.user?.id);
  
  try {
    const { status, notes } = req.body;
    const workId = req.params.id;

    console.log('1️⃣ Finding work with ID:', workId);
    const work = await Work.findById(workId)
      .populate('order')
      .populate('garment');

    if (!work) {
      console.log('❌ Work not found');
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    console.log('2️⃣ Work found:', {
      id: work._id,
      currentStatus: work.status,
      newStatus: status,
      cuttingMaster: work.cuttingMaster,
      tailor: work.tailor,
      hasGarment: !!work.garment,
      hasOrder: !!work.order
    });

    // Store previous status for comparison
    const previousStatus = work.status;

    // ✅ Check if cutting master exists before comparing
    console.log('3️⃣ Checking authorization...');
    if (work.cuttingMaster) {
      console.log('   Cutting master exists:', work.cuttingMaster.toString());
      console.log('   Current user:', req.user._id.toString());
      
      if (work.cuttingMaster.toString() !== req.user._id.toString()) {
        console.log('❌ Unauthorized - cutting master mismatch');
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this work'
        });
      }
      console.log('✅ Authorization passed');
    } else {
      console.log('⚠️ No cutting master assigned, auto-assigning current user');
      work.cuttingMaster = req.user._id;
    }

    // Validate status
    console.log('4️⃣ Validating status:', status);
    
    // Support custom/arbitrary stages dynamically by validating format rather than matching against a whitelist
    if (!status || typeof status !== 'string') {
      console.log('❌ Invalid status format:', status);
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    console.log('✅ Status valid');

    // Update status and set corresponding timestamp
    console.log('5️⃣ Updating work data...');
    // ✅ Dynamic timestamp support
const statusUpdates = {
  'ready-to-deliver': { readyAt: new Date() }
};

    // Update work
    work.status = status;
    
    // Add timestamp if applicable
    if (statusUpdates[status]) {
      Object.assign(work, statusUpdates[status]);
      console.log(`   Set timestamp for ${status}`);
    }
    
    // Add notes if provided
    if (notes) {
      if (status.includes('cutting')) {
        work.cuttingNotes = notes;
        console.log('   Added cutting notes');
      } else {
        work.tailorNotes = notes;
        console.log('   Added tailor notes');
      }
    }

    console.log('6️⃣ Saving work...');
    await work.save();
    console.log('✅ Work saved successfully');

    // ✅ FIXED: UPDATE TAILOR STATS BASED ON STATUS CHANGE
    if (work.tailor) {
      console.log('7️⃣ Updating tailor stats...');
      
      // Dynamic status category extraction to support any dynamic workflow stage tag
      const getCategoryFromStatus = (s) => {
        if (s === 'pending' || s === 'accepted') return 'pending';
        if (s === 'ready-to-deliver' || s === 'cancelled') return 'completed';
        return 'inProgress';
      };

      const previousCategory = getCategoryFromStatus(previousStatus);
      const newCategory = getCategoryFromStatus(status);

      console.log('   Previous status:', previousStatus, '-> Category:', previousCategory);
      console.log('   New status:', status, '-> Category:', newCategory);

      const tailorUpdate = {};

      // Only update if the category actually changed
      if (previousCategory !== newCategory) {
        // Decrement previous category
        if (previousCategory) {
          tailorUpdate[`workStats.${previousCategory}`] = -1;
          console.log(`   Decrement ${previousCategory} by 1`);
        }
        
        // Increment new category
        if (newCategory) {
          tailorUpdate[`workStats.${newCategory}`] = 1;
          console.log(`   Increment ${newCategory} by 1`);
        }
      } else {
        console.log('   Same category, no stats update needed');
      }

      // Apply updates if there are any
      if (Object.keys(tailorUpdate).length > 0) {
        await Tailor.findByIdAndUpdate(work.tailor, {
          $inc: tailorUpdate
        });
        console.log('✅ Updated tailor stats:', tailorUpdate);
      } else {
        console.log('⚠️ No tailor stats to update');
      }
    }

    // ✅ FIXED: Send notification to Admin and Store Keeper (BROADCAST)
    try {
      await createNotification({
        type: 'work-status-update',
        // ❌ NO recipient - broadcast to Admin + Store Keeper
        title: '🔄 Work Status Updated',
        message: `${work.garment?.name || 'Garment'} is now ${status.replace(/-/g, ' ')}`,
        reference: {
          orderId: work.order?._id,
          workId: work._id,
          garmentId: work.garment?._id
        },
        priority: 'normal'
      });
      console.log('✅ Broadcast notification sent to Admin and Store Keepers');
    } catch (notifError) {
      console.log('⚠️ Broadcast notification failed:', notifError.message);
    }

    // ✅ Send notification to assigned tailor if status is relevant
    if (work.tailor) {
      try {
        await createNotification({
          type: 'work-status-update',
          recipient: work.tailor,
          recipientModel: 'Tailor',
          title: '🔄 Your Work Status Updated',
          message: `Your work on ${work.garment?.name || 'Garment'} is now ${status.replace(/-/g, ' ')}`,
          reference: {
            orderId: work.order?._id,
            workId: work._id,
            garmentId: work.garment?._id
          },
          priority: 'normal'
        });
        console.log('✅ Notification sent to tailor');
      } catch (notifError) {
        console.log('⚠️ Tailor notification failed:', notifError.message);
      }
    }

    // ✅ AUTO-UPDATE ORDER STATUS BASED ON ALL WORKS
    console.log('9️⃣ Checking order status for auto-update...');
    if (work.order) {
      try {
        // Get all works for this order
        const orderWorks = await Work.find({ 
          order: work.order._id,
          isActive: true 
        });
        
        console.log(`📊 Found ${orderWorks.length} works for order ${work.order._id}`);
        
        // Check if ALL works are ready
        const allWorksReady = orderWorks.every(w => w.status === 'ready-to-deliver');
        
        // Check if ANY work is in progress using completely generic checks
        const anyWorkInProgress = orderWorks.some(w => 
          !['pending', 'accepted', 'ready-to-deliver', 'cancelled'].includes(w.status)
        );
        
        // Determine new order status
        let newOrderStatus = work.order.status;
        let statusChanged = false;
        
        if (allWorksReady) {
          newOrderStatus = 'ready-to-deliver';
          console.log('✅ ALL works ready! Order status should be: ready-to-deliver');
          statusChanged = true;
          
          // ✅ Send WhatsApp notification for ready order
          try {
            // Dynamic import to avoid circular dependency
            import('./whatsapp.controller.js').then(({ sendReadyToDeliver }) => {
              sendReadyToDeliver(work.order._id)
                .catch(err => console.log('⚠️ Ready WhatsApp failed:', err.message));
            }).catch(importErr => {
              console.log('⚠️ Could not import whatsapp controller:', importErr.message);
            });
          } catch (waErr) {
            console.log('⚠️ WhatsApp notification error:', waErr.message);
          }
          
        } else if (anyWorkInProgress) {
          newOrderStatus = 'in-progress';
          console.log('📊 Some works in progress -> order status should be: in-progress');
          statusChanged = true;
        } else if (orderWorks.length > 0) {
          // All works are either pending or accepted
          newOrderStatus = 'confirmed';
          console.log('📊 All works pending/accepted -> order status should be: confirmed');
          statusChanged = true;
        }
        
        // Update order status if changed
        if (statusChanged && work.order.status !== newOrderStatus) {
          const oldStatus = work.order.status;
          work.order.status = newOrderStatus;
          await work.order.save();
          console.log(`✅ Order status updated from ${oldStatus} to ${newOrderStatus}`);
          
          // ✅ FIXED: Notify Admin and Store Keeper about order status change
          try {
            await createNotification({
              type: 'order-status-update',
              // ❌ NO recipient - broadcast to Admin + Store Keeper
              title: '📦 Order Status Updated',
              message: `Order ${work.order.orderId} is now ${newOrderStatus}`,
              reference: {
                orderId: work.order._id
              },
              priority: 'normal'
            });
          } catch (notifError) {
            console.log('⚠️ Order status notification failed:', notifError.message);
          }
        } else {
          console.log(`ℹ️ Order status unchanged (current: ${work.order.status})`);
        }
        
      } catch (orderError) {
        console.error('❌ Error updating order status:', orderError.message);
        // Don't fail the main request
      }
    }

    console.log('🔟 Sending success response');
    console.log('🔄 ===== UPDATE WORK STATUS COMPLETED =====\n');
    
    res.json({
      success: true,
      message: 'Work status updated successfully',
      data: work
    });

  } catch (error) {
    console.error('\n❌ ===== UPDATE WORK STATUS ERROR =====');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.code) console.error('Error code:', error.code);
    console.error('❌ ===== ERROR END =====\n');
    
    res.status(500).json({
      success: false,
      message: 'Failed to update work status',
      error: error.message
    });
  }
};

// @desc    Delete work (Admin only)
// @route   DELETE /api/works/:id
// @access  Private (Admin only)
export const deleteWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    // Only admin can delete
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can delete works'
      });
    }

    // ✅ If work had a tailor assigned, remove all their stats
    if (work.tailor) {
      const decrementUpdate = { 'workStats.totalAssigned': -1 };
      
      if (work.status === 'pending' || work.status === 'accepted') {
        decrementUpdate['workStats.pending'] = -1;
      } else if (work.status === 'ready-to-deliver' || work.status === 'cancelled') {
        decrementUpdate['workStats.completed'] = -1;
      } else {
        decrementUpdate['workStats.inProgress'] = -1;
      }
      
      await Tailor.findByIdAndUpdate(work.tailor, {
        $inc: decrementUpdate
      });
      console.log(`✅ Removed stats from tailor ${work.tailor}:`, decrementUpdate);
    }

    // ✅ FIXED: Notify Admin and Store Keeper about work deletion
    try {
      await createNotification({
        type: 'work-deleted',
        // ❌ NO recipient - broadcast to Admin + Store Keeper
        title: '🗑️ Work Deleted',
        message: `Work ${work.workId} has been deleted`,
        reference: {
          workId: work._id,
          orderId: work.order
        },
        priority: 'high'
      });
    } catch (notifError) {
      console.log('⚠️ Deletion notification failed:', notifError.message);
    }

    await work.deleteOne();

    res.json({
      success: true,
      message: 'Work deleted successfully'
    });

  } catch (error) {
    console.error('Delete work error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete work',
      error: error.message
    });
  }
};

// @desc    Get work statistics
// @route   GET /api/works/stats
// @access  Private (Admin, Store Keeper)
export const getWorkStats = async (req, res) => {
  try {
    console.log('📊 Fetching work statistics...');
    
    // Aggregate work statistics by status
    const allWorks = await Work.find({ isActive: true });

const stats = {
  totalWorks: allWorks.length,
  pendingWorks: allWorks.filter(w =>
    ['pending', 'accepted'].includes(w.status)
  ).length,

  inProgressWorks: allWorks.filter(w =>
    !['pending', 'accepted', 'ready-to-deliver', 'cancelled'].includes(w.status)
  ).length,

  completedWorks: allWorks.filter(w =>
    w.status === 'ready-to-deliver'
  ).length,

  cancelledWorks: allWorks.filter(w =>
    w.status === 'cancelled'
  ).length
};

    // Get today's works
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayWorks = await Work.countDocuments({
      createdAt: { $gte: today }
    });

    // Get overdue works (estimated delivery passed and not ready)
    const overdueWorks = await Work.countDocuments({
      estimatedDelivery: { $lt: new Date() },
      status: { $nin: ['ready-to-deliver', 'cancelled'] },
    });

    const result = stats;

    res.json({
      success: true,
      data: {
        ...result,
        todayWorks,
        overdueWorks
      }
    });

  } catch (error) {
    console.error('❌ Get work stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch work statistics',
      error: error.message 
    });
  }
};

// @desc    Get works by tailor
// @route   GET /api/works/tailor-works
// @access  Private (Tailor only)
export const getWorksByTailor = async (req, res) => {
  try {
    const tailorId = req.user?._id || req.user?.id;
    
    if (!tailorId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found'
      });
    }

    const { status, page = 1, limit = 20 } = req.query;

    const filter = { 
      tailor: tailorId,
      isActive: true 
    };
    
    if (status && status !== 'all' && status !== '') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const works = await Work.find(filter)
      .populate({
        path: 'order',
        select: 'orderId customer',
        populate: {
          path: 'customer',
          select: 'name'
        }
      })
      .populate({
        path: 'garment',
        select: 'name garmentId measurements'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Work.countDocuments(filter);

    res.json({
      success: true,
      data: {
        works,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get tailor works error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch works',
      error: error.message
    });
  }
};

// @desc    Assign cutting master to work (Admin/Store Keeper)
// @route   PATCH /api/works/:id/assign-cutting-master
// @access  Private (Admin, Store Keeper)
export const assignCuttingMaster = async (req, res) => {
  console.log('\n✂️ ===== ASSIGN CUTTING MASTER CALLED =====');
  console.log('Work ID:', req.params.id);
  console.log('Request body:', req.body);
  
  try {
    const { cuttingMasterId } = req.body;
    const workId = req.params.id;

    if (!cuttingMasterId) {
      return res.status(400).json({
        success: false,
        message: 'cuttingMasterId is required'
      });
    }

    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    // If work is pending, assign directly
    work.cuttingMaster = cuttingMasterId;
    if (work.status === 'pending') {
      work.status = 'accepted';
      work.acceptedAt = new Date();
    }
    await work.save();

    console.log(`✅ Cutting master ${cuttingMasterId} assigned to work ${workId}`);

    // ✅ Notify the assigned master
    await createNotification({
      type: 'work-assigned',
      recipient: cuttingMasterId,
      recipientModel: 'CuttingMaster',
      title: '📋 Work Assigned to You',
      message: `Work ${work.workId} has been assigned to you`,
      reference: { workId: work._id },
      priority: 'high'
    });

    res.json({ 
      success: true, 
      message: 'Cutting master assigned', 
      data: work 
    });
  } catch (error) {
    console.error('❌ Assign cutting master error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ===== PERMANENT FIX: RECALCULATE AND UPDATE TAILOR STATS =====
// @desc    Recalculate and update stats for a specific tailor
// @route   POST /api/works/recalculate-tailor-stats/:tailorId
// @access  Private (Admin, Store Keeper)
export const recalculateTailorStats = async (req, res) => {
  try {
    const { tailorId } = req.params;
    
    console.log('🔄 Recalculating stats for tailor:', tailorId);
    
    // ✅ Derive stats from Work.assignments SSOT (no DB writes to Tailor)
    const works = await Work.find({ 
      "assignments.workerId": tailorId,
      isActive: true 
    })
      .select('assignments workId status')
      .lean();

    // Flatten all assignments for this tailor
    const myAssignments = works.reduce((acc, w) => {
      const mine = (w.assignments || []).filter(a => a.workerId?.toString() === tailorId);
      return [...acc, ...mine];
    }, []);

    const workStats = {
      totalAssigned: myAssignments.length,
      completed: myAssignments.filter(a => a.status === 'completed').length,
      pending: myAssignments.filter(a => a.status === 'pending').length,
      inProgress: myAssignments.filter(a => a.status === 'active').length
    };

    console.log('📊 Dynamically calculated stats (no DB write):', workStats);

    // Get tailor name for response
    const tailor = await Tailor.findById(tailorId).select('name tailorId').lean();
    if (!tailor) {
      return res.status(404).json({
        success: false,
        message: 'Tailor not found'
      });
    }

    res.json({
      success: true,
      message: 'Stats computed dynamically from Work assignments (no DB update)',
      data: {
        tailorId: tailor._id,
        name: tailor.name,
        workStats,
        worksBreakdown: works.map(w => ({
          workId: w.workId,
          status: w.status
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error recalculating stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recalculate tailor stats',
      error: error.message
    });
  }
};

// @desc    Recalculate and update stats for ALL tailors
// @route   POST /api/works/recalculate-all-tailor-stats
// @access  Private (Admin only)
export const recalculateAllTailorStats = async (req, res) => {
  try {
    const tailors = await Tailor.find({ isActive: true }).select('name tailorId').lean();
    let results = [];

    // ✅ Derive all stats from Work.assignments SSOT (no DB writes)
    const allWorks = await Work.find({ 
      isActive: true,
      "assignments.workerId": { $ne: null }
    })
      .select('assignments')
      .lean();

    // Build per-tailor stats from Work.assignments
    const statsMap = {};
    allWorks.forEach(work => {
      (work.assignments || []).forEach(asgn => {
        if (!asgn.workerId) return;
        const tId = asgn.workerId.toString();
        if (!statsMap[tId]) {
          statsMap[tId] = { totalAssigned: 0, completed: 0, pending: 0, inProgress: 0 };
        }
        statsMap[tId].totalAssigned++;
        if (asgn.status === 'completed') {
          statsMap[tId].completed++;
        } else if (asgn.status === 'active') {
          statsMap[tId].inProgress++;
        } else if (asgn.status === 'pending') {
          statsMap[tId].pending++;
        } else {
          statsMap[tId].pending++;
        }
      });
    });

    for (const tailor of tailors) {
      const workStats = statsMap[tailor._id.toString()] || { totalAssigned: 0, completed: 0, pending: 0, inProgress: 0 };
      results.push({
        name: tailor.name,
        tailorId: tailor.tailorId,
        dynamicStats: workStats
      });
    }

    res.json({
      success: true,
      message: `Computed dynamic stats for ${results.length} tailors (no DB writes)`,
      data: {
        computed: results.length,
        details: results
      }
    });

  } catch (error) {
    console.error('❌ Error recalculating all stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recalculate all tailor stats',
      error: error.message
    });
  }
};

// ===== HELPER FUNCTIONS =====

// Helper function to generate measurement PDF (NOT exported)
const generateMeasurementPdf = async (garment) => {
  // TODO: Implement PDF generation
  // For now, return a placeholder URL
  return `https://storage.example.com/measurements/${garment.garmentId}.pdf`;
};

// ============================================
// ✅ DASHBOARD: GET WORK STATS WITH DATE FILTERS
// ============================================
// @desc    Get work statistics for dashboard (with date filters)
// @route   GET /api/works/stats/dashboard
// @access  Private (Admin, Store Keeper)
export const getDashboardWorkStats = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    console.log('📊 Getting work stats for dashboard with:', { period, startDate, endDate });
    
    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'today') {
      const today = new Date(now.setHours(0, 0, 0, 0));
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      dateFilter = {
        createdAt: {
          $gte: today,
          $lt: tomorrow
        }
      };
    } else if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      dateFilter = {
        createdAt: {
          $gte: startOfWeek,
          $lt: endOfWeek
        }
      };
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      dateFilter = {
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      };
    } else if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate + 'T23:59:59.999Z')
        }
      };
    }
    
    console.log('📅 Work date filter:', dateFilter);
    
    // Aggregate work statistics by status
    const works = await Work.find(dateFilter);

const stats = {
  total: works.length,

  pending: works.filter(w =>
    ['pending', 'accepted'].includes(w.status)
  ).length,

  readyToDeliver: works.filter(w =>
    w.status === 'ready-to-deliver'
  ).length,

  cancelled: works.filter(w =>
    w.status === 'cancelled'
  ).length,

  inProgress: works.filter(w =>
    !['pending', 'accepted', 'ready-to-deliver', 'cancelled']
      .includes(w.status)
  ).length
};
    // Get today's works (separate from filter)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayWorks = await Work.countDocuments({
      createdAt: { $gte: today }
    });

    // Get overdue works (estimated delivery passed and not ready)
    const overdueWorks = await Work.countDocuments({
      estimatedDelivery: { $lt: new Date() },
      status: { $nin: ['ready-to-deliver', 'cancelled'] },
      ...dateFilter // Apply date filter to estimated delivery
    });

    const result = stats;

    // Combine similar statuses for easier frontend use dynamically to prevent dropping custom stages
    const workStats = {
      total: result.total,
      pending: result.pending, // Pending includes accepted
      inProgress: result.inProgress,
      completed: result.readyToDeliver,
      cancelled: result.cancelled,
      todayWorks,
      overdueWorks,
      // Detailed breakdown (optional)
      details: {
  pending: result.pending,
  inProgress: result.inProgress,
  readyToDeliver: result.readyToDeliver,
  cancelled: result.cancelled
},
      filter: {
        period,
        startDate: dateFilter.createdAt?.$gte,
        endDate: dateFilter.createdAt?.$lte
      }
    };

    console.log('✅ Work stats for dashboard:', workStats);

    res.json({
      success: true,
      data: workStats
    });

  } catch (error) {
    console.error('❌ Get dashboard work stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch work statistics',
      error: error.message 
    });
  }
};

// ============================================
// ✅ DASHBOARD: GET RECENT WORKS WITH PRIORITY
// ============================================
// @desc    Get recent works for dashboard
// @route   GET /api/works/recent
// @access  Private (Admin, Store Keeper)
export const getRecentWorks = async (req, res) => {
  try {
    const { limit = 5, period, startDate, endDate } = req.query;
    
    console.log('📋 Getting recent works with:', { limit, period, startDate, endDate });
    
    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'today') {
      const today = new Date(now.setHours(0, 0, 0, 0));
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      dateFilter = {
        createdAt: {
          $gte: today,
          $lt: tomorrow
        }
      };
    } else if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      dateFilter = {
        createdAt: {
          $gte: startOfWeek,
          $lt: endOfWeek
        }
      };
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      dateFilter = {
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      };
    } else if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate + 'T23:59:59.999Z')
        }
      };
    }
    
    const recentWorks = await Work.find(dateFilter)
      .populate({
        path: 'order',
        select: 'orderId customer deliveryDate workflowStages stageKeys',
        populate: {
          path: 'customer',
          select: 'name phone'
        }
      })
      .populate({
        path: 'garment',
        select: 'name garmentId priority'  // ✅ Added 'priority'
      })

      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Format for dashboard display with priority
    const formattedWorks = recentWorks.map(work => ({
      _id: work._id,
      workId: work.workId,
      status: work.status,
      garment: work.garment ? {
        name: work.garment.name,
        id: work.garment.garmentId,
        priority: work.garment.priority  // ✅ Added priority
      } : null,
      order: work.order ? {
        orderId: work.order.orderId,
        customer: work.order.customer
      } : null,
      cuttingMaster: work.assignments?.find(a => a.role === 'cutting_master' || a.role === 'cutting')?.workerName || null,
      tailor: work.assignments?.find(a => a.role === 'tailor' || a.role === 'stitching')?.workerName || null,
      createdAt: work.createdAt,
      estimatedDelivery: work.estimatedDelivery
    }));

    console.log(`✅ Found ${formattedWorks.length} recent works`);

    res.json({
      success: true,
      data: {
        works: formattedWorks,
        count: formattedWorks.length,
        filter: { period, startDate, endDate }
      }
    });

  } catch (error) {
    console.error('❌ Get recent works error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recent works',
      error: error.message 
    });
  }
};

// ============================================
// ✅ DASHBOARD: GET WORK STATUS BREAKDOWN
// ============================================
// @desc    Get work status breakdown for pie chart
// @route   GET /api/works/status-breakdown
// @access  Private (Admin, Store Keeper)
export const getWorkStatusBreakdown = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    // Build date filter (same as above)
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'today') {
      const today = new Date(now.setHours(0, 0, 0, 0));
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      dateFilter = {
        createdAt: {
          $gte: today,
          $lt: tomorrow
        }
      };
    } else if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      dateFilter = {
        createdAt: {
          $gte: startOfWeek,
          $lt: endOfWeek
        }
      };
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      dateFilter = {
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      };
    } else if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate + 'T23:59:59.999Z')
        }
      };
    }
    
    // Group by status
    const breakdown = await Work.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Status colors for frontend
    const statusColors = {
  'pending': '#f59e0b',
  'accepted': '#f59e0b',
  'ready-to-deliver': '#10b981',
  'cancelled': '#ef4444'
};

    // Map status to display names
    const statusNames = {
  'pending': 'Pending',
  'accepted': 'Accepted',
  'ready-to-deliver': 'Ready',
  'cancelled': 'Cancelled'
};

    // For pie chart, we want to combine similar statuses
    const pieData = [
      { name: 'Pending', value: 0, color: '#f59e0b' },
      { name: 'In Progress', value: 0, color: '#3b82f6' },
      { name: 'Ready', value: 0, color: '#10b981' },
      { name: 'Cancelled', value: 0, color: '#ef4444' }
    ];

    breakdown.forEach(item => {
      if (['pending', 'accepted'].includes(item._id)) {
        pieData[0].value += item.count; // Pending
      } else if (item._id === 'ready-to-deliver') {
        pieData[2].value += item.count; // Ready
      } else if (item._id === 'cancelled') {
        pieData[3].value += item.count; // Cancelled
      } else {
        pieData[1].value += item.count; // Dynamic Custom Steps count toward In Progress
      }
    });

    res.json({
      success: true,
      data: {
        breakdown: breakdown.map(item => ({
          status: item._id,
          name: statusNames[item._id] || item._id,
          count: item.count,
          color: statusColors[item._id] || '#94a3b8'
        })),
        pieData: pieData.filter(item => item.value > 0),
        total: breakdown.reduce((sum, item) => sum + item.count, 0)
      }
    });

  } catch (error) {
    console.error('❌ Get work status breakdown error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch work status breakdown',
      error: error.message 
    });
  }
};

// ============================================
// ✅ CALENDAR WORK DATA
// ============================================
// @desc    Get work data for calendar view
// @route   GET /api/works/calendar
// @access  Private
export const getCalendarWorkData = async (req, res) => {
  try {
    const { startDate, endDate, cuttingMasterId, tailorId } = req.query;
    
    console.log('📅 Getting calendar work data:', { startDate, endDate, cuttingMasterId, tailorId });
    
    // Build filter
    const filter = { isActive: true };
    
    // Date range filter (if provided)
    if (startDate || endDate) {
      filter.$or = [
        { createdAt: {} },
        { estimatedDelivery: {} }
      ];
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.$or[0].createdAt.$gte = start;
        filter.$or[1].estimatedDelivery.$gte = start;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.$or[0].createdAt.$lte = end;
        filter.$or[1].estimatedDelivery.$lte = end;
      }
    }
    
    // Filter by cutting master
    if (cuttingMasterId) {
      filter.cuttingMaster = cuttingMasterId;
    }
    
    // Filter by tailor
    if (tailorId) {
      filter.tailor = tailorId;
    }
    
    // Get works for calendar
    const works = await Work.find(filter)
      .populate({
        path: 'order',
        select: 'orderId customer',
        populate: {
          path: 'customer',
          select: 'name'
        }
      })
      .populate({
        path: 'garment',
        select: 'name garmentId'
      })
      .select('workId status createdAt estimatedDelivery assignments order garment');
    
    // Format for calendar (FullCalendar or similar)
    const calendarEvents = works.map(work => {
      // Determine color based on status
      let color = '#3788d8'; // default blue
      if (work.status === 'ready-to-deliver') color = '#10b981'; // green
      if (work.status === 'pending') color = '#f59e0b'; // orange
      if (work.status === 'cancelled') color = '#ef4444'; // red
      
      return {
        id: work._id,
        title: `${work.workId} - ${work.garment?.name || 'Garment'}`,
        start: work.estimatedDelivery || work.createdAt,
        allDay: true,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          workId: work.workId,
          status: work.status,
          orderId: work.order?.orderId,
          customer: work.order?.customer?.name,
          garment: work.garment?.name,
          cuttingMaster: work.assignments?.find(a => a.role === 'cutting_master' || a.role === 'cutting')?.workerName || null,
          tailor: work.assignments?.find(a => a.role === 'tailor' || a.role === 'stitching')?.workerName || null,
          createdAt: work.createdAt
        }
      };
    });
    
    res.json({
      success: true,
      data: {
        events: calendarEvents,
        total: calendarEvents.length
      }
    });
    
  } catch (error) {
    console.error('❌ Get calendar work data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar data',
      error: error.message
    });
  }
};

// ============================================
// ✅ CUTTING MASTER DASHBOARD STATS
// ============================================
// @desc    Get cutting master dashboard statistics
// @route   GET /api/works/cutting-master-stats
// @access  Private (Cutting Master only)
export const getCuttingMasterDashboardStats = async (req, res) => {
  try {
    const cuttingMasterId = req.user?._id || req.user?.id;
    
    console.log('📊 Getting cutting master dashboard stats for:', cuttingMasterId);

    if (!cuttingMasterId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found'
      });
    }

    // Get all works for this cutting master
    const works = await Work.find({
      cuttingMaster: cuttingMasterId,
      isActive: true
    });

    // Calculate statistics
    const stats = {
  totalWorks: works.length,

  pendingWorks: works.filter(w =>
    ['pending', 'accepted'].includes(w.status)
  ).length,

  completed: works.filter(w =>
    ['ready-to-deliver', 'cancelled'].includes(w.status)
  ).length,

  inProgress: works.filter(w =>
    !['pending', 'accepted', 'ready-to-deliver', 'cancelled'].includes(w.status)
  ).length
};

    // Get available works in the pool (pending and not assigned to anyone)
    const availableWorks = await Work.countDocuments({
      cuttingMaster: null,
      status: 'pending',
      isActive: true
    });

    // Get today's works
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayWorks = works.filter(w => 
      new Date(w.createdAt) >= today
    ).length;

    // Get overdue works
    const overdueWorks = works.filter(w => 
      w.estimatedDelivery && 
      new Date(w.estimatedDelivery) < new Date() && 
      w.status !== 'ready-to-deliver'
    ).length;

    res.json({
      success: true,
      data: {
        ...stats,
        availableWorks,
        todayWorks,
        overdueWorks,
        recentActivities: works.slice(0, 5).map(w => ({
          _id: w._id,
          workId: w.workId,
          status: w.status,
          updatedAt: w.updatedAt
        }))
      }
    });

  } catch (error) {
    console.error('❌ Get cutting master dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cutting master statistics',
      error: error.message
    });
  }
};

// ============================================
// ✅ TAILOR PERFORMANCE FOR CUTTING MASTER
// ============================================
// @desc    Get tailor performance metrics for cutting master dashboard
// @route   GET /api/works/tailor-performance
// @access  Private (Cutting Master, Admin)
export const getTailorPerformanceForMaster = async (req, res) => {
  try {
    const { limit = 10, search, sortBy = 'workStats.completed' } = req.query;
    
    console.log('📊 Getting tailor performance data with:', { limit, search, sortBy });

    // Build filter for tailors
    const filter = { isActive: true };
    
    // Add search if provided
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tailorId: { $regex: search, $options: 'i' } }
      ];
    }

    // Get tailors with their work stats
    const tailors = await Tailor.find(filter)
      .select('name tailorId phone specialization workStats currentLoad isAvailable')
      .sort({ [sortBy]: -1 })
      .limit(parseInt(limit));

    // Get currently assigned works for each tailor to calculate current load
    const tailorPerformance = await Promise.all(tailors.map(async (tailor) => {
      // Get works currently assigned to this tailor
      const assignedWorks = await Work.find({
        tailor: tailor._id,
        status: { $nin: ['ready-to-deliver', 'cancelled'] },
        isActive: true
      }).populate({
        path: 'garment',
        select: 'name priority'
      });

      // Calculate efficiency score (completed vs total assigned)
      const efficiency = tailor.workStats.totalAssigned > 0 
        ? Math.round((tailor.workStats.completed / tailor.workStats.totalAssigned) * 100) 
        : 0;

      // Determine availability status
      let availability = 'available';
      if (tailor.currentLoad >= 5) {
        availability = 'busy';
      } else if (tailor.currentLoad >= 3) {
        availability = 'moderate';
      }

      return {
        _id: tailor._id,
        name: tailor.name,
        tailorId: tailor.tailorId,
        phone: tailor.phone,
        specialization: tailor.specialization || 'General',
        stats: {
          totalAssigned: tailor.workStats.totalAssigned || 0,
          completed: tailor.workStats.completed || 0,
          pending: tailor.workStats.pending || 0,
          inProgress: tailor.workStats.inProgress || 0,
          efficiency: `${efficiency}%`
        },
        currentLoad: {
          count: assignedWorks.length,
          status: availability,
          maxLoad: 5 // Configurable max load
        },
        isAvailable: tailor.isAvailable,
        currentWorks: assignedWorks.slice(0, 3).map(w => ({
          workId: w.workId,
          garment: w.garment?.name,
          priority: w.garment?.priority || 'normal',
          status: w.status
        }))
      };
    }));

    // Get summary statistics
    const summary = {
      totalTailors: tailors.length,
      availableTailors: tailorPerformance.filter(t => t.isAvailable && t.currentLoad.count < 5).length,
      busyTailors: tailorPerformance.filter(t => !t.isAvailable || t.currentLoad.count >= 5).length,
      totalActiveWorks: tailorPerformance.reduce((sum, t) => sum + t.currentLoad.count, 0),
      averageEfficiency: Math.round(
        tailorPerformance.reduce((sum, t) => {
          const eff = parseInt(t.stats.efficiency) || 0;
          return sum + eff;
        }, 0) / (tailorPerformance.length || 1)
      )
    };

    res.json({
      success: true,
      data: {
        tailors: tailorPerformance,
        summary,
        filters: {
          search,
          sortBy,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get tailor performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tailor performance data',
      error: error.message
    });
  }
};

// ============================================
// ✅ TODAY'S SUMMARY FOR MASTER
// ============================================
// @desc    Get today's summary for cutting master dashboard
// @route   GET /api/works/today-summary
// @access  Private (Cutting Master only)
export const getTodaySummaryForMaster = async (req, res) => {
  try {
    const cuttingMasterId = req.user?._id || req.user?.id;
    
    console.log('📅 Getting today\'s summary for master:', cuttingMasterId);

    if (!cuttingMasterId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found'
      });
    }

    // Set date range for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get works created today for this master
    const todayWorks = await Work.find({
      cuttingMaster: cuttingMasterId,
      createdAt: {
        $gte: today,
        $lt: tomorrow
      },
      isActive: true
    }).populate({
      path: 'garment',
      select: 'name'
    });

    // Get works due today
    const dueToday = await Work.find({
      cuttingMaster: cuttingMasterId,
      estimatedDelivery: {
        $gte: today,
        $lt: tomorrow
      },
      status: { $nin: ['ready-to-deliver', 'cancelled'] },
      isActive: true
    }).populate({
      path: 'garment',
      select: 'name'
    });

    // Get recent status updates today
    const recentUpdates = await Work.find({
      cuttingMaster: cuttingMasterId,
      updatedAt: {
        $gte: today,
        $lt: tomorrow
      },
      isActive: true
    })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate({
      path: 'garment',
      select: 'name'
    });

    // Get priority breakdown
    const priorityBreakdown = await Work.aggregate([
      {
        $match: {
          cuttingMaster: cuttingMasterId,
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'garments',
          localField: 'garment',
          foreignField: '_id',
          as: 'garmentInfo'
        }
      },
      {
        $unwind: {
          path: '$garmentInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$garmentInfo.priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format priority data
    const priorities = {
      high: 0,
      medium: 0,
      low: 0,
      normal: 0
    };
    
    priorityBreakdown.forEach(item => {
      const priority = item._id || 'normal';
      priorities[priority] = item.count;
    });

    // Calculate completion rate for today
    const completedToday = await Work.countDocuments({
      cuttingMaster: cuttingMasterId,
      status: 'ready-to-deliver',
      updatedAt: {
        $gte: today,
        $lt: tomorrow
      },
      isActive: true
    });

    const totalActive = await Work.countDocuments({
      cuttingMaster: cuttingMasterId,
      status: { $nin: ['ready-to-deliver', 'cancelled'] },
      isActive: true
    });

    res.json({
      success: true,
      data: {
        date: today,
        summary: {
          newWorks: todayWorks.length,
          dueToday: dueToday.length,
          completedToday,
          totalActive,
          completionRate: totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0
        },
        priorities,
        recentActivity: recentUpdates.map(w => ({
          _id: w._id,
          workId: w.workId,
          garment: w.garment?.name,
          status: w.status,
          updatedAt: w.updatedAt,
          timeAgo: getTimeAgo(w.updatedAt)
        })),
        upcomingDeadlines: dueToday.slice(0, 3).map(w => ({
          _id: w._id,
          workId: w.workId,
          garment: w.garment?.name,
          estimatedDelivery: w.estimatedDelivery
        }))
      }
    });

  } catch (error) {
    console.error('❌ Get today\'s summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s summary',
      error: error.message
    });
  }
};