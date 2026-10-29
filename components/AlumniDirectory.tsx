"use client";

import React, { useState } from "react";
import { Search, Mail, GraduationCap, Briefcase, Zap, Plus, X, Loader2, Users } from "lucide-react";
import EmptyState from "./EmptyState";

export interface Alumnus {
  id: string;
  name: string;
  batch: string;
  company: string;
  role: string;
  superpower: string;
  linkedin: string;
  email: string;
  // Optional headshot URL from the sheet; cards fall back to initials
  photo?: string;
}

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function AlumnusAvatar({ alumnus }: { alumnus: Alumnus }) {
  const [failed, setFailed] = useState(false);
  if (alumnus.photo && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- photos are arbitrary external URLs from the sheet
      <img
        src={alumnus.photo}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-12 w-12 shrink-0 rounded-full object-cover border border-white/15"
      />
    );
  }
  return (
    <div className="h-12 w-12 shrink-0 rounded-full border border-accent-300/25 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.3),rgba(17,17,28,1)_70%)] flex items-center justify-center font-display text-sm font-bold text-accent-100">
      {initials(alumnus.name)}
    </div>
  );
}

export default function AlumniDirectory({ initialAlumni }: { initialAlumni: Alumnus[] }) {
  const alumni = initialAlumni;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSuperpower, setSelectedSuperpower] = useState("all");

  // Registration Form States
  const [showRegForm, setShowRegForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    batch: "",
    company: "",
    role: "",
    superpower: "Fundraising & Pitching",
    linkedin: "",
    photo: ""
  });

  const handleRegisterAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "ALUMNI_REGISTRATION", 
          payload: formData 
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Details submitted successfully! Your profile will appear on the website once approved by the E-Cell team.");
        setShowRegForm(false);
        setFormData({ name: "", email: "", batch: "", company: "", role: "", superpower: "Fundraising & Pitching", linkedin: "", photo: "" });
        localStorage.setItem("eCellFormSubmitted", "true");
      } else {
        alert(`Submission Error: ${data.error}`);
      }
    } catch (err) {
      alert("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const superpowersList = ["all", "Fundraising & Pitching", "Growth Hacking", "Tech Architecture", "Product Strategy", "Go-To-Market"];

  const filteredAlumni = alumni.filter(alumnus => {
    const matchesSearch = 
      (alumnus.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
      (alumnus.company?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesFilter = selectedSuperpower === "all" || alumnus.superpower === selectedSuperpower;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-transparent text-white py-16 px-4 md:px-8 font-sans antialiased">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER BLOCK */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="text-[10px] font-mono tracking-widest bg-accent-400/10 border border-accent-400/20 text-accent-300 px-3 py-1 rounded-full inline-block font-bold uppercase">
              E-Cell Network
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Alumni Mentorship Directory</h1>
            <p className="text-sm text-white/60 max-w-xl">
              Connect with former E-Cell members who are now working in venture capital, running startups, or leading industry teams.
            </p>
            {alumni.length > 0 && (
              <p className="text-xs font-mono uppercase tracking-widest text-accent-200/80">{alumni.length} mentors listed</p>
            )}
          </div>
          <button 
            onClick={() => setShowRegForm(!showRegForm)} 
            className="px-4 py-2 bg-accent-400 hover:bg-accent-300 text-black font-sans text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-lg"
          >
            {showRegForm ? <X size={14} /> : <Plus size={14} />}
            {showRegForm ? "Close Form" : "Join the Directory"}
          </button>
        </div>

        {/* ALUMNI REGISTRATION FORM */}
        {showRegForm && (
          <div className="bg-zinc-950 border border-nebula-500/20 p-6 rounded-2xl max-w-2xl mx-auto space-y-4 text-xs">
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-nebula-400">Alumni Registration</h3>
              <p className="text-[11px] text-white/60">Fill in your professional details below. New profiles are reviewed by the E-Cell team before going live.</p>
            </div>
            <form onSubmit={handleRegisterAlumni} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Full Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-nebula-500" placeholder="e.g., Angith Shaji" />
              </div>
              <div className="space-y-1">
                <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Email Address</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-nebula-500" placeholder="e.g., mail@example.com" />
              </div>
              <div className="space-y-1">
                <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Graduation Year</label>
                <input required type="number" value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-nebula-500" placeholder="e.g., 2025" />
              </div>
              <div className="space-y-1">
                <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">LinkedIn Profile URL</label>
                <input required type="url" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-nebula-500" placeholder="https://linkedin.com/in/username" />
              </div>
              <div className="space-y-1">
                <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Current Company / Organization</label>
                <input required type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-nebula-500" placeholder="e.g., Safexpress" />
              </div>
              <div className="space-y-1">
                <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Job Title / Role</label>
                <input required type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-nebula-500" placeholder="e.g., Operations Lead" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Photo URL (optional)</label>
                <input type="url" value={formData.photo} onChange={(e) => setFormData({...formData, photo: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-nebula-500" placeholder="Link to a square headshot" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Core Area of Expertise</label>
                <select value={formData.superpower} onChange={(e) => setFormData({...formData, superpower: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-nebula-500">
                  <option>Fundraising & Pitching</option>
                  <option>Growth Hacking</option>
                  <option>Tech Architecture</option>
                  <option>Product Strategy</option>
                  <option>Go-To-Market</option>
                </select>
              </div>
              <button disabled={isSubmitting} type="submit" className="sm:col-span-2 w-full py-2.5 mt-2 bg-white text-black font-sans font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer">
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Submit Details"}
              </button>
            </form>
          </div>
        )}

        {/* SEARCH AND FILTER BAR */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-space-900/70 p-4 border border-white/10 rounded-xl">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-3 text-white/60" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or company..."
              aria-label="Search alumni by name or company"
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-nebula-500 text-white" 
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {superpowersList.map(power => (
              <button 
                key={power} 
                onClick={() => setSelectedSuperpower(power)} 
                className={`px-3 py-1.5 border rounded-lg text-[10px] font-mono uppercase font-bold tracking-wider transition cursor-pointer shrink-0 ${
                  selectedSuperpower === power 
                    ? 'bg-nebula-500/10 border-nebula-500 text-white' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {power === "all" ? "All Categories" : power}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING & DIRECTORY GRID */}
        {(
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map(alumnus => (
                <div key={alumnus.id} className="bg-space-900/70 border border-white/10 p-5 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl group">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-3">
                      <AlumnusAvatar alumnus={alumnus} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold tracking-tight text-white group-hover:text-nebula-400 transition">
                          {alumnus.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-white/50 mt-1">
                          <GraduationCap size={14} className="text-nebula-500" /> {alumnus.batch}
                        </div>
                      </div>
                      <a
                        href={alumnus.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${alumnus.name} on LinkedIn`}
                        className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition flex items-center justify-center"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                    </div>
                    
                    <div className="space-y-2 text-xs text-white/70">
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-white/60 shrink-0" /> 
                        <span>{alumnus.role} at <strong className="text-white font-medium">{alumnus.company}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 bg-nebula-500/5 border border-nebula-500/10 rounded-xl p-2 mt-2">
                        <Zap size={14} className="text-amber-400 shrink-0" /> 
                        <span className="text-[11px] text-nebula-300 font-medium">Expertise: {alumnus.superpower}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-white/5">
                    <a 
                      href={`mailto:${alumnus.email}?subject=Mentorship Request`}
                      className="w-full py-2 bg-white text-black font-sans font-bold uppercase text-[10px] tracking-wider rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-1.5 text-center"
                    >
                      <Mail size={12} /> Request Mentorship Session
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {alumni.length === 0 ? (
              <EmptyState
                icon={<Users size={20} />}
                title="The directory is opening soon"
                action={
                  <button
                    onClick={() => setShowRegForm(true)}
                    className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-accent-100 transition-colors"
                  >
                    Add yourself as a mentor
                  </button>
                }
              >
                We&apos;re reviewing the first alumni profiles. If you&apos;re a BIMTECH alum, join and help the next batch of founders.
              </EmptyState>
            ) : filteredAlumni.length === 0 ? (
              <EmptyState
                icon={<Search size={20} />}
                title="No one matches that search"
                action={
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedSuperpower("all");
                    }}
                    className="px-4 py-2 rounded-xl border border-white/15 text-white text-xs font-bold hover:bg-white/5 transition-colors"
                  >
                    Clear search and filters
                  </button>
                }
              >
                Try a different name or company, or another area of expertise.
              </EmptyState>
            ) : null}
          </>
        )}

      </div>
    </div>
  );
}