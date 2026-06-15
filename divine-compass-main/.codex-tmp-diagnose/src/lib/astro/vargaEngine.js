/**
 * Calculates the sign number (1-12) for a given longitude in a divisional chart.
 * @param longitude True Sidereal Longitude (0-360)
 * @param division The division number (e.g., 9 for Navamsa)
 * @returns Sign number (1-12)
 */
export const calculateDivisionalSign = (longitude, division, chartType = "D1") => {
    // Normalize longitude
    let lon = longitude % 360;
    if (lon < 0)
        lon += 360;
    const currentSign = Math.floor(lon / 30) + 1; // 1-12
    const degreeInSign = lon % 30;
    switch (chartType) {
        case "D1": // Rashi (Main)
            return currentSign;
        case "D2": // Hora (Parashara)
            // Odd signs: 1st half -> Leo (5), 2nd half -> Cancer (4)
            // Even signs: 1st half -> Cancer (4), 2nd half -> Leo (5)
            const isOddSign = currentSign % 2 !== 0;
            const isFirstHalf = degreeInSign < 15;
            if (isOddSign) {
                return isFirstHalf ? 5 : 4; // Sun : Moon
            }
            else {
                return isFirstHalf ? 4 : 5; // Moon : Sun
            }
        case "D7": // Saptamsa
            // Odd signs: Count from current sign
            // Even signs: Count from 7th from current sign
            const d7Part = Math.floor(degreeInSign / (30 / 7));
            if (currentSign % 2 !== 0) {
                return normalizeSign(currentSign + d7Part);
            }
            else {
                return normalizeSign(currentSign + 6 + d7Part);
            }
        case "D9": // Navamsa
            // 1st pada -> Start from Aries (1), Capricorn (10), Libra (7), Cancer (4) [Fi, Ea, Ai, Wa]
            // Standard generic calculation:
            // Absolute navamsa number from 0 Aries
            const navamsaAbs = Math.floor(lon / (30 / 9));
            return (navamsaAbs % 12) + 1;
        case "D10": // Dasamsa
            // Odd signs: Count from current sign
            // Even signs: Count from 9th from current sign
            const d10Part = Math.floor(degreeInSign / (30 / 10));
            if (currentSign % 2 !== 0) {
                return normalizeSign(currentSign + d10Part);
            }
            else {
                return normalizeSign(currentSign + 8 + d10Part);
            }
        case "D12": // Dwadasamsa
            // Count from current sign
            const d12Part = Math.floor(degreeInSign / (30 / 12));
            return normalizeSign(currentSign + d12Part);
        case "D24": // Chaturvimshamsha
            // Odd signs: Start from Leo (5)
            // Even signs: Start from Cancer (4)
            const d24Part = Math.floor(degreeInSign / (30 / 24));
            if (currentSign % 2 !== 0) {
                return normalizeSign(5 + d24Part);
            }
            else {
                return normalizeSign(4 + d24Part);
            }
        case "D27": // Saptavimsamsa (Bhamsha)
            // Like Nakshatras but mapped to signs
            // Starts from Aries, Cancer, Libra, Capricorn based on Triplicity?
            // Standard: Odd->starts from Aries, Even->Cancer? No, D27 is specific
            // Calculation: (Part * 12) + 1 ... specialized logic
            // Simple generic: Count from Aries, Cancer, Libra, Capricorn depending on nakshatra pada logic
            // Using standard Parashara D27:
            // Fi (1,5,9): Start Aries (1)
            // Ea (2,6,10): Start Cancer (4)
            // Ai (3,7,11): Start Libra (7)
            // Wa (4,8,12): Start Capricorn (10)
            const d27Part = Math.floor(degreeInSign / (30 / 27));
            const triplicity = (currentSign - 1) % 4; // 0=Fi, 1=Ea, 2=Ai, 3=Wa
            const startSign = [1, 4, 7, 10][triplicity];
            return normalizeSign(startSign + d27Part);
        case "D60": // Shashtiamsha
            // Count from current sign (Generic) or specific mapping
            // Parashara: Ignore "sign" counting, purely based on part?
            // Standard method: (Sign - 1) * 60 + Part ... then mod 12
            // Actually D60 is often mapped from the current sign or direct calculation
            // Most software: Abs calculation
            const d60Part = Math.floor(degreeInSign / (30 / 60));
            return normalizeSign(currentSign + d60Part);
        default:
            return currentSign;
    }
};
const normalizeSign = (val) => {
    let s = val % 12;
    return s === 0 ? 12 : s;
};
/**
 * Generates planetary positions for a specific divisional chart.
 */
export const getVargaPlanets = (planets, chartType) => {
    // Determine the division number
    const divMap = {
        "D1": 1, "D2": 2, "D7": 7, "D9": 9, "D10": 10,
        "D12": 12, "D24": 24, "D27": 27, "D60": 60
    };
    const div = divMap[chartType] || 1;
    return planets.map(p => {
        // Calculate new sign
        const newSignNum = calculateDivisionalSign(p.longitude, div, chartType);
        // Convert number to sign name
        const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
        const newSignName = SIGNS[newSignNum - 1];
        // For House, we need the Ascendant of this Varga
        // The Ascendant object itself needs to be recalculated for the varga, but here we just process planets.
        // The calling component must handle House calculation relative to Varga Ascendant.
        return {
            ...p,
            sign: newSignName,
            // Longitude within the Varga sign is usually not displayed or just set to 0 for simple placement
            // Advanced: Calculate exact degree in varga (not required for standard placement charts)
            house: 0 // To be calculated after Ascendant is known
        };
    });
};
