import { NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";
import { getEvents } from "@/lib/sheets";
import { readAllEventMeta } from "@/lib/content";
import { eligibleEntrants, getJudge, getScoreCards, getSubmissions, type ScoreCard } from "@/lib/judging";
import { cleanText, limitByIp } from "@/lib/security";
import { JUDGE_COOKIE, getJudgeCode, judgeCookie } from "@/lib/visitor";
import type { SheetEvent } from "@/lib/content-types";

export const dynamic = "force-dynamic";

const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });

// Judges sign in with the code the organisers give them and only see their own events
export async function GET() {
  const code = await getJudgeCode();
  const judge = code ? await getJudge(code) : null;
  if (!judge) return json({ success: true, signedIn: false });

  const [events, metaById] = await Promise.all([getEvents<SheetEvent>(), readAllEventMeta()]);
  const assigned = [];
  for (const eventId of judge.eventIds) {
    const meta = metaById[eventId];
    const event = events.find((e) => e.id === eventId);
    if (!meta || !event || meta.rounds.length === 0) continue;
    const rounds = [];
    for (const round of meta.rounds) {
      const [entrants, submissions, cards] = await Promise.all([
        eligibleEntrants(eventId, meta, round.id),
        getSubmissions(eventId, round.id),
        getScoreCards(eventId, round.id),
      ]);
      rounds.push({
        id: round.id,
        name: round.name,
        rubric: round.rubric,
        entrants: entrants.map((e) => ({
          id: e.id,
          name: e.name,
          members: e.members,
          submission: submissions[e.id] || null,
          myScore: cards[`${judge.code}|${e.id}`] || null,
        })),
      });
    }
    assigned.push({ eventId, title: event.title, rounds });
  }
  return json({ success: true, signedIn: true, judge: { name: judge.name }, events: assigned });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (body.action === "sign-in") {
    const limited = await limitByIp(request, "judge-login", 10, 900);
    if (limited) return limited;
    const code = cleanText(body.code, 20).toUpperCase();
    const judge = code ? await getJudge(code) : null;
    if (!judge) return json({ success: false, error: "That judge code isn't recognised." }, 401);
    const cookie = judgeCookie(judge.code);
    const response = json({ success: true });
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  }

  if (body.action === "sign-out") {
    const response = json({ success: true });
    response.cookies.set(JUDGE_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  }

  if (body.action === "score") {
    const code = await getJudgeCode();
    const judge = code ? await getJudge(code) : null;
    if (!judge) return json({ success: false, error: "Please sign in again." }, 401);
    const eventId = cleanText(body.eventId, 60);
    const roundId = cleanText(body.roundId, 60);
    const entrantId = cleanText(body.entrantId, 80);
    if (!judge.eventIds.includes(eventId)) return json({ success: false, error: "You're not judging this event." }, 403);

    const meta = (await readAllEventMeta())[eventId];
    const round = meta?.rounds.find((r) => r.id === roundId);
    if (!meta || !round) return json({ success: false, error: "That round doesn't exist." }, 404);
    if (!(await eligibleEntrants(eventId, meta, roundId)).some((e) => e.id === entrantId)) {
      return json({ success: false, error: "That entry isn't in this round." }, 400);
    }

    const scores: Record<string, number> = {};
    for (const item of round.rubric) {
      const value = Number(body.scores?.[item.id]);
      if (!Number.isFinite(value) || value < 0 || value > item.max) {
        return json({ success: false, error: `${item.label} must be between 0 and ${item.max}.` }, 400);
      }
      scores[item.id] = value;
    }
    const card: ScoreCard = { scores, comment: cleanText(body.comment, 1000), at: new Date().toISOString() };
    const redis = getRedis();
    if (!redis) return json({ success: false, error: "Scoring isn't available right now." }, 503);
    await redis.hset(KEYS.scores(eventId, roundId), { [`${judge.code}|${entrantId}`]: card });
    return json({ success: true, card });
  }

  return json({ success: false, error: "Unknown action." }, 400);
}
