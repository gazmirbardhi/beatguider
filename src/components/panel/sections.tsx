"use client";

import Link from "next/link";
import {
  ModuleCard,
  GearCard,
  TestedBadge,
  ResearchBadge,
  LongTermBadge,
  QuickAnswer,
  CautionCallout,
  NoteCallout,
  StepBlock,
  Checklist,
  SpecTable,
  ComparisonTable,
  VUMeter,
  VerdictCard,
  ProsCons,
  AffiliateButton,
  SourcesList,
  SegmentedTabs,
  TOCChips,
  SearchModule,
  Figure,
  AdSlot,
  SpecPlate,
  FreshnessIndicator,
  Screws,
  DBMeter,
  DipSwitchBank,
  TapeEdgeLabel,
  ErrorLog,
} from "./components";
import { BpmCalculator, CamelotCalculator, PowerCalculator, GearDueler } from "./tools";
import { SpectrumAnalyzer, PhaseMeter, LabActivityFeed, Knob, RivetRow } from "./decorative";
import { gearDb, articles, freshnessStatus, buildValidationChecks, type ArticleMeta } from "@/lib/content/data";

/* ════════════════════════════════════════════════════════════════
   BeatGuider homepage — panel sections (not a chronological wall).
   Each section is a module on the test bench.
   ════════════════════════════════════════════════════════════════ */

function SectionLabel({ code, title, kicker }: { code?: string; title: string; kicker?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-5 flex-wrap">
      {code && <span className="codechip">{code}</span>}
      <h2
        className="font-[family-name:var(--font-chakra)] font-semibold text-2xl sm:text-3xl"
        style={{ color: "var(--text2)" }}
      >
        {title}
      </h2>
      {kicker && <span className="silk" style={{ color: "var(--mut)" }}>— {kicker}</span>}
      <div className="flex-1 h-px ml-2" style={{ background: "var(--line)" }} />
    </div>
  );
}

function SectionFrame({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`chassis-seam py-10 sm:py-14 ${className}`} style={{ borderTop: "1px solid var(--line)" }}>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">{children}</div>
    </section>
  );
}

/* ─── 1. FACEPLATE HERO ─── */
export function FaceplateHero({ entryCount, lastPublish }: { entryCount: number; lastPublish: string }) {
  return (
    <section id="top" className="panel-surface border-b border-[var(--line)]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="led led-g" aria-hidden="true" />
              <span className="silk" style={{ color: "var(--mut)" }}>Independent DJ test bench · BG-1</span>
            </div>
            <h1
              className="font-[family-name:var(--font-chakra)] font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight"
              style={{ color: "var(--text2)" }}
            >
              Test. Fix. <span style={{ color: "var(--amber)" }}>Mix.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg max-w-[58ch]" style={{ color: "var(--body)" }}>
              BeatGuider is an independent DJ gear, software, troubleshooting and education
              publication operated by a working DJ. Hands-on equipment testing, software testing,
              troubleshooting guides, comparisons and research-based educational content — first-hand
              evidence, never fabricated reviews.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="#intent" className="hwbtn hwbtn-amber">
                <span>Choose your intent</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="#tools" className="hwbtn">
                Open tool rack
              </Link>
              <Link href="/fix/ddj-flx4-no-sound" className="hwbtn">
                See a fixture article
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <TestedBadge />
              <LongTermBadge />
              <ResearchBadge />
            </div>
          </div>

          {/* VU meter + LCD readout */}
          <div className="specplate brushed corner-brackets pcb-traces p-5 sm:p-6 relative">
            <Screws />
            <div className="flex items-center gap-2 mb-3">
              <span className="led led-a led-breathe" aria-hidden="true" />
              <span className="silk-lg" style={{ color: "var(--acc)" }}>Signal monitor</span>
              <span className="ml-auto codechip">SIG-01</span>
            </div>
            <VUMeter value={82} size="lg" />
            <div className="mt-3">
              <SpectrumAnalyzer bars={28} height={56} />
            </div>
            <PhaseMeter value={0.08} />
            <div className="grid grid-cols-3 gap-3 mt-3">
              <LcdStat label="ENTRIES" value={String(entryCount).padStart(3, "0")} />
              <LcdStat label="LAST PUB" value={lastPublish} />
              <LcdStat label="MODE" value="OK" />
            </div>
            <p className="mono text-[0.6875rem] mt-3" style={{ color: "var(--mut)" }}>
              Real build-time data. Display is mode-invariant — identical in NIGHT and DAY.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LcdStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="electronics px-2 py-1.5 text-center">
      <div className="silk !text-[0.5rem] mb-0.5" style={{ color: "rgba(255,176,0,0.55)" }}>{label}</div>
      <div className="lcd !text-sm !bg-transparent font-semibold">{value}</div>
    </div>
  );
}

