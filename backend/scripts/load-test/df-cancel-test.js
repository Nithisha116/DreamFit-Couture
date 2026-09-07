/**
 * Order-cancellation financial rule.
 *
 *   cancelled AND no work has a real assignments.workerId
 *       -> active payments soft-deleted, their completed income transactions
 *          cancelled, summary recomputed, active balance zeroed
 *   cancelled AND at least one work has a real workerId
 *       -> payments and totals untouched
 *
 * Historical records must survive in BOTH cases: payment rows, ledger rows,
 * garment data and the order's own minPrice/maxPrice/priceSummary.
 *
 * SAFETY: every document is disposable and tagged ZZ-CANCEL-TEST, removed in a
 * finally block, with a baseline count check. No existing record is touched.
 */
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5000";
const TAG = "ZZ-CANCEL-TEST";
const COLLECTIONS = ["orders", "payments", "garments", "works", "customers", "invoices", "transactions"];

let pass = 0, fail = 0;
const check = (n, ok, d = "") => { console.log("  " + (ok ? "PASS" : "FAIL") + "  " + n + (d ? "  -> " + d : "")); ok ? pass++ : fail++; };
const counts = async (db) => { const o = {}; for (const c of COLLECTIONS) o[c] = await db.collection(c).countDocuments(); return o; };

let db, token, adminId, customerId;
const made = { orders: [], works: [], payments: [], transactions: [], garments: [] };

/** Builds an order with optional payments and works, straight into Mongo. */
const seed = async ({ label, payments = [], works = [] }) => {
  const oid = new mongoose.Types.ObjectId();
  const total = 7000;
  const paid = payments.reduce((s, a) => s + a, 0);

  // A real garment must exist: updateOrderPaymentSummary recomputes
  // minPrice/maxPrice from the order's ACTIVE garments. Without one the
  // recompute legitimately yields 0/0, and the "prices preserved" assertion
  // would be testing an artificial order shape rather than production.
  const gid = new mongoose.Types.ObjectId();
  await db.collection("garments").insertOne({
    _id: gid, order: oid, name: TAG + " G-" + label,
    // The live database carries a unique index on garmentId (the schema line
    // is commented out, but the index exists), so it must be set and unique.
    garmentId: "ZZGRM-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
    minPrice: 4000, maxPrice: total,
    priceRange: { min: 4000, max: total },
    isActive: true, status: "pending",
    createdAt: new Date(), updatedAt: new Date(),
  });
  made.garments.push(gid);

  await db.collection("orders").insertOne({
    _id: oid,
    orderId: TAG + "-" + label + "-" + Date.now(),
    customer: customerId,
    deliveryDate: new Date(Date.now() + 7 * 864e5),
    specialNotes: TAG,
    status: "confirmed", isActive: true, isDraftOrder: false,
    createdBy: adminId,
    minPrice: 4000, maxPrice: total,
    priceSummary: { totalMin: 4000, totalMax: total },
    balanceAmount: total - paid, dueAmount: total - paid,
    balanceMin: Math.max(0, 4000 - paid), balanceMax: total - paid,
    paymentSummary: { totalPaid: paid, paymentCount: payments.length, paymentStatus: paid ? "partial" : "pending" },
    garments: [gid], createdAt: new Date(), updatedAt: new Date(),
  });
  made.orders.push(oid);

  for (const amt of payments) {
    const pid = new mongoose.Types.ObjectId();
    await db.collection("payments").insertOne({
      _id: pid, order: oid, customer: customerId, amount: amt,
      type: "advance", method: "cash", paymentDate: new Date(),
      isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    made.payments.push(pid);
    const tid = new mongoose.Types.ObjectId();
    await db.collection("transactions").insertOne({
      _id: tid, type: "income", category: "order-payment", amount: amt,
      order: oid, customer: customerId, status: "completed",
      transactionDate: new Date(), description: TAG,
      metadata: { paymentId: pid, paymentType: "advance", paymentMethod: "cash" },
      createdAt: new Date(), updatedAt: new Date(),
    });
    made.transactions.push(tid);
  }

  for (const w of works) {
    const wid = new mongoose.Types.ObjectId();
    await db.collection("works").insertOne({
      _id: wid, workId: TAG + "-W-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      order: oid, garment: new mongoose.Types.ObjectId(), createdBy: adminId,
      status: w.status || "pending", isActive: true,
      // A real assignment carries workerId. The qr-scanner placeholder does not.
      assignments: w.assigned
        ? [{ stage: "cutting", role: "tailor", workerId: new mongoose.Types.ObjectId(), workerName: TAG + " Worker", status: w.assignStatus || "active", assignedAt: new Date() }]
        : (w.placeholder
          ? [{ stage: "cutting", role: "qr-scanner", workerName: "QR Scanner", status: "completed", assignedAt: new Date() }]
          : []),
      createdAt: new Date(), updatedAt: new Date(),
    });
    made.works.push(wid);
  }
  return oid;
};

const cancel = (oid, reason = "test cancellation") =>
  fetch(BASE_URL + "/api/orders/" + oid + "/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({ status: "cancelled", cancelReason: reason }),
  }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));

