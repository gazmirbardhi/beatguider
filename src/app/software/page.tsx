import { SiteShell } from "@/components/panel/site-shell";
import { CategoryIndex } from "@/components/panel/category-index";

export const metadata = { title: "Software — DJ software guides", description: "rekordbox, Serato, and DJ software guides." };

export default function Page() {
  return (
    <SiteShell>
      <CategoryIndex category="software" title="Software" kicker="software guides" description="DJ software guides — rekordbox, Serato, and the tools that run the signal chain. Software-tested, not guessed." />
    </SiteShell>
  );
}
