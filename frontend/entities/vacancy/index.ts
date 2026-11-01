// `vacancy` entity — the domain-facing surface over the generated API client.
//
// The transport (typed SDK functions, request/response types) is generated from
// the backend contract under @/shared/api. This slice re-exports it under stable
// domain names so feature/view code depends on "the vacancy entity" rather than
// reaching into shared/api directly. The backend owns the data; keep the
// generated layer untouched.
export {
  type VacancySummary,
  type VacancyDetail,
  listVacancies,
  getVacancy,
} from "@/shared/api";

import type { Translate } from "@evinvest/i18n";

/// Data-cache options for ISR'd vacancy fetches (hiring board, role pages,
/// sitemap). `cache: "force-cache"` alone caches the response *indefinitely* —
/// a segment-level `export const revalidate` does not reach an explicit
/// force-cache fetch — so pin the fetch's own TTL to make the hourly refresh
/// the callers promise actually happen, in step everywhere.
export const VACANCY_REVALIDATE_SECONDS = 3600;
export const vacancyCacheOptions = {
  cache: "force-cache",
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      next: { revalidate: VACANCY_REVALIDATE_SECONDS },
    }),
} as const;

/// Filter facets for the board, mirroring the backend `VacancyCategory`. The
/// "All" pseudo-facet is UI-only (no category filter sent).
///
/// These five facets are chrome the app owns, so they translate here. The
/// vacancies themselves are translated by the *backend* — pass
/// `query: { locale }` and the role arrives already resolved, with a
/// `translated` flag saying whether it is the translation or the English (see
/// docs/i18n-persisted-content.md). `category` deliberately stays a stable key
/// on the wire and is translated here, where the chips are.
export const vacancyCategories = (t: Translate) =>
  [
    { key: "all", label: t("hiring.category.all", "All") },
    { key: "investment", label: t("hiring.category.investment", "Investment") },
    {
      key: "development",
      label: t("hiring.category.development", "Development"),
    },
    { key: "advisory", label: t("hiring.category.advisory", "Advisory") },
    { key: "operations", label: t("hiring.category.operations", "Operations") },
  ] as const;

export type VacancyCategoryKey = ReturnType<
  typeof vacancyCategories
>[number]["key"];

/// Richer team labels for the board's category pill (vs. the short filter-chip
/// label). The caller indexes this by `category` and falls back to the
/// backend's own label, which is the one string here that cannot be translated
/// ahead of time.
export const teamLabels = (t: Translate): Record<string, string> => ({
  investment: t("hiring.team.investment", "Investment & Research"),
  development: t("hiring.team.development", "Development & Projects"),
  advisory: t("hiring.team.advisory", "Client Advisory"),
  operations: t("hiring.team.operations", "Operations"),
});
