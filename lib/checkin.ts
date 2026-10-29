import { getRedis, KEYS } from "./redis";
import { parsePassCode } from "./security";
import { getEvents } from "./sheets";
import { isCancelled, istDay, lookupRegistration } from "./registrations";
import type { SheetEvent } from "./content-types";

export interface CheckinEntry {
  at: string;
  by: string;
}

export type CheckinResult =
  | { state: "VALID"; name: string; eventTitle: string; eventId: string; regId: string; signed: boolean; count: number | null }
  | { state: "ALREADY"; name: string; eventTitle: string; eventId: string; regId: string; previous: CheckinEntry }
  | { state: "INVALID"; message: string };

export async function checkInPass(code: string, by: string, expectedEventId?: string): Promise<CheckinResult> {
  const parsed = parsePassCode(code);
  if (!parsed.regId) return { state: "INVALID", message: "The code is empty." };
  if (parsed.signed && !parsed.valid) return { state: "INVALID", message: "This pass has been altered or forged. Send the person to the help desk." };

  const record = await lookupRegistration(parsed.regId);
  if (!record) return { state: "INVALID", message: `No registration matches pass ${parsed.regId}.` };

  if (expectedEventId && record.eventId !== expectedEventId) {
    return { state: "INVALID", message: `This pass is for ${record.eventTitle}, not the event you're scanning for.` };
  }

  const events = await getEvents<SheetEvent>();
  const event = events.find((e) => e.id === record.eventId);
  if (event && event.status !== "ACTIVE") {
    return { state: "INVALID", message: `${record.eventTitle} is no longer active.` };
  }
  if (await isCancelled(record.eventId, record.regId)) {
    return { state: "INVALID", message: `This registration for ${record.eventTitle} was cancelled.` };
  }

  const redis = getRedis();
  if (!redis) {
    // No Redis: we can verify but not remember entries
    return { state: "VALID", name: record.name, eventTitle: record.eventTitle, eventId: record.eventId, regId: record.regId, signed: parsed.signed, count: null };
  }

  const day = istDay();
  const entry: CheckinEntry = { at: new Date().toISOString(), by: by.slice(0, 40) || "gate" };
  const fresh = await redis.hsetnx(KEYS.checkins(record.eventId, day), record.regId, entry);
  if (!fresh) {
    const previous = (await redis.hget<CheckinEntry>(KEYS.checkins(record.eventId, day), record.regId)) || entry;
    return { state: "ALREADY", name: record.name, eventTitle: record.eventTitle, eventId: record.eventId, regId: record.regId, previous };
  }
  const p = redis.pipeline();
  p.sadd(KEYS.attended(record.eventId), record.email);
  p.sadd(KEYS.checkinDays(record.eventId), day);
  p.hlen(KEYS.checkins(record.eventId, day));
  const results = await p.exec();
  return {
    state: "VALID",
    name: record.name,
    eventTitle: record.eventTitle,
    eventId: record.eventId,
    regId: record.regId,
    signed: parsed.signed,
    count: Number(results[2]) || null,
  };
}

export async function checkinCounts(eventId: string) {
  const redis = getRedis();
  if (!redis) return { today: 0, total: 0, days: [] as { day: string; count: number }[] };
  const days = ((await redis.smembers(KEYS.checkinDays(eventId))) as string[]).sort();
  const p = redis.pipeline();
  days.forEach((d) => p.hlen(KEYS.checkins(eventId, d)));
  p.scard(KEYS.attended(eventId));
  p.hlen(KEYS.checkins(eventId, istDay()));
  const results = days.length + 2 > 0 ? await p.exec() : [];
  const perDay = days.map((day, i) => ({ day, count: Number(results[i]) || 0 }));
  return { total: Number(results[days.length]) || 0, today: Number(results[days.length + 1]) || 0, days: perDay };
}

export async function checkinsForRegistration(eventId: string, regId: string) {
  const redis = getRedis();
  if (!redis) return [];
  const days = (await redis.smembers(KEYS.checkinDays(eventId))) as string[];
  if (days.length === 0) return [];
  const p = redis.pipeline();
  days.forEach((d) => p.hget(KEYS.checkins(eventId, d), regId));
  const results = (await p.exec()) as (CheckinEntry | null)[];
  return results.filter(Boolean) as CheckinEntry[];
}
