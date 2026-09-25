import type { Metadata } from "next";
import { Chakra_Petch, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// No-flash theme script: < 1KB, blocking, sets data-mode on <html> only.
// Sets colors only — never geometry — so it cannot cause CLS.
const themeScript = `(function(){try{var k='beatguider-mode';var s=localStorage.getItem(k);var m=s||(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'day':'night');document.documentElement.setAttribute('data-mode',m);var b=new Date();var z=function(n){return (n<10?'0':'')+n};var sn='2025-'+z(b.getMonth()+1)+z(b.getDate())+'-'+b.getHours()+z(b.getMinutes());localStorage.setItem('beatguider-sn',sn);}catch(e){document.documentElement.setAttribute('data-mode','night');}})();`;

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
  authors: [{ name: "BeatGuider Team" }],
  publisher: "BeatGuider",
  applicationName: "BeatGuider BG-1",
  robots: { index: true, follow: true, "max-image-preview": "large" },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
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
  icons: { icon: "/favicon.svg" },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BeatGuider",
  url: "https://beatguider.com",
  slogan: "Test. Fix. Mix.",
  description:
    "Independent DJ gear, software, troubleshooting and education publication operated by a working DJ.",
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
      </head>
      <body
        className={`${chakra.variable} ${inter.variable} ${plexMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
