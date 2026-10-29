import { NextResponse } from "next/server";
import { readAnnouncements } from "@/lib/content";
import { isAnnouncementLive } from "@/lib/content-types";

export const dynamic = "force-dynamic";

// Notices that are live right now. Cached at the edge for 15 seconds so a busy day
// costs a handful of Redis reads a minute, and a new notice still shows almost at once.
export async function GET(request: Request) {
  const eventId = new URL(request.url).searchParams.get("eventId");
  const all = await readAnnouncements();
  const live = all
    .filter((a) => isAnnouncementLive(a))
    .filter((a) => (eventId ? a.eventId === eventId : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json(
    { success: true, announcements: live },
    { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" } },
  );
}
