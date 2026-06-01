import mongoose from 'mongoose';
import Work from '../models/Work.js';
import Order from '../models/Order.js';
import Worker from '../models/Worker.js';
import Tailor from '../models/Tailor.js';
import CuttingMaster from '../models/CuttingMaster.js';
import StoreKeeper from '../models/StoreKeeper.js';
import User from '../models/User.js';
import { syncOrderFromWork } from '../services/workflowSync.service.js';
import { getIO } from '../utils/socket.js';
import { createNotification } from './notification.controller.js';

// Pipeline stage definitions — labels for any known key
const PIPELINE_STAGE_DEFS = {
  cutting:    { id: 'cutting',    label: 'Cutting',        department: 'cutting'    },
  stitching:  { id: 'stitching',  label: 'Stitching',      department: 'tailor'     },
  embroidery: { id: 'embroidery', label: 'Embroidery',     department: 'embroidery' },
  aari:       { id: 'aari',       label: 'Aari Work',      department: 'aari'       },
  ironing:    { id: 'ironing',    label: 'Ironing',        department: 'ironing'    },
  finishing:  { id: 'finishing',  label: 'Finishing & QC', department: 'finishing'  },
  packing:    { id: 'packing',    label: 'Packing',        department: 'packing'    },
  packed:     { id: 'packed',     label: 'Packed / Ready', department: 'packing'    },
};

export function normalizeStageKey(key) {
  const k = String(key || '').trim().toLowerCase().replace(/\s+/g, '_');
  // ✅ IMPORTANT: do NOT collapse packing→packed here for stage-key purposes.
  // packing and packed are different stages in custom workflows.
  // Only normalize known aliases.
  if (k === 'aari_work' || k === 'aariwork') return 'aari';
  if (k === 'sewing') return 'stitching';
  return k;
}

export function stageLabel(key) {
  const def = PIPELINE_STAGE_DEFS[key];
  if (def) return def.label;
  // Custom stage — title-case the key
  return String(key).charAt(0).toUpperCase() + String(key).slice(1).replace(/_/g, ' ');
}

/**
 * Extract the ORDERED stage keys from a Work document.
 * Priority:
 *   1. work.stageKeys         ← set during work creation from order
 *   2. work.workflowStages[]  ← array of {key, label, order}
 *   3. order.stageKeys
 *   4. order.workflowStages[] ← array of {key, label, order}
 *   5. LAST RESORT fallback (should never be needed after order_controller fix)
 */
export function resolveOrderedStageKeys(work) {
  // 1. work.stageKeys — most direct
  if (Array.isArray(work.stageKeys) && work.stageKeys.length > 0) {
    return work.stageKeys.map(normalizeStageKey).filter(Boolean);
  }

  // 2. work.workflowStages as array of objects
  if (
    Array.isArray(work.workflowStages) &&
    work.workflowStages.length > 0 &&
    typeof work.workflowStages[0] === 'object' &&
    work.workflowStages[0]?.key
  ) {
    return [...work.workflowStages]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(s => normalizeStageKey(s.key))
      .filter(Boolean);
  }

  const order = work.order;

  // 3. order.stageKeys
  if (Array.isArray(order?.stageKeys) && order.stageKeys.length > 0) {
    return order.stageKeys.map(normalizeStageKey).filter(Boolean);
  }

  // 4. order.workflowStages as array of objects
  if (
    Array.isArray(order?.workflowStages) &&
    order.workflowStages.length > 0 &&
    typeof order.workflowStages[0] === 'object' &&
    order.workflowStages[0]?.key
  ) {
    return [...order.workflowStages]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(s => normalizeStageKey(s.key))
      .filter(Boolean);
  }

  // 5. Last resort — should not normally be reached
  console.warn('⚠️ [resolveOrderedStageKeys] No custom workflow found, using default fallback');
  return ['cutting', 'stitching', 'ironing', 'packed'];
}

/**
 * Build the stages map WITH CORRECT STATE from the Work document.
 *
 * ✅ KEY FIX: Stage state is derived from work.currentStage (persisted in MongoDB
 * by processQrScan), NOT re-computed from scratch. This is the ground truth.
 *
 * The rule is simple:
 *   - Stages BEFORE currentStage  → completed
 *   - currentStage itself         → active
 *   - Stages AFTER currentStage   → pending
 *
 * Assignment info comes from work.assignments[].
 */
