import { DEFAULT_LOCALE, type Locale } from "@evinvest/i18n";

import RAW from "./translations.json";
import type { Publication } from "./types";

/**
 * Card translations for publications, and the resolver that applies them.
 *
 * ## Why this is a separate file from `catalogue.json`
 *
 * `catalogue.json` is a **build artefact** — the blog flake overwrites it
 * wholesale before `next build`. A translation written into it would survive
 * exactly until the next real build and then vanish, silently, with the site
 * still rendering fine in English. So the translations live here, in a tracked
 * file the build never touches, and are merged over the artefact at read time.
 *
 * ## Card, not document
 *
 * What is translated here is the *card*: title, dek, quote, category — what
 * appears on `/publications`, in the masthead, in a shared link's preview. The
 * document itself is a compiled Typst report living in the `blog` repo and is
 * not translated by anything in this repo. `Publication.locales` remains the
 * record of which locales the **document** exists in, which is what
 * {@link hasTranslatedDocument} reads; keeping the two separate is what lets the
 * article page say honestly that the body is in English while its heading is
 * not.
 *
 * ## Rule 1.2, per field
 *
 * Each entry stores the English it was translated from, exactly like the message
 * catalogues, and a field whose English has since moved is refused — the current
 * English is rendered instead of a translation of a sentence nobody writes any
 * more.
 *
 * Per *field*, not per entry as vacancies do it. That difference is deliberate:
 * a vacancy is rewritten wholesale, so a row-level digest matches how the
 * content changes, whereas a publication's dek can be re-edited while its title
 * stands, and these four independent strings behave far more like catalogue
 * entries than like a row.
 */

/** `{ en, t }` — the same provenance shape the message catalogues use. */
type Entry = { en: string; t: string };
type Sidecar = Record<string, Record<string, Record<string, Entry>>>;

/** The card fields that carry language. Everything else is a number, a date, a
 * slug or an asset path. */
const TRANSLATABLE = ["title", "dek", "quote", "category"] as const;
type Translatable = (typeof TRANSLATABLE)[number];

const SIDECAR = RAW as Sidecar;

/**
 * The publication as this locale should see it.
 *
 * Never throws and never blanks a field: an unknown slug, a missing locale, a
 * missing field and a stale entry all resolve to the English already on the
 * publication. `en` short-circuits — English is the source, not a translation of
 * itself (rule 1.1).
 */
export function localizePublication(
  publication: Publication,
  locale: Locale
): Publication {
  if (locale === "en") return publication;
  const fields = SIDECAR[publication.slug]?.[locale];
  if (!fields) return publication;

  const patch: Partial<Record<Translatable, string>> = {};
  for (const field of TRANSLATABLE) {
    const entry = fields[field];
    const current = publication[field];
    // Rule 1.2: refuse a translation whose English source has moved on. The
    // comparison is against the live artefact, so an edited dek in the blog repo
    // withdraws its own translations the moment the catalogue is rebuilt.
    if (entry && current !== undefined && entry.en === current) {
      patch[field] = entry.t;
    }
  }
  return Object.keys(patch).length > 0 ? { ...publication, ...patch } : publication;
}

/**
 * Locales the *document* — not the card — actually exists in.
 *
 * Absent `locales` means English only, which is every entry authored so far:
 * the reports are compiled Typst in a separate repo and nothing here translates
 * them. This is the one resolver for that fallback — both the article page
 * (`contentLocales` in its `pageMetadata` call) and `app/sitemap.ts` read it, so
 * "no `locales` field" can't mean "English only" in one and "all five locales"
 * in the other. It used to: the page passed `publication.locales` straight
 * through, whose `undefined` fell through `pageMetadata`'s own default of all
 * five, while the sitemap coalesced the same `undefined` to English-only — five
 * hreflang entries on the page, one `<url>` in the sitemap for the same article,
 * which is exactly the "head claims five languages, sitemap claims one" conflict
 * `shared/seo/hreflang.ts` warns about.
 */
export function documentLocales(publication: Publication): readonly Locale[] {
  return publication.locales ?? [DEFAULT_LOCALE];
}

/**
 * Whether the *document* — not the card — exists in this locale.
 *
 * This is what the article page's notice keys off, so the notice disappears by
 * itself on the day the blog build starts publishing translated documents and
 * declaring them.
 */
export function hasTranslatedDocument(
  publication: Publication,
  locale: Locale
): boolean {
  return documentLocales(publication).includes(locale);
}
