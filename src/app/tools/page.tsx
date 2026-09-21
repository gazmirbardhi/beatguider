import { SiteShell } from "@/components/panel/site-shell";
import { StaticPage } from "@/components/panel/static-page";
import { ToolModules } from "@/components/panel/sections";

export const metadata = { title: "Tools", description: "BeatGuider rack-unit tools — BPM calculator, Camelot wheel, power calculator, Gear Dueler." };

export default function Page() {
  return (
    <SiteShell>
      <StaticPage code="TOOLS" title="Tools" kicker="rack units · client-side" description="Interactive DJ tools styled as rack units. Each is a device: hardware inputs, results on a dark LCD readout in Plex Mono with amber digits. All static-export compatible — JavaScript loads per-route only.">
        <p className="mb-4">All tools run entirely in your browser. No data is sent to a server.</p>
      </StaticPage>
      <section className="py-8">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <ToolModules />
        </div>
      </section>
    </SiteShell>
  );
}
