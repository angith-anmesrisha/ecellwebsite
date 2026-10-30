import { revalidateTag } from "next/cache";
import { ensureSchema, q } from "./db";
import { sheetGet } from "./sheetClient";
import { PUBLIC_TAGS } from "./store";

// One-time copy of everything in the Google Sheet into Postgres. Safe to run more than once:
// rows are matched by their ID and refreshed, never duplicated.

export interface TableCounts {
  events: number;
  registrations: number;
  candidates: number;
  alumni: number;
  graveyard: number;
}

const str = (v: unknown) => (v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v));

function when(v: unknown) {
  const t = v ? Date.parse(String(v)) : NaN;
  return Number.isFinite(t) ? new Date(t).toISOString() : new Date().toISOString();
}

function objectOf(v: unknown): Record<string, unknown> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  if (typeof v === "string" && v.trim().startsWith("{")) {
    try {
      return JSON.parse(v);
    } catch {
      return {};
    }
  }
  return {};
}

function arrayOf(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.trim().startsWith("[")) {
    try {
      return JSON.parse(v);
    } catch {
      return [];
    }
  }
  if (typeof v === "string" && v.trim()) return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

// Keeps any column we don't have a home for, so nothing from the Sheet is lost
function rest(row: Record<string, unknown>, known: string[]) {
  return Object.fromEntries(Object.entries(row).filter(([k]) => !known.includes(k)));
}

async function readAction(action: string) {
  const data = await sheetGet<{ success: boolean; data?: any[]; error?: string }>(action, {}, { cache: "no-store" });
  if (!data?.success || !Array.isArray(data.data)) throw new Error(`The Sheet didn't return ${action}: ${data?.error || "no data"}`);
  return data.data.filter((r) => r && typeof r === "object");
}

// Recruitment must come through; the other lists are skipped when the script doesn't offer them
// (the current Apps Script only serves the Submissions tab)
async function readOptional(action: string, skipped: string[]) {
  try {
    return await readAction(action);
  } catch {
    skipped.push(action);
    return [];
  }
}

export async function readSheetEverything() {
  const skipped: string[] = [];
  const [events, all, alumni, graveyard] = await Promise.all([
    readOptional("get-events", skipped),
    readAction("get-all-registrations"),
    readOptional("get-alumni", skipped),
    readOptional("get-graveyard", skipped),
  ]);
  // The Sheet returns event registrations and recruitment candidates in one list;
  // event rows are the ones tied to an event
  const registrations = all.filter((r) => r.eventId);
  const candidates = all.filter((r) => !r.eventId);
  return { events, registrations, candidates, alumni, graveyard, skipped };
}

const KNOWN_STATUSES = new Set([
  "PENDING", "BORDERLINE", "WAITLISTED", "ROUND_2_APPROVED", "SELECTED", "SELECTED_FOR_PI", "SELECTED_CORE", "REJECTED",
]);

