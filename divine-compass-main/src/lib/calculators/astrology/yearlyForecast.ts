// ============================================================
// yearlyForecast.ts
// Vedic Astrology – 5-Year Forecast & Comprehensive Life Analysis
// ============================================================

export interface YearForecast {
  year: number;
  overallTheme: string;
  careerAndProfession: string;
  financeAndWealth: string;
  loveAndRelationships: string;
  healthAndWellbeing: string;
  familyAndHome: string;
  spiritualGrowth: string;
  bestMonths: string[];
  cautionMonths: string[];
  keyPlanetaryInfluences: string;
  overallRating: number; // 1-5 stars
  actionPlan: string;
}

export interface CareerAnalysis {
  profession: string;
  bestSectors: string[];
  challenges: string;
  promotionPeriod: string;
  businessPotential: string;
  foreignOpportunities: string;
}

export interface FinanceAnalysis {
  wealthPotential: string;
  investmentAdvice: string;
  savingsGuidance: string;
  debtWarning: string;
  windfall: string;
  propertyYog: string;
}

export interface MarriageAnalysis {
  marriageYog: string;
  spouseNature: string;
  compatibleSigns: string[];
  bestMarriagePeriod: string;
  relationshipChallenges: string;
  remedyForHarmony: string;
}

export interface HealthAnalysis {
  constitutionType: string;
  vulnerableAreas: string[];
  preventiveMeasures: string;
  cautionPeriods: string;
  healingPractices: string;
}

export interface EducationAnalysis {
  learningStyle: string;
  strongSubjects: string[];
  higherEducation: string;
  foreignStudy: string;
  skillsToDevElop: string;
}

export interface ForeignTravelAnalysis {
  foreignYog: string;
  settlementPossibility: string;
  bestDirections: string;
  travelPeriods: string;
  foreignGains: string;
}

export interface ComprehensiveLifeAnalysis {
  career: CareerAnalysis;
  finance: FinanceAnalysis;
  marriage: MarriageAnalysis;
  health: HealthAnalysis;
  education: EducationAnalysis;
  foreignTravel: ForeignTravelAnalysis;
}

export interface YearlyForecastInputs {
  lagnaSign: string;
  lagnaIndex: number;
  moonSign: string;
  moonSignIndex: number;
  sunSign: string;
  nakshatra: string;
  nakshatraLord: string;
  currentMaha: string;
  currentAntar: string;
  mahadashas: Array<{
    planet: string;
    start: Date;
    end: Date;
    antardashas: Array<{ planet: string; start: Date; end: Date }>;
  }>;
  marsSignIndex: number;
  jupiterSignIndex: number;
  saturnSignIndex: number;
  venusSignIndex: number;
  rahuSignIndex: number;
  ketuSignIndex: number;
  mercurySignIndex: number;
  lagnaLord: string;
  rashiLord: string;
}

// ============================================================
// STATIC LOOKUP MAPS
// ============================================================

const ZODIAC_SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];

const SIGN_LORDS: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter"
};

const BENEFIC_PLANETS = new Set(["Jupiter","Venus","Moon","Mercury"]);
const MALEFIC_PLANETS = new Set(["Saturn","Mars","Rahu","Ketu","Sun"]);

// Planet-based dasha rating modifiers (base 3; benefic +1, strong malefic -1)
const PLANET_DASHA_RATING: Record<string, number> = {
  Jupiter: 5, Venus: 4, Moon: 3, Mercury: 4, Sun: 3,
  Mars: 2, Saturn: 2, Rahu: 2, Ketu: 2
};

const SIGN_ELEMENT: Record<string, string> = {
  Aries:"Fire",Taurus:"Earth",Gemini:"Air",Cancer:"Water",
  Leo:"Fire",Virgo:"Earth",Libra:"Air",Scorpio:"Water",
  Sagittarius:"Fire",Capricorn:"Earth",Aquarius:"Air",Pisces:"Water"
};

const SIGN_KEYWORDS: Record<string, string[]> = {
  Aries:["courage","leadership","initiative","ambition","competition"],
  Taurus:["stability","wealth","beauty","sensuality","perseverance"],
  Gemini:["intellect","communication","versatility","curiosity","commerce"],
  Cancer:["nurturing","intuition","home","emotion","memory"],
  Leo:["authority","creativity","fame","charisma","dignity"],
  Virgo:["analysis","service","health","precision","craft"],
  Libra:["diplomacy","partnership","justice","aesthetics","balance"],
  Scorpio:["transformation","research","occult","depth","resourcefulness"],
  Sagittarius:["philosophy","travel","teaching","dharma","expansion"],
  Capricorn:["discipline","administration","structure","ambition","legacy"],
  Aquarius:["innovation","technology","networks","humanitarianism","reform"],
  Pisces:["spirituality","compassion","creativity","intuition","liberation"]
};

const SIGN_BODY_PARTS: Record<string, string[]> = {
  Aries:["head","brain","forehead","eyes","blood pressure"],
  Taurus:["throat","neck","thyroid","vocal cords","jaw"],
  Gemini:["lungs","shoulders","arms","nervous system","hands"],
  Cancer:["chest","stomach","breasts","uterus","lymphatic system"],
  Leo:["heart","spine","upper back","vitality","circulation"],
  Virgo:["digestive system","intestines","liver","spleen","pancreas"],
  Libra:["kidneys","lower back","lumbar","skin","adrenal glands"],
  Scorpio:["reproductive organs","bladder","colon","genitals","prostate"],
  Sagittarius:["hips","thighs","sciatic nerve","liver","arteries"],
  Capricorn:["knees","bones","joints","teeth","skin"],
  Aquarius:["ankles","calves","shins","nervous system","circulation"],
  Pisces:["feet","lymph","immune system","pineal gland","sleep"]
};

const PLANET_KEYWORDS: Record<string, string[]> = {
  Sun:["government","administration","politics","leadership","medicine"],
  Moon:["hospitality","nursing","agriculture","travel","food industry"],
  Mars:["engineering","military","surgery","construction","sports"],
  Mercury:["accounting","writing","IT","teaching","trade"],
  Jupiter:["law","finance","counseling","academia","spirituality"],
  Venus:["art","fashion","entertainment","luxury","hospitality"],
  Saturn:["mining","real estate","labor","oil","agriculture"],
  Rahu:["technology","foreign trade","research","aviation","media"],
  Ketu:["medicine","occult","spirituality","programming","research"]
};

const NAKSHATRA_DEITY: Record<string, string> = {
  Ashwini:"Ashwini Kumaras",Bharani:"Yama",Krittika:"Agni",Rohini:"Brahma",
  Mrigashira:"Soma",Ardra:"Rudra",Punarvasu:"Aditi",Pushya:"Brihaspati",
  Ashlesha:"Sarpa",Magha:"Pitrs",PurvaPhalguni:"Bhaga",UttaraPhalguni:"Aryaman",
  Hasta:"Savitar",Chitra:"Tvashtr",Swati:"Vayu",Vishakha:"Indra-Agni",
  Anuradha:"Mitra",Jyeshtha:"Indra",Moola:"Nirrti",PurvaAshadha:"Apas",
  UttaraAshadha:"Vishwadevas",Shravana:"Vishnu",Dhanishtha:"Ashta Vasus",
  Shatabhisha:"Varuna",PurvaBhadrapada:"Aja Ekapada",UttaraBhadrapada:"Ahirbudhnya",
  Revati:"Pushan"
};

const NAKSHATRA_LORD: Record<string, string> = {
  Ashwini:"Ketu",Bharani:"Venus",Krittika:"Sun",Rohini:"Moon",
  Mrigashira:"Mars",Ardra:"Rahu",Punarvasu:"Jupiter",Pushya:"Saturn",
  Ashlesha:"Mercury",Magha:"Ketu",PurvaPhalguni:"Venus",UttaraPhalguni:"Sun",
  Hasta:"Moon",Chitra:"Mars",Swati:"Rahu",Vishakha:"Jupiter",
  Anuradha:"Saturn",Jyeshtha:"Mercury",Moola:"Ketu",PurvaAshadha:"Venus",
  UttaraAshadha:"Sun",Shravana:"Moon",Dhanishtha:"Mars",Shatabhisha:"Rahu",
  PurvaBhadrapada:"Jupiter",UttaraBhadrapada:"Saturn",Revati:"Mercury"
};

