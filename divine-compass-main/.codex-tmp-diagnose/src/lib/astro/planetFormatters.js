/**
 * Planet Formatting and Calculation Utilities
 * Horoscosmo-style planetary display helpers
 */
/**
 * Convert decimal degrees to DMS format
 * @param decimal - Decimal degrees (e.g., 12.3719)
 * @returns DMS object
 */
export const decimalToDMS = (decimal) => {
    const d = Math.floor(decimal);
    const minFloat = (decimal - d) * 60;
    const m = Math.floor(minFloat);
    const s = Math.round((minFloat - m) * 60);
    return { d, m, s };
};
/**
 * Format DMS for full display
 * @param dms - DMS object
 * @returns Formatted string (e.g., "12° 22′ 18″")
 */
export const formatDMS = (dms) => {
    return `${dms.d}° ${dms.m}′ ${dms.s}″`;
};
/**
 * Format DMS compact (for charts with limited space)
 * @param dms - DMS object
 * @returns Compact string (e.g., "12°22′")
 */
export const formatDMSCompact = (dms) => {
    return `${dms.d}°${dms.m}′`;
};
/**
 * Calculate angular distance between two longitudes
 * Handles wraparound at 360°
 * @param lon1 - First longitude (0-360)
 * @param lon2 - Second longitude (0-360)
 * @returns Distance in degrees (0-180)
 */
export const getAngularDistance = (lon1, lon2) => {
    let distance = Math.abs(lon1 - lon2);
    // Handle wraparound (e.g., 350° to 10° is 20°, not 340°)
    if (distance > 180) {
        distance = 360 - distance;
    }
    return distance;
};
/**
 * Combustion thresholds for planets (in degrees)
 * Based on classical Vedic astrology texts
 */
export const COMBUSTION_THRESHOLDS = {
    Mars: 17,
    Mercury: 12,
    Jupiter: 11,
    Venus: 10,
    Saturn: 15
};
/**
 * Detect if a planet is combust (too close to the Sun)
 * @param planetName - Name of the planet
 * @param planetLon - Planet's longitude (0-360)
 * @param sunLon - Sun's longitude (0-360)
 * @returns true if combust, false otherwise
 */
export const detectCombustion = (planetName, planetLon, sunLon) => {
    // Moon, Rahu, Ketu, and Sun itself don't get combust
    if (["Moon", "Rahu", "Ketu", "Sun"].includes(planetName)) {
        return false;
    }
    const threshold = COMBUSTION_THRESHOLDS[planetName];
    if (!threshold)
        return false;
    const distance = getAngularDistance(planetLon, sunLon);
    return distance <= threshold;
};
/**
 * Detect if a planet is retrograde
 * NOTE: This is a placeholder implementation
 * Actual retrograde detection requires calculating planetary velocities
 * by comparing positions at different times
 *
 * @param planetName - Name of the planet
 * @returns true if retrograde, false otherwise
 */
export const detectRetrograde = (planetName) => {
    // Rahu and Ketu are always retrograde (they move backwards)
    if (["Rahu", "Ketu"].includes(planetName)) {
        return true;
    }
    // Sun and Moon never go retrograde
    if (["Sun", "Moon"].includes(planetName)) {
        return false;
    }
    // TODO: Implement actual retrograde detection
    // This requires calculating the planet's velocity by comparing
    // its position at two different times (e.g., 1 day apart)
    // If velocity is negative, the planet is retrograde
    // For now, return false (will be updated with actual calculation)
    return false;
};
/**
 * Format planet display with retrograde and combust indicators
 * @param planetName - Full planet name
 * @param dms - DMS position
 * @param retrograde - Is retrograde
 * @param combust - Is combust
 * @param compact - Use compact format
 * @returns Formatted display string
 */
export const formatPlanetDisplay = (planetName, dms, retrograde, combust, compact = false) => {
    const abbrev = planetName.substring(0, 2);
    const dmsStr = compact ? formatDMSCompact(dms) : formatDMS(dms);
    let indicators = "";
    if (retrograde)
        indicators += "ᴿ";
    if (combust)
        indicators += "ᶜ";
    return `${abbrev}${indicators} ${dmsStr}`;
};
/**
 * Get planet abbreviation (2 letters)
 * @param planetName - Full planet name
 * @returns Two-letter abbreviation
 */
export const getPlanetAbbrev = (planetName) => {
    const abbrevMap = {
        "Sun": "Su",
        "Moon": "Mo",
        "Mars": "Ma",
        "Mercury": "Me",
        "Jupiter": "Ju",
        "Venus": "Ve",
        "Saturn": "Sa",
        "Rahu": "Ra",
        "Ketu": "Ke"
    };
    return abbrevMap[planetName] || planetName.substring(0, 2);
};
