// ============================================================
// remediesEngine.ts
// Vedic Astrology – Personalised Remedies & Lucky Elements Engine
// Premium Kundali Report Module
// ============================================================

// ─── Zodiac & Planetary Metadata ─────────────────────────────

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Debilitation sign for each planet (0-indexed)
const DEBILITATION_SIGN: Record<string, number> = {
  Saturn:  0,  // Aries
  Sun:     6,  // Libra
  Moon:    7,  // Scorpio
  Mars:    3,  // Cancer
  Mercury: 11, // Pisces
  Jupiter: 9,  // Capricorn
  Venus:   5,  // Virgo
};

// Exaltation sign for each planet
const EXALTATION_SIGN: Record<string, number> = {
  Sun:     0,  // Aries
  Moon:    1,  // Taurus
  Mars:    9,  // Capricorn
  Mercury: 5,  // Virgo
  Jupiter: 3,  // Cancer
  Venus:   11, // Pisces
  Saturn:  6,  // Libra
};

// Own signs (mooltrikona / own sign)
const OWN_SIGNS: Record<string, number[]> = {
  Sun:     [4],
  Moon:    [3],
  Mars:    [0, 7],
  Mercury: [2, 5],
  Jupiter: [8, 11],
  Venus:   [1, 6],
  Saturn:  [9, 10],
};

// Enemy signs (simplified; each planet is weakened in enemy territory)
const ENEMY_SIGNS: Record<string, number[]> = {
  Sun:     [1, 6, 10, 11],  // Taurus, Libra, Capricorn, Aquarius
  Moon:    [7, 9, 10],      // Scorpio, Capricorn, Aquarius
  Mars:    [2, 3, 5, 6],    // Gemini, Cancer, Virgo, Libra
  Mercury: [0, 7, 8],       // Aries, Scorpio, Sagittarius
  Jupiter: [1, 2, 5, 6],    // Taurus, Gemini, Virgo, Libra
  Venus:   [0, 3, 4, 7],    // Aries, Cancer, Leo, Scorpio
  Saturn:  [0, 3, 4],       // Aries, Cancer, Leo
  Rahu:    [],
  Ketu:    [],
};

// Planetary properties for lucky elements
const PLANET_NUMBERS: Record<string, number[]> = {
  Sun:     [1, 10, 19, 28],
  Moon:    [2, 11, 20, 29],
  Mars:    [9, 18, 27],
  Mercury: [5, 14, 23],
  Jupiter: [3, 12, 21, 30],
  Venus:   [6, 15, 24],
  Saturn:  [8, 17, 26],
  Rahu:    [4, 13, 22],
  Ketu:    [7, 16, 25],
};

const PLANET_COLORS: Record<string, string[]> = {
  Sun:     ['Saffron orange', 'Golden yellow', 'Ruby red'],
  Moon:    ['Pearl white', 'Silver', 'Cream'],
  Mars:    ['Coral red', 'Crimson', 'Brick orange'],
  Mercury: ['Emerald green', 'Lime green', 'Parrot green'],
  Jupiter: ['Golden yellow', 'Turmeric yellow', 'Cream white'],
  Venus:   ['Pristine white', 'Pastel pink', 'Sky blue'],
  Saturn:  ['Deep navy blue', 'Charcoal black', 'Dark violet'],
  Rahu:    ['Smoky grey', 'Electric blue', 'Ultraviolet'],
  Ketu:    ['Dusky brown', 'Ash grey', 'Burnt orange'],
};

const PLANET_DAYS: Record<string, string> = {
  Sun:     'Sunday',
  Moon:    'Monday',
  Mars:    'Tuesday',
  Mercury: 'Wednesday',
  Jupiter: 'Thursday',
  Venus:   'Friday',
  Saturn:  'Saturday',
  Rahu:    'Saturday',
  Ketu:    'Tuesday',
};

const PLANET_GEMSTONES: Record<string, string> = {
  Sun:     'Ruby (Manikya)',
  Moon:    'Natural Pearl (Moti)',
  Mars:    'Red Coral (Moonga)',
  Mercury: 'Emerald (Panna)',
  Jupiter: 'Yellow Sapphire (Pukhraj)',
  Venus:   'Diamond or White Sapphire (Heera / Safed Pukhraj)',
  Saturn:  'Blue Sapphire (Neelam)',
  Rahu:    'Hessonite Garnet (Gomed)',
  Ketu:    'Cat\'s Eye (Lahsuniya)',
};

