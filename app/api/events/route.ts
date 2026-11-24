import { NextResponse, after } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import {
  createEvent,
  deleteEvent,
  listEventRegistrations,
  listEvents,
  updateEvent,
  usingDatabase,
  type EventInput,
} from "@/lib/store";
import { readEventMeta } from "@/lib/content";
import { registerForEvent, sendPass, type Applicant } from "@/lib/registrations";
import { registrationWindow, type SheetEvent } from "@/lib/content-types";
import { EMAIL_PATTERN, captchaFailed, cleanText, limitByIp, verifyTurnstile } from "@/lib/security";

// Cache public event list at the Edge for 1 hour; invalidated on admin POST via revalidateTag
export const revalidate = 3600;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    if (mode === "registrations") {
      if (!(await isAdminRequest())) return unauthorizedResponse();
      const data = await listEventRegistrations({ fresh: true });
      return NextResponse.json(
        { success: true, data },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const data = { success: true, data: await listEvents() };

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, s-maxage=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Server connection failure." },
      { status: 500 },
    );
  }
}

function readApplicant(body: any): Applicant | string {
  const name = cleanText(body.name, 100);
  const email = cleanText(body.email, 200).toLowerCase();
  const rollNumber = cleanText(body.rollNumber, 60);
  if (!name) return "Please enter your name.";
  if (!EMAIL_PATTERN.test(email)) return "Please enter a valid email address.";
  if (rollNumber) return "Please enter your roll or registration number.";

  const customAnswers: Record<string, string> = {};
  if (body.customAnswers && typeof body.customAnswers === "object") {
    for (const [key, value] of Object.entries(body.customAnswers).slice(0, 30)) {
      const cleanKey = cleanText(key, 80);
      if (cleanKey) customAnswers[cleanKey] = cleanText(value, 1000);
    }
  }

  let team: Applicant["team"];
  if (body.team?.mode === "create") team = { mode: "create", name: cleanText(body.team.name, 60) };
  else if (body.team?.mode === "join") team = { mode: "join", code: cleanText(body.team.code, 12).toUpperCase() };

  return { name, email, rollNumber, customAnswers, team };
}

async function handleRegistration(request: Request, body: any) {
  const limited = await limitByIp(request, "register", 12, 600);
  if (limited) return limited;
  if (!(await verifyTurnstile(body.captchaToken, request))) return captchaFailed();
  if (body.website) return NextResponse.json({ success: false, error: "Registration failed." }, { status: 400 });

  const applicant = readApplicant(body);
  if (typeof applicant === "string") return NextResponse.json({ success: false, error: applicant }, { status: 400 });

  const events = await listEvents<SheetEvent>();
  const event = events.find((e) => e.id === String(body.eventId));
  if (!event || event.status !== "ACTIVE") {
    return NextResponse.json({ success: false, error: "Registrations for this event are closed." }, { status: 400 });
  }

  const meta = await readEventMeta(event.id);
  const window = registrationWindow(meta);
  if (window !== "open") {
    return NextResponse.json(
      { success: false, error: window === "not-yet" ? "Registrations haven't opened yet." : "Registrations for this event are closed." },
      { status: 400 },
    );
  }
  if (meta.team.enabled && !applicant.team) {
    return NextResponse.json({ success: false, error: "Please create a team or join one with a team code." }, { status: 400 });
  }

  const result = await registerForEvent(event, meta, applicant);

  if (result.status === "waitlisted") {
    return NextResponse.json({ success: true, waitlisted: true, position: result.position });
  }
  if (result.status === "error") {
    const status = result.code === "duplicate" ? 409 : result.code === "sheet" ? 502 : 400;
    return NextResponse.json({ success: false, error: result.message, code: result.code }, { status });
  }

  after(() =>
    sendPass(event, meta, { email: applicant.email, name: applicant.name, regId: result.regId }).catch((err) => console.error(err)),
  );

  return NextResponse.json({
    success: true,
    registrationId: result.regId,
    passCode: result.passCode,
    team: result.team,
  });
}

function readEventInput(body: any): Partial<EventInput> {
  const input: Partial<EventInput> = {};
  if (body.title !== undefined) input.title = cleanText(body.title, 200);
  if (body.date !== undefined) input.date = cleanText(body.date, 60);
  if (body.description !== undefined) input.description = cleanText(body.description, 5000);
  if (body.status !== undefined) input.status = cleanText(body.status, 30).toUpperCase() || "ACTIVE";
  if (body.bannerUrl !== undefined) {
    const url = cleanText(body.bannerUrl, 2048);
    // Reject base64 data URIs so large images never bloat JSON origin transfer
    input.bannerUrl = url.startsWith("data:") ? "" : url;
  }
  if (Array.isArray(body.customFields)) {
    input.customFields = body.customFields.map((f: unknown) => cleanText(f, 120)).filter(Boolean).slice(0, 30);
  }
  return input;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "submit-registration") return handleRegistration(request, body);

    if (!(await isAdminRequest())) return unauthorizedResponse();

    let data: { success: boolean; error?: string; id?: string };
    if (body.action === "create-event") {
      data = await createEvent(readEventInput(body));
    } else if (body.action === "update-event" || body.action === "delete-event") {
      if (!(await usingDatabase())) {
        return NextResponse.json({ success: false, error: "Switch to the database first (Admin → Database)." }, { status: 400 });
      }
      const id = cleanText(body.id, 80);
      if (body.action === "delete-event") await deleteEvent(id);
      else await updateEvent(id, readEventInput(body));
      data = { success: true };
    } else {
      return NextResponse.json({ success: false, error: "Unknown action." }, { status: 400 });
    }

    if (data.success) revalidateTag("get-events", "max");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Events POST failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to push form records." },
      { status: 500 },
    );
  }
}