"use client";

import React from "react";
import Image from "next/image";
import { motion, PanInfo } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

import type { TeamMember } from "@/lib/content-types";

const initials = (name: string) =>
  name
    .split(" ")
    .filter((part) => !part.endsWith("."))
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

interface TeamCarousel3DProps {
  members: TeamMember[];
  activeIdx: number;
  onChange: (idx: number) => void;
}

const LinkedInIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export default function TeamCarousel3D({ members, activeIdx, onChange }: TeamCarousel3DProps) {
  const last = members.length - 1;
  const go = (idx: number) => onChange(Math.max(0, Math.min(last, idx)));

  const handlePanEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50) go(activeIdx + 1);
    else if (info.offset.x > 50) go(activeIdx - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(activeIdx + 1);
    if (e.key === "ArrowLeft") go(activeIdx - 1);
  };

  return (
    <div
      className="w-full relative py-6 overflow-visible select-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="E-Cell board members"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <motion.div
        onPanEnd={handlePanEnd}
        className="relative w-full h-[420px] flex items-center justify-center overflow-visible touch-pan-y"
        style={{ perspective: 1000 }}
      >
        <div className="w-full max-w-sm h-full relative flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          {members.map((member, idx) => {
            const offset = idx - activeIdx;
            // Only cards near the active one are mounted, so far-away photos never download
            if (Math.abs(offset) > 2) return null;
            const isActive = offset === 0;

            return (
              <motion.div
                key={member.id}
                style={{ zIndex: 100 - Math.abs(offset) }}
                initial={false}
                animate={{
                  opacity: isActive ? 1 : Math.abs(offset) === 1 ? 0.55 : 0.2,
                  rotateY: offset * 28,
                  z: Math.abs(offset) * -140,
                  x: offset * 250,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.4 }}
                onClick={() => !isActive && go(idx)}
                aria-hidden={!isActive}
                className={`absolute w-[280px] h-[390px] rounded-2xl overflow-hidden border bg-space-900 group shadow-2xl ${
                  isActive ? "border-accent-300/30" : "border-white/10 cursor-pointer"
                }`}
              >
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="280px"
                    unoptimized={member.image.startsWith("http")}
                    className={`object-cover object-[50%_25%] transition-[filter,transform] duration-700 group-hover:scale-105 ${
                      isActive ? "grayscale-0" : "grayscale"
                    }`}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.18),transparent_60%)] text-6xl font-display font-bold tracking-tight text-white/60 uppercase">
                    {initials(member.name)}
                  </div>
                )}

                {/* Name sits on the photo, so there's no empty band under it */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 flex justify-between items-end gap-3">
                  <div className="min-w-0">
                    <h4 className="text-lg font-bold tracking-tight text-white leading-tight">{member.name}</h4>
                    <p className="mt-1 text-[11px] font-mono tracking-wider text-accent-100/70 uppercase">{member.role}</p>
                  </div>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={isActive ? 0 : -1}
                    aria-label={`${member.name} on LinkedIn`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 p-2.5 bg-white/10 border border-white/15 rounded-full text-white/80 hover:text-black hover:bg-accent-300 transition-colors duration-300"
                  >
                    <LinkedInIcon />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {members[activeIdx] && (
        <p className="sr-only" aria-live="polite">
          {members[activeIdx].name}, {members[activeIdx].role}. {activeIdx + 1} of {members.length}.
        </p>
      )}

      <div className="flex justify-center items-center gap-6 mt-6 relative z-50">
        <button
          onClick={() => go(activeIdx - 1)}
          disabled={activeIdx === 0}
          aria-label="Previous member"
          className="p-3 bg-space-900 border border-white/10 rounded-full text-white/70 hover:text-white disabled:opacity-20 hover:bg-white/5 transition-all duration-300"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex gap-1.5 flex-wrap justify-center max-w-[340px]">
          {members.map((member, idx) => (
            <button
              key={member.id}
              onClick={() => go(idx)}
              aria-label={`Show ${member.name}`}
              aria-current={idx === activeIdx}
              className="py-2"
            >
              <span
                className={`block h-[3px] rounded-full transition-all duration-500 ${
                  idx === activeIdx ? "w-6 bg-accent-400" : "w-2 bg-white/20"
                }`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={() => go(activeIdx + 1)}
          disabled={activeIdx === last}
          aria-label="Next member"
          className="p-3 bg-space-900 border border-white/10 rounded-full text-white/70 hover:text-white disabled:opacity-20 hover:bg-white/5 transition-all duration-300"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
