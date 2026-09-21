"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { SearchModule } from "./components";
import { buildSearchIndex } from "@/lib/content/data";

/* ───────────────────────── SEARCH MODAL ─────────────────────────
   Static client-side search. UI is the backlit display module.
   Lightweight — indexes the in-memory article list. In production
   this would be Pagefind output, but the contract is identical. */
export function SearchOverlay({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // memoized search results — hooks must run unconditionally (before any early return)
  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    const index = buildSearchIndex();
    return index
      .filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          e.kind.includes(q)
      )
      .slice(0, 10)
      .map((e) => ({
        code: e.code,
        title: e.title,
        href: e.href,
        led: e.led,
      }));
  }, [q]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    // Reset query when the modal closes (open→false transition only).
    /* eslint-disable react-hooks/set-state-in-effect */
    setQuery("");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search BeatGuider"
    >
      <div className="w-full max-w-[640px]" onClick={(e) => e.stopPropagation()}>
        <SearchModule
          query={query}
          setQuery={setQuery}
          results={results}
          onResultClick={() => setOpen(false)}
          inputRef={inputRef}
        />
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="silk" style={{ color: "var(--mut)" }}>Esc to close · ⌘K to open</span>
          <button type="button" onClick={() => setOpen(false)} className="hwbtn !text-[0.6875rem] !py-1.5">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── SITE FOOTER ─────────────────────────
   Serial line (BEATGUIDER BG-1 — SN 2025-XXXX), vent strip, policy links.
   Footer is sticky/fixed to bottom (mt-auto on the root wrapper handles this).
   Corner screws on plates; vent texture in footer; both mode-aware. */
export function SiteFooter({ serial }: { serial: string }) {
  return (
    <footer
      className="mt-auto panel-surface border-t border-[var(--line)]"
      style={{ background: "var(--plate)" }}
    >
      {/* vent strip */}
      <div className="vents h-3 border-b border-[var(--line)]" aria-hidden="true" />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-2 sm:col-span-2">
            <div className="flex items-baseline gap-1 mb-2">
              <span className="font-[family-name:var(--font-chakra)] font-bold text-lg" style={{ color: "var(--text2)" }}>
                BEAT
              </span>
              <span className="font-[family-name:var(--font-chakra)] font-bold text-lg" style={{ color: "var(--amber)" }}>
                GUIDER
              </span>
            </div>
            <p className="text-sm max-w-[40ch]" style={{ color: "var(--body)" }}>
              Independent DJ gear, software, troubleshooting and education publication.
              Operated by a working DJ. Test. Fix. Mix.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="led led-g" aria-hidden="true" />
              <span className="silk" style={{ color: "var(--mut)" }}>PWR · OK</span>
            </div>
          </div>

          <FooterCol
            title="Publication"
            links={[
              { label: "About", href: "#style-guide" },
              { label: "How we test", href: "#style-guide" },
              { label: "Editorial policy", href: "#style-guide" },
              { label: "Corrections", href: "#style-guide" },
            ]}
          />
          <FooterCol
            title="Site"
            links={[
              { label: "Affiliate disclosure", href: "#style-guide" },
              { label: "Contact", href: "#newsletter" },
              { label: "Style guide", href: "#style-guide" },
              { label: "RSS feed", href: "/feed.xml" },
            ]}
          />
        </div>

        {/* build-version LCD strip + serial line */}
        <div className="mt-8 pt-4 border-t border-[var(--line)]">
          <div className="electronics flex flex-wrap items-center gap-3 px-3 py-2 mb-3">
            <span className="led led-g" aria-hidden="true" />
            <span className="silk !text-[0.5625rem]" style={{ color: "rgba(255,176,0,0.55)" }}>FW</span>
            <span className="lcd !text-xs !bg-transparent font-semibold" style={{ color: "var(--amber)" }}>BG-1.2.0</span>
            <span className="silk !text-[0.5625rem]" style={{ color: "rgba(255,176,0,0.55)" }}>·</span>
            <span className="silk !text-[0.5625rem]" style={{ color: "rgba(255,176,0,0.55)" }}>BUILD</span>
            <span className="lcd !text-xs !bg-transparent font-semibold" style={{ color: "var(--amber)" }}>{new Date().toISOString().slice(0, 10)}</span>
            <span className="silk !text-[0.5625rem]" style={{ color: "rgba(255,176,0,0.55)" }}>·</span>
            <span className="silk !text-[0.5625rem]" style={{ color: "rgba(255,176,0,0.55)" }}>SN</span>
            <span className="lcd !text-xs !bg-transparent font-semibold" style={{ color: "var(--amber)" }}>{serial}</span>
            <span className="flex-1" />
            <span className="silk !text-[0.5625rem]" style={{ color: "rgba(255,176,0,0.55)" }}>STATUS</span>
            <span className="lcd !text-xs !bg-transparent font-semibold" style={{ color: "var(--vu-g)" }}>ONLINE</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="mono text-xs" style={{ color: "var(--mut)" }}>
              BEATGUIDER BG-1 — independent DJ test bench
            </span>
            <span className="mono text-xs" style={{ color: "var(--mut)" }}>
              © {new Date().getFullYear()} BeatGuider · Test. Fix. Mix.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="silk mb-3" style={{ color: "var(--acc)" }}>{title}</h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm hover:text-[var(--amber)] transition-colors" style={{ color: "var(--body)" }}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
