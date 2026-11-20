import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Static-exportable architecture target (BeatGuider §3):
     output: "export", trailingSlash: true. Disabled in dev sandbox
     (dev server needs the Node runtime). The build pipeline below is
     structured so that switching to `output: "export"` is a one-line change. */
  reactStrictMode: false,
  // Allow preview origin in dev sandbox only
  allowedDevOrigins:
    process.env.NODE_ENV === "development"
      ? ["https://preview-chat-cd8e3447-b0b4-4f42-a2c7-1e9376e29d33.space-z.ai"]
      : undefined,
  typescript: {
    // Strict TS — never ignore build errors in production.
    ignoreBuildErrors: false,
  },
  /* Security headers — served in dev and production.
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
