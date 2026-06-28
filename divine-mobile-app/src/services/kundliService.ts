import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { CosmicIdentity, PlanetPositionData, CalculationMetadata } from "../types/kundli";

// Engine Imports
import { getAscendant, getPlanetPositions, mapPlanetsToHouses, PlanetPosition } from "../lib/astro/kundaliEngine";
import { getTithiData, getYogaData, getKaranaData } from "../lib/panchang/astroEngine";
import { calculateVimshottariDasha, toUTC } from "../lib/calculators/astrology/vimshottari";

// The birthDetails shape from onboarding
interface BirthDetailsInput {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezoneId: string;
  rawOffset: number;
  dstOffset: number;
  utcOffset: string;
  formattedAddress: string;
}

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

class KundliService {
  private collectionPath(uid: string) {
    return `users/${uid}/kundali`;
  }

  /**
   * Generates a CosmicIdentity by wrapping native astrology engines.
   */
  async generateKundli(birth: BirthDetailsInput): Promise<CosmicIdentity> {
    try {
      // 1. Resolve UTC Date accurately handling the user's explicit timezone
      const birthUTC = toUTC(birth.date, birth.time, birth.timezoneId);

      // 2. Lagna / Ascendant
      const lagnaDegree = getAscendant(birthUTC, birth.latitude, birth.longitude);
      const lagnaSignIdx = Math.floor(lagnaDegree / 30);
      const lagna = SIGNS[lagnaSignIdx] || "Unknown";

      // 3. Planet Positions & Houses
      const rawPlanets: PlanetPosition[] = getPlanetPositions(birthUTC, birth.latitude, birth.longitude);
      const planetPositions: Record<string, PlanetPositionData> = {};
      
      let moonSign = "Unknown";
      let nakshatra = "Unknown";
      let nakshatraPada = 1;

      rawPlanets.forEach(p => {
        planetPositions[p.name] = {
          name: p.name,
          longitude: p.longitude,
          sign: p.sign,
          degree: p.degree,
          house: p.house,
          nakshatra: p.nakshatra,
          pada: p.pada,
          retrograde: p.retrograde,
          combust: p.combust,
          speed: p.speed,
          dms: p.dms
        };

        if (p.name === "Moon") {
          moonSign = p.sign;
          nakshatra = p.nakshatra;
          nakshatraPada = p.pada;
        }
      });

      const housePositions = mapPlanetsToHouses(rawPlanets);

      // 4. Dasha
      const dashaResult = calculateVimshottariDasha({
        dob: birth.date,
        tob: birth.time,
        timezone: birth.timezoneId
      });
      
      const maha = dashaResult.currentMahadasha?.planet || "Unknown";
      const antar = dashaResult.currentAntardasha?.planet || "Unknown";
      const currentDasha = `${maha}-${antar}`;

      // 5. Panchang
      const tithiData = getTithiData(birthUTC);
      const yogaData = getYogaData(birthUTC);
      const karanaData = getKaranaData(birthUTC);

      // 6. Basic Derived Values (To be improved later)
      // A very rudimentary lucky number based on Moon sign index + 1
      const moonIdx = SIGNS.indexOf(moonSign);
      const luckyNumber = (moonIdx !== -1 ? moonIdx + 1 : 1) % 9 || 9;
      
      // Basic color mapping based on Lagna (just an example mapping)
      const colorMap: Record<string, string> = {
        "Aries": "Red", "Taurus": "White", "Gemini": "Green", "Cancer": "Pearl",
        "Leo": "Orange", "Virgo": "Green", "Libra": "White", "Scorpio": "Red",
        "Sagittarius": "Yellow", "Capricorn": "Blue", "Aquarius": "Blue", "Pisces": "Yellow"
      };
      const luckyColor = colorMap[lagna] || "White";

      // 7. Metadata
      const metadata: CalculationMetadata = {
        calculationVersion: "1.0.0",
        engineSource: "divine-compass-native",
        timezoneId: birth.timezoneId,
        utcOffset: birth.utcOffset
      };

      const identity: CosmicIdentity = {
        lagna,
        lagnaDegree,
        moonSign,
        rashi: moonSign,
        nakshatra,
        nakshatraPada,
        currentDasha,
        planetPositions,
        housePositions,
        panchang: {
          tithi: tithiData.name,
          yoga: yogaData.name,
          karana: karanaData.name
        },
        luckyNumber,
        luckyColor,
        basicDerived: true,
        metadata,
        generatedAt: Timestamp.now() // Note: When saving, we use serverTimestamp() to ensure exact sync
      };

      return identity;
    } catch (error) {
      console.error("Error generating Cosmic Identity:", error);
      throw new Error("Failed to calculate cosmic identity due to engine error.");
    }
  }

  async saveKundli(uid: string, identity: CosmicIdentity): Promise<void> {
    try {
      const docRef = doc(db, this.collectionPath(uid), "basic");
      
      // Replace generatedAt with the server's authoritative timestamp for the database
      const payload = {
        ...identity,
        generatedAt: serverTimestamp()
      };
      
      await setDoc(docRef, payload);
    } catch (error) {
      console.error("Error saving Cosmic Identity:", error);
      throw new Error("Failed to write Cosmic Identity to Firestore.");
    }
  }

  async getKundli(uid: string): Promise<CosmicIdentity | null> {
    try {
      const docRef = doc(db, this.collectionPath(uid), "basic");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as CosmicIdentity;
      }
      return null;
    } catch (error) {
      console.error("Error fetching Cosmic Identity:", error);
      throw error;
    }
  }
}

export const kundliService = new KundliService();
