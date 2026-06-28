// ──────────────────────────────────────────────────────────────────────────────
// Vedic Astrology Content Library
// All interpretations keyed by sign, nakshatra, planet, house, dasha lord
// ──────────────────────────────────────────────────────────────────────────────

export const ZODIAC_SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];

export const ZODIAC_LORDS = [
  "Mars","Venus","Mercury","Moon","Sun","Mercury",
  "Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"
];

export const NAKSHATRA_NAMES = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
  "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni",
  "Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
  "Moola","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha",
  "Purva Bhadrapada","Uttara Bhadrapada","Revati"
];

export const NAKSHATRA_LORDS = [
  "Ketu","Venus","Sun","Moon","Mars","Rahu",
  "Jupiter","Saturn","Mercury","Ketu","Venus","Sun",
  "Moon","Mars","Rahu","Jupiter","Saturn","Mercury",
  "Ketu","Venus","Sun","Moon","Mars","Rahu",
  "Jupiter","Saturn","Mercury"
];

export const DASHA_YEARS: Record<string, number> = {
  Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16,
  Saturn: 19, Mercury: 17, Ketu: 7, Venus: 20
};

export const DASHA_ORDER = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];

// ──────────────── Rashi (Moon Sign) Descriptions ────────────────
export const RASHI_DESCRIPTIONS: Record<string, { traits: string; strengths: string; challenges: string; career: string; relationship: string }> = {
  Aries: {
    traits: "You are bold, energetic, and a natural leader. Born under Mesha Rashi with Mars as your lord, you approach life with courage and direct action. You possess tremendous drive and rarely hesitate when an opportunity presents itself.",
    strengths: "Leadership ability, courage, enthusiasm, pioneering spirit, and the energy to initiate new projects. You inspire others with your confidence and determination.",
    challenges: "Impatience, tendency to act before thinking, occasional aggression, and difficulty following through on projects once the initial excitement fades.",
    career: "You thrive in roles that demand initiative and leadership — military, sports, entrepreneurship, surgery, engineering, or any field where you can be first. You dislike working under heavy supervision.",
    relationship: "You are passionate and direct in love. You need a partner who can match your energy and give you independence. You are fiercely loyal but need to manage your temper in close relationships."
  },
  Taurus: {
    traits: "You are stable, patient, and deeply connected to the material world. Born under Vrishabha Rashi with Venus as your lord, you seek comfort, beauty, and lasting security in all areas of life.",
    strengths: "Patience, reliability, practicality, strong aesthetic sense, and the ability to build lasting wealth and relationships through consistent effort.",
    challenges: "Stubbornness, resistance to change, possessiveness, and a tendency to hold grudges. You may also struggle with overindulgence in physical pleasures.",
    career: "You excel in finance, banking, real estate, agriculture, arts, music, cooking, and any field where your eye for quality and patience create value. You build empires slowly and surely.",
    relationship: "You are a devoted, sensual partner who values stability above all. You need a partner who is faithful and emotionally present. Once committed, you are exceptionally loyal."
  },
  Gemini: {
    traits: "You are curious, adaptable, and gifted with communication. Born under Mithuna Rashi with Mercury as your lord, you have a quick mind that absorbs information effortlessly and a gift for expressing ideas.",
    strengths: "Versatility, communication skills, intellectual agility, social charm, and the ability to see multiple perspectives simultaneously.",
    challenges: "Inconsistency, scattered focus, anxiety, superficiality in relationships, and difficulty making firm decisions. Your mind moves faster than your actions.",
    career: "Writing, journalism, teaching, sales, marketing, technology, trading, law, and any field requiring communication and quick thinking. You need mental stimulation to stay engaged.",
    relationship: "You need a mentally stimulating partner who keeps you intellectually engaged. You are witty and charming but need to work on emotional depth and consistency in relationships."
  },
  Cancer: {
    traits: "You are deeply intuitive, nurturing, and emotionally sensitive. Born under Karka Rashi with the Moon as your lord, you feel everything deeply and have a powerful connection to family, home, and tradition.",
    strengths: "Empathy, intuition, loyalty to family, strong memory, nurturing ability, and a deep understanding of human emotions.",
    challenges: "Moodiness, over-sensitivity, clinginess, difficulty letting go of the past, and a tendency to retreat into a shell when hurt.",
    career: "Healthcare, counselling, hospitality, real estate, food industry, teaching, social work, and any field where nurturing others is central. You build deep trust with clients and colleagues.",
    relationship: "You are devoted, protective, and deeply loving. Home and family are your foundation. You need a partner who values emotional security and is willing to build a stable home life with you."
  },
  Leo: {
    traits: "You are charismatic, generous, and born to shine. Born under Simha Rashi with the Sun as your lord, you carry a natural authority and warmth that draws people to you.",
    strengths: "Leadership, generosity, creativity, dignity, loyalty, and an infectious enthusiasm that motivates everyone around you.",
    challenges: "Pride, need for constant recognition, domineering tendencies, and difficulty accepting criticism or sharing the spotlight.",
    career: "Politics, entertainment, management, arts, teaching, medicine, and any role where you can lead, inspire, and be visible. You naturally rise to positions of authority.",
    relationship: "You are passionate, warm, and deeply committed. You need a partner who admires and respects you. In return, you are extremely loyal and shower your loved ones with affection."
  },
  Virgo: {
    traits: "You are analytical, detail-oriented, and deeply service-minded. Born under Kanya Rashi with Mercury as your lord, you have a precise mind and an innate desire to improve everything around you.",
    strengths: "Analytical ability, attention to detail, work ethic, practical intelligence, healing ability, and genuine desire to be of service.",
    challenges: "Perfectionism, excessive criticism (of self and others), anxiety, over-analysis, and difficulty relaxing or accepting imperfection.",
    career: "Medicine, healthcare, research, accounting, editing, writing, nutrition, data analysis, and any field requiring precision and systematic thinking.",
    relationship: "You are devoted and reliable but can be overly critical. You show love through acts of service and practical support. You need a partner who appreciates your attention to detail."
  },
  Libra: {
    traits: "You are diplomatic, charming, and deeply committed to fairness and beauty. Born under Tula Rashi with Venus as your lord, you have an exceptional ability to see all sides of a situation.",
    strengths: "Diplomacy, charm, aesthetic sense, fairness, ability to build harmonious relationships, and skill in negotiation and mediation.",
    challenges: "Indecisiveness, people-pleasing, avoidance of conflict, dependency on partnerships, and difficulty making firm decisions.",
    career: "Law, diplomacy, design, fashion, arts, counselling, human resources, and any field requiring balance, negotiation, and aesthetic judgment.",
    relationship: "Partnership is essential to your wellbeing. You are romantic, refined, and deeply committed once you choose. You need a partner who shares your values of beauty, fairness, and harmony."
  },
  Scorpio: {
    traits: "You are intense, perceptive, and deeply transformative. Born under Vrischika Rashi with Mars as your lord, you have an extraordinary ability to see beneath the surface and penetrate to the truth of any matter.",
    strengths: "Depth of perception, emotional intensity, determination, research ability, courage in crisis, and extraordinary resilience.",
    challenges: "Jealousy, obsessiveness, secretiveness, difficulty forgiving, and a tendency toward power struggles in relationships.",
    career: "Research, investigation, psychology, surgery, occult sciences, mining, finance, and any field involving transformation, depth, or uncovering hidden truths.",
    relationship: "You love with extraordinary depth and expect complete loyalty. You are intensely passionate but need to manage jealousy and the need for control. A deep soul connection is what you seek."
  },
  Sagittarius: {
    traits: "You are optimistic, philosophical, and driven by a love of freedom and truth. Born under Dhanu Rashi with Jupiter as your lord, you have a broad vision of life and an innate faith in the goodness of the universe.",
    strengths: "Optimism, philosophical wisdom, love of learning, generosity, broad perspective, and inspiring ability to see the big picture.",
    challenges: "Restlessness, overconfidence, bluntness, difficulty with commitment, and a tendency to overextend or promise more than you can deliver.",
    career: "Teaching, philosophy, law, travel industry, publishing, spirituality, sports, and any field where broad thinking and inspiration are valued.",
    relationship: "You need freedom and intellectual connection in relationships. You are warm and generous but value independence highly. A partner who shares your love of growth and adventure is ideal."
  },
  Capricorn: {
    traits: "You are disciplined, ambitious, and remarkably patient. Born under Makara Rashi with Saturn as your lord, you have an innate understanding that true success requires sustained, long-term effort.",
    strengths: "Discipline, ambition, practicality, organizational ability, patience, and the capacity to achieve extraordinary things through persistent effort.",
    challenges: "Excessive caution, pessimism, workaholism, difficulty expressing emotions, and tendency to sacrifice personal life for professional achievement.",
    career: "Business, government, finance, engineering, architecture, law, and any field where structure, authority, and long-term planning are required.",
    relationship: "You are loyal and take relationships seriously. You show love through acts of responsibility and provision. You need a partner who respects your ambitions and values commitment."
  },
  Aquarius: {
    traits: "You are original, humanitarian, and intellectually forward-thinking. Born under Kumbha Rashi with Saturn as your lord, you march to your own drummer and have a deep concern for the welfare of humanity.",
    strengths: "Originality, humanitarian values, intellectual innovation, independence, ability to network, and a vision that is often ahead of its time.",
    challenges: "Emotional detachment, unpredictability, rebelliousness, aloofness in personal relationships, and difficulty with intimacy.",
    career: "Technology, science, social reform, astrology, NGOs, aviation, research, and any field where innovation and humanitarian values intersect.",
    relationship: "You need a partner who is your intellectual equal and gives you space. You are loyal and caring but may struggle with emotional expression. Friendship is the foundation of your best relationships."
  },
  Pisces: {
    traits: "You are compassionate, intuitive, and spiritually attuned. Born under Meena Rashi with Jupiter as your lord, you have a profound sensitivity to the unseen dimensions of life.",
    strengths: "Compassion, spiritual depth, artistic ability, intuition, adaptability, and the ability to understand and heal others at a profound level.",
    challenges: "Escapism, over-sensitivity, lack of boundaries, difficulty with practical matters, and a tendency toward self-sacrifice to the point of self-neglect.",
    career: "Spirituality, healing arts, music, film, social work, counselling, marine biology, and any field where creativity, compassion, and intuition are assets.",
    relationship: "You are deeply romantic and devoted. You seek a soulmate connection. You need a grounded partner who can help you stay practical while you provide the depth and spiritual connection."
  }
};

