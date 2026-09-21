"use client";

import Link from "next/link";
import {
  SpecPlate,
  Screws,
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
  Figure,
  AdSlot,
  TestedBadge,
  FreshnessIndicator,
  DiagnosticSequence,
  ReadingTimeChip,
  ShareButton,
  LabNotesStrip,
} from "./components";
import { ReaderBar } from "./chrome";
import { articles, gearDb, computeReadingTime } from "@/lib/content/data";

/* ════════════════════════════════════════════════════════════════
   Specimen article — the one fixture article that exercises the full
   component set (callouts, steps, checklist, spec table, quick answer,
   sources, code). For development / testing. The build never rewrites
   article content.
   ════════════════════════════════════════════════════════════════ */
export function SpecimenArticle() {
  const a = articles.find((x) => x.code === "FIX-001")!;
  const gear = gearDb.find((g) => g.code === "GEAR-014")!;

  return (
    <section id="specimen" className="border-t border-[var(--line)]">
      <ReaderBar code={a.code} title={a.title} backHref="#top" />

      <article id="specimen-article" className="mx-auto max-w-[1280px] px-4 sm:px-6 py-10 sm:py-14">
        {/* TOC diagnostic chips */}
        <TOCInline />

        {/* Spec plate */}
        <SpecPlate>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="codechip">{a.code}</span>
            <TestedBadge />
            <FreshnessIndicator status="fresh" recheckDate="2025-04" />
          </div>
          <h2
            className="font-[family-name:var(--font-chakra)] font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight mb-3"
            style={{ color: "var(--text2)" }}
          >
            {a.title}
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {a.tags.map((t) => (
              <span key={t} className="codechip">{t}</span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mono mb-5" style={{ color: "var(--mut)" }}>
            <span>By {a.author}</span>
            <span>·</span>
            <span>Published {a.publishedDate}</span>
            <span>·</span>
            <span>Updated {a.updatedDate}</span>
            <span>·</span>
            <span>Verified {a.lastVerified}</span>
            <span>·</span>
            <ReadingTimeChip minutes={computeReadingTime(820)} />
          </div>
          <SpecTable
            caption="Spec plate"
            rows={[
              { label: "Applies to", value: a.tested?.equipment?.[0] ?? "—" },
              { label: "Software", value: a.tested?.software?.join(", ") ?? "—" },
              { label: "Platforms", value: a.tested?.platforms?.join(", ") ?? "—" },
              { label: "Environment", value: a.tested?.environment ?? "—" },
              { label: "Difficulty", value: "Beginner — no special tools" },
              { label: "Time", value: "10–25 minutes" },
            ]}
          />
        </SpecPlate>

        {/* Diagnostic sequence — signal-path stepper */}
        <div className="max-w-[1280px] mx-auto">
          <DiagnosticSequence
            steps={[
              { n: 1, label: "Physical chain", status: "pending", target: "step-1" },
              { n: 2, label: "OS output device", status: "pending", target: "step-2" },
              { n: 3, label: "App routing", status: "pending", target: "step-3" },
              { n: 4, label: "Driver / firmware", status: "pending", target: "step-4" },
              { n: 5, label: "Checklist", status: "pending", target: "checklist" },
              { n: 6, label: "Specs", status: "pending", target: "spec-table" },
              { n: 7, label: "Compare", status: "pending", target: "comparison" },
              { n: 8, label: "Verdict", status: "pending", target: "ad" },
            ]}
          />
        </div>

        {/* Quick answer */}
        <div className="max-w-[68ch] mx-auto prose-panel">
          <QuickAnswer>{a.quickAnswer}</QuickAnswer>
        </div>

        {/* Body */}
        <div className="max-w-[68ch] mx-auto prose-panel">
          <h2 id="why-this-happens">Why this happens</h2>
          <p>
            The DDJ-FLX4 is a USB class-compliant audio device with a built-in 24-bit/48kHz interface.
            When it stops producing sound, the controller is almost never the failing component —
            the failure sits in the chain between the controller, the OS audio subsystem, and the
            DJ application's output routing.
          </p>
          <p>
            That ordering matters. Replacing cables first and reinstalling software second is
            backwards. The diagnostics below walk the chain in failure-probability order, so you
            eliminate the most likely cause before disturbing the rest.
          </p>

          <NoteCallout title="Note · before you start">
            Keep one known-good USB cable and one known-good pair of headphones on the bench.
            A 2-minute cable swap resolves roughly half of all reported DDJ-FLX4 audio faults.
          </NoteCallout>

          <h2 id="step-1">Step 1 — physical chain</h2>
          <StepBlock n={1} title="Verify the physical chain first">
            <p className="mb-2">Confirm, in order:</p>
            <ul className="space-y-1">
              <li>· USB-C cable is seated at both ends — try a second port directly on the computer, not a hub</li>
              <li>· Master RCA out is connected to powered speakers or an amp that is switched on</li>
              <li>· Headphone jack is firmly in the front-panel 1/4″ socket, not the cue/level crossfade</li>
              <li>· Power LED on the FLX4 is steady — not flickering (flicker = USB power negotiation failure)</li>
            </ul>
          </StepBlock>

          <CautionCallout title="Caution · powered speakers">
            Never connect or disconnect RCA cables while your monitors are powered on and the volume
            is up. The FLX4 master out is line-level — even a small pop can damage tweeters at gig volume.
            Power down the monitors before any cable change.
          </CautionCallout>

          <h2 id="step-2">Step 2 — system output device</h2>
          <StepBlock n={2} title="Check the OS audio output device">
            <p>
              On macOS, open Audio MIDI Setup and confirm <code>DDJ-FLX4</code> is selected as the
              output device, not the built-in speakers. On Windows, check Sound Settings → Playback —
              the FLX4 should be the default device, and the default format should be 2-channel
              16-bit / 44.1kHz or 48kHz.
            </p>
          </StepBlock>

          <h2 id="step-3">Step 3 — DJ app routing</h2>
          <StepBlock n={3} title="Verify the DJ app's audio routing">
            <p>
              In rekordbox: Preferences → Audio → Output Device must read <code>DDJ-FLX4</code>. If it
              reads <code>CoreAudio default</code> or <code>ASIO4ALL</code>, output is going to the wrong
              device. Master Output channel should be <code>1/2</code>, Headphones <code>3/4</code>.
            </p>
          </StepBlock>

          <h2 id="step-4">Step 4 — driver and firmware</h2>
          <StepBlock n={4} title="Rule out driver and firmware mismatch">
            <p>
              On Windows, install the Pioneer DJ Driver Utility. On macOS, no driver is needed for
              class-compliant operation, but you should confirm the FLX4 firmware is current via the
              Pioneer DJ Hardware Manager. A firmware mismatch between the controller and the bundled
              rekordbox version is a real failure mode — both should be on the matched pair listed on
              the FLX4 product page.
            </p>
          </StepBlock>

          <h2 id="checklist">Field checklist</h2>
          <Checklist
            items={[
              { id: "c1", text: "USB cable replaced with a known-good cable" },
              { id: "c2", text: "OS output device = DDJ-FLX4" },
              { id: "c3", text: "DJ app output device = DDJ-FLX4" },
              { id: "c4", text: "Master channel = 1/2, Headphones = 3/4" },
              { id: "c5", text: "Firmware current and matched to rekordbox version" },
              { id: "c6", text: "Powered monitors confirmed switched on and volume up" },
              { id: "c7", text: "Tested with a known-good audio source (a different track / different file format)" },
            ]}
          />

          <h2 id="spec-table">Gear spec reference</h2>
          <SpecTable
            caption={`Spec table · ${gear.manufacturer} ${gear.model} (${gear.code})`}
            rows={gear.majorSpecs.map((s) => ({ label: s.label, value: s.value }))}
          />

          <h2 id="comparison">If you're choosing instead of fixing</h2>
          <p>
            If the unit is confirmed faulty and you're weighing repair vs replacement, here is how the
            FLX4 sits against the smaller FLX2 in the dimensions that matter for a working DJ:
          </p>
          <ComparisonTable
            columns={[
              { key: "a", label: "DDJ-FLX4", winner: true },
              { key: "b", label: "DDJ-FLX2" },
            ]}
            rows={[
              { label: "Jog wheel", cells: { a: { value: "206mm", winner: true, score: 85 }, b: { value: "155mm", score: 70 } } },
              { label: "Weight", cells: { a: { value: "2.1kg", score: 60 }, b: { value: "1.6kg", winner: true, score: 90 } } },
              { label: "Audio", cells: { a: { value: "24-bit/48kHz" }, b: { value: "24-bit/48kHz" } } },
              { label: "Software", cells: { a: { value: "rekordbox", winner: true, score: 88 }, b: { value: "rekordbox", score: 88 } } },
            ]}
          />

          <h2 id="figure">Photo reference</h2>
          <Figure
            n={2}
            caption="Rear-panel connections of the DDJ-FLX4 (owned unit GEAR-014). Stylized illustrative photo — not a measurement. Reserved aspect ratio prevents CLS."
            ratio="16/9"
          >
            <img
              src="/articles/ddj-flx4-rear-panel.png"
              alt="Rear panel of the Pioneer DDJ-FLX4 DJ controller showing RCA outputs and USB-C port, photographed on a dark test bench surface"
              width={1344}
              height={768}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "saturate(0.9) contrast(1.05)" }}
            />
          </Figure>

          <h2 id="methodology">Methodology</h2>
          <p>
            This guide is the distillation of repeated troubleshooting across the owned DDJ-FLX4
            (GEAR-014) over six months of regular use, plus a controlled reproducibility pass on
            macOS 14 and Windows 11. The diagnostic order is not editorial convenience — it
            reflects measured failure frequency in the test bench log.
          </p>
          <p className="mono text-sm" style={{ color: "var(--mut)" }}>
            TEST ENV · {a.tested?.environment}<br />
            EQUIPMENT · {a.tested?.equipment?.join(" · ")}<br />
            SOFTWARE · {a.tested?.software?.join(" · ")}<br />
            PLATFORMS · {a.tested?.platforms?.join(" · ")}
          </p>

          {/* Lab notes strip — build-time methodology digest from validated frontmatter */}
          <LabNotesStrip
            entries={[
              { label: "Equipment under test", value: a.tested?.equipment?.[0] ?? "—", led: "g" },
              { label: "Software version", value: a.tested?.software?.join(", ") ?? "—", led: "a" },
              { label: "Platforms verified", value: a.tested?.platforms?.join(", ") ?? "—", led: "data" },
              { label: "Test environment", value: a.tested?.environment ?? "—", led: "a" },
              { label: "Last verified", value: a.lastVerified ?? a.updatedDate ?? a.publishedDate, led: "g" },
              { label: "Experience type", value: a.experienceType, led: "g" },
            ]}
          />

          <h2 id="ad">Sponsor bay</h2>
          <AdSlot height={120} label="Ad slot · disabled in initial release" />
        </div>

        {/* Verdict */}
        <div className="max-w-[860px] mx-auto">
          <div className="flex justify-end mb-2">
            <ShareButton label="Share diagnostic" />
          </div>
          <VerdictCard
            title="The FLX4 is almost certainly not broken"
            meta={["FIX-001", "diagnostic", "verified"]}
            rows={[
              { label: "Most likely cause", value: "OS / DJ app routing (≈65%)" },
              { label: "Second most likely", value: "USB cable / port (≈20%)" },
              { label: "Firmware / driver", value: "≈10%" },
              { label: "Hardware fault", value: "<5% — send to service if all else fails" },
              { label: "Time to resolve", value: "10–25 min if following the order" },
            ]}
          />
        </div>

        {/* Pros / cons of the diagnostic approach */}
        <div className="max-w-[860px] mx-auto">
          <ProsCons
            pros={[
              "Failure-probability order — fastest average resolution time",
              "No reinstall required unless every step fails",
              "Validated against real failures over six months",
            ]}
            cons={[
              "Requires one known-good USB cable on the bench",
              "Doesn't cover multi-controller setups (e.g. DVS expansion)",
              "Windows ASIO routing has additional failure modes not covered here",
            ]}
          />
        </div>

        {/* Affiliate */}
        <div className="max-w-[860px] mx-auto">
          <div className="specplate brushed p-5 relative">
            <Screws />
            <div className="silk mb-3" style={{ color: "var(--acc)" }}>If replacement is the call</div>
            <AffiliateButton product="ddj-flx4" retailer="amazon" url="https://www.amazon.com/">
              Check current price
            </AffiliateButton>
          </div>
        </div>

        {/* Sources */}
        <div className="max-w-[860px] mx-auto">
          <h2 className="font-[family-name:var(--font-chakra)] font-semibold text-xl mt-8 mb-2" style={{ color: "var(--text2)" }}>
            Sources
          </h2>
          <SourcesList sources={a.sources ?? []} />
        </div>

        {/* Disclosure */}
        <div className="max-w-[860px] mx-auto mt-8 pt-4 border-t border-[var(--line)]">
          <p className="text-xs" style={{ color: "var(--mut)" }}>
            Affiliate disclosure · BeatGuider may earn a commission on purchases made through affiliate
            links. Prices are set by the retailer and are not quoted by BeatGuider. Affiliation does not
            influence test methodology or ratings — the Tested LED is lit only from validated frontmatter.
          </p>
        </div>

        {/* Related */}
        <div className="max-w-[1280px] mx-auto mt-10">
          <h2 className="font-[family-name:var(--font-chakra)] font-semibold text-xl mb-4" style={{ color: "var(--text2)" }}>
            Related modules
          </h2>
          <p className="mono text-xs mb-4" style={{ color: "var(--mut)" }}>
            Manually specified → topic relationships → shared gear/software entity. No generic
            category-wide related blocks.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(a.relatedArticles ?? []).map((slug) => {
              const r = articles.find((x) => x.slug === slug);
              if (!r) return null;
              return (
                <Link key={r.code} href="#specimen" className="modcard group block p-4 hover:bg-[var(--plate)]" style={{ borderLeftColor: "var(--acc)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="led led-a" aria-hidden="true" />
                    <span className="codechip">{r.code}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-chakra)] font-semibold text-sm" style={{ color: "var(--text2)" }}>
                    {r.title}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "var(--body)" }}>{r.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </article>
    </section>
  );
}

function TOCInline() {
  return (
    <div className="mx-auto max-w-[1280px] mb-6">
      <nav aria-label="Diagnostic map" className="scroll-x -mx-4 sm:mx-0 px-4 sm:px-0">
        <ol className="flex items-center gap-2 no-scrollbar w-max pb-1">
          {[
            { id: "why-this-happens", label: "Why", n: "01" },
            { id: "step-1", label: "Physical", n: "02" },
            { id: "step-2", label: "OS audio", n: "03" },
            { id: "step-3", label: "App route", n: "04" },
            { id: "step-4", label: "Driver/FW", n: "05" },
            { id: "checklist", label: "Checklist", n: "06" },
            { id: "spec-table", label: "Specs", n: "07" },
            { id: "comparison", label: "Compare", n: "08" },
            { id: "figure", label: "Photo", n: "09" },
            { id: "methodology", label: "Method", n: "10" },
            { id: "ad", label: "Sponsor", n: "11" },
          ].map((it) => (
            <li key={it.id}>
              <a href={`#${it.id}`} className="diagchip">
                <span style={{ color: "var(--vu-g)" }}>{it.n}</span>
                {it.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
