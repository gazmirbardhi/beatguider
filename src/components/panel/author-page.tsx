"use client";

import Link from "next/link";
import { ModuleCard } from "@/components/panel/components";
import { articles } from "@/lib/content/data";

/* ════════════════════════════════════════════════════════════════
   AuthorPage — dedicated author page.
   Lists all articles by the author. Honest about BeatGuider being
   operated by a working DJ — no fabricated biographies, venues, or
   years of experience (spec §11).
   ════════════════════════════════════════════════════════════════ */

export function AuthorPage({ authorSlug }: { authorSlug: string }) {
  // Real byline from the articles data — slug → name reconstruction
  // mangles multi-case names ("beatguider-team" → "Beatguider Team").
  const authorName =
    articles.find((a) => a.author.toLowerCase().replace(/\s+/g, "-") === authorSlug)?.author ?? authorSlug;

  const authorArticles = articles.filter((a) => {
    const articleAuthorSlug = a.author.toLowerCase().replace(/\s+/g, "-");
    return articleAuthorSlug === authorSlug;
  });

  return (
    <div>
      {/* Hero header */}
      <section className="panel-surface border-b border-(--line)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <nav className="flex items-center gap-2 mb-4 text-xs" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-amber tap" style={{ color: "var(--mut)" }}>HOME</Link>
            <span style={{ color: "var(--mut)" }}>/</span>
            <span className="mono" style={{ color: "var(--amber)" }}>AUTHOR</span>
          </nav>
          <div className="flex items-center gap-5 flex-wrap">
            {/* Author avatar — a stylized LCD portrait, not a fabricated photo */}
            <div className="electronics w-20 h-20 flex items-center justify-center shrink-0">
              <span
                className="font-(family-name:--font-chakra) font-bold text-2xl"
                style={{ color: "var(--amber)" }}
              >
                {authorName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0">
              <h1
                className="font-(family-name:--font-chakra) font-bold text-3xl sm:text-4xl leading-tight mb-2"
                style={{ color: "var(--text2)" }}
              >
                {authorName}
              </h1>
              <div className="flex items-center gap-2">
                <span className="led led-g" aria-hidden="true" />
                <span className="silk" style={{ color: "var(--mut)" }}>
                  {authorArticles.length} articles · BeatGuider Team
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About — honest, no fabricated bio (spec §11) */}
      <section className="py-8 sm:py-10 chassis-seam">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-[68ch] electronics p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="led led-a led-breathe" aria-hidden="true" />
              <span className="silk" style={{ color: "var(--amber)" }}>About this author</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--body)" }}>
              {authorName} is the default byline for BeatGuider. BeatGuider is operated by a working DJ.
              We do not invent author biographies, years of experience, venues, tests or equipment usage
              (per the BeatGuider editorial policy). When an article is genuinely authored by a specific
              individual, the byline + a real, verifiable bio will appear here.
            </p>
            <p className="text-xs mt-3 mono" style={{ color: "var(--mut)" }}>
              &gt; this page is honest about its simplicity — no fabricated credentials
            </p>
          </div>
        </div>
      </section>

      {/* Articles by this author */}
      <section className="py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2
            className="font-(family-name:--font-chakra) font-semibold text-xl sm:text-2xl mb-4"
            style={{ color: "var(--text2)" }}
          >
            Articles by {authorName}
          </h2>
          {authorArticles.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--mut)" }}>
              No articles found for this author.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {authorArticles.map((a) => (
                <ModuleCard
                  key={a.code}
                  code={a.code}
                  title={a.title}
                  subtitle={a.description}
                  led={
                    a.experienceType === "hands-on" || a.experienceType === "long-term-owned"
                      ? "g"
                      : a.experienceType === "research-based"
                      ? "data"
                      : "a"
                  }
                  accent={
                    a.experienceType === "hands-on" || a.experienceType === "long-term-owned"
                      ? "g"
                      : a.experienceType === "research-based"
                      ? "data"
                      : "amber"
                  }
                  href={`/${a.category}/${a.slug}`}
                  meta={`${a.category} · ${a.publishedDate}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
