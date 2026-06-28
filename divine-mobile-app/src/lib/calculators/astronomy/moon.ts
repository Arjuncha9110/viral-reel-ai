/**
 * Astronomy Utilities for Vedic Astrology
 * Implements simplified Meeus algorithms for Moon position
 * and Lahiri Ayanamsha conversion.
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export interface MoonPosition {
    rawLongitude: number; // Tropical
    siderealLongitude: number; // Lahiri
    ayanamsha: number;
}

function normalizeAngle(degrees: number): number {
    let res = degrees % 360;
    if (res < 0) res += 360;
    return res;
}

function toJulianDay(date: Date): number {
    return (date.getTime() / 86400000) + 2440587.5;
}

/**
 * Calculates Lahiri Ayanamsha (Chitra Paksha)
 * Based on linear approximation relative to J2000.
 * @param jd Julian Day
 */
function getLahiriAyanamsha(jd: number): number {
    const T = (jd - 2451545.0) / 36525; // Centuries since J2000
    // Mean Ayanamsha at J2000: ~23.85 degrees (23° 51' 25")
    // Using 23.855 to be closer to Swiss Ephemeris standard for J2000
    // Precession rate: ~1.4 degrees/century (50.27 arcsec/year)
    const offset = 23.855;
    const rate = 1.39688;
    return offset + (rate * T);
}

/**
 * Calculates Tropical Moon Longitude (Low Precision Meeus)
 * Sufficient for "approximate" usage (< 0.3 deg error).
 * @param jd Julian Day
 */
function getTropicalMoonLongitude(jd: number): number {
    const T = (jd - 2451545.0) / 36525;

    // Moon's mean longitude (L')
    const L_prime = 218.3164477 + 481267.88123421 * T;

    // Mean elongation of the Moon (D)
    const D = 297.8501921 + 445267.1114034 * T;

    // Sun's mean anomaly (M)
    const M = 357.5291092 + 35999.0502909 * T;

    // Moon's mean anomaly (M')
    const M_prime = 134.9633964 + 477198.8675055 * T;

    // Moon's argument of latitude (F) - needed for perturbations
    // const F = 93.2720950 + 483202.0175233 * T;

    // Major periodic terms (degrees)
    let longitude = L_prime;

    // Evection (Largest term)
    longitude += 6.2888 * Math.sin(M_prime * RAD);

    // Variation
    longitude += 1.2740 * Math.sin((2 * D - M_prime) * RAD);

    // Annual equation
    longitude += 0.6583 * Math.sin(2 * D * RAD);

    // Parallactic equation
    longitude += 0.2136 * Math.sin(2 * M_prime * RAD);

    // Solar action
    // term: -0.1851 * sin(M)
    longitude -= 0.1851 * Math.sin(M * RAD);

    // Additional terms for better precision ( < 0.1 deg error)
    // Re-calculate F properly:
    const F = 93.2720950 + 483202.0175233 * T;

    longitude -= 0.1143 * Math.sin(2 * F * RAD);

    // Major terms from Meeus truncated series
    longitude -= 0.0588 * Math.sin((2 * D - 2 * M_prime) * RAD);
    longitude -= 0.0574 * Math.sin((2 * D - M - M_prime) * RAD);
    longitude += 0.0533 * Math.sin((2 * D + M_prime) * RAD);
    longitude += 0.0460 * Math.sin((2 * D - M) * RAD);
    longitude -= 0.0410 * Math.sin((M_prime - 2 * D) * RAD);
    longitude -= 0.0347 * Math.sin(D * RAD);
    longitude -= 0.0304 * Math.sin((M + M_prime) * RAD);

    return normalizeAngle(longitude);
}

/**
 * Main interface function to get Moon's position.
 */
export function getMoonPosition(dateString: string | Date, lat?: number, lon?: number): MoonPosition {
    const date = new Date(dateString);
    const jd = toJulianDay(date);

    // 1. Tropical Longitude
    const tropicalLon = getTropicalMoonLongitude(jd);

    // 2. Ayanamsha
    const ayanamsha = getLahiriAyanamsha(jd);

    // 3. Sidereal
    const siderealLon = normalizeAngle(tropicalLon - ayanamsha);

    return {
        rawLongitude: tropicalLon,
        siderealLongitude: siderealLon,
        ayanamsha
    };
}
