import { renderArticlePage, generateArticleMetadata, articleStaticParams } from "@/lib/content/render-article";

export function generateStaticParams() {
  return articleStaticParams("software");
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then((p) => generateArticleMetadata("software", p.slug));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { element } = renderArticlePage("software", slug);
  return element;
}
