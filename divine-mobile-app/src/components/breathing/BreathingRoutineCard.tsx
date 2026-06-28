import React from "react";
import { Link } from "react-router-dom";
import { Play, Lock, Clock, RefreshCw } from "lucide-react";
import { BreathingRoutine } from "../../data/breathingRoutines";

const CATEGORY_COLORS: Record<string, { pill: string; pillText: string; accent: string }> = {
  Calm:      { pill: "bg-blue-100",   pillText: "text-blue-700",   accent: "#3b82f6" },
  Focus:     { pill: "bg-amber-100",  pillText: "text-amber-700",  accent: "#f59e0b" },
  Sleep:     { pill: "bg-indigo-100", pillText: "text-indigo-700", accent: "#6366f1" },
  Energy:    { pill: "bg-rose-100",   pillText: "text-rose-700",   accent: "#f43f5e" },
  Spiritual: { pill: "bg-purple-100", pillText: "text-purple-700", accent: "#a855f7" },
};

const LEVEL_COLORS: Record<string, string> = {
  Beginner:     "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced:     "bg-rose-100 text-rose-700",
};

const BreathingRoutineCard: React.FC<{ routine: BreathingRoutine }> = ({ routine }) => {
  const cat = CATEGORY_COLORS[routine.category] ?? CATEGORY_COLORS["Calm"];

  const content = (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all active:scale-[0.98] ${
        routine.isLocked
          ? "bg-stone-50 border-stone-200 opacity-70 cursor-default"
          : "bg-white border-amber-100 hover:border-amber-200 hover:shadow-md shadow-sm"
      }`}
    >
      {/* Coloured left accent band */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: routine.isLocked ? "#d1d5db" : cat.accent }}
      />

      <div className="pl-5 pr-4 py-4 flex items-start gap-4">
        {/* Play / Lock icon circle */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{
            background: routine.isLocked
              ? "#e5e7eb"
              : `linear-gradient(135deg, ${cat.accent}22, ${cat.accent}44)`,
            border: `1.5px solid ${routine.isLocked ? "#d1d5db" : cat.accent}33`,
          }}
        >
          {routine.isLocked ? (
            <Lock className="w-4 h-4 text-stone-400" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" style={{ color: cat.accent }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-stone-900 leading-snug">{routine.title}</h3>
            {routine.isLocked && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-stone-200 text-stone-500 uppercase tracking-wide">
                Premium
              </span>
            )}
          </div>

          {routine.sanskritName && (
            <p className="text-[11px] text-stone-400 italic mt-0.5">{routine.sanskritName}</p>
          )}

          <p className="text-xs text-stone-500 leading-snug mt-1.5 line-clamp-2">
            {routine.shortDescription}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-100 text-stone-500 text-[10px] font-bold">
              <Clock className="w-3 h-3" />
              {routine.durationMinutes} min
            </span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-100 text-stone-500 text-[10px] font-bold">
              <RefreshCw className="w-3 h-3" />
              {routine.rounds} rounds
            </span>
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${cat.pill} ${cat.pillText}`}>
              {routine.category}
            </span>
            <span
              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                LEVEL_COLORS[routine.level] ?? "bg-stone-100 text-stone-500"
              }`}
            >
              {routine.level}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return routine.isLocked ? (
    <div>{content}</div>
  ) : (
    <Link to={`/breathing/${routine.slug}`}>{content}</Link>
  );
};

export default BreathingRoutineCard;
