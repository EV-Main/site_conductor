use async_trait::async_trait;
use domain::{
	architecture::Gateway,
	error::DomainError,
	model::{application::JobApplication, contact::ContactMessage, newsletter::NewsletterSubscription, vacancy::Vacancy},
};

/// External notification boundary (email). A `Gateway`, not a `Repository`:
/// it owns delivery to a system we don't control and can't enrol in a local
/// transaction. Each method fans out to both the candidate-facing confirmation
/// and the internal team copy; the role block is rendered conditionally on
/// `vacancy` being `Some` (the universal-letter mechanic from the design).
#[async_trait]
pub trait Notifier: Gateway {
	async fn application_received(&self, application: &JobApplication, vacancy: Option<&Vacancy>) -> Result<(), DomainError>;
	async fn contact_received(&self, message: &ContactMessage) -> Result<(), DomainError>;
	/// Send a "welcome to the list" confirmation to a new newsletter subscriber.
	async fn newsletter_subscribed(&self, subscription: &NewsletterSubscription) -> Result<(), DomainError>;
}
