use crate::{error::DomainError, model::newtype::string_newtype};

string_newtype! {
	/// A candidate-supplied http(s) link. The check is hand-rolled and structural
	/// — scheme, non-empty host, no whitespace/control characters, ≤ 2048 chars —
	/// because a full URL parser is not worth a dependency for one optional field.
	PortfolioUrl
}

impl PortfolioUrl {
	pub fn parse(raw: impl Into<String>) -> Result<Self, DomainError> {
		let trimmed = raw.into().trim().to_string();
		if trimmed.chars().count() > 2048 {
			return Err(DomainError::Validation("portfolio_url must be at most 2048 characters".to_string()));
		}
		if trimmed.chars().any(|c| c.is_whitespace() || c.is_control()) {
			return Err(DomainError::Validation("portfolio_url must not contain whitespace or control characters".to_string()));
		}
		let rest = trimmed
			.strip_prefix("http://")
			.or_else(|| trimmed.strip_prefix("https://"))
			.ok_or_else(|| DomainError::Validation("portfolio_url must start with http:// or https://".to_string()))?;
		let host = rest.split(['/', '?', '#']).next().unwrap_or_default();
		if host.is_empty() {
			return Err(DomainError::Validation("portfolio_url must include a host".to_string()));
		}
		Ok(Self(trimmed))
	}
}

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn accepts_valid_urls() {
		for raw in [
			"https://example.com",
			"http://example.com/portfolio?x=1#top",
			"https://localhost:3000/work",
			"  https://example.com  ",
		] {
			assert!(PortfolioUrl::parse(raw).is_ok(), "expected {raw:?} to parse");
		}
	}

	#[test]
	fn rejects_wrong_scheme_or_missing_host() {
		for raw in [
			"",
			"example.com",
			"ftp://example.com",
			"https://",
			"https:///path",
			"https://?q=1",
			"https://#top",
			"javascript:alert(1)",
		] {
			assert!(PortfolioUrl::parse(raw).is_err(), "expected {raw:?} to be rejected");
		}
	}

	#[test]
	fn rejects_inner_whitespace_and_control_characters() {
		for raw in ["https://exa mple.com", "https://example.com/a b", "https://example.com/a\tb", "https://example.com/\u{7}"] {
			assert!(PortfolioUrl::parse(raw).is_err(), "expected {raw:?} to be rejected");
		}
	}

	#[test]
	fn enforces_length_cap() {
		let base = "https://example.com/";
		let at_cap = format!("{base}{}", "a".repeat(2048 - base.len()));
		assert!(PortfolioUrl::parse(&at_cap).is_ok());
		assert!(PortfolioUrl::parse(format!("{at_cap}a")).is_err());
	}
}
