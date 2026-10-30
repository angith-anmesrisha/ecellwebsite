import { neon, neonConfig, type NeonQueryFunction } from "@neondatabase/serverless";

// Neon Postgres over HTTP. DATABASE_URL is added by the Vercel ↔ Neon integration.
// NEON_HTTP_ENDPOINT is only for local testing against a stand-in server.
let client: NeonQueryFunction<false, false> | null | undefined;

export function dbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  if (client !== undefined) return client;
  const url = process.env.DATABASE_URL;
  if (process.env.NEON_HTTP_ENDPOINT) neonConfig.fetchEndpoint = process.env.NEON_HTTP_ENDPOINT;
  client = url ? neon(url) : null;
  return client;
}

export function requireSql() {
  const sql = getSql();
  if (!sql) throw new Error("The database is not connected. Add Neon in Vercel → Storage.");
  return sql;
}

// Plain parameterised query: q("select * from events where id = $1", [id])
export async function q<T = Record<string, any>>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await requireSql().query(text, params)) as T[];
}

// Every table the site uses. Safe to run again: it only creates what is missing.
const SCHEMA = [
  `create table if not exists app_state (
    key text primary key,
    value jsonb not null,
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists events (
    id text primary key,
    title text not null,
    date text not null default '',
    description text not null default '',
    status text not null default 'ACTIVE',
    custom_fields jsonb not null default '[]',
    banner_url text not null default '',
    extra jsonb not null default '{}',
    created_at timestamptz not null default now()
  )`,
  `create table if not exists registrations (
    reg_id text primary key,
    event_id text not null,
    event_title text not null default '',
    name text not null default '',
    email text not null default '',
    roll_number text not null default '',
    custom_answers jsonb not null default '{}',
    extra jsonb not null default '{}',
    created_at timestamptz not null default now()
  )`,
  `create index if not exists registrations_event_idx on registrations (event_id)`,
  `create index if not exists registrations_email_idx on registrations (email)`,
  `create table if not exists candidates (
    reg_id text primary key,
    name text not null default '',
    email text not null default '',
    dept text not null default '',
    score integer not null default 0,
    choices text not null default '',
    status text not null default 'PENDING',
    tab_switches integer not null default 0,
    case_answer text not null default '',
    resume_url text not null default '',
    group_number text not null default '',
    group_task text not null default '',
    peer_reviews jsonb not null default '[]',
    notes text not null default '',
    extra jsonb not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create index if not exists candidates_email_idx on candidates (email)`,
  `create table if not exists resumes (
    reg_id text primary key,
    file_name text not null default 'resume.pdf',
    content bytea not null,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists alumni (
    id text primary key,
    name text not null default '',
    batch text not null default '',
    company text not null default '',
    role text not null default '',
    superpower text not null default '',
    linkedin text not null default '',
    email text not null default '',
    photo text not null default '',
    extra jsonb not null default '{}',
    created_at timestamptz not null default now()
  )`,
  `create table if not exists graveyard (
    id text primary key,
    name text not null default '',
    founders text not null default '',
    sector text not null default '',
    runtime text not null default '',
    reason text not null default '',
    lesson text not null default '',
    extra jsonb not null default '{}',
    created_at timestamptz not null default now()
  )`,
  `create table if not exists submissions (
    id text primary key,
    type text not null,
    payload jsonb not null default '{}',
    status text not null default 'PENDING',
    created_at timestamptz not null default now()
  )`,
];

export async function ensureSchema() {
  const sql = requireSql();
  await sql.transaction(SCHEMA.map((statement) => sql.query(statement)));
}

export function newId(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${out}`;
}
