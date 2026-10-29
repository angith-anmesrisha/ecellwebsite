import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { checkInPass, checkinCounts } from "@/lib/checkin";
import { seatsTaken } from "@/lib/registrations";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";

// Gate scanner: verifies a pass and records the entry (once per pass per day)
export async function POST(request: Request) {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  try {
    const body = await request.json();
    const code = cleanText(body.code, 120);
    if (!code) return NextResponse.json({ success: false, error: "No pass code given." }, { status: 400 });
    const result = await checkInPass(code, cleanText(body.by, 40), cleanText(body.eventId, 60) || undefined);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Check-in failed:", error);
    return NextResponse.json({ success: false, error: "Couldn't verify the pass right now." }, { status: 500 });
  }
}

// Live headcount for the scanner
export async function GET(request: Request) {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  const eventId = new URL(request.url).searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ success: false, error: "Pick an event." }, { status: 400 });
  const [counts, registered] = await Promise.all([checkinCounts(eventId), seatsTaken(eventId).catch(() => null)]);
  return NextResponse.json({ success: true, ...counts, registered });
}
