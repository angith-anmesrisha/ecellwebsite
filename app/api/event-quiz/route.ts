import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Explicitly use Vercel KV environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const EVENT_REDIS_KEY = "ecell_nov_event_quiz_unlocked";

export async function GET() {
  try {
    const unlocked = await redis.get(EVENT_REDIS_KEY);
    return NextResponse.json({ success: true, unlocked: unlocked === true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (body.action === "toggle-event-quiz") {
      await redis.set(EVENT_REDIS_KEY, Boolean(body.unlocked));
      return NextResponse.json({ success: true, unlocked: Boolean(body.unlocked) });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}