const PLANET_MANTRAS: Record<string, string> = {
  Sun:     'Om Hraam Hreem Hraum Sah Suryaya Namah',
  Moon:    'Om Shraam Shreem Shraum Sah Chandraya Namah',
  Mars:    'Om Kraam Kreem Kraum Sah Bhaumaya Namah',
  Mercury: 'Om Braam Breem Braum Sah Budhaya Namah',
  Jupiter: 'Om Graam Greem Graum Sah Gurave Namah',
  Venus:   'Om Draam Dreem Draum Sah Shukraya Namah',
  Saturn:  'Om Praam Preem Praum Sah Shanaishcharaya Namah',
  Rahu:    'Om Raam Rahave Namah',
  Ketu:    'Om Kem Ketave Namah',
};

const PLANET_DEITIES: Record<string, string> = {
  Sun:     'Lord Surya (Aditya), Lord Vishnu (in Surya form)',
  Moon:    'Lord Shiva (Chandra-Shekhara), Goddess Parvati',
  Mars:    'Lord Hanuman, Lord Subramanya (Murugan)',
  Mercury: 'Lord Vishnu, Lord Ganesha',
  Jupiter: 'Lord Brihaspati, Lord Vishnu, Dakshinamurti (Shiva as teacher)',
  Venus:   'Goddess Lakshmi, Goddess Parvati, Lord Shukracharya',
  Saturn:  'Lord Shani, Lord Yama, Lord Hanuman (for Shani relief)',
  Rahu:    'Goddess Durga, Lord Bhairav, Saraswati',
  Ketu:    'Lord Ganesha, Lord Skanda, Matsya avatar',
};

const PLANET_METALS: Record<string, string> = {
  Sun:     'Gold',
  Moon:    'Silver',
  Mars:    'Copper',
  Mercury: 'Brass',
  Jupiter: 'Gold',
  Venus:   'Silver or Platinum',
  Saturn:  'Iron or Lead',
  Rahu:    'Lead (mixed with silver)',
  Ketu:    'Iron',
};

const PLANET_DIRECTIONS: Record<string, string> = {
  Sun:     'East',
  Moon:    'North-West',
  Mars:    'South',
  Mercury: 'North',
  Jupiter: 'North-East (Ishanya)',
  Venus:   'South-East',
  Saturn:  'West',
  Rahu:    'South-West',
  Ketu:    'North-West',
};

const PLANET_ELEMENTS: Record<string, string> = {
  Sun:     'Fire (Agni)',
  Moon:    'Water (Jala)',
  Mars:    'Fire (Agni)',
  Mercury: 'Earth (Prithvi)',
  Jupiter: 'Ether / Space (Akasha)',
  Venus:   'Water (Jala)',
  Saturn:  'Air (Vayu)',
  Rahu:    'Air (Vayu)',
  Ketu:    'Fire (Agni)',
};

const PLANET_BEST_TIME: Record<string, string> = {
  Sun:     'Sunrise (Brahma Muhurta, 4:30–6:00 AM), Sunday mornings',
  Moon:    'Monday mornings, Purnima (Full Moon) night, Pradosh Kaal',
  Mars:    'Tuesday 45 minutes after sunrise, during Rahu Kaal on Tuesdays (avoid)',
  Mercury: 'Wednesday mornings, Mercury hora (planetary hour)',
  Jupiter: 'Thursday Brahma Muhurta, Guru Pushya Nakshatra days',
  Venus:   'Friday evenings, Shukla Paksha (waxing Moon) Fridays',
  Saturn:  'Saturday sunrise, Shani hora',
  Rahu:    'Rahu Kaal windows on Saturdays and Wednesdays',
  Ketu:    'Tuesday and Saturday, Ketu hora periods',
};

const PLANET_COLORS_AVOID: Record<string, string> = {
  Sun:     "Dark blue and black (Saturn's colours)",
  Moon:    'Red and dark shades (overstimulate the mind)',
  Mars:    "Green (Mercury's colour, opposes Mars energy)",
  Mercury: 'Red and bright orange (Sun/Mars colours disturb Mercury)',
  Jupiter: "Blue and black (Saturn's colours conflict with Jupiter)",
  Venus:   'Dark navy and black (Venus prefers lightness and brightness)',
  Saturn:  "Bright red and orange (Sun/Mars colours intensify Saturn's challenges)",
  Rahu:    'Bright gold and saffron',
  Ketu:    'Pure white and bright yellow',
};

