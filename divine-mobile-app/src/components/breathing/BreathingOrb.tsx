import React from "react";
import { BreathingPhaseAction } from "../../data/breathingRoutines";
import { EngineRefs } from "../../lib/breathing/sessionEngine";

interface BreathingOrbProps {
  refs:            EngineRefs;
  action:          BreathingPhaseAction;
  displayedSeconds:number;
  isStarted:       boolean;
  isPaused:        boolean;
}

// Per-action colors — transitions via CSS on color-bearing React props
const ACTION_COLORS: Record<string, { arc: string; glow: string; innerGlow: string }> = {
  INHALE:   { arc: "#6fa3f7", glow: "rgba(111,163,247,0.50)", innerGlow: "rgba(80,130,255,0.18)" },
  INHALE_L: { arc: "#6fa3f7", glow: "rgba(111,163,247,0.50)", innerGlow: "rgba(80,130,255,0.18)" },
  INHALE_R: { arc: "#6fa3f7", glow: "rgba(111,163,247,0.50)", innerGlow: "rgba(80,130,255,0.18)" },
  HOLD:     { arc: "#f0b445", glow: "rgba(240,180,70,0.55)",  innerGlow: "rgba(220,155,45,0.22)" },
  EXHALE:   { arc: "#5dc9cc", glow: "rgba(93,201,204,0.45)", innerGlow: "rgba(60,175,180,0.18)" },
  EXHALE_L: { arc: "#5dc9cc", glow: "rgba(93,201,204,0.45)", innerGlow: "rgba(60,175,180,0.18)" },
  EXHALE_R: { arc: "#5dc9cc", glow: "rgba(93,201,204,0.45)", innerGlow: "rgba(60,175,180,0.18)" },
  REST:     { arc: "#a78be8", glow: "rgba(167,139,232,0.40)", innerGlow: "rgba(140,110,210,0.16)" },
};

// CIRC must match sessionEngine.ts: 2π × 100
const CIRC = 2 * Math.PI * 100;

const BreathingOrb: React.FC<BreathingOrbProps> = ({
  refs, action, displayedSeconds, isStarted, isPaused,
}) => {
  const colors = ACTION_COLORS[action] ?? ACTION_COLORS["INHALE"];

  return (
    <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>

      {/* Ambient background glow — color-transitions via CSS */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${colors.glow.replace(/[\d.]+\)$/, "0.12)")} 0%, transparent 72%)`,
          transform: "scale(1.4)",
          transition: "background 1.4s ease",
        }}
      />

      <svg
        width="240" height="240" viewBox="0 0 240 240"
        className="absolute inset-0 overflow-visible"
      >
        <defs>
          <radialGradient id="orb-body-grad" cx="38%" cy="28%" r="68%">
            <stop offset="0%"   stopColor="#1e2c6e" />
            <stop offset="100%" stopColor="#080e2e" />
          </radialGradient>
          <filter id="orb-drop-shadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#3060dd" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ── Track ring ── */}
        <circle
          cx="120" cy="120" r="100"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="10"
        />

        {/* ── Cardinal dots ── */}
        {[0, 90, 180, 270].map(deg => {
          const rad = (deg - 90) * Math.PI / 180;
          return (
            <circle
              key={deg}
              cx={120 + 100 * Math.cos(rad)}
              cy={120 + 100 * Math.sin(rad)}
              r="3"
              fill="rgba(255,255,255,0.18)"
            />
          );
        })}

        {/* ── Progress arc (stroke-dasharray managed by engine via DOM ref, NOT a React prop) ── */}
        <circle
          ref={refs.arcRef}
          cx="120" cy="120" r="100"
          fill="none"
          stroke={colors.arc}
          strokeWidth="10"
          strokeLinecap="round"
          /* stroke-dasharray intentionally omitted — engine sets it via setAttribute */
          transform="rotate(-90 120 120)"
          style={{
            filter: `drop-shadow(0 0 9px ${colors.arc})`,
            transition: "stroke 1.3s ease",
          }}
        />

        {/* ── Soft glow ring between arc and orb ── */}
        <circle
          cx="120" cy="120" r="82"
          fill="none"
          stroke={colors.glow}
          strokeWidth="30"
          style={{
            filter: "blur(14px)",
            transition: "stroke 1.3s ease",
          }}
        />

        {/* ── Orb group: transform managed by engine via DOM ref ── */}
        {/* transform intentionally omitted from JSX — engine sets it via setAttribute */}
        <g ref={refs.orbGroupRef}>
          {/* Dark orb body */}
          <circle
            cx="120" cy="120" r="66"
            fill="url(#orb-body-grad)"
            filter="url(#orb-drop-shadow)"
          />
          {/* Inner colour glow */}
          <circle
            cx="120" cy="120" r="60"
            fill={colors.innerGlow}
            style={{
              filter: "blur(8px)",
              transition: "fill 1.3s ease",
            }}
          />
          {/* Specular highlight */}
          <ellipse
            cx="107" cy="98" rx="14" ry="10"
            fill="rgba(255,255,255,0.07)"
            transform="rotate(-20 107 98)"
          />
        </g>
      </svg>

      {/* ── Countdown + status (React-controlled, no DOM ref needed) ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <span
          className="font-display font-bold text-white leading-none"
          style={{
            fontSize: 54,
            textShadow: "0 0 24px rgba(255,255,255,0.45)",
          }}
        >
          {isStarted ? displayedSeconds : "·"}
        </span>
        {isPaused && (
          <span className="text-[10px] text-white/45 mt-1.5 uppercase tracking-[0.2em]">
            paused
          </span>
        )}
        {!isStarted && !isPaused && (
          <span className="text-[10px] text-white/35 mt-1.5 uppercase tracking-[0.2em]">
            ready
          </span>
        )}
      </div>

      {/* Initial arc placeholder (shown before engine starts) */}
      {!isStarted && (
        <svg
          width="240" height="240" viewBox="0 0 240 240"
          className="absolute inset-0 pointer-events-none opacity-30"
        >
          <circle
            cx="120" cy="120" r="100"
            fill="none"
            stroke={colors.arc}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${CIRC * 0.0} ${CIRC}`}
            transform="rotate(-90 120 120)"
          />
        </svg>
      )}

      <style>{`
        @keyframes orb-pulse {
          0%, 100% { opacity: 0.55; }
          50%       { opacity: 0.80; }
        }
      `}</style>
    </div>
  );
};

export default BreathingOrb;
