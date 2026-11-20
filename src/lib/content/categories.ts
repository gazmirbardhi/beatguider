/*
  BeatGuider category registry — THE single source of truth for the
  blog's content categories. Pure data (client-safe: no fs, no zod).

  ─── How to ADD a category ───
  1. Add a CategoryDef entry below (id must be a kebab-case URL slug).
  2. Create the route pair src/app/<id>/page.tsx + src/app/<id>/[slug]/page.tsx
     (copy an existing category pair — both are 10-line files calling the
     shared factories in render-article.tsx / CategoryIndex).
  3. Ship at least one article with `category: "<id>"` in its frontmatter.

  ─── How to REMOVE a category ───
  1. Delete the CategoryDef entry (and the route pair).
  2. Re-file or delete the articles that referenced it — the content
     loader fails the build on an unknown category, so nothing can
     silently disappear.

  Everything else derives from this registry automatically: the nav bar,
  the footer columns, the homepage category browser (grouped articles),
  the sitemap, breadcrumbs, JSON-LD section names and OG images.
  Categories with zero articles are hidden from the homepage browser
  and category listing (the route itself still renders its empty state).

  Order note: the array order = homepage category-browser order and
  sitemap order. `navOrder` separately controls the sticky nav (nav is
  width-constrained, so it can be a subset).
*/

export type CategoryId =
  | "fix"
  | "gear"
  | "software"
  | "learn"
  | "mobile-dj"
  | "compare";

export type CategoryDef = {
  /** URL slug — also the article frontmatter `category` value. */
  id: CategoryId;
  /** Display name ("Mobile DJ"). */
  name: string;
  /** Category-page kicker, shown next to the entry count. */
  kicker: string;
  /** One-liner for homepage cards + nav tooltips. */
  short: string;
  /** Category page hero description. */
  description: string;
  /** <title> / OG title for the category index page. */
  metaTitle: string;
  /** Meta description for the category index page. */
  metaDescription: string;
  /** OG card for the category index page. */
  ogImage: string;
  /** Position in the sticky nav (omit to keep a category out of the nav). */
  navOrder?: number;
};

export const CATEGORIES: CategoryDef[] = [
  {
    id: "fix",
    name: "Fix",
    kicker: "troubleshooting",
    short: "Step-by-step diagnostics for DJ hardware and software problems.",
    description:
      "Methodical troubleshooting for DJ hardware and software. Diagnostics, not guesses — walk the signal chain in failure-probability order.",
    metaTitle: "Fix — DJ troubleshooting guides",
    metaDescription:
      "Methodical DJ hardware and software troubleshooting. Step-by-step diagnostics in failure-probability order — walk the signal chain, don't guess.",
    ogImage: "/og/ddj-flx4-no-sound.png",
    navOrder: 3,
  },
  {
    id: "gear",
    name: "Gear",
    kicker: "hands-on testing",
    short: "Hands-on equipment reviews with real specs and VU ratings.",
    description:
      "Hands-on DJ equipment testing. Ratings render as VU meters and are emitted only from real test data — never fabricated.",
    metaTitle: "Gear — DJ equipment reviews",
    metaDescription:
      "Hands-on DJ equipment reviews with real specs and VU ratings. Owned-unit, long-term testing of controllers and gear — no fabricated reviews.",
    ogImage: "/og/gear-ddj-flx4.png",
    navOrder: 1,
  },
  {
    id: "software",
    name: "Software",
    kicker: "software guides",
    short: "rekordbox, Serato and the tools that run the signal chain.",
    description:
      "DJ software guides — rekordbox, Serato, and the tools that run the signal chain. Software-tested, not guessed.",
    metaTitle: "Software — DJ software guides",
    metaDescription:
      "DJ software guides for rekordbox, Serato and the tools that run the signal chain. Software-tested walkthroughs, not guesses.",
    ogImage: "/og/rekordbox-export-usb.png",
    navOrder: 2,
  },
  {
    id: "learn",
    name: "Learn",
    kicker: "technique",
    short: "Practical technique guides from a working DJ's practice room.",
    description:
      "Practical DJ technique guides written from a working DJ's practice room. Research-based, no fake expertise.",
    metaTitle: "Learn — DJ technique guides",
    metaDescription:
      "Practical DJ technique guides written from a working DJ's practice room — EQ mixing, first sessions, transitions. Research-based, no fake expertise.",
    ogImage: "/og/first-30-minutes.png",
    navOrder: 4,
  },
  {
    id: "mobile-dj",
    name: "Mobile DJ",
    kicker: "business · gigging",
    short: "Power, routing, contracts, transport and backup rigs.",
    description:
      "Mobile DJ content covers the gig-day reality: power, routing, contracts, transport, backup rigs. Written from a working DJ's gig bag.",
    metaTitle: "Mobile DJ — gigging & business guides",
    metaDescription:
      "Mobile DJ business and gigging guides — power, routing, contracts, transport and backup rigs, written from a working DJ's gig bag.",
    ogImage: "/og/mobile-dj-power-checklist.png",
    navOrder: 6,
  },
  {
    id: "compare",
    name: "Compare",
    kicker: "comparisons",
    short: "Side-by-side gear comparisons with real verdicts.",
    description:
      "Side-by-side DJ gear comparisons. Each comparison has unique analysis and a real verdict — no auto-generated thin pages.",
    metaTitle: "Compare — DJ gear comparisons",
    metaDescription:
      "Side-by-side DJ gear comparisons with real verdicts. Unique analysis per comparison — no auto-generated thin pages.",
    ogImage: "/og/ddj-flx2-vs-ddj-flx4.png",
    navOrder: 5,
  },
];

/* URL-slug list for validators (frontmatter category enum). */
export const CATEGORY_IDS = Object.freeze(
  CATEGORIES.map((c) => c.id)
) as readonly CategoryId[];

export function getCategory(id: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

/* Display name ("Mobile DJ") — falls back to the raw id. */
export function categoryName(id: string): string {
  return getCategory(id)?.name ?? id;
}

/* Sticky-nav items, derived: only categories with a navOrder, in order. */
export function navCategories(): { label: string; href: string }[] {
  return CATEGORIES.filter((c) => c.navOrder !== undefined)
    .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0))
    .map((c) => ({ label: c.name, href: `/${c.id}` }));
}
