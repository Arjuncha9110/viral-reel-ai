import {
  DashaPeriod,
  AntardashaPeriod,
  dashaPlanets,
  totalDashaYears
} from "../../data/dasha";

import {
  getSiderealMoonLongitude,
  getNakshatraData
} from "../../panchang/astroEngine";

//
// ---------- Helpers ----------
//

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

//
// ---------- Birth Nakshatra + Balance ----------
//

export interface BirthDetails {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timezone: string;
}

const getUTCInstant = (details: BirthDetails): Date => {
  const { year, month, day, hour, minute, timezone } = details;

  // 1. Create a "naive" date representing the local time digits in UTC
  const naiveDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  // 2. We need to find the offset of the target timezone AT THIS INSTANT
  // Use Intl to find the difference between what a clock says in that TZ
  // vs what it says in UTC for the same absolute instant.
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  });

  const parts = formatter.formatToParts(naiveDate);
  const map: any = {};
  parts.forEach(p => map[p.type] = p.value);

  // Create a date using the digits reported by the formatter
  // Note: Intl often reports hour 24 as 0 of next day or just 24.
  const reportedHour = map.hour === '24' ? 0 : parseInt(map.hour);
  const tzDateNaive = new Date(Date.UTC(
    parseInt(map.year),
    parseInt(map.month) - 1,
    parseInt(map.day),
    reportedHour,
    parseInt(map.minute),
    parseInt(map.second)
  ));

  // Offset = Local Clock - UTC Clock
  const offsetMs = tzDateNaive.getTime() - naiveDate.getTime();

  // UTC Instant = Local Clock Instant - Offset
  return new Date(naiveDate.getTime() - offsetMs);
};

const calculateDashaBalance = (
  details: BirthDetails
): { planet: string; balanceDays: number; birthUTC: Date } => {

  const birthUTC = getUTCInstant(details);

  // Moon position at exact birth time
  const siderealLon = getSiderealMoonLongitude(birthUTC);
  const nakshatra = getNakshatraData(siderealLon);

  const dashaPlanet = dashaPlanets.find(p => p.name === nakshatra.lord);

  if (!dashaPlanet)
    return { planet: "Ketu", balanceDays: 0, birthUTC };

  // Remaining % of Nakshatra = 1 - percentage traversed
  const remainingFraction = 1 - nakshatra.percent;

  // Convert to remaining Dasha days
  // Standard Vimshottari uses 365.25 days per year for balance calculation
  const fullDashaDays = dashaPlanet.years * 365.25;
  const remainingDays = fullDashaDays * remainingFraction;

  return {
    planet: dashaPlanet.name,
    balanceDays: remainingDays,
    birthUTC
  };
};

//
// ---------- Antardasha Generator ----------
//

const calculateAntardasha = (
  mahadashaPlanet: string,
  startDate: Date,
  endDate: Date
): AntardashaPeriod[] => {

  const antardashas: AntardashaPeriod[] = [];

  const totalDays =
    (endDate.getTime() - startDate.getTime()) /
    (1000 * 60 * 60 * 24);

  const startIndex =
    dashaPlanets.findIndex(p => p.name === mahadashaPlanet);

  let currentDate = new Date(startDate);

  for (let i = 0; i < 9; i++) {
    const planetIndex = (startIndex + i) % 9;
    const planet = dashaPlanets[planetIndex];

    const proportionalDays =
      (planet.years / totalDashaYears) * totalDays;

    const adStart = new Date(currentDate);
    const adEnd = addDays(currentDate, proportionalDays);

    antardashas.push({
      planet: planet.name,
      startDate: adStart,
      endDate: adEnd,
      months: Math.floor(proportionalDays / 30.44),
      days: Math.round(proportionalDays % 30.44)
    });

    currentDate = adEnd;
  }

  return antardashas;
};

//
// ---------- Mahadasha Timeline ----------
//

export const calculateSampleDasha = (
  details: BirthDetails
): DashaPeriod[] => {

  const dashas: DashaPeriod[] = [];

  const balance = calculateDashaBalance(details);

  const startIndex =
    dashaPlanets.findIndex(p => p.name === balance.planet);

  let currentDate = new Date(balance.birthUTC);

  //
  // FIRST DASHA — remaining portion only
  //

  const firstPlanet = dashaPlanets[startIndex];

  const firstEndDate =
    addDays(currentDate, balance.balanceDays);

  const firstDasha: DashaPeriod = {
    planet: firstPlanet.name,
    startDate: new Date(currentDate),
    endDate: firstEndDate,
    years: balance.balanceDays / 365.25,
    antardashas: calculateAntardasha(
      firstPlanet.name,
      currentDate,
      firstEndDate
    )
  };

  dashas.push(firstDasha);

  currentDate = firstEndDate;

  //
  // Remaining Dashas — Full duration cycles
  //

  for (let i = 1; i < 9; i++) {

    const planetIndex = (startIndex + i) % 9;
    const planet = dashaPlanets[planetIndex];

    const start = new Date(currentDate);
    const end = addDays(start, planet.years * 365.25);

    const dasha: DashaPeriod = {
      planet: planet.name,
      startDate: start,
      endDate: end,
      years: planet.years,
      antardashas: calculateAntardasha(
        planet.name,
        start,
        end
      )
    };

    dashas.push(dasha);

    currentDate = end;
  }

  return dashas;
};

//
// ---------- Current Period Detector ----------
//

export const getCurrentDasha = (
  dashas: DashaPeriod[]
): {
  mahadasha: DashaPeriod | null;
  antardasha: AntardashaPeriod | null;
} => {

  const now = new Date();

  for (const dasha of dashas) {
    if (now >= dasha.startDate && now <= dasha.endDate) {

      const ad =
        dasha.antardashas?.find(
          a => now >= a.startDate && now <= a.endDate
        ) || null;

      return { mahadasha: dasha, antardasha: ad };
    }
  }

  return { mahadasha: null, antardasha: null };
};


//
// ---------- Formatting Helper ----------
//

export const formatDashaDuration = (
  years: number,
  months?: number,
  days?: number
): string => {

  const parts: string[] = [];

  const fullYears = Math.floor(years);
  const remMonths =
    months ?? Math.round((years % 1) * 12);

  if (fullYears > 0) parts.push(`${fullYears}Y`);
  if (remMonths > 0) parts.push(`${remMonths}M`);
  if (days && days > 0) parts.push(`${days}D`);

  return parts.join(" ") || "0D";
};
