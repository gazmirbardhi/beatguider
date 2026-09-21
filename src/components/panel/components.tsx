"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

/* ════════════════════════════════════════════════════════════════
   BeatGuider PANEL signature components (§5.4)
   Two layers, one device:
     - chassis (mode-dependent) = wrapper surfaces, plates, buttons
     - electronics (mode-invariant) = LEDs, LCD, meters, code chips, tables
   All components are composition-friendly and accessible.
   ════════════════════════════════════════════════════════════════ */

/* ─── PanelButton — hardware button, inset shadow, pressed state, amber active ─── */
export function PanelButton({
  children,
  href,
  variant = "default",
  onClick,
  type = "button",
  className = "",
  ariaLabel,
  target,
  rel,
}: {
  children: ReactNode;
  href?: string;
  variant?: "default" | "amber";
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  ariaLabel?: string;
  target?: string;
  rel?: string;
}) {
  const cls = `hwbtn ${variant === "amber" ? "hwbtn-amber" : ""} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} aria-label={ariaLabel} target={target} rel={rel}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

/* ─── Module card: status LED + title + display code + chevron, 3px left border ─── */
export function ModuleCard({
  code,
  title,
  subtitle,
  led = "off",
  href,
  meta,
  accent = "amber",
}: {
  code?: string;
  title: string;
  subtitle?: string;
  led?: "off" | "g" | "a" | "r" | "data";
  href?: string;
  meta?: string;
  accent?: "amber" | "g" | "r" | "data";
}) {
  const ledCls =
    led === "g" ? "led led-g" : led === "a" ? "led led-a" : led === "r" ? "led led-r" : led === "data" ? "led led-data" : "led";
  const borderClr =
    accent === "g" ? "var(--ok)" : accent === "r" ? "var(--err)" : accent === "data" ? "var(--data)" : "var(--acc)";

  const content = (
    <>
      <span className="modcard-scan" aria-hidden="true" />
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          {code && <span className="codechip mb-2">{code}</span>}
          <h3
            className="font-[family-name:var(--font-chakra)] font-semibold text-base sm:text-lg leading-tight mt-1 engraved"
            style={{ color: "var(--text2)" }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1.5 text-sm" style={{ color: "var(--body)" }}>
              {subtitle}
            </p>
          )}
          {meta && (
            <p className="mt-2 silk" style={{ color: "var(--mut)" }}>
              {meta}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 pt-1">
          <span className={ledCls} aria-hidden="true" />
          {href && (
            <span style={{ color: "var(--mut)" }} aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </>
  );

  const wrapperCls = `modcard block group transition-colors ${href ? "cursor-pointer hover:bg-[var(--plate)]" : ""}`;
  const style = { borderLeftColor: borderClr };

  if (href) {
    return (
      <Link href={href} className={wrapperCls} style={style}>
        {content}
      </Link>
    );
  }
  return (
    <div className={wrapperCls} style={style}>
      {content}
    </div>
  );
}

/* ─── Badges: TestedBadge / ResearchBadge / LongTermBadge ───
   Rendered only when schema validation passes (here: when explicitly used).
   An author cannot light the Tested LED by writing it into article body —
   it is driven from validated frontmatter at the call site. */
export function TestedBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const txt = size === "sm" ? "!text-[0.5625rem]" : "!text-[0.625rem]";
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 border rounded-sm" style={{ borderColor: "var(--ok-b)", background: "rgba(51,255,102,0.06)" }}>
      <span className="led led-g" aria-hidden="true" />
      <span className={`silk ${txt}`} style={{ color: "var(--ok)" }}>Hands-on tested</span>
    </span>
  );
}
export function ResearchBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const txt = size === "sm" ? "!text-[0.5625rem]" : "!text-[0.625rem]";
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 border rounded-sm" style={{ borderColor: "rgba(53,214,196,0.4)", background: "rgba(53,214,196,0.06)" }}>
      <span className="led led-data" aria-hidden="true" />
      <span className={`silk ${txt}`} style={{ color: "var(--data)" }}>Research-based</span>
    </span>
  );
}
export function LongTermBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const txt = size === "sm" ? "!text-[0.5625rem]" : "!text-[0.625rem]";
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 border rounded-sm" style={{ borderColor: "var(--acc-b)", background: "var(--acc-soft)" }}>
      <span className="led led-a" aria-hidden="true" />
      <span className={`silk ${txt}`} style={{ color: "var(--acc)" }}>Long-term owned</span>
    </span>
  );
}

/* ─── Callouts ───
   >> QUICK ANSWER (amber) · !! CAUTION (red) · // NOTE (green) */
export function QuickAnswer({ children }: { children: ReactNode }) {
  return (
    <aside
      className="electronics !block p-4 sm:p-5 my-6 relative"
      style={{ borderLeft: "3px solid var(--amber)" }}
      aria-label="Quick answer"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-[family-name:var(--font-chakra)] font-bold text-xs tracking-widest" style={{ color: "var(--amber)" }}>
          &gt;&gt; QUICK ANSWER
        </span>
        <span className="led led-a" aria-hidden="true" />
      </div>
      <div className="lcd !text-sm sm:!text-base !bg-transparent leading-relaxed" style={{ color: "var(--amber)" }}>
        {children}
      </div>
    </aside>
  );
}

export function CautionCallout({ title = "Caution", children }: { title?: string; children: ReactNode }) {
  return (
    <aside
      className="my-6 p-4 sm:p-5 border-l-[3px] relative"
      style={{ borderColor: "var(--err)", background: "rgba(255,68,68,0.06)" }}
      aria-label="Caution"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-[family-name:var(--font-chakra)] font-bold text-xs tracking-widest" style={{ color: "var(--err)" }}>
          !! {title.toUpperCase()}
        </span>
        <span className="led led-r" aria-hidden="true" />
      </div>
      <div className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--body)" }}>
        {children}
      </div>
    </aside>
  );
}

export function NoteCallout({ title = "Note", children }: { title?: string; children: ReactNode }) {
  return (
    <aside
      className="my-6 p-4 sm:p-5 border-l-[3px] relative"
      style={{ borderColor: "var(--ok)", background: "rgba(51,255,102,0.05)" }}
      aria-label="Note"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-[family-name:var(--font-chakra)] font-bold text-xs tracking-widest" style={{ color: "var(--ok)" }}>
          {"//"} {title.toUpperCase()}
        </span>
        <span className="led led-g" aria-hidden="true" />
      </div>
      <div className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--body)" }}>
        {children}
      </div>
    </aside>
  );
}

/* ─── Step block: dark display module with glowing amber step number ─── */
export function StepBlock({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="electronics my-5 overflow-hidden">
      <div className="flex items-stretch">
        <div
          className="flex items-center justify-center px-4 sm:px-5 flex-shrink-0"
          style={{ borderRight: "1px solid var(--disp-b)", background: "linear-gradient(180deg, #111, var(--disp))" }}
        >
          <span
            className="font-[family-name:var(--font-chakra)] font-bold text-2xl sm:text-3xl"
            style={{ color: "var(--amber)", textShadow: "0 0 12px rgba(255,176,0,0.7)" }}
          >
            {String(n).padStart(2, "0")}
          </span>
        </div>
        <div className="flex-1 p-4 sm:p-5 min-w-0">
          <h4
            className="font-[family-name:var(--font-chakra)] font-semibold text-sm sm:text-base mb-2"
            style={{ color: "var(--amber)" }}
          >
            {title}
          </h4>
          <div className="lcd !text-sm !bg-transparent leading-relaxed" style={{ color: "var(--amber)" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Checklist: physical toggle switch, green when on, strikes text ─── */
export function Checklist({ items: initial }: { items: { id: string; text: string }[] }) {
  const [state, setState] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setState((s) => ({ ...s, [id]: !s[id] }));

  return (
    <ul className="my-5 space-y-1.5">
      {initial.map((it) => {
        const on = !!state[it.id];
        return (
          <li
            key={it.id}
            className="flex items-center gap-3 p-2.5 border rounded-sm"
            style={{ borderColor: "var(--line)", background: "var(--plate)" }}
          >
            <button
              type="button"
              className="togglesw"
              data-on={on}
              aria-pressed={on}
              aria-label={`${on ? "Mark incomplete" : "Mark complete"}: ${it.text}`}
              onClick={() => toggle(it.id)}
            />
            <span
              className={`text-sm flex-1 ${on ? "line-through" : ""}`}
              style={{ color: on ? "var(--mut)" : "var(--body)" }}
            >
              {it.text}
            </span>
            {on && <span className="led led-g" aria-hidden="true" />}
          </li>
        );
      })}
    </ul>
  );
}

/* ─── Spec table: dark header row, amber column labels, Plex Mono cells ─── */
export function SpecTable({
  rows,
  caption,
}: {
  rows: { label: string; value: ReactNode; mono?: boolean }[];
  caption?: string;
}) {
  return (
    <div className="electronics my-5 overflow-hidden">
      {caption && (
        <div className="px-4 py-2 border-b border-[var(--disp-b)] flex items-center gap-2" style={{ background: "#060606" }}>
          <span className="led led-a" aria-hidden="true" />
          <span className="silk" style={{ color: "var(--amber)" }}>{caption}</span>
        </div>
      )}
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.label}
              className={i > 0 ? "border-t border-[var(--disp-b)]" : ""}
            >
              <th
                scope="row"
                className="text-left align-top px-3 sm:px-4 py-2 w-[42%] silk"
                style={{ color: "var(--amber)" }}
              >
                {r.label}
              </th>
              <td
                className={`px-3 sm:px-4 py-2 ${r.mono === false ? "" : "mono"}`}
                style={{ color: "var(--amber)" }}
              >
                {r.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Comparison table: spec table + winner column (amber border, mini VU) ─── */
export function ComparisonTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; winner?: boolean };
  rows: { label: string; cells: Record<string, { value: ReactNode; winner?: boolean; score?: number }> }[];
}) {
  return (
    <div className="electronics my-5 overflow-x-auto scroll-x">
      <table className="w-full text-sm min-w-[520px]">
        <thead>
          <tr style={{ background: "#060606" }}>
            <th className="text-left px-3 sm:px-4 py-2 silk" style={{ color: "var(--amber)" }}>
              SPEC
            </th>
            {columns.map((c) => (
              <th
                key={c.key}
                className="text-left px-3 sm:px-4 py-2 silk"
                style={{
                  color: "var(--amber)",
                  borderLeft: c.winner ? "3px solid var(--amber)" : "1px solid var(--disp-b)",
                }}
              >
                <span className="flex items-center gap-1.5">
                  {c.winner && <span className="led led-a" aria-hidden="true" />}
                  {c.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} className={i > 0 ? "border-t border-[var(--disp-b)]" : ""}>
              <th scope="row" className="text-left align-top px-3 sm:px-4 py-2 silk" style={{ color: "var(--amber)" }}>
                {r.label}
              </th>
              {columns.map((c) => {
                const cell = r.cells[c.key];
                if (!cell) return <td key={c.key} className="px-3 sm:px-4 py-2 mono" style={{ color: "var(--amber)" }}>—</td>;
                return (
                  <td
                    key={c.key}
                    className="px-3 sm:px-4 py-2 mono align-top"
                    style={{
                      color: "var(--amber)",
                      borderLeft: cell.winner ? "3px solid var(--amber)" : "1px solid var(--disp-b)",
                      background: cell.winner ? "rgba(255,176,0,0.08)" : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{cell.value}</span>
                      {cell.winner && <span className="led led-a" aria-hidden="true" />}
                    </div>
                    {typeof cell.score === "number" && (
                      <div className="flex items-center gap-px mt-1.5 w-24" aria-hidden="true">
                        {Array.from({ length: 12 }).map((_, j) => {
                          const on = j < Math.round((cell.score! / 100) * 12);
                          const cls = j < 8 ? "vu-seg-g" : j < 10 ? "vu-seg-a" : "vu-seg-r";
                          return <span key={j} className={`vu-seg h-1.5 ${on ? cls : ""}`} />;
                        })}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── VU meter: 26 segments, green→amber→red at 16/21 ─── */
export function VUMeter({
  value,
  segments = 26,
  showDigits = true,
  size = "md",
}: {
  value: number; // 0..100
  segments?: number;
  showDigits?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const v = Math.max(0, Math.min(100, value));
  const lit = Math.round((v / 100) * segments);
  const h = size === "sm" ? "h-2" : size === "lg" ? "h-4" : "h-3";
  return (
    <div className="electronics electronics-deep p-3 sm:p-4 my-4">
      <div className="flex items-end gap-3">
        <div className="flex items-center gap-px flex-1 vu-needle-host" aria-hidden="true">
          {Array.from({ length: segments }).map((_, i) => {
            const on = i < lit;
            const cls = i < 16 ? "vu-seg-g" : i < 21 ? "vu-seg-a" : "vu-seg-r";
            return <span key={i} className={`vu-seg ${h} ${on ? cls : ""}`} />;
          })}
          {/* analog needle overlay — points to the current level */}
          <span
            className="vu-needle"
            style={{ left: `${(lit / segments) * 100}%` }}
          />
        </div>
        {showDigits && (
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="silk !text-[0.5625rem]" style={{ color: "rgba(255,176,0,0.55)" }}>LEVEL</span>
            <span className="lcd lcd-ghost !text-lg !bg-transparent font-semibold tabular-nums">
              {String(Math.round(v)).padStart(3, "0")}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Score meter: VU + digital % readout. Only for genuinely tested ratings ─── */
export function ScoreMeter({
  label,
  value,
  max = 100,
  unit = "%",
}: {
  label: string;
  value: number;
  max?: number;
  unit?: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-4 my-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="silk truncate" style={{ color: "var(--mut)" }}>{label}</span>
          <span className="lcd lcd-ghost !text-sm !bg-transparent font-semibold tabular-nums">
            {String(pct).padStart(3, "0")}{unit}
          </span>
        </div>
        <div className="flex items-center gap-px h-2.5" aria-hidden="true">
          {Array.from({ length: 26 }).map((_, i) => {
            const on = i < Math.round((pct / 100) * 26);
            const cls = i < 16 ? "vu-seg-g" : i < 21 ? "vu-seg-a" : "vu-seg-r";
            return <span key={i} className={`vu-seg ${on ? cls : ""}`} />;
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Verdict card: spec plate — title + meta chips + labeled spec rows ─── */
export function VerdictCard({
  title,
  meta,
  rows,
  score,
}: {
  title: string;
  meta: string[];
  rows: { label: string; value: ReactNode }[];
  score?: { label: string; value: number; max?: number; unit?: string }[];
}) {
  return (
    <div className="specplate brushed vent-grille p-5 sm:p-6 my-6 relative">
      <Screws />
      <div className="flex items-center gap-2 mb-3">
        <span className="led led-a" aria-hidden="true" />
        <span className="silk-lg" style={{ color: "var(--acc)" }}>Verdict</span>
      </div>
      <h3 className="font-[family-name:var(--font-chakra)] font-bold text-xl sm:text-2xl mb-3" style={{ color: "var(--text2)" }}>
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {meta.map((m) => (
          <span key={m} className="codechip">{m}</span>
        ))}
      </div>
      {score && score.length > 0 && (
        <div className="mb-4">
          {score.map((s) => (
            <ScoreMeter key={s.label} {...s} />
          ))}
        </div>
      )}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3 py-1 border-b border-[var(--line)]">
            <dt className="silk flex-shrink-0" style={{ color: "var(--mut)" }}>{r.label}</dt>
            <dd className="mono text-sm text-right" style={{ color: "var(--text2)" }}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ─── Pros/Cons: green/red LED lists ─── */
export function ProsCons({
  pros,
  cons,
}: {
  pros: string[];
  cons: string[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
      <div className="specplate p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="led led-g" aria-hidden="true" />
          <span className="silk-lg" style={{ color: "var(--ok)" }}>Pros</span>
        </div>
        <ul className="space-y-1.5">
          {pros.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm" style={{ color: "var(--body)" }}>
              <span className="led led-g mt-1.5" aria-hidden="true" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="specplate p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="led led-r" aria-hidden="true" />
          <span className="silk-lg" style={{ color: "var(--err)" }}>Cons</span>
        </div>
        <ul className="space-y-1.5">
          {cons.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm" style={{ color: "var(--body)" }}>
              <span className="led led-r mt-1.5" aria-hidden="true" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─── Affiliate button: amber hardware button + inline disclosure microcopy ───
   <AffiliateButton product="ddj-flx4" retailer="amazon">Check current price</AffiliateButton>
   Handles URL lookup, rel=sponsored nofollow noopener + target=_blank, click-tracking hook,
   inline disclosure microcopy. Links never hard-coded in article bodies.
   Never fabricate current prices. */
export function AffiliateButton({
  product,
  retailer,
  children,
  url,
}: {
  product: string;
  retailer: string;
  children: ReactNode;
  url: string;
}) {
  const onClick = () => {
    // minimal click-tracking hook (deferred, analytics-ready)
    try {
      const evt = { type: "affiliate_click", product, retailer, ts: Date.now() };
      const q = JSON.parse(localStorage.getItem("beatguider-events") || "[]");
      q.push(evt);
      localStorage.setItem("beatguider-events", JSON.stringify(q.slice(-50)));
    } catch {
      /* analytics never blocks the click */
    }
  };
  return (
    <span className="inline-flex flex-col gap-1 items-start my-3">
      <a
        href={url}
        target="_blank"
        rel="sponsored nofollow noopener"
        onClick={onClick}
        className="hwbtn hwbtn-amber"
        data-product={product}
        data-retailer={retailer}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {children}
        <span className="silk !text-[0.5625rem] opacity-80">{retailer.toUpperCase()}</span>
      </a>
      <span className="text-[0.6875rem]" style={{ color: "var(--mut)" }}>
        We may earn a commission — prices set by the retailer. Not a current price quote.
      </span>
    </span>
  );
}

/* ─── Gear card: LED, GEAR-### code, mono model line ─── */
export function GearCard({
  code,
  model,
  manufacturer,
  category,
  year,
  status = "active",
  rating,
  href,
  imageSlot,
}: {
  code: string;
  model: string;
  manufacturer: string;
  category: string;
  year?: number;
  status?: "active" | "discontinued";
  rating?: number;
  href?: string;
  imageSlot?: ReactNode;
}) {
  const ledCls = status === "active" ? "led led-g" : "led";
  return (
    <article className="modcard p-4" style={{ borderLeftColor: status === "active" ? "var(--ok)" : "var(--mut)" }}>
      <div className="flex items-start gap-3">
        {imageSlot && (
          <div className="electronics w-16 h-16 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {imageSlot}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="codechip">{code}</span>
            <span className="led led-g" aria-hidden="true" />
            <span className="silk" style={{ color: "var(--mut)" }}>{category}</span>
          </div>
          <h3 className="mono font-semibold text-sm" style={{ color: "var(--text2)" }}>
            {manufacturer} {model}
          </h3>
          <p className="silk mt-1" style={{ color: "var(--mut)" }}>
            {manufacturer} · {year ? `Rel. ${year}` : "Rel. N/A"} · {status === "active" ? "ACTIVE" : "DISCONTINUED"}
          </p>
          {typeof rating === "number" && (
            <div className="flex items-center gap-px mt-2 w-32" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, i) => {
                const on = i < Math.round((rating / 100) * 12);
                const cls = i < 8 ? "vu-seg-g" : i < 10 ? "vu-seg-a" : "vu-seg-r";
                return <span key={i} className={`vu-seg h-1.5 ${on ? cls : ""}`} />;
              })}
              <span className="lcd !text-[0.6875rem] !bg-transparent ml-2 font-semibold tabular-nums">
                {String(Math.round(rating)).padStart(3, "0")}
              </span>
            </div>
          )}
        </div>
      </div>
      {href && (
        <a href={href} className="silk mt-3 inline-flex items-center gap-1 hover:text-[var(--amber)]" style={{ color: "var(--mut)" }}>
          Open module
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      )}
    </article>
  );
}

/* ─── Sources: numbered Plex Mono list ─── */
export function SourcesList({ sources }: { sources: { title: string; url?: string; date?: string }[] }) {
  return (
    <ol className="my-5 space-y-2.5 mono text-sm">
      {sources.map((s, i) => (
        <li key={i} className="flex items-baseline gap-3" style={{ color: "var(--body)" }}>
          <span className="lcd !text-xs font-semibold !px-1.5 !py-0.5 flex-shrink-0">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0">
            <span style={{ color: "var(--text2)" }}>{s.title}</span>
            {s.date && <span style={{ color: "var(--mut)" }}> — {s.date}</span>}
            {s.url && (
              <>
                {" "}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--acc)" }}>
                  source ↗
                </a>
              </>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ─── Segmented tabs: segmented switch selector ─── */
export function SegmentedTabs({
  tabs,
  defaultIndex = 0,
}: {
  tabs: { label: string; content: ReactNode }[];
  defaultIndex?: number;
}) {
  const [idx, setIdx] = useState(defaultIndex);
  return (
    <div className="my-5">
      <div className="rocker inline-flex" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            aria-selected={i === idx}
            className="rocker-knob"
            onClick={() => setIdx(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-3 electronics p-4" role="tabpanel">
        <div className="lcd !text-sm !bg-transparent leading-relaxed" style={{ color: "var(--amber)" }}>
          {tabs[idx].content}
        </div>
      </div>
    </div>
  );
}

/* ─── TOC chips: diagnostic-map chips, horizontal scroll, jump to sections ───
   scroll offset 112px handled globally by html { scroll-padding-top: 112px } */
export function TOCChips({ items }: { items: { id: string; label: string; n?: string }[] }) {
  return (
    <nav aria-label="Diagnostic map" className="scroll-x -mx-4 sm:mx-0 px-4 sm:px-0 my-5">
      <ol className="flex items-center gap-2 no-scrollbar w-max pb-1">
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="diagchip">
              {it.n && <span style={{ color: "var(--vu-g)" }}>{it.n}</span>}
              {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ─── Search module: backlit display — dark input, > prompt, amber caret ─── */
export function SearchModule({
  query,
  setQuery,
  results,
  onResultClick,
  inputRef,
}: {
  query: string;
  setQuery: (v: string) => void;
  results: { code: string; title: string; href: string; led?: "g" | "a" | "r" | "data" | "off" }[];
  onResultClick?: (href: string) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <div className="electronics p-3 sm:p-4 my-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="led led-a led-breathe" aria-hidden="true" />
        <span className="silk" style={{ color: "var(--amber)" }}>Search · beatguider.com</span>
      </div>
      <label className="flex items-center gap-2 px-3 py-2 border border-[var(--disp-b)] rounded-sm" style={{ background: "#060606" }}>
        <span className="lcd !bg-transparent" style={{ color: "var(--amber)" }}>&gt;</span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ddj-flx4 · rekordbox · bpm · power"
          className="lcd !bg-transparent !text-base flex-1 outline-none placeholder:!text-[rgba(255,176,0,0.4)]"
          style={{ color: "var(--amber)" }}
          aria-label="Search BeatGuider"
        />
        <span className="lcd !bg-transparent animate-pulse" style={{ color: "var(--amber)" }}>█</span>
      </label>
      {results.length > 0 && (
        <ul className="mt-2 divide-y divide-[var(--disp-b)]">
          {results.map((r) => {
            const ledCls = r.led === "g" ? "led led-g" : r.led === "a" ? "led led-a" : r.led === "r" ? "led led-r" : r.led === "data" ? "led led-data" : "led";
            return (
              <li key={r.href}>
                <a
                  href={r.href}
                  onClick={(e) => {
                    if (onResultClick) {
                      e.preventDefault();
                      onResultClick(r.href);
                    }
                  }}
                  className="flex items-center gap-3 px-2 py-2.5 hover:bg-[#161616] transition-colors"
                >
                  <span className={ledCls} aria-hidden="true" />
                  <span className="codechip">{r.code}</span>
                  <span className="lcd !text-sm !bg-transparent flex-1 truncate" style={{ color: "var(--amber)" }}>
                    {r.title}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
      {query && results.length === 0 && (
        <p className="lcd !text-sm !bg-transparent mt-2" style={{ color: "rgba(255,176,0,0.6)" }}>
          &gt; no signal · try a different query
        </p>
      )}
    </div>
  );
}

/* ─── Figure: photo with FIG-## mono caption ───
   Reserved-height photo bay preventing CLS. */
export function Figure({
  n,
  caption,
  children,
  ratio = "16/9",
}: {
  n: number;
  caption: string;
  children?: ReactNode;
  ratio?: string;
}) {
  return (
    <figure className="my-6">
      <div
        className="relative w-full border border-[var(--line)] electronics overflow-hidden"
        style={{ aspectRatio: ratio, background: "#060606" }}
      >
        {children ?? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="silk mb-1" style={{ color: "rgba(255,176,0,0.5)" }}>Photo bay</div>
              <div className="lcd !text-xs !bg-transparent" style={{ color: "rgba(255,176,0,0.4)" }}>FIG-{String(n).padStart(2, "0")} · reserved</div>
            </div>
          </div>
        )}
        <span className="absolute top-2 left-2 codechip">FIG-{String(n).padStart(2, "0")}</span>
      </div>
      <figcaption className="mono text-xs mt-2 flex items-baseline gap-2" style={{ color: "var(--mut)" }}>
        <span style={{ color: "var(--acc)" }}>FIG-{String(n).padStart(2, "0")}</span>
        <span style={{ color: "var(--body)" }}>{caption}</span>
      </figcaption>
    </figure>
  );
}

/* ─── Ad slot: reserved-height module bay, disabled initially ─── */
export function AdSlot({ height = 120, label = "Ad slot · disabled" }: { height?: number; label?: string }) {
  return (
    <aside
      className="my-6 border border-dashed border-[var(--line2)] flex items-center justify-center relative"
      style={{ height, background: "repeating-linear-gradient(45deg, transparent, transparent 8px, var(--plate) 8px, var(--plate) 9px)" }}
      aria-label="Advertisement slot (currently disabled)"
    >
      <div className="text-center">
        <span className="silk" style={{ color: "var(--mut)" }}>{label}</span>
      </div>
      <span className="absolute top-1 left-2 codechip">AD-01</span>
    </aside>
  );
}

/* ─── Screws (decorative corner) ─── */
export function Screws({ corners = "all" }: { corners?: "all" | "top" }) {
  return (
    <>
      <span className="screw absolute top-1.5 left-1.5" aria-hidden="true" />
      <span className="screw absolute top-1.5 right-1.5" aria-hidden="true" />
      {corners === "all" && (
        <>
          <span className="screw absolute bottom-1.5 left-1.5" aria-hidden="true" />
          <span className="screw absolute bottom-1.5 right-1.5" aria-hidden="true" />
        </>
      )}
    </>
  );
}

/* ─── Spec plate (article spec plate wrapper) ─── */
export function SpecPlate({ children }: { children: ReactNode }) {
  return (
    <div className="specplate brushed vent-grille corner-brackets pcb-traces p-5 sm:p-6 my-6 relative">
      <Screws />
      {children}
    </div>
  );
}

/* ─── Stale/fresh freshness LED row (visible freshness feature) ───
   Freshness is a user-visible trust feature, not a hidden maintenance chore. */
export function FreshnessIndicator({
  status,
  recheckDate,
}: {
  status: "fresh" | "recheck" | "stale";
  recheckDate?: string;
}) {
  const map = {
    fresh: { led: "led led-g", label: "VERIFIED", color: "var(--ok)" },
    recheck: { led: "led led-a", label: "RECHECK DUE", color: "var(--acc)" },
    stale: { led: "led led-r", label: "OVERDUE", color: "var(--err)" },
  }[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 border rounded-sm" style={{ borderColor: "var(--line2)", background: "var(--bg)" }}>
      <span className={map.led} aria-hidden="true" />
      <span className="silk" style={{ color: map.color }}>{map.label}</span>
      {recheckDate && <span className="silk !text-[0.5625rem]" style={{ color: "var(--mut)" }}>· {recheckDate}</span>}
    </span>
  );
}

/* ─── Diagnostic sequence — signal-path stepper for FIX articles ───
   A horizontal flow diagram showing the diagnostic steps as a signal
   chain, like a real test-bench signal path. Each node is a dark display
   module with the step number glowing amber. Active step (click) lights
   amber + scrolls to the matching section. Reduced-motion safe. */
export function DiagnosticSequence({
  steps,
  active: activeProp,
  onSelect,
}: {
  steps: { n: number; label: string; status?: "pass" | "fail" | "pending"; target?: string }[];
  active?: number;
  onSelect?: (n: number) => void;
}) {
  const [activeState, setActiveState] = useState<number | undefined>(activeProp);
  const active = activeProp ?? activeState;

  const handleSelect = (s: { n: number; target?: string }) => {
    setActiveState(s.n);
    onSelect?.(s.n);
    // scroll to the target section if provided (TOC chip behavior)
    if (s.target) {
      const el = document.getElementById(s.target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <nav aria-label="Diagnostic sequence" className="my-6 electronics p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="led led-a led-breathe" aria-hidden="true" />
        <span className="silk" style={{ color: "var(--amber)" }}>Signal path · diagnostic sequence</span>
        <span className="ml-auto silk !text-[0.5625rem]" style={{ color: "rgba(255,176,0,0.55)" }}>
          {active ? `STEP ${String(active).padStart(2, "0")} ACTIVE` : "click to jump"}
        </span>
      </div>
      <ol className="flex items-stretch gap-1 overflow-x-auto scroll-x pb-1">
        {steps.map((s, i) => {
          const isActive = active === s.n;
          const statusLed =
            s.status === "pass" ? "led led-g" :
            s.status === "fail" ? "led led-r" :
            isActive ? "led led-a" : "led";
          return (
            <li key={s.n} className="flex items-stretch flex-shrink-0">
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-sm transition-colors text-left ${isActive ? "bg-[#161616]" : "hover:bg-[#161616]"}`}
                style={{
                  borderColor: isActive ? "var(--amber)" : "var(--disp-b)",
                  boxShadow: isActive ? "0 0 8px rgba(255,176,0,0.3)" : "none",
                }}
                aria-pressed={isActive}
                aria-label={`Step ${s.n}: ${s.label}`}
              >
                <span
                  className="font-[family-name:var(--font-chakra)] font-bold text-lg flex-shrink-0"
                  style={{
                    color: "var(--amber)",
                    textShadow: isActive ? "0 0 12px rgba(255,176,0,0.8)" : "0 0 8px rgba(255,176,0,0.6)",
                  }}
                >
                  {String(s.n).padStart(2, "0")}
                </span>
                <span className="lcd !text-xs !bg-transparent flex-1 min-w-0" style={{ color: "var(--amber)" }}>
                  {s.label}
                </span>
                <span className={statusLed} aria-hidden="true" />
              </button>
              {i < steps.length - 1 && (
                <span
                  className="flex items-center px-1 flex-shrink-0 transition-colors"
                  style={{ color: isActive ? "var(--amber)" : "var(--disp-b)" }}
                  aria-hidden="true"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8H14M14 8L10 4M14 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="lcd !text-[0.6875rem] !bg-transparent mt-2" style={{ color: "rgba(255,176,0,0.55)" }}>
        &gt; walk the chain in failure-probability order · do not skip nodes · click to jump
      </p>
    </nav>
  );
}

