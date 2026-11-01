pub mod application;
pub mod contact;
pub mod newsletter;
pub mod vacancy;

/// Normalise an optional text field: trim, then collapse empty to `None`.
pub(crate) fn optional(value: Option<String>) -> Option<String> {
	value.map(|v| v.trim().to_string()).filter(|v| !v.is_empty())
}
