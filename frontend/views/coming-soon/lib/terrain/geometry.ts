import { CAM_H, K, LEVELS, type View } from "./model";
import { mix, rgba, type Palette } from "./palette";

/** Column width, px, of the hidden-point silhouette. */
export const OC = 2;

/** Everything a frame reads that only changes on resize: rows, dots, buffers. */
export type Geometry = View & {
  H: number;
  dpr: number;
  cx: number;
  /** Horizon, px from the top of the hero. */
  hz: number;
  rows: number;
  rz: Float32Array;
  rfz: Float32Array;
  rfade: Float32Array;
  rsize: Float32Array;
  rStart: Int32Array;
  rEnd: Int32Array;
  psx: Float32Array;
  pwx: Float32Array;
  pSin: Float32Array;
  pCos: Float32Array;
  rowFac: Float32Array;
  bucket: Float32Array[];
  bucketN: Int32Array;
  styles: string[];
  occ: Float32Array;
  rowY: Float32Array;
  evX: Float32Array;
  evY: Float32Array;
  evVis: Uint8Array;
  evV: Float32Array;
};

/** 0 far … 1 near; the power crowds rows toward the horizon. */
const rowDepth = (j: number, rows: number) => Math.pow(j / (rows - 1), 1.25);

/**
 * `fieldTop` is the field's offset inside the hero: the horizon sits a little
 * below it, so the surface rises out from under the copy.
 */
export function buildGeometry(
  W: number,
  H: number,
  fieldTop: number,
  dpr: number,
  palette: Palette
): Geometry {
  const mobile = W < 720;
  const cx = W * (mobile ? 0.5 : 0.54);
  const hz = fieldTop + (mobile ? 64 : 70);
  const f = mobile ? Math.max(W * 1.05, 380) : Math.max(W * 0.7, 700);
  // The nearest row lands on the bottom edge of the canvas.
  const zn = (f * CAM_H) / (Math.max(1, H - hz) * 1.04);
  const zf = zn * (mobile ? 5 : 6);

  const rows = mobile ? 68 : 92;
  const SP = mobile ? 6.5 : 9.5; // px between dots on the nearest row
  const rz = new Float32Array(rows),
    rfz = new Float32Array(rows);
  const rfade = new Float32Array(rows),
    rsize = new Float32Array(rows);
  const rStart = new Int32Array(rows),
    rEnd = new Int32Array(rows);
  const spacing = new Float32Array(rows),
    counts = new Int32Array(rows);
  let np = 0,
    widest = 0;
  for (let j = 0; j < rows; j++) {
    const v = rowDepth(j, rows);
    const z = 1 / (1 / zf + v * (1 / zn - 1 / zf));
    rz[j] = z;
    rfz[j] = f / z;
    rfade[j] = 0.12 + 0.88 * Math.pow(v, 0.6);
    rsize[j] = 0.7 + 1.0 * v;
    spacing[j] = SP * (0.42 + 0.58 * v);
    counts[j] = Math.ceil((W + 24) / spacing[j]) + 1;
    rStart[j] = np;
    np += counts[j];
    rEnd[j] = np;
    widest = Math.max(widest, counts[j]);
  }

  const psx = new Float32Array(np),
    pwx = new Float32Array(np);
  const pSin = new Float32Array(np),
    pCos = new Float32Array(np);
  for (let j = 0; j < rows; j++) {
    const sp = spacing[j];
    const off = (j % 2) * sp * 0.5 - 12; // stagger rows: a dot matrix, not a mesh
    for (let i = 0; i < counts[j]; i++) {
      const p = rStart[j] + i,
        sx = off + i * sp,
        wx = (sx - cx) / rfz[j];
      psx[p] = sx;
      pwx[p] = wx;
      pSin[p] = Math.sin(wx * 2.3);
      pCos[p] = Math.cos(wx * 2.3);
    }
  }

  const styles: string[] = [];
  const bucket: Float32Array[] = [];
  for (let l = 0; l < LEVELS; l++) {
    const t = l / (LEVELS - 1);
    const m = Math.min(1, Math.max(0, (t - 0.8) / 0.17)); // the accent only on the summits
    styles.push(
      rgba(mix(palette.ink, palette.accent, m), 0.05 + 0.8 * Math.pow(t, 1.35))
    );
    bucket.push(new Float32Array(np * 3));
  }

  const evV = new Float32Array(rows);
  for (let j = 0; j < rows; j++) evV[j] = rowDepth(j, rows);

  return {
    W,
    H,
    dpr,
    mobile,
    f,
    cx,
    hz,
    zn,
    zf,
    rows,
    rz,
    rfz,
    rfade,
    rsize,
    rStart,
    rEnd,
    psx,
    pwx,
    pSin,
    pCos,
    rowFac: new Float32Array(K * rows),
    bucket,
    bucketN: new Int32Array(LEVELS),
    styles,
    occ: new Float32Array(Math.ceil(W / OC) + 2),
    rowY: new Float32Array(widest),
    evX: new Float32Array(rows),
    evY: new Float32Array(rows),
    evVis: new Uint8Array(rows),
    evV,
  };
}
