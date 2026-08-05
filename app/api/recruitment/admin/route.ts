import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Initialize Redis manually using the specific Vercel KV environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

// FORCE DYNAMIC: Prevents Vercel from caching the GET request for real-time polling
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const phase = (await redis.get("ecell_recruitment_phase")) || "LOCKED";
    
    // Force strict boolean parsing to prevent string mismatches
    const rawHold = await redis.get("ecell_global_hold");
    const holdReleased = rawHold === true || rawHold === "true";
    
    return NextResponse.json({ 
      success: true, 
      phase,
      holdReleased 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch state from Redis" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Handle global state updates via Redis
    if (body.action === "update-global-phase") {
      if (body.phase !== undefined) {
        await redis.set("ecell_recruitment_phase", body.phase);
      }
      if (body.holdReleased !== undefined) {
        // Ensure it is saved as a strict boolean
        await redis.set("ecell_global_hold", body.holdReleased === true);
      }
      
      const updatedPhase = await redis.get("ecell_recruitment_phase");
      const rawUpdatedHold = await redis.get("ecell_global_hold");
      const updatedHoldReleased = rawUpdatedHold === true || rawUpdatedHold === "true";

      return NextResponse.json({ 
        success: true, 
        phase: updatedPhase,
        holdReleased: updatedHoldReleased 
      });
    }

    // Handle Master Passkey Authorization
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