export function buildStagesFromWork(work, stageKeys) {
  const normalizedCurrentStage = normalizeStageKey(work.currentStage);

  // Find where the current stage sits in the pipeline
  const currentIdx = stageKeys.indexOf(normalizedCurrentStage);

  const stages = {};

  stageKeys.forEach((key, idx) => {
    let state;
    if (currentIdx < 0) {
      // currentStage not found in pipeline — treat first stage as active
      state = idx === 0 ? 'active' : 'pending';
    } else if (idx < currentIdx) {
      state = 'completed';
    } else if (idx === currentIdx) {
      // If overallStatus is 'completed' the whole job is done
      state = work.overallStatus === 'completed' ? 'completed' : 'active';
    } else {
      state = 'pending';
    }

    stages[key] = {
      state,
      assignedTo: null,
      completedAt: null,
      completedBy: null,
    };
  });

  // Overlay completedAt timestamps from workflowStages progress map (if stored as object)
  // This handles legacy docs that may have {cutting:{completed,completedAt}, ...}
  const wsMap = work.workflowStages;
  if (wsMap && typeof wsMap === 'object' && !Array.isArray(wsMap)) {
    Object.entries(wsMap).forEach(([rawKey, val]) => {
      const key = normalizeStageKey(rawKey);
      if (stages[key] && val?.completedAt) {
        stages[key].completedAt = val.completedAt;
      }
    });
  }

  // Overlay assignment data
  if (Array.isArray(work.assignments)) {
    work.assignments.forEach(assignment => {
      const key = normalizeStageKey(assignment.stage);
      if (!stages[key]) return;

      stages[key].assignedTo = {
        workerId: assignment.workerId,
        name: assignment.workerName,
        role: assignment.role,
      };

      // Update completedAt from assignment if not already set
      if (assignment.status === 'completed' && assignment.completedAt) {
        stages[key].completedAt = assignment.completedAt;
      }
    });
  }

  return stages;
}


