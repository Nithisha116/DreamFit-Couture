/**
 * Core load-test runner.
 *
 * Wraps autocannon and, for every run, also samples:
 *   - server process CPU + RSS   (read from GET /health, which already returns
 *                                 process.cpuUsage() and process.memoryUsage())
 *   - load-generator machine CPU (os.cpus() tick deltas)
 *   - load-generator free RAM    (os.freemem())
 *
 * p95 is NOT in autocannon's default percentile set, so we record every 2xx
 * response latency into our own HDR histogram via autocannon's 'response'
 * event. Same values autocannon uses, just queryable at any percentile.
 * Nothing is interpolated.
 */
import autocannon from "autocannon";
import hdr from "hdr-histogram-js";
import os from "os";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

hdr.initWebAssemblySync();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const RESULTS_DIR = path.join(__dirname, "../../load-test-results");
const TOKEN_FILE = path.join(__dirname, ".token");

export const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5000";
export const CPU_COUNT = os.cpus().length;

export const readToken = () => {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  return fs.readFileSync(TOKEN_FILE, "utf8").trim();
};

// ---------------------------------------------------------------------------
// Machine-level CPU sampling (load generator side)
// ---------------------------------------------------------------------------
const cpuTicks = () => {
  let idle = 0;
  let total = 0;
  for (const c of os.cpus()) {
    for (const k of Object.keys(c.times)) total += c.times[k];
    idle += c.times.idle;
  }
  return { idle, total };
};

// ---------------------------------------------------------------------------
// Server-side sampling via /health
// ---------------------------------------------------------------------------
const probeHealth = async (timeoutMs = 10000) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(BASE_URL + "/health", { signal: ctrl.signal });
    if (!res.ok) return null;
    const j = await res.json();
    return { at: Date.now(), cpu: j.cpu, memory: j.memory, uptime: j.uptime };
  } catch {
    return null; // server saturated / refused - recorded as a gap, never faked
  } finally {
    clearTimeout(t);
  }
};

/**
 * CPU% of ONE core, from two process.cpuUsage() snapshots.
 * Node is largely single-threaded, so >100% means libuv threadpool work.
 */
const cpuPercentBetween = (a, b) => {
  if (!a || !b) return null;
  const wallUs = (b.at - a.at) * 1000;
  if (wallUs <= 0) return null;
  const usedUs = b.cpu.user - a.cpu.user + (b.cpu.system - a.cpu.system);
  return (usedUs / wallUs) * 100;
};

/**
 * Runs one autocannon test.
 */
