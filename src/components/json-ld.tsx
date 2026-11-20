/*
  JsonLd — server component that emits a schema.org JSON-LD script.
  Used by every page that carries structured data. The data objects come
  from the builders in @/lib/seo — never hand-built inline.
*/
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
