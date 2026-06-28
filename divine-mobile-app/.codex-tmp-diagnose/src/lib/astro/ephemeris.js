/**
 * High-Precision Ephemeris Wrapper
 * Uses 'astronomy-engine' (Cosmic Core) for VSOP87/ELP2000.
 * Calculation:
 * - Planets: Astronomy.Equator (J2000 Equator of Date) -> Converted to Ecliptic
 * - Ayanamsha: Manual Calculation (Lahiri)
 * - Nutation/Obliquity: Manual Calculation (IAU 2000 simplified)
 */
// Import from local vendored file to avoid bundler issues
import { MakeTime, Equator, Ecliptic, e_tilt, SiderealTime } from "./astronomy-core";
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
export const getJulianDay = (date) => {
    try {
        return MakeTime(date).ut;
    }
    catch (e) {
        console.error("Ephemeris Error:", e);
        return 0;
    }
};
/**
 * Local Apparent Sidereal Time (LAST)
 * Accurate to library standard
 */
export const getLST = (date, lon) => {
    const time = MakeTime(date);
    const gastHours = SiderealTime(time);
    const gastDegrees = gastHours * 15;
    return normalize(gastDegrees + lon);
};
/**
 * High-Precision Lahiri Ayanamsha (Chitrapaksha)
 * Standard Vedic offset at J2000: 23.8570925
 */
export const getLahiriAyanamsha = (date) => {
    const time = MakeTime(date);
    const T = time.tt / 36525.0; // Centuries since J2000
    // Mean Ayanamsha (Precise Lahiri)
    const meanAyanams = 23.8570925 + (5029.0966 / 3600) * T + (1.111 / 3600) * T * T;
    // Apply Nutation correction from library
    const et = e_tilt(time);
    return meanAyanams + (et.dpsi / 3600);
};
/**
 * Calculate Ascendant in Tropical Zodiac
 */
export const getAscendantTropical = (date, lat, lon) => {
    const lst = getLST(date, lon);
    const time = MakeTime(date);
    const et = e_tilt(time);
    const eps = et.tobl;
    const alpha = lst * D2R;
    const phi = lat * D2R;
    const e = eps * D2R;
    const top = -Math.cos(alpha);
    const bottom = Math.sin(alpha) * Math.cos(e) + Math.tan(phi) * Math.sin(e);
    let asc = Math.atan2(top, bottom) * R2D;
    return normalize(asc + 180);
};
// Mean Node (Rahu) - IAU/Meeus Standard for Vedic
export const getMeanNode = (date) => {
    const time = MakeTime(date);
    const T = time.tt / 36525.0;
    let node = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T / 450000);
    return normalize(node);
};
const normalize = (d) => {
    let a = d % 360;
    if (a < 0)
        a += 360;
    return a;
};
/**
 * Calculates Tropical Coordinates for all planets.
 * Returns both longitude and speed.
 */
export const getPlanetaryPositionsTropicalWithSpeed = (date) => {
    const time = MakeTime(date);
    const timePrev = time.AddDays(-1 / 1440); // 1 minute previous
    const results = {};
    const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
    const getLon = (t, p) => {
        // Get Equatorial J2000 (No precess/nutat in Equator call)
        const eqj = Equator(p, t, null, false, false);
        // Convert to Ecliptic of Date using library function
        const ecl = Ecliptic(eqj.vec);
        return normalize(ecl.elon);
    };
    planets.forEach(p => {
        const lon = getLon(time, p);
        const prevLon = getLon(timePrev, p);
        let diff = lon - prevLon;
        if (diff < -180)
            diff += 360;
        if (diff > 180)
            diff -= 360;
        results[p] = { lon, speed: diff * 1440 };
    });
    const node = getMeanNode(date);
    const prevNode = getMeanNode(new Date(date.getTime() - 60000));
    let nodeDiff = node - prevNode;
    if (nodeDiff < -180)
        nodeDiff += 360;
    if (nodeDiff > 180)
        nodeDiff -= 360;
    results["Rahu"] = { lon: node, speed: nodeDiff * 1440 };
    results["Ketu"] = { lon: normalize(node + 180), speed: nodeDiff * 1440 };
    return results;
};
export const getPlanetaryPositionsTropical = (date) => {
    const full = getPlanetaryPositionsTropicalWithSpeed(date);
    const results = {};
    Object.entries(full).forEach(([k, v]) => results[k] = v.lon);
    return results;
};
