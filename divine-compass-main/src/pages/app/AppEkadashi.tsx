import React, { useState, useEffect } from "react";
import AppShell from "./AppShell";
import { EKADASHI_DATA, EkadashiEntry } from "../../lib/data/ekadashi";
import { Moon, Sparkles, Sun, CheckCircle2, AlertCircle, Info } from "lucide-react";

export const AppEkadashi: React.FC = () => {
  const [upcoming, setUpcoming] = useState<EkadashiEntry | null>(null);

  useEffect(() => {
    // Find the next upcoming Ekadashi based on current date
    const today = new Date();
    // Convert to yyyy-mm-dd
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    const next = EKADASHI_DATA.find((entry) => entry.date >= todayStr) ?? EKADASHI_DATA[EKADASHI_DATA.length - 1];
    setUpcoming(next);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(new Date(`${dateString}T00:00:00`));
    } catch {
      return dateString;
    }
  };

  return (
    <AppShell title="Ekadashi" eyebrow="Sacred Vedic Tools" showBack>
      <div className="space-y-5">
        
        {upcoming && (
          <>
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 shadow-sm border border-indigo-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest">
                  <Moon className="h-3 w-3" /> Upcoming
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  {upcoming.hinduMonth} · {upcoming.paksha} Paksha
                </span>
              </div>
              
              <h2 className="font-display text-2xl font-bold text-stone-900 mb-2">
                {upcoming.name}
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                {upcoming.shortMeaning}
              </p>

              <div className="bg-white rounded-xl p-3 border border-indigo-50 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Date</p>
                  <p className="font-bold text-stone-800 text-sm">{formatDate(upcoming.date)}</p>
                </div>
                <div className="h-8 w-px bg-stone-100"></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Difficulty</p>
                  <p className="font-bold text-stone-800 text-sm">{upcoming.difficulty}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
              <h3 className="flex items-center gap-2 text-sm font-bold text-stone-800 mb-3 pb-2 border-b border-stone-100">
                <Sun className="h-4 w-4 text-amber-500" /> Parana (Breaking Fast)
              </h3>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-sm font-medium text-amber-900 mb-1">
                  {formatDate(upcoming.paranaDate)}
                </p>
                <p className="text-xl font-bold text-amber-700 mb-2">
                  {upcoming.paranaTime}
                </p>
                <p className="text-[10px] text-amber-600/80 uppercase tracking-widest flex items-center gap-1">
                  <Info className="h-3 w-3" /> Timing varies by city and sunrise
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
              <h3 className="flex items-center gap-2 text-sm font-bold text-stone-800 mb-3 pb-2 border-b border-stone-100">
                <Sparkles className="h-4 w-4 text-emerald-500" /> Observance Guide
              </h3>
              <div className="space-y-4">
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> General Observance
                  </h4>
                  <p className="text-xs leading-relaxed text-stone-700">{upcoming.observance}</p>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-stone-800 mb-1">Beginner</h4>
                  <p className="text-xs text-stone-600 leading-relaxed pl-2 border-l-2 border-emerald-200">{upcoming.beginnerPractice}</p>
                </div>
                
                <div>
                  <h4 className="text-[11px] font-bold text-stone-800 mb-1">Devotional</h4>
                  <p className="text-xs text-stone-600 leading-relaxed pl-2 border-l-2 border-indigo-200">{upcoming.devotionalPractice}</p>
                </div>
              </div>
            </div>

            <div className="bg-stone-900 text-white rounded-2xl p-5 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Sacred Mantra</p>
              <p className="font-display text-lg font-bold">"{upcoming.mantra}"</p>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default AppEkadashi;
