import { SiteShell } from "@/components/panel/site-shell";
import { CategoryIndex } from "@/components/panel/category-index";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, collectionJsonLd, breadcrumbJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "DJ software guides for rekordbox, Serato and the tools that run the signal chain. Software-tested walkthroughs, not guesses.";

export const metadata = pageMetadata({
  title: "Software — DJ software guides",
  description: DESCRIPTION,
  path: "/software",
});

export default function Page() {
  return (
    <SiteShell>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Software", path: "/software" }])} />
      <JsonLd data={collectionJsonLd("software", DESCRIPTION)} />
      <CategoryIndex category="software" title="Software" kicker="software guides" description="DJ software guides — rekordbox, Serato, and the tools that run the signal chain. Software-tested, not guessed." />
    </SiteShell>
  );
}
