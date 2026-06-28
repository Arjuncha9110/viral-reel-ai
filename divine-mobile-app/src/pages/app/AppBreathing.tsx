import React, { useState, useEffect } from "react";
import AppShell from "./AppShell";
import { breathingRoutines } from "../../data/breathingRoutines";
import BreathingRoutineCard from "../../components/breathing/BreathingRoutineCard";
import BreathingPremiumCTA from "../../components/breathing/BreathingPremiumCTA";
import { getBreathingStats, BreathingStats } from "../../lib/breathing/streaks";
import { Flame, Clock, CalendarDays, Wind } from "lucide-react";

const AppBreathing: React.FC = () => {
  const [filter, setFilter] = useState("All");
  const [stats, setStats] = useState<BreathingStats | null>(null);

  useEffect(() => {
    setStats(getBreathingStats());
  }, []);

  const filters = ["All", "Calm", "Focus", "Sleep", "Energy", "Spiritual"];

  const filteredRoutines = filter === "All" 
    ? breathingRoutines 
    : breathingRoutines.filter(r => r.category === filter);

  return (
    <AppShell title="Guided Pranayama" eyebrow="Wellness" showBack>
      <div className="p-4 pb-24 max-w-md mx-auto space-y-6">
        
        {/* Stats Header */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold">Your Practice</h2>
              <p className="text-indigo-200 text-sm">Find your center today.</p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
              <Wind className="w-6 h-6 text-indigo-300" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-black/20 rounded-2xl p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                <Flame className="w-4 h-4" />
                <span className="font-bold text-lg">{stats?.currentStreak || 0}</span>
              </div>
              <p className="text-[10px] text-indigo-200 uppercase tracking-wider font-bold">Day Streak</p>
            </div>
            <div className="text-center border-l border-white/10">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                <CalendarDays className="w-4 h-4" />
                <span className="font-bold text-lg">{stats?.totalSessions || 0}</span>
              </div>
              <p className="text-[10px] text-indigo-200 uppercase tracking-wider font-bold">Sessions</p>
            </div>
            <div className="text-center border-l border-white/10">
              <div className="flex items-center justify-center gap-1 text-sky-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="font-bold text-lg">{stats?.totalMinutes || 0}</span>
              </div>
              <p className="text-[10px] text-indigo-200 uppercase tracking-wider font-bold">Minutes</p>
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === f 
                  ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Routine Grid */}
        <div className="grid grid-cols-1 gap-3">
          {filteredRoutines.map(routine => (
            <BreathingRoutineCard key={routine.slug} routine={routine} />
          ))}
        </div>

        {/* Premium CTA */}
        <BreathingPremiumCTA />

      </div>
    </AppShell>
  );
};

export default AppBreathing;
