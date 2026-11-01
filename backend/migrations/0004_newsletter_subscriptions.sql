CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
	id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
	email      TEXT        NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

	CONSTRAINT newsletter_subscriptions_email_unique UNIQUE (email),
	CONSTRAINT newsletter_subscriptions_email_len_check CHECK (char_length(email) <= 254)
);
