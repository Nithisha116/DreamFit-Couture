/**
 * DF-002 runtime verification. Converts code reading into measured behaviour.
 *
 * For each role it reproduces exactly what loginUser would do (same collection
 * precedence, same JWT payload), then calls a protect()-only endpoint over
 * HTTP and reports the real status code.
 *
 * GET /api/workers is used deliberately: worker.routes.js applies protect with
 * NO authorize(), so a 401 means authentication failed and a 200 means it
 * succeeded. Authorization is not in the way.
 *
 * READ-ONLY: finds identities and signs tokens locally. Creates nothing.
 * Tokens are never printed.
 */
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5000";
const ENDPOINT = "/api/workers"; // protect only, no authorize()

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const users = db.collection("users");

  // Mirrors loginUser: User is checked first, then CuttingMaster, StoreKeeper,
  // Tailor. Whichever matches supplies both userId and userType.
  const resolveLoginIdentity = async (role) => {
    const u = await users.findOne({ role }, { projection: { _id: 1, name: 1 } });
    if (u) return { id: u._id, name: u.name, source: "users", role };

    const own = {
      CUTTING_MASTER: "cuttingmasters",
      STORE_KEEPER: "storekeepers",
      TAILOR: "tailors",
    }[role];
    if (!own) return null;

    const w = await db.collection(own).findOne({}, { projection: { _id: 1, name: 1 } });
    return w ? { id: w._id, name: w.name, source: own, role } : null;
  };

  const call = async (identity) => {
    const token = jwt.sign(
      {
        id: identity.id,
        role: identity.role,
        name: identity.name,
        userType: identity.role.toLowerCase(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );
    try {
      const res = await fetch(BASE_URL + ENDPOINT, {
        headers: { Authorization: "Bearer " + token },
      });
      let msg = "";
      if (res.status !== 200) {
        const body = await res.json().catch(() => ({}));
        msg = body.message || "";
      }
      return { status: res.status, msg };
    } catch (e) {
      return { status: 0, msg: e.message };
    }
  };

  const ROLES = [
    "ADMIN",
    "CUTTING_MASTER",
    "STORE_KEEPER",
    "TAILOR",
    "HELPER",
    "EMBROIDERY_WORKER",
    "AARI_WORKER",
  ];

  console.log("Endpoint under test: GET " + ENDPOINT + "  (protect only, no authorize)");
  console.log("A 401 means protect() could not resolve the identity.\n");
  console.log(
    "ROLE".padEnd(20) + "LOGIN ID FROM".padEnd(18) + "STATUS".padEnd(8) + "MESSAGE"
  );
  console.log("-".repeat(78));

  const results = [];
  for (const role of ROLES) {
    const identity = await resolveLoginIdentity(role);
    if (!identity) {
      console.log(role.padEnd(20) + "no account found".padEnd(18) + "SKIP");
      continue;
    }
    const r = await call(identity);
    console.log(
      role.padEnd(20) +
        identity.source.padEnd(18) +
        String(r.status).padEnd(8) +
        r.msg
    );
    results.push({ role, source: identity.source, ...r });
  }

  console.log("-".repeat(78));
  const failed = results.filter((r) => r.status === 401);
  console.log(
    failed.length
      ? "\nAuthentication FAILS for: " + failed.map((f) => f.role).join(", ")
      : "\nAll tested roles authenticate successfully."
  );

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => {
  console.error("Runtime test failed:", e.message);
  process.exit(1);
});
