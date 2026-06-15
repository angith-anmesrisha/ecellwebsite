import { NextResponse } from "next/server";
export async function GET() {
  try {
    const targetUrl = process.env.SHEET_WEBHOOK_URL;
    if (!targetUrl) {
      return NextResponse.json({ error: "Google microservice URL missing from environment variables." }, { status: 500 });
    }
    const response = await fetch(`${targetUrl}?action=get-graveyard`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 10 }
    });
    const data = await response.json();
    if (data.success) {
      return NextResponse.json({ success: true, failures: data.data });
    } else {
      return NextResponse.json({ error: data.error || "Failed to parse data cells from graveyard tab." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "E-Cell registry stream connection lost." }, { status: 500 });
  }
}