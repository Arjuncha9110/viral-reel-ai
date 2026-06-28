// ============================================================
// yogasAndDoshas.ts
// Vedic Astrology – Yogas & Doshas Analysis Engine
// Premium Kundali Report Module
// ============================================================

// ─── Zodiac & Sign Metadata ─────────────────────────────────

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Sign rulers (0-indexed sign → planet name)
const SIGN_LORDS: Record<number, string> = {
  0: 'Mars',    // Aries
  1: 'Venus',   // Taurus
  2: 'Mercury', // Gemini
  3: 'Moon',    // Cancer
  4: 'Sun',     // Leo
  5: 'Mercury', // Virgo
  6: 'Venus',   // Libra
  7: 'Mars',    // Scorpio
  8: 'Jupiter', // Sagittarius
  9: 'Saturn',  // Capricorn
  10: 'Saturn', // Aquarius
  11: 'Jupiter' // Pisces
};

// Exaltation signs (0-indexed)
const EXALTATION_SIGN: Record<string, number> = {
  Sun: 0,      // Aries
  Moon: 1,     // Taurus
  Mars: 9,     // Capricorn
  Mercury: 5,  // Virgo
  Jupiter: 3,  // Cancer
  Venus: 11,   // Pisces
  Saturn: 6    // Libra
};

// Own signs (0-indexed)
const OWN_SIGNS: Record<string, number[]> = {
  Sun: [4],
  Moon: [3],
  Mars: [0, 7],
  Mercury: [2, 5],
  Jupiter: [8, 11],
  Venus: [1, 6],
  Saturn: [9, 10]
};

// Friendly signs mapping
const FRIENDLY_SIGNS: Record<string, number[]> = {
  Sun: [0, 7, 8, 11],
  Moon: [0, 3, 4],
  Mars: [0, 4, 8, 9, 11],
  Mercury: [1, 5, 6, 9, 10],
  Jupiter: [0, 3, 7, 8, 11],
  Venus: [1, 2, 6, 9, 10],
  Saturn: [1, 2, 6, 9, 10]
};

// ─── Exported Interfaces ─────────────────────────────────────

export interface DoashaResult {
  present: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'strong';
  description: string;
  cancellationFactors: string;
  remedies: string;
}

export interface YogaResult {
  name: string;
  sanskritName: string;
  present: boolean;
  strength: 'weak' | 'moderate' | 'strong';
  description: string;
  lifeImpact: string;
  activationPeriod: string;
}

export interface YogasDoshasReport {
  manglikDosha: DoashaResult;
  kaalSarpDosha: DoashaResult;
  sadeSati: DoashaResult;
  dhaiya: DoashaResult;
  rajYog: YogaResult[];
  dhanYog: YogaResult[];
  vipreetRajYog: YogaResult[];
  gajKesariYog: YogaResult | null;
  summary: string;
}

export interface DoshaInputs {
  lagnaIndex: number;
  moonSignIndex: number;
  marsLon: number;
  jupiterLon: number;
  saturnLon: number;            // natal Saturn longitude
  rahuLon: number;
  ketuLon: number;
  sunLon: number;
  mercuryLon: number;
  venusLon: number;
  currentSaturnSignIndex: number; // Saturn transit sign TODAY
}

// ─── Utility Helpers ─────────────────────────────────────────

function signIndex(lon: number): number {
  return Math.floor(lon / 30) % 12;
}

function houseFromLagna(planetSignIdx: number, lagnaIndex: number): number {
  return ((planetSignIdx - lagnaIndex + 12) % 12) + 1;
}

function lordOfSign(signIdx: number): string {
  return SIGN_LORDS[signIdx % 12];
}

function signName(idx: number): string {
  return ZODIAC_SIGNS[idx % 12];
}

function isKendra(house: number): boolean {
  return [1, 4, 7, 10].includes(house);
}

function isTrikona(house: number): boolean {
  return [1, 5, 9].includes(house);
}

function isTrikBhava(house: number): boolean {
  return [6, 8, 12].includes(house);
}

function jupiterStrength(jupSignIdx: number): 'strong' | 'moderate' | 'weak' {
  if (jupSignIdx === EXALTATION_SIGN['Jupiter']) return 'strong';
  if (OWN_SIGNS['Jupiter'].includes(jupSignIdx)) return 'strong';
  if (FRIENDLY_SIGNS['Jupiter'].includes(jupSignIdx)) return 'moderate';
  return 'weak';
}

// ─── Manglik Dosha ───────────────────────────────────────────

