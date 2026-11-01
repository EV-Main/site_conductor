"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Container } from "@evinvest/uikit";
import { useLocale, useT } from "@evinvest/i18n/react";
import { vacancyCategories, type VacancySummary } from "@/entities/vacancy";
import { Accented } from "@/shared/ui/accented";
import { RoleRow } from "./role-row";

export function HiringBoard({ vacancies }: { vacancies: VacancySummary[] }) {
  const t = useT();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vacancies.filter(v => {
      const matchesCategory = category === "all" || v.category === category;
      const matchesQuery =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.summary.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [vacancies, query, category]);

  return (
    <section id="open-roles" className="scroll-mt-24 bg-background py-20">
      <Container>
        <p className="mb-4 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-primary-ink">
          {t("hiring.board.eyebrow", "Open roles")}
        </p>
        <h2 className="font-serif-display text-3xl text-white sm:text-4xl">
          <Accented text={t("hiring.board.title", "Where we're *hiring*.")} />
        </h2>

        <div className="mt-8 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t(
                "hiring.board.search",
                "Search roles, teams, or locations…"
              )}
              aria-label={t("hiring.board.searchLabel", "Search roles")}
              // text-base on phones: under 16px iOS zooms the viewport on
              // focus (see shared/ui/control.ts). sm: keeps the 14px design.
              className="w-full rounded-lg border border-white/10 bg-card/40 py-3.5 pl-11 pr-4 text-base sm:text-sm text-ink placeholder:text-ink/30 outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <span className="hidden whitespace-nowrap font-mono-tech text-[11px] uppercase tracking-[0.2em] text-primary-ink sm:block">
            {t(
              "hiring.board.count",
              "{count, plural, one {# role} other {# roles}}",
              { count: filtered.length }
            )}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          {vacancyCategories(t).map(c => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={
                category === c.key
                  ? "rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-on-primary"
                  : "rounded-full border border-white/[0.12] px-4 py-1.5 text-xs text-ink/70 transition-colors hover:border-white/25"
              }
            >
              {c.key === "all"
                ? t("hiring.board.allRoles", "All roles")
                : c.label}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {filtered.map(vacancy => (
            <RoleRow key={vacancy.slug} vacancy={vacancy} locale={locale} />
          ))}
          {filtered.length === 0 && (
            <p className="py-16 text-center text-sm text-ink/40">
              {t("hiring.board.empty", "No roles match your search.")}{" "}
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
                className="text-primary-ink underline-offset-2 hover:underline"
              >
                {t("hiring.board.clear", "Clear filters")}
              </button>
              .
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
