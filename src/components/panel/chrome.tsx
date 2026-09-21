"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ModeRocker, ModeIconButton } from "./theme-toggle";

/* ───────────────────────── FACEPLATE HEADER ─────────────────────────
   The top of the device. Wordmark (amber on "GUIDER"), model tag BG-1,
   NIGHT/DAY rocker, LED row (PWR steady green · SIG breathing amber ·
   ERR red lit only on genuine error), LCD status line with real build-time data.
*/
export function FaceplateHeader({
  entryCount,
  lastPublish,
  mode,
}: {
  entryCount: number;
  lastPublish: string;
  mode: string;
}) {
  return (
    <header className="panel-surface border-b border-[var(--line)]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        {/* top row: brand · model · LEDs · mode switch */}
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/" className="group flex items-baseline gap-1" aria-label="BeatGuider home">
              <span
                className="font-[family-name:var(--font-chakra)] text-xl sm:text-2xl font-bold tracking-tight"
                style={{ color: "var(--text2)" }}
              >
                BEAT
              </span>
              <span
                className="font-[family-name:var(--font-chakra)] text-xl sm:text-2xl font-bold tracking-tight wordmark-glow"
                style={{ color: "var(--amber)" }}
              >
                GUIDER
              </span>
            </Link>
            <span className="codechip hidden sm:inline-flex">BG-1</span>
          </div>

          {/* LED row + mode switch */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="faceplate-led-row hidden sm:flex items-center gap-3" aria-hidden="true">
              <LedLabel color="g" label="PWR" />
              <LedLabel color="a-breathe" label="SIG" />
              <LedLabel color="r-off" label="ERR" />
            </div>
            {/* mobile: condensed LED row */}
            <div className="faceplate-led-row flex sm:hidden items-center gap-2" aria-hidden="true">
              <span className="led led-g" />
              <span className="led led-a led-breathe" />
              <span className="led" />
            </div>
            <ModeRocker />
          </div>
        </div>

        {/* LCD status line */}
        <LcdStatus
          segments={[
            { label: "MODE", value: mode.toUpperCase() },
            { label: "ENTRIES", value: String(entryCount).padStart(3, "0") },
            { label: "LAST PUB", value: lastPublish },
            { label: "SIG", value: "OK" },
          ]}
        />
      </div>
    </header>
  );
}

function LedLabel({
  color,
  label,
}: {
  color: "g" | "a-breathe" | "r-off" | "a" | "r" | "data";
  label: string;
}) {
  const cls =
    color === "g"
      ? "led led-g"
      : color === "a-breathe"
      ? "led led-a led-breathe"
      : color === "a"
      ? "led led-a"
      : color === "r"
      ? "led led-r"
      : color === "data"
      ? "led led-data"
      : "led";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cls} aria-hidden="true" />
      <span className="silk">{label}</span>
    </span>
  );
}


/* LCD status: faceplate line showing real build-time data */
export function LcdStatus({
  segments,
}: {
  segments: { label: string; value: string }[];
}) {
  return (
    <div className="electronics flex items-stretch overflow-hidden mb-3">
      {segments.map((s, i) => (
        <div
          key={s.label}
          className={`flex flex-col justify-center px-3 sm:px-4 py-1.5 min-w-0 ${
            i > 0 ? "border-l border-[var(--disp-b)]" : ""
          }`}
        >
          <span className="silk !text-[0.5625rem]" style={{ color: "rgba(255,176,0,0.55)" }}>
            {s.label}
          </span>
          <span className="lcd !text-[0.8125rem] sm:!text-sm font-semibold !bg-transparent">
            {s.value}
          </span>
        </div>
      ))}
      <div className="flex-1" />
      <div className="hidden sm:flex items-center px-3 border-l border-[var(--disp-b)]">
        <span className="led led-g led-breathe" aria-hidden="true" />
      </div>
    </div>
  );
}

