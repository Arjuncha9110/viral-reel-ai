import { getPlanetPositions, getAscendant } from './src/lib/astro/kundaliEngine.ts';
import { getLahiriAyanamsha } from './src/lib/astro/ephemeris.ts';

// Test Case: Jan 1, 2000, 12:00 IST (UTC+5.5)
// Hyderabad: 17.3850 N, 78.4867 E
const date = new Date('2000-01-01T06:30:00Z');
const lat = 17.3850;
const lon = 78.4867;

try {
    const planets = getPlanetPositions(date, lat, lon);
    const ascendant = getAscendant(date, lat, lon);
    const ayanamsa = getLahiriAyanamsha(date);

    const output = {
        test_case: "Jan 1, 2000, 12:00 IST, Hyderabad",
        ayanamsas: "Lahiri (Chitrapaksha)",
        ayanamsa_value: ayanamsa.toFixed(6),
        ascendant_sidereal: ascendant.toFixed(4),
        planets: planets.map(p => ({
            name: p.name,
            longitude_sidereal: p.longitude.toFixed(4),
            sign: p.sign,
            degree_in_sign: p.degree.toFixed(4),
            house: p.house,
            nakshatra: p.nakshatra,
            pada: p.pada,
            retrograde: p.retrograde,
            combust: p.combust,
            speed: p.speed.toFixed(6)
        }))
    };

    console.log("RESULT_START");
    console.log(JSON.stringify(output, null, 2));
    console.log("RESULT_END");
} catch (e) {
    console.error(e);
}
