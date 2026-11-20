import { SiteShell } from "@/components/panel/site-shell";
import { ToolCategoryPage } from "@/components/panel/tool-category";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tools — free DJ rack units",
  description:
    "Free browser DJ tools: BPM tap detector, BPM-to-ms calculator, Camelot key matcher, cue point calculator, set planner, DJ fee calculator, power calculator and gear comparison.",
  path: "/tools",
});

export default function Page() {
  return (
    <SiteShell>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }])} />
      <ToolCategoryPage />
    </SiteShell>
  );
}
