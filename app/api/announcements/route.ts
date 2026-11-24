import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { CONTENT_TAG, readAnnouncements } from "@/lib/content";
import { isAnnouncementLive } from "@/lib/content-types";

export const revalidate = 300;

const getCachedAnnouncements = unstable_cache(
  async () => readAnnouncements(),
  ["public-announcements"],
  { tags: [CONTENT_TAG], revalidate: 300 },
);

export async function GET() {
  const all = await getCachedAnnouncements();
  const live = all
    .filter((a) => isAnnouncementLive(a))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json(
    { success: true, announcements: live },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        "CDN-Cache-Control": "public, s-maxage=300",
      },
    },
  );
}