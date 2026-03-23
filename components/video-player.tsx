"use client";

import { useCallback, useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ratio, setRatio] = useState<string>("16 / 9");

  const handleMetadata = useCallback(() => {
    const el = videoRef.current;
    if (!el || !el.videoWidth || !el.videoHeight) return;
    setRatio(`${el.videoWidth} / ${el.videoHeight}`);
  }, []);

  return (
    <video
      ref={videoRef}
      className="player-shell__video"
      src={src}
      controls
      playsInline
      poster={poster}
      style={{ aspectRatio: ratio }}
      onLoadedMetadata={handleMetadata}
    />
  );
}
