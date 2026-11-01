use async_trait::async_trait;
use domain::{
	architecture::Repository,
	error::DomainError,
	model::{
		application::{JobApplication, NewApplication},
		vacancy::VacancyId,
	},
};

#[async_trait]
pub trait ApplicationRepository: Repository<Aggregate = JobApplication> {
	/// Persist a submission. `vacancy_id` is the resolved FK (the application
	/// service looks the slug up); `None` is a general talent-pool application.
	async fn create(&self, vacancy_id: Option<VacancyId>, new: NewApplication) -> Result<JobApplication, DomainError>;
}
