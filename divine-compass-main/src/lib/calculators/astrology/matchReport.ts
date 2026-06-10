import type { ExtractedKundliData, MatchAnalysisResult, CalculatedPlanet } from "@/lib/kundliMatching/types";
import type { AshtakootResult } from "./ashtakoot";
import { getPlanetaryPositionsTropicalWithSpeed, getLahiriAyanamsha } from "@/lib/astro/ephemeris";

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

function parseKundliDate(dateStr: string, timeStr: string): Date | null {
  try {
    if (!dateStr || dateStr === "Unknown") return null;
    if (!timeStr || timeStr === "Unknown") timeStr = "12:00"; 

    // Remove day names like "Saturday, "
    let cleanedDateStr = dateStr.replace(/^[a-zA-Z]+,\s*/, "").trim();

    // Try native parsing first with IST timezone explicitly added
    let nativeDate = new Date(`${cleanedDateStr} ${timeStr} +05:30`);
    if (!isNaN(nativeDate.getTime())) {
      return nativeDate;
    }

    // Fallback parsing (e.g. DD-MM-YYYY)
    const dParts = cleanedDateStr.split(/[-/.\s]/);
    let day=1, month=1, year=2000;
    if (dParts.length >= 3) {
      if (dParts[0].length === 4) { 
         year = parseInt(dParts[0]); month = parseInt(dParts[1]); day = parseInt(dParts[2]);
      } else { 
         day = parseInt(dParts[0]); month = parseInt(dParts[1]); year = parseInt(dParts[2]);
      }
    } else {
      return null;
    }
    
    let hours = 12, mins = 0;
    const tParts = timeStr.replace(/[a-zA-Z]/g, "").trim().split(/[:\s]/);
    if (tParts.length >= 2) {
      hours = parseInt(tParts[0]);
      mins = parseInt(tParts[1]);
      if (timeStr.toLowerCase().includes("pm") && hours < 12) hours += 12;
      if (timeStr.toLowerCase().includes("am") && hours === 12) hours = 0;
    }
    
    // Assume IST (UTC+5:30)
    const utcHours = hours - 5;
    const utcMins = mins - 30;
    const dt = new Date(Date.UTC(year, month - 1, day, utcHours, utcMins));
    if (isNaN(dt.getTime())) return null;
    return dt;
  } catch (e) {
    return null;
  }
}

function computePlanetaryPositions(date: Date | null): CalculatedPlanet[] {
  if (!date) return [];
  const trop = getPlanetaryPositionsTropicalWithSpeed(date);
  const ayanamsha = getLahiriAyanamsha(date);
  
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  
  return planets.map(name => {
    let lon = trop[name].lon - ayanamsha;
    if (lon < 0) lon += 360;
    lon = lon % 360;
    
    const d1Index = Math.floor(lon / 30);
    const d1Degree = lon % 30;
    const navamsaAbs = Math.floor(lon / (360 / 108));
    const d9Index = navamsaAbs % 12;
    
    return {
      name,
      siderealLongitude: lon,
      d1Sign: SIGNS[d1Index],
      d1Degree: Number(d1Degree.toFixed(2)),
      d9Sign: SIGNS[d9Index]
    };
  });
}

