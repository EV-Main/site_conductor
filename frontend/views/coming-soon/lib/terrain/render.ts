import type { Geometry } from "./geometry";
import { OC } from "./geometry";
import {
  CAM_H,
  K,
  LEVELS,
  LUT,
  LUT_N,
  MODE_COUNT,
  PEAK,
  heightAt,
  softCeiling,
  type Bump,
} from "./model";
import { rgba, type Palette } from "./palette";

/** E[V] as drawn: the mixture mean, eased so it glides rather than jumps. */
export type Mean = { x: number; z: number; init: boolean };

const occAt = (g: Geometry, x: number) => {
  const c = (x / OC) | 0;
  return c < 0 || c >= g.occ.length ? Infinity : g.occ[c];
};

/** Height of the surface at x on row j, from the per-row mode factors. */
function hRow(g: Geometry, G: Bump[], j: number, x: number) {
  let h = 0;
  for (let k = 0; k < K; k++) {
    const r = g.rowFac[k * g.rows + j];
    if (r < 1e-4) continue;
    const d = x - G[k].x,
      q = d * d * G[k].ix;
    if (q < LUT_N) h += r * LUT[q | 0];
  }
  return softCeiling(h);
}

/** Mass-weighted mean, so the cursor bump pulls E[V] toward the pointer. */
function easeMean(G: Bump[], mean: Mean) {
  let sw = 0,
    mx = 0,
    mz = 0;
  for (const b of G) {
    const w = b.a * b.sx * b.sz;
    sw += w;
    mx += w * b.x;
    mz += w * b.z;
  }
  if (sw > 0) {
    mx /= sw;
    mz /= sw;
  }
  if (!mean.init) {
    mean.x = mx;
    mean.z = mz;
    mean.init = true;
  }
  mean.x += (mx - mean.x) * 0.05;
  mean.z += (mz - mean.z) * 0.05;
}

/**
 * Bins every visible dot into its alpha bucket and traces E[V] along the rows.
 * Rows are walked near → far; `occ` holds the highest silhouette drawn so far
 * per 2-px column, and a dot below it sits behind a nearer ridge and is skipped.
 */
function binDots(g: Geometry, G: Bump[], mean: Mean, t: number) {
  const { rows, rowFac, occ, bucket, bucketN, psx, pwx, pSin, pCos, rowY, hz } =
    g;
  const st = Math.sin(t * 0.12),
    ct = Math.cos(t * 0.12);
  occ.fill(Infinity);
  bucketN.fill(0);
  const L1 = LEVELS - 1,
    NO = occ.length,
    GAP = g.mobile ? 1.1 : 0.9;
  const [g0, g1, g2, g3, g4] = G;
  for (let j = rows - 1; j >= 0; j--) {
    const fzj = g.rfz[j],
      fade = g.rfade[j],
      size = g.rsize[j],
      rip = 0.006 * Math.cos(g.rz[j] * 1.4 - t * 0.1);
    const r0 = rowFac[j],
      r1 = rowFac[rows + j],
      r2 = rowFac[2 * rows + j],
      r3 = rowFac[3 * rows + j],
      r4 = rowFac[4 * rows + j];
    const p0 = g.rStart[j],
      pe = g.rEnd[j];
    for (let p = p0; p < pe; p++) {
      const x = pwx[p];
      let h = 0,
        q,
        d;
      if (r0 > 1e-4) {
        d = x - g0.x;
        q = d * d * g0.ix;
        if (q < LUT_N) h += r0 * LUT[q | 0];
      }
      if (r1 > 1e-4) {
        d = x - g1.x;
        q = d * d * g1.ix;
        if (q < LUT_N) h += r1 * LUT[q | 0];
      }
      if (r2 > 1e-4) {
        d = x - g2.x;
        q = d * d * g2.ix;
        if (q < LUT_N) h += r2 * LUT[q | 0];
      }
      if (r3 > 1e-4) {
        d = x - g3.x;
        q = d * d * g3.ix;
        if (q < LUT_N) h += r3 * LUT[q | 0];
      }
      if (r4 > 1e-4) {
        d = x - g4.x;
        q = d * d * g4.ix;
        if (q < LUT_N) h += r4 * LUT[q | 0];
      }
      h += rip * (pSin[p] * ct + pCos[p] * st);
      h = h < 0 ? 0 : softCeiling(h);
      const y = hz + fzj * (CAM_H - h);
      rowY[p - p0] = y;
      const sx = psx[p],
        c = (sx / OC) | 0;
      if (c >= 0 && c < NO && y > occ[c] - GAP) continue; // behind a nearer ridge, or crowded against its edge
      const I = h / PEAK > 1 ? 1 : h / PEAK;
      let lv = ((0.12 + 0.88 * I) * fade * L1 + 0.5) | 0;
      if (lv > L1) lv = L1;
      const buf = bucket[lv],
        n = bucketN[lv];
      buf[n] = sx;
      buf[n + 1] = y;
      buf[n + 2] = size * (1 + 0.45 * I);
      bucketN[lv] = n + 3;
    }
    // E[V] at this depth, tested against the rows in front of it only.
    const ex = g.cx + mean.x * fzj,
      ey = hz + fzj * (CAM_H - hRow(g, G, j, mean.x));
    g.evX[j] = ex;
    g.evY[j] = ey;
    g.evVis[j] = ey <= occAt(g, ex) + 0.8 ? 1 : 0;
    // This row now hides what lies behind it: raise the silhouette along its polyline.
    let px = psx[p0],
      py = rowY[0];
    for (let p = p0 + 1; p < pe; p++) {
      const qx = psx[p],
        qy = rowY[p - p0];
      const c0 = Math.max(0, Math.ceil(px / OC)),
        c1 = Math.min(NO - 1, Math.floor(qx / OC));
      const k = (qy - py) / (qx - px);
      for (let c = c0; c <= c1; c++) {
        const yy = py + (c * OC - px) * k;
        if (yy < occ[c]) occ[c] = yy;
      }
      px = qx;
      py = qy;
    }
  }
}

