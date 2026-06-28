import { getMoonPosition } from '../astronomy/moon';

export interface NakshatraInfo {
    name: string;
    lord: string;
    startDegree: number;
    endDegree: number;
}

export interface NakshatraResult {
    name: string;
    pada: number;
    lord: string;
    degreesTraversed: number; // Degrees within the Nakshatra (0-13.33)
    longitude: number; // Sidereal Longitude
    zodiacSign: string;
}

// Full 27 Nakshatra List
export const nakshatraList: NakshatraInfo[] = [
    { name: "Ashwini", lord: "Ketu", startDegree: 0, endDegree: 13.3333 },
    { name: "Bharani", lord: "Venus", startDegree: 13.3333, endDegree: 26.6666 },
    { name: "Krittika", lord: "Sun", startDegree: 26.6666, endDegree: 40 },
    { name: "Rohini", lord: "Moon", startDegree: 40, endDegree: 53.3333 },
    { name: "Mrigashira", lord: "Mars", startDegree: 53.3333, endDegree: 66.6666 },
    { name: "Ardra", lord: "Rahu", startDegree: 66.6666, endDegree: 80 },
    { name: "Punarvasu", lord: "Jupiter", startDegree: 80, endDegree: 93.3333 },
    { name: "Pushya", lord: "Saturn", startDegree: 93.3333, endDegree: 106.6666 },
    { name: "Ashlesha", lord: "Mercury", startDegree: 106.6666, endDegree: 120 },
    { name: "Magha", lord: "Ketu", startDegree: 120, endDegree: 133.3333 },
    { name: "Purva Phalguni", lord: "Venus", startDegree: 133.3333, endDegree: 146.6666 },
    { name: "Uttara Phalguni", lord: "Sun", startDegree: 146.6666, endDegree: 160 },
    { name: "Hasta", lord: "Moon", startDegree: 160, endDegree: 173.3333 },
    { name: "Chitra", lord: "Mars", startDegree: 173.3333, endDegree: 186.6666 },
    { name: "Swati", lord: "Rahu", startDegree: 186.6666, endDegree: 200 },
    { name: "Vishakha", lord: "Jupiter", startDegree: 200, endDegree: 213.3333 },
    { name: "Anuradha", lord: "Saturn", startDegree: 213.3333, endDegree: 226.6666 },
    { name: "Jyeshtha", lord: "Mercury", startDegree: 226.6666, endDegree: 240 },
    { name: "Moola", lord: "Ketu", startDegree: 240, endDegree: 253.3333 },
    { name: "Purva Ashadha", lord: "Venus", startDegree: 253.3333, endDegree: 266.6666 },
    { name: "Uttara Ashadha", lord: "Sun", startDegree: 266.6666, endDegree: 280 },
    { name: "Shravana", lord: "Moon", startDegree: 280, endDegree: 293.3333 },
    { name: "Dhanishtha", lord: "Mars", startDegree: 293.3333, endDegree: 306.6666 },
    { name: "Shatabhisha", lord: "Rahu", startDegree: 306.6666, endDegree: 320 },
    { name: "Purva Bhadrapada", lord: "Jupiter", startDegree: 320, endDegree: 333.3333 },
    { name: "Uttara Bhadrapada", lord: "Saturn", startDegree: 333.3333, endDegree: 346.6666 },
    { name: "Revati", lord: "Mercury", startDegree: 346.6666, endDegree: 360 }
];

const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

/**
 * Calculates the end time of the current Nakshatra.
 * Iterates forward to find when the Moon crosses the next Nakshatra boundary.
 * Precision: ~1 minute
 */
