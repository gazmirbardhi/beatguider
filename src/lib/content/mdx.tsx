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

  Plus standard markdown: paragraphs, lists, inline code, links, images.
*/

import type { ReactNode } from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import {
  StepBlock,
  NoteCallout,
  CautionCallout,
  Checklist,
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

/* Component registry handed to the MDX compiler. PANEL signature
   components (Step/Note/Caution/Checklist) stay client components —
   they serialize as client references into the static RSC payload and
   hydrate exactly as before. Section/StepList are plain markup and
   render entirely at build time. */
const mdxComponents = {
  Section,
  Step: StepBlock,
  StepList,
  Note: NoteCallout,
  Caution: CautionCallout,
  Checklist,
};

/* Compile MDX source → ReactNode. Runs during static prerendering; a
   malformed MDX body throws here with the compiler's position info,
   failing the build with a clear error. Components are injected through
   useMDXComponents — the @mdx-js/mdx evaluate convention (the compiled
   body imports them from the runtime provider). */
export async function renderMdxBody(source: string): Promise<ReactNode> {
  const { default: MDXContent } = await evaluate(source, {
    ...runtime,
    useMDXComponents: () => mdxComponents,
  });
  return <MDXContent />;
}
