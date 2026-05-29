const LOYALTY_TIERS = [
  { minPoints: 250, discountPct: 10, label: "Gold" },
  { minPoints: 100, discountPct: 5, label: "Silver" },
];

const MS_DAY = 86400000;

export function classifyCustomer(c) {
  const last = c.lastPurchase ? new Date(c.lastPurchase) : null;

  const daysSince = last
    ? (Date.now() - last.getTime()) / MS_DAY
    : 9999;

  if (daysSince > 90) return "Inactive";

  const totalSpend = c.totalSpend || c.totalSpent || 0;
  const orderCount = c.orderCount || c.totalOrders || 0;

  if (totalSpend >= 50000) return "VIP";

  if (totalSpend >= 30000 || orderCount >= 5)
    return "High value";

  if (orderCount <= 1 && daysSince < 45)
    return "New";

  if (orderCount >= 2)
    return "Regular";

  return "New";
}

export function loyaltyMeta(points) {
  const sorted = [...LOYALTY_TIERS].sort((a, b) => b.minPoints - a.minPoints);

  const unlocked = sorted.find((t) => points >= t.minPoints);

  const next = [...sorted]
    .reverse()
    .find((t) => points < t.minPoints);

  const progressToNext = next
    ? Math.min(100, (points / next.minPoints) * 100)
    : 100;

  return {
    badge: unlocked ? unlocked.label : "Member",
    discountPct: unlocked?.discountPct ?? 0,
    nextTier: next,
    progressToNext,
    points,
  };
}

export function dummyPurchaseHistory(customerId) {
  const base = [
    { id: "P1", date: "2026-04-12", amount: 12000, pointsEarned: 24 },
    { id: "P2", date: "2026-05-02", amount: 8000, pointsEarned: 16 },
  ];

  return base.map((p) => ({ ...p, customerId }));
}

export function aggregateStats(customers) {
  const cats = customers.map((c) => classifyCustomer(c));

  return {
    total: customers.length,
    active: customers.filter((_, i) => cats[i] !== "Inactive").length,
    new: cats.filter((x) => x === "New").length,
    inactive: cats.filter((x) => x === "Inactive").length,
    highValue: cats.filter(
      (x) => x === "High value" || x === "VIP"
    ).length,
  };
}