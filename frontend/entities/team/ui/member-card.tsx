import Image from "next/image";
import { Text, Tier } from "@/shared/ui/text";
import { FrameCard } from "@/shared/ui/frame-card";
import type { TeamMember } from "../model";

/**
 * Canonical team-member portrait cell — a 3:4 photo with name + role beneath.
 * Single source of truth for both the homepage Team section and the /team page
 * (grid on desktop, swipe carousel on mobile), so the two never drift. The bio
 * reveals on hover; touch shows just name + role, matching the design.
 */
export function MemberCard({
  member,
  shade = "shadow",
}: {
  member: TeamMember;
  shade?: "gradient" | "shadow";
}) {
  return (
    <FrameCard
      heading={member.name}
      headingClassName="text-white"
      sub={
        <p className="mt-1 font-mono-tech text-base sm:text-xs text-primary-ink">
          {member.role}
        </p>
      }
    >
      <Image
        src={member.photo}
        alt={member.name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {shade === "gradient" ? (
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background/85 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Tier tier="alt">
            <Text>{member.bio}</Text>
          </Tier>
        </div>
      ) : (
        <div className="absolute inset-0 z-10 flex transform-gpu items-end p-6 opacity-0 transition-opacity duration-300 [text-shadow:0_0_12px_#000,0_0_12px_#000,0_0_24px_#000,0_0_24px_#000,0_0_24px_#000,0_0_48px_#000,0_0_48px_#000,0_0_84px_rgb(0_0_0/0.8)] group-hover:opacity-100">
          <Tier tier="main">
            <Text>{member.bio}</Text>
          </Tier>
        </div>
      )}
    </FrameCard>
  );
}
