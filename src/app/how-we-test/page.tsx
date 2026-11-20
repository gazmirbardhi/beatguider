import { SiteShell } from "@/components/panel/site-shell";
import { StaticPage } from "@/components/panel/static-page";
import { pageMetadata } from "@/lib/seo";
import { SpecTable } from "@/components/panel/components";

export const metadata = pageMetadata({
  title: "How we test DJ gear and software",
  description: "BeatGuider testing methodology — owned vs loaned equipment, software testing environments, comparison methodology and the anti-fake-testing rule.",
  path: "/how-we-test",
});

export default function Page() {
  return (
    <SiteShell>
      <StaticPage code="TEST-01" title="How we test" kicker="methodology · transparent" description="How BeatGuider tests DJ gear and software. Owned vs loaned, test environment, comparison methodology, and when content is research-based.">
        <h2>Owned vs loaned equipment</h2>
        <p>Equipment marked "owned" was purchased by BeatGuider and lives on the test bench. Equipment marked "loaned" was provided temporarily — usually at a gig venue — and is verified but not long-term tested. The ownership status appears on every spec plate and in the gear database.</p>
        
        <SpecTable caption="Equipment status" rows={[
          { label: "Owned", value: "Purchased, long-term tested" },
          { label: "Loaned", value: "Provided temporarily, verified" },
          { label: "Not owned", value: "Spec-only, not tested" },
        ]} />
        
        <h2>Software testing</h2>
        <p>Software is tested in a controlled environment with reproducible steps. The test environment, software versions, and platforms appear in the Lab Notes strip on every software-tested article.</p>
        
        <h2>Comparison methodology</h2>
        <p>Comparisons use a heuristic judge that compares numeric dimensions transparently (lower-better: weight; higher-better: bit-depth, channels, pads, release year). Ties are scored separately. The verdict plate shows the tally so you can see exactly which dimensions were judged.</p>
        
        <h2>When content is research-based</h2>
        <p>Some content is research-based — it synthesizes publicly available information rather than claiming hands-on testing. These articles carry a teal "RESEARCH-BASED" LED and never claim tested status. The anti-fake-testing rule prevents an author from lighting the Tested LED without non-empty tested.equipment in the frontmatter.</p>
        
        <h2>The anti-fake-testing rule</h2>
        <p>This is the core integrity mechanism: <code>experienceType: "hands-on"</code> requires non-empty <code>tested.equipment</code> in the frontmatter. The build fails otherwise. An author cannot light the Tested LED by writing it into the article body — it is driven only from validated frontmatter.</p>
      </StaticPage>
    </SiteShell>
  );
}
