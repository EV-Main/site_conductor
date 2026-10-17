import type { Metadata } from "next";
import { DEFAULT_LOCALE } from "@evinvest/i18n";
import { NotFound } from "@evinvest/uikit";
import { SiteDocument } from "@/application/layout";

// The 404 for URLs that match no route at all — `/nope`, `/team/nope`, a stale
// deep link, a scanner probing for /wp-admin. This is the one that was serving
// Next's built-in black "404 | This page could not be found" page.
//
// Why a *global* not-found and not `app/not-found.tsx`: this app has no
// `app/layout.tsx`. The root layout is `app/[locale]/layout.tsx`, so an unrouted
// URL — which by definition resolved no `[locale]` — has no layout to render a
// nested `not-found.tsx` inside, and Next falls back to its built-in page. The
// `global-not-found` convention (Next 16, `experimental.globalNotFound`) exists
// for exactly this shape: it *replaces* the root layout for `/_not-found`, so it
// owns the whole `<html>` document, which is why it renders `SiteDocument`
// itself rather than just a body.
//
// `app/[locale]/not-found.tsx` still handles the other half — a `notFound()`
// thrown from a route that *did* match, e.g. a retired /publications/<slug>.
//
// Copy is English-only because the uikit status pages bake their copy in, and
// an unrouted URL carries no reliable locale to read (the `fallback` rewrite
// resolves them as English). Chromeless for the same reason as
// app/[locale]/layout.tsx: this origin no longer has a landing to navigate.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <SiteDocument locale={DEFAULT_LOCALE} chrome={false}>
      <NotFound />
    </SiteDocument>
  );
}
