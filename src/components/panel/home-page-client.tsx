"use client";

import { useState, useEffect, type ReactNode } from "react";
import { StickyNav } from "./chrome";
import { SiteFooter, SearchOverlay, ShortcutsHelp } from "./footer";
import { ThemeProvider, useTheme } from "./theme-toggle";
import { BootSplash, LedChase, ScrollToTopButton, PostSequence } from "./decorative";

/**
 * HomePageClient — the client interactivity shell for the / route.
 * Holds the search overlay + shortcuts-help state and wires the SEARCH
 * nav button + keyboard shortcuts (⌘K, ?, T, Esc, /). Wraps everything
 * in ThemeProvider so the faceplate rocker and the reader-bar toggle
 * stay in sync (single source of truth for mode). Renders a one-shot
 * BootSplash on first session load (reduced-motion safe).
 */
export function HomePageClient({
  faceplate,
  nav,
  validationErrors,
  children,
}: {
  faceplate: ReactNode;
  nav: { label: string; href: string }[];
  validationErrors: { code: string; field: string; message: string }[];
  children: ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <ThemeProvider>
      <BootSplash />
      <PostSequence />
      <LedChase />
      <GlobalKeyHandler setHelpOpen={setHelpOpen} setSearchOpen={setSearchOpen} />
      <div className="min-h-screen flex flex-col panel-surface">
        {faceplate}
        <StickyNav items={nav} onSearchClick={() => setSearchOpen(true)} />

        <main id="main" className="flex-1">
          {children}
        </main>

        {/* validation status line (dev only — surfaces anti-fake-testing rule violations) */}
        {validationErrors.length > 0 && (
          <div className="border-y border-[var(--err-b)] px-4 py-2" style={{ background: "rgba(255,68,68,0.06)" }}>
            <div className="mx-auto max-w-7xl flex items-center gap-2 flex-wrap">
              <span className="led led-r" aria-hidden="true" />
              <span className="silk" style={{ color: "var(--err)" }}>Content validation</span>
              <span className="mono text-xs" style={{ color: "var(--body)" }}>
                {validationErrors.length} issue(s) — see console
              </span>
            </div>
          </div>
        )}

        <SiteFooter />
        <ScrollToTopButton />

        <SearchOverlay open={searchOpen} setOpen={setSearchOpen} />
        <ShortcutsHelpRenderer
          open={helpOpen}
          setOpen={setHelpOpen}
          onOpenSearch={() => { setHelpOpen(false); setSearchOpen(true); }}
        />
      </div>
    </ThemeProvider>
  );
}

/**
 * GlobalKeyHandler — listens for the T (toggle theme) and / (focus search)
 * global shortcuts. The ? and Esc handlers live in ShortcutsHelp itself.
 * Skips when typing in an input/textarea/select.
 */
function GlobalKeyHandler({
  setHelpOpen,
  setSearchOpen,
}: {
  setHelpOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
}) {
  const { toggle } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (inInput) return;

      // T → toggle NIGHT/DAY chassis
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        toggle();
      }
      // / → focus search (open the search overlay)
      if (e.key === "/" && !e.shiftKey) {
        e.preventDefault();
        setHelpOpen(false);
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, setHelpOpen, setSearchOpen]);

  return null;
}

/** Renders ShortcutsHelp with access to the theme context for the T shortcut. */
function ShortcutsHelpRenderer({
  open,
  setOpen,
  onOpenSearch,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onOpenSearch: () => void;
}) {
  const { toggle } = useTheme();
  return (
    <ShortcutsHelp
      open={open}
      setOpen={setOpen}
      onOpenSearch={onOpenSearch}
      onToggleTheme={toggle}
    />
  );
}
