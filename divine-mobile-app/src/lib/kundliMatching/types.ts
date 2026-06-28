export interface ExtractedKundliData {
  name: string;
  dateOfBirth: string; // e.g. "23-01-1996" or similar extracted format
  timeOfBirth: string; // e.g. "14:30"
  placeOfBirth: string;
  lagna: string;
  moonSign: string;
  nakshatra: string;
  nakshatraPada?: string;
  planets: {
    name: string;
    longitude: number;
    sign: string;
    house: number;
    retrograde?: boolean;
    combust?: boolean;
    dignity?: string;
  }[];
  manglikStatus?: string;
  isAvailable: boolean; // false if parsing failed entirely
}

export interface AshtakootScore {
  score: number;
  max: number;
  description: string;
}

export interface AshtakootResult {
  varna: AshtakootScore;
  vashya: AshtakootScore;
  tara: AshtakootScore;
  yoni: AshtakootScore;
  grahaMaitri: AshtakootScore;
  gana: AshtakootScore;
  bhakoot: AshtakootScore;
  nadi: AshtakootScore;
  totalScore: number;
}

export interface CalculatedPlanet {
  name: string;
  siderealLongitude: number;
  d1Sign: string;
  d1Degree: number; // e.g. 15.42 (degrees within sign)
  d9Sign: string;
}

export interface MatchAnalysisResult {
  groomName: string;
  brideName: string;
  
  // If deterministic Ashtakoot was not possible/incomplete, AI calculates/returns this
  ashtakoot?: AshtakootResult;
  
  emotionalHarmony: string;
  practicalCompatibility: string;
  physicalChemistry: string;
  manglikDoshaAnalysis: string;
  d9NavamsaIndications?: string; // If Navamsa data was successfully extracted
  
  strengths: string[];
  cautionAreas: string[];
  finalVerdict: string;
  recommendationRating: number; // e.g., out of 10
  
  // Deterministic calculated planets (Sun -> Ketu)
  groomPlanets?: CalculatedPlanet[];
  bridePlanets?: CalculatedPlanet[];
}
