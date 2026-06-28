import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AppShell from "./AppShell";
import { SeoHead } from "../../components/shared/SeoHead";
import { chineseZodiacData } from "../../data/chineseZodiacData";
import { getAdjacentSigns } from "../../lib/chineseZodiac";
import { ChineseAnimalIllustration } from "../../components/chinese-zodiac/ChineseAnimalIllustration";
import { ChineseGuidanceCarousel } from "../../components/chinese-zodiac/ChineseGuidanceCarousel";
import { ChineseZodiacPremiumCTA } from "../../components/chinese-zodiac/ChineseZodiacPremiumCTA";
import { ChineseZodiacDisclaimer } from "../../components/chinese-zodiac/ChineseZodiacDisclaimer";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bot,
  Briefcase,
  Coins,
  Heart,
  Activity,
  Compass,
  CheckCircle,
  XCircle,
} from "lucide-react";

export const AppChineseHoroscopeDetail: React.FC = () => {
  const { signSlug } = useParams<{ signSlug: string }>();
  const navigate = useNavigate();
  const [showSelector, setShowSelector] = useState(false);

  const sign = chineseZodiacData.find((s) => s.slug === signSlug?.toLowerCase());

  if (!sign) {
    return (
      <AppShell title="Sign Not Found" eyebrow="ERROR" showBack>
        <div className="text-center py-10 space-y-4">
          <p className="text-stone-600 font-body">We couldn't find details for that zodiac sign.</p>
          <Link to="/chinese-horoscope" className="inline-block px-5 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm">
            Back to Horoscope Hub
          </Link>
        </div>
      </AppShell>
    );
  }

  const { previous, next } = getAdjacentSigns(sign.slug);

  const handleAskAI = () => {
    localStorage.setItem(
      "divine_ai_context",
      JSON.stringify({
        source: "chinese-horoscope",
        sign: sign.name,
        year: 2026,
        animal: sign.name,
        theme: "Fire Horse guidance",
      })
    );
    navigate("/divine-ai");
  };

  return (
    <AppShell title={sign.name} eyebrow="CHINESE HOROSCOPE" showBack>
      <SeoHead
        title={`${sign.name} Chinese Horoscope 2026 | Divine Panchang`}
        description={`Explore ${sign.name} zodiac guidance for the 2026 Fire Horse year, including opportunities, relationship advice, career focus, money, health, and spiritual reflection.`}
        canonicalUrl={`https://www.divinepanchang.space/chinese-horoscope/${sign.slug}`}
      />

      <div className="space-y-6 max-w-md mx-auto relative">
        {/* Quick select dropdown header */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSelector(!showSelector)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 font-bold text-xs active:scale-[0.99] transition-transform"
          >
            <span>Change Zodiac Sign</span>
            <div className="flex items-center gap-1.5 text-amber-600">
              <span className="text-xs uppercase">{sign.name}</span>
              <ChevronDown size={14} className={`transform transition-transform ${showSelector ? "rotate-180" : ""}`} />
            </div>
          </button>

          {showSelector && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto p-2 grid grid-cols-3 gap-1">
              {chineseZodiacData.map((z) => (
                <button
                  key={z.slug}
                  onClick={() => {
                    navigate(`/chinese-horoscope/${z.slug}`);
                    setShowSelector(false);
                  }}
                  className={`px-2 py-2 rounded-xl text-center text-xs font-bold transition-colors ${
                    z.slug === sign.slug
                      ? "bg-amber-600 text-white"
                      : "hover:bg-stone-50 text-stone-700"
                  }`}
                >
                  <span className="block text-[14px] leading-none mb-0.5">{z.chineseCharacter}</span>
                  <span className="block text-[10px] leading-none font-medium">{z.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hero Area inspired by reference design */}
        <div className="relative rounded-3xl bg-gradient-to-b from-stone-900 to-stone-950 p-6 text-white text-center shadow-lg border border-amber-500/20 overflow-hidden">
          {/* Subtle decor circles */}
          <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full border border-white/5 pointer-events-none" />

          {/* Large Animal Emblem Visual */}
          <div className="flex justify-center mb-4">
            <ChineseAnimalIllustration sign={sign.slug} size="large" />
          </div>

          {/* Chinese Character */}
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 border border-red-500/30 text-white font-bold text-sm shadow-md mb-2">
            {sign.chineseCharacter}
          </div>

          {/* Big Uppercase Name */}
          <h2 className="text-3xl font-display font-extrabold tracking-[0.1em] text-white uppercase leading-none">
            {sign.name}
          </h2>

          {/* Short yearly theme line */}
          <p className="text-xs text-amber-200 max-w-xs mx-auto leading-relaxed pt-3 border-t border-white/10 mt-3 font-body">
            "{sign.yearlyGuidance2026.overview}"
          </p>

          {/* Previous / Next zodiac navigation loop */}
          <div className="flex items-center justify-between border-t border-white/10 mt-5 pt-3 text-[11px] font-bold text-stone-400 uppercase tracking-widest relative z-10 px-1">
            <Link
              to={`/chinese-horoscope/${previous.slug}`}
              className="flex items-center gap-1 hover:text-amber-400 active:scale-[0.98] transition-transform"
            >
              <ChevronLeft size={14} className="text-amber-500" /> {previous.name}
            </Link>
            <Link
              to={`/chinese-horoscope/${next.slug}`}
              className="flex items-center gap-1 hover:text-amber-400 active:scale-[0.98] transition-transform"
            >
              {next.name} <ChevronRight size={14} className="text-amber-500" />
            </Link>
          </div>
        </div>

        {/* Swipeable Guidance Cards Carousel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest">2026 Key Insights</h3>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Swipeable cards</span>
          </div>
          <ChineseGuidanceCarousel cards={sign.cards} />
        </div>

        {/* Ask Divine AI Integration */}
        <button
          type="button"
          onClick={handleAskAI}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-stone-900 to-amber-950 text-white font-bold shadow-md hover:opacity-95 active:scale-[0.99] transition-all"
        >
          <Bot size={20} className="text-amber-400 animate-pulse" />
          <div className="text-left">
            <p className="text-[9px] uppercase tracking-wider text-amber-400/80 leading-none">Spiritual Guru Connection</p>
            <p className="text-xs font-bold mt-0.5">Ask Divine AI About My 2026 Horoscope</p>
          </div>
        </button>

        {/* Detailed text sections */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest">Zodiac Profile</h3>
              <p className="text-[11px] text-stone-400 mt-0.5 font-medium uppercase tracking-wider">Personality & Sign Traits</p>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-body">
              {sign.personality}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1.5">Strengths</p>
                <div className="space-y-1">
                  {sign.strengths.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-stone-600">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      <span className="font-body">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1.5">Challenges</p>
                <div className="space-y-1">
                  {sign.challenges.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-stone-600">
                      <span className="w-1 h-1 rounded-full bg-rose-500" />
                      <span className="font-body">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2026 Forecast breakdown cards */}
          <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest">2026 Forecast details</h3>
              <p className="text-[11px] text-stone-400 mt-0.5 font-medium uppercase tracking-wider">Life Areas Breakdown</p>
            </div>

            {/* Career */}
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Briefcase size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-0.5">Career & Work</h4>
                <p className="text-xs text-stone-600 leading-relaxed font-body">{sign.yearlyGuidance2026.career}</p>
              </div>
            </div>

            {/* Money */}
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Coins size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-0.5">Money & Opportunities</h4>
                <p className="text-xs text-stone-600 leading-relaxed font-body">{sign.yearlyGuidance2026.money}</p>
              </div>
            </div>

            {/* Love */}
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 flex-shrink-0">
                <Heart size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-0.5">Love & Relationships</h4>
                <p className="text-xs text-stone-600 leading-relaxed font-body">{sign.yearlyGuidance2026.relationship}</p>
              </div>
            </div>

            {/* Health */}
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
                <Activity size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-0.5">Health & Energy</h4>
                <p className="text-xs text-stone-600 leading-relaxed font-body">{sign.yearlyGuidance2026.health}</p>
              </div>
            </div>

            {/* Spiritual */}
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                <Compass size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-0.5">Spiritual Guidance</h4>
                <p className="text-xs text-stone-600 leading-relaxed font-body">{sign.yearlyGuidance2026.spiritualAdvice}</p>
              </div>
            </div>
          </div>

          {/* Do's and Avoid's */}
          <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest">Yearly Best Practices</h3>
              <p className="text-[11px] text-stone-400 mt-0.5 font-medium uppercase tracking-wider">Auspicious Action Guide</p>
            </div>
            
            <div className="space-y-3.5">
              <div className="flex gap-3">
                <CheckCircle size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-0.5">Do This Year</h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-body">{sign.yearlyGuidance2026.success}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <XCircle size={18} className="text-rose-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-0.5">Avoid This Year</h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-body">{sign.yearlyGuidance2026.caution}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lucky factors */}
          <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest">Auspicious Elements</h3>
              <p className="text-[11px] text-stone-400 mt-0.5 font-medium uppercase tracking-wider">Personal Lucky Indicators</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Lucky Colors</p>
                <p className="text-xs font-bold text-stone-950 font-body">{sign.luckyColors.join(", ")}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Lucky Numbers</p>
                <p className="text-xs font-bold text-stone-950 font-body">{sign.luckyNumbers.join(", ")}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Compatible Signs</p>
                <p className="text-xs font-bold text-stone-950 font-body">{sign.compatibleSigns.join(", ")}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Challenging Signs</p>
                <p className="text-xs font-bold text-stone-950 font-body">{sign.challengingSigns.join(", ")}</p>
              </div>
            </div>
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

export default AppChineseHoroscopeDetail;
