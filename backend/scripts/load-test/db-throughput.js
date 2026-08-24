/**
 * Establishes the ceiling of the Atlas cluster itself, with a WARM pool, so
 * the database ceiling can be compared against the HTTP-layer ceiling.
 *
 * The earlier probe was distorted by lazy pool growth (minPoolSize=0 means the
 * first burst pays a TLS handshake per connection). Here the pool is warmed
 * first and only steady-state numbers are reported.
 *
 * Read-only: ping and find only.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 100 });
  const admin = mongoose.connection.db.admin();
  const categories = mongoose.connection.collection("categories");

  // Warm the pool: force 100 concurrent ops so every connection is opened.
  console.log("Warming pool (2 rounds of 100 concurrent ops)...");
  for (let i = 0; i < 2; i++) {
    await Promise.all(Array.from({ length: 100 }, () => admin.ping()));
  }

  // Try to identify the cluster tier - blocked on shared tiers, which is
  // itself informative.
  try {
    const bi = await admin.command({ buildInfo: 1 });
    console.log("MongoDB server version: " + bi.version);
  } catch (e) {
    console.log("buildInfo blocked: " + e.codeName);
  }
  try {
    const hi = await admin.command({ hostInfo: 1 });
    console.log(
      "Cluster host: cores=" + hi.system?.numCores +
        " memMB=" + hi.system?.memSizeMB +
        " os=" + hi.os?.name
    );
  } catch (e) {
    console.log(
      "hostInfo blocked (" + e.codeName +
        ") - typical of an Atlas shared tier (M0/M2/M5)"
    );
  }

  const bench = async (label, op, concurrencies) => {
    console.log("\n" + label);
    for (const n of concurrencies) {
      const rounds = 3;
      let totalOps = 0;
      const t0 = process.hrtime.bigint();
      for (let r = 0; r < rounds; r++) {
        await Promise.all(Array.from({ length: n }, () => op()));
        totalOps += n;
      }
      const ms = Number(process.hrtime.bigint() - t0) / 1e6;
      console.log(
        "  concurrency " + String(n).padStart(3) +
          " -> " + (totalOps / (ms / 1000)).toFixed(0).padStart(6) + " ops/sec" +
          "   avg per-op " + (ms / totalOps).toFixed(1).padStart(6) + "ms" +
          "   wall " + ms.toFixed(0).padStart(6) + "ms"
      );
    }
  };

  await bench("ping (no query work, pure round trip):", () => admin.ping(), [1, 10, 25, 50, 100, 200]);
  await bench(
    "categories.find({}) (small real query):",
    () => categories.find({}).toArray(),
    [1, 10, 25, 50, 100]
  );

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => {
  console.error("DB throughput probe failed:", e.message);
  process.exit(1);
});
