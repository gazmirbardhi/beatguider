"use client";

import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from "react";

type Mode = "night" | "day";

/**
 * Theme toggle for the BeatGuider PANEL system.
 * The chassis cross-fades (~350ms), electronics stay lit.
 * On swap, the LEDs flicker once like a device reboot (boot-flicker class).
 *
 * Night is the attribute-less default — site remains correct with JS disabled.
 * Day activates via [data-mode="day"] on <html>.
 *
 * Persistence: localStorage key `beatguider-mode` + prefers-color-scheme fallback.
 * The no-flash inline script in layout.tsx sets the attribute before paint.
 *
 * Theme state is lifted into a Context so the faceplate rocker and the
 * reader-bar button stay in sync — both consume the same store.
 */
type ThemeCtx = { mode: Mode; toggle: () => void; mounted: boolean };
const ThemeContext = createContext<ThemeCtx>({ mode: "night", toggle: () => {}, mounted: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("night");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sync mode from the DOM attribute set by the no-flash <head> script.
    // This runs only on the client, after mount, to avoid hydration mismatch
    // (server renders "night" default; client may have "day" set pre-hydration).
    // Reading from an external store (the DOM) post-mount is the React-blessed
    // pattern for this exact case.
    /* eslint-disable react-hooks/set-state-in-effect */
    const current = (document.documentElement.getAttribute("data-mode") as Mode) || "night";
    setMode(current);
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Keep all instances in sync: if the DOM attribute changes from elsewhere,
  // re-sync. This handles cross-tab and cross-instance coordination.
  useEffect(() => {
    const obs = new MutationObserver(() => {
      const current = (document.documentElement.getAttribute("data-mode") as Mode) || "night";
      setMode((prev) => (prev === current ? prev : current));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
    return () => obs.disconnect();
  }, []);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next: Mode = prev === "night" ? "day" : "night";
      document.documentElement.setAttribute("data-mode", next);
      try {
        localStorage.setItem("beatguider-mode", next);
      } catch {
        /* storage unavailable — silent */
      }
      // boot-flicker on LEDs
      document.querySelectorAll(".led").forEach((el) => {
        el.classList.remove("boot-flicker");
        // force reflow to restart animation
        void (el as HTMLElement).offsetWidth;
        el.classList.add("boot-flicker");
      });
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggle, mounted }}>{children}</ThemeContext.Provider>
  );
}

function useTheme() {
  return useContext(ThemeContext);
}

/** Rocker switch: NIGHT | DAY — sits in the faceplate header. */
export function ModeRocker() {
  const { mode, toggle, mounted } = useTheme();

  return (
    <span
      className="rocker"
      role="switch"
      aria-label="Chassis mode. Night is default."
      aria-checked={mode === "day"}
    >
      <button
        type="button"
        className="rocker-knob"
        aria-pressed={mounted ? mode === "night" : true}
        aria-label="Night mode (black chassis)"
        onClick={() => {
          if (mode !== "night") toggle();
        }}
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            className={`led ${mounted && mode === "night" ? "led-a" : ""}`}
            aria-hidden="true"
          />
          Night
        </span>
      </button>
      <button
        type="button"
        className="rocker-knob"
        aria-pressed={mounted ? mode === "day" : false}
        aria-label="Day mode (brushed silver chassis)"
        onClick={() => {
          if (mode !== "day") toggle();
        }}
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            className={`led ${mounted && mode === "day" ? "led-a" : ""}`}
            aria-hidden="true"
          />
          Day
        </span>
      </button>
    </span>
  );
}

/** Compact moon/sun button for the reader bar — same toggle behavior. */
export function ModeIconButton() {
  const { mode, toggle, mounted } = useTheme();
  const isDay = mounted && mode === "day";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDay}
      aria-label={isDay ? "Switch to night mode" : "Switch to day mode"}
      title={isDay ? "Switch to night mode" : "Switch to day mode"}
      className="hwbtn !px-2.5 !py-2"
    >
      <span className="led led-a" aria-hidden="true" />
      <span className="text-[0.6875rem]">{isDay ? "DAY" : "NIGHT"}</span>
    </button>
  );
}

export { useTheme };
