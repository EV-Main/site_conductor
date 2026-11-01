"use client";

import { useT } from "@evinvest/i18n/react";
import { LIMITS, validationCopy } from "@/shared/lib/validation";
import { SentPanel } from "@/shared/ui/sent-panel";
import { TextField } from "@/shared/ui/text-field";
import { FormFooter, FormHeader } from "./form-chrome";
import { RoleBlock } from "./role-block";
import {
  useApplicationForm,
  type VacancyContext,
} from "./use-application-form";

/**
 * The universal dispatch/letter form. Posts to the backend `createApplication`
 * endpoint. When `vacancy` is provided it renders the injectable role block and
 * tags the submission with the slug; otherwise it's a general talent-pool
 * application. Reused by the hiring board (general) and the role page (role).
 */
export function ApplicationForm({ vacancy }: { vacancy?: VacancyContext }) {
  const t = useT();
  const { fields, edit, checked, toggle, errors, status, failure, submit } =
    useApplicationForm(vacancy);
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
                "apply.form.sent.titleNamed",
                "Thanks, {name} — we've got it.",
                { name: firstName }
              )
            : t("apply.form.sent.title", "Thanks — we've got it.")
        }
      >
        {t(
          "apply.form.sent.body",
          "Your application has reached our team. We read every one and will be in touch."
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
      <FormHeader roleTitle={vacancy?.title} />

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
          placeholder={t("apply.form.email.placeholder", "jane@fund.com")}
        />
        <TextField
          label={t(
            "apply.form.portfolio.label",
            "Portfolio or LinkedIn (optional)"
          )}
          value={fields.portfolio}
          onChange={edit("portfolio")}
          error={fe(errors.portfolio)}
          maxLength={LIMITS.portfolioUrl}
          placeholder={t("apply.form.portfolio.placeholder", "https://…")}
        />
        {vacancy && (
          <RoleBlock
            title={vacancy.title}
            requirements={vacancy.requirements}
            screeningQuestion={vacancy.screeningQuestion}
            checked={checked}
            onToggle={toggle}
            screeningValue={fields.screening}
            onScreeningChange={edit("screening")}
            screeningError={fe(errors.screening)}
          />
        )}
        <TextField
          label={t("apply.form.message.label", "Where you'd fit")}
          rows={4}
          value={fields.message}
          onChange={edit("message")}
          error={fe(errors.message)}
          maxLength={LIMITS.message}
          required
          placeholder={t(
            "apply.form.message.placeholder",
            "A few lines on what you'd want to own, and why EV…"
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

      <FormFooter sending={status === "sending"} />
    </form>
  );
}
