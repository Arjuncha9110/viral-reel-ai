// Simplified Vimshottari Dasha preview - replace with Moon-longitude based calculations before claiming accuracy

export interface DashaPeriod {
  planet: string;
  startDate: Date;
  endDate: Date;
  years: number;
  antardashas?: AntardashaPeriod[];
}

export interface AntardashaPeriod {
  planet: string;
  startDate: Date;
  endDate: Date;
  months: number;
  days: number;
}

// Dasha planets in Vimshottari order with their years
export const dashaPlanets = [
  { name: "Ketu", years: 7, symbol: "☋" },
  { name: "Venus", years: 20, symbol: "♀" },
  { name: "Sun", years: 6, symbol: "☉" },
  { name: "Moon", years: 10, symbol: "☽" },
  { name: "Mars", years: 7, symbol: "♂" },
  { name: "Rahu", years: 18, symbol: "☊" },
  { name: "Jupiter", years: 16, symbol: "♃" },
  { name: "Saturn", years: 19, symbol: "♄" },
  { name: "Mercury", years: 17, symbol: "☿" }
];

export const totalDashaYears = 120; // Complete Vimshottari cycle

// Nakshatra to Dasha Lord mapping
const nakshatraDashaLord: Record<number, string> = {
  1: "Ketu",    // Ashwini
  2: "Venus",   // Bharani
  3: "Sun",     // Krittika
  4: "Moon",    // Rohini
  5: "Mars",    // Mrigashira
  6: "Rahu",    // Ardra
  7: "Jupiter", // Punarvasu
  8: "Saturn",  // Pushya
  9: "Mercury", // Ashlesha
  10: "Ketu",   // Magha
  11: "Venus",  // Purva Phalguni
  12: "Sun",    // Uttara Phalguni
  13: "Moon",   // Hasta
  14: "Mars",   // Chitra
  15: "Rahu",   // Swati
  16: "Jupiter", // Vishakha
  17: "Saturn", // Anuradha
  18: "Mercury", // Jyeshtha
  19: "Ketu",   // Moola
  20: "Venus",  // Purva Ashadha
  21: "Sun",    // Uttara Ashadha
  22: "Moon",   // Shravana
  23: "Mars",   // Dhanishtha
  24: "Rahu",   // Shatabhisha
  25: "Jupiter", // Purva Bhadrapada
  26: "Saturn", // Uttara Bhadrapada
  27: "Mercury" // Revati
};

export const planetDescriptions: Record<string, { meaning: string; effects: string }> = {
  "Ketu": {
    meaning: "South Node - Spirituality & Liberation",
    effects: "Period of spiritual growth, detachment, sudden changes, and past life karma resolution. Good for meditation and spiritual practices."
  },
  "Venus": {
    meaning: "Planet of Love & Luxury",
    effects: "Period of prosperity, relationships, artistic pursuits, material comforts, marriage, and creative endeavors."
  },
  "Sun": {
    meaning: "Soul & Authority",
    effects: "Period of recognition, leadership opportunities, government relations, self-expression, and career advancement."
  },
  "Moon": {
    meaning: "Mind & Emotions",
    effects: "Period of emotional development, public dealing, travel, nurturing relationships, and mental peace."
  },
  "Mars": {
    meaning: "Energy & Courage",
    effects: "Period of action, property matters, courage, competitive success, and dynamic energy. Good for real estate."
  },
  "Rahu": {
    meaning: "North Node - Ambition & Illusion",
    effects: "Period of worldly desires, foreign connections, unconventional gains, technology, and karmic lessons."
  },
  "Jupiter": {
    meaning: "Wisdom & Expansion",
    effects: "Period of growth, education, spirituality, wealth, children, and beneficial opportunities. Most auspicious dasha."
  },
  "Saturn": {
    meaning: "Discipline & Karma",
    effects: "Period of hard work, delayed results, karmic lessons, building lasting foundations, and discipline."
  },
  "Mercury": {
    meaning: "Intelligence & Communication",
    effects: "Period of learning, business, communication skills, intellectual pursuits, and trade activities."
  }
};

