use utoipa::OpenApi;

use crate::api::{
	dto::{
		application::{ApplicationAccepted, CreateApplicationRequest},
		contact::{ContactAccepted, CreateContactRequest},
		newsletter::{SubscribeNewsletterAccepted, SubscribeNewsletterRequest},
		vacancy::{VacancyDetail, VacancySummary},
	},
	handler,
};

/// Root of the generated OpenAPI 3.1 document — the single source of truth for
/// the HTTP contract. Paths come from the `#[utoipa::path]` macros; schemas from
/// the `ToSchema` derives on the DTOs. Dumped to `backend/openapi.json` by the
/// `gen_openapi` binary, which feeds the frontend's `npm run gen:api`.
#[derive(OpenApi)]
#[openapi(
	info(title = "EV Investment site conductor API", description = "Source of truth for vacancies, applications and contact messages.", version = env!("CARGO_PKG_VERSION")),
	paths(
		handler::health::health,
		handler::vacancy::list_vacancies,
		handler::vacancy::get_vacancy,
		handler::application::create_application,
		handler::contact::create_contact,
		handler::newsletter::subscribe_newsletter,
	),
	components(schemas(VacancySummary, VacancyDetail, CreateApplicationRequest, ApplicationAccepted, CreateContactRequest, ContactAccepted, SubscribeNewsletterRequest, SubscribeNewsletterAccepted)),
	tags(
		(name = "vacancies", description = "Open roles"),
		(name = "applications", description = "Job applications"),
		(name = "contact", description = "Contact messages"),
		(name = "newsletter", description = "Newsletter subscriptions"),
		(name = "health", description = "Liveness"),
	),
)]
pub struct ApiDoc;
