import { SiteShell } from "@/components/panel/site-shell";
import { StaticPage } from "@/components/panel/static-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy",
  description: "What BeatGuider collects and doesn't: Google Tag Manager runs GA4 for aggregated, anonymized traffic measurement; BeatGuider itself sets no cookies.",
  path: "/privacy",
});

export default function Page() {
  return (
    <SiteShell>
      <StaticPage code="POL-04" title="Privacy" kicker="data · honest defaults" description="What data BeatGuider collects, what it does not, and what will change if that ever does.">
        <h2>What this site collects</h2>
        <p>BeatGuider is a fully static site. It loads Google Tag Manager (GTM), which runs Google Analytics 4 (GA4) for aggregated, anonymized traffic measurement — pages visited, referrers, and device/browser category. GA4 sets its own first-party cookies on <code>beatguider.com</code>; BeatGuider itself sets no cookies and does not collect, transmit or store personal data. The site does not have accounts, comment systems or server-side forms. You can opt out of GA4 via the Google Analytics Opt-out Browser Add-on or your browser&rsquo;s tracking-protection settings.</p>

        <h2>What is stored on your device</h2>
        <p>The site stores one entry in your own browser&apos;s <code>localStorage</code>: your NIGHT/DAY theme preference (<code>beatguider-mode</code>). It never leaves your browser and is not transmitted anywhere. Clearing your browser storage removes it.</p>

        <h2>Newsletter</h2>
        <p>The field-log dispatch (newsletter) is <strong>not connected yet — launching soon</strong>. The email field is visual only: nothing you type into it is transmitted, received or stored by BeatGuider or any third party. The page states this directly when you submit.</p>

        <h2>Hosting</h2>
        <p>The site is served by Cloudflare. Like any web host, Cloudflare processes the standard technical request data (such as IP address) needed to deliver pages and protect the service. In addition, BeatGuider enables Google Analytics 4 (GA4) for aggregated, anonymized traffic measurement.</p>

        <h2>Affiliate links</h2>
        <p>Some outgoing links to retailers (see the <a href="/affiliate-disclosure" style={{ color: "var(--acc)" }}>affiliate disclosure</a>) may earn BeatGuider a commission. When you follow one, you leave this site and are subject to that retailer&apos;s own privacy policy and practices — BeatGuider has no access to or control over the data retailers collect.</p>

        <h2>Changes to this policy</h2>
        <p>This page must be updated <em>before</em> any data-collecting integration is added — analytics, a working newsletter backend, advertising, comments or anything else that changes what this site collects. If that happens, the list above changes with it. Questions: <a href="mailto:hello@beatguider.com" style={{ color: "var(--acc)" }}>hello@beatguider.com</a> or the <a href="/contact" style={{ color: "var(--acc)" }}>contact page</a>.</p>
      </StaticPage>
    </SiteShell>
  );
}
