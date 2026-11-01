import type { ReactNode } from "react";
import { select } from "@evinvest/experiments";

// Selects a React node by variant. Delegates to the package's zero-dep core (not
// its "use client" react entry) so it stays server-safe; the branches type
// enforces exhaustiveness at compile time.
export function match<V extends string>(
  variant: V,
  branches: { [K in V]: ReactNode },
): ReactNode {
  return select(variant, branches);
}
