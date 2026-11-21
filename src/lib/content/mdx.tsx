/*
  BeatGuider MDX renderer — SERVER/BUILD ONLY.
  Compiles an article's MDX body at build time (static-export safe:
  page prerendering executes this during `next build`) and maps MDX
  elements onto the existing PANEL components — the article layout,
  styles and interactive behaviour are unchanged.

  MDX components available inside content/articles/*.mdx:

    <Section id="anchor" title="Heading" />   h2 with explicit TOC anchor
    <Step n={1} title="...">…</Step>          StepBlock (client)
    <StepList items={[…]} />                   bulleted list inside a Step
    <Note title="...">…</Note>                 NoteCallout (client)
    <Caution title="...">…</Caution>           CautionCallout (client)
    <Checklist items={[…]} />                  interactive Checklist (client)

  Plus standard markdown (GitHub-flavored): paragraphs, headings, lists,
  tables, task lists, blockquotes, inline code, fenced code, links.

  GFM support (remark-gfm) is REQUIRED — without it markdown tables
  render as literal pipe-text paragraphs and task lists as "[ ]" text.
  Table elements are mapped through MdxTable below: normal tables get
  the responsive panel-styled table; "Pros | Cons" two-column tables
  are detected and rendered as the green/red ProsCons panel.
*/

import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import * as runtime from "react/jsx-runtime";
import {
  StepBlock,
  NoteCallout,
  CautionCallout,
  Checklist,
  ScrollFade,
} from "@/components/panel/components";

/* Section — renders exactly like the old BodyRenderer section heading:
   an <h2> carrying the section's anchor id, wrapped in a plain <div>.
   (The wrapper mirrors the previous per-section DOM, so the PANEL
   prose styles — including the h2:first-child border rule — behave
   identically to the pre-MDX build.) */
export function Section({ id, title }: { id: string; title: string }) {
  return (
    <div>
      <h2 id={id}>{title}</h2>
    </div>
  );
}

/* StepList — the middle-dot item list used inside <Step>, matching the
   pre-MDX step rendering exactly (ul.space-y-1 + "· " item prefix). */
export function StepList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, j) => (
        <li key={j}>· {item}</li>
      ))}
    </ul>
  );
}

/* ─── ReactNode tree helpers (build-time only) ───
   Used by the Pros/Cons table detector below. MDX emits plain HTML
   elements for markdown, so matching on string element types is safe. */

function nodeText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement(node)) {
    return nodeText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

function elementsOfType(children: ReactNode, type: string): ReactElement<{ children?: ReactNode }>[] {
  const out: ReactElement<{ children?: ReactNode }>[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      const el = child as ReactElement<{ children?: ReactNode }>;
      if (el.type === type) {
        out.push(el);
      } else {
        out.push(...elementsOfType(el.props.children, type));
      }
    }
  });
  return out;
}

/* ─── Pros/Cons panel ───
   Reviews import their verdict as a two-column `| Pros | Cons |` table.
   Instead of a cramped side-by-side grid, this renders the site's
   verdict panel: a green "PROS" card and a red "CONS" card, each item
   with a check/cross glyph — matching the Note/Caution callout design.
   Cell content (links, bold, code) is preserved — each cell's CHILDREN
   are re-rendered (never the <td> element itself, which would be
   invalid HTML nesting inside the <span> and break hydration). Cards
   are top-aligned (items-start) so a short column doesn't stretch to
   match the tall one. */
