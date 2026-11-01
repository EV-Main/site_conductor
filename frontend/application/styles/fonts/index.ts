import localFont from "next/font/local";

// Self-hosted via next/font (no render-blocking <link> to Google Fonts).
// Each exposes a CSS variable consumed by globals.css / the Tailwind theme.
// Inter is the single neutral workhorse: it backs both the sans body copy and
// the "mono-tech" labels (tracked-out, uppercase) — replacing the former
// Space Grotesk / Space Mono pairing with one quieter, institutional grotesque.
// Self-hosted from the variable font (not next/font/google) so the production
// image builds hermetically — no Google fetch in the nix sandbox.
//
// The files are subset .woff2, not the upstream .ttf: the raw variable TTFs are
// 5.0 MB across the four faces and next/font <link rel=preload>s every one of
// them, so the hero's 96px Playfair headline painted in the fallback for most of
// a second before swapping. See ./README.md for the exact subset command.
export const fontInter = localFont({
  src: [
    {
      path: "./Inter-Variable.woff2",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "./Inter-Italic-Variable.woff2",
      style: "italic",
      weight: "100 900",
    },
  ],
  // Body copy must always be readable and must end up in Inter, so `swap`:
  // the metric-matched Arial paints immediately and upgrades. Between two
  // neutral grotesques on identical metrics that upgrade is barely perceptible
  // — unlike the serif below.
  display: "swap",
  adjustFontFallback: "Arial",
  variable: "--font-inter",
});

// Playfair: the redesigned variable family (opsz/wght), self-hosted rather than
// next/font/google — one upstream, full optical-size range, no Google fetch. One
// src entry per style; the variable wght axis spans 300–900 so a single file
// covers every weight we use. The wdth axis is instanced out at its default
// (112.5) — nothing sets font-stretch, and carrying it cost ~30% of the file.
export const fontPlayfair = localFont({
  src: [
    {
      path: "./Playfair-Variable.woff2",
      style: "normal",
      weight: "300 900",
    },
    {
      path: "./Playfair-Italic-Variable.woff2",
      style: "italic",
      weight: "300 900",
    },
  ],
  // `optional` is what removes the hero flicker: the browser gets a 100ms block
  // period and then commits to one face for the whole page view — it never swaps
  // mid-view. Paired with the preload next/font emits, Chrome holds first paint
  // long enough that the real face normally wins even on a cold visit; when it
  // doesn't, the reader gets a stable serif rather than 96px of headline
  // changing shape under them. `swap` here is what the flicker report was about.
  display: "optional",
  // next/font's synthetic fallback is off by more than it fixes here: it matches
  // x-height, and Playfair's is tall, so the `size-adjust: 137.73%` it derives
  // for Times renders the hero headline 22.5% *wider* than the real face (1917px
  // vs 1565px, measured at 300/96px). Georgia at its natural size lands within
  // 3% (1522px) and is the closer design — a high-x-height transitional serif
  // rather than Times' narrow oldstyle. `display: optional` means the browser
  // commits to one face per view, so the fallback never swaps in mid-paint;
  // being right on the first measure is what matters, not being size-adjusted.
  adjustFontFallback: false,
  fallback: ["Georgia", "ui-serif", "serif"],
  variable: "--font-playfair",
});
