/*
  GENERATED FILE — DO NOT EDIT DIRECTLY.
  Source of truth: content/articles/*.mdx (frontmatter + MDX bodies).
  Regenerate with: bun run content:gen
  (Runs automatically as part of `bun run dev` / `bun run build:static`.)

  Plain, serializable data only — this module is imported by client
  components through src/lib/content/data.ts, so it must never depend
  on node:fs, zod or the MDX compiler. Article bodies are compiled
  separately at build time (src/lib/content/mdx.tsx).
*/
import type { ArticleMeta } from "../types";

export const articles: ArticleMeta[] = [
  {
    "code": "FIX-001",
    "slug": "ddj-flx4-no-sound",
    "title": "DDJ-FLX4 outputs no sound — a 7-step diagnostic",
    "description": "Methodical troubleshooting for the most common DDJ-FLX4 audio-output failures, from cable to driver to routing.",
    "category": "fix",
    "topic": "ddj-flx4",
    "tags": [
      "pioneer",
      "ddj-flx4",
      "audio",
      "troubleshooting"
    ],
    "publishedDate": "2025-01-12",
    "updatedDate": "2025-01-20",
    "lastVerified": "2025-01-20",
    "author": "BeatGuider Team",
    "contentType": "guide",
    "experienceType": "hands-on",
    "ownershipStatus": "owned",
    "tested": {
      "equipment": [
        "Pioneer DDJ-FLX4 (owned, GEAR-014)"
      ],
      "software": [
        "rekordbox 6.8.x"
      ],
      "platforms": [
        "macOS 14",
        "Windows 11"
      ],
      "environment": "Home studio, USB-C direct, monitor speakers + headphones"
    },
    "quickAnswer": "If your DDJ-FLX4 produces no sound, the fault is almost always one of: USB cable, audio routing in the DJ app, system output device, or a firmware/driver mismatch. Walk these seven checks in order before assuming hardware failure — the controller itself is the least likely cause.",
    "verdict": {
      "title": "Diagnostic verdict",
      "meta": [
        "diagnostic",
        "verified"
      ],
      "rows": [
        {
          "label": "Most likely cause",
          "value": "OS / DJ app routing (≈65%)"
        },
        {
          "label": "Second most likely",
          "value": "USB cable / port (≈20%)"
        },
        {
          "label": "Firmware / driver",
          "value": "≈10%"
        },
        {
          "label": "Hardware fault",
          "value": "<5%"
        },
        {
          "label": "Time to resolve",
          "value": "10–25 min"
        }
      ]
    },
    "difficulty": "Beginner — no special tools",
    "estimatedTime": "10–25 minutes",
    "relatedArticles": [
      "ddj-flx2-vs-ddj-flx4"
    ],
    "relatedGear": [
      "GEAR-014"
    ],
    "sources": [
      {
        "title": "Pioneer DJ DDJ-FLX4 owner's manual — audio connections",
        "url": "https://www.pioneerdj.com/",
        "date": "2023"
      },
      {
        "title": "rekordbox manual — audio settings",
        "url": "https://rekordbox.com/",
        "date": "2024"
      },
      {
        "title": "BeatGuider lab notes — DDJ-FLX4 (owned unit)",
        "date": "2025-01"
      }
    ],
    "affiliateEligible": true,
    "wordCount": 484,
    "readingTime": 2
  },
  {
    "code": "GEAR-018",
    "slug": "ddj-flx4-review",
    "title": "Pioneer DDJ-FLX4 — long-term hands-on review",
    "description": "Owned-unit review of Pioneer's entry-level controller after six months of regular gigging and home practice.",
    "category": "gear",
    "topic": "controllers",
    "tags": [
      "pioneer",
      "ddj-flx4",
      "review"
    ],
    "publishedDate": "2025-01-08",
    "updatedDate": "2025-01-18",
    "lastVerified": "2025-01-18",
    "author": "BeatGuider Team",
    "contentType": "review",
    "experienceType": "long-term-owned",
    "ownershipStatus": "owned",
    "tested": {
      "equipment": [
        "Pioneer DDJ-FLX4 (owned, 6+ months)"
      ],
      "software": [
        "rekordbox 6.8.x"
      ],
      "platforms": [
        "macOS 14",
        "Windows 11"
      ],
      "environment": "Home studio + small mobile gigs"
    },
    "relatedArticles": [
      "ddj-flx4-no-sound",
      "ddj-flx2-vs-ddj-flx4"
    ],
    "relatedGear": [
      "GEAR-014"
    ],
    "affiliateEligible": true,
    "wordCount": 345,
    "readingTime": 2
  },
  {
    "code": "CMP-003",
    "slug": "ddj-flx2-vs-ddj-flx4",
    "title": "DDJ-FLX2 vs DDJ-FLX4 — which beginner controller?",
    "description": "Spec-identical on paper, materially different in the hand. Here is where they actually differ.",
    "category": "compare",
    "topic": "controllers",
    "tags": [
      "pioneer",
      "comparison",
      "beginner"
    ],
    "publishedDate": "2025-01-15",
    "lastVerified": "2025-01-15",
    "author": "BeatGuider Team",
    "contentType": "comparison",
    "experienceType": "hands-on",
    "ownershipStatus": "owned",
    "tested": {
      "equipment": [
        "Pioneer DDJ-FLX4 (owned)",
        "Pioneer DDJ-FLX2 (specs verified, not owned)"
      ],
      "software": [
        "rekordbox"
      ],
      "platforms": [
        "macOS 14"
      ],
      "environment": "Side-by-side on test bench"
    },
    "quickAnswer": "The DDJ-FLX4 is the larger, more gig-ready controller with bigger jog wheels and a proper layout. The DDJ-FLX2 is the genuinely portable sibling at lower cost. If you plan to gig out of a backpack, FLX2. If you mix at home or want room to grow, FLX4.",
    "relatedArticles": [
      "ddj-flx4-review",
      "ddj-flx4-no-sound"
    ],
    "relatedGear": [
      "GEAR-014",
      "GEAR-015"
    ],
    "affiliateEligible": true,
    "wordCount": 150,
    "readingTime": 1
  },
  {
    "code": "SW-008",
    "slug": "rekordbox-export-usb",
    "title": "rekordbox USB export — the correct way (and the silent failures)",
    "description": "Why your rekordbox export sometimes works on one CDJ and stalls on another, and how to export once correctly.",
    "category": "software",
    "topic": "rekordbox",
    "tags": [
      "rekordbox",
      "usb",
      "export"
    ],
    "publishedDate": "2025-01-10",
    "lastVerified": "2025-01-14",
    "author": "BeatGuider Team",
    "contentType": "guide",
    "experienceType": "software-tested",
    "tested": {
      "equipment": [
        "Pioneer CDJ-3000 (loaned, gig venue)"
      ],
      "software": [
        "rekordbox 6.8.x"
      ],
      "platforms": [
        "macOS 14"
      ],
      "environment": "USB export verification at venue"
    },
    "relatedGear": [
      "GEAR-014"
    ],
    "wordCount": 230,
    "readingTime": 1
  },
  {
    "code": "LEARN-021",
    "slug": "first-30-minutes",
    "title": "Your first 30 minutes behind the decks",
    "description": "A structured first-session plan that takes a total beginner from plugging in to their first transition.",
    "category": "learn",
    "topic": "fundamentals",
    "tags": [
      "beginner",
      "technique",
      "first-session"
    ],
    "publishedDate": "2025-01-05",
    "lastVerified": "2025-01-05",
    "author": "BeatGuider Team",
    "contentType": "explainer",
    "experienceType": "research-based",
    "wordCount": 198,
    "readingTime": 1
  },
  {
    "code": "LEARN-022",
    "slug": "eq-mixing-basics",
    "title": "EQ mixing: the one skill that separates beginners from working DJs",
    "description": "Why gain-staging and EQ swaps beat fancy transitions for the first hundred hours of practice.",
    "category": "learn",
    "topic": "technique",
    "tags": [
      "eq",
      "mixing",
      "technique"
    ],
    "publishedDate": "2025-01-06",
    "lastVerified": "2025-01-06",
    "author": "BeatGuider Team",
    "contentType": "explainer",
    "experienceType": "research-based",
    "wordCount": 223,
    "readingTime": 1
  },
  {
    "code": "FIX-002",
    "slug": "rekordbox-crash-on-export",
    "title": "rekordbox crashes mid-export — diagnose in 5 steps",
    "description": "The five failure modes that cause rekordbox to die during USB export, and the order to rule them out.",
    "category": "fix",
    "topic": "rekordbox",
    "tags": [
      "rekordbox",
      "crash",
      "export",
      "troubleshooting"
    ],
    "publishedDate": "2025-01-11",
    "lastVerified": "2025-01-14",
    "author": "BeatGuider Team",
    "contentType": "guide",
    "experienceType": "software-tested",
    "tested": {
      "equipment": [
        "MacBook Pro M2 (test bench)"
      ],
      "software": [
        "rekordbox 6.8.x"
      ],
      "platforms": [
        "macOS 14"
      ],
      "environment": "Reproducible crash lab"
    },
    "quickAnswer": "rekordbox export crashes almost always trace back to a corrupt track in the playlist, a USB drive with the wrong file system, or a permissions issue after a macOS upgrade. Rule these out in this order before reinstalling anything.",
    "wordCount": 287,
    "readingTime": 1
  },
  {
    "code": "MOB-004",
    "slug": "mobile-dj-power-checklist",
    "title": "Mobile DJ power: the gig-day checklist that prevents silence",
    "description": "What to verify about the venue's power before you plug a single thing in — written from a working DJ's gig bag.",
    "category": "mobile-dj",
    "topic": "power",
    "tags": [
      "mobile-dj",
      "power",
      "checklist",
      "gigging"
    ],
    "publishedDate": "2025-01-09",
    "lastVerified": "2025-01-09",
    "author": "BeatGuider Team",
    "contentType": "business",
    "experienceType": "long-term-owned",
    "ownershipStatus": "owned",
    "tested": {
      "equipment": [
        "Various gig rigs (owned)"
      ],
      "software": [],
      "platforms": [],
      "environment": "Multiple real gig venues, 2022-2024"
    },
    "wordCount": 190,
    "readingTime": 1
  }
];