// Calculate Nakshatra from birth date (simplified - actual calculation needs Moon longitude)
const calculateBirthNakshatra = (birthDate: Date): number => {
  // Using a simplified calculation based on date
  // In reality, this needs the exact Moon longitude at birth time
  const baseDate = new Date(2000, 0, 1);
  const daysSinceBase = Math.floor((birthDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Moon moves through all 27 nakshatras in ~27.3 days
  const moonCycle = 27.3;
  const nakshatraPosition = (daysSinceBase / moonCycle) % 27;
  
  return Math.floor(nakshatraPosition) + 1; // 1-27
};

// Calculate the balance of dasha at birth
const calculateDashaBalance = (birthDate: Date): { planet: string; balanceYears: number; balanceDays: number } => {
  const nakshatra = calculateBirthNakshatra(birthDate);
  const dashaLord = nakshatraDashaLord[nakshatra];
  const planetData = dashaPlanets.find(p => p.name === dashaLord)!;
  
  // Calculate pada position within nakshatra (simplified)
  const baseDate = new Date(2000, 0, 1);
  const daysSinceBase = (birthDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);
  const nakshatraFraction = (daysSinceBase / 27.3) % 1;
  
  // Balance is the remaining portion of the dasha
  const totalDays = planetData.years * 365.25;
  const elapsedFraction = nakshatraFraction;
  const remainingDays = totalDays * (1 - elapsedFraction);
  
  const balanceYears = Math.floor(remainingDays / 365.25);
  const balanceDays = Math.round(remainingDays % 365.25);
  
  return { planet: dashaLord, balanceYears, balanceDays };
};

// Add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Calculate all Mahadasha periods
export const calculateSampleDasha = (birthDate: Date): DashaPeriod[] => {
  const dashas: DashaPeriod[] = [];
  const balance = calculateDashaBalance(birthDate);
  
  // Find starting index
  const startingIndex = dashaPlanets.findIndex(p => p.name === balance.planet);
  
  let currentDate = new Date(birthDate);
  
  // First dasha with balance
  const firstEndDate = addDays(currentDate, balance.balanceYears * 365 + balance.balanceDays);
  const firstDasha: DashaPeriod = {
    planet: balance.planet,
    startDate: new Date(currentDate),
    endDate: firstEndDate,
    years: balance.balanceYears + (balance.balanceDays / 365),
    antardashas: []
  };
  firstDasha.antardashas = calculateAntardasha(balance.planet, firstDasha.startDate, firstDasha.endDate);
  dashas.push(firstDasha);
  currentDate = new Date(firstEndDate);
  
  // Remaining dashas
  for (let i = 1; i <= 8; i++) {
    const planetIndex = (startingIndex + i) % 9;
    const planet = dashaPlanets[planetIndex];
    
    const startDate = new Date(currentDate);
    const endDate = addDays(currentDate, Math.round(planet.years * 365.25));
    
    const dasha: DashaPeriod = {
      planet: planet.name,
      startDate,
      endDate,
      years: planet.years,
      antardashas: []
    };
    
    dasha.antardashas = calculateAntardasha(planet.name, startDate, endDate);
    dashas.push(dasha);
    
    currentDate = new Date(endDate);
  }
  
  return dashas;
};

const calculateAntardasha = (mahadashaPlanet: string, startDate: Date, endDate: Date): AntardashaPeriod[] => {
  const antardashas: AntardashaPeriod[] = [];
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  
  let currentDate = new Date(startDate);
  const startingPlanetIndex = dashaPlanets.findIndex(p => p.name === mahadashaPlanet);
  
  for (let i = 0; i < 9; i++) {
    const planetIndex = (startingPlanetIndex + i) % 9;
    const planet = dashaPlanets[planetIndex];
    
    // Antardasha duration is proportional to the planet's dasha years
    const proportionalDays = (planet.years / totalDashaYears) * totalDays;
    
    const adStartDate = new Date(currentDate);
    const adEndDate = addDays(currentDate, Math.round(proportionalDays));
    
    const months = Math.floor(proportionalDays / 30.44);
    const days = Math.round(proportionalDays % 30.44);
    
    antardashas.push({
      planet: planet.name,
      startDate: adStartDate,
      endDate: adEndDate,
      months,
      days
    });
    
    currentDate = new Date(adEndDate);
  }
  
  return antardashas;
};

export const getCurrentDasha = (dashas: DashaPeriod[]): { mahadasha: DashaPeriod | null; antardasha: AntardashaPeriod | null } => {
  const now = new Date();
  
  for (const dasha of dashas) {
    if (now >= dasha.startDate && now <= dasha.endDate) {
      let currentAntardasha = null;
      
      if (dasha.antardashas) {
        for (const ad of dasha.antardashas) {
          if (now >= ad.startDate && now <= ad.endDate) {
            currentAntardasha = ad;
            break;
          }
        }
      }
      
      return { mahadasha: dasha, antardasha: currentAntardasha };
    }
  }
  
  // If current date is before first dasha, return first
  if (dashas.length > 0 && now < dashas[0].startDate) {
    return { mahadasha: dashas[0], antardasha: dashas[0].antardashas?.[0] || null };
  }
  
  return { mahadasha: null, antardasha: null };
};

export const formatDashaDuration = (years: number, months?: number, days?: number): string => {
  const parts: string[] = [];
  
  const fullYears = Math.floor(years);
  const remainingMonths = months ?? Math.round((years % 1) * 12);
  
  if (fullYears > 0) parts.push(`${fullYears}Y`);
  if (remainingMonths > 0) parts.push(`${remainingMonths}M`);
  if (days && days > 0) parts.push(`${days}D`);
  
  return parts.join(' ') || '0D';
};
