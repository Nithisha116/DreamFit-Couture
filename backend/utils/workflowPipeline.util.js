/**
 * Canonical production-pipeline helpers.
 *
 * Extracted verbatim from workflow.controller.js so that BOTH consumers share
 * one definition of stage keys, labels and per-stage state:
 *
 *            Work / Tasks
 *                 |
 *        workflowPipeline.util
 *          /              \
 *   per-garment       order aggregation
 *   (workflow/qr)     (orderPipeline.util)
 *          |                 |
 *      Dashboard        Order Details
 *
 * workflow.controller.js re-exports everything here, so existing importers
 * (qr.controller.js) keep working unchanged.
 */

// Pipeline stage definitions — labels for any known key.
//
// The `department` field on the older entries is legacy metadata that nothing
// in the backend reads; only `label` is consumed (by stageLabel below). New
// entries therefore carry id + label only.
export const PIPELINE_STAGE_DEFS = {
  cutting:    { id: 'cutting',    label: 'Cutting',        department: 'cutting'    },
  stitching:  { id: 'stitching',  label: 'Stitching',      department: 'tailor'     },
  embroidery: { id: 'embroidery', label: 'Embroidery',     department: 'embroidery' },
  aari:       { id: 'aari',       label: 'Aari Work',      department: 'aari'       },
  ironing:    { id: 'ironing',    label: 'Ironing',        department: 'ironing'    },
  finishing:  { id: 'finishing',  label: 'Finishing & QC', department: 'finishing'  },
  packing:    { id: 'packing',    label: 'Packing',        department: 'packing'    },
  packed:     { id: 'packed',     label: 'Packed / Ready', department: 'packing'    },

  // Canonical labels for the stage keys the workflow builder already emits
  // (see client/src/workflow/workflowConstants.js — same keys, same labels).
  // Without these, stageLabel() title-cased them into "Final finishing" and
  // "Ironing packing".
  purchase:        { id: 'purchase',        label: 'Purchase'            },
  marking:         { id: 'marking',         label: 'Marking'             },
  aari_started:    { id: 'aari_started',    label: 'Aari Work Started'   },
  aari_completed:  { id: 'aari_completed',  label: 'Aari Work Completed' },
  final_finishing: { id: 'final_finishing', label: 'Final Finishing'     },
  ironing_packing: { id: 'ironing_packing', label: 'Ironing & Packing'   },
  trial:           { id: 'trial',           label: 'Trial'               },
  alteration:      { id: 'alteration',      label: 'Alteration'          },
  delivered:       { id: 'delivered',       label: 'Delivered'           },
};

/**
 * Canonical stage sequence, used ONLY as an ordering tie-break when merging the
 * differing pipelines of an order's garments. Derived from the presets the
 * workflow builder already ships (standard / purchase / aari) plus the legacy
 * cutting -> stitching -> ironing -> packed fallback.
 *
 * This is NOT a pipeline definition: a work's own stageKeys always decide which
 * stages that work actually has.
 */
export const CANONICAL_STAGE_ORDER = [
  'marking',
  'purchase',
  'aari_started',
  'aari_completed',
  'cutting',
  'embroidery',
  'aari',
  'stitching',
  'final_finishing',
  'finishing',
  'ironing',
  'ironing_packing',
  'packing',
  'packed',
  'trial',
  'alteration',
  'delivered',
];

export const CANONICAL_STAGE_INDEX = CANONICAL_STAGE_ORDER.reduce((acc, key, i) => {
  acc[key] = i;
  return acc;
}, {});

export function normalizeStageKey(key) {
  const k = String(key || '').trim().toLowerCase().replace(/\s+/g, '_');
  // IMPORTANT: do NOT collapse packing -> packed here for stage-key purposes.
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
 *   1. work.stageKeys         <- set during work creation from order
 *   2. work.workflowStages[]  <- array of {key, label, order}
 *   3. order.stageKeys
 *   4. order.workflowStages[] <- array of {key, label, order}
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

  const garment = work.garment;

  // 2b. garment.stageKeys / garment.workflowStages (per-garment SSOT for new orders)
  if (garment && typeof garment === 'object') {
    if (Array.isArray(garment.stageKeys) && garment.stageKeys.length > 0) {
      return garment.stageKeys.map(normalizeStageKey).filter(Boolean);
    }
    if (
      Array.isArray(garment.workflowStages) &&
      garment.workflowStages.length > 0 &&
      typeof garment.workflowStages[0] === 'object' &&
      garment.workflowStages[0]?.key
    ) {
      return [...garment.workflowStages]
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(s => normalizeStageKey(s.key))
        .filter(Boolean);
    }
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
  console.warn('[resolveOrderedStageKeys] No custom workflow found, using default fallback');
  return ['cutting', 'stitching', 'ironing', 'packed'];
}

/**
 * Build the stages map WITH CORRECT STATE from the Work document.
 *
 * Stage state is derived from work.currentStage (persisted in MongoDB by
 * processQrScan), NOT re-computed from scratch. This is the ground truth.
 *
 * The rule is simple:
 *   - Stages BEFORE currentStage  -> completed
 *   - currentStage itself         -> active
 *   - Stages AFTER currentStage   -> pending
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

  // Overlay completion timestamps from workflowProgress (MongoDB SSOT)
  const progress = work.workflowProgress;
  if (progress && typeof progress === 'object' && !Array.isArray(progress)) {
    Object.entries(progress).forEach(([rawKey, val]) => {
      const key = normalizeStageKey(rawKey);
      if (!stages[key] || !val) return;
      if (val.completedAt) stages[key].completedAt = val.completedAt;
      if (val.completed) stages[key].state = 'completed';
      if (val.completedBy) stages[key].completedBy = val.completedBy;
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
