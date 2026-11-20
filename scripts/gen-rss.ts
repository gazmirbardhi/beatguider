/*
  BeatGuider RSS feed generation — build-time, static-output.
  Spec §23: optional static /feed.xml RSS (cheap, appropriate for a publication).
  Run: `bun run scripts/gen-rss.ts`
  Outputs public/feed.xml.
*/
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "feed.xml");

async function main() {
  const { articles } = await import("../src/lib/content/data");

  // sort by published date desc
  const sorted = [...articles].sort((a, b) =>
    new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  ).slice(0, 20); // cap at 20 most recent

  const items = sorted.map((a) => {
    // Real permalink — the article's own URL, not a homepage anchor.
    const url = `https://beatguider.com/${a.category}/${a.slug}`;
    const pub = new Date(a.publishedDate).toISOString();
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

  const lastBuild = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BeatGuider — Test. Fix. Mix.</title>
    <link>https://beatguider.com</link>
    <description>Independent DJ gear, software, troubleshooting and education publication. Hands-on testing by a working DJ.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="https://beatguider.com/feed.xml" rel="self" type="application/rss+xml" />
    <managingEditor>editorial@beatguider.com (BeatGuider Team)</managingEditor>
    <webMaster>webmaster@beatguider.com (BeatGuider Team)</webMaster>
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
