import { notFound } from "next/navigation";
import { SiteShell } from "@/components/panel/site-shell";
import { ArticleView } from "@/components/panel/article-view";
import {
  getAllArticles,
  getArticle,
  getArticleBody,
  getArticleToc,
} from "@/lib/content/loader";
import { renderMdxBody } from "@/lib/content/mdx";
import {
  absoluteUrl,
  techArticleJsonLd,
  breadcrumbJsonLd,
  SITE_NAME,
} from "@/lib/seo";
import type { ArticleMeta } from "@/lib/content/types";
import { categoryName, type CategoryId } from "@/lib/content/categories";

type Category = CategoryId;

/* Shared article-page logic for all dynamic routes.
   Each route file calls renderArticlePage(category, params.slug).
   The MDX body is compiled here — at build time under static export —
   and handed to ArticleView as a pre-rendered node. */

export async function renderArticlePage(category: Category, slug: string) {
  const article = getArticle(category, slug);
  if (!article) notFound();

  const body = await renderMdxBody(getArticleBody(slug));
  const toc = getArticleToc(slug).map((t, i) => ({
    id: t.id,
    label: t.title.replace(/^Step \d+ — /, ""),
    n: String(i + 1).padStart(2, "0"),
  }));

  const articleLd = techArticleJsonLd(article);
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: categoryName(category), path: `/${category}` },
    { name: article.title, path: `/${category}/${slug}` },
  ]);

  return {
    article,
    element: (
      <SiteShell>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
        <ArticleView article={article} body={body} toc={toc} />
      </SiteShell>
    ),
  };
}

export function generateArticleMetadata(category: Category, slug: string) {
  const article = getArticle(category, slug);
  if (!article) return { title: "Not found" };

  return metadataFor(article);
}

function metadataFor(article: ArticleMeta) {
  const path = `/${article.category}/${article.slug}`;
  // every article slug ships a matching 1200×630 card in /og/
  const image = `/og/${article.slug}.png`;

  return {
    /* Long titles drop the " · BeatGuider" suffix instead of getting
       truncated — the full accurate title beats a cut-off one, and the
       site name adds 13 chars that push long titles past display
       length. Titles that fit keep the branded template. */
    title:
      article.title.length > 57
        ? { absolute: article.title }
        : article.title,
    description: article.description,
    keywords: article.tags,
    alternates: {
      canonical: path,
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      type: "article",
      locale: "en_US",
      publishedTime: article.publishedDate,
      modifiedTime: article.updatedDate ?? article.publishedDate,
      authors: [article.author],
      section: categoryName(article.category),
      tags: article.tags,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${article.title} — ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [image],
    },
  };
}

export function articleStaticParams(category: Category) {
  return getAllArticles()
    .filter((a) => a.category === category)
    .map((a) => ({ slug: a.slug }));
}
