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
      initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.215, 0.610, 0.355, 1.000] }}
    >
      {children}
    </motion.div>
  );
}

// TRIONN-INSPIRED CHARACTER-SPLITTING TYPOGRAPHY REVEAL COMPONENT
function SplitReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const letters = Array.from(text);
  
  return (
    <motion.span
      className="inline-block"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.02, delayChildren: delay }
        }
      }}
    >
      {letters.map((char, index) => (
        <span
          key={index}
          className="inline-block overflow-hidden vertical-align-bottom"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" }}
        >
          <motion.span
            className="inline-block whitespace-pre font-black"
            variants={{
              hidden: { opacity: 0, y: "110%", rotateX: 40 },
              visible: { 
                opacity: 1, 
                y: "0%", 
                rotateX: 0,
                transition: { type: "spring", damping: 14, stiffness: 110 }
              }
            }}
          >
            {char}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

// HIGH-PERFORMANCE INFINITE KINETIC TEXT RUNNING MARQUEE
function KineticMarquee({ baseText }: { baseText: string }) {
  const marqueeContent = Array(8).fill(baseText).join(" — ");
  return (
    <div className="w-full overflow-hidden whitespace-nowrap bg-zinc-950/20 border-y border-white/[0.02] py-4 select-none pointer-events-none my-4">
      <motion.div
        className="inline-block text-[10px] tracking-[0.3em] font-mono font-bold uppercase text-white/5"
        animate={{ x: [0, -1000] }}
        transition={{ ease: "linear", duration: 30, repeat: Infinity }}
      >
        {marqueeContent}
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuote, setActiveQuote] = useState({ text: "", author: "" });

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

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
      <div ref={containerRef} className="relative min-h-[200vh] text-white overflow-hidden bg-transparent">
        

        <Navbar />

        {/* Hero Section */}
        <main className="relative z-10 flex flex-col pt-40 sm:pt-44 md:pt-48 pb-20">
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 md:px-10 max-w-7xl mx-auto w-full gap-12 lg:gap-0">
            <div className="flex-1 space-y-4 md:space-y-6 text-center lg:text-left z-20">
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-blue-500 font-medium tracking-widest uppercase text-xs md:text-sm"
              >
                Where Aspiration Meets Opportunity
              </motion.p>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.215, 0.610, 0.355, 1] }}
                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight flex flex-col md:block"
              >
                <span>WE HELP YOU </span>
                <AnimatedWord />
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="max-w-md mx-auto lg:mx-0 text-white/60 text-base md:text-lg mt-4 font-sans"
              >
                Empowering the next generation of founders at BIMTECH. We help turn your ideas into impactful ventures.
              </motion.p>
            </div>

            <div className="flex-1 flex justify-center items-center scale-75 md:scale-100 z-20">
              <RotatingBadge />
            </div>
          </div>
        </main>

        {/* Live AI News Stories Feed Panel */}
        <section id="ai-feed" className="relative z-40 py-12 border-b border-white/5">
          <ScrollReveal>
            <div className="text-center mb-6">
              <h3 className="text-xs font-mono tracking-widest uppercase text-blue-500 font-bold">Live Feed</h3>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                <SplitReveal text="Today's Intelligence Core" />
              </h2>
            </div>
            <AiStories />
          </ScrollReveal>
        </section>

        <KineticMarquee baseText="BIMTECH ECELL COMMUNITY" />

        {/* ECOSYSTEM HOVER-GLOW INTERACTION MODULES GRID SECTION */}
        <section id="ecosystem" className="relative z-30 py-24 px-6 md:px-10 max-w-7xl mx-auto border-b border-white/5 space-y-6">
          <div className="mb-10 text-center md:text-left space-y-2">
            <h3 className="text-xs font-mono tracking-widest uppercase text-blue-500 font-bold">// E-Cell Network</h3>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
              <SplitReveal text="Explore Our Ecosystem" />
            </h2>
            <p className="text-white/60 max-w-xl text-sm md:text-base leading-relaxed font-sans">
              Connect with real-world networks, register for campus events, or learn from previous business case studies built right here inside our community.
            </p>
          </div>

          <div className="w-full space-y-4 font-mono text-xs">
            <ScrollReveal delay={0.1}>
              <div className="flex justify-between items-center bg-zinc-950/40 border border-white/5 rounded-xl px-4 py-2 text-[10px] text-white/40 tracking-wider">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <span>E-CELL STUDENT RESOURCE HUB</span>
                </div>
                <div className="flex items-center gap-1.5 uppercase text-white/30 text-[9px]">
                  Platform Online
                </div>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TrackedCyberCard 
                delay={0.15}
                node={{
                  title: "Alumni Mentorship Board",
                  icon: <Users size={16} />,
                  link: "/alumni",
                  desc: "Connect directly with former E-Cell members who are now building tech platforms, scaling active startups, or working across venture capital networks.",
                  cta: "View Network Directory",
                  glowColor: "rgba(59, 130, 246, 0.12)"
                }}
              />
              <TrackedCyberCard 
                delay={0.25}
                node={{
                  title: "Events Registration Hub",
                  icon: <Calendar size={16} />,
                  link: "/events",
                  desc: "Explore and register directly for active campus workshops, hackathons, and guest panels using our centralized on-site sign-up forms.",
                  cta: "Explore Live Events",
                  glowColor: "rgba(168, 85, 247, 0.12)"
                }}
              />
              <TrackedCyberCard 
                delay={0.35}
                node={{
                  title: "The Learning Archive",
                  icon: <Skull size={16} />,
                  link: "/graveyard",
                  desc: "Read straight post-mortem case studies and practical operational lessons curated from previous student-led business ideas and project failures.",
                  cta: "Read Archive Lessons",
                  glowColor: "rgba(239, 68, 68, 0.12)"
                }}
              />
            </div>
          </div>
        </section>

        <KineticMarquee baseText="ENTREPRENEURSHIP MATRIX" />

        {/* Executive Board Section */}
        <section id="team" className="relative z-10 px-6 md:px-10 max-w-7xl mx-auto pt-24 pb-32">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
              <SplitReveal text="THE " />
              <span className="text-blue-500"><SplitReveal text="BOARD." delay={0.1} /></span>
            </h2>
            <p className="text-white/60 mt-4 max-w-lg font-sans">The minds behind the ecosystem. Hover over the cards to interact with the profiles.</p>
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
        <section id="simulator" className="relative z-10 px-6 md:px-10 max-w-7xl mx-auto py-24 border-t border-white/5">
          <ScrollReveal>
            <div className="mb-12 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
                <SplitReveal text="TEST YOUR " />
                <span className="text-blue-500"><SplitReveal text="VENTURE." delay={0.1} /></span>
              </h2>
              <p className="text-white/60 mt-3 max-w-lg font-sans">
                Run your startup architecture choices through our algorithmic sandbox model to generate strategic evaluation metrics instantly.
              </p>
            </div>
            <PitchSimulator />
          </ScrollReveal>
        </section>

        {/* Recruitment Banner Component Layout */}
        <section className="w-full max-w-7xl mx-auto px-6 md:px-10 pb-24 relative z-10">
          <ScrollReveal>
            <div className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 group hover:border-blue-500/30 transition-all duration-500">
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500" />
              
              <div className="space-y-2 max-w-2xl">
                <div className="text-[10px] font-mono font-bold tracking-widest text-blue-500 uppercase flex items-center gap-1.5">
                  <Sparkles size={12} className="animate-pulse" />
                  Cohort Cycle 2026
                </div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
                  Build the Future of BIMTECH Entrepreneurship
                </h3>
                <p className="text-xs text-white/50 leading-relaxed max-w-xl font-sans">
                  Applications for official executive board positions opens soon. Choose your domain track, clear our assessment pipelines, and lock in your slot for the final Personal Interview rounds.
                </p>
              </div>

              {/* HIGH-ELASTIC MAGNETIC BUTTON SYSTEM OVERLAY */}
              <Link href="/recruitment" className="w-full lg:w-auto shrink-0 z-20">
                <MagneticComponent>
                  <button className="w-full lg:w-auto px-6 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2">
                    <span>Enter Recruitment Portal</span>
                    <ArrowUpRight size={14} />
                  </button>
                </MagneticComponent>
              </Link>
            </div>
          </ScrollReveal>
        </section>

        <ConnectSection />
      </div>
    </>
  );
}

