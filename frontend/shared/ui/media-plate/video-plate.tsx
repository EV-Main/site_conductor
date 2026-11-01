"use client";

import { useEffect, useRef, useState } from "react";

import { PlateStage } from "./plate-stage";
import { PlayControl } from "./play-control";
import type { MediaPlateSize, VideoCover } from "./types";

/**
 * Client island for a self-hosted mp4. There is **no `<video>` element in the
 * DOM until the control is pressed** — until then this is a poster and a button,
 * so the page never opens a media connection for a plate nobody plays.
 */
export function VideoStage({
  cover,
  size,
}: {
  cover: VideoCover;
  size: MediaPlateSize;
}) {
  const [playing, setPlaying] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  // The control unmounts when it is pressed, so without this a keyboard user is
  // dropped onto <body> and has to tab from the top of the page to reach the
  // player they just started.
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (playing) videoRef.current?.focus();
  }, [playing]);

  if (playing) {
    return (
      <video
        ref={videoRef}
        tabIndex={-1}
        src={cover.src}
        poster={posterFailed ? undefined : cover.poster}
        autoPlay
        controls
        playsInline
        aria-label={cover.alt}
        className="absolute inset-0 size-full bg-background object-contain"
      />
    );
  }

  return (
    <>
      <PlateStage
        src={posterFailed ? undefined : cover.poster}
        alt={cover.alt}
        size={size}
        onError={() => setPosterFailed(true)}
      />
      <PlayControl
        label={`Play the video: ${cover.alt}`}
        size={size}
        onClick={() => setPlaying(true)}
      />
    </>
  );
}
