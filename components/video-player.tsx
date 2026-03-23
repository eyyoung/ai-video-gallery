"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ratio, setRatio] = useState<string>("16 / 9");
  const [resolvedSrc, setResolvedSrc] = useState<string>();
  const [downloadProgress, setDownloadProgress] = useState<number | null>(0);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const handleMetadata = useCallback(() => {
    const el = videoRef.current;
    if (!el || !el.videoWidth || !el.videoHeight) return;
    setRatio(`${el.videoWidth} / ${el.videoHeight}`);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let objectUrl: string | null = null;

    setResolvedSrc(undefined);
    setDownloadProgress(0);
    setDownloadComplete(false);
    setDownloadError(null);
    setReady(false);

    async function downloadVideo() {
      try {
        const response = await fetch(src, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Download failed: ${response.status}`);
        }

        if (!response.body) {
          const blob = await response.blob();

          if (!active) return;

          objectUrl = URL.createObjectURL(blob);
          setResolvedSrc(objectUrl);
          setDownloadProgress(100);
          setDownloadComplete(true);
          return;
        }

        const reader = response.body.getReader();
        const totalBytes = Number(response.headers.get("content-length")) || 0;
        const chunks: BlobPart[] = [];
        let receivedBytes = 0;

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;
          if (!value) continue;

          const chunk = new Uint8Array(value.byteLength);
          chunk.set(value);
          chunks.push(chunk);
          receivedBytes += value.byteLength;

          if (totalBytes > 0) {
            setDownloadProgress(Math.min(100, Math.round((receivedBytes / totalBytes) * 100)));
          } else {
            setDownloadProgress(null);
          }
        }

        const blob = new Blob(chunks, {
          type: response.headers.get("content-type") || "video/mp4"
        });

        if (!active) return;

        objectUrl = URL.createObjectURL(blob);
        setResolvedSrc(objectUrl);
        setDownloadProgress(100);
        setDownloadComplete(true);
      } catch (error) {
        if (!active || controller.signal.aborted) return;

        console.error("Failed to fully download video before playback.", error);
        setDownloadProgress(null);
        setDownloadError("视频下载失败，请刷新后重试。");
      }
    }

    void downloadVideo();

    return () => {
      active = false;
      controller.abort();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  const handleCanPlay = useCallback(() => {
    if (downloadComplete) {
      setReady(true);
    }
  }, [downloadComplete]);

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
        src={resolvedSrc}
        controls={ready}
        playsInline
        preload="metadata"
        poster={poster}
        style={{ aspectRatio: ratio }}
        onLoadedMetadata={handleMetadata}
        onCanPlay={handleCanPlay}
        onPlay={handlePlay}
      />
      {!ready && (
        <div className="video-loading-overlay">
          <div className="video-loading-spinner" />
          <p className="video-loading-text">
            {downloadError ||
              (downloadComplete
                ? "下载完成，正在准备播放…"
                : downloadProgress === null
                  ? "正在下载完整视频…"
                  : `正在下载完整视频… ${downloadProgress}%`)}
          </p>
        </div>
      )}
    </div>
  );
}
