use axum::{
	Json,
	extract::{Path, Query, State},
};
use domain::model::vacancy::{Slug, VacancyCategory};
use ev_lib::i18n::{DEFAULT_LOCALE, Locale};

use crate::{
	api::{
		dto::vacancy::{ListVacanciesQuery, VacancyDetail, VacancyQuery, VacancySummary},
		error::ApiError,
		state::AppState,
	},
	domain::port::vacancy_repository::VacancyFilter,
};

/// `GET /vacancies?category=&q=&locale=` — the searchable board.
#[utoipa::path(
	get,
	path = "/api/v1/vacancies",
	tag = "vacancies",
	params(ListVacanciesQuery),
	responses((status = 200, description = "Matching open roles", body = [VacancySummary]), (status = 400, description = "Unknown category")),
)]
pub async fn list_vacancies(State(state): State<AppState>, Query(query): Query<ListVacanciesQuery>) -> Result<Json<Vec<VacancySummary>>, ApiError> {
	let category = match query.category.as_deref().filter(|c| !c.is_empty()) {
		Some(c) => Some(VacancyCategory::parse(c)?),
		None => None,
	};
	// Truncate rather than reject: an oversized q is an accident, not an error.
	let filter = VacancyFilter {
		category,
		search: query.q.map(|q| q.chars().take(200).collect()),
	};
	let vacancies = state.vacancies.list(filter, locale_of(query.locale.as_deref())).await?;
	Ok(Json(vacancies.iter().map(VacancySummary::from).collect()))
}
/// `GET /vacancies/{slug}` — one role for the detail-page template.
#[utoipa::path(
	get,
	path = "/api/v1/vacancies/{slug}",
	tag = "vacancies",
	params(("slug" = String, Path, description = "Role slug, e.g. investment-analyst"), VacancyQuery),
	responses((status = 200, description = "The role", body = VacancyDetail), (status = 404, description = "Role not found")),
)]
pub async fn get_vacancy(State(state): State<AppState>, Path(slug): Path<String>, Query(query): Query<VacancyQuery>) -> Result<Json<VacancyDetail>, ApiError> {
	let slug = Slug::parse(slug)?;
	let vacancy = state.vacancies.get_by_slug(&slug, locale_of(query.locale.as_deref())).await?;
	Ok(Json(VacancyDetail::from(vacancy)))
}
/// An unrecognised or absent `locale` resolves to English rather than a 400.
/// This parameter comes off a URL path segment the reader can edit, and the
/// right answer to "I cannot place you" is the canonical language, not an error
/// page — the same call `splitLocalePath` makes on the front end.
fn locale_of(raw: Option<&str>) -> Locale {
	raw.and_then(Locale::parse).unwrap_or(DEFAULT_LOCALE)
}
