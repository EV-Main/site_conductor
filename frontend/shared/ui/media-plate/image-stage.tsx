"use client";

import { useState } from "react";

import { PlateStage } from "./plate-stage";
import type { ImageCover, MediaPlateSize } from "./types";

/**
 * A still cover. The one reason this is a client island rather than a pure
 * server render: a poster that 404s has to collapse to the fallback field, and
 * only the browser knows that it did. Without it the plate rendered an empty
 * 16:9 box with a badge floating over nothing — the exact "broken card" the
 * whole design goes out of its way to avoid.
 *
 * Nothing else here is interactive; there is no state until the image fails.
 */
export function ImageStage({
  cover,
  size,
}: {
  cover: ImageCover;
  size: MediaPlateSize;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <PlateStage
      src={failed ? undefined : cover.src}
      alt={cover.alt}
      size={size}
      onError={() => setFailed(true)}
    />
  );
}
