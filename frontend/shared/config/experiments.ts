// Single source of truth for A/B experiments — plain data, importable from
// Server Components and Client Components alike.
//
// The mechanics (cookie shape, weighted pick, control fallback, sticky
// assignment) live in `@evinvest/experiments`; this file only declares the
// experiments and re-narrows the package's generic types to this config.
import type {
  ExperimentConfig,
  ExperimentKey as Key,
  Variant as Var,
} from "@evinvest/experiments";

// `as const satisfies ExperimentConfig` keeps the variant strings as literal
// unions (so `match` / `getVariant` stay exhaustive) while checking the shape.
export const experiments = {
  //HACK: defining weights by hand is bad
  // a: text-only leadership band; b: the boardroom photograph above the pillars.
  team_office: { variants: ["a", "b"], weights: [0.5, 0.5] },
} as const satisfies ExperimentConfig;

export type ExperimentKey = Key<typeof experiments>;
export type Variant<K extends ExperimentKey> = Var<typeof experiments, K>;