/* ─── Reading-time chip — auto-computed, never hand-written (spec §8) ─── */
export function ReadingTimeChip({ minutes }: { minutes: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 codechip" title={`Auto-computed: words ÷ 200`}>
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ color: "var(--amber)" }}>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4V8L10.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {minutes} min read
    </span>
  );
}

/* ─── DIP switch bank — decorative hardware switch row ───
   For spec plates and tool headers. Each switch is a small physical
   toggle rendered in CSS. Off = down, On = up (amber). */
export function DipSwitchBank({
  switches,
  labels,
}: {
  switches: boolean[];
  labels?: string[];
}) {
  return (
    <div className="inline-flex items-end gap-1 p-2 border rounded-sm" style={{ borderColor: "var(--plate-b)", background: "var(--sw-bg)" }}>
      {switches.map((on, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div
            className="w-3 h-5 border rounded-sm relative"
            style={{
              borderColor: "var(--sw-b)",
              background: "var(--sw-bg)",
            }}
            aria-hidden="true"
          >
            <div
              className="absolute left-0 right-0 w-full h-2 rounded-sm transition-all"
              style={{
                top: on ? "1px" : "11px",
                background: on ? "var(--amber)" : "var(--knob)",
                boxShadow: on ? "0 0 4px var(--amber)" : "none",
              }}
            />
          </div>
          {labels?.[i] && (
            <span className="silk !text-[0.5rem]" style={{ color: "var(--mut)" }}>{labels[i]}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── DB meter — peak-hold level meter ───
   Like a real dB meter on a mixer: gradient segments with a peak-hold
   marker line. Decorative but value-driven. */
export function DBMeter({ value = 60, peak = 75 }: { value?: number; peak?: number }) {
  const v = Math.max(0, Math.min(100, value));
  const p = Math.max(0, Math.min(100, peak));
  const lit = Math.round((v / 100) * 20);
  const peakPct = 100 - (p / 100) * 100;
  return (
    <div className="electronics p-3 my-3" aria-hidden="true">
      <div className="flex items-center gap-2 mb-2">
        <span className="led led-g" />
        <span className="silk" style={{ color: "var(--amber)" }}>LEVEL · dB</span>
        <span className="ml-auto lcd !text-xs !bg-transparent tabular-nums" style={{ color: "var(--amber)" }}>
          -{(60 - v / 100 * 60).toFixed(1)} dB
        </span>
      </div>
      <div className="relative">
        <div className="flex items-end gap-px h-6" >
          {Array.from({ length: 20 }).map((_, i) => {
            const on = i < lit;
            const cls = i < 12 ? "vu-seg-g" : i < 16 ? "vu-seg-a" : "vu-seg-r";
            return <span key={i} className={`vu-seg flex-1 ${on ? cls : ""}`} />;
          })}
        </div>
        {/* peak-hold marker */}
        <div
          className="absolute left-0 right-0 h-px"
          style={{ top: `${peakPct}%`, background: "var(--amber)", boxShadow: "0 0 4px var(--amber)" }}
        />
      </div>
      <div className="flex justify-between mt-1 silk !text-[0.5rem]" style={{ color: "rgba(255,176,0,0.5)" }}>
        <span>-60</span>
        <span>-30</span>
        <span>-12</span>
        <span>0</span>
      </div>
    </div>
  );
}

/* ─── Tape-edge label — silkscreen label etched into plate edge ───
   For spec plates. A small all-caps label that sits on the plate border
   like it was silk-screened onto the metal. */
export function TapeEdgeLabel({ children, side = "top" }: { children: ReactNode; side?: "top" | "bottom" }) {
  return (
    <span
      className="absolute silk !text-[0.5625rem] px-2 py-0.5"
      style={{
        background: "var(--plate)",
        color: "var(--mut)",
        [side === "top" ? "top" : "bottom"]: "-0.5rem",
        left: "1rem",
        letterSpacing: "0.15em",
      }}
    >
      {children}
    </span>
  );
}

/* ─── Share button — copy-to-clipboard with hardware-button styling ───
   Copies the current page URL to the clipboard. Shows a transient
   "COPIED" state with a green LED for 1.5s. Falls back to a prompt
   if the Clipboard API is unavailable. */
export function ShareButton({ label = "Share signal" }: { label?: string }) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        // fallback for older browsers
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // silent — clipboard may be blocked
    }
  };

  return (
    <button
      type="button"
      onClick={onShare}
      className="hwbtn !text-[0.6875rem] !py-1.5"
      aria-label="Copy page URL to clipboard"
    >
      <span className={`led ${copied ? "led-g" : "led-a"}`} aria-hidden="true" />
      {copied ? "COPIED" : label}
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        {copied ? (
          <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <rect x="4" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 4V2.5C6 2.224 6.224 2 6.5 2H12.5C12.776 2 13 2.224 13 2.5V11.5C13 11.776 12.776 12 12.5 12H11" stroke="currentColor" strokeWidth="1.5" />
          </>
        )}
      </svg>
    </button>
  );
}

/* ─── Lab notes strip — build-time generated methodology digest ───
   A dark LCD log strip rendering methodology + test-environment data
   as a scrolling log. Uses real content (no fabrication). For FIX
   articles it surfaces the tested.equipment + environment fields. */
export function LabNotesStrip({
  entries,
}: {
  entries: { label: string; value: string; led?: "g" | "a" | "r" | "data" }[];
}) {
  return (
    <div className="electronics p-4 my-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="led led-a led-breathe" aria-hidden="true" />
        <span className="silk" style={{ color: "var(--amber)" }}>Lab notes · test environment log</span>
        <span className="ml-auto codechip">LAB-01</span>
      </div>
      <ul className="space-y-1.5">
        {entries.map((e, i) => {
          const ledCls =
            e.led === "g" ? "led led-g" :
            e.led === "r" ? "led led-r" :
            e.led === "data" ? "led led-data" :
            "led led-a";
          return (
            <li key={i} className="flex items-baseline gap-3 lcd !text-xs !bg-transparent" style={{ color: "var(--amber)" }}>
              <span className={ledCls} aria-hidden="true" />
              <span style={{ color: "rgba(255,176,0,0.65)" }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ color: "var(--amber)" }}>{e.label}</span>
              <span className="flex-1 border-b border-dotted border-[var(--disp-b)] mx-2" style={{ borderBottomWidth: "1px" }} />
              <span className="font-semibold text-right">{e.value}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─── Error log — build-time validation results console ───
   A dark LCD console-style log of the content validation results.
   Surfaces the anti-fake-testing rule status visually: each check
   renders as a log line with a PASS/FAIL LED. For the style guide
   or a dedicated editorial-trust section. */
export function ErrorLog({
  checks,
}: {
  checks: { label: string; status: "pass" | "fail" | "warn"; detail?: string }[];
}) {
  const passCount = checks.filter((c) => c.status === "pass").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;

  return (
    <div className="electronics electronics-deep p-4 my-6">
      <div className="flex items-center gap-2 mb-3">
        <span className={`led led-a ${failCount === 0 ? "led-breathe" : ""}`} aria-hidden="true" />
        <span className="silk" style={{ color: "var(--amber)" }}>Error log · content validation</span>
        <span className="ml-auto codechip">LOG-01</span>
      </div>
      <div className="flex items-center gap-3 mb-3 text-[0.5625rem]">
        <span className="inline-flex items-center gap-1">
          <span className="led led-g" aria-hidden="true" />
          <span className="silk" style={{ color: "var(--ok)" }}>{passCount} PASS</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="led led-a" aria-hidden="true" />
          <span className="silk" style={{ color: "var(--amber)" }}>{warnCount} WARN</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="led led-r" aria-hidden="true" />
          <span className="silk" style={{ color: "var(--err)" }}>{failCount} FAIL</span>
        </span>
      </div>
      <ul className="space-y-1">
        {checks.map((c, i) => {
          const ledCls = c.status === "pass" ? "led led-g" : c.status === "fail" ? "led led-r" : "led led-a";
          const labelClr = c.status === "pass" ? "var(--ok)" : c.status === "fail" ? "var(--err)" : "var(--amber)";
          return (
            <li key={i} className="flex items-baseline gap-2 lcd !text-xs !bg-transparent" style={{ color: "var(--amber)" }}>
              <span className={ledCls} aria-hidden="true" />
              <span style={{ color: "rgba(255,176,0,0.55)" }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ color: labelClr }}>{c.status.toUpperCase()}</span>
              <span style={{ color: "var(--amber)" }}>{c.label}</span>
              {c.detail && (
                <span style={{ color: "rgba(255,176,0,0.5)" }}>— {c.detail}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
