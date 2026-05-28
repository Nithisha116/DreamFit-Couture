/**
 * Maps legacy Work.status ↔ WorkflowJob stages (keep Works module working).
 */

const WORK_STATUS_TO_COMPLETED_STAGES = {
  pending: [],
  accepted: [],
  "cutting-started": [],
  "cutting-completed": ["cutting"],
  "sewing-started": ["cutting"],
  "sewing-completed": ["cutting", "stitching"],
  ironing: ["cutting", "stitching", "ironing"],
  "ready-to-deliver": ["cutting", "stitching", "ironing", "packed"],
};

/** After workflow QR advance, suggest Work.status */
export function workStatusForCompletedStages(stageKeys, completedKeys) {
  const done = new Set(completedKeys);
  if (stageKeys.every((k) => done.has(k))) return "ready-to-deliver";
  const activeIdx = stageKeys.findIndex((k) => !done.has(k));
  const active = stageKeys[activeIdx];
  if (active === "packed" || active === "packing") {
    return "ready-to-deliver";
  }
  if (
    activeIdx === stageKeys.length - 1 &&
    stageKeys.length > 1 &&
    done.has(stageKeys[stageKeys.length - 2])
  ) {
    return "ready-to-deliver";
  }
  if (active === "ironing") return "ironing";
  if (active === "stitching") {
    return done.has("cutting") ? "sewing-started" : "cutting-completed";
  }
  if (active === "embroidery" || active === "aari") return "cutting-completed";
  if (active === "cutting") return "cutting-started";
  return "accepted";
}

export function applyWorkStatusToStages(stageKeys, stages, workStatus) {
  const completed = WORK_STATUS_TO_COMPLETED_STAGES[workStatus] || [];
  const completedSet = new Set(
    completed.filter((k) => stageKeys.includes(k)),
  );

  let activeKey = stageKeys.find((k) => !completedSet.has(k)) || stageKeys[stageKeys.length - 1];
  if (workStatus === "ready-to-deliver") {
    stageKeys.forEach((k) => {
      stages[k] = { ...stages[k], state: "completed" };
    });
    return stages;
  }

  stageKeys.forEach((key) => {
    if (completedSet.has(key)) {
      stages[key] = { ...stages[key], state: "completed" };
    } else if (key === activeKey) {
      stages[key] = { ...stages[key], state: "active" };
    } else {
      stages[key] = { ...stages[key], state: "pending" };
    }
  });
  return stages;
}

export function extractAssigneesFromWork(work) {
  const assignees = {};
  if (work?.cuttingMaster) {
    const name =
      typeof work.cuttingMaster === "object" ? work.cuttingMaster.name : String(work.cuttingMaster);
    assignees.cutting = { role: "cutting", name, workerId: work.cuttingMaster?._id };
  }
  if (work?.tailor) {
    const name = typeof work.tailor === "object" ? work.tailor.name : String(work.tailor);
    assignees.stitching = { role: "tailor", name, workerId: work.tailor?._id };
  }
  return assignees;
}
