use async_trait::async_trait;
use domain::{
	architecture::Repository,
	error::DomainError,
	model::newsletter::{NewNewsletterSubscription, NewsletterSubscription},
};

#[async_trait]
pub trait NewsletterRepository: Repository<Aggregate = NewsletterSubscription> {
	async fn create(&self, new: NewNewsletterSubscription) -> Result<NewsletterSubscription, DomainError>;
}
