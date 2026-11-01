"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

import { DUR, EASE, RISE, STAGGER, VIEWPORT } from "./tokens";

/**
 * Variant names shared by {@link Stagger} and {@link StaggerItem}. Naming the
 * states (rather than giving each child a hand-computed `delay`) is what lets
 * the parent own the rhythm: reorder or add a card and the cascade still reads
 * correctly, with no delay arithmetic to keep in sync.
 */
const PARENT = {
  hidden: {},
  shown: { transition: { staggerChildren: STAGGER } },
};

export interface StaggerProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  /** Seconds before the first child moves. */
  delay?: number;
  /** Seconds between siblings. Default {@link STAGGER}. */
  step?: number;
  /** Animate on mount rather than on scroll (above-the-fold groups). */
  onMount?: boolean;
}

/**
 * Container for a row/grid whose children arrive one after another. Wrap each
 * child in {@link StaggerItem}; anything else in the subtree is untouched.
 */
export function Stagger({
  delay = 0,
  step = STAGGER,
  onMount = false,
  children,
  ...props
}: StaggerProps) {
  const shown = {
    transition: { staggerChildren: step, delayChildren: delay },
  };
  return (
    <motion.div
      initial="hidden"
      {...(onMount
        ? { animate: "shown" }
        : { whileInView: "shown", viewport: VIEWPORT })}
      variants={{ ...PARENT, shown }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerItemProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  /** Travel distance in px. Default {@link RISE}. */
  distance?: number;
}

/** One member of a {@link Stagger}. Timing comes from the parent, never here. */
export function StaggerItem({
  distance = RISE,
  children,
  ...props
}: StaggerItemProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : distance },
        shown: {
          opacity: 1,
          y: 0,
          transition: { duration: DUR.slow, ease: EASE.out },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
