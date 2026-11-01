//! Server-rendered transactional emails. One dark shell, four messages, all
//! adaptive on whether a vacancy is attached — the universal-letter mechanic.
//! Inline hex (not design tokens) is required here: email clients support
//! neither CSS variables nor external stylesheets, so brand colours are
//! inlined per element.
//!
//! The palette below is flattened from `@evinvest/uikit` (`styles/tokens.css`),
//! which is the same source the Figma `ev/color` variables publish from — keep
//! the two in step when either moves.

use domain::model::{application::JobApplication, contact::ContactMessage, newsletter::NewsletterSubscription, vacancy::Vacancy};

// Flattened `@evinvest/uikit` tokens. Mail clients support neither CSS variables
// nor `color-mix`, so the alpha-based semantic tokens are pre-composited against
// the surface they sit on and pasted as opaque hex.
const MIST: &str = "#e6e1d3"; // --color-main-mist
const WHITE: &str = "#ffffff"; // headings are pure white in the board, not mist
const TEAL: &str = "#2a9d8f"; // --color-main-accent-t1
const HAIR: &str = "#1b2742"; // navy-hairline
const BLACK: &str = "#070d18"; // --color-main-black — the card body
const SURFACE: &str = "#081020"; // --color-main-surface — the detail box
const CARD: &str = "#0c1626"; // --color-main-card — the logo header
const FOOTER: &str = "#05080e"; // board-only shade, one step under main-black
// --muted-foreground is `mist 40%`; composited over BLACK that is #606263. The
// board uses it for labels and the whole footer, so it is reproduced as-is —
// note this lands at ~3.3:1, below the 4.5:1 WCAG asks of body copy.
const MUTED: &str = "#606263";

// Playfair/Inter are the site's families; a mail client that lacks them falls
// through to the same serif/sans pairing the templates used before.
const SERIF: &str = "'Playfair Display',Georgia,'Times New Roman',serif";
const SANS: &str = "Inter,-apple-system,'Segoe UI',Arial,Helvetica,sans-serif";

// Where the footer's Unsubscribe / Email preferences links land. A mailto is the
// honest stopgap: it works today with no new surface, unlike a one-click
// unsubscribe URL, which needs a signed token and a route to redeem it.
const MAIL_LIST: &str = "admin@evinvest.ltd";
pub struct RenderedEmail {
	pub subject: String,
	pub html: String,
	pub text: String,
}

