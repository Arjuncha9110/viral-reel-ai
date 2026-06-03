export interface AshtakootResult {
  varna: { score: number; max: number; description: string };
  vashya: { score: number; max: number; description: string };
  tara: { score: number; max: number; description: string };
  yoni: { score: number; max: number; description: string };
  grahaMaitri: { score: number; max: number; description: string };
  gana: { score: number; max: number; description: string };
  bhakoot: { score: number; max: number; description: string };
  nadi: { score: number; max: number; description: string };
  totalScore: number;
  maxScore: number;
}

// 1. Varna: Brahmin (4), Kshatriya (3), Vaishya (2), Shudra (1)
const getVarna = (sign: string) => {
  const s = sign.toLowerCase();
  if (["cancer", "scorpio", "pisces"].includes(s)) return 4;
  if (["aries", "leo", "sagittarius"].includes(s)) return 3;
  if (["taurus", "virgo", "capricorn"].includes(s)) return 2;
  return 1; // Gemini, Libra, Aquarius (Shudra)
};

const calculateVarna = (boySign: string, girlSign: string) => {
  const b = getVarna(boySign);
  const g = getVarna(girlSign);
  return {
    score: b >= g ? 1 : 0,
    max: 1,
    description: b >= g ? "Excellent (Boy's Varna is higher or equal)" : "Low compatibility (Boy's Varna is lower)"
  };
};

// 2. Vashya (Simplified 2 pts)
const calculateVashya = (boySign: string, girlSign: string) => {
  // Simplified logic for UI rendering purposes. In a full engine, this is a 5x5 matrix.
  const score = boySign === girlSign ? 2 : 1;
  return {
    score,
    max: 2,
    description: score === 2 ? "High magnetic attraction" : "Average attraction"
  };
};

// 3. Tara
const nakshatraIndex = (name: string) => {
  const list = ["ashwini","bharani","krittika","rohini","mrigashira","ardra","punarvasu","pushya","ashlesha","magha","purva phalguni","uttara phalguni","hasta","chitra","swati","vishakha","anuradha","jyeshtha","moola","purva ashadha","uttara ashadha","shravana","dhanishtha","shatabhisha","purva bhadrapada","uttara bhadrapada","revati"];
  return list.indexOf(name.toLowerCase());
};

const calculateTara = (boyNak: string, girlNak: string) => {
  const b = nakshatraIndex(boyNak);
  const g = nakshatraIndex(girlNak);
  if (b === -1 || g === -1) return { score: 0, max: 3, description: "Unknown Nakshatra" };
  
  const bToG = (g - b + 27) % 27 || 27;
  const gToB = (b - g + 27) % 27 || 27;
  
  const bScore = (bToG % 9) % 2 === 0 ? 1.5 : 0;
  const gScore = (gToB % 9) % 2 === 0 ? 1.5 : 0;
  const total = bScore + gScore;

  return {
    score: total,
    max: 3,
    description: total >= 2 ? "Excellent destiny alignment" : "Average destiny alignment"
  };
};

// 4. Yoni (Simplified)
const calculateYoni = (boyNak: string, girlNak: string) => {
  const score = boyNak === girlNak ? 4 : 2.5;
  return {
    score,
    max: 4,
    description: score === 4 ? "Perfect physical compatibility" : "Good physical compatibility"
  };
};

// 5. Graha Maitri (Simplified)
const calculateGrahaMaitri = (boySign: string, girlSign: string) => {
  const score = boySign === girlSign ? 5 : 3;
  return {
    score,
    max: 5,
    description: score === 5 ? "Excellent mental compatibility" : "Average mental harmony"
  };
};

// 6. Gana
const getGana = (idx: number) => {
  const deva = [0,4,6,7,12,14,21,26];
  const manushya = [1,3,5,10,11,19,20,24,25];
  if (deva.includes(idx)) return "Deva";
  if (manushya.includes(idx)) return "Manushya";
  return "Rakshasa";
};

const calculateGana = (boyNak: string, girlNak: string) => {
  const b = getGana(nakshatraIndex(boyNak));
  const g = getGana(nakshatraIndex(girlNak));
  
  let score = 0;
  if (b === g) score = 6;
  else if (b === "Deva" && g === "Manushya") score = 6;
  else if (b === "Manushya" && g === "Deva") score = 5;
  else if (b === "Rakshasa" && g === "Deva") score = 1;
  else if (b === "Deva" && g === "Rakshasa") score = 0;
  else score = 0; // Simplified
  
  return {
    score,
    max: 6,
    description: score >= 5 ? "Excellent temperament match" : "Temperament mismatch"
  };
};

// 7. Bhakoot
const getSignIndex = (sign: string) => {
  const signs = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
  return signs.indexOf(sign.toLowerCase());
};

const calculateBhakoot = (boySign: string, girlSign: string) => {
  const b = getSignIndex(boySign);
  const g = getSignIndex(girlSign);
  if (b === -1 || g === -1) return { score: 0, max: 7, description: "Unknown Sign" };
  
  const diff = Math.abs(b - g);
  const distance = Math.min(diff, 12 - diff); // Shortest distance
  
  // 1/7, 3/11, 4/10 are auspicious (7 points). 2/12, 6/8, 5/9 are inauspicious (0 points).
  let score = 7;
  if (distance === 1 || distance === 5 || distance === 6) score = 0;
  
  return {
    score,
    max: 7,
    description: score === 7 ? "Excellent emotional harmony" : "Bhakoot Dosha present"
  };
};

// 8. Nadi
const getNadi = (idx: number) => {
  return idx % 3; // 0 = Adi, 1 = Madhya, 2 = Antya
};

const calculateNadi = (boyNak: string, girlNak: string) => {
  const b = getNadi(nakshatraIndex(boyNak));
  const g = getNadi(nakshatraIndex(girlNak));
  
  const score = b !== g ? 8 : 0;
  return {
    score,
    max: 8,
    description: score === 8 ? "Excellent genetic compatibility" : "Nadi Dosha present"
  };
};

export const calculateAshtakoot = (boySign: string, boyNakshatra: string, girlSign: string, girlNakshatra: string): AshtakootResult => {
  const varna = calculateVarna(boySign, girlSign);
  const vashya = calculateVashya(boySign, girlSign);
  const tara = calculateTara(boyNakshatra, girlNakshatra);
  const yoni = calculateYoni(boyNakshatra, girlNakshatra);
  const grahaMaitri = calculateGrahaMaitri(boySign, girlSign);
  const gana = calculateGana(boyNakshatra, girlNakshatra);
  const bhakoot = calculateBhakoot(boySign, girlSign);
  const nadi = calculateNadi(boyNakshatra, girlNakshatra);
  
  const totalScore = varna.score + vashya.score + tara.score + yoni.score + grahaMaitri.score + gana.score + bhakoot.score + nadi.score;
  
  return {
    varna,
    vashya,
    tara,
    yoni,
    grahaMaitri,
    gana,
    bhakoot,
    nadi,
    totalScore,
    maxScore: 36
  };
};
