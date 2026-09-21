import { SiteShell } from "@/components/panel/site-shell";
import { CategoryIndex } from "@/components/panel/category-index";

export const metadata = { title: "Learn — DJ technique guides", description: "Practical DJ technique guides from a working DJ." };

export default function Page() {
  return (
    <SiteShell>
      <CategoryIndex category="learn" title="Learn" kicker="technique" description="Practical DJ technique guides written from a working DJ's practice room. Research-based, no fake expertise." />
    </SiteShell>
  );
}
