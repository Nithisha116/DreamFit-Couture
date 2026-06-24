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
