# Translating persisted content (vacancies)

Decision record. The i18n policy (`@evinvest/i18n/policy`) governs *authored*
catalogues; this is how the same three rules apply to rows that live in Postgres
— today vacancies, tomorrow anything editorial the backend owns.

## Decision

**A sibling `vacancy_translations` table, keyed `(vacancy_id, locale)`, carrying
a digest of the English row it was translated from.**

```sql
CREATE TABLE vacancy_translations (
    vacancy_id         uuid        NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    locale             text        NOT NULL CHECK (locale IN ('ru', 'vi', 'fr', 'de')),

    title              text        NOT NULL,
    location           text        NOT NULL,
    employment_type    text        NOT NULL,
    summary            text        NOT NULL,
    about              text        NOT NULL,
    responsibilities   text[]      NOT NULL,
    requirements       text[]      NOT NULL,
    nice_to_have       text[]      NOT NULL,
    offer              text[]      NOT NULL,
    screening_question text        NOT NULL,

    -- Rule 1.2, in the database: the fingerprint of the English row this was
    -- translated from. Mismatch ⇒ stale ⇒ English is served instead.
    source_digest      text        NOT NULL,
    translated_at      timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (vacancy_id, locale)
);
```

`en` is deliberately absent from the CHECK: English is not a translation, it is
the row in `vacancies`. Rule 1.1 — the canonical locale is the source, and giving
it a translation row would create two places to edit the same words.

## Why this shape

**A sibling table, not a `locale` column on `vacancies`.** One vacancy is one
entity; a locale column would make it five rows sharing a slug, duplicating
`category`, `compensation`, `published` and `created_at`, and every query would
have to remember to filter by locale or silently return five copies of one job.

**A sibling table, not JSONB.** `locale` gets a real CHECK constraint and the FK
cascades on delete. A JSONB blob puts both of those in application code, where a
migration cannot enforce them and a bad write is only found when it renders.

**A sibling table, not `title_ru`, `title_vi`, …** Ten translatable fields ×
four locales is forty columns, and adding a locale is a schema change to a hot
table.

## Rule 1.2 here uses a digest, not the source text

The authored catalogues store the English string inline next to the translation,
because a reviewer reads those in a pull-request diff and needs to see what the
translator was looking at. Nobody reviews a database row in a diff, and inlining
the source would roughly double the table. So the same rule, different encoding:

```
source_digest = sha256(
    title ‖ location ‖ employment_type ‖ summary ‖ about ‖
    responsibilities ‖ requirements ‖ nice_to_have ‖ offer ‖ screening_question
)
```
over the **English** row, with a fixed separator and a fixed field order.

The digest covers the whole row, not each field. Vacancies are edited wholesale —
a role is rewritten, not comma-tuned — so row-level invalidation matches how the
content actually changes and keeps the check to one comparison. If editing ever
becomes incremental, per-field digests are the escalation, and the column becomes
a `jsonb` map of field → digest.

## Rule 1.3 here is `fallback`, not `hide`

This is the deliberate exception. Compiled marketing content (publications, the
whitepaper) is *hidden* when untranslated — a Russian reader given an English
essay under Russian chrome learns the locale is a veneer.

A vacancy is the opposite trade. Hiding an open role from a Russian speaker who
reads English perfectly well costs a candidate, and every one of these roles
already expects working English. So:

```ts
availableIn(locale, vacancies, v => v.locales, "fallback");
```

The listing shows every published role in every locale. An untranslated one
renders its English text with an explicit marker (below) rather than pretending.

## Contract

`GET /vacancies?locale=ru` and `GET /vacancies/{slug}?locale=ru`. The backend
resolves per row and reports what it did, so the frontend never has to guess:

```jsonc
{
  "slug": "investment-analyst",
  "title": "Аналитик по инвестициям",
  "locale": "ru",           // what was actually served
  "translated": true        // false ⇒ English text, show the marker
}
```

`translated: false` is returned when there is no row for the locale **or** when
`source_digest` no longer matches — the caller cannot tell the two apart, and
should not: both mean "this is canonical English", which is exactly rule 1.2.

Absent or unrecognised `locale` means `en`, matching `splitLocalePath`.

## Migration path

1. ~~Create the table (no data).~~ **Done** — `0005_vacancy_translations.sql`.
2. ~~Add the resolver, the `?locale=` query param and the two response
   fields.~~ **Done.** The digest comparison is a *join predicate*, not
   application code (see `LOCALIZED_FROM` in the Postgres repository), so a
   stale translation cannot reach a reader by any path — there is no branch to
   forget. English needs no special case: the `CHECK` forbids an `'en'` row, so
   binding `'en'` matches nothing and falls through the same way an untranslated
   role does.
3. ~~Backfill translations per locale.~~ **Done for all seven roles in all four
   locales** — `0006_seed_vacancy_translations.sql`. Every insert computes
   `source_digest` from the live English row via `vacancy_source_digest(v.*)`
   rather than hard-coding a hash, so a translation cannot be recorded against
   English that has already moved.
4. A vacancy edit invalidates its translations by construction — the digest stops
   matching and English is served until a translator catches up. Nothing to
   remember, which is the point. *Verified end to end: editing the English
   summary flips that role to `translated: false` and leaves the other six
   alone; reverting the edit restores the translation.*

The shipped translations are machine-produced and reviewed for structure, not
native-speaker copy. They are safe to serve — a reader gets either a current
translation or the English — but `INDEXED_LOCALES` should stay `["en"]` until a
native speaker has passed over them, because indexing is the point at which a
rough translation starts representing the fund to strangers.

An admin surface for step 3 is out of scope here; until it exists, translations
land by migration, the same way vacancies are seeded today
(`0002_seed_vacancies.sql`). That is also why re-running `0006` does **not**
refresh a stale row: the file records what was translated, and changed English
needs a new translation, not a recomputed digest over text nobody re-read.

## What this does not solve

The screening question and the requirement checklist are rendered *into the
application form and the notification email*. A candidate who applies in Russian
produces an application whose answers reference Russian prompts, read by a
reviewer who may be working from the English role. Whichever language the email
is composed in, one side sees a translation — worth deciding before step 3
backfills anything, and out of scope for this record.
