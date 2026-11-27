import { SiteShell } from "@/components/panel/site-shell";
import { AuthorPage } from "@/components/panel/author-page";
import { JsonLd } from "@/components/json-ld";
import { articles } from "@/lib/content/data";
import { notFound } from "next/navigation";
import { personJsonLd, breadcrumbJsonLd } from "@/lib/seo";

const DJ_MONDI_BIO =
  "DJ Mondi is a working DJ and gear reviewer based in the UK. With years of experience playing weddings, clubs, and private events, he runs BeatGuider — an independent DJ publication that tests controllers, mixers, and software hands-on. No speculation, just real gear used at real gigs. When he's not writing troubleshooting guides or reviewing the latest controllers, you'll find him mixing behind the decks or sharing sets on TikTok and Instagram.";

const DJ_MONDI_SOCIALS = [
  "https://www.tiktok.com/@mondial_dj",
  "https://www.instagram.com/dj_mondial_/",
];

export function generateStaticParams() {
  // generate author slugs from the articles' author fields
  const authors = new Set<string>();
  articles.forEach((a) => {
    authors.add(a.author.toLowerCase().replace(/\s+/g, "-"));
  });
  return Array.from(authors).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Look up the real byline from the articles data — never reconstruct
  // casing from the slug ("beatguider-team" → "BeatGuider Team").
  const realName = articles.find(
    (a) => a.author.toLowerCase().replace(/\s+/g, "-") === slug
  )?.author;
  const authorName = realName ?? slug;
  const count = articles.filter(
    (a) => a.author.toLowerCase().replace(/\s+/g, "-") === slug
  ).length;
  return {
    // The layout template appends "· BeatGuider" — no brand duplication here.
    title: `${authorName} — author`,
    description: `Articles by ${authorName}: ${count} published piece${count === 1 ? "" : "s"} on BeatGuider, an independent DJ publication operated by DJ Mondi.`,
    alternates: { canonical: `/author/${slug}` },
    openGraph: {
      title: `${authorName} — author`,
      description: `Articles by ${authorName} on BeatGuider.`,
      url: `https://beatguider.com/author/${slug}`,
      type: "profile",
      images: [{ url: "/og/brand.png", width: 1200, height: 630, alt: `${authorName} — BeatGuider author` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${authorName} — author`,
      description: `Articles by ${authorName} on BeatGuider.`,
      images: ["/og/brand.png"],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // validate the author exists
  const validAuthors = new Set(articles.map((a) => a.author.toLowerCase().replace(/\s+/g, "-")));
  if (!validAuthors.has(slug)) notFound();

  const authorName =
    articles.find((a) => a.author.toLowerCase().replace(/\s+/g, "-") === slug)?.author ?? slug;
  const count = articles.filter(
    (a) => a.author.toLowerCase().replace(/\s+/g, "-") === slug
  ).length;

  const isMondi = authorName.toLowerCase().replace(/\s+/g, "-") === "dj-mondi";

  return (
    <SiteShell>
      <JsonLd
        data={personJsonLd(authorName, slug, count, {
          bio: isMondi ? DJ_MONDI_BIO : undefined,
          sameAs: isMondi ? DJ_MONDI_SOCIALS : undefined,
          image: isMondi ? "/images/author/dj-mondi.jpg" : undefined,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: authorName, path: `/author/${slug}` },
        ])}
      />
      <AuthorPage authorSlug={slug} isMondi={isMondi} mondiBio={DJ_MONDI_BIO} mondiSocials={DJ_MONDI_SOCIALS} />
    </SiteShell>
  );
}
