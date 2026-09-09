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
import { buildOrderPipeline } from '../utils/orderPipeline.util.js';

// Canonical pipeline helpers now live in utils/workflowPipeline.util.js so the
// order-level aggregation (utils/orderPipeline.util.js) shares one definition of
// stage keys, labels and per-stage state with this per-garment pipeline.
// Imported for use below AND re-exported unchanged, because qr.controller.js
// imports them from this module.
import {
  PIPELINE_STAGE_DEFS,
  normalizeStageKey,
  stageLabel,
  resolveOrderedStageKeys,
  buildStagesFromWork,
} from '../utils/workflowPipeline.util.js';

export {
  PIPELINE_STAGE_DEFS,
  normalizeStageKey,
  stageLabel,
  resolveOrderedStageKeys,
  buildStagesFromWork,
};


// Field list + populates the job projection below reads. Shared by the list
// endpoint and the single-job read after a scan so the two shapes cannot drift.
export const WORKFLOW_JOB_SELECT =
  'workId qrCode order garment estimatedDelivery status stageKeys workflowStages currentStage overallStatus workflowProgress assignments cuttingNotes tailorNotes';

export const WORKFLOW_JOB_POPULATE = [
  {
    path: 'order',
    select: 'orderId customer deliveryDate stageKeys workflowStages',
    populate: { path: 'customer', select: 'name' },
  },
  {
    path: 'garment',
    select: 'name garmentId category categoryName item itemName measurementTemplate measurementSource measurements additionalInfo priority stageKeys workflowStages',
    populate: [
      { path: 'category',            select: 'name categoryName' },
      { path: 'item',                select: 'name itemName'     },
      { path: 'measurementTemplate', select: 'name'              },
    ],
  },
];

/**
 * Project one populated Work document into the workflow job shape the Tasks /
 * Dashboard / Job Card UIs consume. Extracted from getWorkflowJobs so a scan can
 * return the updated job directly instead of forcing the client to refetch the
 * entire job list.
 */
export function buildWorkflowJob(work) {
  const garment    = work.garment;
  const stageKeys  = resolveOrderedStageKeys(work);

  const workflowStages = stageKeys.map((key, index) => ({
    key,
    label: stageLabel(key),
    order: index + 1,
  }));

  const stages = buildStagesFromWork(work, stageKeys);

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
    qrCode:              work.qrCode || null,
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
    assignments:         work.assignments              || [],
  };
}


