# BeatGuider.com — Project Worklog

This is the shared worklog for the BeatGuider.com Next.js build. Each agent MUST read this before starting and append a new section (starting with `---`) after finishing its task.

---
Task ID: 1-13 (initial build)
Agent: main (Z.ai Code)
Task: Build the production-grade BeatGuider.com Next.js website with the PANEL design system (hardware faceplate aesthetic, NIGHT/DAY chassis + constant amber electronics), all signature components, homepage sections, a fixture specimen article, three working tool "rack units", a style-guide section, and a 404 fault report. Prepare for SEO + agent-browser self-verification + recurring QA cron.

Work Log:
- Explored existing scaffold (Next.js 16.1.3 + Turbopack, all shadcn/ui installed, dev server on port 3000).
- Wrote `src/app/globals.css` with the complete PANEL token system: NIGHT (default, attribute-less) + DAY (via `[data-mode="day"]`) + constant ELECTRONICS (#0A0A0A modules / #FFB000 amber). Added `.silk`, `.lcd`, `.brushed`, `.vents`, `.screw`, `.led`, `.led-g/-a/-r/-data`, `.led-breathe`, `.vu-seg`, `.hwbtn`, `.hwbtn-amber`, `.modcard`, `.specplate`, `.electronics`, `.codechip`, `.rocker`, `.togglesw`, `.diagchip`, scrollbars, reduced-motion, prose-panel, skip-link utilities.
- Wrote `src/app/layout.tsx` with the three panel fonts via next/font (Chakra Petch silkscreen, Inter body, IBM Plex Mono data), the < 1KB blocking no-flash theme script (sets `data-mode` only — never geometry), Organization JSON-LD, comprehensive metadata.
- Wrote `src/components/panel/theme-toggle.tsx` — `useTheme` hook + `ModeRocker` (NIGHT | DAY switch in faceplate) + `ModeIconButton` (compact NIGHT/DAY button for reader bar). Boot-flicker on LEDs, localStorage persistence.
- Wrote `src/components/panel/chrome.tsx` — `FaceplateHeader` (wordmark with amber on "GUIDER", BG-1 model tag, LED row PWR/SIG/ERR, LCD status line with real build-time data), `StickyNav` (44px targets, active-section highlight via IntersectionObserver, SEARCH button focuses search), `ReaderBar` (sticky, VU reading progress with single passive scroll listener + rAF throttle + zero-padded %, back link, code+title, theme toggle).
- Wrote `src/components/panel/components.tsx` — every signature component from §5.4: PanelButton, ModuleCard (3px left border + LED + code + chevron), TestedBadge/ResearchBadge/LongTermBadge (LEDs only lit from validated frontmatter), QuickAnswer/CautionCallout/NoteCallout, StepBlock (dark display + glowing amber step number), Checklist (toggle switches green when on + strikethrough), SpecTable (dark header + amber labels + Plex Mono cells), ComparisonTable (winner column + mini VU), VUMeter (26 segments, green→amber→red at 16/21), ScoreMeter, VerdictCard (spec plate), ProsCons, AffiliateButton (amber hwbtn + rel=sponsored nofollow noopener + click-tracking + disclosure microcopy), GearCard, SourcesList, SegmentedTabs, TOCChips, SearchModule, Figure (reserved-height photo bay preventing CLS), AdSlot (reserved-height module bay), Screws, SpecPlate, FreshnessIndicator (fresh/recheck/stale LEDs — visible freshness feature).
- Wrote `src/components/panel/tools.tsx` — three working rack-unit tools: BPM & Timing Calculator (ms from BPM, note timing, bars/beats, common delay timings), Camelot/Harmonic Mixing Calculator (compatible keys, explicit "does not detect audio key" disclaimer), Mobile DJ Power Calculator (continuous load, peak allowance, suggested generator, min breaker + CAUTION callout about inrush).
- Wrote `src/lib/content/data.ts` — typed content layer: ArticleMeta + GearEntry types, gearDb (real DDJ-FLX4 + DDJ-FLX2 entries with real specs), articles (FIX-001 fixture, GEAR-014 review, CMP-003 comparison, SW-008, LEARN-021/022, FIX-002, MOB-004), `validateContent()` build-time validation (duplicate slug/code, quickAnswer required for fix/compare, **anti-fake-testing rule**: hands-on experienceType requires non-empty tested.equipment, related-gear existence), `computeReadingTime()` (words÷200), `freshnessStatus()` (fresh/recheck/stale per content class).
- Wrote `src/components/panel/sections.tsx` — all homepage sections: FaceplateHero (Test. Fix. Mix. + VU monitor + LCD stats), IntentPaths (FIX/COMPARE/LEARN), FaultReport, TestedHardware (gear cards with VU ratings only from real test data), SoftwareLog, ToolModules (3 live tools + Gear Dueler card), LatestLog, MobileDjModule (with checklist), NewsletterCta (LCD display + client-side submit), StyleGuideSection (every component rendered in both modes — the living reference).
- Wrote `src/components/panel/specimen-article.tsx` — the FIX-001 fixture article exercising the FULL component set: reader bar, TOC diagnostic chips, spec plate (chips + byline + spec rows), QuickAnswer (from required frontmatter field), steps with LED numbers, callouts, toggle-switch checklist, spec table, comparison table with mini VU, figure with FIG-## caption, methodology (Plex Mono), verdict card with VU score meters (only from real test data), pros/cons, affiliate button, numbered sources, affiliate disclosure, related modules (manually specified → topic → shared gear entity, no generic category blocks).
- Wrote `src/components/panel/footer.tsx` — `SearchOverlay` (client-side search, ⌘K shortcut, Esc to close, indexes in-memory article list — Pagefind-compatible contract) + `SiteFooter` (vent strip, serial line BEATGUIDER BG-1 — SN YYYY-XXXX, policy links, mt-auto for sticky-bottom).
- Wrote `src/components/panel/home-page-client.tsx` — client shell holding search state + validation status line (dev surfaces anti-fake-testing rule violations as ERR LED).
- Wrote `src/app/page.tsx` — orchestrator: runs `validateContent()` at request, computes real LCD stats (entry count + last publish date), wires FaceplateHeader + StickyNav + all sections + SpecimenArticle + footer + search overlay.
- Updated `next.config.ts` — added `allowedDevOrigins` for the preview host (dev sandbox only), kept strict TS. (Removed unsupported `eslint` option — Next 16 moved lint out of next.config.)

Stage Summary:
- Design system LIVE: NIGHT default + DAY via `[data-mode="day"]` + constant amber electronics. No-flash script in <head>. Boot-flicker on mode swap. Reduced-motion honored.
- All signature components render in the style guide section — verifiable in both modes via the header rocker.
- Three interactive tools work end-to-end (BPM math verified, Camelot wheel map, Power calc with safety callouts).
- FIX-001 fixture article demonstrates every component including the reader-bar VU progress.
- Content validation is enforced (anti-fake-testing rule is structural, not editorial). The fixture FIX-001 passes; CMP-003 passes; articles with `hands-on`/`long-term-owned` all carry `tested.equipment`.
- Pending: 404 page, SEO extras (robots/sitemap/OG image generation script), README, lint pass, agent-browser end-to-end verification, 15-min recurring QA cron.
- Next.js dev server returns 200 on `/`. No compile errors. Turbopack hot-reloads cleanly.

Unresolved / Risks:
- 404 page (`src/app/not-found.tsx`) not yet written — must be the ERR-404 SIGNAL NOT FOUND fault report.
- `public/robots.txt` and `public/sitemap.xml` not yet added.
- OG image generation script (satori + resvg) not yet implemented — currently OG images would 404.
- No real original testing photos — Figures use reserved "photo bay" placeholders (honest, CLS-safe) rather than fabricated images.
- README not yet written.
- Lint not yet run — likely has unused-import warnings to clean.
- agent-browser end-to-end verification not yet performed — required before declaring done.

---
Task ID: 14 (verification + cron)
Agent: main (Z.ai Code)
Task: Lint pass, agent-browser end-to-end self-verification in both modes, README, recurring 15-min webDevReview cron job.

Work Log:
- Fixed lint: `//` literal in NoteCallout → `{"//"}`; removed unsupported `aria-pressed` on `role="tab"` (kept `aria-selected`); wrapped legitimate setState-in-effect (sync-from-DOM post-mount to avoid hydration mismatch) in `/* eslint-disable react-hooks/set-state-in-effect */` blocks in theme-toggle + footer. Lint now clean.
- agent-browser verification (DAY mode): page loads, background #E9E9E6, body text #4A4A46, Inter font loaded, no runtime errors. VLM confirmed: "brushed silver chassis, high-contrast black LCD-style data blocks, amber text highly visible, clean layout, clear typography hierarchy".
- agent-browser verification (NIGHT mode): background #0F0F0F, body text #C6C6C6. VLM confirmed: "deep near-black charcoal, amber LCD blocks provide excellent contrast, no visibility issues".
- Found + fixed a real bug: header `ModeRocker` and reader-bar `ModeIconButton` used SEPARATE `useTheme()` hook instances with independent state — clicking one didn't update the other. Refactored into a shared `ThemeProvider` Context (single source of truth) wrapping the whole app via `HomePageClient` + `NotFoundClient`. Added a `MutationObserver` so all instances re-sync if the DOM attribute changes from elsewhere. Verified: click DAY in header → DOM data-mode="day" + reader bar shows "DAY"; click reader-bar toggle → DOM data-mode="night" + header Night pressed=true. Both stay in sync.
- Verified BPM calculator: input 140 → ms/beat = 428.57 ✓ (60000/140). Camelot + Power calculators render correctly.
- Verified search (⌘K): returns FIX-001, GEAR-016, CMP-003 for "flx4" query ✓. Esc closes.
- Verified checklist toggle: clicking specimen-article toggle sets data-on="true" + green LED ✓.
- Verified 404 page: title "ERR-404 · Signal not found · BeatGuider", h1 "Signal not found", red ERR LED lit, ThemeProvider-wrapped so the rocker works ✓.
- Fixed SEO: specimen article h1 demoted to h2 (single h1 per page). Added metadata export to not-found.tsx.
- Fixed content validation: review article code changed from "GEAR-014" (collided with gear DB entry) to "GEAR-016" → validation now passes with 0 errors, status badge gone.
- Verified final state: 1 h1, 11 sections, 85 LEDs, 456 VU segments, 0 runtime errors, clean dev log (200s).
- Wrote README.md covering: architecture, design system, typography, all signature components, the three tools, content-integrity enforcement (anti-fake-testing rule), freshness-as-trust-feature, theme system, reader bar VU progress, local development, content authoring (frontmatter + testing-status LED rules + adding gear + affiliate links), Cloudflare static-export deployment, quality gates (all verified), known limitations, remaining manual configuration.
- Created recurring cron job (job_id 403479, kind=webDevReview, every 900s / 15min, tz Europe/Tirane) — assesses project status, runs agent-browser QA in both modes, fixes bugs or proposes new requirements, mandatory "more styling detail" + "more features", updates worklog.

Stage Summary:
- BeatGuider.com is production-grade and BROWSER-VERIFIED in both NIGHT and DAY modes.
- All signature components render. All three tools work. Theme syncs. Search works. 404 works. No console errors. Lint clean. Content validation passes.
- The recurring cron will continue raising visual detail + adding functionality every 15 minutes.
- Files produced: src/app/{layout,page,not-found,globals.css}.tsx, src/components/panel/{theme-toggle,chrome,components,tools,sections,specimen-article,footer,home-page-client,not-found-client}.tsx, src/lib/content/data.ts, public/{robots.txt,sitemap.xml,favicon.svg}, README.md, worklog.md.

Unresolved / Risks for next phase:
- OG image generation script (satori + resvg → public/og/) not yet implemented — OG images 404 until wired.
- Pagefind static search not yet wired (SearchOverlay indexes in-memory list — contract is compatible, swap is one-line).
- MDX content pipeline not yet wired (fixtures live in data.ts; migration path documented).
- Static export (`output: "export"`) not yet switched on (dev sandbox needs Node runtime).
- Cloudflare `_headers` security headers + `wrangler.jsonc` not yet added.
- Gear Dueler tool currently a card placeholder — wire as a real interactive comparison tool.
- No real original testing photos — Figures use reserved "photo bay" placeholders (honest, CLS-safe).
