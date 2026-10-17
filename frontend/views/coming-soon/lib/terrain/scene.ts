import { buildGeometry, type Geometry } from "./geometry";
import { CAM_H, newBumps, placeModes, type Cursor } from "./model";
import { readPalette, type Palette } from "./palette";
import { render, type Mean } from "./render";

export type TerrainElements = {
  /** Spans the canvas; its box is the canvas box. */
  hero: HTMLElement;
  /** The space the surface lives in: the horizon sits just below its top. */
  field: HTMLElement;
  canvas: HTMLCanvasElement;
  /** The E[V] caption, positioned inside `field`. */
  label: HTMLElement;
};

/** Keeps the label clear of the right edge and of the copy above the field. */
function placeLabel(
  label: HTMLElement,
  ax: number,
  ay: number,
  W: number,
  fieldTop: number,
  fieldLeft: number
) {
  const right = ax < W - 190;
  const lx = right ? ax + 16 : ax - 16;
  const ly = Math.max(fieldTop + 30, ay - 14);
  label.toggleAttribute("data-left", !right);
  label.style.transform = `translate(${(lx - fieldLeft).toFixed(1)}px, ${(ly - fieldTop).toFixed(1)}px)`;
  label.toggleAttribute("data-on", true);
}

/**
 * Runs the terrain on `els` until the returned disposer is called. Under
 * reduced motion it paints one still frame per layout and never animates.
 */
export function mountTerrain({
  hero,
  field,
  canvas,
  label,
}: TerrainElements): () => void {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return () => {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const G = newBumps();
  const cur: Cursor = { x: 0, z: 0, a: 0, ta: 0, tx: 0, tz: 0 };
  const mean: Mean = { x: 0, z: 0, init: false };
  let geo: Geometry | null = null;
  let palette: Palette | null = null;
  let fieldTop = 0,
    fieldLeft = 0;
  // Starting mid-drift: at t = 0 every mode sits on its phase origin and the first frame looks staged.
  let t = 9;

  const draw = () => {
    if (!geo || !palette) return;
    placeModes(G, geo, cur, t);
    const { ax, ay } = render(ctx, geo, G, mean, palette, t);
    placeLabel(label, ax, ay, geo.W, fieldTop, fieldLeft);
  };

  const relayout = () => {
    const hr = hero.getBoundingClientRect(),
      fr = field.getBoundingClientRect();
    const W = Math.round(hr.width),
      H = Math.round(hr.height);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    fieldTop = fr.top - hr.top;
    fieldLeft = fr.left - hr.left;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    palette = readPalette(hero);
    geo = buildGeometry(W, H, fieldTop, dpr, palette);
    mean.init = false;
    draw();
  };

  // Cursor: project the pointer onto the floor plane; a soft bump rises under it and E[V] leans that way.
  const onPointerMove = (e: PointerEvent) => {
    if (!geo) return;
    const r = hero.getBoundingClientRect();
    const sx = e.clientX - r.left,
      sy = e.clientY - r.top;
    const z = sy < geo.hz + 10 ? 0 : (geo.f * CAM_H) / (sy - geo.hz);
    if (z < geo.zn || z > geo.zf) {
      cur.ta = 0;
      return;
    }
    cur.tx = ((sx - geo.cx) * z) / geo.f;
    cur.tz = z;
    cur.ta = 0.75;
    if (cur.a < 0.02) {
      cur.x = cur.tx;
      cur.z = cur.tz;
    }
  };
  const onPointerLeave = () => {
    cur.ta = 0;
  };
  const pointer = finePointer && !reduce;
  if (pointer) {
    hero.addEventListener("pointermove", onPointerMove);
    hero.addEventListener("pointerleave", onPointerLeave);
  }

  let running = false,
    onScreen = true,
    raf = 0,
    last = 0;
  const frame = (now: number) => {
    raf = 0;
    if (!running) return;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    t += dt;
    const kA = Math.min(1, dt * 2.6),
      kP = Math.min(1, dt * 4);
    cur.a += (cur.ta - cur.a) * kA;
    cur.x += (cur.tx - cur.x) * kP;
    cur.z += (cur.tz - cur.z) * kP;
    draw();
    raf = requestAnimationFrame(frame);
  };
  const update = () => {
    const want = geo !== null && !document.hidden && onScreen && !reduce;
    if (want && !running) {
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!want && running) {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const io = new IntersectionObserver(es => {
    onScreen = es.some(e => e.isIntersecting);
    update();
  });
  io.observe(hero);
  document.addEventListener("visibilitychange", update);
  let rt = 0;
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(rt);
    rt = requestAnimationFrame(relayout);
  });
  ro.observe(hero);
  // Web fonts move the copy, and with it the field and the horizon.
  let disposed = false;
  void document.fonts.ready.then(() => {
    if (!disposed) relayout();
  });
  relayout();
  update();

  return () => {
    disposed = true;
    running = false;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(rt);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", update);
    if (pointer) {
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
    }
  };
}
