import { calculateDivisionalSign } from "../astro/vargaEngine";
import { getPlanetPositions, getAscendant } from "../astro/kundaliEngine";
import { calculateVimshottariDasha } from "../calculators/astrology/vimshottari";
import {
  generateDashaAnalysis,
  generateDashaRoadmap,
} from "../calculators/astrology/dashaPredictions";
import { analyzeYogasAndDoshas } from "../calculators/astrology/yogasAndDoshas";
import { getSiderealSaturnLongitude } from "../calculators/astrology/sadeSati";
import { generateHouseAnalyses } from "../calculators/astrology/houseInterpretations";

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
} from "./kundaliContent";

import { lookupTranslation } from "./preTranslate";
import { KANNADA_DICT } from "./kannadaTranslations";

// ─── Shared Types ────────────────────────────────────────────────────────────

export interface SharedBirthData {
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

export interface LuckySupportCard {
  label: string;
  source: string;
  planet: string;
  lucky: (typeof LUCKY_INFO)[keyof typeof LUCKY_INFO];
}

export interface DashaPeriod {
  planet: string;
  start: string;
  end: string;
  active: boolean;
}

export interface PlanetRow {
  name: string;
  longitude: string;
  rasi: string;
  nakshatra: string;
  pada: number;
}

export interface BhavaTableRow {
  bhava: number;
  beginning: string;
  middle: string;
  ending: string;
  planets: string;
}

// ─── Astro Logic Helpers ──────────────────────────────────────────────────────

export function toUTC(dob: string, tob: string, timezone: string): Date {
  const [year, month, day] = dob.split("-").map(Number);
  const [hour, minute] = tob.split(":").map(Number);
  const naiveUTC = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric", hour12: false,
  });
  const parts = fmt.formatToParts(naiveUTC);
  const m: Record<string, string> = {};
  parts.forEach(p => (m[p.type] = p.value));
  const h = m.hour === "24" ? 0 : parseInt(m.hour);
  const tzDate = new Date(Date.UTC(parseInt(m.year), parseInt(m.month) - 1, parseInt(m.day), h, parseInt(m.minute), parseInt(m.second)));
  const offset = tzDate.getTime() - naiveUTC.getTime();
  return new Date(naiveUTC.getTime() - offset);
}

export function getSiderealMoonLon(date: Date): number {
  const J2000 = 2451545.0;
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - J2000) / 36525;
  let moon = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841 - T * T * T * T / 65194000;
  moon = moon % 360;
  if (moon < 0) moon += 360;
  const ayanamsa = 23.85 + 0.0136 * T;
  let sidereal = moon - ayanamsa;
  if (sidereal < 0) sidereal += 360;
  return sidereal;
}

export function getSiderealSunLon(date: Date): number {
  const J2000 = 2451545.0;
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - J2000) / 36525;
  let L = 280.46646 + 36000.76983 * T;
  const M = (357.52911 + 35999.05029 * T) * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M);
  let sun = (L + C) % 360;
  if (sun < 0) sun += 360;
  const ayanamsa = 23.85 + 0.0136 * T;
  let sidereal = sun - ayanamsa;
  if (sidereal < 0) sidereal += 360;
  return sidereal;
}

