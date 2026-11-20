import { SiteShell } from "@/components/panel/site-shell";
import { CategoryIndex } from "@/components/panel/category-index";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, collectionJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { getCategory } from "@/lib/content/categories";

/* Category page content derives from the category registry
   (src/lib/content/categories.ts) — edit metadata there. */
const cat = getCategory("mobile-dj")!;

export const metadata = pageMetadata({
  title: cat.metaTitle,
  description: cat.metaDescription,
  path: `/${cat.id}`,
});

export default function Page() {
  return (
    <SiteShell>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: cat.name, path: `/${cat.id}` }])} />
      <JsonLd data={collectionJsonLd(cat.id, cat.metaDescription)} />
      <CategoryIndex category={cat.id} title={cat.name} kicker={cat.kicker} description={cat.description} />
    </SiteShell>
  );
}
