import { format } from "date-fns";
import type { AntardashaPeriod, DashaPeriod } from "@/lib/dashaData";
import type { HoraPeriod, PanchangData } from "@/lib/panchangData";

export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_AYANAMSA = "1";
export const DEFAULT_TIMEZONE = "Asia/Kolkata";
export const INDIA_UTC_OFFSET = "+05:30";

const isLocalPreviewHost = () => {
  if (typeof window === "undefined") return false;

  const { hostname } = window.location;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
};

export type AstrologyErrorStatus = "unconfigured" | "error";

export type AstrologyApiFailure = {
  status: AstrologyErrorStatus;
  message: string;
  details?: unknown;
};

export type AstrologyApiSuccess<T> = {
  status: "live";
  source: "prokerala";
  data: T;
  message?: string;
};

export type AstrologyApiResult<T> = AstrologyApiSuccess<T> | AstrologyApiFailure;

export type AstrologyLocation = {
  city: string;
  state: string;
  timezone: string;
  lat: number;
  lng: number;
};

export type LivePanchangData = {
  date: string;
  day: string;
  tithi: {
    name: string | null;
    endTime: string | null;
    paksha?: string | null;
    tithiNumber?: number | null;
  };
  nakshatra: {
    name: string | null;
    endTime: string | null;
    lord?: string | null;
    pada?: number | null;
  };
  yoga: {
    name: string | null;
    endTime: string | null;
  };
  karana: {
    name: string | null;
    endTime: string | null;
  };
  sunrise: string | null;
  sunset: string | null;
  moonrise: string | null;
  moonset: string | null;
  rahuKaal: string | null;
  yamagandam: string | null;
  gulikaKaal: string | null;
  abhijitMuhurat: string | null;
  auspiciousTimings: string[];
  inauspiciousTimings: string[];
};

export type LiveDashaData = {
  dashas: Array<{
    planet: string;
    startDate: string;
    endDate: string;
    years: number;
    antardashas?: Array<{
      planet: string;
      startDate: string;
      endDate: string;
      months: number;
      days: number;
    }>;
  }>;
};

export type LiveKundliData = {
  moonSign: string | null;
  moonSignLord: string | null;
  sunSign: string | null;
  sunSignLord: string | null;
  zodiac: string | null;
  nakshatra: string | null;
  nakshatraLord: string | null;
  pada: unknown;
  additionalInfo: Record<string, string | null>;
  hasMangalDosha: boolean | null;
  mangalDoshaDescription: string | null;
  yogaHighlights: string[];
};

export type LiveSadeSatiData = {
  inSadeSati: boolean | null;
  transitPhase: string | null;
  description: string | null;
  moonSign: string | null;
  transits: Array<{
    saturnSign: string | null;
    phase: string | null;
    start: string | null;
    end: string | null;
    isRetrograde: boolean | null;
    description: string | null;
  }>;
};

const HORA_SEQUENCE = [
  { name: "Sun", symbol: "\u2609" },
  { name: "Venus", symbol: "\u2640" },
  { name: "Mercury", symbol: "\u263F" },
  { name: "Moon", symbol: "\u263D" },
  { name: "Saturn", symbol: "\u2644" },
  { name: "Jupiter", symbol: "\u2643" },
  { name: "Mars", symbol: "\u2642" },
];

const DAY_LORDS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

const RAHU_KAAL_SLOTS: Record<number, number> = {
  0: 8,
  1: 2,
  2: 7,
  3: 5,
  4: 6,
  5: 4,
  6: 3,
};

const YAMAGANDAM_SLOTS: Record<number, number> = {
  0: 5,
  1: 4,
  2: 3,
  3: 2,
  4: 1,
  5: 7,
  6: 6,
};

const GULIKA_SLOTS: Record<number, number> = {
  0: 7,
  1: 6,
  2: 5,
  3: 4,
  4: 3,
  5: 2,
  6: 1,
};

const requestAstrology = async <T>(
  path: string,
  params: Record<string, string | undefined>
): Promise<AstrologyApiResult<T>> => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const response = await fetch(`${path}?${query.toString()}`);
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();

  if (contentType.includes("text/html") || /^\s*</.test(rawText)) {
    return {
      status: "unconfigured",
      message: isLocalPreviewHost()
        ? "This local preview is not running Cloudflare Pages Functions. The exact live result will start working after we test with `wrangler pages dev dist` or on the deployed Pages site with credentials set."
        : "This environment is not returning the Pages Functions response yet. Test with `wrangler pages dev dist` or the deployed Pages site once credentials are set.",
    };
  }

  const payload = rawText
    ? (() => {
        try {
          return JSON.parse(rawText);
        } catch {
          return null;
        }
      })()
    : null;

  if (!payload || typeof payload !== "object") {
    return {
      status: "unconfigured",
      message: isLocalPreviewHost()
        ? "This local preview cannot return live astrology JSON yet. The page will stay in fallback mode until we run it through Wrangler Pages or the deployed site."
        : "The astrology API endpoint is not returning JSON in this environment yet. The page will stay on the preview/fallback experience for now.",
    };
  }

  return payload as AstrologyApiResult<T>;
};

