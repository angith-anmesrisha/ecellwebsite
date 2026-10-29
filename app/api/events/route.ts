import { NextResponse, after } from "next/server";
import { sendEventPassEmail } from "@/lib/mailer";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";

const TARGET_URL = process.env.SHEET_WEBHOOK_URL;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "events";

    if (mode === "registrations") {
      // Students can look up their own registrations by email (results page);
      // the full list is for the admin dashboard and the gate scanner only.
      const email = searchParams.get("email")?.trim().toLowerCase();
      if (!email && !(await isAdminRequest())) return unauthorizedResponse();

      const response = await fetch(`${TARGET_URL}?action=get-all-registrations`, {
        method: "GET",
        cache: "no-store",
      });
      const data = await response.json();
      const payload =
        email && Array.isArray(data.data)
          ? { ...data, data: data.data.filter((row: any) => row.email?.toLowerCase() === email) }
          : data;

      return NextResponse.json(payload, { headers: { "Cache-Control": "private, no-store" } });
    }

    const response = await fetch(`${TARGET_URL}?action=get-events`, {
      method: "GET",
      next: { revalidate: 60 },
    });

    const data = await response.json();

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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Public visitors can only register; everything else (creating events etc.) is admin only
    if (body.action !== "submit-registration" && !(await isAdminRequest())) {
      return unauthorizedResponse();
    }

    const response = await fetch(TARGET_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.success && body.action === "submit-registration") {
      // after() keeps the serverless function alive until the email is sent;
      // a bare un-awaited promise can be frozen as soon as the response goes out.
      after(() =>
        sendEventPassEmail({
          toEmail: body.email,
          studentName: body.name,
          eventTitle: body.eventTitle,
          eventDate: body.eventDate || "2026-06-30",
          passId: data.registrationId || "PENDING",
        }).catch((err) => console.error(err)),
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to push form records." },
      { status: 500 },
    );
  }
}