pub fn candidate_application_received(application: &JobApplication, vacancy: Option<&Vacancy>, site_url: &str) -> RenderedEmail {
	let reference = reference(&vacancy.map(|v| role_kind(&v.title)).unwrap_or_else(|| "GEN".into()), application.id.raw());
	let submitted = fmt_ts(&application.created_at);
	let first_name = application.applicant_name.split_whitespace().next().unwrap_or(&application.applicant_name).to_string();

	let (subject, eyebrow_text, role_section, cta) = match vacancy {
		Some(v) => {
			let mut block = String::new();
			block.push_str(&eyebrow(&format!("Your application · {}", v.title)));
			block.push_str(&detail_box(&[
				("Role", v.title.clone()),
				("Location", v.location.clone()),
				("Submitted", submitted.clone()),
				("Reference", reference.clone()),
			]));
			if !application.confirmed_requirements.is_empty() {
				block.push_str(&steps_heading("What you confirmed"));
				let items: Vec<(String, bool)> = application.confirmed_requirements.iter().map(|r| (r.clone(), true)).collect();
				block.push_str(&checklist(&items));
			}
			(
				format!("Your application for {} is in", v.title),
				"Application received".to_string(),
				block,
				button("View the role", &format!("{site_url}/hiring/{}", v.slug.as_str())),
			)
		}
		None => (
			"Your application is in — EV Investment".to_string(),
			"Application received".to_string(),
			detail_box(&[
				("Applicant", application.applicant_name.clone()),
				("Submitted", submitted.clone()),
				("Reference", reference.clone()),
			]),
			button("Browse open roles", &format!("{site_url}/hiring")),
		),
	};

	let mut body = String::new();
	body.push_str(&eyebrow(&eyebrow_text));
	body.push_str(&heading(&format!("Thanks, {first_name} — we've got it.")));
	body.push_str(&paragraph(match vacancy {
		Some(_) => "Your application has reached our team. We read every one personally and will be in touch about next steps. The details we have on file are below.",
		None => "Thanks for putting yourself forward. We've added you to our talent pool and will reach out when a role fits your strengths. Your details are below.",
	}));
	body.push_str(&role_section);
	body.push_str(&steps(
		"What happens next",
		&[
			"We review your application within five business days.",
			"If there's a fit, we'll invite you to an intro conversation.",
			"Either way, you'll hear back from a person — not a bot.",
		],
	));
	body.push_str(&cta);
	body.push_str(&signoff("— The EV Investment talent team"));

	let html = shell(
		&format!("We received your application, {first_name}."),
		&body,
		"You're receiving this because you applied via evinvest.ltd/careers.",
		site_url,
	);
	let text = application_received_text(vacancy, &reference, &submitted, &first_name);
	RenderedEmail { subject, html, text }
}
pub fn internal_new_application(application: &JobApplication, vacancy: Option<&Vacancy>, site_url: &str) -> RenderedEmail {
	let reference = reference(&vacancy.map(|v| role_kind(&v.title)).unwrap_or_else(|| "GEN".into()), application.id.raw());
	let submitted = fmt_ts_precise(&application.created_at);
	let role_label = vacancy.map(|v| v.title.clone()).unwrap_or_else(|| "General talent pool — no specific role".to_string());

	let mut body = String::new();
	body.push_str(&eyebrow("New application"));
	body.push_str(&heading(&application.applicant_name));
	body.push_str(&detail_box(&[
		("Name", application.applicant_name.clone()),
		("Email", application.email.as_str().to_string()),
		("Portfolio", application.portfolio_url.clone().unwrap_or_else(|| "—".to_string())),
		("Role", role_label),
		("Submitted", submitted.clone()),
		("Reference", reference.clone()),
	]));
	if !application.message.trim().is_empty() {
		body.push_str(&steps_heading("Where they'd fit"));
		body.push_str(&quote_block(&application.message));
	}
	if let Some(v) = vacancy {
		body.push_str(&steps_heading("Requirement checks"));
		let items: Vec<(String, bool)> = v.requirements.iter().map(|r| (r.clone(), application.confirmed_requirements.iter().any(|c| c == r))).collect();
		body.push_str(&checklist(&items));
		if let Some(answer) = application.screening_answer.as_ref().filter(|a| !a.trim().is_empty()) {
			body.push_str(&steps_heading(&format!("Screening · {}", v.screening_question)));
			body.push_str(&quote_block(answer));
		}
	}

	let footer = match vacancy {
		Some(v) => format!("Internal notification · application for {}.", v.title),
		None => "Internal notification · general talent-pool application.".to_string(),
	};
	let html = shell("New application received.", &body, &footer, site_url);
	let text = format!(
		"New application\n\nName: {}\nEmail: {}\nRole: {}\nSubmitted: {submitted}\nReference: {reference}\n\nNote:\n{}\n",
		application.applicant_name,
		application.email.as_str(),
		vacancy.map(|v| v.title.as_str()).unwrap_or("General talent pool"),
		application.message
	);
	RenderedEmail {
		subject: format!("New application · {}", vacancy.map(|v| v.title.as_str()).unwrap_or("General talent pool")),
		html,
		text,
	}
}
pub fn candidate_contact_received(message: &ContactMessage, site_url: &str) -> RenderedEmail {
	let reference = reference("MSG", message.id.raw());
	let submitted = fmt_ts(&message.created_at);
	let first_name = message.name.split_whitespace().next().unwrap_or(&message.name).to_string();

	let mut body = String::new();
	body.push_str(&eyebrow("Message received"));
	body.push_str(&heading(&format!("Thanks for reaching out, {first_name}.")));
	body.push_str(&paragraph(
		"Your message has reached our team and we'll reply personally, usually within two business days. Here's what we have on file.",
	));
	body.push_str(&detail_box(&[
		("From", message.email.as_str().to_string()),
		("Submitted", submitted.clone()),
		("Reference", reference.clone()),
	]));
	body.push_str(&steps_heading("Your message"));
	body.push_str(&quote_block(&message.message));
	body.push_str(&steps(
		"While you wait",
		&["Explore our coastal developments in Quy Nhơn.", "Read our latest research on the market."],
	));
	body.push_str(&button("Explore developments", site_url));
	body.push_str(&signoff("— EV Investment"));

	let html = shell(
		&format!("We received your message, {first_name}."),
		&body,
		"You're receiving this because you contacted us via evinvest.ltd.",
		site_url,
	);
	let text = format!(
		"Thanks for reaching out, {first_name}.\n\nWe received your message and will reply within two business days.\n\nReference: {reference}\nSubmitted: {submitted}\n\nYour message:\n{}\n\n— EV Investment",
		message.message
	);
	RenderedEmail {
		subject: "We received your message — EV Investment".to_string(),
		html,
		text,
	}
}
pub fn internal_new_contact(message: &ContactMessage, site_url: &str) -> RenderedEmail {
	let reference = reference("MSG", message.id.raw());
	let submitted = fmt_ts_precise(&message.created_at);

	let mut body = String::new();
	body.push_str(&eyebrow("New message"));
	body.push_str(&heading(&message.name));
	body.push_str(&detail_box(&[
		("Name", message.name.clone()),
		("Email", message.email.as_str().to_string()),
		("Submitted", submitted.clone()),
		("Reference", reference.clone()),
	]));
	body.push_str(&steps_heading("Message"));
	body.push_str(&quote_block(&message.message));

	let html = shell("New contact message.", &body, "Internal notification · contact form.", site_url);
	let text = format!(
		"New message\n\nName: {}\nEmail: {}\nSubmitted: {submitted}\nReference: {reference}\n\n{}\n",
		message.name,
		message.email.as_str(),
		message.message
	);
	RenderedEmail {
		subject: format!("New message · {}", message.name),
		html,
		text,
	}
}
pub fn candidate_newsletter_subscribed(subscription: &NewsletterSubscription, site_url: &str) -> RenderedEmail {
	let reference = reference("NL", subscription.id.raw());
	let submitted = fmt_ts(&subscription.created_at);

	let mut body = String::new();
	body.push_str(&eyebrow("You're on the list"));
	body.push_str(&heading("Welcome to the EV Investment newsletter."));
	body.push_str(&paragraph(
		"We'll send you curated research, market updates on Quy Nhơn, and early access to new opportunities — no more than once a month, unsubscribe anytime.",
	));
	body.push_str(&detail_box(&[
		("Email", subscription.email.as_str().to_string()),
		("Subscribed", submitted.clone()),
		("Reference", reference.clone()),
	]));

	body.push_str(&signoff("— EV Investment"));

	let html = shell(
		"Welcome to the EV Investment newsletter.",
		&body,
		"You're receiving this because you subscribed via evinvest.ltd.",
		site_url,
	);
	let text = format!(
		"Welcome to the EV Investment newsletter.\n\nWe'll send you curated research, market updates on Quy Nhơn, and early access to new opportunities.\n\nEmail: {}\nSubscribed: {submitted}\nReference: {reference}\n\n— EV Investment",
		subscription.email.as_str()
	);
	RenderedEmail {
		subject: "You're on the list — EV Investment".to_string(),
		html,
		text,
	}
}
fn esc(raw: &str) -> String {
	raw.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;")
}

