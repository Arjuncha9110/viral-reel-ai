import {
  rahuKaalSlots,
  yamagandamSlots,
  gulikaSlots
} from "../data/panchang";

export interface TimeWindow {
  name: string;
  sanskritName: string;
  startTime: string;
  endTime: string;
  quality: "Auspicious" | "Neutral" | "Inauspicious";
  description: string;
  colorClass: string;
  isActive: boolean;
}

export interface ChoghadiyaPeriod {
  name: string;
  sanskritName: string;
  startTime: string;
  endTime: string;
  quality: "Auspicious" | "Neutral" | "Inauspicious";
  lord: string;
  colorClass: string;
  isActive: boolean;
}

const formatTimeDecimal = (decimalHours: number): string => {
  let h = Math.floor(decimalHours) % 24;
  let m = Math.round((decimalHours % 1) * 60) % 60;
  if (m === 60) {
    m = 0;
    h = (h + 1) % 24;
  }
  const period = h >= 12 ? 'pm' : 'am';
  const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  return `${displayHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
};

const parseTimeToDecimal = (timeStr: string): number => {
  const match = timeStr.toLowerCase().match(/(\d+):(\d+)\s*(am|pm)/);
  if (!match) return 6.0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const isPm = match[3] === "pm";
  if (isPm && h !== 12) h += 12;
  if (!isPm && h === 12) h = 0;
  return h + m / 60;
};

/**
 * Checks if a specific decimal hour range contains the current decimal hour
 */
const isWindowActive = (now: Date, startDec: number, endDec: number): boolean => {
  const currentDec = now.getHours() + now.getMinutes() / 60;
  if (endDec < startDec) {
    // Crosses midnight
    return currentDec >= startDec || currentDec < endDec;
  }
  return currentDec >= startDec && currentDec < endDec;
};

/**
 * Calculates standard daily Muhurtas (Brahma Muhurta, Abhijit Muhurta, Rahu Kaal, etc.)
 */
export const calculateMuhurtas = (
  date: Date,
  sunriseDate: Date,
  sunsetDate: Date
): TimeWindow[] => {
  const dayIndex = date.getDay();
  const sunriseHours = sunriseDate.getHours() + sunriseDate.getMinutes() / 60 + sunriseDate.getSeconds() / 3600;
  let sunsetHours = sunsetDate.getHours() + sunsetDate.getMinutes() / 60 + sunsetDate.getSeconds() / 3600;
  if (sunsetHours < sunriseHours) sunsetHours += 24;
  
  const dayDuration = sunsetHours - sunriseHours;
  const middayHours = (sunriseHours + sunsetHours) / 2;

  // 1. Brahma Muhurta: starts 96 mins (1.6 hrs) before sunrise, lasts 48 mins (0.8 hrs)
  const brahmaStart = sunriseHours - 1.6;
  const brahmaEnd = sunriseHours - 0.8;

  // 2. Abhijit Muhurta: midday solar hours +/- 24 mins (0.4 hrs)
  const abhijitStart = middayHours - 0.4;
  const abhijitEnd = middayHours + 0.4;

  // 3. Rahu Kaal slot
  const rahuSlot = rahuKaalSlots[dayIndex];
  const rahuPeriodDuration = dayDuration / 8;
  const rahuStart = sunriseHours + (rahuSlot - 1) * rahuPeriodDuration;
  const rahuEnd = rahuStart + rahuPeriodDuration;

  // 4. Yamagandam slot
  const yamaSlot = yamagandamSlots[dayIndex];
  const yamaPeriodDuration = dayDuration / 8;
  const yamaStart = sunriseHours + (yamaSlot - 1) * yamaPeriodDuration;
  const yamaEnd = yamaStart + yamaPeriodDuration;

  // 5. Gulika Kaal slot
  const guliSlot = gulikaSlots[dayIndex];
  const guliPeriodDuration = dayDuration / 8;
  const guliStart = sunriseHours + (guliSlot - 1) * guliPeriodDuration;
  const guliEnd = guliStart + guliPeriodDuration;

  const now = new Date();

  return [
    {
      name: "Brahma Muhurta",
      sanskritName: "ब्रह्म मुहूर्त",
      startTime: formatTimeDecimal(brahmaStart),
      endTime: formatTimeDecimal(brahmaEnd),
      quality: "Auspicious",
      description: "Pre-dawn 48-minute window. Ideal for meditation, yoga, reading, and self-reflection.",
      colorClass: "bg-green-500/10 border-green-500/20 text-green-400",
      isActive: isWindowActive(now, brahmaStart, brahmaEnd)
    },
    {
      name: "Abhijit Muhurta",
      sanskritName: "अभिजित मुहूर्त",
      startTime: formatTimeDecimal(abhijitStart),
      endTime: formatTimeDecimal(abhijitEnd),
      quality: "Auspicious",
      description: "Midday solar zenith window. Universally auspicious for beginning new jobs, travels, and transactions.",
      colorClass: "bg-green-500/10 border-green-500/20 text-green-400",
      isActive: isWindowActive(now, abhijitStart, abhijitEnd)
    },
    {
      name: "Rahu Kaal",
      sanskritName: "राहुकाल",
      startTime: formatTimeDecimal(rahuStart),
      endTime: formatTimeDecimal(rahuEnd),
      quality: "Inauspicious",
      description: "Rahu's daily influence. Avoid initiating major ventures, signing contracts, or starting new journeys.",
      colorClass: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      isActive: isWindowActive(now, rahuStart, rahuEnd)
    },
    {
      name: "Yamagandam",
      sanskritName: "यमगण्डम",
      startTime: formatTimeDecimal(yamaStart),
      endTime: formatTimeDecimal(yamaEnd),
      quality: "Inauspicious",
      description: "Ketu's influence. Avoid starting important actions or signing papers. Routine tasks only.",
      colorClass: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      isActive: isWindowActive(now, yamaStart, yamaEnd)
    },
    {
      name: "Gulika Kaal",
      sanskritName: "गुलिका काल",
      startTime: formatTimeDecimal(guliStart),
      endTime: formatTimeDecimal(guliEnd),
      quality: "Inauspicious",
      description: "Saturn's son Gulika's influence. Favorable for purchasing goods, starting long routines, but avoid major beginnings.",
      colorClass: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      isActive: isWindowActive(now, guliStart, guliEnd)
    }
  ];
};

/**
 * Traditional Choghadiya Sequence definitions based on day of week
 */
const dayChoghadiyaSequences: Record<number, string[]> = {
  0: ["Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"], // Sunday
  1: ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit"], // Monday
  2: ["Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog"],   // Tuesday
  3: ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh"],   // Wednesday
  4: ["Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh"], // Thursday
  5: ["Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal"],  // Friday
  6: ["Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal"]   // Saturday
};

// Night Choghadiya sequence shifts by 5 slots from the day sequence
const nightChoghadiyaSequences: Record<number, string[]> = {
  0: ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit"], // Sunday night
  1: ["Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal"],  // Monday night
  2: ["Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal"],   // Tuesday night
  3: ["Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"], // Wednesday night
  4: ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit"], // Thursday night
  5: ["Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog"],   // Friday night
  6: ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh"]   // Saturday night
};

const choghadiyaMetadata: Record<string, {
  sanskritName: string;
  quality: "Auspicious" | "Neutral" | "Inauspicious";
  lord: string;
  colorClass: string;
}> = {
  Shubh: { sanskritName: "शुभ", quality: "Auspicious", lord: "Jupiter", colorClass: "bg-green-500/10 text-green-400 border-green-500/20" },
  Amrit: { sanskritName: "अमृत", quality: "Auspicious", lord: "Moon", colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  Labh: { sanskritName: "लाभ", quality: "Auspicious", lord: "Mercury", colorClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  Chal: { sanskritName: "चल", quality: "Neutral", lord: "Venus", colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  Udveg: { sanskritName: "उद्वेग", quality: "Inauspicious", lord: "Sun", colorClass: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  Rog: { sanskritName: "रोग", quality: "Inauspicious", lord: "Mars", colorClass: "bg-red-500/10 text-red-400 border-red-500/20" },
  Kaal: { sanskritName: "काल", quality: "Inauspicious", lord: "Saturn", colorClass: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" }
};

/**
 * Calculates Choghadiya periods (8 day periods, 8 night periods) for the selected day
 */
export const calculateChoghadiyas = (
  date: Date,
  sunriseDate: Date,
  sunsetDate: Date
): ChoghadiyaPeriod[] => {
  const dayIndex = date.getDay();
  const sunriseHours = sunriseDate.getHours() + sunriseDate.getMinutes() / 60 + sunriseDate.getSeconds() / 3600;
  let sunsetHours = sunsetDate.getHours() + sunsetDate.getMinutes() / 60 + sunsetDate.getSeconds() / 3600;
  if (sunsetHours < sunriseHours) sunsetHours += 24;
  
  const dayDuration = sunsetHours - sunriseHours;
  const nightDuration = 24 - dayDuration;

  const dayPart = dayDuration / 8;
  const nightPart = nightDuration / 8;

  const dayNames = dayChoghadiyaSequences[dayIndex];
  const nightNames = nightChoghadiyaSequences[dayIndex];

  const now = new Date();
  const choghadiyas: ChoghadiyaPeriod[] = [];

  // Day Choghadiyas (1 to 8)
  for (let i = 0; i < 8; i++) {
    const start = sunriseHours + i * dayPart;
    const end = sunriseHours + (i + 1) * dayPart;
    const name = dayNames[i];
    const meta = choghadiyaMetadata[name];

    choghadiyas.push({
      name,
      startTime: formatTimeDecimal(start),
      endTime: formatTimeDecimal(end),
      isActive: isWindowActive(now, start, end),
      ...meta
    });
  }

  // Night Choghadiyas (9 to 16)
  for (let i = 0; i < 8; i++) {
    let start = sunsetHours + i * nightPart;
    let end = sunsetHours + (i + 1) * nightPart;

    if (start >= 24) start -= 24;
    if (end >= 24) end -= 24;

    const name = nightNames[i];
    const meta = choghadiyaMetadata[name];

    choghadiyas.push({
      name,
      startTime: formatTimeDecimal(start),
      endTime: formatTimeDecimal(end),
      isActive: isWindowActive(now, start, end),
      ...meta
    });
  }

  return choghadiyas;
};
