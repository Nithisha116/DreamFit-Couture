import mongoose from 'mongoose';
import Work from '../models/Work.js';
import Order from '../models/Order.js';
import Worker from '../models/Worker.js';
import Tailor from '../models/Tailor.js';
import CuttingMaster from '../models/CuttingMaster.js';
import StoreKeeper from '../models/StoreKeeper.js';
import User from '../models/User.js';



// Pipeline stage definitions

const PIPELINE_STAGE_DEFS = {

  cutting:    { id: 'cutting',    label: 'Cutting',        department: 'cutting'    },

  stitching:  { id: 'stitching',  label: 'Stitching',      department: 'tailor'     },

  embroidery: { id: 'embroidery', label: 'Embroidery',     department: 'embroidery' },

  aari:       { id: 'aari',       label: 'Aari Work',      department: 'aari'       },

  ironing:    { id: 'ironing',    label: 'Ironing',        department: 'ironing'    },

  finishing:  { id: 'finishing',  label: 'Finishing & QC', department: 'finishing'  },

  packing:    { id: 'packing',    label: 'Packing',        department: 'packing'    },

  packed:     { id: 'packed',     label: 'Packed / Ready',  department: 'packing'    },

};



function normalizeStageKey(key) {
  const k = String(key || '').trim().toLowerCase().replace(/\s+/g, '_');
  if (k === 'packing' || k === 'pack' || k === 'ready') return 'packed';
  if (k === 'aari_work' || k === 'aariwork') return 'aari';
  if (k === 'sewing') return 'stitching';
  return k;
}

function buildWorkflowStageList(keys, work) {
  return keys.map((rawKey, index) => {
    const key = normalizeStageKey(rawKey);
    const def = PIPELINE_STAGE_DEFS[key] || {};
    const isActive =
      work?.currentStage === key ||
      work?.currentStage === rawKey ||
      (index === 0 && !work?.currentStage);
    return {
      key,
      label: def.label || String(key).charAt(0).toUpperCase() + String(key).slice(1),
      order: index + 1,
      status: isActive ? 'active' : 'pending',
    };
  });
}

// Helper: Get workflow stages array of objects (order.stageKeys / order.workflowStages SSOT)

