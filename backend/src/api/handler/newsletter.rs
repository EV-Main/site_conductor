use axum::{Json, extract::State, http::StatusCode};
use ev_lib::analytics::Event;

use crate::api::{
	dto::newsletter::{SubscribeNewsletterAccepted, SubscribeNewsletterRequest},
	error::ApiError,
	state::AppState,
};

/// `POST /newsletter` — subscribe to the newsletter.
#[utoipa::path(
	post,
	path = "/api/v1/newsletter",
	tag = "newsletter",
	request_body = SubscribeNewsletterRequest,
	responses(
		(status = 202, description = "Subscribed", body = SubscribeNewsletterAccepted),
		(status = 400, description = "Validation failed"),
		(status = 409, description = "Already subscribed"),
	),
)]
pub async fn subscribe_newsletter(State(state): State<AppState>, Json(payload): Json<SubscribeNewsletterRequest>) -> Result<(StatusCode, Json<SubscribeNewsletterAccepted>), ApiError> {
	let new = payload.into_domain()?;
	let subscription = state.newsletter.subscribe(new).await?;

	state.capture(Event::new("newsletter_subscribed")).await;

	Ok((
		StatusCode::ACCEPTED,
		Json(SubscribeNewsletterAccepted {
			id: subscription.id.raw(),
			status: "subscribed".to_string(),
		}),
	))
}
