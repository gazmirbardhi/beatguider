import type { MetadataRoute } from "next";
import { sitemapEntries, SITE_URL } from "@/lib/seo";

/* Force static emission so `output: "export"` includes /sitemap.xml in out/. */
export const dynamic = "force-static";

/* Dynamic sitemap — derived from the real content layer at build time.
   Every article, category index, author page and static page is included;
   /style-guide and /api are intentionally excluded (see robots.txt).
   Static-export compatible: emits /sitemap.xml at build. */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries().map((e) => ({
    url: `${SITE_URL}${e.path === "/" ? "/" : e.path}`,
    lastModified: e.lastModified,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));
}
