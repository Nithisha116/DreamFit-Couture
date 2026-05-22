/** DreamFit Tasks — department tabs map to stable keys */
export const DEPARTMENT_TABS = [
  { tab: "ALL", key: "all" },
  { tab: "EMBROIDERY", key: "embroidery" },
  { tab: "CUTTING", key: "cutting" },
  { tab: "SEWING", key: "sewing" },
  { tab: "FINISHES", key: "finishes" },
  { tab: "MARKING", key: "marking" },
  { tab: "AARI WORK", key: "aari" },
];

export const TAB_TO_KEY = Object.fromEntries(
  DEPARTMENT_TABS.map(({ tab, key }) => [tab, key]),
);

export const KEY_TO_TAB = Object.fromEntries(
  DEPARTMENT_TABS.map(({ tab, key }) => [key, tab]),
);

/** Only employees valid for assignment in that department */
export const EMPLOYEES_BY_DEPARTMENT = {
  embroidery: [],
  sewing: [],
  cutting: [],
  finishes: [],
  marking: [],
  aari: [],
};

/** Default daily capacity (hours) for workload / availability heuristics */
export const DEFAULT_CAPACITY_HOURS = 8;

export const OUTFIT_TYPES = [
  "Blouse",
  "Bridal Lehenga",
  "Kurta",
  "Gown",
  "Saree Fall & Pico",
  "Alteration",
  "Kids Wear",
];

export const TASK_STATUSES = ["UNASSIGNED", "ASSIGNED", "IN_PROGRESS"];
