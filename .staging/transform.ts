/*
  BeatGuider incoming-MDX transformer (STAGING → content/articles).

  Reads every .mdx file from .staging/posts/posts/, classifies it into one
  of the 6 existing BeatGuider categories, remaps the incoming frontmatter
  onto the strict ArticleMeta schema, converts the body's custom components
  (<Callout>, <TLDR>, <TermAccordion>) onto the existing PANEL MDX
  components (<Note>/<Caution>/<Section>), appends frontmatter FAQs as a
  real body section, assigns a unique display code + filename ordering
  prefix, and writes the result to content/articles/NN-slug.mdx.

  Drafts and TODO_EVIDENCE articles are NOT written to content/articles/;
  they're listed in .staging/held-for-review.md.

  Conservative by design:
    - experienceType defaults to "research-based" (no fabricated test data)
    - lastVerified is NEVER invented (only set when the source carries it)
    - quickAnswer is sourced from the article's own TLDR / quick-answer
      section / description — never written from scratch
    - unknown custom components are detected and reported (not silently
      dropped), and files with unresolved unknowns are held for review
*/

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const STAGING = join(process.cwd(), ".staging", "posts", "posts");
const OUT_DIR = join(process.cwd(), "content", "articles");
const HELD_REPORT = join(process.cwd(), ".staging", "held-for-review.md");
const IMPORT_REPORT = join(process.cwd(), ".staging", "imported.md");

/* Existing 8 article slugs + gear DB codes — must not collide. */
const EXISTING_SLUGS = new Set([
  "ddj-flx4-no-sound", "ddj-flx4-review", "ddj-flx2-vs-ddj-flx4",
  "rekordbox-export-usb", "first-30-minutes", "eq-mixing-basics",
  "rekordbox-crash-on-export", "mobile-dj-power-checklist",
]);

/* Code-prefix → category, and the next free number per prefix
   (existing: FIX-001/002, GEAR-014..018, SW-008, LEARN-021/022,
   CMP-003, MOB-004). Gear codes share namespace with gear.ts DB
   (GEAR-014..017) so article codes start at 019. */
const PREFIX_BY_CAT: Record<string, string> = {
  fix: "FIX", gear: "GEAR", software: "SW",
  learn: "LEARN", compare: "CMP", "mobile-dj": "MOB",
};
const NEXT_CODE: Record<string, number> = {
  FIX: 3, GEAR: 19, SW: 9, LEARN: 23, CMP: 4, MOB: 5,
};
const codeCounters: Record<string, number> = { ...NEXT_CODE };

type Cat = "fix" | "gear" | "software" | "learn" | "compare" | "mobile-dj";
type ContentType = "guide" | "review" | "comparison" | "roundup" | "explainer" | "business";

type HeldReason =
  | "draft:true"
  | "TODO_EVIDENCE notice"
  | "suspected duplicate (merged-notice)"
  | "unknown custom components"
  | "missing required quickAnswer source";

type ImportRow = {
  file: string;
  slug: string;
  title: string;
  category: Cat;
  contentType: ContentType;
  code: string;
  filename: string;
  needsQA: boolean;
  qaSource: string;
  notes: string[];
};
type HeldRow = { file: string; slug: string; title: string; reason: HeldReason; detail: string };

/* ─── Per-article classification table ───
   Encodes the category + contentType decision for every importable article,
   derived from slug/title/tags/schemaType. Experience type is uniformly
   "research-based" (no incoming article carries a validated test record).
   Uncertain mappings are flagged with a note for the review report. */
