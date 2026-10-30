import { NextResponse, after } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { getRedis, KEYS } from "@/lib/redis";
import { getEvents } from "@/lib/sheets";
import { listEventRegistrations } from "@/lib/store";
import { readEventMeta } from "@/lib/content";
import { getTeams, getWaitlist, lookupRegistration, promoteFromWaitlist, seatsTaken, sendPass } from "@/lib/registrations";
import { mailProvider, noticeHtml, sendBulk } from "@/lib/mailer";
import { cleanText } from "@/lib/security";
import type { SheetEvent } from "@/lib/content-types";

export const dynamic = "force-dynamic";
// Broadcasts keep running after the response; give them room
export const maxDuration = 300;

const broadcastKey = (eventId: string) => `ecell:broadcast:${eventId}`;

async function findEvent(eventId: string) {
  return (await getEvents<SheetEvent>()).find((e) => e.id === eventId) || null;
}

export async function GET(request: Request) {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  const eventId = new URL(request.url).searchParams.get("eventId") || "";
  const redis = getRedis();
  const meta = await readEventMeta(eventId);
  const [waitlist, teams, taken, cancelled, lastBroadcast] = await Promise.all([
    getWaitlist(eventId),
    getTeams(eventId),
    seatsTaken(eventId).catch(() => null),
    redis ? redis.smembers(KEYS.cancelled(eventId)) : Promise.resolve([] as string[]),
    redis ? redis.get(broadcastKey(eventId)) : Promise.resolve(null),
  ]);
  return NextResponse.json(
    {
      success: true,
      capacity: meta.capacity || null,
      taken,
      waitlist,
      teams: teams.map((t) => ({ ...t, complete: t.members.length >= meta.team.minSize })),
      cancelled,
      lastBroadcast,
      mailProvider: mailProvider(),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  const body = await request.json().catch(() => ({}));
  const eventId = cleanText(body.eventId, 60);
  const event = await findEvent(eventId);
  if (!event) return NextResponse.json({ success: false, error: "Event not found." }, { status: 404 });
  const meta = await readEventMeta(eventId);
  const redis = getRedis();

  if (body.action === "promote") {
    const promoted = await promoteFromWaitlist(event, meta, cleanText(body.email, 200) || undefined);
    if (!promoted) return NextResponse.json({ success: false, error: "Nobody to promote, or the sheet didn't accept it." }, { status: 400 });
    return NextResponse.json({ success: true, promoted });
  }

  if (body.action === "remove-waitlist") {
    if (!redis) return NextResponse.json({ success: false, error: "Redis isn't configured." }, { status: 503 });
    await redis.hdel(KEYS.waitlist(eventId), cleanText(body.email, 200));
    return NextResponse.json({ success: true });
  }

  if (body.action === "resend-pass") {
    const record = await lookupRegistration(cleanText(body.regId, 80));
    if (!record) return NextResponse.json({ success: false, error: "Pass not found." }, { status: 404 });
    await sendPass(event, meta, record);
    return NextResponse.json({ success: true });
  }

  if (body.action === "broadcast") {
    const subject = cleanText(body.subject, 150);
    const message = cleanText(body.message, 5000);
    const audience = cleanText(body.audience, 30) || "registered";
    if (!subject || !message) return NextResponse.json({ success: false, error: "Add a subject and a message." }, { status: 400 });

    const cancelled = redis ? new Set((await redis.smembers(KEYS.cancelled(eventId))) as string[]) : new Set<string>();
    const attended = redis ? new Set((await redis.smembers(KEYS.attended(eventId))) as string[]) : new Set<string>();
    let recipients: string[];
    if (audience === "waitlist") {
      recipients = (await getWaitlist(eventId)).map((a) => a.email);
    } else {
      const registered = [
        ...new Set(
          (await listEventRegistrations({ fresh: true, eventId }))
            .filter((r) => !cancelled.has(r.regId) && r.email)
            .map((r) => r.email),
        ),
      ];
      recipients =
        audience === "checked-in"
          ? registered.filter((e) => attended.has(e))
          : audience === "not-checked-in"
            ? registered.filter((e) => !attended.has(e))
            : registered;
    }
    if (recipients.length === 0) return NextResponse.json({ success: false, error: "Nobody matches that audience yet." }, { status: 400 });

    const startedAt = new Date().toISOString();
    if (redis) await redis.set(broadcastKey(eventId), { subject, audience, total: recipients.length, sent: 0, failed: 0, startedAt, done: false });
    after(async () => {
      const result = await sendBulk(recipients, () => ({
        subject,
        text: message,
        html: noticeHtml(event.title, message.split(/\n{2,}/)),
      }));
      if (redis) {
        await redis.set(broadcastKey(eventId), {
          subject,
          audience,
          total: recipients.length,
          sent: result.sent,
          failed: result.failed.length,
          startedAt,
          done: true,
        });
      }
    });
    return NextResponse.json({ success: true, queued: recipients.length });
  }

  return NextResponse.json({ success: false, error: "Unknown action." }, { status: 400 });
}
