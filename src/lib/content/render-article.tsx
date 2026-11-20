import { notFound } from "next/navigation";
import { SiteShell } from "@/components/panel/site-shell";
import { ArticleView } from "@/components/panel/article-view";
import { articles } from "@/lib/content/data";
import {
  absoluteUrl,
  techArticleJsonLd,
  breadcrumbJsonLd,
  SITE_NAME,
} from "@/lib/seo";

type Category = "fix" | "gear" | "software" | "learn" | "mobile-dj" | "compare";

const CATEGORY_NAMES: Record<Category, string> = {
  gear: "Gear",
  fix: "Fix",
  software: "Software",
  learn: "Learn",
  "mobile-dj": "Mobile DJ",
  compare: "Compare",
};

/* Shared article-page logic for all dynamic routes.
   Each route file calls renderArticlePage(category, params.slug). */

export function renderArticlePage(category: Category, slug: string) {
  const article = articles.find(
    (a) => a.category === category && a.slug === slug
  );
  if (!article) notFound();

  const articleLd = techArticleJsonLd(article);
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: CATEGORY_NAMES[category] ?? category, path: `/${category}` },
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
        <ArticleView article={article} />
      </SiteShell>
    ),
  };
}

export function generateArticleMetadata(category: Category, slug: string) {
  const article = articles.find(
    (a) => a.category === category && a.slug === slug
  );
  if (!article) return { title: "Not found" };

  const path = `/${category}/${slug}`;
  // every article slug ships a matching 1200×630 card in /og/
  const image = `/og/${slug}.png`;

  return {
    title: article.title,
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
      section: CATEGORY_NAMES[category] ?? category,
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
  return articles
    .filter((a) => a.category === category)
    .map((a) => ({ slug: a.slug }));
}
