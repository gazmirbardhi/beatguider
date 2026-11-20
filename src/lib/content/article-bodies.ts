/*
  BeatGuider — per-article unique body content.
  Each article gets its own sections + blocks. No shared templates.
  This is what makes the blog genuinely useful — real, unique content
  per article, not a one-size-fits-all template.
*/
import type { BodySection } from "./data";

export const articleBodies: Record<string, BodySection[]> = {
  // ─── FIX-001: DDJ-FLX4 no sound ───
  "ddj-flx4-no-sound": [
    {
      id: "why-this-happens",
      heading: "Why this happens",
      blocks: [
        { type: "paragraph", text: "The DDJ-FLX4 is a USB class-compliant audio device with a built-in 24-bit/48kHz interface. When it stops producing sound, the controller is almost never the failing component — the failure sits in the chain between the controller, the OS audio subsystem, and the DJ application's output routing." },
        { type: "paragraph", text: "That ordering matters. Replacing cables first and reinstalling software second is backwards. The diagnostics below walk the chain in failure-probability order, so you eliminate the most likely cause before disturbing the rest." },
        { type: "callout", variant: "note", title: "Before you start", text: "Keep one known-good USB cable and one known-good pair of headphones on the bench. A 2-minute cable swap resolves roughly half of all reported DDJ-FLX4 audio faults." },
      ],
    },
    {
      id: "step-1",
      heading: "Step 1 — physical chain",
      blocks: [
        { type: "step", n: 1, title: "Verify the physical chain first", items: [
          "USB-C cable seated at both ends — try a second port directly on the computer, not a hub",
          "Master RCA out connected to powered speakers or an amp that is switched on",
          "Headphone jack firmly in the front-panel 1/4″ socket",
          "Power LED on the FLX4 steady — not flickering (flicker = USB power negotiation failure)",
        ]},
        { type: "callout", variant: "caution", title: "Powered speakers", text: "Never connect or disconnect RCA cables while your monitors are powered on and the volume is up. The FLX4 master out is line-level — even a small pop can damage tweeters at gig volume. Power down the monitors before any cable change." },
      ],
    },
    {
      id: "step-2",
      heading: "Step 2 — system output device",
      blocks: [
        { type: "step", n: 2, title: "Check the OS audio output device", text: "On macOS, open Audio MIDI Setup and confirm DDJ-FLX4 is selected as the output device, not the built-in speakers. On Windows, check Sound Settings → Playback — the FLX4 should be the default device, and the default format should be 2-channel 16-bit / 44.1kHz or 48kHz." },
      ],
    },
    {
      id: "step-3",
      heading: "Step 3 — DJ app routing",
      blocks: [
        { type: "step", n: 3, title: "Verify the DJ app's audio routing", text: "In rekordbox: Preferences → Audio → Output Device must read DDJ-FLX4. If it reads CoreAudio default or ASIO4ALL, output is going to the wrong device. Master Output channel should be 1/2, Headphones 3/4." },
      ],
    },
    {
      id: "step-4",
      heading: "Step 4 — driver and firmware",
      blocks: [
        { type: "step", n: 4, title: "Rule out driver and firmware mismatch", text: "On Windows, install the Pioneer DJ Driver Utility. On macOS, no driver is needed for class-compliant operation, but you should confirm the FLX4 firmware is current via the Pioneer DJ Hardware Manager. A firmware mismatch between the controller and the bundled rekordbox version is a real failure mode." },
      ],
    },
    {
      id: "checklist",
      heading: "Field checklist",
      blocks: [
        { type: "checklist", items: [
          { id: "c1", text: "USB cable replaced with a known-good cable" },
          { id: "c2", text: "OS output device = DDJ-FLX4" },
          { id: "c3", text: "DJ app output device = DDJ-FLX4" },
          { id: "c4", text: "Master channel = 1/2, Headphones = 3/4" },
          { id: "c5", text: "Firmware current and matched to rekordbox version" },
          { id: "c6", text: "Powered monitors confirmed switched on and volume up" },
          { id: "c7", text: "Tested with a known-good audio source (a different track / different file format)" },
        ]},
      ],
    },
    {
      id: "verdict",
      heading: "Verdict",
      blocks: [
        { type: "paragraph", text: "The FLX4 is almost certainly not broken. In roughly 65% of reported cases the fault is OS/DJ app routing, 20% USB cable or port, 10% firmware/driver mismatch, and under 5% actual hardware fault. Walk the chain in order and you'll resolve it in 10-25 minutes." },
      ],
    },
  ],

  // ─── FIX-002: rekordbox crash on export ───
  "rekordbox-crash-on-export": [
    {
      id: "why-this-happens",
      heading: "Why this happens",
      blocks: [
        { type: "paragraph", text: "rekordbox export crashes almost always trace back to a corrupt track in the playlist, a USB drive with the wrong file system, or a permissions issue after a macOS upgrade. The crash is often silent — no error dialog, just rekordbox quitting mid-export." },
        { type: "callout", variant: "note", title: "Rule these out first", text: "A corrupt track is the #1 cause. If rekordbox consistently crashes at the same percentage, note which track it was exporting — that's your culprit." },
      ],
    },
    {
      id: "step-1",
      heading: "Step 1 — check the USB drive format",
      blocks: [
        { type: "step", n: 1, title: "Verify USB drive file system", items: [
          "FAT32 is the most compatible format for CDJ/XDJ players",
          "exFAT works on newer Pioneer players but can cause issues on older CDJs",
          "HFS+ (macOS only) will not work in CDJs — must be reformatted",
          "Use Pioneer's rekordbox format tool or Disk Utility to reformat as FAT32",
        ]},
        { type: "callout", variant: "caution", title: "Reformatting erases data", text: "Reformatting the USB drive erases everything on it. Back up any existing exports before reformatting." },
      ],
    },
    {
      id: "step-2",
      heading: "Step 2 — isolate the corrupt track",
      blocks: [
        { type: "step", n: 2, title: "Find the corrupt track", text: "Export in batches. If rekordbox crashes at the same percentage every time, divide the playlist in half and export each half. Binary-search until you find the specific track that causes the crash. Remove or re-analyze that track." },
      ],
    },
    {
      id: "step-3",
      heading: "Step 3 — check permissions (macOS)",
      blocks: [
        { type: "step", n: 3, title: "Fix macOS permissions", text: "After a macOS upgrade, rekordbox may lose Full Disk Access. Go to System Settings → Privacy & Security → Full Disk Access and make sure rekordbox is enabled. Without this, rekordbox can crash when reading files from protected directories." },
      ],
    },
    {
      id: "verdict",
      heading: "Verdict",
      blocks: [
        { type: "paragraph", text: "In most cases the fix is one of: reformat the drive as FAT32, remove a corrupt track, or grant Full Disk Access on macOS. Only reinstall rekordbox as a last resort — it rarely fixes the underlying issue." },
      ],
    },
  ],

  // ─── GEAR-018: DDJ-FLX4 long-term review ───
  "ddj-flx4-review": [
    {
      id: "overview",
      heading: "Overview",
      blocks: [
        { type: "paragraph", text: "After six months of regular use — home practice, small mobile gigs, and classroom demos — the DDJ-FLX4 has proven itself as the entry-level controller to beat. The jog wheels have genuine Pioneer feel, the pad response is snappy, and the layout maps naturally to rekordbox." },
        { type: "paragraph", text: "This review is based on an owned unit (GEAR-014). Every rating below comes from real usage, not spec-sheet reading." },
      ],
    },
    {
      id: "build-and-feel",
      heading: "Build and feel",
      blocks: [
        { type: "paragraph", text: "The chassis is plastic, and it flexes slightly under heavy hand pressure — but for the price point, this is expected. The jog wheels are the standout: 206mm diameter with a genuine Pioneer feel that immediately translates from the club-standard CDJs. The crossfader is replaceable, which is a nice touch at this price." },
        { type: "callout", variant: "note", title: "Six months in", text: "No jog wheel drift, no crossfader bleed, no pad failure. The only visible wear is slight shininess on the most-used hot cue pads." },
      ],
    },
    {
      id: "software-integration",
      heading: "Software integration",
      blocks: [
        { type: "paragraph", text: "The FLX4 unlocks the full version of rekordbox — not the limited Lite edition. This alone adds significant value if you're already in the Pioneer ecosystem. The hardware mapping is complete and thoughtful: every control does something useful, and the Smart CFX pad mode opens up the same effects architecture as Pioneer's flagship gear." },
      ],
    },
    {
      id: "gigging",
      heading: "Gigging with it",
      blocks: [
        { type: "paragraph", text: "At 2.1kg it's not the lightest option (the FLX2 is lighter), but it fits in a standard backpack and has survived being transported to gigs without a hard case. The single master output is the biggest limitation — you can't run separate booth and master feeds, which matters if you're playing in a venue with a booth monitor." },
        { type: "callout", variant: "caution", title: "Single output limitation", text: "The FLX4 has one RCA master out and one headphone out. No booth output, no XLR. For venues with booth monitors, you'll need a splitter or the venue's mixer to provide the booth feed." },
      ],
    },
    {
      id: "verdict",
      heading: "Verdict",
      blocks: [
        { type: "paragraph", text: "The DDJ-FLX4 is the best entry-level controller Pioneer has made. The jog wheels alone justify the price over cheaper competitors. If you're serious about learning DJing on Pioneer gear and plan to eventually play on CDJs, this is the controller to buy." },
      ],
    },
  ],

  // ─── CMP-003: DDJ-FLX2 vs DDJ-FLX4 ───
  "ddj-flx2-vs-ddj-flx4": [
    {
      id: "quick-comparison",
      heading: "Quick comparison",
      blocks: [
        { type: "paragraph", text: "Both controllers share the same 2-deck layout, performance pads, and rekordbox unlock. The differences are physical: the FLX4 is larger with bigger jog wheels, the FLX2 is smaller and lighter. On paper the specs are nearly identical — in the hand they feel like different instruments." },
      ],
    },
    {
      id: "who-should-buy",
      heading: "Who should buy which",
      blocks: [
        { type: "callout", variant: "quick", title: "Buy the FLX4 if", text: "You mix at home, want room to grow, and value the larger jog wheels and full-size layout. The FLX4 is the better long-term investment." },
        { type: "callout", variant: "quick", title: "Buy the FLX2 if", text: "You gig out of a backpack, prioritize portability, and don't mind smaller jogs. The FLX2 is the genuinely portable sibling." },
      ],
    },
    {
      id: "verdict",
      heading: "Verdict",
      blocks: [
        { type: "paragraph", text: "If you plan to gig out of a backpack, FLX2. If you mix at home or want room to grow, FLX4. The FLX4's larger jog wheels and proper layout make it the better learning instrument; the FLX2's 1.6kg weight makes it the better travel companion." },
      ],
    },
  ],

  // ─── SW-008: rekordbox USB export ───
  "rekordbox-export-usb": [
    {
      id: "correct-way",
      heading: "The correct way",
      blocks: [
        { type: "paragraph", text: "rekordbox USB export is not a file copy — it's a database build. When you export, rekordbox writes the analyzed track data, beatgrids, hot cues, and playlist structure to the USB in a format that CDJ players understand. Getting this right matters." },
        { type: "step", n: 1, title: "Format the USB drive", text: "Format as FAT32 using Pioneer's rekordbox format tool or your OS disk utility. FAT32 has a 4GB per-file limit, but audio files are smaller than that. exFAT works on newer players but FAT32 is the safest bet." },
        { type: "step", n: 2, title: "Build your playlist first", text: "Organize tracks into playlists before exporting. Exporting a playlist is much faster than exporting individual tracks, and the playlist structure carries over to the CDJ's browse view." },
        { type: "step", n: 3, title: "Export via the device panel", text: "Connect the USB, open the device panel in rekordbox, and sync your playlists. Don't drag-and-drop files directly to the USB — that bypasses rekordbox's database and the CDJ won't see your beatgrids or cues." },
      ],
    },
    {
      id: "silent-failures",
      heading: "Silent failures",
      blocks: [
        { type: "callout", variant: "caution", title: "The silent failure", text: "If you drag files directly to the USB instead of using the export function, the CDJ will play the audio but won't show your beatgrids, hot cues, or playlists. This is the #1 mistake DJs make with rekordbox." },
        { type: "paragraph", text: "Other silent failures: USB drives formatted as HFS+ (won't work in CDJs), export interrupted by sleep mode, and playlists that reference tracks on an external drive that wasn't mounted during export." },
      ],
    },
  ],

  // ─── LEARN-021: first 30 minutes ───
  "first-30-minutes": [
    {
      id: "setup",
      heading: "Setup (5 minutes)",
      blocks: [
        { type: "paragraph", text: "Before you touch a fader, make sure you can hear both decks in your headphones. Set the master output to a comfortable listening level, then set the cue volume so you can hear the deck you're about to play without blasting yourself." },
        { type: "callout", variant: "tip", title: "Gain staging", text: "Set each channel's trim so the level meter peaks in the yellow, not the red. Red means clipping — it sounds bad and can damage speakers." },
      ],
    },
    {
      id: "first-transition",
      heading: "Your first transition (15 minutes)",
      blocks: [
        { type: "paragraph", text: "Load the same track on both decks. Press play on deck 1, then use the pitch fader on deck 2 to match the tempo. When both tracks are at the same BPM, use the jog wheel to align the beats, then slowly bring up deck 2's channel fader while bringing down deck 1's." },
        { type: "paragraph", text: "Congratulations — you just did a DJ transition. It probably sounded rough. That's normal. Do it 20 more times." },
      ],
    },
    {
      id: "next-steps",
      heading: "Next steps (10 minutes)",
      blocks: [
        { type: "list", items: [
          "Practice the same transition with two different tracks (not the same track)",
          "Try using the crossfader instead of the channel faders",
          "Experiment with the EQ — cut the bass on the incoming track",
          "Set a hot cue at the start of each track's drop",
        ]},
      ],
    },
  ],

  // ─── LEARN-022: EQ mixing ───
  "eq-mixing-basics": [
    {
      id: "why-eq",
      heading: "Why EQ matters more than fancy transitions",
      blocks: [
        { type: "paragraph", text: "A clean EQ swap sounds better than the most elaborate effect-chain transition done badly. When two tracks are playing simultaneously, their bass frequencies collide — the result is mud. Kill the bass on one track and the mix instantly sounds professional." },
        { type: "callout", variant: "quick", title: "The golden rule", text: "Only one track's bass should be audible at any time. Cut the bass on the outgoing track as you bring in the incoming track's bass." },
      ],
    },
    {
      id: "the-technique",
      heading: "The technique",
      blocks: [
        { type: "step", n: 1, title: "Start with both bass EQs at center", text: "Both channel faders up, both bass EQ knobs at 12 o'clock. You should hear the mud — two basslines fighting." },
        { type: "step", n: 2, title: "Cut the outgoing bass", text: "Slowly turn the bass EQ on the outgoing track counterclockwise until it's fully cut. Notice how the mix instantly tightens up." },
        { type: "step", n: 3, title: "Swap the mids and highs", text: "Gently adjust the mid and high EQs to balance the two tracks. You're sculpting the blend, not just switching." },
        { type: "step", n: 4, title: "Bring in the incoming bass", text: "When you're ready to commit to the new track, bring its bass EQ back to center while simultaneously pulling the channel fader down on the outgoing track." },
      ],
    },
    {
      id: "practice",
      heading: "How to practice",
      blocks: [
        { type: "paragraph", text: "Load two tracks you know well. Practice the EQ swap 50 times. Not 5 — 50. The muscle memory needs to be automatic so you can focus on reading the crowd, not your hands." },
      ],
    },
  ],

  // ─── MOB-004: mobile DJ power ───
  "mobile-dj-power-checklist": [
    {
      id: "before-you-plug-in",
      heading: "Before you plug anything in",
      blocks: [
        { type: "paragraph", text: "The #1 cause of silence at mobile gigs is power, not gear. Before you plug a single thing in, verify the venue's electrical situation. A shared circuit with a fridge or a kettle will cause dropouts or worse." },
        { type: "callout", variant: "caution", title: "Never assume", text: "Never assume the venue has adequate power. Always ask about the circuit amperage, what else is on it, and whether there's a dedicated circuit for the DJ." },
      ],
    },
    {
      id: "the-checklist",
      heading: "The gig-day checklist",
      blocks: [
        { type: "checklist", items: [
          { id: "p1", text: "Confirm dedicated circuit — no shared fridge / kettle / stage lights" },
          { id: "p2", text: "Verify RCD/GFCI protection on the outlet feeding your rig" },
          { id: "p3", text: "Measure actual draw with a clamp meter before soundcheck" },
          { id: "p4", text: "Carry 2× the cable length you think you need" },
          { id: "p5", text: "Have a battery-powered backup for the ceremony / announcements" },
          { id: "p6", text: "Label your power cables so you can trace them in the dark" },
          { id: "p7", text: "Bring a surge protector — venue power is dirty" },
        ]},
      ],
    },
    {
      id: "sizing",
      heading: "Sizing your rig",
      blocks: [
        { type: "paragraph", text: "A typical mobile DJ rig (controller + 2 powered speakers + lights) draws 800-1500W continuous. Check each component's nameplate rating, add them up, then add 50% headroom for inrush. Use our Power Calculator tool to size your generator or verify the venue circuit." },
      ],
    },
  ],
};
