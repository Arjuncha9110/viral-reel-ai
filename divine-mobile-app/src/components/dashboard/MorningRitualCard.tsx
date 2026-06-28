import React, { useState } from "react";
import { Sun, Play, Volume2 } from "lucide-react";

interface MorningRitualCardProps {
  sunrise?: string;
}

const DAILY_SANKALPA = "I begin today with clarity, devotion, and peace.";

export const MorningRitualCard: React.FC<MorningRitualCardProps> = ({ sunrise }) => {
  const [omPlaying, setOmPlaying] = useState(false);

  const handleOmChant = () => {
    setOmPlaying(true);
    // Play Om using Web Audio API
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(136.1, ctx.currentTime); // Om frequency
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.3);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 3.5);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 5);
      setTimeout(() => setOmPlaying(false), 5200);
    } catch {
      setOmPlaying(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 shadow-sm">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6e3] via-[#fff8ee] to-[#fef3dc]" />

      {/* Decorative mandala watermark */}
      <div className="absolute -right-6 -top-6 w-36 h-36 opacity-[0.07]">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" stroke="#b45309" strokeWidth="1" />
          <circle cx="50" cy="50" r="36" stroke="#b45309" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="24" stroke="#b45309" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="12" stroke="#b45309" strokeWidth="0.8" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="50" y1="2"
              x2="50" y2="98"
              stroke="#b45309"
              strokeWidth="0.5"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
          {[0, 30, 60, 90, 120, 150].map((deg) => (
            <ellipse
              key={deg}
              cx="50" cy="30"
              rx="6" ry="14"
              stroke="#b45309"
              strokeWidth="0.5"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
              <Sun size={14} className="text-amber-600" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-700">Morning Ritual</span>
          </div>
          {sunrise && (
            <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
              <Sun size={11} className="text-amber-400" />
              <span>Sunrise {sunrise}</span>
            </div>
          )}
        </div>

        {/* Mantra block */}
        <div className="mb-4 text-center">
          <p className="font-display text-[26px] text-amber-800 leading-tight tracking-wide mb-1">
            ॐ गं गणपतये नमः
          </p>
          <p className="text-[11px] text-stone-500 italic">"May obstacles be removed today."</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-amber-200/60" />
          <span className="text-amber-400 text-[10px]">✦</span>
          <div className="flex-1 h-px bg-amber-200/60" />
        </div>

        {/* Sankalpa */}
        <div className="mb-5 px-1">
          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Today's Sankalpa</p>
          <p className="text-[13px] text-stone-700 font-medium leading-relaxed italic">
            "{DAILY_SANKALPA}"
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            href="/kundali"
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[13px] font-bold text-center shadow-sm active:scale-[0.97] transition-transform"
          >
            Start Morning Prayer
          </a>
          <button
            onClick={handleOmChant}
            disabled={omPlaying}
            className="w-12 h-12 rounded-xl border border-amber-200 bg-white flex items-center justify-center shadow-sm active:scale-[0.97] transition-all disabled:opacity-60 flex-shrink-0"
            title="Play Om Chant"
          >
            {omPlaying ? (
              <Volume2 size={18} className="text-amber-600 animate-pulse" />
            ) : (
              <Play size={16} className="text-amber-600 fill-amber-600" />
            )}
          </button>
        </div>

        {omPlaying && (
          <p className="text-center text-[10px] text-amber-600 font-medium mt-2 animate-pulse">
            ॐ — chanting...
          </p>
        )}
      </div>
    </div>
  );
};
