import React from "react";
import { cn } from "../../lib/utils";
import { lookupTranslation } from "../../lib/pdf/preTranslate";
import { KANNADA_DICT } from "../../lib/pdf/kannadaTranslations";
import { calculateDivisionalSign } from "../../lib/astro/vargaEngine";
import { KundliChart } from "./KundliChart";
import { generateHouseAnalyses } from "../../lib/calculators/astrology/houseInterpretations";
import {
  ReportPage,
  CoverPage,
  SectionDivider,
  PredictionCard,
  RemedyBox,
  DashaTimeline,
  PlanetTable,
  ForecastSection,
  PlanetRow,
  DashaPeriod,
} from "./ReportComponents";
import {
  ZODIAC_SIGNS,
  ZODIAC_LORDS,
  NAKSHATRA_NAMES,
  NAKSHATRA_LORDS,
  NAKSHATRA_DESCRIPTIONS,
  RASHI_DESCRIPTIONS,
  PLANET_DESCRIPTIONS,
  HOUSE_DESCRIPTIONS,
  DASHA_PREDICTIONS,
  LUCKY_INFO,
  DASHA_REMEDY_GUIDES,
} from "../../lib/pdf/kundaliContent";
import { getPlanetPositions, getAscendant } from "../../lib/astro/kundaliEngine";
import { calculateVimshottariDasha } from "../../lib/calculators/astrology/vimshottari";
import {
  generateDashaAnalysis,
  generateDashaRoadmap,
  type DashaRoadmapEntry,
} from "../../lib/calculators/astrology/dashaPredictions";
import { analyzeYogasAndDoshas } from "../../lib/calculators/astrology/yogasAndDoshas";
import { getSiderealSaturnLongitude } from "../../lib/calculators/astrology/sadeSati";
import { buildSharedReportData, RASHI_ATTRIBUTES, NAKSHATRA_ATTRIBUTES, buildChandraMandate, SANSKRIT_SIGNS } from "../../lib/pdf/sharedReportModel";

export interface KundaliBirthData {
  name: string;
  email: string;
  dob: string;       // "YYYY-MM-DD"
  tob: string;       // "HH:MM"
  gender: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;  // e.g. "Asia/Kolkata"
  plan: "basic" | "detailed";
  chartStyle?: "north" | "south";
}

interface KundaliReportTemplateProps {
  data: KundaliBirthData;
  isDemo?: boolean;
  exportMode?: boolean;
  language?: string;
}

interface LuckySupportCard {
  label: string;
  source: string;
  planet: string;
  lucky: (typeof LUCKY_INFO)[keyof typeof LUCKY_INFO];
}

