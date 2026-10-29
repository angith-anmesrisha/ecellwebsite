// Calls to the Google Apps Script web app. When SHEET_WEBHOOK_SECRET is set it is sent with
// every request, so the script can reject calls that don't come from this site.
const secret = () => process.env.SHEET_WEBHOOK_SECRET || "";

export function sheetConfigured() {
  return Boolean(process.env.SHEET_WEBHOOK_URL);
}

export function sheetGetUrl(action: string, params: Record<string, string> = {}) {
  const base = process.env.SHEET_WEBHOOK_URL;
  if (!base) throw new Error("SHEET_WEBHOOK_URL is not configured.");
  const query = new URLSearchParams({ action, ...params });
  if (secret()) query.set("secret", secret());
  return `${base}?${query.toString()}`;
}

export async function sheetGet<T = any>(action: string, params: Record<string, string> = {}, init: RequestInit = {}): Promise<T> {
  const res = await fetch(sheetGetUrl(action, params), { method: "GET", ...init });
  return res.json();
}

export async function sheetPost<T = any>(body: Record<string, unknown>): Promise<T> {
  const base = process.env.SHEET_WEBHOOK_URL;
  if (!base) throw new Error("SHEET_WEBHOOK_URL is not configured.");
  const res = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(secret() ? { ...body, secret: secret() } : body),
  });
  return res.json();
}

export interface SheetRegistration {
  regId: string;
  eventId: string;
  eventTitle: string;
  name: string;
  email: string;
  rollNumber: string;
  customAnswers: Record<string, string>;
  timestamp?: string;
  [key: string]: unknown;
}

function parseAnswers(value: unknown): Record<string, string> {
  if (value && typeof value === "object") return value as Record<string, string>;
  if (typeof value === "string" && value.trim().startsWith("{")) {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return {};
}

// Event registrations only (the same sheet action also returns recruitment rows)
export async function getEventRegistrations(options: { fresh?: boolean } = {}): Promise<SheetRegistration[]> {
  const init: RequestInit = options.fresh
    ? { cache: "no-store" }
    : ({ next: { revalidate: 30, tags: ["registrations"] } } as RequestInit);
  const data = await sheetGet<{ success: boolean; data?: SheetRegistration[] }>("get-all-registrations", {}, init);
  if (!data.success || !Array.isArray(data.data)) throw new Error("Could not read registrations from the sheet.");
  return data.data
    .filter((row) => row && row.eventId)
    .map((row) => ({
      ...row,
      regId: String(row.regId || ""),
      eventId: String(row.eventId),
      email: String(row.email || "").trim().toLowerCase(),
      customAnswers: parseAnswers(row.customAnswers),
    }));
}

// Drop-in replacement for fetch() on the sheet URL that adds the shared secret
export function sheetFetch(url: string, init: RequestInit = {}) {
  const value = secret();
  if (!value) return fetch(url, init);
  if (init.method === "POST" && typeof init.body === "string") {
    try {
      return fetch(url, { ...init, body: JSON.stringify({ ...JSON.parse(init.body), secret: value }) });
    } catch {
      return fetch(url, init);
    }
  }
  const withSecret = new URL(url);
  withSecret.searchParams.set("secret", value);
  return fetch(withSecret.toString(), init);
}
