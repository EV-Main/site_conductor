use std::sync::Arc;

use domain::{
	architecture::AggregateRoot,
	error::DomainError,
	model::{
		application::{JobApplication, NewApplication},
		vacancy::{Slug, Vacancy},
	},
};
use ev_lib::i18n::DEFAULT_LOCALE;

use crate::{
	application::deliver_best_effort,
	domain::port::{application_repository::ApplicationRepository, notifier::Notifier, vacancy_repository::VacancyRepository},
};

#[derive(Clone)]
pub struct ApplicationService {
	applications: Arc<dyn ApplicationRepository>,
	vacancies: Arc<dyn VacancyRepository>,
	notifier: Arc<dyn Notifier>,
}

impl ApplicationService {
	pub fn new(applications: Arc<dyn ApplicationRepository>, vacancies: Arc<dyn VacancyRepository>, notifier: Arc<dyn Notifier>) -> Self {
		Self { applications, vacancies, notifier }
	}

	/// Submit an application. When `vacancy_slug` is `Some`, the role must
	/// exist (404 otherwise) and its context is embedded in the emails;
	/// `None` is a general talent-pool application. Email delivery is
	/// best-effort: a transport failure is logged but never fails the submit,
	/// since the application is already durably persisted.
	pub async fn submit(&self, vacancy_slug: Option<Slug>, new: NewApplication) -> Result<JobApplication, DomainError> {
		// Resolved in English, deliberately, and the locale is not plumbed here.
		// This role is not being *shown* to the applicant — it is being embedded
		// in the notification the team reads. A reviewer working from the English
		// posting should not receive a screening question phrased in a language
		// they may not read, describing a prompt they never wrote.
		//
		// The applicant's own confirmation inherits the same English copy, which
		// is the open question `docs/i18n-persisted-content.md` records under
		// "What this does not solve": whichever language the mail is composed in,
		// one of the two sides is reading a translation. Serving the reviewer is
		// the safer default until that is decided, because the applicant has
		// already seen the role in their own language on the page they applied
		// from.
		let vacancy = match vacancy_slug {
			Some(slug) => Some(
				self.vacancies
					.find_by_slug(&slug, DEFAULT_LOCALE)
					.await?
					.ok_or_else(|| DomainError::NotFound {
						entity: Vacancy::NAME,
						id: slug.into_string(),
					})?
					.vacancy,
			),
			None => None,
		};

		let application = self.applications.create(vacancy.as_ref().map(|v| v.id), new).await?;
		deliver_best_effort(self.notifier.application_received(&application, vacancy.as_ref()), "application", application.id.raw()).await;
		Ok(application)
	}
}
