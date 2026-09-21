import { SiteShell } from "@/components/panel/site-shell";
import { AuthorPage } from "@/components/panel/author-page";
import { articles } from "@/lib/content/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  // generate author slugs from the articles' author fields
  const authors = new Set<string>();
  articles.forEach((a) => {
    authors.add(a.author.toLowerCase().replace(/\s+/g, "-"));
  });
  return Array.from(authors).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then((p) => {
    const authorName = p.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      title: `${authorName} — BeatGuider`,
      description: `Articles by ${authorName}.`,
    };
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // validate the author exists
  const validAuthors = new Set(articles.map((a) => a.author.toLowerCase().replace(/\s+/g, "-")));
  if (!validAuthors.has(slug)) notFound();

  return (
    <SiteShell>
      <AuthorPage authorSlug={slug} />
    </SiteShell>
  );
}