export const getNakshatraEndTime = (startDate: Date, currentLon: number): Date => {
    const NAKSHATRA_SPAN = 360 / 27; // 13.3333...

    // Identify target boundary (end of current nakshatra)
    // Floor to get current index, then +1
    const currentIdx = Math.floor(currentLon / NAKSHATRA_SPAN);
    let targetLon = (currentIdx + 1) * NAKSHATRA_SPAN;

    // Handle Revati (last one) wrapping to 0
    if (targetLon >= 360) targetLon = 0;

    // Search limits: Moon takes ~27 days for 360 deg, so ~1 day per Nakshatra.
    // We expect end time within next 24-30 hours usually.
    // Iterative step approach:

    let time = new Date(startDate.getTime());
    let stepMinutes = 60; // Start with 1 hour steps

    // Safety break
    let iterations = 0;
    while (iterations < 100) {
        iterations++;

        // Advance time
        const nextTime = new Date(time.getTime() + stepMinutes * 60000);
        const nextLon = getSiderealMoon(nextTime);

        // Check if we crossed the target
        // Distances:
        const distCurrent = (targetLon - currentLon + 360) % 360;
        const distNext = (targetLon - nextLon + 360) % 360;

        // We crossed if the distance to target "jumped" (meaning we went past it)
        // OR simply: currentLon < target and nextLon >= target (handling wrap)
        // Robust way: Pre-calculate minimal distance.
        // If we crossed, the 'gap' to target changes from small +ve to small -ve (or large +ve)
        // Better: diff = (nextLon - currentLon + 360) % 360. This is movement.
        // gap = (targetLon - currentLon + 360) % 360.
        // If movement > gap, we crossed.

        const movement = (nextLon - getNakshatra(getSiderealMoon(time)).longitude + 360) % 360; // approximate diff
        // Wait, better to use the simpler 'did index change?' logic, but that might fail on exact boundary.
        // Let's use the gap logic.

        const lonNow = getSiderealMoon(time);
        const gap = (targetLon - lonNow + 360) % 360;

        // Moon moves forward ~0.5 deg/hr.
        // Calculate new gap at nextTime
        const gapNext = (targetLon - nextLon + 360) % 360;

        // If gapNext > gap (and we didn't go full circle), we likely crossed and wrapped.
        // BUT Moon always moves forward.
        // A crossing means gapNext is approx 360 (just below 360) or we landed exactly on 0.
        // Standard crossing: gap decreases, then jumps to ~360.

        if (gapNext > gap && gap < 20) {
            // We crossed! (gap jumped from say 0.5 to 359.5)
            // Or if gapNext is very large (near 360)

            // If step is small enough, return.
            if (stepMinutes <= 1) {
                return nextTime;
            }

            // Otherwise, reduce step and dont advance 'time' (refine from current 'time')
            stepMinutes = Math.ceil(stepMinutes / 10);
            continue;
        }

        // Standard case: didn't cross, or gap is still shrinking
        time = nextTime;

        // If we are getting super close (gap < 0.05 degrees, ~10 mins), reduce step to ensure we catch it
        if (gap < 0.5 && stepMinutes > 10) stepMinutes = 5;
        if (gap < 0.1 && stepMinutes > 1) stepMinutes = 1;
    }

    return time; // Fallback
};

/**
 * Gets the Sidereal Longitude of the Moon using our internal engine.
 */
export const getSiderealMoon = (date: Date): number => {
    const pos = getMoonPosition(date);
    return pos.siderealLongitude;
};

/**
 * Determines Nakshatra from Sidereal Longitude.
 * @param longitude Sidereal Longitude (0-360)
 */
export const getNakshatra = (longitude: number): NakshatraResult => {
    const normalizedLon = longitude % 360;

    // Each Nakshatra is 13° 20' (13.3333 degrees)
    const segmentSize = 360 / 27;
    const index = Math.floor(normalizedLon / segmentSize);

    const nakshatra = nakshatraList[index];

    // Calculate Pada (Quarter)
    // Each Pada is 3° 20' (3.3333 degrees)
    const degreesInNakshatra = normalizedLon - (index * segmentSize);
    const pada = Math.floor(degreesInNakshatra / (segmentSize / 4)) + 1;

    // Calculate Sign
    const signIndex = Math.floor(normalizedLon / 30);

    return {
        name: nakshatra.name,
        lord: nakshatra.lord,
        pada,
        degreesTraversed: degreesInNakshatra,
        longitude: normalizedLon,
        zodiacSign: ZODIAC_SIGNS[signIndex]
    };
};
