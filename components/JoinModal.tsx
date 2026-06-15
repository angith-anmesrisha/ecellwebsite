"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles, Code, Compass, BarChart3 } from "lucide-react";
interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const QUIZ_STEPS = [
  {
    id: 1,
    question: "What is your ultimate superpower when approaching a problem?",
    options: [
      { text: "Writing code or architecting the core infrastructure.", type: "builder" },
      { text: "Mapping out the long-term vision and designing the interface.", type: "visionary" },
      { text: "Organizing the logistics, deadlines, and execution plan.", type: "operator" }
    ]
  },
  {
    id: 2,
    question: "If you were launching a startup tomorrow, what would you spend day one doing?",
    options: [
      { text: "Setting up repositories and hacking together a working prototype.", type: "builder" },
      { text: "Drafting the pitch deck and talking to potential early users.", type: "visionary" },
      { text: "Building financial models and mapping operational workflows.", type: "operator" }
    ]
  }
];
export default function JoinModal({ isOpen, onClose }: JoinModalProps) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ builder: 0, visionary: 0, operator: 0 });
  const [persona, setPersona] = useState<{ name: string; desc: string; icon: any } | null>(null);
  const handleOptionSelect = (type: "builder" | "visionary" | "operator") => {
    const updatedScores = { ...scores, [type]: scores[type] + 1 };
    setScores(updatedScores);
    if (step < QUIZ_STEPS.length) {
      setStep(step + 1);
    } else {
      const highest = Object.keys(updatedScores).reduce((a, b) =>
        updatedScores[a as keyof typeof scores] > updatedScores[b as keyof typeof scores] ? a : b
      ) as keyof typeof scores;
      const personas = {
        builder: { name: "The Technical Builder", desc: "You turn complex concepts into functional, shipping code. The backbone of product deployment.", icon: <Code className="text-blue-500" size={32} /> },
        visionary: { name: "The Creative Visionary", desc: "You see trends before they happen and map elite designs. The catalyst for product strategy.", icon: <Compass className="text-purple-500" size={32} /> },
        operator: { name: "The Growth Operator", desc: "You manage project velocity, crunch metrics, and scale growth operations. The engine of execution.", icon: <BarChart3 className="text-emerald-500" size={32} /> }
      };
      setPersona(personas[highest]);
      setStep(QUIZ_STEPS.length + 1);
    }
  };
  const resetModal = () => {
    setStep(0);
    setScores({ builder: 0, visionary: 0, operator: 0 });
    setPersona(null);
    onClose();
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetModal}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          {}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl z-10"
          >
            {}
            <button onClick={resetModal} className="absolute top-4 right-4 text-white/40 hover:text-white transition">
              <X size={18} />
            </button>
            {}
            {step === 0 && (
              <div className="space-y-6 text-center py-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-500">
                  <Sparkles size={22} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Discover Your Founder Persona</h3>
                  <p className="text-sm text-white/60 max-w-sm mx-auto">
                    Before joining the BIMTECH E-Cell ecosystem, take our micro-evaluation to find your core operational startup alignment.
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="w-full py-3 bg-white text-black text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition group mt-4"
                >
                  <span>Begin Evaluation</span>
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
            {}
            {step > 0 && step <= QUIZ_STEPS.length && (
              <div className="space-y-6 py-2">
                <div className="flex justify-between items-center text-xs text-white/40 tracking-widest font-mono uppercase">
                  <span>Evaluation Portal</span>
                  <span>Step {step} of {QUIZ_STEPS.length}</span>
                </div>
                <h4 className="text-lg font-medium text-white leading-snug">
                  {QUIZ_STEPS[step - 1].question}
                </h4>
                <div className="space-y-3 pt-2">
                  {QUIZ_STEPS[step - 1].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(option.type as any)}
                      className="w-full text-left p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 hover:bg-white/10 hover:border-blue-500 hover:text-white transition duration-200"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {}
            {step > QUIZ_STEPS.length && persona && (
              <div className="space-y-6">
                {}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10 shrink-0">
                    {persona.icon}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-500">Your Persona Match</span>
                    <h5 className="text-base font-bold text-white">{persona.name}</h5>
                    <p className="text-xs text-white/50 leading-relaxed mt-0.5">{persona.desc}</p>
                  </div>
                </div>
                {}
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); resetModal(); }}>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Full Name</label>
                    <input type="text" placeholder="Your Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">BIMTECH Email ID</label>
                    <input type="email" placeholder="username@bimtech.ac.in" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition" required />
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-500 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-500/20 mt-4">
                    Submit Application as Founder
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}