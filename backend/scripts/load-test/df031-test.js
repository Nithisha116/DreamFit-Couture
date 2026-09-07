/**
 * DF-031 — a cancelled order must not accept further payments.
 *
 * Without the guard, POST /api/orders/:id/payments on a cancelled order calls
 * updateOrderPaymentSummary and recomputes a live balance over the zeroed
 * financial state the cancellation flow produced, silently undoing it.
 *
 * SAFETY: disposable records tagged ZZ-DF031-TEST, removed in a finally block,
 * with a baseline count check. No existing record is touched.
 */
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5000";
const TAG = "ZZ-DF031-TEST";
const COLLECTIONS = ["orders", "payments", "garments", "works", "customers", "invoices", "transactions"];

let pass = 0, fail = 0;
const check = (n, ok, d = "") => { console.log("  " + (ok ? "PASS" : "FAIL") + "  " + n + (d ? "  -> " + d : "")); ok ? pass++ : fail++; };
const counts = async (db) => { const o = {}; for (const c of COLLECTIONS) o[c] = await db.collection(c).countDocuments(); return o; };

let db, token, adminId, customerId;
const made = { orders: [], garments: [] };

const seed = async (label, status = "confirmed") => {
  const oid = new mongoose.Types.ObjectId();
  const gid = new mongoose.Types.ObjectId();
  await db.collection("garments").insertOne({
    _id: gid, order: oid, name: TAG + " G-" + label,
    // Live DB carries a unique index on garmentId even though the schema line
    // is commented out, so it must be set and unique.
    garmentId: "ZZ031-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
    minPrice: 4000, maxPrice: 7000, priceRange: { min: 4000, max: 7000 },
    isActive: true, status: "pending", createdAt: new Date(), updatedAt: new Date(),
  });
  made.garments.push(gid);
  await db.collection("orders").insertOne({
    _id: oid, orderId: TAG + "-" + label + "-" + Date.now(),
    customer: customerId, deliveryDate: new Date(Date.now() + 7 * 864e5),
    specialNotes: TAG, status, isActive: true, isDraftOrder: false,
    createdBy: adminId, minPrice: 4000, maxPrice: 7000,
    priceSummary: { totalMin: 4000, totalMax: 7000 },
    balanceAmount: 0, dueAmount: 0, balanceMin: 0, balanceMax: 0,
    paymentSummary: { totalPaid: 0, paymentCount: 0, paymentStatus: "pending" },
    garments: [gid], createdAt: new Date(), updatedAt: new Date(),
  });
  made.orders.push(oid);
  return oid;
};

const addPayment = (oid, amount) =>
  fetch(BASE_URL + "/api/orders/" + oid + "/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({ amount, type: "advance", method: "cash", notes: TAG }),
  }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));

