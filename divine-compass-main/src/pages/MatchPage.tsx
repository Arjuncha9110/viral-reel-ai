import React, { useState } from "react";
import { format } from "date-fns";
import { Heart, Activity, User, Info, CheckCircle2, Calendar, Clock3, MapPin } from "lucide-react";
import { SeoHead } from "@/components/shared/SeoHead";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationSelector, LocationData } from "@/components/LocationSelector";
import { calculateAshtakoot, AshtakootResult } from "@/lib/calculators/astrology/ashtakoot";
import { getNakshatra, getSiderealMoon } from "@/lib/calculators/astrology/nakshatra";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const SIGN_NAKSHATRAS: Record<string, string[]> = {
  "Aries": ["Ashwini", "Bharani", "Krittika"],
  "Taurus": ["Krittika", "Rohini", "Mrigashira"],
  "Gemini": ["Mrigashira", "Ardra", "Punarvasu"],
  "Cancer": ["Punarvasu", "Pushya", "Ashlesha"],
  "Leo": ["Magha", "Purva Phalguni", "Uttara Phalguni"],
  "Virgo": ["Uttara Phalguni", "Hasta", "Chitra"],
  "Libra": ["Chitra", "Swati", "Vishakha"],
  "Scorpio": ["Vishakha", "Anuradha", "Jyeshtha"],
  "Sagittarius": ["Moola", "Purva Ashadha", "Uttara Ashadha"],
  "Capricorn": ["Uttara Ashadha", "Shravana", "Dhanishtha"],
  "Aquarius": ["Dhanishtha", "Shatabhisha", "Purva Bhadrapada"],
  "Pisces": ["Purva Bhadrapada", "Uttara Bhadrapada", "Revati"]
};

const defaultLocation: LocationData = {
  name: "Bengaluru",
  stateCode: "KA",
  countryCode: "IN",
  lat: 12.9716,
  lon: 77.5946,
  timezone: "Asia/Kolkata",
};

const parseBirthDate = (value: string) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const toUTC = (birthDate: Date, birthTime: string, timezone: string) => {
  const yyyyMmDd = format(birthDate, "yyyy-MM-dd");
  const [year, month, day] = yyyyMmDd.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);
  const naiveUTC = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric", hour12: false,
  });
  const parts = formatter.formatToParts(naiveUTC);
  const map: Record<string, string> = {};
  parts.forEach((part) => { map[part.type] = part.value; });
  const reportedHour = map.hour === "24" ? 0 : parseInt(map.hour, 10);
  const tzDateNaive = new Date(
    Date.UTC(parseInt(map.year, 10), parseInt(map.month, 10) - 1, parseInt(map.day, 10), reportedHour, parseInt(map.minute, 10), parseInt(map.second, 10))
  );
  const offsetMs = tzDateNaive.getTime() - naiveUTC.getTime();
  return new Date(naiveUTC.getTime() - offsetMs);
};

