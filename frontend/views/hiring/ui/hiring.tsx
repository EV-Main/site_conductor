import type { Locale } from "@evinvest/i18n";

import type { VacancySummary } from "@/entities/vacancy";
import { HiringBoard } from "./board";
import { HiringHero } from "./hero";
import { HiringProcess } from "./process";
import { HiringWhy } from "./why";
import { HiringStructuredData } from "./hiring-structured-data";

/** The searchable job board. Vacancies are fetched server-side (the backend is
 *  the source of truth) and filtered client-side in {@link HiringBoard}. */
export function HiringView({
  locale,
  vacancies,
}: {
  locale: Locale;
  vacancies: VacancySummary[];
}) {
  const teamCount = new Set(vacancies.map(v => v.category)).size;
  return (
    <div className="min-h-screen bg-background text-ink">
      <HiringStructuredData vacancies={vacancies} />
      <HiringHero
        locale={locale}
        roleCount={vacancies.length}
        teamCount={teamCount}
      />
      <HiringBoard vacancies={vacancies} />
      <HiringWhy locale={locale} />
      <HiringProcess locale={locale} />
    </div>
  );
}
