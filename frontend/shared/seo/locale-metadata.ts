import { DEFAULT_LOCALE, isLocale } from "@evinvest/i18n";
import type { Locale, Translate } from "@evinvest/i18n";
import { translate } from "@/shared/config/i18n";
import { pageMetadata } from "@/shared/seo/page-metadata";

// Every static page under app/[locale] wants the same five steps: resolve the
// route's locale, build a translator, and hand pageMetadata a title and
// description from `meta.<namespace>.*` plus a locale-free path. Only the
// namespace and the path differ, so they live here as arguments rather than as
// five copies that drift apart — which is the real risk, not the line count: a
// page whose title says one thing and whose canonical points somewhere else is
// invisible until a crawler tells you.
//
// Routes that need request data to build their metadata (the [slug] pages fetch
// a record and branch on 404) are deliberately NOT expressed here — they share
// the shape but not the logic, and folding them in would mean a helper with a
// switch in it.

/// Title and description for every static page under app/[locale], in one
/// place. Both halves are stated per namespace, so a page cannot be given a
/// title with no description — the shape a hand-written `meta.${ns}.title`
/// lookup could not enforce.
const META = (t: Translate) => ({
  home: {
    title: t("meta.home.tagline", "Invest in China+1 narrative"),
    description: t(
      "meta.home.description",
      "Through Vietnam, with Quy-Nhon based fund, - we have direct pulse on Real Estate and tourist flows. Follow the money."
    ),
  },
  team: {
    title: t("meta.team.title", "Team"),
    description: t(
      "meta.team.description",
      "The cross-border investment, risk and development team behind EV Investment — a Quy Nhơn–based fund building institutional access to Vietnam's premium coastal real estate."
    ),
  },
  hiring: {
    title: t("meta.hiring.title", "Hiring"),
    description: t(
      "meta.hiring.description",
      "Join EV Investment — senior roles across investment, development, and client advisory for premium coastal developments in Quy Nhơn, Vietnam."
    ),
  },
  contact: {
    title: t("meta.contact.title", "Contact"),
    description: t(
      "meta.contact.description",
      "Get in touch with EV Investment — hiring, investment, and our coastal developments in Quy Nhơn, Vietnam."
    ),
  },
  publications: {
    title: t("meta.publications.title", "Field Notes & Research"),
    description: t(
      "meta.publications.description",
      "EV Investment publications — field notes filmed in Quy Nhơn and institutional research on Vietnam coastal real estate."
    ),
  },
  whitepaper: {
    title: t("meta.whitepaper.title", "Whitepaper"),
    description: t(
      "meta.whitepaper.description",
      "EV Investment whitepaper — our institutional thesis on coastal real estate in Quy Nhơn, Vietnam."
    ),
  },
  terms: {
    title: t("meta.terms.title", "Terms of Service"),
    description: t(
      "meta.terms.description",
      "The terms on which EV Investment provides its website and investor cabinet."
    ),
  },
  privacy: {
    title: t("meta.privacy.title", "Privacy Policy"),
    description: t(
      "meta.privacy.description",
      "What personal data EV Investment collects, why, who processes it, and your rights over it."
    ),
  },
  risk: {
    title: t("meta.risk.title", "Risk Disclosure"),
    description: t(
      "meta.risk.description",
      "The risks of investing through EV Investment — read before subscribing."
    ),
  },
});

export type MetaNamespace = keyof ReturnType<typeof META>;

/// The metadata itself, for pages that need to extend the result (e.g.
/// /publications spreads an RSS `alternates.types` onto it).
///
/// `locale` is passed through raw, exactly as pageMetadata expects: it does its
/// own fallback, and handing it the resolved value would be a second, silent
/// place for the fallback rule to live.
///
/// `contentLocales` narrows the alternates for a page whose BODY this repo does
/// not translate (the legal documents) — forwarded as-is to pageMetadata.
export function metadataFor(
  locale: string,
  ns: MetaNamespace,
  path: string,
  contentLocales?: readonly Locale[]
) {
  // Titles and descriptions are what a reader sees in the browser tab and in a
  // shared link — the one place the page's language shows before its body does.
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const { title, description } = META(translate(resolved))[ns];
  return pageMetadata({ title, description, path, locale, contentLocales });
}

/// Ready to re-export from a route: `export const generateMetadata =
/// localeMetadata("team", "/team")`.
///
/// A factory rather than a plain function so the route's `params` signature —
/// pure Next.js ceremony, identical on every page — stays here too instead of
/// being retyped five times.
export function localeMetadata(
  ns: MetaNamespace,
  path: string,
  contentLocales?: readonly Locale[]
) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = await params;
    return metadataFor(locale, ns, path, contentLocales);
  };
}
