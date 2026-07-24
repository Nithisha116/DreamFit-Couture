// utils/draftProgress.util.js
// Pure helpers for the Draft Orders feature: how "complete" a draft looks,
// and what display name to show for it in the Draft Orders list.

const CHECKLIST = [
  (d) => Boolean(d?.customer),
  (d) => Boolean(d?.deliveryDate),
  (d) => Array.isArray(d?.garments) && d.garments.length > 0,
  (d) => Boolean(String(d?.specialNotes || "").trim()),
  (d) => Number(d?.advancePayment?.amount) > 0 || (Array.isArray(d?.payments) && d.payments.length > 0),
  (d) => Array.isArray(d?.garments) && d.garments.some((g) => (g?.workflowStages?.length || g?.stageKeys?.length)),
];

export const computeDraftProgress = (draftData) => {
  if (!draftData) return 0;
  const filled = CHECKLIST.reduce((sum, check) => sum + (check(draftData) ? 1 : 0), 0);
  return Math.round((filled / CHECKLIST.length) * 100);
};

export const computeDraftDisplayName = (draftData) => {
  const cached = draftData?.customerName || draftData?.customerDisplayName;
  if (cached && String(cached).trim()) return String(cached).trim();
  return "Untitled Draft";
};
