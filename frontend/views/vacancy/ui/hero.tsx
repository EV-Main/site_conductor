import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  Clock,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@evinvest/uikit";
import { localePath, type Locale } from "@evinvest/i18n";
import { type VacancyDetail, teamLabels } from "@/entities/vacancy";
import { translate } from "@/shared/config/i18n";
import { ShareButton } from "./share-button";
import { UntranslatedNotice } from "./untranslated-notice";

// The dot said nothing; the icon says which fact the pill carries. Decorative —
// the translated `label` beside it is the accessible name.
function Pill({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/40 px-3.5 py-1.5">
      <Icon aria-hidden className="size-3.5 text-primary-ink/80" />
      <span className="font-mono-tech text-[9px] uppercase tracking-[0.16em] text-ink/45">
        {label}
      </span>
      <span className="text-xs text-ink/85">{value}</span>
    </span>
  );
}

export function VacancyHero({
  vacancy,
  locale,
}: {
  vacancy: VacancyDetail;
  locale: Locale;
}) {
  const t = translate(locale);
  const team = teamLabels(t)[vacancy.category] ?? vacancy.category_label;
  return (
    <section className="bg-background pt-32 pb-10">
      <Container>
        <Link
          href={localePath(locale, "/hiring")}
          className="inline-flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-[0.16em] text-ink/45 transition-colors hover:text-ink/80"
        >
          <ArrowLeft className="h-3.5 w-3.5" />{" "}
          {t("vacancy.back", "All open roles")}
        </Link>
        {!vacancy.translated && <UntranslatedNotice locale={locale} />}
        <p className="mt-7 font-mono-tech text-[11px] uppercase tracking-[0.3em] text-primary-ink">
          {team} · {vacancy.employment_type}
        </p>
        <h1 className="mt-3 font-serif-display text-4xl text-white sm:text-5xl">
          {vacancy.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/60 sm:text-base">
          {vacancy.summary}
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Pill
            icon={MapPin}
            label={t("vacancy.pill.location", "Location")}
            value={vacancy.location}
          />
          <Pill
            icon={Clock}
            label={t("vacancy.pill.type", "Type")}
            value={vacancy.employment_type}
          />
          <Pill
            icon={Briefcase}
            label={t("vacancy.pill.team", "Team")}
            value={team}
          />
          <Pill
            icon={Banknote}
            label={t("vacancy.pill.compensation", "Compensation")}
            value={vacancy.compensation}
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#apply"
            className="inline-flex items-center rounded-md bg-primary px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-on-primary transition-colors hover:bg-primary/90"
          >
            {t("vacancy.applyCta", "Apply for this role")}
          </a>
          <ShareButton />
        </div>
      </Container>
    </section>
  );
}
