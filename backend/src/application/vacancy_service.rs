use std::sync::Arc;

use domain::{
	architecture::AggregateRoot,
	error::DomainError,
	model::vacancy::{LocalizedVacancy, Slug, Vacancy},
};
use ev_lib::i18n::Locale;

use crate::domain::port::vacancy_repository::{VacancyFilter, VacancyRepository};

#[derive(Clone)]
pub struct VacancyService {
	repository: Arc<dyn VacancyRepository>,
}

impl VacancyService {
	pub fn new(repository: Arc<dyn VacancyRepository>) -> Self {
		Self { repository }
	}

	pub async fn list(&self, filter: VacancyFilter, locale: Locale) -> Result<Vec<LocalizedVacancy>, DomainError> {
		self.repository.list(filter, locale).await
	}

	pub async fn get_by_slug(&self, slug: &Slug, locale: Locale) -> Result<LocalizedVacancy, DomainError> {
		self.repository.find_by_slug(slug, locale).await?.ok_or_else(|| DomainError::NotFound {
			entity: Vacancy::NAME,
			id: slug.as_str().to_string(),
		})
	}
}
