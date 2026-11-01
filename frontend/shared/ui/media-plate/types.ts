import type { ReactNode } from "react";

/**
 * Structural mirror of the publication entity's `Cover` union, declared here on
 * purpose: `shared/` must not import from `entities/` (FSD direction), so the
 * caller in `views/` maps entity → these props. Keep the shapes assignable.
 */

/** `inline` caps the plate at 768px, `wide` at 1024px. */
export type MediaPlateSize = "inline" | "wide";

/** A still frame — no player, pure Server Component. */
export interface ImageCover {
  type: "image";
  /** Absent (or a broken URL) renders the fallback field, not a collapsed box. */
  src?: string;
  alt: string;
  /** Badge detail: `PHOTO · 14 FRAMES`. */
  frames?: number;
}

/** Self-hosted mp4 — the `<video>` element only enters the DOM once played. */
export interface VideoCover {
  type: "video";
  src: string;
  poster?: string;
  alt: string;
  /** Badge detail, already formatted: `08:12`. */
  duration?: string;
}

/** Click-to-load YouTube facade — no script, no iframe, no cookie until played. */
export interface YouTubeCover {
  type: "youtube";
  videoId: string;
  /** Falls back to `i.ytimg.com/vi/{videoId}/maxresdefault.jpg`. */
  poster?: string;
  alt: string;
  duration?: string;
}

export type MediaPlateCover = ImageCover | VideoCover | YouTubeCover;

export interface MediaPlateProps {
  cover: MediaPlateCover;
  /** Right half of the caption rail line: `PLATE 01 · {caption}`. */
  caption?: string;
  /** Right-aligned rail slug. Defaults to `SHOT ON SITE`. */
  provenance?: string;
  /** Left rail prefix, e.g. `PLATE 01`. */
  plateLabel?: string;
  /**
   * Overrides the derived badge (`VIDEO · 08:12`, `PHOTO · 14 FRAMES`, …).
   * A node, not a string, so an override can carry its own leading icon the way
   * the derived badge does.
   */
  badge?: ReactNode;
  size?: MediaPlateSize;
  className?: string;
}
