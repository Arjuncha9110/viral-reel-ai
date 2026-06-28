export interface VedicTimeData {
  ghati: number;
  pal: number;
  vipal: number;
  formatted: string;
}

export interface SwaraData {
  name: "IDA" | "PINGALA" | "SUSHUMNA";
  energy: string;
  recommendation: string;
  color: string;
}

export interface TattwaElement {
  name: string;
  element: string;
  progress: number;
  isActive: boolean;
  color: string;
  description: string;
}

/**
 * Calculates the exact Vedic time (Ghati, Pal, Vipal) elapsed since the current Vedic day's sunrise
 */
export const calculateVedicTime = (now: Date, sunriseDate: Date): VedicTimeData => {
  let vedicSunrise = new Date(sunriseDate.getTime());
  
  if (now.getTime() < sunriseDate.getTime()) {
    // Before today's sunrise: the Vedic day started at yesterday's sunrise
    // We approximate yesterday's sunrise as exactly 24 hours before today's
    // (A more precise version would compute the actual sunrise for yesterday)
    vedicSunrise = new Date(sunriseDate.getTime() - 24 * 3600 * 1000);
  }

  const elapsedMs = now.getTime() - vedicSunrise.getTime();
  const elapsedSec = elapsedMs / 1000;

  // 1 Ghati = 24 minutes = 1440 seconds.
  // 60 Ghatis = 24 hours.
  const ghati = Math.floor(elapsedSec / 1440);
  const remainingSecForPal = elapsedSec % 1440;

  // 1 Pal = 24 seconds.
  const pal = Math.floor(remainingSecForPal / 24);
  const remainingSecForVipal = remainingSecForPal % 24;

  // 1 Vipal = 0.4 seconds.
  const vipal = Math.floor(remainingSecForVipal / 0.4);

  return {
    ghati: Math.min(59, Math.max(0, ghati)),
    pal: Math.min(59, Math.max(0, pal)),
    vipal: Math.min(59, Math.max(0, vipal)),
    formatted: `${ghati.toString().padStart(2, '0')}:${pal.toString().padStart(2, '0')}:${vipal.toString().padStart(2, '0')}`
  };
};

/**
 * Calculates current nostril dominance according to Swara Yoga (Ida, Pingala, Sushumna)
 */
export const calculateSwaraNadi = (now: Date, sunriseDate: Date, sunsetDate: Date): SwaraData => {
  let vedicSunrise = new Date(sunriseDate.getTime());
  let vedicSunset = new Date(sunsetDate.getTime());

  if (now.getTime() < sunriseDate.getTime()) {
    vedicSunrise = new Date(sunriseDate.getTime() - 24 * 3600 * 1000);
    vedicSunset = new Date(sunsetDate.getTime() - 24 * 3600 * 1000);
  }

  let dayDurationMins = (vedicSunset.getTime() - vedicSunrise.getTime()) / 60000;
  if (dayDurationMins < 0) dayDurationMins += 24 * 60;
  const nightDurationMins = (24 * 60) - dayDurationMins;

  const isDay = now.getTime() >= vedicSunrise.getTime() && now.getTime() < vedicSunset.getTime();
  const elapsedMins = (now.getTime() - vedicSunrise.getTime()) / 60000;

  let portionIndex = 0;
  if (isDay) {
    portionIndex = Math.floor(elapsedMins / (dayDurationMins / 12));
  } else {
    const elapsedNightMins = (now.getTime() - vedicSunset.getTime()) / 60000;
    portionIndex = 12 + Math.floor(elapsedNightMins / (nightDurationMins / 12));
  }

  // Sunday(0), Tuesday(2), Saturday(6) -> Pingala starts
  const dayOfWeek = vedicSunrise.getDay();
  const startsWithPingala = (dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 6);
  const isEvenPortion = (portionIndex % 2 === 0);
  const currentIsPingala = startsWithPingala ? isEvenPortion : !isEvenPortion;

  if (currentIsPingala) {
    return {
      name: "PINGALA",
      energy: "Solar / Heating / Dynamic",
      recommendation: "Excellent for eating, physical exercise, building, business negotiation, and decisive action.",
      color: "text-amber-500"
    };
  } else {
    return {
      name: "IDA",
      energy: "Lunar / Cooling / Receptive",
      recommendation: "Excellent for studies, mental activities, planning, music, and peaceful work.",
      color: "text-blue-400"
    };
  }
};

export const calculateTattwas = (now: Date, sunriseDate: Date, sunsetDate: Date): TattwaElement[] => {
  let vedicSunrise = new Date(sunriseDate.getTime());
  let vedicSunset = new Date(sunsetDate.getTime());

  if (now.getTime() < sunriseDate.getTime()) {
    vedicSunrise = new Date(sunriseDate.getTime() - 24 * 3600 * 1000);
    vedicSunset = new Date(sunsetDate.getTime() - 24 * 3600 * 1000);
  }

  let dayDurationMins = (vedicSunset.getTime() - vedicSunrise.getTime()) / 60000;
  if (dayDurationMins < 0) dayDurationMins += 24 * 60;
  const nightDurationMins = (24 * 60) - dayDurationMins;

  const isDay = now.getTime() >= vedicSunrise.getTime() && now.getTime() < vedicSunset.getTime();
  const elapsedMins = (now.getTime() - vedicSunrise.getTime()) / 60000;

  let portionLength = 60;
  let minsIntoPortion = 0;

  if (isDay) {
    portionLength = dayDurationMins / 12;
    minsIntoPortion = elapsedMins % portionLength;
  } else {
    portionLength = nightDurationMins / 12;
    const elapsedNightMins = (now.getTime() - vedicSunset.getTime()) / 60000;
    minsIntoPortion = elapsedNightMins % portionLength;
  }

  // Tattwa traditional proportions (out of 60): Akash(4), Vayu(8), Agni(12), Prithvi(20), Jala(16)
  // Re-ordered to match Swara sequence: Akash, Vayu, Agni, Prithvi, Jala
  const tattwaDefinitions = [
    { name: "Space", element: "Akash", color: "bg-purple-500", proportion: 4, description: "Quiet introspection, prayer." },
    { name: "Air", element: "Vayu", color: "bg-cyan-400", proportion: 8, description: "Intellectual work, planning, changes." },
    { name: "Fire", element: "Tejas", color: "bg-rose-500", proportion: 12, description: "Competitive task, physical work." },
    { name: "Earth", element: "Prithvi", color: "bg-amber-500", proportion: 20, description: "Grounding, stable undertakings." },
    { name: "Water", element: "Jala", color: "bg-sky-500", proportion: 16, description: "Nurturing, relationships, artistic work." }
  ];

  let cumulativeMins = 0;
  let activeIndex = 0;
  
  const mappedTattwas = tattwaDefinitions.map((def, idx) => {
    const duration = (def.proportion / 60) * portionLength;
    const startMins = cumulativeMins;
    const endMins = cumulativeMins + duration;
    
    cumulativeMins += duration;
    
    let isActive = false;
    let progress = 0;
    
    if (minsIntoPortion >= startMins && minsIntoPortion < endMins) {
      isActive = true;
      activeIndex = idx;
      progress = ((minsIntoPortion - startMins) / duration) * 100;
    } else if (minsIntoPortion >= endMins) {
      progress = 100;
    }

    return {
      name: def.name,
      element: def.element,
      color: def.color,
      description: def.description,
      progress,
      isActive
    };
  });

  return mappedTattwas;
};