function analyzeManglikDosha(
  marsLon: number,
  lagnaIndex: number,
  moonSignIndex: number,
  venusLon: number,
  jupiterLon: number
): DoashaResult {

  const marsSign = signIndex(marsLon);
  const marsHouseFromLagna = houseFromLagna(marsSign, lagnaIndex);
  const marsHouseFromMoon  = houseFromLagna(marsSign, moonSignIndex);
  const manglikHouses      = [1, 2, 4, 7, 8, 12];

  const fromLagna = manglikHouses.includes(marsHouseFromLagna);
  const fromMoon  = manglikHouses.includes(marsHouseFromMoon);
  const present   = fromLagna || fromMoon;

  // Severity
  let severity: 'none' | 'mild' | 'moderate' | 'strong' = 'none';
  if (present) {
    if ([7, 8].includes(marsHouseFromLagna)) severity = 'strong';
    else if ([1, 4].includes(marsHouseFromLagna)) severity = 'moderate';
    else severity = 'mild';
  }

  // Cancellation
  const marsInOwnSign   = OWN_SIGNS['Mars'].includes(marsSign);
  const venusSign       = signIndex(venusLon);
  const venusConjunct   = venusSign === marsSign;
  const jupSign         = signIndex(jupiterLon);
  const jupAspectsMars  =
    ((jupSign - marsSign + 12) % 12 === 4) ||   // 5th aspect
    ((jupSign - marsSign + 12) % 12 === 8) ||   // 9th aspect
    ((marsSign - jupSign + 12) % 12 === 6);      // 7th aspect (opposition)

  const cancellationFactors = !present
    ? 'Manglik Dosha is absent; no cancellation is required.'
    : marsInOwnSign
      ? `Mars occupies its own sign ${signName(marsSign)}, substantially neutralising Manglik Dosha. The fiery energy of Mars is well-directed here.`
      : jupAspectsMars
        ? `Jupiter's benefic gaze falls upon Mars, softening its aggressive Manglik influence and promoting harmony in partnerships.`
        : venusConjunct
          ? `Venus conjunct Mars in ${signName(marsSign)} brings a passionate yet ultimately stabilising pull that partially mitigates the Dosha's sharpness.`
          : `No primary cancellation factor is active. Mars sits in ${signName(marsSign)}, house ${marsHouseFromLagna} from Lagna and house ${marsHouseFromMoon} from Moon, with no notable cancellation.`;

  const description = !present
    ? `Your natal chart is free from Manglik Dosha. Mars, the commander of the planetary cabinet, is placed in the ${signName(marsSign)} (house ${marsHouseFromLagna} from Lagna), a position that does not afflict the pillars of marital life. This placement allows Martian energy to express constructively — as ambition, courage, and vitality — rather than through discord in relationships. Your partnerships are not under the shadow of Mars-generated friction, and you may approach marriage and long-term commitments with a lighter karmic burden than many. This is a supportive indicator for harmonious, enduring conjugal bonds.`
    : severity === 'strong'
      ? `Mars occupies the ${marsHouseFromLagna}${marsHouseFromLagna === 7 ? 'th (house of marriage)' : 'th (house of longevity and hidden forces)'} from your Lagna, creating a ${severity} Manglik Dosha — one of the more potent placements of this Dosha in classical Jyotish texts. The 7th house is the primary seat of partnerships, and Mars here infuses relationships with intensity, possessiveness, and periodic conflict. In the 8th house, Mars touches themes of shared resources, in-law relationships, and the hidden psychology of bonding. This placement demands conscious effort to balance Martian assertiveness with the softness required to sustain intimate relationships. Sages like Parashara specifically flag these houses as requiring careful remediation and a like-Manglik partner for greatest harmony.`
      : severity === 'moderate'
        ? `Mars in the ${marsHouseFromLagna}th house from Lagna creates a moderate Manglik Dosha in your chart. The ${marsHouseFromLagna === 1 ? 'first house position amplifies Mars in your personality — you may come across as aggressive or domineering without intending to, which can create friction in close relationships' : 'fourth house connects Mars to emotional security, home environment, and mother-figure dynamics, sometimes creating restlessness or conflict in domestic settings'}. While moderate, this Dosha requires awareness and proactive balancing. Your Moon-sign perspective (Mars in house ${marsHouseFromMoon}) adds a secondary dimension to this pattern. With appropriate remedies, this energy can be channelled into protecting and nurturing loved ones rather than clashing with them.`
        : `A mild Manglik Dosha is present, with Mars in the ${marsHouseFromLagna}th house from your Lagna — the ${marsHouseFromLagna === 2 ? 'house of speech, family finances, and accumulated wealth' : 'house of expenditure, liberation, and distant journeys'}. This is considered the mildest expression of Manglik Dosha in classical texts, primarily affecting communication patterns within the family (2nd house) or creating unconscious expenditure and isolation tendencies (12th house). The effects are subtle but worth acknowledging, particularly in the context of marriage compatibility assessments. Mild remediation will keep these vibrations well within manageable limits.`;

  const remedies = !present
    ? 'No specific Manglik remedies are required.'
    : `On Tuesdays, observe a partial fast and offer red flowers and jaggery to Lord Hanuman or Lord Subramanya. Recite the Mangal Beej Mantra "Om Kraam Kreem Kraum Sah Bhaumaya Namah" 108 times daily, ideally facing south. Wearing a red coral (Moonga) set in gold or copper on the ring finger of the right hand, on a Tuesday morning after energising it through mantra, can strengthen and discipline Martian energy. Performing a Kuja Dosha Nivaran Puja at a Subramanya temple (preferably Tiruchendur or any reputed Murugan temple) once in a lifetime is strongly recommended. Donate red lentils (masoor dal), wheat, copper utensils, and red cloth on Tuesdays to alleviate the Dosha's sharpness. Marrying a partner who is also Manglik is the classical Vedic prescription for mutual cancellation.`;

  return { present, severity, description, cancellationFactors, remedies };
}

// ─── Kaal Sarp Dosha ─────────────────────────────────────────

function analyzeKaalSarpDosha(
  sunLon: number,
  moonLon: number,  // we'll derive from moonSignIndex * 30 + 15
  marsLon: number,
  mercuryLon: number,
  jupiterLon: number,
  venusLon: number,
  saturnLon: number,
  rahuLon: number,
  ketuLon: number,
  lagnaIndex: number
): DoashaResult {

  const planets7 = [sunLon, moonLon, marsLon, mercuryLon, jupiterLon, venusLon, saturnLon];
  const rahuSignIdx = signIndex(rahuLon);

  // Normalise all longitudes to 0-360
  const normalise = (lon: number) => ((lon % 360) + 360) % 360;
  const rahu = normalise(rahuLon);
  const ketu = normalise(ketuLon);

  // Count planets within the Rahu→Ketu arc (going counterclockwise from Rahu toward Ketu)
  // In Vedic charts, Rahu's arc forward to Ketu is the "hemmed" zone.
  let planetsInside = 0;
  for (const lon of planets7) {
    const p = normalise(lon);
    let inside: boolean;
    if (rahu < ketu) {
      inside = p >= rahu && p <= ketu;
    } else {
      inside = p >= rahu || p <= ketu;
    }
    if (inside) planetsInside++;
  }

  const present  = planetsInside >= 3;
  let severity: 'none' | 'mild' | 'moderate' | 'strong' = 'none';
  if (planetsInside === 7) severity = 'strong';
  else if (planetsInside >= 5) severity = 'moderate';
  else if (planetsInside >= 3) severity = 'mild';

  const rahuSignName = signName(rahuSignIdx);
  const ketuSignName = signName(signIndex(ketuLon));
  const ksVariant    = ZODIAC_SIGNS[rahuSignIdx]; // Classical KSD is named after Rahu's sign

  const description = !present
    ? `Your horoscope is free from Kaal Sarp Dosha — a significant relief that many seekers are heartened to hear. The seven classical planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) are not hemmed entirely between the shadow planets Rahu and Ketu. Rahu sits in ${rahuSignName} and Ketu in ${ketuSignName}, and the planetary spread extends beyond this axis, allowing unhindered expression of your natal promise. Life's trajectory is not subject to the serpentine blockages that characterise classic Kaal Sarp charts. You may still experience periods of uncertainty related to Rahu-Ketu transits, but these are universal phenomena rather than the specific Dosha under discussion.`
    : severity === 'strong'
      ? `All seven classical planets in your chart are gathered within the arc between Rahu in ${rahuSignName} and Ketu in ${ketuSignName}, forming the full and potent Kaal Sarp Dosha — specifically the ${ksVariant} Kaal Sarp Yog variant recognised in classical texts. This configuration places the entire force of your karmic blueprint under the dominion of the Nodes, which are headless and tailless shadow planets operating outside linear cause-and-effect. The result is a life of intense karmic acceleration — extraordinary highs followed by equally dramatic reversals — often until the native completes certain soul-level lessons. Rahu pulls you toward worldly ambition with almost obsessive force, while Ketu continually draws you back toward dissolution, spirituality, and letting go. Many great saints, ascetics, politicians, and artists have born this Dosha, for it compels the native to rise far above the ordinary, though rarely without struggle.`
      : severity === 'moderate'
        ? `A partial Kaal Sarp Dosha is present in your chart, with ${planetsInside} of the seven classical planets hemmed within the Rahu (${rahuSignName})–Ketu (${ketuSignName}) axis. While not the full expression of this Dosha, this configuration still introduces Nodal interference into your life's primary themes — ambition, relationships, finances, or health may show cyclical patterns of ascent and sudden disruption. The planets outside the Nodal arc serve as release valves, providing periods of relative clarity and progress. This partial formation means you carry some of the spiritual urgency of Kaal Sarp Dosha but retain more agency and karmic flexibility than those with the complete formation.`
        : `A mild Kaal Sarp tendency is indicated, with ${planetsInside} planets falling within the Rahu–Ketu arc. This is not the classical full Kaal Sarp Dosha but does impart Nodal undertones — a recurring sense of unfulfilled potential, delayed results, or a feeling of destiny being just out of reach. These feelings tend to intensify during Rahu or Ketu dashas and significant Nodal transits. In practical terms, this is a call to develop resilience, spiritual anchoring, and detachment from outcome — qualities that the Nodes are specifically designed to cultivate in the soul.`;

  const cancellationFactors = !present
    ? 'Kaal Sarp Dosha is not present; no cancellation assessment is required.'
    : `If any planet sits exactly on the Rahu or Ketu degree (within 1°), or if Jupiter or Venus is closely conjunct one of the Nodes, the Dosha's severity is partially mitigated. Birth during Rahu Kaal itself sometimes neutralises the Dosha for certain ascendants. If the Lagna (${signName(lagnaIndex)}) lord is strong and well-placed outside the Nodal arc, it provides a strong countervailing force. Performing Kaal Sarp Shanti before age 33 is considered highly effective in classical remediation tradition.`;

  const remedies = !present
    ? 'No Kaal Sarp remedies are necessary.'
    : `Perform a Kaal Sarp Dosha Nivaran Puja at Tryambakeshwar (Nashik), Ujjain, or Kalahasti — these are the most potent Nodal remedy centres in India. Observe a fast on Nag Panchami and offer milk to Shiva lingam. Recite the Maha Mrityunjaya Mantra 108 times daily: "Om Tryambakam Yajamahe Sungandhim Pushtivardhanam, Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat." Donate seven types of grains on a Saturday at a temple or to the needy. Wearing a silver serpent ring (Nag Mudrika) consecrated on a Saturday during Rahu Kaal is prescribed by classical texts. Worship Lord Vishnu and specifically Lord Ananta-Shesha (the cosmic serpent) on Ekadashi. Avoid harming snakes and perform snake feeding rituals at a Nag temple on your birthday.`;

  return { present, severity, description, cancellationFactors, remedies };
}