export function normalizeDegrees(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function formatDms(value: number): string {
  const normalized = normalizeDegrees(value);
  const degrees = Math.floor(normalized);
  const minutesFloat = (normalized - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60);
  return `${degrees}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function shortPlanetName(name: string): string {
  const map: Record<string, string> = {
    "Sun": "Sun",
    "Moon": "Moon",
    "Mars": "Mars",
    "Mercury": "Mercury",
    "Jupiter": "Jupiter",
    "Venus": "Venus",
    "Saturn": "Saturn",
    "Rahu": "Rahu",
    "Ketu": "Ketu",
    "North Node": "Rahu",
    "South Node": "Ketu",
  };
  return map[name] || name;
}

export const DASHA_YEARS_LOCAL: Record<string, number> = {
  Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16,
  Saturn: 19, Mercury: 17, Ketu: 7, Venus: 20
};
export const DASHA_ORDER_LOCAL = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];

export function calcDashas(startPlanet: string, nakIdx: number, degWithin: number, birthUTC: Date): any[] {
  const NAKSHATRA_SPAN = 360 / 27;
  const remaining = 1 - degWithin / NAKSHATRA_SPAN;
  const startIdx = DASHA_ORDER_LOCAL.indexOf(startPlanet);
  const dashas: any[] = [];
  let cursor = new Date(birthUTC);

  for (let i = 0; i < 9; i++) {
    const pIdx = (startIdx + i) % 9;
    const planet = DASHA_ORDER_LOCAL[pIdx];
    const years = i === 0 ? DASHA_YEARS_LOCAL[planet] * remaining : DASHA_YEARS_LOCAL[planet];
    const days = years * 365.25;
    const end = new Date(cursor.getTime() + days * 86400000);
    dashas.push({
      planet,
      start: new Date(cursor),
      end,
    });
    cursor = end;
  }
  return dashas;
}

export const SANSKRIT_SIGNS = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"
];

export const RASHI_ATTRIBUTES: Record<string, { element: string; modality: string; lord: string; sanskritName: string; symbol: string }> = {
  Aries:       { element: "Fire (Agni)", modality: "Movable (Chara)", lord: "Mars", sanskritName: "Mesha", symbol: "Ram ♈" },
  Taurus:      { element: "Earth (Prithvi)", modality: "Fixed (Sthira)", lord: "Venus", sanskritName: "Vrishabha", symbol: "Bull ♉" },
  Gemini:      { element: "Air (Vayu)", modality: "Dual (Dvisvabhava)", lord: "Mercury", sanskritName: "Mithuna", symbol: "Twins ♊" },
  Cancer:      { element: "Water (Jala)", modality: "Movable (Chara)", lord: "Moon", sanskritName: "Karka", symbol: "Crab ♋" },
  Leo:         { element: "Fire (Agni)", modality: "Fixed (Sthira)", lord: "Sun", sanskritName: "Simha", symbol: "Lion ♌" },
  Virgo:       { element: "Earth (Prithvi)", modality: "Dual (Dvisvabhava)", lord: "Mercury", sanskritName: "Kanya", symbol: "Virgin ♍" },
  Libra:       { element: "Air (Vayu)", modality: "Movable (Chara)", lord: "Venus", sanskritName: "Tula", symbol: "Scales ♎" },
  Scorpio:     { element: "Water (Jala)", modality: "Fixed (Sthira)", lord: "Mars", sanskritName: "Vrischika", symbol: "Scorpion ♏" },
  Sagittarius: { element: "Fire (Agni)", modality: "Dual (Dvisvabhava)", lord: "Jupiter", sanskritName: "Dhanu", symbol: "Archer ♐" },
  Capricorn:   { element: "Earth (Prithvi)", modality: "Movable (Chara)", lord: "Saturn", sanskritName: "Makara", symbol: "Crocodile/Sea-Goat ♑" },
  Aquarius:    { element: "Air (Vayu)", modality: "Fixed (Sthira)", lord: "Saturn", sanskritName: "Kumbha", symbol: "Water Bearer ♒" },
  Pisces:      { element: "Water (Jala)", modality: "Dual (Dvisvabhava)", lord: "Jupiter", sanskritName: "Meena", symbol: "Fishes ♓" }
};

export const NAKSHATRA_ATTRIBUTES: Record<string, { Gana: string; GanaMeaning: string; Yoni: string; Direction: string; Caste: string }> = {
  Ashwini:     { Gana: "Deva (Divine)", GanaMeaning: "Compassionate, gentle, and spiritually aligned", Yoni: "Horse (Commanding & Swift)", Direction: "East", Caste: "Merchant" },
  Bharani:     { Gana: "Manushya (Human)", GanaMeaning: "Balanced, ambitious, and duty-driven", Yoni: "Elephant (Powerful & Dignified)", Direction: "South", Caste: "Outcaste" },
  Krittika:    { Gana: "Rakshasa (Sharp/Demonic)", GanaMeaning: "Assertive, protective, and analytical", Yoni: "Sheep (Resilient & Quiet)", Direction: "North", Caste: "Intellectual/Priest" },
  Rohini:      { Gana: "Manushya (Human)", GanaMeaning: "Balanced, ambitious, and duty-driven", Yoni: "Serpent (Magnetic & Intuitive)", Direction: "East", Caste: "Merchant" },
  Mrigashira:  { Gana: "Deva (Divine)", GanaMeaning: "Compassionate, gentle, and spiritually aligned", Yoni: "Serpent (Magnetic & Intuitive)", Direction: "South", Caste: "Servant" },
  Ardra:       { Gana: "Manushya (Human)", GanaMeaning: "Balanced, ambitious, and duty-driven", Yoni: "Dog (Loyal & Fierce)", Direction: "North", Caste: "Laborer" },
  Punarvasu:   { Gana: "Deva (Divine)", GanaMeaning: "Compassionate, gentle, and spiritually aligned", Yoni: "Cat (Independent & Curious)", Direction: "North", Caste: "Merchant" },
  Pushya:      { Gana: "Deva (Divine)", GanaMeaning: "Compassionate, gentle, and spiritually aligned", Yoni: "Goat (Patient & Steady)", Direction: "North", Caste: "Intellectual/Priest" },
  Ashlesha:    { Gana: "Rakshasa (Sharp/Demonic)", GanaMeaning: "Assertive, protective, and analytical", Yoni: "Cat (Independent & Curious)", Direction: "South", Caste: "Outcaste" },
  Magha:       { Gana: "Rakshasa (Sharp/Demonic)", GanaMeaning: "Assertive, protective, and analytical", Yoni: "Rat (Clever & Resourceful)", Direction: "South", Caste: "Servant" },
  PoorvaPhalguni: { Gana: "Manushya (Human)", GanaMeaning: "Balanced, ambitious, and duty-driven", Yoni: "Rat (Clever & Resourceful)", Direction: "North", Caste: "Intellectual/Priest" },
  UttaraPhalguni: { Gana: "Manushya (Human)", GanaMeaning: "Balanced, ambitious, and duty-driven", Yoni: "Cow (Generous & Steady)", Direction: "East", Caste: "Merchant" },
  Hasta:       { Gana: "Deva (Divine)", GanaMeaning: "Compassionate, gentle, and spiritually aligned", Yoni: "Buffalo (Hardworking & Patient)", Direction: "North", Caste: "Merchant" },
  Chitra:      { Gana: "Rakshasa (Sharp/Demonic)", GanaMeaning: "Assertive, protective, and analytical", Yoni: "Tiger (Fearless & Regal)", Direction: "South", Caste: "Servant" },
  Swati:       { Gana: "Deva (Divine)", GanaMeaning: "Compassionate, gentle, and spiritually aligned", Yoni: "Buffalo (Hardworking & Patient)", Direction: "North", Caste: "Blacksmith" },
  Vishakha:    { Gana: "Rakshasa (Sharp/Demonic)", GanaMeaning: "Assertive, protective, and analytical", Yoni: "Tiger (Fearless & Regal)", Direction: "North", Caste: "Outcaste" },
  Anuradha:    { Gana: "Deva (Divine)", GanaMeaning: "Compassionate, gentle, and spiritually aligned", Yoni: "Hare (Gentle & Artistic)", Direction: "South", Caste: "Servant" },
  Jyeshtha:    { Gana: "Rakshasa (Sharp/Demonic)", GanaMeaning: "Assertive, protective, and analytical", Yoni: "Hare (Gentle & Artistic)", Direction: "East", Caste: "Outcaste" },
  Mula:        { Gana: "Rakshasa (Sharp/Demonic)", GanaMeaning: "Assertive, protective, and analytical", Yoni: "Dog (Loyal & Fierce)", Direction: "South", Caste: "Servant" },
  Poorvashadha: { Gana: "Manushya (Human)", GanaMeaning: "Balanced, ambitious, and duty-driven", Yoni: "Monkey (Playful & Quick)", Direction: "North", Caste: "Priest" },
  Uttarashadha: { Gana: "Manushya (Human)", GanaMeaning: "Balanced, ambitious, and duty-driven", Yoni: "Mongoose (Unique & Sharp)", Direction: "East", Caste: "Warrior" },
  Shravana:    { Gana: "Deva (Divine)", GanaMeaning: "Compassionate, gentle, and spiritually aligned", Yoni: "Monkey (Playful & Quick)", Direction: "North", Caste: "Outcaste" },
  Dhanishta:   { Gana: "Rakshasa (Sharp/Demonic)", GanaMeaning: "Assertive, protective, and analytical", Yoni: "Lion (Noble & Dominant)", Direction: "East", Caste: "Warrior" },
  Shatabhisha: { Gana: "Rakshasa (Sharp/Demonic)", GanaMeaning: "Assertive, protective, and analytical", Yoni: "Horse (Commanding & Swift)", Direction: "North", Caste: "Outcaste" },
  Poorvabhadrapada: { Gana: "Manushya (Human)", GanaMeaning: "Balanced, ambitious, and duty-driven", Yoni: "Lion (Noble & Dominant)", Direction: "North", Caste: "Priest" },
  Uttarabhadrapada: { Gana: "Manushya (Human)", GanaMeaning: "Balanced, ambitious, and duty-driven", Yoni: "Cow (Generous & Steady)", Direction: "North", Caste: "Warrior" },
  Revati:      { Gana: "Deva (Divine)", GanaMeaning: "Compassionate, gentle, and spiritually aligned", Yoni: "Elephant (Powerful & Dignified)", Direction: "North", Caste: "Outcaste" }
};

export function buildChandraMandate(rashi: string): string {
  const mandates: Record<string, string> = {
    Aries: `Your mind acts as a dynamic igniter, naturally seeking action, truth, and pioneering ventures. Cultivate patience and active meditation to avoid mental restlessness and burnout.`,
    Taurus: `Your emotional world is grounded, steady, and seeks sensory peace and absolute comfort. Dedicate time to physical nature, music, and stable routines to restore your inner balance.`,
    Gemini: `Your intellect is perpetually curious, versatile, and highly communicative. Practice silencing the quick silver chatter of the twins through regular periods of digital detox and deep breathing.`,
    Cancer: `Your heart is an exceptionally tender sanctuary of emotional memory and maternal care. Protect your domestic boundaries fiercely, and nurture your emotional roots with daily self-care.`,
    Leo: `Your mind seeks absolute dignity, creative sovereignty, and solar warmth. Live with pure integrity and express your creative heart openly without seeking constant external validation.`,
    Virgo: `Your mental focus is precise, expert, and naturally detail-oriented. Guard against excessive self-criticism by practicing radical self-acceptance and quiet, joyful service to those in need.`,
    Libra: `Your soul seeks perfect relational harmony, balance, and aesthetic clarity. Cultivate your independent personal identity and strong boundaries to avoid losing yourself in pleasing others.`,
    Scorpio: `Your subconscious is a powerful, deep ocean of transformative mysteries. Embrace your exceptional psychological depth and practice forgiveness to unlock your supreme spiritual resilience.`,
    Sagittarius: `Your mind is a tireless seeker of higher wisdom, philosophy, and foreign horizons. Always follow your moral compass, share your expansive wisdom, and keep a generous, optimistic heart.`,
    Capricorn: `Your mental landscape is structured, patient, and exceptionally disciplined. Age in reverse by celebrating small everyday milestones and consciously releasing early life emotional burdens.`,
    Aquarius: `Your intellect is forward-thinking, original, and deeply humanitarian. Balance your collective reformer vision with warm, intimate personal connections and grounded daily routines.`,
    Pisces: `Your mind is a boundless ocean of spiritual compassion and creative dreams. Dedicate quiet time to meditation, music, or spiritual retreat near water to keep your sensitive energy centered and clear.`,
  };
  return mandates[rashi] ?? "";
}

export function getFavourablePeriods(
  mahadashas: any[],
  birthDateStr: string,
  lagnaIndex: number,
  category: 'career' | 'marriage' | 'business' | 'house'
) {
  const birthDate = new Date(birthDateStr);
  const hLord = (h: number) => ZODIAC_LORDS[(lagnaIndex + h - 1) % 12];
  
  let favPlanets: string[] = [];
  let ageMin = 15;
  let ageMax = 60;
  
  if (category === 'career') {
    favPlanets = [hLord(1), hLord(10), 'Jupiter', 'Sun', 'Mercury'];
    ageMin = 15;
    ageMax = 60;
  } else if (category === 'marriage') {
    favPlanets = [hLord(7), 'Venus', 'Jupiter', 'Moon', 'Rahu'];
    ageMin = 18;
    ageMax = 50;
  } else if (category === 'business') {
    favPlanets = [hLord(2), hLord(6), hLord(10), hLord(11), 'Mercury', 'Jupiter'];
    ageMin = 15;
    ageMax = 60;
  } else if (category === 'house') {
    favPlanets = [hLord(4), 'Mars', 'Venus', 'Jupiter', 'Saturn'];
    ageMin = 15;
    ageMax = 50;
  }
  
  const periods: any[] = [];
  mahadashas.forEach((m) => {
    m.antardashas.forEach((a) => {
      const ageAtStart = (a.start.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (ageAtStart >= ageMin && ageAtStart <= ageMax) {
        const isMahaFav = favPlanets.includes(m.planet);
        const isAntarFav = favPlanets.includes(a.planet);
        
        let analysis = '';
        if (isMahaFav && isAntarFav) {
          analysis = 'Excellent';
        } else if (isMahaFav || isAntarFav) {
          analysis = 'Favourable';
        }
        
        if (analysis) {
          periods.push({
            dasa: m.planet,
            apahara: a.planet,
            start: a.start,
            end: a.end,
            analysis
          });
        }
      }
    });
  });
  
  return periods.sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, 15);
}

export function chunkEntries<T>(entries: T[], size: number): T[][] {
  if (entries.length === 0) return [[]];
  const chunks: T[][] = [];
  for (let i = 0; i < entries.length; i += size) {
    chunks.push(entries.slice(i, i + size));
  }
  return chunks;
}

// ─── Main Unified Report Content Builder ──────────────────────────────────────

export function buildSharedReportData(data: SharedBirthData, language = "en") {
  const t = (text: string): string => {
    if (language === "kn" && text) {
      const cleanText = text.trim();
      const cachedTranslation = lookupTranslation(cleanText) ?? lookupTranslation(text);
      if (cachedTranslation) return cachedTranslation;
      if (KANNADA_DICT[cleanText]) return KANNADA_DICT[cleanText];
      if (KANNADA_DICT[text]) return KANNADA_DICT[text];

      let result = text;
      if (result.includes("deg N")) result = result.replace("deg N", "ಡಿಗ್ರಿ ಉ");
      if (result.includes("deg S")) result = result.replace("deg S", "ಡಿಗ್ರಿ ದ");
      if (result.includes("deg E")) result = result.replace("deg E", "ಡಿಗ್ರಿ ಪೂ");
      if (result.includes("deg W")) result = result.replace("deg W", "ಡಿಗ್ರಿ ಪ");
      if (result.includes("Approx")) result = result.replace("Approx", "ಅಂದಾಜು");
      if (result.includes("Years")) result = result.replace("Years", "ವರ್ಷಗಳು");
      if (result.includes("Bhukti")) result = result.replace("Bhukti", "ಭುಕ್ತಿ");
      if (result.includes("ACTIVE")) result = result.replace("ACTIVE", "ಸಕ್ರಿಯ");
      if (result.includes("CURRENT")) result = result.replace("CURRENT", "ಪ್ರಸ್ತುತ");
      if (result.includes("deg")) result = result.replace("deg", "ಡಿಗ್ರಿ");
      return result;
    }
    return text;
  };

  const birthUTC = toUTC(data.dob, data.tob, data.timezone);
  const moonLon = getSiderealMoonLon(birthUTC);
  const sunLon = getSiderealSunLon(birthUTC);

  const jd = birthUTC.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;

  const marsLon = ((355.453 + 191.403 * T * 365.25) % 360 + 360) % 360;
  const mercuryLon = ((252.251 + 1494.723 * T * 365.25) % 360 + 360) % 360;
  const jupiterLon = ((34.404 + 30.349 * T * 365.25) % 360 + 360) % 360;
  const venusLon = ((181.979 + 585.178 * T * 365.25) % 360 + 360) % 360;
  const saturnLon = ((50.058 + 12.221 * T * 365.25) % 360 + 360) % 360;
  const rahuLon = ((125.04 - 19.341 * T * 365.25) % 360 + 360) % 360;
  const ketuLon = (rahuLon + 180) % 360;

  const NAKSHATRA_SPAN = 360 / 27;
  const nakshatraIndex = Math.floor(moonLon / NAKSHATRA_SPAN);
  const nakshatraName = NAKSHATRA_NAMES[nakshatraIndex];
  const nakshatraLord = NAKSHATRA_LORDS[nakshatraIndex];
  const degWithin = moonLon - nakshatraIndex * NAKSHATRA_SPAN;
  const nakshatraPada = Math.floor(degWithin / (NAKSHATRA_SPAN / 4)) + 1;

  const rashiIndex = Math.floor(moonLon / 30);
  const rashiName = ZODIAC_SIGNS[rashiIndex];

  let realAscendant: number;
  try {
    realAscendant = getAscendant(birthUTC, data.lat, data.lon);
  } catch {
    realAscendant = sunLon;
  }
  const lagnaIndex = Math.floor(realAscendant / 30);
  const lagnaName = ZODIAC_SIGNS[lagnaIndex];

  let dashaResult: any = null;
  try {
    dashaResult = calculateVimshottariDasha({
      dob: data.dob,
      tob: data.tob,
      timezone: data.timezone,
    });
  } catch (e) {
    console.error("Precise Vimshottari calculation failed", e);
  }

  const currentMaha = dashaResult?.currentMahadasha?.planet ?? "";

  const dashaPeriods: DashaPeriod[] = (() => {
    if (!dashaResult) {
      const fallbackRows = calcDashas(nakshatraLord, nakshatraIndex, degWithin, birthUTC);
      const now = new Date();

      return fallbackRows.map((d) => ({
        planet: d.planet,
        start: d.start.toLocaleDateString("en-IN", { year: "numeric", month: "short" }),
        end: d.end.toLocaleDateString("en-IN", { year: "numeric", month: "short" }),
        active: now >= d.start && now <= d.end,
      }));
    }

    return dashaResult.mahadashas.map((period: any) => ({
      planet: period.planet,
      start: period.start.toLocaleDateString("en-IN", { year: "numeric", month: "short" }),
      end: period.end.toLocaleDateString("en-IN", { year: "numeric", month: "short" }),
      active:
        dashaResult.currentMahadasha?.planet === period.planet &&
        dashaResult.currentMahadasha?.start.getTime() === period.start.getTime() &&
        dashaResult.currentMahadasha?.end.getTime() === period.end.getTime(),
    }));
  })();

  const activePeriodText = (() => {
    if (dashaResult?.currentMahadasha) {
      const { planet, start, end } = dashaResult.currentMahadasha;
      const startStr = start.toLocaleDateString("en-IN", { year: "numeric", month: "short" });
      const endStr = end.toLocaleDateString("en-IN", { year: "numeric", month: "short" });
      return `${planet} Mahadasha (${startStr} – ${endStr})`;
    }
    const fallbackDasha = dashaPeriods?.find((d) => d.active) || dashaPeriods?.[0];
    if (fallbackDasha) {
      return `${fallbackDasha.planet} Mahadasha (${fallbackDasha.start} – ${fallbackDasha.end})`;
    }
    return "";
  })();

  const panchanga = (() => {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const birthDateObj = new Date(data.dob);
    const weekdayName = weekdays[birthDateObj.getDay()];

    const diff = (moonLon - sunLon + 360) % 360;
    const thidhiIndex = Math.floor(diff / 12) + 1; // 1 to 30
    const THIDHIS = [
      "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
      "Ekadasi", "Dwadasi", "Trayodasi", "Chaturdasi", "Poornima",
      "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
      "Ekadasi", "Dwadasi", "Trayodasi", "Chaturdasi", "Amavasya"
    ];
    const thidhiName = THIDHIS[thidhiIndex - 1] || "Ekadasi";
    const phaseName = thidhiIndex <= 15 ? "Suklapaksha" : "Krishnapaksha";

    const KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"];
    const karanaName = thidhiIndex === 11 ? "Vanija" : KARANAS[(thidhiIndex * 2) % 7];

    const YOGAS = [
      "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda",
      "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
      "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
    ];
    const yogaLon = (sunLon + moonLon) % 360;
    const yogaIndex = Math.floor(yogaLon / (360 / 27)) % 27;
    const yogaName = YOGAS[yogaIndex] || "Vyatipata";

    const weekdayDesc = weekdayName === "Saturday"
      ? `${data.name}, birth on a Saturday indicates that you may prefer to stay inactive until circumstances force you to step forward. You enjoy delay tactics. You have to control your tendency to gossip. You cannot afford to spend as lavishly as you would like to. You tend to be emotional and sensitive in nature.`
      : `Birth on a ${weekdayName} grants you a vibrant, active nature. You are highly expressive, love seeking new challenges, and inspire trust. You possess a warm heart, strong principles, and a natural capacity for professional and personal leadership.`;

    const starDesc = nakshatraName === "Revati"
      ? `You are a sincere, straightforward and open-minded individual, ${data.name}. Though quick to anger, you do not conceal your true self from others. Since you have confidence in your abilities, you should be encouraged to stick by your convictions. You are fully competent to judge yourself and others. Your decisions are normally slow and deliberate. You may be a little cold toward others since you are basically an extremely independent individual. Your love relationships will be decidedly turbulent. You may have to endure a separation or a divorce before you finally learn to accept your mate. Take ample care of your heart and stomach.`
      : `As a ${nakshatraName} native, you carry a highly intuitive and protective character. You are sincere, hardworking, and stand firmly by your convictions. While you value your independent freedom, you build deeply loyal bonds and possess outstanding analytical capabilities.`;

    const thidhiDesc = thidhiName.toUpperCase() === "EKADASI"
      ? `${data.name}, since you are born in EKADASI THIDHI, your character and conduct attract others even when you are very young. You have the ability to learn everything about the subjects you are interested in. You will be quite rich.`
      : `Being born on the auspicious ${thidhiName} Thidhi, your character is marked by strong ethical values and pleasant conduct. You carry an adaptable mind, learn complex concepts quickly, and attract material and spiritual success steadily.`;

    const karanaDesc = karanaName === "Vanija"
      ? `Since you are born in Vanija Karana, ${data.name}, you learn to appreciate art. You are adept at making the best use of your talents. You are sensitive to changes in health conditions and get disturbed unnecessarily. You are romantic at heart.`
      : `Since you are born in ${karanaName} Karana, you possess an active, hardworking nature. You are highly practical in business, make excellent use of your natural skills, and maintain steady, healthy progress in your professional path.`;

    const yogaDesc = yogaName === "Vyatipata"
      ? `VYATHIPATHA NITHYAYOGA presents you with a destiny fraught with some turmoil and trouble, ${data.name}. The problems will remain until you face the challenges and overcome them. In reaction to some of the trouble you face, you may become bitter. You may tend toward arrogance.`
      : `The positive vibrations of ${yogaName} Nithya Yoga bless you with a smooth, prosperous, and highly successful life. You enjoy stable career growth, have a peaceful mental state, and are highly respected for your integrity and warmth.`;

    return {
      weekdayName,
      weekdayDesc,
      starDesc,
      thidhiName,
      phaseName,
      thidhiDesc,
      karanaName,
      karanaDesc,
      yogaName,
      yogaDesc
    };
  })();

  const dashaAnalysis = (() => {
    try {
      if (!dashaResult) return null;
      return generateDashaAnalysis({
        mahadashas: dashaResult.mahadashas,
        currentMahadasha: dashaResult.currentMahadasha,
        currentAntardasha: dashaResult.currentAntardasha,
        currentPratyantardasha: dashaResult.currentPratyantardasha,
        rashiName,
        lagnaSign: lagnaName,
        nakshatra: nakshatraName,
      });
    } catch (e) {
      console.error("Dasha deep dive calculation failed", e);
      return null;
    }
  })();

  const dashaRoadmap = (() => {
    try {
      if (!dashaResult) return [];
      return generateDashaRoadmap({
        mahadashas: dashaResult.mahadashas,
        currentMahadasha: dashaResult.currentMahadasha,
        currentAntardasha: dashaResult.currentAntardasha,
        rashiName,
        lagnaSign: lagnaName,
        untilYear: 2065,
      });
    } catch (e) {
      console.error("Dasha roadmap generation failed", e);
      return [];
    }
  })();

  const planetRows: PlanetRow[] = [
    { name: "Ascendant (Lagna)", longitude: `${Math.floor((lagnaIndex * 30 + 12) % 30)}°`, rasi: lagnaName, nakshatra: NAKSHATRA_NAMES[(lagnaIndex * 2 + 1) % 27], pada: 1 },
    { name: "Sun (Surya)", longitude: `${Math.floor(sunLon % 30)}° ${Math.floor((sunLon % 1) * 60)}'`, rasi: ZODIAC_SIGNS[Math.floor(sunLon / 30)], nakshatra: NAKSHATRA_NAMES[Math.floor(sunLon / NAKSHATRA_SPAN)], pada: Math.floor((sunLon % NAKSHATRA_SPAN) / (NAKSHATRA_SPAN / 4)) + 1 },
    { name: "Moon (Chandra)", longitude: `${Math.floor(moonLon % 30)}° ${Math.floor((moonLon % 1) * 60)}'`, rasi: rashiName, nakshatra: nakshatraName, pada: nakshatraPada },
    { name: "Mars (Mangal)", longitude: `${Math.floor(marsLon % 30)}° ${Math.floor((marsLon % 1) * 60)}'`, rasi: ZODIAC_SIGNS[Math.floor(marsLon / 30)], nakshatra: NAKSHATRA_NAMES[Math.floor(marsLon / NAKSHATRA_SPAN)], pada: Math.floor((marsLon % NAKSHATRA_SPAN) / (NAKSHATRA_SPAN / 4)) + 1 },
    { name: "Mercury (Budha)", longitude: `${Math.floor(mercuryLon % 30)}° ${Math.floor((mercuryLon % 1) * 60)}'`, rasi: ZODIAC_SIGNS[Math.floor(mercuryLon / 30)], nakshatra: NAKSHATRA_NAMES[Math.floor(mercuryLon / NAKSHATRA_SPAN)], pada: Math.floor((mercuryLon % NAKSHATRA_SPAN) / (NAKSHATRA_SPAN / 4)) + 1 },
    { name: "Jupiter (Guru)", longitude: `${Math.floor(jupiterLon % 30)}° ${Math.floor((jupiterLon % 1) * 60)}'`, rasi: ZODIAC_SIGNS[Math.floor(jupiterLon / 30)], nakshatra: NAKSHATRA_NAMES[Math.floor(jupiterLon / NAKSHATRA_SPAN)], pada: Math.floor((jupiterLon % NAKSHATRA_SPAN) / (NAKSHATRA_SPAN / 4)) + 1 },
    { name: "Venus (Shukra)", longitude: `${Math.floor(venusLon % 30)}° ${Math.floor((venusLon % 1) * 60)}'`, rasi: ZODIAC_SIGNS[Math.floor(venusLon / 30)], nakshatra: NAKSHATRA_NAMES[Math.floor(venusLon / NAKSHATRA_SPAN)], pada: Math.floor((venusLon % NAKSHATRA_SPAN) / (NAKSHATRA_SPAN / 4)) + 1 },
    { name: "Saturn (Shani)", longitude: `${Math.floor(saturnLon % 30)}° ${Math.floor((saturnLon % 1) * 60)}'`, rasi: ZODIAC_SIGNS[Math.floor(saturnLon / 30)], nakshatra: NAKSHATRA_NAMES[Math.floor(saturnLon / NAKSHATRA_SPAN)], pada: Math.floor((saturnLon % NAKSHATRA_SPAN) / (NAKSHATRA_SPAN / 4)) + 1 },
    { name: "Rahu (North Node)", longitude: `${Math.floor(rahuLon % 30)}° ${Math.floor((rahuLon % 1) * 60)}'`, rasi: ZODIAC_SIGNS[Math.floor(rahuLon / 30)], nakshatra: NAKSHATRA_NAMES[Math.floor(rahuLon / NAKSHATRA_SPAN)], pada: Math.floor((rahuLon % NAKSHATRA_SPAN) / (NAKSHATRA_SPAN / 4)) + 1 },
    { name: "Ketu (South Node)", longitude: `${Math.floor(ketuLon % 30)}° ${Math.floor((ketuLon % 1) * 60)}'`, rasi: ZODIAC_SIGNS[Math.floor(ketuLon / 30)], nakshatra: NAKSHATRA_NAMES[Math.floor(ketuLon / NAKSHATRA_SPAN)], pada: Math.floor((ketuLon % NAKSHATRA_SPAN) / (NAKSHATRA_SPAN / 4)) + 1 },
  ];

  const lagnaLord = ZODIAC_LORDS[lagnaIndex] || "Jupiter";
  const moonLord = ZODIAC_LORDS[rashiIndex] || "Jupiter";

  const luckySupportCards: LuckySupportCard[] = (() => {
    const supportDefs = [
      {
        label: "Primary chart support",
        source: `Lagna lord of ${lagnaName}`,
        planet: lagnaLord,
      },
      {
        label: "Moon sign support",
        source: `Rashi lord of ${rashiName}`,
        planet: moonLord,
      },
      {
        label: "Nakshatra support",
        source: `${nakshatraName} lord`,
        planet: nakshatraLord,
      },
    ];

    return supportDefs.map((support) => ({
      ...support,
      lucky: LUCKY_INFO[support.planet as keyof typeof LUCKY_INFO] || LUCKY_INFO["Jupiter"],
    }));
  })();

  const primaryLuckySupport = luckySupportCards[0];
  const primaryLucky = primaryLuckySupport?.lucky || LUCKY_INFO["Jupiter"];
  const currentDashaLucky = (currentMaha && LUCKY_INFO[currentMaha as keyof typeof LUCKY_INFO]) || primaryLucky;
  const remedyPlanet = currentMaha || primaryLuckySupport?.planet || "Jupiter";

  const mahaRemedyEntries = (() => {
    const untilDate = new Date(Date.UTC(2065, 11, 31, 23, 59, 59));
    const fallbackRows = calcDashas(nakshatraLord, nakshatraIndex, degWithin, birthUTC);
    const basePeriods = dashaResult
      ? dashaResult.mahadashas.map((period: any) => ({
          planet: period.planet,
          start: period.start,
          end: period.end,
          active:
            dashaResult.currentMahadasha?.planet === period.planet &&
            dashaResult.currentMahadasha?.start.getTime() === period.start.getTime() &&
            dashaResult.currentMahadasha?.end.getTime() === period.end.getTime(),
        }))
      : fallbackRows.map((period) => ({
          planet: period.planet,
          start: period.start,
          end: period.end,
          active: new Date() >= period.start && new Date() <= period.end,
        }));

    return basePeriods
      .filter((period: any) => period.start <= untilDate)
      .map((period: any) => ({
        planet: period.planet,
        start: period.start,
        end: period.end > untilDate ? untilDate : period.end,
        active: period.active,
        guide: DASHA_REMEDY_GUIDES[period.planet as keyof typeof DASHA_REMEDY_GUIDES] || DASHA_REMEDY_GUIDES.Jupiter,
        prediction:
          DASHA_PREDICTIONS[period.planet as keyof typeof DASHA_PREDICTIONS]?.general ||
          `${period.planet} Mahadasha amplifies the karmic themes of this graha and should be handled with patient spiritual discipline.`,
      }));
  })();

  const listPlanets = (() => {
    try {
      const planets = getPlanetPositions(birthUTC, data.lat, data.lon);
      return planets.map((p) => ({
        name: p.name,
        lon: p.longitude,
        retrograde: p.retrograde,
        combust: p.combust,
      }));
    } catch (e) {
      console.error("Failed to compute exact planets, using fallbacks", e);
      return [
        { name: "Sun",     lon: sunLon, retrograde: false, combust: false },
        { name: "Moon",    lon: moonLon, retrograde: false, combust: false },
        { name: "Mars",    lon: marsLon, retrograde: false, combust: false },
        { name: "Mercury", lon: mercuryLon, retrograde: false, combust: false },
        { name: "Jupiter", lon: jupiterLon, retrograde: false, combust: false },
        { name: "Venus",   lon: venusLon, retrograde: false, combust: false },
        { name: "Saturn",  lon: saturnLon, retrograde: false, combust: false },
        { name: "Rahu",    lon: rahuLon, retrograde: false, combust: false },
        { name: "Ketu",    lon: ketuLon, retrograde: false, combust: false },
      ];
    }
  })();

  const navamsaIndex = (() => {
    try {
      const ascendant = getAscendant(birthUTC, data.lat, data.lon);
      return calculateDivisionalSign(ascendant, 9, "D9") - 1;
    } catch {
      return (lagnaIndex * 9 + 4) % 12;
    }
  })();

  const navamsaPlanets = listPlanets.map((p) => {
    const absNavamsa = Math.floor(p.lon / (30 / 9));
    const signIndex = absNavamsa % 12;
    return {
      name: p.name,
      lon: signIndex * 30 + 15,
      retrograde: p.retrograde,
      combust: p.combust,
    };
  });

  const bhavaPlanets = (() => {
    try {
      const ascLon = getAscendant(birthUTC, data.lat, data.lon);
      return listPlanets.map((p) => {
        const dist = ((p.lon - (ascLon - 15)) % 360 + 360) % 360;
        const bhavaNum = Math.floor(dist / 30);
        const targetSignIdx = (lagnaIndex + bhavaNum) % 12;
        return {
          name: p.name,
          lon: targetSignIdx * 30 + (p.lon % 30),
          retrograde: p.retrograde,
          combust: p.combust,
        };
      });
    } catch {
      return listPlanets;
    }
  })();

  const bhavaTableRows = (() => {
    try {
      const ascLon = getAscendant(birthUTC, data.lat, data.lon);
      const startAnchor = ascLon - 15;

      return Array.from({ length: 12 }, (_, houseIdx) => {
        const beginning = normalizeDegrees(startAnchor + houseIdx * 30);
        const middle = normalizeDegrees(ascLon + houseIdx * 30);
        const ending = normalizeDegrees(startAnchor + (houseIdx + 1) * 30);
        const planetsInBhava = listPlanets
          .filter((planet) => {
            const dist = ((planet.lon - startAnchor) % 360 + 360) % 360;
            const bhavaNum = Math.floor(dist / 30) + 1;
            return bhavaNum === houseIdx + 1;
          })
          .map((planet) => shortPlanetName(planet.name));

        return {
          bhava: houseIdx + 1,
          beginning: formatDms(beginning),
          middle: formatDms(middle),
          ending: formatDms(ending),
          planets: planetsInBhava.length ? planetsInBhava.join(", ") : "None",
        };
      });
    } catch (error) {
      console.error("Bhava table generation failed", error);
      return Array.from({ length: 12 }, (_, houseIdx) => ({
        bhava: houseIdx + 1,
        beginning: "--",
        middle: "--",
        ending: "--",
        planets: "None",
      }));
    }
  })();

  const houseAnalyses = generateHouseAnalyses({
    lagnaIndex,
    sunLon,
    moonLon,
    marsLon,
    mercuryLon,
    jupiterLon,
    venusLon,
    saturnLon,
    rahuLon,
    ketuLon,
  });

  const currentSaturnLon = getSiderealSaturnLongitude(new Date());
  const currentSaturnSignIndex = Math.floor(currentSaturnLon / 30);

  const yogaReport = (() => {
    try {
      return analyzeYogasAndDoshas({
        lagnaIndex,
        moonSignIndex: rashiIndex,
        marsLon,
        jupiterLon,
        saturnLon,
        rahuLon,
        ketuLon,
        sunLon,
        mercuryLon,
        venusLon,
        currentSaturnSignIndex,
      });
    } catch (e) {
      console.error("Failed to analyze yogas and doshas", e);
      return null;
    }
  })();

  const presentYogas = (() => {
    if (!yogaReport) return [];
    const list: any[] = [];
    if (yogaReport.gajKesariYog && yogaReport.gajKesariYog.present) {
      list.push(yogaReport.gajKesariYog);
    }
    yogaReport.rajYog.forEach((y) => {
      if (y.present) list.push(y);
    });
    yogaReport.dhanYog.forEach((y) => {
      if (y.present) list.push(y);
    });
    yogaReport.vipreetRajYog.forEach((y) => {
      if (y.present) list.push(y);
    });
    return list;
  })();

  const favourableCareerPeriods = dashaResult ? getFavourablePeriods(dashaResult.mahadashas, data.dob, lagnaIndex, 'career') : [];
  const favourableMarriagePeriods = dashaResult ? getFavourablePeriods(dashaResult.mahadashas, data.dob, lagnaIndex, 'marriage') : [];
  const favourableBusinessPeriods = dashaResult ? getFavourablePeriods(dashaResult.mahadashas, data.dob, lagnaIndex, 'business') : [];
  const favourableHousePeriods = dashaResult ? getFavourablePeriods(dashaResult.mahadashas, data.dob, lagnaIndex, 'house') : [];

  const yogaChunks = chunkEntries(presentYogas, 3);

  const suryaArr = [4, 3, 5, 4, 5, 4, 3, 5, 4, 3, 4, 4];
  const chandraArr = [5, 4, 3, 5, 4, 5, 4, 4, 5, 3, 4, 3];
  const marsArr = [3, 4, 3, 3, 4, 3, 4, 3, 3, 4, 3, 2];
  const mercuryArr = [5, 4, 5, 4, 5, 5, 4, 5, 4, 4, 5, 4];
  const jupiterArr = [5, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 5];
  const venusArr = [4, 5, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4];
  const saturnArr = [3, 3, 4, 3, 3, 4, 3, 3, 4, 3, 3, 3];

  const sunSignIdx = Math.floor((((sunLon % 360) + 360) % 360) / 30) % 12;
  const moonSignIdx = Math.floor((((moonLon % 360) + 360) % 360) / 30) % 12;
  const marsSignIdx = Math.floor((((marsLon % 360) + 360) % 360) / 30) % 12;
  const mercurySignIdx = Math.floor((((mercuryLon % 360) + 360) % 360) / 30) % 12;
  const jupiterSignIdx = Math.floor((((jupiterLon % 360) + 360) % 360) / 30) % 12;
  const venusSignIdx = Math.floor((((venusLon % 360) + 360) % 360) / 30) % 12;
  const saturnSignIdx = Math.floor((((saturnLon % 360) + 360) % 360) / 30) % 12;

  const sarvaPoints = suryaArr[rashiIndex] + chandraArr[rashiIndex] + marsArr[rashiIndex] + mercuryArr[rashiIndex] + jupiterArr[rashiIndex] + venusArr[rashiIndex] + saturnArr[rashiIndex];

  // Dynamic ages for fortune turning
  const jupAge = suryaArr[jupiterSignIdx] + chandraArr[jupiterSignIdx] + marsArr[jupiterSignIdx] + mercuryArr[jupiterSignIdx] + jupiterArr[jupiterSignIdx] + venusArr[jupiterSignIdx] + saturnArr[jupiterSignIdx];
  const venAge = suryaArr[venusSignIdx] + chandraArr[venusSignIdx] + marsArr[venusSignIdx] + mercuryArr[venusSignIdx] + jupiterArr[venusSignIdx] + venusArr[venusSignIdx] + saturnArr[venusSignIdx];
  const merAge = suryaArr[mercurySignIdx] + chandraArr[mercurySignIdx] + marsArr[mercurySignIdx] + mercuryArr[mercurySignIdx] + jupiterArr[mercurySignIdx] + venusArr[mercurySignIdx] + saturnArr[mercurySignIdx];

  // House points for critical houses
  const lagnaSarva = suryaArr[lagnaIndex] + chandraArr[lagnaIndex] + marsArr[lagnaIndex] + mercuryArr[lagnaIndex] + jupiterArr[lagnaIndex] + venusArr[lagnaIndex] + saturnArr[lagnaIndex];
  const h9Sarva = suryaArr[(lagnaIndex + 8) % 12] + chandraArr[(lagnaIndex + 8) % 12] + marsArr[(lagnaIndex + 8) % 12] + mercuryArr[(lagnaIndex + 8) % 12] + jupiterArr[(lagnaIndex + 8) % 12] + venusArr[(lagnaIndex + 8) % 12] + saturnArr[(lagnaIndex + 8) % 12];
  const h10Sarva = suryaArr[(lagnaIndex + 9) % 12] + chandraArr[(lagnaIndex + 9) % 12] + marsArr[(lagnaIndex + 9) % 12] + mercuryArr[(lagnaIndex + 9) % 12] + jupiterArr[(lagnaIndex + 9) % 12] + venusArr[(lagnaIndex + 9) % 12] + saturnArr[(lagnaIndex + 9) % 12];
  const h11Sarva = suryaArr[(lagnaIndex + 10) % 12] + chandraArr[(lagnaIndex + 10) % 12] + marsArr[(lagnaIndex + 10) % 12] + mercuryArr[(lagnaIndex + 10) % 12] + jupiterArr[(lagnaIndex + 10) % 12] + venusArr[(lagnaIndex + 10) % 12] + saturnArr[(lagnaIndex + 10) % 12];

  const forecasts = [
    { month: "Month 1 (Self & Focus)", prediction: `Lord of Rashi ${rashiName} enters an auspicious house. Focus heavily on expanding your skill set and taking dynamic initiatives.` },
    { month: "Month 2 (Wealth & speech)", prediction: "A strong period for financial planning and talks with family. A new communication channel brings opportunities." },
    { month: "Month 3 (Siblings & Short Travels)", prediction: "Mars sparks energetic action in short journeys. Clear up any communication gaps with colleagues." },
    { month: "Month 4 (Mother & Comforts)", prediction: "Comfort level peaks. Ideal time to acquire long-awaited vehicles or make decorative updates to your home." },
    { month: "Month 5 (Creative & Romances)", prediction: "The creative spark burns bright. Engage in speculations carefully; blessings from children bring luck." },
    { month: "Month 6 (Health & Objections)", prediction: "Pacify your daily schedule. Do not overextend physically; keep clear of sudden debt liabilities." },
    { month: "Month 7 (Marriages & Alliances)", prediction: "Jupiter casts a protective aspect over partnerships. Ideal for serious personal commitments and contracts." },
    { month: "Month 8 (Subconscious & Wisdom)", prediction: "Deep transformation occurs. Occult wisdom and spiritual research bring profound revelations." },
    { month: "Month 9 (Grace & Long Travels)", prediction: "Dharma activities bring exceptional grace. A father figure provides timely, life-altering mentorship." },
    { month: "Month 10 (Fame & Professionalism)", prediction: "Venus and Sun enhance your status at work. Expect recognition or career advancement opportunities." },
    { month: "Month 11 (Income & Friends)", prediction: "Desires find their fulfillment. Your social network grows, yielding strong gains from multiple sources." },
    { month: "Month 12 (Spiritual & Detachments)", prediction: "Saturn anchors your twelve house of expenditure. Focus heavily on meditation, sleep hygiene, and charitable acts." },
  ];

  const rashiSanskrit = t(getRashiSanskritName(rashiName));
  const rashiTemperamentText = t(getRashiTemperament(rashiName));
  const rashiCareerText = t(getRashiCareer(rashiName));
  const rashiRelationshipText = t(getRashiRelationship(rashiName));
  const chandraMandateText = t(getChandraMandate(rashiName));
  const nakshatraSymbolismText = t(getNakshatraSymbolism(nakshatraName));
  const nakshatraDeityText = t(getNakshatraDeity(nakshatraName));
  const nakshatraPersonalityText = t(getNakshatraPersonality(nakshatraName));
  const nakshatraRemediesText = t(getNakshatraRemedies(nakshatraName));

  return {
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
    jupAge, venAge, merAge, forecasts, t,
    rashiSanskrit, rashiTemperamentText, rashiCareerText, rashiRelationshipText, chandraMandateText,
    nakshatraSymbolismText, nakshatraDeityText, nakshatraPersonalityText, nakshatraRemediesText
  };
}

