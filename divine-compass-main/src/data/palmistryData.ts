export interface PalmistryCategory {
  slug: string;
  title: string;
  shortDescription: string;
  theme: string;
  icon: string;
  overview: string;
  indicates: string[];
  positiveSigns: string[];
  cautionSigns: string[];
  spiritualReflection: string;
  doToday: string;
  avoidToday: string;
  journalPrompt: string;
  mantra: string;
}

export const palmistryCategories: PalmistryCategory[] = [
  {
    slug: "health-line",
    title: "Health Line",
    shortDescription: "Reflects vitality, wellness tendencies, and lifestyle balance.",
    theme: "emerald",
    icon: "health",
    overview: "The Health Line, also called the Mercury Line, is traditionally associated with vitality, lifestyle balance, nervous energy, digestion, and general wellness patterns. In palmistry, it is not used as a medical diagnosis. It is used as a reflective symbol for how a person manages energy, stress, and daily habits.",
    indicates: [
      "Energy management",
      "Stress sensitivity",
      "Lifestyle discipline",
      "Digestive or nervous energy patterns in traditional palmistry",
      "Need for balance and routine"
    ],
    positiveSigns: [
      "Clear and balanced line",
      "No major breaks",
      "Good spacing with other lines",
      "Calm and steady appearance"
    ],
    cautionSigns: [
      "Too many breaks may symbolically suggest scattered energy",
      "Deep cuts or chaotic markings may reflect stress patterns",
      "Weak or unclear line may suggest need for better routine"
    ],
    spiritualReflection: "Your body often speaks before your mind does. Use this line as a reminder to build rhythm, rest, and mindful discipline.",
    doToday: "Drink enough water, eat calmly, and complete one health-supporting habit.",
    avoidToday: "Avoid late-night scrolling, stress eating, and ignoring tiredness.",
    journalPrompt: "What is one small habit that can restore my energy this week?",
    mantra: "Om Tryambakam Yajamahe"
  },
  {
    slug: "heart-line",
    title: "Heart Line",
    shortDescription: "Shows emotional nature, love expression, and relationship patterns.",
    theme: "rose",
    icon: "heart",
    overview: "The Heart Line is traditionally connected with emotions, affection, love expression, sensitivity, emotional maturity, and relationship patterns. It reflects how a person may give, receive, and process emotional connection.",
    indicates: [
      "Emotional expression",
      "Love style",
      "Sensitivity",
      "Attachment patterns",
      "Compassion and forgiveness"
    ],
    positiveSigns: [
      "Clear and smooth heart line",
      "Gentle curve",
      "Balanced depth",
      "Good length without excessive breaks"
    ],
    cautionSigns: [
      "Broken or chained line may suggest emotional ups and downs",
      "Very deep line may reflect intense feelings",
      "Very faint line may suggest guarded emotions"
    ],
    spiritualReflection: "Love becomes stronger when emotion is guided by patience, listening, and self-awareness.",
    doToday: "Speak gently and listen before reacting.",
    avoidToday: "Avoid harsh words, emotional assumptions, and bringing old pain into a new conversation.",
    journalPrompt: "What emotion needs kindness from me today?",
    mantra: "Om Namah Shivaya"
  },
  {
    slug: "life-line",
    title: "Life Line",
    shortDescription: "Represents vitality, life rhythm, resilience, and grounding.",
    theme: "amber",
    icon: "life",
    overview: "The Life Line curves around the base of the thumb and is traditionally associated with vitality, grounding, resilience, family roots, life rhythm, and physical energy. It does not show exact lifespan. It is better understood as a symbol of energy flow and life stability.",
    indicates: [
      "Vitality and stamina",
      "Grounding",
      "Life rhythm",
      "Family influence",
      "Ability to recover from challenges"
    ],
    positiveSigns: [
      "Deep and clear line",
      "Smooth curve",
      "Balanced shape around thumb",
      "Supportive sister line if present"
    ],
    cautionSigns: [
      "Breaks may symbolically show major transitions",
      "Very faint line may suggest low grounding",
      "Many cuts may reflect scattered energy or stress"
    ],
    spiritualReflection: "Your life force grows through consistency, not pressure. Small disciplined actions create strong foundations.",
    doToday: "Complete one grounding task and spend a few minutes in silence.",
    avoidToday: "Avoid comparing your life path with others.",
    journalPrompt: "What makes me feel stable, protected, and rooted?",
    mantra: "Om Gam Ganapataye Namah"
  },
  {
    slug: "head-line",
    title: "Head Line",
    shortDescription: "Shows thinking style, decision-making, focus, and mental patterns.",
    theme: "sky",
    icon: "brain",
    overview: "The Brain Line, also called the Head Line, is traditionally linked with thinking style, focus, imagination, decision-making, learning, logic, and mental patterns.",
    indicates: [
      "Thinking style",
      "Focus and clarity",
      "Decision-making",
      "Imagination",
      "Practical or creative mindset"
    ],
    positiveSigns: [
      "Clear and steady line",
      "Balanced length",
      "Smooth shape",
      "Good separation from emotional confusion"
    ],
    cautionSigns: [
      "Too many cuts may suggest overthinking",
      "Wavy line may reflect scattered focus",
      "Very deep line may indicate mental intensity"
    ],
    spiritualReflection: "A calm mind makes better choices. Clarity comes when thought, breath, and action move together.",
    doToday: "Prioritize one important task and finish it without distraction.",
    avoidToday: "Avoid overthinking and jumping between too many decisions.",
    journalPrompt: "What thought keeps repeating in my mind, and what action can release it?",
    mantra: "Om Aim Saraswatyai Namah"
  },
  {
    slug: "fate-line",
    title: "Fate Line",
    shortDescription: "Relates to career path, destiny themes, ambition, and direction.",
    theme: "orange",
    icon: "star",
    overview: "The Fate Line is traditionally associated with career direction, destiny themes, ambition, responsibility, public life, and life purpose. It reflects how a person relates to work, duty, and long-term path.",
    indicates: [
      "Career direction",
      "Ambition",
      "Discipline",
      "Public responsibility",
      "Destiny-related life themes",
      "Shifts in work or purpose"
    ],
    positiveSigns: [
      "Clear vertical line",
      "Strong upward movement",
      "Balanced connection with other major lines",
      "Steady direction"
    ],
    cautionSigns: [
      "Breaks may indicate career changes or transitions",
      "Faint line may suggest flexible or self-created path",
      "Multiple lines may reflect multiple interests"
    ],
    spiritualReflection: "Destiny is not only what happens to you. It is also built through discipline, service, and wise choices.",
    doToday: "Take one practical step toward your long-term goal.",
    avoidToday: "Avoid postponing responsibilities or waiting for perfect timing.",
    journalPrompt: "What responsibility am I ready to accept with maturity?",
    mantra: "Om Sham Shanicharaya Namah"
  }
];

export const palmistryOthers = [
  {
    title: "Mars Line",
    description: "Courage, strength, protection, and inner vitality."
  },
  {
    title: "Rahu Line",
    description: "Unusual experiences, karmic lessons, and hidden challenges."
  },
  {
    title: "Jupiter Line",
    description: "Leadership, wisdom, ambition, and guidance."
  },
  {
    title: "Venus Line",
    description: "Love, beauty, comfort, attraction, and emotional warmth."
  },
  {
    title: "Moon Line",
    description: "Imagination, intuition, travel, and emotional depth."
  },
  {
    title: "Sun Line",
    description: "Recognition, creativity, name, fame, and confidence."
  },
  {
    title: "Marriage Line",
    description: "Relationship patterns, emotional bonds, and partnership tendencies."
  },
  {
    title: "Fish Line / Fish Sign",
    description: "Auspicious sign traditionally connected with blessings and spiritual growth."
  },
  {
    title: "Offspring Line",
    description: "Family legacy, nurturing energy, and children-related symbolism."
  }
];
