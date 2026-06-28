import React, { useEffect, useState, useMemo } from "react";
import { Loader2, ScrollText, User, MapPin, Clock, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { kundliService } from "../../services/kundliService";
import { UserProfile } from "../../types/user";
import { CosmicIdentity } from "../../types/kundli";
import { BirthSummaryCard } from "../../components/dashboard/BirthSummaryCard";
import { KundliChart } from "../../components/shared/KundliChart";
import ChartStyleToggle from "../../components/kundali/ChartStyleToggle";
import { KundliOverviewAccordion } from "../../components/kundali/KundliOverviewAccordion";
import AppShell from "./AppShell";
import { cn } from "../../lib/utils";

import { getAscendant, getPlanetPositions, PlanetPosition } from "../../lib/astro/kundaliEngine";
import { computeBirthMetadata, BirthMetadata } from "../../lib/astro/birthMetadata";
import { calculateDivisionalSign } from "../../lib/astro/vargaEngine";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const parseBirthTime = (birthTime: string) => {
  const trimmed = birthTime.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (!Number.isFinite(hour) || !Number.isFinite(minute) || minute < 0 || minute > 59) {
    return null;
  }

  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
  } else if (hour < 0 || hour > 23) {
    return null;
  }

  return { hour, minute };
};

const toUTC = (birthDate: Date, birthTime: string, timezone: string) => {
  const yyyyMmDd = format(birthDate, "yyyy-MM-dd");
  const [year, month, day] = yyyyMmDd.split("-").map(Number);
  const parsedTime = parseBirthTime(birthTime);
  if (!parsedTime) {
    throw new Error(`Unsupported birth time format: ${birthTime}`);
  }
  const { hour, minute } = parsedTime;
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
  parts.forEach((part) => { map[part.type] = part.value; });
  const reportedHour = map.hour === "24" ? 0 : parseInt(map.hour, 10);
  const tzDateNaive = new Date(Date.UTC(
    parseInt(map.year, 10),
    parseInt(map.month, 10) - 1,
    parseInt(map.day, 10),
    reportedHour,
    parseInt(map.minute, 10),
    parseInt(map.second, 10),
  ));
  const offsetMs = tzDateNaive.getTime() - naiveUTC.getTime();
  return new Date(naiveUTC.getTime() - offsetMs);
};

