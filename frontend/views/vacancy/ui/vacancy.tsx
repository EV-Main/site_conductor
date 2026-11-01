import type { Locale } from "@evinvest/i18n";

import type { VacancyDetail } from "@/entities/vacancy";
import { VacancyApply } from "./apply";
import { VacancyBody } from "./body";
import { VacancyHero } from "./hero";
import { VacancyStructuredData } from "./vacancy-structured-data";

/** One reusable role-page template (the backend supplies the content). */
export function VacancyView({
  locale,
  vacancy,
}: {
  locale: Locale;
  vacancy: VacancyDetail;
}) {
  return (
    <div className="min-h-screen bg-background text-ink">
      <VacancyStructuredData vacancy={vacancy} locale={locale} />
      {/* The untranslated note lives inside VacancyHero: the fixed header would
          paint over anything rendered here, above the hero's clearing padding. */}
      <VacancyHero vacancy={vacancy} locale={locale} />
      <VacancyBody vacancy={vacancy} locale={locale} />
      <VacancyApply vacancy={vacancy} locale={locale} />
    </div>
  );
}
