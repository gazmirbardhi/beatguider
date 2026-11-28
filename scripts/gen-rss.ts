/*
  BeatGuider RSS feed generation — build-time, static-output.
  Spec §23: optional static /feed.xml RSS (cheap, appropriate for a publication).
  Run: `bun run scripts/gen-rss.ts`
  Outputs public/feed.xml.
*/
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { publishedAt, updatedAt } from "../src/lib/content/validate";

const OUT = join(process.cwd(), "public", "feed.xml");

async function main() {
  const { articles } = await import("../src/lib/content/data");

  // sort by published date desc
  // Full-post feed: every published article is included so no post is
  // hidden from subscribers/crawlers by an arbitrary recency cap.
  const sorted = [...articles].sort((a, b) =>
    new Date(publishedAt(b)).getTime() - new Date(publishedAt(a)).getTime()
  );

  const items = sorted.map((a) => {
    // Real permalink — the article's own URL, not a homepage anchor.
    const url = `https://beatguider.com/${a.category}/${a.slug}`;
    const pub = new Date(publishedAt(a)).toISOString();
    const cats = a.tags.map((t) => `      <category>${escapeXml(t)}</category>`).join("\n");
    return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(a.description)}</description>
      <pubDate>${pub}</pubDate>
${cats}
    </item>`;
  }).join("\n");

  // Deterministic lastBuildDate: the most recent article update, NOT the
  // wall clock — a Date.now()-based value churns the tracked feed.xml diff
  // on every regeneration even when no content changed.
  const lastModified = [...articles].sort(
    (a, b) => new Date(updatedAt(b)).getTime() - new Date(updatedAt(a)).getTime()
  )[0];
  const lastBuild = new Date(updatedAt(lastModified)).toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BeatGuider — Test. Fix. Mix.</title>
    <link>https://beatguider.com</link>
    <description>Independent DJ gear, software, troubleshooting and education publication. Hands-on testing by a working DJ.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="https://beatguider.com/feed.xml" rel="self" type="application/rss+xml" />
    <managingEditor>editorial@beatguider.com (DJ Mondi)</managingEditor>
    <webMaster>webmaster@beatguider.com (DJ Mondi)</webMaster>
    <ttl>60</ttl>
${items}
  </channel>
</rss>
`;

  writeFileSync(OUT, xml);
  console.log(`✓ wrote ${OUT} (${(xml.length / 1024).toFixed(1)} KB, ${sorted.length} items)`);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

main().catch((e) => {
  console.error("✗ RSS generation failed:", e);
  process.exit(1);
});
