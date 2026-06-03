import React from "react";
import {
  RegionalChartStyle,
  getDignityMarker,
  getPlanetAbbreviation,
  getPlanetDignity,
} from "@/lib/astro/chartPresentation";

export interface KundliChartPlanet {
  name: string;
  lon: number;
  retrograde?: boolean;
  combust?: boolean;
}

interface KundliChartProps {
  lagnaIndex: number;
  planets: KundliChartPlanet[];
  title?: string;
  chartStyle?: RegionalChartStyle;
  language?: "en" | "kn";
}

const signNames = [
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

const normalizeDegrees = (value: number) => {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

const normalizeIndex = (value: number, size: number) => ((value % size) + size) % size;

const formatCompactDegree = (value: number) => {
  const normalized = normalizeDegrees(value);
  const signDegree = normalized % 30;
  const degrees = Math.floor(signDegree);
  const minutes = Math.floor((signDegree - degrees) * 60);
  return `${degrees}\u00B0${String(minutes).padStart(2, "0")}`;
};

const getStatusMarkers = (planet: KundliChartPlanet) => {
  const signIndex = Math.floor(normalizeDegrees(planet.lon) / 30);
  const dignityMarker = getDignityMarker(getPlanetDignity(planet.name, signIndex));
  return [planet.retrograde ? "*" : "", planet.combust ? "^" : "", dignityMarker].join("");
};

const getSouthChartLine = (planet: KundliChartPlanet, isKn?: boolean) => {
  const markers = getStatusMarkers(planet);
  const degree = Math.floor(normalizeDegrees(planet.lon) % 30);
  return `${getPlanetAbbreviation(planet.name, isKn)}${degree}°${markers ? ` ${markers}` : ""}`;
};

const getHousePlanets = (lagnaIndex: number, planets: KundliChartPlanet[]) => {
  const housePlanets: Record<number, KundliChartPlanet[]> = {};
  for (let house = 1; house <= 12; house += 1) housePlanets[house] = [];

  planets.forEach((planet) => {
    const signIndex = normalizeIndex(Math.floor(normalizeDegrees(planet.lon) / 30), 12);
    const houseIndex = normalizeIndex(signIndex - lagnaIndex, 12) + 1;
    housePlanets[houseIndex].push(planet);
  });

  return housePlanets;
};

const getSignPlanets = (planets: KundliChartPlanet[]) => {
  const signPlanets: Record<number, KundliChartPlanet[]> = {};
  for (let sign = 0; sign < 12; sign += 1) signPlanets[sign] = [];

  planets.forEach((planet) => {
    const signIndex = normalizeIndex(Math.floor(normalizeDegrees(planet.lon) / 30), 12);
    signPlanets[signIndex].push(planet);
  });

  return signPlanets;
};

const NorthChart = ({ lagnaIndex, planets, language }: { lagnaIndex: number; planets: KundliChartPlanet[]; language?: "en" | "kn" }) => {
  const housePlanets = getHousePlanets(lagnaIndex, planets);
  const isKn = language === "kn";

  // cx/cy: true geometric centroid of each house region (where planet text is centered)
  // numX/numY/numAnchor: outermost corner for house number — maximally far from planet cluster
  // Inner square intersections at (134,134), (366,134), (134,366), (366,366)
  const houseConfig = [
    { house: 1,  cx: 250, cy: 92,  numX: 250, numY: 30,  numAnchor: "middle" as const }, // top triangle
    { house: 2,  cx: 134, cy: 57,  numX: 30,  numY: 30,  numAnchor: "start"  as const }, // TL corner triangle
    { house: 3,  cx: 57,  cy: 134, numX: 28,  numY: 134, numAnchor: "start"  as const }, // left-upper triangle
    { house: 4,  cx: 134, cy: 250, numX: 28,  numY: 250, numAnchor: "start"  as const }, // left kite
    { house: 5,  cx: 57,  cy: 366, numX: 28,  numY: 366, numAnchor: "start"  as const }, // left-lower triangle
    { house: 6,  cx: 134, cy: 443, numX: 30,  numY: 470, numAnchor: "start"  as const }, // BL corner triangle
    { house: 7,  cx: 250, cy: 408, numX: 250, numY: 470, numAnchor: "middle" as const }, // bottom triangle
    { house: 8,  cx: 366, cy: 443, numX: 470, numY: 470, numAnchor: "end"    as const }, // BR corner triangle
    { house: 9,  cx: 443, cy: 366, numX: 472, numY: 366, numAnchor: "end"    as const }, // right-lower triangle
    { house: 10, cx: 366, cy: 250, numX: 472, numY: 250, numAnchor: "end"    as const }, // right kite
    { house: 11, cx: 443, cy: 134, numX: 472, numY: 134, numAnchor: "end"    as const }, // right-upper triangle
    { house: 12, cx: 366, cy: 57,  numX: 470, numY: 30,  numAnchor: "end"    as const }, // TR corner triangle
  ];

  return (
    <svg viewBox="0 0 500 500" className="h-full w-full" data-no-translate="true">
      <rect x="8" y="8" width="484" height="484" fill="none" stroke="#c8a35b" strokeWidth="1.5" />
      <rect x="18" y="18" width="464" height="464" fill="none" stroke="#604218" strokeWidth="2.5" />
      <line x1="18" y1="18" x2="482" y2="482" stroke="#604218" strokeWidth="1.8" />
      <line x1="482" y1="18" x2="18" y2="482" stroke="#604218" strokeWidth="1.8" />
      <line x1="250" y1="18" x2="18" y2="250" stroke="#604218" strokeWidth="1.8" />
      <line x1="18" y1="250" x2="250" y2="482" stroke="#604218" strokeWidth="1.8" />
      <line x1="250" y1="482" x2="482" y2="250" stroke="#604218" strokeWidth="1.8" />
      <line x1="482" y1="250" x2="250" y2="18" stroke="#604218" strokeWidth="1.8" />

      {houseConfig.map((config) => {
        // Sign number (1-12) displayed in this house cell
        // House N belongs to sign: (lagnaIndex + N - 1) mod 12, then +1 for 1-based
        const signNumber = (normalizeIndex(lagnaIndex + config.house - 1, 12)) + 1;
        const planetsInHouse = housePlanets[config.house];

        // Single-line compact layout: abbrev deg° markers — no overlap between degree & name
        const lineH = 11; // height of one planet line
        const gapH = 2;   // gap between multiple planets
        const blockH = planetsInHouse.length > 0
          ? planetsInHouse.length * lineH + (planetsInHouse.length - 1) * gapH
          : 0;
        const startY = config.cy - blockH / 2 + lineH;

        return (
          <g key={config.house}>
            {/* House sign number — pinned to outermost corner */}
            <text
              x={config.numX}
              y={config.numY}
              textAnchor={config.numAnchor}
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="600"
              fill="#b59449"
              className="select-none"
            >
              {signNumber}
            </text>

            {/* Planets: single compact line — abbrev + deg° + markers */}
            {planetsInHouse.map((planet, index) => {
              const deg = Math.floor(normalizeDegrees(planet.lon) % 30);
              const markers = getStatusMarkers(planet);
              const lineStr = `${getPlanetAbbreviation(planet.name, isKn)} ${deg}°${markers}`;
              const py = startY + index * (lineH + gapH);

              return (
                <text
                  key={`${config.house}-${planet.name}`}
                  x={config.cx}
                  y={py}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill="#342312"
                >
                  {lineStr}
                </text>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};

const SouthChart = ({ lagnaIndex, planets, language }: { lagnaIndex: number; planets: KundliChartPlanet[]; language?: "en" | "kn" }) => {
  const signPlanets = getSignPlanets(planets);
  const grid: (number | null)[][] = [
    [11, 0, 1, 2],
    [10, null, null, 3],
    [9, null, null, 4],
    [8, 7, 6, 5],
  ];

  return (
    <svg viewBox="0 0 500 500" className="h-full w-full" data-no-translate="true">
      <defs>
        <radialGradient id="south-center-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#d9c49a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#d9c49a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="8" y="8" width="484" height="484" rx="26" fill="none" stroke="#c8a35b" strokeWidth="1.5" />
      <rect x="18" y="18" width="464" height="464" rx="36" fill="#fffdf8" stroke="#604218" strokeWidth="2.5" />
      <rect x="134" y="134" width="232" height="232" fill="url(#south-center-glow)" />

      {[1, 2, 3].map((lineIndex) => (
        <g key={lineIndex}>
          <line
            x1={18 + lineIndex * 116}
            y1="18"
            x2={18 + lineIndex * 116}
            y2="482"
            stroke="#d9c49a"
            strokeWidth="1.5"
          />
          <line
            x1="18"
            y1={18 + lineIndex * 116}
            x2="482"
            y2={18 + lineIndex * 116}
            stroke="#d9c49a"
            strokeWidth="1.5"
          />
        </g>
      ))}

      <text x="250" y="250" textAnchor="middle" className="fill-[#b59449]/60 text-[13px] font-semibold tracking-[0.28em]">
        LAGNA CHART
      </text>

      {grid.flat().map((signIdx, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const x = 18 + col * 116;
        const y = 18 + row * 116;

        if (signIdx === null) {
          return <g key={`center-${index}`} />;
        }

        const isLagna = signIdx === lagnaIndex;
        const isKn = language === "kn";
        const entries = signPlanets[signIdx].slice(0, 4).map((p) => getSouthChartLine(p, isKn));
        const contentHeight = Math.max(entries.length - 1, 0) * 16;
        const startY = y + 56 + Math.max(0, (34 - contentHeight) / 2);

        return (
          <g key={`sign-${signIdx}`}>
            {isLagna && <rect x={x} y={y} width="116" height="116" fill="#f7efd9" opacity="0.92" />}

            <text x={x + 12} y={y + 20} className="fill-[#b59449] text-[11px] font-bold tracking-[0.18em]">
              {signNames[signIdx].slice(0, 3).toUpperCase()}
            </text>

            {isLagna && (
              <text x={x + 103} y={y + 16} textAnchor="end" className="fill-[#b59449] text-[9px] font-bold">
                As
              </text>
            )}

            {entries.map((line, idx) => (
              <text
                key={idx}
                x={x + 58}
                y={startY + idx * 16}
                textAnchor="middle"
                className="fill-[#342312] text-[11px] font-medium"
                fontSize="10"
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
};

export const KundliChart: React.FC<KundliChartProps> = ({
  lagnaIndex,
  planets,
  title,
  chartStyle = "north",
  language = "en",
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {title && (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#b59449]">{title}</p>
      )}
      <div className="w-full max-w-[360px] aspect-square">
        {chartStyle === "south" ? (
          <SouthChart lagnaIndex={lagnaIndex} planets={planets} language={language} />
        ) : (
          <NorthChart lagnaIndex={lagnaIndex} planets={planets} language={language} />
        )}
      </div>
    </div>
  );
};

export default KundliChart;
