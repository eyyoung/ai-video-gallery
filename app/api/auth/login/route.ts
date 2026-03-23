import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, createAuthToken, validatePassword } from "@/lib/auth";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { password?: string } | null;

  if (!payload?.password || !validatePassword(payload.password)) {
    return NextResponse.json({ error: "管理员密码错误。" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, createAuthToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return NextResponse.json({ ok: true });
}