// Best effort, a few at a time, and stops early so the import finishes inside the time limit
async function quizAnswersByEmail(emails: string[], budgetMs = 35_000) {
  const found = new Map<string, string>();
  const started = Date.now();
  const queue = [...new Set(emails)];
  const worker = async () => {
    while (queue.length && Date.now() - started < budgetMs) {
      const email = queue.shift()!;
      try {
        const data = await sheetGet<{ success: boolean; choices?: unknown }>("check-student-result", { email }, { cache: "no-store" });
        if (data?.success && data.choices) found.set(email, str(data.choices));
      } catch {
        // Leave this person's quiz answers empty
      }
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  return found;
}

// Inserts many rows in one statement: the rows go in as one JSON array
async function upsert(table: string, key: string, columns: Record<string, string>, rows: Record<string, unknown>[]) {
  const names = Object.keys(columns);
  const updates = names.filter((n) => n !== key).map((n) => `${n} = excluded.${n}`);
  for (let i = 0; i < rows.length; i += 500) {
    await q(
      `insert into ${table} (${names.join(", ")})
       select ${names.join(", ")} from jsonb_to_recordset($1::jsonb) as x(${names.map((n) => `${n} ${columns[n]}`).join(", ")})
       on conflict (${key}) do update set ${updates.join(", ")}`,
      [JSON.stringify(rows.slice(i, i + 500))],
    );
  }
}

const uniqueBy = <T,>(rows: T[], key: (r: T) => string) => [...new Map(rows.map((r) => [key(r), r])).values()];

export async function importFromSheet() {
  await ensureSchema();
  const sheet = await readSheetEverything();

  const events = uniqueBy(
    sheet.events.filter((e) => e.id),
    (e) => String(e.id),
  ).map((e) => ({
    id: str(e.id),
    title: str(e.title) || "Untitled event",
    date: str(e.date),
    description: str(e.description),
    status: str(e.status).toUpperCase() || "ACTIVE",
    custom_fields: arrayOf(e.customFields),
    banner_url: str(e.bannerUrl),
    extra: rest(e, ["id", "title", "date", "description", "status", "customFields", "bannerUrl"]),
    created_at: when(e.createdAt || e.timestamp || e.date),
  }));

  const registrations = uniqueBy(
    sheet.registrations.filter((r) => r.regId),
    (r) => String(r.regId),
  ).map((r) => ({
    reg_id: str(r.regId),
    event_id: str(r.eventId),
    event_title: str(r.eventTitle),
    name: str(r.name),
    email: str(r.email).trim().toLowerCase(),
    roll_number: str(r.rollNumber),
    custom_answers: objectOf(r.customAnswers),
    extra: rest(r, ["regId", "eventId", "eventTitle", "name", "email", "rollNumber", "customAnswers", "timestamp"]),
    created_at: when(r.timestamp),
  }));

  // The Apps Script's list puts column G (status) in both status and customAnswers, and the case
  // answer was written over column G too. So a status we don't recognise is really a case answer,
  // and the quiz answers (column F) are fetched per person from check-student-result.
  const sheetCandidates = uniqueBy(
    sheet.candidates.filter((c) => c.regId || c.id || c.email),
    (c) => String(c.regId || c.id || c.email),
  );
  const choices = await quizAnswersByEmail(sheetCandidates.map((c) => str(c.email).trim().toLowerCase()).filter(Boolean));
  const candidates = sheetCandidates.map((c) => {
    const email = str(c.email).trim().toLowerCase();
    const rawStatus = str(c.status).trim();
    const known = KNOWN_STATUSES.has(rawStatus.toUpperCase());
    return {
      reg_id: str(c.regId || c.id || c.email),
      name: str(c.name),
      email,
      dept: str(c.eventTitle || c.dept),
      score: parseInt(str(c.rollNumber ?? c.score)) || 0,
      choices: choices.get(email) ?? "",
      status: known ? rawStatus.toUpperCase() : "PENDING",
      tab_switches: parseInt(str(c.tabSwitches)) || 0,
      case_answer: known || !rawStatus ? str(c.caseAnswer) : rawStatus,
      resume_url: str(c.resumeUrl),
      group_number: str(c.groupNumber),
      group_task: str(c.groupTask),
      peer_reviews: arrayOf(c.peerReviews),
      notes: str(c.notes || c.quickNotes),
      extra: rest(c, [
        "regId", "id", "name", "email", "eventTitle", "dept", "rollNumber", "score", "customAnswers", "choices", "status",
        "tabSwitches", "caseAnswer", "resumeUrl", "groupNumber", "groupTask", "peerReviews", "notes", "quickNotes", "timestamp",
      ]),
      created_at: when(c.timestamp),
    };
  });

  const listing = (rows: any[], prefix: string, fields: string[]) =>
    uniqueBy(
      rows.map((r, i) => ({ ...r, id: str(r.id) || `${prefix}-SHEET-${i + 1}` })),
      (r) => r.id,
    ).map((r) => ({
      id: r.id,
      ...Object.fromEntries(fields.map((f) => [f, str(r[f])])),
      extra: rest(r, ["id", ...fields, "timestamp"]),
      created_at: when(r.timestamp),
    }));

  const alumniFields = ["name", "batch", "company", "role", "superpower", "linkedin", "email", "photo"];
  const graveFields = ["name", "founders", "sector", "runtime", "reason", "lesson"];
  const alumni = listing(sheet.alumni, "ALM", alumniFields);
  const graveyard = listing(sheet.graveyard, "RIP", graveFields);

  const text = (fields: string[]) => Object.fromEntries(fields.map((f) => [f, "text"]));

  await upsert("events", "id", { id: "text", title: "text", date: "text", description: "text", status: "text", custom_fields: "jsonb", banner_url: "text", extra: "jsonb", created_at: "timestamptz" }, events);
  await upsert("registrations", "reg_id", {
    reg_id: "text", event_id: "text", event_title: "text", name: "text", email: "text", roll_number: "text",
    custom_answers: "jsonb", extra: "jsonb", created_at: "timestamptz",
  }, registrations);
  await upsert("candidates", "reg_id", {
    reg_id: "text", name: "text", email: "text", dept: "text", score: "integer", choices: "text", status: "text",
    tab_switches: "integer", case_answer: "text", resume_url: "text", group_number: "text", group_task: "text",
    peer_reviews: "jsonb", notes: "text", extra: "jsonb", created_at: "timestamptz",
  }, candidates);
  await upsert("alumni", "id", { id: "text", ...text(alumniFields), extra: "jsonb", created_at: "timestamptz" }, alumni);
  await upsert("graveyard", "id", { id: "text", ...text(graveFields), extra: "jsonb", created_at: "timestamptz" }, graveyard);

  await q(
    `insert into app_state (key, value, updated_at) values ('last_import', $1::jsonb, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [JSON.stringify({ at: new Date().toISOString() })],
  );
  PUBLIC_TAGS.forEach((tag) => revalidateTag(tag, { expire: 0 }));

  return {
    events: events.length,
    registrations: registrations.length,
    candidates: candidates.length,
    alumni: alumni.length,
    graveyard: graveyard.length,
    skipped: sheet.skipped,
  };
}

export async function databaseCounts(): Promise<TableCounts & { pendingSubmissions: number }> {
  const [row] = await q<Record<string, string>>(
    `select
      (select count(*) from events) as events,
      (select count(*) from registrations) as registrations,
      (select count(*) from candidates) as candidates,
      (select count(*) from alumni) as alumni,
      (select count(*) from graveyard) as graveyard,
      (select count(*) from submissions where status = 'PENDING') as pending`,
  );
  return {
    events: Number(row.events),
    registrations: Number(row.registrations),
    candidates: Number(row.candidates),
    alumni: Number(row.alumni),
    graveyard: Number(row.graveyard),
    pendingSubmissions: Number(row.pending),
  };
}

export async function sheetCounts(): Promise<TableCounts> {
  const sheet = await readSheetEverything();
  return {
    events: sheet.events.length,
    registrations: sheet.registrations.length,
    candidates: sheet.candidates.length,
    alumni: sheet.alumni.length,
    graveyard: sheet.graveyard.length,
  };
}
