import { SiteShell } from "@/components/panel/site-shell";
import { StaticPage } from "@/components/panel/static-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Corrections policy",
  description: "How BeatGuider handles corrections: every fix is logged, dated and visible. Corrections are never silent.",
  path: "/corrections-policy",
});

export default function Page() {
  return (
    <SiteShell>
      <StaticPage code="POL-02" title="Corrections policy" kicker="corrections · transparency" description="How BeatGuider handles errors and corrections.">
        <h2>How we correct</h2>
        <p>When an error is identified in a published article, we correct it promptly and note the correction in the article's updated date. The <code>lastVerified</code> field tracks when the content was last checked against current reality.</p>
        
        <h2>Reporting an error</h2>
        <p>Email <a href="mailto:corrections@beatguider.com" style={{ color: "var(--acc)" }}>corrections@beatguider.com</a> with the article code (e.g. FIX-001) and the specific issue. We investigate every report.</p>
        
        <h2>Stale content</h2>
        <p>Articles past their freshness window show an amber "RECHECK DUE" or red "OVERDUE" LED. We prioritize re-verifying stale content, but we never auto-modify dates — re-verification is a genuine editorial pass, not a timestamp refresh.</p>
      </StaticPage>
    </SiteShell>
  );
}
