import React, { useState, useEffect } from "react";
import AppShell from "./AppShell";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

// Weekly date label (Tue–Mon cycle)
function getWeekLabel(): string {
  const today = new Date();
  const day = today.getDay();
  const daysBack = (day - 2 + 7) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - daysBack);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
}

interface Sign {
  sign: string;
  sanskrit: string;
  symbol: string;
  element: string;
  theme: string;
  guidance: string;
  muhurat: string;
  caution: string;
}

const SIGNS: Sign[] = [
  { sign: "Aries", sanskrit: "Mesha", symbol: "♈", element: "Fire",
    theme: "Patience with momentum",
    guidance: "Mars pushes you toward fast decisions — but Mercury rewards careful communication over impulse. Focus on one priority, not five.",
    muhurat: "Tuesday and Thursday are strong action days.",
    caution: "Avoid financial commitments made in haste before Wednesday." },
  { sign: "Taurus", sanskrit: "Vrishabha", symbol: "♉", element: "Earth",
    theme: "Stability over speed",
    guidance: "Venus brings clarity to relationships and creative work. Deepen what already exists rather than starting new ventures.",
    muhurat: "Friday is particularly auspicious for important conversations.",
    caution: "Resist the urge to overspend on comfort mid-week." },
  { sign: "Gemini", sanskrit: "Mithuna", symbol: "♊", element: "Air",
    theme: "Communication is your currency",
    guidance: "Mercury amplifies your gift for words. Writing, speaking, and networking all carry positive energy this week.",
    muhurat: "Wednesday is your peak day — schedule important calls.",
    caution: "Scattered energy is the main risk. Choose two goals, not ten." },
  { sign: "Cancer", sanskrit: "Karka", symbol: "♋", element: "Water",
    theme: "Protect your inner world",
    guidance: "The Moon brings heightened sensitivity. Your intuition is accurate — trust it on personal matters.",
    muhurat: "Monday and early Thursday support inner work and rest.",
    caution: "Don't make major decisions when emotionally reactive. Wait 24 hours." },
  { sign: "Leo", sanskrit: "Simha", symbol: "♌", element: "Fire",
    theme: "Lead without ego",
    guidance: "The Sun strengthens your leadership, but Jupiter nudges you toward generosity over recognition.",
    muhurat: "Sunday opens the week with strong Leo energy — use it for bold intentions.",
    caution: "Pride in small disputes wastes energy better spent on bigger goals." },
  { sign: "Virgo", sanskrit: "Kanya", symbol: "♍", element: "Earth",
    theme: "Detail work pays off",
    guidance: "Practical tasks — health routines, financial organization, skill-building — carry above-average results this week.",
    muhurat: "Wednesday and Friday mornings are ideal for precision work.",
    caution: "Perfectionism can stall progress. Done is better than perfect." },
  { sign: "Libra", sanskrit: "Tula", symbol: "♎", element: "Air",
    theme: "Choose your balance point",
    guidance: "Venus highlights partnerships. A conversation you've been avoiding becomes easier if you lead with honesty.",
    muhurat: "Friday is your most auspicious day for relationship matters.",
    caution: "Indecision has a cost this week. Trust your first calm instinct." },
  { sign: "Scorpio", sanskrit: "Vrishchika", symbol: "♏", element: "Water",
    theme: "Depth over surface",
    guidance: "Mars and Ketu bring strong transformative energy. Research, investigation, and focus-intensive work are well-supported.",
    muhurat: "Tuesday evenings carry strong Scorpio energy for deep work.",
    caution: "Intensity directed at others becomes conflict. Direct it inward." },
  { sign: "Sagittarius", sanskrit: "Dhanu", symbol: "♐", element: "Fire",
    theme: "Expand, but stay grounded",
    guidance: "Jupiter's optimism is strong — ideas feel big and possible. Channel this into learning and philosophical exploration.",
    muhurat: "Thursday is your best day — Jupiter's day, your planet's day.",
    caution: "Over-commitment is the main risk this week. Say yes thoughtfully." },
  { sign: "Capricorn", sanskrit: "Makara", symbol: "♑", element: "Earth",
    theme: "Steady action compounds",
    guidance: "Saturn rewards consistency. Professional matters and long-term goals benefit from patient effort.",
    muhurat: "Saturday is Saturn's day and your strongest day for structure-building.",
    caution: "Isolation as a coping mechanism slows your growth. Stay connected." },
  { sign: "Aquarius", sanskrit: "Kumbha", symbol: "♒", element: "Air",
    theme: "Innovation with intention",
    guidance: "Rahu amplifies your forward-thinking nature. New ideas around community and change deserve attention.",
    muhurat: "Saturday and Sunday carry helpful energy for unconventional approaches.",
    caution: "Detachment from emotion can read as coldness to those close to you." },
  { sign: "Pisces", sanskrit: "Meena", symbol: "♓", element: "Water",
    theme: "Spiritual renewal",
    guidance: "Jupiter blends Pisces energy into something deeply intuitive. Meditation, creative work, and prayer are rewarding.",
    muhurat: "Thursday and Monday mornings support spiritual and creative work.",
    caution: "Boundaries are still needed. Compassion doesn't require self-sacrifice." },
];

