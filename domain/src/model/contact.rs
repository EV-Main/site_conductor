use jiff::Timestamp;
use serde::{Deserialize, Serialize};

use crate::{
	architecture::{AggregateRoot, Entity, Id},
	model::{email::EmailAddress, message_body::MessageBody, person_name::PersonName},
};

pub type ContactId = Id<ContactTag, uuid::Uuid>;
pub struct ContactTag;

/// A vacancy-agnostic message from the contact surface.
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ContactMessage {
	pub id: ContactId,
	pub name: String,
	pub email: EmailAddress,
	pub message: String,
	pub created_at: Timestamp,
}

impl Entity for ContactMessage {
	type Id = ContactId;

	fn id(&self) -> ContactId {
		self.id
	}
}

impl AggregateRoot for ContactMessage {
	const NAME: &'static str = "contact_message";
}

/// Validated intent to create a [`ContactMessage`].
#[derive(Clone, Debug)]
pub struct NewContact {
	pub name: PersonName,
	pub email: EmailAddress,
	pub message: MessageBody,
}
