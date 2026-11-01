use std::time::Duration;

use ev_lib::analytics::{Analytics, Event};

use crate::application::{application_service::ApplicationService, contact_service::ContactService, newsletter_service::NewsletterService, vacancy_service::VacancyService};

/// Upper bound on how long a best-effort analytics capture may delay a response.
const CAPTURE_TIMEOUT: Duration = Duration::from_millis(500);

/// Shared, cheap-to-clone handle injected into every handler. Each service is
/// itself a thin `Arc`-backed wrapper over ports; `Analytics` holds a pooled
/// reqwest client and no-ops when unconfigured.
#[derive(Clone)]
pub struct AppState {
	pub vacancies: VacancyService,
	pub applications: ApplicationService,
	pub contacts: ContactService,
	pub newsletter: NewsletterService,
	pub analytics: Analytics,
}

impl AppState {
	pub fn new(vacancies: VacancyService, applications: ApplicationService, contacts: ContactService, newsletter: NewsletterService, analytics: Analytics) -> Self {
		Self {
			vacancies,
			applications,
			contacts,
			newsletter,
			analytics,
		}
	}

	/// Best-effort, time-bounded server-side capture. Never delays a response by
	/// more than [`CAPTURE_TIMEOUT`], and logs (never propagates) failures — the
	/// analytics POST is off the user's critical path in spirit, bounded in fact.
	/// `"server"` is the analytics lib's anonymous server-event distinct id.
	pub async fn capture(&self, event: Event) {
		match tokio::time::timeout(CAPTURE_TIMEOUT, self.analytics.capture("server", &event)).await {
			Ok(Ok(())) => {}
			Ok(Err(error)) => tracing::warn!(%error, "analytics capture failed"),
			Err(_) => tracing::warn!("analytics capture timed out"),
		}
	}
}
