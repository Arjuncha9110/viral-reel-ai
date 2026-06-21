import React, { useState, useEffect } from "react";
import AppShell from "./AppShell";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { getSamplePanchangData } from "../../lib/calculators/astrology/panchang";
import { LocationSelector, LocationData } from "../../components/LocationSelector";
import { Sparkles, CheckCircle, MinusCircle, XCircle, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";

const defaultLocation: LocationData = {
  name: "Bengaluru",
  stateCode: "KA",
  countryCode: "IN",
  lat: 12.9716,
  lon: 77.5946,
  timezone: "Asia/Kolkata",
};

type Status = "good" | "neutral" | "avoid";

interface ActivityMuhurat {
  activity: string;
  icon: string;
  status: Status;
  reason: string;
  bestTime?: string;
}

// Tithis: 1-15 = Shukla Paksha, 16-30 = Krishna Paksha
// Auspicious Shukla tithis: 2,3,5,7,10,11,13
// Inauspicious: 4,6,8,9,12,14,15 (Amavasya), 29,30
const AUSPICIOUS_TITHIS = [2, 3, 5, 7, 10, 11, 13];
const INAUSPICIOUS_TITHIS = [4, 6, 8, 9, 12, 14, 15, 29, 30];

// Auspicious nakshatras for general work
const AUSPICIOUS_NAKS = ["Rohini","Mrigashira","Hasta","Chitra","Swati","Anuradha","Revati","Pushya","Uttara Phalguni","Uttara Ashadha","Uttara Bhadrapada"];
const TRAVEL_NAKS   = ["Ashwini","Punarvasu","Pushya","Hasta","Chitra","Swati","Shravana","Revati"];
const MARRIAGE_NAKS = ["Rohini","Mrigashira","Magha","Uttara Phalguni","Hasta","Swati","Anuradha","Moola","Uttara Ashadha","Uttara Bhadrapada","Revati"];

function getTithiIndex(tithiName: string): number {
  const clean = tithiName.toLowerCase().replace(/\s+/g, "");
  const names = ["pratipada","dwitiya","tritiya","chaturthi","panchami","shashthi","saptami","ashtami","navami","dashami","ekadashi","dwadashi","trayodashi","chaturdashi","purnima","pratipada","dwitiya","tritiya","chaturthi","panchami","shashthi","saptami","ashtami","navami","dashami","ekadashi","dwadashi","trayodashi","chaturdashi","amavasya"];
  const idx = names.findIndex(n => clean.startsWith(n));
  return idx >= 0 ? idx + 1 : 1;
}

function getMuhuratActivities(
  tithiName: string,
  nakshatraName: string,
  yogaName: string,
  abhijit: string,
  sunrise: string,
): ActivityMuhurat[] {
  const tithiIdx = getTithiIndex(tithiName);
  const isAuspiciousTithi = AUSPICIOUS_TITHIS.includes(tithiIdx <= 15 ? tithiIdx : tithiIdx - 15);
  const isInauspiciousTithi = INAUSPICIOUS_TITHIS.includes(tithiIdx <= 15 ? tithiIdx : tithiIdx - 15);
  const isBadYoga = ["Vishkumbha","Atiganda","Shoola","Ganda","Vyatipata","Vaidhriti"].includes(yogaName);
  const isGoodYoga = ["Siddha","Shubha","Amrita","Brahma","Indra"].includes(yogaName);

  const travel: Status = TRAVEL_NAKS.some(n => nakshatraName.startsWith(n))
    ? "good" : isInauspiciousTithi ? "neutral" : "good";
  const business: Status = isAuspiciousTithi && !isBadYoga ? "good"
    : isInauspiciousTithi || isBadYoga ? "neutral" : "good";
  const marriage: Status = MARRIAGE_NAKS.some(n => nakshatraName.startsWith(n)) && isAuspiciousTithi
    ? "good" : isInauspiciousTithi ? "avoid" : "neutral";
  const property: Status = isGoodYoga && isAuspiciousTithi ? "good"
    : isBadYoga ? "neutral" : "neutral";
  const education: Status = AUSPICIOUS_NAKS.some(n => nakshatraName.startsWith(n)) ? "good"
    : isInauspiciousTithi ? "neutral" : "good";
  const medical: Status = isBadYoga ? "avoid" : isAuspiciousTithi ? "good" : "neutral";
  const newWork: Status = isGoodYoga && isAuspiciousTithi ? "good"
    : isInauspiciousTithi || isBadYoga ? "avoid" : "neutral";
  const vehicle: Status = isAuspiciousTithi && !isBadYoga ? "good" : isBadYoga ? "neutral" : "neutral";

  return [
    { activity: "Travel",       icon: "✈",  status: travel,   reason: `Nakshatra ${nakshatraName} ${TRAVEL_NAKS.some(n => nakshatraName.startsWith(n)) ? "is auspicious for journeys" : "is neutral for travel"}. ${isBadYoga ? `Avoid ${yogaName} yoga periods.` : ""}`, bestTime: sunrise },
    { activity: "Business",     icon: "💼", status: business, reason: `${isAuspiciousTithi ? "Tithi is auspicious for financial decisions." : "Tithi is neutral — confirm with an astrologer."} ${isBadYoga ? `Avoid during ${yogaName} yoga.` : ""}` },
    { activity: "Marriage",     icon: "💍", status: marriage, reason: `${MARRIAGE_NAKS.some(n => nakshatraName.startsWith(n)) ? `${nakshatraName} is a Vivah-approved nakshatra.` : `${nakshatraName} is not traditionally preferred for marriage.`}`, bestTime: abhijit },
    { activity: "Property",     icon: "🏠", status: property, reason: `${isGoodYoga ? `${yogaName} yoga supports new property beginnings.` : "Check with a Jyotishi for Grihapravesh timing."} ${isInauspiciousTithi ? "Current tithi is less ideal." : ""}` },
    { activity: "Education",    icon: "📚", status: education, reason: `${AUSPICIOUS_NAKS.some(n => nakshatraName.startsWith(n)) ? `${nakshatraName} nakshatra supports learning and knowledge.` : "Neutral for starting new courses today."}` },
    { activity: "Medical",      icon: "💊", status: medical,  reason: `${isBadYoga ? `${yogaName} yoga — avoid elective procedures if possible.` : "Generally acceptable for routine medical visits."}` },
    { activity: "New Ventures",  icon: "🚀", status: newWork,  reason: `${isGoodYoga ? `${yogaName} yoga is excellent for starting new projects.` : isBadYoga ? `${yogaName} yoga — delay new starts if possible.` : "Moderate energy for new beginnings."}`, bestTime: abhijit },
    { activity: "Vehicle Puja", icon: "🚗", status: vehicle,  reason: `${isAuspiciousTithi ? "Auspicious tithi for vehicle blessing ceremonies." : "Acceptable — perform Ganesha prayer before the ceremony."}` },
  ];
}

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  good:    { label: "Good",    icon: <CheckCircle className="w-4 h-4" />, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  neutral: { label: "Neutral", icon: <MinusCircle className="w-4 h-4" />, bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"   },
  avoid:   { label: "Avoid",   icon: <XCircle className="w-4 h-4" />,     bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200"    },
};

const AppMuhurat: React.FC = () => {
  const { currentUser } = useAuth();
  const [location, setLocation] = useState<LocationData>(defaultLocation);
  const [date] = useState(new Date());
  const [activities, setActivities] = useState<ActivityMuhurat[]>([]);
  const [panchangInfo, setPanchangInfo] = useState<{ tithi: string; nakshatra: string; yoga: string; abhijit: string; sunrise: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const calculate = (loc: LocationData) => {
    setLoading(true);
    try {
      const data = getSamplePanchangData(date, loc.lat, loc.lon, loc.timezone);
      const tithi = data.tithi?.[0]?.name ?? "Pratipada";
      const nak   = data.nakshatra?.[0]?.name ?? "Ashwini";
      const yoga  = data.yoga?.[0]?.name ?? "Vishkumbha";
      const abhijit = data.abhijitMuhurat ?? "";
      const sunrise = data.sunrise ?? "";
      setPanchangInfo({ tithi, nakshatra: nak, yoga, abhijit, sunrise });
      setActivities(getMuhuratActivities(tithi, nak, yoga, abhijit, sunrise));
    } catch {
      setPanchangInfo(null);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    userService.getUserProfile(currentUser.uid).then((profile) => {
      if (profile?.birthDetails?.latitude && profile.birthDetails.longitude) {
        const loc: LocationData = {
          name: profile.birthDetails.city || "Your City",
          stateCode: profile.birthDetails.state || "",
          countryCode: profile.birthDetails.country || "",
          lat: profile.birthDetails.latitude,
          lon: profile.birthDetails.longitude,
          timezone: profile.birthDetails.timezoneId || "Asia/Kolkata",
        };
        setLocation(loc);
        calculate(loc);
      } else {
        calculate(defaultLocation);
      }
    });
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppShell title="Muhurat" eyebrow="Auspicious Timings" showBack>

      {/* ── Premium Hero ──────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl p-5"
        style={{ background: "linear-gradient(145deg, #1c0f02, #2d1a04, #1a0d02)" }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-amber-300/60 font-bold mb-0.5">Tithi · Nakshatra · Vara</p>
            <h2 className="font-display text-lg font-bold text-white leading-tight">Muhurat Finder</h2>
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/50 mt-3 leading-relaxed">
          Find the most auspicious windows today for marriage, travel, business, and other important beginnings.
        </p>
      </div>

      {/* Location + date */}
      <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Today's Muhurat</p>
          <p className="text-xs text-stone-400">
            {date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </p>
        </div>
        <LocationSelector
          onLocationSelect={(loc) => { setLocation(loc as LocationData); calculate(loc as LocationData); }}
          initialCity={location.name}
        />
      </div>

      {/* Panchang summary */}
      {panchangInfo && (
        <div className="bg-gradient-to-r from-rose-600 to-pink-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-white/80" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Today's Panchang</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Tithi", value: panchangInfo.tithi },
              { label: "Nakshatra", value: panchangInfo.nakshatra },
              { label: "Yoga", value: panchangInfo.yoga },
            ].map((item) => (
              <div key={item.label} className="bg-white/15 rounded-xl py-2 px-1">
                <p className="text-[10px] text-white/60 uppercase tracking-wide">{item.label}</p>
                <p className="text-[13px] font-bold text-white leading-tight mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          {panchangInfo.abhijit && (
            <p className="text-[11px] text-white/70 mt-3 text-center">
              ✦ Abhijit Muhurat: <strong className="text-white">{panchangInfo.abhijit}</strong>
            </p>
          )}
        </div>
      )}

      {loading && <div className="text-center py-8 text-stone-400 text-sm">Calculating muhuratas…</div>}

      {/* Activity grid */}
      {!loading && activities.length > 0 && (
        <div className="space-y-2">
          <p className="font-display text-[15px] font-bold text-stone-800 text-center">Activity Guidance</p>
          {activities.map((item) => {
            const cfg = STATUS_CONFIG[item.status];
            return (
              <div
                key={item.activity}
                className={cn("rounded-xl border p-4 flex gap-3", cfg.bg, cfg.border)}
              >
                <div className="text-xl w-6 text-center shrink-0">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-stone-800">{item.activity}</p>
                    <span className={cn("flex items-center gap-1 text-[10px] font-bold", cfg.text)}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">{item.reason}</p>
                  {item.bestTime && (
                    <p className="text-[10px] text-stone-400 mt-1">Best time: {item.bestTime}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note */}
      <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
        <p className="text-[11px] text-rose-700 leading-relaxed">
          ✦ Muhurat guidance is based on today's Tithi, Nakshatra, and Yoga. For important life events (marriage, Grihapravesh, business launch), always consult a qualified Jyotishi with your full birth chart.
        </p>
      </div>
    </AppShell>
  );
};

export default AppMuhurat;