const stateOf = async (oid) => {
  const o = await db.collection("orders").findOne({ _id: oid });
  return {
    status: o.status,
    totalPaid: o.paymentSummary?.totalPaid ?? 0,
    paymentCount: o.paymentSummary?.paymentCount ?? 0,
    balanceAmount: o.balanceAmount, dueAmount: o.dueAmount,
    payments: await db.collection("payments").countDocuments({ order: oid }),
    txns: await db.collection("transactions").countDocuments({ order: oid }),
  };
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  db = mongoose.connection.db;
  const baseline = await counts(db);
  console.log("Baseline: " + COLLECTIONS.map((c) => c + "=" + baseline[c]).join(" ") + "\n");

  const admin = await db.collection("users").findOne({ role: "ADMIN", isActive: true }, { projection: { _id: 1, name: 1 } });
  adminId = admin._id;
  token = jwt.sign({ id: admin._id, role: "ADMIN", name: admin.name, userType: "admin" }, process.env.JWT_SECRET, { expiresIn: "20m" });

  try {
    const cust = await db.collection("customers").insertOne({
      customerId: TAG + "-" + Date.now(), firstName: TAG, name: TAG + " Cust",
      phone: "0000000005", isActive: false, createdAt: new Date(),
    });
    customerId = cust.insertedId;

    // ---- 1. active order completes the payment flow ----------------------
    console.log("1. Active order -> payment completes successfully");
    const active = await seed("active", "confirmed");
    const r1 = await addPayment(active, 900);
    const s1 = await stateOf(active);
    check("accepted", r1.status === 201, "HTTP " + r1.status + " " + (r1.body.message || ""));
    check("not blocked by the cancelled-order guard", r1.status !== 400, "HTTP " + r1.status);
    check("Payment document created", s1.payments === 1, String(s1.payments));
    check("totalPaid updated to 900", s1.totalPaid === 900, String(s1.totalPaid));
    check("paymentCount updated to 1", s1.paymentCount === 1, String(s1.paymentCount));
    // calculateRangeTotals feeds these two fields; a non-null value proves the
    // previously-missing import is genuinely wired up, not merely not throwing.
    const pdoc = await db.collection("payments").findOne({ order: active });
    check("balanceMinAfterPayment computed", typeof pdoc?.balanceMinAfterPayment === "number",
      String(pdoc?.balanceMinAfterPayment));
    check("balanceMaxAfterPayment computed", typeof pdoc?.balanceMaxAfterPayment === "number",
      String(pdoc?.balanceMaxAfterPayment));
    check("income Transaction created", s1.txns === 1, String(s1.txns));

    // ---- 2-5. cancelled order rejects -----------------------------------
    console.log("\n2. Cancelled order -> payment rejected, nothing written");
    const cancelled = await seed("cancelled", "cancelled");
    const before = await stateOf(cancelled);
    const r2 = await addPayment(cancelled, 900);
    const after = await stateOf(cancelled);
    check("rejected with 400", r2.status === 400, "HTTP " + r2.status);
    check("message explains why", /cancelled/i.test(r2.body.message || ""), JSON.stringify(r2.body.message));
    check("no Payment document created", after.payments === before.payments,
      before.payments + " -> " + after.payments);
    check("no Transaction created/modified", after.txns === before.txns,
      before.txns + " -> " + after.txns);
    check("totalPaid unchanged", after.totalPaid === before.totalPaid,
      before.totalPaid + " -> " + after.totalPaid);
    check("balanceAmount still 0", after.balanceAmount === 0, String(after.balanceAmount));
    check("dueAmount still 0", after.dueAmount === 0, String(after.dueAmount));
    check("paymentCount unchanged", after.paymentCount === before.paymentCount,
      before.paymentCount + " -> " + after.paymentCount);

    // ---- 6. every other status still behaves as before -------------------
    console.log("\n3. Other statuses unaffected");
    // Only 'cancelled' may be blocked by the guard. Every other status must
    // still complete the payment flow exactly as before.
    for (const st of ["confirmed", "in-progress", "stitching", "ready-to-delivery", "delivered"]) {
      const oid = await seed("st-" + st, st);
      const r = await addPayment(oid, 500);
      const s = await stateOf(oid);
      check(st.padEnd(18) + " accepts payment", r.status === 201 && s.payments === 1 && s.totalPaid === 500,
        "HTTP " + r.status + " payments=" + s.payments + " totalPaid=" + s.totalPaid);
    }
  } finally {
    console.log("\nCleanup");
    const oids = (await db.collection("orders").find({ specialNotes: TAG }, { projection: { _id: 1 } }).toArray()).map((o) => o._id);
    const all = [...new Set([...made.orders.map(String), ...oids.map(String)])].map((s) => new mongoose.Types.ObjectId(s));
    if (all.length) {
      await db.collection("works").deleteMany({ order: { $in: all } });
      await db.collection("garments").deleteMany({ order: { $in: all } });
      await db.collection("payments").deleteMany({ order: { $in: all } });
      await db.collection("transactions").deleteMany({ order: { $in: all } });
      await db.collection("invoices").deleteMany({ order: { $in: all } });
      await db.collection("notifications").deleteMany({ "reference.orderId": { $in: all } });
      await db.collection("orders").deleteMany({ _id: { $in: all } });
    }
    await db.collection("garments").deleteMany({ name: new RegExp("^" + TAG) });
    if (customerId) await db.collection("customers").deleteMany({ _id: customerId });

    const after = await counts(db);
    const drift = COLLECTIONS.filter((c) => after[c] !== baseline[c]);
    console.log("  final: " + COLLECTIONS.map((c) => c + "=" + after[c]).join(" "));
    if (drift.length) { console.log("  !! DRIFT: " + drift.map((c) => c + " " + baseline[c] + "->" + after[c]).join(", ")); fail++; }
    else { console.log("  no drift"); pass++; }
  }

  console.log("\n" + "-".repeat(60));
  console.log("PASS " + pass + "   FAIL " + fail);
  await mongoose.disconnect();
  process.exit(fail === 0 ? 0 : 1);
};

run().catch(async (e) => { console.error("Test error:", e.message); try { await mongoose.disconnect(); } catch {} process.exit(1); });
