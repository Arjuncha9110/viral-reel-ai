export type DivineAiGoal =
  | "career"
  | "marriage"
  | "money"
  | "peace"
  | "health"
  | "family";

export interface DivineAiProfile {
  name: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  currentLocation?: string;
  goal: DivineAiGoal;
  question?: string;
  source?: string;
  astrologyContext?: {
    birthMetadata?: any;
    todaysPanchang?: any;
  };
}

export interface DivineAiMantra {
  title: string;
  text: string;
  meaning: string;
}

export interface DivineAiGuidance {
  title: string;
  summary: string;
  doToday: string;
  avoidToday: string;
  mantra: DivineAiMantra;
  journalPrompt: string;
  spiritualAction: string;
  bestTimeWindow: string;
  gentleReminder: string;
  upgradeHook: string;
  salutation?: string;
  followUpPrompts?: string[];
  disclaimer?: string;
}

const QUESTION_PROMPTS = {
  panchang: [
    "What should I focus on today?",
    "What should I avoid during Rahu Kaal?",
    "Give me one practical action for today.",
  ],
  kundali: [
    "Explain my chart in simple words.",
    "What does my current phase want from me?",
    "Create my 30-day spiritual plan.",
  ],
  "sade-sati": [
    "How should I handle my current Saturn phase?",
    "What discipline should I strengthen this week?",
    "Give me one non-fear-based remedy.",
  ],
  match: [
    "Explain this compatibility in practical language.",
    "Where will communication need more patience?",
    "What should both partners consciously build?",
  ],
  default: [
    "What should I focus on today?",
    "Give me one calm remedy and one action step.",
    "How do I create more discipline this week?",
    "What should I avoid today?",
    "Give me a mantra for peace and clarity.",
    "How can I improve my career energy today?",
  ],
} as const;

export const buildSourcePrompts = (source?: string): string[] => {
  if (!source) return [...QUESTION_PROMPTS.default];
  return [...(QUESTION_PROMPTS[source as keyof typeof QUESTION_PROMPTS] ?? QUESTION_PROMPTS.default)];
};

export const generateDivineAiGuidance = (profile: DivineAiProfile): DivineAiGuidance => {
  const firstName = profile.name.trim().split(/\s+/)[0] || "Friend";

  const baseResponse: Omit<DivineAiGuidance, "summary" | "doToday" | "avoidToday" | "mantra" | "journalPrompt" | "spiritualAction"> = {
    title: "Your Divine Guidance for Today",
    bestTimeWindow: "Choose a calm morning or evening period after prayer.",
    gentleReminder: "Discipline today does not mean pressure. It means one sincere step.",
    upgradeHook: "Your 30-day Divine Plan can turn this into a daily routine with guidance, mantra, journaling, and spiritual action steps.",
    salutation: `Namaste, ${firstName}. Here is your Divine Guidance for today.`,
    followUpPrompts: buildSourcePrompts(profile.source),
    disclaimer: "Divine AI Guru offers spiritual reflection and practical Vedic framing. It does not replace medical, legal, financial, or mental health advice. For serious concerns, please consult a qualified professional."
  };

  switch (profile.goal) {
    case "career":
      return {
        ...baseResponse,
        summary: "Today is a good day to focus on discipline, clear communication, and completing pending work.",
        doToday: "Finish one small task you have been delaying and communicate your needs clearly.",
        avoidToday: "Avoid impulsive decisions, unnecessary arguments, and distractions.",
        mantra: { title: "Mantra for Obstacle Removal", text: "Om Gan Ganapataye Namah", meaning: "A powerful mantra to remove career obstacles and invite success." },
        journalPrompt: "What is one career distraction I can eliminate today?",
        spiritualAction: "Take 5 minutes to organize your workspace and set clear intentions for the day."
      };
    case "marriage":
      return {
        ...baseResponse,
        summary: "Today favours patience, deep listening, and emotional maturity in your relationships.",
        doToday: "Listen without trying to fix, and practice patience with your partner.",
        avoidToday: "Avoid ego-driven reactions, harsh words, and over-expectations.",
        mantra: { title: "Mantra for Harmony", text: "Om Namah Shivaya", meaning: "A grounding mantra for inner balance, surrender, and relationship clarity." },
        journalPrompt: "How can I show up more patiently in my relationship today?",
        spiritualAction: "Take a few deep breaths before responding during any emotionally tense moments."
      };
    case "money":
      return {
        ...baseResponse,
        summary: "Focus on financial planning, saving, and reviewing your expenses with clarity today.",
        doToday: "Review your current budget or set aside a small amount for savings.",
        avoidToday: "Avoid risky spending, emotional purchases, and hasty investments.",
        mantra: { title: "Mantra for Abundance", text: "Om Shreem Mahalakshmiyei Namah", meaning: "A mantra to invite steady financial discipline and abundance." },
        journalPrompt: "What is one emotional purchase I can avoid this week?",
        spiritualAction: "Express gratitude for the resources you currently have before asking for more."
      };
    case "peace":
      return {
        ...baseResponse,
        summary: "Today is a good day to slow down, complete one pending responsibility, and avoid reacting emotionally. Keep your spiritual practice simple and consistent.",
        doToday: "Finish one small task you have been delaying. Keep your words soft and intentional.",
        avoidToday: "Avoid overthinking, emotional spending, and replying quickly when you feel disturbed.",
        mantra: { title: "Mantra for Calmness", text: "Om Shanti Shanti Shanti", meaning: "A gentle invocation of peace for the mind, body, and spirit." },
        journalPrompt: "What emotion am I carrying today that I can release with patience?",
        spiritualAction: "Spend 7 minutes in silent breathing before making important decisions."
      };
    case "health":
      return {
        ...baseResponse,
        summary: "Prioritize your routine, hydration, sleep, and gentle movement today.",
        doToday: "Drink enough water and ensure you get an early, restful sleep.",
        avoidToday: "Avoid stress eating, late-night scrolling, and over-exertion.",
        mantra: { title: "Mantra for Healing", text: "Om Tryambakam Yajamahe", meaning: "The Mahamrityunjaya mantra for physical vitality and healing." },
        journalPrompt: "What is one small habit I can change today to honour my body?",
        spiritualAction: "Take a 10-minute mindful walk without your phone."
      };
    case "family":
      return {
        ...baseResponse,
        summary: "Today highlights gratitude, respect, and gentle communication within the family.",
        doToday: "Express gratitude to a family member and speak with kindness.",
        avoidToday: "Avoid blame, comparison, and bringing up old arguments.",
        mantra: { title: "Mantra for Unity", text: "Om Namah Shivaya", meaning: "A grounding mantra for dissolving ego and inviting inner peace." },
        journalPrompt: "How can I bring more understanding into my family interactions today?",
        spiritualAction: "Silently send a prayer of well-being to your family members."
      };
    default:
      return {
        ...baseResponse,
        summary: "A reflective day that rewards clean action and patience.",
        doToday: "Pick one concrete step and finish it before starting a second task.",
        avoidToday: "Avoid rushed promises and trying to force clarity faster than it is arriving.",
        mantra: { title: "Mantra for Clarity", text: "Om Namah Shivaya", meaning: "A grounding mantra for inner balance, surrender, and clarity." },
        journalPrompt: "What responsibility would become lighter if I approached it with more discipline today?",
        spiritualAction: "Spend a few minutes in silence to gather your energy."
      };
  }
};
