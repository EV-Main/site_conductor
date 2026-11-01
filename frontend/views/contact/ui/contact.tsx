import { Mail, MapPin } from "lucide-react";
import { Container } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";

import { ContactForm } from "@/features/contact-message";
import type { Translate } from "@evinvest/i18n";
import { translate } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";

import { ContactStructuredData } from "./contact-structured-data";

// The city name translates too ("Хошимин"), so it is a message rather than a
// literal interpolated into one.
const offices = (t: Translate) => [
  {
    city: t("contact.office.hq.city", "Quy Nhơn"),
    line: t("contact.office.hq.line", "Coastal HQ · Bình Định, Vietnam"),
  },
  {
    city: t("contact.office.hcmc.city", "Ho Chi Minh City"),
    line: t("contact.office.hcmc.line", "Investor relations · District 1"),
  },
];

function Channel({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-ink/45">
        <Mail aria-hidden className="size-3.5 text-primary-ink" />
        {label}
      </p>
      <a
        href={`mailto:${value}`}
        className="text-sm text-ink/85 transition-colors hover:text-primary-ink"
      >
        {value}
      </a>
    </div>
  );
}

export function ContactView({ locale }: { locale: Locale }) {
  const t = translate(locale);
  return (
    <div className="min-h-screen bg-background text-ink">
      <ContactStructuredData />
      <section className="pt-36 pb-24">
        <Container>
          <div className="grid gap-14 lg:grid-cols-2">
            <div>
              <p className="mb-5 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-primary-ink">
                {t("contact.eyebrow", "Contact")}
              </p>
              <h1 className="font-serif-display text-4xl font-light text-white sm:text-5xl">
                <Accented text={t("contact.title", "Let's *talk*.")} />
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/60 sm:text-base">
                {t(
                  "contact.intro",
                  "Questions about a role, an investment, or one of our coastal developments? Send a note and a person — not a bot — will reply."
                )}
              </p>
              <div className="mt-9 flex flex-wrap gap-10">
                <Channel
                  label={t("contact.channel.general", "Email")}
                  value="admin@evinvest.ltd"
                />
              </div>
              <div className="mt-10 grid gap-6 border-t border-white/[0.06] pt-8 sm:grid-cols-2">
                {offices(t).map(office => (
                  <div key={office.city}>
                    <p className="flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.18em] text-ink/60">
                      <MapPin
                        aria-hidden
                        className="size-3.5 text-primary-ink"
                      />
                      {office.city}
                    </p>
                    <p className="mt-1 text-sm text-ink/45">{office.line}</p>
                  </div>
                ))}
              </div>
            </div>
            <ContactForm />
          </div>
        </Container>
      </section>
    </div>
  );
}
