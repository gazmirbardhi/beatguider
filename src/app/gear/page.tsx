import { SiteShell } from "@/components/panel/site-shell";
import { CategoryIndex } from "@/components/panel/category-index";

export const metadata = { title: "Gear — DJ equipment reviews", description: "Hands-on DJ gear testing with real specs and VU ratings." };

export default function Page() {
  return (
    <SiteShell>
      <CategoryIndex category="gear" title="Gear" kicker="hands-on testing" description="Hands-on DJ equipment testing. Ratings render as VU meters and are emitted only from real test data — never fabricated." />
    </SiteShell>
  );
}
