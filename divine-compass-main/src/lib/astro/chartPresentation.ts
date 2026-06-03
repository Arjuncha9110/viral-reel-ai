export type RegionalChartStyle = "north" | "south";

export const REGIONAL_CHART_STYLES: {
  value: RegionalChartStyle;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    value: "north",
    label: "North Indian",
    shortLabel: "North",
    description: "Classic diamond-style Lagna layout used widely across North India.",
  },
  {
    value: "south",
    label: "South Indian",
    shortLabel: "South",
    description: "Traditional fixed-sign square layout with strong visual clarity.",
  },
];

export type PlanetDignity =
  | "exalted"
  | "own"
  | "friendly"
  | "neutral"
  | "debilitated"
  | "enemy";

export const getPlanetDignity = (planet: string, signIndex: number): PlanetDignity => {
  switch (planet) {
    case "Sun":
      if (signIndex === 0) return "exalted";
      if (signIndex === 4) return "own";
      if (signIndex === 6) return "debilitated";
      if ([1, 5].includes(signIndex)) return "friendly";
      if ([7, 8, 11].includes(signIndex)) return "neutral";
      return "enemy";
    case "Moon":
      if (signIndex === 1) return "exalted";
      if (signIndex === 3) return "own";
      if (signIndex === 7) return "debilitated";
      if ([0, 4, 9].includes(signIndex)) return "friendly";
      if ([2, 5, 10].includes(signIndex)) return "neutral";
      return "enemy";
    case "Mars":
      if (signIndex === 9) return "exalted";
      if (signIndex === 0 || signIndex === 7) return "own";
      if (signIndex === 3) return "debilitated";
      if ([4, 8].includes(signIndex)) return "friendly";
      if ([1, 6, 10].includes(signIndex)) return "neutral";
      return "enemy";
    case "Mercury":
      if (signIndex === 5) return "exalted";
      if (signIndex === 2 || signIndex === 5) return "own";
      if (signIndex === 11) return "debilitated";
      if ([1, 6].includes(signIndex)) return "friendly";
      if ([0, 3, 7].includes(signIndex)) return "neutral";
      return "enemy";
    case "Jupiter":
      if (signIndex === 3) return "exalted";
      if (signIndex === 8 || signIndex === 11) return "own";
      if (signIndex === 9) return "debilitated";
      if ([0, 4, 5].includes(signIndex)) return "friendly";
      if ([1, 7].includes(signIndex)) return "neutral";
      return "enemy";
    case "Venus":
      if (signIndex === 11) return "exalted";
      if (signIndex === 1 || signIndex === 6) return "own";
      if (signIndex === 5) return "debilitated";
      if ([2, 9, 10].includes(signIndex)) return "friendly";
      if ([3, 8].includes(signIndex)) return "neutral";
      return "enemy";
    case "Saturn":
      if (signIndex === 6) return "exalted";
      if (signIndex === 9 || signIndex === 10) return "own";
      if (signIndex === 0) return "debilitated";
      if ([2, 5].includes(signIndex)) return "friendly";
      if ([1, 7, 11].includes(signIndex)) return "neutral";
      return "enemy";
    case "Rahu":
      if (signIndex === 1 || signIndex === 2) return "exalted";
      if (signIndex === 8) return "debilitated";
      return "neutral";
    case "Ketu":
      if (signIndex === 8) return "exalted";
      if (signIndex === 2) return "debilitated";
      return "neutral";
    default:
      return "neutral";
  }
};

export const getDignityMarker = (dignity: PlanetDignity) => {
  if (dignity === "exalted") return "↑";
  if (dignity === "debilitated") return "↓";
  return "";
};

export const getDignityLabel = (dignity: PlanetDignity) => {
  if (dignity === "own") return "Own Sign";
  if (dignity === "friendly") return "Friendly";
  if (dignity === "enemy") return "Enemy Sign";
  return dignity.charAt(0).toUpperCase() + dignity.slice(1);
};

export const getPlanetAbbreviation = (name: string, isKn?: boolean) => {
  if (isKn) {
    const knMap: Record<string, string> = {
      Sun: "ರವಿ (ಸೂರ್ಯ)",
      Moon: "ಚಂದ್ರ (ಸೋಮ)",
      Mars: "ಮಂಗಳ (ಕುಜ)",
      Mercury: "ಬುಧ (ಸೌಮ್ಯ)",
      Jupiter: "ಗುರು (ಬೃಹಸ್ಪತಿ)",
      Venus: "ಶುಕ್ರ (ಭಾರ್ಗವ)",
      Saturn: "ಶನಿ",
      Rahu: "ರಾಹು",
      Ketu: "ಕೇತು",
      Ascendant: "ಲಗ್ನ",
    };
    return knMap[name] || name;
  }

  const abbrevMap: Record<string, string> = {
    Sun: "Su",
    Moon: "Mo",
    Mars: "Ma",
    Mercury: "Me",
    Jupiter: "Ju",
    Venus: "Ve",
    Saturn: "Sa",
    Rahu: "Ra",
    Ketu: "Ke",
    Ascendant: "As",
  };

  return abbrevMap[name] || name.substring(0, 2);
};
