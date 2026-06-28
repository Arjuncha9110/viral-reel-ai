import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, Settings, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { BottomNav } from "../../components/dashboard/BottomNav";

// ─── Phase cycle ──────────────────────────────────────────────────────────────
const PHASES = [
  { id: "inhale_l",  label: "Breathe in...",   sub: "Left nostril",  action: "INHALE", nostril: "L" },
  { id: "hold_i1",   label: "Hold gently...",   sub: "Internal hold", action: "HOLD",   nostril: "-" },
  { id: "exhale_r",  label: "Breathe out...",   sub: "Right nostril", action: "EXHALE", nostril: "R" },
  { id: "hold_e1",   label: "Hold gently...",   sub: "External hold", action: "HOLD",   nostril: "-" },
  { id: "inhale_r",  label: "Breathe in...",    sub: "Right nostril", action: "INHALE", nostril: "R" },
  { id: "hold_i2",   label: "Hold gently...",   sub: "Internal hold", action: "HOLD",   nostril: "-" },
  { id: "exhale_l",  label: "Breathe out...",   sub: "Left nostril",  action: "EXHALE", nostril: "L" },
  { id: "hold_e2",   label: "Hold gently...",   sub: "External hold", action: "HOLD",   nostril: "-" },
];

type DurationSetting = { inhale: number; holdIn: number; exhale: number; holdOut: number };

const PRESETS = [
  { label: "Gentle 4:4:4",   settings: { inhale: 4,  holdIn: 4,  exhale: 4,  holdOut: 4  } },
  { label: "Classic 4:16:8", settings: { inhale: 4,  holdIn: 16, exhale: 8,  holdOut: 4  } },
  { label: "Advanced 6:24:12", settings: { inhale: 6, holdIn: 24, exhale: 12, holdOut: 6 } },
];

// ─── Floating particles ───────────────────────────────────────────────────────
const PARTICLES = [
  { cx: 38,  cy: 55,  r: 5, opacity: 0.35, delay: 0    },
  { cx: 240, cy: 68,  r: 6, opacity: 0.25, delay: 0.5  },
  { cx: 22,  cy: 148, r: 8, opacity: 0.20, delay: 1.1  },
  { cx: 258, cy: 140, r: 7, opacity: 0.30, delay: 0.8  },
  { cx: 60,  cy: 232, r: 5, opacity: 0.25, delay: 1.6  },
  { cx: 226, cy: 238, r: 6, opacity: 0.20, delay: 0.3  },
  { cx: 138, cy: 18,  r: 5, opacity: 0.30, delay: 1.9  },
  { cx: 145, cy: 272, r: 4, opacity: 0.25, delay: 0.7  },
  { cx: 82,  cy: 88,  r: 4, opacity: 0.18, delay: 2.1  },
  { cx: 198, cy: 94,  r: 5, opacity: 0.22, delay: 1.4  },
  { cx: 76,  cy: 198, r: 4, opacity: 0.18, delay: 0.9  },
  { cx: 202, cy: 202, r: 4, opacity: 0.20, delay: 1.7  },
];

