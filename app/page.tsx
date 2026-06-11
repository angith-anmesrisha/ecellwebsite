"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Users, Skull, Zap, Lightbulb, Calendar } from "lucide-react";

import RotatingBadge from '@/components/RotatingBadge';
import AnimatedWord from '@/components/AnimatedWord';
import Navbar from '@/components/Navbar';
import TeamCard from '@/components/TeamCard';
import ConnectSection from '@/components/ConnectSection';
import PitchSimulator from "@/components/PitchSimulator";
import AiStories from "@/components/AiStories";

// Curated high-fidelity startup quotes list for the loading gate
const STARTUP_QUOTES = [
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs" },
  { text: "Ideas are easy. Implementation is hard.", author: "Guy Kawasaki" },
  { text: "Don't be afraid to assert yourself, have confidence in your abilities and don't let the bastards grind you down.", author: "Michael Bloomberg" },
  { text: "Chase the vision, not the money; the money will end up following you.", author: "Tony Hsieh" },
  { text: "Move fast and break things. If you are not breaking things, you are not moving fast enough.", author: "Mark Zuckerberg" },
  { text: "An absolute dedication to core execution parameters separates viable architectures from raw concept vapors.", author: "Tech Founder Axiom" },
  { text: "Risk more than others think is safe. Dream more than others think is practical.", author: "Howard Schultz" },
  { text: "If you are not embarrassed by the first version of your product, you’ve launched too late.", author: "Reid Hoffman" }
];

interface ModuleNode {
  title: string;
  icon: React.ReactNode;
  desc: string;
  link: string;
  cta: string;
  glowColor: string;
}

// Reusable Scroll-Triggered Premium Viewport Reveal Container
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(2px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.215, 0.610, 0.355, 1.000] }}
    >
      {children}
    </motion.div>
  );
}

// HIGH-PERFORMANCE INFINITE KINETIC TEXT RUNNING MARQUEE
function KineticMarquee({ baseText }: { baseText: string }) {
  const marqueeContent = Array(12).fill(baseText).join(" — ");
  return (
    <div className="w-full overflow-hidden whitespace-nowrap border-y border-white/10 py-5 select-none pointer-events-none relative z-20 bg-zinc-950/40 backdrop-blur-xs">
      <motion.div
        className="inline-block text-[10px] tracking-[0.4em] font-mono font-black uppercase text-white/15"
        animate={{ x: [0, -1200] }}
        transition={{ ease: "linear", duration: 24, repeat: Infinity }}
      >
        {marqueeContent}
      </motion.div>
    </div>
  );
}