/* ─── 2. INTENT PATHS ─── */
export function IntentPaths() {
  const paths = [
    {
      id: "fix",
      code: "INT-01",
      title: "Fix a problem",
      subtitle: "Methodical troubleshooting for DJ hardware and software. Diagnostics, not guesses.",
      led: "r" as const,
      accent: "r" as const,
      href: "#fault-report",
      cta: "Open fault report",
    },
    {
      id: "compare",
      code: "INT-02",
      title: "Compare gear",
      subtitle: "Where controllers, software and gear actually differ — backed by shared spec data.",
      led: "a" as const,
      accent: "amber" as const,
      href: "#tested-hardware",
      cta: "Open comparison",
    },
    {
      id: "learn",
      code: "INT-03",
      title: "Learn DJing",
      subtitle: "Practical technique guides written from a working DJ's practice room.",
      led: "g" as const,
      accent: "g" as const,
      href: "#latest",
      cta: "Open learn log",
    },
  ];
  return (
    <SectionFrame id="intent">
      <SectionLabel code="INT-00" title="Three intents" kicker="FIX · COMPARE · LEARN" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paths.map((p) => (
          <ModuleCard
            key={p.id}
            code={p.code}
            title={p.title}
            subtitle={p.subtitle}
            led={p.led}
            accent={p.accent}
            href={p.href}
            meta={p.cta}
          />
        ))}
      </div>
      {/* Lab activity ticker — real content, no fabrication */}
      <div className="mt-6">
        <LabActivityFeed />
      </div>
    </SectionFrame>
  );
}

/* ─── 3. FAULT REPORT — popular troubleshooting guides ─── */
export function FaultReport() {
  const fixes = articles.filter((a) => a.category === "fix").slice(0, 4);
  return (
    <SectionFrame id="fault-report">
      <SectionLabel code="SEC-01" title="Fault report" kicker="popular troubleshooting" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fixes.map((a) => (
          <ModuleCard
            key={a.code}
            code={a.code}
            title={a.title}
            subtitle={a.description}
            led={freshnessStatus(a) === "stale" ? "r" : "a"}
            accent="r"
            href={`/${a.category}/${a.slug}`}
            meta={`Updated ${a.updatedDate ?? a.publishedDate} · ${a.experienceType}`}
          />
        ))}
      </div>
    </SectionFrame>
  );
}

/* ─── 4. TESTED HARDWARE ─── */
export function TestedHardware() {
  const gear = gearDb;
  // Generated stylized product photos for tested gear (clearly decorative —
  // not measurements). Only tested gear gets a photo; untested gear shows
  // the reserved photo bay (honest, no fabrication).
  const photoForSlug: Record<string, string> = {
    "ddj-flx4": "/gear/ddj-flx4.png",
    "ddj-400": "/gear/ddj-400.png",
  };
  return (
    <SectionFrame id="tested-hardware">
      <SectionLabel code="SEC-02" title="Tested hardware" kicker="hands-on gear" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {gear.map((g) => (
          <GearCard
            key={g.code}
            code={g.code}
            model={g.model}
            manufacturer={g.manufacturer}
            category={g.category}
            year={g.releaseYear}
            status={g.status}
            rating={g.rating ? Math.round(g.rating.reduce((s, r) => s + r.value, 0) / g.rating.length) : undefined}
            href={`/gear/${g.slug}`}
            imageSlot={
              g.tested && photoForSlug[g.slug] ? (
                <img
                  src={photoForSlug[g.slug]}
                  alt={`${g.manufacturer} ${g.model} ${g.category.toLowerCase()} — stylized product photo`}
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  style={{ filter: "saturate(0.85) contrast(1.05)" }}
                />
              ) : undefined
            }
          />
        ))}
      </div>
      <p className="mono text-xs mt-4" style={{ color: "var(--mut)" }}>
        Active products show a green LED · discontinued gray · ratings render as VU meters and are emitted only from real test data. Tested-gear photos are stylized illustrations — not measurements.
      </p>
    </SectionFrame>
  );
}

