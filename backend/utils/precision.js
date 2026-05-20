/**
 * High-Precision Currency Scaling Utility (Paise-based Integer Math)
 * Prevents floating point issues (e.g. 0.1 + 0.2 = 0.30000000000000004)
 */

export const toPaise = (rupees) => {
  if (rupees === null || rupees === undefined || isNaN(rupees)) return 0;
  return Math.round(Number(rupees) * 100);
};

export const toRupees = (paise) => {
  if (paise === null || paise === undefined || isNaN(paise)) return 0;
  return Math.round(paise) / 100;
};
