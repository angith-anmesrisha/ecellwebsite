"use client";

import { useAdminSession } from "@/lib/useAdminSession";
import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Lock,
  Camera,
  Pencil,
  Save,
} from "lucide-react";
import GateScanner from "@/components/GateScanner";
import EventEditor from "@/components/admin/EventEditor";
import EventOps from "@/components/admin/EventOps";
import { AdminNav } from "@/components/admin/AdminKit";
import { defaultEventMeta, type EventMeta } from "@/lib/content-types";

interface EventItem {
  id: string;
  title: string;
  date: string;
  description: string;
  status: string;
  customFields: string[];
  bannerUrl?: string;
}

interface RegistrationRecord {
  regId: string;
  eventId: string;
  eventTitle: string;
  name: string;
  email: string;
  rollNumber: string;
  customAnswers: Record<string, string>;
}

const isSafeBannerUrl = (url: string) => {
  const trimmed = url.trim();
  return !trimmed || trimmed.startsWith("https://") || trimmed.startsWith("http://") || trimmed.startsWith("/");
};

export default function AdminEventsPanel() {
  const { isAuthenticated, isChecking: isSessionChecking, login } = useAdminSession();
  const [passwordInput, setPasswordInput] = useState("");
  const [securityError, setSecurityError] = useState("");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [metaById, setMetaById] = useState<Record<string, EventMeta>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [currentFieldInput, setCurrentFieldInput] = useState("");
  const [selectedEventFilter, setSelectedEventFilter] = useState("all");

  // Edit event form state
  const [editingFormEvent, setEditingFormEvent] = useState<EventItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editBannerUrl, setEditBannerUrl] = useState("");
  const [editCustomFields, setEditCustomFields] = useState<string[]>([]);
  const [editFieldInput, setEditFieldInput] = useState("");
  const [isEditUploading, setIsEditUploading] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  async function fetchAdminData() {
    try {
      setIsLoading(true);
      const [eventsRes, regsRes, metaRes] = await Promise.all([
        fetch("/api/events?mode=events", { cache: "no-store" }),
        fetch("/api/events?mode=registrations", { cache: "no-store" }),
        fetch("/api/admin/event-meta", { cache: "no-store" }),
      ]);
      const eventsData = await eventsRes.json();
      const regsData = await regsRes.json();
      const metaData = await metaRes.json().catch(() => ({}));
      if (eventsData.success && Array.isArray(eventsData.data)) setEvents(eventsData.data);
      if (regsData.success && Array.isArray(regsData.data)) setRegistrations(regsData.data);
      if (metaData.success && metaData.meta) setMetaById(metaData.meta);
    } catch (err) {
      console.error("Administrative Sync Error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSecurityCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = await login(passwordInput);
    setSecurityError(error || "");
  };

  async function uploadBannerFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload-banner", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.url || !isSafeBannerUrl(String(data.url))) {
      throw new Error(data.error || "Banner upload failed or returned an unsupported URL.");
    }
    return String(data.url);
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setUploadError("");
    try {
      const url = await uploadBannerFile(file);
      if (url) {
        setBannerUrl(url);
      }
    } catch (err: any) {
      setUploadError(err?.message || "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsEditUploading(true);
    try {
      const url = await uploadBannerFile(file);
      if (url) {
        setEditBannerUrl(url);
      }
    } catch (err: any) {
      alert(err?.message || "Image upload failed.");
    } finally {
      setIsEditUploading(false);
    }
  };

  const addCustomFieldTag = () => {
    const trimmed = currentFieldInput.trim();
    if (!trimmed) return;
    if (!customFields.includes(trimmed)) {
      setCustomFields([...customFields, trimmed]);
    }
    setCurrentFieldInput("");
  };

  const removeCustomFieldTag = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const openEditFormModal = (ev: EventItem) => {
    setEditingFormEvent(ev);
    setEditTitle(ev.title);
    setEditDate(ev.date);
    setEditDesc(ev.description || "");
    setEditStatus(ev.status || "ACTIVE");
    setEditBannerUrl(isSafeBannerUrl(ev.bannerUrl || "") ? ev.bannerUrl || "" : "");
    setEditCustomFields(Array.isArray(ev.customFields) ? [...ev.customFields] : []);
    setEditFieldInput("");
  };

  const addEditFieldTag = () => {
    const trimmed = editFieldInput.trim();
    if (!trimmed) return;
    if (!editCustomFields.includes(trimmed)) {
      setEditCustomFields([...editCustomFields, trimmed]);
    }
    setEditFieldInput("");
  };

  const handleSaveEditedForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFormEvent || !editTitle.trim() || !editDate.trim()) return;
    if (!isSafeBannerUrl(editBannerUrl)) {
      alert("Banner must be uploaded via Cloudinary, not a base64 string.");
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-event",
          id: editingFormEvent.id,
          title: editTitle.trim(),
          date: editDate.trim(),
          description: editDesc,
          status: editStatus,
          bannerUrl: editBannerUrl.trim(),
          customFields: editCustomFields,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Failed to update event form.");
        return;
      }
      setEditingFormEvent(null);
      await fetchAdminData();
    } catch {
      alert("Failed to update event form.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;
    if (!isSafeBannerUrl(bannerUrl)) {
      alert("Banner must be uploaded via Cloudinary, not a base64 string.");
      return;
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-event",
          title: newTitle,
          date: newDate,
          description: newDesc,
          status: newStatus,
          customFields: customFields,
          bannerUrl: bannerUrl.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Event published successfully!");
        setNewTitle("");
        setNewDate("");
        setNewDesc("");
        setBannerUrl("");
        setUploadError("");
        setCustomFields([]);
        fetchAdminData();
      } else {
        alert(data.error || "Failed to build event node.");
      }
    } catch {
      alert("Failed to build event node.");
    }
  };

  const updateEvent = async (ev: EventItem, patch: Partial<EventItem> | null) => {
    if (
      patch === null &&
      !confirm(`Delete "${ev.title}"? Its registrations stay in the database and the CSV download.`)
    ) {
      return;
    }
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          patch === null ? { action: "delete-event", id: ev.id } : { action: "update-event", id: ev.id, ...patch }
        ),
      });
      const data = await res.json();
      if (!data.success) alert(data.error || "Couldn't update the event.");
      fetchAdminData();
    } catch {
      alert("Couldn't update the event.");
    }
  };

  const filteredRegistrations = registrations.filter(
    (r) => selectedEventFilter === "all" || r.eventId === selectedEventFilter
  );

  if (isSessionChecking) return <div className="min-h-screen bg-black" />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans antialiased">
        <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl text-center">
          <div className="space-y-2">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full inline-block mx-auto">
              <Lock size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Admin Authentication</h1>
            <p className="text-xs text-white/40">Enter the E-Cell system master key to open administrative event parameters.</p>
          </div>

          <form onSubmit={handleSecurityCheck} className="space-y-3 text-left">
            <div className="space-y-1">
              <label className="text-white/50 uppercase tracking-wider text-[9px] font-bold">Master Security Key</label>
              <input
                required
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                placeholder="••••••••••••"
              />
            </div>

            {securityError && <p className="text-[11px] text-red-400 font-medium font-mono">{securityError}</p>}

            <button
              type="submit"
              className="w-full py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-200 transition cursor-pointer mt-2"
            >
              Verify Key Axis
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 md:px-8 font-sans antialiased">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black uppercase font-mono tracking-tight text-blue-500">E-Cell Event Console</h1>
            <p className="text-xs text-white/40">Manage dynamic event parameters and review multi-cohort data registration histories.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <AdminNav />
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Camera size={12} /> Launch Gate Scanner
            </button>
            <div className="flex gap-2 bg-zinc-950 p-1 border border-white/10 rounded-xl">
              <button
                onClick={() => setActiveTab("create")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "create" ? "bg-white text-black" : "text-white/60 hover:text-white"
                }`}
              >
                Configure New Event
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "history" ? "bg-white text-black" : "text-white/60 hover:text-white"
                }`}
              >
                Registration History Log
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-xs text-white/40 font-mono animate-pulse">
            Syncing administrative database data matrices...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {activeTab === "create" && (
              <>
                <form onSubmit={handleCreateEvent} className="lg:col-span-5 bg-zinc-950 border border-white/10 p-6 rounded-2xl space-y-4 text-xs">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400 border-b border-white/5 pb-2">
                    Event Form Builder
                  </h2>

                  <div className="space-y-1">
                    <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Event Title</label>
                    <input
                      required
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g., TEDxBIMTECH 2026"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Event Date</label>
                      <input
                        required
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Initial Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="ACTIVE">ACTIVE (Open)</option>
                        <option value="PAST">PAST (Archived)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Event Banner Image</label>
                    <div className="border border-dashed border-white/20 rounded-xl p-4 bg-white/[0.02] flex flex-col items-center justify-center text-center hover:bg-white/[0.04] transition relative group">
                      {isUploading ? (
                        <div className="py-2 flex flex-col items-center gap-1.5 text-white/40 font-mono text-[11px]">
                          <Loader2 size={16} className="animate-spin text-blue-400" /> Uploading media asset...
                        </div>
                      ) : bannerUrl ? (
                        <div className="space-y-2 w-full">
                          <img src={bannerUrl} alt="Uploaded thumbnail" className="w-full h-20 object-cover rounded-lg border border-white/10" />
                          <button
                            type="button"
                            onClick={() => setBannerUrl("")}
                            className="text-[10px] text-red-400 hover:text-red-300 underline block mx-auto cursor-pointer"
                          >
                            Remove & Replace
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer py-2 flex flex-col items-center justify-center w-full h-full">
                          <Upload size={16} className="text-white/40 group-hover:text-white transition mb-1" />
                          <span className="text-white/60 group-hover:text-white transition font-sans text-[11px]">
                            Click to upload banner file
                          </span>
                          <span className="text-[9px] text-white/30 mt-0.5">PNG, JPG or WEBP up to 5MB</span>
                          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                    {uploadError && <p className="text-[10px] text-red-400 font-mono pt-1">{uploadError}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Brief Description</label>
                    <textarea
                      rows={3}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="Provide basic information for student viewers..."
                    />
                  </div>

                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold block">
                      Inject Custom Form Questions
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentFieldInput}
                        onChange={(e) => setCurrentFieldInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomFieldTag();
                          }
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                        placeholder="e.g., GitHub Link, Team Size"
                      />
                      <button
                        type="button"
                        onClick={addCustomFieldTag}
                        className="px-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {customFields.map((field, index) => (
                        <span
                          key={field}
                          className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[10px] font-mono flex items-center gap-1"
                        >
                          {field}{" "}
                          <X
                            size={10}
                            className="cursor-pointer text-white/50 hover:text-white"
                            onClick={() => removeCustomFieldTag(index)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 mt-2 bg-white text-black font-sans font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} /> Publish Event Form
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-white/40 uppercase flex items-center gap-2">
                    Active Form Ecosystem Nodes ({events.length})
                  </h3>
                  <div className="space-y-3 max-h-[560px] overflow-y-auto pr-2">
                    {events.map((ev) => (
                      <div key={ev.id} className="bg-zinc-950 border border-white/10 p-4 rounded-xl flex justify-between items-start text-xs">
                        <div className="pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{ev.title}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                                ev.status === "ACTIVE"
                                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                  : "bg-white/5 border border-white/10 text-white/40"
                              }`}
                            >
                              {ev.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/40 mt-1 font-mono">
                            ID: {ev.id} | Date: {ev.date}
                          </p>
                          {ev.description && <p className="text-[11px] text-white/60 mt-1.5">{ev.description}</p>}
                          {ev.bannerUrl && (
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
                              <ImageIcon size={12} /> Banner attached
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(ev.customFields || []).map((f) => (
                              <span key={f} className="bg-white/5 px-2 py-0.5 rounded text-[9px] text-white/60 font-mono">
                                Q: {f}
                              </span>
                            ))}
                          </div>
                          {metaById[ev.id] && (
                            <p className="mt-2 text-[10px] font-mono text-white/40">
                              {[
                                metaById[ev.id].capacity ? `${metaById[ev.id].capacity} seats` : null,
                                metaById[ev.id].team.enabled ? "teams" : null,
                                metaById[ev.id].rounds.length ? `${metaById[ev.id].rounds.length} rounds` : null,
                                metaById[ev.id].schedule.length ? "schedule" : null,
                                metaById[ev.id].recap ? "recap" : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => openEditFormModal(ev)}
                            className="px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Pencil size={10} /> Edit form
                          </button>
                          <button onClick={() => setEditingId(ev.id)} className="px-3 py-1.5 bg-white text-black rounded-lg text-[10px] font-bold uppercase cursor-pointer">
                            Edit page
                          </button>
                          <button
                            onClick={() => setRunningId(ev.id)}
                            className="px-3 py-1.5 border border-white/10 text-white/80 hover:text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                          >
                            Run event
                          </button>
                          <button
                            onClick={() => updateEvent(ev, { status: ev.status === "ACTIVE" ? "CLOSED" : "ACTIVE" })}
                            className="px-3 py-1.5 border border-white/10 text-white/60 hover:text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                          >
                            {ev.status === "ACTIVE" ? "Close" : "Reopen"}
                          </button>
                          <button
                            onClick={() => updateEvent(ev, null)}
                            className="px-3 py-1.5 border border-red-500/30 text-red-300 hover:bg-red-500/10 rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "history" &&
              (() => {
                const cohortCounts: Record<string, number> = {};
                filteredRegistrations.forEach((r) => {
                  const roll = (r.rollNumber || "").toUpperCase();
                  let segment = "OTHER COHORTS";

                  if (roll.includes("PGDM")) segment = "PGDM GENERAL";
                  else if (roll.includes("IB")) segment = "INTL. BUSINESS";
                  else if (roll.includes("RM")) segment = "RETAIL MGMT";
                  else if (roll.includes("INS")) segment = "INSURANCE";

                  cohortCounts[segment] = (cohortCounts[segment] || 0) + 1;
                });

                return (
                  <div className="lg:col-span-12 space-y-6 font-mono text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-zinc-950 border border-white/10 rounded-xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <h3 className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                            {"// COHORT DISTRIBUTION RATIOS"}
                          </h3>
                          <span className="text-[9px] text-white/30">MAPPED SUBMISSIONS</span>
                        </div>

                        <div className="space-y-3.5">
                          {Object.entries(cohortCounts).map(([cohort, count]) => {
                            const total = filteredRegistrations.length || 1;
                            const percentage = Math.round((count / total) * 100);
                            return (
                              <div key={cohort} className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-white/70 font-bold">{cohort}</span>
                                  <span className="text-blue-400 font-bold">
                                    {count} Pass Issued ({percentage}%)
                                  </span>
                                </div>
                                <div className="w-full h-2.5 bg-black border border-white/5 rounded overflow-hidden p-0.5 flex gap-0.5">
                                  {Array(10)
                                    .fill(0)
                                    .map((_, barIdx) => (
                                      <div
                                        key={barIdx}
                                        className={`h-full flex-1 transition-all duration-300 rounded-sm ${
                                          barIdx < Math.round(percentage / 10) ? "bg-blue-500" : "bg-zinc-900"
                                        }`}
                                      />
                                    ))}
                                </div>
                              </div>
                            );
                          })}
                          {Object.keys(cohortCounts).length === 0 && (
                            <p className="text-[10px] text-white/30 italic py-2">
                              {"// Awaiting registration matrix records to compile metrics..."}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="bg-zinc-950 border border-white/10 rounded-xl p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-4">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                              {"// SYSTEM VELOCITY MATRIX"}
                            </h3>
                            <span className="text-[9px] text-emerald-400 font-bold animate-pulse">● LIVE CHANNEL</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-center font-mono">
                            <div className="bg-black border border-white/5 p-4 rounded-xl">
                              <p className="text-[9px] text-white/40 uppercase">Total Tickets</p>
                              <p className="text-2xl font-black text-white mt-1">{filteredRegistrations.length}</p>
                            </div>
                            <div className="bg-black border border-white/5 p-4 rounded-xl">
                              <p className="text-[9px] text-white/40 uppercase">Open Pipelines</p>
                              <p className="text-2xl font-black text-white mt-1">
                                {events.filter((e) => e.status === "ACTIVE").length}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-black border border-white/5 rounded-lg p-3 text-[9px] text-white/30 space-y-0.5 mt-4">
                          <p>{"// LINK IDENTITY SYSTEM STATUS : ACTIVE"}</p>
                          <p>{"// PIPELINE SOURCE COMPILING : REG_ROLL_FIELD_AXIS"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-950 p-4 border border-white/10 rounded-xl gap-4 mt-6">
                      <div className="flex items-center gap-2">
                        <span className="text-white/60 font-bold uppercase text-[11px]">Filter Log by Event:</span>
                        <select
                          value={selectedEventFilter}
                          onChange={(e) => setSelectedEventFilter(e.target.value)}
                          className="bg-black border border-white/10 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none"
                        >
                          <option value="all">Show All Historical Registrations</option>
                          {events.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="text-[11px] font-bold text-white/40 flex items-center gap-3">
                        Synced Row Blocks: {filteredRegistrations.length} Entries
                        <a
                          href={`/api/admin/export?what=registrations${
                            selectedEventFilter === "all" ? "" : `&eventId=${encodeURIComponent(selectedEventFilter)}`
                          }`}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-[10px] uppercase"
                        >
                          Download CSV
                        </a>
                      </div>
                    </div>

                    <div className="border border-white/10 rounded-xl overflow-hidden bg-zinc-950 shadow-2xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-[10px] text-white/40 uppercase tracking-wider">
                              <th className="p-3">Pass ID</th>
                              <th className="p-3">Target Event</th>
                              <th className="p-3">Candidate</th>
                              <th className="p-3">Email</th>
                              <th className="p-3">Roll Number</th>
                              <th className="p-3">Custom Form Responses</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-[11px] text-white/80">
                            {filteredRegistrations.map((rec) => (
                              <tr key={rec.regId} className="hover:bg-white/[0.02] transition">
                                <td className="p-3 font-bold text-blue-400">{rec.regId}</td>
                                <td className="p-3 font-sans font-bold text-white max-w-[150px] truncate">{rec.eventTitle}</td>
                                <td className="p-3 font-sans text-white/90">{rec.name}</td>
                                <td className="p-3 text-white/60">{rec.email}</td>
                                <td className="p-3 text-white/60">{rec.rollNumber}</td>
                                <td className="p-3">
                                  <div className="space-y-1 text-[10px]">
                                    {Object.entries(rec.customAnswers || {}).map(([key, val]) => (
                                      <div key={key} className="text-white/40">
                                        <strong className="text-blue-300 font-medium">{key}:</strong>{" "}
                                        <span className="text-white/70">{val}</span>
                                      </div>
                                    ))}
                                    {Object.keys(rec.customAnswers || {}).length === 0 && (
                                      <span className="text-white/20 italic">None required</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        )}
      </div>

      {/* EDIT EVENT FORM MODAL */}
      {editingFormEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditedForm}
            className="w-full max-w-lg bg-zinc-950 border border-white/15 rounded-2xl p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">Edit Event & Form Fields</h3>
                <p className="text-[10px] text-white/40 font-mono">ID: {editingFormEvent.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingFormEvent(null)}
                className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Event Title</label>
              <input
                required
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Event Date</label>
                <input
                  required
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="PAST">PAST</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Banner Image</label>
              <div className="border border-dashed border-white/20 rounded-xl p-3 bg-white/[0.02] space-y-2">
                {isEditUploading ? (
                  <div className="py-2 flex items-center justify-center gap-2 text-white/50 font-mono text-[11px]">
                    <Loader2 size={14} className="animate-spin text-blue-400" /> Uploading banner...
                  </div>
                ) : editBannerUrl ? (
                  <div className="space-y-2">
                    <img src={editBannerUrl} alt="Event banner" className="w-full h-24 object-cover rounded-lg border border-white/10" />
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-blue-400 hover:underline cursor-pointer">
                        Replace image
                        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleEditImageUpload} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditBannerUrl("")}
                        className="text-[10px] text-red-400 hover:underline cursor-pointer"
                      >
                        Remove banner
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer py-2 flex flex-col items-center justify-center text-center">
                    <Upload size={15} className="text-white/40 mb-1" />
                    <span className="text-[11px] text-white/70">Upload banner image (PNG, JPG, WEBP up to 5MB)</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleEditImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Brief Description</label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="space-y-2 border-t border-white/10 pt-3">
              <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold block">
                Custom Form Questions
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editFieldInput}
                  onChange={(e) => setEditFieldInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEditFieldTag();
                    }
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Add a question field..."
                />
                <button
                  type="button"
                  onClick={addEditFieldTag}
                  className="px-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {editCustomFields.map((field, idx) => (
                  <span
                    key={`${field}-${idx}`}
                    className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[10px] font-mono flex items-center gap-1"
                  >
                    {field}
                    <X
                      size={10}
                      className="cursor-pointer text-white/50 hover:text-white"
                      onClick={() => setEditCustomFields(editCustomFields.filter((_, i) => i !== idx))}
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingFormEvent(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingEdit}
                className="px-4 py-2 rounded-xl bg-white text-black font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-zinc-200 disabled:opacity-50 cursor-pointer"
              >
                {isSavingEdit ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Save Form Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {isScannerOpen && <GateScanner onClose={() => setIsScannerOpen(false)} events={events} />}
      {editingId && events.find((e) => e.id === editingId) && (
        <EventEditor
          event={events.find((e) => e.id === editingId)!}
          initial={metaById[editingId] || defaultEventMeta(editingId)}
          onClose={() => setEditingId(null)}
          onSaved={(meta) => setMetaById((m) => ({ ...m, [meta.eventId]: meta }))}
        />
      )}
      {runningId && events.find((e) => e.id === runningId) && (
        <EventOps event={events.find((e) => e.id === runningId)!} onClose={() => setRunningId(null)} />
      )}
    </div>
  );
}