import { NextResponse } from "next/server";

// Latest AI stories from Hacker News, fetched on the server and cached for 30 minutes,
// so visitors get an instant response and a slow or blocked HN API doesn't empty the section.
// Rendered per request so a failed fetch is never cached; successful HN responses are
// cached by the fetch data cache and the CDN header below.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch("https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story&hitsPerPage=6", {
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error(`HN responded ${res.status}`);
    const data = await res.json();

    const stories = data.hits.map((hit: any) => ({
      objectID: hit.objectID,
      title: hit.title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      author: hit.author,
      points: hit.points || 10,
      created_at: hit.created_at,
    }));

    return NextResponse.json(
      { success: true, stories },
      { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } },
    );
  } catch (error) {
    console.error("Trends fetch failed:", error);
    return NextResponse.json({ success: false, stories: [] }, { status: 502 });
  }
}
