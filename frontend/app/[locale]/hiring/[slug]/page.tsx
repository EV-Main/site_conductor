import { DEFAULT_LOCALE, isLocale, type Locale } from "@evinvest/i18n";
import { translate } from "@/shared/config/i18n";
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getVacancy,
  vacancyCacheOptions,
  type VacancyDetail,
} from "@/entities/vacancy";
import { VacancyView } from "@/views/vacancy";
import { pageMetadata } from "@/shared/seo/page-metadata";

// Rendered per request, not prerendered.
//
// The obvious shape — `generateStaticParams` over the vacancy list — cannot work
// in this deployment: the container is built by Nix in a sandbox with no network,
// so `listVacancies()` hits its catch and returns `[]`. Zero paths get enumerated,
// and because `app/[locale]/layout.tsx` declares `dynamicParams = false` (which is
// load-bearing for the fallback rewrite), an unenumerated `(locale, slug)` is
// *declined* rather than rendered on demand — a `dynamicParams = true` here does
// not override it. That is what made every role 404 in every locale.
//
// So this route opts out of static generation entirely, exactly as
// `publications/[slug]` already does. Freshness costs nothing: the TTL rides on
// the fetch itself (`vacancyCacheOptions`), so the backend still sees at most one
// request an hour per role, not one per visitor.
export const dynamic = "force-dynamic";

// Deduped within a request, so generateMetadata and the page share one fetch.
// `null` means a genuine 404 (role missing); a network/5xx failure throws so the
// 500 boundary (app/error.tsx) renders instead of a misleading "not found".
// Keyed on (slug, locale), not slug alone: `cache` dedupes on its arguments, so
// a slug-only key would let whichever locale rendered first answer for all five
// — a Russian reader served the French copy of a role. The locale has to be an
// argument for the memo to be correct, not just for the request to be.
const fetchVacancy = cache(
  async (slug: string, locale: Locale): Promise<VacancyDetail | null> => {
    const { data, response } = await getVacancy({
      path: { slug },
      query: { locale },
      // ISR: on-demand (non-prebuilt) roles cache for an hour (the TTL rides
      // on the fetch itself — see vacancyCacheOptions) instead of re-fetching
      // every request. Prebuilt params bake at build.
      ...vacancyCacheOptions,
    });
    if (data) return data;
    if (response?.status === 404) return null;
    throw new Error(
      `Failed to load vacancy "${slug}" in ${locale} (${response ? `status ${response.status}` : "network error"})`
    );
  }
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const vacancy = await fetchVacancy(slug, resolved);
  // Explicit noindex, matching /publications/[slug]: the robots backstop keeps
  // a retired role unindexable even if a streaming boundary pins the status at
  // 200 and turns the 404 into a soft-404.
  const t = translate(resolved);
  if (!vacancy)
    return {
      title: t("meta.vacancy.notFound", "Role not found"),
      robots: { index: false },
    };
  return pageMetadata({
    title: t("meta.vacancy.title", "{title} — Hiring", {
      title: vacancy.title,
    }),
    description: vacancy.summary,
    path: `/hiring/${vacancy.slug}`,
    locale,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const vacancy = await fetchVacancy(slug, resolved);
  if (!vacancy) notFound();
  return <VacancyView locale={resolved} vacancy={vacancy} />;
}
