import { SiteShell } from "@/components/panel/site-shell";
import { StaticPage } from "@/components/panel/static-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Affiliate disclosure",
  description: "How BeatGuider's affiliate links work — commissions never influence test methodology, ratings or verdicts.",
  path: "/affiliate-disclosure",
});

export default function Page() {
  return (
    <SiteShell>
      <StaticPage code="POL-03" title="Affiliate disclosure" kicker="affiliate · transparent" description="BeatGuider's affiliate partnerships and how they (don't) affect content.">
        <h2>How affiliate links work</h2>
        <p>BeatGuider may earn a commission on purchases made through affiliate links. Links use <code>rel="sponsored nofollow noopener"</code> and open in a new tab. Prices are never quoted on BeatGuider — the retailer sets the price.</p>
        
        <h2>Editorial independence</h2>
        <p>Affiliate partnerships do not influence test methodology or ratings. The Tested LED is lit only from validated frontmatter. The anti-fake-testing rule is a build error — an author cannot fake a review for an affiliate partner because the build would fail without genuine tested.equipment.</p>
        
        <h2>Current partners</h2>
        <p>Amazon Associates (when available). We disclose the retailer next to every affiliate button. We never hard-code affiliate links in article bodies — all links go through the centralized AffiliateButton component which reads from the gear database.</p>
      </StaticPage>
    </SiteShell>
  );
}
