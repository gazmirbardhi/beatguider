/*
  BeatGuider frontmatter schema — parses one MDX article file into a
  typed ArticleMeta (without the derived wordCount/readingTime), with
  field-level error reporting. Used by BOTH build paths:
    - scripts/gen-content.ts  (generates src/lib/content/generated/articles.ts)
    - src/lib/content/loader.ts (Next.js server: article pages at build time)

  SERVER/BUILD ONLY — imports zod + gray-matter; must never be imported
  from client code (data.ts must not depend on this module).

  Malformed frontmatter, wrong slug-in-filename or duplicate <Section> ids
  surface as FileIssue[] — the callers print them and fail the build.
*/

import matter from "gray-matter";
import { z } from "zod";
import type { ArticleMeta } from "./types";
import { CATEGORY_IDS } from "./categories";
import { CODE_RE, ISO_DATE_RE, SLUG_RE, extractToc } from "./validate";

export type FileIssue = { file: string; field: string; message: string };

export type ParsedArticle = {
  /** Full metadata minus the build-derived fields. */
  meta: Omit<ArticleMeta, "wordCount" | "readingTime">;
  /** MDX body source (frontmatter stripped). */
  body: string;
};

/* YAML may hand us dates as Date objects (unquoted `2025-01-12`) —
   normalize to ISO yyyy-mm-dd strings, then enforce the shape. */
const isoDate = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))
  .refine((v) => ISO_DATE_RE.test(v), {
    message: "must be an ISO date string (yyyy-mm-dd), e.g. \"2025-01-12\"",
  });

/* YAML may hand us numbers where strings are expected (unquoted 2023). */
const stringOrNumber = z
  .union([z.string(), z.number()])
  .transform((v) => String(v));

const frontmatterSchema = z.strictObject({
  code: z
    .string()
    .regex(CODE_RE, 'must look like "FIX-001" / "GEAR-018" (UPPERCASE-###)'),
  slug: z
    .string()
    .regex(SLUG_RE, "lowercase letters, digits and single hyphens only"),
  title: z.string().min(1, "required"),
  description: z.string().min(1, "required"),
  /* Category enum derives from the category registry (categories.ts) —
     add/remove a category there and the validator follows automatically. */
  category: z.enum(CATEGORY_IDS),
  topic: z.string().min(1, "required"),
  tags: z.array(z.string().min(1)).min(1, "at least one tag required"),
  publishedDate: isoDate,
  updatedDate: isoDate.optional(),
  lastVerified: isoDate.optional(),
  publishedAt: isoDate.optional(),
  updatedAt: isoDate.optional(),
  author: z.string().min(1, "required"),
  contentType: z.enum([
    "guide",
    "review",
    "comparison",
    "roundup",
    "explainer",
    "business",
  ]),
  experienceType: z.enum([
    "hands-on",
    "long-term-owned",
    "software-tested",
    "research-based",
  ]),
  ownershipStatus: z.enum(["owned", "loaned", "n/a"]).optional(),
  tested: z
    .strictObject({
      equipment: z.array(z.string()).optional(),
      software: z.array(z.string()).optional(),
      platforms: z.array(z.string()).optional(),
      environment: z.string().optional(),
    })
    .optional(),
  quickAnswer: z.string().optional(),
  verdict: z
    .strictObject({
      title: z.string(),
      meta: z.array(z.string()).optional(),
      rows: z.array(
        z.strictObject({ label: z.string(), value: stringOrNumber })
      ),
    })
    .optional(),
  difficulty: z.string().optional(),
  estimatedTime: z.string().optional(),
  relatedArticles: z.array(z.string()).optional(),
  relatedGear: z.array(z.string()).optional(),
  sources: z
    .array(
      z.strictObject({
        title: z.string(),
        url: z.string().optional(),
        date: stringOrNumber.optional(),
      })
    )
    .optional(),
  affiliateEligible: z.boolean().optional(),
  /* Hero image — optional in frontmatter (build-time warning if absent).
     URLs must be absolute or start with /; dimensions are required. */
  hero: z
    .strictObject({
      src: z.string().min(1),
      alt: z.string().min(1),
      width: z.number().positive(),
      height: z.number().positive(),
      caption: z.string().optional(),
    })
    .optional(),
  images: z
    .array(
      z.strictObject({
        src: z.string().min(1),
        alt: z.string().min(1),
        width: z.number().positive(),
        height: z.number().positive(),
        caption: z.string().optional(),
      })
    )
    .optional(),
});

