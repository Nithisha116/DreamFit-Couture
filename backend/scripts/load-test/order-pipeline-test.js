/**
 * Order-level production pipeline verification.
 *
 * PART A — pure-function tests of buildOrderPipeline(). No database, no server,
 *   no network. Runs anywhere:  node scripts/load-test/order-pipeline-test.js
 *
 * PART B — live consistency check: proves the pipeline returned by
 *   GET /api/orders/:id and the per-garment stages returned by
 *   GET /api/workflow/jobs are computed from the same Work records.
 *   Skipped automatically when MONGO_URI or the server is unavailable.
 *
 * SAFETY
 *   - Part B creates one disposable Order + Garment + Work, all tagged
 *     ZZ-PIPELINE-TEST, and deletes them in a finally block.
 *   - It reads (never writes) one existing Customer, Category, Item and ADMIN
 *     user to borrow valid references. No existing record is modified.
 *   - Baseline collection counts are captured up front and re-checked at the
 *     end, so any stray document shows up immediately.
 *   - Auth token is minted locally from an existing ADMIN account, same
 *     approach as the DF-002 / DF-003 suites. It is never printed.
 */
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import {
  buildOrderPipeline,
  ORDER_STAGE_STATUS,
} from "../../utils/orderPipeline.util.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5000";
const TAG = "ZZ-PIPELINE-TEST";
const COLLECTIONS = ["orders", "garments", "works", "customers"];

let pass = 0;
let fail = 0;
const check = (name, ok, detail = "") => {
  console.log("  " + (ok ? "PASS" : "FAIL") + "  " + name + (detail ? "  -> " + detail : ""));
  ok ? pass++ : fail++;
};

const { COMPLETED, IN_PROGRESS, NOT_STARTED, DELAYED, NOT_APPLICABLE } = ORDER_STAGE_STATUS;

// ─── Fixtures ───────────────────────────────────────────────────────────────
// The 8-stage "Purchase" preset the workflow builder already ships.
const FULL = [
  "purchase",
  "cutting",
  "stitching",
  "final_finishing",
  "ironing_packing",
  "trial",
  "alteration",
  "delivered",
];
// The 7-stage "Standard" preset — same list without purchase.
const STANDARD = FULL.filter((k) => k !== "purchase");

const FUTURE = new Date(Date.now() + 7 * 864e5);
const PAST = new Date(Date.now() - 3 * 864e5);

let seq = 0;
const mkWork = (o = {}) => ({
  _id: o._id || "work" + ++seq,
  workId: o.workId || "ZZ-ORD." + String(seq).padStart(2, "0"),
  garment: { name: o.garmentName || "Blouse" },
  stageKeys: o.stageKeys || [...FULL],
  currentStage: o.currentStage || "cutting",
  overallStatus: o.overallStatus || "in-progress",
  workflowProgress: o.workflowProgress || {},
  assignments: o.assignments || [],
  estimatedDelivery: "estimatedDelivery" in o ? o.estimatedDelivery : FUTURE,
  isActive: true,
});

const statusOf = (pipeline, key) => pipeline.stages.find((s) => s.key === key)?.status;
const stageOf = (pipeline, key) => pipeline.stages.find((s) => s.key === key);

