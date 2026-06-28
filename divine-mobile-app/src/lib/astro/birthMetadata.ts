/**
 * birthMetadata.ts
 *
 * Computes REAL, deterministic Vedic birth metadata directly from the locally
 * calculated chart (kundaliEngine) — no external API required.
 *
 * Everything in here is pure astronomy / classical definitions (Tithi, Yoga,
 * Karana, Nakshatra attributes, sign lords, rise/set times). These are facts
 * derived from planetary longitudes, NOT predictive interpretations.
 *
 * Nothing here invents predictive paragraphs or marriage/career conclusions.
 */

import type { PlanetPosition } from "./kundaliEngine";
import { getLahiriAyanamsha } from "./ephemeris";
import { decimalToDMS, formatDMS } from "./planetFormatters";
import { Body, Observer, SearchRiseSet } from "./astronomy-core";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

// Rashi (sign) lords
const SIGN_LORDS: Record<string, string> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

const DAY_LORDS: Record<string, string> = {
  Sunday: "Sun",
  Monday: "Moon",
  Tuesday: "Mars",
  Wednesday: "Mercury",
  Thursday: "Jupiter",
  Friday: "Venus",
  Saturday: "Saturn",
};

const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

// 27 Nakshatras with their classical attributes.
// lord = Vimshottari dasha lord; deity, gana and symbol are classical fixed values.
type NakshatraInfo = { name: string; lord: string; deity: string; gana: string; symbol: string };

const NAKSHATRA_TABLE: NakshatraInfo[] = [
  { name: "Ashwini", lord: "Ketu", deity: "Ashwini Kumaras", gana: "Deva", symbol: "Horse's head" },
  { name: "Bharani", lord: "Venus", deity: "Yama", gana: "Manushya", symbol: "Yoni" },
  { name: "Krittika", lord: "Sun", deity: "Agni", gana: "Rakshasa", symbol: "Razor / Flame" },
  { name: "Rohini", lord: "Moon", deity: "Brahma (Prajapati)", gana: "Manushya", symbol: "Ox cart / Chariot" },
  { name: "Mrigashirsha", lord: "Mars", deity: "Soma (Chandra)", gana: "Deva", symbol: "Deer's head" },
  { name: "Ardra", lord: "Rahu", deity: "Rudra", gana: "Manushya", symbol: "Teardrop / Diamond" },
  { name: "Punarvasu", lord: "Jupiter", deity: "Aditi", gana: "Deva", symbol: "Bow & quiver" },
  { name: "Pushya", lord: "Saturn", deity: "Brihaspati", gana: "Deva", symbol: "Cow's udder / Lotus" },
  { name: "Ashlesha", lord: "Mercury", deity: "Nagas", gana: "Rakshasa", symbol: "Coiled serpent" },
  { name: "Magha", lord: "Ketu", deity: "Pitris", gana: "Rakshasa", symbol: "Royal throne" },
  { name: "Purva Phalguni", lord: "Venus", deity: "Bhaga", gana: "Manushya", symbol: "Front legs of bed" },
  { name: "Uttara Phalguni", lord: "Sun", deity: "Aryaman", gana: "Manushya", symbol: "Back legs of bed" },
  { name: "Hasta", lord: "Moon", deity: "Savitar (Sun)", gana: "Deva", symbol: "Hand / Palm" },
  { name: "Chitra", lord: "Mars", deity: "Vishvakarma (Tvashtar)", gana: "Rakshasa", symbol: "Bright jewel / Pearl" },
  { name: "Swati", lord: "Rahu", deity: "Vayu", gana: "Deva", symbol: "Young shoot / Coral" },
  { name: "Vishakha", lord: "Jupiter", deity: "Indra-Agni", gana: "Rakshasa", symbol: "Triumphal arch" },
  { name: "Anuradha", lord: "Saturn", deity: "Mitra", gana: "Deva", symbol: "Lotus / Gateway" },
  { name: "Jyeshtha", lord: "Mercury", deity: "Indra", gana: "Rakshasa", symbol: "Circular amulet / Earring" },
  { name: "Mula", lord: "Ketu", deity: "Nirriti", gana: "Rakshasa", symbol: "Bunch of roots / Lion's tail" },
  { name: "Purva Ashadha", lord: "Venus", deity: "Apas (Waters)", gana: "Manushya", symbol: "Elephant tusk / Fan" },
  { name: "Uttara Ashadha", lord: "Sun", deity: "Vishvedevas", gana: "Manushya", symbol: "Elephant tusk / Planks" },
  { name: "Shravana", lord: "Moon", deity: "Vishnu", gana: "Deva", symbol: "Ear / Three footprints" },
  { name: "Dhanishtha", lord: "Mars", deity: "Vasus", gana: "Rakshasa", symbol: "Drum / Flute" },
  { name: "Shatabhisha", lord: "Rahu", deity: "Varuna", gana: "Rakshasa", symbol: "Empty circle / 100 flowers" },
  { name: "Purva Bhadrapada", lord: "Jupiter", deity: "Aja Ekapada", gana: "Manushya", symbol: "Front of funeral cot" },
  { name: "Uttara Bhadrapada", lord: "Saturn", deity: "Ahir Budhnya", gana: "Manushya", symbol: "Back of funeral cot / Serpent" },
  { name: "Revati", lord: "Mercury", deity: "Pushan", gana: "Deva", symbol: "Fish / Drum" },
];