// ──────────────── Nakshatra Descriptions ────────────────
export const NAKSHATRA_DESCRIPTIONS: Record<string, { meaning: string; personality: string; deity: string; remedy: string }> = {
  Ashwini: {
    meaning: "The Horse-Headed Ones",
    personality: "You are quick, healing, and pioneering. Ashwini natives are among the fastest initiators in the zodiac. You have a natural gift for healing and bring vitality wherever you go. Your mind operates at lightning speed and you often arrive at solutions before others have identified the problem.",
    deity: "Ashwini Kumaras — the divine physicians who bring healing and rejuvenation",
    remedy: "Worship the Ashwini Kumaras on Tuesdays. Offer prayers for health and healing. Recite the Ashwini Mantra: Om Ashwinau Shahishthabhyam Namah."
  },
  Bharani: {
    meaning: "The Bearer",
    personality: "You carry the weight of transformation. Bharani natives understand that creation and destruction are two sides of the same cycle. You have tremendous endurance and are not afraid to go to the depths of experience. You possess strong sexual and creative energy.",
    deity: "Yama — the god of death and dharma, ensuring cosmic order",
    remedy: "Worship Lord Yama and respect elders and ancestors. Practice ancestral prayers (Pitru Tarpan). Donate to causes that support the dying and transition."
  },
  Krittika: {
    meaning: "The Cutter",
    personality: "You are sharp, discerning, and purifying. Krittika natives cut through illusion with precision. You have exceptional focus and the courage to speak uncomfortable truths. You make excellent leaders but can be critical when expectations are not met.",
    deity: "Agni — the fire god who purifies and transforms",
    remedy: "Light a lamp before the Sun daily. Worship Skanda (Kartikeya) on Fridays. Offer sesame seeds and fire in Agni Homa for purification."
  },
  Rohini: {
    meaning: "The Red One / The Growing One",
    personality: "You are fertile, creative, and deeply sensual. Rohini is the most beloved of all Nakshatras, graced by the Moon. You have exceptional aesthetic sense and the ability to nurture growth in yourself and others. You attract abundance through your magnetic presence.",
    deity: "Brahma — the creator god who brings all things into manifestation",
    remedy: "Worship Lord Brahma and the Moon. Offer white flowers and milk. Chant the Chandra Mantra on Mondays: Om Som Somaya Namah."
  },
  Mrigashira: {
    meaning: "The Deer's Head",
    personality: "You are gentle, curious, and eternally seeking. Mrigashira natives are the seekers of the zodiac — always searching for something more beautiful, more meaningful, more true. You have a sensitive mind and gift for artistic and intellectual pursuits.",
    deity: "Soma — the moon god, associated with nectar, pleasure, and divine inspiration",
    remedy: "Perform Moon worship on Mondays. Keep a silver moon in your home. Drink clean water and observe dietary purity for mental clarity."
  },
  Ardra: {
    meaning: "The Moist One / The Storm",
    personality: "You are intense, transformative, and capable of extraordinary renewal. Ardra natives experience life through storms — both inner and outer. You have deep emotional intensity and brilliant intellectual power that can tear down old structures to build anew.",
    deity: "Rudra — the storm god, bringer of destruction and transformation",
    remedy: "Worship Lord Shiva and Rudra on Mondays. Chant Om Namah Shivaya 108 times daily. Offer bilva leaves and water to Shiva Linga."
  },
  Punarvasu: {
    meaning: "Return of the Light / Good Again",
    personality: "You are expansive, optimistic, and spiritually inclined. Punarvasu natives have a remarkable capacity to recover from setbacks and return to a state of goodness. You carry an inner light that sustains you through difficulties and inspires others.",
    deity: "Aditi — the infinite mother goddess, source of all light and expansion",
    remedy: "Worship Goddess Aditi and offer prayers for abundance. Light a yellow lamp on Thursdays. Chant the Guru Mantra for wisdom and expansion."
  },
  Pushya: {
    meaning: "The Nourisher",
    personality: "You are nurturing, responsible, and deeply connected to dharma. Pushya is considered the most auspicious Nakshatra. You have a natural gift for caring for others, building community, and upholding tradition. Your sincerity earns deep trust.",
    deity: "Brihaspati — the divine guru and priest of the gods",
    remedy: "Worship Brihaspati (Jupiter) on Thursdays. Offer yellow flowers and ghee. Feed Brahmins or scholars. Read the Guru Stotra for wisdom."
  },
  Ashlesha: {
    meaning: "The Entwiner",
    personality: "You are perceptive, magnetic, and strategically brilliant. Ashlesha natives have a penetrating intelligence and the ability to see through deception. You are deeply intuitive and have the power to influence others through subtle means.",
    deity: "Nagas — the serpent deities who guard hidden wisdom and treasures",
    remedy: "Worship Naga Devatas on Panchami Tithi. Offer milk to snake idols at temples. Chant the Sarpa Mantra for protection and wisdom."
  },
  Magha: {
    meaning: "The Mighty One",
    personality: "You carry the dignity of ancestors. Magha natives have a natural sense of royalty and tradition. You take pride in your lineage and have the capacity for significant authority and honour. Past-life merits manifest as natural leadership in this life.",
    deity: "Pitrs — the ancestral spirits who guide and protect their descendants",
    remedy: "Perform Pitru Tarpan (ancestral offerings) on Amavasya (new moon). Respect and care for elders. Donate food and clothing in memory of ancestors."
  },
  "Purva Phalguni": {
    meaning: "The Former Reddish One / The Fig Tree",
    personality: "You are creative, romantic, and drawn to pleasure and beauty. Purva Phalguni natives have strong artistic talent and a love for life's finer experiences. You are charming, generous, and have a gift for bringing joy to others.",
    deity: "Bhaga — the god of marital bliss, prosperity, and enjoyment",
    remedy: "Worship Goddess Lakshmi on Fridays. Offer red flowers and sweets. Chant the Lakshmi Stotra for prosperity. Avoid wastefulness and practice gratitude."
  },
  "Uttara Phalguni": {
    meaning: "The Latter Reddish One",
    personality: "You are dependable, generous, and built for lasting success. Uttara Phalguni natives combine social grace with genuine reliability. You achieve through consistent, honourable effort and inspire loyalty in those around you.",
    deity: "Aryaman — the god of social contracts, friendship, and chivalry",
    remedy: "Honour your commitments and maintain integrity in all dealings. Offer gratitude daily for your blessings. Participate in community service regularly."
  },
  Hasta: {
    meaning: "The Hand",
    personality: "You are skilled, resourceful, and have extraordinary dexterity — both physical and mental. Hasta natives master whatever craft or skill they pursue. You have a playful wit and the ability to achieve through cleverness rather than force.",
    deity: "Savitar — the solar deity of skill, inspiration, and divine craftsmanship",
    remedy: "Practice a craft or skill with devotion. Worship Surya (Sun) at sunrise. Offer water to the Sun in the morning. Chant the Gayatri Mantra for clarity."
  },
  Chitra: {
    meaning: "The Bright One / The Architect",
    personality: "You are visionary, artistic, and drawn to beauty in all forms. Chitra natives have an exceptional aesthetic sense and the ability to create inspired forms — whether in art, architecture, or relationships. You stand out wherever you go.",
    deity: "Vishvakarma — the divine architect and craftsman of the gods",
    remedy: "Worship Vishvakarma and develop a creative practice. Wear bright or multi-coloured clothing to honour your Nakshatra energy. Avoid materialism; channel beauty toward spiritual expression."
  },
  Swati: {
    meaning: "The Sword / Independent",
    personality: "You are independent, diplomatic, and remarkably adaptable. Swati natives are like the wind — impossible to pin down yet able to move through any space. You have excellent business instincts and the ability to negotiate from a position of grace.",
    deity: "Vayu — the wind god, representing movement, breath, and freedom",
    remedy: "Meditate on the breath (pranayama) daily. Worship Vayu and Saraswati. Keep your environment clean and airy. Donate to causes supporting freedom and education."
  },
  Vishakha: {
    meaning: "The Forked Branch / The Goal-Oriented",
    personality: "You are determined, ambitious, and never satisfied with half-measures. Vishakha natives pursue their goals with extraordinary focus and do not rest until they achieve what they set out to accomplish. You are a natural achiever.",
    deity: "Indra and Agni — the gods of power, achievement, and transformation",
    remedy: "Worship Lord Indra and Agni (fire). Perform fire ceremonies (Homa) for success. Avoid resentment and jealousy — channel competitive energy toward personal excellence."
  },
  Anuradha: {
    meaning: "Following Radha / Success After Effort",
    personality: "You are devoted, collaborative, and capable of extraordinary friendship and loyalty. Anuradha natives build deep bonds and have the ability to succeed through cooperation. Your emotional intelligence and organizational skills are exceptional.",
    deity: "Mitra — the god of friendship, contracts, and cosmic order",
    remedy: "Cultivate deep friendships and honour your commitments. Worship Mitra (the Sun in its friendly aspect) on Sundays. Offer sandalwood and flowers."
  },
  Jyeshtha: {
    meaning: "The Eldest / The Chief",
    personality: "You carry natural authority and a deep sense of responsibility. Jyeshtha natives are the protectors and guardians of their circle. You have exceptional willpower and are often called upon to bear burdens others cannot. Leadership comes naturally.",
    deity: "Indra — the king of the gods, who governs through strength and wisdom",
    remedy: "Worship Lord Indra and Vishnu. Protect and care for younger siblings and those under your care. Perform charity on Tuesdays. Avoid pride and arrogance."
  },
  Moola: {
    meaning: "The Root",
    personality: "You are drawn to the root of all things — ultimate truth, hidden power, and the foundations beneath surface reality. Moola natives have extraordinary investigative minds and the courage to dismantle what is false. You bring transformation wherever you go.",
    deity: "Nirrti — the goddess of dissolution and breaking what must be broken",
    remedy: "Worship Kali and Durga for protection. Perform ancestral rites. Avoid accumulating what you do not need. Ground yourself in nature — walk barefoot on earth regularly."
  },
  "Purva Ashadha": {
    meaning: "The Undefeated / The Early Victor",
    personality: "You are invigorating, persuasive, and filled with vitality. Purva Ashadha natives have the ability to revive situations and inspire others. You are a natural teacher and motivator, and your enthusiasm is genuinely contagious.",
    deity: "Apas — the goddess of water, purification, and invincibility",
    remedy: "Worship Goddess Lakshmi and water deities. Take ritual baths at sacred rivers or water bodies. Offer water and white flowers. Stay well-hydrated and nurture your physical vitality."
  },
  "Uttara Ashadha": {
    meaning: "The Latter Victor / The Universal Star",
    personality: "You are noble, principled, and built for lasting victory. Uttara Ashadha natives achieve through righteousness rather than cunning. You have exceptional integrity and the persistence to see any worthy project through to its conclusion.",
    deity: "Vishvedeva — the ten universal gods who embody all virtues",
    remedy: "Live by your principles without compromise. Worship Lord Vishnu and offer Tulsi leaves. Perform charitable acts quietly. Practice universal compassion in daily life."
  },
  Shravana: {
    meaning: "The Ear / The Listener",
    personality: "You are a gifted listener, learner, and transmitter of knowledge. Shravana natives absorb wisdom wherever they go and have the rare ability to connect seemingly unrelated ideas. You travel far — physically and mentally — in your quest for understanding.",
    deity: "Vishnu — the preserver and maintainer of cosmic order",
    remedy: "Study sacred texts and share knowledge freely. Worship Lord Vishnu on Ekadashi. Listen more than you speak. Chant Vishnu Sahasranama for blessings."
  },
  Dhanishtha: {
    meaning: "The Wealthiest / The Drum",
    personality: "You have a natural rhythm for success and prosperity. Dhanishtha natives are blessed with musical sensitivity and the ability to move in harmony with cosmic timing. You attract material abundance and have strong leadership qualities.",
    deity: "Eight Vasus — the elemental gods of abundance and cosmic harmony",
    remedy: "Practice music or dance as a spiritual discipline. Worship the eight directions (Ashtadikpalas). Donate generously; wealth flows through you when shared."
  },
  Shatabhisha: {
    meaning: "One Hundred Healers / The Veiling Star",
    personality: "You are a healer, researcher, and keeper of hidden knowledge. Shatabhisha natives have extraordinary healing abilities and a scientific, investigative mind. You often work behind the scenes but your impact is vast and lasting.",
    deity: "Varuna — the god of cosmic law, oceans, and the hidden mysteries",
    remedy: "Meditate on water and practice purification rituals. Worship Varuna and Shiva. Study healing sciences — herbal medicine, astrology, or yoga. Maintain secrecy around your spiritual practices."
  },
  "Purva Bhadrapada": {
    meaning: "The Former Auspicious Feet",
    personality: "You carry fierce spiritual intensity beneath a calm exterior. Purva Bhadrapada natives have the power to burn through karma and undergo extraordinary transformation. You see through the material world to the fire that underlies it.",
    deity: "Aja Ekapad — the one-footed god associated with fire, storms, and purification",
    remedy: "Worship Rudra and perform fire ceremonies. Practise intense meditation or yoga. Avoid materialism and cultivate detachment. Channel your intensity into spiritual practice."
  },
  "Uttara Bhadrapada": {
    meaning: "The Latter Auspicious Feet",
    personality: "You are deep, wise, and carry the compassion of someone who has walked many lifetimes. Uttara Bhadrapada natives have extraordinary depth of character and the ability to see through the cycle of karma and rebirth. You bring profound peace wherever you go.",
    deity: "Ahir Budhnya — the serpent of the deep, representing kundalini and hidden wisdom",
    remedy: "Meditate and pray for liberation. Worship Lord Shiva and practice deep pranayama. Care for elderly and those nearing the end of life. Chant the Mahamrityunjaya Mantra daily."
  },
  Revati: {
    meaning: "The Wealthy / The Prosperous",
    personality: "You are boundless, compassionate, and carry the gentleness of someone who has completed a great journey. Revati is the final Nakshatra — the completion of the cycle. You have a gift for guiding others and connecting the material and spiritual worlds.",
    deity: "Pushan — the god who nourishes, guides souls, and protects travellers",
    remedy: "Feed the poor and animals. Worship Vishnu and offer Tulsi leaves and milk. Be a guide and mentor to those who are lost. Practice compassion without attachment to outcome."
  }
};

