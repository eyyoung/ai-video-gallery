import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { updateVideoEntry, deleteVideoEntry } from "@/lib/video-store";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const updated = await updateVideoEntry(id, body);
  if (!updated) {
    return NextResponse.json({ error: "视频不存在。" }, { status: 404 });
  }

  return NextResponse.json({ video: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未授权访问。" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteVideoEntry(id);

  if (!deleted) {
    return NextResponse.json({ error: "视频不存在。" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
