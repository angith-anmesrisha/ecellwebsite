import { cookies } from "next/headers";
import { createToken, readToken } from "./security";

// Students sign in to My E-Cell with a one-time code sent to their email; the result is this
// signed cookie holding their email. Judges get a similar cookie holding their judge code.
export const VISITOR_COOKIE = "ecell_me";
export const JUDGE_COOKIE = "ecell_judge";
const VISITOR_TTL = 60 * 60 * 24 * 7;
const JUDGE_TTL = 60 * 60 * 24 * 3;

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

export async function getVisitorEmail() {
  const store = await cookies();
  return readToken("me", store.get(VISITOR_COOKIE)?.value);
}

export const visitorCookie = (email: string) => ({
  name: VISITOR_COOKIE,
  value: createToken("me", email, VISITOR_TTL),
  options: cookieOptions(VISITOR_TTL),
});

export async function getJudgeCode() {
  const store = await cookies();
  return readToken("judge", store.get(JUDGE_COOKIE)?.value);
}

export const judgeCookie = (code: string) => ({
  name: JUDGE_COOKIE,
  value: createToken("judge", code, JUDGE_TTL),
  options: cookieOptions(JUDGE_TTL),
});
