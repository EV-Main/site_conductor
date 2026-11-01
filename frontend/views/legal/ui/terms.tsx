import type { Locale } from "@evinvest/i18n";

import { termsDocument } from "../model/terms.en";
import { LegalPage } from "./legal-page";

export function TermsView({ locale }: { locale: Locale }) {
  return <LegalPage locale={locale} document={termsDocument} />;
}
