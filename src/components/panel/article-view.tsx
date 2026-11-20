"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import {
  SpecPlate,
  QuickAnswer,
  SpecTable,
  VerdictCard,
  SourcesList,
  AdSlot,
  TestedBadge,
  ResearchBadge,
  LongTermBadge,
  FreshnessIndicator,
  ReadingTimeChip,
  ShareButton,
  ModuleCard,
} from "./components";
import { ReaderBar } from "./chrome";
import { freshnessStatus, gearDb, articles, type ArticleMeta } from "@/lib/content/data";

/* ════════════════════════════════════════════════════════════════
   ArticleView — shared article page template.
   Renders any article from its ArticleMeta. Used by all article
   dynamic routes (/fix/[slug], /gear/[slug], etc.).

   The article body arrives as a pre-compiled MDX node (built at
   page-prerender time by src/lib/content/mdx.tsx from
   content/articles/<slug>.mdx) — the PANEL body components (steps,
   callouts, the interactive checklist) hydrate on the client exactly
   as before. TOC entries + reading time are computed from the same
   MDX source at build time and passed in as props.
   ════════════════════════════════════════════════════════════════ */

export function ArticleView({
  article,
  body,
  toc,
}: {
  article: ArticleMeta;
  body: ReactNode;
  toc: { id: string; label: string; n: string }[];
}) {
  const [active, setActive] = useState<string>("");

  // TOC entries derive from the article's real <Section> markers in its
  // MDX body — anchors always exist on the page (no dead in-page links).
  const tocItems = toc;

  // TOC active-section tracking — observes the real section ids
  useEffect(() => {
    if (tocItems.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-112px 0px -65% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    tocItems.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [article.slug]);

  // reading time — computed from the MDX body's real word count at build
  // time (scripts/gen-content.ts), never hand-written per spec §8
  const readingTime = article.readingTime;

  // find related gear
  const relatedGear = (article.relatedGear ?? [])
    .map((code) => gearDb.find((g) => g.code === code))
    .filter(Boolean);

  // find related articles (manually specified → topic relationships)
  const relatedArticles = (article.relatedArticles ?? [])
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter(Boolean);

  return (
    <>
      <ReaderBar code={article.code} title={article.title} backHref={`/${article.category}`} />

      <article id="specimen-article" className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8 sm:py-12">
        {/* breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-xs" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[var(--amber)]" style={{ color: "var(--mut)" }}>HOME</Link>
          <span style={{ color: "var(--mut)" }}>/</span>
          <Link href={`/${article.category}`} className="hover:text-[var(--amber)]" style={{ color: "var(--mut)" }}>
            {article.category.toUpperCase()}
          </Link>
          <span style={{ color: "var(--mut)" }}>/</span>
          <span className="mono" style={{ color: "var(--amber)" }}>{article.code}</span>
        </nav>

        {/* TOC diagnostic chips — derived from this article's body sections */}
        <TOCChips active={active} items={tocItems} />

        {/* Spec plate */}
        <SpecPlate>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="codechip">{article.code}</span>
            {article.experienceType === "hands-on" || article.experienceType === "long-term-owned" ? (
              <TestedBadge />
            ) : article.experienceType === "research-based" ? (
              <ResearchBadge />
            ) : (
              <LongTermBadge />
            )}
            {/* Freshness derives from real dates (lastVerified ?? updatedDate
                ?? publishedDate) via freshnessStatus() — see data.ts. */}
            <FreshnessIndicator status={freshnessStatus(article)} />
          </div>
          <h1
            className="font-[family-name:var(--font-chakra)] font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight mb-3"
            style={{ color: "var(--text2)" }}
          >
            {article.title}
          </h1>
          <p className="text-base mb-4" style={{ color: "var(--body)" }}>{article.description}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mono mb-5" style={{ color: "var(--mut)" }}>
            <span>By <Link href={`/author/${article.author.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-[var(--amber)]" style={{ color: "var(--text2)" }}>{article.author}</Link></span>
            <span>·</span>
            <span>Published {article.publishedDate}</span>
            {article.updatedDate && (
              <>
                <span>·</span>
                <span>Updated {article.updatedDate}</span>
              </>
            )}
            {article.lastVerified && (
              <>
                <span>·</span>
                <span>Verified {article.lastVerified}</span>
              </>
            )}
            <span>·</span>
            <ReadingTimeChip minutes={readingTime} />
          </div>
          <SpecTable
            caption="Spec plate"
            rows={[
              { label: "Applies to", value: article.tested?.equipment?.[0] ?? "—" },
              /* [].join(", ") yields "" — a truthy fallback (not ??) is required
                 so empty arrays render an em dash, never a blank cell (MOB-004). */
              { label: "Software", value: article.tested?.software?.join(", ") || "—" },
              { label: "Platforms", value: article.tested?.platforms?.join(", ") || "—" },
              { label: "Environment", value: article.tested?.environment ?? "—" },
              // Difficulty + time are per-article data — shown only when the
              // article explicitly provides them, never as template defaults.
              ...(article.difficulty ? [{ label: "Difficulty", value: article.difficulty }] : []),
              ...(article.estimatedTime ? [{ label: "Time", value: article.estimatedTime }] : []),
            ]}
          />
        </SpecPlate>

        {/* Quick answer */}
        {article.quickAnswer && (
          <div className="max-w-[68ch] mx-auto prose-panel mt-6">
            <QuickAnswer>{article.quickAnswer}</QuickAnswer>
          </div>
        )}

        {/* Article body — MDX compiled at build time, unique per article */}
        <div className="max-w-[68ch] mx-auto prose-panel mt-6">
          {body}
          <AdSlot height={120} label="Ad slot · disabled in initial release" />
        </div>

        {/* Verdict — rendered only when the article carries verified,
            article-specific verdict data (article.verdict). No article
            data → no verdict card. Never a template default. */}
        <div className="max-w-[860px] mx-auto mt-8">
          <div className="flex justify-end mb-2">
            <ShareButton label="Share article" />
          </div>
          {article.verdict && (
            <VerdictCard
              title={article.verdict.title}
              meta={[article.code, ...(article.verdict.meta ?? [])]}
              rows={article.verdict.rows}
            />
          )}
        </div>

        {/* Sources */}
        {article.sources && article.sources.length > 0 && (
          <div className="max-w-[860px] mx-auto mt-8">
            <h2 className="font-[family-name:var(--font-chakra)] font-semibold text-xl mb-2" style={{ color: "var(--text2)" }}>
              Sources
            </h2>
            <SourcesList sources={article.sources} />
          </div>
        )}

        {/* Affiliate disclosure */}
        {article.affiliateEligible && (
          <div className="max-w-[860px] mx-auto mt-8 pt-4 border-t border-[var(--line)]">
            <p className="text-xs" style={{ color: "var(--mut)" }}>
              Affiliate disclosure · BeatGuider may earn a commission on purchases made through
              affiliate links. Prices are set by the retailer. Affiliation does not influence
              test methodology or ratings — the Tested LED is lit only from validated frontmatter.
            </p>
          </div>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="max-w-[1280px] mx-auto mt-12">
            <h2 className="font-[family-name:var(--font-chakra)] font-semibold text-xl mb-4" style={{ color: "var(--text2)" }}>
              Related modules
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((r) => (
                <ModuleCard
                  key={r!.code}
                  code={r!.code}
                  title={r!.title}
                  subtitle={r!.description}
                  led={r!.experienceType === "hands-on" || r!.experienceType === "long-term-owned" ? "g" : "a"}
                  accent={r!.experienceType === "hands-on" || r!.experienceType === "long-term-owned" ? "g" : "amber"}
                  href={`/${r!.category}/${r!.slug}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Next article CTA — keeps readers on the site, lowers bounce rate */}
        <NextArticleCta currentArticle={article} />
      </article>
    </>
  );
}

/* Next article CTA — suggests the next article to read */
function NextArticleCta({ currentArticle }: { currentArticle: ArticleMeta }) {
  // find the next article in the same category, or wrap around
  const sameCategory = articles.filter((a) => a.category === currentArticle.category && a.slug !== currentArticle.slug);
  const nextArticle = sameCategory[0] ?? articles.find((a) => a.slug !== currentArticle.slug);
  if (!nextArticle) return null;

  return (
    <div className="max-w-[860px] mx-auto mt-12">
      <Link
        href={`/${nextArticle.category}/${nextArticle.slug}`}
        className="modcard block p-5 group transition-colors hover:bg-[var(--plate)]"
        style={{ borderLeftColor: "var(--acc)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="led led-a led-breathe" aria-hidden="true" />
          <span className="silk" style={{ color: "var(--mut)" }}>Next module · keep reading</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="codechip mb-1">{nextArticle.code}</span>
            <h3
              className="font-[family-name:var(--font-chakra)] font-semibold text-base sm:text-lg leading-tight mt-1"
              style={{ color: "var(--text2)" }}
            >
              {nextArticle.title}
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--body)" }}>
              {nextArticle.description}
            </p>
          </div>
          <span style={{ color: "var(--amber)" }} aria-hidden="true" className="flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </Link>
    </div>
  );
}

/* TOC diagnostic chips — active-section tracking. Items come from the
   article's real body sections, so every #anchor resolves. */
function TOCChips({ active, items }: { active: string; items: { id: string; label: string; n: string }[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mx-auto max-w-[1280px] mb-6">
      <nav aria-label="Diagnostic map" className="scroll-x -mx-4 sm:mx-0 px-4 sm:px-0">
        <ol className="flex items-center gap-2 no-scrollbar w-max pb-1">
          {items.map((it) => {
            const isActive = active === it.id;
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  className="diagchip"
                  style={isActive ? { background: "#161616", borderColor: "var(--amber)", boxShadow: "0 0 0 1px var(--amber), 0 0 8px rgba(255,176,0,0.25)" } : undefined}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span style={{ color: isActive ? "var(--amber)" : "var(--vu-g)" }}>{it.n}</span>
                  {it.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
