import type { Locale } from "@evinvest/i18n";

import { privacyDocument } from "../model/privacy.en";
import { LegalPage } from "./legal-page";

export function PrivacyView({ locale }: { locale: Locale }) {
  return <LegalPage locale={locale} document={privacyDocument} />;
}
