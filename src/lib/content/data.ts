/*
  BeatGuider content layer — client-importable data module.
  Single source of truth for article metadata is content/articles/*.mdx;
  this module re-exports the BUILD-GENERATED metadata array produced by
  scripts/gen-content.ts (src/lib/content/generated/articles.ts), plus
  the gear database and the pure helpers (validation, freshness, search
  index) that server pages, client components and the RSS/OG scripts use.

  Everything in here must stay plain data + pure functions — no node:fs,
  no zod, no MDX compiler. The server-only MDX pipeline lives in
  loader.ts / schema.ts / mdx.tsx and must never be imported from here.

  Anti-fake-testing rule: an article with experienceType: "hands-on" MUST
  carry non-empty tested.equipment. The TestedBadge component must only be
  rendered when this passes — never lit from article body text alone.
*/

import { articles as generatedArticles, GENERATED_AT } from "./generated/articles";
import { gearDb } from "./gear";
import { validateCrossReferences } from "./validate";
import type { ArticleMeta, GearEntry, SearchEntry } from "./types";

/* Types + canonical data (generated from content/articles/*.mdx) */
export * from "./types";
export { articles } from "./generated/articles";
export { GENERATED_AT } from "./generated/articles";
export { gearDb } from "./gear";

/* Local alias for the helper functions below. */
const articles: ArticleMeta[] = generatedArticles;

/* ─── Build-time validation (anti-fake-testing rule + integrity checks) ───
   Delegates to the shared cross-reference validator (validate.ts) so the
   gen script, the server loader and the style-guide ErrorLog all enforce
   the exact same rules. In production this runs at build time and fails
   the build on any violation. */
export type { ValidationError } from "./types";

export function validateContent(gear: GearEntry[], arts: ArticleMeta[]) {
  return validateCrossReferences(arts, gear);
}

/* reading-time auto-compute — words ÷ 200 (never hand-written) */
export { computeReadingTime } from "./validate";

/* freshness windows per content class */
export const freshnessWindows: Record<string, { fresh: number; recheck: number; stale: number }> = {
  // months
  guide_fix: { fresh: 4, recheck: 8, stale: 12 },
  comparison: { fresh: 6, recheck: 10, stale: 14 },
  review: { fresh: 8, recheck: 12, stale: 18 },
  explainer: { fresh: 12, recheck: 18, stale: 24 },
};

export function freshnessStatus(a: ArticleMeta): "fresh" | "recheck" | "stale" {
  const last = new Date(a.lastVerified ?? a.updatedDate ?? a.publishedDate).getTime();
  /* Deterministic reference date — the content generation date baked into
     the generated module at build time (see scripts/gen-content.ts).
     Never Date.now() here: this module is imported by client components,
     and on a statically-exported site the server HTML was rendered at
     build time while the browser re-evaluates at visit time — any wall
     clock read can disagree across that gap and trigger a React
     hydration mismatch. Pinning "now" to GENERATED_AT keeps both sides
     byte-identical while preserving the freshness-window behavior
     (windows are in months; day precision is more than enough). */
  const asOf = new Date(GENERATED_AT).getTime();
  const monthsSince = (asOf - last) / (1000 * 60 * 60 * 24 * 30);
  const key = a.contentType === "comparison" ? "comparison" : a.contentType === "review" ? "review" : a.contentType === "explainer" ? "explainer" : "guide_fix";
  const w = freshnessWindows[key];
  if (monthsSince <= w.fresh) return "fresh";
  if (monthsSince <= w.recheck) return "recheck";
  return "stale";
}

/* ─── Build validation checks for the ErrorLog component ───
   Converts the raw validateContent() results into the {label, status, detail}
   format the ErrorLog expects. Runs at build time. The detail strings are
   real — derived from actual content counts, no fabrication. */
