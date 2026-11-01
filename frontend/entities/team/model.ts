import { ASSETS } from "@/shared/config/assets";

import type { Translate } from "@evinvest/i18n";

// Role and bio arrive resolved rather than as keys: this row is rendered by the
// homepage Team section, the /team grid and the Person JSON-LD, and each of
// those used to build its own translator to look the same two keys up. Names
// are NOT translated.
export type TeamMember = {
  photo: string;
  name: string;
  role: string;
  bio: string;
};

export const team = (t: Translate): TeamMember[] => [
  {
    photo: ASSETS.team_member_1,
    name: "Elisey Zhikharev",
    role: t("team.member.ez.role", "Managing Partner, Co-founder"),
    //TODO: real bio
    bio: t(
      "team.member.ez.bio",
      "Leads investment strategy and capital partnerships, focused on Vietnam's coastal growth corridors in Quy Nhon and Da Nang."
    ),
  },
  {
    photo: ASSETS.team_member_2,
    name: "Valeriy Sakharov",
    role: t("team.member.vs.role", "Director of Research & Risk, CTO"),
    bio: t(
      "team.member.vs.bio",
      "Specializes in algorithmically-driven risk assessment and financial modelling. Previously at QuantM Alpha."
    ),
  },
];