// ──────────────── Planet Descriptions ────────────────
export const PLANET_DESCRIPTIONS: Record<string, { significations: string; keywords: string }> = {
  Sun: { significations: "Soul, father, authority, government, health, vitality, ego, career, fame, leadership", keywords: "Soul · Father · Authority · Vitality · Fame" },
  Moon: { significations: "Mind, mother, emotions, intuition, public, water, travel, home, happiness", keywords: "Mind · Mother · Emotions · Home · Happiness" },
  Mars: { significations: "Energy, courage, siblings, land, conflicts, surgery, military, passion, ambition", keywords: "Energy · Courage · Action · Ambition · Siblings" },
  Mercury: { significations: "Intelligence, communication, business, skin, education, trade, writing, youthfulness", keywords: "Intelligence · Communication · Business · Education" },
  Jupiter: { significations: "Wisdom, teacher, children, wealth, expansion, dharma, philosophy, fortune", keywords: "Wisdom · Fortune · Children · Expansion · Dharma" },
  Venus: { significations: "Love, beauty, marriage, arts, luxury, vehicles, pleasures, creativity, partner", keywords: "Love · Beauty · Marriage · Arts · Pleasures" },
  Saturn: { significations: "Discipline, karma, delays, service, longevity, old age, servants, restrictions, wisdom through experience", keywords: "Discipline · Karma · Patience · Longevity" },
  Rahu: { significations: "Illusion, foreign connections, technology, obsession, sudden events, unconventional paths", keywords: "Innovation · Foreign · Ambition · Illusion" },
  Ketu: { significations: "Spirituality, liberation, past lives, detachment, mysticism, research, sudden separation", keywords: "Spirituality · Liberation · Mysticism · Past lives" }
};