/* ─── 5. SOFTWARE LOG ─── */
export function SoftwareLog() {
  const sw = articles.filter((a) => a.category === "software").slice(0, 3);
  return (
    <SectionFrame id="software-log">
      <SectionLabel code="SEC-03" title="Software log" kicker="software guides" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sw.map((a) => (
          <ModuleCard
            key={a.code}
            code={a.code}
            title={a.title}
            subtitle={a.description}
            led="data"
            accent="data"
            href={`/${a.category}/${a.slug}`}
            meta={a.topic}
          />
        ))}
      </div>
    </SectionFrame>
  );
}

/* ─── 6. TOOL MODULES — four tools as rack units ─── */
export function ToolModules() {
  return (
    <SectionFrame id="tools">
      <SectionLabel code="SEC-04" title="Tool modules" kicker="rack units · client-side" />
      <p className="text-sm mb-6 max-w-[68ch]" style={{ color: "var(--body)" }}>
        Each tool is a device: hardware inputs, results on a dark LCD readout in Plex Mono with amber digits.
        All static-export compatible — JavaScript loads per-route only, not globally.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BpmCalculator />
        <CamelotCalculator />
        <PowerCalculator />
      </div>
      <div className="mt-4">
        <GearDueler gear={gearDb} />
      </div>
    </SectionFrame>
  );
}

/* ─── 7. LATEST LOG ─── */
export function LatestLog() {
  const latest = [...articles].sort((a, b) => (b.publishedDate > a.publishedDate ? 1 : -1)).slice(0, 6);
  return (
    <SectionFrame id="latest">
      <SectionLabel code="SEC-05" title="Latest log" kicker="recent articles" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {latest.map((a) => (
          <ModuleCard
            key={a.code}
            code={a.code}
            title={a.title}
            subtitle={a.description}
            led={
              a.experienceType === "hands-on" || a.experienceType === "long-term-owned"
                ? "g"
                : a.experienceType === "research-based"
                ? "data"
                : "a"
            }
            accent={
              a.experienceType === "hands-on" || a.experienceType === "long-term-owned"
                ? "g"
                : a.experienceType === "research-based"
                ? "data"
                : "amber"
            }
            href={`/${a.category}/${a.slug}`}
            meta={`${a.category} · ${a.publishedDate}`}
          />
        ))}
      </div>
    </SectionFrame>
  );
}

/* ─── 8. MOBILE DJ module ─── */
export function MobileDjModule() {
  const mob = articles.filter((a) => a.category === "mobile-dj");
  return (
    <SectionFrame id="mobile-dj">
      <SectionLabel code="SEC-06" title="Mobile DJ" kicker="business · gigging" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        <div>
          <p className="text-base mb-4" style={{ color: "var(--body)" }}>
            Mobile DJ content covers the gig-day reality: power, routing, contracts, transport,
            backup rigs and the small decisions that prevent silence at 23:00 on a Saturday.
            Written from a working DJ's gig bag.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="#tools" className="hwbtn">
              Open power calculator
            </Link>
            {mob[0] && (
              <Link href={`/${mob[0].category}/${mob[0].slug}`} className="hwbtn hwbtn-amber">
                {mob[0].code} · read
              </Link>
            )}
          </div>
        </div>
        <div className="specplate brushed p-5 relative">
          <Screws />
          <div className="flex items-center gap-2 mb-3">
            <span className="led led-g" aria-hidden="true" />
            <span className="silk-lg" style={{ color: "var(--ok)" }}>Gig-day power rules</span>
          </div>
          <Checklist
            items={[
              { id: "p1", text: "Confirm dedicated circuit — no shared fridge / kettle / stage lights" },
              { id: "p2", text: "Verify RCD/GFCI protection on the outlet feeding your rig" },
              { id: "p3", text: "Measure actual draw with a clamp meter before soundcheck" },
              { id: "p4", text: "Carry 2× the cable length you think you need" },
              { id: "p5", text: "Have a battery-powered backup for the ceremony / announcements" },
            ]}
          />
        </div>
      </div>
    </SectionFrame>
  );
}

