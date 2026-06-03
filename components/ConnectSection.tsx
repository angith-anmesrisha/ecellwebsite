"use client";

import React from "react";
import { Mail, Send } from "lucide-react";
import Link from "next/link";

export default function ConnectSection() {
  const socials = [
    { 
      name: "Instagram", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      ), 
      url: "https://www.instagram.com/ecell_bimtech?igsh=bHhkNmlieWQ4cmd3",
      color: "hover:text-pink-500 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]" 
    },
    { 
      name: "LinkedIn", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect width="4" height="12" x="2" y="9"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
      ), 
      url: "https://www.linkedin.com/in/e-cell-bimtech-57b2231a/",
      color: "hover:text-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
    },
    { 
      name: "Email", 
      icon: <Mail size={24} />, 
      url: "mailto:ecell@bimtech.ac.in",
      color: "hover:text-blue-400 hover:shadow-[0_0_15px_rgba(96,165,250,0.5)]" 
    },
  ];

  return (
    <section id="contact" className="relative z-10 px-6 md:px-10 max-w-7xl mx-auto py-24 border-t border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left Side: Text and Social Icons */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              LET'S <span className="text-blue-500">CONNECT.</span>
            </h2>
            <p className="text-white/60 max-w-md text-base md:text-lg">
              Have questions, startup ideas, or want to collaborate with BIMTECH E-CELL? Reach out and let's build the ecosystem together.
            </p>
          </div>

          {/* Social Icons Array */}
          <div className="space-y-4 pt-6 lg:pt-0">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white/40">Follow Our Journey</h4>
            <div className="flex gap-4">
              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 transition-all duration-300 backdrop-blur-sm ${social.color}`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Message Form */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 space-y-4 shadow-2xl">
          <h3 className="text-xl font-bold text-white">Send us a message</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Your Name" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition text-sm"
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition text-sm"
              />
            </div>
            <textarea 
              rows={4} 
              placeholder="Your Message or Idea..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition text-sm resize-none"
            ></textarea>
            <button className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition group text-sm">
              <span>Send Message</span>
              <Send size={16} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>

      </div>

      {/* Mini Footer Copyright & Centralized Admin Link */}
      <div className="mt-24 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs text-white/40 gap-4">
        <p>© {new Date().getFullYear()} BIMTECH E-Cell. All rights reserved.</p>
        
        {/* DISCRETE ADMINISTRATIVE GATEWAY */}
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <Link 
            href="/admin" 
            className="hover:text-blue-500 hover:underline transition-all duration-200"
          >
            Console Login
          </Link>
          <span className="text-white/10">•</span>
          <span className="text-white/20 select-none">Built for Entrepreneurs</span>
        </div>
      </div>
    </section>
  );
}