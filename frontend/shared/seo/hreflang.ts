import type { MetadataRoute } from "next";
import {
  DEFAULT_LOCALE,
  LOCALES,
  localePath,
  type Locale,
} from "@evinvest/i18n";
import { INDEXED_LOCALES } from "@/shared/config/i18n";

// The one place the hreflang set is built, shared by the <head> links
// (shared/seo/page-metadata.ts) and the sitemap's <xhtml:link> entries
// (app/sitemap.ts). Google accepts either channel and ignores neither, so the
// two must agree — a page whose head advertises five languages while the
// sitemap advertises one is a conflict Google resolves by dropping the cluster,
// and that is precisely the bug a second copy of this logic would reintroduce.
//
// Paths are returned root-relative. Metadata resolves them against
// `metadataBase`; the sitemap needs absolute URLs and absolutises them itself.

/// `Languages<string>`, reached through the one entry point that exposes it at
/// that exact instantiation. `Metadata["alternates"]["languages"]` widens to
/// `string | URL | AlternateLinkDescriptor[] | null`, which the sitemap's own
/// field will not accept; the sitemap's is the narrow one, and a narrow map
/// satisfies both consumers. Neither is exported by name from "next", and
/// reaching into `next/dist/...` for it would break on a patch bump.
type Hreflangs = NonNullable<
  NonNullable<MetadataRoute.Sitemap[number]["alternates"]>["languages"]
>;

/// Locales whose URLs are genuine language versions of `path`.
///
/// The intersection of "indexed at all" and "this page's content exists in it".
/// The second half is not pedantry: a publication whose Typst document is
/// English-only is the same body of text under five prefixes, and claiming it as
/// five language versions is the duplicate-content signal INDEXED_LOCALES exists
/// to avoid.
export const alternateLocales = (
  contentLocales: readonly Locale[] = LOCALES
): readonly Locale[] => INDEXED_LOCALES.filter(l => contentLocales.includes(l));

/**
 * The `alternates.languages` map for `path`, or `undefined` when there is
 * nothing to say.
 *
 * `undefined` below two locales, deliberately: a one-entry hreflang set names a
 * page as the sole version of itself, which is what a page with no hreflang
 * already means. Emitting it is noise that invites a "no return tag" warning in
 * Search Console the moment the other side is missing.
 *
 * `x-default` points at the default locale — the page an unmatched reader
 * should land on. It is only emitted when `en` is actually in the set, because
 * x-default has to be one of the listed alternates, not a sixth URL.
 *
 * @param href - Applied to each localised path on the way out. Defaults to
 * identity, which is what `<head>` links want (resolved against `metadataBase`).
 * The sitemap passes its absolutiser: sitemap hreflangs must be absolute, and
 * doing it here keeps the mapped keys typed — walking the result with
 * `Object.entries` would widen them straight back to `string`.
 */
export function hreflangAlternates(
  path: string,
  contentLocales: readonly Locale[] = LOCALES,
  href: (path: string) => string = p => p
): Hreflangs | undefined {
  const locales = alternateLocales(contentLocales);
  if (locales.length < 2) return undefined;

  const languages: Hreflangs = {};
  for (const locale of locales)
    languages[locale] = href(localePath(locale, path));
  if (locales.includes(DEFAULT_LOCALE))
    languages["x-default"] = href(localePath(DEFAULT_LOCALE, path));
  return languages;
}
