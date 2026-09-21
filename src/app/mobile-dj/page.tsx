import { SiteShell } from "@/components/panel/site-shell";
import { CategoryIndex } from "@/components/panel/category-index";

export const metadata = { title: "Mobile DJ — gigging guides", description: "Mobile DJ business and gigging guides." };

export default function Page() {
  return (
    <SiteShell>
      <CategoryIndex category="mobile-dj" title="Mobile DJ" kicker="business · gigging" description="Mobile DJ content covers the gig-day reality: power, routing, contracts, transport, backup rigs. Written from a working DJ's gig bag." />
    </SiteShell>
  );
}