export function getRashiSanskritName(rashi: string): string {
  const map: Record<string, string> = {
    Aries: "Mesha", Taurus: "Vrishabha", Gemini: "Mithuna", Cancer: "Karkata",
    Leo: "Simha", Virgo: "Kanya", Libra: "Tula", Scorpio: "Vrischika",
    Sagittarius: "Dhanu", Capricorn: "Makara", Aquarius: "Kumbha", Pisces: "Meena"
  };
  return map[rashi] || rashi;
}

export function getRashiTemperament(rashi: string): string {
  const map: Record<string, string> = {
    Aries: "Highly ambitious, passionate, energetic, and courageous. Loves pioneer projects but can be restless.",
    Taurus: "Stable, patient, practical, and values comfort. Extremely reliable but resistant to sudden changes.",
    Gemini: "Intellectually curious, versatile, and highly communicative. Quick-witted but prone to over-thinking.",
    Cancer: "Tender, emotional, intuitive, and deeply protective of family. Highly receptive to surroundings.",
    Leo: "Dignified, warm, creative, and carries natural authority. Loves prestige but expects absolute integrity.",
    Virgo: "Analytical, precise, detail-oriented, and dedicated to service. Prone to criticism and worry.",
    Libra: "Harmonious, diplomatic, artistic, and seeks relational balance. Loves beauty but hates taking sides.",
    Scorpio: "Intense, transformative, psychologically deep, and highly resilient. Possesses great inner power.",
    Sagittarius: "Expansive, optimistic, philosophical, and loves exploring. Highly ethical and direct.",
    Capricorn: "Disciplined, patient, structured, and exceptionally industrious. Values duty and achievements.",
    Aquarius: "Original, humanitarian, progressive, and forward-thinking. Prefers collective goals over individual ego.",
    Pisces: "Compassionate, spiritual, imaginative, and deeply receptive. Guided by dreams and intuition."
  };
  return map[rashi] || "";
}

