"use client";

import Link from "next/link";
import { articles, gearDb, computeReadingTime, freshnessStatus } from "@/lib/content/data";
import { countBodyWords } from "@/lib/content/article-bodies";

/* ════════════════════════════════════════════════════════════════
   Clean homepage sections — clutter-free.
   Just 3 sections: Hero + Latest Articles + Newsletter CTA.
   Everything else lives on dedicated pages.
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
          <span className="silk" style={{ color: "var(--mut)" }}>Independent DJ test bench · BG-1</span>
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

        {/* quick links */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/tools" className="hwbtn hwbtn-amber">
            <span>Open tools</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href="/compare" className="hwbtn">Compare gear</Link>
          <Link href="/mobile-dj" className="hwbtn">Mobile DJ</Link>
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
          <span className="silk" style={{ color: "var(--mut)" }}>— recent articles</span>
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
                  <span className="silk" style={{ color: "var(--mut)" }}>{a.category}</span>
                </div>
                <h3 className="font-[family-name:var(--font-chakra)] font-semibold text-base sm:text-lg leading-tight" style={{ color: "var(--text2)" }}>
                  {a.title}
                </h3>
                <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--body)" }}>{a.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="silk" style={{ color: "var(--mut)" }}>{a.publishedDate}</span>
                  <span style={{ color: "var(--mut)" }}>·</span>
                  <span className="silk" style={{ color: "var(--mut)" }}>{computeReadingTime(Math.max(countBodyWords(a.slug), 1))} min read</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── 3. SIMPLE NEWSLETTER CTA ─── */
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
