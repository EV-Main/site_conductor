-- Defense-in-depth for the limits enforced by the domain value objects.
-- Sanitize pre-existing oversized rows first so the CHECKs can never fail.

UPDATE job_applications SET
	applicant_name         = left(applicant_name, 100),
	email                  = left(email, 254),
	portfolio_url          = left(portfolio_url, 2048),
	message                = left(message, 5000),
	screening_answer       = left(screening_answer, 5000),
	confirmed_requirements = confirmed_requirements[1:20]
WHERE char_length(applicant_name) > 100
	OR char_length(email) > 254
	OR char_length(portfolio_url) > 2048
	OR char_length(message) > 5000
	OR char_length(screening_answer) > 5000
	OR cardinality(confirmed_requirements) > 20;

ALTER TABLE job_applications
	ADD CONSTRAINT job_applications_applicant_name_len_check CHECK (char_length(applicant_name) <= 100),
	ADD CONSTRAINT job_applications_email_len_check CHECK (char_length(email) <= 254),
	ADD CONSTRAINT job_applications_portfolio_url_len_check CHECK (char_length(portfolio_url) <= 2048),
	ADD CONSTRAINT job_applications_message_len_check CHECK (char_length(message) <= 5000),
	ADD CONSTRAINT job_applications_screening_answer_len_check CHECK (char_length(screening_answer) <= 5000),
	ADD CONSTRAINT job_applications_confirmed_requirements_count_check CHECK (cardinality(confirmed_requirements) <= 20);

UPDATE contact_messages SET
	name    = left(name, 100),
	email   = left(email, 254),
	message = left(message, 5000)
WHERE char_length(name) > 100
	OR char_length(email) > 254
	OR char_length(message) > 5000;

ALTER TABLE contact_messages
	ADD CONSTRAINT contact_messages_name_len_check CHECK (char_length(name) <= 100),
	ADD CONSTRAINT contact_messages_email_len_check CHECK (char_length(email) <= 254),
	ADD CONSTRAINT contact_messages_message_len_check CHECK (char_length(message) <= 5000);
