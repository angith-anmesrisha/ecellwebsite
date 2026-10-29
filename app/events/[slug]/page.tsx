import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ExternalLink, Layers, MapPin, Quote } from "lucide-react";
import EventLive from "@/components/EventLive";
import EventRegisterPanel from "@/components/EventRegisterPanel";
import { findEventBySlug, formatIst } from "@/lib/eventLookup";
import type { ScheduleItem } from "@/lib/content-types";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

// Pages are built on first visit and then cached like the events list
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await findEventBySlug(slug);
  if (!found) return { title: "Event not found | BIMTECH E-Cell" };
  const { event, meta } = found;
  const description = meta.tagline || event.description.slice(0, 160) || "An event by BIMTECH E-Cell.";
  return {
    title: `${event.title} | BIMTECH E-Cell`,
    description,
    openGraph: { title: event.title, description, type: "website" },
    twitter: { card: "summary_large_image", title: event.title, description },
  };
}

function groupByDay(items: ScheduleItem[]) {
  const sorted = [...items].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const days = new Map<string, ScheduleItem[]>();
  for (const item of sorted) {
    const day = formatIst(item.startsAt, { weekday: "long", day: "numeric", month: "long" }) || "Schedule";
    if (!days.has(day)) days.set(day, []);
    days.get(day)!.push(item);
  }
  return [...days.entries()];
}

