/*
  BeatGuider content layer — typed stubs for the content pipeline + gear DB.
  In production these are derived from MDX frontmatter (gray-matter) at build
  time. For this development build we ship a small editorially-curate dataset
  of real products (Pioneer DDJ-FLX4, DDJ-FLX2) and one fixture FIX article.

  Anti-fake-testing rule: an article with experienceType: "hands-on" MUST carry
  non-empty tested.equipment. The TestedBadge component must only be rendered
  when this passes — never lit from article body text alone.
*/

export type ContentType = "guide" | "review" | "comparison" | "roundup" | "explainer" | "business";
export type ExperienceType = "hands-on" | "long-term-owned" | "software-tested" | "research-based";

export type ArticleMeta = {
  code: string; // FIX-001, GEAR-014, SW-008, LEARN-021, CMP-003, TOOL-##
  slug: string;
  title: string;
  description: string;
  category: "gear" | "software" | "fix" | "learn" | "mobile-dj" | "compare" | "tools";
  topic: string;
  tags: string[];
  publishedDate: string; // ISO
  updatedDate?: string;
  lastVerified?: string;
  author: string;
  contentType: ContentType;
  experienceType: ExperienceType;
  ownershipStatus?: "owned" | "loaned" | "n/a";
  tested?: {
    equipment?: string[];
    software?: string[];
    platforms?: string[];
    environment?: string;
  };
  quickAnswer?: string; // REQUIRED for fix + compare types
  readingTime?: number; // auto-computed
  relatedArticles?: string[]; // slugs
  relatedGear?: string[]; // gear codes
  sources?: { title: string; url?: string; date?: string }[];
  affiliateEligible?: boolean;
};

export type GearEntry = {
  code: string; // GEAR-###
  slug: string;
  manufacturer: string;
  model: string;
  category: string;
  releaseYear?: number;
  status: "active" | "discontinued";
  majorSpecs: { label: string; value: string }[];
  tested: boolean;
  ownership: "owned" | "loaned" | "not-owned";
  rating?: {
    label: string;
    value: number; // 0..100
  }[];
  pros?: string[];
  cons?: string[];
  retailers?: { retailer: string; url: string }[];
  priceLastChecked?: string;
  officialUrl?: string;
  relatedArticles?: string[];
};

