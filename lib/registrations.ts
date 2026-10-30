import { getRedis, KEYS } from "./redis";
import type { SheetRegistration } from "./sheetClient";
import { insertRegistration, listEventRegistrations } from "./store";
import { signPass } from "./security";
import { sendEventPassEmail } from "./mailer";
import type { EventMeta, SheetEvent } from "./content-types";

// Registration bookkeeping on top of the record store (Sheet or database, see lib/store.ts):
// one sign-up per email, seat limits, a waitlist, cancellations, teams, and a fast index for the
// gate scanner. The store stays the record of who registered; Redis only adds to it. Without
// Redis everything falls back to the old behaviour (straight to the store).

export interface RegistrationRecord {
  regId: string;
  eventId: string;
  eventTitle: string;
  name: string;
  email: string;
  rollNumber?: string;
  teamId?: string;
  at: string;
}

export interface Applicant {
  name: string;
  email: string;
  rollNumber: string;
  customAnswers: Record<string, string>;
  team?: { mode: "create"; name: string } | { mode: "join"; code: string };
  at?: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  leaderEmail: string;
  members: { email: string; name: string; regId?: string }[];
  createdAt: string;
}

export type RegisterResult =
  | { status: "registered"; regId: string; passCode: string; team?: { name: string; code: string } }
  | { status: "waitlisted"; position: number }
  | { status: "error"; code: "duplicate" | "full" | "closed" | "team" | "sheet"; message: string };

const randomCode = (length: number) => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
};

// Day key in IST, so a multi-day event gets a fresh check-in list each morning
export function istDay(date = new Date()) {
  return new Date(date.getTime() + 5.5 * 3_600_000).toISOString().slice(0, 10);
}

export async function indexRegistration(record: RegistrationRecord) {
  const redis = getRedis();
  if (!redis || !record.regId) return;
  const p = redis.pipeline();
  p.set(KEYS.registration(record.regId), record);
  p.sadd(KEYS.emailRegs(record.email), record.regId);
  p.sadd(KEYS.regEmails(record.eventId), record.email);
  await p.exec();
}

// Copies registrations made before this system existed into Redis, once per event
export async function ensureSeeded(eventId: string) {
  const redis = getRedis();
  if (!redis) return;
  if (await redis.get(KEYS.regSeeded(eventId))) return;
  let rows: SheetRegistration[];
  try {
    rows = await listEventRegistrations({ fresh: true, eventId });
  } catch (error) {
    console.error("Seeding registrations failed:", error);
    return;
  }
  for (let i = 0; i < rows.length; i += 200) {
    const p = redis.pipeline();
    for (const row of rows.slice(i, i + 200)) {
      if (!row.email) continue;
      p.sadd(KEYS.regEmails(eventId), row.email);
      if (row.regId) {
        p.set(KEYS.registration(row.regId), {
          regId: row.regId,
          eventId,
          eventTitle: row.eventTitle,
          name: row.name,
          email: row.email,
          rollNumber: row.rollNumber,
          at: row.timestamp ? String(row.timestamp) : "",
        } satisfies RegistrationRecord);
        p.sadd(KEYS.emailRegs(row.email), row.regId);
      }
    }
    await p.exec();
  }
  await redis.set(KEYS.regSeeded(eventId), new Date().toISOString());
}

export async function lookupRegistration(regId: string): Promise<RegistrationRecord | null> {
  const redis = getRedis();
  if (redis) {
    const hit = await redis.get<RegistrationRecord>(KEYS.registration(regId));
    if (hit) return hit;
  }
  // Older passes: find the row in the store (the Sheet read is cached for 30 seconds) and index it for next time
  const rows = await listEventRegistrations();
  const row = rows.find((r) => r.regId === regId);
  if (!row) return null;
  const record: RegistrationRecord = {
    regId: row.regId,
    eventId: row.eventId,
    eventTitle: row.eventTitle,
    name: row.name,
    email: row.email,
    rollNumber: row.rollNumber,
    at: row.timestamp ? String(row.timestamp) : "",
  };
  await indexRegistration(record).catch(() => {});
  return record;
}

