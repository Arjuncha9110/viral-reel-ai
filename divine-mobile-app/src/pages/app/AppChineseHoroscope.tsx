import React from "react";
import AppShell from "./AppShell";
import { SeoHead } from "../../components/shared/SeoHead";
import ChineseZodiacHero from "../../components/chinese-zodiac/ChineseZodiacHero";
import ChineseZodiacFinder from "../../components/chinese-zodiac/ChineseZodiacFinder";
import ChineseZodiacCard from "../../components/chinese-zodiac/ChineseZodiacCard";
import ChineseZodiacPremiumCTA from "../../components/chinese-zodiac/ChineseZodiacPremiumCTA";
import ChineseZodiacDisclaimer from "../../components/chinese-zodiac/ChineseZodiacDisclaimer";
import { chineseZodiacData, chineseYear2026 } from "../../data/chineseZodiacData";
import { Flame, Compass, Heart, Activity } from "lucide-react";

export const AppChineseHoroscope: React.FC = () => {
  return (
    <AppShell title="Chinese Horoscope 2026" eyebrow="ASTROLOGY" showBack>
      <SeoHead
        title="Chinese Horoscope 2026 | Year of the Fire Horse | Divine Panchang"
        description="Discover your Chinese zodiac sign and explore 2026 Fire Horse guidance for career, love, money, health, lucky colors, numbers, and spiritual reflection."
        canonicalUrl="https://www.divinepanchang.space/chinese-horoscope"
      />

      <div className="space-y-6 max-w-md mx-auto">
        {/* Premium Astrology Hero */}
        <ChineseZodiacHero />

        {/* Date/Year Calculator */}
        <ChineseZodiacFinder />

        {/* 2026 Year of the Fire Horse Context Block */}
        <div className="rounded-3xl border border-amber-100 bg-[#FFFDFB] p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-[17px] font-bold text-stone-900 leading-snug">2026: Year of the Fire Horse</h3>
            <p className="text-[11px] text-stone-400 mt-0.5 font-medium uppercase tracking-wider">Planetary Cycle & Element Integration</p>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-body">
            {chineseYear2026.description}
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="rounded-2xl bg-amber-50/50 p-3 border border-amber-100/30 flex items-center gap-2">
              <Compass size={16} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-[9px] uppercase tracking-wider font-bold text-stone-400">Theme</p>
                <p className="text-xs font-bold text-stone-900 leading-tight">Movement</p>
              </div>
            </div>
            <div className="rounded-2xl bg-red-50/50 p-3 border border-red-100/30 flex items-center gap-2">
              <Flame size={16} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="text-[9px] uppercase tracking-wider font-bold text-stone-400">Element</p>
                <p className="text-xs font-bold text-stone-900 leading-tight">Yang Fire</p>
              </div>
            </div>
            <div className="rounded-2xl bg-rose-50/50 p-3 border border-rose-100/30 flex items-center gap-2">
              <Heart size={16} className="text-rose-600 flex-shrink-0" />
              <div>
                <p className="text-[9px] uppercase tracking-wider font-bold text-stone-400">Animal</p>
                <p className="text-xs font-bold text-stone-900 leading-tight">Horse</p>
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50/50 p-3 border border-emerald-100/30 flex items-center gap-2">
              <Activity size={16} className="text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-[9px] uppercase tracking-wider font-bold text-stone-400">Advice</p>
                <p className="text-xs font-bold text-stone-900 leading-tight">Discipline</p>
              </div>
            </div>
          </div>
        </div>

        {/* 12 Chinese Zodiac signs Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest">12 Zodiac Signs</h3>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Select Yours</span>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {chineseZodiacData.map((sign) => (
              <ChineseZodiacCard key={sign.slug} sign={sign} />
            ))}
          </div>
        </div>

        {/* Premium CTA */}
        <ChineseZodiacPremiumCTA />

        {/* Disclaimer */}
        <ChineseZodiacDisclaimer />
      </div>
    </AppShell>
  );
};

export default AppChineseHoroscope;
