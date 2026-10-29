"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, Lock, Plus, Trash2, Upload, ArrowUp, ArrowDown } from "lucide-react";
import { useAdminSession } from "@/lib/useAdminSession";

// Shared building blocks for the newer admin screens, in the console's emerald look

const ADMIN_LINKS = [
  { href: "/admin", label: "Recruitment hub" },
  { href: "/admin/site", label: "Site content" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/competitions", label: "Judging" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-wrap gap-1 bg-zinc-950 p-1 border border-white/10 rounded-xl font-mono">
      {ADMIN_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
            pathname === link.href ? "bg-emerald-500 text-black" : "text-white/60 hover:text-white"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminShell({ title, subtitle, children, actions }: { title: string; subtitle?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  const { isAuthenticated, isChecking, login } = useAdminSession();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isChecking) return <div className="min-h-screen bg-black" />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-mono">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError((await login(password)) || "");
          }}
          className="w-full max-w-sm bg-zinc-950 border border-emerald-500/30 rounded-2xl p-6 space-y-4"
        >
          <div className="text-center space-y-2">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full inline-block">
              <Lock size={18} />
            </div>
            <h1 className="text-sm font-black uppercase tracking-wider">Admin sign-in</h1>
          </div>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-xl px-4 py-2.5 text-center text-xs text-emerald-300 focus:outline-none focus:border-emerald-400" placeholder="Admin password" />
          {error && <p className="text-[11px] text-red-400 text-center">{error}</p>}
          <button className="w-full py-2.5 bg-emerald-600 text-black text-xs font-black uppercase rounded-xl tracking-wider hover:bg-emerald-400 transition">Sign in</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-14 px-4 md:px-8 font-sans antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-black uppercase font-mono tracking-tight text-emerald-400">{title}</h1>
            {subtitle && <p className="text-xs text-white/50 max-w-2xl">{subtitle}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            <AdminNav />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Panel({ title, description, children, actions }: { title: string; description?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-3">
        <div className="space-y-1 min-w-0">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">{title}</h2>
          {description && <p className="text-[11px] text-white/50 leading-relaxed max-w-2xl">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-white/25";

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="text-white/50 uppercase tracking-wider text-[9px] font-bold font-mono">{label}</span>
      {children}
      {hint && <span className="block text-[10px] text-white/35 leading-snug">{hint}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, ...rest }: { value: string | undefined; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return <input {...rest} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass} />;
}

export function TextArea({ value, onChange, rows = 3, ...rest }: { value: string | undefined; onChange: (v: string) => void; rows?: number } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  return <textarea {...rest} rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${inputClass} resize-y leading-relaxed`} />;
}

// datetime-local works in the admin's own timezone; values are stored as ISO strings
const toLocalInput = (iso: string | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function DateTimeInput({ value, onChange }: { value: string | undefined; onChange: (iso: string | undefined) => void }) {
  return (
    <div className="flex gap-1">
      <input
        type="datetime-local"
        value={toLocalInput(value)}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
        className={`${inputClass} [color-scheme:dark]`}
      />
      {value && (
        <button type="button" onClick={() => onChange(undefined)} className="px-2 text-[10px] text-white/50 hover:text-white" aria-label="Clear time">
          Clear
        </button>
      )}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-white/80">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition shrink-0 ${checked ? "bg-emerald-500" : "bg-white/15"}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
      {label}
    </label>
  );
}

export function Button({
  children,
  tone = "primary",
  busy,
  ...rest
}: { tone?: "primary" | "ghost" | "danger"; busy?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const tones = {
    primary: "bg-emerald-500 hover:bg-emerald-400 text-black",
    ghost: "border border-white/10 text-white/80 hover:text-white hover:bg-white/5",
    danger: "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20",
  };
  return (
    <button
      type="button"
      {...rest}
      disabled={busy || rest.disabled}
      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-40 flex items-center gap-1.5 ${tones[tone]} ${rest.className || ""}`}
    >
      {busy && <Loader2 size={12} className="animate-spin" />}
      {children}
    </button>
  );
}

// Repeating rows (schedule items, speakers, FAQ...) with add, remove and reorder
export function ListEditor<T>({
  items,
  onChange,
  blank,
  render,
  addLabel = "Add",
  max = 100,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  blank: () => NoInfer<T>;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
  addLabel?: string;
  max?: number;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start rounded-xl border border-white/10 bg-black/40 p-3">
          <div className="flex-1 min-w-0">{render(item, (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))), i)}</div>
          <div className="flex flex-col gap-1 shrink-0">
            <button type="button" onClick={() => move(i, i - 1)} className="p-1 text-white/40 hover:text-white" aria-label="Move up">
              <ArrowUp size={12} />
            </button>
            <button type="button" onClick={() => move(i, i + 1)} className="p-1 text-white/40 hover:text-white" aria-label="Move down">
              <ArrowDown size={12} />
            </button>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-1 text-red-400/70 hover:text-red-300" aria-label="Remove">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
      {items.length < max && (
        <Button tone="ghost" onClick={() => onChange([...items, blank()])}>
          <Plus size={12} /> {addLabel}
        </Button>
      )}
    </div>
  );
}

// Uploads to Cloudinary with the same unsigned preset as event banners; falls back to a pasted URL
export function ImageField({ value, onChange, label = "Image" }: { value: string | undefined | null; onChange: (url: string) => void; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", preset!);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (data.secure_url) onChange(data.secure_url);
      else setError("Upload failed. Try a smaller image.");
    } catch {
      setError("Upload failed. Try again or paste a link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Field label={label}>
      <div className="flex gap-2 items-center">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-9 h-9 rounded object-cover border border-white/10 shrink-0" />
        )}
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="https://... or /team/photo.jpg" className={inputClass} />
        {cloud && preset && (
          <label className="shrink-0 cursor-pointer px-2.5 py-2 rounded-lg border border-white/10 text-white/70 hover:text-white">
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
        )}
      </div>
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </Field>
  );
}

export function SaveBar({ dirty, busy, message, onSave }: { dirty: boolean; busy: boolean; message: string; onSave: () => void }) {
  return (
    <div className="flex items-center justify-end gap-3">
      {message && <span className="text-[11px] text-white/60">{message}</span>}
      <Button onClick={onSave} busy={busy} disabled={!dirty}>
        Save changes
      </Button>
    </div>
  );
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export async function adminFetch<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const data = await res.json().catch(() => ({ success: false, error: "Bad response from the server." }));
  if (!res.ok || data.success === false) throw new Error(data.error || `Request failed (${res.status}).`);
  return data;
}