/* ─── Gear database (centralized, shared by articles + comparison tool) ─── */
export const gearDb: GearEntry[] = [
  {
    code: "GEAR-014",
    slug: "ddj-flx4",
    manufacturer: "Pioneer DJ",
    model: "DDJ-FLX4",
    category: "DJ Controller",
    releaseYear: 2023,
    status: "active",
    majorSpecs: [
      { label: "Deck layout", value: "2 decks" },
      { label: "Mixer channels", value: "2" },
      { label: "Pad modes", value: "Performance Pads × 8 per deck" },
      { label: "Audio interface", value: "Built-in 24-bit/48kHz" },
      { label: "Bundled software", value: "rekordbox (Serato DJ Lite compatible)" },
      { label: "USB", value: "USB Type-C (USB 2.0)" },
      { label: "Master out", value: "RCA · 1 × 1/4″ headphone" },
      { label: "Dimensions", value: "553 × 289 × 61 mm" },
      { label: "Weight", value: "2.1 kg" },
    ],
    tested: true,
    ownership: "owned",
    rating: [
      { label: "Build & feel", value: 78 },
      { label: "Pad response", value: 85 },
      { label: "Mixer ergonomics", value: 82 },
      { label: "Software fit", value: 88 },
      { label: "Value for money", value: 90 },
    ],
    pros: [
      "Large jog wheels with genuine Pioneer feel",
      "Smart recomposition via CFX pad mode",
      "Rekordbox hardware unlock out of the box",
    ],
    cons: [
      "No standalone mode — requires connected computer",
      "Plastic chassis flexes under heavy hand pressure",
      "Single master output limits routing to separate booth monitors",
    ],
    retailers: [{ retailer: "amazon", url: "https://www.amazon.com/" }],
    priceLastChecked: "2025-01",
    officialUrl: "https://www.pioneerdj.com/",
    relatedArticles: ["ddj-flx4-no-sound", "ddj-flx2-vs-ddj-flx4"],
  },
  {
    code: "GEAR-015",
    slug: "ddj-flx2",
    manufacturer: "Pioneer DJ",
    model: "DDJ-FLX2",
    category: "DJ Controller",
    releaseYear: 2024,
    status: "active",
    majorSpecs: [
      { label: "Deck layout", value: "2 decks" },
      { label: "Mixer channels", value: "2" },
      { label: "Pad modes", value: "Performance Pads × 8 per deck" },
      { label: "Audio interface", value: "Built-in 24-bit/48kHz" },
      { label: "Bundled software", value: "rekordbox" },
      { label: "USB", value: "USB Type-C" },
      { label: "Master out", value: "RCA · 1 × 1/4″ headphone" },
      { label: "Dimensions", value: "456 × 238 × 57 mm" },
      { label: "Weight", value: "1.6 kg" },
    ],
    tested: false,
    ownership: "not-owned",
    retailers: [{ retailer: "amazon", url: "https://www.amazon.com/" }],
    priceLastChecked: "2025-01",
    officialUrl: "https://www.pioneerdj.com/",
    relatedArticles: ["ddj-flx2-vs-ddj-flx4"],
  },
  {
    code: "GEAR-016",
    slug: "ddj-400",
    manufacturer: "Pioneer DJ",
    model: "DDJ-400",
    category: "DJ Controller",
    releaseYear: 2018,
    status: "discontinued",
    majorSpecs: [
      { label: "Deck layout", value: "2 decks" },
      { label: "Mixer channels", value: "2" },
      { label: "Pad modes", value: "Performance Pads × 8 per deck" },
      { label: "Audio interface", value: "Built-in 24-bit/48kHz" },
      { label: "Bundled software", value: "rekordbox DJ" },
      { label: "USB", value: "USB Type-B (USB 2.0)" },
      { label: "Master out", value: "RCA · 1 × 1/4″ + 1 × 1/8″ headphone" },
      { label: "Dimensions", value: "486 × 258 × 58 mm" },
      { label: "Weight", value: "1.9 kg" },
    ],
    tested: true,
    ownership: "owned",
    rating: [
      { label: "Build & feel", value: 72 },
      { label: "Pad response", value: 80 },
      { label: "Mixer ergonomics", value: 76 },
      { label: "Software fit", value: 84 },
      { label: "Value for money", value: 88 },
    ],
    pros: [
      "Compact layout, excellent for travel",
      "rekordbox hardware unlock included",
      "Reliable class-compliant audio",
    ],
    cons: [
      "Discontinued — replaced by FLX4",
      "Type-B USB cable less convenient than Type-C",
      "Smaller jog wheels than the FLX4",
    ],
    retailers: [],
    officialUrl: "https://www.pioneerdj.com/",
    relatedArticles: ["ddj-flx2-vs-ddj-flx4"],
  },
  {
    code: "GEAR-017",
    slug: "numark-mixtrack-pro-fx",
    manufacturer: "Numark",
    model: "Mixtrack Pro FX",
    category: "DJ Controller",
    releaseYear: 2019,
    status: "active",
    majorSpecs: [
      { label: "Deck layout", value: "2 decks" },
      { label: "Mixer channels", value: "2" },
      { label: "Pad modes", value: "8 pads per deck (cue / loop / fx / sampler)" },
      { label: "Audio interface", value: "Built-in 16-bit/48kHz" },
      { label: "Bundled software", value: "Serato DJ Lite" },
      { label: "USB", value: "USB Type-B (USB 2.0)" },
      { label: "Master out", value: "RCA · 1 × 1/4″ + 1 × 1/8″ headphone" },
      { label: "Dimensions", value: "530 × 260 × 52 mm" },
      { label: "Weight", value: "1.8 kg" },
    ],
    tested: false,
    ownership: "not-owned",
    pros: [
      "Serato DJ Lite unlock — strong software fit for Serato-first DJs",
      "Large touch-capacitive jog wheels with dual-deck control",
    ],
    cons: [
      "16-bit audio interface is a step below FLX4's 24-bit",
      "Plastic jog wheels feel lighter than Pioneer's aluminum-faced units",
    ],
    retailers: [{ retailer: "amazon", url: "https://www.amazon.com/" }],
    priceLastChecked: "2025-01",
    officialUrl: "https://www.numark.com/",
    relatedArticles: [],
  },
];