// INDUSTRIAL WIREFRAME GRID LINE COMPONENT
function AnimatedGridLine({ orientation = "horizontal", className = "" }: { orientation?: "horizontal" | "vertical"; className?: string }) {
  return (
    <motion.div
      initial={orientation === "horizontal" ? { scaleX: 0 } : { scaleY: 0 }}
      whileInView={orientation === "horizontal" ? { scaleX: 1 } : { scaleY: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      className={`bg-white/10 absolute pointer-events-none ${
        orientation === "horizontal" ? "h-[1px] w-full origin-left" : "w-[1px] h-full origin-top"
      } ${className}`}
    />
  );
}

// 🌟 THE UNIVERSAL MASTER MAGNET WRAPPER (FOR ENTIRE HEADLINE BLOCKS)
function MasterMagnet({ children, radius = 200, pull = 0.3 }: { children: React.ReactNode; radius?: number; pull?: number }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0, skew: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!elementRef.current) return;
      const { clientX, clientY } = e;
      const rect = elementRef.current.getBoundingClientRect();
      
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < radius) {
        const intensity = (radius - distance) / radius;
        setOffset({
          x: deltaX * pull * intensity,
          y: deltaY * pull * intensity,
          skew: (deltaX / rect.width) * -12 * intensity
        });
      } else {
        setOffset({ x: 0, y: 0, skew: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [radius, pull]);

  return (
    <motion.div
      ref={elementRef}
      animate={{ x: offset.x, y: offset.y, skewX: offset.skew }}
      transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.1 }}
      className="inline-block w-full lg:w-auto"
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuote, setActiveQuote] = useState({ text: "", author: "" });

  const containerRef = useRef(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * STARTUP_QUOTES.length);
    setActiveQuote(STARTUP_QUOTES[randomIndex]);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Immersive Loading Screen Gate */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              filter: "blur(10px)",
              transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
            }}
            className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center px-6"
          >
            <div className="max-w-2xl text-center space-y-6">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "40px" }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="h-[2px] bg-blue-500 mx-auto"
              />

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="text-xl md:text-2xl font-light tracking-wide text-white/90 leading-relaxed italic font-serif"
              >
                "{activeQuote.text}"
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="text-xs uppercase tracking-widest text-blue-500 font-semibold"
              >
                — {activeQuote.author}
              </motion.p>
            </div>

            <div className="absolute bottom-12 left-0 w-full flex justify-center">
              <div className="w-32 h-[1px] bg-white/10 overflow-hidden relative rounded-full">
                <motion.div 
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Site System Frame */}
      <div ref={containerRef} className="relative min-h-[200vh] text-white overflow-hidden bg-transparent w-full">
        
        {/* STATIC ARCHITECTURAL COLUMNS */}
        <div className="absolute inset-0 max-w-7xl mx-auto w-full h-full pointer-events-none px-6 md:px-10 z-0">
          <div className="w-full h-full relative border-x border-white/[0.04]">
            <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-white/[0.02] hidden lg:block" />
            <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-white/[0.02] hidden lg:block" />
          </div>
        </div>

        <Navbar />

        {/* Hero Section */}
        <main className="relative z-10 flex flex-col pt-40 sm:pt-44 md:pt-48 pb-24">
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 md:px-10 max-w-7xl mx-auto w-full gap-12 lg:gap-0 relative">
            
            <div className="flex-1 space-y-4 md:space-y-6 text-center lg:text-left z-20 w-full">
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-blue-500 font-mono tracking-widest uppercase text-xs md:text-sm flex items-center justify-center lg:justify-start gap-2"
              >
                <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                // Where Aspiration Meets Opportunity
              </motion.p>
              
              {/* 🌟 HERO HEADLINE MAGNET UPGRADE: Moves strings + cycling words as a locked unit */}
              <MasterMagnet radius={240} pull={0.35}>
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.215, 0.610, 0.355, 1] }}
                  className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight flex flex-col md:block uppercase pointer-events-none"
                >
                  <span className="md:mr-5">WE HELP YOU </span>
                  <AnimatedWord />
                </motion.h1>
              </MasterMagnet>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="max-w-md mx-auto lg:mx-0 text-white/50 text-base md:text-lg mt-4 font-sans leading-relaxed"
              >
                Empowering the next generation of founders at BIMTECH. We help turn your ideas into impactful ventures.
              </motion.p>
            </div>

            <div className="flex-1 flex justify-center items-center scale-75 md:scale-100 z-20 lg:border-l border-white/[0.04] py-8 lg:py-16 w-full">
              <RotatingBadge />
            </div>
          </div>
          
          <AnimatedGridLine orientation="horizontal" className="bottom-0" />
        </main>

        {/* Live AI News Stories Feed Panel */}
        <section id="ai-feed" className="relative z-40 py-20 bg-black/10 backdrop-blur-2xs">
          <ScrollReveal>
            {/* 🌟 TRACKER TITLE MAGNET UPGRADE */}
            <div className="text-center mb-12">
              <h3 className="text-xs font-mono tracking-widest uppercase text-blue-500 font-bold">// Live Tracker Node</h3>
              <MasterMagnet radius={150} pull={0.25}>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-1 uppercase pointer-events-none">
                  Today's Intelligence Core
                </h2>
              </MasterMagnet>
            </div>
            <div className="max-w-7xl mx-auto px-6 md:px-10">
              <AiStories />
            </div>
          </ScrollReveal>
          
          <AnimatedGridLine orientation="horizontal" className="bottom-0" />
        </section>

        <KineticMarquee baseText="BIMTECH ECELL COMMUNITY" />

        {/* ECOSYSTEM HOVER-GLOW INTERACTION MODULES GRID SECTION */}
        <section id="ecosystem" className="relative z-30 py-28 max-w-7xl mx-auto space-y-12 px-6 md:px-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-12 relative">
            {/* 🌟 ECOSYSTEM TITLE MAGNET UPGRADE */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono tracking-widest uppercase text-blue-500 font-bold">// E-Cell Architecture</h3>
              <MasterMagnet radius={180} pull={0.25}>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase pointer-events-none">
                  <span>Explore Our </span>
                  <span className="text-blue-500">Ecosystem</span>
                </h2>
              </MasterMagnet>
              <p className="text-white/50 max-w-xl text-sm md:text-base leading-relaxed font-sans">
                Connect with real-world networks, register for campus events, or learn from previous business case studies built right here inside our community.
              </p>
            </div>
            
            <div className="font-mono text-[10px] bg-zinc-950/60 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2 text-white/60 shadow-xl shrink-0">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>CORE OPERATIONS INFRASTRUCTURE</span>
            </div>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 border border-white/10 rounded-2xl overflow-hidden bg-zinc-950/10 backdrop-blur-2xs relative">
              <AnimatedGridLine orientation="vertical" className="left-1/3 hidden md:block" />
              <AnimatedGridLine orientation="vertical" className="left-2/3 hidden md:block" />

              <TrackedCyberCard 
                delay={0.1}
                node={{
                  title: "Alumni Mentorship Board",
                  icon: <Users size={16} />,
                  link: "/alumni",
                  desc: "Connect directly with former E-Cell members who are now building tech platforms, scaling active startups, or working across venture capital networks.",
                  cta: "View Network Directory",
                  glowColor: "rgba(59, 130, 246, 0.08)"
                }}
              />
              <TrackedCyberCard 
                delay={0.2}
                node={{
                  title: "Events Registration Hub",
                  icon: <Calendar size={16} />,
                  link: "/events",
                  desc: "Explore and register directly for active campus workshops, hackathons, and guest panels using our centralized on-site sign-up forms.",
                  cta: "Explore Live Events",
                  glowColor: "rgba(168, 85, 247, 0.08)"
                }}
              />
              <TrackedCyberCard 
                delay={0.3}
                node={{
                  title: "The Learning Archive",
                  icon: <Skull size={16} />,
                  link: "/graveyard",
                  desc: "Read straight post-mortem case studies and practical operational lessons curated from previous student-led business ideas and project failures.",
                  cta: "Read Archive Lessons",
                  glowColor: "rgba(239, 68, 68, 0.08)"
                }}
              />
            </div>
          </div>
        </section>

        <KineticMarquee baseText="ENTREPRENEURSHIP MATRIX" />

        {/* Executive Board Section */}
        <section id="team" className="relative z-10 pt-28 pb-36 max-w-7xl mx-auto px-6 md:px-10">
          {/* 🌟 EXECUTIVE BOARD TITLE MAGNET UPGRADE */}
          <div className="mb-20">
            <h3 className="text-xs font-mono tracking-widest uppercase text-blue-500 font-bold">// System Architects</h3>
            <MasterMagnet radius={150} pull={0.25}>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase pointer-events-none mt-1">
                <span>THE </span>
                <span className="text-blue-500">BOARD.</span>
              </h2>
            </MasterMagnet>
            <p className="text-white/50 max-w-md font-sans text-sm md:text-base leading-relaxed mt-3">The minds behind the ecosystem. Hover over the cards to interact with the profiles.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
            <ScrollReveal delay={0.1}>
              <TeamCard 
                name="Don Joe" 
                role="Technical Head" 
                imagePath="/team/a.jpg" 
              />
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <TeamCard 
                name="Jane Doe" 
                role="President" 
                imagePath="/team/jane.jpg" 
              />
            </ScrollReveal>
            
            <ScrollReveal delay={0.3}>
              <TeamCard 
                name="John Smith" 
                role="Operations Head" 
                imagePath="/team/john.jpg" 
              />
            </ScrollReveal>
          </div>
        </section>
        
        {/* Interactive Pitch Simulator Sandbox Section */}
        <section id="simulator" className="relative z-10 py-28 bg-zinc-950/10 backdrop-blur-2xs relative">
          <AnimatedGridLine orientation="horizontal" className="top-0" />
          
          <ScrollReveal>
            <div className="max-w-7xl mx-auto px-6 md:px-10">
              {/* 🌟 SIMULATOR TITLE MAGNET UPGRADE */}
              <div className="mb-16 space-y-2">
                <h3 className="text-xs font-mono tracking-widest uppercase text-blue-500 font-bold">// Algorithmic Sandbox</h3>
                <MasterMagnet radius={180} pull={0.25}>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase pointer-events-none">
                    <span>TEST YOUR </span>
                    <span className="text-blue-500">VENTURE.</span>
                  </h2>
                </MasterMagnet>
                <p className="text-white/50 max-w-xl font-sans text-sm md:text-base leading-relaxed mt-2">
                  Run your startup architecture choices through our algorithmic sandbox model to generate strategic evaluation metrics instantly.
                </p>
              </div>
              <PitchSimulator />
            </div>
          </ScrollReveal>
          
          <AnimatedGridLine orientation="horizontal" className="bottom-0" />
        </section>

        {/* Recruitment Banner Component Layout */}
        <section className="w-full max-w-7xl mx-auto px-6 md:px-10 py-32 relative z-10">
          <ScrollReveal>
            <div className="w-full bg-zinc-950/40 backdrop-blur-xs border border-white/10 rounded-2xl p-8 md:p-14 relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 group hover:border-blue-500/30 transition-all duration-500">
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500" />
              
              <div className="space-y-3 max-w-2xl">
                <div className="text-[10px] font-mono font-bold tracking-widest text-blue-500 uppercase flex items-center gap-1.5">
                  <Sparkles size={12} className="animate-pulse" />
                  Cohort Cycle 2026
                </div>
                <h3 className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase leading-tight">
                  Build the Future of BIMTECH Entrepreneurship
                </h3>
                <p className="text-xs md:text-sm text-white/50 leading-relaxed max-w-xl font-sans">
                  Applications for official executive board positions opens soon. Choose your domain track, clear our assessment pipelines, and lock in your slot for the final Personal Interview rounds.
                </p>
              </div>

              <Link href="/recruitment" className="w-full lg:w-auto shrink-0 z-20">
                <MagneticComponent>
                  <button className="w-full lg:w-auto px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white duration-300 shadow-2xl">
                    <span>Enter Recruitment Portal</span>
                    <ArrowUpRight size={14} />
                  </button>
                </MagneticComponent>
              </Link>
            </div>
          </ScrollReveal>
        </section>

        {/* CONNECT SECTION LINE INTERSECTION INTEGRATION */}
        <div className="relative w-full">
          <AnimatedGridLine orientation="horizontal" className="top-0" />
          <ConnectSection />
        </div>
      </div>
    </>
  );
}

