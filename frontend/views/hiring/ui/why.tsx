import type { LucideIcon } from "lucide-react";
import { Crosshair, Microscope, Sparkles, TrendingUp } from "lucide-react";
import { Container } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";

import { translate } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";

function Reason({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="border-t border-white/10 pt-5">
      <div className="flex size-10 items-center justify-center rounded-full bg-ink/5 text-primary-ink">
        <Icon aria-hidden className="size-4" />
      </div>
      <h3 className="mt-3 font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/55">{body}</p>
    </div>
  );
}

// Written out rather than mapped over a list: these four are a set, not a
// sequence — the old "01".."04" markers implied an order the copy does not have
// — so nothing here reads its own position, and the array was only ever a place
// to park copy away from the markup rendering it. Contrast process.tsx, which
// keeps its array precisely because the ordinal there IS the index.
export function HiringWhy({ locale }: { locale: Locale }) {
  const t = translate(locale);
  return (
    <section className="bg-background py-20">
      <Container>
        <p className="mb-4 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-primary-ink">
          {t("hiring.why.eyebrow", "Why EV")}
        </p>
        <h2 className="font-serif-display text-3xl text-white sm:text-4xl">
          <Accented text={t("hiring.why.title", "Why join *now*.")} />
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Reason
            icon={Crosshair}
            title={t("hiring.why.focus.title", "Focus")}
            body={t(
              "hiring.why.focus.body",
              "A focused thesis: 100% concentration and expertise in today's most promising emerging market."
            )}
          />
          <Reason
            icon={Microscope}
            title={t("hiring.why.rigor.title", "Institutional rigor")}
            body={t(
              "hiring.why.rigor.body",
              "Data-driven research and underwriting on assets you can stand in front of."
            )}
          />
          <Reason
            icon={TrendingUp}
            title={t("hiring.why.scale.title", "Ground-floor scale")}
            body={t(
              "hiring.why.scale.body",
              "Join early. Your work compounds into the fund's track record — and your own."
            )}
          />
          <Reason
            icon={Sparkles}
            title={t("hiring.why.upside.title", "Aligned upside")}
            body={t(
              "hiring.why.upside.body",
              "Senior contributors share in the carry they help create."
            )}
          />
        </div>
      </Container>
    </section>
  );
}