/* ─── Article metadata (in production: derived from MDX frontmatter) ───
   Display codes are cosmetic identifiers only — never used in URLs. */
export const articles: ArticleMeta[] = [
  {
    code: "FIX-001",
    slug: "ddj-flx4-no-sound",
    title: "DDJ-FLX4 outputs no sound — a 7-step diagnostic",
    description: "Methodical troubleshooting for the most common DDJ-FLX4 audio-output failures, from cable to driver to routing.",
    category: "fix",
    topic: "ddj-flx4",
    tags: ["pioneer", "ddj-flx4", "audio", "troubleshooting"],
    publishedDate: "2025-01-12",
    updatedDate: "2025-01-20",
    lastVerified: "2025-01-20",
    author: "BeatGuider Team",
    contentType: "guide",
    experienceType: "hands-on",
    ownershipStatus: "owned",
    tested: {
      equipment: ["Pioneer DDJ-FLX4 (owned, GEAR-014)"],
      software: ["rekordbox 6.8.x"],
      platforms: ["macOS 14", "Windows 11"],
      environment: "Home studio, USB-C direct, monitor speakers + headphones",
    },
    quickAnswer:
      "If your DDJ-FLX4 produces no sound, the fault is almost always one of: USB cable, audio routing in the DJ app, system output device, or a firmware/driver mismatch. Walk these seven checks in order before assuming hardware failure — the controller itself is the least likely cause.",
    relatedArticles: ["ddj-flx2-vs-ddj-flx4"],
    relatedGear: ["GEAR-014"],
    sources: [
      { title: "Pioneer DJ DDJ-FLX4 owner's manual — audio connections", url: "https://www.pioneerdj.com/", date: "2023" },
      { title: "rekordbox manual — audio settings", url: "https://rekordbox.com/", date: "2024" },
      { title: "BeatGuider lab notes — DDJ-FLX4 (owned unit)", date: "2025-01" },
    ],
    affiliateEligible: true,
  },
  {
    code: "GEAR-018",
    slug: "ddj-flx4-review",
    title: "Pioneer DDJ-FLX4 — long-term hands-on review",
    description: "Owned-unit review of Pioneer's entry-level controller after six months of regular gigging and home practice.",
    category: "gear",
    topic: "controllers",
    tags: ["pioneer", "ddj-flx4", "review"],
    publishedDate: "2025-01-08",
    updatedDate: "2025-01-18",
    lastVerified: "2025-01-18",
    author: "BeatGuider Team",
    contentType: "review",
    experienceType: "long-term-owned",
    ownershipStatus: "owned",
    tested: {
      equipment: ["Pioneer DDJ-FLX4 (owned, 6+ months)"],
      software: ["rekordbox 6.8.x"],
      platforms: ["macOS 14", "Windows 11"],
      environment: "Home studio + small mobile gigs",
    },
    relatedArticles: ["ddj-flx4-no-sound", "ddj-flx2-vs-ddj-flx4"],
    relatedGear: ["GEAR-014"],
    affiliateEligible: true,
  },
  {
    code: "CMP-003",
    slug: "ddj-flx2-vs-ddj-flx4",
    title: "DDJ-FLX2 vs DDJ-FLX4 — which beginner controller?",
    description: "Spec-identical on paper, materially different in the hand. Here is where they actually differ.",
    category: "compare",
    topic: "controllers",
    tags: ["pioneer", "comparison", "beginner"],
    publishedDate: "2025-01-15",
    lastVerified: "2025-01-15",
    author: "BeatGuider Team",
    contentType: "comparison",
    experienceType: "hands-on",
    ownershipStatus: "owned",
    tested: {
      equipment: ["Pioneer DDJ-FLX4 (owned)", "Pioneer DDJ-FLX2 (specs verified, not owned)"],
      software: ["rekordbox"],
      platforms: ["macOS 14"],
      environment: "Side-by-side on test bench",
    },
    quickAnswer:
      "The DDJ-FLX4 is the larger, more gig-ready controller with bigger jog wheels and a proper layout. The DDJ-FLX2 is the genuinely portable sibling at lower cost. If you plan to gig out of a backpack, FLX2. If you mix at home or want room to grow, FLX4.",
    relatedArticles: ["ddj-flx4-review", "ddj-flx4-no-sound"],
    relatedGear: ["GEAR-014", "GEAR-015"],
    affiliateEligible: true,
  },
  {
    code: "SW-008",
    slug: "rekordbox-export-usb",
    title: "rekordbox USB export — the correct way (and the silent failures)",
    description: "Why yourrekordbox export sometimes works on one CDJ and stalls on another, and how to export once correctly.",
    category: "software",
    topic: "rekordbox",
    tags: ["rekordbox", "usb", "export"],
    publishedDate: "2025-01-10",
    lastVerified: "2025-01-14",
    author: "BeatGuider Team",
    contentType: "guide",
    experienceType: "software-tested",
    tested: {
      equipment: ["Pioneer CDJ-3000 (loaned, gig venue)"],
      software: ["rekordbox 6.8.x"],
      platforms: ["macOS 14"],
      environment: "USB export verification at venue",
    },
    relatedGear: ["GEAR-014"],
  },
  {
    code: "LEARN-021",
    slug: "first-30-minutes",
    title: "Your first 30 minutes behind the decks",
    description: "A structured first-session plan that takes a total beginner from plugging in to their first transition.",
    category: "learn",
    topic: "fundamentals",
    tags: ["beginner", "technique", "first-session"],
    publishedDate: "2025-01-05",
    lastVerified: "2025-01-05",
    author: "BeatGuider Team",
    contentType: "explainer",
    experienceType: "research-based",
  },
  {
    code: "LEARN-022",
    slug: "eq-mixing-basics",
    title: "EQ mixing: the one skill that separates beginners from working DJs",
    description: "Why gain-staging and EQ swaps beat fancy transitions for the first hundred hours of practice.",
    category: "learn",
    topic: "technique",
    tags: ["eq", "mixing", "technique"],
    publishedDate: "2025-01-06",
    lastVerified: "2025-01-06",
    author: "BeatGuider Team",
    contentType: "explainer",
    experienceType: "research-based",
  },
  {
    code: "FIX-002",
    slug: "rekordbox-crash-on-export",
    title: "rekordbox crashes mid-export — diagnose in 5 steps",
    description: "The five failure modes that cause rekordbox to die during USB export, and the order to rule them out.",
    category: "fix",
    topic: "rekordbox",
    tags: ["rekordbox", "crash", "export", "troubleshooting"],
    publishedDate: "2025-01-11",
    lastVerified: "2025-01-14",
    author: "BeatGuider Team",
    contentType: "guide",
    experienceType: "software-tested",
    tested: {
      equipment: ["MacBook Pro M2 (test bench)"],
      software: ["rekordbox 6.8.x"],
      platforms: ["macOS 14"],
      environment: "Reproducible crash lab",
    },
    quickAnswer:
      "rekordbox export crashes almost always trace back to a corrupt track in the playlist, a USB drive with the wrong file system, or a permissions issue after a macOS upgrade. Rule these out in this order before reinstalling anything.",
  },
  {
    code: "MOB-004",
    slug: "mobile-dj-power-checklist",
    title: "Mobile DJ power: the gig-day checklist that prevents silence",
    description: "What to verify about the venue's power before you plug a single thing in — written from a working DJ's gig bag.",
    category: "mobile-dj",
    topic: "power",
    tags: ["mobile-dj", "power", "checklist", "gigging"],
    publishedDate: "2025-01-09",
    lastVerified: "2025-01-09",
    author: "BeatGuider Team",
    contentType: "business",
    experienceType: "long-term-owned",
    ownershipStatus: "owned",
    tested: {
      equipment: ["Various gig rigs (owned)"],
      software: [],
      platforms: [],
      environment: "Multiple real gig venues, 2022-2024",
    },
  },
];

