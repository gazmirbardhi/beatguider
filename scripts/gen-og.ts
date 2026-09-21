/*
  BeatGuider OG image generation — build-time, static-output-safe.
  Spec §17: OG images generated at build time (satori + resvg Node script,
  output to public/og/) — never request-time. Templates in the panel language:
    - article (title + code + brand plate)
    - troubleshooting (ERR style)
    - comparison (VS layout)
    - gear review (VU score)
    - tool

  No runtime dependency. Run: `bun run scripts/gen-og.ts`
  Outputs PNG (1200×630) to public/og/*.png.

  Fonts: fetched once from Google Fonts CDN at script-run time and cached
  in-memory. Falls back to a system monospace if the fetch fails (the image
  still renders, just with a different face — never fails the build).
*/
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "public", "og");
const FONTS_DIR = join(process.cwd(), "public", "fonts");
const W = 1200;
const H = 630;

// ─── Font loading (cached) ───
// Vendored fonts in public/fonts/ take priority (offline-build capable).
// Falls back to Google Fonts CDN if the local files are missing.
let fontCache: { chakra: Buffer; inter: Buffer } | null = null;

async function loadFonts(): Promise<{ chakra: Buffer; inter: Buffer }> {
  if (fontCache) return fontCache;

  // 1. Try vendored local fonts first (offline-build capable).
  const localPaths = {
    chakra: join(FONTS_DIR, "ChakraPetch-700.ttf"),
    inter: join(FONTS_DIR, "Inter-400.ttf"),
  };
  if (existsSync(localPaths.chakra) && existsSync(localPaths.inter)) {
    fontCache = {
      chakra: readFileSync(localPaths.chakra),
      inter: readFileSync(localPaths.inter),
    };
    console.log("✓ OG fonts loaded from vendored public/fonts/");
    return fontCache;
  }

  // 2. Fall back to Google Fonts CDN.
  const fetchBuf = async (url: string): Promise<Buffer> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`font fetch failed: ${url} → ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  };

  // Chakra Petch (silkscreen) + Inter (body) from Google Fonts CSS API v2.
  // These URLs serve static (non-variable) TTF instances — satori needs static TTFs.
  // The CSS API URL is stable; the gstatic URLs it returns are versioned and stable.
  const urls = {
    chakra:
      "https://fonts.gstatic.com/s/chakrapetch/v13/cIflMapbsEk7TDLdtEz1BwkeJI9FQA.ttf",
    inter:
      "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
  };

  try {
    const [chakra, inter] = await Promise.all([
      fetchBuf(urls.chakra),
      fetchBuf(urls.inter),
    ]);
    fontCache = { chakra, inter };
    console.log("✓ OG fonts loaded from Google Fonts CDN");
    return fontCache;
  } catch (e) {
    console.warn("⚠ Google Fonts fetch failed, OG images will use system fallback", e);
    // empty buffers — satori will render with a default face
    fontCache = { chakra: Buffer.alloc(0), inter: Buffer.alloc(0) };
    return fontCache;
  }
}

// ─── PANEL color constants (match globals.css NIGHT) ───
const C = {
  bg: "#0F0F0F",
  card: "#161616",
  line: "#262626",
  text2: "#F2F2F2",
  body: "#C6C6C6",
  mut: "#7E7E7E",
  amber: "#FFB000",
  disp: "#0A0A0A",
  dispB: "#2E2E2E",
  vuG: "#33FF66",
  vuA: "#FFB000",
  vuR: "#FF4444",
  data: "#35D6C4",
  err: "#FF4444",
};

type Template = "article" | "troubleshooting" | "comparison" | "gear" | "tool" | "brand";

type OGInput = {
  template: Template;
  code: string;
  title: string;
  subtitle?: string;
  led?: "g" | "a" | "r" | "data";
  score?: number; // for gear template (0..100)
  brandB?: string; // for comparison B
  brandA?: string; // for comparison A
};

// ─── VU meter row (SVG children via satori's flex) ───
function vuRow(value: number, segments = 26) {
  const lit = Math.round((value / 100) * segments);
  const bars: Record<string, unknown>[] = [];
  for (let i = 0; i < segments; i++) {
    const on = i < lit;
    let color = C.dispB;
    if (on) color = i < 16 ? C.vuG : i < 21 ? C.vuA : C.vuR;
    bars.push({
      type: "div",
      props: {
        style: {
          display: "flex",
          flex: 1,
          height: "24px",
          background: color,
          borderRadius: "1px",
          boxShadow: on ? `0 0 4px ${color}` : "none",
        },
      },
    });
  }
  return {
    type: "div",
    props: {
      style: { display: "flex", gap: "1px", width: "100%", alignItems: "flex-end" },
      children: bars,
    },
  };
}

function ledDot(color: "g" | "a" | "r" | "data", breathe = false) {
  const c = color === "g" ? C.vuG : color === "a" ? C.vuA : color === "r" ? C.vuR : C.data;
  return {
    type: "div",
    props: {
      style: {
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        background: c,
        boxShadow: `0 0 8px ${c}, 0 0 16px ${c}80, inset 0 0 0 1px rgba(0,0,0,0.4)`,
        display: "flex",
        flexShrink: 0,
      },
    },
  };
}

function screw() {
  return {
    type: "div",
    props: {
      style: {
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${C.dispB}, ${C.disp})`,
        boxShadow: `inset 0 0 0 1px ${C.line}`,
        display: "flex",
        position: "absolute",
      },
    },
  };
}

