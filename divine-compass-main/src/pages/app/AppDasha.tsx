import React, { useState, useEffect } from "react";
import AppShell from "./AppShell";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { BirthDatePicker } from "../../components/shared/BirthDatePicker";
import { LocationSelector, LocationData } from "../../components/LocationSelector";
import { Clock, Sparkles, ChevronDown, ChevronRight, Star } from "lucide-react";
import { format } from "date-fns";
import {
  calculateSampleDasha,
  getCurrentDasha,
} from "../../lib/calculators/astrology/dasha";
import {
  dashaPlanets,
  planetDescriptions,
  DashaPeriod,
} from "../../lib/data/dasha";
import { cn } from "../../lib/utils";

const defaultLocation: LocationData = {
  name: "Bengaluru",
  stateCode: "KA",
  countryCode: "IN",
  lat: 12.9716,
  lon: 77.5946,
  timezone: "Asia/Kolkata",
};

const getPlanetSymbol = (name: string) =>
  dashaPlanets.find((p) => p.name === name)?.symbol ?? "☆";

const getProgress = (d: DashaPeriod) => {
  const now = Date.now();
  const total = d.endDate.getTime() - d.startDate.getTime();
  const elapsed = now - d.startDate.getTime();
  return Math.min(Math.max((elapsed / total) * 100, 0), 100);
};

const PLANET_COLORS: Record<string, string> = {
  Ketu:    "bg-stone-700 text-white",
  Venus:   "bg-pink-500 text-white",
  Sun:     "bg-amber-500 text-white",
  Moon:    "bg-sky-400 text-white",
  Mars:    "bg-red-500 text-white",
  Rahu:    "bg-indigo-600 text-white",
  Jupiter: "bg-yellow-500 text-stone-900",
  Saturn:  "bg-slate-600 text-white",
  Mercury: "bg-emerald-500 text-white",
};