// ──────────────── House Descriptions ────────────────
export const HOUSE_DESCRIPTIONS: string[] = [
  "The First House (Lagna) governs your physical body, personality, and how the world perceives you. It represents the beginning of all things — your approach to life, vitality, and the overall direction of your existence.",
  "The Second House (Dhana) governs accumulated wealth, family, speech, food, and early education. It represents what you hold close — your resources, values, and the quality of your voice.",
  "The Third House (Parakrama) governs courage, communication, siblings, short journeys, skills, and media. It represents your will to act and connect with the world immediately around you.",
  "The Fourth House (Sukha) governs home, mother, property, vehicles, education, and inner peace. It represents your roots, your comfort, and the foundation on which your life is built.",
  "The Fifth House (Putra) governs children, creativity, intelligence, romance, speculation, and past-life merits. It represents your joy, your creations, and your ability to love.",
  "The Sixth House (Shatru) governs enemies, disease, debt, service, daily work, and obstacles. It represents the challenges you must overcome and the service you render.",
  "The Seventh House (Kalatra) governs marriage, partnerships, business associates, and open enemies. It represents your complement — what you seek in others to make yourself whole.",
  "The Eighth House (Ayu) governs longevity, inheritance, transformation, hidden matters, occult, and sudden events. It represents death, rebirth, and the deepest mysteries of life.",
  "The Ninth House (Dharma) governs fortune, father, spirituality, higher education, long journeys, and divine grace. It represents your dharma and your connection to the sacred.",
  "The Tenth House (Karma) governs career, social status, government, public life, and your contribution to society. It represents your highest calling and worldly achievement.",
  "The Eleventh House (Labha) governs gains, income, elder siblings, friends, social networks, and fulfilment of desires. It represents what flows to you as reward for your efforts.",
  "The Twelfth House (Vyaya) governs expenses, losses, foreign lands, liberation, spirituality, sleep, and the subconscious. It represents what you release and what lies beyond the material."
];

