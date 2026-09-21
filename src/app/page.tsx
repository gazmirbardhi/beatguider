import {
  FaceplateHeader,
  StickyNav,
} from "@/components/panel/chrome";
import {
  FaceplateHero,
  IntentPaths,
  FaultReport,
  TestedHardware,
  SoftwareLog,
  ToolModules,
  LatestLog,
  MobileDjModule,
  NewsletterCta,
  StyleGuideSection,
} from "@/components/panel/sections";
import { SpecimenArticle } from "@/components/panel/specimen-article";
import { SiteFooter, SearchOverlay } from "@/components/panel/footer";
import { HomePageClient } from "@/components/panel/home-page-client";
import { SignalChain } from "@/components/panel/decorative";
import { articles, validateContent, gearDb } from "@/lib/content/data";

// Build-time content validation — runs at request on every render in dev.
// In production this would fail the build via a custom pre-build script.
const validationErrors = validateContent(gearDb, articles);
if (validationErrors.length > 0 && process.env.NODE_ENV === "production") {
  // In dev this is surfaced in the page footer as a status line.
  console.error("BeatGuider content validation errors:", validationErrors);
}

export default function HomePage() {
  // Real build-time stats for the LCD status line
  const entryCount = articles.length + gearDb.length;
  const lastPublish = [...articles].sort((a, b) => (b.publishedDate > a.publishedDate ? 1 : -1))[0]?.publishedDate ?? "—";
  const serial = (() => {
    try {
      // serial is generated client-side by the no-flash script; fall back here
      return "2025-0000";
    } catch {
      return "2025-0000";
    }
  })();

  const navItems = [
    { label: "Gear", href: "#tested-hardware" },
    { label: "Software", href: "#software-log" },
    { label: "Fix", href: "#fault-report" },
    { label: "Learn", href: "#latest" },
    { label: "Tools", href: "#tools" },
    { label: "Mobile DJ", href: "#mobile-dj" },
  ];

  return (
    <HomePageClient
      faceplate={
        <FaceplateHeader
          entryCount={entryCount}
          lastPublish={lastPublish}
          mode="night"
        />
      }
      nav={navItems}
      validationErrors={validationErrors}
      serial={serial}
    >
      <FaceplateHero entryCount={entryCount} lastPublish={lastPublish} />
      <IntentPaths />
      <SignalChain />
      <FaultReport />
      <TestedHardware />
      <SoftwareLog />
      <ToolModules />
      <SpecimenArticle />
      <LatestLog />
      <MobileDjModule />
      <StyleGuideSection />
      <NewsletterCta />
    </HomePageClient>
  );
}
