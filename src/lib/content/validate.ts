/*
  BeatGuider content validation + MDX body analysis — PURE functions only.
  No fs, no zod, no React: safe to import from client code (data.ts)
  and from Bun build scripts (scripts/gen-content.ts).

  Three responsibilities:
  1. Cross-article validation (duplicates, references, anti-fake-testing).
  2. TOC extraction from MDX bodies (<Section id="…" title="…" /> tags).
  3. Honest word counting for reading time (computed, never hand-written).
*/

import GithubSlugger from "github-slugger";
import type { ArticleMeta, GearEntry, ValidationError } from "./types";

/* ─── Slug / code shapes ─── */
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const CODE_RE = /^[A-Z]+-\d{3}$/;
export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/* ─── Canonical date helpers ───
   Derive the authoritative published/updated dates from the new
   publishedAt/updatedAt fields, falling back to the legacy
   publishedDate/updatedDate fields. Used by sitemap.ts, JSON-LD, and
   the homepage LAST PUB indicator. */
export function publishedAt(a: ArticleMeta): string {
  return a.publishedAt ?? a.publishedDate;
}
export function updatedAt(a: ArticleMeta): string {
  return a.updatedAt ?? a.updatedDate ?? a.publishedDate;
}

/* ─── Build-time date guard ───
   Throws if any publishedAt is in the future relative to GENERATED_AT,
   or if updatedAt < publishedAt. Called from scripts/gen-content.ts. */
export function validateDates(
  arts: ArticleMeta[],
  generatedAt: string
): ValidationError[] {
  const errs: ValidationError[] = [];
  const now = new Date(generatedAt);
  for (const a of arts) {
    const pub = new Date(publishedAt(a));
    const upd = new Date(updatedAt(a));
    if (!isNaN(pub.getTime()) && pub > now) {
      errs.push({
        code: a.code,
        field: "publishedAt",
        message: `publishedAt ${publishedAt(a)} is in the future (now ${generatedAt})`,
      });
    }
    if (!isNaN(upd.getTime()) && !isNaN(pub.getTime()) && upd < pub) {
      errs.push({
        code: a.code,
        field: "updatedAt",
        message: `updatedAt ${updatedAt(a)} is earlier than publishedAt ${publishedAt(a)}`,
      });
    }
  }
  return errs;
}
export function validateCrossReferences(
  arts: ArticleMeta[],
  gear: GearEntry[]
): ValidationError[] {
  const errs: ValidationError[] = [];

  // duplicate slug check
  const slugs = new Set<string>();
  arts.forEach((a) => {
    if (slugs.has(a.slug))
      errs.push({
        code: a.code,
        field: "slug",
        message: `Duplicate slug: ${a.slug}`,
      });
    slugs.add(a.slug);
  });

  // duplicate display-code check
  const codes = new Set<string>();
  [...arts, ...gear].forEach((a) => {
    if (codes.has(a.code))
      errs.push({
        code: a.code,
        field: "code",
        message: `Duplicate display code: ${a.code}`,
      });
    codes.add(a.code);
  });

  arts.forEach((a) => {
    // quickAnswer required for fix + compare types
    if (
      (a.contentType === "guide" && a.category === "fix") ||
      a.contentType === "comparison"
    ) {
      if (!a.quickAnswer || a.quickAnswer.trim().length === 0) {
        errs.push({
          code: a.code,
          field: "quickAnswer",
          message: "Required for fix/compare types",
        });
      }
    }
    // anti-fake-testing rule: hands-on MUST have non-empty tested.equipment
    if (
      a.experienceType === "hands-on" ||
      a.experienceType === "long-term-owned"
    ) {
      if (!a.tested || !a.tested.equipment || a.tested.equipment.length === 0) {
        errs.push({
          code: a.code,
          field: "tested.equipment",
          message:
            "Anti-fake-testing rule: hands-on experienceType requires non-empty tested.equipment",
        });
      }
    }
    // related gear must exist
    (a.relatedGear ?? []).forEach((g) => {
      if (!gear.find((x) => x.code === g)) {
        errs.push({
          code: a.code,
          field: "relatedGear",
          message: `Missing referenced gear: ${g}`,
        });
      }
    });
    // related articles must exist (slugs)
    (a.relatedArticles ?? []).forEach((slug) => {
      if (!arts.find((x) => x.slug === slug)) {
        errs.push({
          code: a.code,
          field: "relatedArticles",
          message: `Missing referenced article slug: ${slug}`,
        });
      }
    });
  });

  return errs;
}

