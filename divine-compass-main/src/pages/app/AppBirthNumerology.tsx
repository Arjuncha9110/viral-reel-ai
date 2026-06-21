import React, { useState, useEffect, useMemo } from "react";
import AppShell from "./AppShell";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Sparkles, User, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  calculateRulingNumber,
  getNumerologyProfile,
  computeLoShu,
  getFavourableDatesInMonth,
  LO_SHU_LAYOUT,
  LO_SHU_LABELS,
  DAY_NAMES,
} from "../../lib/calculators/numerology/rulingNumber";

// ─────────────────────────────────────────────────────────────────────────────
// Colour helpers
// ─────────────────────────────────────────────────────────────────────────────
const RULING_BG: Record<number, string> = {
  1: "from-amber-50 to-orange-50",
  2: "from-slate-50 to-blue-50",
  3: "from-yellow-50 to-amber-50",
  4: "from-green-50 to-emerald-50",
  5: "from-emerald-50 to-teal-50",
  6: "from-pink-50 to-rose-50",
  7: "from-violet-50 to-purple-50",
  8: "from-slate-50 to-gray-100",
  9: "from-red-50 to-orange-50",
};
const RULING_ACCENT: Record<number, string> = {
  1: "#f59e0b", 2: "#64748b", 3: "#eab308", 4: "#10b981",
  5: "#14b8a6", 6: "#ec4899", 7: "#8b5cf6", 8: "#475569", 9: "#ef4444",
};
const RULING_TEXT: Record<number, string> = {
  1: "text-amber-600", 2: "text-slate-600", 3: "text-yellow-600", 4: "text-emerald-600",
  5: "text-teal-600", 6: "text-pink-600", 7: "text-violet-600", 8: "text-slate-700", 9: "text-red-600",
};

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable card
// ─────────────────────────────────────────────────────────────────────────────
const InfoCard: React.FC<{
  label: string;
  value: string;
  bg: string;
  textColor: string;
  emoji?: string;
}> = ({ label, value, bg, textColor, emoji }) => (
  <div className={`rounded-2xl p-4 ${bg}`}>
    <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${textColor} opacity-70`}>{label}</p>
    <div className="flex items-center justify-between">
      <p className={`text-[17px] font-bold ${textColor}`}>{value}</p>
      {emoji && <span className="text-2xl opacity-60">{emoji}</span>}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Calendar component
// ─────────────────────────────────────────────────────────────────────────────
const FavourableCalendar: React.FC<{
  favourableDates: number[];
  accent: string;
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}> = ({ favourableDates, accent, year, month, onPrev, onNext }) => {
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayDay = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1;

  // Build calendar grid (6 weeks max)
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrev} className="p-2 rounded-full hover:bg-stone-100 transition-colors">
          <ChevronLeft className="w-4 h-4 text-stone-500" />
        </button>
        <p className="font-bold text-stone-800 text-[15px]">{monthNames[month]} {year}</p>
        <button onClick={onNext} className="p-2 rounded-full hover:bg-stone-100 transition-colors">
          <ChevronRight className="w-4 h-4 text-stone-500" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-stone-400 uppercase">{d}</div>
        ))}
      </div>

      {/* Days */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 mb-1">
          {week.map((day, di) => {
            const isFav = day !== null && favourableDates.includes(day);
            const isToday = day === todayDay;
            return (
              <div key={di} className="flex items-center justify-center h-9">
                {day !== null && (
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-semibold transition-all ${
                      isFav
                        ? "text-white font-bold shadow-md"
                        : isToday
                        ? "bg-stone-100 text-stone-700 font-bold"
                        : "text-stone-500"
                    }`}
                    style={isFav ? { backgroundColor: accent } : {}}
                  >
                    {day}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Lo Shu Grid
