# BeatGuider content — authoring articles in MDX

Every article on the site is a single MDX file in this directory
(`content/articles/`). The file's **frontmatter** is the single source of
truth for all article metadata; the **MDX body** is compiled at build time
into the existing PANEL article layout — same components, same styles,
same interactive behaviour as before the migration.

```
content/articles/
├── 01-ddj-flx4-no-sound.mdx        (FIX-001 · /fix/ddj-flx4-no-sound)
├── 02-ddj-flx4-review.mdx          (GEAR-018 · /gear/ddj-flx4-review)
├── 03-ddj-flx2-vs-ddj-flx4.mdx     (CMP-003 · /compare/ddj-flx2-vs-ddj-flx4)
├── 04-rekordbox-export-usb.mdx     (SW-008 · /software/rekordbox-export-usb)
├── 05-first-30-minutes.mdx         (LEARN-021 · /learn/first-30-minutes)
├── 06-eq-mixing-basics.mdx         (LEARN-022 · /learn/eq-mixing-basics)
├── 07-rekordbox-crash-on-export.mdx (FIX-002 · /fix/rekordbox-crash-on-export)
└── 08-mobile-dj-power-checklist.mdx (MOB-004 · /mobile-dj/mobile-dj-power-checklist)
```

## How it flows through the build

```
content/articles/*.mdx
        │
        ├── scripts/gen-content.ts      (bun run content:gen)
        │       └── validates frontmatter (zod) + cross-references,
        │           computes wordCount/readingTime, writes
        │           src/lib/content/generated/articles.ts
        │           (plain data — imported by client components via data.ts)
        │
        └── src/lib/content/loader.ts   (article routes, at page-prerender time)
                └── re-reads + re-validates the same files, and
                    mdx.tsx compiles each body onto the PANEL components
                    (Section, Step, StepList, Note, Caution, Checklist)
```

Both paths run during `bun run dev` and `bun run build:static`
(`next build` → `./out`). **A validation failure fails the build with a
list of every issue** — file, field and message. There is no CMS, no
server dependency, and no request-time MDX compilation.

## Adding an article — exact steps

1. **Pick the next numeric prefix** — files are named `NN-slug.mdx`. The
   prefix defines the site-wide article order (used by the "next module"
   CTA and category listings); the slug part **must equal** the
   `slug` field in the frontmatter. With `01`–`08` taken, the next file
   starts with `09-`.

2. **Create the file**, e.g. `content/articles/09-my-new-article.mdx`,
   with frontmatter + body (copy the example below).

3. **Regenerate + validate:**

   ```bash
   bun run content:gen
   ```

   All issues print with file/field/message and the command exits
   non-zero. Nothing regenerates until every file is valid.

4. **Check it renders** — `bun run dev`, then open
   `http://localhost:3000/<category>/<slug>`. Body edits appear on page
   refresh; frontmatter edits need `content:gen` re-run (or a dev-server
   restart).

5. **Add the OG card** for the new slug (1200×630 PNG in `public/og/`):

   ```bash
   bun run gen:og
   ```

6. **Build for production** exactly as before:

   ```bash
   bun run build:static   # runs content:gen automatically → ./out
   ```

The URL is derived from frontmatter — `/<category>/<slug>/` — so every
existing URL keeps working, and new articles appear automatically in the
sitemap, RSS feed (`bun run gen:rss`), category listings, homepage
"latest" section and the ⌘K search index. Nothing else needs editing.

## Frontmatter reference

Typed against `ArticleMeta` (`src/lib/content/types.ts`) and validated by
the zod schema in `src/lib/content/schema.ts`. Required fields are marked.

