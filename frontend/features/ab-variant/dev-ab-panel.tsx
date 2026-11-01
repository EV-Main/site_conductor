"use client";

import { useRouter } from "next/navigation";
import { DevAbPanel as Panel, writeVariant } from "@evinvest/experiments/react";
import { experiments } from "@/shared/config/experiments";

/**
 * Development-only overlay for overriding experiment variants.
 *
 * Wraps `@evinvest/experiments`'s prop-driven `DevAbPanel`, wiring `onSelect` to
 * write the `ab_<key>` cookie and `router.refresh()` so the server re-renders
 * the chosen variant without a full page reload. The package's panel renders a
 * button per experiment × variant pair and returns `null` outside development —
 * zero cost in production.
 *
 * New experiments added to `shared/config/experiments.ts` appear automatically.
 */
export function DevAbPanel() {
  const router = useRouter();
  return (
    <Panel
      config={experiments}
      onSelect={(key, variant) => {
        writeVariant(key, variant);
        router.refresh();
      }}
    />
  );
}