/// Board-style reference: `EV-<KIND>-1234`. The digits are derived from the id
/// so the code stays stable for a given record and quotable over the phone.
fn reference(kind: &str, id: uuid::Uuid) -> String {
	let n = u16::from_be_bytes([id.as_bytes()[0], id.as_bytes()[1]]) % 10_000;
	format!("EV-{kind}-{n:04}")
}

/// Initials of a vacancy title — "Investment Analyst" becomes `IA`, matching the
/// `EV-IA-2381` sample on the board. Falls back to `ROLE` when nothing is usable.
fn role_kind(title: &str) -> String {
	let initials: String = title
		.split_whitespace()
		.filter_map(|w| w.chars().find(|c| c.is_alphabetic()))
		.take(3)
		.collect::<String>()
		.to_uppercase();
	if initials.is_empty() { "ROLE".to_string() } else { initials }
}

/// `20 Jun 2026` — what candidate-facing letters show. The raw RFC 3339 form
/// (`2026-07-27T16:31:07.918453Z`) reads as machine output in a letter.
fn fmt_ts(ts: &jiff::Timestamp) -> String {
	ts.strftime("%-d %b %Y").to_string()
}

/// `20 Jun 2026 · 14:32` — the internal copies keep the time of day, which is
/// what an operator triaging the queue actually needs.
fn fmt_ts_precise(ts: &jiff::Timestamp) -> String {
	ts.strftime("%-d %b %Y · %H:%M").to_string()
}

fn heading(text: &str) -> String {
	format!(
		r#"<h1 style="margin:0 0 18px;font-family:{SERIF};font-size:26px;line-height:32px;letter-spacing:-0.26px;color:{WHITE};font-weight:600;">{}</h1>"#,
		esc(text)
	)
}

fn eyebrow(text: &str) -> String {
	format!(
		r#"<p style="margin:0 0 18px;font-family:{SANS};font-size:12px;line-height:15px;font-weight:600;letter-spacing:.84px;text-transform:uppercase;color:{TEAL};">{}</p>"#,
		esc(text)
	)
}

