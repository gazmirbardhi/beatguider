"use client";

import Link from "next/link";
import { ModuleCard } from "./components";
import { Screws, TapeEdgeLabel } from "./components";
import { articles, gearDb, freshnessStatus } from "@/lib/content/data";

/* ════════════════════════════════════════════════════════════════
   CategoryIndex — shared category listing page.
   Renders a grid of article module cards for a given category,
   with a header plate + count. Used by /fix/, /gear/, /software/,
   /learn/, /mobile-dj/, /compare/.
   ════════════════════════════════════════════════════════════════ */

export function CategoryIndex({
  category,
  title,
  kicker,
  description,
}: {
  category: string;
  title: string;
  kicker: string;
  description: string;
}) {
  const catArticles = articles.filter((a) => a.category === category);
  const catGear = category === "gear" ? gearDb : [];

  return (
    <div>
      {/* Hero header */}
      <section className="panel-surface border-b border-[var(--line)]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 sm:py-16">
          <nav className="flex items-center gap-2 mb-4 text-xs" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--amber)]" style={{ color: "var(--mut)" }}>HOME</Link>
            <span style={{ color: "var(--mut)" }}>/</span>
            <span className="mono" style={{ color: "var(--amber)" }}>{category.toUpperCase()}</span>
          </nav>
          <h1
            className="font-[family-name:var(--font-chakra)] font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-3"
            style={{ color: "var(--text2)" }}
          >
            {title}
          </h1>
          <p className="text-base sm:text-lg max-w-[68ch]" style={{ color: "var(--body)" }}>
            {description}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="led led-g" aria-hidden="true" />
            <span className="silk" style={{ color: "var(--mut)" }}>
              {catArticles.length + catGear.length} entries · {kicker}
            </span>
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-10 sm:py-14 chassis-seam">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {catArticles.map((a) => (
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
                meta={`${a.publishedDate} · ${a.experienceType}`}
              />
            ))}
            {/* For the gear category, also show gear DB entries */}
            {catGear.map((g) => (
              <ModuleCard
                key={g.code}
                code={g.code}
                title={`${g.manufacturer} ${g.model}`}
                subtitle={`${g.category} · ${g.status === "active" ? "active" : "discontinued"}`}
                led={g.tested ? "g" : "off"}
                accent={g.tested ? "g" : "amber"}
                href={`/gear/${g.slug}`}
                meta={`Rel. ${g.releaseYear ?? "—"} · ${g.ownership}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
