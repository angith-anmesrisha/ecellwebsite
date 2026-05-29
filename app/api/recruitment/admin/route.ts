import { NextResponse } from "next/server";

export async function GET() {
  try {
    const targetUrl = process.env.SHEET_WEBHOOK_URL;
    if (!targetUrl) throw new Error("Google webhook destination variable is blank.");

    // Append read parameters directly onto your script URL endpoint link
    const readUrl = targetUrl + "?action=read-all";
    const response = await fetch(readUrl, { method: "GET", cache: "no-store" });
    const sheetRows = await response.json();

    return NextResponse.json({ success: true, data: sheetRows.data || [] });
  } catch (error) {
    return NextResponse.json({ success: false, data: [] });
  }
}