const PLANET_YANTRAS: Record<string, string> = {
  Sun:     'Surya Yantra (energised on a Sunday at sunrise)',
  Moon:    'Chandra Yantra (energised on a Monday in silver)',
  Mars:    'Mangal Yantra (energised on a Tuesday in copper)',
  Mercury: 'Budha Yantra (energised on a Wednesday in brass)',
  Jupiter: 'Guru Yantra (energised on a Thursday in gold or turmeric)',
  Venus:   'Shukra Yantra (energised on a Friday in silver)',
  Saturn:  'Shani Yantra (energised on a Saturday in iron)',
  Rahu:    'Rahu Yantra (energised on a Saturday during Rahu Kaal)',
  Ketu:    'Ketu Yantra (energised on a Tuesday)',
};

const PLANET_FASTING_GUIDANCE: Record<string, string> = {
  Sun:     'Fast on Sundays, consuming only fruits, water, and wheat products. Break the fast at sunset after offering water to the setting Sun. Avoid salt and oil.',
  Moon:    'Fast on Mondays, particularly on Purnima (Full Moon) and Ekadashi. Consume only white foods — milk, rice, curd. Observe Shiva Pradosh Vrat.',
  Mars:    'Fast on Tuesdays. Consume only one meal of wheat and jaggery. Offer sindoor and red flowers to Lord Hanuman at sunset.',
  Mercury: 'Fast on Wednesdays. Consume only green vegetables and moong dal. Offer green grass (durva) to Lord Ganesha.',
  Jupiter: 'Fast on Thursdays (Brihaspativaar Vrat). Consume only yellow foods — chana dal, turmeric rice, bananas. Avoid cutting hair or nails on this day.',
  Venus:   'Fast on Fridays, consuming only white or light-coloured foods. Offer white flowers and sandalwood paste to Goddess Lakshmi.',
  Saturn:  'Fast on Saturdays, consuming only one meal of sesame (til) preparations, black lentils, and rice. Avoid oil on the body until the fast is broken.',
  Rahu:    'Fast on Saturdays (some traditions favour Wednesdays for Rahu). Consume only grey or mixed-colour foods. Donate black sesame to orphanages.',
  Ketu:    'Fast on Tuesdays. Offer flowers to Lord Ganesha and chant Ketu mantras 108 times before breaking the fast with simple food.',
};

const PLANET_DAAN: Record<string, string> = {
  Sun:     'Donate wheat, copper vessels, red cloth, jaggery, ruby-coloured stones, and cow-milk sweets on Sundays to temple priests.',
  Moon:    'Donate rice, milk, white cloth, silver items, conch shells, and curd on Mondays or on Purnima to Brahmins or mothers in need.',
  Mars:    'Donate red lentils (masoor dal), copper, red coral, jaggery, and wheat on Tuesdays to those who engage in physical labour.',
  Mercury: 'Donate green vegetables, moong dal, green cloth, brass items, and books on Wednesdays to students or young children.',
  Jupiter: 'Donate yellow cloth, turmeric, chana dal, gold-tinted items, books on philosophy, and bananas on Thursdays to learned Brahmins or teachers.',
  Venus:   'Donate white clothes, silver, rice, curd, white flowers, and silk on Fridays to young women, artists, or those in need of beauty care.',
  Saturn:  'Donate black sesame, iron, blue/black cloth, mustard oil, blankets, and shoes on Saturdays to labourers, the elderly, or the disabled.',
  Rahu:    'Donate blue cloth, lead, black sesame, urad dal, and swords or iron tools on Saturdays to sweepers or those in underprivileged communities.',
  Ketu:    'Donate mixed-grain flour, iron, sesame, grey cloth, and dogs food on Tuesdays or Saturdays to the needy.',
};

const PLANET_PUJA: Record<string, string> = {
  Sun:     'Perform Surya Namaskar (12 rounds) at sunrise daily. Offer arghya (water with kumkum, flowers, and rice) to the Sun at sunrise. Recite Aditya Hridayam on Sundays.',
  Moon:    'Perform Shiva Abhishek with milk and water on Mondays. Chant the Mahamrityunjaya Mantra. Observe Pradosh Vrat and Satyanarayan Katha on Purnima.',
  Mars:    'Visit Hanuman temples on Tuesdays and offer sindoor, red flowers, and oil lamp. Perform a Kuja Shanti puja. Recite Hanuman Chalisa.',
  Mercury: 'Offer durva (green grass) to Lord Ganesha on Wednesdays. Perform Budha Graha Shanti puja. Recite Ganesha Atharvashirsha.',
  Jupiter: 'Perform Guru Puja on Thursdays — offer yellow flowers, turmeric, and bananas to a Vishnu or Brihaspati deity. Listen to Vishnu Sahasranama.',
  Venus:   'Perform Lakshmi Puja on Fridays with white flowers, camphor, and sandalwood incense. Chant Sri Sukta. Offer kheer (milk pudding) to Goddess Lakshmi.',
  Saturn:  'Perform Shani Shanti Homa or visit Shingnapur/Thirunallar on Saturdays. Offer sesame oil abhisheka to Shani idol. Chant Shani Stotram.',
  Rahu:    'Perform Rahu-Ketu Shanti Puja at Srikalahasti. Offer blue flowers to Goddess Durga on Saturdays. Recite Rahu Kavacham.',
  Ketu:    'Perform Ketu Shanti Puja at Srikalahasti. Offer flowers to Lord Ganesha on Tuesdays. Observe silence for one hour daily as a Ketu-pacifying practice.',
};

