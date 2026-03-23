"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useState } from "react";
import type { CSSProperties } from "react";
import type { VideoEntry } from "@/lib/types";
import { AmbientBackdrop, SiteFooter, SiteHeader } from "@/components/site-chrome";

function VideoSurface({ video }: { video: VideoEntry }) {
  const style = {
    "--card-accent": video.accent,
    "--poster-position": video.posterPosition || "center center"
  } as CSSProperties;

  if (video.videoSrc) {
    return (
      <div className="media-shell" style={style}>
        <video
          className="media-shell__asset"
          src={video.videoSrc}
          poster={video.poster}
          muted
          playsInline
          preload="metadata"
        />
      </div>
    );
  }

  return (
    <div className="media-shell" style={style}>
      <Image
        fill
        sizes="(max-width: 720px) 100vw, (max-width: 1180px) 50vw, 33vw"
        className="media-shell__asset"
        src={video.poster}
        alt={video.title}
        style={{ objectPosition: video.posterPosition || "center center" }}
      />
    </div>
  );
}

function FeatureCard({ video }: { video: VideoEntry }) {
  return (
    <Link href={`/video/${video.slug}`} className="card card--feature">
      <VideoSurface video={video} />
      <div className="card__overlay" />
      <div className="card__meta">
        <div>
          <span className="eyebrow">{video.tags.slice(0, 2).join(" / ")}</span>
          <h2>{video.title}</h2>
          <p>{video.description}</p>
        </div>
        <div className="play-badge">▶</div>
      </div>
    </Link>
  );
}

function StandardCard({ video }: { video: VideoEntry }) {
  return (
    <Link href={`/video/${video.slug}`} className="card card--standard">
      <VideoSurface video={video} />
      <div className="card__body">
        <div className="card__row">
          <span className="tag-chip">{video.category}</span>
          <span className="micro-copy">{video.duration}</span>
        </div>
        <h3>{video.shortTitle}</h3>
        <p>{video.summary}</p>
      </div>
      <div className="card__underline" />
    </Link>
  );
}

function CompactCard({ video }: { video: VideoEntry }) {
  return (
    <Link href={`/video/${video.slug}`} className="card card--compact">
      <VideoSurface video={video} />
      <div className="card__compact-copy">
        <h4>{video.shortTitle}</h4>
        <span>{video.category}</span>
      </div>
    </Link>
  );
}

export function GalleryHome({ videos }: { videos: VideoEntry[] }) {
  const names = new Set<string>(["全部作品"]);

  videos.forEach((video) => {
    names.add(video.category);
    video.tags.forEach((tag) => names.add(tag));
  });

  const filters = Array.from(names).slice(0, 6);

  const [activeFilter, setActiveFilter] = useState("全部作品");
  const [visibleCount, setVisibleCount] = useState(6);
  const filteredVideos =
    activeFilter === "全部作品"
      ? videos
      : videos.filter(
          (video) => video.category === activeFilter || video.tags.includes(activeFilter)
        );
  const visibleVideos = filteredVideos.slice(0, visibleCount);
  const [feature, ...rest] = visibleVideos;
  const stats = [
    { value: `${videos.length}`, label: "精选影片" },
    { value: "4", label: "展示形态" },
    { value: "24/7", label: "发布通道" }
  ];

  return (
    <>
      <AmbientBackdrop />
      <SiteHeader active="gallery" />
      <main className="page-shell">
        <section className="shell hero">
          <div className="hero__copy">
            <h1>
              影像 <span>作品集</span>
            </h1>
            <p>
              精选高保真视觉叙事作品，现已接入创作者工作流，支持将本地视频直接发布至画廊。
            </p>
          </div>
        </section>

        <section className="shell filter-bar" aria-label="作品筛选">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={filter === activeFilter ? "filter-pill is-active" : "filter-pill"}
              onClick={() =>
                startTransition(() => {
                  setActiveFilter(filter);
                  setVisibleCount(6);
                })
              }
            >
              {filter}
            </button>
          ))}
        </section>

        <section className="shell gallery-grid">
          {feature ? <FeatureCard video={feature} /> : null}
          {rest.slice(0, 2).map((video) => (
            <StandardCard key={video.id} video={video} />
          ))}
          {rest.slice(2).map((video) => (
            <CompactCard key={video.id} video={video} />
          ))}
        </section>

        {visibleCount < filteredVideos.length ? (
          <section className="shell load-more">
            <button
              type="button"
              className="load-more__button"
              onClick={() => startTransition(() => setVisibleCount((count) => count + 3))}
            >
              <span>加载更多</span>
              <span>↓</span>
            </button>
          </section>
        ) : null}

        <section className="stats-band">
          <div className="shell stats-band__grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stats-band__item">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
