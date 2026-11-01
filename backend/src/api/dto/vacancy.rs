use domain::model::vacancy::LocalizedVacancy;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};
use uuid::Uuid;

/// Board row — the lightweight projection for the searchable list.
#[derive(Debug, Serialize, ToSchema)]
pub struct VacancySummary {
	pub id: Uuid,
	pub slug: String,
	pub title: String,
	/// Stable key for filtering (`investment` | `development` | `advisory` | `operations`).
	pub category: String,
	/// Human label for the chip.
	pub category_label: String,
	pub location: String,
	pub employment_type: String,
	pub summary: String,
	/// The locale that was asked for — echoed so a cached response is never
	/// mistaken for a different language's.
	pub locale: String,
	/// `false` ⇒ the text above is canonical English, either because no
	/// translation exists for this locale or because the one that does is stale.
	/// The caller cannot distinguish the two, and should not: both mean the same
	/// thing to a reader. Mark it; never imply a translation that is not there.
	pub translated: bool,
}

impl From<&LocalizedVacancy> for VacancySummary {
	fn from(l: &LocalizedVacancy) -> Self {
		let v = &l.vacancy;
		Self {
			locale: l.locale.code().to_string(),
			translated: l.translated,
			id: v.id.raw(),
			slug: v.slug.as_str().to_string(),
			title: v.title.clone(),
			category: v.category.as_str().to_string(),
			category_label: v.category.label().to_string(),
			location: v.location.clone(),
			employment_type: v.employment_type.clone(),
			summary: v.summary.clone(),
		}
	}
}

/// Full role for the detail page template.
#[derive(Debug, Serialize, ToSchema)]
pub struct VacancyDetail {
	pub id: Uuid,
	pub slug: String,
	pub title: String,
	pub category: String,
	pub category_label: String,
	pub location: String,
	pub employment_type: String,
	pub summary: String,
	pub about: String,
	pub responsibilities: Vec<String>,
	pub requirements: Vec<String>,
	pub nice_to_have: Vec<String>,
	pub offer: Vec<String>,
	pub screening_question: String,
	/// Always "Negotiable" — the public site never publishes a figure.
	pub compensation: String,
	#[schema(value_type = String, format = DateTime)]
	pub created_at: String,
	/// See [`VacancySummary::locale`].
	pub locale: String,
	/// See [`VacancySummary::translated`].
	pub translated: bool,
}

impl From<LocalizedVacancy> for VacancyDetail {
	fn from(l: LocalizedVacancy) -> Self {
		let locale = l.locale.code().to_string();
		let translated = l.translated;
		let v = l.vacancy;
		Self {
			locale,
			translated,
			id: v.id.raw(),
			slug: v.slug.as_str().to_string(),
			category: v.category.as_str().to_string(),
			category_label: v.category.label().to_string(),
			compensation: v.compensation.label().to_string(),
			created_at: v.created_at.to_string(),
			title: v.title,
			location: v.location,
			employment_type: v.employment_type,
			summary: v.summary,
			about: v.about,
			responsibilities: v.responsibilities,
			requirements: v.requirements,
			nice_to_have: v.nice_to_have,
			offer: v.offer,
			screening_question: v.screening_question,
		}
	}
}

#[derive(Debug, Deserialize, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListVacanciesQuery {
	/// Filter by discipline (`investment` | `development` | `advisory` | `operations`).
	pub category: Option<String>,
	/// Free-text search over title and summary, in whichever language the role
	/// is being served in.
	pub q: Option<String>,
	/// Reader's locale (`en` | `ru` | `vi` | `fr` | `de`). Absent or
	/// unrecognised means `en`, matching `splitLocalePath` on the front end —
	/// an unknown value is a reader we cannot place, not an error worth a 400.
	pub locale: Option<String>,
}

/// The detail route takes the same locale parameter and nothing else.
#[derive(Debug, Deserialize, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct VacancyQuery {
	/// See [`ListVacanciesQuery::locale`].
	pub locale: Option<String>,
}
