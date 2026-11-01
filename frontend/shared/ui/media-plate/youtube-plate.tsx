"use client";

import { useEffect, useRef, useState } from "react";

import { PlateStage } from "./plate-stage";
import { PlayControl } from "./play-control";
import type { MediaPlateSize, YouTubeCover } from "./types";

/**
 * Posters to try, in order. `maxresdefault` only exists when the upload was at
 * least 1280x720 and 404s otherwise, so it needs `hqdefault` — which YouTube
 * generates for every video — behind it. An article that ships its own poster
 * uses that and nothing else.
 *
 * Kept module-private: a plain function exported from a `"use client"` module is
 * a client reference on the server, so it must not cross the slice's public API.
 */
function posterCandidates(cover: YouTubeCover): string[] {
  if (cover.poster) return [cover.poster];
  return ["maxresdefault", "hqdefault"].map(
    name => `https://i.ytimg.com/vi/${cover.videoId}/${name}.jpg`
  );
}

/**
 * Click-to-load facade. Until the control is pressed the DOM holds a poster and
 * a button and nothing else — no YouTube script, no iframe, no cookie. On press
 * we mount the `youtube-nocookie.com` player (privacy-preserving host).
 */
export function YouTubeStage({
  cover,
  size,
}: {
  cover: YouTubeCover;
  size: MediaPlateSize;
}) {
  const [playing, setPlaying] = useState(false);
  // Past the last candidate `poster` is undefined, which renders the fallback
  // field — and, importantly, stops firing onError. Advancing an index rather
  // than flipping a boolean is what keeps a failing src from re-erroring forever.
  const [attempt, setAttempt] = useState(0);
  const poster = posterCandidates(cover)[attempt];
  // The control unmounts when it is pressed, so without this a keyboard user is
  // dropped onto <body> and has to tab from the top of the page to reach the
  // player they just started.
  const frameRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (playing) frameRef.current?.focus();
  }, [playing]);

  if (playing) {
    return (
      <iframe
        ref={frameRef}
        src={`https://www.youtube-nocookie.com/embed/${cover.videoId}?autoplay=1&rel=0&modestbranding=1`}
        title={cover.alt}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 size-full"
      />
    );
  }

  return (
    <>
      <PlateStage
        src={poster}
        alt={cover.alt}
        size={size}
        onError={() => setAttempt(current => current + 1)}
      />
      <PlayControl
        label={`Play the video: ${cover.alt}`}
        size={size}
        onClick={() => setPlaying(true)}
      />
    </>
  );
}
