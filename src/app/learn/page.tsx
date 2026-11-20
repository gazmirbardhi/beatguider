import { SiteShell } from "@/components/panel/site-shell";
import { CategoryIndex } from "@/components/panel/category-index";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, collectionJsonLd, breadcrumbJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Practical DJ technique guides written from a working DJ's practice room — EQ mixing, first sessions, transitions. Research-based, no fake expertise.";

export const metadata = pageMetadata({
  title: "Learn — DJ technique guides",
  description: DESCRIPTION,
  path: "/learn",
});

export default function Page() {
  return (
    <SiteShell>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Learn", path: "/learn" }])} />
      <JsonLd data={collectionJsonLd("learn", DESCRIPTION)} />
      <CategoryIndex category="learn" title="Learn" kicker="technique" description="Practical DJ technique guides written from a working DJ's practice room. Research-based, no fake expertise." />
    </SiteShell>
  );
}
