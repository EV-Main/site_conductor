import Image from "next/image";
import type { Locale } from "@evinvest/i18n";
import { Text, Tier } from "@/shared/ui/text";
import { SplitText } from "@/shared/ui/motion";
import { getVariant } from "@/features/ab-variant/get-variant";
import { ExperimentTracker, match } from "@/features/ab-variant";
import { ASSETS } from "@/shared/config/assets";
import type { Translate } from "@evinvest/i18n";
import { translate } from "@/shared/config/i18n";
import { accented } from "@/shared/ui/accented";

/**
 * The four competences the intro sentence already names, pulled out as their own
 * row. The order is deliberate — it is the order the work happens in, not the
 * order the partners rank in.
 *
 * There are four for a structural reason: this block sits directly above a 4-up
 * grid (portraits on the homepage, offices and roles on /team). A three-column
 * strip over a four-column grid reads as a row that failed to fill; matching the
 * count makes the two blocks share one set of column edges, which is the whole
 * job of a text band between two grids.
 */
const pillars = (t: Translate) => [
  {
    title: t("team.leadership.pillar.investment.title", "Investment"),
    body: t(
      "team.leadership.pillar.investment.body",
      "Capital structure, entry pricing and the mandates we take from partners."
    ),
  },
  {
    title: t("team.leadership.pillar.risk.title", "Risk modelling"),
    body: t(
      "team.leadership.pillar.risk.body",
      "Downside first — occupancy, currency and exit-timing scenarios before any upside."
    ),
  },
  {
    title: t("team.leadership.pillar.development.title", "Development"),
    body: t(
      "team.leadership.pillar.development.body",
      "Specification, contractor selection and oversight of what actually gets built."
    ),
  },
  {
    title: t("team.leadership.pillar.execution.title", "On the ground"),
    body: t(
      "team.leadership.pillar.execution.body",
      "Present in Quy Nhon and Da Nang — a standing presence, not a travel schedule."
    ),
  },
];

/**
 * Shared leadership intro — a text-only band: eyebrow and display heading on the
 * left, the positioning sentence on the right, and the four competences beneath
 * on the grid the section below already uses. Single source for both the
 * homepage Team section and the /team page, so the copy never drifts.
 *
 * It carried a boardroom photograph unconditionally until v0.2.62, on the
 * argument that the picture did no work the sentence beside it wasn't already
 * doing and gave the section two focal points before the reader reached a single
 * face. `team_office` now measures that argument instead of assuming it: `a` is
 * the text-only band, `b` restores the photograph. Only the picture is switched —
 * the heading, sentence and pillars are one copy shared by both variants.
 */
export async function LeadershipIntro({ locale }: { locale: Locale }) {
  const t = translate(locale);
  const office = await getVariant("team_office");
  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="space-y-5 lg:col-span-7">
          <span className="block font-mono-tech text-xs uppercase tracking-[0.3em] text-primary-ink">
            {t("team.leadership.eyebrow", "Leadership")}
          </span>
          <h2 className="font-serif-display text-3xl font-light leading-[1.15] text-white sm:text-4xl">
            <SplitText inView>
              {accented({
                text: t(
                  "team.leadership.title",
                  "Led by *Institutional Pioneers*"
                ),
              })}
            </SplitText>
          </h2>
        </div>
        <Tier tier="main">
          <Text className="lg:col-span-5">
            {t(
              "team.leadership.intro",
              "Our partners pair hands-on investment, risk-modelling and development experience with on-the-ground execution in Quy Nhon and Da Nang — local presence held to institutional discipline."
            )}
          </Text>
        </Tier>
      </div>

      <ExperimentTracker experiment="team_office" variant={office}>
        {match(office, {
          a: null,
          b: (
            <div className="relative aspect-[21/9] overflow-hidden rounded-xl border border-ink/10 shadow-2xl">
              <Image
                src={ASSETS.office_interior}
                alt={t(
                  "team.leadership.photoAlt",
                  "EV Investment boardroom in Quy Nhon"
                )}
                fill
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover opacity-80"
              />
            </div>
          ),
        })}
      </ExperimentTracker>

      <dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
        {pillars(t).map(({ title, body }, i) => (
          // A <dl> may only contain <dt>/<dd> pairs, optionally wrapped one
          // pair to a <div> — so the ordinal lives inside the <dt> rather than
          // as a third sibling.
          <div key={title} className="border-t border-ink/10 pt-4">
            <dt>
              <span
                aria-hidden="true"
                className="block font-mono-tech text-[10px] tracking-[0.25em] text-primary-ink"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 block font-serif-display text-lg text-white">
                {title}
              </span>
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink/60">
              {body}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
