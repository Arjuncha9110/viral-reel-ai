import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Wind, Heart, Brain, Shield, Leaf, Zap, Flame, Star, Moon, Sun, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/shared/SeoHead";
import { Button } from "@/components/ui/button";
import { meditationAudio, SoundMode } from "@/lib/audio";

// Phases:
// 0: Inhale L, 1: Hold (Internal), 2: Exhale R, 3: Hold (External)
// 4: Inhale R, 5: Hold (Internal), 6: Exhale L, 7: Hold (External)
const PHASES = [
  { id: "inhale_l", label: "Inhale Left Nostril", action: "INHALE", nostril: "Left" },
  { id: "hold_i1", label: "Hold Breath", action: "HOLD", nostril: "Internal" },
  { id: "exhale_r", label: "Exhale Right Nostril", action: "EXHALE", nostril: "Right" },
  { id: "hold_e1", label: "Hold Breath", action: "HOLD", nostril: "External" },
  { id: "inhale_r", label: "Inhale Right Nostril", action: "INHALE", nostril: "Right" },
  { id: "hold_i2", label: "Hold Breath", action: "HOLD", nostril: "Internal" },
  { id: "exhale_l", label: "Exhale Left Nostril", action: "EXHALE", nostril: "Left" },
  { id: "hold_e2", label: "Hold Breath", action: "HOLD", nostril: "External" }
];

const BENEFITS = [
  { icon: Brain,  title: "Brain Balance",       desc: "Synchronizes the two hemispheres of the brain, improving focus and inducing a deep state of calm." },
  { icon: Shield, title: "Nervous System",      desc: "Shifts the body out of fight-or-flight (sympathetic) and into rest-and-digest (parasympathetic)." },
  { icon: Heart,  title: "Emotional Stability", desc: "Clears emotional blockages, reduces anxiety, and creates a profound sense of inner peace." },
  { icon: Leaf,   title: "Respiratory Health",  desc: "Strengthens the lungs, improves oxygenation, and clears toxins from the respiratory system." },
  { icon: Zap,    title: "Toxin Clearance",     desc: "Deep rhythmic breathing eliminates stale air and toxins, purifying the blood and body." },
  { icon: Star,   title: "Spiritual Preparation", desc: "Balances vital energies (Prana), preparing the mind for deep meditation and higher awareness." },
];

