"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Sparkles, Users, Skull, Calendar } from "lucide-react";
import dynamic from "next/dynamic";

const SkeletonBox = ({ height = "300px" }: { height?: string }) => (
  <div
    style={{ height }}
    className="w-full bg-zinc-950/20 animate-pulse rounded-2xl border border-white/5"
  />
);

const HeroCanvas3D = dynamic(() => import("@/components/HeroCanvas3D"), {
  ssr: false,
});

const AiStories = dynamic(() => import("@/components/AiStories"), {
  ssr: false,
  loading: () => <SkeletonBox height="400px" />,
});

const HorizonSlideDeck = dynamic(
  () => import("@/components/HorizonSlideDeck"),
  {
    ssr: false,
    loading: () => <SkeletonBox height="500px" />,
  },
);

const ConnectSection = dynamic(() => import("@/components/ConnectSection"), {
  ssr: false,
});

import RotatingBadge from "@/components/RotatingBadge";
import AnimatedWord from "@/components/AnimatedWord";
import Navbar from "@/components/Navbar";
import KineticTextReveal from "@/components/KineticTextReveal";
import FracturedTextButton from "@/components/FracturedTextButton";
import InertialSkewText from "@/components/InertialSkewText";
import CustomCursor from "@/components/CustomCursor";
import KineticGlitchReveal from "@/components/KineticGlitchReveal";
import DigitalStripSplitter from "@/components/DigitalStripSplitter";
import InfiniteMarquee from "@/components/InfiniteMarquee";
import Preloader from "@/components/Preloader";

interface ModuleNode {
  title: string;
  icon: React.ReactNode;
  desc: string;
  link: string;
  cta: string;
  glowColor: string;
}

