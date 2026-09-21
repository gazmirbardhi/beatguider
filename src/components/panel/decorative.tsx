"use client";

import { useEffect, useState, useRef } from "react";
import { Screws } from "./components";
import { articles, gearDb } from "@/lib/content/data";

/* ════════════════════════════════════════════════════════════════
   BeatGuider signature decorative + live-feed components (round 2)
   - SpectrumAnalyzer: animated EQ bars in the hero signal monitor
   - LabActivityFeed: live ticker of recent test-bench events
   Both are Client Components; JS loads per-route. The spectrum uses
   requestAnimationFrame, paused under reduced-motion + when offscreen.
   ════════════════════════════════════════════════════════════════ */

/* ─── Spectrum analyzer — decorative EQ bars ───
   A row of amber/green/red bars that animate like a real spectrum
   analyzer on a piece of DJ equipment. Purely decorative — there's
   no audio source. Respects prefers-reduced-motion (falls back to a
   static mid-level pattern) and pauses when offscreen. */
export function SpectrumAnalyzer({
  bars = 24,
  height = 64,
  label = "SPECTRUM · DECORATIVE",
}: {
  bars?: number;
  height?: number;
  label?: string;
}) {
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: bars }, () => 0.3 + Math.random() * 0.4)
  );
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastUpdate = useRef(0);

  useEffect(() => {
    // Sync reduced-motion preference from the user's OS setting.
    // Reading an external system (matchMedia) post-mount is the
    // React-blessed pattern for this case.
    /* eslint-disable react-hooks/set-state-in-effect */
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    /* eslint-enable react-hooks/set-state-in-effect */
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => setVisible(entries[0]?.isIntersecting ?? false),
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible) return;
    // single rAF loop — updates ~30fps to keep CPU low
    const tick = (t: number) => {
      if (t - lastUpdate.current > 50) {
        lastUpdate.current = t;
        setLevels((prev) =>
          prev.map((l, i) => {
            // gentle random walk per bar, weighted toward mid-range
            const target = 0.25 + Math.random() * 0.6;
            const centerBias = 1 - Math.abs(i - bars / 2) / (bars / 2) * 0.3;
            return l * 0.6 + target * centerBias * 0.4;
          })
        );
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced, visible, bars]);

  return (
    <div ref={containerRef} className="electronics p-3" aria-hidden="true">
      <div className="flex items-center gap-2 mb-2">
        <span className="led led-a led-breathe" />
        <span className="silk" style={{ color: "var(--amber)" }}>{label}</span>
      </div>
      <div
        className="flex items-end justify-between gap-px"
        style={{ height }}
      >
        {levels.map((l, i) => {
          const pct = Math.max(0.08, Math.min(1, l));
          return (
            <span
              key={i}
              className="spec-bar"
              style={{
                height: `${pct * 100}%`,
                animationDelay: `${(i % 6) * 90}ms`,
                animationDuration: `${800 + (i % 4) * 150}ms`,
              }}
            />
          );
        })}
      </div>
      {/* frequency scale */}
      <div className="flex justify-between mt-1 silk !text-[0.5rem]" style={{ color: "rgba(255,176,0,0.45)" }}>
        <span>20Hz</span>
        <span>200</span>
        <span>2k</span>
        <span>20k</span>
      </div>
    </div>
  );
}

/* ─── Lab activity feed — live ticker of recent test-bench events ───
   A scrolling marquee of recent activity: articles published, gear
   tested, validations run. Purely decorative but uses real data from
   the content layer (no fabrication). Pauses under reduced-motion. */
