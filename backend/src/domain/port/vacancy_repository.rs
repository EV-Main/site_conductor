use async_trait::async_trait;
use domain::{
	architecture::{Reader, Repository},
	error::DomainError,
	model::vacancy::{LocalizedVacancy, Slug, Vacancy, VacancyCategory, VacancyId},
};
use ev_lib::i18n::Locale;

#[async_trait]
pub trait VacancyRepository: Repository<Aggregate = Vacancy> + Reader<Aggregate = Vacancy> {
	/// Published roles matching `filter`, most recent first, resolved for
	/// `locale`. Every published role is returned in every locale — untranslated
	/// ones carry their English text and `translated: false`. That is rule 1.3's
	/// `fallback`, chosen deliberately for this collection; see
	/// `docs/i18n-persisted-content.md`.
	async fn list(&self, filter: VacancyFilter, locale: Locale) -> Result<Vec<LocalizedVacancy>, DomainError>;
	/// A published role by slug — the public detail/apply lookup. Unpublished
	/// (draft) roles resolve to `None`, matching `list()`.
	async fn find_by_slug(&self, slug: &Slug, locale: Locale) -> Result<Option<LocalizedVacancy>, DomainError>;
	/// Canonical English, deliberately not localised: this is the internal
	/// lookup behind an application, and the reviewer reading the notification
	/// email works from the role as authored. A translated screening question in
	/// that email would describe a prompt the reviewer never wrote.
	async fn find_by_id(&self, id: VacancyId) -> Result<Option<Vacancy>, DomainError>;
}
/// Read-side filter for the searchable board. `None` fields are wildcards.
#[derive(Clone, Debug, Default)]
pub struct VacancyFilter {
	pub category: Option<VacancyCategory>,
	pub search: Option<String>,
}
