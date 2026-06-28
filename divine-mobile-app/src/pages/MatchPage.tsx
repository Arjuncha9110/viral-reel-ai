import React, { useState } from "react";
import { BirthDatePicker } from "@/components/shared/BirthDatePicker";
import { format } from "date-fns";
import { Heart, Activity, User, Info, CheckCircle2, Calendar, Clock3, MapPin } from "lucide-react";
import { SeoHead } from "@/components/shared/SeoHead";
import { Layout } from "@/components/layout/Layout";
import { DivineAiPreviewCard } from "@/components/shared/DivineAiPreviewCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationSelector, LocationData } from "@/components/LocationSelector";
import { calculateAshtakoot, AshtakootResult } from "@/lib/calculators/astrology/ashtakoot";
import { getNakshatra, getSiderealMoon } from "@/lib/calculators/astrology/nakshatra";
import { Upload, FileText, Bot, Download, AlertCircle } from "lucide-react";
import { extractKundliPdfData, extractRawKundliPdfText } from "@/lib/kundliMatching/extractKundliPdfData";

import { generateDeterministicMatchAnalysis } from "@/lib/calculators/astrology/matchReport";
import type { ExtractedKundliData, MatchAnalysisResult } from "@/lib/kundliMatching/types";
import { useMemo } from "react";

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

  // Premium AI Match State
  const [groomFile, setGroomFile] = useState<File | null>(null);
  const [brideFile, setBrideFile] = useState<File | null>(null);
  const [groomExtracted, setGroomExtracted] = useState<ExtractedKundliData | null>(null);
  const [brideExtracted, setBrideExtracted] = useState<ExtractedKundliData | null>(null);
  const [groomRawText, setGroomRawText] = useState<string>("");
  const [brideRawText, setBrideRawText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<MatchAnalysisResult | null>(null);

  // Memoized Ashtakoot Calculation for AI Match
  const aiAshtakootResult = useMemo(() => {
    if (!groomExtracted || !brideExtracted) return null;
    try {
      const cleanSign = (s: string) => s.split(" ")[0].replace(/[^a-zA-Z]/g, '');
      const cleanNak = (s: string) => s.split("(")[0].trim();
      return calculateAshtakoot(
        cleanSign(groomExtracted.moonSign),
        cleanNak(groomExtracted.nakshatra),
        cleanSign(brideExtracted.moonSign),
        cleanNak(brideExtracted.nakshatra)
      );
    } catch {
      return null;
    }
  }, [groomExtracted, brideExtracted]);

  const handleGroomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setGroomFile(file);
      setIsExtracting(true);
      const data = await extractKundliPdfData(file);
      const rawText = await extractRawKundliPdfText(file);
      setGroomExtracted(data);
      setGroomRawText(rawText);
      setIsExtracting(false);
    }
  };

  const handleBrideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBrideFile(file);
      setIsExtracting(true);
      const data = await extractKundliPdfData(file);
      const rawText = await extractRawKundliPdfText(file);
      setBrideExtracted(data);
      setBrideRawText(rawText);
      setIsExtracting(false);
    }
  };

  const handleAnalyzeMatch = async () => {
    if (!groomExtracted || !brideExtracted || !aiAshtakootResult) {
      alert("Please upload both Kundlis before analyzing.");
      return;
    }
    setIsAnalyzing(true);
    try {
      // Simulate slight loading for UX
      await new Promise(r => setTimeout(r, 800));
      const analysis = generateDeterministicMatchAnalysis(groomExtracted, brideExtracted, aiAshtakootResult);
      setAiResult(analysis);
    } catch (err) {
      console.error("Match generation error:", err);
      alert("An error occurred while generating the match report.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = async () => {
    window.print();
  };

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
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#8c7a6b] uppercase mb-1">
                        <Calendar className="h-3 w-3" /> Birth Date
                      </label>
                      <BirthDatePicker value={boyBirthDate} onChange={setBoyBirthDate} />
                    </div>
                    <div className="w-48">
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
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#8c7a6b] uppercase mb-1">
                        <Calendar className="h-3 w-3" /> Birth Date
                      </label>
                      <BirthDatePicker value={girlBirthDate} onChange={setGirlBirthDate} />
                    </div>
                    <div className="w-48">
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

          {/* AI Match Upload Section */}
          <div className="max-w-4xl mx-auto mt-20 pt-16 border-t-2 border-dashed border-[#e6dfd5]">
            <div className="mb-10">
              <DivineAiPreviewCard
                source="match"
                title="Add an AI Relationship Guide"
                description="Keep the astrology precise, then let Divine AI translate the compatibility result into practical relationship language without fear-based conclusions."
                prompts={[
                  "Explain this compatibility in practical terms.",
                  "Where will communication need more patience?",
                  "What should both partners consciously build?",
                ]}
              />
            </div>

            <div className="text-center mb-10">
              <span className="bg-[#fef3c7] text-[#b45309] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                PREMIUM DETAILED ANALYSIS (FREE FOR A LIMITED TIME)
              </span>
              <h3 className="text-2xl font-bold text-[#4a3424] mb-3">Upload Full Kundli Reports</h3>
              <p className="text-sm text-[#8c7a6b] max-w-xl mx-auto">
                Already downloaded the Janam Kundli PDFs for the bride and groom? Upload both files to receive a comprehensive, detailed astrological compatibility report.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Groom Upload */}
              <div className="bg-white border-2 border-dashed border-[#3b82f6]/30 rounded-xl p-6 text-center relative hover:bg-blue-50/50 transition-colors">
                <Input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleGroomUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="flex flex-col items-center pointer-events-none">
                  {groomFile ? (
                    <>
                      <div className="bg-blue-100 p-3 rounded-full mb-3 text-blue-600">
                        <FileText className="h-6 w-6" />
                      </div>
                      <p className="font-bold text-[#4a3424] text-sm">{groomFile.name}</p>
                      <p className="text-xs text-green-600 font-bold mt-1">Uploaded successfully</p>
                    </>
                  ) : (
                    <>
                      <div className="bg-gray-50 p-3 rounded-full mb-3 text-gray-400">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="font-bold text-[#4a3424] text-sm">Upload Groom's Kundli (PDF)</p>
                      <p className="text-xs text-[#8c7a6b] mt-1">Click or drag file here</p>
                    </>
                  )}
                </div>
              </div>

              {/* Bride Upload */}
              <div className="bg-white border-2 border-dashed border-[#ec4899]/30 rounded-xl p-6 text-center relative hover:bg-pink-50/50 transition-colors">
                <Input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleBrideUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="flex flex-col items-center pointer-events-none">
                  {brideFile ? (
                    <>
                      <div className="bg-pink-100 p-3 rounded-full mb-3 text-pink-600">
                        <FileText className="h-6 w-6" />
                      </div>
                      <p className="font-bold text-[#4a3424] text-sm">{brideFile.name}</p>
                      <p className="text-xs text-green-600 font-bold mt-1">Uploaded successfully</p>
                    </>
                  ) : (
                    <>
                      <div className="bg-gray-50 p-3 rounded-full mb-3 text-gray-400">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="font-bold text-[#4a3424] text-sm">Upload Bride's Kundli (PDF)</p>
                      <p className="text-xs text-[#8c7a6b] mt-1">Click or drag file here</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Extracted Data Review Step */}
            {groomExtracted && brideExtracted && !aiResult && (
              <div className="bg-[#fcfaf5] border border-[#e5dec5] rounded-xl p-6 mb-8 shadow-sm">
                <h4 className="flex items-center gap-2 text-sm font-bold text-[#c05621] uppercase tracking-wider mb-4 border-b border-[#e5dec5] pb-3">
                  <AlertCircle className="h-4 w-4" /> Please verify extracted details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-bold text-[#3b82f6] text-xs mb-2">GROOM DATA</h5>
                    <ul className="text-sm space-y-1 text-[#4a3424]">
                      <li><span className="text-[#8c7a6b]">Name:</span> {groomExtracted.name}</li>
                      <li><span className="text-[#8c7a6b]">DOB:</span> {groomExtracted.dateOfBirth}</li>
                      <li><span className="text-[#8c7a6b]">Time:</span> {groomExtracted.timeOfBirth}</li>
                      <li><span className="text-[#8c7a6b]">Lagna:</span> {groomExtracted.lagna}</li>
                      <li><span className="text-[#8c7a6b]">Moon Sign:</span> {groomExtracted.moonSign}</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold text-[#ec4899] text-xs mb-2">BRIDE DATA</h5>
                    <ul className="text-sm space-y-1 text-[#4a3424]">
                      <li><span className="text-[#8c7a6b]">Name:</span> {brideExtracted.name}</li>
                      <li><span className="text-[#8c7a6b]">DOB:</span> {brideExtracted.dateOfBirth}</li>
                      <li><span className="text-[#8c7a6b]">Time:</span> {brideExtracted.timeOfBirth}</li>
                      <li><span className="text-[#8c7a6b]">Lagna:</span> {brideExtracted.lagna}</li>
                      <li><span className="text-[#8c7a6b]">Moon Sign:</span> {brideExtracted.moonSign}</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Button 
                    onClick={handleAnalyzeMatch}
                    disabled={isAnalyzing}
                    className="bg-[#c05621] hover:bg-[#9a451a] text-white px-8 py-6 rounded-full font-bold shadow-lg text-base"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Generating Match...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Bot className="h-5 w-5" /> Generate Premium Detailed Report
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* AI Result Download */}
            {aiResult && (
              <div className="animate-in fade-in zoom-in duration-500 mb-8">
                <div className="bg-[#fcfaf5] border border-[#e5dec5] rounded-xl p-8 mb-6 shadow-sm">
                  <div className="text-center mb-8 border-b border-[#f0e9d3] pb-6">
                    <div className="bg-emerald-100 text-emerald-700 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#4a3424] mb-2 uppercase tracking-wide">Analysis Complete</h3>
                    <p className="text-[#8c7a6b] max-w-lg mx-auto">
                      Your detailed astrological compatibility report has been generated successfully. Review the Ashtakoot breakdown below and download the premium PDF for deep insights.
                    </p>
                  </div>

                  {aiAshtakootResult && (
                    <div className="mb-8">
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-12 bg-[#e5dec5]"></div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-[#a89988]">Ashtakoot Milan Score</h4>
                        <div className="h-px w-12 bg-[#e5dec5]"></div>
                      </div>
                      
                      <div className="text-center mb-6">
                        <div className="inline-block bg-white border border-[#e5dec5] rounded-full px-6 py-3 shadow-sm">
                          <span className="text-3xl font-bold text-[#c05621]">{aiAshtakootResult.totalScore}</span>
                          <span className="text-lg font-bold text-[#8c7a6b] mx-1">/</span>
                          <span className="text-lg font-bold text-[#8c7a6b]">36</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <KootaCard name="1. Varna" score={aiAshtakootResult.varna.score} max={aiAshtakootResult.varna.max} desc={aiAshtakootResult.varna.description} />
                        <KootaCard name="2. Vashya" score={aiAshtakootResult.vashya.score} max={aiAshtakootResult.vashya.max} desc={aiAshtakootResult.vashya.description} />
                        <KootaCard name="3. Tara" score={aiAshtakootResult.tara.score} max={aiAshtakootResult.tara.max} desc={aiAshtakootResult.tara.description} />
                        <KootaCard name="4. Yoni" score={aiAshtakootResult.yoni.score} max={aiAshtakootResult.yoni.max} desc={aiAshtakootResult.yoni.description} />
                        <KootaCard name="5. Graha Maitri" score={aiAshtakootResult.grahaMaitri.score} max={aiAshtakootResult.grahaMaitri.max} desc={aiAshtakootResult.grahaMaitri.description} />
                        <KootaCard name="6. Gana" score={aiAshtakootResult.gana.score} max={aiAshtakootResult.gana.max} desc={aiAshtakootResult.gana.description} />
                        <KootaCard name="7. Bhakoot" score={aiAshtakootResult.bhakoot.score} max={aiAshtakootResult.bhakoot.max} desc={aiAshtakootResult.bhakoot.description} />
                        <KootaCard name="8. Nadi" score={aiAshtakootResult.nadi.score} max={aiAshtakootResult.nadi.max} desc={aiAshtakootResult.nadi.description} />
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 text-center">
                    <h4 className="text-lg font-bold text-[#4a3424] mb-3">Your Premium PDF is Ready</h4>
                    <p className="text-sm text-[#8c7a6b] mb-5 max-w-md mx-auto">
                      Includes full compatibility breakdown, dosha analysis, and detailed interpretations for emotional, physical, and practical alignment.
                    </p>
                    <Button 
                      onClick={handleDownloadReport}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-full font-bold shadow-lg text-base w-full sm:w-auto"
                    >
                      <Download className="h-5 w-5 mr-2" /> Download Detailed Match Report (PDF)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

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
