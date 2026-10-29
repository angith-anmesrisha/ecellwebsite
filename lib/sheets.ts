// Server-side reads from the Google Sheets web app, cached so public pages render
// with data already in the HTML instead of fetching after load.
const PUBLIC_REVALIDATE_SECONDS = 300;

async function readSheet<T>(action: string, field: "data" = "data"): Promise<T[]> {
  const targetUrl = process.env.SHEET_WEBHOOK_URL;
  if (!targetUrl) return [];
  try {
    const res = await fetch(`${targetUrl}?action=${action}`, {
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [action] },
    });
    const json = await res.json();
    return json.success && Array.isArray(json[field]) ? json[field] : [];
  } catch (error) {
    console.error(`Sheet read failed for ${action}:`, error);
    return [];
  }
}

export const getEvents = <T>() => readSheet<T>("get-events");
export const getAlumni = <T>() => readSheet<T>("get-alumni");
export const getGraveyard = <T>() => readSheet<T>("get-graveyard");