export default function NadiShodhanaPage() {
  const [inhale, setInhale] = useState(4);
  const [holdInternal, setHoldInternal] = useState(16);
  const [exhale, setExhale] = useState(8);
  const [holdExternal, setHoldExternal] = useState(4);
  const [totalDurationMin, setTotalDurationMin] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundMode, setSoundMode] = useState<SoundMode>("sohum");
  const [volume, setVolume] = useState(0.75);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeftInPhase, setTimeLeftInPhase] = useState(inhale);
  const [totalTimeLeft, setTotalTimeLeft] = useState(totalDurationMin * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getPhaseDuration = (index: number) => {
    if (index === 0 || index === 4) return inhale;
    if (index === 1 || index === 5) return holdInternal;
    if (index === 2 || index === 6) return exhale;
    if (index === 3 || index === 7) return holdExternal;
    return 0;
  };

  const handleStart = () => {
    meditationAudio.setEnabled(soundEnabled);
    meditationAudio.setMode(soundMode);
    if (!isRunning) {
      meditationAudio.init();
      if (timeLeftInPhase === getPhaseDuration(phaseIndex)) {
        meditationAudio.playSound(
          PHASES[phaseIndex].action as 'INHALE' | 'EXHALE' | 'HOLD',
          getPhaseDuration(phaseIndex)
        );
      }
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    meditationAudio.stop();
  };

  const handleReset = () => {
    setIsRunning(false);
    meditationAudio.stop();
    setPhaseIndex(0);
    setTimeLeftInPhase(inhale);
    setTotalTimeLeft(totalDurationMin * 60);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    meditationAudio.setEnabled(next);
  };

  const applyPreset = (i: number, hi: number, e: number, he: number) => {
    setInhale(i); setHoldInternal(hi); setExhale(e); setHoldExternal(he);
    if (!isRunning && phaseIndex === 0) setTimeLeftInPhase(i);
  };

  useEffect(() => {
    if (!isRunning) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setTotalTimeLeft((prev) => {
        if (prev <= 1) { handleReset(); return 0; }
        return prev - 1;
      });
      setTimeLeftInPhase((prev) => {
        if (prev <= 1) {
          let nextPhase = (phaseIndex + 1) % 8;
          while (getPhaseDuration(nextPhase) === 0) nextPhase = (nextPhase + 1) % 8;
          setPhaseIndex(nextPhase);
          const nextDur = getPhaseDuration(nextPhase);
          meditationAudio.playSound(PHASES[nextPhase].action as 'INHALE' | 'EXHALE' | 'HOLD', nextDur);
          return nextDur;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, phaseIndex, inhale, holdInternal, exhale, holdExternal, soundEnabled]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const activePhase = PHASES[phaseIndex];

  let scale = 1;
  if (activePhase.action === "INHALE") {
    const progress = 1 - (timeLeftInPhase / getPhaseDuration(phaseIndex));
    scale = 0.85 + (0.35 * progress);
  } else if (activePhase.action === "EXHALE") {
    const progress = 1 - (timeLeftInPhase / getPhaseDuration(phaseIndex));
    scale = 1.2 - (0.35 * progress);
  } else {
    scale = phaseIndex === 1 || phaseIndex === 5 ? 1.2 : 0.85;
  }

  const phaseColor =
    activePhase.action === "INHALE" ? { text: "text-emerald-400", glow: "rgba(52,211,153,0.18)", ring: "#34d399" }
    : activePhase.action === "EXHALE" ? { text: "text-rose-400", glow: "rgba(251,113,133,0.18)", ring: "#fb7185" }
    : { text: "text-[#f0c070]", glow: "rgba(240,192,112,0.15)", ring: "#f0c070" };

  const progress = 100 - (totalTimeLeft / (totalDurationMin * 60) * 100);

  return (
    <Layout>
      <SeoHead
        title="Nadi Shodhana Timer | Alternate Nostril Breathing"
        description="Interactive Nadi Shodhana (Alternate Nostril Breathing) meditation timer with precise ratio guides and audio chimes."
      />

      <div className="min-h-screen bg-[#fdf9f4] text-[#3d2b1f] pt-24 pb-20 font-sans">
        <div className="max-w-4xl mx-auto px-4">

          {/* ── Header ── */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4651a]/40" />
              <span className="text-[10px] font-extrabold tracking-[0.35em] uppercase text-[#a84810]">
                Pranayama Practice
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#d4651a]/40" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2a1508] mb-3 leading-tight">
              Nadi Shodhana<br />
              <span className="bg-gradient-to-r from-[#d4651a] via-[#c25510] to-[#a84410] bg-clip-text text-transparent">
                Pranayama Timer
              </span>
            </h1>
            <p className="text-[#8c7a6b] text-[15px] max-w-md mx-auto leading-relaxed">
              Alternate nostril breathing with precise ratio guidance, pacing cues, and sacred audio.
            </p>
          </div>

          {/* ── Main Timer Card ── */}
          <div className="relative overflow-hidden rounded-3xl shadow-[0_24px_80px_rgba(30,14,4,0.35)] max-w-xl mx-auto border border-[#3b2010]/60"
               style={{ background: "linear-gradient(160deg, #1e1008 0%, #2a1508 50%, #160c04 100%)" }}>

            {/* Ambient glow top */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(212,101,26,0.18),transparent)]" />
            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4651a]/70 to-transparent" />

            {/* Card Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#3b2010]/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d4651a]/20 flex items-center justify-center border border-[#d4651a]/30">
                  <Wind className="h-4 w-4 text-[#f09050]" />
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-widest text-sm">NADI SHODHANA</h3>
                  <p className="text-[10px] text-[#d4651a]/70 tracking-[0.2em]">नाडी शोधन प्राणायाम</p>
                </div>
              </div>
              <div className="text-[#f09050]/40 font-serif text-2xl select-none">♄</div>
            </div>

            {/* Inputs */}
            <div className="px-6 pt-6 pb-4">
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Inhale", sub: "Puraka", val: inhale, set: setInhale },
                  { label: "Hold", sub: "Antar Kumbhaka", val: holdInternal, set: setHoldInternal },
                  { label: "Exhale", sub: "Rechaka", val: exhale, set: setExhale },
                  { label: "Hold", sub: "Bahya Kumbhaka", val: holdExternal, set: setHoldExternal },
                ].map(({ label, sub, val, set }) => (
                  <div key={sub} className="text-center">
                    <label className="block text-[9px] font-bold text-[#8c7a6b]/80 uppercase mb-0.5 leading-tight">{label}</label>
                    <label className="block text-[8px] text-[#6a5a4a] mb-2 leading-tight">({sub})</label>
                    <input
                      type="number" min="0" max="60"
                      value={val}
                      onChange={e => { set(Number(e.target.value)); handleReset(); }}
                      disabled={isRunning}
                      className="w-full rounded-xl border text-center py-2 font-mono text-lg font-bold transition-colors outline-none disabled:opacity-50"
                      style={{ background: "rgba(255,255,255,0.06)", color: "#fff", borderColor: "rgba(212,101,26,0.25)" }}
                    />
                  </div>
                ))}
              </div>

              {/* Presets */}
              <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
                <span className="text-[10px] text-[#6a5a4a] uppercase tracking-wider">Presets:</span>
                {[
                  { label: "1:1:1:1", args: [4,4,4,4] as [number,number,number,number] },
                  { label: "1:2:2:1", args: [4,8,8,4] as [number,number,number,number] },
                  { label: "1:4:2:0", args: [4,16,8,0] as [number,number,number,number] },
                  { label: "1:4:2:1", args: [4,16,8,4] as [number,number,number,number] },
                ].map(({ label, args }) => (
                  <button
                    key={label}
                    onClick={() => applyPreset(...args)}
                    className="text-[10px] px-3 py-1 rounded-full border transition-all"
                    style={{ background: "rgba(212,101,26,0.10)", color: "#f09050", borderColor: "rgba(212,101,26,0.25)" }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Sound */}
              <div className="flex justify-center items-center gap-3">
                <span className="text-[10px] text-[#6a5a4a] uppercase tracking-wider">Sound:</span>
                <select
                  value={soundMode}
                  onChange={e => { setSoundMode(e.target.value as SoundMode); meditationAudio.setMode(e.target.value as SoundMode); }}
                  className="rounded-lg text-xs px-3 py-1.5 outline-none transition-colors border"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#e4cfa0", borderColor: "rgba(212,101,26,0.25)" }}
                >
                  <option value="sohum">So Hum Breath Cue</option>
                  <option value="om">Om Chant Cue</option>
                  <option value="bell">Tibetan Singing Bowl</option>
                </select>
              </div>

              <p className="mt-3 text-center text-[10px] leading-relaxed text-[#8c7a6b]">
                <span className="font-semibold text-[#d8b07f]">So Hum</span> guides inhale and exhale,
                <span className="font-semibold text-[#d8b07f]"> Om</span> gives a soft sacred chant cue,
                and <span className="font-semibold text-[#d8b07f]">Singing Bowl</span> alternates two gentle tones so you can switch breath with eyes closed.
              </p>
            </div>

            {/* ── Breathing Visualization ── */}
            <div className="relative flex flex-col items-center justify-center py-14 min-h-[320px]">

              {/* Dynamic phase glow background */}
              <div
                className="pointer-events-none absolute inset-0 transition-all duration-1000"
                style={{ background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${phaseColor.glow}, transparent)` }}
              />

              {/* Concentric breathing rings */}
              <div
                className="absolute rounded-full border transition-all duration-1000 ease-linear"
                style={{
                  width: 260, height: 260,
                  transform: `translate(-50%,-50%) scale(${scale})`,
                  top: "50%", left: "50%",
                  borderColor: `${phaseColor.ring}18`,
                  boxShadow: `0 0 60px ${phaseColor.ring}12`,
                }}
              />
              <div
                className="absolute rounded-full border transition-all duration-1000 ease-linear"
                style={{
                  width: 200, height: 200,
                  transform: `translate(-50%,-50%) scale(${scale})`,
                  top: "50%", left: "50%",
                  borderColor: `${phaseColor.ring}35`,
                  boxShadow: `0 0 30px ${phaseColor.ring}20`,
                }}
              />
              <div
                className="absolute rounded-full transition-all duration-1000 ease-linear flex items-center justify-center"
                style={{
                  width: 148, height: 148,
                  transform: `translate(-50%,-50%) scale(${scale})`,
                  top: "50%", left: "50%",
                  background: `radial-gradient(circle, ${phaseColor.ring}22 0%, transparent 70%)`,
                  borderColor: `${phaseColor.ring}55`,
                  border: `1.5px solid ${phaseColor.ring}55`,
                }}
              >
                <span className="font-serif text-6xl leading-none select-none" style={{ color: `${phaseColor.ring}30` }}>ॐ</span>
              </div>

              {/* Expanding Circle Background */}
              <div 
                className="absolute inset-0 m-auto rounded-full bg-gradient-to-tr from-[#c05621]/5 to-[#e4cfa0]/5 flex items-center justify-center transition-transform duration-1000 ease-linear pointer-events-none"
                style={{ width: '220px', height: '220px', transform: `scale(${scale})` }}
              >
                <div className="w-[200px] h-[200px] rounded-full border border-[#c05621]/10 flex items-center justify-center">
                   <span className="text-[120px] text-[#c05621]/10 font-serif leading-none absolute opacity-50">ॐ</span>
                </div>
              </div>

              {/* Circular Progress Bar */}
              <div className="absolute inset-0 m-auto flex items-center justify-center pointer-events-none" style={{ width: '260px', height: '260px' }}>
                <style>{`
                  @keyframes drain-circle {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: 753.9822; }
                  }
                `}</style>
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="130"
                    cy="130"
                    r="120"
                    stroke="#c05621"
                    strokeWidth="2"
                    fill="transparent"
                    strokeOpacity="0.1"
                  />
                  {getPhaseDuration(phaseIndex) > 0 && (
                    <circle
                      key={`${phaseIndex}-${getPhaseDuration(phaseIndex)}`}
                      cx="130"
                      cy="130"
                      r="120"
                      stroke={activePhase.action === "INHALE" ? "#34d399" : activePhase.action === "EXHALE" ? "#fb7185" : "#fbbf24"}
                      strokeWidth="6"
                      fill="transparent"
                      strokeLinecap="round"
                      style={{
                        strokeDasharray: 753.9822,
                        animation: `drain-circle ${getPhaseDuration(phaseIndex)}s linear forwards`,
                        animationPlayState: isRunning ? "running" : "paused"
                      }}
                    />
                  )}
                </svg>
              </div>

              {/* Center content */}
              <div className="relative z-10 text-center">
                <div className={`text-[11px] font-black uppercase tracking-[0.4em] mb-2 transition-colors duration-500 ${phaseColor.text}`}>
                  {activePhase.action}
                </div>
                <div className="text-[88px] font-mono leading-none text-white font-light tracking-tight"
                     style={{ textShadow: `0 0 40px ${phaseColor.ring}60` }}>
                  {timeLeftInPhase}
                </div>
                <div className="text-[11px] text-[#8c7a6b] uppercase tracking-[0.25em] mt-1 font-semibold">
                  {activePhase.nostril} Nostril
                </div>
              </div>

              {/* Round indicator */}
              <div className="absolute bottom-5 left-0 right-0 text-center">
                <span className="text-[10px] font-bold text-[#6a5040]/60 uppercase tracking-widest">
                  Round {Math.floor(phaseIndex / 8) + 1}
                </span>
              </div>
            </div>

            {/* ── Controls ── */}
            <div className="px-6 pb-8 pt-2 border-t border-[#3b2010]/60" style={{ background: "rgba(0,0,0,0.18)" }}>

              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-6 mt-4">
                <span className="text-[10px] font-bold text-[#6a5040]/50 w-10 text-right">{formatTime(0)}</span>
                <div className="flex-1 bg-white/8 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 linear"
                    style={{ width: `${progress}%`, background: "linear-gradient(90deg, #d4651a, #f09050)" }}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#f09050] w-10">{formatTime(totalTimeLeft)}</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={isRunning ? handlePause : handleStart}
                  className="flex items-center gap-2 rounded-full px-10 py-4 font-bold text-sm uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #d4651a, #a84410)",
                    boxShadow: "0 6px 28px rgba(212,101,26,0.45)",
                  }}
                >
                  {isRunning
                    ? <><Pause className="h-4 w-4" /> Pause</>
                    : <><Play className="h-4 w-4" /> Begin</>}
                </button>

                {/* Mute + Volume slider */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSound}
                    className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:bg-white/10 shrink-0"
                    style={{ borderColor: "rgba(212,101,26,0.30)", color: soundEnabled ? "#f09050" : "#6a5040" }}
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min="0" max="1" step="0.05"
                    value={volume}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setVolume(v);
                      meditationAudio.setVolume(v);
                    }}
                    className="w-24 h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #d4651a ${volume * 100}%, rgba(255,255,255,0.15) ${volume * 100}%)`,
                      accentColor: "#d4651a",
                    }}
                  />
                </div>

                <button
                  onClick={handleReset}
                  className="w-12 h-12 rounded-full flex items-center justify-center border transition-all hover:bg-white/10"
                  style={{ borderColor: "rgba(212,101,26,0.30)", color: "#6a5040" }}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Session length */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-[10px] text-[#6a5040]/60 uppercase tracking-wider">Duration:</span>
                {[5, 10, 15, 20].map(mins => (
                  <button
                    key={mins}
                    onClick={() => { setTotalDurationMin(mins); if (!isRunning) setTotalTimeLeft(mins * 60); }}
                    className="text-[10px] px-3 py-1.5 rounded-lg border font-bold transition-all"
                    style={
                      totalDurationMin === mins
                        ? { background: "linear-gradient(135deg,#d4651a,#a84410)", color: "#fff", borderColor: "#d4651a" }
                        : { background: "transparent", color: "#6a5040", borderColor: "rgba(212,101,26,0.20)" }
                    }
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Educational Content ── */}
          <div className="max-w-4xl mx-auto mt-20 space-y-16 pb-16">

            {/* What is it */}
            <section className="relative overflow-hidden rounded-3xl border border-[#e4cfa0]/50 bg-[#fffdf8] p-8 md:p-10">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4651a]/50 to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 text-[160px] leading-none opacity-[0.04] select-none font-serif text-[#d4651a]">ॐ</div>
              <h3 className="text-xl font-serif font-bold text-[#2a1508] mb-5 flex items-center gap-2">
                <Wind className="h-5 w-5 text-[#d4651a]" />
                What is Nadi Shodhana?
              </h3>
              <div className="space-y-4 text-[14.5px] text-[#6a5040] leading-relaxed relative z-10">
                <p>
                  <strong className="text-[#2a1508]">Nadi Shodhana</strong> (Sanskrit: नाडी शोधन), also known as Alternate Nostril Breathing, is a powerful practice that purifies the subtle energy channels of the mind-body organism.
                </p>
                <p>
                  In Yogic philosophy, the left nostril corresponds to <strong className="text-[#2a1508]">Ida Nadi</strong> (lunar, feminine, calming energy) and the right nostril to <strong className="text-[#2a1508]">Pingala Nadi</strong> (solar, masculine, activating energy). By consciously alternating the breath, we bring these forces into perfect balance.
                </p>
                <p>
                  The <em>internal retention</em> (Antar Kumbhaka) maximizes oxygen assimilation and prana absorption, while the <em>external retention</em> (Bahya Kumbhaka) brings the mind into a state of profound stillness.
                </p>
              </div>
            </section>

            {/* Benefits */}
            <section>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4651a]/40" />
                  <span className="text-[10px] font-extrabold tracking-[0.35em] uppercase text-[#a84810]">Benefits & Science</span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4651a]/40" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2a1508]">Benefits of Practice</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {BENEFITS.map(({ icon: Icon, title, desc }, i) => (
                  <div key={i} className="relative overflow-hidden bg-[#fffdf8] p-6 rounded-2xl border border-[#e4cfa0]/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4651a]/40 to-transparent" />
                    <div className="w-10 h-10 rounded-xl bg-[#d4651a]/10 border border-[#d4651a]/20 flex items-center justify-center mb-4 text-[#d4651a]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-[#2a1508] mb-2 text-sm uppercase tracking-wider">{title}</h4>
                    <p className="text-xs text-[#8c7a6b] leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Three Nadis */}
            <section>
              <div className="text-center mb-8">
                <h3 className="font-serif text-2xl font-bold text-[#2a1508]">The Three Nadis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Ida */}
                <div className="relative overflow-hidden rounded-2xl p-8 text-center border"
                     style={{ background: "linear-gradient(160deg,#0d1e3a,#0f2850)", borderColor: "rgba(100,160,220,0.25)" }}>
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#6ab0f0]/50 to-transparent" />
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(100,160,220,0.15)", border: "1px solid rgba(100,160,220,0.30)" }}>
                    <Moon className="h-6 w-6 text-[#8ab8f0]" />
                  </div>
                  <h4 className="font-bold text-[#8ab8f0] mb-3 uppercase tracking-widest text-sm">Ida Nadi</h4>
                  <p className="text-xs text-white/55 leading-relaxed">
                    The lunar channel ending at the left nostril. Represents cool, calming, feminine energy governing the right brain and parasympathetic nervous system.
                  </p>
                </div>
                {/* Sushumna */}
                <div className="relative overflow-hidden rounded-2xl p-8 text-center border"
                     style={{ background: "linear-gradient(160deg,#1e0e04,#2a1508)", borderColor: "rgba(212,101,26,0.40)" }}>
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4651a]/70 to-transparent" />
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(212,101,26,0.18)", border: "1px solid rgba(212,101,26,0.40)" }}>
                    <Sparkles className="h-6 w-6 text-[#f09050]" />
                  </div>
                  <h4 className="font-bold text-[#f09050] mb-3 uppercase tracking-widest text-sm">Sushumna Nadi</h4>
                  <p className="text-xs text-white/55 leading-relaxed">
                    The central channel along the spine. When Ida and Pingala are perfectly balanced, Prana enters Sushumna, awakening spiritual consciousness.
                  </p>
                </div>
                {/* Pingala */}
                <div className="relative overflow-hidden rounded-2xl p-8 text-center border"
                     style={{ background: "linear-gradient(160deg,#3a0d0d,#4a1010)", borderColor: "rgba(220,80,80,0.25)" }}>
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#f07070]/50 to-transparent" />
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(220,80,80,0.15)", border: "1px solid rgba(220,80,80,0.30)" }}>
                    <Sun className="h-6 w-6 text-[#f08888]" />
                  </div>
                  <h4 className="font-bold text-[#f08888] mb-3 uppercase tracking-widest text-sm">Pingala Nadi</h4>
                  <p className="text-xs text-white/55 leading-relaxed">
                    The solar channel ending at the right nostril. Represents warm, activating, masculine energy governing the left brain and sympathetic nervous system.
                  </p>
                </div>
              </div>
            </section>

            {/* Ratios Table */}
            <section>
              <div className="text-center mb-8">
                <h3 className="font-serif text-2xl font-bold text-[#2a1508]">Traditional Breathing Ratios</h3>
              </div>
              <div className="rounded-2xl border border-[#e4cfa0]/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr style={{ background: "linear-gradient(90deg,#d4651a,#a84410)" }}>
                        {["Level", "Ratio (In:Hold:Out:Hold)", "Seconds", "Description"].map(h => (
                          <th key={h} className="px-5 py-4 text-xs font-bold text-white uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-[#8c7a6b]">
                      {[
                        { level: "Beginner 1",       ratio: "1:0:1:0", secs: "4 : 0 : 4 : 0",   desc: "Equal inhale and exhale, no retention. Builds basic lung capacity." },
                        { level: "Beginner 2",       ratio: "1:1:1:0", secs: "4 : 4 : 4 : 0",   desc: "Introduces internal breath retention (Antar Kumbhaka)." },
                        { level: "Intermediate 1",   ratio: "1:2:2:0", secs: "4 : 8 : 8 : 0",   desc: "Extended retention and exhale for deeper nervous system calming." },
                        { level: "Intermediate 2",   ratio: "1:2:2:1", secs: "4 : 8 : 8 : 4",   desc: "Introduces external breath retention (Bahya Kumbhaka)." },
                        { level: "Advanced (Classical)", ratio: "1:4:2:0", secs: "4 : 16 : 8 : 0", desc: "The traditional text ratio. Maximizes prana absorption." },
                        { level: "Mastery",          ratio: "1:4:2:1", secs: "4 : 16 : 8 : 4",  desc: "Full mastery incorporating both internal and external retentions." },
                      ].map((row, i) => (
                        <tr key={i} className={`border-b border-[#eae2ce] ${i % 2 === 0 ? "bg-[#fffdf8]" : "bg-white"}`}>
                          <td className="px-5 py-4 font-bold text-[#4a3424] text-sm">{row.level}</td>
                          <td className="px-5 py-4 font-mono text-[#d4651a] font-semibold">{row.ratio}</td>
                          <td className="px-5 py-4 font-mono text-xs">{row.secs}</td>
                          <td className="px-5 py-4 text-xs leading-relaxed">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Guidelines + Contraindications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="relative overflow-hidden bg-[#fffdf8] p-8 rounded-2xl border border-[#e4cfa0]/50">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4651a]/40 to-transparent" />
                <h3 className="text-lg font-serif font-bold text-[#2a1508] mb-5 text-center">Practice Guidelines</h3>
                <ul className="space-y-3 text-sm text-[#6a5040] list-disc pl-5">
                  <li>Best on an empty stomach — early morning (Brahmamuhurta) or evening.</li>
                  <li>Sit with a straight spine, relaxed shoulders, and closed eyes.</li>
                  <li>Use Vishnu Mudra with your right hand (fold index and middle fingers).</li>
                  <li>Always start by exhaling fully, then inhale through the left nostril.</li>
                  <li>Breath should be smooth, silent, and effortless — never force retention.</li>
                  <li>End with an exhale through the left nostril to complete the cycle.</li>
                </ul>
              </section>

              <section className="relative overflow-hidden p-8 rounded-2xl border border-red-200 bg-red-50/60">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-400/40 to-transparent" />
                <h3 className="text-lg font-serif font-bold text-red-800 mb-5 text-center">Contraindications</h3>
                <ul className="space-y-3 text-sm text-red-700 list-disc pl-5">
                  <li><strong>Breath Retention</strong> — avoid with high blood pressure, heart conditions, or pregnancy. Use 1:0:1:0.</li>
                  <li>Do not practice during fever or completely blocked nasal passages.</li>
                  <li>If dizzy, lightheaded, or anxious — stop immediately and return to normal breathing.</li>
                  <li>Consult a qualified yoga teacher or doctor for any respiratory conditions.</li>
                </ul>
              </section>
            </div>

            {/* Quote */}
            <section className="relative overflow-hidden rounded-3xl p-10 text-center shadow-xl"
                     style={{ background: "linear-gradient(160deg,#1e0e04,#2a1508,#160c04)" }}>
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4651a]/60 to-transparent" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
                <span className="text-[220px] font-serif leading-none text-[#d4651a] opacity-[0.05]">ॐ</span>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(212,101,26,0.12),transparent)]" />
              <div className="relative z-10">
                <div className="text-2xl text-[#f09050]/40 mb-4 select-none font-serif">"</div>
                <p className="text-[#e4cfa0] font-serif italic text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-5">
                  When the breath wanders the mind also is unsteady. But when the breath is calmed the mind too will be still, and the yogi achieves long life. Therefore, one should learn to control the breath.
                </p>
                <p className="text-xs font-bold text-[#d4651a] uppercase tracking-[0.25em]">
                  — Hatha Yoga Pradipika, Chapter 2, Verse 2
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </Layout>
  );
}
