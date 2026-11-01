use domain::{
	error::DomainError,
	model::{
		application::{ConfirmedRequirements, NewApplication},
		email::EmailAddress,
		message_body::MessageBody,
		person_name::PersonName,
		portfolio_url::PortfolioUrl,
		vacancy::Slug,
	},
};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

use super::optional;

/// Inbound payload for `POST /applications`. `vacancy_slug == None` is a
/// general talent-pool application; `confirmed_requirements` and
/// `screening_answer` are only meaningful when applying to a specific role.
#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateApplicationRequest {
	#[schema(example = "investment-analyst")]
	pub vacancy_slug: Option<String>,
	#[schema(example = "Jane Doe", min_length = 2, max_length = 100)]
	pub name: String,
	#[schema(example = "jane@example.com", max_length = 254)]
	pub email: String,
	#[schema(max_length = 2048)]
	pub portfolio_url: Option<String>,
	#[schema(example = "I underwrote 40 coastal deals at...", min_length = 1, max_length = 5000)]
	pub message: String,
	#[serde(default)]
	#[schema(max_items = 20)]
	pub confirmed_requirements: Vec<String>,
	#[schema(max_length = 5000)]
	pub screening_answer: Option<String>,
}

impl CreateApplicationRequest {
	/// Validate at the boundary and split into the slug (resolved by the
	/// service) and the domain draft.
	pub fn into_domain(self) -> Result<(Option<Slug>, NewApplication), DomainError> {
		let slug = match optional(self.vacancy_slug) {
			Some(s) => Some(Slug::parse(s)?),
			None => None,
		};
		let portfolio_url = match optional(self.portfolio_url) {
			Some(u) => Some(PortfolioUrl::parse(u)?),
			None => None,
		};
		let screening_answer = match optional(self.screening_answer) {
			Some(a) => Some(MessageBody::parse("screening_answer", a)?),
			None => None,
		};
		let new = NewApplication {
			applicant_name: PersonName::parse(self.name)?,
			email: EmailAddress::parse(self.email)?,
			portfolio_url,
			message: MessageBody::parse("message", self.message)?,
			confirmed_requirements: ConfirmedRequirements::parse(self.confirmed_requirements)?,
			screening_answer,
		};
		Ok((slug, new))
	}
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ApplicationAccepted {
	pub id: Uuid,
	pub status: String,
}