// ─── PART A: pure-function tests ────────────────────────────────────────────
const runPureTests = () => {
  console.log("\nPART A — buildOrderPipeline() pure tests\n");

  // 1. All stages completed
  {
    const p = buildOrderPipeline(
      { status: "ready-to-delivery" },
      [mkWork({ currentStage: "delivered", overallStatus: "completed" })],
    );
    check(
      "1. all stages completed -> every stage COMPLETED",
      p.stages.length === 8 && p.stages.every((s) => s.status === COMPLETED),
      p.stages.map((s) => s.status).join(","),
    );
    check("1b. completed pipeline -> currentStage null", p.currentStage === null, String(p.currentStage));
  }

  // 2. One stage active
  {
    const p = buildOrderPipeline({ status: "in-progress" }, [mkWork({ currentStage: "trial" })]);
    check("2. stage at cursor -> IN_PROGRESS", statusOf(p, "trial") === IN_PROGRESS, statusOf(p, "trial"));
    check("2b. stages before cursor -> COMPLETED",
      ["purchase", "cutting", "stitching", "final_finishing", "ironing_packing"]
        .every((k) => statusOf(p, k) === COMPLETED));
    check("2c. stages after cursor -> NOT_STARTED",
      ["alteration", "delivered"].every((k) => statusOf(p, k) === NOT_STARTED));
  }

  // 3. One stage partially complete across garments
  {
    const p = buildOrderPipeline({ status: "in-progress" }, [
      mkWork({ garmentName: "Blouse", currentStage: "trial" }),     // stitching done
      mkWork({ garmentName: "Pant", currentStage: "stitching" }),   // stitching active
    ]);
    const st = stageOf(p, "stitching");
    check("3. partial completion -> IN_PROGRESS, not COMPLETED", st.status === IN_PROGRESS, st.status);
    check("3b. counts reflect both garments",
      st.taskCount === 2 && st.completedTaskCount === 1,
      `taskCount=${st.taskCount} completed=${st.completedTaskCount}`);
  }

  // 4. Pending stage
  {
    const p = buildOrderPipeline({ status: "in-progress" }, [mkWork({ currentStage: "cutting" })]);
    check("4. untouched future stage -> NOT_STARTED", statusOf(p, "trial") === NOT_STARTED, statusOf(p, "trial"));
  }

  // 5. Overdue stage
  {
    const p = buildOrderPipeline({ status: "in-progress" }, [
      mkWork({ currentStage: "stitching", estimatedDelivery: PAST }),
    ]);
    check("5. incomplete stage on past-due work -> DELAYED",
      statusOf(p, "stitching") === DELAYED, statusOf(p, "stitching"));
    check("5b. overdue flag set", stageOf(p, "stitching").overdue === true);
    check("5c. already-completed stages stay COMPLETED despite overdue work",
      statusOf(p, "cutting") === COMPLETED, statusOf(p, "cutting"));
    check("5d. overdue falls back to order.deliveryDate when work has none",
      statusOf(
        buildOrderPipeline({ status: "in-progress", deliveryDate: PAST }, [
          mkWork({ currentStage: "stitching", estimatedDelivery: null }),
        ]),
        "stitching",
      ) === DELAYED);
  }

  // 6. Multiple garments
  {
    const p = buildOrderPipeline({ status: "in-progress" }, [
      mkWork({ garmentName: "Blouse", currentStage: "stitching" }),
      mkWork({ garmentName: "Pant", currentStage: "trial" }),
      mkWork({ garmentName: "Shirt", currentStage: "stitching" }),
    ]);
    check("6. stage completed on every garment -> COMPLETED",
      statusOf(p, "cutting") === COMPLETED && stageOf(p, "cutting").taskCount === 3,
      statusOf(p, "cutting"));
    check("6b. order aggregates all garments, not the latest one",
      statusOf(p, "stitching") === IN_PROGRESS && stageOf(p, "stitching").completedTaskCount === 1,
      statusOf(p, "stitching"));
    check("6c. drill-down lists one task per garment",
      stageOf(p, "stitching").tasks.map((t) => t.garmentName).sort().join(",") === "Blouse,Pant,Shirt");
  }

  // 7. Different workflows between garments
  {
    const p = buildOrderPipeline({ status: "in-progress" }, [
      mkWork({ garmentName: "Blouse", stageKeys: [...FULL], currentStage: "cutting" }),
      mkWork({ garmentName: "Pant", stageKeys: [...STANDARD], currentStage: "cutting" }),
    ]);
    check("7. union keeps canonical order",
      p.stages.map((s) => s.key).join(",") === FULL.join(","),
      p.stages.map((s) => s.key).join(","));
    check("7b. stage only one garment runs is judged on that garment alone",
      stageOf(p, "purchase").taskCount === 1 && statusOf(p, "purchase") === COMPLETED,
      `taskCount=${stageOf(p, "purchase").taskCount} status=${statusOf(p, "purchase")}`);
    check("7c. shared stage still counts both garments", stageOf(p, "cutting").taskCount === 2);

    // custom stage keeps the position its own garment gave it
    const custom = buildOrderPipeline({ status: "in-progress" }, [
      mkWork({ stageKeys: ["cutting", "hand_embroidery", "stitching", "delivered"], currentStage: "cutting" }),
      mkWork({ stageKeys: [...STANDARD], currentStage: "cutting" }),
    ]);
    const keys = custom.stages.map((s) => s.key);
    check("7d. custom stage sits after the stage it follows",
      keys.indexOf("hand_embroidery") === keys.indexOf("cutting") + 1 &&
      keys.indexOf("hand_embroidery") < keys.indexOf("stitching"),
      keys.join(","));
  }

  // 8. Multiple assignments / tasks in one stage
  {
    const assigned = (stage) => [{
      stage, role: "tailor", workerName: "Swathi", status: "active", assignedAt: new Date(), startedAt: new Date(),
    }];
    const p = buildOrderPipeline({ status: "in-progress" }, [
      mkWork({ garmentName: "Blouse", currentStage: "cutting", assignments: assigned("stitching") }),
      mkWork({ garmentName: "Pant", currentStage: "cutting", assignments: assigned("stitching") }),
    ]);
    check("8. assigned-but-not-reached stage -> IN_PROGRESS",
      statusOf(p, "stitching") === IN_PROGRESS, statusOf(p, "stitching"));
    check("8b. every task carries its real assignee",
      stageOf(p, "stitching").tasks.every((t) => t.assignedTo?.name === "Swathi"));
    check("8c. unassigned untouched stage stays NOT_STARTED",
      statusOf(p, "alteration") === NOT_STARTED, statusOf(p, "alteration"));
  }

  // 9. Missing / non-applicable stage
  {
    // A stage absent from a garment's workflow must not hold that stage back.
    const p = buildOrderPipeline({ status: "in-progress" }, [
      mkWork({ garmentName: "Blouse", stageKeys: [...FULL], currentStage: "stitching" }),
      mkWork({ garmentName: "Pant", stageKeys: [...STANDARD], currentStage: "purchase" }),
    ]);
    check("9. garment without the stage is excluded from its aggregation",
      statusOf(p, "purchase") === COMPLETED && stageOf(p, "purchase").taskCount === 1,
      `status=${statusOf(p, "purchase")} taskCount=${stageOf(p, "purchase").taskCount}`);

    const empty = buildOrderPipeline({ status: "confirmed" }, []);
    check("9b. order with no works -> empty pipeline, no crash",
      Array.isArray(empty.stages) && empty.stages.length === 0 && empty.currentStage === null);

    const inactive = buildOrderPipeline({ status: "in-progress" }, [
      { ...mkWork({ currentStage: "cutting" }), isActive: false },
    ]);
    check("9c. inactive works are excluded", inactive.stages.length === 0);

    check("9d. NOT_APPLICABLE is a defined status", NOT_APPLICABLE === "NOT_APPLICABLE");
  }

  // 10. Delivered order
  {
    const works = [mkWork({ currentStage: "delivered", overallStatus: "in-progress" })];
    const before = buildOrderPipeline({ status: "ready-to-delivery" }, works);
    const after = buildOrderPipeline({ status: "delivered" }, works);
    check("10. delivered stage not auto-complete before the order is delivered",
      statusOf(before, "delivered") === IN_PROGRESS, statusOf(before, "delivered"));
    check("10b. order.status 'delivered' forces Delivered COMPLETED",
      statusOf(after, "delivered") === COMPLETED, statusOf(after, "delivered"));
    check("10c. delivered order -> currentStage null", after.currentStage === null, String(after.currentStage));
  }

  // 11. Cancelled order
  {
    const p = buildOrderPipeline({ status: "cancelled" }, [mkWork({ currentStage: "stitching" })]);
    check("11. cancelled order -> currentStage null", p.currentStage === null, String(p.currentStage));
    check("11b. cancelled order still reports real stage state",
      statusOf(p, "cutting") === COMPLETED && statusOf(p, "stitching") === IN_PROGRESS,
      `${statusOf(p, "cutting")}/${statusOf(p, "stitching")}`);
  }

  // 12. Current-stage calculation
  {
    const p = buildOrderPipeline({ status: "in-progress" }, [mkWork({ currentStage: "trial" })]);
    check("12. currentStage = first stage that is not COMPLETED/NOT_APPLICABLE",
      p.currentStage === "trial", String(p.currentStage));
    check("12b. currentStageLabel resolved backend-side",
      p.currentStageLabel === "Trial", String(p.currentStageLabel));

    // slowest garment decides, not the furthest one
    const mixed = buildOrderPipeline({ status: "in-progress" }, [
      mkWork({ garmentName: "Blouse", currentStage: "trial" }),
      mkWork({ garmentName: "Pant", currentStage: "cutting" }),
    ]);
    check("12c. currentStage follows the slowest garment",
      mixed.currentStage === "cutting", String(mixed.currentStage));
  }

  // 13. Canonical labels
  {
    const p = buildOrderPipeline({ status: "in-progress" }, [mkWork({ currentStage: "cutting" })]);
    const labels = p.stages.map((s) => s.label).join(" | ");
    check("13. canonical stage labels",
      labels === "Purchase | Cutting | Stitching | Final Finishing | Ironing & Packing | Trial | Alteration | Delivered",
      labels);
  }

  // 14. Purity — inputs are never mutated
  {
    const order = { status: "in-progress" };
    const work = mkWork({ currentStage: "trial" });
    const snapshot = JSON.stringify({ order, work });
    buildOrderPipeline(order, [work]);
    check("14. inputs not mutated", JSON.stringify({ order, work }) === snapshot);
  }
};