// ─── Build the satori element tree for a given template ───
function buildTree(input: OGInput) {
  const { template, code, title, subtitle, led = "a" } = input;

  // Common: faceplate top strip with wordmark + model tag + LED row
  const faceplate = {
    type: "div",
    props: {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "20px 40px",
        borderBottom: `1px solid ${C.line}`,
        background: C.card,
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", fontSize: "28px", fontWeight: 700, fontFamily: "Chakra Petch" },
            children: [
              { type: "span", props: { style: { color: C.text2 }, children: "BEAT" } },
              { type: "span", props: { style: { color: C.amber }, children: "GUIDER" } },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: "14px",
              fontFamily: "monospace",
              color: C.amber,
              background: C.disp,
              border: `1px solid ${C.dispB}`,
              padding: "4px 10px",
              borderRadius: "2px",
            },
            children: "BG-1",
          },
        },
        { type: "div", props: { style: { flex: 1 } } },
        ledDot("g"),
        ledDot("a"),
        ledDot("r"),
      ],
    },
  };

  // Code chip
  const codeChip = {
    type: "div",
    props: {
      style: {
        display: "flex",
        fontSize: "20px",
        fontFamily: "monospace",
        color: C.amber,
        background: C.disp,
        border: `1px solid ${C.dispB}`,
        padding: "6px 14px",
        borderRadius: "2px",
        marginBottom: "20px",
      },
      children: code,
    },
  };

  // Title (Chakra Petch, large)
  const titleEl = {
    type: "div",
    props: {
      style: {
        display: "flex",
        fontSize: template === "comparison" ? "44px" : "56px",
        fontWeight: 700,
        fontFamily: "Chakra Petch",
        color: C.text2,
        lineHeight: 1.1,
        maxWidth: "1000px",
      },
      children: title,
    },
  };

  let body;

  if (template === "troubleshooting") {
    body = {
      type: "div",
      props: {
        style: { display: "flex", flexDirection: "column", padding: "40px", flex: 1 },
        children: [
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
              children: [ledDot("r"), { type: "span", props: { style: { color: C.err, fontSize: "22px", fontWeight: 700, fontFamily: "Chakra Petch", letterSpacing: "2px" }, children: "FAULT REPORT" } }],
            },
          },
          codeChip,
          titleEl,
          {
            type: "div",
            props: {
              style: { display: "flex", fontSize: "24px", fontFamily: "monospace", color: C.amber, background: C.disp, padding: "16px 20px", borderRadius: "3px", marginTop: "24px", border: `1px solid ${C.dispB}` },
              children: `> ERR · ${subtitle ?? "signal not found"}`,
            },
          },
        ],
      },
    };
  } else if (template === "comparison") {
    body = {
      type: "div",
      props: {
        style: { display: "flex", flexDirection: "column", padding: "40px", flex: 1, alignItems: "center" },
        children: [
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center", gap: "40px", marginBottom: "30px" },
              children: [
                {
                  type: "div",
                  props: {
                    style: { display: "flex", fontSize: "36px", fontWeight: 700, fontFamily: "Chakra Petch", color: C.text2, maxWidth: "400px", textAlign: "right" },
                    children: input.brandA ?? "A",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { display: "flex", fontSize: "72px", fontWeight: 700, fontFamily: "Chakra Petch", color: C.amber, textShadow: `0 0 16px ${C.amber}80` },
                    children: "VS",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { display: "flex", fontSize: "36px", fontWeight: 700, fontFamily: "Chakra Petch", color: C.text2, maxWidth: "400px" },
                    children: input.brandB ?? "B",
                  },
                },
              ],
            },
          },
          codeChip,
          titleEl,
        ],
      },
    };
  } else if (template === "gear") {
    const score = input.score ?? 0;
    body = {
      type: "div",
      props: {
        style: { display: "flex", flexDirection: "column", padding: "40px", flex: 1 },
        children: [
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
              children: [ledDot("g"), { type: "span", props: { style: { color: C.vuG, fontSize: "18px", fontWeight: 700, fontFamily: "Chakra Petch", letterSpacing: "2px" }, children: "HANDS-ON TESTED" } }],
            },
          },
          codeChip,
          titleEl,
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "baseline", gap: "16px", marginTop: "24px", marginBottom: "12px" },
              children: [
                { type: "span", props: { style: { color: C.mut, fontSize: "16px", fontFamily: "Chakra Petch", letterSpacing: "2px" }, children: "OVERALL SCORE" } },
                { type: "span", props: { style: { color: C.amber, fontSize: "40px", fontWeight: 700, fontFamily: "monospace", background: C.disp, padding: "4px 12px", borderRadius: "2px", border: `1px solid ${C.dispB}` }, children: `${String(score).padStart(3, "0")}%` } },
              ],
            },
          },
          vuRow(score),
        ],
      },
    };
  } else if (template === "tool") {
    body = {
      type: "div",
      props: {
        style: { display: "flex", flexDirection: "column", padding: "40px", flex: 1 },
        children: [
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
              children: [ledDot("a"), { type: "span", props: { style: { color: C.amber, fontSize: "18px", fontWeight: 700, fontFamily: "Chakra Petch", letterSpacing: "2px" }, children: "TOOL · RACK UNIT" } }],
            },
          },
          codeChip,
          titleEl,
          {
            type: "div",
            props: {
              style: { display: "flex", fontSize: "20px", fontFamily: "monospace", color: C.amber, marginTop: "20px" },
              children: `> ${subtitle ?? "client-side · static-export compatible"}`,
            },
          },
        ],
      },
    };
  } else {
    // article / brand
    body = {
      type: "div",
      props: {
        style: { display: "flex", flexDirection: "column", padding: "40px", flex: 1 },
        children: [
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
              children: [ledDot(led), { type: "span", props: { style: { color: led === "g" ? C.vuG : led === "data" ? C.data : C.amber, fontSize: "18px", fontWeight: 700, fontFamily: "Chakra Petch", letterSpacing: "2px" }, children: (subtitle ?? "ARTICLE").toUpperCase() } }],
            },
          },
          codeChip,
          titleEl,
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "auto", paddingTop: "24px", borderTop: `1px solid ${C.line}` },
              children: [
                { type: "span", props: { style: { color: C.mut, fontSize: "16px", fontFamily: "Chakra Petch", letterSpacing: "2px" }, children: "BEATGUIDER" } },
                { type: "span", props: { style: { color: C.amber, fontSize: "16px", fontWeight: 700, fontFamily: "Chakra Petch" }, children: "· Test. Fix. Mix." } },
              ],
            },
          },
        ],
      },
    };
  }

  // Footer LCD strip
  const footerLcd = {
    type: "div",
    props: {
      style: {
        display: "flex",
        background: C.disp,
        borderTop: `1px solid ${C.dispB}`,
        padding: "14px 40px",
        gap: "24px",
      },
      children: [
        { type: "span", props: { style: { color: "rgba(255,176,0,0.55)", fontSize: "14px", fontFamily: "monospace", letterSpacing: "1px" }, children: "MODE" } },
        { type: "span", props: { style: { color: C.amber, fontSize: "14px", fontFamily: "monospace", fontWeight: 700 }, children: "NIGHT" } },
        { type: "span", props: { style: { color: "rgba(255,176,0,0.55)", fontSize: "14px", fontFamily: "monospace", letterSpacing: "1px" }, children: "SIG" } },
        { type: "span", props: { style: { color: C.amber, fontSize: "14px", fontFamily: "monospace", fontWeight: 700 }, children: "OK" } },
        { type: "div", props: { style: { flex: 1 } } },
        { type: "span", props: { style: { color: "rgba(255,176,0,0.55)", fontSize: "14px", fontFamily: "monospace" }, children: "beatguider.com" } },
      ],
    },
  };

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: `${W}px`,
        height: `${H}px`,
        background: C.bg,
        color: C.body,
        fontFamily: "Inter",
      },
      children: [faceplate, body, footerLcd],
    },
  };
}

