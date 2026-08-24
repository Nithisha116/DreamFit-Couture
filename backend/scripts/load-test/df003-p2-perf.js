/**
 * DF-003 Phase 2 — order-creation latency at 1 / 3 / 5 garments.
 *
 * Run once BEFORE the transaction change and once AFTER, to compare.
 *   node scripts/load-test/df003-p2-perf.js before
 *   node scripts/load-test/df003-p2-perf.js after
 *
 * SAFETY: one disposable customer + disposable orders tagged ZZ-DF003-P2-TEST,
 * all deleted in a finally block, with a baseline/after count comparison.
 * No existing record is read-modify-written.
 */
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5000";
const TAG = "ZZ-DF003-P2-TEST";
const LABEL = process.argv[2] || "run";
const COLLECTIONS = ["orders", "payments", "garments", "works", "customers", "invoices", "transactions", "notifications"];
const REPEATS = 3;

const counts = async (db) => {
  const o = {};
  for (const c of COLLECTIONS) o[c] = await db.collection(c).countDocuments();
  return o;
};

// category/item are REQUIRED refs on Garment. We point at existing catalogue
// rows - referencing them stores an id on the disposable garment and never
// modifies the Category/Item documents themselves.
let CATEGORY_ID = null;
let ITEM_ID = null;

const garment = (i) => ({
  name: TAG + " Garment " + i,
  garmentType: "blouse",
  category: String(CATEGORY_ID),
  item: String(ITEM_ID),
  categoryName: "Test",
  itemName: "Test Item",
  minPrice: 500,
  maxPrice: 800,
  fabricPrice: 0,
  additionalCharges: 0,
  measurements: [],
  measurementSource: "template",
  priority: "normal",
});

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const baseline = await counts(db);

  const admin = await db.collection("users").findOne({ role: "ADMIN", isActive: true }, { projection: { _id: 1, name: 1 } });
  const token = jwt.sign({ id: admin._id, role: "ADMIN", name: admin.name, userType: "admin" },
    process.env.JWT_SECRET, { expiresIn: "30m" });

  const createdOrderIds = [];
  let customerId = null;
  const runStart = new Date();

  CATEGORY_ID = (await db.collection("categories").findOne({}, { projection: { _id: 1 } }))?._id;
  ITEM_ID = (await db.collection("items").findOne({}, { projection: { _id: 1 } }))?._id;
  if (!CATEGORY_ID || !ITEM_ID) throw new Error("No category/item to reference");

  try {
    const cust = await db.collection("customers").insertOne({
      customerId: TAG + "-" + Date.now(), firstName: TAG, lastName: "Perf",
      name: TAG + " Perf", phone: "0000000001", isActive: false, createdAt: new Date(),
    });
    customerId = cust.insertedId;

    console.log("ORDER CREATION LATENCY  [" + LABEL + "]   (" + REPEATS + " runs per size, median reported)\n");
    console.log("  Garments   median ms    min ms    max ms   status");
    console.log("  " + "-".repeat(52));

    const results = {};
    for (const n of [1, 3, 5]) {
      const times = [];
      let lastStatus = 0;
      for (let r = 0; r < REPEATS; r++) {
        const body = {
          customer: String(customerId),
          deliveryDate: new Date(Date.now() + 7 * 864e5).toISOString(),
          specialNotes: TAG,
          garments: Array.from({ length: n }, (_, i) => garment(i)),
          payments: [{ amount: 100, method: "cash", type: "advance" }],
          requestId: TAG + "-perf-" + n + "-" + r + "-" + Date.now(),
        };
        const t0 = process.hrtime.bigint();
        const res = await fetch(BASE_URL + "/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify(body),
        });
        const ms = Number(process.hrtime.bigint() - t0) / 1e6;
        const j = await res.json().catch(() => ({}));
        lastStatus = res.status;
        if (j?.order?._id) createdOrderIds.push(new mongoose.Types.ObjectId(j.order._id));
        if (res.status === 201) times.push(ms);
      }
      const sorted = [...times].sort((a, b) => a - b);
      const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : NaN;
      results[n] = median;
      console.log(
        "  " + String(n).padStart(8) +
        String(times.length ? median.toFixed(0) : "n/a").padStart(12) +
        String(times.length ? Math.min(...times).toFixed(0) : "n/a").padStart(10) +
        String(times.length ? Math.max(...times).toFixed(0) : "n/a").padStart(10) +
        "   HTTP " + lastStatus + (times.length ? "" : "  (no successful runs)")
      );
    }
    console.log("\n  RESULT_JSON " + LABEL + " " + JSON.stringify(results));
  } finally {
    console.log("\nCleanup");
    // A request can fail AFTER the Order was committed (that is the very bug
    // under test), in which case the response carried no _id. Sweep by tag
    // first so those orders and their children are still collected.
    for (const o of await db.collection("orders")
      .find({ specialNotes: TAG }, { projection: { _id: 1 } }).toArray()) {
      if (!createdOrderIds.some((id) => id.equals(o._id))) createdOrderIds.push(o._id);
    }
    if (createdOrderIds.length) {
      await db.collection("works").deleteMany({ order: { $in: createdOrderIds } });
      await db.collection("garments").deleteMany({ order: { $in: createdOrderIds } });
      await db.collection("payments").deleteMany({ order: { $in: createdOrderIds } });
      await db.collection("invoices").deleteMany({ order: { $in: createdOrderIds } });
      // Transactions carry a top-level `order`, not metadata.orderId.
      await db.collection("transactions").deleteMany({ order: { $in: createdOrderIds } });
      await db.collection("notifications").deleteMany({ "reference.orderId": { $in: createdOrderIds } });
      await db.collection("orders").deleteMany({ _id: { $in: createdOrderIds } });
    }
    await db.collection("orders").deleteMany({ specialNotes: TAG });
    await db.collection("garments").deleteMany({ name: new RegExp("^" + TAG) });
    if (customerId) await db.collection("customers").deleteMany({ _id: customerId });

    // Final safety net: any Payment/Transaction this run created whose parent
    // Order no longer exists. Scoped to this run's own time window so nothing
    // pre-existing can be caught.
    const strays = [];
    for (const p of await db.collection("payments").find({ createdAt: { $gte: runStart } }).toArray()) {
      if ((await db.collection("orders").countDocuments({ _id: p.order })) === 0) strays.push(p._id);
    }
    if (strays.length) {
      const t = await db.collection("transactions").deleteMany({ "metadata.paymentId": { $in: strays } });
      const p = await db.collection("payments").deleteMany({ _id: { $in: strays } });
      console.log("  orphan sweep: payments=" + p.deletedCount + " transactions=" + t.deletedCount);
    }

    const after = await counts(db);
    const drift = COLLECTIONS.filter((c) => after[c] !== baseline[c]);
    console.log("  baseline: " + COLLECTIONS.map((c) => c + "=" + baseline[c]).join(" "));
    console.log("  final   : " + COLLECTIONS.map((c) => c + "=" + after[c]).join(" "));
    console.log(drift.length
      ? "  !! DRIFT: " + drift.map((c) => c + " " + baseline[c] + "->" + after[c]).join(", ")
      : "  no drift");
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (e) => {
  console.error("Perf run error:", e.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