// @desc    Get all synthesized workflow jobs
// @route   GET /api/workflow/jobs
// @access  Private
export const getWorkflowJobs = async (req, res) => {
  try {
    // Perf/memory fix (DF-001 / Exit 134): this endpoint previously fetched every
    // field of every active Work document — including scanLogs[] and history[],
    // which grow unboundedly over a work item's life and are never read below —
    // plus entire Order and Garment documents, all as fully hydrated Mongoose
    // documents. The .select()s below list exactly the fields this function and
    // its helpers (resolveOrderedStageKeys, buildStagesFromWork) read; .lean()
    // returns plain objects instead of Mongoose documents. Neither changes what
    // is computed or returned — the API response is unchanged.
    const works = await Work.find({ isActive: true })
      .select(WORKFLOW_JOB_SELECT)
      .populate(WORKFLOW_JOB_POPULATE)
      .sort({ createdAt: -1 })
      .lean();

    const jobs = works.map(buildWorkflowJob);

    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error('Error fetching workflow jobs:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


// @desc    Order-level Delivery Pipeline for the Dashboard — one entry per
//          Order (never one per garment/Work), bucketed into 'upcoming'
//          (Order.deliveryDate within the next 3 days) or 'overdue'
//          (Order.deliveryDate already passed). Read-only; no writes.
// @route   GET /api/workflow/orders-pipeline
// @access  Private
export const getOrdersPipeline = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEnd = new Date(today);
    upcomingEnd.setDate(upcomingEnd.getDate() + 3);

    // This is a delivery-date feature, not a production-assignment filter:
    // any active, non-delivered/non-cancelled order with a deliveryDate
    // qualifies for Overdue/Upcoming purely on that date — regardless of
    // whether production has started, Work documents exist, or anyone is
    // assigned. Query Order directly so an order with zero Works still
    // appears when it qualifies.
    const candidateOrders = await Order.find({
      isActive: true,
      status: { $nin: ['delivered', 'cancelled'] },
      deliveryDate: { $ne: null },
    })
      .select('orderId customer deliveryDate status garments')
      .populate({ path: 'customer', select: 'name' })
      .lean();

    const entries = [];
    const qualifying = [];

    for (const order of candidateOrders) {
      const d = new Date(order.deliveryDate);
      if (Number.isNaN(d.getTime())) continue;
      d.setHours(0, 0, 0, 0);

      let category = null;
      let delayDays = 0;
      if (d < today) {
        category = 'overdue';
        delayDays = Math.max(1, Math.ceil((today - d) / (1000 * 60 * 60 * 24)));
      } else if (d <= upcomingEnd) {
        category = 'upcoming';
      }
      if (!category) continue; // due beyond the 3-day window and not overdue — not shown

      qualifying.push({ order, category, delayDays });
    }

    // Works for the already-qualified orders only — used purely to render
    // each order's stage stepper / assignee chips when production exists.
    // buildOrderPipeline already degrades gracefully to empty stages for an
    // order with no Works, so an order with none still appears (per the
    // requirement above), just with no production stepper yet.
    const orderIds = qualifying.map(q => q.order._id);
    const works = orderIds.length
      ? await Work.find({ order: { $in: orderIds }, isActive: true })
          .select('workId order garment estimatedDelivery stageKeys workflowStages currentStage overallStatus workflowProgress assignments')
          .populate({ path: 'garment', select: 'name stageKeys workflowStages priority' })
          .lean()
      : [];

    const worksByOrder = new Map();
    for (const work of works) {
      const key = String(work.order);
      if (!worksByOrder.has(key)) worksByOrder.set(key, []);
      worksByOrder.get(key).push(work);
    }

    for (const { order, category, delayDays } of qualifying) {
      const orderWorks = worksByOrder.get(String(order._id)) || [];

      let isHighPriority = false;
      for (const work of orderWorks) {
        const priority = work.garment?.priority || work.priority || 'normal';
        if (priority === 'high') isHighPriority = true;
      }

      // Reuse the existing order-level stage aggregator (already used by the
      // Order Details page) instead of re-deriving per-stage state here.
      const pipeline = buildOrderPipeline(order, orderWorks);

      const garmentNames = [...new Set(
        orderWorks.map(w => (typeof w.garment === 'object' ? w.garment?.name : null) || 'Garment')
      )];

      const assignments = orderWorks
        .flatMap(w => Array.isArray(w.assignments) ? w.assignments : [])
        .filter(a => a.status !== 'completed')
        .map(a => ({
          workerName: a.workerName,
          role: a.role,
          stage: a.stage,
          assignedAt: a.assignedAt,
          status: a.status,
        }));

      entries.push({
        orderMongoId: String(order._id),
        orderId: order.orderId || '—',
        customerName: order.customer?.name || 'Customer',
        garmentNames,
        garmentCount: orderWorks.length || (Array.isArray(order.garments) ? order.garments.length : 0),
        dueDate: order.deliveryDate,
        category,
        delayDays,
        isHighPriority,
        currentStageLabel: pipeline.currentStageLabel || 'No production started',
        stages: pipeline.stages
          .filter(s => s.status !== 'NOT_APPLICABLE')
          .map(s => ({ key: s.key, label: s.label, status: s.status })),
        assignments,
      });
    }

    // Same priority-then-due-date ordering the existing per-garment pipeline
    // uses (sortJobsForPipeline) — high priority first, then earliest due
    // date, which naturally puts overdue orders ahead of upcoming ones.
    entries.sort((a, b) => {
      const aPri = a.isHighPriority ? 0 : 1;
      const bPri = b.isHighPriority ? 0 : 1;
      if (aPri !== bPri) return aPri - bPri;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error fetching orders pipeline:', error);
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

    // Canonical cursor: work.currentStage (next active stage, or last when done)
    updateDoc.$set.currentStage  = nextStageKey
      ? normalizeStageKey(nextStageKey)
      : normalizeStageKey(activeKey);
    updateDoc.$set.overallStatus = nextStageKey ? 'in-progress' : 'completed';
    updateDoc.$set.status        = nextStageKey
      ? `${activeKey}-completed`
      : 'ready-to-deliver';

    // Handle assignment completion
    const assignments = work.assignments || [];
    const activeAssignmentIndex = assignments.findIndex(
      a => normalizeStageKey(a.stage) === activeKey
    );
    let completedWorkerName = req.user?.name || 'System';

    // Per-stage progress map (does not mutate workflowStages[] pipeline definition)
    updateDoc.$set[`workflowProgress.${activeKey}.completed`]   = true;
    updateDoc.$set[`workflowProgress.${activeKey}.completedAt`] = now;
    updateDoc.$set[`workflowProgress.${activeKey}.completedBy`] = completedWorkerName;

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
      // Explicit IST timezone — without this it defaults to the server
      // process's own OS timezone (UTC on most hosts), producing a message
      // time that doesn't match the IST-formatted timestamp shown elsewhere.
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
      const completedAssignment = activeAssignmentIndex >= 0 ? assignments[activeAssignmentIndex] : null;
      await createNotification({
        type: 'work-status-update',
        title: `${stageLabel(activeKey)} Completed`,
        message: `${completedWorkerName} completed the ${stageLabel(activeKey)} stage for Order #${orderIdStr} at ${timeStr}.`,
        reference: {
          orderId: work.order?._id,
          workId: work._id
        },
        stage: activeKey,
        workerId: completedAssignment?.workerId,
        workerName: completedWorkerName,
        // Exact server-side moment the stage was completed, not a
        // freshly-generated timestamp inside the notification service.
        scanTime: now
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

    // Additive: return the updated job in the same shape as one element of
    // GET /api/workflow/jobs. Without it a client that just advanced one stage
    // has to refetch the entire job list (every active Work, ~8-12s) purely to
    // learn this one job's new stage. One populated single-doc read instead.
    // Best-effort: a failure here must not fail the scan, which already committed.
    let job = null;
    try {
      const populated = await Work.findById(updatedWork._id)
        .select(WORKFLOW_JOB_SELECT)
        .populate(WORKFLOW_JOB_POPULATE)
        .lean();
      if (populated) job = buildWorkflowJob(populated);
    } catch (projectionErr) {
      console.error('Job projection after scan failed (non-fatal):', projectionErr.message);
    }

    res.json({
      success:    true,
      message,
      data:       updatedWork,
      job,
      activeKey,
      nextStage:  nextStageKey,
      stageKeys,
    });
  } catch (error) {
    console.error('❌ Error processing QR scan:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};