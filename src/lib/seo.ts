/*
  BeatGuider SEO layer — single source of truth for site-wide search
  engine optimization. Static-export compatible (pure functions, no
  runtime APIs).

  Guarantees enforced here:
  - every indexable page gets a canonical URL (never inherited from layout)
  - every page gets og:image + twitter card
  - every page gets exactly one JSON-LD graph entry appropriate to its type
  - all absolute URLs are HTTPS (enforced scheme, used in sitemap/feeds too)
*/

import type { Metadata } from "next";
import { articles, gearDb, type ArticleMeta } from "@/lib/content/data";
import {
  CATEGORIES,
  categoryName,
  getCategory,
} from "@/lib/content/categories";
import { publishedAt, updatedAt } from "@/lib/content/validate";

export const SITE_URL = "https://beatguider.com";
export const SITE_NAME = "BeatGuider";
export const SITE_TAGLINE = "Test. Fix. Mix.";

/* ─── Site author (single source of truth) ───
   Every byline is DJ Mondi. The public profiles here are mirrored into
   JSON-LD (TechArticle/Review author sameAs) and consumed by the author
   page — one place to update when a profile changes. */
export const SITE_AUTHOR = {
  name: "DJ Mondi",
  slug: "dj-mondi",
  sameAs: [
    "https://www.tiktok.com/@mondial_dj",
    "https://www.instagram.com/dj_mondial_/",
  ],
};

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/* ─── OG image assets (public/og/) ───
   Every article slug has a matching 1200×630 card in /og/.
   Category cards live in the category registry (categories.ts);
   tools keeps its own dedicated card. */
export const OG_BRAND = "/og/brand.png";
const TOOLS_OG = "/og/tool-bpm.png";

export function ogImageForPath(path: string): string {
  // normalize "/fix/" → "fix" before the category lookup
  const key = path.replace(/^\/+|\/+$/g, "");
  if (key === "tools") return TOOLS_OG;
  return getCategory(key)?.ogImage ?? OG_BRAND;
}