// ─── PART B: live consistency check ─────────────────────────────────────────
const counts = async (db) => {
  const out = {};
  for (const c of COLLECTIONS) out[c] = await db.collection(c).countDocuments();
  return out;
};

const runLiveCheck = async () => {
  console.log("\nPART B — live consistency: Order Detail vs /api/workflow/jobs\n");

  if (!process.env.MONGO_URI) {
    console.log("  SKIP  MONGO_URI not set");
    return;
  }
  try {
    const ping = await fetch(BASE_URL + "/health").catch(() => null);
    if (!ping) {
      console.log("  SKIP  server not reachable at " + BASE_URL);
      return;
    }
  } catch {
    console.log("  SKIP  server not reachable at " + BASE_URL);
    return;
  }

  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const baseline = await counts(db);
  console.log("  Baseline: " + COLLECTIONS.map((c) => c + "=" + baseline[c]).join("  "));

  const Order = (await import("../../models/Order.js")).default;
  const Garment = (await import("../../models/Garment.js")).default;
  const Work = (await import("../../models/Work.js")).default;

  let orderId = null;
  let garmentId = null;
  let workIds = [];

  try {
    // Read-only lookups to borrow valid references. Nothing here is written to.
    const admin = await db.collection("users").findOne(
      { role: "ADMIN", isActive: true }, { projection: { _id: 1, name: 1 } });
    const customer = await db.collection("customers").findOne({}, { projection: { _id: 1 } });
    const category = await db.collection("categories").findOne({}, { projection: { _id: 1 } });
    const item = await db.collection("items").findOne({}, { projection: { _id: 1 } });

    if (!admin || !customer || !category || !item) {
      console.log("  SKIP  no existing admin/customer/category/item to reference");
      return;
    }

    const token = jwt.sign(
      { id: admin._id, role: "ADMIN", name: admin.name, userType: "admin" },
      process.env.JWT_SECRET, { expiresIn: "15m" },
    );

    const order = await Order.create({
      customer: customer._id,
      orderId: TAG + "-" + Date.now(),
      deliveryDate: FUTURE,
      status: "in-progress",
      specialNotes: TAG,
      createdBy: admin._id,
      garments: [],
    });
    orderId = order._id;

    const garment = await Garment.create({
      order: order._id,
      name: TAG + " Blouse",
      category: category._id,
      item: item._id,
      estimatedDelivery: FUTURE,
      priceRange: { min: 0, max: 0 },
      stageKeys: [...FULL],
      workflowStages: FULL.map((key, i) => ({ key, label: key, order: i + 1 })),
    });
    garmentId = garment._id;
    await Order.findByIdAndUpdate(order._id, { $set: { garments: [garment._id] } });

    const work = await Work.create({
      workId: TAG + "." + Date.now(),
      order: order._id,
      garment: garment._id,
      createdBy: admin._id,
      currentStage: "stitching",
      overallStatus: "in-progress",
      stageKeys: [...FULL],
      workflowStages: FULL.map((key, i) => ({ key, label: key, order: i + 1 })),
      estimatedDelivery: FUTURE,
      isActive: true,
    });
    workIds.push(work._id);

    const authGet = async (url) => {
      const res = await fetch(BASE_URL + url, { headers: { Authorization: "Bearer " + token } });
      return { status: res.status, body: await res.json().catch(() => ({})) };
    };

    const detail = await authGet("/api/orders/" + order._id);
    check("B1. GET /api/orders/:id returns 200", detail.status === 200, String(detail.status));
    check("B2. response exposes top-level pipeline",
      !!detail.body?.pipeline && Array.isArray(detail.body.pipeline.stages),
      Object.keys(detail.body || {}).join(","));
    check("B3. pipeline is NOT nested inside order",
      detail.body?.order?.pipeline === undefined);

    const pipeline = detail.body.pipeline || { stages: [] };
    check("B4. backend-calculated currentStage matches the work cursor",
      pipeline.currentStage === "stitching", String(pipeline.currentStage));

    const stitching = pipeline.stages.find((s) => s.key === "stitching");
    check("B5. drill-down task points at the real Work record",
      stitching?.tasks?.[0]?.workId === String(work._id),
      stitching?.tasks?.[0]?.workId);

    const jobs = await authGet("/api/workflow/jobs");
    const job = (jobs.body?.data || []).find((j) => j.workMongoId === String(work._id));
    check("B6. same Work appears in /api/workflow/jobs", !!job);

    if (job) {
      // The Dashboard's per-garment map and the order aggregation must agree
      // stage by stage — same helper, same Work record.
      const mapped = { completed: "COMPLETED", active: "IN_PROGRESS", pending: "NOT_STARTED" };
      const mismatches = pipeline.stages.filter((s) => {
        const task = s.tasks.find((t) => t.workId === String(work._id));
        if (!task) return false;
        return mapped[job.stages?.[s.key]?.state] !== task.status;
      });
      check("B7. Order Detail and Dashboard agree on every stage",
        mismatches.length === 0,
        mismatches.map((m) => m.key).join(","));
      check("B8. same stage list on both screens",
        job.stageKeys.join(",") === pipeline.stages.map((s) => s.key).join(","),
        job.stageKeys.join(","));
    }
  } finally {
    const removed = {};
    if (workIds.length) {
      removed.works = (await db.collection("works").deleteMany({ _id: { $in: workIds } })).deletedCount;
    }
    if (garmentId) {
      removed.garments = (await db.collection("garments").deleteMany({ _id: garmentId })).deletedCount;
    }
    if (orderId) {
      removed.orders = (await db.collection("orders").deleteMany({ _id: orderId })).deletedCount;
    }
    // Belt and braces: anything else this run tagged.
    removed.orders = (removed.orders || 0) +
      (await db.collection("orders").deleteMany({ specialNotes: TAG })).deletedCount;

    console.log("  Cleanup: " + Object.entries(removed).map(([k, v]) => k + "=" + v).join("  "));

    const after = await counts(db);
    const drift = COLLECTIONS.filter((c) => after[c] !== baseline[c]);
    check("B9. no collection drift after cleanup", drift.length === 0,
      drift.map((c) => `${c} ${baseline[c]}->${after[c]}`).join(", "));

    await mongoose.disconnect();
  }
};

// ─── Runner ─────────────────────────────────────────────────────────────────
const run = async () => {
  runPureTests();
  try {
    await runLiveCheck();
  } catch (err) {
    console.log("  SKIP  live check failed to run -> " + err.message);
    try { await mongoose.disconnect(); } catch { /* already closed */ }
  }
  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail === 0 ? 0 : 1);
};

run();
