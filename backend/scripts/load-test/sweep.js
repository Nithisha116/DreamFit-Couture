/**
 * Concurrency sweep orchestrator.
 *
 * Usage:
 *   node scripts/load-test/sweep.js --endpoint health --levels 10,25,50 --duration 30
 *   node scripts/load-test/sweep.js --endpoint ordersDashboard --levels 10,25,50 --repeat 3
 *   node scripts/load-test/sweep.js --flow --levels 10,25,50
 *
 * Aborts the sweep automatically if the LOAD GENERATOR itself runs out of
 * headroom, so a machine-side failure is never misreported as a server limit.
 */
import os from "os";
import { runTest, saveResult, fmt, BASE_URL, CPU_COUNT } from "./runner.js";
import { getEndpoint, REALISTIC_FLOW } from "./endpoints.js";

const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf("--" + name);
  return i === -1 ? def : argv[i + 1];
};
const flagged = (name) => argv.includes("--" + name);

const endpointKey = arg("endpoint", "health");
const isFlow = flagged("flow");
const levels = arg("levels", "10,25,50,100,250,500")
  .split(",")
  .map((s) => parseInt(s.trim(), 10))
  .filter(Boolean);
const duration = parseInt(arg("duration", "30"), 10);
const repeat = parseInt(arg("repeat", "1"), 10);
const warmupSeconds = parseInt(arg("warmup", "5"), 10);
const outDir = arg("out", isFlow ? "realistic-flow" : endpointKey);

// Guard rails for the load generator (see section 18 of the brief).
const MIN_FREE_MEM_MB = parseInt(arg("min-free-mem", "150"), 10);

const ep = isFlow
  ? {
      name: "realistic-flow",
      category: "E-flow",
      path: null,
      auth: true,
      desc: "Read-only user session: dashboard -> orders -> customer stats -> categories",
    }
  : getEndpoint(endpointKey);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const header = () => {
  console.log("=".repeat(112));
  console.log("SWEEP: " + ep.name + "   " + (isFlow ? "FLOW" : ep.path));
  console.log("  " + ep.desc);
  console.log(
    "  target=" + BASE_URL +
    "  auth=" + ep.auth +
    "  duration=" + duration + "s" +
    "  repeat=" + repeat +
    "  levels=[" + levels.join(", ") + "]"
  );
  console.log("=".repeat(112));
  console.log(
    [
      "CONN".padStart(6),
      "RUN".padStart(4),
      "RPS".padStart(9),
      "AVG".padStart(9),
      "P50".padStart(8),
      "P95".padStart(9),
      "P99".padStart(9),
      "MAX".padStart(9),
      "ERR".padStart(7),
      "TMO".padStart(7),
      "NON2XX".padStart(8),
      "ERR%".padStart(7),
      "SRVCPU".padStart(8),
      "RSSMB".padStart(8),
      "FREEMB".padStart(8),
    ].join(" ")
  );
  console.log("-".repeat(112));
};

const row = (s, runIdx) =>
  [
    String(s.connections).padStart(6),
    String(runIdx).padStart(4),
    fmt(s.rpsAvg, 1).padStart(9),
    fmt(s.latAvg, 1).padStart(9),
    fmt(s.p50, 0).padStart(8),
    fmt(s.p95, 0).padStart(9),
    fmt(s.p99, 0).padStart(9),
    fmt(s.latMax, 0).padStart(9),
    String(s.errors).padStart(7),
    String(s.timeouts).padStart(7),
    String(s.non2xx).padStart(8),
    fmt(s.errorRatePct, 2).padStart(7),
    fmt(s.serverCpuPctOneCore, 0).padStart(8),
    fmt(s.serverRssMaxMB, 0).padStart(8),
    fmt(s.machineFreeMemMinMB, 0).padStart(8),
  ].join(" ");

const main = async () => {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

  // --- warm-up: never let a cold path become a recorded data point ---------
  if (warmupSeconds > 0) {
    process.stdout.write("Warming up (" + warmupSeconds + "s @ 10 conn)... ");
    await runTest({
      path: ep.path,
      flow: isFlow ? REALISTIC_FLOW : null,
      connections: 10,
      duration: warmupSeconds,
      auth: ep.auth,
      expectStatus: ep.expectStatus || 200,
      label: "warmup",
    });
    console.log("done (discarded)\n");
  }

  header();

  const all = [];
  let aborted = null;

  outer: for (const conn of levels) {
    for (let r = 1; r <= repeat; r++) {
      const freeMB = os.freemem() / 1024 / 1024;
      if (freeMB < MIN_FREE_MEM_MB) {
        aborted = {
          reason: "LOAD_GENERATOR_MEMORY",
          detail:
            "Free RAM " + fmt(freeMB, 0) + " MB fell below the " +
            MIN_FREE_MEM_MB + " MB floor before running " + conn +
            " connections. Stopped to avoid swapping, which would corrupt the " +
            "measurement and is a load-generator limit, not a server limit.",
          atConnections: conn,
        };
        console.log("\n!! ABORTED: " + aborted.detail);
        break outer;
      }

      let res;
      try {
        res = await runTest({
          path: ep.path,
          flow: isFlow ? REALISTIC_FLOW : null,
          connections: conn,
          duration,
          auth: ep.auth,
          expectStatus: ep.expectStatus || 200,
          label: ep.name + "-c" + conn + "-r" + r,
        });
      } catch (e) {
        aborted = {
          reason: "LOAD_GENERATOR_ERROR",
          detail:
            "autocannon threw at " + conn + " connections: " + e.message +
            " - this is a load-generator failure, not a measured server limit.",
          atConnections: conn,
        };
        console.log("\n!! ABORTED: " + aborted.detail);
        break outer;
      }

      console.log(row(res.summary, r));
      all.push(res.summary);

      saveResult(
        outDir,
        ep.name + "-c" + conn + "-r" + r + "-" + stamp + ".json",
        { summary: res.summary, raw: res.raw }
      );

      // Let sockets drain out of TIME_WAIT and the event loop settle.
      await sleep(4000);
    }
  }

  console.log("-".repeat(112));

  saveResult(outDir, "_sweep-" + ep.name + "-" + stamp + ".json", {
    endpoint: ep,
    baseUrl: BASE_URL,
    duration,
    repeat,
    levels,
    cpuCount: CPU_COUNT,
    totalMemMB: os.totalmem() / 1024 / 1024,
    node: process.version,
    platform: os.platform() + " " + os.release(),
    startedAt: stamp,
    aborted,
    runs: all,
  });

  console.log(
    "Saved " + all.length + " runs to load-test-results/" + outDir + "/"
  );
  if (aborted) console.log("Sweep ended early: " + aborted.reason);
};

main().catch((e) => {
  console.error("Sweep failed:", e);
  process.exit(1);
});
