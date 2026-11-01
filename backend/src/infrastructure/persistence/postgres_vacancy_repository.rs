use async_trait::async_trait;
use domain::{
	architecture::{Reader, Repository},
	error::DomainError,
	model::vacancy::{Compensation, LocalizedVacancy, Slug, Vacancy, VacancyCategory, VacancyId, VacancyTranslation},
};
use ev_lib::i18n::Locale;
use sqlx::PgPool;
use time::OffsetDateTime;
use uuid::Uuid;

use super::{corrupt_row, map_sqlx_error, to_timestamp};
use crate::domain::port::vacancy_repository::{VacancyFilter, VacancyRepository};

const COLUMNS: &str = "id, slug, title, category, location, employment_type, summary, about, \
	 responsibilities, requirements, nice_to_have, offer, screening_question, compensation, published, created_at";

/// The same columns, qualified, plus the translation the reader asked for.
///
/// Rule 1.2 is the third join predicate and nothing else in this file has to
/// remember it: a translation whose `source_digest` no longer matches the live
/// English row simply fails to join, so the LEFT JOIN yields NULLs and the
/// English is served. Stale translations cannot reach a reader by any path that
/// goes through this query, which is every path.
///
/// English needs no special case either. `vacancy_translations` has a CHECK
/// forbidding an `'en'` row — English is the row in `vacancies`, not a
/// translation of it — so binding `'en'` matches nothing and falls through the
/// same branch as an untranslated role. Note that the `translated` column below
/// is therefore false for English; `LocalizedVacancy::canonical` is what turns
/// that back into true, because an English reader is not missing a translation.
const LOCALIZED_COLUMNS: &str = "v.id, v.slug, v.title, v.category, v.location, v.employment_type, v.summary, v.about, \
	 v.responsibilities, v.requirements, v.nice_to_have, v.offer, v.screening_question, v.compensation, v.published, v.created_at, \
	 t.title AS t_title, t.location AS t_location, t.employment_type AS t_employment_type, t.summary AS t_summary, t.about AS t_about, \
	 t.responsibilities AS t_responsibilities, t.requirements AS t_requirements, t.nice_to_have AS t_nice_to_have, t.offer AS t_offer, \
	 t.screening_question AS t_screening_question, (t.vacancy_id IS NOT NULL) AS translated";

/// `$1` is the locale code.
const LOCALIZED_FROM: &str = "FROM vacancies v \
	 LEFT JOIN vacancy_translations t \
	   ON t.vacancy_id = v.id \
	  AND t.locale = $1 \
	  AND t.source_digest = vacancy_source_digest(v.*)";

pub struct PostgresVacancyRepository {
	pool: PgPool,
}
impl PostgresVacancyRepository {
	pub fn new(pool: PgPool) -> Self {
		Self { pool }
	}
}

/// Escape `\`, `%`, `_` so user search text matches literally under `ILIKE … ESCAPE '\'`.
fn escape_like(input: &str) -> String {
	let mut out = String::with_capacity(input.len());
	for ch in input.chars() {
		if matches!(ch, '\\' | '%' | '_') {
			out.push('\\');
		}
		out.push(ch);
	}
	out
}

#[derive(sqlx::FromRow)]
struct VacancyRow {
	id: Uuid,
	slug: String,
	title: String,
	category: String,
	location: String,
	employment_type: String,
	summary: String,
	about: String,
	responsibilities: Vec<String>,
	requirements: Vec<String>,
	nice_to_have: Vec<String>,
	offer: Vec<String>,
	screening_question: String,
	compensation: String,
	published: bool,
	created_at: OffsetDateTime,
}

impl TryFrom<VacancyRow> for Vacancy {
	type Error = DomainError;

	fn try_from(row: VacancyRow) -> Result<Self, Self::Error> {
		let compensation = match row.compensation.as_str() {
			"negotiable" => Compensation::Negotiable,
			other => return Err(DomainError::Repository(format!("unknown compensation: {other}"))),
		};
		Ok(Self {
			id: VacancyId::from_raw(row.id),
			slug: Slug::parse(row.slug).map_err(corrupt_row)?,
			title: row.title,
			category: VacancyCategory::parse(&row.category).map_err(corrupt_row)?,
			location: row.location,
			employment_type: row.employment_type,
			summary: row.summary,
			about: row.about,
			responsibilities: row.responsibilities,
			requirements: row.requirements,
			nice_to_have: row.nice_to_have,
			offer: row.offer,
			screening_question: row.screening_question,
			compensation,
			published: row.published,
			created_at: to_timestamp(row.created_at)?,
		})
	}
}

