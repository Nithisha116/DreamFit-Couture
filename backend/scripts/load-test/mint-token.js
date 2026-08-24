/**
 * Mints a benchmark JWT for an EXISTING account. Read-only: it never creates
 * or modifies any document. Payload mirrors controllers/auth.controller.js
 * exactly so `protect` behaves identically to a real login.
 *
 * Writes the token to scripts/load-test/.token (gitignored) and prints nothing
 * sensitive.
 */
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../../models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ role: "ADMIN", isActive: true })
    .select("_id name role")
    .lean();

  if (!user) {
    console.error("No active ADMIN user found — cannot mint a token.");
    process.exit(1);
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      userType: user.role.toLowerCase(),
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" } // short-lived: this is a benchmark credential
  );

  fs.writeFileSync(path.join(__dirname, ".token"), token);
  console.log(`Token minted for role=${user.role} (id masked), length=${token.length}`);
  console.log("Written to scripts/load-test/.token");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => {
  console.error("Mint failed:", e.message);
  process.exit(1);
});
