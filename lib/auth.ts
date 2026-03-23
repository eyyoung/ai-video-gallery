import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "nc-admin-session";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "neural-curator";
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function validatePassword(candidate: string) {
  return candidate === getAdminPassword();
}

export function createAuthToken() {
  return digest(getAdminPassword());
}

export function isValidAuthToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  const expected = Buffer.from(createAuthToken());
  const received = Buffer.from(token);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return isValidAuthToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}
