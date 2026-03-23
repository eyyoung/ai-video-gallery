import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { reorderVideos } from "@/lib/video-store";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    orderedIds?: unknown;
  } | null;

  if (!body || !Array.isArray(body.orderedIds)) {
    return NextResponse.json({ error: "请提供 orderedIds 数组。" }, { status: 400 });
  }

  const orderedIds = body.orderedIds.filter((id): id is string => typeof id === "string");

  const ok = await reorderVideos(orderedIds);
  if (!ok) {
    return NextResponse.json(
      { error: "排序无效：须包含全部视频 id，且不可重复或缺失。" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
