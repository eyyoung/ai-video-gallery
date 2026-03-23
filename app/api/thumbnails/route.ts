import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { regenerateThumbnails } from "@/lib/video-store";

export const runtime = "nodejs";

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }

  const count = await regenerateThumbnails();
  return NextResponse.json({ updated: count });
}