export const AppKundali: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [kundli, setKundli] = useState<CosmicIdentity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartStyle, setChartStyle] = useState<"north" | "south">("north");
  const activeKundaliProfile = localStorage.getItem("activeKundaliProfile") ?? "1";

  useEffect(() => {
    let isMounted = true;
    const loadKundali = async () => {
      if (!currentUser) return;
      try {
        const [userProfile, userKundli] = await Promise.all([
          userService.getCurrentUserProfile(currentUser.uid),
          kundliService.getKundli(currentUser.uid),
        ]);
        if (isMounted) {
          setProfile(userProfile);
          setKundli(userKundli);
        }
      } catch (error) {
        console.error("Error loading kundali app page:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadKundali();
    return () => { isMounted = false; };
  }, [currentUser]);

  // Active birth details (User 1 or User 2)
  const activeBD = (activeKundaliProfile === "2" && profile?.birthDetails2)
    ? profile.birthDetails2
    : profile?.birthDetails;

  // Derived Local Chart Data
  const localChartData = useMemo(() => {
    if (!activeBD || !activeBD.date || !activeBD.time) return null;
    try {
      const { date, time, latitude, longitude, timezoneId } = activeBD;
      const hasUsableCoordinates =
        typeof latitude === "number" &&
        typeof longitude === "number" &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        !(latitude === 0 && longitude === 0);
      const resolvedLat = hasUsableCoordinates ? latitude : 28.6139;
      const resolvedLng = hasUsableCoordinates ? longitude : 77.209;
      
      const parsedDate = new Date(date);
      const birthUTC = toUTC(parsedDate, time, timezoneId || "Asia/Kolkata");
      const planets = getPlanetPositions(birthUTC, resolvedLat, resolvedLng);
      const ascendant = getAscendant(birthUTC, resolvedLat, resolvedLng);
      const lagnaSignIdx = Math.floor(ascendant / 30);
      
      // Calculate local midnight UTC and weekday
      const yyyyMmDd = format(parsedDate, "yyyy-MM-dd");
      const [year, month, day] = yyyyMmDd.split("-").map(Number);
      const localMidnightUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      const weekdayIndex = parsedDate.getDay();

      const metadata = computeBirthMetadata({
        planets,
        ascendant,
        lagnaSignIdx,
        birthUTC,
        localMidnightUTC,
        weekdayIndex,
        lat: resolvedLat,
        lon: resolvedLng,
        timezone: timezoneId || "Asia/Kolkata"
      });

      return { planets, ascendant, lagnaSignIdx, metadata, resolvedLat, resolvedLng, usedFallbackLocation: !hasUsableCoordinates };
    } catch (e) {
      console.error("Error computing local chart data:", e);
      return null;
    }
  }, [activeBD]);

  const listPlanets = useMemo(() => {
    if (!localChartData) return [];
    return localChartData.planets.map((planet) => ({
      name: planet.name,
      lon: planet.longitude,
      retrograde: planet.retrograde,
      combust: planet.combust,
    }));
  }, [localChartData]);

  const bhavaPlanets = useMemo(() => {
    if (!localChartData || listPlanets.length === 0) return [];
    const ascLon = localChartData.ascendant;
    const lagnaIndex = localChartData.lagnaSignIdx;
    return listPlanets.map((p) => {
      const dist = ((p.lon - (ascLon - 15)) % 360 + 360) % 360;
      const bhavaNum = Math.floor(dist / 30);
      const targetSignIdx = (lagnaIndex + bhavaNum) % 12;
      return { ...p, lon: targetSignIdx * 30 + (p.lon % 30) };
    });
  }, [localChartData, listPlanets]);

  const navamsaIndex = useMemo(() => {
    if (!localChartData) return 0;
    return calculateDivisionalSign(localChartData.ascendant, 9, "D9") - 1;
  }, [localChartData]);

  const navamsaPlanets = useMemo(() => {
    if (!localChartData || listPlanets.length === 0) return [];
    return listPlanets.map((p) => {
      const absNavamsa = Math.floor(p.lon / (30 / 9));
      const signIndex = absNavamsa % 12;
      return { ...p, lon: signIndex * 30 + 15 };
    });
  }, [localChartData, listPlanets]);

  // House-wise planets grouping
  const housesArray = useMemo(() => {
    if (!localChartData) return [];
    const lagnaIdx = localChartData.lagnaSignIdx;
    const result = Array.from({ length: 12 }, (_, i) => ({
      houseNumber: i + 1,
      signName: SIGNS[(lagnaIdx + i) % 12],
      planets: [] as PlanetPosition[]
    }));
    localChartData.planets.forEach(p => {
      if (p.house >= 1 && p.house <= 12) {
        result[p.house - 1].planets.push(p);
      }
    });
    return result;
  }, [localChartData]);

  if (isLoading) {
    return (
      <AppShell title="Janam Kundali" eyebrow="Your Birth Chart" showBack>
        <div className="flex justify-center p-10">
          <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
        </div>
      </AppShell>
    );
  }

  if (!profile || !activeBD) {
    return (
      <AppShell title="Janam Kundali" eyebrow="Your Birth Chart" showBack>
        <div className="bg-white rounded-2xl border border-amber-100 p-5 text-sm text-stone-500 text-center m-4">
          Kundali data not found. Please complete onboarding again from your profile.
        </div>
      </AppShell>
    );
  }

  const bd = activeBD;
  const meta = localChartData?.metadata;
  const personName = activeKundaliProfile === "2"
    ? (profile.birthDetails2?.label || "User 2")
    : (profile.profile?.displayName || currentUser?.displayName || undefined);

  return (
    <AppShell title="Janam Kundali" eyebrow="Your Birth Chart" showBack>
      <div className="space-y-6 max-w-[430px] mx-auto pb-6">
        
        {/* Section 1: Core Kundali Summary */}
        <BirthSummaryCard profile={profile} kundli={kundli} isLoading={false} personName={personName} />

        {/* Birth Profile Details */}
        <section className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-amber-600" />
            <h3 className="text-[13px] uppercase font-bold tracking-widest text-stone-700">Birth Profile</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Date</p>
              <p className="font-semibold text-stone-800">{bd.date ? format(new Date(bd.date), "dd MMM yyyy") : "-"}</p>
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Time</p>
              <p className="font-semibold text-stone-800">{bd.time}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Place</p>
              <p className="font-semibold text-stone-800 truncate">{[bd.city, bd.state].filter(Boolean).join(", ") || bd.formattedAddress}</p>
              <p className="text-xs text-stone-500 mt-0.5">
                {localChartData?.resolvedLat.toFixed(2)}°, {localChartData?.resolvedLng.toFixed(2)}°
                {localChartData?.usedFallbackLocation && " · using fallback coordinates"}
              </p>
            </div>
            {meta && (
              <>
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Ayanamsa</p>
                  <p className="font-semibold text-stone-800 text-xs truncate" title={meta.ayanamsa}>{meta.ayanamsa}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Lagna / Asc</p>
                  <p className="font-semibold text-stone-800">{meta.lagna}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Sun Sign</p>
                  <p className="font-semibold text-stone-800">{meta.sunSign}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Moon Sign</p>
                  <p className="font-semibold text-stone-800">{meta.moonSign}</p>
                </div>
              </>
            )}
          </div>
        </section>

        {localChartData && meta && (
          <>
            {/* Section 2: Charts */}
            <section className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-stone-50 pb-3">
                <h3 className="text-[13px] uppercase font-bold tracking-widest text-stone-700">Birth Charts</h3>
                <ChartStyleToggle chartStyle={chartStyle} onStyleChange={setChartStyle} />
              </div>

              {/* D1 Lagna Chart */}
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-400">D1 Chart</p>
                  <h4 className="font-display text-xl font-semibold text-stone-800">Lagna Kundli</h4>
                </div>
                <KundliChart
                  chartStyle={chartStyle}
                  lagnaIndex={localChartData.lagnaSignIdx}
                  title=""
                  planets={listPlanets}
                />
              </div>

              {/* Bhava Chalit */}
              <div className="space-y-3 pt-6 border-t border-stone-100">
                <div className="text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-400">House Cusps</p>
                  <h4 className="font-display text-xl font-semibold text-stone-800">Bhava Chalit</h4>
                </div>
                <KundliChart
                  chartStyle={chartStyle}
                  lagnaIndex={localChartData.lagnaSignIdx}
                  title=""
                  planets={bhavaPlanets}
                />
              </div>

              {/* D9 Navamsa */}
              <div className="space-y-3 pt-6 border-t border-stone-100">
                <div className="text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-400">D9 Chart</p>
                  <h4 className="font-display text-xl font-semibold text-stone-800">Navamsa</h4>
                </div>
                <KundliChart
                  chartStyle={chartStyle}
                  lagnaIndex={navamsaIndex}
                  title=""
                  planets={navamsaPlanets}
                />
              </div>
            </section>

            {/* Section 3: Mobile Planetary Cards */}
            <section className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
              <h3 className="text-[13px] uppercase font-bold tracking-widest text-stone-700 mb-4 border-b border-stone-50 pb-2">Planetary Alignments</h3>
              <div className="space-y-3">
                {localChartData.planets.map((planet) => (
                  <div key={planet.name} className="flex flex-col gap-2 p-3 rounded-xl border border-stone-100 bg-stone-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                        {planet.name}
                        {planet.retrograde && <span className="text-orange-500 font-black" title="Retrograde">*</span>}
                        {planet.combust && <span className="text-rose-500 font-black" title="Combust">^</span>}
                      </span>
                      <span className="text-xs font-semibold bg-white border px-2 py-0.5 rounded shadow-sm text-stone-600">
                        {planet.sign}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-stone-500 mt-1">
                      <div><span className="text-stone-400">Degree:</span> {Math.floor(planet.degree)}° {Math.round((planet.degree % 1) * 60)}'</div>
                      <div><span className="text-stone-400">House:</span> {planet.house}</div>
                      <div className="col-span-2 truncate"><span className="text-stone-400">Nakshatra:</span> {planet.nakshatra} (Pada {planet.pada})</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-[10px] text-stone-500 space-y-1">
                <p><span className="text-orange-500 font-bold text-base align-middle">*</span> Retrograde (moving backward)</p>
                <p><span className="text-rose-500 font-bold text-base align-middle">^</span> Combust (too close to Sun)</p>
              </div>
            </section>

            {/* Section 4: House Positions */}
            <section className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
              <h3 className="text-[13px] uppercase font-bold tracking-widest text-stone-700 mb-4 border-b border-stone-50 pb-2">House Positions</h3>
              <div className="space-y-2">
                {housesArray.map((house) => (
                  <div key={house.houseNumber} className="flex gap-3 py-2 border-b border-stone-50 last:border-0">
                    <div className="w-16 shrink-0">
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">House {house.houseNumber}</div>
                      <div className="text-xs font-semibold text-stone-600">{house.signName}</div>
                    </div>
                    <div className="flex-1 flex flex-wrap gap-1.5 items-center">
                      {house.planets.length > 0 ? (
                        house.planets.map(p => (
                          <span key={p.name} className="px-2 py-1 bg-stone-100 text-stone-700 text-xs rounded-md font-medium">
                            {p.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-stone-400 italic">Empty</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5: Kundli Overview & Predictions Accordions */}
            <section className="bg-white rounded-2xl border border-stone-100 p-1 shadow-sm">
               <KundliOverviewAccordion metadata={meta} />
            </section>

            {/* CTA — Full Report */}
            <section className="rounded-2xl overflow-hidden bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 p-5 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80 mb-1">✦ Unlock Everything</p>
              <h3 className="font-display text-xl font-bold text-white mb-1">Get Your Full Kundali Report</h3>
              <p className="text-xs text-white/60 leading-relaxed mb-4">
                Detailed predictions, Dasha timeline, dosha remedies, gemstone recommendations, and your complete life map — all in one beautifully crafted report.
              </p>
              <a
                href="/kundali-report"
                className="block w-full py-3.5 text-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[14px] font-bold tracking-wide active:opacity-90 transition-opacity"
              >
                View Full Report →
              </a>
            </section>

          </>
        )}
      </div>
    </AppShell>
  );
};

export default AppKundali;
