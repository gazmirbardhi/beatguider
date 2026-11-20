import { SiteShell } from "@/components/panel/site-shell";
import { CategoryIndex } from "@/components/panel/category-index";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, collectionJsonLd, breadcrumbJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Side-by-side DJ gear comparisons with real verdicts. Unique analysis per comparison — no auto-generated thin pages.";

export const metadata = pageMetadata({
  title: "Compare — DJ gear comparisons",
  description: DESCRIPTION,
  path: "/compare",
});

export default function Page() {
  return (
    <SiteShell>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Compare", path: "/compare" }])} />
      <JsonLd data={collectionJsonLd("compare", DESCRIPTION)} />
      <CategoryIndex category="compare" title="Compare" kicker="comparisons" description="Side-by-side DJ gear comparisons. Each comparison has unique analysis and a real verdict — no auto-generated thin pages." />
    </SiteShell>
  );
}
