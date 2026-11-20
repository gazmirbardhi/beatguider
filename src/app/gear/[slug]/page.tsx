import { renderArticlePage, generateArticleMetadata, articleStaticParams } from "@/lib/content/render-article";

export function generateStaticParams() {
  return articleStaticParams("gear");
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then((p) => generateArticleMetadata("gear", p.slug));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { element } = await renderArticlePage("gear", slug);
  return element;
}
