import Work from '../models/Work.js';
import Worker from '../models/Worker.js';

// Pipeline stage definitions
const PIPELINE_STAGE_DEFS = {
  cutting: { id: "cutting", label: "Cutting", department: "cutting" },
  stitching: { id: "stitching", label: "Stitching", department: "tailor" },
  embroidery: { id: "embroidery", label: "Embroidery", department: "embroidery" },
  aari: { id: "aari", label: "Aari Work", department: "aari" },
  ironing: { id: "ironing", label: "Ironing", department: "ironing" },
  finishing: { id: "finishing", label: "Finishing & QC", department: "finishing" },
  packing: { id: "packing", label: "Packing", department: "packing" },
};

// Helper: Determine stages based on garment/work
function resolveStageKeysForJob(work) {
  // Can be customized based on garment category/item later.
  // For now, default pipeline:
  return ["cutting", "stitching", "ironing", "packing"];
}

// Helper: Get active stage
function getActiveStageKey(stages) {
  const keys = Object.keys(stages);
  const active = keys.find(k => stages[k].state === "active");
  if (active) return active;
  const pending = keys.find(k => stages[k].state === "pending");
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
          { path: 'item', select: 'name itemName' }
        ]
      })
      .sort({ createdAt: -1 });

    const jobs = works.map(work => {
      const garment = work.garment;
      const stageKeys = resolveStageKeysForJob(work);
      
      const stages = {};
      stageKeys.forEach(k => {
        stages[k] = { state: "pending", assignedTo: null, completedAt: null };
      });

      // Populate assignments from work.assignments array
      if (work.assignments && work.assignments.length > 0) {
        work.assignments.forEach(assignment => {
          if (stages[assignment.stage]) {
            stages[assignment.stage].assignedTo = {
              workerId: assignment.workerId,
              name: assignment.workerName,
              role: assignment.role
            };
            stages[assignment.stage].state = assignment.status === 'completed' ? 'completed' : 'active';
            if (assignment.status === 'completed') {
              stages[assignment.stage].completedAt = assignment.completedAt;
            }
          }
        });
      }

      // If no active stage, set the first pending to active
      if (stageKeys[0] && !Object.values(stages).some(s => s.state === "active")) {
        const firstPending = stageKeys.find(k => stages[k].state !== "completed") || stageKeys[0];
        stages[firstPending].state = "active";
      }

      const activeKey = getActiveStageKey(stages);
      const assignmentStatus = stages[activeKey]?.assignedTo ? "assigned" : "unassigned";
      const lifecycleStatus = stageKeys.every(k => stages[k].state === "completed") ? "completed" : "open";

      return {
        id: work._id,
        workflowTrackingId: work.workId,
        workMongoId: work._id,
        workCode: work.workId,
        orderId: work.order?.orderId || "",
        customerName: work.order?.customer?.name || "Customer",
        garmentName: garment?.name || work.garmentName || "Garment",
        categoryName: garment?.categoryName || garment?.category?.name || "",
        itemName: garment?.itemName || garment?.item?.name || "",
        dueDate: work.estimatedDelivery || work.order?.deliveryDate || null,
        workStatus: work.status || "pending",
        stageKeys,
        stages,
        currentStageKey: activeKey,
        currentStageLabel: PIPELINE_STAGE_DEFS[activeKey]?.label || "In progress",
        priority: garment?.priority || work.priority || "normal",
        assignmentStatus,
        lifecycleStatus
      };
    });

    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error('Error fetching workflow jobs:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Assign worker to work stage
// @route   POST /api/works/:id/assign-worker
// @access  Private
export const assignWorkerToStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, role, workerId, workerName } = req.body;

    const work = await Work.findById(id);
    if (!work) return res.status(404).json({ success: false, message: 'Work not found' });

    // Validate worker
    let workerDoc = null;
    if (workerId) {
      workerDoc = await Worker.findById(workerId);
      if (!workerDoc) return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Prepare assignment
    const assignment = {
      stage,
      role,
      workerId: workerDoc ? workerDoc._id : null,
      workerName: workerDoc ? workerDoc.name : workerName,
      status: 'active',
      assignedAt: new Date(),
      startedAt: new Date()
    };

    // Replace or add assignment for the stage
    const existingIndex = work.assignments.findIndex(a => a.stage === stage);
    if (existingIndex >= 0) {
      work.assignments[existingIndex] = assignment;
    } else {
      work.assignments.push(assignment);
    }

    // Add to history
    work.history.push({
      action: 'WORKER_ASSIGNED',
      details: `Assigned ${assignment.workerName} (${role}) to ${stage}`,
      actorId: req.user._id,
      actorName: req.user.name || 'System'
    });

    await work.save();

    res.json({ success: true, message: 'Worker assigned successfully', data: work });
  } catch (error) {
    console.error('Error assigning worker:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
