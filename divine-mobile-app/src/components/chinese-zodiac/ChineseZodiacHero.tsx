import React from "react";
import { Sparkles, Calendar, Award } from "lucide-react";

export const ChineseZodiacHero: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-[#1C1613] to-stone-950 p-6 text-white shadow-xl border border-amber-500/25">
      {/* Decorative background circle */}
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full border border-amber-500/10 pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full border border-amber-500/10 pointer-events-none" />
      
      {/* Paper texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-repeat bg-[url('https://www.transparenttextures.com/patterns/lined-paper-2.png')] pointer-events-none" />

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 mb-5 relative z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-300">
          <Sparkles size={10} /> 12 Zodiac Signs
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-500/15 border border-red-500/30 text-red-300">
          <Calendar size={10} /> Fire Horse Year
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-500/15 border border-blue-500/30 text-blue-300">
          <Award size={10} /> Personal Guidance
        </span>
      </div>

      {/* Main text content */}
      <div className="relative z-10 space-y-2">
        <p className="text-[11px] font-bold tracking-[0.2em] text-amber-500 uppercase leading-snug">ASTROLOGY GUIDE</p>
        <h2 className="text-3xl font-display font-bold leading-tight tracking-wide text-[#FFFBF6]">
          Chinese Horoscope <span className="text-red-500">2026</span>
        </h2>
        <p className="text-lg font-bold text-amber-200">Year of the Fire Horse</p>
        <p className="text-xs text-[#EAE3DB] leading-relaxed max-w-sm pt-1">
          Explore your Chinese zodiac sign, yearly guidance, strengths, opportunities, and spiritual reflection for 2026 under the energetic movements of the Fire Horse.
        </p>
      </div>

      {/* Stylized Yin-Yang/Zodiac wheel emblem at bottom right */}
      <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none select-none">
        <svg viewBox="0 0 100 100" className="w-24 h-24 text-white">
          <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 50 2 C 26 2, 26 50, 50 50 C 74 50, 74 98, 50 98" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 50 2 A 48 48 0 0 0 50 98" fill="currentColor" opacity="0.3" />
          <circle cx="50" cy="26" r="6" fill="currentColor" />
          <circle cx="50" cy="74" r="6" fill="currentColor" opacity="0.3" />
        </svg>
      </div>
    </div>
  );
};

export default ChineseZodiacHero;
