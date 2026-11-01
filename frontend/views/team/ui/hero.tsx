import { Container } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";

import { translate } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";

export function TeamHero({ locale }: { locale: Locale }) {
  const t = translate(locale);
  return (
    <section className="pb-14 pt-36 sm:pt-40">
      <Container className="space-y-5">
        <span className="block font-mono-tech text-xs uppercase tracking-[0.3em] text-primary-ink">
          {t("team.eyebrow", "Our people")}
        </span>
        {/* The accent word is marked inside the catalogue string rather than
            split across two keys: German pushes the verb to the end and Russian
            reorders the phrase entirely, neither of which a fixed
            lead-plus-accent pair can express. */}
        <h1 className="max-w-3xl font-serif-display text-4xl font-light leading-[1.12] text-white sm:text-6xl">
          <Accented text={t("team.title", "The team behind *EV Investment*")} />
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-ink/80 sm:text-lg">
          {t(
            "team.intro",
            "A partnership of investment, risk and technology specialists building institutional-grade access to Vietnam's premium coastal real estate — on the ground in Quy Nhon and Da Nang."
          )}
        </p>
      </Container>
    </section>
  );
}
