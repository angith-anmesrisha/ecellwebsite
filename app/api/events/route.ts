import { NextResponse, after } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { getEventRegistrations, sheetGet, sheetPost } from "@/lib/sheetClient";
import { getEvents } from "@/lib/sheets";
import { readEventMeta } from "@/lib/content";
import { registerForEvent, sendPass, type Applicant } from "@/lib/registrations";
import { registrationWindow, type SheetEvent } from "@/lib/content-types";
import { EMAIL_PATTERN, captchaFailed, cleanText, limitByIp, verifyTurnstile } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "events";

    if (mode === "registrations") {
      // Full list for the admin dashboard only. Students see their own passes in My E-Cell.
      if (!(await isAdminRequest())) return unauthorizedResponse();
      const data = await getEventRegistrations({ fresh: true });
      return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "private, no-store" } });
    }

    const data = await sheetGet("get-events", {}, { next: { revalidate: 60 } } as RequestInit);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=240",
        "CDN-Cache-Control": "public, s-maxage=60",
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
  if (!rollNumber) return "Please enter your roll or registration number.";

  const customAnswers: Record<string, string> = {};
  if (body.customAnswers && typeof body.customAnswers === "object") {
    for (const [key, value] of Object.entries(body.customAnswers).slice(0, 30)) {
      customAnswers[cleanText(key, 80)] = cleanText(value, 1000);
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

  const events = await getEvents<SheetEvent>();
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

  // after() keeps the serverless function alive until the email is sent;
  // a bare un-awaited promise can be frozen as soon as the response goes out.
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "submit-registration") return handleRegistration(request, body);

    // Everything else (creating events etc.) is admin only
    if (!(await isAdminRequest())) return unauthorizedResponse();

    const data = await sheetPost(body);

    // Admin changes to the event list should show on /events straight away
    if (data.success) revalidateTag("get-events", { expire: 0 });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Events POST failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to push form records." },
      { status: 500 },
    );
  }
}
