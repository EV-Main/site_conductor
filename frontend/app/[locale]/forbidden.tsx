import { locale as rootLocale } from "next/root-params";
import { DEFAULT_LOCALE, isLocale } from "@evinvest/i18n";
import { LocalisedStatus } from "@/views/status";

// Next's `forbidden.tsx` file convention (experimental `authInterrupts`):
// rendered with a 403 status whenever the `forbidden()` interrupt is invoked
// from a Server Component / Route Handler. It is NOT a browsable `/forbidden`
// route — it mirrors how `not-found.tsx` / `error.tsx` back the 404 / 500 views.
//
// Locale via `next/root-params` for the same reason as `not-found.tsx`.
export default async function ForbiddenPage() {
  const l = await rootLocale();
  return <LocalisedStatus kind="forbidden" locale={isLocale(l) ? l : DEFAULT_LOCALE} />;
}
