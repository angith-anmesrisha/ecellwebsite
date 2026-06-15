import { NextResponse } from "next/server";


let globalPortalPhase = "LOCKED";

export async function GET() {
  
  return NextResponse.json({ success: true, phase: globalPortalPhase });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    
    if (body.action === "update-global-phase") {
      globalPortalPhase = body.phase; 
      return NextResponse.json({ success: true, phase: globalPortalPhase });
    }

    
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