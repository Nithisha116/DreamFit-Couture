import mongoose from 'mongoose';
import Work from '../models/Work.js';
import Order from '../models/Order.js';
import {
  resolveOrderedStageKeys,
  normalizeStageKey,
  stageLabel,
  buildStagesFromWork
} from './workflow.controller.js';

// @desc    Get job details using QR code
// @route   GET /api/qr/:qrCode
// @access  Public
export const getJobByQrCode = async (req, res) => {
  try {
    const { qrCode } = req.params;

    const query = {
      $or: [
        { qrCode: qrCode },
        { workId: qrCode }
      ]
    };
    if (mongoose.isValidObjectId(qrCode)) {
      query.$or.push({ _id: qrCode });
    }

    const work = await Work.findOne(query)
      .populate({
        path: 'order',
        select: 'orderId customer',
        populate: { path: 'customer', select: 'name' },
      })
      .populate({
        path: 'garment',
        select: 'name garmentId categoryName itemName measurements measurementSource measurementTemplate additionalInfo referenceImages customerImages customerClothImages priority',
        populate: [
          { path: 'category', select: 'name categoryName' },
          { path: 'item', select: 'name itemName' },
          { path: 'measurementTemplate', select: 'name' },
        ],
      })
      .lean();

    if (!work) {
      return res.status(404).json({ success: false, message: 'Job not found for this QR code.' });
    }

    const garment = work.garment;
    const stageKeys = resolveOrderedStageKeys(work);
    const stages = buildStagesFromWork(work, stageKeys);

    const workflowStages = stageKeys.map((key, index) => ({
      key,
      label: stageLabel(key),
      order: index + 1,
    }));

    const activeKey =
      stageKeys.find(k => stages[k]?.state === 'active') ||
      stageKeys.find(k => stages[k]?.state === 'pending') ||
      stageKeys[stageKeys.length - 1] ||
      null;

    const lifecycleStatus = stageKeys.every(k => stages[k]?.state === 'completed')
      ? 'completed'
      : 'open';

    const currentStageLabel = activeKey ? stageLabel(activeKey) : 'In progress';
    const assignmentStatus = stages[activeKey]?.assignedTo?.name ? 'assigned' : 'unassigned';

    // Return safe data for the factory floor
    const safeData = {
      id: String(work._id),
      workflowTrackingId: work.workId,
      workCode: work.workId,
      orderId: work.order?.orderId || '',
      customerName: work.order?.customer?.name || 'Customer',
      garmentName: garment?.name || work.garmentName || 'Garment',
      categoryName: garment?.categoryName || garment?.category?.name || garment?.category?.categoryName || '',
      itemName: garment?.itemName || garment?.item?.name || garment?.item?.itemName || '',
      priority: garment?.priority || work.priority || 'normal',
      dueDate: work.estimatedDelivery || null,
      workStatus: work.status || 'pending',
      stageKeys,
      stages,
      currentStageKey: activeKey,
      currentStageLabel,
      assignmentStatus,
      lifecycleStatus,
      workflowStages,
      measurements: garment?.measurements || [],
      measurementSource: garment?.measurementSource || 'template',
      measurementTemplateName: garment?.measurementTemplate?.name || null,
      additionalInfo: garment?.additionalInfo || '',
      cuttingNotes: work.cuttingNotes || '',
      tailorNotes: work.tailorNotes || '',
      referenceImages: garment?.referenceImages || [],
      customerImages: garment?.customerImages || [],
      customerClothImages: garment?.customerClothImages || [],
    };

    res.json({ success: true, data: safeData });
  } catch (error) {
    console.error('❌ Error fetching QR job:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Process QR scan — completes the active stage, advances to next
// @route   POST /api/qr/:qrCode/scan
// @access  Public
export const processScanByQrCode = async (req, res) => {
  try {
    const { qrCode } = req.params;

    const query = {
      $or: [
        { qrCode: qrCode },
        { workId: qrCode }
      ]
    };
    
    if (mongoose.isValidObjectId(qrCode)) {
      query.$or.push({ _id: qrCode });
    }

    const work = await Work.findOne(query).populate('order').lean();

    if (!work) {
      return res.status(404).json({ success: false, message: 'Job not found for this QR code.' });
    }

    const stageKeys = resolveOrderedStageKeys(work);

    if (!stageKeys.length) {
      return res.status(400).json({ success: false, message: 'No workflow stages found for this work item' });
    }

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

    const updateDoc = { $set: {}, $push: {} };

    updateDoc.$set.currentStage = nextStageKey ? normalizeStageKey(nextStageKey) : activeKey;
    updateDoc.$set.overallStatus = nextStageKey ? 'in-progress' : 'completed';
    updateDoc.$set.status = nextStageKey ? `${activeKey}-completed` : 'ready-to-deliver';
    updateDoc.$set[`workflowStages.${activeKey}.completed`] = true;
    updateDoc.$set[`workflowStages.${activeKey}.completedAt`] = now;

    const assignments = work.assignments || [];
    const activeAssignmentIndex = assignments.findIndex(
      a => normalizeStageKey(a.stage) === activeKey
    );
    let completedWorkerName = 'QR Scanner'; // Hardcoded for unauthenticated users

    if (activeAssignmentIndex >= 0) {
      completedWorkerName = assignments[activeAssignmentIndex].workerName || completedWorkerName;
      updateDoc.$set[`assignments.${activeAssignmentIndex}.status`] = 'completed';
      updateDoc.$set[`assignments.${activeAssignmentIndex}.completedAt`] = now;
    } else {
      if (!updateDoc.$push.assignments) {
        updateDoc.$push.assignments = {
          stage: activeKey,
          role: 'qr-scanner',
          workerName: completedWorkerName,
          status: 'completed',
          assignedAt: now,
          startedAt: now,
          completedAt: now,
        };
      }
    }

    updateDoc.$push.scanLogs = {
      scannerName: completedWorkerName,
      role: 'QR_SCANNER',
      stage: activeKey,
      scannedAt: now,
      action: `COMPLETED_${activeKey.toUpperCase()}`,
    };
    updateDoc.$push.history = {
      action: 'STAGE_COMPLETED_VIA_QR',
      details: `${stageLabel(activeKey)} completed via QR scan`,
      actorName: completedWorkerName,
    };

    const updatedWork = await Work.findOneAndUpdate(
      { _id: work._id },
      updateDoc,
      { new: true, runValidators: false }
    );

    if (!updatedWork) {
      return res.status(500).json({ success: false, message: 'Database update failed' });
    }

    if (work.order?._id) {
      await Order.findByIdAndUpdate(work.order._id, {
        $set: {
          currentStage: nextStageKey ? normalizeStageKey(nextStageKey) : activeKey,
          [`workflowStages.${activeKey}.completed`]: true,
          [`workflowStages.${activeKey}.completedAt`]: now,
          [`workflowStages.${activeKey}.assignedTo`]: completedWorkerName,
        },
      });
    }

    const nextLabel = nextStageKey ? stageLabel(nextStageKey) : null;
    const message = nextLabel
      ? `${stageLabel(activeKey)} completed. ${nextLabel} is now active.`
      : `${stageLabel(activeKey)} completed. Garment is ready for delivery.`;

    res.json({
      success: true,
      message,
      data: updatedWork,
      activeKey,
      nextStage: nextStageKey,
      stageKeys,
    });
  } catch (error) {
    console.error('❌ Error processing QR scan:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