// ─── Sade Sati ───────────────────────────────────────────────

function analyzeSadeSati(
  moonSignIndex: number,
  currentSaturnSignIndex: number
): DoashaResult {

  const saturnOffset = (currentSaturnSignIndex - moonSignIndex + 12) % 12;
  const inSadeSati   = [11, 0, 1].includes(saturnOffset);
  const present      = inSadeSati;

  let phase = '';
  let severity: 'none' | 'mild' | 'moderate' | 'strong' = 'none';

  if (saturnOffset === 11) { phase = 'Rising Phase (Udaya)'; severity = 'mild'; }
  else if (saturnOffset === 0) { phase = 'Peak Phase (Madhya)'; severity = 'strong'; }
  else if (saturnOffset === 1) { phase = 'Setting Phase (Astama)'; severity = 'moderate'; }

  const moonSign    = signName(moonSignIndex);
  const saturnSign  = signName(currentSaturnSignIndex);

  const description = !present
    ? `You are not currently under the influence of Sade Sati — the 7½-year transit of Saturn through the 12th, 1st, and 2nd houses from your natal Moon sign (${moonSign}). Saturn currently transits ${saturnSign} (offset ${saturnOffset} from your Moon), placing you in a period of relative Saturnine freedom. This is an auspicious window to consolidate gains, invest in long-term endeavours, and build the foundations that will sustain you through future Saturnine periods. While Saturn will inevitably return to your Moon's vicinity in its cyclic journey, you may use this reprieve to build spiritual, physical, and material reserves.`
    : saturnOffset === 0
      ? `You are currently in the most intense phase of Sade Sati — the Peak or Madhya phase — with Saturn transiting directly through ${moonSign}, your natal Moon sign. This is the full weight of Shani's disciplinarian hand upon your mind, emotions, and self-identity, as the Moon signifies the very seat of the mental body in Vedic thought. During this phase, many natives experience significant life restructuring: relationships may be tested, health may demand attention, career paths may shift, and deep-seated emotional patterns are brought to the surface for examination. Classical Jyotish regards this not as punishment but as Saturn's intense purification — a time when karmic debts are cleared at an accelerated rate, often through apparent hardship. Your Moon sign (${moonSign}) colours the nature of Saturn's lessons: the archetypal themes of ${moonSign} are precisely where Shani is pressing hardest for growth, discipline, and authenticity.`
      : saturnOffset === 11
        ? `You are in the Rising Phase (Udaya) of Sade Sati, with Saturn transiting ${saturnSign}, the 12th sign from your natal Moon in ${moonSign}. This initial phase often manifests as subtle disruptions to sleep, secret anxieties, or unexpected expenditure — the 12th house themes of loss, isolation, and the subconscious are activated. Many natives sense a general heaviness or fatigue without an obvious external cause during this phase. It is a time to simplify life, reduce unnecessary commitments, and begin building the spiritual and psychological resilience that the coming peak phase will demand. Saturn is approaching your Moon, and this is your preparation window.`
        : `You are in the Setting Phase (Astama) of Sade Sati, with Saturn transiting ${saturnSign}, the 2nd sign from your natal Moon in ${moonSign}. The heaviest storms of Sade Sati are behind you, but Saturn's parting gift is a closer look at your speech, finances, family relationships, and accumulated values — all themes of the 2nd house. Some natives experience financial strain or family conflicts during this phase as Saturn completes its audit. However, relief and clarity are unmistakably returning, and if lessons have been integrated, this phase often culminates in remarkable clarity about what truly matters and a cleaner, more disciplined life structure.`;

  const cancellationFactors = !present
    ? 'Sade Sati is not active; no cancellation factors apply.'
    : `If Saturn is the Lagna or Yogakaraka lord (especially for Capricorn, Aquarius, Taurus, or Libra ascendants), Sade Sati's effects are considerably softened, as Saturn becomes a functional benefic. If Jupiter simultaneously transits the 1st, 4th, 5th, 7th, 9th, or 11th from Moon, its expansive optimism counterbalances Saturnine restriction. A strong and well-placed natal Moon (exalted in Taurus, in own sign Cancer, or aspected by Jupiter) provides the emotional resilience to bear Saturn's lessons with grace. If you are running the Dasha of a benefic planet, the outer transit of Saturn may be less disruptive than it would otherwise be.`;

  const remedies = !present
    ? 'No Sade Sati remedies are required at this time.'
    : `Recite the Shani Stotra or the Dasharatha Shani Stotram every Saturday. Visit a Shani temple (particularly Shingnapur or Thirunallar) during the transit period and perform an oil abhisheka of the Shani idol with sesame (til) oil. Observe a Saturday fast, consuming only one meal of sesame seeds, black lentils, and rice. Donate black cloth, iron utensils, sesame oil, blue sapphire (neelam, ONLY after consultation with a qualified astrologer), and shoes to the poor on Saturdays. Recite "Om Sham Shanicharaya Namah" 108 times daily. Serving the elderly, the disabled, and those in hardship is considered the most powerful spiritual remedy for Sade Sati, as it embodies the Saturnine virtues of service and compassion. Wearing dark blue or black during Saturdays aligns your energy field with Shani's vibration.`;

  return { present, severity, description, cancellationFactors, remedies };
}

// ─── Dhaiya (Panoti) ─────────────────────────────────────────