export function getRashiCareer(rashi: string): string {
  const map: Record<string, string> = {
    Aries: "Thrives in active leadership, military, surgery, engineering, business startups, or athletics.",
    Taurus: "Suited for finance, real estate, design, farming, luxury trade, or banking.",
    Gemini: "Excels in journalism, sales, IT, education, writing, or translation.",
    Cancer: "Thrives in hospitality, nursing, marine fields, teaching, or home care.",
    Leo: "Suited for administration, creative direction, management, government posts, or performance.",
    Virgo: "Excels in accountancy, medical careers, research, auditing, or technical design.",
    Libra: "Thrives in law, diplomacy, fashion, interior design, consulting, or public relations.",
    Scorpio: "Suited for research, defense, detective work, surgery, occult fields, or geology.",
    Sagittarius: "Excels in academics, religious service, publishing, travel industry, or law.",
    Capricorn: "Thrives in corporate management, civil services, architecture, construction, or manufacturing.",
    Aquarius: "Suited for technology, aviation, social reform, scientific research, or alternative energy.",
    Pisces: "Excels in arts, music, charity direction, oceanography, spiritual teaching, or healing."
  };
  return map[rashi] || "";
}

export function getRashiRelationship(rashi: string): string {
  const map: Record<string, string> = {
    Aries: "Highly intense and romantic, but requires partners who can match their high energy and independence.",
    Taurus: "Loyal, stable, and deeply committed. Prefers peaceful, quiet environments and solid security.",
    Gemini: "Seeks mental stimulation and engaging conversation. Loves playfulness and dual social events.",
    Cancer: "Requires deep emotional safety, nesting, and absolute loyalty. Extremely caring towards family.",
    Leo: "Expects royal devotion, physical pride, and appreciation. Gives generous warmth and protection.",
    Virgo: "Showcases care through practical acts, expert support, and reliability. High standards in partner.",
    Libra: "Fervent diplomat who seeks perfect partnership. Hates arguments and demands aesthetic peace.",
    Scorpio: "Intensely private and passionate. Values absolute loyalty and expects deep psychological bond.",
    Sagittarius: "Values freedom, travel, and shared ideals. Hates feeling caged and loves joint exploration.",
    Capricorn: "Patient, steady, and takes relationships seriously. Loyal supporter through thick and thin.",
    Aquarius: "Values intellectual friendship, progressive values, and space. Hates overly dramatic demands.",
    Pisces: "Romantic, mystical, compassionate, and highly supportive. Seeks spiritual soulmate union."
  };
  return map[rashi] || "";
}

