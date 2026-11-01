import { Play } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import type { MediaPlateSize } from "./types";

export interface PlayControlProps {
  /** Accessible name — `Play the video: {alt}`. */
  label: string;
  size: MediaPlateSize;
  onClick: () => void;
}

/**
 * The only element that changes on hover: it fills solid teal and the glyph
 * inverts to black. The circle is the single deliberate exception to the
 * square-corner rule. Rendered from the client islands only.
 */
export function PlayControl({ label, size, onClick }: PlayControlProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute bottom-5 left-5 z-20 flex items-center justify-center rounded-full",
        "border border-primary-ink/60 bg-background/55 text-primary-ink",
        "motion-safe:transition-colors motion-safe:duration-300",
        "hover:bg-primary hover:text-on-primary",
        "group-hover:bg-primary group-hover:text-on-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        size === "wide" ? "size-[72px]" : "size-16"
      )}
    >
      <Play
        className={cn(
          "translate-x-px fill-current",
          size === "wide" ? "size-6" : "size-5"
        )}
        strokeWidth={0}
      />
    </button>
  );
}