const CLASS: Record<string, { cat: Cat; ct: ContentType; note?: string }> = {
  "1001tracklists-crafting-perfect-dj-set": { cat: "learn", ct: "explainer" },
  "12-chatgpt-prompts-for-djs": { cat: "learn", ct: "explainer" },
  "7-ways-to-better-manage-your-dj-music-library": { cat: "learn", ct: "explainer" },
  "best-beginner-dj-speakers": { cat: "gear", ct: "roundup" },
  "best-dj-controllers-under-300": { cat: "gear", ct: "roundup" },
  "best-dj-generator": { cat: "gear", ct: "roundup", note: "could also fit mobile-dj (mobile-DJ gear)" },
  "best-dj-headphones-for-beginners": { cat: "gear", ct: "roundup" },
  "best-dj-headphones-under-100": { cat: "gear", ct: "roundup" },
  "best-dj-mixers-for-beginners": { cat: "gear", ct: "roundup" },
  "best-dj-software-2026-complete-comparison": { cat: "compare", ct: "comparison", note: "software comparison; compare category is the established home for head-to-head comparisons" },
  "best-dj-turntable-needles": { cat: "gear", ct: "roundup" },
  "best-in-ear-monitors-for-djs-2026-top-picks": { cat: "gear", ct: "roundup" },
  "best-vintage-klipsch-speakers": { cat: "gear", ct: "roundup" },
  "can-you-learn-to-dj-using-just-software": { cat: "learn", ct: "explainer" },
  "cheap-dj-controllers-for-beginners": { cat: "gear", ct: "roundup" },
  "dj-audio-troubleshooting-complete-guide": { cat: "fix", ct: "guide" },
  "dj-burnout-is-real-how-to-avoid-it-and-keep-the-passion-alive": { cat: "learn", ct: "business", note: "incoming category Career; learn/business is closest existing fit" },
  "dj-laptop-buying-guide-complete-specs-budget-recommendations": { cat: "gear", ct: "roundup" },
  "dj-mental-game-introvert-guide-showing-up-powerfully": { cat: "learn", ct: "business", note: "incoming category Mindset; learn/business is closest existing fit" },
  "dj-music-library-backup-strategies-real-djs-share-their-methods": { cat: "learn", ct: "explainer" },
  "dj-posture-lower-back-pain-prevention-gear-tips": { cat: "learn", ct: "explainer", note: "incoming category Health; learn is closest existing fit" },
  "dj-setup-for-a-small-apartment": { cat: "learn", ct: "guide" },
  "dj-social-media-strategy-complete-guide-to-instagram-content-and-growth": { cat: "learn", ct: "business" },
  "dj-stems-comparison-2025-every-platform-tested-ranked": { cat: "compare", ct: "comparison" },
  "dj-tips-for-beginners": { cat: "learn", ct: "explainer" },
  "dj-transition-techniques-drop-swap-bpm-shifts-word-play-key-shift": { cat: "learn", ct: "guide" },
  "dj-troubleshooting-guide-virtual-dj-problems-media-redundancy": { cat: "fix", ct: "guide" },
  "djing-a-to-z-complete-guide-for-beginners": { cat: "learn", ct: "explainer" },
  "do-you-need-expensive-dj-speakers-beginners-guide": { cat: "learn", ct: "explainer", note: "incoming schemaType Comparison but reads as a buying-guide explainer, not a head-to-head — uncertain" },
  "how-djs-track-business-expenses-and-taxes": { cat: "learn", ct: "business" },
  "how-much-does-it-cost-to-start-djing-2026-budget-setups-apps": { cat: "learn", ct: "explainer", note: "incoming category Gear but it's a budget/cost guide, not a product review" },
  "how-old-is-too-old-to-start-djing": { cat: "learn", ct: "business", note: "incoming category Mindset; learn/business is closest existing fit" },
  "how-to-beat-match-on-vinyl-turntables": { cat: "learn", ct: "guide" },
  "how-to-deal-with-drunk-people-as-a-dj-complete-guide": { cat: "learn", ct: "business", note: "incoming category Career; learn/business is closest existing fit" },
  "how-to-dj-for-complete-beginners": { cat: "learn", ct: "guide" },
  "how-to-dj-kids-birthday-party-complete-guide": { cat: "mobile-dj", ct: "guide", note: "event/mobile DJing; could also be learn — uncertain" },
  "how-to-dj-sober-and-still-have-a-great-set": { cat: "learn", ct: "business", note: "incoming category Mindset; learn/business is closest existing fit" },
  "how-to-dj-with-a-laptop": { cat: "learn", ct: "guide", note: "could also be software — uncertain" },
  "how-to-get-more-dj-gigs-complete-guide": { cat: "learn", ct: "business" },
  "how-to-manually-beat-match-by-ear": { cat: "learn", ct: "guide" },
  "how-to-protect-your-ears-as-a-dj-science-earplugs-tinnitus-prevention": { cat: "learn", ct: "guide", note: "suspected near-duplicate of held draft 'hearing-protection-for-djs' (titled [Merged)" },
  "how-to-read-a-crowd-as-a-dj-complete-guide": { cat: "learn", ct: "business", note: "suspected near-duplicate of held draft 'reading-the-room-dj-crowd-connection' (titled [Merged)" },
  "how-to-use-channel-faders-and-headphone-cues": { cat: "learn", ct: "guide" },
  "how-to-use-crm-templates-for-dj-contracts-brochures-proposals": { cat: "learn", ct: "business" },
  "is-the-dj-producer-model-broken-ai-ethics-and-the-future-of-dance-music": { cat: "learn", ct: "business", note: "industry commentary; could be explainer — uncertain" },
  "mixars-primo-serato-dj-controller-review": { cat: "gear", ct: "review", note: "incoming schemaType Comparison but title says Review — single-product review" },
  "numark-ns6ii-dj-controller-review": { cat: "gear", ct: "review" },
  "numark-ns7iii-detailed-review": { cat: "gear", ct: "review" },
  "numark-scratch-serato-dj-mixer-review": { cat: "gear", ct: "review" },
  "pioneer-cdj-3000-review": { cat: "gear", ct: "review" },
  "pioneer-ddj-200-beginners-setup-guide": { cat: "learn", ct: "guide", note: "product-specific setup guide; could be gear — uncertain" },
  "pioneer-ddj-flx4-hidden-features-tips-tricks-complete-guide": { cat: "gear", ct: "guide", note: "product-specific guide; could be learn — uncertain" },
  "pioneer-ddj-flx4-vs-ddj-rev1-comparison": { cat: "compare", ct: "comparison" },
  "pioneer-plx-1000-vs-stanton-st-150": { cat: "compare", ct: "comparison" },
  "pioneer-vs-denon-which-dj-console-brand-is-better-plus-xdj-az-vs-opus-quad-guide": { cat: "compare", ct: "comparison" },
  "pioneer-xdj-az-vs-opus-quad-complete-comparison-guide": { cat: "compare", ct: "comparison" },
  "rekordbox-vs-serato-for-beginners": { cat: "compare", ct: "comparison", note: "software comparison; compare category is the established home for head-to-head comparisons" },
  "reloop-spin-portable-turntable-review": { cat: "gear", ct: "review" },
  "roland-dj-707m-review": { cat: "gear", ct: "review" },
  "sennheiser-hd-58x-jubilee-review": { cat: "gear", ct: "review" },
  "sennheiser-hd58x-vs-akg-k7xx": { cat: "compare", ct: "comparison" },
  "six-essential-tips-for-building-a-successful-dj-business": { cat: "learn", ct: "business" },
  "speaker-break-in-is-real": { cat: "gear", ct: "explainer", note: "gear-concept explainer; could be learn — uncertain" },
  "stanton-st-150-turntable-review": { cat: "gear", ct: "review" },
  "technics-sl-1200-mk7-turntable-review": { cat: "gear", ct: "review" },
  "the-art-of-the-warm-up-dj-set": { cat: "learn", ct: "explainer", note: "incoming category Career; reads as technique explainer — uncertain (could be business)" },
  "ultimate-guide-to-beatmatching": { cat: "learn", ct: "guide", note: "body already has an FAQ section; frontmatter FAQs appended separately" },
  "vinyl-djing-vs-cdjs": { cat: "compare", ct: "comparison" },
  "wedding-dj-pricing-how-much-how-to-charge-and-why-prices-vary": { cat: "learn", ct: "business" },
  "why-djs-wear-headphones-on-one-ear": { cat: "learn", ct: "explainer" },
  "why-do-festival-djs-need-4-cdjs": { cat: "learn", ct: "explainer" },
  "why-wedding-djs-are-underpaid": { cat: "learn", ct: "business" },
  "wireless-dj-headphones-beat-matching-latency-test": { cat: "gear", ct: "review", note: "test-based review; could be compare — uncertain" },
  "women-djs-navigating-male-dominated-industry-guide": { cat: "learn", ct: "business", note: "incoming category Career; learn/business is closest existing fit" },
  "xmg-dj-15-review": { cat: "gear", ct: "review" },
};

