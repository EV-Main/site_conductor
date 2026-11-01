import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import type { MediaPlateSize } from "./types";

const MAX_WIDTH: Record<MediaPlateSize, string> = {
  inline: "max-w-3xl", // 768px
  wide: "max-w-5xl", // 1024px
};

export interface PlateFrameProps {
  badge: ReactNode;
  caption?: string;
  provenance: string;
  plateLabel?: string;
  size: MediaPlateSize;
  className?: string;
  /** Poster + scrims + (for playable covers) the control — fills the 16:9 stage. */
  children: ReactNode;
}

/**
 * The chrome every variant shares: the bordered plate, the badge chip inset over
 * the stage, and the caption rail beneath it. Stays a Server Component even when
 * the stage it wraps is a client island — the island is passed in as `children`.
 *
 * Note for callers: the frame owns its `max-w-*`, so don't pass one in
 * `className` (`cn` throws on a dev-time conflict).
 */
export function PlateFrame({
  badge,
  caption,
  provenance,
  plateLabel,
  size,
  className,
  children,
}: PlateFrameProps) {
  const rail = [plateLabel, caption].filter(Boolean).join(" · ");
  return (
    <figure
      className={cn(
        "group w-full rounded-none border border-ink/10 bg-card",
        "motion-safe:transition-colors motion-safe:duration-300",
        "hover:border-primary-ink/45",
        MAX_WIDTH[size],
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        {children}
        <span className="pointer-events-none absolute left-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-none border border-primary-ink/40 bg-background/60 px-2.5 py-1 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-primary-ink">
          {badge}
        </span>
      </div>
      <figcaption className="flex items-center justify-between gap-4 border-t border-ink/10 bg-background/50 px-5 py-2.5 font-mono-tech text-[10px] uppercase tracking-[0.18em] text-ink/45">
        <span className="truncate">{rail}</span>
        <span className="shrink-0">{provenance}</span>
      </figcaption>
    </figure>
  );
}
