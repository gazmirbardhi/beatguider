import sharp from "sharp";
import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.resolve("public");
const IMAGE_DIRS = [
  path.join(PUBLIC_DIR, "images", "author"),
  path.join(PUBLIC_DIR, "images", "articles"),
  path.join(PUBLIC_DIR, "images", "hero"),
  path.join(PUBLIC_DIR, "og"),
];

// AVIF quality: 30 = good balance of size/quality for photos
// WebP quality: 80 = high quality fallback
const AVIF_QUALITY = 30;
const WEBP_QUALITY = 80;

async function convertToAvif(input: string, output: string) {
  await sharp(input)
    .avif({ quality: AVIF_QUALITY, effort: 6 })
    .toFile(output);
}

async function convertToWebp(input: string, output: string) {
  await sharp(input)
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(output);
}

async function processDirectory(dir: string) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  let converted = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") continue;

    const inputPath = path.join(dir, file);
    const base = inputPath.replace(/\.(png|jpg|jpeg)$/i, "");

    const avifPath = `${base}.avif`;
    const webpPath = `${base}.webp`;

    // Skip if AVIF already exists and is newer than source
    if (
      fs.existsSync(avifPath) &&
      fs.statSync(avifPath).mtimeMs > fs.statSync(inputPath).mtimeMs
    ) {
      continue;
    }

    try {
      await convertToAvif(inputPath, avifPath);
      await convertToWebp(inputPath, webpPath);
      converted++;
      console.log(`  ✓ ${file} → .avif + .webp`);
    } catch (err) {
      console.error(`  ✗ ${file}: ${err}`);
    }
  }

  return converted;
}

async function main() {
  console.log("🖼 Image optimization — converting PNG/JPG to AVIF + WebP\n");

  let total = 0;
  for (const dir of IMAGE_DIRS) {
    console.log(`Scanning: ${path.relative(PUBLIC_DIR, dir)}/`);
    const count = await processDirectory(dir);
    if (count) total += count!;
    console.log(`  Converted: ${count ?? 0}\n`);
  }

  console.log(`✅ Total converted: ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});