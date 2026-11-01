//! Use cases. Each service depends only on driven-side ports (trait objects),
//! never on a concrete adapter — so they are unit-testable with in-memory fakes
//! and unaware of Postgres or SMTP.

pub mod application_service;
pub mod contact_service;
pub mod newsletter_service;
pub mod vacancy_service;

use std::future::Future;

use domain::error::DomainError;

/// Await a confirmation send without letting it fail the use case.
///
/// Every public intake (application, contact, newsletter) commits its row first
/// and mails second. The row is the user's the moment it is written, so a
/// refused SMTP hop must be logged and swallowed rather than surfaced as an
/// error to someone whose submit actually succeeded.
pub(crate) async fn deliver_best_effort(send: impl Future<Output = Result<(), DomainError>>, kind: &str, id: uuid::Uuid) {
	if let Err(error) = send.await {
		tracing::error!(%error, %id, kind, "failed to send confirmation email");
	}
}
