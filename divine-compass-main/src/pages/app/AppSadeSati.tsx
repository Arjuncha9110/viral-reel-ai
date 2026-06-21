import React, { useState, useEffect } from "react";
import AppShell from "./AppShell";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { BirthDatePicker } from "../../components/shared/BirthDatePicker";
import { LocationSelector, LocationData } from "../../components/LocationSelector";
import { Sparkles, Clock, ChevronRight, MoonStar } from "lucide-react";
import { format } from "date-fns";
import {
  getSadeSatiPhases,
  getCurrentSadeSatiStatus,
  RASHI_NAMES,
  SadeSatiPhase,
  getSiderealSaturnLongitude,
} from "../../lib/calculators/astrology/sadeSati";
import { cn } from "../../lib/utils";

const defaultLocation: LocationData = {
  name: "Bengaluru",
  stateCode: "KA",
  countryCode: "IN",
  lat: 12.9716,
  lon: 77.5946,
  timezone: "Asia/Kolkata",
};

const PHASE_COLORS = [
  { bg: "bg-amber-900/80", border: "border-amber-600/40", badge: "bg-amber-500/20 text-amber-300", label: "Rising" },
  { bg: "bg-red-950/80",   border: "border-red-600/40",   badge: "bg-red-500/20 text-red-300",   label: "Peak"   },
  { bg: "bg-emerald-950/80", border: "border-emerald-600/40", badge: "bg-emerald-500/20 text-emerald-300", label: "Setting" },
];

const PHASE_TIPS: Record<number, { title: string; tips: string[] }> = {
  0: { title: "Rising Phase", tips: ["Reduce non-essential spending", "Begin a daily spiritual practice", "Avoid major new commitments"] },
  1: { title: "Peak Phase",   tips: ["Work hard without ego", "Maintain health — don't ignore symptoms", "Patience over reaction — always"] },
  2: { title: "Setting Phase", tips: ["Consolidate savings and investments", "Reconnect with family — bonds deepen", "Step into the role you have earned"] },
};