export function generateDeterministicMatchAnalysis(
  groomData: ExtractedKundliData,
  brideData: ExtractedKundliData,
  ashtakoot: AshtakootResult
): MatchAnalysisResult {
  // 1. Emotional Harmony (Bhakoot + Graha Maitri)
  let emotionalHarmony = "";
  if (ashtakoot.bhakoot.score > 0 && ashtakoot.grahaMaitri.score >= 4) {
    emotionalHarmony = "The moon signs indicate a profound emotional resonance. Both individuals share a deep, intuitive understanding of each other's emotional needs. The planetary alignment brings stability and nurturing energy to the union, making it easy to resolve conflicts through mutual empathy.";
  } else if (ashtakoot.bhakoot.score === 0) {
    emotionalHarmony = "Bhakoot Dosha is present, which indicates potential emotional friction or misunderstandings regarding each other's core needs. The couple will need to consciously practice patience, avoid ego-driven arguments, and maintain transparent communication to bridge their different emotional languages.";
  } else {
    emotionalHarmony = "There is an average level of emotional harmony. While the couple may not always instinctively understand each other's unstated feelings, they can build a strong emotional foundation through open dialogue and mutual respect.";
  }

  // 2. Practical Compatibility (Varna + Tara + Gana)
  let practicalCompatibility = "";
  if (ashtakoot.varna.score > 0 && ashtakoot.gana.score >= 5) {
    practicalCompatibility = "From a practical standpoint, the charts show strong alignment in life goals and daily rhythms. Their temperaments are highly compatible, meaning they will easily synchronize their daily habits and handle life's practical challenges as a unified team.";
  } else if (ashtakoot.gana.score <= 1) {
    practicalCompatibility = "There is a noticeable mismatch in temperament (Gana). One partner may prefer a significantly different pace or lifestyle than the other, which can lead to friction over daily routines. Compromise and giving each other personal space will be vital for a harmonious domestic life.";
  } else {
    practicalCompatibility = "Practical compatibility is moderate. The couple shares some common ground in their approach to life but will need to actively negotiate shared responsibilities and long-term planning.";
  }

  // 3. Physical Chemistry (Yoni + Vashya)
  let physicalChemistry = "";
  if (ashtakoot.yoni.score >= 3 && ashtakoot.vashya.score === 2) {
    physicalChemistry = "The elemental combination suggests intense and fulfilling physical chemistry. There is a strong magnetic attraction indicated by the alignment of Yoni and Vashya, fostering a deep romantic and intimate bond.";
  } else if (ashtakoot.yoni.score <= 2) {
    physicalChemistry = "Physical compatibility requires conscious cultivation. While the initial attraction may be present, building a deeply fulfilling intimate life will require open communication and understanding of each other's physical needs over time.";
  } else {
    physicalChemistry = "There is a healthy, grounded physical attraction. The couple will find comfort and affection in each other's presence, serving as a steady anchor for the relationship.";
  }

  // 4. Manglik Dosha Analysis
  const gManglik = groomData.manglikStatus?.toLowerCase() || "";
  const bManglik = brideData.manglikStatus?.toLowerCase() || "";
  let manglikDoshaAnalysis = "";
  
  const gHasDosha = gManglik.includes("manglik") && !gManglik.includes("non");
  const bHasDosha = bManglik.includes("manglik") && !bManglik.includes("non");

  if (gHasDosha && bHasDosha) {
    manglikDoshaAnalysis = "Both partners have Manglik indicators in their charts. In Vedic astrology, this is highly auspicious as the martial energy is balanced out between the two, effectively neutralizing the Dosha and ensuring equal energy levels in the marriage.";
  } else if (gHasDosha || bHasDosha) {
    manglikDoshaAnalysis = `Manglik Dosha is present in one chart but not the other. Traditionally, this indicates an imbalance in martial energy or aggression which could lead to friction. It is highly recommended to consult a professional astrologer to check for specific cancellation (Parihara) factors in the individual charts.`;
  } else {
    manglikDoshaAnalysis = "Neither chart indicates a strong Manglik Dosha. The absence of this affliction suggests a generally peaceful and stable marital dynamic free from excessive aggressive or disruptive Mars energy.";
  }

  // 5. Strengths & Cautions
  const strengths: string[] = [];
  const cautionAreas: string[] = [];

  if (ashtakoot.tara.score >= 2) strengths.push("Strong alignment in destiny and mutual luck");
  if (ashtakoot.grahaMaitri.score >= 4) strengths.push("Excellent foundation of friendship and mental compatibility");
  if (ashtakoot.yoni.score >= 3) strengths.push("Deep physical intimacy and romantic chemistry");
  if (ashtakoot.totalScore >= 25) strengths.push("Highly auspicious overall Ashtakoot score");

  if (ashtakoot.nadi.score === 0) cautionAreas.push("Nadi Dosha present: Focus on health and lifestyle balance");
  if (ashtakoot.bhakoot.score === 0) cautionAreas.push("Bhakoot Dosha: Requires patience and emotional transparency");
  if (ashtakoot.gana.score <= 1) cautionAreas.push("Temperament differences: Allow space for different daily rhythms");
  if (ashtakoot.varna.score === 0) cautionAreas.push("Potential differences in spiritual or career priorities");

  if (strengths.length === 0) strengths.push("Commitment to mutual growth and understanding");
  if (cautionAreas.length === 0) cautionAreas.push("Maintain open communication during stressful life transitions");

  // 6. Verdict and Rating
  let finalVerdict = "";
  let recommendationRating = 0;

  if (ashtakoot.totalScore >= 25 && ashtakoot.nadi.score > 0 && ashtakoot.bhakoot.score > 0) {
    finalVerdict = "This is a highly auspicious and harmonious match. The charts show strong potential for a successful, long-lasting marriage built on trust, love, and mutual growth. Blessings of the divine are present.";
    recommendationRating = 9;
  } else if (ashtakoot.totalScore >= 18 && ashtakoot.nadi.score > 0) {
    finalVerdict = "This is a favorable match. While there are some areas requiring conscious effort and understanding, the core compatibility is strong enough to support a happy and fulfilling marriage.";
    recommendationRating = 7;
  } else if (ashtakoot.totalScore >= 18) {
    finalVerdict = "This is an average match. The overall score is acceptable, but the presence of critical doshas (like Nadi or Bhakoot) requires maturity, compromise, and potential astrological remedies for long-term peace.";
    recommendationRating = 5;
  } else {
    finalVerdict = "This is a challenging match according to Vedic principles. The low Ashtakoot score suggests inherent difficulties in aligning emotionally and practically. Significant conscious effort, mutual respect, and patience will be necessary.";
    recommendationRating = 3;
  }

  // 7. D9 Navamsa & Planetary Chart Comparison
  const gDate = parseKundliDate(groomData.dateOfBirth, groomData.timeOfBirth);
  const bDate = parseKundliDate(brideData.dateOfBirth, brideData.timeOfBirth);
  
  const groomPlanets = computePlanetaryPositions(gDate);
  const bridePlanets = computePlanetaryPositions(bDate);
  
  let d9NavamsaIndications = "Precise planetary data was unavailable due to missing exact birth time or date.";
  
  if (groomPlanets.length > 0 && bridePlanets.length > 0) {
    const gVen = groomPlanets.find(p => p.name === "Venus")?.d9Sign;
    const bVen = bridePlanets.find(p => p.name === "Venus")?.d9Sign;
    const gJup = groomPlanets.find(p => p.name === "Jupiter")?.d9Sign;
    const bJup = bridePlanets.find(p => p.name === "Jupiter")?.d9Sign;
    const gMoon = groomPlanets.find(p => p.name === "Moon")?.d9Sign;
    const bMoon = bridePlanets.find(p => p.name === "Moon")?.d9Sign;
    
    let d9narrative = "The Navamsa (D9) chart is the foundational map of the soul's marital destiny and inner spiritual alignment. ";
    
    // Venus (Karaka of Romance & Marriage)
    if (gVen === bVen) {
      d9narrative += `Both partners have their D9 Venus in ${gVen}. This is an incredibly auspicious placement indicating a deep, soul-level romantic bond that will only strengthen over time. You naturally speak the same language of love. `;
    } else {
      d9narrative += `Your D9 Venus placements are in ${gVen} and ${bVen}. This suggests that while your approaches to romance differ, you can offer each other complementary perspectives on love and devotion. `;
    }
    
    // Jupiter (Karaka of Blessings & Expansion)
    if (gJup === bMoon || bJup === gMoon) {
      d9narrative += "There is a beautiful spiritual connection here, as one partner's D9 Jupiter aligns with the other's D9 Moon. This brings profound mutual respect, spiritual growth, and a deeply nurturing dynamic to the relationship. ";
    }
    
    d9narrative += "Note: Because birth locations were extracted from PDF text without precise geo-coordinates, the Ascendant (Lagna) and House cusps have been intentionally omitted to preserve absolute astrological precision. The planetary longitudes and Navamsa calculations provided are exact and deterministic based purely on the date and time of birth.";
    
    d9NavamsaIndications = d9narrative;
  }

  return {
    groomName: groomData.name || "Groom",
    brideName: brideData.name || "Bride",
    ashtakoot,
    emotionalHarmony,
    practicalCompatibility,
    physicalChemistry,
    manglikDoshaAnalysis,
    d9NavamsaIndications,
    strengths,
    cautionAreas,
    finalVerdict,
    recommendationRating,
    groomPlanets,
    bridePlanets
  };
}
