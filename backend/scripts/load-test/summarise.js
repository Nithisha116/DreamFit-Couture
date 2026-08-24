/**
 * Aggregates every saved run into load-test-results/summary.md.
 * Reads only what was actually measured - no values are inferred or filled in.
 */
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS = path.join(__dirname, "../../load-test-results");

const load = (dir) => {
  const p = path.join(RESULTS, dir);
  if (!fs.existsSync(p)) return [];
  return fs
    .readdirSync(p)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(p, f), "utf8")).summary)
    .filter(Boolean);
};

const n = (v, d = 0) =>
  v === null || v === undefined || Number.isNaN(v) ? "NOT MEASURED" : Number(v).toFixed(d);

// Acceptance criteria from the brief (section 20).
const verdict = (s) => {
  if (s.errorRatePct > 1) return "Critical";
  if (s.p95 === null) return "NOT MEASURED";
  if (s.p95 < 500 && s.p99 < 1000 && s.errorRatePct === 0) return "Healthy";
  if (s.p95 < 2000 && s.errorRatePct < 1) return "Warning";
  return "Critical";
};

const byLevel = (runs) => {
  const m = new Map();
  for (const r of runs) {
    if (!m.has(r.connections)) m.set(r.connections, []);
    m.get(r.connections).push(r);
  }
  return [...m.entries()].sort((a, b) => a[0] - b[0]);
};

const table = (title, runs) => {
  if (!runs.length) return "";
  let out = "\n### " + title + "\n\n";
  out +=
    "| Conn | Runs | RPS (avg) | RPS (best) | Avg ms | P50 | P95 | P99 | Max | Errors | Err % | Srv CPU (1 core) | Srv RSS MB | Verdict |\n";
  out +=
    "| ---: | ---: | --------: | ---------: | -----: | --: | --: | --: | --: | -----: | ----: | ---------------: | ---------: | ------- |\n";
  for (const [conn, rs] of byLevel(runs)) {
    const avg = (f) => {
      // Only average samples that exist. Under saturation the /health probe
      // can fail; that must read as NOT MEASURED, never as zero.
      const vals = rs.map((r) => r[f]).filter((v) => v !== null && v !== undefined);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };
    const worst = (f) => Math.max(...rs.map((r) => r[f] ?? 0));
    const v = rs.map(verdict);
    const agg = v.includes("Critical")
      ? "Critical"
      : v.includes("Warning")
      ? "Warning"
      : v[0];
    out +=
      "| " + conn +
      " | " + rs.length +
      " | " + n(avg("rpsAvg"), 1) +
      " | " + n(Math.max(...rs.map((r) => r.rpsAvg)), 1) +
      " | " + n(avg("latAvg"), 1) +
      " | " + n(avg("p50")) +
      " | " + n(avg("p95")) +
      " | " + n(avg("p99")) +
      " | " + n(worst("latMax")) +
      " | " + rs.reduce((a, b) => a + b.errors + b.timeouts, 0) +
      " | " + n(avg("errorRatePct"), 2) +
      " | " + n(avg("serverCpuPctOneCore")) +
      " | " + n(worst("serverRssMaxMB")) +
      " | " + agg + " |\n";
  }
  return out;
};

const sweeps = [
  ["/health - static JSON, no DB, no auth", "health"],
  ["/api/categories - one small Mongo query, authenticated", "categories"],
  ["/api/orders/dashboard - dashboard aggregate, authenticated", "orders-dashboard"],
  ["Realistic read-only user flow (4 requests per cycle)", "realistic-flow"],
];

let md = "# DreamFit backend - load test results\n\n";
md += "Generated: " + new Date().toISOString() + "\n\n";
md += "All numbers below are measured with autocannon v8 against the running\n";
md += "server. Nothing is estimated. Cells that could not be measured say so.\n";

md += "\n## Environment\n\n";
md += "| Item | Value |\n| --- | --- |\n";
md += "| Node | " + process.version + " |\n";
md += "| Platform | " + os.platform() + " " + os.release() + " |\n";
md += "| CPU | " + os.cpus()[0].model + " |\n";
md += "| Logical cores | " + os.cpus().length + " |\n";
md += "| Total RAM | " + (os.totalmem() / 1024 ** 3).toFixed(2) + " GB |\n";
md += "| Load generator | same machine as server (localhost) |\n";

for (const [title, dir] of sweeps) md += table(title, load(dir));

// Endpoint comparison
const cmpDir = path.join(RESULTS, "comparison");
if (fs.existsSync(cmpDir)) {
  const f = fs
    .readdirSync(cmpDir)
    .filter((x) => x.startsWith("_comparison"))
    .sort()
    .pop();
  if (f) {
    const d = JSON.parse(fs.readFileSync(path.join(cmpDir, f), "utf8"));
    md += "\n### Endpoint comparison at " + d.conn + " concurrent connections\n\n";
    md +=
      "| Endpoint | Category | RPS | Avg ms | P95 | P99 | KB/req | Srv CPU (1 core) | Err % |\n";
    md += "| --- | --- | --: | --: | --: | --: | --: | --: | --: |\n";
    for (const r of d.rows) {
      md +=
        "| " + r.endpoint + " | " + r.category +
        " | " + n(r.rpsAvg, 1) +
        " | " + n(r.latAvg, 1) +
        " | " + n(r.p95) +
        " | " + n(r.p99) +
        " | " + n(r.kbPerReq, 1) +
        " | " + n(r.serverCpuPctOneCore) +
        " | " + n(r.errorRatePct, 2) + " |\n";
    }
  }
}

fs.writeFileSync(path.join(RESULTS, "summary.md"), md);
console.log("Wrote load-test-results/summary.md (" + md.length + " bytes)");
