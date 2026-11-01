import { z } from "zod";
import {
  emailField,
  type FieldErrors,
  firstFieldErrors,
  messageField,
  nameField,
} from "@/shared/lib/validation";

export const contactSchema = z.object({
  name: nameField,
  email: emailField,
  message: messageField,
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactErrors = FieldErrors<ContactInput>;

/** Trimmed payload on success, first message per offending field otherwise. */
export function validateContact(
  fields: ContactInput
):
  | { data: ContactInput; errors?: never }
  | { data?: never; errors: ContactErrors } {
  const result = contactSchema.safeParse(fields);
  return result.success
    ? { data: result.data }
    : { errors: firstFieldErrors(result.error) };
}
