import React from "react";
import AppShell from "./AppShell";
import { Link } from "react-router-dom";
import { Sparkles, Moon, Hash, Flame, Heart, Compass, MessageCircle, Info } from "lucide-react";

const GUIDES = [
  {
    id: "vedic-guide",
    name: "Vedic Guide",
    specialty: "Panchang · Muhurat · Daily Rituals",
    symbol: "☀️",
    description: "Auspicious timing, daily rituals, tithi, and Vedic calendar guidance",
    accent: "from-orange-50 to-amber-50",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    iconColor: "text-orange-500",
    icon: Sparkles,
  },
  {
    id: "kundali-guide",
    name: "Kundali Guide",
    specialty: "Birth Chart · Planets · Dasha",
    symbol: "🪐",
    description: "Insights based on your natal chart, planetary periods, and house positions",
    accent: "from-indigo-50 to-purple-50",
    border: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
    iconColor: "text-indigo-500",
    icon: Moon,
  },
  {
    id: "numerology-guide",
    name: "Numerology Guide",
    specialty: "Life Path · Name Numbers · Vibration",
    symbol: "🔢",
    description: "Sacred number patterns from your birth date and name for deeper self-knowing",
    accent: "from-blue-50 to-cyan-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    iconColor: "text-blue-500",
    icon: Hash,
  },
  {
    id: "remedy-guide",
    name: "Remedy Guide",
    specialty: "Mantras · Japa · Spiritual Actions",
    symbol: "🕉️",
    description: "Gentle remedies — mantras, gemstones, fasting, and devotional practices",
    accent: "from-red-50 to-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    iconColor: "text-rose-500",
    icon: Flame,
  },
  {
    id: "relationship-guide",
    name: "Relationship Guide",
    specialty: "Compatibility · Synastry · Bonds",
    symbol: "💞",
    description: "Compassionate Vedic wisdom for understanding love, family, and connection",
    accent: "from-pink-50 to-rose-50",
    border: "border-pink-200",
    badge: "bg-pink-100 text-pink-700",
    iconColor: "text-pink-500",
    icon: Heart,
  },
  {
    id: "career-guide",
    name: "Career Guide",
    specialty: "Dharma · Purpose · Right Action",
    symbol: "🧭",
    description: "Find your life direction through your 10th house, planets, and natal dharma",
    accent: "from-emerald-50 to-teal-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    iconColor: "text-emerald-600",
    icon: Compass,
  },
];

const AppAstroGuides: React.FC = () => {
  return (
    <AppShell title="AI Astro Guides" eyebrow="Spiritual Counsel" showBack>
      <div className="space-y-5">

        {/* Hero intro */}
        <div className="rounded-2xl bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 p-5 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-amber-400/80 mb-2">✦ Powered by AI Wisdom</p>
          <h2 className="font-display text-[22px] font-bold text-white leading-snug mb-2">
            Choose Your Guide
          </h2>
          <p className="text-xs text-white/60 leading-relaxed">
            Each guide specialises in a different aspect of your spiritual journey. Ask freely — your birth chart is already known.
          </p>
        </div>

        {/* Guide cards */}
        <div className="space-y-3">
          {GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <div
                key={guide.id}
                className={`rounded-2xl border ${guide.border} bg-gradient-to-br ${guide.accent} overflow-hidden`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar / symbol */}
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-white/80 flex items-center justify-center text-2xl flex-shrink-0">
                      {guide.symbol}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-stone-900 text-[15px] leading-snug">{guide.name}</h3>
                      </div>
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${guide.badge} mb-1.5`}>
                        {guide.specialty}
                      </span>
                      <p className="text-[12px] text-stone-500 leading-relaxed line-clamp-2">{guide.description}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-stone-400">
                      <Icon size={11} className={guide.iconColor} />
                      <span>AI spiritual guidance</span>
                    </div>
                    <Link
                      to={`/astro-guides/${guide.id}/chat`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-[12px] font-bold active:scale-[0.97] transition-transform"
                    >
                      <MessageCircle size={13} />
                      Ask
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 flex gap-3">
          <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-stone-500 leading-relaxed">
            AI guidance is for <span className="font-semibold text-stone-700">spiritual reflection and learning</span>, not a replacement for professional advice.
          </p>
        </div>
      </div>
    </AppShell>
  );
};

export default AppAstroGuides;
