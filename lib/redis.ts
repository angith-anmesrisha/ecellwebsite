import { Redis } from "@upstash/redis";

// One shared Upstash client for every server route. Returns null when the KV variables
// aren't set (local builds, previews), so callers can fall back to defaults instead of crashing.
let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  client = url && token ? new Redis({ url, token }) : null;
  return client;
}

export function requireRedis(): Redis {
  const redis = getRedis();
  if (!redis) throw new Error("Redis is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN.");
  return redis;
}

// Every key this site writes, in one place so they're easy to find in the Upstash console
export const KEYS = {
  settings: "ecell:settings",
  announcements: "ecell:announcements",
  team: "ecell:team",
  series: "ecell:series",
  recruitment: "ecell:recruitment-config",
  eventMeta: "ecell:event-meta",
  // Per event
  regEmails: (eventId: string) => `ecell:reg-emails:${eventId}`,
  regSeeded: (eventId: string) => `ecell:reg-seeded:${eventId}`,
  regTimes: (eventId: string) => `ecell:reg-times:${eventId}`,
  waitlist: (eventId: string) => `ecell:waitlist:${eventId}`,
  cancelled: (eventId: string) => `ecell:cancelled:${eventId}`,
  attended: (eventId: string) => `ecell:attended:${eventId}`,
  checkins: (eventId: string, day: string) => `ecell:checkins:${eventId}:${day}`,
  checkinDays: (eventId: string) => `ecell:checkin-days:${eventId}`,
  teams: (eventId: string) => `ecell:teams:${eventId}`,
  teamCodes: "ecell:team-codes",
  submissions: (eventId: string, roundId: string) => `ecell:subs:${eventId}:${roundId}`,
  scores: (eventId: string, roundId: string) => `ecell:scores:${eventId}:${roundId}`,
  advanced: (eventId: string, roundId: string) => `ecell:advanced:${eventId}:${roundId}`,
  // Per registration
  registration: (regId: string) => `ecell:reg:${regId}`,
  emailRegs: (email: string) => `ecell:email-regs:${email}`,
  judges: "ecell:judges",
  loginCode: (email: string) => `ecell:login-code:${email}`,
  rate: (bucket: string, id: string) => `ecell:rate:${bucket}:${id}`,
};
