/*
  BeatGuider content generation — build-time, static-output-safe.
  Reads every content/articles/*.mdx file, validates frontmatter +
  cross-references, and emits the typed, client-importable metadata
  module consumed by src/lib/content/data.ts (and by the RSS/OG scripts).

  Run: `bun run content:gen` (also runs automatically inside
  `bun run dev`, `bun run build` and `bun run build:static`).

  Any validation failure prints every issue and exits non-zero, so a
  malformed or duplicate-slug article fails the build with clear errors.
*/

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, "..", "src", "lib", "content", "generated", "articles.ts");

async function main() {
  // Reuse the exact same loader + validation the article pages use.
  const { loadArticleFiles } = await import("../src/lib/content/loader");
  const { validateCrossReferences, validateDates } = await import("../src/lib/content/validate");
  const { gearDb } = await import("../src/lib/content/gear");

  const { articles, issues } = loadArticleFiles();
  const cross = validateCrossReferences(
    articles.map((a) => a.meta),
    gearDb
  );

  const failed = issues.length + cross.length > 0;
  if (failed) {
    console.error(`\n✗ BeatGuider content validation failed — ${issues.length + cross.length} issue(s):\n`);
    for (const i of issues) console.error(`  ✗ ${i.file} — ${i.field}: ${i.message}`);
    for (const i of cross) console.error(`  ✗ [${i.code}] ${i.field}: ${i.message}`);
    console.error("\nFix the MDX frontmatter in content/articles/ and re-run `bun run content:gen`.");
    process.exit(1);
  }

  /* Build-time date guard: no future publishedAt, no updatedAt < publishedAt. */
  const generatedAt = new Date().toISOString().slice(0, 10);
  const dateErrs = validateDates(articles.map((a) => a.meta), generatedAt);
  if (dateErrs.length > 0) {
    console.error(`\n✗ BeatGuider date validation failed — ${dateErrs.length} issue(s):\n`);
    for (const i of dateErrs) console.error(`  ✗ [${i.code}] ${i.field}: ${i.message}`);
    console.error("\nFix the MDX frontmatter dates and re-run `bun run content:gen`.");
    process.exit(1);
  }

  /* Build-time image warning: every article needs ≥1 hero + 2 in-body images.
     This is a warning (not a failure) — real photos must be added by the
     owner; we never fabricate placeholders. */
  const imageWarns: string[] = [];
  for (const a of articles) {
    const m = a.meta;
    const hasHero = !!m.hero;
    const imageCount = (m.images ?? []).length;
    if (!hasHero || imageCount < 2) {
      imageWarns.push(
        `  ✗ [${m.code}] ${m.slug} — hero: ${hasHero ? "yes" : "MISSING"} · ` +
          `in-body images: ${imageCount} (need ≥2)`
      );
    }
  }
  if (imageWarns.length > 0) {
    console.log(`\n⚠ BeatGuider image warning — ${imageWarns.length} article(s) short on images:`);
    for (const w of imageWarns) console.log(w);
    console.log("Add real photos to the article frontmatter (hero + images). Never fabricate placeholders.\n");
  }

  const metas = articles.map((a) => a.meta);

  /* Generation date (UTC, day precision) baked into the generated module.
     freshnessStatus() uses it as its deterministic reference point: with a
     statically-exported site the server HTML is rendered at build time, so
     any Date.now() evaluated again in the browser can disagree (React
     hydration mismatch). Pinning "now" to this literal keeps both sides
     identical while preserving the freshness-window behavior. It refreshes
     automatically on every `bun run content:gen` / `build:static`. */

  const header = `/*
  GENERATED FILE — DO NOT EDIT DIRECTLY.
  Source of truth: content/articles/*.mdx (frontmatter + MDX bodies).
  Regenerate with: bun run content:gen
  (Runs automatically as part of \`bun run dev\` / \`bun run build:static\`.)

  Plain, serializable data only — this module is imported by client
  components through src/lib/content/data.ts, so it must never depend
  on node:fs, zod or the MDX compiler. Article bodies are compiled
  separately at build time (src/lib/content/mdx.tsx).
*/
import type { ArticleMeta } from "../types";

/* UTC date this file was generated — the deterministic "as of" reference
   for freshnessStatus(). Day precision: freshness windows are in months. */
export const GENERATED_AT = "${generatedAt}";

export const articles: ArticleMeta[] = `;

  const body = JSON.stringify(metas, null, 2).replace(/\n/g, "\n") + ";\n";

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, `${header}${body}`, "utf8");

  console.log(`\n✓ ${metas.length} articles generated → src/lib/content/generated/articles.ts`);
  for (const a of metas) {
    console.log(`  ${a.code.padEnd(9)} ${a.slug.padEnd(28)} ${String(a.wordCount).padStart(4)} words · ${a.readingTime} min · ${a.category}`);
  }
}

main();
