use axum::{
	Router,
	body::Body,
	extract::DefaultBodyLimit,
	http::Request,
	routing::{get, post},
};
use ev_lib::error_monitoring::{NewSentryLayer, SentryHttpLayer};
use tower::ServiceBuilder;
use tower_http::{cors::CorsLayer, trace::TraceLayer};
#[cfg(feature = "swagger")]
use utoipa::OpenApi;
#[cfg(feature = "swagger")]
use utoipa_swagger_ui::SwaggerUi;

#[cfg(feature = "swagger")]
use crate::api::openapi::ApiDoc;
use crate::api::{handler, state::AppState};

/// Assemble the HTTP surface: versioned routes, Swagger UI (when the `swagger`
/// feature is on), and the observability + CORS middleware stack. CORS is
/// permissive — a public read-mostly API behind a marketing site, no auth/cookies.
pub fn build(state: AppState) -> Router {
	let routes = Router::new()
		.route("/health", get(handler::health::health))
		.route("/vacancies", get(handler::vacancy::list_vacancies))
		.route("/vacancies/{slug}", get(handler::vacancy::get_vacancy))
		.route("/applications", post(handler::application::create_application))
		.route("/contact", post(handler::contact::create_contact))
		.route("/newsletter", post(handler::newsletter::subscribe_newsletter));

	let app = Router::new().nest("/api/v1", routes);
	#[cfg(feature = "swagger")]
	let app = app.merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()));

	app.layer(
		ServiceBuilder::new()
			.layer(NewSentryLayer::<Request<Body>>::new_from_top())
			.layer(SentryHttpLayer::new().enable_transaction()),
	)
	.layer(TraceLayer::new_for_http())
	.layer(CorsLayer::permissive())
	// 64 KiB comfortably fits the largest legitimate form submit while keeping
	// multi-megabyte junk out of the handlers.
	.layer(DefaultBodyLimit::max(64 * 1024))
	.with_state(state)
}
