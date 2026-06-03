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
export const nakshatraDashaLord: Record<number, string> = {
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
