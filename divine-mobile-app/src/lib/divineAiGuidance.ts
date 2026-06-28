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
  goal: DivineAiGoal;
  question?: string;
  source?: string;
}

export interface DivineAiGuidance {
  salutation: string;
  focusTitle: string;
  summary: string;
  doToday: string;
  avoidToday: string;
  mantra: string;
  journalPrompt: string;
  reflection: string;
  followUpPrompts: string[];
  disclaimer: string;
}

const GOAL_LABELS: Record<DivineAiGoal, string> = {
  career: "career clarity",
  marriage: "relationship steadiness",
  money: "financial discipline",
  peace: "inner calm",
  health: "steady wellbeing",
  family: "family harmony",
};

const FOCUS_TITLES = [
  "A quiet day for steady progress",
  "A timing window for patient decisions",
  "A reflective day that rewards clean action",
  "A strong day for completing what is pending",
  "A softer day for restraint over reaction",
];

const MANTRAS = [
  "Om Namah Shivaya",
  "Om Shreem Mahalakshmyai Namah",
  "Om Gum Ganapataye Namah",
  "Om Sham Shanicharaya Namah",
  "Om Namo Bhagavate Vasudevaya",
];

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
    "Give me one mantra and one action step.",
    "How do I move through this week calmly?",
  ],
} as const;

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const pick = <T,>(items: T[], seed: number, offset = 0): T => {
  return items[(seed + offset) % items.length];
};

const buildSourcePrompts = (source?: string) => {
  if (!source) return QUESTION_PROMPTS.default;
  return QUESTION_PROMPTS[source as keyof typeof QUESTION_PROMPTS] ?? QUESTION_PROMPTS.default;
};

export const generateDivineAiGuidance = (profile: DivineAiProfile): DivineAiGuidance => {
  const identitySeed = hashString(
    [profile.name, profile.birthDate, profile.birthTime, profile.goal, profile.source].filter(Boolean).join("|"),
  );
  const dateLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const firstName = profile.name.trim().split(/\s+/)[0] || "friend";
  const goalLabel = GOAL_LABELS[profile.goal];
  const prompts = buildSourcePrompts(profile.source);
  const focusTitle = pick(FOCUS_TITLES, identitySeed);
  const mantra = pick(MANTRAS, identitySeed, 1);
  const sourceNoun =
    profile.source === "kundali"
      ? "birth chart"
      : profile.source === "sade-sati"
        ? "Saturn cycle"
        : profile.source === "match"
          ? "relationship pattern"
          : "daily timing";

  const questionLine = profile.question?.trim()
    ? ` You asked: "${profile.question.trim()}". Treat today's answer as guidance for reflection, not certainty.`
    : "";

  return {
    salutation: `Good ${new Date().getHours() < 12 ? "morning" : "day"}, ${firstName}.`,
    focusTitle,
    summary: `${dateLabel} favours ${goalLabel} through measured action, calmer speech, and one conscious pause before a major decision.${questionLine}`,
    doToday: `Pick one concrete step connected to ${goalLabel} and finish it before starting a second task.`,
    avoidToday: `Avoid rushed promises, emotionally charged money decisions, and trying to force clarity faster than it is arriving.`,
    mantra,
    journalPrompt: `What responsibility, pattern, or conversation would become lighter if I approached it with more discipline today?`,
    reflection: `Your ${sourceNoun} is better used as a planning signal than a prediction machine. Slow down, simplify the next move, and let consistency create confidence.`,
    followUpPrompts: prompts,
    disclaimer:
      "Divine AI Guru offers spiritual reflection and practical Vedic framing. It does not replace medical, legal, financial, or mental health advice.",
  };
};
