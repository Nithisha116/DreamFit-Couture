/**
 * DF-003 (idempotency portion) verification.
 *
 * SAFETY
 *   - Creates one disposable Customer and a handful of disposable Orders,
 *     all tagged ZZ-DF003-TEST, and deletes everything in a finally block.
 *   - Touches no existing Order, Payment, Garment or Work. The 13 known
 *     garment-less orders and their payments are never read-modify-written.
 *   - Baseline collection counts are captured up front and re-checked at the
 *     end, so any stray document shows up immediately.
 *
 * Requires the server running. Auth token is minted locally from an existing
 * ADMIN account (read-only, same approach as the DF-002 suite).
 */
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5000";
const TAG = "ZZ-DF003-TEST";
const COLLECTIONS = ["orders", "payments", "garments", "works", "customers", "invoices", "transactions"];

let pass = 0;
let fail = 0;
const check = (name, ok, detail = "") => {
  console.log("  " + (ok ? "PASS" : "FAIL") + "  " + name + (detail ? "  -> " + detail : ""));
  ok ? pass++ : fail++;
};

const counts = async (db) => {
  const out = {};
  for (const c of COLLECTIONS) out[c] = await db.collection(c).countDocuments();
  return out;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const Order = (await import("../../models/Order.js")).default;

  const baseline = await counts(db);
  console.log("Baseline: " + COLLECTIONS.map((c) => c + "=" + baseline[c]).join("  "));

  // Local token for an existing ADMIN. Read-only: signs a JWT, changes nothing.
  const admin = await db.collection("users").findOne({ role: "ADMIN", isActive: true },
    { projection: { _id: 1, name: 1 } });
  if (!admin) throw new Error("No active ADMIN to mint a token from");
  const token = jwt.sign(
    { id: admin._id, role: "ADMIN", name: admin.name, userType: "admin" },
    process.env.JWT_SECRET, { expiresIn: "15m" }
  );

  const createdOrderIds = [];
  let customerId = null;

  const postOrder = async (requestId) => {
    const res = await fetch(BASE_URL + "/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        customer: String(customerId),
        deliveryDate: new Date(Date.now() + 7 * 864e5).toISOString(),
        specialNotes: TAG,
        garments: [],
        payments: [],
        requestId,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (body?.order?._id) createdOrderIds.push(new mongoose.Types.ObjectId(body.order._id));
    return { status: res.status, body };
  };

  try {
    // Disposable customer so no real customer record is involved at all.
    const cust = await db.collection("customers").insertOne({
      customerId: TAG + "-" + Date.now(),
      firstName: TAG, lastName: "Customer",
      name: TAG + " Customer",
      phone: "0000000000", isActive: false, createdAt: new Date(),
    });
    customerId = cust.insertedId;

    // ---- index present ---------------------------------------------------
    console.log("\nIndex");
    await Order.syncIndexes();
    const idx = await db.collection("orders").indexes();
    const target = idx.find((i) => i.name === "metadata_requestId_unique");
    check("partial unique index exists", !!target);
    check("index is unique", target?.unique === true);
    check("index is partial on string only",
      JSON.stringify(target?.partialFilterExpression) === JSON.stringify({ "metadata.requestId": { $type: "string" } }),
      JSON.stringify(target?.partialFilterExpression));

    // ---- A. normal order --------------------------------------------------
    console.log("\nA. Normal order");
    const reqA = TAG + "-A-" + Date.now();
    const a = await postOrder(reqA);
    check("order created", a.status === 201, "HTTP " + a.status + " " + (a.body.message || ""));
    const persisted = await db.collection("orders").findOne({ "metadata.requestId": reqA });
    check("requestId PERSISTED (the actual DF-003 fix)", !!persisted,
      persisted ? "metadata.requestId = " + persisted.metadata.requestId : "still dropped");

    // ---- B. sequential duplicate -----------------------------------------
    console.log("\nB. Sequential duplicate (same requestId again)");
    const b = await postOrder(reqA);
    const nA = await db.collection("orders").countDocuments({ "metadata.requestId": reqA });
    check("second submit returns duplicate", b.body.duplicate === true,
      "HTTP " + b.status + " duplicate=" + b.body.duplicate);
    check("still exactly ONE order for that requestId", nA === 1, "count=" + nA);
    check("same order returned", b.body.order?._id === a.body.order?._id);

    // ---- C. concurrent duplicate -----------------------------------------
    console.log("\nC. Concurrent duplicate (two at once, same requestId)");
    const reqC = TAG + "-C-" + Date.now();
    const [c1, c2] = await Promise.all([postOrder(reqC), postOrder(reqC)]);
    const nC = await db.collection("orders").countDocuments({ "metadata.requestId": reqC });
    check("exactly ONE order created", nC === 1, "count=" + nC);
    const oks = [c1, c2].filter((r) => r.status === 201).length;
    const dups = [c1, c2].filter((r) => r.body.duplicate === true).length;
    check("one created + one deduped", oks === 1 && dups === 1,
      "created=" + oks + " duplicate=" + dups +
      " statuses=" + [c1.status, c2.status].join("/"));
    check("neither request errored", ![c1.status, c2.status].includes(500),
      [c1.status, c2.status].join("/"));

    // ---- D. different requestIds MUST create different orders -------------
    console.log("\nD. Different requestIds (must NOT be deduped)");
    const d1 = await postOrder(TAG + "-D1-" + Date.now());
    const d2 = await postOrder(TAG + "-D2-" + Date.now());
    check("first created", d1.status === 201, "HTTP " + d1.status);
    check("second created", d2.status === 201, "HTTP " + d2.status);
    check("two DISTINCT orders", d1.body.order?._id !== d2.body.order?._id);

    // ---- E. no requestId at all still works (backward compatible) ---------
    console.log("\nE. Orders without a requestId (index must not block them)");
    const e1 = await postOrder(undefined);
    const e2 = await postOrder(undefined);
    check("first no-requestId order created", e1.status === 201, "HTTP " + e1.status);
    check("second no-requestId order also created", e2.status === 201,
      "HTTP " + e2.status + " " + (e2.body.message || ""));
    check("they are distinct orders", e1.body.order?._id !== e2.body.order?._id);
  } finally {
    // ---- cleanup ---------------------------------------------------------
    console.log("\nCleanup");
    let removed = { orders: 0, payments: 0, garments: 0, works: 0, customers: 0 };
    if (createdOrderIds.length) {
      removed.works = (await db.collection("works").deleteMany({ order: { $in: createdOrderIds } })).deletedCount;
      removed.garments = (await db.collection("garments").deleteMany({ order: { $in: createdOrderIds } })).deletedCount;
      removed.payments = (await db.collection("payments").deleteMany({ order: { $in: createdOrderIds } })).deletedCount;
      removed.orders = (await db.collection("orders").deleteMany({ _id: { $in: createdOrderIds } })).deletedCount;
    }
    // Catch anything tagged that slipped through (e.g. a 500 that still wrote).
    removed.orders += (await db.collection("orders").deleteMany({ specialNotes: TAG })).deletedCount;
    if (customerId) {
      removed.customers = (await db.collection("customers").deleteMany({ _id: customerId })).deletedCount;
    }
    await db.collection("invoices").deleteMany({ order: { $in: createdOrderIds } });
    console.log("  removed: " + Object.entries(removed).map(([k, v]) => k + "=" + v).join("  "));

    const after = await counts(db);
    const drift = COLLECTIONS.filter((c) => after[c] !== baseline[c]);
    console.log("  final  : " + COLLECTIONS.map((c) => c + "=" + after[c]).join("  "));
    if (drift.length) {
      console.log("  !! DRIFT vs baseline: " +
        drift.map((c) => c + " " + baseline[c] + "->" + after[c]).join(", "));
      fail++;
    } else {
      console.log("  no drift - every collection back to baseline");
      pass++;
    }
  }

  console.log("\n" + "-".repeat(60));
  console.log("PASS " + pass + "   FAIL " + fail);
  await mongoose.disconnect();
  process.exit(fail === 0 ? 0 : 1);
};

run().catch(async (e) => {
  console.error("Test error:", e.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
