/*
  Pre-deployment audit — READ-ONLY analysis of content/articles + out/.
  Produces evidence for: inventory, sitemap, canonical, OG, SEO metadata,
  H1/JSON-LD, internal links, assets, freshness, honesty flags, a11y.
  Writes nothing to the project (prints report only).
*/
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const ART_DIR = join(ROOT, "content", "articles");
const OUT = join(ROOT, "out");

type Art = {
  file: string; code: string; slug: string; title: string; description: string;
  category: string; contentType: string; experienceType: string;
  publishedDate: string; updatedDate?: string; lastVerified?: string;
  wordCount: number; readingTime: number; author: string;
};
const arts: Art[] = [];
for (const f of readdirSync(ART_DIR).filter((x) => x.endsWith(".mdx")).sort()) {
  const m = matter(readFileSync(join(ART_DIR, f), "utf8")).data as Record<string, unknown>;
  arts.push({
    file: f, code: String(m.code), slug: String(m.slug), title: String(m.title),
    description: String(m.description ?? ""), category: String(m.category),
    contentType: String(m.contentType), experienceType: String(m.experienceType),
    publishedDate: String(m.publishedDate),
    updatedDate: m.updatedDate ? String(m.updatedDate) : undefined,
    lastVerified: m.lastVerified ? String(m.lastVerified) : undefined,
    wordCount: Number(m.wordCount ?? 0), readingTime: Number(m.readingTime ?? 0),
    author: String(m.author ?? ""),
  });
}

const section = (t: string) => console.log(`\n${"═".repeat(70)}\n${t}\n${"═".repeat(70)}`);

/* ─── 1. INVENTORY ─── */
section("1. ARTICLE INVENTORY");
console.log(`published articles in content/articles/: ${arts.length}`);
const byCat: Record<string, number> = {};
arts.forEach((a) => { byCat[a.category] = (byCat[a.category] ?? 0) + 1; });
console.log("by category:", JSON.stringify(byCat));
const draftsInLive = arts.filter((a) => (a as unknown as { draft?: boolean }).draft === true);
console.log(`draft:true articles in LIVE set: ${draftsInLive.length}${draftsInLive.length ? " -> " + draftsInLive.map((d) => d.slug).join(", ") : ""}`);
// filename ↔ slug ↔ page existence
let pageMisses: string[] = [];
for (const a of arts) {
  const p1 = join(OUT, a.category, `${a.slug}.html`);
  const p2 = join(OUT, a.category, a.slug, "index.html");
  if (!existsSync(p1) && !existsSync(p2)) pageMisses.push(`/${a.category}/${a.slug}`);
}
console.log(`article pages missing in out/: ${pageMisses.length}${pageMisses.length ? " -> " + pageMisses.join(", ") : ""}`);
// duplicate slugs/codes/titles
const dupBy = (key: keyof Art) => {
  const seen = new Map<string, string[]>();
  arts.forEach((a) => { const k = String(a[key]); seen.set(k, [...(seen.get(k) ?? []), a.slug]); });
  return [...seen.entries()].filter(([, v]) => v.length > 1);
};
const dupSlugs = dupBy("slug"), dupCodes = dupBy("code");
const normTitle = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const tSeen = new Map<string, string[]>();
arts.forEach((a) => { const k = normTitle(a.title); tSeen.set(k, [...(tSeen.get(k) ?? []), a.slug]); });
const dupTitles = [...tSeen.entries()].filter(([, v]) => v.length > 1);
console.log(`duplicate slugs: ${dupSlugs.length} | duplicate codes: ${dupCodes.length} | duplicate normalized titles: ${dupTitles.length}`);
if (dupSlugs.length) console.log("  dup slugs:", JSON.stringify(dupSlugs));
if (dupCodes.length) console.log("  dup codes:", JSON.stringify(dupCodes));
if (dupTitles.length) console.log("  dup titles:", JSON.stringify(dupTitles));
// filename prefix vs slug
const badName = arts.filter((a) => {
  const m = a.file.match(/^(\d{2})-([a-z0-9-]+)\.mdx$/);
  return !m || m[2] !== a.slug;
});
console.log(`filename↔slug mismatches: ${badName.length}${badName.length ? " -> " + badName.map((b) => b.file).join(", ") : ""}`);
// ordering-prefix sequence
const nums = arts.map((a) => parseInt(a.file.slice(0, 2), 10)).sort((x, y) => x - y);
const gaps: number[] = [];
for (let i = 1; i < nums.length; i++) if (nums[i] !== nums[i - 1] + 1) gaps.push(nums[i - 1]);
console.log(`filename order prefixes: ${nums[0]}..${nums[nums.length - 1]}, gaps after: [${gaps.join(",") || "none"}]`);

