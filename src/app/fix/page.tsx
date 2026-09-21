import { SiteShell } from "@/components/panel/site-shell";
import { CategoryIndex } from "@/components/panel/category-index";

export const metadata = { title: "Fix — DJ troubleshooting guides", description: "Methodical troubleshooting for DJ hardware and software." };

export default function Page() {
  return (
    <SiteShell>
      <CategoryIndex category="fix" title="Fix" kicker="troubleshooting" description="Methodical troubleshooting for DJ hardware and software. Diagnostics, not guesses — walk the signal chain in failure-probability order." />
    </SiteShell>
  );
}
