use std::sync::Arc;

use domain::{
	error::DomainError,
	model::contact::{ContactMessage, NewContact},
};

use crate::{
	application::deliver_best_effort,
	domain::port::{contact_repository::ContactRepository, notifier::Notifier},
};

#[derive(Clone)]
pub struct ContactService {
	contacts: Arc<dyn ContactRepository>,
	notifier: Arc<dyn Notifier>,
}

impl ContactService {
	pub fn new(contacts: Arc<dyn ContactRepository>, notifier: Arc<dyn Notifier>) -> Self {
		Self { contacts, notifier }
	}

	/// Store the message, then fan out the sender's receipt and the team copy.
	/// Both mails are attempted even if one address is rejected.
	pub async fn submit(&self, new: NewContact) -> Result<ContactMessage, DomainError> {
		let message = self.contacts.create(new).await?;
		deliver_best_effort(self.notifier.contact_received(&message), "contact", message.id.raw()).await;
		Ok(message)
	}
}