/* ─── 9. Newsletter CTA — LCD display with input ─── */
export function NewsletterCta() {
  return (
    <SectionFrame id="newsletter">
      <SectionLabel code="SEC-07" title="Field log dispatch" kicker="newsletter · no spam" />
      <div className="electronics p-5 sm:p-6 max-w-[640px]">
        <div className="flex items-center gap-2 mb-3">
          <span className="led led-a transmit-led" aria-hidden="true" />
          <span className="silk-lg" style={{ color: "var(--amber)" }}>Subscribe · field log</span>
          <span className="ml-auto codechip">SUB-01</span>
        </div>
        <p className="lcd !text-sm !bg-transparent leading-relaxed mb-3" style={{ color: "var(--amber)" }}>
          &gt; occasional dispatch with new gear tests, fix guides and the lab notes that don't make it
          into articles. No sponsored emails, no rented list. Unsubscribe any time.
        </p>
        {/* SIGNAL waveform — decorative audio-wave scope trace */}
        <div className="signal-wave w-full mb-4" aria-hidden="true" />
        <form
          className="flex flex-col sm:flex-row gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            // client-side request to a third-party service or dedicated Worker — never a reason to convert the site to SSR
            const form = e.currentTarget as HTMLFormElement;
            const input = form.querySelector("input[type=email]") as HTMLInputElement;
            if (input?.value) {
              input.value = "";
              const status = form.querySelector("[data-status]") as HTMLElement;
              if (status) status.textContent = "> acknowledged · confirmation pending";
            }
          }}
        >
          <input
            type="email"
            required
            placeholder="you@yourdomain.com"
            className="flex-1 px-3 py-2 lcd !bg-[#060606] !text-sm outline-none"
            style={{ color: "var(--amber)", border: "1px solid var(--disp-b)" }}
            aria-label="Email address"
          />
          <button type="submit" className="hwbtn hwbtn-amber justify-center">
            <span>Transmit</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
        <p data-status className="lcd !text-xs !bg-transparent mt-2" style={{ color: "rgba(255,176,0,0.55)" }}>
          &gt; awaiting input
        </p>
      </div>
    </SectionFrame>
  );
}