const MAHA_ANTAR_THEME: Record<string, Record<string, string>> = {
  Jupiter: {
    Jupiter: "Jupiter–Jupiter Dasha is among the most auspicious combinations in Vedic Jyotish. The Dev Guru activates his own significations of wisdom, dharma, expansion, and prosperity. This period marks a philosophical renaissance in your life, where religious inclinations deepen and material comforts naturally accrue. Opportunities for knowledge, travel to sacred places, and mentoring others arise frequently. Children, marriage, and creative projects find strong support under this benevolent umbrella.",
    Venus:   "The Jupiter–Venus period blends the blessings of two great benefics and is considered one of the finest combinations for luxury, love, and achievement. Artistic endeavors flourish, relationships blossom, and financial gains come from creative industries or partnerships. Social standing rises considerably, and you attract influential, aesthetically refined persons into your circle. Marriage, if pending, finds a strong yog during this sub-period.",
    Sun:     "Jupiter–Sun activates themes of authority, recognition, and dharmic responsibility. You find yourself in positions of influence—governmental approvals, institutional recognition, or leadership roles become available. Your father or father-figures play a significant part in this period. Health of the heart and eyes requires attention, though the Sun's vitality generally keeps overall constitution strong.",
    Moon:    "Jupiter–Moon is a period of emotional abundance and intuitive growth. The mind expands toward spiritual philosophy, and relationships with mother and women in general become nurturing and productive. Travel over water, hospitality ventures, and real estate opportunities are highlighted. Emotional sensitivity is high—channeling this into creative and devotional work yields the greatest rewards.",
    Mars:    "Jupiter–Mars combines the wisdom of the Guru with the drive of Mangal, creating periods of ambitious, purposeful action. Engineering projects, legal battles, and competitive endeavors find favorable outcomes. Courage and confidence peak, though care must be taken to avoid impulsive decisions. Property-related gains and younger siblings' support are notable themes.",
    Rahu:    "Jupiter–Rahu creates an unusual but potent combination. Rahu amplifies Jupiter's expansive energy into unconventional channels—foreign travel, technology, media, or occult research may suddenly become prominent. There is a risk of over-expansion or involvement with deceptive persons, so discernment is essential. Materially, opportunities come from unexpected or foreign sources.",
    Saturn:  "Jupiter–Saturn is a karmic combination where past righteous deeds now yield structured rewards. Progress is gradual but solid—foundations are laid for long-term success. Legal matters, land documentation, and institutional appointments may be resolved. Discipline in spiritual practice and diet yields powerful results during this phase.",
    Mercury: "Jupiter–Mercury activates the intellect powerfully—writing, teaching, commerce, and skilled trade flourish. Communications are auspicious, and contracts signed during this time tend to be favorable. Academic pursuits, publications, and financial negotiations benefit from this combination's clarity and analytical depth.",
    Ketu:    "Jupiter–Ketu is a period of spiritual purification and unexpected liberation from past patterns. Interests in moksha, meditation, occult sciences, and past-life healing arise strongly. Material life may feel temporarily uncertain, but inner growth is profound. Pilgrimages and renunciation practices are particularly rewarding."
  },
  Venus: {
    Jupiter: "Venus–Jupiter is the combination of Lakshmi and Guru—a time of opulent blessings, marital harmony, and spiritual wealth simultaneously. Relationships, arts, finance, and family all receive a celestial boost. This is one of the most favorable sub-periods for marriage, childbirth, and creative achievement. Social life expands, and doors of opportunity open in cultured, refined environments.",
    Venus:   "Venus–Venus marks a period of maximum Shukra energy—beauty, love, music, luxuries, and pleasures are at their peak. Romantic relationships intensify; existing partnerships blossom with renewed warmth. Creative industries, fashion, entertainment, and hospitality bring financial rewards. Guard against over-indulgence, as the saturation of Venus energy can also lead to excess.",
    Sun:     "Venus–Sun may create mild friction between pleasure-seeking Venus and ego-asserting Sun, but this is also a period where artistic leadership and public recognition for creative work come together. Romance with authority figures may arise. Government-related creative projects or entertainment industry connections with officials are notable.",
    Moon:    "Venus–Moon creates a deeply sensitive, aesthetic, and emotionally rich period. Relationships with women, creative collaborations, and domestic harmony are highlighted. Travel, especially to beautiful or coastal destinations, is indicated. Real estate investments in beautiful locations and interior design or hospitality ventures find favor.",
    Mars:    "Venus–Mars combines passion and action, making this a period of dynamic relationships and creative drive. Business partnerships formed now carry both ambition and charisma. However, conflicts in romance and impulsive financial decisions require careful management. Athletic, performance, or real estate ventures driven by boldness can succeed well.",
    Rahu:    "Venus–Rahu brings unconventional romantic encounters, foreign partnerships, and unorthodox creative expressions. This period may bring intense but unusual relationships that challenge social conventions. Gains from foreign connections, media, or technology-adjacent creative industries are possible. Maintain spiritual grounding to navigate Rahu's illusory tendencies.",
    Saturn:  "Venus–Saturn is a period of serious, committed relationships and disciplined artistic work. Long-term partnerships—both romantic and professional—are consolidated. This combination also supports work in architecture, landscape design, antiques, or the construction of beautiful long-lasting things. Patience yields rich rewards.",
    Mercury: "Venus–Mercury harmonizes beautifully—communication in relationships becomes eloquent and persuasive. Careers in publishing, media, fashion writing, or design consulting are highlighted. Financial negotiations and contracts in creative fields yield favorable outcomes. This period supports learning performing arts, music theory, and languages.",
    Ketu:    "Venus–Ketu creates a period of releasing attachment in relationships and turning toward spiritual beauty rather than material pleasures. Creative work takes on a transcendent, meditative quality. Pilgrimages to beautiful temples or sacred rivers are especially rewarding. Past romantic karma is resolved, making way for purer connections."
  },
  Sun: {
    Jupiter: "Sun–Jupiter is a highly auspicious combination for authority, wisdom, and public recognition. Government service, academic appointments, temple trusteeship, or leadership in a righteous institution are all favored. The father or paternal lineage plays a beneficial role. This is a period of dharmic expansion—your reputation grows through righteous, principled action.",
    Venus:   "Sun–Venus activates the intersection of authority and aesthetics. This period often brings recognition in creative or entertainment fields, government contracts for artistic work, or romantic connections with prominent individuals. Luxury expenditure rises, and there is a strong pull toward comfortable, beautiful living environments.",
    Sun:     "Sun–Sun is the peak of solar energy—authority, health, willpower, and personal identity are all heightened. Government recognition, promotions in public service, and leadership opportunities are at their maximum. The father's situation significantly impacts life. Spiritual practices associated with the Sun—Surya namaskar, Gayatri mantra—yield powerful results.",
    Moon:    "Sun–Moon creates some inner tension between the ego and the emotional mind. Public life and private life may occasionally conflict. However, this period also brings nurturing authorities into your path—government schemes, maternal government support, or female leadership mentors. Travel for official purposes is common.",
    Mars:    "Sun–Mars is a period of fierce ambition and executive drive. Competitive success, military or police promotions, real estate transactions, and engineering achievements are hallmarks of this period. Conflicts with authority figures must be navigated carefully. Blood pressure and inflammatory conditions require attention.",
    Rahu:    "Sun–Rahu creates sudden shifts in status, identity, and public perception. Foreign government connections, unconventional career paths, and surprising recognition from unexpected quarters are possible. Political intrigue and identity confusion are risks—maintaining integrity and dharmic conduct is paramount.",
    Saturn:  "Sun–Saturn is one of the more challenging sub-periods, marking a time of slowed recognition, bureaucratic obstacles, and lessons in humility. However, this period builds extraordinary resilience and karmic debt repayment. Sustained effort eventually cracks open doors that seemed permanently closed.",
    Mercury: "Sun–Mercury combines intellect and authority for excellent results in administrative communication, legal documentation, and scholarly work. Speeches, publications, or policy drafting gain recognition. Commerce in government-affiliated sectors or education thrives.",
    Ketu:    "Sun–Ketu is a period of inner search and withdrawal from ego-driven pursuits. Spiritual seekers flourish here, while those attached to worldly recognition may feel confused. Father's health may need attention. Renunciation of pride and ego-attachment yields profound spiritual growth."
  },
  Moon: {
    Jupiter: "Moon–Jupiter is deeply nourishing—mind, emotions, and wisdom harmonize perfectly. This period brings domestic happiness, auspicious events in the home, and strong relationships with mother and guru. Financially, gains from agriculture, hospitality, real estate, or educational institutions are favored. Pilgrimages to sacred rivers or mountains bring lasting transformation.",
    Venus:   "Moon–Venus creates an emotionally rich, aesthetically sensitive period. Romantic relationships deepen with genuine affection, and home environments are beautified. Artistic and musical talents flourish. Travel to beautiful natural environments and engagement with creative communities brings joy and material rewards.",
    Sun:     "Moon–Sun creates alternating clarity and emotional cloudiness. Authority and emotion may occasionally conflict. Government-related activities connected to public welfare are favored. The mother's health and wellbeing require attention. Spiritual practices like full-moon meditation bring powerful clarity.",
    Moon:    "Moon–Moon is the peak of lunar energy—intuition, emotion, and imagination are heightened. This period strongly impacts relationships with women, the mother, and the home. Real estate opportunities, hospitality ventures, and water-related travel are especially favorable. The mind is fertile for creative, artistic, and spiritual expression.",
    Mars:    "Moon–Mars can bring emotional volatility alongside fierce protectiveness toward family. Property disputes or home renovation may be undertaken. The relationship with the mother or siblings may be tested. Physical energy is high—channeling it into fitness, sports, or home improvement yields constructive results.",
    Rahu:    "Moon–Rahu creates mental restlessness, unusual emotional experiences, and encounters with foreign or non-traditional influences. Dreams are vivid and sometimes prophetic. This period may bring unexpected changes in the home environment or mother's situation. Grounding practices—earthing, mantra japa—are strongly recommended.",
    Saturn:  "Moon–Saturn may create periods of emotional restriction, loneliness, or heavy responsibilities in the home. Progress in life feels slow and deliberate. However, this combination teaches profound emotional maturity and builds lasting domestic structures. Serving the elderly and underprivileged during this time generates powerful karmic merit.",
    Mercury: "Moon–Mercury enhances communication, writing, and teaching abilities with an emotional intelligence advantage. Trading, journalism, counseling, and education careers flourish. Travel for business or intellectual purposes is indicated. Relationships with siblings bring both joy and information.",
    Ketu:    "Moon–Ketu is intensely spiritual and introspective. The mind turns inward, sometimes creating detachment from daily material concerns. Meditation, mantra practice, and pilgrimage are powerfully rewarding. Past-life emotional patterns surface for healing and release."
  },
  Mars: {
    Jupiter: "Mars–Jupiter combines the courage of Mangal with the wisdom of Guru—making this a period of disciplined, righteous action. Legal victories, property gains, and competitive achievements are highlighted. This is an excellent time to begin bold, dharmic endeavors. Brothers and mentors provide crucial support during this period.",
    Venus:   "Mars–Venus creates passionate relationships and dynamic creative energy. Romance is intense and energetic. Artistic projects with competitive or bold themes succeed. Real estate renovations, interior design ventures, and performing arts gain recognition. Financial gains from partnerships or creative collaborations are favored.",
    Sun:     "Mars–Sun is a period of intense ambition and drive—government competitions, military promotions, or entrepreneurial launches are energetically supported. The danger lies in conflicts with authority or impulsive decisions. Physical vitality peaks—direct this energy into disciplined athletic or professional pursuits.",
    Moon:    "Mars–Moon may create emotional instability or conflicts in the home environment. Protecting mother's health and managing property disputes requires attention. However, this combination also gives tremendous energy for real estate work, construction, or agricultural ventures. Yogic practices channel this fierce energy productively.",
    Mars:    "Mars–Mars is the peak of Mangal energy—competitive drives, physical courage, and executive action are at their maximum. Legal battles, property acquisitions, and competitive victories come naturally. Care must be taken with accidents, blood pressure, and conflicts. Channel this energy through disciplined martial arts, fitness, or structured entrepreneurship.",
    Rahu:    "Mars–Rahu is one of the more intense combinations—sudden conflicts, unexpected accidents, or explosive professional changes may occur. Foreign competitive endeavors and technology-driven ventures carry both risk and reward. Angarak yoga cautions against rash decisions; meditation and mantra practice are strongly advised.",
    Saturn:  "Mars–Saturn creates friction between drive and restriction—projects begun with energy may face delays and obstacles. This period demands patience and systematic effort. Long-term construction, real estate development, or legal matters require sustained attention. Discipline and service to the downtrodden generate karmic support.",
    Mercury: "Mars–Mercury sharpens the mind for debate, negotiation, and strategic communication. Legal documentation, competitive exams, and commercial negotiations favor bold, articulate action. Technical writing, engineering communication, or sports management are particularly highlighted.",
    Ketu:    "Mars–Ketu is a period of intense spiritual assertion—the warrior energy is directed inward toward self-mastery. Occult studies, martial arts with a meditative dimension, and past-life healing work are powerful. Property or sibling-related karma from past lives surfaces for resolution."
  },
  Rahu: {
    Jupiter: "Rahu–Jupiter (Guru–Chandala yoga period) brings unconventional wisdom and foreign guru connections. Education may come from non-traditional sources—online learning, foreign universities, or self-study. Speculative gains and sudden windfalls are possible, though discernment in financial decisions is critical. This period may bring a significant philosophical shift in worldview.",
    Venus:   "Rahu–Venus activates intense, unconventional desires and foreign romantic connections. Entertainment industry opportunities, technology-adjacent creative work, and international partnerships carry great promise. Luxury expenditures may spike; conscious financial management is essential. Relationships formed during this period are often karmic and life-changing.",
    Sun:     "Rahu–Sun creates sudden changes in authority, reputation, and public identity. Career disruptions may occur unexpectedly—these are often necessary course corrections. Foreign government connections or non-traditional leadership roles may emerge. Maintaining dharmic integrity amidst confusion is the key lesson.",
    Moon:    "Rahu–Moon heightens intuition to the point of psychic sensitivity, but also creates mental restlessness and emotional confusion. Vivid dreams, spiritual experiences, and encounters with mysterious individuals mark this period. Grounding practices and mental hygiene are essential. Travel to foreign lands for emotional healing is supported.",
    Mars:    "Rahu–Mars is intense and volatile—sudden conflicts, accidents, or explosive career changes are possible. Foreign competitive ventures and technology-driven high-stakes projects carry both extreme risk and reward. Structured martial training or competitive sports provide healthy channels for this volcanic energy combination.",
    Rahu:    "Rahu–Rahu is the peak of Rahu's shadowy energy—ambitions become consuming, illusions are strongest, and karma from past lives delivers its most dramatic lessons. Foreign opportunities, technology ventures, and unconventional career paths peak. Maintaining ethical boundaries and spiritual practice is absolutely essential during this period.",
    Saturn:  "Rahu–Saturn is a karmic combination of profound weight—past karmas, especially related to injustice or neglect of duties, manifest as restrictions and delays. Patience and systematic karmic debt repayment through service and discipline are the only productive responses. Long-term plans made during this period with integrity eventually succeed remarkably.",
    Mercury: "Rahu–Mercury is excellent for technology, communication, research, and unconventional intellectual pursuits. Digital businesses, media ventures, and foreign trade via communication-heavy industries flourish. Information may not always be what it appears—fact-checking and legal vetting of communications are important.",
    Ketu:    "Rahu–Ketu (Nodal axis activated) brings profound spiritual experiences, sudden detachment from material goals, and mysterious occurrences. Past-life memories and skills may spontaneously surface. This period requires surrender rather than forceful action—spiritual practice yields extraordinary inner transformation."
  },
  Saturn: {
    Jupiter: "Saturn–Jupiter is a period of structured dharmic growth—the Guru's wisdom channels through Saturn's discipline, creating solid, long-lasting achievements. Legal matters, land acquisition, institutional appointments, and scholarly recognition are all favored. Karma from past righteous actions begins to yield tangible rewards. Spiritual practices combined with hard work generate profound results.",
    Venus:   "Saturn–Venus brings a serious, committed tone to relationships and creative pursuits. Long-term romantic partnerships, including arranged marriages, are consolidated during this period. Architecture, landscape design, heritage conservation, and classic art forms flourish. Financial discipline applied to creative ventures yields sustainable income.",
    Sun:     "Saturn–Sun creates friction between discipline and authority. Recognition comes slowly, bureaucratic hurdles appear in professional life, and relationship with the father or government may be strained. However, sustained righteous effort eventually wins through—this period builds the deepest, most unshakeable professional credibility.",
    Moon:    "Saturn–Moon is emotionally heavy—feelings of isolation, responsibility overload, or estrangement from home may arise. Mother's health requires careful attention. However, this combination also generates profound emotional wisdom and deep empathy. Service to the elderly, ill, and marginalized generates powerful karmic merit.",
    Mars:    "Saturn–Mars creates friction between patience and action—frustration with slow progress is common. Long-term construction projects, legal disputes over property, and competitive endeavors requiring sustained stamina are the hallmarks. Avoid impulsive decisions and instead invest energy in disciplined, systematic efforts.",
    Rahu:    "Saturn–Rahu is among the more challenging sub-periods—karmic debts from both Saturn (past duties neglected) and Rahu (illusions indulged) manifest simultaneously. Sudden disruptions in career or social status may occur. Strict ethical conduct, service to the marginalized, and consistent spiritual discipline are the antidotes.",
    Saturn:  "Saturn–Saturn is the peak of Shani's energy—karmic reckoning is most intense here. Old karmas manifest as obstacles, delays, and restrictions. Hard work, humility, and dharmic service are the only genuine paths forward. Those who embrace Saturn's lessons emerge with extraordinary discipline, wisdom, and resilience.",
    Mercury: "Saturn–Mercury is excellent for systematic intellectual work—legal documentation, accounting, research, and engineering communication flourish. Long-term educational projects, writing comprehensive manuscripts, and building technology systems with disciplined effort all succeed. Communication must be precise; errors in detail may have lasting consequences.",
    Ketu:    "Saturn–Ketu is a period of profound karmic release—both planets signify past lives and spiritual liberation. Renunciation of material attachments comes naturally. Spiritual retreats, rigorous meditation practice, and service to the underprivileged generate extraordinary merit. Material life may feel temporarily constrained but spiritual progress is significant."
  },
  Mercury: {
    Jupiter: "Mercury–Jupiter combines the intellect of Budha with the wisdom of Guru, creating an extraordinary period for scholarship, teaching, publishing, and financial wisdom. Academic achievements, book publications, and legal victories are well-supported. Travel for educational or spiritual purposes brings lasting benefits. Business ventures combining knowledge and commerce succeed particularly well.",
    Venus:   "Mercury–Venus harmonizes beautifully for arts, communication, and creative commerce. Writing about beauty, music theory, fashion journalism, design consulting, and creative marketing all thrive. Romantic communications are eloquent and charming. Financial gains from creative or communication-oriented partnerships are highlighted.",
    Sun:     "Mercury–Sun amplifies intellectual authority—administrative communication, policy-drafting, legal argument, and scholarly recognition all peak. Speeches and presentations gain powerful reception. Government-related intellectual work, educational institution appointments, and media recognition through expertise are favored.",
    Moon:    "Mercury–Moon creates an emotionally intelligent communication style. Counseling, teaching with empathy, writing about domestic and cultural themes, and real estate-adjacent commerce are all highlighted. Travel for business involving women's markets, food industry, or hospitality is supported. Relationships with siblings and neighbors bring both joy and information.",
    Mars:    "Mercury–Mars sharpens the mind for debate, technical problem-solving, and strategic competitive action. Engineering writing, sports commentary, legal argumentation, and competitive exam performance are heightened. The tongue is sharp—use this power for righteous advocacy rather than conflict-creation.",
    Rahu:    "Mercury–Rahu is excellent for technology, digital business, unconventional research, and media ventures. Foreign communication-based work and technology entrepreneurship carry strong momentum. Maintain strict fact-checking standards—Rahu's illusory influence may create miscommunications with lasting consequences.",
    Saturn:  "Mercury–Saturn is excellent for detailed, systematic, long-term intellectual work—legal research, accounting, engineering documentation, and comprehensive academic study all benefit. Patience with slow-moving communications and bureaucratic processes is essential. Quality of thought and precision of expression are rewarded over time.",
    Mercury: "Mercury–Mercury is the peak of Budha energy—intellectual clarity, communicative brilliance, and commercial acumen are at their maximum. Writing, teaching, trading, and technology work flourish simultaneously. Multiple projects may run in parallel—discipline in prioritization prevents scattering of energy.",
    Ketu:    "Mercury–Ketu creates an unusual, spiritually colored intellectual period. Research into metaphysics, ancient languages, past-life regression techniques, and occult mathematics may arise spontaneously. Communication becomes more intuitive than analytical. Programming, coding, or algorithmic work may carry a mysterious fluency."
  },
  Ketu: {
    Jupiter: "Ketu–Jupiter is a period of spiritually colored wisdom—the desire for moksha is strong, and philosophical studies, Vedic scriptures, and meditation practices gain deep appeal. Detachment from material accumulation occurs naturally. Pilgrimages to ancient temples, interactions with genuine saints, and study of Jyotish or Ayurveda are powerfully transformative.",
    Venus:   "Ketu–Venus brings a period of releasing attachment in relationships and turning toward transcendent beauty rather than material luxury. Creative work takes on a spiritual, otherworldly quality. Past romantic karma is being resolved. Pilgrimages to aesthetically beautiful sacred sites and devotional music or art practices are particularly rewarding.",
    Sun:     "Ketu–Sun is a period of dissolving ego-identification with authority and status. Inner sovereignty replaces external recognition as the primary goal. Father's situation may present karmic lessons. Spiritual practices that honor the Sun—Gayatri mantra, Surya namaskar—bring clarity and inner strength.",
    Moon:    "Ketu–Moon creates profound introspection and spiritual sensitivity. The mind turns inward; ordinary material pursuits may feel temporarily meaningless. Dreams and intuitions carry powerful guidance. This period is extraordinarily favorable for meditation, past-life healing, and emotional karmic release.",
    Mars:    "Ketu–Mars channels warrior energy toward inner battles—the battle against ego, past-life karma, and self-sabotage. Martial arts with a meditative dimension, fire rituals, and rigorous spiritual austerities are powerful. Property or sibling-related karma from previous lives may surface unexpectedly for final resolution.",
    Rahu:    "Ketu–Rahu (Nodal reversal energy) brings sudden detachment from material goals alongside lingering worldly desires. This internal contradiction creates profound spiritual pressure. Surrender to divine will, rather than effortful grasping, is the only productive posture. Mystical experiences and sudden spiritual awakenings are possible.",
    Saturn:  "Ketu–Saturn is a period of profound karmic release through disciplined renunciation and service. Both planets point toward moksha—attachments to status, possessions, and social roles are systematically dissolved. Service to the elderly, disabled, and marginalized generates extraordinary karmic merit.",
    Mercury: "Ketu–Mercury brings unusual intellectual interests—ancient languages, metaphysical mathematics, occult logic, and spiritual writing find a surprising home in the mind. Research into past-life skills may reveal hidden talents. Communication becomes more intuitive and less conventionally logical.",
    Ketu:    "Ketu–Ketu is the peak of Ketu's energy—maximum spiritual intensity, detachment, and karmic reckoning. The soul is strongly drawn toward liberation. Material life may feel like a distant dream. This is the most powerful period for intense meditation retreat, Vedic study, and complete surrender to divine guidance."
  }
};