function analyzeDhaiya(
  moonSignIndex: number,
  currentSaturnSignIndex: number
): DoashaResult {

  const saturnOffset = (currentSaturnSignIndex - moonSignIndex + 12) % 12;
  const inDhaiya     = [3, 7].includes(saturnOffset);
  const present      = inDhaiya;

  let severity: 'none' | 'mild' | 'moderate' | 'strong' = 'none';
  let houseLabel = '';
  if (saturnOffset === 3)  { severity = 'moderate'; houseLabel = '4th (Ardha Sade Sati – domestic/emotional)'; }
  if (saturnOffset === 7)  { severity = 'strong';   houseLabel = '8th (Ashtama Shani – karmic transformation)'; }

  const moonSign   = signName(moonSignIndex);
  const saturnSign = signName(currentSaturnSignIndex);

  const description = !present
    ? `Dhaiya (the 2½-year mini-Saturn transit) is not active in your chart at present. Saturn is not transiting the 4th or 8th from your natal Moon sign (${moonSign}), so you are spared the specific pressures this transit brings. Continue to honour Saturnine virtues — discipline, humility, patience — and maintain your remedial practices to ensure smooth sailing through future Saturn cycles.`
    : saturnOffset === 7
      ? `Saturn currently transits ${saturnSign}, the 8th house from your natal Moon in ${moonSign} — a transit known as Ashtama Shani in classical Jyotish, considered the most intense expression of Dhaiya. The 8th house from Moon represents sudden events, hidden fears, karmic debts, chronic health vulnerabilities, and deep psychological transformation. During Ashtama Shani, life may feel as if it is dismantling familiar structures without warning — professional changes, health scares, relationship upheavals, or spiritual crises are common. However, classical seers regarded this transit as one of the most potent purifiers in a person's life: what falls away was always meant to, and what emerges is a more authentic, resilient self. Surrender and spiritual practice are the most effective navigational tools during Ashtama Shani.`
      : `Saturn currently transits ${saturnSign}, the 4th house from your natal Moon in ${moonSign} — a transit known as Ardha Sade Sati or the 4th Dhaiya. The 4th house from Moon governs the inner emotional world, domestic harmony, the mother figure, property matters, and one's sense of rootedness. During this transit, Saturn may bring domestic responsibilities, housing concerns, tensions with maternal figures, or a general feeling of emotional dissatisfaction and restlessness at home. Sleep quality often suffers. However, this is also a powerful time to establish enduring domestic foundations — to renovate, relocate with intention, or restructure home-based responsibilities in ways that serve long-term stability.`;

  const cancellationFactors = !present
    ? 'Dhaiya is not active; no cancellation factors apply.'
    : `For Capricorn, Aquarius, Taurus, and Libra ascendants, Saturn is a functional benefic and Dhaiya's effects are considerably reduced. A Jupiter transit through the 1st, 5th, or 9th from Moon simultaneously provides optimistic counterpressure. Strong natal Moon (Cancer or Taurus placement) gives emotional resilience. If you are in the Dasha of a benefic planet (Jupiter, Venus, or Mercury), the transit's outer pressure is buffered by inner momentum.`;

  const remedies = !present
    ? 'No Dhaiya remedies are required at present.'
    : `Perform a Shani Shanti puja or Navagraha puja. Donate mustard oil, sesame seeds, black lentils, iron, and dark-coloured blankets on Saturdays. Recite "Om Shanaishcharaya Namah" 108 times every Saturday morning. Visit the Shani temple in Shingnapur or offer prayers at your local Navagraha shrine. Maintain a strong exercise and sleep routine to fortify yourself against Saturnine fatigue. Practice karma yoga — selfless service to those in need, particularly the elderly, labourers, or the chronically ill. Wearing a Shani yantra (energised on a Saturday) or keeping it in your puja space is recommended during the Dhaiya period.`;

  return { present, severity, description, cancellationFactors, remedies };
}

// ─── Raj Yog ─────────────────────────────────────────────────

