"use client";

import { useT } from "@evinvest/i18n/react";
import { LIMITS } from "@/shared/lib/validation";
import { TextField } from "@/shared/ui/text-field";

interface RoleBlockProps {
  title: string;
  requirements: string[];
  screeningQuestion: string;
  checked: Set<string>;
  onToggle: (requirement: string) => void;
  screeningValue: string;
  onScreeningChange: (value: string) => void;
  screeningError?: string;
}

/**
 * The injectable role section — rendered only when the form is opened from a
 * specific vacancy. Mirrors the email's "what you confirmed" block: the role's
 * requirements as checkboxes plus a role-specific screening prompt.
 */
export function RoleBlock({
  title,
  requirements,
  screeningQuestion,
  checked,
  onToggle,
  screeningValue,
  onScreeningChange,
  screeningError,
}: RoleBlockProps) {
  const t = useT();
  return (
    <div className="rounded-lg border-l-2 border-primary-ink/60 bg-primary-ink/[0.04] py-4 pl-4 pr-3">
      <p className="mb-3 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-primary-ink">
        {t("apply.role.eyebrow", "For this role · {title}", { title })}
      </p>
      {requirements.length > 0 && (
        <>
          <p className="mb-2.5 text-xs text-ink/70">
            {t("apply.role.which", "Which of these describe you?")}
          </p>
          <div className="mb-4 space-y-2.5">
            {requirements.map(requirement => (
              <label
                key={requirement}
                className="flex cursor-pointer items-start gap-2.5 text-sm leading-snug text-ink/80"
              >
                <input
                  type="checkbox"
                  checked={checked.has(requirement)}
                  onChange={() => onToggle(requirement)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span>{requirement}</span>
              </label>
            ))}
          </div>
        </>
      )}
      <TextField
        label={screeningQuestion}
        rows={3}
        value={screeningValue}
        onChange={onScreeningChange}
        error={screeningError}
        maxLength={LIMITS.screeningAnswer}
        placeholder={t("apply.role.screeningPlaceholder", "A few lines…")}
      />
    </div>
  );
}
