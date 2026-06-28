// --- Constants ---
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

const SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

import { ChartType, getVargaPlanets, calculateDivisionalSign } from "./vargaEngine";
import { decimalToDMS, DMS } from "./planetFormatters";
import {
    getPlanetaryPositionsTropicalWithSpeed,
    getLahiriAyanamsha,
    getAscendantTropical
} from "./ephemeris";

// --- Planetary Positions Interface ---

const normalizeAngle = (deg: number) => {
    let a = deg % 360;
    if (a < 0) a += 360;
    return a;
};

export interface PlanetPosition {
    name: string;
    longitude: number; // Sidereal
    sign: string;
    degree: number; // Degree within sign
    house: number;
    nakshatra: string;
    pada: number;
    retrograde: boolean;
    combust: boolean;
    speed: number;
    dms: DMS;
}

// --- Nakshatra Data ---

export const getNakshatraData = (siderealLon: number) => {
    const span = 360 / 27;
    const index = Math.floor(siderealLon / span);
    const percent = (siderealLon - (index * span)) / span;
    const pada = Math.floor(percent * 4) + 1;

    const names = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra",
        "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
        "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
        "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
        "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ];

    return {
        name: names[index] || "Unknown",
        pada: pada
    };
};

// --- Ascendant ---

export const getAscendant = (date: Date, lat: number, lon: number): number => {
    const tropicalAsc = getAscendantTropical(date, lat, lon);
    const ayan = getLahiriAyanamsha(date);
    return normalizeAngle(tropicalAsc - ayan);
};

// --- Main Engine ---

export const getPlanetPositions = (date: Date, lat: number, lon: number): PlanetPosition[] => {
    // 1. Get Tropical Positions & Speeds (Precise)
    const tropicalData = getPlanetaryPositionsTropicalWithSpeed(date);

    // 2. Get Ayanamsha (Lahiri/Chitrapaksha)
    const ayan = getLahiriAyanamsha(date);

    // 3. Get Ascendant (Sidereal)
    const ascSidereal = getAscendant(date, lat, lon);
    const ascSignIdx = Math.floor(ascSidereal / 30);

    // Sun Sidereal for Combustion
    const sunSidereal = normalizeAngle(tropicalData["Sun"].lon - ayan);

    return Object.entries(tropicalData).map(([name, data]) => {
        // Sidereal Conversion
        const siderealLon = normalizeAngle(data.lon - ayan);
        const signIdx = Math.floor(siderealLon / 30);
        const degree = siderealLon % 30;

        // House Calculation (Whole Sign)
        // Sign Index of Ascendant defines House 1
        const houseIndex = (signIdx - ascSignIdx + 12) % 12;
        const house = houseIndex + 1;

        // Nakshatra
        const naks = getNakshatraData(siderealLon);

        // Retrograde: Instantaneous Speed < 0
        const retrograde = data.speed < 0;

        // Combustion Check (Vedic orbs relative to Sun)
        let limit = 0;
        switch (name) {
            case "Moon": limit = 12; break;
            case "Mars": limit = 17; break;
            case "Mercury": limit = retrograde ? 12 : 14; break;
            case "Jupiter": limit = 11; break;
            case "Venus": limit = retrograde ? 8 : 10; break;
            case "Saturn": limit = 15; break;
            default: limit = 0;
        }

        let combust = false;
        if (name !== "Sun" && name !== "Rahu" && name !== "Ketu") {
            let d = Math.abs(siderealLon - sunSidereal);
            if (d > 180) d = 360 - d;
            combust = d < limit;
        }

        return {
            name,
            longitude: siderealLon,
            sign: SIGNS[signIdx],
            degree,
            house,
            nakshatra: naks.name,
            pada: naks.pada,
            retrograde,
            combust,
            speed: data.speed,
            dms: decimalToDMS(degree)
        };
    });
};

export const mapPlanetsToHouses = (planets: PlanetPosition[]): Record<number, string[]> => {
    const houses: Record<number, string[]> = {};
    for (let i = 1; i <= 12; i++) houses[i] = [];

    planets.forEach(p => {
        houses[p.house].push(p.name);
    });

    return houses;
};

// --- Varga Helper ---

export const getDivisionalChartData = (
    chartType: ChartType,
    d1Planets: PlanetPosition[],
    d1Ascendant: number
): { planets: PlanetPosition[], lagnaSignIdx: number } => {

    const vargaPlanets = getVargaPlanets(d1Planets, chartType);

    const divisionMap: Record<string, number> = {
        "D1": 1, "D2": 2, "D7": 7, "D9": 9, "D10": 10,
        "D12": 12, "D24": 24, "D27": 27, "D60": 60
    };
    const div = divisionMap[chartType] || 1;
    const newAscSignNum = calculateDivisionalSign(d1Ascendant, div, chartType);
    const lagnaSignIdx = newAscSignNum - 1;

    const finalPlanets = vargaPlanets.map(p => {
        const planetSignIdx = SIGNS.indexOf(p.sign);
        const house = ((planetSignIdx - lagnaSignIdx + 12) % 12) + 1;
        return { ...p, house };
    });

    return { planets: finalPlanets, lagnaSignIdx };
};

// Placeholders
export const getPlanetStrength = (planetPos: PlanetPosition) => "";
export const getHouseThemes = (houseNum: number) => "";
export const getYogaCombinations = (planets: PlanetPosition[]) => [];
export const getKarmicPatterns = (planets: PlanetPosition[]) => "";
