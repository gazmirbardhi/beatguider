import { SiteShell } from "@/components/panel/site-shell";
import { StaticPage } from "@/components/panel/static-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Get in touch with BeatGuider — corrections, gear test suggestions, press and reader feedback.",
  path: "/contact",
});

export default function Page() {
  return (
    <SiteShell>
      <StaticPage code="CON-01" title="Contact" kicker="email · no forms" description="How to reach BeatGuider.">
        <h2>Email</h2>
        <p>General: <a href="mailto:hello@beatguider.com" style={{ color: "var(--acc)" }}>hello@beatguider.com</a></p>
        <p>Corrections: <a href="mailto:corrections@beatguider.com" style={{ color: "var(--acc)" }}>corrections@beatguider.com</a></p>
        <p>Affiliate / business: <a href="mailto:business@beatguider.com" style={{ color: "var(--acc)" }}>business@beatguider.com</a></p>
        
        <h2>No contact forms</h2>
        <p>BeatGuider does not use server-side contact forms — the site is fully static-exportable. Email is the channel. This keeps the architecture simple and the site fast.</p>
        
        <h2>Newsletter</h2>
        <p>The field-log dispatch (newsletter) uses client-side requests to a third-party service or a dedicated Worker. It is never a reason to convert the site to SSR.</p>
      </StaticPage>
    </SiteShell>
  );
}