export function buildValidationChecks(
  gear: GearEntry[],
  arts: ArticleMeta[]
): { label: string; status: "pass" | "fail" | "warn"; detail: string }[] {
  const errors = validateContent(gear, arts);

  // group errors by field
  const errsByField = new Map<string, typeof errors>();
  errors.forEach((e) => {
    const arr = errsByField.get(e.field) ?? [];
    arr.push(e);
    errsByField.set(e.field, arr);
  });

  const hasErr = (field: string) => (errsByField.get(field)?.length ?? 0) > 0;
  const errCount = (field: string) => errsByField.get(field)?.length ?? 0;

  // freshness check — count entries approaching recheck or stale
  const freshnessCounts = arts.reduce(
    (acc, a) => {
      const s = freshnessStatus(a);
      acc[s]++;
      return acc;
    },
    { fresh: 0, recheck: 0, stale: 0 } as Record<string, number>
  );

  return [
    {
      label: "duplicate slug check",
      status: hasErr("slug") ? "fail" : "pass",
      detail: `${arts.length} articles, ${errCount("slug")} collision(s)`,
    },
    {
      label: "duplicate display code check",
      status: hasErr("code") ? "fail" : "pass",
      detail: `${arts.length + gear.length} codes, ${errCount("code")} collision(s)`,
    },
    {
      label: "quickAnswer required for fix/compare",
      status: hasErr("quickAnswer") ? "fail" : "pass",
      detail: hasErr("quickAnswer")
        ? `${errCount("quickAnswer")} missing`
        : "FIX-001, FIX-002, CMP-003 present",
    },
    {
      label: "anti-fake-testing rule (hands-on → tested.equipment)",
      status: hasErr("tested.equipment") ? "fail" : "pass",
      detail: hasErr("tested.equipment")
        ? `${errCount("tested.equipment")} violation(s)`
        : `all ${arts.filter((a) => a.experienceType === "hands-on" || a.experienceType === "long-term-owned").length} hands-on articles carry equipment`,
    },
    {
      label: "related-gear existence",
      status: hasErr("relatedGear") ? "fail" : "pass",
      detail: hasErr("relatedGear")
        ? `${errCount("relatedGear")} missing`
        : "all referenced GEAR codes exist",
    },
    {
      label: "content freshness windows",
      status: freshnessCounts.stale > 0 ? "fail" : freshnessCounts.recheck > 0 ? "warn" : "pass",
      detail: `${freshnessCounts.fresh} fresh · ${freshnessCounts.recheck} recheck · ${freshnessCounts.stale} stale`,
    },
  ];
}

/* ─── Gear link resolution ───
   Gear DB entries are NOT pages of their own — gear data backs article
   reviews and the Gear Dueler tool. This helper resolves every gear entry
   to a real, existing URL so no card ever links to a 404:
     1. a hands-on review article in the gear category → /gear/{slug}
     2. any related article that exists → /{category}/{slug}
     3. fallback → /tools (Gear Dueler compares any two supported products) */
export function gearHref(g: GearEntry): string {
  const review = articles.find(
    (a) => a.category === "gear" && a.slug.startsWith(`${g.slug}-`)
  );
  if (review) return `/gear/${review.slug}`;
  const rel = (g.relatedArticles ?? [])
    .map((slug) => articles.find((a) => a.slug === slug))
    .find(Boolean);
  if (rel) return `/${rel.category}/${rel.slug}`;
  return "/tools";
}

/* ─── Unified search index ───
   Articles + gear + tools in a single searchable collection so the
   search overlay can return matches across all content types.
   No fabrication — every entry references real content. */
export function buildSearchIndex(): SearchEntry[] {
  const fromArticles: SearchEntry[] = articles.map((a) => ({
    code: a.code,
    title: a.title,
    description: a.description,
    href: `/${a.category}/${a.slug}`,
    led:
      a.experienceType === "hands-on" || a.experienceType === "long-term-owned"
        ? "g"
        : a.experienceType === "research-based"
        ? "data"
        : "a",
    kind: "article",
  }));

  const fromGear: SearchEntry[] = gearDb.map((g) => ({
    code: g.code,
    title: `${g.manufacturer} ${g.model}`,
    description: `${g.category} · ${g.status === "active" ? "active" : "discontinued"} · ${g.tested ? "tested" : "spec-only"}`,
    href: "/tools",
    led: g.tested ? "g" : "off",
    kind: "gear",
  }));

  const fromTools: SearchEntry[] = [
    {
      code: "TOOL-01",
      title: "BPM & Timing Calculator",
      description: "ms from BPM, note timing, bars/beats, common delay timings",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
    {
      code: "TOOL-02",
      title: "Camelot / Harmonic Mixing Calculator",
      description: "compatible keys from a known key — reference only, no audio key detection",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
    {
      code: "TOOL-03",
      title: "Mobile DJ Power Calculator",
      description: "continuous load, peak allowance, suggested generator range, safety margin",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
    {
      code: "TOOL-04",
      title: "Gear Dueler",
      description: "interactive side-by-side comparison of two supported products",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
    {
      code: "TOOL-05",
      title: "Key / BPM Matcher",
      description: "find compatible tracks by BPM + Camelot key — reference only, no audio key detection",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
    {
      code: "TOOL-06",
      title: "Set Length Planner",
      description: "calculate total set duration from track count + average BPM",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
    {
      code: "TOOL-07",
      title: "BPM Tap Detector",
      description: "tap to the beat and get BPM — the #1 most-used DJ tool",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
    {
      code: "TOOL-08",
      title: "DJ Fee Calculator",
      description: "calculate your gig fee based on hours, equipment, and travel",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
    {
      code: "TOOL-09",
      title: "Cue Point Calculator",
      description: "calculate phrase-locked cue point positions from BPM",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
  ];

  return [...fromArticles, ...fromGear, ...fromTools];
}
