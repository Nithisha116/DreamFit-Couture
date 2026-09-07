/**
 * Order-level production pipeline.
 *
 * One Work = one garment. An order's pipeline is the aggregation of the
 * per-garment pipelines its Works already carry — never a stored field, never
 * "the latest work wins".
 *
 * Source of truth, in full:
 *   Work.stageKeys        which stages this garment has
 *   Work.currentStage     the cursor that says which stage is active
 *   Work.workflowProgress per-stage completion overlay
 *   Work.assignments[]    per-stage worker + status
 *   order.status          the existing delivered / cancelled business rules
 *
 * Per-stage state comes from buildStagesFromWork(), the same helper the
 * Dashboard's per-garment pipeline uses, so the two screens cannot disagree.
 */

import {
  CANONICAL_STAGE_INDEX,
  buildStagesFromWork,
  resolveOrderedStageKeys,
  stageLabel,
} from './workflowPipeline.util.js';

export const ORDER_STAGE_STATUS = {
  COMPLETED:      'COMPLETED',
  IN_PROGRESS:    'IN_PROGRESS',
  NOT_STARTED:    'NOT_STARTED',
  DELAYED:        'DELAYED',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
};

/** Start of the current day — the existing overdue comparison point. */
function startOfToday(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Existing overdue rule, unchanged: a work is past due when its delivery date
 * has passed and it is not finished. Due date falls back to the order's, which
 * is how the Dashboard already resolves job.dueDate.
 */
function resolveDueDate(work, order) {
  return work?.estimatedDelivery || order?.deliveryDate || null;
}

function isPastDue(dueDate, today) {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return false;
  return d < today;
}

function garmentNameOf(work) {
  const g = work?.garment;
  if (g && typeof g === 'object') return g.name || 'Garment';
  return work?.garmentName || 'Garment';
}

/**
 * Ordered union of every work's stageKeys.
 *
 * Garments can run different workflows, so the union has to keep a stable,
 * explainable order. Known stages sort by CANONICAL_STAGE_ORDER; a custom stage
 * inherits the rank of the known stage it follows inside its own work's list,
 * nudged just past it, so it lands where that work put it rather than at the end.
 */
function mergeStageKeys(workStageLists) {
  const ranks = new Map();
  const firstSeen = new Map();
  let seq = 0;

  workStageLists.forEach((stageKeys) => {
    let lastKnownRank = -1;
    let customOffset = 0;

    stageKeys.forEach((key) => {
      const canonical = CANONICAL_STAGE_INDEX[key];
      let rank;

      if (canonical !== undefined) {
        rank = canonical;
        lastKnownRank = canonical;
        customOffset = 0;
      } else {
        customOffset += 1;
        rank = lastKnownRank + customOffset / 1000;
      }

      if (!ranks.has(key) || rank < ranks.get(key)) ranks.set(key, rank);
      if (!firstSeen.has(key)) firstSeen.set(key, seq++);
    });
  });

  return [...ranks.keys()].sort((a, b) => {
    const diff = ranks.get(a) - ranks.get(b);
    if (diff !== 0) return diff;
    return firstSeen.get(a) - firstSeen.get(b);
  });
}

/**
 * Aggregate an order's Works into one production pipeline.
 *
 * PURE: no database access, no request/response, no mutation of its inputs.
 *
 * @param {object} order  the order document (plain or Mongoose)
 * @param {Array}  works  the order's Work documents, as already fetched by
 *                        getOrderById — this function issues no queries
 * @param {object} [options.now]  injectable clock, for tests
 * @returns {{currentStage: string|null, currentStageLabel: string|null, stages: Array}}
 */
export function buildOrderPipeline(order, works = [], options = {}) {
  const today = startOfToday(options.now || new Date());
  const orderStatus = order?.status || null;
  const isCancelled = orderStatus === 'cancelled';
  const isDelivered = orderStatus === 'delivered';

  const activeWorks = (Array.isArray(works) ? works : []).filter(
    (w) => w && w.isActive !== false,
  );

  // Resolve each work's own pipeline once. `order` is attached for the legacy
  // fallback inside resolveOrderedStageKeys — getOrderById does not populate
  // work.order, and re-reading it would be a query per work.
  const resolved = activeWorks.map((work) => {
    const stageKeys = resolveOrderedStageKeys({ ...work, order: work.order || order });
    return {
      work,
      stageKeys,
      stageSet: new Set(stageKeys),
      stages: buildStagesFromWork(work, stageKeys),
      dueDate: resolveDueDate(work, order),
    };
  });

  const orderedKeys = mergeStageKeys(resolved.map((r) => r.stageKeys));

  const stages = orderedKeys.map((key) => {
    const relevant = resolved.filter((r) => r.stageSet.has(key));

    // 1. No work runs this stage — not part of this order's real work.
    if (relevant.length === 0) {
      return {
        key,
        label: stageLabel(key),
        status: ORDER_STAGE_STATUS.NOT_APPLICABLE,
        taskCount: 0,
        completedTaskCount: 0,
        overdue: false,
        tasks: [],
      };
    }

    let completedTaskCount = 0;
    let anyStarted = false;
    let overdue = false;

    const tasks = relevant.map((r) => {
      const stage = r.stages[key] || {};
      const done = stage.state === 'completed';
      const active = stage.state === 'active';
      const late = !done && isPastDue(r.dueDate, today);

      if (done) completedTaskCount += 1;
      // "started" evidence: the work's cursor sits on this stage, or a worker
      // was assigned to it (assignWorkerToStage writes status 'active').
      if (active || stage.assignedTo) anyStarted = true;
      if (late) overdue = true;

      let taskStatus;
      if (done) taskStatus = ORDER_STAGE_STATUS.COMPLETED;
      else if (late) taskStatus = ORDER_STAGE_STATUS.DELAYED;
      else if (active) taskStatus = ORDER_STAGE_STATUS.IN_PROGRESS;
      else taskStatus = ORDER_STAGE_STATUS.NOT_STARTED;

      return {
        workId: String(r.work._id),
        workCode: r.work.workId || null,
        garmentName: garmentNameOf(r.work),
        status: taskStatus,
        assignedTo: stage.assignedTo || null,
        completedAt: stage.completedAt || null,
        completedBy: stage.completedBy || null,
        dueDate: r.dueDate || null,
        overdue: late,
      };
    });

    const allComplete = completedTaskCount === relevant.length;

    let status;
    if (allComplete) {
      status = ORDER_STAGE_STATUS.COMPLETED;
    } else if (overdue) {
      // 3. An incomplete task on a past-due work.
      status = ORDER_STAGE_STATUS.DELAYED;
    } else if (anyStarted || completedTaskCount > 0) {
      // 4. Started somewhere, or partially complete across garments —
      //    the stage stays IN_PROGRESS until every garment finishes it.
      status = ORDER_STAGE_STATUS.IN_PROGRESS;
    } else {
      status = ORDER_STAGE_STATUS.NOT_STARTED;
    }

    // Existing business rule, reused rather than redefined: delivery is the
    // explicit "Mark as Delivered" order action, not a production scan.
    if (isDelivered && key === 'delivered') {
      status = ORDER_STAGE_STATUS.COMPLETED;
    }

    return {
      key,
      label: stageLabel(key),
      status,
      taskCount: relevant.length,
      completedTaskCount,
      overdue,
      tasks,
    };
  });

  // First stage that is neither finished nor inapplicable. Null when the
  // pipeline is complete, has no stages, or the order was cancelled.
  let currentStage = null;
  if (!isCancelled) {
    const next = stages.find(
      (s) =>
        s.status !== ORDER_STAGE_STATUS.COMPLETED &&
        s.status !== ORDER_STAGE_STATUS.NOT_APPLICABLE,
    );
    currentStage = next ? next.key : null;
  }

  return {
    currentStage,
    currentStageLabel: currentStage ? stageLabel(currentStage) : null,
    stages,
  };
}

export default buildOrderPipeline;
