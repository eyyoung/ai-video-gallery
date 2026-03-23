"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { VideoEntry } from "@/lib/types";
import { AmbientBackdrop, SiteFooter, SiteHeader } from "@/components/site-chrome";

function useVideoHover() {
  const ref = useRef<HTMLAnchorElement>(null);
  return {
    ref,
    onMouseEnter() {
      ref.current?.querySelector("video")?.play().catch(() => {});
    },
    onMouseLeave() {
      const v = ref.current?.querySelector("video");
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
    }
  };
}

function useScrollReveal(threshold = 0.25) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

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

function FeatureCard({ video, index }: { video: VideoEntry; index: number }) {
  const { ref, onMouseEnter, onMouseLeave } = useVideoHover();
  return (
    <Link
      ref={ref}
      href={`/video/${video.slug}`}
      className="card card--feature"
      style={{ "--stagger": index } as CSSProperties}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
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

function StandardCard({ video, index }: { video: VideoEntry; index: number }) {
  const { ref, onMouseEnter, onMouseLeave } = useVideoHover();
  return (
    <Link
      ref={ref}
      href={`/video/${video.slug}`}
      className="card card--standard"
      style={{ "--stagger": index } as CSSProperties}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
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

function CompactCard({ video, index }: { video: VideoEntry; index: number }) {
  const { ref, onMouseEnter, onMouseLeave } = useVideoHover();
  return (
    <Link
      ref={ref}
      href={`/video/${video.slug}`}
      className="card card--compact"
      style={{ "--stagger": index } as CSSProperties}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
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
  const filteredVideos =
    activeFilter === "全部作品"
      ? videos
      : videos.filter(
          (video) => video.category === activeFilter || video.tags.includes(activeFilter)
        );
  const [feature, ...rest] = filteredVideos;
  const stats = [
    { value: `${videos.length}`, label: "精选影片" },
    { value: "4", label: "展示形态" },
    { value: "24/7", label: "发布通道" }
  ];

  const { ref: statsRef, visible: statsVisible } = useScrollReveal(0.3);

  return (
    <>
      <AmbientBackdrop />
      <SiteHeader active="gallery" />
      <main className="page-shell">
        <section className="shell hero">
          <div className="hero__copy">
            <h1>
              AIGC <span>商业影像</span>
            </h1>
            <p>
              以精品化创作方法打磨品牌视觉、产品叙事与概念短片，为高要求项目提供更具辨识度的影像表达。
            </p>
          </div>
        </section>

        <section className="shell filter-bar" aria-label="作品筛选">
          {filters.map((filter, i) => (
            <button
              key={filter}
              type="button"
              className={filter === activeFilter ? "filter-pill is-active" : "filter-pill"}
              style={{ "--stagger": i } as CSSProperties}
              onClick={() => startTransition(() => setActiveFilter(filter))}
            >
              {filter}
            </button>
          ))}
        </section>

        <section className="shell gallery-grid" key={activeFilter}>
          {feature ? <FeatureCard video={feature} index={0} /> : null}
          {rest.slice(0, 2).map((video, i) => (
            <StandardCard key={video.id} video={video} index={i + 1} />
          ))}
          {rest.slice(2).map((video, i) => (
            <CompactCard key={video.id} video={video} index={i + 3} />
          ))}
        </section>

        <section
          className={`stats-band${statsVisible ? " is-revealed" : ""}`}
          ref={statsRef as React.RefObject<HTMLElement>}
        >
          <div className="shell stats-band__grid">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="stats-band__item"
                style={{ "--stagger": i } as CSSProperties}
              >
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
