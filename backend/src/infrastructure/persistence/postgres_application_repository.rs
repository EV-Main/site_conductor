use async_trait::async_trait;
use domain::{
	architecture::Repository,
	error::DomainError,
	model::{
		application::{ApplicationId, JobApplication, NewApplication},
		email::EmailAddress,
		vacancy::VacancyId,
	},
};
use sqlx::PgPool;
use time::OffsetDateTime;
use uuid::Uuid;

use super::{corrupt_row, map_sqlx_error, to_timestamp};
use crate::domain::port::application_repository::ApplicationRepository;

pub struct PostgresApplicationRepository {
	pool: PgPool,
}
impl PostgresApplicationRepository {
	pub fn new(pool: PgPool) -> Self {
		Self { pool }
	}
}

#[derive(sqlx::FromRow)]
struct ApplicationRow {
	id: Uuid,
	vacancy_id: Option<Uuid>,
	applicant_name: String,
	email: String,
	portfolio_url: Option<String>,
	message: String,
	confirmed_requirements: Vec<String>,
	screening_answer: Option<String>,
	created_at: OffsetDateTime,
}

impl TryFrom<ApplicationRow> for JobApplication {
	type Error = DomainError;

	fn try_from(row: ApplicationRow) -> Result<Self, Self::Error> {
		Ok(Self {
			id: ApplicationId::from_raw(row.id),
			vacancy_id: row.vacancy_id.map(VacancyId::from_raw),
			applicant_name: row.applicant_name,
			email: EmailAddress::parse(row.email).map_err(corrupt_row)?,
			portfolio_url: row.portfolio_url,
			message: row.message,
			confirmed_requirements: row.confirmed_requirements,
			screening_answer: row.screening_answer,
			created_at: to_timestamp(row.created_at)?,
		})
	}
}

impl Repository for PostgresApplicationRepository {
	type Aggregate = JobApplication;
}

#[async_trait]
impl ApplicationRepository for PostgresApplicationRepository {
	async fn create(&self, vacancy_id: Option<VacancyId>, new: NewApplication) -> Result<JobApplication, DomainError> {
		let row = sqlx::query_as::<_, ApplicationRow>(
			"INSERT INTO job_applications \
			 (vacancy_id, applicant_name, email, portfolio_url, message, confirmed_requirements, screening_answer) \
			 VALUES ($1, $2, $3, $4, $5, $6, $7) \
			 RETURNING id, vacancy_id, applicant_name, email, portfolio_url, message, confirmed_requirements, screening_answer, created_at",
		)
		.bind(vacancy_id.map(VacancyId::raw))
		.bind(new.applicant_name.as_str())
		.bind(new.email.as_str())
		.bind(new.portfolio_url.as_ref().map(|u| u.as_str()))
		.bind(new.message.as_str())
		.bind(new.confirmed_requirements.as_slice())
		.bind(new.screening_answer.as_ref().map(|a| a.as_str()))
		.fetch_one(&self.pool)
		.await
		.map_err(map_sqlx_error)?;
		row.try_into()
	}
}
