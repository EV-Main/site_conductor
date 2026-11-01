CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS vacancies (
	id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
	slug               TEXT        NOT NULL UNIQUE,
	title              TEXT        NOT NULL,
	category           TEXT        NOT NULL,
	location           TEXT        NOT NULL,
	employment_type    TEXT        NOT NULL,
	summary            TEXT        NOT NULL,
	about              TEXT        NOT NULL,
	responsibilities   TEXT[]      NOT NULL DEFAULT '{}',
	requirements       TEXT[]      NOT NULL DEFAULT '{}',
	nice_to_have       TEXT[]      NOT NULL DEFAULT '{}',
	offer              TEXT[]      NOT NULL DEFAULT '{}',
	screening_question TEXT        NOT NULL,
	compensation       TEXT        NOT NULL DEFAULT 'negotiable',
	published          BOOLEAN     NOT NULL DEFAULT TRUE,
	created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vacancies_category_idx ON vacancies (category);

CREATE TABLE IF NOT EXISTS job_applications (
	id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
	vacancy_id             UUID        REFERENCES vacancies (id) ON DELETE SET NULL,
	applicant_name         TEXT        NOT NULL,
	email                  TEXT        NOT NULL,
	portfolio_url          TEXT,
	message                TEXT        NOT NULL,
	confirmed_requirements TEXT[]      NOT NULL DEFAULT '{}',
	screening_answer       TEXT,
	created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_applications_vacancy_idx ON job_applications (vacancy_id);

CREATE TABLE IF NOT EXISTS contact_messages (
	id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
	name       TEXT        NOT NULL,
	email      TEXT        NOT NULL,
	message    TEXT        NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
