import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getRedis, KEYS } from "./redis";

// Secret for signing pass codes and visitor cookies. PASS_SECRET is preferred; the admin
// password is the fallback so things work without extra setup (changing it voids signed passes).
function signingSecret() {
  return (
    process.env.PASS_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.NEXT_PUBLIC_ADMIN_MASTER_KEY ||
    "ecell-dev-secret"
  );
}

export function hmac(value: string, length = 64) {
  return createHmac("sha256", signingSecret()).update(value).digest("hex").slice(0, length);
}

export function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

// Pass codes in the QR are "<regId>.<signature>" so a guessed or edited ID is rejected at the gate.
export function signPass(regId: string) {
  return `${regId}.${hmac(`pass:${regId}`, 10)}`;
}

export function parsePassCode(code: string): { regId: string; signed: boolean; valid: boolean } {
  const trimmed = code.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0) return { regId: trimmed, signed: false, valid: true };
  const regId = trimmed.slice(0, dot);
  const sig = trimmed.slice(dot + 1);
  return { regId, signed: true, valid: safeEqual(sig, hmac(`pass:${regId}`, 10)) };
}

// Small signed tokens for visitor cookies (My E-Cell, judges): "<payload>.<expires>.<sig>"
export function createToken(kind: string, subject: string, ttlSeconds: number) {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = Buffer.from(subject).toString("base64url");
  return `${payload}.${expires}.${hmac(`${kind}:${payload}:${expires}`)}`;
}

export function readToken(kind: string, token: string | undefined): string | null {
  if (!token) return null;
  const [payload, expiresRaw, sig] = token.split(".");
  const expires = Number(expiresRaw);
  if (!payload || !sig || !expires || expires < Date.now() / 1000) return null;
  if (!safeEqual(sig, hmac(`${kind}:${payload}:${expires}`))) return null;
  return Buffer.from(payload, "base64url").toString();
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (forwarded?.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim();
}

// Fixed-window rate limit in Redis. Fails open when Redis is missing or down,
// so a Redis outage never blocks registrations.
export async function rateLimit(bucket: string, id: string, limit: number, windowSeconds: number) {
  const redis = getRedis();
  if (!redis) return { ok: true, retryAfter: 0 };
  try {
    const key = KEYS.rate(bucket, id);
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    if (count > limit) {
      const ttl = await redis.ttl(key);
      return { ok: false, retryAfter: ttl > 0 ? ttl : windowSeconds };
    }
    return { ok: true, retryAfter: 0 };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return { ok: true, retryAfter: 0 };
  }
}

export function tooManyRequests(retryAfter: number) {
  const minutes = Math.max(1, Math.ceil(retryAfter / 60));
  return NextResponse.json(
    { success: false, error: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

// Limits per IP; returns a ready 429 response when over the limit
export async function limitByIp(request: Request, bucket: string, limit: number, windowSeconds: number) {
  const result = await rateLimit(bucket, clientIp(request), limit, windowSeconds);
  return result.ok ? null : tooManyRequests(result.retryAfter);
}

// Cloudflare Turnstile. Only enforced once TURNSTILE_SECRET_KEY is set.
export async function verifyTurnstile(token: unknown, request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token, remoteip: clientIp(request) });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = await res.json();
    return Boolean(data.success);
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    // Cloudflare unreachable: let the person through rather than lock everyone out
    return true;
  }
}

export function captchaFailed() {
  return NextResponse.json(
    { success: false, error: "Please complete the verification check and try again." },
    { status: 400 },
  );
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanText(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
