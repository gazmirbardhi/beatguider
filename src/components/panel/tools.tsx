"use client";

import { useState, useMemo, type ReactNode } from "react";
import { CautionCallout } from "./components";

/* ════════════════════════════════════════════════════════════════
   BeatGuider TOOLS — "rack units"
   Each tool is a Client Component styled as a device: hardware inputs,
   results on a dark LCD readout in Plex Mono with amber digits.
   All static-export compatible, JavaScript per-route only.
   ════════════════════════════════════════════════════════════════ */

function RackFrame({
  code,
  title,
  children,
  foot,
}: {
  code: string;
  title: string;
  children: ReactNode;
  foot?: ReactNode;
}) {
  return (
    <article className="modcard p-4 sm:p-5 relative" style={{ borderLeftColor: "var(--acc)" }}>
      <header className="flex items-center gap-2 mb-3">
        <span className="led led-a led-breathe" aria-hidden="true" />
        <span className="codechip">{code}</span>
        <h3 className="font-[family-name:var(--font-chakra)] font-semibold text-sm sm:text-base" style={{ color: "var(--text2)" }}>
          {title}
        </h3>
      </header>
      {children}
      {foot && (
        <footer className="mt-3 pt-3 border-t border-[var(--line)] silk" style={{ color: "var(--mut)" }}>
          {foot}
        </footer>
      )}
    </article>
  );
}

function LcdReadout({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="electronics p-3 sm:p-4">
      {label && (
        <div className="silk mb-2 flex items-center gap-2" style={{ color: "rgba(255,176,0,0.6)" }}>
          <span className="led led-a" aria-hidden="true" />
          {label}
        </div>
      )}
      <div className="lcd !bg-transparent text-sm sm:text-base leading-relaxed" style={{ color: "var(--amber)" }}>
        {children}
      </div>
    </div>
  );
}

/* ─── BPM & Timing Calculator ───
   ms from BPM, note timing, bars/beats, common delay timings */
export function BpmCalculator() {
  const [bpm, setBpm] = useState("128");
  const num = parseFloat(bpm);
  const valid = !isNaN(num) && num > 0;

  const data = useMemo(() => {
    if (!valid) return null;
    const msPerBeat = 60000 / num;
    const note = (div: number) => msPerBeat / div;
    return {
      msPerBeat,
      msPerBar: msPerBeat * 4,
      quarter: note(1),
      eighth: note(2),
      sixteenth: note(4),
      triplet: note(1.5),
      dotted: msPerBeat * 0.75,
      barsPerMin: num / 4,
    };
  }, [bpm, valid]);

  const commonDelays = [
    { label: "1/4 · dotted-eighth ping-pong", ms: data?.quarter },
    { label: "1/8 · slapback", ms: data?.eighth },
    { label: "1/16 · quarter-note triplet feel", ms: data?.sixteenth },
  ];

  return (
    <RackFrame code="TOOL-01" title="BPM & Timing Calculator" foot="ms = 60000 ÷ BPM. Delay timings are theoretical; sync to your DAW/host tempo for locked repeats.">
      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 mb-3">
        <label className="flex flex-col gap-1">
          <span className="silk" style={{ color: "var(--mut)" }}>BPM</span>
          <input
            type="number"
            inputMode="decimal"
            min="20"
            max="400"
            step="0.1"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            className="electronics px-3 py-2 lcd !bg-transparent !text-lg font-semibold tabular-nums w-full outline-none"
            style={{ color: "var(--amber)" }}
            aria-label="Tempo in beats per minute"
          />
        </label>
        <div className="flex items-end gap-2">
          {[87, 100, 115, 124, 128, 140, 174].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBpm(String(b))}
              className="hwbtn !px-2 !py-1.5 !text-[0.6875rem]"
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {data ? (
        <LcdReadout label={`Readout · ${bpm} BPM`}>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
            <Row k="ms / beat" v={data.msPerBeat.toFixed(2)} />
            <Row k="ms / bar" v={data.msPerBar.toFixed(2)} />
            <Row k="bars / min" v={data.barsPerMin.toFixed(2)} />
            <Row k="1/4 · ms" v={data.quarter.toFixed(2)} />
            <Row k="1/8 · ms" v={data.eighth.toFixed(2)} />
            <Row k="1/16 · ms" v={data.sixteenth.toFixed(2)} />
            <Row k="1/4T · ms" v={data.triplet.toFixed(2)} />
            <Row k="dotted 1/8" v={data.dotted.toFixed(2)} />
          </dl>
          <div className="mt-3 pt-3 border-t border-[var(--disp-b)]">
            <div className="silk mb-1.5" style={{ color: "rgba(255,176,0,0.6)" }}>Common delay timings</div>
            <ul className="space-y-1">
              {commonDelays.map((d) => (
                <li key={d.label} className="flex items-baseline justify-between gap-3">
                  <span style={{ color: "var(--amber)" }}>{d.label}</span>
                  <span className="font-semibold tabular-nums">{d.ms?.toFixed(2)} ms</span>
                </li>
              ))}
            </ul>
          </div>
        </LcdReadout>
      ) : (
        <LcdReadout label="Readout">
          <span style={{ color: "var(--vu-r)" }}>&gt; ERR · invalid BPM</span>
        </LcdReadout>
      )}
    </RackFrame>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span style={{ color: "rgba(255,176,0,0.65)" }}>{k}</span>
      <span className="font-semibold tabular-nums">{v}</span>
    </div>
  );
}