// ──────────────── Dasha Planet Predictions ────────────────
export const DASHA_PREDICTIONS: Record<string, { general: string; opportunities: string; cautions: string }> = {
  Sun: {
    general: "The Sun Mahadasha brings focus on identity, authority, and the soul's true purpose. This is a period of recognition and assuming your rightful place in the world. Government dealings, career advancement, and matters involving the father figure become prominent.",
    opportunities: "Career advancement, gaining recognition and honour, strong leadership opportunities, improved vitality and physical health, connection with powerful or influential people.",
    cautions: "Guard against ego inflation and arrogance. Health of the heart and eyes needs attention. Relationships with authority figures may be tested. Avoid conflicts with government or father."
  },
  Moon: {
    general: "The Moon Mahadasha brings fluctuations of emotion, heightened intuition, and deepening of family bonds. Your inner life becomes rich and vivid. The public, women, and the mother take on special significance during this period.",
    opportunities: "Deepening emotional intelligence, flourishing family relationships, success in public-facing work, travel near water, strong intuitive guidance in decision-making.",
    cautions: "Guard against emotional volatility and anxiety. Take care of the mother's health. Avoid making major decisions during periods of emotional overwhelm. Rest and nurture yourself."
  },
  Mars: {
    general: "The Mars Mahadasha is a period of intense energy, ambition, and decisive action. You will feel driven to achieve and willing to take risks. Conflicts may arise, but so does the courage to face them. Siblings, land, and property matters are highlighted.",
    opportunities: "Extraordinary drive and initiative, success in competitive fields, property gains, courage to start new ventures, physical strength and vitality at a peak.",
    cautions: "Guard against aggression, recklessness, and accidents. Health issues related to blood and excess heat may arise. Legal disputes are possible — avoid confrontational approaches."
  },
  Rahu: {
    general: "The Rahu Mahadasha is a period of rapid, sometimes unexpected change and unconventional growth. Foreign connections, technology, and non-traditional paths may open unexpectedly. Illusion and obsession are both possible — clarity of purpose is essential.",
    opportunities: "Unusual opportunities from foreign sources or technology, sudden recognition, breaking through limitations, connecting with diverse networks, innovative thinking.",
    cautions: "Guard against deception — from others and from yourself. Health may be affected by toxic substances or unusual ailments. Ground yourself spiritually to navigate this intensely karmic period."
  },
  Jupiter: {
    general: "The Jupiter Mahadasha is one of the most blessed periods — expansion, wisdom, and divine grace flow naturally. Knowledge, children, wealth, and spiritual growth are all illuminated. Teachers and mentors appear at the right moment.",
    opportunities: "Wealth expansion, educational advancement, spiritual growth, children and family blessings, improved social standing, opportunities in teaching, law, or philosophy.",
    cautions: "Avoid over-expansion and over-confidence. Excessive optimism may lead to poor financial planning. Health issues related to fat and liver may arise. Do not neglect details in your enthusiasm."
  },
  Saturn: {
    general: "The Saturn Mahadasha is a long period of disciplined effort, karmic reckoning, and eventual lasting achievement. What you build now will endure. Patience and perseverance are your greatest tools. This period matures the soul significantly.",
    opportunities: "Building lasting structures in career and relationships, karmic clearing, significant long-term success through persistence, wisdom gained through experience, spiritual depth.",
    cautions: "Guard against depression and isolation. Health of bones, teeth, and joints needs care. Progress will be slow but real — avoid shortcuts. Relationships require patience and commitment."
  },
  Mercury: {
    general: "The Mercury Mahadasha brings intellectual brilliance, communicative gifts, and commercial success. Learning, writing, business, and youthful energy characterise this period. Your mind is at its sharpest and your networking ability is extraordinary.",
    opportunities: "Educational success, business growth, writing or publishing opportunities, strong analytical ability, travel, and connections that advance your goals.",
    cautions: "Guard against over-intellectualisation and analysis paralysis. Anxiety and nervous system issues are possible. Avoid spreading yourself too thin across too many pursuits."
  },
  Ketu: {
    general: "The Ketu Mahadasha is a deeply spiritual period that draws you inward. Detachment from material concerns increases — sometimes gradually, sometimes through sudden separations. Past-life karma surfaces for resolution. Mystical experiences are common.",
    opportunities: "Spiritual breakthroughs, deep meditation and introspection, liberation from unhealthy attachments, research into occult or healing sciences, unexpected gifts from past-life merits.",
    cautions: "Guard against complete withdrawal from worldly responsibilities. Unexplained health issues may arise — seek both medical and spiritual remedies. Ground yourself through service."
  },
  Venus: {
    general: "The Venus Mahadasha is among the most pleasurable and creative periods of life. Love, beauty, arts, comfort, and luxury come naturally. Relationships flourish and material abundance grows. This is a period to enjoy life's gifts with gratitude.",
    opportunities: "Marriage or deepening of romantic relationships, artistic success, financial growth, acquisition of vehicles and comforts, social flourishing, creative excellence.",
    cautions: "Guard against overindulgence in pleasure and luxury. Financial extravagance may leave you vulnerable. Keep health of reproductive system and kidneys in check. Maintain boundaries in relationships."
  }
};