// ─── Glow config per phase ────────────────────────────────────────────────────
const GLOW: Record<string, { arc: string; ring: string; inner: string; shadow: string }> = {
  INHALE: {
    arc:    "#5b8dd9",
    ring:   "rgba(80,130,230,0.55)",
    inner:  "rgba(50,90,200,0.30)",
    shadow: "0 0 60px 20px rgba(70,120,240,0.45), 0 0 100px 40px rgba(50,100,200,0.20)",
  },
  HOLD: {
    arc:    "#d4956a",
    ring:   "rgba(220,160,110,0.55)",
    inner:  "rgba(200,130,80,0.25)",
    shadow: "0 0 60px 20px rgba(220,160,100,0.45), 0 0 100px 40px rgba(190,120,70,0.20)",
  },
  EXHALE: {
    arc:    "#4a7bc5",
    ring:   "rgba(60,110,200,0.40)",
    inner:  "rgba(40,80,180,0.20)",
    shadow: "0 0 50px 15px rgba(60,110,200,0.35), 0 0 90px 35px rgba(40,90,180,0.15)",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
const AppNadiShodhana: React.FC = () => {
  const navigate = useNavigate();
  const [preset, setPreset] = useState(0);
  const [settings, setSettings] = useState<DurationSetting>(PRESETS[0].settings);
  const [totalMinutes, setTotalMinutes] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseTime, setPhaseTime] = useState(PRESETS[0].settings.inhale);
  const [totalTimeLeft, setTotalTimeLeft] = useState(5 * 60);
  const [roundsComplete, setRoundsComplete] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getPhaseDuration = useCallback((idx: number, s: DurationSetting): number => {
    if (idx === 0 || idx === 4) return s.inhale;
    if (idx === 1 || idx === 5) return s.holdIn;
    if (idx === 2 || idx === 6) return s.exhale;
    return s.holdOut;
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhaseIdx(0);
    setPhaseTime(settings.inhale);
    setTotalTimeLeft(totalMinutes * 60);
    setRoundsComplete(0);
  }, [settings.inhale, totalMinutes]);

  useEffect(() => { resetTimer(); }, [settings, totalMinutes]); // eslint-disable-line

  useEffect(() => {
    if (!isRunning) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setPhaseTime((prev) => {
        if (prev <= 1) {
          setPhaseIdx((pi) => {
            const next = (pi + 1) % PHASES.length;
            if (next === 0) setRoundsComplete((r) => r + 1);
            setPhaseTime(getPhaseDuration(next, settings));
            return next;
          });
          return getPhaseDuration(0, settings);
        }
        return prev - 1;
      });
      setTotalTimeLeft((t) => { if (t <= 1) { setIsRunning(false); return 0; } return t - 1; });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, settings, getPhaseDuration]);

  // ── Derived visuals ──
  const phase     = PHASES[phaseIdx];
  const phaseDur  = getPhaseDuration(phaseIdx, settings);
  const progress  = isRunning ? 1 - (phaseTime - 1) / phaseDur : 0;
  const glow      = GLOW[phase.action];

  // SVG geometry
  const CX = 140, CY = 140, R_OUTER = 122, R_INNER = 82;
  const circ = 2 * Math.PI * R_OUTER;
  const angle = progress * Math.PI * 2 - Math.PI / 2;
  const dotX = CX + R_OUTER * Math.cos(angle);
  const dotY = CY + R_OUTER * Math.sin(angle);

  // Inner orb scale
  const orbScale = isRunning
    ? phase.action === "INHALE"  ? 0.88 + 0.22 * progress
    : phase.action === "EXHALE"  ? 1.10 - 0.22 * progress
    : 1.10
    : 0.90;

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[#263d82] flex flex-col font-body" style={{ maxWidth: 430, margin: "0 auto" }}>

      {/* ── Top bar ── */}
      <div className="flex items-start justify-between px-5 pt-12 pb-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="flex gap-2">
          <button onClick={resetTimer} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <RotateCcw size={15} className="text-white/70" />
          </button>
          <button onClick={() => setShowSettings((v) => !v)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            {showSettings ? <X size={15} className="text-white/70" /> : <Settings size={15} className="text-white/70" />}
          </button>
        </div>
      </div>

      {/* ── Title ── */}
      <div className="text-center px-8 pb-6 pt-2">
        <h1 className="font-display text-[30px] font-bold text-white leading-tight mb-2">
          Nadi Shodhana
        </h1>
        <p className="text-[14px] text-white/60 leading-relaxed">
          Follow the rhythm on the screen.{"\n"}
          Alternate nostril breathing for calm & balance.
        </p>
      </div>

      {/* ── Settings drawer ── */}
      {showSettings && (
        <div className="mx-4 mb-4 rounded-2xl bg-white/10 backdrop-blur p-4 space-y-3 border border-white/15">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {PRESETS.map((p, i) => (
              <button key={p.label} onClick={() => { setPreset(i); setSettings(p.settings); }}
                className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                  preset === i ? "bg-amber-400 border-amber-400 text-stone-900" : "border-white/30 text-white/70")}>
                {p.label}
              </button>
            ))}
          </div>
          {([{ key: "inhale", label: "Inhale", max: 12 }, { key: "holdIn", label: "Hold", max: 32 },
             { key: "exhale", label: "Exhale", max: 16 }, { key: "holdOut", label: "Hold out", max: 16 }] as const).map(({ key, label, max }) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs text-white/60">
                <span>{label}</span><span>{settings[key]}s</span>
              </div>
              <input type="range" min={1} max={max} value={settings[key]}
                onChange={(e) => { setPreset(-1); setSettings((s) => ({ ...s, [key]: Number(e.target.value) })); }}
                className="w-full accent-amber-400" />
            </div>
          ))}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-white/60"><span>Session</span><span>{totalMinutes} min</span></div>
            <input type="range" min={2} max={30} value={totalMinutes} onChange={(e) => setTotalMinutes(Number(e.target.value))} className="w-full accent-amber-400" />
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-white/10 rounded-xl py-2 text-center">
              <p className="text-[9px] text-white/40 uppercase tracking-wide">Time Left</p>
              <p className="text-[15px] font-bold text-white">{fmtTime(totalTimeLeft)}</p>
            </div>
            <div className="bg-white/10 rounded-xl py-2 text-center">
              <p className="text-[9px] text-white/40 uppercase tracking-wide">Rounds</p>
              <p className="text-[15px] font-bold text-white">{roundsComplete}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Breathing Orb ── */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative" style={{ width: 280, height: 280 }}>
          <svg width={280} height={280} viewBox="0 0 280 280" className="absolute inset-0">
            {/* Floating particles */}
            {PARTICLES.map((p, i) => (
              <circle key={i} cx={p.cx} cy={p.cy} r={p.r}
                fill="white" fillOpacity={p.opacity}
                style={{ animation: `particle-float 3s ${p.delay}s ease-in-out infinite alternate` }}
              />
            ))}

            {/* Outer ring track */}
            <circle cx={CX} cy={CY} r={R_OUTER} fill="none"
              stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

            {/* Cardinal guide dots */}
            {[0, 90, 180, 270].map((deg) => {
              const rad = (deg - 90) * Math.PI / 180;
              return (
                <circle key={deg}
                  cx={CX + R_OUTER * Math.cos(rad)}
                  cy={CY + R_OUTER * Math.sin(rad)}
                  r={3} fill="rgba(255,255,255,0.35)"
                />
              );
            })}

            {/* Progress arc */}
            {isRunning && progress > 0.005 && (
              <circle cx={CX} cy={CY} r={R_OUTER}
                fill="none"
                stroke={glow.arc}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${circ * progress} ${circ}`}
                transform={`rotate(-90 ${CX} ${CY})`}
                style={{ filter: `drop-shadow(0 0 6px ${glow.arc})`, transition: "stroke-dasharray 0.85s linear" }}
              />
            )}

            {/* Orbiting glowing dot */}
            {isRunning && (
              <>
                <circle cx={dotX} cy={dotY} r={9} fill={glow.arc} opacity={0.25}
                  style={{ filter: `blur(4px)` }} />
                <circle cx={dotX} cy={dotY} r={5} fill="white"
                  style={{ filter: `drop-shadow(0 0 5px ${glow.arc})` }} />
              </>
            )}

            {/* Colored glow ring (between inner & outer) */}
            <circle cx={CX} cy={CY} r={(R_OUTER + R_INNER) / 2}
              fill="none"
              stroke={glow.ring}
              strokeWidth={R_OUTER - R_INNER - 8}
              style={{
                filter: "blur(12px)",
                transition: "stroke 1.2s ease, stroke-width 1.2s ease",
              }}
            />

            {/* Inner dark orb */}
            <circle cx={CX} cy={CY} r={R_INNER}
              fill="#121e55"
              style={{
                transform: `scale(${orbScale})`,
                transformOrigin: `${CX}px ${CY}px`,
                transition: "transform 1.0s ease-in-out",
                filter: `drop-shadow(0 0 18px ${glow.inner})`,
              }}
            />

            {/* Inner glow overlay */}
            <circle cx={CX} cy={CY} r={R_INNER - 4}
              fill={glow.inner}
              style={{
                transform: `scale(${orbScale})`,
                transformOrigin: `${CX}px ${CY}px`,
                transition: "transform 1.0s ease-in-out, fill 1.2s ease",
                filter: "blur(6px)",
              }}
            />

            {/* Nostril / lung icon */}
            <g transform={`translate(${CX - 20}, ${CY - 20})`}
               style={{ transform: `translate(${CX - 20}px, ${CY - 20}px) scale(${orbScale})`, transformOrigin: `${CX}px ${CY}px`, transition: "transform 1.0s ease-in-out" }}>
              {phase.action !== "HOLD" ? (
                /* Lung arcs */
                <>
                  <path d="M20 30 C10 22, 4 12, 8 4 C10 0, 16 0, 18 4 L20 14"
                    stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  <path d="M20 30 C30 22, 36 12, 32 4 C30 0, 24 0, 22 4 L20 14"
                    stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  <line x1="20" y1="30" x2="20" y2="38"
                    stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                </>
              ) : (
                /* Hold dots */
                <>
                  <circle cx="10" cy="20" r="3" fill="rgba(255,255,255,0.5)" />
                  <circle cx="20" cy="20" r="3" fill="rgba(255,255,255,0.7)" />
                  <circle cx="30" cy="20" r="3" fill="rgba(255,255,255,0.5)" />
                </>
              )}
            </g>

            {/* Nostril indicator */}
            <text x={CX} y={CY + 28} textAnchor="middle"
              fontSize="10" fill="rgba(255,255,255,0.35)" fontFamily="sans-serif">
              {phase.nostril === "L" ? "◉ · ○" : phase.nostril === "R" ? "○ · ◉" : "· · ·"}
            </text>
          </svg>

          {/* Box shadow glow effect (outside SVG) */}
          <div className="absolute rounded-full pointer-events-none"
            style={{
              top: 140 - R_INNER, left: 140 - R_INNER,
              width: R_INNER * 2, height: R_INNER * 2,
              boxShadow: isRunning ? glow.shadow : "none",
              borderRadius: "50%",
              transition: "box-shadow 1.2s ease",
            }}
          />
        </div>
      </div>

      {/* ── Phase label ── */}
      <div className="text-center py-4">
        <p className="font-display text-[22px] font-semibold"
           style={{ color: "#f0b445", transition: "opacity 0.4s" }}>
          {isRunning ? phase.label : "Tap to begin"}
        </p>
        {isRunning && (
          <p className="text-[12px] text-white/40 mt-1">{phase.sub}</p>
        )}
      </div>

      {/* ── Bottom controls ── */}
      <div className="px-5 pb-10 pt-2 space-y-3">
        <button
          onClick={() => setIsRunning((r) => !r)}
          className="w-full py-4 rounded-2xl font-bold text-[16px] active:scale-[0.97] transition-transform"
          style={{ background: "#f0b445", color: "#1a2040" }}
        >
          {isRunning ? "Pause  ⏸" : "Start Session  →"}
        </button>

        {/* Compact stats when not running */}
        {!showSettings && (
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <p className="text-[9px] text-white/30 uppercase tracking-widest">Time Left</p>
              <p className="text-[13px] font-bold text-white/60">{fmtTime(totalTimeLeft)}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-white/30 uppercase tracking-widest">Rounds</p>
              <p className="text-[13px] font-bold text-white/60">{roundsComplete}</p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />

      {/* ── Particle float keyframes ── */}
      <style>{`
        @keyframes particle-float {
          0%   { transform: translateY(0px);  opacity: 0.3; }
          50%  { transform: translateY(-8px); opacity: 0.55; }
          100% { transform: translateY(2px);  opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default AppNadiShodhana;
