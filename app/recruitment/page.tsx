"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, Sliders, Film, Briefcase, X, HelpCircle, Trophy, ArrowRight } from "lucide-react";

// --- COMPREHENSIVE 10-QUESTION MATRIX DATA ---
const DATABASE = {
  ops: [
    { s: "A key corporate speaker's flight is delayed by 2 hours, clashing with their main auditorium slot.", o: [{ t: "Pivot the timeline instantly, move a student panel forward, and notify delegates via screens.", p: 10 }, { t: "Keep the slot empty and play a pre-recorded video stream to fill time.", p: 5 }, { t: "Cancel the session completely and tell attendees to go to the food court.", p: 0 }] },
    { s: "The catering supplier drops out 4 hours before the regional startup mixer event.", o: [{ t: "Onboard local backup food startups using corporate emergency buffer funds.", p: 10 }, { t: "Order fast-food delivery boxes in bulk to cover basic food parameters.", p: 5 }, { t: "Tell attendees that catering has been cancelled due to technical bugs.", p: 0 }] },
    { s: "A torrential downpour floods the outdoor registration canopy area.", o: [{ t: "Migrate registration blocks into the main library lobby corridors instantly.", p: 10 }, { t: "Keep operations outside but buy umbrellas for the front-line staff.", p: 5 }, { t: "Pause registration completely until the weather clears up entirely.", p: 0 }] },
    { s: "The main stage microphone array begins producing heavy feedback noise.", o: [{ t: "Deploy backup wireless lapel channels and re-route mixers via sub-outputs.", p: 10 }, { t: "Apologize to the crowd and tell the tech team to tweak cables live.", p: 5 }, { t: "Ignore the sound distortion and continue the speaker's presentation.", p: 0 }] },
    { s: "50 extra un-registered delegates arrive at the gates demanding entry credentials.", o: [{ t: "Create an overflow seating row and issue digital spectator passes.", p: 10 }, { t: "Let them pack into the back lines standing up without registration tracking.", p: 5 }, { t: "Refuse entry aggressively and call campus security blocks.", p: 0 }] },
    { s: "A student team accuses another group of plagiarizing their sandbox pitch code.", o: [{ t: "Isolate both teams, inspect git tracking files, and run validation loops.", p: 10 }, { t: "Disqualify both teams immediately to save corporate management time.", p: 0 }, { t: "Tell them to settle it amongst themselves after the closing ceremony.", p: 5 }] },
    { s: "The campus internet grid crashes right before a live-streamed investor panel.", o: [{ t: "Failover instantly to an encrypted 5G cellular hotspot network node.", p: 10 }, { t: "Wait for the institutional IT cell to reset the server hardware.", p: 5 }, { t: "Cancel the investor stream and record a local offline video file.", p: 0 }] },
    { s: "Your sponsorship printing assets arrive with inverted color layouts.", o: [{ t: "Deploy dark-mode digital projection displays to offset physical print bugs.", p: 10 }, { t: "Hang the inverted banners anyway and hope the brand desks don't notice.", p: 0 }, { t: "Scrape the banners and leave the sponsor branding empty.", p: 5 }] },
    { s: "The event schedule drops 30 minutes behind tracking guidelines by mid-day.", o: [{ t: "Compress afternoon networking blocks by 10 minutes to recover pacing.", p: 10 }, { t: "Cut out the student presentation decks entirely without warning.", p: 0 }, { t: "Let the event run late into the night, ignoring venue lock times.", p: 5 }] },
    { s: "An assigned executive volunteer fails to show up for their stage door block.", o: [{ t: "Re-route a cross-functional Media node to cover the gap instantly.", p: 10 }, { t: "Leave the door unmonitored and handle tracking from your desk.", p: 0 }, { t: "Stop your current task to stand at the stage door entry line.", p: 5 }] }
  ],
  media: [
    { s: "Organic video analytics indicate a major 60% viewer drop at second 3 of a reel.", o: [{ t: "Splice out the introductory logo sequence; open instantly with a bold statement.", p: 10 }, { t: "Boost the background audio track volume to force attention metrics.", p: 5 }, { t: "Leave the file asset as is and hope the feed algorithm normalizes.", p: 0 }] },
    { s: "A brand sponsor claims your promotional graphic package compromises their design safety guide.", o: [{ t: "Pull the asset block, match their hex colors exactly, and re-export in 15 mins.", p: 10 }, { t: "Argue that the current design fits your campus aesthetic better.", p: 0 }, { t: "Add a white background layer behind their logo box to bypass clipping rules.", p: 5 }] },
    { s: "The cell needs to announce an upcoming summit but has zero custom footage assets.", o: [{ t: "Build a high-contrast kinetic typography video utilizing motion layouts.", p: 10 }, { t: "Post a static plain-text banner string on your stories with standard tags.", p: 5 }, { t: "Delay the launch announcement until a video can be filmed next week.", p: 0 }] },
    { s: "A campus post receives a wave of spam comments from external bot lines.", o: [{ t: "Deploy localized keyword block comment filters inside account settings.", p: 10 }, { t: "Turn off comments completely across all institutional grid channels.", p: 0 }, { t: "Engage with the spam accounts to artificially inflate feed engagement metric loops.", p: 5 }] },
    { s: "Your graphic layout designer sends assets sized in 4:5 instead of 9:16 vertical scaling.", o: [{ t: "Place the 4:5 block onto a styled 9:16 background blur template frame.", p: 10 }, { t: "Stretch the image parameters manually until it fills the vertical screen.", p: 0 }, { t: "Post it cropped, letting the UI text clip outside the display margins.", p: 5 }] },
    { s: "An Instagram video export turns out completely blurry after upload sequencing.", o: [{ t: "Verify metadata codecs, enable 'High Quality Uploads' toggle, and re-push.", p: 10 }, { t: "Delete it and tell the team that Instagram's server stack is down.", p: 0 }, { t: "Leave the blurry video up because it already gained 50 views.", p: 5 }] },
    { s: "A corporate panel speaker requests their headshot be updated on your live feed grid.", o: [{ t: "Archive the active post, patch the asset graphic, and drop a clean update.", p: 10 }, { t: "Tell them changes cannot be executed post-publication layout loops.", p: 0 }, { t: "Tag their new picture inside the caption field description instead.", p: 5 }] },
    { s: "Your official cell LinkedIn page receives an angry review from a student.", o: [{ t: "Draft a neutral, highly professional assistance reply inviting them to dm.", p: 10 }, { t: "Ignore the notification completely and delete the post thread.", p: 0 }, { t: "Argue with the reviewer publically to defend the cell's reputation.", p: 5 }] },
    { s: "A major content reveal asset leaks out on campus WhatsApp loops early.", o: [{ t: "Pivot the timeline framework immediately; drop the official confirmation node now.", p: 10 }, { t: "Deny the asset validity and launch an internal investigation track.", p: 5 }, { t: "Postpone the entire event launch because the surprise element failed.", p: 0 }] },
    { s: "The marketing copy for a caption reads completely dry, like an academic thesis.", o: [{ t: "Rewrite using scroll-stopping hooks, bullet points, and high-impact action verbs.", p: 10 }, { t: "Run it through a standard corporate AI template generator without editing.", p: 5 }, { t: "Publish the text as is to maintain institutional formality parameters.", p: 0 }] }
  ],
  spons: [
    { s: "A target corporate manager states: 'Your student base is too small for our marketing scale.'", o: [{ t: "Counter with highly targeted access to premium PGDM graduates via direct matching panels.", p: 10 }, { t: "Offer a steep 50% discount on the package price to close immediately.", p: 5 }, { t: "Accept the refusal and close the corporate dialogue line.", p: 0 }] },
    { s: "A sponsor company offers product vouchers instead of the required cash commitment loop.", o: [{ t: "Negotiate a hybrid tier: 60% cash baseline paired with voucher prize additions.", p: 10 }, { t: "Reject the brand outright since vouchers cannot fund staging infrastructure.", p: 5 }, { t: "Accept 100% vouchers and hope operations can buy electronics with them.", p: 0 }] },
    { s: "The title sponsor demands full access to all registration emails post-event.", o: [{ t: "Offer custom inside-app QR codes or direct booth registration pipelines instead.", p: 10 }, { t: "Hand over the raw spreadsheet instantly, ignoring campus compliance codes.", p: 0 }, { t: "Refuse the deal completely, collapsing the funding matrix grid.", p: 5 }] },
    { s: "A corporate lead stops responding to emails after you send the proposal deck.", o: [{ t: "Send a brief follow-up tracking hook highlighting a limited time logo slot lock.", p: 10 }, { t: "Call the manager multiple times a day until they pick up the line.", p: 0 }, { t: "Assume the lead is dead and delete them from your tracking dashboard.", p: 5 }] },
    { s: "An executive manager agrees to sponsor but refuses to sign a formal legal contract.", o: [{ t: "State that institutional finance guardrails require written parameter sign-offs.", p: 10 }, { t: "Accept their verbal promise and spend the cash buffer ahead of tracking.", p: 0 }, { t: "Ask them to just WhatsApp confirm the terms to bypass administrative routes.", p: 5 }] },
    { s: "A partner brand demands their logo size be double the size of all other sponsors.", o: [{ t: "Upsell them to a premium 'Exclusive Title Partner' tier matrix framework.", p: 10 }, { t: "Modify the graphics secretly without notifying the other partner desks.", p: 0 }, { t: "Reject the request flatly, risking an escalation conflict path.", p: 5 }] },
    { s: "You have an hour left to close a deal, but the manager is negotiating hard on pricing.", o: [{ t: "Bundle in premium social deliverables or a custom booth space to lock value.", p: 10 }, { t: "Walk away from the desk to preserve corporate pride parameters.", p: 0 }, { t: "Instantly drop your price to whatever threshold they demand.", p: 5 }] },
    { s: "A local startup sponsor goes bankrupt two weeks before your summit launch.", o: [{ t: "Audit the pipeline grid instantly; execute contingencies toward hot tech leads.", p: 10 }, { t: "Sue the startup entity to recover the promised fund parameters.", p: 0 }, { t: "Cover the financial deficit by cutting student food rations.", p: 5 }] },
    { s: "The marketing head wants a speaking slot on the main stage as part of their cash deal.", o: [{ t: "Offer a high-value 10-minute keynote slot centered on industry domain trends.", p: 10 }, { t: "Give them a 45-minute prime-time panel slot, displacing your main guest.", p: 5 }, { t: "Tell them speakers are handled exclusively by academic faculty rules.", p: 0 }] },
    { s: "Your outreach tracking shows you are 30% short of your corporate funding baseline.", o: [{ t: "Launch an aggressive micro-tier corporate campaign targeting local SME nodes.", p: 10 }, { t: "Do nothing and expect the operations cluster to spend less capital.", p: 0 }, { t: "Ask the college administration cell to double your student fees.", p: 5 }] }
  ]
};