function analyzeRajYog(
  lagnaIndex: number,
  sunLon: number,
  moonLon: number,
  marsLon: number,
  mercuryLon: number,
  jupiterLon: number,
  venusLon: number,
  saturnLon: number
): YogaResult[] {

  const results: YogaResult[] = [];
  const planetLons: Record<string, number> = {
    Sun: sunLon, Moon: moonLon, Mars: marsLon, Mercury: mercuryLon,
    Jupiter: jupiterLon, Venus: venusLon, Saturn: saturnLon
  };

  // Helper: sign of the nth house from lagna
  const houseSign = (n: number) => (lagnaIndex + n - 1) % 12;

  // Helper: planet longitude for a planet by name
  const planetSign = (name: string) => signIndex(planetLons[name]);
  const planetHouseFL = (name: string) => houseFromLagna(planetSign(name), lagnaIndex);

  // Lord of a house (1-indexed)
  const hLord = (h: number) => lordOfSign(houseSign(h));

  // ── 1. Dharma-Karma Adhipati Raj Yog (9th + 10th lord conjunct) ──────────────
  const lord9  = hLord(9);
  const lord10 = hLord(10);
  const s9     = planetSign(lord9);
  const s10    = planetSign(lord10);

  const dkPresent = s9 === s10; // conjunct in same sign
  {
    const strength: 'weak' | 'moderate' | 'strong' = dkPresent
      ? (isKendra(houseFromLagna(s9, lagnaIndex)) || isTrikona(houseFromLagna(s9, lagnaIndex)) ? 'strong' : 'moderate')
      : 'weak';

    results.push({
      name:          'Dharma-Karma Adhipati Raj Yog',
      sanskritName:  'Dharma-Karma-Adhipati Yoga',
      present:       dkPresent,
      strength:      dkPresent ? strength : 'weak',
      description: dkPresent
        ? `In your chart, the lord of the 9th house (${lord9}, governing Dharma, fortune, and the blessings of past lives) and the lord of the 10th house (${lord10}, governing career, authority, and public standing) are conjunct in ${signName(s9)}. This rare alignment, known in classical texts as Dharma-Karma Adhipati Raj Yog, merges the highest fortune with the sphere of action and professional karma. The ancients considered this one of the most auspicious planetary combinations for worldly success, as it unifies righteous purpose (9th house) with effective action and recognition (10th house). This Yog makes your professional path one that is cosmically supported — when you work in alignment with your deeper values and dharmic purpose, success does not merely follow effort but arrives with an almost gravitational inevitability. The sign ${signName(s9)} colours how this power expresses: its qualities permeate both your fortune and your chosen field of work.`
        : `The lords of the 9th house (${lord9}) and 10th house (${lord10}) occupy different signs in your chart — ${signName(s9)} and ${signName(s10)} respectively — and thus do not form the classical Dharma-Karma Adhipati Raj Yog. This does not preclude professional success, but it means that fortune and career ambition must be consciously integrated through sustained effort rather than a natural celestial alignment. You may experience phases where dharmic values and professional imperatives pull in separate directions, and navigating these consciously will be part of your karmic work.`,
      lifeImpact: dkPresent
        ? `This Raj Yog confers the blessings of authority, respect, and meaningful career achievement. Natives with this combination often rise to leadership positions in their chosen field and are recognised not merely for skill but for the moral quality of their work. The 9th house influence ensures that success comes through ethical means and attracts the blessings of teachers, mentors, and divine grace. Public recognition often comes in the second half of life, when the Yog has fully matured and the native has accumulated enough experience to wield its power wisely.`
        : `Without this specific Raj Yog, career advancement requires building solid alliances between dharmic principles and professional strategy. Focus on finding work that resonates with your 9th house values (fortune, philosophy, dharma) to attract the organic success that Dharma-Karma Adhipati Yog would otherwise have conferred automatically.`,
      activationPeriod: dkPresent
        ? `This Raj Yog becomes most potent during the Maha Dasha or Antardasha of ${lord9} or ${lord10}, particularly if these planets are well-placed and unafflicted. Transits of Jupiter over the conjunction point in ${signName(s9)} or over your Lagna also spark this Yog's expression. The 10th year, 27th year, and 45th year cycles often mark key activations.`
        : `No specific activation note applies as this Yog is not present.`,
    });
  }

  // ── 2. Surya Raj Yog (Sun in 10th from Lagna) ──────────────────────────────
  {
    const sunHouse  = planetHouseFL('Sun');
    const present   = sunHouse === 10;
    const sunSign   = planetSign('Sun');
    const str: 'weak' | 'moderate' | 'strong' = present
      ? (sunSign === EXALTATION_SIGN['Sun'] ? 'strong' : OWN_SIGNS['Sun'].includes(sunSign) ? 'strong' : 'moderate')
      : 'weak';

    results.push({
      name:         'Surya Raj Yog',
      sanskritName: 'Surya Raj Yoga',
      present,
      strength:     present ? str : 'weak',
      description: present
        ? `The Sun, sovereign of the planetary cabinet and karaka of the soul, authority, and government, occupies the 10th house of your chart — the Karma Bhava — in the sign of ${signName(sunSign)}. This placement creates Surya Raj Yog, a classical indicator of leadership, executive authority, and high public standing. The Sun in the 10th house is considered one of the most powerful placements for worldly success in Vedic astrology, analogous to a king seated upon his throne. Your professional identity is illuminated by solar light — you are seen, recognised, and respected in your chosen field. There is a natural magnetism to your professional persona, and others instinctively look to you for guidance, clarity, and direction. The sign ${signName(sunSign)} modulates the style of this authority — the archetypes of this sign become the lens through which your solar leadership power expresses.`
        : `The Sun occupies the ${sunHouse}th house from your Lagna in ${signName(sunSign)}, and while the Sun's qualities of soul, authority, and clarity permeate that area of life, the specific Surya Raj Yog arising from 10th house placement is not present. The Sun in the ${sunHouse}th still contributes meaningfully to your chart — its sign and any aspects it receives give important colour to your identity, vitality, and relationship with authority figures — but the powerful career-throne alignment of Surya Raj Yog awaits your conscious cultivation.`,
      lifeImpact: present
        ? `Surya Raj Yog bestows significant career recognition and the potential for governmental, administrative, or executive roles. Natives with this placement frequently encounter opportunities for leadership that others do not, and they carry a natural authority that can inspire teams and communities. Father figures and authority relationships play a formative role in shaping career direction. Sun here also brings visibility — your work rarely goes unnoticed, and both praise and scrutiny come in proportion to the solar light.`
        : `The Sun's house placement still influences your relationship with authority, self-expression, and professional visibility, though not through the specific mechanism of 10th house Raj Yog. Cultivating leadership qualities and dharmic integrity in your professional sphere will help you express the Sun's full potential regardless.`,
      activationPeriod: present
        ? `Surya Raj Yog activates most powerfully during Sun Maha Dasha and Sun Antardasha within other dashas. January–February (Capricorn solar transit) and April (Aries solar transit) are particularly potent months for career advancement. The years when Jupiter transits your 10th house sign (${signName(sunSign)}) are landmark career years.`
        : 'Not applicable.',
    });
  }

  // ── 3. Lakshmi Yog (5th and 9th lords in kendra) ───────────────────────────
  {
    const lord5  = hLord(5);
    const lord9b = hLord(9);
    const s5     = planetSign(lord5);
    const s9b    = planetSign(lord9b);
    const h5     = houseFromLagna(s5, lagnaIndex);
    const h9b    = houseFromLagna(s9b, lagnaIndex);
    const present = isKendra(h5) && isTrikona(h9b); // 5th in kendra, 9th in trikona or kendra

    const str: 'weak' | 'moderate' | 'strong' = present
      ? (isKendra(h5) && isKendra(h9b) ? 'strong' : 'moderate')
      : 'weak';

    results.push({
      name:         'Lakshmi Yog',
      sanskritName: 'Lakshmi Yoga',
      present,
      strength:     present ? str : 'weak',
      description: present
        ? `Lakshmi Yog graces your chart through the placement of the 5th house lord (${lord5}) in a kendra (${h5}th house, ${signName(s5)}) and the 9th house lord (${lord9b}) in a powerful position (${h9b}th house, ${signName(s9b)}). This combination is explicitly described in Brihat Parashara Hora Shastra as one of the hallmarks of Lakshmi's blessing — prosperity, spiritual grace, and recognition. The 5th house governs past-life merit (Purva Punya), creative intelligence, and progeny, while the 9th governs divine fortune, dharma, and the guru's grace. When both their lords are in positions of strength, the native's material and spiritual life flows with an ease that others observe and admire. You carry within you a luminous thread of past-life righteousness that opens doors in this life.`
        : `Lakshmi Yog is not fully formed in your chart, as the 5th lord (${lord5}) in the ${h5}th and the 9th lord (${lord9b}) in the ${h9b}th do not meet the classical Kendra/Trikona requirement simultaneously. However, the underlying Purva Punya (5th) and Bhagya (9th) energies in your chart remain potent through other combinations, and cultivating dharmic action and gratitude can draw Lakshmi's grace through alternative pathways.`,
      lifeImpact: present
        ? `This Yog blesses the native with wealth that comes somewhat easily — often through intelligence, creative enterprise, or divine fortune rather than grinding labour alone. There is a quality of abundance that seems to arrive at the right time, often through windfalls, benevolent relationships, or ventures that bear outsized fruit relative to effort. The 5th house influence often brings prosperity through children, education, investments, or creative arts, while the 9th house imparts an ethical quality to wealth — it tends to come through righteous, dharmic activities.`
        : `Prosperity can still be cultivated through dedicated effort, ethical practice, and aligning with the natural strength of your natal benefics.`,
      activationPeriod: present
        ? `This Yog activates during the Maha Dasha or Antardasha of ${lord5} or ${lord9b}. Jupiter transiting your 1st, 5th, or 9th house also stimulates this Yog's expression. Fridays (Venus) and Thursdays (Jupiter) are auspicious for Lakshmi-related intentions.`
        : 'Not applicable.',
    });
  }

  return results;
}

// ─── Gaj Kesari Yog ──────────────────────────────────────────

