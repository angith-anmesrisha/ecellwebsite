import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { getRedis } from "@/lib/redis";
import { mergeEventMeta, readAllEventMeta, writeEventMeta } from "@/lib/content";
import { slugify, type EventMeta } from "@/lib/content-types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  return NextResponse.json({ success: true, meta: await readAllEventMeta() }, { headers: { "Cache-Control": "private, no-store" } });
}

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const opt = (v: unknown, max = 500) => str(v, max) || undefined;
const list = <T>(v: unknown, map: (x: any) => T | null, max = 100): T[] =>
  Array.isArray(v) ? (v.slice(0, max).map(map).filter(Boolean) as T[]) : [];
const uid = () => Math.random().toString(36).slice(2, 10);

function clean(input: any): EventMeta {
  const eventId = str(input.eventId, 60);
  if (!eventId) throw new Error("Missing event.");
  const capacity = Math.floor(Number(input.capacity));
  return mergeEventMeta(eventId, {
    slug: input.slug ? slugify(str(input.slug, 80)) || undefined : undefined,
    tagline: opt(input.tagline, 200),
    venue: opt(input.venue, 200),
    startsAt: opt(input.startsAt, 40),
    endsAt: opt(input.endsAt, 40),
    rules: opt(input.rules, 5000),
    capacity: capacity > 0 ? capacity : undefined,
    waitlist: Boolean(input.waitlist),
    opensAt: opt(input.opensAt, 40),
    closesAt: opt(input.closesAt, 40),
    collectCollege: Boolean(input.collectCollege),
    schedule: list(input.schedule, (s) =>
      str(s.title) && str(s.startsAt)
        ? { id: str(s.id, 40) || uid(), startsAt: str(s.startsAt, 40), endsAt: opt(s.endsAt, 40), title: str(s.title, 200), location: opt(s.location, 120), speaker: opt(s.speaker, 120) }
        : null,
    ),
    speakers: list(input.speakers, (s) => (str(s.name) ? { name: str(s.name, 100), role: str(s.role, 150), photo: opt(s.photo), link: opt(s.link) } : null)),
    sponsors: list(input.sponsors, (s) => (str(s.name) ? { name: str(s.name, 100), tier: str(s.tier, 60) || "Partner", logo: opt(s.logo), url: opt(s.url) } : null)),
    faq: list(input.faq, (f) => (str(f.q) ? { q: str(f.q, 300), a: str(f.a, 2000) } : null)),
    team: {
      enabled: Boolean(input.team?.enabled),
      minSize: Math.max(1, Math.floor(Number(input.team?.minSize) || 1)),
      maxSize: Math.max(1, Math.floor(Number(input.team?.maxSize) || 4)),
    },
    rounds: list(input.rounds, (r) =>
      str(r.name)
        ? {
            id: str(r.id, 40) || uid(),
            name: str(r.name, 100),
            submissionLabel: str(r.submissionLabel, 100) || "Submission link",
            submissionsOpenAt: opt(r.submissionsOpenAt, 40),
            submissionsCloseAt: opt(r.submissionsCloseAt, 40),
            rubric: list(r.rubric, (c) =>
              str(c.label) ? { id: str(c.id, 40) || uid(), label: str(c.label, 100), max: Math.max(1, Math.floor(Number(c.max) || 10)) } : null,
              20,
            ),
            published: Boolean(r.published),
            publishTop: Math.max(1, Math.floor(Number(r.publishTop) || 10)),
          }
        : null,
      10,
    ),
    recap: input.recap
      ? {
          summary: str(input.recap.summary, 3000),
          photos: list(input.recap.photos, (p) => str(p) || null, 40),
          winners: list(input.recap.winners, (w) => (str(w.name) ? { place: str(w.place, 40), name: str(w.name, 120) } : null), 20),
          stats: list(input.recap.stats, (s) => (str(s.label) ? { label: str(s.label, 60), value: str(s.value, 40) } : null), 12),
          quote: opt(input.recap.quote, 500),
        }
      : undefined,
  });
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  if (!getRedis()) return NextResponse.json({ success: false, error: "Redis isn't configured, so changes can't be saved." }, { status: 503 });
  try {
    const meta = clean(await request.json());
    await writeEventMeta(meta);
    return NextResponse.json({ success: true, meta });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Save failed." }, { status: 400 });
  }
}
