import type { Metadata } from "next";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALES,
  localePath,
  type Locale,
} from "@evinvest/i18n";
import { SITE } from "@/shared/config/site";
import { alternateLocales, hreflangAlternates } from "@/shared/seo/hreflang";

// Why every page must call this instead of setting `title` + `description`
// alone: Next.js does NOT merge `openGraph` field-by-field. A page that omits
// the key inherits the root block *whole* — so /team used to ship the
// homepage's og:title, og:description AND og:url, telling every social crawler
// that the team page is the homepage. Same rule for `twitter`. Declaring both
// blocks per page is the only fix, and doing it through one helper keeps them
// from drifting out of step with the title/description they mirror.
//
// The OG image defaults to the site card built by scripts/build-og.tsx; pages
// with their own art (a publication's cover) pass `image`.

export type PageImage = { url: string; alt: string };

const DEFAULT_IMAGE: PageImage = {
  url: "/opengraph-image.png",
  alt: `${SITE.tagline}. ${SITE.description}`,
};

// og:locale takes language_TERRITORY, unlike hreflang's bare language code.
const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  ru: "ru_RU",
  vi: "vi_VN",
  fr: "fr_FR",
  de: "de_DE",
};

/**
 * The `og:locale` / `og:locale:alternate` pair for a page.
 *
 * Exported because the homepage cannot go through {@link pageMetadata} — its
 * title is the root `title.default` ("EV Investment: …"), not a page title the
 * template appends the brand to — but it still needs these two fields to differ
 * per locale. Without it every `/xx` homepage shipped `og:locale=en_US`, telling
 * every social crawler that the German homepage is English.
 *
 * `alternateLocale` mirrors hreflang off the same set, so it is absent whenever
 * the page has no genuine alternates.
 */
export function ogLocaleFields(resolved: Locale, versions: readonly Locale[]) {
  return {
    // og:locale wants the underscored territory form ("en_US", "de_DE"), not
    // the bare hreflang code. Only en has a territory we actually publish from,
    // so the rest map to the language with its conventional region.
    locale: OG_LOCALES[resolved],
    ...(versions.length > 1
      ? {
          alternateLocale: versions
            .filter(locale => locale !== resolved)
            .map(locale => OG_LOCALES[locale]),
        }
      : {}),
  };
}

export type PageMetadataInput = {
  /// Page title WITHOUT the site name — the root `title.template` appends it.
  title: string;
  description: string;
  /// Locale-FREE, root-relative, no trailing slash (e.g. "/publications/x").
  /// The locale prefix is applied for you — never pass "/ru/team".
  path: string;
  /// The rendering locale, straight from the route's `params`. Determines the
  /// canonical and og:url: `en` is unprefixed, every other locale is `/xx/…`.
  ///
  /// Omitting it (or passing an unrecognised string) falls back to the default
  /// locale, which is right for the routes that live outside app/[locale].
  locale?: string;
  /// Defaults to the site OG card. Pass a publication cover to give an article
  /// its own preview.
  image?: PageImage;
  /// Locales this page's CONTENT exists in — not which locales can render it.
  ///
  /// Defaults to all five, which is right for everything driven by the message
  /// catalogues. Pass the narrower set for content this repo does not translate:
  /// a publication whose Typst document is English-only passes
  /// `publication.locales`, and its /ru, /vi, /fr and /de URLs then canonicalise
  /// to the English one instead of claiming to be German and Russian versions of
  /// a document that exists once, in English.
  contentLocales?: readonly Locale[];
  /// "article" unlocks the published-time / author / section OG fields below.
  type?: "website" | "article";
  article?: {
    publishedTime?: string;
    authors?: string[];
    section?: string;
  };
};

export function pageMetadata({
  title,
  description,
  path,
  locale,
  contentLocales = LOCALES,
  image = DEFAULT_IMAGE,
  type = "website",
  article,
}: PageMetadataInput): Metadata {
  // The template only applies to the document <title>; og:title is a plain
  // string, so mirror the resolved form by hand or social cards lose the brand.
  const resolvedTitle = `${title} | ${SITE.name}`;

  const resolved: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;

  // The locales that are a real, indexable version of THIS page: indexed at all,
  // and carrying this page's content. Usually all five.
  const versions = alternateLocales(contentLocales);

  // Self-referencing canonical per locale — `/ru/team` points at itself, not at
  // `/team`. That is what lets all five locales rank instead of four of them
  // deindexing into the English URL.
  //
  // The exception is a locale that is NOT a version of this page: it renders the
  // English content under a localised shell, so it canonicalises to the English
  // URL, which is the honest description of what a crawler found. Those pages
  // also emit no hreflang — annotations on a page that canonicalises elsewhere
  // are discarded, and a set naming a URL which then points away from itself is
  // the "no return tag" conflict that makes Google drop the whole cluster.
  const isOwnVersion = versions.includes(resolved);
  const canonicalLocale =
    isOwnVersion || !versions.includes(DEFAULT_LOCALE)
      ? resolved
      : DEFAULT_LOCALE;
  const url = localePath(canonicalLocale, path);
  const languages = isOwnVersion
    ? hreflangAlternates(path, contentLocales)
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    openGraph: {
      type,
      siteName: SITE.name,
      title: resolvedTitle,
      description,
      url,
      ...ogLocaleFields(resolved, versions),
      images: [
        {
          url: image.url,
          // Only the generated site card is guaranteed 1200×630; a publication
          // cover is whatever the blog flake produced, so declaring dimensions
          // for it would be a guess. Omitted ⇒ crawlers measure it themselves.
          ...(image.url === DEFAULT_IMAGE.url
            ? { width: 1200, height: 630 }
            : {}),
          alt: image.alt,
        },
      ],
      ...(type === "article" && article
        ? {
            publishedTime: article.publishedTime,
            authors: article.authors,
            section: article.section,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [image.url],
      ...(SITE.twitterHandle
        ? { site: SITE.twitterHandle, creator: SITE.twitterHandle }
        : {}),
    },
  };
}