// ─── Exported Interfaces ─────────────────────────────────────

export interface PersonalizedRemedy {
  planet: string;
  weaknessReason: string;
  gemstone: string;
  gemstoneGuidance: string;
  mantra: string;
  mantraCount: string;
  fastingDay: string;
  fastingGuidance: string;
  daan: string;
  daanGuidance: string;
  yantra: string;
  deity: string;
  puja: string;
  colorToWear: string;
  colorToAvoid: string;
  directionToFace: string;
  bestTimeForPractice: string;
}

export interface LuckyElements {
  primaryLuckyNumber: number;
  luckyNumbers: number[];
  luckyColors: string[];
  luckyDays: string[];
  luckyGemstone: string;
  luckyDirection: string;
  luckyMetal: string;
  luckyDeity: string;
  luckyMantra: string;
  luckyElement: string;
}

export interface BestCautionPeriods {
  bestPeriods: string[];
  cautionPeriods: string[];
  bestDashaCombo: string;
  mostChallengingDasha: string;
  bestYearlyMonths: string[];
  cautionaryMonths: string[];
}

export interface RemediesReport {
  planetaryRemedies: PersonalizedRemedy[];
  luckyElements: LuckyElements;
  bestCautionPeriods: BestCautionPeriods;
  overallGuidance: string;
}

export interface RemedyInputs {
  lagnaIndex: number;
  moonSignIndex: number;
  sunSignIndex: number;
  marsSignIndex: number;
  jupiterSignIndex: number;
  saturnSignIndex: number;
  currentMaha: string;
  currentAntar: string;
  nakshatraLord: string;
  lagnaLord: string;
}

// ─── Utility Helpers ─────────────────────────────────────────

function signName(idx: number): string {
  return ZODIAC_SIGNS[((idx % 12) + 12) % 12];
}

function isDebilitated(planet: string, signIdx: number): boolean {
  return DEBILITATION_SIGN[planet] === signIdx;
}

function isExalted(planet: string, signIdx: number): boolean {
  return EXALTATION_SIGN[planet] === signIdx;
}

function isOwnSign(planet: string, signIdx: number): boolean {
  return (OWN_SIGNS[planet] ?? []).includes(signIdx);
}

function isEnemySign(planet: string, signIdx: number): boolean {
  return (ENEMY_SIGNS[planet] ?? []).includes(signIdx);
}

function planetIsWeak(planet: string, signIdx: number): boolean {
  return isDebilitated(planet, signIdx) || isEnemySign(planet, signIdx);
}

function weaknessDescription(planet: string, signIdx: number): string {
  const sName = signName(signIdx);
  if (isDebilitated(planet, signIdx)) {
    return `${planet} is debilitated in ${sName} — its weakest possible position in the zodiac. In this sign, ${planet}'s natural significations (${planetSignifications(planet)}) are compressed, distorted, or forced to express through the unfamiliar and uncongenial energy of ${sName}. Classical Jyotish texts (Brihat Parashara Hora Shastra, Phaladeepika) consider debilitation to be the single most significant source of planetary weakness, requiring active remediation to restore dignified expression.`;
  }
  if (isEnemySign(planet, signIdx)) {
    return `${planet} occupies ${sName}, which is the territory of an enemy planet — creating what Vedic astrology calls Shatru Kshetra placement. In an enemy's domain, ${planet} is like a diplomat stationed in a hostile nation: it must work harder, compromise more, and achieve less than it would in friendly or own territory. The native experiences this as intermittent frustration, self-doubt, or blocked results in the domains ${planet} governs (${planetSignifications(planet)}).`;
  }
  return `${planet} in ${sName} shows a moderate challenge in expressing its best qualities related to ${planetSignifications(planet)}.`;
}

