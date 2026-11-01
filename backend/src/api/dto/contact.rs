use domain::{
	error::DomainError,
	model::{contact::NewContact, email::EmailAddress, message_body::MessageBody, person_name::PersonName},
};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateContactRequest {
	#[schema(example = "Jane Doe", min_length = 2, max_length = 100)]
	pub name: String,
	#[schema(example = "jane@example.com", max_length = 254)]
	pub email: String,
	#[schema(example = "I'd like to learn more about the Quy Nhơn fund.", min_length = 1, max_length = 5000)]
	pub message: String,
}

impl CreateContactRequest {
	pub fn into_domain(self) -> Result<NewContact, DomainError> {
		Ok(NewContact {
			name: PersonName::parse(self.name)?,
			email: EmailAddress::parse(self.email)?,
			message: MessageBody::parse("message", self.message)?,
		})
	}
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ContactAccepted {
	pub id: Uuid,
	pub status: String,
}