const ELEMENT_COLOR: Record<string, string> = {
  Fire:  "text-orange-500",
  Earth: "text-emerald-600",
  Air:   "text-sky-500",
  Water: "text-indigo-500",
};

const AppWeeklyZodiac: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const weekLabel = getWeekLabel();

  // Try to detect rashi from profile display name or birthDetails
  useEffect(() => {
    if (!currentUser) return;
    userService.getUserProfile(currentUser.uid).then((profile) => {
      // We don't store rashi directly; let user pick
      // But if somehow a rashi is stored in preferences, use it
      if ((profile as any)?.rashi) {
        setSelectedSign((profile as any).rashi);
      }
    });
  }, [currentUser]);

  const active = SIGNS.find((s) => s.sign === selectedSign) ?? null;

  return (
    <AppShell title="Weekly Zodiac" eyebrow={weekLabel} showBack>
      {/* Week header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-5 text-white text-center">
        <Star className="w-7 h-7 mx-auto mb-2 text-white/80" />
        <p className="font-display text-xl font-bold">Vedic Weekly Guidance</p>
        <p className="text-white/70 text-xs mt-1">{weekLabel}</p>
        <p className="text-white/60 text-[11px] mt-2 italic">
          Tap your rashi below to see this week's guidance
        </p>
      </div>

      {/* Sign picker grid */}
      <div className="grid grid-cols-4 gap-2">
        {SIGNS.map((s) => (
          <button
            key={s.sign}
            onClick={() => setSelectedSign(s.sign === selectedSign ? null : s.sign)}
            className={cn(
              "rounded-xl border py-2.5 flex flex-col items-center gap-0.5 transition-all",
              selectedSign === s.sign
                ? "border-indigo-400 bg-indigo-50"
                : "border-stone-100 bg-white"
            )}
          >
            <span className="text-xl">{s.symbol}</span>
            <span className="text-[10px] font-semibold text-stone-700">{s.sign}</span>
          </button>
        ))}
      </div>

      {/* Guidance card */}
      {active && (
        <div className="space-y-3">
          {/* Header */}
          <div className="bg-[#0f1b35] rounded-2xl p-5 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-3xl">
                {active.symbol}
              </div>
              <div>
                <p className="font-display text-xl font-bold">{active.sign}</p>
                <p className="text-white/50 text-xs">{active.sanskrit} · {active.element}</p>
                <p className={cn("text-xs font-semibold mt-0.5", ELEMENT_COLOR[active.element] || "text-white/70")}>
                  {active.element}
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-3 py-1 mb-3">
              <Star className="w-3 h-3 text-indigo-300" />
              <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wide">{active.theme}</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{active.guidance}</p>
          </div>

          {/* Muhurat timing */}
          <div className="bg-white rounded-xl border border-emerald-100 p-4 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <span className="text-base">✦</span>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-700 mb-0.5">Auspicious Timing</p>
              <p className="text-xs text-stone-600 leading-relaxed">{active.muhurat}</p>
            </div>
          </div>

          {/* Caution */}
          <div className="bg-white rounded-xl border border-amber-100 p-4 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <span className="text-base">⚠</span>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-700 mb-0.5">Caution</p>
              <p className="text-xs text-stone-600 leading-relaxed">{active.caution}</p>
            </div>
          </div>

          {/* Note */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              ✦ This guidance follows the Vedic (sidereal) zodiac. Your Vedic sun sign may differ by one sign from your Western sign. Moon sign guidance is equally important in Jyotish.
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default AppWeeklyZodiac;
