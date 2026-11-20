/*
  BeatGuider MDX content loader — SERVER/BUILD ONLY.
  Reads content/articles/*.mdx from disk, validates every file, and
  exposes article metadata + raw MDX bodies to the article routes
  (src/lib/content/render-article.tsx).

  Must never be imported from client code — it uses node:fs. Client
  components consume the generated metadata module via data.ts instead
  (src/lib/content/generated/articles.ts, produced by the same MDX files
  through scripts/gen-content.ts).

  Any validation violation throws with the full issue list, so
  `next build` / `next dev` fails loudly at page-generation time.
*/

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gearDb } from "./gear";
import {
  parseArticleFile,
  type FileIssue,
  type ParsedArticle,
} from "./schema";
import {
  computeReadingTime,
  countMdxWords,
  extractToc,
  validateCrossReferences,
} from "./validate";
import type { ArticleMeta } from "./types";

const CONTENT_DIR = join(process.cwd(), "content", "articles");

export type LoadedArticle = {
  file: string;
  meta: ArticleMeta;
  body: string;
};

function formatIssues(issues: (FileIssue | { code: string; field: string; message: string })[]): string {
  return issues
    .map((i) =>
      "file" in i
        ? `  ✗ ${i.file} — ${i.field}: ${i.message}`
        : `  ✗ [${i.code}] ${i.field}: ${i.message}`
    )
    .join("\n");
}

/* Read + parse every article file. Files are ordered by filename —
   the NN- prefix defines the site-wide article order (mirrored by
   scripts/gen-content.ts into the generated module). */
export function loadArticleFiles(): {
  articles: LoadedArticle[];
  issues: FileIssue[];
} {
  const issues: FileIssue[] = [];
  const articles: LoadedArticle[] = [];

  let names: string[];
  try {
    names = readdirSync(CONTENT_DIR)
      .filter((n) => n.endsWith(".mdx"))
      .sort();
  } catch (e) {
    throw new Error(
      `BeatGuider content directory not found or unreadable: ${CONTENT_DIR} (${e instanceof Error ? e.message : String(e)})`
    );
  }

  if (names.length === 0) {
    throw new Error(
      `BeatGuider content directory is empty — expected MDX articles in ${CONTENT_DIR}`
    );
  }

  for (const name of names) {
    const raw = readFileSync(join(CONTENT_DIR, name), "utf8");
    const parsed = parseArticleFile(name, raw);
    if (!parsed.ok) {
      issues.push(...parsed.issues);
      continue;
    }
    articles.push({
      file: name,
      meta: withDerived(parsed.article),
      body: parsed.article.body,
    });
  }

  return { articles, issues };
}

/* wordCount + readingTime are computed from the MDX body — never authored. */
function withDerived(parsed: ParsedArticle): ArticleMeta {
  const wordCount = countMdxWords(parsed.body);
  return {
    ...parsed.meta,
    wordCount,
    readingTime: computeReadingTime(Math.max(wordCount, 1)),
  };
}

/* All article metadata, validated. Throws on any violation — the error
   message lists every issue so a single build run surfaces them all. */
export function getAllArticles(): ArticleMeta[] {
  const { articles, issues } = loadArticleFiles();
  const cross = validateCrossReferences(
    articles.map((a) => a.meta),
    gearDb
  );
  if (issues.length > 0 || cross.length > 0) {
    throw new Error(
      `BeatGuider content validation failed — ${issues.length + cross.length} issue(s):\n${formatIssues([...issues, ...cross])}`
    );
  }
  return articles.map((a) => a.meta);
}

export function getArticle(
  category: ArticleMeta["category"],
  slug: string
): ArticleMeta | undefined {
  return getAllArticles().find(
    (a) => a.category === category && a.slug === slug
  );
}

export function getArticleBody(slug: string): string {
  const found = loadArticleFiles().articles.find((a) => a.meta.slug === slug);
  if (!found) {
    throw new Error(`BeatGuider content loader: no MDX article for slug "${slug}"`);
  }
  return found.body;
}

/* TOC entries (id + title) from the article's <Section> markers —
   anchors always exist on the page, no dead in-page links. */
export function getArticleToc(slug: string): { id: string; title: string }[] {
  return extractToc(getArticleBody(slug));
}
