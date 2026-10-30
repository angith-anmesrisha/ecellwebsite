import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { getRedis, KEYS } from "@/lib/redis";
import { getEvents } from "@/lib/sheets";
import { listEventRegistrations } from "@/lib/store";
import { readEventMeta } from "@/lib/content";
import { checkinCounts } from "@/lib/checkin";
import { getTeams, getWaitlist, istDay } from "@/lib/registrations";
import type { SheetEvent } from "@/lib/content-types";

export const dynamic = "force-dynamic";

const PERSONAL_DOMAINS = new Set(["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "yahoo.co.in", "live.com", "rediffmail.com", "proton.me"]);

function countBy(values: string[], top = 10) {
  const counts = new Map<string, number>();
  for (const v of values) if (v) counts.set(v, (counts.get(v) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, top).map(([label, count]) => ({ label, count }));
}

const answer = (answers: Record<string, string>, ...keys: string[]) => {
  for (const [k, v] of Object.entries(answers)) if (keys.includes(k.trim().toLowerCase()) && v) return v.trim();
  return "";
};

export async function GET(request: Request) {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  const eventId = new URL(request.url).searchParams.get("eventId");
  const redis = getRedis();
  const [events, registrations] = await Promise.all([getEvents<SheetEvent>(), listEventRegistrations({ fresh: true })]);

  if (!eventId) {
    // Overview of every event
    const overview = await Promise.all(
      events.map(async (e) => {
        const regs = registrations.filter((r) => r.eventId === e.id);
        const attended = redis ? await redis.scard(KEYS.attended(e.id)) : 0;
        return { id: e.id, title: e.title, date: e.date, status: e.status, registrations: regs.length, attended };
      }),
    );
    return NextResponse.json({ success: true, overview }, { headers: { "Cache-Control": "private, no-store" } });
  }

  const event = events.find((e) => e.id === eventId);
  if (!event) return NextResponse.json({ success: false, error: "Event not found." }, { status: 404 });
  const meta = await readEventMeta(eventId);
  const cancelled = redis ? new Set((await redis.smembers(KEYS.cancelled(eventId))) as string[]) : new Set<string>();
  const rows = registrations.filter((r) => r.eventId === eventId);
  const active = rows.filter((r) => !cancelled.has(r.regId));

  // Sign-up times: the sheet's timestamp where it has one, otherwise the time this site recorded
  const recorded = new Map<string, number>();
  if (redis) {
    const flat = (await redis.zrange(KEYS.regTimes(eventId), 0, -1, { withScores: true })) as (string | number)[];
    for (let i = 0; i < flat.length; i += 2) recorded.set(String(flat[i]), Number(flat[i + 1]));
  }
  const days = active
    .map((r) => {
      const fromSheet = r.timestamp ? new Date(String(r.timestamp)).getTime() : NaN;
      const at = Number.isFinite(fromSheet) ? fromSheet : recorded.get(r.regId);
      return at ? istDay(new Date(at)) : "";
    })
    .filter(Boolean);
  const perDay = countBy(days, 365).sort((a, b) => a.label.localeCompare(b.label));

  const colleges = active.map((r) => {
    const named = answer(r.customAnswers, "college", "college / university", "institution", "university");
    if (named) return named;
    const domain = r.email.split("@")[1] || "";
    return PERSONAL_DOMAINS.has(domain) ? "Personal email (college not given)" : domain;
  });
  const cities = active.map((r) => answer(r.customAnswers, "city", "city / town"));

  const [checkins, waitlist, teams] = await Promise.all([checkinCounts(eventId), getWaitlist(eventId), getTeams(eventId)]);

  return NextResponse.json(
    {
      success: true,
      event: { id: event.id, title: event.title, date: event.date, status: event.status },
      totals: {
        registrations: rows.length,
        active: active.length,
        cancelled: rows.length - active.length,
        waitlist: waitlist.length,
        capacity: meta.capacity || null,
        attended: checkins.total,
        checkinRate: active.length ? Math.round((checkins.total / active.length) * 100) : 0,
        teams: teams.length,
        completeTeams: teams.filter((t) => t.members.length >= meta.team.minSize).length,
      },
      perDay,
      colleges: countBy(colleges),
      cities: countBy(cities.filter(Boolean)),
      checkinDays: checkins.days,
      tracking: { firstRecorded: perDay[0]?.label || null },
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
