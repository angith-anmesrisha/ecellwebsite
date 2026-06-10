import { NextResponse } from "next/server";

// We use a shared server memory node to track the phase changes instantly
let globalPortalPhase = "LOCKED";

export async function GET() {
  // Returns the phase instantly to the public recruitment component checking page
  return NextResponse.json({ success: true, phase: globalPortalPhase });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if this is an internal state update coming from your Admin UI change dropdown
    if (body.action === "update-global-phase") {
      globalPortalPhase = body.phase; // e.g., "OPEN" or "COMPLETED" or "LOCKED"
      return NextResponse.json({ success: true, phase: globalPortalPhase });
    }

    // Standard Passkey Bypass checking block logic
    const { passkey } = body;
    if (!passkey) {
      return NextResponse.json({ error: "Missing authorization token parameter." }, { status: 400 });
    }

    const masterPasskey = process.env.NEXT_PUBLIC_ADMIN_MASTER_KEY || "ecelladmin2026";

    if (passkey === masterPasskey) {
      return NextResponse.json({ success: true, message: "System bypass authorized successfully." });
    }

    return NextResponse.json({ success: false, error: "Access denied." }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Server authentication layer fault." }, { status: 500 });
  }
}