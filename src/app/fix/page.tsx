import { SiteShell } from "@/components/panel/site-shell";
import { CategoryIndex } from "@/components/panel/category-index";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, collectionJsonLd, breadcrumbJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Methodical DJ hardware and software troubleshooting. Step-by-step diagnostics in failure-probability order — walk the signal chain, don't guess.";

export const metadata = pageMetadata({
  title: "Fix — DJ troubleshooting guides",
  description: DESCRIPTION,
  path: "/fix",
});

export default function Page() {
  return (
    <SiteShell>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Fix", path: "/fix" }])} />
      <JsonLd data={collectionJsonLd("fix", DESCRIPTION)} />
      <CategoryIndex category="fix" title="Fix" kicker="troubleshooting" description="Methodical troubleshooting for DJ hardware and software. Diagnostics, not guesses — walk the signal chain in failure-probability order." />
    </SiteShell>
  );
}
