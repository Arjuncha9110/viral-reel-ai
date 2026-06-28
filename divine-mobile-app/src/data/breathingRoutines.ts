export type BreathingPhaseAction = "INHALE" | "HOLD" | "EXHALE" | "REST" | "INHALE_L" | "EXHALE_R" | "INHALE_R" | "EXHALE_L";

export interface BreathingPhase {
  action: BreathingPhaseAction;
  label: string;
  seconds: number;
  instruction: string;
}

export interface BreathingRoutine {
  slug: string;
  title: string;
  sanskritName?: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: "Calm" | "Focus" | "Sleep" | "Energy" | "Spiritual";
  durationMinutes: number;
  shortDescription: string;
  benefits: string[];
  caution?: string;
  phases: BreathingPhase[];
  rounds: number;
  mantra?: string;
  visualTheme: {
    gradient: string;
    accent: string;
  };
  isLocked?: boolean;
}

export const breathingRoutines: BreathingRoutine[] = [
  {
    slug: "nadi-shodhana",
    title: "Nadi Shodhana",
    sanskritName: "Alternate Nostril Breathing",
    level: "Beginner",
    category: "Spiritual",
    durationMinutes: 5,
    shortDescription: "Alternate nostril breathing for balance, calm, and nervous system regulation.",
    benefits: ["Calm mind", "Balance energy", "Reduce stress", "Improve focus before prayer or meditation"],
    caution: "Avoid forceful breathing. Stop if dizzy.",
    phases: [
      { action: "INHALE_L", label: "Inhale", seconds: 4, instruction: "Inhale through left nostril" },
      { action: "HOLD", label: "Hold", seconds: 2, instruction: "Hold gently" },
      { action: "EXHALE_R", label: "Exhale", seconds: 4, instruction: "Exhale through right nostril" },
      { action: "INHALE_R", label: "Inhale", seconds: 4, instruction: "Inhale through right nostril" },
      { action: "HOLD", label: "Hold", seconds: 2, instruction: "Hold gently" },
      { action: "EXHALE_L", label: "Exhale", seconds: 4, instruction: "Exhale through left nostril" }
    ],
    rounds: 5,
    visualTheme: {
      gradient: "from-indigo-900 to-purple-900",
      accent: "text-indigo-400"
    }
  },
  {
    slug: "bhramari",
    title: "Bhramari",
    sanskritName: "Bee Breath",
    level: "Beginner",
    category: "Sleep",
    durationMinutes: 3,
    shortDescription: "Humming bee breath to reduce mental noise and induce deep relaxation.",
    benefits: ["Calms the nervous system", "Helps reduce mental noise", "Supports sleep and inner peace"],
    phases: [
      { action: "INHALE", label: "Inhale", seconds: 4, instruction: "Inhale softly through nose" },
      { action: "EXHALE", label: "Hum", seconds: 8, instruction: "Hum gently like a bee as you exhale" },
      { action: "REST", label: "Rest", seconds: 2, instruction: "Rest" }
    ],
    rounds: 7,
    visualTheme: {
      gradient: "from-slate-900 to-sky-900",
      accent: "text-sky-400"
    }
  },
  {
    slug: "lions-breath",
    title: "Lion's Breath",
    sanskritName: "Simhasana",
    level: "Beginner",
    category: "Energy",
    durationMinutes: 2,
    shortDescription: "A powerful exhale to release tension, stress, and stagnant energy.",
    benefits: ["Releases facial tension", "Helps emotional release", "Energizes the body"],
    caution: "Do gently. Avoid strain on the throat.",
    phases: [
      { action: "INHALE", label: "Inhale", seconds: 4, instruction: "Inhale deeply through the nose" },
      { action: "EXHALE", label: "Release", seconds: 4, instruction: "Open mouth wide, stick out tongue, exhale strongly" },
      { action: "REST", label: "Rest", seconds: 3, instruction: "Rest" }
    ],
    rounds: 5,
    visualTheme: {
      gradient: "from-orange-900 to-rose-900",
      accent: "text-orange-400"
    }
  },
  {
    slug: "box-breathing",
    title: "Box Breathing",
    sanskritName: "Sama Vritti",
    level: "Beginner",
    category: "Focus",
    durationMinutes: 3,
    shortDescription: "Simple square breathing for mental focus and emotional control.",
    benefits: ["Improves focus", "Helps manage stress", "Good before work or decisions"],
    phases: [
      { action: "INHALE", label: "Inhale", seconds: 4, instruction: "Inhale slowly" },
      { action: "HOLD", label: "Hold", seconds: 4, instruction: "Hold breath in" },
      { action: "EXHALE", label: "Exhale", seconds: 4, instruction: "Exhale completely" },
      { action: "REST", label: "Hold", seconds: 4, instruction: "Hold breath out" }
    ],
    rounds: 6,
    visualTheme: {
      gradient: "from-teal-900 to-emerald-900",
      accent: "text-teal-400"
    }
  },
  {
    slug: "4-7-8-breathing",
    title: "4-7-8 Breathing",
    level: "Intermediate",
    category: "Sleep",
    durationMinutes: 4,
    shortDescription: "A relaxing rhythm designed to prepare the mind and body for sleep.",
    benefits: ["Supports relaxation", "Helps prepare for sleep", "Slows mental activity"],
    caution: "Shorten hold if uncomfortable.",
    phases: [
      { action: "INHALE", label: "Inhale", seconds: 4, instruction: "Inhale quietly through nose" },
      { action: "HOLD", label: "Hold", seconds: 7, instruction: "Hold breath" },
      { action: "EXHALE", label: "Exhale", seconds: 8, instruction: "Exhale fully through mouth" }
    ],
    rounds: 4,
    visualTheme: {
      gradient: "from-indigo-950 to-slate-900",
      accent: "text-indigo-400"
    }
  },
  {
    slug: "equal-breathing",
    title: "Equal Breathing",
    level: "Beginner",
    category: "Calm",
    durationMinutes: 5,
    shortDescription: "Balanced inhale and exhale to steady the mind and emotions.",
    benefits: ["Easy daily practice", "Builds breath awareness", "Supports emotional steadiness"],
    phases: [
      { action: "INHALE", label: "Inhale", seconds: 5, instruction: "Inhale deeply" },
      { action: "EXHALE", label: "Exhale", seconds: 5, instruction: "Exhale fully" }
    ],
    rounds: 10,
    visualTheme: {
      gradient: "from-blue-900 to-cyan-900",
      accent: "text-blue-400"
    }
  },
  {
    slug: "deep-belly-breathing",
    title: "Deep Belly Breathing",
    level: "Beginner",
    category: "Calm",
    durationMinutes: 5,
    shortDescription: "Diaphragmatic breathing to reduce tension and improve oxygen flow.",
    benefits: ["Reduces tension", "Improves breathing awareness", "Good for beginners"],
    phases: [
      { action: "INHALE", label: "Inhale", seconds: 4, instruction: "Inhale, belly expands" },
      { action: "EXHALE", label: "Exhale", seconds: 6, instruction: "Exhale, belly relaxes" }
    ],
    rounds: 10,
    visualTheme: {
      gradient: "from-emerald-900 to-teal-900",
      accent: "text-emerald-400"
    }
  },
  {
    slug: "kapalabhati",
    title: "Kapalabhati",
    sanskritName: "Skull Shining Breath",
    level: "Advanced",
    category: "Energy",
    durationMinutes: 5,
    shortDescription: "Rapid exhales to clear the mind and generate internal heat.",
    benefits: ["Clears mental fog", "Generates heat", "Energizes the system"],
    caution: "Advanced pranayama should be learned carefully and preferably with guidance.",
    phases: [
      { action: "INHALE", label: "Inhale", seconds: 2, instruction: "Inhale passively" },
      { action: "EXHALE", label: "Exhale", seconds: 1, instruction: "Exhale forcefully" }
    ],
    rounds: 30,
    visualTheme: {
      gradient: "from-red-900 to-orange-900",
      accent: "text-red-400"
    },
    isLocked: true
  }
];
