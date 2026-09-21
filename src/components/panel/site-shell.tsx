"use client";

import { useState, useEffect, type ReactNode } from "react";
import { FaceplateHeader, StickyNav } from "./chrome";
import { SiteFooter, SearchOverlay, ShortcutsHelp } from "./footer";
import { ThemeProvider, useTheme } from "./theme-toggle";
import { BootSplash, LedChase, ScrollToTopButton, PostSequence } from "./decorative";
import { articles, gearDb } from "@/lib/content/data";

/**
 * SiteShell — the shared page wrapper for ALL routes.
 * Provides the faceplate header, sticky nav, footer, search overlay,
 * shortcuts help, scroll-to-top, boot splash, POST sequence, and
 * theme provider. Each route renders <SiteShell>{page content}</SiteShell>.
 */
export function SiteShell({
  children,
  navItems = [
    { label: "Gear", href: "/gear" },
    { label: "Software", href: "/software" },
    { label: "Fix", href: "/fix" },
    { label: "Learn", href: "/learn" },
    { label: "Tools", href: "/#tools" },
    { label: "Mobile DJ", href: "/mobile-dj" },
  ],
  searchDisabled = false,
}: {
  children: ReactNode;
  navItems?: { label: string; href: string }[];
  searchDisabled?: boolean;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const entryCount = articles.length + gearDb.length;
  const lastPublish = [...articles].sort((a, b) => (b.publishedDate > a.publishedDate ? 1 : -1))[0]?.publishedDate ?? "—";
  const serial = "2025-0000";

  return (
    <ThemeProvider>
      <BootSplash />
      <PostSequence />
      <LedChase />
      <GlobalKeyHandler setHelpOpen={setHelpOpen} setSearchOpen={setSearchOpen} />
      <div className="min-h-screen flex flex-col panel-surface">
        <FaceplateHeader entryCount={entryCount} lastPublish={lastPublish} mode="night" />
        <StickyNav items={navItems} onSearchClick={searchDisabled ? undefined : () => setSearchOpen(true)} />

        <main id="main" className="flex-1">
          {children}
        </main>

        <SiteFooter serial={serial} />
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
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        toggle();
      }
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
