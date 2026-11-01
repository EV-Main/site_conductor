use crate::{error::DomainError, model::newtype::string_newtype};

string_newtype! {
	/// Free-text body of a form submission (contact message, application letter,
	/// screening answer). Trimmed, 1–5000 characters. `field` names the form field
	/// in the error so the API surfaces per-field messages.
	MessageBody
}

impl MessageBody {
	pub fn parse(field: &'static str, raw: impl Into<String>) -> Result<Self, DomainError> {
		let trimmed = raw.into().trim().to_string();
		if trimmed.is_empty() {
			return Err(DomainError::Validation(format!("{field} is required")));
		}
		if trimmed.chars().count() > 5000 {
			return Err(DomainError::Validation(format!("{field} must be at most 5000 characters")));
		}
		Ok(Self(trimmed))
	}
}

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn accepts_boundary_lengths() {
		assert!(MessageBody::parse("message", "x").is_ok());
		assert!(MessageBody::parse("message", "ф".repeat(5000)).is_ok());
	}

	#[test]
	fn trims_surrounding_whitespace() {
		assert_eq!(MessageBody::parse("message", "  hi  ").unwrap().as_str(), "hi");
	}

	#[test]
	fn rejects_empty_bodies() {
		for raw in ["", "   ", "\n\t"] {
			let err = MessageBody::parse("message", raw).unwrap_err();
			assert!(err.to_string().contains("message is required"), "expected {raw:?} to be rejected as missing");
		}
	}

	#[test]
	fn rejects_oversized_bodies() {
		assert!(MessageBody::parse("message", "ф".repeat(5001)).is_err());
	}
}
