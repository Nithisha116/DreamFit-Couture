/**
 * DF-003 Phase 2 — transaction rollback + convertDraft recovery.
 *
 * SAFETY
 *   - Disposable customer + disposable orders/drafts, all tagged
 *     ZZ-DF003-P2-TEST, removed in a finally block.
 *   - Existing catalogue rows (category/item) are only REFERENCED, never
 *     modified. The 13 known garment-less orders are never touched.
 *   - Every collection is counted before and after; any drift fails the run.
 *
 * Failures are injected through payloads that break at a chosen stage, so no
 * production code carries a test-only hook.
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
const COLLECTIONS = ["orders", "payments", "garments", "works", "customers", "invoices", "transactions", "notifications"];

let pass = 0, fail = 0;
const check = (n, ok, d = "") => { console.log("  " + (ok ? "PASS" : "FAIL") + "  " + n + (d ? "  -> " + d : "")); ok ? pass++ : fail++; };

const counts = async (db) => { const o = {}; for (const c of COLLECTIONS) o[c] = await db.collection(c).countDocuments(); return o; };

let CAT = null, ITEM = null, customerId = null, token = null;
const runStart = new Date();

const goodGarment = (i) => ({
  name: TAG + " G" + i, garmentType: "blouse",
  category: String(CAT), item: String(ITEM),
  categoryName: "Test", itemName: "Test Item",
  minPrice: 500, maxPrice: 800, fabricPrice: 0,
  measurements: [], measurementSource: "template", priority: "normal",
});
// category/item omitted -> Garment validation fails ("Category is required")
const badGarment = (i) => ({ name: TAG + " BAD" + i, minPrice: 500, maxPrice: 800 });

const postOrder = async (body) => {
  const res = await fetch(BASE_URL + "/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({
      customer: String(customerId),
      deliveryDate: new Date(Date.now() + 7 * 864e5).toISOString(),
      specialNotes: TAG, ...body,
    }),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};

// Everything this run left behind, regardless of what the API reported.
const footprint = async (db) => ({
  orders: await db.collection("orders").countDocuments({ specialNotes: TAG }),
  garments: await db.collection("garments").countDocuments({ name: new RegExp("^" + TAG) }),
  payments: await db.collection("payments").countDocuments({ createdAt: { $gte: runStart }, amount: 777 }),
});

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const baseline = await counts(db);
  console.log("Baseline: " + COLLECTIONS.map((c) => c + "=" + baseline[c]).join(" ") + "\n");

  CAT = (await db.collection("categories").findOne({}, { projection: { _id: 1 } }))?._id;
  ITEM = (await db.collection("items").findOne({}, { projection: { _id: 1 } }))?._id;
  const admin = await db.collection("users").findOne({ role: "ADMIN", isActive: true }, { projection: { _id: 1, name: 1 } });
  token = jwt.sign({ id: admin._id, role: "ADMIN", name: admin.name, userType: "admin" }, process.env.JWT_SECRET, { expiresIn: "30m" });

  const draftIds = [];

  try {
    const cust = await db.collection("customers").insertOne({
      customerId: TAG + "-" + Date.now(), firstName: TAG, name: TAG + " Cust",
      phone: "0000000002", isActive: false, createdAt: new Date(),
    });
    customerId = cust.insertedId;

    // ---- A. normal order still works -----------------------------------
    console.log("A. Normal order (regression)");
    const a = await postOrder({ garments: [goodGarment(0)], payments: [{ amount: 777, method: "cash", type: "advance" }], requestId: TAG + "-A-" + Date.now() });
    check("created", a.status === 201, "HTTP " + a.status);
    if (a.body.order?._id) {
      const oid = new mongoose.Types.ObjectId(a.body.order._id);
      check("1 garment persisted", await db.collection("garments").countDocuments({ order: oid }) === 1);
      check("1 payment persisted", await db.collection("payments").countDocuments({ order: oid }) === 1);
      check("1 work persisted", await db.collection("works").countDocuments({ order: oid }) === 1);
    }

    // ---- E. rollback at three injection points --------------------------
    const rollbackCase = async (label, body) => {
      const before = await footprint(db);
      const r = await postOrder(body);
      const after = await footprint(db);
      check(label + ": rejected", r.status >= 400, "HTTP " + r.status);
      check(label + ": no orphan Order", after.orders === before.orders,
        before.orders + " -> " + after.orders);
      check(label + ": no orphan Garment", after.garments === before.garments,
        before.garments + " -> " + after.garments);
      check(label + ": no orphan Payment", after.payments === before.payments,
        before.payments + " -> " + after.payments);
    };

    console.log("\nE1. Failure AFTER Order creation (bad garment, no payments)");
    await rollbackCase("E1", { garments: [badGarment(0)], payments: [], requestId: TAG + "-E1-" + Date.now() });

    console.log("\nE2. Failure AFTER Order + Payment creation");
    await rollbackCase("E2", { garments: [badGarment(0)], payments: [{ amount: 777, method: "cash", type: "advance" }], requestId: TAG + "-E2-" + Date.now() });

    console.log("\nE3. Failure MID garment loop (garment 1 ok, garment 2 bad)");
    await rollbackCase("E3", { garments: [goodGarment(1), badGarment(2)], payments: [{ amount: 777, method: "cash", type: "advance" }], requestId: TAG + "-E3-" + Date.now() });

    // ---- convertDraft ----------------------------------------------------
    const makeDraft = async (suffix) => {
      const r = await db.collection("orders").insertOne({
        orderId: TAG + "-D-" + Date.now() + "-" + suffix,
        customer: customerId,
        deliveryDate: new Date(Date.now() + 7 * 864e5),
        specialNotes: TAG,
        isDraftOrder: true, isActive: true, status: "draft",
        garments: [], createdBy: admin._id,
        draftData: { snapshot: "RECOVERY-DATA-" + suffix },
        createdAt: new Date(), updatedAt: new Date(),
      });
      draftIds.push(r.insertedId);
      return r.insertedId;
    };
    const convert = (id, garments) => fetch(BASE_URL + "/api/orders/drafts/" + id + "/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        customer: String(customerId),
        deliveryDate: new Date(Date.now() + 7 * 864e5).toISOString(),
        specialNotes: TAG, garments, payments: [],
      }),
    }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));

    console.log("\nF. convertDraft success");
    const dF = await makeDraft("F");
    const rF = await convert(dF, [goodGarment(9)]);
    const docF = await db.collection("orders").findOne({ _id: dF });
    check("converted", rF.status === 201, "HTTP " + rF.status + " " + (rF.body.message || ""));
    check("isDraftOrder now false", docF?.isDraftOrder === false, String(docF?.isDraftOrder));
    check("draftData cleared AFTER success", docF?.draftData === undefined || docF?.draftData === null,
      JSON.stringify(docF?.draftData));

    console.log("\nH. convertDraft FAILURE keeps the draft recoverable");
    const dH = await makeDraft("H");
    const rH = await convert(dH, [badGarment(9)]);
    const docH = await db.collection("orders").findOne({ _id: dH });
    check("conversion rejected", rH.status >= 400, "HTTP " + rH.status);
    check("draftData STILL PRESENT", !!docH?.draftData,
      docH?.draftData ? JSON.stringify(docH.draftData) : "DESTROYED");
    check("isDraftOrder restored to true", docH?.isDraftOrder === true, String(docH?.isDraftOrder));

    console.log("\nG. convertDraft concurrent (atomic claim must still hold)");
    const dG = await makeDraft("G");
    const [g1, g2] = await Promise.all([convert(dG, [goodGarment(8)]), convert(dG, [goodGarment(8)])]);
    const okG = [g1, g2].filter((r) => r.status === 201).length;
    const rejG = [g1, g2].filter((r) => r.status >= 400).length;
    check("exactly one conversion succeeded", okG === 1 && rejG === 1,
      "statuses=" + [g1.status, g2.status].join("/"));
    const gCount = await db.collection("garments").countDocuments({ order: dG });
    check("garments created once, not twice", gCount <= 1, "garments=" + gCount);
  } finally {
    console.log("\nCleanup");
    const ords = await db.collection("orders").find({ specialNotes: TAG }, { projection: { _id: 1 } }).toArray();
    const oids = ords.map((o) => o._id).concat(draftIds);
    if (oids.length) {
      await db.collection("works").deleteMany({ order: { $in: oids } });
      await db.collection("garments").deleteMany({ order: { $in: oids } });
      await db.collection("payments").deleteMany({ order: { $in: oids } });
      await db.collection("transactions").deleteMany({ order: { $in: oids } });
      await db.collection("invoices").deleteMany({ order: { $in: oids } });
      await db.collection("notifications").deleteMany({ "reference.orderId": { $in: oids } });
      await db.collection("orders").deleteMany({ _id: { $in: oids } });
    }
    await db.collection("garments").deleteMany({ name: new RegExp("^" + TAG) });
    if (customerId) await db.collection("customers").deleteMany({ _id: customerId });

    const strays = [];
    for (const p of await db.collection("payments").find({ createdAt: { $gte: runStart } }).toArray()) {
      if ((await db.collection("orders").countDocuments({ _id: p.order })) === 0) strays.push(p._id);
    }
    if (strays.length) {
      await db.collection("transactions").deleteMany({ "metadata.paymentId": { $in: strays } });
      await db.collection("payments").deleteMany({ _id: { $in: strays } });
      console.log("  orphan sweep removed " + strays.length + " payment(s)");
    }
    for (const t of await db.collection("transactions").find({ createdAt: { $gte: runStart } }).toArray()) {
      if (t.order && (await db.collection("orders").countDocuments({ _id: t.order })) === 0) {
        await db.collection("transactions").deleteOne({ _id: t._id });
      }
    }

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