/* ─── Camelot / Harmonic Mixing Calculator ───
   Compatible keys from a known key/Camelot value.
   We do NOT claim audio key detection — this is a reference calculator
   for keys the user already knows. */
const CAMELOT: { code: string; key: string }[] = [
  { code: "1A", key: "Ab Minor" }, { code: "1B", key: "B Major" },
  { code: "2A", key: "Eb Minor" }, { code: "2B", key: "F# Major" },
  { code: "3A", key: "Bb Minor" }, { code: "3B", key: "Db Major" },
  { code: "4A", key: "F Minor" }, { code: "4B", key: "Ab Major" },
  { code: "5A", key: "C Minor" }, { code: "5B", key: "Eb Major" },
  { code: "6A", key: "G Minor" }, { code: "6B", key: "Bb Major" },
  { code: "7A", key: "D Minor" }, { code: "7B", key: "F Major" },
  { code: "8A", key: "A Minor" }, { code: "8B", key: "C Major" },
  { code: "9A", key: "E Minor" }, { code: "9B", key: "G Major" },
  { code: "10A", key: "B Minor" }, { code: "10B", key: "D Major" },
  { code: "11A", key: "F# Minor" }, { code: "11B", key: "E Major" },
  { code: "12A", key: "C# Minor" }, { code: "12B", key: "A Major" },
];

function nextCode(code: string, delta: number): string {
  const m = code.match(/^(\d+)([AB])$/);
  if (!m) return code;
  const n = parseInt(m[1], 10);
  const letter = m[2];
  const newN = ((n - 1 + delta + 12) % 12) + 1;
  return `${newN}${letter}`;
}

export function CamelotCalculator() {
  const [code, setCode] = useState("8A");
  const keyObj = CAMELOT.find((c) => c.code === code) ?? { code, key: "—" };
  const currentN = parseInt(code.match(/^(\d+)/)?.[1] ?? "0", 10);
  const currentL = code.match(/[AB]$/)?.[0] ?? "A";

  // compatible: same code (perfect), +1/-1 same letter (relative),
  // same number opposite letter (modal), energy boost +7/-7 (use sparingly)
  const same = keyObj;
  const relative = CAMELOT.find((c) => c.code === nextCode(code, 1));
  const relativeDown = CAMELOT.find((c) => c.code === nextCode(code, -1));
  const modal = CAMELOT.find((c) => c.code === `${currentN}${currentL === "A" ? "B" : "A"}`);
  const energyBoost = CAMELOT.find((c) => c.code === nextCode(code, 7));

  return (
    <RackFrame
      code="TOOL-02"
      title="Camelot / Harmonic Mixing Calculator"
      foot="Reference only. This tool does not detect audio key. Use your DJ software's key analysis (or a piano) to identify the key first, then look up compatible transitions here."
    >
      <label className="flex flex-col gap-1 mb-3">
        <span className="silk" style={{ color: "var(--mut)" }}>Your key (Camelot)</span>
        <select
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="electronics px-3 py-2 lcd !bg-transparent !text-base font-semibold outline-none w-full"
          style={{ color: "var(--amber)" }}
          aria-label="Select your Camelot key code"
        >
          {CAMELOT.map((c) => (
            <option key={c.code} value={c.code} style={{ background: "#0A0A0A", color: "#FFB000" }}>
              {c.code} · {c.key}
            </option>
          ))}
        </select>
      </label>

      <LcdReadout label={`Harmonic map · ${code} (${keyObj.key})`}>
        <ul className="space-y-2">
          <CompatRow label="Same key · perfect match" code={same.code} keyName={same.key} confidence="100%" />
          <CompatRow label="+1 same letter · relative" code={relative?.code ?? "—"} keyName={relative?.key ?? "—"} confidence="high" />
          <CompatRow label="−1 same letter · relative" code={relativeDown?.code ?? "—"} keyName={relativeDown?.key ?? "—"} confidence="high" />
          <CompatRow label="Same #, swap letter · modal" code={modal?.code ?? "—"} keyName={modal?.key ?? "—"} confidence="med" />
          <CompatRow label="+7 · energy boost (sparingly)" code={energyBoost?.code ?? "—"} keyName={energyBoost?.key ?? "—"} confidence="low" />
        </ul>
      </LcdReadout>
    </RackFrame>
  );
}

