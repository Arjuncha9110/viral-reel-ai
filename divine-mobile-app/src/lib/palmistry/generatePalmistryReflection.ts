import { palmistryCategories } from "../../data/palmistryData";

export interface PalmistryQuizAnswers {
  hand: string;
  strongestLine: string;
  focusArea: string;
}

export interface PalmistryReflection {
  summary: string;
  traditionalMeaning: string;
  practicalGuidance: string;
  doToday: string;
  avoidToday: string;
  journalPrompt: string;
  mantra: string;
  disclaimer: string;
}

export async function generatePalmistryReflection(answers: PalmistryQuizAnswers): Promise<PalmistryReflection> {
  // Deterministic fallback content based on user selections
  const category = palmistryCategories.find(c => c.slug === answers.strongestLine) || palmistryCategories[0];
  
  const focusGuidance: Record<string, string> = {
    "Career": "Your selected focus on career suggests it's a good time to align your daily actions with your long-term goals.",
    "Love": "Focusing on love reminds us that patience and listening are the foundations of strong relationships.",
    "Health habits": "A focus on health is a call to listen to your body and honor its need for rest and rhythm.",
    "Peace": "Seeking peace means allowing yourself to step back from unnecessary conflicts and overthinking.",
    "Discipline": "Discipline is the highest form of self-love. Take small, consistent steps.",
    "Family": "Family connections are highlighted. Give grace to yourself and your loved ones today."
  };

  const focusText = focusGuidance[answers.focusArea] || focusGuidance["Peace"];
  const handText = answers.hand === "left" 
    ? "The left hand traditionally represents inherent traits and inner potential." 
    : answers.hand === "right" 
      ? "The right hand traditionally represents current actions and how you navigate the world."
      : "Reflecting on both hands provides a balanced view of your inner potential and outer actions.";

  return {
    summary: `Your focus on the ${category.title} and ${answers.focusArea} suggests today is a good day to observe these energies. ${handText}`,
    traditionalMeaning: category.overview,
    practicalGuidance: `${focusText} ${category.spiritualReflection}`,
    doToday: category.doToday,
    avoidToday: category.avoidToday,
    journalPrompt: category.journalPrompt,
    mantra: category.mantra,
    disclaimer: "Palmistry on Divine Panchang is offered for spiritual reflection, cultural learning, and self-awareness. It does not replace medical, legal, financial, relationship, or mental health advice. Please use it as guidance, not as a fixed prediction."
  };
}
