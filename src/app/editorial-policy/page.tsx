import { SiteShell } from "@/components/panel/site-shell";
import { StaticPage } from "@/components/panel/static-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Editorial policy",
  description: "BeatGuider editorial standards: how content is produced, verified and labeled — hands-on, long-term-owned, software-tested or research-based.",
  path: "/editorial-policy",
});

export default function Page() {
  return (
    <SiteShell>
      <StaticPage code="POL-01" title="Editorial policy" kicker="standards · integrity" description="BeatGuider's editorial standards. First-hand evidence, transparency, no fabrication.">
        <h2>Content integrity</h2>
        <p>Every article carries a display code (FIX-001, GEAR-014, etc.) derived from its content type + publication sequence. Codes are cosmetic — never used in URLs — and uniqueness is validated at build time.</p>
        
        <h2>Testing status LEDs</h2>
        <p>The Tested LED lights only when <code>experienceType: "hands-on"</code> AND <code>tested.equipment</code> is non-empty. The Long-term owned LED requires the same. The Research-based LED marks content that synthesizes public information. These LEDs are driven from validated frontmatter — never from article body text.</p>
        
        <h2>Freshness</h2>
        <p>Content classes carry different verification windows. The freshness LEDs (green VERIFIED, amber RECHECK DUE, red OVERDUE) appear on every spec plate. Freshness is a user-visible trust feature, not a hidden maintenance chore.</p>
        
        <h2>No fabrication</h2>
        <p>We do not invent specs, results, credentials, prices, author biographies, years of experience, venues, tests or equipment usage. Affiliate prices are never quoted — links go to the retailer, which sets the price.</p>
        
        <h2>Internal linking</h2>
        <p>Related modules are prioritized: manually specified → topic relationships → shared gear/software entity → category fallback. No generic category-wide "related" blocks. Every important article is reachable via crawlable links.</p>
      </StaticPage>
    </SiteShell>
  );
}
