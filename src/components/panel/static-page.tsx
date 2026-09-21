"use client";

import Link from "next/link";
import { SpecPlate, Screws, SpecTable, SourcesList } from "./components";

/* ════════════════════════════════════════════════════════════════
   StaticPage — shared template for editorial / policy pages.
   Renders a title + body prose in the PANEL aesthetic. Used by
   /about/, /how-we-test/, /editorial-policy/, /corrections-policy/,
   /affiliate-disclosure/, /contact/, /style-guide/.
   ════════════════════════════════════════════════════════════════ */

export function StaticPage({
  code,
  title,
  kicker,
  description,
  children,
}: {
  code: string;
  title: string;
  kicker: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      {/* Hero header */}
      <section className="panel-surface border-b border-[var(--line)]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 sm:py-16">
          <nav className="flex items-center gap-2 mb-4 text-xs" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--amber)]" style={{ color: "var(--mut)" }}>HOME</Link>
            <span style={{ color: "var(--mut)" }}>/</span>
            <span className="mono" style={{ color: "var(--amber)" }}>{code}</span>
          </nav>
          <div className="flex items-center gap-2 mb-3">
            <span className="led led-g" aria-hidden="true" />
            <span className="silk" style={{ color: "var(--mut)" }}>{kicker}</span>
          </div>
          <h1
            className="font-[family-name:var(--font-chakra)] font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-3"
            style={{ color: "var(--text2)" }}
          >
            {title}
          </h1>
          <p className="text-base sm:text-lg max-w-[68ch]" style={{ color: "var(--body)" }}>
            {description}
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="py-10 sm:py-14 chassis-seam">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="max-w-[68ch] mx-auto prose-panel">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