function planetSignifications(planet: string): string {
  const sigs: Record<string, string> = {
    Sun:     'vitality, self-confidence, leadership, father, and government',
    Moon:    'mind, emotions, mother, peace, intuition, and nourishment',
    Mars:    'courage, ambition, physical energy, siblings, and property',
    Mercury: 'intellect, communication, business acumen, and analytical thinking',
    Jupiter: 'wisdom, spirituality, children, wealth, and dharmic guidance',
    Venus:   'love, beauty, luxury, marital harmony, and creative expression',
    Saturn:  'discipline, career longevity, service, karma, and perseverance',
    Rahu:    'worldly ambition, foreign matters, technology, and unconventional paths',
    Ketu:    'spiritual liberation, past-life wisdom, detachment, and mysticism',
  };
  return sigs[planet] ?? 'its natural domains';
}

function gemstoneGuidance(planet: string, signIdx: number): string {
  const gem    = PLANET_GEMSTONES[planet] ?? 'the appropriate gemstone';
  const sName  = signName(signIdx);
  const metal  = PLANET_METALS[planet] ?? 'the appropriate metal';
  const day    = PLANET_DAYS[planet]    ?? 'the appropriate day';
  const finger: Record<string, string> = {
    Sun:     'ring finger of the right hand',
    Moon:    'little finger of the right hand',
    Mars:    'ring finger of the right hand',
    Mercury: 'little finger of the right hand',
    Jupiter: 'index finger of the right hand',
    Venus:   'middle finger of the right hand',
    Saturn:  'middle finger of the right hand',
    Rahu:    'middle finger of the right hand',
    Ketu:    'little finger of the right hand',
  };
  const f = finger[planet] ?? 'appropriate finger';

  return `Since ${planet} is weakened in ${sName} in your chart, wearing ${gem} set in ${metal} on the ${f} is prescribed. The gemstone should weigh a minimum of 3–5 carats, be natural and unheated, free of inclusions visible to the naked eye, and energised through the appropriate ritual on a ${day} morning during the Shukla Paksha (waxing Moon fortnight). Before wearing, perform a puja with the planet's mantra recited 108 times. Consult a qualified astrologer or gemologist before purchase — synthetic or heated gemstones do not carry the same vibrational efficacy. The gemstone should touch your skin to transmit its frequency directly into your subtle energy field.`;
}

// ─── Weak Planet Detection & Remedy Generation ───────────────

function identifyWeakPlanets(inputs: RemedyInputs): { planet: string; signIdx: number }[] {
  const weak: { planet: string; signIdx: number }[] = [];

  const checks: { planet: string; signIdx: number }[] = [
    { planet: 'Sun',     signIdx: inputs.sunSignIndex     },
    { planet: 'Moon',    signIdx: inputs.moonSignIndex    },
    { planet: 'Mars',    signIdx: inputs.marsSignIndex    },
    { planet: 'Jupiter', signIdx: inputs.jupiterSignIndex },
    { planet: 'Saturn',  signIdx: inputs.saturnSignIndex  },
  ];

  for (const { planet, signIdx } of checks) {
    if (planetIsWeak(planet, signIdx)) {
      weak.push({ planet, signIdx });
    }
  }

  // Always include Lagna Lord as a check planet (if not already included)
  const lagnaLord = inputs.lagnaLord;
  const alreadyIncluded = weak.some(w => w.planet === lagnaLord);
  if (!alreadyIncluded) {
    // Determine lagna lord sign from available data
    const lordSignMap: Record<string, number> = {
      Sun:     inputs.sunSignIndex,
      Moon:    inputs.moonSignIndex,
      Mars:    inputs.marsSignIndex,
      Jupiter: inputs.jupiterSignIndex,
      Saturn:  inputs.saturnSignIndex,
      Venus:   inputs.lagnaIndex, // approximate
      Mercury: inputs.lagnaIndex, // approximate
    };
    const lordSign = lordSignMap[lagnaLord];
    if (lordSign !== undefined && planetIsWeak(lagnaLord, lordSign)) {
      weak.push({ planet: lagnaLord, signIdx: lordSign });
    }
  }

  // If no planets are weak, still generate remedy for the Nakshatra lord
  if (weak.length === 0) {
    const nLord = inputs.nakshatraLord;
    const nLordSignMap: Record<string, number> = {
      Sun:     inputs.sunSignIndex,
      Moon:    inputs.moonSignIndex,
      Mars:    inputs.marsSignIndex,
      Jupiter: inputs.jupiterSignIndex,
      Saturn:  inputs.saturnSignIndex,
      Venus:   inputs.lagnaIndex,
      Mercury: inputs.lagnaIndex,
      Rahu:    inputs.moonSignIndex,
      Ketu:    inputs.moonSignIndex,
    };
    const nLordSign = nLordSignMap[nLord] ?? inputs.moonSignIndex;
    weak.push({ planet: nLord, signIdx: nLordSign });
  }

  // Deduplicate
  const seen = new Set<string>();
  return weak.filter(w => {
    if (seen.has(w.planet)) return false;
    seen.add(w.planet);
    return true;
  });
}

