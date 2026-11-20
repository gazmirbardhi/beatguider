import { SiteShell } from "@/components/panel/site-shell";
import { CategoryIndex } from "@/components/panel/category-index";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, collectionJsonLd, breadcrumbJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Hands-on DJ equipment reviews with real specs and VU ratings. Owned-unit, long-term testing of controllers and gear — no fabricated reviews.";

export const metadata = pageMetadata({
  title: "Gear — DJ equipment reviews",
  description: DESCRIPTION,
  path: "/gear",
});

export default function Page() {
  return (
    <SiteShell>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Gear", path: "/gear" }])} />
      <JsonLd data={collectionJsonLd("gear", DESCRIPTION)} />
      <CategoryIndex category="gear" title="Gear" kicker="hands-on testing" description="Hands-on DJ equipment testing. Ratings render as VU meters and are emitted only from real test data — never fabricated." />
    </SiteShell>
  );
}
