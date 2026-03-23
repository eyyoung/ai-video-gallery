import { randomUUID } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { CreateVideoInput, VideoEntry } from "@/lib/types";
import { generateThumbnail } from "@/lib/thumbnail";

const contentDirectory = path.join(process.cwd(), "content");
const contentFile = path.join(contentDirectory, "videos.json");
const uploadDirectory = path.join(process.cwd(), "public", "uploads");

const EMPTY_STORE = JSON.stringify({ videos: [] }, null, 2);

const posterByCategory: Record<string, { poster: string; accent: string; position?: string }> = {
  品牌形象: { poster: "/stitch/home.png", accent: "#b6a0ff", position: "center center" },
  产品展示: { poster: "/stitch/detail.png", accent: "#00e3fd", position: "center top" },
  汽车出行: { poster: "/stitch/admin.png", accent: "#ff6c95", position: "left center" },
  美妆护肤: { poster: "/stitch/login.png", accent: "#ffb86c", position: "center top" },
  食品饮料: { poster: "/stitch/detail.png", accent: "#7bd88f", position: "center top" },
  科技数码: { poster: "/stitch/admin.png", accent: "#00e3fd", position: "right center" },
  服饰时尚: { poster: "/stitch/home.png", accent: "#ff6c95", position: "left top" },
  地产家居: { poster: "/stitch/detail.png", accent: "#b6a0ff", position: "center center" },
};

async function ensureStorage() {
  await mkdir(contentDirectory, { recursive: true });
  await mkdir(uploadDirectory, { recursive: true });

  try {
    await access(contentFile);
  } catch {
    await writeFile(contentFile, EMPTY_STORE);
  }
}

function sortVideos(videos: VideoEntry[]) {
  return [...videos].sort((left, right) => {
    if (left.featured && !right.featured) {
      return -1;
    }

    if (!left.featured && right.featured) {
      return 1;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export async function readVideos() {
  await ensureStorage();
  const file = await readFile(contentFile, "utf8");
  const payload = JSON.parse(file) as { videos: VideoEntry[] };
  return sortVideos(payload.videos);
}

export async function getVideoBySlug(slug: string) {
  const videos = await readVideos();
  return videos.find((video) => video.slug === slug);
}

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return base || `video-${Date.now()}`;
}

function makeUniqueSlug(baseSlug: string, videos: VideoEntry[]) {
  let candidate = baseSlug || `video-${Date.now()}`;
  let suffix = 2;

  while (videos.some((video) => video.slug === candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function createVideoEntry(input: CreateVideoInput) {
  const videos = await readVideos();
  const seed = posterByCategory[input.category] || posterByCategory["品牌形象"];
  const baseSlug = slugify(input.title);
  const slug = makeUniqueSlug(baseSlug, videos);

  const entry: VideoEntry = {
    id: randomUUID(),
    slug,
    title: input.title,
    shortTitle: input.title,
    description:
      input.description?.trim() ||
      "刚刚上传的画廊作品，等待审核与发布。",
    summary:
      input.description?.trim() ||
      "从创作者工作台新部署的作品。",
    category: input.category,
    tags: Array.from(new Set([input.category, ...(input.tags || [])])).slice(0, 4),
    duration: "新上传",
    year: new Date().getFullYear().toString(),
    accent: seed.accent,
    poster: input.poster || seed.poster,
    posterPosition: input.poster ? "center center" : seed.position,
    featured: false,
    videoSrc: input.videoSrc,
    createdAt: new Date().toISOString(),
    creator: {
      name: "光言科技",
      role: "AIGC 创意制作"
    },
    stats: [
      { label: "制作方", value: "光言科技" },
      { label: "类型", value: "AIGC 广告" },
      { label: "状态", value: "已发布" }
    ]
  };

  await writeFile(contentFile, JSON.stringify({ videos: [entry, ...videos] }, null, 2));

  return entry;
}

/**
 * Regenerate thumbnails for all videos that have a videoSrc but are still using
 * a placeholder poster (i.e. a /stitch/* path).
 */
export async function regenerateThumbnails(): Promise<number> {
  const videos = await readVideos();
  let updated = 0;

  for (const video of videos) {
    if (!video.videoSrc) continue;

    const needsThumb =
      !video.poster ||
      video.poster.startsWith("/stitch/");

    if (!needsThumb) continue;

    try {
      const poster = await generateThumbnail(video.videoSrc);
      video.poster = poster;
      video.posterPosition = "center center";
      updated++;
    } catch {
      // skip videos whose source file is missing or corrupt
    }
  }

  if (updated > 0) {
    await writeFile(contentFile, JSON.stringify({ videos }, null, 2));
  }

  return updated;
}
