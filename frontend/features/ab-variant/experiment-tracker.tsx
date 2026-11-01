"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ExperimentTracker as Tracker,
  writeVariant,
} from "@evinvest/experiments/react";
import { nextVariant } from "@evinvest/experiments";
import { useAnalytics } from "@/features/analytics";
import { experiments, type ExperimentKey } from "@/shared/config/experiments";
import { config } from "@/config";

// The experiments package never imports an analytics SDK — it emits events
// through an injected `onEvent` sink. This is where the app wires that sink to
// `@evinvest/analytics` (the load-bearing decoupling). `useAnalytics` is the
// lenient hook: it no-ops if no provider is mounted, so `track` is always safe.
export { useExperimentEvent } from "@evinvest/experiments/react";

/**
 * Client island that marks a section's A/B boundary.
 *
 * Wraps `@evinvest/experiments`'s `ExperimentTracker`, wiring its `onEvent` to
 * the analytics `capture`. Fires `${experiment}_exposed` once on mount so
 * PostHog records which variant was served, and provides variant context to
 * every {@link useExperimentEvent} call inside the subtree.
 *
 * Place in the section's **server wrapper** and pass server-rendered children —
 * the children prop pattern keeps the variant content out of the client bundle.
 *
 * @example
 * ```tsx
 * export async function Hero() {
 *   const variant = await getVariant("hero");
 *   return (
 *     <ExperimentTracker experiment="hero" variant={variant}>
 *       {match(variant, { a: <HeroA />, b: <HeroB /> })}
 *     </ExperimentTracker>
 *   );
 * }
 * ```
 */
export function ExperimentTracker({
  experiment,
  variant,
  children,
}: {
  experiment: ExperimentKey;
  variant: string;
  children: ReactNode;
}) {
  const capture = useAnalytics();

  const tracked = (
    <Tracker experiment={experiment} variant={variant} onEvent={capture}>
      {children}
    </Tracker>
  );

  // Production renders the bare section; the dev-only hover + h/l cycling
  // wrapper adds nothing to the shipped bundle.
  if (!config.isDevelopment) return tracked;
  return (
    <DevVariantCycle experiment={experiment} variant={variant}>
      {tracked}
    </DevVariantCycle>
  );
}

/**
 * Dev-only: hover a section, then `l` / `h` cycles its A/B variant by rewriting
 * the `ab_<key>` cookie (via the package's `writeVariant`) and calling
 * `router.refresh()` — the same path the dev panel uses, just driven by vim keys
 * and scoped to the hovered section. `nextVariant` wraps around and only visits
 * variants that actually exist.
 */
function DevVariantCycle({
  experiment,
  variant,
  children,
}: {
  experiment: ExperimentKey;
  variant: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) return;
    const onKeyDown = (e: KeyboardEvent) => {
      // Bare h/l — but never steal keystrokes while typing into a field
      // or when a modifier is held (e.g. Ctrl+L for the address bar).
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el?.isContentEditable || el?.closest("input, textarea, select")) return;
      const step = e.key === "l" ? 1 : e.key === "h" ? -1 : 0;
      if (step === 0) return;
      e.preventDefault();
      writeVariant(experiment, nextVariant(experiments, experiment, variant, step));
      router.refresh();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focused, experiment, variant, router]);

  // No hover outline: the dashed box flashed on every section the cursor crossed.
  // Hover still arms h/l variant-cycling for the section under the cursor — just
  // without the visual frame.
  return (
    <div onMouseEnter={() => setFocused(true)} onMouseLeave={() => setFocused(false)}>
      {children}
    </div>
  );
}
