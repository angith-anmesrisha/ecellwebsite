"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import {
  AdminShell,
  Button,
  DateTimeInput,
  Field,
  ImageField,
  ListEditor,
  Panel,
  SaveBar,
  TextArea,
  TextInput,
  Toggle,
  adminFetch,
  inputClass,
  uid,
} from "@/components/admin/AdminKit";
import {
  HOME_SECTION_LABELS,
  type Announcement,
  type CasePool,
  type QuizQuestion,
  type RecruitmentConfig,
  type Series,
  type SheetEvent,
  type SiteSettings,
  type TeamMember,
} from "@/lib/content-types";

interface Setup {
  redis: boolean;
  mail: "resend" | "smtp";
  turnstile: boolean;
  sheetSecret: boolean;
  passSecret: boolean;
  uploads: boolean;
}

type Tab = "popup" | "layout" | "announcements" | "team" | "series" | "recruitment";
const TABS: { id: Tab; label: string }[] = [
  { id: "popup", label: "Featured popup & hero" },
  { id: "layout", label: "Home layout & menu" },
  { id: "announcements", label: "Announcements" },
  { id: "team", label: "Team" },
  { id: "series", label: "Workshop series" },
  { id: "recruitment", label: "Recruitment" },
];

// Saves one content key and reports back
function useSaver<T>(key: string, initial: T | null, onSaved?: (value: T) => void) {
  const [value, setValue] = useState<T | null>(initial);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => setValue(initial), [initial]);
  const update = (next: T) => {
    setValue(next);
    setDirty(true);
    setMessage("");
  };
  const save = async () => {
    if (value === null) return;
    setBusy(true);
    try {
      const data = await adminFetch<{ value: T }>("/api/admin/content", { method: "PUT", body: JSON.stringify({ key, value }) });
      setValue(data.value);
      onSaved?.(data.value);
      setDirty(false);
      setMessage("Saved. Live on the site now.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  };
  return { value, update, save, dirty, busy, message };
}

function SetupStatus({ setup }: { setup: Setup }) {
  const items = [
    { ok: setup.redis, label: "Redis (Upstash) connected", fix: "Set KV_REST_API_URL and KV_REST_API_TOKEN. Nothing on this page can be saved without it." },
    { ok: setup.mail === "resend", label: setup.mail === "resend" ? "Email through Resend" : "Email through SMTP (Gmail caps around 500 a day)", fix: "Set RESEND_API_KEY and MAIL_FROM for bulk and national-scale email." },
    { ok: setup.turnstile, label: "Bot check (Cloudflare Turnstile)", fix: "Set NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY to turn it on for public forms." },
    { ok: setup.sheetSecret, label: "Sheet secret", fix: "Set SHEET_WEBHOOK_SECRET and check it in the Apps Script, so only this site can write to the sheet." },
    { ok: setup.passSecret, label: "Pass signing secret", fix: "Set PASS_SECRET. Until then passes are signed with the admin password, so changing it voids issued QR codes." },
    { ok: setup.uploads, label: "Image uploads (Cloudinary)", fix: "Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_PRESET. You can still paste image links." },
  ];
  if (items.every((i) => i.ok)) return null;
  return (
    <Panel title="Setup checklist" description="Things to set in Vercel (Project settings > Environment variables), then redeploy.">
      <ul className="grid gap-2 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.label} className="flex gap-2 text-[11px]">
            {item.ok ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> : <CircleAlert size={14} className="text-amber-400 shrink-0" />}
            <span>
              <span className={item.ok ? "text-white/70" : "text-white"}>{item.label}</span>
              {!item.ok && <span className="block text-white/45">{item.fix}</span>}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function PopupTab({ initial, onSaved }: { initial: SiteSettings; onSaved: (v: SiteSettings) => void }) {
  const s = useSaver<SiteSettings>("settings", initial, onSaved);
  if (!s.value) return null;
  const v = s.value;
  const popup = (patch: Partial<SiteSettings["popup"]>) => s.update({ ...v, popup: { ...v.popup, ...patch } });
  return (
    <div className="space-y-6">
      <Panel title="Featured event popup" description="The dialog that opens on the home page. Point it at your next big event.">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-6">
            <Toggle checked={v.popup.enabled} onChange={(enabled) => popup({ enabled })} label="Show the popup" />
            <Toggle checked={v.popup.hideAfterEnd} onChange={(hideAfterEnd) => popup({ hideAfterEnd })} label="Stop showing it after the event ends" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Small label above the title">
              <TextInput value={v.popup.eyebrow} onChange={(eyebrow) => popup({ eyebrow })} />
            </Field>
            <Field label="Title" hint="Press Enter for a second line.">
              <TextArea rows={2} value={v.popup.title} onChange={(title) => popup({ title })} />
            </Field>
            <Field label="Date text" hint="Shown as written, e.g. Nov 2 & 3">
              <TextInput value={v.popup.dateLabel} onChange={(dateLabel) => popup({ dateLabel })} />
            </Field>
            <Field label="Venue">
              <TextInput value={v.popup.location} onChange={(location) => popup({ location })} />
            </Field>
            <Field label="Starts (countdown target)">
              <DateTimeInput value={v.popup.startsAt} onChange={(startsAt) => popup({ startsAt: startsAt || "" })} />
            </Field>
            <Field label="Ends">
              <DateTimeInput value={v.popup.endsAt} onChange={(endsAt) => popup({ endsAt: endsAt || "" })} />
            </Field>
            <Field label="Message" className="md:col-span-2">
              <TextArea value={v.popup.body} onChange={(body) => popup({ body })} />
            </Field>
            <Field label="Button text">
              <TextInput value={v.popup.ctaLabel} onChange={(ctaLabel) => popup({ ctaLabel })} />
            </Field>
            <Field label="Button link" hint="A page on this site like /events/startup-heist, or a full URL">
              <TextInput value={v.popup.ctaHref} onChange={(ctaHref) => popup({ ctaHref })} />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel title="Home page text and main button">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tagline above the headline">
            <TextInput value={v.heroTagline} onChange={(heroTagline) => s.update({ ...v, heroTagline })} />
          </Field>
          <Field label="Current board year" hint="The team carousel shows members with this tenure">
            <TextInput value={v.currentTenure} onChange={(currentTenure) => s.update({ ...v, currentTenure })} placeholder="2026-27" />
          </Field>
          <Field label="Intro under the headline" className="md:col-span-2">
            <TextArea value={v.heroSubtitle} onChange={(heroSubtitle) => s.update({ ...v, heroSubtitle })} />
          </Field>
          <Field label="Menu button text" hint="Top-right button, e.g. Apply Portal or Register">
            <TextInput value={v.primaryCta.label} onChange={(label) => s.update({ ...v, primaryCta: { ...v.primaryCta, label } })} />
          </Field>
          <Field label="Menu button hover text">
            <TextInput value={v.primaryCta.subLabel} onChange={(subLabel) => s.update({ ...v, primaryCta: { ...v.primaryCta, subLabel } })} />
          </Field>
          <Field label="Menu button link">
            <TextInput value={v.primaryCta.href} onChange={(href) => s.update({ ...v, primaryCta: { ...v.primaryCta, href } })} />
          </Field>
        </div>
      </Panel>
      <SaveBar dirty={s.dirty} busy={s.busy} message={s.message} onSave={s.save} />
    </div>
  );
}

function LayoutTab({ initial, onSaved }: { initial: SiteSettings; onSaved: (v: SiteSettings) => void }) {
  const s = useSaver<SiteSettings>("settings", initial, onSaved);
  if (!s.value) return null;
  const v = s.value;
  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= v.sections.length) return;
    const next = [...v.sections];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    s.update({ ...v, sections: next });
  };
  return (
    <div className="space-y-6">
      <Panel title="Home page sections" description="Turn sections on or off and change their order. Menu links to hidden sections disappear too.">
        <ul className="space-y-1.5">
          {v.sections.map((section, i) => (
            <li key={section.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
              <button
                type="button"
                onClick={() => s.update({ ...v, sections: v.sections.map((x) => (x.id === section.id ? { ...x, visible: !x.visible } : x)) })}
                className={section.visible ? "text-emerald-400" : "text-white/30"}
                aria-label={section.visible ? "Hide section" : "Show section"}
              >
                {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <span className={`flex-1 text-xs ${section.visible ? "text-white" : "text-white/40 line-through"}`}>{HOME_SECTION_LABELS[section.id]}</span>
              <button type="button" onClick={() => moveSection(i, i - 1)} className="p-1 text-white/40 hover:text-white" aria-label="Move up">
                <ArrowUp size={12} />
              </button>
              <button type="button" onClick={() => moveSection(i, i + 1)} className="p-1 text-white/40 hover:text-white" aria-label="Move down">
                <ArrowDown size={12} />
              </button>
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-white/40">The team and sandbox sections sit together, wherever the first of the two is placed.</p>
      </Panel>

      <Panel title="Menu links" description="Links in the top menu. Use #section links for home page sections or /page links for other pages.">
        <ListEditor
          items={v.nav}
          onChange={(nav) => s.update({ ...v, nav })}
          blank={() => ({ id: uid(), label: "New link", tagline: "", href: "/events", visible: true })}
          addLabel="Add link"
          max={8}
          render={(item, update) => (
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] items-end">
              <Field label="Label">
                <TextInput value={item.label} onChange={(label) => update({ label })} />
              </Field>
              <Field label="Hover text">
                <TextInput value={item.tagline} onChange={(tagline) => update({ tagline })} />
              </Field>
              <Field label="Link">
                <TextInput value={item.href} onChange={(href) => update({ href })} />
              </Field>
              <Toggle checked={item.visible} onChange={(visible) => update({ visible })} label="Shown" />
            </div>
          )}
        />
      </Panel>
      <SaveBar dirty={s.dirty} busy={s.busy} message={s.message} onSave={s.save} />
    </div>
  );
}

function AnnouncementsTab({ initial, events, onSaved }: { initial: Announcement[]; events: SheetEvent[]; onSaved: (v: Announcement[]) => void }) {
  const s = useSaver<Announcement[]>("announcements", initial, onSaved);
  if (!s.value) return null;
  return (
    <div className="space-y-6">
      <Panel
        title="Announcements"
        description="Pinned notices show as a bar at the bottom of every page (newest first). Notices tied to an event also show on that event's page under Updates. Visitors see changes within a minute."
      >
        <ListEditor<Announcement>
          items={s.value}
          onChange={s.update}
          blank={() => ({ id: uid(), text: "", pinned: true, createdAt: new Date().toISOString() })}
          addLabel="Add announcement"
          render={(a, update) => (
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Message" className="md:col-span-2">
                <TextArea rows={2} value={a.text} onChange={(text) => update({ text })} maxLength={300} placeholder="Venue changed to Auditorium 2. Doors open at 9:30." />
              </Field>
              <Field label="Link (optional)">
                <TextInput value={a.link} onChange={(link) => update({ link: link || undefined })} placeholder="/events/startup-heist" />
              </Field>
              <Field label="Link text">
                <TextInput value={a.linkLabel} onChange={(linkLabel) => update({ linkLabel: linkLabel || undefined })} placeholder="Details" />
              </Field>
              <Field label="Show from (optional)">
                <DateTimeInput value={a.startsAt} onChange={(startsAt) => update({ startsAt })} />
              </Field>
              <Field label="Hide after (optional)">
                <DateTimeInput value={a.endsAt} onChange={(endsAt) => update({ endsAt })} />
              </Field>
              <Field label="Event (optional)">
                <select value={a.eventId || ""} onChange={(e) => update({ eventId: e.target.value || undefined })} className={inputClass}>
                  <option value="">Not tied to an event</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end pb-1">
                <Toggle checked={a.pinned} onChange={(pinned) => update({ pinned })} label="Show in the site-wide bar" />
              </div>
            </div>
          )}
        />
      </Panel>
      <SaveBar dirty={s.dirty} busy={s.busy} message={s.message} onSave={s.save} />
    </div>
  );
}

function TeamTab({ initial, currentTenure, onSaved }: { initial: TeamMember[]; currentTenure: string; onSaved: (v: TeamMember[]) => void }) {
  const s = useSaver<TeamMember[]>("team", initial, onSaved);
  const [filter, setFilter] = useState(currentTenure);
  if (!s.value) return null;
  const tenures = [...new Set([currentTenure, ...s.value.map((m) => m.tenure)])].filter(Boolean).sort().reverse();
  const shown = s.value.map((m, i) => ({ m, i })).filter(({ m }) => !filter || m.tenure === filter);

  return (
    <div className="space-y-6">
      <Panel
        title="Team members"
        description="Everyone who has been on the board. The home page shows members whose tenure matches the current board year; the Our boards page shows every year."
        actions={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`${inputClass} w-auto`}>
            <option value="">All years</option>
            {tenures.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        }
      >
        <div className="space-y-2">
          {shown.map(({ m, i }) => (
            <div key={m.id} className="grid gap-2 md:grid-cols-[1fr_1fr_110px_auto] items-end rounded-xl border border-white/10 bg-black/40 p-3">
              <Field label="Name">
                <TextInput value={m.name} onChange={(name) => s.update(s.value!.map((x, j) => (j === i ? { ...x, name } : x)))} />
              </Field>
              <Field label="Role">
                <TextInput value={m.role} onChange={(role) => s.update(s.value!.map((x, j) => (j === i ? { ...x, role } : x)))} />
              </Field>
              <Field label="Tenure">
                <TextInput value={m.tenure} onChange={(tenure) => s.update(s.value!.map((x, j) => (j === i ? { ...x, tenure } : x)))} />
              </Field>
              <Button tone="danger" onClick={() => s.update(s.value!.filter((_, j) => j !== i))}>
                Remove
              </Button>
              <ImageField value={m.image} onChange={(image) => s.update(s.value!.map((x, j) => (j === i ? { ...x, image: image || null } : x)))} label="Photo" />
              <Field label="LinkedIn" className="md:col-span-3">
                <TextInput value={m.linkedin} onChange={(linkedin) => s.update(s.value!.map((x, j) => (j === i ? { ...x, linkedin } : x)))} />
              </Field>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button tone="ghost" onClick={() => s.update([...s.value!, { id: uid(), name: "", role: "", image: null, linkedin: "", tenure: filter || currentTenure }])}>
              Add member
            </Button>
          </div>
        </div>
      </Panel>
      <SaveBar dirty={s.dirty} busy={s.busy} message={s.message} onSave={s.save} />
    </div>
  );
}

function SeriesTab({ initial, events, onSaved }: { initial: Series[]; events: SheetEvent[]; onSaved: (v: Series[]) => void }) {
  const s = useSaver<Series[]>("series", initial, onSaved);
  if (!s.value) return null;
  return (
    <div className="space-y-6">
      <Panel
        title="Workshop series"
        description="Group sessions into a series, like a 6-part bootcamp. Event pages show the series, and students see how many sessions they've attended (from gate check-ins) in My E-Cell."
      >
        <ListEditor<Series>
          items={s.value}
          onChange={s.update}
          blank={() => ({ id: uid(), title: "", description: "", eventIds: [], requiredCount: 0 })}
          addLabel="Add series"
          render={(series, update) => (
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Name">
                <TextInput value={series.title} onChange={(title) => update({ title })} placeholder="Founder Bootcamp 2026" />
              </Field>
              <Field label="Sessions needed to complete" hint="0 means all of them">
                <input type="number" min={0} value={series.requiredCount} onChange={(e) => update({ requiredCount: Number(e.target.value) })} className={inputClass} />
              </Field>
              <Field label="Description" className="md:col-span-2">
                <TextArea rows={2} value={series.description} onChange={(description) => update({ description })} />
              </Field>
              <Field label="Sessions, in order" className="md:col-span-2">
                <div className="space-y-1.5">
                  {series.eventIds.map((id, i) => (
                    <div key={id} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-white/40 w-5">{i + 1}</span>
                      <span className="flex-1">{events.find((e) => e.id === id)?.title || id}</span>
                      <button type="button" onClick={() => update({ eventIds: series.eventIds.filter((x) => x !== id) })} className="text-red-400/70 hover:text-red-300 text-[10px]">
                        Remove
                      </button>
                    </div>
                  ))}
                  <select
                    value=""
                    onChange={(e) => e.target.value && update({ eventIds: [...series.eventIds, e.target.value] })}
                    className={inputClass}
                  >
                    <option value="">Add a session…</option>
                    {events
                      .filter((e) => !series.eventIds.includes(e.id))
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title} ({e.date})
                        </option>
                      ))}
                  </select>
                </div>
              </Field>
            </div>
          )}
        />
      </Panel>
      <SaveBar dirty={s.dirty} busy={s.busy} message={s.message} onSave={s.save} />
    </div>
  );
}

const DEPTS = [
  { id: "ops", label: "Operations" },
  { id: "media", label: "PR & Media" },
  { id: "spons", label: "Corporate alliances" },
] as const;

const lines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

function RecruitmentTab({ initial, onSaved }: { initial: RecruitmentConfig; onSaved: (v: RecruitmentConfig) => void }) {
  const s = useSaver<RecruitmentConfig>("recruitment", initial, onSaved);
  if (!s.value) return null;
  const v = s.value;
  const setPool = (dept: (typeof DEPTS)[number]["id"], patch: Partial<CasePool>) => {
    const current = v.casePools[dept] || { triggers: [], escalations: [], constraints: [] };
    s.update({ ...v, casePools: { ...v.casePools, [dept]: { ...current, ...patch } } });
  };
  return (
    <div className="space-y-6">
      <Panel title="Schedule" description="Each switch happens by itself when its time passes. Changing the phase by hand in the recruitment hub overrides the schedule until the next scheduled switch.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Countdown target on the locked portal" hint="Defaults to the open time">
            <DateTimeInput value={v.launchAt} onChange={(launchAt) => s.update({ ...v, launchAt })} />
          </Field>
          <Field label="Open applications">
            <DateTimeInput value={v.openAt} onChange={(openAt) => s.update({ ...v, openAt })} />
          </Field>
          <Field label="Move to review (standby)">
            <DateTimeInput value={v.standbyAt} onChange={(standbyAt) => s.update({ ...v, standbyAt })} />
          </Field>
          <Field label="Close the drive (completed)">
            <DateTimeInput value={v.completedAt} onChange={(completedAt) => s.update({ ...v, completedAt })} />
          </Field>
        </div>
      </Panel>

      <Panel
        title={`Round 1 quiz (${v.questions.length ? `${v.questions.length} custom questions` : "built-in 30 questions"})`}
        description="Add questions to replace the built-in quiz for the next drive. Leave the list empty to keep the built-in one. Changing questions mid-drive changes the answer key for everyone who hasn't submitted yet."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Marks for a right answer">
            <input type="number" value={v.marksCorrect} onChange={(e) => s.update({ ...v, marksCorrect: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Marks for a wrong answer">
            <input type="number" value={v.marksWrong} onChange={(e) => s.update({ ...v, marksWrong: Number(e.target.value) })} className={inputClass} />
          </Field>
        </div>
        <ListEditor<QuizQuestion>
          items={v.questions}
          onChange={(questions) => s.update({ ...v, questions })}
          blank={() => ({ q: "", options: ["", "", "", ""], answer: 0 })}
          addLabel="Add question"
          render={(q, update, index) => (
            <div className="space-y-2">
              <Field label={`Question ${index + 1}`}>
                <TextArea rows={2} value={q.q} onChange={(text) => update({ q: text })} />
              </Field>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, i) => (
                  <label key={i} className="flex items-center gap-2">
                    <input type="radio" name={`answer-${index}`} checked={q.answer === i} onChange={() => update({ answer: i })} className="accent-emerald-500" aria-label={`Option ${i + 1} is correct`} />
                    <input value={opt} onChange={(e) => update({ options: q.options.map((o, j) => (j === i ? e.target.value : o)) })} placeholder={`Option ${i + 1}`} className={inputClass} />
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-white/40">Pick the radio button next to the correct option.</p>
            </div>
          )}
        />
      </Panel>

      <Panel title="Round 2 case" description="Each candidate gets one trigger, one escalation and one instruction from their department's lists. Leave a department empty to use the built-in scenarios. One item per line.">
        <Field label="Minimum words">
          <input type="number" min={10} value={v.caseMinWords} onChange={(e) => s.update({ ...v, caseMinWords: Number(e.target.value) })} className={`${inputClass} max-w-[140px]`} />
        </Field>
        <div className="space-y-4">
          {DEPTS.map((dept) => {
            const pool = v.casePools[dept.id] || { triggers: [], escalations: [], constraints: [] };
            return (
              <details key={dept.id} className="rounded-xl border border-white/10 p-3">
                <summary className="cursor-pointer text-xs font-bold text-white">
                  {dept.label} {pool.triggers.length ? `(${pool.triggers.length} custom triggers)` : "(built-in)"}
                </summary>
                <div className="grid gap-3 md:grid-cols-3 mt-3">
                  {(["triggers", "escalations", "constraints"] as const).map((part) => (
                    <Field key={part} label={part === "constraints" ? "Instructions" : part}>
                      <textarea
                        rows={5}
                        defaultValue={pool[part].join("\n")}
                        onBlur={(e) => setPool(dept.id, { [part]: lines(e.target.value) })}
                        className={`${inputClass} resize-y`}
                      />
                    </Field>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </Panel>
      <SaveBar dirty={s.dirty} busy={s.busy} message={s.message} onSave={s.save} />
    </div>
  );
}

export default function SiteContentAdmin() {
  const [tab, setTab] = useState<Tab>("popup");
  const [data, setData] = useState<{
    settings: SiteSettings;
    announcements: Announcement[];
    team: TeamMember[];
    series: Series[];
    recruitment: RecruitmentConfig;
    setup: Setup;
  } | null>(null);
  const [events, setEvents] = useState<SheetEvent[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/content")
      .then(setData)
      .catch((e) => setError(e.message));
    fetch("/api/events?mode=events")
      .then((r) => r.json())
      .then((d) => d.success && setEvents(d.data))
      .catch(() => {});
  }, []);

  return (
    <AdminShell title="Site content" subtitle="Change what the website shows without a code change. Saved changes go live within a few seconds.">
      {error && <p className="text-xs text-red-400">{error}</p>}
      {data && (
        <>
          <SetupStatus setup={data.setup} />
          <div className="flex flex-wrap gap-1 border-b border-white/10 pb-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${tab === t.id ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === "popup" && <PopupTab initial={data.settings} onSaved={(settings) => setData({ ...data, settings })} />}
          {tab === "layout" && <LayoutTab initial={data.settings} onSaved={(settings) => setData({ ...data, settings })} />}
          {tab === "announcements" && (
            <AnnouncementsTab initial={data.announcements} events={events} onSaved={(announcements) => setData({ ...data, announcements })} />
          )}
          {tab === "team" && <TeamTab initial={data.team} currentTenure={data.settings.currentTenure} onSaved={(team) => setData({ ...data, team })} />}
          {tab === "series" && <SeriesTab initial={data.series} events={events} onSaved={(series) => setData({ ...data, series })} />}
          {tab === "recruitment" && <RecruitmentTab initial={data.recruitment} onSaved={(recruitment) => setData({ ...data, recruitment })} />}
        </>
      )}
    </AdminShell>
  );
}
