import { notFound } from "next/navigation";
import { SiteShell } from "@/components/panel/site-shell";
import { ArticleView } from "@/components/panel/article-view";
import { articles, type ArticleMeta } from "@/lib/content/data";

type Category = "fix" | "gear" | "software" | "learn" | "mobile-dj" | "compare";

/* Shared article-page logic for all dynamic routes.
   Each route file calls renderArticlePage(category, params.slug). */

export function renderArticlePage(category: Category, slug: string) {
  const article = articles.find(
    (a) => a.category === category && a.slug === slug
  );
  if (!article) notFound();

  return {
    article,
    element: (
      <SiteShell>
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
  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedDate,
      modifiedTime: article.updatedDate,
      authors: [article.author],
    },
  };
}

export function articleStaticParams(category: Category) {
  return articles
    .filter((a) => a.category === category)
    .map((a) => ({ slug: a.slug }));
}
