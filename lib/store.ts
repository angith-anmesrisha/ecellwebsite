import { unstable_cache } from "next/cache";
import { dbConfigured, newId, q } from "./db";
import { getEventRegistrations, sheetConfigured, sheetGetUrl, sheetPost, type SheetRegistration } from "./sheetClient";
import type { SheetEvent } from "./content-types";

// One place that decides where records live. Until the admin switches the site over on
// /admin/database, everything keeps going to the Google Sheet; afterwards it's Neon Postgres.

const SWITCH_CHECK_MS = 15_000;
let switchCache: { value: boolean; at: number } | null = null;

export async function usingDatabase(): Promise<boolean> {
  if (!dbConfigured()) return false;
  if (switchCache && Date.now() - switchCache.at < SWITCH_CHECK_MS) return switchCache.value;
  let value = false;
  try {
    const rows = await q<{ value: unknown }>("select value from app_state where key = 'source'");
    value = rows[0]?.value === "database";
  } catch {
    // Tables not created yet
    value = false;
  }
  switchCache = { value, at: Date.now() };
  return value;
}

export async function setSource(source: "database" | "sheet") {
  await q(
    `insert into app_state (key, value, updated_at) values ('source', $1::jsonb, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [JSON.stringify(source)],
  );
  switchCache = { value: source === "database", at: Date.now() };
}

export const PUBLIC_TAGS = ["get-events", "get-alumni", "get-graveyard"] as const;
const PUBLIC_REVALIDATE_SECONDS = 300;

// ---------- Sheet reads (until the switch) ----------

async function readSheet<T>(action: string): Promise<T[]> {
  if (!sheetConfigured()) return [];
  try {
    const res = await fetch(sheetGetUrl(action), {
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [action] },
    });
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error(`Sheet read failed for ${action}:`, error);
    return [];
  }
}

// ---------- Events ----------

const toEvent = (r: any): SheetEvent => ({
  id: r.id,
  title: r.title,
  date: r.date,
  description: r.description,
  status: r.status,
  customFields: Array.isArray(r.custom_fields) ? r.custom_fields : [],
  bannerUrl: r.banner_url || "",
});

const dbEvents = () => q("select * from events order by created_at desc").then((rows) => rows.map(toEvent));
const cachedDbEvents = unstable_cache(dbEvents, ["db-events"], { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: ["get-events"] });

export async function listEvents<T = SheetEvent>(options: { fresh?: boolean } = {}): Promise<T[]> {
  if (await usingDatabase()) {
    try {
      return (await (options.fresh ? dbEvents() : cachedDbEvents())) as T[];
    } catch (error) {
      console.error("Database read failed for events:", error);
      return [];
    }
  }
  return readSheet<T>("get-events");
}

export interface EventInput {
  title: string;
  date: string;
  description: string;
  status: string;
  customFields: string[];
  bannerUrl: string;
}

export async function createEvent(partial: Partial<EventInput>) {
  const input: EventInput = {
    title: partial.title || "Untitled event",
    date: partial.date || "",
    description: partial.description || "",
    status: partial.status || "ACTIVE",
    customFields: partial.customFields || [],
    bannerUrl: partial.bannerUrl || "",
  };
  if (await usingDatabase()) {
    const id = newId("EVT");
    await q(
      `insert into events (id, title, date, description, status, custom_fields, banner_url)
       values ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
      [id, input.title, input.date, input.description, input.status, JSON.stringify(input.customFields), input.bannerUrl],
    );
    return { success: true, id };
  }
  return sheetPost<{ success: boolean; error?: string }>({ action: "create-event", ...input });
}

export async function updateEvent(id: string, input: Partial<EventInput>) {
  const columns: Record<keyof EventInput, string> = {
    title: "title",
    date: "date",
    description: "description",
    status: "status",
    customFields: "custom_fields",
    bannerUrl: "banner_url",
  };
  const sets: string[] = [];
  const params: unknown[] = [id];
  for (const [key, column] of Object.entries(columns) as [keyof EventInput, string][]) {
    if (input[key] === undefined) continue;
    params.push(key === "customFields" ? JSON.stringify(input[key]) : input[key]);
    sets.push(`${column} = $${params.length}${key === "customFields" ? "::jsonb" : ""}`);
  }
  if (sets.length === 0) return;
  await q(`update events set ${sets.join(", ")} where id = $1`, params);
}

export async function deleteEvent(id: string) {
  await q("delete from events where id = $1", [id]);
}

// ---------- Event registrations ----------

const toRegistration = (r: any): SheetRegistration => ({
  ...(r.extra || {}),
  regId: r.reg_id,
  eventId: r.event_id,
  eventTitle: r.event_title,
  name: r.name,
  email: r.email,
  rollNumber: r.roll_number,
  customAnswers: r.custom_answers || {},
  timestamp: new Date(r.created_at).toISOString(),
});

export async function listEventRegistrations(options: { fresh?: boolean; eventId?: string; email?: string } = {}): Promise<SheetRegistration[]> {
  if (await usingDatabase()) {
    const where: string[] = [];
    const params: unknown[] = [];
    if (options.eventId) {
      params.push(options.eventId);
      where.push(`event_id = $${params.length}`);
    }
    if (options.email) {
      params.push(options.email);
      where.push(`email = $${params.length}`);
    }
    const rows = await q(
      `select * from registrations ${where.length ? `where ${where.join(" and ")}` : ""} order by created_at`,
      params,
    );
    return rows.map(toRegistration);
  }
  const rows = await getEventRegistrations({ fresh: options.fresh });
  return rows.filter((r) => (!options.eventId || r.eventId === options.eventId) && (!options.email || r.email === options.email));
}

