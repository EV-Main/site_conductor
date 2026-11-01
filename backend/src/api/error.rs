use axum::{
	Json,
	http::StatusCode,
	response::{IntoResponse, Response},
};
use domain::error::DomainError;
use serde_json::json;

/// HTTP adapter for [`DomainError`]. The `?` operator in handlers converts
/// domain errors into this, which renders the right status + JSON body. Only
/// genuine 5xx (`Repository`) failures are forwarded to error monitoring.
pub struct ApiError(pub DomainError);

impl From<DomainError> for ApiError {
	fn from(err: DomainError) -> Self {
		Self(err)
	}
}

impl IntoResponse for ApiError {
	fn into_response(self) -> Response {
		let (status, message) = match &self.0 {
			DomainError::NotFound { entity, id } => (StatusCode::NOT_FOUND, format!("{entity} not found: {id}")),
			DomainError::Conflict(msg) => (StatusCode::CONFLICT, msg.clone()),
			DomainError::Validation(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
			DomainError::Repository(err) => {
				ev_lib::error_monitoring::report(&self.0);
				tracing::error!(error = %err, "internal repository error");
				(StatusCode::INTERNAL_SERVER_ERROR, "internal server error".to_string())
			}
		};
		(status, Json(json!({ "error": message }))).into_response()
	}
}
