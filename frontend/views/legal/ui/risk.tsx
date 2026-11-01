import type { Locale } from "@evinvest/i18n";

import { riskDocument } from "../model/risk.en";
import { LegalPage } from "./legal-page";

export function RiskDisclosureView({ locale }: { locale: Locale }) {
  return <LegalPage locale={locale} document={riskDocument} />;
}
