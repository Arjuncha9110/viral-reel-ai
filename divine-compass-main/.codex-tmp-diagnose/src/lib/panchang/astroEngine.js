import { getTropicalMoonLongitude } from "./betterMoon";
// Helper for Julian Day
const getJulianDay = (date) => {
    return (date.getTime() / 86400000) + 2440587.5;
};
const D2R = Math.PI / 180;
// Lahiri Ayanamsha (Chitra Paksha) Calculation
const getLahiriAyanamsha = (date) => {
    const jd = getJulianDay(date);
    const T = (jd - 2451545.0) / 36525;
    return 23.85708 + (1.39688 * T);
};
const normalizeAngle = (deg) => {
    let a = deg % 360;
    if (a < 0)
        a += 360;
    return a;
};
export const getSiderealMoonLongitude = (date) => {
    const tropical = getTropicalMoonLongitude(date);
    const ayanamsha = getLahiriAyanamsha(date);
    return normalizeAngle(tropical - ayanamsha);
};
export const getSunLongitude = (date) => {
    const jd = getJulianDay(date);
    const T = (jd - 2451545.0) / 36525.0;
    // Low precision but good enough for Tithi/Yoga transitions within minutes
    const L = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * D2R)
        + (0.019993 - 0.000101 * T) * Math.sin(2 * M * D2R)
        + 0.000289 * Math.sin(3 * M * D2R);
    const tropical = normalizeAngle(L + C);
    const ayanamsha = getLahiriAyanamsha(date);
    return normalizeAngle(tropical - ayanamsha);
};
export const getTithiData = (date) => {
    const moon = getSiderealMoonLongitude(date);
    const sun = getSunLongitude(date);
    let diff = moon - sun;
    if (diff < 0)
        diff += 360;
    const index = Math.floor(diff / 12);
    const percent = (diff % 12) / 12;
    const names = [
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
        "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
        "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
        "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
        "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
    ];
    return {
        name: names[index] || "Unknown",
        index: index + 1,
        paksha: index < 15 ? "Shukla Paksha" : "Krishna Paksha",
        percent,
        targetLon: (index + 1) * 12
    };
};
export const getNakshatraData = (siderealLon) => {
    const span = 360 / 27;
    const index = Math.floor(siderealLon / span);
    const percent = (siderealLon - (index * span)) / span;
    const pada = Math.floor(percent * 4) + 1;
    const names = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra",
        "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
        "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
        "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
        "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ];
    const lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
    return {
        name: names[index] || "Unknown",
        index: index + 1,
        pada: pada,
        lord: lords[index % 9],
        percent,
        targetLon: (index + 1) * span
    };
};
export const getYogaData = (date) => {
    const moon = getSiderealMoonLongitude(date);
    const sun = getSunLongitude(date);
    const sum = normalizeAngle(moon + sun);
    const span = 360 / 27;
    const index = Math.floor(sum / span);
    const percent = (sum % span) / span;
    const names = [
        "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana",
        "Atiganda", "Sukarman", "Dhriti", "Shoola", "Ganda",
        "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
        "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
        "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
        "Indra", "Vaidhriti"
    ];
    return {
        name: names[index] || "Unknown",
        index: index + 1,
        percent,
        targetLon: (index + 1) * span
    };
};
export const getKaranaData = (date) => {
    const moon = getSiderealMoonLongitude(date);
    const sun = getSunLongitude(date);
    let diff = moon - sun;
    if (diff < 0)
        diff += 360;
    // Karana changes every 6 degrees
    const index = Math.floor(diff / 6);
    const percent = (diff % 6) / 6;
    // Fixed Karanas (Kinstughna, Shakuni, Chatushpada, Naga)
    // 1st Karana of 1st Tithi is Kinstughna (index 0)
    // Then 8 cycles of 7 moveable Karanas (Bava to Vishti)
    // Then 3 fixed at the end
    const moveable = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
    const fixed = ["Shakuni", "Chatushpada", "Naga", "Kimsthughna"];
    let name = "";
    if (index === 0)
        name = "Kimsthughna";
    else if (index >= 57)
        name = fixed[index - 57];
    else
        name = moveable[(index - 1) % 7];
    return {
        name,
        index: index + 1,
        percent,
        targetLon: (index + 1) * 6
    };
};
/**
 * Generalized function to find when a segment ends.
 * @param date Current date
 * @param getter Function that returns the current index and progress
 * @param approxSpeed Approximate speed of transition (deg/hour)
 */
export const findSegmentEnd = (date, getter, approxSpeed = 0.5 // Moon moves ~0.5 deg/hr
) => {
    let current = new Date(date);
    let initialData = getter(current);
    // 1. Initial Jump
    // Get current lon/diff and calculate how far to target
    // For simplicity, we step through.
    // Coarse search: 30 min steps
    const coarseStep = 30 * 60 * 1000;
    for (let i = 0; i < 60; i++) { // Max 30 hours
        const next = new Date(current.getTime() + coarseStep);
        if (getter(next).index !== initialData.index)
            break;
        current = next;
    }
    // Medium search: 5 min steps
    const medStep = 5 * 60 * 1000;
    for (let i = 0; i < 7; i++) {
        const next = new Date(current.getTime() + medStep);
        if (getter(next).index !== initialData.index)
            break;
        current = next;
    }
    // Fine search: 1 min steps
    const fineStep = 1 * 60 * 1000;
    for (let i = 0; i < 6; i++) {
        const next = new Date(current.getTime() + fineStep);
        if (getter(next).index !== initialData.index)
            return next;
        current = next;
    }
    return current;
};
