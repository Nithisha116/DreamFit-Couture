// backend/seed/internalAdmin.seed.js
//
// Creates a second ADMIN-role account, separate from the client's own
// "Admin User" (admin.seed.js), intended only for the dev/QA team's use
// (bug fixing, verifying issues, maintenance). Same permissions as any
// other ADMIN — no schema or role changes; ADMIN is ADMIN regardless of
// which User document it lives on.
//
// Unlike admin.seed.js, this does NOT hardcode a password in source. Set
// INTERNAL_ADMIN_EMAIL / INTERNAL_ADMIN_PASSWORD in the environment before
// running, or omit INTERNAL_ADMIN_PASSWORD to have one generated and
// printed once (it is never stored anywhere in plaintext — only the bcrypt
// hash is saved to the database).
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const seedInternalAdmin = async () => {
  try {
    console.log("🚀 Starting Internal Admin Seed...");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const email = process.env.INTERNAL_ADMIN_EMAIL || "internal-admin@dreamfit.com";

    const existing = await User.findOne({ email });
    if (existing) {
      if (!existing.isInternalAdmin) {
        existing.isInternalAdmin = true;
        await existing.save();
        console.log(`✅ Internal Admin already existed (${email}) — backfilled isInternalAdmin=true.`);
      } else {
        console.log(`⚠️ Internal Admin already exists (${email}) with isInternalAdmin already set. Skipping.`);
      }
      process.exit(0);
    }

    const password =
      process.env.INTERNAL_ADMIN_PASSWORD ||
      crypto.randomBytes(12).toString("base64url"); // ~16 char random secret

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: "Internal Admin (Dev/QA)",
      email,
      password: hashedPassword,
      role: "ADMIN",
      phone: process.env.INTERNAL_ADMIN_PHONE || "0000000000",
      isActive: true,
      isInternalAdmin: true,
      profileImage: null,
      address: {},
      notes: "Internal support/maintenance account for the development team. Same permissions as the client's Admin account, kept separate for accountability — see AuditLog entries by this user's ID.",
    });

    console.log("🎉 Internal Admin created successfully!");
    console.log("📧 Email:", email);
    if (!process.env.INTERNAL_ADMIN_PASSWORD) {
      console.log("🔑 Generated password (save this now — it is not stored anywhere else):", password);
    } else {
      console.log("🔑 Password: (used from INTERNAL_ADMIN_PASSWORD env var)");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

seedInternalAdmin();
