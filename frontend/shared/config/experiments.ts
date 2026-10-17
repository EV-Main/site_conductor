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
  hero: { variants: ["a", "b"], weights: [0.5, 0.5] },
  // a: "Invest in Vietnam / Through Institutional Vision"; b: "China+1 / Vietnam".
  hero_headline: { variants: ["a", "b"], weights: [0.5, 0.5] },
  // a: "Start investing" → cabinet as the primary, Explore secondary, the
  // whitepaper a text link; b: the pre-#198 row (Explore primary, Whitepaper).
  // The new row is listed first because production serves variants[0]: the
  // cabinet entry is the deliverable, the old row is the comparison arm.
  hero_cta: { variants: ["a", "b"], weights: [0.5, 0.5] },
  // a: Hero A's "figures as of" date as a faint corner footnote, styled like
  // the footer copyright; b: the centred line under the stats.
  hero_as_of: { variants: ["a", "b"], weights: [0.5, 0.5] },
  // a: original gradient scrim; b: stacked text-shadow halo.
  team_bio_shade: { variants: ["a", "b"], weights: [0.5, 0.5] },
  // a: text-only leadership band; b: the boardroom photograph above the pillars.
  team_office: { variants: ["a", "b"], weights: [0.5, 0.5] },
} as const satisfies ExperimentConfig;

export type ExperimentKey = Key<typeof experiments>;
export type Variant<K extends ExperimentKey> = Var<typeof experiments, K>;
