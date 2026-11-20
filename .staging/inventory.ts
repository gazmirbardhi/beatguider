/*
  Staging inventory script — reads incoming MDX files from the extracted ZIP
  (NOT content/articles/) and emits a structured JSON + readable summary so
  we can classify, detect collisions/duplicates, and decide what's safe to
  import. Does NOT touch the live content directory.
*/
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const STAGING = join(process.cwd(), ".staging", "posts", "posts");
const EXISTING_SLUGS = new Set([
  "ddj-flx4-no-sound", "ddj-flx4-review", "ddj-flx2-vs-ddj-flx4",
  "rekordbox-export-usb", "first-30-minutes", "eq-mixing-basics",
  "rekordbox-crash-on-export", "mobile-dj-power-checklist",
]);

type Row = {
  file: string;
  slug: string;
  title: string;
  description: string;
  date?: string;
  updatedAt?: string;
  authorName?: string;
  category?: string;
  schemaType?: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  featured?: boolean;
  draft?: boolean;
  faqsCount: number;
  bodyChars: number;
  // body features
  hasTLDR: boolean;
  hasCallout: boolean;
  calloutTypes: string[];
  hasMarkdownH1: boolean;
  markdownHeadings: number;
  bodyImageRefs: string[];
  hasTODOEvidence: boolean;
  // collisions
  collidesWithExisting: boolean;
};

const files = readdirSync(STAGING).filter((f) => f.endsWith(".mdx")).sort();
const rows: Row[] = [];

for (const file of files) {
  const raw = readFileSync(join(STAGING, file), "utf8");
  let parsed: matter.GrayMatterFile<string>;
  try { parsed = matter(raw); } catch { continue; }
  const d = parsed.data as Record<string, unknown>;
  const body = parsed.content;
  const slug = file.replace(/\.mdx$/, "");
  const authorName = typeof d.author === "object" && d.author !== null && "name" in (d.author as object)
    ? String((d.author as { name: string }).name)
    : typeof d.author === "string" ? d.author : undefined;

  const calloutMatches = [...body.matchAll(/<Callout\s+type="([^"]+)"/g)];
  const bodyImageRefs = [...body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1])
    .concat([...body.matchAll(/<img\s+[^>]*src="([^"]+)"/g)].map((m) => m[1]));

  rows.push({
    file,
    slug,
    title: String(d.title ?? ""),
    description: String(d.description ?? ""),
    date: d.date ? String(d.date) : undefined,
    updatedAt: d.updatedAt ? String(d.updatedAt) : undefined,
    authorName,
    category: typeof d.category === "string" ? d.category : undefined,
    schemaType: typeof d.schemaType === "string" ? d.schemaType : undefined,
    tags: Array.isArray(d.tags) ? d.tags.map(String) : [],
    image: typeof d.image === "string" ? d.image : undefined,
    imageAlt: typeof d.imageAlt === "string" ? d.imageAlt : undefined,
    featured: typeof d.featured === "boolean" ? d.featured : undefined,
    draft: typeof d.draft === "boolean" ? d.draft : undefined,
    faqsCount: Array.isArray(d.faqs) ? d.faqs.length : 0,
    bodyChars: body.length,
    hasTLDR: /<TLDR>/.test(body),
    hasCallout: calloutMatches.length > 0,
    calloutTypes: [...new Set(calloutMatches.map((m) => m[1]))],
    hasMarkdownH1: /^#\s+\S/m.test(body),
    markdownHeadings: (body.match(/^#{1,6}\s+\S/gm) || []).length,
    bodyImageRefs,
    hasTODOEvidence: /TODO_EVIDENCE|owner test required|do not publish yet/i.test(body),
    collidesWithExisting: EXISTING_SLUGS.has(slug),
  });
}

// duplicate detection within incoming
const slugCounts = new Map<string, number>();
const titleCounts = new Map<string, number>();
for (const r of rows) {
  slugCounts.set(r.slug, (slugCounts.get(r.slug) ?? 0) + 1);
  const normTitle = r.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  titleCounts.set(normTitle, (titleCounts.get(normTitle) ?? 0) + 1);
}

writeFileSync(join(process.cwd(), ".staging", "inventory.json"), JSON.stringify(rows, null, 2));

// readable summary
const uniq = (arr: string[]) => [...new Set(arr)].sort();
const categories = uniq(rows.map((r) => r.category ?? "").filter(Boolean));
const schemaTypes = uniq(rows.map((r) => r.schemaType ?? "").filter(Boolean));
const authors = uniq(rows.map((r) => r.authorName ?? "").filter(Boolean));
const allCalloutTypes = uniq(rows.flatMap((r) => r.calloutTypes));
const allBodyImages = uniq(rows.flatMap((r) => r.bodyImageRefs));
const drafts = rows.filter((r) => r.draft === true);
const todoEvidence = rows.filter((r) => r.hasTODOEvidence);
const collideExisting = rows.filter((r) => r.collidesWithExisting);
const dupSlugs = [...slugCounts.entries()].filter(([, c]) => c > 1).map(([s]) => s);
const dupTitles = [...titleCounts.entries()].filter(([, c]) => c > 1).map(([t]) => t);
const withTLDR = rows.filter((r) => r.hasTLDR).length;
const withCallout = rows.filter((r) => r.hasCallout).length;
const withBodyImages = rows.filter((r) => r.bodyImageRefs.length > 0).length;
const withFaqs = rows.filter((r) => r.faqsCount > 0).length;
const withH1 = rows.filter((r) => r.hasMarkdownH1).length;

console.log("=== INCOMING MDX INVENTORY (79 files) ===\n");
console.log(`Total files: ${rows.length}`);
console.log(`Drafts (draft:true): ${drafts.length} -> ${drafts.map((r) => r.slug).join(", ")}`);
console.log(`TODO_EVIDENCE notices: ${todoEvidence.length} -> ${todoEvidence.map((r) => r.slug).join(", ")}`);
console.log(`Collide with existing 8 slugs: ${collideExisting.length} -> ${collideExisting.map((r) => r.slug).join(", ") || "(none)"}`);
console.log(`Duplicate slugs within incoming: ${dupSlugs.length} -> ${dupSlugs.join(", ") || "(none)"}`);
console.log(`Near-duplicate titles within incoming: ${dupTitles.length} -> ${dupTitles.join(" | ") || "(none)"}`);
console.log(`\nUnique category values (${categories.length}): ${categories.join(", ")}`);
console.log(`Unique schemaType values (${schemaTypes.length}): ${schemaTypes.join(", ")}`);
console.log(`Unique authors (${authors.length}): ${authors.join(", ")}`);
console.log(`\nBody features:`);
console.log(`  with <TLDR>: ${withTLDR}`);
console.log(`  with <Callout>: ${withCallout} (types: ${allCalloutTypes.join(", ")})`);
console.log(`  with frontmatter faqs: ${withFaqs}`);
console.log(`  with markdown H1 in body: ${withH1}`);
console.log(`  with body image refs: ${withBodyImages} (${allBodyImages.length} unique paths)`);
console.log(`\nDate range: ${uniq(rows.map((r) => r.date ?? "").filter(Boolean))[0]} .. ${uniq(rows.map((r) => r.date ?? "").filter(Boolean)).slice(-1)[0]}`);
console.log(`\nFull JSON written to .staging/inventory.json`);
