use async_trait::async_trait;
use domain::error::DomainError;
use lettre::{
	AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
	message::{Mailbox, MultiPart},
	transport::smtp::authentication::Credentials,
};

#[async_trait]
pub trait EmailTransport: Send + Sync {
	async fn send(&self, from: &str, email: OutgoingEmail) -> Result<(), DomainError>;
}
/// A single rendered message ready to hand to a transport.
#[derive(Clone, Debug)]
pub struct OutgoingEmail {
	pub to: String,
	pub subject: String,
	pub html: String,
	pub text: String,
}

/// Drops mail on the floor (logs it). Used whenever SMTP is unconfigured, so
/// local and CI runs exercise the whole submit→render→"send" path without
/// delivering anything.
pub struct NoopTransport;

#[async_trait]
impl EmailTransport for NoopTransport {
	async fn send(&self, from: &str, email: OutgoingEmail) -> Result<(), DomainError> {
		tracing::info!(%from, to = %email.to, subject = %email.subject, "email suppressed (SMTP unconfigured)");
		Ok(())
	}
}

/// Async SMTP over STARTTLS (587) or implicit TLS (465). Built once and reused;
/// `lettre` keeps an internal connection pool.
pub struct SmtpTransport {
	mailer: AsyncSmtpTransport<Tokio1Executor>,
}

impl SmtpTransport {
	pub fn try_new(host: &str, port: u16, username: String, password: String) -> Result<Self, DomainError> {
		let builder = if port == 465 {
			AsyncSmtpTransport::<Tokio1Executor>::relay(host)
		} else {
			AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(host)
		}
		.map_err(|e| DomainError::Repository(format!("smtp setup: {e}")))?;
		let mailer = builder.port(port).credentials(Credentials::new(username, password)).build();
		Ok(Self { mailer })
	}
}

fn mailbox(raw: &str) -> Result<Mailbox, DomainError> {
	raw.parse::<Mailbox>().map_err(|e| DomainError::Repository(format!("invalid mailbox {raw}: {e}")))
}

#[async_trait]
impl EmailTransport for SmtpTransport {
	async fn send(&self, from: &str, email: OutgoingEmail) -> Result<(), DomainError> {
		let message = Message::builder()
			.from(mailbox(from)?)
			.to(mailbox(&email.to)?)
			.subject(email.subject.as_str())
			.multipart(MultiPart::alternative_plain_html(email.text, email.html))
			.map_err(|e| DomainError::Repository(format!("build email: {e}")))?;
		self.mailer.send(message).await.map_err(|e| DomainError::Repository(format!("smtp send: {e}")))?;
		Ok(())
	}
}
