import { NextResponse } from "next/server";
import { getGraveyard } from "@/lib/sheets";

export async function GET() {
  try {
    return NextResponse.json({ success: true, failures: await getGraveyard() });
  } catch (error) {
    console.error("Graveyard read failed:", error);
    return NextResponse.json({ error: "Couldn't load the graveyard." }, { status: 500 });
  }
}
