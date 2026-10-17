// The canvas paints in the uikit's colours, read live from the cascade: no
// colour value is restated in this code, so a palette retune lands here too.

export type Rgb = readonly [number, number, number];
export type Palette = { ink: Rgb; accent: Rgb; background: string };

// The tokens can be authored in any CSS colour syntax (hex, oklch, color-mix),
// and getComputedStyle hands back whatever form the browser keeps. Painting
// one pixel and reading it back is the one conversion every engine agrees on.
function toRgb(color: string): Rgb {
  const px = document.createElement("canvas");
  px.width = px.height = 1;
  const ctx = px.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [0, 0, 0];
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

/**
 * Resolves the colour tokens on a probe inside `host`, so a themed scope
 * above the page is honoured. A custom property holding `color-mix()` is not
 * resolved by reading the property itself — only a real `color` computes it.
 */
export function readPalette(host: HTMLElement): Palette {
  const probe = document.createElement("span");
  probe.hidden = true;
  host.appendChild(probe);
  const resolve = (token: string) => {
    probe.style.color = `var(${token})`;
    return getComputedStyle(probe).color;
  };
  const palette = {
    ink: toRgb(resolve("--ink")),
    accent: toRgb(resolve("--primary-ink")),
    background: resolve("--background"),
  };
  probe.remove();
  return palette;
}

export const rgba = ([r, g, b]: Rgb, alpha: number) =>
  `rgba(${r},${g},${b},${alpha.toFixed(3)})`;

/** `from` blended towards `to` by m ∈ [0, 1]. */
export const mix = (from: Rgb, to: Rgb, m: number): Rgb => [
  Math.round(from[0] + (to[0] - from[0]) * m),
  Math.round(from[1] + (to[1] - from[1]) * m),
  Math.round(from[2] + (to[2] - from[2]) * m),
];
