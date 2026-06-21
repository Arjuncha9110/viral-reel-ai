import { Timestamp } from "firebase/firestore";

export interface PlanetPositionData {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
  house: number;
  nakshatra: string;
  pada: number;
  retrograde: boolean;
  combust: boolean;
  speed: number;
  dms: { d: number; m: number; s: number };
}

export interface PanchangData {
  tithi: string;
  yoga: string;
  karana: string;
}

export interface CalculationMetadata {
  calculationVersion: string;
  engineSource: string;
  timezoneId: string;
  utcOffset: string;
}

export interface CosmicIdentity {
  lagna: string;
  lagnaDegree: number;
  moonSign: string;
  rashi: string;
  nakshatra: string;
  nakshatraPada: number;
  currentDasha: string;
  
  // Strong types
  planetPositions: Record<string, PlanetPositionData>;
  housePositions: Record<number, string[]>;
  
  panchang: PanchangData;

  luckyNumber: number;
  luckyColor: string;
  basicDerived: boolean;

  metadata: CalculationMetadata;
  generatedAt: Timestamp;
}