const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
];

const YOGA_NAMES = [
  "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
  "Sukarman", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata",
  "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
];

const MOVABLE_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];

const normalize = (deg: number) => ((deg % 360) + 360) % 360;

export type RiseSetTimes = {
  available: boolean;
  sunrise: string | null;
  sunset: string | null;
  moonrise: string | null;
  moonset: string | null;
  dayLength: string | null;
};

export type BirthMetadata = {
  // Real values derived locally
  ayanamsa: string;             // e.g. "24° 12′ 34″ (Lahiri / Chitrapaksha)"
  sunSign: string;              // sidereal Sun rashi
  moonSign: string;             // Rasi (Moon sign)
  moonSignLord: string;         // Rasi lord
  lagna: string;                // Ascendant sign
  lagnaLord: string;            // Ascendant lord
  nakshatra: string;            // Birth star (from Moon)
  pada: number;                 // Birth star pada (from Moon)
  nakshatraLord: string;
  nakshatraDeity: string;
  nakshatraGana: string;
  nakshatraSymbol: string;
  tithi: string;                // e.g. "Shukla Saptami"
  paksha: string;               // Shukla / Krishna
  tithiNumber: number;
  yoga: string;                 // Nitya yoga
  karana: string;
  vara: string;                 // Weekday
  varaLord: string;
  riseSet: RiseSetTimes;
  charaKarakas: {
    atma: string | null;
    amatya: string | null;
    bhratri: string | null;
    matri: string | null;
    putra: string | null;
    gnati: string | null;
    dara: string | null;
  };
  arudha: {
    lagna: string | null;
    dhana: string | null;
  };
  // Deterministic chart condition (factual, not a prediction)
  mangalDosha: boolean | null;
  mangalDoshaNote: string | null;
};

const findPlanet = (planets: PlanetPosition[], name: string) =>
  planets.find((p) => p.name === name) || null;

const formatInTz = (date: Date, timezone: string): string | null => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return null;
  }
};