/* Drafts / TODO_EVIDENCE — held for review, never imported automatically. */
const HELD_SLUGS = new Set([
  "ddj-flx4-not-connecting-to-rekordbox-fix",
  "hearing-protection-for-djs",
  "how-to-beat-match-on-any-dj-controller-or-cdj",
  "reading-the-room-dj-crowd-connection",
]);

/* ─── Body transformation ─── */

/* Escape stray { } that would start/end a JSX expression in MDX. The
   incoming bodies use no legitimate JSX braces (Step/Checklist/Section
   with {} attrs are not used), so escaping every brace is safe and
   renders as a literal {/} in prose. */
function escapeBraces(s: string): string {
  return s.replace(/(?<![a-zA-Z0-9])\{/g, "&#123;").replace(/\}/g, "&#125;");
}

/* Convert <Callout type=... title=...>BODY</Callout> → <Note>/<Caution>.
   type warning → Caution; info/tip/success → Note. Handles attributes in
   either order; title optional (component default applies). */
function convertCallouts(body: string): string {
  return body.replace(/<Callout\s+([^>]*?)>([\s\S]*?)<\/Callout>/g, (_m, attrs: string, inner: string) => {
    const typeMatch = attrs.match(/type="([^"]*)"/);
    const titleMatch = attrs.match(/title="([^"]*)"/);
    const type = typeMatch ? typeMatch[1] : "info";
    const title = titleMatch ? titleMatch[1] : null;
    const tag = type === "warning" ? "Caution" : "Note";
    const titleAttr = title ? ` title="${title}"` : "";
    return `<${tag}${titleAttr}>\n\n${inner.trim()}\n\n</${tag}>`;
  });
}

