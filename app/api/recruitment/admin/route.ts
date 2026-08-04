import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

// FORCE DYNAMIC: Prevents Vercel from caching the GET request for real-time polling
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch current global states from Redis (with fallback defaults if empty)
    const phase = (await kv.get("ecell_recruitment_phase")) || "LOCKED";
    const holdReleased = (await kv.get("ecell_global_hold")) || false;
    
    return NextResponse.json({ 
      success: true, 
      phase,
      holdReleased 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch state from KV" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Handle global state updates via Redis
    if (body.action === "update-global-phase") {
      if (body.phase !== undefined) {
        await kv.set("ecell_recruitment_phase", body.phase);
      }
      if (body.holdReleased !== undefined) {
        await kv.set("ecell_global_hold", body.holdReleased);
      }
      
      // Fetch the updated values to return in response
      const updatedPhase = await kv.get("ecell_recruitment_phase");
      const updatedHoldReleased = await kv.get("ecell_global_hold");

      return NextResponse.json({ 
        success: true, 
        phase: updatedPhase,
        holdReleased: updatedHoldReleased 
      });
    }

    // Handle Master Passkey Authorization (from your old code)
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