use crate::{error::DomainError, model::newtype::string_newtype};

string_newtype! {
	/// A person's name as typed into a form. Deliberately loose — just enough to
	/// stop junk and abuse: trimmed, 2–100 characters, letters in any script plus
	/// space/hyphen/apostrophe/period, and at least two actual letters.
	PersonName
}

impl PersonName {
	pub fn parse(raw: impl Into<String>) -> Result<Self, DomainError> {
		let trimmed = raw.into().trim().to_string();
		if !(2..=100).contains(&trimmed.chars().count()) {
			return Err(DomainError::Validation("name must be 2-100 characters".to_string()));
		}
		if !trimmed.chars().all(|c| c.is_alphabetic() || matches!(c, ' ' | '-' | '\'' | '.')) {
			return Err(DomainError::Validation("name may only contain letters, spaces, hyphens, apostrophes and periods".to_string()));
		}
		if trimmed.chars().filter(|c| c.is_alphabetic()).count() < 2 {
			return Err(DomainError::Validation("name must contain at least 2 letters".to_string()));
		}
		Ok(Self(trimmed))
	}
}

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn accepts_valid_names() {
		for raw in ["Jane Doe", "Nguyễn Văn A", "Ольга-Мария", "O'Brien", "J. R. R. Tolkien", "Al", "  padded name  "] {
			assert!(PersonName::parse(raw).is_ok(), "expected {raw:?} to parse");
		}
	}

	#[test]
	fn counts_characters_not_bytes() {
		let at_cap = "é".repeat(100);
		assert!(at_cap.len() > 100, "multibyte fixture must exceed the cap in bytes");
		assert!(PersonName::parse(&at_cap).is_ok());
		assert!(PersonName::parse(format!("é{at_cap}")).is_err());
	}

	#[test]
	fn rejects_too_short_names() {
		for raw in ["", " ", "A", "  A  "] {
			assert!(PersonName::parse(raw).is_err(), "expected {raw:?} to be rejected");
		}
	}

	#[test]
	fn rejects_unsupported_characters() {
		for raw in ["Jane2 Doe", "jane@doe", "Jane_Doe", "Jane\tDoe", "Jane\u{7}Doe", "Jane, Doe", "<Jane>"] {
			assert!(PersonName::parse(raw).is_err(), "expected {raw:?} to be rejected");
		}
	}

	#[test]
	fn requires_at_least_two_letters() {
		for raw in ["..", "- -", "A.", "'-.'"] {
			assert!(PersonName::parse(raw).is_err(), "expected {raw:?} to be rejected");
		}
	}
}