const SIGN_DIRECTION: Record<string, string[]> = {
  Aries:["East","North"],
  Taurus:["South","Southeast"],
  Gemini:["West","Northwest"],
  Cancer:["North","Northeast"],
  Leo:["East","Southeast"],
  Virgo:["South","Southwest"],
  Libra:["West","Northwest"],
  Scorpio:["North","Northeast"],
  Sagittarius:["East","Northeast"],
  Capricorn:["South","Southwest"],
  Aquarius:["West","Northwest"],
  Pisces:["North","Northeast"]
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const JUPITER_SIGN_MONTHS: Record<number, string[]> = {
  0: ["April","May","June"],
  1: ["May","June","July"],
  2: ["June","July","August"],
  3: ["July","August","September"],
  4: ["August","September","October"],
  5: ["September","October","November"],
  6: ["October","November","December"],
  7: ["November","December","January"],
  8: ["December","January","February"],
  9: ["January","February","March"],
  10: ["February","March","April"],
  11: ["March","April","May"]
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function houseFromLagna(signIndex: number, lagnaIndex: number): number {
  return ((signIndex - lagnaIndex + 12) % 12) + 1;
}

function lordOfHouse(houseNumber: number, lagnaIndex: number): string {
  const signIndex = (lagnaIndex + houseNumber - 1) % 12;
  return SIGN_LORDS[ZODIAC_SIGNS[signIndex]];
}

function signOfHouse(houseNumber: number, lagnaIndex: number): string {
  const signIndex = (lagnaIndex + houseNumber - 1) % 12;
  return ZODIAC_SIGNS[signIndex];
}

function isBenefic(planet: string): boolean {
  return BENEFIC_PLANETS.has(planet);
}

function getMahaAndAntarForYear(
  mahadashas: YearlyForecastInputs["mahadashas"],
  year: number
): { maha: string; antar: string } {
  const jan1 = new Date(year, 0, 1);

  let activeMaha = mahadashas[0];
  for (const maha of mahadashas) {
    if (new Date(maha.start) <= jan1 && jan1 <= new Date(maha.end)) {
      activeMaha = maha;
      break;
    }
    if (new Date(maha.start) > jan1) break;
    activeMaha = maha;
  }

  let activeAntar = activeMaha.antardashas[0] ?? { planet: activeMaha.planet };
  for (const antar of activeMaha.antardashas) {
    if (new Date(antar.start) <= jan1 && jan1 <= new Date(antar.end)) {
      activeAntar = antar;
      break;
    }
    if (new Date(antar.start) > jan1) break;
    activeAntar = antar;
  }

  return { maha: activeMaha.planet, antar: activeAntar.planet };
}

function calcOverallRating(maha: string, antar: string): number {
  const mahaRating = PLANET_DASHA_RATING[maha] ?? 3;
  const antarRating = PLANET_DASHA_RATING[antar] ?? 3;
  const avg = (mahaRating + antarRating) / 2;
  return Math.min(5, Math.max(1, Math.round(avg)));
}

function getBestMonths(jupiterSignIndex: number, antar: string): string[] {
  const baseMonths = JUPITER_SIGN_MONTHS[jupiterSignIndex] ?? ["April","May","June"];
  if (isBenefic(antar)) {
    const extra = MONTHS.find(m => !baseMonths.includes(m) && m !== "December") ?? "October";
    return [...new Set([...baseMonths, extra])].slice(0, 3);
  }
  return baseMonths.slice(0, 3);
}

function getCautionMonths(saturnSignIndex: number, marsSignIndex: number): string[] {
  // Saturn and Mars transits create caution
  const satMonths = JUPITER_SIGN_MONTHS[saturnSignIndex] ?? ["January","February"];
  const marsMonths = JUPITER_SIGN_MONTHS[marsSignIndex] ?? ["October","November"];
  const caution: string[] = [];
  for (const m of [...satMonths, ...marsMonths]) {
    if (!caution.includes(m)) caution.push(m);
    if (caution.length === 2) break;
  }
  return caution;
}

function getConstitutionType(lagnaSign: string): string {
  const pittas = ["Aries","Leo","Sagittarius"];
  const vatas = ["Gemini","Libra","Aquarius"];
  const kaphaPittas = ["Cancer","Scorpio","Pisces"];
  if (pittas.includes(lagnaSign)) return "Pitta";
  if (vatas.includes(lagnaSign)) return "Vata";
  if (kaphaPittas.includes(lagnaSign)) return "Kapha-Pitta";
  return "Vata-Kapha"; // Earth signs: Taurus, Virgo, Capricorn
}

// ============================================================
// GENERATE FIVE YEAR FORECAST
// ============================================================

export function generateFiveYearForecast(inputs: YearlyForecastInputs): YearForecast[] {
  const {
    lagnaSign, lagnaIndex, moonSign, moonSignIndex, sunSign,
    nakshatra, nakshatraLord, mahadashas,
    marsSignIndex, jupiterSignIndex, saturnSignIndex, venusSignIndex,
    rahuSignIndex, ketuSignIndex, mercurySignIndex,
    lagnaLord, rashiLord
  } = inputs;

  const currentYear = new Date().getFullYear();
  const forecasts: YearForecast[] = [];

  const tenthLord = lordOfHouse(10, lagnaIndex);
  const tenthSign = signOfHouse(10, lagnaIndex);
  const secondLord = lordOfHouse(2, lagnaIndex);
  const eleventhLord = lordOfHouse(11, lagnaIndex);
  const seventhLord = lordOfHouse(7, lagnaIndex);
  const seventhSign = signOfHouse(7, lagnaIndex);
  const sixthLord = lordOfHouse(6, lagnaIndex);
  const fourthLord = lordOfHouse(4, lagnaIndex);
  const fourthSign = signOfHouse(4, lagnaIndex);
  const ninthLord = lordOfHouse(9, lagnaIndex);
  const twelfthLord = lordOfHouse(12, lagnaIndex);
  const fifthLord = lordOfHouse(5, lagnaIndex);

  const constitution = getConstitutionType(lagnaSign);
  const lagnaKeywords = SIGN_KEYWORDS[lagnaSign] ?? [];
  const moonKeywords = SIGN_KEYWORDS[moonSign] ?? [];
  const nakshatraDeity = NAKSHATRA_DEITY[nakshatra] ?? "the presiding deity";
  const jupiterSign = ZODIAC_SIGNS[jupiterSignIndex] ?? "Aries";
  const saturnSign = ZODIAC_SIGNS[saturnSignIndex] ?? "Capricorn";
  const marsSign = ZODIAC_SIGNS[marsSignIndex] ?? "Aries";
  const venusSign = ZODIAC_SIGNS[venusSignIndex] ?? "Taurus";

  for (let i = 0; i < 5; i++) {
    const year = currentYear + i;
    const { maha, antar } = getMahaAndAntarForYear(mahadashas, year);

    // 1. Overall Theme
    const mahaThemes = MAHA_ANTAR_THEME[maha] ?? {};
    const rawTheme = mahaThemes[antar] ??
      `The ${maha}–${antar} period brings a blend of these two planets' energies to the fore. ${maha} sets the macro context of your life's direction while ${antar} provides the specific flavor, opportunities, and lessons of this sub-cycle. You are called to integrate the highest qualities of both planets—their wisdom, discipline, and blessings—into your daily choices. The interplay of these forces will shape your professional, relational, and spiritual experiences throughout ${year}. Steady dharmic action, combined with awareness of both planets' natural significations, will yield the finest results.`;
    const overallTheme = `${rawTheme} In ${year}, as a ${lagnaSign} Lagna native with ${moonSign} Rashi and ${nakshatra} Nakshatra, your personal karma aligns distinctly with this ${maha}–${antar} combination, making this year particularly significant for themes of ${lagnaKeywords[0] ?? "growth"} and ${moonKeywords[0] ?? "wellbeing"}.`;

    // 2. Career and Profession
    const tenthKeywords = PLANET_KEYWORDS[tenthLord] ?? ["management","administration"];
    const careerAndProfession = `The 10th house of your chart, governing career and professional destiny, falls in ${tenthSign} and is lorded by ${tenthLord}. In ${year}, the running ${maha} Mahadasha—${isBenefic(maha) ? "a benefic lord" : "a planet requiring disciplined navigation"}—interacts with the ${antar} Antardasha to create specific career opportunities aligned with ${tenthKeywords[0]} and ${tenthKeywords[1] ?? "leadership"} pursuits. ${maha === tenthLord ? `As ${maha} is also your 10th lord, this year holds exceptional professional significance—direct effort toward your primary career ambitions with confidence.` : `While ${maha} activates its own significations in your chart, the 10th lord ${tenthLord}'s inherent strength in ${tenthSign} continues to define your professional identity and reputation.`} Colleagues and superiors notice your efforts more acutely when you operate from the platform of ${lagnaSign}'s natural ${lagnaKeywords[0] ?? "strengths"}, so lead with this quality in all professional interactions. Guard against overcommitment to multiple simultaneous projects—focused professional energy in ${year} yields greater recognition than scattered efforts across many domains.`;

    // 3. Finance and Wealth
    const financeAndWealth = `Financial outcomes in ${year} are shaped by the interplay of your 2nd house lord ${secondLord}, 11th house lord ${eleventhLord}, and the current transit of Jupiter through ${jupiterSign}. ${isBenefic(maha) ? `The benefic ${maha} Mahadasha provides a fundamentally supportive backdrop for financial growth—unexpected gains, recognition of efforts through monetary reward, and improved cash flow are all possible.` : `The ${maha} Mahadasha demands careful financial stewardship this year—avoid speculative ventures and prioritize building savings reserves.`} Jupiter's transit through ${jupiterSign} specifically impacts the ${houseFromLagna(jupiterSignIndex, lagnaIndex)}th house of your chart, ${houseFromLagna(jupiterSignIndex, lagnaIndex) === 2 ? "directly energizing your wealth house and supporting accumulation" : houseFromLagna(jupiterSignIndex, lagnaIndex) === 11 ? "powering your house of gains and income expansion" : houseFromLagna(jupiterSignIndex, lagnaIndex) === 5 ? "supporting speculative gains and investments through the 5th house" : "creating an indirect financial influence that requires conscious activation through righteous effort"}. The ${antar} sub-lord ${isBenefic(antar) ? "adds a genuinely auspicious flavor to financial matters during its active window" : "calls for prudence in financial decisions—avoid large expenditures during its peak influence"}. Your 11th lord ${eleventhLord}'s inherent strength ensures that networking and collaborative income opportunities remain active throughout this year.`;

    // 4. Love and Relationships
    const venusKeywords = SIGN_KEYWORDS[venusSign] ?? ["beauty","affection"];
    const loveAndRelationships = `Venus, the karaka of love and relationships, currently transits ${venusSign}, coloring your romantic experiences with themes of ${venusKeywords[0] ?? "beauty"} and ${venusKeywords[1] ?? "harmony"}. Your 7th house falls in ${seventhSign}, lorded by ${seventhLord}, defining the fundamental character of your partnerships. In ${year}, during the ${maha}–${antar} dasha period, ${maha === "Venus" || antar === "Venus" ? "Venus takes center stage as a dasha lord—romantic life becomes vibrant, and if marriage is pending, this year carries one of the most auspicious windows for forming committed partnerships" : maha === "Saturn" || antar === "Saturn" ? "Saturn's influence on relationships may bring tests of commitment and patience—existing relationships are being refined through challenges, and new romantic connections formed now tend to be serious and long-term in nature" : `the running dasha creates a specific relational environment where ${isBenefic(maha) ? "warmth, mutual understanding, and romantic fulfillment" : "growth through challenges and learning patience in love"} are the dominant themes`}. ${moonSign === "Cancer" || moonSign === "Taurus" || moonSign === "Pisces" ? `Your Moon in ${moonSign} adds natural emotional nurturing capacity to your relationships, creating a partner who deeply values emotional security and consistency.` : `Your Moon in ${moonSign} brings ${moonKeywords[0] ?? "unique emotional intelligence"} to your closest relationships, creating an interesting dynamic with your ${seventhSign} 7th house nature.`} Maintain open communication and devotion to shared values to navigate ${year}'s relational landscape with wisdom and grace.`;

    // 5. Health and Wellbeing
    const lagnaBodyParts = SIGN_BODY_PARTS[lagnaSign] ?? ["general vitality"];
    const moonBodyParts = SIGN_BODY_PARTS[moonSign] ?? [];
    const healthAndWellbeing = `Your ${constitution} constitution—arising from your ${lagnaSign} Ascendant—creates inherent tendencies that require specific attention in ${year}. ${constitution === "Pitta" ? "As a Pitta-dominant constitution, inflammatory conditions, overheating, and excess acidity are your primary constitutional vulnerabilities." : constitution === "Vata" ? "As a Vata-dominant constitution, nervous system irregularities, anxiety, dryness, and inconsistent digestion are the areas requiring greatest attention." : constitution === "Kapha-Pitta" ? "Your Kapha-Pitta constitution makes you susceptible to respiratory congestion, weight fluctuations, and circulatory sluggishness alongside inflammatory tendencies." : "Your Vata-Kapha constitution creates sensitivity to cold environments, respiratory congestion, joint stiffness, and metabolic irregularities that benefit from warm, nourishing routines."} The 6th house of health falls in ${signOfHouse(6, lagnaIndex)} and is lorded by ${sixthLord}—when ${sixthLord} is activated through dasha or transit, health requires more careful management. In ${year}, ${maha === sixthLord || antar === sixthLord ? `both the 6th lord ${sixthLord} is activated through the running dasha—this is a significant period for health vigilance, particularly regarding ${lagnaBodyParts[0] ?? "your primary constitution-related systems"}` : `the running ${maha}–${antar} period creates ${isBenefic(maha) ? "relatively stable health conditions with consistent energy and vitality" : "some constitutional stress that benefits from preventive Ayurvedic care and consistent yoga practice"}`}. Maintaining regularity in sleep, diet according to your ${constitution} constitution, and a consistent morning sadhana will build a powerful health foundation throughout ${year}.`;

    // 6. Family and Home
    const familyAndHome = `The 4th house of your chart—governing home, mother, property, and inner peace—falls in ${fourthSign}, lorded by ${fourthLord}. In ${year}, your domestic environment is influenced by ${maha === fourthLord || antar === fourthLord ? `the activation of your 4th lord ${fourthLord} through the running dasha, bringing significant home-related developments—property purchases, renovation, relocation, or important family milestones are all possible` : `the ${maha}–${antar} dasha combination, which creates a ${isBenefic(maha) ? "harmonious and nurturing home environment where family relationships are supportive and domestic happiness flows naturally" : "period of greater domestic responsibility and occasional family challenges that build long-term bonds through tested loyalty"}`}. Your mother's wellbeing is a significant focus during this period—nurturing this relationship and seeking her blessings brings spiritual merit and emotional grounding. Home-based investments and property improvements undertaken in ${year} tend to yield both emotional satisfaction and long-term financial value, given the overall dasha support.`;

    // 7. Spiritual Growth
    const spiritualGrowth = `Your ${nakshatra} Nakshatra, presided over by ${nakshatraDeity}, carries a specific spiritual frequency that resonates with themes of ${nakshatraLord === "Jupiter" ? "dharma, expansion, and philosophical wisdom" : nakshatraLord === "Saturn" ? "discipline, karma, and renunciation" : nakshatraLord === "Venus" ? "devotion, beauty, and divine love" : nakshatraLord === "Rahu" ? "transformation, liberation from illusion, and karmic acceleration" : nakshatraLord === "Ketu" ? "moksha, detachment, and spiritual liberation" : nakshatraLord === "Mars" ? "courage, tapas, and spiritual warrior consciousness" : nakshatraLord === "Mercury" ? "mantra, sacred knowledge, and intellectual devotion" : nakshatraLord === "Moon" ? "bhakti, devotion, and emotional surrender to the divine" : "solar consciousness, dharmic leadership, and vitality-based spiritual practice"}. In ${year}, the ${maha}–${antar} dasha creates a specific window for spiritual advancement—${isBenefic(maha) ? "this benefic dasha period supports devotional practices, pilgrimage, and deepening of your relationship with your Ishta Devata" : "this more challenging dasha period invites deeper surrender, karma yoga, and service as your primary spiritual path"}. Offering regular prayers to ${nakshatraDeity} and strengthening your connection with your 9th lord ${ninthLord}'s significations through ritual or study will accelerate spiritual evolution in ${year}.`;

    // 8. Best Months
    const bestMonths = getBestMonths(jupiterSignIndex, antar);

    // 9. Caution Months
    const cautionMonths = getCautionMonths(saturnSignIndex, marsSignIndex);

    // 10. Key Planetary Influences
    const keyPlanetaryInfluences = `In ${year}, three planetary forces define the experiential landscape of your life: first, the ${maha} Mahadasha lord continues its macro-level direction of your destiny, activating ${isBenefic(maha) ? "benevolent" : "karmic and testing"} life themes through its natural significations. Second, the ${antar} Antardasha lord provides the specific texture, color, and opportunities of this year's sub-cycle—its periods of peak strength (when it transits its own sign or exaltation) represent windows of accelerated manifestation. Third, transiting Jupiter in ${jupiterSign} aspects the ${houseFromLagna(jupiterSignIndex, lagnaIndex)}th house of your chart from the sky, while Saturn in ${saturnSign} simultaneously activates the ${houseFromLagna(saturnSignIndex, lagnaIndex)}th house—this dual transit influence creates the backdrop against which your dasha experiences play out, either amplifying or moderating the dasha lord's effects based on their inherent relationship in your natal chart.`;

    // 11. Overall Rating
    const overallRating = calcOverallRating(maha, antar);

    // 12. Action Plan
    const actionPlan = `For ${year}, your Jyotishi recommends the following five-fold action plan: (1) ${isBenefic(maha) ? `Actively leverage the benevolent ${maha} Mahadasha by making bold, dharmic moves in your primary life domain—this is not a time for excessive caution` : `Navigate the ${maha} Mahadasha with structured discipline—create clear boundaries, systematic routines, and avoid impulsive decisions that cannot be undone`}. (2) Align major decisions with the ${antar} Antardasha's peak window—when ${antar} transits its own sign or is aspected by benefics, launch new ventures, sign contracts, or initiate important relationships. (3) Strengthen the ${lagnaSign} Lagna's natural ${lagnaKeywords[0] ?? "core quality"}—this is your fundamental life force; developing it through skill, practice, and application creates the foundation that all dasha blessings can build upon. (4) Propitiate the dasha lord ${maha} through its associated mantra, gemstone, and charitable acts—for ${maha}, this specifically means ${maha === "Jupiter" ? "chanting 'Om Brihaspataye Namah', wearing yellow sapphire if suitable, and donating to Brahmin scholars or educational institutions" : maha === "Venus" ? "chanting 'Om Shukraya Namah', wearing diamond or white sapphire if suitable, and donating to young girls or arts organizations" : maha === "Saturn" ? "chanting 'Om Shanaischaraya Namah', wearing blue sapphire after proper consultation, and serving the elderly and disabled" : maha === "Mars" ? "chanting 'Om Mangalaya Namah', wearing red coral if suitable, and donating to military veterans or performing Hanuman puja" : maha === "Rahu" ? "chanting the Rahu beej mantra, donating on Saturdays, and feeding stray dogs or serving at shelters" : maha === "Ketu" ? "chanting 'Om Ketave Namah', performing Ganesha puja, and donating sesame seeds or multi-colored blankets" : maha === "Mercury" ? "chanting 'Om Budhaya Namah', wearing emerald if suitable, and donating green moong dal to students" : maha === "Moon" ? "chanting 'Om Chandraya Namah', wearing pearl if suitable, and offering white flowers to the Moon on Mondays" : "chanting the Surya Gayatri mantra, wearing ruby if suitable, and donating wheat or copper on Sundays"}. (5) Maintain a daily spiritual anchor—fifteen minutes of meditation or mantra japa at the same time each day creates a karmic current that protects and elevates all other life activities throughout ${year}.`;

    forecasts.push({
      year,
      overallTheme,
      careerAndProfession,
      financeAndWealth,
      loveAndRelationships,
      healthAndWellbeing,
      familyAndHome,
      spiritualGrowth,
      bestMonths,
      cautionMonths,
      keyPlanetaryInfluences,
      overallRating,
      actionPlan
    });
  }

  return forecasts;
}

// ============================================================
// GENERATE COMPREHENSIVE LIFE ANALYSIS
// ============================================================

export function generateComprehensiveLifeAnalysis(inputs: YearlyForecastInputs): ComprehensiveLifeAnalysis {
  const {
    lagnaSign, lagnaIndex, moonSign, moonSignIndex, sunSign,
    nakshatra, nakshatraLord,
    currentMaha, currentAntar,
    mahadashas,
    marsSignIndex, jupiterSignIndex, saturnSignIndex, venusSignIndex,
    rahuSignIndex, ketuSignIndex, mercurySignIndex,
    lagnaLord, rashiLord
  } = inputs;

  const jupiterSign = ZODIAC_SIGNS[jupiterSignIndex] ?? "Aries";
  const saturnSign = ZODIAC_SIGNS[saturnSignIndex] ?? "Capricorn";
  const marsSign = ZODIAC_SIGNS[marsSignIndex] ?? "Aries";
  const venusSign = ZODIAC_SIGNS[venusSignIndex] ?? "Taurus";

  const tenthLord = lordOfHouse(10, lagnaIndex);
  const tenthSign = signOfHouse(10, lagnaIndex);
  const secondLord = lordOfHouse(2, lagnaIndex);
  const eleventhLord = lordOfHouse(11, lagnaIndex);
  const seventhLord = lordOfHouse(7, lagnaIndex);
  const seventhSign = signOfHouse(7, lagnaIndex);
  const sixthLord = lordOfHouse(6, lagnaIndex);
  const fourthLord = lordOfHouse(4, lagnaIndex);
  const fourthSign = signOfHouse(4, lagnaIndex);
  const ninthLord = lordOfHouse(9, lagnaIndex);
  const twelfthLord = lordOfHouse(12, lagnaIndex);
  const fifthLord = lordOfHouse(5, lagnaIndex);
  const twelfthSign = signOfHouse(12, lagnaIndex);
  const ninthSign = signOfHouse(9, lagnaIndex);

  const lagnaKeywords = SIGN_KEYWORDS[lagnaSign] ?? [];
  const moonKeywords = SIGN_KEYWORDS[moonSign] ?? [];
  const tenthKeywords = SIGN_KEYWORDS[tenthSign] ?? [];
  const seventhKeywords = SIGN_KEYWORDS[seventhSign] ?? [];
  const constitution = getConstitutionType(lagnaSign);
  const lagnaBodyParts = SIGN_BODY_PARTS[lagnaSign] ?? [];
  const moonBodyParts = SIGN_BODY_PARTS[moonSign] ?? [];

  // CAREER
  const careerPlanetKeywords = PLANET_KEYWORDS[tenthLord] ?? ["management","leadership"];
  const lagnaLordKeywords = PLANET_KEYWORDS[lagnaLord] ?? [];
  const bestSectors: string[] = [
    ...(PLANET_KEYWORDS[tenthLord] ?? []),
    ...(PLANET_KEYWORDS[lagnaLord] ?? []).slice(0, 2)
  ].slice(0, 8);

  const profession = `Your professional destiny is fundamentally shaped by the 10th house of your chart, which falls in ${tenthSign} and is governed by ${tenthLord}. The sign ${tenthSign} brings qualities of ${tenthKeywords[0] ?? "purposeful direction"}, ${tenthKeywords[1] ?? "structured achievement"}, and ${tenthKeywords[2] ?? "professional integrity"} to your career expression—you are naturally drawn toward fields that allow these qualities to shine. ${tenthLord}'s inherent significations point toward careers in ${careerPlanetKeywords[0] ?? "professional services"} and ${careerPlanetKeywords[1] ?? "advisory roles"}, while your ${lagnaSign} Ascendant adds ${lagnaKeywords[0] ?? "personal leadership"} and ${lagnaKeywords[1] ?? "authentic self-expression"} to your professional persona. The ${nakshatra} Nakshatra of your birth further refines this—its specific qualities of precision, depth, and creative application make you most fulfilled when your work demands both intellectual engagement and tangible impact. Roles that combine ${tenthKeywords[0] ?? "expertise"} with genuine service to others represent your highest professional expression, where worldly achievement and dharmic purpose align most completely.`;

  const challenges = `Career obstacles in your chart primarily arise from the complex relationship between your 6th house of challenges—falling in ${signOfHouse(6, lagnaIndex)} and lorded by ${sixthLord}—and your 10th house ambitions. When ${sixthLord} is activated through dasha periods or adverse transits, competition intensifies, workplace conflicts may arise, and professional progress temporarily stalls. Your ${lagnaSign} Ascendant's natural ${lagnaKeywords[0] ?? "strength"} is simultaneously its vulnerability in professional contexts—the very qualities that make you compelling can occasionally create friction with authority structures or colleagues with different working styles. Saturn's current position in ${saturnSign} aspects the ${houseFromLagna(saturnSignIndex, lagnaIndex)}th house of your chart, creating specific pressure in that domain that may occasionally spill over into professional life. The remedy for career challenges lies in consistent effort, dharmic conduct, and propitiation of your 6th lord through appropriate remedies during its dasha periods.`;

  const promotionPeriods = mahadashas
    .filter(m => isBenefic(m.planet) || m.planet === tenthLord || m.planet === lagnaLord)
    .slice(0, 3);
  const promotionPeriod = `The most significant periods for professional advancement, recognition, and promotion in your chart are the dashas of ${promotionPeriods.map(p => `${p.planet} (${new Date(p.start).getFullYear()}–${new Date(p.end).getFullYear()})`).join(", ") || `${tenthLord} and ${lagnaLord} dashas`}. ${tenthLord} Dasha is specifically powerful for career achievement—during this period, your 10th house lord directly activates professional destiny, often bringing promotions, recognition, institutional appointments, or entrepreneurial breakthroughs. ${lagnaLord} Dasha similarly supports the self—its periods tend to bring a renewed sense of professional identity, increased personal power, and visibility in your chosen field. Within each Mahadasha, the Antardashas of Jupiter and your 10th lord ${tenthLord} are particularly powerful three-to-six month windows for making bold career moves, applying for elevated roles, or launching new professional ventures.`;

  const businessPotential = `Your potential for entrepreneurship and self-directed work is assessed through the strength of your 7th house—governing independent business partnerships—in ${seventhSign}, lorded by ${seventhLord}, and the 10th house lord ${tenthLord}'s interaction with these configurations. ${isBenefic(seventhLord) ? `The benefic 7th lord ${seventhLord} in your chart creates a natural aptitude for successful partnerships, collaborative ventures, and client-facing businesses that leverage your ${lagnaSign} strengths.` : `The ${seventhLord} 7th lord in your chart indicates that business partnerships require careful vetting and formal agreements—your greatest entrepreneurial success comes through structured ventures rather than informal collaborations.`} Your ${tenthSign} 10th house and its lord ${tenthLord} suggest that businesses in the domain of ${careerPlanetKeywords[0] ?? "professional services"} or ${careerPlanetKeywords[1] ?? "consulting"} carry the most natural resonance with your soul's entrepreneurial blueprint. During ${tenthLord} or 7th lord Dasha periods, entrepreneurial ventures launched with clear business plans and strong ethical foundations tend to flourish remarkably.`;

  const foreignOpportunities = `International career opportunities in your chart are assessed through the 12th house—falling in ${twelfthSign} and lorded by ${twelfthLord}—and the position of Rahu, which carries the signature of foreign connections and unconventional ambitions. ${houseFromLagna(saturnSignIndex, lagnaIndex) === 9 || houseFromLagna(saturnSignIndex, lagnaIndex) === 12 ? `Saturn's current position creates specific foreign-oriented pressure in your chart, suggesting that international career developments are an active theme in your near-term professional story.` : `The ${twelfthLord} lord of your 12th house indicates that foreign career opportunities open most powerfully during ${twelfthLord} Dasha periods and when Jupiter transits your 9th or 12th house.`} ${twelfthLord === "Jupiter" || twelfthLord === "Venus" ? `Your ${twelfthLord} 12th lord is a natural benefic, suggesting that international opportunities carry genuine blessings rather than simply escapism—foreign lands represent a genuine expansion of your dharmic potential.` : `Your ${twelfthLord} 12th lord indicates that foreign endeavors require careful planning and spiritual preparation—the greatest international successes come from dharmic purpose rather than purely material motivation.`} During Rahu Dasha or ${twelfthLord} Dasha periods, actively cultivating international networks, foreign language skills, and global professional credentials accelerates this karmic opening.`;

  const career: CareerAnalysis = {
    profession,
    bestSectors: bestSectors.length > 0 ? bestSectors : ["management","advisory","education","consulting","finance","administration","public service","research"],
    challenges,
    promotionPeriod,
    businessPotential,
    foreignOpportunities
  };

  // FINANCE
  const secondSign = signOfHouse(2, lagnaIndex);
  const eleventhSign = signOfHouse(11, lagnaIndex);
  const jupHouse = houseFromLagna(jupiterSignIndex, lagnaIndex);
  const wealthPotential = `Your wealth potential in this lifetime is fundamentally governed by the 2nd house of accumulated wealth—falling in ${secondSign} and lorded by ${secondLord}—and the 11th house of income and gains—falling in ${eleventhSign} and lorded by ${eleventhLord}. The great benefic Jupiter, karaka of wealth and expansion, currently transits ${jupiterSign} which falls in your ${jupHouse}th house, ${jupHouse === 2 ? "directly infusing energy into your wealth house and creating a particularly auspicious period for financial accumulation" : jupHouse === 11 ? "powerfully activating your house of gains and income expansion—this transit alone marks the current period as one of the strongest for financial growth in your chart" : jupHouse === 5 ? "blessing your 5th house of investments and speculative gains—calculated risk-taking in stocks, real estate, or business ventures may yield excellent returns" : jupHouse === 9 ? "expanding your dharmic fortune through righteous work—financial gains come from reputation, expertise, and long-term professional relationships" : `creating an indirect wealth influence through the ${jupHouse}th house of your chart that rewards sustained, righteous effort`}. ${secondLord === eleventhLord ? `Remarkably, the same planet ${secondLord} lords both your 2nd and 11th houses—this creates a powerful Dhan Yoga (wealth combination) in your chart, indicating that financial accumulation tends to accelerate naturally during ${secondLord} Dasha periods.` : `The combination of your 2nd lord ${secondLord} and 11th lord ${eleventhLord} in your chart creates specific wealth-building patterns—periods when both these lords are simultaneously well-placed by transit or dasha activation represent peak financial accumulation windows.`} The overall wealth promise of your chart indicates ${isBenefic(lagnaLord) ? "a life of comfortable accumulation that steadily grows through righteous professional effort and wise investment" : "wealth that comes through disciplined effort, strategic planning, and patient accumulation rather than sudden windfalls—but what is built stands remarkably solid"}.`;

  const investmentAdvice = `Your investment strategy should be shaped by ${tenthLord}'s inherent nature and your ${lagnaSign} constitution's relationship with risk. ${tenthLord === "Saturn" || lagnaLord === "Saturn" ? "Saturn-influenced charts excel at long-term, conservative investments—government bonds, blue-chip stocks, agricultural land, real estate, and infrastructural assets are natural wealth vehicles for you." : tenthLord === "Jupiter" || lagnaLord === "Jupiter" ? "Jupiter-influenced charts benefit from investments in education, banking, financial services, legal institutions, and broadly diversified portfolios that grow steadily over time." : tenthLord === "Venus" || lagnaLord === "Venus" ? "Venus-influenced charts should consider investments in real estate, art, luxury goods, hospitality, entertainment, or consumer-facing businesses aligned with beauty and comfort." : tenthLord === "Mercury" || lagnaLord === "Mercury" ? "Mercury-influenced charts excel in trading, technology stocks, intellectual property, media, and diversified short-to-medium-term market positions that leverage rapid information." : tenthLord === "Mars" || lagnaLord === "Mars" ? "Mars-influenced charts are well-suited to real estate investment, construction ventures, mining, engineering companies, and direct business ownership rather than passive financial instruments." : "Your chart's combination suggests a balanced portfolio approach—part conservative long-term holdings, part growth-oriented strategic investments aligned with your professional expertise domain."} Investments made during Jupiter's transit through your 2nd or 11th house yield the most consistent returns, while speculative investments made during Rahu periods should be approached with significant caution and limited capital exposure.`;

  const savingsGuidance = `Building and maintaining a robust savings discipline is supported by the earth-element planets in your chart and the inherent patience of your ${lagnaSign} constitution. ${constitution === "Pitta" ? "As a Pitta-dominant nature, you may naturally gravitate toward bold, action-oriented financial decisions—creating automatic savings mechanisms and pre-committed investment plans ensures that the portion destined for accumulation is protected from impulsive deployment." : constitution === "Vata" ? "As a Vata-dominant nature, financial irregularity is a constitutional tendency—systematic, automatic savings plans and regular consultation with a trusted financial advisor create the structure your financial wellbeing requires." : "Your constitution supports patient wealth building—regular, consistent contributions to savings and retirement accounts, regardless of market conditions or income fluctuations, build extraordinary wealth over your lifetime."} During Saturn's current transit through ${saturnSign} (your ${houseFromLagna(saturnSignIndex, lagnaIndex)}th house), adopting a particularly conservative savings posture—setting aside at minimum 20% of income before any expenditure—creates a powerful financial foundation. Aligning your savings review with Jupiter's annual sign transit creates a natural yearly rhythm for financial evaluation and goal-setting.`;

  const debtWarning = `Your 6th house of debts and obligations falls in ${signOfHouse(6, lagnaIndex)}, lorded by ${sixthLord}. ${MALEFIC_PLANETS.has(sixthLord) ? `The ${sixthLord} 6th lord indicates that debt, once accumulated, tends to compound and become burdensome—maintaining strict avoidance of unnecessary borrowing is essential for your financial health.` : `Your ${sixthLord} 6th lord is relatively manageable in nature, suggesting that debt can be a productive tool when used for asset creation (mortgage, business investment) but remains a significant burden when used for consumption.`} Periods when your 6th lord is activated through dasha or when Saturn and Mars simultaneously aspect your 6th house mark the highest risk windows for financial overextension. The most powerful preventive measure is maintaining a personal debt-to-income ratio below 30% and carrying a liquidity buffer equivalent to at least six months of living expenses. If debt currently exists, the ${currentMaha} Mahadasha period offers specific windows for structured repayment—targeting debt elimination during Jupiter transit through your 2nd or 11th house creates maximum energetic support for financial liberation.`;

  const windfall = `Windfall and unexpected financial gains are indicated by the Dhan Yoga configurations in your chart. ${secondLord === eleventhLord || secondLord === lagnaLord || eleventhLord === lagnaLord ? `Your chart carries a notable Dhan Yoga—${secondLord === eleventhLord ? `the same planet ${secondLord} rules both the 2nd and 11th houses, creating a self-reinforcing wealth circuit` : `the connection between your Lagna lord ${lagnaLord} and wealth house lords creates an auspicious pattern for sudden gains`}—activating this yog through dasha periods of the involved planets tends to bring unexpected financial blessings.` : `While not possessing a classical Dhan Yoga, your chart benefits from Jupiter's natural karak (significator) role for wealth, ensuring that its dasha and transit periods regularly bring financial expansion and unexpected positive windfalls.`} The 5th house lord ${fifthLord} also governs speculative gains—when ${fifthLord} is well-placed by transit and activated by dasha, calculated investments in emerging opportunities may yield outsized returns. Overall, windfall potential is highest during Jupiter and Venus dashas, and during the annual period when Jupiter transits your 2nd or 11th house.`;

  const propertyYog = `Property, real estate, and fixed assets are governed by the 4th house of your chart, which falls in ${fourthSign} and is lorded by ${fourthLord}. ${isBenefic(fourthLord) ? `Your ${fourthLord} 4th lord is a natural benefic, indicating a genuine blessing in matters of property—real estate investments made during ${fourthLord} Dasha periods tend to appreciate well and bring lasting domestic happiness alongside financial value.` : `Your ${fourthLord} 4th lord requires more careful navigation in property matters—successful real estate transactions come through thorough due diligence, legal clarity, and purchases made during Jupiter's transit through your 4th house rather than impulsive acquisitions.`} ${lagnaSign === "Taurus" || lagnaSign === "Cancer" || lagnaSign === "Scorpio" || lagnaSign === "Capricorn" ? `Your ${lagnaSign} Ascendant carries a natural affinity for land and property—real estate represents both an emotional anchor and a sound financial investment for your chart.` : `While your ${lagnaSign} Ascendant is not primarily property-oriented, the 4th house configuration indicates that property accumulation becomes an increasingly important financial strategy as your dasha sequence progresses.`} The most auspicious periods for property purchase, construction, or major home investment are Jupiter Dasha, ${fourthLord} Dasha, and the annual window when Jupiter transits your 4th house or aspects it from the 8th or 12th position.`;

  const finance: FinanceAnalysis = {
    wealthPotential,
    investmentAdvice,
    savingsGuidance,
    debtWarning,
    windfall,
    propertyYog
  };

  // MARRIAGE
  const ninthLordSign = signOfHouse(9, lagnaIndex);
  const marriageYog = `Marriage prospects and the overall quality of your partnership life are assessed through the 7th house of your chart, which falls in ${seventhSign} and is governed by ${seventhLord}. ${seventhSign} as the partner-axis sign infuses your marriage with qualities of ${seventhKeywords[0] ?? "companionship"}, ${seventhKeywords[1] ?? "equilibrium"}, and ${seventhKeywords[2] ?? "shared purpose"}—these are the qualities that both define you as a partner and the qualities you most seek in your spouse. ${isBenefic(seventhLord) ? `The benefic ${seventhLord} as your 7th lord creates a fundamentally auspicious marriage yog—partnership is generally rewarding, mutually supportive, and materially fruitful in your chart.` : `The ${seventhLord} as your 7th lord indicates that marriage carries karmic weight in your chart—the relationship itself becomes a profound teacher and transformer, and the greatest marital happiness comes through conscious effort, patience, and spiritual maturity rather than effortless compatibility.`} Venus, the universal karaka for marriage and relationships, currently occupies ${venusSign} in the sky, amplifying themes of ${SIGN_KEYWORDS[venusSign]?.[0] ?? "beauty"} and ${SIGN_KEYWORDS[venusSign]?.[1] ?? "harmony"} in your relational sphere. The presence of your Moon in ${moonSign} adds a strong emotional intelligence and nurturing capacity to your approach to partnership—your spouse will be deeply impacted by the quality of emotional safety and intuitive connection you provide. Overall, your chart carries a genuine promise of meaningful, soul-aligned partnership when entered with maturity and dharmic intention.`;

  const spouseNature = `The nature of your spouse is primarily read from the 7th house sign ${seventhSign} and its lord ${seventhLord}'s characteristics. Your spouse is likely to embody qualities of ${seventhKeywords[0] ?? "refined character"}, ${seventhKeywords[1] ?? "balanced perspective"}, and ${seventhKeywords[2] ?? "purposeful engagement"}—these ${seventhSign} qualities will be the dominant personality signature of your life partner. ${seventhLord === "Jupiter" ? "Jupiter as 7th lord suggests a spouse who is wise, generous, spiritual, and knowledgeable—someone from whom you will continue to learn throughout the marriage." : seventhLord === "Venus" ? "Venus as 7th lord indicates a spouse with refined aesthetic sensibilities, social grace, artistic inclinations, and a natural warmth that creates a beautiful domestic environment." : seventhLord === "Mercury" ? "Mercury as 7th lord suggests a spouse who is intellectually sharp, communicative, versatile, and business-minded—conversation and mental connection will be the cornerstone of your relationship." : seventhLord === "Moon" ? "Moon as 7th lord indicates a spouse who is emotionally nurturing, intuitive, attached to family and home, and deeply sensitive—emotional attunement will define the quality of your marriage." : seventhLord === "Saturn" ? "Saturn as 7th lord often indicates a spouse who is older, mature, disciplined, hardworking, and serious in their approach to commitment—the marriage grows deeper and more rewarding with time." : seventhLord === "Mars" ? "Mars as 7th lord indicates a spouse with drive, independence, directness, and a competitive spirit—a dynamic, action-oriented partner who brings energy and initiative into the relationship." : seventhLord === "Sun" ? "Sun as 7th lord suggests a spouse with authority, pride, leadership qualities, and a strong sense of self—someone commanding public respect in their professional domain." : `${seventhLord} as 7th lord brings unique and complex qualities to your spouse's personality—their character will be deeply shaped by ${seventhLord}'s natural significations and your ongoing karmic journey together.`} The physical appearance and overall energy of your partner will likely reflect the elemental nature of ${seventhSign}—${SIGN_ELEMENT[seventhSign] === "Fire" ? "dynamic, luminous, and energetically commanding" : SIGN_ELEMENT[seventhSign] === "Earth" ? "grounded, physically strong, and enduringly stable" : SIGN_ELEMENT[seventhSign] === "Air" ? "intellectually bright, socially engaging, and communicatively gifted" : "emotionally deep, intuitively perceptive, and nurturingly compassionate"}.`;

  // Compatible signs: trine and kendra from both lagna and moon
  const compatibleSigns: string[] = [];
  [0, 4, 8, 3, 7, 11].forEach(offset => {
    const lagnaCompat = ZODIAC_SIGNS[(lagnaIndex + offset) % 12];
    const moonCompat = ZODIAC_SIGNS[(moonSignIndex + offset) % 12];
    if (!compatibleSigns.includes(lagnaCompat)) compatibleSigns.push(lagnaCompat);
    if (!compatibleSigns.includes(moonCompat)) compatibleSigns.push(moonCompat);
  });
  const finalCompatible = compatibleSigns.slice(0, 6);

  const venusAndJupDashas = mahadashas.filter(m => m.planet === "Venus" || m.planet === "Jupiter");
  const bestMarriagePeriod = `Marriage is most strongly supported by the dashas of Venus (the universal karaka for marriage) and Jupiter (the karaka for husband in a female chart and for marriage generally). In your chart, ${venusAndJupDashas.length > 0 ? `these periods are: ${venusAndJupDashas.map(m => `${m.planet} Mahadasha (${new Date(m.start).getFullYear()}–${new Date(m.end).getFullYear()})`).join(", ")}` : "Venus and Jupiter Dasha periods are the primary marriage-favorable windows in your dasha sequence"}. Additionally, the ${seventhLord} Mahadasha is specifically powerful for marital events in your chart—when the 7th lord's dasha runs, marriage karma is directly activated, making this the most personally specific marriage indicator in your dasha sequence. Within any Mahadasha, the Antardashas of Venus, Jupiter, and ${seventhLord} represent the finest three-to-six month windows for marriage ceremonies, especially when Jupiter simultaneously transits your 7th house or 1st house from the sky. The most auspicious marriage muhurtas within these windows should be selected with proper Vedic calendar consultation for maximum marital harmony.`;

  const relationshipChallenges = `Challenges in relationships arise primarily from Saturn's karmic discipline—when Saturn transits your 1st, 4th, or 7th house (through the Sade Sati or Kantaka Shani), relationships face their most significant tests. ${MALEFIC_PLANETS.has(seventhLord) ? `Your ${seventhLord} 7th lord creates an inherent complexity in partnerships—relationships may involve control dynamics, power struggles, or periods of emotional distance that require conscious healing work to navigate.` : `While your ${seventhLord} 7th lord is generally supportive of relationships, no partnership is without growth-edges—the specific challenges in your chart relate more to ${lagnaSign}'s shadow qualities (${lagnaKeywords[0] === "courage" ? "impulsiveness or self-centeredness" : lagnaKeywords[0] === "stability" ? "stubbornness or possessiveness" : lagnaKeywords[0] === "intellect" ? "emotional detachment or over-rationalization" : lagnaKeywords[0] === "nurturing" ? "co-dependency or boundary confusion" : "the shadow expressions of your Ascendant energy"}) than to the 7th house structure itself.`} Rahu's influence on relationships—whether through its dasha or transit through key relationship houses—creates periods of intensity, unconventional dynamics, or sudden relationship changes that benefit from conscious spiritual navigation rather than reactive responses.`;

  const remedyForHarmony = `For ongoing relationship harmony and removal of marital obstacles, the following specific practices are recommended for your chart: First, perform weekly Lakshmi-Narayan puja on Fridays—this combined deity worship strengthens Venus (the marriage karaka) and Jupiter (the wisdom that sustains marriage) simultaneously. Second, chant the Swayamvara Parvati mantra 108 times daily if marriage is pending—this mantra specifically removes obstacles to marriage formation in challenging charts. Third, donate white sweets (mishri, kheer) to young children on Fridays to strengthen Venus's positive influence on your 7th house. Fourth, perform the Rudrabhishek ritual during lunar eclipses or on Maha Shivaratri to pacify any Mangalik doshas or 7th house afflictions that may create partnership friction. Fifth, observing the Solah Somvar Vrat (sixteen Monday fasts) with sincere devotion invokes Lord Shiva's blessing for marital harmony—this vrat is particularly powerful for ${lagnaSign} Ascendant natives seeking lasting relationship peace.`;

  const marriage: MarriageAnalysis = {
    marriageYog,
    spouseNature,
    compatibleSigns: finalCompatible,
    bestMarriagePeriod,
    relationshipChallenges,
    remedyForHarmony
  };

  // HEALTH
  const vulnerableAreas: string[] = [...new Set([
    ...(lagnaBodyParts ?? []),
    ...(moonBodyParts ?? []).slice(0, 3)
  ])].slice(0, 8);

  const constitutionType = `Your ${constitution} constitution arising from ${lagnaSign} Ascendant and ${moonSign} Moon creates a specific psychophysical blueprint that shapes your health patterns throughout life. ${constitution === "Pitta" ? `As a Pitta-dominant type, your body runs warm, your digestion is powerful, and your mind is sharp and goal-oriented—but excess heat, inflammation, acidity, and burnout from overwork are your cardinal health vulnerabilities. Cooling foods, moderate exercise, time in nature, and conscious stress reduction are your foundational health practices.` : constitution === "Vata" ? `As a Vata-dominant type, your system is quick, creative, and sensitive—but dryness, irregularity, anxiety, joint sensitivity, and nervous system exhaustion accumulate most readily when you push beyond your natural rhythms. Warm, oily, nourishing foods, consistent daily routine, and grounding practices are your essential health foundations.` : constitution === "Kapha-Pitta" ? `As a Kapha-Pitta type, you combine emotional depth with intellectual fire—your body is generally robust but prone to respiratory congestion, circulatory sluggishness, weight accumulation, and inflammatory flare-ups when diet and lifestyle fall out of balance. Regular vigorous exercise, light and easily digestible foods, and consistent emotional processing practices maintain your health most effectively.` : `As a Vata-Kapha type, your system tends toward cold, heavy, and slow—respiratory health, joint mobility, metabolic rate, and immune resilience require consistent attention. Warming, stimulating foods and regular vigorous movement are your health essentials.`} Understanding and consistently honoring your constitutional needs in diet, sleep, exercise, and seasonal routine is the single most powerful long-term health strategy available to you.`;

  const preventiveMeasures = `Preventive health measures for your chart are specifically guided by the vulnerabilities of ${lagnaSign} and ${moonSign} together. Priority areas for prevention include: maintaining strict regularity in meal timing (${constitution === "Vata" ? "never skipping meals or eating erratically" : constitution === "Pitta" ? "avoiding excessive spicy, fried, and fermented foods, particularly during hot seasons" : "limiting heavy, cold, sweet foods especially in winter and spring seasons when Kapha accumulates most"}), practicing your yoga sadhana (${constitution === "Pitta" ? "cooling pranayama like Sheetali and Nadi Shodhana, forward bends, and moon salutations" : constitution === "Vata" ? "grounding pranayama like Bhramari, slow Surya Namaskar, and restorative yoga postures" : "energizing Kapalabhati, vigorous Surya Namaskar, and twisting postures that activate digestion and metabolism"}), and scheduling a complete Ayurvedic health assessment at least once every two years to catch constitutional imbalances before they manifest as disease. During Saturn transit and Sade Sati periods, immunity tends to drop—extra attention to sleep quality, immunity-supportive herbs (Ashwagandha, Guduchi, Tulsi), and stress reduction is essential during these astrological windows.`;

  const cautionPeriods = `Health requires the most careful management during Saturn's major dasha periods and during its transit through sensitive houses. In your chart, when Saturn transits your ${lagnaSign} Ascendant (Sade Sati first phase), 12th house (beginning of Sade Sati), or 4th house (Ashtama Shani), constitutional vitality decreases and pre-existing health conditions may flare. The ${sixthLord} Mahadasha period also demands health vigilance—the 6th lord directly governs disease when activated, making this a time for preventive check-ups, dietary discipline, and proactive healthcare rather than assuming robust health. Rahu dasha periods may bring unusual or difficult-to-diagnose health conditions—maintaining comprehensive medical records and consulting both allopathic and Ayurvedic practitioners simultaneously during Rahu dasha is strongly advised. Mars dasha periods carry risks of injuries, inflammations, and surgical procedures, particularly when Mars transits your 6th or 8th house simultaneously.`;

  const healingPractices = `Your most powerful healing practices are those that specifically address your ${constitution} constitution and the specific vulnerabilities of ${lagnaSign} and ${moonSign}. For daily practice: begin each morning with ${constitution === "Pitta" ? "Surya namaskar (12 rounds at a moderate pace), coconut oil pulling, and cooling pranayama—Nadi Shodhana (5 minutes) and Sheetali (5 minutes)" : constitution === "Vata" ? "self-massage with warm sesame oil (Abhyanga) before bathing, gentle Surya namaskar, and grounding Bhramari pranayama (5-10 minutes)" : "dry brushing or vigorous Garshana massage before bathing, energizing Kapalabhati pranayama (5 minutes), and a glass of warm water with ginger and honey"}. Planetary healing specifically aligned with your chart includes: wearing ${tenthLord === "Jupiter" ? "yellow sapphire or topaz" : tenthLord === "Venus" ? "white sapphire or opal" : tenthLord === "Saturn" ? "blue sapphire after thorough consultation" : tenthLord === "Mars" ? "red coral after consultation" : tenthLord === "Mercury" ? "emerald or green tourmaline" : tenthLord === "Moon" ? "natural pearl" : tenthLord === "Sun" ? "ruby after consultation" : "the appropriate gemstone for your primary dasha lord after proper consultation"} to strengthen your chart's primary health-supportive planet, and performing mantra therapy through daily repetition of your Ishta Devata's mantra, which creates a profound healing resonance in the energy body that prevents disease at its subtlest level.`;

  const health: HealthAnalysis = {
    constitutionType,
    vulnerableAreas: vulnerableAreas.length > 0 ? vulnerableAreas : ["general vitality","immune system","digestive health","nervous system","respiratory system","joint health","cardiovascular system","lymphatic system"],
    preventiveMeasures,
    cautionPeriods,
    healingPractices
  };

  // EDUCATION
  const fifthSign = signOfHouse(5, lagnaIndex);
  const fourthHouseLord = fourthLord;
  const mercurySign = ""; // Not provided in inputs directly; derive from nakshatraLord proxy
  const mercuryKeywords = PLANET_KEYWORDS["Mercury"] ?? [];

  const learningStyle = `Your learning style is shaped by Mercury's placement in your chart and the overall intellectual constitution of your ${lagnaSign} Ascendant. ${lagnaSign === "Gemini" || lagnaSign === "Virgo" ? `As a Mercury-ruled ${lagnaSign} Ascendant, your mind is naturally quick, analytical, and multi-dimensional—you learn best through active engagement, questioning, discussion, and hands-on application rather than passive absorption.` : lagnaSign === "Sagittarius" || lagnaSign === "Pisces" ? `As a Jupiter-ruled ${lagnaSign} Ascendant, your learning is philosophical and intuitive—you grasp big-picture concepts rapidly and then fill in details, learning best through inspiring teachers, philosophical contexts, and real-world meaning rather than dry memorization.` : lagnaSign === "Aries" || lagnaSign === "Scorpio" ? `As a Mars-ruled ${lagnaSign} Ascendant, your learning is driven by competitive motivation and the desire to master a skill completely—you learn best under challenge, with clear goals, and in competitive or goal-driven educational environments.` : lagnaSign === "Taurus" || lagnaSign === "Libra" ? `As a Venus-ruled ${lagnaSign} Ascendant, your learning is aesthetic and sensory—you retain information best when it is presented beautifully, with artistic or creative elements, and in harmonious, comfortable learning environments.` : lagnaSign === "Cancer" ? `As a Moon-ruled Cancer Ascendant, your learning is deeply emotional and associative—you retain information best when it is connected to personal experience, taught by someone you trust, and explored in a nurturing, psychologically safe environment.` : `As a ${SIGN_LORDS[lagnaSign]}-ruled ${lagnaSign} Ascendant, your learning style carries the qualities of ${lagnaKeywords[0] ?? "focused engagement"} and ${lagnaKeywords[1] ?? "purposeful study"}, benefiting most from ${isBenefic(SIGN_LORDS[lagnaSign] ?? "") ? "inspired, wisdom-centered instruction" : "structured, systematic pedagogy with clear milestones and measurable outcomes"}.`} The ${nakshatra} Nakshatra of your birth adds a specific intellectual signature—this asterism's qualities of ${NAKSHATRA_DEITY[nakshatra] ? `the wisdom of ${NAKSHATRA_DEITY[nakshatra]}` : "refined inquiry"} infuse your intellectual process with unique depth and specificity.`;

  const strongSubjects: string[] = [
    ...(PLANET_KEYWORDS[lagnaLord] ?? []),
    ...(PLANET_KEYWORDS[fifthLord] ?? []).slice(0, 2),
    ...(PLANET_KEYWORDS[fourthLord] ?? []).slice(0, 2)
  ].slice(0, 8);

  const higherEducation = `Higher education potential in your chart is assessed through the 9th house—the house of Dharma, philosophy, and advanced learning—which falls in ${ninthSign} and is lorded by ${ninthLord}. ${isBenefic(ninthLord) ? `Your ${ninthLord} 9th lord is a natural benefic, indicating a genuine blessing in higher education—university-level study, postgraduate degrees, and advanced professional certifications all carry strong promise in your chart.` : `Your ${ninthLord} 9th lord creates a more complex relationship with formal higher education—the greatest learning may come through self-directed study, apprenticeship models, or unconventional educational paths rather than traditional university systems.`} Periods of ${ninthLord} Mahadasha and Antardasha are the primary windows for initiating and completing advanced degrees or professional certifications—undertaking significant educational commitments during these periods aligns karmic timing with institutional achievement. Jupiter's transit through your 5th house (the house of intelligence and education) or 9th house creates annual windows of exceptional learning acceleration, making these transit periods ideal for beginning new courses, publishing research, or presenting academic work.`;

  const foreignStudy = `Foreign study opportunities are indicated by the 12th house of your chart—falling in ${twelfthSign} and lorded by ${twelfthLord}—and Rahu's signification of foreign environments and unconventional learning. ${houseFromLagna(marsSignIndex, lagnaIndex) === 12 || houseFromLagna(saturnSignIndex, lagnaIndex) === 12 ? `The current planetary configuration activates your 12th house significantly, suggesting that foreign study opportunities are actively present in your near-term educational story.` : `Your 12th house configuration indicates that foreign study becomes available during ${twelfthLord} Dasha periods and when Rahu's transits activate your 9th or 12th house.`} ${twelfthLord === "Jupiter" || twelfthLord === "Venus" ? `Your benefic ${twelfthLord} 12th lord creates genuinely positive foreign study prospects—international educational institutions, exchange programs, and foreign scholarships carry real promise for your chart.` : `Foreign study in your chart requires strategic planning and spiritual preparation—the greatest educational rewards in foreign environments come from clear purpose, structured programs, and strong family support rather than purely adventurous motivation.`} Learning foreign languages during Rahu or Mercury dasha periods creates powerful karmic support for both foreign study and international career development simultaneously.`;

  const skillsToDevElop = `The skills most aligned with your soul's growth and this lifetime's dharmic purpose are those that integrate ${lagnaSign}'s natural qualities of ${lagnaKeywords[0] ?? "purposeful action"} and ${lagnaKeywords[1] ?? "authentic expression"} with ${tenthSign}'s professional significations of ${tenthKeywords[0] ?? "expertise"} and ${tenthKeywords[1] ?? "achievement"}. Concretely, you would benefit most from developing expertise in ${(PLANET_KEYWORDS[tenthLord] ?? ["professional communication"])[0]}, strengthening your ${lagnaKeywords[2] ?? "core competency"}, and cultivating the soft skills of ${isBenefic(seventhLord) ? "partnership, negotiation, and collaborative leadership" : "strategic patience, systematic planning, and resilient persistence under adversity"}. Technology literacy in your primary professional domain, financial intelligence (understanding investment mathematics, tax strategy, and wealth-building), and at least one classical Indian art form or meditation practice represent a holistic skillset that serves both worldly success and spiritual development simultaneously. The Mercury and Jupiter dashas in your sequence are the most powerful windows for formal skill acquisition—courses, certifications, or apprenticeships begun during these periods tend to embed deeply and generate lasting professional value.`;

  const education: EducationAnalysis = {
    learningStyle,
    strongSubjects: strongSubjects.length > 0 ? strongSubjects : ["strategic thinking","analytical reasoning","communication","research","management","technology","law","philosophy"],
    higherEducation,
    foreignStudy,
    skillsToDevElop
  };

  // FOREIGN TRAVEL
  const rahuHouseFromLagna = houseFromLagna(rahuSignIndex, lagnaIndex);
  const ketuHouseFromLagna = houseFromLagna(ketuSignIndex, lagnaIndex);
  const rahuInForeignHouse = [7, 9, 12].includes(rahuHouseFromLagna);

  const foreignYog = `Foreign travel and settlement potential in your chart is assessed through multiple planetary combinations. The 12th house—governing foreign lands, liberation, and long journeys—falls in ${twelfthSign} and is lorded by ${twelfthLord}. The 9th house of long-distance travel and fortune falls in ${ninthSign} and is lorded by ${ninthLord}. The 7th house of foreign partnerships and journeys across the horizon falls in ${seventhSign} and is lorded by ${seventhLord}. When three or more of these house lords are connected—through mutual aspect, conjunction, or dasha activation—a powerful foreign yog (Pravasa Yoga) forms in the chart. In your specific configuration, ${twelfthLord === ninthLord ? `your 12th and 9th lords are the same planet ${twelfthLord}, creating a particularly strong foreign-dharma connection—foreign lands represent a genuine arena of karmic destiny for you` : twelfthLord === seventhLord ? `your 12th and 7th lords are the same planet ${twelfthLord}, connecting foreign environments directly with your partnership and relationship destiny—significant relationships in foreign lands or through international connections are strongly indicated` : `the independent strength of your 12th lord ${twelfthLord}, 9th lord ${ninthLord}, and 7th lord ${seventhLord} creates the potential for foreign yog to activate during their respective dasha periods`}. Overall, your chart carries meaningful indicators for both travel to and potential opportunity in foreign environments.`;

  const settlementPossibility = `The possibility of long-term foreign settlement is higher when multiple foreign indicators exist simultaneously in a natal chart. In your chart, ${isBenefic(twelfthLord) && isBenefic(ninthLord) ? `both your 12th lord ${twelfthLord} and 9th lord ${ninthLord} are natural benefics, creating a genuinely positive foreign settlement yog—living abroad, if it occurs, is likely to bring both material and spiritual enrichment rather than displacement or hardship` : isBenefic(twelfthLord) || isBenefic(ninthLord) ? `the benefic nature of your ${isBenefic(twelfthLord) ? `12th lord ${twelfthLord}` : `9th lord ${ninthLord}`} provides a foundation of auspiciousness to foreign settlement—with conscious preparation and spiritual grounding, relocation abroad can be highly rewarding` : `foreign settlement carries significant karmic weight in your chart—if it occurs, it demands conscious integration of your cultural roots, dharmic practices, and spiritual identity to prevent the rootlessness that malefic foreign house lords can create`}. The most productive foreign destinations for your chart are those in the ${SIGN_DIRECTION[lagnaSign]?.[0] ?? "East"} or ${SIGN_DIRECTION[lagnaSign]?.[1] ?? "North"} direction from your birthplace—these directional alignments resonate most powerfully with your Ascendant's elemental nature and bring the greatest external support for your goals.`;

  const bestDirections = `The most auspicious directions for travel, relocation, and seeking opportunities are determined by your ${lagnaSign} Ascendant's elemental affinity and the position of your Lagna lord. ${SIGN_ELEMENT[lagnaSign] === "Fire" ? `As a Fire Ascendant (${lagnaSign}), the East direction carries the most natural resonance—countries and regions to the East of your birthplace tend to bring maximum opportunity, recognition, and material support. South is your secondary direction of strength.` : SIGN_ELEMENT[lagnaSign] === "Earth" ? `As an Earth Ascendant (${lagnaSign}), the South direction carries particular karmic weight and opportunity—southern countries and regions tend to support your practical, achievement-oriented ambitions most powerfully. Southeast is your secondary direction of strength.` : SIGN_ELEMENT[lagnaSign] === "Air" ? `As an Air Ascendant (${lagnaSign}), the West direction carries the greatest karmic alignment—western countries and regions tend to provide the intellectual stimulation, social networks, and communicative freedom your nature craves. Northwest is your secondary direction of strength.` : `As a Water Ascendant (${lagnaSign}), the North direction carries the deepest karmic resonance—northern countries and regions tend to support your intuitive, emotionally intelligent approach to life most powerfully. Northeast, the direction of divine blessing (Ishanya), is your most auspicious secondary direction.`} When planning foreign travel or relocation, choose destinations that align with these directional signatures to maximize the auspiciousness of the journey's karmic impact on your overall life story.`;

  const travelPeriods = `The most auspicious and karmically significant periods for foreign travel in your dasha sequence are: first, Rahu Mahadasha—Rahu is the planet of foreign environments par excellence, and its major period almost invariably brings meaningful international experiences, relocation, or sustained engagement with foreign cultures and persons; second, ${twelfthLord} Mahadasha—as the lord of your 12th house of foreign lands, ${twelfthLord}'s major period directly activates your foreign destiny; third, ${ninthLord} Mahadasha—as the lord of long journeys and fortune, ${ninthLord}'s period often brings purposeful, dharma-aligned travel to distant lands. Within any Mahadasha, the Antardashas of Rahu, ${twelfthLord}, and ${ninthLord} represent specific three-to-six month windows when foreign travel carries maximum opportunity. Jupiter's transit through your 9th or 12th house (approximately every 12 years, lasting about one year) creates the single most powerful annual-to-multi-year window for initiating foreign journeys that carry lasting positive karmic impact.`;

  const foreignGains = `Financial and material gains from foreign sources are governed by the intersection of your 11th house (gains), 12th house (foreign lands), and 9th house (fortune through long-distance connections). ${eleventhLord === twelfthLord ? `A powerful foreign-income Yoga exists in your chart—the same planet ${eleventhLord} lords both your gains house (11th) and foreign house (12th), creating a direct channel between international activities and financial accumulation. This is one of the most powerful indicators for earning from foreign clients, international trade, or working abroad.` : `The connection between your 11th lord ${eleventhLord} and 12th lord ${twelfthLord} is activated during specific dasha and transit windows, creating periodic but significant opportunities for income from foreign sources, international clients, or export-oriented business.`} Industries with natural international revenue potential that align with your chart include ${(PLANET_KEYWORDS[twelfthLord] ?? ["international trade","foreign services"])[0]} and ${(PLANET_KEYWORDS[ninthLord] ?? ["advisory","educational services"])[0]}—these fields allow your chart's foreign-gain indicators to manifest most naturally. Building an international professional network proactively during Jupiter's positive transit cycles ensures that when foreign-gain dashas arrive, the karmic infrastructure for receiving these blessings is already in place.`;

  const foreignTravel: ForeignTravelAnalysis = {
    foreignYog,
    settlementPossibility,
    bestDirections,
    travelPeriods,
    foreignGains,
  };

  return {
    career,
    finance,
    marriage,
    health,
    education,
    foreignTravel,
  };
}
