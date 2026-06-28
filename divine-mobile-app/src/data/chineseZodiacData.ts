export interface ChineseZodiacSign {
  slug: string;
  name: string;
  chineseCharacter: string;
  years: number[];
  element2026Tone: string;
  shortDescription: string;
  personality: string;
  strengths: string[];
  challenges: string[];
  luckyColors: string[];
  luckyNumbers: number[];
  compatibleSigns: string[];
  challengingSigns: string[];
  yearlyGuidance2026: {
    overview: string;
    success: string;
    caution: string;
    opportunity: string;
    relationship: string;
    career: string;
    money: string;
    health: string;
    spiritualAdvice: string;
    mantraStyleAffirmation: string;
  };
  cards: {
    icon: string;
    title: string;
    text: string;
  }[];
}

export const chineseYear2026 = {
  year: 2026,
  animal: "Horse",
  element: "Fire",
  label: "Year of the Fire Horse",
  startsOn: "2026-02-17",
  theme: "Movement, courage, visibility, discipline, and bold transformation",
  description:
    "The Fire Horse year brings energetic movement, ambition, independence, and fast decisions. The guidance should encourage courage but warn against impatience and burnout."
};

export const chineseZodiacData: ChineseZodiacSign[] = [
  {
    slug: "rat",
    name: "Rat",
    chineseCharacter: "鼠",
    years: [1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020, 2032],
    element2026Tone: "Water (interacting with Year's Fire)",
    shortDescription: "Quick-witted, resourceful, versatile, and kind.",
    personality: "Rats are highly intelligent, adaptable, and naturally curious. They possess excellent observational skills and are highly valued for their resourcefulness in solving complex problems.",
    strengths: ["Intellectual", "Resourceful", "Adaptable", "Charming"],
    challenges: ["Secretive", "Critical", "Stubborn", "Anxious"],
    luckyColors: ["Blue", "Gold", "Green"],
    luckyNumbers: [2, 3],
    compatibleSigns: ["Ox", "Dragon", "Monkey"],
    challengingSigns: ["Horse"],
    yearlyGuidance2026: {
      overview: "The Fire Horse year presents a clash relationship for the Rat. Staying low-profile, practicing adaptability, and avoiding direct conflicts may support progress.",
      success: "Focus on maintaining stability and polishing current skills rather than expanding outward.",
      caution: "Avoid high-risk financial decisions and impulsive arguments in professional circles.",
      opportunity: "Opportunities exist in quiet self-improvement, study, and behind-the-scenes projects.",
      relationship: "Communication requires patience. Listen deeply to defuse minor misunderstandings.",
      career: "Maintain your current position and focus on detail-oriented work. Patience is your greatest ally.",
      money: "Prioritize savings. This is a year for conservative wealth preservation rather than speculation.",
      health: "Ensure adequate rest to calm the mind. Meditation and grounding practices can help relieve stress.",
      spiritualAdvice: "Cultivate inner silence. Letting go of the need to control external events will bring peace.",
      mantraStyleAffirmation: "I flow gracefully with the tides of life, anchored in patience and inner peace."
    },
    cards: [
      { icon: "Shield", title: "Success", text: "Maintain current stability and polish skills quietly." },
      { icon: "AlertTriangle", title: "Avoid", text: "High-risk financial decisions and direct arguments." },
      { icon: "TrendingUp", title: "Opportunity", text: "Behind-the-scenes research and self-improvement." },
      { icon: "Heart", title: "Relationship", text: "Practice active listening to dissolve friction." },
      { icon: "Briefcase", title: "Career", text: "Patience and diligence in detail-oriented tasks." },
      { icon: "Coins", title: "Money", text: "Consolidate savings; avoid speculative bets." },
      { icon: "Activity", title: "Health", text: "Grounding exercises to ease nervous tension." },
      { icon: "Sparkles", title: "Spiritual", text: "Release control and embrace the flow of time." }
    ]
  },
  {
    slug: "ox",
    name: "Ox",
    chineseCharacter: "牛",
    years: [1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021, 2033],
    element2026Tone: "Earth (fed by Year's Fire)",
    shortDescription: "Diligent, dependable, strong, and determined.",
    personality: "The Ox represents stability, integrity, and strong willpower. Honest and dependable, they inspire trust and achieve success through steady, methodical effort.",
    strengths: ["Loyal", "Patient", "Methodical", "Resilient"],
    challenges: ["Obstinate", "Quiet", "Demanding", "Slow to change"],
    luckyColors: ["White", "Yellow", "Green"],
    luckyNumbers: [1, 9],
    compatibleSigns: ["Rat", "Snake", "Rooster"],
    challengingSigns: ["Goat", "Horse"],
    yearlyGuidance2026: {
      overview: "The Fire Horse year warms the Earth element of the Ox, bringing vitality and creative impulses. However, the fast-paced Horse energy can clash with your steady nature.",
      success: "Slow down and match the speed of events by planning ahead, keeping yourself flexible.",
      caution: "Avoid becoming stubborn when changes occur. Flexibility is your shield.",
      opportunity: "Excellent opportunities for creative projects, home renovations, and learning.",
      relationship: "Honesty and shared goals strengthen bonds. Be open to minor adjustments in routine.",
      career: "Steady progress is highlighted. Do not let the fast pace of coworkers pressure you into rushing.",
      money: "Moderate gains are possible. Focus on tangible assets and long-term security.",
      health: "Maintain a steady sleep routine and guard against physical exhaustion.",
      spiritualAdvice: "Practice mindfulness in transitions. Allow change to happen without resisting.",
      mantraStyleAffirmation: "I am flexible and strong, adapting steadily to the changes around me."
    },
    cards: [
      { icon: "Shield", title: "Success", text: "Adapt steadily to changes by remaining flexible." },
      { icon: "AlertTriangle", title: "Avoid", text: "Digging in your heels when circumstances shift." },
      { icon: "TrendingUp", title: "Opportunity", text: "Creative pursuits, home building, and learning." },
      { icon: "Heart", title: "Relationship", text: "Align on shared long-term family goals." },
      { icon: "Briefcase", title: "Career", text: "Work at your own pace; do not be rushed." },
      { icon: "Coins", title: "Money", text: "Focus on hard assets and secure investments." },
      { icon: "Activity", title: "Health", text: "Consistency in rest and nutrition is key." },
      { icon: "Sparkles", title: "Spiritual", text: "Embrace the beauty of gradual transformation." }
    ]
  },
  {
    slug: "tiger",
    name: "Tiger",
    chineseCharacter: "虎",
    years: [1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022, 2034],
    element2026Tone: "Wood (fuels Year's Fire)",
    shortDescription: "Brave, competitive, unpredictable, and self-confident.",
    personality: "Tigers are courageous, passionate, and fiercely independent. They have a commanding presence and are driven by a deep desire for adventure and justice.",
    strengths: ["Courageous", "Charismatic", "Honorable", "Enthusiastic"],
    challenges: ["Impulsive", "Rebellious", "Short-tempered", "Restless"],
    luckyColors: ["Blue", "Grey", "Orange"],
    luckyNumbers: [1, 3, 4],
    compatibleSigns: ["Horse", "Dog", "Pig"],
    challengingSigns: ["Monkey", "Snake"],
    yearlyGuidance2026: {
      overview: "As a natural ally of the Horse, the Tiger benefits from a harmonious alignment in 2026. The Fire element energizes your Wood, bringing strong drive and recognition.",
      success: "Take calculated actions. Your natural courage is amplified—use it with discipline.",
      caution: "Avoid burning out by attempting too much at once. Temper your passions with wisdom.",
      opportunity: "New leadership roles, public speaking, and major personal growth.",
      relationship: "Passionate connections are favored. Guard against taking prideful stances in disagreements.",
      career: "Excellent prospects for career advancement and visibility. Lead with integrity.",
      money: "Strong earning potential, but matches with increased spending. Budget wisely.",
      health: "High energy, but watch for signs of exhaustion or heat-related stress.",
      spiritualAdvice: "Channel your passion into creative and spiritual service to others.",
      mantraStyleAffirmation: "I channel my courage and fire with focus, wisdom, and grace."
    },
    cards: [
      { icon: "Shield", title: "Success", text: "Act with confidence and structured discipline." },
      { icon: "AlertTriangle", title: "Avoid", text: "Burnout and overcommitting your energy." },
      { icon: "TrendingUp", title: "Opportunity", text: "Leadership roles and public recognition." },
      { icon: "Heart", title: "Relationship", text: "Express warmth while remaining humble." },
      { icon: "Briefcase", title: "Career", text: "Advancement is highly supported; step forward." },
      { icon: "Coins", title: "Money", text: "Keep dynamic track of income vs expenditure." },
      { icon: "Activity", title: "Health", text: "Pace your energy; stay cool and hydrated." },
      { icon: "Sparkles", title: "Spiritual", text: "Align your inner drive with selfless service." }
    ]
  },
  {
    slug: "rabbit",
    name: "Rabbit",
    chineseCharacter: "兔",
    years: [1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023, 2035],
    element2026Tone: "Wood (interacting with Year's Fire)",
    shortDescription: "Gentle, quiet, elegant, and alert.",
    personality: "Rabbits are gentle, sensitive, and peace-loving individuals. They possess refined aesthetic tastes, value harmony in all areas of life, and navigate challenges with diplomacy.",
    strengths: ["Diplomatic", "Artistic", "Gentle", "Observant"],
    challenges: ["Hesitant", "Conflict-averse", "Sensitive", "Melancholy"],
    luckyColors: ["Pink", "Purple", "Blue"],
    luckyNumbers: [3, 4, 6],
    compatibleSigns: ["Goat", "Dog", "Pig"],
    challengingSigns: ["Rooster", "Dragon"],
    yearlyGuidance2026: {
      overview: "The Fire Horse year brings a busy and active pace that may feel overwhelming to the gentle Rabbit. Balancing dynamic movement with quiet retreat will be key.",
      success: "Establish clear boundaries and set aside dedicated time for rest and self-care.",
      caution: "Avoid taking on too many social commitments that exhaust your energy.",
      opportunity: "Opportunities to share your artistic talents or offer counsel to others.",
      relationship: "Focus on quality time over quantity. Quiet home evenings bring deep connection.",
      career: "Collaborative projects are favored. Use your diplomacy to navigate workplace changes.",
      money: "Financial stability remains steady if you stick to a balanced budget.",
      health: "Prioritize nervous system health. Soft yoga, walking, and quiet breathing help.",
      spiritualAdvice: "Cultivate your inner sanctuary. Daily quiet time acts as a protective shield.",
      mantraStyleAffirmation: "I protect my peace, moving through a busy world with quiet grace."
    },
    cards: [
      { icon: "Shield", title: "Success", text: "Establish clear boundaries and retreat when needed." },
      { icon: "AlertTriangle", title: "Avoid", text: "Overcommitting to social and work pressures." },
      { icon: "TrendingUp", title: "Opportunity", text: "Creative expression and counseling others." },
      { icon: "Heart", title: "Relationship", text: "Nurture deep, quiet connections at home." },
      { icon: "Briefcase", title: "Career", text: "Use your diplomatic skills to ease office tension." },
      { icon: "Coins", title: "Money", text: "Keep financial habits steady and balanced." },
      { icon: "Activity", title: "Health", text: "Protect your nervous system with calming rituals." },
      { icon: "Sparkles", title: "Spiritual", text: "Rest in the sanctuary of your own heart." }
    ]
  },
  {
    slug: "dragon",
    name: "Dragon",
    chineseCharacter: "龙",
    years: [1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024, 2036],
    element2026Tone: "Earth (supported by Year's Fire)",
    shortDescription: "Confident, intelligent, enthusiastic, and powerful.",
    personality: "Dragons are magnetic, energetic, and ambitious. They possess natural leadership qualities, a strong sense of self, and the courage to pursue bold dreams.",
    strengths: ["Charismatic", "Innovative", "Fearless", "Magnanimous"],
    challenges: ["Domineering", "Impatient", "Uncompromising", "Restless"],
    luckyColors: ["Gold", "Silver", "Grey"],
    luckyNumbers: [1, 6, 7],
    compatibleSigns: ["Rat", "Tiger", "Monkey", "Rooster"],
    challengingSigns: ["Dog", "Rabbit"],
    yearlyGuidance2026: {
      overview: "The Fire Horse year provides supportive Earth-Fire energy to the Dragon. Your natural drive aligns with the year's fast pace, encouraging expansion and action.",
      success: "Focus your energy on one or two major goals rather than scattering your talents.",
      caution: "Avoid letting your ambition lead to arrogance. Keep your feet on the ground.",
      opportunity: "Great year for expansion, starting new projects, and gaining wider influence.",
      relationship: "Encourage and support your partner's independence. Avoid trying to control decisions.",
      career: "Excellent progress in career advancement. Your leadership is recognized and welcomed.",
      money: "Strong financial opportunities. Reinvest in stable long-term ventures.",
      health: "Ensure you ground your high energy through physical exercise and outdoor activities.",
      spiritualAdvice: "Humility and gratitude will elevate your achievements to a spiritual level.",
      mantraStyleAffirmation: "I lead with a warm heart and open mind, grounded in strength and humility."
    },
    cards: [
      { icon: "Shield", title: "Success", text: "Focus your immense power on a few key goals." },
      { icon: "AlertTriangle", title: "Avoid", text: "Impatience and overbearing behavior." },
      { icon: "TrendingUp", title: "Opportunity", text: "Expanding your influence and starting ventures." },
      { icon: "Heart", title: "Relationship", text: "Respect the independence of your loved ones." },
      { icon: "Briefcase", title: "Career", text: "A strong period for advancement and visibility." },
      { icon: "Coins", title: "Money", text: "Promising investments in stable, long-term assets." },
      { icon: "Activity", title: "Health", text: "Channel excess fire into grounding physical outlets." },
      { icon: "Sparkles", title: "Spiritual", text: "Anchor your power in gratitude and humility." }
    ]
  },
  {
    slug: "snake",
    name: "Snake",
    chineseCharacter: "蛇",
    years: [1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025, 2037],
    element2026Tone: "Fire (blending with Year's Fire)",
    shortDescription: "Wise, enigmatic, intuitive, and contemplative.",
    personality: "Snakes are highly intuitive, deep thinkers who operate with quiet determination. They rely on their wisdom, appreciate the finer things in life, and possess a calm charm.",
    strengths: ["Intuitive", "Wise", "Discreet", "Sophisticated"],
    challenges: ["Possessive", "Suspicious", "Cold", "Calculating"],
    luckyColors: ["Black", "Red", "Yellow"],
    luckyNumbers: [2, 8, 9],
    compatibleSigns: ["Ox", "Rooster"],
    challengingSigns: ["Pig", "Tiger"],
    yearlyGuidance2026: {
      overview: "The Fire Horse year brings intense fire energy, which matches the Snake's natural element. This can sharpen your intuition but also create emotional heat and impatience.",
      success: "Let your deep wisdom guide you. Think carefully and act with precision.",
      caution: "Avoid making decisions based on sudden emotional impulses or anger.",
      opportunity: "Research, writing, strategy, and deepening your spiritual studies.",
      relationship: "Cultivate trust. Avoid secrecy and speak honestly about your feelings.",
      career: "A good year for planning and backend strategy. Avoid rushing to present ideas.",
      money: "Stable financial outlook. It is a year to study market trends quietly.",
      health: "Ensure mental calmness. Protect your sleep from overthinking.",
      spiritualAdvice: "Quiet contemplation and meditation are your anchors in this fiery year.",
      mantraStyleAffirmation: "I am guided by deep wisdom and act with calm, quiet precision."
    },
    cards: [
      { icon: "Shield", title: "Success", text: "Rely on quiet contemplation and precise actions." },
      { icon: "AlertTriangle", title: "Avoid", text: "Impulsive decisions driven by emotional heat." },
      { icon: "TrendingUp", title: "Opportunity", text: "Strategic planning, research, and self-education." },
      { icon: "Heart", title: "Relationship", text: "Build trust through open and honest discussions." },
      { icon: "Briefcase", title: "Career", text: "Excel behind the scenes; prepare future moves." },
      { icon: "Coins", title: "Money", text: "Research thoroughly before investing any capital." },
      { icon: "Activity", title: "Health", text: "Guard against restlessness and mental fatigue." },
      { icon: "Sparkles", title: "Spiritual", text: "Allow your intuition to blossom in quiet silence." }
    ]
  },
  {
    slug: "horse",
    name: "Horse",
    chineseCharacter: "马",
    years: [1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026, 2038],
    element2026Tone: "Fire (Year's inherent sign)",
    shortDescription: "Energetic, independent, warm-hearted, and easygoing.",
    personality: "Horses are dynamic, free-spirited, and highly energetic. They possess a warm nature, love independence, and are naturally driven to explore new horizons.",
    strengths: ["Energetic", "Independent", "Warm", "Optimistic"],
    challenges: ["Impatient", "Self-centered", "Easily bored", "Impulsive"],
    luckyColors: ["Red", "Purple", "Green"],
    luckyNumbers: [2, 3, 7],
    compatibleSigns: ["Tiger", "Goat", "Dog"],
    challengingSigns: ["Rat", "Ox"],
    yearlyGuidance2026: {
      overview: "2026 is your Ben Ming Nian (Zodiac Year). The intense Fire Horse energy amplifies your traits, encouraging a year of bold self-discovery, but requiring extreme self-discipline to prevent collisions.",
      success: "Practice self-discipline. Pace your running and focus on deep breathing.",
      caution: "Avoid making major career changes on a whim. Think of the long-term path.",
      opportunity: "Opportunities for personal branding, physical achievements, and creative ventures.",
      relationship: "Practice humility. Listen to partners who offer anchoring advice.",
      career: "High visibility. Stay focused on quality and follow-through to match your enthusiasm.",
      money: "Potential for growth, but guard against emotional spending and risky ventures.",
      health: "Calm your nervous system. Avoid excessive stimulants; focus on hydration.",
      spiritualAdvice: "Silence is your medicine. Learn to stand still and find peace within.",
      text: "Zodiac Year alignment requires caution and inner balance to navigate the fiery energy.",
      mantraStyleAffirmation: "I run with purpose and discipline, pausing to appreciate the beauty of the present."
    },
    cards: [
      { icon: "Shield", title: "Success", text: "Practice self-discipline and pace your actions." },
      { icon: "AlertTriangle", title: "Avoid", text: "Impulsive changes and running without direction." },
      { icon: "TrendingUp", title: "Opportunity", text: "Creative expression and building personal projects." },
      { icon: "Heart", title: "Relationship", text: "Listen to stabilizing advice from loved ones." },
      { icon: "Briefcase", title: "Career", text: "Focus on completion; avoid starting too many tasks." },
      { icon: "Coins", title: "Money", text: "Avoid impulsive shopping and high-risk speculations." },
      { icon: "Activity", title: "Health", text: "Calm the heart and nervous system daily." },
      { icon: "Sparkles", title: "Spiritual", text: "Find your strength in stillness and reflection." }
    ]
  },
  {
    slug: "goat",
    name: "Goat",
    chineseCharacter: "羊",
    years: [1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027, 2039],
    element2026Tone: "Earth (blending with Year's Fire)",
    shortDescription: "Gentle, compassionate, creative, and peaceful.",
    personality: "Goats (or Sheep/Ram) are gentle, empathetic, and highly creative. They cherish harmony, possess a deep love of nature and art, and are incredibly supportive friends.",
    strengths: ["Compassionate", "Creative", "Gentle", "Harmonious"],
    challenges: ["Shy", "Indecisive", "Worrying", "Passive"],
    luckyColors: ["Green", "Red", "Purple"],
    luckyNumbers: [2, 5, 8],
    compatibleSigns: ["Rabbit", "Horse", "Pig"],
    challengingSigns: ["Ox", "Dog"],
    yearlyGuidance2026: {
      overview: "The Goat shares a highly harmonious relationship with the Horse. In 2026, the Fire Horse year fuels your Earth, bringing warmth, creative inspiration, and support from mentors.",
      success: "Express your creativity. Trust your talents and share them with the world.",
      caution: "Avoid taking on other people's emotional baggage. Protect your energy.",
      opportunity: "New artistic projects, collaborative endeavors, and deepening friendships.",
      relationship: "Harmonious connections are favored. A year of sweet and supportive relationships.",
      career: "Collaboration brings success. Work with partners who value your gentle approach.",
      money: "A year of steady financial support. Small gifts or unexpected help may arrive.",
      health: "Ensure a comforting home environment. Relaxing creative hobbies support health.",
      spiritualAdvice: "Nurture your soul with beauty. Creative work can be a spiritual practice.",
      mantraStyleAffirmation: "I am surrounded by support and love, expressing my unique creativity freely."
    },
    cards: [
      { icon: "Shield", title: "Success", text: "Trust and express your creative talents freely." },
      { icon: "AlertTriangle", title: "Avoid", text: "Absorbing the stress and anxiety of others." },
      { icon: "TrendingUp", title: "Opportunity", text: "Artistic expression and meaningful collaborations." },
      { icon: "Heart", title: "Relationship", text: "Deepen bonds through gentleness and shared values." },
      { icon: "Briefcase", title: "Career", text: "Work collaboratively; your gentle diplomacy is valued." },
      { icon: "Coins", title: "Money", text: "Expect steady progress and supportive helpers." },
      { icon: "Activity", title: "Health", text: "Enjoy gentle hobbies and time spent in nature." },
      { icon: "Sparkles", title: "Spiritual", text: "Let art and beauty feed your spiritual journey." }
    ]
  },
  {
    slug: "monkey",
    name: "Monkey",
    chineseCharacter: "猴",
    years: [1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028, 2040],
    element2026Tone: "Metal (interacting with Year's Fire)",
    shortDescription: "Sharp, smart, curious, and mischievous.",
    personality: "Monkeys are intelligent, witty, and highly adaptable. Natural problem solvers, they possess a playful charm, a quick mind, and the ability to learn new things effortlessly.",
    strengths: ["Innovative", "Adaptable", "Sociable", "Quick-witted"],
    challenges: ["Restless", "Impulsive", "Easily distracted", "Opportunistic"],
    luckyColors: ["White", "Gold", "Blue"],
    luckyNumbers: [4, 9],
    compatibleSigns: ["Rat", "Dragon"],
    challengingSigns: ["Tiger"],
    yearlyGuidance2026: {
      overview: "For the Monkey, success in 2026 comes from maturity and timing, knowing when to act and when to let silence guide the situation.",
      success: "Focus on long-term stability and patience. Step back and plan rather than rushing into action.",
      caution: "Avoid engaging in power struggles within relationships, as they drain energy and create unnecessary tension.",
      opportunity: "Opportunities grow in areas like travel, communication, learning, and media when approached with clarity and discipline.",
      relationship: "Patience and listening will open doors. Avoid pushing your agenda too hard.",
      career: "A year to refine your skills. Do not leap to new jobs impulsively; wait for the right moment.",
      money: "Consolidate savings. Avoid high-risk speculative investments during the Fire Horse year.",
      health: "Manage mental stress and pacing. The Fire Horse energy can tempt you to burn the candle at both ends.",
      spiritualAdvice: "Cultivate quiet reflection. Meditation and mindfulness will help temper the restless Fire Horse influence.",
      mantraStyleAffirmation: "I am centered, patient, and wise. I act when the time is right and trust the natural flow of life."
    },
    cards: [
      { icon: "Shield", title: "Success", text: "Gain success through maturity, patience, and timing." },
      { icon: "AlertTriangle", title: "Avoid", text: "Power struggles and pushing your agenda too hard." },
      { icon: "TrendingUp", title: "Opportunity", text: "Travel, communication, and learning projects." },
      { icon: "Heart", title: "Relationship", text: "Active listening dissolves tension and builds bonds." },
      { icon: "Briefcase", title: "Career", text: "Consolidate your current role and refine skills." },
      { icon: "Coins", title: "Money", text: "Save conservatively; avoid speculative risks." },
      { icon: "Activity", title: "Health", text: "Manage mental stress and practice steady pacing." },
      { icon: "Sparkles", title: "Spiritual", text: "Quiet reflection tempers restless mental waves." }
    ]
  },
  {
    slug: "rooster",
    name: "Rooster",
    chineseCharacter: "鸡",
    years: [1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029, 2041],
    element2026Tone: "Metal (interacting with Year's Fire)",
    shortDescription: "Observant, hardworking, resourceful, and courageous.",
    personality: "Roosters are observant, organized, and direct. They possess a strong work ethic, value precision and honesty, and carry themselves with natural confidence.",
    strengths: ["Honest", "Observant", "Organized", "Loyal"],
    challenges: ["Critical", "Proud", "Opinionated", "Restless"],
    luckyColors: ["Gold", "Brown", "Yellow"],
    luckyNumbers: [5, 7, 8],
    compatibleSigns: ["Ox", "Snake", "Dragon"],
    challengingSigns: ["Rabbit"],
    yearlyGuidance2026: {
      overview: "The Fire Horse year challenges the Metal Rooster's desire for perfect organization. Flexibility and adjusting your expectations will be key to a fulfilling 2026.",
      success: "Embrace spontaneous adjustments. Let go of rigid schedules and adapt.",
      caution: "Avoid micromanaging others, as it may create friction in the workplace.",
      opportunity: "Opportunities in presentation, writing, organizing chaos, and leadership.",
      relationship: "Express appreciation and support. Avoid over-analyzing partners' suggestions.",
      career: "A year to develop team spirit. Guide others with patience rather than critiquing.",
      money: "Focus on steady saving habits. Avoid impulsive, showy purchases.",
      health: "Ensure relaxation for your eyes and shoulders. Rest in silent environments.",
      spiritualAdvice: "Practice letting go of perfection. Trust that the universe unfolds in perfect order.",
      mantraStyleAffirmation: "I release the need for perfect control, trusting in the natural harmony of life."
    },
    cards: [
      { icon: "Shield", title: "Success", text: "Develop flexibility and let go of rigid expectations." },
      { icon: "AlertTriangle", title: "Avoid", text: "Micromanaging others and demanding perfection." },
      { icon: "TrendingUp", title: "Opportunity", text: "Speaking, writing, and organizing complex tasks." },
      { icon: "Heart", title: "Relationship", text: "Build connection by expressing warm appreciation." },
      { icon: "Briefcase", title: "Career", text: "Support your team; lead through positive encouragement." },
      { icon: "Coins", title: "Money", text: "Maintain steady habits; avoid showy spending." },
      { icon: "Activity", title: "Health", text: "Relax your muscles and rest in quiet, dark spaces." },
      { icon: "Sparkles", title: "Spiritual", text: "Trust that order exists even within dynamic shifts." }
    ]
  },
  {
    slug: "dog",
    name: "Dog",
    chineseCharacter: "狗",
    years: [1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018, 2030, 2042],
    element2026Tone: "Earth (supported by Year's Fire)",
    shortDescription: "Loyal, honest, amiable, and prudent.",
    personality: "Dogs are loyal, honest, and protective. They possess a deep sense of justice, are incredibly reliable friends, and work hard to create safety and fairness for everyone.",
    strengths: ["Loyal", "Just", "Honest", "Responsible"],
    challenges: ["Cynical", "Anxious", "Guarded", "Judgmental"],
    luckyColors: ["Green", "Red", "Purple"],
    luckyNumbers: [3, 4, 9],
    compatibleSigns: ["Tiger", "Rabbit", "Horse"],
    challengingSigns: ["Dragon", "Goat"],
    yearlyGuidance2026: {
      overview: "The Dog is an ally of the Horse, and 2026 brings very supportive, warming energy. Your Earth element is nurtured, enhancing your confidence, stability, and recognition.",
      success: "Open your heart to new ideas. Step out of your comfort zone and try new ventures.",
      caution: "Avoid unnecessary worry. The supportive energy of the year is on your side.",
      opportunity: "Career advancement, public service, and strengthening family security.",
      relationship: "Loyalty and open communication deepen your bonds. Trust your relationships.",
      career: "Highly favorable year. Your loyalty and hard work are recognized and rewarded.",
      money: "Excellent progress. Reinvest in stable areas like property or family welfare.",
      health: "High stamina, but watch for excessive worry or mental anxiety. Ground yourself.",
      spiritualAdvice: "Practice trust in divine timing. Let go of anxiety and rest in security.",
      mantraStyleAffirmation: "I am safe, supported, and loyal. I trust the flow of my life completely."
    },
    cards: [
      { icon: "Shield", title: "Success", text: "Open your heart to new opportunities with confidence." },
      { icon: "AlertTriangle", title: "Avoid", text: "Anxiety and worrying about scenarios you can't control." },
      { icon: "TrendingUp", title: "Opportunity", text: "Leadership roles and strengthening family security." },
      { icon: "Heart", title: "Relationship", text: "Nurture trust through clear and open sharing." },
      { icon: "Briefcase", title: "Career", text: "Recognition is coming; your loyalty is appreciated." },
      { icon: "Coins", title: "Money", text: "Reinvest in home security and long-term savings." },
      { icon: "Activity", title: "Health", text: "Calm your mind; stay active in natural settings." },
      { icon: "Sparkles", title: "Spiritual", text: "Rest in the trust that you are always supported." }
    ]
  },
  {
    slug: "pig",
    name: "Pig",
    chineseCharacter: "猪",
    years: [1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019, 2031, 2043],
    element2026Tone: "Water (interacting with Year's Fire)",
    shortDescription: "Compassionate, generous, diligent, and noble.",
    personality: "Pigs (or Boars) are warm, kind, and generous individuals. They have a strong love for life, appreciate comforts and peace, and work with quiet diligence to achieve their dreams.",
    strengths: ["Kindhearted", "Generous", "Diligent", "Optimistic"],
    challenges: ["Naive", "Overindulgent", "Easily fooled", "Conflict-avoidant"],
    luckyColors: ["Yellow", "Grey", "Brown"],
    luckyNumbers: [2, 5, 8],
    compatibleSigns: ["Rabbit", "Goat", "Tiger"],
    challengingSigns: ["Snake"],
    yearlyGuidance2026: {
      overview: "The Fire Horse year brings dynamic opportunities for the Pig. The interacting Water and Fire elements suggest a year of balance: match hard work with pleasant relaxation.",
      success: "Build strong networks. Your friendly and honest nature will attract helpful mentors.",
      caution: "Avoid overindulging in rich foods or spending excessively on luxuries.",
      opportunity: "Social connections, new friendships, family expansions, and stable careers.",
      relationship: "Warmth and support flow naturally. A great year for family harmony.",
      career: "Your diligence is noticed. Focus on completing projects with steady effort.",
      money: "Steady income. Avoid lend-borrow deals with acquaintances to prevent misunderstandings.",
      health: "Guard against overindulgence. Keep a balanced diet and active lifestyle.",
      spiritualAdvice: "Express generosity. Helping others quietly will enrich your soul.",
      mantraStyleAffirmation: "I am grateful, balanced, and kind. I work diligently and rest in comfort."
    },
    cards: [
      { icon: "Shield", title: "Success", text: "Build warm, supportive networks and friendships." },
      { icon: "AlertTriangle", title: "Avoid", text: "Overindulgence and unbudgeted luxury spending." },
      { icon: "TrendingUp", title: "Opportunity", text: "Social networking and collaborative endeavors." },
      { icon: "Heart", title: "Relationship", text: "Nurture warm family ties and enjoy quiet comforts." },
      { icon: "Briefcase", title: "Career", text: "Continue steady efforts; your diligence is noticed." },
      { icon: "Coins", title: "Money", text: "Maintain steady earnings; avoid risky lend-borrow deals." },
      { icon: "Activity", title: "Health", text: "Keep a balanced lifestyle; stay active daily." },
      { icon: "Sparkles", title: "Spiritual", text: "Generosity and selfless sharing elevate your spirit." }
    ]
  }
];
