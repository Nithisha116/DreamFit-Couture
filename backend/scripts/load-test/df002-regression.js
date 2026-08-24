/**
 * DF-002 regression suite. READ-ONLY against the database.
 *
 * Covers the cases the happy-path test does not:
 *   1. A Tailor whose id lives in the tailors collection (not User) still
 *      authenticates - i.e. the fix did not trade one broken group for another.
 *   2. Store Keeper / Cutting Master single-login flow preserved.
 *   3. A valid-looking token for a non-existent account still 401s (the fix
 *      must not turn "not found" into "authorized").
 *   4. No password/hash field reaches the authenticated request.
 *   5. Cross-reference fields (helperId / aariWorkerId / embroideryWorkerId)
 *      that WTask/QR flows rely on - are they actually persisted on User?
 */
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import UserModel from "../../models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5000";

let pass = 0;
let fail = 0;
const check = (name, ok, detail = "") => {
  console.log("  " + (ok ? "PASS" : "FAIL") + "  " + name + (detail ? "  -> " + detail : ""));
  ok ? pass++ : fail++;
};

const token = (id, role, name = "test") =>
  jwt.sign(
    { id, role, name, userType: String(role).toLowerCase() },
    process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );

const hit = async (pathname, tok) => {
  const res = await fetch(BASE_URL + pathname, {
    headers: { Authorization: "Bearer " + tok },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  console.log("\n1. Own-collection logins still work (fix must not break these)");
  for (const [role, coll] of [
    ["TAILOR", "tailors"],
    ["CUTTING_MASTER", "cuttingmasters"],
    ["STORE_KEEPER", "storekeepers"],
  ]) {
    const doc = await db.collection(coll).findOne({}, { projection: { _id: 1, name: 1 } });
    if (!doc) {
      console.log("  SKIP  " + role + " - no document in " + coll);
      continue;
    }
    const r = await hit("/api/workers", token(doc._id, role, doc.name));
    check(
      role + " resolved from " + coll,
      r.status === 200,
      "HTTP " + r.status + (r.body.message ? " " + r.body.message : "")
    );
  }

  console.log("\n2. User-collection logins work (single-login architecture)");
  for (const role of ["ADMIN", "TAILOR", "HELPER", "EMBROIDERY_WORKER", "AARI_WORKER"]) {
    const u = await db
      .collection("users")
      .findOne({ role }, { projection: { _id: 1, name: 1 } });
    if (!u) {
      console.log("  SKIP  " + role + " - no User with this role");
      continue;
    }
    const r = await hit("/api/workers", token(u._id, role, u.name));
    check(
      role + " resolved from users",
      r.status === 200,
      "HTTP " + r.status + (r.body.message ? " " + r.body.message : "")
    );
  }

  console.log("\n3. Non-existent accounts must still be rejected");
  const ghost = new mongoose.Types.ObjectId();
  for (const role of ["HELPER", "TAILOR", "ADMIN", "AARI_WORKER"]) {
    const r = await hit("/api/workers", token(ghost, role));
    check(
      "unknown id with role " + role + " -> 401",
      r.status === 401,
      "HTTP " + r.status
    );
  }
  const bad = await hit("/api/workers", "not-a-real-jwt");
  check("malformed token -> 401", bad.status === 401, "HTTP " + bad.status);

  const none = await fetch(BASE_URL + "/api/workers");
  check("no token -> 401", none.status === 401, "HTTP " + none.status);

  console.log("\n4. Password never exposed on the authenticated identity");
  // /api/users/profile returns req.user-derived data for the caller.
  const admin = await db
    .collection("users")
    .findOne({ role: "ADMIN" }, { projection: { _id: 1, name: 1 } });
  if (admin) {
    const r = await hit("/api/users/profile", token(admin._id, "ADMIN", admin.name));
    const raw = JSON.stringify(r.body);
    check(
      "no password/hash field in authenticated response",
      !/"password"|\$2[aby]\$/.test(raw),
      "HTTP " + r.status
    );
  } else {
    console.log("  SKIP  no ADMIN user");
  }

  console.log("\n5. Cross-reference fields used by WTask/QR worker resolution");
  for (const [role, field] of [
    ["HELPER", "helperId"],
    ["AARI_WORKER", "aariWorkerId"],
    ["EMBROIDERY_WORKER", "embroideryWorkerId"],
  ]) {
    const total = await db.collection("users").countDocuments({ role });
    const withRef = await db
      .collection("users")
      .countDocuments({ role, [field]: { $exists: true, $ne: null } });
    const inSchema = !!UserModel.schema.path(field);
    console.log(
      "  " + role.padEnd(20) +
        field.padEnd(22) +
        "in User schema: " + (inSchema ? "YES" : "NO ") +
        "   users with it set: " + withRef + "/" + total
    );
  }

  console.log("\n" + "-".repeat(60));
  console.log("PASS " + pass + "   FAIL " + fail);

  await mongoose.disconnect();
  process.exit(fail === 0 ? 0 : 1);
};

run().catch((e) => {
  console.error("Regression suite error:", e.message);
  process.exit(1);
});