function getWorkflowStages(work) {
  const order = work?.order;

  // 1. Work-level array of stage defs
  if (
    Array.isArray(work.workflowStages) &&
    work.workflowStages.length > 0 &&
    typeof work.workflowStages[0] === 'object' &&
    work.workflowStages[0]?.key
  ) {
    return [...work.workflowStages].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // 2. Order stageKeys (explicit order from order creation)
  if (Array.isArray(order?.stageKeys) && order.stageKeys.length > 0) {
    return buildWorkflowStageList(order.stageKeys, work);
  }

  // 3. Work stageKeys
  if (Array.isArray(work.stageKeys) && work.stageKeys.length > 0) {
    return buildWorkflowStageList(work.stageKeys, work);
  }

  // 4. Order workflowStages progress map (Mongo object keyed by stage)
  if (
    order?.workflowStages &&
    typeof order.workflowStages === 'object' &&
    !Array.isArray(order.workflowStages)
  ) {
    const keys =
      Array.isArray(order.stageKeys) && order.stageKeys.length
        ? order.stageKeys
        : Object.keys(order.workflowStages);
    return buildWorkflowStageList(keys, work);
  }

  // 5. Order workflowStages array
  if (Array.isArray(order?.workflowStages) && order.workflowStages.length > 0) {
    return [...order.workflowStages].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // LAST fallback only
  return buildWorkflowStageList(['cutting', 'stitching', 'ironing', 'packed'], work);
}




// Helper: Determine stages based on garment/work

function resolveStageKeysForJob(work) {

  const stages = getWorkflowStages(work);

  return stages.map(s => s.key);

}



// Helper: Get active stage key

function getActiveStageKey(stages) {

  const keys = Object.keys(stages);

  const active = keys.find(k => stages[k].state === 'active');

  if (active) return active;

  const pending = keys.find(k => stages[k].state === 'pending');

  return pending || keys[keys.length - 1];

}



// @desc    Get all synthesized workflow jobs

// @route   GET /api/workflow/jobs

// @access  Private

export const getWorkflowJobs = async (req, res) => {

  try {

    const works = await Work.find({ isActive: true })

      .populate('order')

      .populate({

        path: 'garment',

        populate: [

          { path: 'category', select: 'name categoryName' },

          { path: 'item',     select: 'name itemName'     },

          { path: 'measurementTemplate', select: 'name'   },

        ],

      })

      .sort({ createdAt: -1 });



    const jobs = works.map(work => {

      const garment   = work.garment;

      const workflowStages = getWorkflowStages(work);

      const stageKeys = workflowStages.map(s => s.key);



      const stages = {};

      workflowStages.forEach(s => {

        stages[s.key] = {

          state: s.status || 'pending',

          assignedTo: null,

          completedAt: null

        };

      });



      // Populate from work.assignments

      if (work.assignments && work.assignments.length > 0) {

        work.assignments.forEach(assignment => {

          if (stages[assignment.stage]) {

            stages[assignment.stage].assignedTo = {

              workerId: assignment.workerId,

              name:     assignment.workerName,

              role:     assignment.role,

            };

            stages[assignment.stage].state =

              assignment.status === 'completed' ? 'completed' : 'active';

            if (assignment.status === 'completed') {

              stages[assignment.stage].completedAt = assignment.completedAt;

            }

          }

        });

      }



      // If no active stage, promote first pending

      if (stageKeys[0] && !Object.values(stages).some(s => s.state === 'active')) {

        const firstPending =

          stageKeys.find(k => stages[k].state !== 'completed') || stageKeys[0];

        if (stages[firstPending]) {

          stages[firstPending].state = 'active';

        }

      }



      const activeKey        = getActiveStageKey(stages);

      const activeStageObj   = workflowStages.find(s => s.key === activeKey);

      const currentStageLabel = activeStageObj?.label || PIPELINE_STAGE_DEFS[activeKey]?.label || activeKey;

      const assignmentStatus = stages[activeKey]?.assignedTo ? 'assigned' : 'unassigned';

      const lifecycleStatus  = stageKeys.every(k => stages[k].state === 'completed')

        ? 'completed'

        : 'open';



      return {

        id:                  work._id,

        workflowTrackingId:  work.workId,

        workMongoId:         work._id,

        workCode:            work.workId,

        orderId:             work.order?.orderId           || '',

        customerName:        work.order?.customer?.name   || 'Customer',

        garmentName:         garment?.name                || work.garmentName || 'Garment',

        categoryName:        garment?.categoryName        || garment?.category?.name || '',

        itemName:            garment?.itemName            || garment?.item?.name     || '',

        dueDate:             work.estimatedDelivery       || work.order?.deliveryDate || null,

        workStatus:          work.status                  || 'pending',

        stageKeys,

        stages,

        currentStageKey:     activeKey,

        currentStageLabel,

        priority:            garment?.priority || work.priority || 'normal',

        assignmentStatus,

        lifecycleStatus,

        workflowStages,

        // ── Measurements ──────────────────────────────

        measurements:        garment?.measurements || [],

        measurementSource:   garment?.measurementSource || 'template',

        measurementTemplate: garment?.measurementTemplate || null,

        measurementTemplateName:

          typeof garment?.measurementTemplate === 'object'

            ? garment.measurementTemplate?.name

            : null,

        // ── Notes / Instructions ──────────────────────

        additionalInfo:      garment?.additionalInfo || '',

        cuttingNotes:        work.cuttingNotes || '',

        tailorNotes:         work.tailorNotes || '',

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

    const { id } = req.params;

    const { stage, role, workerId, workerName } = req.body;



    console.log('📋 Assign worker request:', { id, stage, role, workerId, workerName });



    const work = await Work.findById(id);

    if (!work) {

      console.error('❌ Work not found for ID:', id);

      return res.status(404).json({ success: false, message: 'Work not found' });

    }



    // Ensure arrays exist on older documents

    if (!Array.isArray(work.assignments)) work.assignments = [];

    if (!Array.isArray(work.history))     work.history     = [];



    // Validate worker across the appropriate collection

    let foundName      = workerName || 'Unknown Worker';

    let finalWorkerId  = workerId   || null;



    if (workerId) {

      let workerDoc = null;

      const normalizedRole = role ? role.toLowerCase() : '';



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



        // Fallback search across other collections

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

      } else {

        console.warn('⚠️ Worker not found in any collection, using provided data:', {

          workerId,

          workerName,

        });

      }

    }



    // Build assignment object

    const assignment = {

      stage:      stage || 'cutting',

      role:       role  || 'helper',

      workerId:   finalWorkerId,

      workerName: foundName,

      status:     'active',

      assignedAt: new Date(),

      startedAt:  new Date(),

    };



    // Replace or add

    const existingIndex = work.assignments.findIndex(a => a.stage === stage);

    if (existingIndex >= 0) {

      work.assignments[existingIndex] = assignment;

    } else {

      work.assignments.push(assignment);

    }



    // History entry

    work.history.push({

      action:    'WORKER_ASSIGNED',

      details:   `Assigned ${foundName} (${role}) to ${stage}`,

      actorId:   req.user?._id,

      actorName: req.user?.name || 'System',

    });



    await work.save();



    console.log('✅ Worker assigned successfully:', {

      workId: work.workId,

      worker: foundName,

      stage,

    });

    res.json({ success: true, message: 'Worker assigned successfully', data: work });

  } catch (error) {

    console.error('❌ Error assigning worker:', error.message);

    console.error('❌ Stack:', error.stack);

    res.status(500).json({ success: false, message: error.message || 'Server Error' });

  }

};
// @desc    Process QR scan — auto-completes the active stage
// @route   POST /api/workflow/works/:id/scan
// @access  Private
export const processQrScan = async (req, res) => {
  try {
    const { id } = req.params;

    const work = await Work.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { workId: id },
      ],
    }).populate('order').lean();

    if (!work) {
      return res.status(404).json({ success: false, message: 'Work not found' });
    }

    const updateDoc = { $set: {}, $push: {} };
    const now = new Date();

    const pipelineKeys =
  work.stageKeys && work.stageKeys.length > 0
    ? work.stageKeys
    : getWorkflowStages(work).map((s) => s.key);
    const activeKey = work.currentStage && pipelineKeys.includes(work.currentStage) 
      ? work.currentStage 
      : 'cutting';
    
    const activeIndex = pipelineKeys.indexOf(activeKey);
    const currentStageLabel = activeKey.charAt(0).toUpperCase() + activeKey.slice(1);

    // 4. Update active stage as completed
    updateDoc.$set[`workflowStages.${activeKey}.completed`] = true;
    updateDoc.$set[`workflowStages.${activeKey}.completedAt`] = now;

    // 5. Handle Assignments atomically
    const assignments = work.assignments || [];
    const activeAssignmentIndex = assignments.findIndex(a => a.stage === activeKey);
    let completedWorkerName = 'Unknown Worker';

    if (activeAssignmentIndex >= 0) {
      completedWorkerName = assignments[activeAssignmentIndex].workerName || completedWorkerName;
      updateDoc.$set[`assignments.${activeAssignmentIndex}.status`] = 'completed';
      updateDoc.$set[`assignments.${activeAssignmentIndex}.completedAt`] = now;
    } else {
      completedWorkerName = req.user?.name || 'System';
      updateDoc.$push.assignments = {
        stage: activeKey,
        role: 'system',
        workerName: completedWorkerName,
        status: 'completed',
        assignedAt: now,
        startedAt: now,
        completedAt: now,
      };
    }

    // 6. Identify the next stage dynamically
    const nextStageKey = pipelineKeys[activeIndex + 1] || null;
    const nextStageLabel = nextStageKey ? (nextStageKey.charAt(0).toUpperCase() + nextStageKey.slice(1)) : null;

    if (nextStageKey) {
      updateDoc.$set.currentStage = nextStageKey;
      updateDoc.$set.overallStatus = 'in-progress';
      updateDoc.$set.status = `${activeKey}-completed`;
      
      // Initialize next stage settings
      updateDoc.$set[`workflowStages.${nextStageKey}.completed`] = false;
    } else {
      updateDoc.$set.currentStage = 'delivered';
      updateDoc.$set.overallStatus = 'completed';
      updateDoc.$set.status = 'ready-to-deliver';
    }

    // 7. Push Scan Logs and History (Grouped safely under one $push object)
    updateDoc.$push.scanLogs = {
      scannedBy: req.user?._id,
      scannerName: req.user?.name || 'System',
      role: req.user?.role || 'SYSTEM',
      stage: activeKey,
      scannedAt: now,
      action: `COMPLETED_${activeKey.toUpperCase()}`,
    };

    updateDoc.$push.history = {
      action: 'STAGE_COMPLETED_VIA_QR',
      details: `${currentStageLabel} completed by ${completedWorkerName}`,
      actorId: req.user?._id,
      actorName: req.user?.name || 'System',
    };

    // Clean up update object to prevent Mongo errors on empty operators
    if (Object.keys(updateDoc.$set).length === 0) delete updateDoc.$set;
    if (Object.keys(updateDoc.$push).length === 0) delete updateDoc.$push;

    // 8. Execute Atomic DB Operation
    const updatedWork = await Work.findOneAndUpdate(
      { _id: work._id },
      updateDoc,
      { new: true, runValidators: true }
    );

    if (!updatedWork) {
      return res.status(500).json({ success: false, message: 'Failed to apply update to database.' });
    }

    // Sync active stage on the parent Order document too!
    if (work.order?._id) {
      const orderUpdate = {
        currentStage: updatedWork.currentStage,
      };
      orderUpdate[`workflowStages.${activeKey}`] = {
        completed: true,
        completedAt: now,
        assignedTo: completedWorkerName
      };
      if (nextStageKey) {
        orderUpdate[`workflowStages.${nextStageKey}`] = {
          completed: false
        };
      }
      await Order.findByIdAndUpdate(work.order._id, { $set: orderUpdate });
    }

    let message = `${currentStageLabel} completed successfully.`;
    if (nextStageLabel) {
      message += ` Work moved to ${nextStageLabel} Stage.`;
    } else {
      message += ` Garment is now Ready for Delivery.`;
    }

    res.json({ success: true, message, data: updatedWork, nextStage: nextStageKey });
  } catch (error) {
    console.error('❌ Error processing QR scan:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};