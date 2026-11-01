import { LineChart, ShieldCheck, Anchor } from "lucide-react";
import { Container } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";

import type { Translate } from "@evinvest/i18n";
import { translate } from "@/shared/config/i18n";
import { SectionHead } from "./section-head";

const principles = (t: Translate) => [
  {
    icon: LineChart,
    title: t("team.philosophy.macro.title", "Macro-first research"),
    body: t(
      "team.philosophy.macro.body",
      "Every position starts from a top-down read of Vietnam's growth, urbanisation and coastal-tourism cycles — not from a single deal."
    ),
  },
  {
    icon: ShieldCheck,
    title: t("team.philosophy.risk.title", "Technology-driven risk"),
    body: t(
      "team.philosophy.risk.body",
      "We build our own risk and research stack — algorithmic modelling and conservative leverage are set before capital is committed, so downside is sized before upside is sold."
    ),
  },
  {
    icon: Anchor,
    title: t(
      "team.philosophy.roots.title",
      "Local roots, institutional standards"
    ),
    body: t(
      "team.philosophy.roots.body",
      "On-the-ground presence in Quy Nhon and Da Nang paired with the reporting, governance and transparency international partners expect."
    ),
  },
];

export function TeamPhilosophy({ locale }: { locale: Locale }) {
  const t = translate(locale);
  return (
    <section className="border-t border-ink/10 bg-secondary py-20">
      <Container className="space-y-12">
        <SectionHead eyebrow={t("team.philosophy.eyebrow", "How we operate")}>
          {t("team.philosophy.title", "A discipline, not a pitch")}
        </SectionHead>
        <div className="grid gap-6 md:grid-cols-3">
          {principles(t).map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="space-y-4 rounded-xl border border-ink/10 bg-card p-8"
            >
              <div className="flex size-13 items-center justify-center rounded-full bg-ink/5 text-primary-ink">
                <Icon className="size-5" />
              </div>
              <h3 className="font-serif-display text-lg font-bold text-white">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-ink/75">{body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
