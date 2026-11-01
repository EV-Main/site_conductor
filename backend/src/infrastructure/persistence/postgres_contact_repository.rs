use async_trait::async_trait;
use domain::{
	architecture::Repository,
	error::DomainError,
	model::{
		contact::{ContactId, ContactMessage, NewContact},
		email::EmailAddress,
	},
};
use sqlx::PgPool;
use time::OffsetDateTime;
use uuid::Uuid;

use super::{corrupt_row, map_sqlx_error, to_timestamp};
use crate::domain::port::contact_repository::ContactRepository;

pub struct PostgresContactRepository {
	pool: PgPool,
}
impl PostgresContactRepository {
	pub fn new(pool: PgPool) -> Self {
		Self { pool }
	}
}

#[derive(sqlx::FromRow)]
struct ContactRow {
	id: Uuid,
	name: String,
	email: String,
	message: String,
	created_at: OffsetDateTime,
}

impl TryFrom<ContactRow> for ContactMessage {
	type Error = DomainError;

	fn try_from(row: ContactRow) -> Result<Self, Self::Error> {
		Ok(Self {
			id: ContactId::from_raw(row.id),
			name: row.name,
			email: EmailAddress::parse(row.email).map_err(corrupt_row)?,
			message: row.message,
			created_at: to_timestamp(row.created_at)?,
		})
	}
}

impl Repository for PostgresContactRepository {
	type Aggregate = ContactMessage;
}

#[async_trait]
impl ContactRepository for PostgresContactRepository {
	async fn create(&self, new: NewContact) -> Result<ContactMessage, DomainError> {
		let row = sqlx::query_as::<_, ContactRow>(
			"INSERT INTO contact_messages (name, email, message) \
			 VALUES ($1, $2, $3) \
			 RETURNING id, name, email, message, created_at",
		)
		.bind(new.name.as_str())
		.bind(new.email.as_str())
		.bind(new.message.as_str())
		.fetch_one(&self.pool)
		.await
		.map_err(map_sqlx_error)?;
		row.try_into()
	}
}
