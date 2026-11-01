import { Container } from "@evinvest/uikit";
import { ArrowDown } from "lucide-react";
import type { Locale } from "@evinvest/i18n";

import { cn } from "@/shared/lib/utils";
import { translate } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";

function Stat({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className: string;
}) {
  return (
    <div>
      <p className={cn("font-serif-display text-3xl", className)}>{value}</p>
      <p className="mt-1 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-ink/45">
        {label}
      </p>
    </div>
  );
}

export function HiringHero({
  locale,
  roleCount,
  teamCount,
}: {
  locale: Locale;
  roleCount: number;
  teamCount: number;
}) {
  const t = translate(locale);
  return (
    <section className="relative overflow-hidden bg-background pt-40 pb-16">
      <Container>
        <p className="mb-5 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-primary-ink">
          {t("hiring.hero.eyebrow", "Hiring · Join the fund")}
        </p>
        <h1 className="max-w-3xl font-serif-display text-4xl font-light leading-tight text-white sm:text-6xl">
          <Accented
            text={t(
              "hiring.hero.title",
              "Build coastal Vietnam's *next decade* with us."
            )}
          />
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink/60 sm:text-base">
          {t(
            "hiring.hero.intro",
            "EV Investment develops premium coastal assets in Quy Nhơn — and we're hiring senior people across investment, development, and client advisory. Find your role below."
          )}
        </p>
        {/* In-page anchor — no locale prefix needed, it never leaves the page. */}
        <a
          href="#open-roles"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-on-primary transition-colors hover:bg-primary/90"
        >
          {t("hiring.hero.cta", "View open roles")}{" "}
          <ArrowDown className="h-4 w-4" />
        </a>

        <div className="mt-14 flex items-center gap-10 border-t border-white/[0.06] pt-7">
          <Stat
            value={String(roleCount)}
            label={t("hiring.hero.stat.roles", "Open roles")}
            className="text-accent-warn"
          />
          <span className="h-8 w-px bg-white/10" />
          <Stat
            value={String(teamCount)}
            label={t("hiring.hero.stat.teams", "Teams hiring")}
            className="text-primary-ink"
          />
          <span className="h-8 w-px bg-white/10" />
          <Stat
            value="2"
            label={t("hiring.hero.stat.offices", "Office locations")}
            className="text-white"
          />
        </div>
      </Container>
    </section>
  );
}
