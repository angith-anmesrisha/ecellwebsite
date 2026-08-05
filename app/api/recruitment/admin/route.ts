import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Securely grab the environment variables
const url = process.env.KV_REST_API_URL || "";
const token = process.env.KV_REST_API_TOKEN || "";

// Initialize Redis
const redis = new Redis({
  url: url,
  token: token,
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!url || !token) throw new Error("Missing Redis environment variables.");
    
    const phase = (await redis.get("ecell_recruitment_phase")) || "LOCKED";
    const rawHold = await redis.get("ecell_global_hold");
    const holdReleased = rawHold === true || rawHold === "true";
    
    return NextResponse.json({ success: true, phase, holdReleased });
  } catch (error: any) {
    console.error("Redis GET Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!url || !token) throw new Error("Missing Redis environment variables.");

    const body = await request.json();

    if (body.action === "update-global-phase") {
      if (body.phase !== undefined) {
        await redis.set("ecell_recruitment_phase", body.phase);
      }
      if (body.holdReleased !== undefined) {
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

    const { passkey } = body;
    if (!passkey) {
      return NextResponse.json({ error: "Missing authorization token." }, { status: 400 });
    }

    const masterPasskey = process.env.NEXT_PUBLIC_ADMIN_MASTER_KEY || "ecelladmin2026";
    if (passkey === masterPasskey) {
      return NextResponse.json({ success: true, message: "System bypass authorized successfully." });
    }

    return NextResponse.json({ success: false, error: "Access denied." }, { status: 401 });
  } catch (error: any) {
    console.error("Redis POST Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}