/* ─── 2. SITEMAP ─── */
section("2. SITEMAP");
const sitemapXml = readFileSync(join(OUT, "sitemap.xml"), "utf8");
const smUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`sitemap URLs: ${smUrls.length}`);
const smCounts = new Map<string, number>();
smUrls.forEach((u) => smCounts.set(u, (smCounts.get(u) ?? 0) + 1));
const smDups = [...smCounts.entries()].filter(([, c]) => c > 1).map(([u]) => u);
console.log(`duplicate sitemap URLs: ${smDups.length}${smDups.length ? " -> " + smDups.join(", ") : ""}`);
const badProto = smUrls.filter((u) => !u.startsWith("https://beatguider.com/"));
console.log(`non-canonical-domain/protocol URLs: ${badProto.length}${badProto.length ? " -> " + badProto.slice(0, 5).join(", ") : ""}`);
const smLocal = smUrls.filter((u) => /localhost|127\.0\.0\.1|\.space-z|staging|preview|\.local/.test(u));
console.log(`staging/local/preview URLs in sitemap: ${smLocal.length}${smLocal.length ? " -> " + smLocal.join(", ") : ""}`);
// expected article URLs vs sitemap
const expected = new Set(arts.map((a) => `https://beatguider.com/${a.category}/${a.slug}`));
const missingFromSm = [...expected].filter((u) => !smUrls.includes(u));
const extraArticleLike = smUrls.filter((u) => /^https:\/\/beatguider\.com\/(fix|gear|software|learn|mobile-dj|compare)\//.test(u) && !expected.has(u));
console.log(`published article URLs missing from sitemap: ${missingFromSm.length}${missingFromSm.length ? " -> " + missingFromSm.join(", ") : ""}`);
console.log(`sitemap article URLs not matching a published article: ${extraArticleLike.length}${extraArticleLike.length ? " -> " + extraArticleLike.join(", ") : ""}`);
// held drafts must NOT be in sitemap
const heldSlugs = ["ddj-flx4-not-connecting-to-rekordbox-fix", "hearing-protection-for-djs", "how-to-beat-match-on-any-dj-controller-or-cdj", "reading-the-room-dj-crowd-connection"];
const draftsInSm = smUrls.filter((u) => heldSlugs.some((d) => u.includes(d)));
console.log(`held-draft URLs in sitemap: ${draftsInSm.length}${draftsInSm.length ? " -> " + draftsInSm.join(", ") : ""}`);
// style-guide / api excluded?
const excludedOk = !smUrls.some((u) => u.includes("/style-guide") || u.includes("/api"));
console.log(`style-guide and /api excluded from sitemap: ${excludedOk ? "yes" : "NO"}`);
// every sitemap URL maps to a file in out/
const smMisses: string[] = [];
for (const u of smUrls) {
  const p = u.replace("https://beatguider.com", "");
  if (p === "/") { if (!existsSync(join(OUT, "index.html"))) smMisses.push(p); continue; }
  if (!existsSync(join(OUT, `${p}.html`)) && !existsSync(join(OUT, p, "index.html")) && !existsSync(join(OUT, `${p}.xml`))) smMisses.push(p);
}
console.log(`sitemap URLs with no file in out/: ${smMisses.length}${smMisses.length ? " -> " + smMisses.join(", ") : ""}`);

/* ─── 3. ROBOTS + FEED ─── */
section("3. ROBOTS.TXT + FEED");
console.log("--- robots.txt ---");
console.log(readFileSync(join(OUT, "robots.txt"), "utf8").trim());
const feed = readFileSync(join(OUT, "feed.xml"), "utf8");
const feedItems = [...feed.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1]).filter((u) => !u.includes("beatguider.com/feed.xml"));
console.log(`\n--- feed.xml: ${feedItems.length} items, ${feed.length / 1024} KB`);
const feedBadProto = feedItems.filter((u) => !u.startsWith("https://beatguider.com/"));
console.log(`feed items with wrong domain/protocol: ${feedBadProto.length}${feedBadProto.length ? " -> " + feedBadProto.slice(0, 3).join(", ") : ""}`);
const feedMissingFile = feedItems.filter((u) => {
  const p = u.replace("https://beatguider.com", "");
  return !existsSync(join(OUT, `${p}.html`)) && !existsSync(join(OUT, p, "index.html"));
});
console.log(`feed links with no file in out/: ${feedMissingFile.length}${feedMissingFile.length ? " -> " + feedMissingFile.join(", ") : ""}`);
// feed = 20 most recent by publishedDate?
const sorted = [...arts].sort((a, b) => (a.publishedDate < b.publishedDate ? 1 : -1)).slice(0, 20).map((a) => `https://beatguider.com/${a.category}/${a.slug}`);
const feedSet = new Set(feedItems);
const feedDiff = sorted.filter((u) => !feedSet.has(u));
console.log(`feed vs top-20-by-date mismatch: ${feedDiff.length}${feedDiff.length ? " -> " + feedDiff.join(", ") : ""}`);