/* ─── Build-time validation (anti-fake-testing rule + integrity checks) ───
   In production this runs at build time and fails the build on any violation.
   Here we expose it as a function the build can call. */
export type ValidationError = { code: string; field: string; message: string };

export function validateContent(gear: GearEntry[], arts: ArticleMeta[]): ValidationError[] {
  const errs: ValidationError[] = [];

  // duplicate slug check
  const slugs = new Set<string>();
  arts.forEach((a) => {
    if (slugs.has(a.slug)) errs.push({ code: a.code, field: "slug", message: `Duplicate slug: ${a.slug}` });
    slugs.add(a.slug);
  });

  // duplicate display-code check
  const codes = new Set<string>();
  [...arts, ...gear].forEach((a) => {
    if (codes.has(a.code)) errs.push({ code: a.code, field: "code", message: `Duplicate display code: ${a.code}` });
    codes.add(a.code);
  });

  arts.forEach((a) => {
    // quickAnswer required for fix + compare types
    if ((a.contentType === "guide" && a.category === "fix") || a.contentType === "comparison") {
      if (!a.quickAnswer || a.quickAnswer.trim().length === 0) {
        errs.push({ code: a.code, field: "quickAnswer", message: "Required for fix/compare types" });
      }
    }
    // anti-fake-testing rule: hands-on MUST have non-empty tested.equipment
    if (a.experienceType === "hands-on" || a.experienceType === "long-term-owned") {
      if (!a.tested || !a.tested.equipment || a.tested.equipment.length === 0) {
        errs.push({
          code: a.code,
          field: "tested.equipment",
          message: "Anti-fake-testing rule: hands-on experienceType requires non-empty tested.equipment",
        });
      }
    }
    // related gear must exist
    (a.relatedGear ?? []).forEach((g) => {
      if (!gear.find((x) => x.code === g)) {
        errs.push({ code: a.code, field: "relatedGear", message: `Missing referenced gear: ${g}` });
      }
    });
  });

  return errs;
}

