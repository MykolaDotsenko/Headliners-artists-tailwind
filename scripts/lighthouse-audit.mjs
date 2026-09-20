import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { once } from "node:events";
import { join } from "node:path";

const root = process.cwd();
const outputDir = join(root, "artifacts/lighthouse");
const port = 4173;
const url = `http://127.0.0.1:${port}/`;
const lighthouseBin = join(root, "node_modules/.bin/lighthouse");

await mkdir(outputDir, { recursive: true });

const server = execFile(
  "python3",
  ["-m", "http.server", String(port), "--directory", "src"],
  { cwd: root },
);

let serverReady = false;
server.stdout?.on("data", () => {
  serverReady = true;
});
server.stderr?.on("data", (chunk) => {
  if (String(chunk).includes("Serving HTTP")) serverReady = true;
});

for (let attempt = 0; attempt < 50 && !serverReady; attempt += 1) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      serverReady = true;
      break;
    }
  } catch {
    // Server is still starting.
  }
  await new Promise((resolve) => setTimeout(resolve, 100));
}

if (!serverReady) {
  server.kill("SIGTERM");
  throw new Error("Static server did not become ready for Lighthouse.");
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd: root }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`${stderr || stdout || error.message}`));
        return;
      }
      resolve(stdout);
    });
  });
}

const runs = [];

try {
  for (let index = 1; index <= 3; index += 1) {
    const reportPath = join(outputDir, `run-${index}.json`);
    await run(lighthouseBin, [
      url,
      "--quiet",
      "--output=json",
      `--output-path=${reportPath}`,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
    ]);

    const report = JSON.parse(await readFile(reportPath, "utf8"));
    runs.push({
      reportPath,
      performance: report.categories.performance.score,
      accessibility: report.categories.accessibility.score,
      bestPractices: report.categories["best-practices"].score,
      seo: report.categories.seo.score,
      lcp: report.audits["largest-contentful-paint"].numericValue,
      cls: report.audits["cumulative-layout-shift"].numericValue,
    });
  }
} finally {
  server.kill("SIGTERM");
  await Promise.race([
    once(server, "exit"),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]).catch(() => {});
}

const ordered = [...runs].sort((a, b) => a.performance - b.performance);
const representative = ordered[Math.floor(ordered.length / 2)];

const failures = [];
const requireBudget = (condition, message) => {
  if (!condition) failures.push(message);
};

requireBudget(representative.performance >= 0.95, "Performance must be >= 95.");
requireBudget(representative.accessibility === 1, "Accessibility must be 100.");
requireBudget(representative.bestPractices === 1, "Best Practices must be 100.");
requireBudget(representative.seo === 1, "SEO must be 100.");
requireBudget(representative.lcp <= 2500, "LCP must be <= 2.5s.");
requireBudget(representative.cls <= 0.1, "CLS must be <= 0.10.");

const summary = {
  generatedAt: new Date().toISOString(),
  runs,
  representative,
  budgets: {
    performance: ">= 95",
    accessibility: "100",
    bestPractices: "100",
    seo: "100",
    lcpMs: "<= 2500",
    cls: "<= 0.10",
  },
};

await writeFile(
  join(outputDir, "summary.json"),
  JSON.stringify(summary, null, 2) + "\n",
);

if (failures.length > 0) {
  console.error("Lighthouse budgets failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `Lighthouse representative run: Performance ${Math.round(representative.performance * 100)}, Accessibility ${Math.round(representative.accessibility * 100)}, Best Practices ${Math.round(representative.bestPractices * 100)}, SEO ${Math.round(representative.seo * 100)}, LCP ${Math.round(representative.lcp)}ms, CLS ${representative.cls.toFixed(3)}.`,
);
