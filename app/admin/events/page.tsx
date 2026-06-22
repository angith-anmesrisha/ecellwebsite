"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, BarChart2, ListFilter, Users, Upload, Image as ImageIcon, Loader2, Lock } from "lucide-react";

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

export default function AdminEventsPanel() {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [securityError, setSecurityError] = useState("");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");

  
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStatus, setNewStatus] = useState("ACTIVE");
  
  
  const [bannerUrl, setBannerUrl] = useState(""); 
  const [isUploading, setIsUploading] = useState(false);
  
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [currentFieldInput, setCurrentFieldInput] = useState("");
  const [selectedEventFilter, setSelectedEventFilter] = useState("all");

  useEffect(() => {
    
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [eventsRes, regsRes] = await Promise.all([
        fetch("/api/events?mode=events"),
        fetch("/api/events?mode=registrations")
      ]);
      const eventsData = await eventsRes.json();
      const regsData = await regsRes.json();
      if (eventsData.success) setEvents(eventsData.data);
      if (regsData.success) setRegistrations(regsData.data);
    } catch (err) {
      console.error("Administrative Sync Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  
 const handleSecurityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const globalMasterKey = process.env.NEXT_PUBLIC_ADMIN_MASTER_KEY;

    // Added local fallback strings matching your main panel gates
    if (
      passwordInput === globalMasterKey || 
      passwordInput === "ecelladmin2026" 
     
    ) {
      setIsAuthenticated(true);
      setSecurityError("");
    } else {
      setSecurityError("Invalid master key. Access denied.");
    }
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (data.secure_url) {
        setBannerUrl(data.secure_url);
        alert("Banner image uploaded successfully!");
      }
    } catch (err) {
      alert("Image upload failed. Please try a smaller file.");
    } finally {
      setIsUploading(false);
    }
  };

  const addCustomFieldTag = () => {
    if (!currentFieldInput.trim()) return;
    if (!customFields.includes(currentFieldInput.trim())) {
      setCustomFields([...customFields, currentFieldInput.trim()]);
    }
    setCurrentFieldInput("");
  };

  const removeCustomFieldTag = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

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
          bannerUrl: bannerUrl 
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Event published successfully!");
        setNewTitle("");
        setNewDate("");
        setNewDesc("");
        setBannerUrl("");
        setCustomFields([]);
        fetchAdminData();
      }
    } catch (err) {
      alert("Failed to build event node.");
    }
  };

  const filteredRegistrations = registrations.filter(
    r => selectedEventFilter === "all" || r.eventId === selectedEventFilter
  );

  
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

            {securityError && (
              <p className="text-[11px] text-red-400 font-medium font-mono">{securityError}</p>
            )}

            <button type="submit" className="w-full py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-200 transition cursor-pointer mt-2">
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
        
        {/* CONTROL BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black uppercase font-mono tracking-tight text-blue-500">E-Cell Event Console</h1>
            <p className="text-xs text-white/40">Manage dynamic event parameters and review multi-cohort data registration histories.</p>
          </div>
          <div className="flex gap-2 bg-zinc-950 p-1 border border-white/10 rounded-xl">
            <button onClick={() => setActiveTab("create")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === "create" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}>Configure New Event</button>
            <button onClick={() => setActiveTab("history")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === "history" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}>Registration History Log</button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-xs text-white/40 font-mono animate-pulse">Syncing administrative database data matrices...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* FORM BUILDER */}
            {activeTab === "create" && (
              <>
                <form onSubmit={handleCreateEvent} className="lg:col-span-5 bg-zinc-950 border border-white/10 p-6 rounded-2xl space-y-4 text-xs">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400 border-b border-white/5 pb-2">Event Form Builder</h2>
                  
                  <div className="space-y-1">
                    <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Event Title</label>
                    <input required type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="e.g., TEDxBIMTECH 2026" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Event Date</label>
                      <input required type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Initial Status</label>
                      <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                        <option value="ACTIVE">ACTIVE (Open)</option>
                        <option value="PAST">PAST (Archived)</option>
                      </select>
                    </div>
                  </div>

                  {/* BANNER FILE UPLOAD */}
                  <div className="space-y-1">
                    <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Event Banner Image</label>
                    <div className="border border-dashed border-white/20 rounded-xl p-4 bg-white/[0.02] flex flex-col items-center justify-center text-center hover:bg-white/[0.04] transition relative group">
                      {isUploading ? (
                        <div className="py-2 flex flex-col items-center gap-1.5 text-white/40 font-mono text-[11px]">
                          <Loader2 size={16} className="animate-spin text-blue-400" /> Uploading media asset...
                        </div>
                      ) : bannerUrl ? (
                        <div className="space-y-2 w-full">
                          <img src={bannerUrl} alt="Uploaded thumbnail" className="w-full h-16 object-cover rounded-lg border border-white/10" />
                          <button type="button" onClick={() => setBannerUrl("")} className="text-[10px] text-red-400 hover:text-red-300 underline block mx-auto cursor-pointer">Remove & Replace</button>
                        </div>
                      ) : (
                        <label className="cursor-pointer py-2 flex flex-col items-center justify-center w-full h-full">
                          <Upload size={16} className="text-white/40 group-hover:text-white transition mb-1" />
                          <span className="text-white/60 group-hover:text-white transition font-sans text-[11px]">Click to upload banner file</span>
                          <span className="text-[9px] text-white/30 mt-0.5">PNG, JPG or JPEG up to 5MB</span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Brief Description</label>
                    <textarea rows={3} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none" placeholder="Provide basic information for student viewers..." />
                  </div>

                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold block">Inject Custom Form Questions</label>
                    <div className="flex gap-2">
                      <input type="text" value={currentFieldInput} onChange={(e) => setCurrentFieldInput(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-blue-500" placeholder="e.g., GitHub Link, Team Size" />
                      <button type="button" onClick={addCustomFieldTag} className="px-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition">Add</button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {customFields.map((field, index) => (
                        <span key={field} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[10px] font-mono flex items-center gap-1">
                          {field} <X size={10} className="cursor-pointer text-white/50 hover:text-white" onClick={() => removeCustomFieldTag(index)} />
                        </span>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2.5 mt-2 bg-white text-black font-sans font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-1.5 cursor-pointer">
                    <Plus size={14} /> Publish Event Form
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-white/40 uppercase flex items-center gap-2">
                    Active Form Ecosystem Nodes ({events.length})
                  </h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {events.map(ev => (
                      <div key={ev.id} className="bg-zinc-950 border border-white/10 p-4 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{ev.title}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${ev.status === 'ACTIVE' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-white/5 border border-white/10 text-white/40'}`}>{ev.status}</span>
                          </div>
                          <p className="text-[11px] text-white/40 mt-1 font-mono">ID: {ev.id} | Date: {ev.date}</p>
                          {ev.bannerUrl && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                              <ImageIcon size={12} /> Banner attached
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {ev.customFields.map(f => (
                              <span key={f} className="bg-white/5 px-2 py-0.5 rounded text-[9px] text-white/60 font-mono">Q: {f}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* REGISTRATION LOG TAB */}
            {activeTab === "history" && (
              <div className="lg:col-span-12 space-y-4 font-mono text-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-950 p-4 border border-white/10 rounded-xl gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 font-bold uppercase text-[11px]">Filter Log by Event:</span>
                    <select value={selectedEventFilter} onChange={(e) => setSelectedEventFilter(e.target.value)} className="bg-black border border-white/10 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none">
                      <option value="all">Show All Historical Registrations</option>
                      {events.map(e => (
                        <option key={e.id} value={e.id}>{e.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-[11px] font-bold text-white/40 flex items-center gap-1.5">
                    Synced Row Blocks: {filteredRegistrations.length} Entries
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
                                {Object.entries(rec.customAnswers).map(([key, val]) => (
                                  <div key={key} className="text-white/40">
                                    <strong className="text-blue-300 font-medium">{key}:</strong> <span className="text-white/70">{val}</span>
                                  </div>
                                ))}
                                {Object.keys(rec.customAnswers).length === 0 && <span className="text-white/20 italic">None required</span>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}