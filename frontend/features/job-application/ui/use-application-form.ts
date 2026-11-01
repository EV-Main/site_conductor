import { useState } from "react";
import { createApplication } from "@/entities/job-application";
import { useValidatedForm } from "@/shared/hooks/use-validated-form";
import { validateApplication } from "../model/validation";

export interface VacancyContext {
  slug: string;
  title: string;
  requirements: string[];
  screeningQuestion: string;
}

const EMPTY = {
  name: "",
  email: "",
  portfolio: "",
  message: "",
  screening: "",
};

/** State + zod-validated submit for the application form. */
export function useApplicationForm(vacancy?: VacancyContext) {
  // The confirmed requirements are the role branch's own state: only a vacancy
  // renders checkboxes, and only a vacancy sends them.
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (requirement: string) =>
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(requirement)) next.delete(requirement);
      else next.add(requirement);
      return next;
    });

  const form = useValidatedForm({
    initial: EMPTY,
    validate: validateApplication,
    send: ({ name, email, portfolio, message, screening }) =>
      createApplication({
        body: {
          vacancy_slug: vacancy?.slug,
          name,
          email,
          portfolio_url: portfolio || undefined,
          message,
          confirmed_requirements: vacancy ? [...checked] : [],
          screening_answer: vacancy && screening ? screening : undefined,
        },
      }),
  });

  return { ...form, checked, toggle };
}