fn paragraph(text: &str) -> String {
	format!(
		r#"<p style="margin:0 0 18px;font-family:{SANS};font-size:14.5px;line-height:23px;color:{MIST};">{}</p>"#,
		esc(text)
	)
}

/// The muted sign-off that closes every candidate-facing letter.
fn signoff(text: &str) -> String {
	format!(
		r#"<p style="margin:18px 0 0;font-family:{SANS};font-size:14.5px;line-height:23px;color:{MUTED};">{}</p>"#,
		esc(text)
	)
}

fn detail_box(rows: &[(&str, String)]) -> String {
	let body: String = rows
		.iter()
		.map(|(label, value)| {
			format!(
				r#"<tr><td style="padding:5px 0;font-family:{SANS};font-size:12.5px;line-height:16px;font-weight:500;color:{MUTED};">{}</td><td align="right" style="padding:5px 0;font-family:{SANS};font-size:13px;line-height:17px;font-weight:600;color:{MIST};">{}</td></tr>"#,
				esc(label),
				esc(value)
			)
		})
		.collect();
	format!(
		r#"<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;padding:16px 18px;background:{SURFACE};border:1px solid {HAIR};border-radius:10px;">{body}</table>"#
	)
}

fn quote_block(text: &str) -> String {
	format!(
		r#"<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;"><tr><td width="3" style="background:{TEAL};border-radius:2px;"></td><td style="padding:4px 0 4px 16px;font-family:{SANS};font-size:14px;line-height:1.6;color:{MIST};">{}</td></tr></table>"#,
		esc(text).replace('\n', "<br>")
	)
}

