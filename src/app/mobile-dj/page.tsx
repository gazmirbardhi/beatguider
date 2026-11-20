import { SiteShell } from "@/components/panel/site-shell";
import { CategoryIndex } from "@/components/panel/category-index";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, collectionJsonLd, breadcrumbJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Mobile DJ business and gigging guides — power, routing, contracts, transport and backup rigs, written from a working DJ's gig bag.";

export const metadata = pageMetadata({
  title: "Mobile DJ — gigging & business guides",
  description: DESCRIPTION,
  path: "/mobile-dj",
});

export default function Page() {
  return (
    <SiteShell>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Mobile DJ", path: "/mobile-dj" }])} />
      <JsonLd data={collectionJsonLd("mobile-dj", DESCRIPTION)} />
      <CategoryIndex category="mobile-dj" title="Mobile DJ" kicker="business · gigging" description="Mobile DJ content covers the gig-day reality: power, routing, contracts, transport, backup rigs. Written from a working DJ's gig bag." />
    </SiteShell>
  );
}