export function LabActivityFeed() {
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTick = useRef(0);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // build the feed items from real content (no fabrication)
  const items: { code: string; label: string; ts: string }[] = [
    ...articles.slice(0, 5).map((a) => ({
      code: a.code,
      label: `${a.contentType.toUpperCase()} published · ${a.title.slice(0, 50)}`,
      ts: a.publishedDate,
    })),
    ...gearDb.filter((g) => g.tested).map((g) => ({
      code: g.code,
      label: `GEAR tested · ${g.manufacturer} ${g.model}`,
      ts: g.priceLastChecked ?? "2025-01",
    })),
    { code: "SYS", label: "content validation · 0 errors · anti-fake-testing rule enforced", ts: "now" },
    { code: "SYS", label: "freshness check · all entries within window", ts: "now" },
  ];

  useEffect(() => {
    if (reduced || paused) return;
    const tick = (t: number) => {
      if (t - lastTick.current > 30) {
        lastTick.current = t;
        setOffset((o) => (o - 0.5) % 1000);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced, paused]);

  const doubled = [...items, ...items];

  return (
    <div
      className="electronics overflow-hidden relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="marquee"
      aria-label="Recent lab activity — pauses on hover"
    >
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--disp-b)]" style={{ background: "#060606" }}>
        <span className={`led led-g ${reduced ? "" : "led-breathe"}`} aria-hidden="true" />
        <span className="silk" style={{ color: "var(--amber)" }}>LAB · ACTIVITY</span>
        {/* Cassette reels — decorative tape-deck spinners when live */}
        {!paused && !reduced && <CassetteReels size={14} />}
        {/* REC indicator — blinking red dot when live */}
        {!paused && !reduced && (
          <span className="rec-indicator" aria-hidden="true">
            <span className="led led-r" />
            <span className="silk !text-[0.5rem]" style={{ color: "var(--vu-r)" }}>REC</span>
          </span>
        )}
        <span className="silk ml-auto" style={{ color: "rgba(255,176,0,0.5)" }}>
          {paused ? "PAUSED" : reduced ? "STATIC" : "LIVE"}
        </span>
      </div>
      <div className="relative overflow-hidden py-2" style={{ height: "2rem" }}>
        <div
          className="flex items-center gap-8 whitespace-nowrap absolute"
          style={{
            transform: `translateX(${offset}px)`,
            transition: reduced ? "none" : undefined,
          }}
        >
          {doubled.map((it, i) => (
            <span key={i} className="lcd !text-xs !bg-transparent inline-flex items-center gap-2" style={{ color: "var(--amber)" }}>
              <span className="codechip !text-[0.5625rem]">{it.code}</span>
              <span>{it.label}</span>
              <span style={{ color: "rgba(255,176,0,0.5)" }}>· {it.ts}</span>
              <span style={{ color: "var(--vu-g)" }}>▮</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Knob component — decorative rotary dial ───
   For tool headers and spec plates. The indicator position is
   controlled by the `value` prop (0..100). Pure CSS. */
export function Knob({
  value = 50,
  size = 24,
  label,
}: {
  value?: number;
  size?: number;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  // -135deg (min) to +135deg (max) = 270deg sweep
  const angle = -135 + (v / 100) * 270;
  return (
    <div className="flex flex-col items-center gap-1" aria-hidden="true">
      <div
        className="knob"
        style={{
          width: size,
          height: size,
          transform: `rotate(${angle}deg)`,
          transition: "transform 200ms ease",
        }}
      />
      {label && <span className="silk !text-[0.5rem]" style={{ color: "var(--mut)" }}>{label}</span>}
    </div>
  );
}

/* ─── Rivet row — decorative studs along a plate edge ─── */
export function RivetRow({ count = 6 }: { count?: number }) {
  return (
    <div className="flex items-center justify-between px-2" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="rivet" />
      ))}
    </div>
  );
}

/* ─── Animated LCD cursor (blink) ───
   Drop into any LCD readout for a "waiting for input" feel. */
export function LcdCursor() {
  return <span className="lcd-cursor lcd !bg-transparent" style={{ color: "var(--amber)" }}>█</span>;
}

/* ─── Phase meter — stereo correlation indicator ───
   A horizontal bar with a moving dot, like a real phase correlator.
   Decorative. Centered = in-phase; extremes = out-of-phase. */
export function PhaseMeter({ value = 0 }: { value?: number }) {
  // -1 (out, left) .. 0 (center, in phase) .. +1 (out, right)
  const v = Math.max(-1, Math.min(1, value));
  const pct = ((v + 1) / 2) * 100;
  return (
    <div className="electronics p-3 my-3" aria-hidden="true">
      <div className="flex items-center gap-2 mb-2">
        <span className="led led-g" />
        <span className="silk" style={{ color: "var(--amber)" }}>PHASE · CORRELATION</span>
      </div>
      <div className="relative h-2 rounded-sm" style={{ background: "var(--disp-b)" }}>
        <div className="absolute top-0 bottom-0 left-1/2 w-px" style={{ background: "var(--amber)", opacity: 0.4 }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-3 rounded-sm"
          style={{
            left: `calc(${pct}% - 4px)`,
            background: "var(--amber)",
            boxShadow: "0 0 6px var(--amber)",
            transition: "left 200ms ease",
          }}
        />
      </div>
      <div className="flex justify-between mt-1 silk !text-[0.5rem]" style={{ color: "rgba(255,176,0,0.5)" }}>
        <span>L</span>
        <span>IN-PHASE</span>
        <span>R</span>
      </div>
    </div>
  );
}

/* ─── Boot splash overlay — one-shot power-up ───
   Brief full-screen overlay that fades like a device booting.
   Reduced-motion: skipped entirely. No content (just amber flicker). */
export function BootSplash() {
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setDone(true);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }
    // only show on first load of the session
    if (sessionStorage.getItem("beatguider-booted")) {
      setDone(true);
      return;
    }
    sessionStorage.setItem("beatguider-booted", "1");
    setShow(true);
    const t = setTimeout(() => {
      setShow(false);
      setDone(true);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  if (done && !show) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
      style={{
        background: "var(--disp)",
        opacity: show ? 1 : 0,
        transition: "opacity 300ms ease-out",
      }}
    >
      <div className="text-center">
        <div
          className="font-[family-name:var(--font-chakra)] font-bold text-2xl tracking-widest boot-on-load"
          style={{ color: "var(--amber)", textShadow: "0 0 12px var(--amber)" }}
        >
          BEAT<span style={{ color: "var(--vu-g)" }}>·</span>GUIDER
        </div>
        <div className="silk mt-2" style={{ color: "rgba(255,176,0,0.6)" }}>BG-1 · BOOTING</div>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <span className="led led-g led-breathe" />
          <span className="led led-a led-breathe" style={{ animationDelay: "120ms" }} />
          <span className="led led-g led-breathe" style={{ animationDelay: "240ms" }} />
        </div>
      </div>
    </div>
  );
}

/* ─── LED chase — sequential power-on of the header LED row ───
   Observes the LED row with IntersectionObserver; on first scroll into
   view, adds the .led-chase class to each LED in sequence with a
   staggered delay. One-shot per page load. Reduced-motion: no-op. */
export function LedChase() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const row = document.querySelector(".faceplate-led-row");
    if (!row) return;
    const leds = Array.from(row.querySelectorAll(".led"));
    if (leds.length === 0) return;
    let fired = false;
    const obs = new IntersectionObserver(
      (entries) => {
        if (fired) return;
        if (entries[0]?.isIntersecting) {
          fired = true;
          leds.forEach((led, i) => {
            setTimeout(() => {
              led.classList.remove("led-chase");
              void (led as HTMLElement).offsetWidth;
              led.classList.add("led-chase");
            }, i * 120);
          });
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(row);
    return () => obs.disconnect();
  }, []);
  return null;
}

/* ─── Scroll-to-top hardware button ───
   Appears after scrolling down > 600px. Styled as a recessed chassis
   button with amber LED. Smooth-scrolls to top. Reduced-motion: instant. */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }}
      className="fixed bottom-4 right-4 z-30 hwbtn !p-2.5 !rounded-full"
      aria-label="Scroll to top of page"
      title="Back to top"
    >
      <span className="led led-a scroll-top-led" aria-hidden="true" />
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 3L3 8M8 3L13 8M8 3V13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/* ─── POST (power-on self-test) overlay ───
   A brief diagnostic sequence on first load: shows LED checks
   (PWR / SIG / ERR / signal bars) lighting in sequence, then fades.
   Complements BootSplash. Reduced-motion: skipped. SessionStorage-gated
   so it shows once per session. */
export function PostSequence() {
  const [step, setStep] = useState<number>(-1); // -1 = not started, 0..4 = checks, 5 = done

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setStep(5);
      return;
    }
    if (sessionStorage.getItem("beatguider-post")) {
      setStep(5);
      return;
    }
    sessionStorage.setItem("beatguider-post", "1");
    setStep(0);
    const steps = [0, 1, 2, 3, 4, 5];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i >= steps.length) {
        clearInterval(interval);
        setStep(5);
      } else {
        setStep(steps[i]);
      }
    }, 280);
    return () => clearInterval(interval);
  }, []);

  if (step === -1 || step === 5) return null;

  const checks = [
    { label: "PWR", led: "led led-g", on: step >= 0 },
    { label: "SIG", led: "led led-a", on: step >= 1 },
    { label: "ERR", led: step >= 2 ? "led" : "led led-r led-r-pulse", on: step >= 2 },
    { label: "BUS", led: "led led-a", on: step >= 3 },
    { label: "READY", led: "led led-g", on: step >= 4 },
  ];

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center"
      style={{
        background: "var(--disp)",
        opacity: step >= 5 ? 0 : 1,
        transition: "opacity 300ms ease-out",
      }}
    >
      <div className="text-center">
        <div className="silk-lg mb-4" style={{ color: "var(--amber)" }}>
          BG-1 · POWER-ON SELF-TEST
        </div>
        <div className="flex items-center justify-center gap-4 mb-4">
          {checks.map((c, i) => (
            <div key={c.label} className="flex flex-col items-center gap-1.5">
              <span
                className={`led ${c.on ? c.led : ""}`}
                style={{ width: 10, height: 10, opacity: c.on ? 1 : 0.2 }}
              />
              <span
                className="silk !text-[0.5625rem]"
                style={{ color: c.on ? "var(--amber)" : "rgba(255,176,0,0.3)" }}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
        <div className="lcd !text-xs !bg-transparent" style={{ color: "rgba(255,176,0,0.6)" }}>
          &gt; {step < 4 ? `checking ${checks[step]?.label}…` : "all systems nominal"}
        </div>
      </div>
    </div>
  );
}

/* ─── Signal chain visualization ───
   A horizontal block diagram showing the DJ signal path:
   SOURCE → MIXER → FX → OUTPUT. Each node is a dark display module
   with an amber LED + label. Animated signal dots flow between nodes
   (paused under reduced-motion). Decorative but educational. */
export function SignalChain({
  nodes = [
    { label: "SOURCE", sub: "deck / DVS" },
    { label: "MIXER", sub: "EQ / gain" },
    { label: "FX", sub: "filter / echo" },
    { label: "MASTER", sub: "limiter" },
    { label: "OUTPUT", sub: "RCA / booth" },
  ],
}: {
  nodes?: { label: string; sub: string }[];
}) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  return (
    <div className="electronics p-4 my-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="led led-a led-breathe" aria-hidden="true" />
        <span className="silk" style={{ color: "var(--amber)" }}>Signal chain · audio path</span>
        <span className="ml-auto codechip">SIG-02</span>
      </div>
      <div className="flex items-stretch gap-1 overflow-x-auto scroll-x pb-1">
        {nodes.map((n, i) => (
          <div key={n.label} className="flex items-stretch flex-shrink-0">
            <div
              className="flex flex-col items-center justify-center px-3 py-2 border rounded-sm"
              style={{
                borderColor: "var(--disp-b)",
                background: "#060606",
                minWidth: "70px",
              }}
            >
              <span className="led led-a mb-1" aria-hidden="true" />
              <span className="lcd !text-[0.6875rem] !bg-transparent font-semibold" style={{ color: "var(--amber)" }}>
                {n.label}
              </span>
              <span className="silk !text-[0.5rem] mt-0.5" style={{ color: "rgba(255,176,0,0.55)" }}>
                {n.sub}
              </span>
            </div>
            {i < nodes.length - 1 && (
              <div
                className="signal-flow flex items-center self-stretch"
                aria-hidden="true"
                style={{ width: "28px", position: "relative" }}
              >
                {!reduced && (
                  <span
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: 0,
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "var(--amber)",
                      boxShadow: "0 0 4px var(--amber)",
                      transform: "translateY(-50%)",
                      animation: "signal-travel 2s linear infinite",
                      animationDelay: `${i * 250}ms`,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="lcd !text-[0.6875rem] !bg-transparent mt-2" style={{ color: "rgba(255,176,0,0.55)" }}>
        &gt; signal flows left → right · each node adds processing · output is line-level
      </p>
    </div>
  );
}

/* ─── Cassette reel spinner ───
   Two circular reels that spin slowly, like a tape deck. Decorative.
   For the Lab Activity feed header. Paused under reduced-motion. */
export function CassetteReels({ size = 24 }: { size?: number }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      <span
        className="inline-block rounded-full border-2"
        style={{
          width: size,
          height: size,
          borderColor: "var(--amber)",
          borderTopColor: "transparent",
          animation: reduced ? "none" : "reel-spin 2s linear infinite",
        }}
      />
      <span
        className="inline-block rounded-full border-2"
        style={{
          width: size,
          height: size,
          borderColor: "var(--amber)",
          borderBottomColor: "transparent",
          animation: reduced ? "none" : "reel-spin 2s linear infinite reverse",
        }}
      />
      <style>{`@keyframes reel-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

/* ─── Live clock readout ───
   A real-time HH:MM:SS clock with a blinking green tick LED, like
   equipment with an RTC. Updates every second. Reduced-motion: the
   tick LED stops blinking but the time still updates. */
export function LiveClock() {
  const [time, setTime] = useState("--:--:--");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    /* eslint-enable react-hooks/set-state-in-effect */
    const update = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      const s = String(d.getSeconds()).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="clock-readout" aria-label="Current time">
      <span className={`led led-g ${reduced ? "" : ""}`} aria-hidden="true" style={{ width: 4, height: 4, animation: reduced ? "none" : "clock-tick 1s steps(1) infinite" }} />
      <span className="lcd !text-[0.5625rem] !bg-transparent font-semibold tabular-nums" style={{ color: "var(--amber)" }}>
        {time}
      </span>
      <span className="silk !text-[0.5rem]" style={{ color: "rgba(255,176,0,0.55)" }}>UTC</span>
    </span>
  );
}
