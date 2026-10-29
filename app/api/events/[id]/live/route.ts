import { NextResponse } from "next/server";
import { readAnnouncements, readEventMeta } from "@/lib/content";
import { seatsTaken } from "@/lib/registrations";
import { buildLeaderboard } from "@/lib/judging";
import { isAnnouncementLive, registrationWindow } from "@/lib/content-types";

export const dynamic = "force-dynamic";

// What an event page refreshes while it's open: seats left, live notices for this event,
// and any leaderboards the organisers have published. Cached at the edge for 15 seconds.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const meta = await readEventMeta(id);
    const [taken, announcements] = await Promise.all([
      meta.capacity ? seatsTaken(id).catch(() => null) : Promise.resolve(null),
      readAnnouncements(),
    ]);

    const leaderboards = [];
    for (const round of meta.rounds.filter((r) => r.published)) {
      const rows = await buildLeaderboard(id, meta, round).catch(() => []);
      leaderboards.push({
        roundId: round.id,
        name: round.name,
        rows: rows
          .filter((r) => r.rank > 0)
          .slice(0, round.publishTop || 10)
          .map((r) => ({ rank: r.rank, name: r.entrant.name, advanced: r.advanced })),
      });
    }

    return NextResponse.json(
      {
        success: true,
        window: registrationWindow(meta),
        capacity: meta.capacity || null,
        seatsLeft: meta.capacity && taken !== null ? Math.max(0, meta.capacity - taken) : null,
        waitlist: meta.waitlist,
        announcements: announcements
          .filter((a) => a.eventId === id && isAnnouncementLive(a))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        leaderboards,
      },
      { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" } },
    );
  } catch (error) {
    console.error("Live event data failed:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