export const runTest = async (cfg) => {
  const {
    path: reqPath,
    connections,
    duration,
    auth = false,
    pipelining = 1,
    flow = null,
    expectStatus = 200,
    label = "",
    timeout = 20,
  } = cfg;

  const headers = {};
  if (auth) {
    const tok = readToken();
    if (!tok) throw new Error("Auth requested but scripts/load-test/.token missing");
    headers.Authorization = "Bearer " + tok;
  }

  const latHist = hdr.build({
    useWebAssembly: true,
    bitBucketSize: 64,
    autoResize: true,
    lowestDiscernibleValue: 1,
    highestTrackableValue: 600000,
    numberOfSignificantValueDigits: 5,
  });

  const opts = {
    // NOTE: autocannon ignores opts.path when opts.url is set - it silently
    // requests "/" instead. The target path MUST be baked into the URL.
    // Verified against autocannon v8: url+path returned 200 from "/", while
    // the same path inside the URL returned the expected 404.
    url: flow ? BASE_URL : BASE_URL + reqPath,
    connections,
    duration,
    pipelining,
    timeout,
    headers,
    // GET only. Enforced here so a config typo cannot mutate live data.
    method: "GET",
  };

  if (flow) {
    // In requests[] mode the per-request path IS honoured, but top-level
    // headers are not merged in, so each entry carries its own.
    opts.requests = flow.map((p) => ({
      method: "GET",
      path: p,
      headers: { ...headers },
    }));
  }

  const cpuA = cpuTicks();
  const healthStart = await probeHealth();
  const samples = [];
  const freeMemSamples = [os.freemem()];

  const sampler = setInterval(async () => {
    freeMemSamples.push(os.freemem());
    const h = await probeHealth(5000);
    if (h) samples.push(h);
  }, 2000);

  const result = await new Promise((resolve, reject) => {
    const inst = autocannon(opts, (err, res) => (err ? reject(err) : resolve(res)));
    inst.on("response", (_client, statusCode, _bytes, responseTime) => {
      // Record whatever the endpoint is SUPPOSED to return. For the
      // auth-reject probe the correct answer is 401, so restricting this to
      // 2xx would throw away every sample and report no percentiles at all.
      const wanted =
        statusCode === expectStatus ||
        (expectStatus === 200 && statusCode >= 200 && statusCode < 300);
      if (wanted) {
        latHist.recordValue(Math.max(0, Math.round(responseTime)));
      }
    });
  });

  clearInterval(sampler);

  const healthEnd = await probeHealth();
  const cpuB = cpuTicks();

  const idleDelta = cpuB.idle - cpuA.idle;
  const totalDelta = cpuB.total - cpuA.total;
  const machineCpuPct = totalDelta > 0 ? (1 - idleDelta / totalDelta) * 100 : null;

  const serverCpuPct = cpuPercentBetween(healthStart, healthEnd);
  const live = [healthStart, ...samples, healthEnd].filter(Boolean);
  const rssValues = live.map((s) => s.memory.rss);
  const heapValues = live.map((s) => s.memory.heapUsed);

  // Responses that match what the endpoint is supposed to return.
  const expectedCount =
    expectStatus >= 200 && expectStatus < 300
      ? result["2xx"]
      : (result.statusCodeStats?.[String(expectStatus)]?.count ?? 0);
  const okCount = expectedCount;
  const totalReqs = result.requests.sent ?? result.requests.total ?? 0;

  const pct = (p) => (okCount > 0 ? latHist.getValueAtPercentile(p) : null);

  const summary = {
    label,
    path: flow ? "FLOW[" + flow.join(" -> ") + "]" : reqPath,
    connections,
    pipelining,
    durationRequested: duration,
    durationActual: result.duration,
    auth,
    expectStatus,

    // throughput
    rpsAvg: result.requests.average,
    rpsMean: result.requests.mean,
    rpsStddev: result.requests.stddev,
    rpsMin: result.requests.min,
    rpsMax: result.requests.max,
    totalRequests: totalReqs,
    totalCompleted: okCount + result.non2xx,
    bytesPerSec: result.throughput.average,
    totalBytes: result.throughput.total,

    // latency (ms) - mean/max from autocannon, percentiles from our histogram
    latAvg: result.latency.average,
    latMin: result.latency.min,
    latMax: result.latency.max,
    latStddev: result.latency.stddev,
    p50: pct(50),
    p90: pct(90),
    p95: pct(95),
    p99: pct(99),
    p999: pct(99.9),

    // failures
    errors: result.errors,
    timeouts: result.timeouts,
    non2xx: result.non2xx,
    resets: result.resets,
    mismatches: result.mismatches,
    status1xx: result["1xx"],
    status2xx: result["2xx"],
    status3xx: result["3xx"],
    status4xx: result["4xx"],
    status5xx: result["5xx"],
    statusCodeStats: result.statusCodeStats,

    // resources
    serverCpuPctOneCore: serverCpuPct,
    serverCpuPctMachine: serverCpuPct == null ? null : serverCpuPct / CPU_COUNT,
    serverRssMaxMB: rssValues.length ? Math.max(...rssValues) / 1024 / 1024 : null,
    serverRssStartMB: healthStart ? healthStart.memory.rss / 1024 / 1024 : null,
    serverHeapMaxMB: heapValues.length ? Math.max(...heapValues) / 1024 / 1024 : null,
    healthSamples: samples.length,
    healthProbeFailures: (healthStart ? 0 : 1) + (healthEnd ? 0 : 1),

    machineCpuPctAllCores: machineCpuPct,
    machineFreeMemMinMB: Math.min(...freeMemSamples) / 1024 / 1024,
    loadGenRssMB: process.memoryUsage().rss / 1024 / 1024,

    startedAt: result.start,
    finishedAt: result.finish,
  };

  const attempted = summary.totalRequests || 1;
  // An expected non-2xx (the 401 auth-reject probe) is a correct response,
  // not a failure. Count only responses that were NOT what we asked for.
  const totalResponses =
    result["1xx"] + result["2xx"] + result["3xx"] + result["4xx"] + result["5xx"];
  const unexpected = Math.max(0, totalResponses - okCount);
  const failed = summary.errors + summary.timeouts + unexpected;
  summary.errorRatePct = (failed / attempted) * 100;
  summary.expectedResponses = okCount;

  summary.bytesPerRequest =
    summary.totalRequests > 0 ? summary.totalBytes / summary.totalRequests : null;

  // Guard: prove the run actually hit the intended endpoint. A silently
  // mis-targeted run (see the url/path note above) is worse than no run at
  // all, so surface it loudly instead of letting it into the report.
  const codes = Object.keys(result.statusCodeStats || {});
  const dominant = codes.sort(
    (a, b) => result.statusCodeStats[b].count - result.statusCodeStats[a].count
  )[0];
  summary.observedStatusCodes = codes.join(",");
  summary.targetVerified =
    codes.length > 0 && String(expectStatus) === String(dominant);
  if (!summary.targetVerified && result.errors < attempted) {
    console.warn(
      "  !! target check: expected HTTP " + expectStatus + " but saw [" +
        (codes.join(",") || "none") + "] for " + summary.path
    );
  }

  return { summary, raw: result };
};

export const saveResult = (subdir, filename, payload) => {
  const dir = path.join(RESULTS_DIR, subdir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(payload, null, 2));
};

export const fmt = (v, d = 1) =>
  v === null || v === undefined || Number.isNaN(v) ? "n/a" : Number(v).toFixed(d);
