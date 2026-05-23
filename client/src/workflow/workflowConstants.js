/** Workflow SSOT — stage definitions and shared constants */

export const WORKFLOW_LS_KEY = "dreamfit_workflow_jobs_v1";
export const WORKFLOW_CHANGED_EVENT = "dreamfit-workflow-changed";

export const PIPELINE_STAGE_DEFS = {
  cutting: { key: "cutting", label: "Cutting", shortLabel: "Cut" },
  embroidery: { key: "embroidery", label: "Embroidery", shortLabel: "Emb" },
  aari: { key: "aari", label: "Aari Work", shortLabel: "Aari" },
  stitching: { key: "stitching", label: "Stitching", shortLabel: "Stitch" },
  ironing: { key: "ironing", label: "Ironing", shortLabel: "Iron" },
  packed: { key: "packed", label: "Packed / Ready", shortLabel: "Pack" },
};

const VALID_KEYS = new Set(Object.keys(PIPELINE_STAGE_DEFS));

export const DEFAULT_WORKFLOW_STAGES = ["cutting", "stitching", "ironing", "packed"];

/** Map API / legacy aliases to canonical stage keys */
export function normalizeStageKey(key) {
  const k = String(key || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (k === "aari_work" || k === "aariwork") return "aari";
  if (k === "sewing") return "stitching";
  if (k === "pack" || k === "ready") return "packed";
  return k;
}

/** Validate and dedupe workflow stage list (SSOT shape) */
export function normalizeWorkflowStages(stages) {
  if (!Array.isArray(stages)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of stages) {
    const key = normalizeStageKey(raw);
    if (!VALID_KEYS.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

export const WORKER_ROLES = [
  { id: "cutting", label: "Cutting master" },
  { id: "tailor", label: "Tailor" },
  { id: "store_keeper", label: "Store Keeper" },
  { id: "staff", label: "General Staff" },
  { id: "embroidery", label: "Embroidery worker" },
  { id: "aari", label: "Aari worker" },
  { id: "helper", label: "Helper" },
  { id: "ironing", label: "Ironing helper" },
  { id: "packing", label: "Packing worker" },
];

/** Maps workflow stage → boutique department tab key (for filters/workload) */
export const STAGE_TO_DEPARTMENT = {
  cutting: "cutting",
  embroidery: "embroidery",
  aari: "aari",
  stitching: "sewing",
  ironing: "finishes",
  packed: null,
};

export const STAGE_TO_WORKER_ROLE = {
  cutting: "cutting",
  embroidery: "embroidery",
  aari: "aari",
  stitching: "tailor",
  ironing: "ironing",
  packed: null,
};

const EMBROIDERY_RE = /\b(embroidery|zardozi|zari|magam|kundan|bead|sequin|thread\s*work)\b/i;
const AARI_RE = /\b(aari|aari\s*work|magam\s*work)\b/i;

export function collectGarmentSearchText(jobOrWork) {
  const g = jobOrWork?.garment;
  const parts = [
    jobOrWork?.workCode,
    jobOrWork?.orderId,
    jobOrWork?.customerName,
    jobOrWork?.garmentName,
    jobOrWork?.garmentId,
    jobOrWork?.categoryName,
    jobOrWork?.itemName,
    typeof g === "object" ? g?.name : "",
    typeof g === "object" ? g?.garmentId : "",
    typeof g === "object" ? g?.categoryName : "",
    typeof g === "object" ? g?.category?.name : "",
    typeof g === "object" ? g?.itemName : "",
    typeof g === "object" ? g?.item?.name : "",
    typeof g === "object" ? g?.additionalInfo : "",
    typeof g === "object" ? g?.description : "",
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
}

/** Dynamic stage list — per-order workflowStages is SSOT when present */
export function resolveStageKeysForJob(job, boutiqueTasks = []) {
  const custom = normalizeWorkflowStages(
    job?.workflowStages || job?.stageKeys,
  );
  if (custom.length) return custom;

  const hay = collectGarmentSearchText(job);
  const orderNorm = String(job.orderId || "").replace(/^#/, "").toLowerCase();
  const related = boutiqueTasks.filter((t) => {
    const tOrder = String(t.orderId || "").replace(/^#/, "").toLowerCase();
    if (tOrder && orderNorm && (tOrder.includes(orderNorm) || orderNorm.includes(tOrder))) {
      return true;
    }
    const cust = (job.customerName || "").toLowerCase();
    if (cust && t.customerName?.toLowerCase() === cust) return true;
    return false;
  });

  const needsEmbroidery =
    related.some((t) => t.departmentKey === "embroidery") || EMBROIDERY_RE.test(hay);
  const needsAari = related.some((t) => t.departmentKey === "aari") || AARI_RE.test(hay);

  const keys = ["cutting"];
  if (needsEmbroidery) keys.push("embroidery");
  if (needsAari) keys.push("aari");
  keys.push("stitching", "ironing", "packed");
  return keys.length ? keys : [...DEFAULT_WORKFLOW_STAGES];
}