// @desc    Get all synthesized workflow jobs
// @route   GET /api/workflow/jobs
// @access  Private
export const getWorkflowJobs = async (req, res) => {
  try {
    const works = await Work.find({ isActive: true })
      .populate({
        path: 'order',
        populate: { path: 'customer', select: 'name' },
      })
      .populate({
        path: 'garment',
        populate: [
          { path: 'category',            select: 'name categoryName' },
          { path: 'item',                select: 'name itemName'     },
          { path: 'measurementTemplate', select: 'name'              },
        ],
      })
      .sort({ createdAt: -1 });

    const jobs = works.map(work => {
      const garment    = work.garment;
      const stageKeys  = resolveOrderedStageKeys(work);

      // ✅ Build workflowStages array (for UI label lookup)
      const workflowStages = stageKeys.map((key, index) => ({
        key,
        label: stageLabel(key),
        order: index + 1,
      }));

      // ✅ Build stages map — state derived from work.currentStage (MongoDB ground truth)
      const stages = buildStagesFromWork(work, stageKeys);

      // Derive active key and lifecycle
      const activeKey       = stageKeys.find(k => stages[k]?.state === 'active') ||
                              stageKeys.find(k => stages[k]?.state === 'pending') ||
                              stageKeys[stageKeys.length - 1] ||
                              null;
      const lifecycleStatus = stageKeys.every(k => stages[k]?.state === 'completed')
        ? 'completed'
        : 'open';

      const currentStageLabel = activeKey ? stageLabel(activeKey) : 'In progress';
      const assignmentStatus  = stages[activeKey]?.assignedTo?.name ? 'assigned' : 'unassigned';

      return {
        id:                  String(work._id),
        workflowTrackingId:  work.workId,
        workMongoId:         String(work._id),
        workCode:            work.workId,
        orderId:             work.order?.orderId            || '',
        orderMongoId:        String(work.order?._id || ''),
        customerName:        work.order?.customer?.name    || 'Customer',
        garmentName:         garment?.name                 || work.garmentName || 'Garment',
        garmentId:           garment?.garmentId            || '',
        categoryName:        garment?.categoryName         || garment?.category?.name || '',
        itemName:            garment?.itemName             || garment?.item?.name     || '',
        dueDate:             work.estimatedDelivery        || work.order?.deliveryDate || null,
        workStatus:          work.status                   || 'pending',
        stageKeys,
        stages,
        currentStageKey:     activeKey,
        currentStageLabel,
        priority:            garment?.priority || work.priority || 'normal',
        assignmentStatus,
        lifecycleStatus,
        workflowStages,
        measurements:        garment?.measurements         || [],
        measurementSource:   garment?.measurementSource    || 'template',
        measurementTemplate: garment?.measurementTemplate  || null,
        measurementTemplateName:
          typeof garment?.measurementTemplate === 'object'
            ? garment.measurementTemplate?.name
            : null,
        additionalInfo:      garment?.additionalInfo       || '',
        cuttingNotes:        work.cuttingNotes             || '',
        tailorNotes:         work.tailorNotes              || '',
      };
    });

    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error('Error fetching workflow jobs:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


// @desc    Assign worker to work stage
// @route   POST /api/workflow/works/:id/assign-worker
// @access  Private
export const assignWorkerToStage = async (req, res) => {
  try {
    const { id }                              = req.params;
    const { stage, role, workerId, workerName } = req.body;

    const work = await Work.findById(id);
    if (!work) {
      return res.status(404).json({ success: false, message: 'Work not found' });
    }

    if (!Array.isArray(work.assignments)) work.assignments = [];
    if (!Array.isArray(work.history))     work.history     = [];

    let foundName     = workerName || 'Unknown Worker';
    let finalWorkerId = workerId   || null;

    if (workerId) {
      let workerDoc = null;
      const normalizedRole = (role || '').toLowerCase();
      try {
        if (normalizedRole === 'tailor') {
          workerDoc = await Tailor.findById(workerId);
        } else if (normalizedRole === 'cutting' || normalizedRole === 'cutting_master') {
          workerDoc = await CuttingMaster.findById(workerId);
        } else if (normalizedRole === 'store_keeper') {
          workerDoc = await StoreKeeper.findById(workerId);
        } else if (normalizedRole === 'staff') {
          workerDoc = await User.findById(workerId);
        } else {
          workerDoc = await Worker.findById(workerId);
        }
        if (!workerDoc) {
          workerDoc =
            (await Tailor.findById(workerId))        ||
            (await CuttingMaster.findById(workerId)) ||
            (await StoreKeeper.findById(workerId))   ||
            (await User.findById(workerId))           ||
            (await Worker.findById(workerId));
        }
      } catch (lookupErr) {
        console.error('⚠️ Worker lookup error (non-fatal):', lookupErr.message);
      }
      if (workerDoc) {
        finalWorkerId = workerDoc._id;
        foundName     = workerDoc.name || workerDoc.fullName || workerName || 'Unknown Worker';
      }
    }

    const assignment = {
      stage:      stage || 'cutting',
      role:       role  || 'helper',
      workerId:   finalWorkerId,
      workerName: foundName,
      status:     'active',
      assignedAt: new Date(),
      startedAt:  new Date(),
    };

    const existingIndex = work.assignments.findIndex(a => a.stage === stage);
    if (existingIndex >= 0) {
      work.assignments[existingIndex] = assignment;
    } else {
      work.assignments.push(assignment);
    }

    work.history.push({
      action:    'WORKER_ASSIGNED',
      details:   `Assigned ${foundName} (${role}) to ${stage}`,
      actorId:   req.user?._id,
      actorName: req.user?.name || 'System',
    });

    await work.save();
    res.json({ success: true, message: 'Worker assigned successfully', data: work });
  } catch (error) {
    console.error('❌ Error assigning worker:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};


// @desc    Process QR scan — completes the active stage, advances to next
// @route   POST /api/workflow/works/:id/scan
// @access  Private
export const processQrScan = async (req, res) => {
  try {
    const { id } = req.params;

    // Load with .lean() for reading, then use findOneAndUpdate for atomic write
    const work = await Work.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(id) ? id : new mongoose.Types.ObjectId() },
        { workId: id },
      ],
    })
      .populate('order')
      .lean();

    if (!work) {
      return res.status(404).json({ success: false, message: 'Work not found' });
    }

    // ✅ Use the same resolver as getWorkflowJobs — consistent stage order
    const stageKeys = resolveOrderedStageKeys(work);

    if (!stageKeys.length) {
      return res.status(400).json({ success: false, message: 'No workflow stages found for this work item' });
    }

    // ✅ Determine active stage from work.currentStage (the persisted source of truth)
    const normalizedCurrentStage = normalizeStageKey(work.currentStage);
    const activeKey =
      normalizedCurrentStage && stageKeys.includes(normalizedCurrentStage)
        ? normalizedCurrentStage
        : stageKeys[0];

    const activeIndex = stageKeys.indexOf(activeKey);
    if (activeIndex < 0) {
      return res.status(400).json({ success: false, message: `Active stage "${activeKey}" not in pipeline` });
    }

    const now = new Date();
    const nextStageKey = stageKeys[activeIndex + 1] || null;

    // Build atomic update
    const updateDoc = { $set: {}, $push: {} };

    // ✅ Mark active stage completed in workflowStages map
    // We store workflowStages as an array of objects now (see Order.js / Work.js),
    // so we also maintain a legacy-compatible progress object under workflowProgress.
    // The canonical advancement is tracked via currentStage (String field on Work).
    updateDoc.$set.currentStage   = nextStageKey ? normalizeStageKey(nextStageKey) : activeKey;
    updateDoc.$set.overallStatus  = nextStageKey ? 'in-progress' : 'completed';
    updateDoc.$set.status         = nextStageKey
      ? `${activeKey}-completed`
      : 'ready-to-deliver';

    // ✅ Store completion timestamps so getWorkflowJobs can overlay them
    updateDoc.$set[`workflowStages.${activeKey}.completed`] = true;

updateDoc.$set[`workflowStages.${activeKey}.completedAt`] = now;

    // Handle assignment completion
    const assignments = work.assignments || [];
    const activeAssignmentIndex = assignments.findIndex(
      a => normalizeStageKey(a.stage) === activeKey
    );
    let completedWorkerName = req.user?.name || 'System';

    if (activeAssignmentIndex >= 0) {
      completedWorkerName = assignments[activeAssignmentIndex].workerName || completedWorkerName;
      updateDoc.$set[`assignments.${activeAssignmentIndex}.status`]      = 'completed';
      updateDoc.$set[`assignments.${activeAssignmentIndex}.completedAt`] = now;
    } else {
      // Auto-create a system completion record
      if (!updateDoc.$push.assignments) {
        updateDoc.$push.assignments = {
          stage:       activeKey,
          role:        'system',
          workerName:  completedWorkerName,
          status:      'completed',
          assignedAt:  now,
          startedAt:   now,
          completedAt: now,
        };
      }
    }

    // Scan log + history (use $each to push multiple items cleanly)
    updateDoc.$push.scanLogs = {
      scannedBy:   req.user?._id,
      scannerName: req.user?.name || 'System',
      role:        req.user?.role || 'SYSTEM',
      stage:       activeKey,
      scannedAt:   now,
      action:      `COMPLETED_${activeKey.toUpperCase()}`,
    };
    updateDoc.$push.history = {
      action:    'STAGE_COMPLETED_VIA_QR',
      details:   `${stageLabel(activeKey)} completed by ${completedWorkerName}`,
      actorId:   req.user?._id,
      actorName: req.user?.name || 'System',
    };

    // Execute atomic update
    const updatedWork = await Work.findOneAndUpdate(
      { _id: work._id },
      updateDoc,
      { new: true, runValidators: false },
    );

    if (!updatedWork) {
      return res.status(500).json({ success: false, message: 'Database update failed' });
    }

    // Sync Order.currentStage and status as well (for order list views)
    if (work.order?._id) {
      const isCompleted = !nextStageKey;
      const targetStage = nextStageKey ? normalizeStageKey(nextStageKey) : activeKey;
      await syncOrderFromWork(work.order._id, targetStage, activeKey, now, completedWorkerName, isCompleted);
    }

    // CREATE NOTIFICATION
    try {
      const orderIdStr = work.order?.orderId || 'Unknown Order';
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await createNotification({
        type: 'work-status-update',
        title: `${stageLabel(activeKey)} Completed`,
        message: `${completedWorkerName} completed the ${stageLabel(activeKey)} stage for Order #${orderIdStr} at ${timeStr}.`,
        reference: {
          orderId: work.order?._id,
          workId: work._id
        }
      });
    } catch (err) {
      console.error("Failed to create notification:", err.message);
    }

    // EMIT SOCKET EVENT
    try {
      const io = getIO();
      io.emit('workflow:updated', {
        workId: updatedWork._id,
        orderId: updatedWork.order?._id,
        previousStage: activeKey,
        currentStage: nextStageKey ? normalizeStageKey(nextStageKey) : 'completed',
        status: updatedWork.status,
        timestamp: now
      });
      console.log(`📡 Emitted workflow:updated for Work ${updatedWork._id}`);
    } catch (err) {
      console.error("Socket emission failed:", err.message);
    }

    const nextLabel = nextStageKey ? stageLabel(nextStageKey) : null;
    const message   = nextLabel
      ? `${stageLabel(activeKey)} completed. ${nextLabel} is now active.`
      : `${stageLabel(activeKey)} completed. Garment is ready for delivery.`;

    res.json({
      success:    true,
      message,
      data:       updatedWork,
      activeKey,
      nextStage:  nextStageKey,
      stageKeys,
    });
  } catch (error) {
    console.error('❌ Error processing QR scan:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};