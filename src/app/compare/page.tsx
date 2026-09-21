import { SiteShell } from "@/components/panel/site-shell";
import { CategoryIndex } from "@/components/panel/category-index";

export const metadata = { title: "Compare — DJ gear comparisons", description: "Side-by-side DJ gear comparisons with real verdicts." };

export default function Page() {
  return (
    <SiteShell>
      <CategoryIndex category="compare" title="Compare" kicker="comparisons" description="Side-by-side DJ gear comparisons. Each comparison has unique analysis and a real verdict — no auto-generated thin pages." />
    </SiteShell>
  );
}
