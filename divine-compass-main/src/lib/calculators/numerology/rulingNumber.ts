import { reduceToSingleDigit } from "../core";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NumerologyPersonProfile {
  rulingNumber: number;
  planet: string;
  favourableGod: string;
  friendlyNumbers: number[];
  enemyNumbers: number[];
  favourableAlphabets: string[];
  auspiciousColor: string;
  favourableDays: string[];   // e.g. ["Sunday", "Monday", "Thursday"]
  directions: {
    relationship: string;
    success: string;
    wisdom: string;
    health: string;
  };
  description: string;
  keywords: string[];
}

export interface LoShuCell {
  position: number; // 1-9
  areaLabel: string;
  digits: number[]; // which birth-date digits landed here
  count: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Vedic Numerology data table (by Ruling Number 1–9)
// ─────────────────────────────────────────────────────────────────────────────

const NUMEROLOGY_DATA: Record<number, NumerologyPersonProfile> = {
  1: {
    rulingNumber: 1,
    planet: "Sun",
    favourableGod: "Lord Surya",
    friendlyNumbers: [1, 2, 3, 9],
    enemyNumbers: [4, 6, 8],
    favourableAlphabets: ["A", "E", "I", "O", "U"],
    auspiciousColor: "Gold",
    favourableDays: ["Sunday", "Monday", "Thursday"],
    directions: { relationship: "East", success: "North", wisdom: "Northeast", health: "Southeast" },
    description: "Natural leader, independent, ambitious, and creative. You have strong willpower and the ability to inspire others.",
    keywords: ["Leadership", "Independence", "Ambition", "Creativity"],
  },
  2: {
    rulingNumber: 2,
    planet: "Moon",
    favourableGod: "Lord Shiva",
    friendlyNumbers: [1, 2, 3, 6],
    enemyNumbers: [5, 8, 9],
    favourableAlphabets: ["B", "K", "R"],
    auspiciousColor: "White",
    favourableDays: ["Monday", "Friday", "Saturday"],
    directions: { relationship: "West", success: "Northwest", wisdom: "North", health: "Southwest" },
    description: "Sensitive, intuitive, and diplomatic. You are a natural peacemaker with great emotional intelligence.",
    keywords: ["Sensitivity", "Intuition", "Diplomacy", "Harmony"],
  },
  3: {
    rulingNumber: 3,
    planet: "Jupiter",
    favourableGod: "Lord Vishnu",
    friendlyNumbers: [1, 3, 5, 6, 9],
    enemyNumbers: [2, 8],
    favourableAlphabets: ["G", "C", "L", "S"],
    auspiciousColor: "Yellow",
    favourableDays: ["Thursday", "Monday", "Tuesday"],
    directions: { relationship: "North", success: "Northeast", wisdom: "East", health: "Southeast" },
    description: "Creative, expressive, and joyful. You possess natural talent for communication and artistic expression.",
    keywords: ["Creativity", "Expression", "Joy", "Wisdom"],
  },
  4: {
    rulingNumber: 4,
    planet: "Rahu",
    favourableGod: "Lord Ganesha",
    friendlyNumbers: [1, 2, 7, 9],
    enemyNumbers: [5, 6, 8],
    favourableAlphabets: ["D", "M", "T"],
    auspiciousColor: "Green",
    favourableDays: ["Sunday", "Monday", "Saturday"],
    directions: { relationship: "South", success: "West", wisdom: "Southwest", health: "Northwest" },
    description: "Practical, disciplined, and hardworking. You build strong foundations and are known for your reliability.",
    keywords: ["Discipline", "Stability", "Practicality", "Reliability"],
  },
  5: {
    rulingNumber: 5,
    planet: "Mercury",
    favourableGod: "Lord Vishnu",
    friendlyNumbers: [1, 4, 5, 6],
    enemyNumbers: [2, 7],
    favourableAlphabets: ["E", "N", "W"],
    auspiciousColor: "Green",
    favourableDays: ["Wednesday", "Thursday", "Friday"],
    directions: { relationship: "West", success: "Southwest", wisdom: "Northwest", health: "North" },
    description: "Versatile, communicative, and adventurous. You thrive on change, freedom, and new experiences.",
    keywords: ["Versatility", "Communication", "Freedom", "Adventure"],
  },
  6: {
    rulingNumber: 6,
    planet: "Venus",
    favourableGod: "Goddess Lakshmi",
    friendlyNumbers: [1, 3, 5, 6, 9],
    enemyNumbers: [2, 7],
    favourableAlphabets: ["F", "P", "V"],
    auspiciousColor: "Blue",
    favourableDays: ["Friday", "Monday", "Wednesday"],
    directions: { relationship: "Southeast", success: "East", wisdom: "South", health: "Northeast" },
    description: "Nurturing, harmonious, and responsible. You are naturally drawn to beauty, love, and service to others.",
    keywords: ["Love", "Harmony", "Beauty", "Responsibility"],
  },
  7: {
    rulingNumber: 7,
    planet: "Ketu",
    favourableGod: "Lord Shiva",
    friendlyNumbers: [1, 2, 3, 7],
    enemyNumbers: [5, 6, 8, 9],
    favourableAlphabets: ["O", "Z"],
    auspiciousColor: "Violet",
    favourableDays: ["Monday", "Wednesday", "Saturday"],
    directions: { relationship: "Northwest", success: "West", wisdom: "Southwest", health: "South" },
    description: "Introspective, spiritual, and analytical. You have a deep inner life and seek truth and understanding.",
    keywords: ["Spirituality", "Intuition", "Analysis", "Introspection"],
  },
  8: {
    rulingNumber: 8,
    planet: "Saturn",
    favourableGod: "Lord Bhairav",
    friendlyNumbers: [1, 4, 5, 8],
    enemyNumbers: [2, 3, 6, 9],
    favourableAlphabets: ["H", "Q", "Z"],
    auspiciousColor: "Dark Blue",
    favourableDays: ["Saturday", "Wednesday", "Thursday"],
    directions: { relationship: "Southwest", success: "South", wisdom: "Southeast", health: "East" },
    description: "Powerful, ambitious, and goal-oriented. You have exceptional business acumen and the ability to achieve material success.",
    keywords: ["Power", "Ambition", "Achievement", "Karma"],
  },
  9: {
    rulingNumber: 9,
    planet: "Mars",
    favourableGod: "Lord Hanuman",
    friendlyNumbers: [1, 3, 5, 6, 9],
    enemyNumbers: [4, 7, 8],
    favourableAlphabets: ["I", "R"],
    auspiciousColor: "Red",
    favourableDays: ["Tuesday", "Friday", "Monday"],
    directions: { relationship: "East", success: "Southeast", wisdom: "South", health: "West" },
    description: "Compassionate warrior, selfless server, brave and humanitarian. You are driven by a deep desire to serve humanity.",
    keywords: ["Compassion", "Courage", "Humanitarianism", "Completion"],
  },
};

// Lo Shu grid area labels (position 1–9)
export const LO_SHU_LABELS: Record<number, string> = {
  4: "Money & Property",
  9: "Reputation & Fame",
  2: "Marriage & Relationship",
  3: "Health & Family",
  5: "Energy & Stability",
  7: "Children & Creativity",
  8: "Knowledge & Intuition",
  1: "Career & Success",
  6: "Friends & Beginnings",
};

// Lo Shu grid layout (row-major, 3×3)
export const LO_SHU_LAYOUT = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

// ─────────────────────────────────────────────────────────────────────────────
// Core functions
// ─────────────────────────────────────────────────────────────────────────────

/** Reduce day of birth to 1–9 (no master numbers for ruling number) */
export const calculateRulingNumber = (birthDate: Date): number => {
  const day = birthDate.getUTCDate();
  let n = day;
  while (n > 9) {
    n = String(n).split("").reduce((a, d) => a + parseInt(d, 10), 0);
  }
  return n || 9;
};

/** Get the full Vedic numerology profile for a ruling number */
export const getNumerologyProfile = (rulingNumber: number): NumerologyPersonProfile => {
  const r = ((rulingNumber - 1) % 9) + 1; // clamp 1–9
  return NUMEROLOGY_DATA[r]!;
};

/**
 * Extract all non-zero digits from the birth date string DDMMYYYY
 * and compute Lo Shu frequency for each position 1–9.
 */
export const computeLoShu = (birthDate: Date): LoShuCell[] => {
  const day   = String(birthDate.getUTCDate()).padStart(2, "0");
  const month = String(birthDate.getUTCMonth() + 1).padStart(2, "0");
  const year  = String(birthDate.getUTCFullYear());
  const allDigits = (day + month + year)
    .split("")
    .map(Number)
    .filter(d => d !== 0);

  return [1, 2, 3, 4, 5, 6, 7, 8, 9].map(pos => {
    const matching = allDigits.filter(d => d === pos);
    return {
      position: pos,
      areaLabel: LO_SHU_LABELS[pos]!,
      digits: matching,
      count: matching.length,
    };
  });
};

/**
 * Returns dates in the current calendar month that match the
 * friendly numbers of a given ruling number (by day % 9 or 9).
 */
export const getFavourableDatesInMonth = (
  profile: NumerologyPersonProfile,
  year: number,
  month: number // 0-indexed
): number[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    let r = d;
    while (r > 9) r = String(r).split("").reduce((a, x) => a + parseInt(x, 10), 0);
    if (profile.friendlyNumbers.includes(r)) result.push(d);
  }
  return result;
};

/** Day-of-week name for a date (0=Sun…6=Sat) */
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export { DAY_NAMES };
