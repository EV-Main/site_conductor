import { z } from "zod";
import {
  charLength,
  emailField,
  type FieldErrors,
  firstFieldErrors,
  LIMITS,
  messageField,
  nameField,
} from "@/shared/lib/validation";

// Hand-rolled to mirror the backend's PortfolioUrl checks: http(s) scheme,
// non-empty host, no whitespace or control chars.
const hasHttpHost = (value: string) => {
  const rest = value.startsWith("https://")
    ? value.slice(8)
    : value.startsWith("http://")
      ? value.slice(7)
      : null;
  return rest !== null && (rest.split(/[/?#]/, 1)[0] ?? "") !== "";
};

const portfolioField = z
  .string()
  .trim()
  .refine(
    v => charLength(v) <= LIMITS.portfolioUrl,
    "validation.url.max"
  )
  .refine(
    v => v === "" || (!/[\s\p{Cc}]/u.test(v) && hasHttpHost(v)),
    "validation.url.invalid"
  );

const screeningField = z
  .string()
  .trim()
  .refine(
    v => charLength(v) <= LIMITS.screeningAnswer,
    "validation.screening.max"
  );

export const applicationSchema = z.object({
  name: nameField,
  email: emailField,
  portfolio: portfolioField,
  message: messageField,
  screening: screeningField,
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicationErrors = FieldErrors<ApplicationInput>;

/** Trimmed payload on success, first message per offending field otherwise. */
export function validateApplication(
  fields: ApplicationInput
):
  | { data: ApplicationInput; errors?: never }
  | { data?: never; errors: ApplicationErrors } {
  const result = applicationSchema.safeParse(fields);
  return result.success
    ? { data: result.data }
    : { errors: firstFieldErrors(result.error) };
}