const DigitalYantraSeal: React.FC<{ yantra: number[][] }> = ({ yantra }) => (
  <svg
    viewBox="0 0 132 132"
    className="h-[120px] w-[120px]"
    aria-hidden="true"
    role="presentation"
  >
    <rect x="4" y="4" width="124" height="124" rx="16" fill="#fffef9" stroke="rgba(181,148,73,0.32)" strokeWidth="2" />
    <rect x="16" y="16" width="100" height="100" rx="12" fill="#ffffff" stroke="rgba(181,148,73,0.18)" strokeWidth="1.5" />

    {[49.3, 82.7].map((x) => (
      <line
        key={`v-${x}`}
        x1={x}
        y1="16"
        x2={x}
        y2="116"
        stroke="rgba(181,148,73,0.28)"
        strokeWidth="1.5"
      />
    ))}
    {[49.3, 82.7].map((y) => (
      <line
        key={`h-${y}`}
        x1="16"
        y1={y}
        x2="116"
        y2={y}
        stroke="rgba(181,148,73,0.28)"
        strokeWidth="1.5"
      />
    ))}

    {yantra.map((row, rowIndex) =>
      row.map((digit, colIndex) => (
        <text
          key={`yantra-${rowIndex}-${colIndex}`}
          x={32.7 + colIndex * 33.4}
          y={39.5 + rowIndex * 33.4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fontWeight="700"
          fill="#722f37"
          fontFamily="Georgia, 'Times New Roman', serif"
        >
          {digit}
        </text>
      ))
    )}
  </svg>
);

function chunkEntries<T>(entries: T[], size: number): T[][] {
  if (entries.length === 0) return [[]];

  const chunks: T[][] = [];
  for (let i = 0; i < entries.length; i += size) {
    chunks.push(entries.slice(i, i + size));
  }
  return chunks;
}

function formatHouseRange(startHouse: number, endHouse: number) {
  return startHouse === endHouse ? `House ${startHouse}` : `Houses ${startHouse} to ${endHouse}`;
}

export const KundaliReportTemplate: React.FC<KundaliReportTemplateProps> = ({
  data,
  isDemo = false,
  exportMode = false,
  language = "en",
}) => {
  const sharedData = React.useMemo(() => {
    return buildSharedReportData(data, language);
  }, [data, language]);

  const {
    birthUTC, moonLon, sunLon, marsLon, mercuryLon, jupiterLon, venusLon, saturnLon, rahuLon, ketuLon,
    nakshatraIndex, nakshatraName, nakshatraLord, degWithin, nakshatraPada, rashiIndex, rashiName,
    realAscendant, lagnaIndex, lagnaName, dashaResult, currentMaha, dashaPeriods, activePeriodText,
    panchanga, dashaAnalysis, dashaRoadmap, planetRows, luckySupportCards, primaryLuckySupport,
    primaryLucky, currentDashaLucky, remedyPlanet, mahaRemedyEntries, listPlanets, navamsaIndex,
    navamsaPlanets, bhavaPlanets, bhavaTableRows, houseAnalyses, currentSaturnLon, currentSaturnSignIndex,
    yogaReport, presentYogas, favourableCareerPeriods, favourableMarriagePeriods, favourableBusinessPeriods,
    favourableHousePeriods, yogaChunks, sarvaPoints, lagnaSarva, h9Sarva, h10Sarva, h11Sarva,
    suryaArr, chandraArr, marsArr, mercuryArr, jupiterArr, venusArr, saturnArr,
    sunSignIdx, moonSignIdx, marsSignIdx, mercurySignIdx, jupiterSignIdx, venusSignIdx, saturnSignIdx,
    jupAge, venAge, merAge, forecasts, t
  } = sharedData;

  const suryaPoints = suryaArr[sunSignIdx];
  const chandraPoints = chandraArr[moonSignIdx];
  const kujaPoints = marsArr[marsSignIdx];
  const budhaPoints = mercuryArr[mercurySignIdx];
  const guruPoints = jupiterArr[jupiterSignIdx];
  const shukraPoints = venusArr[venusSignIdx];
  const shaniPoints = saturnArr[saturnSignIdx];

  const upcomingForecastPages = React.useMemo(
    () =>
      dashaAnalysis
        ? chunkEntries(dashaAnalysis.upcomingAntardashas.slice(0, 5), exportMode ? 2 : 5)
        : [],
    [dashaAnalysis, exportMode]
  );

  const dashaRoadmapPages = React.useMemo(
    () => chunkEntries(dashaRoadmap, exportMode ? 1 : 2),
    [dashaRoadmap, exportMode]
  );
  const roadmapPageCount = data.plan === "detailed" && dashaAnalysis ? dashaRoadmapPages.length : 0;

  const mahaRemedyPages = React.useMemo(
    () =>
      data.plan === "detailed"
        ? (mahaRemedyEntries.length ? mahaRemedyEntries.map((entry) => [entry]) : [[]])
        : [mahaRemedyEntries[0] ? [mahaRemedyEntries[0]] : []],
    [data.plan, mahaRemedyEntries]
  );

  const housePredictionPages = React.useMemo(
    () =>
      data.plan === "detailed"
        ? chunkEntries(houseAnalyses, exportMode ? 1 : 4)
        : [],
    [data.plan, exportMode, houseAnalyses]
  );
  const extraHousePredictionShift = Math.max(0, housePredictionPages.length - 3);

  const hasDetailedInsights = data.plan === "detailed" && Boolean(dashaAnalysis);
  const basePlanetaryPage = data.plan === "detailed" ? 10 + extraHousePredictionShift : 7;
  const baseMoonPage = basePlanetaryPage + 1;
  const baseNakshatraPage = baseMoonPage + 1;
  const baseTimelinePage = baseNakshatraPage + 1;
  const baseMahadashaPage = baseTimelinePage + 1;
  const baseFavourableCareerPage = baseMahadashaPage + 1;
  const baseFavourableMarriagePage = baseFavourableCareerPage + 1;
  const baseAntardashaPage = hasDetailedInsights ? baseFavourableMarriagePage + 1 : null;
  const baseUpcomingForecastPage = hasDetailedInsights && baseAntardashaPage !== null ? baseAntardashaPage + 1 : null;
  const baseRoadmapPage = hasDetailedInsights && baseUpcomingForecastPage !== null
    ? baseUpcomingForecastPage + upcomingForecastPages.length
    : null;
  const baseRemediesPage = data.plan === "detailed"
    ? (baseRoadmapPage !== null ? baseRoadmapPage + roadmapPageCount : baseFavourableMarriagePage + 1)
    : baseFavourableMarriagePage + 1;
  const baseLuckyElementsPage = baseRemediesPage + mahaRemedyPages.length;
  const baseYogasPage = baseLuckyElementsPage + 1;
  const baseAshtakavargaPage = baseYogasPage + yogaChunks.length;
  const baseVedicRemediesPage = baseAshtakavargaPage + 2;
  const baseTransitPartOnePage = baseVedicRemediesPage + 1;
  const baseTransitPartTwoPage = baseTransitPartOnePage + 1;
  const baseDisclaimerPage = baseTransitPartTwoPage + 1;

  let pNum = 2;

  return (
    <div className={exportMode ? "bg-transparent py-0 min-h-screen" : "bg-[#120719]/40 py-8 min-h-screen"}>
      {/* ─── PAGE 1: COVER PAGE ─── */}
      <CoverPage language={language}
        name={data.name}
        dob={data.dob}
        tob={data.tob}
        city={data.city}
        lagna={lagnaName}
        rashi={rashiName}
        nakshatra={nakshatraName}
        exportMode={exportMode}
        priceTag={data.plan === "detailed" ? "₹999 Premium" : "₹299 Basic"}
      />

      {/* ─── PAGE 2: BIRTH DETAILS & SUMMARY ─── */}
      <ReportPage language={language} pageNumber={pNum++} sectionTitle="Birth Details & D1 Chart" exportMode={exportMode}>
        <SectionDivider language={language}
          title="Birth Details & Astrological Profile"
          subtitle="Vedic calculations mapped to the cosmic canvas at your moment of incarnation"
        />

        <div className="grid grid-cols-2 gap-4 mt-4 font-serif text-xs">
          <div className="bg-white p-3 rounded-lg border border-[#b59449]/20 space-y-2">
            <h4 className="font-bold text-[#722f37] border-b border-[#b59449]/10 pb-1 uppercase tracking-wider text-[10px]">
              Physical Birth Parameters
            </h4>
            <div className="flex justify-between pb-0.5 border-b border-[#b59449]/5">
              <span className="text-[#888888]">Full Name:</span>
              <span className="font-semibold text-foreground">{data.name}</span>
            </div>
            <div className="flex justify-between pb-0.5 border-b border-[#b59449]/5">
              <span className="text-[#888888]">Date of Birth:</span>
              <span className="font-semibold text-foreground">{data.dob}</span>
            </div>
            <div className="flex justify-between pb-0.5 border-b border-[#b59449]/5">
              <span className="text-[#888888]">Time of Birth:</span>
              <span className="font-semibold text-foreground">{data.tob}</span>
            </div>
            <div className="flex justify-between pb-0.5 border-b border-[#b59449]/5">
              <span className="text-[#888888]">Birth Location:</span>
              <span className="font-semibold text-foreground">{data.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888888]">Timezone:</span>
              <span className="font-semibold text-foreground">{data.timezone}</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-[#b59449]/20 space-y-2">
            <h4 className="font-bold text-[#722f37] border-b border-[#b59449]/10 pb-1 uppercase tracking-wider text-[10px]">
              Vedic Astronomical Metrics
            </h4>
            <div className="flex justify-between pb-0.5 border-b border-[#b59449]/5">
              <span className="text-[#888888]">Lagna Ascendant:</span>
              <span className="font-semibold text-[#722f37]">{lagnaName}</span>
            </div>
            <div className="flex justify-between pb-0.5 border-b border-[#b59449]/5">
              <span className="text-[#888888]">Moon Sign (Rashi):</span>
              <span className="font-semibold text-[#722f37]">{rashiName}</span>
            </div>
            <div className="flex justify-between pb-0.5 border-b border-[#b59449]/5">
              <span className="text-[#888888]">Nakshatra (Pada):</span>
              <span className="font-semibold text-foreground">{nakshatraName} (Pada {nakshatraPada})</span>
            </div>
            <div className="flex justify-between pb-0.5 border-b border-[#b59449]/5">
              <span className="text-[#888888]">Coordinates:</span>
              <span className="font-semibold text-foreground">
                {Math.abs(data.lat).toFixed(4)}°{data.lat >= 0 ? "N" : "S"},{" "}
                {Math.abs(data.lon).toFixed(4)}°{data.lon >= 0 ? "E" : "W"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888888]">Ayanamsa Method:</span>
              <span className="font-semibold text-foreground">Lahiri Chitra Paksha</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <KundliChart
            lagnaIndex={lagnaIndex}
            planets={listPlanets}
            title="Lagna Ascendant Kundli Chart (D1)"
            chartStyle={data.chartStyle ?? "north"}
            language={language}
          />

          {/* Chart Legend */}
          <div className="mt-3 grid grid-cols-2 gap-2 max-w-[300px] w-full mx-auto print:mt-1">
            <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
              <span className="font-bold text-orange-600 text-xs leading-none">*</span>
              <span>{t("Retrograde")}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
              <span className="font-bold text-red-500 text-xs leading-none">^</span>
              <span>{t("Combust")}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
              <span className="font-bold text-emerald-600 text-xs leading-none">↑</span>
              <span>{t("Exalted")}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
              <span className="font-bold text-violet-600 text-xs leading-none">↓</span>
              <span>{t("Debilitated")}</span>
            </div>
          </div>
        </div>
      </ReportPage>

      {/* ─── PAGE 3: BHAVA CHALIT CHART ─── */}
      <ReportPage language={language} pageNumber={pNum++} sectionTitle="D9 Navamsa Chart" exportMode={exportMode}>
        <SectionDivider language={language}
          title="Divisional Navamsa Chart (D9)"
          subtitle="The chart of the soul, inner potential, and marriage/harmonious path"
        />

        <div className="grid grid-cols-2 gap-4 items-center">
          <div>
            <PredictionCard language={language}
              title="Ascendant Lagna Personality Analysis"
              content={`Your Lagna Ascendant is ${lagnaName}. This represents the dynamic physical body, early environments, and how you approach challenges in your primary paths. It anchors your personality and determines which house planetary systems activate throughout your life transits.`}
            />
            <p className="text-xs leading-relaxed text-muted-foreground mt-2 text-justify">
              The Navamsa (D9) divisional chart details the spiritual core of your planetary systems. While D1 shows physical realities, D9 shows the spiritual potential and second-half of life.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <KundliChart
              lagnaIndex={navamsaIndex}
              planets={navamsaPlanets}
              title="D9 Navamsa Chart" language={language}
              chartStyle={data.chartStyle ?? "north"}
            />

            <div className="mt-3 grid grid-cols-2 gap-2 max-w-[300px] w-full mx-auto print:mt-1">
              <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
                <span className="font-bold text-orange-600 text-xs leading-none">*</span>
                <span>{t("Retrograde")}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
                <span className="font-bold text-red-500 text-xs leading-none">^</span>
                <span>{t("Combust")}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
                <span className="font-bold text-emerald-600 text-xs leading-none">↑</span>
                <span>{t("Exalted")}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
                <span className="font-bold text-violet-600 text-xs leading-none">↓</span>
                <span>{t("Debilitated")}</span>
              </div>
            </div>
          </div>
        </div>
      </ReportPage>

      <ReportPage language={language} pageNumber={pNum++} sectionTitle="Bhava Chalit Chart" exportMode={exportMode}>
        <SectionDivider language={language}
          title="Vedic Bhava Chalit Chart (Cusp Positions)"
          subtitle="Astronomical house positions of planets based on the Ascendant degree boundary"
        />

        <div className="grid grid-cols-2 gap-4 mt-2 font-serif text-xs">
          <div className="bg-white p-3 rounded-lg border border-[#b59449]/20 space-y-2 col-span-2 shadow-sm">
            <h4 className="font-bold text-[#722f37] border-b border-[#b59449]/10 pb-1 uppercase tracking-wider text-[10px] text-center">
              Understanding Bhava Chalit
            </h4>
            <p className="text-muted-foreground text-justify leading-relaxed">
              While the D1 Lagna chart represents the placement of planets within the 30° boundaries of zodiac signs, the Bhava Chalit (House Cusp) chart maps the exact physical houses where the planets operate. When the Ascendant degree is offset, planets near the edge of a sign may shift to an adjacent house in the Bhava Chalit chart. This determines the actual dynamic results of transits and dasha activations in your daily life.
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <KundliChart
            lagnaIndex={lagnaIndex}
            planets={bhavaPlanets}
            title="Bhava Chalit Kundli Chart" language={language}
            chartStyle={data.chartStyle ?? "north"}
          />

          {/* Chart Legend */}
          <div className="mt-3 grid grid-cols-2 gap-2 max-w-[300px] w-full mx-auto print:mt-1">
            <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
              <span className="font-bold text-orange-600 text-xs leading-none">*</span>
              <span>{t("Retrograde")}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
              <span className="font-bold text-red-500 text-xs leading-none">^</span>
              <span>{t("Combust")}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
              <span className="font-bold text-emerald-600 text-xs leading-none">↑</span>
              <span>{t("Exalted")}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
              <span className="font-bold text-violet-600 text-xs leading-none">↓</span>
              <span>{t("Debilitated")}</span>
            </div>
          </div>
        </div>
      </ReportPage>

      {/* ─── PAGE 4: PLANETARY LONGITUDES ─── */}
      <ReportPage language={language} pageNumber={pNum++} sectionTitle="Bhava Table" exportMode={exportMode}>
        <SectionDivider language={language}
          title="Bhava Table"
          subtitle="House cusp boundaries showing beginning, middle, ending, and the planets active within each Bhava"
        />
        <p className="text-xs text-muted-foreground italic mb-4 text-center leading-relaxed max-w-[640px] mx-auto">
          This table refines the house-based reading of your chart. It shows the Bhava entry point, midpoint, and ending point for each house, along with the planets operating inside that Bhava according to the Bhava Chalit system.
        </p>

        <div className={cn(
          "rounded-2xl overflow-hidden border shadow-sm",
          exportMode ? "border-gray-300 bg-white" : "border-[#d7b96a]/40 bg-[#fffef9]"
        )}>
          <table className="w-full border-collapse font-serif text-[11px]">
            <thead>
              <tr className={cn(exportMode ? "bg-gray-100 text-[#722f37]" : "bg-[#f5ead0] text-[#722f37]")}>
                <th className="px-3 py-2 text-left font-bold uppercase tracking-wider border-b border-[#d7b96a]/20">Bhava</th>
                <th className="px-3 py-2 text-left font-bold uppercase tracking-wider border-b border-[#d7b96a]/20">Arambha</th>
                <th className="px-3 py-2 text-left font-bold uppercase tracking-wider border-b border-[#d7b96a]/20">Madhya</th>
                <th className="px-3 py-2 text-left font-bold uppercase tracking-wider border-b border-[#d7b96a]/20">Anthya</th>
                <th className="px-3 py-2 text-left font-bold uppercase tracking-wider border-b border-[#d7b96a]/20">Planets</th>
              </tr>
            </thead>
            <tbody>
              {bhavaTableRows.map((row, index) => (
                <tr
                  key={`bhava-row-${row.bhava}`}
                  className={cn(
                    index % 2 === 0
                      ? exportMode
                        ? "bg-white"
                        : "bg-[#fffaf0]"
                      : exportMode
                        ? "bg-gray-50"
                        : "bg-[#f9efd9]"
                  )}
                >
                  <td className="px-3 py-2 border-b border-[#d7b96a]/10 font-bold text-[#722f37]">{row.bhava}</td>
                  <td className="px-3 py-2 border-b border-[#d7b96a]/10 text-gray-700">{row.beginning}</td>
                  <td className="px-3 py-2 border-b border-[#d7b96a]/10 text-gray-700">{row.middle}</td>
                  <td className="px-3 py-2 border-b border-[#d7b96a]/10 text-gray-700">{row.ending}</td>
                  <td className="px-3 py-2 border-b border-[#d7b96a]/10 text-[#5f4b2d] font-medium">{row.planets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[11px] text-center text-muted-foreground leading-relaxed">
          Read this together with the Bhava Chalit chart to understand how your planets redistribute their practical influence across the houses of life.
        </p>
      </ReportPage>

      {exportMode ? (
        <>
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Panchanga Predictions" exportMode={exportMode}>
            <SectionDivider language={language}
              title="Panchanga Predictions"
              subtitle="Birth-day tendencies derived from weekday, Nakshatra, and Thidhi anchors"
            />

            <div className={cn(
              "rounded-2xl border p-4 mb-4 font-serif",
              exportMode ? "border-gray-300 bg-white" : "border-[#d7b96a]/40 bg-[#fffdf7] shadow-sm"
            )}>
              <p className="text-[11.5px] leading-relaxed text-justify text-gray-700">
                Om Sri. During <span className="font-semibold text-[#722f37]">{panchanga.phaseName}</span>, with the Moon in{" "}
                <span className="font-semibold text-[#722f37]">{rashiName}</span> Rashi and birth star{" "}
                <span className="font-semibold text-[#722f37]">{nakshatraName}</span>, this horoscope is marked by{" "}
                <span className="font-semibold text-[#722f37]">{panchanga.thidhiName}</span> Thidhi,{" "}
                <span className="font-semibold text-[#722f37]">{panchanga.karanaName}</span> Karana, and{" "}
                <span className="font-semibold text-[#722f37]">{panchanga.yogaName}</span> Nithya Yoga. These subtle
                calendar factors describe your instinctive temperament, spiritual inclination, and the natural patterns
                through which destiny tends to express itself.
              </p>
            </div>

            <div className="space-y-3">
              <PredictionCard language={language} title={`Weekday: ${panchanga.weekdayName}`} content={panchanga.weekdayDesc} />
              <PredictionCard language={language} title={`Birth Star: ${nakshatraName}`} content={panchanga.starDesc} />
              <PredictionCard language={language} title={`Thidhi (Lunar Day): ${panchanga.thidhiName}`} content={panchanga.thidhiDesc} />
            </div>
          </ReportPage>

          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Panchanga Predictions Continued" exportMode={exportMode}>
            <SectionDivider language={language}
              title="Panchanga Predictions (Continued)"
              subtitle="Birth-day tendencies derived from Karana and Nithya Yoga anchors"
            />
            <div className="space-y-3">
              <PredictionCard language={language} title={`Karanam: ${panchanga.karanaName}`} content={panchanga.karanaDesc} />
              <PredictionCard language={language} title={`Nithya Yoga: ${panchanga.yogaName}`} content={panchanga.yogaDesc} />
            </div>
          </ReportPage>
        </>
      ) : (
        <ReportPage language={language} pageNumber={pNum++} sectionTitle="Panchanga Predictions" exportMode={exportMode}>
          <SectionDivider language={language}
            title="Panchanga Predictions"
            subtitle="Birth-day tendencies derived from weekday, Nakshatra, Thidhi, Karana, and Nithya Yoga"
          />

          <div className={cn(
            "rounded-2xl border p-4 mb-4 font-serif",
            exportMode ? "border-gray-300 bg-white" : "border-[#d7b96a]/40 bg-[#fffdf7] shadow-sm"
          )}>
            <p className="text-[11.5px] leading-relaxed text-justify text-gray-700">
              Om Sri. During <span className="font-semibold text-[#722f37]">{panchanga.phaseName}</span>, with the Moon in{" "}
              <span className="font-semibold text-[#722f37]">{rashiName}</span> Rashi and birth star{" "}
              <span className="font-semibold text-[#722f37]">{nakshatraName}</span>, this horoscope is marked by{" "}
              <span className="font-semibold text-[#722f37]">{panchanga.thidhiName}</span> Thidhi,{" "}
              <span className="font-semibold text-[#722f37]">{panchanga.karanaName}</span> Karana, and{" "}
              <span className="font-semibold text-[#722f37]">{panchanga.yogaName}</span> Nithya Yoga. These subtle
              calendar factors describe your instinctive temperament, spiritual inclination, and the natural patterns
              through which destiny tends to express itself.
            </p>
          </div>

          <div className="space-y-3">
            <PredictionCard language={language} title={`Weekday: ${panchanga.weekdayName}`} content={panchanga.weekdayDesc} />
            <PredictionCard language={language} title={`Birth Star: ${nakshatraName}`} content={panchanga.starDesc} />
            <PredictionCard language={language} title={`Thidhi (Lunar Day): ${panchanga.thidhiName}`} content={panchanga.thidhiDesc} />
            <PredictionCard language={language} title={`Karanam: ${panchanga.karanaName}`} content={panchanga.karanaDesc} />
            <PredictionCard language={language} title={`Nithya Yoga: ${panchanga.yogaName}`} content={panchanga.yogaDesc} />
          </div>
        </ReportPage>
      )}

      {data.plan === "detailed" && (
        exportMode ? (
          houseAnalyses.map((houseAnalysis, index) => {
            const houseNumber = index + 1;
            const ordinal =
              houseNumber === 1 ? "st" : houseNumber === 2 ? "nd" : houseNumber === 3 ? "rd" : "th";
            const houseTitle = `${houseNumber}${ordinal} House: ${houseAnalysis.houseName} (${houseAnalysis.houseSignName} Sign · Lord: ${houseAnalysis.lord})`;

            return (
              <React.Fragment key={`house-export-${houseNumber}`}>
                {/* Page 1: Core Analysis */}
                <ReportPage language={language}
                  pageNumber={pNum++}
                  sectionTitle={`House ${houseNumber} Analysis`}
                  exportMode={exportMode}
                >
                  <SectionDivider language={language}
                    title={`Bhava Predictions (${houseNumber}${ordinal} House)`}
                    subtitle={`Core cosmic theme and detailed predictions for your ${houseAnalysis.houseName.toLowerCase()}`}
                  />
                  <div className="space-y-4 my-auto">
                    <PredictionCard language={language}
                      title={houseTitle}
                      content={`${houseAnalysis.coreTheme}\n\nPrediction: ${houseAnalysis.detailedAnalysis}`}
                    />
                  </div>
                </ReportPage>

                {/* Page 2: Strengths & Challenges */}
                <ReportPage language={language}
                  pageNumber={pNum++}
                  sectionTitle={`House ${houseNumber} Strengths & Challenges`}
                  exportMode={exportMode}
                >
                  <SectionDivider language={language}
                    title={`${houseNumber}${ordinal} House Energies`}
                    subtitle={`Inherent strengths, vulnerabilities, and alignment guidance`}
                  />
                  <div className="space-y-4 my-auto">
                    <PredictionCard language={language}
                      title={`${houseNumber}${ordinal} House Dynamics`}
                      content={`Key Areas of Focus: ${houseAnalysis.keyLifeAreas.join(", ")}`}
                      strengths={houseAnalysis.strengthsDescription}
                      challenges={`${houseAnalysis.vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalysis.strengthIndicator.toUpperCase()}`}
                    />
                  </div>
                </ReportPage>
              </React.Fragment>
            );
          })
        ) : (
          housePredictionPages.map((houseChunk, pageIndex) => {
            const chunkSize = 4;
            const startHouse = pageIndex * chunkSize + 1;
            const endHouse = startHouse + houseChunk.length - 1;
            const sectionLabel = formatHouseRange(startHouse, endHouse);

            return (
              <ReportPage language={language}
                key={`house-predictions-${startHouse}-${endHouse}`}
                pageNumber={pNum++}
                sectionTitle={`Bhava Predictions - ${sectionLabel}`}
                exportMode={exportMode}
              >
                <SectionDivider language={language}
                  title={`Bhava Predictions (${sectionLabel})`}
                  subtitle="Detailed house readings grouped together to keep every major life area aligned cleanly on the printed page."
                />
                <div className="space-y-4 my-auto">
                  {houseChunk.map((houseAnalysis, houseOffset) => {
                    const houseNumber = startHouse + houseOffset;
                    const ordinal =
                      houseNumber === 1 ? "st" : houseNumber === 2 ? "nd" : houseNumber === 3 ? "rd" : "th";

                    return (
                      <PredictionCard language={language}
                        key={`house-prediction-${houseNumber}`}
                        title={`${houseNumber}${ordinal} House: ${houseAnalysis.houseName} (${houseAnalysis.houseSignName} Sign · Lord: ${houseAnalysis.lord})`}
                        content={`${houseAnalysis.coreTheme}\n\nPrediction: ${houseAnalysis.detailedAnalysis}`}
                        strengths={`${houseAnalysis.strengthsDescription}\n\nKey Areas: ${houseAnalysis.keyLifeAreas.join(", ")}`}
                        challenges={`${houseAnalysis.vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalysis.strengthIndicator.toUpperCase()}`}
                      />
                    );
                  })}
                </div>
              </ReportPage>
            );
          })
        )
      )}

      {false && data.plan === "detailed" && (
        <ReportPage language={language} pageNumber={7} sectionTitle="Bhava Predictions - Houses 1 to 4" exportMode={exportMode}>
          <SectionDivider language={language}
            title="Bhava Predictions (Houses 1 to 4)"
            subtitle="The Bhavas shaping personality, wealth, skills, home life, and foundational emotional security"
          />
          <div className="space-y-4 my-auto">
            <PredictionCard language={language}
              title={`1st House: ${houseAnalyses[0].houseName} (${houseAnalyses[0].houseSignName} Sign · Lord: ${houseAnalyses[0].lord})`}
              content={`${houseAnalyses[0].coreTheme}\n\nPrediction: ${houseAnalyses[0].detailedAnalysis}`}
              strengths={`${houseAnalyses[0].strengthsDescription}\n\nKey Areas: ${houseAnalyses[0].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[0].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[0].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language}
              title={`2nd House: ${houseAnalyses[1].houseName} (${houseAnalyses[1].houseSignName} Sign · Lord: ${houseAnalyses[1].lord})`}
              content={`${houseAnalyses[1].coreTheme}\n\nPrediction: ${houseAnalyses[1].detailedAnalysis}`}
              strengths={`${houseAnalyses[1].strengthsDescription}\n\nKey Areas: ${houseAnalyses[1].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[1].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[1].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language}
              title={`3rd House: ${houseAnalyses[2].houseName} (${houseAnalyses[2].houseSignName} Sign · Lord: ${houseAnalyses[2].lord})`}
              content={`${houseAnalyses[2].coreTheme}\n\nPrediction: ${houseAnalyses[2].detailedAnalysis}`}
              strengths={`${houseAnalyses[2].strengthsDescription}\n\nKey Areas: ${houseAnalyses[2].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[2].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[2].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language}
              title={`4th House: ${houseAnalyses[3].houseName} (${houseAnalyses[3].houseSignName} Sign · Lord: ${houseAnalyses[3].lord})`}
              content={`${houseAnalyses[3].coreTheme}\n\nPrediction: ${houseAnalyses[3].detailedAnalysis}`}
              strengths={`${houseAnalyses[3].strengthsDescription}\n\nKey Areas: ${houseAnalyses[3].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[3].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[3].strengthIndicator.toUpperCase()}`}
            />
          </div>
        </ReportPage>
      )}

      {false && data.plan === "detailed" && (
        <ReportPage language={language} pageNumber={8} sectionTitle="Bhava Predictions - Houses 5 to 8" exportMode={exportMode}>
          <SectionDivider language={language}
            title="Bhava Predictions (Houses 5 to 8)"
            subtitle="The Bhavas governing intelligence, obstacles, marriage, transformation, and deeper karmic tests"
          />
          <div className="space-y-4 my-auto">
            <PredictionCard language={language}
              title={`5th House: ${houseAnalyses[4].houseName} (${houseAnalyses[4].houseSignName} Sign · Lord: ${houseAnalyses[4].lord})`}
              content={`${houseAnalyses[4].coreTheme}\n\nPrediction: ${houseAnalyses[4].detailedAnalysis}`}
              strengths={`${houseAnalyses[4].strengthsDescription}\n\nKey Areas: ${houseAnalyses[4].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[4].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[4].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language}
              title={`6th House: ${houseAnalyses[5].houseName} (${houseAnalyses[5].houseSignName} Sign · Lord: ${houseAnalyses[5].lord})`}
              content={`${houseAnalyses[5].coreTheme}\n\nPrediction: ${houseAnalyses[5].detailedAnalysis}`}
              strengths={`${houseAnalyses[5].strengthsDescription}\n\nKey Areas: ${houseAnalyses[5].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[5].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[5].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language}
              title={`7th House: ${houseAnalyses[6].houseName} (${houseAnalyses[6].houseSignName} Sign · Lord: ${houseAnalyses[6].lord})`}
              content={`${houseAnalyses[6].coreTheme}\n\nPrediction: ${houseAnalyses[6].detailedAnalysis}`}
              strengths={`${houseAnalyses[6].strengthsDescription}\n\nKey Areas: ${houseAnalyses[6].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[6].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[6].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language}
              title={`8th House: ${houseAnalyses[7].houseName} (${houseAnalyses[7].houseSignName} Sign · Lord: ${houseAnalyses[7].lord})`}
              content={`${houseAnalyses[7].coreTheme}\n\nPrediction: ${houseAnalyses[7].detailedAnalysis}`}
              strengths={`${houseAnalyses[7].strengthsDescription}\n\nKey Areas: ${houseAnalyses[7].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[7].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[7].strengthIndicator.toUpperCase()}`}
            />
          </div>
        </ReportPage>
      )}

      {false && data.plan === "detailed" && (
        <ReportPage language={language} pageNumber={9} sectionTitle="Bhava Predictions - Houses 9 to 12" exportMode={exportMode}>
          <SectionDivider language={language}
            title="Bhava Predictions (Houses 9 to 12)"
            subtitle="The Bhavas of fortune, profession, gains, and liberation-driven expenditure or retreat"
          />
          <div className="space-y-4 my-auto">
            <PredictionCard language={language}
              title={`9th House: ${houseAnalyses[8].houseName} (${houseAnalyses[8].houseSignName} Sign · Lord: ${houseAnalyses[8].lord})`}
              content={`${houseAnalyses[8].coreTheme}\n\nPrediction: ${houseAnalyses[8].detailedAnalysis}`}
              strengths={`${houseAnalyses[8].strengthsDescription}\n\nKey Areas: ${houseAnalyses[8].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[8].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[8].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language}
              title={`10th House: ${houseAnalyses[9].houseName} (${houseAnalyses[9].houseSignName} Sign · Lord: ${houseAnalyses[9].lord})`}
              content={`${houseAnalyses[9].coreTheme}\n\nPrediction: ${houseAnalyses[9].detailedAnalysis}`}
              strengths={`${houseAnalyses[9].strengthsDescription}\n\nKey Areas: ${houseAnalyses[9].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[9].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[9].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language}
              title={`11th House: ${houseAnalyses[10].houseName} (${houseAnalyses[10].houseSignName} Sign · Lord: ${houseAnalyses[10].lord})`}
              content={`${houseAnalyses[10].coreTheme}\n\nPrediction: ${houseAnalyses[10].detailedAnalysis}`}
              strengths={`${houseAnalyses[10].strengthsDescription}\n\nKey Areas: ${houseAnalyses[10].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[10].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[10].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language}
              title={`12th House: ${houseAnalyses[11].houseName} (${houseAnalyses[11].houseSignName} Sign · Lord: ${houseAnalyses[11].lord})`}
              content={`${houseAnalyses[11].coreTheme}\n\nPrediction: ${houseAnalyses[11].detailedAnalysis}`}
              strengths={`${houseAnalyses[11].strengthsDescription}\n\nKey Areas: ${houseAnalyses[11].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[11].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[11].strengthIndicator.toUpperCase()}`}
            />
          </div>
        </ReportPage>
      )}

      <ReportPage language={language} pageNumber={pNum++} sectionTitle="Planetary Positions" exportMode={exportMode}>
        <SectionDivider language={language}
          title="Planetary Coordinates & Longitudes"
          subtitle="Astronomical placements and Nirayana degrees of all major Grahas"
        />
        <p className="text-xs text-muted-foreground italic mb-2 text-center leading-relaxed">
          The positions below determine the strengths, placements, aspects, and karmic mandates of each celestial body in your horoscope chart.
        </p>
        <PlanetTable language={language} rows={planetRows} />
      </ReportPage>

      {/* ─── PAGE 5: RASHI ANALYSIS ─── */}
      {RASHI_DESCRIPTIONS[rashiName] && RASHI_ATTRIBUTES[rashiName] && (
        exportMode ? (
          <>
            <ReportPage language={language} pageNumber={pNum++} sectionTitle="Moon Sign Analysis" exportMode={exportMode}>
              <SectionDivider language={language}
                title={`Moon Sign: ${rashiName} Rashi`}
                subtitle="Your mind, emotional blueprint, and internal reactions to life's events"
              />
              <div className="space-y-3.5 my-auto">
                {/* Lunar Profile Grid */}
                <div className={cn(
                  "border border-[#d7b96a]/40 p-4 rounded-xl font-serif shadow-sm bg-[#fffef9] relative overflow-hidden"
                )}>
                  <h4 className="text-[11.5px] font-extrabold text-[#722f37] uppercase tracking-wider mb-2.5 pb-1 border-b border-[#b59449]/15 flex items-center gap-1">
                    <span>✦</span> {t("Lunar Sign Elements Profile")}
                  </h4>
                  <div className="grid grid-cols-5 gap-3 text-center text-[10.5px]">
                    <div className="flex flex-col border-r border-gray-200/60 last:border-r-0">
                      <span className="text-[#888888] text-[9px] uppercase tracking-wider mb-0.5">Sanskrit Rashi</span>
                      <span className="font-bold text-[#722f37]">{RASHI_ATTRIBUTES[rashiName].sanskritName}</span>
                    </div>
                    <div className="flex flex-col border-r border-gray-200/60 last:border-r-0">
                      <span className="text-[#888888] text-[9px] uppercase tracking-wider mb-0.5">Cosmic Lord</span>
                      <span className="font-bold text-[#722f37]">{RASHI_ATTRIBUTES[rashiName].lord} Dev</span>
                    </div>
                    <div className="flex flex-col border-r border-gray-200/60 last:border-r-0">
                      <span className="text-[#888888] text-[9px] uppercase tracking-wider mb-0.5">Element (Tattva)</span>
                      <span className="font-bold text-[#722f37]">{RASHI_ATTRIBUTES[rashiName].element}</span>
                    </div>
                    <div className="flex flex-col border-r border-gray-200/60 last:border-r-0">
                      <span className="text-[#888888] text-[9px] uppercase tracking-wider mb-0.5">Sign Modality</span>
                      <span className="font-bold text-gray-700">{RASHI_ATTRIBUTES[rashiName].modality}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#888888] text-[9px] uppercase tracking-wider mb-0.5">Cosmic Symbol</span>
                      <span className="font-bold text-[#722f37]">{RASHI_ATTRIBUTES[rashiName].symbol}</span>
                    </div>
                  </div>
                </div>

                <PredictionCard language={language}
                  title="1. Core Astrological Temperament"
                  content={RASHI_DESCRIPTIONS[rashiName].traits}
                  strengths={RASHI_DESCRIPTIONS[rashiName].strengths}
                  challenges={RASHI_DESCRIPTIONS[rashiName].challenges}
                />
                <PredictionCard language={language}
                  title="2. Career & Professional Calling"
                  content={RASHI_DESCRIPTIONS[rashiName].career}
                />
              </div>
            </ReportPage>
            <ReportPage language={language} pageNumber={pNum++} sectionTitle="Moon Sign Analysis Continued" exportMode={exportMode}>
              <SectionDivider language={language}
                title={`Moon Sign: ${rashiName} Rashi (Continued)`}
                subtitle="Emotional harmony, relationship dynamics, and Chandra mindset reflections"
              />
              <div className="space-y-3.5 my-auto">
                <PredictionCard language={language}
                  title="3. Emotional Harmony & Relationship Dynamics"
                  content={RASHI_DESCRIPTIONS[rashiName].relationship}
                />

                {/* Chandra Mindset Reflection Card */}
                <div className={cn(
                  "border rounded-xl p-4 font-serif relative overflow-hidden text-justify",
                  exportMode
                    ? "border-gray-300 bg-white"
                    : "border-[#d7b96a]/40 bg-[#fffdf5] shadow-sm"
                )}>
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#722f37]" />
                  <h4 className="font-bold text-[12px] text-[#722f37] mb-1.5 flex items-center gap-1 uppercase tracking-wider">
                    <span>✦</span> Chandra Mindset Reflection & Cosmic Mandate
                  </h4>
                  <p className="text-[11px] text-gray-700 leading-[1.6]">
                    {buildChandraMandate(rashiName)}
                  </p>
                </div>
              </div>
            </ReportPage>
          </>
        ) : (
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Moon Sign Analysis" exportMode={exportMode}>
            <SectionDivider language={language}
              title={`Moon Sign: ${rashiName} Rashi`}
              subtitle="Your mind, emotional blueprint, and internal reactions to life's events"
            />
            <div className="space-y-3.5 my-auto">
              {/* Lunar Profile Grid */}
              <div className={cn(
                "border border-[#d7b96a]/40 p-4 rounded-xl font-serif shadow-sm bg-[#fffef9] relative overflow-hidden"
              )}>
                <h4 className="text-[11.5px] font-extrabold text-[#722f37] uppercase tracking-wider mb-2.5 pb-1 border-b border-[#b59449]/15 flex items-center gap-1">
                  <span>✦</span> {t("Lunar Sign Elements Profile")}
                </h4>
                <div className="grid grid-cols-5 gap-3 text-center text-[10.5px]">
                  <div className="flex flex-col border-r border-gray-200/60 last:border-r-0">
                    <span className="text-[#888888] text-[9px] uppercase tracking-wider mb-0.5">Sanskrit Rashi</span>
                    <span className="font-bold text-[#722f37]">{RASHI_ATTRIBUTES[rashiName].sanskritName}</span>
                  </div>
                  <div className="flex flex-col border-r border-gray-200/60 last:border-r-0">
                    <span className="text-[#888888] text-[9px] uppercase tracking-wider mb-0.5">Cosmic Lord</span>
                    <span className="font-bold text-[#722f37]">{RASHI_ATTRIBUTES[rashiName].lord} Dev</span>
                  </div>
                  <div className="flex flex-col border-r border-gray-200/60 last:border-r-0">
                    <span className="text-[#888888] text-[9px] uppercase tracking-wider mb-0.5">Element (Tattva)</span>
                    <span className="font-bold text-[#722f37]">{RASHI_ATTRIBUTES[rashiName].element}</span>
                  </div>
                  <div className="flex flex-col border-r border-gray-200/60 last:border-r-0">
                    <span className="text-[#888888] text-[9px] uppercase tracking-wider mb-0.5">Sign Modality</span>
                    <span className="font-bold text-gray-700">{RASHI_ATTRIBUTES[rashiName].modality}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#888888] text-[9px] uppercase tracking-wider mb-0.5">Cosmic Symbol</span>
                    <span className="font-bold text-[#722f37]">{RASHI_ATTRIBUTES[rashiName].symbol}</span>
                  </div>
                </div>
              </div>

              <PredictionCard language={language}
                title="1. Core Astrological Temperament"
                content={RASHI_DESCRIPTIONS[rashiName].traits}
                strengths={RASHI_DESCRIPTIONS[rashiName].strengths}
                challenges={RASHI_DESCRIPTIONS[rashiName].challenges}
              />
              <PredictionCard language={language}
                title="2. Career & Professional Calling"
                content={RASHI_DESCRIPTIONS[rashiName].career}
              />
              <PredictionCard language={language}
                title="3. Emotional Harmony & Relationship Dynamics"
                content={RASHI_DESCRIPTIONS[rashiName].relationship}
              />

              {/* Chandra Mindset Reflection Card */}
              <div className={cn(
                "border rounded-xl p-4 font-serif relative overflow-hidden text-justify",
                exportMode
                  ? "border-gray-300 bg-white"
                  : "border-[#d7b96a]/40 bg-[#fffdf5] shadow-sm"
              )}>
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#722f37]" />
                <h4 className="font-bold text-[12px] text-[#722f37] mb-1.5 flex items-center gap-1 uppercase tracking-wider">
                  <span>✦</span> Chandra Mindset Reflection & Cosmic Mandate
                </h4>
                <p className="text-[11px] text-gray-700 leading-[1.6]">
                  {buildChandraMandate(rashiName)}
                </p>
              </div>
            </div>
          </ReportPage>
        )
      )}

      {/* ─── PAGE 6: NAKSHATRA ANALYSIS ─── */}
      {NAKSHATRA_DESCRIPTIONS[nakshatraName] && (
        exportMode ? (
          <>
            <ReportPage language={language} pageNumber={pNum++} sectionTitle="Nakshatra Analysis" exportMode={exportMode}>
              <SectionDivider language={language}
                title={`Vedic Birth Star: ${nakshatraName}`}
                subtitle={`The specific star constellation ruling your mind at birth · Lord: ${nakshatraLord}`}
              />
              <div className="space-y-3.5 my-auto">
                <div className="bg-[#fffef9] border border-[#b59449]/40 p-4 rounded-xl font-serif shadow-sm">
                  <h4 className="text-xs font-bold text-[#722f37] uppercase tracking-wider mb-2.5 pb-1 border-b border-[#b59449]/15 flex items-center gap-1">
                    <span>✦</span> {t("Cosmic Star Constellation Profile")}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <div className="flex justify-between border-b border-[#b59449]/10 pb-1">
                      <span className="text-[#888888]">{t("Ruling Deity:")}</span>
                      <span className="font-bold text-foreground text-right">{NAKSHATRA_DESCRIPTIONS[nakshatraName].deity}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#b59449]/10 pb-1">
                      <span className="text-[#888888]">{t("Vedic Symbolism:")}</span>
                      <span className="font-bold text-foreground text-right">{NAKSHATRA_DESCRIPTIONS[nakshatraName].meaning}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#b59449]/10 pb-1">
                      <span className="text-[#888888]">{t("Star Quarter (Pada):")}</span>
                      <span className="font-bold text-[#722f37]">{language === "kn" ? `೪ ರಲ್ಲಿ ಪಾದ ${nakshatraPada}` : `Pada ${nakshatraPada} of 4`}</span>
                    </div>
                    {NAKSHATRA_ATTRIBUTES[nakshatraName] && (
                      <>
                        <div className="flex justify-between border-b border-[#b59449]/10 pb-1">
                          <span className="text-[#888888]">{t("Gana (Temperament:")}</span>
                          <span className="font-bold text-[#722f37]">{NAKSHATRA_ATTRIBUTES[nakshatraName].Gana}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#b59449]/10 pb-1">
                          <span className="text-[#888888]">{t("Animal Yoni:")}</span>
                          <span className="font-bold text-foreground">{NAKSHATRA_ATTRIBUTES[nakshatraName].Yoni}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#b59449]/10 pb-1">
                          <span className="text-[#888888]">{t("Direction of Power:")}</span>
                          <span className="font-bold text-foreground">{NAKSHATRA_ATTRIBUTES[nakshatraName].Direction}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <PredictionCard language={language}
                  title="Deep Character & Spiritual Traits"
                  content={NAKSHATRA_DESCRIPTIONS[nakshatraName].personality}
                />
              </div>
            </ReportPage>
            <ReportPage language={language} pageNumber={pNum++} sectionTitle="Nakshatra Analysis Continued" exportMode={exportMode}>
              <SectionDivider language={language}
                title={`Vedic Birth Star: ${nakshatraName} (Continued)`}
                subtitle={`Mantra disciplines, remedies, and subconscious mandate for ${nakshatraName}`}
              />
              <div className="space-y-3.5 my-auto">
                <RemedyBox language={language}
                  remedyType="Star Constellation Remedy & Worship"
                  description={NAKSHATRA_DESCRIPTIONS[nakshatraName].remedy}
                />

                {NAKSHATRA_ATTRIBUTES[nakshatraName] && (
                  <div className={cn(
                    "border rounded-xl p-4 font-serif relative overflow-hidden text-justify",
                    exportMode
                      ? "border-gray-300 bg-white"
                      : "border-[#d7b96a]/40 bg-[#fffdf5] shadow-sm"
                  )}>
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#722f37]" />
                    <h4 className="font-bold text-[12px] text-[#722f37] mb-1.5 flex items-center gap-1 uppercase tracking-wider">
                      <span>✦</span> Subconscious Star Mandate & Soul Direction
                    </h4>
                    <p className="text-[11px] text-gray-700 leading-[1.6]">
                      Your subconscious temperament is aligned with the <span className="font-semibold text-[#722f37]">{NAKSHATRA_ATTRIBUTES[nakshatraName].Gana} Gana</span>, which carries the qualities of being <span className="italic">{NAKSHATRA_ATTRIBUTES[nakshatraName].GanaMeaning}</span>. Operating from the <span className="font-semibold">{NAKSHATRA_ATTRIBUTES[nakshatraName].Direction}</span> direction of power, your focus is supported by the medicine of the <span className="font-semibold">{NAKSHATRA_ATTRIBUTES[nakshatraName].Yoni} Yoni</span>, representing your natural animal affinity and instinctual strength. Meditating on your birth star during the designated planetary hours activates this star system, creating a highly protective aura around you.
                    </p>
                  </div>
                )}
              </div>
            </ReportPage>
          </>
        ) : (
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Nakshatra Analysis" exportMode={exportMode}>
            <SectionDivider language={language}
              title={`Vedic Birth Star: ${nakshatraName}`}
              subtitle={`The specific star constellation ruling your mind at birth · Lord: ${nakshatraLord}`}
            />
            <div className="space-y-3.5 my-auto">
              {/* Expanded Constellation Profile */}
              <div className="bg-[#fffef9] border border-[#b59449]/40 p-4 rounded-xl font-serif shadow-sm">
                <h4 className="text-xs font-bold text-[#722f37] uppercase tracking-wider mb-2.5 pb-1 border-b border-[#b59449]/15 flex items-center gap-1">
                  <span>✦</span> {t("Cosmic Star Constellation Profile")}
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex justify-between border-b border-[#b59449]/10 pb-1">
                    <span className="text-[#888888]">{t("Ruling Deity:")}</span>
                    <span className="font-bold text-foreground text-right">{NAKSHATRA_DESCRIPTIONS[nakshatraName].deity}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#b59449]/10 pb-1">
                    <span className="text-[#888888]">{t("Vedic Symbolism:")}</span>
                    <span className="font-bold text-foreground text-right">{NAKSHATRA_DESCRIPTIONS[nakshatraName].meaning}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#b59449]/10 pb-1">
                    <span className="text-[#888888]">{t("Star Quarter (Pada):")}</span>
                    <span className="font-bold text-[#722f37]">{language === "kn" ? `೪ ರಲ್ಲಿ ಪಾದ ${nakshatraPada}` : `Pada ${nakshatraPada} of 4`}</span>
                  </div>
                  {NAKSHATRA_ATTRIBUTES[nakshatraName] && (
                    <>
                      <div className="flex justify-between border-b border-[#b59449]/10 pb-1">
                        <span className="text-[#888888]">{t("Gana (Temperament:")}</span>
                        <span className="font-bold text-[#722f37]">{NAKSHATRA_ATTRIBUTES[nakshatraName].Gana}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#b59449]/10 pb-1">
                        <span className="text-[#888888]">{t("Animal Yoni:")}</span>
                        <span className="font-bold text-foreground">{NAKSHATRA_ATTRIBUTES[nakshatraName].Yoni}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#b59449]/10 pb-1">
                        <span className="text-[#888888]">{t("Direction of Power:")}</span>
                        <span className="font-bold text-foreground">{NAKSHATRA_ATTRIBUTES[nakshatraName].Direction}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <PredictionCard language={language}
                title="Deep Character & Spiritual Traits"
                content={NAKSHATRA_DESCRIPTIONS[nakshatraName].personality}
              />

              <RemedyBox language={language}
                remedyType="Stellar Protection Remedy"
                description={NAKSHATRA_DESCRIPTIONS[nakshatraName].remedy}
              />

              {/* Stellar Symbolism Mandate Card */}
              {NAKSHATRA_ATTRIBUTES[nakshatraName] && (
                <div className={cn(
                  "border rounded-xl p-4 font-serif relative overflow-hidden text-justify",
                  exportMode
                    ? "border-gray-300 bg-white"
                    : "border-[#d7b96a]/40 bg-[#fffdf5] shadow-sm"
                )}>
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#722f37]" />
                  <h4 className="font-bold text-[12px] text-[#722f37] mb-1.5 flex items-center gap-1 uppercase tracking-wider">
                    <span>✦</span> Subconscious Star Mandate & Soul Direction
                  </h4>
                  <p className="text-[11px] text-gray-700 leading-[1.6]">
                    Your subconscious temperament is aligned with the <span className="font-semibold text-[#722f37]">{NAKSHATRA_ATTRIBUTES[nakshatraName].Gana} Gana</span>, which carries the qualities of being <span className="italic">{NAKSHATRA_ATTRIBUTES[nakshatraName].GanaMeaning}</span>. Operating from the <span className="font-semibold">{NAKSHATRA_ATTRIBUTES[nakshatraName].Direction}</span> direction of power, your focus is supported by the medicine of the <span className="font-semibold">{NAKSHATRA_ATTRIBUTES[nakshatraName].Yoni} Yoni</span>, representing your natural animal affinity and instinctual strength. Meditating on your birth star during the designated planetary hours activates this star system, creating a highly protective aura around you.
                  </p>
                </div>
              )}
            </div>
          </ReportPage>
        )
      )}

      {/* ─── PAGE 7: D9 NAVAMSA & LAGNA ANALYSIS ─── */}
      {false && (
      <ReportPage language={language} pageNumber={pNum++} sectionTitle="D9 Navamsa Chart" exportMode={exportMode}>
        <SectionDivider language={language}
          title="Divisional Navamsa Chart (D9)"
          subtitle="The chart of the soul, inner potential, and marriage/harmonious path"
        />

        <div className="grid grid-cols-2 gap-4 items-center">
          <div>
            <PredictionCard language={language}
              title="Ascendant Lagna Personality Analysis"
              content={`Your Lagna Ascendant is ${lagnaName}. This represents the dynamic physical body, early environments, and how you approach challenges in your primary paths. It anchors your personality and determines which house planetary systems activate throughout your life transits.`}
            />
            <p className="text-xs leading-relaxed text-muted-foreground mt-2 text-justify">
              The Navamsa (D9) divisional chart details the spiritual core of your planetary systems. While D1 shows physical realities, D9 shows the spiritual potential and second-half of life.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <KundliChart
              lagnaIndex={navamsaIndex}
              planets={navamsaPlanets}
              title="D9 Navamsa Chart"
              chartStyle={data.chartStyle ?? "north"}
            />

            {/* Chart Legend */}
            <div className="mt-3 grid grid-cols-2 gap-2 max-w-[300px] w-full mx-auto print:mt-1">
              <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
                <span className="font-bold text-orange-600 text-xs leading-none">*</span>
                <span>{t("Retrograde")}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
                <span className="font-bold text-red-500 text-xs leading-none">^</span>
                <span>{t("Combust")}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
                <span className="font-bold text-emerald-600 text-xs leading-none">↑</span>
                <span>{t("Exalted")}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 bg-white/60 border border-[#b59449]/15 px-2 py-1 rounded-lg text-[10px] text-[#6d5530] font-serif shadow-sm">
                <span className="font-bold text-violet-600 text-xs leading-none">↓</span>
                <span>{t("Debilitated")}</span>
              </div>
            </div>
          </div>
        </div>
      </ReportPage>
      )}

      {/* ─── PAGE 8: 12 HOUSES OF LIFE PART 1 (DETAILED ONLY) ─── */}
      {false && data.plan === "detailed" && (
        <ReportPage language={language} pageNumber={pNum++} sectionTitle="12 Houses - Self & Family" exportMode={exportMode}>
          <SectionDivider language={language}
            title="The Twelve Houses of Life (Houses 1-4)"
            subtitle="The Bhavas dictating physical body, wealth accumulation, skills, and comfort"
          />
          <div className="space-y-4 my-auto">
            <PredictionCard language={language} 
              title={`1st House: ${houseAnalyses[0].houseName} (${houseAnalyses[0].houseSignName} Sign · Lord: ${houseAnalyses[0].lord})`} 
              content={`${houseAnalyses[0].coreTheme}\n\nPrediction: ${houseAnalyses[0].detailedAnalysis}`}
              strengths={`${houseAnalyses[0].strengthsDescription}\n\nKey Areas: ${houseAnalyses[0].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[0].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[0].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language} 
              title={`2nd House: ${houseAnalyses[1].houseName} (${houseAnalyses[1].houseSignName} Sign · Lord: ${houseAnalyses[1].lord})`} 
              content={`${houseAnalyses[1].coreTheme}\n\nPrediction: ${houseAnalyses[1].detailedAnalysis}`}
              strengths={`${houseAnalyses[1].strengthsDescription}\n\nKey Areas: ${houseAnalyses[1].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[1].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[1].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language} 
              title={`3rd House: ${houseAnalyses[2].houseName} (${houseAnalyses[2].houseSignName} Sign · Lord: ${houseAnalyses[2].lord})`} 
              content={`${houseAnalyses[2].coreTheme}\n\nPrediction: ${houseAnalyses[2].detailedAnalysis}`}
              strengths={`${houseAnalyses[2].strengthsDescription}\n\nKey Areas: ${houseAnalyses[2].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[2].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[2].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language} 
              title={`4th House: ${houseAnalyses[3].houseName} (${houseAnalyses[3].houseSignName} Sign · Lord: ${houseAnalyses[3].lord})`} 
              content={`${houseAnalyses[3].coreTheme}\n\nPrediction: ${houseAnalyses[3].detailedAnalysis}`}
              strengths={`${houseAnalyses[3].strengthsDescription}\n\nKey Areas: ${houseAnalyses[3].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[3].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[3].strengthIndicator.toUpperCase()}`}
            />
          </div>
        </ReportPage>
      )}

      {/* ─── PAGE 9: 12 HOUSES OF LIFE PART 2 (DETAILED ONLY) ─── */}
      {false && data.plan === "detailed" && (
        <ReportPage language={language} pageNumber={9} sectionTitle="12 Houses - Joy & Health" exportMode={exportMode}>
          <SectionDivider language={language}
            title="The Twelve Houses of Life (Houses 5-8)"
            subtitle="The Bhavas governing intelligence, daily works, marriage, and deep mysteries"
          />
          <div className="space-y-4 my-auto">
            <PredictionCard language={language} 
              title={`5th House: ${houseAnalyses[4].houseName} (${houseAnalyses[4].houseSignName} Sign · Lord: ${houseAnalyses[4].lord})`} 
              content={`${houseAnalyses[4].coreTheme}\n\nPrediction: ${houseAnalyses[4].detailedAnalysis}`}
              strengths={`${houseAnalyses[4].strengthsDescription}\n\nKey Areas: ${houseAnalyses[4].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[4].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[4].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language} 
              title={`6th House: ${houseAnalyses[5].houseName} (${houseAnalyses[5].houseSignName} Sign · Lord: ${houseAnalyses[5].lord})`} 
              content={`${houseAnalyses[5].coreTheme}\n\nPrediction: ${houseAnalyses[5].detailedAnalysis}`}
              strengths={`${houseAnalyses[5].strengthsDescription}\n\nKey Areas: ${houseAnalyses[5].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[5].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[5].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language} 
              title={`7th House: ${houseAnalyses[6].houseName} (${houseAnalyses[6].houseSignName} Sign · Lord: ${houseAnalyses[6].lord})`} 
              content={`${houseAnalyses[6].coreTheme}\n\nPrediction: ${houseAnalyses[6].detailedAnalysis}`}
              strengths={`${houseAnalyses[6].strengthsDescription}\n\nKey Areas: ${houseAnalyses[6].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[6].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[6].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language} 
              title={`8th House: ${houseAnalyses[7].houseName} (${houseAnalyses[7].houseSignName} Sign · Lord: ${houseAnalyses[7].lord})`} 
              content={`${houseAnalyses[7].coreTheme}\n\nPrediction: ${houseAnalyses[7].detailedAnalysis}`}
              strengths={`${houseAnalyses[7].strengthsDescription}\n\nKey Areas: ${houseAnalyses[7].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[7].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[7].strengthIndicator.toUpperCase()}`}
            />
          </div>
        </ReportPage>
      )}

      {/* ─── PAGE 10: 12 HOUSES OF LIFE PART 3 (DETAILED ONLY) ─── */}
      {false && data.plan === "detailed" && (
        <ReportPage language={language} pageNumber={10} sectionTitle="12 Houses - Grace & Gains" exportMode={exportMode}>
          <SectionDivider language={language}
            title="The Twelve Houses of Life (Houses 9-12)"
            subtitle="The Bhavas dictating fortune, public status, desire fulfillment, and liberation"
          />
          <div className="space-y-4 my-auto">
            <PredictionCard language={language} 
              title={`9th House: ${houseAnalyses[8].houseName} (${houseAnalyses[8].houseSignName} Sign · Lord: ${houseAnalyses[8].lord})`} 
              content={`${houseAnalyses[8].coreTheme}\n\nPrediction: ${houseAnalyses[8].detailedAnalysis}`}
              strengths={`${houseAnalyses[8].strengthsDescription}\n\nKey Areas: ${houseAnalyses[8].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[8].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[8].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language} 
              title={`10th House: ${houseAnalyses[9].houseName} (${houseAnalyses[9].houseSignName} Sign · Lord: ${houseAnalyses[9].lord})`} 
              content={`${houseAnalyses[9].coreTheme}\n\nPrediction: ${houseAnalyses[9].detailedAnalysis}`}
              strengths={`${houseAnalyses[9].strengthsDescription}\n\nKey Areas: ${houseAnalyses[9].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[9].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[9].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language} 
              title={`11th House: ${houseAnalyses[10].houseName} (${houseAnalyses[10].houseSignName} Sign · Lord: ${houseAnalyses[10].lord})`} 
              content={`${houseAnalyses[10].coreTheme}\n\nPrediction: ${houseAnalyses[10].detailedAnalysis}`}
              strengths={`${houseAnalyses[10].strengthsDescription}\n\nKey Areas: ${houseAnalyses[10].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[10].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[10].strengthIndicator.toUpperCase()}`}
            />
            <PredictionCard language={language} 
              title={`12th House: ${houseAnalyses[11].houseName} (${houseAnalyses[11].houseSignName} Sign · Lord: ${houseAnalyses[11].lord})`} 
              content={`${houseAnalyses[11].coreTheme}\n\nPrediction: ${houseAnalyses[11].detailedAnalysis}`}
              strengths={`${houseAnalyses[11].strengthsDescription}\n\nKey Areas: ${houseAnalyses[11].keyLifeAreas.join(", ")}`}
              challenges={`${houseAnalyses[11].vulnerabilitiesDescription}\n\nAlignment Strength: ${houseAnalyses[11].strengthIndicator.toUpperCase()}`}
            />
          </div>
        </ReportPage>
      )}

      {/* ─── PAGE 11: VIMSHOTTARI DASHA TIMELINE ─── */}
      <ReportPage language={language} pageNumber={pNum++} sectionTitle="Vimshottari Dasha" exportMode={exportMode}>
        <SectionDivider language={language}
          title="Vimshottari Mahadasha Timeline"
          subtitle="Sacred Vedic lifetime timeline dictating planetary lords activation sequences"
        />
        <p className="text-[13.5px] leading-relaxed text-muted-foreground text-center italic mb-4 max-w-[600px] mx-auto">
          Vimshottari Dasha is the most widely trusted predictive timeline system in Vedic astrology. Ranging over a 120-year cycle, it calculates exactly when each planetary lord governs the primary focus and energetic trends of your life.
        </p>
        <DashaTimeline language={language} periods={dashaPeriods} />
      </ReportPage>

      {exportMode ? (
        <>
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Mahadasha Deep-Dive" exportMode={exportMode}>
            <SectionDivider language={language}
              title="Active Mahadasha Deep-Dive Analysis"
              subtitle={`Detailed predictions and cosmic trends for your current planetary cycle`}
            />
            <div className="space-y-4 my-auto">
              {dashaAnalysis ? (
                <PredictionCard language={language}
                  title={`Mahadasha Period Analysis`}
                  content={dashaAnalysis.currentMahadashaPrediction}
                />
              ) : (
                currentMaha && DASHA_PREDICTIONS[currentMaha] && (
                  <PredictionCard language={language}
                    title={`Active Mahadasha: ${currentMaha} Lord`}
                    content={DASHA_PREDICTIONS[currentMaha].general}
                  />
                )
              )}
            </div>
          </ReportPage>
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Mahadasha Deep-Dive Continued" exportMode={exportMode}>
            <SectionDivider language={language}
              title="Active Mahadasha Alignment & Remedies"
              subtitle={`Practical directives and timing windows to optimize your current planetary cycle`}
            />
            <div className="space-y-4 my-auto">
              {dashaAnalysis ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2">Optimal Opportunity Window</h4>
                      <p className="text-xs text-emerald-900 leading-relaxed">{dashaAnalysis.bestPeriodInMaha}</p>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-2">Cautionary Phase Advisory</h4>
                      <p className="text-xs text-amber-900 leading-relaxed">{dashaAnalysis.cautionPeriodInMaha}</p>
                    </div>
                  </div>
                  <RemedyBox language={language}
                    remedyType="Mahadasha Alignment Directive"
                    description={`As you are traversing the path of this planetary cycle, anchoring this planet's energy is vital. Focus on spiritual alignment, consistent discipline, and the specific remedies outlined in the final sections of this report to unlock the highest potential of this period.`}
                  />
                </>
              ) : (
                currentMaha && DASHA_PREDICTIONS[currentMaha] && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2">Inherent Strengths & Opportunities</h4>
                        <p className="text-xs text-emerald-900 leading-relaxed">{DASHA_PREDICTIONS[currentMaha].opportunities}</p>
                      </div>
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-2">Vulnerabilities & Cautions</h4>
                        <p className="text-xs text-amber-900 leading-relaxed">{DASHA_PREDICTIONS[currentMaha].cautions}</p>
                      </div>
                    </div>
                    <RemedyBox language={language}
                      remedyType="Mahadasha Alignment Directive"
                      description={`As you are traversing the path of ${currentMaha}'s cycle, anchoring this planet's energy is vital. Perform Saturday charities, chant his personal mantra daily, and wear colors aligning with this Graha to unlock fortune.`}
                    />
                  </>
                )
              )}
            </div>
          </ReportPage>
        </>
      ) : (
        <ReportPage language={language} pageNumber={pNum++} sectionTitle="Mahadasha Deep-Dive" exportMode={exportMode}>
          <SectionDivider language={language}
            title="Active Mahadasha Deep-Dive Analysis"
            subtitle={`Detailed predictions and cosmic trends for your current planetary cycle`}
          />
          {dashaAnalysis ? (
            <div className="space-y-4 my-auto">
              <PredictionCard language={language}
                title={`Mahadasha Period Analysis`}
                content={dashaAnalysis.currentMahadashaPrediction}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2">Optimal Opportunity Window</h4>
                  <p className="text-xs text-emerald-900 leading-relaxed">{dashaAnalysis.bestPeriodInMaha}</p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-2">Cautionary Phase Advisory</h4>
                  <p className="text-xs text-amber-900 leading-relaxed">{dashaAnalysis.cautionPeriodInMaha}</p>
                </div>
              </div>

              <RemedyBox language={language}
                remedyType="Mahadasha Alignment Directive"
                description={`As you are traversing the path of this planetary cycle, anchoring this planet's energy is vital. Focus on spiritual alignment, consistent discipline, and the specific remedies outlined in the final sections of this report to unlock the highest potential of this period.`}
              />
            </div>
          ) : (
            currentMaha && DASHA_PREDICTIONS[currentMaha] && (
              <div className="space-y-4 my-auto">
                <PredictionCard language={language}
                  title={`Active Mahadasha: ${currentMaha} Lord`}
                  content={DASHA_PREDICTIONS[currentMaha].general}
                  strengths={DASHA_PREDICTIONS[currentMaha].opportunities}
                  challenges={DASHA_PREDICTIONS[currentMaha].cautions}
                />
                
                <RemedyBox language={language}
                  remedyType="Mahadasha Alignment Directive"
                  description={`As you are traversing the path of ${currentMaha}'s cycle, anchoring this planet's energy is vital. Perform Saturday charities, chant his personal mantra daily, and wear colors aligning with this Graha to unlock fortune.`}
                />
              </div>
            )
          )}
        </ReportPage>
      )}

      {/* ─── NEW PAGE: FAVOURABLE PERIODS PART 1 (CAREER & BUSINESS) ─── */}
      <ReportPage language={language}
        pageNumber={pNum++}
        sectionTitle="Favourable Periods"
        exportMode={exportMode}
      >
        <SectionDivider language={language}
          title="Favourable Periods for Career & Business"
          subtitle="Dynamic Dasha & Apahara timelines indicating peak opportunities and professional growth"
        />

        <div className="space-y-4 my-auto">
          {/* Career Table */}
          <div className="bg-white p-3 rounded-xl border border-[#b59449]/20 shadow-sm">
            <h4 className="font-bold text-[#722f37] text-xs uppercase tracking-wider mb-1 flex items-center justify-between border-b border-[#b59449]/10 pb-1">
              <span>💼 Career & Professional Growth</span>
              <span className="text-[9px] text-[#888888] font-normal font-sans">Ages 15 to 60</span>
            </h4>
            <p className="text-[10px] text-muted-foreground italic mb-2 leading-relaxed text-justify">
              Considering the lagna lord, tenth lord, benefic planets in lagna and tenth house, aspect of Jupiter on lagna and tenth house, and other key celestial factors.
            </p>
            <div className="overflow-hidden border border-gray-100 rounded-lg">
              <table className="w-full text-[10.5px] text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                    <th className="px-2.5 py-1">Dasa</th>
                    <th className="px-2.5 py-1">Apahara</th>
                    <th className="px-2.5 py-1">Period Start</th>
                    <th className="px-2.5 py-1">Period End</th>
                    <th className="px-2.5 py-1 text-right">Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {favourableCareerPeriods.length > 0 ? (
                    favourableCareerPeriods.map((p, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-2.5 py-1 font-bold text-[#722f37]">{p.dasa}</td>
                        <td className="px-2.5 py-1 font-medium">{p.apahara}</td>
                        <td className="px-2.5 py-1 font-mono text-[9.5px]">{p.start.toLocaleDateString("en-IN")}</td>
                        <td className="px-2.5 py-1 font-mono text-[9.5px]">{p.end.toLocaleDateString("en-IN")}</td>
                        <td className={cn("px-2.5 py-1 text-right font-bold text-[10px]", p.analysis === "Excellent" ? "text-blue-600" : "text-[#722f37]")}>
                          {p.analysis}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-2.5 py-2 text-center text-muted-foreground italic text-[10px]">
                        No major favourable career periods detected in this age range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Business Table */}
          <div className="bg-white p-3 rounded-xl border border-[#b59449]/20 shadow-sm">
            <h4 className="font-bold text-[#722f37] text-xs uppercase tracking-wider mb-1 flex items-center justify-between border-b border-[#b59449]/10 pb-1">
              <span>📈 Business Expansion & Trade</span>
              <span className="text-[9px] text-[#888888] font-normal font-sans">Ages 15 to 60</span>
            </h4>
            <p className="text-[10px] text-muted-foreground italic mb-2 leading-relaxed text-justify">
              Considering the second, sixth, tenth, and eleventh lords, aspect of Jupiter on lagna and eleventh house, and other commercial indicators.
            </p>
            <div className="overflow-hidden border border-gray-100 rounded-lg">
              <table className="w-full text-[10.5px] text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                    <th className="px-2.5 py-1">Dasa</th>
                    <th className="px-2.5 py-1">Apahara</th>
                    <th className="px-2.5 py-1">Period Start</th>
                    <th className="px-2.5 py-1">Period End</th>
                    <th className="px-2.5 py-1 text-right">Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {favourableBusinessPeriods.length > 0 ? (
                    favourableBusinessPeriods.map((p, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-2.5 py-1 font-bold text-[#722f37]">{p.dasa}</td>
                        <td className="px-2.5 py-1 font-medium">{p.apahara}</td>
                        <td className="px-2.5 py-1 font-mono text-[9.5px]">{p.start.toLocaleDateString("en-IN")}</td>
                        <td className="px-2.5 py-1 font-mono text-[9.5px]">{p.end.toLocaleDateString("en-IN")}</td>
                        <td className={cn("px-2.5 py-1 text-right font-bold text-[10px]", p.analysis === "Excellent" ? "text-blue-600" : "text-[#722f37]")}>
                          {p.analysis}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-2.5 py-2 text-center text-muted-foreground italic text-[10px]">
                        No major favourable business periods detected in this age range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ReportPage>

      {/* ─── NEW PAGE: FAVOURABLE PERIODS PART 2 (MARRIAGE & HOUSE CONSTRUCTION) ─── */}
      <ReportPage language={language}
        pageNumber={pNum++}
        sectionTitle="Favourable Periods"
        exportMode={exportMode}
      >
        <SectionDivider language={language}
          title="Favourable Periods for Marriage & House Construction"
          subtitle="Sacred Vedic timings determining relationship union and real estate manifestation"
        />

        <div className="space-y-4 my-auto">
          {/* Marriage Table */}
          <div className="bg-white p-3 rounded-xl border border-[#b59449]/20 shadow-sm">
            <h4 className="font-bold text-[#722f37] text-xs uppercase tracking-wider mb-1 flex items-center justify-between border-b border-[#b59449]/10 pb-1">
              <span>💖 Marriage & Conjugal Harmony</span>
              <span className="text-[9px] text-[#888888] font-normal font-sans">Ages 18 to 50</span>
            </h4>
            <p className="text-[10px] text-muted-foreground italic mb-2 leading-relaxed text-justify">
              Considering the seventh lord, planets in the seventh house, Venus (natural significator), Rahu, Moon, and protective aspects of Jupiter.
            </p>
            <div className="overflow-hidden border border-gray-100 rounded-lg">
              <table className="w-full text-[10.5px] text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                    <th className="px-2.5 py-1">Dasa</th>
                    <th className="px-2.5 py-1">Apahara</th>
                    <th className="px-2.5 py-1">Period Start</th>
                    <th className="px-2.5 py-1">Period End</th>
                    <th className="px-2.5 py-1 text-right">Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {favourableMarriagePeriods.length > 0 ? (
                    favourableMarriagePeriods.map((p, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-2.5 py-1 font-bold text-[#722f37]">{p.dasa}</td>
                        <td className="px-2.5 py-1 font-medium">{p.apahara}</td>
                        <td className="px-2.5 py-1 font-mono text-[9.5px]">{p.start.toLocaleDateString("en-IN")}</td>
                        <td className="px-2.5 py-1 font-mono text-[9.5px]">{p.end.toLocaleDateString("en-IN")}</td>
                        <td className={cn("px-2.5 py-1 text-right font-bold text-[10px]", p.analysis === "Excellent" ? "text-blue-600" : "text-[#722f37]")}>
                          {p.analysis}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-2.5 py-2 text-center text-muted-foreground italic text-[10px]">
                        No major favourable marriage periods detected in this age range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* House Construction Table */}
          <div className="bg-white p-3 rounded-xl border border-[#b59449]/20 shadow-sm">
            <h4 className="font-bold text-[#722f37] text-xs uppercase tracking-wider mb-1 flex items-center justify-between border-b border-[#b59449]/10 pb-1">
              <span>🏡 House Construction & Real Estate</span>
              <span className="text-[9px] text-[#888888] font-normal font-sans">Ages 15 to 50</span>
            </h4>
            <p className="text-[10px] text-muted-foreground italic mb-2 leading-relaxed text-justify">
              Considering the fourth lord, Mars (significator of land), benefic planets in or aspecting the fourth house, and Saturn's structure.
            </p>
            <div className="overflow-hidden border border-gray-100 rounded-lg">
              <table className="w-full text-[10.5px] text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                    <th className="px-2.5 py-1">Dasa</th>
                    <th className="px-2.5 py-1">Apahara</th>
                    <th className="px-2.5 py-1">Period Start</th>
                    <th className="px-2.5 py-1">Period End</th>
                    <th className="px-2.5 py-1 text-right">Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {favourableHousePeriods.length > 0 ? (
                    favourableHousePeriods.map((p, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-2.5 py-1 font-bold text-[#722f37]">{p.dasa}</td>
                        <td className="px-2.5 py-1 font-medium">{p.apahara}</td>
                        <td className="px-2.5 py-1 font-mono text-[9.5px]">{p.start.toLocaleDateString("en-IN")}</td>
                        <td className="px-2.5 py-1 font-mono text-[9.5px]">{p.end.toLocaleDateString("en-IN")}</td>
                        <td className={cn("px-2.5 py-1 text-right font-bold text-[10px]", p.analysis === "Excellent" ? "text-blue-600" : "text-[#722f37]")}>
                          {p.analysis}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-2.5 py-2 text-center text-muted-foreground italic text-[10px]">
                        No major favourable house construction periods detected in this age range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ReportPage>

      {/* ─── PAGE 13: ACTIVE ANTARDASHA SUB-PERIOD (DETAILED ONLY) ─── */}
      {data.plan === "detailed" && dashaAnalysis && (
        exportMode ? (
          <>
            <ReportPage language={language} pageNumber={pNum++} sectionTitle="Antardasha Analysis" exportMode={exportMode}>
              <SectionDivider language={language}
                title="Active Antardasha Sub-Period Analysis"
                subtitle="The precise planetary lens currently focusing your immediate life experiences"
              />
              <div className="space-y-4 my-auto">
                <PredictionCard language={language}
                  title="Current Sub-Period Deep-Dive"
                  content={dashaAnalysis.currentAntardashaPrediction}
                />
              </div>
            </ReportPage>
            <ReportPage language={language} pageNumber={pNum++} sectionTitle="Antardasha Analysis Continued" exportMode={exportMode}>
              <SectionDivider language={language}
                title="Pratyantardasha Sub-Sub Period influence"
                subtitle="Precise micro-timing of planetary activations in your daily experience"
              />
              <div className="space-y-4 my-auto">
                <div className="bg-[#fffef9] border-2 border-[#b59449]/20 p-5 rounded-2xl shadow-sm">
                  <h4 className="text-xs font-bold text-[#722f37] uppercase tracking-widest mb-3 text-center border-b border-[#b59449]/10 pb-2">
                    Pratyantardasha (Sub-Sub Period) Influence
                  </h4>
                  <p className="text-[13px] text-gray-700 leading-relaxed text-center italic">
                    {dashaAnalysis.currentPratyantarPrediction}
                  </p>
                </div>

                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  While the Mahadasha sets the grand theme of the decade, the Antardasha provides the seasonal flavor, and the Pratyantardasha triggers the specific daily events and internal shifts you are currently feeling.
                </p>
              </div>
            </ReportPage>
          </>
        ) : (
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Antardasha Analysis" exportMode={exportMode}>
            <SectionDivider language={language}
              title="Active Antardasha Sub-Period Analysis"
              subtitle="The precise planetary lens currently focusing your immediate life experiences"
            />
            <div className="space-y-4 my-auto">
              <PredictionCard language={language}
                title="Current Sub-Period Deep-Dive"
                content={dashaAnalysis.currentAntardashaPrediction}
              />
              
              <div className="bg-[#fffef9] border-2 border-[#b59449]/20 p-5 rounded-2xl shadow-sm">
                <h4 className="text-xs font-bold text-[#722f37] uppercase tracking-widest mb-3 text-center border-b border-[#b59449]/10 pb-2">
                  Pratyantardasha (Sub-Sub Period) Influence
                </h4>
                <p className="text-[13px] text-gray-700 leading-relaxed text-center italic">
                  {dashaAnalysis.currentPratyantarPrediction}
                </p>
              </div>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                While the Mahadasha sets the grand theme of the decade, the Antardasha provides the seasonal flavor, and the Pratyantardasha triggers the specific daily events and internal shifts you are currently feeling.
              </p>
            </div>
          </ReportPage>
        )
      )}

      {/* ─── PAGE 14: UPCOMING SUB-PERIODS FORECAST (DETAILED ONLY) ─── */}
      {data.plan === "detailed" && dashaAnalysis && exportMode && upcomingForecastPages.map((upcomingChunk, pageIndex) => (
        <ReportPage language={language}
          key={`upcoming-forecast-${pageIndex}`}
          pageNumber={pNum++}
          sectionTitle="Upcoming Forecast"
          exportMode={exportMode}
        >
          <SectionDivider language={language}
            title={pageIndex === 0 ? "Upcoming Sub-Period Chronology" : "Continuing Upcoming Sub-Period Chronology"}
            subtitle="Strategic roadmap of planetary sub-influences for the next few years"
          />
          <div className="space-y-3">
            {upcomingChunk.map((antar, i) => (
              <div key={`${antar.antarLord}-${antar.startDate.toISOString()}-${i}`} className="border border-[#b59449]/20 bg-white p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-[#722f37] text-sm">{antar.antarLord} Sub-Period</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{antar.theme}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold bg-[#b59449]/10 text-[#722f37] px-2 py-1 rounded">
                      {antar.startDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })} - {antar.endDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  {antar.detailedPrediction}
                </p>
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                    <span className="font-bold text-emerald-800 block mb-0.5">Key Opportunity</span>
                    <span className="text-emerald-700">{antar.bestOpportunity}</span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded border border-amber-100">
                    <span className="font-bold text-amber-800 block mb-0.5">Primary Caution</span>
                    <span className="text-amber-700">{antar.caution}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ReportPage>
      ))}

      {data.plan === "detailed" && dashaAnalysis && !exportMode && (
        <ReportPage language={language} pageNumber={pNum++} sectionTitle="Upcoming Forecast" exportMode={exportMode}>
          <SectionDivider language={language}
            title="Upcoming Sub-Period Chronology"
            subtitle="Strategic roadmap of planetary sub-influences for the next few years"
          />
          <div className="space-y-3">
            {dashaAnalysis.upcomingAntardashas.slice(0, 5).map((antar, i) => (
              <div key={i} className="border border-[#b59449]/20 bg-white p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-[#722f37] text-sm">{antar.antarLord} Sub-Period</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{antar.theme}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold bg-[#b59449]/10 text-[#722f37] px-2 py-1 rounded">
                      {antar.startDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} - {antar.endDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  {antar.detailedPrediction}
                </p>
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                    <span className="font-bold text-emerald-800 block mb-0.5">Key Opportunity</span>
                    <span className="text-emerald-700">{antar.bestOpportunity}</span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded border border-amber-100">
                    <span className="font-bold text-amber-800 block mb-0.5">Primary Caution</span>
                    <span className="text-amber-700">{antar.caution}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ReportPage>
      )}

      {/* ─── PAGE 15+: DETAILED DASHA & ANTARDASHA ROADMAP (DETAILED ONLY) ─── */}
      {data.plan === "detailed" && dashaAnalysis && dashaRoadmapPages.map((roadmapChunk, pageIndex) => (
        <ReportPage language={language}
          key={`dasha-roadmap-${pageIndex}`}
          pageNumber={pNum++}
          sectionTitle="Detailed Dasha Roadmap"
          exportMode={exportMode}
        >
          <SectionDivider language={language}
            title={pageIndex === 0 ? "Detailed Dasha & Antardasha Predictions to 2065" : "Continuing Dasha & Antardasha Predictions"}
            subtitle={pageIndex === 0
              ? "Expanded Mahadasha and Antardasha guidance from your current timeline through the year 2065"
              : "Further predictive dasha guidance for the remaining sub-periods in your long-range roadmap"}
          />
          {pageIndex === 0 && (
            <p className="text-[13px] leading-relaxed text-muted-foreground text-center italic mb-4 max-w-[640px] mx-auto">
              This section extends your Vimshottari timeline into a readable predictive roadmap. Each entry shows the Mahadasha, Antardasha, and the practical life themes most likely to become prominent as your planetary periods unfold through 2065.
            </p>
          )}
          <div className="space-y-4">
            {roadmapChunk.length > 0 ? roadmapChunk.map((entry, i) => (
              <div key={`${entry.mahaLord}-${entry.antarLord}-${entry.startDate.toISOString()}-${i}`} className="border border-[#b59449]/20 bg-white p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div>
                    <h4 className="font-bold text-[#722f37] text-sm">
                      {entry.mahaLord} Mahadasha • {entry.antarLord} Antardasha
                    </h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{entry.theme}</p>
                    <p className="text-[10px] text-[#b59449] mt-1">
                      Maha Window: {entry.mahaStartDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })} - {entry.mahaEndDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold bg-[#b59449]/10 text-[#722f37] px-2 py-1 rounded">
                      {entry.startDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} - {entry.endDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    {entry.isCurrentAntardasha && (
                      <div className="mt-1 text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                        Active now
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[11.5px] text-gray-700 leading-relaxed mb-3">
                  {entry.detailedPrediction}
                </p>

                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                    <span className="font-bold text-emerald-800 block mb-0.5">Key Opportunity</span>
                    <span className="text-emerald-700">{entry.bestOpportunity}</span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded border border-amber-100">
                    <span className="font-bold text-amber-800 block mb-0.5">Primary Caution</span>
                    <span className="text-amber-700">{entry.caution}</span>
                  </div>
                </div>

                <p className="mt-3 text-[10px] text-muted-foreground">
                  <span className="font-bold text-[#722f37]">Key focus:</span> {entry.keyFocus.slice(0, 3).join(", ")}
                </p>
              </div>
            )) : (
              <div className="border border-[#b59449]/20 bg-white p-5 rounded-xl text-center text-sm text-muted-foreground">
                Future Antardasha prediction details are unavailable for this chart right now. Please verify the birth date, time, and timezone if you need a complete dasha roadmap through 2065.
              </div>
            )}
          </div>
        </ReportPage>
      ))}

      {/* ─── PAGE 15: YOGAS & LUCKY ELEMENTS ─── */}
      {mahaRemedyPages.map((pageEntries, pageIndex) => (
        <ReportPage language={language}
          key={`maha-remedy-${pageIndex}`}
          pageNumber={pNum++}
          sectionTitle="Dasha Remedies"
          exportMode={exportMode}
        >
          <SectionDivider language={language}
            title={pageIndex === 0 ? t("Mahadasha Remedies, Mantras & Spiritual Supports") : t("Continuing Mahadasha Remedies to 2065")}
            subtitle={
              pageIndex === 0
                ? t("Detailed devotional guidance for each Mahadasha period through 2065, so long-cycle planetary themes can be steadied with prayer, discipline, and right conduct")
                : t("Further Mahadasha-specific remedies, yantras, mantra disciplines, and supportive devotional practices for the remaining periods")
            }
          />

          {pageIndex === 0 && (
            <p className="text-[12px] leading-relaxed text-muted-foreground text-center italic mb-4 max-w-[680px] mx-auto">
              {t("These remedies are arranged by Mahadasha only. Follow the period-wise spiritual supports gently and consistently, allowing each planetary cycle to be handled through mantra, pooja, fasting, right dress, devotional song, and sacred yantra practice.")}
            </p>
          )}

          <div className="space-y-4">
            {pageEntries.length > 0 ? (
              pageEntries.map((entry, entryIndex) => (
                <div
                  key={`${entry.planet}-${entry.start.toISOString()}-${entryIndex}`}
                  className="rounded-2xl border-2 border-[#b59449]/25 bg-[#fffef9] p-5 font-serif shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-[#b59449]/10 pb-3 mb-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-[#b59449] font-bold">{t("Mahadasha support")}</div>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className="text-2xl font-bold text-[#722f37]">{t(entry.planet)} {t("Mahadasha cycle")}</span>
                        {entry.active && (
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                            {t("Active now")}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#7b6a57] italic mt-1">{t("Presiding devata")}: {t(entry.guide.deity)}</div>
                    </div>

                    <div className="text-right max-w-[45%]">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[#b59449] font-bold">{t("Mahadasha window")}</div>
                      <div className="mt-1 text-[11px] font-semibold text-[#722f37] leading-relaxed">
                        {entry.start.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} -{" "}
                        {entry.end.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11.5px] leading-relaxed text-[#5f5a52] mb-4">{t(entry.prediction)}</p>

                  <div className="grid grid-cols-[1.15fr_0.85fr] gap-4">
                    <div className="space-y-2.5 text-[11px] leading-relaxed">
                      <div><span className="font-bold text-[#722f37]">{t("Morning prayer:")}</span> <span className="text-[#5f5a52]">{t(entry.guide.morningPrayer)}</span></div>
                      <div><span className="font-bold text-[#722f37]">{t("Main mantra:")}</span> <span className="text-[#5f5a52]">{t(entry.guide.mantra)}</span></div>
                      <div><span className="font-bold text-[#722f37]">{t("Chanting discipline:")}</span> <span className="text-[#5f5a52]">{t(entry.guide.chanting)}</span></div>
                      <div><span className="font-bold text-[#722f37]">{t("Pooja & offerings:")}</span> <span className="text-[#5f5a52]">{t(entry.guide.pooja)}</span></div>
                      <div><span className="font-bold text-[#722f37]">{t("Dress & color support:")}</span> <span className="text-[#5f5a52]">{t(entry.guide.dress)}</span></div>
                      <div><span className="font-bold text-[#722f37]">{t("Devata bhajan:")}</span> <span className="text-[#5f5a52]">{t(entry.guide.bhajan)}</span></div>
                      <div><span className="font-bold text-[#722f37]">{t("Fasting / vrata:")}</span> <span className="text-[#5f5a52]">{t(entry.guide.fasting)}</span></div>
                    </div>

                    <div className="rounded-xl border border-[#b59449]/15 bg-white/70 p-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[#b59449] font-bold mb-2">{t("Digital Yantra")}</div>
                      <div className="flex justify-center">
                        <DigitalYantraSeal yantra={entry.guide.digitalYantra} />
                      </div>

                      <div className="mt-3 text-[11px] leading-relaxed text-[#5f5a52]">
                        <span className="font-bold text-[#722f37] block mb-1">{t("Yantra use:")}</span>
                        {t(entry.guide.yantraNote)}
                      </div>

                      <div className="mt-3 text-[11px] leading-relaxed text-[#5f5a52]">
                        <span className="font-bold text-[#722f37] block mb-1">{t("Additional devotional support:")}</span>
                        {t(entry.guide.offerings)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-[#b59449]/20 bg-white p-5 rounded-xl text-center text-sm text-muted-foreground">
                Mahadasha remedy details are unavailable for this chart right now. Please verify the birth date, time, and timezone if you need the full Mahadasha remedy roadmap through 2065.
              </div>
            )}
          </div>
        </ReportPage>
      ))}

      <ReportPage language={language} pageNumber={pNum++} sectionTitle="Lucky Elements" exportMode={exportMode}>
        <SectionDivider language={language}
          title="Chart-Based Lucky Elements"
          subtitle="Gemstone, rudraksha, colors, numbers, and sacred supports derived from your Lagna, Moon sign, and Nakshatra anchors"
        />

        <div className="grid grid-cols-3 gap-3 my-auto">
          {luckySupportCards.map((support) => (
            <div
              key={`${support.label}-${support.planet}`}
              className="p-4 bg-white border-2 border-[#b59449]/20 rounded-xl font-serif shadow-sm text-center"
            >
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#b59449] font-bold">
                {support.label}
              </div>
              <div className="mt-1 text-lg font-bold text-[#722f37]">{support.planet}</div>
              <div className="text-[11px] text-[#7b6a57] italic mb-2">{support.source}</div>

              <div className="mt-3 space-y-1.5 text-[12px] text-left">
                <div className="flex justify-between gap-3 border-b border-[#b59449]/10 pb-1">
                  <span className="text-[#888888]">Gemstone</span>
                  <span className="font-semibold text-right text-foreground">{support.lucky.gem}</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-[#b59449]/10 pb-1">
                  <span className="text-[#888888]">Rudraksha</span>
                  <span className="font-semibold text-right text-foreground">{support.lucky.rudraksha}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#888888]">Lucky numbers</span>
                  <span className="font-semibold text-right text-[#722f37]">{support.lucky.numbers}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ReportPage>

      <ReportPage language={language} pageNumber={pNum++} sectionTitle="Lucky Elements Guide" exportMode={exportMode}>
        <SectionDivider language={language}
          title="Detailed Lucky Elements Guide"
          subtitle="Comprehensive chart-derived power attributes, mantras, and daily alignment practices"
        />

        <div className="border-2 border-[#b59449]/40 bg-[#fffef9] p-5 rounded-xl font-serif shadow-md my-auto">
          <h4 className="text-center text-xs font-bold text-[#722f37] uppercase tracking-widest mb-1">
            Detailed Lucky Elements Guide
          </h4>
          <p className="text-center text-[11px] text-[#7b6a57] mb-4">
            Begin with your Lagna lord support first, then selectively add Moon-sign and Nakshatra supports where they feel spiritually aligned and practical.
          </p>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
            <div className="flex justify-between gap-3 border-b border-[#b59449]/10 pb-1">
              <span className="text-[#888888]">Primary support planet:</span>
              <span className="font-bold text-[#722f37]">{primaryLuckySupport?.planet}</span>
            </div>
            <div className="flex justify-between gap-3 border-b border-[#b59449]/10 pb-1">
              <span className="text-[#888888]">Auspicious gemstone:</span>
              <span className="font-bold text-[#722f37] text-right">{primaryLucky.gem}</span>
            </div>
            <div className="flex justify-between gap-3 border-b border-[#b59449]/10 pb-1">
              <span className="text-[#888888]">Recommended rudraksha:</span>
              <span className="font-bold text-foreground text-right">{primaryLucky.rudraksha}</span>
            </div>
            <div className="flex justify-between gap-3 border-b border-[#b59449]/10 pb-1">
              <span className="text-[#888888]">Power numbers:</span>
              <span className="font-bold text-foreground text-right">{primaryLucky.numbers}</span>
            </div>
            <div className="flex justify-between gap-3 border-b border-[#b59449]/10 pb-1">
              <span className="text-[#888888]">Favorable colors:</span>
              <span className="font-bold text-foreground text-right">{primaryLucky.colors}</span>
            </div>
            <div className="flex justify-between gap-3 border-b border-[#b59449]/10 pb-1">
              <span className="text-[#888888]">Auspicious day:</span>
              <span className="font-bold text-[#722f37] text-right">{primaryLucky.day}</span>
            </div>
            <div className="flex justify-between gap-3 border-b border-[#b59449]/10 pb-1">
              <span className="text-[#888888]">Supporting metal:</span>
              <span className="font-bold text-foreground text-right">{primaryLucky.metal}</span>
            </div>
            <div className="flex justify-between gap-3 border-b border-[#b59449]/10 pb-1">
              <span className="text-[#888888]">Daily mantra:</span>
              <span className="font-bold text-[#b59449] text-right">{primaryLucky.mantra}</span>
            </div>
            <div className="col-span-2 border-b border-[#b59449]/10 pb-2">
              <span className="block text-[#888888] mb-1">Supportive offerings / strengthening practice:</span>
              <span className="font-semibold text-foreground leading-relaxed">{primaryLucky.offerings}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-[#888888] mb-1">Use extra care around:</span>
              <span className="font-semibold text-[#722f37] leading-relaxed">{primaryLucky.avoid}</span>
            </div>
          </div>
        </div>
      </ReportPage>

      {/* ─── DYNAMIC PLANETARY YOGAS ─── */}
      {yogaChunks.map((chunk, pageIdx) => (
        <ReportPage language={language}
          key={`planetary-yogas-${pageIdx}`}
          pageNumber={pNum++}
          sectionTitle={`Planetary Yogas Part ${pageIdx + 1}`}
          exportMode={exportMode}
        >
          <SectionDivider language={language}
            title={pageIdx === 0 ? "Special Combination of Planets in the Horoscope (YOGA)" : "Continuing Special Combination of Planets (YOGA)"}
            subtitle="Special planetary alignments and configurations at your moment of incarnation and their life-changing results"
          />

          {pageIdx === 0 && (
            <p className="text-[12px] text-justify leading-relaxed text-gray-750 italic mb-3 max-w-[660px] mx-auto text-center font-serif">
              Yogas are special combination of planets in the horoscope which influence the life and future of a person. Some are formed by simple conjunction of planets, whereas others are based on complex astrological logic or peculiar placement of planets in the chart. Hundreds of combinations and their effects have been described in the ancient astrological texts. While some combinations are good, others may have undesirable effects. <span className="font-bold text-[#722f37]">{data.name}</span>, the important combinations identified in your horoscope are listed below with a brief mention of the effect it can have on you.
            </p>
          )}

          <div className="space-y-3 my-auto">
            {chunk.length > 0 ? (
              chunk.map((yoga, idx) => (
                <div key={idx} className={cn("border rounded-xl p-3 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
                  <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                    <span>{yoga.name} {yoga.sanskritName ? `(${yoga.sanskritName})` : ''}</span>
                    <span className="text-[9.5px] text-muted-foreground font-normal italic">
                      Strength: {yoga.strength ? yoga.strength.toUpperCase() : 'MODERATE'} {yoga.activationPeriod ? `· Active during: ${yoga.activationPeriod}` : ''}
                    </span>
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                    {yoga.description}
                  </p>
                  {yoga.lifeImpact && (
                    <p className="text-[10px] text-[#722f37] mt-1.5 leading-relaxed text-justify">
                      <span className="font-bold">Life Impact:</span> {yoga.lifeImpact}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className={cn("border rounded-xl p-4 font-serif text-center relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
                <h4 className="font-bold text-[13px] text-[#722f37] mb-2 uppercase tracking-wider">General Chart Vitality & Planetary Alignment</h4>
                <p className="text-xs text-gray-655 leading-relaxed max-w-[550px] mx-auto text-justify">
                  Your birth chart displays a balanced distribution of planetary forces. While no major classical combinations (Yogas) like Gaja Kesari or Vipreet Raj Yoga are prominently active in their high-intensity forms, the overall positioning of your lagna and kendra/trine houses ensures a steady, resilient, and progressive life path. Your planetary lords cooperate harmoniously, giving you the natural endurance and capacity to build your own fortune through direct actions and self-discipline.
                </p>
              </div>
            )}
          </div>
        </ReportPage>
      ))}

      {/* ─── PAGE 16.6: ASHTAKAVARGA POINTS TABLE ─── */}
      {exportMode ? (
        <>
          {/* Page 1: Table only */}
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Ashtakavarga Points Table" exportMode={exportMode}>
            <SectionDivider language={language}
              title="Ashtakavarga Bindu Table & Planetary Strengths"
              subtitle="The mathematical distribution of auspicious points (Bindus) for each planet across the 12 Sanskrit Signs"
            />
            <p className="text-[11px] text-justify leading-relaxed text-gray-700 italic mb-2 max-w-[660px] mx-auto text-center font-serif">
              Ashtakavarga is a highly respected mathematical system in Vedic astrology that evaluates the collective influence of the seven primary planets (grahas) on the 12 Sanskrit Signs. The points (Bindus) represent the level of protection, strength, and support a planet enjoys in a particular rasi. The asterisk (<span className="font-bold text-[#722f37]">*</span>) indicates the exact sign in which each planet is natal posited in your chart.
            </p>
            <div className="w-full overflow-x-auto my-auto border rounded-lg border-[#d7b96a]/25 shadow-sm bg-[#fffef9]/60 p-2">
              <table className="w-full text-center border-collapse font-serif text-[10px]">
                <thead>
                  <tr className="bg-[#722f37] text-white border-b border-[#d7b96a]/30">
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Sign (Rashi)</th>
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Surya</th>
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Chandra</th>
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Kuja</th>
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Budha</th>
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Guru</th>
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Shukra</th>
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Shani</th>
                    <th className="p-1.5 font-bold bg-[#7b2d36] text-yellow-300">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {SANSKRIT_SIGNS.map((sign, i) => {
                    const sVal = suryaArr[i];
                    const cVal = chandraArr[i];
                    const kVal = marsArr[i];
                    const bVal = mercuryArr[i];
                    const gVal = jupiterArr[i];
                    const vVal = venusArr[i];
                    const shVal = saturnArr[i];
                    const totalVal = sVal + cVal + kVal + bVal + gVal + vVal + shVal;

                    return (
                      <tr key={sign} className={cn("border-b border-[#d7b96a]/15 text-gray-700", i % 2 === 0 ? "bg-[#fffef9]" : "bg-white")}>
                        <td className="p-1.5 border-r border-[#d7b96a]/20 font-bold text-[#722f37]">{sign}</td>
                        <td className={cn("p-1.5 border-r border-[#d7b96a]/20", sunSignIdx === i && "font-bold text-[#722f37] bg-yellow-100/50")}>
                          {sVal}{sunSignIdx === i ? " *" : ""}
                        </td>
                        <td className={cn("p-1.5 border-r border-[#d7b96a]/20", moonSignIdx === i && "font-bold text-[#722f37] bg-yellow-100/50")}>
                          {cVal}{moonSignIdx === i ? " *" : ""}
                        </td>
                        <td className={cn("p-1.5 border-r border-[#d7b96a]/20", marsSignIdx === i && "font-bold text-[#722f37] bg-yellow-100/50")}>
                          {kVal}{marsSignIdx === i ? " *" : ""}
                        </td>
                        <td className={cn("p-1.5 border-r border-[#d7b96a]/20", mercurySignIdx === i && "font-bold text-[#722f37] bg-yellow-100/50")}>
                          {bVal}{mercurySignIdx === i ? " *" : ""}
                        </td>
                        <td className={cn("p-1.5 border-r border-[#d7b96a]/20", jupiterSignIdx === i && "font-bold text-[#722f37] bg-yellow-100/50")}>
                          {gVal}{jupiterSignIdx === i ? " *" : ""}
                        </td>
                        <td className={cn("p-1.5 border-r border-[#d7b96a]/20", venusSignIdx === i && "font-bold text-[#722f37] bg-yellow-100/50")}>
                          {vVal}{venusSignIdx === i ? " *" : ""}
                        </td>
                        <td className={cn("p-1.5 border-r border-[#d7b96a]/20", saturnSignIdx === i && "font-bold text-[#722f37] bg-yellow-100/50")}>
                          {shVal}{saturnSignIdx === i ? " *" : ""}
                        </td>
                        <td className="p-1.5 font-bold bg-[#fffdf5] text-[#722f37]">{totalVal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ReportPage>

          {/* Page 2: Sun & Moon */}
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Ashtakavarga predictions - Sun & Moon" exportMode={exportMode}>
            <SectionDivider language={language}
              title="Ashtakavarga predictions - Sun & Moon"
              subtitle="Individual energetic strengths and traits analysis for Surya & Chandra"
            />
            <div className="space-y-3.5 my-auto">
              {/* Surya Prediction Card */}
              <div className="border rounded-xl p-4 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                <h4 className="font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                  <span>{t("Surya (Sun) Ashtakavarga Predictions")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">
                    Natal Sign: {SANSKRIT_SIGNS[sunSignIdx]} · Score: {suryaPoints} Bindus ({suryaPoints >= 5 ? "Strong" : suryaPoints >= 3 ? "Balanced" : "Challenging"})
                  </span>
                </h4>
                <p className="text-[11px] text-gray-650 leading-relaxed mt-1.5 text-justify">
                  {suryaPoints >= 5
                    ? `Dear ${data.name}, with an impressive score of ${suryaPoints} Bindus in Surya's Ashtakavarga, your solar energy is incredibly powerful and radiant. This indicates a natural authority, excellent leadership abilities, strong health, and the capacity to command respect in professional and social spheres. Your self-worth and confidence will be exceptionally stable, helping you overcome obstacles with pure will and integrity.`
                    : suryaPoints >= 3
                    ? `Dear ${data.name}, with a balanced score of ${suryaPoints} Bindus in Surya's Ashtakavarga, your solar drive is steady and reliable. You have a healthy level of self-assurance and ambition without being overly domineering. This enables you to work well within organizational hierarchies while retaining your individuality. Career growth is steady, and you maintain cordial relations with mentors and father figures.`
                    : `Dear ${data.name}, your score of ${suryaPoints} Bindus in Surya's Ashtakavarga is on the lower side, suggesting that your solar energy faces some blockages. You might experience occasional self-doubt, low energy levels, or friction with authority figures and fatherly guides. Cultivating self-belief, waking up early, and offering water to the morning Sun (Surya Arghya) will significantly strengthen your solar vitality.`}
                </p>
              </div>

              {/* Chandra Prediction Card */}
              <div className="border rounded-xl p-4 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                <h4 className="font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                  <span>{t("Chandra (Moon) Ashtakavarga Predictions")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">
                    Natal Sign: {SANSKRIT_SIGNS[moonSignIdx]} · Score: {chandraPoints} Bindus ({chandraPoints >= 5 ? "Strong" : chandraPoints >= 3 ? "Balanced" : "Challenging"})
                  </span>
                </h4>
                <p className="text-[11px] text-gray-655 leading-relaxed mt-1.5 text-justify">
                  {chandraPoints >= 5
                    ? `Dear ${data.name}, your stellar score of ${chandraPoints} Bindus in Chandra's Ashtakavarga blesses you with exceptional emotional resilience and mental stability. Your intuition is deep, and your capacity to nurture and empathize with others is a major life asset. This placement ensures a calm, peaceful mind and strong support from your mother or motherly figures throughout life.`
                    : chandraPoints >= 3
                    ? `Dear ${data.name}, with ${chandraPoints} Bindus in Chandra's Ashtakavarga, you possess a balanced and sensible emotional nature. While you feel things deeply, you generally have the maturity to process feelings logically, avoiding extreme mood swings. Your domestic life and mental peace remain stable, providing a secure foundation for your daily pursuits.`
                    : `Dear ${data.name}, a score of ${chandraPoints} Bindus in Chandra's Ashtakavarga indicates that your emotional sphere requires conscious care. You may be prone to emotional fluctuations, anxiety, or feelings of isolation. Your mental peace can be easily disrupted by external events. Practicing meditation, keeping a journal, and drinking water from silver vessels can help ground your lunar energies.`}
                </p>
              </div>
            </div>
          </ReportPage>

          {/* Page 3: Mars & Mercury */}
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Ashtakavarga predictions - Mars & Mercury" exportMode={exportMode}>
            <SectionDivider language={language}
              title="Ashtakavarga predictions - Mars & Mercury"
              subtitle="Individual energetic strengths and traits analysis for Kuja & Budha"
            />
            <div className="space-y-3.5 my-auto">
              {/* Kuja Prediction Card */}
              <div className="border rounded-xl p-4 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                <h4 className="font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                  <span>{t("Kuja (Mars) Ashtakavarga Predictions")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">
                    Natal Sign: {SANSKRIT_SIGNS[marsSignIdx]} · Score: {kujaPoints} Bindus ({kujaPoints >= 5 ? "Strong" : kujaPoints >= 3 ? "Balanced" : "Challenging"})
                  </span>
                </h4>
                <p className="text-[11px] text-gray-655 leading-relaxed mt-1.5 text-justify">
                  {kujaPoints >= 5
                    ? `Dear ${data.name}, a robust score of ${kujaPoints} Bindus in Kuja's Ashtakavarga gives you immense courage, stamina, and drive. You are an action-oriented leader who excels under pressure and handles competition with ease. Your ability to execute projects with focus and determination is exceptional. Your physical energy and passion are keys to your success.`
                    : kujaPoints >= 3
                    ? `Dear ${data.name}, with a balanced ${kujaPoints} Bindus in Kuja's Ashtakavarga, your energy levels and courage are well-moderated. You possess enough ambition and drive to achieve your goals, but you also know when to hold back and avoid unnecessary conflicts. This helps you maintain long-term stamina without burning out or initiating impulsive disputes.`
                    : `Dear ${data.name}, your score of ${kujaPoints} Bindus in Kuja's Ashtakavarga is challenging, which may manifest as low energy, lack of initiative, or a tendency to get frustrated easily. You might find it hard to stand up for yourself or assert your boundaries. Engaging in regular physical exercise, chanting the Mangal Mantra, and practicing patience will help direct your Martian energy constructively.`}
                </p>
              </div>

              {/* Budha Prediction Card */}
              <div className="border rounded-xl p-4 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                <h4 className="font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                  <span>{t("Budha (Mercury) Ashtakavarga Predictions")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">
                    Natal Sign: {SANSKRIT_SIGNS[mercurySignIdx]} · Score: {budhaPoints} Bindus ({budhaPoints >= 5 ? "Strong" : budhaPoints >= 3 ? "Balanced" : "Challenging"})
                  </span>
                </h4>
                <p className="text-[11px] text-gray-655 leading-relaxed mt-1.5 text-justify">
                  {budhaPoints >= 5
                    ? `Dear ${data.name}, an outstanding score of ${budhaPoints} Bindus in Budha's Ashtakavarga highlights your highly refined intellect and analytical mind. You possess excellent communication skills, sharp wit, and a natural aptitude for business, writing, or strategic planning. Your ability to learn new concepts rapidly and articulate them persuasively is a stellar gift.`
                    : budhaPoints >= 3
                    ? `Dear ${data.name}, with a healthy score of ${budhaPoints} Bindus in Budha's Ashtakavarga, your communication and logical capacities are steady and balanced. You are a sensible thinker who makes rational, practical decisions. Your speech is pleasant, and your social interactions are cordial. This balance supports stable professional communication and sound financial management.`
                    : `Dear ${data.name}, with ${budhaPoints} Bindus in Budha's Ashtakavarga, you might experience occasional communication gaps, mental fatigue, or difficulty in making decisions. There may be a tendency to overthink or struggle with linear logic. Maintaining clear written records, avoiding gossip, and learning to simplify your thoughts will assist in sharpening your Mercury's potential.`}
                </p>
              </div>
            </div>
          </ReportPage>

          {/* Page 4: Jupiter, Venus & Saturn */}
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Ashtakavarga predictions - Guru, Shukra & Shani" exportMode={exportMode}>
            <SectionDivider language={language}
              title="Ashtakavarga predictions - Guru, Shukra & Shani"
              subtitle="Individual energetic strengths and traits analysis for Jupiter, Venus & Saturn"
            />
            <div className="space-y-3.5 my-auto">
              {/* Guru Prediction Card */}
              <div className="border rounded-xl p-3 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                <h4 className="font-bold text-[12px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                  <span>{t("Guru (Jupiter) Ashtakavarga Predictions")}</span>
                  <span className="text-[9px] text-muted-foreground font-normal italic">
                    Natal Sign: {SANSKRIT_SIGNS[jupiterSignIdx]} · Score: {guruPoints} Bindus ({guruPoints >= 5 ? "Strong" : guruPoints >= 3 ? "Balanced" : "Challenging"})
                  </span>
                </h4>
                <p className="text-[10.5px] text-gray-655 leading-relaxed mt-1.5 text-justify">
                  {guruPoints >= 5
                    ? `Dear ${data.name}, your exceptional score of ${guruPoints} Bindus in Guru's Ashtakavarga brings immense divine grace, wisdom, and fortune into your life. You have a philosophical outlook, high moral values, and a natural desire for higher learning and spiritual growth. This strong energy attracts prosperity, excellent mentors, and opportunities for expand-ability.`
                    : guruPoints >= 3
                    ? `Dear ${data.name}, with a balanced ${guruPoints} Bindus in Guru's Ashtakavarga, you possess a solid, practical sense of wisdom and standard level of luck. You value ethics and learning, seeking to apply them in your everyday life. This provides a steady guide for making mature choices in career, finance, and relationships.`
                    : `Dear ${data.name}, a lower score of ${guruPoints} Bindus in Guru's Ashtakavarga suggests that divine guidance and good fortune might feel delayed at times. You may face challenges regarding higher education, spiritual clarity, or financial growth. Honoring teachers, donating to spiritual or educational causes, and practicing gratitude will help open up your Jupiterian blessings.`}
                </p>
              </div>

              {/* Shukra Prediction Card */}
              <div className="border rounded-xl p-3 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                <h4 className="font-bold text-[12px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                  <span>{t("Shukra (Venus) Ashtakavarga Predictions")}</span>
                  <span className="text-[9px] text-muted-foreground font-normal italic">
                    Natal Sign: {SANSKRIT_SIGNS[venusSignIdx]} · Score: {shukraPoints} Bindus ({shukraPoints >= 5 ? "Strong" : shukraPoints >= 3 ? "Balanced" : "Challenging"})
                  </span>
                </h4>
                <p className="text-[10.5px] text-gray-655 leading-relaxed mt-1.5 text-justify">
                  {shukraPoints >= 5
                    ? `Dear ${data.name}, a wonderful score of ${shukraPoints} Bindus in Shukra's Ashtakavarga indicates a highly refined aesthetic sense, charisma, and a natural capacity for love and luxury. You attract harmonious relationships, artistic appreciation, and comfort easily. Your social presence is pleasant, and you possess a deep appreciation for beauty, music, and fine living.`
                    : shukraPoints >= 3
                    ? `Dear ${data.name}, with a balanced score of ${shukraPoints} Bindus in Shukra's Ashtakavarga, your relationships and material desires are well-regulated. You appreciate comforts and seek pleasant partnerships, but you do not get overly attached to materialistic pursuits or superficial beauty. This balance ensures stable relationship dynamics and financial prudence.`
                    : `Dear ${data.name}, your score of ${shukraPoints} Bindus in Shukra's Ashtakavarga is on the lower side, which can sometimes bring relationship hurdles, creative blocks, or dissatisfaction with material comforts. You might struggle to find emotional fulfillment or harmony in partnerships. Cultivating self-love, practicing relationship boundary-setting, and honoring women will steady your Venusian energy.`}
                </p>
              </div>

              {/* Shani Prediction Card */}
              <div className="border rounded-xl p-3 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                <h4 className="font-bold text-[12px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                  <span>{t("Shani (Saturn) Ashtakavarga Predictions")}</span>
                  <span className="text-[9px] text-muted-foreground font-normal italic">
                    Natal Sign: {SANSKRIT_SIGNS[saturnSignIdx]} · Score: {shaniPoints} Bindus ({shaniPoints >= 5 ? "Strong" : shaniPoints >= 3 ? "Balanced" : "Challenging"})
                  </span>
                </h4>
                <p className="text-[10.5px] text-gray-655 leading-relaxed mt-1.5 text-justify">
                  {shaniPoints >= 5
                    ? `Dear ${data.name}, with a high score of ${shaniPoints} Bindus in Shani's Ashtakavarga, you are blessed with incredible discipline, patience, and endurance. You have a strong sense of duty and the ability to work tirelessly toward your long-term goals. While success might come with effort, it will be highly durable and well-deserved. You can weather any life storm with stoicism.`
                    : shaniPoints >= 3
                    ? `Dear ${data.name}, a balanced score of ${shaniPoints} Bindus in Shani's Ashtakavarga indicates that your capacity for hard work and responsibility is well-proportioned. You are neither lazy nor an extreme workaholic. You handle structural duties, chores, and boundaries with a sensible attitude, leading to stable growth and a highly structured life routine.`
                    : `Dear ${data.name}, with ${shaniPoints} Bindus in Shani's Ashtakavarga, you might sometimes feel overwhelmed by responsibilities, experience delays, or struggle with discipline and consistency. Impatience or fear of limitations might slow your progress. Developing structured routines, engaging in selfless service (Seva), and cultivating perseverance will help you transform these Saturnian trials into strengths.`}
                </p>
              </div>
            </div>
          </ReportPage>

          {/* Page 5: Sarva composite */}
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Ashtakavarga predictions - Composite & Sarva" exportMode={exportMode}>
            <SectionDivider language={language}
              title="Sarvashtakavarga Predictions & Composite Score"
              subtitle="Continuing deep-dive planetary strength predictions and final composite cosmic score"
            />
            <div className="space-y-3.5 my-auto">
              <div className="border rounded-xl p-4 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                <h4 className="font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                  <span>{t("Sarvashtakavarga Predictions & Composite Score")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">
                    Natal Moon Sign: {rashiName} · Total Score: {sarvaPoints} Bindus
                  </span>
                </h4>
                <div className="text-[11px] text-gray-600 leading-relaxed mt-2 space-y-2 text-justify">
                  <p>
                    The proliferation of maximum bindus in your chart appears in Simha to Vrischika, signifying that the years of your youth and mature middle age will be highly active and prosperous. Your career path will take off to unexpected heights. Academic and personal aspirations will get a head start during this stage of life, and happiness and prosperity will seem to be at their peak. Destiny will protect you from the worries of severe professional stagnation, and domestic bliss will also come seeking you.
                  </p>
                  <p>
                    At the age corresponding to the figures in the signs occupied by Jupiter, Venus, and Mercury, your fortune turns for the better. Your educational ambitions will materialize and you could acquire that coveted seat for higher learning or achieve professional mastery. Your future looks set to take off on the path to wealth, recognition, and fame for your professional accomplishments. Marital togetherness will bring much joy and your progeny will be blessed. In your case, these special turning points occur at your <span className="font-bold text-[#722f37]">{jupAge}</span>, <span className="font-bold text-[#722f37]">{venAge}</span>, and <span className="font-bold text-[#722f37]">{merAge}</span> years of age.
                  </p>
                  <p>
                    In your horoscope, the Lagna (1st house) has <span className="font-bold text-[#722f37]">{lagnaSarva}</span> bindus, the 9th house of fortune has <span className="font-bold text-[#722f37]">{h9Sarva}</span> bindus, the 10th house of career has <span className="font-bold text-[#722f37]">{h10Sarva}</span> bindus, and the 11th house of gains has <span className="font-bold text-[#722f37]">{h11Sarva}</span> bindus. Since these crucial houses have 30 or less number of bindus, it indicates that wealth creation will require steady, disciplined effort, and a calm mind is essential to prevent stress from affecting your physical health. Take charge of your life with confidence, avoid the pitfalls of negative thoughts, and overcome any obstacles through persistent actions.
                  </p>
                </div>
              </div>
            </div>
          </ReportPage>
        </>
      ) : (
        <>
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Ashtakavarga Grahas Part 1" exportMode={exportMode}>
            <SectionDivider language={language}
              title="Ashtakavarga Bindu Table & Planetary Strengths"
              subtitle="The mathematical distribution of auspicious points (Bindus) for each planet across the 12 Sanskrit Signs"
            />

            <p className="text-[11px] text-justify leading-relaxed text-gray-700 italic mb-2 max-w-[660px] mx-auto text-center font-serif">
              Ashtakavarga is a highly respected mathematical system in Vedic astrology that evaluates the collective influence of the seven primary planets (grahas) on the 12 Sanskrit Signs. The points (Bindus) represent the level of protection, strength, and support a planet enjoys in a particular rasi. Dear <span className="font-bold text-[#722f37]">{data.name}</span>, your dynamic points table is detailed below. The asterisk (<span className="font-bold text-[#722f37]">*</span>) indicates the exact sign in which each planet is natal posited in your chart.
            </p>

            <div className="w-full overflow-x-auto my-1 border rounded-lg border-[#d7b96a]/25 shadow-sm bg-[#fffef9]/60 p-2">
              <table className="w-full text-center border-collapse font-serif text-[10px]">
                <thead>
                  <tr className="bg-[#722f37] text-white border-b border-[#d7b96a]/30">
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Sign (Rashi)</th>
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Surya</th>
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Chandra</th>
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Kuja</th>
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Budha</th>
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Guru</th>
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Shukra</th>
                    <th className="p-1.5 border-r border-[#d7b96a]/20 font-bold">Shani</th>
                    <th className="p-1.5 font-bold bg-[#7b2d36] text-yellow-300">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {SANSKRIT_SIGNS.map((sign, i) => {
                    const sVal = suryaArr[i];
                    const cVal = chandraArr[i];
                    const kVal = marsArr[i];
                    const bVal = mercuryArr[i];
                    const gVal = jupiterArr[i];
                    const vVal = venusArr[i];
                    const shVal = saturnArr[i];
                    const totalVal = sVal + cVal + kVal + bVal + gVal + vVal + shVal;

                    return (
                      <tr key={sign} className={cn("border-b border-[#d7b96a]/15 text-gray-700", i % 2 === 0 ? "bg-[#fffef9]" : "bg-white")}>
                        <td className="p-1.5 border-r border-[#d7b96a]/20 font-bold text-[#722f37]">{sign}</td>
                        <td className={cn("p-1.5 border-r border-[#d7b96a]/20", sunSignIdx === i && "font-bold text-[#722f37] bg-yellow-100/50")}>
                          {sVal}{sunSignIdx === i ? " *" : ""}
                        </td>
                        <td className={cn("p-1.5 border-r border-[#d7b96a]/20", moonSignIdx === i && "font-bold text-[#722f37] bg-yellow-100/50")}>
                          {cVal}{moonSignIdx === i ? " *" : ""}
                        </td>
                        <td className={cn("p-1.5 border-r border-[#d7b96a]/20", marsSignIdx === i && "font-bold text-[#722f37] bg-yellow-100/50")}>
                          {kVal}{marsSignIdx === i ? " *" : ""}
                        </td>
                        <td className={cn("p-1.5 border-r border-[#d7b96a]/20", mercurySignIdx === i && "font-bold text-[#722f37] bg-yellow-100/50")}>
                          {bVal}{mercurySignIdx === i ? " *" : ""}
                        </td>
                        <td className={cn("p-1.5 border-r border-[#d7b96a]/20", jupiterSignIdx === i && "font-bold text-[#722f37] bg-yellow-100/50")}>
                          {gVal}{jupiterSignIdx === i ? " *" : ""}
                        </td>
                        <td className={cn("p-1.5 border-r border-[#d7b96a]/20", venusSignIdx === i && "font-bold text-[#722f37] bg-yellow-100/50")}>
                          {vVal}{venusSignIdx === i ? " *" : ""}
                        </td>
                        <td className={cn("p-1.5 border-r border-[#d7b96a]/20", saturnSignIdx === i && "font-bold text-[#722f37] bg-yellow-100/50")}>
                          {shVal}{saturnSignIdx === i ? " *" : ""}
                        </td>
                        <td className="p-1.5 font-bold bg-[#fffdf5] text-[#722f37]">{totalVal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 mt-3">
              {/* Surya Prediction Card */}
              <div className={cn("border rounded-xl p-3 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
                <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                  <span>{t("Surya (Sun) Ashtakavarga Predictions")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">
                    Natal Sign: {SANSKRIT_SIGNS[sunSignIdx]} · Score: {suryaPoints} Bindus ({suryaPoints >= 5 ? "Strong" : suryaPoints >= 3 ? "Balanced" : "Challenging"})
                  </span>
                </h4>
                <p className="text-[11px] text-gray-650 leading-relaxed mt-1.5 text-justify">
                  {suryaPoints >= 5
                    ? `Dear ${data.name}, with an impressive score of ${suryaPoints} Bindus in Surya's Ashtakavarga, your solar energy is incredibly powerful and radiant. This indicates a natural authority, excellent leadership abilities, strong health, and the capacity to command respect in professional and social spheres. Your self-worth and confidence will be exceptionally stable, helping you overcome obstacles with pure will and integrity.`
                    : suryaPoints >= 3
                    ? `Dear ${data.name}, with a balanced score of ${suryaPoints} Bindus in Surya's Ashtakavarga, your solar drive is steady and reliable. You have a healthy level of self-assurance and ambition without being overly domineering. This enables you to work well within organizational hierarchies while retaining your individuality. Career growth is steady, and you maintain cordial relations with mentors and father figures.`
                    : `Dear ${data.name}, your score of ${suryaPoints} Bindus in Surya's Ashtakavarga is on the lower side, suggesting that your solar energy faces some blockages. You might experience occasional self-doubt, low energy levels, or friction with authority figures and fatherly guides. Cultivating self-belief, waking up early, and offering water to the morning Sun (Surya Arghya) will significantly strengthen your solar vitality.`}
                </p>
              </div>

              {/* Chandra Prediction Card */}
              <div className={cn("border rounded-xl p-3 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
                <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                  <span>{t("Chandra (Moon) Ashtakavarga Predictions")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">
                    Natal Sign: {SANSKRIT_SIGNS[moonSignIdx]} · Score: {chandraPoints} Bindus ({chandraPoints >= 5 ? "Strong" : chandraPoints >= 3 ? "Balanced" : "Challenging"})
                  </span>
                </h4>
                <p className="text-[11px] text-gray-650 leading-relaxed mt-1.5 text-justify">
                  {chandraPoints >= 5
                    ? `Dear ${data.name}, your stellar score of ${chandraPoints} Bindus in Chandra's Ashtakavarga blesses you with exceptional emotional resilience and mental stability. Your intuition is deep, and your capacity to nurture and empathize with others is a major life asset. This placement ensures a calm, peaceful mind and strong support from your mother or motherly figures throughout life.`
                    : chandraPoints >= 3
                    ? `Dear ${data.name}, with ${chandraPoints} Bindus in Chandra's Ashtakavarga, you possess a balanced and sensible emotional nature. While you feel things deeply, you generally have the maturity to process feelings logically, avoiding extreme mood swings. Your domestic life and mental peace remain stable, providing a secure foundation for your daily pursuits.`
                    : `Dear ${data.name}, a score of ${chandraPoints} Bindus in Chandra's Ashtakavarga indicates that your emotional sphere requires conscious care. You may be prone to emotional fluctuations, anxiety, or feelings of isolation. Your mental peace can be easily disrupted by external events. Practicing meditation, keeping a journal, and drinking water from silver vessels can help ground your lunar energies.`}
                </p>
              </div>
            </div>
          </ReportPage>

          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Ashtakavarga Grahas Part 2 & Sarva" exportMode={exportMode}>
            <SectionDivider language={language}
              title="Ashtakavarga Interpretations & Sarvashtakavarga"
              subtitle="Continuing deep-dive planetary strength predictions and final composite cosmic score"
            />

            <div className="space-y-3.5 my-auto">
              {/* Kuja Prediction Card */}
              <div className={cn("border rounded-xl p-3 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
                <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                  <span>{t("Kuja (Mars) Ashtakavarga Predictions")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">
                    Natal Sign: {SANSKRIT_SIGNS[marsSignIdx]} · Score: {kujaPoints} Bindus ({kujaPoints >= 5 ? "Strong" : kujaPoints >= 3 ? "Balanced" : "Challenging"})
                  </span>
                </h4>
                <p className="text-[11px] text-gray-655 leading-relaxed mt-1.5 text-justify">
                  {kujaPoints >= 5
                    ? `Dear ${data.name}, a robust score of ${kujaPoints} Bindus in Kuja's Ashtakavarga gives you immense courage, stamina, and drive. You are an action-oriented leader who excels under pressure and handles competition with ease. Your ability to execute projects with focus and determination is exceptional. Your physical energy and passion are keys to your success.`
                    : kujaPoints >= 3
                    ? `Dear ${data.name}, with a balanced ${kujaPoints} Bindus in Kuja's Ashtakavarga, your energy levels and courage are well-moderated. You possess enough ambition and drive to achieve your goals, but you also know when to hold back and avoid unnecessary conflicts. This helps you maintain long-term stamina without burning out or initiating impulsive disputes.`
                    : `Dear ${data.name}, your score of ${kujaPoints} Bindus in Kuja's Ashtakavarga is challenging, which may manifest as low energy, lack of initiative, or a tendency to get frustrated easily. You might find it hard to stand up for yourself or assert your boundaries. Engaging in regular physical exercise, chanting the Mangal Mantra, and practicing patience will help direct your Martian energy constructively.`}
                </p>
              </div>

              {/* Budha Prediction Card */}
              <div className={cn("border rounded-xl p-3 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
                <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                  <span>{t("Budha (Mercury) Ashtakavarga Predictions")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">
                    Natal Sign: {SANSKRIT_SIGNS[mercurySignIdx]} · Score: {budhaPoints} Bindus ({budhaPoints >= 5 ? "Strong" : budhaPoints >= 3 ? "Balanced" : "Challenging"})
                  </span>
                </h4>
                <p className="text-[11px] text-gray-655 leading-relaxed mt-1.5 text-justify">
                  {budhaPoints >= 5
                    ? `Dear ${data.name}, an outstanding score of ${budhaPoints} Bindus in Budha's Ashtakavarga highlights your highly refined intellect and analytical mind. You possess excellent communication skills, sharp wit, and a natural aptitude for business, writing, or strategic planning. Your ability to learn new concepts rapidly and articulate them persuasively is a stellar gift.`
                    : budhaPoints >= 3
                    ? `Dear ${data.name}, with a healthy score of ${budhaPoints} Bindus in Budha's Ashtakavarga, your communication and logical capacities are steady and balanced. You are a sensible thinker who makes rational, practical decisions. Your speech is pleasant, and your social interactions are cordial. This balance supports stable professional communication and sound financial management.`
                    : `Dear ${data.name}, with ${budhaPoints} Bindus in Budha's Ashtakavarga, you might experience occasional communication gaps, mental fatigue, or difficulty in making decisions. There may be a tendency to overthink or struggle with linear logic. Maintaining clear written records, avoiding gossip, and learning to simplify your thoughts will assist in sharpening your Mercury's potential.`}
                </p>
              </div>

              {/* Guru Prediction Card */}
              <div className={cn("border rounded-xl p-3 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
                <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                  <span>{t("Guru (Jupiter) Ashtakavarga Predictions")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">
                    Natal Sign: {SANSKRIT_SIGNS[jupiterSignIdx]} · Score: {guruPoints} Bindus ({guruPoints >= 5 ? "Strong" : guruPoints >= 3 ? "Balanced" : "Challenging"})
                  </span>
                </h4>
                <p className="text-[11px] text-gray-655 leading-relaxed mt-1.5 text-justify">
                  {guruPoints >= 5
                    ? `Dear ${data.name}, your exceptional score of ${guruPoints} Bindus in Guru's Ashtakavarga brings immense divine grace, wisdom, and fortune into your life. You have a philosophical outlook, high moral values, and a natural desire for higher learning and spiritual growth. This strong energy attracts prosperity, excellent mentors, and opportunities for expand-ability.`
                    : guruPoints >= 3
                    ? `Dear ${data.name}, with a balanced ${guruPoints} Bindus in Guru's Ashtakavarga, you possess a solid, practical sense of wisdom and standard level of luck. You value ethics and learning, seeking to apply them in your everyday life. This provides a steady guide for making mature choices in career, finance, and relationships.`
                    : `Dear ${data.name}, a lower score of ${guruPoints} Bindus in Guru's Ashtakavarga suggests that divine guidance and good fortune might feel delayed at times. You may face challenges regarding higher education, spiritual clarity, or financial growth. Honoring teachers, donating to spiritual or educational causes, and practicing gratitude will help open up your Jupiterian blessings.`}
                </p>
              </div>

              {/* Shukra Prediction Card */}
              <div className={cn("border rounded-xl p-3 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
                <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                  <span>{t("Shukra (Venus) Ashtakavarga Predictions")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">
                    Natal Sign: {SANSKRIT_SIGNS[venusSignIdx]} · Score: {shukraPoints} Bindus ({shukraPoints >= 5 ? "Strong" : shukraPoints >= 3 ? "Balanced" : "Challenging"})
                  </span>
                </h4>
                <p className="text-[11px] text-gray-655 leading-relaxed mt-1.5 text-justify">
                  {shukraPoints >= 5
                    ? `Dear ${data.name}, a wonderful score of ${shukraPoints} Bindus in Shukra's Ashtakavarga indicates a highly refined aesthetic sense, charisma, and a natural capacity for love and luxury. You attract harmonious relationships, artistic appreciation, and comfort easily. Your social presence is pleasant, and you possess a deep appreciation for beauty, music, and fine living.`
                    : shukraPoints >= 3
                    ? `Dear ${data.name}, with a balanced score of ${shukraPoints} Bindus in Shukra's Ashtakavarga, your relationships and material desires are well-regulated. You appreciate comforts and seek pleasant partnerships, but you do not get overly attached to materialistic pursuits or superficial beauty. This balance ensures stable relationship dynamics and financial prudence.`
                    : `Dear ${data.name}, your score of ${shukraPoints} Bindus in Shukra's Ashtakavarga is on the lower side, which can sometimes bring relationship hurdles, creative blocks, or dissatisfaction with material comforts. You might struggle to find emotional fulfillment or harmony in partnerships. Cultivating self-love, practicing relationship boundary-setting, and honoring women will steady your Venusian energy.`}
                </p>
              </div>

              {/* Shani Prediction Card */}
              <div className={cn("border rounded-xl p-3 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
                <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                  <span>{t("Shani (Saturn) Ashtakavarga Predictions")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">
                    Natal Sign: {SANSKRIT_SIGNS[saturnSignIdx]} · Score: {shaniPoints} Bindus ({shaniPoints >= 5 ? "Strong" : shaniPoints >= 3 ? "Balanced" : "Challenging"})
                  </span>
                </h4>
                <p className="text-[11px] text-gray-655 leading-relaxed mt-1.5 text-justify">
                  {shaniPoints >= 5
                    ? `Dear ${data.name}, with a high score of ${shaniPoints} Bindus in Shani's Ashtakavarga, you are blessed with incredible discipline, patience, and endurance. You have a strong sense of duty and the ability to work tirelessly toward your long-term goals. While success might come with effort, it will be highly durable and well-deserved. You can weather any life storm with stoicism.`
                    : shaniPoints >= 3
                    ? `Dear ${data.name}, a balanced score of ${shaniPoints} Bindus in Shani's Ashtakavarga indicates that your capacity for hard work and responsibility is well-proportioned. You are neither lazy nor an extreme workaholic. You handle structural duties, chores, and boundaries with a sensible attitude, leading to stable growth and a highly structured life routine.`
                    : `Dear ${data.name}, with ${shaniPoints} Bindus in Shani's Ashtakavarga, you might sometimes feel overwhelmed by responsibilities, experience delays, or struggle with discipline and consistency. Impatience or fear of limitations might slow your progress. Developing structured routines, engaging in selfless service (Seva), and cultivating perseverance will help you transform these Saturnian trials into strengths.`}
                </p>
              </div>

              {/* Sarvashtakavarga Prediction Card */}
              <div className={cn("border rounded-xl p-3.5 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
                <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                  <span>{t("Sarvashtakavarga Predictions & Composite Score")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">
                    Natal Moon Sign: {rashiName} · Total Score: {sarvaPoints} Bindus
                  </span>
                </h4>
                <div className="text-[11px] text-gray-600 leading-relaxed mt-2 space-y-2 text-justify">
                  <p>
                    The proliferation of maximum bindus in your chart appears in Simha to Vrischika, signifying that the years of your youth and mature middle age will be highly active and prosperous. Your career path will take off to unexpected heights. Academic and personal aspirations will get a head start during this stage of life, and happiness and prosperity will seem to be at their peak. Destiny will protect you from the worries of severe professional stagnation, and domestic bliss will also come seeking you.
                  </p>
                  <p>
                    At the age corresponding to the figures in the signs occupied by Jupiter, Venus, and Mercury, your fortune turns for the better. Your educational ambitions will materialize and you could acquire that coveted seat for higher learning or achieve professional mastery. Your future looks set to take off on the path to wealth, recognition, and fame for your professional accomplishments. Marital togetherness will bring much joy and your progeny will be blessed. In your case, these special turning points occur at your <span className="font-bold text-[#722f37]">{jupAge}</span>, <span className="font-bold text-[#722f37]">{venAge}</span>, and <span className="font-bold text-[#722f37]">{merAge}</span> years of age.
                  </p>
                  <p>
                    In your horoscope, the Lagna (1st house) has <span className="font-bold text-[#722f37]">{lagnaSarva}</span> bindus, the 9th house of fortune has <span className="font-bold text-[#722f37]">{h9Sarva}</span> bindus, the 10th house of career has <span className="font-bold text-[#722f37]">{h10Sarva}</span> bindus, and the 11th house of gains has <span className="font-bold text-[#722f37]">{h11Sarva}</span> bindus. Since these crucial houses have 30 or less number of bindus, it indicates that wealth creation will require steady, disciplined effort, and a calm mind is essential to prevent stress from affecting your physical health. Take charge of your life with confidence, avoid the pitfalls of negative thoughts, and overcome any obstacles through persistent actions.
                  </p>
                </div>
              </div>
            </div>
          </ReportPage>
        </>
      )}
      {/* ─── PAGE 16: REMEDIES ─── */}
      {/* ─── PAGE 16: REMEDIES ─── */}
      {exportMode ? (
        <>
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Vedic Remedies" exportMode={exportMode}>
            <SectionDivider language={language}
              title="Cosmic Remedies & Protection Rituals"
              subtitle="Vedic spiritual guides to balance planetary transits and invite absolute grace"
            />
            {activePeriodText && (
              <div className="flex justify-center mb-4">
                <span className="px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest border rounded-full shadow-sm text-center bg-gray-100 border-gray-300 text-gray-700">
                  🎯 Active Period to Follow: {activePeriodText}
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 items-start my-auto">
              <div className="space-y-3">
                <RemedyBox language={language}
                  remedyType="Sacred Gemstone Therapy"
                  description={`Wearing the sacred gemstone of your ${currentMaha ? `current dasha lord ${currentMaha}` : `chart support planet ${remedyPlanet}`} during ${currentDashaLucky.day} activates positive solar aspects, enhances mental clarity, and dissolves professional blocks.`}
                  mantra={currentDashaLucky.mantra}
                />
                <RemedyBox language={language}
                  remedyType="Charitable Practices (Daan)"
                  description={`On Saturday mornings and Tuesdays, donate dark colored clothes, seeds, and oils to labor workers or underprivileged families. This dissolves past-life karmic burdens immediately.`}
                />
              </div>
              <div className="space-y-3">
                {/* Cosmic Signature Card */}
                <div className={cn(
                  "border rounded-xl p-4 font-serif relative overflow-hidden",
                  exportMode
                    ? "border-gray-300 bg-white"
                    : "border-[#d7b96a]/45 bg-gradient-to-br from-[#fffdf7] via-[#fff8ec] to-[#f7ecd9] shadow-[0_10px_28px_rgba(93,63,28,0.06)]"
                )}>
                  <h4 className={cn(
                    "font-bold text-[12.5px] pb-1.5 border-b mb-3 flex items-center gap-1.5 tracking-wider uppercase",
                    exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20"
                  )}>
                    <span className="text-[#9a6a24]">✦</span> Cosmic Alignment Coordinates
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[11px] leading-relaxed">
                    <div className="flex flex-col border-b border-[#b59449]/10 pb-1">
                      <span className="font-extrabold text-[#9a6a24] text-[9.5px] uppercase tracking-wider">Auspicious Colors</span>
                      <span className="text-gray-700 font-medium">{currentDashaLucky.colors}</span>
                    </div>
                    <div className="flex flex-col border-b border-[#b59449]/10 pb-1">
                      <span className="font-extrabold text-[#9a6a24] text-[9.5px] uppercase tracking-wider">Lucky Numbers</span>
                      <span className="text-gray-700 font-medium">{currentDashaLucky.numbers}</span>
                    </div>
                    <div className="flex flex-col border-b border-[#b59449]/10 pb-1">
                      <span className="font-extrabold text-[#9a6a24] text-[9.5px] uppercase tracking-wider">Recommended Gem</span>
                      <span className="text-gray-700 font-medium">{currentDashaLucky.gem}</span>
                    </div>
                    <div className="flex flex-col border-b border-[#b59449]/10 pb-1">
                      <span className="font-extrabold text-[#9a6a24] text-[9.5px] uppercase tracking-wider">Metal Affinity</span>
                      <span className="text-gray-700 font-medium">{currentDashaLucky.metal}</span>
                    </div>
                    <div className="flex flex-col border-b border-[#b59449]/10 pb-1">
                      <span className="font-extrabold text-[#9a6a24] text-[9.5px] uppercase tracking-wider">Day of Power</span>
                      <span className="text-gray-700 font-medium">{currentDashaLucky.day}</span>
                    </div>
                    <div className="flex flex-col border-b border-[#b59449]/10 pb-1">
                      <span className="font-extrabold text-[#9a6a24] text-[9.5px] uppercase tracking-wider">Sacred Rudraksha</span>
                      <span className="text-gray-700 font-medium">{currentDashaLucky.rudraksha}</span>
                    </div>
                    <div className="col-span-2 flex flex-col border-b border-[#b59449]/10 pb-1">
                      <span className="font-extrabold text-[#9a6a24] text-[9.5px] uppercase tracking-wider">Daily Offerings (Daan)</span>
                      <span className="text-gray-755 font-medium text-justify">{currentDashaLucky.offerings}</span>
                    </div>
                    <div className="col-span-2 flex flex-col">
                      <span className="font-extrabold text-[#7b2d36] text-[9.5px] uppercase tracking-wider">✗ Karmic Actions to Avoid</span>
                      <span className="text-gray-755 font-medium text-justify">{currentDashaLucky.avoid}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ReportPage>
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="Vedic Remedies Continued" exportMode={exportMode}>
            <SectionDivider language={language}
              title="Cosmic Remedies & Protection Rituals (Continued)"
              subtitle="Deity alignments, planetary adjustments, and gemstone configuration guides"
            />
            <div className="grid grid-cols-2 gap-4 items-start my-auto">
              <div className="space-y-3">
                <RemedyBox language={language}
                  remedyType="Deity Alignment Rituals"
                  description="Recite the Hanuman Chalisa on Saturday and Tuesday evenings. Shani Dev promised Lord Hanuman that those who worship Hanuman with absolute devotion shall be protected from planetary transits obstacles."
                />
              </div>
              <div className="space-y-3">
                {/* Sacred Gemstone & Rudraksha Guidance */}
                <div className={cn(
                  "border rounded-xl p-4 font-serif relative overflow-hidden",
                  exportMode
                    ? "border-gray-300 bg-white text-[#1e293b] shadow-none"
                    : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm"
                )}>
                  <h4 className={cn(
                    "font-bold text-[12px] pb-1.5 border-b mb-2.5 flex items-center gap-1.5 tracking-wider uppercase",
                    exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#1b2d45] border-[#d7b96a]/20"
                  )}>
                    <span className="text-[#9a6a24]">✦</span> Gemstone & Rudraksha Guidance
                  </h4>
                  <p className="text-[10.5px] text-justify leading-[1.6] text-gray-700 mb-2">
                    For your chart's active support energy, wearing a natural, eye-clean <span className="font-bold text-[#722f37]">{currentDashaLucky.gem}</span> of 4-6 carats in a <span className="font-bold text-[#722f37]">{currentDashaLucky.metal.toLowerCase()}</span> ring is highly recommended. It should be worn on your designated finger on a <span className="font-bold text-[#722f37]">{currentDashaLucky.day}</span> morning during Shukla Paksha for maximum effect.
                  </p>
                  <p className="text-[10.5px] text-justify leading-[1.6] text-gray-700">
                    Additionally, your birth chart indicates wearing a sacred <span className="font-bold text-[#722f37]">{currentDashaLucky.rudraksha}</span> bead. Energize this divine bead on a Monday morning with Shiva mantras, and wear it on a red silk thread or silver chain to dissolve transit constraints.
                  </p>
                </div>
              </div>
            </div>
          </ReportPage>
        </>
      ) : (
        <ReportPage language={language} pageNumber={pNum++} sectionTitle="Vedic Remedies" exportMode={exportMode}>
          <SectionDivider language={language}
            title="Cosmic Remedies & Protection Rituals"
            subtitle="Vedic spiritual guides to balance planetary transits and invite absolute grace"
          />

          {activePeriodText && (
            <div className="flex justify-center mb-2">
              <span className={cn(
                "px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest border rounded-full shadow-sm text-center",
                exportMode
                  ? "bg-gray-100 border-gray-300 text-gray-700"
                  : "bg-[#7b2d36]/90 border-[#d7b96a] text-yellow-100 shadow-[0_4px_12px_rgba(123,45,54,0.15)]"
              )}>
                🎯 Active Period to Follow: {activePeriodText}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 items-start my-auto">
            {/* Left Column: Reusable Remedy Boxes */}
            <div className="space-y-3">
              <RemedyBox language={language}
                remedyType="Sacred Gemstone Therapy"
                description={`Wearing the sacred gemstone of your ${currentMaha ? `current dasha lord ${currentMaha}` : `chart support planet ${remedyPlanet}`} during ${currentDashaLucky.day} activates positive solar aspects, enhances mental clarity, and dissolves professional blocks.`}
                mantra={currentDashaLucky.mantra}
              />
              <RemedyBox language={language}
                remedyType="Charitable Practices (Daan)"
                description={`On Saturday mornings and Tuesdays, donate dark colored clothes, seeds, and oils to labor workers or underprivileged families. This dissolves past-life karmic burdens immediately.`}
              />
              <RemedyBox language={language}
                remedyType="Deity Alignment Rituals"
                description="Recite the Hanuman Chalisa on Saturday and Tuesday evenings. Shani Dev promised Lord Hanuman that those who worship Hanuman with absolute devotion shall be protected from planetary transits obstacles."
              />
            </div>

            {/* Right Column: Lucky Elements & Gemstone/Rudraksha Grid */}
            <div className="space-y-3">
              {/* Cosmic Signature Card */}
              <div className={cn(
                "border rounded-xl p-4 font-serif relative overflow-hidden",
                exportMode
                  ? "border-gray-300 bg-white"
                  : "border-[#d7b96a]/45 bg-gradient-to-br from-[#fffdf7] via-[#fff8ec] to-[#f7ecd9] shadow-[0_10px_28px_rgba(93,63,28,0.06)]"
              )}>
                <h4 className={cn(
                  "font-bold text-[12.5px] pb-1.5 border-b mb-3 flex items-center gap-1.5 tracking-wider uppercase",
                  exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20"
                )}>
                  <span className="text-[#9a6a24]">✦</span> Cosmic Alignment Coordinates
                </h4>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[11px] leading-relaxed">
                  <div className="flex flex-col border-b border-[#b59449]/10 pb-1">
                    <span className="font-extrabold text-[#9a6a24] text-[9.5px] uppercase tracking-wider">Auspicious Colors</span>
                    <span className="text-gray-700 font-medium">{currentDashaLucky.colors}</span>
                  </div>
                  <div className="flex flex-col border-b border-[#b59449]/10 pb-1">
                    <span className="font-extrabold text-[#9a6a24] text-[9.5px] uppercase tracking-wider">Lucky Numbers</span>
                    <span className="text-gray-700 font-medium">{currentDashaLucky.numbers}</span>
                  </div>
                  <div className="flex flex-col border-b border-[#b59449]/10 pb-1">
                    <span className="font-extrabold text-[#9a6a24] text-[9.5px] uppercase tracking-wider">Recommended Gem</span>
                    <span className="text-gray-700 font-medium">{currentDashaLucky.gem}</span>
                  </div>
                  <div className="flex flex-col border-b border-[#b59449]/10 pb-1">
                    <span className="font-extrabold text-[#9a6a24] text-[9.5px] uppercase tracking-wider">Metal Affinity</span>
                    <span className="text-gray-700 font-medium">{currentDashaLucky.metal}</span>
                  </div>
                  <div className="flex flex-col border-b border-[#b59449]/10 pb-1">
                    <span className="font-extrabold text-[#9a6a24] text-[9.5px] uppercase tracking-wider">Day of Power</span>
                    <span className="text-gray-700 font-medium">{currentDashaLucky.day}</span>
                  </div>
                  <div className="flex flex-col border-b border-[#b59449]/10 pb-1">
                    <span className="font-extrabold text-[#9a6a24] text-[9.5px] uppercase tracking-wider">Sacred Rudraksha</span>
                    <span className="text-gray-700 font-medium">{currentDashaLucky.rudraksha}</span>
                  </div>
                  <div className="col-span-2 flex flex-col border-b border-[#b59449]/10 pb-1">
                    <span className="font-extrabold text-[#9a6a24] text-[9.5px] uppercase tracking-wider">Daily Offerings (Daan)</span>
                    <span className="text-gray-750 font-medium text-justify">{currentDashaLucky.offerings}</span>
                  </div>
                  <div className="col-span-2 flex flex-col">
                    <span className="font-extrabold text-[#7b2d36] text-[9.5px] uppercase tracking-wider">✗ Karmic Actions to Avoid</span>
                    <span className="text-gray-750 font-medium text-justify">{currentDashaLucky.avoid}</span>
                  </div>
                </div>
              </div>

              {/* Sacred Gemstone & Rudraksha Guidance */}
              <div className={cn(
                "border rounded-xl p-4 font-serif relative overflow-hidden",
                exportMode
                  ? "border-gray-300 bg-white text-[#1e293b] shadow-none"
                  : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm"
              )}>
                <h4 className={cn(
                  "font-bold text-[12px] pb-1.5 border-b mb-2.5 flex items-center gap-1.5 tracking-wider uppercase",
                  exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#1b2d45] border-[#d7b96a]/20"
                )}>
                  <span className="text-[#9a6a24]">✦</span> Gemstone & Rudraksha Guidance
                </h4>
                <p className="text-[10.5px] text-justify leading-[1.6] text-gray-700 mb-2">
                  For your chart's active support energy, wearing a natural, eye-clean <span className="font-bold text-[#722f37]">{currentDashaLucky.gem}</span> of 4-6 carats in a <span className="font-bold text-[#722f37]">{currentDashaLucky.metal.toLowerCase()}</span> ring is highly recommended. It should be worn on your designated finger on a <span className="font-bold text-[#722f37]">{currentDashaLucky.day}</span> morning during Shukla Paksha for maximum effect.
                </p>
                <p className="text-[10.5px] text-justify leading-[1.6] text-gray-700">
                  Additionally, your birth chart indicates wearing a sacred <span className="font-bold text-[#722f37]">{currentDashaLucky.rudraksha}</span> bead. Energize this divine bead on a Monday morning with Shiva mantras, and wear it on a red silk thread or silver chain to dissolve transit constraints.
                </p>
              </div>
            </div>
          </div>
        </ReportPage>
      )}

      {/* ─── PAGE 17: 5-YEAR TRANSIT ROADMAP PART 1 (DETAILED ONLY) ─── */}
      {/* ─── PAGE 17: 5-YEAR TRANSIT ROADMAP PART 1 (DETAILED ONLY) ─── */}
      {data.plan === "detailed" && (
        exportMode ? (
          <>
            {/* Page 1: Saturn Transits */}
            <ReportPage language={language} pageNumber={pNum++} sectionTitle="5-Year Transit Roadmap - Saturn" exportMode={exportMode}>
              <SectionDivider language={language}
                title="5-Year Planetary Transit Roadmap (Saturn)"
                subtitle="Long-range planetary transits of Shani Dev (Saturn) through 2031"
              />
              <p className="text-[11px] text-justify leading-relaxed text-gray-700 italic mb-2.5 max-w-[660px] mx-auto text-center font-serif">
                Transit forecasts are based on the comparison of transiting planetary positions with your natal chart. Shani (Saturn) represents the primary forces of professional structures, career expansion, and karmic learning. Dear <span className="font-bold text-[#722f37]">{data.name}</span>, your custom 5-year transit roadmap is detailed below.
              </p>
              <div className="space-y-3.5 my-auto">
                <h3 className="text-[#722f37] font-serif font-bold text-[13px] border-b border-[#d7b96a]/20 pb-0.5 uppercase tracking-wider">
                  Transit of Shani Dev (Saturn) — 2.5 Years per Sign
                </h3>

                <div className="border rounded-xl p-3.5 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                  <h4 className="font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                    <span>{t("Shani transits Meena Rashi (Pisces)")}</span>
                    <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2025 to 2028</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                    Dear {data.name}, during this transit, Shani lights up your house of professional structures and career focus. This period demands exceptional discipline, patience, and resolving old karmic debts. Focus heavily on expanding your core skill sets and consolidating your daily working routines.
                  </p>
                </div>

                <div className="border rounded-xl p-3.5 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                  <h4 className="font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                    <span>{t("Shani transits Mesha Rashi (Aries)  Debilitated")}</span>
                    <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2028 to 2030</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                    Dear {data.name}, Saturn transits its sign of debilitation, testing your inner courage, drive, and administrative stamina. Strive to stay calm, avoid head-on professional conflicts, and build solid professional foundations through steady, persistent labor rather than impulsive initiatives.
                  </p>
                </div>

                <div className="border rounded-xl p-3.5 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                  <h4 className="font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                    <span>{t("Shani transits Vrishabha Rashi (Taurus)  Friendly Sign")}</span>
                    <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2030 to 2033</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                    Dear {data.name}, this friendly transit lights up your house of speech, accumulated reserves, and domestic assets. A highly productive phase for making long-term financial budgets, purchasing property, and establishing stable domestic routines.
                  </p>
                </div>
              </div>
            </ReportPage>

            {/* Page 2: Jupiter Transits */}
            <ReportPage language={language} pageNumber={pNum++} sectionTitle="5-Year Transit Roadmap - Jupiter" exportMode={exportMode}>
              <SectionDivider language={language}
                title="5-Year Planetary Transit Roadmap (Jupiter)"
                subtitle="Long-range planetary transits of Guru Dev (Jupiter) through 2031"
              />
              <p className="text-[11px] text-justify leading-relaxed text-gray-700 italic mb-2.5 max-w-[660px] mx-auto text-center font-serif">
                Guru (Jupiter) represents professional expansion, wisdom, financial fortune, and higher achievements. Dear <span className="font-bold text-[#722f37]">{data.name}</span>, your custom Guru transit roadmap is detailed below.
              </p>
              <div className="space-y-3.5 my-auto">
                <h3 className="text-[#722f37] font-serif font-bold text-[13px] border-b border-[#d7b96a]/20 pb-0.5 uppercase tracking-wider">
                  Transit of Guru Dev (Jupiter) — 1 Year per Sign
                </h3>

                <div className="border rounded-xl p-3 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                  <h4 className="font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                    <span>{t("Guru transits Mithuna Rashi (Gemini)")}</span>
                    <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2026 to 2027</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                    Dear {data.name}, Jupiter transits the communicative sign of Gemini, boosting your intellect, professional networking, and speech. Analytical thinking, collaborative contracts, and educational aspirations receive a major cosmic head start.
                  </p>
                </div>

                <div className="border rounded-xl p-3 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                  <h4 className="font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                    <span>{t("Guru transits Karkata Rashi (Cancer)  Exalted")}</span>
                    <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2027 to 2028</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                    Dear {data.name}, this represents the peak of spiritual grace as Jupiter transits its sign of exaltation. You will experience absolute peace of mind, domestic bliss, purchase of long-awaited assets/vehicles, and exceptional support from maternal figures.
                  </p>
                </div>

                <div className="border rounded-xl p-3 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                  <h4 className="font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                    <span>{t("Guru transits Simha Rashi (Leo)")}</span>
                    <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2028 to 2029</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                    Dear {data.name}, this transit lights up your 5th house of creativity, children, and romance. Blessings from children are seen, your creative spark burns brightly, and higher analytical studies bring wealth and recognition.
                  </p>
                </div>

                <div className="border rounded-xl p-3 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                  <h4 className="font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                    <span>Guru transits Kanya Rashi (Virgo) & Tula Rashi (Libra)</span>
                    <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2029 to 2031</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                    Dear {data.name}, transiting Virgo resolves work obstacles and health issues through discipline. Following this, the transit through Tula (Libra) in 2030–2031 activates your house of partnerships, bringing marriage prospects, business expansions, and exceptional community fame.
                  </p>
                </div>
              </div>
            </ReportPage>

            {/* Page 3: Rahu & Ketu Transits */}
            <ReportPage language={language} pageNumber={pNum++} sectionTitle="5-Year Transit Roadmap - Rahu & Ketu" exportMode={exportMode}>
              <SectionDivider language={language}
                title="5-Year Planetary Transit Roadmap (Rahu & Ketu)"
                subtitle="Long-range shadow planetary transits of Rahu & Ketu through 2031"
              />
              <p className="text-[11px] text-justify leading-relaxed text-gray-700 italic mb-2.5 max-w-[660px] mx-auto text-center font-serif">
                Rahu and Ketu represent karmic catalysts, sudden changes, and spiritual transformations. Dear <span className="font-bold text-[#722f37]">{data.name}</span>, your custom shadow transit roadmap is detailed below.
              </p>
              <div className="space-y-3.5 my-auto">
                <h3 className="text-[#722f37] font-serif font-bold text-[13px] border-b border-[#d7b96a]/20 pb-0.5 uppercase tracking-wider">
                  Transit of Rahu & Ketu (Shadow Planets) — 1.5 Years per Sign
                </h3>

                <div className="border rounded-xl p-3.5 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                  <h4 className="font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                    <span>{t("Rahu in Kumbha & Ketu in Simha")}</span>
                    <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2026 to 2027</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                    Dear {data.name}, this transit brings sudden professional gains and network expansions. Strive to engage in spiritual charity and let go of ego attachments, as Ketu's placement triggers deep inner spiritual transformations.
                  </p>
                </div>

                <div className="border rounded-xl p-3.5 font-serif relative overflow-hidden border-gray-200 bg-white shadow-sm">
                  <h4 className="font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2 text-[#7b2d36] border-gray-200">
                    <span>{t("Rahu in Makara & Ketu in Karka & Dhanu/Mithuna")}</span>
                    <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2027 to 2031</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                    Dear {data.name}, Rahu in Makara boosts your career ambitions and social status, while Ketu in Cancer demands domestic emotional grounding. From 2029 onwards, Rahu's entry into Dhanu sparks profound intellectual breakthroughs and philosophical travels.
                  </p>
                </div>
              </div>
            </ReportPage>
          </>
        ) : (
          <ReportPage language={language} pageNumber={pNum++} sectionTitle="5-Year Transit Roadmap Part 1" exportMode={exportMode}>
            <SectionDivider language={language}
              title="5-Year Planetary Transit Roadmap (Part 1)"
              subtitle="Long-range planetary transits of Shani Dev (Saturn) & Guru Dev (Jupiter) through 2031"
            />

            <div className="space-y-3.5 my-auto">
              <p className="text-[11px] text-justify leading-relaxed text-gray-700 italic mb-2.5 max-w-[660px] mx-auto text-center font-serif">
                Transit forecasts are based on the comparison of transiting planetary positions with your natal chart. Shani (Saturn) and Guru (Jupiter) represent the primary forces of professional structures, career expansion, and karmic learning. Dear <span className="font-bold text-[#722f37]">{data.name}</span>, your custom 5-year transit roadmap is detailed below.
              </p>

              <h3 className="text-[#722f37] font-serif font-bold text-[13px] border-b border-[#d7b96a]/20 pb-0.5 uppercase tracking-wider">
                Transit of Shani Dev (Saturn) — 2.5 Years per Sign
              </h3>

              <div className={cn("border rounded-xl p-3.5 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
                <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                  <span>{t("Shani transits Meena Rashi (Pisces)")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2025 to 2028</span>
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                  Dear {data.name}, during this transit, Shani lights up your house of professional structures and career focus. This period demands exceptional discipline, patience, and resolving old karmic debts. Focus heavily on expanding your core skill sets and consolidating your daily working routines.
                </p>
              </div>

              <div className={cn("border rounded-xl p-3.5 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
                <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                  <span>{t("Shani transits Mesha Rashi (Aries)  Debilitated")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2028 to 2030</span>
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                  Dear {data.name}, Saturn transits its sign of debilitation, testing your inner courage, drive, and administrative stamina. Strive to stay calm, avoid head-on professional conflicts, and build solid professional foundations through steady, persistent labor rather than impulsive initiatives.
                </p>
              </div>

              <div className={cn("border rounded-xl p-3.5 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
                <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                  <span>{t("Shani transits Vrishabha Rashi (Taurus)  Friendly Sign")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2030 to 2033</span>
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                  Dear {data.name}, this friendly transit lights up your house of speech, accumulated reserves, and domestic assets. A highly productive phase for making long-term financial budgets, purchasing property, and establishing stable domestic routines.
                </p>
              </div>

              <h3 className="text-[#722f37] font-serif font-bold text-[13px] border-b border-[#d7b96a]/20 pb-0.5 uppercase tracking-wider mt-4">
                Transit of Guru Dev (Jupiter) — 1 Year per Sign
              </h3>

              <div className={cn("border rounded-xl p-3.5 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
                <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                  <span>{t("Guru transits Mithuna Rashi (Gemini)")}</span>
                  <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2026 to 2027</span>
                </h4>
                <p className="text-[11px] text-gray-655 leading-relaxed mt-1.5 text-justify">
                  Dear {data.name}, Jupiter transits the communicative sign of Gemini, boosting your intellect, professional networking, and speech. Analytical thinking, collaborative contracts, and educational aspirations receive a major cosmic head start.
                </p>
              </div>
            </div>
          </ReportPage>
        )
      )}
      {/* ─── PAGE 18: 5-YEAR TRANSIT ROADMAP PART 2 (DETAILED ONLY) ─── */}
      {/* ─── PAGE 18: 5-YEAR TRANSIT ROADMAP PART 2 (DETAILED ONLY) ─── */}
      {data.plan === "detailed" && !exportMode && (
      <ReportPage language={language} pageNumber={pNum++} sectionTitle="5-Year Transit Roadmap Part 2" exportMode={exportMode}>
          <SectionDivider language={language}
            title="5-Year Planetary Transit Roadmap (Part 2)"
            subtitle="Long-range planetary transits of Guru Dev (Jupiter) continued & Rahu/Ketu through 2031"
          />

          <div className="space-y-3.5 my-auto">
            <h3 className="text-[#722f37] font-serif font-bold text-[13px] border-b border-[#d7b96a]/20 pb-0.5 uppercase tracking-wider">
              Transit of Guru Dev (Jupiter) Continued
            </h3>

            <div className={cn("border rounded-xl p-3 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
              <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                <span>{t("Guru transits Karkata Rashi (Cancer)  Exalted")}</span>
                <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2027 to 2028</span>
              </h4>
              <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                Dear {data.name}, this represents the peak of spiritual grace as Jupiter transits its sign of exaltation. You will experience absolute peace of mind, domestic bliss, purchase of long-awaited assets/vehicles, and exceptional support from maternal figures.
              </p>
            </div>

            <div className={cn("border rounded-xl p-3 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
              <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                <span>{t("Guru transits Simha Rashi (Leo)")}</span>
                <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2028 to 2029</span>
              </h4>
              <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                Dear {data.name}, this transit lights up your 5th house of creativity, children, and romance. Blessings from children are seen, your creative spark burns brightly, and higher analytical studies bring wealth and recognition.
              </p>
            </div>

            <div className={cn("border rounded-xl p-3 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
              <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                <span>Guru transits Kanya Rashi (Virgo) & Tula Rashi (Libra)</span>
                <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2029 to 2031</span>
              </h4>
              <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                Dear {data.name}, transiting Virgo resolves work obstacles and health issues through discipline. Following this, the transit through Tula (Libra) in 2030–2031 activates your house of partnerships, bringing marriage prospects, business expansions, and exceptional community fame.
              </p>
            </div>

            <h3 className="text-[#722f37] font-serif font-bold text-[13px] border-b border-[#d7b96a]/20 pb-0.5 uppercase tracking-wider mt-4">
              Transit of Rahu & Ketu (Shadow Planets) — 1.5 Years per Sign
            </h3>

            <div className={cn("border rounded-xl p-3 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
              <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                <span>{t("Rahu in Kumbha & Ketu in Simha")}</span>
                <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2026 to 2027</span>
              </h4>
              <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                Dear {data.name}, this transit brings sudden professional gains and network expansions. Strive to engage in spiritual charity and let go of ego attachments, as Ketu's placement triggers deep inner spiritual transformations.
              </p>
            </div>

            <div className={cn("border rounded-xl p-3 font-serif relative overflow-hidden", exportMode ? "border-gray-200 bg-white" : "border-[#d7b96a]/45 bg-[#fffef9] shadow-sm")}>
              <h4 className={cn("font-bold text-[12.5px] pb-1 border-b flex justify-between items-baseline flex-wrap gap-2", exportMode ? "text-[#7b2d36] border-gray-200" : "text-[#722f37] border-[#d7b96a]/20")}>
                <span>{t("Rahu in Makara & Ketu in Karka & Dhanu/Mithuna")}</span>
                <span className="text-[9.5px] text-muted-foreground font-normal italic">Period: 2027 to 2031</span>
              </h4>
              <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5 text-justify">
                Dear {data.name}, Rahu in Makara boosts your career ambitions and social status, while Ketu in Cancer demands domestic emotional grounding. From 2029 onwards, Rahu's entry into Dhanu sparks profound intellectual breakthroughs and philosophical travels.
              </p>
            </div>
          </div>
        </ReportPage>
      )}
      {/* ─── PAGE 19: DISCLAIMER ─── */}
      <ReportPage language={language} pageNumber={pNum++} sectionTitle="Disclaimer & Blessing" exportMode={exportMode}>
        <div className="h-full flex flex-col justify-between items-center text-center py-10 font-serif">
          <div className="text-[#b59449] text-5xl">ॐ</div>
          
          <h2 className="text-xl font-bold text-[#722f37] mt-4">
            Auspicious Vedic Blessing
          </h2>
          
          <p className="text-xs italic text-muted-foreground max-w-[500px] leading-relaxed mt-2">
            "May the divine stars and celestial bodies cast their most benevolent glance upon you. Approach your blueprint not with fear, but as a map of sacred opportunities, learning, and self-realization."
          </p>

          <div className="w-16 h-[2px] bg-[#b59449] my-6" />

          <div className="bg-[#fffef9] border border-[#b59449]/20 p-5 rounded-lg text-left max-w-[500px] shadow-sm">
            <h4 className="text-[10px] font-bold text-[#722f37] uppercase tracking-wider mb-2 text-center border-b border-[#b59449]/10 pb-1">
              Astrological Disclaimer
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed text-justify">
              Astrology is an ancient diagnostic tool and spiritual counseling framework based on astronomical coordinates at your birth. Predictions represent probabilities and cosmic potentials. This report does not substitute professional legal, financial, or medical advice. The ultimate agency and free will remain with the individual as they write their destiny.
            </p>
          </div>

          <div className="mt-8">
            <p className="text-[9px] uppercase tracking-widest text-[#722f37] font-bold">
              DIVINE PANCHANG astrology
            </p>
            <p className="text-[9px] text-[#b59449] mt-0.5 font-medium">
              www.divinepanchang.space · support@divinepanchang.space
            </p>
          </div>
        </div>
      </ReportPage>
    </div>
  );
};

export default KundaliReportTemplate;
