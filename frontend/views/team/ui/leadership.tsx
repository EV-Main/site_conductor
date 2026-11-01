import { Container } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";
import { LeadershipIntro } from "@/entities/team";
import { TeamMembers } from "./members";

export function TeamLeadership({ locale }: { locale: Locale }) {
  return (
    <section className="border-t border-ink/10 py-20">
      <Container className="space-y-14">
        <LeadershipIntro locale={locale} />
        <TeamMembers locale={locale} />
      </Container>
    </section>
  );
}