export function getChandraMandate(rashi: string): string {
  const mandates: Record<string, string> = {
    Aries: "Your mind acts as a dynamic igniter, naturally seeking action, truth, and pioneering ventures. Cultivate patience and active meditation to avoid mental restlessness and burnout.",
    Taurus: "Your emotional world is grounded, steady, and seeks sensory peace and absolute comfort. Dedicate time to physical nature, music, and stable routines to restore your inner balance.",
    Gemini: "Your intellect is perpetually curious, versatile, and highly communicative. Practice silencing the quick silver chatter of the twins through regular periods of digital detox and deep breathing.",
    Cancer: "Your heart is an exceptionally tender sanctuary of emotional memory and maternal care. Protect your domestic boundaries fiercely, and nurture your emotional roots with daily self-care.",
    Leo: "Your mind seeks absolute dignity, creative sovereignty, and solar warmth. Live with pure integrity and express your creative heart openly without seeking constant external validation.",
    Virgo: "Your mental focus is precise, expert, and naturally detail-oriented. Guard against excessive self-criticism by practicing radical self-acceptance and quiet, joyful service to those in need.",
    Libra: "Your soul seeks perfect relational harmony, balance, and aesthetic clarity. Cultivate your independent personal identity and strong boundaries to avoid losing yourself in pleasing others.",
    Scorpio: "Your subconscious is a powerful, deep ocean of transformative mysteries. Embrace your exceptional psychological depth and practice forgiveness to unlock your supreme spiritual resilience.",
    Sagittarius: "Your mind is a tireless seeker of higher wisdom, philosophy, and foreign horizons. Always follow your moral compass, share your expansive wisdom, and keep a generous, optimistic heart.",
    Capricorn: "Your mental landscape is structured, patient, and exceptionally disciplined. Age in reverse by celebrating small everyday milestones and consciously releasing early life emotional burdens.",
    Aquarius: "Your intellect is forward-thinking, original, and deeply humanitarian. Balance your collective reformer vision with warm, intimate personal connections and grounded daily routines.",
    Pisces: "Your mind is a boundless ocean of spiritual compassion and creative dreams. Dedicate quiet time to meditation, music, or spiritual retreat near water to keep your sensitive energy centered and clear."
  };
  return mandates[rashi] || "";
}