const sectionTitle = "font-display text-lg font-bold text-white";
const eyebrow = "font-mono text-[10px] uppercase tracking-widest";

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const found = await findEventBySlug(slug);
  if (!found) notFound();
  const { event, meta, series } = found;
  const isPast = event.status !== "ACTIVE";
  const recap = isPast ? meta.recap : undefined;
  const tiers = [...new Set(meta.sponsors.map((s) => s.tier))];
  const seriesIndex = series ? series.events.findIndex((e) => e.id === event.id) : -1;

  return (
    <div className="min-h-screen text-white py-12 px-4 md:px-8">
      <article className="max-w-5xl mx-auto space-y-12">
        <Link href="/events" className={`${eyebrow} text-white/60 hover:text-white inline-flex items-center gap-1.5`}>
          <ArrowLeft size={12} /> All events
        </Link>

        <header className="space-y-6">
          {event.bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.bannerUrl} alt="" className="w-full max-h-80 object-cover rounded-2xl border border-white/10" />
          )}
          <div className="space-y-3">
            <p className={`${eyebrow} ${isPast ? "text-white/50" : "text-accent-300"}`}>{isPast ? "Past event" : "Upcoming event"}</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">{event.title}</h1>
            {meta.tagline && <p className="text-lg text-white/70 max-w-2xl">{meta.tagline}</p>}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70 font-mono">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-accent-300" />
                {meta.startsAt ? formatIst(meta.startsAt, { dateStyle: "long" }) : event.date}
                {meta.endsAt && formatIst(meta.endsAt, { dateStyle: "long" }) !== formatIst(meta.startsAt, { dateStyle: "long" })
                  ? ` – ${formatIst(meta.endsAt, { dateStyle: "long" })}`
                  : ""}
              </span>
              {meta.venue && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-accent-300" /> {meta.venue}
                </span>
              )}
            </div>
            {series && (
              <p className="text-sm text-nebula-300 flex items-center gap-1.5">
                <Layers size={14} /> Session {seriesIndex + 1} of {series.events.length} in {series.title}
              </p>
            )}
          </div>
        </header>

        <EventLive
          eventId={event.id}
          title={event.title}
          schedule={meta.schedule}
          startsAt={meta.startsAt}
          endsAt={meta.endsAt}
          active={!isPast}
        />

        <div className="grid gap-10 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-12 min-w-0">
            {recap && (
              <section className="space-y-6">
                <h2 className={sectionTitle}>How it went</h2>
                {recap.summary && <p className="text-white/75 leading-relaxed whitespace-pre-line">{recap.summary}</p>}
                {recap.stats.length > 0 && (
                  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {recap.stats.map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-white/10 bg-space-900/60 p-4">
                        <dt className={`${eyebrow} text-white/50`}>{stat.label}</dt>
                        <dd className="text-2xl font-bold text-white mt-1 tabular-nums">{stat.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {recap.winners.length > 0 && (
                  <div className="space-y-2">
                    <h3 className={`${eyebrow} text-accent-300`}>Winners</h3>
                    <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
                      {recap.winners.map((w) => (
                        <li key={`${w.place}-${w.name}`} className="flex gap-4 px-4 py-3 text-sm">
                          <span className="w-24 shrink-0 font-mono text-white/50">{w.place}</span>
                          <span className="text-white">{w.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {recap.quote && (
                  <blockquote className="flex gap-3 text-white/80 italic border-l-2 border-accent-400/50 pl-4">
                    <Quote size={16} className="shrink-0 text-accent-300 mt-1" /> {recap.quote}
                  </blockquote>
                )}
                {recap.photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {recap.photos.map((src) => (
                      <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block aspect-[4/3] overflow-hidden rounded-lg border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </a>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="space-y-3">
              <h2 className={sectionTitle}>About</h2>
              <p className="text-white/75 leading-relaxed whitespace-pre-line">{event.description}</p>
            </section>

            {meta.schedule.length > 0 && (
              <section className="space-y-5">
                <h2 className={sectionTitle}>Schedule</h2>
                {groupByDay(meta.schedule).map(([day, items]) => (
                  <div key={day} className="space-y-2">
                    <h3 className={`${eyebrow} text-accent-300`}>{day}</h3>
                    <ol className="divide-y divide-white/10 rounded-xl border border-white/10">
                      {items.map((item) => (
                        <li key={item.id} className="flex gap-4 px-4 py-3">
                          <span className="w-28 shrink-0 font-mono text-xs text-white/60 tabular-nums pt-0.5">
                            {formatIst(item.startsAt, { hour: "numeric", minute: "2-digit" })}
                            {item.endsAt ? ` – ${formatIst(item.endsAt, { hour: "numeric", minute: "2-digit" })}` : ""}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-white">{item.title}</span>
                            {(item.speaker || item.location) && (
                              <span className="block text-xs text-white/50 mt-0.5">{[item.speaker, item.location].filter(Boolean).join(" · ")}</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </section>
            )}

            {meta.speakers.length > 0 && (
              <section className="space-y-4">
                <h2 className={sectionTitle}>Speakers</h2>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {meta.speakers.map((s) => (
                    <li key={s.name} className="rounded-xl border border-white/10 bg-space-900/60 p-4 space-y-3">
                      {s.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.photo} alt={s.name} className="w-16 h-16 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-accent-500/10 border border-accent-300/20 flex items-center justify-center font-display font-bold text-accent-200">
                          {s.name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-white">{s.name}</p>
                        <p className="text-xs text-white/60">{s.role}</p>
                        {s.link && (
                          <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-accent-300 hover:text-accent-200 inline-flex items-center gap-1 mt-1">
                            Profile <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {meta.rules && (
              <section className="space-y-3">
                <h2 className={sectionTitle}>Rules</h2>
                <p className="text-sm text-white/75 leading-relaxed whitespace-pre-line">{meta.rules}</p>
              </section>
            )}

            {meta.faq.length > 0 && (
              <section className="space-y-3">
                <h2 className={sectionTitle}>Questions</h2>
                <div className="divide-y divide-white/10 rounded-xl border border-white/10">
                  {meta.faq.map((item) => (
                    <details key={item.q} className="group px-4 py-3">
                      <summary className="cursor-pointer list-none text-sm font-semibold text-white flex justify-between gap-4">
                        {item.q}
                        <span className="text-white/40 group-open:rotate-45 transition-transform">+</span>
                      </summary>
                      <p className="mt-2 text-sm text-white/70 leading-relaxed whitespace-pre-line">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {meta.sponsors.length > 0 && (
              <section className="space-y-5">
                <h2 className={sectionTitle}>Partners</h2>
                {tiers.map((tier) => (
                  <div key={tier} className="space-y-2">
                    <h3 className={`${eyebrow} text-white/50`}>{tier}</h3>
                    <ul className="flex flex-wrap gap-3">
                      {meta.sponsors
                        .filter((s) => s.tier === tier)
                        .map((s) => {
                          const inner = s.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.logo} alt={s.name} className="h-10 max-w-[140px] object-contain" />
                          ) : (
                            <span className="text-sm font-semibold text-white">{s.name}</span>
                          );
                          return (
                            <li key={s.name} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center">
                              {s.url ? (
                                <a href={s.url} target="_blank" rel="noopener noreferrer">
                                  {inner}
                                </a>
                              ) : (
                                inner
                              )}
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ))}
              </section>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <EventRegisterPanel event={event} meta={meta} />
            {series && (
              <div className="rounded-2xl border border-white/10 bg-space-900/60 p-5 space-y-3">
                <p className={`${eyebrow} text-nebula-300`}>{series.title}</p>
                {series.description && <p className="text-xs text-white/60 leading-relaxed">{series.description}</p>}
                <ol className="space-y-1.5 text-sm">
                  {series.events.map((e, i) => (
                    <li key={e.id} className="flex gap-2">
                      <span className="font-mono text-white/40 w-5">{i + 1}</span>
                      {e.id === event.id ? (
                        <span className="text-white font-semibold">{e.title}</span>
                      ) : (
                        <Link href={`/events/${e.slug}`} className="text-white/70 hover:text-white">
                          {e.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
                {series.requiredCount > 0 && (
                  <p className="text-[11px] text-white/50">Attend {series.requiredCount} of {series.events.length} sessions to complete the series. Track it in My E-Cell.</p>
                )}
              </div>
            )}
          </aside>
        </div>
      </article>
    </div>
  );
}