const AppSadeSati: React.FC = () => {
  const { currentUser } = useAuth();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [location, setLocation] = useState<LocationData>(defaultLocation);
  const [loaded, setLoaded] = useState(false);
  const [results, setResults] = useState<{
    phases: SadeSatiPhase[];
    currentStatus: string;
    activePhase: SadeSatiPhase | null;
    currentSaturnSign: string;
  } | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    userService.getUserProfile(currentUser.uid).then((profile) => {
      if (profile?.birthDetails) {
        const bd = profile.birthDetails;
        if (bd.date) setBirthDate(bd.date);
        if (bd.time) setBirthTime(bd.time);
        if (bd.latitude && bd.longitude) {
          setLocation({
            name: bd.city || "Birth City",
            stateCode: bd.state || "",
            countryCode: bd.country || "",
            lat: bd.latitude,
            lon: bd.longitude,
            timezone: bd.timezoneId || "Asia/Kolkata",
          });
        }
      }
      setLoaded(true);
    });
  }, [currentUser]);

  const handleCalculate = () => {
    if (!birthDate) return;
    const [hours, minutes] = birthTime.split(":").map(Number);
    const dob = new Date(birthDate);
    dob.setHours(hours, minutes);
    const phases = getSadeSatiPhases(dob);
    const { status, details } = getCurrentSadeSatiStatus(phases);
    const satLon = getSiderealSaturnLongitude(new Date());
    const satSign = RASHI_NAMES[Math.floor(satLon / 30)];
    setResults({ phases, currentStatus: status, activePhase: details, currentSaturnSign: satSign });
  };

  useEffect(() => {
    if (loaded && birthDate) handleCalculate();
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const isActive = results?.currentStatus === "Currently running";

  return (
    <AppShell title="Sade Sati" eyebrow="Shani Saturn Transit" showBack>

      {/* ── Premium Hero ──────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl p-5 mb-1"
        style={{ background: "linear-gradient(145deg, #0e0c2e, #1a1050, #0a0820)" }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-10">
          <svg viewBox="0 0 100 100" fill="none" stroke="#818cf8" strokeWidth="0.7">
            <circle cx="80" cy="20" r="60" /><circle cx="80" cy="20" r="38" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #4338ca)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
            <MoonStar className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-indigo-300/60 font-bold mb-0.5">Saturn's 7.5-Year Transit</p>
            <h2 className="font-display text-lg font-bold text-white leading-tight">Shani Sade Sati</h2>
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/50 mt-3 leading-relaxed">
          Understand Saturn's karmic influence on your Moon sign — when it begins, where you are, and how to navigate it with wisdom.
        </p>
      </div>

      {/* Input card */}
      <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Date of Birth</label>
          <BirthDatePicker value={birthDate} onChange={setBirthDate} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Time of Birth</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full h-11 pl-9 pr-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-900 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
        <LocationSelector onLocationSelect={setLocation} initialCity={location.name} />
        <button
          onClick={handleCalculate}
          disabled={!birthDate}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Sparkles className="w-4 h-4" /> Calculate Sade Sati
        </button>
      </div>

      {results && (
        <>
          {/* Status + Saturn sign */}
          <div className="grid grid-cols-2 gap-3">
            <div className={cn(
              "rounded-2xl p-4 text-center border",
              isActive ? "bg-amber-50 border-amber-200" : "bg-white border-stone-100"
            )}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Sade Sati Status</p>
              <p className={cn(
                "font-display text-[15px] font-bold leading-tight",
                isActive ? "text-amber-600" : "text-stone-700"
              )}>
                {results.currentStatus}
              </p>
              {results.activePhase && (
                <p className="text-[11px] text-stone-400 mt-1">{results.activePhase.name}</p>
              )}
            </div>
            <div className="rounded-2xl p-4 text-center border border-stone-100 bg-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Saturn in</p>
              <p className="text-3xl mb-1">♄</p>
              <p className="font-display text-[15px] font-bold text-stone-700">{results.currentSaturnSign}</p>
              <p className="text-[10px] text-stone-400 mt-0.5">Real-time transit</p>
            </div>
          </div>

          {/* Phases list — dark Vedic cards */}
          <div className="space-y-2">
            <p className="font-display text-[15px] font-bold text-stone-800 text-center">Transit Timeline</p>
            {results.phases.map((phase, idx) => {
              const colIdx = idx % 3;
              const c = PHASE_COLORS[colIdx];
              const isCurrent = phase.status === "Current";
              return (
                <div key={idx} className={cn("rounded-xl border p-4", c.bg, c.border, isCurrent && "ring-2 ring-amber-400/60")}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white", c.bg)}>
                        {idx % 3 + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[14px] text-white">{phase.name}</p>
                          {isCurrent && (
                            <span className="text-[9px] font-black bg-amber-400 text-stone-900 px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse">LIVE</span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/50">{RASHI_NAMES[phase.signIndex]}</p>
                      </div>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", c.badge)}>
                      {PHASE_COLORS[colIdx].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-[11px] text-white/50">
                    <span>{format(phase.startDate, "MMM yyyy")}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>{format(phase.endDate, "MMM yyyy")}</span>
                    <span className="ml-auto">
                      {Math.round((phase.endDate.getTime() - phase.startDate.getTime()) / (1000 * 3600 * 24 * 30.44))} months
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Phase guide cards */}
          <div className="space-y-2">
            <p className="font-display text-[15px] font-bold text-stone-800 text-center">Shani's Three Phases</p>
            {Object.entries(PHASE_TIPS).map(([k, v]) => {
              const c = PHASE_COLORS[Number(k)];
              return (
                <div key={k} className={cn("rounded-xl border p-4", c.bg, c.border)}>
                  <p className="font-semibold text-white text-[13px] mb-2">{v.title}</p>
                  {v.tips.map((tip) => (
                    <div key={tip} className="flex items-center gap-2 text-[11px] text-white/60 mb-1">
                      <span className="text-amber-400">▸</span>
                      {tip}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Understanding Sade Sati */}
          <div className="bg-white rounded-2xl border border-amber-100 p-5 space-y-3">
            <p className="font-display text-[15px] font-bold text-stone-800">Understanding Sade Sati</p>
            <p className="text-xs text-stone-500 leading-relaxed">
              Saturn's 7.5-year journey across three signs around your natal Moon is not a curse — it is a period of deep karmic refinement. Sade Sati does not guarantee suffering; it delivers what karma demands. Those who live with integrity and work diligently often find that Saturn rewards rather than punishes.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { icon: "🌒", label: "Phase 1", sub: "12th house — shedding" },
                { icon: "🌕", label: "Phase 2", sub: "1st house — crucible" },
                { icon: "🌘", label: "Phase 3", sub: "2nd house — harvest" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-stone-50 p-3 text-center">
                  <div className="text-xl mb-1">{item.icon}</div>
                  <p className="text-[11px] font-bold text-stone-700">{item.label}</p>
                  <p className="text-[10px] text-stone-400">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
};

export default AppSadeSati;
