/**
 * Delivery pipeline — dynamic stages per work/order from existing work + boutique task data.
 */

export const PIPELINE_STAGE_DEFS = {
  cutting: { key: "cutting", label: "Cutting", shortLabel: "Cut" },
  embroidery: { key: "embroidery", label: "Embroidery", shortLabel: "Emb" },
  aari: { key: "aari", label: "Aari Work", shortLabel: "Aari" },
  stitching: { key: "stitching", label: "Stitching", shortLabel: "Stitch" },
  ironing: { key: "ironing", label: "Ironing", shortLabel: "Iron" },
  packed: { key: "packed", label: "Packed", shortLabel: "Pack" },
};

const LS_TASKS_KEY = "dreamfit_boutique_tasks_v1";

const EMBROIDERY_RE = /\b(embroidery|zardozi|zari|magam|kundan|bead|sequin|thread\s*work)\b/i;
const AARI_RE = /\b(aari|aari\s*work|magam\s*work)\b/i;

export function loadBoutiqueTasks() {
  try {
    const raw = localStorage.getItem(LS_TASKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function collectWorkSearchText(work) {
  const g = work?.garment;
  const parts = [
    work?.workId,
    work?.order?.orderId,
    work?.order?.customer?.name,
    typeof g === "object" ? g?.name : work?.garmentName,
    typeof g === "object" ? g?.garmentId : work?.garmentId,
    typeof g === "object" ? g?.categoryName : "",
    typeof g === "object" ? g?.category?.name : "",
    typeof g === "object" ? g?.itemName : "",
    typeof g === "object" ? g?.item?.name : "",
    typeof g === "object" ? g?.additionalInfo : "",
    typeof g === "object" ? g?.description : "",
    work?.notes,
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function taskMatchesWork(task, work) {
  const orderRef = work?.order?.orderId || work?.order?._id || "";
  const workRef = work?.workId || work?._id || "";
  const taskOrder = String(task.orderId || "").replace(/^#/, "").toLowerCase();
  const orderNorm = String(orderRef).replace(/^#/, "").toLowerCase();
  const customer = (work?.order?.customer?.name || "").toLowerCase();
  const garmentName = (typeof work?.garment === "object" ? work.garment?.name : work?.garmentName || "").toLowerCase();

  if (taskOrder && orderNorm && (taskOrder.includes(orderNorm) || orderNorm.includes(taskOrder))) {
    return true;
  }
  if (customer && task.customerName && task.customerName.toLowerCase() === customer) {
    if (!garmentName || !task.title) return true;
    if (task.title.toLowerCase().includes(garmentName) || garmentName.includes(task.title.toLowerCase())) {
      return true;
    }
  }
  return false;
}

/**
 * Resolve applicable pipeline stage keys for a work unit.
 */
export function resolvePipelineStageKeys(work, boutiqueTasks = loadBoutiqueTasks()) {
  const hay = collectWorkSearchText(work);
  const related = boutiqueTasks.filter((t) => taskMatchesWork(t, work));

  const needsEmbroidery =
    related.some((t) => t.departmentKey === "embroidery") || EMBROIDERY_RE.test(hay);
  const needsAari = related.some((t) => t.departmentKey === "aari") || AARI_RE.test(hay);

  const keys = ["cutting"];
  if (needsEmbroidery) keys.push("embroidery");
  if (needsAari) keys.push("aari");
  keys.push("stitching", "ironing", "packed");
  return keys;
}

function isDeptComplete(related, dept) {
  const tasks = related.filter((t) => t.departmentKey === dept);
  if (!tasks.length) return null;
  return tasks.every((t) => t.completed);
}

function isStageCompleted(stageKey, workStatus, related) {
  const status = workStatus || "pending";
  const cuttingDone = [
    "cutting-completed",
    "sewing-started",
    "sewing-completed",
    "ironing",
    "ready-to-deliver",
  ].includes(status);
  const sewingDone = ["sewing-completed", "ironing", "ready-to-deliver"].includes(status);
  const sewingStarted = ["sewing-started", "sewing-completed", "ironing", "ready-to-deliver"].includes(
    status,
  );

  if (stageKey === "cutting") return cuttingDone;
  if (stageKey === "embroidery") {
    const dept = isDeptComplete(related, "embroidery");
    if (dept === true) return true;
    if (dept === false) return false;
    return sewingStarted;
  }
  if (stageKey === "aari") {
    const dept = isDeptComplete(related, "aari");
    if (dept === true) return true;
    if (dept === false) return false;
    return sewingStarted;
  }
  if (stageKey === "stitching") return sewingDone;
  if (stageKey === "ironing") return status === "ready-to-deliver";
  if (stageKey === "packed") return status === "ready-to-deliver";
  return false;
}

function getActiveStageIndex(workStatus, stageKeys, related) {
  if (workStatus === "ready-to-deliver") {
    return Math.max(0, stageKeys.length - 1);
  }
  for (let i = 0; i < stageKeys.length; i++) {
    if (!isStageCompleted(stageKeys[i], workStatus, related)) return i;
  }
  return Math.max(0, stageKeys.length - 1);
}

export function getStageState(stageKey, stageKeys, workStatus, related = []) {
  if (workStatus === "ready-to-deliver") return "completed";

  const stageIdx = stageKeys.indexOf(stageKey);
  const activeIdx = getActiveStageIndex(workStatus, stageKeys, related);
  if (stageIdx < activeIdx) return "completed";
  if (stageIdx === activeIdx) return "active";
  return "pending";
}

export function getCurrentStageLabel(stageKeys, workStatus, related = []) {
  const activeKey = stageKeys[getActiveStageIndex(workStatus, stageKeys, related)];
  return PIPELINE_STAGE_DEFS[activeKey]?.label || "In progress";
}

/** Works due within the next N days, or overdue — active pipeline focus */
export function filterWorksForPipeline(works, daysAhead = 5) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + daysAhead);

  return (works || []).filter((work) => {
    if (!work?.isActive && work?.isActive === false) return false;
    if (work.status === "ready-to-deliver") return true;

    const due = work.estimatedDelivery || work.order?.deliveryDate;
    if (!due) return true;
    const d = new Date(due);
    d.setHours(0, 0, 0, 0);
    return d <= end;
  });
}

export function buildPipelineViewModel(work, boutiqueTasks) {
  const related = boutiqueTasks.filter((t) => taskMatchesWork(t, work));
  const stageKeys = resolvePipelineStageKeys(work, boutiqueTasks);
  const stages = stageKeys.map((key) => ({
    ...PIPELINE_STAGE_DEFS[key],
    state: getStageState(key, stageKeys, work.status, related),
  }));

  const garment = work?.garment;
  const productName =
    (typeof garment === "object" ? garment?.name : work?.garmentName) || "Garment";
  const orderId =
    work?.order?.orderId ||
    (work?.order?._id ? `#${String(work.order._id).slice(-8)}` : null) ||
    work?.workId ||
    "—";
  const customerName = work?.order?.customer?.name || "Customer";
  const deliveryDate = work?.estimatedDelivery || work?.order?.deliveryDate || null;
  const priority =
    (typeof garment === "object" ? garment?.priority : work?.priority) || "normal";

  const overdue =
    deliveryDate &&
    work?.status !== "ready-to-deliver" &&
    new Date(deliveryDate) < new Date(new Date().setHours(0, 0, 0, 0));

  let delayDays = 0;
  if (overdue && deliveryDate) {
    const ms = new Date().setHours(0, 0, 0, 0) - new Date(deliveryDate).setHours(0, 0, 0, 0);
    delayDays = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  return {
    workId: work._id,
    workCode: work.workId,
    orderId,
    customerName,
    productName,
    deliveryDate,
    workStatus: work.status,
    currentStageLabel: getCurrentStageLabel(stageKeys, work.status, related),
    stages,
    priority,
    isHighPriority: priority === "high",
    overdue,
    delayDays,
  };
}

export function sortWorksForPipeline(works) {
  const priorityWeight = { high: 0, normal: 1, low: 2 };
  return [...works].sort((a, b) => {
    const aPri = priorityWeight[a.garment?.priority] ?? 1;
    const bPri = priorityWeight[b.garment?.priority] ?? 1;
    if (aPri !== bPri) return aPri - bPri;
    const dateA = a.estimatedDelivery ? new Date(a.estimatedDelivery).getTime() : Infinity;
    const dateB = b.estimatedDelivery ? new Date(b.estimatedDelivery).getTime() : Infinity;
    return dateA - dateB;
  });
}
