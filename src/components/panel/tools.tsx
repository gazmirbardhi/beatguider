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

/* ════════════════════════════════════════════════════════════════
   GEAR DUELER (TOOL-04) — §13
   Interactive comparison of two supported products (client-side state,
   not indexed URLs). UI: two gear module cards + comparison table with
   winner highlights + verdict plate. Only editorially approved comparisons
   receive permanent routes (/compare/.../); this tool is the live editor.

   Ratings render as VU meters and are emitted only from real test data.
   Untested gear shows a "SPEC-ONLY" status — never a fabricated score. */
type Duelist = "a" | "b" | "tie" | null;

function parseSpec(specs: { label: string; value: string }[], label: string): string | undefined {
  return specs.find((s) => s.label.toLowerCase() === label.toLowerCase())?.value;
}

// Heuristic winner detection for known spec dimensions.
// Returns "a" | "b" | "tie" | null when not comparable.
function judgeSpec(label: string, va: string, vb: string): Duelist {
  const l = label.toLowerCase();
  // numeric extraction (first number, possibly with decimals)
  const num = (s: string): number | null => {
    const m = s.match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : null;
  };

  // "lower is better" dims: weight, latency, price (no price fabricated here)
  const lowerBetter = ["weight"];
  // "higher is better" dims: sample rate (kHz), bit depth, channels, pads, year
  const higherBetter = ["audio interface", "bit", "channel", "pad", "release"];

  if (lowerBetter.some((k) => l.includes(k))) {
    const a = num(va), b = num(vb);
    if (a == null || b == null) return null;
    if (Math.abs(a - b) < 0.05) return "tie";
    return a < b ? "a" : "b";
  }
  if (higherBetter.some((k) => l.includes(k))) {
    // bit depth: prefer 24 over 16; sample rate: prefer 48 over 44
    const a = num(va), b = num(vb);
    if (a == null || b == null) return null;
    if (a === b) return "tie";
    return a > b ? "a" : "b";
  }
  // string equality → tie; else null (not comparable)
  if (va.trim().toLowerCase() === vb.trim().toLowerCase()) return "tie";
  return null;
}

function avgRating(g: { rating?: { label: string; value: number }[] }): number | null {
  if (!g.rating || g.rating.length === 0) return null;
  return Math.round(g.rating.reduce((s, r) => s + r.value, 0) / g.rating.length);
}

function statusLed(g: { tested: boolean; status: string }): "g" | "a" | "off" {
  if (!g.tested) return "off";
  return g.status === "active" ? "g" : "a";
}

