import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);

  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
