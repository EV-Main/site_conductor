"use client";

import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { localePath, type Locale } from "@evinvest/i18n";
import { useT } from "@evinvest/i18n/react";
import { type VacancySummary, teamLabels } from "@/entities/vacancy";

export function RoleRow({
  vacancy,
  locale,
}: {
  vacancy: VacancySummary;
  locale: Locale;
}) {
  const t = useT();
  return (
    <Link
      href={localePath(locale, `/hiring/${vacancy.slug}`)}
      className="group flex items-center justify-between gap-6 rounded-2xl border border-white/[0.06] bg-card/30 p-6 transition-colors hover:border-primary-ink/30 hover:bg-card/50 sm:p-7"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-serif-display text-xl text-white sm:text-2xl">
            {vacancy.title}
          </h3>
          <span className="rounded bg-primary-ink/10 px-2 py-0.5 font-mono-tech text-[9px] uppercase tracking-[0.16em] text-primary-ink">
            {teamLabels(t)[vacancy.category] ?? vacancy.category_label}
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/60">{vacancy.summary}</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-tech text-[10px] uppercase tracking-[0.16em] text-ink/40">
          <span className="flex items-center gap-1.5">
            <MapPin aria-hidden className="size-3" />
            {vacancy.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock aria-hidden className="size-3" />
            {vacancy.employment_type}
          </span>
        </p>
      </div>
      <span className="hidden shrink-0 items-center gap-2 rounded-md border border-primary-ink/30 px-4 py-2 font-mono-tech text-[11px] uppercase tracking-widest text-primary-ink transition-colors group-hover:bg-primary-ink/10 sm:inline-flex">
        {t("hiring.board.viewRole", "View role")}{" "}
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