const AppDasha: React.FC = () => {
  const { currentUser } = useAuth();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [location, setLocation] = useState<LocationData>(defaultLocation);
  const [loaded, setLoaded] = useState(false);
  const [results, setResults] = useState<{
    dashas: DashaPeriod[];
    current: { mahadasha: DashaPeriod | null; antardasha: DashaPeriod | null };
  } | null>(null);
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);

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
    const [year, month, day] = birthDate.split("-").map(Number);
    const [hour, minute] = birthTime.split(":").map(Number);
    const dashas = calculateSampleDasha({ year, month, day, hour, minute, timezone: location.timezone });
    const current = getCurrentDasha(dashas) as {
      mahadasha: DashaPeriod | null;
      antardasha: DashaPeriod | null;
    };
    setResults({ dashas, current });
    if (current.mahadasha) setExpandedPlanet(current.mahadasha.planet);
  };

  // Auto-calculate once profile loads
  useEffect(() => {
    if (loaded && birthDate) handleCalculate();
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppShell title="Dasha" eyebrow="Vimshottari Dasha" showBack>

      {/* ── Premium Hero ──────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl p-5 mb-1"
        style={{ background: "linear-gradient(145deg, #0d1535, #1a0e3a, #0a1628)" }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-10">
          <svg viewBox="0 0 100 100" fill="none" stroke="#f59e0b" strokeWidth="0.7">
            <circle cx="80" cy="20" r="60" /><circle cx="80" cy="20" r="38" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}>
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-amber-300/60 font-bold mb-0.5">Vimshottari 120-Year Cycle</p>
            <h2 className="font-display text-lg font-bold text-white leading-tight">Planetary Dasha</h2>
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/50 mt-3 leading-relaxed">
          Map the planetary periods that govern your life — from birth to liberation. Know which planet rules your present moment and what it brings.
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
          <Sparkles className="w-4 h-4" /> Calculate Dasha Periods
        </button>
      </div>

      {results && (
        <>
          {/* Current dasha highlight */}
          {results.current.mahadasha && (
            <div className="bg-[#0b1730] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-1.5 mb-4">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Currently Running</span>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-3xl", PLANET_COLORS[results.current.mahadasha.planet] || "bg-amber-500 text-white")}>
                    {getPlanetSymbol(results.current.mahadasha.planet)}
                  </div>
                  <p className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">Mahadasha</p>
                  <p className="font-display text-base font-bold">{results.current.mahadasha.planet}</p>
                </div>
                {results.current.antardasha && (
                  <>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                    <div className="text-center">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl", PLANET_COLORS[results.current.antardasha.planet] || "bg-amber-400 text-white")}>
                        {getPlanetSymbol(results.current.antardasha.planet)}
                      </div>
                      <p className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">Antardasha</p>
                      <p className="font-display text-sm font-bold">{results.current.antardasha.planet}</p>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-white/60 leading-relaxed mt-4">
                {planetDescriptions[results.current.mahadasha.planet]?.effects}
              </p>
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-white/40 mb-1">
                  <span>{format(results.current.mahadasha.startDate, "MMM yyyy")}</span>
                  <span>{Math.round(getProgress(results.current.mahadasha))}% complete</span>
                  <span>{format(results.current.mahadasha.endDate, "MMM yyyy")}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                    style={{ width: `${getProgress(results.current.mahadasha)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Full timeline */}
          <div className="space-y-2">
            <p className="font-display text-[15px] font-bold text-stone-800 text-center">Complete Dasha Timeline</p>
            {results.dashas.map((dasha) => {
              const isActive = results.current.mahadasha?.planet === dasha.planet;
              const isPast = new Date() > dasha.endDate;
              const isOpen = expandedPlanet === dasha.planet;

              return (
                <div
                  key={dasha.planet}
                  className={cn(
                    "rounded-xl border overflow-hidden",
                    isActive ? "border-amber-300 bg-amber-50" : "border-stone-100 bg-white"
                  )}
                >
                  <button
                    onClick={() => setExpandedPlanet(isOpen ? null : dasha.planet)}
                    className="w-full flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-xl",
                        isActive ? (PLANET_COLORS[dasha.planet] || "bg-amber-500 text-white")
                          : isPast ? "bg-stone-100 text-stone-400"
                          : "bg-stone-100 text-stone-600"
                      )}>
                        {getPlanetSymbol(dasha.planet)}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[14px] text-stone-900">{dasha.planet}</span>
                          <span className="text-[11px] text-stone-400">({dasha.years}y)</span>
                          {isActive && (
                            <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">Active</span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400">
                          {format(dasha.startDate, "MMM yyyy")} – {format(dasha.endDate, "MMM yyyy")}
                        </p>
                      </div>
                    </div>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-stone-100 pt-3 space-y-3">
                      <p className="text-xs font-semibold text-stone-700">{planetDescriptions[dasha.planet]?.meaning}</p>
                      <p className="text-xs text-stone-500 leading-relaxed">{planetDescriptions[dasha.planet]?.effects}</p>

                      {isActive && dasha.antardashas && dasha.antardashas.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-stone-600 mb-2 uppercase tracking-wide">Antardasha Periods</p>
                          <div className="space-y-1.5">
                            {dasha.antardashas.map((ad) => {
                              const isCurrentAd = results.current.antardasha?.planet === ad.planet;
                              return (
                                <div
                                  key={ad.planet}
                                  className={cn(
                                    "flex items-center justify-between px-3 py-2 rounded-lg text-xs",
                                    isCurrentAd ? "bg-amber-100 border border-amber-200" : "bg-stone-50"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{getPlanetSymbol(ad.planet)}</span>
                                    <span className="font-semibold text-stone-800">{ad.planet}</span>
                                    {isCurrentAd && (
                                      <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">NOW</span>
                                    )}
                                  </div>
                                  <span className="text-stone-400">
                                    {format(ad.startDate, "d MMM yyyy")} – {format(ad.endDate, "d MMM yyyy")}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-[11px] text-amber-700 leading-relaxed">
              ✦ This is a simplified Vimshottari Dasha calculation for guidance. For a precise reading, consult a professional astrologer with your exact birth details.
            </p>
          </div>
        </>
      )}
    </AppShell>
  );
};

export default AppDasha;