const parseDisplayTimeToHours = (value: string | null | undefined) => {
  if (!value) return null;

  const match = value.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours + minutes / 60;
};

const formatDisplayTime = (hoursValue: number) => {
  let hours = hoursValue;
  if (hours < 0) hours += 24;
  if (hours >= 24) hours -= 24;

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  const safeHours = minutes === 60 ? (wholeHours + 1) % 24 : wholeHours;
  const safeMinutes = minutes === 60 ? 0 : minutes;
  const period = safeHours >= 12 ? "PM" : "AM";
  const displayHour = safeHours % 12 === 0 ? 12 : safeHours % 12;

  return `${displayHour.toString().padStart(2, "0")}:${safeMinutes
    .toString()
    .padStart(2, "0")} ${period}`;
};

const buildPeriodFromSlot = (slot: number, sunriseHours: number, sunsetHours: number) => {
  const dayDuration = sunsetHours - sunriseHours;
  const duration = dayDuration / 8;
  const start = sunriseHours + (slot - 1) * duration;
  const end = start + duration;
  return `${formatDisplayTime(start)} - ${formatDisplayTime(end)}`;
};

const buildHoraPeriods = (date: Date, sunriseHours: number, sunsetHours: number): HoraPeriod[] => {
  const dayLordName = DAY_LORDS[date.getDay()];
  const startIndex = HORA_SEQUENCE.findIndex((hora) => hora.name === dayLordName);
  const dayDuration = sunsetHours - sunriseHours;
  const nightDuration = 24 - dayDuration;
  const dayHoraDuration = dayDuration / 12;
  const nightHoraDuration = nightDuration / 12;
  const hours: HoraPeriod[] = [];

  for (let index = 0; index < 12; index += 1) {
    const planet = HORA_SEQUENCE[(startIndex + index) % HORA_SEQUENCE.length];
    const start = sunriseHours + index * dayHoraDuration;
    const end = sunriseHours + (index + 1) * dayHoraDuration;

    hours.push({
      planet: planet.name,
      symbol: planet.symbol,
      startTime: formatDisplayTime(start),
      endTime: formatDisplayTime(end),
      isDay: true,
    });
  }

  for (let index = 0; index < 12; index += 1) {
    const planet = HORA_SEQUENCE[(startIndex + 12 + index) % HORA_SEQUENCE.length];
    const start = sunsetHours + index * nightHoraDuration;
    const end = sunsetHours + (index + 1) * nightHoraDuration;

    hours.push({
      planet: planet.name,
      symbol: planet.symbol,
      startTime: formatDisplayTime(start),
      endTime: formatDisplayTime(end),
      isDay: false,
    });
  }

  return hours;
};

const mergeUnique = (primary: string[], fallback: string[]) =>
  Array.from(new Set([...primary.filter(Boolean), ...fallback.filter(Boolean)]));

export const buildCoordinates = (location: AstrologyLocation) => `${location.lat},${location.lng}`;

export const buildIndianDateTime = (date: Date, time = "12:00") =>
  `${format(date, "yyyy-MM-dd")}T${time}:00${INDIA_UTC_OFFSET}`;

export const fetchLivePanchang = (date: Date, location: AstrologyLocation) =>
  requestAstrology<LivePanchangData>("/api/astrology/panchang", {
    coordinates: buildCoordinates(location),
    datetime: buildIndianDateTime(date, "12:00"),
    timezone: location.timezone || DEFAULT_TIMEZONE,
    ayanamsa: DEFAULT_AYANAMSA,
    resultType: "advanced",
    la: DEFAULT_LANGUAGE,
  });

export const fetchLiveDasha = (birthDate: Date, birthTime: string, location: AstrologyLocation) =>
  requestAstrology<LiveDashaData>("/api/astrology/dasha", {
    coordinates: buildCoordinates(location),
    datetime: buildIndianDateTime(birthDate, birthTime),
    timezone: location.timezone || DEFAULT_TIMEZONE,
    ayanamsa: DEFAULT_AYANAMSA,
    la: DEFAULT_LANGUAGE,
  });