export async function registrationsForEmail(email: string): Promise<RegistrationRecord[]> {
  const redis = getRedis();
  const found = new Map<string, RegistrationRecord>();
  if (redis) {
    const ids = await redis.smembers(KEYS.emailRegs(email));
    if (ids.length > 0) {
      const p = redis.pipeline();
      ids.forEach((id) => p.get(KEYS.registration(id)));
      const rows = (await p.exec()) as (RegistrationRecord | null)[];
      rows.forEach((r) => r && found.set(r.regId, r));
    }
  }
  // The store is the source of truth; merge in anything Redis hasn't seen
  try {
    const rows = await listEventRegistrations({ email });
    for (const row of rows) {
      if (!found.has(row.regId)) {
        found.set(row.regId, {
          regId: row.regId,
          eventId: row.eventId,
          eventTitle: row.eventTitle,
          name: row.name,
          email: row.email,
          rollNumber: row.rollNumber,
          at: row.timestamp ? String(row.timestamp) : "",
        });
      }
    }
  } catch (error) {
    console.error("Registration lookup for email failed:", error);
  }
  return [...found.values()];
}

async function findTeamByCode(eventId: string, code: string): Promise<Team | null> {
  const redis = getRedis();
  if (!redis) return null;
  const ref = await redis.hget<string>(KEYS.teamCodes, code.trim().toUpperCase());
  if (!ref) return null;
  const [teamEventId, teamId] = String(ref).split(":");
  if (teamEventId !== eventId) return null;
  return (await redis.hget<Team>(KEYS.teams(eventId), teamId)) ?? null;
}

