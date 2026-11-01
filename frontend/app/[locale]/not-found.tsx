import type { Metadata } from "next";
import { locale as rootLocale } from "next/root-params";
import { DEFAULT_LOCALE, isLocale } from "@evinvest/i18n";
import { LocalisedStatus } from "@/views/status";

// Explicit noindex overrides the root metadata's `index, follow`, which would
// otherwise be emitted alongside Next's built-in not-found noindex as a
// conflicting pair.
export const metadata: Metadata = { robots: { index: false } };

// `not-found.tsx` is handed no props by Next — not `params`, nothing — so the
// locale has to come from somewhere else. `next/root-params` exists for exactly
// this shape: it reads the root layout's `[locale]` segment from the request
// Next is already rendering, which keeps this a Server Component and keeps all
// five message catalogues (~176 KB) out of the client bundle. Reading it with
// `useParams()` would work too, and would ship every catalogue to render a page
// nobody wants to be on.
export default async function NotFoundPage() {
  const l = await rootLocale();
  return <LocalisedStatus kind="notFound" locale={isLocale(l) ? l : DEFAULT_LOCALE} />;
}
