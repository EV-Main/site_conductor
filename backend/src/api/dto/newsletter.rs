use domain::{
	error::DomainError,
	model::{email::EmailAddress, newsletter::NewNewsletterSubscription},
};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Deserialize, ToSchema)]
pub struct SubscribeNewsletterRequest {
	#[schema(example = "investor@example.com", max_length = 254)]
	pub email: String,
}

impl SubscribeNewsletterRequest {
	pub fn into_domain(self) -> Result<NewNewsletterSubscription, DomainError> {
		Ok(NewNewsletterSubscription {
			email: EmailAddress::parse(self.email)?,
		})
	}
}

#[derive(Debug, Serialize, ToSchema)]
pub struct SubscribeNewsletterAccepted {
	pub id: Uuid,
	pub status: String,
}