const computeRiseSet = (
  localMidnightUTC: Date,
  lat: number,
  lon: number,
  timezone: string,
): RiseSetTimes => {
  const empty: RiseSetTimes = {
    available: false,
    sunrise: null,
    sunset: null,
    moonrise: null,
    moonset: null,
    dayLength: null,
  };
  try {
    const observer = new Observer(lat, lon, 0);
    // Search within the local day. Start a little before local midnight in UTC
    // to be safe, then take the first rise/set inside a ~1.5 day window.
    const start = new Date(localMidnightUTC.getTime() - 6 * 3600 * 1000);

    const sunriseT = SearchRiseSet(Body.Sun, observer, +1, start, 2);
    const sunsetT = SearchRiseSet(Body.Sun, observer, -1, start, 2);
    const moonriseT = SearchRiseSet(Body.Moon, observer, +1, start, 2);
    const moonsetT = SearchRiseSet(Body.Moon, observer, -1, start, 2);

    const sunrise = sunriseT ? formatInTz(sunriseT.date, timezone) : null;
    const sunset = sunsetT ? formatInTz(sunsetT.date, timezone) : null;
    const moonrise = moonriseT ? formatInTz(moonriseT.date, timezone) : null;
    const moonset = moonsetT ? formatInTz(moonsetT.date, timezone) : null;

    let dayLength: string | null = null;
    if (sunriseT && sunsetT) {
      let ms = sunsetT.date.getTime() - sunriseT.date.getTime();
      if (ms < 0) ms += 24 * 3600 * 1000;
      const hours = Math.floor(ms / (3600 * 1000));
      const minutes = Math.round((ms % (3600 * 1000)) / (60 * 1000));
      dayLength = `${hours}h ${minutes}m`;
    }

    return {
      available: Boolean(sunrise || sunset || moonrise || moonset),
      sunrise,
      sunset,
      moonrise,
      moonset,
      dayLength,
    };
  } catch {
    return empty;
  }
};

/**
 * Mangal (Manglik) Dosha — a deterministic chart condition, not a prediction.
 * Classical Lagna-reference rule: Mars in houses 1, 2, 4, 7, 8 or 12 from the
 * Ascendant. We report only the factual presence/absence of this placement.
 */
const computeMangalDosha = (
  planets: PlanetPosition[],
): { present: boolean | null; note: string | null } => {
  const mars = findPlanet(planets, "Mars");
  if (!mars) return { present: null, note: null };
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const present = manglikHouses.includes(mars.house);
  return {
    present,
    note: present
      ? `Mars occupies house ${mars.house} from Lagna (a Mangal Dosha house).`
      : `Mars occupies house ${mars.house} from Lagna (outside Mangal Dosha houses).`,
  };
};

const computeCharaKarakas = (planets: PlanetPosition[]) => {
  const eligible = planets
    .filter((planet) =>
      ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(planet.name),
    )
    .sort((a, b) => {
      if (b.degree !== a.degree) return b.degree - a.degree;
      return b.longitude - a.longitude;
    });

  const ordered = [
    "atma",
    "amatya",
    "bhratri",
    "matri",
    "putra",
    "gnati",
    "dara",
  ] as const;

  return ordered.reduce(
    (acc, key, index) => {
      acc[key] = eligible[index]?.name ?? null;
      return acc;
    },
    {
      atma: null,
      amatya: null,
      bhratri: null,
      matri: null,
      putra: null,
      gnati: null,
      dara: null,
    } as BirthMetadata["charaKarakas"],
  );
};

const signIndexFromName = (name: string) => SIGNS.indexOf(name);

const computeArudhaPada = (
  planets: PlanetPosition[],
  sourceSignIdx: number,
): string | null => {
  const sourceSign = SIGNS[sourceSignIdx];
  const lordName = SIGN_LORDS[sourceSign];
  const lordPlanet = findPlanet(planets, lordName);
  const lordSignIdx = lordPlanet ? signIndexFromName(lordPlanet.sign) : -1;

  if (!lordPlanet || lordSignIdx < 0) return null;

  const distance = ((lordSignIdx - sourceSignIdx + 12) % 12) + 1;
  const targetSignIdx =
    distance === 1 || distance === 7
      ? (lordSignIdx + 9) % 12
      : (lordSignIdx + distance - 1) % 12;

  return SIGNS[targetSignIdx] || null;
};

export type ComputeBirthMetadataArgs = {
  planets: PlanetPosition[];
  ascendant: number;       // sidereal ascendant longitude
  lagnaSignIdx: number;
  birthUTC: Date;
  localMidnightUTC: Date;
  weekdayIndex: number;    // 0 = Sunday, from the local birth date
  lat: number;
  lon: number;
  timezone: string;
};

