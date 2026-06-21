export type Guna = "Sattvic" | "Rajasic" | "Tamasic";

export interface VastuDir {
  key: string;
  deg: number;
  label: string;
  shortLabel: string;
  sanskrit: string;
  lord: string;
  element: string;
  elementIcon: string;
  guna: Guna;
  dosha: string;
  location: string;
  description: string;
  benefits: string[];
  avoid: string[];
  guidance: string[];
}

export const VASTU_DIRECTIONS: VastuDir[] = [
  {
    key: "N", deg: 0, label: "North", shortLabel: "N",
    sanskrit: "Uttara", lord: "Kubera", element: "Water", elementIcon: "💧",
    guna: "Sattvic", dosha: "None",
    location: "Guest room, study, open hall, living room",
    description: "Governed by Kubera, the lord of wealth, the North channels the flow of prosperity and social abundance. Its water energy brings clarity, calm, and connection.",
    benefits: ["Steady wealth flow and material abundance", "Mental clarity and focused thinking", "Positive social relationships", "Refreshing, calming atmosphere"],
    avoid: ["Kitchen or fire sources", "Heavy or tall furniture blocking this zone", "Clutter and old stored items", "Toilets or drainage in this direction"],
    guidance: ["Keep this zone open and well-lit", "Install a small water feature or aquarium here", "Use blue, green, or cream tones in décor", "Avoid constructing high walls on the north side"],
  },
  {
    key: "NNE", deg: 22.5, label: "N–Northeast", shortLabel: "NNE",
    sanskrit: "Uttar-Ishanya", lord: "Shiva–Kubera", element: "Water", elementIcon: "💧",
    guna: "Sattvic", dosha: "Minimal",
    location: "Open space, meditation corner, small study nook",
    description: "A transitional zone bridging Kubera's wealth and Ishana's divine grace. Keeping it open honours both guardians and maintains the spiritual flow of the home.",
    benefits: ["Blends spiritual and material prosperity", "Supports meditative silence", "Gentle, cleansing energy"],
    avoid: ["Heavy construction or extensions", "Bedroom of head of family", "Waste disposal or drainage"],
    guidance: ["Leave open or plant light greenery here", "A tulsi plant or small shrine works beautifully", "Avoid blocking with heavy furniture"],
  },
  {
    key: "NE", deg: 45, label: "Northeast", shortLabel: "NE",
    sanskrit: "Ishanya", lord: "Ishana (Shiva)", element: "Ether / Water", elementIcon: "🕉️",
    guna: "Sattvic", dosha: "None — most auspicious corner",
    location: "Puja room, meditation space, main entrance (secondary), study",
    description: "The most sacred corner of any Vastu structure — the portal of divine wisdom. Lord Shiva presides here, infusing the home with spiritual light, intelligence, and health.",
    benefits: ["Strongest spiritual protection in the home", "Enhanced wisdom, focus, and intuition", "Radiant health for all residents", "Flow of divine blessings and grace"],
    avoid: ["Toilet, bathroom, or septic tank — causes severe dosha", "Kitchen or fire element", "Heavy walls, extensions, or pillars", "Master bedroom or sleep zone", "Clutter and dark corners"],
    guidance: ["Place the puja room or altar here", "Install an underground water sump here if possible", "Keep it impeccably clean, bright, and uncluttered", "Use white, yellow, or light gold tones", "No cuts or missing corners — patch with a mirror if needed"],
  },
  {
    key: "ENE", deg: 67.5, label: "E–Northeast", shortLabel: "ENE",
    sanskrit: "Purva-Ishanya", lord: "Surya", element: "Air / Ether", elementIcon: "☀️",
    guna: "Sattvic", dosha: "Minimal",
    location: "Bathroom (minor), health zone, morning ritual space",
    description: "Touched by Surya's first rays, ENE carries the rejuvenating energy of dawn. It supports physical health and the purification rituals of morning.",
    benefits: ["Morning vitality and physical energy", "Supports health and immunity", "Good space for morning rituals"],
    avoid: ["Kitchen fire here weakens solar energy", "Heavy storage or dark clutter"],
    guidance: ["Bathroom placement here is acceptable", "Keep east-facing windows open for morning light", "A yoga or stretching corner works well here"],
  },
  {
    key: "E", deg: 90, label: "East", shortLabel: "E",
    sanskrit: "Purva", lord: "Indra", element: "Air", elementIcon: "🌬️",
    guna: "Sattvic", dosha: "None",
    location: "Main entrance, living room, large windows, verandah",
    description: "Indra, king of the celestials, governs the East — the direction of the rising sun and social glory. An open, welcoming East draws prosperity and social harmony.",
    benefits: ["Fame, recognition, and social prestige", "Prosperity and positive energy at the entrance", "Health through natural morning sunlight", "Harmony in social and professional relationships"],
    avoid: ["Toilets or drainage — weakens Indra's energy", "High, solid walls blocking morning sun", "Heavy cluttered storage"],
    guidance: ["Main entrance here is considered highly auspicious", "Install large east-facing windows", "Keep the eastern façade open and bright", "Use green or light wood tones in this zone"],
  },
  {
    key: "ESE", deg: 112.5, label: "E–Southeast", shortLabel: "ESE",
    sanskrit: "Purva-Agneya", lord: "Agni–Indra", element: "Fire / Air", elementIcon: "🔥",
    guna: "Rajasic", dosha: "Mild Agni dosha if misused",
    location: "Minor storage, electrical panel (acceptable)",
    description: "A transitional zone between the airy grace of East and the fire of the Southeast. Electrical equipment finds a harmonious home in this zone.",
    benefits: ["Supports electrical and technological infrastructure", "Active, motivating energy"],
    avoid: ["Bedrooms — fire energy disrupts sleep", "Puja room — fire overpowers ether"],
    guidance: ["Electrical panels and generators sit well here", "Keep décor warm but not overly red", "Avoid water features — fire and water clash"],
  },
  {
    key: "SE", deg: 135, label: "Southeast", shortLabel: "SE",
    sanskrit: "Agneya", lord: "Agni", element: "Fire", elementIcon: "🔥",
    guna: "Rajasic", dosha: "Agni dosha — intense if kitchen absent",
    location: "Kitchen, electrical equipment, boiler room",
    description: "Agni, the sacred fire deity, rules the Southeast with transformative intensity. The kitchen belongs here — cooking elsewhere creates Agni dosha.",
    benefits: ["Excellent digestion and vitality when kitchen is here", "Passion, drive, and career momentum", "Strong metabolism and immune fire (Agni)"],
    avoid: ["Bedrooms — causes anger, insomnia, and conflict", "Puja room — fire energy opposes devotion", "Main entrance — creates aggressive energy", "Water features or water tanks"],
    guidance: ["Place the kitchen exclusively here", "Electrical panels and inverters thrive here", "Use red, orange, or coral tones in this zone", "Cook facing east while standing in the SE kitchen"],
  },
  {
    key: "SSE", deg: 157.5, label: "S–Southeast", shortLabel: "SSE",
    sanskrit: "Dakshina-Agneya", lord: "Yama–Agni", element: "Earth / Fire", elementIcon: "🌍",
    guna: "Tamasic", dosha: "Intense — fire meeting death energy",
    location: "Storage, utility space only",
    description: "Where fire meets the heavy influence of Yama, SSE is dense and weighty. Best used for solid storage or heavy equipment. Avoid all dwelling spaces here.",
    benefits: ["Solid and stable if used for storage", "Good for machinery and heavy items"],
    avoid: ["Bedrooms, kitchen, puja room, main entrance", "Light, open spaces — energy stagnates here"],
    guidance: ["Use for heavy storage or utility only", "Keep solid and uncluttered", "Avoid bright colours — earth tones are best"],
  },
  {
    key: "S", deg: 180, label: "South", shortLabel: "S",
    sanskrit: "Dakshina", lord: "Yama", element: "Earth", elementIcon: "🌍",
    guna: "Tamasic", dosha: "Yama dosha — entrance or opening here is inauspicious",
    location: "Heavy storage, utility rooms",
    description: "The domain of Yama, god of dharmic order and transition. A solid southern boundary protects the home from Yama's direct gaze.",
    benefits: ["Stability and groundedness when used correctly", "Protection when solid walls close off the south", "Strength and endurance for residents"],
    avoid: ["Main entrance — Yama faces your door directly", "Large south-facing windows or openings", "Water features, wells, or tanks", "Puja room or open courtyards"],
    guidance: ["Maintain high, solid walls or heavy construction here", "No main gates or doors on the south", "Heavy furniture and storage belongs here", "Earth tones — brown, terracotta — are appropriate"],
  },
  {
    key: "SSW", deg: 202.5, label: "S–Southwest", shortLabel: "SSW",
    sanskrit: "Dakshina-Nairutya", lord: "Niruti–Yama", element: "Earth", elementIcon: "🌍",
    guna: "Tamasic", dosha: "Very intense — combined Nairutya & Yama",
    location: "Heavy storage, utility only",
    description: "Between the forces of Yama and Niruti, SSW carries the densest, most challenging energy. It must be anchored with weight and kept free from any active living function.",
    benefits: ["Stability when heavily anchored", "Good for very heavy equipment or foundation"],
    avoid: ["Any habitable space — bedroom, kitchen, prayer room", "Water, light, or openings of any kind"],
    guidance: ["Build strong, high walls here", "No doors, windows, or light features", "Place the heaviest items of the property here"],
  },
  {
    key: "SW", deg: 225, label: "Southwest", shortLabel: "SW",
    sanskrit: "Nairutya", lord: "Niruti", element: "Earth", elementIcon: "🌍",
    guna: "Tamasic", dosha: "Nairutya dosha — most powerful negative corner",
    location: "Master bedroom (to suppress the energy), heavy storage below",
    description: "Ruled by Niruti, the SW is the most powerful and potentially disruptive corner. Its dense earth energy must be dominated by the head of the household sleeping here.",
    benefits: ["When master occupies this corner, the household is protected", "The owner gains authority and grounding", "Stability and long-term security when properly anchored"],
    avoid: ["Main entrance — the most inauspicious door placement", "Puja room, kitchen, or any fire element", "Underground water tanks, wells, or swimming pools", "Open spaces, missing corners, or cuts in this direction"],
    guidance: ["Master/owner must sleep here with head pointing south or west", "Build the highest walls and heaviest structure in this corner", "No doors or windows — keep solid", "Place a heavy almirah or safe in the SW bedroom", "Vastu yantra can help correct existing SW doshas"],
  },
  {
    key: "WSW", deg: 247.5, label: "W–Southwest", shortLabel: "WSW",
    sanskrit: "Paschima-Nairutya", lord: "Varuna–Niruti", element: "Earth / Water", elementIcon: "🌊",
    guna: "Tamasic", dosha: "Moderate — earth meeting water",
    location: "Storage, utility, minor rooms",
    description: "A transitional zone where Nairutya's heaviness begins to soften into Varuna's water energy. Still dense but less severe than the SW itself.",
    benefits: ["Acceptable for secondary bedrooms with care", "Heavy storage is appropriate"],
    avoid: ["Main entrance, puja room, kitchen", "Overhead water tanks"],
    guidance: ["Use for storage or a secondary staircase", "Avoid bright, active living functions", "Earth and muted tones work best here"],
  },
  {
    key: "W", deg: 270, label: "West", shortLabel: "W",
    sanskrit: "Paschima", lord: "Varuna", element: "Water", elementIcon: "💧",
    guna: "Rajasic", dosha: "Varuna dosha if water element is absent",
    location: "Children's bedroom, dining room, study, secondary bedroom",
    description: "Varuna, god of cosmic order, governs the West with a promise of steady material gains. The West nourishes children's learning, prosperity, and family dining.",
    benefits: ["Financial gains and material prosperity", "Children's academic success and creativity", "Family unity through shared meals", "Steady, sustained growth"],
    avoid: ["Puja room — Varuna's rajasic energy is not ideal for devotion", "Main entrance (south-facing issues apply)"],
    guidance: ["Place children's bedroom here for academic success", "Dining room thrives in the West", "Study table facing east in a west-side room", "Use yellow, cream, or blue-grey tones"],
  },
  {
    key: "WNW", deg: 292.5, label: "W–Northwest", shortLabel: "WNW",
    sanskrit: "Paschima-Vayavya", lord: "Vayu–Varuna", element: "Air / Water", elementIcon: "🌬️",
    guna: "Rajasic", dosha: "Mild Vayu dosha",
    location: "Guest room, secondary storage, secondary staircase",
    description: "Between Varuna's watery gains and Vayu's airy movement, WNW carries a light, transient energy. Best suited for spaces where people come and go.",
    benefits: ["Good for impermanent guests or short stays", "Light, airy energy keeps things moving"],
    avoid: ["Master bedroom — creates restlessness", "Puja room"],
    guidance: ["Guest bedroom placement works well here", "Keep décor light and uncluttered", "A gentle wind-chime or light curtains suit this zone"],
  },
  {
    key: "NW", deg: 315, label: "Northwest", shortLabel: "NW",
    sanskrit: "Vayavya", lord: "Vayu", element: "Air", elementIcon: "🌬️",
    guna: "Rajasic", dosha: "Vayu dosha — instability if owner sleeps here",
    location: "Guest room, garage, daughters' room, secondary storage",
    description: "Ruled by Vayu, the wind god, the Northwest governs movement, relationships, and external support. Daughters of the household are said to benefit from a northwest bedroom.",
    benefits: ["Strong external support and networking energy", "Helpful relationships and business connections", "Encourages movement, travel, and activity"],
    avoid: ["Master bedroom — creates restlessness for the owner", "Permanent heavy storage — energy needs to flow freely"],
    guidance: ["Guest room here ensures guests leave on time (air keeps things moving!)", "Garage or parking works well in the NW", "Daughters' room is traditionally placed here", "Use grey, silver, or light blue tones"],
  },
  {
    key: "NNW", deg: 337.5, label: "N–Northwest", shortLabel: "NNW",
    sanskrit: "Uttar-Vayavya", lord: "Kubera–Vayu", element: "Air / Water", elementIcon: "💧",
    guna: "Sattvic", dosha: "Minimal",
    location: "Minor living space, small open area, study corner",
    description: "Bridging Vayu's movement and Kubera's prosperity, NNW carries a softly sattvic quality. It supports light activity and can house minor study or sitting areas.",
    benefits: ["Gentle, clear energy", "Supports minor study and reading spaces", "Bridges wealth and movement energy"],
    avoid: ["Kitchen or fire element", "Overhead water tanks on this side"],
    guidance: ["A reading corner or small sitting nook works here", "Keep open and airy", "Light cream or sky-blue tones suit this zone"],
  },
];

export function getVastuDir(heading: number): VastuDir {
  const h = ((heading % 360) + 360) % 360;
  const idx = Math.round(h / 22.5) % 16;
  return VASTU_DIRECTIONS[idx];
}

export const GUNA_COLOR: Record<Guna, string> = {
  Sattvic: "#16a34a",
  Rajasic: "#d97706",
  Tamasic: "#dc2626",
};

export const GUNA_BG: Record<Guna, string> = {
  Sattvic: "#f0fdf4",
  Rajasic: "#fffbeb",
  Tamasic: "#fef2f2",
};
