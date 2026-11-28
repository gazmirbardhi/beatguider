import {
  FaceplateHeader,
  StickyNav,
} from "@/components/panel/chrome";
import { HomePageClient } from "@/components/panel/home-page-client";
import { SimplifiedHero, LatestArticles, CategoryBrowser, SimpleNewsletterCta } from "@/components/panel/home-sections";
import { articles, validateContent, gearDb } from "@/lib/content/data";
import { navCategories } from "@/lib/content/categories";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";
import { updatedAt } from "@/lib/content/validate";

// Homepage canonical + social card — defined here (not in the layout) so
// child pages can never inherit the wrong canonical.
export const metadata = pageMetadata({
  title: "BeatGuider — Test. Fix. Mix.",
  description:
    "Independent DJ gear, software, troubleshooting and education publication. Hands-on equipment testing, real specs, honest verdicts — operated by a working DJ.",
  path: "/",
});

// Build-time content validation
const validationErrors = validateContent(gearDb, articles);

// WebSite structured data — the homepage is the site node.
const siteLd = websiteJsonLd();

export default function HomePage() {
  const entryCount = articles.length + gearDb.length;
  // Canonical published/updated dates via the updatedAt() helper — the raw
  // legacy .updatedAt field is missing on newer articles, which made this
  // read as "2025-01-12" on the homepage LCD.
  const lastPublish = articles.reduce(
    (max, a) => (updatedAt(a) > max ? updatedAt(a) : max),
    "0000-00-00"
  );

  // Nav derives from the category registry (categories.ts) — categories
  // without a navOrder stay off the sticky nav; Tools is appended as a
  // non-content destination.
  const navItems = [...navCategories(), { label: "Tools", href: "/tools" }];

  return (
    <HomePageClient
      faceplate={<FaceplateHeader entryCount={entryCount} lastPublish={lastPublish} />}
      nav={navItems}
      validationErrors={validationErrors}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }}
      />
      <SimplifiedHero entryCount={entryCount} lastPublish={lastPublish} />
      <LatestArticles />
      <CategoryBrowser />
      <SimpleNewsletterCta />
    </HomePageClient>
  );
}
