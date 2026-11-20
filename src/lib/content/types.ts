/*
  BeatGuider content types — shared by the MDX content pipeline
  (scripts/gen-content.ts + src/lib/content/loader.ts) and by the
  client-importable data module (src/lib/content/data.ts).

  Single source of truth for article metadata is the frontmatter of
  content/articles/*.mdx. ArticleMeta objects are BUILT from that
  frontmatter — never hand-written.

  Anti-fake-testing rule: an article with experienceType "hands-on" MUST
  carry non-empty tested.equipment. The TestedBadge component must only be
  rendered when this passes — never lit from article body text alone.
*/

export type ContentType =
  | "guide"
  | "review"
  | "comparison"
  | "roundup"
  | "explainer"
  | "business";

export type ExperienceType =
  | "hands-on"
  | "long-term-owned"
  | "software-tested"
  | "research-based";

export type ArticleCategory =
  | "gear"
  | "software"
  | "fix"
  | "learn"
  | "mobile-dj"
  | "compare"
  | "tools";

export type ArticleMeta = {
  code: string; // FIX-001, GEAR-014, SW-008, LEARN-021, CMP-003, TOOL-##
  slug: string;
  title: string;
  description: string;
  category: ArticleCategory;
  topic: string;
  tags: string[];
  publishedDate: string; // ISO yyyy-mm-dd
  updatedDate?: string;
  lastVerified?: string;
  author: string;
  contentType: ContentType;
  experienceType: ExperienceType;
  ownershipStatus?: "owned" | "loaned" | "n/a";
  tested?: {
    equipment?: string[];
    software?: string[];
    platforms?: string[];
    environment?: string;
  };
  quickAnswer?: string; // REQUIRED for fix + compare types
  /* Verdict stats, difficulty and estimated time are optional AND strictly
     article-specific. They render only when explicitly provided —
     never as template defaults (anti-fabrication rule). */
  verdict?: {
    title: string;
    meta?: string[]; // extra chips beyond the article code
    rows: { label: string; value: string }[];
  };
  difficulty?: string; // spec-plate row — shown only when provided
  estimatedTime?: string; // spec-plate row — shown only when provided
  /* Computed at build time from the MDX body (scripts/gen-content.ts +
     src/lib/content/loader.ts) — never hand-written, never frontmatter. */
  wordCount: number;
  readingTime: number; // minutes, words ÷ 200 (see computeReadingTime)
  relatedArticles?: string[]; // slugs
  relatedGear?: string[]; // gear codes
  sources?: { title: string; url?: string; date?: string }[];
  affiliateEligible?: boolean;
};

export type GearEntry = {
  code: string; // GEAR-###
  slug: string;
  manufacturer: string;
  model: string;
  category: string;
  releaseYear?: number;
  status: "active" | "discontinued";
  majorSpecs: { label: string; value: string }[];
  tested: boolean;
  ownership: "owned" | "loaned" | "not-owned";
  rating?: {
    label: string;
    value: number; // 0..100
  }[];
  pros?: string[];
  cons?: string[];
  retailers?: { retailer: string; url: string }[];
  priceLastChecked?: string;
  officialUrl?: string;
  relatedArticles?: string[];
};

/* Shape emitted by content validation (build-time). */
export type ValidationError = { code: string; field: string; message: string };

/* Unified search index entry (articles + gear + tools). */
export type SearchEntry = {
  code: string;
  title: string;
  description: string;
  href: string;
  led: "g" | "a" | "r" | "data" | "off";
  kind: "article" | "gear" | "tool";
};
