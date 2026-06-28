// Pythagorean Numerology System

export const pythagoreanValues: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8
};

export const vowels = ['a', 'e', 'i', 'o', 'u'];

export const reduceToSingleDigit = (num: number): number => {
  if (num === 11 || num === 22 || num === 33) return num; // Master numbers
  while (num > 9) {
    num = String(num).split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  return num;
};

export const calculateNameNumber = (name: string): number => {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  const sum = cleanName.split('').reduce((acc, char) => {
    return acc + (pythagoreanValues[char] || 0);
  }, 0);
  return reduceToSingleDigit(sum);
};

export const calculateSoulNumber = (name: string): number => {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  const sum = cleanName.split('').reduce((acc, char) => {
    if (vowels.includes(char)) {
      return acc + (pythagoreanValues[char] || 0);
    }
    return acc;
  }, 0);
  return reduceToSingleDigit(sum);
};

export const calculatePersonalityNumber = (name: string): number => {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  const sum = cleanName.split('').reduce((acc, char) => {
    if (!vowels.includes(char)) {
      return acc + (pythagoreanValues[char] || 0);
    }
    return acc;
  }, 0);
  return reduceToSingleDigit(sum);
};

export const calculateLifePathNumber = (birthDate: Date): number => {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = birthDate.getFullYear();
  
  const sum = reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(year);
  return reduceToSingleDigit(sum);
};

export const getBirthDateDigits = (birthDate: Date): string =>
  [
    String(birthDate.getDate()).padStart(2, "0"),
    String(birthDate.getMonth() + 1).padStart(2, "0"),
    String(birthDate.getFullYear()),
  ].join("");

export const calculateBirthdayNumber = (birthDate: Date): number =>
  reduceToSingleDigit(birthDate.getDate());

export const calculateMaturityNumber = (lifePathNumber: number, nameNumber: number): number => {
  return reduceToSingleDigit(lifePathNumber + nameNumber);
};

export interface NumerologyResult {
  number: number;
  title: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  career: string;
  compatibility: string;
  description: string;
}

export const numerologyInterpretations: Record<number, NumerologyResult> = {
  1: {
    number: 1,
    title: "The Leader",
    traits: ["Independent", "Ambitious", "Pioneering", "Self-reliant"],
    strengths: ["Natural leadership", "Courage", "Innovation", "Determination"],
    weaknesses: ["Stubbornness", "Impatience", "Self-centeredness"],
    career: "Best suited for entrepreneurship, management, politics, or any role requiring leadership and initiative.",
    compatibility: "Most compatible with 1, 5, and 7. Challenging with 8 and 4.",
    description: "You are a natural born leader with strong willpower and ambition. Your pioneering spirit drives you to forge new paths and inspire others to follow."
  },
  2: {
    number: 2,
    title: "The Diplomat",
    traits: ["Cooperative", "Sensitive", "Diplomatic", "Patient"],
    strengths: ["Mediation skills", "Intuition", "Harmony-seeking", "Empathy"],
    weaknesses: ["Oversensitivity", "Indecisiveness", "Dependency"],
    career: "Excellent in counseling, diplomacy, healthcare, teaching, or any collaborative environment.",
    compatibility: "Most compatible with 2, 4, and 8. Challenging with 5 and 1.",
    description: "You possess a gentle, diplomatic nature with deep intuition. Your ability to see both sides makes you an excellent mediator and peacemaker."
  },
  3: {
    number: 3,
    title: "The Communicator",
    traits: ["Creative", "Expressive", "Optimistic", "Social"],
    strengths: ["Creativity", "Communication", "Joy", "Inspiration"],
    weaknesses: ["Scattered energy", "Superficiality", "Moodiness"],
    career: "Thrives in arts, entertainment, writing, marketing, or any creative field requiring expression.",
    compatibility: "Most compatible with 3, 6, and 9. Challenging with 4 and 8.",
    description: "Your vibrant creativity and gift of expression make you a natural entertainer and communicator. Joy and inspiration follow wherever you go."
  },
  4: {
    number: 4,
    title: "The Builder",
    traits: ["Practical", "Organized", "Disciplined", "Hardworking"],
    strengths: ["Stability", "Reliability", "Persistence", "Attention to detail"],
    weaknesses: ["Rigidity", "Stubbornness", "Lack of imagination"],
    career: "Excels in engineering, accounting, project management, construction, or systematic work.",
    compatibility: "Most compatible with 2, 4, and 8. Challenging with 3 and 5.",
    description: "You are the solid foundation upon which great things are built. Your practical approach and dedication create lasting structures and systems."
  },
  5: {
    number: 5,
    title: "The Freedom Seeker",
    traits: ["Adventurous", "Versatile", "Dynamic", "Curious"],
    strengths: ["Adaptability", "Freedom-loving", "Resourcefulness", "Quick thinking"],
    weaknesses: ["Restlessness", "Inconsistency", "Overindulgence"],
    career: "Perfect for travel, sales, marketing, journalism, or any role offering variety and change.",
    compatibility: "Most compatible with 1, 5, and 7. Challenging with 2 and 4.",
    description: "Your adventurous spirit craves freedom and change. You embrace life with enthusiasm and inspire others to break free from limitations."
  },
  6: {
    number: 6,
    title: "The Nurturer",
    traits: ["Responsible", "Caring", "Harmonious", "Protective"],
    strengths: ["Compassion", "Family-oriented", "Healing abilities", "Artistic sense"],
    weaknesses: ["Over-protective", "Self-sacrificing", "Worry-prone"],
    career: "Natural fit for healthcare, counseling, education, interior design, or community service.",
    compatibility: "Most compatible with 3, 6, and 9. Challenging with 1 and 5.",
    description: "You are the heart of your community, providing love, care, and stability. Your nurturing nature creates harmony in all your relationships."
  },
  7: {
    number: 7,
    title: "The Seeker",
    traits: ["Analytical", "Spiritual", "Introspective", "Wise"],
    strengths: ["Deep thinking", "Intuition", "Research skills", "Spiritual insight"],
    weaknesses: ["Isolation", "Skepticism", "Secretiveness"],
    career: "Ideal for research, science, philosophy, spirituality, or technology fields.",
    compatibility: "Most compatible with 5, 7, and 1. Challenging with 2 and 6.",
    description: "Your quest for truth and deeper meaning sets you apart. You possess profound wisdom and spiritual insight that guides your path."
  },
  8: {
    number: 8,
    title: "The Achiever",
    traits: ["Ambitious", "Authoritative", "Efficient", "Goal-oriented"],
    strengths: ["Business acumen", "Leadership", "Material success", "Organization"],
    weaknesses: ["Materialism", "Workaholism", "Domineering"],
    career: "Destined for business, finance, law, politics, or executive positions.",
    compatibility: "Most compatible with 2, 4, and 8. Challenging with 1 and 3.",
    description: "You are destined for material success and authority. Your powerful drive and business sense create abundance in all areas of life."
  },
  9: {
    number: 9,
    title: "The Humanitarian",
    traits: ["Compassionate", "Generous", "Idealistic", "Universal love"],
    strengths: ["Selflessness", "Artistic talent", "Wisdom", "Healing abilities"],
    weaknesses: ["Over-idealistic", "Detached", "Mood swings"],
    career: "Perfect for humanitarian work, arts, healing professions, or philanthropy.",
    compatibility: "Most compatible with 3, 6, and 9. Challenging with 4 and 8.",
    description: "You embody universal love and compassion. Your humanitarian spirit seeks to uplift humanity and create a better world for all."
  },
  11: {
    number: 11,
    title: "The Intuitive Master",
    traits: ["Visionary", "Intuitive", "Inspiring", "Spiritual"],
    strengths: ["Psychic abilities", "Spiritual insight", "Innovation", "Charisma"],
    weaknesses: ["Nervous tension", "Impracticality", "Self-doubt"],
    career: "Suited for spiritual leadership, counseling, teaching, or creative arts.",
    compatibility: "Most compatible with 2, 4, and 6. Special bond with other master numbers.",
    description: "As a master number, you carry heightened spiritual awareness and intuitive gifts. You are here to inspire and illuminate the path for others."
  },
  22: {
    number: 22,
    title: "The Master Builder",
    traits: ["Visionary", "Practical dreamer", "Powerful", "Disciplined"],
    strengths: ["Turning dreams into reality", "Large-scale thinking", "Leadership", "Manifestation"],
    weaknesses: ["Overwhelming pressure", "Perfectionism", "Power struggles"],
    career: "Destined for major projects, architecture, international business, or social reform.",
    compatibility: "Most compatible with 4, 6, and 8. Special bond with other master numbers.",
    description: "The most powerful of all numbers, you can manifest grand visions into reality. You are here to leave a lasting legacy for humanity."
  },
  33: {
    number: 33,
    title: "The Master Teacher",
    traits: ["Selfless", "Nurturing", "Healing", "Spiritually evolved"],
    strengths: ["Unconditional love", "Teaching abilities", "Healing presence", "Sacrifice"],
    weaknesses: ["Self-sacrifice to detriment", "Emotional burden", "Perfectionism"],
    career: "Called to healing, teaching, spiritual guidance, or humanitarian service.",
    compatibility: "Compatible with all numbers. Special bond with 6, 9, and other master numbers.",
    description: "The Master Teacher carries the vibration of unconditional love and healing. You are here to elevate human consciousness through love and wisdom."
  }
};

export const karmicLessons: Record<number, string> = {
  1: "Learn self-confidence and independence without domination",
  2: "Master patience, cooperation, and diplomatic skills",
  3: "Develop creative expression and overcome self-doubt",
  4: "Build discipline, organization, and practical foundations",
  5: "Embrace change while maintaining responsibility",
  6: "Balance family duties with personal needs",
  7: "Trust intuition and develop spiritual faith",
  8: "Handle power and material success with wisdom",
  9: "Practice selfless service and release attachments"
};
