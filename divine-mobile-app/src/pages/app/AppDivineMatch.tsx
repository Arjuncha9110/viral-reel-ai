import React, { useState } from "react";
import AppShell from "./AppShell";
import { Heart, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { BirthDatePicker } from "../../components/shared/BirthDatePicker";
import { LocationSelector, LocationData } from "../../components/LocationSelector";
import { calculateAshtakoot, AshtakootResult } from "../../lib/calculators/astrology/ashtakoot";
import { getSiderealMoon, getNakshatra } from "../../lib/calculators/astrology/nakshatra";
import { cn } from "../../lib/utils";
import { format } from "date-fns";

const defaultLocation: LocationData = {
  name: "Bengaluru",
  stateCode: "KA",
  countryCode: "IN",
  lat: 12.9716,
  lon: 77.5946,
  timezone: "Asia/Kolkata",
};

const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

function getBirthDateAsUTC(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30)); // rough IST→UTC
}

const KOOT_LABELS: { key: keyof AshtakootResult; label: string; max: number }[] = [
  { key: "varna",       label: "Varna",        max: 1  },
  { key: "vashya",      label: "Vashya",       max: 2  },
  { key: "tara",        label: "Tara",         max: 3  },
  { key: "yoni",        label: "Yoni",         max: 4  },
  { key: "grahaMaitri", label: "Graha Maitri", max: 5  },
  { key: "gana",        label: "Gana",         max: 6  },
  { key: "bhakoot",     label: "Bhakoot",      max: 7  },
  { key: "nadi",        label: "Nadi",         max: 8  },
];

function getVerdict(score: number): { label: string; color: string; emoji: string } {
  if (score >= 32) return { label: "Excellent Match", color: "text-emerald-600", emoji: "💚" };
  if (score >= 27) return { label: "Good Match",      color: "text-emerald-500", emoji: "🌿" };
  if (score >= 21) return { label: "Average Match",   color: "text-amber-600",   emoji: "⚡" };
  if (score >= 18) return { label: "Acceptable",      color: "text-amber-500",   emoji: "🌤" };
  return { label: "Low Compatibility", color: "text-rose-600", emoji: "⚠️" };
}

interface PersonState {
  name: string;
  date: string;
  time: string;
  location: LocationData;
}

const PersonForm: React.FC<{
  label: string;
  state: PersonState;
  onChange: (s: PersonState) => void;
}> = ({ label, state, onChange }) => (
  <div className="bg-white rounded-2xl border border-amber-100 p-4 space-y-3">
    <p className="text-xs font-bold uppercase tracking-widest text-stone-500">{label}</p>
    <input
      type="text"
      placeholder="Full Name (optional)"
      value={state.name}
      onChange={(e) => onChange({ ...state, name: e.target.value })}
      className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-900 focus:outline-none focus:border-amber-400"
    />
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Date of Birth</label>
      <BirthDatePicker value={state.date} onChange={(d) => onChange({ ...state, date: d })} />
    </div>
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Time of Birth</label>
      <input
        type="time"
        value={state.time}
        onChange={(e) => onChange({ ...state, time: e.target.value })}
        className="w-full h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-900 focus:outline-none focus:border-amber-400"
      />
    </div>
    <LocationSelector
      onLocationSelect={(loc) => onChange({ ...state, location: loc as LocationData })}
      initialCity={state.location.name}
    />
  </div>
);

const AppDivineMatch: React.FC = () => {
  const [boy, setBoy] = useState<PersonState>({ name: "", date: "", time: "12:00", location: { ...defaultLocation } });
  const [girl, setGirl] = useState<PersonState>({ name: "", date: "", time: "12:00", location: { ...defaultLocation } });
  const [result, setResult] = useState<AshtakootResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openKoot, setOpenKoot] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    if (!boy.date || !girl.date) { setError("Please enter birth date for both persons."); return; }
    try {
      const boyUTC = getBirthDateAsUTC(boy.date, boy.time);
      const girlUTC = getBirthDateAsUTC(girl.date, girl.time);
      const boyMoon = getSiderealMoon(boyUTC);
      const girlMoon = getSiderealMoon(girlUTC);
      const boySign = SIGNS[Math.floor(boyMoon / 30)];
      const girlSign = SIGNS[Math.floor(girlMoon / 30)];
      const boyNak = getNakshatra(boyMoon).nakshatra.name;
      const girlNak = getNakshatra(girlMoon).nakshatra.name;
      const res = calculateAshtakoot(boySign, boyNak, girlSign, girlNak);
      setResult(res);
    } catch {
      setError("Calculation failed. Please check birth details.");
    }
  };

  const verdict = result ? getVerdict(result.totalScore) : null;

  return (
    <AppShell title="Divine Match" eyebrow="Kundali Milan" showBack>
      <PersonForm label={boy.name || "Person 1 (Boy)"} state={boy} onChange={setBoy} />
      <PersonForm label={girl.name || "Person 2 (Girl)"} state={girl} onChange={setGirl} />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{error}</div>
      )}

      <button
        onClick={handleCalculate}
        disabled={!boy.date || !girl.date}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
      >
        <Heart className="w-4 h-4" /> Calculate Compatibility
      </button>

      {result && verdict && (
        <>
          {/* Score ring */}
          <div className="bg-[#0f1b35] rounded-2xl p-6 text-white text-center">
            {/* SVG ring */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke={result.totalScore >= 27 ? "#10b981" : result.totalScore >= 18 ? "#f59e0b" : "#f43f5e"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - result.totalScore / 36)}`}
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="55" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold" fontFamily="serif">
                  {result.totalScore}
                </text>
                <text x="60" y="73" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">
                  out of 36
                </text>
              </svg>
            </div>
            <p className={cn("font-display text-xl font-bold mb-1", verdict.color.replace("text-", "text-"))}>
              {verdict.emoji} {verdict.label}
            </p>
            <p className="text-white/40 text-xs">
              {boy.name || "Boy"} &amp; {girl.name || "Girl"} · Ashtakoot Guna Milan
            </p>
          </div>

          {/* Koot breakdown */}
          <div className="space-y-2">
            <p className="font-display text-[15px] font-bold text-stone-800 text-center">Koot Breakdown</p>
            {KOOT_LABELS.map(({ key, label, max }) => {
              const koot = result[key] as { score: number; max: number; description: string };
              const pct = (koot.score / max) * 100;
              const isOpen = openKoot === key;
              return (
                <button
                  key={key}
                  onClick={() => setOpenKoot(isOpen ? null : key)}
                  className="w-full bg-white rounded-xl border border-stone-100 px-4 py-3 text-left"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-stone-800">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900">{koot.score}<span className="text-stone-300">/{max}</span></span>
                      {isOpen ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-rose-400")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {isOpen && (
                    <p className="text-xs text-stone-500 mt-2 leading-relaxed">{koot.description}</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Guidance */}
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
            <p className="text-[11px] text-rose-700 leading-relaxed">
              ✦ Ashtakoot scoring is one dimension of Kundali Milan. A skilled Jyotishi also examines Manglik dosha, Navamsa chart, and Dasha compatibility for a complete picture.
            </p>
          </div>
        </>
      )}
    </AppShell>
  );
};

export default AppDivineMatch;
