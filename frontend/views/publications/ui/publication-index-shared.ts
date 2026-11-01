import type { Publication } from "@/entities/publication";

import { href } from "../model/presentation";
import type { KindFilter } from "./filter-chips";

// Module scope: these are `useMemo` deps inside the hook, so inline lambdas
// would re-score the whole catalogue on every render.
export const getTitle = (p: Publication) => p.title;
export const getText = (p: Publication) => `${p.dek} ${p.text ?? ""}`;
export const getHref = (p: Publication) => href(p);

export const RESULTS_ID = "publication-results";
export const rowId = (slug: string) => `publication-${slug}`;

/// What each chip claims it will show — including the kinds nobody has
/// published, which is how the chips know to disable themselves.
export function countsByKind(
  publications: Publication[]
): Record<KindFilter, number> {
  return {
    all: publications.length,
    "field-note": publications.filter(p => p.kind === "field-note").length,
    research: publications.filter(p => p.kind === "research").length,
    whitepaper: publications.filter(p => p.kind === "whitepaper").length,
  };
}