function analyzeGajKesariYog(
  moonSignIndex: number,
  jupiterLon: number
): YogaResult | null {

  const jupSign = signIndex(jupiterLon);
  const jupHouseFromMoon = houseFromLagna(jupSign, moonSignIndex);
  const present = isKendra(jupHouseFromMoon);

  if (!present) return null;

  const str = jupiterStrength(jupSign);
  const jSignName = signName(jupSign);
  const moonSignN = signName(moonSignIndex);

  return {
    name:         'Gaj Kesari Yog',
    sanskritName: 'Gaja-Kesarī Yoga',
    present:      true,
    strength:     str,
    description:  `One of the most celebrated and widely recognised combinations in Vedic astrology, Gaj Kesari Yog is formed in your chart by Jupiter's placement in the ${jupHouseFromMoon}th house from your natal Moon in ${moonSignN} — Jupiter occupies ${jSignName}, a kendra position from your Moon. Gaja means elephant — the wisest and most auspicious animal in Indian tradition — and Kesari means lion — the sovereign of the forest. This Yog thus combines the wisdom and benevolence of Jupiter with the courage and dignity of the lunar mind, producing a personality of remarkable grace, intelligence, and magnetic authority. Classical texts such as Jataka Parijata describe Gaj Kesari natives as honoured by kings and scholars alike, possessed of clear ethical judgement, and blessed with a long, fortunate life. Your emotional intelligence (Moon in ${moonSignN}) is continuously nourished by Jupiter's wisdom in ${jSignName}, making you someone whose counsel is sought, whose presence inspires trust, and whose inner life is oriented toward higher principles.`,
    lifeImpact:   `Gaj Kesari Yog confers intellectual distinction, a noble reputation, and the ability to navigate complex social situations with grace. Natives with this Yog often achieve recognition in academia, law, teaching, counselling, or any field requiring both wisdom and interpersonal authority. There is a natural luck and timing that seems to accompany major life decisions — opportunities arise at the right moment, and key doors open through the right relationships. Material comfort tends to be sustained rather than dramatic, with Jupiter's 4th-from-Moon position (if applicable) also blessing real estate and domestic happiness. The strength of this Yog — currently ${str} — reflects Jupiter's condition in ${jSignName}: ${str === 'strong' ? 'Jupiter is at full power here, either exalted or in its own sign, maximising every quality of this Yog.' : str === 'moderate' ? 'Jupiter is in a friendly sign, giving a comfortable but not spectacular expression of this Yog.' : 'Jupiter is not especially strong by sign, so this Yog manifests more through consistent inner wisdom than dramatic worldly success.'}`,
    activationPeriod: `Gaj Kesari Yog is most powerfully activated during Jupiter's Maha Dasha and any Antardasha period within dashas where Jupiter also plays a role. Major Jupiter transits — particularly when Jupiter crosses your natal Moon sign (${moonSignN}) or the Lagna — are milestone years of reputation-building, learning, and expanded opportunity. The 16th, 22nd, 28th, and 40th years of life are classical Gaj Kesari activation points.`,
  };
}

// ─── Dhan Yog ────────────────────────────────────────────────

function analyzeDhanYog(
  lagnaIndex: number,
  jupiterLon: number,
  venusLon: number,
  sunLon: number,
  moonLon: number,
  marsLon: number,
  mercuryLon: number,
  saturnLon: number
): YogaResult[] {

  const results: YogaResult[] = [];
  const planetLons: Record<string, number> = {
    Sun: sunLon, Moon: moonLon, Mars: marsLon, Mercury: mercuryLon,
    Jupiter: jupiterLon, Venus: venusLon, Saturn: saturnLon
  };
  const planetSgn = (n: string) => signIndex(planetLons[n]);
  const houseFL   = (n: string) => houseFromLagna(planetSgn(n), lagnaIndex);
  const hLord     = (h: number) => lordOfSign((lagnaIndex + h - 1) % 12);

  // ── 1. 2nd and 11th lord conjunct ──────────────────────────────────────────
  {
    const lord2  = hLord(2);
    const lord11 = hLord(11);
    const s2     = planetSgn(lord2);
    const s11    = planetSgn(lord11);
    const present = s2 === s11;
    const hConj  = houseFromLagna(s2, lagnaIndex);
    const str: 'weak' | 'moderate' | 'strong' = present
      ? (isKendra(hConj) || isTrikona(hConj) ? 'strong' : 'moderate')
      : 'weak';

    results.push({
      name:         '2nd–11th Lord Dhan Yog',
      sanskritName: 'Dhana Yoga (Dwitiya-Ekadasha Adhipati)',
      present,
      strength:     present ? str : 'weak',
      description: present
        ? `In your chart, the lord of the 2nd house (${lord2}, ruling accumulated wealth, family treasury, and speech) and the lord of the 11th house (${lord11}, ruling income, gains, and the fulfilment of desires) are conjunct in ${signName(s2)}, the ${hConj}th house from Lagna. This is the quintessential Dhan Yog — a meeting of the two primary houses of financial accumulation in classical Jyotish. The 2nd house represents savings and the family's inherited wealth, while the 11th represents the continuous flow of income and the materialisation of one's aspirations. When their lords unite, both reservoirs of financial energy — storage and flow — operate from the same planetary source, creating a powerful and often self-reinforcing cycle of wealth generation. The sign ${signName(s2)} and its qualities determine the style and arena of this financial blessing.`
        : `The lords of the 2nd (${lord2}, in ${signName(s2)}) and 11th houses (${lord11}, in ${signName(s11)}) are in different signs and do not form this classic conjunction Dhan Yog. Financial gains must be built through the separate operation of these two energies, requiring conscious strategy to bridge the wealth-storage (2nd house) and income-flow (11th house) areas of your life.`,
      lifeImpact: present
        ? `This Dhan Yog supports accumulation of wealth through family enterprise, investments, and the realisation of financial goals that may seem ambitious to others. Natives with this combination often have a natural financial acumen — they intuitively understand value, and their desires frequently materialise in concrete, measurable form. The conjunction in the ${hConj}th house is particularly telling: ${isKendra(hConj) ? 'a kendra placement amplifies this Yog to its full force, making financial success a defining feature of the life narrative' : 'this placement brings steady rather than spectacular gains, building over time into substantial security'}.`
        : `Financial growth is achievable through conscious alignment of savings habits (2nd house) and income-building strategies (11th house) without the automatic conjunction boost.`,
      activationPeriod: present
        ? `Financial gains accelerate during the Maha Dasha or Antardasha of ${lord2} or ${lord11}. Jupiter transiting the 2nd or 11th house from Lagna is a classical wealth-activation transit. Fridays and the waxing Moon fortnight are powerful for financial intentions.`
        : 'Not applicable.',
    });
  }

  // ── 2. Venus in 2nd or 11th ────────────────────────────────────────────────
  {
    const venHouse = houseFL('Venus');
    const present  = [2, 11].includes(venHouse);
    const venSign  = planetSgn('Venus');
    const str: 'weak' | 'moderate' | 'strong' = present
      ? (EXALTATION_SIGN['Venus'] === venSign || OWN_SIGNS['Venus'].includes(venSign) ? 'strong' : 'moderate')
      : 'weak';

    results.push({
      name:         'Shukra Dhan Yog',
      sanskritName: 'Shukra Dhana Yoga',
      present,
      strength:     present ? str : 'weak',
      description: present
        ? `Venus (Shukra), the planet of beauty, luxury, artistic refinement, and material comfort, occupies your ${venHouse}th house in ${signName(venSign)}. Venus is the natural karaka of wealth in Vedic astrology — it governs the pleasures that prosperity enables and the aesthetic intelligence that can generate it. In the ${venHouse === 2 ? '2nd house (the primary treasury and family wealth house)' : '11th house (the house of income, gains, and wishes fulfilled)'}, Venus directly injects its wealth-creating and comfort-seeking energy into the arena of financial accumulation and gains. This placement is celebrated in classical texts as Shukra Dhan Yog — Venus blessings that make financial prosperity more accessible and often more pleasurable in its manner of arrival.`
        : `Venus occupies your ${venHouse}th house in ${signName(venSign)}, outside the primary financial houses (2nd and 11th). While Venus enriches whatever house it occupies — bringing grace, beauty, and pleasure to that domain — its specific Shukra Dhan Yog financial enhancement is not active in its classical form.`,
      lifeImpact: present
        ? `Venus in the ${venHouse}th house brings wealth through creative, artistic, or relationship-based enterprises. Income often flows from fields connected to beauty, design, fashion, luxury, entertainment, or the arts. There is also an element of social charisma — Venus's network-building quality ensures that the right people open financial doors at the right time. Expenditure on luxury is tempted by this placement, and balancing Venus's enjoyment of wealth with Saturn's discipline of savings will determine the ultimate magnitude of financial achievement.`
        : `Venus contributes its wealth-attracting energy through other chart combinations. Focusing on Venusian qualities — beauty, harmony, and creative excellence — in your professional work remains an effective path to financial alignment.`,
      activationPeriod: present
        ? `Venus Maha Dasha (20 years) is the primary activation period for Shukra Dhan Yog. Venus Antardashas within other Mahadashas also trigger financial opportunities. Fridays, Shukla Paksha (waxing Moon), and spring months (April–May, when the Sun transits Taurus) are particularly auspicious for wealth-related action.`
        : 'Not applicable.',
    });
  }

  return results;
}