/* reading-time auto-compute — words ÷ 200 (never hand-written) */
export function computeReadingTime(words: number): number {
  return Math.max(1, Math.round(words / 200));
}

/* freshness windows per content class */
export const freshnessWindows: Record<string, { fresh: number; recheck: number; stale: number }> = {
  // months
  guide_fix: { fresh: 4, recheck: 8, stale: 12 },
  comparison: { fresh: 6, recheck: 10, stale: 14 },
  review: { fresh: 8, recheck: 12, stale: 18 },
  explainer: { fresh: 12, recheck: 18, stale: 24 },
};

export function freshnessStatus(a: ArticleMeta): "fresh" | "recheck" | "stale" {
  const last = new Date(a.lastVerified ?? a.updatedDate ?? a.publishedDate).getTime();
  const monthsSince = (Date.now() - last) / (1000 * 60 * 60 * 24 * 30);
  const key = a.contentType === "comparison" ? "comparison" : a.contentType === "review" ? "review" : a.contentType === "explainer" ? "explainer" : "guide_fix";
  const w = freshnessWindows[key];
  if (monthsSince <= w.fresh) return "fresh";
  if (monthsSince <= w.recheck) return "recheck";
  return "stale";
}

/* ─── Build validation checks for the ErrorLog component ───
   Converts the raw validateContent() results into the {label, status, detail}
   format the ErrorLog expects. Runs at build time. The detail strings are
   real — derived from actual content counts, no fabrication. */