const stateOf = async (oid) => {
  const o = await db.collection("orders").findOne({ _id: oid });
  return {
    status: o.status,
    totalPaid: o.paymentSummary?.totalPaid ?? 0,
    paymentCount: o.paymentSummary?.paymentCount ?? 0,
    balanceAmount: o.balanceAmount, dueAmount: o.dueAmount,
    balanceMin: o.balanceMin, balanceMax: o.balanceMax,
    minPrice: o.minPrice, maxPrice: o.maxPrice,
    priceMax: o.priceSummary?.totalMax,
    activePayments: await db.collection("payments").countDocuments({ order: oid, isDeleted: false }),
    allPayments: await db.collection("payments").countDocuments({ order: oid }),
    completedTxn: await db.collection("transactions").countDocuments({ order: oid, status: "completed" }),
    allTxn: await db.collection("transactions").countDocuments({ order: oid }),
  };
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  db = mongoose.connection.db;
  const baseline = await counts(db);
  console.log("Baseline: " + COLLECTIONS.map((c) => c + "=" + baseline[c]).join(" ") + "\n");

  const admin = await db.collection("users").findOne({ role: "ADMIN", isActive: true }, { projection: { _id: 1, name: 1 } });
  adminId = admin._id;
  token = jwt.sign({ id: admin._id, role: "ADMIN", name: admin.name, userType: "admin" }, process.env.JWT_SECRET, { expiresIn: "30m" });

  try {
    const cust = await db.collection("customers").insertOne({
      customerId: TAG + "-" + Date.now(), firstName: TAG, name: TAG + " Cust",
      phone: "0000000004", isActive: false, createdAt: new Date(),
    });
    customerId = cust.insertedId;

    // ---------- Case 1: reversal expected ----------
    const reverted = async (title, seedArgs, expect) => {
      console.log("\n" + title);
      const oid = await seed(seedArgs);
      const r = await cancel(oid);
      const s = await stateOf(oid);
      check("cancelled", r.status === 200 && s.status === "cancelled", "HTTP " + r.status);
      check("totalPaid -> 0", s.totalPaid === 0, String(s.totalPaid));
      check("paymentCount -> 0", s.paymentCount === 0, String(s.paymentCount));
      check("dueAmount -> 0", s.dueAmount === 0, String(s.dueAmount));
      check("balanceAmount -> 0", s.balanceAmount === 0, String(s.balanceAmount));
      check("balanceMin/Max -> 0", s.balanceMin === 0 && s.balanceMax === 0, s.balanceMin + "/" + s.balanceMax);
      check("active payments -> 0", s.activePayments === 0, String(s.activePayments));
      check("payment rows PRESERVED", s.allPayments === expect.payments, s.allPayments + " of " + expect.payments);
      check("completed txns -> 0 (out of revenue)", s.completedTxn === 0, String(s.completedTxn));
      check("txn rows PRESERVED", s.allTxn === expect.payments, s.allTxn + " of " + expect.payments);
      check("minPrice/maxPrice PRESERVED", s.minPrice === 4000 && s.maxPrice === 7000, s.minPrice + "/" + s.maxPrice);
      check("priceSummary PRESERVED", s.priceMax === 7000, String(s.priceMax));
      return oid;
    };

    await reverted("A. No payment, no worker", { label: "nopay", payments: [], works: [{}] }, { payments: 0 });
    await reverted("B. Partial payment, no worker", { label: "partial", payments: [2800], works: [{}] }, { payments: 1 });
    await reverted("C. Full payment, no worker", { label: "full", payments: [7000], works: [{}] }, { payments: 1 });
    await reverted("D. Multiple payments, no worker", { label: "multi", payments: [2500, 300, 1200], works: [{}] }, { payments: 3 });
    await reverted("E. Multiple works, NONE assigned", { label: "multiwork", payments: [2800], works: [{}, {}, {}] }, { payments: 1 });
    await reverted("F. Placeholder qr-scanner assignment only (no real workerId)", { label: "placeholder", payments: [2800], works: [{ placeholder: true }] }, { payments: 1 });

    // ---------- Case 2: payment must be kept ----------
    const kept = async (title, seedArgs) => {
      console.log("\n" + title);
      const oid = await seed(seedArgs);
      const before = await stateOf(oid);
      const r = await cancel(oid);
      const s = await stateOf(oid);
      check("cancelled", r.status === 200 && s.status === "cancelled", "HTTP " + r.status);
      check("totalPaid UNCHANGED", s.totalPaid === before.totalPaid, before.totalPaid + " -> " + s.totalPaid);
      check("dueAmount UNCHANGED", s.dueAmount === before.dueAmount, before.dueAmount + " -> " + s.dueAmount);
      check("active payments UNCHANGED", s.activePayments === before.activePayments, before.activePayments + " -> " + s.activePayments);
      check("completed txns UNCHANGED", s.completedTxn === before.completedTxn, before.completedTxn + " -> " + s.completedTxn);
      return oid;
    };

    await kept("G. One worker assigned", { label: "assigned", payments: [2800], works: [{ assigned: true }] });
    await kept("H. Multiple works, ONE assigned", { label: "mixedwork", payments: [2800], works: [{}, { assigned: true }, {}] });
    await kept("I. Completed work with assignment", { label: "done", payments: [2800], works: [{ assigned: true, assignStatus: "completed", status: "ready-to-deliver" }] });

    // ---------- Idempotency ----------
    console.log("\nJ. Already-cancelled order (no double reversal)");
    const oid = await seed({ label: "twice", payments: [2800], works: [{}] });
    await cancel(oid);
    const afterFirst = await stateOf(oid);
    const second = await cancel(oid);
    const afterSecond = await stateOf(oid);
    check("second cancel rejected", second.status >= 400, "HTTP " + second.status);
    check("totalPaid still 0", afterSecond.totalPaid === 0, String(afterSecond.totalPaid));
    check("payment rows unchanged by retry", afterSecond.allPayments === afterFirst.allPayments,
      afterFirst.allPayments + " -> " + afterSecond.allPayments);
    check("txn rows unchanged by retry", afterSecond.allTxn === afterFirst.allTxn,
      afterFirst.allTxn + " -> " + afterSecond.allTxn);

    // ---------- Backward compatibility of the shared function ----------
    console.log("\nK. updateOrderPaymentSummary still works without a session");
    const { updateOrderPaymentSummary } = await import("../../controllers/order.controller.js");
    const plain = await seed({ label: "nosession", payments: [1000], works: [{ assigned: true }] });
    const res = await updateOrderPaymentSummary(plain);
    const ps = await stateOf(plain);
    check("returns success with no session arg", res?.success === true, JSON.stringify(res));
    check("totalPaid recomputed", ps.totalPaid === 1000, String(ps.totalPaid));
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
    await db.collection("works").deleteMany({ workId: new RegExp("^" + TAG) });
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
