/**
 * DF-003 Phase 2 — the multipart/R2 path.
 *
 * This is the branch the transaction refactor actually moved: image uploads
 * used to run inside the garment loop using order._id, and now run BEFORE the
 * transaction using a pre-generated id. Every other suite sent plain JSON with
 * no files, so that branch was never executed. This exercises it.
 *
 * SAFETY: disposable customer + orders tagged ZZ-DF003-UP-TEST, deleted in a
 * finally block, plus R2 objects removed via r2Service.deleteFile so nothing
 * is left in the bucket. Baseline counts checked at the end.
 */
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import r2Service from "../../services/r2.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5000";
const TAG = "ZZ-DF003-UP-TEST";
const COLLECTIONS = ["orders", "payments", "garments", "works", "customers", "invoices", "transactions"];

let pass = 0, fail = 0;
const check = (n, ok, d = "") => { console.log("  " + (ok ? "PASS" : "FAIL") + "  " + n + (d ? "  -> " + d : "")); ok ? pass++ : fail++; };
const counts = async (db) => { const o = {}; for (const c of COLLECTIONS) o[c] = await db.collection(c).countDocuments(); return o; };

// Smallest valid PNG (1x1, transparent).
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const baseline = await counts(db);
  console.log("Baseline: " + COLLECTIONS.map((c) => c + "=" + baseline[c]).join(" ") + "\n");

  const CAT = (await db.collection("categories").findOne({}, { projection: { _id: 1 } }))?._id;
  const ITEM = (await db.collection("items").findOne({}, { projection: { _id: 1 } }))?._id;
  const admin = await db.collection("users").findOne({ role: "ADMIN", isActive: true }, { projection: { _id: 1, name: 1 } });
  const token = jwt.sign({ id: admin._id, role: "ADMIN", name: admin.name, userType: "admin" }, process.env.JWT_SECRET, { expiresIn: "20m" });

  let customerId = null;
  const uploadedKeys = [];

  const post = async (garments, requestId) => {
    const fd = new FormData();
    fd.append("customer", String(customerId));
    fd.append("deliveryDate", new Date(Date.now() + 7 * 864e5).toISOString());
    fd.append("specialNotes", TAG);
    fd.append("garments", JSON.stringify(garments));
    fd.append("payments", JSON.stringify([]));
    fd.append("requestId", requestId);
    // One image attached to garment 0, using the field name multer expects.
    fd.append("garments[0].referenceImages", new Blob([PNG], { type: "image/png" }), "px.png");
    const res = await fetch(BASE_URL + "/api/orders", {
      method: "POST", headers: { Authorization: "Bearer " + token }, body: fd,
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  };

  const good = { name: TAG + " G", garmentType: "blouse", category: String(CAT), item: String(ITEM), minPrice: 500, maxPrice: 800, measurements: [] };
  const bad = { name: TAG + " BAD", minPrice: 500, maxPrice: 800 }; // no category/item

  try {
    const cust = await db.collection("customers").insertOne({
      customerId: TAG + "-" + Date.now(), firstName: TAG, name: TAG + " Cust",
      phone: "0000000003", isActive: false, createdAt: new Date(),
    });
    customerId = cust.insertedId;

    console.log("1. Order WITH an uploaded image (the restructured path)");
    const okRes = await post([good], TAG + "-ok-" + Date.now());
    check("order created", okRes.status === 201, "HTTP " + okRes.status + " " + (okRes.body.message || ""));
    if (okRes.body.order?._id) {
      const oid = new mongoose.Types.ObjectId(okRes.body.order._id);
      const g = await db.collection("garments").findOne({ order: oid });
      const imgs = g?.referenceImages || [];
      for (const im of imgs) if (im?.key) uploadedKeys.push(im.key);
      check("garment persisted", !!g);
      check("image attached to garment", imgs.length === 1, "count=" + imgs.length);
      check("R2 key uses the order id path", !!imgs[0]?.key?.includes(String(oid)),
        imgs[0]?.key || "no key");
      check("work created", await db.collection("works").countDocuments({ order: oid }) === 1);
    }

    console.log("\n2. Upload + FAILURE mid-transaction (rollback with files)");
    const beforeOrders = await db.collection("orders").countDocuments({ specialNotes: TAG });
    const badRes = await post([bad], TAG + "-bad-" + Date.now());
    const afterOrders = await db.collection("orders").countDocuments({ specialNotes: TAG });
    check("rejected", badRes.status >= 400, "HTTP " + badRes.status);
    check("no orphan Order despite the upload having run",
      afterOrders === beforeOrders, beforeOrders + " -> " + afterOrders);
    console.log("     (the uploaded R2 object is orphaned by design - documented storage cleanup item)");
  } finally {
    console.log("\nCleanup");
    const ords = await db.collection("orders").find({ specialNotes: TAG }, { projection: { _id: 1 } }).toArray();
    const oids = ords.map((o) => o._id);
    // Collect every R2 key this run produced, including from the failed attempt.
    for (const g of await db.collection("garments").find({ name: new RegExp("^" + TAG) }).toArray()) {
      for (const arr of [g.referenceImages, g.customerImages, g.customerClothImages]) {
        for (const im of arr || []) if (im?.key && !uploadedKeys.includes(im.key)) uploadedKeys.push(im.key);
      }
    }
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

    let removed = 0;
    for (const k of uploadedKeys) {
      try { await r2Service.deleteFile(k); removed++; } catch (e) { console.log("  R2 delete failed for " + k + ": " + e.message); }
    }
    console.log("  R2 objects deleted: " + removed + " / " + uploadedKeys.length);

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