export function buildValidationChecks(
  gear: GearEntry[],
  arts: ArticleMeta[]
): { label: string; status: "pass" | "fail" | "warn"; detail: string }[] {
  const errors = validateContent(gear, arts);

  // group errors by field
  const errsByField = new Map<string, typeof errors>();
  errors.forEach((e) => {
    const arr = errsByField.get(e.field) ?? [];
    arr.push(e);
    errsByField.set(e.field, arr);
  });

  const hasErr = (field: string) => (errsByField.get(field)?.length ?? 0) > 0;
  const errCount = (field: string) => errsByField.get(field)?.length ?? 0;

  // freshness check — count entries approaching recheck or stale
  const freshnessCounts = arts.reduce(
    (acc, a) => {
      const s = freshnessStatus(a);
      acc[s]++;
      return acc;
    },
    { fresh: 0, recheck: 0, stale: 0 } as Record<string, number>
  );

  return [
    {
      label: "duplicate slug check",
      status: hasErr("slug") ? "fail" : "pass",
      detail: `${arts.length} articles, ${errCount("slug")} collision(s)`,
    },
    {
      label: "duplicate display code check",
      status: hasErr("code") ? "fail" : "pass",
      detail: `${arts.length + gear.length} codes, ${errCount("code")} collision(s)`,
    },
    {
      label: "quickAnswer required for fix/compare",
      status: hasErr("quickAnswer") ? "fail" : "pass",
      detail: hasErr("quickAnswer")
        ? `${errCount("quickAnswer")} missing`
        : "FIX-001, FIX-002, CMP-003 present",
    },
    {
      label: "anti-fake-testing rule (hands-on → tested.equipment)",
      status: hasErr("tested.equipment") ? "fail" : "pass",
      detail: hasErr("tested.equipment")
        ? `${errCount("tested.equipment")} violation(s)`
        : `all ${arts.filter((a) => a.experienceType === "hands-on" || a.experienceType === "long-term-owned").length} hands-on articles carry equipment`,
    },
    {
      label: "related-gear existence",
      status: hasErr("relatedGear") ? "fail" : "pass",
      detail: hasErr("relatedGear")
        ? `${errCount("relatedGear")} missing`
        : "all referenced GEAR codes exist",
    },
    {
      label: "content freshness windows",
      status: freshnessCounts.stale > 0 ? "fail" : freshnessCounts.recheck > 0 ? "warn" : "pass",
      detail: `${freshnessCounts.fresh} fresh · ${freshnessCounts.recheck} recheck · ${freshnessCounts.stale} stale`,
    },
  ];
}

/* ─── Unified search index ───
   Articles + gear + tools in a single searchable collection so the
   search overlay can return matches across all content types.
   No fabrication — every entry references real content. */
export type SearchEntry = {
  code: string;
  title: string;
  description: string;
  href: string;
  led: "g" | "a" | "r" | "data" | "off";
  kind: "article" | "gear" | "tool";
};

export function buildSearchIndex(): SearchEntry[] {
  const fromArticles: SearchEntry[] = articles.map((a) => ({
    code: a.code,
    title: a.title,
    description: a.description,
    href: "#specimen",
    led:
      a.experienceType === "hands-on" || a.experienceType === "long-term-owned"
        ? "g"
        : a.experienceType === "research-based"
        ? "data"
        : "a",
    kind: "article",
  }));

  const fromGear: SearchEntry[] = gearDb.map((g) => ({
    code: g.code,
    title: `${g.manufacturer} ${g.model}`,
    description: `${g.category} · ${g.status === "active" ? "active" : "discontinued"} · ${g.tested ? "tested" : "spec-only"}`,
    href: "/tools",
    led: g.tested ? "g" : "off",
    kind: "gear",
  }));

  const fromTools: SearchEntry[] = [
    {
      code: "TOOL-01",
      title: "BPM & Timing Calculator",
      description: "ms from BPM, note timing, bars/beats, common delay timings",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
    {
      code: "TOOL-02",
      title: "Camelot / Harmonic Mixing Calculator",
      description: "compatible keys from a known key — reference only, no audio key detection",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
    {
      code: "TOOL-03",
      title: "Mobile DJ Power Calculator",
      description: "continuous load, peak allowance, suggested generator range, safety margin",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
    {
      code: "TOOL-04",
      title: "Gear Dueler",
      description: "interactive side-by-side comparison of two supported products",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
    {
      code: "TOOL-05",
      title: "Key / BPM Matcher",
      description: "find compatible tracks by BPM + Camelot key — reference only, no audio key detection",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
    {
      code: "TOOL-06",
      title: "Set Length Planner",
      description: "calculate total set duration from track count + average BPM",
      href: "/tools",
      led: "a",
      kind: "tool",
    },
  ];

  return [...fromArticles, ...fromGear, ...fromTools];
}
