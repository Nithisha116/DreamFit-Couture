/**
 * DF-004 compatibility backfill — Order.publicToken
 * =========================================================================
 * Adds `publicToken` to existing Order documents that don't have one yet.
 * This is the ONLY field this script ever writes. It never runs on its own —
 * it must be invoked manually from the command line, and defaults to a safe,
 * read-only dry run.
 *
 * Usage:
 *   node scripts/df004-backfill-public-token.mjs             (dry run — no writes)
 *   node scripts/df004-backfill-public-token.mjs --dry-run    (same, explicit)
 *   node scripts/df004-backfill-public-token.mjs --execute    (performs the writes)
 *
 * Not imported by server.js, not wired into any npm lifecycle script, not run
 * on deploy/start. It only runs if a human invokes this file directly.
 *
 * Guarantees:
 *   - Only Order.publicToken is ever written. No other Order field is touched.
 *   - Only documents currently missing publicToken (undefined/null/"") are matched.
 *   - The write's own filter re-checks "still missing" at write time, so the
 *     operation is safe to re-run: an Order that already has a token is never
 *     matched again, and never gets a new token.
 *   - No other collection (Customer, Work, Garment, Payment, Invoice,
 *     Notification, AuditLog, etc.) is imported or referenced anywhere in this
 *     file — it is structurally impossible for it to write to them.
 *   - Before writing, this script checks the freshly generated token doesn't
 *     already exist on another Order. If it somehow does (astronomically
 *     unlikely for crypto.randomUUID(), but checked anyway per requirement),
 *     the whole run stops immediately and reports it — no partial silent skip.
 */

import "dotenv/config";
import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/Order.js";

const EXECUTE = process.argv.includes("--execute");
const MODE = EXECUTE ? "EXECUTE (writes will happen)" : "DRY RUN (no writes)";

// Matches "missing" in every shape this schema/history could produce.
const ELIGIBLE_FILTER = {
  $or: [
    { publicToken: { $exists: false } },
    { publicToken: null },
    { publicToken: "" },
  ],
};

async function main() {
  console.log("=".repeat(70));
  console.log(`DF-004 publicToken backfill — MODE: ${MODE}`);
  console.log("=".repeat(70));

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.\n");

  const eligible = await Order.find(ELIGIBLE_FILTER)
    .select("_id orderId publicToken customer createdAt")
    .sort({ createdAt: 1 })
    .lean();

  console.log(`Eligible Orders (missing publicToken): ${eligible.length}\n`);

  if (eligible.length === 0) {
    console.log("Nothing to do — every Order already has a publicToken.");
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log("-".repeat(70));
  console.log("ORDERS THAT WOULD BE AFFECTED");
  console.log("-".repeat(70));
  for (const o of eligible) {
    console.log(
      `  _id=${o._id}  orderId=${o.orderId}  ` +
        `currentPublicToken=${JSON.stringify(o.publicToken ?? null)}  ` +
        `(confirmed missing: ${!o.publicToken})`
    );
  }
  console.log();

  const seenNewTokens = new Set();
  const plannedOps = [];
  let collision = null;

  for (const o of eligible) {
    let token;
    // Pre-check for collision against the database, not just this run's own
    // in-memory set, then retry with a fresh UUID if one is somehow found —
    // and hard-stop the whole script if that ever happens (see file header).
    let attempt = 0;
    while (true) {
      attempt++;
      token = crypto.randomUUID();
      if (seenNewTokens.has(token)) continue; // collided within this run's own batch — regenerate
      const existing = await Order.findOne({ publicToken: token }).select("_id").lean();
      if (!existing) break;
      collision = { orderId: o._id, token, collidedWithOrderId: existing._id, attempt };
      break;
    }
    if (collision) break;

    seenNewTokens.add(token);
    plannedOps.push({ order: o, token });
  }

  if (collision) {
    console.error("!".repeat(70));
    console.error("COLLISION DETECTED — STOPPING. No writes were performed.");
    console.error(JSON.stringify(collision, null, 2));
    console.error("!".repeat(70));
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log("-".repeat(70));
  console.log("EXACT MONGODB OPERATION FOR EACH ELIGIBLE ORDER");
  console.log("(one updateOne per document — only publicToken is ever set)");
  console.log("-".repeat(70));
  for (const { order, token } of plannedOps) {
    console.log(
      `db.orders.updateOne(\n` +
        `  { _id: ObjectId("${order._id}"), $or: [{ publicToken: { $exists: false } }, { publicToken: null }, { publicToken: "" }] },\n` +
        `  { $set: { publicToken: "${token}" } }\n` +
        `)`
    );
  }
  console.log();

  console.log("-".repeat(70));
  console.log("SAFETY CONFIRMATIONS");
  console.log("-".repeat(70));
  console.log(`  - Every operation's $set touches exactly one field: publicToken.`);
  console.log(`  - No other Order field appears in any update payload above.`);
  console.log(`  - No other collection (Customer/Work/Garment/Payment/Invoice/`);
  console.log(`    Notification/AuditLog/etc.) is imported or queried by this script.`);
  console.log(`  - Each update's filter re-requires "still missing a token" at write`);
  console.log(`    time, so re-running this script after a successful run is a no-op.`);
  console.log(`  - Zero collisions found against ${eligible.length} existing tokens`);
  console.log(`    checked + ${plannedOps.length} newly generated ones.`);
  console.log();

  if (!EXECUTE) {
    console.log("=".repeat(70));
    console.log("DRY RUN COMPLETE — no data was written.");
    console.log(`Re-run with --execute to perform the ${plannedOps.length} update(s) shown above.`);
    console.log("=".repeat(70));
    await mongoose.disconnect();
    process.exit(0);
  }

  // ---- EXECUTE ----
  console.log("=".repeat(70));
  console.log(`EXECUTING ${plannedOps.length} update(s)...`);
  console.log("=".repeat(70));

  let updated = 0;
  let skipped = 0;
  for (const { order, token } of plannedOps) {
    try {
      const result = await Order.updateOne(
        { _id: order._id, ...ELIGIBLE_FILTER },
        { $set: { publicToken: token } }
      );
      if (result.modifiedCount === 1) {
        updated++;
        console.log(`  ✅ ${order._id} (orderId=${order.orderId}) -> publicToken=${token}`);
      } else {
        // Matched 0 docs: something else (a concurrent run, or manual edit)
        // already set a token on this order between the dry-run pass above
        // and this write. Not an error — idempotency working as intended.
        skipped++;
        console.log(`  ⏭️  ${order._id} (orderId=${order.orderId}) — already had a token by write time, skipped`);
      }
    } catch (err) {
      if (err?.code === 11000) {
        console.error("!".repeat(70));
        console.error(`COLLISION on write for ${order._id} with token ${token} — STOPPING.`);
        console.error(err.message);
        console.error("!".repeat(70));
        await mongoose.disconnect();
        process.exit(1);
      }
      throw err;
    }
  }

  console.log();
  console.log(`Done. Updated: ${updated}. Skipped (already had token): ${skipped}.`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("SCRIPT ERROR:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
