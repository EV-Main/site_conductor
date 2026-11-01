"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

import { DUR, EASE, RISE, VIEWPORT } from "./tokens";

/** Where the element travels *from*. `none` is a pure fade. */
export type RevealFrom = "up" | "down" | "left" | "right" | "none";

export interface RevealProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  /** Stagger offset in seconds when revealing a row/grid by hand. */
  delay?: number;
  /** Travel direction. Default `up` (element rises into place). */
  from?: RevealFrom;
  /** Travel distance in px. Default {@link RISE}. */
  distance?: number;
  /** Seconds. Default {@link DUR.slow}. */
  duration?: number;
  /**
   * Animate on mount instead of on scroll. Use above the fold, where
   * `whileInView` would fire in the same frame anyway but still costs an
   * IntersectionObserver.
   */
  onMount?: boolean;
}

function offset(from: RevealFrom, distance: number) {
  switch (from) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    default:
      return {};
  }
}

/**
 * A restrained scroll reveal: a short fade plus a 16px rise, once, triggered
 * just before the element is fully in view. Institutional, not flashy — and it
 * collapses to a plain fade (no movement) under `prefers-reduced-motion`.
 *
 * Only `opacity` and `transform` are animated, so every frame stays on the
 * compositor. Never wrap a `position: fixed` descendant: an animated transform
 * makes this element its containing block.
 */
export function Reveal({
  delay = 0,
  from = "up",
  distance = RISE,
  duration = DUR.slow,
  onMount = false,
  children,
  ...props
}: RevealProps) {
  const reduce = useReducedMotion();
  const hidden = { opacity: 0, ...(reduce ? {} : offset(from, distance)) };
  const shown = { opacity: 1, x: 0, y: 0 };
  const transition = { duration, ease: EASE.out, delay };

  return (
    <motion.div
      initial={hidden}
      {...(onMount
        ? { animate: shown }
        : { whileInView: shown, viewport: VIEWPORT })}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}