```yaml
---
code: "FIX-003"                 # REQUIRED — UPPERCASE-### display code, unique across articles + gear
slug: "my-new-article"          # REQUIRED — lowercase-with-hyphens, must match the filename slug, unique
title: "…"                      # REQUIRED
description: "…"                # REQUIRED — used in listings, search, meta description
category: "fix"                 # REQUIRED — gear | software | fix | learn | mobile-dj | compare
topic: "ddj-flx4"               # REQUIRED
tags: ["pioneer", "audio"]      # REQUIRED — at least one
publishedDate: "2025-02-01"     # REQUIRED — ISO yyyy-mm-dd (quote it!)
author: "BeatGuider Team"       # REQUIRED
contentType: "guide"            # REQUIRED — guide | review | comparison | roundup | explainer | business
experienceType: "hands-on"      # REQUIRED — hands-on | long-term-owned | software-tested | research-based

# Optional — but hands-on / long-term-owned articles MUST carry tested.equipment
updatedDate: "2025-02-10"       # ISO yyyy-mm-dd
lastVerified: "2025-02-10"      # ISO yyyy-mm-dd — only set when actually verified; never invent it
ownershipStatus: "owned"        # owned | loaned | n/a
tested:
  equipment: ["Pioneer DDJ-FLX4 (owned, GEAR-014)"]
  software: ["rekordbox 6.8.x"]
  platforms: ["macOS 14", "Windows 11"]
  environment: "Home studio"

# REQUIRED when category=fix+contentType=guide, or contentType=comparison
quickAnswer: "One-paragraph direct answer shown above the body."

# Optional, article-specific — renders only when present (anti-fabrication rule)
verdict:
  title: "Diagnostic verdict"
  meta: ["diagnostic", "verified"]
  rows:
    - label: "Most likely cause"
      value: "OS / DJ app routing (≈65%)"
difficulty: "Beginner — no special tools"
estimatedTime: "10–25 minutes"

relatedArticles: ["ddj-flx4-no-sound"]   # slugs of existing articles
relatedGear: ["GEAR-014"]                # codes from src/lib/content/gear.ts
sources:
  - title: "Pioneer DJ DDJ-FLX4 owner's manual"
    url: "https://www.pioneerdj.com/"
    date: "2023"
affiliateEligible: true
---
```

**Validation that fails the build:** missing/malformed required fields,
wrong enums, non-ISO dates, filename ↔ slug mismatch, duplicate slugs,
duplicate display codes, duplicate `<Section id>` anchors in one body,
`quickAnswer` missing for fix/compare articles, hands-on articles without
`tested.equipment`, `relatedGear`/`relatedArticles` pointing at things
that don't exist, and YAML that doesn't parse.

`wordCount` and `readingTime` are **never written by hand** — they are
computed from the MDX body at build time.

## MDX body components

Standard markdown works everywhere (paragraphs, lists, `inline code`,
[links](/), images). On top of that, the PANEL article components are
available as MDX elements:

| Element | Renders | Notes |
|---------|---------|-------|
| `<Section id="…" title="…" />` | `<h2>` heading with the TOC anchor id | one per section, ids unique — they feed the diagnostic TOC chips |
| `<Step n={1} title="…">…</Step>` | numbered step panel (StepBlock) | children: markdown paragraph and/or `<StepList>` |
| `<StepList items={[…]} />` | middle-dot item list inside a step | exact pre-MDX step-item rendering |
| `<Note title="…">text</Note>` | green note callout | text on one line between the tags |
| `<Caution title="…">text</Caution>` | red caution callout | text on one line between the tags |
| `<Checklist items={…} />` | interactive checklist (toggle buttons, strikethrough) | `items={[{ id: "x1", text: "…" }, …]}` |

Escaping notes: `{`, `}` and `<` are MDX/JSX syntax — use `&#123;`,
`&#125;`, `&lt;` if you need them in prose. Keep callout text inline
(between the tags on one line) so it renders as plain text, exactly like
the pre-MDX build. Blank lines around block components keep the markdown
flow parsing happy.

## Example file

A minimal, complete example (`content/articles/09-example.mdx` — do NOT
create this file, it's for reference):

```mdx
---
code: "EXA-001"
slug: "example-article"
title: "Example article — copy me"
description: "A minimal example showing every MDX body component."
category: "fix"
topic: "examples"
tags: ["example"]
publishedDate: "2025-02-01"
author: "BeatGuider Team"
contentType: "guide"
experienceType: "software-tested"
quickAnswer: "Copy this file, edit the frontmatter, run bun run content:gen."
---

<Section id="why-this-happens" title="Why this happens" />

A plain markdown paragraph. The failure sits in the chain between the
controller, the OS and the DJ app.

<Note title="Before you start">Keep one known-good cable on the bench.</Note>

<Section id="step-1" title="Step 1 — physical chain" />

<Step n={1} title="Verify the physical chain first">

<StepList items={["USB cable seated at both ends", "Power LED steady — not flickering"]} />

</Step>

<Caution title="Powered speakers">Power down the monitors before any cable change.</Caution>

<Section id="checklist" title="Field checklist" />

<Checklist items={[{ id: "e1", text: "Cable swapped" }, { id: "e2", text: "Output device confirmed" }]} />

<Section id="verdict" title="Verdict" />

Walk the chain in order and you'll resolve it in 10-25 minutes.
```

## Where NOT to put content

- **Gear database entries** (GEAR-###) live in `src/lib/content/gear.ts` —
  they back reviews and the Gear Dueler tool and are shared, not per-article.
- **Reading time / word counts** are computed — never author them.
- **Tested/Verified LED states** are derived from validated frontmatter —
  writing "tested" in the body lights nothing.
