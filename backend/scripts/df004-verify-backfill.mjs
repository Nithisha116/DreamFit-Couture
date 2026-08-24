/**
 * DF-004 backfill verification — strictly read-only.
 * Never writes to any collection. Two modes:
 *
 *   node scripts/df004-verify-backfill.mjs snapshot <label> <outFile.json>
 *   node scripts/df004-verify-backfill.mjs compare <before.json> <after.json>
 *
 * "snapshot" records: total Order count, every Order._id+publicToken that
 * currently HAS a token, every Order._id+orderId that currently LACKS one,
 * and document counts for every other collection the backfill must not touch.
 *
 * "compare" checks, read-only, against two prior snapshots:
 *   1. every order that lacked a token in "before" now has exactly one
 *      non-empty, well-formed token in "after"
 *   2. every token that already existed in "before" is byte-identical in
 *      "after" (never overwritten)
 *   3. total Order count is unchanged
 *   4. every other collection's document count is unchanged
 *   5. all tokens in "after" are globally unique (no duplicates introduced)
 */

import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";

import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Work from "../models/Work.js";
import Garment from "../models/Garment.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function otherCollectionCounts() {
  return {
    Customer: await Customer.countDocuments({}),
    Work: await Work.countDocuments({}),
    Garment: await Garment.countDocuments({}),
    Payment: await Payment.countDocuments({}),
    Invoice: await Invoice.countDocuments({}),
    Notification: await Notification.countDocuments({}),
    AuditLog: await AuditLog.countDocuments({}),
  };
}

async function snapshot(label, outPath) {
  await mongoose.connect(process.env.MONGO_URI);

  const totalOrders = await Order.countDocuments({});
  const withToken = await Order.find({ publicToken: { $exists: true, $ne: null, $ne: "" } })
    .select("_id publicToken")
    .lean();
  const withoutToken = await Order.find({
    $or: [{ publicToken: { $exists: false } }, { publicToken: null }, { publicToken: "" }],
  })
    .select("_id orderId")
    .lean();
  const otherCounts = await otherCollectionCounts();

  const snap = {
    label,
    takenAt: new Date().toISOString(),
    totalOrders,
    withToken: withToken.map((o) => ({ _id: String(o._id), publicToken: o.publicToken })),
    withoutToken: withoutToken.map((o) => ({ _id: String(o._id), orderId: o.orderId })),
    otherCounts,
  };

  fs.writeFileSync(outPath, JSON.stringify(snap, null, 2));
  console.log(`Snapshot "${label}" written to ${outPath}`);
  console.log(`  totalOrders=${totalOrders}`);
  console.log(`  withToken=${withToken.length}  withoutToken=${withoutToken.length}`);
  console.log(`  otherCounts=${JSON.stringify(otherCounts)}`);

  await mongoose.disconnect();
}

function compare(beforePath, afterPath) {
  const before = JSON.parse(fs.readFileSync(beforePath, "utf8"));
  const after = JSON.parse(fs.readFileSync(afterPath, "utf8"));

  const checks = [];
  const afterTokenByOrderId = new Map(after.withToken.map((o) => [o._id, o.publicToken]));
  const beforeTokenByOrderId = new Map(before.withToken.map((o) => [o._id, o.publicToken]));

  // (1) every previously-eligible order now has exactly one non-empty, well-formed token
  const stillMissing = [];
  const malformed = [];
  for (const o of before.withoutToken) {
    const token = afterTokenByOrderId.get(o._id);
    if (!token) {
      stillMissing.push(o);
    } else if (!UUID_RE.test(token)) {
      malformed.push({ ...o, token });
    }
  }
  checks.push({
    name: "1. All previously-eligible orders now have exactly one non-empty, well-formed publicToken",
    pass: stillMissing.length === 0 && malformed.length === 0,
    detail: `eligible=${before.withoutToken.length}, stillMissing=${stillMissing.length}, malformed=${malformed.length}`,
    stillMissing,
    malformed,
  });

  // (2) pre-existing tokens were not overwritten
  const overwritten = [];
  for (const [id, tokenBefore] of beforeTokenByOrderId.entries()) {
    const tokenAfter = afterTokenByOrderId.get(id);
    if (tokenAfter !== tokenBefore) {
      overwritten.push({ _id: id, before: tokenBefore, after: tokenAfter ?? null });
    }
  }
  checks.push({
    name: "2. Pre-existing publicTokens unchanged (none overwritten)",
    pass: overwritten.length === 0,
    detail: `preExisting=${before.withToken.length}, overwritten=${overwritten.length}`,
    overwritten,
  });

  // (3) total Order count unchanged
  checks.push({
    name: "3. Total Order document count unchanged",
    pass: before.totalOrders === after.totalOrders,
    detail: `before=${before.totalOrders}, after=${after.totalOrders}`,
  });

  // (4) no other collection's document count changed
  const collectionDiffs = [];
  for (const key of Object.keys(before.otherCounts)) {
    if (before.otherCounts[key] !== after.otherCounts[key]) {
      collectionDiffs.push({ collection: key, before: before.otherCounts[key], after: after.otherCounts[key] });
    }
  }
  checks.push({
    name: "4. No other collection's document count changed",
    pass: collectionDiffs.length === 0,
    detail: JSON.stringify({ before: before.otherCounts, after: after.otherCounts }),
    collectionDiffs,
  });

  // (5) bonus — global uniqueness of every token present after the run
  const allTokensAfter = after.withToken.map((o) => o.publicToken);
  const uniqueTokensAfter = new Set(allTokensAfter);
  checks.push({
    name: "5. All publicTokens globally unique after the run",
    pass: uniqueTokensAfter.size === allTokensAfter.length,
    detail: `totalTokens=${allTokensAfter.length}, uniqueTokens=${uniqueTokensAfter.size}`,
  });

  console.log("=".repeat(70));
  console.log("DF-004 BACKFILL VERIFICATION (read-only, comparing two snapshots)");
  console.log(`before: ${before.label} @ ${before.takenAt}`);
  console.log(`after:  ${after.label} @ ${after.takenAt}`);
  console.log("=".repeat(70));
  for (const c of checks) {
    console.log(`${c.pass ? "✅ PASS" : "❌ FAIL"} — ${c.name}`);
    console.log(`    ${c.detail}`);
    if (!c.pass) console.log(`    ${JSON.stringify(c, null, 2)}`);
  }
  console.log("=".repeat(70));
  const allPass = checks.every((c) => c.pass);
  console.log(allPass ? "ALL CHECKS PASSED" : "ONE OR MORE CHECKS FAILED — see above");
  process.exit(allPass ? 0 : 1);
}

const [, , cmd, a, b] = process.argv;
if (cmd === "snapshot") {
  await snapshot(a, b);
} else if (cmd === "compare") {
  compare(a, b);
} else {
  console.error("Usage:\n  node scripts/df004-verify-backfill.mjs snapshot <label> <outFile.json>\n  node scripts/df004-verify-backfill.mjs compare <before.json> <after.json>");
  process.exit(1);
}
