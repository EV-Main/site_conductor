import type { Locale } from "@evinvest/i18n";

import type { VacancyDetail } from "@/entities/vacancy";
import { PageGraph } from "@/shared/seo/page-graph";
import { jobPostingNode } from "./job-posting";

export function VacancyStructuredData({
  vacancy,
  locale,
}: {
  vacancy: VacancyDetail;
  locale: Locale;
}) {
  const path = `/hiring/${vacancy.slug}`;

  // PageGraph supplies the Organization node that `hiringOrganization` resolves
  // against — a JobPosting whose employer reference dangles fails validation.
  return (
    <PageGraph
      path={path}
      name={vacancy.title}
      description={vacancy.summary}
      trail={[
        { name: "Hiring", path: "/hiring" },
        { name: vacancy.title, path },
      ]}
      nodes={[jobPostingNode(vacancy, locale)]}
    />
  );
}