function buildRemedy(planet: string, signIdx: number): PersonalizedRemedy {
  const sName = signName(signIdx);
  const isDebil = isDebilitated(planet, signIdx);

  return {
    planet,
    weaknessReason:    weaknessDescription(planet, signIdx),
    gemstone:          PLANET_GEMSTONES[planet]    ?? 'Consult qualified astrologer',
    gemstoneGuidance:  gemstoneGuidance(planet, signIdx),
    mantra:            PLANET_MANTRAS[planet]       ?? `Om ${planet.substring(0, 3).toUpperCase()} Namah`,
    mantraCount:       `108 times daily${isDebil ? ', ideally at the planet\'s hora (planetary hour) and on its dedicated weekday' : '. During the planet\'s Maha or Antardasha, increase to 1008 repetitions on the dedicated weekday'}`,
    fastingDay:        PLANET_DAYS[planet]           ?? 'Saturday',
    fastingGuidance:   PLANET_FASTING_GUIDANCE[planet] ?? `Fast on the planet's dedicated day as a spiritual offering.`,
    daan:              PLANET_DAAN[planet]            ?? 'Donate items associated with this planet to those in need.',
    daanGuidance: `Because ${planet} is ${isDebil ? 'debilitated' : 'in an enemy sign'} in ${sName}, the daan (charitable giving) associated with ${planet} carries heightened karmic potency for you. Classical Jyotish prescribes that when we give the items of a weakened planet, we "awaken" the planet's higher frequency and invite its blessings. The act of giving should be done with full awareness and without expectation of return — this purity of intention is what transforms daan from a mechanical ritual into a genuine karmic correction. Perform this donation on ${PLANET_DAYS[planet] ?? 'the planet\'s day'} morning after bathing, and recite the planet's mantra 7 times before handing over the items.`,
    yantra:            PLANET_YANTRAS[planet]         ?? `${planet} Yantra`,
    deity:             PLANET_DEITIES[planet]          ?? `Deity of ${planet}`,
    puja:              PLANET_PUJA[planet]             ?? `Perform ${planet} puja on its dedicated day.`,
    colorToWear:       (PLANET_COLORS[planet] ?? ['White'])[0],
    colorToAvoid:      PLANET_COLORS_AVOID[planet]    ?? 'Colors of enemy planets',
    directionToFace:   PLANET_DIRECTIONS[planet]       ?? 'East',
    bestTimeForPractice: PLANET_BEST_TIME[planet]      ?? 'Brahma Muhurta (4:30–6:00 AM)',
  };
}

// ─── Lucky Elements ───────────────────────────────────────────

function buildLuckyElements(inputs: RemedyInputs): LuckyElements {
  const { lagnaLord, nakshatraLord, lagnaIndex } = inputs;

  // Primary ruler is lagnaLord, secondary is nakshatraLord
  const primaryNums  = PLANET_NUMBERS[lagnaLord]      ?? [3];
  const secondNums   = PLANET_NUMBERS[nakshatraLord]  ?? [7];
  const primaryColor = PLANET_COLORS[lagnaLord]       ?? ['Golden yellow'];
  const secondColor  = PLANET_COLORS[nakshatraLord]   ?? ['Silver'];

  const primaryLuckyNumber = primaryNums[0];
  const luckyNumbers = Array.from(new Set([...primaryNums, ...secondNums])).slice(0, 6);

  const luckyColors = Array.from(new Set([...primaryColor, ...secondColor])).slice(0, 4);

  const primaryDay = PLANET_DAYS[lagnaLord]     ?? 'Thursday';
  const secondDay  = PLANET_DAYS[nakshatraLord] ?? 'Monday';
  const luckyDays  = Array.from(new Set([primaryDay, secondDay, 'Wednesday']));

  const luckyGemstone  = PLANET_GEMSTONES[lagnaLord]    ?? 'Yellow Sapphire';
  const luckyDirection = PLANET_DIRECTIONS[lagnaLord]   ?? 'East';
  const luckyMetal     = PLANET_METALS[lagnaLord]       ?? 'Gold';
  const luckyDeity     = PLANET_DEITIES[lagnaLord]      ?? 'Lord Vishnu';
  const luckyMantra    = PLANET_MANTRAS[lagnaLord]      ?? 'Om Namah Shivaya';
  const luckyElement   = PLANET_ELEMENTS[lagnaLord]     ?? 'Ether (Akasha)';

  return {
    primaryLuckyNumber,
    luckyNumbers,
    luckyColors,
    luckyDays,
    luckyGemstone,
    luckyDirection,
    luckyMetal,
    luckyDeity,
    luckyMantra,
    luckyElement,
  };
}

