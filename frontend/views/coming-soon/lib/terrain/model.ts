// The probability surface: a mixture of drifting gaussians over a floor plane.
// World: x = outcome (left/right), z = depth, y = density height. The camera
// sits CAM_H above the floor, so a point of height h at depth z lands at
// y = horizon + f·(CAM_H − h)/z.

export const CAM_H = 1.0;
/** The tallest mode reaches just under the horizon. */
export const PEAK = 0.7;
/** Colour/alpha buckets: one path and one fill per bucket per frame. */
export const LEVELS = 16;
/** Regimes change over tens of seconds, not seconds. */
const SLOW = 0.5;

/** exp(−q) lookup over q ∈ [0, 12): the per-dot hot loop cannot afford Math.exp. */
export const LUT_N = 4096;
export const LUT_S = LUT_N / 12;
export const LUT = new Float32Array(LUT_N);
for (let i = 0; i < LUT_N; i++) LUT[i] = Math.exp(-i / LUT_S);

type Mode = {
  px: number;
  s: number;
  ax: number;
  as: number;
  fx: number;
  fs: number;
  ph: number;
  wx: number;
  wz: number;
  a: number;
  fa: number;
};

// Four "regimes" drifting on incommensurate Lissajous paths, breathing out of
// phase: one mode fades while another builds. px ∈ [-1, 1] across the view,
// s ∈ [0, 1] from far to near.
const MODES: readonly Mode[] = [
  {
    px: 0.46,
    s: 0.42,
    ax: 0.26,
    as: 0.16,
    fx: 0.045,
    fs: 0.031,
    ph: 0.0,
    wx: 0.2,
    wz: 0.2,
    a: 1.0,
    fa: 0.055,
  },
  {
    px: -0.1,
    s: 0.3,
    ax: 0.3,
    as: 0.14,
    fx: 0.029,
    fs: 0.041,
    ph: 2.1,
    wx: 0.3,
    wz: 0.22,
    a: 0.85,
    fa: 0.043,
  },
  {
    px: 0.08,
    s: 0.62,
    ax: 0.38,
    as: 0.12,
    fx: 0.037,
    fs: 0.026,
    ph: 4.2,
    wx: 0.14,
    wz: 0.13,
    a: 0.7,
    fa: 0.067,
  },
  {
    px: -0.55,
    s: 0.52,
    ax: 0.22,
    as: 0.18,
    fx: 0.024,
    fs: 0.047,
    ph: 1.3,
    wx: 0.24,
    wz: 0.2,
    a: 0.65,
    fa: 0.035,
  },
];
export const MODE_COUNT = MODES.length;
/** The modes plus the cursor bump, which is always last. */
export const K = MODE_COUNT + 1;

export type Bump = {
  x: number;
  z: number;
  sx: number;
  sz: number;
  a: number;
  ix: number;
};
export type Cursor = {
  x: number;
  z: number;
  a: number;
  ta: number;
  tx: number;
  tz: number;
};
export type View = {
  W: number;
  f: number;
  zn: number;
  zf: number;
  mobile: boolean;
};

export const newBumps = (): Bump[] =>
  Array.from({ length: K }, () => ({ x: 0, z: 0, sx: 1, sz: 1, a: 0, ix: 0 }));

/** Half-width of the view in world units at depth z. */
export const halfWidth = (v: View, z: number) => ((v.W * 0.5) / v.f) * z;

/** Depth of a normalised far→near position s, uniform in 1/z like the rows. */
const depthOf = (v: View, s: number) =>
  1 / (1 / v.zf + s * (1 / v.zn - 1 / v.zf));

export function placeModes(G: Bump[], v: View, cur: Cursor, t: number) {
  const tau = 6.283;
  for (let k = 0; k < MODE_COUNT; k++) {
    const m = MODES[k],
      g = G[k];
    const s = Math.min(
      0.9,
      Math.max(0.08, m.s + m.as * Math.sin(t * SLOW * m.fs * tau + m.ph * 1.7))
    );
    const z = depthOf(v, s);
    g.z = z;
    g.x =
      (m.px + m.ax * Math.sin(t * SLOW * m.fx * tau + m.ph)) *
      halfWidth(v, z) *
      (v.mobile ? 0.85 : 1);
    g.sx = m.wx * halfWidth(v, z) * (v.mobile ? 1.3 : 1);
    g.sz = m.wz * (v.zf - v.zn) * (0.35 + (0.65 * z) / v.zf);
    g.a = m.a * (0.55 + 0.45 * Math.sin(t * SLOW * m.fa * tau + m.ph * 2.3));
  }
  const g = G[K - 1],
    cz = cur.z || v.zn * 2;
  g.x = cur.x;
  g.z = cz;
  g.sx = 0.11 * halfWidth(v, cz);
  g.sz = 0.08 * (v.zf - v.zn);
  g.a = cur.a;
  for (const b of G) b.ix = LUT_S / (2 * b.sx * b.sx);
}

/** Heights past 0.9 bend towards 0.98 instead of clipping; rarely reached. */
export const softCeiling = (h: number) =>
  h > 0.9 ? 0.9 + 0.08 * (1 - Math.exp((0.9 - h) * 8)) : h;

export function heightAt(G: Bump[], x: number, z: number, scale: number) {
  let h = 0;
  for (const g of G) {
    const dx = x - g.x,
      dz = z - g.z;
    h +=
      g.a *
      Math.exp(-(dx * dx) / (2 * g.sx * g.sx) - (dz * dz) / (2 * g.sz * g.sz));
  }
  return softCeiling(h * scale);
}