/* ─── 4. CANONICAL + OG/TWITTER + JSON-LD on article pages ─── */
section("4. CANONICAL / OG / JSON-LD (article pages)");
let canonBad: string[] = [], ogImgMissing: string[] = [], noJsonLd: string[] = [], h1Bad: string[] = [], noindex: string[] = [];
let noDesc: string[] = [];
for (const a of arts) {
  const hp = join(OUT, a.category, `${a.slug}.html`);
  if (!existsSync(hp)) continue;
  const html = readFileSync(hp, "utf8");
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/);
  const want = `https://beatguider.com/${a.category}/${a.slug}`;
  if (!canon || canon[1] !== want) canonBad.push(`${a.slug}: canonical=${canon?.[1] ?? "MISSING"} want=${want}`);
  const og = html.match(/property="og:image" content="([^"]+)"/);
  const ogPath = og ? og[1].replace("https://beatguider.com", "") : "";
  if (!og || !existsSync(join(OUT, ogPath.replace(/^\//, "")))) ogImgMissing.push(`${a.slug}: og:image=${og?.[1] ?? "MISSING"}`);
  if (!html.includes('"@type":"TechArticle"') && !html.includes('"@type": "TechArticle"')) noJsonLd.push(a.slug);
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) h1Bad.push(`${a.slug}: ${h1s} h1 tags`);
  if (html.includes('name="robots" content="noindex')) noindex.push(a.slug);
  const md = html.match(/<meta name="description" content="([^"]*)"/);
  if (!md || md[1].trim().length < 20) noDesc.push(a.slug);
}
console.log(`canonical issues: ${canonBad.length}${canonBad.length ? "\n  " + canonBad.slice(0, 5).join("\n  ") : ""}`);
console.log(`og:image missing/unresolvable: ${ogImgMissing.length}${ogImgMissing.length ? "\n  " + ogImgMissing.join("\n  ") : ""}`);
console.log(`TechArticle JSON-LD missing: ${noJsonLd.length}${noJsonLd.length ? " -> " + noJsonLd.join(", ") : ""}`);
console.log(`pages without exactly one H1: ${h1Bad.length}${h1Bad.length ? "\n  " + h1Bad.join("\n  ") : ""}`);
console.log(`noindex pages: ${noindex.length}${noindex.length ? " -> " + noindex.join(", ") : ""}`);
console.log(`missing/short meta description: ${noDesc.length}${noDesc.length ? " -> " + noDesc.join(", ") : ""}`);

/* ─── 5. TITLE/DESCRIPTION QUALITY ─── */
section("5. TITLE + META DESCRIPTION QUALITY");
const longTitles = arts.filter((a) => a.title.length > 70).map((a) => `${a.title.length} ${a.slug}`);
const shortTitles = arts.filter((a) => a.title.length < 25).map((a) => `${a.title.length} ${a.slug}`);
console.log(`titles > 70 chars: ${longTitles.length}${longTitles.length ? "\n  " + longTitles.join("\n  ") : ""}`);
console.log(`titles < 25 chars: ${shortTitles.length}${shortTitles.length ? " -> " + shortTitles.join(", ") : ""}`);
const longDesc = arts.filter((a) => a.description.length > 175).map((a) => `${a.description.length} ${a.slug}`);
const shortDesc = arts.filter((a) => a.description.length < 70).map((a) => `${a.description.length} ${a.slug}`);
console.log(`descriptions > 175 chars: ${longDesc.length}${longDesc.length ? "\n  " + longDesc.join("\n  ") : ""}`);
console.log(`descriptions < 70 chars: ${shortDesc.length}${shortDesc.length ? " -> " + shortDesc.join(", ") : ""}`);
// quick keyword-stuffing heuristic: same word 4+ times in title
const stuffed = arts.filter((a) => {
  const words = a.title.toLowerCase().match(/[a-z]+/g) ?? [];
  const counts: Record<string, number> = {};
  words.forEach((w) => { if (w.length > 3) counts[w] = (counts[w] ?? 0) + 1; });
  return Object.values(counts).some((c) => c >= 4);
}).map((a) => a.slug);
console.log(`possible keyword-stuffed titles (word 4+ times): ${stuffed.length}${stuffed.length ? " -> " + stuffed.join(", ") : ""}`);
// title vs H1 (page h1 text) consistency — sample first 5
console.log("\ntitle vs page H1 (first 5):");
for (const a of arts.slice(0, 5)) {
  const html = readFileSync(join(OUT, a.category, `${a.slug}.html`), "utf8");
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, "").trim();
  console.log(`  ${a.slug}: h1="${h1?.slice(0, 60)}" fm-title="${a.title.slice(0, 60)}"`);
}

