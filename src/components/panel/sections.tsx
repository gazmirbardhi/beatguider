"use client";

import {
  ModuleCard,
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
  Figure,
  AdSlot,
  FreshnessIndicator,
  Screws,
  DBMeter,
  DipSwitchBank,
  TapeEdgeLabel,
  ErrorLog,
} from "./components";
import { SpectrumAnalyzer, Knob, RivetRow } from "./decorative";
import { gearDb, articles, freshnessStatus, buildValidationChecks } from "@/lib/content/data";

/* ════════════════════════════════════════════════════════════════
   Panel sections still in service:
   - FaultReport — popular troubleshooting guides (404 page + reference)
   - StyleGuideSection — living component reference (/style-guide)
   (The legacy homepage section set was removed — the homepage now
   renders src/components/panel/home-sections.tsx.)
   ════════════════════════════════════════════════════════════════ */

function SectionLabel({ code, title, kicker }: { code?: string; title: string; kicker?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-5 flex-wrap">
      {code && <span className="codechip">{code}</span>}
      <h2
        className="font-(family-name:--font-chakra) font-semibold text-2xl sm:text-3xl"
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

/* ─── FAULT REPORT — popular troubleshooting guides ─── */
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

/* ─── Style guide section — living reference ─── */
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
          Step blocks are dark display modules with glowing amber step numbers. Body copy is Inter for readability; labels and LCD data stay mono.
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
