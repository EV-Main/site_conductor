import { Container } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";
import { ApplicationForm } from "@/features/job-application";
import type { VacancyDetail } from "@/entities/vacancy";
import { translate } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";
import { DashList } from "./dash-list";

/** Closing apply band — reassurance copy beside the role-mode application form
 *  (the universal form with its role block injected). */
export function VacancyApply({
  vacancy,
  locale,
}: {
  vacancy: VacancyDetail;
  locale: Locale;
}) {
  const t = translate(locale);
  return (
    <section id="apply" className="scroll-mt-24 bg-background pb-24 pt-8">
      <Container>
        <div className="rounded-3xl border border-white/[0.06] bg-card/20 p-4 sm:p-12">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-primary-ink">
                {t("vacancy.apply.eyebrow", "Apply")}
              </p>
              <h2 className="font-serif-display text-3xl text-white sm:text-4xl">
                <Accented
                  text={t("vacancy.apply.title", "Send your *application*.")}
                />
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/60">
                {t(
                  "vacancy.apply.intro",
                  "Tell us where you'd fit on the {role} role. A few lines is enough — we read every note and reply within about two weeks.",
                  { role: vacancy.title }
                )}
              </p>
              <div className="mt-6">
                <DashList
                  items={[
                    t(
                      "vacancy.apply.point1",
                      "No cover-letter theatre — your work speaks."
                    ),
                    t("vacancy.apply.point2", "You'll hear back either way."),
                    t(
                      "vacancy.apply.point3",
                      "Questions first? admin@evinvest.ltd"
                    ),
                  ]}
                />
              </div>
            </div>
            <ApplicationForm
              vacancy={{
                slug: vacancy.slug,
                title: vacancy.title,
                requirements: vacancy.requirements,
                screeningQuestion: vacancy.screening_question,
              }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
