import { NextResponse } from "next/server";

export async function GET() {
  try {
    const targetUrl = process.env.SHEET_WEBHOOK_URL;
    if (!targetUrl) {
      return NextResponse.json({ error: "Google microservice URL configuration missing." }, { status: 500 });
    }

    
    const response = await fetch(`${targetUrl}?action=get-alumni`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 10 } 
    });

    const data = await response.json();
    
    if (data.success) {
      return NextResponse.json({ success: true, alumni: data.data });
    } else {
      return NextResponse.json({ error: data.error || "Failed to read database cells." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "E-Cell directory stream communication timeout." }, { status: 500 });
  }
}