/* ───────────────────────── STICKY HARDWARE NAV ─────────────────────────
   GEAR / SOFTWARE / FIX / LEARN / SEARCH — 44px targets, active amber,
   SEARCH focuses the search module.
*/
export function StickyNav({
  items,
  onSearchClick,
}: {
  items: { label: string; href: string; code?: string }[];
  onSearchClick?: () => void;
}) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    // observe sections to highlight active nav
    const ids = items.map((i) => i.href.replace("#", ""));
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive("#" + visible[0].target.id);
      },
      { rootMargin: "-112px 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items]);

  return (
    <nav
      className="panel-surface sticky top-0 z-40 border-b border-[var(--line)] backdrop-blur-sm"
      style={{ background: "color-mix(in srgb, var(--card) 88%, transparent)" }}
      aria-label="Primary"
    >
      <div className="mx-auto max-w-[1280px] px-2 sm:px-6">
        <ul className="flex items-stretch gap-0 overflow-x-auto no-scrollbar">
          {items.map((it) => {
            const isActive = active === it.href;
            return (
              <li key={it.href} className="flex-shrink-0">
                <a
                  href={it.href}
                  className={`relative flex items-center gap-2 px-3 sm:px-4 h-11 font-[family-name:var(--font-chakra)] text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors ${
                    isActive ? "text-[var(--amber)]" : "text-[var(--text)] hover:text-[var(--text2)]"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-2 top-1.5 w-1 h-1 rounded-full led led-a" aria-hidden="true" />
                  )}
                  <span className={isActive ? "ml-2" : ""}>{it.label}</span>
                </a>
              </li>
            );
          })}
          {onSearchClick && (
            <li className="flex-shrink-0 ml-auto">
              <button
                type="button"
                onClick={onSearchClick}
                className="flex items-center gap-2 px-3 sm:px-4 h-11 font-[family-name:var(--font-chakra)] text-xs sm:text-sm font-semibold tracking-wider uppercase text-[var(--text)] hover:text-[var(--amber)]"
                aria-label="Open search module"
              >
                <SearchGlyph />
                Search
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

function SearchGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ───────────────────────── READER BAR ─────────────────────────
   Sticky reader bar: back · code+title · theme toggle · VU reading progress + %
   Used inside the specimen article demo.
*/
export function ReaderBar({
  code,
  title,
  backHref = "#top",
}: {
  code: string;
  title: string;
  backHref?: string;
}) {
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    // single passive scroll listener; rAF-throttled
    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        const article = document.getElementById("specimen-article");
        if (!article) {
          setProgress(0);
          return;
        }
        const rect = article.getBoundingClientRect();
        const total = rect.height - window.innerHeight + 80;
        const scrolled = Math.min(Math.max(-rect.top + 80, 0), Math.max(total, 1));
        setProgress(total > 0 ? Math.round((scrolled / total) * 100) : 0);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  // active segment count for a 26-seg VU
  const segs = Math.round((progress / 100) * 26);

  return (
    <div
      className="sticky top-11 z-30 border-y border-[var(--line)] panel-surface"
      style={{ background: "color-mix(in srgb, var(--card) 92%, transparent)" }}
    >
      <div className="mx-auto max-w-[1280px] px-3 sm:px-6">
        <div className="flex items-center gap-3 h-12">
          <a
            href={backHref}
            className="flex items-center gap-1.5 text-[var(--mut)] hover:text-[var(--amber)] transition-colors flex-shrink-0"
            aria-label="Back to top"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="silk hidden sm:inline">Back</span>
          </a>
          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <span className="codechip">{code}</span>
            <span
              className="font-[family-name:var(--font-chakra)] text-xs sm:text-sm font-semibold truncate"
              style={{ color: "var(--text2)" }}
            >
              {title}
            </span>
          </div>
          {/* mobile compact: code only */}
          <span className="sm:hidden codechip">{code}</span>

          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            {/* VU reading progress */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="silk">READ</span>
              <div className="flex items-center gap-px w-28" aria-hidden="true">
                {Array.from({ length: 26 }).map((_, i) => {
                  const on = i < segs;
                  const cls = i < 16 ? "vu-seg-g" : i < 21 ? "vu-seg-a" : "vu-seg-r";
                  return (
                    <span
                      key={i}
                      className={`vu-seg h-2.5 ${on ? cls : ""}`}
                    />
                  );
                })}
              </div>
              <span className="lcd !text-[0.6875rem] !bg-transparent font-semibold tabular-nums">
                {String(progress).padStart(3, "0")}%
              </span>
            </div>
            {/* mobile compact percent */}
            <span className="sm:hidden lcd !text-[0.6875rem] !bg-transparent font-semibold tabular-nums">
              {String(progress).padStart(3, "0")}%
            </span>
            <ModeIconButton />
          </div>
        </div>
      </div>
    </div>
  );
}