export function getNakshatraSymbolism(nak: string): string {
  const map: Record<string, string> = {
    Ashwini: "Horse Head (Commanding & Swift)", Bharani: "Yoni (Powerful & Dignified)", Krittika: "Razor/Sharp Knife",
    Rohini: "Chariot/Cart (Growth & Prosperity)", Mrigashira: "Deer's Head (Curious & Gentle)", Ardra: "Tear Drop (Transformation)",
    Punarvasu: "Quiver of Arrows (Return of Light)", Pushya: "Cow's Udder (Nourishing & Protective)", Ashlesha: "Coiled Serpent",
    Magha: "Royal Throne (Ancestral Honor)", PoorvaPhalguni: "Hammock/Fire (Joy & Relaxation)", UttaraPhalguni: "Four Legs of Bed",
    Hasta: "Clenched Fist (Skill & Industry)", Chitra: "Bright Jewel (Creative Spark)", Swati: "Young Shoot / Coral",
    Vishakha: "Triumphal Arch (Triumph & Power)", Anuradha: "Lotus Flower (Gentleness & Devotion)", Jyeshtha: "Umbrella/Amulet",
    Mula: "Tied Roots (Spiritual Grounding)", Poorvashadha: "Winnowing Basket (Practical Grace)", Uttarashadha: "Elephant's Tusk",
    Shravana: "Three Footprints (Listening & Study)", Dhanishta: "Drum / Flute (Auspicious Wealth)", Shatabhisha: "Hundred Stars/Physicians",
    Poorvabhadrapada: "Two Front Legs of Bed", Uttarabhadrapada: "Two Back Legs of Bed", Revati: "Drum / Fish (Divine Compassion)"
  };
  return map[nak] || "";
}

