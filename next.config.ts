import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Static export for Cloudflare Pages (BeatGuider §3): `next build` emits
     ./out. `next dev` works normally under output: "export" (it only
     forbids request-time server features, which this site does not use).
     trailingSlash is intentionally left unset — Cloudflare's
     html_handling: "auto-trailing-slash" (wrangler.jsonc) normalizes URLs. */
  output: "export",
  // Scaffold default (off). StrictMode affects dev only — enabling it
  // double-invokes effects (and the rAF-driven decorative components'
  // render loops) with no production effect; flip it on if you want the
  // extra dev-time checks.
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
};

export default nextConfig;
