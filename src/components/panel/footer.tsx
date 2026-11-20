"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { SearchModule } from "./components";
import { LiveClock } from "./decorative";
import { buildSearchIndex, articles, gearDb } from "@/lib/content/data";

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
  const router = useRouter();

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
          /* Navigate from this scope, deferred by one tick. Calling
             setOpen/router.push synchronously inside the click handler
             unmounts the <Link> mid-event, which cancels the router
             transition — the navigation silently never happens. */
          onResultClick={(href) => {
            setTimeout(() => {
              setOpen(false);
              router.push(href);
            }, 0);
          }}
          inputRef={inputRef}
        />
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="silk" style={{ color: "var(--mut)" }}>Esc to close · ⌘K to open · ? for shortcuts</span>
          <button type="button" onClick={() => setOpen(false)} className="hwbtn !text-[0.6875rem] !py-1.5">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── KEYBOARD SHORTCUT HELP ─────────────────────────
   Press ? to open. Shows all available keyboard shortcuts in the PANEL
   aesthetic. Esc to close. Reduced-motion safe (no animation). */
export function ShortcutsHelp({
  open,
  setOpen,
  onOpenSearch,
  onToggleTheme,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onOpenSearch?: () => void;
  onToggleTheme?: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        // only trigger if not typing in an input
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
          e.preventDefault();
          setOpen(!open);
        }
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const shortcuts = [
    { keys: ["⌘", "K"], label: "Open search", action: onOpenSearch },
    { keys: ["?"], label: "Toggle this help overlay", action: () => setOpen(false) },
    { keys: ["T"], label: "Toggle NIGHT / DAY chassis", action: onToggleTheme },
    { keys: ["Esc"], label: "Close any overlay", action: () => setOpen(false) },
    { keys: ["/"], label: "Focus search (when no input focused)", action: onOpenSearch },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div className="w-full max-w-[520px]" onClick={(e) => e.stopPropagation()}>
        <div className="electronics p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="led led-a led-breathe" aria-hidden="true" />
            <span className="silk-lg" style={{ color: "var(--amber)" }}>Keyboard · shortcuts</span>
            <span className="ml-auto codechip">KBD-01</span>
          </div>
          <ul className="space-y-2">
            {shortcuts.map((s) => (
              <li key={s.label} className="flex items-center gap-3">
                <span className="flex items-center gap-1 flex-shrink-0">
                  {s.keys.map((k) => (
                    <kbd
                      key={k}
                      className="lcd !text-xs font-semibold !px-2 !py-1 min-w-[24px] text-center"
                      style={{ color: "var(--amber)" }}
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
                <span className="lcd !text-sm !bg-transparent flex-1" style={{ color: "var(--amber)" }}>
                  {s.label}
                </span>
                {s.action && (
                  <button
                    type="button"
                    onClick={s.action}
                    className="hwbtn !text-[0.5625rem] !py-1 !px-2"
                    aria-label={s.label}
                  >
                    run
                  </button>
                )}
              </li>
            ))}
          </ul>
          <p className="lcd !text-[0.6875rem] !bg-transparent mt-4" style={{ color: "rgba(255,176,0,0.55)" }}>
            &gt; shortcuts fire globally except when typing in an input field
          </p>
        </div>
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="silk" style={{ color: "var(--mut)" }}>Esc to close · ? to toggle</span>
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
              { label: "About", href: "/about" },
              { label: "How we test", href: "/how-we-test" },
              { label: "Editorial policy", href: "/editorial-policy" },
              { label: "Corrections", href: "/corrections-policy" },
            ]}
          />
          <FooterCol
            title="Site"
            links={[
              { label: "Affiliate disclosure", href: "/affiliate-disclosure" },
              { label: "Privacy", href: "/privacy" },
              { label: "Contact", href: "/contact" },
              { label: "Style guide", href: "/style-guide" },
              { label: "RSS feed", href: "/feed.xml" },
            ]}
          />
        </div>

        {/* build manifest — real-time content inventory LCD strip */}
        <div className="mt-8 pt-4 border-t border-[var(--line)]">
          <BuildManifest />
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
            {/* power-supply LED bank — 3.3V / 5V / 12V rails */}
            <span className="ps-rail" aria-hidden="true">
              <span className="led led-g" />
              <span className="lcd !text-[0.5rem] !bg-transparent" style={{ color: "var(--amber)" }}>3.3V</span>
            </span>
            <span className="ps-rail" aria-hidden="true">
              <span className="led led-g" />
              <span className="lcd !text-[0.5rem] !bg-transparent" style={{ color: "var(--amber)" }}>5V</span>
            </span>
            <span className="ps-rail" aria-hidden="true">
              <span className="led led-g" />
              <span className="lcd !text-[0.5rem] !bg-transparent" style={{ color: "var(--amber)" }}>12V</span>
            </span>
            <span className="silk !text-[0.5625rem]" style={{ color: "rgba(255,176,0,0.55)" }}>STATUS</span>
            <span className="lcd !text-xs !bg-transparent font-semibold" style={{ color: "var(--vu-g)" }}>ONLINE</span>
          </div>
          {/* data-bus indicator — flowing amber dots */}
          <div className="data-bus w-full mb-2" aria-hidden="true" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="mono text-xs" style={{ color: "var(--mut)" }}>
              BEATGUIDER BG-1 — independent DJ test bench
            </span>
            {/* temperature readout — decorative, clearly illustrative */}
            <span className="temp-readout" aria-hidden="true">
              <span className="temp-bar" />
              <span className="lcd !text-[0.5625rem] !bg-transparent" style={{ color: "var(--amber)" }}>34.2°C</span>
              <span className="silk !text-[0.5rem]" style={{ color: "rgba(255,176,0,0.55)" }}>TEMP</span>
            </span>
            {/* battery readout — decorative backup-power indicator */}
            <span className="battery-readout" aria-hidden="true">
              <span className="battery-cells">
                <span className="on" />
                <span className="on" />
                <span className="on" />
                <span />
              </span>
              <span className="lcd !text-[0.5625rem] !bg-transparent" style={{ color: "var(--amber)" }}>75%</span>
              <span className="silk !text-[0.5rem]" style={{ color: "rgba(255,176,0,0.55)" }}>BATT</span>
            </span>
            {/* live clock readout — real-time HH:MM:SS with blinking tick LED */}
            <LiveClock />
            {/* LOAD bar — decorative CPU-load-style indicator */}
            <span className="inline-flex items-center gap-2" aria-hidden="true">
              <span className="silk !text-[0.5rem]" style={{ color: "rgba(255,176,0,0.55)" }}>LOAD</span>
              <span className="load-bar w-12" />
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

/* ─── Build manifest — real-time content inventory LCD strip ───
   Auto-generated list of all content codes grouped by type prefix
   (FIX/GEAR/SW/LEARN/CMP/MOB/TOOL). Renders as a dark LCD strip
   showing the full content inventory — a real-time trust feature. */
function BuildManifest() {
  // group all codes by prefix
  const allCodes = [
    ...articles.map((a) => a.code),
    ...gearDb.map((g) => g.code),
    "TOOL-01", "TOOL-02", "TOOL-03", "TOOL-04", "TOOL-05", "TOOL-06", "TOOL-07", "TOOL-08", "TOOL-09",
  ];
  const groups: { prefix: string; label: string; codes: string[]; led: string }[] = [
    { prefix: "FIX", label: "FIX", codes: [], led: "led led-r" },
    { prefix: "GEAR", label: "GEAR", codes: [], led: "led led-g" },
    { prefix: "SW", label: "SOFTWARE", codes: [], led: "led led-a" },
    { prefix: "LEARN", label: "LEARN", codes: [], led: "led led-g" },
    { prefix: "CMP", label: "COMPARE", codes: [], led: "led led-a" },
    { prefix: "MOB", label: "MOBILE-DJ", codes: [], led: "led led-a" },
    { prefix: "TOOL", label: "TOOLS", codes: [], led: "led led-a" },
  ];
  allCodes.forEach((code) => {
    const g = groups.find((x) => code.startsWith(x.prefix));
    if (g) g.codes.push(code);
  });

  return (
    <div className="electronics p-3 mb-3 overflow-x-auto scroll-x">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="led led-a led-breathe" aria-hidden="true" />
        <span className="silk" style={{ color: "var(--amber)" }}>Build manifest · content inventory</span>
        <span className="ml-auto silk !text-[0.5625rem]" style={{ color: "rgba(255,176,0,0.55)" }}>
          {allCodes.length} ENTRIES
        </span>
      </div>
      <div className="flex items-start gap-4 flex-wrap">
        {groups.map((g) => (
          <div key={g.prefix} className="flex flex-col gap-1 min-w-[80px]">
            <div className="flex items-center gap-1.5">
              <span className={g.led} aria-hidden="true" />
              <span className="silk !text-[0.5625rem]" style={{ color: "rgba(255,176,0,0.65)" }}>{g.label}</span>
              <span className="silk !text-[0.5625rem] ml-auto" style={{ color: "var(--amber)" }}>{String(g.codes.length).padStart(2, "0")}</span>
            </div>
            <div className="lcd !text-[0.5625rem] !bg-transparent leading-tight" style={{ color: "var(--amber)" }}>
              {g.codes.length > 0 ? g.codes.map((c) => c).join(" ") : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