// ──────────────── Yoga Combinations ────────────────
export function getYogas(lagnSign: string, moonSign: string, sunSign: string, dashaLord: string): string[] {
  const yogas: string[] = [];

  if (lagnSign === moonSign) yogas.push("Lagna-Chandra Yoga: Moon in the Ascendant gives exceptional popularity, emotional intelligence, and public favour.");
  if (lagnSign === sunSign) yogas.push("Surya Lagna Yoga: Sun in the Ascendant gives royal bearing, leadership ability, and strong vitality.");
  if (dashaLord === "Jupiter") yogas.push("Guru Dasha: The current Jupiter period activates wisdom, fortune, and spiritual expansion — one of the most auspicious Mahadasha periods.");
  if (dashaLord === "Venus") yogas.push("Shukra Dasha: The current Venus period brings prosperity, love, creative fulfilment, and material abundance.");

  // Always include some standard yogas based on signs
  if (["Leo","Aries","Sagittarius"].includes(lagnSign)) yogas.push("Agni Lagna Yoga: Fire sign ascendant gives natural leadership, courage, and the drive to achieve great things.");
  if (["Cancer","Scorpio","Pisces"].includes(lagnSign)) yogas.push("Jala Lagna Yoga: Water sign ascendant gives deep intuition, emotional intelligence, and psychic sensitivity.");
  if (["Taurus","Virgo","Capricorn"].includes(lagnSign)) yogas.push("Prithvi Lagna Yoga: Earth sign ascendant gives practical intelligence, material success, and steadfast determination.");
  if (["Gemini","Libra","Aquarius"].includes(lagnSign)) yogas.push("Vayu Lagna Yoga: Air sign ascendant gives exceptional communication, social intelligence, and intellectual brilliance.");

  yogas.push("Kala Purusha Yoga: Your birth at a time when multiple planets were in dignified positions creates an inherent strength and resilience in navigating life's challenges.");

  return yogas;
}

// ──────────────── Lucky Numbers, Gems, Colors ────────────────
export const LUCKY_INFO: Record<string, { numbers: string; gem: string; colors: string; metal: string; day: string; mantra: string; rudraksha: string; offerings: string; avoid: string }> = {
  Sun: { numbers: "1, 10, 19", gem: "Ruby", colors: "Gold, Orange, Red", metal: "Gold", day: "Sunday", mantra: "Om Suryaya Namah", rudraksha: "12 Mukhi Rudraksha", offerings: "Wheat, jaggery, red flowers, copper water at sunrise", avoid: "ego conflicts, harsh speech, disrespect toward father figures" },
  Moon: { numbers: "2, 11, 20", gem: "Pearl or White Moonstone", colors: "White, Silver, Light Blue", metal: "Silver", day: "Monday", mantra: "Om Som Somaya Namah", rudraksha: "2 Mukhi Rudraksha", offerings: "Milk, white rice, white flowers, moon gazing on Mondays", avoid: "emotional overreaction, poor sleep cycles, excessive worry" },
  Mars: { numbers: "9, 18, 27", gem: "Red Coral", colors: "Red, Maroon, Rust", metal: "Copper", day: "Tuesday", mantra: "Om Angarakaya Namah", rudraksha: "3 Mukhi Rudraksha", offerings: "Red lentils, sindoor, Hanuman prayers, disciplined exercise", avoid: "impulsive anger, accidents, rushed financial decisions" },
  Mercury: { numbers: "5, 14, 23", gem: "Emerald or Green Tourmaline", colors: "Green, Grey, Mix", metal: "Bronze", day: "Wednesday", mantra: "Om Budhaya Namah", rudraksha: "4 Mukhi Rudraksha", offerings: "Green moong, tulsi, study discipline, mantra recitation at dawn", avoid: "overthinking, scattered focus, careless communication" },
  Jupiter: { numbers: "3, 12, 21", gem: "Yellow Sapphire", colors: "Yellow, Gold, Cream", metal: "Gold", day: "Thursday", mantra: "Om Gurave Namah", rudraksha: "5 Mukhi Rudraksha", offerings: "Turmeric, chana dal, yellow cloth, guru seva", avoid: "broken promises, arrogance in advice, spiritual laziness" },
  Venus: { numbers: "6, 15, 24", gem: "Diamond or White Sapphire", colors: "White, Pink, Light Blue", metal: "Silver", day: "Friday", mantra: "Om Shukraya Namah", rudraksha: "6 Mukhi Rudraksha", offerings: "Fragrant flowers, curd rice, sweets, clean clothing", avoid: "relationship excess, overspending, indulgence without balance" },
  Saturn: { numbers: "8, 17, 26", gem: "Blue Sapphire", colors: "Dark Blue, Black, Purple", metal: "Iron", day: "Saturday", mantra: "Om Shanaischaraya Namah", rudraksha: "7 Mukhi Rudraksha", offerings: "Sesame oil, black sesame, service to elders and workers", avoid: "delay through negligence, pessimism, debt-heavy choices" },
  Rahu: { numbers: "4, 13, 22", gem: "Hessonite Garnet", colors: "Dark Blue, Ultraviolet, Brown", metal: "Lead", day: "Saturday", mantra: "Om Rahave Namah", rudraksha: "8 Mukhi Rudraksha", offerings: "Coconut, smoke cleansing, Durga prayers, disciplined boundaries", avoid: "obsession, illusion-driven decisions, risky speculation" },
  Ketu: { numbers: "7, 16, 25", gem: "Cat's Eye", colors: "Smoky Grey, Mixed, Variegated", metal: "Iron", day: "Tuesday", mantra: "Om Ketave Namah", rudraksha: "9 Mukhi Rudraksha", offerings: "Incense, saffron tilak, Ganapati worship, silence practice", avoid: "detachment from duties, confusion, spiritual escapism" }
};

