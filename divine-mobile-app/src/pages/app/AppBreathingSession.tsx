import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import {
  breathingRoutines, BreathingRoutine, BreathingPhase,
} from "../../data/breathingRoutines";
import { useBreathingSession } from "../../lib/breathing/sessionEngine";
import BreathingOrb from "../../components/breathing/BreathingOrb";
import BreathingCompletionScreen from "../../components/breathing/BreathingCompletionScreen";
import BreathingDisclaimer from "../../components/breathing/BreathingDisclaimer";
import {
  initAudio, playPhaseSound, playRoundComplete, playSessionComplete, SoundType,
} from "../../lib/breathing/breathingAudio";
import { ChevronLeft, Play, Pause, RotateCcw, X, Settings, Volume2, VolumeX } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomTimings {
  inhaleS: number;
  holdS:   number;
  exhaleS: number;
  restS:   number;
}

interface Preset extends CustomTimings {
  label: string;
  ratio: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESETS: Preset[] = [
  { label: "Equal",  ratio: "1:1",     inhaleS: 4,  holdS: 1, exhaleS: 4,  restS: 1 },
  { label: "Box",    ratio: "1:1:1:1", inhaleS: 4,  holdS: 4, exhaleS: 4,  restS: 4 },
  { label: "Calm",   ratio: "1:2:2:1", inhaleS: 4,  holdS: 8, exhaleS: 8,  restS: 4 },
  { label: "4-7-8",  ratio: "1:4:2",   inhaleS: 4,  holdS: 7, exhaleS: 8,  restS: 1 },
  { label: "Custom", ratio: "custom",   inhaleS: 4,  holdS: 2, exhaleS: 4,  restS: 2 },
];

const ROUNDS_OPTIONS = [3, 5, 7, 10];
const SOUND_OPTIONS: { type: SoundType; label: string }[] = [
  { type: "off",    label: "Off"   },
  { type: "bell",   label: "Bell"  },
  { type: "bowl",   label: "Bowl"  },
  { type: "chime",  label: "Chime" },
  { type: "breath", label: "Breath"},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCustomPhases(routine: BreathingRoutine, t: CustomTimings): BreathingPhase[] {
  return routine.phases.map(ph => {
    let seconds = ph.seconds;
    if (ph.action.startsWith("INHALE"))      seconds = Math.max(t.inhaleS, 1);
    else if (ph.action === "HOLD")           seconds = Math.max(t.holdS,   1);
    else if (ph.action.startsWith("EXHALE")) seconds = Math.max(t.exhaleS, 1);
    else if (ph.action === "REST")           seconds = Math.max(t.restS,   1);
    return { ...ph, seconds };
  });
}

function estimateDuration(phases: BreathingPhase[], rounds: number): number {
  const total = phases.reduce((s, p) => s + p.seconds, 0) * rounds;
  return Math.round(total / 60);
}

function loadPrefs(slug: string) {
  try {
    const raw = localStorage.getItem(`breathing_custom_${slug}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ok */ }
  return null;
}

function savePrefs(slug: string, data: object) {
  try {
    localStorage.setItem(`breathing_custom_${slug}`, JSON.stringify(data));
  } catch { /* ok */ }
}

// ─── Outer component — handles redirect ────────────────────────────────────────

const AppBreathingSession: React.FC = () => {
  const { routineSlug } = useParams<{ routineSlug: string }>();
  const routine = breathingRoutines.find(r => r.slug === routineSlug);
  if (!routine || routine.isLocked) return <Navigate to="/breathing" replace />;
  return <BreathingSessionInner routine={routine} />;
};

// ─── Inner component — always has routine, hooks unconditional ─────────────────

const BreathingSessionInner: React.FC<{ routine: BreathingRoutine }> = ({ routine }) => {
  // Load saved prefs
  const saved = loadPrefs(routine.slug);

  // Pre-session state
  const [selectedPreset, setSelectedPreset] = useState<string>(saved?.preset ?? "custom");
  const [timings, setTimings]               = useState<CustomTimings>({
    inhaleS: saved?.inhaleS ?? routine.phases.find(p => p.action.startsWith("INHALE"))?.seconds ?? 4,
    holdS:   saved?.holdS   ?? routine.phases.find(p => p.action === "HOLD")?.seconds ?? 2,
    exhaleS: saved?.exhaleS ?? routine.phases.find(p => p.action.startsWith("EXHALE"))?.seconds ?? 4,
    restS:   saved?.restS   ?? routine.phases.find(p => p.action === "REST")?.seconds ?? 2,
  });
  const [selectedRounds, setSelectedRounds] = useState<number>(saved?.rounds ?? routine.rounds);
  const [soundPref, setSoundPref]           = useState<SoundType>(saved?.sound  ?? "bell");
  const [soundVolume, setSoundVolume]       = useState<number>(saved?.volume ?? 0.65);

  // Session UI state
  const [showSettings, setShowSettings] = useState(false);

  // Derived
  const customPhases = buildCustomPhases(routine, timings);
  const estMinutes   = estimateDuration(customPhases, selectedRounds);

  // Engine
  const engine = useBreathingSession(routine.phases, routine.rounds);
  const { phaseState, currentPhase, totalRounds, displayedSeconds, refs } = engine;

  // Sound tracking refs
  const prevIndexRef = useRef(-1);
  const prevRoundRef = useRef(0);

  // Play phase sound on phase change
  useEffect(() => {
    if (!phaseState.isStarted || phaseState.isComplete || soundPref === "off") return;
    const idxChanged   = phaseState.index !== prevIndexRef.current;
    const roundChanged = phaseState.round  !== prevRoundRef.current;
    if (!idxChanged && !roundChanged) return;

    if (roundChanged && prevRoundRef.current > 0) {
      playRoundComplete(soundPref, soundVolume);
    }
    setTimeout(() => {
      playPhaseSound(currentPhase.action, soundPref, soundVolume);
    }, roundChanged ? 300 : 0);

    prevIndexRef.current = phaseState.index;
    prevRoundRef.current = phaseState.round;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseState.index, phaseState.round, phaseState.isStarted]);

  // Session complete sound
  useEffect(() => {
    if (phaseState.isComplete) playSessionComplete(soundPref, soundVolume);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseState.isComplete]);

  const applyPreset = useCallback((p: Preset) => {
    setSelectedPreset(p.ratio);
    setTimings({ inhaleS: p.inhaleS, holdS: p.holdS, exhaleS: p.exhaleS, restS: p.restS });
  }, []);

  const updateTiming = useCallback((key: keyof CustomTimings, val: number) => {
    setSelectedPreset("custom");
    setTimings(prev => ({ ...prev, [key]: val }));
  }, []);

  useEffect(() => {
    savePrefs(routine.slug, {
      preset: selectedPreset,
      ...timings,
      rounds: selectedRounds,
      sound:  soundPref,
      volume: soundVolume,
    });
  }, [routine.slug, selectedPreset, timings, selectedRounds, soundPref, soundVolume]);

  // ── Completion screen ────────────────────────────────────────────────────────
  if (phaseState.isComplete) {
    return (
      <BreathingCompletionScreen
        routine={routine}
        completedRounds={phaseState.round - 1}
        onRestart={() => engine.restart()}
      />
    );
  }

  // ── Active session ───────────────────────────────────────────────────────────
  if (phaseState.isStarted) {
    return (
      <div
        className="min-h-screen flex flex-col overflow-hidden relative"
        style={{ background: "linear-gradient(160deg, #08102b 0%, #0f1a45 50%, #130a2e 100%)" }}
      >
        {/* Star field */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top bar */}
        <div className="relative z-20 px-4 pt-5 pb-2 flex items-center justify-between">
          <button
            onClick={() => engine.end()}
            className="p-2.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-bold mb-0.5">
              Round {phaseState.round} / {totalRounds}
            </p>
            <p className="text-sm font-semibold text-white/80">{routine.title}</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <Settings className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Phase label + instruction */}
        <div className="relative z-10 flex flex-col items-center pt-6 px-6">
          <h2
            key={`${phaseState.index}-${phaseState.round}`}
            className="text-4xl font-display font-bold text-white text-center leading-tight"
          >
            {currentPhase.label}
          </h2>
          <p className="text-base text-white/60 text-center mt-2 min-h-[1.5rem]">
            {currentPhase.instruction}
          </p>
        </div>

        {/* Orb */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-4">
          <BreathingOrb
            refs={refs}
            action={currentPhase.action}
            displayedSeconds={displayedSeconds}
            isStarted={phaseState.isStarted}
            isPaused={phaseState.isPaused}
          />
        </div>

        {/* Overall progress bar */}
        <div className="relative z-20 px-8 mb-6">
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              ref={refs.overallBarRef}
              className="h-full rounded-full"
              style={{
                width: "0%",
                background: "linear-gradient(90deg, #6fa3f7, #a78be8)",
                transition: "width 0.4s linear",
              }}
            />
          </div>
          <p className="text-[10px] text-white/30 text-center mt-1.5 uppercase tracking-widest">
            Overall Progress
          </p>
        </div>

        {/* Controls */}
        <div className="relative z-20 pb-12 flex items-center justify-center gap-8">
          <button
            onClick={() => engine.restart()}
            className="p-4 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <RotateCcw className="w-5 h-5 text-white/70" />
          </button>
          <button
            onClick={phaseState.isPaused ? engine.resume : engine.pause}
            className="p-6 rounded-full shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #4e7dce, #7c5cde)",
              boxShadow: "0 0 28px rgba(100,140,255,0.45)",
            }}
          >
            {phaseState.isPaused
              ? <Play  className="w-8 h-8 text-white fill-white ml-0.5" />
              : <Pause className="w-8 h-8 text-white fill-white" />
            }
          </button>
          <button
            onClick={() => engine.end()}
            className="p-4 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Settings modal */}
        {showSettings && (
          <div
            className="absolute inset-0 z-50 flex items-end justify-center"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowSettings(false)}
          >
            <div
              className="w-full max-w-[430px] rounded-t-3xl p-6 pb-10"
              style={{ background: "linear-gradient(180deg, #0e1840, #0a0f28)" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <h3 className="text-white font-bold text-lg mb-5">Session Settings</h3>

              <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Sound</p>
              <div className="flex gap-2 flex-wrap mb-5">
                {SOUND_OPTIONS.map(s => (
                  <button
                    key={s.type}
                    onClick={() => { initAudio(); setSoundPref(s.type); }}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: soundPref === s.type ? "rgba(107,163,247,0.25)" : "rgba(255,255,255,0.07)",
                      color: soundPref === s.type ? "#6fa3f7" : "rgba(255,255,255,0.55)",
                      border: soundPref === s.type ? "1px solid rgba(107,163,247,0.5)" : "1px solid transparent",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Volume</p>
              <div className="flex items-center gap-3 mb-6">
                <VolumeX className="w-4 h-4 text-white/30" />
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={soundVolume}
                  onChange={e => setSoundVolume(Number(e.target.value))}
                  className="flex-1 accent-blue-400"
                />
                <Volume2 className="w-4 h-4 text-white/50" />
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-3 rounded-2xl font-bold text-white/80"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Pre-session panel ────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col pb-10 relative"
      style={{ background: "linear-gradient(170deg, #0a1230 0%, #0f1845 55%, #110b2a 100%)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <div className="relative z-10 px-4 pt-5 flex items-center">
        <Link
          to="/breathing"
          className="p-2.5 rounded-full mr-3"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
            {routine.category} · {routine.level}
          </p>
          <h1 className="text-xl font-display font-bold text-white leading-tight">
            {routine.title}
          </h1>
          {routine.sanskritName && (
            <p className="text-xs text-white/40 italic">{routine.sanskritName}</p>
          )}
        </div>
      </div>

      <div className="relative z-10 flex-1 px-5 pt-5 max-w-[430px] mx-auto w-full space-y-4">

        <p className="text-sm text-white/50 text-center px-2">{routine.shortDescription}</p>

        {/* Timing presets */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3">Breathing Ratio</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map(p => (
              <button
                key={p.ratio}
                onClick={() => applyPreset(p)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: selectedPreset === p.ratio ? "rgba(107,163,247,0.22)" : "rgba(255,255,255,0.06)",
                  color: selectedPreset === p.ratio ? "#6fa3f7" : "rgba(255,255,255,0.5)",
                  border: selectedPreset === p.ratio ? "1px solid rgba(107,163,247,0.45)" : "1px solid transparent",
                }}
              >
                {p.label}
                {p.ratio !== "custom" && <span className="ml-1 opacity-55 font-normal">{p.ratio}</span>}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {([
              { key: "inhaleS" as const, label: "Inhale", color: "#6fa3f7", max: 10 },
              { key: "holdS"   as const, label: "Hold",   color: "#f0b445", max: 10 },
              { key: "exhaleS" as const, label: "Exhale", color: "#5dc9cc", max: 10 },
              { key: "restS"   as const, label: "Rest",   color: "#a78be8", max: 8  },
            ]).map(({ key, label, color, max }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider w-10" style={{ color }}>
                  {label}
                </span>
                <input
                  type="range" min={1} max={max} step={1}
                  value={timings[key]}
                  onChange={e => updateTiming(key, Number(e.target.value))}
                  className="flex-1"
                  style={{ accentColor: color }}
                />
                <span className="text-xs text-white/60 w-6 text-right font-mono">{timings[key]}s</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rounds */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Rounds</p>
            <p className="text-[10px] text-white/35">≈ {estMinutes} min</p>
          </div>
          <div className="flex gap-2">
            {ROUNDS_OPTIONS.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRounds(r)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: selectedRounds === r ? "rgba(167,139,232,0.22)" : "rgba(255,255,255,0.06)",
                  color: selectedRounds === r ? "#a78be8" : "rgba(255,255,255,0.45)",
                  border: selectedRounds === r ? "1px solid rgba(167,139,232,0.45)" : "1px solid transparent",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Sound */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3">Sound Guidance</p>
          <div className="flex gap-2 flex-wrap mb-3">
            {SOUND_OPTIONS.map(s => (
              <button
                key={s.type}
                onClick={() => setSoundPref(s.type)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: soundPref === s.type ? "rgba(93,201,204,0.20)" : "rgba(255,255,255,0.06)",
                  color: soundPref === s.type ? "#5dc9cc" : "rgba(255,255,255,0.45)",
                  border: soundPref === s.type ? "1px solid rgba(93,201,204,0.4)" : "1px solid transparent",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          {soundPref !== "off" && (
            <div className="flex items-center gap-3">
              <VolumeX className="w-3.5 h-3.5 text-white/25" />
              <input
                type="range" min={0} max={1} step={0.05}
                value={soundVolume}
                onChange={e => setSoundVolume(Number(e.target.value))}
                className="flex-1"
                style={{ accentColor: "#5dc9cc" }}
              />
              <Volume2 className="w-3.5 h-3.5 text-white/40" />
            </div>
          )}
        </div>

        {/* Benefits */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Benefits</p>
          <ul className="space-y-1.5">
            {routine.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/55">
                <span className="text-white/25 mt-0.5">·</span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <BreathingDisclaimer isAdvanced={routine.level === "Advanced"} />

        {/* Start */}
        <button
          onClick={() => {
            initAudio();
            const phases = buildCustomPhases(routine, timings);
            engine.applyConfig(phases, selectedRounds);
            setTimeout(() => {
              engine.start();
              prevIndexRef.current = 0;
              prevRoundRef.current = 1;
              playPhaseSound(phases[0]?.action ?? "INHALE", soundPref, soundVolume);
            }, 50);
          }}
          className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #4e7dce, #7c5cde)",
            boxShadow: "0 4px 28px rgba(100,140,255,0.4)",
          }}
        >
          <Play className="w-5 h-5 fill-white" />
          Begin Session
        </button>

      </div>
    </div>
  );
};

export default AppBreathingSession;
