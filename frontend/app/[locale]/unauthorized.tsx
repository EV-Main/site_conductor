import { locale as rootLocale } from "next/root-params";
import { DEFAULT_LOCALE, isLocale } from "@evinvest/i18n";
import { LocalisedStatus } from "@/views/status";

// Next's `unauthorized.tsx` file convention (experimental `authInterrupts`, the
// same flag that backs `forbidden.tsx`): rendered with a 401 whenever the
// `unauthorized()` interrupt is invoked. It is NOT a browsable route.
//
// The flag was already on and only `forbidden.tsx` existed, so an
// `unauthorized()` call anywhere would have fallen through to the generic error
// boundary and shown a 500 for what is really "you are not signed in".
//
// Locale via `next/root-params`, as with the 404 and 403.
export default async function UnauthorizedPage() {
  const l = await rootLocale();
  return <LocalisedStatus kind="unauthorized" locale={isLocale(l) ? l : DEFAULT_LOCALE} />;
}
