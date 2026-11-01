use std::sync::Arc;

use domain::{
	error::DomainError,
	model::newsletter::{NewNewsletterSubscription, NewsletterSubscription},
};

use crate::{
	application::deliver_best_effort,
	domain::port::{newsletter_repository::NewsletterRepository, notifier::Notifier},
};

#[derive(Clone)]
pub struct NewsletterService {
	subscriptions: Arc<dyn NewsletterRepository>,
	notifier: Arc<dyn Notifier>,
}

impl NewsletterService {
	pub fn new(subscriptions: Arc<dyn NewsletterRepository>, notifier: Arc<dyn Notifier>) -> Self {
		Self { subscriptions, notifier }
	}

	/// Store the address, then welcome it. A repeat address is a `Conflict` from
	/// the unique index — the caller turns that into `409`, so re-subscribing
	/// never silently mails a second welcome.
	pub async fn subscribe(&self, new: NewNewsletterSubscription) -> Result<NewsletterSubscription, DomainError> {
		let subscription = self.subscriptions.create(new).await?;
		deliver_best_effort(self.notifier.newsletter_subscribed(&subscription), "newsletter", subscription.id.raw()).await;
		Ok(subscription)
	}
}
