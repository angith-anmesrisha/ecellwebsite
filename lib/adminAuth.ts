import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Admin sessions are a signed, httpOnly cookie. The password never reaches the browser bundle.
// ADMIN_PASSWORD is the preferred variable; the older NEXT_PUBLIC_ name is still read here
// (server side only) so an existing Vercel setup keeps working.
export const ADMIN_COOKIE = "ecell_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getAdminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_MASTER_KEY;
  return value && value.length > 0 ? value : null;
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function isAdminConfigured() {
  return getAdminPassword() !== null;
}

export function checkAdminPassword(input: unknown) {
  const password = getAdminPassword();
  if (!password || typeof input !== "string") return false;
  return safeEqual(input, password);
}

export function createSessionToken() {
  const password = getAdminPassword();
  if (!password) throw new Error("Admin password is not configured.");
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return `${expires}.${sign(`admin:${expires}`, password)}`;
}

function verifySessionToken(token: string | undefined) {
  const password = getAdminPassword();
  if (!password || !token) return false;
  const [expiresRaw, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!expires || !signature || expires < Date.now() / 1000) return false;
  return safeEqual(signature, sign(`admin:${expires}`, password));
}

export async function isAdminRequest() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function unauthorizedResponse() {
  return NextResponse.json({ success: false, error: "Admin login required." }, { status: 401 });
}