// ─────────────────────────────────────────────────────────────────────────────
const LoShuGrid: React.FC<{ loShu: ReturnType<typeof computeLoShu>; accent: string; rulingNumber: number }> = ({ loShu, accent, rulingNumber }) => {
  const [selected, setSelected] = useState<number>(rulingNumber);
  const map = Object.fromEntries(loShu.map(c => [c.position, c]));

  const selectedCell = map[selected];
  const freq = selectedCell?.count ?? 0;
  const descMap: Record<number, string> = {
    1: "Natural leader, career-driven, ambitious.",
    2: "Emotional, sensitive, relationship-focused.",
    3: "Creative, expressive, family-oriented.",
    4: "Practical, grounded, financially savvy.",
    5: "Energetic, stable centre, adaptable.",
    6: "Artistic, child-loving, imaginative.",
    7: "Intellectual, spiritual, self-aware.",
    8: "Knowledgeable, intuitive, disciplined.",
    9: "Humanitarian, compassionate, brave.",
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-4">
      <h3 className="font-bold text-stone-800 text-[16px]">Lo Shu Grid</h3>

      <div className="grid grid-cols-3 gap-2">
        {LO_SHU_LAYOUT.map((row, ri) =>
          row.map((pos) => {
            const cell = map[pos];
            const hasDigits = (cell?.count ?? 0) > 0;
            const isActive = pos === rulingNumber;
            const isSelected = pos === selected;
            return (
              <button
                key={pos}
                onClick={() => setSelected(pos)}
                className={`rounded-2xl p-3 text-left transition-all border ${
                  isSelected
                    ? "border-transparent shadow-md"
                    : "border-stone-100 hover:border-stone-200"
                } ${!hasDigits ? "opacity-40" : ""}`}
                style={isSelected ? { backgroundColor: accent + "20", borderColor: accent } : { backgroundColor: "#f9f7f4" }}
              >
                <div
                  className="text-[22px] font-bold font-display leading-none mb-1"
                  style={{ color: isSelected || isActive ? accent : hasDigits ? "#78716c" : "#d6d3d1" }}
                >
                  {hasDigits ? pos : pos}
                </div>
                <div className="text-[9px] text-stone-500 leading-tight font-medium">{LO_SHU_LABELS[pos]}</div>
              </button>
            );
          })
        )}
      </div>

      {/* Digit pill selector */}
      <div className="flex gap-2 flex-wrap">
        {loShu.filter(c => c.count > 0).map(c => (
          <button
            key={c.position}
            onClick={() => setSelected(c.position)}
            className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
              selected === c.position ? "text-white shadow-md" : "bg-stone-100 text-stone-600"
            }`}
            style={selected === c.position ? { backgroundColor: accent } : {}}
          >
            {c.position}
          </button>
        ))}
      </div>

      <p className="text-[13px] text-stone-700 font-semibold">
        {selected} is present {freq} time{freq !== 1 ? "s" : ""}.
      </p>
      <p className="text-[12px] text-stone-500 leading-relaxed">{descMap[selected]}</p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Directions grid
// ─────────────────────────────────────────────────────────────────────────────
const DirectionsGrid: React.FC<{ directions: NumerologyPersonProfile["directions"]; accent: string }> = ({ directions, accent }) => {
  const DIRS = [
    { key: "relationship", label: "Relationship", emoji: "💗", bg: "bg-pink-50", text: "text-pink-700" },
    { key: "success", label: "Success", emoji: "💼", bg: "bg-green-50", text: "text-green-700" },
    { key: "wisdom", label: "Wisdom", emoji: "💡", bg: "bg-amber-50", text: "text-amber-700" },
    { key: "health", label: "Health", emoji: "💊", bg: "bg-blue-50", text: "text-blue-700" },
  ];
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
      <h3 className="font-bold text-stone-800 text-[16px] mb-4">Directions That Suit You</h3>
      <div className="grid grid-cols-2 gap-3">
        {DIRS.map(d => (
          <div key={d.key} className={`rounded-2xl p-4 ${d.bg}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${d.text} opacity-70`}>{d.label}</p>
            <div className="flex items-center justify-between">
              <p className={`text-[16px] font-bold ${d.text}`}>
                {directions[d.key as keyof typeof directions]}
              </p>
              <span className="text-2xl">{d.emoji}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
interface NumerologyPersonProfile {
  rulingNumber: number;
  planet: string;
  favourableGod: string;
  friendlyNumbers: number[];
  enemyNumbers: number[];
  favourableAlphabets: string[];
  auspiciousColor: string;
  favourableDays: string[];
  directions: { relationship: string; success: string; wisdom: string; health: string };
  description: string;
  keywords: string[];
}

const AppBirthNumerology: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [birthDate, setBirthDate] = useState("");
  const [profileName, setProfileName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // Auto-load from profile
  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    userService.getCurrentUserProfile(currentUser.uid)
      .then(profile => {
        if (profile?.birthDetails?.date) setBirthDate(profile.birthDetails.date);
        const name = profile?.birthDetails?.name || profile?.displayName || profile?.fullName || "";
        if (name) setProfileName(name);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [currentUser, authLoading]);

  // Compute all numerology data
  const numerology = useMemo(() => {
    if (!birthDate) return null;
    try {
      const dateObj = new Date(birthDate);
      if (isNaN(dateObj.getTime())) return null;
      const ruling = calculateRulingNumber(dateObj);
      const profile = getNumerologyProfile(ruling);
      const loShu = computeLoShu(dateObj);
      const favourableDates = getFavourableDatesInMonth(profile, calYear, calMonth);
      const favourableDayNames = profile.favourableDays;
      return { ruling, profile, loShu, favourableDates, favourableDayNames, dateObj };
    } catch {
      return null;
    }
  }, [birthDate, calMonth, calYear]);

  const accent = numerology ? (RULING_ACCENT[numerology.ruling] ?? "#f59e0b") : "#f59e0b";
  const bgGrad = numerology ? (RULING_BG[numerology.ruling] ?? "from-amber-50 to-orange-50") : "from-amber-50 to-orange-50";
  const textCls = numerology ? (RULING_TEXT[numerology.ruling] ?? "text-amber-600") : "text-amber-600";

  return (
    <AppShell title="Numerology" eyebrow="Sacred Vedic Tools" showBack>
      <div className="space-y-5 pb-28">

        {/* ── Hero / Profile Header ── */}
        <div className={`bg-gradient-to-br ${bgGrad} rounded-3xl px-5 pt-6 pb-7 mx-1`}>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-stone-300/40" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-stone-300/40 rounded w-1/3" />
                  <div className="h-3 bg-stone-300/30 rounded w-1/4" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md"
                  style={{ backgroundColor: accent }}
                >
                  {profileName ? profileName[0].toUpperCase() : <User className="w-6 h-6" />}
                </div>
                <div>
                  {profileName && (
                    <h1 className="font-display text-[24px] font-bold text-stone-900 leading-tight">{profileName}</h1>
                  )}
                  {numerology && (
                    <p className={`text-[12px] font-bold uppercase tracking-widest ${textCls}`}>
                      Ruling Number {numerology.ruling}
                    </p>
                  )}
                </div>
              </div>

              {/* Date input (shown if no profile date, or always allow override) */}
              {!numerology && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-stone-700">Enter Date of Birth</label>
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="bg-white/80 border-stone-200 rounded-xl"
                  />
                  {!birthDate && (
                    <p className="text-[11px] text-stone-400">Set your birth date in Profile to auto-load.</p>
                  )}
                </div>
              )}

              {numerology && (
                <div>
                  <p className="text-[12px] text-stone-500 leading-relaxed">{numerology.profile.description}</p>
                  <div className="flex gap-2 flex-wrap mt-3">
                    {numerology.profile.keywords.map(k => (
                      <span key={k} className="px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: accent }}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Ruling Planet & God ── */}
        {numerology && (
          <div className="grid grid-cols-2 gap-3 mx-1">
            <InfoCard
              label="Ruling Planet"
              value={numerology.profile.planet}
              bg="bg-amber-50"
              textColor="text-amber-700"
              emoji="🪐"
            />
            <InfoCard
              label="Favourable God"
              value={numerology.profile.favourableGod}
              bg="bg-orange-50"
              textColor="text-orange-700"
              emoji="🙏"
            />
          </div>
        )}

        {/* ── Friendly / Enemy Numbers ── */}
        {numerology && (
          <div className="grid grid-cols-2 gap-3 mx-1">
            <div className="bg-green-50 rounded-2xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-green-700 opacity-70 mb-2">Friendly Numbers</p>
              <p className="text-[20px] font-bold text-green-700">
                {numerology.profile.friendlyNumbers.join(", ")}
              </p>
            </div>
            <div className="bg-red-50 rounded-2xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-red-700 opacity-70 mb-2">Enemy Numbers</p>
              <p className="text-[20px] font-bold text-red-700">
                {numerology.profile.enemyNumbers.join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* ── Alphabets / Color ── */}
        {numerology && (
          <div className="grid grid-cols-2 gap-3 mx-1">
            <div className="bg-orange-50 rounded-2xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700 opacity-70 mb-2">Favourable Alphabets</p>
              <p className="text-[18px] font-bold text-orange-700">
                {numerology.profile.favourableAlphabets.join(", ")}
              </p>
            </div>
            <div className="bg-sky-50 rounded-2xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-sky-700 opacity-70 mb-2">Auspicious Color</p>
              <p className="text-[18px] font-bold text-sky-700">{numerology.profile.auspiciousColor}</p>
            </div>
          </div>
        )}

        {/* ── Calendar ── */}
        {numerology && (
          <div className="mx-1">
            <h2 className="font-display text-[18px] font-bold text-stone-900 mb-3 px-1">
              Favourable Days Of The Month
            </h2>
            <FavourableCalendar
              favourableDates={numerology.favourableDates}
              accent={accent}
              year={calYear}
              month={calMonth}
              onPrev={() => {
                if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                else setCalMonth(m => m - 1);
              }}
              onNext={() => {
                if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                else setCalMonth(m => m + 1);
              }}
            />

            {/* Summary banners */}
            <div className="mt-3 space-y-2">
              <div className="rounded-2xl p-4 border border-amber-200 bg-amber-50/60 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[13px] text-stone-700">
                  <span className="font-bold">Your favorable dates: </span>
                  {numerology.favourableDates.join(", ")}
                </p>
              </div>
              <div className="rounded-2xl p-4 border border-amber-200 bg-amber-50/60 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[13px] text-stone-700">
                  <span className="font-bold">Your favorable days: </span>
                  {numerology.profile.favourableDays.join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Lo Shu Grid ── */}
        {numerology && (
          <div className="mx-1">
            <LoShuGrid loShu={numerology.loShu} accent={accent} rulingNumber={numerology.ruling} />
          </div>
        )}

        {/* ── Directions ── */}
        {numerology && (
          <div className="mx-1">
            <DirectionsGrid directions={numerology.profile.directions} accent={accent} />
          </div>
        )}

        {/* ── Guest / no data state ── */}
        {!isLoading && !numerology && !birthDate && (
          <div className="mx-1 bg-white rounded-3xl p-8 text-center border border-stone-100 shadow-sm">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="font-display text-lg font-bold text-stone-800 mb-2">Discover Your Numbers</h3>
            <p className="text-sm text-stone-500 mb-4">Enter your birth date above to reveal your personal numerology profile.</p>
          </div>
        )}

      </div>
    </AppShell>
  );
};

export default AppBirthNumerology;
