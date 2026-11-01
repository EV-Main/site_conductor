import { DEFAULT_LOCALE, isLocale } from "@evinvest/i18n";

import {
  listVacancies,
  vacancyCacheOptions,
  type VacancySummary,
} from "@/entities/vacancy";
import { HiringView } from "@/views/hiring";
import { localeMetadata } from "@/shared/seo/locale-metadata";

// SSG + ISR: the board statically prerenders (the force-cache fetch below makes
// the vacancy list cacheable) and revalidates hourly, so it loads instantly and
// new listings surface without a redeploy. An unreachable backend at build
// degrades to an empty board (see try/catch); ISR fills it on the next request.
export const revalidate = 3600;

// generateMetadata only so the canonical carries the locale prefix — see
// app/[locale]/team/page.tsx.
export const generateMetadata = localeMetadata("hiring", "/hiring");

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  let vacancies: VacancySummary[] = [];
  try {
    // vacancyCacheOptions = force-cache + an explicit fetch TTL (static board,
    // hourly refresh). The generated client passes a Request object, which
    // segment revalidate alone won't make cacheable or expire, so both the
    // cache opt-in and the TTL ride on the fetch itself.
    //
    // `locale` is part of the URL, so each language gets its own cache entry
    // rather than five locales sharing whichever one warmed the cache first.
    const { data } = await listVacancies({
      ...vacancyCacheOptions,
      query: { locale: resolved },
    });
    vacancies = data ?? [];
  } catch {
    // Backend unreachable — render the page shell with an empty board.
    vacancies = [];
  }
  return <HiringView locale={resolved} vacancies={vacancies} />;
}