export default function MatchPage() {
  const [activeTab, setActiveTab] = useState<"quick" | "birth">("quick");
  
  // Quick Match State
  const [boySign, setBoySign] = useState("Aries");
  const [boyNakshatra, setBoyNakshatra] = useState("Ashwini");
  const [girlSign, setGirlSign] = useState("Aries");
  const [girlNakshatra, setGirlNakshatra] = useState("Ashwini");

  // Birth Details State
  const [boyBirthDate, setBoyBirthDate] = useState("");
  const [boyBirthTime, setBoyBirthTime] = useState("12:00");
  const [boyLocation, setBoyLocation] = useState<LocationData>(defaultLocation);

  const [girlBirthDate, setGirlBirthDate] = useState("");
  const [girlBirthTime, setGirlBirthTime] = useState("12:00");
  const [girlLocation, setGirlLocation] = useState<LocationData>(defaultLocation);

  const [result, setResult] = useState<AshtakootResult | null>(null);

  const handleMatch = () => {
    if (activeTab === "quick") {
      const res = calculateAshtakoot(boySign, boyNakshatra, girlSign, girlNakshatra);
      setResult(res);
    } else {
      const bDate = parseBirthDate(boyBirthDate);
      const gDate = parseBirthDate(girlBirthDate);
      if (!bDate || !gDate) {
        alert("Please enter valid birth dates for both Groom and Bride.");
        return;
      }

      const boyUTC = toUTC(bDate, boyBirthTime, boyLocation.timezone);
      const girlUTC = toUTC(gDate, girlBirthTime, girlLocation.timezone);

      const boyMoonLon = getSiderealMoon(boyUTC);
      const boyNak = getNakshatra(boyMoonLon);

      const girlMoonLon = getSiderealMoon(girlUTC);
      const girlNak = getNakshatra(girlMoonLon);

      const res = calculateAshtakoot(boyNak.zodiacSign, boyNak.name, girlNak.zodiacSign, girlNak.name);
      setResult(res);
    }
  };

  return (
    <Layout>
      <SeoHead
        title="Divine Match | Ashtakoot Milan"
        description="Check Vedic marriage compatibility with our precise 36-point Ashtakoot Milan calculator."
      />
      
      {/* Light Theme Wrapper to satisfy White/Saffron requirement */}
      <div className="min-h-screen bg-[#fcfaf5] text-[#3d2b1f] pt-24 pb-20 font-sans">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-sm font-bold tracking-[0.3em] uppercase text-[#c05621] mb-2 flex items-center justify-center gap-2">
              <Heart className="h-4 w-4" /> DIVINE MATCH
            </h1>
            <h2 className="text-3xl font-display font-bold text-[#4a3424] mb-4">अष्टकूट मिलन</h2>
            <p className="text-sm text-[#8c7a6b] max-w-2xl mx-auto">
              36-Point Vedic Marriage Compatibility | Ashtakoot Milan from Muhurta Chintamani | 8 Koota Analysis with Dosha Detection
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#f2eadd] p-1 rounded-full inline-flex">
              <button 
                onClick={() => setActiveTab("quick")}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "quick" ? "bg-[#d4374a] text-white shadow-md" : "text-[#8c7a6b] hover:text-[#d4374a]"}`}
              >
                Rashi & Nakshatra
              </button>
              <button 
                onClick={() => setActiveTab("birth")}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "birth" ? "bg-[#d4374a] text-white shadow-md" : "text-[#8c7a6b] hover:text-[#d4374a]"}`}
              >
                Birth Details
              </button>
            </div>
          </div>

          {/* Input Cards Area */}
          <div className="flex flex-col md:flex-row gap-6 justify-center mb-10 max-w-4xl mx-auto">
            {/* Boy Details */}
            <div className="flex-1 bg-white border-t-4 border-[#3b82f6] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6">
              <h3 className="flex items-center gap-2 text-[#3b82f6] font-bold mb-6 uppercase text-sm tracking-wider">
                <User className="h-4 w-4" /> GROOM (VAR)
              </h3>
              
              {activeTab === "quick" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1">Boy's Moon Sign</label>
                    <select 
                      value={boySign}
                      onChange={(e) => {
                        const newSign = e.target.value;
                        setBoySign(newSign);
                        if (!SIGN_NAKSHATRAS[newSign].includes(boyNakshatra)) {
                          setBoyNakshatra(SIGN_NAKSHATRAS[newSign][0]);
                        }
                      }}
                      className="w-full bg-[#f9f8f6] border border-[#e6dfd5] text-[#4a3424] rounded-lg p-3 outline-none focus:border-[#3b82f6] transition-colors"
                    >
                      {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1">Boy's Nakshatra</label>
                    <select 
                      value={boyNakshatra} 
                      onChange={(e) => setBoyNakshatra(e.target.value)}
                      className="w-full bg-[#f9f8f6] border border-[#e6dfd5] text-[#4a3424] rounded-lg p-3 outline-none focus:border-[#3b82f6] transition-colors"
                    >
                      {SIGN_NAKSHATRAS[boySign].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#8c7a6b] uppercase mb-1">
                        <Calendar className="h-3 w-3" /> Birth Date
                      </label>
                      <Input
                        type="date"
                        value={boyBirthDate}
                        onChange={(e) => setBoyBirthDate(e.target.value)}
                        className="h-11 rounded-lg border-[#e6dfd5] bg-[#f9f8f6] focus:border-[#3b82f6]"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#8c7a6b] uppercase mb-1">
                        <Clock3 className="h-3 w-3" /> Birth Time
                      </label>
                      <Input
                        type="time"
                        value={boyBirthTime}
                        onChange={(e) => setBoyBirthTime(e.target.value)}
                        className="h-11 rounded-lg border-[#e6dfd5] bg-[#f9f8f6] focus:border-[#3b82f6]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-[#8c7a6b] uppercase mb-1">
                      <MapPin className="h-3 w-3" /> Birth Place
                    </label>
                    <LocationSelector initialCity={boyLocation.name} onLocationSelect={setBoyLocation} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1">Ayanamsa</label>
                    <select disabled className="w-full bg-[#f9f8f6] border border-[#e6dfd5] text-[#4a3424] rounded-lg p-3 outline-none opacity-80 cursor-not-allowed">
                      <option>Lahiri (Chitra Paksha)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Girl Details */}
            <div className="flex-1 bg-white border-t-4 border-[#ec4899] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6">
              <h3 className="flex items-center gap-2 text-[#ec4899] font-bold mb-6 uppercase text-sm tracking-wider">
                <User className="h-4 w-4" /> BRIDE (VADHU)
              </h3>
              
              {activeTab === "quick" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1">Girl's Moon Sign</label>
                    <select 
                      value={girlSign} 
                      onChange={(e) => {
                        const newSign = e.target.value;
                        setGirlSign(newSign);
                        if (!SIGN_NAKSHATRAS[newSign].includes(girlNakshatra)) {
                          setGirlNakshatra(SIGN_NAKSHATRAS[newSign][0]);
                        }
                      }}
                      className="w-full bg-[#f9f8f6] border border-[#e6dfd5] text-[#4a3424] rounded-lg p-3 outline-none focus:border-[#ec4899] transition-colors"
                    >
                      {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1">Girl's Nakshatra</label>
                    <select 
                      value={girlNakshatra} 
                      onChange={(e) => setGirlNakshatra(e.target.value)}
                      className="w-full bg-[#f9f8f6] border border-[#e6dfd5] text-[#4a3424] rounded-lg p-3 outline-none focus:border-[#ec4899] transition-colors"
                    >
                      {SIGN_NAKSHATRAS[girlSign].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#8c7a6b] uppercase mb-1">
                        <Calendar className="h-3 w-3" /> Birth Date
                      </label>
                      <Input
                        type="date"
                        value={girlBirthDate}
                        onChange={(e) => setGirlBirthDate(e.target.value)}
                        className="h-11 rounded-lg border-[#e6dfd5] bg-[#f9f8f6] focus:border-[#ec4899]"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#8c7a6b] uppercase mb-1">
                        <Clock3 className="h-3 w-3" /> Birth Time
                      </label>
                      <Input
                        type="time"
                        value={girlBirthTime}
                        onChange={(e) => setGirlBirthTime(e.target.value)}
                        className="h-11 rounded-lg border-[#e6dfd5] bg-[#f9f8f6] focus:border-[#ec4899]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-[#8c7a6b] uppercase mb-1">
                      <MapPin className="h-3 w-3" /> Birth Place
                    </label>
                    <LocationSelector initialCity={girlLocation.name} onLocationSelect={setGirlLocation} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1">Ayanamsa</label>
                    <select disabled className="w-full bg-[#f9f8f6] border border-[#e6dfd5] text-[#4a3424] rounded-lg p-3 outline-none opacity-80 cursor-not-allowed">
                      <option>Lahiri (Chitra Paksha)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 mb-12">
            <Button 
              onClick={handleMatch}
              className="bg-[#d4374a] hover:bg-[#b02a3a] text-white px-8 py-6 rounded-full font-bold shadow-lg shadow-red-500/20 text-lg"
            >
              <Heart className="h-5 w-5 mr-2" fill="white" />
              CHECK COMPATIBILITY
            </Button>
            <Button 
              onClick={() => {
                setBoySign("Aries"); setBoyNakshatra("Ashwini");
                setGirlSign("Aries"); setGirlNakshatra("Ashwini");
                setBoyBirthDate(""); setBoyBirthTime("12:00");
                setGirlBirthDate(""); setGirlBirthTime("12:00");
                setResult(null);
              }}
              variant="outline"
              className="border-[#e6dfd5] text-[#8c7a6b] hover:bg-[#f9f8f6] hover:text-[#4a3424] px-6 py-6 rounded-full font-bold"
            >
              Clear
            </Button>
          </div>

          {/* Results Area */}
          {result && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Score Gauge */}
              <div className="bg-[#fcfaf5] border border-[#e5dec5] rounded-2xl p-8 mb-8 text-center shadow-sm">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#f0e9d3" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="64" cy="64" r="56" 
                      stroke={result.totalScore >= 18 ? "#10b981" : "#ef4444"} 
                      strokeWidth="8" fill="transparent" 
                      strokeDasharray={351.8} 
                      strokeDashoffset={351.8 - (351.8 * result.totalScore) / 36}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[#4a3424]">{result.totalScore}</span>
                    <span className="text-xs font-bold text-[#8c7a6b] uppercase">Out of 36</span>
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-2 uppercase tracking-widest ${result.totalScore >= 18 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {result.totalScore >= 18 ? 'Good Match' : 'Not Recommended'}
                </h3>
                <p className="text-sm text-[#8c7a6b]">
                  {result.totalScore >= 18 ? 'A score of 18 or above indicates a harmonious and prosperous union.' : 'A score below 18 is generally not recommended in Vedic Astrology.'}
                </p>
              </div>

              {/* Ashtakoot Grid */}
              <div className="mb-4 flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-[#e5dec5]"></div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#a89988]">Ashtakoot Breakdown</h4>
                <div className="h-px w-12 bg-[#e5dec5]"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <KootaCard name="1. Varna" score={result.varna.score} max={result.varna.max} desc={result.varna.description} />
                <KootaCard name="2. Vashya" score={result.vashya.score} max={result.vashya.max} desc={result.vashya.description} />
                <KootaCard name="3. Tara" score={result.tara.score} max={result.tara.max} desc={result.tara.description} />
                <KootaCard name="4. Yoni" score={result.yoni.score} max={result.yoni.max} desc={result.yoni.description} />
                <KootaCard name="5. Graha Maitri" score={result.grahaMaitri.score} max={result.grahaMaitri.max} desc={result.grahaMaitri.description} />
                <KootaCard name="6. Gana" score={result.gana.score} max={result.gana.max} desc={result.gana.description} />
                <KootaCard name="7. Bhakoot" score={result.bhakoot.score} max={result.bhakoot.max} desc={result.bhakoot.description} />
                <KootaCard name="8. Nadi" score={result.nadi.score} max={result.nadi.max} desc={result.nadi.description} />
              </div>

            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}

function KootaCard({ name, score, max, desc }: { name: string, score: number, max: number, desc: string }) {
  const isPerfect = score === max;
  const isZero = score === 0;

  return (
    <div className="bg-white border border-[#eae2ce] p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-start mb-2 border-b border-[#f5efde] pb-2">
        <h5 className="font-bold text-sm text-[#4a3424]">{name}</h5>
        <div className={`px-2 py-0.5 rounded text-xs font-bold ${isZero ? 'bg-red-50 text-red-600' : isPerfect ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          {score} / {max}
        </div>
      </div>
      <p className="text-xs text-[#8c7a6b]">{desc}</p>
    </div>
  );
}
