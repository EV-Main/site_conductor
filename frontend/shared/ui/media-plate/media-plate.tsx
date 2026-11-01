import type { ReactNode } from "react";
import { Image as ImageIcon, Video, Youtube } from "lucide-react";

import { PlateFrame } from "./plate-frame";
import { ImageStage } from "./image-stage";
import { VideoStage } from "./video-plate";
import { YouTubeStage } from "./youtube-plate";
import type { MediaPlateCover, MediaPlateProps } from "./types";

/**
 * The badge states what the plate IS — never what it is missing.
 *
 * The icon duplicates the word beside it, so it is decorative; the badge stays
 * readable as text alone.
 */
function derivedBadge(cover: MediaPlateCover): ReactNode {
  switch (cover.type) {
    case "image":
      return (
        <>
          <ImageIcon aria-hidden className="size-3" />
          {cover.frames ? `PHOTO · ${cover.frames} FRAMES` : "PHOTO"}
        </>
      );
    case "video":
      return (
        <>
          <Video aria-hidden className="size-3" />
          {cover.duration ? `VIDEO · ${cover.duration}` : "VIDEO"}
        </>
      );
    case "youtube":
      return (
        <>
          <Youtube aria-hidden className="size-3" />
          {cover.duration ? `YOUTUBE · ${cover.duration}` : "YOUTUBE"}
        </>
      );
  }
}

/**
 * An institutional document plate, not a marketing hero: a bordered frame, a
 * 16:9 stage under a fixed tint/scrim treatment, and a caption rail that records
 * plate number, caption and provenance. Every variant shares that anatomy, so a
 * photo essay and a site video sit in the same column without re-reading as two
 * different components.
 *
 * Server dispatch: the frame, badge and caption rail never enter the client
 * bundle — each variant hands only its stage to a small island, which exists so
 * a poster that fails to load collapses to the fallback field instead of leaving
 * an empty box. (On /publications the whole tree is client-rendered anyway,
 * because search filters the grid; on the article page and the homepage band the
 * split is real.)
 */
export function MediaPlate({
  cover,
  caption,
  provenance = "SHOT ON SITE",
  plateLabel,
  badge,
  size = "inline",
  className,
}: MediaPlateProps) {
  const chrome = {
    badge: badge ?? derivedBadge(cover),
    caption,
    provenance,
    plateLabel,
    size,
    className,
  };

  return (
    <PlateFrame {...chrome}>
      {cover.type === "video" ? (
        <VideoStage cover={cover} size={size} />
      ) : cover.type === "youtube" ? (
        <YouTubeStage cover={cover} size={size} />
      ) : (
        <ImageStage cover={cover} size={size} />
      )}
    </PlateFrame>
  );
}
