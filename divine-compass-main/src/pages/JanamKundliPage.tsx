import { useEffect, useMemo, useState } from "react";
import { calculateDivisionalSign } from "@/lib/astro/vargaEngine";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Clock3,
  Compass,
  ScrollText,
  Sparkles,
  Stars,
  User,
  Mail,
  Calendar,
  MapPin,
  ChevronRight,
  Shield,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { LocationData, LocationSelector } from "@/components/LocationSelector";
import PlanetTable from "@/components/kundali/PlanetTable";
import KundaliFAQ from "@/components/kundali/KundaliFAQ";
import KundaliReviews from "@/components/kundali/KundaliReviews";
import ChartStyleToggle from "@/components/kundali/ChartStyleToggle";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { AdSenseBanner } from "@/components/shared/AdSenseBanner";
import { KundliChart } from "@/components/shared/KundliChart";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAscendant, getPlanetPositions, PlanetPosition } from "@/lib/astro/kundaliEngine";
import { fetchLiveKundli, type LiveKundliData } from "@/lib/astrologyApi";
import { cn } from "@/lib/utils";

const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const defaultLocation: LocationData = {
  name: "Bengaluru",
  stateCode: "KA",
  countryCode: "IN",
  lat: 12.9716,
  lon: 77.5946,
  timezone: "Asia/Kolkata",
};

const toUTC = (birthDate: Date, birthTime: string, timezone: string) => {
  const yyyyMmDd = format(birthDate, "yyyy-MM-dd");
  const [year, month, day] = yyyyMmDd.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);
  const naiveUTC = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(naiveUTC);
  const map: Record<string, string> = {};
  parts.forEach((part) => {
    map[part.type] = part.value;
  });
  const reportedHour = map.hour === "24" ? 0 : parseInt(map.hour, 10);
  const tzDateNaive = new Date(
    Date.UTC(
      parseInt(map.year, 10),
      parseInt(map.month, 10) - 1,
      parseInt(map.day, 10),
      reportedHour,
      parseInt(map.minute, 10),
      parseInt(map.second, 10),
    ),
  );
  const offsetMs = tzDateNaive.getTime() - naiveUTC.getTime();
  return new Date(naiveUTC.getTime() - offsetMs);
};