/* ─── pageMetadata — factory for static pages ───
   Produces a complete Metadata object with canonical URL, Open Graph
   and Twitter card. Used by every non-article page so no page ever
   inherits a wrong canonical from a parent layout. */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string; // e.g. "/fix" — canonical + og:url are derived from this
  ogImage?: string; // defaults to the path's category card or brand card
  type?: "website" | "article";
}): Metadata {
  const image = opts.ogImage ?? ogImageForPath(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: absoluteUrl(opts.path),
      siteName: SITE_NAME,
      type: opts.type ?? "website",
      locale: "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: `${opts.title} — ${SITE_NAME}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}

/* ─── JSON-LD builders (schema.org) ───
   Rendered via <script type="application/ld+json"> in server components. */

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "BeatGuider BG-1",
    url: SITE_URL,
    description:
      "Independent DJ gear, software, troubleshooting and education publication. Hands-on testing by a working DJ.",
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function collectionJsonLd(category: string, description: string) {
  const name = categoryName(category);
  const items = articles
    .filter((a) => a.category === category)
    .map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/${a.category}/${a.slug}`),
      name: a.title,
    }));
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${name} — ${SITE_NAME}`,
    description,
    url: absoluteUrl(`/${category}`),
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    mainEntity: { "@type": "ItemList", itemListElement: items },
  };
}

export function techArticleJsonLd(a: ArticleMeta) {
  const url = absoluteUrl(`/${a.category}/${a.slug}`);
  // Structured-data image URLs MUST be absolute (Google guideline) —
  // relative URLs get the article image ignored.
  const heroImage = a.hero ? absoluteUrl(a.hero.src) : absoluteUrl(`/og/${a.slug}.png`);
  const authorSlug = a.author.toLowerCase().replace(/\s+/g, "-");
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: a.title,
    description: a.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: publishedAt(a),
    dateModified: updatedAt(a),
    inLanguage: "en",
    /* wordCount is computed from the article's MDX body at build time
       (scripts/gen-content.ts) — honest, like everything else here. */
    wordCount: a.wordCount,
    keywords: a.tags.join(", "),
    articleSection: categoryName(a.category),
    author: {
      "@type": "Person",
      name: a.author,
      url: absoluteUrl(`/author/${authorSlug}`),
      jobTitle: "DJ / Editor",
      description:
        a.author +
        " — DJ and editor at BeatGuider, an independent DJ publication operated by a working DJ.",
      /* Identity consolidation: link the byline to the author's public
         profiles so engines can merge author entities across pages. */
      sameAs: SITE_AUTHOR.sameAs,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
    },
    image: [
      {
        "@type": "ImageObject",
        url: heroImage,
        ...(a.hero
          ? { width: a.hero.width, height: a.hero.height }
          : { width: 1200, height: 630 }),
      },
    ],
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
}

/* ─── Review JSON-LD (gear reviews only) ───
   Emits a schema.org Review of the tested product when — and only when —
   the article is a genuine hands-on/long-term review tied to a gear entry
   that carries real rating data. This mirrors the anti-fake-testing rule:
   no rating data → no Review node → no rich-result claim we can't back.
   Returns null for everything else; callers skip rendering when null. */
export function reviewJsonLd(a: ArticleMeta): object | null {
  if (a.contentType !== "review") return null;
  if (a.experienceType !== "hands-on" && a.experienceType !== "long-term-owned") return null;
  const gearCode = a.relatedGear?.[0];
  if (!gearCode) return null;
  const gear = gearDb.find((g) => g.code === gearCode);
  if (!gear?.rating || gear.rating.length === 0) return null;
  const value = Math.round(
    gear.rating.reduce((s, r) => s + r.value, 0) / gear.rating.length
  );
  const url = absoluteUrl(`/${a.category}/${a.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    url,
    headline: a.title,
    datePublished: publishedAt(a),
    dateModified: updatedAt(a),
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: a.author,
      url: absoluteUrl(`/author/${a.author.toLowerCase().replace(/\s+/g, "-")}`),
      sameAs: SITE_AUTHOR.sameAs,
    },
    itemReviewed: {
      "@type": "Product",
      name: `${gear.manufacturer} ${gear.model}`,
      brand: { "@type": "Brand", name: gear.manufacturer },
      /* OG card (guaranteed to exist) — real product photos replace this
         as they are captured for each review. */
      image: absoluteUrl(`/og/${a.slug}.png`),
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: value,
      bestRating: 100,
      worstRating: 0,
    },
  };
}

export function personJsonLd(
  name: string,
  slug: string,
  articleCount: number,
  opts?: { bio?: string; sameAs?: string[]; image?: string }
) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: absoluteUrl(`/author/${slug}`),
    jobTitle: "DJ & Editor",
    description:
      opts?.bio ??
      `${name} — byline for ${articleCount} published article${articleCount === 1 ? "" : "s"} on ${SITE_NAME}, an independent DJ publication operated by a working DJ.`,
    image: opts?.image ?? undefined,
    worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    sameAs: opts?.sameAs ?? [],
  };
}

/* ─── Sitemap manifest — every indexable route, derived from real data ───
   /style-guide is intentionally excluded (internal design reference,
   disallowed in robots.txt). */
type SitemapFrequency = "daily" | "weekly" | "monthly" | "yearly";

type SitemapEntry = {
  path: string;
  lastModified: Date;
  changeFrequency: SitemapFrequency;
  priority: number;
};

export function sitemapEntries(): SitemapEntry[] {
  const latestArticle = [...articles]
    .map((a) => new Date(updatedAt(a)))
    .sort((x, y) => y.getTime() - x.getTime())[0] ?? new Date();

  // Annotated so entries added below may use any SitemapFrequency — without
  // it, the array's element type would widen from the first literal only.
  const entries: SitemapEntry[] = [
    { path: "/", lastModified: latestArticle, changeFrequency: "weekly", priority: 1.0 },
  ];

  // category indexes — derived from the category registry (categories.ts)
  for (const c of CATEGORIES) {
    const catLatest =
      [...articles.filter((a) => a.category === c.id)]
        .map((a) => new Date(updatedAt(a)))
        .sort((x, y) => y.getTime() - x.getTime())[0] ?? latestArticle;
    entries.push({ path: `/${c.id}`, lastModified: catLatest, changeFrequency: "weekly", priority: 0.9 });
  }

  // tools
  entries.push({ path: "/tools", lastModified: latestArticle, changeFrequency: "monthly", priority: 0.9 });

  // articles
  for (const a of articles) {
    entries.push({
      path: `/${a.category}/${a.slug}`,
      lastModified: new Date(updatedAt(a)),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  // author pages (derived from real article authors)
  const authors = new Set(articles.map((a) => a.author.toLowerCase().replace(/\s+/g, "-")));
  for (const slug of authors) {
    entries.push({ path: `/author/${slug}`, lastModified: latestArticle, changeFrequency: "monthly", priority: 0.5 });
  }

  // static pages
  const staticPages: [string, number][] = [
    ["/about", 0.5],
    ["/how-we-test", 0.5],
    ["/editorial-policy", 0.4],
    ["/corrections-policy", 0.4],
    ["/affiliate-disclosure", 0.4],
    ["/privacy", 0.4],
    ["/contact", 0.4],
  ];
  for (const [path, priority] of staticPages) {
    entries.push({ path, lastModified: latestArticle, changeFrequency: "yearly", priority });
  }

  return entries;
}

/* Total indexable content count — used for honest reporting. */
export function indexableUrlCount(): number {
  return sitemapEntries().length;
}