// ─── Best & Caution Periods ───────────────────────────────────

function buildBestCautionPeriods(inputs: RemedyInputs): BestCautionPeriods {
  const { currentMaha, currentAntar, lagnaLord, nakshatraLord } = inputs;

  const beneficPlanets   = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const maleficDashas    = ['Saturn', 'Rahu', 'Mars', 'Ketu'];

  const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

  // Best periods: when benefics run as Maha or Antar
  const bestPeriods: string[] = [];
  const cautionPeriods: string[] = [];

  for (const p of beneficPlanets) {
    bestPeriods.push(`${p} Maha Dasha: A period of expansion, wisdom, and opportunity — especially potent for spiritual growth, relationships, and material prosperity depending on ${p}'s house placement. ${p} Maha Dasha${p === 'Jupiter' ? ' (16 years of wisdom and grace)' : p === 'Venus' ? ' (20 years of creativity and abundance)' : p === 'Moon' ? ' (10 years of emotional richness and intuition)' : ' (17 years of wit, commerce, and communication)'} brings a generally benevolent atmosphere to all the domains ${p} governs in your chart.`);
  }

  // Add lagnaLord Antardasha entry ONCE (not once per benefic planet)
  bestPeriods.push(`${lagnaLord} Antardasha within any Maha Dasha: Particularly powerful for personal growth and fulfilment of the Lagna's core life purpose, as the Lagna lord's sub-period acts like a spotlight on your identity and primary life path.`);

  for (const p of maleficDashas) {
    cautionPeriods.push(`${p} Maha Dasha: ${
      p === 'Saturn' ? 'A 19-year period of karmic reckoning, discipline, and delayed gratification. Success is available but requires triple the effort and patience. Health, career transitions, and relationship karmas surface for resolution.'
      : p === 'Rahu' ? 'An 18-year period of intense worldly ambition, confusion, illusion, and sudden reversals. Extraordinary opportunities may appear but often carry hidden costs. Spiritual anchoring and ethical grounding are essential survival tools.'
      : p === 'Mars' ? 'A 7-year period where impatience, aggression, and haste can create conflict and recklessness. Property matters, sibling relationships, and physical health require careful attention.'
      : 'A 7-year period of Ketu\'s dissatisfaction and spiritual restlessness. Career and material matters may feel hollow, but this period is a doorway to genuine self-realisation if embraced as a spiritual passage.'
    }`);
  }

  // Current dasha assessment
  const currentMahaIsBenefic = beneficPlanets.includes(currentMaha);
  const currentAntarIsBenefic = beneficPlanets.includes(currentAntar);
  const bestDashaCombo = `${beneficPlanets[0]}-${lagnaLord} (${beneficPlanets[0]} Maha Dasha with ${lagnaLord} Antardasha): The combination of a natural benefic's Maha Dasha with your Lagna lord's Antardasha creates the most personally fulfilling and productive sub-period possible. During such a combination, the benefic planet's universal goodwill flows through the most personally relevant channel of your chart, the Lagna lord, creating a period of remarkable clarity, momentum, and reward for effort. ${currentMahaIsBenefic && currentAntarIsBenefic ? `You are currently in a benefic Maha-Antar combination (${currentMaha}-${currentAntar}) — this is an exceptionally auspicious window to initiate major life projects, make important investments, and advance your highest ambitions.` : ''}`;

  const mostChallengingDasha = `Saturn-Rahu or Rahu-Saturn period: The mutual exchange of these two shadow-influenced, karmic planets creates the most challenging Dasha-Antardasha combination in the entire 120-year Vimshottari cycle. During Saturn-Rahu or Rahu-Saturn periods, expect external disruptions, internal confusion, karmic debts surfacing with urgency, and a general sense of the ground shifting underfoot. ${maleficDashas.includes(currentMaha) ? `Note: You are currently in ${currentMaha} Maha Dasha — maintaining rigorous spiritual practice and ethical integrity during this period is your strongest protective shield.` : 'You are not currently in the most challenging dasha combination, but prepare practices for when it arrives.'}`;

  // Monthly recommendations
  const PLANET_MONTHS: Record<string, string[]> = {
    Jupiter:  ['November', 'December'],
    Venus:    ['April', 'May'],
    Sun:      ['March', 'April'],
    Moon:     ['June', 'July'],
    Mars:     ['October', 'November'],
    Mercury:  ['August', 'September'],
    Saturn:   ['January', 'February'],
    Rahu:     ['January', 'July'],
    Ketu:     ['April', 'October'],
  };

  const bestYearlyMonths = Array.from(new Set([
    ...(PLANET_MONTHS[lagnaLord]      ?? ['March', 'April']),
    ...(PLANET_MONTHS[nakshatraLord]  ?? ['November', 'December']),
    ...(PLANET_MONTHS['Jupiter']      ?? ['November', 'December']),
  ])).slice(0, 5);

  const cautionaryMonths = Array.from(new Set([
    ...(PLANET_MONTHS['Saturn'] ?? ['January', 'February']),
    ...(PLANET_MONTHS['Rahu']   ?? ['January', 'July']),
  ])).slice(0, 4);

  return {
    bestPeriods:          bestPeriods.slice(0, 6),
    cautionPeriods:       cautionPeriods.slice(0, 4),
    bestDashaCombo,
    mostChallengingDasha,
    bestYearlyMonths,
    cautionaryMonths,
  };
}