/** Draws one frame; returns the E[V] anchor so the caller can hang the label off it. */
export function render(
  ctx: CanvasRenderingContext2D,
  g: Geometry,
  G: Bump[],
  mean: Mean,
  palette: Palette,
  t: number
) {
  let amax = 0;
  for (let k = 0; k < MODE_COUNT; k++) amax = Math.max(amax, G[k].a);
  const scale = PEAK / Math.max(0.75, amax * 1.05);
  for (let k = 0; k < K; k++) {
    const b = G[k],
      iz = 1 / (2 * b.sz * b.sz);
    for (let j = 0; j < g.rows; j++) {
      const d = g.rz[j] - b.z;
      g.rowFac[k * g.rows + j] = b.a * scale * Math.exp(-d * d * iz);
    }
  }
  easeMean(G, mean);
  binDots(g, G, mean, t);

  ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
  ctx.clearRect(0, 0, g.W, g.H);
  for (let l = 0; l < LEVELS; l++) {
    const n = g.bucketN[l];
    if (!n) continue;
    const buf = g.bucket[l];
    ctx.beginPath();
    for (let i = 0; i < n; i += 3) {
      const s = buf[i + 2];
      ctx.rect(buf[i] - s * 0.5, buf[i + 1] - s * 0.5, s, s);
    }
    ctx.fillStyle = g.styles[l];
    ctx.fill();
  }

  // The ridge itself: the mean traced over the terrain, thin and faint far away, firmer up close.
  ctx.lineCap = "round";
  for (let j = 1; j < g.rows; j++) {
    if (!g.evVis[j] || !g.evVis[j - 1]) continue;
    const v = g.evV[j];
    const tail = v > 0.8 ? 1 - ((v - 0.8) / 0.2) * 0.7 : 1; // eases off before the bottom edge
    ctx.lineWidth = 0.6 + 0.8 * v;
    ctx.strokeStyle = rgba(palette.ink, (0.24 + 0.56 * v) * tail);
    ctx.beginPath();
    ctx.moveTo(g.evX[j - 1], g.evY[j - 1]);
    ctx.lineTo(g.evX[j], g.evY[j]);
    ctx.stroke();
  }
  ctx.lineCap = "butt";

  // Anchor: where the mass sits in depth — a small ring on the ridge.
  const fzm = g.f / mean.z,
    ax = g.cx + mean.x * fzm,
    ay = g.hz + fzm * (CAM_H - heightAt(G, mean.x, mean.z, scale));
  const vm = Math.min(
    1,
    Math.max(0, (1 / mean.z - 1 / g.zf) / (1 / g.zn - 1 / g.zf))
  );
  ctx.beginPath();
  ctx.arc(ax, ay, 2.5 + 2 * vm, 0, 6.2832);
  ctx.fillStyle = palette.background;
  ctx.fill();
  ctx.lineWidth = 1.25;
  ctx.strokeStyle = rgba(palette.ink, 0.95);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ax, ay, 1.4, 0, 6.2832);
  ctx.fillStyle = rgba(palette.accent, 1);
  ctx.fill();
  return { ax, ay };
}
