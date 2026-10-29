import { getEvents } from "./sheets";
import { getAllEventMeta, getSeries } from "./content";
import { defaultEventMeta, eventSlug, type SheetEvent } from "./content-types";

// Finds an event by its page address: a custom slug, the slug of its title, or its sheet ID
export async function findEventBySlug(slug: string) {
  const [events, metaById, series] = await Promise.all([getEvents<SheetEvent>(), getAllEventMeta(), getSeries()]);
  const decoded = decodeURIComponent(slug);
  const event =
    events.find((e) => eventSlug(e, metaById[e.id]) === decoded) || events.find((e) => e.id === decoded) || null;
  if (!event) return null;
  const meta = metaById[event.id] || defaultEventMeta(event.id);
  const inSeries = series.find((s) => s.eventIds.includes(event.id)) || null;
  const seriesEvents = inSeries
    ? inSeries.eventIds
        .map((id) => events.find((e) => e.id === id))
        .filter((e): e is SheetEvent => Boolean(e))
        .map((e) => ({ id: e.id, title: e.title, date: e.date, slug: eventSlug(e, metaById[e.id]) }))
    : [];
  return { event, meta, series: inSeries ? { ...inSeries, events: seriesEvents } : null };
}

export const IST = "Asia/Kolkata";

export function formatIst(iso: string | undefined, options: Intl.DateTimeFormatOptions) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { timeZone: IST, ...options }).format(date);
}
