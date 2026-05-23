import Work from '../models/Work.js';
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
};

// Helper: Determine stages based on garment/work
function resolveStageKeysForJob(work) {
  // Default pipeline — can be extended based on garment category later
  return ['cutting', 'stitching', 'ironing', 'packing'];
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
      const stageKeys = resolveStageKeysForJob(work);

      const stages = {};
      stageKeys.forEach(k => {
        stages[k] = { state: 'pending', assignedTo: null, completedAt: null };
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
        stages[firstPending].state = 'active';
      }

      const activeKey        = getActiveStageKey(stages);
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
        currentStageLabel:   PIPELINE_STAGE_DEFS[activeKey]?.label || 'In progress',
        priority:            garment?.priority || work.priority || 'normal',
        assignmentStatus,
        lifecycleStatus,
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

    // Accept either MongoDB _id or human-readable workId
    const work = await Work.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { workId: id },
      ],
    });

    if (!work) {
      return res.status(404).json({ success: false, message: 'Work not found' });
    }

    if (!Array.isArray(work.assignments)) work.assignments = [];
    if (!Array.isArray(work.scanLogs))    work.scanLogs    = [];
    if (!Array.isArray(work.history))     work.history     = [];

    const stageKeys = resolveStageKeysForJob(work);

    // Reconstruct stage states
    const stages = {};
    stageKeys.forEach(key => {
      stages[key] = { state: 'pending' };
      const assignment = work.assignments.find(a => a.stage === key);
      if (assignment) {
        stages[key].state = assignment.status === 'completed' ? 'completed' : 'active';
      }
    });

    // Promote first pending if none is active
    if (!Object.values(stages).some(s => s.state === 'active')) {
      const firstPending = stageKeys.find(k => stages[k].state !== 'completed');
      if (firstPending) stages[firstPending].state = 'active';
    }

    const activeKey = getActiveStageKey(stages);

    if (!activeKey) {
      return res.status(400).json({ success: false, message: 'Workflow is already completed' });
    }

    // Mark active stage completed
    const activeAssignmentIndex = work.assignments.findIndex(a => a.stage === activeKey);
    let completedWorkerName = 'Unknown Worker';

    if (activeAssignmentIndex >= 0) {
      work.assignments[activeAssignmentIndex].status      = 'completed';
      work.assignments[activeAssignmentIndex].completedAt = new Date();
      completedWorkerName = work.assignments[activeAssignmentIndex].workerName;
    } else {
      work.assignments.push({
        stage:       activeKey,
        role:        'system',
        workerName:  req.user?.name || 'System',
        status:      'completed',
        assignedAt:  new Date(),
        startedAt:   new Date(),
        completedAt: new Date(),
      });
      completedWorkerName = req.user?.name || 'System';
    }

    const currentStageLabel = PIPELINE_STAGE_DEFS[activeKey]?.label || activeKey;

    // Scan log
    work.scanLogs.push({
      scannedBy:   req.user?._id,
      scannerName: req.user?.name || 'System',
      role:        req.user?.role || 'SYSTEM',
      stage:       activeKey,
      scannedAt:   new Date(),
      action:      `COMPLETED_${activeKey.toUpperCase()}`,
    });

    // History entry
    work.history.push({
      action:    'STAGE_COMPLETED_VIA_QR',
      details:   `${currentStageLabel} completed by ${completedWorkerName}`,
      actorId:   req.user?._id,
      actorName: req.user?.name || 'System',
    });

    // Advance to next stage
    const nextStageIndex = stageKeys.indexOf(activeKey) + 1;
    let nextStageKey   = null;
    let nextStageLabel = null;

    if (nextStageIndex < stageKeys.length) {
      nextStageKey   = stageKeys[nextStageIndex];
      nextStageLabel = PIPELINE_STAGE_DEFS[nextStageKey]?.label || nextStageKey;
      work.currentStage   = nextStageKey;
      work.overallStatus  = 'in-progress';

      const statusMapping = {
        cutting:   'cutting-completed',
        stitching: 'sewing-completed',
        ironing:   'ironing',
        packing:   'ready-to-deliver',
      };
      if (statusMapping[activeKey]) {
        work.status = statusMapping[activeKey];
      }
    } else {
      work.currentStage  = 'completed';
      work.overallStatus = 'completed';
      work.status        = 'ready-to-deliver';
    }

    await work.save();

    let message = `${currentStageLabel} completed successfully.`;
    if (nextStageLabel) {
      message += ` Work moved to ${nextStageLabel} Stage.`;
    } else {
      message += ` Garment is now Ready for Delivery.`;
    }

    res.json({ success: true, message, data: work, nextStage: nextStageKey });
  } catch (error) {
    console.error('❌ Error processing QR scan:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
