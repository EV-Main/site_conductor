import Image from "next/image";

import { FallbackField } from "./fallback-field";
import type { MediaPlateSize } from "./types";

/** The plate never exceeds its size cap, so the largest useful source is that cap. */
const STAGE_SIZES: Record<MediaPlateSize, string> = {
  inline: "(min-width: 768px) 768px, 100vw",
  wide: "(min-width: 1024px) 1024px, 100vw",
};

export interface PlateStageProps {
  src?: string;
  alt: string;
  size: MediaPlateSize;
  /**
   * Only passed by the client islands (video/youtube), which can react to a
   * decode failure at runtime; the pure-server `image` variant just omits `src`.
   * Supplying it does NOT make this a client module — it compiles into whichever
   * graph imports it.
   */
  onError?: () => void;
}

/**
 * Poster + the treatment that ties photography into the dark palette: a navy
 * tint, a top scrim so the badge stays legible over bright frames, and a bottom
 * scrim so the play control does. The poster itself is always at full strength —
 * there is deliberately no dimmed resting state, and it never scales on hover.
 */
export function PlateStage({ src, alt, size, onError }: PlateStageProps) {
  if (!src) return <FallbackField />;
  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={STAGE_SIZES[size]}
        onError={onError}
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-background/30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34%] bg-gradient-to-b from-background/60 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-background/80 to-transparent" />
    </>
  );
}
