/**
 * DF-QR-P0 verification: replay + concurrent-scan protection.
 *
 * SAFETY: creates ONE disposable Work document, exercises it, then deletes it
 * in a finally block. isActive:false keeps it out of getWorkflowJobs and every
 * dashboard. No existing record is read-modified-written at any point. The
 * order/garment references are left unset - the QR scan path never requires
 * them (order sync is skipped when work.order is absent).
 *
 * Run with the server up:  node scripts/load-test/qr-p0-test.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Work from "../../models/Work.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5000";
const STAGES = ["cutting", "stitching", "final_finishing", "delivered"];

let pass = 0;
let fail = 0;
const check = (name, ok, detail = "") => {
  console.log("  " + (ok ? "PASS" : "FAIL") + "  " + name + (detail ? "  -> " + detail : ""));
  ok ? pass++ : fail++;
};

const scan = (qr, body) =>
  fetch(BASE_URL + "/api/qr/" + qr + "/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));

const state = async (id) => {
  const w = await Work.findById(id).lean();
  return {
    currentStage: w.currentStage,
    overallStatus: w.overallStatus,
    scanLogs: (w.scanLogs || []).length,
    history: (w.history || []).length,
  };
};

const makeWork = async (suffix) => {
  const w = await Work.create({
    workId: "ZZ-QRP0-TEST-" + Date.now() + "-" + suffix,
    isActive: false, // never surfaces in dashboards or getWorkflowJobs
    // Deliberately dangling refs. The schema requires these fields, but
    // pointing them at ids that do not exist means populate('order') yields
    // null, so syncOrderFromWork is skipped and no real Order can be mutated
    // by this test.
    order: new mongoose.Types.ObjectId(),
    garment: new mongoose.Types.ObjectId(),
    stageKeys: [...STAGES],
    currentStage: "cutting",
    overallStatus: "in-progress",
    status: "pending",
    assignments: [
      { stage: "cutting", role: "helper", workerName: "P0 Test Worker", status: "active" },
    ],
  });
  return w;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const created = [];

  try {
    // ---- B. Normal completion still works -------------------------------
    console.log("\nB. Normal completion (must still work exactly as before)");
    const w1 = await makeWork("normal");
    created.push(w1._id);
    const before1 = await state(w1._id);
    const r1 = await scan(w1.qrCode, { expectedStage: "cutting" });
    const after1 = await state(w1._id);
    check("first scan succeeds", r1.status === 200, "HTTP " + r1.status);
    check("cutting -> stitching", after1.currentStage === "stitching", after1.currentStage);
    check("scanLogs +1", after1.scanLogs === before1.scanLogs + 1,
      before1.scanLogs + " -> " + after1.scanLogs);
    check("history +1", after1.history === before1.history + 1,
      before1.history + " -> " + after1.history);

    // ---- C. Sequential replay -------------------------------------------
    console.log("\nC. Replay: same request sent again (the §8 test)");
    const r2 = await scan(w1.qrCode, { expectedStage: "cutting" });
    const after2 = await state(w1._id);
    check("replay rejected with 409", r2.status === 409, "HTTP " + r2.status);
    check("did NOT advance to final_finishing", after2.currentStage === "stitching",
      after2.currentStage);
    check("scanLogs unchanged by replay", after2.scanLogs === after1.scanLogs,
      String(after2.scanLogs));
    check("history unchanged by replay", after2.history === after1.history,
      String(after2.history));

    // ---- D. Concurrent double scan --------------------------------------
    console.log("\nD. Concurrent: two scans fired together (the §7 test)");
    const w2 = await makeWork("concurrent");
    created.push(w2._id);
    const beforeC = await state(w2._id);
    const [a, b] = await Promise.all([
      scan(w2.qrCode, { expectedStage: "cutting" }),
      scan(w2.qrCode, { expectedStage: "cutting" }),
    ]);
    const afterC = await state(w2._id);
    const codes = [a.status, b.status].sort();
    check("exactly one 200 and one 409", codes[0] === 200 && codes[1] === 409,
      "got " + codes.join(" + "));
    check("advanced exactly ONE stage", afterC.currentStage === "stitching",
      afterC.currentStage);
    check("scanLogs +1 only", afterC.scanLogs === beforeC.scanLogs + 1,
      beforeC.scanLogs + " -> " + afterC.scanLogs);

    // ---- G. Already-completed pipeline -----------------------------------
    console.log("\nG. Completed pipeline cannot be re-completed");
    const w3 = await makeWork("tail");
    created.push(w3._id);
    let cur = "cutting";
    for (const s of STAGES) {
      const r = await scan(w3.qrCode, { expectedStage: cur });
      if (r.status !== 200) break;
      cur = r.body.nextStage || cur;
    }
    const doneState = await state(w3._id);
    const rDone = await scan(w3.qrCode, {});
    const afterDone = await state(w3._id);
    check("pipeline reached completed", doneState.overallStatus === "completed",
      doneState.overallStatus);
    check("further scan rejected 409", rDone.status === 409, "HTTP " + rDone.status);
    check("scanLogs stop growing", afterDone.scanLogs === doneState.scanLogs,
      doneState.scanLogs + " -> " + afterDone.scanLogs);

    // ---- E/F. Invalid + nonexistent --------------------------------------
    console.log("\nE/F. Invalid and nonexistent QR (behaviour must be unchanged)");
    const rBad = await scan("not-a-real-qr-code-value", {});
    check("unknown QR -> 404", rBad.status === 404, "HTTP " + rBad.status);
    const rGhost = await scan(String(new mongoose.Types.ObjectId()), {});
    check("valid ObjectId, no work -> 404", rGhost.status === 404, "HTTP " + rGhost.status);

    // ---- Backward compatibility -----------------------------------------
    console.log("\nBackward compat: old cached page sends no expectedStage");
    const w4 = await makeWork("nobody");
    created.push(w4._id);
    const rNo = await scan(w4.qrCode, {});
    const afterNo = await state(w4._id);
    check("still completes normally", rNo.status === 200, "HTTP " + rNo.status);
    check("advanced one stage", afterNo.currentStage === "stitching", afterNo.currentStage);
  } finally {
    // ---- Cleanup: remove every document this script created --------------
    console.log("\nCleanup");
    for (const id of created) {
      await Work.deleteOne({ _id: id });
    }
    // Successful scans also create Notification documents referencing the
    // disposable works. Remove those too so nothing is left behind.
    let notes = 0;
    if (created.length) {
      const r = await mongoose.connection.db
        .collection("notifications")
        .deleteMany({ "reference.workId": { $in: created } });
      notes = r.deletedCount;
    }
    const leftover = await Work.countDocuments({ workId: /^ZZ-QRP0-TEST-/ });
    console.log("  disposable works deleted: " + created.length +
      "   notifications removed: " + notes +
      "   leftover test docs: " + leftover);
    if (leftover !== 0) {
      console.log("  !! WARNING: test documents remain, delete manually");
    }
  }

  console.log("\n" + "-".repeat(60));
  console.log("PASS " + pass + "   FAIL " + fail);
  await mongoose.disconnect();
  process.exit(fail === 0 ? 0 : 1);
};

run().catch(async (e) => {
  console.error("Test run error:", e.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
