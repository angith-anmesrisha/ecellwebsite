import { NextResponse } from "next/server";
import { getAlumni } from "@/lib/sheets";

export async function GET() {
  try {
    return NextResponse.json({ success: true, alumni: await getAlumni() });
  } catch (error) {
    console.error("Alumni read failed:", error);
    return NextResponse.json({ error: "Couldn't load the alumni directory." }, { status: 500 });
  }
}