export function GearDueler({
  gear,
}: {
  gear: import("@/lib/content/data").GearEntry[];
}) {
  // default: first two gear entries
  const [aSlug, setASlug] = useState(gear[0]?.slug ?? "");
  const [bSlug, setBSlug] = useState(gear[1]?.slug ?? "");

  const a = gear.find((g) => g.slug === aSlug);
  const b = gear.find((g) => g.slug === bSlug);

  // union of all spec labels in display order
  const specLabels = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    [...(a?.majorSpecs ?? []), ...(b?.majorSpecs ?? [])].forEach((s) => {
      if (!seen.has(s.label)) {
        seen.add(s.label);
        out.push(s.label);
      }
    });
    return out;
  }, [a, b]);

  // tally wins
  const tally = useMemo(() => {
    if (!a || !b) return { a: 0, b: 0, tie: 0, judged: 0 };
    let wa = 0, wb = 0, wt = 0, judged = 0;
    specLabels.forEach((label) => {
      const va = parseSpec(a.majorSpecs, label) ?? "—";
      const vb = parseSpec(b.majorSpecs, label) ?? "—";
      const w = judgeSpec(label, va, vb);
      if (w) {
        judged++;
        if (w === "a") wa++;
        else if (w === "b") wb++;
        else wt++;
      }
    });
    return { a: wa, b: wb, tie: wt, judged };
  }, [a, b, specLabels]);

  const overall: Duelist = !a || !b ? null : tally.judged === 0 ? null : tally.a === tally.b ? "tie" : tally.a > tally.b ? "a" : "b";

  return (
    <RackFrame
      code="TOOL-04"
      title="Gear Dueler"
      foot="Client-side state — not indexed URLs. Editorially approved comparisons receive permanent /compare/ routes. Untested gear shows SPEC-ONLY status; VU ratings render only from real test data."
    >
      {/* selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <DuelSelector label="A · contestant one" gear={gear} value={aSlug} onChange={setASlug} accent="var(--acc)" />
        <DuelSelector label="B · contestant two" gear={gear} value={bSlug} onChange={setBSlug} accent="var(--vu-g)" />
      </div>

      {/* contestant cards + signal-flow connector */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {a && <DuelistCard g={a} side="a" winner={overall} />}
        {/* signal-flow connector — animated amber dot traveling A→B (desktop only) */}
        {a && b && (
          <div
            className="signal-flow hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-6 z-10"
            aria-hidden="true"
            style={{ background: "var(--card)", borderRadius: "3px", border: "1px solid var(--plate-b)" }}
          >
            <div className="flex items-center justify-center h-full px-1">
              <span className="silk !text-[0.5rem]" style={{ color: "var(--amber)" }}>VS</span>
            </div>
          </div>
        )}
        {b && <DuelistCard g={b} side="b" winner={overall} />}
      </div>

      {/* verdict plate */}
      {a && b && (
        <div className="electronics p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="led led-a led-breathe" aria-hidden="true" />
            <span className="silk" style={{ color: "var(--amber)" }}>Verdict plate · auto-derived</span>
          </div>
          {overall === null ? (
            <p className="lcd !text-sm !bg-transparent" style={{ color: "var(--amber)" }}>
              &gt; no comparable numeric dimensions — pick two units with overlapping specs
            </p>
          ) : overall === "tie" ? (
            <p className="lcd !text-sm !bg-transparent" style={{ color: "var(--amber)" }}>
              &gt; TIE · {tally.a}–{tally.b} on {tally.judged} judged dimensions · {tally.tie} tie(s)
            </p>
          ) : (
            <p className="lcd !text-sm !bg-transparent" style={{ color: "var(--amber)" }}>
              &gt; WINNER · <span style={{ color: "var(--vu-g)" }}>{overall === "a" ? a.model : b.model}</span>
              {" "}· {tally.a}–{tally.b} on {tally.judged} judged dimensions · {tally.tie} tie(s)
            </p>
          )}
          <p className="lcd !text-[0.6875rem] !bg-transparent mt-2" style={{ color: "rgba(255,176,0,0.55)" }}>
            &gt; heuristic judge · lower-better: weight · higher-better: bit-depth, channels, pads, release year · ties scored separately
          </p>
        </div>
      )}

      {/* comparison table */}
      {a && b && (
        <div className="electronics overflow-x-auto scroll-x">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr style={{ background: "#060606" }}>
                <th className="text-left px-3 sm:px-4 py-2 silk" style={{ color: "var(--amber)" }}>SPEC</th>
                <th
                  className="text-left px-3 sm:px-4 py-2 silk"
                  style={{ color: "var(--amber)", borderLeft: overall === "a" ? "3px solid var(--amber)" : "1px solid var(--disp-b)" }}
                >
                  <span className="flex items-center gap-1.5">
                    {overall === "a" && <span className="led led-a" aria-hidden="true" />}
                    {a.model}
                  </span>
                </th>
                <th
                  className="text-left px-3 sm:px-4 py-2 silk"
                  style={{ color: "var(--amber)", borderLeft: overall === "b" ? "3px solid var(--amber)" : "1px solid var(--disp-b)" }}
                >
                  <span className="flex items-center gap-1.5">
                    {overall === "b" && <span className="led led-a" aria-hidden="true" />}
                    {b.model}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {specLabels.map((label, i) => {
                const va = parseSpec(a.majorSpecs, label) ?? "—";
                const vb = parseSpec(b.majorSpecs, label) ?? "—";
                const w = judgeSpec(label, va, vb);
                return (
                  <tr key={label} className={i > 0 ? "border-t border-[var(--disp-b)]" : ""}>
                    <th scope="row" className="text-left align-top px-3 sm:px-4 py-2 silk" style={{ color: "var(--amber)" }}>
                      {label}
                    </th>
                    <td
                      className="px-3 sm:px-4 py-2 mono align-top"
                      style={{
                        color: "var(--amber)",
                        borderLeft: w === "a" ? "3px solid var(--amber)" : "1px solid var(--disp-b)",
                        background: w === "a" ? "rgba(255,176,0,0.10)" : "transparent",
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span>{va}</span>
                        {w === "a" && <span className="led led-a" aria-hidden="true" />}
                      </span>
                    </td>
                    <td
                      className="px-3 sm:px-4 py-2 mono align-top"
                      style={{
                        color: "var(--amber)",
                        borderLeft: w === "b" ? "3px solid var(--amber)" : "1px solid var(--disp-b)",
                        background: w === "b" ? "rgba(255,176,0,0.10)" : "transparent",
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span>{vb}</span>
                        {w === "b" && <span className="led led-a" aria-hidden="true" />}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* swap button */}
      {a && b && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => { setASlug(b.slug); setBSlug(a.slug); }}
            className="hwbtn !text-[0.6875rem]"
            aria-label="Swap contestant A and B"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 5H12M12 5L9 2M12 5L9 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 11H4M4 11L7 8M4 11L7 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Swap A ↔ B
          </button>
        </div>
      )}
    </RackFrame>
  );
}

function DuelSelector({
  label,
  gear,
  value,
  onChange,
  accent,
}: {
  label: string;
  gear: import("@/lib/content/data").GearEntry[];
  value: string;
  onChange: (v: string) => void;
  accent: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="silk flex items-center gap-1.5" style={{ color: "var(--mut)" }}>
        <span className="inline-block w-2 h-2 rounded-full" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} aria-hidden="true" />
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="electronics px-3 py-2 lcd !bg-transparent !text-base font-semibold outline-none w-full"
        style={{ color: "var(--amber)" }}
        aria-label={label}
      >
        {gear.map((g) => (
          <option key={g.code} value={g.slug} style={{ background: "#0A0A0A", color: "#FFB000" }}>
            {g.code} · {g.manufacturer} {g.model} {g.status === "discontinued" ? "(disc.)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

function DuelistCard({
  g,
  side,
  winner,
}: {
  g: import("@/lib/content/data").GearEntry;
  side: "a" | "b";
  winner: Duelist;
}) {
  const avg = avgRating(g);
  const led = statusLed(g);
  const ledCls = led === "g" ? "led led-g" : led === "a" ? "led led-a" : "led";
  const isWinner = winner === side;
  const accent = side === "a" ? "var(--amber)" : "var(--vu-g)";
  return (
    <div
      className="modcard p-4 relative"
      style={{
        borderLeftColor: accent,
        borderLeftWidth: 3,
        boxShadow: isWinner ? `0 0 0 1px ${accent}, 0 0 16px ${accent}40` : undefined,
      }}
    >
      {isWinner && (
        <span className="absolute -top-2 right-3 codechip" style={{ background: "var(--amber)", color: "var(--disp)", borderColor: "#C88A00" }}>
          ★ WINNER
        </span>
      )}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="led led-a" aria-hidden="true" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
        <span className="codechip">{g.code}</span>
        <span className="silk" style={{ color: "var(--mut)" }}>{g.category}</span>
      </div>
      <h4 className="mono font-semibold text-sm" style={{ color: "var(--text2)" }}>
        {g.manufacturer} {g.model}
      </h4>
      <p className="silk mt-1" style={{ color: "var(--mut)" }}>
        Rel. {g.releaseYear ?? "—"} · {g.status === "active" ? "ACTIVE" : "DISCONTINUED"}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <span className={ledCls} aria-hidden="true" />
        <span className="silk" style={{ color: g.tested ? "var(--ok)" : "var(--mut)" }}>
          {g.tested ? "TESTED" : "SPEC-ONLY"}
        </span>
        {g.ownership === "owned" && (
          <span className="silk" style={{ color: "var(--acc)" }}>· OWNED</span>
        )}
      </div>
      {avg !== null && (
        <div className="mt-3">
          <div className="flex items-baseline justify-between mb-1">
            <span className="silk" style={{ color: "var(--mut)" }}>Overall score</span>
            <span className="lcd !text-sm !bg-transparent font-semibold tabular-nums">{String(avg).padStart(3, "0")}%</span>
          </div>
          <div className="flex items-center gap-px h-2" aria-hidden="true">
            {Array.from({ length: 20 }).map((_, i) => {
              const on = i < Math.round((avg / 100) * 20);
              const cls = i < 12 ? "vu-seg-g" : i < 16 ? "vu-seg-a" : "vu-seg-r";
              return <span key={i} className={`vu-seg flex-1 ${on ? cls : ""}`} />;
            })}
          </div>
        </div>
      )}
      {avg === null && (
        <p className="lcd !text-xs !bg-transparent mt-3" style={{ color: "rgba(255,176,0,0.55)" }}>
          &gt; no test data · spec-only comparison
        </p>
      )}
    </div>
  );
}

/* ─── DJ Key/BPM Matcher (TOOL-05) ───
   Find compatible tracks by BPM + Camelot key. Enter your current
   track's BPM + key, and the tool shows which BPM ranges and keys
   will mix smoothly. Reference only — does not detect audio. */
export function KeyBpmMatcher() {
  const [bpm, setBpm] = useState("124");
  const [key, setKey] = useState("8A");
  const num = parseFloat(bpm);
  const valid = !isNaN(num) && num > 0;

  const data = useMemo(() => {
    if (!valid) return null;
    // BPM compatibility: ±6% is the industry standard for smooth beatmatching
    const minBpm = num * 0.94;
    const maxBpm = num * 1.06;
    // Half-time / double-time options
    const halfBpm = num / 2;
    const doubleBpm = num * 2;
    return { minBpm, maxBpm, halfBpm, doubleBpm };
  }, [bpm, valid]);

  // Camelot compatibility for the selected key
  const keyCompat = useMemo(() => {
    const m = key.match(/^(\d+)([AB])$/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    const letter = m[2];
    const next = ((n) % 12) + 1;
    const prev = ((n - 2 + 12) % 12) + 1;
    return {
      same: `${n}${letter}`,
      relativeUp: `${next}${letter}`,
      relativeDown: `${prev}${letter}`,
      modal: `${n}${letter === "A" ? "B" : "A"}`,
      energyBoost: `${((n + 6) % 12) + 1}${letter}`,
    };
  }, [key]);

  return (
    <RackFrame
      code="TOOL-05"
      title="Key / BPM Matcher"
      foot="Reference only. Does not detect audio. BPM ±6% is the industry standard for smooth beatmatching; half/double-time works for genre switches."
    >
      <div className="grid grid-cols-2 gap-3 mb-3">
        <label className="flex flex-col gap-1">
          <span className="silk" style={{ color: "var(--mut)" }}>BPM</span>
          <input
            type="number"
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
        <label className="flex flex-col gap-1">
          <span className="silk" style={{ color: "var(--mut)" }}>Key (Camelot)</span>
          <select
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="electronics px-3 py-2 lcd !bg-transparent !text-lg font-semibold outline-none w-full"
            style={{ color: "var(--amber)" }}
            aria-label="Camelot key"
          >
            {CAMELOT.map((c) => (
              <option key={c.code} value={c.code} style={{ background: "#0A0A0A", color: "#FFB000" }}>
                {c.code} · {c.key}
              </option>
            ))}
          </select>
        </label>
      </div>

      {data && keyCompat && (
        <LcdReadout label={`Match · ${bpm} BPM · ${key}`}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <Row k="BPM range (±6%)" v={`${data.minBpm.toFixed(1)}–${data.maxBpm.toFixed(1)}`} />
            <Row k="Half-time" v={`${data.halfBpm.toFixed(1)} BPM`} />
            <Row k="Double-time" v={`${data.doubleBpm.toFixed(1)} BPM`} />
            <Row k="Energy boost" v={`${keyCompat.energyBoost}`} />
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--disp-b)]">
            <div className="silk mb-1.5" style={{ color: "rgba(255,176,0,0.6)" }}>Harmonic matches</div>
            <ul className="space-y-1">
              <li className="flex items-baseline justify-between gap-3">
                <span style={{ color: "var(--amber)" }}>Same key · perfect</span>
                <span className="font-semibold">{keyCompat.same}</span>
              </li>
              <li className="flex items-baseline justify-between gap-3">
                <span style={{ color: "var(--amber)" }}>+1 relative</span>
                <span className="font-semibold">{keyCompat.relativeUp}</span>
              </li>
              <li className="flex items-baseline justify-between gap-3">
                <span style={{ color: "var(--amber)" }}>-1 relative</span>
                <span className="font-semibold">{keyCompat.relativeDown}</span>
              </li>
              <li className="flex items-baseline justify-between gap-3">
                <span style={{ color: "var(--amber)" }}>Modal swap</span>
                <span className="font-semibold">{keyCompat.modal}</span>
              </li>
            </ul>
          </div>
        </LcdReadout>
      )}
    </RackFrame>
  );
}

/* ─── Set Length Planner (TOOL-06) ───
   Calculate total set duration from track count + average BPM.
   Helps DJs plan set lengths for gigs (45min, 60min, 90min, 2hr). */
export function SetLengthPlanner() {
  const [tracks, setTracks] = useState("30");
  const [avgBpm, setAvgBpm] = useState("124");
  const [avgMins, setAvgMins] = useState("3.5");

  const data = useMemo(() => {
    const t = parseInt(tracks, 10);
    const bpm = parseFloat(avgBpm);
    const mins = parseFloat(avgMins);
    if (isNaN(t) || isNaN(bpm) || isNaN(mins) || t <= 0 || bpm <= 0 || mins <= 0) return null;
    const totalMins = t * mins;
    const hours = Math.floor(totalMins / 60);
    const remMins = Math.round(totalMins % 60);
    const totalBars = Math.round(t * (mins * bpm) / 4);
    const totalBeats = Math.round(t * mins * bpm);
    return {
      totalMins: totalMins.toFixed(1),
      formatted: `${hours}h ${remMins}m`,
      totalBars,
      totalBeats,
      tracksNeeded: (target: number) => Math.ceil(target / mins),
    };
  }, [tracks, avgBpm, avgMins]);

  const gigLengths = [
    { label: "45 min warmup", target: 45 },
    { label: "60 min opener", target: 60 },
    { label: "90 min set", target: 90 },
    { label: "2 hr headliner", target: 120 },
  ];

  return (
    <RackFrame
      code="TOOL-06"
      title="Set Length Planner"
      foot="Estimates based on average track length. Real sets vary with mixing style — longer transitions add ~10%."
    >
      <div className="grid grid-cols-3 gap-2 mb-3">
        <label className="flex flex-col gap-1">
          <span className="silk !text-[0.5625rem]" style={{ color: "var(--mut)" }}>TRACKS</span>
          <input
            type="number"
            min="1"
            value={tracks}
            onChange={(e) => setTracks(e.target.value)}
            className="electronics px-2 py-2 lcd !bg-transparent font-semibold tabular-nums w-full outline-none"
            style={{ color: "var(--amber)" }}
            aria-label="Number of tracks"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="silk !text-[0.5625rem]" style={{ color: "var(--mut)" }}>AVG BPM</span>
          <input
            type="number"
            min="20"
            value={avgBpm}
            onChange={(e) => setAvgBpm(e.target.value)}
            className="electronics px-2 py-2 lcd !bg-transparent font-semibold tabular-nums w-full outline-none"
            style={{ color: "var(--amber)" }}
            aria-label="Average BPM"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="silk !text-[0.5625rem]" style={{ color: "var(--mut)" }}>MIN/TRACK</span>
          <input
            type="number"
            min="1"
            step="0.5"
            value={avgMins}
            onChange={(e) => setAvgMins(e.target.value)}
            className="electronics px-2 py-2 lcd !bg-transparent font-semibold tabular-nums w-full outline-none"
            style={{ color: "var(--amber)" }}
            aria-label="Average minutes per track"
          />
        </label>
      </div>

      {data ? (
        <LcdReadout label={`Set duration · ${tracks} tracks`}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <Row k="Total duration" v={data.formatted} />
            <Row k="Total minutes" v={`${data.totalMins}m`} />
            <Row k="Total bars" v={data.totalBars.toLocaleString()} />
            <Row k="Total beats" v={data.totalBeats.toLocaleString()} />
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--disp-b)]">
            <div className="silk mb-1.5" style={{ color: "rgba(255,176,0,0.6)" }}>Tracks needed for common gig lengths</div>
            <ul className="space-y-1">
              {gigLengths.map((g) => (
                <li key={g.target} className="flex items-baseline justify-between gap-3">
                  <span style={{ color: "var(--amber)" }}>{g.label}</span>
                  <span className="font-semibold">{data.tracksNeeded(g.target)} tracks</span>
                </li>
              ))}
            </ul>
          </div>
        </LcdReadout>
      ) : (
        <LcdReadout label="Readout">
          <span style={{ color: "var(--vu-r)" }}>&gt; ERR · invalid input</span>
        </LcdReadout>
      )}
    </RackFrame>
  );
}
