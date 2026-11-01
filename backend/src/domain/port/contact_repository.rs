use async_trait::async_trait;
use domain::{
	architecture::Repository,
	error::DomainError,
	model::contact::{ContactMessage, NewContact},
};

#[async_trait]
pub trait ContactRepository: Repository<Aggregate = ContactMessage> {
	async fn create(&self, new: NewContact) -> Result<ContactMessage, DomainError>;
}