function ProsConsPanel({ children }: { children: ReactNode }) {
  const cellsPerRow = elementsOfType(children, "tr").map((tr) =>
    elementsOfType(tr.props.children, "td")
  );
  const hasText = (cell: ReactNode) => nodeText(cell).trim().length > 0;
  const cellContent = (cell: ReactElement<{ children?: ReactNode }>) => cell.props.children;
  const pros = cellsPerRow.map((r) => r[0]).filter((c) => c !== undefined && hasText(c));
  const cons = cellsPerRow.map((r) => r[1]).filter((c) => c !== undefined && hasText(c));

  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      <aside
        className="p-4 sm:p-5 border-l-[3px] rounded-sm"
        style={{ borderColor: "var(--ok)", background: "rgba(51,255,102,0.05)" }}
        aria-label="Pros"
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="font-(family-name:--font-chakra) font-bold text-xs tracking-widest"
            style={{ color: "var(--ok)", textShadow: "0 0 4px rgba(0,0,0,0.3)" }}
          >
            {"//"} PROS
          </span>
          <span className="led led-g" aria-hidden="true" />
        </div>
        <ul className="proscons-list space-y-2">
          {pros.map((cell, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: "var(--body)" }}>
              <CheckGlyph />
              <span className="min-w-0">{cellContent(cell)}</span>
            </li>
          ))}
        </ul>
      </aside>
      <aside
        className="p-4 sm:p-5 border-l-[3px] rounded-sm"
        style={{ borderColor: "var(--err)", background: "rgba(255,68,68,0.06)" }}
        aria-label="Cons"
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="font-(family-name:--font-chakra) font-bold text-xs tracking-widest"
            style={{ color: "var(--err)" }}
          >
            !! CONS
          </span>
          <span className="led led-r" aria-hidden="true" />
        </div>
        <ul className="proscons-list space-y-2">
          {cons.map((cell, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: "var(--body)" }}>
              <CrossGlyph />
              <span className="min-w-0">{cellContent(cell)}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function CheckGlyph() {
  return (
    <svg
      className="shrink-0 mt-0.5"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 8.5l3.2 3.2L13 5" stroke="var(--ok)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossGlyph() {
  return (
    <svg
      className="shrink-0 mt-0.5"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 4l8 8M12 4l-8 8" stroke="var(--err)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ─── MdxTable — every markdown table routes through here ───
   `| Pros | Cons |` tables (exactly 2 columns, those exact headers)
   render as the ProsCons panel; everything else renders as the
   responsive, panel-styled table (see .mdx-table CSS in globals.css:
   dark electronics header row, plate body cells, zebra striping,
   horizontal scroll on narrow screens). */
function MdxTable({ children }: { children: ReactNode }) {
  const ths = elementsOfType(children, "th");
  if (ths.length === 2) {
    const [a, b] = ths.map((th) => nodeText(th).trim().toLowerCase());
    if (a === "pros" && b === "cons") {
      return <ProsConsPanel>{children}</ProsConsPanel>;
    }
  }
  return (
    <ScrollFade className="mdx-table-wrap">
      <table className="mdx-table">{children}</table>
    </ScrollFade>
  );
}

/* Component registry handed to the MDX compiler. PANEL signature
   components (Step/Note/Caution/Checklist) stay client components —
   they serialize as client references into the static RSC payload and
   hydrate exactly as before. Section/StepList/MdxTable are plain
   markup and render entirely at build time. */
const mdxComponents = {
  Section,
  Step: StepBlock,
  StepList,
  Note: NoteCallout,
  Caution: CautionCallout,
  Checklist,
  table: MdxTable,
};

/* Compile MDX source → ReactNode. Runs during static prerendering; a
   malformed MDX body throws here with the compiler's position info,
   failing the build with a clear error. remarkGfm enables tables,
   task lists and strikethrough — without it those render as literal
   text. rehypeSlug adds anchor ids to markdown headings (## / ### …)
   so TOC chips can link to plain-heading articles too — it never
   overwrites the explicit ids on <Section>-rendered h2s. Components
   are injected through useMDXComponents — the @mdx-js/mdx evaluate
   convention (the compiled body imports them from the runtime
   provider). */
export async function renderMdxBody(source: string): Promise<ReactNode> {
  const { default: MDXContent } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
    useMDXComponents: () => mdxComponents,
  });
  return <MDXContent />;
}
