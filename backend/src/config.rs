use std::net::SocketAddr;

ev_lib::settings! {
	/// The raw environment surface (`dotenvy` loads `.env` first in dev).
	/// Every missing/invalid variable is reported in one aggregate error, and
	/// an empty string counts as unset — so `VAR=` placeholders in `.env`
	/// behave exactly like an absent variable.
	///
	/// `POSTHOG_KEY` / `POSTHOG_HOST` follow the org-canonical names fixed by
	/// `ev_lib::settings::presets` (this backend previously read
	/// `POSTHOG_API_KEY`).
	///
	/// The `#[required_in("production")]` fields are the ones whose absence is a
	/// *silent* no-op rather than a crash — mail that only gets logged, error
	/// reports nobody receives. Optional is right locally; in production it is
	/// an outage that never pages, so there it fails the boot instead.
	pub struct RawSettings {
		database_url: String,
		bind_addr: SocketAddr = "0.0.0.0:58844",
		/// Unset ⇒ error monitoring is a no-op.
		#[required_in("production")]
		sentry_dsn: Option<String>,
		app_env: String = "development",
		/// The SMTP trio: all three or none (see [`SmtpConfig`]). Marked
		/// individually so a half-configured mailer names the missing part.
		#[required_in("production")]
		smtp_host: Option<String>,
		smtp_port: u16 = "587",
		#[required_in("production")]
		smtp_username: Option<String>,
		#[secret]
		#[required_in("production")]
		smtp_password: Option<String>,
		/// `From:` mailbox for outgoing mail, e.g. `EV Investment <careers@evinvest.vn>`.
		mail_from: String = "EV Investment <careers@evinvest.vn>",
		/// Internal inbox that receives the "new application / new message" copies.
		mail_team: String = "careers@evinvest.vn",
		/// Public origin used to build links inside emails (e.g. "View the role").
		site_url: String = "https://evinvest.vn",
		/// PostHog project key for server-side capture. Unset ⇒ analytics no-op.
		///
		/// Deliberately NOT `required_in("production")`, unlike `sentry_dsn`: a
		/// missing error reporter hides failures, while missing product analytics
		/// only forgoes a metric. That must never be the reason a service refuses
		/// to boot.
		posthog_key: Option<String>,
		posthog_host: Option<String>,
	}
}

/// SMTP transport credentials. Present only when host, username, and password
/// are all set (empty counts as unset); otherwise email delivery is a no-op
/// (the notifier logs and returns Ok), the same "unconfigured ⇒ silent no-op"
/// contract the analytics/Sentry libs use. In production that no-op cannot
/// happen: all three are `#[required_in("production")]`, so a deploy missing
/// any of them fails the boot instead of quietly swallowing mail.
#[derive(Clone)]
pub struct SmtpConfig {
	pub host: String,
	pub port: u16,
	pub username: String,
	pub password: String,
}

impl std::fmt::Debug for SmtpConfig {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		f.debug_struct("SmtpConfig")
			.field("host", &self.host)
			.field("port", &self.port)
			.field("username", &self.username)
			.field("password", &"***")
			.finish()
	}
}

/// Application configuration, assembled from [`RawSettings`].
#[derive(Clone, Debug)]
pub struct AppConfig {
	pub database_url: String,
	pub bind_addr: SocketAddr,
	pub sentry_dsn: Option<String>,
	pub app_env: String,
	pub smtp: Option<SmtpConfig>,
	/// `From:` mailbox for outgoing mail, e.g. `EV Investment <careers@evinvest.vn>`.
	pub mail_from: String,
	/// Internal inbox that receives the "new application / new message" copies.
	pub mail_team: String,
	/// Public origin used to build links inside emails (e.g. "View the role").
	pub site_url: String,
	/// PostHog project key for server-side capture. `None` ⇒ analytics no-op.
	pub posthog_key: Option<String>,
	pub posthog_host: Option<String>,
}

impl AppConfig {
	/// Load, or print every problem and exit 78 (`EX_CONFIG`). Deliberately not
	/// a `Result`: a bad environment is not something a caller can recover from,
	/// and propagating it would land as exit code 1 — indistinguishable from a
	/// dependency blip, which a restart *does* fix.
	pub fn from_env() -> Self {
		let raw = ev_lib::settings::or_exit(RawSettings::from_env());
		let smtp = match (raw.smtp_host, raw.smtp_username, raw.smtp_password) {
			(Some(host), Some(username), Some(password)) => Some(SmtpConfig {
				host,
				port: raw.smtp_port,
				username,
				password,
			}),
			_ => None,
		};
		Self {
			database_url: raw.database_url,
			bind_addr: raw.bind_addr,
			sentry_dsn: raw.sentry_dsn,
			app_env: raw.app_env,
			smtp,
			mail_from: raw.mail_from,
			mail_team: raw.mail_team,
			site_url: raw.site_url,
			posthog_key: raw.posthog_key,
			posthog_host: raw.posthog_host,
		}
	}
}

#[cfg(test)]
mod tests {
	use super::*;

	/// The env surface IS the deploy contract (the image env + the gitops
	/// manifests use exactly these names) — a rename here must be deliberate.
	#[test]
	fn env_surface_matches_the_deploy_contract() {
		assert_eq!(
			RawSettings::var_names(),
			vec![
				"DATABASE_URL", "BIND_ADDR", "SENTRY_DSN", "APP_ENV", "SMTP_HOST", "SMTP_PORT", "SMTP_USERNAME", "SMTP_PASSWORD", "MAIL_FROM", "MAIL_TEAM", "SITE_URL", "POSTHOG_KEY",
				"POSTHOG_HOST",
			]
		);
	}

	/// What a production deploy must provide. The gitops preflight diffs the
	/// cluster Secret against this list, so it is spelled out here.
	#[test]
	fn production_requires_the_silent_failure_surface() {
		assert_eq!(
			RawSettings::required_var_names("production"),
			// POSTHOG_KEY is read (it is in the env surface above) but never
			// required: analytics is a metric, not a safety net, so it must not be
			// able to keep a service from booting. See the field's comment.
			vec!["DATABASE_URL", "SENTRY_DSN", "SMTP_HOST", "SMTP_USERNAME", "SMTP_PASSWORD"]
		);
		// Locally, only the one thing the process genuinely cannot start without.
		assert_eq!(RawSettings::required_var_names("development"), vec!["DATABASE_URL"]);
	}

	#[test]
	fn a_production_deploy_without_mail_fails_to_boot() {
		let error = RawSettings::from_source(|var| {
			match var {
				"DATABASE_URL" => Some("postgres://localhost/site_conductor"),
				"APP_ENV" => Some("production"),
				"SENTRY_DSN" => Some("https://key@sentry.example/1"),
				"POSTHOG_KEY" => Some("phc_123"),
				_ => None,
			}
			.map(str::to_string)
		})
		.expect_err("production without a mailer must not boot");

		let vars: Vec<&str> = error.errors.iter().map(|e| e.var.as_str()).collect();
		assert_eq!(vars, vec!["SMTP_HOST", "SMTP_USERNAME", "SMTP_PASSWORD"]);
	}

	#[test]
	fn the_same_environment_is_fine_in_development() {
		let raw = RawSettings::from_source(|var| (var == "DATABASE_URL").then(|| "postgres://localhost/site_conductor".to_string())).expect("a laptop needs no mailer");
		assert!(raw.smtp_host.is_none());
	}
}
