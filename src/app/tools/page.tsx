import { SiteShell } from "@/components/panel/site-shell";
import { ToolCategoryPage } from "@/components/panel/tool-category";

export const metadata = {
  title: "Tools — DJ rack units",
  description: "Free DJ tools: BPM tap detector, BPM-to-ms calculator, Camelot wheel, key matcher, cue point calculator, set planner, DJ fee calculator, power calculator, gear comparison.",
};

export default function Page() {
  return (
    <SiteShell>
      <ToolCategoryPage />
    </SiteShell>
  );
}
