import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Static export for Cloudflare Pages (BeatGuider §3): `next build` emits
     ./out. `next dev` works normally under output: "export" (it only
     forbids request-time server features, which this site does not use).
     trailingSlash is intentionally left unset — Cloudflare's
     html_handling: "auto-trailing-slash" (wrangler.jsonc) normalizes URLs. */
  output: "export",
  reactStrictMode: false,
  // Allow preview origin in dev sandbox only. NOTE: Next.js matches the
  // request's bare HOSTNAME against these entries (see
  // next/dist/server/lib/router-utils/block-cross-site.js — it parses the
  // Origin header and compares parsedOrigin.hostname), so the value must
  // NOT include the https:// protocol or it never matches and /_next/*
  // asset requests from the preview proxy get 403-blocked.
  allowedDevOrigins:
    process.env.NODE_ENV === "development"
      ? ["preview-chat-cd8e3447-b0b4-4f42-a2c7-1e9376e29d33.space-z.ai"]
      : undefined,
  typescript: {
    // Strict TS — never ignore build errors in production.
    ignoreBuildErrors: false,
  },
  /* Security headers — applied by the dev server. Under output: "export"
     Next.js does not emit these into out/ (build warns); public/_headers
     is the production mechanism on Cloudflare Pages.
     HTTPS enforcement: every canonical/OG/sitemap URL is https://
     (see src/lib/seo.ts) and HSTS is set for the production host in
     public/_headers (Cloudflare). X-Frame-Options and CSP are
     intentionally NOT set here so the sandbox preview can embed the
     site in an iframe. */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        // Long-cache fingerprinted static assets
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // OG + content images — stable filenames, long cache
        source: "/:folder(og|gear|articles)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
