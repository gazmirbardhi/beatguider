/*
  BeatGuider content-integrity smoke test — `bun run test`.
  Fast, dependency-free checks that catch the common breakages before a
  deploy (the site has no runtime, so the content layer IS the app):

    1. Every MDX article parses and passes every validator.
    2. Every category has a dynamic route wired in src/app.
    3. Every hero/in-body image in frontmatter exists in public/.
    4. Every internal asset path referenced in a body exists in public/.
    5. Key static assets exist (author photo, OG brand, favicons, fonts).
    6. The author URL hardcoded in layout.tsx matches a real byline.

  Exit code 0 = all green; 1 = list of failures printed.
*/
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const failures: string[] = [];

function check(label: string, ok: boolean, detail = "") {
  if (ok) {
    console.log(`  ✓ ${label}`);
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
    failures.push(label);
  }
}

async function main() {
  const { loadArticleFiles } = await import("../src/lib/content/loader");
  const { validateCrossReferences, validateDates } = await import("../src/lib/content/validate");
  const { gearDb } = await import("../src/lib/content/gear");
  const { publishedAt, updatedAt } = await import("../src/lib/content/validate");

  console.log("\n1. Content parses + validates");
  const { articles, issues } = loadArticleFiles();
  check("all MDX files parse without frontmatter/section issues", issues.length === 0,
    issues.slice(0, 3).map((i) => `${i.file}:${i.field}`).join("; "));
  check("content directory is not empty", articles.length > 0);

  const cross = validateCrossReferences(articles.map((a) => a.meta), gearDb);
  check("cross-reference validation (slugs, codes, gear, related)", cross.length === 0,
    cross.slice(0, 3).map((i) => `${i.code}:${i.field}`).join("; "));

  const generatedAt = new Date().toISOString().slice(0, 10);
  const dateErrs = validateDates(articles.map((a) => a.meta), generatedAt);
  check("date validation (no future dates, updated ≥ published)", dateErrs.length === 0,
    dateErrs.slice(0, 3).map((i) => `${i.code}:${i.field}`).join("; "));

  console.log("\n2. Route coverage");
  const categories = [...new Set(articles.map((a) => a.meta.category))];
  for (const cat of categories) {
    check(`category "${cat}" has a dynamic route`, existsSync(join(ROOT, "src", "app", cat, "[slug]", "page.tsx")));
    check(`category "${cat}" has an index page`, existsSync(join(ROOT, "src", "app", cat, "page.tsx")));
  }

  console.log("\n3. Frontmatter images exist on disk");
  const withImages = articles.filter((a) => a.meta.hero || (a.meta.images ?? []).length > 0);
  if (withImages.length === 0) {
    console.log("  – no articles declare hero/images yet (photos pending) — nothing to check");
  }
  for (const a of withImages) {
    const imgs = [a.meta.hero, ...(a.meta.images ?? [])].filter(Boolean) as { src: string }[];
    for (const img of imgs) {
      const p = join(ROOT, "public", img.src.replace(/^\//, ""));
      check(`${a.meta.slug}: ${img.src}`, existsSync(p));
    }
  }

  console.log("\n4. Body images exist + internal links resolve to real routes");
  const { readFileSync, readdirSync } = await import("node:fs");
  const dir = join(ROOT, "content", "articles");
  const metas = articles.map((a) => a.meta);

  // Known routable paths — everything a body link may legitimately point at.
  const STATIC_PAGES = new Set([
    "/", "/tools", "/about", "/how-we-test", "/editorial-policy",
    "/corrections-policy", "/affiliate-disclosure", "/privacy", "/contact",
    "/feed.xml", "/sitemap.xml", "/llms.txt",
  ]);
  const articlePaths = new Set(metas.map((a) => `/${a.category}/${a.slug}`));
  const categoryPaths = new Set(metas.map((a) => `/${a.category}`));
  const authorPaths = new Set(metas.map((a) => `/author/${a.author.toLowerCase().replace(/\s+/g, "-")}`));

  function linkResolves(path: string): boolean {
    const clean = path.split("#")[0].split("?")[0];
    if (clean === "" || clean === "/") return STATIC_PAGES.has(path.split("#")[0] || "/");
    if (STATIC_PAGES.has(clean)) return true;
    if (articlePaths.has(clean)) return true;
    if (categoryPaths.has(clean)) return true;
    if (clean.startsWith("/author/")) return authorPaths.has(clean);
    return false;
  }

  // markdown image ![alt](/path) | component/HTML src="/path"
  const IMG_RE = /!\[[^\]]*\]\((\/[^)\s]+)\)|src="(\/[^"]+)"/g;
  // markdown link [text](/path) — NOT preceded by ! (image syntax)
  const LINK_RE = /(^|[^!])\[[^\]]*\]\((\/[^)\s]+)\)/g;

  let imgCount = 0;
  let linkCount = 0;
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".mdx"))) {
    const raw = readFileSync(join(dir, f), "utf8");
    for (const m of raw.matchAll(IMG_RE)) {
      imgCount++;
      const p = join(ROOT, "public", (m[1] ?? m[2]).replace(/^\//, ""));
      check(`${f}: ${(m[1] ?? m[2])} (image)`, existsSync(p));
    }
    for (const m of raw.matchAll(LINK_RE)) {
      linkCount++;
      check(`${f}: ${m[2]} (link)`, linkResolves(m[2]));
    }
  }
  if (imgCount === 0 && linkCount === 0) console.log("  – no images/links referenced in bodies — nothing to check");

  console.log("\n5. Key static assets");
  for (const rel of [
    "images/author/dj-mondi.jpeg",
    "og/brand.png",
    "favicon.svg",
    "favicon-night.svg",
    "robots.txt",
    "fonts/ChakraPetch-700.ttf",
    "fonts/Inter-400.ttf",
  ]) {
    check(`public/${rel}`, existsSync(join(ROOT, "public", rel)));
  }

  console.log("\n6. Author consistency");
  const authorSlugs = new Set(articles.map((a) => a.meta.author.toLowerCase().replace(/\s+/g, "-")));
  // layout.tsx Organization JSON-LD hardcodes the founder author page URL
  check("layout.tsx founder URL slug matches a real byline", authorSlugs.has("dj-mondi"),
    `authors: ${[...authorSlugs].join(", ")}`);

  const stale = articles.filter((a) => updatedAt(a.meta) < publishedAt(a.meta));
  check("updatedAt ≥ publishedAt for every article", stale.length === 0,
    stale.map((a) => a.meta.code).join(", "));

  console.log("");
  if (failures.length > 0) {
    console.error(`✗ smoke test FAILED — ${failures.length} issue(s)`);
    process.exit(1);
  }
  console.log(`✅ smoke test passed — ${articles.length} articles · ${categories.length} categories · ${gearDb.length} gear entries`);
}

main().catch((e) => {
  console.error("✗ smoke test crashed:", e);
  process.exit(1);
});