/* ─── TOC extraction ───
   Article bodies mark sections with the MDX <Section> component:
     <Section id="step-1" title="Step 1 — physical chain" />
   The same ids anchor the rendered <h2> elements (see mdx.tsx), so every
   TOC chip resolves to a real element on the page — no dead anchors.

   Fallback: articles that use plain markdown `## Heading` lines instead
   of <Section> markers (the 8 imported articles without Section tags)
   get their TOC from those headings. rehype-slug (mdx.tsx) anchors them
   with github-slugger ids at render time; the SAME slugger produces the
   TOC ids here, so anchors always match — including duplicate-heading
   disambiguation (-1, -2 …), because both sides feed the slugger in
   document order. */
export type TocEntry = { id: string; title: string };

/* <Section/> markers and markdown headings (all levels) are matched by
   the combined TOKEN_RE inside extractToc — see the notes there. The
   slugger must see every heading (like rehype-slug does) so
   duplicate-text disambiguation stays in sync; only level-2 headings
   become TOC entries. */

/* Markdown emphasis/inline-markup stripping so the slug input matches
   the heading's rendered text content (what rehype-slug slugs):
   **bold**, `code`, [text](url) → text. (Emphasis chars are stripped
   pairwise; plain-word underscores are left alone because CommonMark
   does not treat intraword _ as emphasis.) */
function headingText(mdHeading: string): string {
  return mdHeading
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .trim();
}

export function extractToc(mdxBody: string): TocEntry[] {
  const out: TocEntry[] = [];
  const slugger = new GithubSlugger();

  /* Walk the body linearly so explicit <Section/> markers and plain
     `##` headings interleave in true document order — imported articles
     mix both styles, and the old early-return dropped every markdown
     heading as soon as one <Section> existed. The slugger sees every
     markdown heading (like rehype-slug) so duplicate-text disambiguation
     stays in sync; <Section> h2s carry explicit ids and never feed it. */
  const TOKEN_RE =
    /<Section\s+id="([^"]+)"\s+title="([^"]+)"\s*\/>|^(#{2,6})[ \t]+(.+?)[ \t]*$/gm;
  for (const m of mdxBody.matchAll(TOKEN_RE)) {
    if (m[1] !== undefined) {
      out.push({ id: m[1], title: m[2] });
      continue;
    }
    const title = headingText(m[4]);
    const id = slugger.slug(title);
    if (m[3] === "##" && title.length > 0) {
      out.push({ id, title });
    }
  }
  return out;
}

/* ─── Word counting — the honest way ───
   Reading time derives from the MDX body's actual words. The counter
   walks the raw MDX source: text outside JSX tags, plus quoted attribute
   values inside tags (component titles, step/checklist item strings).
   Anchor ids and urls are skipped — they are markup, not prose.
   Markdown list markers are stripped so they never count as words.
   Mirrors the guarantees of the old countBodyWords(): headings, prose,
   callout titles, step titles/items and checklist items all count. */
export function countMdxWords(mdxBody: string): number {
  // 1. strip markdown list markers (- / *) at line starts
  const noBullets = mdxBody.replace(/^[\t ]*[-*][\t ]+/gm, "");

  // 2. pull JSX tags out, keeping their quoted attribute strings
  //    (id/url values — anchors and links, not prose — are dropped first;
  //    this covers both attr="…" and { key: "…" } object styles)
  const attrStrings: string[] = [];
  const textOnly = noBullets.replace(/<[^>]*>/g, (tag) => {
    const cleaned = tag.replace(/(\b(?:id|url)\s*[:=]\s*)"[^"]*"/g, '$1""');
    for (const m of cleaned.matchAll(/"([^"]*)"/g)) attrStrings.push(m[1]);
    return " ";
  });

  const text = `${textOnly} ${attrStrings.join(" ")}`;
  return text.split(/\s+/).filter(Boolean).length;
}

/* reading-time auto-compute — words ÷ 200 (never hand-written) */
export function computeReadingTime(words: number): number {
  return Math.max(1, Math.round(words / 200));
}
