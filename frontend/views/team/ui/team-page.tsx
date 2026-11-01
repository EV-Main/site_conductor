import type { Locale } from "@evinvest/i18n";

import { TeamHero } from "./hero";
import { TeamLeadership } from "./leadership";
import { TeamPhilosophy } from "./philosophy";
import { TeamOffices } from "./offices";
import { TeamJoin } from "./join";
import { TeamStructuredData } from "./team-structured-data";

// Dedicated /team page (ported from Figma "Team · Desktop"). Fully static — no
// backend data — so it statically generates and is indexable. Header/Footer are
// app-shell chrome from the root layout; this view owns the content top-to-bottom.
export function TeamPageView({ locale }: { locale: Locale }) {
  return (
    <div className="min-h-screen bg-background text-ink">
      <TeamStructuredData locale={locale} />
      <TeamHero locale={locale} />
      <TeamLeadership locale={locale} />
      <TeamPhilosophy locale={locale} />
      <TeamOffices locale={locale} />
      <TeamJoin locale={locale} />
    </div>
  );
}
