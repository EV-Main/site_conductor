-- Per-row translations for vacancies. See docs/i18n-persisted-content.md for the
-- decision record; this is step 1 (schema) and step 2's other half (the digest).
--
-- Creating the table changes nothing on its own: with no rows, every locale
-- resolves to the English in `vacancies` and the site behaves exactly as before.

-- Rule 1.2 of the translation policy, expressed once, in the database.
--
-- The authored catalogues carry the English inline beside each translation
-- because a reviewer reads those in a diff. Nobody reviews a database row in a
-- diff, so the same rule takes a different encoding here: a fingerprint of the
-- English row a translation was made from. When the English moves, the digest
-- stops matching and the translation is refused — English is served instead of a
-- stale translation quietly contradicting the page.
--
-- Defined as a function over the table's own row type so the field list exists
-- in exactly one place. The resolver joins on it, and every backfill computes it
-- from the live English row rather than hard-coding a hash, so a translation
-- inserted against edited English is impossible to get wrong by hand.
--
-- STABLE, not IMMUTABLE: the body is deterministic for text input, but
-- `array_to_string` is only STABLE (its result depends on type output
-- functions), and claiming otherwise to buy an index would be a lie the planner
-- is entitled to believe. STABLE is all a join condition needs.
--
-- The cost is one sha256 per row per query. At the size this table will ever be
-- — one row per open role — that is not worth trading for the second copy of the
-- field list a generated column would require.
CREATE OR REPLACE FUNCTION vacancy_source_digest(v vacancies) RETURNS TEXT
LANGUAGE sql STABLE AS $$
	-- Fixed field order, fixed separators: US (0x1f) between fields, RS (0x1e)
	-- inside arrays. Both are control characters that cannot occur in authored
	-- prose, so no title can impersonate a field boundary and collide with a
	-- different row. Every column below is NOT NULL, so no COALESCE is needed —
	-- and a NULL would poison the whole digest rather than a single field.
	SELECT encode(digest(
		    v.title              || E'\x1f'
		 || v.location           || E'\x1f'
		 || v.employment_type    || E'\x1f'
		 || v.summary            || E'\x1f'
		 || v.about              || E'\x1f'
		 || array_to_string(v.responsibilities, E'\x1e') || E'\x1f'
		 || array_to_string(v.requirements,     E'\x1e') || E'\x1f'
		 || array_to_string(v.nice_to_have,     E'\x1e') || E'\x1f'
		 || array_to_string(v.offer,            E'\x1e') || E'\x1f'
		 || v.screening_question
	, 'sha256'), 'hex')
$$;

CREATE TABLE IF NOT EXISTS vacancy_translations (
	vacancy_id         UUID        NOT NULL REFERENCES vacancies (id) ON DELETE CASCADE,
	-- 'en' is deliberately absent: English is not a translation, it is the row in
	-- `vacancies`. Rule 1.1 — the canonical locale is the source, and a row here
	-- would create a second place to edit the same words.
	locale             TEXT        NOT NULL CHECK (locale IN ('ru', 'vi', 'fr', 'de')),

	title              TEXT        NOT NULL,
	location           TEXT        NOT NULL,
	employment_type    TEXT        NOT NULL,
	summary            TEXT        NOT NULL,
	about              TEXT        NOT NULL,
	responsibilities   TEXT[]      NOT NULL DEFAULT '{}',
	requirements       TEXT[]      NOT NULL DEFAULT '{}',
	nice_to_have       TEXT[]      NOT NULL DEFAULT '{}',
	offer              TEXT[]      NOT NULL DEFAULT '{}',
	screening_question TEXT        NOT NULL,

	source_digest      TEXT        NOT NULL,
	translated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

	PRIMARY KEY (vacancy_id, locale)
);

-- The resolver looks up every translation for one locale in one pass; the PK is
-- ordered (vacancy_id, locale) and so cannot serve that prefix.
CREATE INDEX IF NOT EXISTS vacancy_translations_locale_idx ON vacancy_translations (locale);
