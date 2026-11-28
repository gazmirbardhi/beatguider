import { SiteShell } from "@/components/panel/site-shell";
import { StaticPage } from "@/components/panel/static-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description: "BeatGuider is an independent DJ gear, software, troubleshooting and education publication operated by a working DJ. No fabricated reviews, no invented credentials.",
  path: "/about",
});

export default function Page() {
  return (
    <SiteShell>
      <StaticPage code="ABOUT" title="About" kicker="independent · working DJ operated" description="BeatGuider is an independent DJ gear, software, troubleshooting and education publication operated by a working DJ.">
        <h2>What BeatGuider is</h2>
        <p>BeatGuider is a test bench, not a magazine. It exists to solve three DJ problems: <strong>FIX</strong> broken gear or software, <strong>COMPARE</strong> equipment before you buy, and <strong>LEARN</strong> the practical skills a working DJ needs.</p>
        <p>The site is built in a hardware-faceplate design language — the PANEL system — because the design itself is the site's integrity mechanism. The Tested LED only lights when validated frontmatter proves hands-on testing. The freshness LEDs show when content needs rechecking. The anti-fake-testing rule is a build error, not an editorial promise.</p>
        
        <h2>Who runs it</h2>
        <p>BeatGuider is operated by a working DJ. We do not invent author biographies, years of experience, venues, tests or equipment usage. All articles are authored by DJ Mondi; every byline links to a real author page with a verifiable bio.</p>
        
        <h2>What we do not do</h2>
        <ul>
          <li>No fabricated reviews or ratings</li>
          <li>No fake expertise or invented credentials</li>
          <li>No SEO gimmicks, no llms.txt hacks, no hidden machine-targeted content</li>
          <li>No auto-generated thin pages or indexable tag pages</li>
        </ul>
        
        <h2>The business model</h2>
        <p>The primary objective is long-term organic US search traffic monetized through affiliate partnerships and, later, display advertising. Affiliate links never influence test methodology or ratings — the Tested LED is lit only from validated frontmatter, and the anti-fake-testing rule prevents an author from lighting it by writing it into the article body.</p>
      </StaticPage>
    </SiteShell>
  );
}