export function getNakshatraDeity(nak: string): string {
  const map: Record<string, string> = {
    Ashwini: "Ashwini Kumaras (Divine Healers)", Bharani: "Yama Dev (Lord of Justice)", Krittika: "Agni Dev (Fire Deity)",
    Rohini: "Brahma Dev (Creator)", Mrigashira: "Soma Dev (Moon Deity)", Ardra: "Rudra Dev (Storm Deity)",
    Punarvasu: "Aditi Dev (Divine Mother)", Pushya: "Brihaspati (Guru of Devas)", Ashlesha: "Naga Devas (Serpents)",
    Magha: "Pitrus (Ancestors)", PoorvaPhalguni: "Bhaga Dev (Fortune)", UttaraPhalguni: "Aryaman (Chivalry)",
    Hasta: "Savitar (Sun Deity)", Chitra: "Vishwakarma (Divine Architect)", Swati: "Vayu Dev (Wind Deity)",
    Vishakha: "Indra & Agni Dev", Dev: "Mitra Dev (Friendship)", Jyeshtha: "Indra Dev (Lord of Heaven)",
    Mula: "Nirriti (Deity of Chaos)", Poorvashadha: "Apah (Water Deity)", Uttarashadha: "Vishvedevas (All Gods)",
    Shravana: "Vishnu Dev (Preserver)", Dhanishta: "Eight Vasus (Elemental Deities)", Shatabhisha: "Varuna Dev (Ocean Deity)",
    Poorvabhadrapada: "Aja Ekapada", Uttarabhadrapada: "Ahirbudhnya", Revati: "Pushan Dev (Guardian of Journeys)"
  };
  return map[nak] || "";
}

