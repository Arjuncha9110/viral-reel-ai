import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BreathingRoutine } from "../../data/breathingRoutines";
import { recordSessionComplete, getBreathingStats, BreathingStats, getAchievements } from "../../lib/breathing/streaks";
import { Flame, RotateCcw, CheckCircle2, Sparkles, Bot } from "lucide-react";

interface BreathingCompletionScreenProps {
  routine:          BreathingRoutine;
  completedRounds?: number;
  onRestart:        () => void;
}

// 7-day history dots
function StreakDots({ stats }: { stats: BreathingStats }) {
  // Build last 7 days activity from sessionDates (array of ISO date strings in streaks.ts)
  const today     = new Date();
  const days      = ["S", "M", "T", "W", "T", "F", "S"];
  const last7     = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const activeDates: Set<string> = new Set(stats.completedDates ?? []);

  return (
    <div className="flex items-end gap-2 justify-center">
      {last7.map((date, i) => {
        const isActive  = activeDates.has(date);
        const isToday   = i === 6;
        return (
          <div key={date} className="flex flex-col items-center gap-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, #f97316, #f59e0b)"
                  : "rgba(255,255,255,0.07)",
                boxShadow: isActive ? "0 0 10px rgba(251,146,60,0.45)" : undefined,
                border: isToday && !isActive ? "1px solid rgba(255,255,255,0.18)" : undefined,
              }}
            >
              {isActive && <Flame className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-[9px] text-white/30 uppercase font-bold">
              {days[(new Date(date).getDay())]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const BreathingCompletionScreen: React.FC<BreathingCompletionScreenProps> = ({
  routine, completedRounds, onRestart,
}) => {
  const [stats,    setStats]    = useState<BreathingStats | null>(null);
  const [unlocked, setUnlocked] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rounds = completedRounds ?? routine.rounds;
    const mins   = Math.max(
      1,
      Math.round((routine.phases.reduce((s, p) => s + p.seconds, 0) * rounds) / 60),
    );
    const newStats = recordSessionComplete(routine.slug, mins, rounds);
    setStats(newStats);
    setUnlocked(getAchievements(newStats));
  }, [routine, completedRounds]);

  if (!stats) return null;

  return (
    <div
      className="min-h-screen flex flex-col items-center pb-16 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #08102b 0%, #0f1a45 50%, #130a2e 100%)" }}
    >
      {/* Star field */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Glow behind hero */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(251,146,60,0.14) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      <div className="relative z-10 w-full max-w-[430px] px-5 pt-14 flex flex-col items-center gap-6">

        {/* Hero icon */}
        <div
          className="w-22 h-22 rounded-full flex items-center justify-center shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #f97316, #f59e0b)",
            boxShadow: "0 0 40px rgba(251,146,60,0.5)",
            width: 88, height: 88,
          }}
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-1">Session Complete</h2>
          <p className="text-sm text-white/50">
            {completedRounds ?? routine.rounds} rounds of {routine.title}
          </p>
        </div>

        {/* Stats grid */}
        <div className="w-full grid grid-cols-3 gap-3">
          {[
            { value: stats.currentStreak, label: "Day Streak", color: "#f97316", icon: "🔥" },
            { value: stats.totalSessions, label: "Sessions",   color: "#6fa3f7", icon: "✦"  },
            { value: stats.totalMinutes,  label: "Minutes",    color: "#5dc9cc", icon: "⏱"  },
          ].map(({ value, label, color, icon }) => (
            <div
              key={label}
              className="rounded-2xl p-4 text-center"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color, opacity: 0.85 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* 7-day streak tracker */}
        <div
          className="w-full rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs uppercase tracking-widest text-white/40 font-bold">
              7-Day Sadhana
            </span>
          </div>
          <StreakDots stats={stats} />
        </div>

        {/* Achievements */}
        {unlocked.length > 0 && (
          <div
            className="w-full rounded-2xl p-4"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs uppercase tracking-widest text-amber-400/70 font-bold">
                Unlocked
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {unlocked.map(ach => (
                <span
                  key={ach}
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "rgba(245,158,11,0.15)",
                    color: "#fbbf24",
                    border: "1px solid rgba(245,158,11,0.25)",
                  }}
                >
                  ✦ {ach}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="w-full space-y-3 pt-1">
          <Link
            to="/divine-ai"
            className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #4e7dce, #7c5cde)",
              boxShadow: "0 4px 24px rgba(100,140,255,0.35)",
            }}
          >
            <Bot className="w-5 h-5" />
            Reflect with Divine AI Guru
          </Link>

          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-2xl font-bold"
            style={{
              background: "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <RotateCcw className="w-4 h-4 inline mr-2 opacity-70" />
            Practice Again
          </button>

          <Link
            to="/breathing"
            className="block text-center py-3 font-bold"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Choose Another Routine
          </Link>
        </div>

      </div>
    </div>
  );
};

export default BreathingCompletionScreen;
