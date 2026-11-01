"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

import { DUR, EASE, RISE, SETTLE_OPACITY } from "./tokens";

export interface SettleProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  /** Seconds. Default {@link DUR.base} — shorter than a reveal on purpose. */
  duration?: number;
}

/**
 * The opposite of a {@link Reveal}: the element is *already there* on first
 * paint and merely settles into place — a half-rise from {@link SETTLE_OPACITY}
 * to full, with no delay. For a control that must be usable and LCP-eligible
 * from the first frame (the hero's CTA row) but should still join the section's
 * opening beat rather than sit frozen while the headline assembles around it.
 *
 * Under `prefers-reduced-motion` there is nothing to arrive, so it renders at
 * rest: no fade, no movement.
 */
export function Settle({
  duration = DUR.base,
  children,
  ...props
}: SettleProps) {
  const reduce = useReducedMotion();
  const shown = { opacity: 1, y: 0 };
  const hidden = reduce ? shown : { opacity: SETTLE_OPACITY, y: RISE / 2 };

  return (
    <motion.div
      initial={hidden}
      animate={shown}
      transition={{ duration, ease: EASE.out }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