// ─── Vipreet Raj Yog ─────────────────────────────────────────

function analyzeVipreetRajYog(
  lagnaIndex: number,
  sunLon: number,
  moonLon: number,
  marsLon: number,
  mercuryLon: number,
  jupiterLon: number,
  venusLon: number,
  saturnLon: number
): YogaResult[] {

  const results: YogaResult[] = [];
  const planetLons: Record<string, number> = {
    Sun: sunLon, Moon: moonLon, Mars: marsLon, Mercury: mercuryLon,
    Jupiter: jupiterLon, Venus: venusLon, Saturn: saturnLon
  };
  const planetSgn = (n: string) => signIndex(planetLons[n]);
  const houseFL   = (n: string) => houseFromLagna(planetSgn(n), lagnaIndex);
  const hLord     = (h: number) => lordOfSign((lagnaIndex + h - 1) % 12);

  const trikBhavas = [6, 8, 12];

  // ── Harsha Yog (6th lord in 6th) ───────────────────────────────────────────
  {
    const lord6  = hLord(6);
    const h6Lord = houseFL(lord6);
    const present = h6Lord === 6;
    const s6     = planetSgn(lord6);

    results.push({
      name:         'Harsha Vipreet Raj Yog',
      sanskritName: 'Harsha Yoga (Ṣaṣṭheśa in Ṣaṣṭha)',
      present,
      strength:     present ? 'strong' : 'weak',
      description: present
        ? `Harsha Yog, one of the three forms of Vipreet Raj Yog, graces your chart: the 6th house lord (${lord6}) is placed in the 6th house itself in ${signName(s6)}. The 6th house governs enemies, disease, debts, legal disputes, and daily work challenges — all the adversities that Vedic tradition classifies as Ripu (enemies) or Roga (illness). When the lord of this house is confined within the same house, classical Jyotish interprets this as the lord "devouring its own subjects" — enemies destroy each other, diseases resolve themselves, and debts find unexpected relief. This paradoxical placement produces a form of protection from the very adversities that might be expected from a strong 6th house. Harsha Yog natives often emerge victorious from legal battles, overcome illnesses that confound medical expectation, and find that those who oppose them ultimately self-destruct.`
        : `Harsha Yog (6th lord in 6th) is not present in your chart — the 6th lord (${lord6}) occupies the ${h6Lord}th house in ${signName(s6)}. This means the 6th house adversities (enemies, debts, health challenges) must be navigated through conscious effort and standard remedial action rather than the automatic self-cancelling dynamic of Harsha Yog.`,
      lifeImpact: present
        ? `Harsha Yog provides remarkable resilience in adversity. Lawsuits filed against the native tend to collapse; enemies who conspire against them find their plans derailed by unforeseen circumstances. Health recoveries are often surprising — the body's regenerative capacity is amplified. Professionally, the native may excel in fields dealing with adversity: medicine, law, military, security, or crisis management. This Yog does not prevent challenges from arising but ensures that the native consistently emerges on the winning side.`
        : 'Not applicable.',
      activationPeriod: present
        ? `Harsha Yog activates powerfully during the Maha Dasha or Antardasha of ${lord6}. During this period, adversarial situations that seemed threatening resolve in the native's favour, often dramatically and unexpectedly. Transits of Jupiter over the 6th house sign (${signName(s6)}) also activate this protective Yog.`
        : 'Not applicable.',
    });
  }

  // ── Sarala Yog (8th lord in 8th) ───────────────────────────────────────────
  {
    const lord8  = hLord(8);
    const h8Lord = houseFL(lord8);
    const present = h8Lord === 8;
    const s8     = planetSgn(lord8);

    results.push({
      name:         'Sarala Vipreet Raj Yog',
      sanskritName: 'Sarala Yoga (Aṣṭameśa in Aṣṭama)',
      present,
      strength:     present ? 'strong' : 'weak',
      description: present
        ? `Sarala Yog is formed in your chart by the placement of the 8th house lord (${lord8}) in the 8th house itself in ${signName(s8)}. The 8th house is the most esoteric and transformative of all twelve houses — it governs death and rebirth, occult knowledge, inheritance, hidden wealth, chronic illness, catastrophic change, and the deepest mysteries of existence. When the lord of this house is trapped within its own domain, the destructive and unpredictable qualities of the 8th house are largely contained and inwardly directed, creating a paradoxical form of protection. Classically, Sarala Yog is said to make the native long-lived, fearless of enemies, and capable of withstanding catastrophic circumstances that would destroy others. There is also a strong occult or mystical dimension to this Yog — the native often develops an unusual relationship with the unseen dimensions of life.`
        : `Sarala Yog (8th lord in 8th) is not present — the 8th lord (${lord8}) occupies the ${h8Lord}th house in ${signName(s8)}. 8th house themes of sudden change, hidden matters, and karmic transformation must be navigated through conscious spiritual practice and crisis-resilience building rather than the innate buffering of Sarala Yog.`,
      lifeImpact: present
        ? `Sarala Yog bestows unusual courage and the capacity to survive — and even thrive — in crisis situations. Inheritance, insurance benefits, partner's wealth, or unexpected windfalls often materialise in the native's life. There is a fearlessness regarding death and suffering that makes this native particularly effective in crisis management, medical fields, research, investigation, or spiritual practices involving confrontation with the shadow. The longevity indicated by this Yog also suggests that the native is preserved through major challenges for a longer purpose.`
        : 'Not applicable.',
      activationPeriod: present
        ? `Sarala Yog's protective influence peaks during the Maha Dasha and Antardasha of ${lord8}. During Rahu or Ketu dashas (when 8th house themes intensify universally), this Yog provides a crucial buffer. Ages around 36, 42, and 54 are classical Sarala Yog activation milestones related to 8th house planetary cycles.`
        : 'Not applicable.',
    });
  }

  // ── Vimala Yog (12th lord in 12th) ─────────────────────────────────────────
  {
    const lord12 = hLord(12);
    const h12Lord = houseFL(lord12);
    const present = h12Lord === 12;
    const s12    = planetSgn(lord12);

    results.push({
      name:         'Vimala Vipreet Raj Yog',
      sanskritName: 'Vimala Yoga (Dvādaśeśa in Dvādaśa)',
      present,
      strength:     present ? 'strong' : 'weak',
      description: present
        ? `Vimala Yog, the third form of Vipreet Raj Yog, is present in your chart through the placement of the 12th house lord (${lord12}) in the 12th house itself in ${signName(s12)}. The 12th house governs moksha (liberation), expenditure, foreign lands, sleep, hospitals, isolation, and the dissolution of ego boundaries. When its lord occupies its own house, the potentially draining qualities of the 12th house — excessive expenditure, losses, isolation — are contained and redirected. Instead of leaking energy into unconscious dissolution, Vimala Yog channels 12th house energy into spiritual depth, charitable nature, and a paradoxical freedom from material anxiety. The native is gifted with a genuinely renunciate spirit even while engaged in the world, and expenditure tends to come back as invisible protection, good karma, and spiritual merit.`
        : `Vimala Yog (12th lord in 12th) is not present — the 12th lord (${lord12}) occupies the ${h12Lord}th house in ${signName(s12)}. The 12th house's natural tendency toward expenditure and dissolution must be consciously managed through budgeting, boundary-setting, and deliberate spiritual practice rather than the automatic containment of Vimala Yog.`,
      lifeImpact: present
        ? `Vimala Yog brings a quality of divine protection against unseen losses. Expenditures are often redirected into merit-making activities — donations, pilgrimages, spiritual study — that return as invisible grace. The native tends toward a naturally frugal or charitable lifestyle, not from deprivation but from inner contentment. There is often a powerful connection to foreign lands or people, which proves ultimately beneficial. Spiritual progress is accelerated for natives with this Yog, as the 12th house's dissolution energy is properly channelled toward genuine liberation.`
        : 'Not applicable.',
      activationPeriod: present
        ? `Vimala Yog activates during the Maha Dasha and Antardasha of ${lord12}. Periods when Saturn transits the 12th house (Sade Sati-adjacent) are also times when this Yog provides unexpected protection. Spiritual retreats, pilgrimages, and charitable activities undertaken during these periods yield maximum karmic return.`
        : 'Not applicable.',
    });
  }

  return results;
}