/* Convert <TLDR>BODY</TLDR> → <Note title="TL;DR">BODY</Note>. */
function convertTlrs(body: string): string {
  return body.replace(/<TLDR>([\s\S]*?)<\/TLDR>/g, (_m, inner: string) =>
    `<Note title="TL;DR">\n\n${inner.trim()}\n\n</Note>`
  );
}

/* Convert <Warning title="T">BODY</Warning> → <Caution title="T">BODY</Caution>.
   Warning is the same semantic as a Caution callout. Title optional. */
function convertWarnings(body: string): string {
  return body.replace(/<Warning\s+([^>]*?)>([\s\S]*?)<\/Warning>/g, (_m, attrs: string, inner: string) => {
    const titleMatch = attrs.match(/title="([^"]*)"/);
    const titleAttr = titleMatch ? ` title="${titleMatch[1]}"` : "";
    return `<Caution${titleAttr}>\n\n${inner.trim()}\n\n</Caution>`;
  });
}

/* Convert <ProTip title="T">BODY</ProTip> → <Note title="T">BODY</Note>.
   ProTip is the same semantic as a Note callout. Title optional. */
function convertProTips(body: string): string {
  return body.replace(/<ProTip\s+([^>]*?)>([\s\S]*?)<\/ProTip>/g, (_m, attrs: string, inner: string) => {
    const titleMatch = attrs.match(/title="([^"]*)"/);
    const titleAttr = titleMatch ? ` title="${titleMatch[1]}"` : "";
    return `<Note${titleAttr}>\n\n${inner.trim()}\n\n</Note>`;
  });
}

/* Convert <ToolBanner toolId=.. title="T" description="D" /> (self-closing)
   → <Note title="T">D — [Gear Dueler](/tools)</Note>. The Gear Dueler at
   /tools is BeatGuider's real equivalent of the source's gear-comparison
   banner. Only the article's own title/description text is used. */
function convertToolBanner(body: string): string {
  return body.replace(/<ToolBanner\s+([^>]*?)\/>/g, (_m, attrs: string) => {
    const titleMatch = attrs.match(/title="([^"]*)"/);
    const descMatch = attrs.match(/description="([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : "Compare gear side by side";
    const desc = descMatch ? descMatch[1] : "";
    return `<Note title="${title}">\n\n${desc} — [Gear Dueler](/tools)\n\n</Note>`;
  });
}

/* Remove self-closing PDF-template markers (<BusinessPlanPdfTemplate /> and
   <CrmPdfTemplate />). These are site-feature placeholders with NO prose
   content of their own — removing them loses no article text. The two
   affected articles are flagged in the report. */
function removePdfTemplateMarkers(body: string): { body: string; removed: string[] } {
  const removed: string[] = [];
  const out = body
    .replace(/<BusinessPlanPdfTemplate\s*\/>/g, () => { removed.push("BusinessPlanPdfTemplate"); return ""; })
    .replace(/<CrmPdfTemplate\s*\/>/g, () => { removed.push("CrmPdfTemplate"); return ""; });
  return { body: out, removed };
}

