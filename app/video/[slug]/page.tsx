import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AmbientBackdrop, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getVideoBySlug, readVideos } from "@/lib/video-store";

export const dynamic = "force-dynamic";

export default async function VideoDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);

  if (!video) {
    notFound();
  }

  const relatedVideos = (await readVideos())
    .filter((entry) => entry.slug !== video.slug)
    .slice(0, 3);

  return (
    <>
      <AmbientBackdrop />
      <SiteHeader active="gallery" />
      <main className="page-shell">
        <section className="shell detail-shell">
          <Link href="/" className="back-link">
            ← 返回作品集
          </Link>

          <div className="detail-layout">
            <section className="detail-main">
              <div className="player-shell">
                {video.videoSrc ? (
                  <video
                    className="player-shell__video"
                    src={video.videoSrc}
                    controls
                    playsInline
                    poster={video.poster}
                  />
                ) : (
                  <Image
                    fill
                    sizes="(max-width: 1180px) 100vw, 70vw"
                    className="player-shell__video"
                    src={video.poster}
                    alt={video.title}
                    style={{ objectPosition: video.posterPosition || "center center" }}
                  />
                )}
              </div>

              <div className="detail-copy">
                <div>
                  <h1>{video.title}</h1>
                  <div className="detail-tags">
                    {video.tags.map((tag) => (
                      <span key={tag} className="tag-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p>{video.description}</p>
                </div>

                <aside className="creator-card">
                  <span className="eyebrow">出品方</span>
                  <div className="creator-card__person">
                    <div className="creator-card__avatar">{video.creator.name.slice(0, 1)}</div>
                    <div>
                      <strong>{video.creator.name}</strong>
                      <p>{video.creator.role}</p>
                    </div>
                  </div>
                  <button type="button" className="button-secondary button-secondary--full">
                    关注创作者
                  </button>
                </aside>
              </div>
            </section>

            <aside className="up-next">
              <h2>接下来观看</h2>
              <div className="up-next__list">
                {relatedVideos.map((entry) => (
                  <Link key={entry.id} href={`/video/${entry.slug}`} className="up-next__item">
                    <div className="up-next__thumb">
                      <Image
                        fill
                        sizes="(max-width: 1180px) 100vw, 300px"
                        src={entry.poster}
                        alt={entry.title}
                        style={{ objectPosition: entry.posterPosition || "center center" }}
                      />
                    </div>
                    <div>
                      <strong>{entry.shortTitle}</strong>
                      <span>
                        {entry.category} · {entry.duration}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
