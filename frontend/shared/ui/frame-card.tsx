import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

/**
 * Grid-cell shell — a 3:4 framed visual on top, name/label below. The frame
 * contents (photo, icon) vary per card; the shell is constant, so member cards
 * and the placeholder "open role" cells line up pixel-for-pixel in a grid.
 */
export function FrameCard({
  children,
  heading,
  headingClassName,
  sub,
}: {
  children: ReactNode;
  heading: string;
  headingClassName: string;
  sub: ReactNode;
}) {
  return (
    <div className="group space-y-4">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-ink/10 bg-card">
        {children}
      </div>
      <div>
        <h4
          className={cn(
            "font-serif-display text-2xl sm:text-base font-bold",
            headingClassName
          )}
        >
          {heading}
        </h4>
        {sub}
      </div>
    </div>
  );
}