export function getNakshatraPersonality(nak: string): string {
  const map: Record<string, string> = {
    Ashwini: "Possesses a fast, adventurous nature. Gentle, spiritually aligned, swift in action, and highly compassionate.",
    Bharani: "Stands firmly by duty and truth. Ambitious, creative, powerful, and balanced.",
    Krittika: "Assertive, sharp, protective, and possesses intense analytical abilities.",
    Rohini: "Highly creative, magnetic, intuitive, and appreciates home, beauty, and comforts.",
    Mrigashira: "Curious, highly versatile, gentle, and loves research and constant exploration.",
    Ardra: "Emotional, loyal, fierce, and goes through deep life-changing transformations.",
    Punarvasu: "Compassionate, independent, and always returns to home and spiritual roots with renewed light.",
    Pushya: "Patient, hardworking, spiritual, and naturally protective and nurturing towards others.",
    Ashlesha: "Highly independent, intuitive, clever, and possesses exceptional focus and analytical skills.",
    Magha: "Proud, ancestral-aligned, generous, and loves authority, leadership, and public honor.",
    PoorvaPhalguni: "Joyful, balanced, artistic, and seeks relaxation, comfort, and partnerships.",
    UttaraPhalguni: "Generous, chivalrous, steady, and values relationships, duty, and community.",
    Hasta: "Industrious, hardworking, highly skilled with hands, practical, and merchant-minded.",
    Chitra: "Artistic, fearless, regal, and loves beauty, architecture, design, and creative sparks.",
    Swati: "Independent, highly adaptable, business-oriented, and seeks clean spiritual balance.",
    Vishakha: "Assertive, goal-driven, powerful, and possesses great focus and determination.",
    Anuradha: "Gentle, deeply devoted, friendly, and values deep soul relationships and spiritual focus.",
    Jyeshtha: "Proud, protective, analytical, and possesses natural capacity for professional leadership.",
    Mula: "Spiritual, transformative, hardworking, and seeks deep roots, occulation, and liberation.",
    Poorvashadha: "Practical, quick, creative, and maintains highly graceful professional path.",
    Uttarashadha: "Chivalrous, unique, sharp, and excels in administration, warrior path, and duty.",
    Shravana: "Highly receptive, studious, merchant-minded, and excels in listening, teaching, and learning.",
    Dhanishta: "Auspicious, noble, wealthy, and loves music, rhythm, structures, and professional gains.",
    Shatabhisha: "Independent, stars-aligned, physician-minded, and excels in healing, technology, and reform.",
    Poorvabhadrapada: "Priest-minded, disciplined, patient, and possesses deep spiritual strength.",
    Uttarabhadrapada: "Warrior-minded, generous, steady, and excels in management, safety, and stable systems.",
    Revati: "Compassionate, straightforward, open-minded, independent, and highly kompetent in judging others."
  };
  return map[nak] || "";
}

export function getNakshatraRemedies(nak: string): string {
  const map: Record<string, string> = {
    Ashwini: "Chant 'Om Aswini Kumaraya Namah' 108 times on Tuesdays. Offer water to Sun.",
    Bharani: "Chant 'Om Yamaya Namah' on Saturdays. Keep disciplined, balanced diet.",
    Krittika: "Chant 'Om Agnaye Namah' on Sundays. Worship Kartikeya.",
    Rohini: "Chant 'Om Brahmaye Namah' on Fridays. Offer white flowers at altar.",
    Mrigashira: "Chant 'Om Somaya Namah' on Mondays. Perform green mung charity.",
    Ardra: "Chant 'Om Rudraya Namah' on Saturdays. Fast on Saturdays.",
    Punarvasu: "Chant 'Om Adityaye Namah' on Thursdays. Serve spiritual mother figures.",
    Pushya: "Chant 'Om Brihaspataye Namah' on Thursdays. Feed priests or elderly.",
    Ashlesha: "Chant 'Om Nagaya Namah' on Wednesdays. Keep absolute physical purity.",
    Magha: "Chant 'Om Pitrubhyo Namah' on Sundays. Worship ancestors.",
    PoorvaPhalguni: "Chant 'Om Bhagaya Namah' on Fridays. Offer sweets to young children.",
    UttaraPhalguni: "Chant 'Om Aryamane Namah' on Sundays. Keep clean, helpful social ties.",
    Hasta: "Chant 'Om Savitre Namah' on Wednesdays. Feed birds and practice handcrafts.",
    Chitra: "Chant 'Om Vishwakarmaye Namah' on Tuesdays. Keep creative items in east.",
    Swati: "Chant 'Om Vayave Namah' on Mondays. Light lamp in temple.",
    Vishakha: "Chant 'Om Indragnibhyo Namah' on Thursdays. Serve teachers.",
    Anuradha: "Chant 'Om Mitraya Namah' on Saturdays. Practice selfless service.",
    Jyeshtha: "Chant 'Om Indraya Namah' on Wednesdays. Support siblings.",
    Mula: "Chant 'Om Nirritaye Namah' on Tuesdays. Worship Ganesha.",
    Poorvashadha: "Chant 'Om Apahya Namah' on Fridays. Stay well-hydrated.",
    Uttarashadha: "Chant 'Om Vishvadevebhyo Namah' on Sundays. Keep disciplined rules.",
    Shravana: "Chant 'Om Vishnuye Namah' on Thursdays. Recite sacred scriptures.",
    Dhanishta: "Chant 'Om Vasubhyo Namah' on Saturdays. Support musicians.",
    Shatabhisha: "Chant 'Om Varunaya Namah' on Saturdays. Meditate during twilight.",
    Poorvabhadrapada: "Chant 'Om Aja Ekapada Namah' on Thursdays. Fast on Thursdays.",
    Uttarabhadrapada: "Chant 'Om Ahirbudhnyaya Namah' on Saturdays. Care for elderly.",
    Revati: "Chant 'Om Pushane Namah' on Mondays. Avoid taking quick decisions."
  };
  return map[nak] || "";
}