// ==========================================================
// INTERNAL SUB-COMPONENTS
// ==========================================================

function TrackedCyberCard({ node, delay }: { node: ModuleNode; delay: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const box = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty("--mouse-x", `${e.clientX - box.left}px`);
    cardRef.current.style.setProperty("--mouse-y", `${e.clientY - box.top}px`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="w-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onClick={() => window.location.href = node.link}
        className="group relative bg-transparent p-8 space-y-6 flex flex-col justify-between overflow-hidden cursor-pointer h-[240px] transition-colors duration-300 hover:bg-white/[0.01]"
        style={{
          ["--mouse-x" as any]: "0px",
          ["--mouse-y" as any]: "0px"
        }}
      >
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-cyber-grid bg-black mix-blend-screen"
          style={{
            maskImage: `radial-gradient(130px circle at var(--mouse-x) var(--mouse-y), white 20%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(130px circle at var(--mouse-x) var(--mouse-y), white 20%, transparent 100%)`
          }}
        />

        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(150px circle at var(--mouse-x) var(--mouse-y), ${node.glowColor}, transparent 80%)`
          }}
        />

        <div className="space-y-4 relative z-10">
          <div className="flex justify-between items-center">
            <div className="text-white/20 group-hover:text-blue-500 transition-colors duration-300">
              {node.icon}
            </div>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-black uppercase text-white tracking-wider">
              {node.title}
            </h3>
            <p className="text-[12px] text-zinc-400 group-hover:text-zinc-300 font-sans leading-relaxed text-justify transition-colors duration-300">
              {node.desc}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase pt-3 border-t border-white/5 relative z-10">
          <span className="text-white/40 group-hover:text-white transition-colors duration-300">
            {node.cta}
          </span>
          <ArrowUpRight size={12} className="text-white/20 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        </div>
      </div>
    </motion.div>
  );
}

function MagneticComponent({ children }: { children: React.ReactNode }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const moveElasticNode = (e: React.MouseEvent) => {
    if (!elementRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = elementRef.current.getBoundingClientRect();
    
    const nodeCenterX = left + width / 2;
    const nodeCenterY = top + height / 2;
    
    setOffset({
      x: (clientX - nodeCenterX) * 0.32,
      y: (clientY - nodeCenterY) * 0.32
    });
  };

  const snapResetNode = () => setOffset({ x: 0, y: 0 });

  return (
    <motion.div
      ref={elementRef}
      onMouseMove={moveElasticNode}
      onMouseLeave={snapResetNode}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 220, damping: 16, mass: 0.1 }}
      className="w-full lg:w-auto"
    >
      {children}
    </motion.div>
  );
}