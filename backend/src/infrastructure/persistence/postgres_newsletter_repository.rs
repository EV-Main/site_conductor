use async_trait::async_trait;
use domain::{
	architecture::Repository,
	error::DomainError,
	model::{
		email::EmailAddress,
		newsletter::{NewNewsletterSubscription, NewsletterId, NewsletterSubscription},
	},
};
use sqlx::PgPool;
use time::OffsetDateTime;
use uuid::Uuid;

use super::{corrupt_row, map_sqlx_error, to_timestamp};
use crate::domain::port::newsletter_repository::NewsletterRepository;

pub struct PostgresNewsletterRepository {
	pool: PgPool,
}
impl PostgresNewsletterRepository {
	pub fn new(pool: PgPool) -> Self {
		Self { pool }
	}
}

#[derive(sqlx::FromRow)]
struct NewsletterRow {
	id: Uuid,
	email: String,
	created_at: OffsetDateTime,
}

impl TryFrom<NewsletterRow> for NewsletterSubscription {
	type Error = DomainError;

	fn try_from(row: NewsletterRow) -> Result<Self, Self::Error> {
		Ok(Self {
			id: NewsletterId::from_raw(row.id),
			email: EmailAddress::parse(row.email).map_err(corrupt_row)?,
			created_at: to_timestamp(row.created_at)?,
		})
	}
}

impl Repository for PostgresNewsletterRepository {
	type Aggregate = NewsletterSubscription;
}

#[async_trait]
impl NewsletterRepository for PostgresNewsletterRepository {
	async fn create(&self, new: NewNewsletterSubscription) -> Result<NewsletterSubscription, DomainError> {
		let row = sqlx::query_as::<_, NewsletterRow>(
			"INSERT INTO newsletter_subscriptions (email) \
			 VALUES ($1) \
			 RETURNING id, email, created_at",
		)
		.bind(new.email.as_str())
		.fetch_one(&self.pool)
		.await
		.map_err(map_sqlx_error)?;
		row.try_into()
	}
}