export const computeBirthMetadata = (args: ComputeBirthMetadataArgs): BirthMetadata => {
  const { planets, ascendant, lagnaSignIdx, birthUTC, localMidnightUTC, weekdayIndex, lat, lon, timezone } = args;

  const moon = findPlanet(planets, "Moon");
  const sun = findPlanet(planets, "Sun");

  const moonLon = moon ? moon.longitude : 0;
  const sunLon = sun ? sun.longitude : 0;

  // Ayanamsa
  const ayanValue = getLahiriAyanamsha(birthUTC);
  const ayanamsa = `${formatDMS(decimalToDMS(ayanValue))} (Lahiri / Chitrapaksha)`;

  // Signs / lords
  const lagna = SIGNS[lagnaSignIdx] || "-";
  const lagnaLord = SIGN_LORDS[lagna] || "-";
  const moonSign = moon ? moon.sign : "-";
  const moonSignLord = moon ? SIGN_LORDS[moon.sign] || "-" : "-";
  const sunSign = sun ? sun.sign : "-";

  // Nakshatra (from Moon)
  const span = 360 / 27;
  const nakIndex = moon ? Math.floor(normalize(moonLon) / span) : 0;
  const nakInfo = NAKSHATRA_TABLE[nakIndex] || NAKSHATRA_TABLE[0];
  const pada = moon ? moon.pada : 0;

  // Tithi (lunar day): angular elongation Moon - Sun, 12° each, 30 tithis
  const elongation = normalize(moonLon - sunLon);
  const tithiIndex = Math.floor(elongation / 12) % 30; // 0-29
  const tithiNumber = (tithiIndex % 15) + 1;           // 1-15
  const paksha = tithiIndex < 15 ? "Shukla" : "Krishna";
  const tithiName = TITHI_NAMES[tithiNumber - 1] || `Tithi ${tithiNumber}`;
  const tithi = `${paksha} ${tithiName}`;

  // Yoga (Nitya Yoga): (Sun longitude + Moon longitude) / (360/27)
  const yogaIndex = Math.floor(normalize(sunLon + moonLon) / (360 / 27)) % 27;
  const yoga = YOGA_NAMES[yogaIndex] || "-";

  // Karana (half of a tithi)
  const karanaIndex = tithiIndex * 2 + (elongation % 12 >= 6 ? 1 : 0);
  let karana = "-";
  if (karanaIndex === 0) {
    karana = "Kimstughna";
  } else if (karanaIndex >= 57) {
    const fixed = ["Shakuni", "Chatushpada", "Naga", "Kimstughna"];
    karana = fixed[karanaIndex - 57] || "-";
  } else {
    karana = MOVABLE_KARANAS[(karanaIndex - 1) % 7] || "-";
  }

  // Vara (weekday)
  const vara = WEEKDAYS[weekdayIndex] || "-";
  const varaLord = DAY_LORDS[vara] || "-";

  // Rise/set times
  const riseSet = computeRiseSet(localMidnightUTC, lat, lon, timezone);

  // Chara Karakas
  const charaKarakas = computeCharaKarakas(planets);

  // Arudha Pada (Lagna)
  const arudhaLagna = computeArudhaPada(planets, lagnaSignIdx);

  // Dhana Arudha (2nd house lord's arudha)
  const dhanaSignIdx = (lagnaSignIdx + 1) % 12;
  const arudhaDhana = computeArudhaPada(planets, dhanaSignIdx);

  // Mangal Dosha
  const { present: mangalDosha, note: mangalDoshaNote } = computeMangalDosha(planets);

  return {
    ayanamsa,
    sunSign,
    moonSign,
    moonSignLord,
    lagna,
    lagnaLord,
    nakshatra: nakInfo.name,
    pada,
    nakshatraLord: nakInfo.lord,
    nakshatraDeity: nakInfo.deity,
    nakshatraGana: nakInfo.gana,
    nakshatraSymbol: nakInfo.symbol,
    tithi,
    paksha,
    tithiNumber,
    yoga,
    karana,
    vara,
    varaLord,
    riseSet,
    charaKarakas,
    arudha: {
      lagna: arudhaLagna,
      dhana: arudhaDhana,
    },
    mangalDosha,
    mangalDoshaNote,
  };
};