export interface NewRegistration {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  name: string;
  email: string;
  rollNumber: string;
  customAnswers: Record<string, string>;
}

export async function insertRegistration(input: NewRegistration): Promise<{ success: boolean; registrationId?: string; error?: string }> {
  if (await usingDatabase()) {
    const regId = newId("REG");
    await q(
      `insert into registrations (reg_id, event_id, event_title, name, email, roll_number, custom_answers)
       values ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [regId, input.eventId, input.eventTitle, input.name, input.email, input.rollNumber, JSON.stringify(input.customAnswers)],
    );
    return { success: true, registrationId: regId };
  }
  return sheetPost<{ success: boolean; registrationId?: string; error?: string }>({ action: "submit-registration", ...input });
}

// ---------- Alumni and graveyard ----------

const ALUMNI_FIELDS = ["name", "batch", "company", "role", "superpower", "linkedin", "email", "photo"] as const;
const GRAVEYARD_FIELDS = ["name", "founders", "sector", "runtime", "reason", "lesson"] as const;

const pick = (r: any, fields: readonly string[]) => ({
  ...(r.extra || {}),
  id: r.id,
  ...Object.fromEntries(fields.map((f) => [f, r[f] ?? ""])),
});

const dbAlumni = () => q("select * from alumni order by created_at").then((rows) => rows.map((r) => pick(r, ALUMNI_FIELDS)));
const dbGraveyard = () => q("select * from graveyard order by created_at").then((rows) => rows.map((r) => pick(r, GRAVEYARD_FIELDS)));
const cachedAlumni = unstable_cache(dbAlumni, ["db-alumni"], { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: ["get-alumni"] });
const cachedGraveyard = unstable_cache(dbGraveyard, ["db-graveyard"], { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: ["get-graveyard"] });

export async function listAlumni<T>(options: { fresh?: boolean } = {}): Promise<T[]> {
  if (await usingDatabase()) {
    try {
      return (await (options.fresh ? dbAlumni() : cachedAlumni())) as T[];
    } catch (error) {
      console.error("Database read failed for alumni:", error);
      return [];
    }
  }
  return readSheet<T>("get-alumni");
}

export async function listGraveyard<T>(options: { fresh?: boolean } = {}): Promise<T[]> {
  if (await usingDatabase()) {
    try {
      return (await (options.fresh ? dbGraveyard() : cachedGraveyard())) as T[];
    } catch (error) {
      console.error("Database read failed for graveyard:", error);
      return [];
    }
  }
  return readSheet<T>("get-graveyard");
}

function valuesFor(fields: readonly string[], source: Record<string, unknown>) {
  return fields.map((f) => String(source[f] ?? "").slice(0, 2000));
}

export async function insertAlumnus(entry: Record<string, unknown>, id = newId("ALM")) {
  const extra = Object.fromEntries(Object.entries(entry).filter(([k]) => k !== "id" && !(ALUMNI_FIELDS as readonly string[]).includes(k)));
  await q(
    `insert into alumni (id, ${ALUMNI_FIELDS.join(", ")}, extra) values ($1, ${ALUMNI_FIELDS.map((_, i) => `$${i + 2}`).join(", ")}, $${ALUMNI_FIELDS.length + 2}::jsonb)
     on conflict (id) do nothing`,
    [id, ...valuesFor(ALUMNI_FIELDS, entry), JSON.stringify(extra)],
  );
  return id;
}

export async function insertGrave(entry: Record<string, unknown>, id = newId("RIP")) {
  const extra = Object.fromEntries(Object.entries(entry).filter(([k]) => k !== "id" && !(GRAVEYARD_FIELDS as readonly string[]).includes(k)));
  await q(
    `insert into graveyard (id, ${GRAVEYARD_FIELDS.join(", ")}, extra) values ($1, ${GRAVEYARD_FIELDS.map((_, i) => `$${i + 2}`).join(", ")}, $${GRAVEYARD_FIELDS.length + 2}::jsonb)
     on conflict (id) do nothing`,
    [id, ...valuesFor(GRAVEYARD_FIELDS, entry), JSON.stringify(extra)],
  );
  return id;
}

export async function deleteListing(kind: "alumni" | "graveyard", id: string) {
  await q(`delete from ${kind === "alumni" ? "alumni" : "graveyard"} where id = $1`, [id]);
}

// ---------- Public submissions waiting for review ----------

export interface Submission {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: string;
  createdAt: string;
}

export async function stageSubmission(type: string, payload: Record<string, unknown>) {
  if (await usingDatabase()) {
    await q(`insert into submissions (id, type, payload) values ($1, $2, $3::jsonb)`, [newId("SUB"), type, JSON.stringify(payload)]);
    return true;
  }
  const data = await sheetPost({ action: "stage-submission", type, payload }).catch(() => null);
  return Boolean(data);
}

export async function listSubmissions(status = "PENDING"): Promise<Submission[]> {
  const rows = await q("select * from submissions where status = $1 order by created_at desc", [status]);
  return rows.map((r) => ({ id: r.id, type: r.type, payload: r.payload || {}, status: r.status, createdAt: new Date(r.created_at).toISOString() }));
}

// Approving copies the entry into the public alumni or graveyard list
export async function reviewSubmission(id: string, approve: boolean) {
  const [row] = await q("select * from submissions where id = $1", [id]);
  if (!row) return false;
  if (approve) {
    if (row.type === "ALUMNI_REGISTRATION") await insertAlumnus(row.payload, `ALM-${id}`);
    else if (row.type === "GRAVEYARD_SUBMISSION") await insertGrave(row.payload, `RIP-${id}`);
  }
  await q("update submissions set status = $2 where id = $1", [id, approve ? "APPROVED" : "REJECTED"]);
  return true;
}
