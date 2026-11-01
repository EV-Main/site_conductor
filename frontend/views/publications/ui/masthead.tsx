import { Clock, FileText, LineChart, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Locale } from "@evinvest/i18n";

import { formatPublicationDate } from "@/entities/publication";
import { translate } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";

/// Counts come from the caller so this stays a dumb server component and the
/// view keeps a single read of the catalogue.
export function Masthead({
  fieldNoteCount,
  researchCount,
  whitepaperCount,
  updatedAt,
  locale,
}: {
  fieldNoteCount: number;
  researchCount: number;
  whitepaperCount: number;
  updatedAt?: string;
  locale: Locale;
}) {
  const t = translate(locale);
  // A zero count is not a fact worth stating — "0 FIELD NOTES" reads as a
  // section that broke rather than one that has not started.
  // Real ICU plurals: Russian needs one/few/many/other for these counts, which
  // string concatenation cannot express.
  // The icon carries the same counter the label spells out, so it is decorative
  // and the rail keeps reading correctly in all five locales without it.
  const stats: { icon: LucideIcon; text: string }[] = [
    fieldNoteCount > 0
      ? {
          icon: MapPin,
          text: t(
            "publications.stat.fieldNotes",
            "{count, plural, one {# FIELD NOTE} other {# FIELD NOTES}}",
            { count: fieldNoteCount }
          ),
        }
      : null,
    researchCount > 0
      ? {
          icon: LineChart,
          text: t(
            "publications.stat.reports",
            "{count, plural, one {# REPORT} other {# REPORTS}}",
            { count: researchCount }
          ),
        }
      : null,
    whitepaperCount > 0
      ? {
          icon: FileText,
          text: t(
            "publications.stat.whitepapers",
            "{count, plural, one {# WHITEPAPER} other {# WHITEPAPERS}}",
            { count: whitepaperCount }
          ),
        }
      : null,
    updatedAt
      ? {
          icon: Clock,
          text: t("publications.stat.updated", "UPDATED {date}", {
            date: formatPublicationDate(updatedAt, "short", locale),
          }),
        }
      : null,
  ].filter(stat => stat !== null);

  return (
    <header>
      <span className="block font-mono-tech text-xs tracking-[0.3em] text-primary-ink uppercase">
        {t("publications.eyebrow", "EV Investment · Publications")}
      </span>
      <h1 className="mt-4 font-serif-display text-4xl leading-tight font-light text-white sm:text-6xl">
        <Accented text={t("publications.title", "Field Notes *& Research*")} />
      </h1>
      <p className="mt-5 max-w-3xl leading-relaxed font-light text-ink/70">
        {t(
          "publications.intro",
          "Three kinds of evidence. Research is the desk work — macro models, land sweeps, yield decomposition, published as citable PDFs. Field notes are the ground truth: our people filming the districts we underwrite. The whitepaper is the standing document behind both."
        )}
      </p>
      <ul className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2 border-y border-ink/15 py-4 font-mono-tech text-[11px] tracking-[0.15em] text-ink/50">
        {stats.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2">
            <Icon aria-hidden className="size-3.5 text-primary-ink" />
            {text}
          </li>
        ))}
      </ul>
    </header>
  );
}