export const DASHA_REMEDY_GUIDES: Record<string, {
  deity: string;
  morningPrayer: string;
  mantra: string;
  chanting: string;
  digitalYantra: number[][];
  yantraNote: string;
  pooja: string;
  fasting: string;
  dress: string;
  bhajan: string;
  offerings: string;
}> = {
  Sun: {
    deity: "Surya Narayana",
    morningPrayer: "Rise before or near sunrise, face east, offer clean water to the Sun, and recite Aditya Hridayam or a short Surya stuti with gratitude for clarity and authority.",
    mantra: "Om Hraam Hreem Hraum Suryaya Namah",
    chanting: "Chant 108 times on Sundays, or 27 times daily during sunrise for steady confidence, vitality, and career illumination.",
    digitalYantra: [[6, 1, 8], [7, 5, 3], [2, 9, 4]],
    yantraNote: "Keep the Surya yantra in your prayer corner, work desk, or wallet card after energizing it on a Sunday morning.",
    pooja: "Offer red flowers, jaggery, wheat, and a copper diya. Respect father figures, mentors, and people in authority.",
    fasting: "Observe a light Sunday discipline by reducing salt or heavy food and staying mindful of ego, anger, and harsh speech.",
    dress: "Wear clean shades of saffron, gold, orange, or warm red on key Sun-related days and important public events.",
    bhajan: "Listen to or sing Surya bhajans, Gayatri chants, or Aditya stotras to strengthen leadership, courage, and inner steadiness.",
    offerings: "Copper water, wheat, jaggery, red flowers, and service done in honor of your father, guru, or a dignified elder."
  },
  Moon: {
    deity: "Chandra Deva / Divine Mother",
    morningPrayer: "Begin the day with calm breathwork, a glass of water, and a gentle Moon prayer asking for peace, emotional stability, and maternal blessings.",
    mantra: "Om Som Somaya Namah",
    chanting: "Chant 108 times on Mondays, or 11 times before sleep when the mind feels emotionally heavy or restless.",
    digitalYantra: [[4, 9, 2], [3, 5, 7], [8, 1, 6]],
    yantraNote: "Place the Chandra yantra near your bedside or altar to support restful sleep, intuition, and emotional clarity.",
    pooja: "Offer milk, white rice, sandal paste, and white flowers. Honor the mother, maternal elders, and sacred feminine energies.",
    fasting: "Observe a mild Monday fast with sattvic food, reduced stimulants, and extra care around sleep and emotional reactivity.",
    dress: "Wear white, silver, cream, pearl, or soft sky-blue when you need calmness, receptivity, or healing energy.",
    bhajan: "Listen to Devi bhajans, Lalita Sahasranama recitation, or soothing Chandra mantras to cool the emotional body.",
    offerings: "Milk, white sweets, white flowers, silver vessels, and acts of nurturing toward family, children, and vulnerable people."
  },
  Mars: {
    deity: "Hanuman / Subrahmanya / Mangala",
    morningPrayer: "Start the day with an energizing prayer to Hanuman or Subrahmanya, asking for courage, discipline, strength, and protection from conflict.",
    mantra: "Om Angarakaya Namah",
    chanting: "Chant 108 times on Tuesdays, or 21 times before important decisions requiring courage, clarity, or decisive action.",
    digitalYantra: [[8, 1, 6], [3, 5, 7], [4, 9, 2]],
    yantraNote: "Keep the Mangala yantra in a disciplined sacred space or carry it during periods of disputes, property work, or legal pressure.",
    pooja: "Offer red flowers, betel leaves, sindoor, and prayers to Hanuman. Physical discipline and respectful action are part of the remedy.",
    fasting: "Observe Tuesday discipline by reducing spice, anger, and impulsive speech. A simple fast or one sattvic meal is supportive.",
    dress: "Wear maroon, rust, red, or copper-toned clothing when you need confidence, stamina, and protection from aggression.",
    bhajan: "Hanuman Chalisa, Subrahmanya bhajans, and Mangal stotras work best when done with physical discipline and sincerity.",
    offerings: "Red lentils, sindoor, red cloth, disciplined exercise, and service connected to protection, courage, or temple upkeep."
  },
  Mercury: {
    deity: "Vishnu / Narayana / Budha",
    morningPrayer: "Begin with a short Vishnu prayer and a clear written intention for speech, learning, and wise decisions throughout the day.",
    mantra: "Om Budhaya Namah",
    chanting: "Chant 108 times on Wednesdays, or 21 times before study, business meetings, negotiations, writing, or important travel.",
    digitalYantra: [[8, 3, 4], [1, 5, 9], [6, 7, 2]],
    yantraNote: "Place the Budha yantra near books, accounts, communication devices, or your work setup to support focus and speech.",
    pooja: "Offer green moong, tulsi leaves, and light incense. Keep your study or work area neat as part of the remedy itself.",
    fasting: "Observe a light Wednesday fast or dietary restraint focused on clarity, reduced gossip, and disciplined communication.",
    dress: "Wear green, grey, leafy tones, or subtle mixed colors to support intelligence, adaptability, and calm decision-making.",
    bhajan: "Vishnu Sahasranama, Budha stotras, and Saraswati bhajans are favorable for speech, memory, and analytical precision.",
    offerings: "Green moong, tulsi, notebooks for donation, education support, and disciplined study or journaling at dawn."
  },
  Jupiter: {
    deity: "Brihaspati / Guru / Vishnu",
    morningPrayer: "Offer gratitude to your teachers and recite a Guru prayer at sunrise or after bathing to invite wisdom, grace, and expansion.",
    mantra: "Om Gurave Namah",
    chanting: "Chant 108 times on Thursdays, or 16 times daily when seeking guidance, blessings, fertility, prosperity, or dharmic direction.",
    digitalYantra: [[3, 5, 7], [8, 1, 6], [4, 9, 2]],
    yantraNote: "Keep the Guru yantra near your altar, study table, or puja books to support blessings from teachers and sacred learning.",
    pooja: "Offer turmeric, yellow flowers, banana, ghee lamp, and prayers to Guru, Vishnu, or Dakshinamurthy.",
    fasting: "Observe a gentle Thursday vrata with yellow foods, humility, and one meaningful act of guru-seva, teaching, or charity.",
    dress: "Wear yellow, gold, mustard, cream, or saffron on Thursdays and during spiritual study, teaching, or wealth-related efforts.",
    bhajan: "Guru stotras, Vishnu bhajans, and Brihaspati chants deepen faith, wisdom, and benefic outcomes in family and finance.",
    offerings: "Turmeric, chana dal, yellow cloth, scriptures, donations to teachers, and acts of guidance done with humility."
  },
  Venus: {
    deity: "Mahalakshmi / Parashakti / Shukra",
    morningPrayer: "Begin with a Lakshmi prayer for harmony, beauty, grace, clean relationships, and refined prosperity in daily life.",
    mantra: "Om Shukraya Namah",
    chanting: "Chant 108 times on Fridays, or 16 times daily to improve relationships, comforts, arts, and financial softness.",
    digitalYantra: [[4, 9, 2], [8, 1, 6], [3, 5, 7]],
    yantraNote: "Place the Shukra yantra in a clean, beautiful space, dressing area, or altar where it can receive fragrance and light.",
    pooja: "Offer fragrant flowers, sweets, curd rice, white cloth, and prayers to Lakshmi or Devi with a clean and graceful environment.",
    fasting: "Observe a graceful Friday discipline by reducing excess pleasure, wasteful spending, and relationship drama.",
    dress: "Wear white, pink, silver, pastel blue, or elegant refined fabrics to harmonize Venus energy in social and romantic spaces.",
    bhajan: "Lakshmi Ashtakam, Devi bhajans, and Shukra stotras support love, creativity, luxury with balance, and peaceful partnerships.",
    offerings: "White sweets, flowers, fragrance, good clothing, beauty with modesty, and support for women or arts-related causes."
  },
  Saturn: {
    deity: "Shani Dev / Kala Bhairava / Hanuman",
    morningPrayer: "Offer a serious, humble morning prayer asking for patience, karmic maturity, protection from delays, and the strength to endure responsibly.",
    mantra: "Om Shanaischaraya Namah",
    chanting: "Chant 108 times on Saturdays, or 23 times daily during periods of pressure, delay, financial heaviness, or emotional isolation.",
    digitalYantra: [[4, 3, 8], [9, 5, 1], [2, 7, 6]],
    yantraNote: "Keep the Shani yantra in your altar, near the entrance, or in a disciplined workspace after energizing it on a Saturday.",
    pooja: "Offer sesame oil, black sesame, dark blue flowers, iron, and prayers to Shani Dev. Hanuman worship is highly protective here.",
    fasting: "Observe a Saturday vrata with restraint, simple food, service to elders, and serious karmic accountability in speech and money.",
    dress: "Wear dark blue, black, indigo, or deep purple with simplicity and humility rather than showiness.",
    bhajan: "Shani stotras, Hanuman Chalisa, Kala Bhairava prayers, and slow repetitive chanting help calm fear, delay, and karmic pressure.",
    offerings: "Sesame oil, black sesame, blankets, footwear, labor support, feeding crows, and direct service to workers or elders."
  },
  Rahu: {
    deity: "Durga / Bhairava / Rahu",
    morningPrayer: "Begin with grounding breath, a Durga or Bhairava prayer, and a conscious resolve to avoid illusion, haste, and compulsive choices.",
    mantra: "Om Rahave Namah",
    chanting: "Chant 108 times on Saturdays or during Rahu Kala only if done calmly and with proper reverence, not fear.",
    digitalYantra: [[2, 7, 6], [9, 5, 1], [4, 3, 8]],
    yantraNote: "Place the Rahu yantra in a protected spiritual corner and use it for grounding during obsession, confusion, foreign pressure, or instability.",
    pooja: "Offer coconut, blue or smoky flowers, incense, and prayers to Durga. Smoke cleansing and strong boundaries are part of the remedy.",
    fasting: "Observe disciplined restraint on Saturdays or during key Rahu periods by avoiding intoxication, gossip, risky speculation, and chaos.",
    dress: "Wear grounded dark blue, smoky grey, brown, or muted shades rather than flashy or overstimulating combinations.",
    bhajan: "Durga Chalisa, Bhairava bhajans, and Rahu stotras help cut confusion and strengthen courage against illusion and anxiety.",
    offerings: "Coconut, incense, smoke cleansing, Durga worship, protection prayers, and strict mental boundaries around unhealthy influences."
  },
  Ketu: {
    deity: "Ganesha / Subrahmanya / Ketu",
    morningPrayer: "Begin with a short Ganesha prayer for obstacle removal, clarity, and disciplined spiritual direction before entering the day.",
    mantra: "Om Ketave Namah",
    chanting: "Chant 108 times on Tuesdays or 18 times before meditation, silence practice, or spiritual study.",
    digitalYantra: [[7, 2, 9], [8, 6, 1], [3, 4, 5]],
    yantraNote: "Keep the Ketu yantra in a meditation corner, prayer book, or quiet sacred space to support detachment with clarity rather than confusion.",
    pooja: "Offer saffron tilak, incense, durva grass, and prayers to Ganesha or Subrahmanya for protection from confusion and sudden detours.",
    fasting: "Observe a disciplined Tuesday fast or a reduced-food spiritual day focused on silence, prayer, and simplifying unnecessary attachments.",
    dress: "Wear smoky grey, earthy tones, saffron accents, or simple spiritual clothing that supports inwardness and clarity.",
    bhajan: "Ganesha bhajans, Subrahmanya songs, and Ketu stotras are useful when life feels fragmented, detached, or directionless.",
    offerings: "Incense, saffron, silence practice, Ganapati worship, feeding stray animals, and reducing clutter in the home or altar."
  }
};
