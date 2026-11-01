import { createContact } from "@/entities/contact";
import { useValidatedForm } from "@/shared/hooks/use-validated-form";
import { validateContact } from "../model/validation";

/** State + zod-validated submit for the contact form. */
export function useContactForm() {
  return useValidatedForm({
    initial: { name: "", email: "", message: "" },
    validate: validateContact,
    send: body => createContact({ body }),
  });
}