/* ─── 10. Style guide section — living reference ─── */
export function StyleGuideSection() {
  return (
    <SectionFrame id="style-guide">
      <SectionLabel code="SEC-08" title="Style guide" kicker="component reference · both modes" />
      <p className="text-sm mb-6 max-w-[68ch]" style={{ color: "var(--body)" }}>
        Every signature component rendered in both NIGHT and DAY modes. Toggle the chassis
        switch in the header to verify the electronics stay lit and identical.
      </p>

      {/* badges */}
      <div className="specplate brushed p-5 mb-6 relative">
        <Screws />
        <TapeEdgeLabel>SEC-A · BADGES</TapeEdgeLabel>
        <div className="silk mb-3" style={{ color: "var(--acc)" }}>Testing-status badges</div>
        <div className="flex flex-wrap gap-3">
          <TestedBadge />
          <ResearchBadge />
          <LongTermBadge />
          <FreshnessIndicator status="fresh" />
          <FreshnessIndicator status="recheck" recheckDate="2025-04" />
          <FreshnessIndicator status="stale" recheckDate="2024-09" />
        </div>
      </div>

      {/* error log — REAL build-time validation results (not hardcoded) */}
      <ErrorLog checks={buildValidationChecks(gearDb, articles)} />

      {/* decorative hardware: knobs + rivets + spectrum + DIP + DB meter */}
      <div className="specplate brushed p-5 mb-6 relative">
        <Screws />
        <div className="silk mb-4" style={{ color: "var(--acc)" }}>Decorative hardware</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <Knob value={20} label="GAIN" size={28} />
          <Knob value={55} label="MID" size={28} />
          <Knob value={80} label="HIGH" size={28} />
          <Knob value={35} label="FILTER" size={28} />
        </div>
        <RivetRow count={8} />
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SpectrumAnalyzer bars={32} height={48} label="SPECTRUM · DEMO" />
          <DBMeter value={62} peak={78} />
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <DipSwitchBank switches={[true, false, true, true, false, true]} labels={["1","2","3","4","5","6"]} />
          <span className="silk" style={{ color: "var(--mut)" }}>DIP switch bank · decorative config</span>
        </div>
      </div>

      {/* callouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-0 mb-6">
        <div>
          <QuickAnswer>
            The Quick Answer block renders the required frontmatter field — an answer-first
            summary for fix and compare articles. Required by the schema; the build fails without it.
          </QuickAnswer>
          <CautionCallout title="Caution · ratings vary">
            CAUTION callouts mark genuine safety or risk information — never used for emphasis.
          </CautionCallout>
        </div>
        <div>
          <NoteCallout title="Note · convention">
            NOTE callouts mark conventions, defaults and editorial notes the reader should know.
          </NoteCallout>
          <NoteCallout title="Note · another">
            Note text uses article body styling (Inter), not LCD styling — only the label is silkscreen.
          </NoteCallout>
        </div>
      </div>

      {/* step + checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 mb-6">
        <StepBlock n={1} title="Example step">
          Step blocks are dark display modules with glowing amber step numbers. Step copy is mono.
        </StepBlock>
        <div>
          <Checklist
            items={[
              { id: "sg1", text: "Toggle switches are green when on, strikethrough applied" },
              { id: "sg2", text: "Each toggle is keyboard operable (Space / Enter)" },
              { id: "sg3", text: "State is per-page-load — not persisted in this demo" },
            ]}
          />
        </div>
      </div>

      {/* VU meters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <VUMeter value={28} size="sm" />
        <VUMeter value={62} size="sm" />
        <VUMeter value={94} size="sm" />
      </div>

      {/* spec table + comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-6 mb-6">
        <SpecTable
          caption="Spec table · example"
          rows={[
            { label: "Manufacturer", value: "Pioneer DJ" },
            { label: "Model", value: "DDJ-FLX4" },
            { label: "Decks", value: "2" },
            { label: "Audio", value: "24-bit / 48kHz built-in" },
            { label: "Software", value: "rekordbox (Serato DJ Lite compatible)" },
          ]}
        />
        <ComparisonTable
          columns={[
            { key: "a", label: "DDJ-FLX4", winner: true },
            { key: "b", label: "DDJ-FLX2" },
          ]}
          rows={[
            { label: "Jog wheel", cells: { a: { value: "Larger, 206mm", winner: true, score: 85 }, b: { value: "Smaller, 155mm", score: 70 } } },
            { label: "Weight", cells: { a: { value: "2.1kg", score: 60 }, b: { value: "1.6kg", winner: true, score: 90 } } },
            { label: "USB", cells: { a: { value: "USB-C 2.0" }, b: { value: "USB-C 2.0" } } },
            { label: "Software", cells: { a: { value: "rekordbox", winner: true, score: 88 }, b: { value: "rekordbox", score: 88 } } },
          ]}
        />
      </div>

      {/* verdict + pros/cons */}
      <div className="mb-6">
        <VerdictCard
          title="DDJ-FLX4 — long-term verdict"
          meta={["GEAR-014", "long-term owned", "6+ months"]}
          score={[
            { label: "Build & feel", value: 78, max: 100 },
            { label: "Pad response", value: 85, max: 100 },
            { label: "Mixer ergonomics", value: 82, max: 100 },
            { label: "Software fit", value: 88, max: 100 },
            { label: "Value for money", value: 90, max: 100 },
          ]}
          rows={[
            { label: "Best for", value: "Home + small gig beginner" },
            { label: "Tested", value: "Owned · 6+ months" },
            { label: "Affiliate", value: "Eligible" },
            { label: "Last verified", value: "2025-01" },
          ]}
        />
      </div>

      <ProsCons
        pros={[
          "Genuine Pioneer jog-wheel feel",
          "Smart recomposition via CFX pad mode",
          "rekordbox hardware unlock in the box",
        ]}
        cons={[
          "No standalone mode",
          "Plastic chassis flex under pressure",
          "Single master output limits booth routing",
        ]}
      />

      {/* figure + ad slot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Figure n={1} caption="Reserved-height photo bay — original testing photo placeholder. AVIF/WebP + descriptive alt text in production." />
        <AdSlot height={180} />
      </div>

      {/* tabs */}
      <SegmentedTabs
        tabs={[
          { label: "Display", content: "Segmented tabs behave like a hardware switch selector — only one position active at a time." },
          { label: "Input", content: "Tab content renders in the dark electronics module — identical in both chassis modes." },
          { label: "Output", content: "Active tab gets the pressed rocker-knob state and an amber LED." },
        ]}
      />

      {/* sources */}
      <SourcesList
        sources={[
          { title: "Pioneer DJ DDJ-FLX4 owner's manual", url: "https://www.pioneerdj.com/", date: "2023" },
          { title: "rekordbox manual — audio settings", url: "https://rekordbox.com/", date: "2024" },
          { title: "BeatGuider lab notes — owned unit", date: "2025-01" },
        ]}
      />

      {/* affiliate */}
      <div className="specplate brushed p-5 relative">
        <Screws />
        <div className="silk mb-3" style={{ color: "var(--acc)" }}>Affiliate CTA · example</div>
        <AffiliateButton product="ddj-flx4" retailer="amazon" url="https://www.amazon.com/">
          Check current price
        </AffiliateButton>
      </div>
    </SectionFrame>
  );
}

