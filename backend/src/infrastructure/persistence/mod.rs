pub mod postgres_application_repository;
pub mod postgres_contact_repository;
pub mod postgres_newsletter_repository;
pub mod postgres_vacancy_repository;

use domain::error::DomainError;

/// Map a raw sqlx error to a `DomainError`. Unique-violations become a
/// `Conflict`; everything else is an opaque `Repository` failure (logged, never
/// surfaced verbatim).
pub(crate) fn map_sqlx_error(err: sqlx::Error) -> DomainError {
	if let sqlx::Error::Database(ref db_err) = err
		&& db_err.is_unique_violation()
	{
		return DomainError::Conflict("a record with that unique key already exists".into());
	}
	DomainError::Repository(err.to_string())
}

/// A persisted row failed to parse back into a domain value object — the DB
/// holds data that violates an invariant. This is a bug or external tampering,
/// never a client error.
pub(crate) fn corrupt_row(err: DomainError) -> DomainError {
	DomainError::Repository(format!("corrupt row: {err}"))
}

/// Convert a `time::OffsetDateTime` (sqlx `TIMESTAMPTZ`) into a `jiff::Timestamp`.
pub(crate) fn to_timestamp(value: time::OffsetDateTime) -> Result<jiff::Timestamp, DomainError> {
	jiff::Timestamp::new(value.unix_timestamp(), value.nanosecond() as i32).map_err(|e| DomainError::Repository(format!("invalid timestamp: {e}")))
}
