"use client";

import { ThemeProvider } from "./theme-toggle";
import { FaceplateHeader, StickyNav } from "./chrome";
import { SiteFooter } from "./footer";
import { Screws } from "./components";
import Link from "next/link";
import { articles, gearDb } from "@/lib/content/data";
import { updatedAt } from "@/lib/content/validate";
import type { ReactNode } from "react";

/**
 * NotFoundClient — client wrapper for the 404 fault-report page.
 * Wraps in ThemeProvider so the faceplate ModeRocker works (same store
 * as the homepage).
 */
export function NotFoundClient({ children }: { children?: ReactNode }) {
  // Same counts as the site shell so the LCD reads identically everywhere.
  const entryCount = articles.length + gearDb.length;
  const lastPublish = articles.reduce(
    (max, a) => (updatedAt(a) > max ? updatedAt(a) : max),
    "0000-00-00"
  );

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col panel-surface">
        <FaceplateHeader entryCount={entryCount} lastPublish={lastPublish} />
        <StickyNav
          items={[
            { label: "Gear", href: "/" },
            { label: "Software", href: "/" },
            { label: "Fix", href: "/" },
            { label: "Learn", href: "/" },
            { label: "Tools", href: "/" },
          ]}
        />
        <main id="main" className="flex-1">{children ?? <FaultReport />}</main>
        <SiteFooter serial="2025-0000" />
      </div>
    </ThemeProvider>
  );
}

function FaultReport() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-160 mx-auto">
        <div
          className="specplate brushed p-6 sm:p-8 relative"
          style={{ borderLeftColor: "var(--err)", borderLeftWidth: 3 }}
        >
          <Screws />
          <div className="flex items-center gap-2 mb-4">
            <span className="led led-r" aria-hidden="true" />
            <span className="silk-lg" style={{ color: "var(--err)" }}>Fault report</span>
            <span className="codechip ml-auto">ERR-404</span>
          </div>
          <h1
            className="font-(family-name:--font-chakra) font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-3"
            style={{ color: "var(--text2)" }}
          >
            Signal not found
          </h1>
          <p className="lcd text-sm! bg-transparent! mb-6" style={{ color: "var(--amber)" }}>
            &gt; ERR-404 · the requested route produced no output on the test bench
          </p>
          <div className="electronics p-4 mb-6">
            <div className="silk mb-2" style={{ color: "rgba(255,176,0,0.6)" }}>Diagnostic</div>
            <ul className="space-y-1.5 lcd text-sm! bg-transparent!" style={{ color: "var(--amber)" }}>
              <li>&gt; route does not match any indexable article, gear or tool module</li>
              <li>&gt; if this was a typed URL, check the slug (codes are cosmetic — never in URLs)</li>
              <li>&gt; if this was an internal link, it is broken and will be flagged in CI</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="hwbtn hwbtn-amber">
              <span>Return to bench</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13 8H3M3 8L7 4M3 8L7 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/#tools" className="hwbtn">Open tools</Link>
            <Link href="/#fault-report" className="hwbtn">Fault report</Link>
          </div>
        </div>
        <p className="mono text-xs mt-6 text-center" style={{ color: "var(--mut)" }}>
          BEATGUIDER BG-1 — fault-handling is part of the device. ERR LED lit only on genuine error.
        </p>
      </div>
    </section>
  );
}
