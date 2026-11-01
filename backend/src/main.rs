//! Composition root.
//!
//! Wiring lives here and only here: load config, build the driven adapters,
//! inject them into the use cases, mount the driving (HTTP) adapter, and serve.
//! The layered modules themselves live in the library crate (`lib.rs`).

use std::{future::IntoFuture, sync::Arc};

use backend::{
	api::{self, state::AppState},
	application::{application_service::ApplicationService, contact_service::ContactService, newsletter_service::NewsletterService, vacancy_service::VacancyService},
	config::{AppConfig, RawSettings},
	infrastructure::{
		db,
		email::{
			notifier::EmailNotifier,
			transport::{EmailTransport, NoopTransport, SmtpTransport},
		},
		persistence::{
			postgres_application_repository::PostgresApplicationRepository, postgres_contact_repository::PostgresContactRepository,
			postgres_newsletter_repository::PostgresNewsletterRepository, postgres_vacancy_repository::PostgresVacancyRepository,
		},
	},
};
use color_eyre::eyre::{Context, Result};
use ev_lib::error_monitoring;

// Sentry must be initialised before the async runtime starts — no #[tokio::main].
fn main() -> Result<()> {
	color_eyre::install()?;
	dotenvy::dotenv().ok();

	// The deploy contract, straight out of the image: the gitops preflight runs
	// this against the built image and diffs it with the cluster Secret's keys,
	// so a missing variable is caught before the rollout instead of as a
	// CrashLoopBackOff after it.
	if let Some(profile) = print_required_vars_for() {
		for var in RawSettings::required_var_names(&profile) {
			println!("{var}");
		}
		return Ok(());
	}

	// Exits 78 (EX_CONFIG) on a bad environment, before anything else is built.
	let config = AppConfig::from_env();

	// Guard must stay alive for the duration of main — dropping it flushes events.
	// `init` is a no-op (returns None) when SENTRY_DSN is unset.
	let _sentry_guard = error_monitoring::init(&error_monitoring::Config {
		dsn: config.sentry_dsn.clone(),
		environment: config.app_env.clone(),
		release: error_monitoring::release_name!().map(|r| r.into_owned()),
		// Several services share one Sentry project (a project is a DSN), so
		// without this they are separable only by pod hostname. Read from the
		// same variable OTEL uses rather than repeating the literal, so an issue
		// and its trace cannot disagree about which service they came from — the
		// deployment sets it (`site-conductor-backend`); unset leaves events
		// untagged, which is the honest answer when nothing named the service.
		service: std::env::var("OTEL_SERVICE_NAME").ok().filter(|s| !s.trim().is_empty()),
		traces_sample_rate: error_monitoring::Config::traces_sample_rate_for(&config.app_env),
	});

	let _otel_guard = init_tracing(&config.app_env);

	tokio::runtime::Builder::new_multi_thread()
		.enable_all()
		.build()
		.context("failed to build tokio runtime")?
		.block_on(run(config))
}

async fn run(config: AppConfig) -> Result<()> {
	let pool = db::connect(&config.database_url).await.context("failed to connect to the database")?;
	db::migrate(&pool).await.context("failed to run migrations")?;

	// Email transport: real SMTP when configured, else a logging no-op.
	let transport: Arc<dyn EmailTransport> = match &config.smtp {
		Some(smtp) => Arc::new(SmtpTransport::try_new(&smtp.host, smtp.port, smtp.username.clone(), smtp.password.clone()).context("failed to build SMTP transport")?),
		None => {
			tracing::warn!("SMTP not configured — transactional emails will be logged, not delivered");
			Arc::new(NoopTransport)
		}
	};
	let notifier = Arc::new(EmailNotifier::new(transport, config.mail_from.clone(), config.mail_team.clone(), config.site_url.clone()));

	// Driven adapters ▶ use cases ▶ shared state.
	let vacancy_repo = Arc::new(PostgresVacancyRepository::new(pool.clone()));
	let application_repo = Arc::new(PostgresApplicationRepository::new(pool.clone()));
	let contact_repo = Arc::new(PostgresContactRepository::new(pool.clone()));
	let newsletter_repo = Arc::new(PostgresNewsletterRepository::new(pool));

	let analytics = ev_lib::analytics::Analytics::new(config.posthog_key.clone(), config.posthog_host.clone());

	let vacancies = VacancyService::new(vacancy_repo.clone());
	let applications = ApplicationService::new(application_repo, vacancy_repo, notifier.clone());
	let contacts = ContactService::new(contact_repo, notifier.clone());
	let newsletter = NewsletterService::new(newsletter_repo, notifier);
	let state = AppState::new(vacancies, applications, contacts, newsletter, analytics);

	let router = api::router::build(state);

	let listener = tokio::net::TcpListener::bind(config.bind_addr)
		.await
		.with_context(|| format!("failed to bind {}", config.bind_addr))?;
	tracing::info!(addr = %config.bind_addr, "backend listening");
	tokio::select! {
		served = axum::serve(listener, router).into_future() => served.context("server error"),
		never = RawSettings::watch_drift() => match never {},
	}
}

/// `--print-required-vars[=PROFILE]` (default `production`). Hand-rolled: this
/// binary has no other CLI surface, and a whole arg parser for one flag is not
/// worth the dependency.
fn print_required_vars_for() -> Option<String> {
	const FLAG: &str = "--print-required-vars";

	let mut args = std::env::args().skip(1);
	let arg = args.next()?;
	match arg.split_once('=') {
		Some((FLAG, profile)) => Some(profile.to_string()),
		Some(_) => None,
		None if arg == FLAG => Some(args.next().unwrap_or_else(|| "production".to_string())),
		None => None,
	}
}

fn init_tracing(environment: &str) -> Option<ev_lib::otel::Telemetry> {
	use tracing_subscriber::{EnvFilter, fmt, prelude::*};

	let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info,backend=debug"));
	let (otel_guard, otel_layers) = ev_lib::otel::telemetry(&ev_lib::otel::Config {
		environment: environment.to_string(),
		traces_sample_rate: ev_lib::otel::Config::traces_sample_rate_for(environment),
	})
	.unzip();
	tracing_subscriber::registry()
		.with(filter)
		.with(fmt::layer())
		.with(error_monitoring::tracing_layer())
		.with(otel_layers)
		.init();
	otel_guard
}
