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
};

export default nextConfig;
