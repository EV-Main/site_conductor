import { MapPin } from "lucide-react";
import { Container } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";

import { OFFICES } from "@/shared/config/site";
import type { Translate } from "@evinvest/i18n";
import { translate } from "@/shared/config/i18n";
import { SectionHead } from "./section-head";

/// Keyed by `OFFICES[].id`.
const officeNames = (t: Translate): Record<string, string> => ({
  quynhon: t("team.offices.quynhon", "Quy Nhon Head Office"),
  hcmc: t("team.offices.hcmc", "Ho Chi Minh Representative"),
});

export function TeamOffices({ locale }: { locale: Locale }) {
  const t = translate(locale);
  const names = officeNames(t);
  // An office added to shared/config/site with no name here would otherwise
  // render an empty heading, which reads as a styling bug rather than a gap.
  const offices = OFFICES.map(office => {
    const name = names[office.id];
    if (!name) throw new Error(`office "${office.id}" has no translated name`);
    return { ...office, name };
  });
  return (
    <section className="border-t border-ink/10 py-20">
      <Container className="space-y-12">
        <SectionHead eyebrow={t("team.offices.eyebrow", "Presence")}>
          {t("team.offices.title", "Where we work")}
        </SectionHead>
        <div className="grid gap-6 md:grid-cols-2">
          {offices.map(office => (
            <div
              key={office.id}
              className="space-y-3.5 rounded-xl border border-ink/10 bg-card p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-ink/5 text-primary-ink">
                  <MapPin className="size-5" />
                </div>
                <h3 className="font-mono-tech text-[11px] uppercase tracking-widest text-white">
                  {office.name}
                </h3>
              </div>
              {/* The office *name* above is descriptive and translates. The
                  postal address does not: it is the address a courier, a visa
                  form or Google Maps has to resolve, and it is the same string
                  the Organization JSON-LD emits. Translating it would break
                  both. */}
              <p className="leading-relaxed text-ink/80">
                {office.streetAddress}, {office.addressLocality},{" "}
                {office.addressRegion}, {office.addressCountry}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