/* Convert <TermAccordion terms={[{term,definition},...]}> → a markdown
   glossary section. Only used by best-dj-mixers-for-beginners. */
function convertTermAccordion(body: string): { body: string; glossary: string | null } {
  const m = body.match(/<TermAccordion\s+terms=\{\[([\s\S]*?)\]\}\s*\/?>/);
  if (!m) return { body, glossary: null };
  const raw = m[1];
  const items = [...raw.matchAll(/\{\s*term:\s*"([^"]*)"\s*,\s*definition:\s*"((?:[^"\\]|\\.)*)"\s*\}/g)]
    .map((mm) => ({ term: mm[1], def: mm[2].replace(/\\"/g, '"') }));
  const glossary = `<Section id="glossary" title="Glossary" />\n\n` +
    items.map((it) => `**${it.term}**\n${it.def}`).join("\n\n");
  return { body: body.replace(m[0], ""), glossary };
}

/* Flatten a TLDR block to a plain paragraph for use as quickAnswer. */
function flattenTldr(tldr: string): string {
  return tldr
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/^\s*#{1,6}\s*/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
}

/* Extract a quickAnswer from the body (TLDR / quick-answer / bottom-line
   section) or fall back to the description (honest reuse of existing
   content). Returns { text, source }. */
function extractQuickAnswer(
  body: string,
  description: string
): { text: string; source: string } {
  const tldr = body.match(/<TLDR>([\s\S]*?)<\/TLDR>/);
  if (tldr) {
    const flat = flattenTldr(tldr[1]);
    if (flat.length > 20) return { text: flat, source: "TLDR block" };
  }
  // a heading-based quick answer / bottom line / verdict
  const headingRe = /^#{2,3}\s+(?:Quick answer|Quick Answer|Bottom line|The bottom line|Verdict|Summary|TL;DR)\s*$/im;
  const m = body.match(headingRe);
  if (m && m.index !== undefined) {
    const after = body.slice(m.index! + m[0].length).trim();
    const para = after.split(/\n\s*\n/)[0]?.trim();
    if (para && para.length > 20) {
      return { text: para.replace(/\*\*/g, "").slice(0, 400), source: "summary heading" };
    }
  }
  // fallback: reuse the description (already present in the article)
  return { text: description, source: "description (reused)" };
}

/* Build the FAQ body section from frontmatter faqs, if any. */
function buildFaqSection(faqs: unknown): string {
  if (!Array.isArray(faqs) || faqs.length === 0) return "";
  const lines: string[] = ['<Section id="faq" title="Frequently asked questions" />', ""];
  for (const f of faqs) {
    if (f && typeof f === "object" && "question" in f && "answer" in f) {
      const q = String((f as Record<string, unknown>).question).trim();
      const a = String((f as Record<string, unknown>).answer).trim();
      lines.push(`#### ${q}`, "", a, "");
    }
  }
  return lines.join("\n");
}

/* Strip a leading markdown H1 (title duplicate — the layout renders the
   title from frontmatter). Only strips if it's the very first content. */
function stripLeadingH1(body: string): string {
  return body.replace(/^\s*#\s+.+\n+/, "");
}

/* Detect any remaining unknown capitalized JSX components after
   conversion (anything other than the known PANEL set). */
const KNOWN_COMPONENTS = new Set(["Section", "Step", "StepList", "Note", "Caution", "Checklist"]);
function findUnknownComponents(body: string): string[] {
  const tags = new Set<string>();
  for (const m of body.matchAll(/<([A-Z][A-Za-z]+)/g)) {
    if (!KNOWN_COMPONENTS.has(m[1])) tags.add(m[1]);
  }
  return [...tags];
}

/* ─── Frontmatter building ─── */
function yamlValue(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

function buildFrontmatter(meta: Record<string, unknown>): string {
  const lines: string[] = ["---"];
  const order = [
    "code", "slug", "title", "description", "category", "topic", "tags",
    "publishedDate", "updatedDate", "lastVerified", "author", "contentType",
    "experienceType", "ownershipStatus", "tested", "quickAnswer", "verdict",
    "difficulty", "estimatedTime", "relatedArticles", "relatedGear",
    "sources", "affiliateEligible",
  ];
  for (const k of order) {
    if (!(k in meta) || meta[k] === undefined) continue;
    const v = meta[k];
    if (Array.isArray(v)) {
      lines.push(`${k}:`);
      for (const item of v) {
        if (typeof item === "object" && item !== null) {
          // inline-flow object (sources rows, verdict rows)
          lines.push(`  - ${JSON.stringify(item)}`);
        } else {
          lines.push(`  - ${yamlValue(item)}`);
        }
      }
    } else if (typeof v === "object" && v !== null) {
      lines.push(`${k}: ${JSON.stringify(v)}`);
    } else {
      lines.push(`${k}: ${yamlValue(v)}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

/* ─── Main ─── */
function main() {
  const files = readdirSync(STAGING).filter((f) => f.endsWith(".mdx")).sort();
  const imported: ImportRow[] = [];
  const held: HeldRow[] = [];
  // assign filename ordering prefix 09+ in alphabetical slug order
  let fileNum = 9;

  for (const file of files) {
    const raw = readFileSync(join(STAGING, file), "utf8");
    let parsed: matter.GrayMatterFile<string>;
    try { parsed = matter(raw); }
    catch (e) {
      held.push({ file, slug: file.replace(/\.mdx$/, ""), title: "(unparseable)", reason: "unknown custom components", detail: `YAML parse error: ${e}` });
      continue;
    }
    const d = parsed.data as Record<string, unknown>;
    const slug = file.replace(/\.mdx$/, "");
    const title = String(d.title ?? slug);
    const description = String(d.description ?? "");
    const body0 = parsed.content;

    // hold drafts / TODO_EVIDENCE / merged-notice drafts
    if (HELD_SLUGS.has(slug)) {
      const reasons: string[] = [];
      if (d.draft === true) reasons.push("draft:true");
      if (/TODO_EVIDENCE|owner test required|do not publish yet/i.test(body0)) reasons.push("TODO_EVIDENCE notice");
      if (/merged/i.test(title)) reasons.push("suspected duplicate (merged-notice)");
      held.push({
        file, slug, title,
        reason: (reasons[0] as HeldReason) ?? "draft:true",
        detail: reasons.join("; ") || "held per classification (suspected duplicate of an existing/imported article)",
      });
      continue;
    }

    const cls = CLASS[slug];
    if (!cls) {
      held.push({ file, slug, title, reason: "unknown custom components", detail: "no classification entry — needs manual category decision" });
      continue;
    }

    // collision guard
    if (EXISTING_SLUGS.has(slug)) {
      held.push({ file, slug, title, reason: "suspected duplicate (merged-notice)", detail: "slug collides with an existing BeatGuider article" });
      continue;
    }

    // --- body transformation ---
    let body = body0;
    body = stripLeadingH1(body);
    body = convertCallouts(body);
    body = convertWarnings(body);
    body = convertProTips(body);
    body = convertToolBanner(body);
    const { body: bodyNoPdf, removed: removedMarkers } = removePdfTemplateMarkers(body);
    body = bodyNoPdf;
    const { body: bodyNoAcc, glossary } = convertTermAccordion(body);
    body = bodyNoAcc;
    body = convertTlrs(body);

    const extraNotes: string[] = [];
    if (removedMarkers.length) extraNotes.push(`removed self-closing PDF-template marker(s): ${removedMarkers.join(", ")} (no prose content lost)`);
    // detect ToolBanner conversion presence for reporting
    if (/<ToolBanner/.test(body0)) extraNotes.push("converted <ToolBanner> to <Note> linking to /tools (Gear Dueler)");

    // detect unknown components AFTER conversion
    const unknown = findUnknownComponents(body);
    if (unknown.length > 0) {
      held.push({ file, slug, title, reason: "unknown custom components", detail: `unhandled components: ${unknown.join(", ")}` });
      continue;
    }

    // escape stray braces in prose (no legitimate JSX braces remain)
    body = escapeBraces(body);

    // quickAnswer
    const needsQA = (cls.ct === "guide" && cls.cat === "fix") || cls.ct === "comparison";
    let qaSource = "n/a";
    let quickAnswer: string | undefined;
    if (needsQA) {
      const qa = extractQuickAnswer(body0, description);
      quickAnswer = qa.text;
      qaSource = qa.source;
    }

    // append glossary + FAQ sections
    const faqSection = buildFaqSection(d.faqs);
    const tail: string[] = [];
    if (glossary) tail.push(glossary.trim());
    if (faqSection) tail.push(faqSection.trim());
    if (tail.length) body = `${body.trimEnd()}\n\n${tail.join("\n\n")}\n`;

    // author (object → string)
    const author = typeof d.author === "object" && d.author !== null && "name" in (d.author as object)
      ? String((d.author as { name: string }).name)
      : typeof d.author === "string" ? d.author : "BeatGuider Team";

    // topic — derive from first tag (lowercased); honest, derived value
    const tags: string[] = Array.isArray(d.tags) ? d.tags.map(String) : [];
    const topic = (tags[0] ?? slug.split("-")[0]).toLowerCase().replace(/[^a-z0-9-]/g, "");

    // dates — preserve exactly as in source
    const publishedDate = d.date ? String(d.date) : undefined;
    if (!publishedDate) {
      held.push({ file, slug, title, reason: "missing required quickAnswer source", detail: "missing publishedDate (date)" });
      continue;
    }
    const updatedDate = d.updatedAt ? String(d.updatedAt) : undefined;

    // assign code + filename
    const prefix = PREFIX_BY_CAT[cls.cat];
    const num = codeCounters[prefix]++;
    const code = `${prefix}-${String(num).padStart(3, "0")}`;
    const filename = `${String(fileNum).padStart(2, "0")}-${slug}.mdx`;
    fileNum++;

    const meta: Record<string, unknown> = {
      code, slug, title, description,
      category: cls.cat, topic, tags,
      publishedDate, author,
      contentType: cls.ct,
      experienceType: "research-based",
    };
    if (updatedDate) meta.updatedDate = updatedDate;
    if (quickAnswer) meta.quickAnswer = quickAnswer;
    // affiliateEligible: only set true for gear reviews/roundups where the
    // existing pattern sets it; leave unset otherwise (honest default).
    if (cls.cat === "gear" && (cls.ct === "review" || cls.ct === "roundup")) {
      meta.affiliateEligible = true;
    }

    const fm = buildFrontmatter(meta);
    const out = `${fm}\n\n${body}`;
    writeFileSync(join(OUT_DIR, filename), out, "utf8");

    imported.push({
      file, slug, title, category: cls.cat, contentType: cls.ct,
      code, filename, needsQA, qaSource,
      notes: [...(cls.note ? [cls.note] : []), ...extraNotes],
    });
  }

  // reports
  const heldMd = [
    "# Held for review (NOT in production article set)",
    "",
    `Generated from .staging/posts/posts — ${held.length} file(s).`,
    "These were intentionally excluded from content/articles/. Review each",
    "and either fix the blocker and re-run the transformer, or confirm it",
    "should stay excluded.",
    "",
    "| slug | reason | detail |",
    "|------|--------|--------|",
    ...held.map((h) => `| ${h.slug} | ${h.reason} | ${h.detail.replace(/\|/g, "\\|")} |`),
    "",
  ].join("\n");
  writeFileSync(HELD_REPORT, heldMd);

  const importMd = [
    "# Imported articles (added to content/articles/)",
    "",
    `${imported.length} article(s) written to content/articles/.`,
    "",
    "| code | filename | category | contentType | slug | title | QA source | notes |",
    "|------|----------|----------|-------------|------|-------|-----------|-------|",
    ...imported.map((r) =>
      `| ${r.code} | ${r.filename} | ${r.category} | ${r.contentType} | ${r.slug} | ${r.title.replace(/\|/g, "\\|").slice(0, 70)} | ${r.needsQA ? r.qaSource : "n/a"} | ${r.notes.join("; ").replace(/\|/g, "\\|")} |`
    ),
    "",
  ].join("\n");
  writeFileSync(IMPORT_REPORT, importMd);

  // console summary
  console.log(`\n=== TRANSFORM COMPLETE ===`);
  console.log(`Imported: ${imported.length}`);
  console.log(`Held:     ${held.length}`);
  console.log(`\nHeld articles:`);
  for (const h of held) console.log(`  - ${h.slug} [${h.reason}]`);
  console.log(`\nImported by category:`);
  const byCat: Record<string, number> = {};
  for (const r of imported) byCat[r.category] = (byCat[r.category] ?? 0) + 1;
  for (const [c, n] of Object.entries(byCat)) console.log(`  ${c}: ${n}`);
  console.log(`\nReports: ${IMPORT_REPORT} / ${HELD_REPORT}`);
}

main();
