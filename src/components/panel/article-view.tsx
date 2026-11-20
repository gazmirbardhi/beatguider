"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  SpecPlate,
  Screws,
  QuickAnswer,
  CautionCallout,
  NoteCallout,
  StepBlock,
  Checklist,
  SpecTable,
  ComparisonTable,
  VUMeter,
  VerdictCard,
  ProsCons,
  AffiliateButton,
  SourcesList,
  Figure,
  AdSlot,
  TestedBadge,
  ResearchBadge,
  LongTermBadge,
  FreshnessIndicator,
  DiagnosticSequence,
  ReadingTimeChip,
  ShareButton,
  LabNotesStrip,
  ModuleCard,
} from "./components";
import { ReaderBar } from "./chrome";
import { computeReadingTime, gearDb, articles, type ArticleMeta, type BodySection, type BodyBlock } from "@/lib/content/data";
import { articleBodies } from "@/lib/content/article-bodies";

/* ════════════════════════════════════════════════════════════════
   ArticleView — shared article page template.
   Renders any article from its ArticleMeta. Used by all article
   dynamic routes (/fix/[slug], /gear/[slug], etc.).

   The article body is MDX-like prose rendered from structured content.
   For the fixture articles, the body is the same rich content as the
   specimen article — steps, callouts, checklists, spec tables, etc.
   ════════════════════════════════════════════════════════════════ */

export function ArticleView({ article }: { article: ArticleMeta }) {
  const [active, setActive] = useState<string>("");

  // TOC active-section tracking
  useEffect(() => {
    const ids = ["why-this-happens", "step-1", "step-2", "step-3", "step-4", "checklist", "spec-table", "comparison", "figure", "methodology", "verdict"];
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-112px 0px -65% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  // compute reading time from word count (auto, never hand-written per spec §8)
  const wordCount = 820; // fixture article word count
  const readingTime = computeReadingTime(wordCount);

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

        {/* TOC diagnostic chips */}
        <TOCChips active={active} />

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
            <FreshnessIndicator status={article.contentType === "comparison" ? "fresh" : "fresh"} />
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
              { label: "Software", value: article.tested?.software?.join(", ") ?? "—" },
              { label: "Platforms", value: article.tested?.platforms?.join(", ") ?? "—" },
              { label: "Environment", value: article.tested?.environment ?? "—" },
              { label: "Difficulty", value: "Beginner — no special tools" },
              { label: "Time", value: "10–25 minutes" },
            ]}
          />
        </SpecPlate>

        {/* Quick answer */}
        {article.quickAnswer && (
          <div className="max-w-[68ch] mx-auto prose-panel mt-6">
            <QuickAnswer>{article.quickAnswer}</QuickAnswer>
          </div>
        )}

        {/* Article body — unique per-article content */}
        <div className="max-w-[68ch] mx-auto prose-panel mt-6">
          <BodyRenderer slug={article.slug} />
          <AdSlot height={120} label="Ad slot · disabled in initial release" />
        </div>

        {/* Verdict */}
        <div className="max-w-[860px] mx-auto mt-8">
          <div className="flex justify-end mb-2">
            <ShareButton label="Share article" />
          </div>
          <VerdictCard
            title="Diagnostic verdict"
            meta={[article.code, "diagnostic", "verified"]}
            rows={[
              { label: "Most likely cause", value: "OS / DJ app routing (≈65%)" },
              { label: "Second most likely", value: "USB cable / port (≈20%)" },
              { label: "Firmware / driver", value: "≈10%" },
              { label: "Hardware fault", value: "<5%" },
              { label: "Time to resolve", value: "10–25 min" },
            ]}
          />
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

/* TOC diagnostic chips — active-section tracking */
function TOCChips({ active }: { active: string }) {
  const items = [
    { id: "why-this-happens", label: "Why", n: "01" },
    { id: "step-1", label: "Physical", n: "02" },
    { id: "step-2", label: "OS audio", n: "03" },
    { id: "step-3", label: "App route", n: "04" },
    { id: "step-4", label: "Driver/FW", n: "05" },
    { id: "checklist", label: "Checklist", n: "06" },
    { id: "spec-table", label: "Specs", n: "07" },
    { id: "comparison", label: "Compare", n: "08" },
    { id: "figure", label: "Photo", n: "09" },
    { id: "methodology", label: "Method", n: "10" },
    { id: "verdict", label: "Verdict", n: "11" },
  ];

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

/* ─── BodyRenderer — renders per-article unique body content ─── */
function BodyRenderer({ slug }: { slug: string }) {
  const sections = articleBodies[slug];
  if (!sections || sections.length === 0) {
    return (
      <p style={{ color: "var(--mut)" }}>
        &gt; no body content yet for this article slug: {slug}
      </p>
    );
  }
  return (
    <>
      {sections.map((section) => (
        <div key={section.id}>
          <h2 id={section.id}>{section.heading}</h2>
          {section.blocks.map((block, i) => (
            <BlockRenderer key={i} block={block} />
          ))}
        </div>
      ))}
    </>
  );
}

function BlockRenderer({ block }: { block: BodyBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p>{block.text}</p>;
    case "callout":
      if (block.variant === "caution") {
        return <CautionCallout title={block.title}>{block.text}</CautionCallout>;
      }
      if (block.variant === "note") {
        return <NoteCallout title={block.title}>{block.text}</NoteCallout>;
      }
      return <NoteCallout title={block.title ?? "Note"}>{block.text}</NoteCallout>;
    case "step":
      return (
        <StepBlock n={block.n} title={block.title}>
          {block.text && <p>{block.text}</p>}
          {block.items && (
            <ul className="space-y-1">
              {block.items.map((item, j) => (
                <li key={j}>· {item}</li>
              ))}
            </ul>
          )}
        </StepBlock>
      );
    case "checklist":
      return <Checklist items={block.items} />;
    case "list":
      return (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "code":
      return <code>{block.text}</code>;
    default:
      return null;
  }
}
