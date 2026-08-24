/**
 * Measures the MongoDB Atlas round trip in isolation, so database latency can
 * be separated from application time in the load-test results.
 *
 * Read-only: ping, serverStatus and countDocuments only. Writes nothing.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const pct = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};

const stats = (name, arr) => {
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  console.log(
    name.padEnd(34) +
      "n=" + String(arr.length).padStart(4) +
      "  avg=" + avg.toFixed(1).padStart(7) + "ms" +
      "  min=" + Math.min(...arr).toFixed(1).padStart(7) + "ms" +
      "  p50=" + pct(arr, 50).toFixed(1).padStart(7) + "ms" +
      "  p95=" + pct(arr, 95).toFixed(1).padStart(7) + "ms" +
      "  max=" + Math.max(...arr).toFixed(1).padStart(7) + "ms"
  );
};

const time = async (fn) => {
  const t = process.hrtime.bigint();
  await fn();
  return Number(process.hrtime.bigint() - t) / 1e6;
};

const run = async () => {
  const connectMs = await time(() => mongoose.connect(process.env.MONGO_URI));
  console.log("Initial connect + handshake: " + connectMs.toFixed(0) + " ms");

  const admin = mongoose.connection.db.admin();

  // Effective pool configuration actually in use.
  const client = mongoose.connection.getClient();
  const o = client.options || {};
  console.log(
    "Pool config: maxPoolSize=" + o.maxPoolSize +
      "  minPoolSize=" + o.minPoolSize +
      "  maxIdleTimeMS=" + (o.maxIdleTimeMS ?? "default")
  );
  console.log("Driver topology: " + (client.topology?.description?.type || "unknown"));

  const hosts = (client.topology?.description?.servers)
    ? [...client.topology.description.servers.keys()]
    : [];
  console.log("Cluster nodes: " + hosts.length);

  // 1) Raw round trip - no query work at all.
  const pings = [];
  for (let i = 0; i < 30; i++) pings.push(await time(() => admin.ping()));
  stats("admin.ping() [raw RTT]", pings);

  // 2) Small indexed-ish read.
  const Category = mongoose.connection.collection("categories");
  const cats = [];
  for (let i = 0; i < 20; i++) cats.push(await time(() => Category.find({}).toArray()));
  stats("categories.find({})", cats);

  // 3) Count on the big collection.
  const Customer = mongoose.connection.collection("customers");
  const counts = [];
  for (let i = 0; i < 10; i++)
    counts.push(await time(() => Customer.countDocuments()));
  stats("customers.countDocuments()", counts);

  // 4) Full fetch of the heaviest endpoint's underlying data.
  const fulls = [];
  for (let i = 0; i < 5; i++)
    fulls.push(await time(() => Customer.find({}).toArray()));
  stats("customers.find({}) [full scan]", fulls);

  // 5) Concurrency behaviour: does the pool serialise?
  for (const n of [1, 10, 50, 100, 200]) {
    const t = await time(() =>
      Promise.all(Array.from({ length: n }, () => admin.ping()))
    );
    console.log(
      "  " + String(n).padStart(3) + " parallel pings: total=" +
        t.toFixed(0).padStart(6) + "ms  effective per-op=" +
        (t / n).toFixed(2).padStart(7) + "ms"
    );
  }

  const docCount = await Customer.countDocuments();
  console.log("customers documents: " + docCount);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => {
  console.error("DB latency probe failed:", e.message);
  process.exit(1);
});
