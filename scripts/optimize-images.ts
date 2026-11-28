import sharp from "sharp";
import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.resolve("public");

/* Content-image dirs that get AVIF/WebP <picture> sources (ArticleImage
   derives `${base}.webp` / `${base}.avif` for every src). public/og is
   intentionally NOT processed: og:image meta tags are fetched by crawlers
   as the exact URL (always .png), so derivatives would be dead weight. */
const IMAGE_DIRS = [
  path.join(PUBLIC_DIR, "images", "author"),
  path.join(PUBLIC_DIR, "articles"),
  path.join(PUBLIC_DIR, "gear"),
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
  if (!fs.existsSync(dir)) return 0;

  const files = fs.readdirSync(dir);
  let converted = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") continue;

    const inputPath = path.join(dir, file);
    const base = inputPath.replace(/\.(png|jpg|jpeg)$/i, "");

    const avifPath = `${base}.avif`;
    const webpPath = `${base}.webp`;

    const srcMtime = fs.statSync(inputPath).mtimeMs;
    const fresh = (p: string) =>
      fs.existsSync(p) && fs.statSync(p).mtimeMs > srcMtime;

    // Skip only when BOTH derivatives exist and are newer than the source —
    // a missing or stale .webp alone used to never regenerate (the old
    // check keyed on .avif only).
    if (fresh(avifPath) && fresh(webpPath)) continue;

    try {
      await convertToAvif(inputPath, avifPath);
      await convertToWebp(inputPath, webpPath);
      converted++;
      console.log(`  ✓ ${path.relative(PUBLIC_DIR, inputPath)} → .avif + .webp`);
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
    total += count;
    console.log(`  Converted: ${count}\n`);
  }

  console.log(`✅ Total converted: ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
