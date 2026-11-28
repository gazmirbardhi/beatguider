import type { Metadata } from "next";
import { Chakra_Petch, Inter, IBM_Plex_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";

const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// No-flash theme script: < 1KB, blocking, sets data-mode on <html> only.
// Sets colors only — never geometry — so it cannot cause CLS.
// NIGHT is the default chassis for first-time visitors; a saved DAY
// preference (beatguider-mode) always wins. The OS prefers-color-scheme
// is intentionally NOT followed — the black test-bench is the brand.
const themeScript = `(function(){try{var k='beatguider-mode';var m=localStorage.getItem(k)||'night';document.documentElement.setAttribute('data-mode',m);}catch(e){document.documentElement.setAttribute('data-mode','night');}})();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://beatguider.com"),
  title: {
    default: "BeatGuider — Test. Fix. Mix.",
    template: "%s · BeatGuider",
  },
  description:
    "BeatGuider is an independent DJ gear, software, troubleshooting and education publication. Hands-on equipment testing, software testing, troubleshooting guides, comparisons and research-based educational content — operated by a working DJ.",
  keywords: [
    "DJ gear reviews",
    "DJ controller troubleshooting",
    "DJ software guides",
    "rekordbox",
    "Serato",
    "DJ education",
    "BeatGuider",
  ],
  authors: [{ name: "DJ Mondi" }],
  publisher: "BeatGuider",
  applicationName: "BeatGuider BG-1",
  formatDetection: { telephone: false },
  // Site-wide indexability. Pages may refine but never disable this;
  // the 404 page is the only legitimate noindex.
  robots: { index: true, follow: true, "max-image-preview": "large" },
  alternates: {
    // NOTE: no canonical here on purpose — a layout-level canonical is
    // inherited by every child page and would canonicalize all articles
    // to the homepage. Each page defines its own canonical instead.
    types: { "application/rss+xml": "/feed.xml" },
  },
  // Search Console ownership verification. Set GSC_VERIFICATION_TOKEN in
  // the environment (e.g. "abc123..." from Google Search Console) and the
  // meta tag is emitted automatically. No token → no tag.
  verification: {
    google: process.env.GSC_VERIFICATION_TOKEN || undefined,
  },
  openGraph: {
    title: "BeatGuider — Test. Fix. Mix.",
    description:
      "Independent DJ gear, software, troubleshooting and education publication. Hands-on testing by a working DJ.",
    url: "https://beatguider.com",
    siteName: "BeatGuider",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og/brand.png",
        width: 1200,
        height: 630,
        alt: "BeatGuider — Test. Fix. Mix. Independent DJ test bench",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BeatGuider — Test. Fix. Mix.",
    description:
      "Independent DJ gear, software, troubleshooting and education publication.",
    images: ["/og/brand.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon-night.svg",
    apple: "/apple-touch-icon.png",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BeatGuider",
  url: "https://beatguider.com",
  slogan: "Test. Fix. Mix.",
  description:
    "Independent DJ gear, software, troubleshooting and education publication operated by DJ Mondi — a working DJ testing gear, software, and techniques hands-on.",
  logo: {
    "@type": "ImageObject",
    url: "https://beatguider.com/logo.png",
    width: 512,
    height: 512,
  },
  sameAs: [
    "https://www.tiktok.com/@mondial_dj",
    "https://www.instagram.com/dj_mondial_/",
  ],
  founder: {
    "@type": "Person",
    name: "DJ Mondi",
    url: "https://beatguider.com/author/dj-mondi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      {/* Google Tag Manager */}
      <GoogleTagManager gtmId="GTM-TGG6K5NB" />
      </head>
      <body
        className={`${chakra.variable} ${inter.variable} ${plexMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TGG6K5NB"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
