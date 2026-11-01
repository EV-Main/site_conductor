import type { Locale } from "@evinvest/i18n";

import { formatCalendarDate } from "@/shared/lib/intl";
import { PUBLICATIONS } from "./catalogue";
import { localizePublication } from "./translations";
import type { Publication, PublicationKind } from "./types";

// `undefined` (not a fallback entry) so an uncatalogued slug is a hard miss the
// caller must turn into a 404 — never a silently rendered soft-404 (#105).
export function findPublication(
  slug: string,
  locale: Locale
): Publication | undefined {
  const found = PUBLICATIONS.find(p => p.slug === slug);
  return found && localizePublication(found, locale);
}

// The whole catalogue in canonical English, newest first.
//
// For machine surfaces only — the sitemap, the RSS feed, the site-wide
// structured data — which describe the catalogue itself rather than a page a
// reader is looking at, and would otherwise have to pick a language to be
// "the" catalogue in. Anything a reader sees goes through `publicationsFor`.
export function allPublications(): readonly Publication[] {
  return PUBLICATIONS;
}

// The catalogue as one reader sees it: card copy resolved for `locale`.
export function publicationsFor(locale: Locale): readonly Publication[] {
  return PUBLICATIONS.map(p => localizePublication(p, locale));
}

export function publicationsByKind(
  kind: PublicationKind,
  locale: Locale
): Publication[] {
  return PUBLICATIONS.filter(p => p.kind === kind).map(p =>
    localizePublication(p, locale)
  );
}

// Rule 1.3 was once applied here by hiding untranslated publications. It is not
// any more, and the reason is worth recording rather than rediscovering.
//
// The rule exists so a reader never meets an English essay under Russian chrome
// and concludes the locale is a veneer. Hiding satisfies that — but with no
// document translated into anything, hiding meant `/ru/publications` was an
// empty page, and an empty research index says something worse about a fund than
// an English one does. (In practice the selector that did the hiding was
// exported and never called, so the site had been serving English cards under
// translated chrome all along: the rule was documented, not enforced.)
//
// What ships instead answers the same worry directly: the *card* — title, dek,
// quote, category — is translated from `translations.json`, so the index reads
// in the reader's language, and the article page states plainly that the report
// below it is in English. The reader is told, rather than shown an empty shelf
// or left to work it out.
//
// `availableIn` with "hide" remains the right call for content compiled
// per-locale; when the blog build starts publishing translated documents and
// declaring them in `locales`, this is where that logic belongs again.

export function fieldNotes(locale: Locale, n?: number): Publication[] {
  const notes = publicationsByKind("field-note", locale);
  return n === undefined ? notes : notes.slice(0, n);
}

// The reader's locale, and UTC. Both halves matter and for different reasons.
//
// The locale is passed in rather than read from the environment: this formats on
// the server and again on the client, and a host-derived locale would differ
// between the two — a hydration mismatch. An explicit argument is the same value
// in both places. Before this took a locale it was pinned to en-GB, which meant
// a Russian page dated its articles "1 May 2026".
//
// The policy itself (UTC, the tag map, the parts-built short form) lives in
// `shared/lib/intl` so the hero's figures and these cards can never disagree.
// What stays here is the publication's vocabulary: "short" is the mono-tech
// masthead label, upper-cased because that is how every card sets it.
//
// `locale` is required, with no default. A default would make forgetting it
// silent — English dates on a Russian page, which is exactly the bug this
// parameter was added to fix, and invisible to anyone not reading that locale.
export function formatPublicationDate(
  iso: string,
  style: "long" | "short",
  locale: Locale
): string {
  if (style === "long") return formatCalendarDate(iso, locale, "long");
  return formatCalendarDate(iso, locale, "label").toUpperCase();
}