function CompatRow({
  label,
  code,
  keyName,
  confidence,
}: {
  label: string;
  code: string;
  keyName: string;
  confidence: string;
}) {
  const confColor =
    confidence === "100%" ? "var(--vu-g)" :
    confidence === "high" ? "var(--vu-g)" :
    confidence === "med" ? "var(--amber)" :
    "var(--vu-r)";
  const segCount = confidence === "100%" ? 8 : confidence === "high" ? 6 : confidence === "med" ? 4 : 2;
  return (
    <li className="flex items-center gap-3">
      <span className="lcd !text-xs font-semibold !px-1.5 !py-0.5 flex-shrink-0" style={{ color: "var(--amber)" }}>{code}</span>
      <span className="flex-1 min-w-0">
        <span style={{ color: "var(--amber)" }}>{keyName}</span>
        <span className="block silk !text-[0.5625rem] mt-0.5" style={{ color: "rgba(255,176,0,0.55)" }}>{label}</span>
      </span>
      <span className="flex items-center gap-px w-16 flex-shrink-0" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className={`vu-seg h-2 ${i < segCount ? "vu-seg-g" : ""}`} style={i >= segCount ? {} : {}} />
        ))}
      </span>
      <span className="text-[0.6875rem] flex-shrink-0 w-12 text-right" style={{ color: confColor }}>{confidence}</span>
    </li>
  );
}

/* ─── Mobile DJ Power Calculator ───
   continuous load, peak allowance, suggested generator range, safety margin,
   with strong disclaimers that ratings and real-world loads vary. */
export function PowerCalculator() {
  const [watts, setWatts] = useState("1200");
  const [voltage, setVoltage] = useState("230");

  const data = useMemo(() => {
    const w = parseFloat(watts);
    const v = parseFloat(voltage);
    if (isNaN(w) || isNaN(v) || w <= 0 || v <= 0) return null;
    const continuousA = w / v;
    // typical inrush / peak allowance for amps + powered speakers: 1.5× continuous
    const peakA = continuousA * 1.5;
    // suggested generator range: 2× continuous with 20% safety margin on top
    const suggestedVA = Math.ceil((w * 2 * 1.2) / 100) * 100;
    const circuitBreaker = continuousA <= 6 ? "10A" : continuousA <= 10 ? "13A" : continuousA <= 16 ? "20A" : "32A";
    return {
      continuousA: continuousA.toFixed(2),
      peakA: peakA.toFixed(2),
      suggestedVA,
      circuitBreaker,
      continuousW: w,
    };
  }, [watts, voltage]);

  return (
    <RackFrame
      code="TOOL-03"
      title="Mobile DJ Power Calculator"
      foot="Estimates only. Real-world inrush, power factor, and load diversity vary widely. Always verify against equipment nameplate ratings and a qualified electrician's assessment."
    >
      <div className="grid grid-cols-2 gap-3 mb-3">
        <label className="flex flex-col gap-1">
          <span className="silk" style={{ color: "var(--mut)" }}>Total load (W)</span>
          <input
            type="number"
            min="0"
            value={watts}
            onChange={(e) => setWatts(e.target.value)}
            className="electronics px-3 py-2 lcd !bg-transparent !text-base font-semibold tabular-nums outline-none w-full"
            style={{ color: "var(--amber)" }}
            aria-label="Total continuous load in watts"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="silk" style={{ color: "var(--mut)" }}>Voltage (V)</span>
          <select
            value={voltage}
            onChange={(e) => setVoltage(e.target.value)}
            className="electronics px-3 py-2 lcd !bg-transparent !text-base font-semibold outline-none w-full"
            style={{ color: "var(--amber)" }}
            aria-label="Mains voltage"
          >
            <option value="120" style={{ background: "#0A0A0A", color: "#FFB000" }}>120V · US</option>
            <option value="230" style={{ background: "#0A0A0A", color: "#FFB000" }}>230V · EU</option>
            <option value="240" style={{ background: "#0A0A0A", color: "#FFB000" }}>240V · UK</option>
            <option value="100" style={{ background: "#0A0A0A", color: "#FFB000" }}>100V · JP</option>
          </select>
        </label>
      </div>

      {data ? (
        <LcdReadout label={`Load analysis · ${data.continuousW}W @ ${voltage}V`}>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <Row k="Continuous draw" v={`${data.continuousA} A`} />
            <Row k="Peak allowance (1.5×)" v={`${data.peakA} A`} />
            <Row k="Suggested generator" v={`${data.suggestedVA} VA`} />
            <Row k="Min. breaker" v={data.circuitBreaker} />
          </dl>
        </LcdReadout>
      ) : (
        <LcdReadout label="Readout">
          <span style={{ color: "var(--vu-r)" }}>&gt; ERR · invalid input</span>
        </LcdReadout>
      )}

      <CautionCallout title="Caution · ratings vary">
        Powered speakers and subwoofers draw short inrush currents far above nameplate RMS.
        Generators must be sized for inrush + headroom, not continuous watts.
        Confirm with the manufacturer's spec sheet and a qualified electrician before any install.
      </CautionCallout>
    </RackFrame>
  );
}
