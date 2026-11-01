import { Users, Globe } from "lucide-react";

import type { Translate } from "@evinvest/i18n";

// The same offer in two places — the /team "Get involved" section and the two
// CTA cells that fill out the homepage Team grid. One copy here rather than the
// sentence written twice, since the sentence is long enough that two copies
// would be edited apart. Each surface adds its own chrome around these fields.
export const joinCards = (t: Translate, localise: (href: string) => string) => [
  {
    id: "hiring" as const,
    icon: Users,
    href: localise("/hiring"),
    eyebrow: t("team.join.hiring.eyebrow", "Open position"),
    title: t("team.join.hiring.title", "Join Us"),
    body: t(
      "team.join.hiring.body",
      "We are always looking for talented analysts and asset managers in Quy Nhon and Da Nang."
    ),
    cta: t("team.join.hiring.cta", "Hiring"),
  },
  {
    id: "ir" as const,
    icon: Globe,
    href: localise("/contact"),
    eyebrow: t("team.join.ir.eyebrow", "Investor relations"),
    title: t("team.join.ir.title", "LP Partner Network"),
    body: t(
      "team.join.ir.body",
      "Talk to us about co-investing in Vietnam's coastal real estate."
    ),
    cta: t("team.join.ir.cta", "IR Contacts"),
  },
];
