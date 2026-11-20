import { SiteShell } from "@/components/panel/site-shell";
import { StaticPage } from "@/components/panel/static-page";
import { StyleGuideSection } from "@/components/panel/sections";

/* Internal design reference — intentionally excluded from search indexes.
   Also disallowed in robots.txt; the meta noindex is the stronger guard
   (a robots.txt Disallow alone can leave a URL-only index entry). */
export const metadata = {
  title: "Style guide",
  description: "BeatGuider PANEL design system — living component reference.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <SiteShell>
      <StaticPage code="STYLE" title="Style guide" kicker="component reference · both modes" description="Every signature PANEL component rendered in both NIGHT and DAY modes. Toggle the chassis switch in the header to verify the electronics stay lit and identical.">
        <p className="mb-4">This is the living reference for maintaining the BeatGuider design system. Toggle between NIGHT and DAY using the header rocker switch (or press T).</p>
      </StaticPage>
      <StyleGuideSection />
    </SiteShell>
  );
}
