"use client";

import { useState, type ReactNode } from "react";
import { StickyNav } from "./chrome";
import { SiteFooter, SearchOverlay } from "./footer";
import { ThemeProvider } from "./theme-toggle";
import { BootSplash, LedChase } from "./decorative";

/**
 * HomePageClient — the client interactivity shell for the / route.
 * Holds the search overlay state and wires the SEARCH nav button to focus it.
 * Wraps everything in ThemeProvider so the faceplate rocker and the
 * reader-bar toggle stay in sync (single source of truth for mode).
 * Renders a one-shot BootSplash on first session load (reduced-motion safe).
 * Everything else is rendered as static Server Component output where possible.
 */
export function HomePageClient({
  faceplate,
  nav,
  validationErrors,
  serial,
  children,
}: {
  faceplate: ReactNode;
  nav: { label: string; href: string }[];
  validationErrors: { code: string; field: string; message: string }[];
  serial: string;
  children: ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <ThemeProvider>
      <BootSplash />
      <LedChase />
      <div className="min-h-screen flex flex-col panel-surface">
        {faceplate}
        <StickyNav items={nav} onSearchClick={() => setSearchOpen(true)} />

        <main id="main" className="flex-1">
          {children}
        </main>

        {/* validation status line (dev only — surfaces anti-fake-testing rule violations) */}
        {validationErrors.length > 0 && (
          <div className="border-y border-[var(--err-b)] px-4 py-2" style={{ background: "rgba(255,68,68,0.06)" }}>
            <div className="mx-auto max-w-[1280px] flex items-center gap-2 flex-wrap">
              <span className="led led-r" aria-hidden="true" />
              <span className="silk" style={{ color: "var(--err)" }}>Content validation</span>
              <span className="mono text-xs" style={{ color: "var(--body)" }}>
                {validationErrors.length} issue(s) — see console
              </span>
            </div>
          </div>
        )}

        <SiteFooter serial={serial} />

        <SearchOverlay open={searchOpen} setOpen={setSearchOpen} />
      </div>
    </ThemeProvider>
  );
}