export const fetchLiveKundli = (birthDate: Date, birthTime: string, location: AstrologyLocation) =>
  requestAstrology<LiveKundliData>("/api/astrology/kundli", {
    coordinates: buildCoordinates(location),
    datetime: buildIndianDateTime(birthDate, birthTime),
    timezone: location.timezone || DEFAULT_TIMEZONE,
    ayanamsa: DEFAULT_AYANAMSA,
    resultType: "advanced",
    la: DEFAULT_LANGUAGE,
  });

export const fetchLiveSadeSati = (birthDate: Date, birthTime: string, location: AstrologyLocation) =>
  requestAstrology<LiveSadeSatiData>("/api/astrology/sade-sati", {
    coordinates: buildCoordinates(location),
    datetime: buildIndianDateTime(birthDate, birthTime),
    timezone: location.timezone || DEFAULT_TIMEZONE,
    ayanamsa: DEFAULT_AYANAMSA,
    resultType: "advanced",
  });

export const mergePanchangWithLive = (
  fallback: PanchangData,
  live: LivePanchangData,
  date: Date
): PanchangData => {
  const sunriseHours = parseDisplayTimeToHours(live.sunrise || fallback.sunrise);
  const sunsetHours = parseDisplayTimeToHours(live.sunset || fallback.sunset);

  const derivedHora =
    sunriseHours !== null && sunsetHours !== null
      ? buildHoraPeriods(date, sunriseHours, sunsetHours)
      : fallback.hora;

  return {
    ...fallback,
    date: live.date || fallback.date,
    day: live.day || fallback.day,
    tithi: {
      ...fallback.tithi,
      name: live.tithi.name || fallback.tithi.name,
      endTime: live.tithi.endTime || fallback.tithi.endTime,
      paksha: live.tithi.paksha || fallback.tithi.paksha,
      tithiNumber: live.tithi.tithiNumber || fallback.tithi.tithiNumber,
    },
    nakshatra: {
      ...fallback.nakshatra,
      name: live.nakshatra.name || fallback.nakshatra.name,
      endTime: live.nakshatra.endTime || fallback.nakshatra.endTime,
      lord: live.nakshatra.lord || fallback.nakshatra.lord,
      pada: Number(live.nakshatra.pada || fallback.nakshatra.pada),
    },
    yoga: {
      ...fallback.yoga,
      name: live.yoga.name || fallback.yoga.name,
      endTime: live.yoga.endTime || fallback.yoga.endTime,
    },
    karana: {
      ...fallback.karana,
      name: live.karana.name || fallback.karana.name,
      endTime: live.karana.endTime || fallback.karana.endTime,
    },
    sunrise: live.sunrise || fallback.sunrise,
    sunset: live.sunset || fallback.sunset,
    moonrise: live.moonrise || fallback.moonrise,
    moonset: live.moonset || fallback.moonset,
    rahuKaal:
      live.rahuKaal ||
      (sunriseHours !== null && sunsetHours !== null
        ? buildPeriodFromSlot(RAHU_KAAL_SLOTS[date.getDay()], sunriseHours, sunsetHours)
        : fallback.rahuKaal),
    yamagandam:
      live.yamagandam ||
      (sunriseHours !== null && sunsetHours !== null
        ? buildPeriodFromSlot(YAMAGANDAM_SLOTS[date.getDay()], sunriseHours, sunsetHours)
        : fallback.yamagandam),
    gulikaKaal:
      live.gulikaKaal ||
      (sunriseHours !== null && sunsetHours !== null
        ? buildPeriodFromSlot(GULIKA_SLOTS[date.getDay()], sunriseHours, sunsetHours)
        : fallback.gulikaKaal),
    abhijitMuhurat: live.abhijitMuhurat || fallback.abhijitMuhurat,
    auspiciousTimings: mergeUnique(live.auspiciousTimings, fallback.auspiciousTimings),
    inauspiciousTimings: mergeUnique(live.inauspiciousTimings, fallback.inauspiciousTimings),
    hora: derivedHora,
  };
};

export const mapLiveDashaPeriods = (value: LiveDashaData["dashas"]): DashaPeriod[] =>
  value.map((period) => ({
    planet: period.planet,
    startDate: new Date(period.startDate),
    endDate: new Date(period.endDate),
    years: period.years,
    antardashas: (period.antardashas || []).map<AntardashaPeriod>((item) => ({
      planet: item.planet,
      startDate: new Date(item.startDate),
      endDate: new Date(item.endDate),
      months: item.months,
      days: item.days,
    })),
  }));
