import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { KEYS, getRedis } from "@/lib/redis";
import {
  mergeRecruitment,
  mergeSettings,
  readAnnouncements,
  readRecruitmentConfig,
  readSeries,
  readSettings,
  readTeam,
  writeKey,
} from "@/lib/content";
import { mailProvider } from "@/lib/mailer";
import type { Announcement, Series, TeamMember } from "@/lib/content-types";

export const dynamic = "force-dynamic";

// What's switched on in the hosting environment, so the console can say what still needs setting up
function setupStatus() {
  return {
    redis: Boolean(getRedis()),
    mail: mailProvider(),
    turnstile: Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
    sheetSecret: Boolean(process.env.SHEET_WEBHOOK_SECRET),
    passSecret: Boolean(process.env.PASS_SECRET),
    uploads: Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_PRESET),
  };
}

export async function GET() {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  const [settings, announcements, team, series, recruitment] = await Promise.all([
    readSettings(),
    readAnnouncements(),
    readTeam(),
    readSeries(),
    readRecruitmentConfig(),
  ]);
  return NextResponse.json(
    { success: true, settings, announcements, team, series, recruitment, setup: setupStatus() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const optStr = (v: unknown, max = 500) => str(v, max) || undefined;
const id = () => Math.random().toString(36).slice(2, 10);

function cleanAnnouncements(value: unknown): Announcement[] {
  if (!Array.isArray(value)) throw new Error("Announcements must be a list.");
  return value.slice(0, 50).map((a: any) => ({
    id: str(a.id, 40) || id(),
    text: str(a.text, 300),
    link: optStr(a.link),
    linkLabel: optStr(a.linkLabel, 40),
    startsAt: optStr(a.startsAt, 40),
    endsAt: optStr(a.endsAt, 40),
    pinned: Boolean(a.pinned),
    eventId: optStr(a.eventId, 60),
    createdAt: str(a.createdAt, 40) || new Date().toISOString(),
  })).filter((a) => a.text);
}

function cleanTeam(value: unknown): TeamMember[] {
  if (!Array.isArray(value)) throw new Error("Team must be a list.");
  return value.slice(0, 200).map((m: any) => ({
    id: str(m.id, 40) || id(),
    name: str(m.name, 80),
    role: str(m.role, 80),
    image: str(m.image) || null,
    linkedin: str(m.linkedin),
    tenure: str(m.tenure, 20),
  })).filter((m) => m.name);
}

function cleanSeries(value: unknown): Series[] {
  if (!Array.isArray(value)) throw new Error("Series must be a list.");
  return value.slice(0, 50).map((s: any) => ({
    id: str(s.id, 40) || id(),
    title: str(s.title, 120),
    description: str(s.description, 1000),
    eventIds: Array.isArray(s.eventIds) ? s.eventIds.map((e: unknown) => str(e, 60)).filter(Boolean) : [],
    requiredCount: Math.max(0, Math.floor(Number(s.requiredCount) || 0)),
  })).filter((s) => s.title);
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  if (!getRedis()) {
    return NextResponse.json({ success: false, error: "Redis isn't configured, so changes can't be saved." }, { status: 503 });
  }
  try {
    const { key, value } = await request.json();
    switch (key) {
      case "settings": {
        const merged = mergeSettings(value);
        await writeKey(KEYS.settings, merged);
        return NextResponse.json({ success: true, value: merged });
      }
      case "announcements": {
        const clean = cleanAnnouncements(value);
        await writeKey(KEYS.announcements, clean);
        return NextResponse.json({ success: true, value: clean });
      }
      case "team": {
        const clean = cleanTeam(value);
        await writeKey(KEYS.team, clean);
        return NextResponse.json({ success: true, value: clean });
      }
      case "series": {
        const clean = cleanSeries(value);
        await writeKey(KEYS.series, clean);
        return NextResponse.json({ success: true, value: clean });
      }
      case "recruitment": {
        const merged = mergeRecruitment({ ...value, updatedAt: new Date().toISOString() });
        for (const q of merged.questions) {
          if (!q.q || !Array.isArray(q.options) || q.options.length < 2 || q.answer < 0 || q.answer >= q.options.length) {
            throw new Error("Every quiz question needs text, at least two options and a correct answer.");
          }
        }
        await writeKey(KEYS.recruitment, merged);
        return NextResponse.json({ success: true, value: merged });
      }
      default:
        return NextResponse.json({ success: false, error: "Unknown content type." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Save failed." }, { status: 400 });
  }
}