export async function getTeams(eventId: string): Promise<Team[]> {
  const redis = getRedis();
  if (!redis) return [];
  const all = (await redis.hgetall<Record<string, Team>>(KEYS.teams(eventId))) || {};
  return Object.values(all).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getTeamForMember(eventId: string, email: string) {
  return (await getTeams(eventId)).find((t) => t.members.some((m) => m.email === email)) || null;
}

// Saves one applicant to the store and does everything that follows a confirmed seat
async function saveRegistration(event: SheetEvent, meta: EventMeta, applicant: Applicant): Promise<RegisterResult> {
  const redis = getRedis();
  const answers = { ...applicant.customAnswers };
  let team: Team | null = null;

  if (meta.team.enabled && applicant.team) {
    if (applicant.team.mode === "join") {
      team = await findTeamByCode(event.id, applicant.team.code);
      if (!team) return { status: "error", code: "team", message: "That team code doesn't match a team for this event." };
      if (team.members.length >= meta.team.maxSize)
        return { status: "error", code: "team", message: `Team ${team.name} is already full (${meta.team.maxSize} members).` };
    } else {
      const name = applicant.team.name.trim().slice(0, 60);
      if (!name) return { status: "error", code: "team", message: "Please give your team a name." };
      team = {
        id: `t_${Date.now().toString(36)}${randomCode(3)}`,
        name,
        code: randomCode(6),
        leaderEmail: applicant.email,
        members: [],
        createdAt: new Date().toISOString(),
      };
    }
    answers["Team"] = team.name;
    answers["Team code"] = team.code;
  }

  const data = await insertRegistration({
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    name: applicant.name,
    email: applicant.email,
    rollNumber: applicant.rollNumber,
    customAnswers: answers,
  }).catch((error) => {
    console.error("Saving registration failed:", error);
    return { success: false, registrationId: undefined, error: undefined };
  });

  if (!data.success || !data.registrationId) {
    return { status: "error", code: "sheet", message: data.error || "We couldn't save your registration. Please try again." };
  }

  const regId = String(data.registrationId);
  const passCode = signPass(regId);

  if (redis) {
    const at = new Date().toISOString();
    await indexRegistration({
      regId,
      eventId: event.id,
      eventTitle: event.title,
      name: applicant.name,
      email: applicant.email,
      rollNumber: applicant.rollNumber,
      teamId: team?.id,
      at,
    });
    await redis.zadd(KEYS.regTimes(event.id), { score: Date.now(), member: regId });
    if (team) {
      team.members.push({ email: applicant.email, name: applicant.name, regId });
      const p = redis.pipeline();
      p.hset(KEYS.teams(event.id), { [team.id]: team });
      p.hset(KEYS.teamCodes, { [team.code]: `${event.id}:${team.id}` });
      await p.exec();
    }
  }

  return { status: "registered", regId, passCode, team: team ? { name: team.name, code: team.code } : undefined };
}

export async function sendPass(event: Pick<SheetEvent, "title" | "date">, meta: EventMeta | undefined, person: { email: string; name: string; regId: string }) {
  await sendEventPassEmail({
    toEmail: person.email,
    studentName: person.name,
    eventTitle: event.title,
    eventDate: event.date || "",
    passId: person.regId,
    passCode: signPass(person.regId),
    venue: meta?.venue,
  });
}

export async function registerForEvent(event: SheetEvent, meta: EventMeta, applicant: Applicant): Promise<RegisterResult> {
  const redis = getRedis();
  if (!redis) return saveRegistration(event, meta, applicant);

  await ensureSeeded(event.id);
  if (await redis.hexists(KEYS.waitlist(event.id), applicant.email)) {
    return { status: "error", code: "duplicate", message: "You're already on the waitlist for this event. We'll email you if a seat opens." };
  }

  const added = await redis.sadd(KEYS.regEmails(event.id), applicant.email);
  if (!added) {
    return {
      status: "error",
      code: "duplicate",
      message: "This email is already registered for this event. Use My E-Cell on the Results page to get your pass again.",
    };
  }

  if (meta.capacity && meta.capacity > 0) {
    const taken = await redis.scard(KEYS.regEmails(event.id));
    if (taken > meta.capacity) {
      await redis.srem(KEYS.regEmails(event.id), applicant.email);
      if (!meta.waitlist) return { status: "error", code: "full", message: "Sorry, this event is full." };
      await redis.hsetnx(KEYS.waitlist(event.id), applicant.email, { ...applicant, at: new Date().toISOString() });
      const position = await redis.hlen(KEYS.waitlist(event.id));
      return { status: "waitlisted", position };
    }
  }

  const result = await saveRegistration(event, meta, applicant);
  if (result.status !== "registered") await redis.srem(KEYS.regEmails(event.id), applicant.email);
  return result;
}

export async function getWaitlist(eventId: string): Promise<Applicant[]> {
  const redis = getRedis();
  if (!redis) return [];
  const all = (await redis.hgetall<Record<string, Applicant>>(KEYS.waitlist(eventId))) || {};
  return Object.values(all).sort((a, b) => String(a.at).localeCompare(String(b.at)));
}

// Gives the next waitlisted person (or a named one) a seat and emails their pass
export async function promoteFromWaitlist(event: SheetEvent, meta: EventMeta, email?: string) {
  const redis = getRedis();
  if (!redis) return null;
  const queue = await getWaitlist(event.id);
  const next = email ? queue.find((a) => a.email === email) : queue[0];
  if (!next) return null;
  await redis.hdel(KEYS.waitlist(event.id), next.email);
  await redis.sadd(KEYS.regEmails(event.id), next.email);
  const result = await saveRegistration(event, meta, next);
  if (result.status !== "registered") {
    await redis.srem(KEYS.regEmails(event.id), next.email);
    await redis.hset(KEYS.waitlist(event.id), { [next.email]: next });
    return null;
  }
  await sendPass(event, meta, { email: next.email, name: next.name, regId: result.regId }).catch((err) =>
    console.error("Pass email after promotion failed:", err),
  );
  return { email: next.email, regId: result.regId };
}

export async function isCancelled(eventId: string, regId: string) {
  const redis = getRedis();
  return redis ? Boolean(await redis.sismember(KEYS.cancelled(eventId), regId)) : false;
}

export async function cancelRegistration(record: RegistrationRecord) {
  const redis = getRedis();
  if (!redis) throw new Error("Cancelling needs Redis.");
  const p = redis.pipeline();
  p.sadd(KEYS.cancelled(record.eventId), record.regId);
  p.srem(KEYS.regEmails(record.eventId), record.email);
  await p.exec();
  // Leave any team they were in
  const team = await getTeamForMember(record.eventId, record.email);
  if (team) {
    team.members = team.members.filter((m) => m.email !== record.email);
    await redis.hset(KEYS.teams(record.eventId), { [team.id]: team });
  }
}

export async function seatsTaken(eventId: string) {
  const redis = getRedis();
  if (!redis) return null;
  await ensureSeeded(eventId);
  return redis.scard(KEYS.regEmails(eventId));
}
