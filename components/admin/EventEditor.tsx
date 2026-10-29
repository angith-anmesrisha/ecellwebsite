"use client";

import React, { useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { Button, DateTimeInput, Field, ImageField, ListEditor, Panel, TextArea, TextInput, Toggle, adminFetch, inputClass, uid } from "./AdminKit";
import { eventSlug, type CompetitionRound, type EventMeta, type Recap, type SheetEvent } from "@/lib/content-types";

type Tab = "basics" | "schedule" | "people" | "info" | "competition" | "recap";
const TABS: { id: Tab; label: string }[] = [
  { id: "basics", label: "Basics & limits" },
  { id: "schedule", label: "Schedule" },
  { id: "people", label: "Speakers & partners" },
  { id: "info", label: "Rules & FAQ" },
  { id: "competition", label: "Teams & rounds" },
  { id: "recap", label: "Recap" },
];

const emptyRecap = (): Recap => ({ summary: "", photos: [], winners: [], stats: [] });

// Everything about an event that the sheet doesn't hold: its page, limits, schedule, teams, rounds and recap
export default function EventEditor({ event, initial, onClose, onSaved }: { event: SheetEvent; initial: EventMeta; onClose: () => void; onSaved: (meta: EventMeta) => void }) {
  const [meta, setMeta] = useState<EventMeta>(initial);
  const [tab, setTab] = useState<Tab>("basics");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);

  const update = (patch: Partial<EventMeta>) => {
    setMeta((m) => ({ ...m, ...patch }));
    setDirty(true);
    setMessage("");
  };
  const recap = meta.recap || emptyRecap();
  const setRecap = (patch: Partial<Recap>) => update({ recap: { ...recap, ...patch } });

  const save = async () => {
    setBusy(true);
    try {
      const data = await adminFetch<{ meta: EventMeta }>("/api/admin/event-meta", { method: "PUT", body: JSON.stringify(meta) });
      setMeta(data.meta);
      onSaved(data.meta);
      setDirty(false);
      setMessage("Saved. The event page is updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  };

  const slug = eventSlug(event, meta);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`Edit ${event.title}`}>
      <div className="max-w-4xl mx-auto bg-zinc-950 border border-white/10 rounded-2xl p-5 space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Event page</p>
            <h2 className="text-lg font-bold text-white">{event.title}</h2>
            <a href={`/events/${slug}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-white/60 hover:text-white inline-flex items-center gap-1 font-mono">
              /events/{slug} <ExternalLink size={10} />
            </a>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${tab === t.id ? "bg-white text-black" : "text-white/60 hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "basics" && (
          <div className="space-y-5">
            <Panel title="Page details">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Page address" hint="Leave empty to use the title">
                  <TextInput value={meta.slug} onChange={(v) => update({ slug: v || undefined })} placeholder={eventSlug(event)} />
                </Field>
                <Field label="Venue">
                  <TextInput value={meta.venue} onChange={(v) => update({ venue: v || undefined })} placeholder="BIMTECH Auditorium, Greater Noida" />
                </Field>
                <Field label="One-line tagline" className="md:col-span-2">
                  <TextInput value={meta.tagline} onChange={(v) => update({ tagline: v || undefined })} placeholder="48 hours to break a startup out of a crisis" />
                </Field>
                <Field label="Starts" hint="Used for the live badge and schedule">
                  <DateTimeInput value={meta.startsAt} onChange={(startsAt) => update({ startsAt })} />
                </Field>
                <Field label="Ends">
                  <DateTimeInput value={meta.endsAt} onChange={(endsAt) => update({ endsAt })} />
                </Field>
              </div>
            </Panel>
            <Panel title="Registration limits" description="Seats are counted per email. When it's full, new sign-ups join the waitlist (if on) and are promoted in order when someone cancels from My E-Cell.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Seat limit" hint="Empty means no limit">
                  <input type="number" min={0} value={meta.capacity ?? ""} onChange={(e) => update({ capacity: e.target.value ? Number(e.target.value) : undefined })} className={inputClass} />
                </Field>
                <div className="flex items-end pb-1">
                  <Toggle checked={meta.waitlist} onChange={(waitlist) => update({ waitlist })} label="Waitlist when full" />
                </div>
                <Field label="Registrations open">
                  <DateTimeInput value={meta.opensAt} onChange={(opensAt) => update({ opensAt })} />
                </Field>
                <Field label="Registrations close">
                  <DateTimeInput value={meta.closesAt} onChange={(closesAt) => update({ closesAt })} />
                </Field>
                <div className="md:col-span-2">
                  <Toggle checked={meta.collectCollege} onChange={(collectCollege) => update({ collectCollege })} label="Ask for college and city (for outside participants)" />
                </div>
              </div>
            </Panel>
          </div>
        )}

        {tab === "schedule" && (
          <Panel title="Schedule" description="Shown on the event page and drives the live Now / Up next box during the event.">
            <ListEditor
              items={meta.schedule}
              onChange={(schedule) => update({ schedule })}
              blank={() => ({ id: uid(), startsAt: meta.startsAt || new Date().toISOString(), title: "" })}
              addLabel="Add slot"
              render={(item, set) => (
                <div className="grid gap-2 md:grid-cols-2">
                  <Field label="Title">
                    <TextInput value={item.title} onChange={(title) => set({ title })} placeholder="Opening keynote" />
                  </Field>
                  <Field label="Speaker">
                    <TextInput value={item.speaker} onChange={(speaker) => set({ speaker: speaker || undefined })} />
                  </Field>
                  <Field label="Starts">
                    <DateTimeInput value={item.startsAt} onChange={(startsAt) => set({ startsAt: startsAt || "" })} />
                  </Field>
                  <Field label="Ends">
                    <DateTimeInput value={item.endsAt} onChange={(endsAt) => set({ endsAt })} />
                  </Field>
                  <Field label="Room" className="md:col-span-2">
                    <TextInput value={item.location} onChange={(location) => set({ location: location || undefined })} placeholder="Seminar Hall 1" />
                  </Field>
                </div>
              )}
            />
          </Panel>
        )}

        {tab === "people" && (
          <div className="space-y-5">
            <Panel title="Speakers">
              <ListEditor
                items={meta.speakers}
                onChange={(speakers) => update({ speakers })}
                blank={() => ({ name: "", role: "" })}
                addLabel="Add speaker"
                render={(item, set) => (
                  <div className="grid gap-2 md:grid-cols-2">
                    <Field label="Name">
                      <TextInput value={item.name} onChange={(name) => set({ name })} />
                    </Field>
                    <Field label="Role">
                      <TextInput value={item.role} onChange={(role) => set({ role })} placeholder="Founder, Acme" />
                    </Field>
                    <ImageField value={item.photo} onChange={(photo) => set({ photo: photo || undefined })} label="Photo" />
                    <Field label="Profile link">
                      <TextInput value={item.link} onChange={(link) => set({ link: link || undefined })} />
                    </Field>
                  </div>
                )}
              />
            </Panel>
            <Panel title="Sponsors and partners" description="Grouped by tier on the event page, in the order you add them.">
              <ListEditor
                items={meta.sponsors}
                onChange={(sponsors) => update({ sponsors })}
                blank={() => ({ name: "", tier: "Title sponsor" })}
                addLabel="Add partner"
                render={(item, set) => (
                  <div className="grid gap-2 md:grid-cols-2">
                    <Field label="Name">
                      <TextInput value={item.name} onChange={(name) => set({ name })} />
                    </Field>
                    <Field label="Tier">
                      <TextInput value={item.tier} onChange={(tier) => set({ tier })} placeholder="Title sponsor, Gold, Community partner" />
                    </Field>
                    <ImageField value={item.logo} onChange={(logo) => set({ logo: logo || undefined })} label="Logo" />
                    <Field label="Website">
                      <TextInput value={item.url} onChange={(url) => set({ url: url || undefined })} />
                    </Field>
                  </div>
                )}
              />
            </Panel>
          </div>
        )}

        {tab === "info" && (
          <div className="space-y-5">
            <Panel title="Rules">
              <TextArea rows={8} value={meta.rules} onChange={(rules) => update({ rules: rules || undefined })} placeholder="Eligibility, team rules, judging criteria..." />
            </Panel>
            <Panel title="Frequently asked questions">
              <ListEditor
                items={meta.faq}
                onChange={(faq) => update({ faq })}
                blank={() => ({ q: "", a: "" })}
                addLabel="Add question"
                render={(item, set) => (
                  <div className="space-y-2">
                    <Field label="Question">
                      <TextInput value={item.q} onChange={(q) => set({ q })} />
                    </Field>
                    <Field label="Answer">
                      <TextArea rows={2} value={item.a} onChange={(a) => set({ a })} />
                    </Field>
                  </div>
                )}
              />
            </Panel>
          </div>
        )}

        {tab === "competition" && (
          <div className="space-y-5">
            <Panel title="Teams" description="With teams on, the first person creates a team and gets a code; teammates join with that code. Everyone still gets their own pass.">
              <div className="grid gap-4 md:grid-cols-3 items-end">
                <Toggle checked={meta.team.enabled} onChange={(enabled) => update({ team: { ...meta.team, enabled } })} label="Team event" />
                <Field label="Smallest team">
                  <input type="number" min={1} value={meta.team.minSize} onChange={(e) => update({ team: { ...meta.team, minSize: Number(e.target.value) } })} className={inputClass} />
                </Field>
                <Field label="Largest team">
                  <input type="number" min={1} value={meta.team.maxSize} onChange={(e) => update({ team: { ...meta.team, maxSize: Number(e.target.value) } })} className={inputClass} />
                </Field>
              </div>
            </Panel>
            <Panel
              title="Competition rounds"
              description="Entrants submit a link per round from My E-Cell. Judges score against the rubric. Only entrants you shortlist from a round can submit to the next one. Manage judges and results on the Judging page."
            >
              <ListEditor<CompetitionRound>
                items={meta.rounds}
                onChange={(rounds) => update({ rounds })}
                blank={() => ({ id: uid(), name: `Round ${meta.rounds.length + 1}`, submissionLabel: "Pitch deck link", rubric: [{ id: uid(), label: "Overall", max: 10 }], published: false, publishTop: 10 })}
                addLabel="Add round"
                max={10}
                render={(round, set) => (
                  <div className="space-y-3">
                    <div className="grid gap-2 md:grid-cols-2">
                      <Field label="Round name">
                        <TextInput value={round.name} onChange={(name) => set({ name })} />
                      </Field>
                      <Field label="What entrants submit">
                        <TextInput value={round.submissionLabel} onChange={(submissionLabel) => set({ submissionLabel })} />
                      </Field>
                      <Field label="Submissions open">
                        <DateTimeInput value={round.submissionsOpenAt} onChange={(submissionsOpenAt) => set({ submissionsOpenAt })} />
                      </Field>
                      <Field label="Submissions close">
                        <DateTimeInput value={round.submissionsCloseAt} onChange={(submissionsCloseAt) => set({ submissionsCloseAt })} />
                      </Field>
                    </div>
                    <Field label="Rubric">
                      <ListEditor
                        items={round.rubric}
                        onChange={(rubric) => set({ rubric })}
                        blank={() => ({ id: uid(), label: "", max: 10 })}
                        addLabel="Add criterion"
                        max={20}
                        render={(c, setC) => (
                          <div className="grid grid-cols-[1fr_90px] gap-2">
                            <TextInput value={c.label} onChange={(label) => setC({ label })} placeholder="Problem clarity" />
                            <input type="number" min={1} value={c.max} onChange={(e) => setC({ max: Number(e.target.value) })} className={inputClass} aria-label="Maximum score" />
                          </div>
                        )}
                      />
                    </Field>
                    <div className="grid gap-2 md:grid-cols-2 items-end">
                      <Toggle checked={round.published} onChange={(published) => set({ published })} label="Show results on the event page" />
                      <Field label="How many names to show">
                        <input type="number" min={1} value={round.publishTop} onChange={(e) => set({ publishTop: Number(e.target.value) })} className={inputClass} />
                      </Field>
                    </div>
                  </div>
                )}
              />
            </Panel>
          </div>
        )}

        {tab === "recap" && (
          <Panel title="Recap" description="Shown at the top of the event page once the event is marked PAST in the sheet.">
            <div className="space-y-4">
              <Field label="Summary">
                <TextArea rows={4} value={recap.summary} onChange={(summary) => setRecap({ summary })} />
              </Field>
              <Field label="Highlight quote">
                <TextInput value={recap.quote} onChange={(quote) => setRecap({ quote: quote || undefined })} />
              </Field>
              <Field label="Numbers">
                <ListEditor
                  items={recap.stats}
                  onChange={(stats) => setRecap({ stats })}
                  blank={() => ({ label: "", value: "" })}
                  addLabel="Add number"
                  max={8}
                  render={(stat, set) => (
                    <div className="grid grid-cols-2 gap-2">
                      <TextInput value={stat.label} onChange={(label) => set({ label })} placeholder="Participants" />
                      <TextInput value={stat.value} onChange={(value) => set({ value })} placeholder="1,200" />
                    </div>
                  )}
                />
              </Field>
              <Field label="Winners">
                <ListEditor
                  items={recap.winners}
                  onChange={(winners) => setRecap({ winners })}
                  blank={() => ({ place: "", name: "" })}
                  addLabel="Add winner"
                  render={(w, set) => (
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <TextInput value={w.place} onChange={(place) => set({ place })} placeholder="1st" />
                      <TextInput value={w.name} onChange={(name) => set({ name })} placeholder="Team Night Owls (IIM Indore)" />
                    </div>
                  )}
                />
              </Field>
              <Field label="Photos">
                <ListEditor
                  items={recap.photos}
                  onChange={(photos) => setRecap({ photos })}
                  blank={() => ""}
                  addLabel="Add photo"
                  max={40}
                  render={(photo, _set, i) => (
                    <ImageField value={photo} onChange={(url) => setRecap({ photos: recap.photos.map((p, j) => (j === i ? url : p)) })} label={`Photo ${i + 1}`} />
                  )}
                />
              </Field>
              {meta.recap && (
                <Button tone="danger" onClick={() => update({ recap: undefined })}>
                  Remove recap
                </Button>
              )}
            </div>
          </Panel>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4 sticky bottom-0 bg-zinc-950">
          {message && <span className="text-[11px] text-white/60">{message}</span>}
          <Button tone="ghost" onClick={onClose}>
            Close
          </Button>
          <Button onClick={save} busy={busy} disabled={!dirty}>
            Save event page
          </Button>
        </div>
      </div>
    </div>
  );
}
