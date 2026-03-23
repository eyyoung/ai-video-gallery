import path from "node:path";
import { writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { generateThumbnail } from "@/lib/thumbnail";
import { createVideoEntry } from "@/lib/video-store";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

function safeFileStem(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "Cinematic").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请上传一个视频文件。" }, { status: 400 });
  }

  if (!file.type.startsWith("video/")) {
    return NextResponse.json({ error: "仅支持视频文件上传。" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "视频文件超过 500MB 上传限制。" }, { status: 400 });
  }

  const extension = path.extname(file.name) || ".mp4";
  const stem = safeFileStem(title || file.name.replace(/\.[^.]+$/, "")) || "upload";
  const fileName = `${Date.now()}-${stem}${extension.toLowerCase()}`;
  const outputPath = path.join(process.cwd(), "public", "uploads", fileName);
  const arrayBuffer = await file.arrayBuffer();

  await writeFile(outputPath, Buffer.from(arrayBuffer));

  const videoSrc = `/uploads/${fileName}`;
  let poster: string | undefined;
  try {
    poster = await generateThumbnail(videoSrc);
  } catch {
    // Thumbnail generation failed (ffmpeg missing, corrupt video, etc.) — fall back to category poster
  }

  const video = await createVideoEntry({
    title: title || file.name.replace(/\.[^.]+$/, ""),
    description,
    category,
    tags: [category],
    videoSrc,
    poster
  });

  return NextResponse.json({ video });
}
