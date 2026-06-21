import React from "react";
import { Sparkles } from "lucide-react";
import AppShell from "./AppShell";

type Theme = "amber" | "indigo" | "emerald" | "rose" | "sky";

interface AppPlaceholderProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  theme?: Theme;
}

const THEMES: Record<Theme, {
  gradient: string;
  dot: string;
  badge: string;
  noteWrap: string;
  noteTitle: string;
  noteText: string;
  noteIcon: string;
}> = {
  amber: {
    gradient: "bg-gradient-to-br from-amber-400 to-orange-300",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700",
    noteWrap: "border-amber-100 bg-amber-50",
    noteTitle: "text-amber-800",
    noteText: "text-amber-700",
    noteIcon: "🕉",
  },
  indigo: {
    gradient: "bg-gradient-to-br from-indigo-500 to-indigo-400",
    dot: "bg-indigo-400",
    badge: "bg-indigo-100 text-indigo-700",
    noteWrap: "border-indigo-100 bg-indigo-50",
    noteTitle: "text-indigo-800",
    noteText: "text-indigo-700",
    noteIcon: "✦",
  },
  emerald: {
    gradient: "bg-gradient-to-br from-emerald-500 to-emerald-400",
    dot: "bg-emerald-400",
    badge: "bg-emerald-100 text-emerald-700",
    noteWrap: "border-emerald-100 bg-emerald-50",
    noteTitle: "text-emerald-800",
    noteText: "text-emerald-700",
    noteIcon: "#",
  },
  rose: {
    gradient: "bg-gradient-to-br from-rose-400 to-pink-300",
    dot: "bg-rose-400",
    badge: "bg-rose-100 text-rose-700",
    noteWrap: "border-rose-100 bg-rose-50",
    noteTitle: "text-rose-800",
    noteText: "text-rose-700",
    noteIcon: "🪔",
  },
  sky: {
    gradient: "bg-gradient-to-br from-sky-400 to-cyan-300",
    dot: "bg-sky-400",
    badge: "bg-sky-100 text-sky-700",
    noteWrap: "border-sky-100 bg-sky-50",
    noteTitle: "text-sky-800",
    noteText: "text-sky-700",
    noteIcon: "🌬",
  },
};

export const AppPlaceholder: React.FC<AppPlaceholderProps> = ({
  title,
  description = "This tool is being prepared for your Divine Panchang experience.",
  icon: Icon = Sparkles,
  theme = "amber",
}) => {
  const t = THEMES[theme];

  return (
    <AppShell title={title} eyebrow="Coming Soon" showBack>
      {/* Hero card */}
      <div className="rounded-2xl overflow-hidden border border-stone-100 bg-white shadow-sm">
        {/* Gradient banner */}
        <div className={`${t.gradient} px-5 py-8 text-center relative overflow-hidden`}>
          {/* Decorative rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full border border-white/20" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 rounded-full border border-white/25" />
          </div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-white/25 backdrop-blur flex items-center justify-center mx-auto mb-3 border border-white/40">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <h2 className="font-display text-[26px] font-bold text-white leading-tight drop-shadow-sm">
              {title}
            </h2>
            <p className="text-white/80 text-xs font-semibold mt-1 uppercase tracking-[0.15em]">
              ✦ Coming Soon ✦
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed text-stone-600 text-center">{description}</p>
        </div>

        {/* Status row */}
        <div className="border-t border-stone-50 mx-4" />
        <div className="px-5 py-4 flex items-center justify-between">
          <p className="text-[11px] text-stone-400 font-medium">Being crafted with care</p>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${t.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${t.dot}`} />
            In progress
          </span>
        </div>
      </div>

      {/* Vedic note */}
      <div className={`rounded-xl border px-4 py-3.5 flex items-start gap-3 ${t.noteWrap}`}>
        <span className="text-lg leading-none mt-0.5">{t.noteIcon}</span>
        <div>
          <p className={`text-xs font-bold mb-0.5 ${t.noteTitle}`}>Ancient Wisdom, Modern Form</p>
          <p className={`text-xs leading-relaxed ${t.noteText}`}>
            Each tool in Divine Panchang is built on classical Vedic calculations. This one is
            almost ready — check back soon.
          </p>
        </div>
      </div>
    </AppShell>
  );
};

export default AppPlaceholder;
