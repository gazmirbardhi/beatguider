import { renderArticlePage, generateArticleMetadata, articleStaticParams } from "@/lib/content/render-article";

export function generateStaticParams() {
  return articleStaticParams("mobile-dj");
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then((p) => generateArticleMetadata("mobile-dj", p.slug));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { element } = renderArticlePage("mobile-dj", slug);
  return element;
}