// ─── Summary ─────────────────────────────────────────────────

function buildSummary(
  report: Omit<YogasDoshasReport, 'summary'>,
  lagnaSign: string,
  moonSign: string
): string {

  const dosha_count = [
    report.manglikDosha.present,
    report.kaalSarpDosha.present,
    report.sadeSati.present,
    report.dhaiya.present
  ].filter(Boolean).length;

  const rajYogCount       = report.rajYog.filter(y => y.present).length;
  const dhanYogCount      = report.dhanYog.filter(y => y.present).length;
  const vipreetCount      = report.vipreetRajYog.filter(y => y.present).length;
  const gajKesariPresent  = report.gajKesariYog?.present ?? false;
  const totalYogas        = rajYogCount + dhanYogCount + vipreetCount + (gajKesariPresent ? 1 : 0);

  const doshaBalance = dosha_count === 0
    ? 'remarkably free of major Doshas'
    : dosha_count === 1
      ? 'carrying one active Dosha that deserves attentive remediation'
      : `carrying ${dosha_count} active Doshas, a significant karmic load requiring sustained remedial practice`;

  const yogaBalance = totalYogas === 0
    ? 'the chart does not present major classical Yogas in their full form'
    : totalYogas <= 2
      ? `${totalYogas} classical Yoga${totalYogas > 1 ? 's' : ''} grace${totalYogas === 1 ? 's' : ''} this chart, a meaningful celestial endorsement`
      : `a remarkably Yoga-rich chart, with ${totalYogas} classical combinations supporting success, wealth, and spiritual depth`;

  return `Your ${lagnaSign} Lagna chart, seen through the Yoga-Dosha lens, reveals a natal blueprint that is ${doshaBalance}, while ${yogaBalance}. ` +
    `The balance between celestial challenges (Doshas) and celestial gifts (Yogas) is a fundamental indicator of the karmic trajectory you have chosen for this lifetime — the presence of ${dosha_count > 0 ? 'Doshas alongside potent Yogas creates the classic Vedic paradox of a soul who carries both tests and talents in equal measure, using challenges as catalysts for the very Yogas to express their full power' : 'Yogas without the burden of major Doshas suggests a lifetime of relatively clear karmic runway, where the soul\'s primary work is to fully activate and express the positive combinations rather than first clearing significant karmic debris'}. ` +
    `${gajKesariPresent ? `The crowning grace of Gaj Kesari Yog — Jupiter's kendra placement from your Moon in ${moonSign} — bestows an overarching wisdom and benevolence on your entire chart, acting as a cosmic buffer that softens Dosha effects and magnifies Yoga benefits. ` : ''}` +
    `${vipreetCount > 0 ? `The presence of ${vipreetCount} Vipreet Raj Yog${vipreetCount > 1 ? 's' : ''} adds a particularly intriguing dimension: these paradoxical Yogas ensure that adversity itself becomes the raw material for your rise, making you more dangerous to obstacles than ordinary good fortune would. ` : ''}` +
    `${dhanYogCount > 0 ? `Financial abundance has celestial support through ${dhanYogCount} Dhan Yog${dhanYogCount > 1 ? 's' : ''}, though the timing of their activation depends heavily on the Dasha sequence and Jupiter's transit blessing. ` : ''}` +
    `Ultimately, this chart asks you to honour the full spectrum of its gifts — to take remediation seriously as an act of dharmic self-care, to activate your Yogas through right action and righteous living, and to trust that the celestial pattern of your birth was not accidental but the precise configuration needed for your soul's next great leap. Live in alignment with the dharma of your ${lagnaSign} Lagna and the emotional wisdom of your Moon in ${moonSign}, and watch the full tapestry of your natal promise unfold.`;
}

// ─── Main Exported Function ───────────────────────────────────

export function analyzeYogasAndDoshas(inputs: DoshaInputs): YogasDoshasReport {
  const {
    lagnaIndex,
    moonSignIndex,
    marsLon,
    jupiterLon,
    saturnLon,
    rahuLon,
    ketuLon,
    sunLon,
    mercuryLon,
    venusLon,
    currentSaturnSignIndex
  } = inputs;

  // Derive moon longitude from moonSignIndex (use midpoint of sign)
  const moonLon = moonSignIndex * 30 + 15;

  const manglikDosha   = analyzeManglikDosha(marsLon, lagnaIndex, moonSignIndex, venusLon, jupiterLon);
  const kaalSarpDosha  = analyzeKaalSarpDosha(sunLon, moonLon, marsLon, mercuryLon, jupiterLon, venusLon, saturnLon, rahuLon, ketuLon, lagnaIndex);
  const sadeSati       = analyzeSadeSati(moonSignIndex, currentSaturnSignIndex);
  const dhaiya         = analyzeDhaiya(moonSignIndex, currentSaturnSignIndex);
  const rajYog         = analyzeRajYog(lagnaIndex, sunLon, moonLon, marsLon, mercuryLon, jupiterLon, venusLon, saturnLon);
  const gajKesariYog   = analyzeGajKesariYog(moonSignIndex, jupiterLon);
  const dhanYog        = analyzeDhanYog(lagnaIndex, jupiterLon, venusLon, sunLon, moonLon, marsLon, mercuryLon, saturnLon);
  const vipreetRajYog  = analyzeVipreetRajYog(lagnaIndex, sunLon, moonLon, marsLon, mercuryLon, jupiterLon, venusLon, saturnLon);

  const partial: Omit<YogasDoshasReport, 'summary'> = {
    manglikDosha,
    kaalSarpDosha,
    sadeSati,
    dhaiya,
    rajYog,
    dhanYog,
    vipreetRajYog,
    gajKesariYog,
  };

  const summary = buildSummary(partial, signName(lagnaIndex), signName(moonSignIndex));

  return { ...partial, summary };
}
