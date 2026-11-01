import {
  LOCALES,
  translator,
  type Locale,
  type Messages,
  type Translate,
} from "@evinvest/i18n";
import {
  resolveCatalogue,
  type TranslatedCatalogue,
} from "@evinvest/i18n/policy";
import en from "@/messages/en/common.json";
import ru from "@/messages/ru/common.json";
import vi from "@/messages/vi/common.json";
import fr from "@/messages/fr/common.json";
import de from "@/messages/de/common.json";

// Static imports, not a dynamic `import(\`../messages/${locale}\`)`: every locale
// is prerendered at build, so there is nothing to defer, and a template import
// defeats bundling and turns a missing catalogue into a runtime 500 instead of a
// build error.
const AUTHORED: Record<Exclude<Locale, "en">, TranslatedCatalogue> = {
  ru,
  vi,
  fr,
  de,
};

// Policy applied once at module scope, not per request. `resolveCatalogue` is
// pure over static input, so the result is identical for every render — doing it
// per call would re-validate every plural on every page.
const RESOLVED = Object.fromEntries(
  (Object.keys(AUTHORED) as Exclude<Locale, "en">[]).map(locale => [
    locale,
    resolveCatalogue(locale, en, AUTHORED[locale]),
  ])
);

// `resolveCatalogue` never leaves a hole, so a reader on /de cannot tell a
// translated page from an English one served under German chrome — which is the
// failure `i18n:check` exists to catch, except nothing forces that check to have
// run before a server boots. Said once at module scope rather than per render:
// the set is static, and a per-call hook could not see these at all, since the
// English was substituted into `messages` before `t` ever looks.
for (const { locale, missing, rejected } of Object.values(RESOLVED)) {
  const keys = [...missing, ...rejected.map(r => r.key)];
  if (keys.length > 0)
    console.warn(
      `i18n ${locale}: English served for ${keys.length} key(s) —` +
        ` ${missing.length} untranslated, ${rejected.length} rejected by policy:` +
        ` ${keys.join(", ")}`
    );
}

export const messagesFor = (locale: Locale): Messages =>
  locale === "en" ? en : (RESOLVED[locale]?.messages ?? en);

// A key the resolved catalogue has never heard of means the committed English
// catalogue no longer matches the code — `npm run i18n:extract` was not run.
// Deduplicated because this fires per render, and the same stale key renders on
// every page. `npm run i18n:check` is the build-time half.
const warned = new Set<string>();
const warnUnknownKey = (key: string, locale: Locale) => {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(
    `i18n ${locale}: "${key}" is not in messages/en/common.json — rendering the` +
      ` inline English. Run \`npm run i18n:extract\`.`
  );
};

// The one place this app binds a translator: `@evinvest/i18n` owns the contract
// (`t(key, en)`, catalogue generated back out of the code), and what is left
// here is which catalogue and where an unknown key is reported — both app
// policy. Server Components call this; client islands take the same function
// from `@evinvest/i18n/react`, which the <I18nProvider> in site-document.tsx
// builds the same way.
export const translate = (locale: Locale): Translate =>
  translator(messagesFor(locale), locale, warnUnknownKey);

/** Per-locale policy outcome — read by `npm run i18n:check`. */
export const catalogueReport = () => Object.values(RESOLVED);

// Which locales have enough translated copy to be worth indexing.
//
// All five. The list was held at `["en"]` while the long-form page copy was
// still English behind a translated shell — five near-duplicate URLs earn a
// duplicate-content penalty rather than five rankings. That condition is gone:
// `npm run i18n:check` reports 100% coverage on ru/vi/fr/de with no drift, so a
// reader landing on /de reads German, and the four locales are now worth the
// crawl budget they ask for.
//
// `i18n:check` is the gate, not a formality. It is what makes this list
// truthful, so if a locale ever regresses to wholesale English fallback, take it
// out of here before shipping — a `noindex` locale costs nothing, whereas a
// locale advertising a translation it no longer has is what teaches Google to
// distrust the whole hreflang cluster.
//
// One thing this list deliberately does NOT speak for: content this repo does
// not translate. A publication's Typst *document* is English-only unless
// `Publication.locales` says otherwise, and those pages narrow their own
// alternates via `contentLocales` — see shared/seo/hreflang.ts. Vacancies need
// no such carve-out; the backend localises them per request.
export const INDEXED_LOCALES: readonly Locale[] = LOCALES;

export const isIndexed = (locale: Locale) => INDEXED_LOCALES.includes(locale);
