import { HoraPeriod, horaSequence, dayLords } from "../data/panchang";

export interface PremiumHoraPeriod extends HoraPeriod {
  sanskritName: string;
  energyTheme: string;
  description: string;
  auspiciousness: "Auspicious" | "Neutral" | "Avoid";
  badgeColor: string;
  glowColor: string;
  index: number;
}

export const horaPlanetMetadata: Record<string, {
  sanskritName: string;
  energyTheme: string;
  description: string;
  auspiciousness: "Auspicious" | "Neutral" | "Avoid";
  badgeColor: string;
  glowColor: string;
}> = {
  Jupiter: {
    sanskritName: "बृहस्पति (Brihaspati)",
    energyTheme: "Wisdom, expansion, and spiritual grace",
    description: "Highly auspicious for beginning new ventures, marriage, wealth, learning, and seeking counsel.",
    auspiciousness: "Auspicious",
    badgeColor: "bg-green-500/10 text-green-400 border-green-500/20",
    glowColor: "rgba(34, 197, 94, 0.15)"
  },
  Venus: {
    sanskritName: "शुक्र (Shukra)",
    energyTheme: "Creativity, harmony, and love",
    description: "Auspicious for relationships, fine arts, buying clothes or vehicles, beauty treatments, and luxury.",
    auspiciousness: "Auspicious",
    badgeColor: "bg-green-500/10 text-green-400 border-green-500/20",
    glowColor: "rgba(34, 197, 94, 0.15)"
  },
  Mercury: {
    sanskritName: "बुध (Budha)",
    energyTheme: "Commerce, intellect, and writing",
    description: "Auspicious for business deals, study, coding, signing agreements, meetings, and short journeys.",
    auspiciousness: "Auspicious",
    badgeColor: "bg-green-500/10 text-green-400 border-green-500/20",
    glowColor: "rgba(34, 197, 94, 0.15)"
  },
  Sun: {
    sanskritName: "सूर्य (Surya)",
    energyTheme: "Authority, confidence, and status",
    description: "Neutral. Excellent for political work, meeting authorities, administrative tasks, and taking charge.",
    auspiciousness: "Neutral",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    glowColor: "rgba(245, 158, 11, 0.15)"
  },
  Moon: {
    sanskritName: "चन्द्र (Chandra)",
    energyTheme: "Emotion, nurturing, and travel",
    description: "Neutral. Excellent for domestic tasks, journeying, nursing, gardening, and intuitive decisions.",
    auspiciousness: "Neutral",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    glowColor: "rgba(245, 158, 11, 0.15)"
  },
  Mars: {
    sanskritName: "मंगल (Mangala)",
    energyTheme: "Courage, physical fire, and competition",
    description: "Avoid for peaceful starts. Good for exercise, sports, technical work, litigations, and courage.",
    auspiciousness: "Avoid",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    glowColor: "rgba(244, 63, 94, 0.15)"
  },
  Saturn: {
    sanskritName: "शनि (Shani)",
    energyTheme: "Discipline, patience, and duty",
    description: "Avoid for auspicious starts. Excellent for grounding, structural tasks, chores, routines, and persistence.",
    auspiciousness: "Avoid",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    glowColor: "rgba(244, 63, 94, 0.15)"
  }
};

const formatTime = (hours: number, minutes: number): string => {
  const h = Math.floor(hours) % 24;
  const m = Math.round(minutes) % 60;
  const period = h >= 12 ? 'pm' : 'am';
  const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  return `${displayHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
};

export const calculateHorasForDay = (date: Date, sunriseDate: Date, sunsetDate: Date): PremiumHoraPeriod[] => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday...
  const dayLordName = dayLords[dayOfWeek];
  const startIndex = horaSequence.findIndex(h => h.name === dayLordName);

  const sunriseHours = sunriseDate.getHours() + sunriseDate.getMinutes() / 60 + sunriseDate.getSeconds() / 3600;
  let sunsetHours = sunsetDate.getHours() + sunsetDate.getMinutes() / 60 + sunsetDate.getSeconds() / 3600;
  if (sunsetHours < sunriseHours) sunsetHours += 24;

  const dayDuration = sunsetHours - sunriseHours;
  const nightDuration = 24 - dayDuration;
  const dayHoraDuration = dayDuration / 12;
  const nightHoraDuration = nightDuration / 12;

  const horas: PremiumHoraPeriod[] = [];

  // 12 Day Horas (Sunrise to Sunset)
  for (let i = 0; i < 12; i++) {
    const planetIndex = (startIndex + i) % 7;
    const planet = horaSequence[planetIndex];
    const startHours = sunriseHours + i * dayHoraDuration;
    const endHours = sunriseHours + (i + 1) * dayHoraDuration;

    const meta = horaPlanetMetadata[planet.name];

    horas.push({
      planet: planet.name,
      symbol: planet.symbol,
      startTime: formatTime(startHours, (startHours % 1) * 60),
      endTime: formatTime(endHours, (endHours % 1) * 60),
      isDay: true,
      index: i + 1,
      ...meta
    });
  }

  // 12 Night Horas (Sunset to Next Sunrise)
  for (let i = 0; i < 12; i++) {
    const planetIndex = (startIndex + 12 + i) % 7;
    const planet = horaSequence[planetIndex];
    let startHours = sunsetHours + i * nightHoraDuration;
    let endHours = sunsetHours + (i + 1) * nightHoraDuration;

    if (startHours >= 24) startHours -= 24;
    if (endHours >= 24) endHours -= 24;

    const meta = horaPlanetMetadata[planet.name];

    horas.push({
      planet: planet.name,
      symbol: planet.symbol,
      startTime: formatTime(startHours, (startHours % 1) * 60),
      endTime: formatTime(endHours, (endHours % 1) * 60),
      isDay: false,
      index: i + 13,
      ...meta
    });
  }

  return horas;
};

export const getCurrentHoraIndex = (now: Date, horas: PremiumHoraPeriod[]): number => {
  const currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

  const parseTimeToDecimal = (timeStr: string): number => {
    const match = timeStr.toLowerCase().match(/(\d+):(\d+)\s*(am|pm)/);
    if (!match) return 0;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const isPm = match[3] === "pm";
    if (isPm && h !== 12) h += 12;
    if (!isPm && h === 12) h = 0;
    return h + m / 60;
  };

  // We find which hora interval wraps around currentHour
  for (let i = 0; i < horas.length; i++) {
    const hora = horas[i];
    let start = parseTimeToDecimal(hora.startTime);
    let end = parseTimeToDecimal(hora.endTime);

    // If night horas cross midnight
    if (end < start) {
      if (currentHour >= start || currentHour < end) {
        return i;
      }
    } else {
      if (currentHour >= start && currentHour < end) {
        return i;
      }
    }
  }

  return 0; // Default fallback
};
