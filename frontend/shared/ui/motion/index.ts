// Public API of the motion slice. Import from `@/shared/ui/motion`, never from
// a file inside it — the internals (tokenizer, variant shapes) are free to move.
//
// Five primitives cover this surface:
//   Reveal      — one block fades/rises into view
//   Settle      — a block already on screen firms up (no delay, never opacity 0)
//   Stagger     — a row or grid arrives in sequence (+ StaggerItem per child)
//   SplitText   — a display headline assembles word by word
//   CountUp     — a figure counts up to its value
//
// CountUp (and with it VIEWPORT_Y / VIEWPORT_LIVE) has no call site at the
// moment — the showcase section that used it was pulled from the homepage. It is
// kept because it is generic, and because VIEWPORT_Y encodes an observer trap
// that is easy to fall into again; delete it if it is still unused by the time
// that matters.
//
// All five respect `prefers-reduced-motion` and run once. All but CountUp
// animate only compositor properties; CountUp writes text, and keeps that off
// React by mutating one node directly. Timing and curves come from ./tokens.
export { Reveal, type RevealFrom, type RevealProps } from "./reveal";
export { Settle, type SettleProps } from "./settle";
export {
  Stagger,
  StaggerItem,
  type StaggerItemProps,
  type StaggerProps,
} from "./stagger";
export { SplitText, type SplitTextProps } from "./split-text";
export { CountUp, type CountUpProps } from "./count-up";
export {
  DUR,
  EASE,
  RISE,
  SETTLE_OPACITY,
  STAGGER,
  STAGGER_TEXT,
  VIEWPORT,
  VIEWPORT_LIVE,
  VIEWPORT_Y,
} from "./tokens";
