/* Test-compile every article MDX body through the same renderMdxBody the
   Next.js build uses. Surfaces all MDX syntax errors in a single pass
   instead of failing the build one error at a time. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { renderMdxBody } from "../src/lib/content/mdx";

const DIR = join(process.cwd(), "content", "articles");
const files = readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort();
let ok = 0;
const fails: { file: string; err: string }[] = [];

for (const f of files) {
  const raw = readFileSync(join(DIR, f), "utf8");
  const body = matter(raw).content;
  try {
    await renderMdxBody(body);
    ok++;
  } catch (e) {
    fails.push({ file: f, err: e instanceof Error ? e.message : String(e) });
  }
}

console.log(`\n=== MDX COMPILE TEST ===`);
console.log(`OK:   ${ok}/${files.length}`);
console.log(`FAIL: ${fails.length}`);
for (const x of fails) {
  console.log(`\n  ✗ ${x.file}`);
  console.log(`    ${x.err.split("\n").slice(0, 6).join("\n    ")}`);
}
if (fails.length) process.exit(1);
