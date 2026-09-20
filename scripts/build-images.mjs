import { mkdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const legacyDir = join(root, "src/assets/images");
const sourceDir = join(root, "src/assets/source");
const outputDir = join(root, "src/assets/optimized");
const artifactDir = join(root, "artifacts");

const assets = [
  { name: "hero", legacy: "hero.jpg", masterWidth: 2200, widths: [960, 1600, 2200] },
  ...Array.from({ length: 7 }, (_, index) => ({
    name: `band${index + 1}`,
    legacy: `band${index + 1}.jpg`,
    masterWidth: 1600,
    widths: [480, 960],
  })),
];

await Promise.all([
  mkdir(sourceDir, { recursive: true }),
  mkdir(outputDir, { recursive: true }),
  mkdir(artifactDir, { recursive: true }),
]);

const report = { generatedAt: new Date().toISOString(), assets: [] };

async function ensureSourceMaster(asset) {
  const masterPath = join(sourceDir, `${asset.name}.webp`);
  if (existsSync(masterPath)) return masterPath;

  const legacyPath = join(legacyDir, asset.legacy);
  if (!existsSync(legacyPath)) {
    throw new Error(`Missing source master and legacy source for ${asset.name}`);
  }

  await sharp(legacyPath)
    .rotate()
    .resize({ width: asset.masterWidth, withoutEnlargement: true })
    .webp({ quality: 88, effort: 6, smartSubsample: true })
    .toFile(masterPath);

  return masterPath;
}

for (const asset of assets) {
  const masterPath = await ensureSourceMaster(asset);
  const metadata = await sharp(masterPath).metadata();
  const sourceWidth = metadata.width ?? asset.masterWidth;
  const widths = [...new Set(asset.widths.map((width) => Math.min(width, sourceWidth)))];
  const outputs = [];

  for (const width of widths) {
    const jobs = [
      ["avif", "avif", { quality: 56, effort: 6, chromaSubsampling: "4:2:0" }],
      ["webp", "webp", { quality: 80, effort: 6, smartSubsample: true }],
      ["jpeg", "jpg", { quality: 82, progressive: true, mozjpeg: true }],
    ];

    for (const [format, extension, options] of jobs) {
      const outputPath = join(outputDir, `${asset.name}-${width}.${extension}`);
      await sharp(masterPath)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        [format](options)
        .toFile(outputPath);

      const fileStat = await stat(outputPath);
      outputs.push({ file: basename(outputPath), width, format: extension, bytes: fileStat.size });
    }
  }

  const masterStat = await stat(masterPath);
  report.assets.push({
    name: asset.name,
    sourceMaster: basename(masterPath),
    sourceBytes: masterStat.size,
    outputs,
  });
}

const allOutputs = report.assets.flatMap((asset) => asset.outputs);
report.productionBytes = allOutputs.reduce((sum, output) => sum + output.bytes, 0);
report.productionMiB = Number((report.productionBytes / 1024 / 1024).toFixed(2));

const largest = [...allOutputs].sort((a, b) => b.bytes - a.bytes)[0];
if (largest && largest.bytes > 650 * 1024) {
  throw new Error(`Image budget exceeded: ${largest.file} is ${largest.bytes} bytes`);
}
if (report.productionBytes > 12 * 1024 * 1024) {
  throw new Error(`Total responsive image budget exceeded: ${report.productionMiB} MiB`);
}

await writeFile(join(artifactDir, "image-report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`Generated ${report.assets.length} image sets · ${report.productionMiB} MiB of responsive variants.`);
