"use client";

import Link from "next/link";
import { gearDb } from "@/lib/content/data";
import {
  BpmCalculator,
  CamelotCalculator,
  PowerCalculator,
  GearDueler,
  KeyBpmMatcher,
  SetLengthPlanner,
  BpmTapDetector,
  DjFeeCalculator,
  CuePointCalculator,
} from "./tools";

/* ════════════════════════════════════════════════════════════════
   ToolCategoryPage — the dedicated /tools page.
   Organizes all 9 tools into categories, with clear descriptions.
   Each tool is a full-width rack unit, easy to use on mobile.
   ════════════════════════════════════════════════════════════════ */

export function ToolCategoryPage() {
  return (
    <div>
      {/* Hero header */}
      <section className="panel-surface border-b border-[var(--line)]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-10 sm:py-14">
          <nav className="flex items-center gap-2 mb-4 text-xs" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--amber)]" style={{ color: "var(--mut)" }}>HOME</Link>
            <span style={{ color: "var(--mut)" }}>/</span>
            <span className="mono" style={{ color: "var(--amber)" }}>TOOLS</span>
          </nav>
          <div className="flex items-center gap-2 mb-3">
            <span className="led led-g" aria-hidden="true" />
            <span className="silk" style={{ color: "var(--mut)" }}>9 tools · all free · run in your browser</span>
          </div>
          <h1
            className="font-[family-name:var(--font-chakra)] font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-3"
            style={{ color: "var(--text2)" }}
          >
            DJ Tools
          </h1>
          <p className="text-base sm:text-lg max-w-[68ch]" style={{ color: "var(--body)" }}>
            The tools DJs actually use. Bookmark this page — every tool runs instantly in your
            browser with no sign-up. The <strong>BPM Tap Detector</strong> is our most-used tool.
          </p>
        </div>
      </section>

      {/* TIMING category */}
      <section className="chassis-seam py-8 sm:py-10">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="flex items-baseline gap-3 mb-5 flex-wrap">
            <span className="led led-a" aria-hidden="true" />
            <h2 className="font-[family-name:var(--font-chakra)] font-semibold text-xl sm:text-2xl" style={{ color: "var(--text2)" }}>
              Timing
            </h2>
            <span className="silk" style={{ color: "var(--mut)" }}>— BPM, tap, cue points</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BpmTapDetector />
            <BpmCalculator />
            <CuePointCalculator />
          </div>
        </div>
      </section>

      {/* HARMONIC category */}
      <section className="chassis-seam py-8 sm:py-10">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="flex items-baseline gap-3 mb-5 flex-wrap">
            <span className="led led-g" aria-hidden="true" />
            <h2 className="font-[family-name:var(--font-chakra)] font-semibold text-xl sm:text-2xl" style={{ color: "var(--text2)" }}>
              Harmonic
            </h2>
            <span className="silk" style={{ color: "var(--mut)" }}>— key matching, Camelot wheel</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CamelotCalculator />
            <KeyBpmMatcher />
          </div>
        </div>
      </section>

      {/* BUSINESS category */}
      <section className="chassis-seam py-8 sm:py-10">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="flex items-baseline gap-3 mb-5 flex-wrap">
            <span className="led led-a" aria-hidden="true" />
            <h2 className="font-[family-name:var(--font-chakra)] font-semibold text-xl sm:text-2xl" style={{ color: "var(--text2)" }}>
              Business
            </h2>
            <span className="silk" style={{ color: "var(--mut)" }}>— set planning, gig pricing</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SetLengthPlanner />
            <DjFeeCalculator />
          </div>
        </div>
      </section>

      {/* POWER category */}
      <section className="chassis-seam py-8 sm:py-10">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="flex items-baseline gap-3 mb-5 flex-wrap">
            <span className="led led-r" aria-hidden="true" />
            <h2 className="font-[family-name:var(--font-chakra)] font-semibold text-xl sm:text-2xl" style={{ color: "var(--text2)" }}>
              Power
            </h2>
            <span className="silk" style={{ color: "var(--mut)" }}>— mobile DJ load + safety</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PowerCalculator />
          </div>
        </div>
      </section>

      {/* COMPARISON category */}
      <section className="chassis-seam py-8 sm:py-10">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="flex items-baseline gap-3 mb-5 flex-wrap">
            <span className="led led-a" aria-hidden="true" />
            <h2 className="font-[family-name:var(--font-chakra)] font-semibold text-xl sm:text-2xl" style={{ color: "var(--text2)" }}>
              Comparison
            </h2>
            <span className="silk" style={{ color: "var(--mut)" }}>— gear head-to-head</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <GearDueler gear={gearDb} />
          </div>
        </div>
      </section>
    </div>
  );
}
