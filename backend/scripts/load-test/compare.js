/**
 * Runs the same concurrency level against several endpoints so their costs are
 * directly comparable. Used to separate middleware overhead from auth overhead
 * from database time.
 *
 * Usage:
 *   node scripts/load-test/compare.js --conn 50 --duration 20 \
 *     --endpoints health,spa,authReject,categories,ordersDashboard
 */
import os from "os";
import { runTest, saveResult, fmt, BASE_URL } from "./runner.js";
import { getEndpoint, REALISTIC_FLOW } from "./endpoints.js";

const argv = process.argv.slice(2);
const arg = (n, d) => {
  const i = argv.indexOf("--" + n);
  return i === -1 ? d : argv[i + 1];
};

const conn = parseInt(arg("conn", "50"), 10);
const duration = parseInt(arg("duration", "20"), 10);
const keys = arg("endpoints", "health,spa,authReject,categories,ordersDashboard").split(",");
const includeFlow = argv.includes("--with-flow");
const outDir = arg("out", "comparison");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  console.log("=".repeat(118));
  console.log(
    "ENDPOINT COMPARISON  conn=" + conn + "  duration=" + duration + "s  target=" + BASE_URL
  );
  console.log("=".repeat(118));
  console.log(
    [
      "ENDPOINT".padEnd(20),
      "CAT".padEnd(12),
      "RPS".padStart(9),
      "AVG".padStart(9),
      "P50".padStart(8),
      "P95".padStart(9),
      "P99".padStart(9),
      "MAX".padStart(9),
      "ERR%".padStart(7),
      "KB/req".padStart(8),
      "SRVCPU".padStart(8),
    ].join(" ")
  );
  console.log("-".repeat(118));

  const rows = [];
  const targets = keys.map((k) => getEndpoint(k.trim()));
  if (includeFlow) {
    targets.push({
      name: "realistic-flow",
      category: "E-flow",
      path: null,
      auth: true,
      isFlow: true,
      desc: "dashboard -> orders -> customer stats -> categories",
    });
  }

  for (const ep of targets) {
    // Short warm-up so the first sample of each endpoint is not a cold path.
    await runTest({
      path: ep.path,
      flow: ep.isFlow ? REALISTIC_FLOW : null,
      connections: 5,
      duration: 4,
      auth: ep.auth,
      expectStatus: ep.expectStatus || 200,
      label: ep.name + "-warmup",
    });

    const { summary, raw } = await runTest({
      path: ep.path,
      flow: ep.isFlow ? REALISTIC_FLOW : null,
      connections: conn,
      duration,
      auth: ep.auth,
      expectStatus: ep.expectStatus || 200,
      label: ep.name + "-compare-c" + conn,
    });

    const kbPerReq =
      summary.totalRequests > 0
        ? summary.totalBytes / summary.totalRequests / 1024
        : 0;

    console.log(
      [
        ep.name.padEnd(20),
        ep.category.padEnd(12),
        fmt(summary.rpsAvg, 1).padStart(9),
        fmt(summary.latAvg, 1).padStart(9),
        fmt(summary.p50, 0).padStart(8),
        fmt(summary.p95, 0).padStart(9),
        fmt(summary.p99, 0).padStart(9),
        fmt(summary.latMax, 0).padStart(9),
        fmt(summary.errorRatePct, 2).padStart(7),
        fmt(kbPerReq, 1).padStart(8),
        fmt(summary.serverCpuPctOneCore, 0).padStart(8),
      ].join(" ")
    );

    rows.push({ endpoint: ep.name, category: ep.category, desc: ep.desc, kbPerReq, ...summary });
    saveResult(outDir, ep.name + "-c" + conn + "-" + stamp + ".json", { summary, raw });
    await sleep(3000);
  }

  console.log("-".repeat(118));
  saveResult(outDir, "_comparison-c" + conn + "-" + stamp + ".json", {
    conn,
    duration,
    baseUrl: BASE_URL,
    node: process.version,
    cpuCount: os.cpus().length,
    rows,
  });
  console.log("Saved to load-test-results/" + outDir + "/");
};

main().catch((e) => {
  console.error("Comparison failed:", e);
  process.exit(1);
});