// ==========================================================
// KINETIC TRIONN-INSPIRED SUB-COMPONENTS
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: [0.215, 0.610, 0.355, 1] }}
      className="w-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onClick={() => window.location.href = node.link}
        className="group relative bg-transparent border border-white/5 hover:border-white/10 rounded-2xl p-6 space-y-6 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 h-[220px]"
        style={{
          ["--mouse-x" as any]: "0px",
          ["--mouse-y" as any]: "0px"
        }}
      >
        {/* Background Mesh Overlay Pattern */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-cyber-grid bg-black mix-blend-screen"
          style={{
            maskImage: `radial-gradient(130px circle at var(--mouse-x) var(--mouse-y), white 20%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(130px circle at var(--mouse-x) var(--mouse-y), white 20%, transparent 100%)`
          }}
        />

        {/* Fluid Aura Vector Radial Light Shield */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(150px circle at var(--mouse-x) var(--mouse-y), ${node.glowColor}, transparent 80%)`
          }}
        />

        <div className="space-y-3 relative z-10">
          <div className="flex justify-between items-center">
            <div className="text-white/20 group-hover:text-white/80 transition-colors duration-300">
              {node.icon}
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase text-white tracking-wide group-hover:text-blue-500 transition-colors duration-300">
              {node.title}
            </h3>
            <p className="text-[12px] text-zinc-400 group-hover:text-zinc-300 font-sans leading-relaxed text-justify transition-colors duration-300">
              {node.desc}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase pt-2 border-t border-white/5 relative z-10">
          <span className="text-white/40 group-hover:text-white group-hover:underline transition-colors duration-300">
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
    
    // Attenuated pull vector equation
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