/* ─── 11. GLOSSARY — build-time DJ term dictionary ───
   A dark LCD reference module defining common DJ terms. Educational +
   SEO-relevant. Rendered as a 2-column grid of term/definition pairs
   inside an electronics module. No fabrication — real industry terms. */
export function Glossary() {
  const terms: { term: string; def: string }[] = [
    { term: "BPM", def: "Beats per minute — the tempo of a track. House ≈ 124, techno ≈ 130, drum & bass ≈ 174." },
    { term: "Camelot key", def: "A numeric notation (1A–12B) for harmonic mixing. Adjacent numbers in the same letter mix in-key." },
    { term: "DVS", def: "Digital Vinyl System — uses timecode records/CDs to control DJ software with traditional turntables." },
    { term: "Phrase", def: "A musical section of typically 8 or 16 bars. Mixing on phrase boundaries keeps transitions musical." },
    { term: "EQ swap", def: "Gradually swapping the frequency balance (low/mid/high) between two tracks during a transition." },
    { term: "Gain staging", def: "Setting input levels at each stage of the signal chain to avoid clipping and noise." },
    { term: "Rekordbox", def: "Pioneer DJ's music management software. Exports analyzed libraries to USB for CDJ players." },
    { term: "Serato", def: "A DJ software platform (Serato DJ Pro / Lite). Popular for DVS and controller-based setups." },
    { term: "Jog wheel", def: "The spinning platter on a DJ controller or media player used for scratching and track navigation." },
    { term: "Hot cue", def: "A saved jump-point within a track. Pressing the pad jumps instantly to that position." },
    { term: "Beatgrid", def: "A visual grid overlaid on a track's waveform marking each beat. Used for sync and quantized jumping." },
    { term: "Booth output", def: "A dedicated monitor output for the DJ's headphones or booth speakers, separate from the master." },
  ];

  return (
    <SectionFrame id="glossary">
      <SectionLabel code="SEC-09" title="Glossary" kicker="DJ terms · reference" />
      <p className="text-sm mb-4 max-w-[68ch]" style={{ color: "var(--body)" }}>
        Common DJ terms defined plainly. Build-time generated — no fabrication, real industry vocabulary.
      </p>
      <div className="electronics p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="led led-a led-breathe" aria-hidden="true" />
          <span className="silk" style={{ color: "var(--amber)" }}>Reference dictionary · {terms.length} entries</span>
          <span className="ml-auto codechip">REF-01</span>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {terms.map((t) => (
            <div key={t.term} className="flex flex-col gap-0.5">
              <dt className="lcd lcd-ghost !text-sm !bg-transparent font-semibold" style={{ color: "var(--amber)" }}>
                {t.term}
              </dt>
              <dd className="text-xs leading-relaxed" style={{ color: "rgba(255,176,0,0.75)" }}>
                {t.def}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </SectionFrame>
  );
}

/* ─── 12. EQUIPMENT MATRIX — build-time gear inventory ───
   A dark LCD inventory table of all gear entries with status LEDs +
   ownership + test state + release year. Complements the Build manifest
   (which lists codes) with per-gear detail. No fabrication — reads
   from gearDb. */
export function EquipmentMatrix() {
  return (
    <SectionFrame id="equipment-matrix">
      <SectionLabel code="SEC-10" title="Equipment matrix" kicker="gear inventory · all entries" />
      <p className="text-sm mb-4 max-w-[68ch]" style={{ color: "var(--body)" }}>
        Complete gear inventory with status LEDs (green = active · gray = discontinued),
        ownership + test state. Build-time generated from the shared gear database.
      </p>
      <div className="electronics overflow-x-auto scroll-x">
        <table className="w-full text-sm min-w-[680px]">
          <thead>
            <tr style={{ background: "#060606" }}>
              <th className="text-left px-3 sm:px-4 py-2 silk" style={{ color: "var(--amber)" }}>CODE</th>
              <th className="text-left px-3 sm:px-4 py-2 silk" style={{ color: "var(--amber)" }}>MODEL</th>
              <th className="text-left px-3 sm:px-4 py-2 silk" style={{ color: "var(--amber)" }}>CATEGORY</th>
              <th className="text-left px-3 sm:px-4 py-2 silk" style={{ color: "var(--amber)" }}>YEAR</th>
              <th className="text-left px-3 sm:px-4 py-2 silk" style={{ color: "var(--amber)" }}>STATUS</th>
              <th className="text-left px-3 sm:px-4 py-2 silk" style={{ color: "var(--amber)" }}>TESTED</th>
              <th className="text-left px-3 sm:px-4 py-2 silk" style={{ color: "var(--amber)" }}>OWNED</th>
            </tr>
          </thead>
          <tbody>
            {gearDb.map((g, i) => (
              <tr key={g.code} className={i > 0 ? "border-t border-[var(--disp-b)]" : ""}>
                <td className="px-3 sm:px-4 py-2 mono" style={{ color: "var(--amber)" }}>{g.code}</td>
                <td className="px-3 sm:px-4 py-2 mono" style={{ color: "var(--amber)" }}>
                  {g.manufacturer} {g.model}
                </td>
                <td className="px-3 sm:px-4 py-2 mono" style={{ color: "var(--amber)" }}>{g.category}</td>
                <td className="px-3 sm:px-4 py-2 mono" style={{ color: "var(--amber)" }}>{g.releaseYear ?? "—"}</td>
                <td className="px-3 sm:px-4 py-2 mono">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={g.status === "active" ? "led led-g" : "led"} aria-hidden="true" />
                    <span style={{ color: g.status === "active" ? "var(--vu-g)" : "var(--mut)" }}>
                      {g.status === "active" ? "ACTIVE" : "DISC."}
                    </span>
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-2 mono">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={g.tested ? "led led-g" : "led"} aria-hidden="true" />
                    <span style={{ color: g.tested ? "var(--vu-g)" : "var(--mut)" }}>
                      {g.tested ? "TESTED" : "SPEC"}
                    </span>
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-2 mono">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={g.ownership === "owned" ? "led led-a" : g.ownership === "loaned" ? "led led-data" : "led"}
                      aria-hidden="true"
                    />
                    <span style={{ color: g.ownership === "owned" ? "var(--amber)" : g.ownership === "loaned" ? "var(--data)" : "var(--mut)" }}>
                      {g.ownership.toUpperCase()}
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mono text-xs mt-3" style={{ color: "var(--mut)" }}>
        {gearDb.length} entries · {gearDb.filter((g) => g.tested).length} tested · {gearDb.filter((g) => g.ownership === "owned").length} owned · {gearDb.filter((g) => g.status === "active").length} active
      </p>
    </SectionFrame>
  );
}
