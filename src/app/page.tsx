import {
  FaceplateHeader,
  StickyNav,
} from "@/components/panel/chrome";
import { HomePageClient } from "@/components/panel/home-page-client";
import { SimplifiedHero, LatestArticles, SimpleNewsletterCta } from "@/components/panel/home-sections";
import { articles, validateContent, gearDb } from "@/lib/content/data";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";

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
  const lastPublish = [...articles].sort((a, b) => (b.publishedDate > a.publishedDate ? 1 : -1))[0]?.publishedDate ?? "—";

  const navItems = [
    { label: "Gear", href: "/gear" },
    { label: "Software", href: "/software" },
    { label: "Fix", href: "/fix" },
    { label: "Learn", href: "/learn" },
    { label: "Tools", href: "/tools" },
    { label: "Mobile DJ", href: "/mobile-dj" },
  ];

  return (
    <HomePageClient
      faceplate={<FaceplateHeader entryCount={entryCount} lastPublish={lastPublish} mode="night" />}
      nav={navItems}
      validationErrors={validationErrors}
      serial="2025-0000"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }}
      />
      <SimplifiedHero entryCount={entryCount} lastPublish={lastPublish} />
      <LatestArticles />
      <SimpleNewsletterCta />
    </HomePageClient>
  );
}
