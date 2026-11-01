"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";
import { config } from "@/config";

/**
 * A card/block has ONE tier, declared by a surrounding <Tier>. The heading size
 * and the body (info) size are pinned together so they can never drift:
 *   main — h3 text-2xl, body text-base/sm   (prominent cards: Horizon, Calculator)
 *   alt  — h3 text-xl,  body text-sm/xs     (compact cards: side asset, bento)
 * <Heading> and info <Text> read the tier from context. There is no default — a
 * <Heading> or info <Text> with no <Tier> ancestor panics in dev, so a block
 * can never silently fall back to the wrong tier. The size is the tier's to set;
 * callers never override it (a conflicting text-* in className panics too).
 */
type Tier = "main" | "alt";

const HEADING_SIZE: Record<Tier, string> = {
  main: "text-2xl sm:text-3xl",
  alt: "text-xl sm:text-2xl",
};

// One notch larger on phones, where the dense card text was hard to read, then
// back to the compact desktop size at sm+.
const BODY_SIZE: Record<Tier, string> = {
  main: "text-base sm:text-sm",
  alt: "text-sm sm:text-xs",
};

const TierContext = React.createContext<Tier | null>(null);

// Establishes the typographic tier for everything inside it. Renders no DOM (a
// bare context provider), so it can wrap any subtree without affecting layout.
function Tier({ tier, children }: { tier: Tier; children: React.ReactNode }) {
  return <TierContext.Provider value={tier}>{children}</TierContext.Provider>;
}

function useTier(component: string): Tier {
  const tier = React.useContext(TierContext);
  if (!config.isProduction && !tier) {
    throw new Error(`<${component}> must be inside a <Tier tier=…> — none found.`);
  }
  return tier as Tier;
}

function Heading({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"h3"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "h3";
  const tier = useTier("Heading");
  return (
    <Comp
      data-slot="heading"
      className={cn(
        HEADING_SIZE[tier],
        "font-serif-display text-white mb-4",
        className
      )}
      {...props}
    />
  );
}

/**
 * Two text colors, named by role. The page text is Limestone Mist (--color-ink)
 * shown at two opacities:
 *   info      — primary reading copy. font-light leading-relaxed; size is pinned to
 *               the surrounding <Tier> (main=text-base/sm, alt=text-sm/xs).
 *   secondary — quieter supporting copy: stat labels, captions, field labels, footer.
 *               COLOR ONLY — these share nothing but the opacity, so casing, size and
 *               font (e.g. font-mono-tech uppercase) stay on the caller; no tier.
 */
const textVariants = cva("", {
  variants: {
    variant: {
      info: "font-light leading-relaxed text-ink/70",
      secondary: "text-ink/40",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

function Text({
  className,
  variant = "info",
  asChild = false,
  ...props
}: React.ComponentProps<"p"> &
  VariantProps<typeof textVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "p";
  const tier = React.useContext(TierContext);
  // Only info inherits the tier's body size; secondary owns its own sizing and
  // needs no tier. An info <Text> with no <Tier> ancestor panics in dev.
  if (!config.isProduction && variant !== "secondary" && !tier) {
    throw new Error("<Text> (info) must be inside a <Tier tier=…> — none found.");
  }
  const size = variant === "secondary" ? undefined : BODY_SIZE[tier as Tier];

  return (
    <Comp
      data-slot="text"
      // size first: a text-size utility carries a line-height, so it must
      // precede `leading-relaxed` in the variant or it would silently clobber it.
      className={cn(size, textVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Heading, Text, Tier, textVariants };