/* ─── 6. INTERNAL LINKS + ASSETS (all pages) ─── */
section("6. INTERNAL LINKS + ASSETS (all out/ pages)");
type LinkIssue = { page: string; href: string };
const brokenLinks: LinkIssue[] = [];
const missingImgs: LinkIssue[] = [];
const extLinks = new Set<string>();
const htmlFiles: string[] = [];
const walk = (d: string) => {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith(".html")) htmlFiles.push(p);
  }
};
walk(OUT);
console.log(`HTML files scanned: ${htmlFiles.length}`);
for (const hp of htmlFiles) {
  const rel = hp.replace(OUT, "").replace(/^\//, "");
  const html = readFileSync(hp, "utf8");
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("#")) { if (href.startsWith("http")) extLinks.add(href); continue; }
    if (href.startsWith("/_next/")) continue;
    let target = href.split("#")[0].split("?")[0];
    if (target === "" || target === "/") { if (!existsSync(join(OUT, "index.html"))) brokenLinks.push({ page: rel, href }); continue; }
    const candidates = [join(OUT, target), join(OUT, `${target}.html`), join(OUT, target, "index.html")];
    if (!candidates.some((c) => existsSync(c))) brokenLinks.push({ page: rel, href });
  }
  for (const m of html.matchAll(/(?:src|content)="(\/[^"]+\.(?:png|jpg|jpeg|svg|webp|avif|ico))"/g)) {
    const src = m[1];
    if (src.startsWith("/_next/")) {
      if (!existsSync(join(OUT, src.replace(/^\//, "")))) missingImgs.push({ page: rel, href: src });
      continue;
    }
    if (!existsSync(join(OUT, src.replace(/^\//, "")))) missingImgs.push({ page: rel, href: src });
  }
}
const byPage: Record<string, LinkIssue[]> = {};
brokenLinks.forEach((l) => { (byPage[l.href] ??= []).push(l); });
console.log(`BROKEN internal links (unique targets): ${Object.keys(byPage).length}`);
Object.entries(byPage).slice(0, 15).forEach(([href, pages]) =>
  console.log(`  ${href}  <- referenced by ${pages.length} page(s), e.g. ${pages[0].page}`));
console.log(`missing image/asset files: ${missingImgs.length}${missingImgs.length ? "\n  " + missingImgs.slice(0, 10).map((m) => `${m.page}: ${m.href}`).join("\n  ") : ""}`);
console.log(`external links referenced (count, not checked): ${extLinks.size}`);

/* ─── 7. FRESHNESS + HONESTY ─── */
section("7. FRESHNESS + HONESTY");
const now = new Date("2026-11-20T00:00:00Z");
const monthsSince = (d: string) => (now.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24 * 30);
const fw: Record<string, { fresh: number; recheck: number; stale: number }> = {
  guide_fix: { fresh: 4, recheck: 8, stale: 12 }, comparison: { fresh: 6, recheck: 10, stale: 14 },
  review: { fresh: 8, recheck: 12, stale: 18 }, explainer: { fresh: 12, recheck: 18, stale: 24 },
  business: { fresh: 12, recheck: 18, stale: 24 }, roundup: { fresh: 8, recheck: 12, stale: 18 },
};
const freshCount = { fresh: 0, recheck: 0, stale: 0 };
const staleList: string[] = [];
for (const a of arts) {
  const last = a.lastVerified ?? a.updatedDate ?? a.publishedDate;
  const ms = monthsSince(last);
  const key = a.contentType === "comparison" ? "comparison" : a.contentType === "review" || a.contentType === "roundup" ? "review" : a.contentType === "explainer" || a.contentType === "business" ? "explainer" : "guide_fix";
  const w = fw[key];
  const st = ms <= w.fresh ? "fresh" : ms <= w.recheck ? "recheck" : "stale";
  freshCount[st]++;
  if (st === "stale") staleList.push(`${a.slug} (${last}, ${Math.round(ms)}mo)`);
}
console.log(`freshness distribution (as of 2026-11-20): fresh=${freshCount.fresh} recheck=${freshCount.recheck} stale=${freshCount.stale}`);
if (staleList.length) console.log(`stale articles:\n  ${staleList.join("\n  ")}`);
// honesty: titles claiming tested/ranked vs research-based experienceType
const testedClaims = arts.filter((a) => /\b(tested|we tested|i tested|our test)\b/i.test(a.title) && a.experienceType === "research-based");
console.log(`\nresearch-based articles with "tested" claims in TITLE: ${testedClaims.length}`);
testedClaims.forEach((a) => console.log(`  [${a.code}] ${a.title}`));
// lastVerified claims
const withLv = arts.filter((a) => a.lastVerified);
console.log(`\narticles carrying lastVerified: ${withLv.length} -> ${withLv.map((a) => `${a.slug}=${a.lastVerified}`).join(", ")}`);
// TODO/placeholder scan in live bodies
const todoHits: string[] = [];
for (const f of readdirSync(ART_DIR).filter((x) => x.endsWith(".mdx"))) {
  const raw = readFileSync(join(ART_DIR, f), "utf8");
  if (/TODO_EVIDENCE|owner test required|do not publish yet|PLACEHOLDER|Lorem ipsum|TBD\b/i.test(raw)) todoHits.push(f);
}
console.log(`TODO/placeholder markers in LIVE articles: ${todoHits.length}${todoHits.length ? " -> " + todoHits.join(", ") : ""}`);
// word count distribution
const thin = arts.filter((a) => a.wordCount < 300).map((a) => `${a.slug}=${a.wordCount}w`);
console.log(`articles under 300 words: ${thin.length}${thin.length ? " -> " + thin.join(", ") : ""}`);

/* ─── 8. ACCESSIBILITY QUICK SCAN (article pages) ─── */
section("8. ACCESSIBILITY QUICK SCAN");
let noAlt = 0, altTotal = 0, skipLink = 0, langOk = 0, checked = 0;
let headingIssues: string[] = [];
for (const a of arts) {
  const hp = join(OUT, a.category, `${a.slug}.html`);
  if (!existsSync(hp)) continue;
  checked++;
  const html = readFileSync(hp, "utf8");
  for (const m of html.matchAll(/<img\s([^>]*)>/g)) {
    altTotal++;
    if (!/alt="/.test(m[1])) noAlt++;
  }
  if (/skip-to-content|SKIP TO CONTENT/i.test(html)) skipLink++;
  if (/<html[^>]*lang="en"/.test(html)) langOk++;
  // heading order in <main>: h1 → h2 → h3 (no skips like h1→h3)
  const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? html;
  const hs = [...main.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  let prev = 0;
  for (const h of hs) {
    if (prev && h > prev + 1) { headingIssues.push(`${a.slug}: h${prev}→h${h}`); break; }
    prev = h;
  }
}
console.log(`article pages checked: ${checked}`);
console.log(`<img> tags: ${altTotal}, missing alt: ${noAlt}`);
console.log(`pages with skip-to-content link: ${skipLink}/${checked}`);
console.log(`pages with lang="en": ${langOk}/${checked}`);
console.log(`heading-level skips (e.g. h2→h4): ${headingIssues.length}${headingIssues.length ? "\n  " + headingIssues.slice(0, 12).join("\n  ") : ""}`);
// viewport meta
const idx = readFileSync(join(OUT, "index.html"), "utf8");
console.log(`viewport meta on home: ${/name="viewport"/.test(idx) ? "present" : "MISSING"}`);

/* ─── 9. CATEGORY-INDEX LINKAGE ─── */
section("9. CATEGORY INDEX LINKAGE");
for (const cat of ["fix", "gear", "software", "learn", "mobile-dj", "compare"]) {
  const ip = join(OUT, `${cat}.html`);
  if (!existsSync(ip)) { console.log(`${cat}: INDEX PAGE MISSING`); continue; }
  const html = readFileSync(ip, "utf8");
  const expectedArts = arts.filter((a) => a.category === cat);
  const linked = expectedArts.filter((a) => html.includes(`href="/${cat}/${a.slug}"`));
  console.log(`${cat}: index lists ${linked.length}/${expectedArts.length} category articles${linked.length < expectedArts.length ? "  MISSING: " + expectedArts.filter((a) => !linked.includes(a)).map((a) => a.slug).join(", ") : ""}`);
}
// homepage latest section
const home = readFileSync(join(OUT, "index.html"), "utf8");
const latestSorted = [...arts].sort((a, b) => (a.publishedDate < b.publishedDate ? 1 : -1)).slice(0, 6);
const latestOk = latestSorted.every((a) => home.includes(`href="/${a.category}/${a.slug}"`));
console.log(`homepage latest section contains 6 newest articles: ${latestOk ? "yes" : "NO"}`);
// related articles: how many articles define relatedArticles
const withRelated = arts.filter((a) => {
  const raw = matter(readFileSync(join(ART_DIR, a.file), "utf8")).data as Record<string, unknown>;
  return Array.isArray(raw.relatedArticles) && (raw.relatedArticles as unknown[]).length > 0;
});
console.log(`articles with relatedArticles links: ${withRelated.length}/${arts.length}`);
