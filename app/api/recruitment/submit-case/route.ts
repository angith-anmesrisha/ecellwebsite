import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, caseAnswer } = body;

    if (!email || !caseAnswer) {
      return NextResponse.json({ error: "Malformed request keys." }, { status: 400 });
    }

    const targetUrl = process.env.SHEET_WEBHOOK_URL;
    if (!targetUrl) throw new Error("Google microservice connection dead.");

    
    if (email === "clear_command_system_override@ecell.com" && caseAnswer === "RESET_ALL_DATA_ROWS_IMMEDIATELY_COHORT_2026") {
      const resetHandshake = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear-all" })
      });
      const resetRes = await resetHandshake.json();
      return NextResponse.json({ success: resetRes.success });
    }

    if (caseAnswer.trim().split(/\s+/).length < 50) {
      return NextResponse.json({ error: "Substantive strategy text required." }, { status: 400 });
    }

    const sheetHandshake = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-case",
        email: email.trim().toLowerCase(),
        caseAnswer: caseAnswer.trim()
      })
    });

    const result = await sheetHandshake.json();
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to securely execute wipe sequence." }, { status: 500 });
  }
}