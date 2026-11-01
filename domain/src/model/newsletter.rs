use jiff::Timestamp;
use serde::{Deserialize, Serialize};

use crate::{
	architecture::{AggregateRoot, Entity, Id},
	model::email::EmailAddress,
};

pub type NewsletterId = Id<NewsletterTag, uuid::Uuid>;
pub struct NewsletterTag;

/// A confirmed newsletter subscription.
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct NewsletterSubscription {
	pub id: NewsletterId,
	pub email: EmailAddress,
	pub created_at: Timestamp,
}

impl Entity for NewsletterSubscription {
	type Id = NewsletterId;

	fn id(&self) -> NewsletterId {
		self.id
	}
}

impl AggregateRoot for NewsletterSubscription {
	const NAME: &'static str = "newsletter_subscription";
}

/// Validated intent to create a [`NewsletterSubscription`].
#[derive(Clone, Debug)]
pub struct NewNewsletterSubscription {
	pub email: EmailAddress,
}
