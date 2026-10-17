import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale } from "@evinvest/i18n";
import { localeStaticParams } from "@evinvest/i18n/next";
import type { Metadata } from "next";
import { isIndexed } from "@/shared/config/i18n";
import { metadata as baseMetadata } from "@/application/metadata";
import { SiteDocument } from "@/application/layout";
import { serverErrorCopy } from "@/views/status";
import { StatusCopyProvider } from "@/shared/ui/status-copy";

export { viewport } from "@/application/metadata";

// Locale-aware only in the one respect that matters at this level: whether the
// locale may be indexed. All five are today, so the `noindex` branch below is
// dormant — it stays because it is the kill switch shared/config/i18n.ts
// documents: drop a locale from INDEXED_LOCALES and every page beneath it stops
// being advertised, in one edit.
//
// Per-URL hreflang is emitted where the path is actually known — the <head>
// links in shared/seo/page-metadata.ts (which every page reaches through
// pageMetadata) and the <xhtml:link> entries in app/sitemap.ts, both built by
// shared/seo/hreflang.ts so they cannot disagree. Never here: this layout sees
// no path, so it would stamp every page with the same alternates, which is
// worse than none.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return baseMetadata;
  if (isIndexed(locale)) return baseMetadata;
  return {
    ...baseMetadata,
    robots: {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    },
  };
}

// Every locale is prerendered, the default one included: unprefixed URLs are
// *rewritten* onto /en/*, so that tree has to really exist even though no reader
// ever sees the prefix.
//
// Wrapped rather than assigned directly, because Next types
// generateStaticParams as taking a props object while the helper takes an
// optional locale list, and the two signatures are not assignable.
export const generateStaticParams = () => localeStaticParams();

// Load-bearing, not hygiene. `[locale]` matches any single segment, so `/team`
// is ambiguous with this layout's own page — with `dynamicParams = false` the
// segment is *declined* and the request falls through to the `fallback` rewrite
// that resolves it as English. Without it, `/team` renders the homepage with
// locale === "team".
//
// It is also why a catch-all `[locale]/[...rest]` cannot be the 404: to serve
// one, that route needs `dynamicParams = true`, which is resolved per *route*
// (deepest wins) and so re-admits any first segment — `/hiring/<slug>` would
// then match as locale="hiring" and 404 instead of falling through to the
// rewrite that makes it English. Unrouted URLs are handled by
// `app/global-not-found.tsx` instead.
export const dynamicParams = false;

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // The document stays static so non-A/B routes (/team, /hiring, /contact, the
  // status pages) can statically render. A/B pages opt into dynamic rendering
  // where it's actually needed: each tested section awaits `getVariant`, which
  // reads the `ab_*` cookie (next/headers) and dynamizes that route on its own.
  // The 500 boundary is a Client Component by Next's rule, so its copy is
  // resolved here — where the locale is known — and carried down as ~6 strings
  // rather than shipping the catalogues to the browser.
  //
  // Chromeless: every routed page left under [locale] is the coming-soon page
  // or a status page — the landing's own pages redirect to its new host — and
  // a landing header would only offer links that leave this origin.
  return (
    <SiteDocument locale={locale} chrome={false}>
      <StatusCopyProvider copy={serverErrorCopy(locale)}>
        {children}
      </StatusCopyProvider>
    </SiteDocument>
  );
}
