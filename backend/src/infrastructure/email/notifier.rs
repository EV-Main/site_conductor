use std::sync::Arc;

use async_trait::async_trait;
use domain::{
	architecture::Gateway,
	error::DomainError,
	model::{application::JobApplication, contact::ContactMessage, newsletter::NewsletterSubscription, vacancy::Vacancy},
};

use super::{
	templates,
	transport::{EmailTransport, OutgoingEmail},
};
use crate::domain::port::notifier::Notifier;

/// Renders the adaptive templates and dispatches each message over the
/// injected transport (real SMTP in prod, the no-op transport otherwise).
pub struct EmailNotifier {
	transport: Arc<dyn EmailTransport>,
	from: String,
	team_inbox: String,
	site_url: String,
}

impl EmailNotifier {
	pub fn new(transport: Arc<dyn EmailTransport>, from: String, team_inbox: String, site_url: String) -> Self {
		Self {
			transport,
			from,
			team_inbox,
			site_url,
		}
	}
}

impl Gateway for EmailNotifier {}

#[async_trait]
impl Notifier for EmailNotifier {
	async fn application_received(&self, application: &JobApplication, vacancy: Option<&Vacancy>) -> Result<(), DomainError> {
		let candidate = templates::candidate_application_received(application, vacancy, &self.site_url);
		let candidate_result = self
			.transport
			.send(
				&self.from,
				OutgoingEmail {
					to: application.email.as_str().to_string(),
					subject: candidate.subject,
					html: candidate.html,
					text: candidate.text,
				},
			)
			.await;

		let internal = templates::internal_new_application(application, vacancy, &self.site_url);
		let internal_result = self
			.transport
			.send(
				&self.from,
				OutgoingEmail {
					to: self.team_inbox.clone(),
					subject: internal.subject,
					html: internal.html,
					text: internal.text,
				},
			)
			.await;

		// Both sends are always attempted: a rejected candidate address must
		// never suppress the internal team-inbox copy, and vice versa.
		candidate_result.and(internal_result)
	}

	async fn contact_received(&self, message: &ContactMessage) -> Result<(), DomainError> {
		let candidate = templates::candidate_contact_received(message, &self.site_url);
		let candidate_result = self
			.transport
			.send(
				&self.from,
				OutgoingEmail {
					to: message.email.as_str().to_string(),
					subject: candidate.subject,
					html: candidate.html,
					text: candidate.text,
				},
			)
			.await;

		let internal = templates::internal_new_contact(message, &self.site_url);
		let internal_result = self
			.transport
			.send(
				&self.from,
				OutgoingEmail {
					to: self.team_inbox.clone(),
					subject: internal.subject,
					html: internal.html,
					text: internal.text,
				},
			)
			.await;

		candidate_result.and(internal_result)
	}

	async fn newsletter_subscribed(&self, subscription: &NewsletterSubscription) -> Result<(), DomainError> {
		let email = templates::candidate_newsletter_subscribed(subscription, &self.site_url);
		self.transport
			.send(
				&self.from,
				OutgoingEmail {
					to: subscription.email.as_str().to_string(),
					subject: email.subject,
					html: email.html,
					text: email.text,
				},
			)
			.await
	}
}