const parseBirthDate = (value: string) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const JanamKundliPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [gender, setGender] = useState("male");
  const [location, setLocation] = useState<LocationData>(defaultLocation);
  const [detailsReady, setDetailsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [kundliData, setKundliData] = useState<LiveKundliData | null>(null);
  const [chartStyle, setChartStyle] = useState<"north" | "south">("north");
  const [localChart, setLocalChart] = useState<{
    planets: PlanetPosition[];
    ascendant: number;
    lagnaSignIdx: number;
  } | null>(null);
  const [resultNotice, setResultNotice] = useState<{
    tone: "live" | "preview" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("janam-kundli-chart-style");
    if (saved === "north" || saved === "south") {
      setChartStyle(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("janam-kundli-chart-style", chartStyle);
  }, [chartStyle]);

  const parsedBirthDate = useMemo(() => parseBirthDate(birthDate), [birthDate]);

  const listPlanets = useMemo(() => {
    if (!localChart) return [];
    // Ascendant is NOT included as a planet — it is already shown via house numbers
    // (North Indian) and the "As" corner label (South Indian).
    return localChart.planets.map((planet) => ({
      name: planet.name,
      lon: planet.longitude,
      retrograde: planet.retrograde,
      combust: planet.combust,
    }));
  }, [localChart]);

  const bhavaPlanets = useMemo(() => {
    if (!localChart || listPlanets.length === 0) return [];
    // Bhava Chalit: house cusps start at (ascendant - 15°), each bhava spans 30°
    const ascLon = localChart.ascendant;
    const lagnaIndex = localChart.lagnaSignIdx;
    return listPlanets.map((p) => {
      const dist = ((p.lon - (ascLon - 15)) % 360 + 360) % 360;
      const bhavaNum = Math.floor(dist / 30); // 0-based: bhava 1 = 0
      const targetSignIdx = (lagnaIndex + bhavaNum) % 12;
      return {
        name: p.name,
        lon: targetSignIdx * 30 + (p.lon % 30),
        retrograde: p.retrograde,
        combust: p.combust,
      };
    });
  }, [localChart, listPlanets]);

  const navamsaIndex = useMemo(() => {
    if (!localChart) return 0;
    // Correct D9 Ascendant: use the same calculateDivisionalSign used for planets
    return calculateDivisionalSign(localChart.ascendant, 9, "D9") - 1;
  }, [localChart]);

  const navamsaPlanets = useMemo(() => {
    if (!localChart || listPlanets.length === 0) return [];
    return listPlanets.map((p) => {
      // Exact D9 calculation: floor(absoluteLon / (30/9)) mod 12
      const absNavamsa = Math.floor(p.lon / (30 / 9));
      const signIndex = absNavamsa % 12;
      return {
        name: p.name,
        lon: signIndex * 30 + 15,
        retrograde: p.retrograde,
        combust: p.combust,
      };
    });
  }, [localChart, listPlanets]);

  const birthSummary = useMemo(() => {
    if (!parsedBirthDate) return null;
    return {
      day: format(parsedBirthDate, "EEEE"),
      formattedDate: format(parsedBirthDate, "PPP"),
      season:
        parsedBirthDate.getMonth() >= 2 && parsedBirthDate.getMonth() <= 4
          ? "Spring cycle"
          : parsedBirthDate.getMonth() >= 5 && parsedBirthDate.getMonth() <= 7
            ? "Summer cycle"
            : parsedBirthDate.getMonth() >= 8 && parsedBirthDate.getMonth() <= 10
              ? "Autumn cycle"
              : "Winter cycle",
    };
  }, [parsedBirthDate]);

  const canPrepare =
    name.trim().length > 0 &&
    email.includes("@") &&
    Boolean(parsedBirthDate) &&
    birthTime.trim().length > 0 &&
    Boolean(location.name);

  const handlePrepare = async () => {
    if (!parsedBirthDate) return;

    setIsLoading(true);

    try {
      const birthUTC = toUTC(parsedBirthDate, birthTime, location.timezone);
      const planets = getPlanetPositions(birthUTC, location.lat, location.lon);
      const ascendant = getAscendant(birthUTC, location.lat, location.lon);
      setLocalChart({
        planets,
        ascendant,
        lagnaSignIdx: Math.floor(ascendant / 30),
      });

      const response = await fetchLiveKundli(parsedBirthDate, birthTime, {
        city: location.name,
        state: location.stateCode,
        timezone: location.timezone,
        lat: location.lat,
        lng: location.lon,
      });

      setDetailsReady(true);

      if (response.status === "live") {
        setKundliData(response.data);
        setResultNotice({
          tone: "live",
          message: "Live birth-chart markers are active for the entered details.",
        });
        return;
      }

      setKundliData(null);
      setResultNotice({
        tone: response.status === "unconfigured" ? "preview" : "error",
        message:
          response.status === "unconfigured"
            ? "Live kundli credentials are not configured yet, so the page is showing the guided summary view."
            : `The live kundli request failed, so the page is showing the guided summary view. Reason: ${response.message}`,
      });
    } catch (error) {
      setDetailsReady(true);
      setKundliData(null);
      setResultNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading live kundli details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Janam Kundli"
          subtitle="Enter your birth details to generate your accurate Vedic birth chart with planetary positions, house analysis, and divisional charts."
          icon={<ScrollText className="h-8 w-8" />}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mb-10 max-w-4xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#e4cfa0]/60 bg-[#fffdf8] shadow-[0_8px_32px_rgba(181,148,73,0.10)]">
            {/* Top orange accent */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4651a]/55 to-transparent" />

            <div className="p-6 md:p-8 space-y-7">
              {/* Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#d4651a]/25 bg-[#d4651a]/08 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#a84810]">
                  ✦ Free Birth Chart
                </div>
                <h2 className="font-display text-2xl font-bold text-[#1c1408]">Enter Your Birth Details</h2>
                <p className="text-[13.5px] text-[#5a4025]/65 leading-relaxed">
                  Fill in your birth info to generate an accurate Vedic chart with planetary positions and house analysis.
                </p>
              </div>

              {/* Name + Email */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="flex items-center gap-1.5 text-[13px] font-semibold text-[#2c1a08]">
                    <User className="h-3.5 w-3.5 text-[#d4651a]" /> Full Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Arjun Sharma"
                    className="h-11 rounded-xl border border-[#d8c090]/50 bg-white focus:border-[#d4651a]/60 focus:ring-1 focus:ring-[#d4651a]/20 text-[#1c1408] placeholder:text-[#a08060]/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center gap-1.5 text-[13px] font-semibold text-[#2c1a08]">
                    <Mail className="h-3.5 w-3.5 text-[#d4651a]" /> Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="for chart copy and follow-up"
                    className="h-11 rounded-xl border border-[#d8c090]/50 bg-white focus:border-[#d4651a]/60 focus:ring-1 focus:ring-[#d4651a]/20 text-[#1c1408] placeholder:text-[#a08060]/50 transition-all"
                  />
                </div>
              </div>

              {/* Date + Time + Gender */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="birthDate" className="flex items-center gap-1.5 text-[13px] font-semibold text-[#2c1a08]">
                    <Calendar className="h-3.5 w-3.5 text-[#d4651a]" /> Date of Birth
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(event) => setBirthDate(event.target.value)}
                    min="1900-01-01"
                    max={format(new Date(), "yyyy-MM-dd")}
                    className="h-11 rounded-xl border border-[#d8c090]/50 bg-white focus:border-[#d4651a]/60 focus:ring-1 focus:ring-[#d4651a]/20 text-[#1c1408] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="birthTime" className="flex items-center gap-1.5 text-[13px] font-semibold text-[#2c1a08]">
                    <Clock3 className="h-3.5 w-3.5 text-[#d4651a]" /> Exact Birth Time
                  </Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={birthTime}
                    onChange={(event) => setBirthTime(event.target.value)}
                    className="h-11 rounded-xl border border-[#d8c090]/50 bg-white focus:border-[#d4651a]/60 focus:ring-1 focus:ring-[#d4651a]/20 text-[#1c1408] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-[13px] font-semibold text-[#2c1a08]">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger
                      id="gender"
                      className="h-11 rounded-xl border border-[#d8c090]/50 bg-white text-[#1c1408] focus:border-[#d4651a]/60"
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#2c1a08]">
                  <MapPin className="h-3.5 w-3.5 text-[#d4651a]" /> Birth Place
                </Label>
                <LocationSelector initialCity={location.name} onLocationSelect={setLocation} />
              </div>

              {/* Chart Style */}
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-[#2c1a08]">Preferred Chart Style</Label>
                <ChartStyleToggle chartStyle={chartStyle} onStyleChange={setChartStyle} />
              </div>

              {/* Trust strip */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { icon: Zap,     text: "Instant chart",   sub: "No signup needed" },
                  { icon: Shield,  text: "100% free",       sub: "Always & forever" },
                  { icon: Sparkles,text: "Vedic precision", sub: "Lahiri ayanamsha" },
                ].map(({ icon: Icon, text, sub }) => (
                  <div key={text} className="flex flex-col items-center gap-1 rounded-xl border border-[#e4cfa0]/60 bg-white/70 px-3 py-3 text-center">
                    <Icon className="h-4 w-4 text-[#d4651a]" />
                    <span className="text-[12px] font-semibold text-[#2c1a08] leading-tight">{text}</span>
                    <span className="text-[10.5px] text-[#7a5c36]/65">{sub}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={handlePrepare}
                disabled={!canPrepare || isLoading}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-br from-[#d4651a] via-[#c25510] to-[#a84410] px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(212,101,26,0.38)] transition-all duration-200 hover:shadow-[0_6px_28px_rgba(212,101,26,0.52)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-5 w-5" />
                {isLoading ? "Generating Your Kundli…" : "Generate My Janam Kundli"}
                {!isLoading && <ChevronRight className="h-4 w-4 opacity-70" />}
              </button>

              {!canPrepare && (
                <p className="text-center text-[11.5px] text-[#a08060]/70 -mt-3">
                  Fill your name, email and date of birth to continue
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <AdSenseBanner adSlot="kundli_top_banner" adFormat="horizontal" />

        <AnimatePresence mode="wait">
          {detailsReady && birthSummary && (
            <motion.div
              key={`${birthSummary.formattedDate}-${location.name}-${birthTime}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {resultNotice && (
                <div
                  className={cn(
                    "rounded-2xl border p-4 text-sm leading-relaxed",
                    resultNotice.tone === "live" && "border-emerald-500/20 bg-emerald-500/5 text-emerald-900",
                    resultNotice.tone === "preview" && "border-amber-500/20 bg-amber-500/5 text-muted-foreground",
                    resultNotice.tone === "error" && "border-destructive/20 bg-destructive/5 text-muted-foreground",
                  )}
                >
                  {resultNotice.message}
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <SpiritualCard delay={0.1} hover={false}>
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
                      <ScrollText className="h-4 w-4" />
                      <span>{kundliData ? "Live Birth Details Ready" : "Birth Details Ready"}</span>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-display text-3xl font-semibold text-foreground">
                        {kundliData ? "Your Janam Kundli essentials" : "Your Janam Kundli input summary"}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {kundliData
                          ? "These markers now come from the live birth-details engine and give you the core chart identifiers before deeper interpretation begins."
                          : "These are the essential details a birth chart uses before chart interpretation, dasha timing, and transit analysis begin."}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-background p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Full Name</p>
                        <p className="mt-2 text-base font-medium text-foreground">{name.trim()}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email</p>
                        <p className="mt-2 text-base font-medium text-foreground">{email.trim()}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Birth Date</p>
                        <p className="mt-2 text-base font-medium text-foreground">{birthSummary.formattedDate}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Birth Time</p>
                        <p className="mt-2 text-base font-medium text-foreground">{birthTime}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Birth Place</p>
                        <p className="mt-2 text-base font-medium text-foreground">
                          {location.name}, {location.stateCode}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Profile</p>
                        <p className="mt-2 text-base font-medium text-foreground">
                          {gender[0].toUpperCase()}
                          {gender.slice(1)} • {birthSummary.day}
                        </p>
                      </div>
                      {kundliData?.moonSign && (
                        <div className="rounded-2xl border border-border/70 bg-background p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Moon Sign</p>
                          <p className="mt-2 text-base font-medium text-foreground">
                            {kundliData.moonSign}
                            {kundliData.moonSignLord ? ` • Lord ${kundliData.moonSignLord}` : ""}
                          </p>
                        </div>
                      )}
                      {kundliData?.nakshatra && (
                        <div className="rounded-2xl border border-border/70 bg-background p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Nakshatra</p>
                          <p className="mt-2 text-base font-medium text-foreground">
                            {kundliData.nakshatra}
                            {kundliData.pada ? ` • Pada ${kundliData.pada}` : ""}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </SpiritualCard>

                <SpiritualCard delay={0.15} hover={false}>
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Stars className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-display text-2xl font-semibold text-foreground">
                        {kundliData ? "Live chart markers" : "What a full kundli covers"}
                      </h3>
                    </div>

                    {kundliData ? (
                      <div className="grid gap-3">
                        {[
                          kundliData.sunSign
                            ? `Sun sign: ${kundliData.sunSign}${kundliData.sunSignLord ? ` • Lord ${kundliData.sunSignLord}` : ""}`
                            : null,
                          kundliData.zodiac ? `Zodiac context: ${kundliData.zodiac}` : null,
                          kundliData.nakshatraLord ? `Nakshatra lord: ${kundliData.nakshatraLord}` : null,
                          kundliData.additionalInfo?.deity ? `Deity: ${kundliData.additionalInfo.deity}` : null,
                          kundliData.additionalInfo?.nadi ? `Nadi: ${kundliData.additionalInfo.nadi}` : null,
                          kundliData.additionalInfo?.syllables ? `Suggested syllables: ${kundliData.additionalInfo.syllables}` : null,
                          kundliData.hasMangalDosha !== null
                            ? kundliData.hasMangalDosha
                              ? `Mangal dosha indicated${kundliData.mangalDoshaDescription ? ` • ${kundliData.mangalDoshaDescription}` : ""}`
                              : "Mangal dosha not indicated in the current live response."
                            : null,
                        ]
                          .filter((item): item is string => Boolean(item))
                          .map((item) => (
                            <div
                              key={item}
                              className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background p-4"
                            >
                              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                              <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {[
                          "Lagna, Moon sign, and house structure for personality and life themes",
                          "Graha positions for strengths, pressure points, and timing sensitivity",
                          "Dasha and transit layers for longer cycles and shorter decision windows",
                          "Practical remedies, compatibility, and life-focus guidance based on the full chart",
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background p-4"
                          >
                            <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                            <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </SpiritualCard>
              </div>

              {localChart && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                  {/* Three Charts Grid */}
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* 1. Lagna D1 Chart */}
                    <SpiritualCard delay={0.18} hover={false}>
                      <div className="space-y-5">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a6a2f]">
                            Lagna Chart (D1)
                          </p>
                          <h3 className="mt-2 font-display text-2xl font-semibold text-foreground">
                            {SIGNS[localChart.lagnaSignIdx]} Ascendant
                          </h3>
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground min-h-[32px]">
                            Physical reality, body constitution, temperament, and primary life experiences.
                          </p>
                        </div>

                        <KundliChart
                          chartStyle={chartStyle}
                          lagnaIndex={localChart.lagnaSignIdx}
                          title={chartStyle === "north" ? "Lagna Kundli (D1)" : "Lagna Kundli (D1)"}
                          planets={listPlanets}
                        />
                      </div>
                    </SpiritualCard>

                    {/* 2. Bhava Chalit Chart */}
                    <SpiritualCard delay={0.22} hover={false}>
                      <div className="space-y-5">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a6a2f]">
                            Bhava Chalit Chart
                          </p>
                          <h3 className="mt-2 font-display text-2xl font-semibold text-foreground">
                            House Cusp Positions
                          </h3>
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground min-h-[32px]">
                            Astronomical house coordinates of planets centering on the Ascendant degree boundary.
                          </p>
                        </div>

                        <KundliChart
                          chartStyle={chartStyle}
                          lagnaIndex={localChart.lagnaSignIdx}
                          title={chartStyle === "north" ? "Bhava Chalit" : "Bhava Chalit"}
                          planets={bhavaPlanets}
                        />
                      </div>
                    </SpiritualCard>

                    {/* 3. Navamsa D9 Chart */}
                    <SpiritualCard delay={0.26} hover={false}>
                      <div className="space-y-5">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a6a2f]">
                            Navamsa Chart (D9)
                          </p>
                          <h3 className="mt-2 font-display text-2xl font-semibold text-foreground">
                            Vedic Soul Blueprint
                          </h3>
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground min-h-[32px]">
                            Divisional chart mapping the soul's inner potential, marriage, and second-half of life.
                          </p>
                        </div>

                        <KundliChart
                          chartStyle={chartStyle}
                          lagnaIndex={navamsaIndex}
                          title={chartStyle === "north" ? "Navamsa (D9)" : "Navamsa (D9)"}
                          planets={navamsaPlanets}
                        />
                      </div>
                    </SpiritualCard>
                  </div>

                  {/* Marker Legend & Planet Table Side-by-Side */}
                  <div className="grid gap-6 lg:grid-cols-[0.4fr_0.6fr]">
                    <SpiritualCard delay={0.3} hover={false}>
                      <div className="space-y-4">
                        <h4 className="font-display text-lg font-bold text-foreground">Planetary Alignments Legend</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Glyphs represent specific cosmic alignments that influence the expression of planetary systems.
                        </p>
                        <div className="rounded-2xl border border-[#d9c49a]/45 bg-white/75 p-4 text-xs text-[#6d5530] space-y-3 shadow-inner">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-orange-500 text-lg">*</span>
                            <div>
                              <p className="font-semibold">Retrograde (*)</p>
                              <p className="text-[10px] text-muted-foreground">Graha moving backwards relative to Earth, intensifying its internal karmic lessons.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-red-500 text-lg">^</span>
                            <div>
                              <p className="font-semibold">Combust (^)</p>
                              <p className="text-[10px] text-muted-foreground">Graha positioned too close to the Sun, burning and redirecting its outer expression.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-emerald-600 text-lg">↑</span>
                            <div>
                              <p className="font-semibold">Exalted (↑)</p>
                              <p className="text-[10px] text-muted-foreground">Graha operating at maximum strength and purity in its peak sign alignment.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-violet-600 text-lg">↓</span>
                            <div>
                              <p className="font-semibold">Debilitated (↓)</p>
                              <p className="text-[10px] text-muted-foreground">Graha operating under extreme compression, requesting remedial balancing work.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SpiritualCard>

                    <PlanetTable
                      planets={localChart.planets}
                      lagna={{
                        sign: SIGNS[localChart.lagnaSignIdx],
                        degree: localChart.ascendant % 30,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-3">
                <SpiritualCard delay={0.2}>
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sacred-amber">
                      <Compass className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h4 className="font-display text-xl font-semibold text-foreground">
                      {kundliData ? "Chart Snapshot" : "Chart Readiness"}
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {kundliData
                        ? "You now have the key birth-details markers needed for dasha timing, transit work, and a deeper chart-reading layer."
                        : "Your birth details are structured and ready for deeper kundli logic or a manual chart reading flow."}
                    </p>
                  </div>
                </SpiritualCard>

                <SpiritualCard delay={0.25}>
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-light">
                      <BookOpen className="h-6 w-6 text-foreground" />
                    </div>
                    <h4 className="font-display text-xl font-semibold text-foreground">Next Tool</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Use Dasha Calculator after this if you want to explore long-term timing patterns around life phases.
                    </p>
                  </div>
                </SpiritualCard>

                <SpiritualCard delay={0.3}>
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-maroon-light">
                      <Sparkles className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <h4 className="font-display text-xl font-semibold text-foreground">Daily Layer</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Pair your full chart with Daily Guidance to keep astrology grounded in everyday choices and timing.
                    </p>
                  </div>
                </SpiritualCard>
              </div>

              <SpiritualCard delay={0.35} hover={false}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl font-semibold text-foreground">
                      Continue with the next layer
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {kundliData
                        ? "Use the live chart markers here as the base layer, then continue into Dasha and Daily Guidance for timing and day-to-day application."
                        : "If the live chart backend is not configured yet, this summary still preserves the birth-detail workflow cleanly while the full engine is being connected."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild variant="outline" size="lg">
                      <Link to="/dasha">Open Dasha Calculator</Link>
                    </Button>
                    <Button asChild variant="saffron" size="lg">
                      <Link to="/daily-guidance">View Daily Guidance</Link>
                    </Button>
                  </div>
                </div>
              </SpiritualCard>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-16"
        >
          <KundaliReviews />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-12 mb-8"
        >
          <KundaliFAQ />
        </motion.div>
      </div>
    </Layout>
  );
};

export default JanamKundliPage;