function AnimatedGridLine({
  orientation = "horizontal",
  className = "",
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <motion.div
      initial={orientation === "horizontal" ? { scaleX: 0 } : { scaleY: 0 }}
      whileInView={orientation === "horizontal" ? { scaleX: 1 } : { scaleY: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-white/10 absolute pointer-events-none ${
        orientation === "horizontal"
          ? "h-[1px] w-full origin-left"
          : "w-[1px] h-full origin-top"
      } ${className}`}
    />
  );
}

function MasterMagnet({
  children,
  radius = 300,
  pull = 0.4,
}: {
  children: React.ReactNode;
  radius?: number;
  pull?: number;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={elementRef}
      className="inline-block w-full lg:w-auto overflow-visible perspective-1000"
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const containerRef = useRef(null);
  const [liveBannerText, setLiveBannerText] = useState<string | null>(null);
  const [bannerLink, setBannerLink] = useState<string>("/events");
useEffect(() => {
    async function checkLiveNodes() {
      const CACHE_KEY = "ecell_live_banner_cache";
      const CACHE_TIME_KEY = "ecell_live_banner_cache_timestamp";
      const FIVE_MINUTES = 5 * 60 * 1000;

      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        if (cachedData && cachedTimestamp && now - Number(cachedTimestamp) < FIVE_MINUTES) {
          const parsed = JSON.parse(cachedData);
          if (parsed.text) {
            setLiveBannerText(parsed.text);
            setBannerLink(parsed.link);
            return;
          }
        }

        const res = await fetch("/api/events?mode=events");
        const data = await res.json();
        
        if (data.success && Array.isArray(data.data)) {
          const activeEvent = data.data.find((e: any) => e.status === "ACTIVE");
          
          if (activeEvent) {
            const bannerText = `EVENT LIVE: ${activeEvent.title.toUpperCase()} REGISTRATIONS ARE OPEN`;
            const targetLink = "/events";

            setLiveBannerText(bannerText);
            setBannerLink(targetLink);

            localStorage.setItem(CACHE_KEY, JSON.stringify({ text: bannerText, link: targetLink }));
            localStorage.setItem(CACHE_TIME_KEY, now.toString());
            return;
          }
        }

        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIME_KEY);
        setLiveBannerText(null);

      } catch (err) {
        console.error("Failed to compile live system notification status matrices:", err);
      }
    }
    
    checkLiveNodes();
  }, []);

  return (
    <>
      <CustomCursor />
      <Preloader />

      <div
        ref={containerRef}
        className="relative min-h-[200vh] text-white overflow-hidden bg-transparent w-full"
      >
        <Navbar />

        <main className="relative z-10 flex flex-col pt-44 sm:pt-48 pb-32 overflow-visible">
          <HeroCanvas3D />

          <div className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 md:px-10 max-w-7xl mx-auto w-full gap-16 relative z-10 pointer-events-none">
            <div className="flex-1 space-y-8 text-center lg:text-left z-20 w-full pointer-events-auto">
              
              <div className="flex flex-col gap-4 items-center lg:items-start">
                <AnimatePresence>
                  {liveBannerText && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => window.location.href = bannerLink}
                      className="cursor-pointer inline-flex items-center gap-2 text-[10px] uppercase font-mono font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full shadow-lg hover:bg-emerald-500/20 transition-all select-none"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>{liveBannerText}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.p
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-purple-500 font-mono tracking-widest uppercase text-xs md:text-sm flex items-center justify-center lg:justify-start gap-2"
                >
                  <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                  {"// Where Aspiration Meets Opportunity"}
                </motion.p>
              </div>

              <MasterMagnet radius={300} pull={0.4}>
                <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter leading-[0.85] block text-left uppercase pointer-events-none overflow-visible w-full select-none">
                  <span
                    className="text-white block relative z-10 pointer-events-auto"
                    style={{ textShadow: "0 10px 30px rgba(0,0,0,0.7)" }}
                  >
                    <InertialSkewText text="WE HELP YOU" />
                  </span>
                  <AnimatedWord />
                </h1>
              </MasterMagnet>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="max-w-md mx-auto lg:mx-0 text-white/50 text-base md:text-lg mt-4 font-sans leading-relaxed"
              >
                Empowering the next generation of founders at BIMTECH. We help
                turn your ideas into impactful ventures.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 15,
                delay: 0.2,
              }}
              className="flex-1 flex justify-center items-center scale-75 md:scale-100 z-20 lg:border-l border-white/[0.04] py-8 lg:py-16 w-full pointer-events-auto"
            >
              <RotatingBadge />
            </motion.div>
          </div>
          <AnimatedGridLine orientation="horizontal" className="bottom-0" />
        </main>

        <section
          id="ai-feed"
          data-cursor="view"
          data-cursor-text="view"
          className="relative z-40 py-28 bg-transparent w-full overflow-hidden"
        >
          <KineticGlitchReveal>
            <div className="text-center mb-16 relative z-10 pointer-events-auto">
              <KineticTextReveal
                text="// Global Trends Loop"
                className="text-xs font-mono tracking-widest uppercase text-purple-500 font-bold"
                delay={0.1}
              />
              <MasterMagnet radius={150} pull={0.25}>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-1 uppercase pointer-events-none">
                  <InertialSkewText
                    text={"WHAT'S HAPPENING IN INNOVATION TODAY"}
                  />
                </h2>
              </MasterMagnet>
            </div>
            <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-20 pointer-events-auto">
              <AiStories />
            </div>
          </KineticGlitchReveal>
          <AnimatedGridLine orientation="horizontal" className="bottom-0" />
        </section>

        <InfiniteMarquee />

        <section
          id="ecosystem"
          className="relative z-30 py-32 max-w-7xl mx-auto space-y-16 px-6 md:px-10"
        >
          <KineticGlitchReveal>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-6 relative">
              <div className="space-y-3 pointer-events-auto">
                <KineticTextReveal
                  text="// E-Cell Network"
                  className="text-xs font-mono tracking-widest uppercase text-purple-500 font-bold"
                  delay={0.1}
                />
                <MasterMagnet radius={180} pull={0.25}>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase pointer-events-none">
                    <span className="text-white block">
                      <InertialSkewText text="EXPLORE OUR" />
                    </span>
                    <span className="text-purple-500 block mt-1">
                      ECOSYSTEM
                    </span>
                  </h2>
                </MasterMagnet>
                <p className="text-white/50 max-w-xl text-sm md:text-base leading-relaxed font-sans">
                  Connect with seasoned professionals, register for active
                  campus initiatives, or explore previous business frameworks
                  built directly within our startup community.
                </p>
              </div>

              <div className="font-mono text-[10px] bg-zinc-950/60 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2 text-white/60 shadow-xl shrink-0">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span>CAMPUS INITIATIVE ARCHITECTURE</span>
              </div>
            </div>
          </KineticGlitchReveal>

          <div className="w-full perspective-1000 preserve-3d">
            <div className="grid grid-cols-1 md:grid-cols-3 border border-white/10 rounded-2xl overflow-hidden bg-zinc-950/10 backdrop-blur-2xs relative preserve-3d">
              <AnimatedGridLine
                orientation="vertical"
                className="left-1/3 hidden md:block"
              />
              <AnimatedGridLine
                orientation="vertical"
                className="left-2/3 hidden md:block"
              />

              <TrackedCyberCard
                delay={0.05}
                node={{
                  title: "Alumni Advisory Circle",
                  icon: <Users size={16} />,
                  link: "/alumni",
                  desc: "Connect directly with our corporate alumni network who are scaling businesses, leading executive branches, or offering structured mentorship to student founders.",
                  cta: "View Directory",
                  glowColor: "rgba(168, 85, 247, 0.04)",
                }}
              />
              <TrackedCyberCard
                delay={0.15}
                node={{
                  title: "Strategic Action Hub",
                  icon: <Calendar size={16} />,
                  link: "/events",
                  desc: "Explore and register for upcoming campus innovation workshops, entrepreneurial leadership panels, and active business plan competitions.",
                  cta: "Explore Live Events",
                  glowColor: "rgba(168, 85, 247, 0.04)",
                }}
              />
              <TrackedCyberCard
                delay={0.25}
                node={{
                  title: "The Entrepreneurship Archive",
                  icon: <Skull size={16} />,
                  link: "/graveyard",
                  desc: "Analyze realistic case studies, pivot strategies, and practical market validation lessons curated from previous student-led ventures.",
                  cta: "Read Archive Lessons",
                  glowColor: "rgba(168, 85, 247, 0.04)",
                }}
              />
            </div>
          </div>
        </section>

        <InfiniteMarquee />

        <div className="w-full bg-transparent relative z-30">
          <HorizonSlideDeck />
        </div>

        <section className="relative z-30 py-32 max-w-7xl mx-auto px-6 md:px-10 border-t border-white/[0.06]">
          <KineticGlitchReveal>
            <div className="mb-14">
              <KineticTextReveal
                text="// Startup Ecosystem Tools"
                className="text-xs font-mono tracking-widest uppercase text-purple-400 font-bold"
                delay={0.1}
              />
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase mt-1">
                STUDENT EMBYTER RESOURCES
              </h2>
            </div>

            <div className="w-full mt-8 flex flex-col border-t border-white/10 pointer-events-auto">
              <DigitalStripSplitter
                text="Executive Recruitment Application"
                tag="//PORTAL.RECRUITMENT"
                href="/recruitment"
              />
              <DigitalStripSplitter
                text="Global Innovation Trends"
                tag="//TRENDS.LIVE.FEED"
                href="#ai-feed"
              />
              <DigitalStripSplitter
                text="E-Cell Network Ecosystem"
                tag="//NETWORK.DIRECTORY"
                href="#ecosystem"
              />
              <DigitalStripSplitter
                text="Venture Analytics Sandbox"
                tag="//SIMULATOR.RUN"
                href="#simulator"
              />
            </div>
          </KineticGlitchReveal>
        </section>

        <section className="w-full max-w-7xl mx-auto px-6 md:px-10 py-32 relative z-10">
          <KineticGlitchReveal>
            <div className="w-full bg-zinc-950/40 backdrop-blur-xs border border-white/10 rounded-2xl p-8 md:p-14 relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 group hover:border-purple-500/20 transition-all duration-500">
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-500/15 transition-all duration-500" />

              <div className="space-y-3 max-w-2xl pointer-events-auto">
                <div className="text-[10px] font-mono font-bold tracking-widest text-purple-500 uppercase flex items-center gap-1.5">
                  <Sparkles size={12} className="animate-pulse" />
                  Join the Executive Committee
                </div>
                <h3 className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase leading-tight">
                  <InertialSkewText text="SHAPE THE FUTURE OF CAMPUS" />
                </h3>
                <p className="text-xs md:text-sm text-white/50 leading-relaxed max-w-xl font-sans">
                  Applications for official E-Cell leadership positions open
                  soon. Select your area of interest, complete our simple review
                  process, and secure a spot for the final evaluation rounds.
                </p>
              </div>

              <div className="w-full lg:w-auto shrink-0 z-20">
                <FracturedTextButton
                  text="Enter Application Portal"
                  href="/recruitment"
                />
              </div>
            </div>
          </KineticGlitchReveal>
        </section>

        <div className="relative w-full">
          <AnimatedGridLine orientation="horizontal" className="top-0" />
          <ConnectSection />
        </div>
      </div>
    </>
  );
}

function TrackedCyberCard({
  node,
  delay,
}: {
  node: ModuleNode;
  delay: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springX = useSpring(rotateX, {
    stiffness: 200,
    damping: 25,
    mass: 0.5,
  });
  const springY = useSpring(rotateY, {
    stiffness: 200,
    damping: 25,
    mass: 0.5,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const box = cardRef.current.getBoundingClientRect();
    const cardCenterX = e.clientX - box.left;
    const cardCenterY = e.clientY - box.top;

    const xPct = cardCenterX / box.width - 0.5;
    const yPct = cardCenterY / box.height - 0.5;

    rotateX.set(yPct * -15);
    rotateY.set(xPct * 15);

    cardRef.current.style.setProperty("--mouse-x", `${cardCenterX}px`);
    cardRef.current.style.setProperty("--mouse-y", `${cardCenterY}px`);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  const letters = node.cta.split("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      className="w-full relative preserve-3d"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        onClick={() => (window.location.href = node.link)}
        style={{
          rotateX: springX,
          rotateY: springY,
          transformStyle: "preserve-3d",
        }}
        className="group relative z-30 pointer-events-auto w-full bg-zinc-950 p-8 space-y-6 flex flex-col justify-between overflow-hidden cursor-pointer h-[280px] border border-white/5 hover:bg-zinc-900/20 perspective-1000 select-none"
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(180px circle at var(--mouse-x) var(--mouse-y), ${node.glowColor}, transparent 80%)`,
          }}
        />

        <div className="absolute top-0 right-0 w-6 h-6 border-r border-t border-white/10 group-hover:border-purple-500/40 group-hover:w-8 group-hover:h-8 transition-all duration-300 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-l border-b border-white/10 group-hover:border-purple-500/40 group-hover:w-8 group-hover:h-8 transition-all duration-300 pointer-events-none" />

        <div className="space-y-4 relative z-10 translate-z-0 group-hover:translate-z-12 transition-transform duration-500 ease-[0.16,1,0.3,1] pointer-events-none">
          <div className="text-white/30 group-hover:text-purple-400 group-hover:scale-110 transition-all duration-300 origin-left inline-block">
            {node.icon}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              {node.title}
            </h3>
            <p className="text-[12px] text-zinc-400 font-sans leading-relaxed text-justify transition-colors duration-300">
              {node.desc}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase pt-4 border-t border-white/5 relative z-10 translate-z-0 group-hover:translate-z-6 transition-transform duration-500 ease-[0.16,1,0.3,1] pointer-events-none overflow-visible">
          <span className="flex overflow-visible text-white/40 group-hover:text-white transition-colors duration-300">
            {letters.map((char, idx) => {
              if (char === " ") return <span key={idx} className="w-1" />;

              const midIndex = letters.length / 2;
              const directionFactor = idx - midIndex;

              const spreadX = isHovered ? directionFactor * 4 : 0;
              const spreadY = isHovered ? (idx % 2 === 0 ? -12 : 12) : 0;
              const randomRotation = isHovered ? (idx % 2 === 0 ? -15 : 15) : 0;

              return (
                <motion.span
                  key={idx}
                  animate={{
                    x: spreadX,
                    y: spreadY,
                    rotate: randomRotation,
                    scale: isHovered ? 1.2 : 1,
                    color: isHovered
                      ? idx % 2 === 0
                        ? "#a855f7"
                        : "#3b82f6"
                      : "#ffffff",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 10,
                    mass: 0.2,
                    delay: isHovered
                      ? idx * 0.01
                      : (letters.length - idx) * 0.008,
                  }}
                  className="inline-block will-change-transform font-mono"
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
          <ArrowUpRight
            size={12}
            className="text-white/20 group-hover:text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}