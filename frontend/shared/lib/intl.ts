import type { Locale } from "@evinvest/i18n";

// The BCP-47 tag each locale formats under. `@evinvest/i18n` deliberately owns
// no number or date policy (see its module doc), so this app keeps one map and
// every Intl formatter reads it — a second map would let the hero and the
// publication cards disagree on what "17.09.2026" means.
//
// `en` maps to en-GB, not `en`: day-month-year, which is what this site has
// always shown and what the rest of its copy assumes.
export const LOCALE_TAG: Record<Locale, string> = {
  en: "en-GB",
  ru: "ru-RU",
  vi: "vi-VN",
  fr: "fr-FR",
  de: "de-DE",
};

// Constructing an Intl formatter is not cheap and these run per card and per
// frame, so each (tag, options) pair is built once and kept.
const DATE_FORMATTERS = new Map<string, Intl.DateTimeFormat>();
const NUMBER_FORMATTERS = new Map<string, Intl.NumberFormat>();

/**
 * `long`  — prose: "17 September 2026", "17 сентября 2026 г."
 * `label` — a mono-tech caption: "17 SEP 2026". Day, month and year only, no
 *           literals, so an `uppercase` caller never ends up with Russian's
 *           era suffix dangling as "Г." after the year.
 */
export type CalendarDateStyle = "long" | "label";

function dateFormatter(
  locale: Locale,
  style: CalendarDateStyle
): Intl.DateTimeFormat {
  const tag = LOCALE_TAG[locale];
  const key = `${tag}:${style}`;
  const cached = DATE_FORMATTERS.get(key);
  if (cached) return cached;
  const built = new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  });
  DATE_FORMATTERS.set(key, built);
  return built;
}

function numberFormatter(
  locale: Locale,
  options: Intl.NumberFormatOptions & { style?: "decimal" | "percent" }
): Intl.NumberFormat {
  const tag = LOCALE_TAG[locale];
  const key = `${tag}:${options.style ?? "decimal"}:${options.maximumFractionDigits}`;
  const cached = NUMBER_FORMATTERS.get(key);
  if (cached) return cached;
  const built = new Intl.NumberFormat(tag, options);
  NUMBER_FORMATTERS.set(key, built);
  return built;
}

/** A fixed-precision decimal in the locale's digits — "16.4" vs "16,4". */
export function formatDecimal(
  value: number,
  locale: Locale,
  fractionDigits: number
): string {
  return numberFormatter(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * A percentage from a percent-scale value (16.4 → "16.4%", "16,4 %"): the
 * locale owns the spacing before the sign, which is where the variants differ.
 */
export function formatPercent(
  pct: number,
  locale: Locale,
  fractionDigits: number
): string {
  return numberFormatter(locale, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(pct / 100);
}

/**
 * A calendar date ("2026-09-17") in the locale's form. Parsed at UTC midnight so
 * the day never shifts for a reader west of Greenwich; an unparseable input
 * comes back verbatim rather than as "Invalid Date".
 *
 * The label style is built from parts rather than by stripping characters out
 * of the formatted string: `replace(/\./g, "")` was an en-GB assumption that
 * turned Russian's "2026 г." into a dangling "2026 Г". Keeping only
 * day/month/year drops every locale's literals while preserving its field
 * *order*, which is the part that actually differs.
 */
export function formatCalendarDate(
  iso: string,
  locale: Locale,
  style: CalendarDateStyle = "long"
): string {
  const at = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(at.getTime())) return iso;
  const formatter = dateFormatter(locale, style);
  if (style === "long") return formatter.format(at);
  return formatter
    .formatToParts(at)
    .filter(
      part =>
        part.type === "day" || part.type === "month" || part.type === "year"
    )
    .map(part => part.value)
    .join(" ");
}