/// One role plus the translation columns, which are all-or-nothing: the table
/// declares every one of them NOT NULL, so a row that joins carries a complete
/// translation and a row that does not carries none.
#[derive(sqlx::FromRow)]
struct LocalizedVacancyRow {
	#[sqlx(flatten)]
	base: VacancyRow,
	t_title: Option<String>,
	t_location: Option<String>,
	t_employment_type: Option<String>,
	t_summary: Option<String>,
	t_about: Option<String>,
	t_responsibilities: Option<Vec<String>>,
	t_requirements: Option<Vec<String>>,
	t_nice_to_have: Option<Vec<String>>,
	t_offer: Option<Vec<String>>,
	t_screening_question: Option<String>,
	translated: bool,
}

impl LocalizedVacancyRow {
	fn into_domain(self, locale: Locale) -> Result<LocalizedVacancy, DomainError> {
		let vacancy = Vacancy::try_from(self.base)?;
		// `translated` comes from the join, but the fields are what actually get
		// rendered — so build the translation from the columns and treat a row
		// that says "translated" while missing any of them as a corrupt row
		// rather than silently serving a blank heading.
		if !self.translated {
			return Ok(LocalizedVacancy::canonical(vacancy, locale));
		}
		let missing = || corrupt_row(DomainError::Repository("joined translation row has a NULL column".to_string()));
		let translation = VacancyTranslation {
			title: self.t_title.ok_or_else(missing)?,
			location: self.t_location.ok_or_else(missing)?,
			employment_type: self.t_employment_type.ok_or_else(missing)?,
			summary: self.t_summary.ok_or_else(missing)?,
			about: self.t_about.ok_or_else(missing)?,
			responsibilities: self.t_responsibilities.ok_or_else(missing)?,
			requirements: self.t_requirements.ok_or_else(missing)?,
			nice_to_have: self.t_nice_to_have.ok_or_else(missing)?,
			offer: self.t_offer.ok_or_else(missing)?,
			screening_question: self.t_screening_question.ok_or_else(missing)?,
		};
		Ok(LocalizedVacancy::translated(vacancy, locale, translation))
	}
}

impl Repository for PostgresVacancyRepository {
	type Aggregate = Vacancy;
}

impl Reader for PostgresVacancyRepository {
	type Aggregate = Vacancy;
}

#[async_trait]
impl VacancyRepository for PostgresVacancyRepository {
	async fn list(&self, filter: VacancyFilter, locale: Locale) -> Result<Vec<LocalizedVacancy>, DomainError> {
		let category = filter.category.map(VacancyCategory::as_str);
		// Escape LIKE metacharacters so a query like "100%" is matched literally.
		let search = filter.search.filter(|s| !s.trim().is_empty()).map(|s| escape_like(&s));
		// Search matches what the reader can actually see: COALESCE picks the
		// translated title/summary when one was joined. Searching only the
		// English would mean a Russian reader typing a Russian word off the page
		// in front of them gets no results.
		let sql = format!(
			"SELECT {LOCALIZED_COLUMNS} {LOCALIZED_FROM} \
			 WHERE v.published = TRUE \
			 AND ($2::text IS NULL OR v.category = $2) \
			 AND ($3::text IS NULL \
			      OR COALESCE(t.title, v.title) ILIKE '%' || $3 || '%' ESCAPE '\\' \
			      OR COALESCE(t.summary, v.summary) ILIKE '%' || $3 || '%' ESCAPE '\\') \
			 ORDER BY v.created_at DESC"
		);
		// `sql` is static text + the column/join constants; values are bound, never interpolated.
		let rows = sqlx::query_as::<_, LocalizedVacancyRow>(sqlx::AssertSqlSafe(sql))
			.bind(locale.code())
			.bind(category)
			.bind(search)
			.fetch_all(&self.pool)
			.await
			.map_err(map_sqlx_error)?;
		rows.into_iter().map(|r| r.into_domain(locale)).collect()
	}

	async fn find_by_slug(&self, slug: &Slug, locale: Locale) -> Result<Option<LocalizedVacancy>, DomainError> {
		// `published = TRUE` mirrors `list()`: an unpublished/draft role must 404 on the
		// detail route and reject applications, not just be hidden from the board.
		let sql = format!("SELECT {LOCALIZED_COLUMNS} {LOCALIZED_FROM} WHERE v.slug = $2 AND v.published = TRUE");
		let row = sqlx::query_as::<_, LocalizedVacancyRow>(sqlx::AssertSqlSafe(sql))
			.bind(locale.code())
			.bind(slug.as_str())
			.fetch_optional(&self.pool)
			.await
			.map_err(map_sqlx_error)?;
		row.map(|r| r.into_domain(locale)).transpose()
	}

	async fn find_by_id(&self, id: VacancyId) -> Result<Option<Vacancy>, DomainError> {
		let row = sqlx::query_as::<_, VacancyRow>(sqlx::AssertSqlSafe(format!("SELECT {COLUMNS} FROM vacancies WHERE id = $1")))
			.bind(id.raw())
			.fetch_optional(&self.pool)
			.await
			.map_err(map_sqlx_error)?;
		row.map(Vacancy::try_from).transpose()
	}
}