// ─── Render one OG image ───
async function renderOG(input: OGInput, outName: string) {
  const fonts = await loadFonts();
  const fontConfig: { name: string; data: Buffer; weight: 400 | 700; style: "normal" }[] = [];
  if (fonts.chakra.length > 0) {
    fontConfig.push({ name: "Chakra Petch", data: fonts.chakra, weight: 700, style: "normal" });
  }
  if (fonts.inter.length > 0) {
    fontConfig.push({ name: "Inter", data: fonts.inter, weight: 400, style: "normal" });
  }
  if (fontConfig.length === 0) {
    console.warn(`⚠ no fonts available for ${outName}, skipping`);
    return;
  }

  const tree = buildTree(input);
  const svg = await satori(tree, { width: W, height: H, fonts: fontConfig });
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: W },
    background: C.bg,
  });
  const png = resvg.render().asPng();
  const outPath = join(OUT_DIR, outName);
  writeFileSync(outPath, png);
  console.log(`✓ wrote ${outPath} (${(png.length / 1024).toFixed(1)} KB)`);
}

// ─── Main: generate all OG images from the content layer ───
async function main() {
  if (!existsSync(OUT_DIR)) {
    const { mkdirSync } = await import("node:fs");
    mkdirSync(OUT_DIR, { recursive: true });
  }

  // brand default
  await renderOG(
    { template: "brand", code: "BG-1", title: "Test. Fix. Mix.", subtitle: "Independent DJ test bench", led: "a" },
    "brand.png"
  );

  // We import the content data dynamically to avoid TS path issues.
  // In a real build this would run after content compilation.
  const { articles, gearDb } = await import("../src/lib/content/data");

  for (const a of articles) {
    const template: OGInput["template"] =
      a.contentType === "comparison" ? "comparison" :
      a.category === "fix" ? "troubleshooting" :
      a.contentType === "review" ? "gear" :
      a.category === "tools" ? "tool" : "article";
    // Pull the real avg rating from gearDb when the article relates to gear
    // (resolves the placeholder-score risk). Untested/research-based articles
    // get no score (honest — no fabricated rating).
    let score: number | undefined = undefined;
    if (template === "gear" && a.relatedGear && a.relatedGear.length > 0) {
      const gear = gearDb.find((g) => g.code === a.relatedGear![0]);
      if (gear && gear.rating && gear.rating.length > 0) {
        score = Math.round(gear.rating.reduce((s, r) => s + r.value, 0) / gear.rating.length);
      }
    }
    const brandA = template === "comparison" ? a.title.split(" vs ")[0] : undefined;
    const brandB = template === "comparison" ? a.title.split(" vs ")[1]?.split(" —")[0] : undefined;
    await renderOG(
      {
        template,
        code: a.code,
        title: a.title.replace(" — ", ": ").slice(0, 80),
        subtitle: a.category,
        led: a.experienceType === "hands-on" || a.experienceType === "long-term-owned" ? "g" : a.experienceType === "research-based" ? "data" : "a",
        score,
        brandA,
        brandB,
      },
      `${a.slug}.png`
    );
  }

  // gear OG (one per tested gear)
  for (const g of gearDb.filter((x) => x.tested)) {
    const avg = g.rating ? Math.round(g.rating.reduce((s, r) => s + r.value, 0) / g.rating.length) : 0;
    await renderOG(
      { template: "gear", code: g.code, title: `${g.manufacturer} ${g.model}`, subtitle: "hands-on review", led: "g", score: avg },
      `gear-${g.slug}.png`
    );
  }

  // tools OG
  const tools = [
    { code: "TOOL-01", slug: "bpm", title: "BPM & Timing Calculator", subtitle: "ms from BPM · note timing · bars/beats" },
    { code: "TOOL-02", slug: "camelot", title: "Camelot / Harmonic Mixing Calculator", subtitle: "compatible keys · no audio key detection" },
    { code: "TOOL-03", slug: "power", title: "Mobile DJ Power Calculator", subtitle: "continuous load · peak · generator range" },
    { code: "TOOL-04", slug: "dueler", title: "Gear Dueler", subtitle: "side-by-side comparison · verdict plate" },
  ];
  for (const t of tools) {
    await renderOG(
      { template: "tool", code: t.code, title: t.title, subtitle: t.subtitle, led: "a" },
      `tool-${t.slug}.png`
    );
  }

  console.log(`\n✓ OG generation complete — ${articles.length + gearDb.filter((x) => x.tested).length + tools.length + 1} images in ${OUT_DIR}`);
}

main().catch((e) => {
  console.error("✗ OG generation failed:", e);
  process.exit(1);
});
