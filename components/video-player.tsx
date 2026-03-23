"use client";

import { useCallback, useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ratio, setRatio] = useState<string>("16 / 9");
  const [ready, setReady] = useState(false);

  const handleMetadata = useCallback(() => {
    const el = videoRef.current;
    if (!el || !el.videoWidth || !el.videoHeight) return;
    setRatio(`${el.videoWidth} / ${el.videoHeight}`);
  }, []);

  const handleCanPlay = useCallback(() => {
    setReady(true);
  }, []);

  const handlePlay = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      if (!ready) {
        e.currentTarget.pause();
      }
    },
    [ready]
  );

  return (
    <div className="video-player-wrapper" style={{ aspectRatio: ratio }}>
      <video
        ref={videoRef}
        className="player-shell__video"
        src={src}
        controls={ready}
        playsInline
        preload="auto"
        poster={poster}
        style={{ aspectRatio: ratio }}
        onLoadedMetadata={handleMetadata}
        onCanPlay={handleCanPlay}
        onPlay={handlePlay}
      />
      {!ready && (
        <div className="video-loading-overlay">
          <div className="video-loading-spinner" />
        </div>
      )}
    </div>
  );
}
