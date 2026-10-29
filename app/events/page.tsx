import type { Metadata } from "next";
import EventsView from "@/components/EventsView";
import { getEvents } from "@/lib/sheets";
import { getAllEventMeta, getSeries } from "@/lib/content";
import type { SheetEvent } from "@/lib/content-types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events & Workshops | BIMTECH E-Cell",
  description: "Register for upcoming E-Cell events, workshops and competitions at BIMTECH.",
};

export default async function EventsPage() {
  const [events, meta, series] = await Promise.all([getEvents<SheetEvent>(), getAllEventMeta(), getSeries()]);
  return <EventsView initialEvents={events} meta={meta} series={series} />;
}