/* Article files are named NN-slug.mdx — the numeric prefix defines the
   site-wide article order (next-module CTAs, category listings), the slug
   part MUST equal the frontmatter slug. */
export const FILENAME_RE = /^(\d{2})-([a-z0-9-]+)\.mdx$/;

export function parseArticleFile(
  file: string,
  raw: string
): { ok: true; article: ParsedArticle } | { ok: false; issues: FileIssue[] } {
  const issues: FileIssue[] = [];
  const shortFile = file.split(/[\\/]/).slice(-2).join("/");

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch (e) {
    return {
      ok: false,
      issues: [
        {
          file: shortFile,
          field: "frontmatter",
          message: `YAML parse error: ${e instanceof Error ? e.message : String(e)}`,
        },
      ],
    };
  }

  const result = frontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      issues.push({
        file: shortFile,
        field: `frontmatter.${issue.path.join(".") || "(root)"}`,
        message: issue.message,
      });
    }
    return { ok: false, issues };
  }

  const fm = result.data;

  // filename ↔ slug consistency
  const nameMatch = file.split(/[\\/]/).pop()!.match(FILENAME_RE);
  if (!nameMatch) {
    issues.push({
      file: shortFile,
      field: "filename",
      message: `must match NN-slug.mdx (two-digit order prefix + slug), got "${file.split(/[\\/]/).pop()}"`,
    });
  } else if (nameMatch[2] !== fm.slug) {
    issues.push({
      file: shortFile,
      field: "slug",
      message: `frontmatter slug "${fm.slug}" does not match filename slug "${nameMatch[2]}" — rename the file or fix the frontmatter`,
    });
  }

  // TOC sanity — every <Section> id must be unique within the article
  const seen = new Set<string>();
  for (const t of extractToc(parsed.content)) {
    if (seen.has(t.id)) {
      issues.push({
        file: shortFile,
        field: "body",
        message: `duplicate <Section id="${t.id}"> — section ids must be unique`,
      });
    }
    seen.add(t.id);
  }

  if (issues.length > 0) return { ok: false, issues };

  /* Build the meta in a FIXED field order so the generated module and the
     RSC payload are deterministic. Only known fields survive — arbitrary
     YAML keys are dropped here (strict schema already rejected unknowns). */
  const meta: ParsedArticle["meta"] = {
    code: fm.code,
    slug: fm.slug,
    title: fm.title,
    description: fm.description,
    category: fm.category,
    topic: fm.topic,
    tags: fm.tags,
    publishedDate: fm.publishedDate,
    ...(fm.updatedDate !== undefined ? { updatedDate: fm.updatedDate } : {}),
    ...(fm.lastVerified !== undefined ? { lastVerified: fm.lastVerified } : {}),
    ...(fm.publishedAt !== undefined ? { publishedAt: fm.publishedAt } : {}),
    ...(fm.updatedAt !== undefined ? { updatedAt: fm.updatedAt } : {}),
    author: fm.author,
    contentType: fm.contentType,
    experienceType: fm.experienceType,
    ...(fm.ownershipStatus !== undefined
      ? { ownershipStatus: fm.ownershipStatus }
      : {}),
    ...(fm.tested !== undefined ? { tested: fm.tested } : {}),
    ...(fm.quickAnswer !== undefined && fm.quickAnswer.trim().length > 0
      ? { quickAnswer: fm.quickAnswer }
      : {}),
    ...(fm.verdict !== undefined ? { verdict: fm.verdict } : {}),
    ...(fm.difficulty !== undefined ? { difficulty: fm.difficulty } : {}),
    ...(fm.estimatedTime !== undefined
      ? { estimatedTime: fm.estimatedTime }
      : {}),
    ...(fm.relatedArticles !== undefined
      ? { relatedArticles: fm.relatedArticles }
      : {}),
    ...(fm.relatedGear !== undefined ? { relatedGear: fm.relatedGear } : {}),
    ...(fm.sources !== undefined ? { sources: fm.sources } : {}),
    ...(fm.affiliateEligible !== undefined
      ? { affiliateEligible: fm.affiliateEligible }
      : {}),
    ...(fm.hero !== undefined ? { hero: fm.hero } : {}),
    ...(fm.images !== undefined ? { images: fm.images } : {}),
  };

  return { ok: true, article: { meta, body: parsed.content.trim() + "\n" } };
}
