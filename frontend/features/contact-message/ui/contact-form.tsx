"use client";

import { Send } from "lucide-react";
import { useT } from "@evinvest/i18n/react";
import { LIMITS, validationCopy } from "@/shared/lib/validation";
import { SentPanel } from "@/shared/ui/sent-panel";
import { TextField } from "@/shared/ui/text-field";
import { useContactForm } from "./use-contact-form";

/** Vacancy-agnostic contact form. Posts to the backend `createContact`. */
export function ContactForm() {
  const t = useT();
  const { fields, edit, errors, status, failure, submit } = useContactForm();
  // Field errors arrive as keys (shared/lib/validation.ts).
  const copy = validationCopy(t);
  const fe = (key?: string) => (key ? copy[key] : undefined);
  const firstName = fields.name.trim().split(" ")[0];

  if (status === "sent") {
    return (
      <SentPanel
        title={
          firstName
            ? t(
                "contact.form.sent.titleNamed",
                "Thanks, {name} — message received.",
                { name: firstName }
              )
            : t("contact.form.sent.title", "Thanks — message received.")
        }
      >
        {t(
          "contact.form.sent.body",
          "We'll reply personally, usually within two business days."
        )}
      </SentPanel>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-xl border border-white/10 bg-card/40 p-6"
    >
      <div className="space-y-4">
        <TextField
          label={t("form.name.label", "Your name")}
          value={fields.name}
          onChange={edit("name")}
          error={fe(errors.name)}
          maxLength={LIMITS.name}
          required
          placeholder={t("form.name.placeholder", "Jane Doe")}
        />
        <TextField
          label={t("form.email.label", "Email")}
          type="email"
          value={fields.email}
          onChange={edit("email")}
          error={fe(errors.email)}
          maxLength={LIMITS.email}
          required
          placeholder={t("contact.form.email.placeholder", "jane@example.com")}
        />
        <TextField
          label={t("contact.form.message.label", "Message")}
          rows={5}
          value={fields.message}
          onChange={edit("message")}
          error={fe(errors.message)}
          maxLength={LIMITS.message}
          required
          placeholder={t(
            "contact.form.message.placeholder",
            "How can we help?"
          )}
        />
      </div>

      {status === "error" && failure && (
        <p role="alert" className="mt-3 text-xs text-accent-error">
          {failure === "network"
            ? t("form.networkError", "Network error — please try again.")
            : t("form.submitError", "Something went wrong. Please try again.")}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        aria-busy={status === "sending"}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-on-primary transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {status === "sending" ? (
          t("form.sending", "Sending…")
        ) : (
          <>
            {t("contact.form.submit", "Send message")}{" "}
            <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
