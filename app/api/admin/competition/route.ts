import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { getRedis, KEYS } from "@/lib/redis";
import { readEventMeta } from "@/lib/content";
import { buildLeaderboard, getJudges, maxScore, type Judge } from "@/lib/judging";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";

const judgeCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
};

export async function GET(request: Request) {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  const eventId = new URL(request.url).searchParams.get("eventId") || "";
  const judges = await getJudges();
  if (!eventId) return NextResponse.json({ success: true, judges, rounds: [] });
  const meta = await readEventMeta(eventId);
  const rounds = [];
  for (const round of meta.rounds) {
    const rows = await buildLeaderboard(eventId, meta, round);
    rounds.push({
      id: round.id,
      name: round.name,
      published: round.published,
      maxScore: maxScore(round),
      submissions: rows.filter((r) => r.submission).length,
      rows,
    });
  }
  return NextResponse.json({ success: true, judges, rounds }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  const redis = getRedis();
  if (!redis) return NextResponse.json({ success: false, error: "Redis isn't configured." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const eventIds = Array.isArray(body.eventIds) ? body.eventIds.map((e: unknown) => cleanText(e, 60)).filter(Boolean) : [];

  if (body.action === "add-judge") {
    const name = cleanText(body.name, 80);
    if (!name) return NextResponse.json({ success: false, error: "Give the judge a name." }, { status: 400 });
    const judge: Judge = { code: judgeCode(), name, eventIds, createdAt: new Date().toISOString() };
    await redis.hset(KEYS.judges, { [judge.code]: judge });
    return NextResponse.json({ success: true, judge });
  }

  if (body.action === "update-judge") {
    const code = cleanText(body.code, 20);
    const existing = await redis.hget<Judge>(KEYS.judges, code);
    if (!existing) return NextResponse.json({ success: false, error: "Judge not found." }, { status: 404 });
    const judge = { ...existing, name: cleanText(body.name, 80) || existing.name, eventIds };
    await redis.hset(KEYS.judges, { [code]: judge });
    return NextResponse.json({ success: true, judge });
  }

  if (body.action === "remove-judge") {
    await redis.hdel(KEYS.judges, cleanText(body.code, 20));
    return NextResponse.json({ success: true });
  }

  if (body.action === "set-advanced") {
    const eventId = cleanText(body.eventId, 60);
    const roundId = cleanText(body.roundId, 60);
    const ids = Array.isArray(body.entrantIds) ? body.entrantIds.map((e: unknown) => cleanText(e, 80)).filter(Boolean) : [];
    const key = KEYS.advanced(eventId, roundId);
    const p = redis.pipeline();
    p.del(key);
    if (ids.length > 0) p.sadd(key, ids[0], ...ids.slice(1));
    await p.exec();
    return NextResponse.json({ success: true, count: ids.length });
  }

  return NextResponse.json({ success: false, error: "Unknown action." }, { status: 400 });
}
