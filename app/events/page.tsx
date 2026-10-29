import type { Metadata } from "next";
import EventsView, { type EventItem } from "@/components/EventsView";
import { getEvents } from "@/lib/sheets";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events & Workshops | BIMTECH E-Cell",
  description: "Register for upcoming E-Cell events, workshops and competitions at BIMTECH.",
};

export default async function EventsPage() {
  const events = await getEvents<EventItem>();
  return <EventsView initialEvents={events} />;
}
