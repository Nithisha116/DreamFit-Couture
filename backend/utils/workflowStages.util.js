/**
 * Shared workflow stage parsing — used for order-level (legacy) and garment-level (new) pipelines.
 */

function titleCaseKey(key) {
  return String(key)
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Normalize incoming workflow input (string keys, objects, or JSON string) into
 * ordered [{ key, label, order }] plus flat stageKeys[].
 */
export function parseWorkflowStagesInput(raw) {
  let input = raw;

  if (typeof input === "string") {
    try {
      input = JSON.parse(input);
    } catch {
      input = input
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  if (!input) {
    return { stageKeys: [], workflowStages: [] };
  }

  const items = Array.isArray(input) ? input : [input];
  const workflowStages = items
    .map((stage, index) => {
      if (typeof stage === "string") {
        const key = stage.trim().toLowerCase().replace(/\s+/g, "_");
        if (!key) return null;
        return { key, label: titleCaseKey(key), order: index + 1 };
      }
      if (stage && typeof stage === "object") {
        const rawKey = stage.key || stage.name || stage.label || stage.stageName || stage.title;
        if (!rawKey) return null;
        const key = String(rawKey).trim().toLowerCase().replace(/\s+/g, "_");
        return {
          key,
          label: stage.label || titleCaseKey(key),
          order: stage.order || index + 1,
        };
      }
      return null;
    })
    .filter(Boolean);

  const stageKeys = workflowStages.map((s) => s.key);
  return { stageKeys, workflowStages };
}

/**
 * Resolve workflow for a garment at work-creation time.
 * Garment-level workflow wins for new orders; order-level is legacy fallback.
 */
export function resolveWorkflowForGarment(garment, order) {
  const garmentParsed = parseWorkflowStagesInput(
    garment?.stageKeys?.length ? garment.stageKeys : garment?.workflowStages,
  );

  if (garmentParsed.stageKeys.length > 0) {
    return garmentParsed;
  }

  if (Array.isArray(order?.stageKeys) && order.stageKeys.length > 0) {
    const fromOrderKeys = parseWorkflowStagesInput(order.stageKeys);
    if (fromOrderKeys.stageKeys.length > 0) return fromOrderKeys;
  }

  if (Array.isArray(order?.workflowStages) && order.workflowStages.length > 0) {
    const fromOrderStages = parseWorkflowStagesInput(order.workflowStages);
    if (fromOrderStages.stageKeys.length > 0) return fromOrderStages;
  }

  if (order?.workflowStages && typeof order.workflowStages === "object" && !Array.isArray(order.workflowStages)) {
    const keys = Object.keys(order.workflowStages).filter(Boolean);
    if (keys.length > 0) {
      return parseWorkflowStagesInput(keys);
    }
  }

  return { stageKeys: [], workflowStages: [] };
}

export function garmentsHaveWorkflow(garments = []) {
  return garments.some((g) => {
    const parsed = parseWorkflowStagesInput(g?.stageKeys?.length ? g.stageKeys : g?.workflowStages);
    return parsed.stageKeys.length > 0;
  });
}

/**
 * Recompute a Work document's `currentStage` cursor after its stage list has
 * been edited (e.g. via garment workflow update).
 *
 * Without this, naively keeping `currentStage` unchanged whenever it still
 * exists in the new list causes any stage newly positioned BEFORE it (a
 * brand-new stage like "purchase", or a previously-pending stage moved
 * earlier by a reorder) to be misread as already completed by consumers that
 * derive stage state purely from array position relative to currentStage
 * (see buildStagesFromWork in workflow.controller.js).
 *
 * Rules:
 *  - No valid old cursor (old list empty, or old cursor not found in it) —
 *    start at the new pipeline's first stage.
 *  - Old cursor stage removed — resume right after the last stage that was
 *    completed-or-current before AND still exists in the new list.
 *  - Old cursor stage still exists, but the new list now places one or more
 *    stages before it that were NOT already completed pre-edit (new stages,
 *    or previously pending stages reordered earlier) — rewind the cursor to
 *    the earliest such stage so it isn't skipped over as "completed".
 *  - Otherwise (edit doesn't affect anything before the cursor) — the cursor
 *    is left untouched.
 */
export function reanchorCurrentStage(oldStageKeys, oldCurrentStage, newStageKeys) {
  const oldKeys = Array.isArray(oldStageKeys) ? oldStageKeys : [];
  const newKeys = Array.isArray(newStageKeys) ? newStageKeys : [];

  if (!newKeys.length) return oldCurrentStage;

  const oldIndex = oldKeys.indexOf(oldCurrentStage);

  if (oldIndex < 0) {
    return newKeys[0];
  }

  const newIndex = newKeys.indexOf(oldCurrentStage);

  if (newIndex < 0) {
    const carriedOver = oldKeys.slice(0, oldIndex + 1).filter((k) => newKeys.includes(k));
    if (!carriedOver.length) return newKeys[0];
    const lastSurvivorIndex = newKeys.indexOf(carriedOver[carriedOver.length - 1]);
    return newKeys[lastSurvivorIndex + 1] ?? newKeys[lastSurvivorIndex];
  }

  const previouslyCompleted = new Set(oldKeys.slice(0, oldIndex));
  const nowPrecedingStages = newKeys.slice(0, newIndex);
  const notYetCompleted = nowPrecedingStages.find((k) => !previouslyCompleted.has(k));

  if (notYetCompleted) {
    return notYetCompleted;
  }

  return oldCurrentStage;
}
