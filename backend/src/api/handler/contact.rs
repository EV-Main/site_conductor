use axum::{Json, extract::State, http::StatusCode};
use ev_lib::analytics::Event;

use crate::api::{
	dto::contact::{ContactAccepted, CreateContactRequest},
	error::ApiError,
	state::AppState,
};

/// `POST /contact` — submit a vacancy-agnostic contact message.
#[utoipa::path(
	post,
	path = "/api/v1/contact",
	tag = "contact",
	request_body = CreateContactRequest,
	responses(
		(status = 202, description = "Message received", body = ContactAccepted),
		(status = 400, description = "Validation failed"),
	),
)]
pub async fn create_contact(State(state): State<AppState>, Json(payload): Json<CreateContactRequest>) -> Result<(StatusCode, Json<ContactAccepted>), ApiError> {
	let new = payload.into_domain()?;
	let message = state.contacts.submit(new).await?;

	// Best-effort, time-bounded server-side capture; no-ops without a key.
	state.capture(Event::new("contact_submitted")).await;

	Ok((
		StatusCode::ACCEPTED,
		Json(ContactAccepted {
			id: message.id.raw(),
			status: "received".to_string(),
		}),
	))
}
