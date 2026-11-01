import { z } from "zod";

import type { Translate } from "@evinvest/i18n";

// Limits mirror the backend contract (backend/openapi.json, issue #125);
// change them together or the form and the API drift apart.
export const LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
  portfolioUrl: 2048,
  screeningAnswer: 5000,
} as const;

/** Code-point count — the backend counts chars, not UTF-16 units. */
export const charLength = (value: string) => [...value].length;

// The refinement "messages" are keys, not prose: a zod message is produced
// where no translator exists (module scope, shared by two forms) and read where
// one does. `validationCopy` below is the other half — the form resolves the
// key at render, see the `fe` helper in each. Keys and copy are stated together
// there, and both forms index the same record, so an unlisted key is a hole a
// reader would see.
export const validationCopy = (t: Translate): Record<string, string> => ({
  "validation.name.min": t(
    "validation.name.min",
    "Name must be at least 2 characters."
  ),
  "validation.name.max": t(
    "validation.name.max",
    "Name must be {name} characters or fewer.",
    LIMITS
  ),
  "validation.name.charset": t(
    "validation.name.charset",
    "Use letters, spaces, and . ' - only."
  ),
  "validation.name.letters": t(
    "validation.name.letters",
    "Name must contain at least 2 letters."
  ),
  "validation.email.invalid": t(
    "validation.email.invalid",
    "Enter a valid email address."
  ),
  "validation.email.max": t(
    "validation.email.max",
    "Email must be {email} characters or fewer.",
    LIMITS
  ),
  "validation.message.required": t(
    "validation.message.required",
    "Please write a message."
  ),
  "validation.message.max": t(
    "validation.message.max",
    "Message must be {message} characters or fewer.",
    LIMITS
  ),
  "validation.url.max": t(
    "validation.url.max",
    "Link must be {portfolioUrl} characters or fewer.",
    LIMITS
  ),
  "validation.url.invalid": t(
    "validation.url.invalid",
    "Enter a full link starting with http:// or https://."
  ),
  "validation.screening.max": t(
    "validation.screening.max",
    "Answer must be {screeningAnswer} characters or fewer.",
    LIMITS
  ),
});

export const nameField = z
  .string()
  .trim()
  .refine(v => charLength(v) >= 2, "validation.name.min")
  .refine(v => charLength(v) <= LIMITS.name, "validation.name.max")
  .refine(v => /^[\p{Alphabetic} .'-]*$/u.test(v), "validation.name.charset")
  .refine(
    v => (v.match(/\p{Alphabetic}/gu) ?? []).length >= 2,
    "validation.name.letters"
  );

export const emailField = z
  .string()
  .trim()
  .pipe(
    z
      .email("validation.email.invalid")
      .max(LIMITS.email, "validation.email.max")
  );

export const messageField = z
  .string()
  .trim()
  .refine(v => v.length > 0, "validation.message.required")
  .refine(v => charLength(v) <= LIMITS.message, "validation.message.max");

export type FieldErrors<T> = Partial<Record<keyof T & string, string>>;

/** First issue per field — the message an inline form error displays. */
export function firstFieldErrors<T>(error: z.ZodError<T>): FieldErrors<T> {
  const fields = z.flattenError(error).fieldErrors as Record<
    string,
    string[] | undefined
  >;
  const first: FieldErrors<T> = {};
  for (const [field, messages] of Object.entries(fields)) {
    if (messages?.[0]) first[field as keyof T & string] = messages[0];
  }
  return first;
}
