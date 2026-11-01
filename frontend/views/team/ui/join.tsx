import Link from "next/link";
import { Container } from "@evinvest/uikit";
import { localePath, type Locale } from "@evinvest/i18n";

import { joinCards } from "@/entities/team";
import { translate } from "@/shared/config/i18n";
import { SectionHead } from "./section-head";

export function TeamJoin({ locale }: { locale: Locale }) {
  const t = translate(locale);
  // Locale-prefixed for the same reason localizeNav prefixes the header: a
  // reader on /ru/team clicking through must not land on the English /hiring.
  const cards = joinCards(t, href => localePath(locale, href));
  return (
    <section className="border-t border-ink/10 pb-24 pt-20">
      <Container className="space-y-12">
        <SectionHead eyebrow={t("team.join.eyebrow", "Get involved")}>
          {t("team.join.title", "Build the fund with us")}
        </SectionHead>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Plain styled <Link> CTAs (not two sibling <Button asChild> — that
              desyncs hydration under React 19; see frontend/PATTERNS.md §7). */}
          {cards.map(({ icon: Icon, href, eyebrow, title, body, cta }) => (
            <div
              key={href}
              className="flex flex-col items-center gap-4 rounded-xl border border-ink/10 bg-card px-8 py-14 text-center"
            >
              <div className="flex size-13 items-center justify-center rounded-full bg-ink/5 text-primary-ink">
                <Icon className="size-5" />
              </div>
              <span className="font-mono-tech text-[10px] uppercase tracking-widest text-ink/60">
                {eyebrow}
              </span>
              <h3 className="font-serif-display text-lg font-bold text-white">
                {title}
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-ink/75">
                {body}
              </p>
              <Link
                href={href}
                className="mt-1 rounded-md border border-primary-ink/60 px-5 py-2 font-mono-tech text-[11px] uppercase tracking-widest text-primary-ink transition-colors hover:bg-primary-ink/10"
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