fn checklist(items: &[(String, bool)]) -> String {
	let body: String = items
		.iter()
		.map(|(label, checked)| {
			let (mark, color) = if *checked { ("&#10003;", TEAL) } else { ("&#9675;", MUTED) };
			format!(
				r#"<tr><td width="22" valign="top" style="font-family:{SANS};font-size:14px;color:{color};">{mark}</td><td style="padding:0 0 8px;font-family:{SANS};font-size:14px;line-height:1.5;color:{MIST};">{}</td></tr>"#,
				esc(label)
			)
		})
		.collect();
	format!(r#"<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">{body}</table>"#)
}

fn steps(label: &str, items: &[&str]) -> String {
	let lis: String = items
		.iter()
		// The bullet is an 8x2 teal rule, nudged down to sit on the first line.
		.map(|i| format!(r#"<tr><td width="18" valign="top" style="padding:8px 10px 0 0;"><div style="width:8px;height:2px;background:{TEAL};border-radius:1px;font-size:0;line-height:0;">&nbsp;</div></td><td style="padding:0 0 8px;font-family:{SANS};font-size:13.5px;line-height:21px;color:{MIST};">{}</td></tr>"#, esc(i)))
		.collect();
	format!(
		r#"{}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">{lis}</table>"#,
		steps_heading(label)
	)
}

fn button(label: &str, href: &str) -> String {
	format!(
		r#"<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0;"><tr><td style="background:{TEAL};border-radius:10px;"><a href="{}" style="display:inline-block;padding:13px 24px;font-family:{SANS};font-size:14.5px;line-height:18px;font-weight:600;color:{BLACK};text-decoration:none;">{}</a></td></tr></table>"#,
		esc(href),
		esc(label)
	)
}

/// Wrap rendered sections in the brand shell: logo header, body, legal footer.
///
/// `site_url` sources the header mark and the footer links. The logo is a hosted
/// PNG rather than the source SVG — mail clients largely refuse SVG in `<img>` —
/// and carries alt text so a client that blocks remote images still shows the
/// brand rather than a gap.
fn shell(preheader: &str, body: &str, footer_context: &str, site_url: &str) -> String {
	let preheader = esc(preheader);
	let footer_context = esc(footer_context);
	let site = esc(site_url.trim_end_matches('/'));
	format!(
		r##"<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:{BLACK};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">{preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{BLACK};padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:{BLACK};border:1px solid {HAIR};border-radius:16px;overflow:hidden;">
<tr><td style="padding:22px 32px;background:{CARD};border-bottom:1px solid {HAIR};">
<img src="{site}/assets/email-logo.png" width="37" height="32" alt="EV Investment" style="display:block;width:37px;height:32px;border:0;outline:none;text-decoration:none;">
</td></tr>
<tr><td style="padding:34px 32px 36px;background:{BLACK};">{body}</td></tr>
<tr><td style="padding:24px 32px 26px;background:{FOOTER};">
<p style="margin:0 0 7px;font-family:{SANS};font-size:12px;line-height:15px;font-weight:600;letter-spacing:.96px;color:{MIST};">EV INVESTMENT</p>
<p style="margin:0 0 7px;font-family:{SANS};font-size:12px;line-height:17px;color:{MUTED};">Quy Nh&#417;n &amp; Ho Chi Minh City, Vietnam</p>
<p style="margin:0 0 7px;font-family:{SANS};font-size:11.5px;line-height:17px;color:{MUTED};">{footer_context}</p>
<p style="margin:0 0 7px;font-family:{SANS};font-size:11.5px;line-height:15px;font-weight:500;letter-spacing:.23px;color:{MUTED};"><a href="mailto:{MAIL_LIST}?subject=Unsubscribe" style="color:{MUTED};text-decoration:none;">Unsubscribe</a>&nbsp;&nbsp; &middot; &nbsp;&nbsp;<a href="mailto:{MAIL_LIST}?subject=Email%20preferences" style="color:{MUTED};text-decoration:none;">Email preferences</a>&nbsp;&nbsp; &middot; &nbsp;&nbsp;<a href="{site}/privacy" style="color:{MUTED};text-decoration:none;">Privacy</a></p>
<p style="margin:0;font-family:{SANS};font-size:11px;line-height:15px;color:{MUTED};">&copy; 2026 EV Investment. All rights reserved.</p>
</td></tr>
</table>
</td></tr></table></body></html>"##
	)
}

// ── candidate: application received ────────────────────────────────────────

fn steps_heading(label: &str) -> String {
	format!(
		r#"<p style="margin:0 0 12px;font-family:{SANS};font-size:13px;line-height:16px;font-weight:600;color:{MIST};">{}</p>"#,
		esc(label)
	)
}

fn application_received_text(vacancy: Option<&Vacancy>, reference: &str, submitted: &str, first_name: &str) -> String {
	let role = vacancy.map(|v| format!("Role: {}\nLocation: {}\n", v.title, v.location)).unwrap_or_default();
	format!(
		"Thanks, {first_name} — we've got it.\n\nYour application has reached the EV Investment team.\n\n{role}Submitted: {submitted}\nReference: {reference}\n\nWhat happens next:\n- We review your application within five business days.\n- If there's a fit, we'll invite you to an intro conversation.\n- Either way, you'll hear back from a person.\n\n— EV Investment"
	)
}

// ── internal: new application ──────────────────────────────────────────────

// ── candidate: contact message received ────────────────────────────────────

// ── internal: new contact message ──────────────────────────────────────────

// ── newsletter: subscriber confirmation ────────────────────────────────────

#[cfg(test)]
mod render_preview {
	use super::*;

	// Dumps the rendered newsletter mail so the shell can be eyeballed in a
	// browser. Not an assertion — run with `--ignored` when tweaking the design.
	#[test]
	#[ignore]
	fn dump_newsletter_html() {
		use domain::model::{
			email::EmailAddress,
			newsletter::{NewsletterId, NewsletterSubscription},
		};
		let sub = NewsletterSubscription {
			id: NewsletterId::from_raw(uuid::Uuid::parse_str("636b9c35-4f4b-40e4-9785-47cf4ff17e07").unwrap()),
			email: EmailAddress::parse("admin+newsletter@evinvest.ltd").unwrap(),
			created_at: "2026-07-27T16:31:07Z".parse().unwrap(),
		};
		let mail = candidate_newsletter_subscribed(&sub, "https://evinvest.ltd");
		std::fs::write(std::env::var("PREVIEW_OUT").unwrap_or_else(|_| "/tmp/mail.html".into()), &mail.html).unwrap();
	}

	// The richest shell: quote block, step list and the CTA button.
	#[test]
	#[ignore]
	fn dump_contact_html() {
		use domain::model::{
			contact::{ContactId, ContactMessage},
			email::EmailAddress,
		};
		let msg = ContactMessage {
			id: ContactId::from_raw(uuid::Uuid::parse_str("047937fb-be8f-4074-8c07-822a137b771b").unwrap()),
			name: "Jane Doe".to_string(),
			email: EmailAddress::parse("jane@example.com").unwrap(),
			message: "I'd like to learn more about the Quy Nhơn fund.\nCould we set up a call next week?".to_string(),
			created_at: "2026-07-27T16:31:07Z".parse().unwrap(),
		};
		let mail = candidate_contact_received(&msg, "https://evinvest.ltd");
		std::fs::write(std::env::var("PREVIEW_OUT").unwrap_or_else(|_| "/tmp/mail-contact.html".into()), &mail.html).unwrap();
	}
}