// ─── Overall Guidance ─────────────────────────────────────────

function buildOverallGuidance(inputs: RemedyInputs, weakPlanets: { planet: string; signIdx: number }[]): string {
  const {
    lagnaLord, nakshatraLord, currentMaha, currentAntar,
    lagnaIndex, moonSignIndex
  } = inputs;

  const lagnaSignName = signName(lagnaIndex);
  const moonSignName  = signName(moonSignIndex);
  const weakNames     = weakPlanets.map(w => w.planet).join(', ');

  const isMahaGood = ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(currentMaha);

  return `Your complete astrological remedy map is rooted in the foundational truths of your ${lagnaSignName} Lagna — a life-path that is governed by ${lagnaLord} and whose emotional core resonates through the Moon in ${moonSignName}. ` +
    `The path of jyotish remediation is not magic but dharmic alignment: each mantra, each act of daan, each fast, and each yantra is a deliberate signal sent to the specific planetary frequency that governs a dimension of your experience, inviting that planet to express its highest rather than its most constrained quality. ` +
    `${weakNames ? `The planets currently requiring most attention in your chart are ${weakNames} — each of these has specific remedies outlined above that, practised with sincerity and consistency, can transform their weakened expression into areas of surprising strength. Many great souls have had debilitated planets: it is precisely the effort required to cultivate these energies that builds the deepest character and the most enduring wisdom.` : `Your planetary array carries strength and you are blessed with relatively clean planetary energies — your primary task is activation and expansion rather than correction.`} ` +
    `Your Nakshatra lord ${nakshatraLord} is the DNA-level ruler of your soul's current incarnation, carrying the precise vibrational signature of the star cluster under which you were born. Honouring ${nakshatraLord} through its mantra, colour, direction, and dedicated fasting day is among the most direct and powerful forms of self-alignment available to you. ` +
    `You are currently running the ${currentMaha} Maha Dasha with ${currentAntar} Antardasha — ${isMahaGood ? `a broadly supportive period whose benefic undercurrent amplifies the efficacy of every remedy you undertake. Begin new spiritual practices, gemstones, and pujas during this period for maximum absorption and lasting effect.` : `a period that calls for heightened remedial vigilance. The remedies prescribed here will act as stabilisers and energetic shields during this more challenging Dasha phase, transforming potential obstacles into character-building experiences.`} ` +
    `Above all, remember that Jyotish is a map, not a prison sentence. The planets indicate tendencies; your conscious choices, ethical living, selfless service, and sincere spiritual practice are what transform tendency into destiny. The remedies outlined here are invitations to live in greater harmony with the cosmic symphony playing through your chart — accept them with reverence, practice them with consistency, and trust that the universe that orchestrated your birth is also fully invested in your most flourishing life.`;
}

// ─── Main Exported Function ───────────────────────────────────

export function generateRemediesReport(inputs: RemedyInputs): RemediesReport {
  const weakPlanets = identifyWeakPlanets(inputs);

  const planetaryRemedies: PersonalizedRemedy[] = weakPlanets.map(
    ({ planet, signIdx }) => buildRemedy(planet, signIdx)
  );

  // If somehow still empty (all planets strong), add Lagna Lord remedy as core practice
  if (planetaryRemedies.length === 0) {
    const lagnaSign = inputs.lagnaIndex % 12;
    planetaryRemedies.push(buildRemedy(inputs.lagnaLord, lagnaSign));
  }

  const luckyElements      = buildLuckyElements(inputs);
  const bestCautionPeriods = buildBestCautionPeriods(inputs);
  const overallGuidance    = buildOverallGuidance(inputs, weakPlanets);

  return {
    planetaryRemedies,
    luckyElements,
    bestCautionPeriods,
    overallGuidance,
  };
}