export default function RecruitmentPortal() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [adminBypassActive, setAdminBypassActive] = useState(false); // New master bypass state
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  
  const [selectedDept, setSelectedDept] = useState<"ops" | "media" | "spons" | null>(null);
  const [step, setStep] = useState(1);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [runningScore, setRunningScore] = useState(0);

  // --- SMART TIMER ENGINE ---
  useEffect(() => {
    setHasMounted(true);
    
    // Check if admin has bypassed this portal footprint previously
    const checkBypass = localStorage.getItem("ecell_admin_bypass") === "true";
    if (checkBypass) {
      setIsLocked(false);
      setAdminBypassActive(true);
      return;
    }

    const savedDate = localStorage.getItem("ecell_recruitment_launch_date") || "2026-07-15T00:00:00";
    const targetDate = new Date(savedDate).getTime();

    const interval = setInterval(() => {
      // Emergency escape clause: if admin bypass is activated while interval is running, clear it!
      if (localStorage.getItem("ecell_admin_bypass") === "true") {
        setIsLocked(false);
        clearInterval(interval);
        return;
      }

      const now = new Date().getTime();
      const difference = targetDate - now;
      
      if (difference <= 0) {
        setIsLocked(false);
        clearInterval(interval);
      } else {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectDept = (dept: "ops" | "media" | "spons") => {
    setSelectedDept(dept);
    setStep(1);
    setCurrentQIdx(0);
    setRunningScore(0);
  };

  const handleOptionClick = (points: number) => {
    const nextScore = runningScore + points;
    setRunningScore(nextScore);

    if (selectedDept && currentQIdx < DATABASE[selectedDept].length - 1) {
      setCurrentQIdx(currentQIdx + 1);
    } else {
      const existing = JSON.parse(localStorage.getItem("ecell_submissions") || "[]");
      const payload = {
        id: "APP-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        name: applicantName,
        email: applicantEmail,
        dept: selectedDept,
        score: nextScore,
        timestamp: new Date().toLocaleDateString()
      };
      existing.push(payload);
      localStorage.setItem("ecell_submissions", JSON.stringify(existing));
      setStep(3);
    }
  };

  const handleAdminBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "ecelladmin2026") {
      localStorage.setItem("ecell_admin_bypass", "true");
      setAdminBypassActive(true);
      setIsLocked(false);
      setShowAdminInput(false);
    } else {
      alert("Invalid Admin Override Parameter Key.");
    }
  };

  if (!hasMounted) {
    return <div className="min-h-screen bg-black" />;
  }

  // Double check locked criteria status nodes
  const displayLockScreen = isLocked && !adminBypassActive;

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4 md:px-8 font-sans antialiased relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black pointer-events-none" />

      <AnimatePresence mode="wait">
        {displayLockScreen ? (
          <motion.div 
            key="lock-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[999] flex flex-col justify-center items-center p-6 text-center"
          >
            <Clock size={40} className="text-blue-500 animate-pulse mb-4" />
            <h2 className="text-2xl md:text-4xl font-black max-w-xl tracking-tight text-white uppercase">EXECUTIVE RECRUITMENT IS LOCKED</h2>
            <div className="grid grid-cols-4 gap-3 max-w-sm w-full mt-6 font-mono">
              {Object.entries(countdown).map(([unit, val]) => (
                <div key={unit} className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-xl font-black">{val}</div>
                  <div className="text-[9px] uppercase text-white/40">{unit}</div>
                </div>
              ))}
            </div>
            <div className="mt-12">
              {!showAdminInput ? (
                <button onClick={() => setShowAdminInput(true)} className="text-[10px] font-mono tracking-widest text-white/10 hover:text-white/30 uppercase font-bold">[ Command Override ]</button>
              ) : (
                <form onSubmit={handleAdminBypassSubmit} className="flex gap-2 bg-white/5 border border-white/10 p-1 rounded-xl">
                  <input type="password" placeholder="Encryption Key" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="bg-transparent text-xs px-3 py-1.5 focus:outline-none font-mono text-white placeholder-white/20 w-44" />
                  <button type="submit" className="px-3 py-1.5 bg-white text-black text-[10px] font-bold uppercase rounded-lg hover:bg-zinc-200 transition">Bypass</button>
                </form>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="application-hub"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-12 relative z-10"
          >
            <div className="border-b border-white/10 pb-6 flex justify-between items-end">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-blue-500 font-bold">Intake Workspace</span>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1">E-Cell Board Evaluation</h1>
              </div>
              <div className="flex gap-3">
                {adminBypassActive && (
                  <button 
                    onClick={() => {
                      localStorage.removeItem("ecell_admin_bypass");
                      window.location.reload();
                    }}
                    className="text-xs font-mono border border-red-500/20 bg-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition text-red-400"
                  >
                    Lock Portal
                  </button>
                )}
                <button onClick={() => window.location.href = "/recruitment/admin"} className="text-xs font-mono border border-white/10 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition flex items-center gap-1.5 text-white/60 hover:text-white">
                  <Trophy size={14} /> Admin Dashboard
                </button>
              </div>
            </div>

            {!selectedDept ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-950 border border-white/10 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                  <div className="space-y-2"><Sliders size={20} className="text-blue-500" /><h3 className="text-lg font-bold">Operations, Tech & Finance</h3><p className="text-xs text-white/60 leading-relaxed">Solve real logistics bottlenecks, event resource matrices, and allocation balancing prompts.</p></div>
                  <button onClick={() => handleSelectDept("ops")} className="w-full py-3 bg-white text-black text-xs font-bold uppercase rounded-xl">Launch Matrix</button>
                </div>
                <div className="bg-zinc-950 border border-white/10 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                  <div className="space-y-2"><Film size={20} className="text-purple-500" /><h3 className="text-lg font-bold">Media</h3><p className="text-xs text-white/60 leading-relaxed">Evaluate timeline retention spikes, audience algorithmic flow overrides, and brand narrative choices.</p></div>
                  <button onClick={() => handleSelectDept("media")} className="w-full py-3 bg-white text-black text-xs font-bold uppercase rounded-xl">Launch Matrix</button>
                </div>
                <div className="bg-zinc-950 border border-white/10 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                  <div className="space-y-2"><Briefcase size={20} className="text-emerald-500" /><h3 className="text-lg font-bold">Sponsorship</h3><p className="text-xs text-white/60 leading-relaxed">Navigate tough brand corporate rebuttals, value-adds, and equity close negotiations.</p></div>
                  <button onClick={() => handleSelectDept("spons")} className="w-full py-3 bg-white text-black text-xs font-bold uppercase rounded-xl">Launch Matrix</button>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-10 relative">
                <button onClick={() => setSelectedDept(null)} className="absolute top-6 right-6 text-xs font-mono text-white/40 hover:text-white transition flex items-center gap-1"><X size={12} /> Cancel</button>

                {step === 1 && (
                  <div className="space-y-6 max-w-sm">
                    <div><h3 className="text-xl font-bold text-white">Identity Authentication</h3><p className="text-xs text-white/50 mt-0.5">Register parameters before launching the choice tracking grid.</p></div>
                    <div className="space-y-3">
                      <input type="text" placeholder="Full Legal Name" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                      <input type="email" placeholder="BIMTECH Email Node" value={applicantEmail} onChange={(e) => setApplicantEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
                    </div>
                    <button disabled={!applicantName || !applicantEmail} onClick={() => setStep(2)} className="px-6 py-3 bg-white text-black text-xs font-bold uppercase rounded-xl tracking-wider disabled:opacity-20">Initialize Assessment</button>
                  </div>
                )}

                {step === 2 && selectedDept && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-blue-500 uppercase">Scenario Matrix Framework // {currentQIdx + 1} of 10</span>
                      <span className="text-xs font-mono text-white/40">Accumulated Score Tracking: {runningScore} pts</span>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/10 rounded-xl flex gap-3 items-start">
                      <HelpCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-sm font-mono text-white/90 leading-relaxed">{DATABASE[selectedDept][currentQIdx].s}</p>
                    </div>
                    <div className="space-y-3 pt-2">
                      {DATABASE[selectedDept][currentQIdx].o.map((opt, i) => (
                        <button key={i} onClick={() => handleOptionClick(opt.p)} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-left text-xs font-mono text-white/70 hover:bg-white/10 hover:text-white hover:border-blue-500/40 transition flex justify-between items-center group">
                          <span>{opt.t}</span>
                          <ArrowRight size={14} className="text-white/0 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 text-center max-w-sm mx-auto">
                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={20} /></div>
                    <div><h3 className="text-xl font-black">Evaluation Profile Committed</h3><p className="text-xs text-white/50">Your responses have structural synchronization stamps on the central register node.</p></div>
                    <div className="border border-white/10 bg-gradient-to-b from-zinc-900 to-black rounded-xl p-5 text-left font-mono text-xs relative overflow-hidden shadow-2xl">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-zinc-950 border-r border-white/10 rounded-r-full" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-zinc-950 border-l border-white/10 rounded-l-full" />
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <div><div className="text-[9px] uppercase font-bold text-blue-500">Executive Ticket</div><h4 className="text-xs font-bold text-white mt-0.5 max-w-[180px] truncate">{applicantName}</h4></div>
                        <div className="text-[8px] px-2 py-0.5 bg-white/5 border border-white/10 rounded uppercase text-white/60">{selectedDept.toUpperCase()}</div>
                      </div>
                      <div className="py-3 space-y-1 text-[10px] text-white/50 border-b border-white/5 border-dashed">
                        <div><span className="text-white/30">Email:</span> {applicantEmail}</div>
                        <div><span className="text-white/30">Intake Score:</span> <strong className="text-emerald-400">{runningScore} / 100 PTS</strong></div>
                      </div>
                      <div className="pt-3 text-center"><span className="text-[8px] uppercase tracking-widest text-emerald-400 block font-bold">Present Gate Pass for face-to-face PI Round</span></div>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => window.print()} className="px-4 py-2 bg-white text-black font-bold text-xs rounded-lg flex items-center gap-1.5 hover:bg-zinc-200 transition">Print Pass</button>
                      <button onClick={() => { setSelectedDept(null); setStep(1); }} className="px-4 py-2 bg-white/5 border border-white/10 text-white font-bold text-xs rounded-lg hover:bg-white/10 transition">Return Hub</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}