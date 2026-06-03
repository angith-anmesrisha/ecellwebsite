import { NextResponse } from "next/server";

const TARGET_URL = process.env.SHEET_WEBHOOK_URL;

// GET: Fetch master events list or complete registration history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "events"; // Accepts "events" or "registrations"
    
    const action = mode === "registrations" ? "get-all-registrations" : "get-events";
    
    const response = await fetch(`${TARGET_URL}?action=${action}`, {
      method: "GET",
      next: { revalidate: 0 } // Bypasses caching for instantaneous admin visibility
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server connection failure." }, { status: 500 });
  }
}

// POST: Direct router for creating events or logging candidate signups
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch(TARGET_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to push form records." }, { status: 500 });
  }
}