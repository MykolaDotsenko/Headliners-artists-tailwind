import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const html = readFileSync(resolve(root, "src/index.html"), "utf8");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

check(/<html\s+lang="en"/i.test(html), "Document must declare lang=\"en\".");
check(/<title>[^<]+<\/title>/i.test(html), "Document must have a non-empty title.");
check(
  /<meta\s+name="description"\s+content="[^"]+"/i.test(html),
  "Document must have a meta description.",
);
check(html.includes('href="#main-content"'), "Document must include a skip link.");
check((html.match(/<h1\b/gi) ?? []).length === 1, "Document must contain exactly one h1.");
check(!/\sonclick=|\sonload=|\sonchange=/i.test(html), "Inline event handlers are not allowed.");
check(
  !/<script(?![^>]*\ssrc=)[^>]*>/i.test(html),
  "Inline script blocks are not allowed.",
);
check(!html.includes("some button"), "Placeholder UI must not ship.");
check(!/Expirience|\bdont\b/i.test(html), "Known copy regressions must not ship.");

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
check(new Set(ids).size === ids.length, "All HTML ids must be unique.");

for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  check(ids.includes(match[1]), `Anchor target #${match[1]} does not exist.`);
}

for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
  check(/\salt="[^"]*"/i.test(image[0]), `Image is missing alt text: ${image[0]}`);
  check(/\swidth="\d+"/i.test(image[0]), `Image is missing width: ${image[0]}`);
  check(/\sheight="\d+"/i.test(image[0]), `Image is missing height: ${image[0]}`);
}

for (const match of html.matchAll(/(?:src|href)="(\.\/[^"#?]+)"/g)) {
  const path = resolve(root, "src", match[1].replace(/^\.\//, ""));
  check(existsSync(path), `Referenced local asset does not exist: ${match[1]}`);
}

const trackedFiles = execFileSync("git", ["ls-files"], {
  cwd: root,
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter(Boolean);

check(
  !trackedFiles.some((path) => path === "node_modules" || path.startsWith("node_modules/")),
  "node_modules must never be tracked.",
);
check(
  !trackedFiles.some((path) => path.endsWith(".DS_Store")),
  ".DS_Store files must never be tracked.",
);

check(
  packageJson.name === "headliners-festival-experience",
  "Package metadata must use the product name.",
);
check(packageJson.private === true, "Portfolio application package must be private.");
check(
  typeof packageJson.scripts?.test === "string" &&
    !packageJson.scripts.test.includes("no test specified"),
  "npm test must run real tests.",
);
check(
  !packageJson.dependencies || Object.keys(packageJson.dependencies).length === 0,
  "Static site must not ship unused runtime dependencies.",
);

if (failures.length > 0) {
  console.error("\nQuality audit failed:\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Quality audit passed: ${ids.length} ids, ${trackedFiles.length} tracked files, semantic and repository checks clean.`,
);
