use jiff::Timestamp;
use serde::{Deserialize, Serialize};

use crate::{
	architecture::{AggregateRoot, Entity, Id},
	error::DomainError,
	model::{email::EmailAddress, message_body::MessageBody, person_name::PersonName, portfolio_url::PortfolioUrl, vacancy::VacancyId},
};

pub type ApplicationId = Id<ApplicationTag, uuid::Uuid>;
pub struct ApplicationTag;

/// A candidate's submission. `vacancy_id == None` is a general talent-pool
/// application; `Some(_)` ties it to a specific role, which switches on the
/// role block in the confirmation/notification emails (the universal-letter
/// mechanic from the Figma design).
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct JobApplication {
	pub id: ApplicationId,
	pub vacancy_id: Option<VacancyId>,
	pub applicant_name: String,
	pub email: EmailAddress,
	pub portfolio_url: Option<String>,
	pub message: String,
	/// Requirements the candidate ticked — only meaningful for a role application.
	pub confirmed_requirements: Vec<String>,
	/// Answer to the role's screening prompt, when applying to a vacancy.
	pub screening_answer: Option<String>,
	pub created_at: Timestamp,
}

impl Entity for JobApplication {
	type Id = ApplicationId;

	fn id(&self) -> ApplicationId {
		self.id
	}
}

impl AggregateRoot for JobApplication {
	const NAME: &'static str = "job_application";
}

/// Requirement labels the candidate ticked. Items are trimmed and empties
/// dropped (mirroring how the form submits), then the count and per-item
/// length are capped so the list stays bounded end to end.
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(transparent)]
pub struct ConfirmedRequirements(Vec<String>);

impl ConfirmedRequirements {
	pub fn parse(raw: Vec<String>) -> Result<Self, DomainError> {
		let items: Vec<String> = raw.into_iter().map(|r| r.trim().to_string()).filter(|r| !r.is_empty()).collect();
		if items.len() > 20 {
			return Err(DomainError::Validation("confirmed_requirements must have at most 20 items".to_string()));
		}
		if items.iter().any(|r| r.chars().count() > 300) {
			return Err(DomainError::Validation("each confirmed requirement must be at most 300 characters".to_string()));
		}
		Ok(Self(items))
	}

	pub fn as_slice(&self) -> &[String] {
		&self.0
	}

	pub fn into_vec(self) -> Vec<String> {
		self.0
	}
}

/// Validated intent to create a [`JobApplication`]. The id, timestamp and the
/// resolved `vacancy_id` (from the application service, which looks up the
/// slug) are assigned downstream by the persistence adapter.
#[derive(Clone, Debug)]
pub struct NewApplication {
	pub applicant_name: PersonName,
	pub email: EmailAddress,
	pub portfolio_url: Option<PortfolioUrl>,
	pub message: MessageBody,
	pub confirmed_requirements: ConfirmedRequirements,
	pub screening_answer: Option<MessageBody>,
}

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn trims_and_drops_empty_requirement_items() {
		let parsed = ConfirmedRequirements::parse(vec!["  a  ".to_string(), String::new(), "   ".to_string(), "b".to_string()]).unwrap();
		assert_eq!(parsed.as_slice(), vec!["a", "b"]);
	}

	#[test]
	fn enforces_requirement_count_cap() {
		assert!(ConfirmedRequirements::parse(vec!["x".to_string(); 20]).is_ok());
		assert!(ConfirmedRequirements::parse(vec!["x".to_string(); 21]).is_err());
		let mut padded = vec!["x".to_string(); 20];
		padded.push("   ".to_string());
		assert!(ConfirmedRequirements::parse(padded).is_ok(), "empties must not count toward the cap");
	}

	#[test]
	fn enforces_requirement_item_length_cap() {
		assert!(ConfirmedRequirements::parse(vec!["y".repeat(300)]).is_ok());
		assert!(ConfirmedRequirements::parse(vec!["y".repeat(301)]).is_err());
	}
}
