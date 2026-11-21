"use client";

import Link from "next/link";
import { articles, gearDb, freshnessStatus } from "@/lib/content/data";
import { CATEGORIES } from "@/lib/content/categories";

/* ════════════════════════════════════════════════════════════════
   Clean homepage sections — clutter-free.
   Hero + Latest Articles + Category Browser (articles grouped by
   category) + Newsletter CTA. Everything else lives on dedicated pages.
   ════════════════════════════════════════════════════════════════ */

/* ─── 1. SIMPLIFIED HERO ─── */
export function SimplifiedHero({ entryCount, lastPublish }: { entryCount: number; lastPublish: string }) {
  const intents = [
    { label: "Fix a problem", desc: "Troubleshooting guides for DJ hardware & software", href: "/fix", led: "led led-r", accent: "var(--err)" },
    { label: "Compare gear", desc: "Hands-on reviews + side-by-side comparisons", href: "/gear", led: "led led-g", accent: "var(--ok)" },
    { label: "Learn DJing", desc: "Practical technique guides from a working DJ", href: "/learn", led: "led led-a", accent: "var(--amber)" },
  ];

  return (
    <section id="top" className="panel-surface border-b border-[var(--line)]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 sm:py-20">
        <div className="flex items-center gap-2 mb-4">
          <span className="led led-g" aria-hidden="true" />
          <span className="silk" style={{ color: "var(--panel-silk-muted)" }}>Independent DJ test bench · BG-1</span>
        </div>
        <h1
          className="font-[family-name:var(--font-chakra)] font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight"
          style={{ color: "var(--text2)" }}
        >
          Test. Fix. <span style={{ color: "var(--amber)" }}>Mix.</span>
        </h1>
        <p className="mt-5 text-base sm:text-lg max-w-[58ch]" style={{ color: "var(--body)" }}>
          BeatGuider is an independent DJ gear, software, troubleshooting and education
          publication operated by a working DJ. Hands-on testing, real specs, honest verdicts.
        </p>

        {/* 3 intent paths */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {intents.map((it) => (
            <Link
              key={it.label}
              href={it.href}
              className="modcard group block p-5 transition-colors hover:bg-[var(--plate)]"
              style={{ borderLeftColor: it.accent }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={it.led} aria-hidden="true" />
                <span className="silk-lg" style={{ color: "var(--text2)" }}>{it.label}</span>
              </div>
              <p className="text-sm" style={{ color: "var(--body)" }}>{it.desc}</p>
            </Link>
          ))}
        </div>

        {/* quick links — stacked full-width on mobile so the three CTAs
            never wrap into the floating scroll-to-top button; inline row
            from sm up. min-h-11 gives a 44px touch target on phones. */}
        <div className="mt-8 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <Link href="/tools" className="hwbtn hwbtn-amber min-h-11 w-full sm:w-auto justify-center sm:justify-start">
            <span>Open tools</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href="/compare" className="hwbtn min-h-11 w-full sm:w-auto justify-center">Compare gear</Link>
          <Link href="/mobile-dj" className="hwbtn min-h-11 w-full sm:w-auto justify-center">Mobile DJ</Link>
        </div>
      </div>
    </section>
  );
}

/* ─── 2. LATEST ARTICLES ─── */
export function LatestArticles() {
  const latest = [...articles]
    .sort((a, b) => (b.publishedDate > a.publishedDate ? 1 : -1))
    .slice(0, 6);

  return (
    <section id="latest" className="chassis-seam py-10 sm:py-14">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex items-baseline gap-3 mb-6 flex-wrap">
          <span className="codechip">SEC-01</span>
          <h2 className="font-[family-name:var(--font-chakra)] font-semibold text-2xl sm:text-3xl" style={{ color: "var(--text2)" }}>
            Latest
          </h2>
          <span className="silk" style={{ color: "var(--panel-silk-muted)" }}>— recent articles</span>
          <div className="flex-1 h-px ml-2" style={{ background: "var(--line)" }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {latest.map((a) => {
            const led = a.experienceType === "hands-on" || a.experienceType === "long-term-owned"
              ? "led led-g" : a.experienceType === "research-based" ? "led led-data" : "led led-a";
            return (
              <Link
                key={a.code}
                href={`/${a.category}/${a.slug}`}
                className="modcard group block p-4 transition-colors hover:bg-[var(--plate)]"
                style={{
                  borderLeftColor: a.experienceType === "hands-on" || a.experienceType === "long-term-owned"
                    ? "var(--ok)" : "var(--amber)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={led} aria-hidden="true" />
                  <span className="codechip">{a.code}</span>
                  <span className="silk" style={{ color: "var(--panel-silk-muted)" }}>{a.category}</span>
                </div>
                <h3 className="font-[family-name:var(--font-chakra)] font-semibold text-base sm:text-lg leading-tight" style={{ color: "var(--text2)" }}>
                  {a.title}
                </h3>
                <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--body)" }}>{a.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="silk" style={{ color: "var(--panel-silk-muted)" }}>{a.publishedDate}</span>
                  <span style={{ color: "var(--panel-silk-muted)" }}>·</span>
                  <span className="silk" style={{ color: "var(--panel-silk-muted)" }}>{a.readingTime} min read</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── 3. CATEGORY BROWSER — every article grouped by its category ───
   Groups derive from the category registry (categories.ts) ∩ real
   articles: a category with zero articles never renders, and a new
   category appears here automatically once it has content. Long lists
   scroll inside a capped, panel-styled scroll area. */
export function CategoryBrowser() {
  const groups = CATEGORIES.map((def) => ({
    def,
    items: articles.filter((a) => a.category === def.id),
  })).filter((g) => g.items.length > 0);

  return (
    <section id="categories" className="chassis-seam py-10 sm:py-14">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex items-baseline gap-3 mb-6 flex-wrap">
          <span className="codechip">SEC-02</span>
          <h2 className="font-[family-name:var(--font-chakra)] font-semibold text-2xl sm:text-3xl" style={{ color: "var(--text2)" }}>
            Categories
          </h2>
          <span className="silk" style={{ color: "var(--panel-silk-muted)" }}>— every article, grouped by category</span>
          <div className="flex-1 h-px ml-2" style={{ background: "var(--line)" }} />
        </div>

        <div className="space-y-5">
          {groups.map((g) => (
            <article key={g.def.id} className="modcard overflow-hidden">
              {/* group header — category name, live count, kicker, open link */}
              <div
                className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 sm:px-5 py-3 border-b border-[var(--line)]"
                style={{ background: "var(--plate)" }}
              >
                <span className="led led-a" aria-hidden="true" />
                <Link
                  href={`/${g.def.id}`}
                  className="font-[family-name:var(--font-chakra)] font-semibold text-lg tracking-tight hover:text-[var(--amber)] transition-colors"
                  style={{ color: "var(--text2)" }}
                >
                  {g.def.name}
                </Link>
                <span className="silk" style={{ color: "var(--panel-silk-muted)" }}>
                  {g.items.length} {g.items.length === 1 ? "article" : "articles"} · {g.def.kicker}
                </span>
                <Link
                  href={`/${g.def.id}`}
                  className="ml-auto hwbtn !text-[0.6875rem] !py-1.5"
                  aria-label={`Open all ${g.def.name} articles`}
                >
                  <span>Open {g.def.name}</span>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>

              {/* grouped article rows — capped height, panel scrollbar */}
              <div className="max-h-96 overflow-y-auto scroll-y">
                <ul>
                  {g.items.map((a) => {
                    const led =
                      a.experienceType === "hands-on" || a.experienceType === "long-term-owned"
                        ? "led led-g"
                        : a.experienceType === "research-based"
                        ? "led led-data"
                        : "led led-a";
                    return (
                      <li key={a.code}>
                        <Link
                          href={`/${a.category}/${a.slug}`}
                          className="flex items-center gap-3 px-4 sm:px-5 py-2.5 border-b border-[var(--line)] last:border-b-0 transition-colors hover:bg-[var(--plate)] group/row"
                        >
                          <span className={led} aria-hidden="true" />
                          <span className="codechip flex-shrink-0">{a.code}</span>
                          <span
                            className="flex-1 min-w-0 line-clamp-2 text-sm font-medium leading-snug group-hover/row:text-[var(--text2)] transition-colors"
                            style={{ color: "var(--body)" }}
                          >
                            {a.title}
                          </span>
                          <span className="silk hidden md:inline flex-shrink-0" style={{ color: "var(--panel-silk-muted)" }}>
                            {a.publishedDate}
                          </span>
                          <span className="silk flex-shrink-0 tabular-nums" style={{ color: "var(--panel-silk-muted)" }}>
                            {a.readingTime} min
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 4. SIMPLE NEWSLETTER CTA ─── */
export function SimpleNewsletterCta() {
  return (
    <section id="newsletter" className="chassis-seam py-10 sm:py-14">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="electronics p-5 sm:p-6 max-w-[640px] mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="led led-a transmit-led" aria-hidden="true" />
            <span className="silk-lg" style={{ color: "var(--amber)" }}>Field log dispatch</span>
            <span className="ml-auto codechip">SUB-01</span>
          </div>
          <p className="lcd !text-sm !bg-transparent leading-relaxed mb-4" style={{ color: "var(--amber)" }}>
            &gt; occasional dispatch with new gear tests, fix guides and lab notes.
            No sponsored emails, no rented list.
          </p>
          {/* The [data-status] readout lives outside the form (sibling in this
             card) — query it from the form's parent, not from inside the form. */}
          <form
            className="flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const input = form.querySelector("input[type=email]") as HTMLInputElement;
              if (input?.value) {
                input.value = "";
                const status = form.parentElement?.querySelector("[data-status]") as HTMLElement | null;
                if (status) status.textContent = "> not connected yet — launching soon · nothing was sent or stored";
              }
            }}
          >
            <input
              type="email"
              required
              placeholder="you@yourdomain.com"
              className="flex-1 px-3 py-2.5 lcd !bg-[#060606] !text-sm outline-none"
              style={{ color: "var(--amber)", border: "1px solid var(--disp-b)" }}
              aria-label="Email address"
            />
            <button type="submit" className="hwbtn hwbtn-amber justify-center">
              <span>Transmit</span>
            </button>
          </form>
          <p data-status className="lcd !text-xs !bg-transparent mt-2" style={{ color: "rgba(255,176,0,0.55)" }}>
            &gt; not connected yet — launching soon
          </p>
        </div>
      </div>
    </section>
  );
}
