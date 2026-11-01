use axum::{Json, extract::State, http::StatusCode};
use ev_lib::analytics::Event;

use crate::api::{
	dto::application::{ApplicationAccepted, CreateApplicationRequest},
	error::ApiError,
	state::AppState,
};

/// `POST /applications` — submit a job application (general or for a role).
/// Returns `202 Accepted`: the application is persisted synchronously, while
/// the confirmation/notification emails are dispatched best-effort.
#[utoipa::path(
	post,
	path = "/api/v1/applications",
	tag = "applications",
	request_body = CreateApplicationRequest,
	responses(
		(status = 202, description = "Application received", body = ApplicationAccepted),
		(status = 400, description = "Validation failed"),
		(status = 404, description = "Referenced role not found"),
	),
)]
pub async fn create_application(State(state): State<AppState>, Json(payload): Json<CreateApplicationRequest>) -> Result<(StatusCode, Json<ApplicationAccepted>), ApiError> {
	let (slug, new) = payload.into_domain()?;
	let from_vacancy = slug.is_some();
	let application = state.applications.submit(slug, new).await?;

	// Best-effort, time-bounded server-side capture; no-ops without a key.
	state.capture(Event::new("application_submitted").prop("from_vacancy", from_vacancy)).await;

	Ok((
		StatusCode::ACCEPTED,
		Json(ApplicationAccepted {
			id: application.id.raw(),
			status: "received".to_string(),
		}),
	))
}
