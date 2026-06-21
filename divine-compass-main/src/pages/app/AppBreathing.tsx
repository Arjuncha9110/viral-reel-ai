import React, { useState, useEffect } from "react";
import AppShell from "./AppShell";
import { breathingRoutines } from "../../data/breathingRoutines";
import BreathingRoutineCard from "../../components/breathing/BreathingRoutineCard";
import BreathingPremiumCTA from "../../components/breathing/BreathingPremiumCTA";
import { getBreathingStats, BreathingStats } from "../../lib/breathing/streaks";
import { Flame, Clock, CalendarDays, Wind } from "lucide-react";

const FILTER_META: Record<string, { emoji: string; color: string }> = {
  All:       { emoji: "✦",  color: "#78716c" },
  Calm:      { emoji: "💧", color: "#3b82f6" },
  Focus:     { emoji: "🔥", color: "#f59e0b" },
  Sleep:     { emoji: "🌙", color: "#6366f1" },
  Energy:    { emoji: "⚡", color: "#f43f5e" },
  Spiritual: { emoji: "🕉", color: "#a855f7" },
};

const AppBreathing: React.FC = () => {
  const [filter, setFilter] = useState("All");
  const [stats, setStats]   = useState<BreathingStats | null>(null);

  useEffect(() => {
    setStats(getBreathingStats());
  }, []);

  const filters         = ["All", "Calm", "Focus", "Sleep", "Energy", "Spiritual"];
  const filteredRoutines = filter === "All"
    ? breathingRoutines
    : breathingRoutines.filter(r => r.category === filter);

  return (
    <AppShell title="Guided Pranayama" eyebrow="Spiritual Practice" showBack>
      <div className="space-y-5">

        {/* ── Dark Hero Stats Card ─────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 shadow-xl"
          style={{ background: "linear-gradient(145deg, #0d1535, #1a0e3a, #0a1628)" }}
        >
          {/* Decorative star-field dots */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Gold glow */}
          <div
            className="absolute -top-8 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(251,146,60,0.18) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1">
                  Your Sadhana
                </p>
                <h2 className="text-2xl font-display font-bold text-white leading-tight">
                  Daily Practice
                </h2>
                <p className="text-sm text-white/40 mt-0.5">
                  {stats?.currentStreak
                    ? `${stats.currentStreak}-day streak 🔥`
                    : "Start your journey today"}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <Wind className="w-6 h-6 text-indigo-300" />
              </div>
            </div>

            {/* Stats row */}
            <div
              className="grid grid-cols-3 gap-0 rounded-2xl overflow-hidden"
              style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {[
                { icon: Flame,       value: stats?.currentStreak ?? 0, label: "Streak",   color: "#fb923c" },
                { icon: CalendarDays,value: stats?.totalSessions  ?? 0, label: "Sessions", color: "#6fa3f7" },
                { icon: Clock,       value: stats?.totalMinutes   ?? 0, label: "Minutes",  color: "#5dc9cc" },
              ].map(({ icon: Icon, value, label, color }, i) => (
                <div
                  key={label}
                  className={`py-4 text-center ${i > 0 ? "border-l" : ""}`}
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    <span className="text-xl font-bold text-white">{value}</span>
                  </div>
                  <p
                    className="text-[9px] uppercase tracking-widest font-bold"
                    style={{ color, opacity: 0.75 }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Filter Chips ─────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {filters.map(f => {
            const meta    = FILTER_META[f];
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95"
                style={
                  isActive
                    ? {
                        background: meta.color,
                        color: "#fff",
                        boxShadow: `0 2px 12px ${meta.color}55`,
                      }
                    : {
                        background: "#fff",
                        color: "#78716c",
                        border: "1px solid #e7e5e4",
                      }
                }
              >
                <span>{meta.emoji}</span>
                {f}
              </button>
            );
          })}
        </div>

        {/* ── Routine List ─────────────────────────────────────────────── */}
        {filteredRoutines.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🌬</div>
            <p className="text-stone-500 text-sm font-medium">No routines in this category yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRoutines.map(routine => (
              <BreathingRoutineCard key={routine.slug} routine={routine} />
            ))}
          </div>
        )}

        {/* ── Premium CTA ──────────────────────────────────────────────── */}
        <BreathingPremiumCTA />

      </div>
    </AppShell>
  );
};

export default AppBreathing;
