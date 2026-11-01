import { DEFAULT_LOCALE, isLocale } from "@evinvest/i18n";
import { PublicationsView } from "@/views/publications";
import { metadataFor } from "@/shared/seo/locale-metadata";

// generateMetadata only so the canonical carries the locale prefix — see
// app/[locale]/team/page.tsx.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Not `localeMetadata` like the other static pages: this one extends the
  // result rather than returning it, so it needs the Metadata itself.
  const base = metadataFor(locale, "publications", "/publications");

  // `types` adds <link rel="alternate" type="application/rss+xml">, which is how
  // newsreaders and aggregators discover the feed from the hub page. Spread onto
  // the helper's `alternates` so the self-canonical it sets is preserved.
  //
  // One feed, not one per locale: the articles themselves are English, so a
  // per-locale feed would carry identical items under five URLs.
  return {
    ...base,
    alternates: {
      ...base.alternates,
      types: { "application/rss+xml": "/publications/feed.xml" },
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <PublicationsView locale={isLocale(locale) ? locale : DEFAULT_LOCALE} />
  );
}
