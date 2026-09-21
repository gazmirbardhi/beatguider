import { renderArticlePage, generateArticleMetadata, articleStaticParams } from "@/lib/content/render-article";

export function generateStaticParams() {
  return articleStaticParams("fix");
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then((p) => generateArticleMetadata("fix", p.slug));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { element } = renderArticlePage("fix", slug);
  return element;
}
